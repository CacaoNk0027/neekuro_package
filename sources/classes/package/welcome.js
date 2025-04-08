'use strict';
const Canvas = require('canvas');
const NekoError = require('../errors/Error.js');
const hex_reg = require('hex-color-regex')({ strict: true })
const path = require('path');

/**
 * @typedef {import('../../typings/index.js').FontNames} FontNames
 * @typedef {import('../../typings/index.js').WelcomeTextData} WelcomeTextData 
 * @typedef {import('../../typings/index.js').WelcomeAvatarData} WelcomeAvatarData
 */

/**
 * Clase para generar imágenes de bienvenida personalizadas para Discord
 * @class Welcome
 * @example
 * const Welcome = require('neekuro').Welcome;
 * const welcome = new Welcome()
 *   .setResolution(1200, 600)
 *   .setFont('arial')
 *   .setTitle('¡Bienvenido!', { text_color: '#FF5733' })
 *   .setDescription('Al servidor de la comunidad', { font_size: 24 });
 */
class Welcome {

    /**
     * Construye una imagen
     */
    constructor() {
        /**
         * @property {Object} data - Configuración actual de la imagen
         * @property {string} data.font - Fuente actualmente seleccionada
         * @property {number} data.width - Ancho actual de la imagen
         * @property {number} data.height - Alto actual de la imagen
         * @property {Object} data.background - Configuración del fondo
         * @property {'color'|'image'} data.background.type - Tipo de fondo
         * @property {string} data.background.value - Color o ruta de imagen
         * @property {Object} data.avatar - Configuración del avatar
         * @property {?string} data.avatar.source - Ruta a la imagen del avatar
         * @property {number} data.avatar.x - Posición X del avatar
         * @property {number} data.avatar.y - Posición Y del avatar
         * @property {number} data.avatar.radio - Radio para avatar circular
         * @property {string} data.avatar.border - Color del borde del avatar
         * @property {Object} data.title - Configuración del título
         * @property {?string} data.title.content - Contenido del título
         * @property {number} data.title.x - Posición X del título
         * @property {number} data.title.y - Posición Y del título
         * @property {number} data.title.font_size - Tamaño de fuente del título
         * @property {string} data.title.text_color - Color del texto del título
         * @property {Object} data.description - Configuración de la descripción
         * @property {?string} data.description.content - Contenido de la descripción
         * @property {number} data.description.x - Posición X de la descripción
         * @property {number} data.description.y - Posición Y de la descripción
         * @property {number} data.description.font_size - Tamaño de fuente de la descripción
         * @property {string} data.description.text_color - Color del texto de la descripción
         */
        this.data = {
            font: 'arial',
            width: 1140,
            height: 520,
            background: {
                type: 'color',
                value: '#23272A'
            },
            avatar: {
                source: null,
                x: 448,
                y: 80,
                radio: 120,
                border: "#F7F7F7"
            },
            title: {
                content: "¡Bienvenido!",
                x: 565,
                y: 400,
                font_size: 55,
                text_color: '#FFFFFF'
            },
            description: {
                content: 'Al mejor servidor de discord',
                x: 590,
                y: 450,
                font_size: 35,
                text_color: "#F7F7F7"
            }
        }
    }

    /**
     * Establece la resolución de la imagen de bienvenida
     * @param {number|'default'} width - Ancho en píxeles o 'default' para 1024px
     * @param {number|'default'} height - Alto en píxeles o 'default' para 450px
     * @returns {Welcome} 
     * @throws {NekoError} Si los parámetros son inválidos
     * @example
     * // Establecer resolución personalizada
     * welcome.setResolution(1920, 1080);
     * 
     * // Restablecer a valores por defecto
     * welcome.setResolution('default', 'default');
     */
    setResolution(width, height) {
        if (!width) throw new NekoError('ResolutionError', 'el parametro <width> no puede quedar vacio');
        if (!height) throw new NekoError('ResolutionError', 'el parametro <height> no puede quedar vacio');

        if (width == 'default') width = this.data.width; else {
            if (typeof width != 'number') throw new NekoError('TypeError', 'el parametro <width> solo acepta tipo \'number\', recibió ' + typeof width);
            this.data.width = width;
        }

        if (height == 'default') height = this.data.height; else {
            if (typeof height != 'number') throw new NekoError('TypeError', 'el parametro <height> solo acepta tipo \'number\', recibió ' + typeof height);
            this.data.height = height;
        }

        return this
    }

    /**
     * Configura la tipografía para el texto de la imagen
     * @param {FontNames} name - Nombre de la fuente predefinida o 'custom' para personalizada
     * @param {string} [dir] - Ruta al archivo .ttf (requerido si name='custom')
     * @returns {Welcome}
     * @throws {NekoError} Si la fuente no existe o los parámetros son inválidos
     * @example
     * // Usar fuente predefinida
     * welcome.setFont('calibri');
     * 
     * // Usar fuente personalizada
     * welcome.setFont('custom', './fonts/mi_fuente.ttf');
     */
    setFont(name, dir) {
        let ruta = null;

        if (!name) throw new NekoError('FontError', 'el parametro <name> no puede quedar vacio');
        if (typeof name != 'string') throw new NekoError('TypeError', 'el parametro <name> solo acepta tipo \'string\', recibió ' + typeof name);

        switch (name) {
            case 'arial':
                ruta = path.join(__dirname, '../../assets/arial.ttf');
                break;
            case 'calibri':
                ruta = path.join(__dirname, '../../assets/calibri.ttf');
                break;
            case 'custom':
                if (!dir) throw new NekoError('FontError', 'el parametro <dir> no puede quedar vacio en un tipo de fuente customizada');
                if (typeof dir != 'string') throw new NekoError('TypeError', 'el parametro <dir> solo acepta tipo \'string\', recibió ' + typeof dir);
                if (!dir.endsWith('ttf')) throw new NekoError('FontError', 'se nesecita un archivo ttf en el parametro <dir>')
                ruta = path.join(__dirname, '../../../../' + dir.replace('./', ''));
                break;
            default: throw new NekoError('FontError', 'el parametro <name> no acepta ningun tipo diferente a los preterminados');
        }
        try {
            Canvas.registerFont(ruta, { family: name })
        } catch (error) {
            throw new NekoError('DirError', 'no se puede encontrar el directorio especificado')
        }

        this.data.font = name
        return this;
    }

    /**
     * Agrega un título a la imagen de bienvenida
     * @param {string} text - Texto del título
     * @param {WelcomeTextData} data - Configuración del título
     * @throws {NekoError} Arroja un error si parámetros son inválidos
     * @returns {Welcome}
     */
    setTitle(text, data) {
        // Validaciones del texto
        if (!text) {
            throw new NekoError('TitleError', 'El parámetro <text> no puede estar vacío');
        }
        if (typeof text !== 'string') {
            throw new NekoError('TypeError', `El parámetro <text> solo acepta tipo 'string', recibió ${typeof text}`);
        }

        this.data.title.content = text;

        // Validaciones para las propiedades adicionales
        if (data) {
            // Validación para text_color
            if (data.text_color) {
                if (typeof data.text_color !== 'string') {
                    throw new NekoError('TypeError', `La propiedad <text_color> solo acepta tipo 'string', recibió ${typeof data.text_color}`);
                }
                if (!data.text_color.startsWith('#')) {
                    throw new NekoError('TitleError', 'El valor de <text_color> debe comenzar con \'#\'');
                }
                if (!hex_reg.test(data.text_color)) {
                    throw new NekoError('TitleError', 'El valor de <text_color> no es un color válido');
                }
                this.data.title.text_color = data.text_color;
            }

            // validacion del tamaño de texto
            if (data.font_size) {
                if (typeof data.font_size !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <font_size> solo acepta tipo 'number', recibió ${typeof data.font_size}`);
                }
                if (data.font_size <= 0) {
                    throw new NekoError('TitleError', 'El valor de <font_size> debe ser mayor que 0');
                }
                this.data.title.font_size = data.font_size;
            }

            // validacion de posiciones
            if (data.x) {
                if (typeof data.x !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <x> solo acepta tipo 'number', recibió ${typeof data.x}`);
                }
                this.data.title.x = data.x;
            }

            if (data.y) {
                if (typeof data.y !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <y> solo acepta tipo 'number', recibió ${typeof data.y}`);
                }
                this.data.title.y = data.y;
            }
        }

        return this
    }

    /**
     * Agrega una descripción a la imagen de bienvenida
     * @param {string} text - Texto de la descripción
     * @param {WelcomeTextData} data - Configuración de la descripción
     * @throws {NekoError} Arroja un error si parámetros son inválidos
     * @returns {Welcome}
     */
    setDescription(text, data) {
        // Validaciones del texto
        if (!text) {
            throw new NekoError('DescriptionError', 'El parámetro <text> no puede estar vacío');
        }
        if (typeof text !== 'string') {
            throw new NekoError('TypeError', `El parámetro <text> solo acepta tipo 'string', recibió ${typeof text}`);
        }

        this.data.description.content = text;

        // Validaciones para las propiedades adicionales
        if (data) {
            // Validación para text_color
            if (data.text_color) {
                if (typeof data.text_color !== 'string') {
                    throw new NekoError('TypeError', `La propiedad <text_color> solo acepta tipo 'string', recibió ${typeof data.text_color}`);
                }
                if (!data.text_color.startsWith('#')) {
                    throw new NekoError('DescriptionError', 'El valor de <text_color> debe comenzar con \'#\'');
                }
                if (!hex_reg.test(data.text_color)) {
                    throw new NekoError('DescriptionError', 'El valor de <text_color> no es un color válido');
                }
                this.data.description.text_color = data.text_color;
            }

            // validacion del tamaño de texto
            if (data.font_size) {
                if (typeof data.font_size !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <font_size> solo acepta tipo 'number', recibió ${typeof data.font_size}`);
                }
                if (data.font_size <= 0) {
                    throw new NekoError('DescriptionError', 'El valor de <font_size> debe ser mayor que 0');
                }
                this.data.description.font_size = data.font_size;
            }

            // validacion de posiciones
            if (data.x) {
                if (typeof data.x !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <x> solo acepta tipo 'number', recibió ${typeof data.x}`);
                }
                this.data.description.x = data.x;
            }

            if (data.y) {
                if (typeof data.y !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <y> solo acepta tipo 'number', recibió ${typeof data.y}`);
                }
                this.data.description.y = data.y;
            }
        }

        return this
    }

    /**
     * Establece el fondo de la imagen de bienvenida (color o imagen)
     * @param {'color'|'image'} type - Tipo de fondo ('color' o 'image')
     * @param {string|Buffer} value - Color hexadecimal (ej. '#FF5733') o imagen (URL/Buffer)
     * @returns {Welcome}
     * @throws {NekoError} Si los parámetros son inválidos
     * @example
     * // Fondo con color
     * welcome.setBackground('color', '#23272A');
     * 
     * // Fondo con imagen desde URL
     * welcome.setBackground('image', 'https://ejemplo.com/fondo.jpg');
     * 
     * // Fondo con imagen desde Buffer
     * const imageBuffer = fs.readFileSync('fondo.jpg');
     * welcome.setBackground('image', imageBuffer);
     */
    setBackground(type, value) {
        if (!type) throw new NekoError('BackgroundError', 'El parámetro <type> no puede estar vacío');
        if (typeof type != 'string') throw new NekoError('TypeError', `El parámetro <type> debe ser string, recibió ${typeof type}`);
        if (!['color', 'image'].includes(type)) throw new NekoError('BackgroundError', 'El tipo de fondo debe ser "color" o "image"');

        if (!value) throw new NekoError('BackgroundError', 'El parámetro <value> no puede estar vacío');

        if (type == 'color') {
            if (typeof value != 'string') throw new NekoError('TypeError', 'Para fondo de color, <data> debe ser string');
            if (!value.startsWith('#')) throw new NekoError('BackgroundError', 'El color debe comenzar con \'#\'');
            if (!hex_reg.test(value)) throw new NekoError('BackgroundError', 'El valor no es un color hexadecimal válido');

            this.data.background = { type, value };
            return this;
        }

        if (type == 'image') {
            if (typeof value != 'string' && !Buffer.isBuffer(value)) {
                throw new NekoError('TypeError', 'Para fondo de imagen, <value> debe ser URL (string) o Buffer');
            }

            if (typeof value == 'string') {
                try {
                    new URL(value);
                } catch (error) {
                    throw new NekoError('BackgroundError', 'La URL proporcionada no es válida');
                }
            }

            this.data.background = { type, value };
            return this;
        }
    }

    /**
     * Establece el avatar y su configuración en la imagen de bienvenida
     * @param {string|Buffer} source - URL del avatar o Buffer de la imagen
     * @param {WelcomeAvatarData} [data] - Configuración opcional del avatar
     * @returns {Welcome}
     * @throws {NekoError} Si los parámetros son inválidos
     * @example
     * // Configuración básica con URL
     * welcome.setAvatar('https://example.com/avatar.jpg');
     * 
     * // Configuración completa con Buffer
     * const avatarBuffer = fs.readFileSync('avatar.png');
     * welcome.setAvatar(avatarBuffer, {
     *   x: 300,
     *   y: 100,
     *   border: '#FF5733',
     *   radio: 120
     * });
     */
    setAvatar(source, data) {
        // Validación del source
        if (!source) {
            throw new NekoError('AvatarError', 'El parámetro <source> no puede estar vacío');
        }

        if (typeof source != 'string' && !Buffer.isBuffer(source)) {
            throw new NekoError('TypeError', 'El parámetro <source> debe ser string (URL) o Buffer');
        }

        if (typeof source === 'string') {
            try {
                const url = new URL(source);
                
                if (!['http:', 'https:'].includes(url.protocol)) {
                    throw new NekoError('AvatarError', 'La URL debe usar HTTP/HTTPS');
                }

                const extension = url.pathname.toLowerCase().split('.').pop();
                if (!['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                    throw new NekoError('AvatarError', 'Formato de imagen no soportado. Usa JPEG, PNG o GIF');
                }
            } catch (error) {
                if (error instanceof NekoError) throw error;
                throw new NekoError('AvatarError', 'La URL del avatar no es válida');
            }
        }
        
        if (Buffer.isBuffer(source)) {
            if (source.length < 8) { 
                throw new NekoError('AvatarError', 'El Buffer de imagen es demasiado pequeño');
            }
            
            const header = source.toString('hex', 0, 8);
            const isJPEG = header.startsWith('ffd8ff');
            const isPNG = header.startsWith('89504e470d0a1a0a');
            const isGIF = header.startsWith('47494638');
            
            if (!isJPEG && !isPNG && !isGIF) {
                throw new NekoError('AvatarError', 'Formato de imagen no soportado. El Buffer debe ser JPEG, PNG o GIF');
            }
        }
    
        this.data.avatar.source = source;

        if (data) {
            if (data.x) {
                if (typeof data.x != 'number') {
                    throw new NekoError('TypeError', 'La propiedad <x> debe ser un número');
                }
                if (data.x < 0) {
                    throw new NekoError('AvatarError', 'La posición X no puede ser negativa');
                }
                this.data.avatar.x = data.x;
            }

            if (data.y) {
                if (typeof data.y != 'number') {
                    throw new NekoError('TypeError', 'La propiedad <y> debe ser un número');
                }
                this.data.avatar.y = data.y;
            }

            if (data.border) {
                if (typeof data.border != 'string') {
                    throw new NekoError('TypeError', 'La propiedad <border> debe ser un string');
                }
                if (!data.border.startsWith('#')) {
                    throw new NekoError('AvatarError', 'El color del borde debe comenzar con #');
                }
                if (!hex_reg.test(data.border)) {
                    throw new NekoError('AvatarError', 'El color del borde no es un hexadecimal válido');
                }
                this.data.avatar.border = data.border;
            }

            if (data.radio) {
                if (typeof data.radio != 'number') {
                    throw new NekoError('TypeError', 'La propiedad <radio> debe ser un número');
                }
                this.data.avatar.radio = data.radio;
            }
        }

        return this;
    }

    /**
     * Genera la imagen de bienvenida con la configuracion actual
     * @returns {Promise<Buffer>} Buffer de la imagen generada
     * @throws {NekoError} Si faltan datos
     * @throws {Error} Si hay problemas al cargar imágenes
     */
    async build() {
        if (!this.data.avatar?.source) {
            throw new NekoError('BuildError', 'No se ha podido cargar un avatar. Usa el metodo .setAvatar()')
        }
        if (!this.data.title?.content) {
            throw new NekoError('BuildError', 'No se puede dar un titulo vacío. Usa el metodo .setTitle()')
        }
        if (!this.data.description?.content) {
            throw new NekoError('BuildError', 'No se puede dar una descripcion vacía. Usa el metodo .setDescription()')
        }

        try {
            const [bg, avatar] = await Promise.all([
                this.data.background.type == 'image' ? Canvas.loadImage(this.data.background.value) : null,
                Canvas.loadImage(this.data.avatar.source)
            ])

            const canvas = Canvas.createCanvas(this.data.width, this.data.height)
            const ctx = canvas.getContext('2d')

            if (bg) {
                let ratio = Math.max(canvas.width / bg.width, canvas.height / bg.height);
                let width = bg.width * ratio;
                let height = bg.height * ratio;
                ctx.drawImage(bg, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
            } else {
                ctx.fillStyle = this.data.background.value;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const maxTitleWidth = this.data.width * 0.8;
            let titleFontSize = this.data.title.font_size;
            ctx.font = `${titleFontSize}px ${this.data.font}`;

            while (ctx.measureText(this.data.title.content).width > maxTitleWidth && titleFontSize > 10) {
                titleFontSize -= 1;
                ctx.font = `${titleFontSize}px ${this.data.font}`;
            }

            ctx.fillStyle = this.data.title.text_color;
            ctx.textAlign = "center";
            ctx.fillText(this.data.title.content, this.data.title.x, this.data.title.y);

            const maxDescWidth = this.data.width * 0.9;
            let descFontSize = this.data.description.font_size;
            ctx.font = `${descFontSize}px ${this.data.font}`;

            while (ctx.measureText(this.data.description.content).width > maxDescWidth && descFontSize > 8) {
                descFontSize -= 1;
                ctx.font = `${descFontSize}px ${this.data.font}`;
            }

            ctx.fillStyle = this.data.description.text_color;
            ctx.textAlign = "center";
            ctx.fillText(this.data.description.content, this.data.description.x, this.data.description.y);

            const x = this.data.avatar.x;
            const y = this.data.avatar.y;
            const radio = this.data.avatar.radio;

            if (this.data.avatar.border) {
                ctx.beginPath();
                ctx.fillStyle = this.data.avatar.border;
                ctx.arc(x + radio, y + radio, radio + 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(x + radio, y + radio, radio, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, x, y, radio * 2, radio * 2);
            ctx.restore();

            return canvas.toBuffer();
        } catch (error) {
            if(error instanceof NekoError) {
                throw error;
            }
            throw new NekoError('GenerateError', 'Error al generar la imagen: '+error.message)
        }
    }
}

module.exports = Welcome;