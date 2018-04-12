var mongoose = require('mongoose'); // Importamos la librería
var uniqueValidator = require('mongoose-unique-validator'); // Para validaciones (mirar doc npm)

var Schema = mongoose.Schema;

// Indicamos qué roles son válidos, mando esta variable al campo 'role' (o al que sea)
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es un campo requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es un campo requerido'] },
    password: { type: String, required: [true, 'La contraseña es un campo requerido'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false } // Para comprobar si el usuario se ha creado por Google
});

// Validación para el campo 'unique'
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único'}); // PATH controla qué campo

// Exportamos el modelo
module.exports = mongoose.model('Usuario', usuarioSchema);