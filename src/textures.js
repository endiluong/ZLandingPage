// Every texture in the room is painted here on a canvas at load time.
// Nothing is downloaded, and none of it copies real artwork or logos.
import * as THREE from 'three';
import { rng } from './lib/build.js';

function tex(w, h, draw, o = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (o.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (Array.isArray(o.repeat)) t.repeat.set(o.repeat[0], o.repeat[1]);
  }
  return t;
}

function speckle(g, w, h, n, r, alpha) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = r() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

function wallTile() {
  const r = rng(5);
  return tex(256, 256, (g, w, h) => {
    g.fillStyle = '#f1eee6';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 600, r, 0.02);
    g.strokeStyle = '#d6d1c5';
    g.lineWidth = 3;
    g.strokeRect(0, 0, w, h);
  }, { repeat: true });
}

// The decorative band that tops the wall tiles: pale swirls and flowers.
function wallBand() {
  return tex(512, 256, (g, w, h) => {
    g.fillStyle = '#f3f0e8';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#b9b6ae';
    g.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
      const cx = 128 + i * 256;
      g.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.1) {
        const rad = 8 + a * 6.5;
        g.lineTo(cx + Math.cos(a) * rad, 128 + Math.sin(a) * rad * 0.9);
      }
      g.stroke();
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2;
        g.beginPath();
        g.ellipse(cx + 128 + Math.cos(a) * 26, 128 + Math.sin(a) * 26, 16, 8, a, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.fillStyle = '#cfcbc0';
    g.fillRect(0, 0, w, 8);
    g.fillRect(0, h - 8, w, 8);
  }, { repeat: true });
}

function pegboard(bg, hole) {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = hole;
    for (const [x, y] of [[32, 32], [96, 96]]) {
      g.beginPath();
      g.roundRect(x - 7, y - 20, 14, 40, 7);
      g.fill();
    }
  }, { repeat: true });
}

function codeScreen() {
  const r = rng(21);
  const colours = ['#9cdcfe', '#c586c0', '#dcdcaa', '#ce9178', '#4ec9b0', '#6a9955', '#d4d4d4'];
  return tex(1024, 576, (g, w, h) => {
    g.fillStyle = '#1e1e1e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#333333'; g.fillRect(0, 0, 44, h);
    g.fillStyle = '#252526'; g.fillRect(44, 0, 190, h);
    g.fillStyle = '#2d2d2d'; g.fillRect(234, 0, w, 30);
    g.fillStyle = '#1e1e1e'; g.fillRect(234, 0, 150, 30);
    g.fillStyle = '#007acc'; g.fillRect(0, h - 20, w, 20);
    for (let i = 0; i < 6; i++) { g.fillStyle = '#858585'; g.fillRect(12, 16 + i * 40, 20, 20); }
    for (let i = 0; i < 22; i++) {
      g.fillStyle = i === 7 ? '#37373d' : 'transparent';
      g.fillRect(44, 40 + i * 22, 190, 22);
      g.fillStyle = '#cccccc';
      g.fillRect(60 + (i % 3) * 12, 47 + i * 22, 60 + r() * 80, 7);
    }
    let indent = 0;
    for (let i = 0; i < 27; i++) {
      const y = 46 + i * 19;
      g.fillStyle = '#6e7681'; g.fillRect(246, y, 16, 7);
      if (r() < 0.12) continue;
      indent = Math.max(0, Math.min(4, indent + Math.floor(r() * 3) - 1));
      let x = 280 + indent * 26;
      const parts = 1 + Math.floor(r() * 5);
      for (let p = 0; p < parts; p++) {
        const len = 22 + r() * 90;
        g.fillStyle = colours[Math.floor(r() * colours.length)];
        g.fillRect(x, y, len, 7);
        x += len + 9;
      }
    }
    g.fillStyle = '#252526'; g.fillRect(w - 90, 30, 90, h - 50);
    for (let i = 0; i < 90; i++) { g.fillStyle = 'rgba(200,200,200,0.25)'; g.fillRect(w - 80, 36 + i * 5.5, 10 + r() * 55, 2); }
  });
}

function dashboard() {
  const r = rng(33);
  return tex(1024, 576, (g, w, h) => {
    g.fillStyle = '#0d1117'; g.fillRect(0, 0, w, h);
    // Left: a 2x2 camera wall.
    const tints = ['#3d4f5c', '#55616b', '#3f4a46', '#5a5560'];
    for (let i = 0; i < 4; i++) {
      const x = 10 + (i % 2) * 250, y = 10 + Math.floor(i / 2) * 278;
      g.fillStyle = tints[i]; g.fillRect(x, y, 240, 268);
      g.fillStyle = 'rgba(255,255,255,0.14)';
      g.beginPath(); g.moveTo(x, y + 268); g.lineTo(x + 90 + r() * 60, y + 110); g.lineTo(x + 240, y + 150 + r() * 60); g.lineTo(x + 240, y + 268); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 30 + r() * 120, y + 60, 50, 90);
      g.fillStyle = '#e5534b'; g.beginPath(); g.arc(x + 14, y + 14, 5, 0, 7); g.fill();
    }
    // Right: static charts.
    const panel = (x, y, pw, ph) => { g.fillStyle = '#161b22'; g.fillRect(x, y, pw, ph); };
    panel(520, 10, 494, 180); panel(520, 200, 242, 170); panel(772, 200, 242, 170); panel(520, 380, 494, 186);
    const line = (x, y, pw, ph, colour) => {
      g.strokeStyle = colour; g.lineWidth = 3; g.beginPath();
      let v = 0.5;
      for (let i = 0; i <= 40; i++) { v = Math.max(0.1, Math.min(0.9, v + (r() - 0.48) * 0.16)); g.lineTo(x + (i / 40) * pw, y + ph - v * ph); }
      g.stroke();
    };
    line(535, 25, 464, 150, '#58a6ff'); line(535, 25, 464, 150, '#3fb950');
    for (let i = 0; i < 9; i++) { const bh = 20 + r() * 120; g.fillStyle = '#d29922'; g.fillRect(535 + i * 24, 355 - bh, 16, bh); }
    g.strokeStyle = '#bc8cff'; g.lineWidth = 22; g.beginPath(); g.arc(893, 285, 55, -1.5, 2.6); g.stroke();
    g.strokeStyle = '#30363d'; g.beginPath(); g.arc(893, 285, 55, 2.6, 4.78); g.stroke();
    line(535, 395, 464, 156, '#f778ba');
  });
}

function nature() {
  const r = rng(8);
  return tex(1024, 576, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#2f6fb5'); sky.addColorStop(1, '#f6d7a8');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(700, 250, 46, 0, 7); g.fill();
    const ridge = (base, amp, colour) => {
      g.fillStyle = colour; g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, base - Math.abs(Math.sin(x * 0.006 + amp)) * amp * 60 - r() * 18);
      g.lineTo(w, h); g.fill();
    };
    ridge(330, 2.2, '#6d8fb0'); ridge(370, 1.4, '#4a7189'); ridge(410, 0.9, '#2f5a50');
    const lake = g.createLinearGradient(0, 420, 0, h);
    lake.addColorStop(0, '#9dc4d6'); lake.addColorStop(1, '#2c5d73');
    g.fillStyle = lake; g.fillRect(0, 430, w, h);
    g.fillStyle = 'rgba(255,243,214,0.5)'; g.fillRect(660, 430, 80, 146);
    g.fillStyle = '#1f4034';
    for (let i = 0; i < 26; i++) { const x = r() * w, s = 20 + r() * 40; g.beginPath(); g.moveTo(x, 440 - s * 2); g.lineTo(x - s * 0.5, 440); g.lineTo(x + s * 0.5, 440); g.fill(); }
  });
}

function catPainting() {
  const r = rng(4);
  return tex(512, 400, (g, w, h) => {
    g.fillStyle = '#7fae6a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#a9c9d9'; g.fillRect(0, 0, w, 90);
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(${40 + r() * 60},${110 + r() * 70},${50 + r() * 40},0.5)`; g.fillRect(r() * w, 90 + r() * (h - 90), 3, 9); }
    for (let i = 0; i < 7; i++) { const x = 30 + i * 75; g.fillStyle = '#4d3a2a'; g.fillRect(x, 50, 8, 80); g.fillStyle = '#3f7044'; g.beginPath(); g.arc(x + 4, 55, 34, 0, 7); g.fill(); }
    const coats = ['#e8e2d6', '#3a3a3a', '#d98e4a', '#8a8f96', '#f2f2f2', '#b9773f'];
    for (let i = 0; i < 12; i++) {
      const x = 40 + r() * (w - 80), y = 170 + r() * 190, s = 12 + r() * 8;
      g.fillStyle = coats[i % coats.length];
      g.beginPath(); g.ellipse(x, y, s, s * 0.8, 0, 0, 7); g.fill();
      g.beginPath(); g.arc(x, y - s, s * 0.65, 0, 7); g.fill();
      g.beginPath(); g.moveTo(x - s * 0.6, y - s * 1.3); g.lineTo(x - s * 0.5, y - s * 1.9); g.lineTo(x - s * 0.1, y - s * 1.5); g.fill();
      g.beginPath(); g.moveTo(x + s * 0.6, y - s * 1.3); g.lineTo(x + s * 0.5, y - s * 1.9); g.lineTo(x + s * 0.1, y - s * 1.5); g.fill();
    }
  });
}

function dogPoster() {
  return tex(384, 512, (g, w, h) => {
    g.fillStyle = '#e9dcc3'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d9643a'; g.beginPath(); g.arc(260, 150, 120, 0, 7); g.fill();
    g.fillStyle = '#2b3a55'; g.beginPath(); g.roundRect(70, 250, 230, 150, 60); g.fill();
    g.fillRect(90, 380, 36, 90); g.fillRect(240, 380, 36, 90);
    g.beginPath(); g.arc(250, 220, 70, 0, 7); g.fill();
    g.beginPath(); g.moveTo(195, 190); g.lineTo(185, 100); g.lineTo(245, 160); g.fill();
    g.beginPath(); g.moveTo(305, 190); g.lineTo(325, 100); g.lineTo(265, 160); g.fill();
    g.fillStyle = '#e9dcc3'; g.beginPath(); g.ellipse(262, 245, 30, 22, 0, 0, 7); g.fill();
    g.fillStyle = '#16202f'; g.beginPath(); g.arc(262, 236, 9, 0, 7); g.fill();
    g.strokeStyle = '#2b3a55'; g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(75, 290); g.quadraticCurveTo(20, 250, 45, 190); g.stroke();
  });
}

// Generic model-kit box covers: a dark panel, an accent colour, and an
// abstract angular silhouette. Deliberately not any real product.
function kitCover(seed) {
  const r = rng(seed * 97 + 13);
  const accents = ['#d9a441', '#c9413b', '#3f7fbf', '#7fb04a', '#d9d4c7', '#8a5fb0'];
  const accent = accents[seed % accents.length];
  return tex(384, 288, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#15171c'); bg.addColorStop(1, '#30343d');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = accent; g.fillRect(0, 0, 26, h); g.fillRect(40, h - 46, 150, 10); g.fillRect(40, h - 28, 90, 6);
    g.fillStyle = 'rgba(255,255,255,0.82)';
    g.beginPath();
    const cx = 250, cy = 150;
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const rad = 50 + r() * 70; g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.9); }
    g.fill();
    g.fillStyle = accent; g.beginPath(); g.moveTo(cx - 30, cy - 10); g.lineTo(cx + 40, cy - 30); g.lineTo(cx + 10, cy + 40); g.fill();
    g.fillStyle = '#15171c'; g.fillRect(cx - 14, cy - 6, 34, 9);
  });
}

function deskMat() {
  return tex(512, 256, (g, w, h) => {
    g.fillStyle = '#1f3f63'; g.fillRect(0, 0, w, h);
    g.lineWidth = 5;
    for (let row = 0; row < 7; row++) {
      for (let i = -1; i < 9; i++) {
        const x = i * 64 + (row % 2) * 32, y = row * 40 + 30;
        g.strokeStyle = row % 2 ? '#3f7fae' : '#8fc3de';
        for (const rad of [30, 20, 10]) { g.beginPath(); g.arc(x, y, rad, Math.PI, 0); g.stroke(); }
      }
    }
  });
}

function ductRibs() {
  return tex(64, 8, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#6f7378'); grad.addColorStop(0.5, '#f0f2f4'); grad.addColorStop(1, '#6f7378');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  }, { repeat: [70, 1] });
}

function slots() {
  return tex(256, 256, (g, w, h) => {
    g.fillStyle = '#b9bcc0'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2b2e';
    for (let i = 0; i < 12; i++) g.fillRect(14 + i * 20, 150, 9, 70);
  });
}

function drawerFront() {
  return tex(128, 64, (g, w, h) => {
    g.fillStyle = '#8f9399'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#6f7379'; g.lineWidth = 1;
    for (let i = -h; i < w; i += 6) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); }
    g.fillStyle = '#1b1c1f'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5); g.fillRect(0, 0, 4, h); g.fillRect(w - 4, 0, 4, h);
    g.fillRect(w / 2 - 14, 8, 28, 9);
  });
}

function cuttingMat() {
  return tex(256, 192, (g, w, h) => {
    g.fillStyle = '#2f6b52'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1;
    for (let x = 0; x <= w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  });
}

// Photographic material maps from AMD's GPUOpen MaterialX Library
// (matlib.gpuopen.com, "MIT Public Domain"). Files live in public/textures.
function loadMaps() {
  const loader = new THREE.TextureLoader();
  const load = (name, colour = false) => {
    const t = loader.load(`${import.meta.env.BASE_URL}textures/${name}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    if (colour) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return {
    floor: { map: load('floor_color', true), normalMap: load('floor_normal'), roughnessMap: load('floor_rough') },
    walnut: { map: load('walnut_color', true), normalMap: load('walnut_normal') },
    mahogany: { map: load('mahogany_color', true), normalMap: load('mahogany_normal') },
    plaster: { normalMap: load('plaster_normal'), roughnessMap: load('plaster_rough') },
    plywood: { map: load('plywood_color', true), normalMap: load('plywood_normal') },
    linen: { normalMap: load('linen_normal') },
    fleece: { normalMap: load('fleece_normal') },
    steel: { roughnessMap: load('steel_rough') },
  };
}

export function makeTextures() {
  return {
    pbr: loadMaps(),
    wallTile: wallTile(),
    wallBand: wallBand(),
    pegBlack: pegboard('#1c1d20', '#050506'),
    pegGrey: pegboard('#6e7279', '#33363b'),
    pegWhite: pegboard('#ecebe6', '#b9b8b2'),
    code: codeScreen(),
    dashboard: dashboard(),
    nature: nature(),
    cats: catPainting(),
    dog: dogPoster(),
    kits: [0, 1, 2, 3, 4, 5].map(kitCover),
    deskMat: deskMat(),
    duct: ductRibs(),
    slots: slots(),
    drawer: drawerFront(),
    cuttingMat: cuttingMat(),
  };
}
