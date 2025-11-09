export type EasingCurve = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface GradientStops {
  bottom: string;
  top: string;
}

export interface TowerParameters {
  floorCount: number;
  floorHeight: number;
  baseRadius: number;
  floorThickness: number;
  minScale: number;
  maxScale: number;
  minTwist: number;
  maxTwist: number;
  gradientBias: number;
  easing: {
    scale: EasingCurve;
    twist: EasingCurve;
  };
  gradientColors: GradientStops;
  backgroundColor: string;
}
