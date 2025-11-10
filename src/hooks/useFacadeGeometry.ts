import { useEffect, useMemo } from 'react';
import { BoxGeometry, BufferAttribute, BufferGeometry, Color, Matrix4, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TowerParameters } from '../types/tower';
import { applyEasingCurve } from '../utils/easing';
import { cubicBezierY, lerp, biasLerp } from '../utils/math';

const upAxis = new Vector3(0, 1, 0);
const scratchMatrix = new Matrix4();
const scratchDirection = new Vector3();
const scratchMidpoint = new Vector3();
const scratchQuaternion = new Quaternion();
const scratchScale = new Vector3();
const bottomColor = new Color();
const topColor = new Color();
const segmentColor = new Color();

export const useFacadeGeometry = (params: TowerParameters): BufferGeometry | null => {
  const geometry = useMemo(() => {
    const { floorCount } = params;
    if (floorCount < 2) {
      return null;
    }

    const segmentCount = Math.max(3, Math.floor(params.floorSegments));
    const towerOffset = -(floorCount * params.floorHeight) * 0.5;
    const baseGeometry = new BoxGeometry(1, 1, 1);
    const previousPoints: Array<[number, number, number] | null> = Array.from({ length: segmentCount }, () => null);
    const geometries: BufferGeometry[] = [];
    const profileSize = Math.min(0.2, Math.max(0.1, params.facadeProfile ?? 0.1));

    bottomColor.set(params.gradientColors.bottom);
    topColor.set(params.gradientColors.top);

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

      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        const angle = twistRadians + (segmentIndex / segmentCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const currentPoint: [number, number, number] = [x, y, z];
        const previous = previousPoints[segmentIndex];

        if (previous) {
          scratchDirection.set(currentPoint[0] - previous[0], currentPoint[1] - previous[1], currentPoint[2] - previous[2]);
          const length = scratchDirection.length();
          if (length > 1e-5) {
            scratchDirection.normalize();
            scratchMidpoint.set(
              (currentPoint[0] + previous[0]) * 0.5,
              (currentPoint[1] + previous[1]) * 0.5,
              (currentPoint[2] + previous[2]) * 0.5,
            );
            scratchQuaternion.setFromUnitVectors(upAxis, scratchDirection);
            scratchScale.set(profileSize, length, profileSize);
            scratchMatrix.compose(scratchMidpoint, scratchQuaternion, scratchScale);

            const segmentGeometry = baseGeometry.clone();
            segmentGeometry.applyMatrix4(scratchMatrix);

            const vertexCount = segmentGeometry.attributes.position.count;
            const colors = new Float32Array(vertexCount * 3);
            for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
              const offset = vertexIndex * 3;
              colors[offset] = segmentColor.r;
              colors[offset + 1] = segmentColor.g;
              colors[offset + 2] = segmentColor.b;
            }
            segmentGeometry.setAttribute('color', new BufferAttribute(colors, 3));

            geometries.push(segmentGeometry);
          }
        }

        previousPoints[segmentIndex] = currentPoint;
      }
    }

    baseGeometry.dispose();

    if (geometries.length === 0) {
      return null;
    }

    const merged = mergeGeometries(geometries, false);
    geometries.forEach((geometryInstance) => geometryInstance.dispose());
    return merged ?? null;
  }, [params]);

  useEffect(
    () => () => {
      geometry?.dispose();
    },
    [geometry],
  );

  return geometry;
};
