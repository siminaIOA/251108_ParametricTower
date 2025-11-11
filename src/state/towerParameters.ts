import type { TowerParameters } from '../types/tower';

export const defaultTowerParameters: TowerParameters = {
  floorCount: 20,
  floorHeight: 4,
  baseRadius: 6,
  floorThickness: 0.4,
  floorSegments: 4,
  minScale: 0.65,
  maxScale: 1.25,
  minTwist: 0,
  maxTwist: 210,
  gradientBias: 0.5,
  scaleBezier: {
    enabled: false,
    handles: [
      { x: 0.3, y: 0.1 },
      { x: 0.7, y: 0.9 },
    ],
  },
  sceneLighting: 'studio',
  easing: {
    scale: 'easeInOut',
    twist: 'easeOut',
  },
  gradientColors: {
    bottom: '#03a9f4',
    top: '#ffb347',
  },
  backgroundColor: '#080a14',
  autoSpin: false,
  spinSpeedDeg: 6,
  facadeEnabled: false,
  facadeProfile: 0.1,
  facadeTweenCount: 5,
  facadeTweenCurve: {
    enabled: false,
    handles: [
      { x: 0.25, y: 0.15 },
      { x: 0.75, y: 0.85 },
    ],
  },
};

export const createDefaultTowerParameters = (): TowerParameters => ({
  ...defaultTowerParameters,
  easing: { ...defaultTowerParameters.easing },
  gradientColors: { ...defaultTowerParameters.gradientColors },
  backgroundColor: defaultTowerParameters.backgroundColor,
  gradientBias: defaultTowerParameters.gradientBias,
  scaleBezier: {
    enabled: defaultTowerParameters.scaleBezier.enabled,
    handles: defaultTowerParameters.scaleBezier.handles.map((handle) => ({ ...handle })) as [
      TowerParameters['scaleBezier']['handles'][number],
      TowerParameters['scaleBezier']['handles'][number],
    ],
  },
  sceneLighting: defaultTowerParameters.sceneLighting,
  autoSpin: defaultTowerParameters.autoSpin,
  spinSpeedDeg: defaultTowerParameters.spinSpeedDeg,
  facadeEnabled: defaultTowerParameters.facadeEnabled,
  facadeProfile: defaultTowerParameters.facadeProfile,
  facadeTweenCount: defaultTowerParameters.facadeTweenCount,
  facadeTweenCurve: {
    enabled: defaultTowerParameters.facadeTweenCurve.enabled,
    handles: defaultTowerParameters.facadeTweenCurve.handles.map((handle) => ({ ...handle })) as [
      TowerParameters['facadeTweenCurve']['handles'][number],
      TowerParameters['facadeTweenCurve']['handles'][number],
    ],
  },
});
