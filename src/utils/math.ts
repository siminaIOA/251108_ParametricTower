import type { BezierHandle } from '../types/tower';

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

export const cubicBezierY = (x: number, handleA: BezierHandle, handleB: BezierHandle): number => {
  const epsilon = 1e-6;
  const cx = 3 * handleA.x;
  const bx = 3 * (handleB.x - handleA.x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * handleA.y;
  const by = 3 * (handleB.y - handleA.y) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  let t = clamp01(x);

  for (let i = 0; i < 5; i += 1) {
    const xEstimate = sampleCurveX(t) - x;
    if (Math.abs(xEstimate) < epsilon) {
      return clamp01(sampleCurveY(t));
    }
    const derivative = sampleCurveDerivativeX(t);
    if (Math.abs(derivative) < epsilon) {
      break;
    }
    t -= xEstimate / derivative;
  }

  let t0 = 0;
  let t1 = 1;
  t = clamp01(x);
  while (t0 < t1) {
    const xEstimate = sampleCurveX(t);
    if (Math.abs(xEstimate - x) < epsilon) {
      break;
    }
    if (x > xEstimate) {
      t0 = t;
    } else {
      t1 = t;
    }
    t = (t0 + t1) * 0.5;
  }

  return clamp01(sampleCurveY(t));
};
