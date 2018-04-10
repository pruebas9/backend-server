var mongoose = require('mongoose'); // Importamos la librería
var uniqueValidator = require('mongoose-unique-validator'); // Para validaciones (mirar doc npm)

var Schema = mongoose.Schema;

// Creamo el modelo
var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es un campo requerido'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' } // Referencia al ID_usuario
}, {collection: 'hospitales'}); // Crea la colección si no lo está

// Exportamos el modelo
module.exports = mongoose.model('Hospital', hospitalSchema);