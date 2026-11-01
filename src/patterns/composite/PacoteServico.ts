import { ServicoProjeto } from './ServicoProjeto';
import { ServicoAtomico } from './ServicoAtomico';

export class PacoteServico implements ServicoProjeto {
  public subservicos: ServicoProjeto[] = [];

  constructor(
    public readonly id: string,
    public readonly nome: string,
    subservicosIniciais: ServicoProjeto[] = []
  ) {
    this.subservicos = [...subservicosIniciais];
  }

  public adicionarServico(servico: ServicoProjeto): void {
    this.subservicos.push(servico);
  }

  public removerServico(servico: ServicoProjeto): void {
    const index = this.subservicos.indexOf(servico);
    if (index !== -1) {
      this.subservicos.splice(index, 1);
    }
  }

  public calcularCusto(): number {
    return this.subservicos.reduce((total, servico) => total + servico.calcularCusto(), 0);
  }

  public listarSubservicos(): ServicoProjeto[] {
    return [...this.subservicos];
  }

  public obterServicosAtomicos(): ServicoAtomico[] {
    const atomicos: ServicoAtomico[] = [];
    for (const servico of this.subservicos) {
      if (servico instanceof ServicoAtomico) {
        atomicos.push(servico);
      } else if (servico instanceof PacoteServico) {
        atomicos.push(...servico.obterServicosAtomicos());
      } else {
        const filhos = servico.listarSubservicos();
        if (filhos.length === 0 && 'papel' in (servico as any)) {
          atomicos.push(servico as unknown as ServicoAtomico);
        }
      }
    }
    return atomicos;
  }

  public obterPrazo(): number {
    return this.subservicos.reduce((total, servico) => total + servico.obterPrazo(), 0);
  }

  public validar(): boolean {
    const nomeValido = typeof this.nome === 'string' && this.nome.trim().length > 0;
    const temFilhos = this.subservicos.length > 0;
    const prazoValido = this.obterPrazo() > 0;
    const filhosValidos = this.subservicos.every((servico) => servico.validar());

    return nomeValido && temFilhos && prazoValido && filhosValidos;
  }
}
