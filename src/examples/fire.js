/**
 * Realistic fire effect definition
 */

export const fireEffect = {
  name: "RealisticFire",
  type: "particle",
  
  emitter: {
    shape: "cone",
    radius: 0.3,
    height: 0.1,
    angle: 15,
    rate: { type: "uniform", min: 50, max: 80 }
  },
  
  particles: {
    maxCount: 500,
    lifetime: { type: "uniform", min: 0.8, max: 1.2 },
    initialVelocity: {
      type: "normal",
      mean: [0, 2, 0],
      stddev: [0.2, 0.3, 0.2]
    },
    initialScale: { type: "constant", value: 0.1 }
  },
  
  forces: [
    {
      type: "buoyancy",
      strength: 3.0
    },
    {
      type: "turbulence",
      strength: 0.5,
      parameters: {
        frequency: 2.0,
        octaves: 3
      }
    },
    {
      type: "drag",
      strength: 0.1
    }
  ],
  
  overLifetime: {
    scale: {
      keyframes: [
        { time: 0.0, value: [0.1, 0.1, 0.1], interpolation: "cubic" },
        { time: 0.3, value: [0.4, 0.6, 0.4], interpolation: "cubic" },
        { time: 1.0, value: [0.8, 1.2, 0.8], interpolation: "cubic" }
      ]
    },
    color: {
      keyframes: [
        { time: 0.0, value: [1.0, 0.9, 0.5], interpolation: "linear" },
        { time: 0.5, value: [1.0, 0.4, 0.1], interpolation: "linear" },
        { time: 1.0, value: [0.2, 0.05, 0.0], interpolation: "linear" }
      ]
    },
    opacity: {
      keyframes: [
        { time: 0.0, value: 0.9, interpolation: "cubic" },
        { time: 0.7, value: 0.6, interpolation: "cubic" },
        { time: 1.0, value: 0.0, interpolation: "cubic" }
      ]
    }
  },
  
  rendering: {
    material: {
      type: "sprite",
      blending: "additive",
      depthWrite: false
    }
  }
};
