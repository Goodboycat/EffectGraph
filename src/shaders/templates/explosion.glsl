// Explosion particle shader template
// Vertex Shader: #VERTEX
// Fragment Shader: #FRAGMENT

// === VERTEX SHADER ===
#VERTEX
attribute vec3 position;
attribute float age;
attribute vec4 customData;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float particleSize;
uniform float time;

varying float vAge;
varying vec4 vCustomData;
varying float vLife;

void main() {
  vAge = age;
  vCustomData = customData;
  vLife = 1.0 - age;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Size decreases over time for explosion particles
  float sizeMultiplier = 1.5 * (1.0 - age * 0.7);
  gl_PointSize = particleSize * sizeMultiplier * (300.0 / -mvPosition.z);
}

// === FRAGMENT SHADER ===
#FRAGMENT
precision mediump float;

varying float vAge;
varying vec4 vCustomData;
varying float vLife;

uniform float time;

vec4 fireGradient(float t) {
  t = clamp(t, 0.0, 1.0);
  vec4 white = vec4(1.0, 1.0, 0.9, 1.0);
  vec4 yellow = vec4(1.0, 0.9, 0.3, 1.0);
  vec4 orange = vec4(1.0, 0.4, 0.0, 0.9);
  vec4 red = vec4(0.8, 0.1, 0.0, 0.7);
  vec4 darkRed = vec4(0.3, 0.0, 0.0, 0.0);
  
  if (t < 0.2) return mix(white, yellow, t * 5.0);
  else if (t < 0.4) return mix(yellow, orange, (t - 0.2) * 5.0);
  else if (t < 0.7) return mix(orange, red, (t - 0.4) * 3.33);
  else return mix(red, darkRed, (t - 0.7) * 3.33);
}

void main() {
  // Circular particle shape
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  
  if (dist > 0.5) discard;
  
  // Sharp center, soft edge
  float radialFade = 1.0 - smoothstep(0.1, 0.5, dist);
  
  // Hot color based on age
  vec4 color = fireGradient(vAge);
  
  // Apply radial fade
  color.a *= radialFade;
  
  // Fade out at end of life
  color.a *= vLife * vLife; // Quadratic fade for dramatic effect
  
  // Boost brightness
  color.rgb *= 1.5;
  
  gl_FragColor = color;
}
