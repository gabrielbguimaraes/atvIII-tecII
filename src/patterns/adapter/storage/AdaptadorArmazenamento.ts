export interface AdaptadorArmazenamento {
  salvarArquivo(conteudo: Buffer, metadados: any): string;
  recuperarArquivo(id: string): Buffer;
  listarArquivos(prefixo: string): string[] ;
}
