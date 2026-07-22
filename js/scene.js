import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* -----------------------------------------------------------
   Elite Web Agency — signature "core network" background scene
   A wireframe icosahedron core with orbiting node points and an
   ambient particle field, drifting with slow autorotation and
   reacting to mouse parallax + scroll depth.

   Exposes initScene(), which sets everything up, starts the
   render loop, and returns { applyTheme } so theme.js can drive
   the scene's colors when the user toggles light/dark mode.
------------------------------------------------------------ */

const THEME_COLORS = {
  dark:  { bg: 0x0a0b0e, line: 0x5b6cff, node: 0xb98cff, particle: 0x9aa0ac, particleOpacity: 0.5,  bloom: 0.85 },
  light: { bg: 0xf6f6f4, line: 0x5b6cff, node: 0x8a5fe0, particle: 0x565b66, particleOpacity: 0.32, bloom: 0.45 }
};

export function initScene(canvasId = 'bg-canvas') {
  const canvas = document.getElementById(canvasId);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(THEME_COLORS.dark.bg, 0.055);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  let baseZ = window.innerWidth <= 640 ? 14 : 9;
  camera.position.set(0, 0, baseZ);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* ---------------- Lighting ---------------- */
  scene.add(new THREE.AmbientLight(0x8892ff, 0.6));

  const pointLight = new THREE.PointLight(0x5b6cff, 3.2, 20);
  pointLight.position.set(4, 3, 5);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0xb98cff, 2.4, 20);
  pointLight2.position.set(-4, -2, 4);
  scene.add(pointLight2);

  /* ---------------- Signature core geometry ---------------- */
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  const coreGeo = new THREE.IcosahedronGeometry(2.3, 1);
  const edges = new THREE.EdgesGeometry(coreGeo);
  const coreMat = new THREE.LineBasicMaterial({ color: THEME_COLORS.dark.line, transparent: true, opacity: 0.55 });
  const coreWireframe = new THREE.LineSegments(edges, coreMat);
  coreGroup.add(coreWireframe);

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x14161c, metalness: 0.4, roughness: 0.35, transparent: true, opacity: 0.35
  });
  const shell = new THREE.Mesh(coreGeo, shellMat);
  shell.scale.setScalar(0.99);
  coreGroup.add(shell);

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', coreGeo.attributes.position.clone());
  const nodeMat = new THREE.PointsMaterial({
    color: THEME_COLORS.dark.node, size: 0.09, transparent: true, opacity: 0.9, sizeAttenuation: true
  });
  const nodes = new THREE.Points(nodeGeo, nodeMat);
  coreGroup.add(nodes);

  /* ---------------- Ambient particle field ---------------- */
  const PARTICLE_COUNT = 900;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = 6 + Math.random() * 14;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    particlePos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePos[i * 3 + 2] = radius * Math.cos(phi);
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    color: THEME_COLORS.dark.particle, size: 0.045, transparent: true,
    opacity: THEME_COLORS.dark.particleOpacity, sizeAttenuation: true
  });
  const particleField = new THREE.Points(particleGeo, particleMat);
  scene.add(particleField);

  /* ---------------- Post-processing (subtle bloom) ---------------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.85, 0.6, 0.25);
  composer.addPass(bloomPass);

  /* ---------------- Interaction state ---------------- */
  const pointer = { x: 0, y: 0 };
  const targetRotation = { x: 0, y: 0 };
  let scrollFraction = 0;

  window.addEventListener('mousemove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  window.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    pointer.x = (t.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (t.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function updateScroll() {
    const max = document.body.scrollHeight - window.innerHeight;
    scrollFraction = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.setSize(window.innerWidth, window.innerHeight);
    baseZ = window.innerWidth <= 640 ? 14 : 9;
  });

  /* ---------------- Animation loop ---------------- */
  const clock = new THREE.Clock();
  const autoRotateSpeed = prefersReducedMotion ? 0.02 : 0.09;

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    const delta = clock.getDelta();

    coreGroup.rotation.y += autoRotateSpeed * delta;
    coreGroup.rotation.x += autoRotateSpeed * 0.4 * delta;

    targetRotation.x += (pointer.y * 0.35 - targetRotation.x) * 0.04;
    targetRotation.y += (pointer.x * 0.45 - targetRotation.y) * 0.04;
    coreGroup.rotation.x += targetRotation.x * delta;
    coreGroup.rotation.y += targetRotation.y * delta;

    nodeMat.size = 0.09 + Math.sin(elapsed * 1.8) * 0.02;

    camera.position.z = baseZ + scrollFraction * 6;
    coreGroup.scale.setScalar(1 - scrollFraction * 0.25);
    coreMat.opacity = 0.55 * (1 - scrollFraction * 0.6);
    nodeMat.opacity = 0.9 * (1 - scrollFraction * 0.7);

    particleField.rotation.y += 0.015 * delta;
    particleField.rotation.x += 0.006 * delta;

    composer.render();
  }
  animate();

  /* ---------------- Theme hook ---------------- */
  function applyTheme(theme) {
    const c = THEME_COLORS[theme] || THEME_COLORS.dark;
    scene.fog.color.setHex(c.bg);
    coreMat.color.setHex(c.line);
    nodeMat.color.setHex(c.node);
    particleMat.color.setHex(c.particle);
    particleMat.opacity = c.particleOpacity;
    bloomPass.strength = c.bloom;
  }

  return { applyTheme };
}
