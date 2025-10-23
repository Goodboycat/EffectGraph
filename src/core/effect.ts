/**
 * Core CPU-based effect simulation
 */

import type { EffectSpec, Particle, EmitterConfig } from '../types.js';
import { ParticlePool, initParticle } from './particlePool.js';
import { SeededRNG } from './rng.js';

export class EffectSimulator {
  private spec: EffectSpec;
  private pool: ParticlePool;
  private rng: SeededRNG;
  private particles: Particle[] = [];
  private nextEmitTimes: number[] = [];
  private elapsedTime: number = 0;

  constructor(spec: EffectSpec, seed: number = Date.now()) {
    this.spec = spec;
    this.rng = new SeededRNG(seed);

    const maxParticles = spec.emitters.reduce((sum, e) => sum + e.maxParticles, 0);
    this.pool = new ParticlePool(maxParticles);

    // Initialize emit times
    this.nextEmitTimes = spec.emitters.map(() => 0);
  }

  /**
   * Update simulation by deltaTime seconds
   */
  update(deltaTime: number): void {
    // Clamp delta to prevent instability
    deltaTime = Math.min(deltaTime, 0.033);

    this.elapsedTime += deltaTime;

    // Emit new particles
    this.spec.emitters.forEach((emitter, idx) => {
      const emitInterval = 1 / emitter.rate;

      while (this.nextEmitTimes[idx] <= this.elapsedTime) {
        this.emitParticle(emitter);
        this.nextEmitTimes[idx] += emitInterval;
      }
    });

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      if (!particle.alive) {
        this.particles.splice(i, 1);
        continue;
      }

      // Decrease life
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
      this.applyPhysics(particle, deltaTime);

      // Update position
      particle.position[0] += particle.velocity[0] * deltaTime;
      particle.position[1] += particle.velocity[1] * deltaTime;
      particle.position[2] += particle.velocity[2] * deltaTime;
    }
  }

  private applyPhysics(particle: Particle, deltaTime: number): void {
    const { gravity, drag, curlNoise, curlNoiseAmplitude, vorticity, vorticityStrength } =
      this.spec.physics;

    // Gravity
    particle.velocity[0] += gravity[0] * deltaTime;
    particle.velocity[1] += gravity[1] * deltaTime;
    particle.velocity[2] += gravity[2] * deltaTime;

    // Drag
    const damping = Math.exp(-drag * deltaTime);
    particle.velocity[0] *= damping;
    particle.velocity[1] *= damping;
    particle.velocity[2] *= damping;

    // Curl noise (simplified)
    if (curlNoise && curlNoiseAmplitude) {
      const noise = this.simpleCurl(particle.position);
      particle.velocity[0] += noise[0] * curlNoiseAmplitude * deltaTime;
      particle.velocity[1] += noise[1] * curlNoiseAmplitude * deltaTime;
      particle.velocity[2] += noise[2] * curlNoiseAmplitude * deltaTime;
    }

    // Vorticity (simplified circular motion)
    if (vorticity && vorticityStrength) {
      const center = [0, particle.position[1], 0];
      const dx = particle.position[0] - center[0];
      const dz = particle.position[2] - center[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.001) {
        const tangentX = -dz / dist;
        const tangentZ = dx / dist;
        const force = (vorticityStrength * deltaTime) / (1 + dist);

        particle.velocity[0] += tangentX * force;
        particle.velocity[2] += tangentZ * force;
      }
    }
  }

  private simpleCurl(pos: [number, number, number]): [number, number, number] {
    // Very simplified curl noise approximation
    const x = Math.sin(pos[0] * 0.5 + pos[2] * 0.3) * Math.cos(pos[1] * 0.4);
    const y = Math.sin(pos[1] * 0.5 + pos[0] * 0.3) * Math.cos(pos[2] * 0.4);
    const z = Math.sin(pos[2] * 0.5 + pos[1] * 0.3) * Math.cos(pos[0] * 0.4);
    return [x, y, z];
  }

  private emitParticle(emitter: EmitterConfig): void {
    const particle = this.pool.acquire();
    if (!particle) return;

    // Set position based on emitter type
    const offset = emitter.position || [0, 0, 0];
    let position: [number, number, number] = [offset[0], offset[1], offset[2]];

    switch (emitter.type) {
      case 'point':
        position = [offset[0], offset[1], offset[2]];
        break;
      case 'sphere': {
        const radius = emitter.params?.radius || 1;
        const dir = this.rng.nextVec3OnSphere();
        position = [
          offset[0] + dir[0] * radius,
          offset[1] + dir[1] * radius,
          offset[2] + dir[2] * radius,
        ];
        break;
      }
      case 'box': {
        const size = emitter.params?.size || [1, 1, 1];
        const pos = this.rng.nextVec3InBox();
        position = [
          offset[0] + pos[0] * size[0] * 0.5,
          offset[1] + pos[1] * size[1] * 0.5,
          offset[2] + pos[2] * size[2] * 0.5,
        ];
        break;
      }
      case 'cone': {
        const angle = ((emitter.params?.angle || 30) * Math.PI) / 180;
        const dir = this.rng.nextVec3InCone(angle);
        position = [offset[0] + dir[0], offset[1] + dir[1], offset[2] + dir[2]];
        break;
      }
    }

    // Set velocity
    const velRange = emitter.velocityRange;
    const velocity: [number, number, number] = [
      this.rng.nextFloat(velRange.min[0], velRange.max[0]),
      this.rng.nextFloat(velRange.min[1], velRange.max[1]),
      this.rng.nextFloat(velRange.min[2], velRange.max[2]),
    ];

    // Set lifetime
    const lifetime = this.rng.nextFloat(emitter.lifetime[0], emitter.lifetime[1]);

    initParticle(particle, position, velocity, lifetime);

    // Set custom data
    particle.customData = [this.rng.next(), this.rng.next(), this.rng.next(), this.rng.next()];

    this.particles.push(particle);
  }

  /**
   * Get all active particles
   */
  getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * Get elapsed simulation time
   */
  getElapsedTime(): number {
    return this.elapsedTime;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles.forEach((p) => this.pool.release(p));
    this.particles = [];
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.clear();
    this.pool.dispose();
  }
}
