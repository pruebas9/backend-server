// Hacemos el import de express
var express = require('express');

// Guardamos en variable
var app = express();


// Declaramos las rutas
app.get('/', (request, response, next) => {

    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});


// Exportamos
module.exports = app;