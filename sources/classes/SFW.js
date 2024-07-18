/**
 * @typedef {import('../typings').SfwCategories} SfwCategories
 * @typedef {import('../typings').GifMap} GifMap
 */

const APIClient = require('../rest/APIClient');
const NekoGif = require('./package/NekoGif');
const { getToken } = require('./user/BaseUser');

// url base de la api para SFW
const base = 'http://localhost:449/api/sfw'

/**
 * Clase SFW
 * No se necesita instanciar para acceder a sus metodos
 */
class SFW {
    /**
     * Funcion principal para obtener gifs de cierta categoria
     * @template {SfwCategories} T
     * @param {T} cat corresponde a la subcategoria de SFW 
     * @param {GifMap[T]} gif corresponde al gif que quieras obtener por categoria
     * @returns {Promise<NekoGif>}
     */
    static async getGif(cat, gif) {
        if (!cat) throw new NekoError('el parametro <cat> es requerido');
        if (!gif) throw new NekoError('el parametro <gif> es requerido');

        let solicitud = new APIClient(base, { token: getToken() }), response = null;
        switch (cat) {
            case 'action':
                response = solicitud.get('/action?gif=' + gif)
                break;
        }
        return new NekoGif(await response);
    }
}

module.exports = SFW