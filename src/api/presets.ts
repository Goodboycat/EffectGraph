/**
 * Preset management functions
 */

import type { EffectSpec, PresetMetadata } from '../types.js';

// Import all preset files
import explosionLarge from '../../presets/explosion-large.json';
import explosionSmall from '../../presets/explosion-small.json';
import smokeSpiral from '../../presets/smoke-spiral.json';
import smokeDense from '../../presets/smoke-dense.json';
import fireSpark from '../../presets/fire-spark.json';
import fireEmbers from '../../presets/fire-embers.json';
import aurora from '../../presets/aurora.json';
import plasmaBeam from '../../presets/plasma-beam.json';
import magicSwirl from '../../presets/magic-swirl.json';
import waterSpray from '../../presets/water-spray.json';
import dustCloud from '../../presets/dust-cloud.json';
import emberTrails from '../../presets/ember-trails.json';
import presetIndex from '../../presets/index.json';

// Preset registry
const presets: Map<string, EffectSpec> = new Map([
  ['explosion-large', explosionLarge as EffectSpec],
  ['explosion-small', explosionSmall as EffectSpec],
  ['smoke-spiral', smokeSpiral as EffectSpec],
  ['smoke-dense', smokeDense as EffectSpec],
  ['fire-spark', fireSpark as EffectSpec],
  ['fire-embers', fireEmbers as EffectSpec],
  ['aurora', aurora as EffectSpec],
  ['plasma-beam', plasmaBeam as EffectSpec],
  ['magic-swirl', magicSwirl as EffectSpec],
  ['water-spray', waterSpray as EffectSpec],
  ['dust-cloud', dustCloud as EffectSpec],
  ['ember-trails', emberTrails as EffectSpec],
]);

/**
 * List all available presets with metadata
 * @returns Array of preset metadata
 */
export function listPresets(): PresetMetadata[] {
  return presetIndex as PresetMetadata[];
}

/**
 * Get a preset by name
 * @param name - Preset name
 * @returns Deep clone of preset spec
 * @throws {Error} If preset not found
 */
export function getPreset(name: string): EffectSpec {
  const preset = presets.get(name);
  if (!preset) {
    const available = Array.from(presets.keys()).join(', ');
    throw new Error(
      `Preset "${name}" not found. Available presets: ${available}`
    );
  }

  // Return deep clone to prevent modification
  return JSON.parse(JSON.stringify(preset)) as EffectSpec;
}

/**
 * Check if a preset exists
 * @param name - Preset name
 * @returns True if preset exists
 */
export function hasPreset(name: string): boolean {
  return presets.has(name);
}

/**
 * Get all preset names
 * @returns Array of preset names
 */
export function getPresetNames(): string[] {
  return Array.from(presets.keys());
}
