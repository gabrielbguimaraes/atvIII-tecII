import {
  Projeto,
  PacoteServico,
  ServicoAtomico,
  Papel
} from '../src';

describe('Padrão Composite - Hierarquia de Serviços do Projeto', () => {
  it('deve calcular corretamente o custo e prazo de um serviço atômico', () => {
    const servico = new ServicoAtomico('srv-1', 'Edição de Vídeo', 5000, 10, Papel.EDITOR);
    expect(servico.calcularCusto()).toBe(5000);
    expect(servico.obterPrazo()).toBe(10);
    expect(servico.listarSubservicos()).toEqual([]);
    expect(servico.validar()).toBe(true);
  });

  it('deve invalidar serviço atômico com parâmetros inconsistentes', () => {
    const custoNegativo = new ServicoAtomico('s1', 'Edição', -100, 5, Papel.EDITOR);
    expect(custoNegativo.validar()).toBe(false);

    const prazoInvalido = new ServicoAtomico('s2', 'Edição', 100, 0, Papel.EDITOR);
    expect(prazoInvalido.validar()).toBe(false);

    const nomeVazio = new ServicoAtomico('s3', '   ', 100, 5, Papel.EDITOR);
    expect(nomeVazio.validar()).toBe(false);

    const papelInvalido = new ServicoAtomico('s4', 'Edição', 100, 5, 'PAPEL_INEXISTENTE' as any);
    expect(papelInvalido.validar()).toBe(false);
  });

  it('deve calcular recursivamente custo e prazo em árvore de serviços de múltiplas profundidades', () => {
    const pacotePrincipal = new PacoteServico('pct-raiz', 'Produção Completa');

    const pacoteCaptacao = new PacoteServico('pct-cap', 'Captação de Imagens');
    const srvCamera = new ServicoAtomico('s-cam', 'Operação de Câmera', 8000, 15, Papel.OPERADOR_CAMERA);
    const srvLuz = new ServicoAtomico('s-luz', 'Iluminação de Cena', 5000, 10, Papel.ILUMINADOR);
    pacoteCaptacao.adicionarServico(srvCamera);
    pacoteCaptacao.adicionarServico(srvLuz);

    const pacotePosProducao = new PacoteServico('pct-pos', 'Pós-Produção');

    const pacoteImagem = new PacoteServico('pct-img', 'Tratamento de Imagem');
    const srvEdicao = new ServicoAtomico('s-ed', 'Edição de Vídeo', 6000, 12, Papel.EDITOR);
    const srvCor = new ServicoAtomico('s-cor', 'Color Grading', 4000, 8, Papel.COLORISTA);
    const srvVfx = new ServicoAtomico('s-vfx', 'Efeitos Visuais', 7000, 14, Papel.ARTISTA_VFX);
    pacoteImagem.adicionarServico(srvEdicao);
    pacoteImagem.adicionarServico(srvCor);
    pacoteImagem.adicionarServico(srvVfx);

    const pacoteAudio = new PacoteServico('pct-aud', 'Engenharia de Som');
    const srvMix = new ServicoAtomico('s-mix', 'Mixagem de Áudio', 3500, 6, Papel.MIXADOR_SOM);
    const srvFoley = new ServicoAtomico('s-fol', 'Design de Som Foley', 2500, 5, Papel.DESIGNER_SOM);
    pacoteAudio.adicionarServico(srvMix);
    pacoteAudio.adicionarServico(srvFoley);

    pacotePosProducao.adicionarServico(pacoteImagem);
    pacotePosProducao.adicionarServico(pacoteAudio);

    pacotePrincipal.adicionarServico(pacoteCaptacao);
    pacotePrincipal.adicionarServico(pacotePosProducao);

    const custoEsperado = 8000 + 5000 + 6000 + 4000 + 7000 + 3500 + 2500;
    const prazoEsperado = 15 + 10 + 12 + 8 + 14 + 6 + 5;

    expect(pacotePrincipal.calcularCusto()).toBe(custoEsperado);
    expect(pacotePrincipal.obterPrazo()).toBe(prazoEsperado);
    expect(pacotePrincipal.validar()).toBe(true);

    const atomicos = pacotePrincipal.obterServicosAtomicos();
    expect(atomicos.length).toBe(7);
  });

  it('deve detectar falha de validação profunda em nó folha inconsistente dentro de árvore complexa', () => {
    const raiz = new PacoteServico('p-raiz', 'Projeto Global');
    const nivel1 = new PacoteServico('p-n1', 'Subpacote Nível 1');
    const nivel2 = new PacoteServico('p-n2', 'Subpacote Nível 2');

    const folhaValida = new ServicoAtomico('f-ok', 'Roteiro', 2000, 5, Papel.ROTEIRISTA);
    const folhaInvalida = new ServicoAtomico('f-err', 'Direção Falha', -500, 10, Papel.DIRETOR);

    nivel2.adicionarServico(folhaValida);
    nivel2.adicionarServico(folhaInvalida);
    nivel1.adicionarServico(nivel2);
    raiz.adicionarServico(nivel1);

    expect(raiz.validar()).toBe(false);
  });

  it('deve invalidar PacoteServico sem subserviços', () => {
    const pacoteVazio = new PacoteServico('pct-vazio', 'Pacote Vazio');
    expect(pacoteVazio.validar()).toBe(false);
  });

  it('deve permitir remover serviço do pacote e recalcular custo e prazo', () => {
    const pacote = new PacoteServico('pct-edit', 'Pacote Edição');
    const s1 = new ServicoAtomico('s1', 'Corte Inicial', 2000, 5, Papel.EDITOR);
    const s2 = new ServicoAtomico('s2', 'Finalização', 3000, 7, Papel.EDITOR);

    pacote.adicionarServico(s1);
    pacote.adicionarServico(s2);
    expect(pacote.calcularCusto()).toBe(5000);
    expect(pacote.obterPrazo()).toBe(12);

    pacote.removerServico(s1);
    expect(pacote.calcularCusto()).toBe(3000);
    expect(pacote.obterPrazo()).toBe(7);
    expect(pacote.listarSubservicos().length).toBe(1);
  });

  it('deve integrar composite na classe Projeto e validar orçamento e prazo', () => {
    const servico = new PacoteServico('pct-proj', 'Pacote Geral');
    servico.adicionarServico(new ServicoAtomico('s-dir', 'Direção', 15000, 20, Papel.DIRETOR));
    servico.adicionarServico(new ServicoAtomico('s-fot', 'Fotografia', 10000, 15, Papel.DIRETOR_FOTOGRAFIA));

    const projetoDentroOrcamento = new Projeto({
      id: 'proj-1',
      nome: 'Curta-metragem',
      orcamento: 30000,
      prazo: 40,
      servicoPrincipal: servico
    });

    expect(projetoDentroOrcamento.calcularCustoTotal()).toBe(25000);
    expect(projetoDentroOrcamento.obterPrazoTotal()).toBe(35);
    expect(projetoDentroOrcamento.validarEstrutura()).toBe(true);

    const projetoEstouroOrcamento = new Projeto({
      id: 'proj-2',
      nome: 'Curta sem Verba',
      orcamento: 20000,
      prazo: 40,
      servicoPrincipal: servico
    });

    expect(projetoEstouroOrcamento.validarEstrutura()).toBe(false);

    const projetoEstouroPrazo = new Projeto({
      id: 'proj-3',
      nome: 'Curta Apressado',
      orcamento: 50000,
      prazo: 20,
      servicoPrincipal: servico
    });

    expect(projetoEstouroPrazo.validarEstrutura()).toBe(false);

    const projetoSemServico = new Projeto({
      id: 'proj-4',
      nome: 'Projeto Sem Serviço',
      orcamento: 50000,
      prazo: 30
    });

    expect(projetoSemServico.calcularCustoTotal()).toBe(0);
    expect(projetoSemServico.validarEstrutura()).toBe(false);
  });
});
