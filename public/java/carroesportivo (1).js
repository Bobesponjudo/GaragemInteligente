// class CarroEsportivo extends Veiculo {
//   constructor(modelo, placa, status, numeroPortas = 2, velocidadeMaxima = 250) {
//     super(modelo, placa, status, numeroPortas);
//     this.velocidadeMaxima = velocidadeMaxima;
//   }
//   toJSON() {
//     return {
//       ...super.toJSON(),
//       velocidadeMaxima: this.velocidadeMaxima
//     };
//   }
// }


// Classe CarroEsportivo
class CarroEsportivo extends Veiculo {
  constructor(modelo, cor) {
    super(modelo, cor);
    this.turboAtivado = false;
  }

  ativarTurbo() {
    this.turboAtivado = true;
    console.log("Turbo ativado!");
  }

  desativarTurbo() {
    this.turboAtivado = false;
    console.log("Turbo desativado.");
  }

  acelerar(incremento) {
    if (this.ligado) {
      const incrementoTurbo = this.turboAtivado ? incremento * 2 : incremento;
      this.velocidade += incrementoTurbo;
      console.log(`${this.modelo} acelerando com turbo para ${this.velocidade} km/h.`);
    } else {
      console.log(`${this.modelo} não pode acelerar. Ligue-o primeiro.`);
    }
  }

  exibirInformacoes() {
    return `${super.exibirInformacoes()}, Turbo: ${this.turboAtivado ? "Ativado" : "Desativado"}`;
  }
}