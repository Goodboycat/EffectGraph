/**
 * Particle class representing a single particle in the system
 */

import * as THREE from 'three';

export class Particle {
  constructor() {
    // Transform properties
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.rotation = new THREE.Euler();
    this.angularVelocity = new THREE.Vector3();
    this.scale = new THREE.Vector3(1, 1, 1);
    
    // Visual properties
    this.color = new THREE.Color(1, 1, 1);
    this.opacity = 1.0;
    
    // Lifecycle properties
    this.age = 0;
    this.lifetime = 1.0;
    this.mass = 1.0;
    
    // State
    this.alive = false;
  }
  
  /**
   * Initialize particle with random values from distributions
   */
  init(definition, emitterShape) {
    this.alive = true;
    this.age = 0;
    
    // Sample lifetime
    this.lifetime = this.sampleValue(definition.particles.lifetime);
    
    // Sample initial position from emitter shape
    this.position.copy(emitterShape.getPoint());
    
    // Sample initial velocity
    const vel = this.sampleValue(definition.particles.initialVelocity);
    if (Array.isArray(vel)) {
      this.velocity.set(vel[0], vel[1], vel[2]);
    } else if (vel instanceof THREE.Vector3) {
      this.velocity.copy(vel);
    }
    
    // Sample initial rotation
    if (definition.particles.initialRotation) {
      const rot = this.sampleValue(definition.particles.initialRotation);
      if (Array.isArray(rot)) {
        this.rotation.set(rot[0], rot[1], rot[2]);
      }
    }
    
    // Sample initial scale
    if (definition.particles.initialScale) {
      const scl = this.sampleValue(definition.particles.initialScale);
      if (Array.isArray(scl)) {
        this.scale.set(scl[0], scl[1], scl[2]);
      } else if (typeof scl === 'number') {
        this.scale.set(scl, scl, scl);
      }
    }
    
    // Initialize visual properties
    this.color.set(1, 1, 1);
    this.opacity = 1.0;
    
    // Reset acceleration
    this.acceleration.set(0, 0, 0);
  }
  
  /**
   * Sample a value from a distribution
   */
  sampleValue(distribution) {
    if (!distribution) return 0;
    
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
        // Box-Muller transform
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
    }
    
    return distribution.value || 0;
  }
  
  /**
   * Get normalized age (0-1)
   */
  getNormalizedAge() {
    return Math.min(this.age / this.lifetime, 1.0);
  }
  
  /**
   * Check if particle is dead
   */
  isDead() {
    return this.age >= this.lifetime || !this.alive;
  }
  
  /**
   * Kill the particle
   */
  kill() {
    this.alive = false;
  }
  
  /**
   * Reset particle to inactive state
   */
  reset() {
    this.alive = false;
    this.age = 0;
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.acceleration.set(0, 0, 0);
  }
}
