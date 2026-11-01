import { ServicoProjeto } from './ServicoProjeto';
import { Papel } from '../../models/Papel';

export class ServicoAtomico implements ServicoProjeto {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly custo: number,
    public readonly prazo: number,
    public readonly papel: Papel
  ) {}

  public calcularCusto(): number {
    return this.custo;
  }

  public listarSubservicos(): ServicoProjeto[] {
    return [];
  }

  public obterPrazo(): number {
    return this.prazo;
  }

  public validar(): boolean {
    const nomeValido = typeof this.nome === 'string' && this.nome.trim().length > 0;
    const custoValido = typeof this.custo === 'number' && !isNaN(this.custo) && this.custo >= 0;
    const prazoValido = typeof this.prazo === 'number' && !isNaN(this.prazo) && this.prazo > 0;
    const papelValido = Object.values(Papel).includes(this.papel);

    return nomeValido && custoValido && prazoValido && papelValido;
  }
}
