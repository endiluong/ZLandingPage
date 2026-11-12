// The recess on wall C: work table on the left, spray booth on the right.
// Local x runs 0..1.8 along the window wall, z comes out toward the room.
import * as THREE from 'three';
import { mat, box, cyl, ball, slab, grp, rng } from '../lib/build.js';
import { M, bust, bottle, mecha } from './props.js';

const ST = 0.765; // table surface height

function workTable(f, tex) {
  const top = mat(0xe6cdb4, { ...tex.pbr.walnut, gain: 2.2, roughness: 0.6, tile: 0.9, grain: 'z' });
  box(f, [1.0, 0.03, 0.6], [0.55, 0.75, 0.33], top, { r: 0.004 });
  for (const x of [0.08, 1.02]) for (const z of [0.06, 0.6]) box(f, [0.04, 0.74, 0.04], [x, 0.37, z], M.black);
  box(f, [0.94, 0.02, 0.5], [0.55, 0.2, 0.33], M.black);
  box(f, [0.5, 0.22, 0.36], [0.4, 0.32, 0.33], mat(0xe4e6e6, { roughness: 0.3, transparent: true, opacity: 0.5 }), { r: 0.015, cast: false });

  // shelving unit with a pegboard back
  for (const x of [0.07, 1.03]) box(f, [0.025, 1.42, 0.22], [x, ST + 0.71, 0.13], M.black);
  const peg = tex.pegBlack.clone(); peg.repeat.set(8, 6);
  box(f, [0.94, 0.72, 0.01], [0.55, ST + 0.72, 0.03], mat(0xffffff, { map: peg, roughness: 0.6 }));
  for (const y of [1.5, 1.8, 2.12]) box(f, [0.96, 0.02, 0.22], [0.55, y, 0.13], M.black);
  box(f, [0.42, 0.22, 0.2], [0.33, 2.24, 0.13], M.white, { r: 0.006 });
  box(f, [0.22, 0.1, 0.18], [0.74, 2.18, 0.13], mat(0x6a2a3a, { roughness: 0.6 }), { r: 0.004 });
  box(f, [0.16, 0.12, 0.16], [0.72, 2.29, 0.13], mat(0x3a3f5a, { roughness: 0.6 }), { r: 0.004 });
  for (let i = 0; i < 3; i++) box(f, [0.3, 0.03, 0.18], [0.3 + i * 0.01, 1.826 + i * 0.032, 0.13], i === 1 ? M.charcoal : M.white, { r: 0.004 });
  box(f, [0.2, 0.07, 0.1], [0.82, 1.845, 0.13], mat(0x4f9a5a, { roughness: 0.7 }));
  const brown = mat(0x4a3a2a, { roughness: 0.2, transparent: true, opacity: 0.85 });
  for (let i = 0; i < 4; i++) {
    cyl(f, 0.022, 0.09, [0.52 + i * 0.07, 1.555, 0.13], i % 2 ? brown : M.white, { seg: 12 });
    cyl(f, 0.012, 0.02, [0.52 + i * 0.07, 1.61, 0.13], M.black, { seg: 10 });
  }
  cyl(f, 0.045, 0.22, [0.28, 1.56, 0.13], M.white, { rot: [0, 0, Math.PI / 2] });

  // drawer organisers along the back of the table
  const front = mat(0xffffff, { map: tex.drawer, roughness: 0.6 });
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 0.25 + col * 0.3, y = ST + 0.05 + row * 0.1;
      box(f, [0.295, 0.098, 0.16], [x, y, 0.13], M.black);
      slab(f, 0.285, 0.09, [x, y, 0.2105], front);
    }
  }
  // tiered rack of dropper bottles on top of them
  const r = rng(41);
  const caps = [0xe0762b, 0x1a1a1a, 0xc9413b, 0xe0c060, 0x2f6fb5, 0x2f8f5a, 0xf2f2f2, 0xd96aa0];
  const glass = mat(0xdedcd6, { roughness: 0.2 });
  box(f, [0.36, 0.03, 0.07], [0.78, ST + 0.215, 0.09], M.black);
  for (let i = 0; i < 9; i++) {
    bottle(f, [0.62 + i * 0.04, ST + 0.23, 0.09], 0.014, 0.055, mat(caps[Math.floor(r() * 4)], { roughness: 0.4 }), M.black);
    bottle(f, [0.62 + i * 0.04, ST + 0.2, 0.155], 0.014, 0.055, glass, mat(caps[Math.floor(r() * caps.length)], { roughness: 0.4 }));
  }
  // labelled colour drawers and a cup of brushes
  for (let i = 0; i < 2; i++) box(f, [0.2, 0.048, 0.14], [0.22, ST + 0.225 + i * 0.05, 0.12], mat(0x9a9da3, { roughness: 0.6 }), { r: 0.003 });
  for (let i = 0; i < 2; i++) box(f, [0.1, 0.022, 0.004], [0.22, ST + 0.225 + i * 0.05, 0.192], M.white);
  cyl(f, 0.035, 0.09, [0.43, ST + 0.245, 0.12], M.white);
  const handles = [0x8a5a2a, 0x2f6fb5, 0x1a1a1a, 0xc9413b, 0x8a5a2a, 0xe0c060];
  for (let i = 0; i < 6; i++) cyl(f, 0.004, 0.16, [0.41 + (i % 3) * 0.02, ST + 0.34, 0.11 + Math.floor(i / 3) * 0.02], mat(handles[i]), { rot: [(r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3], seg: 6 });

  // working area: cutting mat, a kit mid-build, tape, a cup
  box(f, [0.42, 0.004, 0.3], [0.5, ST + 0.002, 0.44], mat(0xffffff, { map: tex.cuttingMat, roughness: 0.9 }), { cast: false });
  mecha(f, [0.44, ST + 0.004, 0.42], 0.17, [M.primer, mat(0x6f7074), M.primer], 0.5, 2);
  box(f, [0.13, 0.004, 0.09], [0.63, ST + 0.008, 0.48], mat(0x8f9399, { roughness: 0.7 }));
  for (let i = 0; i < 6; i++) box(f, [0.012, 0.006, 0.02], [0.59 + (i % 3) * 0.035, ST + 0.012, 0.46 + Math.floor(i / 3) * 0.035], M.primer);
  for (let i = 0; i < 3; i++) {
    const tape = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 20), mat([0xd9c9a0, 0x8a5fb0, 0x4fae9a][i], { roughness: 0.8 }));
    tape.rotation.x = Math.PI / 2;
    tape.position.set(0.88, ST + 0.012 + i * 0.024, 0.46);
    tape.castShadow = true;
    f.add(tape);
  }
  cyl(f, [0.04, 0.036], 0.11, [0.22, ST + 0.055, 0.46], M.white, { seg: 20 });

  // air purifier on the floor in front
  box(f, [0.26, 0.52, 0.26], [0.35, 0.26, 1.0], M.white, { r: 0.03 });
  cyl(f, 0.1, 0.006, [0.35, 0.522, 1.0], M.charcoal, { seg: 28 });
}

function compressor(f, x, z) {
  const yellow = mat(0xf0bd0a, { roughness: 0.4, metalness: 0.2 });
  const g = grp(f, [x, 0, z]);
  cyl(g, 0.1, 0.34, [0, 0.16, 0], yellow, { rot: [0, 0, Math.PI / 2], seg: 24 });
  for (const s of [-1, 1]) {
    ball(g, 0.1, [s * 0.17, 0.16, 0], yellow, { scale: [0.5, 1, 1] });
    box(g, [0.03, 0.06, 0.16], [s * 0.14, 0.03, 0], M.black);
  }
  box(g, [0.17, 0.12, 0.13], [-0.03, 0.32, 0], M.black, { r: 0.01 });
  cyl(g, 0.045, 0.09, [0.11, 0.33, 0], M.charcoal);
  for (let i = 0; i < 4; i++) cyl(g, 0.055, 0.006, [0.11, 0.3 + i * 0.02, 0], M.charcoal);
  cyl(g, 0.022, 0.012, [-0.14, 0.3, 0.07], M.white, { rot: [Math.PI / 2, 0, 0] });
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.01, 8, 20, Math.PI), M.black);
  handle.position.set(0, 0.26, -0.03);
  handle.castShadow = true;
  g.add(handle);
  // coiled air hose
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 8, 20), mat(0x2f6fb5, { roughness: 0.5 }));
  coil.rotation.x = Math.PI / 2;
  coil.position.set(0.28, 0.03, 0.05);
  g.add(coil);
}

function airbrush(parent, pos, rotY) {
  const g = grp(parent, pos, rotY);
  cyl(g, 0.006, 0.15, [0, 0.012, 0], M.chrome, { rot: [Math.PI / 2, 0, 0], seg: 10 });
  cyl(g, [0.002, 0.006], 0.025, [0, 0.012, -0.087], M.chrome, { rot: [-Math.PI / 2, 0, 0], seg: 8 });
  cyl(g, [0.014, 0.006], 0.022, [0, 0.03, -0.03], M.chrome, { seg: 12 });
  cyl(g, 0.004, 0.018, [0, 0.026, 0.005], M.black, { seg: 6 });
  cyl(g, 0.005, 0.05, [0, -0.012, 0.01], M.steel, { seg: 8 });
}

function sprayBooth(f, tex) {
  const cx = 1.43, cz = 0.33;
  box(f, [0.64, 0.025, 0.6], [cx, 0.75, cz], M.steel, { r: 0.004 });
  for (const x of [1.14, 1.72]) for (const z of [0.06, 0.6]) box(f, [0.035, 0.74, 0.035], [x, 0.37, z], M.black);
  compressor(f, cx - 0.02, 0.36);

  const y0 = 0.763, h = 0.42, d = 0.42, w = 0.6, zc = 0.26;
  box(f, [w, h, 0.012], [cx, y0 + h / 2, zc - d / 2], mat(0xffffff, { map: tex.slots, metalness: 0.9, roughness: 0.35 }));
  for (const s of [-1, 1]) box(f, [0.012, h, d], [cx + (s * w) / 2, y0 + h / 2, zc], M.steel);
  box(f, [w, 0.012, d], [cx, y0 + h, zc], M.steel);
  box(f, [w, 0.07, 0.012], [cx, y0 + h - 0.035, zc + d / 2], M.steel);
  box(f, [w, 0.03, 0.012], [cx, y0 + 0.015, zc + d / 2], M.steel);
  // fan housing on top, where the duct starts
  box(f, [0.24, 0.13, 0.24], [cx, y0 + h + 0.07, zc - 0.02], mat(0xe4dfd0, { roughness: 0.6 }), { r: 0.01 });

  // the piece being painted, on a turntable
  cyl(f, 0.075, 0.014, [cx, y0 + 0.007, zc], M.charcoal, { seg: 28 });
  cyl(f, 0.008, 0.05, [cx, y0 + 0.039, zc], M.steel);
  bust(f, [cx, y0 + 0.06, zc], 0.17, M.primer, 0.25, M.charcoal);
  // five airbrushes laid out around it
  const spots = [[-0.22, 0.02, 1.25], [-0.15, 0.13, 0.75], [0.0, 0.17, 0], [0.15, 0.13, -0.75], [0.22, 0.02, -1.25]];
  for (const [dx, dz, a] of spots) airbrush(f, [cx + dx, y0 + 0.012, zc + dz], a);
  // thinner and cleaner bottles
  for (let i = 0; i < 3; i++) {
    cyl(f, 0.022, 0.1, [cx - 0.24 + i * 0.05, y0 + 0.05, zc - 0.14], M.white, { seg: 12 });
    cyl(f, [0.003, 0.012], 0.035, [cx - 0.24 + i * 0.05, y0 + 0.117, zc - 0.14], mat(0xd9643a), { seg: 8 });
  }

  // flexible duct from the fan housing out through the window
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx, y0 + h + 0.13, zc - 0.02),
    new THREE.Vector3(cx + 0.05, 1.68, 0.4),
    new THREE.Vector3(cx - 0.2, 2.05, 0.4),
    new THREE.Vector3(cx - 0.24, 2.12, 0.16),
    new THREE.Vector3(cx - 0.2, 2.0, -0.04),
  ]);
  const duct = new THREE.Mesh(new THREE.TubeGeometry(path, 60, 0.075, 16), mat(0xffffff, { map: tex.duct, metalness: 0.85, roughness: 0.35 }));
  duct.castShadow = true;
  duct.receiveShadow = true;
  f.add(duct);

  return f.localToWorld(new THREE.Vector3(cx, y0 + 0.14, zc));
}

export function buildPaintCorner(f, tex) {
  workTable(f, tex);
  const booth = sprayBooth(f, tex);
  return { booth };
}
