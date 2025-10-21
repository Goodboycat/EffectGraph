/**
 * Explosion effect with shockwave and debris
 */

export const explosionEffect = {
  name: "Explosion",
  type: "particle",
  
  emitter: {
    shape: "sphere",
    radius: 0.1,
    rate: { type: "constant", value: 0 },
    burst: [
      { time: 0, count: 200 }
    ]
  },
  
  particles: {
    maxCount: 200,
    lifetime: { type: "uniform", min: 0.5, max: 1.5 },
    initialVelocity: {
      type: "uniform",
      min: [-5, -5, -5],
      max: [5, 5, 5]
    },
    initialScale: { type: "uniform", min: 0.1, max: 0.3 }
  },
  
  forces: [
    {
      type: "gravity",
      strength: 9.8
    },
    {
      type: "drag",
      strength: 0.5
    }
  ],
  
  overLifetime: {
    scale: {
      keyframes: [
        { time: 0.0, value: [0.2, 0.2, 0.2], interpolation: "cubic" },
        { time: 0.2, value: [0.8, 0.8, 0.8], interpolation: "cubic" },
        { time: 1.0, value: [0.3, 0.3, 0.3], interpolation: "cubic" }
      ]
    },
    color: {
      keyframes: [
        { time: 0.0, value: [1.0, 1.0, 0.8], interpolation: "linear" },
        { time: 0.1, value: [1.0, 0.6, 0.2], interpolation: "linear" },
        { time: 0.3, value: [0.8, 0.3, 0.1], interpolation: "linear" },
        { time: 1.0, value: [0.2, 0.2, 0.2], interpolation: "linear" }
      ]
    },
    opacity: {
      keyframes: [
        { time: 0.0, value: 1.0, interpolation: "cubic" },
        { time: 0.8, value: 0.6, interpolation: "cubic" },
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
