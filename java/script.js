// script.js (CORRIGIDO E COMPLETO)

// =============================================================================
// === FUNÇÕES GLOBAIS DA APLICAÇÃO ============================================
// =============================================================================

/**
 * Busca e exibe os serviços oferecidos pela garagem.
 */
async function carregarServicosOferecidos() {
    console.log("[Serviços] Tentando carregar serviços oferecidos...");
    const listaServicosDiv = document.getElementById('lista-servicos');
    if (!listaServicosDiv) {
        console.error("[Serviços] Elemento 'lista-servicos' não encontrado no HTML.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/garagem/servicos-oferecidos');
        if (!response.ok) {
            throw new Error(`Erro na API de serviços: ${response.statusText}`);
        }
        const servicos = await response.json();

        listaServicosDiv.innerHTML = ''; // Limpa a mensagem de "carregando"

        if (servicos.length === 0) {
            listaServicosDiv.innerHTML = '<p>Nenhum serviço oferecido no momento.</p>';
            return;
        }

        servicos.forEach(servico => {
            const card = document.createElement('div');
            card.className = 'servico-card'; // Classe para estilização
            card.innerHTML = `
                <h3>${servico.nome}</h3>
                <p>${servico.descricao}</p>
            `;
            listaServicosDiv.appendChild(card);
        });
        console.log("[Serviços] Serviços carregados e exibidos com sucesso.");

    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        listaServicosDiv.innerHTML = '<p style="color: red;">Não foi possível carregar os serviços. Verifique a conexão com o servidor.</p>';
    }
}


/**
 * Busca e exibe destinos de viagem populares da API do nosso servidor.
 */
async function carregarViagensPopulares() {
    console.log("[Viagens] Tentando carregar destinos populares...");
    const listaViagensDiv = document.getElementById('lista-viagens');
    if (!listaViagensDiv) {
        console.error("[Viagens] Elemento 'lista-viagens' não encontrado no HTML.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/viagens-populares');
        if (!response.ok) {
            throw new Error(`Erro na API de viagens: ${response.statusText}`);
        }
        const viagens = await response.json();

        listaViagensDiv.innerHTML = ''; // Limpa a mensagem de "carregando"

        if (viagens.length === 0) {
            listaViagensDiv.innerHTML = '<p>Nenhum destino popular encontrado no momento.</p>';
            return;
        }

        viagens.forEach(viagem => {
            const card = document.createElement('div');
            card.className = 'viagem-card';

            card.innerHTML = `
                <img src="${viagem.imagem_url}" alt="Foto de ${viagem.destino}">
                <h3>${viagem.destino}</h3>
                <p class="pais">${viagem.pais}</p>
                <p>${viagem.descricao}</p>
            `;
            listaViagensDiv.appendChild(card);
        });
        console.log("[Viagens] Destinos carregados e exibidos com sucesso.");

    } catch (error) {
        console.error("Erro ao carregar viagens populares:", error);
        listaViagensDiv.innerHTML = '<p style="color: red;">Não foi possível carregar os destinos. Verifique a conexão com o servidor e tente novamente.</p>';
    }
}


// =============================================================================
// === INICIALIZAÇÃO ===========================================================
// =============================================================================

// Cria a instância da Garagem (o construtor já chama carregarGaragem)
const garagem = new Garagem();
console.log('[script.js] Instância da Garagem criada:', typeof garagem);

window.onload = () => {
    console.log('[script.js] window.onload iniciado. Verificando garagem:', typeof garagem);
    if (!garagem) {
        console.error("[script.js] ERRO FATAL DENTRO DE window.onload: 'garagem' ainda é undefined!");
        alert("Erro crítico ao inicializar a aplicação. Verifique o console.");
        return;
    }

    // --- CARREGA DADOS DAS APIS ---
    carregarViagensPopulares();
    carregarServicosOferecidos();

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
                const forecastInfoDiv = document.getElementById('forecast-info');
                if (forecastInfoDiv) forecastInfoDiv.innerHTML = `Selecione o número de dias para ver a previsão para ${cidade}.`;

            } else {
                alert("Por favor, digite o nome de uma cidade.");
            }
        });

        cityInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchWeatherBtn.click();
            }
        });
        garagem.carregarEExibirClima(cityInput.value.trim());

    } else {
        console.warn("Elementos para busca de clima (cityInput, searchWeatherBtn ou weather-info) não encontrados.");
    }
    // --- FIM: Lógica para o seletor de cidade do clima ---

    // --- INÍCIO: Lógica para botões de previsão de N dias ---
    const forecastBtns = document.querySelectorAll('.forecast-days-btn');
    const forecastInfoDiv = document.getElementById('forecast-info');

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
        setTimeout(() => {
            const cidadeInicial = cityInput.value.trim();
            if (cidadeInicial) {
                forecastInfoDiv.innerHTML = `⏳ Carregando previsão de 3 dia(s) para ${cidadeInicial}...`;
                garagem.carregarEExibirPrevisao(cidadeInicial, 3);
            }
        }, 1000);
    } else {
        console.warn("Elementos para botões de previsão (forecast-days-btn, cityInput ou forecast-info) não encontrados.");
    }
    // --- FIM: Lógica para botões de previsão de N dias ---

    // --- INÍCIO: LÓGICA PARA DICAS DA COMUNIDADE ---
    const buscarDicaBtn = document.getElementById('buscarDicaBtn');
    const dicaModeloInput = document.getElementById('dicaModeloInput');
    const dicaModal = document.getElementById('dicaModal');
    const closeDicaModal = document.getElementById('closeDicaModal');
    const dicaForm = document.getElementById('dicaForm');

    // Função para abrir o modal em modo 'add' ou 'edit'
    const abrirModalDica = (modo, dados) => {
        const modalTitle = document.getElementById('dicaModalTitle');
        const formModo = document.getElementById('dicaFormModo');
        const formModelo = document.getElementById('dicaFormModelo');
        const formTexto = document.getElementById('dicaFormTexto');
        const formAutor = document.getElementById('dicaFormAutor');

        formModo.value = modo;
        formModelo.value = dados.modelo;

        if (modo === 'edit') {
            modalTitle.textContent = `Editar Dica para ${dados.modelo}`;
            formTexto.value = dados.dica;
            formAutor.value = dados.autor;
        } else { // modo 'add'
            modalTitle.textContent = `Adicionar Dica para ${dados.modelo}`;
            formTexto.value = '';
            formAutor.value = '';
        }
        dicaModal.style.display = 'block';
    };

    // Função para fechar o modal
    const fecharModalDica = () => {
        dicaModal.style.display = 'none';
        dicaForm.reset();
    };
    
    // Evento no botão de busca
    buscarDicaBtn.addEventListener('click', async () => {
        const modelo = dicaModeloInput.value.trim();
        if (!modelo) {
            alert("Por favor, digite um modelo de veículo.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/dicas/${encodeURIComponent(modelo)}`);
            if (response.ok) { // Encontrou dica (status 200)
                const dica = await response.json();
                abrirModalDica('edit', dica);
            } else if (response.status === 404) { // Não encontrou
                if (confirm(`Nenhuma dica encontrada para "${modelo}". Deseja adicionar uma?`)) {
                    abrirModalDica('add', { modelo: modelo });
                }
            } else {
                throw new Error(`Erro do servidor: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Erro ao buscar dica:", error);
            alert("Não foi possível buscar a dica. Verifique a conexão com o servidor.");
        }
    });

    // Evento para salvar o formulário do modal
    dicaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const modo = document.getElementById('dicaFormModo').value;
        const modelo = document.getElementById('dicaFormModelo').value;
        const dica = document.getElementById('dicaFormTexto').value;
        const autor = document.getElementById('dicaFormAutor').value;
        
        const url = `http://localhost:3000/api/dicas${modo === 'edit' ? '/' + encodeURIComponent(modelo) : ''}`;
        const method = modo === 'edit' ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelo, dica, autor }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Dica ${modo === 'edit' ? 'atualizada' : 'adicionada'} com sucesso!`);
                fecharModalDica();
            } else {
                throw new Error(result.message || "Ocorreu um erro no servidor.");
            }
        } catch (error) {
            console.error("Erro ao salvar dica:", error);
            alert(`Erro ao salvar: ${error.message}`);
        }
    });

    // Eventos para fechar o modal
    closeDicaModal.addEventListener('click', fecharModalDica);
    window.addEventListener('click', (event) => {
        if (event.target === dicaModal) {
            fecharModalDica();
        }
    });
    // --- FIM: LÓGICA PARA DICAS DA COMUNIDADE ---


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