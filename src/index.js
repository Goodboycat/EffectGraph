/**
 * EffectGraph - Main entry point
 * Exports all core functionality
 */

export { ParticleSystem } from './core/ParticleSystem.js';
export { Particle } from './core/Particle.js';
export { createEmitter, PointEmitter, SphereEmitter, BoxEmitter, ConeEmitter } from './core/Emitter.js';

export { 
  Force,
  GravityForce,
  DragForce,
  TurbulenceForce,
  VortexForce,
  AttractorForce,
  WindForce,
  BuoyancyForce,
  createForce
} from './forces/Force.js';

export { Curve, createCurve, linearCurve, fadeCurve } from './math/curve.js';

export {
  InterpolationType,
  EffectType,
  EmitterShape,
  ForceType,
  BlendMode,
  MaterialType,
  constantDistribution,
  uniformDistribution,
  normalDistribution,
  sampleDistribution,
  validateEffectDefinition
} from './core/types.js';

// Advanced systems
export { CompositeEffect } from './core/CompositeEffect.js';
export { TrailRenderer } from './rendering/TrailRenderer.js';
export { ShockwaveEffect } from './rendering/ShockwaveEffect.js';
export { MaterialPresets, getMaterialPreset, createMaterialFromPreset } from './rendering/MaterialPresets.js';

// AI Integration
export { EffectComposer } from './ai/EffectComposer.js';
export { NaturalLanguageParser } from './ai/NaturalLanguageParser.js';

// Example effects
export { fireEffect } from './examples/fire.js';
export { smokeEffect } from './examples/smoke.js';
export { explosionEffect } from './examples/explosion.js';
export { sparklesEffect } from './examples/sparkles.js';
export { energyBallEffect } from './examples/energyBall.js';
