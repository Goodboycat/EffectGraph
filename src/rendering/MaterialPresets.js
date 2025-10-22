/**
 * MaterialPresets - AAA-quality material definitions
 * Presets that AI can reference for realistic effects
 */

import * as THREE from 'three';

export const MaterialPresets = {
  
  /**
   * ENERGY - Glowing energy particles (projectiles, barriers)
   */
  energy: {
    blending: 'additive',
    depthWrite: false,
    shader: 'energy',
    uniforms: {
      glowIntensity: 2.0,
      coreSize: 0.3,
      pulseSpeed: 5.0
    },
    vertexShader: `
      attribute float size;
      attribute float alpha;
      attribute vec3 color;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        vColor = color;
        vAlpha = alpha;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float glowIntensity;
      uniform float coreSize;
      uniform float pulseSpeed;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv) * 2.0;
        
        // Energy core (bright center)
        float core = 1.0 - smoothstep(0.0, coreSize, dist);
        
        // Glow ring
        float glow = 1.0 / (1.0 + dist * dist * 10.0);
        
        // Pulsing effect
        float pulse = sin(time * pulseSpeed) * 0.3 + 0.7;
        
        // Combine
        float intensity = (core + glow * glowIntensity) * pulse;
        vec3 finalColor = vColor * intensity;
        float finalAlpha = intensity * vAlpha;
        
        // Discard weak pixels
        if (finalAlpha < 0.01) discard;
        
        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `
  },
  
  /**
   * NEON - Neon glow effect (trails, lasers)
   */
  neon: {
    blending: 'additive',
    depthWrite: false,
    shader: 'neon',
    uniforms: {
      glowWidth: 0.4,
      brightness: 3.0
    },
    fragmentShader: `
      uniform float time;
      uniform float glowWidth;
      uniform float brightness;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv) * 2.0;
        
        // Sharp neon core
        float core = 1.0 - smoothstep(0.0, 0.1, dist);
        
        // Soft neon glow
        float glow = exp(-dist * dist / glowWidth);
        
        // Bright neon effect
        float intensity = (core * 2.0 + glow) * brightness;
        vec3 finalColor = vColor * intensity;
        
        gl_FragColor = vec4(finalColor, intensity * vAlpha);
      }
    `
  },
  
  /**
   * FIRE - Realistic fire particles
   */
  fire: {
    blending: 'additive',
    depthWrite: false,
    shader: 'fire',
    uniforms: {
      flickerSpeed: 8.0,
      distortion: 0.3
    },
    fragmentShader: `
      uniform float time;
      uniform float flickerSpeed;
      uniform float distortion;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      // Noise function
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        
        // Apply distortion for organic look
        float n = noise(uv * 5.0 + time * 0.5);
        uv += vec2(sin(time * flickerSpeed + n * 6.28), cos(time * flickerSpeed * 0.7 + n * 6.28)) * distortion * 0.1;
        
        float dist = length(uv) * 2.0;
        
        // Soft fire shape
        float alpha = 1.0 - smoothstep(0.2, 0.8, dist);
        
        // Flickering
        float flicker = sin(time * flickerSpeed + n * 6.28) * 0.2 + 0.8;
        
        vec3 finalColor = vColor * flicker;
        float finalAlpha = alpha * vAlpha;
        
        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `
  },
  
  /**
   * SMOKE - Volumetric smoke particles
   */
  smoke: {
    blending: 'normal',
    depthWrite: false,
    shader: 'smoke',
    uniforms: {
      density: 0.5,
      softness: 0.6
    },
    fragmentShader: `
      uniform float time;
      uniform float density;
      uniform float softness;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        
        // Add noise for wispy smoke
        float n = noise(uv * 3.0 + time * 0.1);
        uv += vec2(sin(n * 6.28), cos(n * 6.28)) * 0.1;
        
        float dist = length(uv) * 2.0;
        
        // Soft smoke falloff
        float alpha = 1.0 - smoothstep(softness * 0.5, 1.0, dist);
        alpha *= density;
        
        // Wispy edges
        alpha *= 0.3 + n * 0.7;
        
        gl_FragColor = vec4(vColor, alpha * vAlpha);
      }
    `
  },
  
  /**
   * ELECTRIC - Electric arc/lightning effect
   */
  electric: {
    blending: 'additive',
    depthWrite: false,
    shader: 'electric',
    uniforms: {
      arcIntensity: 4.0,
      zapSpeed: 20.0
    },
    fragmentShader: `
      uniform float time;
      uniform float arcIntensity;
      uniform float zapSpeed;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        
        // Erratic movement
        float n = noise(uv * 10.0 + time * zapSpeed);
        uv += vec2(sin(n * 31.4), cos(n * 23.1)) * 0.15;
        
        float dist = length(uv) * 2.0;
        
        // Sharp electric core
        float core = 1.0 - step(0.05, dist);
        
        // Bright electric glow
        float glow = 1.0 / (1.0 + dist * dist * 20.0);
        
        // Rapid flickering
        float zap = step(0.5, noise(vec2(time * zapSpeed)));
        
        float intensity = (core * 3.0 + glow * arcIntensity) * (0.8 + zap * 0.4);
        vec3 finalColor = vColor * intensity;
        
        gl_FragColor = vec4(finalColor, intensity * vAlpha);
      }
    `
  },
  
  /**
   * MAGIC - Mystical shimmering particles
   */
  magic: {
    blending: 'additive',
    depthWrite: false,
    shader: 'magic',
    uniforms: {
      shimmerSpeed: 3.0,
      sparkleAmount: 0.8
    },
    fragmentShader: `
      uniform float time;
      uniform float shimmerSpeed;
      uniform float sparkleAmount;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float dist = length(uv) * 2.0;
        
        // Base glow
        float glow = 1.0 - smoothstep(0.2, 0.8, dist);
        
        // Shimmering effect
        float shimmer = sin(time * shimmerSpeed + dist * 5.0) * 0.3 + 0.7;
        
        // Sparkles (random bright spots)
        float n = noise(uv * 50.0 + time);
        float sparkle = step(1.0 - sparkleAmount * 0.1, n) * 2.0;
        
        float intensity = (glow + sparkle) * shimmer;
        vec3 finalColor = vColor * intensity;
        
        gl_FragColor = vec4(finalColor, intensity * vAlpha);
      }
    `
  },
  
  /**
   * DARK_SMOKE - Shadow/dark smoke (multiplicative)
   */
  darkSmoke: {
    blending: 'multiply',
    depthWrite: false,
    shader: 'darkSmoke',
    uniforms: {
      darkness: 0.7
    },
    fragmentShader: `
      uniform float time;
      uniform float darkness;
      
      varying vec3 vColor;
      varying float vAlpha;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        
        // Wispy movement
        float n = noise(uv * 3.0 + time * 0.1);
        uv += vec2(sin(n * 6.28), cos(n * 6.28)) * 0.15;
        
        float dist = length(uv) * 2.0;
        
        // Soft dark cloud
        float alpha = (1.0 - smoothstep(0.3, 1.0, dist)) * darkness;
        
        // Darken based on color (closer to black)
        vec3 darkenColor = mix(vec3(1.0), vColor, alpha * vAlpha);
        
        gl_FragColor = vec4(darkenColor, 1.0);
      }
    `
  },
  
  /**
   * DISTORTION - Heat haze / energy distortion
   */
  distortion: {
    blending: 'normal',
    depthWrite: false,
    shader: 'distortion',
    uniforms: {
      distortionStrength: 0.05,
      waveSpeed: 2.0
    }
  }
};

/**
 * Get a material preset by name
 */
export function getMaterialPreset(name) {
  return MaterialPresets[name] || MaterialPresets.energy;
}

/**
 * Create a material from preset
 */
export function createMaterialFromPreset(presetName, customUniforms = {}) {
  const preset = getMaterialPreset(presetName);
  
  // Merge custom uniforms with preset
  const uniforms = {
    time: { value: 0 },
    ...preset.uniforms,
    ...customUniforms
  };
  
  // Determine blending mode
  let blending = THREE.NormalBlending;
  if (preset.blending === 'additive') {
    blending = THREE.AdditiveBlending;
  } else if (preset.blending === 'multiply') {
    blending = THREE.MultiplyBlending;
  }
  
  // Default vertex shader if not provided
  const vertexShader = preset.vertexShader || `
    attribute float size;
    attribute float alpha;
    attribute vec3 color;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      vColor = color;
      vAlpha = alpha;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader: preset.fragmentShader,
    blending,
    transparent: true,
    depthWrite: preset.depthWrite !== false,
    depthTest: true
  });
}
