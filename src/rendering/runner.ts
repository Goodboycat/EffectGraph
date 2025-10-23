/**
 * CPU-based canvas renderer (fallback when WebGL not available)
 */

import type { EffectSpec, EffectHandle, EffectStats } from '../types.js';
import { EffectSimulator } from '../core/effect.js';
import { PerformanceMonitor } from '../util/perf.js';
import { lerp, clamp01 } from '../util/clamp.js';

export class CPUCanvasRunner implements EffectHandle {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private simulator: EffectSimulator;
  private spec: EffectSpec;
  private perfMonitor: PerformanceMonitor;

  private running: boolean = true;
  private paused: boolean = false;
  private animationId: number | null = null;
  private lastTime: number = 0;

  // Camera
  private cameraPos: [number, number, number] = [0, 5, 10];
  private cameraLookAt: [number, number, number] = [0, 0, 0];

  constructor(
    spec: EffectSpec,
    canvas: HTMLCanvasElement,
    seed: number = Date.now(),
    cameraConfig?: {
      position?: [number, number, number];
      lookAt?: [number, number, number];
    }
  ) {
    this.spec = spec;
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    if (cameraConfig?.position) this.cameraPos = cameraConfig.position;
    if (cameraConfig?.lookAt) this.cameraLookAt = cameraConfig.lookAt;

    this.simulator = new EffectSimulator(spec, seed);
    this.perfMonitor = new PerformanceMonitor();

    this.lastTime = performance.now();
    this.animate();
  }

  private animate = (): void => {
    if (!this.running) return;

    this.animationId = requestAnimationFrame(this.animate);

    if (this.paused) return;

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.033);
    this.lastTime = now;

    this.perfMonitor.beginFrame();
    this.simulator.update(deltaTime);
    this.perfMonitor.markUpdate();
    this.render();
    this.perfMonitor.endFrame();
  };

  private render(): void {
    const { width, height } = this.canvas;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Get particles
    const particles = this.simulator.getParticles();

    // Sort particles by depth (painter's algorithm)
    const sortedParticles = particles.slice().sort((a, b) => {
      const depthA = this.getDepth(a.position);
      const depthB = this.getDepth(b.position);
      return depthB - depthA; // Far to near
    });

    // Render each particle
    sortedParticles.forEach((particle) => {
      const screenPos = this.projectToScreen(particle.position);
      if (!screenPos) return;

      const age = 1 - particle.life;
      const color = this.getParticleColor(age);
      const size = this.getParticleSize(age, screenPos[2]);

      this.drawParticle(screenPos[0], screenPos[1], size, color, particle.life);
    });
  }

  private projectToScreen(
    worldPos: [number, number, number]
  ): [number, number, number] | null {
    // Simple perspective projection
    const camDist = Math.sqrt(
      this.cameraPos[0] ** 2 + this.cameraPos[1] ** 2 + this.cameraPos[2] ** 2
    );

    // Transform to camera space
    const relX = worldPos[0] - this.cameraLookAt[0];
    const relY = worldPos[1] - this.cameraLookAt[1];
    const relZ = worldPos[2] - this.cameraLookAt[2];

    // Simple projection
    const depth = this.cameraPos[2] - relZ;
    if (depth <= 0.1) return null;

    const scale = 300 / depth; // FOV approximation

    const screenX = this.canvas.width / 2 + relX * scale;
    const screenY = this.canvas.height / 2 - relY * scale;

    return [screenX, screenY, depth];
  }

  private getDepth(worldPos: [number, number, number]): number {
    const dx = worldPos[0] - this.cameraPos[0];
    const dy = worldPos[1] - this.cameraPos[1];
    const dz = worldPos[2] - this.cameraPos[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  private getParticleColor(age: number): string {
    const template = this.spec.renderer.shaderTemplate || 'smoke';

    let r = 1,
      g = 1,
      b = 1,
      a = 0.8;

    switch (template) {
      case 'explosion':
        if (age < 0.33) {
          // White to yellow
          const t = age * 3;
          r = 1;
          g = lerp(1, 0.9, t);
          b = lerp(0.9, 0.3, t);
          a = 1;
        } else if (age < 0.66) {
          // Yellow to orange
          const t = (age - 0.33) * 3;
          r = 1;
          g = lerp(0.9, 0.4, t);
          b = lerp(0.3, 0, t);
          a = lerp(1, 0.9, t);
        } else {
          // Orange to red
          const t = (age - 0.66) * 3;
          r = lerp(1, 0.8, t);
          g = lerp(0.4, 0.1, t);
          b = 0;
          a = lerp(0.9, 0.5, t);
        }
        break;

      case 'magic_swirl':
        // Cyan to magenta to purple
        if (age < 0.5) {
          const t = age * 2;
          r = lerp(0, 1, t);
          g = lerp(1, 0, t);
          b = 1;
          a = 1;
        } else {
          const t = (age - 0.5) * 2;
          r = lerp(1, 0.5, t);
          g = 0;
          b = 1;
          a = lerp(0.8, 0.5, t);
        }
        break;

      case 'smoke':
      default:
        // White to gray to transparent
        if (age < 0.5) {
          const t = age * 2;
          r = lerp(0.9, 0.5, t);
          g = lerp(0.9, 0.5, t);
          b = lerp(0.9, 0.5, t);
          a = lerp(0.8, 0.4, t);
        } else {
          const t = (age - 0.5) * 2;
          r = lerp(0.5, 0.3, t);
          g = lerp(0.5, 0.3, t);
          b = lerp(0.5, 0.3, t);
          a = lerp(0.4, 0, t);
        }
        break;
    }

    r = clamp01(r);
    g = clamp01(g);
    b = clamp01(b);
    a = clamp01(a);

    return `rgba(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)}, ${a})`;
  }

  private getParticleSize(age: number, depth: number): number {
    const baseSize = this.spec.renderer.particleSize;
    const template = this.spec.renderer.shaderTemplate || 'smoke';

    let sizeMultiplier = 1;

    switch (template) {
      case 'explosion':
        sizeMultiplier = 1.5 * (1 - age * 0.7);
        break;
      case 'smoke':
        sizeMultiplier = 1 + age * 2;
        break;
      case 'magic_swirl':
        sizeMultiplier = 1 + age * 0.5;
        break;
    }

    return baseSize * sizeMultiplier;
  }

  private drawParticle(x: number, y: number, size: number, color: string, life: number): void {
    const radius = size / 2;

    // Create radial gradient for soft particle
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color.replace(/[\d.]+\)$/, `${life * 0.5})`)); // Fade edge
    gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
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
    this.simulator.dispose();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getStats(): EffectStats {
    const perfStats = this.perfMonitor.getStats();
    return {
      activeParticles: this.simulator.getParticles().length,
      lastFrameMs: perfStats.frameTime,
      renderedFrames: this.perfMonitor['frameCount'],
      renderMode: 'cpu',
    };
  }
}
