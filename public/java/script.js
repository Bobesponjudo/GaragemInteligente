// script.js (CORRIGIDO E COMPLETO COM API)

// =============================================================================
// === FUNÇÕES GLOBAIS DA APLICAÇÃO ============================================
// =============================================================================

/**
 * NOVA FUNÇÃO: Busca veículos da API e os exibe na tela.
 */
async function fetchAndDisplayVehicles() {
    console.log("[API] Buscando veículos do banco de dados...");
    const listContainer = document.getElementById('db-vehicle-list');
    if (!listContainer) return;

    try {
        const response = await fetch('http://localhost:3000/api/veiculos');
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.statusText}`);
        }
        const vehicles = await response.json();

        listContainer.innerHTML = ''; // Limpa a lista atual

        if (vehicles.length === 0) {
            listContainer.innerHTML = '<p>Nenhum veículo registrado no banco de dados ainda.</p>';
            return;
        }

        vehicles.forEach(vehicle => {
            const card = document.createElement('div');
            card.className = 'db-vehicle-card'; // Classe para estilização
            card.innerHTML = `
                <h4>${vehicle.marca} ${vehicle.modelo} (${vehicle.ano})</h4>
                <p><strong>Placa:</strong> ${vehicle.placa}</p>
                <p><strong>Cor:</strong> ${vehicle.cor || 'Não especificada'}</p>
                <p><small>ID: ${vehicle._id}</small></p>
            `;
            listContainer.appendChild(card);
        });
        console.log("[API] Veículos exibidos com sucesso.");

    } catch (error) {
        console.error("Erro CRÍTICO ao buscar veículos da API:", error);
        listContainer.innerHTML = '<p class="error-message">Falha ao carregar veículos. Verifique se o servidor está online.</p>';
    }
}


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
            throw new Error(`Erro na API de serviços: ${response.statusText} (Status: ${response.status})`);
        }
        const servicos = await response.json();

        listaServicosDiv.innerHTML = ''; 

        if (servicos.length === 0) {
            listaServicosDiv.innerHTML = '<p>Nenhum serviço oferecido foi encontrado no banco de dados.</p>';
            return;
        }

        servicos.forEach(servico => {
            const card = document.createElement('div');
            card.className = 'servico-card';
            card.innerHTML = `
                <h3>${servico.nome}</h3>
                <p>${servico.descricao}</p>
            `;
            listaServicosDiv.appendChild(card);
        });
        console.log("[Serviços] Serviços carregados e exibidos com sucesso.");

    } catch (error) {
        console.error("Erro CRÍTICO ao carregar serviços:", error);
        listaServicosDiv.innerHTML = '<p class="error-message">Não foi possível carregar os serviços. Verifique a conexão com o servidor.</p>';
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

        listaViagensDiv.innerHTML = ''; 

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
        listaViagensDiv.innerHTML = '<p class="error-message">Não foi possível carregar os destinos. Verifique a conexão com o servidor.</p>';
    }
}


// =============================================================================
// === INICIALIZAÇÃO ===========================================================
// =============================================================================

// Cria a instância da Garagem (o construtor já chama carregarGaragem para o simulador)
const garagem = new Garagem();

document.addEventListener('DOMContentLoaded', () => {
    console.log('[script.js] DOMContentLoaded. Aplicação iniciada.');
    
    // --- LÓGICA NOVA: INTERAÇÃO COM API DE VEÍCULOS ---
    const dbForm = document.getElementById('form-add-db-vehicle');
    const errorDiv = document.getElementById('db-form-error');

    if (dbForm) {
        dbForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Previne o recarregamento da página
            errorDiv.textContent = ''; // Limpa erros antigos

            const novoVeiculo = {
                placa: document.getElementById('db-placa').value,
                marca: document.getElementById('db-marca').value,
                modelo: document.getElementById('db-modelo').value,
                ano: document.getElementById('db-ano').value,
                cor: document.getElementById('db-cor').value,
            };

            try {
                const response = await fetch('http://localhost:3000/api/veiculos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(novoVeiculo),
                });
                
                // Se a resposta foi bem-sucedida (ex: 201 Created)
                if (response.ok) {
                    console.log("[API] Veículo criado com sucesso!");
                    dbForm.reset(); // Limpa o formulário
                    // MELHORIA CHAVE: Atualiza a lista na tela automaticamente
                    await fetchAndDisplayVehicles(); 
                } else {
                    // Se o servidor retornou um erro (ex: 400, 409)
                    const errorData = await response.json();
                    console.error("[API] Erro do servidor ao criar veículo:", errorData);
                    errorDiv.textContent = `Erro: ${errorData.error || 'Falha ao salvar.'}`;
                }

            } catch (error) {
                console.error("Erro CRÍTICO na requisição POST:", error);
                errorDiv.textContent = "Erro de conexão. Não foi possível contatar o servidor.";
            }
        });
    }

    // --- CARREGA DADOS DAS APIS ---
    fetchAndDisplayVehicles(); // Carga inicial dos veículos do DB
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
        console.warn("Elementos para busca de clima não encontrados.");
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
        console.warn("Elementos para botões de previsão não encontrados.");
    }
    // --- FIM: Lógica para botões de previsão de N dias ---

    // --- INÍCIO: LÓGICA PARA DICAS DA COMUNIDADE ---
    const buscarDicaBtn = document.getElementById('buscarDicaBtn');
    const dicaModeloInput = document.getElementById('dicaModeloInput');
    const dicaModal = document.getElementById('dicaModal');
    const closeDicaModal = document.getElementById('closeDicaModal');
    const dicaForm = document.getElementById('dicaForm');

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
        } else {
            modalTitle.textContent = `Adicionar Dica para ${dados.modelo}`;
            formTexto.value = '';
            formAutor.value = '';
        }
        dicaModal.style.display = 'block';
    };

    const fecharModalDica = () => {
        dicaModal.style.display = 'none';
        dicaForm.reset();
    };
    
    buscarDicaBtn.addEventListener('click', async () => {
        const modelo = dicaModeloInput.value.trim();
        if (!modelo) return;

        try {
            const response = await fetch(`http://localhost:3000/api/dicas/${encodeURIComponent(modelo)}`);
            if (response.ok) {
                const dica = await response.json();
                abrirModalDica('edit', dica);
            } else if (response.status === 404) {
                if (confirm(`Nenhuma dica encontrada para "${modelo}". Deseja adicionar uma?`)) {
                    abrirModalDica('add', { modelo: modelo });
                }
            } else {
                throw new Error(`Erro do servidor: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Erro ao buscar dica:", error);
        }
    });

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

    closeDicaModal.addEventListener('click', fecharModalDica);
    window.addEventListener('click', (event) => {
        if (event.target === dicaModal) {
            fecharModalDica();
        }
    });
    // --- FIM: LÓGICA PARA DICAS DA COMUNIDADE ---


    // --- Lógica antiga do simulador local ---
    if (Object.keys(garagem.veiculos).length === 0) {
        console.log("Garagem local vazia. Criando veículos padrão do simulador...");
        garagem.criarCarro();
        garagem.criarMoto();
        garagem.criarCarroEsportivo();
        garagem.criarCaminhao();
    } else {
        console.log("Veículos do simulador carregados do localStorage. Atualizando UI.");
    }
    garagem.atualizarUICompleta();
    garagem.verificarAgendamentosProximos();
});``