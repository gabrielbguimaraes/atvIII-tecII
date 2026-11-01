export const SPEED_OF_LIGHT = 299792458;
export const PLANCK_CONSTANT = 6.62607015e-34;
export const GRAVITATIONAL_CONSTANT = 6.6743e-11;

export function calcularPotenciaPlanck(
  c: number = SPEED_OF_LIGHT,
  h: number = PLANCK_CONSTANT,
  g: number = GRAVITATIONAL_CONSTANT
): number {
  return Math.pow(c, 5) / (h * Math.pow(g, 2));
}

export const p_P = calcularPotenciaPlanck();
