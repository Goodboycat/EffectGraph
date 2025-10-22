/**
 * ShockwaveEffect - Expanding ring/sphere shockwave
 * Perfect for explosions, impacts, and energy releases
 */

import * as THREE from 'three';

export class ShockwaveEffect {
  constructor(definition) {
    this.definition = definition;
    this.time = 0;
    this.lifetime = definition.lifetime || 1.0;
    this.active = true;
    
    // Create geometry based on type
    if (definition.type === 'ring') {
      this.createRing();
    } else {
      this.createSphere();
    }
    
    this.material = this.createMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    // Initial scale
    this.startRadius = definition.startRadius || 0.1;
    this.endRadius = definition.endRadius || 10.0;
    this.mesh.scale.setScalar(this.startRadius);
  }
  
  /**
   * Create ring geometry
   */
  createRing() {
    const innerRadius = 0.9;
    const outerRadius = 1.0;
    const segments = 64;
    
    this.geometry = new THREE.RingGeometry(
      innerRadius,
      outerRadius,
      segments
    );
    
    // Rotate to face up
    this.geometry.rotateX(-Math.PI / 2);
  }
  
  /**
   * Create expanding sphere geometry
   */
  createSphere() {
    this.geometry = new THREE.SphereGeometry(1.0, 32, 32);
  }
  
  /**
   * Create shockwave material
   */
  createMaterial() {
    const def = this.definition;
    
    let blending = THREE.AdditiveBlending;
    if (def.blending === 'normal') {
      blending = THREE.NormalBlending;
    }
    
    const color = def.color || new THREE.Color(1, 1, 1);
    
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        color: { value: color },
        thickness: { value: def.thickness || 0.1 },
        intensity: { value: def.intensity || 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float progress;
        uniform vec3 color;
        uniform float thickness;
        uniform float intensity;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Fresnel effect (edge glow)
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
          
          // Distance from center (for ring thickness)
          float dist = length(vPosition.xz);
          float ringMask = 1.0 - smoothstep(0.9, 1.0, dist);
          ringMask *= smoothstep(0.85, 0.9, dist);
          
          // Fade over lifetime
          float alpha = (1.0 - progress) * intensity;
          alpha *= fresnel * 2.0;
          alpha *= ringMask;
          
          // Add pulsing
          float pulse = sin(time * 10.0 + dist * 5.0) * 0.2 + 0.8;
          
          vec3 finalColor = color * pulse;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      blending: blending,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }
  
  /**
   * Update shockwave
   */
  update(deltaTime) {
    if (!this.active) return;
    
    this.time += deltaTime;
    const progress = Math.min(this.time / this.lifetime, 1.0);
    
    // Update scale (expansion)
    const currentRadius = THREE.MathUtils.lerp(
      this.startRadius,
      this.endRadius,
      this.easeOutCubic(progress)
    );
    this.mesh.scale.setScalar(currentRadius);
    
    // Update material uniforms
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.progress.value = progress;
    
    // Deactivate when complete
    if (progress >= 1.0) {
      this.active = false;
    }
  }
  
  /**
   * Easing function for smooth expansion
   */
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  /**
   * Check if shockwave is active
   */
  isActive() {
    return this.active;
  }
  
  /**
   * Get the Three.js mesh
   */
  getMesh() {
    return this.mesh;
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
