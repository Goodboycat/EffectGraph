/**
 * Minimal example - Simple smoke effect
 */

import { renderEffectToCanvas, getPreset } from '../src/index.js';

async function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  // Resize canvas
  canvas.width = 800;
  canvas.height = 600;

  try {
    // Load smoke-spiral preset
    const preset = getPreset('smoke-spiral');

    // Render to canvas
    const handle = await renderEffectToCanvas(preset, canvas, {
      mode: 'auto',
      seed: 123,
      quality: 'medium',
    });

    console.log('Effect started successfully!');
    console.log('Stats:', handle.getStats());

    // Add controls
    const statsDiv = document.getElementById('stats');
    setInterval(() => {
      if (statsDiv) {
        const stats = handle.getStats();
        statsDiv.textContent = `
          Particles: ${stats.activeParticles}
          Frame Time: ${stats.lastFrameMs.toFixed(2)}ms
          Mode: ${stats.renderMode}
        `;
      }
    }, 100);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      handle.dispose();
    });
  } catch (error) {
    console.error('Failed to start effect:', error);
  }
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
