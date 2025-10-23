/**
 * Tests for ParticlePool
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ParticlePool } from '../../src/core/particlePool.js';

describe('ParticlePool', () => {
  let pool: ParticlePool;

  beforeEach(() => {
    pool = new ParticlePool(100);
  });

  it('should create a pool with specified capacity', () => {
    expect(pool.totalCapacity).toBe(100);
    expect(pool.activeCount).toBe(0);
    expect(pool.availableCount).toBe(100);
  });

  it('should acquire particles from the pool', () => {
    const particle = pool.acquire();
    
    expect(particle).not.toBeNull();
    expect(particle?.alive).toBe(true);
    expect(particle?.life).toBe(1);
    expect(pool.activeCount).toBe(1);
  });

  it('should release particles back to the pool', () => {
    const particle = pool.acquire();
    expect(pool.activeCount).toBe(1);
    
    if (particle) {
      pool.release(particle);
    }
    
    expect(pool.activeCount).toBe(0);
    expect(particle?.alive).toBe(false);
  });

  it('should not exceed capacity', () => {
    const particles = [];
    
    // Acquire all particles
    for (let i = 0; i < 100; i++) {
      const p = pool.acquire();
      if (p) particles.push(p);
    }
    
    expect(pool.activeCount).toBe(100);
    
    // Try to acquire one more (should fail)
    const extra = pool.acquire();
    expect(extra).toBeNull();
  });

  it('should reuse released particles', () => {
    const particle1 = pool.acquire();
    expect(pool.activeCount).toBe(1);
    
    if (particle1) {
      pool.release(particle1);
    }
    
    expect(pool.activeCount).toBe(0);
    
    const particle2 = pool.acquire();
    expect(pool.activeCount).toBe(1);
    
    // Should be the same object (reused)
    expect(particle2).toBe(particle1);
  });

  it('should release all active particles', () => {
    for (let i = 0; i < 10; i++) {
      pool.acquire();
    }
    
    expect(pool.activeCount).toBe(10);
    
    pool.releaseAll();
    
    expect(pool.activeCount).toBe(0);
    expect(pool.availableCount).toBe(100);
  });

  it('should get active particles list', () => {
    const acquired = [];
    for (let i = 0; i < 5; i++) {
      const p = pool.acquire();
      if (p) acquired.push(p);
    }
    
    const active = pool.getActiveParticles();
    expect(active.length).toBe(5);
    
    // Verify all acquired particles are in the active list
    acquired.forEach(p => {
      expect(active).toContain(p);
    });
  });

  it('should clear all particles', () => {
    for (let i = 0; i < 10; i++) {
      pool.acquire();
    }
    
    pool.clear();
    
    expect(pool.activeCount).toBe(0);
  });

  it('should dispose properly', () => {
    for (let i = 0; i < 10; i++) {
      pool.acquire();
    }
    
    pool.dispose();
    
    expect(pool.activeCount).toBe(0);
    expect(pool.availableCount).toBe(0);
  });
});
