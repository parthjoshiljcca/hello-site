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

/**
 * Brain in "front, slightly from above" orientation: x = left/right, y = up, z = toward viewer (frontal lobe).
 * Two hemispheres with a longitudinal fissure, flattened base, temporal lobes, and gyri/sulci from
 * domain-warped noise. Attribute `aSul` (0..1) marks the grooves so the shader can light them up.
 */
export function buildBrain(widthSeg = 360, heightSeg = 270) {
  const geos: THREE.BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const g = new THREE.SphereGeometry(1, widthSeg, heightSeg);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const sul = new Float32Array(pos.count);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // base hemisphere ellipsoid
      let x = v.x * 0.56, y = v.y * 0.62, z = v.z * 0.86;
      // flat medial wall (toward the fissure)
      const m = x * side; // >0 = lateral, <0 = toward the midline
      if (m < -0.3) x = side * (-0.3 + (m + 0.3) * 0.15);
      // flatten the base and tuck it in, temporal lobe bulge low and to the side, slightly narrower frontal pole
      if (y < -0.18) y = -0.18 + (y + 0.18) * 0.62;
      const temporal = Math.exp(-(((y + 0.28) / 0.2) ** 2) - (((z - 0.12) / 0.38) ** 2)) * Math.max(0, x * side);
      x += side * temporal * 0.22; y -= temporal * 0.06;
      x *= 1 - 0.1 * Math.max(0, z / 0.86) ** 2;
      y += 0.06 * Math.max(0, -z / 0.86); // occipital slightly higher
      // folds: domain-warped noise; grooves where |n| ~ 0
      const p = new THREE.Vector3(x, y, z).multiplyScalar(5.6).addScalar(side * 11.3);
      const wx = noise(p.x * 0.45 + 3, p.y * 0.45, p.z * 0.45) * 1.3;
      const wy = noise(p.x * 0.45, p.y * 0.45 + 7, p.z * 0.45) * 1.3;
      const wz = noise(p.x * 0.45, p.y * 0.45, p.z * 0.45 + 13) * 1.3;
      const n = noise(p.x + wx, p.y + wy, p.z + wz) + 0.22 * noise((p.x + wx) * 2.3, (p.y + wy) * 2.3, (p.z + wz) * 2.3);
      const g01 = Math.min(1, Math.abs(n) / 0.22);
      const fold = Math.pow(g01, 0.45); // broad rounded gyri, narrow sulci
      const medial = x * side < -0.27 ? 0.25 : 1; // the medial wall is mostly hidden: keep it smooth
      const r = Math.hypot(x, y, z) || 1;
      const k = 1 + (fold - 1) * 0.07 * medial;
      x *= k; y *= k; z *= k;
      sul[i] = (1 - Math.min(1, Math.abs(n) / 0.075)) * medial * (r > 0 ? 1 : 0);
      pos.setXYZ(i, x + side * 0.315, y, z);
    }
    g.setAttribute("aSul", new THREE.BufferAttribute(sul, 1));
    g.computeVertexNormals();
    geos.push(g);
  }
  return geos;
}

/** projected size of the brain (units) for the default pose, used to fit it over the spheres */
export const BRAIN_W = 2.0;
export const BRAIN_H = 1.3;
