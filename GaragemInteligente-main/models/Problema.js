// models/Problema.js
const mongoose = require('mongoose');

const problemaSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    problema: { type: String, required: true },
    servicoId: { type: String, required: true }
});

// O terceiro argumento 'problemas' força o nome da coleção para ser exatamente 'problemas'
const Problema = mongoose.model('Problema', problemaSchema, 'problemas');

module.exports = Problema;