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

// ===============================================================================
// MIDDLEWARE. Verificar si el usuario tiene permiso para actualizar un usuarios
// ===============================================================================
exports.verificaADMIN_ROLE = function( request, response, next){

    var usuario = request.usuario;  // Obtenemos las propiedades del objeto usuario

    if (usuario.role === 'ADMIN_ROLE') {
        next(); // Salimos de la función
        return;
    } else {

        return response.status(401).json({
            ok: false,
            mensaje: 'Unauthorized. No tiene un role con privilegios para esta acción',
            errors: { message: 'No tiene autorización para esta acción' },              
        });
    }


}