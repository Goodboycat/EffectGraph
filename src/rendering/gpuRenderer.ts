/**
 * GPU-accelerated particle renderer using Three.js
 */

import * as THREE from 'three';
import type { EffectSpec, EffectHandle, EffectStats, Particle } from '../types.js';
import { ParticlePool } from '../core/particlePool.js';
import { SeededRNG } from '../core/rng.js';
import { PerformanceMonitor } from '../util/perf.js';

export class GPUEffectRenderer implements EffectHandle {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particleSystem: THREE.Points | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;

  private spec: EffectSpec;
  private rng: SeededRNG;
  private pool: ParticlePool;
  private perfMonitor: PerformanceMonitor;

  private running: boolean = true;
  private paused: boolean = false;
  private animationId: number | null = null;
  private startTime: number = 0;
  private lastTime: number = 0;
  private accumulatedTime: number = 0;

  // Particle data arrays
  private positions: Float32Array;
  private ages: Float32Array;
  private customData: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;

  private maxParticles: number;
  private particles: Particle[] = [];
  private nextEmitTimes: number[] = [];

  constructor(
    spec: EffectSpec,
    canvas: HTMLCanvasElement,
    seed: number = Date.now(),
    cameraConfig?: { position?: [number, number, number]; lookAt?: [number, number, number]; fov?: number }
  ) {
    this.spec = spec;
    this.rng = new SeededRNG(seed);
    this.perfMonitor = new PerformanceMonitor();

    // Calculate total max particles
    this.maxParticles = spec.emitters.reduce((sum, e) => sum + e.maxParticles, 0);
    this.pool = new ParticlePool(this.maxParticles);

    // Initialize Three.js scene
    this.scene = new THREE.Scene();

    // Setup camera
    const camPos = cameraConfig?.position || [0, 5, 10];
    const camLookAt = cameraConfig?.lookAt || [0, 0, 0];
    const fov = cameraConfig?.fov || 75;

    this.camera = new THREE.PerspectiveCamera(
      fov,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(camPos[0], camPos[1], camPos[2]);
    this.camera.lookAt(camLookAt[0], camLookAt[1], camLookAt[2]);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
    });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setClearColor(0x000000, 0);

    // Initialize particle buffers
    this.positions = new Float32Array(this.maxParticles * 3);
    this.ages = new Float32Array(this.maxParticles);
    this.customData = new Float32Array(this.maxParticles * 4);
    this.velocities = new Float32Array(this.maxParticles * 3);
    this.lifetimes = new Float32Array(this.maxParticles);

    // Initialize emit times for each emitter
    this.nextEmitTimes = spec.emitters.map(() => 0);

    // Create particle system
    this.createParticleSystem();

    // Start animation loop
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.animate();
  }

  private createParticleSystem(): void {
    this.geometry = new THREE.BufferGeometry();

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('age', new THREE.BufferAttribute(this.ages, 1));
    this.geometry.setAttribute('customData', new THREE.BufferAttribute(this.customData, 4));

    // Load shader template
    const { vertexShader, fragmentShader } = this.getShaderCode();

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        particleSize: { value: this.spec.renderer.particleSize },
        time: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: this.getBlendMode(),
    });

    this.particleSystem = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particleSystem);
  }

  private getBlendMode(): THREE.Blending {
    switch (this.spec.renderer.blendMode) {
      case 'additive':
        return THREE.AdditiveBlending;
      case 'multiply':
        return THREE.MultiplyBlending;
      case 'alpha':
      default:
        return THREE.NormalBlending;
    }
  }

  private getShaderCode(): { vertexShader: string; fragmentShader: string } {
    const template = this.spec.renderer.shaderTemplate || 'smoke';

    // Default shader (based on template)
    let vertexShader = `
      attribute float age;
      attribute vec4 customData;
      
      uniform float particleSize;
      uniform float time;
      
      varying float vAge;
      varying vec4 vCustomData;
      varying float vLife;
      
      void main() {
        vAge = age;
        vCustomData = customData;
        vLife = 1.0 - age;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        float sizeMultiplier = 1.0;
        ${template === 'explosion' ? 'sizeMultiplier = 1.5 * (1.0 - age * 0.7);' : ''}
        ${template === 'smoke' ? 'sizeMultiplier = 1.0 + age * 2.0;' : ''}
        ${template === 'magic_swirl' ? 'sizeMultiplier = (0.8 + 0.4 * sin(time * 3.0 + customData.x * 10.0)) * (1.0 + age * 0.5);' : ''}
        
        gl_PointSize = particleSize * sizeMultiplier * (300.0 / -mvPosition.z);
      }
    `;

    let fragmentShader = `
      precision mediump float;
      
      varying float vAge;
      varying vec4 vCustomData;
      varying float vLife;
      
      uniform float time;
      
      ${this.getColorGradientFunction(template)}
      
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) discard;
        
        float radialFade = 1.0 - smoothstep(0.2, 0.5, dist);
        
        vec4 color = getColor(vAge);
        color.a *= radialFade * vLife;
        
        gl_FragColor = color;
      }
    `;

    return { vertexShader, fragmentShader };
  }

  private getColorGradientFunction(template: string): string {
    switch (template) {
      case 'explosion':
        return `
          vec4 getColor(float t) {
            t = clamp(t, 0.0, 1.0);
            vec4 white = vec4(1.0, 1.0, 0.9, 1.0);
            vec4 yellow = vec4(1.0, 0.9, 0.3, 1.0);
            vec4 orange = vec4(1.0, 0.4, 0.0, 0.9);
            vec4 red = vec4(0.8, 0.1, 0.0, 0.7);
            
            if (t < 0.33) return mix(white, yellow, t * 3.0);
            else if (t < 0.66) return mix(yellow, orange, (t - 0.33) * 3.0);
            else return mix(orange, red, (t - 0.66) * 3.0);
          }
        `;
      case 'magic_swirl':
        return `
          vec4 getColor(float t) {
            t = clamp(t, 0.0, 1.0);
            vec4 cyan = vec4(0.0, 1.0, 1.0, 1.0);
            vec4 magenta = vec4(1.0, 0.0, 1.0, 0.8);
            vec4 purple = vec4(0.5, 0.0, 1.0, 0.5);
            
            if (t < 0.5) return mix(cyan, magenta, t * 2.0);
            else return mix(magenta, purple, (t - 0.5) * 2.0);
          }
        `;
      case 'smoke':
      default:
        return `
          vec4 getColor(float t) {
            t = clamp(t, 0.0, 1.0);
            vec4 white = vec4(0.9, 0.9, 0.9, 0.8);
            vec4 gray = vec4(0.5, 0.5, 0.5, 0.4);
            vec4 transparent = vec4(0.3, 0.3, 0.3, 0.0);
            
            if (t < 0.5) return mix(white, gray, t * 2.0);
            else return mix(gray, transparent, (t - 0.5) * 2.0);
          }
        `;
    }
  }

  private animate = (): void => {
    if (!this.running) return;

    this.animationId = requestAnimationFrame(this.animate);

    if (this.paused) return;

    const now = performance.now();
    let deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp delta to prevent instability
    deltaTime = Math.min(deltaTime, 0.033); // Max 33ms (30 FPS minimum)

    this.perfMonitor.beginFrame();
    this.update(deltaTime);
    this.perfMonitor.markUpdate();
    this.render();
    this.perfMonitor.endFrame();
  };

  private update(deltaTime: number): void {
    const elapsedTime = (performance.now() - this.startTime) / 1000;

    // Emit new particles
    this.spec.emitters.forEach((emitter, emitterIdx) => {
      const emitInterval = 1 / emitter.rate;

      while (this.nextEmitTimes[emitterIdx] <= elapsedTime) {
        this.emitParticle(emitter, emitterIdx);
        this.nextEmitTimes[emitterIdx] += emitInterval;
      }
    });

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      if (!particle.alive) {
        this.particles.splice(i, 1);
        continue;
      }

      // Update age
      if (particle.__lifetime) {
        particle.life -= deltaTime / particle.__lifetime;
      }

      if (particle.life <= 0) {
        particle.alive = false;
        this.pool.release(particle);
        this.particles.splice(i, 1);
        continue;
      }

      // Apply physics
      const gravity = this.spec.physics.gravity;
      particle.velocity[0] += gravity[0] * deltaTime;
      particle.velocity[1] += gravity[1] * deltaTime;
      particle.velocity[2] += gravity[2] * deltaTime;

      // Apply drag
      const drag = this.spec.physics.drag;
      const damping = Math.exp(-drag * deltaTime);
      particle.velocity[0] *= damping;
      particle.velocity[1] *= damping;
      particle.velocity[2] *= damping;

      // Update position
      particle.position[0] += particle.velocity[0] * deltaTime;
      particle.position[1] += particle.velocity[1] * deltaTime;
      particle.position[2] += particle.velocity[2] * deltaTime;
    }

    // Update buffer attributes
    this.updateBuffers();
  }

  private emitParticle(emitter: any, emitterIdx: number): void {
    const particle = this.pool.acquire();
    if (!particle) return;

    // Set position based on emitter type
    const offset = emitter.position || [0, 0, 0];

    switch (emitter.type) {
      case 'point':
        particle.position = [offset[0], offset[1], offset[2]];
        break;
      case 'sphere': {
        const radius = emitter.params?.radius || 1;
        const dir = this.rng.nextVec3OnSphere();
        particle.position = [
          offset[0] + dir[0] * radius,
          offset[1] + dir[1] * radius,
          offset[2] + dir[2] * radius,
        ];
        break;
      }
      case 'box': {
        const size = emitter.params?.size || [1, 1, 1];
        const pos = this.rng.nextVec3InBox();
        particle.position = [
          offset[0] + pos[0] * size[0] * 0.5,
          offset[1] + pos[1] * size[1] * 0.5,
          offset[2] + pos[2] * size[2] * 0.5,
        ];
        break;
      }
      case 'cone': {
        const angle = ((emitter.params?.angle || 30) * Math.PI) / 180;
        const dir = this.rng.nextVec3InCone(angle);
        particle.position = [offset[0] + dir[0], offset[1] + dir[1], offset[2] + dir[2]];
        break;
      }
    }

    // Set velocity
    const velRange = emitter.velocityRange;
    particle.velocity = [
      this.rng.nextFloat(velRange.min[0], velRange.max[0]),
      this.rng.nextFloat(velRange.min[1], velRange.max[1]),
      this.rng.nextFloat(velRange.min[2], velRange.max[2]),
    ];

    // Set lifetime
    particle.__lifetime = this.rng.nextFloat(emitter.lifetime[0], emitter.lifetime[1]);
    particle.life = 1.0;
    particle.alive = true;

    // Set custom data
    particle.customData = [this.rng.next(), this.rng.next(), this.rng.next(), this.rng.next()];

    this.particles.push(particle);
  }

  private updateBuffers(): void {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      const idx = i * 3;
      const idx4 = i * 4;

      this.positions[idx] = particle.position[0];
      this.positions[idx + 1] = particle.position[1];
      this.positions[idx + 2] = particle.position[2];

      this.ages[i] = 1 - particle.life;

      if (particle.customData) {
        this.customData[idx4] = particle.customData[0];
        this.customData[idx4 + 1] = particle.customData[1];
        this.customData[idx4 + 2] = particle.customData[2];
        this.customData[idx4 + 3] = particle.customData[3];
      }
    }

    // Update geometry
    if (this.geometry) {
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.age.needsUpdate = true;
      this.geometry.attributes.customData.needsUpdate = true;
      this.geometry.setDrawRange(0, this.particles.length);
    }
  }

  private render(): void {
    if (this.material) {
      this.material.uniforms.time.value = (performance.now() - this.startTime) / 1000;
    }

    this.renderer.render(this.scene, this.camera);
  }

  stop(): void {
    this.running = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.lastTime = performance.now();
  }

  dispose(): void {
    this.stop();

    if (this.geometry) {
      this.geometry.dispose();
    }

    if (this.material) {
      this.material.dispose();
    }

    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
    }

    this.pool.dispose();
    this.renderer.dispose();
  }

  getStats(): EffectStats {
    const perfStats = this.perfMonitor.getStats();
    return {
      activeParticles: this.particles.length,
      lastFrameMs: perfStats.frameTime,
      renderedFrames: this.perfMonitor['frameCount'],
      renderMode: 'gpu',
    };
  }
}
