/**
 * Magical sparkles / glitter effect
 */

export const sparklesEffect = {
  name: "Sparkles",
  type: "particle",
  
  emitter: {
    shape: "sphere",
    radius: 2.0,
    rate: { type: "constant", value: 30 }
  },
  
  particles: {
    maxCount: 300,
    lifetime: { type: "uniform", min: 1.0, max: 2.0 },
    initialVelocity: {
      type: "uniform",
      min: [-0.5, -0.5, -0.5],
      max: [0.5, 0.5, 0.5]
    },
    initialScale: { type: "uniform", min: 0.05, max: 0.15 }
  },
  
  forces: [
    {
      type: "drag",
      strength: 0.2
    },
    {
      type: "turbulence",
      strength: 0.3,
      parameters: {
        frequency: 1.5,
        octaves: 2
      }
    }
  ],
  
  overLifetime: {
    scale: {
      keyframes: [
        { time: 0.0, value: [0.05, 0.05, 0.05], interpolation: "cubic" },
        { time: 0.3, value: [0.2, 0.2, 0.2], interpolation: "cubic" },
        { time: 1.0, value: [0.05, 0.05, 0.05], interpolation: "cubic" }
      ]
    },
    color: {
      keyframes: [
        { time: 0.0, value: [1.0, 0.9, 0.3], interpolation: "linear" },
        { time: 0.5, value: [0.5, 0.8, 1.0], interpolation: "linear" },
        { time: 1.0, value: [1.0, 0.5, 0.9], interpolation: "linear" }
      ]
    },
    opacity: {
      keyframes: [
        { time: 0.0, value: 0.0, interpolation: "cubic" },
        { time: 0.2, value: 1.0, interpolation: "cubic" },
        { time: 0.8, value: 1.0, interpolation: "cubic" },
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
