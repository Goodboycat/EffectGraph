// Color ramp/gradient utilities
// Usage: vec4 color = evaluateColorRamp(t, stops, colors, numStops);

// Evaluate color ramp with linear interpolation
vec4 evaluateColorRamp(float t, float stops[16], vec4 colors[16], int numStops) {
  t = clamp(t, 0.0, 1.0);
  
  if (numStops == 0) return vec4(1.0);
  if (numStops == 1) return colors[0];
  
  // Find which segment we're in
  for (int i = 0; i < 15; i++) {
    if (i >= numStops - 1) break;
    
    if (t >= stops[i] && t <= stops[i + 1]) {
      float segmentT = (t - stops[i]) / (stops[i + 1] - stops[i]);
      return mix(colors[i], colors[i + 1], segmentT);
    }
  }
  
  // If we get here, return last color
  return colors[numStops - 1];
}

// Simple 2-color gradient
vec4 gradient2(vec4 colorA, vec4 colorB, float t) {
  return mix(colorA, colorB, clamp(t, 0.0, 1.0));
}

// 3-color gradient (start -> middle -> end)
vec4 gradient3(vec4 colorA, vec4 colorB, vec4 colorC, float t) {
  t = clamp(t, 0.0, 1.0);
  if (t < 0.5) {
    return mix(colorA, colorB, t * 2.0);
  } else {
    return mix(colorB, colorC, (t - 0.5) * 2.0);
  }
}

// Fire gradient (black -> red -> orange -> yellow -> white)
vec4 fireGradient(float t) {
  t = clamp(t, 0.0, 1.0);
  vec4 black = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 red = vec4(1.0, 0.0, 0.0, 0.5);
  vec4 orange = vec4(1.0, 0.5, 0.0, 0.8);
  vec4 yellow = vec4(1.0, 1.0, 0.3, 1.0);
  
  if (t < 0.33) return mix(black, red, t * 3.0);
  else if (t < 0.66) return mix(red, orange, (t - 0.33) * 3.0);
  else return mix(orange, yellow, (t - 0.66) * 3.0);
}

// Smoke gradient (white -> gray -> transparent)
vec4 smokeGradient(float t) {
  t = clamp(t, 0.0, 1.0);
  vec4 white = vec4(0.9, 0.9, 0.9, 0.8);
  vec4 gray = vec4(0.5, 0.5, 0.5, 0.4);
  vec4 transparent = vec4(0.3, 0.3, 0.3, 0.0);
  
  if (t < 0.5) return mix(white, gray, t * 2.0);
  else return mix(gray, transparent, (t - 0.5) * 2.0);
}
