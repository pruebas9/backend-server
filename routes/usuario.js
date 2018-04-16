// Hacemos el import de express
var express = require('express');

// Importamos librerías
var bcrypt = require('bcryptjs'); // Para trabajar con encriptación passwords (https://github.com/dcodeIO/bcrypt.js/)
var jwt = require('jsonwebtoken'); // Para generar token (https://github.com/auth0/node-jsonwebtoken)
//var SEED = require('../config/config').SEED; // La semilla para el token que está en el fichero config.js
var mdAuthentication = require('../middlewares/autenticacion');


// Guardamos en variable
var app = express();

// Importamos el model de usuarios
var Usuario = require('../models/usuario');


// MÉTODOS PARA EL CRUD DEL USUARIO

// ===============================================================================
// Obtener todos los usuarios 
// ===============================================================================
app.get('/', (request, response, next) => {

    // Variable para la paginación
    var desde = request.query.desde || 0; // Si no viene nada será 0
    desde = Number(desde); // Casting a number

    // Consulta con el select personalizado (devolver ciertos campos sólo)
    // Con skip() saltamos los registros que nos vengan en desde
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (error, usuarios) => {
            
                if(error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al devolver los usuarios',
                        errors: error,              
                    });            
                }

                // Hacemos un count del total de registros (primer parámetro sería una query)
                Usuario.count({}, (error, totalusuarios) => {

                    if(error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al devolver el total de los usuarios',
                            errors: error,              
                        }); 
                    }
                        
                    response.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: totalusuarios
                    });                  
                });              
            });
});

// ===============================================================================
// MIDDLEWARE. Verificar token. Para los métodos con autenticación (desde aquí hacia abajo)
// Es importante saber que todos los métodos que estén debajo de este pasarán por aquí
// y necesitarán validar el token para poder funcionar (Se ha llevado a la carpeta de middlewares)
// ===============================================================================
// app.use('/', (request, response, next) => {

//     var token = request.query.token; // Recojo en token

//     jwt.verify(token, SEED, (error, decoded) => {

//         if(error){
//             return response.status(401).json({
//                 ok: false,
//                 mensaje: 'Unauthorized. Token no válido',
//                 errors: error,              
//             });
//         }

//         next(); // Le damos salida al método
//     });
// });



// ===============================================================================
// Crear un nuevo usuario (No necesitamos el token para crear usuario)
// ===============================================================================
app.post('/', (request, response, next) => {

    var body = request.body; // Recogemos lo que viene por POST

    // Habría que comprobar que nos están llegando datos

    // Seteamos los parámetros, encriptando la contraseña
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    // Guardamos el usuario en base de datos
    usuario.save((error, usuarioGuardado) => {

        if(error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al guardar el usuario',
                errors: error,              
            });            
        }

        usuarioGuardado.password = ':)'; // Modificamos la password para no devolverla

        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: request.usuario
        })
    });
});


// ===============================================================================
// Actualizar un usuario 
// ===============================================================================
app.put('/:id', mdAuthentication.verificaToken, (request, response) => {

    var id = request.params.id; // Recogemos el id que nos viene en la url

    // Buscamos el usuario por el ID y lo actualizamos
    Usuario.findById( id , (error, usuario) => {

        if(error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: error,              
            });            
        }

        if(!usuario)
            return response.status(404).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID'},              
        });

        var body = request.body; // Recogemos lo que viene por POST

        // Seteamos los parámetros
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioActualizado) => {

            if(error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: error,              
                });            
            }

            usuarioActualizado.password = ':)';

            response.status(200).json({
                ok: true,
                usuario: usuarioActualizado
            })           
        })
    });  
});


// ===============================================================================
// Borrar un usuario 
// ===============================================================================
app.delete('/:id', mdAuthentication.verificaToken, (request, response) => {

    var id = request.params.id; // Recogemos el ID que nos llega por la url

    Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {

        if(error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: error,              
            });            
        }

        if(!usuarioBorrado){
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un usario con el id ' + id,
                errors: { message: 'No existe un usuario con ese id'}
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })
    });
});

// Exportamos
module.exports = app;
