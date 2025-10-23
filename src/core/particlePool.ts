/**
 * Object pool for particles to avoid excessive garbage collection
 */

import type { Particle, Vec3 } from '../types.js';

export class ParticlePool {
  private pool: Particle[] = [];
  private active: Set<Particle> = new Set();
  private capacity: number;

  constructor(capacity: number = 10000) {
    this.capacity = capacity;
    // Pre-allocate particles
    for (let i = 0; i < capacity; i++) {
      this.pool.push(this.createParticle());
    }
  }

  /**
   * Create a new particle object
   */
  private createParticle(): Particle {
    return {
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      life: 0,
      alive: false,
      __lifetime: 1,
      customData: [0, 0, 0, 0],
    };
  }

  /**
   * Acquire a particle from the pool
   */
  acquire(): Particle | null {
    let particle: Particle;

    if (this.pool.length > 0) {
      particle = this.pool.pop()!;
    } else if (this.active.size < this.capacity) {
      // Pool exhausted but under capacity - create new
      particle = this.createParticle();
    } else {
      // At capacity, cannot allocate more
      return null;
    }

    // Reset particle state
    particle.position = [0, 0, 0];
    particle.velocity = [0, 0, 0];
    particle.life = 1;
    particle.alive = true;
    particle.__lifetime = 1;
    particle.customData = [0, 0, 0, 0];

    this.active.add(particle);
    return particle;
  }

  /**
   * Release a particle back to the pool
   */
  release(particle: Particle): void {
    if (!this.active.has(particle)) {
      return; // Not from this pool
    }

    this.active.delete(particle);
    particle.alive = false;

    // Zero out references to help GC
    particle.position = [0, 0, 0];
    particle.velocity = [0, 0, 0];
    particle.customData = [0, 0, 0, 0];

    this.pool.push(particle);
  }

  /**
   * Release all active particles
   */
  releaseAll(): void {
    for (const particle of this.active) {
      particle.alive = false;
      particle.position = [0, 0, 0];
      particle.velocity = [0, 0, 0];
      particle.customData = [0, 0, 0, 0];
      this.pool.push(particle);
    }
    this.active.clear();
  }

  /**
   * Get number of active particles
   */
  get activeCount(): number {
    return this.active.size;
  }

  /**
   * Get number of available particles in pool
   */
  get availableCount(): number {
    return this.pool.length;
  }

  /**
   * Get total capacity
   */
  get totalCapacity(): number {
    return this.capacity;
  }

  /**
   * Get all active particles
   */
  getActiveParticles(): Particle[] {
    return Array.from(this.active);
  }

  /**
   * Clear all particles and reset pool
   */
  clear(): void {
    this.releaseAll();
  }

  /**
   * Dispose of the pool
   */
  dispose(): void {
    this.active.clear();
    this.pool = [];
  }
}

/**
 * Initialize a particle with position and velocity
 */
export function initParticle(
  particle: Particle,
  position: Vec3,
  velocity: Vec3,
  lifetime: number
): void {
  particle.position[0] = position[0];
  particle.position[1] = position[1];
  particle.position[2] = position[2];

  particle.velocity[0] = velocity[0];
  particle.velocity[1] = velocity[1];
  particle.velocity[2] = velocity[2];

  particle.life = 1.0;
  particle.alive = true;
  particle.__lifetime = lifetime;
}
