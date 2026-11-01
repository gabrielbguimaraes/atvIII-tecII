import { AdaptadorProfissional } from './AdaptadorProfissional';
import { ApiProfissionalExterna } from './ApiProfissionalExterna';
import { Profissional } from '../../../models/Profissional';
import { Papel } from '../../../models/Papel';
import { Competencia } from '../../../models/Competencia';
import { Avaliacao } from '../../../models/Avaliacao';

export class AdaptadorIndeed implements AdaptadorProfissional {
  private apiExterna: ApiProfissionalExterna;

  constructor(apiExterna?: ApiProfissionalExterna) {
    this.apiExterna = apiExterna ?? new ApiProfissionalExterna();
  }

  public listarProfissionais(criterios: any): Profissional[] {
    const dadosBrutos = this.apiExterna.buscarProfissionais(criterios);
    return dadosBrutos.map((bruto) => this.converterParaProfissional(bruto));
  }

  public detalharProfissional(id: string): Profissional {
    const bruto = this.apiExterna.obterPerfil(id);
    return this.converterParaProfissional(bruto);
  }

  public registrarAvaliacao(id: string, avaliacao: any): void {
    const nota = typeof avaliacao === 'number' ? avaliacao : (avaliacao?.nota ?? 5);
    this.apiExterna.avaliarProfissional(id, nota);
  }

  private converterParaProfissional(bruto: any): Profissional {
    const id = String(bruto.id || bruto.jobSeekerId || bruto.candidateId || '');
    const nome = bruto.nome || bruto.candidateName || bruto.fullName || 'Profissional Indeed';
    const email = bruto.email || `${id.toLowerCase().replace(/[^a-z0-9]/g, '')}@indeed-candidates.com`;
    const papelStr = String(bruto.papel || bruto.primaryRole || bruto.occupation || '').toUpperCase();
    const papel = this.mapearPapel(papelStr);

    const competencias: Competencia[] = (bruto.competencias || bruto.resumeSkills || []).map((s: any) => {
      if (typeof s === 'string') {
        return { nome: s, nivel: 3 };
      }
      return {
        nome: s.nome || s.skillName || 'Habilidade',
        nivel: s.nivel ?? s.rating ?? 3
      };
    });

    const avaliacoesBrutas = [
      ...(Array.isArray(bruto.avaliacoes) ? bruto.avaliacoes : []),
      ...(Array.isArray(bruto.companyReviews) ? bruto.companyReviews : [])
    ];

    const avaliacoes: Avaliacao[] = avaliacoesBrutas.map((a: any) => ({
      nota: a.nota ?? a.score ?? a.stars ?? 4,
      comentario: a.comentario || a.feedback || 'Avaliação Indeed',
      data: a.data ? new Date(a.data) : new Date(),
      avaliadorId: a.avaliadorId || a.employerId
    }));

    const valorHora = bruto.valorHora || bruto.hourlyWage || bruto.wage || 70;
    const disponivel = bruto.disponivel !== undefined ? Boolean(bruto.disponivel) : true;

    return new Profissional({
      id,
      nome,
      email,
      papel,
      competencias,
      avaliacoes,
      valorHora,
      disponivel
    });
  }

  private mapearPapel(str: string): Papel {
    for (const valor of Object.values(Papel)) {
      if (str.includes(valor)) {
        return valor;
      }
    }
    return Papel.EDITOR;
  }
}
