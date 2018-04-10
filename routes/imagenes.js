/* SERVICIO PARA MOSTRAR LAS IMÁGENES (llevar a carpeta de servicios) */

// Hacemos el import de express
var express = require('express');
var fs = require('fs'); // Importo el FileSistem

// Guardamos express en variable
var app = express();



// ===============================================================================
// Declaramos la petición con el método para la ruta
// ===============================================================================
app.get('/:tipo_archivo/:imagen', (request, response, next) => {

    // Recogemos las variables de la url
    var tipo_archivo = request.params.tipo_archivo;
    var imagen = request.params.imagen;

    // Creamos una variable con el path
    var path = `./uploads/${ tipo_archivo}/${ imagen }`; // Construimos el path

    // Usamos el FileSistem para comprobar si el fichero existe en el path
    fs.exists(path, existe => {

        // Si no existe... le damos una imagen por defecto
        if(!existe){
            path = './assets/img/no-img.jpg';
        }

        // Enviamos una repuesta pero en lugar de un json enviamos un fichero (imagen)
        response.sendfile(path);
    });
});


// Exportamos
module.exports = app;