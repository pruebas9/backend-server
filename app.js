// Requires (Importación de librerías)
var express = require('express');
var mongoose = require('mongoose');



// Inicializar variables
var app = express();


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {

    if (error) throw error; // Detiene el proceso y lanza el error

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'funcionando');
});


// Rutas
app.get('/', (request, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});




// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'Operativo y funcionando');
})



