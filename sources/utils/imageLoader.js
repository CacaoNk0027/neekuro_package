'use strict';

const dns = require('node:dns').promises;
const net = require('node:net');
const Canvas = require('canvas');
const NekoError = require('../classes/errors/Error.js');
const { version } = require('../../package.json');

const USER_AGENT = `neekuro/${version} image-loader`;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

async function loadImageSource(source, label = 'imagen') {
    if (Buffer.isBuffer(source)) {
        validateImageBuffer(source, label);
        return Canvas.loadImage(source);
    }
    return Canvas.loadImage(await downloadImage(source, label));
}

async function downloadImage(source, label = 'imagen') {
    let currentURL = parseRemoteURL(source, label);

    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
        await assertPublicHostname(currentURL.hostname, label);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
        // El timeout cubre tanto las cabeceras como la lectura completa del cuerpo.
        try {
            const response = await fetch(currentURL, {
                redirect: 'manual',
                signal: controller.signal,
                headers: { 'User-Agent': USER_AGENT }
            });

            if (response.status >= 300 && response.status < 400) {
                await discardBody(response);
                const location = response.headers.get('location');
                if (!location || redirects === MAX_REDIRECTS) {
                    throw new NekoError('ImageDownloadError', `Demasiadas redirecciones al descargar ${label}`);
                }
                currentURL = parseRemoteURL(new URL(location, currentURL).href, label);
                continue;
            }
            if (!response.ok) {
                await discardBody(response);
                throw new NekoError('ImageDownloadError', `No se pudo descargar ${label}: HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type')?.split(';', 1)[0].toLowerCase();
            if (!contentType || !IMAGE_CONTENT_TYPES.has(contentType)) {
                await discardBody(response);
                throw new NekoError('ImageFormatError', `${label} no tiene un formato de imagen compatible`);
            }
            const declaredLength = Number(response.headers.get('content-length'));
            if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
                await discardBody(response);
                throw new NekoError('ImageSizeError', `${label} supera el límite de 10 MB`);
            }
            return await readLimitedBody(response, label);
        } catch (error) {
            if (error instanceof NekoError) throw error;
            const message = controller.signal.aborted
                ? `La descarga de ${label} excedió ${IMAGE_TIMEOUT_MS} ms`
                : `No se pudo descargar ${label}: ${error?.message ?? 'error desconocido'}`;
            throw new NekoError('ImageDownloadError', message);
        } finally {
            clearTimeout(timeoutId);
        }
    }
    throw new NekoError('ImageDownloadError', `No se pudo descargar ${label}`);
}

function parseRemoteURL(source, label) {
    if (typeof source !== 'string') {
        throw new NekoError('ImageURLerror', `${label} debe ser una URL HTTPS o un Buffer`);
    }
    let url;
    try {
        url = new URL(source);
    } catch {
        throw new NekoError('ImageURLerror', `La URL de ${label} no es válida`);
    }
    if (url.protocol !== 'https:' || url.username || url.password) {
        throw new NekoError('ImageURLerror', `La URL de ${label} debe utilizar HTTPS y no incluir credenciales`);
    }
    return url;
}

async function assertPublicHostname(hostname, label) {
    const normalized = hostname.toLowerCase().replace(/\.$/, '');
    if (normalized === 'localhost' || normalized.endsWith('.localhost') || normalized.endsWith('.local')) {
        throw new NekoError('ImageURLerror', `La URL de ${label} apunta a una red local`);
    }
    const addresses = net.isIP(normalized)
        ? [{ address: normalized }]
        : await dns.lookup(normalized, { all: true, verbatim: true }).catch(() => []);
    if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
        throw new NekoError('ImageURLerror', `La URL de ${label} no apunta a una dirección pública`);
    }
}

function isPrivateAddress(address) {
    if (net.isIPv4(address)) {
        const [a, b] = address.split('.').map(Number);
        return a === 0 || a === 10 || a === 127 ||
            (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
            (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
            (a === 198 && (b === 18 || b === 19)) || a >= 224;
    }
    if (net.isIPv6(address)) {
        const value = address.toLowerCase();
        return value === '::' || value === '::1' || value.startsWith('fc') || value.startsWith('fd') ||
            /^fe[89ab]/.test(value) || value.startsWith('ff') || value.startsWith('2001:db8:') ||
            (value.startsWith('::ffff:') && isPrivateAddress(value.slice(7)));
    }
    return true;
}

/** Libera la conexión cuando la respuesta no se va a leer. */
async function discardBody(response) {
    await response.body?.cancel().catch(() => undefined);
}

async function readLimitedBody(response, label) {
    if (!response.body) throw new NekoError('ImageDownloadError', `${label} no contiene datos`);
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
        const buffer = Buffer.from(chunk);
        size += buffer.length;
        if (size > MAX_IMAGE_BYTES) {
            await response.body.cancel().catch(() => undefined);
            throw new NekoError('ImageSizeError', `${label} supera el límite de 10 MB`);
        }
        chunks.push(buffer);
    }
    const result = Buffer.concat(chunks);
    validateImageBuffer(result, label);
    return result;
}

function validateImageBuffer(buffer, label = 'imagen') {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
        throw new NekoError('ImageFormatError', `${label} no contiene una imagen válida`);
    }
    if (buffer.length > MAX_IMAGE_BYTES) {
        throw new NekoError('ImageSizeError', `${label} supera el límite de 10 MB`);
    }
    const header = buffer.subarray(0, 12).toString('hex');
    const valid = header.startsWith('ffd8ff') || header.startsWith('89504e470d0a1a0a') ||
        header.startsWith('47494638') || (header.slice(0, 8) === '52494646' && header.slice(16, 24) === '57454250');
    if (!valid) throw new NekoError('ImageFormatError', `${label} debe ser JPEG, PNG, GIF o WebP`);
}

module.exports = { IMAGE_TIMEOUT_MS, MAX_IMAGE_BYTES, isPrivateAddress, loadImageSource, parseRemoteURL, validateImageBuffer };
