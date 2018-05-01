// Hacemos el import de express
var express = require('express');

// Importamos librerías
var mdAuthentication = require('../middlewares/autenticacion');

// Guardamos en variable
var app = express();

// Importamos el model de hospital y usuario
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');


// MÉTODOS PARA EL CRUD DEL HOSPITAL


// ===============================================================================
// Obtener todos los hospitales 
// ===============================================================================
app.get('/', (request, response, next) => {

    // Variable para la paginación
    var desde = request.query.desde || 0; // Si no viene nada será 0
    desde = Number(desde); // Casting a number

    // Consulta con el select personalizado (devolver ciertos campos sólo)
    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec(
            (error, hospitales) => {
            
                if(error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al devolver los hospitales',
                        errors: error,              
                    });            
                }

                // Hacemos un count del total de registros (primer parámetro sería una query)
                Hospital.count({}, (error, totalHospitales) => {

                    if(error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error al devolver el total de los usuarios',
                            errors: error,              
                        }); 
                    } 
                    
                    response.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: totalHospitales
                    });
                }); 
            });
});


// ===============================================================================
// Crear un hospital
// ===============================================================================
app.post('/', mdAuthentication.verificaToken, (request, response, next) => {

    var body = request.body; // Recogemos los datos que vienen por POST

    // Habría que comprobar que nos están llegando datos...

    // Seteamos los parámetros del hospital
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: request.usuario._id // El id del usuario
    });

    // Guardamos el hospital en base de datos
    hospital.save((error, hospitalGuardado) => {

        if(error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al guardar el hospital',
                errors: error,              
            });            
        }

        // Hacemos un count del total de registros (primer parámetro sería una query)
        Usuario.count({}, (error, totalHospitales) => {

            if(error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al devolver el total de los usuarios',
                    errors: error,              
                }); 
            }
                
            response.status(201).json({
                ok: true,
                hospital: hospitalGuardado,
                total: totalHospitales
            })                  
        }); 
    });
});


// ===============================================================================
// Actualizar un hospital 
// ===============================================================================
app.put('/:id', mdAuthentication.verificaToken, (request, response) => {

    var id = request.params.id; // Recogemos el id que nos viene en la url

    // Buscamos el hospital por el ID y lo actualizamos
    Hospital.findById( id , (error, hospital) => {

        if(error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: error,              
            });            
        }

        if(!hospital)
            return response.status(404).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID'},              
        });

        var body = request.body; // Recogemos los datos que vienen por POST

        // Seteamos los parámetros
        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id; // El id del usuario

        hospital.save((error, hospitalActualizado) => {

            if(error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: error,              
                });            
            }

            response.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            })           
        })
    });  
});


// ===============================================================================
// Borrar un hospital 
// ===============================================================================
app.delete('/:id', mdAuthentication.verificaToken, (request, response) => {

    var id = request.params.id; // Recogemos el ID que nos llega por la url

    Hospital.findByIdAndRemove(id, (error, hospitalBorrado) => {

        if(error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: error,              
            });            
        }

        if(!hospitalBorrado){
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id ' + id,
                errors: { message: 'No existe un hospital con ese id'}
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    });
});


// ===============================================================================
// Buscar un hospital 
// ===============================================================================
app.get('/:id', (request, response) => {

    var id = request.params.id; // Recogemos el ID que nos llega por la url

    Hospital.findById(id)
                .populate('usuario', 'nombre img email')
                .exec((error, hospitalEncontrado) => {

        if(error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: error,              
            });            
        }

        if(!hospitalEncontrado){
            return response.status(404).json({
                ok: false,
                mensaje: 'No existe un hospital con el id ' + id,
                errors: { message: 'No existe un hospital con ese id'}
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalEncontrado
        })
    });
});


// Exportamos
module.exports = app;