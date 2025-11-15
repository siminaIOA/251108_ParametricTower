import { TransformControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { Event as ThreeEvent, Object3DEventMap } from 'three';
import type { OrbitControls as OrbitControlsImpl, TransformControls as TransformControlsImpl } from 'three-stdlib';
import { ensureTransformControlsPatch } from '../../utils/transformControlsPatch';

type PinchAttractorsProps = {
  attractors: { x: number; y: number; z: number }[];
  enabled: boolean;
  onChange: (index: number, position: { x: number; y: number; z: number }) => void;
  orbitControlsRef: MutableRefObject<OrbitControlsImpl | null>;
};

ensureTransformControlsPatch();

const AttractorControl = ({
  index,
  attractor,
  onChange,
  orbitControlsRef,
}: {
  index: number;
  attractor: { x: number; y: number; z: number };
  onChange: (index: number, position: { x: number; y: number; z: number }) => void;
  orbitControlsRef: MutableRefObject<OrbitControlsImpl | null>;
}) => {
  const controlRef = useRef<TransformControlsImpl | null>(null);
  const previousOrbitState = useRef<{ rotate: boolean; pan: boolean; zoom: boolean } | null>(null);

  const lockOrbit = () => {
    const orbit = orbitControlsRef.current;
    if (!orbit) {
      return;
    }
    if (!previousOrbitState.current) {
      previousOrbitState.current = {
        rotate: orbit.enableRotate,
        pan: orbit.enablePan,
        zoom: orbit.enableZoom,
      };
    }
    orbit.enableRotate = false;
    orbit.enablePan = false;
    orbit.enableZoom = false;
  };

  const releaseOrbit = () => {
    const orbit = orbitControlsRef.current;
    if (!orbit) {
      return;
    }
    const previous = previousOrbitState.current;
    orbit.enableRotate = previous?.rotate ?? true;
    orbit.enablePan = previous?.pan ?? true;
    orbit.enableZoom = previous?.zoom ?? true;
    previousOrbitState.current = null;
  };

  useEffect(() => {
    const controls = controlRef.current;
    if (!controls) {
      return;
    }
    const handleDrag = (event: { value: boolean }) => {
      if (!event.value) {
        releaseOrbit();
      }
    };
    const handleMouseDown = () => {
      lockOrbit();
    };
    const handleMouseUp = () => {
      releaseOrbit();
    };
    controls.addEventListener('dragging-changed' as unknown as keyof Object3DEventMap, handleDrag as any);
    controls.addEventListener('mouseDown' as unknown as keyof Object3DEventMap, handleMouseDown as any);
    controls.addEventListener('mouseUp' as unknown as keyof Object3DEventMap, handleMouseUp as any);
    return () => {
      controls.removeEventListener('dragging-changed' as unknown as keyof Object3DEventMap, handleDrag as any);
      controls.removeEventListener('mouseDown' as unknown as keyof Object3DEventMap, handleMouseDown as any);
      controls.removeEventListener('mouseUp' as unknown as keyof Object3DEventMap, handleMouseUp as any);
      releaseOrbit();
    };
  }, [orbitControlsRef]);

  return (
    <TransformControls
      ref={controlRef}
      position={[attractor.x, attractor.y, attractor.z]}
      mode="translate"
      size={1}
      showX
      showY
      showZ
      onPointerDown={(event: any) => {
        event.stopPropagation?.();
        lockOrbit();
      }}
      onPointerUp={(event: any) => {
        event.stopPropagation?.();
        releaseOrbit();
      }}
      onPointerMissed={() => {
        releaseOrbit();
      }}
      onObjectChange={(event?: ThreeEvent) => {
        if (!event) {
          return;
        }
        const target = event.target as unknown as { object?: { position: { x: number; y: number; z: number } } };
        const objectPosition = target.object?.position;
        if (!objectPosition) {
          return;
        }
        const { x, y, z } = objectPosition;
        onChange(index, { x, y, z });
      }}
    >
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#555555" emissiveIntensity={0.4} />
      </mesh>
    </TransformControls>
  );
};

export const PinchAttractors = ({ attractors, enabled, onChange, orbitControlsRef }: PinchAttractorsProps) => {
  if (!enabled) {
    return null;
  }

  return (
    <>
      {attractors.map((attractor, index) => (
        <AttractorControl
          key={`pinch-attractor-${index}`}
          index={index}
          attractor={attractor}
          onChange={onChange}
          orbitControlsRef={orbitControlsRef}
        />
      ))}
    </>
  );
};
