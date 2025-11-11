import { BufferGeometry, ExtrudeGeometry, Shape, Vector3 } from 'three';

type PolygonBase = {
  geometry: BufferGeometry;
  corners: Vector3[];
};

export const createPolygonBaseGeometry = (segments: number): PolygonBase => {
  const clampedSegments = Math.max(3, Math.floor(segments));
  const shape = new Shape();
  for (let index = 0; index < clampedSegments; index += 1) {
    const angle = (index / clampedSegments) * Math.PI * 2;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    if (index === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();

  const extrude = new ExtrudeGeometry(shape, { depth: 1, steps: 1, bevelEnabled: false });
  extrude.center();
  extrude.rotateX(Math.PI / 2);

  const corners: Vector3[] = [];
  const positions = extrude.attributes.position.array;
  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index];
    const y = positions[index + 1];
    const z = positions[index + 2];
    if (Math.abs(y - 0.5) < 1e-4) {
      corners.push(new Vector3(x, 0, z));
    }
  }

  if (corners.length > clampedSegments) {
    const unique: Vector3[] = [];
    const seen = new Set<string>();
    for (const corner of corners) {
      const key = `${corner.x.toFixed(5)},${corner.z.toFixed(5)}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      unique.push(corner);
    }
    unique.sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));
    corners.length = 0;
    corners.push(...unique);
  } else {
    corners.sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));
  }

  return { geometry: extrude, corners };
};
