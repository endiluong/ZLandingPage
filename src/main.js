import * as THREE from 'three';
import { buildRoom } from './room.js';
import { createLighting } from './lighting.js';
import { createTour } from './tour.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 50);

const { room, screen, spinners } = buildRoom();
scene.add(room);

const lighting = createLighting(scene, renderer, screen);
const tour = createTour(camera, { reducedMotion });

// ---------- render styles ----------
const clay = new THREE.MeshStandardMaterial({ color: 0xd9d6d0, roughness: 0.9 });
const wire = new THREE.MeshBasicMaterial({ color: 0x55d6f5, wireframe: true });
const wireBackground = new THREE.Color(0x06131c);
let style = 'full';

function setStyle(name) {
  style = name;
  scene.overrideMaterial = name === 'clay' ? clay : name === 'wire' ? wire : null;
}

// ---------- control bar ----------
function bind(control, onChange) {
  const group = document.querySelector(`[data-control="${control}"]`);
  group.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    for (const b of group.querySelectorAll('button')) {
      b.setAttribute('aria-pressed', String(b === button));
    }
    onChange(button.dataset.value);
  });
}
bind('lighting', (value) => lighting.set(value, reducedMotion));
bind('style', setStyle);
lighting.set('evening', true);

// ---------- sizing ----------
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Portrait screens need a wider lens to keep the room in frame.
  camera.fov = camera.aspect < 1 ? 72 : 50;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ---------- loop ----------
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (!reducedMotion) {
    for (const s of spinners) s.rotation.y += dt * 0.4;
  }
  lighting.update(dt);
  if (style === 'wire') scene.background.copy(wireBackground);
  tour.update(dt);
  renderer.render(scene, camera);
});
