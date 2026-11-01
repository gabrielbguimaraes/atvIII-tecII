import { RecomendacaoDecorator } from './RecomendacaoDecorator';
import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { Projeto } from '../../models/Projeto';
import { Profissional } from '../../models/Profissional';
import { Papel } from '../../models/Papel';

export interface RegistroAuditoria {
  timestamp: Date;
  projetoId: string;
  totalProfissionaisAvaliados: number;
  duracaoMs: number;
}

export class AuditoriaDecorator extends RecomendacaoDecorator {
  private registrosAuditoria: RegistroAuditoria[] = [];

  constructor(estrategia: RecomendacaoStrategy) {
    super(estrategia);
  }

  public override recomendar(
    projeto: Projeto,
    profissionais: Profissional[]
  ): Map<Papel, Profissional[]> {
    const inicio = performance.now();
    const timestamp = new Date();

    const resultado = this.estrategiaEnvolvida.recomendar(projeto, profissionais);

    const duracaoMs = performance.now() - inicio;

    this.registrosAuditoria.push({
      timestamp,
      projetoId: projeto.id,
      totalProfissionaisAvaliados: profissionais.length,
      duracaoMs
    });

    return resultado;
  }

  public obterRegistrosAuditoria(): RegistroAuditoria[] {
    return [...this.registrosAuditoria];
  }

  public limparRegistros(): void {
    this.registrosAuditoria = [];
  }
}
