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
// Se usará la de abajo por ser más completa. Esta no permite modificar datos de uno mismo
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

// ===============================================================================
// MIDDLEWARE. Verificar ADMIN ó mismo usuario (un usuario puede actualizarse a sí mismo)
// Es la misma función que la de arriba pero más completa. Usaremos esta
// ===============================================================================
exports.verificaADMIN_o_MismoUsuario = function( request, response, next){

    var usuario = request.usuario;  // Obtenemos las propiedades del objeto usuario
    var id = request.params.id;     // Recojo el Id del usuario de los parámetros (nos tienen que venir)

    // Comprobamos role ó si el id del usuario que hay en el token es el mismo que tenemos en los parámetros
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next(); // Salimos de la función
        return;
    } else {

        return response.status(401).json({
            ok: false,
            mensaje: 'Unauthorized. No tiene privilegios para esta acción',
            errors: { message: 'No tiene autorización para esta acción' },              
        });
    }

}