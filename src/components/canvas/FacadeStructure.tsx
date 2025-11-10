import type { BufferGeometry } from 'three';

type FacadeStructureProps = {
  geometry: BufferGeometry | null;
};

export const FacadeStructure = ({ geometry }: FacadeStructureProps) => {
  if (!geometry) {
    return null;
  }

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial vertexColors toneMapped={false} roughness={0.35} metalness={0.1} />
    </mesh>
  );
};
