import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildRoom } from './room/index.js';
import { createLighting } from './lighting.js';
import { createTour } from './tour.js';
import { applyLanguage } from './i18n.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Phones get a lighter pipeline: smaller shadow map, no ambient occlusion.
const lite = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 720;

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
// The room is static, so shadows are only redrawn while the light is changing.
renderer.shadowMap.autoUpdate = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 40);

const room = buildRoom();
scene.add(room.root);
const lighting = createLighting(scene, renderer, room, { shadows: lite ? 2048 : 4096 });
const tour = createTour(camera, { reducedMotion });

// ---------- post-processing: ambient occlusion, bloom, tone mapping ----------
const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, target);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const ao = new GTAOPass(scene, camera, 1, 1);
ao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.2, thickness: 1.5, scale: 1.3, samples: 12 });
ao.blendIntensity = 1;
ao.enabled = !lite;
composer.addPass(ao);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.25, 0.5, 1.6);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- render styles ----------
const clay = new THREE.MeshStandardMaterial({ color: 0xd9d6d0, roughness: 0.9 });
const wire = new THREE.MeshBasicMaterial({ color: 0x55d6f5, wireframe: true });
const wireBackground = new THREE.Color(0x06131c);
let style = 'full';

function setStyle(name) {
  style = name;
  renderPass.overrideMaterial = name === 'clay' ? clay : name === 'wire' ? wire : null;
  ao.enabled = !lite && name !== 'wire';
  bloom.enabled = name === 'full';
}

// ---------- curtains ----------
const curtains = room.shell.curtains;
const curtainMeshes = curtains.flatMap((c) => c.meshes);
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let down = null;

function curtainAt(event) {
  ndc.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(curtainMeshes, false)[0];
  return hit ? hit.object.userData.curtain : null;
}
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
  const set = curtainAt(e);
  if (set) set.toggle();
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return;
  canvas.style.cursor = curtainAt(e) ? 'pointer' : '';
});
document.getElementById('curtains').addEventListener('click', () => {
  const open = curtains.some((c) => c.target > 0.5);
  for (const c of curtains) c.target = open ? 0 : 1;
});

// ---------- control bar ----------
function bind(control, onChange) {
  const group = document.querySelector(`[data-control="${control}"]`);
  group.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    for (const b of group.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === button));
    onChange(button.dataset.value);
  });
}
bind('lighting', (value) => lighting.set(value, reducedMotion));
bind('style', setStyle);
bind('lang', (value) => {
  applyLanguage(value);
  try { localStorage.setItem('lang', value); } catch { /* storage unavailable */ }
});
let lang = 'en';
try { lang = localStorage.getItem('lang') || lang; } catch { /* storage unavailable */ }
applyLanguage(lang);
for (const b of document.querySelectorAll('[data-control="lang"] button')) b.setAttribute('aria-pressed', String(b.dataset.value === lang));
lighting.set('night', true);

// ---------- sizing ----------
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
  camera.aspect = w / h;
  // Portrait screens need a wider lens to keep the room in frame.
  camera.fov = camera.aspect < 1 ? 76 : 55;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ---------- loop ----------
const timer = new THREE.Timer();
let time = 0;
let settle = 5; // frames of shadow redraw still owed
renderer.setAnimationLoop(() => {
  timer.update();
  const dt = Math.min(timer.getDelta(), 0.1);
  time += dt;
  let openness = 0;
  for (const c of curtains) {
    if (c.update(reducedMotion ? 1 : dt)) settle = 3;
    openness += c.open / curtains.length;
  }
  if (!reducedMotion) {
    for (const s of room.water.shrimp) {
      const t = time * s.speed + s.phase;
      s.node.position.x = s.home.x + Math.sin(t) * 0.03;
      s.node.position.z = s.home.z + Math.cos(t * 0.7) * 0.02;
      s.node.rotation.y = Math.cos(t) > 0 ? 0 : Math.PI;
    }
  }
  if (lighting.update(dt, openness)) settle = 3;
  if (settle > 0) {
    settle--;
    renderer.shadowMap.needsUpdate = true;
  }
  if (style === 'wire') scene.background.copy(wireBackground);
  tour.update(dt);
  composer.render(dt);
});

document.documentElement.dataset.ready = 'true';
