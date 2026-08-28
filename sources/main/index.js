'use strict';

//#region Clases

exports.User = require('../classes/user/User.js')

// paquete

exports.NekoGif = require('../classes/package/NekoGif.js')
exports.BaseUser = require('../classes/user/BaseUser.js')
exports.Welcome = require('../classes/package/welcome.js')

// rest

exports.APIClient = require('../rest/APIClient.js')

// errores

exports.APIError = require('../classes/errors/APIError.js')
exports.NekoError = require('../classes/errors/Error.js')
// Alias conservado por compatibilidad con versiones 2.0.x.
exports.Error = exports.NekoError

//#region "constantes"

exports.SFW = require('../classes/SFW.js')
