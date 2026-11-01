import * as zlib from 'zlib';
import { RecomendacaoDecorator } from './RecomendacaoDecorator';
import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { Projeto } from '../../models/Projeto';
import { Profissional } from '../../models/Profissional';
import { Papel } from '../../models/Papel';

export class CompressaoDecorator extends RecomendacaoDecorator {
  private ultimoTamanhoOriginal: number = 0;
  private ultimoTamanhoComprimido: number = 0;
  private ultimoPayloadComprimido: Buffer = Buffer.alloc(0);

  constructor(estrategia: RecomendacaoStrategy) {
    super(estrategia);
  }

  public override recomendar(
    projeto: Projeto,
    profissionais: Profissional[]
  ): Map<Papel, Profissional[]> {
    const resultado = this.estrategiaEnvolvida.recomendar(projeto, profissionais);

    const serializavel: Record<string, any[]> = {};
    for (const [papel, profs] of resultado.entries()) {
      serializavel[papel] = profs.map((p) => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        papel: p.papel,
        competencias: p.competencias,
        avaliacoes: p.avaliacoes,
        valorHora: p.valorHora,
        disponivel: p.disponivel
      }));
    }

    const jsonString = JSON.stringify({
      projeto: {
        id: projeto.id,
        nome: projeto.nome,
        orcamento: projeto.orcamento,
        prazo: projeto.prazo,
        descricao: projeto.descricao
      },
      recomendacoes: serializavel,
      geradoEm: new Date().toISOString()
    });

    const bufferOriginal = Buffer.from(jsonString, 'utf-8');
    this.ultimoTamanhoOriginal = bufferOriginal.length;

    const comprimido = zlib.gzipSync(bufferOriginal);
    this.ultimoTamanhoComprimido = comprimido.length;
    this.ultimoPayloadComprimido = comprimido;

    return resultado;
  }

  public obterUltimoTamanhoOriginal(): number {
    return this.ultimoTamanhoOriginal;
  }

  public obterUltimoTamanhoComprimido(): number {
    return this.ultimoTamanhoComprimido;
  }

  public obterTaxaCompressao(): number {
    if (this.ultimoTamanhoOriginal === 0) {
      return 0;
    }
    return ((this.ultimoTamanhoOriginal - this.ultimoTamanhoComprimido) / this.ultimoTamanhoOriginal) * 100;
  }

  public obterPayloadComprimido(): Buffer {
    return Buffer.from(this.ultimoPayloadComprimido);
  }
}
