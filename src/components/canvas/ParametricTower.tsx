import { useMemo } from 'react';
import type { BufferGeometry } from 'three';
import { getSlabTexture } from '../../utils/textures';

type ParametricTowerProps = {
  geometry: BufferGeometry | null;
};

export const ParametricTower = ({ geometry }: ParametricTowerProps) => {
  const slabTexture = useMemo(() => getSlabTexture(), []);

  if (!geometry) {
    return null;
  }

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors
        toneMapped={false}
        roughness={0.35}
        metalness={0.05}
        map={slabTexture ?? undefined}
      />
    </mesh>
  );
};
