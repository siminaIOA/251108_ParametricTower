import { useEffect, useRef } from 'react';
import { Color, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import type { TowerParameters } from '../../types/tower';
import { applyEasingCurve } from '../../utils/easing';
import { lerp } from '../../utils/math';

type ParametricTowerProps = {
  params: TowerParameters;
};

const scratchMatrix = new Matrix4();
const scratchQuaternion = new Quaternion();
const scratchPosition = new Vector3();
const scratchScale = new Vector3();
const scratchColor = new Color();
const bottomColor = new Color();
const topColor = new Color();
const upAxis = new Vector3(0, 1, 0);

export const ParametricTower = ({ params }: ParametricTowerProps) => {
  const meshRef = useRef<InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const { floorCount } = params;
    bottomColor.set(params.gradientColors.bottom);
    topColor.set(params.gradientColors.top);

    mesh.count = floorCount;

    const towerOffset = -(floorCount * params.floorHeight) * 0.5;

    for (let index = 0; index < floorCount; index += 1) {
      const normalized = floorCount === 1 ? 0 : index / (floorCount - 1);
      const scaleEase = applyEasingCurve(normalized, params.easing.scale);
      const twistEase = applyEasingCurve(normalized, params.easing.twist);

      const radiusMultiplier = lerp(params.minScale, params.maxScale, scaleEase);
      const twistDeg = lerp(params.minTwist, params.maxTwist, twistEase);
      const twistRadians = (Math.PI / 180) * twistDeg;

      scratchPosition.set(0, towerOffset + index * params.floorHeight + params.floorHeight * 0.5, 0);
      scratchQuaternion.setFromAxisAngle(upAxis, twistRadians);
      scratchScale.set(
        params.baseRadius * radiusMultiplier,
        Math.max(params.floorHeight * 0.45, 0.1),
        params.baseRadius * radiusMultiplier,
      );

      scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);
      mesh.setMatrixAt(index, scratchMatrix);

      scratchColor.lerpColors(bottomColor, topColor, normalized);
      mesh.setColorAt(index, scratchColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [params]);

  return (
    <group>
      <instancedMesh
        key={params.floorCount}
        ref={meshRef}
        args={[undefined, undefined, params.floorCount]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 1, 48, 1, true]} />
        <meshStandardMaterial vertexColors roughness={0.3} metalness={0.15} />
      </instancedMesh>
    </group>
  );
};
