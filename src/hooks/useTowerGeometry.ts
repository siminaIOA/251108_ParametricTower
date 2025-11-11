import { useEffect, useMemo } from 'react';
import { BufferAttribute, BufferGeometry, Color, Matrix4, Quaternion, Vector3 } from 'three';
import { createPolygonBaseGeometry } from '../utils/polygon';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TowerParameters } from '../types/tower';
import { applyEasingCurve } from '../utils/easing';
import { biasLerp, lerp, cubicBezierY } from '../utils/math';

const scratchMatrix = new Matrix4();
const scratchQuaternion = new Quaternion();
const scratchPosition = new Vector3();
const scratchScale = new Vector3();
const bottomColor = new Color();
const topColor = new Color();
const vertexColor = new Color();
const upAxis = new Vector3(0, 1, 0);

export const useTowerGeometry = (params: TowerParameters): BufferGeometry | null => {
  const geometry = useMemo<BufferGeometry | null>(() => {
    const { floorCount } = params;
    if (floorCount <= 0) {
      return null;
    }

    bottomColor.set(params.gradientColors.bottom);
    topColor.set(params.gradientColors.top);

    const radialSegments = Math.max(3, Math.floor(params.floorSegments ?? 32));
    const { geometry: baseGeometry } = createPolygonBaseGeometry(radialSegments);
    const towerOffset = -(floorCount * params.floorHeight) * 0.5;
    const geometries: BufferGeometry[] = [];

    for (let index = 0; index < floorCount; index += 1) {
      const normalized = floorCount === 1 ? 0 : index / (floorCount - 1);
      const biasedColorPosition = biasLerp(params.gradientBias, normalized);
      const scaleEase = applyEasingCurve(normalized, params.easing.scale);
      const twistEase = applyEasingCurve(normalized, params.easing.twist);
      const scaleT = params.scaleBezier.enabled
        ? cubicBezierY(normalized, params.scaleBezier.handles[0], params.scaleBezier.handles[1])
        : scaleEase;
      const radiusMultiplier = lerp(params.minScale, params.maxScale, scaleT);
      const twistDeg = lerp(params.minTwist, params.maxTwist, twistEase);
      const twistRadians = (Math.PI / 180) * twistDeg;

      scratchPosition.set(0, towerOffset + index * params.floorHeight + params.floorHeight * 0.5, 0);
      scratchQuaternion.setFromAxisAngle(upAxis, twistRadians);
      scratchScale.set(params.baseRadius * radiusMultiplier, Math.max(params.floorThickness, 0.05), params.baseRadius * radiusMultiplier);

      scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);

      const floorGeometry = baseGeometry.clone();
      floorGeometry.applyMatrix4(scratchMatrix);

      vertexColor.lerpColors(bottomColor, topColor, biasedColorPosition);
      const vertexCount = floorGeometry.attributes.position.count;
      const colors = new Float32Array(vertexCount * 3);
      for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
        const offset = vertexIndex * 3;
        colors[offset] = vertexColor.r;
        colors[offset + 1] = vertexColor.g;
        colors[offset + 2] = vertexColor.b;
      }
      floorGeometry.setAttribute('color', new BufferAttribute(colors, 3));
      geometries.push(floorGeometry);
    }

    const merged = mergeGeometries(geometries, false);
    baseGeometry.dispose();
    geometries.forEach((geom) => geom.dispose());
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
