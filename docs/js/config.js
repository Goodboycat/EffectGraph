/**
 * Configuration and Constants
 */

export const CONFIG = {
  // Canvas settings
  canvas: {
    width: 1024,
    height: 768,
  },

  // Default render options
  defaultOptions: {
    mode: 'auto',
    quality: 'medium',
    camera: {
      position: [0, 5, 15],
      lookAt: [0, 0, 0],
    },
  },

  // Stats update interval (ms)
  statsUpdateInterval: 100,

  // Three.js CDN
  threeJsUrl: 'https://unpkg.com/three@0.160.0/build/three.module.js',

  // Preset paths
  presetIndexPath: '../presets/index.json',
  presetBasePath: '../presets/',
};

export const MESSAGES = {
  loading: 'Loading effect...',
  error: 'Failed to load effect',
  noPresets: 'No presets available',
  copied: 'Copied to clipboard!',
  noWebGL: 'WebGL not available, using CPU renderer',
};
