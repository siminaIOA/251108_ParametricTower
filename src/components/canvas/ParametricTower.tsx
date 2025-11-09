import type { BufferGeometry } from 'three';

type ParametricTowerProps = {
  geometry: BufferGeometry | null;
};

export const ParametricTower = ({ geometry }: ParametricTowerProps) => {
  if (!geometry) {
    return null;
  }

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial vertexColors toneMapped={false} roughness={0.25} metalness={0.05} />
    </mesh>
  );
};
