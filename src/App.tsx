import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import './App.css';
import { ParametricTower } from './components/canvas/ParametricTower';
import { TowerControlsPanel } from './components/ui/TowerControlsPanel';
import { createDefaultTowerParameters } from './state/towerParameters';
import type { TowerParameters } from './types/tower';

const App = () => {
  const [params, setParams] = useState<TowerParameters>(() => createDefaultTowerParameters());

  const totalHeight = useMemo(() => params.floorCount * params.floorHeight, [params.floorCount, params.floorHeight]);
  const gridOffset = useMemo(() => -(params.floorCount * params.floorHeight) * 0.5 - 0.01, [params.floorCount, params.floorHeight]);

  const handleReset = () => {
    setParams(createDefaultTowerParameters());
  };

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
            <ParametricTower params={params} />
            <Grid
              args={[400, 400]}
              sectionSize={5}
              cellSize={0.75}
              sectionColor="#353535"
              cellColor="#1f1f1f"
              fadeDistance={200}
              fadeStrength={6}
              infiniteGrid
              position={[0, gridOffset, 0]}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.12}
            maxPolarAngle={Math.PI * 0.49}
            autoRotate={params.autoSpin}
            autoRotateSpeed={(params.spinSpeedDeg / 360) * 2 * Math.PI}
          />
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
