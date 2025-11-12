import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

let cachedTexture: CanvasTexture | null = null;

const createSlabTexture = (): CanvasTexture | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  context.fillStyle = '#a9a39d';
  context.fillRect(0, 0, size, size);

  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'rgba(255,255,255,0.03)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.04)');
  gradient.addColorStop(1, 'rgba(255,255,255,0.02)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const blotchCount = 120;
  for (let index = 0; index < blotchCount; index += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 80 + 30;
    const rotation = Math.random() * Math.PI * 2;
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    const gradientBlotch = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradientBlotch.addColorStop(0, `rgba(150, 150, 150, ${0.12 + Math.random() * 0.08})`);
    gradientBlotch.addColorStop(1, 'rgba(120, 120, 120, 0)');
    context.fillStyle = gradientBlotch;
    context.fillRect(-radius, -radius, radius * 2, radius * 2);
    context.restore();
  }

  const speckCount = 2200;
  for (let index = 0; index < speckCount; index += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = 0.035 + Math.random() * 0.04;
    const radius = Math.random() * 1.4 + 0.4;
    context.beginPath();
    context.fillStyle = `rgba(35, 35, 35, ${alpha})`;
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  for (let index = 0; index < speckCount / 3; index += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = 0.04 + Math.random() * 0.04;
    const radius = Math.random() * 1.2 + 0.3;
    context.beginPath();
    context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
};

export const getSlabTexture = (): CanvasTexture | null => {
  if (cachedTexture) {
    return cachedTexture;
  }
  cachedTexture = createSlabTexture();
  return cachedTexture;
};
