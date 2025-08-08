// script.js (CORRIGIDO E COMPLETO COM API E CRUD)

// =============================================================================
// === FUNÇÕES GLOBAIS DA APLICAÇÃO ============================================
// =============================================================================

/**
 * Busca veículos da API e os exibe na tela, agora com botões de ação.
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
            card.className = 'db-vehicle-card'; 
            // **ALTERAÇÃO AQUI: Adicionados botões de Editar e Excluir com data-id**
            card.innerHTML = `
                <h4>${vehicle.marca} ${vehicle.modelo} (${vehicle.ano})</h4>
                <p><strong>Placa:</strong> ${vehicle.placa}</p>
                <p><strong>Cor:</strong> ${vehicle.cor || 'Não especificada'}</p>
                <p><small>ID: ${vehicle._id}</small></p>
                <div class="db-vehicle-actions">
                    <button class="btn-edit" data-id="${vehicle._id}">Editar</button>
                    <button class="btn-delete" data-id="${vehicle._id}">Excluir</button>
                </div>
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
    
    // --- LÓGICA DE INTERAÇÃO COM API DE VEÍCULOS (CREATE) ---
    const dbForm = document.getElementById('form-add-db-vehicle');
    const dbErrorDiv = document.getElementById('db-form-error');

    if (dbForm) {
        dbForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            dbErrorDiv.textContent = ''; 

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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoVeiculo),
                });
                
                if (response.ok) {
                    console.log("[API] Veículo criado com sucesso!");
                    dbForm.reset(); 
                    await fetchAndDisplayVehicles(); 
                } else {
                    const errorData = await response.json();
                    console.error("[API] Erro do servidor ao criar veículo:", errorData);
                    dbErrorDiv.textContent = `Erro: ${errorData.error || 'Falha ao salvar.'}`;
                }
            } catch (error) {
                console.error("Erro CRÍTICO na requisição POST:", error);
                dbErrorDiv.textContent = "Erro de conexão. Não foi possível contatar o servidor.";
            }
        });
    }

    // --- NOVA LÓGICA PARA UPDATE E DELETE (usando delegação de eventos) ---
    const vehicleListContainer = document.getElementById('db-vehicle-list');
    if(vehicleListContainer) {
        vehicleListContainer.addEventListener('click', async (event) => {
            const target = event.target;

            // --- Lógica de EXCLUSÃO ---
            if (target.classList.contains('btn-delete')) {
                const vehicleId = target.dataset.id;
                if (confirm(`Tem certeza que deseja excluir o veículo com ID: ${vehicleId}?`)) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/veiculos/${vehicleId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            alert('Veículo excluído com sucesso!');
                            await fetchAndDisplayVehicles(); // Atualiza a lista
                        } else {
                            const errorData = await response.json();
                            throw new Error(errorData.error || 'Falha ao excluir o veículo.');
                        }
                    } catch (error) {
                        console.error("Erro ao excluir veículo:", error);
                        alert(`Erro: ${error.message}`);
                    }
                }
            }

            // --- Lógica de EDIÇÃO (abrir modal) ---
            if (target.classList.contains('btn-edit')) {
                const vehicleId = target.dataset.id;
                const modal = document.getElementById('editVehicleModal');
                const errorDiv = document.getElementById('edit-form-error');
                errorDiv.textContent = ''; // Limpa erros antigos

                try {
                    // 1. Buscar os dados atuais do veículo
                    const response = await fetch(`http://localhost:3000/api/veiculos/${vehicleId}`);
                    if (!response.ok) throw new Error('Não foi possível carregar os dados do veículo para edição.');
                    
                    const vehicle = await response.json();

                    // 2. Preencher o formulário no modal
                    document.getElementById('edit-db-id').value = vehicle._id;
                    document.getElementById('edit-db-placa').value = vehicle.placa;
                    document.getElementById('edit-db-marca').value = vehicle.marca;
                    document.getElementById('edit-db-modelo').value = vehicle.modelo;
                    document.getElementById('edit-db-ano').value = vehicle.ano;
                    document.getElementById('edit-db-cor').value = vehicle.cor;

                    // 3. Exibir o modal
                    modal.style.display = 'block';

                } catch (error) {
                    console.error("Erro ao preparar edição:", error);
                    alert(`Erro: ${error.message}`);
                }
            }
        });
    }

    // --- NOVA LÓGICA: Manipulação do Modal de Edição ---
    const editModal = document.getElementById('editVehicleModal');
    const editForm = document.getElementById('form-edit-db-vehicle');
    const closeEditModalBtn = document.getElementById('closeEditModal');

    // Fechar modal no botão 'X'
    if (closeEditModalBtn) {
        closeEditModalBtn.onclick = () => editModal.style.display = "none";
    }
    // Fechar modal clicando fora dele
    window.onclick = (event) => {
        if (event.target == editModal) {
            editModal.style.display = "none";
        }
    };

    // Submissão do formulário de edição
    if (editForm) {
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const errorDiv = document.getElementById('edit-form-error');
            errorDiv.textContent = '';

            const vehicleId = document.getElementById('edit-db-id').value;
            const updatedData = {
                // Não enviamos a placa, pois é readonly
                marca: document.getElementById('edit-db-marca').value,
                modelo: document.getElementById('edit-db-modelo').value,
                ano: document.getElementById('edit-db-ano').value,
                cor: document.getElementById('edit-db-cor').value,
            };

            try {
                const response = await fetch(`http://localhost:3000/api/veiculos/${vehicleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    alert('Veículo atualizado com sucesso!');
                    editModal.style.display = 'none';
                    await fetchAndDisplayVehicles(); // Atualiza a lista
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Falha ao atualizar o veículo.');
                }
            } catch (error) {
                console.error("Erro ao salvar alterações:", error);
                errorDiv.textContent = `Erro: ${error.message}`;
            }
        });
    }

    // --- CARREGA DADOS DAS APIS ---
    fetchAndDisplayVehicles(); 
    carregarViagensPopulares();
    carregarServicosOferecidos();

    // --- LÓGICA DO CLIMA ---
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
        cityInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') searchWeatherBtn.click(); });
        garagem.carregarEExibirClima(cityInput.value.trim());
    }

    // --- LÓGICA DA PREVISÃO ---
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
    }
    
    // --- LÓGICA PARA DICAS DA COMUNIDADE ---
    const buscarDicaBtn = document.getElementById('buscarDicaBtn');
    const dicaModeloInput = document.getElementById('dicaModeloInput');
    const dicaModal = document.getElementById('dicaModal');
    const closeDicaModal = document.getElementById('closeDicaModal');
    const dicaForm = document.getElementById('dicaForm');

    const abrirModalDica = (modo, dados) => {
        document.getElementById('dicaModalTitle').textContent = modo === 'edit' ? `Editar Dica para ${dados.modelo}` : `Adicionar Dica para ${dados.modelo}`;
        document.getElementById('dicaFormModo').value = modo;
        document.getElementById('dicaFormModelo').value = dados.modelo;
        document.getElementById('dicaFormTexto').value = modo === 'edit' ? dados.dica : '';
        document.getElementById('dicaFormAutor').value = modo === 'edit' ? dados.autor : '';
        dicaModal.style.display = 'block';
    };

    const fecharModalDica = () => { dicaModal.style.display = 'none'; dicaForm.reset(); };
    
    buscarDicaBtn.addEventListener('click', async () => {
        const modelo = dicaModeloInput.value.trim();
        if (!modelo) return;
        try {
            const response = await fetch(`http://localhost:3000/api/dicas/${encodeURIComponent(modelo)}`);
            if (response.ok) {
                abrirModalDica('edit', await response.json());
            } else if (response.status === 404) {
                if (confirm(`Nenhuma dica encontrada para "${modelo}". Deseja adicionar uma?`)) {
                    abrirModalDica('add', { modelo: modelo });
                }
            } else { throw new Error(`Erro do servidor: ${response.statusText}`); }
        } catch (error) { console.error("Erro ao buscar dica:", error); }
    });

    dicaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const modo = document.getElementById('dicaFormModo').value;
        const modelo = document.getElementById('dicaFormModelo').value;
        const url = `http://localhost:3000/api/dicas${modo === 'edit' ? '/' + encodeURIComponent(modelo) : ''}`;
        const method = modo === 'edit' ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelo: modelo,
                    dica: document.getElementById('dicaFormTexto').value,
                    autor: document.getElementById('dicaFormAutor').value
                }),
            });
            const result = await response.json();
            if (response.ok) {
                alert(`Dica ${modo === 'edit' ? 'atualizada' : 'adicionada'} com sucesso!`);
                fecharModalDica();
            } else { throw new Error(result.message || "Ocorreu um erro no servidor."); }
        } catch (error) { alert(`Erro ao salvar: ${error.message}`); }
    });

    closeDicaModal.addEventListener('click', fecharModalDica);
    window.addEventListener('click', (event) => { if (event.target === dicaModal) fecharModalDica(); });

    // --- Lógica do simulador local ---
    if (Object.keys(garagem.veiculos).length === 0) {
        garagem.criarCarro();
        garagem.criarMoto();
        garagem.criarCarroEsportivo();
        garagem.criarCaminhao();
    }
    garagem.atualizarUICompleta();
    garagem.verificarAgendamentosProximos();
});