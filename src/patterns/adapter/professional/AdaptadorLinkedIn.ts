import { AdaptadorProfissional } from './AdaptadorProfissional';
import { ApiProfissionalExterna } from './ApiProfissionalExterna';
import { Profissional } from '../../../models/Profissional';
import { Papel } from '../../../models/Papel';
import { Competencia } from '../../../models/Competencia';
import { Avaliacao } from '../../../models/Avaliacao';

export class AdaptadorLinkedIn implements AdaptadorProfissional {
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
    const id = String(bruto.id || bruto.urn || bruto.externalId || '');
    const nome = bruto.nome || `${bruto.firstName ?? ''} ${bruto.lastName ?? ''}`.trim() || 'Profissional LinkedIn';
    const email = bruto.email || `${id.toLowerCase().replace(/[^a-z0-9]/g, '')}@linkedin-talent.com`;
    const papelStr = String(bruto.papel || bruto.headline || bruto.role || '').toUpperCase();
    const papel = this.mapearPapel(papelStr);

    const competencias: Competencia[] = (bruto.competencias || bruto.skills || []).map((s: any) => {
      if (typeof s === 'string') {
        return { nome: s, nivel: 4 };
      }
      return {
        nome: s.nome || s.name || 'Habilidade',
        nivel: s.nivel ?? s.level ?? 4
      };
    });

    const avaliacoesBrutas = [
      ...(Array.isArray(bruto.avaliacoes) ? bruto.avaliacoes : []),
      ...(Array.isArray(bruto.recommendations) ? bruto.recommendations : [])
    ];

    const avaliacoes: Avaliacao[] = avaliacoesBrutas.map((a: any) => ({
      nota: a.nota ?? a.score ?? a.rating ?? 5,
      comentario: a.comentario || a.text || 'Recomendação LinkedIn',
      data: a.data ? new Date(a.data) : new Date(),
      avaliadorId: a.avaliadorId || a.authorId
    }));

    const valorHora = bruto.valorHora || bruto.hourlyRate || 85;
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
