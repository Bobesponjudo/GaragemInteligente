/**
 * Busca dados do clima para uma cidade específica chamando o NOSSO BACKEND.
 * @param {string} cidade - O nome da cidade (ex: "Campinas").
 * @returns {Promise<object|null>} Uma promessa que resolve com os dados do clima ou um objeto de erro.
 */
async function fetchWeatherData(cidade = "Campinas") {
    // Chama a rota /clima SEM o parâmetro 'tipo', para obter o clima atual
    const backendUrl = `clima?cidade=${encodeURIComponent(cidade)}`;

    console.log(`[WeatherService] Chamando backend para CLIMA ATUAL: ${backendUrl}`);

    try {
        const response = await fetch(backendUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error(`[WeatherService] Erro do backend ao buscar clima (${response.status}):`, data.error || data.message || response.statusText);
            const weatherDiv = document.getElementById('weather-info');
            if (weatherDiv) {
                weatherDiv.innerHTML = `<span style="color: red; font-weight: bold;">ERRO (Servidor):</span> ${data.error || data.message || 'Falha ao buscar clima.'}`;
            }
            return {
                cod: response.status,
                message: data.error || data.message || `Não foi possível obter o clima para ${cidade} (servidor).`
            };
        }

        console.log(`[WeatherService] Dados do CLIMA ATUAL recebidos do backend para ${cidade}:`, data);
        return data;

    } catch (error) {
        console.log(error);
        console.error("[WeatherService] Erro na requisição fetch para o backend (/clima - atual):", error);
        const weatherDiv = document.getElementById('weather-info');
        if (weatherDiv) {
            weatherDiv.innerHTML = `<span style="color: red; font-weight: bold;">ERRO:</span> Falha de comunicação com o servidor.`;
        }
        return {
            cod: 0,
            message: "Falha na comunicação com o servidor. Verifique sua conexão ou se o servidor está rodando."
        };
    }
}

/**
 * Busca dados da previsão do tempo para vários dias chamando o NOSSO BACKEND.
 * @param {string} cidade - O nome da cidade.
 * @param {number} numDays - Número de dias para a previsão (1, 3 ou 5). O frontend filtra.
 * @returns {Promise<object|null>} Uma promessa que resolve com os dados da previsão processados ou um objeto de erro.
 */
async function fetchForecastData(cidade = "Campinas", numDays = 3) {
    // Chama a rota /clima COM o parâmetro 'tipo=forecast', para obter a previsão
    const backendUrl = `clima?cidade=${encodeURIComponent(cidade)}&tipo=forecast`;

    console.log(`[WeatherService] Chamando backend para PREVISÃO: ${backendUrl}`);

    try {
        const response = await fetch(backendUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error(`[WeatherService] Erro do backend ao buscar previsão (${response.status}):`, data.error || data.message || response.statusText);
            return {
                cod: response.status,
                message: data.error || data.message || `Não foi possível obter a previsão para ${cidade} (servidor).`
            };
        }

        const dailyForecasts = [];
        const processedDates = new Set();

        if (data && data.list && Array.isArray(data.list)) {
            for (const item of data.list) {
                const forecastDate = item.dt_txt.substring(0, 10);
                if (!processedDates.has(forecastDate) && dailyForecasts.length < numDays) {
                    processedDates.add(forecastDate);
                    dailyForecasts.push(item);
                }
                if (dailyForecasts.length >= numDays) {
                    break;
                }
            }
        } else {
            console.error("[WeatherService] Resposta da API (via backend) para previsão não contém 'list' como um array:", data);
            return {
                cod: data.cod || 500,
                message: data.message || "Dados da previsão recebidos do servidor estão em formato inesperado ou são inválidos."
            };
        }

        console.log(`[WeatherService] Dados da PREVISÃO (do backend) processados para ${cidade} (${numDays} dias):`, dailyForecasts);
        return {
            cod: 200,
            city: data.city,
            list: dailyForecasts
        };

    } catch (error) {
        console.error("[WeatherService] Erro na requisição fetch para o backend (/clima - forecast):", error);
        return {
            cod: 0,
            message: "Falha na comunicação com o servidor para obter previsão. Verifique sua conexão."
        };
    } }