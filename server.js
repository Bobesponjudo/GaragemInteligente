// server.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require("path");

const app = express();
const cors = require('cors'); // Importe o pacote cors
const PORT = process.env.PORT || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY;

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
// Rota UNIFICADA para clima atual E previsão
app.get('/clima', async (req, res) => {
      const cidade = req.query.cidade;
    const tipoRequisicao = req.query.tipo; // Novo: 'forecast' ou undefined/outro para atual

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }

    let url;
    let logMessagePrefix;

    if (tipoRequisicao === 'forecast') {
        // Requisição de PREVISÃO
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
        logMessagePrefix = `[Servidor] Buscando PREVISÃO para ${cidade}`;
    } else {
        // Requisição de CLIMA ATUAL (padrão)
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;
        logMessagePrefix = `[Servidor] Buscando CLIMA ATUAL para ${cidade}`;
    }

    try {
        console.log(`${logMessagePrefix}: ${url.replace(apiKey, "CHAVE_OCULTA")}`);
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const message = error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message;
        console.error(`${logMessagePrefix} - Erro: ${status} - ${message}`);
        res.status(status).json({
            error: `Erro ao buscar dados (${tipoRequisicao === 'forecast' ? 'previsão' : 'clima atual'}).`,
            details: message
        });
    }
}) 
;

// Rota principal para servir o index.html (opcional, pois express.static já faz isso se index.html estiver na raiz de 'public')
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Servidor da Garagem Inteligente rodando em http://localhost:${PORT}`);
    // if (!apiKey) {
    //     console.warn("AVISO: A variável de ambiente OPENWEATHER_API_KEY não está definida.");
    // } else {
    //     console.log("Chave da API OpenWeatherMap carregada com sucesso no servidor.");
    // }
    
    const apiKey = process.env.OPENWEATHER_API_KEY; // <
    
});