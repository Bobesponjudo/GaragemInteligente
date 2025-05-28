// script.js (v7 - Organizanomeo e Comentado)

// =============================================================================
// === CLASSE Manutencao =======================================================
// =============================================================================


/**
 * Representa um registro de manutenção (passado ou agendado) para um veículo.
 */


// =============================================================================
// === CLASSE BASE Veiculo =====================================================
// =============================================================================

/**
 * Classe base para todos os veículos da garagem.
 */



// =============================================================================
// === CLASSE Carro (Herda de Veiculo) =========================================
// =============================================================================





// =============================================================================
// === CLASSE CarroEsportivo (Herda de Carro) ==================================
// =============================================================================




// =============================================================================
// === CLASSE Caminhao (Herda de Carro) ========================================
// =============================================================================





// =============================================================================
// === CLASSE Moto (Herda de Carro) ============================================
// =============================================================================



// =============================================================================
// === CLASSE Garagem (Gerenciador Principal) ==================================
// =============================================================================

/**
 * Gerencia a coleção de veículos, a persistência e a interação com a UI.
 */




// =============================================================================
// === INICIALIZAÇÃO ===========================================================
// =============================================================================

// Cria a instância da Garagem (o construtor já chama carregarGaragem)


// Executa quando o HTML da página estiver completamente carregado
const garagem = new Garagem();
console.log('[script.js] Instância da Garagem criada:', typeof garagem);

window.onload = () => {
    console.log('[script.js] window.onload iniciado. Verificando garagem:', typeof garagem);
    if (!garagem) {
        console.error("[script.js] ERRO FATAL DENTRO DE window.onload: 'garagem' ainda é undefined!");
        alert("Erro crítico ao inicializar a aplicação. Verifique o console.");
        return;
    }

    // --- INÍCIO: Lógica para o seletor de cidade do clima ---
    const cityInput = document.getElementById('cityInput');
    const searchWeatherBtn = document.getElementById('searchWeatherBtn');
    const weatherInfoDiv = document.getElementById('weather-info');

    if (searchWeatherBtn && cityInput && weatherInfoDiv) {
        searchWeatherBtn.addEventListener('click', () => {
            const cidade = cityInput.value.trim();
            if (cidade) {
                weatherInfoDiv.innerHTML = `⏳ Carregando clima para ${cidade}...`;
                garagem.carregarEExibirClima(cidade);
                // Opcional: disparar previsão padrão para nova cidade
                // garagem.carregarEExibirPrevisao(cidade, 3); // Ex: 3 dias
                const forecastInfoDiv = document.getElementById('forecast-info');
                if(forecastInfoDiv) forecastInfoDiv.innerHTML = `Selecione o número de dias para ver a previsão para ${cidade}.`;

            } else {
                alert("Por favor, digite o nome de uma cidade.");
            }
        });

        cityInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchWeatherBtn.click();
            }
        });
        // Carrega clima da cidade padrão no input (Campinas) ao iniciar
        garagem.carregarEExibirClima(cityInput.value.trim() || "Campinas");


    } else {
        console.warn("Elementos para busca de clima (cityInput, searchWeatherBtn ou weather-info) não encontrados.");
    }
    // --- FIM: Lógica para o seletor de cidade do clima ---

    // --- INÍCIO: Lógica para botões de previsão de N dias ---
    const forecastBtns = document.querySelectorAll('.forecast-days-btn');
    const forecastInfoDiv = document.getElementById('forecast-info'); // Já declarado acima, mas ok redeclarar no escopo

    if (forecastBtns.length > 0 && cityInput && forecastInfoDiv) {
        forecastBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cidade = cityInput.value.trim();
                const numDias = parseInt(btn.getAttribute('data-days'), 10);

                if (cidade && numDias) {
                    forecastInfoDiv.innerHTML = `⏳ Carregando previsão de ${numDias} dia(s) para ${cidade}...`;
                    garagem.carregarEExibirPrevisao(cidade, numDias);
                } else if (!cidade) {
                    alert("Por favor, digite o nome de uma cidade para ver a previsão.");
                    cityInput.focus();
                    forecastInfoDiv.innerHTML = `Digite uma cidade e selecione o número de dias para a previsão.`;
                }
            });
        });
        // Carregar uma previsão padrão (ex: 3 dias para a cidade no input) ao iniciar
        // setTimeout para dar chance ao clima atual carregar primeiro e evitar sobrecarga inicial.
        setTimeout(() => {
             const cidadeInicial = cityInput.value.trim() || "Campinas";
             if (cidadeInicial) { // Só carrega se houver cidade
                 forecastInfoDiv.innerHTML = `⏳ Carregando previsão de 3 dia(s) para ${cidadeInicial}...`;
                 garagem.carregarEExibirPrevisao(cidadeInicial, 3);
             }
        }, 1000);
    } else {
        console.warn("Elementos para botões de previsão (forecast-days-btn, cityInput ou forecast-info) não encontrados.");
    }
    // --- FIM: Lógica para botões de previsão de N dias ---

    if (Object.keys(garagem.veiculos).length === 0) {
        console.log("Garagem vazia. Criando veículos padrão...");
        garagem.criarCarro();
        garagem.criarMoto();
        garagem.criarCarroEsportivo();
        garagem.criarCaminhao();
        garagem.atualizarListaAgendamentos();
        garagem.exibirInformacoes('meuCarro');
    } else {
        console.log("Veículos carregados do localStorage. Atualizando UI completa.");
        garagem.atualizarUICompleta();
    }
    garagem.verificarAgendamentosProximos();
};
