// server.js (Solução Recomendada)

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require("path");

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const apiKey = process.env.OPENWEATHER_API_KEY;

// 1. Habilita o CORS para todas as requisições
app.use(cors());

// 2. Define as rotas da API
// Rota de Viagens Populares
app.get('/api/viagens-populares', (req, res) => {
    console.log("[Servidor] Rota /api/viagens-populares acessada.");
    const destinosPopulares = [
        {
            destino: "Tóquio",
            pais: "Japão",
            descricao: "Uma metrópole vibrante onde a tradição milenar encontra a tecnologia futurista.",
            imagem_url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=500&q=80"
        },
        {
            destino: "Paris",
            pais: "França",
            descricao: "A cidade do amor, famosa por sua arte, gastronomia e monumentos icônicos.",
            imagem_url: "https://res.cloudinary.com/dtljonz0f/image/upload/c_auto,ar_1:1,w_3840,g_auto/f_auto/q_auto/v1/gc-v1/paris/3%20giorni%20a%20Parigi%20Tour%20Eiffel?_a=BAVAZGE70"
        },
        {
            destino: "Rio de Janeiro",
            pais: "Brasil",
            descricao: "Conhecida por suas praias, o Cristo Redentor e a energia contagiante do carnaval.",
            imagem_url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=500&q=80"
        },
        {
            destino: "Kyoto",
            pais: "Japão",
            descricao: "A antiga capital imperial, repleta de templos, jardins zen e gueixas.",
            imagem_url: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=500&q=80"
        }
    ];
    res.json(destinosPopulares);
});

// Rota do Clima
app.get('/clima', async (req, res) => {
    // ... (código da rota do clima continua o mesmo)
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

// 3. Serve os arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));


// 4. Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});