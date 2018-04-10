// Hacemos el import de express
var express = require('express');

// Importamos librerías
var jwt = require('jsonwebtoken'); // Para generar token (https://github.com/auth0/node-jsonwebtoken)
//var SEED = require('../config/config').SEED; // La semilla para el token que está en el fichero config.js
var mdAuthentication = require('../middlewares/autenticacion');


// Guardamos en variable
var app = express();

// Importamos el model de usuarios
var Medico = require('../models/medico');


// MÉTODOS PARA EL CRUD DEL MÉDICO


// ===============================================================================
// Obtener todos los médicos 
// ===============================================================================
app.get('/', (request, response, next) => {

    // Variable para la paginación
    var desde = request.query.desde || 0; // Si no viene nada será 0
    desde = Number(desde); // Casting a number

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (error, medicos) => {
            
                if(error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al devolver los medicos',
                        errors: error,              
                    });            
                }

                // Hacemos un count del total de registros (primer parámetro sería una query)
                Medico.count({}, (error, totalMedicos) => {

                    if(error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al devolver el total de los usuarios',
                            errors: error,              
                        }); 
                    }
                        
                    response.status(201).json({
                        ok: true,
                        medicos: medicos,
                        total: totalMedicos
                    })                  
                });
            });
});


// ===============================================================================
// Crear un médico
// ===============================================================================
app.post('/', mdAuthentication.verificaToken, (request, response, next) => {

    var body = request.body; // Recogemos los datos que vienen por POST

    // Habría que comprobar que nos están llegando datos...

    // Seteamos los parámetros del médico
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: request.usuario._id, 
        hospital: body.hospital // Esto viene en el body (en un select, por ejemplo)
    });

    // Guardamos el médico en base de datos
    medico.save((error, medicoGuardado) => {

        if(error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al guardar el médico',
                errors: error,              
            });            
        }

        response.status(201).json({
            ok: true,
            medico: medicoGuardado,
        })
    });
});


// ===============================================================================
// Actualizar un médico 
// ===============================================================================
app.put('/:id', mdAuthentication.verificaToken, (request, response) => {

    var id = request.params.id; // Recogemos el id que nos viene en la url

    // Buscamos el médico por el ID y lo actualizamos
    Medico.findById( id , (error, medico) => {

        if(error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el médico',
                errors: error,              
            });            
        }

        if(!medico)
            return response.status(404).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID'},              
        });

        var body = request.body; // Recogemos los datos que vienen por POST

        // Seteamos los parámetros
        medico.nombre = body.nombre;
        medico.imp = body.img;
        medico.usuario = request.usuario._id; // ID del usuario
        medico.hospital = body.hospital; // Esto viene en el body (en un select, por ejemplo)

        medico.save((error, medicoActualizado) => {

            if(error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el médico',
                    errors: error,              
                });            
            }

            response.status(200).json({
                ok: true,
                medico: medicoActualizado
            })           
        })
    });  
});


// ===============================================================================
// Borrar un médico 
// ===============================================================================
app.delete('/:id', mdAuthentication.verificaToken, (request, response) => {

    var id = request.params.id; // Recogemos el ID que nos llega por la url

    Medico.findByIdAndRemove(id, (error, medicoBorrado) => {

        if(error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el médico',
                errors: error,              
            });            
        }

        if(!medicoBorrado){
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con el id ' + id,
                errors: { message: 'No existe un médico con ese id'}
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        })
    });
});


// Exportamos
module.exports = app;