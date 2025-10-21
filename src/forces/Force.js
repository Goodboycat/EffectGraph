/**
 * Base Force class and force implementations
 */

import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

/**
 * Abstract base class for forces
 */
export class Force {
  constructor(strength = 1.0) {
    this.strength = strength;
    this.enabled = true;
  }
  
  /**
   * Calculate force on a particle
   * @param {Particle} particle - The particle to apply force to
   * @returns {THREE.Vector3} - The force vector
   */
  calculate(particle) {
    throw new Error('Force.calculate() must be implemented by subclass');
  }
}

/**
 * Gravity force - constant downward acceleration
 */
export class GravityForce extends Force {
  constructor(strength = 9.8) {
    super(strength);
    this.direction = new THREE.Vector3(0, -1, 0);
  }
  
  calculate(particle) {
    return this.direction.clone().multiplyScalar(this.strength * particle.mass);
  }
}

/**
 * Drag force - opposes motion (quadratic drag)
 */
export class DragForce extends Force {
  constructor(coefficient = 0.1) {
    super(coefficient);
  }
  
  calculate(particle) {
    const speed = particle.velocity.length();
    if (speed < 0.001) return new THREE.Vector3(0, 0, 0);
    
    // F_drag = -k * v * |v|
    return particle.velocity.clone()
      .normalize()
      .multiplyScalar(-this.strength * speed * speed);
  }
}

/**
 * Turbulence force - noise-based chaotic motion
 */
export class TurbulenceForce extends Force {
  constructor(strength = 1.0, frequency = 1.0, octaves = 3) {
    super(strength);
    this.frequency = frequency;
    this.octaves = octaves;
    this.time = 0;
    this.noise = createNoise3D();
  }
  
  update(deltaTime) {
    this.time += deltaTime;
  }
  
  calculate(particle) {
    const pos = particle.position;
    const noiseVec = new THREE.Vector3(
      this.generateNoise(pos.x, pos.y, pos.z, 0),
      this.generateNoise(pos.x, pos.y, pos.z, 100),
      this.generateNoise(pos.x, pos.y, pos.z, 200)
    );
    
    return noiseVec.multiplyScalar(this.strength);
  }
  
  generateNoise(x, y, z, offset) {
    let result = 0;
    let amplitude = 1.0;
    let frequency = this.frequency;
    
    for (let i = 0; i < this.octaves; i++) {
      const sampleX = x * frequency + offset;
      const sampleY = y * frequency;
      const sampleZ = z * frequency + this.time * 0.5;
      
      result += this.noise(sampleX, sampleY, sampleZ) * amplitude;
      
      amplitude *= 0.5;  // Persistence
      frequency *= 2.0;   // Lacunarity
    }
    
    return result;
  }
}

/**
 * Vortex force - spiral motion around an axis
 */
export class VortexForce extends Force {
  constructor(center, axis, strength = 5.0, radius = 10.0) {
    super(strength);
    this.center = center || new THREE.Vector3(0, 0, 0);
    this.axis = (axis || new THREE.Vector3(0, 1, 0)).normalize();
    this.radius = radius;
  }
  
  calculate(particle) {
    // Vector from vortex center to particle
    const toParticle = particle.position.clone().sub(this.center);
    
    // Project onto vortex plane (perpendicular to axis)
    const axisProjection = this.axis.clone()
      .multiplyScalar(toParticle.dot(this.axis));
    const radial = toParticle.clone().sub(axisProjection);
    
    const distance = radial.length();
    if (distance < 0.001) return new THREE.Vector3(0, 0, 0);
    
    // Tangential direction (perpendicular to radial)
    const tangent = this.axis.clone().cross(radial).normalize();
    
    // Falloff with distance (exponential)
    const falloff = Math.exp(-distance / this.radius);
    
    // Inward spiral component
    const inward = radial.clone().normalize().multiplyScalar(-0.3 * this.strength);
    
    // Combine tangential and inward
    const force = tangent.multiplyScalar(this.strength * falloff).add(inward);
    
    return force;
  }
}

/**
 * Attractor force - pulls particles toward a point
 */
export class AttractorForce extends Force {
  constructor(position, strength = 1.0, radius = 10.0) {
    super(strength);
    this.position = position || new THREE.Vector3(0, 0, 0);
    this.radius = radius;
  }
  
  calculate(particle) {
    const toAttractor = this.position.clone().sub(particle.position);
    const distance = toAttractor.length();
    
    if (distance < 0.1) return new THREE.Vector3(0, 0, 0);
    
    // Inverse square law with minimum distance
    const forceMagnitude = this.strength / Math.max(distance * distance, 1.0);
    
    // Falloff at radius boundary
    const falloff = distance < this.radius ? 1.0 : Math.exp(-(distance - this.radius));
    
    return toAttractor.normalize().multiplyScalar(forceMagnitude * falloff);
  }
}

/**
 * Wind force - constant directional force with gusts
 */
export class WindForce extends Force {
  constructor(direction, strength = 1.0, gustStrength = 0.3) {
    super(strength);
    this.direction = (direction || new THREE.Vector3(1, 0, 0)).normalize();
    this.gustStrength = gustStrength;
    this.time = 0;
    this.noise = createNoise3D();
  }
  
  update(deltaTime) {
    this.time += deltaTime;
  }
  
  calculate(particle) {
    // Base wind force
    const baseForce = this.direction.clone().multiplyScalar(this.strength);
    
    // Add gusts using noise
    const gustNoise = this.noise(
      particle.position.x * 0.1,
      particle.position.y * 0.1,
      this.time * 2.0
    );
    
    const gust = this.direction.clone()
      .multiplyScalar(gustNoise * this.gustStrength * this.strength);
    
    return baseForce.add(gust);
  }
}

/**
 * Buoyancy force - upward force (like hot air rising)
 */
export class BuoyancyForce extends Force {
  constructor(strength = 1.0) {
    super(strength);
    this.direction = new THREE.Vector3(0, 1, 0);
  }
  
  calculate(particle) {
    return this.direction.clone().multiplyScalar(this.strength * particle.mass);
  }
}

/**
 * Factory function to create forces from definitions
 */
export function createForce(definition) {
  const params = definition.parameters || {};
  
  switch (definition.type) {
    case 'gravity':
      return new GravityForce(definition.strength || 9.8);
    
    case 'drag':
      return new DragForce(definition.strength || 0.1);
    
    case 'turbulence':
      return new TurbulenceForce(
        definition.strength || 1.0,
        params.frequency || 1.0,
        params.octaves || 3
      );
    
    case 'vortex':
      return new VortexForce(
        params.center,
        params.axis,
        definition.strength || 5.0,
        params.radius || 10.0
      );
    
    case 'attractor':
      return new AttractorForce(
        params.position,
        definition.strength || 1.0,
        params.radius || 10.0
      );
    
    case 'wind':
      return new WindForce(
        params.direction,
        definition.strength || 1.0,
        params.gustStrength || 0.3
      );
    
    case 'buoyancy':
      return new BuoyancyForce(definition.strength || 1.0);
    
    default:
      console.warn(`Unknown force type: ${definition.type}`);
      return new GravityForce(0);
  }
}
