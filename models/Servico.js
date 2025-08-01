// models/Servico.js
const mongoose = require('mongoose');

const servicoSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    descricao: { type: String, required: true }
});

// O terceiro argumento 'servicos' força o nome da coleção para ser exatamente 'servicos'
const Servico = mongoose.model('Servico', servicoSchema, 'servicos');

module.exports = Servico;