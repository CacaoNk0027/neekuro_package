'use strict';

let tokenGlobal = null;
let tokenVersion = 0;

/**
 * Clase BaseUser
 * Solamente gestiona el token por todo el paquete.
 */
class BaseUser {
    /**
     * Establece el token "global" en todo el paquete.
     * @param {string} token token a establecer.
     */
    static setToken(token) {
        if (typeof token !== 'string' || !token.trim()) {
            throw new TypeError('El token debe ser una cadena no vacía');
        }
        const normalizedToken = token.trim();
        if (tokenGlobal !== normalizedToken) tokenVersion += 1;
        tokenGlobal = normalizedToken;
    }

    /**
     * Obten el token del usuario si este ya se estableció
     * @returns {string} Token de usuario
     */
    static getToken() {
        return tokenGlobal;
    }

    /**
     * Identificador interno que cambia cada vez que se establece otro token.
     * @returns {number}
     */
    static getTokenVersion() {
        return tokenVersion;
    }
}

module.exports = BaseUser;
