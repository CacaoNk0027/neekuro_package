'use strict';

//#region Clases

exports.User = require('../classes/user/User.js')

// paquete

exports.NekoGif = require('../classes/package/NekoGif.js')
exports.BaseUser = require('../classes/user/BaseUser.js')
exports.Welcome = require('../classes/package/Welcome.js')

// rest

exports.APIClient = require('../rest/APIClient.js')

// errores

exports.APIError = require('../classes/errors/APIerror.js')
exports.Error = require('../classes/errors/Error.js')

//#region "constantes"

exports.SFW = require('../classes/SFW.js')