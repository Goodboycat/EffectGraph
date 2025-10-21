/**
 * Core type definitions for EffectGraph system
 * These types define the structure of effect definitions
 */

export const InterpolationType = {
  LINEAR: 'linear',
  CUBIC: 'cubic',
  STEP: 'step',
  BEZIER: 'bezier'
};

export const EffectType = {
  PARTICLE: 'particle',
  MESH: 'mesh',
  FIELD: 'field',
  COMPOSITE: 'composite'
};

export const EmitterShape = {
  POINT: 'point',
  SPHERE: 'sphere',
  BOX: 'box',
  CONE: 'cone',
  MESH: 'mesh'
};

export const ForceType = {
  GRAVITY: 'gravity',
  DRAG: 'drag',
  TURBULENCE: 'turbulence',
  VORTEX: 'vortex',
  ATTRACTOR: 'attractor',
  WIND: 'wind',
  BUOYANCY: 'buoyancy'
};

export const BlendMode = {
  NORMAL: 'normal',
  ADDITIVE: 'additive',
  MULTIPLY: 'multiply',
  SUBTRACTIVE: 'subtractive'
};

export const MaterialType = {
  SPRITE: 'sprite',
  MESH: 'mesh',
  TRAIL: 'trail',
  RIBBON: 'ribbon'
};

/**
 * Create a constant distribution
 */
export function constantDistribution(value) {
  return { type: 'constant', value };
}

/**
 * Create a uniform random distribution
 */
export function uniformDistribution(min, max) {
  return { type: 'uniform', min, max };
}

/**
 * Create a normal (Gaussian) distribution
 */
export function normalDistribution(mean, stddev) {
  return { type: 'normal', mean, stddev };
}

/**
 * Sample from a distribution
 */
export function sampleDistribution(distribution) {
  switch (distribution.type) {
    case 'constant':
      return distribution.value;
    
    case 'uniform':
      if (typeof distribution.min === 'number') {
        return distribution.min + Math.random() * (distribution.max - distribution.min);
      } else if (Array.isArray(distribution.min)) {
        return distribution.min.map((minVal, i) => 
          minVal + Math.random() * (distribution.max[i] - minVal)
        );
      }
      break;
    
    case 'normal':
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      if (typeof distribution.mean === 'number') {
        return distribution.mean + z0 * distribution.stddev;
      } else if (Array.isArray(distribution.mean)) {
        return distribution.mean.map((mean, i) => 
          mean + z0 * distribution.stddev[i]
        );
      }
      break;
    
    default:
      return distribution.value || 0;
  }
}

/**
 * Validate an effect definition
 */
export function validateEffectDefinition(definition) {
  const errors = [];
  
  if (!definition.name) {
    errors.push('Effect must have a name');
  }
  
  if (!definition.type || !Object.values(EffectType).includes(definition.type)) {
    errors.push(`Invalid effect type: ${definition.type}`);
  }
  
  if (definition.type === EffectType.PARTICLE) {
    if (!definition.particles || !definition.particles.maxCount) {
      errors.push('Particle effect must specify maxCount');
    }
    
    if (!definition.emitter) {
      errors.push('Particle effect must have an emitter');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
