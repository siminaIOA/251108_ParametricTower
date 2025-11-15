import { TransformControls as TransformControlsImpl } from 'three-stdlib';

let isPatched = false;

export const ensureTransformControlsPatch = () => {
  if (isPatched) {
    return;
  }

  const prototype = TransformControlsImpl.prototype as unknown as {
    pointerDown: (pointer: { button: number } | null) => void;
    pointerUp: (pointer: { button: number } | null) => void;
  };

  const patchPointer = (pointer: { button: number } | null) => {
    if (pointer && pointer.button === 1) {
      pointer.button = 0;
    }
    return pointer;
  };

  const originalPointerDown = prototype.pointerDown;
  prototype.pointerDown = function pointerDownPatched(pointer: { button: number } | null) {
    return originalPointerDown.call(this, patchPointer(pointer));
  };

  const originalPointerUp = prototype.pointerUp;
  prototype.pointerUp = function pointerUpPatched(pointer: { button: number } | null) {
    return originalPointerUp.call(this, patchPointer(pointer));
  };

  isPatched = true;
};
