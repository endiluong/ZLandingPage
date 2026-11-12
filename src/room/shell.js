// The room itself: floor, ceiling, walls with their openings, both doors,
// both windows and the curtains.
//
// World layout (metres). x runs east, z runs south, y is up.
//   Wall A  x = 0          desk and entrance door
//   Wall B  z = 0          aquarium and coffee
//   Wall C  x = 3.6        balcony door, then a recess (x to 4.4, z 2.7..4.5)
//   Wall D  z = 4.5        painting cart, bookshelf, TV
//
// Furniture is built in "frames": a group per wall where local x runs to the
// viewer's right along the wall, y is up, and z comes out of the wall into
// the room. See FRAMES below.
import * as THREE from 'three';
import { mat, box, cyl, ball, tiled, grp } from '../lib/build.js';
import { M } from './props.js';

export const ROOM = { w: 3.6, d: 4.5, h: 3.0, recessX: 4.4, recessZ: 2.7 };
const T = 0.12; // wall thickness

export function makeFrames(root) {
  return {
    A: grp(root, [0, 0, 4.5], Math.PI / 2), // local x = 4.5 - world z
    B: grp(root, [0, 0, 0], 0), // local = world
    C: grp(root, [3.6, 0, 0], -Math.PI / 2), // local x = world z
    R: grp(root, [4.4, 0, 2.7], -Math.PI / 2), // recess: local x = world z - 2.7
    N: grp(root, [3.6, 0, 2.7], 0), // recess side wall
    D: grp(root, [4.4, 0, 4.5], Math.PI), // local x = 4.4 - world x
  };
}

/** A wall along one axis with rectangular openings cut out of it. */
function wall(root, material, axis, at, from, to, out, openings = []) {
  const piece = (a, b, y0, y1) => {
    if (b - a < 0.001 || y1 - y0 < 0.001) return;
    const mid = (a + b) / 2;
    const y = (y0 + y1) / 2;
    if (axis === 'x') box(root, [T, y1 - y0, b - a], [at + (out * T) / 2, y, mid], material);
    else box(root, [b - a, y1 - y0, T], [mid, y, at + (out * T) / 2], material);
  };
  let cursor = from;
  for (const o of [...openings].sort((p, q) => p.a - q.a)) {
    piece(cursor, o.a, 0, ROOM.h);
    piece(o.a, o.b, 0, o.y0);
    piece(o.a, o.b, o.y1, ROOM.h);
    cursor = o.b;
  }
  piece(cursor, to, 0, ROOM.h);
}

function wainscot(frame, x0, x1, tex) {
  const tile = mat(0xffffff, { map: tex.wallTile, roughness: 0.25 });
  const band = mat(0xffffff, { map: tex.wallBand, roughness: 0.3 });
  tiled(frame, x0, x1, 0, 1.0, 0.004, tile, [0.3, 0.25], { receive: true });
  tiled(frame, x0, x1, 1.0, 1.2, 0.004, band, [0.5, 0.2], { receive: true });
}

function entranceDoor(frame, tex) {
  const wood = mat(0xffb9a6, { ...tex.pbr.mahogany, gain: 3.2, roughness: 0.42, tile: 1.1, grain: 'y' });
  const x0 = 3.05, x1 = 3.95, cx = 3.5;
  box(frame, [0.08, 2.58, 0.18], [x0 - 0.03, 1.29, -0.03], wood);
  box(frame, [0.08, 2.58, 0.18], [x1 + 0.03, 1.29, -0.03], wood);
  box(frame, [1.06, 0.08, 0.18], [cx, 2.56, -0.03], wood);
  box(frame, [0.9, 0.06, 0.14], [cx, 2.13, -0.03], wood);
  box(frame, [0.9, 2.1, 0.045], [cx, 1.05, -0.03], wood);
  for (const px of [-0.2, 0.2]) {
    for (const [py, ph] of [[0.42, 0.6], [1.12, 0.62], [1.76, 0.5]]) {
      box(frame, [0.3, ph, 0.014], [cx + px, py, -0.003], wood, { r: 0.004 });
    }
  }
  cyl(frame, 0.03, 0.012, [x0 + 0.08, 1.0, 0.0], M.chrome, { rot: [Math.PI / 2, 0, 0] });
  box(frame, [0.13, 0.02, 0.02], [x0 + 0.13, 1.0, 0.03], M.chrome, { r: 0.008 });
  // Frosted transom, lit faintly from the corridor behind.
  box(frame, [0.9, 0.34, 0.012], [cx, 2.34, -0.03], mat(0xe9ece8, { roughness: 0.9, emissive: 0xfff1d6, emissiveIntensity: 0.12 }), { cast: false });
}

function balconyDoor(frame, tex) {
  const wood = mat(0xffb9a6, { ...tex.pbr.mahogany, gain: 3.2, roughness: 0.42, tile: 1.1, grain: 'y' });
  const glass = mat(0xf2f5f3, { roughness: 0.6, transparent: true, opacity: 0.32 });
  const x0 = 1.7, x1 = 2.55, cx = 2.125, z = -0.05;
  box(frame, [0.07, 2.62, 0.16], [x0 - 0.03, 1.31, z], wood);
  box(frame, [0.07, 2.62, 0.16], [x1 + 0.03, 1.31, z], wood);
  box(frame, [0.99, 0.07, 0.16], [cx, 2.6, z], wood);
  box(frame, [0.85, 0.07, 0.12], [cx, 2.12, z], wood);
  // Leaf: solid lower panel, then two columns of four panes.
  box(frame, [0.85, 0.9, 0.04], [cx, 0.45, z], wood);
  box(frame, [0.55, 0.6, 0.012], [cx, 0.45, z + 0.022], wood, { r: 0.004 });
  for (const sx of [x0 + 0.05, x1 - 0.05]) box(frame, [0.1, 1.2, 0.04], [sx, 1.5, z], wood);
  box(frame, [0.035, 1.2, 0.035], [cx, 1.5, z], wood);
  for (let i = 0; i <= 4; i++) box(frame, [0.85, i === 0 || i === 4 ? 0.08 : 0.03, 0.035], [cx, 0.92 + i * 0.29, z], wood);
  box(frame, [0.85, 1.2, 0.006], [cx, 1.5, z], glass, { cast: false });
  // Transom with a chevron grille.
  box(frame, [0.85, 0.4, 0.006], [cx, 2.36, z], glass, { cast: false });
  for (const s of [-1, 1]) {
    for (const off of [0, 0.16]) box(frame, [0.5, 0.022, 0.022], [cx + s * 0.2, 2.3 + off, z], wood, { rot: [0, 0, s * 0.55] });
  }
  box(frame, [0.022, 0.4, 0.022], [cx, 2.36, z], wood);
  box(frame, [0.035, 0.16, 0.02], [x0 + 0.06, 1.05, z + 0.03], M.white);
  box(frame, [0.12, 0.022, 0.022], [x0 + 0.11, 1.08, z + 0.05], M.white, { r: 0.008 });
}

function windowUnit(frame, x0, x1, y0, y1, tex, grille) {
  const wood = mat(0xffb9a6, { ...tex.pbr.mahogany, gain: 3.2, roughness: 0.42, tile: 1.1, grain: 'y' });
  const glass = mat(0xdcebf0, { roughness: 0.05, transparent: true, opacity: 0.14 });
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = x1 - x0, h = y1 - y0, z = -0.06;
  box(frame, [w + 0.1, 0.06, 0.14], [cx, y0 - 0.02, z], wood);
  box(frame, [w + 0.1, 0.06, 0.14], [cx, y1 + 0.02, z], wood);
  for (const sx of [x0, cx, x1]) box(frame, [0.06, h, 0.1], [sx, cy, z], wood);
  for (let i = 1; i < 4; i++) box(frame, [w, 0.028, 0.04], [cx, y0 + (i * h) / 4, z], wood);
  for (const qx of [x0 + w / 4, x1 - w / 4]) box(frame, [0.028, h, 0.04], [qx, cy, z], wood);
  box(frame, [w, h, 0.005], [cx, cy, z], glass, { cast: false });
  if (grille) {
    // Security grille outside the glass: thin diagonal bars.
    for (let i = 0; i < 7; i++) {
      const gx = x0 + ((i + 0.5) * w) / 7;
      box(frame, [0.014, h, 0.014], [gx, cy, z - 0.06], wood);
    }
  }
}

const curtainMaterial = new THREE.MeshStandardMaterial({
  color: 0x5a6672,
  roughness: 0.5,
  metalness: 0.18,
  side: THREE.DoubleSide,
});

/** One curtain panel that bunches up toward `anchor` as it opens. */
function curtainPanel(frame, { anchor, dir, width, top, bottom, z }) {
  const SEG = 44;
  const pleats = Math.round(width / 0.11);
  const geometry = new THREE.PlaneGeometry(1, 1, SEG, 1);
  const mesh = new THREE.Mesh(geometry, curtainMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.userData.dynamic = true;
  frame.add(mesh);
  const pos = geometry.attributes.position;
  function shape(open) {
    const span = width * (1 - 0.74 * open);
    const amp = 0.02 + 0.04 * open;
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG;
      const x = anchor + dir * u * span;
      const depth = z + Math.sin(u * pleats * Math.PI * 2) * amp;
      pos.setXYZ(i, x, top, depth);
      pos.setXYZ(i + SEG + 1, x, bottom, depth);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  return { mesh, shape };
}

function curtainSet(frame, tex, x0, x1, z, panels) {
  const rod = mat(0x5a2a22, { roughness: 0.4 });
  const top = 2.74;
  cyl(frame, 0.016, x1 - x0, [(x0 + x1) / 2, top, z], rod, { rot: [0, 0, Math.PI / 2], seg: 12 });
  for (const ex of [x0, x1]) {
    ball(frame, 0.032, [ex, top, z], rod);
    box(frame, [0.02, 0.05, z], [ex + (ex === x0 ? 0.06 : -0.06), top, z / 2], rod);
  }
  const list = panels.map((p) => curtainPanel(frame, { ...p, top: top + 0.02, bottom: 0.04, z }));
  const set = {
    open: 1,
    target: 1,
    meshes: list.map((p) => p.mesh),
    toggle() {
      set.target = set.target > 0.5 ? 0 : 1;
    },
    update(dt) {
      if (Math.abs(set.target - set.open) < 0.0005) return false;
      set.open += (set.target - set.open) * (1 - Math.exp(-dt * 4));
      if (Math.abs(set.target - set.open) < 0.0005) set.open = set.target;
      for (const p of list) p.shape(set.open);
      return true;
    },
  };
  for (const p of list) p.shape(set.open);
  for (const m of set.meshes) m.userData.curtain = set;
  return set;
}

export function buildShell(root, frames, tex) {
  const weave = tex.pbr.linen.normalMap.clone();
  weave.repeat.set(5, 10);
  curtainMaterial.normalMap = weave;
  curtainMaterial.normalScale.set(0.6, 0.6);
  const paint = mat(0xefe9dc, { ...tex.pbr.plaster, roughness: 1, tile: 1.6 });
  const { w, d, h, recessX, recessZ } = ROOM;

  // Floor and ceiling. The notch at the north-east corner is the balcony.
  const floorMat = mat(0xf2ece2, { ...tex.pbr.floor, roughness: 0.5, tile: 1.2 });
  const fl = grp(root, [0, 0, 0]);
  fl.rotation.x = -Math.PI / 2;
  tiled(fl, 0, w, -d, 0, 0, floorMat, [0.8, 0.8], { receive: true });
  tiled(fl, w, recessX, -d, -recessZ, 0, floorMat, [0.8, 0.8], { receive: true });
  box(root, [w + 2 * T, 0.1, d + 2 * T], [w / 2, -0.051, d / 2], paint);
  box(root, [1.6, 0.1, recessZ], [w + 0.8, -0.051, recessZ / 2], mat(0x8f8f8c, { roughness: 0.9 }));
  box(root, [recessX - w, 0.1, d - recessZ + T], [(w + recessX) / 2 + T / 2, -0.051, (recessZ + d) / 2], paint);
  const ceiling = mat(0xf6f3ec, { ...tex.pbr.plaster, roughness: 1, tile: 1.6 });
  box(root, [w + 2 * T, 0.1, d + 2 * T], [w / 2, h + 0.05, d / 2], ceiling);
  box(root, [recessX - w + T, 0.1, d - recessZ + 2 * T], [(w + recessX) / 2 + T / 2, h + 0.05, (recessZ + d) / 2], ceiling);

  wall(root, paint, 'x', 0, -T, d + T, -1, [{ a: 4.5 - 3.95, b: 4.5 - 3.05, y0: 0, y1: 2.52 }]);
  wall(root, paint, 'z', 0, -T, w + T, -1, [{ a: 1.0, b: 3.0, y0: 0.95, y1: 2.45 }]);
  wall(root, paint, 'x', w, -T, recessZ, 1, [{ a: 1.7, b: 2.55, y0: 0, y1: 2.57 }]);
  wall(root, paint, 'z', recessZ, w, recessX + T, -1);
  wall(root, paint, 'x', recessX, recessZ - T, d + T, 1, [{ a: recessZ + 0.25, b: recessZ + 1.55, y0: 0.95, y1: 2.45 }]);
  wall(root, paint, 'z', d, -T, recessX + T, 1);

  wainscot(frames.A, 0, 3.0, tex);
  wainscot(frames.A, 4.0, 4.5, tex);
  wainscot(frames.B, 0, 3.6, tex);
  wainscot(frames.C, 0, 1.66, tex);
  wainscot(frames.C, 2.59, 2.7, tex);
  wainscot(frames.N, 0, 0.8, tex);
  wainscot(frames.R, 0, 1.8, tex);
  wainscot(frames.D, 0, 4.4, tex);

  entranceDoor(frames.A, tex);
  balconyDoor(frames.C, tex);
  windowUnit(frames.B, 1.0, 3.0, 0.95, 2.45, tex, false);
  windowUnit(frames.R, 0.25, 1.55, 0.95, 2.45, tex, true);

  const curtains = [
    curtainSet(frames.B, tex, 0.7, 3.3, 0.09, [
      { anchor: 0.74, dir: 1, width: 1.3 },
      { anchor: 3.26, dir: -1, width: 1.3 },
    ]),
    curtainSet(frames.C, tex, 0.75, 2.68, 0.08, [{ anchor: 0.8, dir: 1, width: 1.84 }]),
    curtainSet(frames.R, tex, 0.03, 1.77, 0.07, [
      { anchor: 0.06, dir: 1, width: 0.86 },
      { anchor: 1.74, dir: -1, width: 0.86 },
    ]),
  ];

  // Ceiling light. Its glow is driven by lighting.js.
  const lampMaterial = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, emissive: 0xffe2b8, emissiveIntensity: 0 });
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 28), lampMaterial);
  lamp.position.set(w / 2, h - 0.025, d / 2);
  lamp.userData.dynamic = true;
  root.add(lamp);

  return { curtains, ceilingLamp: lampMaterial };
}
