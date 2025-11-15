import type { TowerParameters } from '../types/tower';

export const defaultTowerParameters: TowerParameters = {
  floorCount: 20,
  floorHeight: 4,
  baseRadius: 4,
  floorThickness: 0.4,
  floorSegments: 4,
  minScale: 1.29,
  maxScale: 1.3,
  minTwist: 0,
  maxTwist: 210,
  gradientBias: 0.35,
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
    bottom: '#0064ff',
    top: '#ffffff',
  },
  backgroundColor: '#080a14',
  autoSpin: false,
  spinSpeedDeg: 6,
  facadeEnabled: true,
  facadeProfile: 0.25,
  facadeTweenCount: 10,
  facadeTween2Count: 1,
  facadeTweenCurve: {
    enabled: false,
    handles: [
      { x: 0.25, y: 0.15 },
      { x: 0.75, y: 0.85 },
    ],
  },
  facadeTween2Curve: {
    enabled: false,
    handles: [
      { x: 0.25, y: 0.15 },
      { x: 0.75, y: 0.85 },
    ],
  },
  pinchSpread: {
    enabled: false,
    radius: 4,
    strength: 0,
    attractors: [
      { x: 6, y: 2, z: 0 },
      { x: -6, y: 6, z: 0 },
      { x: 0, y: 4, z: 6 },
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
  facadeTween2Count: defaultTowerParameters.facadeTween2Count,
  facadeTweenCurve: {
    enabled: defaultTowerParameters.facadeTweenCurve.enabled,
    handles: defaultTowerParameters.facadeTweenCurve.handles.map((handle) => ({ ...handle })) as [
      TowerParameters['facadeTweenCurve']['handles'][number],
      TowerParameters['facadeTweenCurve']['handles'][number],
    ],
  },
  facadeTween2Curve: {
    enabled: defaultTowerParameters.facadeTween2Curve.enabled,
    handles: defaultTowerParameters.facadeTween2Curve.handles.map((handle) => ({ ...handle })) as [
      TowerParameters['facadeTween2Curve']['handles'][number],
      TowerParameters['facadeTween2Curve']['handles'][number],
    ],
  },
  pinchSpread: {
    enabled: defaultTowerParameters.pinchSpread.enabled,
    radius: defaultTowerParameters.pinchSpread.radius,
    strength: defaultTowerParameters.pinchSpread.strength,
    attractors: defaultTowerParameters.pinchSpread.attractors.map((a) => ({ ...a })),
  },
});
