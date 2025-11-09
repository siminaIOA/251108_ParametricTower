import { useEffect, useRef, useState } from 'react';
import type { BezierHandle } from '../../types/tower';

type BezierEditorProps = {
  open: boolean;
  handles: [BezierHandle, BezierHandle];
  onChange: (handles: [BezierHandle, BezierHandle]) => void;
  onClose: () => void;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

export const BezierEditor = ({ open, handles, onChange, onClose }: BezierEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (dragIndex === null) {
        return;
      }
      const bounds = containerRef.current?.getBoundingClientRect();
      if (!bounds) {
        return;
      }
      const x = clamp((event.clientX - bounds.left) / bounds.width);
      const y = clamp(1 - (event.clientY - bounds.top) / bounds.height);
      const next = handles.map((handle, index) => (index === dragIndex ? { x, y } : handle)) as [
        BezierHandle,
        BezierHandle,
      ];
      onChange(next);
    };

    const endDrag = () => setDragIndex(null);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', endDrag);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', endDrag);
    };
  }, [dragIndex, handles, onChange]);

  if (!open) {
    return null;
  }

  const size = 280;
  const toSvg = (handle: BezierHandle) => ({
    x: handle.x * size,
    y: (1 - handle.y) * size,
  });

  const cp1 = toSvg(handles[0]);
  const cp2 = toSvg(handles[1]);

  return (
    <div className="bezier-overlay">
      <div className="bezier-panel">
        <div className="bezier-header">
          <p>Scale Gradient Curve</p>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="bezier-canvas" ref={containerRef}>
          <svg width={size} height={size}>
            <defs>
              <pattern id="bezier-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={size} height={size} fill="url(#bezier-grid)" />
            <polyline
              points={`0,${size} ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${size},0`}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
            />
            <path
              d={`M0,${size} C${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${size},0`}
              fill="none"
              stroke="#000"
              strokeWidth={3}
            />
            {[{ point: cp1, index: 0 }, { point: cp2, index: 1 }].map(({ point, index }) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={8}
                  fill="#fff"
                  stroke="#111"
                  strokeWidth={2}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setDragIndex(index);
                  }}
                  cursor="pointer"
                />
              </g>
            ))}
            <circle cx={0} cy={size} r={6} fill="#111" stroke="#fff" strokeWidth={2} />
            <circle cx={size} cy={0} r={6} fill="#111" stroke="#fff" strokeWidth={2} />
          </svg>
        </div>
      </div>
    </div>
  );
};
