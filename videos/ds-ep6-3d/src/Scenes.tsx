import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CamRig, HDR, Layer, MonoTag, SCN, back, eio, ev, fin, lerp, project, seg } from "./common";

type V3 = [number, number, number];
const K = 0.45; // content units -> world units (nodes are authored ~1.6 units wide)
const sc = (v: V3): V3 => [v[0] * K, v[1] * K, v[2] * K];
/** keyframed cinematic camera: eased moves between [time, position, look-at] keys (content units) */
type Key = [number, V3, V3];
function camPath(t: number, keys: Key[]): { pos: V3; look: V3 } {
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
/** a box with neon edges and an emissive top plate */
const Slab: React.FC<{ p: V3; w: number; d?: number; h?: number; glow?: number; a?: number; col?: string }> = ({ p, w, d = 0.9, h = 0.5, glow = 0, a = 1, col = "#ff8a1f" }) => {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), [w, h, d]);
  useEffect(() => () => edges.dispose(), [edges]);
  if (a <= 0) return null;
  return (
    <group position={p}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#17100b" roughness={0.35} metalness={0.5} transparent opacity={a} />
      </mesh>
      <lineSegments geometry={edges} position={[0, h / 2, 0]}>
        <lineBasicMaterial color={HDR(col, 0.9 + 2.2 * glow)} toneMapped={false} transparent opacity={a} />
      </lineSegments>
      <mesh position={[0, h + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.82, d * 0.82]} />
        <meshBasicMaterial color={HDR(col, 0.12 + 1.5 * glow)} toneMapped={false} transparent opacity={a} />
      </mesh>
    </group>
  );
};


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
const Item: React.FC<{ p: V3; a?: number; glow?: number }> = ({ p, a = 1, glow = 0.35 }) => <Slab p={p} w={1.0} d={0.9} h={0.55} glow={glow} a={a} />;
/** a tree node: glowing sphere with a ring; col = orange (default), blue (cool), red */
const TNode: React.FC<{ p: V3; s?: number; glow?: number; col?: string; a?: number }> = ({ p, s = 1, glow = 0.4, col = "#ff8a1f", a = 1 }) =>
  s <= 0 || a <= 0 ? null : (
    <group position={p} scale={s}>
      <mesh>
        <sphereGeometry args={[0.42, 32, 24]} />
        <meshStandardMaterial color="#1c130d" emissive={new THREE.Color(col)} emissiveIntensity={0.15 + 0.9 * glow} roughness={0.35} metalness={0.4} transparent opacity={a} />
      </mesh>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.5, 0.035, 8, 48]} />
        <meshBasicMaterial color={HDR(col, 1.0 + 2.2 * glow)} toneMapped={false} transparent opacity={a} />
      </mesh>
    </group>
  );
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
/** 7-node binary tree layout in the x-y plane (index: 0 root, 1-2 level 1, 3-6 level 2) */
const TP: V3[] = [[0, 4.4, 0], [-2.4, 2.8, 0], [2.4, 2.8, 0], [-3.6, 1.2, 0], [-1.2, 1.2, 0], [1.2, 1.2, 0], [3.6, 1.2, 0]];
const PARENT = [-1, 0, 0, 1, 1, 2, 2];
const mix = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** move along a path of points, u in [0, n-1] */
const along = (P: V3[], u: number): V3 => { const i = Math.min(P.length - 2, Math.max(0, Math.floor(u))); return mix(P[i], P[i + 1], eio(Math.min(1, u - i))); };

/* ---------- Scene 1 (hook): the queue line lifts up and branches into a tree ---------- */
export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 0, 0);
  const lift = (i: number) => eio(seg(t, ev.shaakh - 1.2 + i * 0.18, ev.shaakh - 0.2 + i * 0.18));
  const row = (i: number): V3 => [(i - 3) * 1.3, 0.5, 0];
  const order = [3, 1, 4, 0, 5, 2, 6]; // row slot -> tree slot (in-order)
  const P = order.map((ti, i) => { const u = lift(i); const r = row(i), q = TP[ti]; return [lerp(r[0], q[0], u), lerp(r[1], q[1], u) + Math.sin(u * Math.PI) * 0.8, lerp(r[2], q[2], u) + Math.sin(u * Math.PI) * 0.6] as V3; });
  const at = (ti: number) => P[order.indexOf(ti)];
  const edges = seg(t, ev.shaakh + 0.6, ev.shaakh + 1.6);
  const { pos, look } = camPath(t, [[0, [-6, 3.0, 11], [-1, 0.6, 0]], [ev.queue + 1.4, [0, 3.4, 14], [0, 1.2, 0]], [ev.shaakh + 0.8, [0.5, 3.6, 17.5], [0, 2.8, 0]], [SCN[1].start, [1.2, 3.6, 17], [0, 2.8, 0]]]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {P.map((p, i) => (lift(i) < 0.5 ? <Item key={i} p={[p[0], p[1] - 0.5, p[2]]} glow={0.4} /> : <TNode key={i} p={p} glow={order[i] === 0 ? 1 : 0.4} />))}
        {[1, 2, 3, 4, 5, 6].map((c, k) => <Edge key={c} a={at(PARENT[c])} b={at(c)} p={seg(edges, k * 0.12, k * 0.12 + 0.4)} />)}
      </World>
      <Label p={[0, 0.5, 1.4]} cam={pos} look={look} a={a * fin(t, "queue", 0.4, 0) * (1 - seg(t, ev.shaakh - 1.4, ev.shaakh - 1.0))} text="QUEUE · EK LINE" mono size={22} />
    </>
  );
};

/* ---------- Scenes 3-7: family tree — node & root, parent → child, leaves, the one path ---------- */
const FT: { p: V3; n: string }[] = [{ p: [0, 4.4, 0], n: "DADA JI" }, { p: [-2.3, 2.8, 0], n: "PAPA" }, { p: [2.3, 2.8, 0], n: "CHACHA" }, { p: [-3.3, 1.2, 0], n: "AAP" }, { p: [-1.3, 1.2, 0], n: "BHAI" }, { p: [2.3, 1.2, 0], n: "BEHEN" }];
const FPAR = [-1, 0, 0, 1, 1, 2];
export const TermsScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 2, 6);
  const show = [fin(t, "dada", 0.5, -0.2), fin(t, "papa", 0.5, -0.2), fin(t, "chacha", 0.5, -0.2), fin(t, "aap", 0.5, -0.3), fin(t, "aap", 0.5, 0), fin(t, "aap", 0.5, 0.2)];
  const nodeP = seg(t, ev.node - 0.2, ev.node + 0.4) * (1 - seg(t, ev.root - 0.3, ev.root));
  const root = fin(t, "root", 0.4, -0.2) * (1 - seg(t, SCN[4].start, SCN[4].start + 0.3));
  const par = fin(t, "parent", 0.4, -0.2) * (1 - seg(t, SCN[5].start, SCN[5].start + 0.3)), chi = fin(t, "child", 0.4, -0.2) * (1 - seg(t, SCN[5].start, SCN[5].start + 0.3));
  const leaf = fin(t, "leaf", 0.4, -0.3) * (1 - seg(t, SCN[6].start, SCN[6].start + 0.3));
  const path = seg(t, ev.root2 - 0.1, ev.raasta + 0.4) * 2; // 0..2 along DADA -> PAPA -> AAP
  const pathOn = seg(t, ev.root2 - 0.3, ev.root2);
  const { pos, look } = camPath(t, [
    [SCN[2].start, [0, 4.4, 15], [0, 2.8, 0]],
    [ev.aap + 0.6, [-1.0, 3.4, 17], [0, 2.6, 0]],
    [ev.root + 0.4, [0.4, 4.6, 14.5], [0, 3.0, 0]],
    [ev.child + 0.4, [-2.0, 3.2, 13.5], [-1.4, 2.4, 0]],
    [ev.patte + 0.4, [1.0, 3.0, 16], [0, 2.4, 0]],
    [ev.raasta + 0.6, [-1.6, 3.6, 14], [-1.2, 2.8, 0]],
    [SCN[7].start, [-1.2, 3.8, 14.5], [-1.0, 2.8, 0]],
  ]);
  const onPath = (i: number) => i === 0 || i === 1 || i === 3;
  const cols = FT.map((_, i) => (leaf > 0.3 && (i >= 3) ? "#7cc4ff" : chi > 0.3 && (i === 3 || i === 4) ? "#7cc4ff" : "#ff8a1f"));
  const glows = FT.map((_, i) => 0.35 + nodeP * 0.8 + (i === 0 ? 1.2 * root : 0) + (i === 1 ? 1.2 * par : 0) + ((i === 3 || i === 4) ? 0.9 * chi : 0) + (i >= 3 ? 0.9 * leaf : 0) + (pathOn > 0 && onPath(i) && path >= [0, 1, 0, 2][i] - 0.05 ? 1.2 : 0));
  const PP: V3[] = [FT[0].p, FT[1].p, FT[3].p];
  const orb = along(PP, path);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {FT.map((f, i) => <TNode key={i} p={f.p} s={back(show[i])} glow={glows[i]} col={cols[i]} />)}
        {FT.map((f, i) => (i === 0 ? null : <Edge key={i} a={FT[FPAR[i]].p} b={f.p} p={show[i]} col={pathOn > 0 && onPath(i) && path >= (i === 1 ? 0.95 : 1.95) ? "#ffb15c" : "#ff8a1f"} k={pathOn > 0 && onPath(i) && path >= (i === 1 ? 0.95 : 1.95) ? 2.6 : 1.2} />))}
        {pathOn > 0 && <Orb p={[orb[0], orb[1], orb[2] + 0.55]} s={pathOn} />}
      </World>
      {FT.map((f, i) => (
        <Label key={i} p={[f.p[0], f.p[1] - 0.85, 0.2]} cam={pos} look={look} a={a * show[i]} text={f.n} size={22} hot={i === 3} maxD={30} />
      ))}
      <Label p={[0, 5.35, 0]} cam={pos} look={look} a={a * root} text="ROOT" mono size={24} hot />
      <Label p={[-2.3, 3.75, 0]} cam={pos} look={look} a={a * par} text="PARENT" mono size={22} hot />
      <Label p={[-2.3, 0.0, 0]} cam={pos} look={look} a={a * chi} text="CHILD · CHILD" mono size={20} col="#7cc4ff" />
      <Label p={[0, 0.1, 0]} cam={pos} look={look} a={a * leaf} text="LEAF · LEAF · LEAF" mono size={22} col="#7cc4ff" />
      <Label p={[-1.6, 4.2, 0]} cam={pos} look={look} a={a * fin(t, "raasta", 0.4, -0.2)} text="EK HI RAASTA" mono size={22} hot />
    </>
  );
};

/* ---------- Scenes 9-12: binary search tree — small left, big right; search 40 halves the tree each step ---------- */
const BV = [50, 30, 70, 20, 40, 60, 80];
export const BstScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 8, 11);
  const grow = (i: number) => back(seg(t, SCN[8].start + 0.1 + i * 0.12, SCN[8].start + 0.5 + i * 0.12));
  const lt = fin(t, "chhota", 0.4, -0.1) * (1 - seg(t, ev.q40 - 0.4, ev.q40)), rt = fin(t, "bada", 0.4, -0.1) * (1 - seg(t, ev.q40 - 0.4, ev.q40));
  const s1 = eio(seg(t, ev.baayein - 0.3, ev.baayein + 0.3)), s2 = eio(seg(t, ev.daayein - 0.3, ev.daayein + 0.3));
  const cutR = seg(t, ev.baayein, ev.baayein + 0.6), cutL = seg(t, ev.daayein, ev.daayein + 0.6);
  const found = seg(t, ev.mil - 0.2, ev.mil + 0.2);
  const half = seg(t, ev.aadha - 0.3, ev.aadha + 0.4);
  const orbP: V3 = s2 > 0 ? mix(TP[1], TP[4], s2) : mix(TP[0], TP[1], s1);
  const orbA = seg(t, ev.q40 - 0.4, ev.q40) * (1 - found);
  const fade = (i: number) => 1 - 0.85 * ((i === 2 || i === 5 || i === 6) ? cutR : i === 3 ? cutL : 0) * (1 - half * 0.0);
  const { pos, look } = camPath(t, [
    [SCN[8].start, [0, 3.4, 18], [0, 2.8, 0]],
    [ev.daayin + 0.4, [1.0, 3.4, 17.5], [0, 2.8, 0]],
    [ev.n50 + 0.2, [-0.6, 4.2, 12], [-0.8, 3.4, 0]],
    [ev.mil + 0.4, [-1.4, 2.8, 11], [-1.4, 2.2, 0]],
    [ev.log + 0.4, [0.2, 3.4, 18], [0, 2.8, 0]],
    [SCN[12].start, [0.8, 3.4, 17.5], [0, 2.8, 0]],
  ]);
  const col = (i: number) => (i === 4 && found > 0 ? "#ffb15c" : (lt > 0.3 && (i === 1 || i === 3 || i === 4)) ? "#7cc4ff" : "#ff8a1f");
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {TP.map((p, i) => <TNode key={i} p={p} s={grow(i) * (i === 4 ? 1 + 0.35 * found : 1)} glow={0.35 + ((i === 2 || i === 5 || i === 6) ? 0.7 * rt : 0) + ((i === 1 || i === 3 || i === 4) ? 0.7 * lt : 0) + (i === 4 ? 1.8 * found : 0)} col={col(i)} a={fade(i)} />)}
        {TP.map((p, i) => (i === 0 ? null : <Edge key={i} a={TP[PARENT[i]]} b={p} p={grow(i)} op={fade(i)} k={(i === 1 && s1 > 0.5) || (i === 4 && s2 > 0.5) ? 2.6 : 1.2} col={(i === 1 && s1 > 0.5) || (i === 4 && s2 > 0.5) ? "#ffb15c" : "#ff8a1f"} />))}
        {orbA > 0 && <Orb p={[orbP[0], orbP[1] + 0.75, orbP[2] + 0.3]} s={orbA} />}
      </World>
      {TP.map((p, i) => (
        <Label key={i} p={[p[0], p[1], 0.55]} cam={pos} look={look} a={a * grow(i) * fade(i)} text={String(BV[i])} size={30} hot={i === 4 && found > 0} maxD={30} />
      ))}
      <Label p={[orbP[0] + 0.9, orbP[1] + 0.9, 0.3]} cam={pos} look={look} a={a * orbA} text="40?" mono size={24} hot />
      <Label p={[-2.4, 0.2, 0]} cam={pos} look={look} a={a * lt} text="← CHHOTE" mono size={22} col="#7cc4ff" />
      <Label p={[2.4, 0.2, 0]} cam={pos} look={look} a={a * rt} text="BADE →" mono size={22} hot />
      <Label p={[TP[4][0], TP[4][1] - 0.95, 0.3]} cam={pos} look={look} a={a * found} text="MIL GAYA!" mono size={24} hot />
      <MonoTag x={540} y={640} a={a * fin(t, "n50", 0.4, -0.2) * (1 - seg(t, ev.n30 - 0.4, ev.n30))}>40 &lt; 50 → BAAYEIN · AADHA TREE CHHOOTA</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "n30", 0.4, -0.2) * (1 - seg(t, ev.aadha - 0.4, ev.aadha))}>40 &gt; 30 → DAAYEIN</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "aadha", 0.4, -0.2)}>7 NODES → SIRF 3 CHECK</MonoTag>
    </>
  );
};

/* ---------- Scenes 14-15: balanced vs sorted inserts — the tree collapses into a long line ---------- */
const SV = [10, 20, 30, 40, 50, 60, 70];
const BAL = [3, 1, 4, 0, 5, 2, 6]; // value index -> balanced slot (40 at root)
export const SkewScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 13, 14);
  const sk = eio(seg(t, ev.sorted - 0.2, ev.lambi + 0.4));
  const LINE = (i: number): V3 => [-3.6 + i * 1.2, 5.2 - i * 0.75, 0];
  const P = SV.map((_, i) => mix(TP[BAL[i]], LINE(i), sk));
  const parentOfBal = (i: number) => { const slot = BAL[i]; const ps = PARENT[slot]; return ps < 0 ? -1 : BAL.indexOf(ps); };
  const hop = seg(t, ev.lambi + 0.5, ev.bign + 0.3) * 6;
  const orb = along(SV.map((_, i) => LINE(i)), hop);
  const bal = fin(t, "balanced", 0.4, -0.2) * (1 - seg(t, ev.sorted - 0.4, ev.sorted));
  const { pos, look } = camPath(t, [
    [SCN[13].start, [0, 3.4, 18], [0, 2.8, 0]],
    [ev.sorted + 0.2, [-1.0, 3.4, 17.5], [0, 2.8, 0]],
    [ev.lambi + 0.6, [-1.0, 3.4, 19], [0, 2.4, 0]],
    [SCN[15].start, [-0.6, 3.2, 18.6], [0, 2.4, 0]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {P.map((p, i) => <TNode key={i} p={p} glow={0.35 + 0.8 * bal + (sk > 0.95 && hop >= i - 0.05 ? 0.9 : 0)} col={sk > 0.5 ? "#ff5a3c" : "#ff8a1f"} />)}
        {SV.map((_, i) => {
          const balP = parentOfBal(i); const balEdge = balP >= 0 ? <Edge key={`b${i}`} a={P[balP]} b={P[i]} op={1 - seg(sk, 0, 0.4)} /> : null;
          const lineEdge = i > 0 ? <Edge key={`l${i}`} a={P[i - 1]} b={P[i]} op={seg(sk, 0.6, 1)} col="#ff5a3c" k={1.4} /> : null;
          return <group key={i}>{balEdge}{lineEdge}</group>;
        })}
        {sk > 0.95 && hop > 0 && hop < 6.2 && <Orb p={[orb[0], orb[1] + 0.7, 0.3]} />}
      </World>
      {P.map((p, i) => (
        <Label key={i} p={[p[0], p[1], 0.55]} cam={pos} look={look} a={a} text={String(SV[i])} size={26} maxD={30} />
      ))}
      <Label p={[0, 5.4, 0]} cam={pos} look={look} a={a * bal} text="BALANCED ✓" mono size={24} hot />
      <MonoTag x={540} y={640} a={a * fin(t, "sorted", 0.4, -0.2)}>INSERT 10, 20, 30, 40… (SORTED)</MonoTag>
      <Label p={[1.0, 0.0, 0]} cam={pos} look={look} a={a * fin(t, "bign", 0.4, -0.2)} text={`${Math.min(7, Math.floor(hop) + 1)} / 7 CHECK`} mono size={24} col="#ff5a3c" />
    </>
  );
};
