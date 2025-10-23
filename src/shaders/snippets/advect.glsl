// Velocity advection and integration
// Usage: vec3 newPos = advect(position, velocity, deltaTime);

vec3 advect(vec3 position, vec3 velocity, float dt) {
  return position + velocity * dt;
}

// Semi-implicit Euler integration (more stable)
vec3 advectSemiImplicit(vec3 position, vec3 velocity, vec3 acceleration, float dt) {
  vec3 newVelocity = velocity + acceleration * dt;
  return position + newVelocity * dt;
}

// Apply drag/damping
vec3 applyDrag(vec3 velocity, float drag, float dt) {
  float damping = exp(-drag * dt);
  return velocity * damping;
}

// Apply gravity
vec3 applyGravity(vec3 velocity, vec3 gravity, float dt) {
  return velocity + gravity * dt;
}
