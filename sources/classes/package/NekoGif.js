'use strict';

/**
 * @typedef {import("../../typings").GifResponse} GifResponse
 */

/**
 * Clase NekoGif
 * crea un objeto Gif a partir de la respuesta del servidor
 */
class NekoGif {
    
    /**
     * Recibe la respuesta de la api
     * @param {GifResponse} response respuesta de la api 
     */
    constructor(response) {
        if (!response || typeof response !== 'object' || !response.data) {
            throw new TypeError('La respuesta no contiene datos de imagen');
        }
        
        /**
         * URL del gif
         * @type {string|null}
         */
        this.url = typeof response.data.url === 'string' ? response.data.url : null
        
        /**
         * Anime del gif
         * @type {string|null}
         */
        this.anime = typeof response.data.anime === 'string' ? response.data.anime : null
    }

    /**
     * Obten la url del Gif
     * @returns {string|null} URL
     */
    getUrl() {
        return this.url; 
    }

    /**
     * Obten el anime del Gif
     * @returns {string|null} Anime
     */
    getAnime() {
        return this.anime; 
    }

}

module.exports = NekoGif
