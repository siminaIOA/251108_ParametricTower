# 251108_ParametricTower

A browser-based playground for designing gradient-driven stacked tower geometries. The app renders procedural floor slabs in WebGL (React Three Fiber + Three.js) and lets you experiment with twisting, scale envelopes, heights, color ramps, lighting, exports, and physics-driven collapse simulations to prototype expressive skyscraper massings in real time.

## Features
- React + Vite + TypeScript scaffold with hot reload, linting, and OBJ exporting that retains vertex colors.
- Procedural Three.js tower mesh with per-floor twisting, scaling, gradient coloring, and customizable segment counts (triangles through decagons).
- Facade Structure overlay button that spawns vertical guide curves to connect slab corners for mullion visualization.
- Draggable Bezier curve editor window for sculpting the scale gradient (toggleable via "Use Graph") and a floating, draggable UI for editing handles.
- Snapshot + OBJ export actions with auto-incremented filenames so every capture/download stays organized.
- Saved state manager to store numbered presets (State 1, State 2, ...) and instantly switch between parameter setups.
- Scene lighting presets (Studio, Daylight, Sunset, Noir, Cyber), medium-grey background defaults, and a dedicated Background menu with color picker.
- Motion menu with Auto Spin toggle, Spin deg/s slider (1–100), and tuned orbit/pan/zoom controls for reviewing the tower.
- Gravity menu powered by @react-three/rapier that swaps in a rigid-body simulation where slabs topple, collide, and settle like Houdini/Maya brick studies—with a Reset button to rebuild the original stack.
- Refined UI shell with separated scroll areas (scene vs. panel), Apple-like styling, and infinite, fade-blurred ground grid lighting ready for GitHub Pages hosting.

## Getting Started
1. Install Node.js 18+ (LTS recommended).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open the provided localhost URL to explore the tower generator.

## Controls
- **Structure** – Floors, floor height, thickness, base radius, and polygon segment count.
- **Scaling gradient** – Min/max scale sliders, easing selector, and optional Bezier graph editor.
- **Twist gradient** – Base/apex twist sliders and easing selector.
- **Color gradient** – Bottom/top color pickers, gradient bias slider, and scene-lighting presets.
- **Background** – Set the scene background color.
- **Motion** – Toggle Auto Spin, tune Spin deg/s, and rely on orbit/pan/zoom interactions.
- **Facade Structure** – Toggle white guide curves that trace every slab corner.
- **Export & States** – Export OBJ (with vertex colors), capture PNG snapshots, save/load tower states.
- **Gravity** – Activate a Rapier-powered rigid-body collapse simulation and Reset back to the static tower.

## Deployment
1. **Build locally**
   ```bash
   npm install                   # first time only
   npm run build                 # optional dry run
   npx vite build --base=./      # production build with relative paths
   ```
   The optimized, relative-path output lands in `dist/`.
2. **Publish to GitHub Pages**
   ```bash
   git switch gh-pages           # or another deployment branch
   rm -rf ./*                    # keep only the .git folder
   cp -R ../251108_ParametricTower/dist/* .
   touch .nojekyll
   git add -A
   git commit -m "deploy: gh-pages"
   git push origin gh-pages
   ```
   Finally, point the repo’s Pages settings to the deployment branch you used.
3. **Live demo**
   - https://siminaioa.github.io/251108_ParametricTower/
