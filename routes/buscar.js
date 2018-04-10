// Hacemos el import de express
var express = require('express');

// Importamos librerías
var mdAuthentication = require('../middlewares/autenticacion');


// Guardamos en variable
var app = express();


// Importamos los modelos para las búsquedas
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// MÉTODOS PARA LA BÚSQUEDA

// ===============================================================================
// Búsqueda en una colección concreta
// ===============================================================================
app.get('/coleccion/:tabla/:parametro', (request, response, next) => {

    var coleccion = request.params.tabla; // Recogemos la colección en la que buscar de la url
    var parametro = request.params.parametro || 0; // Recogemos parámetro que vamos a buscar de la url
    
    // Creamos una expresión regular para mandar a la búsqueda
    var regex = new RegExp(parametro, 'i'); // 'i' hace insensible a mayusc y minusc

    var promesa; // Vamos a ver qué promesa hacemos

    switch( coleccion ){
        case 'usuarios':
            promesa = buscarUsuarios(parametro, regex);
            break;
        
        case 'medicos':
            promesa = buscarMedicos(parametro, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(parametro, regex);
            break;

        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda sólo son: usuarios, médicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido'}
            });
    }

    // Ejecutamos la promesa correspondiente con su then
    promesa.then(respuesta => {
        response.status(200).json({
            ok: true,
            coleccion: respuesta 
        });
    });
});

// ===============================================================================
// Búsqueda en todos los modelos, pasamos un parámetro de búsqueda
// ===============================================================================
app.get('/todo/:parametro', (request, response, next) => {

    var parametro = request.params.parametro; // Recogemos el parámetro a buscar de la url

    // Creamos una expresión regular para mandar a la búsqueda
    var regex = new RegExp(parametro, 'i'); // 'i' hace insensible a mayusc y minusc

    // Usamos un promise con el método 'all' para ejecutar varias funcioes (Investigar más sobre ello)
    Promise.all([   
            buscarHospitales(parametro, regex),
            buscarMedicos(parametro, regex),
            buscarUsuarios(parametro, regex)
        ])
        .then(respuestas => {

            // Las respuestas llegan en la posición en la que se llama su función
            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],  
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
                                     
});


// ===============================================================================
// Función para buscar los hospitales
// ===============================================================================
function buscarHospitales (parametro, regex){

    // Creamos una Promise
    return new Promise( (resolve, reject) => {

        // Hacemos la búsqueda, en la Promise controlamos el reject y el resolve (Populamos la respuesta)
        Hospital.find({ nombre: regex })
                .populate('usuario', 'nombre email')
                .exec((error, hospitales) => {

                    if(error){
                        reject('Error al cargar hospitales', error);
                    }else{
                        resolve(hospitales);
                    }    
                });
    });   
}

// ===============================================================================
// Función para buscar los médicos
// ===============================================================================
function buscarMedicos (parametro, regex){

    // Creamos una Promise
    return new Promise( (resolve, reject) => {

        // Hacemos la búsqueda, en la Promise controlamos el reject y el resolve
        Medico.find({ nombre: regex })
                .populate('usuario', 'nombre email')
                .populate('hospital', 'nombre usuario')
                .exec((error, medicos) => {


                    if(error){
                        reject('Error al cargar médicos', error);
                    }else{
                        resolve(medicos);
                    }    
                });
    });   
}


// ===============================================================================
// Función para buscar los usuarios (en dos columnas: nombre y email)
// ===============================================================================
function buscarUsuarios (parametro, regex){

    // Creamos una Promise
    return new Promise( (resolve, reject) => {

        // Hacemos la búsqueda, con el 'or' y mandando un array de condiciones
        Usuario.find({}, 'nombre email role')
                .or([ {nombre: regex}, {email: regex} ])
                .exec((error, usuarios ) => {

                    if(error){
                        reject('Error al cargar usuarios', error);
                    }else{
                        resolve(usuarios);
                    }    
                }); 
    });
}


// Exportamos
module.exports = app;