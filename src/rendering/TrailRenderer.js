/**
 * TrailRenderer - Creates motion trails behind moving objects
 * Essential for projectiles, slashes, and motion blur effects
 */

import * as THREE from 'three';

export class TrailRenderer {
  constructor(definition) {
    this.definition = definition;
    this.maxPoints = definition.maxPoints || 50;
    this.width = definition.width || 0.5;
    this.lifetime = definition.lifetime || 1.0;
    
    this.points = [];
    this.positions = new Float32Array(this.maxPoints * 3 * 2); // 2 vertices per point
    this.colors = new Float32Array(this.maxPoints * 3 * 2);
    this.alphas = new Float32Array(this.maxPoints * 2);
    
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));
    
    this.material = this.createMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    
    this.targetObject = null;
  }
  
  /**
   * Create trail material
   */
  createMaterial() {
    const def = this.definition;
    
    let blending = THREE.NormalBlending;
    if (def.blending === 'additive') {
      blending = THREE.AdditiveBlending;
    } else if (def.blending === 'multiply') {
      blending = THREE.MultiplyBlending;
    }
    
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        map: { value: def.texture || null }
      },
      vertexShader: `
        attribute float alpha;
        attribute vec3 color;
        
        varying float vAlpha;
        varying vec3 vColor;
        varying vec2 vUv;
        
        void main() {
          vAlpha = alpha;
          vColor = color;
          vUv = uv;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        
        varying float vAlpha;
        varying vec3 vColor;
        varying vec2 vUv;
        
        void main() {
          vec4 texColor = vec4(1.0);
          
          // Sample texture if available
          if (vUv.x >= 0.0) {
            texColor = texture2D(map, vUv);
          }
          
          // Apply vertex color and alpha
          vec3 finalColor = texColor.rgb * vColor;
          float finalAlpha = texColor.a * vAlpha;
          
          // Fade edges
          float edgeFade = 1.0 - abs(vUv.y - 0.5) * 2.0;
          finalAlpha *= edgeFade;
          
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      blending: blending,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }
  
  /**
   * Attach trail to a moving object
   */
  attachTo(object) {
    this.targetObject = object;
  }
  
  /**
   * Update trail
   */
  update(deltaTime) {
    if (!this.targetObject) return;
    
    // Add new point at current position
    const worldPos = new THREE.Vector3();
    this.targetObject.getWorldPosition(worldPos);
    
    this.points.push({
      position: worldPos.clone(),
      age: 0,
      color: this.definition.color || new THREE.Color(1, 1, 1)
    });
    
    // Update existing points
    for (let i = this.points.length - 1; i >= 0; i--) {
      this.points[i].age += deltaTime;
      
      // Remove old points
      if (this.points[i].age >= this.lifetime) {
        this.points.splice(i, 1);
      }
    }
    
    // Limit number of points
    if (this.points.length > this.maxPoints) {
      this.points.splice(0, this.points.length - this.maxPoints);
    }
    
    // Update geometry
    this.updateGeometry();
    
    // Update material time
    this.material.uniforms.time.value += deltaTime;
  }
  
  /**
   * Update geometry buffers
   */
  updateGeometry() {
    const count = this.points.length;
    
    for (let i = 0; i < count - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      
      // Calculate perpendicular direction for ribbon width
      const dir = new THREE.Vector3().subVectors(p2.position, p1.position).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(dir, up).normalize();
      
      // Calculate width based on age (tapering)
      const t1 = p1.age / this.lifetime;
      const t2 = p2.age / this.lifetime;
      const w1 = this.width * (1.0 - t1);
      const w2 = this.width * (1.0 - t2);
      
      // Set vertex positions (ribbon)
      const idx = i * 6; // 2 triangles = 6 vertices
      
      // Triangle 1
      const left1 = p1.position.clone().addScaledVector(right, -w1);
      const right1 = p1.position.clone().addScaledVector(right, w1);
      const left2 = p2.position.clone().addScaledVector(right, -w2);
      
      this.positions[idx * 3 + 0] = left1.x;
      this.positions[idx * 3 + 1] = left1.y;
      this.positions[idx * 3 + 2] = left1.z;
      
      this.positions[idx * 3 + 3] = right1.x;
      this.positions[idx * 3 + 4] = right1.y;
      this.positions[idx * 3 + 5] = right1.z;
      
      this.positions[idx * 3 + 6] = left2.x;
      this.positions[idx * 3 + 7] = left2.y;
      this.positions[idx * 3 + 8] = left2.z;
      
      // Triangle 2
      const right2 = p2.position.clone().addScaledVector(right, w2);
      
      this.positions[idx * 3 + 9] = right1.x;
      this.positions[idx * 3 + 10] = right1.y;
      this.positions[idx * 3 + 11] = right1.z;
      
      this.positions[idx * 3 + 12] = right2.x;
      this.positions[idx * 3 + 13] = right2.y;
      this.positions[idx * 3 + 14] = right2.z;
      
      this.positions[idx * 3 + 15] = left2.x;
      this.positions[idx * 3 + 16] = left2.y;
      this.positions[idx * 3 + 17] = left2.z;
      
      // Set colors and alphas
      const alpha1 = 1.0 - t1;
      const alpha2 = 1.0 - t2;
      
      for (let j = 0; j < 6; j++) {
        const alpha = j < 3 ? alpha1 : alpha2;
        const color = j < 3 ? p1.color : p2.color;
        
        this.alphas[idx + j] = alpha;
        this.colors[(idx + j) * 3 + 0] = color.r;
        this.colors[(idx + j) * 3 + 1] = color.g;
        this.colors[(idx + j) * 3 + 2] = color.b;
      }
    }
    
    // Update attributes
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;
    
    // Update draw range
    this.geometry.setDrawRange(0, Math.max(0, (count - 1) * 6));
  }
  
  /**
   * Get the Three.js mesh
   */
  getMesh() {
    return this.mesh;
  }
  
  /**
   * Clear all points
   */
  clear() {
    this.points = [];
    this.geometry.setDrawRange(0, 0);
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
