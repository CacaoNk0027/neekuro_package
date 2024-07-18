'use strict';

let tokenGlobal = null;

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
        tokenGlobal = token;
    }

    /**
     * Obten el token del usuario si este ya se estableció
     * @returns {string} Token de usuario
     */
    static getToken() {
        return tokenGlobal;
    }
}

module.exports = BaseUser;
