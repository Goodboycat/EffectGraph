## LLM Integration Guide for EffectGraph

**Creating AAA-Quality VFX with Natural Language**

This guide shows how to integrate EffectGraph with Large Language Models (GPT-4, Claude, Gemini, etc.) to generate production-quality visual effects from natural language descriptions.

---

## Quick Example

**User says:**
> "I want an energy ball that when shot leaves a trail of blue neon smoke and then explodes as a circle wave"

**LLM generates:**
```javascript
import { EffectComposer } from './src/ai/EffectComposer.js';

const effect = EffectComposer.composeEnergyBall({
  color: [0.3, 0.6, 1.0],          // Blue
  secondaryColor: [0.1, 0.2, 0.4],  // Dark blue
  speed: 15,
  size: 0.5,
  hasFireCore: true,
  trailType: 'neon'
});
```

**Result:** A complete, AAA-quality energy projectile with:
- ✅ Glowing energy core
- ✅ Blue fire particles
- ✅ Neon trail effect
- ✅ Dark shadow smoke
- ✅ Dynamic lighting
- ✅ Shockwave explosion on impact

---

## Integration Architecture

```
┌──────────────────┐
│   User Input     │ "Create a fire explosion..."
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│      LLM         │ GPT-4, Claude, Gemini
│   (Your API)     │
└────────┬─────────┘
         │ Structured JSON
         ▼
┌──────────────────┐
│ EffectComposer   │ High-level composition
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  CompositeEffect │ Complete VFX system
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Three.js       │ Rendered in browser
└──────────────────┘
```

---

## Step 1: Natural Language Parsing

Use `NaturalLanguageParser` to extract parameters from user input:

```javascript
import { NaturalLanguageParser } from './src/ai/NaturalLanguageParser.js';

const userInput = "Create a massive fire explosion with smoke and shockwave";
const parsed = NaturalLanguageParser.parse(userInput);

console.log(parsed);
// {
//   effectType: "explosion",
//   elementType: "fire",
//   properties: {
//     color: [1.0, 0.5, 0.2],
//     size: 1.5,
//     speed: 15
//   },
//   components: ["smoke", "shockwave"],
//   behavior: { onImpact: "explode" }
// }
```

---

## Step 2: LLM Prompt Engineering

### Recommended Prompt Template

```
You are an expert VFX designer working with the EffectGraph system.
The user wants to create a visual effect.

User Request: "{USER_INPUT}"

Analyze this request and generate JavaScript code using EffectComposer.
Available composers:
- EffectComposer.composeProjectile() - for projectiles, balls, bolts
- EffectComposer.composeExplosion() - for explosions, impacts
- EffectComposer.composeEnergyBall() - for energy projectiles with trails

Parameters to consider:
1. COLOR: What colors are mentioned? Convert to RGB [0-1]
2. SIZE: Is it tiny (0.2), small (0.3), medium (0.5), large (1.0), huge (1.5)?
3. SPEED: Is it slow (8), normal (15), fast (25), ultra-fast (40)?
4. COMPONENTS: Does it have trail, glow, smoke, fire, sparks, shockwave?
5. BEHAVIOR: What happens on impact? explode, fade, stick?

Think step-by-step:
1. Identify the main effect type (projectile or explosion)
2. Determine element type (fire, ice, energy, etc.)
3. Extract visual properties (colors, size, speed)
4. List all components mentioned
5. Define impact behavior

Return executable JavaScript code using EffectComposer.

Example output format:
```javascript
import { EffectComposer } from './src/ai/EffectComposer.js';

const effect = EffectComposer.composeProjectile({
  name: 'FireBolt',
  type: 'fire',
  color: [1.0, 0.5, 0.2],
  size: 0.4,
  speed: 20,
  trail: true,
  glow: true,
  onImpact: 'explode',
  explosionRadius: 3.0
});
```

Only return the code, no explanation.
```

---

## Step 3: Common Effect Patterns

### Pattern 1: Projectiles

```javascript
// Energy beam / laser
EffectComposer.composeProjectile({
  name: 'LaserBeam',
  type: 'energy',
  color: [1.0, 0.2, 0.2],  // Red
  size: 0.2,
  speed: 40,               // Very fast
  trail: true,
  trailLength: 2.0,        // Long trail
  glow: true,
  glowIntensity: 4.0,      // Bright
  onImpact: 'fade'         // No explosion
});

// Ice shard
EffectComposer.composeProjectile({
  name: 'IceShard',
  type: 'ice',
  color: [0.7, 0.9, 1.0],  // Light blue
  size: 0.3,
  speed: 18,
  trail: true,
  glow: false,
  onImpact: 'explode',
  explosionRadius: 2.0
});

// Poison bolt
EffectComposer.composeProjectile({
  name: 'PoisonBolt',
  type: 'poison',
  color: [0.4, 1.0, 0.3],  // Toxic green
  size: 0.35,
  speed: 12,
  trail: true,
  glow: true,
  onImpact: 'explode',
  explosionRadius: 3.5
});
```

### Pattern 2: Explosions

```javascript
// Small impact
EffectComposer.composeExplosion({
  name: 'SmallImpact',
  type: 'physical',
  color: [0.8, 0.6, 0.4],
  radius: 1.5,
  duration: 0.6,
  particleCount: 100,
  shockwave: false
});

// Massive fire explosion
EffectComposer.composeExplosion({
  name: 'InfernoBlast',
  type: 'fire',
  color: [1.0, 0.4, 0.1],
  radius: 6.0,
  duration: 2.0,
  particleCount: 500,
  shockwave: true
});

// Magic burst
EffectComposer.composeExplosion({
  name: 'MagicBurst',
  type: 'magic',
  color: [0.8, 0.3, 1.0],  // Purple
  radius: 4.0,
  duration: 1.5,
  particleCount: 300,
  shockwave: true
});
```

### Pattern 3: Complete Energy Ball (AAA Quality)

```javascript
EffectComposer.composeEnergyBall({
  color: [0.3, 0.6, 1.0],          // Primary: Blue
  secondaryColor: [0.1, 0.2, 0.4],  // Shadow: Dark blue
  speed: 15,
  size: 0.5,
  hasFireCore: true,                // Blue fire particles
  trailType: 'neon'                 // Neon glow trail
});
```

---

## Step 4: Material Presets

Tell the LLM about available material presets for realistic rendering:

```javascript
import { MaterialPresets } from './src/rendering/MaterialPresets.js';

// Available presets:
MaterialPresets.energy      // Glowing energy (default)
MaterialPresets.neon        // Sharp neon glow
MaterialPresets.fire        // Realistic fire with flicker
MaterialPresets.smoke       // Volumetric smoke
MaterialPresets.electric    // Electric arc/lightning
MaterialPresets.magic       // Mystical shimmer
MaterialPresets.darkSmoke   // Shadow/dark smoke
MaterialPresets.distortion  // Heat haze
```

Example usage in custom effects:
```javascript
rendering: {
  material: {
    preset: 'neon',  // Use neon preset
    blending: 'additive'
  }
}
```

---

## Step 5: Element Type Mapping

Teach the LLM these element associations:

| Element | Color Range | Effects | Preset |
|---------|------------|---------|--------|
| **Fire** | Orange-Red (1.0, 0.5, 0.2) → (1.0, 0.2, 0.0) | Upward motion, flickering | `fire` |
| **Ice** | Light Blue (0.7, 0.9, 1.0) → (0.5, 0.7, 1.0) | Sharp, crystalline | `energy` |
| **Electric** | Bright Blue-White (0.8, 0.9, 1.0) | Erratic, zapping | `electric` |
| **Energy** | Blue (0.3, 0.6, 1.0) | Smooth, glowing | `energy` |
| **Poison** | Toxic Green (0.4, 1.0, 0.3) | Bubbling, dripping | `magic` |
| **Dark** | Purple-Black (0.4, 0.1, 0.5) → (0.1, 0.0, 0.2) | Shadowy, ominous | `darkSmoke` |
| **Light** | Bright Yellow-White (1.0, 1.0, 0.9) | Radiant, pure | `energy` |
| **Magic** | Purple-Pink (0.8, 0.3, 1.0) → (1.0, 0.5, 0.9) | Shimmering, sparkles | `magic` |

---

## Step 6: Complete LLM Workflow

### Full Integration Example

```javascript
// 1. User input
const userRequest = "I want a massive fire explosion with smoke that rises slowly";

// 2. Send to LLM with prompt
const llmPrompt = `
${SYSTEM_PROMPT}

User Request: "${userRequest}"

Generate EffectGraph code.
`;

const llmResponse = await callYourLLM(llmPrompt);

// 3. LLM returns code
const generatedCode = llmResponse;
// "EffectComposer.composeExplosion({ ... })"

// 4. Execute safely
const effect = eval(generatedCode);

// 5. Add to scene
scene.add(effect.getObject3D());

// 6. Animate
function animate() {
  effect.update(deltaTime);
  renderer.render(scene, camera);
}
```

---

## Step 7: Safety & Validation

### Validate LLM Output

```javascript
function validateAndExecute(llmCode, userInput) {
  // 1. Check for malicious code
  if (llmCode.includes('require(') || 
      llmCode.includes('import(') ||
      llmCode.includes('eval(') ||
      llmCode.includes('Function(')) {
    console.error('Unsafe code detected');
    return null;
  }
  
  // 2. Ensure it uses EffectComposer
  if (!llmCode.includes('EffectComposer')) {
    console.error('Invalid effect code');
    return null;
  }
  
  // 3. Try to execute
  try {
    // Create safe evaluation context
    const context = {
      EffectComposer,
      NaturalLanguageParser
    };
    
    // Extract the composition call
    const match = llmCode.match(/EffectComposer\.\w+\({[\s\S]*?}\)/);
    if (!match) {
      throw new Error('Invalid effect format');
    }
    
    // Execute in controlled context
    const effectFunc = new Function('EffectComposer', `return ${match[0]}`);
    const effect = effectFunc(EffectComposer);
    
    return effect;
  } catch (error) {
    console.error('Effect generation failed:', error);
    
    // Fallback: use NaturalLanguageParser
    const params = NaturalLanguageParser.generateEffect(userInput);
    return EffectComposer.composeProjectile(params);
  }
}
```

---

## Step 8: Advanced Customization

### Teach LLM to Create Custom Layers

```javascript
// LLM can generate custom composite effects
{
  name: "CustomEffect",
  type: "composite",
  layers: [
    {
      name: "Layer1",
      enabled: true,
      effect: { /* particle system def */ }
    },
    {
      name: "Layer2",
      enabled: true,
      startDelay: 0.5,  // Delayed start
      effect: { /* another particle system */ }
    }
  ],
  movement: {
    type: "linear",
    velocity: [0, 0, 20]
  },
  lights: [{
    type: "point",
    color: [1, 0.5, 0.2],
    intensity: 2.0
  }]
}
```

---

## Example LLM Conversations

### Conversation 1: Simple Projectile

**User:** "Create a fast red laser"

**LLM Response:**
```javascript
EffectComposer.composeProjectile({
  name: 'RedLaser',
  type: 'energy',
  color: [1.0, 0.2, 0.2],
  size: 0.15,
  speed: 45,
  trail: true,
  trailLength: 3.0,
  glow: true,
  glowIntensity: 5.0,
  onImpact: 'fade'
})
```

### Conversation 2: Complex Effect

**User:** "I want an ice attack that shoots forward, leaving frost particles, and freezes the target with crystalline shards"

**LLM Response:**
```javascript
EffectComposer.composeProjectile({
  name: 'FrostBolt',
  type: 'ice',
  color: [0.7, 0.9, 1.0],
  secondaryColor: [0.5, 0.7, 0.9],
  size: 0.4,
  speed: 18,
  trail: true,
  trailLength: 1.5,
  glow: true,
  glowIntensity: 2.0,
  onImpact: 'explode',
  explosionRadius: 2.5,
  explosionDuration: 1.5
})
```

### Conversation 3: The Example Effect

**User:** "I want an energy ball that when shot leaves a trail of blue neon smoke and then explodes as a circle wave"

**LLM Response:**
```javascript
EffectComposer.composeEnergyBall({
  color: [0.3, 0.6, 1.0],
  secondaryColor: [0.1, 0.2, 0.4],
  speed: 15,
  size: 0.5,
  hasFireCore: true,
  trailType: 'neon'
})
```

---

## Performance Considerations

### Particle Count Guidelines

Tell the LLM to use these particle counts:

| Device | Small Effect | Medium Effect | Large Effect |
|--------|--------------|---------------|--------------|
| Mobile | 50-100 | 100-200 | 200-300 |
| Desktop | 100-300 | 300-700 | 700-1500 |
| High-End | 300-1000 | 1000-2000 | 2000-5000 |

### Force Optimization

Expensive forces (sorted by cost):
1. Turbulence (multiple noise samples)
2. Vortex (vector math)
3. Attractor (distance calculations)
4. Drag (velocity operations)
5. Gravity (simple addition - cheapest)

Recommend using 2-4 forces per effect maximum.

---

## Testing Your LLM Integration

### Test Suite

```javascript
const testCases = [
  "Create a fireball",
  "I want a blue energy beam",
  "Make a massive explosion with smoke",
  "Lightning bolt that zaps",
  "Poison cloud that spreads",
  "Holy light that heals",
  "Dark shadow that corrupts"
];

for (const testCase of testCases) {
  const effect = await generateWithLLM(testCase);
  console.log(`Test: ${testCase}`);
  console.log(`Result:`, effect ? '✅ Success' : '❌ Failed');
}
```

---

## Deployment

### Production Checklist

- [ ] LLM API configured with proper authentication
- [ ] Prompt templates tested and optimized
- [ ] Safety validation implemented
- [ ] Fallback system ready (NaturalLanguageParser)
- [ ] Performance monitoring active
- [ ] User input sanitization
- [ ] Rate limiting for LLM calls
- [ ] Caching for common effects
- [ ] Error handling and user feedback

---

## Summary

EffectGraph + LLM creates a powerful system where:

1. **Users** describe effects in natural language
2. **LLM** understands intent and generates parameters
3. **EffectComposer** creates production-quality VFX
4. **Three.js** renders in real-time

This enables **anyone** to create AAA-quality visual effects without:
- WebGL knowledge
- Shader programming
- Particle system expertise
- VFX design experience

The system handles all technical complexity while maintaining professional-grade quality.

---

**Ready to integrate? Start with `EffectComposer.composeEnergyBall()` as your example!**
