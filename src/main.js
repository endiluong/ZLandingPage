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
renderer.setPixelRatio(1);
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
const lighting = createLighting(scene, renderer, room, { shadows: 2048 });
const tour = createTour(camera, { reducedMotion });

// ---------- post-processing: ambient occlusion, bloom, tone mapping ----------
const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, target);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const ao = new GTAOPass(scene, camera, 1, 1);
ao.updateGtaoMaterial({ radius: 0.5, distanceExponent: 1.2, thickness: 1.5, scale: 1.3, samples: 8 });
ao.blendIntensity = 1;
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
  ao.enabled = TIERS[tier].ao && name !== 'wire';
  bloom.enabled = TIERS[tier].bloom && name === 'full';
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
bind('style', (value) => { setStyle(value); wake = 30; });
bind('lang', (value) => {
  applyLanguage(value);
  try { localStorage.setItem('lang', value); } catch { /* storage unavailable */ }
});
let lang = 'en';
try { lang = localStorage.getItem('lang') || lang; } catch { /* storage unavailable */ }
applyLanguage(lang);
for (const b of document.querySelectorAll('[data-control="lang"] button')) b.setAttribute('aria-pressed', String(b.dataset.value === lang));
lighting.set('night', true);

// ---------- quality ----------
// Start high and step down whenever the frame rate can't keep up. It never
// steps back up, so it settles instead of flickering between levels.
const TIERS = [
  { scale: 1.5, msaa: 4, ao: true, bloom: true },
  { scale: 1.0, msaa: 4, ao: false, bloom: true },
  { scale: 1.0, msaa: 0, ao: false, bloom: false },
  { scale: 0.75, msaa: 0, ao: false, bloom: false },
  { scale: 0.5, msaa: 0, ao: false, bloom: false },
];
const params = new URLSearchParams(location.search);
// ?q=0..4 pins a quality level; otherwise it adapts.
const pinned = params.has('q');
let tier = pinned ? THREE.MathUtils.clamp(Number(params.get('q')) || 0, 0, TIERS.length - 1) : lite ? 2 : 1;
let wake = 40; // frames that must be drawn even if nothing seems to move

function applyQuality() {
  const q = TIERS[tier];
  const ratio = Math.min(window.devicePixelRatio, q.scale);
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setPixelRatio(Math.max(0.5, ratio));
  renderer.setSize(w, h, false);
  for (const t of [composer.renderTarget1, composer.renderTarget2]) {
    if (t.samples !== q.msaa) {
      t.samples = q.msaa;
      t.dispose();
    }
  }
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(w, h);
  setStyle(style);
  wake = 30;
}

// Redraw once the texture images have arrived.
THREE.DefaultLoadingManager.onLoad = () => { wake = 60; };

// ---------- sizing ----------
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  // Portrait screens need a wider lens to keep the room in frame.
  camera.fov = camera.aspect < 1 ? 76 : 55;
  camera.updateProjectionMatrix();
  applyQuality();
}
window.addEventListener('resize', resize);
resize();

// ---------- loop ----------
const timer = new THREE.Timer();
const lastPosition = new THREE.Vector3();
const lastQuaternion = new THREE.Quaternion();
let time = 0;
let settle = 5; // frames of shadow redraw still owed
let idle = 0; // seconds since the last drawn frame
let slow = 0; // running count of slow frames, for stepping quality down
let sampled = 0;
let spent = 0;
let drawn = 0;
let fps = 0;

// ?stats shows a one-line readout for diagnosing slow machines.
let stats = null;
let gpuName = '';
if (params.has('stats')) {
  stats = document.createElement('div');
  stats.className = 'stats';
  document.body.append(stats);
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  gpuName = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown GPU';
  renderer.info.autoReset = false;
}
renderer.setAnimationLoop(() => {
  timer.update();
  const raw = timer.getDelta();
  const dt = Math.min(raw, 0.1);
  time += dt;
  let openness = 0;
  let active = wake > 0;
  for (const c of curtains) {
    if (c.update(reducedMotion ? 1 : dt)) { settle = 3; active = true; }
    openness += c.open / curtains.length;
  }
  if (lighting.update(dt, openness)) settle = 3;
  if (lighting.busy) active = true;
  if (settle > 0) {
    settle--;
    active = true;
    renderer.shadowMap.needsUpdate = true;
  }
  tour.update(dt);
  if (camera.position.distanceToSquared(lastPosition) > 1e-9 || Math.abs(camera.quaternion.dot(lastQuaternion)) < 1 - 1e-9) active = true;

  // When nothing is moving, only redraw ten times a second (for the shrimp).
  idle += dt;
  if (!active && idle < 0.1) return;
  idle = 0;
  if (wake > 0) wake--;
  lastPosition.copy(camera.position);
  lastQuaternion.copy(camera.quaternion);

  if (!reducedMotion) {
    for (const s of room.water.shrimp) {
      const t = time * s.speed + s.phase;
      s.node.position.x = s.home.x + Math.sin(t) * 0.03;
      s.node.position.z = s.home.z + Math.cos(t * 0.7) * 0.02;
      s.node.rotation.y = Math.cos(t) > 0 ? 0 : Math.PI;
    }
  }
  if (style === 'wire') scene.background.copy(wireBackground);
  if (stats) renderer.info.reset();
  composer.render(dt);

  // Judge speed only on active frames, ignoring tab switches.
  if (active && raw < 10 && ++drawn > 4) {
    sampled++;
    spent += raw;
    if (raw > 1 / 45) slow++;
    if (sampled >= 20 || spent > 2) {
      fps = sampled / spent;
      if (!pinned && slow > sampled * 0.5 && tier < TIERS.length - 1) { tier++; applyQuality(); }
      sampled = slow = spent = 0;
      if (stats) {
        const i = renderer.info.render;
        stats.textContent = `${fps.toFixed(0)} fps · level ${tier} · ${renderer.getPixelRatio().toFixed(2)}x · ${(i.triangles / 1000).toFixed(0)}k tris · ${i.calls} calls · ${gpuName}`;
      }
    }
  }
});

document.documentElement.dataset.ready = 'true';
