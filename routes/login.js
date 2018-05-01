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

// Imports de SignIn de Google:
var CLIENT_ID = require('../config/config').CLIENT_ID; // Cogemos de nuestro fichero de configuraciones
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// ===============================================================================
// Autenticación con login normal
// ===============================================================================
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
        );

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            id: usuarioDB._id,
            token: token,
            menu: obtenerMenu(usuarioDB.role)
        });
    });    
});

// ===============================================================================
// Autenticación con SignIn de Google. Más info en: https://developers.google.com/identity/sign-in/web/backend-auth
// ===============================================================================

// Función nueva para hacer peticiones asíncronas (parecido al Promise, de hecho devuelve una Promise)
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    // Retornamos lo que nos interese del payload
    return {
        // payload: payload,
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }
  

// Petición. Para que se ejecute el 'await' es necesario que en la petición usemos una función 'async'
app.post('/google', async(request, response) => {

    // Recogemos el token que nos viene en la petición
    var token = request.body.token;

    // Guardamos lo que retorne la función async 'verify' a la que le pasamos el token
    var googleUser = await verify(token)
            .catch( e => {
                return response.status(403).json({
                    ok: false,
                    mensaje: { message: 'Token no válido' }
                })
            });

    // Buscamos ese usuario en base de datos
    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {

        if(error){
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: error
            });
        }

        // Comprobaremos si ese usuario se ha registrado por google
        if(usuarioDB){

            // Comprobamos si se ha registrado por Google
            if(usuarioDB.google === false){ 
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal',
                    errors: error
                });
            }else{
                usuarioDB.password = ':)'; // Modificamos la contraseña

                // Creamos el token usando la librería jsonwebtoken
                var token = jwt.sign(
                    {usuario: usuarioDB}, // Payload
                    SEED,
                    { expiresIn: 14400} // Expira en 4 horas
                );

                // Enviamos la respuesta con el usuario, el id y el token
                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token,
                    mensaje: 'Usuario encontrado en base de datos',
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        }else{
            // El usuario no existe, hay que crearlo
            var usuario = new Usuario();

            // Seteamos los parámetros del usuario que nos vienen de Google
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            // Guardamos en base de datos
            usuario.save((error, usuarioDB) => {
                if(error){
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar el usuario',
                        errors: error
                    });
                }
                // Creamos el token usando la librería jsonwebtoken
                var token = jwt.sign(
                    {usuario: usuarioDB}, // Payload
                    SEED,
                    { expiresIn: 14400} // Expira en 4 horas
                );

                // Enviamos la respuesta con el usuario, el id y el token
                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token,
                    mensaje: 'Se ha creado el usuario con Google',
                    menu: obtenerMenu(usuarioDB.role)
                });
            });
        }
    });
});




function obtenerMenu( ROLE ){

    var menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'Progress', url: '/progress' },
            { titulo: 'Gráficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'RxJs', url: '/rxjs' },
          ]
        },
        {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: '/usuarios' },
            { titulo: 'Hospitales', url: '/hospitales' },
            { titulo: 'Médicos', url: '/medicos' },
          ]
        }
      ];


      if (ROLE === 'ADMIN_ROLE') {
          menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios' } );
      }

      return menu;
}

// Exportamos
module.exports = app;