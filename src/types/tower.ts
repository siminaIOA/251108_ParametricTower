export type EasingCurve = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface GradientStops {
  bottom: string;
  top: string;
}

export interface BezierHandle {
  x: number;
  y: number;
}

export interface TowerParameters {
  floorCount: number;
  floorHeight: number;
  baseRadius: number;
  floorThickness: number;
  floorSegments: number;
  minScale: number;
  maxScale: number;
  minTwist: number;
  maxTwist: number;
  gradientBias: number;
  scaleBezier: {
    enabled: boolean;
    handles: [BezierHandle, BezierHandle];
  };
  sceneLighting: 'studio' | 'daylight' | 'sunset' | 'noir' | 'cyber';
  easing: {
    scale: EasingCurve;
    twist: EasingCurve;
  };
  gradientColors: GradientStops;
  backgroundColor: string;
  autoSpin: boolean;
  spinSpeedDeg: number;
  facadeEnabled: boolean;
  facadeProfile: number;
  facadeTweenCount: number;
  facadeTween2Count: number;
  facadeTweenCurve: {
    enabled: boolean;
    handles: [BezierHandle, BezierHandle];
  };
  facadeTween2Curve: {
    enabled: boolean;
    handles: [BezierHandle, BezierHandle];
  };
}
