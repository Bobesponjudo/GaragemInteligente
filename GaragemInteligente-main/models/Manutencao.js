const mongoose = require('mongoose');

// Definição do Schema para a entidade Manutencao
const manutencaoSchema = new mongoose.Schema({
    /**
     * Campo para conectar a manutenção ao seu respectivo veículo.
     * Armazena o ID único de um documento da coleção 'Veiculo'.
     * 'ref' informa ao Mongoose qual modelo usar durante a população.
     * É obrigatório, pois toda manutenção deve pertencer a um veículo.
     */
    veiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Veiculo', // Referencia o modelo 'Veiculo'
        required: true
    },
    /**
     * Descrição do serviço realizado.
     * É um campo de texto (String) e obrigatório.
     */
    descricaoServico: {
        type: String,
        required: [true, 'A descrição do serviço é obrigatória.'],
        trim: true
    },
    /**
     * Data em que a manutenção foi realizada.
     * É uma data (Date), obrigatória, e o valor padrão é a data/hora atual.
     */
    data: {
        type: Date,
        required: true,
        default: Date.now
    },
    /**
     * Custo do serviço de manutenção.
     * É um número (Number), obrigatório, e não pode ser negativo.
     */
    custo: {
        type: Number,
        required: [true, 'O custo da manutenção é obrigatório.'],
        min: [0, 'O custo não pode ser negativo.']
    },
    /**
     * Quilometragem do veículo no momento da manutenção.
     * É um número (Number) e não pode ser negativo.
     */
    quilometragem: {
        type: Number,
        min: [0, 'A quilometragem não pode ser negativa.'],
        // Opcional: Adicionar 'required: true' se for um campo obrigatório
    }
});

// Exporta o modelo 'Manutencao' para ser usado em outras partes da aplicação
module.exports = mongoose.model('Manutencao', manutencaoSchema);