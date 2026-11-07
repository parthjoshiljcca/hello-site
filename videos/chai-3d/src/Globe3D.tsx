import { useMemo } from "react";
import * as THREE from "three";
import land from "./data/land.json";
import { Badge, CamRig, HDR, Layer, MonoTag, SCN, back, cl, eio, eo, ev, fin, lerp, pop, project, seg } from "./common";
import { Env, WarmLights } from "./props";

/** Scenes 4-7 (England, silver, Assam 1823, gardens + London 1839): one continuous 3D globe journey */
const RAD = Math.PI / 180;
const v3 = (lon: number, lat: number, r = 1) => new THREE.Vector3(r * Math.cos(lat * RAD) * Math.sin(lon * RAD), r * Math.sin(lat * RAD), r * Math.cos(lat * RAD) * Math.cos(lon * RAD));
type LL = [number, number];
const CANTON: LL = [113.3, 23.1], LONDON: LL = [-0.1, 51.5], ASSAM: LL = [94.9, 27.0], DARJ: LL = [88.26, 27.04], KOLKATA: LL = [88.36, 22.57];
// East India Company sea route (simplified): Canton -> Malacca -> Indian Ocean -> Cape of Good Hope -> Atlantic -> London
const SEA_TAIL: LL[] = [[80, 4], [62, -8], [42, -27], [20, -37], [8, -25], [-8, -5], [-22, 14], [-16, 33], [-9, 44], [-4, 49.6], LONDON];
const TEA_ROUTE: LL[] = [CANTON, [113, 18], [109, 10], [104.5, 2], [98, 5], [88, 5], ...SEA_TAIL];
const SHIP_ROUTE: LL[] = [ASSAM, [91.5, 25.6], [89.5, 24], KOLKATA, [88.5, 18], [86, 10], ...SEA_TAIL];

function curveOf(pts: LL[], r = 1.012, steps = 18) {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = v3(...pts[i]).normalize(), b = v3(...pts[i + 1]).normalize();
    for (let s = 0; s < steps; s++) out.push(a.clone().lerp(b, s / steps).normalize().multiplyScalar(r));
  }
  out.push(v3(...pts[pts.length - 1], r));
  return new THREE.CatmullRomCurve3(out);
}

/* ---------- camera / globe state: a pure function of time ---------- */
type G = { lon: number; lat: number; dist: number };
const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, v0] = keys[i], [t1, v1] = keys[i + 1]; if (t <= t1) return lerp(v0, v1, eio(seg(t, t0, t1))); }
  return keys[keys.length - 1][1];
};
function state(t: number): G {
  const T5 = SCN[5].start, T6 = SCN[6].start;
  return {
    lon: kf(t, [[SCN[3].start, 70], [ev.england + 1.5, 48], [ev.source - 0.4, 48], [T5 + 0.8, 90], [ev.y1839 - 0.4, 90], [ev.y1839 + 1.4, 45]]),
    lat: kf(t, [[SCN[3].start, 30], [ev.england + 1.5, 10], [ev.source - 0.4, 10], [T5 + 0.8, 24], [ev.y1839 - 0.4, 24], [ev.y1839 + 1.4, 12]]),
    dist: kf(t, [[SCN[3].start, 7.2], [SCN[3].start + 1.0, 5.8], [ev.source - 0.4, 5.8], [T5 + 0.8, 3.9], [T6 + 0.3, 3.9], [ev.y1839 - 0.4, 4.1], [ev.y1839 + 1.4, 5.9]]),
  };
}
const camPos = (g: G): [number, number, number] => [0, 0, g.dist];
const globeQuat = (g: G) => new THREE.Quaternion().setFromEuler(new THREE.Euler(g.lat * RAD, -g.lon * RAD, 0, "XYZ"));
/** world position of a lon/lat point for the current globe orientation, and whether it faces the camera */
function worldLL(ll: LL, g: G, r = 1.01) {
  const p = v3(ll[0], ll[1], r).applyQuaternion(globeQuat(g));
  const toCam = new THREE.Vector3(...camPos(g)).sub(p).normalize();
  return { p, vis: p.clone().normalize().dot(toCam) };
}
const screenLL = (ll: LL, g: G) => { const w = worldLL(ll, g); return { ...project(w.p, camPos(g)), vis: w.vis }; };

/* ---------- 3D pieces ---------- */
const Route: React.FC<{ curve: THREE.CatmullRomCurve3; p: number; color: string; k?: number }> = ({ curve, p, color, k = 2.4 }) => {
  const SEG = 600, RS = 8;
  const geo = useMemo(() => new THREE.TubeGeometry(curve, SEG, 0.0075, RS, false), [curve]);
  geo.setDrawRange(0, Math.floor(cl(p) * SEG) * RS * 6);
  return <mesh geometry={geo}><meshBasicMaterial color={HDR(color, k)} toneMapped={false} /></mesh>;
};
const Pin: React.FC<{ ll: LL; p: number; t: number }> = ({ ll, p, t }) => {
  const { pos, quat } = useMemo(() => {
    const pos = v3(ll[0], ll[1], 1.006);
    return { pos, quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()) };
  }, [ll]);
  if (p <= 0) return null;
  const pr = (t * 1.3) % 1;
  return (
    <group position={pos} quaternion={quat} scale={back(cl(p))}>
      <mesh><circleGeometry args={[0.018, 24]} /><meshBasicMaterial color={HDR("#fff1dc", 4)} toneMapped={false} /></mesh>
      <mesh scale={1 + pr * 3}><ringGeometry args={[0.024, 0.03, 40]} /><meshBasicMaterial color={HDR("#ff8a1f", 2.2)} transparent opacity={(1 - pr) * 0.9} toneMapped={false} depthWrite={false} /></mesh>
    </group>
  );
};
/** small glowing tea crate travelling along a route */
const Crate: React.FC<{ pos: THREE.Vector3; s: number }> = ({ pos, s }) => (
  <group position={pos} scale={s}>
    <mesh><boxGeometry args={[0.07, 0.05, 0.05]} /><meshStandardMaterial color="#7a4a26" roughness={0.7} emissive="#ff8a1f" emissiveIntensity={0.35} /></mesh>
  </group>
);
const Coin: React.FC<{ pos: THREE.Vector3; t: number; i: number }> = ({ pos, t, i }) => (
  <mesh position={pos} rotation={[1.2, t * 4 + i, 0.3]}>
    <cylinderGeometry args={[0.032, 0.032, 0.008, 32]} />
    <meshStandardMaterial color="#e8e8ea" metalness={1} roughness={0.18} envMapIntensity={1.6} emissive="#9aa0a6" emissiveIntensity={0.25} />
  </mesh>
);
const Ship: React.FC<{ pos: THREE.Vector3; dir: THREE.Vector3; s: number }> = ({ pos, dir, s }) => {
  const q = useMemo(() => new THREE.Quaternion(), []);
  const up = pos.clone().normalize();
  const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), dir.clone().projectOnPlane(up).normalize(), up);
  q.setFromRotationMatrix(m);
  return (
    <group position={pos.clone().multiplyScalar(1.004)} quaternion={q} scale={s}>
      <mesh position={[0, 0.012, 0]}><boxGeometry args={[0.03, 0.022, 0.085]} /><meshStandardMaterial color="#2a1a10" roughness={0.6} /></mesh>
      <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.003, 0.003, 0.09, 8]} /><meshStandardMaterial color="#f3ece4" /></mesh>
      <mesh position={[0, 0.065, 0.004]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.05, 0.07]} /><meshBasicMaterial color={HDR("#ffb15c", 1.5)} toneMapped={false} side={THREE.DoubleSide} /></mesh>
    </group>
  );
};
/** a little 3D tea bush sprouting out of the globe surface at Assam */
const TeaBush: React.FC<{ ll: LL; p: number; t: number }> = ({ ll, p, t }) => {
  const { pos, quat, leaves } = useMemo(() => {
    const pos = v3(ll[0], ll[1], 1.0);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
    const leaves = Array.from({ length: 14 }, (_, i) => ({ h: 0.03 + (i / 14) * 0.13, an: i * 2.4, tilt: 0.9 - (i / 14) * 0.5 }));
    return { pos, quat, leaves };
  }, [ll]);
  if (p <= 0) return null;
  return (
    <group position={pos} quaternion={quat} scale={eo(cl(p))}>
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.004, 0.007, 0.16, 8]} /><meshStandardMaterial color="#6b4a2a" /></mesh>
      {leaves.map((l, i) => {
        const g = back(cl(p * 1.6 - i * 0.04));
        if (g <= 0) return null;
        return (
          <group key={i} position={[0, l.h, 0]} rotation={[0, l.an + Math.sin(t * 2 + i) * 0.05, 0]}>
            <mesh position={[0.03 * g, 0.006, 0]} rotation={[0, 0, l.tilt]} scale={[g * 1.0, g * 0.45, g * 0.06]}>
              <sphereGeometry args={[0.035, 16, 12]} />
              <meshStandardMaterial color="#5f8f2e" emissive="#ff8a1f" emissiveIntensity={0.18} roughness={0.45} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const GlobeBody: React.FC<{ g: G; t: number }> = ({ g, t }) => {
  const { dots, india, grid, indiaMat } = useMemo(() => {
    const dc = document.createElement("canvas"); dc.width = dc.height = 32;
    const dx = dc.getContext("2d")!; const gr = dx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "#fff"); gr.addColorStop(0.55, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    dx.fillStyle = gr; dx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(dc);
    const L = land as number[]; const all: number[] = [], ind: number[] = [];
    for (let i = 0; i < L.length; i += 3) { const p = v3(L[i], L[i + 1], 1.004); all.push(p.x, p.y, p.z); if (L[i + 2]) { const q = v3(L[i], L[i + 1], 1.006); ind.push(q.x, q.y, q.z); } }
    const mk = (arr: number[], color: THREE.Color, size: number) => { const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3)); const m = new THREE.PointsMaterial({ size, map: tex, color, transparent: true, depthWrite: false, toneMapped: false }); return { pts: new THREE.Points(geo, m), m }; };
    const a = mk(all, new THREE.Color("#e9ddd0"), 0.02), b = mk(ind, HDR("#ff8a1f", 1.9), 0.026);
    const gm = new THREE.LineBasicMaterial({ color: "#ff8a1f", transparent: true, opacity: 0.15 });
    const grid = new THREE.Group();
    for (let la = -60; la <= 75; la += 15) { const p: THREE.Vector3[] = []; for (let lo = 0; lo <= 360; lo += 4) p.push(v3(lo, la, 1.002)); grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), gm)); }
    for (let lo = 0; lo < 360; lo += 15) { const p: THREE.Vector3[] = []; for (let la = -90; la <= 90; la += 4) p.push(v3(lo, la, 1.002)); grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), gm)); }
    return { dots: a.pts, india: b.pts, grid, indiaMat: b.m };
  }, []);
  const teaCurve = useMemo(() => curveOf(TEA_ROUTE), []);
  const silverCurve = useMemo(() => curveOf([...TEA_ROUTE].reverse(), 1.03), []);
  const shipCurve = useMemo(() => curveOf(SHIP_ROUTE, 1.013), []);
  const atmo = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vN; void main(){ float i = pow(clamp(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 0.0, 1.0), 3.0); gl_FragColor = vec4(vec3(1.0,0.45,0.08) * i * 0.75, i); }`,
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
  }), []);
  indiaMat.opacity = fin(t, "source", 0.8, -0.2);
  // route progress
  const tea = seg(t, ev.england - 0.3, ev.england + 2.0);
  const shipP = eio(seg(t, ev.y1839 - 0.1, ev.london + 1.2));
  const crateP = seg(t, ev.bechta - 0.1, ev.bechta + 2.2);
  const silver = seg(t, ev.chaandi - 0.2, SCN[4].end);
  const gardens = fin(t, "gardens", 1.2, -0.2);
  return (
    <group quaternion={globeQuat(g)}>
      <mesh material={atmo} scale={1.2}><sphereGeometry args={[1, 64, 48]} /></mesh>
      <mesh><sphereGeometry args={[0.995, 96, 64]} /><meshBasicMaterial color="#140d08" /></mesh>
      <primitive object={grid} />
      <primitive object={dots} />
      <primitive object={india} />
      <Route curve={teaCurve} p={tea} color="#ff9a3a" />
      {crateP > 0 && crateP < 1 && <Crate pos={teaCurve.getPointAt(crateP).multiplyScalar(1.03)} s={1.2} />}
      {silver > 0 && t < SCN[5].start && Array.from({ length: 12 }, (_, i) => { const ph = (silver * 2.2 + i / 12) % 1; return ph < 0.97 ? <Coin key={i} pos={silverCurve.getPointAt(ph)} t={t} i={i} /> : null; })}
      <Route curve={shipCurve} p={shipP} color="#ffb15c" k={2.0} />
      {shipP > 0.001 && shipP < 0.999 && <Ship pos={shipCurve.getPointAt(shipP)} dir={shipCurve.getTangentAt(shipP)} s={1.0} />}
      <Pin ll={CANTON} p={fin(t, "england", 0.5, -0.6)} t={t} />
      <Pin ll={LONDON} p={fin(t, "england", 0.5, 1.4)} t={t} />
      <Pin ll={ASSAM} p={fin(t, "assam", 0.5, -0.1)} t={t} />
      <Pin ll={DARJ} p={fin(t, "darjeeling", 0.5, -0.1)} t={t} />
      <TeaBush ll={ASSAM} p={seg(t, ev.jungli - 0.2, ev.jungli + 1.6) * (1 - seg(t, ev.y1839 - 0.4, ev.y1839))} t={t} />
      {gardens > 0 && <GardenGlow g={gardens} t={t} />}
    </group>
  );
};
/** tea gardens: clusters of glowing dots spreading over Assam and the Darjeeling hills */
const GardenGlow: React.FC<{ g: number; t: number }> = ({ g }) => {
  const { pts, mat } = useMemo(() => {
    const arr: number[] = [];
    const r = (n: number) => { const x = Math.sin(n * 91.7) * 43758.5; return x - Math.floor(x); };
    for (const [c, n, s] of [[ASSAM, 160, 2.2], [[92.5, 26.4] as LL, 90, 1.6], [DARJ, 70, 0.9]] as [LL, number, number][])
      for (let i = 0; i < n; i++) { const p = v3(c[0] + (r(i + n) - 0.5) * s * 2, c[1] + (r(i * 3 + n) - 0.5) * s * 0.8, 1.007); arr.push(p.x, p.y, p.z); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    const mat = new THREE.PointsMaterial({ size: 0.012, color: HDR("#9ed05a", 1.7), transparent: true, toneMapped: false, depthWrite: false });
    return { pts: new THREE.Points(geo, mat), mat };
  }, []);
  mat.opacity = g;
  return <primitive object={pts} />;
};

export const Globe3D: React.FC<{ t: number }> = ({ t }) => {
  const g = state(t);
  const T3 = SCN[3].start, T7 = SCN[6].end;
  const a = seg(t, T3, T3 + 0.4) * (1 - seg(t, T7 - 0.3, T7));
  const lab = (ll: LL, text: string, p: number, dx: number, dy: number) => {
    if (p <= 0) return null;
    const s = screenLL(ll, g);
    if (s.vis < 0.05) return null;
    return <MonoTag key={text} x={s.x + dx} y={s.y + dy} a={cl(p * 2) * cl(s.vis * 4) * a}>{text}</MonoTag>;
  };
  const lon = screenLL(LONDON, g);
  const hearts = seg(t, ev.deewane - 0.1, SCN[3].end);
  const sc = (i: number, p: number) => p * (t >= SCN[i].start && t < SCN[i].end ? 1 : 0);
  return (
    <>
      <Layer opacity={a}>
        <CamRig pos={camPos(g)} />
        <Env />
        <WarmLights k={0.8} />
        <GlobeBody g={g} t={t} />
      </Layer>
      {lab(CANTON, "CHINA", fin(t, "england", 0.5, -0.6) * (1 - seg(t, SCN[5].start, SCN[5].start + 0.5)), 90, -40)}
      {lab(LONDON, "ENGLAND", fin(t, "england", 0.5, 1.4) * (1 - seg(t, SCN[5].start - 0.3, SCN[5].start)) + fin(t, "london", 0.5, 0), -110, -40)}
      {hearts > 0 && lon.vis > 0 && Array.from({ length: 7 }, (_, i) => {
        const ph = (hearts * 1.4 + i / 7) % 1;
        return <div key={i} style={{ position: "absolute", left: lon.x + Math.sin(i * 2.1) * 70, top: lon.y - 30 - ph * 220, transform: "translate(-50%,-50%)", fontSize: 34 + (i % 3) * 8, color: "#ff8a1f", opacity: (1 - ph) * cl(hearts * 5) * a, textShadow: "0 0 14px #ff8a1f" }}>♥</div>;
      })}
      <Badge x={540} y={1240} p={sc(4, pop(t, "chaandi", 0.5, 0.3))} fs={28}>CHAI ⇄ CHAANDI</Badge>
      <Badge x={540} y={640} p={sc(4, pop(t, "source", 0.5, 0))} fs={28}>APNA TEA SOURCE?</Badge>
      <Badge x={540} y={630} p={sc(5, pop(t, "y1823"))} fs={32}>1823</Badge>
      {lab(ASSAM, "ASSAM", fin(t, "assam", 0.5, 0) * (1 - seg(t, ev.y1839 - 0.4, ev.y1839)), 120, -70)}
      <MonoTag x={250} y={1180} a={sc(5, fin(t, "bruce", 0.4, 0.2))}>ROBERT BRUCE</MonoTag>
      <MonoTag x={830} y={1180} a={sc(5, fin(t, "singpho", 0.4, 0.2))}>SINGPHO LOG</MonoTag>
      {lab(DARJ, "DARJEELING", fin(t, "darjeeling", 0.5, 0) * (1 - seg(t, ev.y1839 - 0.4, ev.y1839)), -140, -60)}
      <Badge x={540} y={1240} p={sc(6, pop(t, "gardens", 0.5, 0.3)) * (1 - seg(t, ev.y1839 - 0.4, ev.y1839))} fs={28}>TEA GARDENS</Badge>
      <Badge x={540} y={630} p={sc(6, pop(t, "y1839"))} fs={32}>1839</Badge>
    </>
  );
};
