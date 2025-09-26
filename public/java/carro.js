// --- START OF FILE carro.js ---

class Carro extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.ligado = false;
        this.velocidade = 0;
        this.velocidadeMaxima = 200;
    }

    // --- Ações Específicas ---
    
    ligar() {
        if (this.ligado) return;
        if (this.combustivel > 0) {
            this.ligado = true;
            this.atualizarStatus(); // Atualiza UI
            console.log(`${this.nomeNaGaragem} ligado!`);
            garagem.salvarGaragem();
        } else {
            alert("Sem combustível!");
        }
    }

    desligar() {
        if (!this.ligado) return;

        const estavaLigado = this.ligado;
        this.ligado = false; // Define como desligado imediatamente

        // Se estiver em movimento, freia automaticamente antes de desligar completamente
        if (this.velocidade > 0) {
            console.log(`${this.nomeNaGaragem} desligando... Freando automaticamente.`);
            const interval = setInterval(() => {
                this.frear(true); // Chama frear internamente (sem animação/salvar repetido)
                if (this.velocidade === 0) {
                    clearInterval(interval);
                    this.atualizarStatus(); // Atualiza UI final (botões, status)
                    this.atualizarVelocidadeDisplay();
                    this.atualizarPonteiroVelocidade();
                    console.log(`${this.nomeNaGaragem} parado e desligado.`);
                    garagem.salvarGaragem(); // Salva estado final
                }
            }, 100); // Intervalo da frenagem
        } else {
            // Se já estava parado, apenas atualiza a UI e salva se necessário
            this.atualizarStatus();
            this.atualizarVelocidadeDisplay();
            this.atualizarPonteiroVelocidade();
            console.log(`${this.nomeNaGaragem} desligado.`);
            if (estavaLigado) garagem.salvarGaragem(); // Salva só se realmente mudou de estado
        }
    }

    acelerar() {
        const prefixoId = this.obterPrefixoIdHtml();
        if (!this.ligado) {
            return alert(`Ligue o ${prefixoId === 'carro' ? 'carro' : prefixoId} primeiro!`);
        }
        if (this.combustivel <= 0) {
            this.desligar(); // Desliga se tentar acelerar sem combustível
            return alert("Sem combustível!");
        }
        if (this.velocidade >= this.velocidadeMaxima) {
            return; // Já está na velocidade máxima
        }

        // Aumenta velocidade e consome combustível
        this.velocidade = Math.min(this.velocidade + 10, this.velocidadeMaxima);
        this.combustivel = Math.max(this.combustivel - 5, 0);

        // Atualiza UI
        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        this.ativarAnimacao('aceleracao', prefixoId);
        console.log(`${this.nomeNaGaragem} acelerando! V:${this.velocidade}, C:${this.combustivel.toFixed(0)}%`);
        garagem.salvarGaragem(); // Salva estado

        // Verifica se acabou o combustível após acelerar
        if (this.combustivel <= 0) {
            console.log("Combustível acabou durante a aceleração!");
            this.desligar(); // Inicia processo de desligamento (que vai frear)
        }
    }

    /**
     * Freia o veículo.
     * @param {boolean} [interno=false] - Flag para indicar se a chamada é interna.
     */
    frear(interno = false) {
        const prefixoId = this.obterPrefixoIdHtml();
        // Encontra o botão de frear específico deste veículo
        const frearBtn = document.getElementById(`frear${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`);

        if (this.velocidade === 0) {
            if (frearBtn) frearBtn.disabled = true; // Garante que botão esteja desabilitado se parado
            return; // Não faz nada se já parado
        }

        // Diminui velocidade
        this.velocidade = Math.max(this.velocidade - 10, 0);

        // Atualiza UI
        this.atualizarVelocidadeDisplay();
        this.atualizarPonteiroVelocidade();
        if (frearBtn) frearBtn.disabled = (this.velocidade === 0); // Desabilita/Habilita botão

        // Ações apenas se chamado externamente (clique do usuário)
        if (!interno) {
            this.ativarAnimacao('freagem', prefixoId);
            console.log(`${this.nomeNaGaragem} freando! V:${this.velocidade}`);
            garagem.salvarGaragem(); // Salva estado
        }

        // Se parou E o carro está desligando (flag 'ligado' é false), atualiza status final
        if (this.velocidade === 0 && !this.ligado) {
            this.atualizarStatus();
        }
    }

    // REMOVIDO: abastecer() - Movido para Veiculo

    // --- Métodos de Atualização de UI (Implementação) ---

     atualizarStatus() {
        const prefixoId = this.obterPrefixoIdHtml();
        const statusElem = document.getElementById(`${prefixoId}-status`);

        // Helper para construir IDs de botão dinamicamente
        const getButtonId = (baseName) => {
            if (prefixoId === 'carro') {
                return `${baseName}-btn`; // Ex: 'ligar-btn'
            }
            return `${baseName}-${prefixoId}-btn`; // Ex: 'ligar-caminhao-btn'
        };

        const ligarBtn = document.getElementById(getButtonId('ligar'));
        const desligarBtn = document.getElementById(getButtonId('desligar'));
        const acelerarBtn = document.getElementById(getButtonId('acelerar'));
        const frearBtn = document.getElementById(getButtonId('frear'));
        const pintarBtn = document.getElementById(getButtonId('pintar'));
        const abastecerBtn = document.getElementById(getButtonId('abastecer'));

        // Atualiza texto e cor do status
        if (statusElem) {
            statusElem.textContent = this.ligado ? 'Ligado' : 'Desligado';
            statusElem.style.color = this.ligado ? 'green' : 'red';
        }

        // Habilita/Desabilita botões
        if (ligarBtn) ligarBtn.disabled = this.ligado || this.combustivel <= 0; // Não pode ligar se já ligado ou sem combustível
        if (desligarBtn) desligarBtn.disabled = !this.ligado; // Só pode desligar se estiver ligado
        if (acelerarBtn) acelerarBtn.disabled = !this.ligado || this.combustivel <= 0; // Só pode acelerar se ligado e com combustível
        if (frearBtn) frearBtn.disabled = this.velocidade === 0; // Só pode frear se estiver em movimento
        if (pintarBtn) pintarBtn.disabled = false; // Sempre habilitado
        if (abastecerBtn) abastecerBtn.disabled = false; // Sempre habilitado
    }

    atualizarVelocidadeDisplay() {
        const prefixoId = this.obterPrefixoIdHtml();
        const velElemId = `${prefixoId}-velocidade-valor`;
        // Tenta ID específico, se não achar (caso do carro base), usa ID genérico
        const velElem = document.getElementById(velElemId) || document.getElementById('velocidade-valor');
        if (velElem) {
            velElem.textContent = `${this.velocidade.toFixed(0)} km/h`;
        }
        // Garante que o botão de frear reflita o estado atual da velocidade
        const frearBtnId = `frear${prefixoId === 'carro' ? '' : '-' + prefixoId}-btn`;
        const frearBtn = document.getElementById(frearBtnId);
        if (frearBtn) {
            frearBtn.disabled = (this.velocidade === 0);
        }
    }

    atualizarPonteiroVelocidade() {
        const prefixoId = this.obterPrefixoIdHtml();
        const ponteiroId = `ponteiro${prefixoId === 'carro' ? '' : '-' + prefixoId}-velocidade`;
        const ponteiro = document.getElementById(ponteiroId);
        if (ponteiro) {
            const porcentagem = Math.min((this.velocidade / this.velocidadeMaxima) * 100, 100);
            ponteiro.style.width = `${porcentagem}%`;
        }
    }

    atualizarDetalhes() {
        const prefixoId = this.obterPrefixoIdHtml();
        // IDs dos spans de modelo e cor (ex: 'modelo', 'carroEsportivo-modelo')
        const modeloElemId = (prefixoId === 'carro') ? 'modelo' : `${prefixoId}-modelo`;
        const corElemId = (prefixoId === 'carro') ? 'cor' : `${prefixoId}-cor`;

        const modeloElem = document.getElementById(modeloElemId);
        const corElem = document.getElementById(corElemId);

        if (modeloElem) modeloElem.textContent = this.modelo;
        if (corElem) corElem.textContent = this.cor;
    }

    atualizarInfoDisplay() {
        // Nada de extra para o carro base
    }

    /** 
     * Retorna uma string formatada com as informações do carro,
     * incluindo status e velocidade, além das informações base.
     * @override
     * @returns {string} Informações formatadas do carro.
     */
    exibirInformacoes() {
        let baseInfo = super.exibirInformacoes(); // Pega infos do Veiculo
        return `${baseInfo}\nStatus: ${this.ligado ? 'Ligado' : 'Desligado'}\nVelocidade: ${this.velocidade.toFixed(0)} km/h`;
    }
}
// --- END OF FILE carro.js ---