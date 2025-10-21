/**
 * Main application - Web viewer for EffectGraph
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ParticleSystem } from './src/index.js';
import { fireEffect } from './src/examples/fire.js';
import { smokeEffect } from './src/examples/smoke.js';
import { explosionEffect } from './src/examples/explosion.js';
import { sparklesEffect } from './src/examples/sparkles.js';

// Scene setup
let scene, camera, renderer, controls;
let currentSystem = null;
let clock = new THREE.Clock();
let frameCount = 0;
let lastFpsUpdate = 0;

// Available effects
const effects = {
  fire: fireEffect,
  smoke: smokeEffect,
  explosion: explosionEffect,
  sparkles: sparklesEffect
};

/**
 * Initialize Three.js scene
 */
function initScene() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 8);
  camera.lookAt(0, 2, 0);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // Add orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 2, 0);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);

  // Add ground plane
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add grid helper
  const gridHelper = new THREE.GridHelper(20, 20, 0x667eea, 0x333344);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // Add reference sphere
  const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x667eea,
    emissive: 0x667eea,
    emissiveIntensity: 0.5
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.y = 0.2;
  scene.add(sphere);

  // Handle window resize
  window.addEventListener('resize', onWindowResize);
}

/**
 * Handle window resize
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Load and activate an effect
 */
function loadEffect(effectKey) {
  // Remove current system
  if (currentSystem) {
    scene.remove(currentSystem.getObject3D());
    currentSystem.dispose();
  }

  // Create new system
  const effectDef = effects[effectKey];
  currentSystem = new ParticleSystem(effectDef);
  
  // Position the effect
  const effectObject = currentSystem.getObject3D();
  effectObject.position.set(0, 0.5, 0);
  scene.add(effectObject);

  // Update UI
  document.getElementById('effect-name').textContent = effectDef.name;

  console.log(`Loaded effect: ${effectDef.name}`);
}

/**
 * Animation loop
 */
function animate() {
  requestAnimationFrame(animate);

  // Get delta time
  const deltaTime = Math.min(clock.getDelta(), 0.1); // Cap at 0.1s to prevent huge jumps

  // Update particle system
  if (currentSystem) {
    currentSystem.update(deltaTime);
  }

  // Update controls
  controls.update();

  // Render scene
  renderer.render(scene, camera);

  // Update stats
  updateStats(deltaTime);
}

/**
 * Update statistics display
 */
function updateStats(deltaTime) {
  frameCount++;
  lastFpsUpdate += deltaTime;

  if (lastFpsUpdate >= 0.5) {
    const fps = Math.round(frameCount / lastFpsUpdate);
    document.getElementById('fps').textContent = fps;
    frameCount = 0;
    lastFpsUpdate = 0;
  }

  if (currentSystem) {
    document.getElementById('particle-count').textContent = currentSystem.getAliveCount();
  }
}

/**
 * Setup UI controls
 */
function setupUI() {
  // Effect selection buttons
  document.getElementById('btn-fire').addEventListener('click', () => {
    loadEffect('fire');
    setActiveButton('btn-fire');
  });

  document.getElementById('btn-smoke').addEventListener('click', () => {
    loadEffect('smoke');
    setActiveButton('btn-smoke');
  });

  document.getElementById('btn-explosion').addEventListener('click', () => {
    loadEffect('explosion');
    setActiveButton('btn-explosion');
  });

  document.getElementById('btn-sparkles').addEventListener('click', () => {
    loadEffect('sparkles');
    setActiveButton('btn-sparkles');
  });

  // Reset button
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (currentSystem) {
      currentSystem.reset();
    }
  });
}

/**
 * Set active button state
 */
function setActiveButton(buttonId) {
  document.querySelectorAll('.button-grid button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(buttonId).classList.add('active');
}

/**
 * Initialize application
 */
function init() {
  console.log('EffectGraph - Initializing...');
  
  initScene();
  setupUI();
  loadEffect('fire'); // Load default effect
  animate();
  
  console.log('EffectGraph - Ready!');
}

// Start the application
init();
