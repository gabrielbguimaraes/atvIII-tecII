import { AdaptadorArmazenamento } from './AdaptadorArmazenamento';
import { ArmazenamentoExterno } from './ArmazenamentoExterno';
import { File } from './File';

export class AdaptadorLocal implements AdaptadorArmazenamento {
  private servicoExterno: ArmazenamentoExterno;
  private diretorioBase: string;

  constructor(servicoExterno?: ArmazenamentoExterno, diretorioBase: string = '/var/cinebridge/storage') {
    this.servicoExterno = servicoExterno ?? new ArmazenamentoExterno();
    this.diretorioBase = diretorioBase;
  }

  public salvarArquivo(conteudo: Buffer, metadados: any): string {
    const nome = metadados?.nome || `local-obj-${Date.now()}`;
    const arquivo: File = {
      nome,
      conteudo,
      pasta: this.diretorioBase,
      metadados: {
        ...metadados,
        provider: 'LocalStorage',
        baseDir: this.diretorioBase
      }
    };
    return this.servicoExterno.upload(arquivo);
  }

  public recuperarArquivo(id: string): Buffer {
    const arquivo = this.servicoExterno.download(id);
    return arquivo.conteudo;
  }

  public listarArquivos(prefixo: string): string[] {
    return this.servicoExterno.listar(prefixo || this.diretorioBase);
  }
}
