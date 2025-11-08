import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import './App.css';
import { ParametricTower } from './components/canvas/ParametricTower';
import { TowerControlsPanel } from './components/ui/TowerControlsPanel';
import { createDefaultTowerParameters } from './state/towerParameters';
import type { TowerParameters } from './types/tower';

const gridColorDark = '#0a0d1a';
const gridColorLight = '#141a2d';

const App = () => {
  const [params, setParams] = useState<TowerParameters>(() => createDefaultTowerParameters());

  const totalHeight = useMemo(() => params.floorCount * params.floorHeight, [params.floorCount, params.floorHeight]);
  const gridOffset = useMemo(() => -(params.floorCount * params.floorHeight) * 0.5 - 0.01, [params.floorCount, params.floorHeight]);

  const handleReset = () => {
    setParams(createDefaultTowerParameters());
  };

  return (
    <div className="app-shell">
      <div className="canvas-pane">
        <Canvas camera={{ position: [18, 20, 28], fov: 45 }} shadows>
          <color attach="background" args={['#040611']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[25, 30, 15]} intensity={1.2} castShadow />
          <spotLight position={[-30, 25, -5]} intensity={0.8} angle={0.5} penumbra={0.6} color="#7ab8ff" />
          <Suspense fallback={null}>
            <ParametricTower params={params} />
            <Grid
              args={[80, 80]}
              sectionSize={2}
              cellSize={0.5}
              sectionColor={gridColorLight}
              cellColor={gridColorDark}
              fadeStrength={2}
              position={[0, gridOffset, 0]}
            />
          </Suspense>
          <OrbitControls enablePan={false} enableDamping dampingFactor={0.12} maxPolarAngle={Math.PI * 0.49} />
        </Canvas>

        <div className="stats-chip">
          <div>
            <p className="eyebrow">Total height</p>
            <strong>{totalHeight.toFixed(1)} m</strong>
          </div>
          <div>
            <p className="eyebrow">Twist range</p>
            <strong>{`${Math.round(params.minTwist)} deg -> ${Math.round(params.maxTwist)} deg`}</strong>
          </div>
        </div>
      </div>

      <TowerControlsPanel params={params} onChange={setParams} onReset={handleReset} />
    </div>
  );
};

export default App;
