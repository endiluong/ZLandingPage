// The guided tour: one camera stop per <section> in index.html, in order.
// Scrolling blends the camera from one stop to the next.
import * as THREE from 'three';

// position = where the camera stands, look = what it points at (metres).
export const STOPS = [
  { name: 'overview', position: [3.3, 1.9, 0.95], look: [0.5, 1.05, 3.3] },
  { name: 'desk', position: [1.6, 1.45, 2.7], look: [0.0, 1.2, 2.95] },
  { name: 'kits', position: [1.45, 1.75, 2.75], look: [0.0, 2.2, 3.55] },
  { name: 'printers', position: [1.55, 1.5, 1.55], look: [0.6, 1.05, 0.2] },
  { name: 'water', position: [2.3, 1.4, 1.75], look: [2.35, 0.98, 0.1] },
  { name: 'paint', position: [2.45, 1.5, 2.95], look: [4.25, 1.05, 3.85] },
  { name: 'shelf', position: [2.2, 1.35, 2.55], look: [2.15, 1.12, 4.5] },
  { name: 'outro', position: [0.75, 2.25, 4.0], look: [2.9, 0.9, 1.3] },
];

const smooth = (t) => t * t * (3 - 2 * t);

export function createTour(camera, { reducedMotion = false } = {}) {
  const positions = STOPS.map((s) => new THREE.Vector3(...s.position));
  const looks = STOPS.map((s) => new THREE.Vector3(...s.look));

  const goalPos = new THREE.Vector3();
  const goalLook = new THREE.Vector3();
  const livePos = positions[0].clone();
  const liveLook = looks[0].clone();
  const pointer = new THREE.Vector2();
  const offset = new THREE.Vector3();
  let first = true;

  if (!reducedMotion) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    });
  }

  function progress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const t = max > 0 ? window.scrollY / max : 0;
    return THREE.MathUtils.clamp(t, 0, 1) * (STOPS.length - 1);
  }

  function update(dt) {
    const p = progress();
    const i = Math.min(Math.floor(p), STOPS.length - 2);
    // Hold on each stop for a while, then travel: remap the middle of the
    // segment to 0..1 so the card can be read with the camera at rest.
    const local = smooth(THREE.MathUtils.clamp((p - i - 0.2) / 0.6, 0, 1));
    goalPos.lerpVectors(positions[i], positions[i + 1], local);
    goalLook.lerpVectors(looks[i], looks[i + 1], local);

    const a = reducedMotion || first ? 1 : 1 - Math.exp(-dt * 4);
    first = false;
    livePos.lerp(goalPos, a);
    liveLook.lerp(goalLook, a);

    // A small look-around that follows the mouse.
    offset.set(pointer.x * 0.1, -pointer.y * 0.07, 0).applyQuaternion(camera.quaternion);
    camera.position.copy(livePos);
    camera.lookAt(offset.add(liveLook));
  }

  return { update };
}
