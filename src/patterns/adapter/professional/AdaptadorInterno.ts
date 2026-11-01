import { AdaptadorProfissional } from './AdaptadorProfissional';
import { ApiProfissionalExterna } from './ApiProfissionalExterna';
import { Profissional } from '../../../models/Profissional';
import { Papel } from '../../../models/Papel';
import { Competencia } from '../../../models/Competencia';
import { Avaliacao } from '../../../models/Avaliacao';

export class AdaptadorInterno implements AdaptadorProfissional {
  private apiExterna: ApiProfissionalExterna;

  constructor(apiExterna?: ApiProfissionalExterna) {
    this.apiExterna = apiExterna ?? new ApiProfissionalExterna(AdaptadorInterno.obterPerfisPadrao());
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
    const id = String(bruto.id || bruto.codigo || '');
    const nome = bruto.nome || 'Profissional Interno';
    const email = bruto.email || `${id.toLowerCase()}@cinebridge.internal`;
    const papel = bruto.papel && Object.values(Papel).includes(bruto.papel)
      ? (bruto.papel as Papel)
      : Papel.EDITOR;

    const competencias: Competencia[] = (bruto.competencias || []).map((c: any) => ({
      nome: c.nome || 'Competencia',
      nivel: c.nivel ?? 5
    }));

    const avaliacoes: Avaliacao[] = (bruto.avaliacoes || []).map((a: any) => ({
      nota: a.nota ?? 5,
      comentario: a.comentario || 'Avaliação Interna Cinebridge',
      data: a.data ? new Date(a.data) : new Date(),
      avaliadorId: a.avaliadorId
    }));

    const valorHora = bruto.valorHora ?? 100;
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

  public static obterPerfisPadrao(): any[] {
    return [
      {
        id: 'prof-dir-1',
        nome: 'Alice Diretora',
        email: 'alice@cinebridge.internal',
        papel: Papel.DIRETOR,
        competencias: [{ nome: 'Direção de Atores', nivel: 5 }],
        avaliacoes: [{ nota: 4.9, comentario: 'Excelente visão' }],
        valorHora: 150,
        disponivel: true
      },
      {
        id: 'prof-rot-1',
        nome: 'Roberto Roteirista',
        email: 'roberto@cinebridge.internal',
        papel: Papel.ROTEIRISTA,
        competencias: [{ nome: 'Estrutura Dramática', nivel: 5 }],
        avaliacoes: [{ nota: 4.8, comentario: 'Roteiro primoroso' }],
        valorHora: 120,
        disponivel: true
      },
      {
        id: 'prof-edt-1',
        nome: 'Julia Editora',
        email: 'julia@cinebridge.internal',
        papel: Papel.EDITOR,
        competencias: [{ nome: 'Premiere Pro', nivel: 5 }, { nome: 'DaVinci', nivel: 5 }],
        avaliacoes: [{ nota: 5.0, comentario: 'Montagem perfeita' }],
        valorHora: 110,
        disponivel: true
      },
      {
        id: 'prof-edt-2',
        nome: 'Marcos Editor',
        email: 'marcos@cinebridge.internal',
        papel: Papel.EDITOR,
        competencias: [{ nome: 'Final Cut', nivel: 4 }],
        avaliacoes: [{ nota: 4.7, comentario: 'Muito ágil' }],
        valorHora: 90,
        disponivel: true
      },
      {
        id: 'prof-col-1',
        nome: 'Lucas Colorista',
        email: 'lucas@cinebridge.internal',
        papel: Papel.COLORISTA,
        competencias: [{ nome: 'ACES Workflow', nivel: 5 }],
        avaliacoes: [{ nota: 4.9, comentario: 'Color grading impecável' }],
        valorHora: 120,
        disponivel: true
      },
      {
        id: 'prof-fot-1',
        nome: 'Fernando Fotógrafo',
        email: 'fernando@cinebridge.internal',
        papel: Papel.DIRETOR_FOTOGRAFIA,
        competencias: [{ nome: 'Iluminação Natural', nivel: 5 }],
        avaliacoes: [{ nota: 4.8, comentario: 'Ótima fotografia' }],
        valorHora: 140,
        disponivel: true
      },
      {
        id: 'prof-vfx-1',
        nome: 'Vanessa VFX',
        email: 'vanessa@cinebridge.internal',
        papel: Papel.ARTISTA_VFX,
        competencias: [{ nome: 'Blender', nivel: 5 }, { nome: 'Nuke', nivel: 5 }],
        avaliacoes: [{ nota: 4.9, comentario: 'CGI realista' }],
        valorHora: 130,
        disponivel: true
      },
      {
        id: 'prof-som-1',
        nome: 'Marcelo Som',
        email: 'marcelo@cinebridge.internal',
        papel: Papel.MIXADOR_SOM,
        competencias: [{ nome: 'Pro Tools', nivel: 5 }],
        avaliacoes: [{ nota: 4.8, comentario: 'Mixagem limpa' }],
        valorHora: 100,
        disponivel: true
      },
      {
        id: 'prof-fol-1',
        nome: 'Daniel Foley',
        email: 'daniel@cinebridge.internal',
        papel: Papel.DESIGNER_SOM,
        competencias: [{ nome: 'Foley Recording', nivel: 5 }],
        avaliacoes: [{ nota: 4.7, comentario: 'Efeitos sonoros ricos' }],
        valorHora: 95,
        disponivel: true
      },
      {
        id: 'prof-cam-1',
        nome: 'Caio Câmera',
        email: 'caio@cinebridge.internal',
        papel: Papel.OPERADOR_CAMERA,
        competencias: [{ nome: 'Steadicam', nivel: 5 }],
        avaliacoes: [{ nota: 4.8, comentario: 'Enquadramentos dinâmicos' }],
        valorHora: 105,
        disponivel: true
      },
      {
        id: 'prof-luz-1',
        nome: 'Igor Iluminador',
        email: 'igor@cinebridge.internal',
        papel: Papel.ILUMINADOR,
        competencias: [{ nome: 'Luz de Cinema', nivel: 5 }],
        avaliacoes: [{ nota: 4.6, comentario: 'Montagem rápida' }],
        valorHora: 85,
        disponivel: true
      }
    ];
  }
}
