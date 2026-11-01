import { Papel } from './Papel';
import { Competencia } from './Competencia';
import { Avaliacao } from './Avaliacao';

export interface ProfissionalProps {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  competencias?: Competencia[];
  avaliacoes?: Avaliacao[];
  valorHora?: number;
  disponivel?: boolean;
}

export class Profissional {
  public id: string;
  public nome: string;
  public email: string;
  public papel: Papel;
  public competencias: Competencia[];
  public avaliacoes: Avaliacao[];
  public valorHora: number;
  public disponivel: boolean;

  constructor(dados: ProfissionalProps) {
    this.id = dados.id;
    this.nome = dados.nome;
    this.email = dados.email;
    this.papel = dados.papel;
    this.competencias = dados.competencias ?? [];
    this.avaliacoes = dados.avaliacoes ?? [];
    this.valorHora = dados.valorHora ?? 50;
    this.disponivel = dados.disponivel ?? true;
  }

  public adicionarAvaliacao(avaliacao: Avaliacao): void {
    this.avaliacoes.push(avaliacao);
  }

  public calcularMediaAvaliacoes(): number {
    if (this.avaliacoes.length === 0) return 0;
    const soma = this.avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
    return soma / this.avaliacoes.length;
  }
}
