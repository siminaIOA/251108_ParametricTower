import type { TowerParameters } from '../types/tower';

export const defaultTowerParameters: TowerParameters = {
  floorCount: 36,
  floorHeight: 4,
  baseRadius: 6,
  minScale: 0.65,
  maxScale: 1.25,
  minTwist: 0,
  maxTwist: 210,
  easing: {
    scale: 'easeInOut',
    twist: 'easeOut',
  },
  gradientColors: {
    bottom: '#03a9f4',
    top: '#ffb347',
  },
};

export const createDefaultTowerParameters = (): TowerParameters => ({
  ...defaultTowerParameters,
  easing: { ...defaultTowerParameters.easing },
  gradientColors: { ...defaultTowerParameters.gradientColors },
});
