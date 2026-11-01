import { AdaptadorArmazenamento } from './patterns/adapter/storage/AdaptadorArmazenamento';
import { AdaptadorPagamento } from './patterns/adapter/payment/AdaptadorPagamento';
import { AdaptadorProfissional } from './patterns/adapter/professional/AdaptadorProfissional';
import { AdaptadorLocal } from './patterns/adapter/storage/AdaptadorLocal';
import { AdaptadorStripe } from './patterns/adapter/payment/AdaptadorStripe';
import { AdaptadorInterno } from './patterns/adapter/professional/AdaptadorInterno';
import { RecomendacaoStrategy } from './patterns/decorator/RecomendacaoStrategy';
import { RecomendadorBase } from './patterns/decorator/RecomendadorBase';
import { CacheDecorator } from './patterns/decorator/CacheDecorator';
import { AuditoriaDecorator } from './patterns/decorator/AuditoriaDecorator';
import { CompressaoDecorator } from './patterns/decorator/CompressaoDecorator';
import { Projeto } from './models/Projeto';
import { Equipe } from './models/Equipe';
import { MembroEquipe } from './models/MembroEquipe';
import { Papel } from './models/Papel';

export type TipoDecorador = 'cache' | 'auditoria' | 'compressao';

export class SistemaRecomendacao {
  private adaptadorArmazenamento: AdaptadorArmazenamento;
  private adaptadorPagamento: AdaptadorPagamento;
  private adaptadorProfissional: AdaptadorProfissional;
  private estrategiaAtual: RecomendacaoStrategy;

  constructor(
    adaptadorArmazenamento?: AdaptadorArmazenamento,
    adaptadorPagamento?: AdaptadorPagamento,
    adaptadorProfissional?: AdaptadorProfissional,
    estrategia?: RecomendacaoStrategy
  ) {
    this.adaptadorArmazenamento = adaptadorArmazenamento ?? new AdaptadorLocal();
    this.adaptadorPagamento = adaptadorPagamento ?? new AdaptadorStripe();
    this.adaptadorProfissional = adaptadorProfissional ?? new AdaptadorInterno();
    this.estrategiaAtual = estrategia ?? new RecomendadorBase();
  }

  public configurarAdaptadores(
    armazenamento: AdaptadorArmazenamento,
    pagamento: AdaptadorPagamento,
    profissional: AdaptadorProfissional
  ): void {
    this.adaptadorArmazenamento = armazenamento;
    this.adaptadorPagamento = pagamento;
    this.adaptadorProfissional = profissional;
  }

  public definirEstrategia(estrategia: RecomendacaoStrategy): void {
    this.estrategiaAtual = estrategia;
  }

  public obterEstrategia(): RecomendacaoStrategy {
    return this.estrategiaAtual;
  }

  public obterAdaptadorArmazenamento(): AdaptadorArmazenamento {
    return this.adaptadorArmazenamento;
  }

  public obterAdaptadorPagamento(): AdaptadorPagamento {
    return this.adaptadorPagamento;
  }

  public obterAdaptadorProfissional(): AdaptadorProfissional {
    return this.adaptadorProfissional;
  }

  public configurarPilhaDecoradores(
    ordemOuOpcoes: TipoDecorador[] | { cache?: boolean; auditoria?: boolean; compressao?: boolean; ordem?: TipoDecorador[] },
    estrategiaBase: RecomendacaoStrategy = new RecomendadorBase()
  ): void {
    let ordem: TipoDecorador[] = [];
    if (Array.isArray(ordemOuOpcoes)) {
      ordem = ordemOuOpcoes;
    } else {
      if (ordemOuOpcoes.ordem) {
        ordem = ordemOuOpcoes.ordem;
      } else {
        if (ordemOuOpcoes.cache) ordem.push('cache');
        if (ordemOuOpcoes.auditoria) ordem.push('auditoria');
        if (ordemOuOpcoes.compressao) ordem.push('compressao');
      }
    }

    let estrategiaMontada = estrategiaBase;
    for (const tipo of ordem) {
      switch (tipo) {
        case 'cache':
          estrategiaMontada = new CacheDecorator(estrategiaMontada);
          break;
        case 'auditoria':
          estrategiaMontada = new AuditoriaDecorator(estrategiaMontada);
          break;
        case 'compressao':
          estrategiaMontada = new CompressaoDecorator(estrategiaMontada);
          break;
      }
    }

    this.definirEstrategia(estrategiaMontada);
  }

  public executarRecomendacao(projeto: Projeto): Equipe {
    if (!projeto.validarEstrutura()) {
      throw new Error(`Estrutura do projeto ${projeto.id} é inválida ou excede orçamento/prazo.`);
    }

    const profissionais = this.adaptadorProfissional.listarProfissionais({ disponivel: true });
    const recomendacoes = this.estrategiaAtual.recomendar(projeto, profissionais);

    const equipe = new Equipe(`equipe-${projeto.id}`, projeto.id);

    for (const [papel, candidatos] of recomendacoes.entries()) {
      if (candidatos.length > 0) {
        const selecionado = candidatos[0];
        const horasEstimadas = 20;
        const custoMembro = selecionado.valorHora * horasEstimadas;
        equipe.adicionarMembro(new MembroEquipe(selecionado, papel as Papel, custoMembro, horasEstimadas));
      }
    }

    const relatorioPayload = Buffer.from(
      JSON.stringify({
        projetoId: projeto.id,
        nomeProjeto: projeto.nome,
        data: new Date().toISOString(),
        totalMembros: equipe.listarMembros().length,
        custoTotal: equipe.calcularCustoTotal(),
        membros: equipe.listarMembros().map((m) => ({
          profissionalId: m.profissional.id,
          nome: m.profissional.nome,
          papel: m.papel,
          custo: m.custo
        }))
      }),
      'utf-8'
    );

    this.adaptadorArmazenamento.salvarArquivo(relatorioPayload, {
      nome: `relatorio-equipe-${projeto.id}.json`,
      tipo: 'relatorio-alocacao'
    });

    const valorCobranca = projeto.calcularCustoTotal() > 0 ? projeto.calcularCustoTotal() : equipe.calcularCustoTotal();
    this.adaptadorPagamento.efetuarPagamento(valorCobranca, 'produtor-cinebridge', 'cinebridge-escrow');

    return equipe;
  }
}
