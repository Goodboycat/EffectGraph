/**
 * Smoke effect definition
 */

export const smokeEffect = {
  name: "Smoke",
  type: "particle",
  
  emitter: {
    shape: "cone",
    radius: 0.4,
    height: 0.5,
    angle: 25,
    rate: { type: "constant", value: 20 }
  },
  
  particles: {
    maxCount: 200,
    lifetime: { type: "uniform", min: 2.0, max: 3.0 },
    initialVelocity: {
      type: "uniform",
      min: [-0.3, 1.5, -0.3],
      max: [0.3, 2.5, 0.3]
    },
    initialScale: { type: "constant", value: 0.3 }
  },
  
  forces: [
    {
      type: "buoyancy",
      strength: 1.0
    },
    {
      type: "turbulence",
      strength: 0.8,
      parameters: {
        frequency: 1.0,
        octaves: 4
      }
    },
    {
      type: "drag",
      strength: 0.3
    }
  ],
  
  overLifetime: {
    scale: {
      keyframes: [
        { time: 0.0, value: [0.3, 0.3, 0.3], interpolation: "cubic" },
        { time: 1.0, value: [1.5, 1.5, 1.5], interpolation: "cubic" }
      ]
    },
    color: {
      keyframes: [
        { time: 0.0, value: [0.15, 0.15, 0.15], interpolation: "linear" },
        { time: 1.0, value: [0.08, 0.08, 0.08], interpolation: "linear" }
      ]
    },
    opacity: {
      keyframes: [
        { time: 0.0, value: 0.0, interpolation: "cubic" },
        { time: 0.2, value: 0.5, interpolation: "cubic" },
        { time: 1.0, value: 0.0, interpolation: "cubic" }
      ]
    }
  },
  
  rendering: {
    material: {
      type: "sprite",
      blending: "normal",
      depthWrite: false
    }
  }
};
