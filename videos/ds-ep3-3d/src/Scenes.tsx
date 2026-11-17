import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CamRig, HDR, Layer, MonoTag, SCN, back, eio, eo, ev, fin, lerp, project, seg } from "./common";

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
const mix3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

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
/** linked-list node: [ data | next ] (or [ prev | data | next ] when doubly). p = centre on the floor */
const Node: React.FC<{ p: V3; a?: number; glow?: number; ptr?: number; prev?: number; doubly?: boolean; red?: boolean }> = ({ p, a = 1, glow = 0.3, ptr = 0.3, prev = 0.3, doubly, red }) => {
  if (a <= 0) return null;
  const col = red ? "#ff5a3c" : "#ff8a1f";
  return (
    <group position={p}>
      {doubly ? (
        <>
          <Slab p={[-0.56, 0, 0]} w={0.5} glow={prev} a={a} col="#7cc4ff" />
          <Slab p={[0, 0, 0]} w={0.58} glow={glow} a={a} col={col} />
          <Slab p={[0.56, 0, 0]} w={0.5} glow={ptr} a={a} col={col} />
        </>
      ) : (
        <>
          <Slab p={[-0.3, 0, 0]} w={1.0} glow={glow} a={a} col={col} />
          <Slab p={[0.5, 0, 0]} w={0.55} glow={ptr} a={a} col={col} />
        </>
      )}
      <mesh position={[doubly ? 0.56 : 0.5, 0.62, 0]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshBasicMaterial color={HDR("#ffb15c", 1.6 + 2 * ptr)} toneMapped={false} transparent opacity={a} />
      </mesh>
      {doubly && (
        <mesh position={[-0.56, 0.62, 0]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial color={HDR("#7cc4ff", 1.6 + 2 * prev)} toneMapped={false} transparent opacity={a} />
        </mesh>
      )}
    </group>
  );
};
const out = (p: V3, dz = 0, doubly = false): V3 => [p[0] + (doubly ? 0.56 : 0.5), 0.62, p[2] + dz];
const inn = (p: V3, dz = 0, doubly = false): V3 => [p[0] - (doubly ? 0.3 : 0.82), 0.5, p[2] + dz];
/** a pointer: glowing arc tube from a to b, drawn on by p (0..1), with an arrowhead */
const SEGS = 48, RADS = 6;
const Link: React.FC<{ a: V3; b: V3; p: number; h?: number; col?: string; k?: number; op?: number }> = ({ a, b, p, h = 0.7, col = "#ff8a1f", k = 1.5, op = 1 }) => {
  const key = [...a, ...b].map((v) => v.toFixed(3)).join(",");
  const curve = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const M = A.clone().add(B).multiplyScalar(0.5);
    M.y += h + 0.08 * A.distanceTo(B);
    return new THREE.QuadraticBezierCurve3(A, M, B);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, h]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, SEGS, 0.035, RADS, false), [curve]);
  useEffect(() => () => geo.dispose(), [geo]);
  if (p <= 0 || op <= 0) return null;
  const q = Math.min(1, p);
  geo.setDrawRange(0, Math.max(1, Math.floor(q * SEGS)) * RADS * 6);
  const tip = curve.getPoint(Math.max(0.02, q));
  const tan = curve.getTangent(Math.max(0.02, q)).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
  return (
    <>
      <mesh geometry={geo}>
        <meshBasicMaterial color={HDR(col, k)} toneMapped={false} transparent opacity={op} />
      </mesh>
      <mesh position={tip} quaternion={quat}>
        <coneGeometry args={[0.11, 0.26, 12]} />
        <meshBasicMaterial color={HDR(col, k + 0.6)} toneMapped={false} transparent opacity={op} />
      </mesh>
    </>
  );
};
/** the "null" ground symbol */
const Null: React.FC<{ p: V3; a: number }> = ({ p, a }) =>
  a <= 0 ? null : (
    <group position={p}>
      {[0.5, 0.34, 0.18].map((w, i) => (
        <mesh key={i} position={[0, 0.06 + (2 - i) * 0.12, 0]}>
          <boxGeometry args={[w * a, 0.04, 0.04]} />
          <meshBasicMaterial color={HDR("#f6efe7", 1.4)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
const Orb: React.FC<{ p: V3; s?: number; col?: string }> = ({ p, s = 1, col = "#ffb15c" }) =>
  s <= 0 ? null : (
    <mesh position={p} scale={s}>
      <sphereGeometry args={[0.2, 24, 16]} />
      <meshBasicMaterial color={HDR(col, 3)} toneMapped={false} />
    </mesh>
  );
const Label: React.FC<{ p: V3; cam: V3; look: V3; a: number; text: string; size?: number; mono?: boolean; hot?: boolean; maxD?: number; col?: string }> = ({ p, cam, look, a, text, size = 30, mono, hot, maxD = 99, col }) => {
  if (a <= 0) return null;
  const d = Math.hypot(p[0] - cam[0], p[1] - cam[1], p[2] - cam[2]);
  const fade = 1 - seg(d, maxD * 0.7, maxD);
  if (fade <= 0) return null;
  const s = project(new THREE.Vector3(...sc(p)), sc(cam), sc(look));
  const band = seg(s.y, 590, 640) * (1 - seg(s.y, 1190, 1230)) * seg(s.x, 20, 70) * (1 - seg(s.x, 1010, 1060)); // keep labels inside the 3D band
  if (band <= 0) return null;
  const k = Math.min(1.6, 9 / d);
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
const Item: React.FC<{ p: V3; s?: number; hot?: boolean; red?: boolean; a?: number }> = ({ p, s = 1, hot, red, a = 1 }) =>
  s <= 0 || a <= 0 ? null : (
    <mesh position={p} scale={0.5 * s}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={HDR(red ? "#ff5a3c" : hot ? "#ffb15c" : "#ff8a1f", hot || red ? 2.2 : 1.25)} toneMapped={false} transparent opacity={a} />
    </mesh>
  );

/* ---------- Scene 1 (hook): array insert = everyone shifts... then the row breaks apart into linked nodes ---------- */
export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 0, 0);
  const tS = ev.dheema - 1.6; // shifting starts
  const brk = eio(seg(t, ev.khisakna - 0.4, ev.khisakna + 0.8)); // break into nodes
  const { pos, look } = camPath(t, [[0, [-6.5, 1.4, 5], [-1.5, 0.3, 0]], [tS + 0.4, [-2.5, 2.4, 7.5], [0.5, 0.4, 0]], [ev.dheema + 1.2, [1.5, 4.2, 10.5], [0.8, 0.4, 0]], [ev.khisakna + 1.0, [0, 8.5, 15.5], [0, 0.6, 0]], [SCN[1].start, [1.2, 8, 15], [0, 0.6, 0]]]);
  const gap = lerp(1.1, 2.6, brk);
  const X = (i: number) => (i - 2.5) * gap;
  const shift = (i: number) => (i >= 2 ? eio(seg(t, tS + (5 - i) * 0.45, tS + (5 - i) * 0.45 + 0.4)) : 0); // items 2..4 move right (from the back)
  const xDrop = eo(seg(t, tS + 1.6, tS + 2.1));
  const strain = seg(t, tS, tS + 0.3) * (1 - seg(t, ev.dheema + 0.6, ev.dheema + 1.0));
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {Array.from({ length: 6 }, (_, i) => {
          const isNode = brk > 0.05;
          return isNode ? <Node key={i} p={[X(i), 0, 0]} glow={0.3} ptr={0.4 * brk} a={1} /> : <Slab key={i} p={[X(i), 0, 0]} w={0.96} glow={0.25 + (i >= 2 ? 0.5 * strain : 0)} col={i >= 2 && strain > 0.2 ? "#ff5a3c" : "#ff8a1f"} />;
        })}
        {[0, 1, 2, 3, 4].map((i) => {
          const slot = i + shift(i);
          return <Item key={i} p={[X(slot) - 0.3 * brk, 0.8, 0]} red={i >= 2 && strain > 0.2 && shift(i) > 0 && shift(i) < 1} a={1 - brk} />;
        })}
        <Item p={[X(2) - 0.3 * brk, 0.8 + (1 - xDrop) * 2.4, 0]} hot a={seg(t, tS - 0.4, tS) * (1 - brk)} />
        {Array.from({ length: 5 }, (_, i) => (
          <Link key={i} a={out([X(i), 0, 0])} b={inn([X(i + 1), 0, 0])} p={seg(t, ev.khisakna + 0.2 + i * 0.12, ev.khisakna + 0.7 + i * 0.12)} h={0.5} />
        ))}
      </World>
      <MonoTag x={540} y={640} a={a * fin(t, "dheema", 0.4, -1.2) * (1 - seg(t, ev.khisakna - 0.6, ev.khisakna - 0.2))}>INSERT IN ARRAY → SAB SHIFT</MonoTag>
    </>
  );
};

/* ---------- Scenes 4-8: nodes in a row -> data | pointer -> scattered in memory -> head -> null ---------- */
const LINE: V3[] = [[-4.5, 0, 0], [-1.5, 0, 0], [1.5, 0, 0], [4.5, 0, 0]];
const SCAT: V3[] = [[-4.2, 0, 2.1], [2.1, 0, -2.1], [-2.1, 0, -3.15], [3.15, 0, 1.05]];
const ADDR = ["104", "231", "117", "342"], DATA = ["A", "B", "C", "D"];
export const NodeScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 3, 7);
  const sct = eio(seg(t, ev.memory - 0.3, ev.bikhre + 0.9));
  const P = LINE.map((l, i) => mix3(l, SCAT[i], sct));
  const { pos, look } = camPath(t, [
    [SCN[3].start, [-8.5, 1.4, 4.2], [-3, 0.4, 0]],
    [ev.node + 0.3, [0, 5.5, 11.5], [0, 0.5, 0]],
    [SCN[4].start + 0.6, [-1.6, 3.0, 6.6], [-1.4, 0.4, 0]],
    [ev.pointer + 0.6, [0.2, 3.2, 7.0], [0, 0.5, 0]],
    [ev.bikhre + 1.2, [0.4, 15.5, 18.5], [0.4, 0, -0.6]],
    [SCN[6].start, [0.9, 15, 18], [0.4, 0, -0.6]],
    [ev.head + 0.3, [SCAT[0][0] - 0.5, 2.6, SCAT[0][2] + 5], [SCAT[0][0], 0.5, SCAT[0][2]]],
    [ev.aakhri + 0.6, [SCAT[0][0] + 1, 3.2, SCAT[0][2] + 6], [SCAT[0][0] + 2, 0.5, SCAT[0][2]]],
    [ev.null + 0.2, [SCAT[3][0] + 0.8, 2.4, SCAT[3][2] + 4.8], [SCAT[3][0] + 1.2, 0.5, SCAT[3][2]]],
    [SCN[8].start, [SCAT[3][0] + 0.2, 4, SCAT[3][2] + 7], [SCAT[3][0], 0.5, SCAT[3][2]]],
  ]);
  const grid = fin(t, "memory", 0.8, -0.4);
  const zoomB = seg(t, SCN[4].start, SCN[4].start + 0.5) * (1 - seg(t, ev.memory - 0.4, ev.memory));
  const dataHL = fin(t, "data", 0.4, -0.1) * zoomB, ptrHL = fin(t, "pointer", 0.4, -0.2) * zoomB, addrA = fin(t, "address", 0.4, -0.2);
  const head = fin(t, "head", 0.5, -0.3);
  const nul = fin(t, "null", 0.5, -0.4);
  const NP: V3 = [P[3][0] + 2.2, 0, P[3][2]];
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {/* faint memory cells on the floor */}
        {grid > 0 &&
          Array.from({ length: 13 * 7 }, (_, k) => {
            const c = k % 13, r = Math.floor(k / 13);
            return <Slab key={k} p={[(c - 6) * 1.05, -0.02, (r - 4) * 1.05]} w={0.94} d={0.94} h={0.06} glow={0.05} a={grid * 0.7} col="#7cc4ff" />;
          })}
        {P.map((p, i) => (
          <Node key={i} p={p} a={back(seg(t, SCN[3].start + 0.1 + i * 0.18, SCN[3].start + 0.55 + i * 0.18))} glow={0.3 + (i === 1 ? 0.9 * dataHL : 0) + (i === 0 ? 0.9 * head : 0)} ptr={0.35 + (i === 1 ? 1.3 * ptrHL : 0) + (i === 3 ? 0.8 * nul : 0)} />
        ))}
        {[0, 1, 2].map((i) => (
          <Link key={i} a={out(P[i])} b={inn(P[i + 1])} p={seg(t, SCN[3].start + 0.7 + i * 0.25, SCN[3].start + 1.2 + i * 0.25)} h={0.55} k={i === 1 ? 1.5 + 1.2 * ptrHL : 1.5} />
        ))}
        {/* head pointer */}
        {head > 0 && (
          <mesh position={[P[0][0] - 0.3, 1.9 + 0.1 * Math.sin(t * 5), P[0][2]]} rotation={[Math.PI, 0, 0]} scale={head}>
            <coneGeometry args={[0.24, 0.55, 4]} />
            <meshBasicMaterial color={HDR("#ffb15c", 2.6)} toneMapped={false} />
          </mesh>
        )}
        <Link a={out(P[3])} b={[NP[0] - 0.1, 0.45, NP[2]]} p={nul} h={0.3} col="#f6efe7" k={1.2} />
        <Null p={NP} a={nul} />
      </World>
      {P.map((p, i) => (
        <Label key={`d${i}`} p={[p[0] - 0.3, 0.55, p[2] + 0.5]} cam={pos} look={look} a={a * fin(t, "node", 0.4, -2.6 + i * 0.15)} text={DATA[i]} size={34} hot={i === 1 && dataHL > 0.5} maxD={20} />
      ))}
      {P.map((p, i) => (
        <Label key={`a${i}`} p={[p[0] - 0.3, 0.02, p[2] + 0.8]} cam={pos} look={look} a={a * addrA} text={`@${ADDR[i]}`} mono size={18} maxD={18} />
      ))}
      {[0, 1, 2].map((i) => (
        <Label key={`p${i}`} p={[P[i][0] + 0.5, 0.22, P[i][2] + 0.62]} cam={pos} look={look} a={a * addrA} text={`→${ADDR[i + 1]}`} mono size={15} hot maxD={12} />
      ))}
      <Label p={[LINE[1][0] - 0.3, 1.25, 0]} cam={pos} look={look} a={a * dataHL} text="DATA" mono size={22} />
      <Label p={[LINE[1][0] + 0.5, 1.25, 0]} cam={pos} look={look} a={a * ptrHL} text="POINTER" mono size={22} hot />
      <Label p={[P[0][0] - 0.3, 2.6, P[0][2]]} cam={pos} look={look} a={a * head} text="HEAD" mono size={26} hot />
      <Label p={[NP[0], 1.0, NP[2]]} cam={pos} look={look} a={a * nul} text="NULL" mono size={24} />
      <MonoTag x={540} y={640} a={a * grid * (1 - seg(t, SCN[6].start - 0.3, SCN[6].start))}>MEMORY · KAHIN BHI</MonoTag>
    </>
  );
};

/* ---------- Scenes 9-13: insert X between B and C (rewire 2 pointers), delete C, append E, F ---------- */
const IX = [-4.5, -1.5, 1.5, 4.5, 7.5, 10.5];
export const InsertScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 8, 12);
  const xIn = eo(seg(t, ev.naya - 0.4, ev.naya + 0.3));
  const xLand = eio(seg(t, ev.badlo - 0.6, ev.badlo + 0.2));
  const XP: V3 = [0, lerp(2.6, 0, xLand), 2.4];
  const l1 = seg(t, ev.point - 0.5, ev.point + 0.3); // X -> C
  const l2 = seg(t, ev.naye - 0.6, ev.naye + 0.1); // B -> X (old B -> C goes away)
  const del = eio(seg(t, ev.seedha - 0.5, ev.seedha + 0.5)); // C lifts out
  const relink = seg(t, ev.jod - 0.5, ev.jod + 0.2); // X -> D
  const app = (k: number) => back(seg(t, ev.jodte - 0.6 + k * 0.5, ev.jodte - 0.2 + k * 0.5));
  const P: V3[] = IX.map((x) => [x, 0, 0]);
  const cP: V3 = [P[2][0], del * 2.2, P[2][2] - del * 0.6];
  const { pos, look } = camPath(t, [
    [SCN[8].start, [-2.5, 4.5, 10.5], [0, 0.6, 0.6]],
    [ev.naya + 0.6, [-1, 3.6, 8.6], [0, 0.8, 1]],
    [ev.point + 0.5, [-1.8, 2.6, 6.8], [-0.3, 0.6, 1.2]],
    [ev.naye + 0.5, [0.6, 3.2, 7.6], [0, 0.6, 1.2]],
    [ev.bigo + 0.4, [0.5, 7.5, 13.5], [0.5, 0.4, 0.5]],
    [ev.hatana + 0.5, [1.8, 3.4, 8.6], [1.2, 0.6, 0.8]],
    [ev.jod + 0.6, [2.4, 4.2, 9.4], [1.8, 0.6, 0.6]],
    [ev.jodte + 1.6, [3.0, 7.8, 16.5], [3.0, 0.4, 0.5]],
    [SCN[13].start, [3.4, 7.6, 16.0], [3.0, 0.4, 0.5]],
  ]);
  const nodeA = [1, 1, 1 - seg(t, ev.seedha + 0.2, ev.seedha + 0.7), 1, app(0), app(1)];
  const nullX = t < ev.jodte - 0.6 ? IX[3] + 2.2 : lerp(IX[3] + 2.2, IX[5] + 2.2, eio(seg(t, ev.jodte - 0.6, ev.jodte + 0.9)));
  const noShift = fin(t, "shifting", 0.4, -0.2) * (1 - seg(t, ev.hatana - 0.4, ev.hatana));
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {P.map((p, i) => (i === 2 ? null : <Node key={i} p={p} a={nodeA[i]} glow={0.3 + (i === 1 ? 0.8 * l2 * (1 - seg(t, ev.naye + 0.5, ev.naye + 1)) : 0)} ptr={0.35 + (i === 1 ? 1.2 * l2 * (1 - seg(t, ev.naye + 0.5, ev.naye + 1)) : 0)} />))}
        <Node p={cP} a={nodeA[2]} red={del > 0.05} glow={0.3 + 0.8 * del} />
        <Node p={XP} a={xIn} glow={0.9} ptr={0.4 + 1.2 * (l1 > 0 && l1 < 1 ? 1 : 0) + 1.2 * (relink > 0 && relink < 1 ? 1 : 0)} />
        {/* A -> B */}
        <Link a={out(P[0])} b={inn(P[1])} p={1} h={0.55} />
        {/* B -> C (old), fades as B -> X takes over */}
        <Link a={out(P[1])} b={inn(P[2])} p={1} h={0.55} op={1 - l2} />
        <Link a={out(P[1])} b={inn(XP)} p={l2} h={0.4} col="#ffb15c" k={2} />
        {/* X -> C, later X -> D */}
        <Link a={out(XP)} b={inn(cP)} p={l1} h={0.4} col="#ffb15c" k={2} op={1 - relink} />
        <Link a={out(XP)} b={inn(P[3])} p={relink} h={0.6} col="#ffb15c" k={2} />
        {/* C -> D: goes with C */}
        <Link a={out(cP)} b={inn(P[3])} p={1} h={0.55} op={nodeA[2] * (1 - seg(t, ev.seedha - 0.6, ev.seedha - 0.3))} />
        {/* D -> E -> F */}
        <Link a={out(P[3])} b={inn(P[4])} p={seg(t, ev.jodte - 0.3, ev.jodte + 0.1)} h={0.55} />
        <Link a={out(P[4])} b={inn(P[5])} p={seg(t, ev.jodte + 0.2, ev.jodte + 0.6)} h={0.55} />
        <Null p={[nullX, 0, 0]} a={1} />
      </World>
      {["A", "B", "C", "D", "E", "F"].map((ch, i) => (
        <Label key={ch} p={i === 2 ? [cP[0] - 0.3, cP[1] + 0.55, cP[2] + 0.5] : [P[i][0] - 0.3, 0.55, 0.5]} cam={pos} look={look} a={a * nodeA[i]} text={ch} size={32} maxD={22} />
      ))}
      <Label p={[XP[0] - 0.3, XP[1] + 0.55, XP[2] + 0.5]} cam={pos} look={look} a={a * xIn} text="X" size={34} hot maxD={22} />
      <Label p={[IX[1], 2.3, 0]} cam={pos} look={look} a={a * noShift} text="C · D HILE BHI NAHI" mono size={22} hot />
      <MonoTag x={540} y={640} a={a * fin(t, "point", 0.4, -0.3) * (1 - seg(t, ev.shifting - 0.4, ev.shifting))}>① X → C &nbsp; ② B → X</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "seedha", 0.4, -0.2) * (1 - seg(t, ev.size - 0.4, ev.size))}>DELETE C → X SEEDHA D SE</MonoTag>
    </>
  );
};

/* ---------- Scenes 14-15: to reach the 5th node, hop from head one pointer at a time ---------- */
const TP: V3[] = [[-6, 0, 1.5], [-3, 0, -1.5], [0.2, 0, 1.2], [2.6, 0, -2.2], [5.4, 0, 0.6], [8, 0, -1.8]];
export const TraverseScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 13, 14);
  const h0 = ev.head2 - 0.1, hd = (ev.follow + 1.4 - h0) / 4; // 4 hops: node 0 -> node 4
  const hop = seg(t, h0, h0 + 4 * hd) * 4;
  const hi = Math.min(3, Math.floor(hop)), hf = eio(hop - hi);
  const curves = useMemo(() => TP.slice(0, 5).map((p, i) => (i < 4 ? new THREE.QuadraticBezierCurve3(new THREE.Vector3(...out(p)), new THREE.Vector3((p[0] + TP[i + 1][0]) / 2, 1.3 + 0.08 * Math.hypot(TP[i + 1][0] - p[0], TP[i + 1][2] - p[2]) + 0.55, (p[2] + TP[i + 1][2]) / 2), new THREE.Vector3(...inn(TP[i + 1]))) : null)), []);
  const orbP: V3 = t < h0 ? [TP[0][0] - 0.3, 1.2, TP[0][2]] : (() => { const v = curves[hi]!.getPoint(hf); return [v.x, v.y + 0.25, v.z] as V3; })();
  const reached = seg(t, h0 + 4 * hd - 0.05, h0 + 4 * hd + 0.25);
  const blocked = fin(t, "seedhe", 0.5, -0.1);
  const { pos, look } = camPath(t, [
    [SCN[13].start, [-9, 4.2, 8], [-3, 0.4, 0]],
    [h0, [-8.5, 2.6, 6.5], [-5, 0.6, 1]],
    [h0 + 4 * hd, [3.6, 3.0, 7.2], [5, 0.6, 0.6]],
    [ev.seedhe + 0.6, [3.6, 12.5, 17.5], [3.6, 0.8, -0.4]],
    [SCN[15].start, [4.2, 12, 17], [3.6, 0.8, -0.4]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {TP.map((p, i) => (
          <Node key={i} p={p} a={back(seg(t, SCN[13].start + i * 0.12, SCN[13].start + 0.45 + i * 0.12))} glow={0.3 + (i === 0 ? 0.6 : 0) + (i === 4 ? 1.2 * reached : 0) + (t > h0 && i <= hop + 0.05 ? 0.35 : 0)} ptr={0.35 + (i === hi && t > h0 && hop < 4 ? 1 : 0)} />
        ))}
        {TP.slice(0, 5).map((p, i) => (
          <Link key={i} a={out(p)} b={inn(TP[i + 1])} p={1} h={0.55} k={t > h0 && i < hop ? 2.4 : 1.2} />
        ))}
        {t > h0 - 0.4 && hop < 4.0 + 0.6 && <Orb p={orbP} s={seg(t, h0 - 0.4, h0)} />}
        {/* the direct beam that a linked list does NOT have */}
        {blocked > 0 && (
          <mesh position={[TP[4][0], 3.2, TP[4][2]]}>
            <cylinderGeometry args={[0.06, 0.3, 6, 16, 1, true]} />
            <meshBasicMaterial color={HDR("#ff5a3c", 2.2)} toneMapped={false} transparent opacity={0.45 * blocked * (0.6 + 0.4 * Math.sin(t * 14))} side={THREE.DoubleSide} />
          </mesh>
        )}
      </World>
      {TP.map((p, i) => (
        <Label key={i} p={[p[0] - 0.3, 0.55, p[2] + 0.5]} cam={pos} look={look} a={a} text={String(i + 1)} size={30} hot={i === 4 && reached > 0.5} maxD={22} />
      ))}
      {[1, 2, 3, 4].map((k) => (
        <Label key={`h${k}`} p={[(TP[k - 1][0] + TP[k][0]) / 2, 2.4, (TP[k - 1][2] + TP[k][2]) / 2]} cam={pos} look={look} a={a * seg(hop, k - 0.6, k - 0.3) * (1 - seg(t, ev.seedhe - 0.3, ev.seedhe))} text={`HOP ${k}`} mono size={20} hot />
      ))}
      <Label p={[TP[0][0] - 0.3, 2.0, TP[0][2]]} cam={pos} look={look} a={a * fin(t, "kamzori", 0.4, 0) * (1 - seg(t, ev.seedhe - 0.3, ev.seedhe))} text="HEAD" mono size={24} hot />
      <Label p={[TP[4][0], 3.4, TP[4][2]]} cam={pos} look={look} a={a * blocked} text="SEEDHA ✕" mono size={26} col="#ff5a3c" />
    </>
  );
};

/* ---------- Scene 18: doubly linked list — next (orange) and prev (blue) pointers ---------- */
const DX = [-4.8, -1.6, 1.6, 4.8];
export const DoublyScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 17, 17);
  const P: V3[] = DX.map((x) => [x, 0, 0]);
  const nx = fin(t, "aage", 0.6, -0.3), pv = fin(t, "peeche", 0.6, -0.2);
  const { pos, look } = camPath(t, [[SCN[17].start, [-7, 2.4, 6.5], [-2, 0.5, 0]], [ev.peeche + 0.6, [-1.5, 3.2, 8.5], [0, 0.6, 0]], [ev.doubly + 0.8, [3.5, 6.5, 12.5], [0, 0.5, 0]], [SCN[18].start, [4.5, 6.2, 12], [0, 0.5, 0]]]);
  const fw = (t * 0.6) % 1, bw = 1 - ((t * 0.6 + 0.5) % 1);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {P.map((p, i) => (
          <Node key={i} p={p} doubly a={back(seg(t, SCN[17].start + i * 0.15, SCN[17].start + 0.45 + i * 0.15))} ptr={0.35 + nx * 0.5} prev={0.3 + pv * 0.6} />
        ))}
        {[0, 1, 2].map((i) => (
          <group key={i}>
            <Link a={out(P[i], 0.2, true)} b={inn(P[i + 1], 0.2, true)} p={seg(nx, i * 0.25, i * 0.25 + 0.5)} h={0.75} />
            <Link a={[P[i + 1][0] - 0.56, 0.62, -0.25]} b={[P[i][0] + 0.3, 0.5, -0.25]} p={seg(pv, i * 0.25, i * 0.25 + 0.5)} h={0.35} col="#7cc4ff" />
          </group>
        ))}
        {nx > 0.9 && <Orb p={[lerp(DX[0], DX[3], fw), 1.5 + 0.3 * Math.sin(fw * Math.PI * 6), 0.2]} s={0.6} />}
        {pv > 0.9 && <Orb p={[lerp(DX[3], DX[0], 1 - bw), 1.0 + 0.2 * Math.sin(bw * Math.PI * 6), -0.25]} s={0.6} col="#7cc4ff" />}
      </World>
      {P.map((p, i) => (
        <Label key={i} p={[p[0], 0.55, 0.5]} cam={pos} look={look} a={a} text={["A", "B", "C", "D"][i]} size={30} maxD={22} />
      ))}
      <Label p={[0, 2.3, 0.2]} cam={pos} look={look} a={a * nx} text="NEXT →" mono size={24} hot />
      <Label p={[0, 1.25, -0.3]} cam={pos} look={look} a={a * pv} text="← PREV" mono size={24} col="#7cc4ff" />
    </>
  );
};
