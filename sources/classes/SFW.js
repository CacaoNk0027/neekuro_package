'use strict';

/**
 * @typedef {import('../typings').SfwCategories} SfwCategories
 * @typedef {import('../typings').GifMap} GifMap
 * @typedef {import('../typings').GifData} GifData
 * @typedef {import('../typings').GifListResponse} GifListResponse
 */

const APIClient = require('../rest/APIClient.js');
const NekoError = require('./errors/Error.js');
const NekoGif = require('./package/NekoGif.js');
const { getToken, getTokenVersion } = require('./user/BaseUser.js');

const DEFAULT_BASE_URL = 'https://www.nexatdc.work.gd/api/sfw';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

let baseURL = DEFAULT_BASE_URL;
let cacheTTL = DEFAULT_CACHE_TTL;
let globalCacheVersion = 0;

/** @type {Map<string, {items: GifData[], expiresAt: number, tokenVersion: number}>} */
const gifCache = new Map();
/** @type {Map<string, {promise: Promise<GifData[]>, tokenVersion: number}>} */
const gifRequests = new Map();
/** @type {Map<string, number>} */
const cacheVersions = new Map();
/** @type {Map<string, number>} */
const lastSelections = new Map();

/** Cliente para obtener imágenes SFW. */
class SFW {
    /**
     * Obtiene un GIF aleatorio. La lista puede provenir de caché, pero la
     * selección se realiza nuevamente en cada llamada.
     * @template {SfwCategories} T
     * @param {T} category categoría principal
     * @param {GifMap[T]} gif subcategoría solicitada
     * @returns {Promise<NekoGif>}
     */
    static async getGif(category, gif) {
        const key = getCacheKey(category, gif);
        const items = await getGifData(category, gif, key);
        const previousIndex = lastSelections.get(key);
        const index = getRandomIndex(items.length, previousIndex);

        lastSelections.set(key, index);
        return createNekoGif(items[index]);
    }

    /**
     * Obtiene todos los GIF disponibles para una subcategoría.
     * Se devuelven instancias nuevas para impedir que el consumidor modifique
     * accidentalmente los datos conservados en caché.
     * @template {SfwCategories} T
     * @param {T} category categoría principal
     * @param {GifMap[T]} gif subcategoría solicitada
     * @returns {Promise<NekoGif[]>}
     */
    static async getGifs(category, gif) {
        const key = getCacheKey(category, gif);
        const items = await getGifData(category, gif, key);
        return items.map(createNekoGif);
    }

    /**
     * Limpia toda la caché, una categoría principal o una subcategoría.
     * @template {SfwCategories} T
     * @param {T} [category]
     * @param {GifMap[T]} [gif]
     */
    static clearCache(category, gif) {
        if (category === undefined) {
            globalCacheVersion += 1;
            gifCache.clear();
            gifRequests.clear();
            cacheVersions.clear();
            lastSelections.clear();
            return;
        }

        validateCategory(category);
        if (gif === undefined) {
            const prefix = `${category}:`;
            for (const key of collectKnownKeys(prefix)) clearCacheKey(key);
            return;
        }

        clearCacheKey(getCacheKey(category, gif));
    }

    /**
     * Cambia la URL base utilizada por SFW y vacía la caché anterior.
     * @param {string} url
     */
    static setBaseURL(url) {
        baseURL = validateBaseURL(url);
        this.clearCache();
    }

    /**
     * Configura la duración de la caché. Un valor de cero la desactiva.
     * @param {number} milliseconds
     */
    static setCacheTTL(milliseconds) {
        if (!Number.isFinite(milliseconds) || milliseconds < 0) {
            throw new NekoError('InvalidCacheTTL', 'El tiempo de caché debe ser un número mayor o igual a cero');
        }
        cacheTTL = Math.floor(milliseconds);
        this.clearCache();
    }
}

/**
 * @template {SfwCategories} T
 * @param {T} category
 * @param {GifMap[T]} gif
 * @param {string} key
 * @returns {Promise<GifData[]>}
 */
async function getGifData(category, gif, key) {
    const token = getToken();
    if (!token) throw new NekoError('NoToken', 'Debes establecer un token antes de solicitar un GIF');
    const currentTokenVersion = getTokenVersion();

    const cached = gifCache.get(key);
    if (
        cached
        && cached.tokenVersion === currentTokenVersion
        && cached.expiresAt > Date.now()
    ) return cached.items;
    if (cached) gifCache.delete(key);

    const pending = gifRequests.get(key);
    if (pending?.tokenVersion === currentTokenVersion) return pending.promise;

    const requestGlobalVersion = globalCacheVersion;
    const requestKeyVersion = cacheVersions.get(key) ?? 0;
    const request = requestGifList(category, gif, token)
        .then(items => {
            if (
                cacheTTL > 0
                && requestGlobalVersion === globalCacheVersion
                && requestKeyVersion === (cacheVersions.get(key) ?? 0)
                && currentTokenVersion === getTokenVersion()
            ) {
                storeCacheEntry(key, items, currentTokenVersion);
            }
            return items;
        })
        .finally(() => {
            if (gifRequests.get(key)?.promise === request) gifRequests.delete(key);
        });

    gifRequests.set(key, { promise: request, tokenVersion: currentTokenVersion });
    return request;
}

/**
 * @template {SfwCategories} T
 * @param {T} category
 * @param {GifMap[T]} gif
 * @param {string} token
 * @returns {Promise<GifData[]>}
 */
async function requestGifList(category, gif, token) {
    const client = new APIClient(baseURL, { token });
    const endpoint = `/${category}/${encodeURIComponent(String(gif))}`;
    /** @type {GifListResponse} */
    const response = await client.get(endpoint);

    if (!Array.isArray(response?.data) || response.data.length === 0) {
        throw new NekoError('EmptyResponse', `La API no devolvió GIF para ${category}/${gif}`);
    }

    return response.data.map((item, index) => normalizeGif(item, category, gif, index));
}

/**
 * @param {unknown} item
 * @param {string} category
 * @param {string} gif
 * @param {number} index
 * @returns {GifData}
 */
function normalizeGif(item, category, gif, index) {
    if (!item || typeof item !== 'object' || typeof item.url !== 'string' || !item.url.trim()) {
        throw new NekoError('InvalidResponse', `El GIF ${index} de ${category}/${gif} no contiene una URL válida`);
    }

    return Object.freeze({
        url: item.url.trim(),
        anime: typeof item.anime === 'string' && item.anime.trim()
            ? item.anime.trim()
            : 'Desconocido'
    });
}

/** @param {GifData} item @returns {NekoGif} */
function createNekoGif(item) {
    return new NekoGif({ code: 200, data: { ...item } });
}

/**
 * Elige uniformemente entre todas las posiciones, excepto la selección
 * anterior cuando existen al menos dos alternativas.
 * @param {number} length
 * @param {number|undefined} previousIndex
 */
function getRandomIndex(length, previousIndex) {
    if (length === 1) return 0;
    if (previousIndex === undefined || previousIndex < 0 || previousIndex >= length) {
        return Math.floor(Math.random() * length);
    }

    const index = Math.floor(Math.random() * (length - 1));
    return index >= previousIndex ? index + 1 : index;
}

/**
 * @template {SfwCategories} T
 * @param {T} category
 * @param {GifMap[T]} gif
 */
function getCacheKey(category, gif) {
    validateCategory(category);
    if (typeof gif !== 'string' || !gif.trim()) {
        throw new NekoError('NoInput', 'el parámetro <gif> es requerido');
    }
    return `${category}:${gif}`;
}

/** @param {unknown} category */
function validateCategory(category) {
    if (category === undefined || category === null || category === '') {
        throw new NekoError('NoInput', 'el parámetro <category> es requerido');
    }
    if (category !== 'action' && category !== 'reaction') {
        throw new NekoError('InvalidInput', 'la categoría que ingresas es inválida');
    }
}

/** @param {string} url */
function validateBaseURL(url) {
    if (typeof url !== 'string' || !url.trim()) {
        throw new NekoError('InvalidBaseURL', 'La URL base debe ser una cadena HTTPS válida');
    }

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        throw new NekoError('InvalidBaseURL', 'La URL base debe ser una cadena HTTPS válida');
    }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
        throw new NekoError('InvalidBaseURL', 'La URL base debe utilizar HTTPS y no incluir credenciales');
    }
    return url.trim().replace(/\/$/, '');
}

/** @param {string} key @param {GifData[]} items @param {number} tokenVersion */
function storeCacheEntry(key, items, tokenVersion) {
    if (!gifCache.has(key) && gifCache.size >= MAX_CACHE_ENTRIES) {
        const oldest = gifCache.keys().next().value;
        if (oldest) {
            gifCache.delete(oldest);
            lastSelections.delete(oldest);
        }
    }
    gifCache.set(key, { items, expiresAt: Date.now() + cacheTTL, tokenVersion });
}

/** @param {string} key */
function clearCacheKey(key) {
    gifCache.delete(key);
    gifRequests.delete(key);
    lastSelections.delete(key);
    cacheVersions.set(key, (cacheVersions.get(key) ?? 0) + 1);
}

/** @param {string} prefix */
function collectKnownKeys(prefix) {
    return new Set([
        ...[...gifCache.keys()].filter(key => key.startsWith(prefix)),
        ...[...gifRequests.keys()].filter(key => key.startsWith(prefix)),
        ...[...lastSelections.keys()].filter(key => key.startsWith(prefix)),
        ...[...cacheVersions.keys()].filter(key => key.startsWith(prefix))
    ]);
}

module.exports = SFW;
