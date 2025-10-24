# EffectGraph - Quick Start Guide

## Installation

```bash
npm install effectgraph three
```

## Basic Usage (30 seconds)

```typescript
import { renderEffectToCanvas, getPreset } from 'effectgraph';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const preset = getPreset('explosion-large');

const handle = await renderEffectToCanvas(preset, canvas, {
  mode: 'auto',
  quality: 'high',
  seed: 12345
});

// Control the effect
handle.pause();
handle.resume();
handle.dispose();
```

## All Available Presets

```typescript
import { listPresets, getPreset } from 'effectgraph';

// Get list of all presets
const presets = listPresets();
console.log(presets); // Array of { name, description, tags }

// Load any preset
const explosion = getPreset('explosion-large');
const smoke = getPreset('smoke-spiral');
const magic = getPreset('magic-swirl');
```

**Available Presets:**
- `explosion-large` - Dramatic explosive burst
- `explosion-small` - Quick explosion
- `smoke-spiral` - Swirling smoke
- `smoke-dense` - Heavy smoke cloud
- `fire-spark` - Upward sparks
- `fire-embers` - Floating embers
- `aurora` - Aurora borealis
- `plasma-beam` - Energy beam
- `magic-swirl` - Magical swirls
- `water-spray` - Water spray
- `dust-cloud` - Ambient dust
- `ember-trails` - Ember trails

## Custom Effect

```typescript
import { validateEffectSpec, renderEffectToCanvas } from 'effectgraph';
import type { EffectSpec } from 'effectgraph';

const customSpec: EffectSpec = {
  name: 'my-effect',
  emitters: [{
    type: 'sphere',
    rate: 100,
    maxParticles: 5000,
    lifetime: [1, 3],
    velocityRange: {
      min: [-2, -2, -2],
      max: [2, 2, 2]
    },
    position: [0, 0, 0],
    params: { radius: 1 }
  }],
  physics: {
    gravity: [0, -9.8, 0],
    drag: 0.5,
    curlNoise: true,
    curlNoiseAmplitude: 2.0
  },
  renderer: {
    mode: 'auto',
    shaderTemplate: 'smoke',
    particleSize: 10,
    sizeAttenuation: true,
    blendMode: 'additive'
  }
};

// Always validate custom specs
const result = validateEffectSpec(customSpec);
if (result.valid) {
  const handle = await renderEffectToCanvas(result.spec, canvas);
} else {
  console.error('Invalid spec:', result.errors);
}
```

## Export to Image (Headless)

```typescript
import { renderEffectToImage, getPreset } from 'effectgraph';

const preset = getPreset('explosion-large');

const blob = await renderEffectToImage(preset, {
  width: 1920,
  height: 1080,
  format: 'png',
  seed: 12345
});

// Download or upload
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'effect.png';
a.click();
```

## Quality Settings

```typescript
// Low quality (fast, fewer particles)
const handle = await renderEffectToCanvas(preset, canvas, {
  quality: 'low'
});

// Medium quality (balanced)
const handle = await renderEffectToCanvas(preset, canvas, {
  quality: 'medium'
});

// High quality (best visuals)
const handle = await renderEffectToCanvas(preset, canvas, {
  quality: 'high'
});
```

## Get Real-time Stats

```typescript
const handle = await renderEffectToCanvas(preset, canvas);

setInterval(() => {
  const stats = handle.getStats();
  console.log({
    particles: stats.activeParticles,
    fps: (1000 / stats.lastFrameMs).toFixed(1),
    mode: stats.renderMode // 'gpu' or 'cpu'
  });
}, 1000);
```

## Modify Presets

```typescript
import { getPreset } from 'effectgraph';

// Get preset and modify
const preset = getPreset('explosion-large');

// Make it bigger
preset.emitters[0].maxParticles *= 2;
preset.emitters[0].rate *= 2;

// Make it faster
preset.emitters[0].velocityRange.min = preset.emitters[0].velocityRange.min.map(v => v * 2);
preset.emitters[0].velocityRange.max = preset.emitters[0].velocityRange.max.map(v => v * 2);

// Add turbulence
preset.physics.curlNoise = true;
preset.physics.curlNoiseAmplitude = 3.0;
preset.physics.vorticity = true;

// Render modified preset
const handle = await renderEffectToCanvas(preset, canvas);
```

## Error Handling

```typescript
try {
  const handle = await renderEffectToCanvas(preset, canvas, {
    mode: 'gpu',
    quality: 'high'
  });
} catch (error) {
  console.error('Failed to render:', error);
  // Will automatically fallback to CPU if GPU fails
}
```

## Common Patterns

### Increase Intensity
```typescript
const preset = getPreset('explosion-large');
preset.emitters[0].rate *= 1.5;
preset.emitters[0].maxParticles *= 1.5;
preset.renderer.particleSize *= 1.3;
```

### Add Swirling Motion
```typescript
const preset = getPreset('smoke-dense');
preset.physics.vorticity = true;
preset.physics.vorticityStrength = 5.0;
```

### Make Slower
```typescript
const preset = getPreset('water-spray');
preset.physics.drag = 0.8; // Increase drag
preset.emitters[0].lifetime = [3, 6]; // Longer lifetime
```

## Development Mode

```bash
# Clone repository
git clone <repo-url>
cd effectgraph

# Install dependencies
npm install

# Start dev server
npm run dev

# Open examples
open http://localhost:5173/examples/gpu.html
```

## Resource Limits

EffectGraph enforces hard limits for safety:

```typescript
import { LIMITS } from 'effectgraph';

console.log(LIMITS);
// {
//   MAX_PARTICLES: 200000,
//   DEFAULT_MAX_PARTICLES: 65536,
//   MAX_EMIT_RATE: 200000,
//   MAX_EMITTERS: 10
// }
```

Specs exceeding these limits will be automatically clamped.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- WebGL2 required for GPU mode (auto-fallback to CPU)

## Next Steps

- Read full [README.md](./README.md)
- Check [examples/](./examples/)
- View [live demo](https://username.github.io/effectgraph)
- Read [API documentation](./docs/)

---

**Ready to create amazing effects!** 🎨✨
