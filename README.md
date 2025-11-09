# 251108_ParametricTower

A browser-based playground for designing gradient-driven stacked tower geometries. The app renders procedural floor slabs in WebGL (React Three Fiber + Three.js) and lets you experiment with twisting, scale envelopes, heights, color ramps, lighting, and exports to prototype expressive skyscraper massings in real time.

## Features
- React + Vite + TypeScript scaffold with hot reload, linting, and OBJ exporting with vertex colors.
- Three.js instanced floor slabs with gradient coloring from base to apex plus Bezier-driven scaling curves.
- Custom controls panel for structure, scaling/twisting gradients, lighting presets, background colors, saved parameter states, facade overlays, and per-floor segment counts.
- Bezier curve editor with draggable overlay window for sculpting the scale gradient curve.
- Snapshot + OBJ export actions for quickly sharing renders or geometry (snapshots auto-increment their filenames).
- Motion controls with optional auto-spin, adjustable speed, and tuned camera orbit/pan/zoom.
- Scene lighting presets (Studio, Daylight, Sunset, Noir, Cyber) and background color picker for presentation-ready looks.
- Saved state manager to capture multiple tower setups and switch between them instantly.
- Responsive layout with infinite ground grid, refined scroll separation between scene/menu, and GitHub Pages-ready bundle.

## Getting Started
1. Install Node.js 18+.
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
- **Floors / floor height / base radius / thickness / segments**: defines structural stack and slab footprint.
- **Scaling gradient**: set min/max scale, easing curve, or toggle the Bezier graph editor for custom curves.
- **Twist gradient**: configure base/apex twist with easing.
- **Color gradient**: pick bottom/top colors, adjust gradient bias, and choose scene lighting presets.
- **Facade Structure**: toggle white guide curves that trace each slab segment to visualize facade mullions.
- **Motion**: toggle auto-spin, adjust spin speed, and view the tower center.
- **Background**: set the canvas background color.
- **Export & States**: export OBJ files (with vertex colors), capture PNG snapshots, save parameter states, and switch between them.

## Deployment
1. **Build locally**
   ```bash
   npm install
   npm run build
   ```
   The optimized output lands in `dist/`.
2. **Publish to GitHub Pages**
   ```bash
   npx vite build --base=./
   git switch gh-pages
   cp -R dist/* .
   touch .nojekyll
   git add -A
   git commit -m "deploy: gh-pages"
   git push origin gh-pages
   ```
   Finally, ensure GitHub Pages targets the `gh-pages` branch.
3. **Live demo**
   - https://siminaioa.github.io/251108_ParametricTower/
