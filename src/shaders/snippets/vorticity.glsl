// Vorticity confinement for swirling effects
// Usage: vec3 force = vorticityConfinement(position, velocity, strength);

// Simplified vorticity calculation
vec3 vorticityConfinement(vec3 position, vec3 velocity, float strength) {
  // Create circular motion around Y axis
  vec3 center = vec3(0.0, position.y, 0.0);
  vec3 toCenter = center - position;
  float dist = length(toCenter.xz);
  
  if (dist < 0.001) return vec3(0.0);
  
  // Perpendicular vector for rotation
  vec3 tangent = normalize(vec3(-toCenter.z, 0.0, toCenter.x));
  
  // Apply force proportional to distance
  float forceMag = strength * (1.0 / (1.0 + dist));
  return tangent * forceMag;
}

// Vorticity with custom axis
vec3 vorticityAroundAxis(vec3 position, vec3 axis, vec3 center, float strength) {
  vec3 toCenter = position - center;
  vec3 tangent = cross(axis, toCenter);
  float dist = length(toCenter);
  
  if (dist < 0.001) return vec3(0.0);
  
  return normalize(tangent) * strength / (1.0 + dist);
}
