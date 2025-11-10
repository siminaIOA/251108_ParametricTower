import { Physics, RigidBody, CylinderCollider, CuboidCollider } from '@react-three/rapier';
import { useEffect, useMemo } from 'react';
import { BufferGeometry, Color, CylinderGeometry } from 'three';
import type { TowerParameters } from '../../types/tower';
import { applyEasingCurve } from '../../utils/easing';
import { biasLerp, lerp, cubicBezierY } from '../../utils/math';

type TowerPhysicsProps = {
  params: TowerParameters;
  seed: number;
};

type FloorInstance = {
  id: number;
  position: [number, number, number];
  twist: number;
  radius: number;
  thickness: number;
  color: string;
  jitter: { position: [number, number]; tilt: number };
};

const bottomColor = new Color();
const topColor = new Color();
const lerpedColor = new Color();

export const TowerPhysics = ({ params, seed }: TowerPhysicsProps) => {
  const segments = Math.max(3, Math.floor(params.floorSegments ?? 32));

  const baseGeometry = useMemo<BufferGeometry>(() => new CylinderGeometry(1, 1, 1, segments, 1, false), [segments]);

  useEffect(
    () => () => {
      baseGeometry.dispose();
    },
    [baseGeometry],
  );

  const floors = useMemo<FloorInstance[]>(() => {
    const { floorCount } = params;
    if (floorCount <= 0) {
      return [];
    }

    let randomSeed = seed || 1;
    const random = () => {
      randomSeed = (randomSeed * 16807) % 2147483647;
      return (randomSeed - 1) / 2147483646;
    };

    const towerOffset = -(floorCount * params.floorHeight) * 0.5;
    bottomColor.set(params.gradientColors.bottom);
    topColor.set(params.gradientColors.top);

    const instances: FloorInstance[] = [];

    for (let index = 0; index < floorCount; index += 1) {
      const normalized = floorCount === 1 ? 0 : index / (floorCount - 1);
      const biasedColorPosition = biasLerp(params.gradientBias, normalized);
      const scaleEase = applyEasingCurve(normalized, params.easing.scale);
      const twistEase = applyEasingCurve(normalized, params.easing.twist);
      const scaleT = params.scaleBezier.enabled
        ? cubicBezierY(normalized, params.scaleBezier.handles[0], params.scaleBezier.handles[1])
        : scaleEase;

      const radius = params.baseRadius * lerp(params.minScale, params.maxScale, scaleT);
      const twistRadians = (Math.PI / 180) * lerp(params.minTwist, params.maxTwist, twistEase);
      const centerY = towerOffset + index * params.floorHeight + params.floorHeight * 0.5;
      lerpedColor.lerpColors(bottomColor, topColor, biasedColorPosition);

      const lateralJitter = (random() - 0.5) * 0.15 * (1 + index / floorCount);
      const perpendicularJitter = (random() - 0.5) * 0.15 * (1 + index / floorCount);
      const tiltJitter = (random() - 0.5) * 0.1;

      instances.push({
        id: index,
        position: [lateralJitter, centerY, perpendicularJitter],
        radius,
        thickness: Math.max(params.floorThickness, 0.1),
        twist: twistRadians,
        color: lerpedColor.clone().getStyle(),
        jitter: {
          position: [lateralJitter, perpendicularJitter],
          tilt: tiltJitter,
        },
      });
    }

    return instances;
  }, [params, seed]);

  const basePlaneY = useMemo(() => {
    const towerOffset = -(params.floorCount * params.floorHeight) * 0.5;
    return towerOffset - Math.max(params.floorThickness, 0.1) * 0.5 - 0.05;
  }, [params.floorCount, params.floorHeight, params.floorThickness]);

  if (floors.length === 0) {
    return null;
  }

  return (
    <Physics gravity={[0, -20, 0]} timeStep="vary">
      <RigidBody type="fixed" friction={1} restitution={0.1}>
        <CuboidCollider args={[200, 0.5, 200]} position={[0, basePlaneY - 0.5, 0]} />
      </RigidBody>
      {floors.map((floor) => (
        <RigidBody
          key={`floor-${floor.id}`}
          colliders={false}
          position={[floor.position[0], floor.position[1], floor.position[2]]}
          rotation={[floor.jitter.tilt, floor.twist, -floor.jitter.tilt]}
          friction={0.8}
          restitution={0.05}
          linearDamping={0.15}
          angularDamping={0.35}
          canSleep={false}
        >
          <CylinderCollider args={[floor.thickness / 2, Math.max(0.2, floor.radius)]} />
          <mesh
            geometry={baseGeometry}
            scale={[floor.radius, floor.thickness, floor.radius]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={floor.color} roughness={0.45} metalness={0.05} toneMapped={false} />
          </mesh>
        </RigidBody>
      ))}
    </Physics>
  );
};
