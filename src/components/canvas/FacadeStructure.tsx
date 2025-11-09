import { useEffect, useMemo } from 'react';
import { BufferAttribute, BufferGeometry } from 'three';
import type { TowerParameters } from '../../types/tower';
import { applyEasingCurve } from '../../utils/easing';
import { cubicBezierY, lerp } from '../../utils/math';

type FacadeStructureProps = {
  params: TowerParameters;
};

const TAU = Math.PI * 2;

export const FacadeStructure = ({ params }: FacadeStructureProps) => {
  const geometry = useMemo(() => {
    const { floorCount } = params;
    if (floorCount < 2) {
      return null;
    }

    const segmentCount = Math.max(3, Math.floor(params.floorSegments));
    const towerOffset = -(floorCount * params.floorHeight) * 0.5;
    const positions: number[] = [];
    const previousPoints: Array<[number, number, number] | null> = Array.from({ length: segmentCount }, () => null);

    for (let floorIndex = 0; floorIndex < floorCount; floorIndex += 1) {
      const normalized = floorCount === 1 ? 0 : floorIndex / (floorCount - 1);
      const scaleEase = applyEasingCurve(normalized, params.easing.scale);
      const twistEase = applyEasingCurve(normalized, params.easing.twist);
      const scaleT = params.scaleBezier.enabled
        ? cubicBezierY(normalized, params.scaleBezier.handles[0], params.scaleBezier.handles[1])
        : scaleEase;

      const radius = params.baseRadius * lerp(params.minScale, params.maxScale, scaleT);
      const twistRadians = (Math.PI / 180) * lerp(params.minTwist, params.maxTwist, twistEase);
      const y = towerOffset + floorIndex * params.floorHeight + params.floorHeight * 0.5;

      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        const angle = twistRadians + (segmentIndex / segmentCount) * TAU;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const currentPoint: [number, number, number] = [x, y, z];
        const previous = previousPoints[segmentIndex];

        if (previous) {
          positions.push(previous[0], previous[1], previous[2], currentPoint[0], currentPoint[1], currentPoint[2]);
        }

        previousPoints[segmentIndex] = currentPoint;
      }
    }

    if (positions.length === 0) {
      return null;
    }

    const bufferGeometry = new BufferGeometry();
    bufferGeometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    return bufferGeometry;
  }, [params]);

  useEffect(
    () => () => {
      geometry?.dispose();
    },
    [geometry],
  );

  if (!geometry) {
    return null;
  }

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ffffff" opacity={0.9} transparent depthWrite={false} toneMapped={false} />
    </lineSegments>
  );
};
