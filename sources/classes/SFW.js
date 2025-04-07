/**
 * @typedef {import('../typings').SfwCategories} SfwCategories
 * @typedef {import('../typings').GifMap} GifMap
 */

const APIClient = require('../rest/APIClient.js');
const NekoError = require('./errors/Error.js');
const NekoGif = require('./package/NekoGif.js');
const { getToken } = require('./user/BaseUser.js');

// url base de la api para SFW
const base = 'https://www.nexatdc.work.gd/api/sfw/'

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
        if (!cat) throw new NekoError('NoInput', 'el parametro <cat> es requerido');
        if (!gif) throw new NekoError('NoInput', 'el parametro <gif> es requerido');

        let solicitud = new APIClient(base, { token: getToken() }), response = null;
        switch (cat) {
            case 'action':
                response = solicitud.get('/action/' + gif + '?random=true')
                break;
            case 'reaction':
                response = solicitud.get('/reaction/' + gif + '?random=true')
                break;
            default:
                throw new NekoError('InvalidInput', 'la categoria que ingresas es invalida')
        }
        return new NekoGif(await response);
    }
}

module.exports = SFW