export const clamp01 = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
};

export const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * clamp01(t);

export const biasLerp = (bias: number, value: number): number => {
  const clampedBias = clamp01(bias);
  return clamp01(value ** (Math.log(0.5) / Math.log(1 - clampedBias + Number.EPSILON)));
};
