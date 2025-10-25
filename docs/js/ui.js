/**
 * UI Management Module
 * Handles all UI interactions and updates
 */

import { CONFIG, MESSAGES } from './config.js';

export class UIManager {
  constructor() {
    this.elements = {};
    this.callbacks = {};
  }

  /**
   * Initialize UI elements
   */
  init() {
    this.elements = {
      canvas: document.getElementById('canvas'),
      presetList: document.getElementById('presetList'),
      qualitySelect: document.getElementById('qualitySelect'),
      seedInput: document.getElementById('seedInput'),
      bloomToggle: document.getElementById('bloomToggle'),
      pauseBtn: document.getElementById('pauseBtn'),
      resetBtn: document.getElementById('resetBtn'),
      jsonBtn: document.getElementById('jsonBtn'),
      stats: document.getElementById('stats'),
      jsonModal: document.getElementById('jsonModal'),
      jsonContent: document.getElementById('jsonContent'),
      modalClose: document.getElementById('modalClose'),
      copyBtn: document.getElementById('copyBtn'),
    };

    // Setup canvas
    if (this.elements.canvas) {
      this.elements.canvas.width = CONFIG.canvas.width;
      this.elements.canvas.height = CONFIG.canvas.height;
    }

    this.attachEventListeners();
    return this;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Pause button
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => {
        this.callbacks.onPause?.();
      });
    }

    // Reset button
    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener('click', () => {
        this.callbacks.onReset?.();
      });
    }

    // JSON button
    if (this.elements.jsonBtn) {
      this.elements.jsonBtn.addEventListener('click', () => {
        this.callbacks.onShowJSON?.();
      });
    }

    // Modal close
    if (this.elements.modalClose) {
      this.elements.modalClose.addEventListener('click', () => {
        this.hideModal();
      });
    }

    // Copy button
    if (this.elements.copyBtn) {
      this.elements.copyBtn.addEventListener('click', () => {
        this.copyJSONToClipboard();
      });
    }

    // Quality change
    if (this.elements.qualitySelect) {
      this.elements.qualitySelect.addEventListener('change', () => {
        this.callbacks.onQualityChange?.(this.elements.qualitySelect.value);
      });
    }
  }

  /**
   * Register callback
   */
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  /**
   * Populate preset list
   */
  populatePresets(presets) {
    if (!this.elements.presetList) return;

    this.elements.presetList.innerHTML = '';

    presets.forEach((preset, index) => {
      const li = document.createElement('li');
      li.dataset.presetName = preset.name;
      li.innerHTML = `
        <div class="preset-name">${preset.name}</div>
        <div class="preset-tags">${preset.tags.join(', ')}</div>
      `;

      li.addEventListener('click', () => {
        this.setActivePreset(preset.name);
        this.callbacks.onPresetSelect?.(preset.name);
      });

      if (index === 0) {
        li.classList.add('active');
      }

      this.elements.presetList.appendChild(li);
    });
  }

  /**
   * Set active preset in UI
   */
  setActivePreset(name) {
    const items = this.elements.presetList?.querySelectorAll('li');
    items?.forEach((item) => {
      item.classList.toggle('active', item.dataset.presetName === name);
    });
  }

  /**
   * Update stats display
   */
  updateStats(stats) {
    if (!this.elements.stats) return;

    const fps = stats.lastFrameMs > 0 ? (1000 / stats.lastFrameMs).toFixed(1) : '0';

    this.elements.stats.innerHTML = `
      <div class="stats-item">
        <span class="stats-label">Active Particles:</span>
        <span class="stats-value">${stats.activeParticles}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Frame Time:</span>
        <span class="stats-value">${stats.lastFrameMs.toFixed(2)} ms</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">FPS:</span>
        <span class="stats-value">${fps}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Render Mode:</span>
        <span class="stats-value">${(stats.renderMode || 'N/A').toUpperCase()}</span>
      </div>
    `;
  }

  /**
   * Update pause button state
   */
  updatePauseButton(isPaused) {
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    }
  }

  /**
   * Show JSON modal
   */
  showJSONModal(spec) {
    if (!this.elements.jsonModal || !this.elements.jsonContent) return;

    this.elements.jsonContent.textContent = JSON.stringify(spec, null, 2);
    this.elements.jsonModal.classList.add('active');
  }

  /**
   * Hide modal
   */
  hideModal() {
    if (this.elements.jsonModal) {
      this.elements.jsonModal.classList.remove('active');
    }
  }

  /**
   * Copy JSON to clipboard
   */
  async copyJSONToClipboard() {
    if (!this.elements.jsonContent) return;

    try {
      await navigator.clipboard.writeText(this.elements.jsonContent.textContent);
      this.showMessage(MESSAGES.copied, 'success');
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showMessage('Failed to copy to clipboard', 'error');
    }
  }

  /**
   * Show temporary message
   */
  showMessage(message, type = 'success') {
    const div = document.createElement('div');
    div.className = type;
    div.textContent = message;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.right = '20px';
    div.style.zIndex = '9999';
    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 3000);
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.elements.presetList) {
      this.elements.presetList.innerHTML = '<li class="loading">Loading presets</li>';
    }
  }

  /**
   * Show error
   */
  showError(message) {
    if (this.elements.presetList) {
      this.elements.presetList.innerHTML = `<li class="error">${message}</li>`;
    }
  }

  /**
   * Get current quality setting
   */
  getQuality() {
    return this.elements.qualitySelect?.value || 'medium';
  }

  /**
   * Get current seed
   */
  getSeed() {
    return parseInt(this.elements.seedInput?.value || Date.now());
  }
}
