// Wall B: the tool chest with both 3D printers, the shrimp tank and the
// espresso bar. Local coordinates equal world coordinates here.
import * as THREE from 'three';
import { mat, box, cyl, ball, slab, grp, rng } from '../lib/build.js';
import { M, bust } from './props.js';

const SB = 0.778; // desk surface height

function toolChest(f) {
  const cx = 0.65, cz = 0.33;
  for (const x of [0.22, 1.08]) for (const z of [0.12, 0.54]) {
    box(f, [0.04, 0.82, 0.04], [x, 0.47, z], M.black);
    cyl(f, 0.03, 0.025, [x, 0.03, z], M.rubber, { rot: [Math.PI / 2, 0, 0] });
  }
  box(f, [0.9, 0.3, 0.45], [cx, 0.73, cz], M.black, { r: 0.006 });
  for (const y of [0.8, 0.66]) {
    box(f, [0.86, 0.125, 0.008], [cx, y, cz + 0.227], M.charcoal);
    box(f, [0.8, 0.018, 0.02], [cx, y + 0.03, cz + 0.24], M.steel);
  }
  box(f, [0.9, 0.02, 0.45], [cx, 0.14, cz], M.black);
  box(f, [0.5, 0.2, 0.34], [0.5, 0.26, cz], mat(0xdfe6e8, { roughness: 0.2, transparent: true, opacity: 0.45 }), { r: 0.015, cast: false });
  box(f, [0.52, 0.02, 0.36], [0.5, 0.37, cz], M.white);
  box(f, [0.93, 0.035, 0.48], [cx, 0.9, cz], mat(0xc79a62, { roughness: 0.5 }), { r: 0.006 });
  return 0.918;
}

// Open-frame filament printer: bed slides, toolhead rides a gantry.
function filamentPrinter(f, x, y, z) {
  const shell = mat(0xd4d6d8, { roughness: 0.45 });
  const g = grp(f, [x, y, z]);
  box(g, [0.36, 0.07, 0.34], [0, 0.035, 0], shell, { r: 0.012 });
  box(g, [0.1, 0.04, 0.004], [-0.1, 0.04, 0.171], M.blackGloss);
  box(g, [0.26, 0.008, 0.26], [0, 0.085, 0.03], mat(0x3a3327, { roughness: 0.9 }));
  for (const s of [-1, 1]) box(g, [0.035, 0.38, 0.045], [s * 0.16, 0.26, -0.1], shell, { r: 0.008 });
  box(g, [0.355, 0.035, 0.045], [0, 0.45, -0.1], shell, { r: 0.008 });
  cyl(g, 0.007, 0.32, [0, 0.27, -0.08], M.chrome, { rot: [0, 0, Math.PI / 2] });
  box(g, [0.34, 0.028, 0.03], [0, 0.27, -0.1], M.charcoal);
  box(g, [0.065, 0.1, 0.07], [0.04, 0.26, -0.05], shell, { r: 0.01 });
  cyl(g, [0.012, 0.003], 0.025, [0.04, 0.2, -0.04], M.steel);
  // a half-finished print on the bed
  bust(g, [0.02, 0.089, 0.03], 0.07, mat(0xe0762b, { roughness: 0.55 }), 0.3, mat(0xe0762b, { roughness: 0.55 }));
  // filament spool on a side arm
  const spool = grp(g, [0.17, 0.52, -0.1]);
  spool.rotation.z = Math.PI / 2;
  cyl(spool, 0.095, 0.006, [0, 0.035, 0], M.charcoal, { seg: 28 });
  cyl(spool, 0.095, 0.006, [0, -0.035, 0], M.charcoal, { seg: 28 });
  cyl(spool, 0.08, 0.064, [0, 0, 0], mat(0xe0762b, { roughness: 0.6 }), { seg: 28 });
}

// Resin printer: a block base under a tinted hood.
function resinPrinter(f, x, y, z) {
  const g = grp(f, [x, y, z]);
  box(g, [0.22, 0.13, 0.22], [0, 0.065, 0], M.black, { r: 0.012 });
  box(g, [0.07, 0.045, 0.004], [0, 0.07, 0.111], mat(0x0a0a0c, { emissive: 0x4fa3ff, emissiveIntensity: 0.5 }));
  box(g, [0.14, 0.02, 0.1], [0, 0.14, 0], M.steel);
  cyl(g, 0.006, 0.22, [0, 0.24, -0.07], M.chrome);
  box(g, [0.11, 0.03, 0.075], [0, 0.26, -0.01], M.steel);
  box(g, [0.2, 0.27, 0.2], [0, 0.265, 0], mat(0xd98a1f, { roughness: 0.12, transparent: true, opacity: 0.42 }), { r: 0.015, cast: false });
}

function drawerUnit(f, x) {
  box(f, [0.42, 0.72, 0.5], [x, 0.38, 0.45], M.black, { r: 0.005 });
  for (let i = 0; i < 4; i++) {
    box(f, [0.4, 0.165, 0.012], [x, 0.11 + i * 0.178, 0.702], M.charcoal, { r: 0.004 });
    box(f, [0.12, 0.014, 0.012], [x, 0.17 + i * 0.178, 0.708], M.black);
  }
}

function aquarium(f, x, z) {
  const g = grp(f, [x, SB, z]);
  const w = 0.6, d = 0.34, h = 0.2;
  const glass = mat(0xd6ece8, { roughness: 0.04, transparent: true, opacity: 0.16 });
  box(g, [w, h, 0.006], [0, h / 2, d / 2], glass, { cast: false });
  box(g, [w, h, 0.006], [0, h / 2, -d / 2], glass, { cast: false });
  box(g, [0.006, h, d], [-w / 2, h / 2, 0], glass, { cast: false });
  box(g, [0.006, h, d], [w / 2, h / 2, 0], glass, { cast: false });
  box(g, [w + 0.02, 0.006, d + 0.02], [0, 0.003, 0], M.black);
  box(g, [w - 0.014, 0.03, d - 0.014], [0, 0.021, 0], mat(0x2b2925, { roughness: 1 }));
  box(g, [0.22, 0.012, 0.16], [-0.12, 0.04, 0.04], mat(0xcbb893, { roughness: 1 }), { r: 0.005 });
  box(g, [w - 0.014, 0.125, d - 0.014], [0, 0.099, 0], mat(0x4f8f78, { roughness: 0.03, transparent: true, opacity: 0.3 }), { cast: false });
  const r = rng(19);
  const stone = mat(0x6d6c68, { roughness: 0.9, flatShading: true });
  for (let i = 0; i < 5; i++) ball(g, 0.025 + r() * 0.025, [-0.24 + r() * 0.3, 0.05, -0.1 + r() * 0.16], stone, { seg: 6, scale: [1.3, 0.8, 1] });
  const greens = [mat(0x3f8f4a, { roughness: 0.7 }), mat(0x2f6f3a, { roughness: 0.7 }), mat(0x6fae4a, { roughness: 0.7 })];
  for (let i = 0; i < 26; i++) {
    const hgt = 0.03 + r() * 0.07;
    cyl(g, [0.001, 0.008], hgt, [-0.27 + r() * 0.5, 0.036 + hgt / 2, -0.14 + r() * 0.27], greens[i % 3], { seg: 5, rot: [(r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5] });
  }
  for (let i = 0; i < 5; i++) ball(g, 0.018 + r() * 0.012, [-0.2 + r() * 0.4, 0.05, -0.12 + r() * 0.24], greens[1], { seg: 7 });
  // driftwood breaking the surface, with a fern growing out of it
  const wood = mat(0x5a4534, { roughness: 1, flatShading: true });
  cyl(g, [0.022, 0.04], 0.3, [0.17, 0.16, -0.02], wood, { rot: [0.25, 0, -0.35], seg: 6 });
  cyl(g, [0.012, 0.025], 0.18, [0.1, 0.12, 0.04], wood, { rot: [-0.5, 0, 0.9], seg: 6 });
  ball(g, 0.035, [0.21, 0.3, -0.05], greens[1], { seg: 7, scale: [1.3, 0.6, 1.2] });
  const frond = mat(0x3f8a45, { roughness: 0.75, side: THREE.DoubleSide });
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + r() * 0.3;
    const stem = grp(g, [0.21, 0.31, -0.05], a);
    const len = 0.14 + r() * 0.1;
    box(stem, [0.04, 0.003, len], [0, len * 0.32, len * 0.42], frond, { rot: [-0.65, 0, 0] });
    box(stem, [0.03, 0.003, len * 0.7], [0, len * 0.6, len * 1.0], frond, { rot: [0.25, 0, 0] });
  }
  // shrimp: animated in main.js
  const shrimp = [];
  const shell = mat(0xd9402b, { roughness: 0.4 });
  for (let i = 0; i < 8; i++) {
    const s = grp(g, [-0.24 + r() * 0.44, 0.045 + r() * 0.01, -0.13 + r() * 0.26], r() * 6.28);
    s.userData.dynamic = true;
    ball(s, 0.004, [0, 0, 0], shell, { seg: 6, scale: [3, 1, 1] });
    ball(s, 0.003, [-0.012, -0.002, 0], shell, { seg: 6, scale: [2, 0.8, 0.8] });
    shrimp.push({ node: s, home: s.position.clone(), phase: r() * 6.28, speed: 0.25 + r() * 0.35 });
  }
  // hanging light
  for (const s of [-1, 1]) {
    cyl(g, 0.006, 0.62, [s * 0.2, 0.31, -0.19], M.steel);
    cyl(g, 0.005, 0.2, [s * 0.2, 0.62, -0.1], M.steel, { rot: [Math.PI / 2, 0, 0] });
    cyl(g, 0.001, 0.07, [s * 0.2, 0.585, 0], M.steel);
  }
  box(g, [0.5, 0.03, 0.13], [0, 0.54, 0], M.black, { r: 0.006 });
  const glow = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xeaf4ff, emissiveIntensity: 1 });
  const strip = slab(g, 0.44, 0.09, [0, 0.524, 0], glow, { rot: [Math.PI / 2, 0, 0] });
  strip.userData.dynamic = true;
  g.updateWorldMatrix(true, false);
  return { shrimp, glow, light: g.localToWorld(new THREE.Vector3(0, 0.5, 0)), target: g.localToWorld(new THREE.Vector3(0, 0, 0)) };
}

function espresso(f, x, z) {
  const g = grp(f, [x, SB, z]);
  box(g, [0.27, 0.05, 0.3], [0, 0.03, 0], M.steel, { r: 0.006 });
  box(g, [0.23, 0.006, 0.17], [0, 0.058, 0.05], M.charcoal);
  box(g, [0.27, 0.3, 0.13], [0, 0.2, -0.085], M.steel, { r: 0.006 });
  box(g, [0.27, 0.12, 0.3], [0, 0.33, 0], M.steel, { r: 0.008 });
  for (let i = 0; i < 4; i++) {
    cyl(g, 0.016, 0.008, [-0.085 + i * 0.057, 0.34, 0.152], M.chrome, { rot: [Math.PI / 2, 0, 0] });
    cyl(g, 0.01, 0.01, [-0.085 + i * 0.057, 0.34, 0.154], M.black, { rot: [Math.PI / 2, 0, 0] });
  }
  cyl(g, 0.022, 0.008, [0, 0.19, -0.016], M.white, { rot: [Math.PI / 2, 0, 0] });
  cyl(g, 0.032, 0.04, [0, 0.25, 0.06], M.chrome);
  cyl(g, 0.036, 0.025, [0, 0.22, 0.06], M.steel);
  cyl(g, 0.012, 0.13, [0, 0.215, 0.15], M.black, { rot: [Math.PI / 2 - 0.15, 0, 0] });
  cyl(g, 0.005, 0.14, [0.12, 0.2, 0.08], M.chrome, { rot: [0.3, 0, -0.2] });
  box(g, [0.2, 0.012, 0.2], [0, 0.396, 0], mat(0xe6d44a, { roughness: 1 }), { r: 0.004 });
}

export function buildWaterWall(f, tex) {
  const top = toolChest(f);
  filamentPrinter(f, 0.44, top, 0.34);
  resinPrinter(f, 0.92, top, 0.34);

  // ---- long black desk ----
  box(f, [2.0, 0.035, 0.58], [2.3, 0.76, 0.45], mat(0x151516, { roughness: 0.32 }), { r: 0.006 });
  drawerUnit(f, 1.53);
  drawerUnit(f, 3.07);
  cyl(f, 0.05, 0.42, [1.92, 0.23, 0.32], mat(0xb9bcc0, { metalness: 0.9, roughness: 0.4 }));
  ball(f, 0.05, [1.92, 0.44, 0.32], mat(0xb9bcc0, { metalness: 0.9, roughness: 0.4 }));
  cyl(f, 0.02, 0.06, [1.92, 0.51, 0.32], M.chrome);

  const tank = aquarium(f, 1.75, 0.44);

  // glass cloche terrarium
  const clear = mat(0xe4f0ee, { roughness: 0.03, transparent: true, opacity: 0.2 });
  cyl(f, 0.085, 0.02, [2.22, SB + 0.01, 0.42], M.black);
  cyl(f, [0.045, 0.08], 0.24, [2.22, SB + 0.14, 0.42], clear, { cast: false, seg: 24 });
  ball(f, 0.045, [2.22, SB + 0.26, 0.42], clear, { cast: false });
  ball(f, 0.05, [2.22, SB + 0.045, 0.42], mat(0x3f7a3f, { roughness: 1, flatShading: true }), { seg: 7, scale: [1.2, 0.6, 1.2] });
  cyl(f, [0.001, 0.006], 0.1, [2.22, SB + 0.11, 0.42], mat(0x4f9a4a), { seg: 5 });

  // ---- espresso bar ----
  espresso(f, 2.6, 0.44);
  box(f, [0.44, 0.006, 0.34], [3.04, SB + 0.003, 0.47], M.rubber);
  cyl(f, 0.055, 0.09, [2.9, SB + 0.05, 0.56], M.black);
  box(f, [0.1, 0.015, 0.015], [2.9, SB + 0.085, 0.56], M.rubber);
  cyl(f, 0.028, 0.02, [2.99, SB + 0.016, 0.34], M.steel);
  ball(f, 0.02, [2.99, SB + 0.06, 0.34], mat(0x6a3a22, { roughness: 0.4 }));
  cyl(f, 0.008, 0.04, [2.99, SB + 0.04, 0.34], M.steel);
  // grinder
  cyl(f, 0.075, 0.03, [3.14, SB + 0.02, 0.45], M.steel, { seg: 28 });
  cyl(f, [0.055, 0.072], 0.3, [3.14, SB + 0.18, 0.45], M.steel, { seg: 28 });
  cyl(f, [0.062, 0.036], 0.12, [3.14, SB + 0.39, 0.45], mat(0x2a2422, { roughness: 0.15, transparent: true, opacity: 0.75 }), { seg: 24 });
  cyl(f, 0.064, 0.012, [3.14, SB + 0.455, 0.45], M.black);
  box(f, [0.03, 0.03, 0.07], [3.14, SB + 0.2, 0.53], M.steel);

  // ---- cubby shelf above the bar ----
  const ply = mat(0xffffff, { map: tex.plywood, roughness: 0.7 });
  const cy = 1.5, cx = 2.92;
  box(f, [0.8, 0.014, 0.2], [cx, cy + 0.18, 0.1], ply);
  box(f, [0.8, 0.014, 0.2], [cx, cy - 0.18, 0.1], ply);
  box(f, [0.8, 0.014, 0.2], [cx + 0.13, cy, 0.1], ply);
  for (const dx of [-0.4, -0.13, 0.4]) box(f, [0.014, 0.37, 0.2], [cx + dx, cy, 0.1], ply);
  cyl(f, 0.045, 0.14, [cx - 0.27, cy - 0.1, 0.1], mat(0xe9eeee, { roughness: 0.05, transparent: true, opacity: 0.35 }), { cast: false });
  cyl(f, 0.048, 0.02, [cx - 0.27, cy - 0.02, 0.1], M.white);
  box(f, [0.14, 0.2, 0.05], [cx + 0.0, cy + 0.29, 0.1], mat(0xe9a0b0, { roughness: 0.8 }), { r: 0.008 });
  box(f, [0.08, 0.1, 0.004], [cx + 0.0, cy + 0.29, 0.128], mat(0x2f6f9f, { roughness: 0.7 }));
  box(f, [0.2, 0.1, 0.14], [cx + 0.0, cy + 0.06, 0.1], M.charcoal, { r: 0.02 });
  box(f, [0.18, 0.12, 0.12], [cx + 0.24, cy - 0.11, 0.1], mat(0x8f9399, { roughness: 0.5 }), { r: 0.012 });
  box(f, [0.16, 0.09, 0.12], [cx - 0.0, cy - 0.12, 0.1], mat(0xd9643a, { roughness: 0.6 }), { r: 0.012 });
  box(f, [0.08, 0.12, 0.008], [3.47, 1.4, 0.006], M.white, { r: 0.004 });

  return tank;
}
