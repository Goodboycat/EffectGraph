/**
 * Curve evaluation system for animating properties over lifetime
 */

import * as THREE from 'three';

export class Curve {
  constructor(keyframes) {
    if (!keyframes || keyframes.length === 0) {
      throw new Error('Curve must have at least one keyframe');
    }
    
    // Sort keyframes by time
    this.keyframes = [...keyframes].sort((a, b) => a.time - b.time);
  }
  
  /**
   * Evaluate the curve at normalized time t (0-1)
   */
  evaluate(t) {
    // Clamp to valid range
    t = Math.max(0, Math.min(1, t));
    
    // Handle edge cases
    if (t <= this.keyframes[0].time) {
      return this.cloneValue(this.keyframes[0].value);
    }
    if (t >= this.keyframes[this.keyframes.length - 1].time) {
      return this.cloneValue(this.keyframes[this.keyframes.length - 1].value);
    }
    
    // Find surrounding keyframes
    let leftIdx = 0;
    let rightIdx = this.keyframes.length - 1;
    
    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (t >= this.keyframes[i].time && t <= this.keyframes[i + 1].time) {
        leftIdx = i;
        rightIdx = i + 1;
        break;
      }
    }
    
    const left = this.keyframes[leftIdx];
    const right = this.keyframes[rightIdx];
    
    // Normalize t between keyframes
    const localT = (t - left.time) / (right.time - left.time);
    
    // Apply interpolation
    const interpolation = left.interpolation || 'linear';
    const easedT = this.applyEasing(localT, interpolation);
    
    return this.interpolate(left.value, right.value, easedT);
  }
  
  /**
   * Apply easing function to t
   */
  applyEasing(t, type) {
    switch (type) {
      case 'linear':
        return t;
      
      case 'cubic':
        return this.easeInOutCubic(t);
      
      case 'step':
        return t < 0.5 ? 0 : 1;
      
      case 'bezier':
        // Cubic bezier with control points (0.42, 0, 0.58, 1)
        return this.cubicBezier(t, 0.42, 0, 0.58, 1);
      
      default:
        return t;
    }
  }
  
  /**
   * Ease in-out cubic function
   */
  easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * Cubic bezier interpolation
   */
  cubicBezier(t, p1, p2, p3, p4) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    return uuu * 0 + 3 * uu * t * p1 + 3 * u * tt * p3 + ttt * 1;
  }
  
  /**
   * Interpolate between two values
   */
  interpolate(a, b, t) {
    // Number interpolation
    if (typeof a === 'number' && typeof b === 'number') {
      return a + (b - a) * t;
    }
    
    // Array interpolation
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.map((v, i) => v + (b[i] - v) * t);
    }
    
    // THREE.js Vector3 interpolation
    if (a instanceof THREE.Vector3 && b instanceof THREE.Vector3) {
      return new THREE.Vector3().lerpVectors(a, b, t);
    }
    
    // THREE.js Color interpolation
    if (a instanceof THREE.Color && b instanceof THREE.Color) {
      return new THREE.Color().lerpColors(a, b, t);
    }
    
    // Fallback for unknown types
    return t < 0.5 ? a : b;
  }
  
  /**
   * Clone a value (handles various types)
   */
  cloneValue(value) {
    if (typeof value === 'number') {
      return value;
    }
    if (Array.isArray(value)) {
      return [...value];
    }
    if (value && typeof value.clone === 'function') {
      return value.clone();
    }
    return value;
  }
}

/**
 * Create a curve from simple keyframe data
 */
export function createCurve(keyframes) {
  // Convert plain objects to THREE.js objects if needed
  const processedKeyframes = keyframes.map(kf => {
    let value = kf.value;
    
    // Convert array to Vector3 if it has 3 components
    if (Array.isArray(value) && value.length === 3 && 
        keyframes.some(k => Array.isArray(k.value))) {
      value = new THREE.Vector3(...value);
    }
    
    // Convert color arrays/hex to THREE.Color
    if (typeof value === 'string' && value.startsWith('#')) {
      value = new THREE.Color(value);
    } else if (Array.isArray(value) && value.length >= 3 && 
               keyframes.length > 0 && 
               keyframes[0].value.length >= 3) {
      // Check if this looks like a color (values between 0-1 or 0-255)
      const maxVal = Math.max(...value.slice(0, 3));
      if (maxVal > 1) {
        value = new THREE.Color(value[0] / 255, value[1] / 255, value[2] / 255);
      }
    }
    
    return {
      ...kf,
      value
    };
  });
  
  return new Curve(processedKeyframes);
}

/**
 * Helper to create simple linear curves
 */
export function linearCurve(startValue, endValue) {
  return createCurve([
    { time: 0, value: startValue, interpolation: 'linear' },
    { time: 1, value: endValue, interpolation: 'linear' }
  ]);
}

/**
 * Helper to create fade curves
 */
export function fadeCurve(fadeIn = 0.1, fadeOut = 0.3) {
  return createCurve([
    { time: 0, value: 0, interpolation: 'cubic' },
    { time: fadeIn, value: 1, interpolation: 'cubic' },
    { time: 1 - fadeOut, value: 1, interpolation: 'cubic' },
    { time: 1, value: 0, interpolation: 'cubic' }
  ]);
}
