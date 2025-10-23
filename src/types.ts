/**
 * Core TypeScript types for EffectGraph library
 */

/**
 * Vector3 type for position, velocity, etc.
 */
export type Vec3 = [number, number, number];

/**
 * Vector4 type for color, custom data
 */
export type Vec4 = [number, number, number, number];

/**
 * Particle representation
 */
export interface Particle {
  /** Current position in 3D space */
  position: Vec3;
  /** Current velocity vector */
  velocity: Vec3;
  /** Remaining life (0-1, where 1 is just spawned, 0 is dead) */
  life: number;
  /** Whether particle is currently active */
  alive: boolean;
  /** Initial lifetime in seconds (optional, for reference) */
  __lifetime?: number;
  /** Custom data for procedural effects (optional) */
  customData?: Vec4;
}

/**
 * Color stop for gradient/ramp
 */
export interface ColorStop {
  /** Position in gradient (0-1) */
  t: number;
  /** RGBA color */
  color: Vec4;
}

/**
 * Emitter configuration
 */
export interface EmitterConfig {
  /** Emitter type */
  type: 'point' | 'sphere' | 'box' | 'cone';
  /** Emission rate (particles per second) */
  rate: number;
  /** Maximum particles this emitter can have alive */
  maxParticles: number;
  /** Particle lifetime range [min, max] in seconds */
  lifetime: [number, number];
  /** Initial velocity range */
  velocityRange: {
    min: Vec3;
    max: Vec3;
  };
  /** Position offset */
  position?: Vec3;
  /** Emitter-specific parameters */
  params?: {
    /** Radius for sphere/cone emitters */
    radius?: number;
    /** Size for box emitter */
    size?: Vec3;
    /** Angle for cone emitter (degrees) */
    angle?: number;
  };
}

/**
 * Physics configuration
 */
export interface PhysicsConfig {
  /** Gravity acceleration */
  gravity: Vec3;
  /** Air drag coefficient (0-1) */
  drag: number;
  /** Enable curl noise turbulence */
  curlNoise?: boolean;
  /** Curl noise frequency */
  curlNoiseFrequency?: number;
  /** Curl noise amplitude */
  curlNoiseAmplitude?: number;
  /** Enable vorticity confinement */
  vorticity?: boolean;
  /** Vorticity strength */
  vorticityStrength?: number;
}

/**
 * Rendering configuration
 */
export interface RendererConfig {
  /** Render mode preference */
  mode: 'auto' | 'gpu' | 'cpu';
  /** Shader template to use */
  shaderTemplate?: 'smoke' | 'explosion' | 'magic_swirl' | 'custom';
  /** Shader feature flags */
  shaderFlags?: {
    softParticles?: boolean;
    colorRamp?: boolean;
    curlNoise?: boolean;
    vorticity?: boolean;
  };
  /** Particle size in pixels */
  particleSize: number;
  /** Size attenuation with distance */
  sizeAttenuation: boolean;
  /** Color over lifetime */
  colorRamp?: ColorStop[];
  /** Blend mode */
  blendMode: 'additive' | 'alpha' | 'multiply';
  /** Post-processing effects */
  postProcessing?: {
    bloom?: {
      enabled: boolean;
      strength?: number;
      radius?: number;
      threshold?: number;
    };
    motionBlur?: {
      enabled: boolean;
      samples?: number;
    };
  };
}

/**
 * Quality preset
 */
export type QualityPreset = 'low' | 'medium' | 'high';

/**
 * Complete effect specification
 */
export interface EffectSpec {
  /** Effect name/identifier */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Tags for categorization */
  tags?: string[];
  /** List of emitters */
  emitters: EmitterConfig[];
  /** Physics configuration */
  physics: PhysicsConfig;
  /** Renderer configuration */
  renderer: RendererConfig;
  /** Duration in seconds (0 = infinite loop) */
  duration?: number;
  /** Suggested quality preset */
  suggestedQuality?: QualityPreset;
}

/**
 * Effect handle for controlling running effects
 */
export interface EffectHandle {
  /** Stop the effect and prevent new particle emission */
  stop(): void;
  /** Dispose all resources (geometries, materials, textures) */
  dispose(): void;
  /** Get current statistics */
  getStats(): EffectStats;
  /** Pause the effect */
  pause?(): void;
  /** Resume the effect */
  resume?(): void;
}

/**
 * Effect statistics
 */
export interface EffectStats {
  /** Number of currently active particles */
  activeParticles: number;
  /** Last frame time in milliseconds */
  lastFrameMs: number;
  /** Total rendered frames */
  renderedFrames?: number;
  /** Current render mode being used */
  renderMode?: 'gpu' | 'cpu';
}

/**
 * Render options for canvas rendering
 */
export interface RenderToCanvasOptions {
  /** Render mode (auto-detect, force GPU, or force CPU) */
  mode?: 'auto' | 'gpu' | 'cpu';
  /** Random seed for deterministic generation */
  seed?: number;
  /** Quality preset */
  quality?: QualityPreset;
  /** Camera configuration */
  camera?: {
    position?: Vec3;
    lookAt?: Vec3;
    fov?: number;
  };
  /** Enable debug overlay */
  debug?: boolean;
}

/**
 * Render options for image export
 */
export interface RenderToImageOptions {
  /** Output width in pixels */
  width?: number;
  /** Output height in pixels */
  height?: number;
  /** Random seed for deterministic generation */
  seed?: number;
  /** Image format */
  format?: 'png' | 'webp' | 'jpeg';
  /** Number of frames to render (for animated exports) */
  frames?: number;
  /** Frame rate for multi-frame renders */
  fps?: number;
  /** Camera configuration */
  camera?: {
    position?: Vec3;
    lookAt?: Vec3;
    fov?: number;
  };
}

/**
 * Preset metadata
 */
export interface PresetMetadata {
  /** Preset name/identifier */
  name: string;
  /** Human-readable description */
  description: string;
  /** Categorization tags */
  tags: string[];
  /** Recommended render mode */
  recommendedMode?: 'gpu' | 'cpu';
  /** Performance hint */
  performanceHint?: 'light' | 'medium' | 'heavy';
}

/**
 * Validation result for successful validation
 */
export interface ValidationSuccess {
  valid: true;
  spec: EffectSpec;
}

/**
 * Validation result for failed validation
 */
export interface ValidationError {
  valid: false;
  errors: string[];
}

/**
 * Validation result type
 */
export type ValidationResult = ValidationSuccess | ValidationError;
