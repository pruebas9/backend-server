// Hacemos el import de express
var express = require('express');

// Importamos librerías
var fileUpload = require('express-fileupload'); // Para subir ficheros al servidor (https://github.com/richardgirges/express-fileupload)
var fs = require('fs'); // Importamos el fileSistem

// Guardamos en variable
var app = express();


//Importamos los modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// Default options. Implementamos el middleware, más info en (https://github.com/richardgirges/express-fileupload)
app.use(fileUpload());



// ===============================================================================
// Hacemos la petición (nos pasan tipo de archivo: medico, hospital, etc y el id del usuario)
// ===============================================================================
app.put('/:tipo_archivo/:id', function(request, response) {

    var tipo_archivo = request.params.tipo_archivo; // Recogemos de url tipo de archivo
    var id = request.params.id; // Recogemos de url el id de usuario que sube archivo

    // Validamos tipos de archivos permitidos
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if(tiposValidos.indexOf(tipo_archivo) < 0){
        return response.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipos válidos son: '+tiposValidos.join(', ') }              
        });
    }


    // 1. Compruebo que haya fichero
    if (!request.files){
        return response.status(400).json({
            ok: false,
            mensaje: 'No hay nada seleccionado',
            errors: { message: 'Debe seleccionar una imagen!' }              
        });            
    }

    // 2. Validaciones:
    // 2.1 Obtener nombre del archivo
    var archivo = request.files.imagen; 
    var nombre_split = archivo.name.split('.'); 
    var extensionArchivo = nombre_split[nombre_split.length -1];// Cogemos la última posición del array

    // 2.2 Extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extensionesValidas.indexOf(extensionArchivo) < 0){
        return response.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son: '+extensionesValidas.join(', ') }              
        });
    }

    // 3. Crear un nombre de archivo personalizado (id_usuario + nº random +  extensión)
    var  nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo}`;

    // 4. Mover el archivo del directorio temporal a un path elegido por nosotros
    var path = `./uploads/${ tipo_archivo }/${ nombreArchivo}`;

    archivo.mv( path, (error) => {

        if(error){
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: error            
            });
        }

        // Llamamos a la función que sube el archivo y nos dará la respuesta
        subirPorTipo(tipo_archivo, id, nombreArchivo, response);
       
    });
    
   
});
   

// ===============================================================================
// Función para subir imágenes por tipo de perfil: médicos, usuarios y hospitales
// ===============================================================================
function subirPorTipo( tipo_archivo, id, nombreArchivo, response){

    if(tipo_archivo === 'usuarios'){

        //Buscamos si hay algún registro con el id que nos pasan
        Usuario.findById(id, (error, usuario) => {

            // Si no existe el usuario
            if(!usuario){
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario que intenta buscar',
                    errors: { message: 'El usuario no existe' }            
                });
            }

            // Si el usuario ya tiene imagen subida, sacamos el path viejo
            var pathViejo = './uploads/usuarios' + usuario.img; // Propiedad img del usuario encontrado

            // Si existe el path viejo lo desasociamos (eliminamos la imagen anterior)
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo)
            }

            // Seteamos el nombre de la imagen
            usuario.img = nombreArchivo;

            // Guardamos en base de datos
            usuario.save((error, usuarioActualizado) => {

                if(error){
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar la imagen del usuario',
                        errors: error            
                    });
                }

                usuarioActualizado.password = ':)';

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario guardada correctamente',
                    usuario: usuarioActualizado

                })
            });
        });
    }

    if(tipo_archivo === 'medicos'){
        
        //Buscamos si hay algún registro con el id que nos pasan
        Medico.findById(id, (error, medico) => {

            // Si no existe el médico
            if(!medico){
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No existe el médico que intenta buscar',
                    errors: { message: 'El médico no existe' }            
                });
            }

            // Si el medico ya tiene imagen subida, sacamos el path viejo
            var pathViejo = './uploads/medicos' + medico.img; // Propiedad img del medico encontrado

            // Si existe el path viejo lo desasociamos (eliminamos la imagen anterior)
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo)
            }

            // Seteamos el nombre de la imagen
            medico.img = nombreArchivo;

            // Guardamos en base de datos
            medico.save((error, medicoActualizado) => {

                if(error){
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar la imagen del médico',
                        errors: error            
                    });
                }

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del médico guardada correctamente',
                    medico: medicoActualizado

                })
            });
        });

    }

    if(tipo_archivo === 'hospitales'){

        //Buscamos si hay algún registro con el id que nos pasan
        Hospital.findById(id, (error, hospital) => {

            // Si no existe el hospital
            if(!hospital){
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital que intenta buscar',
                    errors: { message: 'El hospital no existe' }            
                });
            }

            // Si el usuario ya tiene imagen subida, sacamos el path viejo
            var pathViejo = './uploads/hospitales' + hospital.img; // Propiedad img del hospital encontrado

            // Si existe el path viejo lo desasociamos (eliminamos la imagen anterior)
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo)
            }

            // Seteamos el nombre de la imagen
            hospital.img = nombreArchivo;

            // Guardamos en base de datos
            hospital.save((error, hospitalActualizado) => {

                if(error){
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar la imagen del hospital',
                        errors: error            
                    });
                }

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital guardada correctamente',
                    hospital: hospitalActualizado

                })
            });
        });
    }
}



// Exportamos
module.exports = app;
