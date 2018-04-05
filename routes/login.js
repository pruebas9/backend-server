// Hacemos el import de express
var express = require('express');

// Importamos librerías
var bcrypt = require('bcryptjs'); // Para trabajar con encriptación passwords (https://github.com/dcodeIO/bcrypt.js/)
var jwt = require('jsonwebtoken'); // Para generar token (https://github.com/auth0/node-jsonwebtoken)
var SEED = require('../config/config').SEED; // La semilla para el token que está en el fichero config.js

// Guardamos express en una variable
var app = express();

// Importamos el modelo de usuarios
var Usuario = require('../models/usuario');


app.post('/', (request, response) => {

    var body = request.body; // Recogemos lo que nos llega por POST

    // Comprobamos que exista un usuario con ese email
    Usuario.findOne({email: body.email}, (error, usuarioDB) => {

        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: error
            });
        }

        if(!usuarioDB){
            return response.status(404).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: error
            });
        }

        // Verificamos la contraseña
        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return response.status(404).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: error
            });
        }

        usuarioDB.password = ':)'; // Modificamos la contraseña

        // Creamos el token usando la librería jsonwebtoken
        var token = jwt.sign(
            {usuario: usuarioDB}, // Payload
            SEED,
            { expiresIn: 14400} // Expira en 4 horas
        )

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token
        });
    });

    
});




// Exportamos
module.exports = app;