# 251108_ParametricTower

A browser-based playground for designing gradient-driven stacked tower geometries. The app renders procedural floor slabs in WebGL (React Three Fiber + Three.js) and lets you experiment with twisting, scale envelopes, heights, and color ramps to prototype expressive skyscraper massings in real time.

## Features
- React + Vite + TypeScript scaffold with hot reload and linting
- Three.js instanced floor slabs with gradient coloring from base to apex
- Custom controls panel for floor count, heights, scale and twist gradients
- Real-time easing curves for scaling/twisting distributions
- Responsive layout with live stats chip showing total height and twist span

## Getting Started
1. Install Node.js 18+ (already included on this machine).
2. Run 
pm install inside 251108_ParametricTower if dependencies change.
3. Launch the dev server with 
pm run dev and open the provided localhost URL.

## Controls
- **Floors / floor height / base radius**: defines structural stack and footprint.
- **Scaling gradient**: set minimum and maximum profile scale plus interpolation mode.
- **Twist gradient**: set starting and ending rotation plus easing curve.
- **Color gradient**: pick bottom/top colors for the tower material.
- **Reset presets**: restore the default parameter set.

