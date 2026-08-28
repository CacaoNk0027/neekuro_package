'use strict'

/**
 * @typedef {import('../typings').APIClientData} APIClientData
 * @typedef {import('../typings').GifResponse} GifResponse
 */

const APIError = require('../classes/errors/APIError.js');
const NekoError = require('../classes/errors/Error.js');

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Clase APIClient
 * Se encarga de la comunicacion y control de solicitudes a la api
 */
class APIClient {
    /**
     * Instanciamiento de la clase
     * @param {string} baseURL link principal de la api
     * @param {APIClientData} data objeto para las solicitudes
     */
    constructor(baseURL, data) {
        if (typeof baseURL !== 'string' || !baseURL) {
            throw new NekoError('InvalidBaseURL', 'El parámetro <baseURL> debe ser una URL válida');
        }

        let parsedBaseURL;
        try {
            parsedBaseURL = new URL(baseURL);
        } catch {
            throw new NekoError('InvalidBaseURL', 'El parámetro <baseURL> debe ser una URL válida');
        }
        if (parsedBaseURL.protocol !== 'https:') {
            throw new NekoError('InvalidBaseURL', 'La API debe utilizar HTTPS');
        }
        if (!data || typeof data.token !== 'string' || !data.token.trim()) {
            throw new NekoError('NoToken', 'Se requiere un token para utilizar la API');
        }
        /**
         * url principal
         * @type {string}
         */
        this.baseURL = baseURL.replace(/\/$/, '')
        /**
         * data
         * @type {APIClientData}
         */
        this.data = data
    }
    /**
     * Obtiene el objeto compartido por la api a traves de la ruta y con autorizacion por token
     * @param {string} endpoint establece la ruta a la que se quiere comunicar
     * @returns {Promise<GifResponse>}
     * @throws {APIError} solo si sucede un error entre solicitudes
     */
    async get(endpoint, options = {}) {
        if (typeof endpoint !== 'string' || !endpoint.startsWith('/')) {
            throw new NekoError('InvalidEndpoint', 'El endpoint debe comenzar con "/"');
        }

        const timeout = Number.isFinite(options.timeout) && options.timeout > 0
            ? options.timeout
            : DEFAULT_TIMEOUT_MS;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `${this.data.token}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            const data = await readJson(response);
            if (!response.ok) {
                throw new APIError(endpoint, response, data);
            }

            return data
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            const message = error?.name === 'AbortError'
                ? `La solicitud excedió el tiempo límite de ${timeout} ms`
                : error?.message ?? 'No fue posible conectar con la API';
            throw APIError.fromNetworkError(endpoint, `${this.baseURL}${endpoint}`, message);
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

async function readJson(response) {
    try {
        return await response.json();
    } catch {
        return { code: response.status, message: 'La API devolvió una respuesta que no es JSON' };
    }
}

module.exports = APIClient;
