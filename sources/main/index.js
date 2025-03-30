'use strict';

//#region Clases

exports.User = require('../classes/user/user')

// paquete

exports.NekoGif = require('../classes/package/nekogif')
exports.BaseUser = require('../classes/user/baseuser')
exports.Welcome = require('../classes/package/welcome')

// rest

exports.APIClient = require('../rest/apiclient')

// errores

exports.APIError = require('../classes/errors/apierror')
exports.Error = require('../classes/errors/error')

//#region "constantes"

exports.SFW = require('../classes/sfw')