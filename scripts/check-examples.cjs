#!/usr/bin/env node

/**
 * Check that example files exist and are valid
 */

const fs = require('fs');
const path = require('path');

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

const requiredFiles = [
  'minimal.html',
  'minimal.ts',
  'gpu.html',
  'gpu.ts'
];

let exitCode = 0;

console.log('Checking example files...\n');

requiredFiles.forEach(file => {
  const filePath = path.join(EXAMPLES_DIR, file);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✓ ${file} (${stats.size} bytes)`);
    
    // Basic content check
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (file.endsWith('.html')) {
      if (!content.includes('<!DOCTYPE html>')) {
        console.error(`  ⚠ Warning: ${file} missing DOCTYPE`);
      }
      if (!content.includes('EffectGraph')) {
        console.error(`  ⚠ Warning: ${file} missing EffectGraph reference`);
      }
    }
    
    if (file.endsWith('.ts')) {
      if (!content.includes('import')) {
        console.error(`  ⚠ Warning: ${file} missing imports`);
      }
    }
  } else {
    console.error(`✗ ${file} - NOT FOUND`);
    exitCode = 1;
  }
});

console.log('\nExample files check', exitCode === 0 ? 'PASSED' : 'FAILED');
process.exit(exitCode);
