# 251108_ParametricTower

A browser-based playground for designing gradient-driven stacked towers. The app renders procedural floor slabs in WebGL (React Three Fiber + Three.js) and lets you experiment with twisting, scaling, heights, lighting, facades, exports, and physics-driven collapse simulations to prototype expressive skyscraper massings in real time.

## Features
- React + Vite + TypeScript scaffold with hot reload, linting, OBJ export (with vertex colors), PNG snapshot capture, and state saving/loading.
- Procedural tower mesh: per-floor twisting, scaling, gradient coloring, polygon segments (3–10), and defaults that always frame the entire tower when the scene loads or resets.
- Dual facade systems:
  - **Sweep rails** aligned to the polygon corners with adjustable profile thickness.
  - **Tween rails** (families 1 and 2) each driven by its own Bezier graph, slider ranges of 1–40 rails, and per-floor loop interpolation so you can sculpt dense grids.
- **Pinch & Spread** attractor workflow with three draggable gizmos, Radius slider (0–15 m), Strength slider (-1 to +1), and plane-aware deformation that keeps the white facade net tidy while reacting to attractor placement.
- Background + Color Gradient tabs featuring gradient bias, base/apex color pickers, five lighting presets (Studio, Daylight, Sunset, Noir, Cyber), and direct background color control.
- Motion menu with Auto Spin toggle, Spin deg/s slider (1–100), tuned orbit/pan/zoom controls, right-click pan, scroll zoom, and double-right-click “zoom extents”.
- Export drawer with OBJ export, PNG snapshot capture (`projectName_#.png`), Save State / Select State dropdown, and a saved-configuration manager.
- Gravity playground powered by @react-three/rapier: Activate collapses floors with tuned jitter/slide/wind forces, Reset restores the procedural tower.
- Refined UI shell: Apple-inspired controls, separated scroll regions, draggable Bezier editors and gradient graphs, floating Pinch & Spread gizmos, and an infinite fade-blurred ground grid.

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
4. Open the printed Vite URL (default http://localhost:5173) and explore the tower generator.

## Controls
- **Structure** – Floor count/height/thickness, base radius, polygon segments, facade toggle, profile thickness, Tween Rails 1 & 2 sliders (1–40), and Bezier graph toggles.
- **Scaling Gradient** – Min/max scale sliders with easing selector or two-handle Bezier editor.
- **Twist Gradient** – Base/apex twist sliders plus easing selector.
- **Color Gradient** – Bottom/top color pickers, gradient bias slider, and lighting preset dropdown.
- **Background** – Canvas background color picker.
- **Motion** – Auto Spin checkbox, Spin deg/s slider (1–100), right-click pan, scroll zoom, double-right-click zoom-to-fit, and separated scroll areas for UI vs. canvas.
- **Facade Structure** – Sweep toggle, profile size slider, Tween Rails 1 & 2 controls, Pinch & Spread (Radius 0–15 m, Strength -1 to +1, draggable attractors).
- **Export** – OBJ export (vertex colors), PNG snapshot, Save State button, and dropdown to load saved setups.
- **Gravity** – Activate + Reset buttons that hand the tower to the Rapier rigid-body simulation for collapse previews.

## Deployment
1. **Build locally with relative paths**
   ```bash
   npm install                 # first time only
   npm run build -- --base=./  # ensures relative asset URLs
   ```
   The optimized files appear in `dist/`.
2. **Publish to GitHub Pages**
   ```bash
   git checkout gh-pages        # or git checkout -b gh-pages
   git rm -rf .                 # keep only .git
   cp -R ../251108_ParametricTower/dist/* .
   touch .nojekyll
   git add -A
   git commit -m "Deploy latest build"
   git push -u origin gh-pages
   ```
   In GitHub → Settings → Pages, select the `gh-pages` (or `gh-pages-new`) branch. Any branch works as long as you copy the `dist/` output into it and include `.nojekyll`.
3. **Live demo**
   - https://siminaioa.github.io/251108_ParametricTower/
