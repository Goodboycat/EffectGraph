# AI Integration Guide for EffectGraph

This document provides detailed guidance for AI systems to generate and modify EffectGraph VFX definitions.

## 📋 Table of Contents

1. [Input/Output Format](#inputoutput-format)
2. [Semantic Understanding Requirements](#semantic-understanding-requirements)
3. [Prompt Templates](#prompt-templates)
4. [Constraint Satisfaction](#constraint-satisfaction)
5. [Common Patterns](#common-patterns)
6. [Error Handling](#error-handling)

## 🔄 Input/Output Format

### Input: Natural Language

AI should accept descriptions like:

```
"Create a campfire effect with realistic flames and smoke"
"Magical portal with swirling purple energy"
"Explosion with debris flying outward"
"Gentle snowfall covering the scene"
"Fountain water spray with splashes"
```

### Output: EffectGraph JSON

```json
{
  "name": "string",
  "type": "particle",
  "emitter": { },
  "particles": { },
  "forces": [ ],
  "overLifetime": { },
  "rendering": { }
}
```

## 🧠 Semantic Understanding Requirements

### Physical Phenomena Mapping

| Natural Language | Physics Translation |
|-----------------|-------------------|
| "rising" / "floating upward" | Buoyancy force (positive) |
| "falling" / "dropping" | Gravity force |
| "slowing down" / "air resistance" | Drag force |
| "swirling" / "spiraling" | Vortex force |
| "chaotic" / "turbulent" | Turbulence force |
| "attracted to" / "pulled toward" | Attractor force |
| "blown by wind" | Wind force |

### Visual Appearance Mapping

| Description | Rendering Settings |
|------------|-------------------|
| "bright" / "glowing" | Additive blending, high opacity |
| "smoky" / "cloudy" | Multiply blending, low opacity |
| "transparent" / "see-through" | Normal blending, opacity < 0.5 |
| "solid" / "opaque" | Normal blending, opacity = 1.0 |

### Color Palette Associations

| Effect Type | Color Range |
|------------|------------|
| Fire | Yellow (1.0, 0.9, 0.3) → Orange (1.0, 0.5, 0.1) → Red (0.8, 0.2, 0.0) |
| Smoke | Light Gray (0.3, 0.3, 0.3) → Dark Gray (0.1, 0.1, 0.1) |
| Water | White (1.0, 1.0, 1.0) → Cyan (0.4, 0.8, 1.0) |
| Magic | Violet (0.8, 0.3, 1.0) → Cyan (0.3, 0.8, 1.0) |
| Electricity | White (1.0, 1.0, 1.0) → Blue (0.5, 0.7, 1.0) |
| Poison | Green (0.3, 1.0, 0.3) → Yellow-Green (0.6, 1.0, 0.3) |

### Temporal Characteristics

| Duration Description | Lifetime Range |
|---------------------|---------------|
| "brief" / "quick" / "flash" | 0.1 - 0.5 seconds |
| "short" / "fast" | 0.5 - 1.5 seconds |
| "normal" / "medium" | 1.5 - 3.0 seconds |
| "long" / "slow" | 3.0 - 5.0 seconds |
| "persistent" / "ambient" | 5.0 - 10.0 seconds |

## 📝 Prompt Templates

### Template 1: Basic Effect Generation

```
I need an EffectGraph JSON definition with these requirements:

Effect Type: [fire/explosion/water/magic/etc]
Intensity: [low/medium/high/extreme]
Primary Motion: [upward/outward/swirling/falling/floating]
Visual Style: [realistic/stylized/cartoon/magical]
Duration: [brief/medium/long]
Color Scheme: [warm/cool/monochrome/vibrant]

Generate a complete, valid EffectGraph JSON with:
1. Appropriate emitter shape and rate
2. Realistic physics forces
3. Smooth property curves (scale, color, opacity)
4. Optimized particle count
5. Correct blending mode
```

### Template 2: Modify Existing Effect

```
Given this EffectGraph effect:
[PASTE EXISTING JSON]

Modify it to:
- [Change request 1]
- [Change request 2]
- [Change request 3]

Ensure all modifications maintain:
- Physical plausibility
- Performance constraints
- Visual coherence
```

### Template 3: Composite Effect

```
Create a composite effect combining:
1. [Sub-effect 1]: [description]
2. [Sub-effect 2]: [description]
3. [Sub-effect 3]: [description]

Layer order: [order description]
Synchronization: [how effects relate temporally]
```

## 🎯 Constraint Satisfaction

### Performance Constraints

```javascript
{
  // Particle count limits
  maxParticles_mobile: 500,
  maxParticles_desktop: 2000,
  maxParticles_highEnd: 10000,
  
  // Emission rate limits (particles/second)
  emissionRate_min: 1,
  emissionRate_max: 500,
  
  // Force calculation limits
  maxForces: 5,  // More forces = more CPU cost
  
  // Lifetime limits
  lifetime_min: 0.1,
  lifetime_max: 10.0
}
```

### Physical Constraints

```javascript
{
  // Velocity limits (units/second)
  velocity_min: -100,
  velocity_max: 100,
  
  // Force strength limits
  gravity: [0, 50],      // m/s²
  drag: [0, 2],          // coefficient
  turbulence: [0, 10],   // amplitude
  vortex: [0, 20],       // strength
  
  // Scale limits
  scale_min: 0.01,
  scale_max: 10.0
}
```

### Visual Constraints

```javascript
{
  // Color values (RGB)
  color_min: 0.0,
  color_max: 1.0,
  
  // Opacity
  opacity_min: 0.0,
  opacity_max: 1.0,
  
  // Keyframe requirements
  minKeyframes: 2,        // Start and end minimum
  maxKeyframes: 10,       // Complexity limit
  
  // Time ordering
  keyframeTimesIncreasing: true,
  keyframeTimeRange: [0.0, 1.0]
}
```

## 🎨 Common Patterns

### Pattern 1: Continuous Ambient Effect

```javascript
{
  "emitter": {
    "rate": { "type": "constant", "value": 20-50 }
  },
  "particles": {
    "lifetime": { "type": "uniform", "min": 3.0, "max": 5.0 }
  },
  "forces": [
    { "type": "drag", "strength": 0.1-0.3 }  // Slow, gentle motion
  ]
}
```

### Pattern 2: Burst Effect (Explosion, Impact)

```javascript
{
  "emitter": {
    "rate": { "type": "constant", "value": 0 },
    "burst": [{ "time": 0, "count": 100-500 }]
  },
  "particles": {
    "lifetime": { "type": "uniform", "min": 0.5, "max": 1.5 }
  },
  "forces": [
    { "type": "gravity", "strength": 9.8 },
    { "type": "drag", "strength": 0.5 }  // Quick slowdown
  ]
}
```

### Pattern 3: Upward Flow (Fire, Steam)

```javascript
{
  "particles": {
    "initialVelocity": {
      "type": "normal",
      "mean": [0, 2-5, 0],      // Primarily upward
      "stddev": [0.5, 0.5, 0.5] // Some randomness
    }
  },
  "forces": [
    { "type": "buoyancy", "strength": 2-5 },  // Upward force
    { "type": "turbulence", "strength": 0.5 }  // Organic motion
  ]
}
```

### Pattern 4: Vortex/Spiral

```javascript
{
  "emitter": {
    "shape": "sphere",
    "radius": 2-5
  },
  "forces": [
    {
      "type": "vortex",
      "strength": 5-15,
      "parameters": {
        "center": [0, 0, 0],
        "axis": [0, 1, 0],  // Y-axis spiral
        "radius": 3-10
      }
    }
  ]
}
```

### Pattern 5: Fade In/Out

```javascript
{
  "overLifetime": {
    "opacity": {
      "keyframes": [
        { "time": 0.0, "value": 0.0, "interpolation": "cubic" },
        { "time": 0.2, "value": 1.0, "interpolation": "cubic" },
        { "time": 0.8, "value": 1.0, "interpolation": "cubic" },
        { "time": 1.0, "value": 0.0, "interpolation": "cubic" }
      ]
    }
  }
}
```

## 🔍 Validation Rules

### Rule 1: Time Ordering

```javascript
// ✅ Correct
"keyframes": [
  { "time": 0.0, ... },
  { "time": 0.5, ... },
  { "time": 1.0, ... }
]

// ❌ Incorrect (times not in order)
"keyframes": [
  { "time": 0.5, ... },
  { "time": 0.0, ... },
  { "time": 1.0, ... }
]
```

### Rule 2: Required Fields

```javascript
// ✅ Complete effect
{
  "name": "MyEffect",           // Required
  "type": "particle",           // Required
  "particles": {                // Required for particle effects
    "maxCount": 1000,          // Required
    "lifetime": { ... }         // Required
  },
  "emitter": { ... }            // Required for particle effects
}
```

### Rule 3: Distribution Validity

```javascript
// ✅ Valid distributions
{ "type": "constant", "value": 5 }
{ "type": "uniform", "min": 5, "max": 10 }  // min < max
{ "type": "normal", "mean": 10, "stddev": 2 }

// ❌ Invalid
{ "type": "uniform", "min": 10, "max": 5 }  // min > max (WRONG)
```

### Rule 4: Force Parameters

```javascript
// ✅ Vortex with required parameters
{
  "type": "vortex",
  "strength": 10,
  "parameters": {
    "center": [0, 0, 0],   // Required
    "axis": [0, 1, 0],     // Required
    "radius": 5.0          // Required
  }
}
```

## ⚠️ Error Handling

### Common Errors & Fixes

#### Error 1: Particle Count Too High

```javascript
// ❌ Problem
"maxCount": 100000  // Too many, will crash

// ✅ Solution
"maxCount": 2000,   // Reasonable for desktop
"optimization": {
  "lod": [
    { "distance": 0, "particleCount": 1.0 },
    { "distance": 50, "particleCount": 0.5 }
  ]
}
```

#### Error 2: Extreme Velocities

```javascript
// ❌ Problem
"initialVelocity": {
  "type": "uniform",
  "min": [-1000, -1000, -1000],  // Too fast!
  "max": [1000, 1000, 1000]
}

// ✅ Solution
"initialVelocity": {
  "type": "uniform",
  "min": [-5, -5, -5],
  "max": [5, 5, 5]
}
```

#### Error 3: No Visual Change

```javascript
// ❌ Problem (opacity stays at 0)
"overLifetime": {
  "opacity": {
    "keyframes": [
      { "time": 0.0, "value": 0.0 },
      { "time": 1.0, "value": 0.0 }  // Never visible!
    ]
  }
}

// ✅ Solution (fade in and out)
"overLifetime": {
  "opacity": {
    "keyframes": [
      { "time": 0.0, "value": 0.0 },
      { "time": 0.2, "value": 1.0 },  // Visible
      { "time": 0.8, "value": 1.0 },
      { "time": 1.0, "value": 0.0 }
    ]
  }
}
```

## 🎓 Training Recommendations

### Dataset Structure

For training AI models on EffectGraph:

```
dataset/
├── fire/
│   ├── campfire.json
│   ├── torch.json
│   ├── explosion.json
│   └── descriptions.txt
├── water/
│   ├── fountain.json
│   ├── rain.json
│   ├── splash.json
│   └── descriptions.txt
└── magic/
    ├── portal.json
    ├── sparkles.json
    ├── energy.json
    └── descriptions.txt
```

### Input-Output Pairs

```
Input: "Create a small campfire with flickering flames"
Output: [fire effect JSON with modest scale and emission rate]

Input: "Massive explosion with debris and shockwave"
Output: [explosion effect JSON with high emission burst and gravity]

Input: "Gentle magical sparkles floating around"
Output: [sparkles effect JSON with slow motion and color variation]
```

### Evaluation Metrics

- **Physical Plausibility** - Do forces make sense?
- **Visual Coherence** - Do colors/blending match effect type?
- **Performance** - Is particle count reasonable?
- **Completeness** - Are all required fields present?
- **Temporal Smoothness** - Are curves smooth and natural?

---

## 📚 Reference Implementation

See `/src/examples/` for production-quality effect definitions that can serve as training data or reference implementations.

---

**For questions or contributions to AI integration, please open an issue on GitHub.**
