// Reusable props: figures, bottles, boxes, the chair. All generic designs.
import * as THREE from 'three';
import { mat, box, cyl, ball, slab, grp } from '../lib/build.js';

export const M = {
  black: mat(0x17171a, { roughness: 0.55 }),
  blackGloss: mat(0x121214, { roughness: 0.3 }),
  charcoal: mat(0x2b2c30, { roughness: 0.7 }),
  steel: mat(0xc8ccd2, { metalness: 1, roughness: 0.3 }),
  chrome: mat(0xe6e8ea, { metalness: 1, roughness: 0.12 }),
  white: mat(0xf1f0ec, { roughness: 0.5 }),
  cardboard: mat(0xb48d5f, { roughness: 0.95 }),
  primer: mat(0x9c9da1, { roughness: 0.85 }),
  resinTan: mat(0xcfa27a, { roughness: 0.7 }),
  rubber: mat(0x1d1d1f, { roughness: 0.95 }),
};

/** A generic robot model kit, `h` metres tall, standing on pos. */
export function mecha(parent, pos, h, [main, dark, accent], rotY = 0, variant = 0) {
  const g = grp(parent, pos, rotY);
  g.scale.setScalar(h);
  const joint = M.charcoal;
  for (const s of [-1, 1]) {
    // leg: foot, flared shin, knee guard, thigh
    box(g, [0.16, 0.06, 0.28], [s * 0.115, 0.03, 0.04], dark);
    box(g, [0.1, 0.05, 0.1], [s * 0.115, 0.075, 0.13], main);
    box(g, [0.155, 0.22, 0.19], [s * 0.115, 0.17, 0], main);
    box(g, [0.1, 0.16, 0.05], [s * 0.115, 0.17, -0.11], dark);
    box(g, [0.13, 0.08, 0.2], [s * 0.115, 0.3, 0.02], accent);
    box(g, [0.12, 0.17, 0.14], [s * 0.11, 0.4, 0], main);
    // skirt armour
    box(g, [0.13, 0.13, 0.035], [s * 0.085, 0.45, 0.1], main, { rot: [-0.25, 0, 0] });
    box(g, [0.04, 0.15, 0.16], [s * 0.2, 0.45, 0], main, { rot: [0, 0, s * 0.2] });
    // arm: shoulder with a ridge, upper arm, forearm, fist
    box(g, [0.19, 0.17, 0.23], [s * 0.31, 0.75, 0], main);
    box(g, [0.2, 0.03, 0.12], [s * 0.32, 0.845, 0], accent);
    box(g, [0.09, 0.14, 0.1], [s * 0.31, 0.61, 0], joint);
    box(g, [0.12, 0.19, 0.15], [s * 0.315, 0.46, 0.02], main);
    box(g, [0.08, 0.07, 0.09], [s * 0.315, 0.33, 0.03], dark);
    // backpack thrusters
    cyl(g, [0.045, 0.03], 0.1, [s * 0.08, 0.6, -0.2], joint, { seg: 8 });
    // chest vents
    box(g, [0.1, 0.055, 0.03], [s * 0.09, 0.72, 0.135], accent);
  }
  box(g, [0.3, 0.08, 0.17], [0, 0.5, 0], joint);
  box(g, [0.07, 0.1, 0.06], [0, 0.46, 0.1], accent);
  box(g, [0.22, 0.1, 0.18], [0, 0.57, 0], dark);
  box(g, [0.42, 0.2, 0.26], [0, 0.71, 0], main);
  box(g, [0.14, 0.07, 0.05], [0, 0.63, 0.12], dark);
  box(g, [0.2, 0.04, 0.2], [0, 0.82, 0], dark);
  // head: helmet, visor, chin, crest
  box(g, [0.13, 0.12, 0.14], [0, 0.89, 0], main);
  box(g, [0.1, 0.028, 0.02], [0, 0.9, 0.071], accent);
  box(g, [0.05, 0.035, 0.03], [0, 0.845, 0.07], dark);
  box(g, [0.02, 0.1, 0.1], [0, 0.97, -0.01], accent);
  box(g, [0.28, 0.24, 0.1], [0, 0.69, -0.17], dark);
  if (variant % 3 === 0) {
    box(g, [0.04, 0.06, 0.5], [0.43, 0.36, 0.14], joint, { rot: [-0.2, 0, 0] });
    box(g, [0.03, 0.1, 0.05], [0.43, 0.31, 0.1], joint);
    cyl(g, 0.012, 0.2, [0.43, 0.42, 0.46], dark, { rot: [Math.PI / 2 - 0.2, 0, 0], seg: 6 });
  }
  if (variant % 3 === 1) {
    box(g, [0.025, 0.95, 0.025], [0.44, 0.55, 0.05], joint, { rot: [0.1, 0, -0.08] });
    box(g, [0.03, 0.16, 0.12], [0.47, 1.02, 0.1], accent, { rot: [0.1, 0, -0.08] });
  }
  if (variant % 3 === 2) {
    for (const s of [-1, 1]) box(g, [0.3, 0.42, 0.03], [s * 0.3, 0.86, -0.25], main, { rot: [0.25, s * 0.5, s * 0.5] });
  }
  if (variant % 2 === 1) {
    box(g, [0.04, 0.36, 0.26], [-0.45, 0.5, 0.04], main);
    box(g, [0.02, 0.2, 0.1], [-0.475, 0.52, 0.04], accent);
  }
  return g;
}

/** A head-and-shoulders bust on a round base. */
export function bust(parent, pos, h, material, rotY = 0, base = M.black) {
  const g = grp(parent, pos, rotY);
  g.scale.setScalar(h);
  cyl(g, 0.2, 0.07, [0, 0.035, 0], base);
  ball(g, 0.24, [0, 0.27, 0], material, { scale: [1.5, 0.75, 0.85] });
  cyl(g, [0.085, 0.1], 0.18, [0, 0.5, 0], material);
  ball(g, 0.19, [0, 0.74, 0.01], material, { scale: [0.88, 1.12, 1] });
  box(g, [0.05, 0.07, 0.06], [0, 0.72, 0.18], material, { r: 0.02 });
  return g;
}

/** A standing human figure, for statues and small action figures. */
export function figure(parent, pos, h, material, rotY = 0, cape = null) {
  const g = grp(parent, pos, rotY);
  g.scale.setScalar(h);
  for (const s of [-1, 1]) {
    cyl(g, [0.06, 0.045], 0.46, [s * 0.075, 0.23, 0], material);
    cyl(g, [0.045, 0.035], 0.36, [s * 0.2, 0.62, 0], material, { rot: [0, 0, s * 0.18] });
  }
  box(g, [0.3, 0.34, 0.16], [0, 0.63, 0], material, { r: 0.06 });
  ball(g, 0.085, [0, 0.9, 0], material);
  if (cape) box(g, [0.34, 0.6, 0.02], [0, 0.5, -0.09], cape, { rot: [0.08, 0, 0] });
  cyl(g, 0.2, 0.02, [0, 0.0, 0], M.black);
  return g;
}

/** A winged creature, used for the unpainted grey print on the shelf. */
export function dragon(parent, pos, size, material, rotY = 0) {
  const g = grp(parent, pos, rotY);
  g.scale.setScalar(size);
  const flat = mat(material.color.getHex(), { roughness: 0.85, flatShading: true, side: THREE.DoubleSide });
  cyl(g, 0.3, 0.03, [0, 0.015, 0], material);
  ball(g, 0.18, [0, 0.42, 0], flat, { scale: [1.6, 0.9, 0.9], seg: 8 });
  cyl(g, [0.05, 0.09], 0.34, [0.3, 0.6, 0], flat, { rot: [0, 0, -0.7], seg: 7 });
  cyl(g, [0.0, 0.07], 0.2, [0.47, 0.74, 0], flat, { rot: [0, 0, -1.5], seg: 6 });
  cyl(g, [0.07, 0.01], 0.5, [-0.42, 0.34, 0], flat, { rot: [0, 0, 1.2], seg: 6 });
  for (const s of [-1, 1]) {
    cyl(g, [0.05, 0.03], 0.3, [0.1, 0.18, s * 0.1], flat, { seg: 6 });
    const wing = new THREE.Shape();
    wing.moveTo(0, 0); wing.lineTo(0.15, 0.55); wing.lineTo(-0.2, 0.42); wing.lineTo(-0.45, 0.5); wing.lineTo(-0.35, 0.2); wing.lineTo(-0.5, 0.05);
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(wing), flat);
    mesh.position.set(0.05, 0.5, s * 0.08);
    mesh.rotation.set(s * 0.9, 0, 0);
    mesh.castShadow = true;
    g.add(mesh);
  }
  return g;
}

/** A round plush toy: big head, small limbs, a tuft on top. */
export function plush(parent, pos, r, colour, face = 0xf6dccf) {
  const body = mat(colour, { roughness: 1 });
  const skin = mat(face, { roughness: 0.9 });
  const blush = mat(0xf09aa8, { roughness: 0.9 });
  const g = grp(parent, pos);
  ball(g, r * 0.7, [0, r * 0.55, 0], body, { scale: [1, 0.9, 0.85] });
  ball(g, r, [0, r * 1.5, 0], body, { scale: [1.05, 0.95, 0.95] });
  ball(g, r * 0.7, [0, r * 1.42, r * 0.42], skin, { scale: [1, 0.85, 0.6] });
  cyl(g, [0, r * 0.22], r * 0.5, [0, r * 2.55, 0], mat(0x5fa84a, { roughness: 1 }), { seg: 6, rot: [0, 0, 0.3] });
  for (const s of [-1, 1]) {
    ball(g, r * 0.32, [s * r * 0.72, r * 2.2, 0], body);
    ball(g, r * 0.24, [s * r * 0.62, r * 0.65, r * 0.25], body);
    ball(g, r * 0.26, [s * r * 0.35, r * 0.12, r * 0.3], body, { scale: [1, 0.7, 1.3] });
    ball(g, r * 0.13, [s * r * 0.27, r * 1.5, r * 0.8], M.black, { scale: [1, 1.25, 0.5] });
    ball(g, r * 0.04, [s * r * 0.25, r * 1.56, r * 0.86], M.white);
    ball(g, r * 0.12, [s * r * 0.47, r * 1.3, r * 0.72], blush, { scale: [1, 0.6, 0.4] });
  }
  return g;
}

export function catFigurine(parent, pos, h, material) {
  const g = grp(parent, pos);
  ball(g, h * 0.36, [0, h * 0.34, 0], material, { scale: [1, 0.95, 0.9] });
  ball(g, h * 0.27, [0, h * 0.75, 0.005], material);
  for (const s of [-1, 1]) cyl(g, [0, h * 0.09], h * 0.16, [s * h * 0.15, h * 1.0, 0], material, { seg: 4 });
  return g;
}

/** A dropper paint bottle. */
export function bottle(parent, pos, r, h, body, cap) {
  cyl(parent, r, h, [pos[0], pos[1] + h / 2, pos[2]], body, { seg: 10 });
  cyl(parent, [r * 0.25, r * 0.7], h * 0.4, [pos[0], pos[1] + h * 1.2, pos[2]], cap, { seg: 8 });
}

/** A closed box with a printed cover on its +z face. */
export function kitBox(parent, pos, size, cover) {
  const [w, h, d] = size;
  box(parent, size, pos, M.charcoal);
  slab(parent, w * 0.98, h * 0.98, [pos[0], pos[1], pos[2] + d / 2 + 0.001], mat(0xffffff, { map: cover, roughness: 0.6 }));
}

/** A mesh office chair. Built facing +z. */
export function officeChair(parent, pos, rotY) {
  const g = grp(parent, pos, rotY);
  const frame = mat(0x8e9298, { roughness: 0.5, metalness: 0.3 });
  const mesh = mat(0x232428, { roughness: 1 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    box(g, [0.3, 0.035, 0.045], [Math.cos(a) * 0.15, 0.09, Math.sin(a) * 0.15], frame, { rot: [0, -a, 0], r: 0.01 });
    ball(g, 0.03, [Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3], M.rubber);
  }
  cyl(g, 0.028, 0.34, [0, 0.27, 0], M.chrome);
  box(g, [0.5, 0.07, 0.48], [0, 0.48, 0], mesh, { r: 0.03 });
  box(g, [0.46, 0.56, 0.05], [0, 0.86, -0.25], mesh, { rot: [-0.14, 0, 0], r: 0.025 });
  box(g, [0.05, 0.62, 0.04], [0, 0.82, -0.29], frame, { rot: [-0.14, 0, 0] });
  box(g, [0.3, 0.15, 0.05], [0, 1.24, -0.31], mesh, { r: 0.025 });
  for (const s of [-1, 1]) {
    box(g, [0.04, 0.2, 0.04], [s * 0.27, 0.6, -0.02], frame);
    box(g, [0.07, 0.03, 0.26], [s * 0.27, 0.71, 0.02], M.rubber, { r: 0.012 });
  }
  return g;
}
