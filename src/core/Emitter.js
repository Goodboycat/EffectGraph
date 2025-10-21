/**
 * Emitter shapes for particle generation
 */

import * as THREE from 'three';

/**
 * Base emitter class
 */
export class Emitter {
  constructor(rate) {
    this.rate = rate || { type: 'constant', value: 10 };
    this.accumulator = 0;
  }
  
  /**
   * Get number of particles to emit this frame
   */
  getEmissionCount(deltaTime) {
    let rate = this.sampleRate();
    this.accumulator += rate * deltaTime;
    
    const count = Math.floor(this.accumulator);
    this.accumulator -= count;
    
    return count;
  }
  
  /**
   * Sample the emission rate
   */
  sampleRate() {
    if (this.rate.type === 'constant') {
      return this.rate.value;
    } else if (this.rate.type === 'uniform') {
      return this.rate.min + Math.random() * (this.rate.max - this.rate.min);
    }
    return 10;
  }
  
  /**
   * Get a random point in the emitter shape
   */
  getPoint() {
    throw new Error('Emitter.getPoint() must be implemented by subclass');
  }
}

/**
 * Point emitter - emits from a single point
 */
export class PointEmitter extends Emitter {
  constructor(rate, position) {
    super(rate);
    this.position = position || new THREE.Vector3(0, 0, 0);
  }
  
  getPoint() {
    return this.position.clone();
  }
}

/**
 * Sphere emitter - emits from surface or volume of sphere
 */
export class SphereEmitter extends Emitter {
  constructor(rate, radius, fromVolume = false) {
    super(rate);
    this.radius = radius || 1.0;
    this.fromVolume = fromVolume;
  }
  
  getPoint() {
    // Random point on unit sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    let r = this.radius;
    if (this.fromVolume) {
      // Random radius for volume emission
      r *= Math.cbrt(Math.random());
    }
    
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }
}

/**
 * Box emitter - emits from volume of box
 */
export class BoxEmitter extends Emitter {
  constructor(rate, size) {
    super(rate);
    this.size = size || new THREE.Vector3(1, 1, 1);
  }
  
  getPoint() {
    return new THREE.Vector3(
      (Math.random() - 0.5) * this.size.x,
      (Math.random() - 0.5) * this.size.y,
      (Math.random() - 0.5) * this.size.z
    );
  }
}

/**
 * Cone emitter - emits from cone volume
 */
export class ConeEmitter extends Emitter {
  constructor(rate, radius, height, angle) {
    super(rate);
    this.radius = radius || 1.0;
    this.height = height || 1.0;
    this.angle = angle || 30; // degrees
  }
  
  getPoint() {
    // Random point in cone
    const theta = Math.random() * Math.PI * 2;
    const h = Math.random() * this.height;
    
    // Radius grows with height based on angle
    const angleRad = (this.angle * Math.PI) / 180;
    const r = Math.random() * (this.radius + h * Math.tan(angleRad));
    
    return new THREE.Vector3(
      r * Math.cos(theta),
      h,
      r * Math.sin(theta)
    );
  }
}

/**
 * Factory function to create emitters from definitions
 */
export function createEmitter(definition) {
  const shape = definition.shape || 'point';
  const rate = definition.rate || { type: 'constant', value: 10 };
  const params = definition.parameters || {};
  
  switch (shape) {
    case 'point':
      return new PointEmitter(rate, params.position);
    
    case 'sphere':
      return new SphereEmitter(
        rate,
        params.radius || definition.radius || 1.0,
        params.fromVolume || false
      );
    
    case 'box':
      const size = params.size || [1, 1, 1];
      return new BoxEmitter(
        rate,
        new THREE.Vector3(size[0], size[1], size[2])
      );
    
    case 'cone':
      return new ConeEmitter(
        rate,
        params.radius || definition.radius || 1.0,
        params.height || definition.height || 1.0,
        params.angle || definition.angle || 30
      );
    
    default:
      console.warn(`Unknown emitter shape: ${shape}`);
      return new PointEmitter(rate);
  }
}
