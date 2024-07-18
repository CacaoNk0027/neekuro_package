'use strict';

/**
 * Clase de erorres para la API
 * @extends Error
 */
class NekoError extends Error {
    /**
     * Crea una instancia para errores del paquete
     * @param {string} name Corresponde al nombre del error
     * @param {string} message Mensaje de error
     */
    constructor(name, message) {
        super(message);
        
        this.name = `NekoApi Error [${name}]`
        
        /**
         * @type {string}
         */
        this.message = message
    }
}

module.exports = NekoError