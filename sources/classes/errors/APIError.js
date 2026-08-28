'use strict';

/**
 * @typedef {import('../../typings').ApiResponse} ApiResponse
 * @typedef {{url?: string, status?: number}} ResponseLike
 */

/**
 * Clase APIError
 * Errores personalizados respecto a la api rest
 * @extends Error
 */
class APIError extends Error {
    /**
     * Crea la instancia del error
     * @param {string} endpoint la ruta a la que se realizo la peticion
     * @param {ResponseLike} response respuesta HTTP o representación de un error de red
     * @param {ApiResponse} data respuesta de la api
     */
    constructor(endpoint, response, data) {
        super(APIError.determineMessage(data));
        
        this.name = `NekoREST Error [${endpoint}]`
        /**
         * @type {string}
         */
        this.url = response?.url ?? 'unknown';

        /**
         * @type {number}
         */
        this.statusCode = Number.parseInt(response?.status ?? 500, 10);

        /**
         * @type {ApiResponse}
         */
        this.data = data

    }

    /**
     * Determina el mensaje del error basado en el codigo de la api
     * @param {ApiResponse} response respuesta de la api
     * @returns {string} mensaje de error
     */
    static determineMessage(response = {}) {
        if(response.code === 403) {
            return 'TOKEN ERROR: el token que haz proporcionado es invalido'
        } else 
        if(response.code === 401) {
            return 'TOKEN ERROR: no se proporciono un token'
        } else {
            return response.message ?? 'descripcion no dada'
        }
    }

    static fromNetworkError(endpoint, url, message) {
        return new APIError(endpoint, { url, status: 503 }, { code: 503, message });
    }
}

module.exports = APIError
