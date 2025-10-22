/**
 * Energy Ball Example - AAA Quality Effect
 * 
 * "I want an energy ball that when shot leaves a trail of blue neon smoke
 * and then explodes as a circle wave"
 * 
 * Components:
 * 1. Energy core (bright glowing ball)
 * 2. Blue fire particles
 * 3. Neon trail effect
 * 4. Dark shadow smoke
 * 5. Dynamic point light
 * 6. Explosion on impact with shockwave
 */

export const energyBallEffect = {
  name: "EnergyBall_Complete",
  type: "composite",
  
  // Projectile movement
  movement: {
    type: "linear",
    velocity: [0, 0, 15], // Forward at 15 units/sec
    acceleration: [0, 0, 0],
    rotationSpeed: [0, 2, 0], // Spin around Y axis
    lifetime: 5.0,
    onComplete: "explode"
  },
  
  // Multiple particle layers
  layers: [
    // Layer 1: Bright Energy Core
    {
      name: "EnergyCore",
      enabled: true,
      offset: [0, 0, 0],
      effect: {
        name: "EnergyCore",
        type: "particle",
        emitter: {
          shape: "point",
          rate: { type: "constant", value: 50 }
        },
        particles: {
          maxCount: 200,
          lifetime: { type: "constant", value: 0.3 },
          initialVelocity: {
            type: "uniform",
            min: [-0.5, -0.5, -0.5],
            max: [0.5, 0.5, 0.5]
          },
          initialScale: { type: "constant", value: 0.4 }
        },
        forces: [
          { type: "drag", strength: 0.1 }
        ],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [0.4, 0.4, 0.4], interpolation: "cubic" },
              { time: 1.0, value: [0.1, 0.1, 0.1], interpolation: "cubic" }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: [0.5, 0.8, 1.0], interpolation: "linear" },
              { time: 1.0, value: [0.2, 0.4, 0.8], interpolation: "linear" }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 1.0, interpolation: "cubic" },
              { time: 1.0, value: 0.0, interpolation: "cubic" }
            ]
          }
        },
        rendering: {
          material: {
            type: "sprite",
            preset: "energy",
            blending: "additive",
            depthWrite: false
          }
        }
      }
    },
    
    // Layer 2: Blue Fire Particles
    {
      name: "BlueFire",
      enabled: true,
      offset: [0, 0, 0],
      effect: {
        name: "BlueFire",
        type: "particle",
        emitter: {
          shape: "sphere",
          radius: 0.3,
          rate: { type: "constant", value: 40 }
        },
        particles: {
          maxCount: 150,
          lifetime: { type: "uniform", min: 0.3, max: 0.6 },
          initialVelocity: {
            type: "uniform",
            min: [-0.3, -0.3, -0.3],
            max: [0.3, 0.3, 0.3]
          },
          initialScale: { type: "constant", value: 0.35 }
        },
        forces: [
          { type: "drag", strength: 0.2 },
          { 
            type: "turbulence", 
            strength: 0.2,
            parameters: { frequency: 2.0, octaves: 2 }
          }
        ],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [0.2, 0.2, 0.2], interpolation: "cubic" },
              { time: 0.5, value: [0.5, 0.5, 0.5], interpolation: "cubic" },
              { time: 1.0, value: [0.2, 0.2, 0.2], interpolation: "cubic" }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: [0.4, 0.7, 1.0], interpolation: "linear" },
              { time: 0.5, value: [0.3, 0.6, 1.0], interpolation: "linear" },
              { time: 1.0, value: [0.1, 0.3, 0.6], interpolation: "linear" }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 0.9, interpolation: "cubic" },
              { time: 1.0, value: 0.0, interpolation: "cubic" }
            ]
          }
        },
        rendering: {
          material: {
            type: "sprite",
            preset: "fire",
            blending: "additive",
            depthWrite: false
          }
        }
      }
    },
    
    // Layer 3: Neon Trail
    {
      name: "NeonTrail",
      enabled: true,
      offset: [0, 0, 0],
      effect: {
        name: "NeonTrail",
        type: "particle",
        emitter: {
          shape: "point",
          rate: { type: "constant", value: 60 }
        },
        particles: {
          maxCount: 250,
          lifetime: { type: "constant", value: 1.2 },
          initialVelocity: {
            type: "uniform",
            min: [-0.3, -0.3, -3],
            max: [0.3, 0.3, -2]
          },
          initialScale: { type: "constant", value: 0.5 }
        },
        forces: [
          { type: "drag", strength: 0.3 }
        ],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [0.5, 0.5, 0.5], interpolation: "cubic" },
              { time: 0.5, value: [0.8, 0.8, 0.8], interpolation: "cubic" },
              { time: 1.0, value: [1.2, 1.2, 1.2], interpolation: "cubic" }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: [0.3, 0.8, 1.0], interpolation: "linear" },
              { time: 1.0, value: [0.1, 0.4, 0.8], interpolation: "linear" }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 0.9, interpolation: "cubic" },
              { time: 0.6, value: 0.6, interpolation: "cubic" },
              { time: 1.0, value: 0.0, interpolation: "cubic" }
            ]
          }
        },
        rendering: {
          material: {
            type: "sprite",
            preset: "neon",
            blending: "additive",
            depthWrite: false
          }
        }
      }
    },
    
    // Layer 4: Dark Shadow Smoke
    {
      name: "ShadowSmoke",
      enabled: true,
      offset: [0, 0, 0],
      effect: {
        name: "ShadowSmoke",
        type: "particle",
        emitter: {
          shape: "sphere",
          radius: 0.4,
          rate: { type: "constant", value: 25 }
        },
        particles: {
          maxCount: 120,
          lifetime: { type: "uniform", min: 1.0, max: 1.8 },
          initialVelocity: {
            type: "uniform",
            min: [-0.6, -0.6, -3.5],
            max: [0.6, 0.6, -2.5]
          },
          initialScale: { type: "constant", value: 0.7 }
        },
        forces: [
          { 
            type: "turbulence", 
            strength: 0.4,
            parameters: { frequency: 1.0, octaves: 3 }
          },
          { type: "drag", strength: 0.4 }
        ],
        overLifetime: {
          scale: {
            keyframes: [
              { time: 0.0, value: [0.7, 0.7, 0.7], interpolation: "cubic" },
              { time: 1.0, value: [2.0, 2.0, 2.0], interpolation: "cubic" }
            ]
          },
          color: {
            keyframes: [
              { time: 0.0, value: [0.1, 0.15, 0.3], interpolation: "linear" },
              { time: 1.0, value: [0.05, 0.08, 0.15], interpolation: "linear" }
            ]
          },
          opacity: {
            keyframes: [
              { time: 0.0, value: 0.7, interpolation: "cubic" },
              { time: 0.7, value: 0.4, interpolation: "cubic" },
              { time: 1.0, value: 0.0, interpolation: "cubic" }
            ]
          }
        },
        rendering: {
          material: {
            type: "sprite",
            preset: "smoke",
            blending: "normal",
            depthWrite: false
          }
        }
      }
    }
  ],
  
  // Dynamic lighting
  lights: [
    {
      type: "point",
      color: [0.4, 0.7, 1.0],
      intensity: 3.0,
      distance: 8.0,
      decay: 2,
      position: [0, 0, 0],
      castShadow: false,
      flicker: {
        speed: 8,
        amount: 0.3
      },
      intensityCurve: {
        keyframes: [
          { time: 0.0, value: 1.0, interpolation: "cubic" },
          { time: 1.0, value: 0.8, interpolation: "cubic" }
        ]
      }
    }
  ],
  
  // Impact explosion effect
  onImpact: {
    name: "EnergyBall_Explosion",
    type: "composite",
    layers: [
      // Flash
      {
        name: "Flash",
        enabled: true,
        duration: 0.15,
        effect: {
          name: "ExplosionFlash",
          type: "particle",
          emitter: {
            shape: "sphere",
            radius: 0.2,
            rate: { type: "constant", value: 0 },
            burst: [{ time: 0, count: 60 }]
          },
          particles: {
            maxCount: 60,
            lifetime: { type: "constant", value: 0.15 },
            initialVelocity: { type: "constant", value: [0, 0, 0] },
            initialScale: { type: "constant", value: 1.5 }
          },
          forces: [],
          overLifetime: {
            scale: {
              keyframes: [
                { time: 0.0, value: [1.5, 1.5, 1.5], interpolation: "cubic" },
                { time: 1.0, value: [4.0, 4.0, 4.0], interpolation: "cubic" }
              ]
            },
            color: {
              keyframes: [
                { time: 0.0, value: [1.0, 1.0, 1.0], interpolation: "linear" },
                { time: 1.0, value: [0.4, 0.7, 1.0], interpolation: "linear" }
              ]
            },
            opacity: {
              keyframes: [
                { time: 0.0, value: 1.0, interpolation: "cubic" },
                { time: 1.0, value: 0.0, interpolation: "cubic" }
              ]
            }
          },
          rendering: {
            material: {
              type: "sprite",
              preset: "energy",
              blending: "additive"
            }
          }
        }
      },
      
      // Burst particles
      {
        name: "Burst",
        enabled: true,
        duration: 1.2,
        effect: {
          name: "ExplosionBurst",
          type: "particle",
          emitter: {
            shape: "sphere",
            radius: 0.3,
            rate: { type: "constant", value: 0 },
            burst: [{ time: 0, count: 300 }]
          },
          particles: {
            maxCount: 300,
            lifetime: { type: "uniform", min: 0.6, max: 1.2 },
            initialVelocity: {
              type: "uniform",
              min: [-8, -8, -8],
              max: [8, 8, 8]
            },
            initialScale: { type: "uniform", min: 0.15, max: 0.35 }
          },
          forces: [
            { type: "gravity", strength: 6 },
            { type: "drag", strength: 1.0 }
          ],
          overLifetime: {
            scale: {
              keyframes: [
                { time: 0.0, value: [0.25, 0.25, 0.25], interpolation: "cubic" },
                { time: 0.4, value: [0.8, 0.8, 0.8], interpolation: "cubic" },
                { time: 1.0, value: [0.3, 0.3, 0.3], interpolation: "cubic" }
              ]
            },
            color: {
              keyframes: [
                { time: 0.0, value: [0.8, 0.9, 1.0], interpolation: "linear" },
                { time: 0.3, value: [0.4, 0.7, 1.0], interpolation: "linear" },
                { time: 1.0, value: [0.1, 0.2, 0.4], interpolation: "linear" }
              ]
            },
            opacity: {
              keyframes: [
                { time: 0.0, value: 1.0, interpolation: "cubic" },
                { time: 0.7, value: 0.5, interpolation: "cubic" },
                { time: 1.0, value: 0.0, interpolation: "cubic" }
              ]
            }
          },
          rendering: {
            material: {
              type: "sprite",
              preset: "energy",
              blending: "additive"
            }
          }
        }
      },
      
      // Explosion smoke
      {
        name: "ExplosionSmoke",
        enabled: true,
        startDelay: 0.2,
        duration: 2.5,
        effect: {
          name: "ExplosionSmoke",
          type: "particle",
          emitter: {
            shape: "sphere",
            radius: 1.5,
            rate: { type: "constant", value: 40 }
          },
          particles: {
            maxCount: 150,
            lifetime: { type: "uniform", min: 1.5, max: 2.5 },
            initialVelocity: {
              type: "uniform",
              min: [-1.5, -1.5, -1.5],
              max: [1.5, 2.5, 1.5]
            },
            initialScale: { type: "constant", value: 0.6 }
          },
          forces: [
            { type: "buoyancy", strength: 1.2 },
            { 
              type: "turbulence", 
              strength: 0.6,
              parameters: { frequency: 1.2, octaves: 4 }
            },
            { type: "drag", strength: 0.35 }
          ],
          overLifetime: {
            scale: {
              keyframes: [
                { time: 0.0, value: [0.6, 0.6, 0.6], interpolation: "cubic" },
                { time: 1.0, value: [2.5, 2.5, 2.5], interpolation: "cubic" }
              ]
            },
            color: {
              keyframes: [
                { time: 0.0, value: [0.15, 0.2, 0.3], interpolation: "linear" },
                { time: 1.0, value: [0.08, 0.1, 0.15], interpolation: "linear" }
              ]
            },
            opacity: {
              keyframes: [
                { time: 0.0, value: 0.0, interpolation: "cubic" },
                { time: 0.3, value: 0.7, interpolation: "cubic" },
                { time: 1.0, value: 0.0, interpolation: "cubic" }
              ]
            }
          },
          rendering: {
            material: {
              type: "sprite",
              preset: "smoke",
              blending: "normal"
            }
          }
        }
      }
    ],
    
    // Circular shockwave
    shockwave: {
      type: "ring",
      startRadius: 0.2,
      endRadius: 8.0,
      lifetime: 0.8,
      color: [0.4, 0.7, 1.0],
      intensity: 3.0,
      thickness: 0.15,
      blending: "additive"
    }
  }
};
