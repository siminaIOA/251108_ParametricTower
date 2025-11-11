# 251108_ParametricTower

A browser-based playground for designing gradient-driven stacked tower geometries. The app renders procedural floor slabs in WebGL (React Three Fiber + Three.js) and lets you experiment with twisting, scale envelopes, heights, color ramps, lighting, exports, and physics-driven collapse simulations to prototype expressive skyscraper massings in real time.

## Features
- React + Vite + TypeScript scaffold with hot reload, linting, and OBJ exporting that retains vertex colors.
- Procedural tower mesh with per-floor twisting, scaling, gradient coloring, and configurable polygon segments (triangles through decagons).
- Facade sweep controls that extrude rectangular mullions along the tower curves, with adjustable profile thickness and OBJ-ready vertex colors.
- Draggable Bezier curve editor for sculpting the scale gradient envelope via a floating UI window.
- Snapshot + OBJ export actions with auto-incremented filenames for quick capture/sharing.
- Saved state manager to store numbered presets (State 1, State 2, ...) and switch between them instantly.
- Scene lighting presets (Studio, Daylight, Sunset, Noir, Cyber) plus a Background tab for custom scene colors.
- Motion tab with Auto Spin toggle, Spin deg/s slider (1–100), and tuned orbit/pan/zoom camera controls.
- Gravity menu powered by @react-three/rapier that collapses slabs with sliding dynamics, windy nudges, and reset-to-static toggle.
- Refined UI shell with separated scroll regions, “Parametric Tower” header, Apple-inspired styling, and infinite fade-blurred ground grid.

## Getting Started
1. Install Node.js 18+ (LTS recommended).
2. Install dependencies:
   `ash
   npm install
   `
3. Run the dev server:
   `ash
   npm run dev
   `
4. Open the provided localhost URL to explore the tower generator.

## Controls
- **Structure** – Floors, floor height, thickness, base radius, and polygon segment count.
- **Scaling gradient** – Min/max scale sliders, easing selector, and optional Bezier graph editor.
- **Twist gradient** – Base/apex twist sliders and easing selector.
- **Color gradient** – Bottom/top color pickers, gradient bias slider, and scene-lighting presets.
- **Background** – Set the canvas backdrop color.
- **Motion** – Toggle Auto Spin, adjust Spin deg/s, and rely on orbit/pan/zoom interactions.
- **Facade Structure** – Toggle sweeps and fine-tune the rectangular profile size.
- **Export & States** – Export OBJ (with vertex colors), capture PNG snapshots, save/load tower states.
- **Gravity** – Activate the Rapier-driven collapse simulation and Reset back to the static tower.

## Deployment
1. **Build locally**
   `ash
   npm install                   # first time only
   npm run build                 # sanity check build
   npx vite build --base=./      # production build with relative paths
   `
   The optimized, relative-path output lands in dist/.
2. **Publish to GitHub Pages**
   `ash
   git switch gh-pages           # or another deployment branch
   rm -rf ./*                    # keep only the .git folder
   cp -R ../251108_ParametricTower/dist/* .
   touch .nojekyll
   git add -A
   git commit -m "deploy: gh-pages"
   git push origin gh-pages
   `
   Finally, point the repo's Pages settings to the deployment branch you used.
3. **Live demo**
   - https://siminaioa.github.io/251108_ParametricTower/
