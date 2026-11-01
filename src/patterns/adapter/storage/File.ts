export interface File {
  nome: string;
  conteudo: Buffer;
  pasta?: string;
  metadados?: any;
}
