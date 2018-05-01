/* SERVICIO PARA MOSTRAR LAS IMÁGENES (llevar a carpeta de servicios) */

// Hacemos el import de express
var express = require('express');

// Guardamos express en variable
var app = express();

const path = require('path'); // Para construir el path
const fs = require('fs'); // Importo el FileSistem





// ===============================================================================
// Declaramos la petición con el método para la ruta
// ===============================================================================
app.get('/:tipo_archivo/:imagen', (request, response, next) => {

    // Recogemos las variables de la url
    var tipo_archivo = request.params.tipo_archivo;
    var imagen = request.params.imagen;

    // Creamos una variable con el path
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo_archivo}/${ imagen }`); // Construimos el path

    // Si la imagen existe...
    if(fs.existsSync(pathImagen)){
        response.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, '../assets/img/no-img.jpg'); // Construimos el path de la imagen por defecto
        response.sendFile(pathNoImagen);
    }

});


// Exportamos
module.exports = app;