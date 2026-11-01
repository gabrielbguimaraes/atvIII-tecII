export interface Transacao {
  id: string;
  status: string;
  valor: number;
  origem?: string;
  destino?: string;
}
