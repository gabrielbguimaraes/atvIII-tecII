import {
  SistemaRecomendacao,
  AdaptadorLocal,
  AdaptadorStripe,
  AdaptadorInterno,
  RecomendadorBase,
  CacheDecorator,
  AuditoriaDecorator,
  CompressaoDecorator,
  Projeto,
  PacoteServico,
  ServicoAtomico,
  Papel,
  Profissional
} from '../src';

describe('SistemaRecomendacao - Orquestração e Casos de Borda', () => {
  it('deve fornecer acesso aos adaptadores e estratégia configurados', () => {
    const s = new SistemaRecomendacao();
    expect(s.obterAdaptadorArmazenamento()).toBeInstanceOf(AdaptadorLocal);
    expect(s.obterAdaptadorPagamento()).toBeInstanceOf(AdaptadorStripe);
    expect(s.obterAdaptadorProfissional()).toBeInstanceOf(AdaptadorInterno);
    expect(s.obterEstrategia()).toBeInstanceOf(RecomendadorBase);
  });

  it('deve permitir configurar decoradores via objeto de opções booleanas', () => {
    const s = new SistemaRecomendacao();
    s.configurarPilhaDecoradores({ cache: true, auditoria: true, compressao: true });
    expect(s.obterEstrategia()).toBeInstanceOf(CompressaoDecorator);

    const decorador = s.obterEstrategia() as CompressaoDecorator;
    expect(decorador.obterEstrategiaEnvolvida()).toBeInstanceOf(AuditoriaDecorator);
  });

  it('deve lançar erro ao executar recomendação em projeto com estrutura inválida', () => {
    const s = new SistemaRecomendacao();
    const projetoInvalido = new Projeto({
      id: 'proj-invalido',
      nome: 'Inválido',
      orcamento: 1000,
      prazo: 10,
      servicoPrincipal: new ServicoAtomico('s-err', 'Erro', 5000, 20, Papel.EDITOR)
    });

    expect(() => s.executarRecomendacao(projetoInvalido)).toThrow(/inválida/);
  });

  it('deve lidar com projeto sem servicoPrincipal no recomendador base', () => {
    const base = new RecomendadorBase();
    const projetoSemServico = new Projeto({
      id: 'proj-sem-servico',
      nome: 'Sem Serviço',
      orcamento: 50000,
      prazo: 30
    });

    const profs = [
      new Profissional({
        id: 'p-1',
        nome: 'Editor 1',
        email: 'e1@cine.com',
        papel: Papel.EDITOR,
        avaliacoes: [{ nota: 4.5, comentario: 'OK', data: new Date() }]
      })
    ];

    const mapa = base.recomendar(projetoSemServico, profs);
    expect(mapa.has(Papel.EDITOR)).toBe(true);
  });

  it('deve retornar taxa zero de compressão quando tamanho original for zero', () => {
    const compressao = new CompressaoDecorator(new RecomendadorBase());
    expect(compressao.obterTaxaCompressao()).toBe(0);
  });
});
