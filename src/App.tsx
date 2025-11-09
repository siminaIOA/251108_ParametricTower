import { Suspense, useCallback, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { MOUSE } from 'three';
import './App.css';
import { ParametricTower } from './components/canvas/ParametricTower';
import { TowerControlsPanel } from './components/ui/TowerControlsPanel';
import { useTowerGeometry } from './hooks/useTowerGeometry';
import { serializeGeometryAsOBJ } from './utils/exporters';
import { createDefaultTowerParameters } from './state/towerParameters';
import type { TowerParameters } from './types/tower';

type SavedState = { id: number; label: string; params: TowerParameters };

const App = () => {
  const [params, setParams] = useState<TowerParameters>(() => createDefaultTowerParameters());
  const [savedStates, setSavedStates] = useState<SavedState[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | ''>('');
  const towerGeometry = useTowerGeometry(params);

  const gridOffset = useMemo(() => -(params.floorCount * params.floorHeight) * 0.5 - 0.01, [params.floorCount, params.floorHeight]);
  const spinTarget = useMemo<[number, number, number]>(
    () => [0, -(params.floorCount * params.floorHeight) * 0.5 + params.floorHeight * 0.5, 0],
    [params.floorCount, params.floorHeight],
  );

  const handleReset = () => {
    setParams(createDefaultTowerParameters());
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
    if (!towerGeometry) {
      return;
    }
    const result = serializeGeometryAsOBJ(towerGeometry);
    downloadBlob(result, 'parametric_tower.obj', 'text/plain');
  }, [towerGeometry, downloadBlob]);

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

  return (
    <div className="app-shell" style={{ backgroundColor: params.backgroundColor }}>
      <div className="canvas-pane">
        <Canvas camera={{ position: [18, 20, 28], fov: 45 }} shadows>
          <color attach="background" args={[params.backgroundColor]} />
          <ambientLight intensity={1.15} />
          <hemisphereLight args={['#f1f4ff', '#0c132e', 0.85]} />
          <directionalLight position={[25, 30, 15]} intensity={1.85} castShadow />
          <directionalLight position={[-18, 18, -10]} intensity={1} color="#a8d3ff" />
          <spotLight position={[-30, 25, -5]} intensity={1.1} angle={0.6} penumbra={0.65} color="#9cd5ff" />
          <Suspense fallback={null}>
            <ParametricTower geometry={towerGeometry} />
            <Grid
              args={[400, 400]}
              sectionSize={5}
              cellSize={0.75}
              sectionColor="#7e848f"
              cellColor="#4d5159"
              fadeDistance={200}
              fadeStrength={6}
              infiniteGrid
              position={[0, gridOffset, 0]}
            />
          </Suspense>
          <OrbitControls
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
        exportDisabled={!towerGeometry}
        onSaveState={handleSaveState}
        savedStates={savedStates.map(({ id, label }) => ({ id, label }))}
        selectedStateId={selectedStateId}
        onSelectState={handleSelectState}
      />
    </div>
  );
};

export default App;
