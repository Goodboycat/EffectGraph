/**
 * Runtime validation using Zod schemas with resource constraints
 */

import { z } from 'zod';
import type { EffectSpec, ValidationResult } from '../types.js';

// Resource limits (enforced at runtime)
export const LIMITS = {
  MAX_PARTICLES: 200_000,
  DEFAULT_MAX_PARTICLES: 65_536,
  MAX_TEXTURE_SIZE: 2048,
  MAX_EMIT_RATE: 200_000,
  MAX_EMITTERS: 10,
  MAX_LIFETIME: 60, // seconds
  MAX_COLOR_STOPS: 16,
} as const;

// Zod schemas for validation

const Vec3Schema = z.tuple([z.number(), z.number(), z.number()]);
const Vec4Schema = z.tuple([z.number(), z.number(), z.number(), z.number()]);

const ColorStopSchema = z.object({
  t: z.number().min(0).max(1),
  color: Vec4Schema,
});

const EmitterParamsSchema = z
  .object({
    radius: z.number().min(0).optional(),
    size: Vec3Schema.optional(),
    angle: z.number().min(0).max(180).optional(),
  })
  .optional();

const EmitterConfigSchema = z.object({
  type: z.enum(['point', 'sphere', 'box', 'cone']),
  rate: z
    .number()
    .min(0)
    .max(LIMITS.MAX_EMIT_RATE)
    .default(100)
    .describe('Particles per second'),
  maxParticles: z
    .number()
    .int()
    .min(1)
    .max(LIMITS.MAX_PARTICLES)
    .default(LIMITS.DEFAULT_MAX_PARTICLES),
  lifetime: z.tuple([
    z.number().min(0.01).max(LIMITS.MAX_LIFETIME),
    z.number().min(0.01).max(LIMITS.MAX_LIFETIME),
  ]),
  velocityRange: z.object({
    min: Vec3Schema,
    max: Vec3Schema,
  }),
  position: Vec3Schema.optional().default([0, 0, 0] as [number, number, number]),
  params: EmitterParamsSchema,
});

const PhysicsConfigSchema = z.object({
  gravity: Vec3Schema.default([0, -9.8, 0] as [number, number, number]),
  drag: z.number().min(0).max(1).default(0.01),
  curlNoise: z.boolean().optional().default(false),
  curlNoiseFrequency: z.number().min(0).optional().default(1.0),
  curlNoiseAmplitude: z.number().min(0).optional().default(1.0),
  vorticity: z.boolean().optional().default(false),
  vorticityStrength: z.number().min(0).optional().default(1.0),
});

const ShaderFlagsSchema = z
  .object({
    softParticles: z.boolean().optional(),
    colorRamp: z.boolean().optional(),
    curlNoise: z.boolean().optional(),
    vorticity: z.boolean().optional(),
  })
  .optional();

const PostProcessingSchema = z
  .object({
    bloom: z
      .object({
        enabled: z.boolean(),
        strength: z.number().min(0).optional().default(1.0),
        radius: z.number().min(0).optional().default(0.5),
        threshold: z.number().min(0).optional().default(0.85),
      })
      .optional(),
    motionBlur: z
      .object({
        enabled: z.boolean(),
        samples: z.number().int().min(1).max(16).optional().default(8),
      })
      .optional(),
  })
  .optional();

const RendererConfigSchema = z.object({
  mode: z.enum(['auto', 'gpu', 'cpu']).default('auto'),
  shaderTemplate: z.enum(['smoke', 'explosion', 'magic_swirl', 'custom']).optional(),
  shaderFlags: ShaderFlagsSchema,
  particleSize: z.number().min(0.1).max(100).default(2.0),
  sizeAttenuation: z.boolean().default(true),
  colorRamp: z.array(ColorStopSchema).max(LIMITS.MAX_COLOR_STOPS).optional(),
  blendMode: z.enum(['additive', 'alpha', 'multiply']).default('additive'),
  postProcessing: PostProcessingSchema,
});

const EffectSpecSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  emitters: z.array(EmitterConfigSchema).min(1).max(LIMITS.MAX_EMITTERS),
  physics: PhysicsConfigSchema,
  renderer: RendererConfigSchema,
  duration: z.number().min(0).optional().default(0),
  suggestedQuality: z.enum(['low', 'medium', 'high']).optional(),
});

/**
 * Validate an effect specification with comprehensive checks
 * @param spec - The specification to validate
 * @returns Validation result with either valid spec or error list
 */
export function validateEffectSpec(spec: unknown): ValidationResult {
  try {
    // Parse with Zod - applies defaults and type coercion
    const parsed = EffectSpecSchema.parse(spec);

    // Additional cross-field validations
    const errors: string[] = [];

    // Check total particle count across all emitters
    const totalMaxParticles = parsed.emitters.reduce((sum, e) => sum + e.maxParticles, 0);
    if (totalMaxParticles > LIMITS.MAX_PARTICLES) {
      errors.push(
        `Total maxParticles across all emitters (${totalMaxParticles}) exceeds limit (${LIMITS.MAX_PARTICLES})`
      );
    }

    // Validate lifetime ranges
    parsed.emitters.forEach((emitter, idx) => {
      if (emitter.lifetime[0] > emitter.lifetime[1]) {
        errors.push(`Emitter ${idx}: lifetime min (${emitter.lifetime[0]}) > max (${emitter.lifetime[1]})`);
      }
    });

    // Validate velocity ranges
    parsed.emitters.forEach((emitter, idx) => {
      const { min, max } = emitter.velocityRange;
      for (let i = 0; i < 3; i++) {
        if (min[i] > max[i]) {
          errors.push(
            `Emitter ${idx}: velocityRange.min[${i}] (${min[i]}) > max[${i}] (${max[i]})`
          );
        }
      }
    });

    // Validate color ramp ordering
    if (parsed.renderer.colorRamp && parsed.renderer.colorRamp.length > 1) {
      for (let i = 1; i < parsed.renderer.colorRamp.length; i++) {
        if (parsed.renderer.colorRamp[i].t < parsed.renderer.colorRamp[i - 1].t) {
          errors.push(
            `renderer.colorRamp: stops must be in ascending order by t value (${parsed.renderer.colorRamp[i - 1].t} -> ${parsed.renderer.colorRamp[i].t})`
          );
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, spec: parsed as EffectSpec };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      return { valid: false, errors };
    }

    return {
      valid: false,
      errors: [`Unexpected validation error: ${error}`],
    };
  }
}

/**
 * Clamp a number between min and max
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Apply resource constraints to a validated spec (defensive clamping)
 */
export function enforceResourceLimits(spec: EffectSpec): EffectSpec {
  return {
    ...spec,
    emitters: spec.emitters.map((emitter) => ({
      ...emitter,
      rate: clampNumber(emitter.rate, 0, LIMITS.MAX_EMIT_RATE),
      maxParticles: clampNumber(emitter.maxParticles, 1, LIMITS.MAX_PARTICLES),
      lifetime: [
        clampNumber(emitter.lifetime[0], 0.01, LIMITS.MAX_LIFETIME),
        clampNumber(emitter.lifetime[1], 0.01, LIMITS.MAX_LIFETIME),
      ] as [number, number],
    })),
  };
}
