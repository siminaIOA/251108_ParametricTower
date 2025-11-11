import { useEffect, useMemo } from 'react';
import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Matrix4, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TowerParameters } from '../types/tower';
import { applyEasingCurve } from '../utils/easing';
import { cubicBezierY, lerp, biasLerp } from '../utils/math';
import { createPolygonBaseGeometry } from '../utils/polygon';

const upAxis = new Vector3(0, 1, 0);
const scratchMatrix = new Matrix4();
const scratchDirection = new Vector3();
const scratchMidpoint = new Vector3();
const scratchQuaternion = new Quaternion();
const scratchScale = new Vector3();
const scratchVector = new Vector3();
const bottomColor = new Color();
const topColor = new Color();
const segmentColor = new Color();

type FacadeGeometryResult = {
  rails: BufferGeometry | null;
  tweens: BufferGeometry | null;
};

export const useFacadeGeometry = (params: TowerParameters): FacadeGeometryResult => {
  const result = useMemo<FacadeGeometryResult>(() => {
    const { floorCount } = params;
    if (floorCount < 2) {
      return { rails: null, tweens: null };
    }

    const segmentCount = Math.max(3, Math.floor(params.floorSegments));
    const towerOffset = -(floorCount * params.floorHeight) * 0.5;
    const baseGeometry = new BoxGeometry(1, 1, 1);
    const { corners: baseCorners } = createPolygonBaseGeometry(segmentCount);
    const railGeometries: BufferGeometry[] = [];
    const tweenPositions: number[] = [];
    const profileSize = Math.min(0.2, Math.max(0.1, params.facadeProfile ?? 0.1));
    const tweenCount = Math.max(1, Math.floor(params.facadeTweenCount ?? 1));

    bottomColor.set(params.gradientColors.bottom);
    topColor.set(params.gradientColors.top);

    const ringPoints: Array<Array<[number, number, number]>> = Array.from({ length: floorCount }, () => []);
    const floorColors: Color[] = [];

    for (let floorIndex = 0; floorIndex < floorCount; floorIndex += 1) {
      const normalized = floorCount === 1 ? 0 : floorIndex / (floorCount - 1);
      const biasedColorPosition = biasLerp(params.gradientBias, normalized);
      const scaleEase = applyEasingCurve(normalized, params.easing.scale);
      const twistEase = applyEasingCurve(normalized, params.easing.twist);
      const scaleT = params.scaleBezier.enabled
        ? cubicBezierY(normalized, params.scaleBezier.handles[0], params.scaleBezier.handles[1])
        : scaleEase;

      const radius = params.baseRadius * lerp(params.minScale, params.maxScale, scaleT);
      const twistRadians = (Math.PI / 180) * lerp(params.minTwist, params.maxTwist, twistEase);
      const y = towerOffset + floorIndex * params.floorHeight + params.floorHeight * 0.5;

      segmentColor.lerpColors(bottomColor, topColor, biasedColorPosition);

      floorColors[floorIndex] = segmentColor.clone();

      scratchQuaternion.setFromAxisAngle(upAxis, twistRadians);

      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        scratchVector.copy(baseCorners[segmentIndex]).multiplyScalar(radius).applyQuaternion(scratchQuaternion);
        ringPoints[floorIndex][segmentIndex] = [scratchVector.x, y, scratchVector.z];
      }
    }

    const appendSegment = (start: [number, number, number], end: [number, number, number], color: Color) => {
      scratchDirection.set(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
      const length = scratchDirection.length();
      if (length <= 1e-5) {
        return;
      }
      scratchDirection.normalize();
      scratchMidpoint.set((start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5, (start[2] + end[2]) * 0.5);
      scratchQuaternion.setFromUnitVectors(upAxis, scratchDirection);
      scratchScale.set(profileSize, length, profileSize);
      scratchMatrix.compose(scratchMidpoint, scratchQuaternion, scratchScale);

      const segmentGeometry = baseGeometry.clone();
      segmentGeometry.applyMatrix4(scratchMatrix);

      const vertexCount = segmentGeometry.attributes.position.count;
      const colors = new Float32Array(vertexCount * 3);
      for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
        const offset = vertexIndex * 3;
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
      }
      segmentGeometry.setAttribute('color', new BufferAttribute(colors, 3));
      railGeometries.push(segmentGeometry);
    };

    const appendRailSegments = (points: [number, number, number][]) => {
      let previous: [number, number, number] | null = null;
      for (let floorIndex = 0; floorIndex < points.length; floorIndex += 1) {
        const current = points[floorIndex];
        if (previous) {
          appendSegment(previous, current, floorColors[floorIndex]);
        }
        previous = current;
      }
    };

    const appendTweenLine = (points: [number, number, number][]) => {
      for (let floorIndex = 1; floorIndex < points.length; floorIndex += 1) {
        const start = points[floorIndex - 1];
        const end = points[floorIndex];
        tweenPositions.push(start[0], start[1], start[2], end[0], end[1], end[2]);
      }
    };

    // Primary rails
    const applyTweenCurve = (value: number) =>
      params.facadeTweenCurve.enabled
        ? cubicBezierY(value, params.facadeTweenCurve.handles[0], params.facadeTweenCurve.handles[1])
        : value;

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      const railPoints = ringPoints.map((ring) => ring[segmentIndex]);
      appendRailSegments(railPoints);
    }

    // Tween rails
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      const nextIndex = (segmentIndex + 1) % segmentCount;
      for (let tweenIndex = 1; tweenIndex <= tweenCount; tweenIndex += 1) {
        const baseFactor = tweenIndex / (tweenCount + 1);
        const factor = applyTweenCurve(baseFactor);
        const tweenPoints: [number, number, number][] = [];
        for (let floorIndex = 0; floorIndex < floorCount; floorIndex += 1) {
          const start = ringPoints[floorIndex][segmentIndex];
          const end = ringPoints[floorIndex][nextIndex];
          tweenPoints.push([
            start[0] + (end[0] - start[0]) * factor,
            start[1] + (end[1] - start[1]) * factor,
            start[2] + (end[2] - start[2]) * factor,
          ]);
        }
        appendTweenLine(tweenPoints);
      }
    }

    baseGeometry.dispose();

    const rails = railGeometries.length > 0 ? mergeGeometries(railGeometries, false) ?? null : null;
    railGeometries.forEach((geometryInstance) => geometryInstance.dispose());

    const tweens =
      tweenPositions.length > 0
        ? new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(tweenPositions), 3))
        : null;

    return { rails, tweens };
  }, [params]);

  useEffect(
    () => () => {
      result.rails?.dispose();
      result.tweens?.dispose();
    },
    [result],
  );

  return result;
};
