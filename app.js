// Requires (Importación de librerías)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



// Inicializar variables
var app = express();


// Body Parser (mirar documentación: https://github.com/expressjs/body-parser)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {

    if (error) throw error; // Detiene el proceso y lanza el error

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'funcionando');
});


// Importar rutas
var appRoutes = require('./routes/app'); // Importamos la ruta para la app principal (raíz)
var usuarioRoutes = require('./routes/usuario'); // Importamos las rutas para el usuario
var loginRoutes = require('./routes/login'); // Importamos las rutas para el login



// Rutas
app.use('/usuario', usuarioRoutes); // Usamos las rutas del usuario
app.use('/login', loginRoutes); // Usamos las rutas para el login
app.use('/', appRoutes); // Usamos el appRoutes para la raíz (siempre va la última)


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'Operativo y funcionando');
})



