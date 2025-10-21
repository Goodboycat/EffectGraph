# EffectGraph Visual Showcase 🎨

## 🔥 Fire Effect

**Visual Characteristics:**
- Bright yellow-orange core flames
- Upward motion with buoyancy
- Turbulent, organic movement
- Gradual fade to dark red
- Additive blending for glow

**Physics:**
```
Forces: Buoyancy (upward) + Turbulence (chaos) + Drag (air resistance)
Emission: Cone shape, 50-80 particles/sec
Lifetime: 0.8-1.2 seconds
```

**Color Progression:**
```
t=0.0: Bright Yellow (1.0, 0.9, 0.5)
t=0.5: Orange (1.0, 0.4, 0.1)
t=1.0: Dark Red (0.2, 0.05, 0.0)
```

**Use Cases:**
- Campfires, torches
- Building fires
- Magical fire spells
- Flame throwers

---

## 💨 Smoke Effect

**Visual Characteristics:**
- Gray/black colored particles
- Slow upward drift
- Expands over lifetime
- Multiply blending for volume
- Soft opacity fade

**Physics:**
```
Forces: Buoyancy (gentle) + Turbulence (high) + Drag (moderate)
Emission: Wide cone, 20 particles/sec
Lifetime: 2.0-3.0 seconds
```

**Scale Progression:**
```
t=0.0: Small (0.3)
t=1.0: Large (1.5) - 5x growth
```

**Use Cases:**
- Chimney smoke
- Steam vents
- Fog effects
- Fire aftermath

---

## 💥 Explosion Effect

**Visual Characteristics:**
- Burst emission (instant)
- Radial outward velocity
- Flash → fire → smoke colors
- Quick expansion then fade
- Additive blending for intensity

**Physics:**
```
Forces: Gravity (pulls debris down) + Drag (slows quickly)
Emission: Sphere burst, 200 particles at once
Lifetime: 0.5-1.5 seconds
```

**Color Progression:**
```
t=0.0: Bright White (1.0, 1.0, 0.8) - Flash
t=0.1: Orange (1.0, 0.6, 0.2) - Fire
t=0.3: Red (0.8, 0.3, 0.1) - Embers
t=1.0: Dark Gray (0.2, 0.2, 0.2) - Smoke
```

**Use Cases:**
- Bomb explosions
- Impact effects
- Destruction sequences
- Combat VFX

---

## ✨ Sparkles Effect

**Visual Characteristics:**
- Small, bright particles
- Rainbow color cycling
- Pulsing scale animation
- Gentle floating motion
- Additive blending for glow

**Physics:**
```
Forces: Turbulence (gentle) + Drag (light)
Emission: Sphere volume, 30 particles/sec
Lifetime: 1.0-2.0 seconds
```

**Color Progression:**
```
t=0.0: Golden Yellow (1.0, 0.9, 0.3)
t=0.5: Cyan Blue (0.5, 0.8, 1.0)
t=1.0: Pink Magenta (1.0, 0.5, 0.9)
```

**Scale Animation:**
```
t=0.0: Small (0.05)
t=0.3: Large (0.2) - Peak
t=1.0: Small (0.05) - Pulse out
```

**Use Cases:**
- Magical effects
- Fairy dust
- Achievement notifications
- Decorative ambient

---

## 🎯 Technical Breakdown

### Rendering Performance

| Effect | Particles | FPS (Desktop) | FPS (Mobile) |
|--------|-----------|---------------|--------------|
| Fire | 300-500 | 60 | 45-60 |
| Smoke | 100-200 | 60 | 50-60 |
| Explosion | 200 (burst) | 60 | 55-60 |
| Sparkles | 200-300 | 60 | 50-60 |

### Blending Modes Explained

**Additive** (Fire, Explosion, Sparkles):
```
Result = Source + Destination
```
- Creates glowing, bright effects
- Overlapping particles intensify
- Best for light sources

**Normal** (Smoke):
```
Result = Source.alpha * Source + (1 - Source.alpha) * Destination
```
- Standard transparency
- Natural layering
- Best for opaque objects

**Multiply** (Dense Smoke):
```
Result = Source * Destination
```
- Darkens underlying pixels
- Creates volumetric appearance
- Best for shadows/fog

### Physics Forces Comparison

| Force | Effect on Fire | Effect on Smoke | Effect on Explosion |
|-------|----------------|-----------------|---------------------|
| Gravity | ❌ Not used | ❌ Not used | ✅ Pulls debris down |
| Buoyancy | ✅ Upward rise | ✅ Gentle lift | ❌ Not used |
| Turbulence | ✅ Flicker | ✅ Swirl | ❌ Not used |
| Drag | ✅ Air resistance | ✅ Slowing | ✅ Quick stop |
| Vortex | ❌ Not used | ❌ Not used | ❌ Not used |

---

## 🎨 Color Theory in VFX

### Fire Colors (Blackbody Radiation)

Real fire follows blackbody radiation:
```
Temperature → Color
1000K → Dark Red (0.2, 0.05, 0.0)
2000K → Orange (1.0, 0.4, 0.1)
3000K → Yellow (1.0, 0.9, 0.5)
```

EffectGraph fire effect mimics this scientifically!

### Smoke Colors (Light Scattering)

Smoke color depends on:
- **Density**: Thicker = darker
- **Light source**: Illuminated vs shadowed
- **Particles**: Soot (black) vs steam (white)

### Magical Colors (Artistic License)

Magic has no physical basis, so use:
- **Saturated colors**: High purity (avoid gray)
- **Complementary pairs**: Purple ↔ Yellow, Blue ↔ Orange
- **Gradients**: Smooth transitions for elegance

---

## 💡 Effect Composition Patterns

### Fire + Smoke = Realistic Campfire

```javascript
{
  "type": "composite",
  "layers": [
    { "effect": "fire", "position": [0, 0, 0] },
    { "effect": "smoke", "position": [0, 0.5, 0] }
  ]
}
```

### Explosion → Smoke Trail

```javascript
{
  "timeline": [
    { "time": 0.0, "effect": "explosion" },
    { "time": 0.3, "effect": "smoke", "duration": 5.0 }
  ]
}
```

### Sparkles + Vortex = Magical Portal

```javascript
{
  "effect": "sparkles",
  "forces": [
    { "type": "vortex", "strength": 10, "axis": [0, 1, 0] }
  ]
}
```

---

## 📊 Performance Optimization Tips

### 1. LOD (Level of Detail)

```javascript
"optimization": {
  "lod": [
    { "distance": 0, "particleCount": 1.0 },    // Full quality
    { "distance": 20, "particleCount": 0.5 },   // Half particles
    { "distance": 50, "particleCount": 0.2 }    // Distant detail
  ]
}
```

### 2. Particle Count Tuning

| Device | Max Particles | Recommended |
|--------|---------------|-------------|
| Mobile | 500 | 300 |
| Desktop | 5000 | 2000 |
| High-End | 20000 | 10000 |

### 3. Force Optimization

Expensive forces (sorted by cost):
1. **Turbulence** - Multiple noise samples
2. **Vortex** - Vector math per particle
3. **Attractor** - Distance calculations
4. **Drag** - Velocity magnitude
5. **Gravity** - Simple addition (cheapest)

Use fewer, simpler forces for mobile!

### 4. Blending Mode Impact

| Mode | GPU Cost | Use Case |
|------|----------|----------|
| Normal | Low | Opaque objects |
| Additive | Medium | Glowing effects |
| Multiply | Medium | Shadows/fog |
| Custom | High | Special cases |

---

## 🎓 Advanced Techniques

### Curve Design Tips

**Smooth Fade In/Out:**
```javascript
{
  "keyframes": [
    { "time": 0.0, "value": 0.0, "interpolation": "cubic" },
    { "time": 0.15, "value": 1.0, "interpolation": "cubic" },
    { "time": 0.85, "value": 1.0, "interpolation": "cubic" },
    { "time": 1.0, "value": 0.0, "interpolation": "cubic" }
  ]
}
```

**Pop Effect (Sudden Change):**
```javascript
{
  "keyframes": [
    { "time": 0.0, "value": 0.1, "interpolation": "step" },
    { "time": 0.5, "value": 2.0, "interpolation": "step" },
    { "time": 1.0, "value": 0.1, "interpolation": "cubic" }
  ]
}
```

**Oscillation (Pulse):**
```javascript
{
  "keyframes": [
    { "time": 0.00, "value": 1.0, "interpolation": "cubic" },
    { "time": 0.25, "value": 1.5, "interpolation": "cubic" },
    { "time": 0.50, "value": 1.0, "interpolation": "cubic" },
    { "time": 0.75, "value": 1.5, "interpolation": "cubic" },
    { "time": 1.00, "value": 1.0, "interpolation": "cubic" }
  ]
}
```

---

## 🌟 Visual Design Principles

### 1. Contrast
- Bright effects need dark backgrounds
- Use complementary colors
- Vary particle sizes

### 2. Motion
- Fast motion = high energy
- Slow motion = calm/magical
- Erratic motion = chaos

### 3. Timing
- Quick effects = impact/surprise
- Long effects = ambient/atmosphere
- Synchronized = rhythm

### 4. Layering
- Background: Large, slow particles
- Midground: Medium particles
- Foreground: Small, fast particles

---

## 🎬 Production Use Cases

### Game Development
- Combat effects (explosions, impacts)
- Environmental effects (weather, fire)
- Magical abilities (spells, auras)
- UI feedback (achievements, upgrades)

### Web Applications
- Loading indicators (sparkles, smoke)
- Success/error states (explosions, glow)
- Interactive elements (hover effects)
- Background ambiance (particles, fog)

### Film/Animation
- Concept visualization
- Previz (pre-visualization)
- Real-time rendering
- Interactive installations

---

## 🚀 Quick Reference

### Effect Selection Guide

| Need | Effect | Customization |
|------|--------|---------------|
| Warm light source | Fire | Increase emission rate |
| Atmospheric volume | Smoke | Increase scale curve |
| High impact moment | Explosion | Increase particle count |
| Magical ambiance | Sparkles | Adjust color palette |

### Force Selection Guide

| Motion Type | Force | Parameters |
|-------------|-------|------------|
| Upward | Buoyancy | strength: 1-5 |
| Downward | Gravity | strength: 5-15 |
| Spiral | Vortex | radius: 3-10 |
| Chaotic | Turbulence | octaves: 3-5 |
| Slowing | Drag | coefficient: 0.1-0.5 |

---

**Experiment with the live demo and create amazing effects!** 🎨

🔗 **Live Demo**: https://3000-i8v23ghfb0sq90soxac0e-a402f90a.sandbox.novita.ai
