# 251108_ParametricTower

A browser-based playground for designing gradient-driven stacked tower geometries. The app renders procedural floor slabs in WebGL (React Three Fiber + Three.js) and lets you experiment with twisting, scale envelopes, heights, color ramps, lighting, exports, facade systems, and physics-driven collapse simulations to prototype expressive skyscraper massings in real time.

## Features
- React + Vite + TypeScript scaffold with hot reload, linting, OBJ export (with vertex colors), and PNG snapshots that auto-increment filenames.
- Procedural tower mesh with per-floor twisting, scaling, gradient coloring, adjustable polygon segments (3–10), floor count/height/thickness, and defaults that always frame the full tower on load or reset.
- Facade sweep system aligned to polygon corners with adjustable profile size, dual tween-rail families (Tween Rails + Tween Rails 2) each driven by its own Bezier graph, and per-floor loops that share color gradients for OBJ-ready exports.
- Pinch & Spread attractor workflow: three draggable gizmos, Radius/Strength sliders (0–15 m / -1+1) that deform the white facade net inside each plane while keeping the grid coherent.
- Background + Color Gradient tabs featuring gradient bias, base/apex pickers, five lighting presets (Studio, Daylight, Sunset, Noir, Cyber), and a Background menu for single-click scene color edits.
- Motion menu with Auto Spin toggle, Spin deg/s slider (1–100), tuned orbit/pan/zoom controls, right-click panning, scroll zoom, and double-right-click “zoom extents” for quick framing.
- Export drawer with OBJ export, PNG Snapshot button (projectName_#.png), state saver (State 1, 2, …), and dropdown to reload earlier presets instantly.
- Gravity playground powered by @react-three/rapier that collapses floors with tuned jitter, airflow, slide forces, and Activate/Reset actions for repeatable collapse studies.
- Refined UI shell: separated scroll regions, “Parametric Tower” header, Apple-inspired controls, detachable Bezier editors, draggable gradient graphs, and infinite fade-blurred ground grid.

## Getting Started
1. Install **Node.js 18+** (LTS recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open the printed Vite URL (default http://localhost:5173) to explore the tower generator.

## Controls
- **Structure** – Floor count/height/thickness, base radius, polygon segments, facade toggle, profile thickness, Tween Rails 1 + 2 sliders (1–40), Bezier graph toggles, and precise numeric readouts.
- **Scaling Gradient** – Min/max scale sliders with easing selector or Bezier editor capturing per-floor scale ratios.
- **Twist Gradient** – Base/apex twist sliders and easing selector for distributing twist energy along the height.
- **Color Gradient** – Bottom/top color pickers, gradient bias slider, lighting presets, and color-coded preview.
- **Background** – Single color picker that keeps the UI + canvas palette coordinated.
- **Motion** – Auto Spin checkbox, Spin deg/s slider (1–100), tuned orbit/pan/zoom controls with separate scroll regions so menu scrolling never moves the tower.
- **Facade Structure** – Toggle facade sweeps, set profile size, sculpt Tween Rails 1 & 2 spacing via Bezier graphs, and control Pinch & Spread (Radius, Strength, draggable attractors).
- **Export** – OBJ export (vertex colors preserved), PNG snapshot, Save State button, and dropdown for reloading saved configurations.
- **Gravity** – Activate + Reset buttons that enable the Rapier rigid-body simulation for dramatic collapse tests.

## Deployment
1. **Build locally with relative paths**
   ```bash
   npm install                 # first time only
   npm run build -- --base=./  # ensures relative asset URLs
   ```
   The optimized files appear in `dist/`.
2. **Publish to GitHub Pages (gs-pages branch workflow)**
   ```bash
   git checkout gs-pages or git checkout -b gs-pages
   git rm -rf .                                   # keep only .git
   cp -R ../251108_ParametricTower/dist/* .       # copy fresh build output
   touch .nojekyll
   git add -A
   git commit -m "Deploy latest build"
   git push -u origin gs-pages
   ```
   Point GitHub → Settings → Pages at the `gs-pages` branch. (Any deployment branch works as long as you copy `dist/` contents and include `.nojekyll`.)
3. **Live demo**
   - https://siminaioa.github.io/251108_ParametricTower/
