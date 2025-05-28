
function fetchExtraVehicleDetails(nomeVeiculo) {
    console.log(`API Sim.: Buscando detalhes extras para: ${nomeVeiculo}...`);

    // Retorna uma Promise para simular a natureza assíncrona
    return new Promise((resolve, reject) => {
        // Simula latência da rede (0.8 a 1.8 segundos)
        const delay = Math.random() * 1000 + 800;

        setTimeout(() => {
            // Simula chance de erro na API (ex: 15% de chance)
            if (Math.random() < 0.15) {
                console.error(`API Sim.: Erro simulado ao buscar detalhes para ${nomeVeiculo}.`);
                reject(new Error("Falha simulada na comunicação com a API de detalhes do veículo. Tente novamente."));
                return;
            }

            // Dados simulados baseados no nome interno do veículo
            let details = {};
            const anoBase = 2018; // Ano base para cálculo

            switch (nomeVeiculo) {
                case 'meuCarro':
                    details = {
                        ano: anoBase + Math.floor(Math.random() * 3), // 2018-2020
                        motor: '1.8 Flex',
                        transmissao: 'Automática 6 marchas',
                        origem: 'Nacional',
                        ultimaRev: '2023-10-15'
                    };
                    break;
                case 'carroEsportivo':
                    details = {
                        ano: anoBase + 2 + Math.floor(Math.random() * 3), // 2020-2022
                        motor: 'V8 5.0 Supercharged',
                        transmissao: 'Manual 6 marchas',
                        origem: 'Importado (Itália)',
                        ultimaRev: '2024-01-20'
                    };
                    break;
                case 'caminhao':
                    details = {
                        ano: anoBase + 1 + Math.floor(Math.random() * 4), // 2019-2022
                        motor: 'Diesel 12L Turbo',
                        transmissao: 'Automatizada 12 marchas',
                        origem: 'Nacional (Montadora X)',
                        ultimaRev: '2023-11-01',
                        eixos: 6
                    };
                    break;
                case 'moto':
                    details = {
                        ano: anoBase + 3 + Math.floor(Math.random() * 3), // 2021-2023
                        motor: '1000cc 4 cilindros',
                        transmissao: 'Manual 6 marchas',
                        origem: 'Importada (Japão)',
                        ultimaRev: '2024-02-10',
                        abs: true
                    };
                    break;
                default:
                    // Retorna dados genéricos se o nome não for reconhecido
                    details = {
                        ano: anoBase,
                        motor: 'Desconhecido',
                        transmissao: 'N/D',
                        origem: 'N/D',
                        ultimaRev: 'N/D'
                    };
            }

            console.log(`API Sim.: Detalhes encontrados para ${nomeVeiculo}:`, details);
            resolve(details); // Resolve a Promise com os dados simulados

        }, delay);
    });
}

// --- END OF FILE simulatedApi.js ---