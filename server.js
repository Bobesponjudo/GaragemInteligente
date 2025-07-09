// ===================================================================
// server.js (VERSÃO COMPLETA E CORRIGIDA)
// ===================================================================

// Carrega as variáveis de ambiente do arquivo .env. Deve ser a primeira linha!
require('dotenv').config();

const express = require('express');
const axios =require('axios');
const path = require("path");
const fs = require('fs');
const cors = require('cors');
// Importa o cliente do MongoDB para conectar ao banco de dados
const { MongoClient } = require('mongodb');


// --- CONFIGURAÇÃO DO SERVIDOR E BANCO DE DADOS ---

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos da pasta 'public'
// Pega a string de conexão (URI) do arquivo .env
const mongoURI = process.env.MONGODB_URI;

// Validação CRÍTICA: Se a URI não estiver no .env, o programa não inicia.
if (!mongoURI) {
    console.error("\nERRO FATAL: A variável de ambiente MONGODB_URI não foi definida no arquivo .env");
    console.error("Verifique se o arquivo .env existe na raiz do projeto e contém a linha MONGODB_URI=mongodb+srv://...\n");
    process.exit(1); // Encerra a aplicação
}

// Cria uma nova instância do cliente do MongoDB
const client = new MongoClient(mongoURI);

// Variável global para manter a referência da conexão com o banco de dados
let db;

app.use(express.static(__dirname));
// --- LÓGICA DE PERSISTÊNCIA DAS DICAS (usando arquivo JSON) ---

const DICAS_FILE_PATH = path.join(__dirname, 'dicas.json');

// Função para carregar as dicas do arquivo JSON
const carregarDicas = () => {
    try {
        if (fs.existsSync(DICAS_FILE_PATH)) {
            const data = fs.readFileSync(DICAS_FILE_PATH, 'utf-8');
            return JSON.parse(data);
        }
        return []; // Retorna array vazio se o arquivo não existir
    } catch (error) {
        console.error("Erro ao carregar o arquivo de dicas:", error);
        return []; // Retorna array vazio em caso de erro
    }
};

// Função para salvar as dicas no arquivo JSON
const salvarDicas = (dicas) => {
    try {
        // Usa null, 2 para formatar o JSON de forma legível
        fs.writeFileSync(DICAS_FILE_PATH, JSON.stringify(dicas, null, 2), 'utf-8');
        console.log("[Servidor] Dicas salvas no arquivo com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar o arquivo de dicas:", error);
    }
};

// Carrega as dicas na inicialização do servidor
let dicasVeiculos = carregarDicas();


// --- MIDDLEWARES (Configurações do Express) ---

// Habilita CORS para permitir que o frontend (rodando em outra porta/domínio) acesse a API
app.use(cors());
// Habilita o Express para interpretar corpos de requisição em formato JSON
app.use(express.json());
// Serve os arquivos estáticos (HTML, CSS, JS do frontend) da pasta raiz do projeto
app.use(express.static(__dirname));


// --- FUNÇÃO PARA CONECTAR AO MONGODB ---

// Esta função assíncrona tenta se conectar ao MongoDB Atlas
async function connectDB() {
    try {
        await client.connect();
        db = client.db();
        console.log(`Conectado com sucesso ao MongoDB: ${db.databaseName}!`);
    } catch (err) {
        console.error("Falha grave ao conectar ao MongoDB.", err);
        process.exit(1);
    }
}

// --- ROTAS DA API ---

// Rota para buscar os serviços oferecidos (agora do MongoDB)
app.get('/api/garagem/servicos-oferecidos', async (req, res) => {
    try {
        // Busca todos os documentos na coleção 'servicos' e os transforma em um array
        const servicos = await db.collection('servicos').find({}).toArray();
        res.json(servicos);
    } catch (error) {
        console.error("Erro ao buscar serviços no MongoDB:", error);
        res.status(500).json({ message: "Erro interno ao buscar serviços." });
    }
});

// Rota para buscar os problemas de diagnóstico (agora do MongoDB)
app.get('/api/garagem/diagnostico', async (req, res) => {
    try {
        const problemas = await db.collection('problemas').find({}).toArray();
        res.json(problemas);
    } catch (error) {
        console.error("Erro ao buscar problemas de diagnóstico no MongoDB:", error);
        res.status(500).json({ message: "Erro interno ao buscar diagnósticos." });
    }
});


// --- Rotas que ainda usam dados locais (para manter o exemplo) ---

const destinosPopulares = [
    { destino: "Tóquio", pais: "Japão", descricao: "Uma metrópole vibrante...", imagem_url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=500&q=80" },
    { destino: "Paris", pais: "França", descricao: "A cidade do amor...", imagem_url: "https://res.cloudinary.com/dtljonz0f/image/upload/c_auto,ar_1:1,w_3840,g_auto/f_auto/q_auto/v1/gc-v1/paris/3%20giorni%20a%20Parigi%20Tour%20Eiffel?_a=BAVAZGE70" },
    { destino: "Rio de Janeiro", pais: "Brasil", descricao: "Conhecida por suas praias...", imagem_url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=500&q=80" },
    { destino: "Kyoto", pais: "Japão", descricao: "A antiga capital imperial...", imagem_url: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=500&q=80" }
];
app.get('/api/viagens-populares', (req, res) => {
    res.json(destinosPopulares);
});

// Rota para buscar uma dica específica (do arquivo dicas.json)
app.get('/api/dicas/:modelo', (req, res) => {
    const { modelo } = req.params;
    const dica = dicasVeiculos.find(d => d.modelo.toLowerCase() === modelo.toLowerCase());
    
    if (dica) {
        res.json(dica);
    } else {
        res.status(404).json({ message: "Nenhuma dica encontrada para este modelo." });
    }
});

// Rota para criar uma nova dica (no arquivo dicas.json)
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

// Rota para atualizar uma dica existente (no arquivo dicas.json)
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

// Chama a função para conectar ao banco de dados e, APENAS SE a conexão for bem-sucedida,
// inicia o servidor Express para ouvir as requisições na porta definida.
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando! Acesse sua aplicação em: http://localhost:${PORT}`);
    });
});