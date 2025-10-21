/**
 * Main ParticleSystem class - manages particle lifecycle and rendering
 */

import * as THREE from 'three';
import { Particle } from './Particle.js';
import { createEmitter } from './Emitter.js';
import { createForce } from '../forces/Force.js';
import { createCurve } from '../math/curve.js';

export class ParticleSystem {
  constructor(definition) {
    this.definition = definition;
    this.particles = [];
    this.maxParticles = definition.particles?.maxCount || 1000;
    
    // Create emitter
    this.emitter = definition.emitter ? createEmitter(definition.emitter) : null;
    
    // Create forces
    this.forces = [];
    if (definition.forces) {
      this.forces = definition.forces.map(f => createForce(f));
    }
    
    // Create curves for over-lifetime properties
    this.curves = {};
    if (definition.overLifetime) {
      const ol = definition.overLifetime;
      
      if (ol.scale) {
        this.curves.scale = createCurve(ol.scale.keyframes || ol.scale);
      }
      if (ol.color) {
        this.curves.color = createCurve(ol.color.keyframes || ol.color);
      }
      if (ol.opacity) {
        this.curves.opacity = createCurve(ol.opacity.keyframes || ol.opacity);
      }
      if (ol.velocity) {
        this.curves.velocity = createCurve(ol.velocity.keyframes || ol.velocity);
      }
    }
    
    // Allocate particle pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(new Particle());
    }
    
    // Create Three.js objects
    this.setupRendering();
    
    // Time tracking
    this.time = 0;
  }
  
  /**
   * Setup Three.js rendering objects
   */
  setupRendering() {
    // Create geometry with buffers
    this.geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.maxParticles * 3);
    const colors = new Float32Array(this.maxParticles * 3);
    const sizes = new Float32Array(this.maxParticles);
    const alphas = new Float32Array(this.maxParticles);
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
    // Create material
    this.material = this.createMaterial();
    
    // Create points mesh
    this.mesh = new THREE.Points(this.geometry, this.material);
  }
  
  /**
   * Create material based on definition
   */
  createMaterial() {
    const rendering = this.definition.rendering || {};
    const material = rendering.material || {};
    
    // Determine blend mode
    let blending = THREE.NormalBlending;
    if (material.blending === 'additive') {
      blending = THREE.AdditiveBlending;
    } else if (material.blending === 'multiply') {
      blending = THREE.MultiplyBlending;
    } else if (material.blending === 'subtractive') {
      blending = THREE.SubtractiveBlending;
    }
    
    // Create shader material for custom rendering
    return new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: null },
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        attribute vec3 color;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          vAlpha = alpha;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 uv = gl_PointCoord;
          
          // Circular particle shape
          float dist = length(uv - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soft edge
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= vAlpha;
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      blending: blending,
      depthWrite: material.depthWrite !== false,
      depthTest: material.depthTest !== false,
      transparent: true
    });
  }
  
  /**
   * Update particle system
   */
  update(deltaTime) {
    this.time += deltaTime;
    
    // Update forces that need time
    for (const force of this.forces) {
      if (force.update) {
        force.update(deltaTime);
      }
    }
    
    // Emit new particles
    if (this.emitter) {
      const emitCount = this.emitter.getEmissionCount(deltaTime);
      this.emitParticles(emitCount);
    }
    
    // Update existing particles
    this.updateParticles(deltaTime);
    
    // Update GPU buffers
    this.updateBuffers();
    
    // Update material uniforms
    this.material.uniforms.time.value = this.time;
  }
  
  /**
   * Emit new particles
   */
  emitParticles(count) {
    let emitted = 0;
    
    for (let i = 0; i < this.particles.length && emitted < count; i++) {
      const particle = this.particles[i];
      if (!particle.alive) {
        particle.init(this.definition, this.emitter);
        emitted++;
      }
    }
  }
  
  /**
   * Update all active particles
   */
  updateParticles(deltaTime) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      if (!p.alive) continue;
      
      // Update age
      p.age += deltaTime;
      if (p.age >= p.lifetime) {
        p.kill();
        continue;
      }
      
      // Get normalized age
      const t = p.getNormalizedAge();
      
      // Accumulate forces
      p.acceleration.set(0, 0, 0);
      for (const force of this.forces) {
        const f = force.calculate(p);
        p.acceleration.add(f.multiplyScalar(1.0 / p.mass));
      }
      
      // Integrate motion (semi-implicit Euler for stability)
      p.velocity.addScaledVector(p.acceleration, deltaTime);
      p.position.addScaledVector(p.velocity, deltaTime);
      
      // Apply over-lifetime curves
      if (this.curves.scale) {
        const scale = this.curves.scale.evaluate(t);
        if (typeof scale === 'number') {
          p.scale.set(scale, scale, scale);
        } else if (scale instanceof THREE.Vector3) {
          p.scale.copy(scale);
        } else if (Array.isArray(scale)) {
          p.scale.set(scale[0], scale[1], scale[2]);
        }
      }
      
      if (this.curves.color) {
        const color = this.curves.color.evaluate(t);
        if (color instanceof THREE.Color) {
          p.color.copy(color);
        } else if (Array.isArray(color)) {
          p.color.setRGB(color[0], color[1], color[2]);
        }
      }
      
      if (this.curves.opacity) {
        p.opacity = this.curves.opacity.evaluate(t);
      }
      
      if (this.curves.velocity) {
        const velModifier = this.curves.velocity.evaluate(t);
        if (velModifier instanceof THREE.Vector3) {
          p.velocity.multiply(velModifier);
        }
      }
      
      // Update rotation
      if (p.angularVelocity.lengthSq() > 0) {
        p.rotation.x += p.angularVelocity.x * deltaTime;
        p.rotation.y += p.angularVelocity.y * deltaTime;
        p.rotation.z += p.angularVelocity.z * deltaTime;
      }
    }
  }
  
  /**
   * Update GPU buffers with particle data
   */
  updateBuffers() {
    const positions = this.geometry.attributes.position.array;
    const colors = this.geometry.attributes.color.array;
    const sizes = this.geometry.attributes.size.array;
    const alphas = this.geometry.attributes.alpha.array;
    
    let aliveCount = 0;
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const i3 = i * 3;
      
      if (p.alive) {
        positions[i3] = p.position.x;
        positions[i3 + 1] = p.position.y;
        positions[i3 + 2] = p.position.z;
        
        colors[i3] = p.color.r;
        colors[i3 + 1] = p.color.g;
        colors[i3 + 2] = p.color.b;
        
        sizes[i] = p.scale.x * 10; // Scale factor for visibility
        alphas[i] = p.opacity;
        
        aliveCount++;
      } else {
        // Move dead particles far away
        positions[i3] = 0;
        positions[i3 + 1] = -10000;
        positions[i3 + 2] = 0;
        
        alphas[i] = 0;
      }
    }
    
    // Mark attributes as needing update
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;
    
    // Update draw range for performance
    this.geometry.setDrawRange(0, aliveCount);
  }
  
  /**
   * Get the Three.js object for rendering
   */
  getObject3D() {
    return this.mesh;
  }
  
  /**
   * Get number of alive particles
   */
  getAliveCount() {
    return this.particles.filter(p => p.alive).length;
  }
  
  /**
   * Reset the particle system
   */
  reset() {
    for (const particle of this.particles) {
      particle.reset();
    }
    this.time = 0;
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
