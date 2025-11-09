import { BufferGeometry } from 'three';

const formatNumber = (value: number): string => value.toFixed(6);

export const serializeGeometryAsOBJ = (geometry: BufferGeometry): string => {
  const nonIndexed = geometry.toNonIndexed();
  const positions = nonIndexed.getAttribute('position');
  const colors = nonIndexed.getAttribute('color');
  const vertexCount = positions.count;
  const hasColors = Boolean(colors);

  const lines: string[] = ['# Parametric tower export', 'o ParametricTower'];

  for (let i = 0; i < vertexCount; i += 1) {
    const positionSegment = `${formatNumber(positions.getX(i))} ${formatNumber(positions.getY(i))} ${formatNumber(positions.getZ(i))}`;
    if (hasColors && colors) {
      const colorSegment = `${formatNumber(colors.getX(i))} ${formatNumber(colors.getY(i))} ${formatNumber(colors.getZ(i))}`;
      lines.push(`v ${positionSegment} ${colorSegment}`);
    } else {
      lines.push(`v ${positionSegment}`);
    }
  }

  for (let i = 0; i < vertexCount; i += 3) {
    const a = i + 1;
    const b = i + 2;
    const c = i + 3;
    lines.push(`f ${a} ${b} ${c}`);
  }

  return `${lines.join('\n')}\n`;
};
