import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import type { TowerParameters } from '../../types/tower';

type TowerControlsPanelProps = {
  params: TowerParameters;
  onChange: Dispatch<SetStateAction<TowerParameters>>;
  onReset: () => void;
  onExportObj: () => void;
  onSnapshot: () => void;
  exportDisabled: boolean;
  onSaveState: () => void;
  savedStates: { id: number; label: string }[];
  selectedStateId: number | '';
  onSelectState: (id: number) => void;
  onToggleScaleBezier: (enabled: boolean) => void;
  onOpenBezierEditor: () => void;
  onSceneLightingChange: (preset: TowerParameters['sceneLighting']) => void;
};

const easingOptions = [
  { label: 'Linear', value: 'linear' },
  { label: 'Ease In', value: 'easeIn' },
  { label: 'Ease Out', value: 'easeOut' },
  { label: 'Ease In-Out', value: 'easeInOut' },
];

const lightingOptions: { label: string; value: TowerParameters['sceneLighting'] }[] = [
  { label: 'Studio Soft', value: 'studio' },
  { label: 'Daylight', value: 'daylight' },
  { label: 'Sunset Glow', value: 'sunset' },
  { label: 'Noir Spot', value: 'noir' },
  { label: 'Cyber Neon', value: 'cyber' },
];

export const TowerControlsPanel = ({
  params,
  onChange,
  onReset,
  onExportObj,
  onSnapshot,
  exportDisabled,
  onSaveState,
  savedStates,
  selectedStateId,
  onSelectState,
  onToggleScaleBezier,
  onOpenBezierEditor,
  onSceneLightingChange,
}: TowerControlsPanelProps) => {
  const handleNumberChange =
    (key: keyof TowerParameters) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.currentTarget.value);
      if (Number.isNaN(value)) {
        return;
      }
      onChange((previous) => ({ ...previous, [key]: value }));
    };

  const handleRangeChange =
    (key: 'minScale' | 'maxScale' | 'minTwist' | 'maxTwist') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.currentTarget.value);
      if (Number.isNaN(value)) {
        return;
      }
      onChange((previous) => {
        if (key === 'minScale') {
          return { ...previous, minScale: Math.min(value, previous.maxScale - 0.01) };
        }
        if (key === 'maxScale') {
          return { ...previous, maxScale: Math.max(value, previous.minScale + 0.01) };
        }
        if (key === 'minTwist') {
          return { ...previous, minTwist: Math.min(value, previous.maxTwist - 5) };
        }
        return { ...previous, maxTwist: Math.max(value, previous.minTwist + 5) };
      });
    };

  const handleColorChange =
    (key: 'bottom' | 'top') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      onChange((previous) => ({
        ...previous,
        gradientColors: {
          ...previous.gradientColors,
          [key]: value,
        },
      }));
    };

  const handleEasingChange =
    (key: 'scale' | 'twist') =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.currentTarget.value as TowerParameters['easing'][typeof key];
      onChange((previous) => ({
        ...previous,
        easing: {
          ...previous.easing,
          [key]: value,
        },
      }));
    };

  const handleBooleanChange =
    (key: keyof TowerParameters) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.currentTarget;
      onChange((previous) => ({
        ...previous,
        [key]: checked,
      }));
    };

  const handleBackgroundChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    onChange((previous) => ({
      ...previous,
      backgroundColor: value,
    }));
  };

  return (
    <aside className="controls-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Parametric Tower</p>
        </div>
        <button type="button" className="ghost-button" onClick={onReset}>
          Reset presets
        </button>
      </div>

      <section>
        <h2>Structure</h2>
        <div className="control-field">
          <label htmlFor="floorCount">
            Floors <span>{params.floorCount}</span>
          </label>
          <input
            id="floorCount"
            type="range"
            min={6}
            max={120}
            step={1}
            value={params.floorCount}
            onChange={handleNumberChange('floorCount')}
          />
        </div>

        <div className="control-field">
          <label htmlFor="floorHeight">
            Floor height <span>{params.floorHeight.toFixed(1)} m</span>
          </label>
          <input
            id="floorHeight"
            type="range"
            min={2}
            max={8}
            step={0.1}
            value={params.floorHeight}
            onChange={handleNumberChange('floorHeight')}
          />
        </div>

        <div className="control-field">
          <label htmlFor="floorThickness">
            Floor thickness <span>{params.floorThickness.toFixed(2)} m</span>
          </label>
          <input
            id="floorThickness"
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            value={params.floorThickness}
            onChange={handleNumberChange('floorThickness')}
          />
        </div>

        <div className="control-field">
          <label htmlFor="baseRadius">
            Base radius <span>{params.baseRadius.toFixed(1)} m</span>
          </label>
          <input
            id="baseRadius"
            type="range"
            min={4}
            max={12}
            step={0.1}
            value={params.baseRadius}
            onChange={handleNumberChange('baseRadius')}
          />
        </div>

        <div className="control-field">
          <label htmlFor="floorSegments">
            Segments <span>{params.floorSegments}</span>
          </label>
          <input
            id="floorSegments"
            type="range"
            min={3}
            max={10}
            step={1}
            value={params.floorSegments}
            onChange={handleNumberChange('floorSegments')}
          />
        </div>
      </section>

      <section>
        <h2>Motion</h2>
        <div className="control-field checkbox-field">
          <label htmlFor="autoSpin" className="checkbox-label">
            <span>Auto spin</span>
            <input id="autoSpin" type="checkbox" checked={params.autoSpin} onChange={handleBooleanChange('autoSpin')} />
          </label>
        </div>
        <div className="control-field">
          <label htmlFor="spinSpeedDeg">
            Spin deg/s <span>{params.spinSpeedDeg.toFixed(0)}</span>
          </label>
          <input
            id="spinSpeedDeg"
            type="range"
            min={1}
            max={100}
            step={1}
            value={params.spinSpeedDeg}
            onChange={handleNumberChange('spinSpeedDeg')}
          />
        </div>
      </section>

      <section>
        <h2>Scaling gradient</h2>
        <div className="control-field">
          <label htmlFor="useGraph">Use Graph</label>
          <div className="graph-toggle">
            <button
              id="useGraph"
              type="button"
              className={`ghost-button ${params.scaleBezier.enabled ? 'active' : ''}`}
              onClick={() => {
                if (!params.scaleBezier.enabled) {
                  onToggleScaleBezier(true);
                }
                onOpenBezierEditor();
              }}
            >
              {params.scaleBezier.enabled ? 'Edit Graph' : 'Use Graph'}
            </button>
            {params.scaleBezier.enabled && (
              <button
                type="button"
                className="ghost-button subtle"
                onClick={() => onToggleScaleBezier(false)}
              >
                Disable
              </button>
            )}
          </div>
        </div>
        <div className="control-field">
          <label htmlFor="minScale">
            Min scale <span>{params.minScale.toFixed(2)}x</span>
          </label>
          <input
            id="minScale"
            type="range"
            min={0.25}
            max={params.maxScale - 0.01}
            step={0.01}
            value={params.minScale}
            onChange={handleRangeChange('minScale')}
          />
        </div>
        <div className="control-field">
          <label htmlFor="maxScale">
            Max scale <span>{params.maxScale.toFixed(2)}x</span>
          </label>
          <input
            id="maxScale"
            type="range"
            min={params.minScale + 0.01}
            max={1.75}
            step={0.01}
            value={params.maxScale}
            onChange={handleRangeChange('maxScale')}
          />
        </div>
        <div className="control-field">
          <label htmlFor="scaleEasing">Distribution</label>
          <select id="scaleEasing" value={params.easing.scale} onChange={handleEasingChange('scale')}>
            {easingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2>Twist gradient</h2>
        <div className="control-field">
          <label htmlFor="minTwist">
            Base twist <span>{params.minTwist.toFixed(0)} deg</span>
          </label>
          <input
            id="minTwist"
            type="range"
            min={0}
            max={params.maxTwist - 5}
            step={5}
            value={params.minTwist}
            onChange={handleRangeChange('minTwist')}
          />
        </div>
        <div className="control-field">
          <label htmlFor="maxTwist">
            Apex twist <span>{params.maxTwist.toFixed(0)} deg</span>
          </label>
          <input
            id="maxTwist"
            type="range"
            min={params.minTwist + 5}
            max={360}
            step={5}
            value={params.maxTwist}
            onChange={handleRangeChange('maxTwist')}
          />
        </div>
        <div className="control-field">
          <label htmlFor="twistEasing">Distribution</label>
          <select id="twistEasing" value={params.easing.twist} onChange={handleEasingChange('twist')}>
            {easingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2>Color gradient</h2>
        <div className="color-row">
          <label htmlFor="bottomColor">
            Base
            <input id="bottomColor" type="color" value={params.gradientColors.bottom} onChange={handleColorChange('bottom')} />
          </label>
          <label htmlFor="topColor">
            Apex
            <input id="topColor" type="color" value={params.gradientColors.top} onChange={handleColorChange('top')} />
          </label>
        </div>
        <div className="control-field">
          <label htmlFor="gradientBias">
            Gradient bias <span>{Math.round(params.gradientBias * 100)}%</span>
          </label>
          <input
            id="gradientBias"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={params.gradientBias}
            onChange={(event) => {
              const value = Number(event.currentTarget.value);
              if (Number.isNaN(value)) {
                return;
              }
              onChange((previous) => ({ ...previous, gradientBias: value }));
            }}
          />
        </div>
        <div className="control-field">
          <label htmlFor="sceneLighting">Scene Lighting</label>
          <select
            id="sceneLighting"
            value={params.sceneLighting}
            onChange={(event) => onSceneLightingChange(event.currentTarget.value as TowerParameters['sceneLighting'])}
          >
            {lightingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2>Background</h2>
        <div className="control-field">
          <label htmlFor="backgroundColor">
            Scene color <span>{params.backgroundColor.toUpperCase()}</span>
          </label>
          <input id="backgroundColor" type="color" value={params.backgroundColor} onChange={handleBackgroundChange} />
        </div>
      </section>

      <section>
        <h2>Export</h2>
        <div className="export-buttons">
          <button type="button" className="primary-button" disabled={exportDisabled} onClick={onExportObj}>
            Export Obj
          </button>
          <button type="button" className="primary-button" disabled={exportDisabled} onClick={onSnapshot}>
            Snapshot
          </button>
        </div>
        <div className="state-actions">
          <button type="button" className="ghost-button" onClick={onSaveState}>
            Save State
          </button>
          <select
            value={selectedStateId === '' ? '' : selectedStateId}
            onChange={(event) => {
              const value = event.currentTarget.value;
              if (!value) {
                return;
              }
              onSelectState(Number(value));
            }}
          >
            <option value="">Select State</option>
            {savedStates.map((state) => (
              <option key={state.id} value={state.id}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
      </section>
    </aside>
  );
};
