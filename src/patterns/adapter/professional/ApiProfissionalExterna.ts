export class ApiProfissionalExterna {
  private basePerfis: Map<string, any> = new Map();

  constructor(dadosIniciais?: any[]) {
    if (dadosIniciais && dadosIniciais.length > 0) {
      for (const item of dadosIniciais) {
        this.cadastrarPerfil(item);
      }
    }
  }

  public cadastrarPerfil(perfil: any): void {
    const id = perfil.id ||
      perfil.externalId ||
      perfil.codigo ||
      perfil.jobSeekerId ||
      perfil.candidateId ||
      perfil.urn ||
      `ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    this.basePerfis.set(String(id), { ...perfil, id });
  }

  public buscarProfissionais(filtros: any): any[] {
    const todos = Array.from(this.basePerfis.values());
    if (!filtros || Object.keys(filtros).length === 0) {
      return todos;
    }

    return todos.filter((perfil) => {
      if (filtros.papel) {
        const papel = perfil.papel || perfil.role || perfil.cargo || perfil.occupation || perfil.headline;
        if (papel && !String(papel).toUpperCase().includes(String(filtros.papel).toUpperCase())) {
          return false;
        }
      }
      if (filtros.disponivel !== undefined) {
        const disp = perfil.disponivel ?? perfil.available ?? true;
        if (disp !== filtros.disponivel) {
          return false;
        }
      }
      return true;
    });
  }

  public obterPerfil(id: string): any {
    const perfil = this.basePerfis.get(String(id));
    if (!perfil) {
      throw new Error(`Perfil externo não encontrado: ${id}`);
    }
    return perfil;
  }

  public avaliarProfissional(id: string, nota: number): void {
    const perfil = this.obterPerfil(id);
    if (!perfil.avaliacoes) {
      perfil.avaliacoes = [];
    }
    perfil.avaliacoes.push({
      nota,
      data: new Date()
    });
  }
}
