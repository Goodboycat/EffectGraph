# Changelog

All notable changes to EffectGraph will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-23

### Added

#### Core Features
- GPU-accelerated particle rendering using Three.js
- CPU fallback renderer for environments without WebGL2
- Seedable RNG (Mulberry32) for deterministic effects
- Object pooling for particle management
- Fixed timestep integration with delta clamping
- Performance monitoring and statistics

#### API
- `renderEffectToCanvas()` - Render effects to HTML canvas
- `renderEffectToImage()` - Export effects as image blobs
- `validateEffectSpec()` - Runtime validation with detailed errors
- `listPresets()` - Get all available presets
- `getPreset()` - Load preset by name

#### Presets
12 built-in effect presets:
- `explosion-large` - Large explosive burst
- `explosion-small` - Small quick explosion
- `smoke-spiral` - Swirling smoke with vorticity
- `smoke-dense` - Heavy smoke cloud
- `fire-spark` - Upward fire sparks
- `fire-embers` - Floating embers
- `aurora` - Aurora borealis effect
- `plasma-beam` - Energy beam
- `magic-swirl` - Magical swirling particles
- `water-spray` - Water spray with gravity
- `dust-cloud` - Ambient dust
- `ember-trails` - Trailing embers

#### Physics
- Gravity
- Air drag
- Curl noise turbulence
- Vorticity confinement
- Semi-implicit Euler integration

#### Rendering
- Multiple shader templates (smoke, explosion, magic_swirl)
- Additive, alpha, and multiply blend modes
- Particle size attenuation
- Color ramps over lifetime
- Post-processing support (bloom)

#### Validation & Safety
- Hard resource limits (max 200k particles)
- Runtime spec validation with Zod
- Detailed error messages
- Resource limit enforcement

#### Development
- TypeScript with full type definitions
- Comprehensive unit tests (Vitest)
- ESLint + Prettier configuration
- GitHub Actions CI/CD
- GitHub Pages demo deployment
- Example projects (minimal, GPU)

#### Documentation
- Complete API documentation
- Usage examples
- Contributing guidelines
- GitHub Pages interactive demo

### Architecture

```
effectgraph/
├── src/
│   ├── api/          # Public API & validation
│   ├── core/         # Particle system & physics
│   ├── rendering/    # GPU & CPU renderers
│   ├── shaders/      # GLSL snippets & templates
│   └── util/         # Utilities
├── presets/          # Effect presets (JSON)
├── tests/            # Unit tests
├── examples/         # Example HTML pages
└── docs/             # GitHub Pages demo
```

### Technical Details

- **Bundle size**: ESM ~164KB, UMD ~86KB (minified)
- **Peer dependencies**: Three.js ^0.160.0
- **Node.js**: 18+ required
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+

### Known Limitations

- Server-side headless rendering requires additional setup
- Maximum 200,000 particles across all emitters
- WebGL2 required for GPU rendering
- Safari performance may be lower than Chrome

[1.0.0]: https://github.com/username/effectgraph/releases/tag/v1.0.0
