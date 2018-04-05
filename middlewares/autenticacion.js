// Hacemos el import de express
var express = require('express');

// Importamos librerías
var bcrypt = require('bcryptjs'); // Para trabajar con encriptación passwords (https://github.com/dcodeIO/bcrypt.js/)
var jwt = require('jsonwebtoken'); // Para generar token (https://github.com/auth0/node-jsonwebtoken)
var SEED = require('../config/config').SEED; // La semilla para el token que está en el fichero config.js


// ===============================================================================
// MIDDLEWARE. Verificar token. Para los métodos con autenticación 
// ===============================================================================
exports.verificaToken = function( request, response, next){

    var token = request.query.token; // Recojo el token que viene por la url

    jwt.verify(token, SEED, (error, decoded) => {

        if(error){
            return response.status(401).json({
                ok: false,
                mensaje: 'Unauthorized. Token no válido',
                errors: error,              
            });
        }

        // Insertamos en la respuesta los datos del usuario (decoded.usuario)
        request.usuario = decoded.usuario;
        
        next(); // Le damos salida al método
    });

    //TODO: Pasar el token por el header y no por la url...
}