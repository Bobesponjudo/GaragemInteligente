const meuCarro = new Veiculo("Scania", "Branco", "Status");
const meuCarroEsportivo = new CarroEsportivo("Dodge", "Preto");
const meuCaminhao = new Caminhao("Caminhão de Carga", "Branco", 10000);

let veiculoSelecionado = meuCarro; // Inicializa com um veículo padrão

// Função para selecionar o veículo
function selecionarVeiculo(nomeVeiculo) {
  switch (nomeVeiculo) {
    case "meuCarro":
      veiculoSelecionado = meuCarro;
      break;
    case "meuCarroEsportivo":
      veiculoSelecionado = meuCarroEsportivo;
      break;
    case "meuCaminhao":
      veiculoSelecionado = meuCaminhao;
      break;
    default:
      console.log("Veículo não encontrado.");
      return;
  }
  exibirInformacoesVeiculo(); // Chamada para exibir as informações
}


// Função para exibir informações do veículo no HTML
function exibirInformacoesVeiculo() {
  const informacoesDiv = document.getElementById("informacoesVeiculo");
  informacoesDiv.textContent = veiculoSelecionado.exibirInformacoes();
}

// Função interagir (Garagem Inteligente)
function interagir(veiculo, acao) {
  switch (acao) {
    case "ligar":
      veiculo.ligar();
      break;
    case "desligar":
      veiculo.desligar();
      break;
    case "acelerar":
      veiculo.acelerar(10);
      break;
    case "frear":
      veiculo.frear(5);
      break;
    case "buzinar":
      veiculo.buzinar();
      break;
    case "ativarTurbo":
      if (veiculo instanceof CarroEsportivo) {
        veiculo.ativarTurbo();
      } else {
        console.log("Ação não aplicável a este veículo.");
      }
      break;
    case "desativarTurbo":
      if (veiculo instanceof CarroEsportivo) {
        veiculo.desativarTurbo();
      } else {
        console.log("Ação não aplicável a este veículo.");
      }
      break;
    case "carregar":
      if (veiculo instanceof Caminhao) {
        veiculo.carregar(1000);
      } else {
        console.log("Ação não aplicável a este veículo.");
      }
      break;
    case "descarregar":
      if (veiculo instanceof Caminhao) {
        veiculo.descarregar(500);
      } else {
        console.log("Ação não aplicável a este veículo.");
      }
      break;
    default:
      console.log("Ação inválida.");
  }
  exibirInformacoesVeiculo(); // Chamada para atualizar a exibição
}


let ligado = false;
let velocidade = 0;
const velocidadeMaximaCarro = 100;
const velocidadeMaximaEsportivo = 150; // Velocidade maior para o esportivo
const velocidadeMaximaCaminhao = 80;
let velocidadeMaxima = velocidadeMaximaCarro; // Inicializa com a velocidade do carro comum
const aceleracaoBase = 10;
const frenagemBase = 15;
let tipoVeiculo = "carro"; // Inicializa com "carro"
let cargaAtual = 0;
const cargaMaxima = 100;

// Elementos HTML
const statusTexto = document.getElementById("status-texto");
const ligarDesligarBotao = document.getElementById("ligar-desligar");
const acelerarBotao = document.getElementById("acelerar");
const frearBotao = document.getElementById("frear");
const buzinarBotao = document.getElementById("buzinar");
const turboBotao = document.getElementById("turbo");
const carregarBotao = document.getElementById("carregar");
const descarregarBotao = document.getElementById("descarregar");
const velocidadeBarra = document.getElementById("velocidade-barra");
const velocidadeAtualElement = document.getElementById("velocidade-atual");
const tipoVeiculoSelect = document.getElementById("tipo-veiculo");
const cargaContainer = document.getElementById("carga-container");
const cargaBarra = document.getElementById("carga-barra");
const cargaAtualTexto = document.getElementById("carga-atual-texto");
const cargaMaximaTexto = document.getElementById("carga-maxima");



// Funções

function atualizarStatus() {
  if (ligado) {
    statusTexto.textContent = "Ligado";
    statusTexto.classList.remove("desligado");
    statusTexto.classList.add("ligado");
    ligarDesligarBotao.textContent = "Desligar";
  } else {
    statusTexto.textContent = "Desligado";
    statusTexto.classList.remove("ligado");
    statusTexto.classList.add("desligado");
    ligarDesligarBotao.textContent = "Ligar";
  }
}

function atualizarVelocidade() {
  velocidadeBarra.style.width = `${(velocidade / velocidadeMaxima) * 100}%`;
  velocidadeAtualElement.textContent = velocidade;
}

function ligarDesligar() {
  if (ligado) {
    ligado = false;
    somDesligar.play();
  } else {
    ligado = true;
    somLigar.play();
  }
  atualizarStatus();
}

function acelerar() {
  if (!ligado) {
    alert("Não é possível acelerar um veículo desligado.");
    return;
  }

  if (velocidade >= velocidadeMaxima) {
    alert("O veículo já está na velocidade máxima.");
    return;
  }

  somAcelerar.play();
  velocidade = Math.min(velocidade + aceleracaoBase, velocidadeMaxima);
  atualizarVelocidade();
}

function frear() {
  if (!ligado && velocidade === 0) {
    alert("O veículo já está parado.");
    return;
  }

  somFrear.play();
  velocidade = Math.max(velocidade - frenagemBase, 0);
  atualizarVelocidade();
}

function buzinar() {
  somBuzina.play();
}

function ativarTurbo() {
  if (tipoVeiculo !== "esportivo") {
    alert("Não é possível ativar o turbo neste veículo.");
    return;
  }
  if (!ligado) {
    alert("Ligue o veículo primeiro!");
    return
  }

  if (velocidade + 30 > velocidadeMaxima) {
    alert("A velocidade ultrapassaria o limite máximo!");
    return
  }

  somTurbo.play();
  velocidade = Math.min(velocidade + 30, velocidadeMaxima); // Aumento maior para o turbo
  atualizarVelocidade();
}

function carregarCaminhao() {
  if (tipoVeiculo !== "caminhao") {
    alert("Não é possível carregar um veículo que não seja um caminhão.");
    return;
  }

  if (cargaAtual >= cargaMaxima) {
    alert("O caminhão já está com a carga máxima.");
    return;
  }

  somCarregar.play();
  cargaAtual = Math.min(cargaAtual + 20, cargaMaxima);
  atualizarCarga();
}

function descarregarCaminhao() {
  if (tipoVeiculo !== "caminhao") {
    alert("Não é possível descarregar um veículo que não seja um caminhão.");
    return;
  }

  if (cargaAtual <= 0) {
    alert("O caminhão já está sem carga.");
    return;
  }

  somDescarregar.play();
  cargaAtual = Math.max(cargaAtual - 20, 0);
  atualizarCarga();
}



function atualizarCarga() {
  cargaBarra.style.width = `${(cargaAtual / cargaMaxima) * 100}%`;
  document.getElementById("carga-atual").textContent = cargaAtual;
}

function atualizarInterface() {
  // Esconde os botões Turbo e Carregar por padrão
  turboBotao.style.display = "none";
  carregarBotao.style.display = "none";
  descarregarBotao.style.display = "none";
  cargaContainer.style.display = "none";
  cargaAtualTexto.style.display = "none";


  if (tipoVeiculo === "esportivo") {
    velocidadeMaxima = velocidadeMaximaEsportivo;
    turboBotao.style.display = "inline-block";
    cargaContainer.style.display = "none";
    cargaAtualTexto.style.display = "none";


  } else if (tipoVeiculo === "caminhao") {
    velocidadeMaxima = velocidadeMaximaCaminhao;
    carregarBotao.style.display = "inline-block";
    descarregarBotao.style.display = "inline-block";
    cargaContainer.style.display = "block";
    cargaAtualTexto.style.display = "block";
    cargaMaximaTexto.textContent = cargaMaxima;
    atualizarCarga();

  } else { // Carro comum
    velocidadeMaxima = velocidadeMaximaCarro;
    cargaContainer.style.display = "none";
    cargaAtualTexto.style.display = "none";
  }

  atualizarVelocidade(); // Garante que a barra de velocidade se ajuste à nova velocidade máxima.
}


// Event Listeners

ligarDesligarBotao.addEventListener("click", ligarDesligar);
acelerarBotao.addEventListener("click", acelerar);
frearBotao.addEventListener("click", frear);
buzinarBotao.addEventListener("click", buzinar);
turboBotao.addEventListener("click", ativarTurbo);
carregarBotao.addEventListener("click", carregarCaminhao);
descarregarBotao.addEventListener("click", descarregarCaminhao);


tipoVeiculoSelect.addEventListener("change", function () {
  tipoVeiculo = tipoVeiculoSelect.value;
  velocidade = 0; // Reseta a velocidade ao mudar o tipo
  atualizarInterface();
});


// Inicialização
atualizarStatus();
atualizarVelocidade();
atualizarInterface();






// --- Gerenciamento da Garagem e LocalStorage ---
const CHAVE_LOCALSTORAGE = 'garagemInteligenteDados';
let garagem = []; // Array para armazenar os veículos

function salvarGaragem() {
  try {
    // Usa o método toJSON de cada veículo (se definido) ou serializa diretamente
    const garagemParaSalvar = garagem.map(v => v.toJSON ? v.toJSON() : v);
    localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(garagemParaSalvar));
    console.log("Garagem salva no LocalStorage.");
  } catch (error) {
    console.error("Erro ao salvar garagem no LocalStorage:", error);
    alert("Não foi possível salvar os dados da garagem. Verifique o console para erros.");
  }
}

function carregarGaragem() {
  const dadosSalvos = localStorage.getItem(CHAVE_LOCALSTORAGE);
  if (dadosSalvos) {
    try {
      const garagemJSON = JSON.parse(dadosSalvos);
      // Recria as instâncias corretas usando o método estático fromJSON
      garagem = garagemJSON.map(vJson => Veiculo.fromJSON(vJson)).filter(v => v !== null);
      console.log("Garagem carregada do LocalStorage.");
    } catch (error) {
      console.error("Erro ao carregar ou parsear dados da garagem:", error);
      alert("Não foi possível carregar os dados salvos da garagem. Iniciando com garagem vazia.");
      garagem = []; // Reseta se houver erro
      localStorage.removeItem(CHAVE_LOCALSTORAGE); // Remove dados corrompidos
    }
  } else {
    garagem = []; // Garagem vazia se não houver dados
    console.log("Nenhum dado salvo encontrado. Iniciando com garagem vazia.");
  }
}

function encontrarVeiculoPorPlaca(placa) {
  return garagem.find(v => v.placa === placa);
}

// --- Funções da Interface ---

const listaVeiculosDiv = document.getElementById('lista-veiculos');
const formAddVeiculo = document.getElementById('form-add-veiculo');
const listaAgendamentosFuturosUl = document.getElementById('lista-agendamentos-futuros');

// Modal de Manutenção
const modalManutencao = document.getElementById('modal-manutencao');
const modalTituloVeiculo = document.getElementById('modal-titulo-veiculo');
const modalVeiculoIdInput = document.getElementById('modal-veiculo-id');
const modalHistoricoUl = document.getElementById('modal-historico-manutencao');
const formAgendarManutencao = document.getElementById('form-agendar-manutencao');
const closeModalButton = modalManutencao.querySelector('.close-button');

// Inputs do formulário de agendamento
const manutencaoDataInput = document.getElementById('manutencao-data');
const manutencaoTipoInput = document.getElementById('manutencao-tipo');
const manutencaoCustoInput = document.getElementById('manutencao-custo');
const manutencaoDescricaoInput = document.getElementById('manutencao-descricao');

// Opcional: Inicializar Datepicker
if (typeof flatpickr !== 'undefined') {
  flatpickr("#manutencao-data", {
    enableTime: true,
    dateFormat: "Y-m-d H:i", // Formato compatível com datetime-local
    time_24hr: true,
    locale: "pt" // Se tiver o locale pt carregado
  });
}


function renderizarGaragem() {
  listaVeiculosDiv.innerHTML = ''; // Limpa a lista atual
  if (garagem.length === 0) {
    listaVeiculosDiv.innerHTML = '<p>A garagem está vazia.</p>';
    return;
  }

  garagem.forEach(veiculo => {
    const divVeiculo = document.createElement('div');
    divVeiculo.classList.add('veiculo');
    divVeiculo.dataset.placa = veiculo.placa; // Adiciona a placa como data attribute

    let detalhesExtras = '';
    if (veiculo instanceof CarroEsportivo) {
      detalhesExtras = `<p>Portas: ${veiculo.numeroPortas}, Vel. Máx: ${veiculo.velocidadeMaxima} km/h</p>`;
    } else if (veiculo instanceof Carro) {
      detalhesExtras = `<p>Portas: ${veiculo.numeroPortas}</p>`;
    } else if (veiculo instanceof Caminhao) {
      detalhesExtras = `<p>Carga: ${veiculo.capacidadeCarga} kg</p>`;
    }

    divVeiculo.innerHTML = `
                  <h4>${veiculo.modelo} (${veiculo.placa})</h4>
                  <p>Tipo: ${veiculo.tipoVeiculo}</p>
                  <p>Status: ${veiculo.status}</p>
                  ${detalhesExtras}
                  <button class="btn-manutencao">Ver/Agendar Manutenção</button>
              `;

    // Adiciona evento ao botão de manutenção específico deste veículo
    const btnManutencao = divVeiculo.querySelector('.btn-manutencao');
    btnManutencao.addEventListener('click', () => abrirModalManutencao(veiculo.placa));

    listaVeiculosDiv.appendChild(divVeiculo);
  });
}

function renderizarAgendamentosFuturos() {
  listaAgendamentosFuturosUl.innerHTML = '';
  const agora = new Date();
  let encontrouAgendamento = false;

  garagem.forEach(veiculo => {
    veiculo.historicoManutencao.forEach(manutencao => {
      if (manutencao.data && manutencao.data > agora) {
        const li = document.createElement('li');
        li.textContent = `${veiculo.modelo} (${veiculo.placa}): ${manutencao.formatar()}`;
        listaAgendamentosFuturosUl.appendChild(li);
        encontrouAgendamento = true;

        // Simples Alerta (pode ser melhorado)
        const umDiaEmMs = 24 * 60 * 60 * 1000;
        if (manutencao.data.getTime() - agora.getTime() < umDiaEmMs) {
          console.warn(`Lembrete: Manutenção para ${veiculo.modelo} (${veiculo.placa}) agendada para breve!`);
          // Poderia exibir um toast/notificação mais visível
        }
      }
    });
  });

  if (!encontrouAgendamento) {
    listaAgendamentosFuturosUl.innerHTML = '<li>Nenhum agendamento futuro encontrado.</li>';
  }
}

function abrirModalManutencao(placa) {
  console.log("Abrindo modal para placa:", placa);
  const veiculo = encontrarVeiculoPorPlaca(placa);
  if (!veiculo) {
    alert("Erro: Veículo não encontrado!");
    return;
  }

  modalTituloVeiculo.textContent = `Manutenção do ${veiculo.modelo} (${veiculo.placa})`;
  modalVeiculoIdInput.value = placa; // Guarda a placa no input hidden
  console.log("Valor do input hidden 'modal-veiculo-id' definido para:", modalVeiculoIdInput.value);

  // Limpa e preenche o histórico
  modalHistoricoUl.innerHTML = '';
  const historicoFormatado = veiculo.getHistoricoFormatado();
  if (historicoFormatado.length > 0 && historicoFormatado[0] !== "Nenhum histórico de manutenção registrado.") {
    historicoFormatado.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      modalHistoricoUl.appendChild(li);
    });
  } else {
    modalHistoricoUl.innerHTML = '<li>Nenhum histórico de manutenção registrado.</li>';
  }


  // Limpa o formulário de agendamento
  formAgendarManutencao.reset();
  // Define a data mínima como hoje (opcional, mas útil)
  // manutencaoDataInput.min = new Date().toISOString().slice(0, 16); // Formato para datetime-local

  modalManutencao.style.display = 'block'; // Exibe o modal
}

function fecharModalManutencao() {
  modalManutencao.style.display = 'none';
}

// --- Event Listeners ---

// Adicionar Veículo
formAddVeiculo.addEventListener('submit', (event) => {
  event.preventDefault();

  const tipo = document.getElementById('tipo-veiculo').value;
  const modelo = document.getElementById('modelo').value.trim();
  const placa = document.getElementById('placa').value.trim().toUpperCase(); // Padroniza placa
  const status = document.getElementById('status-veiculo').value;

  if (!modelo || !placa) {
    alert("Por favor, preencha o Modelo e a Placa do veículo.");
    return;
  }

  // Verifica se a placa já existe
  if (encontrarVeiculoPorPlaca(placa)) {
    alert(`Erro: Já existe um veículo com a placa ${placa}.`);
    return;
  }

  let novoVeiculo;
  try {
    switch (tipo) {
      case 'Carro':
        novoVeiculo = new Carro(modelo, placa, status);
        break;
      case 'CarroEsportivo':
        // Poderia adicionar inputs para atributos específicos se quisesse
        novoVeiculo = new CarroEsportivo(modelo, placa, status);
        break;
      case 'Caminhao':
        // Poderia adicionar inputs para atributos específicos se quisesse
        novoVeiculo = new Caminhao(modelo, placa, status);
        break;
      default:
        alert("Tipo de veículo inválido.");
        return;
    }

    garagem.push(novoVeiculo);
    salvarGaragem();
    renderizarGaragem();
    renderizarAgendamentosFuturos(); // Atualiza caso haja algum default
    formAddVeiculo.reset();
    alert(`Veículo ${modelo} (${placa}) adicionado com sucesso!`);

  } catch (error) {
    alert(`Erro ao criar veículo: ${error.message}`);
    console.error(error);
  }
});

// Agendar/Registrar Manutenção
formAgendarManutencao.addEventListener('submit', (event) => {
  event.preventDefault();

  const placaVeiculo = modalVeiculoIdInput.value;
  console.log("Tentando agendar/registrar manutenção para placa:", placaVeiculo); // <-- Adicione esta linha
  console.log("Estado atual da garagem:", garagem); // <-- Adicione esta linha (pode gerar muito log se a garagem for grande)
  // Opcionalmente, log apenas as placas:
  console.log("Placas na garagem:", garagem.map(v => v.placa)); // <-- Alternativa mais limpa

  const dataStr = manutencaoDataInput.value; // String do input datetime-local ou datepicker
  const tipo = manutencaoTipoInput.value.trim();
  const custo = manutencaoCustoInput.value; // Vem como string, será convertido na classe
  const descricao = manutencaoDescricaoInput.value.trim();
  console.log("Resultado da busca (encontrarVeiculoPorPlaca):", veiculo); // <-- Adicione esta linha

  if (!placaVeiculo || !dataStr || !tipo) {
    alert("Por favor, preencha a Data, Tipo de Serviço.");
    // Custo 0 é permitido para agendamentos
    return;
  }

  // Tenta criar o objeto Date a partir da string do input
  const dataManutencao = new Date(dataStr);
  if (isNaN(dataManutencao.getTime())) {
    alert("Data ou hora inválida. Verifique o formato.");
    return;
  }


  const veiculo = encontrarVeiculoPorPlaca(placaVeiculo);
  if (!veiculo) {
    alert("Erro: Veículo não encontrado para adicionar manutenção!");
    fecharModalManutencao();
    return;
  }

  try {
    const novaManutencao = new Manutencao(dataManutencao, tipo, custo, descricao);

    if (!novaManutencao.validar()) {
      // A validação na classe já deve ter logado no console
      alert("Dados da manutenção inválidos. Verifique o console para detalhes.");
      return;
    }

    veiculo.adicionarManutencao(novaManutencao);
    salvarGaragem();

    // Atualiza a UI do modal e a lista de agendamentos futuros
    abrirModalManutencao(placaVeiculo); // Reabre para mostrar o histórico atualizado
    renderizarAgendamentosFuturos();

    alert(`Manutenção '${tipo}' ${novaManutencao.data > new Date() ? 'agendada' : 'registrada'} para ${veiculo.modelo} (${veiculo.placa}) com sucesso!`);
    // Não fecha o modal automaticamente, o usuário pode querer adicionar mais

  } catch (error) {
    alert(`Erro ao registrar/agendar manutenção: ${error.message}`);
    console.error("Erro ao criar Manutencao:", error);
  }
});


// Fechar Modal
closeModalButton.addEventListener('click', fecharModalManutencao);
// Fechar modal clicando fora dele
window.addEventListener('click', (event) => {
  if (event.target == modalManutencao) {
    fecharModalManutencao();
  }
});

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
  carregarGaragem();
  renderizarGaragem();
  renderizarAgendamentosFuturos();
  // Exibir alertas de agendamentos próximos aqui, se desejado
  console.log("Aplicação inicializada.");
});
