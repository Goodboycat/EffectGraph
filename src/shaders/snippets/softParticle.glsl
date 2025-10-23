// Soft particle depth fade to avoid hard edges with geometry
// Usage: float fade = softParticleFade(depthTexture, screenUV, particleDepth, softness);

float softParticleFade(sampler2D depthTexture, vec2 screenUV, float particleDepth, float softness) {
  float sceneDepth = texture2D(depthTexture, screenUV).r;
  float depthDiff = sceneDepth - particleDepth;
  return smoothstep(0.0, softness, depthDiff);
}

// Simplified soft particle without depth texture (distance-based)
float softParticleFadeSimple(float distanceToCenter, float particleSize) {
  float normalizedDist = distanceToCenter / particleSize;
  return 1.0 - smoothstep(0.5, 1.0, normalizedDist);
}

// Radial fade for point sprites
float radialFade(vec2 coord) {
  float dist = length(coord - vec2(0.5));
  return 1.0 - smoothstep(0.0, 0.5, dist);
}
