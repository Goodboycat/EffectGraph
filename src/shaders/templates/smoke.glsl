// Smoke particle shader template
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
  
  // Size increases over time for smoke expansion
  float sizeMultiplier = 1.0 + age * 2.0;
  gl_PointSize = particleSize * sizeMultiplier * (300.0 / -mvPosition.z);
}

// === FRAGMENT SHADER ===
#FRAGMENT
precision mediump float;

varying float vAge;
varying vec4 vCustomData;
varying float vLife;

uniform float time;

vec4 smokeGradient(float t) {
  t = clamp(t, 0.0, 1.0);
  vec4 white = vec4(0.9, 0.9, 0.9, 0.8);
  vec4 gray = vec4(0.5, 0.5, 0.5, 0.4);
  vec4 transparent = vec4(0.3, 0.3, 0.3, 0.0);
  
  if (t < 0.5) return mix(white, gray, t * 2.0);
  else return mix(gray, transparent, (t - 0.5) * 2.0);
}

void main() {
  // Circular particle shape
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  
  if (dist > 0.5) discard;
  
  // Soft edge
  float radialFade = 1.0 - smoothstep(0.2, 0.5, dist);
  
  // Color based on age
  vec4 color = smokeGradient(vAge);
  
  // Apply radial fade
  color.a *= radialFade;
  
  // Fade out at end of life
  color.a *= vLife;
  
  gl_FragColor = color;
}
