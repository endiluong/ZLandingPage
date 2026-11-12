// Assembles the whole room and returns the handles the rest of the app needs.
import * as THREE from 'three';
import { bake } from '../lib/build.js';
import { makeTextures } from '../textures.js';
import { makeFrames, buildShell } from './shell.js';
import { buildDeskWall } from './deskWall.js';
import { buildWaterWall } from './waterWall.js';
import { buildPaintCorner } from './paintCorner.js';
import { buildDisplayWall } from './displayWall.js';

export function buildRoom() {
  const root = new THREE.Group();
  const tex = makeTextures();
  const frames = makeFrames(root);
  root.updateMatrixWorld(true);

  const shell = buildShell(root, frames, tex);
  const desk = buildDeskWall(frames.A, tex);
  const water = buildWaterWall(frames.B, tex);
  const paint = buildPaintCorner(frames.R, tex);
  const display = buildDisplayWall(frames.D, tex, paint.booth);

  const drawCalls = bake(root);
  return { root, drawCalls, shell, desk, water, paint, display };
}
