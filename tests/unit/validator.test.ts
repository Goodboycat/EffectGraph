/**
 * Tests for effect spec validation
 */

import { describe, it, expect } from 'vitest';
import { validateEffectSpec } from '../../src/api/validator.js';
import type { EffectSpec } from '../../src/types.js';

describe('validateEffectSpec', () => {
  const validSpec: EffectSpec = {
    name: 'test-effect',
    emitters: [
      {
        type: 'point',
        rate: 100,
        maxParticles: 1000,
        lifetime: [1, 2],
        velocityRange: {
          min: [-1, -1, -1],
          max: [1, 1, 1],
        },
      },
    ],
    physics: {
      gravity: [0, -9.8, 0],
      drag: 0.1,
    },
    renderer: {
      mode: 'auto',
      particleSize: 5,
      sizeAttenuation: true,
      blendMode: 'additive',
    },
  };

  it('should validate a correct spec', () => {
    const result = validateEffectSpec(validSpec);
    
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.spec).toBeDefined();
      expect(result.spec.name).toBe('test-effect');
    }
  });

  it('should reject spec with missing required fields', () => {
    const invalid = {
      name: 'test',
      // Missing emitters
    };
    
    const result = validateEffectSpec(invalid);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('should reject spec with invalid emitter type', () => {
    const invalid = {
      ...validSpec,
      emitters: [
        {
          ...validSpec.emitters[0],
          type: 'invalid-type',
        },
      ],
    };
    
    const result = validateEffectSpec(invalid);
    expect(result.valid).toBe(false);
  });

  it('should reject spec with negative particle count', () => {
    const invalid = {
      ...validSpec,
      emitters: [
        {
          ...validSpec.emitters[0],
          maxParticles: -100,
        },
      ],
    };
    
    const result = validateEffectSpec(invalid);
    expect(result.valid).toBe(false);
  });

  it('should reject spec exceeding max particles', () => {
    const invalid = {
      ...validSpec,
      emitters: [
        {
          ...validSpec.emitters[0],
          maxParticles: 300_000, // Exceeds 200k limit
        },
      ],
    };
    
    const result = validateEffectSpec(invalid);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some(e => e.includes('maxParticles'))).toBe(true);
    }
  });

  it('should reject spec with inverted lifetime range', () => {
    const invalid = {
      ...validSpec,
      emitters: [
        {
          ...validSpec.emitters[0],
          lifetime: [5, 1], // min > max
        },
      ],
    };
    
    const result = validateEffectSpec(invalid);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some(e => e.includes('lifetime'))).toBe(true);
    }
  });

  it('should reject spec with inverted velocity range', () => {
    const invalid = {
      ...validSpec,
      emitters: [
        {
          ...validSpec.emitters[0],
          velocityRange: {
            min: [1, 1, 1],
            max: [-1, -1, -1], // min > max
          },
        },
      ],
    };
    
    const result = validateEffectSpec(invalid);
    expect(result.valid).toBe(false);
  });

  it('should apply default values', () => {
    const minimal = {
      name: 'minimal',
      emitters: [
        {
          type: 'point',
          lifetime: [1, 2],
          velocityRange: {
            min: [0, 0, 0],
            max: [1, 1, 1],
          },
          // Note: rate and maxParticles should get defaults
        },
      ],
      physics: {
        gravity: [0, 0, 0],
        drag: 0,
      },
      renderer: {
        mode: 'auto',
        particleSize: 5,
        sizeAttenuation: true,
        blendMode: 'additive',
      },
    };
    
    const result = validateEffectSpec(minimal);
    expect(result.valid).toBe(true);
    
    if (result.valid) {
      expect(result.spec.emitters[0].rate).toBeDefined();
      expect(result.spec.emitters[0].maxParticles).toBeDefined();
      expect(result.spec.physics.gravity).toBeDefined();
      expect(result.spec.renderer.particleSize).toBeDefined();
    }
  });

  it('should validate color ramp ordering', () => {
    const specWithColorRamp = {
      ...validSpec,
      renderer: {
        ...validSpec.renderer,
        colorRamp: [
          { t: 0.5, color: [1, 0, 0, 1] as [number, number, number, number] },
          { t: 0.2, color: [0, 1, 0, 1] as [number, number, number, number] }, // Out of order!
        ],
      },
    };
    
    const result = validateEffectSpec(specWithColorRamp);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some(e => e.includes('colorRamp'))).toBe(true);
    }
  });

  it('should handle unknown input gracefully', () => {
    const result = validateEffectSpec(null);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});
