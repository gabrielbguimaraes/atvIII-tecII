import { File } from './File';

export class ArmazenamentoExterno {
  private arquivos: Map<string, File> = new Map();
  private contador: number = 0;

  public upload(arquivo: File): string {
    const id = `ext-${++this.contador}-${arquivo.nome}`;
    this.arquivos.set(id, {
      ...arquivo,
      conteudo: Buffer.from(arquivo.conteudo)
    });
    return id;
  }

  public download(id: string): File {
    const arquivo = this.arquivos.get(id);
    if (!arquivo) {
      throw new Error(`Arquivo não encontrado no armazenamento externo: ${id}`);
    }
    return {
      ...arquivo,
      conteudo: Buffer.from(arquivo.conteudo)
    };
  }

  public listar(pasta: string): string[] {
    const resultado: string[] = [];
    for (const [id, arquivo] of this.arquivos.entries()) {
      if (!pasta || (arquivo.pasta && arquivo.pasta.startsWith(pasta))) {
        resultado.push(id);
      }
    }
    return resultado;
  }
}
