// Small helpers for building the room out of primitives, plus bake(), which
// merges all static meshes that share a material into one draw call.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const materials = new Map();

/** Cached MeshStandardMaterial: same arguments give the same instance. */
export function mat(color, opts = {}) {
  const key =
    color +
    '|' +
    Object.entries(opts)
      .map(([k, v]) => `${k}:${v && v.isTexture ? v.uuid : v}`)
      .join(',');
  let m = materials.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts });
    materials.set(key, m);
  }
  return m;
}

function put(parent, geometry, pos, material, o = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (o.rot) mesh.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
  if (o.scale) mesh.scale.set(o.scale[0], o.scale[1], o.scale[2]);
  mesh.castShadow = o.cast !== false;
  mesh.receiveShadow = o.receive !== false;
  parent.add(mesh);
  return mesh;
}

/** Box centred on pos. o.r rounds the edges. */
export function box(parent, size, pos, material, o = {}) {
  const [w, h, d] = size;
  const geometry = o.r
    ? new RoundedBoxGeometry(w, h, d, 3, Math.min(o.r, w / 2.01, h / 2.01, d / 2.01))
    : new THREE.BoxGeometry(w, h, d);
  return put(parent, geometry, pos, material, o);
}

/** Upright cylinder centred on pos. r is a radius or [top, bottom]. */
export function cyl(parent, r, h, pos, material, o = {}) {
  const [rt, rb] = Array.isArray(r) ? r : [r, r];
  return put(parent, new THREE.CylinderGeometry(rt, rb, h, o.seg || 20), pos, material, o);
}

export function ball(parent, r, pos, material, o = {}) {
  return put(parent, new THREE.SphereGeometry(r, o.seg || 18, o.seg ? Math.ceil(o.seg / 1.5) : 12), pos, material, o);
}

/** Flat rectangle facing +z. */
export function slab(parent, w, h, pos, material, o = {}) {
  return put(parent, new THREE.PlaneGeometry(w, h), pos, material, { cast: false, ...o });
}

/** Rectangle facing +z whose texture repeats every `tile` metres. */
export function tiled(parent, x0, x1, y0, y1, z, material, tile, o = {}) {
  const w = x1 - x0;
  const h = y1 - y0;
  const geometry = new THREE.PlaneGeometry(w, h);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / tile[0], (uv.getY(i) * h) / tile[1]);
  return put(parent, geometry, [(x0 + x1) / 2, (y0 + y1) / 2, z], material, { cast: false, ...o });
}

export function grp(parent, pos = [0, 0, 0], rotY = 0) {
  const g = new THREE.Group();
  g.position.set(pos[0], pos[1], pos[2]);
  g.rotation.y = rotY;
  parent.add(g);
  return g;
}

/** Deterministic random numbers so the room looks the same on every load. */
export function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Merge every static mesh under root into one mesh per material. Anything
 * inside an object with userData.dynamic = true is left alone.
 */
export function bake(root) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const buckets = new Map();
  const done = [];
  root.traverse((o) => {
    if (!o.isMesh || Array.isArray(o.material)) return;
    for (let p = o; p; p = p.parent) if (p.userData.dynamic) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const name of Object.keys(g.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld));
    const key = o.material.uuid + (o.castShadow ? 'c' : '-') + (o.receiveShadow ? 'r' : '-');
    if (!buckets.has(key)) buckets.set(key, { material: o.material, cast: o.castShadow, receive: o.receiveShadow, list: [] });
    buckets.get(key).list.push(g);
    done.push(o);
  });
  for (const o of done) {
    o.parent.remove(o);
    o.geometry.dispose();
  }
  for (const b of buckets.values()) {
    const mesh = new THREE.Mesh(mergeGeometries(b.list), b.material);
    mesh.castShadow = b.cast;
    mesh.receiveShadow = b.receive;
    root.add(mesh);
    for (const g of b.list) g.dispose();
  }
  return buckets.size;
}
