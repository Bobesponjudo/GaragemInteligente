// server.js (Solução Recomendada)

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require("path");
const fs = require('fs'); // <-- NOVO: Módulo para interagir com arquivos

// --- BANCO DE DADOS SIMULADO (CONSTANTES E VARIÁVEIS) ---

const servicosOferecidos = [
    { id: "s01", nome: "Troca de Óleo", descricao: "Troca completa de óleo do motor e filtro de óleo. Usamos óleos sintéticos e semissintéticos de alta qualidade." },
    { id: "s02", nome: "Alinhamento e Balanceamento", descricao: "Ajuste preciso da geometria das rodas e balanceamento para evitar desgastes irregulares e trepidação." },
    { id: "s03", nome: "Revisão de Freios", descricao: "Inspeção e substituição de pastilhas, discos e fluido de freio para garantir sua segurança." },
    { id: "s04", nome: "Pintura Personalizada", descricao: "Serviços de pintura automotiva, de pequenos retoques a mudanças completas de cor com acabamento profissional." },
    { id: "s05", nome: "Manutenção de Motor", descricao: "Diagnóstico e reparo de problemas no motor, incluindo sistema de injeção, velas e correias." }
];

const destinosPopulares = [
    { destino: "Tóquio", pais: "Japão", descricao: "Uma metrópole vibrante onde a tradição milenar encontra a tecnologia futurista.", imagem_url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=500&q=80" },
    { destino: "Paris", pais: "França", descricao: "A cidade do amor, famosa por sua arte, gastronomia e monumentos icônicos.", imagem_url: "https://res.cloudinary.com/dtljonz0f/image/upload/c_auto,ar_1:1,w_3840,g_auto/f_auto/q_auto/v1/gc-v1/paris/3%20giorni%20a%20Parigi%20Tour%20Eiffel?_a=BAVAZGE70" },
    { destino: "Rio de Janeiro", pais: "Brasil", descricao: "Conhecida por suas praias, o Cristo Redentor e a energia contagiante do carnaval.", imagem_url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=500&q=80" },
    { destino: "Kyoto", pais: "Japão", descricao: "A antiga capital imperial, repleta de templos, jardins zen e gueixas.", imagem_url: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=500&q=80" }
];

// NOVO: Mapeia problemas comuns a um ID de serviço oferecido
const problemasComuns = [
    { id: "p01", problema: "Motor falhando ou com perda de potência", servicoId: "s05" },
    { id: "p02", problema: "Barulho ou chiado ao frear", servicoId: "s03" },
    { id: "p03", problema: "Veículo puxando para um lado ou volante torto", servicoId: "s02" },
    { id: "p04", problema: "Vibração no volante em altas velocidades", servicoId: "s02" },
    { id: "p05", problema: "Pintura arranhada, desbotada ou danificada", servicoId: "s04" },
    { id: "p06", problema: "Luz de óleo acesa ou troca de óleo necessária", servicoId: "s01" },
    { id: "p07", problema: "Dificuldade para ligar o motor", servicoId: "s05" },
];


// --- LÓGICA DE PERSISTÊNCIA DAS DICAS ---
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


// --- CONFIGURAÇÃO DO SERVIDOR ---

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY;

// 1. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. Rotas da API

// Rota para buscar uma dica específica
app.get('/api/dicas/:modelo', (req, res) => {
    const { modelo } = req.params;
    const dica = dicasVeiculos.find(d => d.modelo.toLowerCase() === modelo.toLowerCase());
    
    if (dica) {
        res.json(dica);
    } else {
        res.status(404).json({ message: "Nenhuma dica encontrada para este modelo." });
    }
});

// Rota para criar uma nova dica
app.post('/api/dicas', (req, res) => {
    const { modelo, dica, autor } = req.body;

    if (!modelo || !dica) {
        return res.status(400).json({ message: "Modelo e Dica são campos obrigatórios." });
    }
    
    const existe = dicasVeiculos.some(d => d.modelo.toLowerCase() === modelo.toLowerCase());
    if (existe) {
        return res.status(409).json({ message: "Já existe uma dica para este modelo. Use a edição." });
    }

    const novaDica = { modelo: modelo.trim(), dica: dica.trim(), autor: autor.trim() || "Anônimo" };
    dicasVeiculos.push(novaDica);
    salvarDicas(dicasVeiculos); // <-- ALTERADO: Salva no arquivo
    
    console.log("[Servidor] Nova dica adicionada:", novaDica);
    res.status(201).json(novaDica);
});

// Rota para atualizar uma dica existente
app.put('/api/dicas/:modelo', (req, res) => {
    const { modelo } = req.params;
    const { dica, autor } = req.body;

    if (!dica) {
        return res.status(400).json({ message: "O campo Dica é obrigatório para edição." });
    }

    const index = dicasVeiculos.findIndex(d => d.modelo.toLowerCase() === modelo.toLowerCase());

    if (index === -1) {
        return res.status(404).json({ message: "Modelo não encontrado para edição." });
    }

    dicasVeiculos[index].dica = dica.trim();
    dicasVeiculos[index].autor = autor.trim() || "Anônimo";
    salvarDicas(dicasVeiculos); // <-- ALTERADO: Salva no arquivo
    
    console.log("[Servidor] Dica atualizada:", dicasVeiculos[index]);
    res.json(dicasVeiculos[index]);
});

// NOVO: Rota para obter a lista de problemas de diagnóstico
app.get('/api/garagem/diagnostico', (req, res) => {
    console.log("[Servidor] Rota /api/garagem/diagnostico acessada.");
    res.json(problemasComuns);
});

// Rota de Serviços Oferecidos
app.get('/api/garagem/servicos-oferecidos', (req, res) => {
    console.log("[Servidor] Rota /api/garagem/servicos-oferecidos acessada.");
    res.json(servicosOferecidos);
});

// Rota de Viagens Populares
app.get('/api/viagens-populares', (req, res) => {
    console.log("[Servidor] Rota /api/viagens-populares acessada.");
    res.json(destinosPopulares);
});

// Rota do Clima
app.get('/clima', async (req, res) => {
    const cidade = req.query.cidade;
    const tipoRequisicao = req.query.tipo;

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API não configurada.' });
    }

    let url;
    if (tipoRequisicao === 'forecast') {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
    }

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const message = error.response?.data?.message || error.message;
        res.status(status).json({ error: 'Erro ao buscar dados do clima.', details: message });
    }
});


// 3. Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});