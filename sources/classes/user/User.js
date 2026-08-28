'use strict';

const { setToken } = require("./BaseUser.js");
const NekoError = require('../errors/Error.js')

/**
 * Clase Usuario
 * Instancia al usuario que hara uso de la api
 */
class User {
    /**
     * Puedes establecer el token aqui, sin embargo, recomiendo hacerlo en el metodo dedicado
     * @param {string} token Token de la api 
     */
    constructor(token) {
        this.token_ = undefined;
        if (token !== undefined) this.token(token);
    }

    /**
     * Establece el token para usar la api
     * @param {string} token token de la api
     * @throws {NekoError} si el token no fue dado o no es una cadena
     */
    token(token) {
        if(typeof(token) !== 'string') throw new NekoError('InvalidType', `El token debe ser string, no ${typeof(token)}`);
        if(!token.trim()) throw new NekoError('NoToken', 'el parametro <token> es requerido');
        this.token_ = token.trim();
        setToken(this.#getToken());
    }

    /**
     * Obtiene el token
     * @returns {string|undefined} token de la api
     */
    #getToken() {
        return this.token_;
    }
}

module.exports = User
