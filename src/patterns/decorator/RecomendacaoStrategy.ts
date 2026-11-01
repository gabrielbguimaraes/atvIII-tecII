import { Projeto } from '../../models/Projeto';
import { Profissional } from '../../models/Profissional';
import { Papel } from '../../models/Papel';

export interface RecomendacaoStrategy {
  recomendar(projeto: Projeto, profissionais: Profissional[]): Map<Papel, Profissional[]>;
}
