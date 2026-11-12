// Wall A: the standing desk, the shelves above it, and the pegboards.
// Local x runs from the TV corner (0) to the entrance door (3.05..3.95).
import * as THREE from 'three';
import { mat, box, cyl, ball, slab, grp, rng, cable } from '../lib/build.js';
import { M, mecha, figure, plush, catFigurine, bottle, kitBox, officeChair } from './props.js';

const S = 0.768; // desk surface height

function screenMaterial(map) {
  return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 1, roughness: 0.25 });
}

function speaker(f, x) {
  const body = mat(0x2a2b2f, { roughness: 0.6 });
  const cone = mat(0x111113, { roughness: 0.4 });
  cyl(f, 0.09, 0.012, [x, S + 0.006, 0.2], M.black);
  cyl(f, 0.014, 0.2, [x, S + 0.1, 0.2], M.black);
  box(f, [0.22, 0.012, 0.2], [x, S + 0.2, 0.2], M.black);
  box(f, [0.2, 0.31, 0.19], [x, S + 0.362, 0.2], body, { r: 0.008 });
  cyl(f, 0.066, 0.012, [x, S + 0.31, 0.297], cone, { rot: [Math.PI / 2, 0, 0], seg: 28 });
  cyl(f, 0.03, 0.02, [x, S + 0.31, 0.297], mat(0x3a3b40, { roughness: 0.3, metalness: 0.4 }), { rot: [Math.PI / 2, 0, 0] });
  cyl(f, 0.024, 0.012, [x, S + 0.45, 0.297], mat(0x8a5a3a, { roughness: 0.3, metalness: 0.6 }), { rot: [Math.PI / 2, 0, 0] });
}

function keyboard(f, x, z) {
  const r = rng(77);
  box(f, [0.36, 0.022, 0.135], [x, S + 0.011, z], M.charcoal, { r: 0.006 });
  const caps = [
    mat(0x4fbf7a, { roughness: 0.35, transparent: true, opacity: 0.9 }),
    mat(0xd9dadd, { roughness: 0.5 }),
    mat(0xe7a6b8, { roughness: 0.5 }),
    mat(0x7fb0d9, { roughness: 0.5 }),
  ];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 15; col++) {
      const pick = r() < 0.62 ? 0 : 1 + Math.floor(r() * 3);
      box(f, [0.019, 0.012, 0.019], [x - 0.164 + col * 0.0234, S + 0.028, z - 0.047 + row * 0.0234], caps[pick]);
    }
  }
}

export function buildDeskWall(f, tex) {
  const walnut = mat(0xffc79a, { ...tex.pbr.walnut, gain: 3.4, roughness: 0.45, tile: 0.9, grain: 'z' });
  const screens = [];

  // ---- standing desk ----
  box(f, [1.7, 0.035, 0.75], [1.55, 0.75, 0.42], walnut, { r: 0.008 });
  for (const x of [0.95, 2.15]) {
    box(f, [0.075, 0.71, 0.09], [x, 0.375, 0.42], M.black);
    box(f, [0.08, 0.03, 0.7], [x, 0.015, 0.42], M.black, { r: 0.01 });
  }
  box(f, [1.2, 0.05, 0.03], [1.55, 0.69, 0.42], M.black);
  // riser shelf
  box(f, [1.15, 0.022, 0.22], [1.55, S + 0.1, 0.17], walnut, { r: 0.005 });
  for (const x of [1.02, 2.08]) box(f, [0.03, 0.09, 0.2], [x, S + 0.045, 0.17], M.black);

  // ---- stacked monitors ----
  cyl(f, 0.018, 0.9, [1.55, S + 0.56, 0.07], M.black);
  box(f, [0.24, 0.012, 0.16], [1.55, S + 0.117, 0.12], M.black, { r: 0.004 });
  box(f, [0.63, 0.375, 0.025], [1.55, S + 0.33, 0.19], M.blackGloss, { r: 0.006 });
  const main = slab(f, 0.61, 0.345, [1.55, S + 0.335, 0.2035], screenMaterial(tex.code));
  const top = grp(f, [1.55, S + 0.74, 0.2]);
  top.rotation.x = 0.2;
  box(top, [0.63, 0.375, 0.025], [0, 0, 0], M.blackGloss, { r: 0.006 });
  const upper = slab(top, 0.61, 0.345, [0, 0.005, 0.0135], screenMaterial(tex.dashboard));
  main.userData.dynamic = upper.userData.dynamic = true;
  screens.push(main.material, upper.material);

  // ---- audio ----
  speaker(f, 0.86);
  speaker(f, 2.26);
  const phones = grp(f, [0.86, S + 0.52, 0.2]);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.011, 8, 24, Math.PI), M.black);
  band.castShadow = true;
  phones.add(band);
  for (const s of [-1, 1]) cyl(phones, 0.045, 0.035, [s * 0.108, -0.03, 0], M.charcoal, { rot: [0, 0, Math.PI / 2] });
  // mic on a boom arm
  cyl(f, 0.012, 0.3, [1.08, S + 0.15, 0.1], M.black);
  cyl(f, 0.01, 0.34, [1.19, S + 0.36, 0.14], M.black, { rot: [0, 0, 0.75] });
  cyl(f, 0.024, 0.11, [1.31, S + 0.4, 0.2], M.charcoal, { rot: [Math.PI / 2, 0, 0] });

  // ---- on the desk ----
  box(f, [0.82, 0.004, 0.4], [1.83, S + 0.002, 0.55], mat(0xffffff, { map: tex.deskMat, roughness: 0.9 }), { cast: false });
  keyboard(f, 1.66, 0.56);
  box(f, [0.062, 0.032, 0.105], [1.98, S + 0.02, 0.57], M.charcoal, { r: 0.014 });
  box(f, [0.075, 0.075, 0.022], [1.9, S + 0.15, 0.2], M.white, { r: 0.006 });
  // paint station at the left end
  box(f, [0.24, 0.2, 0.2], [1.07, S + 0.1, 0.42], mat(0x8e9197, { roughness: 0.6 }), { r: 0.005 });
  for (let i = 0; i < 4; i++) box(f, [0.21, 0.035, 0.005], [1.07, S + 0.04 + i * 0.045, 0.523], M.white);
  box(f, [0.22, 0.06, 0.17], [1.07, S + 0.23, 0.42], mat(0xb8322d, { roughness: 0.5 }), { r: 0.005 });
  const r = rng(5);
  const hues = [0xc9413b, 0xe0a030, 0x2f6fb5, 0x2f8f5a, 0xf2f2f2, 0x1a1a1a, 0xd97a2b, 0x7a4fb0];
  const glass = mat(0xe9e9e4, { roughness: 0.2 });
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      bottle(f, [1.24 + i * 0.034, S, 0.36 + j * 0.036], 0.012, 0.05, glass, mat(hues[Math.floor(r() * hues.length)], { roughness: 0.4 }));
    }
  }
  cyl(f, [0.04, 0.034], 0.13, [1.3, S + 0.065, 0.62], mat(0x35506b, { roughness: 0.35, metalness: 0.3 }));
  cyl(f, 0.04, 0.085, [1.42, S + 0.043, 0.66], mat(0x2f3a3f, { roughness: 0.3, metalness: 0.5 }));
  // two figures on the right
  const olive = [mat(0x47553a), mat(0x23281f), mat(0xb9a05a)];
  mecha(f, [2.1, S, 0.5], 0.2, olive, 0.4, 0);
  figure(f, [2.0, S + 0.1, 0.14], 0.17, M.black, 0.2, M.charcoal);

  // ---- cables and the small things that make a desk look used ----
  const teal = mat(0x7fd6c9, { roughness: 0.5 });
  const coil = [[1.84, S + 0.022, 0.5]];
  for (let i = 0; i <= 70; i++) {
    const t = i / 70;
    const a = t * Math.PI * 2 * 12;
    coil.push([1.87 + t * 0.2, S + 0.014 + Math.sin(a) * 0.007, 0.46 - t * 0.1 + Math.cos(a) * 0.007]);
  }
  coil.push([2.1, S + 0.008, 0.3], [2.02, S + 0.006, 0.12]);
  cable(f, coil, 0.0026, teal);
  const wire = M.rubber;
  cable(f, [[1.5, S + 0.3, 0.17], [1.49, S + 0.16, 0.1], [1.44, S + 0.118, 0.07], [1.3, S + 0.116, 0.07]], 0.004, wire);
  cable(f, [[1.6, S + 0.7, 0.17], [1.61, S + 0.4, 0.08], [1.63, S + 0.12, 0.06], [1.8, S + 0.115, 0.07]], 0.004, wire);
  cable(f, [[0.77, S + 0.47, 0.2], [0.73, S + 0.3, 0.25], [0.76, S + 0.06, 0.31], [0.9, S + 0.006, 0.36], [1.0, S + 0.006, 0.3]], 0.003, wire);
  cable(f, [[1.98, S + 0.03, 0.52], [1.99, S + 0.008, 0.44], [2.02, S + 0.006, 0.3], [2.0, S + 0.006, 0.14]], 0.002, wire);
  cable(f, [[2.74, 0.64, 0.14], [2.76, 0.5, 0.03], [2.78, 0.2, 0.025], [2.8, 0.02, 0.03]], 0.004, wire);
  // power strip and a charger at the back of the desk
  box(f, [0.26, 0.035, 0.055], [2.0, S + 0.018, 0.1], M.white, { r: 0.008 });
  for (let i = 0; i < 4; i++) box(f, [0.03, 0.004, 0.03], [1.91 + i * 0.058, S + 0.037, 0.1], M.charcoal);
  box(f, [0.04, 0.045, 0.04], [1.91, S + 0.058, 0.1], M.white, { r: 0.006 });
  // webcam on the top monitor
  box(top, [0.1, 0.032, 0.035], [0, 0.205, 0.005], M.black, { r: 0.012 });
  cyl(top, 0.011, 0.01, [0, 0.205, 0.024], mat(0x1b2a4a, { roughness: 0.1, metalness: 0.6 }), { rot: [Math.PI / 2, 0, 0] });
  // notebook, pen, sticky notes, mug handle
  box(f, [0.14, 0.016, 0.2], [0.86, S + 0.008, 0.6], mat(0x3a2418, { roughness: 0.7 }), { r: 0.004, rot: [0, 0.2, 0] });
  box(f, [0.008, 0.018, 0.2], [0.9, S + 0.009, 0.61], M.black, { rot: [0, 0.2, 0] });
  cyl(f, 0.004, 0.14, [0.99, S + 0.005, 0.66], mat(0xc9a13b, { metalness: 0.7, roughness: 0.3 }), { rot: [Math.PI / 2, 0, 0.4], seg: 8 });
  box(f, [0.075, 0.006, 0.075], [2.3, S + 0.003, 0.64], mat(0xf2a0b5, { roughness: 0.9 }), { rot: [0, 0.3, 0], cast: false });
  box(f, [0.075, 0.004, 0.075], [2.31, S + 0.008, 0.645], mat(0xf6dc6a, { roughness: 0.9 }), { rot: [0, -0.2, 0], cast: false });
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 8, 16, Math.PI), mat(0x2f3a3f, { roughness: 0.3, metalness: 0.5 }));
  handle.position.set(1.46, S + 0.043, 0.66);
  handle.rotation.z = -Math.PI / 2;
  handle.castShadow = true;
  f.add(handle);

  // ---- under and beside the desk ----
  box(f, [0.2, 0.44, 0.42], [2.3, 0.23, 0.36], M.charcoal, { r: 0.01 });
  box(f, [0.004, 0.3, 0.3], [2.198, 0.24, 0.36], mat(0x0a0a0c, { roughness: 0.1, emissive: 0x4a7fff, emissiveIntensity: 0.25 }));
  box(f, [0.38, 0.34, 0.38], [1.35, 0.17, 0.4], mat(0x39415a, { roughness: 1 }), { r: 0.02 });
  box(f, [0.39, 0.04, 0.39], [1.35, 0.36, 0.4], mat(0xd9c9a8, { roughness: 1 }), { r: 0.015 });
  officeChair(f, [0.98, 0, 1.3], Math.PI - 0.55);
  // side unit with the desk lamp
  box(f, [0.37, 0.62, 0.4], [2.76, 0.31, 0.24], M.black, { r: 0.008 });
  for (const y of [0.18, 0.44]) box(f, [0.33, 0.22, 0.01], [2.76, y, 0.443], M.charcoal);
  cyl(f, 0.075, 0.02, [2.76, 0.63, 0.24], M.black);
  cyl(f, 0.008, 0.42, [2.72, 0.84, 0.24], M.black, { rot: [0, 0, 0.2] });
  cyl(f, 0.008, 0.26, [2.6, 1.1, 0.27], M.black, { rot: [0.2, 0, 1.0] });
  cyl(f, [0.03, 0.085], 0.12, [2.5, 1.12, 0.3], M.black, { rot: [0.2, 0, 0.35], seg: 24 });

  // ---- corner shelf: kits still in their boxes ----
  box(f, [1.6, 0.025, 0.28], [0.8, 2.4, 0.14], M.black);
  for (let i = 0; i < 5; i++) box(f, [0.33, 0.085, 0.25], [0.19 + (i % 2) * 0.01, 2.456 + i * 0.087, 0.14], M.cardboard);
  kitBox(f, [0.58, 2.58, 0.13], [0.34, 0.33, 0.09], tex.kits[0]);
  kitBox(f, [0.94, 2.55, 0.13], [0.34, 0.27, 0.1], tex.kits[1]);
  kitBox(f, [1.33, 2.57, 0.13], [0.4, 0.31, 0.1], tex.kits[2]);
  kitBox(f, [0.94, 2.75, 0.13], [0.3, 0.12, 0.2], tex.kits[4]);

  // ---- shelf of built kits ----
  box(f, [1.4, 0.02, 0.2], [1.2, 1.95, 0.1], M.black);
  const liveries = [
    [mat(0x3d4a36), mat(0x1e2219), mat(0xa9a06a)],
    [mat(0x25272c), mat(0x111214), mat(0xc9413b)],
    [mat(0xb9302b), mat(0x3a1512), mat(0xe0c060)],
    [mat(0x4a5d3c), mat(0x23281f), mat(0xd9d4c7)],
    [mat(0x2d4f8f), mat(0x16233f), mat(0xe9e9e4)],
    [mat(0x7d8288), mat(0x34373b), mat(0x2d4f8f)],
  ];
  for (let i = 0; i < 8; i++) {
    mecha(f, [0.6 + i * 0.172, 1.96, 0.1], 0.15 + (i % 3) * 0.02, liveries[i % liveries.length], (r() - 0.5) * 0.5, i);
  }

  // ---- pegboards and what hangs on them ----
  const pegB = tex.pegBlack.clone(); pegB.repeat.set(5, 6);
  box(f, [0.6, 0.72, 0.012], [1.55, 1.5, 0.008], mat(0xffffff, { map: pegB, roughness: 0.6 }));
  box(f, [0.3, 0.015, 0.16], [2.02, 2.0, 0.08], M.black);
  box(f, [0.24, 0.04, 0.13], [2.02, 2.03, 0.08], M.blackGloss, { r: 0.008 });
  for (let i = 0; i < 4; i++) box(f, [0.012, 0.17, 0.012], [1.92 + i * 0.066, 2.13, 0.03], M.black, { rot: [0, 0, (i - 1.5) * 0.09] });

  const pegG = tex.pegGrey.clone(); pegG.repeat.set(6, 6);
  box(f, [0.76, 0.7, 0.012], [2.54, 1.52, 0.02], mat(0xffffff, { map: pegG, roughness: 0.55, metalness: 0.2 }));
  box(f, [0.1, 0.11, 0.07], [2.3, 1.36, 0.065], M.white, { r: 0.01 });
  const tools = [0xd9643a, 0x2f8f5a, 0xc9413b, 0x1a1a1a];
  for (let i = 0; i < 4; i++) cyl(f, 0.006, 0.12, [2.27 + i * 0.02, 1.46, 0.065], mat(tools[i]), { rot: [0, 0, (i - 1.5) * 0.12] });
  box(f, [0.36, 0.015, 0.1], [2.36, 1.62, 0.075], M.black);
  catFigurine(f, [2.26, 1.628, 0.075], 0.075, mat(0xe0a98a, { roughness: 0.6 }));
  catFigurine(f, [2.36, 1.628, 0.075], 0.075, mat(0x1c1c1e, { roughness: 0.5 }));
  catFigurine(f, [2.46, 1.628, 0.075], 0.075, mat(0xeeeeea, { roughness: 0.5 }));
  box(f, [0.52, 0.015, 0.12], [2.42, 1.9, 0.08], M.black);
  const whiteKit = [mat(0xe9e9e4), mat(0x2d4f8f), mat(0xc9413b)];
  for (let i = 0; i < 3; i++) mecha(f, [2.22 + i * 0.09, 1.908, 0.08], 0.12, i === 1 ? liveries[1] : whiteKit, 0, i + 1);
  figure(f, [2.52, 1.908, 0.08], 0.12, mat(0xe9e9e4), 0, mat(0xb9302b));
  const cartons = [0x2f6f8f, 0x1f3f63, 0xd9a0a8, 0x25272c];
  for (let i = 0; i < 4; i++) box(f, [0.22, 0.04, 0.1], [2.78, 1.628 + i * 0.041, 0.075], mat(cartons[i], { roughness: 0.6 }));
  box(f, [0.24, 0.015, 0.1], [2.78, 1.6, 0.075], M.black);

  // ---- top shelves: plushies and the dog poster ----
  box(f, [0.52, 0.02, 0.2], [2.36, 2.22, 0.1], M.black);
  const plushColours = [0xc9413b, 0xe0762b, 0x7fb04a, 0x1c1c1e, 0x9fb0c9, 0xe7a6b8, 0xd94a3a];
  for (let i = 0; i < 4; i++) plush(f, [2.17 + i * 0.125, 2.23, 0.09], 0.058, plushColours[i]);
  for (let i = 0; i < 3; i++) plush(f, [2.23 + i * 0.125, 2.335, 0.07], 0.055, plushColours[4 + i]);
  box(f, [0.4, 0.02, 0.2], [2.83, 2.22, 0.1], M.black);
  box(f, [0.26, 0.34, 0.016], [2.86, 2.4, 0.06], M.black, { rot: [-0.12, 0, 0] });
  slab(f, 0.24, 0.32, [2.86, 2.4, 0.07], mat(0xffffff, { map: tex.dog, roughness: 0.7 }), { rot: [-0.12, 0, 0] });
  box(f, [0.05, 0.3, 0.2], [2.68, 2.38, 0.1], M.charcoal);

  return {
    screens,
    lamp: f.localToWorld(new THREE.Vector3(2.5, 1.08, 0.31)),
    lampTarget: f.localToWorld(new THREE.Vector3(2.2, S, 0.5)),
    monitors: f.localToWorld(new THREE.Vector3(1.55, S + 0.52, 0.24)),
  };
}
