# EffectGraph Documentation

This directory contains the GitHub Pages demo for EffectGraph.

## Viewing the Demo

The demo is available at: `https://[username].github.io/[repo-name]/`

## Local Development

To run the demo locally:

```bash
# From project root
npm run dev
```

Then open `http://localhost:5173/docs/index.html`

## Deployment

The demo is automatically deployed to GitHub Pages via the `.github/workflows/gh-pages.yml` workflow.

On every push to the `main` branch:
1. The workflow builds the library
2. Deploys the `docs/` directory to GitHub Pages
3. Updates the live demo

## Features

- **Interactive Preset Browser**: Browse all 12 built-in effect presets
- **Live Stats**: Real-time particle count, FPS, and render mode
- **Quality Controls**: Adjust quality, seed, and bloom settings
- **Spec Export**: View and copy effect specifications as JSON
- **Responsive Design**: Works on desktop and mobile devices

## Using the Built Library

The demo uses Three.js from CDN for visualization. In production, import EffectGraph from npm:

```javascript
import { renderEffectToCanvas, getPreset } from 'effectgraph';

const preset = getPreset('explosion-large');
const handle = await renderEffectToCanvas(preset, canvas, {
  mode: 'auto',
  quality: 'high',
  seed: 12345
});
```

## Customization

To customize the demo:

1. Edit `index.html` for structure and styling
2. Modify the mock implementation to use the actual built library
3. Add more controls or preset filters as needed

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

WebGL2 is required for GPU rendering. CPU fallback is used when WebGL2 is unavailable.
