// Wall D: softbox and paint cart by the recess, the display bookshelf with
// the bean bag in front, the cat painting, and the TV in the far corner.
// Local x runs from the recess corner (0) to the desk corner (4.4).
import * as THREE from 'three';
import { mat, box, cyl, ball, slab, grp, rng } from '../lib/build.js';
import { M, mecha, bust, figure, dragon, bottle, kitBox } from './props.js';

function softbox(f, target) {
  cyl(f, 0.012, 1.7, [0.84, 0.85, 0.12], M.black);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    cyl(f, 0.008, 0.32, [0.84 + Math.cos(a) * 0.1, 0.1, 0.12 + Math.sin(a) * 0.1], M.black, { rot: [Math.sin(a) * 0.75, 0, -Math.cos(a) * 0.75] });
  }
  cyl(f, 0.01, 0.3, [0.87, 1.68, 0.25], M.black, { rot: [Math.PI / 2 - 0.2, 0, 0] });
  const head = grp(f, [0.9, 1.66, 0.4]);
  head.updateWorldMatrix(true, false);
  head.lookAt(target);
  cyl(head, [0.19, 0.05], 0.2, [0, 0, 0.1], M.black, { rot: [Math.PI / 2, 0, 0], seg: 8 });
  box(head, [0.1, 0.07, 0.12], [0, 0, -0.05], M.charcoal);
  const glow = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xfff4e2, emissiveIntensity: 1 });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.185, 8), glow);
  face.position.z = 0.202;
  face.userData.dynamic = true;
  head.add(face);
  // respirator hanging on the stand
  const teal = mat(0x3fa9c9, { roughness: 0.6 });
  ball(f, 0.06, [0.86, 1.2, 0.2], teal, { scale: [1.1, 1, 0.8] });
  for (const s of [-1, 1]) cyl(f, 0.04, 0.03, [0.86 + s * 0.07, 1.19, 0.21], M.white, { rot: [0, 0, Math.PI / 2] });
  return { glow, position: head.getWorldPosition(new THREE.Vector3()) };
}

function cart(f) {
  const cx = 1.28, cz = 0.26, w = 0.74, d = 0.4;
  const red = mat(0xc22a2a, { roughness: 0.4 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(f, 0.016, 0.86, [cx + (sx * w) / 2.15, 0.45, cz + (sz * d) / 2.3], red);
  for (const y of [0.2, 0.52, 0.86]) {
    box(f, [w, 0.02, d], [cx, y, cz], M.black, { r: 0.006 });
    box(f, [w, 0.05, 0.012], [cx, y + 0.03, cz + d / 2], M.black);
    box(f, [w, 0.05, 0.012], [cx, y + 0.03, cz - d / 2], M.black);
  }
  const r = rng(63);
  // drying rack: parts clipped to skewers stuck in foam and cardboard
  box(f, [0.3, 0.04, 0.2], [cx + 0.2, 0.89, cz], mat(0xa8824f, { roughness: 1 }));
  box(f, [0.28, 0.04, 0.2], [cx - 0.12, 0.89, cz + 0.02], mat(0x1c1c1e, { roughness: 1 }));
  const stick = mat(0xc9a66b, { roughness: 0.9 });
  const pink = mat(0xe9a0b0, { roughness: 0.6 });
  for (let i = 0; i < 30; i++) {
    const left = i < 14;
    const x = (left ? cx - 0.24 : cx + 0.07) + r() * 0.25;
    const z = cz - 0.07 + r() * 0.16;
    const h = 0.1 + r() * 0.07;
    const lean = [(r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3];
    cyl(f, 0.0015, h, [x, 0.91 + h / 2, z], stick, { rot: lean, seg: 5 });
    box(f, [0.016 + r() * 0.02, 0.012 + r() * 0.015, 0.006], [x, 0.915 + h, z], left ? M.black : pink, { rot: [r(), r() * 3, r()] });
  }
  // bottles on the lower tiers
  const bodies = [0xc22a2a, 0xe9e9e4, 0x1a1a1a, 0x8a8f96, 0xd98a1f, 0x3a3f5a];
  for (let i = 0; i < 26; i++) {
    const tier = i < 14 ? 0.53 : 0.21;
    const col = i < 14 ? i : i - 14;
    bottle(f, [cx - 0.3 + (col % 7) * 0.085, tier, cz - 0.08 + Math.floor(col / 7) * 0.13], 0.024, 0.11, mat(bodies[Math.floor(r() * bodies.length)], { roughness: 0.4 }), M.white);
  }
}

function bookshelf(f, tex) {
  const cx = 2.25, w = 0.8, d = 0.28, zc = 0.15;
  const shell = mat(0x151517, { roughness: 0.7 });
  for (const s of [-1, 1]) box(f, [0.02, 2.0, d], [cx + (s * (w - 0.02)) / 2, 1.0, zc], shell);
  box(f, [w, 2.0, 0.01], [cx, 1.0, 0.012], shell);
  const levels = [0.1, 0.48, 0.86, 1.24, 1.62, 1.99];
  for (const y of levels) box(f, [w - 0.04, 0.02, d], [cx, y, zc], shell);
  const at = (i) => levels[i] + 0.01;
  const r = rng(88);

  // top: finished pieces and art books
  for (let i = 0; i < 3; i++) box(f, [0.02, 0.3, 0.22], [cx - 0.34 + i * 0.024, at(4) + 0.15, zc], mat([0x2a3050, 0x1f2f3f, 0xe4e0d6][i]), { rot: [0, 0, -0.12] });
  figure(f, [cx - 0.12, at(4), zc], 0.32, M.resinTan, 0.2);
  bust(f, [cx - 0.24, at(4), zc + 0.04], 0.15, M.resinTan, 0.3, M.resinTan);
  bust(f, [cx + 0.06, at(4), zc + 0.02], 0.2, mat(0xe9e9e4, { roughness: 0.5 }), -0.1, M.black);
  box(f, [0.2, 0.09, 0.02], [cx + 0.06, at(4) + 0.23, zc + 0.03], mat(0xe0b020, { roughness: 0.4 }), { rot: [0, 0, 0] });
  figure(f, [cx + 0.25, at(4), zc], 0.26, M.resinTan, -0.25);

  // second: darker figures
  const dark = [[mat(0x1c1d21), mat(0x0f0f11), mat(0x4a4d55)], [mat(0x2f5f8a), mat(0x16233f), mat(0xd9a441)], [mat(0x3a2a2a), mat(0x1a1010), mat(0xc9413b)]];
  for (let i = 0; i < 7; i++) {
    if (i === 3) { bust(f, [cx - 0.3 + i * 0.1, at(3), zc + 0.03], 0.13, mat(0x2f4f8f, { roughness: 0.5 }), 0, mat(0xd9a441, { metalness: 0.6, roughness: 0.4 })); continue; }
    if (i % 3 === 0) figure(f, [cx - 0.3 + i * 0.1, at(3), zc], 0.2 + r() * 0.04, M.black, (r() - 0.5) * 0.6, M.charcoal);
    else mecha(f, [cx - 0.3 + i * 0.1, at(3), zc], 0.18 + r() * 0.05, dark[i % 3], (r() - 0.5) * 0.6, i);
  }

  // third: unpainted grey prints
  dragon(f, [cx - 0.2, at(2), zc], 0.3, M.primer, 0.4);
  for (let i = 0; i < 4; i++) bust(f, [cx + 0.02 + i * 0.09, at(2), zc + (i % 2) * 0.05], 0.1 + r() * 0.05, M.primer, (r() - 0.5), M.primer);

  // fourth: paint jars in racks
  const jar = mat(0xe4e2dc, { roughness: 0.15 });
  const lids = [0xe9e9e4, 0x25272c, 0x8a8f96, 0xc9413b, 0x3a3a3a];
  for (let i = 0; i < 40; i++) {
    const col = i % 10, row = Math.floor(i / 10);
    const x = cx - 0.33 + col * 0.072 + (row % 2) * 0.01;
    const z = zc - 0.08 + (row % 2) * 0.09;
    const y = at(1) + (row > 1 ? 0.052 : 0);
    cyl(f, 0.017, 0.035, [x, y + 0.018, z], jar, { seg: 10 });
    cyl(f, 0.018, 0.014, [x, y + 0.043, z], mat(lids[Math.floor(r() * lids.length)], { roughness: 0.5 }), { seg: 10 });
  }

  // bottom: parts waiting for primer
  for (let i = 0; i < 9; i++) box(f, [0.04 + r() * 0.05, 0.03 + r() * 0.04, 0.04 + r() * 0.04], [cx - 0.28 + r() * 0.3, at(0) + 0.03, zc - 0.05 + r() * 0.12], i % 2 ? M.resinTan : M.primer, { rot: [r(), r() * 3, r()], r: 0.008 });
  box(f, [0.26, 0.12, 0.2], [cx + 0.22, at(0) + 0.06, zc], mat(0xe9eaea, { roughness: 0.3, transparent: true, opacity: 0.55 }), { r: 0.01, cast: false });

  // kit boxes stacked on top
  kitBox(f, [cx - 0.2, 2.0 + 0.14, zc], [0.36, 0.26, 0.09], tex.kits[3]);
  kitBox(f, [cx + 0.2, 2.0 + 0.16, zc], [0.38, 0.3, 0.1], tex.kits[5]);
}

export function buildDisplayWall(f, tex, boothTarget) {
  const light = softbox(f, boothTarget);
  cart(f);

  const peg = tex.pegWhite.clone(); peg.repeat.set(6, 6);
  box(f, [0.76, 0.7, 0.012], [1.3, 1.6, 0.01], mat(0xffffff, { map: peg, roughness: 0.6 }));
  box(f, [0.2, 0.14, 0.08], [1.05, 1.5, 0.06], mat(0xe0602b, { roughness: 0.5 }), { r: 0.006 });
  box(f, [0.2, 0.26, 0.06], [1.52, 1.66, 0.05], M.charcoal, { r: 0.01 });
  for (let i = 0; i < 3; i++) cyl(f, 0.006, 0.16, [1.2 + i * 0.05, 1.72, 0.03], mat([0xc9413b, 0x8a5a2a, 0x1a1a1a][i]), { seg: 6 });

  bookshelf(f, tex);

  // bean bag
  const fabric = mat(0x8c8e92, { roughness: 1 });
  ball(f, 0.46, [2.3, 0.25, 0.92], fabric, { scale: [1, 0.56, 1], seg: 28 });
  ball(f, 0.34, [2.3, 0.42, 0.8], fabric, { scale: [1.05, 0.62, 0.9], seg: 24 });

  // cat painting
  box(f, [0.47, 0.37, 0.02], [2.98, 2.0, 0.012], mat(0xe9e4d6, { roughness: 0.9 }));
  slab(f, 0.45, 0.35, [2.98, 2.0, 0.0225], mat(0xffffff, { map: tex.cats, roughness: 0.85 }));

  // TV on a carved cabinet
  const carved = mat(0xffffff, { map: tex.darkWood, roughness: 0.4 });
  box(f, [1.2, 0.56, 0.42], [3.7, 0.34, 0.23], carved, { r: 0.01 });
  for (const x of [3.16, 4.24]) for (const z of [0.07, 0.39]) box(f, [0.06, 0.07, 0.06], [x, 0.035, z], carved);
  for (const dx of [-0.3, 0.3]) {
    box(f, [0.5, 0.4, 0.012], [3.7 + dx, 0.34, 0.443], carved, { r: 0.006 });
    box(f, [0.34, 0.24, 0.012], [3.7 + dx, 0.34, 0.452], carved, { r: 0.02 });
  }
  box(f, [1.23, 0.71, 0.028], [3.7, 1.05, 0.3], M.blackGloss, { r: 0.006 });
  for (const dx of [-0.42, 0.42]) box(f, [0.04, 0.08, 0.2], [3.7 + dx, 0.66, 0.3], M.black);
  const screen = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex.nature, emissiveIntensity: 1, roughness: 0.2 });
  const tv = slab(f, 1.2, 0.68, [3.7, 1.05, 0.3145], screen);
  tv.userData.dynamic = true;

  // the corner shelf continues from wall A
  box(f, [1.4, 0.025, 0.28], [3.7, 2.4, 0.14], M.black);
  kitBox(f, [3.2, 2.57, 0.13], [0.36, 0.3, 0.1], tex.kits[4]);
  kitBox(f, [3.6, 2.55, 0.13], [0.38, 0.27, 0.09], tex.kits[0]);
  kitBox(f, [3.98, 2.56, 0.13], [0.3, 0.29, 0.1], tex.kits[3]);

  return {
    softbox: light,
    tvScreen: screen,
    tv: f.localToWorld(new THREE.Vector3(3.7, 1.05, 0.36)),
  };
}
