const mongoose = require('mongoose');

// 1. Definir o Schema (a "planta" dos documentos na coleção 'veiculos')
const veiculoSchema = new mongoose.Schema({
    placa: { 
        type: String, 
        required: [true, 'A placa é obrigatória.'],
        unique: true,
        uppercase: true,
        trim: true
    },
    marca: { type: String, required: [true, 'A marca é obrigatória.'] },
    modelo: { type: String, required: [true, 'O modelo é obrigatório.'] },
    ano: { 
        type: Number, 
        required: [true, 'O ano é obrigatório.'],
        min: [1900, 'O ano deve ser no mínimo 1900.'],
        max: [new Date().getFullYear() + 1, 'O ano não pode ser no futuro.']
    },
    cor: { type: String },
    
    // ==========================================================
    // === NOVO CAMPO ADICIONADO PARA CONECTAR VEÍCULO A USUÁRIO ===
    // ==========================================================
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // A referência ao modelo 'User' (que deve ser criado em models/User.js)
        required: true // O veículo DEVE ter um dono
    }
    // ==========================================================
    
}, { 
    timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

// 2. Criar o Modelo a partir do Schema
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

module.exports = Veiculo;