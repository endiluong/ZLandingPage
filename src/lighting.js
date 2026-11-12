// Lights and the four lighting presets. Switching preset sets a goal; update()
// eases the live values toward it. The balcony faces east (+x), so direct sun
// only reaches into the room in the morning.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const CENTRE = new THREE.Vector3(1.9, 0.6, 2.25);

// sun: offset of the sun from the room centre. Light levels are in candela.
export const PRESETS = {
  morning: {
    sun: [8, 4.3, 1.4], sunColor: 0xffd2a0, sunPower: 7,
    sky: 0xdfeaff, ground: 0xb7a48c, fill: 0.32, background: 0xbcd6f0, env: 0.22, exposure: 0.9,
    ceiling: 2, lamp: 0, aqua: 2, soft: 0, screens: 0.7,
  },
  day: {
    sun: [6, 6.5, 2.2], sunColor: 0xfff2e0, sunPower: 6,
    sky: 0xe6f0ff, ground: 0xc0b09a, fill: 0.5, background: 0x9fc9f2, env: 0.32, exposure: 0.9,
    ceiling: 4, lamp: 0, aqua: 2, soft: 0, screens: 0.7,
  },
  evening: {
    sun: [-6, 2, 1], sunColor: 0xff9a60, sunPower: 0,
    sky: 0xffc7a0, ground: 0x7a6250, fill: 0.3, background: 0xd98a5a, env: 0.18, exposure: 1.0,
    ceiling: 16, lamp: 5, aqua: 3, soft: 0, screens: 0.9,
  },
  night: {
    sun: [3, 8, 2], sunColor: 0x9fb4ff, sunPower: 0,
    sky: 0x334066, ground: 0x15161c, fill: 0.05, background: 0x060912, env: 0.035, exposure: 1.15,
    ceiling: 0, lamp: 7, aqua: 7, soft: 7, screens: 1.0,
  },
};

const NUMBERS = ['sunPower', 'fill', 'env', 'exposure', 'ceiling', 'lamp', 'aqua', 'soft', 'screens'];
const COLORS = ['sunColor', 'sky', 'ground', 'background'];

function blank() {
  const s = { sun: new THREE.Vector3() };
  for (const k of COLORS) s[k] = new THREE.Color();
  for (const k of NUMBERS) s[k] = 0;
  return s;
}

export function createLighting(scene, renderer, room, { shadows = 4096 } = {}) {
  RectAreaLightUniformsLib.init();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.background = new THREE.Color();

  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(shadows, shadows);
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.012;
  sun.shadow.radius = 2.5;
  Object.assign(sun.shadow.camera, { left: -4.2, right: 4.2, top: 4.2, bottom: -4.2, near: 1, far: 26 });
  sun.target.position.copy(CENTRE);
  scene.add(sun, sun.target);

  const fill = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
  scene.add(fill);

  const spot = (colour, position, target, angle, penumbra, shadowSize) => {
    const l = new THREE.SpotLight(colour, 0, 8, angle, penumbra, 2);
    l.position.copy(position);
    l.target.position.copy(target);
    if (shadowSize) {
      l.castShadow = true;
      l.shadow.mapSize.set(shadowSize, shadowSize);
      l.shadow.bias = -0.0006;
      l.shadow.normalBias = 0.02;
      l.shadow.camera.near = 0.1;
    }
    scene.add(l, l.target);
    return l;
  };
  const ceiling = spot(0xffe2b8, new THREE.Vector3(1.8, 2.93, 2.25), new THREE.Vector3(1.8, 0, 2.25), 1.35, 0.6, 1024);
  const lamp = spot(0xffb46a, room.desk.lamp, room.desk.lampTarget, 1.0, 0.7, 512);
  const aqua = spot(0xe6f2ff, room.water.light, room.water.target, 0.75, 0.6, 0);
  aqua.distance = 0.9; // stops at the desk instead of leaking onto the floor
  // Start the beam just in front of the softbox so its own hood doesn't shadow it.
  const head = room.display.softbox.position;
  const softFrom = head.clone().add(room.paint.booth.clone().sub(head).normalize().multiplyScalar(0.26));
  const soft = spot(0xfff1dc, softFrom, room.paint.booth, 0.75, 0.8, 1024);

  const panel = (colour, w, h, position, facing) => {
    const l = new THREE.RectAreaLight(colour, 0, w, h);
    l.position.copy(position);
    l.lookAt(position.clone().add(facing));
    scene.add(l);
    return l;
  };
  const monitors = panel(0xbfd4ff, 0.6, 0.75, room.desk.monitors, new THREE.Vector3(1, 0, 0));
  const tv = panel(0xcfe2ff, 1.2, 0.68, room.display.tv, new THREE.Vector3(0, 0, -1));

  const live = blank();
  const goal = blank();
  let daylight = 1; // 0 = all curtains closed, 1 = all open
  let dirty = true;

  function apply() {
    const k = 0.35 + 0.65 * daylight;
    sun.position.copy(CENTRE).add(live.sun);
    sun.color.copy(live.sunColor);
    sun.intensity = live.sunPower;
    fill.color.copy(live.sky);
    fill.groundColor.copy(live.ground);
    fill.intensity = live.fill * k;
    scene.environmentIntensity = live.env * k + 0.02;
    scene.background.copy(live.background);
    renderer.toneMappingExposure = live.exposure;
    ceiling.intensity = live.ceiling;
    lamp.intensity = live.lamp;
    aqua.intensity = live.aqua;
    soft.intensity = live.soft;
    monitors.intensity = live.screens * 2.2;
    tv.intensity = live.screens * 1.6;
    for (const m of room.desk.screens) m.emissiveIntensity = 0.55 + live.screens * 0.5;
    room.display.tvScreen.emissiveIntensity = 0.5 + live.screens * 0.5;
    room.shell.ceilingLamp.emissiveIntensity = live.ceiling * 0.12;
    room.water.glow.emissiveIntensity = 0.4 + live.aqua * 0.25;
    room.display.softbox.glow.emissiveIntensity = live.soft * 0.25;
  }

  function set(name, instant = false) {
    const p = PRESETS[name];
    dirty = true;
    goal.sun.set(p.sun[0], p.sun[1], p.sun[2]);
    for (const k of COLORS) goal[k].set(p[k]);
    for (const k of NUMBERS) goal[k] = p[k];
    if (instant) {
      live.sun.copy(goal.sun);
      for (const k of COLORS) live[k].copy(goal[k]);
      for (const k of NUMBERS) live[k] = goal[k];
      apply();
    }
  }

  /** Returns true while the sun is still moving, so shadows need redrawing. */
  function update(dt, curtainOpenness) {
    daylight = curtainOpenness;
    const a = 1 - Math.exp(-dt * 3);
    const moving = live.sun.distanceToSquared(goal.sun) > 0.0004 || Math.abs(live.sunPower - goal.sunPower) > 0.01;
    live.sun.lerp(goal.sun, a);
    for (const k of COLORS) live[k].lerp(goal[k], a);
    for (const k of NUMBERS) live[k] += (goal[k] - live[k]) * a;
    apply();
    const redraw = moving || dirty;
    dirty = false;
    return redraw;
  }

  return { set, update };
}
