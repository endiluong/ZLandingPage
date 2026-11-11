// Lighting presets and the lights they drive. Switching preset sets a target;
// update() eases the live values toward it every frame.
import * as THREE from 'three';

const LAMP_POSITION = [-0.28, 1.2, -2.25];

// sun: position is where the light comes from (the window is on +x).
export const PRESETS = {
  morning: {
    sun: [6, 2.4, 2.2], sunColor: 0xffd7a6, sunPower: 4.2,
    sky: 0xcfe2ff, ground: 0x8a7460, fill: 0.55,
    background: 0xbdd6ee, lamp: 0, screen: 0.5, exposure: 1.0,
  },
  day: {
    sun: [5, 6.5, 0.6], sunColor: 0xffffff, sunPower: 3.6,
    sky: 0xdcebff, ground: 0x9a8670, fill: 0.95,
    background: 0x9cc6ee, lamp: 0, screen: 0.5, exposure: 1.0,
  },
  evening: {
    sun: [6, 1.5, -1.6], sunColor: 0xff9a58, sunPower: 5.0,
    sky: 0xffc9a3, ground: 0x6b5446, fill: 0.5,
    background: 0xf2a978, lamp: 3.5, screen: 0.8, exposure: 1.05,
  },
  night: {
    sun: [5, 5, 1], sunColor: 0x8fa2ff, sunPower: 0.25,
    sky: 0x2a3350, ground: 0x15151c, fill: 0.12,
    background: 0x090d1a, lamp: 9, screen: 1.6, exposure: 1.1,
  },
};

export function createLighting(scene, renderer, screen) {
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  const cam = sun.shadow.camera;
  cam.left = cam.bottom = -4.5;
  cam.right = cam.top = 4.5;
  cam.near = 0.5;
  cam.far = 20;
  sun.target.position.set(0, 0.6, 0);
  scene.add(sun, sun.target);

  const fill = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
  scene.add(fill);

  const lamp = new THREE.PointLight(0xffb86b, 0, 6, 2);
  lamp.position.set(...LAMP_POSITION);
  scene.add(lamp);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0x33291c }),
  );
  bulb.position.copy(lamp.position);
  scene.add(bulb);

  scene.background = new THREE.Color();

  const live = {
    sun: new THREE.Vector3(), sunColor: new THREE.Color(), sunPower: 0,
    sky: new THREE.Color(), ground: new THREE.Color(), fill: 0,
    background: new THREE.Color(), lamp: 0, screen: 0, exposure: 1,
  };
  const goal = {
    sun: new THREE.Vector3(), sunColor: new THREE.Color(), sunPower: 0,
    sky: new THREE.Color(), ground: new THREE.Color(), fill: 0,
    background: new THREE.Color(), lamp: 0, screen: 0, exposure: 1,
  };
  const NUMBERS = ['sunPower', 'fill', 'lamp', 'screen', 'exposure'];
  const COLORS = ['sunColor', 'sky', 'ground', 'background'];

  function apply() {
    sun.position.copy(live.sun);
    sun.color.copy(live.sunColor);
    sun.intensity = live.sunPower;
    fill.color.copy(live.sky);
    fill.groundColor.copy(live.ground);
    fill.intensity = live.fill;
    scene.background.copy(live.background);
    lamp.intensity = live.lamp;
    bulb.material.color.setRGB(1, 0.75, 0.45).multiplyScalar(Math.min(1, 0.15 + live.lamp / 3));
    screen.material.emissiveIntensity = live.screen;
    renderer.toneMappingExposure = live.exposure;
  }

  function set(name, instant = false) {
    const p = PRESETS[name];
    goal.sun.set(...p.sun);
    for (const k of COLORS) goal[k].set(p[k]);
    for (const k of NUMBERS) goal[k] = p[k];
    if (instant) {
      live.sun.copy(goal.sun);
      for (const k of COLORS) live[k].copy(goal[k]);
      for (const k of NUMBERS) live[k] = goal[k];
      apply();
    }
  }

  function update(dt) {
    const a = 1 - Math.exp(-dt * 3);
    live.sun.lerp(goal.sun, a);
    for (const k of COLORS) live[k].lerp(goal[k], a);
    for (const k of NUMBERS) live[k] += (goal[k] - live[k]) * a;
    apply();
  }

  return { set, update };
}
