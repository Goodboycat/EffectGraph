# EffectGraph

> GPU-ready, AI-friendly particle & special-effects tooling for web usage

[![CI](https://github.com/username/effectgraph/workflows/CI/badge.svg)](https://github.com/username/effectgraph/actions)
[![npm version](https://badge.fury.io/js/effectgraph.svg)](https://www.npmjs.com/package/effectgraph)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

https://goodboycat.github.io/EffectGraph

## 🌟 Why EffectGraph?

EffectGraph is a production-quality TypeScript library for creating stunning particle effects and special effects in web applications. Built with GPU acceleration, deterministic behavior, and AI-friendly APIs.

## ✨ Features

- 🚀 **GPU-Accelerated**: Leverages Three.js and WebGL2 for high-performance rendering
- 🎮 **CPU Fallback**: Automatic fallback for environments without WebGL2
- 🎨 **12 Built-in Presets**: Ready-to-use effects (explosions, smoke, fire, magic, etc.)
- 🔒 **Resource Limits**: Hard caps on particles, memory, and emit rates
- 🎯 **Deterministic**: Seedable RNG for reproducible effects
- 🤖 **AI-Friendly**: Runtime validation, structured presets, and clear constraints
- 📦 **Zero Config**: Works out of the box with sensible defaults
- 🎭 **Headless Rendering**: Server-side image generation support
- 📊 **Performance Monitoring**: Built-in stats and profiling
- 🧪 **Fully Tested**: Comprehensive unit test coverage

## 📦 Installation

```bash
npm install effectgraph three
```

Or with yarn:

```bash
yarn add effectgraph three
```

**Note**: Three.js is a peer dependency and must be installed separately.

## 🚀 Quick Start

```typescript
import { renderEffectToCanvas, getPreset } from 'effectgraph';

// Get canvas element
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Load a preset
const explosionSpec = getPreset('explosion-large');

// Render to canvas
const handle = await renderEffectToCanvas(explosionSpec, canvas, {
  mode: 'auto',      // Auto-select GPU or CPU
  quality: 'high',   // low, medium, or high
  seed: 12345        // For reproducible effects
});

// Get stats
console.log(handle.getStats());
// { activeParticles: 5420, lastFrameMs: 12.5, renderMode: 'gpu' }

// Control the effect
handle.pause();
handle.resume();
handle.stop();
handle.dispose(); // Clean up resources
```

## 📚 Documentation

### Available Presets

```typescript
import { listPresets, getPreset } from 'effectgraph';

// List all presets
const presets = listPresets();
console.log(presets);
// [
//   { name: 'explosion-large', description: '...', tags: [...] },
//   { name: 'smoke-spiral', description: '...', tags: [...] },
//   ...
// ]

// Load any preset
const preset = getPreset('magic-swirl');
```

Available presets:
- `explosion-large` - Large explosive burst with fire
- `explosion-small` - Quick explosive burst
- `smoke-spiral` - Swirling smoke with vorticity
- `smoke-dense` - Heavy smoke cloud
- `fire-spark` - Upward fire sparks
- `fire-embers` - Floating fire embers
- `aurora` - Aurora borealis effect
- `plasma-beam` - Concentrated energy beam
- `magic-swirl` - Magical swirling particles
- `water-spray` - Water spray with physics
- `dust-cloud` - Ambient dust particles
- `ember-trails` - Trailing ember particles

### Custom Effects

```typescript
import { renderEffectToCanvas, validateEffectSpec } from 'effectgraph';
import type { EffectSpec } from 'effectgraph';

const customSpec: EffectSpec = {
  name: 'my-effect',
  description: 'Custom particle effect',
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
    curlNoiseFrequency: 1.0,
    curlNoiseAmplitude: 2.0
  },
  renderer: {
    mode: 'auto',
    shaderTemplate: 'smoke',
    particleSize: 10,
    sizeAttenuation: true,
    blendMode: 'additive',
    postProcessing: {
      bloom: {
        enabled: true,
        strength: 1.5
      }
    }
  }
};

// Validate before using
const result = validateEffectSpec(customSpec);
if (result.valid) {
  const handle = await renderEffectToCanvas(result.spec, canvas);
} else {
  console.error('Invalid spec:', result.errors);
}
```

### Headless Rendering

```typescript
import { renderEffectToImage } from 'effectgraph';

const blob = await renderEffectToImage(preset, {
  width: 1920,
  height: 1080,
  format: 'png',
  seed: 12345
});

// Save or upload the image
const url = URL.createObjectURL(blob);
```

## 🎮 Examples

Check out the [examples](./examples) directory:

- `minimal.html` - Simple smoke effect
- `gpu.html` - Interactive preset browser with controls

Run examples locally:

```bash
npm run dev
```

Then open `http://localhost:5173/examples/gpu.html`

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Build library
npm run build
```

## 📐 Architecture

```
effectgraph/
├── src/
│   ├── api/          # Public API & validation
│   ├── core/         # Particle system & physics
│   ├── rendering/    # GPU & CPU renderers
│   ├── shaders/      # GLSL shader snippets & templates
│   └── util/         # Utilities (RNG, math, perf)
├── presets/          # Built-in effect presets
├── examples/         # Example HTML pages
├── tests/            # Unit tests
└── docs/             # GitHub Pages demo
```

## 🔧 Configuration

### Resource Limits

EffectGraph enforces hard resource limits to prevent performance issues:

```typescript
import { LIMITS } from 'effectgraph';

console.log(LIMITS);
// {
//   MAX_PARTICLES: 200000,
//   DEFAULT_MAX_PARTICLES: 65536,
//   MAX_TEXTURE_SIZE: 2048,
//   MAX_EMIT_RATE: 200000,
//   MAX_EMITTERS: 10,
//   MAX_LIFETIME: 60,
//   MAX_COLOR_STOPS: 16
// }
```

Specs exceeding these limits will be clamped or rejected during validation.

## 🤖 AI Integration

EffectGraph is designed to be AI-friendly:

1. **Structured Presets**: All presets are JSON with clear schemas
2. **Runtime Validation**: Comprehensive error messages for invalid specs
3. **Deterministic**: Seedable RNG for reproducible results
4. **Resource Constraints**: Hard limits prevent runaway generation
5. **Machine-Readable**: `presets/index.json` and `schema/effect-spec.json`

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Node.js 18+ (headless rendering)

WebGL2 is required for GPU rendering. The library automatically falls back to CPU rendering when WebGL2 is unavailable.

## 📄 License

MIT © [Your Name]

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 🐛 Known Issues

- Server-side headless rendering requires additional setup (headless-gl or containerized browser)
- Safari may have reduced performance compared to Chrome
- Mobile devices may require lower quality settings

## 🚀 Roadmap

- [ ] WebGPU renderer
- [ ] More shader templates
- [ ] Collision detection
- [ ] Texture atlases for sprites
- [ ] More post-processing effects
- [ ] Better mobile performance

## 📞 Support

- [GitHub Issues](https://github.com/username/effectgraph/issues)
- [Documentation](https://username.github.io/effectgraph)
- [Examples](https://username.github.io/effectgraph/examples)

---

Made with ❤️ for the web
