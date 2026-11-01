import { ServicoProjeto } from '../patterns/composite/ServicoProjeto';

export interface ProjetoProps {
  id: string;
  nome: string;
  orcamento: number;
  prazo: number;
  descricao?: string;
  servicoPrincipal?: ServicoProjeto;
}

export class Projeto {
  public readonly id: string;
  public nome: string;
  public orcamento: number;
  public prazo: number;
  public descricao?: string;
  private _servicoPrincipal?: ServicoProjeto;

  constructor(dados: ProjetoProps) {
    this.id = dados.id;
    this.nome = dados.nome;
    this.orcamento = dados.orcamento;
    this.prazo = dados.prazo;
    this.descricao = dados.descricao;
    this._servicoPrincipal = dados.servicoPrincipal;
  }

  public get servicoPrincipal(): ServicoProjeto | undefined {
    return this._servicoPrincipal;
  }

  public set servicoPrincipal(servico: ServicoProjeto | undefined) {
    this._servicoPrincipal = servico;
  }

  public calcularCustoTotal(): number {
    if (!this._servicoPrincipal) {
      return 0;
    }
    return this._servicoPrincipal.calcularCusto();
  }

  public obterPrazoTotal(): number {
    if (!this._servicoPrincipal) {
      return 0;
    }
    return this._servicoPrincipal.obterPrazo();
  }

  public validarEstrutura(): boolean {
    if (!this._servicoPrincipal) {
      return false;
    }
    if (!this._servicoPrincipal.validar()) {
      return false;
    }
    if (this.calcularCustoTotal() > this.orcamento) {
      return false;
    }
    if (this.prazo > 0 && this.obterPrazoTotal() > this.prazo) {
      return false;
    }
    return true;
  }

  public validar(): boolean {
    return this.validarEstrutura();
  }
}
