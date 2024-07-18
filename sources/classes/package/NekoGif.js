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
        
        /**
         * URL del gif
         * @type {string|null}
         */
        this.url = response.data.url || null
        
        /**
         * Anime del gif
         * @type {string|null}
         */
        this.anime = response.data.anime || null
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