import type { BufferGeometry } from 'three';

type FacadeStructureProps = {
  railGeometry: BufferGeometry | null;
  tweenGeometry: BufferGeometry | null;
};

export const FacadeStructure = ({ railGeometry, tweenGeometry }: FacadeStructureProps) => {
  if (!railGeometry && !tweenGeometry) {
    return null;
  }

  return (
    <>
      {railGeometry && (
        <mesh geometry={railGeometry} castShadow receiveShadow>
          <meshStandardMaterial vertexColors toneMapped={false} roughness={0.35} metalness={0.1} />
        </mesh>
      )}
      {tweenGeometry && (
        <lineSegments geometry={tweenGeometry}>
          <lineBasicMaterial color="#ffffff" linewidth={1} transparent opacity={0.85} depthWrite={false} />
        </lineSegments>
      )}
    </>
  );
};
