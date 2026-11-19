import * as THREE from "three";
import { CamRig, HDR, Layer, MonoTag, SCN, back, eio, ev, fin, lerp, project, seg } from "./common";

type V3 = [number, number, number];
const K = 0.45; // content units -> world units (nodes are authored ~1.6 units wide)
const sc = (v: V3): V3 => [v[0] * K, v[1] * K, v[2] * K];
/** keyframed cinematic camera: eased moves between [time, position, look-at] keys (content units) */
type Key = [number, V3, V3];
const ZOOM = 1.35; // the A–G graph is tall in the vertical frame: every key sits 1.35x farther from its look-at point
function camPath(t: number, keys: Key[]): { pos: V3; look: V3 } {
  const r = camPath0(t, keys);
  return { pos: [r.look[0] + (r.pos[0] - r.look[0]) * ZOOM, r.look[1] + (r.pos[1] - r.look[1]) * ZOOM, r.look[2] + (r.pos[2] - r.look[2]) * ZOOM], look: r.look };
}
function camPath0(t: number, keys: Key[]): { pos: V3; look: V3 } {
  if (t <= keys[0][0]) return { pos: keys[0][1], look: keys[0][2] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, p0, l0] = keys[i], [t1, p1, l1] = keys[i + 1];
    if (t <= t1) { const u = eio(seg(t, t0, t1)); return { pos: [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), lerp(p0[2], p1[2], u)], look: [lerp(l0[0], l1[0], u), lerp(l0[1], l1[1], u), lerp(l0[2], l1[2], u)] }; }
  }
  const k = keys[keys.length - 1];
  return { pos: k[1], look: k[2] };
}
const span = (t: number, a: number, b: number) => seg(t, SCN[a].start, SCN[a].start + 0.3) * (1 - seg(t, SCN[b + 1].start - 0.25, SCN[b + 1].start));

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[-2, 4, 4]} intensity={2.2} color="#ffe2bf" />
    <pointLight position={[2, 2, 3]} intensity={10} color="#ff8a1f" />
  </>
);
const Floor: React.FC = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[90, 90]} />
      <meshBasicMaterial color="#060403" />
    </mesh>
    <gridHelper args={[90, 90, "#c8621a", "#5a2c0e"]} />
  </>
);



const Label: React.FC<{ p: V3; cam: V3; look: V3; a: number; text: string; size?: number; mono?: boolean; hot?: boolean; maxD?: number; col?: string }> = ({ p, cam, look, a, text, size = 30, mono, hot, maxD = 99, col }) => {
  if (a <= 0) return null;
  const d = Math.hypot(p[0] - cam[0], p[1] - cam[1], p[2] - cam[2]);
  const fade = 1 - seg(d, maxD * 0.7, maxD);
  if (fade <= 0) return null;
  const s = project(new THREE.Vector3(...sc(p)), sc(cam), sc(look));
  const band = seg(s.y, 590, 640) * (1 - seg(s.y, 1190, 1230)) * seg(s.x, 20, 70) * (1 - seg(s.x, 1010, 1060)); // keep labels inside the 3D band
  if (band <= 0) return null;
  const k = Math.min(1.6, 14 / d); // tree shots sit farther back, so labels scale up
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y, transform: "translate(-50%,-50%)", fontFamily: mono ? "J" : "M", fontWeight: mono ? 500 : 900, fontSize: size * k, color: col || (hot ? "#ffb15c" : "#f6efe7"), textShadow: "0 0 12px rgba(255,138,31,.9), 0 2px 6px #000", opacity: Math.min(1, a) * fade * band, whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};
const World: React.FC<{ a: number; cam: V3; look: V3; bloom?: number; children: React.ReactNode }> = ({ a, cam, look, bloom = 1.2, children }) => (
  <Layer opacity={a} bloom={bloom}>
    <CamRig pos={sc(cam)} look={sc(look)} />
    <Lights />
    <group scale={K}>
      <Floor />
      {children}
    </group>
  </Layer>
);


/* ---------- Ep 4 pieces ---------- */


/* ---------- Ep 6 pieces ---------- */

/** a straight glowing edge from a to b, drawn on by p */
const Edge: React.FC<{ a: V3; b: V3; p?: number; col?: string; k?: number; op?: number }> = ({ a, b, p = 1, col = "#ff8a1f", k = 1.2, op = 1 }) => {
  if (p <= 0 || op <= 0) return null;
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const E = A.clone().lerp(B, Math.min(1, p));
  const len = A.distanceTo(E);
  const mid = A.clone().add(E).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[0.045, 0.045, len, 8]} />
      <meshBasicMaterial color={HDR(col, k)} toneMapped={false} transparent opacity={op} />
    </mesh>
  );
};
const Orb: React.FC<{ p: V3; s?: number; col?: string }> = ({ p, s = 1, col = "#ffb15c" }) =>
  s <= 0 ? null : (
    <mesh position={p} scale={s}>
      <sphereGeometry args={[0.2, 24, 16]} />
      <meshBasicMaterial color={HDR(col, 3)} toneMapped={false} />
    </mesh>
  );
const mix = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

/* ---------- Ep 7: one graph on the floor (stations A–G) ---------- */
const NAMES = ["A", "B", "C", "D", "E", "F", "G"];
// laid out narrow and deep so it fits the vertical frame
const GV: V3[] = ([[-4, 0.15, -1.5], [-1.5, 0.15, -3], [-1.8, 0.15, 0.8], [1.2, 0.15, -1.2], [1.6, 0.15, 2.6], [4.2, 0.15, 0], [-4.2, 0.15, 2.6]] as V3[]).map(([x, y, z]): V3 => [x * 0.65, y, z * 1.15]);
const GE: [number, number, number][] = [[0, 1, 4], [0, 2, 2], [0, 6, 3], [1, 3, 5], [2, 3, 3], [2, 4, 6], [6, 4, 4], [3, 5, 2], [4, 5, 3]]; // [u, v, weight]
const edgeKey = (u: number, v: number) => (u < v ? `${u}-${v}` : `${v}-${u}`);
/** a metro station: flat glowing disc + ring */
const Station: React.FC<{ p: V3; s?: number; glow?: number; col?: string }> = ({ p, s = 1, glow = 0.35, col = "#ff8a1f" }) =>
  s <= 0 ? null : (
    <group position={p} scale={s}>
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, 0.2, 32]} />
        <meshStandardMaterial color="#1c130d" emissive={new THREE.Color(col)} emissiveIntensity={0.15 + 0.9 * glow} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.6, 40]} />
        <meshBasicMaterial color={HDR(col, 1.0 + 2.2 * glow)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
/** an arrow head sitting on an edge at fraction f, pointing from a to b */
const Head: React.FC<{ a: V3; b: V3; f?: number; s?: number; col?: string }> = ({ a, b, f = 0.62, s = 1, col = "#ffb15c" }) => {
  if (s <= 0) return null;
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const P = A.clone().lerp(B, f);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <mesh position={P} quaternion={q} scale={s}>
      <coneGeometry args={[0.16, 0.4, 12]} />
      <meshBasicMaterial color={HDR(col, 2.4)} toneMapped={false} />
    </mesh>
  );
};
/** a ripple ring on the floor (BFS waves) */
const Ripple: React.FC<{ p: V3; r: number; a: number }> = ({ p, r, a }) =>
  a <= 0 || r <= 0 ? null : (
    <mesh position={[p[0], 0.03, p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r, r + 0.08, 64]} />
      <meshBasicMaterial color={HDR("#7cc4ff", 1.8)} toneMapped={false} transparent opacity={a} side={THREE.DoubleSide} />
    </mesh>
  );
const along = (P: V3[], u: number): V3 => { const i = Math.min(P.length - 2, Math.max(0, Math.floor(u))); return mix(P[i], P[i + 1], eio(Math.min(1, u - i))); };

/* ---------- Scene 1 (hook): last episode's tree falls flat and gets cross links -> a graph ---------- */
const TREEP: V3[] = [[0, 4.4, 0], [-2.4, 2.8, 0], [2.4, 2.8, 0], [-3.6, 1.2, 0], [-1.2, 1.2, 0], [1.2, 1.2, 0], [3.6, 1.2, 0]];
const TREE_TO_G = [0, 1, 2, 3, 5, 4, 6]; // tree slot -> station index
const TREE_EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 0, 0);
  const fall = eio(seg(t, ev.parent + 0.6, ev.judi - 0.4));
  const cross = seg(t, ev.judi - 0.4, ev.judi + 0.8);
  const P: V3[] = new Array(7);
  TREEP.forEach((tp, i) => { P[TREE_TO_G[i]] = mix(tp, GV[TREE_TO_G[i]], fall); });
  const { pos, look } = camPath(t, [[0, [0, 3.2, 16], [0, 2.8, 0]], [ev.parent + 0.4, [0.5, 3.4, 16], [0, 2.6, 0]], [ev.judi + 0.2, [0, 12, 12], [0, 0, 0]], [SCN[1].start, [1.2, 12.5, 11], [0, 0, 0]]]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {P.map((p, i) => <Station key={i} p={p} glow={0.4 + (i === 0 ? 0.5 * (1 - fall) : 0)} />)}
        {TREE_EDGES.map(([u, v], k) => <Edge key={`t${k}`} a={P[TREE_TO_G[u]]} b={P[TREE_TO_G[v]]} op={1 - seg(cross, 0.2, 0.7)} />)}
        {GE.map(([u, v], k) => <Edge key={`g${k}`} a={P[u]} b={P[v]} p={seg(cross, k * 0.06, k * 0.06 + 0.45)} col={k % 2 ? "#7cc4ff" : "#ff8a1f"} k={1.5} />)}
      </World>
      {P.map((p, i) => (
        <Label key={i} p={[p[0], p[1] + 0.7, p[2]]} cam={pos} look={look} a={a} text={NAMES[i]} size={26} maxD={30} />
      ))}
      <Label p={[0, 5.4, 0]} cam={pos} look={look} a={a * fin(t, "parent", 0.4, 0) * (1 - fall)} text="EK PARENT" mono size={22} hot />
    </>
  );
};

/* ---------- Scenes 3-5: the metro — stations (vertex), lines (edge), no root, many paths ---------- */
const P1 = [0, 1, 3, 5], P2 = [0, 6, 4, 5]; // two routes A -> F
export const MetroScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 2, 4);
  const appear = (i: number) => back(seg(t, SCN[2].start + 0.2 + i * 0.15, SCN[2].start + 0.6 + i * 0.15));
  const vx = seg(t, ev.vertex - 0.3, ev.vertex + 0.3) * (1 - seg(t, ev.edge - 0.3, ev.edge));
  const ed = seg(t, ev.edge - 0.3, ev.edge + 0.3) * (1 - seg(t, ev.root - 0.3, ev.root));
  const r1 = seg(t, ev.raaste - 1.4, ev.raaste - 0.2), r2 = seg(t, ev.raaste - 0.2, ev.raaste + 1.0);
  const on1 = new Set(P1.slice(0, -1).map((u, k) => edgeKey(u, P1[k + 1]))), on2 = new Set(P2.slice(0, -1).map((u, k) => edgeKey(u, P2[k + 1])));
  const { pos, look } = camPath(t, [
    [SCN[2].start, [-6.5, 4.5, 9.5], [-1, 0, 0]],
    [ev.kai + 0.6, [0, 11.5, 11.5], [0, 0, 0]],
    [ev.vertex + 0.4, [-2.6, 5.5, 7.0], [-1.8, 0, 0.6]],
    [ev.edge + 0.5, [0.8, 6.5, 8.5], [0, 0, -0.4]],
    [ev.raaste + 0.6, [0, 13, 11.5], [0, 0, 0]],
    [SCN[5].start, [0.8, 13, 11], [0, 0, 0]],
  ]);
  const o1 = along(P1.map((i) => GV[i]), r1 * 3), o2 = along(P2.map((i) => GV[i]), r2 * 3);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {GV.map((p, i) => <Station key={i} p={p} s={appear(i)} glow={0.35 + 1.1 * vx * (i === 2 ? 1 : 0.5)} />)}
        {GE.map(([u, v], k) => {
          const key = edgeKey(u, v); const h1 = on1.has(key) && r1 > 0, h2 = on2.has(key) && r2 > 0;
          return <Edge key={k} a={GV[u]} b={GV[v]} p={seg(t, SCN[2].start + 0.8 + k * 0.1, SCN[2].start + 1.3 + k * 0.1)} col={h1 ? "#ffb15c" : h2 ? "#7cc4ff" : k % 2 ? "#5a8fb8" : "#c8621a"} k={h1 || h2 ? 2.6 : 1.2 + 1.4 * ed} />;
        })}
        {r1 > 0 && r1 < 1 && <Orb p={[o1[0], 0.6, o1[2]]} />}
        {r2 > 0 && r2 < 1 && <Orb p={[o2[0], 0.6, o2[2]]} col="#7cc4ff" />}
      </World>
      {GV.map((p, i) => (
        <Label key={i} p={[p[0], 0.9, p[2]]} cam={pos} look={look} a={a * appear(i)} text={NAMES[i]} size={26} hot={i === 0 || i === 5} maxD={30} />
      ))}
      <Label p={[GV[2][0], 1.6, GV[2][2]]} cam={pos} look={look} a={a * vx} text="VERTEX" mono size={24} hot />
      <Label p={[(GV[2][0] + GV[3][0]) / 2, 0.9, (GV[2][2] + GV[3][2]) / 2]} cam={pos} look={look} a={a * ed} text="EDGE" mono size={24} col="#7cc4ff" />
      <MonoTag x={540} y={640} a={a * fin(t, "root", 0.4, -0.2) * (1 - seg(t, ev.raaste - 1.6, ev.raaste - 1.3))}>KOI ROOT NAHI · KOI BHI SHURUAAT</MonoTag>
      <MonoTag x={540} y={640} a={a * seg(t, ev.raaste - 1.4, ev.raaste - 1.0)}>A → F : A-B-D-F · A-G-E-F · …</MonoTag>
    </>
  );
};

/* ---------- Scenes 6-8: directed (follow), undirected (friends), weighted (distance) ---------- */
export const TypesScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 5, 7);
  const dir = fin(t, "insta", 0.5, -0.2) * (1 - seg(t, SCN[6].start, SCN[6].start + 0.3));
  const und = fin(t, "dono", 0.5, -0.3) * (1 - seg(t, SCN[7].start, SCN[7].start + 0.3));
  const wt = fin(t, "doori", 0.5, -0.3);
  const flow = (t * 0.7) % 1;
  const { pos, look } = camPath(t, [
    [SCN[5].start, [-1.5, 9.5, 9.5], [0, 0, 0]],
    [ev.directed + 0.4, [1.5, 9.0, 9.5], [0, 0, 0]],
    [ev.undirected + 0.4, [-1.0, 10.5, 10.5], [0, 0, 0]],
    [ev.weighted + 0.4, [0, 13, 9.5], [0, 0, 0.2]],
    [SCN[8].start, [0.6, 13, 9.0], [0, 0, 0.2]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {GV.map((p, i) => <Station key={i} p={p} glow={0.4} col={und > 0.3 ? "#7cc4ff" : "#ff8a1f"} />)}
        {GE.map(([u, v], k) => (
          <group key={k}>
            <Edge a={GV[u]} b={GV[v]} col={und > 0.3 ? "#7cc4ff" : "#ff8a1f"} k={1.4} />
            <Head a={GV[u]} b={GV[v]} f={0.6} s={dir} />
            <Head a={GV[u]} b={GV[v]} f={0.75} s={und} col="#7cc4ff" />
            <Head a={GV[v]} b={GV[u]} f={0.75} s={und} col="#7cc4ff" />
            {dir > 0.5 && <Orb p={[lerp(GV[u][0], GV[v][0], flow), 0.4, lerp(GV[u][2], GV[v][2], flow)]} s={0.5} />}
          </group>
        ))}
      </World>
      {GV.map((p, i) => (
        <Label key={i} p={[p[0], 0.9, p[2]]} cam={pos} look={look} a={a} text={NAMES[i]} size={24} maxD={30} />
      ))}
      {GE.map(([u, v, w], k) => (
        <Label key={`w${k}`} p={[(GV[u][0] + GV[v][0]) / 2, 0.6, (GV[u][2] + GV[v][2]) / 2]} cam={pos} look={look} a={a * wt} text={`${w}`} mono size={28} hot maxD={30} />
      ))}
      <MonoTag x={540} y={640} a={a * dir}>FOLLOW: A → B (EK TARFA)</MonoTag>
      <MonoTag x={540} y={640} a={a * und}>DOSTI: A ↔ B (DONO TARAF)</MonoTag>
      <MonoTag x={540} y={640} a={a * wt}>EDGE PAR KM / MIN</MonoTag>
    </>
  );
};

/* ---------- Scenes 10-13: BFS waves, DFS with backtracking, shortest path by weights ---------- */
const LEVEL = [0, 1, 1, 2, 2, 3, 1]; // BFS levels from A
const DFS_PATH = [0, 1, 3, 2, 4, 6, 4, 5]; // A B D C E G (back to E) F
export const SearchScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 9, 12);
  const bfsT0 = ev.saare - 0.3, bfsDt = (ev.lehrein + 0.8 - bfsT0) / 3;
  const lvl = seg(t, bfsT0, bfsT0 + 3 * bfsDt) * 3 * (t < ev.dfs - 0.5 ? 1 : 0);
  const dfsU = seg(t, ev.dfs + 0.3, ev.bhool + 0.6) * (DFS_PATH.length - 1);
  const dfsOn = t > ev.dfs - 0.2 && t < ev.chhota - 0.4;
  const dfsSeen = new Set(DFS_PATH.slice(0, Math.floor(dfsU) + 1));
  const back_ = dfsU > 5 && dfsU < 6.2;
  const sp = t > ev.chhota - 0.4;
  const spU = seg(t, ev.wazan - 0.6, ev.kam + 0.2);
  const SP = [0, 2, 3, 5], spEdges = new Set([edgeKey(0, 2), edgeKey(2, 3), edgeKey(3, 5)]);
  const wt = seg(t, ev.chhota - 0.4, ev.chhota);
  const { pos, look } = camPath(t, [
    [SCN[9].start, [0, 12, 12], [0, 0, 0]],
    [ev.lehrein + 0.6, [-1.0, 12.5, 11.5], [0, 0, 0]],
    [ev.dfs + 0.4, [-4.0, 7.5, 8.5], [-1.5, 0, 0]],
    [ev.bhool + 0.6, [1.5, 9.0, 9.5], [0.5, 0, 0]],
    [ev.kam + 0.5, [0, 13, 10.5], [0, 0, 0]],
    [SCN[13].start, [0.8, 13, 10], [0, 0, 0]],
  ]);
  const orb = along(DFS_PATH.map((i) => GV[i]), dfsU);
  const spOrb = along(SP.map((i) => GV[i]), spU * 3);
  const col = (i: number) => (sp ? (SP.includes(i) && spU > 0 ? "#ffb15c" : "#ff8a1f") : dfsOn ? (dfsSeen.has(i) ? "#7cc4ff" : "#ff8a1f") : lvl >= LEVEL[i] && lvl > 0 ? (LEVEL[i] === 0 ? "#ffb15c" : "#7cc4ff") : "#ff8a1f");
  const glow = (i: number) => 0.35 + (sp ? (SP.includes(i) && spU > 0 ? 1.2 : 0) : dfsOn ? (dfsSeen.has(i) ? 0.9 : 0) : lvl >= LEVEL[i] && lvl > 0 ? 0.9 : 0);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {GV.map((p, i) => <Station key={i} p={p} glow={glow(i)} col={col(i)} />)}
        {GE.map(([u, v], k) => {
          const hot = sp && spEdges.has(edgeKey(u, v)) && spU > 0;
          return <Edge key={k} a={GV[u]} b={GV[v]} col={hot ? "#ffb15c" : "#c8621a"} k={hot ? 2.8 : 1.1} />;
        })}
        {[0, 1, 2].map((k) => { const q = lvl - k; return q > 0 && q < 1.4 ? <Ripple key={k} p={GV[0]} r={0.6 + q * 3.2} a={(1 - q / 1.4) * 0.9} /> : null; })}
        {dfsOn && dfsU > 0 && <Orb p={[orb[0], 0.65, orb[2]]} col={back_ ? "#ff5a3c" : "#ffb15c"} />}
        {sp && spU > 0 && spU < 1 && <Orb p={[spOrb[0], 0.65, spOrb[2]]} />}
      </World>
      {GV.map((p, i) => (
        <Label key={i} p={[p[0], 0.9, p[2]]} cam={pos} look={look} a={a} text={NAMES[i]} size={24} maxD={30} />
      ))}
      {GV.map((p, i) => (
        <Label key={`l${i}`} p={[p[0] + 0.75, 0.3, p[2] + 0.5]} cam={pos} look={look} a={a * (lvl >= LEVEL[i] && lvl > 0 && !dfsOn && !sp ? 1 : 0)} text={`L${LEVEL[i]}`} mono size={20} col="#7cc4ff" maxD={30} />
      ))}
      {GE.map(([u, v, w], k) => (
        <Label key={`w${k}`} p={[(GV[u][0] + GV[v][0]) / 2, 0.6, (GV[u][2] + GV[v][2]) / 2]} cam={pos} look={look} a={a * wt} text={`${w}`} mono size={26} hot={spEdges.has(edgeKey(u, v))} maxD={30} />
      ))}
      <Label p={[orb[0], 1.6, orb[2]]} cam={pos} look={look} a={a * (back_ && dfsOn ? 1 : 0)} text="WAPAS ↩" mono size={22} col="#ff5a3c" />
      <MonoTag x={540} y={640} a={a * (t > bfsT0 && t < ev.dfs - 0.5 ? 1 : 0)}>BFS: A → B, C, G → D, E → F</MonoTag>
      <MonoTag x={540} y={640} a={a * (dfsOn ? fin(t, "dfs", 0.4, 0) : 0)}>DFS: A → B → D → C → E → G ↩ F</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "kam", 0.4, -0.2)}>A-C-D-F = 2 + 3 + 2 = 7</MonoTag>
    </>
  );
};
