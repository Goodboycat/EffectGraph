/**
 * EffectComposer - AI-friendly high-level effect composition
 * Translates natural language concepts into complex effect definitions
 */

import * as THREE from 'three';
import { MaterialPresets } from '../rendering/MaterialPresets.js';

export class EffectComposer {
  
  /**
   * Compose a projectile effect (ball, arrow, bullet, etc.)
   */
  static composeProjectile(params) {
    const {
      // Core properties
      name = 'Projectile',
      type = 'energy', // energy, fire, ice, dark, light, physical
      color = [0.3, 0.5, 1.0],
      size = 0.3,
      speed = 20,
      lifetime = 5.0,
      
      // Visual properties
      trail = true,
      trailLength = 1.0,
      glow = true,
      glowIntensity = 2.0,
      
      // Impact behavior
      onImpact = 'explode',
      explosionRadius = 3.0,
      explosionDuration = 1.0
    } = params;
    
    const effect = {
      name,
      type: 'composite',
      
      // Movement
      movement: {
        type: 'linear',
        velocity: [0, 0, speed],
        lifetime,
        onComplete: onImpact
      },
      
      // Layers
      layers: []
    };
    
    // 1. Core projectile body
    effect.layers.push({
      name: 'Core',
      enabled: true,
      effect: {
        name: `${name}_Core`,
        type: 'particle',
        emitter: {
          shape: 'point',
          rate: { type: 'constant', value: 30 }
        },
        particles: {
          maxCount: 100,
          lifetime: { type: 'constant', value: 0.3 },
          initialVelocity: {
            type: 'uniform',
            min: [-0.5, -0.5, -0.5],
            max: [0.5, 0.5, 0.5]
          },
          initialScale: { type: 'constant', value: size }
        },
        forces: [],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [size, size, size], interpolation: 'cubic' },
              { time: 1.0, value: [size * 0.3, size * 0.3, size * 0.3], interpolation: 'cubic' }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: color, interpolation: 'linear' },
              { time: 1.0, value: color.map(c => c * 0.5), interpolation: 'linear' }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 1.0, interpolation: 'cubic' },
              { time: 1.0, value: 0.0, interpolation: 'cubic' }
            ]
          }
        },
        rendering: {
          material: {
            type: 'sprite',
            preset: 'energy',
            blending: 'additive',
            depthWrite: false
          }
        }
      }
    });
    
    // 2. Trail (if enabled)
    if (trail) {
      effect.layers.push({
        name: 'Trail',
        enabled: true,
        effect: {
          name: `${name}_Trail`,
          type: 'particle',
          emitter: {
            shape: 'point',
            rate: { type: 'constant', value: 50 }
          },
          particles: {
            maxCount: 200,
            lifetime: { type: 'constant', value: trailLength },
            initialVelocity: {
              type: 'uniform',
              min: [-0.2, -0.2, -2],
              max: [0.2, 0.2, -1]
            },
            initialScale: { type: 'constant', value: size * 0.6 }
          },
          forces: [
            { type: 'drag', strength: 0.5 }
          ],
          overLifetime: {
            scale: {
              keyframes: [
                { time: 0.0, value: [size * 0.6, size * 0.6, size * 0.6], interpolation: 'cubic' },
                { time: 1.0, value: [size * 1.5, size * 1.5, size * 1.5], interpolation: 'cubic' }
              ]
            },
            color: {
              keyframes: [
                { time: 0.0, value: color, interpolation: 'linear' },
                { time: 1.0, value: color.map(c => c * 0.2), interpolation: 'linear' }
              ]
            },
            opacity: {
              keyframes: [
                { time: 0.0, value: 0.8, interpolation: 'cubic' },
                { time: 1.0, value: 0.0, interpolation: 'cubic' }
              ]
            }
          },
          rendering: {
            material: {
              type: 'sprite',
              preset: 'neon',
              blending: 'additive',
              depthWrite: false
            }
          }
        }
      });
    }
    
    // 3. Impact/explosion effect
    if (onImpact === 'explode') {
      effect.onImpact = this.composeExplosion({
        name: `${name}_Explosion`,
        type,
        color,
        radius: explosionRadius,
        duration: explosionDuration
      });
    }
    
    // 4. Dynamic light
    if (glow) {
      effect.lights = [{
        type: 'point',
        color: new THREE.Color(...color),
        intensity: glowIntensity,
        distance: size * 10,
        decay: 2,
        position: [0, 0, 0],
        flicker: {
          speed: 10,
          amount: 0.3
        }
      }];
    }
    
    return effect;
  }
  
  /**
   * Compose an explosion effect
   */
  static composeExplosion(params) {
    const {
      name = 'Explosion',
      type = 'energy',
      color = [1.0, 0.5, 0.2],
      radius = 3.0,
      duration = 1.0,
      particleCount = 300,
      shockwave = true
    } = params;
    
    const effect = {
      name,
      type: 'composite',
      layers: []
    };
    
    // 1. Initial flash
    effect.layers.push({
      name: 'Flash',
      enabled: true,
      duration: 0.1,
      effect: {
        name: `${name}_Flash`,
        type: 'particle',
        emitter: {
          shape: 'sphere',
          radius: 0.1,
          rate: { type: 'constant', value: 0 },
          burst: [{ time: 0, count: 50 }]
        },
        particles: {
          maxCount: 50,
          lifetime: { type: 'constant', value: 0.1 },
          initialVelocity: {
            type: 'constant',
            value: [0, 0, 0]
          },
          initialScale: { type: 'constant', value: radius * 0.5 }
        },
        forces: [],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [radius * 0.5, radius * 0.5, radius * 0.5], interpolation: 'cubic' },
              { time: 1.0, value: [radius * 2, radius * 2, radius * 2], interpolation: 'cubic' }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: [1.0, 1.0, 1.0], interpolation: 'linear' },
              { time: 1.0, value: color, interpolation: 'linear' }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 1.0, interpolation: 'cubic' },
              { time: 1.0, value: 0.0, interpolation: 'cubic' }
            ]
          }
        },
        rendering: {
          material: {
            type: 'sprite',
            preset: 'energy',
            blending: 'additive'
          }
        }
      }
    });
    
    // 2. Main explosion burst
    effect.layers.push({
      name: 'Burst',
      enabled: true,
      duration,
      effect: {
        name: `${name}_Burst`,
        type: 'particle',
        emitter: {
          shape: 'sphere',
          radius: 0.2,
          rate: { type: 'constant', value: 0 },
          burst: [{ time: 0, count: particleCount }]
        },
        particles: {
          maxCount: particleCount,
          lifetime: { type: 'uniform', min: duration * 0.5, max: duration },
          initialVelocity: {
            type: 'uniform',
            min: [-radius * 2, -radius * 2, -radius * 2],
            max: [radius * 2, radius * 2, radius * 2]
          },
          initialScale: { type: 'uniform', min: 0.1, max: 0.3 }
        },
        forces: [
          { type: 'gravity', strength: 5 },
          { type: 'drag', strength: 0.8 }
        ],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [0.2, 0.2, 0.2], interpolation: 'cubic' },
              { time: 0.3, value: [0.8, 0.8, 0.8], interpolation: 'cubic' },
              { time: 1.0, value: [0.3, 0.3, 0.3], interpolation: 'cubic' }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: [1.0, 1.0, 0.8], interpolation: 'linear' },
              { time: 0.2, value: color, interpolation: 'linear' },
              { time: 1.0, value: color.map(c => c * 0.2), interpolation: 'linear' }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 1.0, interpolation: 'cubic' },
              { time: 0.7, value: 0.6, interpolation: 'cubic' },
              { time: 1.0, value: 0.0, interpolation: 'cubic' }
            ]
          }
        },
        rendering: {
          material: {
            type: 'sprite',
            preset: type === 'fire' ? 'fire' : 'energy',
            blending: 'additive'
          }
        }
      }
    });
    
    // 3. Smoke (delayed start)
    effect.layers.push({
      name: 'Smoke',
      enabled: true,
      startDelay: 0.2,
      duration: duration * 2,
      effect: {
        name: `${name}_Smoke`,
        type: 'particle',
        emitter: {
          shape: 'sphere',
          radius: radius * 0.5,
          rate: { type: 'constant', value: 50 }
        },
        particles: {
          maxCount: 100,
          lifetime: { type: 'uniform', min: duration, max: duration * 1.5 },
          initialVelocity: {
            type: 'uniform',
            min: [-1, -1, -1],
            max: [1, 2, 1]
          },
          initialScale: { type: 'constant', value: 0.5 }
        },
        forces: [
          { type: 'buoyancy', strength: 1.0 },
          { type: 'turbulence', strength: 0.5, parameters: { frequency: 1.0, octaves: 3 } },
          { type: 'drag', strength: 0.3 }
        ],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [0.5, 0.5, 0.5], interpolation: 'cubic' },
              { time: 1.0, value: [2.0, 2.0, 2.0], interpolation: 'cubic' }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: [0.2, 0.2, 0.2], interpolation: 'linear' },
              { time: 1.0, value: [0.1, 0.1, 0.1], interpolation: 'linear' }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 0.0, interpolation: 'cubic' },
              { time: 0.3, value: 0.6, interpolation: 'cubic' },
              { time: 1.0, value: 0.0, interpolation: 'cubic' }
            ]
          }
        },
        rendering: {
          material: {
            type: 'sprite',
            preset: 'smoke',
            blending: 'normal'
          }
        }
      }
    });
    
    // 4. Shockwave
    if (shockwave) {
      effect.shockwave = {
        type: 'ring',
        startRadius: 0.1,
        endRadius: radius * 2,
        lifetime: duration * 0.5,
        color: new THREE.Color(...color),
        intensity: 2.0,
        thickness: 0.1
      };
    }
    
    return effect;
  }
  
  /**
   * Compose an energy ball effect (core + trail + glow + impact)
   */
  static composeEnergyBall(params) {
    const {
      color = [0.3, 0.6, 1.0], // Blue
      secondaryColor = [0.1, 0.1, 0.4], // Dark blue
      speed = 15,
      size = 0.5,
      hasFireCore = true,
      trailType = 'neon' // 'neon', 'smoke', 'fire'
    } = params;
    
    const effect = this.composeProjectile({
      name: 'EnergyBall',
      type: 'energy',
      color,
      size,
      speed,
      lifetime: 10.0,
      trail: true,
      trailLength: 1.5,
      glow: true,
      glowIntensity: 3.0,
      onImpact: 'explode',
      explosionRadius: 4.0,
      explosionDuration: 1.2
    });
    
    // Add blue fire core layer
    if (hasFireCore) {
      effect.layers.push({
        name: 'FireCore',
        enabled: true,
        effect: {
          name: 'EnergyBall_FireCore',
          type: 'particle',
          emitter: {
            shape: 'sphere',
            radius: size * 0.3,
            rate: { type: 'constant', value: 40 }
          },
          particles: {
            maxCount: 150,
            lifetime: { type: 'uniform', min: 0.3, max: 0.6 },
            initialVelocity: {
              type: 'uniform',
              min: [-0.3, -0.3, -0.3],
              max: [0.3, 0.3, 0.3]
            },
            initialScale: { type: 'constant', value: size * 0.4 }
          },
          forces: [
            { type: 'drag', strength: 0.2 }
          ],
          overLifetime: {
            scale: {
              keyframes: [
                { time: 0.0, value: [size * 0.2, size * 0.2, size * 0.2], interpolation: 'cubic' },
                { time: 0.5, value: [size * 0.6, size * 0.6, size * 0.6], interpolation: 'cubic' },
                { time: 1.0, value: [size * 0.3, size * 0.3, size * 0.3], interpolation: 'cubic' }
              ]
            },
            color: {
              keyframes: [
                { time: 0.0, value: color, interpolation: 'linear' },
                { time: 0.5, value: color.map(c => c * 1.2), interpolation: 'linear' },
                { time: 1.0, value: secondaryColor, interpolation: 'linear' }
              ]
            },
            opacity: {
              keyframes: [
                { time: 0.0, value: 1.0, interpolation: 'cubic' },
                { time: 1.0, value: 0.0, interpolation: 'cubic' }
              ]
            }
          },
          rendering: {
            material: {
              type: 'sprite',
              preset: 'fire',
              blending: 'additive'
            }
          }
        }
      });
    }
    
    // Add dark smoke shadow trail
    effect.layers.push({
      name: 'ShadowTrail',
      enabled: true,
      effect: {
        name: 'EnergyBall_ShadowTrail',
        type: 'particle',
        emitter: {
          shape: 'sphere',
          radius: size * 0.4,
          rate: { type: 'constant', value: 20 }
        },
        particles: {
          maxCount: 100,
          lifetime: { type: 'uniform', min: 1.0, max: 1.5 },
          initialVelocity: {
            type: 'uniform',
            min: [-0.5, -0.5, -3],
            max: [0.5, 0.5, -2]
          },
          initialScale: { type: 'constant', value: size * 0.8 }
        },
        forces: [
          { type: 'turbulence', strength: 0.3, parameters: { frequency: 1.0, octaves: 2 } },
          { type: 'drag', strength: 0.4 }
        ],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [size * 0.8, size * 0.8, size * 0.8], interpolation: 'cubic' },
              { time: 1.0, value: [size * 2.0, size * 2.0, size * 2.0], interpolation: 'cubic' }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: secondaryColor, interpolation: 'linear' },
              { time: 1.0, value: [0.05, 0.05, 0.1], interpolation: 'linear' }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 0.6, interpolation: 'cubic' },
              { time: 0.7, value: 0.3, interpolation: 'cubic' },
              { time: 1.0, value: 0.0, interpolation: 'cubic' }
            ]
          }
        },
        rendering: {
          material: {
            type: 'sprite',
            preset: 'darkSmoke',
            blending: 'normal'
          }
        }
      }
    });
    
    return effect;
  }
}
