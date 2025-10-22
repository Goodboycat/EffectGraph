/**
 * NaturalLanguageParser - Extracts effect parameters from natural language
 * Helps LLMs understand user intent and map to EffectGraph parameters
 */

export class NaturalLanguageParser {
  
  /**
   * Parse a natural language effect description
   * Returns structured parameters for EffectComposer
   */
  static parse(description) {
    const parsed = {
      effectType: 'projectile', // projectile, explosion, ambient, area
      elementType: 'energy', // fire, ice, electric, energy, physical, magic
      properties: {},
      components: [],
      behavior: {}
    };
    
    const lowerDesc = description.toLowerCase();
    
    // Detect effect type
    parsed.effectType = this.detectEffectType(lowerDesc);
    
    // Detect element/damage type
    parsed.elementType = this.detectElementType(lowerDesc);
    
    // Extract colors
    parsed.properties.color = this.extractColor(lowerDesc);
    parsed.properties.secondaryColor = this.extractSecondaryColor(lowerDesc);
    
    // Extract size
    parsed.properties.size = this.extractSize(lowerDesc);
    
    // Extract speed
    parsed.properties.speed = this.extractSpeed(lowerDesc);
    
    // Detect components
    parsed.components = this.detectComponents(lowerDesc);
    
    // Detect behaviors
    parsed.behavior = this.detectBehavior(lowerDesc);
    
    return parsed;
  }
  
  /**
   * Detect the main effect type
   */
  static detectEffectType(desc) {
    if (desc.match(/\b(ball|orb|sphere|projectile|bolt|shot|missile)\b/)) {
      return 'projectile';
    }
    if (desc.match(/\b(explosion|explode|blast|burst|impact)\b/)) {
      return 'explosion';
    }
    if (desc.match(/\b(aura|field|ambient|atmosphere|cloud)\b/)) {
      return 'ambient';
    }
    if (desc.match(/\b(area|zone|circle|ring)\b/)) {
      return 'area';
    }
    return 'projectile'; // default
  }
  
  /**
   * Detect element/damage type
   */
  static detectElementType(desc) {
    if (desc.match(/\b(fire|flame|burning|heat|inferno)\b/)) {
      return 'fire';
    }
    if (desc.match(/\b(ice|frost|frozen|cold|glacial)\b/)) {
      return 'ice';
    }
    if (desc.match(/\b(electric|lightning|thunder|shock|zap)\b/)) {
      return 'electric';
    }
    if (desc.match(/\b(dark|shadow|void|curse|necrotic)\b/)) {
      return 'dark';
    }
    if (desc.match(/\b(light|holy|radiant|divine|bright)\b/)) {
      return 'light';
    }
    if (desc.match(/\b(poison|toxic|acid|venom)\b/)) {
      return 'poison';
    }
    if (desc.match(/\b(energy|magic|arcane|mystical|power)\b/)) {
      return 'energy';
    }
    if (desc.match(/\b(physical|kinetic|force)\b/)) {
      return 'physical';
    }
    return 'energy'; // default
  }
  
  /**
   * Extract primary color
   */
  static extractColor(desc) {
    const colorMap = {
      'red': [1.0, 0.2, 0.2],
      'orange': [1.0, 0.5, 0.0],
      'yellow': [1.0, 0.9, 0.3],
      'green': [0.3, 1.0, 0.3],
      'blue': [0.3, 0.5, 1.0],
      'cyan': [0.3, 0.9, 1.0],
      'purple': [0.8, 0.3, 1.0],
      'pink': [1.0, 0.5, 0.9],
      'white': [1.0, 1.0, 1.0],
      'black': [0.1, 0.1, 0.1],
      'neon blue': [0.0, 0.8, 1.0],
      'neon green': [0.0, 1.0, 0.5],
      'neon pink': [1.0, 0.0, 0.8],
      'dark blue': [0.1, 0.2, 0.5],
      'dark red': [0.5, 0.1, 0.1],
      'dark purple': [0.4, 0.1, 0.5]
    };
    
    // Check for neon colors first (more specific)
    for (const [colorName, rgb] of Object.entries(colorMap)) {
      if (colorName.includes('neon') || colorName.includes('dark')) {
        if (desc.includes(colorName)) {
          return rgb;
        }
      }
    }
    
    // Check basic colors
    for (const [colorName, rgb] of Object.entries(colorMap)) {
      if (desc.includes(colorName)) {
        return rgb;
      }
    }
    
    // Element-based defaults
    if (desc.includes('fire')) return [1.0, 0.5, 0.2];
    if (desc.includes('ice')) return [0.7, 0.9, 1.0];
    if (desc.includes('electric')) return [0.8, 0.9, 1.0];
    if (desc.includes('poison')) return [0.4, 1.0, 0.3];
    
    return [0.5, 0.7, 1.0]; // default blue energy
  }
  
  /**
   * Extract secondary/shadow color
   */
  static extractSecondaryColor(desc) {
    // Look for "and" or "with" followed by another color
    const match = desc.match(/(?:and|with)\s+(\w+(?:\s+\w+)?)\s+(?:shadow|smoke|trail|glow)/);
    if (match) {
      const colorName = match[1];
      return this.extractColor(colorName);
    }
    
    // Default to darker version of primary
    const primary = this.extractColor(desc);
    return primary.map(c => c * 0.3);
  }
  
  /**
   * Extract size
   */
  static extractSize(desc) {
    if (desc.match(/\b(tiny|small|little)\b/)) return 0.2;
    if (desc.match(/\b(large|big|huge|massive|giant)\b/)) return 1.5;
    if (desc.match(/\b(medium|normal|regular)\b/)) return 0.5;
    return 0.5; // default
  }
  
  /**
   * Extract speed
   */
  static extractSpeed(desc) {
    if (desc.match(/\b(slow|slowly|gradual|gentle)\b/)) return 8;
    if (desc.match(/\b(fast|quick|rapid|swift)\b/)) return 25;
    if (desc.match(/\b(blazing|lightning|instant|supersonic)\b/)) return 40;
    return 15; // default
  }
  
  /**
   * Detect effect components
   */
  static detectComponents(desc) {
    const components = [];
    
    if (desc.match(/\b(trail|streak|tail|motion\s+blur)\b/)) {
      components.push('trail');
    }
    if (desc.match(/\b(glow|glowing|luminous|radiant|light)\b/)) {
      components.push('glow');
    }
    if (desc.match(/\b(smoke|vapor|mist|haze)\b/)) {
      components.push('smoke');
    }
    if (desc.match(/\b(fire|flame|burning)\b/)) {
      components.push('fire');
    }
    if (desc.match(/\b(spark|sparkle|glitter|shimmer)\b/)) {
      components.push('sparks');
    }
    if (desc.match(/\b(shockwave|wave|ripple|ring)\b/)) {
      components.push('shockwave');
    }
    if (desc.match(/\b(core|center|nucleus)\b/)) {
      components.push('core');
    }
    
    return components;
  }
  
  /**
   * Detect behavior/impact effects
   */
  static detectBehavior(desc) {
    const behavior = {
      onImpact: 'explode',
      explosion: {
        size: 'medium',
        type: 'burst'
      }
    };
    
    // Impact behavior
    if (desc.match(/\b(explode|explosion|blast|burst)\b/)) {
      behavior.onImpact = 'explode';
      
      // Explosion type
      if (desc.match(/\b(shockwave|wave|ripple)\b/)) {
        behavior.explosion.type = 'shockwave';
      }
      if (desc.match(/\b(flash|flare)\b/)) {
        behavior.explosion.type = 'flash';
      }
      
      // Explosion size
      if (desc.match(/\b(small|tiny|minor)\b/)) {
        behavior.explosion.size = 'small';
      } else if (desc.match(/\b(large|huge|massive|giant)\b/)) {
        behavior.explosion.size = 'large';
      }
    }
    
    if (desc.match(/\b(vanish|disappear|fade)\b/)) {
      behavior.onImpact = 'fade';
    }
    
    if (desc.match(/\b(stick|attach|embed)\b/)) {
      behavior.onImpact = 'stick';
    }
    
    // Trajectory
    if (desc.match(/\b(homing|tracking|seeking)\b/)) {
      behavior.trajectory = 'homing';
    }
    if (desc.match(/\b(arc|curve|parabola)\b/)) {
      behavior.trajectory = 'arc';
    }
    if (desc.match(/\b(straight|direct|linear)\b/)) {
      behavior.trajectory = 'linear';
    }
    
    return behavior;
  }
  
  /**
   * Generate a complete effect definition from natural language
   */
  static generateEffect(description) {
    const parsed = this.parse(description);
    
    // Build effect parameters
    const params = {
      name: this.generateName(description),
      ...parsed.properties,
      type: parsed.elementType
    };
    
    // Add component flags
    params.trail = parsed.components.includes('trail');
    params.glow = parsed.components.includes('glow');
    params.hasFireCore = parsed.components.includes('fire') || parsed.components.includes('core');
    
    // Add behavior
    params.onImpact = parsed.behavior.onImpact;
    
    if (parsed.behavior.explosion) {
      params.explosionRadius = parsed.behavior.explosion.size === 'small' ? 2.0 :
                               parsed.behavior.explosion.size === 'large' ? 6.0 : 4.0;
    }
    
    return params;
  }
  
  /**
   * Generate an effect name from description
   */
  static generateName(description) {
    // Take first few words and capitalize
    const words = description.split(/\s+/).slice(0, 3);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }
  
  /**
   * Generate AI prompt template for LLM
   */
  static generateAIPrompt(userInput) {
    return `
You are an expert VFX designer. Parse the following effect description and extract structured parameters:

User Request: "${userInput}"

Extract and return JSON with these fields:
{
  "effectType": "projectile|explosion|ambient|area",
  "elementType": "fire|ice|electric|energy|physical|magic|dark|light|poison",
  "properties": {
    "color": [r, g, b] // RGB 0-1 range,
    "secondaryColor": [r, g, b],
    "size": number, // 0.1-2.0
    "speed": number, // 5-40
    "lifetime": number // seconds
  },
  "components": ["trail", "glow", "smoke", "fire", "sparks", "shockwave", "core"],
  "behavior": {
    "onImpact": "explode|fade|stick",
    "explosion": {
      "size": "small|medium|large",
      "type": "burst|shockwave|flash"
    },
    "trajectory": "linear|arc|homing"
  }
}

Think step by step:
1. What is the main effect type? (projectile, explosion, etc.)
2. What element/damage type? (fire, ice, energy, etc.)
3. What are the colors? (primary and secondary)
4. What size and speed?
5. What components are mentioned? (trail, glow, smoke, etc.)
6. What happens on impact?

Return ONLY valid JSON, no explanation.
`;
  }
}

/**
 * Example usage for LLM integration:
 * 
 * const userInput = "I want an energy ball that when shot leaves a trail of blue neon smoke and then explodes as a circle wave";
 * const prompt = NaturalLanguageParser.generateAIPrompt(userInput);
 * 
 * // Send prompt to LLM (GPT-4, Claude, etc.)
 * const llmResponse = await callLLM(prompt);
 * const params = JSON.parse(llmResponse);
 * 
 * // Generate effect
 * const effect = EffectComposer.composeEnergyBall(params);
 */
