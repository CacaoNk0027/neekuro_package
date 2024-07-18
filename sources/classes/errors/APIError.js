'use strict';

/**
 * @typedef {import('../../typings').ApiResponse} ApiResponse
 * @typedef {import('node-fetch').Response} Response
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
     * @param {Response} response respuesta de node-fetch
     * @param {ApiResponse} data respuesta de la api
     */
    constructor(endpoint, response, data) {
        super();
        
        this.name = `NekoREST Error [${endpoint}]`
        this.message = this.#determineMessage(data);

        /**
         * @type {string}
         */
        this.url = response?.url ?? 'unknown';

        /**
         * @type {number}
         */
        this.statusCode = parseInt(response?.status ?? 500);

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
    #determineMessage(response) {
        if(response.code === 403) {
            return 'TOKEN ERROR: el token que haz proporcionado es invalido'
        } else 
        if(response.code === 401) {
            return 'TOKEN ERROR: no se proporciono un token'
        } else {
            return response.message ?? 'descripcion no dada'
        }
    }
}

module.exports = APIError