/**
 * EffectGraph - GPU-ready, AI-friendly particle & special-effects library
 * @packageDocumentation
 */

// Public API exports
export { renderEffectToCanvas, renderEffectToImage } from './api/entry.js';
export { validateEffectSpec } from './api/validator.js';
export { listPresets, getPreset, hasPreset, getPresetNames } from './api/presets.js';

// Type exports
export type {
  EffectSpec,
  EffectHandle,
  EffectStats,
  Particle,
  EmitterConfig,
  PhysicsConfig,
  RendererConfig,
  RenderToCanvasOptions,
  RenderToImageOptions,
  PresetMetadata,
  ValidationResult,
  QualityPreset,
  Vec3,
  Vec4,
  ColorStop,
} from './types.js';

// Constants
export { LIMITS } from './api/validator.js';
