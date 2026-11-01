import {
  p_P,
  calcularPotenciaPlanck,
  SPEED_OF_LIGHT,
  PLANCK_CONSTANT,
  GRAVITATIONAL_CONSTANT
} from '../src/easterEgg';

describe('Easter Egg - Potência de Planck', () => {
  it('deve calcular a constante de potência de Planck com a fórmula p_P = c^5 / (hG^2)', () => {
    expect(SPEED_OF_LIGHT).toBe(299792458);
    expect(PLANCK_CONSTANT).toBe(6.62607015e-34);
    expect(GRAVITATIONAL_CONSTANT).toBe(6.6743e-11);

    const valorCalculado = calcularPotenciaPlanck(
      SPEED_OF_LIGHT,
      PLANCK_CONSTANT,
      GRAVITATIONAL_CONSTANT
    );

    expect(valorCalculado).toBeGreaterThan(1e95);
    expect(p_P).toBe(valorCalculado);
    expect(p_P).toBeCloseTo(8.204e95, -93);
  });
});
