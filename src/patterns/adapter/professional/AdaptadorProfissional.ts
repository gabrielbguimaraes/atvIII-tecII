import { Profissional } from '../../../models/Profissional';

export interface AdaptadorProfissional {
  listarProfissionais(criterios: any): Profissional[];
  detalharProfissional(id: string): Profissional;
  registrarAvaliacao(id: string, avaliacao: any): void;
}
