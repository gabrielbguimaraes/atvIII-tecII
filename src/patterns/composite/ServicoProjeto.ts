export interface ServicoProjeto {
  calcularCusto(): number;
  listarSubservicos(): ServicoProjeto[];
  obterPrazo(): number;
  validar(): boolean;
}
