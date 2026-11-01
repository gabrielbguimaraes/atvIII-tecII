import { RecomendacaoDecorator } from './RecomendacaoDecorator';
import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { Projeto } from '../../models/Projeto';
import { Profissional } from '../../models/Profissional';
import { Papel } from '../../models/Papel';

export class CacheDecorator extends RecomendacaoDecorator {
  private cache: Map<string, Map<Papel, Profissional[]>> = new Map();
  private hits: number = 0;

  constructor(estrategia: RecomendacaoStrategy) {
    super(estrategia);
  }

  public override recomendar(
    projeto: Projeto,
    profissionais: Profissional[]
  ): Map<Papel, Profissional[]> {
    const chave = projeto.id;

    if (this.cache.has(chave)) {
      this.hits++;
      return this.cache.get(chave)!;
    }

    const resultado = this.estrategiaEnvolvida.recomendar(projeto, profissionais);
    this.cache.set(chave, resultado);
    return resultado;
  }

  public estaEmCache(projetoId: string): boolean {
    return this.cache.has(projetoId);
  }

  public obterHits(): number {
    return this.hits;
  }

  public limparCache(): void {
    this.cache.clear();
    this.hits = 0;
  }
}
