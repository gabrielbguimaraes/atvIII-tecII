import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { Projeto } from '../../models/Projeto';
import { Profissional } from '../../models/Profissional';
import { Papel } from '../../models/Papel';

export abstract class RecomendacaoDecorator implements RecomendacaoStrategy {
  protected estrategiaEnvolvida: RecomendacaoStrategy;

  constructor(estrategia: RecomendacaoStrategy) {
    this.estrategiaEnvolvida = estrategia;
  }

  public recomendar(projeto: Projeto, profissionais: Profissional[]): Map<Papel, Profissional[]> {
    return this.estrategiaEnvolvida.recomendar(projeto, profissionais);
  }

  public obterEstrategiaEnvolvida(): RecomendacaoStrategy {
    return this.estrategiaEnvolvida;
  }
}
