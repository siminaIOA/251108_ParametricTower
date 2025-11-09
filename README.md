# 251108_ParametricTower

A browser-based playground for designing gradient-driven stacked tower geometries. The app renders procedural floor slabs in WebGL (React Three Fiber + Three.js) and lets you experiment with twisting, scale envelopes, heights, color ramps, lighting, and exports to prototype expressive skyscraper massings in real time.

## Features
- React + Vite + TypeScript scaffold with hot reload, linting, and OBJ exporting with vertex colors.
- Three.js instanced floor slabs with gradient coloring from base to apex plus Bezier-driven scaling curves.
- Custom controls panel for structure, scaling/twisting gradients, lighting presets, background colors, and saved parameter states.
- Motion controls with optional auto-spin, adjustable speed, and a draggable Bezier graph editor for precise scaling curves.
- Scene lighting presets (Studio, Daylight, Sunset, Noir, Cyber) for rapid presentation looks.
- Saved state manager to capture multiple tower setups and switch between them instantly.
- Responsive layout with infinite grid ground plane, mouse-based orbit/pan/zoom, and GitHub Pages-ready bundle.

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
- **Motion**: toggle auto-spin, adjust spin speed, and view the tower center.
- **Background**: set the canvas background color.
- **Export & States**: export OBJ files (with vertex colors), save parameter states, and switch between them.

## Deployment
1. **Local build**
   ```bash
   npm run build
   ```
   The optimized output is emitted to `dist/`.
2. **GitHub Pages**
   - Build with relative paths:
     ```bash
     npx vite build --base=./
     ```
   - Copy the contents of `dist/` onto the `gh-pages` branch (or publish using your preferred workflow) and push it:
     ```bash
     git switch gh-pages
     cp -R dist/* .
     touch .nojekyll
     git add -A && git commit -m "deploy: gh-pages" && git push origin gh-pages
     ```
   - Enable GitHub Pages in the repository settings and point it to the `gh-pages` branch.

### Live Demo
- GitHub Pages: https://siminaioa.github.io/251108_ParametricTower/
