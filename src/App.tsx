import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { MOUSE } from 'three';
import type { BufferGeometry, ColorRepresentation, Vector3Tuple, WebGLRenderer } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import './App.css';
import { ParametricTower } from './components/canvas/ParametricTower';
import { FacadeStructure } from './components/canvas/FacadeStructure';
import { TowerPhysics } from './components/canvas/TowerPhysics';
import { PinchAttractors } from './components/canvas/PinchAttractors';
import { TowerControlsPanel } from './components/ui/TowerControlsPanel';
import { BezierEditor } from './components/ui/BezierEditor';
import { useTowerGeometry } from './hooks/useTowerGeometry';
import { useFacadeGeometry } from './hooks/useFacadeGeometry';
import { serializeGeometryAsOBJ } from './utils/exporters';
import { createDefaultTowerParameters } from './state/towerParameters';
import type { TowerParameters } from './types/tower';

type SavedState = { id: number; label: string; params: TowerParameters };
type BezierHandles = TowerParameters['scaleBezier']['handles'];

type LightingPreset = {
  ambient: { intensity: number; color: ColorRepresentation };
  hemisphere: { sky: ColorRepresentation; ground: ColorRepresentation; intensity: number };
  key: { position: Vector3Tuple; intensity: number; color: ColorRepresentation };
  fill: { position: Vector3Tuple; intensity: number; color: ColorRepresentation };
  accent: { position: Vector3Tuple; intensity: number; color: ColorRepresentation; angle: number; penumbra: number };
};

const lightingPresets: Record<TowerParameters['sceneLighting'], LightingPreset> = {
  studio: {
    ambient: { intensity: 1.1, color: '#ffffff' },
    hemisphere: { sky: '#f1f4ff', ground: '#0c132e', intensity: 0.8 },
    key: { position: [25, 30, 15], intensity: 1.8, color: '#fff0f0' },
    fill: { position: [-18, 18, -10], intensity: 0.8, color: '#a6c1ff' },
    accent: { position: [-30, 25, -5], intensity: 1, color: '#9cd5ff', angle: 0.55, penumbra: 0.6 },
  },
  daylight: {
    ambient: { intensity: 0.9, color: '#e3f2ff' },
    hemisphere: { sky: '#d9f0ff', ground: '#a3bfd1', intensity: 0.9 },
    key: { position: [40, 50, 10], intensity: 2.2, color: '#fff3d1' },
    fill: { position: [-35, 25, -20], intensity: 0.6, color: '#cfe4ff' },
    accent: { position: [0, 60, 0], intensity: 0.5, color: '#ffffff', angle: 0.7, penumbra: 0.4 },
  },
  sunset: {
    ambient: { intensity: 0.7, color: '#ffcfaa' },
    hemisphere: { sky: '#ff9e7b', ground: '#3a1f2a', intensity: 0.6 },
    key: { position: [15, 15, 30], intensity: 2.0, color: '#ffb070' },
    fill: { position: [-20, 10, -5], intensity: 0.5, color: '#ffdcdc' },
    accent: { position: [0, 5, -30], intensity: 0.8, color: '#ff5f6d', angle: 0.4, penumbra: 0.5 },
  },
  noir: {
    ambient: { intensity: 0.35, color: '#dde3ff' },
    hemisphere: { sky: '#8da2d0', ground: '#080a14', intensity: 0.3 },
    key: { position: [10, 35, 5], intensity: 2.4, color: '#ffffff' },
    fill: { position: [-25, 5, -10], intensity: 0.25, color: '#3b4a70' },
    accent: { position: [0, 50, -20], intensity: 0.9, color: '#7ab8ff', angle: 0.35, penumbra: 0.3 },
  },
  cyber: {
    ambient: { intensity: 0.8, color: '#b8fffb' },
    hemisphere: { sky: '#7af5ff', ground: '#140023', intensity: 0.7 },
    key: { position: [25, 25, 25], intensity: 1.6, color: '#7af5ff' },
    fill: { position: [-25, 18, -15], intensity: 1.1, color: '#ff78ff' },
    accent: { position: [-5, 35, 5], intensity: 1.2, color: '#ffea7a', angle: 0.5, penumbra: 0.7 },
  },
};

const App = () => {
  const [params, setParams] = useState<TowerParameters>(() => createDefaultTowerParameters());
  const [isBezierEditorOpen, setBezierEditorOpen] = useState(false);
  const [isTweenBezierOpen, setTweenBezierOpen] = useState(false);
  const [isTween2BezierOpen, setTween2BezierOpen] = useState(false);
  const [savedStates, setSavedStates] = useState<SavedState[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | ''>('');
  const [gravityState, setGravityState] = useState<'idle' | 'active'>('idle');
  const [gravitySeed, setGravitySeed] = useState(1);
  const towerGeometry = useTowerGeometry(params);
  const { rails: facadeRailGeometry, tweens: facadeTweenGeometry, floorLoops: facadeLoopGeometry } =
    useFacadeGeometry(params);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  const gridOffset = useMemo(
    () => -(params.floorCount * params.floorHeight) * 0.5 - 0.01,
    [params.floorCount, params.floorHeight],
  );
  const spinTarget = useMemo<[number, number, number]>(() => [0, 0, 0], []);
  const cameraSettings = useMemo(() => {
    const towerHeight = params.floorCount * params.floorHeight;
    const towerRadius = params.baseRadius * params.maxScale;
    const margin = Math.max(4, towerHeight * 0.08, towerRadius * 0.25);
    const halfHeight = towerHeight * 0.5 + margin;
    const radiusWithMargin = towerRadius + margin;
    const boundingRadius = Math.sqrt(halfHeight * halfHeight + radiusWithMargin * radiusWithMargin);
    const fovDeg = 45;
    const fovRad = (Math.PI / 180) * fovDeg;
    const distance = boundingRadius / Math.sin(fovRad / 2);
    const diag = distance / Math.sqrt(2);
    const position: [number, number, number] = [diag, halfHeight, diag];
    return {
      position,
      fov: fovDeg,
    };
  }, [params.baseRadius, params.floorCount, params.floorHeight, params.maxScale]);
  const lighting = lightingPresets[params.sceneLighting] ?? lightingPresets.studio;

  const handleReset = () => {
    setParams(createDefaultTowerParameters());
    setGravityState('idle');
    setGravitySeed((previous) => previous + 1);
  };

  const downloadBlob = useCallback((data: BlobPart, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const cloneParams = useCallback(
    (data: TowerParameters): TowerParameters =>
      typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data)),
    [],
  );

  const handleExportObj = useCallback(() => {
    const geometries: BufferGeometry[] = [];
    if (towerGeometry) {
      geometries.push(towerGeometry.clone());
    }
    if (params.facadeEnabled && facadeRailGeometry) {
      geometries.push(facadeRailGeometry.clone());
    }
    if (geometries.length === 0) {
      return;
    }
    const merged = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, true);
    if (!merged) {
      return;
    }
    const result = serializeGeometryAsOBJ(merged);
    downloadBlob(result, 'parametric_tower.obj', 'text/plain');
    merged.dispose();
  }, [towerGeometry, facadeRailGeometry, params.facadeEnabled, downloadBlob]);

  const snapshotCounterRef = useRef(1);

  const handleSnapshot = useCallback(() => {
    const canvas = rendererRef.current?.domElement ?? document.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) {
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const count = snapshotCounterRef.current;
      snapshotCounterRef.current += 1;
      anchor.href = url;
      anchor.download = `251108_ParametricTower_${count}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  const handleToggleScaleBezier = useCallback((enabled: boolean) => {
    setParams((previous) => ({
      ...previous,
      scaleBezier: {
        ...previous.scaleBezier,
        enabled,
      },
    }));
    if (!enabled) {
      setBezierEditorOpen(false);
    }
  }, []);

  const handleBezierHandlesChange = useCallback((handles: BezierHandles) => {
    setParams((previous) => ({
      ...previous,
      scaleBezier: {
        ...previous.scaleBezier,
        handles,
      },
    }));
  }, []);

  const handleSceneLightingChange = useCallback((preset: TowerParameters['sceneLighting']) => {
    setParams((previous) => ({
      ...previous,
      sceneLighting: preset,
    }));
  }, []);

  const handleToggleFacade = useCallback(() => {
    setParams((previous) => ({
      ...previous,
      facadeEnabled: !previous.facadeEnabled,
    }));
  }, []);

  const handleFacadeProfileChange = useCallback((value: number) => {
    setParams((previous) => ({
      ...previous,
      facadeProfile: Math.min(0.2, Math.max(0.1, value)),
    }));
  }, []);

  const handleFacadeTweenChange = useCallback((value: number) => {
    setParams((previous) => ({
      ...previous,
      facadeTweenCount: Math.max(1, Math.min(40, Math.round(value))),
    }));
  }, []);

  const handleFacadeTween2Change = useCallback((value: number) => {
    setParams((previous) => ({
      ...previous,
      facadeTween2Count: Math.max(1, Math.min(40, Math.round(value))),
    }));
  }, []);

  const handleTogglePinchSpread = useCallback(() => {
    setParams((previous) => ({
      ...previous,
      pinchSpread: {
        ...previous.pinchSpread,
        enabled: !previous.pinchSpread.enabled,
      },
    }));
  }, []);

  const handlePinchRadiusChange = useCallback((value: number) => {
    setParams((previous) => ({
      ...previous,
      pinchSpread: {
        ...previous.pinchSpread,
        radius: Math.max(0, Math.min(15, value)),
      },
    }));
  }, []);

  const handlePinchStrengthChange = useCallback((value: number) => {
    setParams((previous) => ({
      ...previous,
      pinchSpread: {
        ...previous.pinchSpread,
        strength: Math.max(-1, Math.min(1, value)),
      },
    }));
  }, []);

  const handlePinchAttractorChange = useCallback((index: number, position: { x: number; y: number; z: number }) => {
    setParams((previous) => {
      const attractors = previous.pinchSpread.attractors.map((attr, idx) => (idx === index ? position : attr));
      return {
        ...previous,
        pinchSpread: {
          ...previous.pinchSpread,
          attractors,
        },
      };
    });
  }, []);

  const handleToggleTweenBezier = useCallback((enabled: boolean) => {
    setParams((previous) => ({
      ...previous,
      facadeTweenCurve: {
        ...previous.facadeTweenCurve,
        enabled,
      },
    }));
    if (!enabled) {
      setTweenBezierOpen(false);
    }
  }, []);

  const handleToggleTween2Bezier = useCallback((enabled: boolean) => {
    setParams((previous) => ({
      ...previous,
      facadeTween2Curve: {
        ...previous.facadeTween2Curve,
        enabled,
      },
    }));
    if (!enabled) {
      setTween2BezierOpen(false);
    }
  }, []);

  const handleTweenBezierHandlesChange = useCallback((handles: BezierHandles) => {
    setParams((previous) => ({
      ...previous,
      facadeTweenCurve: {
        ...previous.facadeTweenCurve,
        handles,
      },
    }));
  }, []);

  const handleTween2BezierHandlesChange = useCallback((handles: BezierHandles) => {
    setParams((previous) => ({
      ...previous,
      facadeTween2Curve: {
        ...previous.facadeTween2Curve,
        handles,
      },
    }));
  }, []);

  const handleSaveState = useCallback(() => {
    setSavedStates((previous) => {
      const nextId = previous.length + 1;
      const snapshot = cloneParams(params);
      setSelectedStateId(nextId);
      return [...previous, { id: nextId, label: `State ${nextId}`, params: snapshot }];
    });
  }, [params, cloneParams]);

  const handleSelectState = useCallback(
    (id: number) => {
      const match = savedStates.find((state) => state.id === id);
      if (!match) {
        return;
      }
      setSelectedStateId(id);
      setParams(cloneParams(match.params));
    },
    [savedStates, cloneParams],
  );

  const handleActivateGravity = useCallback(() => {
    setGravitySeed((previous) => previous + 1);
    setGravityState('active');
  }, []);

  const handleResetGravitySimulation = useCallback(() => {
    setGravityState('idle');
    setGravitySeed((previous) => previous + 1);
  }, []);

  return (
    <div className="app-shell" style={{ backgroundColor: params.backgroundColor }}>
      <div className="canvas-pane">
        <Canvas
          camera={cameraSettings}
          shadows
          gl={{ preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            rendererRef.current = gl;
          }}
        >
          <color attach="background" args={[params.backgroundColor]} />
          <ambientLight intensity={lighting.ambient.intensity} color={lighting.ambient.color} />
          <hemisphereLight args={[lighting.hemisphere.sky, lighting.hemisphere.ground, lighting.hemisphere.intensity]} />
          <directionalLight
            position={lighting.key.position}
            intensity={lighting.key.intensity}
            color={lighting.key.color}
            castShadow
          />
          <directionalLight
            position={lighting.fill.position}
            intensity={lighting.fill.intensity}
            color={lighting.fill.color}
          />
          <spotLight
            position={lighting.accent.position}
            intensity={lighting.accent.intensity}
            angle={lighting.accent.angle}
            penumbra={lighting.accent.penumbra}
            color={lighting.accent.color}
          />
          <Suspense fallback={null}>
            {gravityState === 'active' ? (
              <TowerPhysics key={gravitySeed} params={params} seed={gravitySeed} />
            ) : (
              <>
                <ParametricTower geometry={towerGeometry} />
                {params.facadeEnabled && (
                  <FacadeStructure
                    railGeometry={facadeRailGeometry}
                    tweenGeometry={facadeTweenGeometry}
                    tween2Geometry={facadeLoopGeometry}
                  />
                )}
                {params.pinchSpread.enabled && (
                  <PinchAttractors
                    attractors={params.pinchSpread.attractors}
                    enabled={params.pinchSpread.enabled}
                    orbitControlsRef={orbitRef}
                    onChange={handlePinchAttractorChange}
                  />
                )}
              </>
            )}
            <Grid
              args={[400, 400]}
              sectionSize={5}
              cellSize={0.75}
              sectionColor="#f0f1f5"
              cellColor="#d9dde8"
              fadeDistance={200}
              fadeStrength={6}
              infiniteGrid
              position={[0, gridOffset, 0]}
            />
          </Suspense>
          <OrbitControls
            ref={orbitRef}
            enablePan
            enableDamping
            dampingFactor={0.12}
            maxPolarAngle={Math.PI * 0.49}
            autoRotate={params.autoSpin}
            autoRotateSpeed={(params.spinSpeedDeg / 360) * 2 * Math.PI}
            target={spinTarget}
            mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
          />
        </Canvas>
      </div>

      <TowerControlsPanel
        params={params}
        onChange={setParams}
        onReset={handleReset}
        onExportObj={handleExportObj}
        onSnapshot={handleSnapshot}
        exportDisabled={!towerGeometry}
        onSaveState={handleSaveState}
        savedStates={savedStates.map(({ id, label }) => ({ id, label }))}
        selectedStateId={selectedStateId}
        onSelectState={handleSelectState}
        onToggleScaleBezier={handleToggleScaleBezier}
        onOpenBezierEditor={() => setBezierEditorOpen(true)}
        onSceneLightingChange={handleSceneLightingChange}
        onToggleFacade={handleToggleFacade}
        facadeEnabled={params.facadeEnabled}
        onActivateGravity={handleActivateGravity}
        onResetGravitySimulation={handleResetGravitySimulation}
        gravityActive={gravityState === 'active'}
        onFacadeProfileChange={handleFacadeProfileChange}
        onFacadeTweenChange={handleFacadeTweenChange}
        onFacadeTween2Change={handleFacadeTween2Change}
        onToggleTweenBezier={handleToggleTweenBezier}
        onOpenTweenBezier={() => setTweenBezierOpen(true)}
        onTogglePinchSpread={handleTogglePinchSpread}
        onPinchRadiusChange={handlePinchRadiusChange}
        onPinchStrengthChange={handlePinchStrengthChange}
        onToggleTween2Bezier={handleToggleTween2Bezier}
        onOpenTween2Bezier={() => setTween2BezierOpen(true)}
      />

      <BezierEditor
        open={isBezierEditorOpen}
        title="Scale Gradient Curve"
        handles={params.scaleBezier.handles}
        onClose={() => setBezierEditorOpen(false)}
        onChange={handleBezierHandlesChange}
      />
      <BezierEditor
        open={isTweenBezierOpen}
        title="Tween Rail Curve"
        handles={params.facadeTweenCurve.handles}
        onClose={() => setTweenBezierOpen(false)}
        onChange={handleTweenBezierHandlesChange}
      />
      <BezierEditor
        open={isTween2BezierOpen}
        title="Tween Rails 2 Curve"
        handles={params.facadeTween2Curve.handles}
        onClose={() => setTween2BezierOpen(false)}
        onChange={handleTween2BezierHandlesChange}
      />
    </div>
  );
};

export default App;
