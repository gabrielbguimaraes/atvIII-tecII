import { MembroEquipe } from './MembroEquipe';

export class Equipe {
  constructor(
    public readonly id: string,
    public readonly projetoId: string,
    public readonly membros: MembroEquipe[] = []
  ) {}

  public adicionarMembro(membro: MembroEquipe): void {
    this.membros.push(membro);
  }

  public calcularCustoTotal(): number {
    return this.membros.reduce((acc, m) => acc + m.custo, 0);
  }

  public listarMembros(): MembroEquipe[] {
    return [...this.membros];
  }
}
