'use strict';
const Canvas = require('canvas');
const NekoError = require('../errors/Error.js');
const hex_reg = require('hex-color-regex')({ strict: true })
const path = require('path');
const fs = require('fs');
const { loadImageSource, parseRemoteURL, validateImageBuffer } = require('../../utils/imageLoader.js');

const DEFAULT_WIDTH = 1140;
const DEFAULT_HEIGHT = 520;
const MIN_DIMENSION = 128;
const MAX_DIMENSION = 4096;
const registeredFonts = new Set();

/**
 * @typedef {import('../../typings').FontNames} FontNames
 * @typedef {import('../../typings').WelcomeTextData} WelcomeTextData 
 * @typedef {import('../../typings').WelcomeAvatarData} WelcomeAvatarData
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
         * @property {'center'|'manual'} data.layout - Distribución de los elementos
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
            layout: 'center',
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
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
        this.setFont('arial');
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

        this.data.width = width === 'default' ? DEFAULT_WIDTH : validateDimension(width, 'width');
        this.data.height = height === 'default' ? DEFAULT_HEIGHT : validateDimension(height, 'height');

        return this
    }

    /**
     * Selecciona la distribución automática centrada o las coordenadas manuales.
     * @param {'center'|'manual'} layout
     * @returns {Welcome}
     */
    setLayout(layout) {
        if (!['center', 'manual'].includes(layout)) {
            throw new NekoError('LayoutError', 'El layout debe ser "center" o "manual"');
        }
        this.data.layout = layout;
        return this;
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
                if (path.extname(dir).toLowerCase() !== '.ttf') throw new NekoError('FontError', 'se necesita un archivo TTF en el parametro <dir>')
                ruta = path.resolve(dir);
                break;
            default: throw new NekoError('FontError', 'el parametro <name> no acepta ningun tipo diferente a los preterminados');
        }
        try {
            if (!fs.existsSync(ruta)) throw new Error('Font not found');
            const fontKey = `${name}:${ruta}`;
            if (!registeredFonts.has(fontKey)) {
                Canvas.registerFont(ruta, { family: name });
                registeredFonts.add(fontKey);
            }
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
            if (data.x !== undefined) {
                if (typeof data.x !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <x> solo acepta tipo 'number', recibió ${typeof data.x}`);
                }
                this.data.title.x = data.x;
                this.data.layout = 'manual';
            }

            if (data.y !== undefined) {
                if (typeof data.y !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <y> solo acepta tipo 'number', recibió ${typeof data.y}`);
                }
                this.data.title.y = data.y;
                this.data.layout = 'manual';
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
            if (data.x !== undefined) {
                if (typeof data.x !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <x> solo acepta tipo 'number', recibió ${typeof data.x}`);
                }
                this.data.description.x = data.x;
                this.data.layout = 'manual';
            }

            if (data.y !== undefined) {
                if (typeof data.y !== 'number') {
                    throw new NekoError('TypeError', `La propiedad <y> solo acepta tipo 'number', recibió ${typeof data.y}`);
                }
                this.data.description.y = data.y;
                this.data.layout = 'manual';
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
                parseRemoteURL(value, 'el fondo');
            } else {
                validateImageBuffer(value, 'el fondo');
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
            parseRemoteURL(source, 'el avatar');
        }
        
        if (Buffer.isBuffer(source)) {
            validateImageBuffer(source, 'el avatar');
        }
    
        this.data.avatar.source = source;

        if (data) {
            if (data.x !== undefined) {
                if (typeof data.x != 'number') {
                    throw new NekoError('TypeError', 'La propiedad <x> debe ser un número');
                }
                if (data.x < 0) {
                    throw new NekoError('AvatarError', 'La posición X no puede ser negativa');
                }
                this.data.avatar.x = data.x;
                this.data.layout = 'manual';
            }

            if (data.y !== undefined) {
                if (typeof data.y != 'number') {
                    throw new NekoError('TypeError', 'La propiedad <y> debe ser un número');
                }
                this.data.avatar.y = data.y;
                this.data.layout = 'manual';
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

            if (data.radio !== undefined) {
                if (typeof data.radio != 'number') {
                    throw new NekoError('TypeError', 'La propiedad <radio> debe ser un número');
                }
                if (!Number.isFinite(data.radio) || data.radio <= 0 || data.radio > Math.min(this.data.width, this.data.height) / 2) {
                    throw new NekoError('AvatarError', 'El radio debe ser positivo y caber dentro de la imagen');
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
                this.data.background.type == 'image' ? loadImageSource(this.data.background.value, 'el fondo') : null,
                loadImageSource(this.data.avatar.source, 'el avatar')
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
            let titleFontSize = this.data.layout === 'center'
                ? Math.min(this.data.title.font_size, this.data.height * 0.14)
                : this.data.title.font_size;
            ctx.font = `${titleFontSize}px ${this.data.font}`;

            while (ctx.measureText(this.data.title.content).width > maxTitleWidth && titleFontSize > 10) {
                titleFontSize -= 1;
                ctx.font = `${titleFontSize}px ${this.data.font}`;
            }

            const maxDescWidth = this.data.width * 0.9;
            let descFontSize = this.data.layout === 'center'
                ? Math.min(this.data.description.font_size, this.data.height * 0.09)
                : this.data.description.font_size;
            ctx.font = `${descFontSize}px ${this.data.font}`;

            while (ctx.measureText(this.data.description.content).width > maxDescWidth && descFontSize > 8) {
                descFontSize -= 1;
                ctx.font = `${descFontSize}px ${this.data.font}`;
            }

            const layout = this.data.layout === 'center'
                ? calculateCenteredLayout(this.data, titleFontSize, descFontSize)
                : {
                    avatarX: this.data.avatar.x,
                    avatarY: this.data.avatar.y,
                    radio: this.data.avatar.radio,
                    titleX: this.data.title.x,
                    titleY: this.data.title.y,
                    descriptionX: this.data.description.x,
                    descriptionY: this.data.description.y
                };

            const x = layout.avatarX;
            const y = layout.avatarY;
            const radio = layout.radio;

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

            ctx.textAlign = 'center';
            ctx.textBaseline = this.data.layout === 'center' ? 'middle' : 'alphabetic';
            ctx.font = `${titleFontSize}px ${this.data.font}`;
            ctx.fillStyle = this.data.title.text_color;
            ctx.fillText(this.data.title.content, layout.titleX, layout.titleY);

            ctx.font = `${descFontSize}px ${this.data.font}`;
            ctx.fillStyle = this.data.description.text_color;
            ctx.fillText(this.data.description.content, layout.descriptionX, layout.descriptionY);

            return canvas.toBuffer();
        } catch (error) {
            if(error instanceof NekoError) {
                throw error;
            }
            throw new NekoError('GenerateError', 'Error al generar la imagen: '+error.message)
        }
    }
}

function calculateCenteredLayout(data, titleFontSize, descFontSize) {
    const borderSize = data.avatar.border ? 6 : 0;
    const avatarGap = clamp(data.height * 0.045, 16, 32);
    const textGap = clamp(data.height * 0.018, 8, 16);
    const availableHeight = data.height * 0.9;
    const maxRadio = Math.max(
        16,
        (availableHeight - titleFontSize - descFontSize - avatarGap - textGap) / 2 - borderSize
    );
    const radio = Math.min(data.avatar.radio, maxRadio);
    const avatarOuterSize = (radio + borderSize) * 2;
    const contentHeight = avatarOuterSize + avatarGap + titleFontSize + textGap + descFontSize;
    const startY = (data.height - contentHeight) / 2;
    const centerX = data.width / 2;
    const avatarX = centerX - radio;
    const avatarY = startY + borderSize;
    const titleY = startY + avatarOuterSize + avatarGap + titleFontSize / 2;
    const descriptionY = titleY + titleFontSize / 2 + textGap + descFontSize / 2;

    return {
        avatarX,
        avatarY,
        radio,
        titleX: centerX,
        titleY,
        descriptionX: centerX,
        descriptionY
    };
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function validateDimension(value, name) {
    if (typeof value !== 'number' || !Number.isInteger(value) || !Number.isFinite(value)) {
        throw new NekoError('TypeError', `el parametro <${name}> debe ser un número entero`);
    }
    if (value < MIN_DIMENSION || value > MAX_DIMENSION) {
        throw new NekoError('ResolutionError', `<${name}> debe estar entre ${MIN_DIMENSION} y ${MAX_DIMENSION} píxeles`);
    }
    return value;
}

module.exports = Welcome;
