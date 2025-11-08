import type { EasingCurve } from '../types/tower';
import { clamp01 } from './math';

export const applyEasingCurve = (value: number, curve: EasingCurve): number => {
  const t = clamp01(value);

  switch (curve) {
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default:
      return t;
  }
};
