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
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPanel, setDraggingPanel] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hasPosition = useRef(false);

  useEffect(() => {
    const handleBezierMove = (event: PointerEvent) => {
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

    const handlePanelMove = (event: PointerEvent) => {
      if (!isDraggingPanel) {
        return;
      }
      setPosition({
        x: clamp(event.clientX - offsetRef.current.x, 8, window.innerWidth - (panelRef.current?.offsetWidth ?? 0) - 8),
        y: clamp(event.clientY - offsetRef.current.y, 8, window.innerHeight - (panelRef.current?.offsetHeight ?? 0) - 8),
      });
    };

    const endDrag = () => {
      setDragIndex(null);
      setDraggingPanel(false);
    };

    window.addEventListener('pointermove', handleBezierMove);
    window.addEventListener('pointermove', handlePanelMove);
    window.addEventListener('pointerup', endDrag);
    return () => {
      window.removeEventListener('pointermove', handleBezierMove);
      window.removeEventListener('pointermove', handlePanelMove);
      window.removeEventListener('pointerup', endDrag);
    };
  }, [dragIndex, handles, onChange, isDraggingPanel]);

  useEffect(() => {
    if (open && !hasPosition.current && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth / 2 - rect.width / 2,
        y: window.innerHeight / 2 - rect.height / 2,
      });
      hasPosition.current = true;
    }
  }, [open]);

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
      <div
        className="bezier-panel"
        ref={panelRef}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      >
        <div
          className="bezier-header"
          onPointerDown={(event) => {
            const isButton = (event.target as HTMLElement).closest('button');
            if (isButton) {
              return;
            }
            const bounds = panelRef.current?.getBoundingClientRect();
            if (!bounds) {
              return;
            }
            setDraggingPanel(true);
            offsetRef.current = {
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            };
            panelRef.current?.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            panelRef.current?.releasePointerCapture(event.pointerId);
          }}
        >
          <p>Scale Gradient Curve</p>
          <button
            type="button"
            className="ghost-button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
          >
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
