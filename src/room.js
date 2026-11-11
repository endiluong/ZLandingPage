// PLACEHOLDER ROOM. Everything here is built from code (no model files) and is
// meant to be replaced object by object once the real room photos arrive.
// Units are metres. The room is 4 wide (x), 5 deep (z), 2.7 high (y), centred
// on the origin with the floor at y = 0. Desk on the back wall (-z), window on
// the right wall (+x), shelf on the left wall (-x).
import * as THREE from 'three';

export const ROOM = { w: 4, d: 5, h: 2.7 };

const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });

function box(parent, size, pos, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cyl(parent, rTop, rBottom, height, pos, material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, height, 24), material);
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Deterministic random so the books look the same on every load.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildShell(room) {
  const { w, d, h } = ROOM;
  const wall = mat(0xe9e4da);
  const t = 0.1;

  box(room, [w, t, d], [0, -t / 2, 0], mat(0x9a7350, { roughness: 0.6 })); // floor
  box(room, [w + 2 * t, t, d + 2 * t], [0, h + t / 2, 0], mat(0xf3f0ea)); // ceiling
  box(room, [w + 2 * t, h, t], [0, h / 2, -d / 2 - t / 2], wall); // back
  box(room, [w + 2 * t, h, t], [0, h / 2, d / 2 + t / 2], wall); // front
  box(room, [t, h, d], [-w / 2 - t / 2, h / 2, 0], wall); // left

  // Right wall, built around a window opening (z -1.2..1.2, y 0.9..2.2).
  const x = w / 2 + t / 2;
  box(room, [t, 0.9, d], [x, 0.45, 0], wall);
  box(room, [t, 0.5, d], [x, 2.45, 0], wall);
  box(room, [t, 1.3, 1.3], [x, 1.55, -1.85], wall);
  box(room, [t, 1.3, 1.3], [x, 1.55, 1.85], wall);

  // Window frame and blinds. The slats are what stripe the sunlight.
  const frame = mat(0xf7f5f0, { roughness: 0.5 });
  box(room, [0.06, 1.3, 0.05], [w / 2, 1.55, 0], frame);
  box(room, [0.12, 0.04, 2.4], [w / 2 - 0.03, 0.9, 0], frame); // sill
  const slat = mat(0xefeae0, { roughness: 0.6 });
  for (let i = 0; i < 20; i++) {
    const s = box(room, [0.035, 0.004, 2.36], [w / 2 - 0.07, 0.95 + i * 0.065, 0], slat);
    s.rotation.z = -0.5;
  }

  // Skirting board along the back wall, and a rug.
  box(room, [w, 0.08, 0.015], [0, 0.04, -d / 2 + 0.008], frame);
  box(room, [2.0, 0.012, 1.5], [0.1, 0.006, -0.2], mat(0x5d6f7d, { roughness: 1 }));
}

function buildDesk(room) {
  const g = new THREE.Group();
  g.position.set(0.3, 0, -2.1);
  room.add(g);

  const wood = mat(0xc9a27a, { roughness: 0.55 });
  const dark = mat(0x1d1e22, { roughness: 0.5 });
  const metal = mat(0x8c9096, { roughness: 0.35, metalness: 0.7 });

  box(g, [1.6, 0.04, 0.72], [0, 0.74, 0], wood);
  for (const [lx, lz] of [[-0.74, -0.3], [0.74, -0.3], [-0.74, 0.3], [0.74, 0.3]]) {
    box(g, [0.05, 0.72, 0.05], [lx, 0.36, lz], dark);
  }

  // Monitor
  box(g, [0.22, 0.015, 0.16], [0, 0.768, -0.2], metal);
  box(g, [0.04, 0.22, 0.03], [0, 0.87, -0.22], metal);
  box(g, [0.74, 0.44, 0.025], [0, 1.16, -0.2], dark);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.4),
    new THREE.MeshStandardMaterial({
      color: 0x111318,
      emissive: 0x9db8ff,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    }),
  );
  screen.position.set(0, 1.16, -0.186);
  g.add(screen);

  // Keyboard, mouse, mug, notebook
  box(g, [0.42, 0.015, 0.14], [0, 0.768, 0.1], mat(0xd9dadd, { roughness: 0.5 }));
  box(g, [0.06, 0.025, 0.1], [0.34, 0.772, 0.1], mat(0xeeeeee, { roughness: 0.4 }));
  cyl(g, 0.04, 0.035, 0.09, [-0.5, 0.805, 0.12], mat(0xf2efe8, { roughness: 0.4 }));
  box(g, [0.18, 0.012, 0.25], [0.58, 0.766, 0.12], mat(0xb5533c));

  // Desk lamp. The light itself is created in lighting.js at LAMP_POSITION.
  cyl(g, 0.07, 0.08, 0.02, [-0.62, 0.77, -0.2], dark);
  const arm = cyl(g, 0.01, 0.01, 0.46, [-0.62, 0.99, -0.2], dark);
  arm.castShadow = false;
  const shade = cyl(g, 0.05, 0.1, 0.12, [-0.56, 1.22, -0.16], mat(0xd9a441, { roughness: 0.5 }));
  shade.rotation.z = -0.5;

  // Chair
  const c = new THREE.Group();
  c.position.set(0.05, 0, 0.75);
  c.rotation.y = 0.35;
  g.add(c);
  const fabric = mat(0x2c2f36, { roughness: 0.95 });
  box(c, [0.5, 0.07, 0.48], [0, 0.48, 0], fabric);
  const back = box(c, [0.46, 0.55, 0.06], [0, 0.85, 0.24], fabric);
  back.rotation.x = 0.12;
  cyl(c, 0.025, 0.025, 0.36, [0, 0.27, 0], metal);
  for (let i = 0; i < 5; i++) {
    const leg = box(c, [0.3, 0.03, 0.04], [0, 0.07, 0], metal);
    leg.rotation.y = (i / 5) * Math.PI * 2;
    leg.translateX(0.15);
  }

  return { screen };
}

function buildShelf(room) {
  const g = new THREE.Group();
  g.position.set(-1.84, 0, -1.0);
  room.add(g);

  const wood = mat(0x6e4b34, { roughness: 0.6 });
  const depth = 0.3;
  const width = 1.1;
  const height = 1.95;
  box(g, [depth, height, 0.03], [0, height / 2, -width / 2], wood);
  box(g, [depth, height, 0.03], [0, height / 2, width / 2], wood);
  box(g, [0.015, height, width], [-depth / 2, height / 2, 0], wood);

  const rand = seeded(7);
  const colours = [0xb5533c, 0x2f5d50, 0xe3c567, 0x34495e, 0xe8e2d5, 0x7a4e7e, 0xcf7a3a];
  for (let level = 0; level < 5; level++) {
    const y = 0.02 + level * 0.46;
    box(g, [depth, 0.025, width], [0, y, 0], wood);
    let z = -width / 2 + 0.05;
    // Leave a gap on some shelves so it doesn't read as a solid wall of books.
    const stop = width / 2 - 0.05 - (level % 2 ? 0.3 : 0);
    while (z < stop) {
      const thick = 0.025 + rand() * 0.035;
      const tall = 0.24 + rand() * 0.14;
      const book = box(
        g,
        [0.17 + rand() * 0.06, tall, thick],
        [0.02, y + 0.0125 + tall / 2, z + thick / 2],
        mat(colours[Math.floor(rand() * colours.length)]),
      );
      if (rand() > 0.9) book.rotation.x = 0.18;
      z += thick + 0.004;
    }
  }
}

function buildHobbyCorner(room) {
  // Stand-in shapes. Replace with the real hobby objects.
  const g = new THREE.Group();
  g.position.set(-1.45, 0, 2.0);
  room.add(g);

  box(g, [0.95, 0.5, 0.55], [0, 0.25, 0], mat(0xd8cdb8, { roughness: 0.7 }));
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.11, 0.035, 96, 12),
    mat(0xd9a441, { roughness: 0.35, metalness: 0.4 }),
  );
  knot.position.set(-0.22, 0.68, 0);
  knot.castShadow = true;
  g.add(knot);
  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), mat(0x2f5d50, { flatShading: true }));
  ico.position.set(0.08, 0.61, 0.05);
  ico.castShadow = true;
  g.add(ico);
  cyl(g, 0.0, 0.09, 0.2, [0.32, 0.6, -0.05], mat(0xb5533c));

  // Framed poster on the front wall above the table.
  box(g, [0.62, 0.82, 0.02], [0, 1.45, 0.49], mat(0x1d1e22));
  box(g, [0.54, 0.74, 0.022], [0, 1.45, 0.488], mat(0xe9d9b8));
  box(g, [0.3, 0.3, 0.024], [0, 1.52, 0.486], mat(0xcf7a3a));

  return { spinners: [knot, ico] };
}

function buildBedAndPlant(room) {
  const bed = new THREE.Group();
  bed.position.set(1.2, 0, 1.45);
  room.add(bed);
  box(bed, [1.4, 0.28, 2.05], [0, 0.14, 0], mat(0x6e4b34, { roughness: 0.6 }));
  box(bed, [1.34, 0.18, 1.98], [0, 0.37, 0], mat(0xf1ede4, { roughness: 1 }));
  box(bed, [1.36, 0.06, 1.2], [0, 0.48, -0.38], mat(0x4f6b7a, { roughness: 1 }));
  box(bed, [0.55, 0.1, 0.36], [-0.32, 0.51, 0.75], mat(0xffffff, { roughness: 1 }));
  box(bed, [0.55, 0.1, 0.36], [0.32, 0.51, 0.75], mat(0xffffff, { roughness: 1 }));

  const plant = new THREE.Group();
  plant.position.set(1.65, 0, -1.55);
  room.add(plant);
  cyl(plant, 0.16, 0.12, 0.3, [0, 0.15, 0], mat(0xc8b8a2, { roughness: 0.7 }));
  const leaf = mat(0x3f7d4e, { roughness: 0.7, flatShading: true });
  const rand = seeded(3);
  for (let i = 0; i < 9; i++) {
    const l = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.6 + rand() * 0.35, 5), leaf);
    l.position.y = 0.5;
    l.rotation.set((rand() - 0.5) * 1.1, rand() * 6.28, (rand() - 0.5) * 1.1);
    l.translateY(0.25);
    l.castShadow = true;
    plant.add(l);
  }
}

export function buildRoom() {
  const room = new THREE.Group();
  buildShell(room);
  const { screen } = buildDesk(room);
  buildShelf(room);
  const { spinners } = buildHobbyCorner(room);
  buildBedAndPlant(room);
  return { room, screen, spinners };
}
