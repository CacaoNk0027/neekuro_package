'use strict'

/**
 * @typedef {import('../typings').APIClientData} APIClientData
 * @typedef {import('../typings').GifResponse} GifResponse
 */

const APIError = require('../classes/errors/apierror');

const fetch = import('node-fetch');

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
        /**
         * url principal
         * @type {string}
         */
        this.baseURL = baseURL
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
    async get(endpoint) {
        try {
            const response = await (await fetch).default(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `${this.data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new APIError(endpoint, response, await response.json());
            }

            return response.json()
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            } else {
                throw new APIError(endpoint, { message: error.message }, {});
            }
        }
    }
}

module.exports = APIClient;