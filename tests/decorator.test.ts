import {
  RecomendadorBase,
  CacheDecorator,
  AuditoriaDecorator,
  CompressaoDecorator,
  SistemaRecomendacao,
  Projeto,
  PacoteServico,
  ServicoAtomico,
  Profissional,
  Papel
} from '../src';

describe('Padrão Decorator - Funcionalidades Transversais de Recomendação', () => {
  let projeto: Projeto;
  let profissionais: Profissional[];

  beforeEach(() => {
    const pacote = new PacoteServico('pct-doc', 'Documentário');
    pacote.adicionarServico(new ServicoAtomico('s-ed', 'Edição', 4000, 10, Papel.EDITOR));
    pacote.adicionarServico(new ServicoAtomico('s-col', 'Colorização', 3000, 5, Papel.COLORISTA));

    projeto = new Projeto({
      id: 'proj-decorator-1',
      nome: 'Amazônia Documentário',
      orcamento: 20000,
      prazo: 30,
      servicoPrincipal: pacote
    });

    profissionais = [
      new Profissional({
        id: 'p-1',
        nome: 'Marcos Editor',
        email: 'marcos@cinema.com',
        papel: Papel.EDITOR,
        competencias: [{ nome: 'DaVinci', nivel: 5 }, { nome: 'Final Cut', nivel: 4 }],
        avaliacoes: [{ nota: 4.8, comentario: 'Muito bom', data: new Date() }],
        valorHora: 90
      }),
      new Profissional({
        id: 'p-2',
        nome: 'Julia Editora',
        email: 'julia@cinema.com',
        papel: Papel.EDITOR,
        competencias: [{ nome: 'Premiere', nivel: 5 }],
        avaliacoes: [{ nota: 4.9, comentario: 'Excelente', data: new Date() }],
        valorHora: 110
      }),
      new Profissional({
        id: 'p-3',
        nome: 'Lucas Colorista',
        email: 'lucas@cinema.com',
        papel: Papel.COLORISTA,
        competencias: [{ nome: 'ACES', nivel: 5 }],
        avaliacoes: [{ nota: 5.0, comentario: 'Perfeito', data: new Date() }],
        valorHora: 120
      })
    ];
  });

  describe('RecomendadorBase', () => {
    it('deve ranquear profissionais por nota decrescente para cada papel do serviço', () => {
      const base = new RecomendadorBase();
      const resultado = base.recomendar(projeto, profissionais);

      expect(resultado.has(Papel.EDITOR)).toBe(true);
      expect(resultado.has(Papel.COLORISTA)).toBe(true);

      const editores = resultado.get(Papel.EDITOR)!;
      expect(editores.length).toBe(2);
      expect(editores[0].nome).toBe('Julia Editora');
      expect(editores[1].nome).toBe('Marcos Editor');

      const coloristas = resultado.get(Papel.COLORISTA)!;
      expect(coloristas.length).toBe(1);
      expect(coloristas[0].nome).toBe('Lucas Colorista');
    });
  });

  describe('CacheDecorator', () => {
    it('deve armazenar em cache e evitar reprocessamento em requisições repetidas', () => {
      const base = new RecomendadorBase();
      const spyBase = jest.spyOn(base, 'recomendar');
      const cache = new CacheDecorator(base);

      expect(cache.estaEmCache(projeto.id)).toBe(false);
      expect(cache.obterHits()).toBe(0);

      const res1 = cache.recomendar(projeto, profissionais);
      expect(spyBase).toHaveBeenCalledTimes(1);
      expect(cache.estaEmCache(projeto.id)).toBe(true);
      expect(cache.obterHits()).toBe(0);

      const res2 = cache.recomendar(projeto, profissionais);
      expect(spyBase).toHaveBeenCalledTimes(1);
      expect(cache.obterHits()).toBe(1);
      expect(res1.get(Papel.EDITOR)).toEqual(res2.get(Papel.EDITOR));

      cache.limparCache();
      expect(cache.estaEmCache(projeto.id)).toBe(false);
      expect(cache.obterHits()).toBe(0);

      cache.recomendar(projeto, profissionais);
      expect(spyBase).toHaveBeenCalledTimes(2);
    });
  });

  describe('AuditoriaDecorator', () => {
    it('deve registrar métricas e tempo de execução estruturado', () => {
      const base = new RecomendadorBase();
      const auditoria = new AuditoriaDecorator(base);

      expect(auditoria.obterRegistrosAuditoria().length).toBe(0);

      const resultado = auditoria.recomendar(projeto, profissionais);
      expect(resultado.size).toBe(2);

      const registros = auditoria.obterRegistrosAuditoria();
      expect(registros.length).toBe(1);

      const reg = registros[0];
      expect(reg.projetoId).toBe(projeto.id);
      expect(reg.totalProfissionaisAvaliados).toBe(3);
      expect(reg.duracaoMs).toBeGreaterThanOrEqual(0);
      expect(reg.timestamp).toBeInstanceOf(Date);

      auditoria.recomendar(projeto, profissionais);
      expect(auditoria.obterRegistrosAuditoria().length).toBe(2);

      auditoria.limparRegistros();
      expect(auditoria.obterRegistrosAuditoria().length).toBe(0);
    });
  });

  describe('CompressaoDecorator', () => {
    it('deve comprimir os dados resultantes reduzindo o tráfego em bytes', () => {
      const base = new RecomendadorBase();
      const compressao = new CompressaoDecorator(base);

      const resultado = compressao.recomendar(projeto, profissionais);
      expect(resultado.size).toBe(2);

      const tamOriginal = compressao.obterUltimoTamanhoOriginal();
      const tamComprimido = compressao.obterUltimoTamanhoComprimido();
      const payload = compressao.obterPayloadComprimido();

      expect(tamOriginal).toBeGreaterThan(0);
      expect(tamComprimido).toBeGreaterThan(0);
      expect(tamComprimido).toBeLessThan(tamOriginal);
      expect(compressao.obterTaxaCompressao()).toBeGreaterThan(0);
      expect(payload.length).toBe(tamComprimido);
    });
  });

  describe('Composição Dinâmica de Decoradores e Integração com SistemaRecomendacao', () => {
    it('deve demonstrar combinação dinâmica em diferentes ordens funcionando de maneira transparente', () => {
      const base1 = new RecomendadorBase();
      const pilha1 = new CompressaoDecorator(new AuditoriaDecorator(new CacheDecorator(base1)));

      const base2 = new RecomendadorBase();
      const pilha2 = new AuditoriaDecorator(new CacheDecorator(new CompressaoDecorator(base2)));

      const res1 = pilha1.recomendar(projeto, profissionais);
      const res2 = pilha2.recomendar(projeto, profissionais);

      expect(res1.get(Papel.EDITOR)?.length).toBe(res2.get(Papel.EDITOR)?.length);
      expect(res1.get(Papel.COLORISTA)?.length).toBe(res2.get(Papel.COLORISTA)?.length);
    });

    it('deve configurar pilha de decoradores no SistemaRecomendacao via método utilitário', () => {
      const sistema = new SistemaRecomendacao();

      sistema.configurarPilhaDecoradores(['cache', 'auditoria', 'compressao']);
      expect(sistema.obterEstrategia()).toBeInstanceOf(CompressaoDecorator);

      const equipe = sistema.executarRecomendacao(projeto);
      expect(equipe.listarMembros().length).toBe(2);

      sistema.configurarPilhaDecoradores(['auditoria', 'cache']);
      expect(sistema.obterEstrategia()).toBeInstanceOf(CacheDecorator);

      const equipe2 = sistema.executarRecomendacao(projeto);
      expect(equipe2.listarMembros().length).toBe(2);
    });
  });
});
