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
        this.token_ = token
        setToken(this.#getToken());
    }

    /**
     * Establece el token para usar la api
     * @param {string} token token de la api
     * @throws {NekoError} si el token no fue dado o no es una cadena
     */
    token(token) {
        if(!token) throw new NekoError('NoToken', 'el parametro <token> es requerido');
        if(typeof(token) !== 'string') throw new NekoError('InvalidType', `Token invaldo... el tipo de dato es String no ${typeof(token)}`);
        this.token_ = token;
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