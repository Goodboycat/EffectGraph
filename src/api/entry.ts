/**
 * Main API entry points for EffectGraph
 */

import type {
  EffectSpec,
  EffectHandle,
  RenderToCanvasOptions,
  RenderToImageOptions,
} from '../types.js';
import { validateEffectSpec, enforceResourceLimits } from './validator.js';
import { GPUEffectRenderer } from '../rendering/gpuRenderer.js';
import { CPUCanvasRunner } from '../rendering/runner.js';

/**
 * Detect WebGL2 support
 */
function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return gl !== null;
  } catch (e) {
    return false;
  }
}

/**
 * Render an effect to a canvas element
 *
 * @param spec - Effect specification
 * @param canvas - Target HTML canvas element
 * @param opts - Rendering options
 * @returns Effect handle for controlling the effect
 *
 * @throws {Error} If specification is invalid or resources exceed limits
 */
export async function renderEffectToCanvas(
  spec: EffectSpec,
  canvas: HTMLCanvasElement,
  opts: RenderToCanvasOptions = {}
): Promise<EffectHandle> {
  // Validate specification
  const validationResult = validateEffectSpec(spec);
  if (!validationResult.valid) {
    throw new Error(`Invalid effect specification:\n${validationResult.errors.join('\n')}`);
  }

  // Apply resource limits
  const safeSpec = enforceResourceLimits(validationResult.spec);

  // Determine render mode
  let mode = opts.mode || 'auto';
  const hasWebGL2 = detectWebGL2();
  const totalParticles = safeSpec.emitters.reduce((sum, e) => sum + e.maxParticles, 0);

  if (mode === 'auto') {
    // Auto-select based on capabilities and complexity
    if (
      hasWebGL2 &&
      safeSpec.renderer.mode !== 'cpu' &&
      totalParticles > 2048
    ) {
      mode = 'gpu';
    } else {
      mode = 'cpu';
    }
  }

  // Force CPU if WebGL2 not available but GPU requested
  if (mode === 'gpu' && !hasWebGL2) {
    console.warn('WebGL2 not available, falling back to CPU renderer');
    mode = 'cpu';
  }

  // Apply quality settings
  const qualitySpec = applyQualitySettings(safeSpec, opts.quality || 'medium');

  // Get seed
  const seed = opts.seed ?? Date.now();

  // Create camera config
  const cameraConfig = opts.camera;

  // Create renderer
  let renderer: EffectHandle;

  if (mode === 'gpu') {
    renderer = new GPUEffectRenderer(qualitySpec, canvas, seed, cameraConfig);
  } else {
    renderer = new CPUCanvasRunner(qualitySpec, canvas, seed, cameraConfig);
  }

  return renderer;
}

/**
 * Render an effect to an image (Blob)
 *
 * @param spec - Effect specification
 * @param opts - Image rendering options
 * @returns Promise resolving to image Blob
 *
 * @throws {Error} If specification is invalid or headless rendering not supported
 */
export async function renderEffectToImage(
  spec: EffectSpec,
  opts: RenderToImageOptions = {}
): Promise<Blob> {
  // Validate specification
  const validationResult = validateEffectSpec(spec);
  if (!validationResult.valid) {
    throw new Error(`Invalid effect specification:\n${validationResult.errors.join('\n')}`);
  }

  const safeSpec = enforceResourceLimits(validationResult.spec);

  // Default options
  const width = opts.width || 1920;
  const height = opts.height || 1080;
  const format = opts.format || 'png';
  const seed = opts.seed ?? Date.now();

  // Create offscreen canvas
  let canvas: HTMLCanvasElement | OffscreenCanvas;
  let isOffscreen = false;

  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height);
    isOffscreen = true;
  } else if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  } else {
    throw new Error(
      'Neither OffscreenCanvas nor document available. ' +
        'For server-side rendering, consider using headless-gl or WASM solutions.'
    );
  }

  // Render a single frame
  const cameraConfig = opts.camera;

  // Use CPU renderer for simplicity in headless mode
  const runner = new CPUCanvasRunner(
    safeSpec,
    canvas as HTMLCanvasElement,
    seed,
    cameraConfig
  );

  // Let it run for a bit to generate particles
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Convert canvas to blob
  let blob: Blob;

  if (isOffscreen) {
    const offscreenCanvas = canvas as OffscreenCanvas;
    blob = await offscreenCanvas.convertToBlob({
      type: `image/${format}`,
      quality: format === 'jpeg' ? 0.92 : undefined,
    });
  } else {
    const htmlCanvas = canvas as HTMLCanvasElement;
    blob = await new Promise<Blob>((resolve, reject) => {
      htmlCanvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        },
        `image/${format}`,
        format === 'jpeg' ? 0.92 : undefined
      );
    });
  }

  // Cleanup
  runner.dispose();

  return blob;
}

/**
 * Apply quality settings to spec
 */
function applyQualitySettings(spec: EffectSpec, quality: 'low' | 'medium' | 'high'): EffectSpec {
  const qualityMultipliers = {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
  };

  const multiplier = qualityMultipliers[quality];

  return {
    ...spec,
    emitters: spec.emitters.map((emitter) => ({
      ...emitter,
      rate: Math.floor(emitter.rate * multiplier),
      maxParticles: Math.floor(emitter.maxParticles * multiplier),
    })),
    renderer: {
      ...spec.renderer,
      particleSize: spec.renderer.particleSize * multiplier,
    },
  };
}
