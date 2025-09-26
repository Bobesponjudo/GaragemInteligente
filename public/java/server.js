// ===================================================================
// server.js (VERSÃO COMPLETA E CORRIGIDA COM AUTENTICAÇÃO E AUTORIZAÇÃO)
// ===================================================================

// Carrega as variáveis de ambiente do arquivo .env. Deve ser a primeira linha!
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require("path");
const fs = require('fs');
const cors = require('cors');
// Importa o Mongoose para modelagem de dados do MongoDB
const mongoose = require('mongoose');

// Importa os modelos que criamos. 
const Veiculo = require('./models/Veiculo');
const Servico = require('./models/Servico');
const Problema = require('./models/Problema');
const Manutencao = require('./models/Manutencao'); 
const User = require('./models/User'); 
const authRoutes = require('./routes/auth');

// NOVO: Importa o middleware de autenticação
const authMiddleware = require('./middleware/auth');


// --- CONFIGURAÇÃO DO SERVIDOR ---

const app = express();
const PORT = process.env.PORT || 3000;
// Pega a string de conexão (URI) do arquivo .env
const mongoURI = process.env.MONGODB_URI;

// Validação CRÍTICA: Se a URI não estiver no .env, o programa não inicia.
if (!mongoURI) {
    console.error("\nERRO FATAL: A variável de ambiente MONGODB_URI não foi definida no arquivo .env");
    console.error("Verifique se o arquivo .env existe na raiz do projeto e contém a linha MONGODB_URI=mongodb+srv://...\n");
    process.exit(1); // Encerra a aplicação
}

// --- MIDDLEWARES (Configurações do Express) ---

app.use(cors());
app.use(express.json()); // Habilita o Express para interpretar corpos de requisição em formato JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));


// --- LÓGICA DE PERSISTÊNCIA DAS DICAS (usando arquivo JSON) ---

const DICAS_FILE_PATH = path.join(__dirname, 'dicas.json');

const carregarDicas = () => {
    try {
        if (fs.existsSync(DICAS_FILE_PATH)) {
            const data = fs.readFileSync(DICAS_FILE_PATH, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error("Erro ao carregar o arquivo de dicas:", error);
        return [];
    }
};

const salvarDicas = (dicas) => {
    try {
        fs.writeFileSync(DICAS_FILE_PATH, JSON.stringify(dicas, null, 2), 'utf-8');
        console.log("[Servidor] Dicas salvas no arquivo com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar o arquivo de dicas:", error);
    }
};

let dicasVeiculos = carregarDicas();


// --- FUNÇÃO PARA CONECTAR AO MONGODB USANDO MONGOOSE ---

async function connectDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Conectado com sucesso ao MongoDB via Mongoose!");
    } catch (err) {
        console.error("Falha grave ao conectar ao MongoDB com Mongoose.", err);
        process.exit(1);
    }
}


// --- ROTAS DA API ---

// Rotas de Autenticação
app.use('/api/auth', authRoutes);


// Rota para buscar os serviços oferecidos (Não precisa de autenticação)
app.get('/api/garagem/servicos-oferecidos', async (req, res) => {
    try {
        const servicos = await Servico.find({});
        res.json(servicos);
    } catch (error) {
        console.error("Erro ao buscar serviços no MongoDB:", error);
        res.status(500).json({ message: "Erro interno ao buscar serviços." });
    }
});

// Rota para buscar os problemas de diagnóstico (Não precisa de autenticação)
app.get('/api/garagem/diagnostico', async (req, res) => {
    try {
        const problemas = await Problema.find({});
        res.json(problemas);
    } catch (error) {
        console.error("Erro ao buscar problemas de diagnóstico no MongoDB:", error);
        res.status(500).json({ message: "Erro interno ao buscar diagnósticos." });
    }
});


// --- ROTAS CRUD PROTEGIDAS PARA VEICULOS USANDO MONGOOSE ---

/**
 * @route   POST /api/veiculos
 * @desc    Criar um novo veículo (Protegido)
 * @access  Private
 */
app.post('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        const novoVeiculoData = req.body;
        // O campo 'owner' é setado automaticamente pelo userId do token
        novoVeiculoData.owner = req.userId; 

        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        console.log('[Servidor] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado); 

    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        }
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

/**
 * @route   GET /api/veiculos
 * @desc    Ler (buscar) todos os veículos do usuário autenticado (Protegido)
 * @access  Private
 */
app.get('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        // FILTRA APENAS VEÍCULOS ONDE owner É IGUAL AO userId DO TOKEN
        const todosOsVeiculos = await Veiculo.find({ owner: req.userId }); 
        console.log(`[Servidor] Buscando veículos do usuário ${req.userId} no DB.`);
        res.json(todosOsVeiculos);

    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

/**
 * @route   GET /api/veiculos/:id
 * @desc    Ler (buscar) um único veículo pelo seu ID (Protegido)
 * @access  Private
 */
app.get('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        // BUSCA O VEÍCULO E VERIFICA SE ELE PERTENCE AO USUÁRIO AUTENTICADO
        const veiculo = await Veiculo.findOne({ 
            _id: req.params.id, 
            owner: req.userId 
        });
        
        if (!veiculo) {
            // Retorna 404 se não encontrado OU se pertencer a outro usuário (evita vazar informação)
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        console.log(`[Servidor] Veículo com ID ${req.params.id} encontrado.`);
        res.json(veiculo);
    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículo por ID:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'ID de veículo inválido.' });
        }
        res.status(500).json({ error: 'Erro interno ao buscar veículo.' });
    }
});


/**
 * @route   PUT /api/veiculos/:id
 * @desc    Atualizar um veículo existente (Protegido)
 * @access  Private
 */
app.put('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;
        // Impedir que o usuário tente mudar o dono
        delete dadosAtualizados.owner; 

        const veiculoAtualizado = await Veiculo.findOneAndUpdate(
            { _id: id, owner: req.userId }, // Condição: ID bate E pertence ao usuário
            dadosAtualizados, 
            { 
                new: true,
                runValidators: true
            }
        );

        if (!veiculoAtualizado) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você.' });
        }

        console.log('[Servidor] Veículo atualizado com sucesso:', veiculoAtualizado);
        res.json(veiculoAtualizado);

    } catch (error) {
        console.error("[Servidor] Erro ao atualizar veículo:", error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'ID de veículo inválido.' });
        }
        res.status(500).json({ error: 'Erro interno ao atualizar veículo.' });
    }
});


/**
 * @route   DELETE /api/veiculos/:id
 * @desc    Excluir um veículo (Protegido)
 * @access  Private
 */
app.delete('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Exclui o veículo apenas se ele pertencer ao usuário autenticado
        const veiculoExcluido = await Veiculo.findOneAndDelete({ 
            _id: id, 
            owner: req.userId 
        });

        if (!veiculoExcluido) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você.' });
        }

        // Excluir manutenções associadas
        await Manutencao.deleteMany({ veiculo: id });
        console.log(`[Servidor] Manutenções do veículo ${id} também foram excluídas.`);


        console.log('[Servidor] Veículo excluído com sucesso:', veiculoExcluido);
        res.json({ message: `Veículo com placa ${veiculoExcluido.placa} foi excluído com sucesso.` });

    } catch (error) {
        console.error("[Servidor] Erro ao excluir veículo:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'ID de veículo inválido.' });
        }
        res.status(500).json({ error: 'Erro interno ao excluir veículo.' });
    }
});

// ===================================================================
// === ROTAS PARA MANUTENÇÃO (Também protegidas) ======================
// ===================================================================

/**
 * @route   POST /api/veiculos/:veiculoId/manutencoes
 * @desc    Adicionar um novo registro de manutenção a um veículo (Protegido)
 * @access  Private
 */
app.post('/api/veiculos/:veiculoId/manutencoes', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;

        // 1. Validar se o veículo existe E se pertence ao usuário
        const veiculo = await Veiculo.findOne({ _id: veiculoId, owner: req.userId });
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você. Impossível adicionar manutenção.' });
        }

        // 2. Criar e salvar a nova manutenção.
        const manutencaoData = {
            ...req.body,
            veiculo: veiculoId // Garante a associação correta
        };

        const novaManutencao = await Manutencao.create(manutencaoData);
        
        res.status(201).json(novaManutencao);

    } catch (error) {
        console.error("Erro ao salvar manutenção:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao salvar a manutenção.' });
    }
});


/**
 * @route   GET /api/veiculos/:veiculoId/manutencoes
 * @desc    Listar todos os registros de manutenção de um veículo (Protegido)
 * @access  Private
 */
app.get('/api/veiculos/:veiculoId/manutencoes', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;

        // 1. Validar se o veículo existe E se pertence ao usuário
        const veiculo = await Veiculo.findOne({ _id: veiculoId, owner: req.userId });
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você.' });
        }
        
        // 2. Buscar todas as manutenções para o veículoId
        const manutenoces = await Manutencao.find({ veiculo: veiculoId })
                                            .sort({ data: -1 });

        res.status(200).json(manutenoces);

    } catch (error) {
        console.error("Erro ao buscar manutenções do veículo:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar as manutenções.' });
    }
});


// --- Rotas que ainda usam dados locais (SEM PROTEÇÃO, pois são dados públicos/genéricos) ---

const destinosPopulares = [
    { destino: "Tóquio", pais: "Japão", descricao: "Uma metrópole vibrante...", imagem_url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=500&q=80" },
    { destino: "Paris", pais: "França", descricao: "A cidade do amor...", imagem_url: "https://res.cloudinary.com/dtljonz0f/image/upload/c_auto,ar_1:1,w_3840,g_auto/f_auto/q_auto/v1/gc-v1/paris/3%20giorni%20a%20Parigi%20Tour%20Eiffel?_a=BAVAZGE70" },
    { destino: "Rio de Janeiro", pais: "Brasil", descricao: "Conhecida por suas praias...", imagem_url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=500&q=80" },
    { destino: "Kyoto", pais: "Japão", descricao: "A antiga capital imperial...", imagem_url: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=500&q=80" }
];
app.get('/api/viagens-populares', (req, res) => {
    res.json(destinosPopulares);
});

// Rotas de Dicas (Geralmente são públicas, mas podem ser protegidas se a regra for diferente)
app.get('/api/dicas/:modelo', (req, res) => {
    const { modelo } = req.params;
    const dica = dicasVeiculos.find(d => d.modelo.toLowerCase() === modelo.toLowerCase());
    
    if (dica) {
        res.json(dica);
    } else {
        res.status(404).json({ message: "Nenhuma dica encontrada para este modelo." });
    }
});

app.post('/api/dicas', (req, res) => {
    const { modelo, dica, autor } = req.body;
    if (!modelo || !dica) return res.status(400).json({ message: "Modelo e Dica são obrigatórios." });
    
    const existe = dicasVeiculos.some(d => d.modelo.toLowerCase() === modelo.toLowerCase());
    if (existe) return res.status(409).json({ message: "Já existe uma dica para este modelo. Use a edição." });

    const novaDica = { modelo: modelo.trim(), dica: dica.trim(), autor: autor.trim() || "Anônimo" };
    dicasVeiculos.push(novaDica);
    salvarDicas(dicasVeiculos);
    res.status(201).json(novaDica);
});

app.put('/api/dicas/:modelo', (req, res) => {
    const { modelo } = req.params;
    const { dica, autor } = req.body;
    if (!dica) return res.status(400).json({ message: "O campo Dica é obrigatório." });

    const index = dicasVeiculos.findIndex(d => d.modelo.toLowerCase() === modelo.toLowerCase());
    if (index === -1) return res.status(404).json({ message: "Modelo não encontrado para edição." });

    dicasVeiculos[index].dica = dica.trim();
    dicasVeiculos[index].autor = autor.trim() || "Anônimo";
    salvarDicas(dicasVeiculos);
    res.json(dicasVeiculos[index]);
});

// Rota do Clima (que chama uma API externa)
app.get('/clima', async (req, res) => {
    const cidade = req.query.cidade;
    const tipoRequisicao = req.query.tipo;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) return res.status(500).json({ error: 'Chave da API de clima não configurada no servidor.' });

    const url = tipoRequisicao === 'forecast'
        ? `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`
        : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const message = error.response?.data?.message || error.message;
        res.status(status).json({ error: 'Erro ao buscar dados do clima.', details: message });
    }
});


// --- INICIALIZAÇÃO DO SERVIDOR ---

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando! Acesse sua aplicação em: http://localhost:${PORT}`);
        // Aviso sobre a chave secreta para teste
        if (process.env.JWT_SECRET === 'SEU_SEGREDO_SUPER_SECRETO') {
            console.warn("\n!!! AVISO DE SEGURANÇA !!!");
            console.warn("A variável JWT_SECRET está usando o valor padrão. POR FAVOR, defina-a no seu arquivo .env para um valor secreto forte.");
            console.warn("***************************\n");
        }
    });
});