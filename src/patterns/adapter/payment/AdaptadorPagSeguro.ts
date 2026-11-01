import { AdaptadorPagamento } from './AdaptadorPagamento';
import { GatewayPagamento } from './GatewayPagamento';

export class AdaptadorPagSeguro implements AdaptadorPagamento {
  private gateway: GatewayPagamento;

  constructor(gateway?: GatewayPagamento) {
    this.gateway = gateway ?? new GatewayPagamento();
  }

  public efetuarPagamento(valor: number, origem: string, destino: string): string {
    const transacao = this.gateway.processarPagamento(valor, {
      origem,
      destino,
      gatewayNome: 'PagSeguro',
      moeda: 'BRL'
    });
    return transacao.id;
  }

  public cancelarPagamento(id: string): boolean {
    return this.gateway.estornarPagamento(id);
  }

  public verificarPagamento(id: string): string {
    return this.gateway.consultarStatus(id);
  }
}
