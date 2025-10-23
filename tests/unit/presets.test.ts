/**
 * Tests for preset management
 */

import { describe, it, expect } from 'vitest';
import { listPresets, getPreset, hasPreset, getPresetNames } from '../../src/api/presets.js';

describe('Preset Management', () => {
  it('should list all available presets', () => {
    const presets = listPresets();
    
    expect(presets).toBeInstanceOf(Array);
    expect(presets.length).toBeGreaterThan(0);
    expect(presets.length).toBeGreaterThanOrEqual(12); // We created 12 presets
    
    // Check structure of first preset
    const first = presets[0];
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('description');
    expect(first).toHaveProperty('tags');
  });

  it('should get a preset by name', () => {
    const preset = getPreset('explosion-large');
    
    expect(preset).toBeDefined();
    expect(preset.name).toBe('explosion-large');
    expect(preset.emitters).toBeDefined();
    expect(preset.physics).toBeDefined();
    expect(preset.renderer).toBeDefined();
  });

  it('should throw error for non-existent preset', () => {
    expect(() => {
      getPreset('non-existent-preset');
    }).toThrow();
  });

  it('should check if preset exists', () => {
    expect(hasPreset('explosion-large')).toBe(true);
    expect(hasPreset('smoke-spiral')).toBe(true);
    expect(hasPreset('non-existent')).toBe(false);
  });

  it('should return all preset names', () => {
    const names = getPresetNames();
    
    expect(names).toBeInstanceOf(Array);
    expect(names.length).toBeGreaterThanOrEqual(12);
    expect(names).toContain('explosion-large');
    expect(names).toContain('smoke-spiral');
  });

  it('should return a deep clone (modifications should not affect original)', () => {
    const preset1 = getPreset('explosion-large');
    const preset2 = getPreset('explosion-large');
    
    // Modify one
    preset1.name = 'modified';
    preset1.emitters[0].rate = 9999;
    
    // Original should be unchanged
    expect(preset2.name).toBe('explosion-large');
    expect(preset2.emitters[0].rate).not.toBe(9999);
  });

  it('should have valid specs for all presets', () => {
    const names = getPresetNames();
    
    names.forEach(name => {
      const preset = getPreset(name);
      
      expect(preset.name).toBe(name);
      expect(preset.emitters).toBeInstanceOf(Array);
      expect(preset.emitters.length).toBeGreaterThan(0);
      expect(preset.physics).toBeDefined();
      expect(preset.renderer).toBeDefined();
    });
  });
});
