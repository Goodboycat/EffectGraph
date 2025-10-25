/**
 * Main Application Module
 * Orchestrates all components
 */

import { CONFIG } from './config.js';
import { EffectRenderer } from './effectRenderer.js';
import { PresetManager } from './presetManager.js';
import { UIManager } from './ui.js';

class EffectGraphApp {
  constructor() {
    this.presetManager = new PresetManager();
    this.ui = new UIManager();
    this.currentRenderer = null;
    this.currentSpec = null;
    this.isPaused = false;
    this.statsInterval = null;
  }

  /**
   * Initialize application
   */
  async init() {
    console.log('🎨 Initializing EffectGraph Demo...');

    // Initialize UI
    this.ui.init();
    this.setupCallbacks();

    // Load presets
    await this.loadPresets();

    // Load first preset
    if (this.presetManager.presets.length > 0) {
      await this.loadPreset(this.presetManager.presets[0].name);
    }

    // Start stats updater
    this.startStatsUpdater();

    console.log('✅ EffectGraph Demo ready!');
  }

  /**
   * Setup UI callbacks
   */
  setupCallbacks() {
    this.ui.on('onPresetSelect', (name) => this.loadPreset(name));
    this.ui.on('onPause', () => this.togglePause());
    this.ui.on('onReset', () => this.resetEffect());
    this.ui.on('onShowJSON', () => this.showJSON());
    this.ui.on('onQualityChange', () => this.resetEffect());
  }

  /**
   * Load all presets
   */
  async loadPresets() {
    try {
      this.ui.showLoading();
      const presets = await this.presetManager.loadPresets();
      this.ui.populatePresets(presets);
      console.log(`✅ Loaded ${presets.length} presets`);
    } catch (error) {
      console.error('❌ Failed to load presets:', error);
      this.ui.showError('Failed to load presets');
    }
  }

  /**
   * Load and render a preset
   */
  async loadPreset(name) {
    try {
      console.log(`🎨 Loading preset: ${name}`);

      // Dispose current renderer
      if (this.currentRenderer) {
        this.currentRenderer.dispose();
        this.currentRenderer = null;
      }

      // Load preset spec
      const spec = await this.presetManager.getPreset(name);
      this.currentSpec = spec;

      // Create renderer
      const canvas = this.ui.elements.canvas;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      this.currentRenderer = new EffectRenderer(canvas);

      const options = {
        ...CONFIG.defaultOptions,
        quality: this.ui.getQuality(),
        seed: this.ui.getSeed(),
      };

      this.currentRenderer.init(spec, options);
      this.currentRenderer.start();

      this.isPaused = false;
      this.ui.updatePauseButton(false);

      console.log(`✅ Loaded: ${name}`);
    } catch (error) {
      console.error('❌ Failed to load preset:', error);
      this.ui.showMessage(`Failed to load ${name}: ${error.message}`, 'error');
    }
  }

  /**
   * Toggle pause/resume
   */
  togglePause() {
    if (!this.currentRenderer) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.currentRenderer.pause();
    } else {
      this.currentRenderer.resume();
    }

    this.ui.updatePauseButton(this.isPaused);
  }

  /**
   * Reset current effect
   */
  async resetEffect() {
    if (!this.currentSpec) return;

    const activePreset = document.querySelector('.preset-list li.active');
    if (activePreset) {
      const name = activePreset.dataset.presetName;
      await this.loadPreset(name);
    }
  }

  /**
   * Show JSON specification
   */
  showJSON() {
    if (this.currentSpec) {
      this.ui.showJSONModal(this.currentSpec);
    }
  }

  /**
   * Start stats updater
   */
  startStatsUpdater() {
    this.statsInterval = setInterval(() => {
      if (this.currentRenderer && !this.isPaused) {
        const stats = this.currentRenderer.getStats();
        this.ui.updateStats(stats);
      }
    }, CONFIG.statsUpdateInterval);
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    if (this.currentRenderer) {
      this.currentRenderer.dispose();
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new EffectGraphApp();
    app.init().catch(console.error);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => app.cleanup());
  });
} else {
  const app = new EffectGraphApp();
  app.init().catch(console.error);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => app.cleanup());
}
