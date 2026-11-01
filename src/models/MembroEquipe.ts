import { Profissional } from './Profissional';
import { Papel } from './Papel';

export class MembroEquipe {
  constructor(
    public readonly profissional: Profissional,
    public readonly papel: Papel,
    public readonly custo: number = 0,
    public readonly horasAlocadas: number = 0
  ) {}
}
