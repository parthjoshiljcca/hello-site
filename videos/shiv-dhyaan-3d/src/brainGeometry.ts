import * as THREE from "three";

/* ---------- deterministic 3D Perlin noise ---------- */
const perm = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = 1337;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  return [...p, ...p];
})();
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const grad = (h: number, x: number, y: number, z: number) => {
  const u = (h & 15) < 8 ? x : y, v = (h & 15) < 4 ? y : (h & 15) === 12 || (h & 15) === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};
export function noise(x: number, y: number, z: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
  const L = (a: number, b: number, t: number) => a + t * (b - a);
  return L(L(L(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u), L(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
    L(L(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u), L(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v), w);
}

/* ---------- SDF helpers ---------- */
type V = [number, number, number];
const ellip = (p: V, c: V, r: V) => {
  const x = (p[0] - c[0]) / r[0], y = (p[1] - c[1]) / r[1], z = (p[2] - c[2]) / r[2];
  return (Math.sqrt(x * x + y * y + z * z) - 1) * Math.min(r[0], r[1], r[2]);
};
const smin = (a: number, b: number, k: number) => {
  const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - a)) / k));
  return b + (a - b) * h - k * h * (1 - h);
};
const segDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
  const vx = bx - ax, vy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(px - ax - t * vx, py - ay - t * vy);
};

/*
 * Anatomical brain, side view: x = front(+)/back(-), y = up, z = lateral (+z = right hemisphere, faces the camera).
 * Cerebrum hemispheres (frontal, parietal, occipital, temporal lobes), longitudinal fissure, Sylvian fissure,
 * central sulcus, gyri from domain-warped noise, a striped cerebellum and the brain stem.
 * Attribute `aSul` (0..1) = how deep in a groove a vertex sits (used for shading and the glow).
 */

/** cerebrum hemisphere SDF in local coords where q.z >= 0 is the lateral side */
const cerebrum = (q: V) => {
  let d = ellip(q, [0.0, 0.08, 0.31], [1.0, 0.66, 0.5]);
  d = smin(d, ellip(q, [0.14, -0.34, 0.42], [0.55, 0.27, 0.25]), 0.12); // temporal lobe
  d = smin(d, ellip(q, [-0.68, 0.0, 0.3], [0.36, 0.44, 0.38]), 0.18); // occipital pole
  return Math.max(d, 0.018 - q[2]); // flat medial wall -> longitudinal fissure between hemispheres
};

function foldNoise(x: number, y: number, z: number, side: number) {
  const px = x * 5.2 + side * 11.3, py = y * 5.2, pz = z * 5.2;
  const wx = noise(px * 0.45 + 3, py * 0.45, pz * 0.45) * 1.3;
  const wy = noise(px * 0.45, py * 0.45 + 7, pz * 0.45) * 1.3;
  const wz = noise(px * 0.45, py * 0.45, pz * 0.45 + 13) * 1.3;
  return noise(px + wx, py + wy, pz + wz) + 0.2 * noise((px + wx) * 2.3, (py + wy) * 2.3, (pz + wz) * 2.3);
}

function buildHemisphere(side: number, ws: number, hs: number) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const sul = new Float32Array(pos.count);
  const C: V = [-0.05, 0.02, 0.3]; // ray origin inside the hemisphere (local, lateral = +z)
  const dir = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    dir.fromBufferAttribute(pos, i).normalize();
    const at = (t: number): V => [C[0] + dir.x * t, C[1] + dir.y * t, C[2] + dir.z * t];
    // march out of the SDF along the ray, then bisect to the surface
    let t0 = 0, t1 = 0.02;
    while (t1 < 2.5 && cerebrum(at(t1)) < 0) { t0 = t1; t1 += 0.02; }
    for (let k = 0; k < 14; k++) { const m = (t0 + t1) / 2; if (cerebrum(at(m)) < 0) t0 = m; else t1 = m; }
    const [x, y, z] = at((t0 + t1) / 2);
    const lateral = Math.min(1, Math.max(0, (z - 0.05) / 0.2)); // 0 on the medial wall
    // gyri / sulci
    const n = foldNoise(x, y, z, side);
    const g01 = Math.min(1, Math.abs(n) / 0.22);
    let disp = (Math.pow(g01, 0.45) - 1) * 0.055 * (0.35 + 0.65 * lateral);
    let groove = (1 - Math.min(1, Math.abs(n) / 0.08)) * (0.35 + 0.65 * lateral);
    // landmark grooves: Sylvian fissure (lateral sulcus) and central sulcus
    const syl = Math.exp(-((segDist(x, y, 0.55, -0.14, -0.3, 0.1) / 0.035) ** 2)) * lateral;
    const cen = Math.exp(-((segDist(x, y, -0.02, 0.74, 0.22, 0.06) / 0.028) ** 2)) * lateral;
    disp -= syl * 0.09 + cen * 0.05;
    groove = Math.max(groove, syl, cen * 0.9);
    const tt = (t0 + t1) / 2 + disp;
    pos.setXYZ(i, C[0] + dir.x * tt, C[1] + dir.y * tt, (C[2] + dir.z * tt) * side);
    sul[i] = groove;
  }
  if (side < 0) g.index!.array.reverse(); // mirrored -> keep triangles facing outward
  g.setAttribute("aSul", new THREE.BufferAttribute(sul, 1));
  g.computeVertexNormals();
  return g;
}

function buildCerebellum(side: number) {
  const g = new THREE.SphereGeometry(1, 160, 120);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const sul = new Float32Array(pos.count);
  const v = new THREE.Vector3();
  const c = new THREE.Vector3(-0.66, -0.5, 0.22 * side), r = new THREE.Vector3(0.36, 0.22, 0.26);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // folia: fine, slightly curved, roughly horizontal ridges
    const s = Math.sin((v.y * 0.22 + v.x * 0.07 + v.z * 0.02) * 95);
    const gr = Math.max(0, -s) ** 3;
    const k = 1 - gr * 0.05;
    pos.setXYZ(i, c.x + v.x * r.x * k, c.y + v.y * r.y * k, c.z + v.z * r.z * k);
    sul[i] = gr * 0.8;
  }
  g.setAttribute("aSul", new THREE.BufferAttribute(sul, 1));
  g.computeVertexNormals();
  return g;
}

function buildStem() {
  const stem = new THREE.CylinderGeometry(0.15, 0.1, 0.62, 48, 8);
  stem.rotateZ(-0.22);
  stem.translate(-0.24, -0.68, 0);
  const pons = new THREE.SphereGeometry(0.17, 48, 32);
  pons.scale(1, 1.15, 1);
  pons.translate(-0.17, -0.55, 0);
  for (const g of [stem, pons]) g.setAttribute("aSul", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count), 1));
  return [stem, pons];
}

export function buildBrain() {
  return [
    buildHemisphere(1, 380, 290), buildHemisphere(-1, 220, 170),
    buildCerebellum(1), buildCerebellum(-1),
    ...buildStem(),
  ];
}

/** cerebrum extent in the side view (units) and its centre, used to fit it over the spheres */
export const BRAIN_W = 2.08;
export const BRAIN_H = 1.36;
export const BRAIN_CENTER: [number, number] = [-0.03, 0.06];
