// The guided tour: one camera stop per <section> in index.html, in order.
// Scrolling blends the camera from one stop to the next.
import * as THREE from 'three';

// position = where the camera stands, look = what it points at (metres).
export const STOPS = [
  { name: 'overview', position: [-1.55, 1.75, 2.15], look: [0.7, 0.95, -1.6] },
  { name: 'desk', position: [0.05, 1.4, -0.75], look: [0.45, 1.0, -2.3] },
  { name: 'shelf', position: [-0.15, 1.35, -0.55], look: [-1.9, 1.05, -1.0] },
  { name: 'window', position: [-0.4, 1.45, 0.5], look: [2.0, 1.35, -0.2] },
  { name: 'hobby', position: [-0.2, 1.35, 0.75], look: [-1.5, 0.85, 2.2] },
  { name: 'outro', position: [1.6, 2.25, 2.2], look: [-0.4, 0.8, -1.2] },
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
    offset.set(pointer.x * 0.12, -pointer.y * 0.08, 0).applyQuaternion(camera.quaternion);
    camera.position.copy(livePos);
    camera.lookAt(offset.add(liveLook));
  }

  return { update };
}
