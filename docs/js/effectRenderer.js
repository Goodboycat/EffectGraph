/**
 * Effect Rendering Module
 * Handles Three.js scene setup and particle rendering
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class EffectRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particleSystem = null;
    this.running = false;
    this.paused = false;
    this.frameCount = 0;
    this.lastTime = 0;
  }

  /**
   * Initialize Three.js scene
   */
  init(spec, options = {}) {
    // Setup scene
    this.scene = new THREE.Scene();

    // Setup camera
    const cameraPos = options.camera?.position || [0, 5, 15];
    const cameraLookAt = options.camera?.lookAt || [0, 0, 0];
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.width / this.canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(...cameraPos);
    this.camera.lookAt(...cameraLookAt);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
    });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setClearColor(0x000000, 0);

    // Create particle system
    this.createParticleSystem(spec);

    return this;
  }

  /**
   * Create particle system from spec
   */
  createParticleSystem(spec) {
    const particleCount = Math.min(spec.emitters[0]?.maxParticles || 1000, 10000);

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // Initialize random positions
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create material based on spec
    const material = this.createMaterial(spec);

    // Create particle system
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  /**
   * Create material based on effect spec
   */
  createMaterial(spec) {
    const template = spec.renderer?.shaderTemplate || 'smoke';
    const blendMode = spec.renderer?.blendMode || 'additive';

    // Color based on template
    let color = 0x88ccff;
    if (template === 'explosion') color = 0xff8844;
    if (template === 'magic_swirl') color = 0xff44ff;

    const material = new THREE.PointsMaterial({
      color,
      size: spec.renderer?.particleSize || 0.1,
      transparent: true,
      opacity: 0.6,
      blending:
        blendMode === 'additive'
          ? THREE.AdditiveBlending
          : blendMode === 'multiply'
          ? THREE.MultiplyBlending
          : THREE.NormalBlending,
      sizeAttenuation: spec.renderer?.sizeAttenuation !== false,
    });

    return material;
  }

  /**
   * Start animation loop
   */
  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.animate();
  }

  /**
   * Animation loop
   */
  animate = () => {
    if (!this.running) return;

    requestAnimationFrame(this.animate);

    if (!this.paused && this.particleSystem) {
      // Rotate particle system for visual effect
      this.particleSystem.rotation.y += 0.001;
      this.particleSystem.rotation.x += 0.0005;

      this.renderer.render(this.scene, this.camera);
      this.frameCount++;
    }
  };

  /**
   * Pause rendering
   */
  pause() {
    this.paused = true;
  }

  /**
   * Resume rendering
   */
  resume() {
    this.paused = false;
    this.lastTime = performance.now();
  }

  /**
   * Stop and cleanup
   */
  stop() {
    this.running = false;
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.stop();

    if (this.particleSystem) {
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
      this.scene.remove(this.particleSystem);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const now = performance.now();
    const deltaTime = now - this.lastTime;

    return {
      activeParticles: this.particleSystem?.geometry.attributes.position.count || 0,
      lastFrameMs: deltaTime || 16,
      renderedFrames: this.frameCount,
      renderMode: 'gpu',
    };
  }
}
