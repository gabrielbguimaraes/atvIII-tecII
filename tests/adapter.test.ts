import {
  SistemaRecomendacao,
  ArmazenamentoExterno,
  AdaptadorS3,
  AdaptadorGoogleCloud,
  AdaptadorLocal,
  GatewayPagamento,
  AdaptadorStripe,
  AdaptadorPagSeguro,
  AdaptadorPayPal,
  ApiProfissionalExterna,
  AdaptadorLinkedIn,
  AdaptadorIndeed,
  AdaptadorInterno,
  Projeto,
  PacoteServico,
  ServicoAtomico,
  Papel
} from '../src';

describe('Padrão Adapter - Integração com Sistemas Externos', () => {
  describe('Adaptadores de Armazenamento', () => {
    it('deve salvar, recuperar e listar arquivos usando AdaptadorS3', () => {
      const storage = new ArmazenamentoExterno();
      const s3 = new AdaptadorS3(storage, 'meu-bucket-s3');
      const payload = Buffer.from('conteudo de teste roteiro');

      const id = s3.salvarArquivo(payload, { nome: 'roteiro.pdf' });
      expect(id).toBeDefined();

      const recuperado = s3.recuperarArquivo(id);
      expect(recuperado.toString('utf-8')).toBe('conteudo de teste roteiro');

      const lista = s3.listarArquivos('meu-bucket-s3');
      expect(lista).toContain(id);
    });

    it('deve salvar, recuperar e listar arquivos usando AdaptadorGoogleCloud', () => {
      const storage = new ArmazenamentoExterno();
      const gcs = new AdaptadorGoogleCloud(storage, 'meu-bucket-gcs');
      const payload = Buffer.from('storyboard em video');

      const id = gcs.salvarArquivo(payload, { nome: 'storyboard.mp4' });
      expect(id).toBeDefined();

      const recuperado = gcs.recuperarArquivo(id);
      expect(recuperado.toString('utf-8')).toBe('storyboard em video');

      const lista = gcs.listarArquivos('meu-bucket-gcs');
      expect(lista).toContain(id);
    });

    it('deve salvar, recuperar e listar arquivos usando AdaptadorLocal', () => {
      const storage = new ArmazenamentoExterno();
      const local = new AdaptadorLocal(storage, '/opt/cinebridge');
      const payload = Buffer.from('trilha sonora');

      const id = local.salvarArquivo(payload, { nome: 'trilha.wav' });
      expect(id).toBeDefined();

      const recuperado = local.recuperarArquivo(id);
      expect(recuperado.toString('utf-8')).toBe('trilha sonora');

      const lista = local.listarArquivos('/opt/cinebridge');
      expect(lista).toContain(id);
    });

    it('deve lançar erro ao recuperar arquivo inexistente', () => {
      const s3 = new AdaptadorS3();
      expect(() => s3.recuperarArquivo('inexistente')).toThrow();
    });
  });

  describe('Adaptadores de Pagamento', () => {
    it('deve processar, verificar e cancelar pagamento com AdaptadorStripe', () => {
      const gateway = new GatewayPagamento();
      const stripe = new AdaptadorStripe(gateway);

      const txId = stripe.efetuarPagamento(1500, 'produtor-1', 'cinebridge');
      expect(txId).toBeDefined();
      expect(stripe.verificarPagamento(txId)).toBe('CONCLUIDO');

      const estornado = stripe.cancelarPagamento(txId);
      expect(estornado).toBe(true);
      expect(stripe.verificarPagamento(txId)).toBe('ESTORNADO');
    });

    it('deve processar, verificar e cancelar pagamento com AdaptadorPagSeguro', () => {
      const gateway = new GatewayPagamento();
      const pagSeguro = new AdaptadorPagSeguro(gateway);

      const txId = pagSeguro.efetuarPagamento(2200, 'produtor-2', 'cinebridge');
      expect(txId).toBeDefined();
      expect(pagSeguro.verificarPagamento(txId)).toBe('CONCLUIDO');

      const estornado = pagSeguro.cancelarPagamento(txId);
      expect(estornado).toBe(true);
      expect(pagSeguro.verificarPagamento(txId)).toBe('ESTORNADO');
    });

    it('deve processar, verificar e cancelar pagamento com AdaptadorPayPal', () => {
      const gateway = new GatewayPagamento();
      const payPal = new AdaptadorPayPal(gateway);

      const txId = payPal.efetuarPagamento(3500, 'produtor-3', 'cinebridge');
      expect(txId).toBeDefined();
      expect(payPal.verificarPagamento(txId)).toBe('CONCLUIDO');

      const estornado = payPal.cancelarPagamento(txId);
      expect(estornado).toBe(true);
      expect(payPal.verificarPagamento(txId)).toBe('ESTORNADO');
    });

    it('deve retornar false ao tentar cancelar transação inexistente', () => {
      const stripe = new AdaptadorStripe();
      expect(stripe.cancelarPagamento('tx-fake')).toBe(false);
      expect(stripe.verificarPagamento('tx-fake')).toBe('NAO_ENCONTRADO');
    });
  });

  describe('Adaptadores de Profissionais', () => {
    it('deve converter dados brutos do LinkedIn para instâncias de Profissional', () => {
      const apiExterna = new ApiProfissionalExterna();
      apiExterna.cadastrarPerfil({
        id: 'li-101',
        firstName: 'Alice',
        lastName: 'Diretora',
        headline: 'Senior DIRETOR de Cinema',
        skills: [{ name: 'Liderança de Set', level: 5 }],
        hourlyRate: 150,
        recommendations: [{ score: 5, text: 'Excelente visão estética' }]
      });

      const adapter = new AdaptadorLinkedIn(apiExterna);
      const lista = adapter.listarProfissionais({});
      expect(lista.length).toBe(1);

      const prof = lista[0];
      expect(prof.id).toBe('li-101');
      expect(prof.nome).toBe('Alice Diretora');
      expect(prof.papel).toBe(Papel.DIRETOR);
      expect(prof.valorHora).toBe(150);
      expect(prof.calcularMediaAvaliacoes()).toBe(5);

      adapter.registrarAvaliacao('li-101', 4);
      const atualizado = adapter.detalharProfissional('li-101');
      expect(atualizado.avaliacoes.length).toBe(2);
      expect(atualizado.calcularMediaAvaliacoes()).toBe(4.5);
    });

    it('deve converter dados brutos do Indeed para instâncias de Profissional', () => {
      const apiExterna = new ApiProfissionalExterna();
      apiExterna.cadastrarPerfil({
        jobSeekerId: 'ind-202',
        candidateName: 'Bruno Colorista',
        primaryRole: 'COLORISTA DaVinci Resolve',
        resumeSkills: ['Color Grading', 'ACES Workflow'],
        hourlyWage: 120,
        companyReviews: [{ stars: 5, feedback: 'Agilidade na pós' }]
      });

      const adapter = new AdaptadorIndeed(apiExterna);
      const lista = adapter.listarProfissionais({});
      expect(lista.length).toBe(1);

      const prof = lista[0];
      expect(prof.id).toBe('ind-202');
      expect(prof.nome).toBe('Bruno Colorista');
      expect(prof.papel).toBe(Papel.COLORISTA);
      expect(prof.valorHora).toBe(120);

      adapter.registrarAvaliacao('ind-202', 3);
      const detalhe = adapter.detalharProfissional('ind-202');
      expect(detalhe.avaliacoes.length).toBe(2);
    });

    it('deve lidar com dados do AdaptadorInterno', () => {
      const apiExterna = new ApiProfissionalExterna();
      apiExterna.cadastrarPerfil({
        id: 'int-303',
        nome: 'Carlos Editor',
        email: 'carlos@cinebridge.internal',
        papel: Papel.EDITOR,
        competencias: [{ nome: 'Premiere Pro', nivel: 5 }],
        avaliacoes: [{ nota: 5, comentario: 'Pontual' }],
        valorHora: 95
      });

      const adapter = new AdaptadorInterno(apiExterna);
      const prof = adapter.detalharProfissional('int-303');
      expect(prof.id).toBe('int-303');
      expect(prof.papel).toBe(Papel.EDITOR);
      expect(prof.valorHora).toBe(95);
    });
  });

  describe('Intercambialidade de Adaptadores no SistemaRecomendacao', () => {
    it('deve trocar adaptadores de armazenamento, pagamento e profissional em tempo de execução sem alterar lógica de negócio', () => {
      const storageS3 = new ArmazenamentoExterno();
      const storageGCS = new ArmazenamentoExterno();
      const storageLocal = new ArmazenamentoExterno();

      const gatewayStripe = new GatewayPagamento();
      const gatewayPagSeguro = new GatewayPagamento();
      const gatewayPayPal = new GatewayPagamento();

      const apiLinkedIn = new ApiProfissionalExterna();
      apiLinkedIn.cadastrarPerfil({
        id: 'li-1',
        firstName: 'Diana',
        lastName: 'Prince',
        headline: 'DIRETOR',
        skills: ['Direção de Atores'],
        hourlyRate: 200,
        recommendations: [{ score: 5 }]
      });

      const apiIndeed = new ApiProfissionalExterna();
      apiIndeed.cadastrarPerfil({
        jobSeekerId: 'ind-1',
        candidateName: 'Clark Kent',
        primaryRole: 'DIRETOR',
        resumeSkills: ['Jornalismo Documental'],
        hourlyWage: 180,
        companyReviews: [{ stars: 4.8 }]
      });

      const apiInterno = new ApiProfissionalExterna();
      apiInterno.cadastrarPerfil({
        id: 'int-1',
        nome: 'Bruce Wayne',
        papel: Papel.DIRETOR,
        competencias: [{ nome: 'Financiamento e Direção', nivel: 5 }],
        avaliacoes: [{ nota: 4.9 }],
        valorHora: 250
      });

      const projeto = new Projeto({
        id: 'proj-intercambio',
        nome: 'Filme Metrópole',
        orcamento: 50000,
        prazo: 60,
        servicoPrincipal: new ServicoAtomico('srv-dir', 'Direção Geral', 10000, 30, Papel.DIRETOR)
      });

      const sistema = new SistemaRecomendacao(
        new AdaptadorS3(storageS3),
        new AdaptadorStripe(gatewayStripe),
        new AdaptadorLinkedIn(apiLinkedIn)
      );

      const equipe1 = sistema.executarRecomendacao(projeto);
      expect(equipe1.listarMembros()[0].profissional.nome).toBe('Diana Prince');
      expect(storageS3.listar('').length).toBe(1);

      sistema.configurarAdaptadores(
        new AdaptadorGoogleCloud(storageGCS),
        new AdaptadorPagSeguro(gatewayPagSeguro),
        new AdaptadorIndeed(apiIndeed)
      );

      const equipe2 = sistema.executarRecomendacao(projeto);
      expect(equipe2.listarMembros()[0].profissional.nome).toBe('Clark Kent');
      expect(storageGCS.listar('').length).toBe(1);

      sistema.configurarAdaptadores(
        new AdaptadorLocal(storageLocal),
        new AdaptadorPayPal(gatewayPayPal),
        new AdaptadorInterno(apiInterno)
      );

      const equipe3 = sistema.executarRecomendacao(projeto);
      expect(equipe3.listarMembros()[0].profissional.nome).toBe('Bruce Wayne');
      expect(storageLocal.listar('').length).toBe(1);
    });
  });
});
