/**
 * GPU example - Multiple effects with controls
 */

import { renderEffectToCanvas, getPreset, listPresets } from '../src/index.js';
import type { EffectHandle } from '../src/index.js';

let currentHandle: EffectHandle | null = null;

async function loadEffect(presetName: string, canvas: HTMLCanvasElement) {
  // Dispose previous effect
  if (currentHandle) {
    currentHandle.dispose();
    currentHandle = null;
  }

  try {
    const preset = getPreset(presetName);
    console.log(`Loading preset: ${presetName}`, preset);

    currentHandle = await renderEffectToCanvas(preset, canvas, {
      mode: 'gpu',
      seed: Date.now(),
      quality: 'high',
      camera: {
        position: [0, 5, 15],
        lookAt: [0, 0, 0],
      },
    });

    console.log('Effect loaded:', currentHandle.getStats());
  } catch (error) {
    console.error('Failed to load effect:', error);
    alert(`Error loading effect: ${error}`);
  }
}

function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const presetSelect = document.getElementById('presetSelect') as HTMLSelectElement;
  const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
  const statsDiv = document.getElementById('stats') as HTMLDivElement;

  if (!canvas || !presetSelect || !pauseBtn || !statsDiv) {
    console.error('Required elements not found');
    return;
  }

  // Setup canvas
  canvas.width = 1024;
  canvas.height = 768;

  // Populate preset selector
  const presets = listPresets();
  presets.forEach((preset) => {
    const option = document.createElement('option');
    option.value = preset.name;
    option.textContent = `${preset.name} (${preset.tags.join(', ')})`;
    presetSelect.appendChild(option);
  });

  // Load initial effect
  if (presets.length > 0) {
    loadEffect(presets[0].name, canvas);
  }

  // Preset change handler
  presetSelect.addEventListener('change', () => {
    loadEffect(presetSelect.value, canvas);
  });

  // Pause/Resume handler
  let isPaused = false;
  pauseBtn.addEventListener('click', () => {
    if (!currentHandle) return;

    isPaused = !isPaused;
    if (isPaused && currentHandle.pause) {
      currentHandle.pause();
      pauseBtn.textContent = 'Resume';
    } else if (currentHandle.resume) {
      currentHandle.resume();
      pauseBtn.textContent = 'Pause';
    }
  });

  // Stats updater
  setInterval(() => {
    if (!currentHandle) return;

    const stats = currentHandle.getStats();
    statsDiv.innerHTML = `
      <div><strong>Active Particles:</strong> ${stats.activeParticles}</div>
      <div><strong>Frame Time:</strong> ${stats.lastFrameMs.toFixed(2)} ms</div>
      <div><strong>FPS:</strong> ${(1000 / (stats.lastFrameMs || 16)).toFixed(1)}</div>
      <div><strong>Render Mode:</strong> ${stats.renderMode?.toUpperCase() || 'N/A'}</div>
    `;
  }, 100);

  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (currentHandle) {
      currentHandle.dispose();
    }
  });
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
