// Magic swirl particle shader template
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
varying vec3 vPosition;

void main() {
  vAge = age;
  vCustomData = customData;
  vLife = 1.0 - age;
  vPosition = position;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Pulsing size
  float pulse = 0.8 + 0.4 * sin(time * 3.0 + customData.x * 10.0);
  float sizeMultiplier = pulse * (1.0 + age * 0.5);
  gl_PointSize = particleSize * sizeMultiplier * (300.0 / -mvPosition.z);
}

// === FRAGMENT SHADER ===
#FRAGMENT
precision mediump float;

varying float vAge;
varying vec4 vCustomData;
varying float vLife;
varying vec3 vPosition;

uniform float time;

vec4 magicGradient(float t, float hueShift) {
  t = clamp(t, 0.0, 1.0);
  
  // HSV to RGB conversion
  float h = mod(t + hueShift, 1.0);
  float s = 0.8;
  float v = 1.0;
  
  float c = v * s;
  float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
  float m = v - c;
  
  vec3 rgb;
  if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
  else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
  else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
  else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
  else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
  else rgb = vec3(c, 0.0, x);
  
  return vec4(rgb + m, 0.9 - t * 0.5);
}

void main() {
  // Circular particle shape
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  
  if (dist > 0.5) discard;
  
  // Glowing core
  float glow = 1.0 - smoothstep(0.0, 0.5, dist);
  glow = pow(glow, 0.5);
  
  // Color shifts over time
  float hueShift = time * 0.1 + vCustomData.x;
  vec4 color = magicGradient(vAge, hueShift);
  
  // Apply glow
  color.a *= glow;
  color.rgb *= 1.0 + glow * 0.5;
  
  // Fade based on life
  color.a *= vLife;
  
  // Add sparkle effect
  float sparkle = sin(time * 10.0 + vCustomData.y * 20.0) * 0.3 + 0.7;
  color.rgb *= sparkle;
  
  gl_FragColor = color;
}
