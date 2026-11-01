import { Transacao } from './Transacao';

export class GatewayPagamento {
  private transacoes: Map<string, Transacao> = new Map();
  private contador: number = 0;

  public processarPagamento(valor: number, dados: any): Transacao {
    const id = `tx-${++this.contador}-${Date.now()}`;
    const transacao: Transacao = {
      id,
      valor,
      status: 'CONCLUIDO',
      origem: dados?.origem ?? 'desconhecido',
      destino: dados?.destino ?? 'cinebridge'
    };
    this.transacoes.set(id, transacao);
    return transacao;
  }

  public estornarPagamento(id: string): boolean {
    const transacao = this.transacoes.get(id);
    if (!transacao) {
      return false;
    }
    transacao.status = 'ESTORNADO';
    return true;
  }

  public consultarStatus(id: string): string {
    const transacao = this.transacoes.get(id);
    return transacao ? transacao.status : 'NAO_ENCONTRADO';
  }
}
