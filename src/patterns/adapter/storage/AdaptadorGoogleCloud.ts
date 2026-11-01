import { AdaptadorArmazenamento } from './AdaptadorArmazenamento';
import { ArmazenamentoExterno } from './ArmazenamentoExterno';
import { File } from './File';

export class AdaptadorGoogleCloud implements AdaptadorArmazenamento {
  private servicoExterno: ArmazenamentoExterno;
  private bucket: string;

  constructor(servicoExterno?: ArmazenamentoExterno, bucket: string = 'cinebridge-gcs-bucket') {
    this.servicoExterno = servicoExterno ?? new ArmazenamentoExterno();
    this.bucket = bucket;
  }

  public salvarArquivo(conteudo: Buffer, metadados: any): string {
    const nome = metadados?.nome || `gcs-obj-${Date.now()}`;
    const arquivo: File = {
      nome,
      conteudo,
      pasta: this.bucket,
      metadados: {
        ...metadados,
        provider: 'GoogleCloudStorage',
        bucket: this.bucket
      }
    };
    return this.servicoExterno.upload(arquivo);
  }

  public recuperarArquivo(id: string): Buffer {
    const arquivo = this.servicoExterno.download(id);
    return arquivo.conteudo;
  }

  public listarArquivos(prefixo: string): string[] {
    return this.servicoExterno.listar(prefixo || this.bucket);
  }
}
