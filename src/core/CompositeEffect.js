/**
 * CompositeEffect - Orchestrates multiple particle systems with timing and events
 * Enables complex AAA-quality effects like energy balls with trails and explosions
 */

import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem.js';

export class CompositeEffect {
  constructor(definition) {
    this.definition = definition;
    this.name = definition.name || 'CompositeEffect';
    this.layers = [];
    this.subEmitters = new Map();
    this.time = 0;
    this.active = true;
    
    // Create root Three.js group
    this.group = new THREE.Group();
    
    // Initialize layers
    if (definition.layers) {
      this.initializeLayers(definition.layers);
    }
    
    // Timeline events
    this.timeline = definition.timeline || [];
    this.timelineIndex = 0;
    
    // Movement (for projectiles)
    if (definition.movement) {
      this.initializeMovement(definition.movement);
    }
    
    // Lights
    this.lights = [];
    if (definition.lights) {
      this.initializeLights(definition.lights);
    }
  }
  
  /**
   * Initialize all effect layers
   */
  initializeLayers(layerDefs) {
    for (const layerDef of layerDefs) {
      const layer = {
        name: layerDef.name,
        system: new ParticleSystem(layerDef.effect),
        offset: new THREE.Vector3().fromArray(layerDef.offset || [0, 0, 0]),
        enabled: layerDef.enabled !== false,
        startDelay: layerDef.startDelay || 0,
        duration: layerDef.duration || Infinity,
        startTime: null
      };
      
      // Position the layer
      layer.system.getObject3D().position.copy(layer.offset);
      this.group.add(layer.system.getObject3D());
      
      this.layers.push(layer);
    }
  }
  
  /**
   * Initialize movement (for projectiles)
   */
  initializeMovement(movementDef) {
    this.movement = {
      type: movementDef.type || 'linear',
      velocity: new THREE.Vector3().fromArray(movementDef.velocity || [0, 0, 0]),
      acceleration: new THREE.Vector3().fromArray(movementDef.acceleration || [0, 0, 0]),
      rotationSpeed: new THREE.Vector3().fromArray(movementDef.rotationSpeed || [0, 0, 0]),
      curve: movementDef.curve || null,
      speed: movementDef.speed || 1.0,
      lifetime: movementDef.lifetime || 10.0,
      onComplete: movementDef.onComplete || null
    };
  }
  
  /**
   * Initialize dynamic lights
   */
  initializeLights(lightDefs) {
    for (const lightDef of lightDefs) {
      const light = this.createLight(lightDef);
      if (light) {
        this.group.add(light.object);
        this.lights.push(light);
      }
    }
  }
  
  /**
   * Create a dynamic light
   */
  createLight(lightDef) {
    let lightObj;
    
    switch (lightDef.type) {
      case 'point':
        lightObj = new THREE.PointLight(
          lightDef.color || 0xffffff,
          lightDef.intensity || 1.0,
          lightDef.distance || 10,
          lightDef.decay || 2
        );
        break;
      
      case 'spot':
        lightObj = new THREE.SpotLight(
          lightDef.color || 0xffffff,
          lightDef.intensity || 1.0,
          lightDef.distance || 10,
          lightDef.angle || Math.PI / 4,
          lightDef.penumbra || 0.1,
          lightDef.decay || 2
        );
        break;
      
      default:
        console.warn(`Unknown light type: ${lightDef.type}`);
        return null;
    }
    
    if (lightDef.position) {
      lightObj.position.fromArray(lightDef.position);
    }
    
    if (lightDef.castShadow) {
      lightObj.castShadow = true;
    }
    
    return {
      object: lightObj,
      definition: lightDef,
      startTime: this.time,
      flickerPhase: Math.random() * Math.PI * 2
    };
  }
  
  /**
   * Update the composite effect
   */
  update(deltaTime) {
    if (!this.active) return;
    
    this.time += deltaTime;
    
    // Update movement
    if (this.movement) {
      this.updateMovement(deltaTime);
    }
    
    // Update layers
    for (const layer of this.layers) {
      // Check if layer should start
      if (layer.startTime === null && this.time >= layer.startDelay) {
        layer.startTime = this.time;
      }
      
      // Update active layers
      if (layer.enabled && layer.startTime !== null) {
        const layerTime = this.time - layer.startTime;
        
        // Check if layer should stop
        if (layerTime >= layer.duration) {
          layer.enabled = false;
          continue;
        }
        
        layer.system.update(deltaTime);
      }
    }
    
    // Update lights
    for (const light of this.lights) {
      this.updateLight(light, deltaTime);
    }
    
    // Process timeline events
    this.processTimeline();
    
    // Check if effect is complete
    if (this.movement && this.time >= this.movement.lifetime) {
      this.onComplete();
    }
  }
  
  /**
   * Update movement (projectile motion)
   */
  updateMovement(deltaTime) {
    const mov = this.movement;
    
    switch (mov.type) {
      case 'linear':
        // Apply acceleration
        mov.velocity.addScaledVector(mov.acceleration, deltaTime);
        
        // Apply velocity
        this.group.position.addScaledVector(mov.velocity, deltaTime);
        break;
      
      case 'curve':
        // Follow predefined curve
        if (mov.curve) {
          const t = Math.min(this.time / mov.lifetime, 1.0);
          const point = mov.curve.getPoint(t);
          this.group.position.copy(point);
        }
        break;
      
      case 'homing':
        // Home towards target
        if (mov.target) {
          const toTarget = new THREE.Vector3()
            .subVectors(mov.target, this.group.position)
            .normalize();
          
          mov.velocity.lerp(
            toTarget.multiplyScalar(mov.speed),
            mov.homingStrength * deltaTime
          );
          
          this.group.position.addScaledVector(mov.velocity, deltaTime);
        }
        break;
    }
    
    // Apply rotation
    if (mov.rotationSpeed.lengthSq() > 0) {
      this.group.rotation.x += mov.rotationSpeed.x * deltaTime;
      this.group.rotation.y += mov.rotationSpeed.y * deltaTime;
      this.group.rotation.z += mov.rotationSpeed.z * deltaTime;
    }
  }
  
  /**
   * Update dynamic light
   */
  updateLight(light, deltaTime) {
    const def = light.definition;
    const age = this.time - light.startTime;
    
    // Apply intensity curve
    if (def.intensityCurve) {
      const t = Math.min(age / (this.movement?.lifetime || 10), 1.0);
      light.object.intensity = def.intensityCurve.evaluate(t) * (def.intensity || 1.0);
    }
    
    // Apply flickering
    if (def.flicker) {
      light.flickerPhase += deltaTime * def.flicker.speed || 10;
      const flickerAmount = Math.sin(light.flickerPhase) * (def.flicker.amount || 0.2);
      light.object.intensity *= (1.0 + flickerAmount);
    }
    
    // Apply color animation
    if (def.colorCurve) {
      const t = Math.min(age / (this.movement?.lifetime || 10), 1.0);
      const color = def.colorCurve.evaluate(t);
      if (color instanceof THREE.Color) {
        light.object.color.copy(color);
      }
    }
  }
  
  /**
   * Process timeline events
   */
  processTimeline() {
    while (this.timelineIndex < this.timeline.length) {
      const event = this.timeline[this.timelineIndex];
      
      if (this.time >= event.time) {
        this.triggerEvent(event);
        this.timelineIndex++;
      } else {
        break;
      }
    }
  }
  
  /**
   * Trigger a timeline event
   */
  triggerEvent(event) {
    switch (event.type) {
      case 'emit':
        // Emit sub-effect
        if (event.effect) {
          const subEffect = new CompositeEffect(event.effect);
          subEffect.group.position.copy(this.group.position);
          this.group.parent.add(subEffect.group);
          
          // Store reference if needed
          if (event.name) {
            this.subEmitters.set(event.name, subEffect);
          }
        }
        break;
      
      case 'enableLayer':
        const layer = this.layers.find(l => l.name === event.layerName);
        if (layer) {
          layer.enabled = true;
          layer.startTime = this.time;
        }
        break;
      
      case 'disableLayer':
        const layer2 = this.layers.find(l => l.name === event.layerName);
        if (layer2) {
          layer2.enabled = false;
        }
        break;
      
      case 'callback':
        if (event.callback && typeof event.callback === 'function') {
          event.callback(this);
        }
        break;
    }
  }
  
  /**
   * Called when effect completes
   */
  onComplete() {
    if (this.movement?.onComplete === 'explode') {
      // Trigger explosion event
      this.triggerEvent({
        type: 'emit',
        effect: this.definition.onImpact
      });
    }
    
    this.active = false;
  }
  
  /**
   * Get the Three.js object
   */
  getObject3D() {
    return this.group;
  }
  
  /**
   * Check if effect is still active
   */
  isActive() {
    return this.active || this.layers.some(l => l.enabled);
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    for (const layer of this.layers) {
      layer.system.dispose();
    }
    
    for (const [name, subEffect] of this.subEmitters) {
      subEffect.dispose();
    }
    
    this.group.clear();
  }
}
