# 251108_ParametricTower

A browser-based playground for designing gradient-driven stacked tower geometries. The app renders procedural floor slabs in WebGL (React Three Fiber + Three.js) and lets you experiment with twisting, scale envelopes, heights, color ramps, lighting, and exports to prototype expressive skyscraper massings in real time.

## Features
- React + Vite + TypeScript scaffold with hot reload, linting, and OBJ exporting that retains vertex colors.
- Procedural Three.js tower mesh with per-floor twisting, scaling, gradient coloring, and customizable segment counts (triangles through decagons).
- Facade Structure overlay button that spawns vertical guide curves to connect slab corners for mullion visualization.
- Draggable Bezier curve editor window for hand-sculpting the scale gradient (toggleable via “Use Graph”), including synchronized UI preview.
- Snapshot + OBJ export actions with auto-incremented filenames so every capture/download is uniquely named.
- Saved state manager to store numbered presets (State 1, State 2, …) and instantly switch between parameter setups.
- Scene lighting presets (Studio, Daylight, Sunset, Noir, Cyber), medium-grey background defaults, and a dedicated Background menu with color picker.
- Motion menu with Auto Spin toggle, Spin deg/s slider (1–100), camera pan/orbit/zoom shortcuts, and optional spin bias target.
- Refined UI shell with separated scroll areas (scene vs. panel), “Parametric Tower” headline, Apple-like controls, and draggable scale-gradient popup.
- Infinite, fade-blurred ground grid plus global lighting tuned for bright presentation renders, ready to deploy on GitHub Pages.

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
   npm install                   # first time only
   npm run build                 # produces dist/ with absolute paths
   npx vite build --base=./      # rebuild with relative paths for Pages
   ```
   The optimized, relative-path output lands in `dist/`.
2. **Publish to GitHub Pages**
   ```bash
   git switch gh-pages           # or git switch gh-pages-new
   rm -rf ./*                    # clear branch contents (keep .git)
   cp -R ../251108_ParametricTower/dist/* .
   touch .nojekyll
   git add -A
   git commit -m "deploy: gh-pages"
   git push origin gh-pages      # or push gh-pages-new
   ```
   Point the repository’s Pages settings to the branch you deployed.
3. **Live demo**
   - https://siminaioa.github.io/251108_ParametricTower/
