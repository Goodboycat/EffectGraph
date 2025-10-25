/**
 * Preset Management Module
 * Handles loading and managing effect presets
 */

import { CONFIG } from './config.js';

export class PresetManager {
  constructor() {
    this.presets = [];
    this.presetSpecs = new Map();
  }

  /**
   * Load all presets
   */
  async loadPresets() {
    try {
      const response = await fetch(CONFIG.presetIndexPath);
      if (!response.ok) {
        throw new Error(`Failed to load presets: ${response.statusText}`);
      }
      this.presets = await response.json();
      return this.presets;
    } catch (error) {
      console.error('Error loading presets:', error);
      throw error;
    }
  }

  /**
   * Get preset specification by name
   */
  async getPreset(name) {
    // Check cache
    if (this.presetSpecs.has(name)) {
      return this.presetSpecs.get(name);
    }

    // Load from file
    try {
      const response = await fetch(`${CONFIG.presetBasePath}${name}.json`);
      if (!response.ok) {
        throw new Error(`Preset not found: ${name}`);
      }
      const spec = await response.json();
      this.presetSpecs.set(name, spec);
      return spec;
    } catch (error) {
      console.error(`Error loading preset ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get all preset names
   */
  getPresetNames() {
    return this.presets.map((p) => p.name);
  }

  /**
   * Get preset metadata
   */
  getPresetMetadata(name) {
    return this.presets.find((p) => p.name === name);
  }

  /**
   * Search presets by tag
   */
  searchByTag(tag) {
    return this.presets.filter((p) => p.tags.includes(tag));
  }

  /**
   * Get all unique tags
   */
  getAllTags() {
    const tags = new Set();
    this.presets.forEach((p) => {
      p.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }
}
