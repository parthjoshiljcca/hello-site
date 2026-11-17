import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CamRig, HDR, Layer, MonoTag, SCN, eio, eo, ev, fin, lerp, project, seg } from "./common";

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


/* ---------- Ep 4 pieces ---------- */
const BH = 0.55; // stacked block pitch
/** a stack item: glowing slab with a value label drawn separately */
const Block: React.FC<{ p: V3; a?: number; glow?: number; red?: boolean; cool?: boolean }> = ({ p, a = 1, glow = 0.35, red, cool }) => (
  <Slab p={p} w={1.6} d={1.0} h={0.46} glow={glow} a={a} col={red ? "#ff5a3c" : cool ? "#7cc4ff" : "#ff8a1f"} />
);
/** open-top glass column: 4 posts + floor plate; the top rim (the only door) can glow */
const Column: React.FC<{ cap: number; a?: number; red?: number; door?: number }> = ({ cap, a = 1, red = 0, door = 0 }) => {
  if (a <= 0) return null;
  const H = cap * BH + 0.25, col = red > 0.5 ? "#ff5a3c" : "#f6efe7";
  const posts: V3[] = [[-0.95, 0, -0.62], [0.95, 0, -0.62], [-0.95, 0, 0.62], [0.95, 0, 0.62]];
  return (
    <group>
      {posts.map((q, i) => (
        <mesh key={i} position={[q[0], H / 2, q[2]]}>
          <boxGeometry args={[0.05, H, 0.05]} />
          <meshBasicMaterial color={HDR(col, 1.1 + 1.5 * red)} toneMapped={false} transparent opacity={a} />
        </mesh>
      ))}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.95, 1.3]} />
        <meshBasicMaterial color={HDR(red > 0.5 ? "#ff5a3c" : "#ff8a1f", 0.25 + 0.8 * red)} toneMapped={false} transparent opacity={a * 0.8} />
      </mesh>
      {[[0, -0.62], [0, 0.62]].map(([x, z], i) => (
        <mesh key={`r${i}`} position={[x, H, z]}>
          <boxGeometry args={[1.95, 0.05, 0.05]} />
          <meshBasicMaterial color={HDR(door > 0 ? "#ffb15c" : col, 1.1 + 2.2 * door + 1.5 * red)} toneMapped={false} transparent opacity={a} />
        </mesh>
      ))}
      {[[-0.95, 0], [0.95, 0]].map(([x, z], i) => (
        <mesh key={`s${i}`} position={[x, H, z]}>
          <boxGeometry args={[0.05, 0.05, 1.3]} />
          <meshBasicMaterial color={HDR(door > 0 ? "#ffb15c" : col, 1.1 + 2.2 * door + 1.5 * red)} toneMapped={false} transparent opacity={a} />
        </mesh>
      ))}
      {door > 0 && (
        <mesh position={[0, H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.9, 1.24]} />
          <meshBasicMaterial color={HDR("#ffb15c", 1.2)} toneMapped={false} transparent opacity={0.22 * door} />
        </mesh>
      )}
    </group>
  );
};
/** a shaadi plate: ceramic disc + glowing rim */
const Plate: React.FC<{ p: V3; a?: number; hot?: boolean; tilt?: number }> = ({ p, a = 1, hot, tilt = 0 }) =>
  a <= 0 ? null : (
    <group position={p} rotation={[0, 0, tilt]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.1, 0.95, 0.12, 48]} />
        <meshStandardMaterial color={hot ? "#bfe3ff" : "#e9e1d6"} roughness={0.3} metalness={0.1} transparent opacity={a} />
      </mesh>
      <mesh position={[0, 0.125, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.08, 0.035, 8, 64]} />
        <meshBasicMaterial color={HDR(hot ? "#7cc4ff" : "#ff8a1f", hot ? 2.6 : 1.5)} toneMapped={false} transparent opacity={a} />
      </mesh>
    </group>
  );
const Cone: React.FC<{ p: V3; up?: boolean; s?: number; col?: string }> = ({ p, up, s = 1, col = "#ffb15c" }) =>
  s <= 0 ? null : (
    <mesh position={p} rotation={[up ? 0 : Math.PI, 0, 0]} scale={s}>
      <coneGeometry args={[0.22, 0.5, 4]} />
      <meshBasicMaterial color={HDR(col, 2.6)} toneMapped={false} />
    </mesh>
  );

/* ---------- Scene 1 (hook): last episode's linked nodes fly up into a stack tower ---------- */
export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 0, 0);
  const tw = (i: number) => eio(seg(t, ev.undo - 2.2 + i * 0.35, ev.undo - 1.4 + i * 0.35));
  const { pos, look } = camPath(t, [[0, [-6.5, 1.6, 5.5], [-2, 0.4, 0]], [ev.linked + 2.2, [0, 4.5, 11], [0, 0.6, 0]], [ev.undo - 0.6, [1.5, 3.8, 9], [0, 1.2, 0]], [SCN[1].start, [2.4, 3.0, 8], [0, 1.2, 0]]]);
  const X = [-4.5, -1.5, 1.5, 4.5], L = ["A", "B", "C", "D"];
  const P = X.map((x, i): V3 => { const u = tw(i); return [lerp(x, 0, u), i * BH * u + Math.sin(u * Math.PI) * 1.6, 0]; });
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {P.map((p, i) => (tw(i) < 0.5 ? <Node key={i} p={p} glow={0.3} ptr={0.4} a={1} /> : <Block key={i} p={p} glow={i === 3 ? 0.9 : 0.35} />))}
        {[0, 1, 2].map((i) => (
          <Link key={i} a={out(P[i])} b={inn(P[i + 1])} p={seg(t, 0.3 + i * 0.25, 0.8 + i * 0.25)} h={0.55} op={1 - seg(tw(i), 0, 0.25)} />
        ))}
        <Column cap={4} a={seg(t, ev.undo - 2.6, ev.undo - 2.0)} door={seg(t, ev.undo, ev.undo + 0.4)} />
      </World>
      {P.map((p, i) => (
        <Label key={i} p={[p[0] - 0.3 * (1 - tw(i)), p[1] + 0.25, p[2] + 0.6]} cam={pos} look={look} a={a} text={L[i]} size={30} maxD={22} />
      ))}
      <Label p={[0, 4 * BH + 0.9, 0]} cam={pos} look={look} a={a * fin(t, "undo", 0.4, 0)} text="STACK?" size={30} hot />
    </>
  );
};

/* ---------- Scenes 3-6: shaadi plates — placed on top, taken from top, last in first out ---------- */
export const PlatesScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 2, 5);
  const PH = 0.17, N = 6;
  const drop = (i: number) => { const t0 = i < 5 ? SCN[2].start + 0.2 + i * 0.32 : ev.nayi - 0.2; return eo(seg(t, t0, t0 + 0.45)); };
  const lift6 = eio(seg(t, ev.upar2 - 0.4, ev.upar2 + 0.6)), lift5 = eio(seg(t, ev.pehle - 0.2, ev.pehle + 0.7));
  const { pos, look } = camPath(t, [
    [SCN[2].start, [-4.5, 2.4, 8.2], [0, 0.7, 0]],
    [ev.nayi + 0.6, [-2.4, 3.0, 8.6], [0.3, 0.9, 0]],
    [ev.upar2 + 0.8, [2.4, 3.6, 9.2], [1.0, 1.3, 0]],
    [ev.pehle + 0.8, [2.8, 4.0, 9.8], [1.1, 1.2, 0.3]],
    [ev.first + 0.6, [0.6, 6.0, 12.0], [0.8, 1.2, 0.2]],
    [SCN[6].start, [-0.6, 5.8, 11.6], [0.8, 1.2, 0.2]],
  ]);
  const yOf = (i: number) => i * PH;
  const plates = Array.from({ length: N }, (_, i) => {
    const d = drop(i);
    let p: V3 = [0, yOf(i) + (1 - d) * 3.2, 0];
    if (i === 5) p = [lerp(0, 2.6, lift6), yOf(5) + Math.sin(lift6 * Math.PI) * 1.4 + lift6 * 0.4, 0];
    if (i === 4) p = [lerp(0, 2.6, lift5), yOf(4) + Math.sin(lift5 * Math.PI) * 1.4 + lift5 * 0.4 - lift5 * PH * 0.0 + (lift5 > 0 ? 0 : 0), lift5 * 1.4];
    return { p, a: seg(d, 0, 0.15), hot: i === 5 };
  });
  const io = fin(t, "last", 0.5, -0.2), fo = fin(t, "first", 0.5, -0.2);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {plates.map((q, i) => <Plate key={i} p={q.p} a={q.a} hot={q.hot} />)}
        <Cone p={[-1.7, 1.9 - 0.2 * Math.sin(t * 5), 0]} s={io} />
        <Cone p={[1.7, 1.5 + 0.2 * Math.sin(t * 5), 0]} up s={fo} col="#7cc4ff" />
      </World>
      {plates.map((q, i) => (
        <Label key={i} p={[q.p[0] + 1.35, q.p[1] + 0.05, q.p[2]]} cam={pos} look={look} a={a * q.a * fin(t, "aakhir", 0.4, -0.4)} text={`#${i + 1}`} mono size={18} hot={i >= 4} maxD={14} />
      ))}
      <Label p={[plates[5].p[0], plates[5].p[1] + 0.7, 0]} cam={pos} look={look} a={a * fin(t, "nayi", 0.4, 0) * (1 - seg(t, ev.aakhir - 0.3, ev.aakhir))} text="NAYI PLATE" mono size={22} hot />
      <Label p={[-1.7, 2.6, 0]} cam={pos} look={look} a={a * io} text="LAST IN" mono size={22} hot />
      <Label p={[1.7, 2.3, 0]} cam={pos} look={look} a={a * fo} text="FIRST OUT" mono size={22} col="#7cc4ff" />
      <MonoTag x={540} y={640} a={a * fin(t, "aakhir", 0.4, -0.2) * (1 - seg(t, ev.lifo - 0.4, ev.lifo))}>#6 AAKHIR MEIN → #6 SABSE PEHLE BAHAR</MonoTag>
    </>
  );
};

/* ---------- Scenes 7-11: the neon stack — top, push, pop, peek, O(1) ---------- */
export const OpsScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 6, 10);
  const pushU = eo(seg(t, ev.push - 0.5, ev.push + 0.1));
  const popU = eio(seg(t, ev.pop - 0.4, ev.pop + 0.5));
  const peek = seg(t, ev.peek - 0.6, ev.peek - 0.2) * (1 - seg(t, ev.teenon - 0.2, ev.teenon + 0.2));
  const door = fin(t, "darwaaza", 0.5, -0.2) * (1 - seg(t, ev.push + 0.6, ev.push + 1.0)) + 0.6 * peek;
  const vals = ["10", "20", "30"];
  const topY = 3 * BH;
  const nP: V3 = popU > 0 ? [lerp(0, 2.6, popU), topY + Math.sin(popU * Math.PI) * 1.8 + popU * 0.6, 0] : [0, lerp(topY + 3.2, topY, pushU), 0];
  const nA = seg(t, ev.push - 0.7, ev.push - 0.4) * (1 - seg(t, ev.pop + 0.3, ev.pop + 0.7));
  const topIdx = popU >= 0.5 || pushU < 1 ? 2 : 3;
  const { pos, look } = camPath(t, [
    [SCN[6].start, [-3.8, 3.0, 9.5], [0, 1.4, 0]],
    [ev.top + 0.4, [-1.6, 4.0, 8.6], [0, 1.6, 0]],
    [ev.push + 0.5, [1.6, 3.8, 9.0], [0.3, 1.6, 0]],
    [ev.pop + 0.6, [2.4, 4.0, 9.6], [0.9, 1.7, 0]],
    [ev.peek - 0.1, [0.4, 3.6, 7.2], [0, 1.8, 0]],
    [ev.bigo + 0.3, [-1.2, 5.0, 12.0], [0, 1.5, 0]],
    [SCN[11].start, [-1.8, 4.8, 11.5], [0, 1.5, 0]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        <Column cap={5} door={door} />
        {vals.map((v, i) => <Block key={v} p={[0, i * BH, 0]} glow={i === topIdx ? 0.9 + 1.2 * peek : 0.3} />)}
        {nA > 0 && <Block p={nP} a={nA} glow={1.1} />}
        {peek > 0 && (
          <mesh position={[0, topY + 1.6, 0]}>
            <cylinderGeometry args={[0.05, 0.75, 2.4, 24, 1, true]} />
            <meshBasicMaterial color={HDR("#7cc4ff", 2)} toneMapped={false} transparent opacity={0.35 * peek} side={THREE.DoubleSide} />
          </mesh>
        )}
      </World>
      {vals.map((v, i) => (
        <Label key={v} p={[0, i * BH + 0.25, 0.75]} cam={pos} look={look} a={a} text={v} size={30} hot={i === topIdx} maxD={16} />
      ))}
      {nA > 0 && <Label p={[nP[0], nP[1] + 0.25, 0.75]} cam={pos} look={look} a={a * nA} text="40" size={32} hot maxD={16} />}
      <Label p={[1.4, (topIdx === 3 ? topY : topY - BH) + 0.25, 0]} cam={pos} look={look} a={a * fin(t, "top", 0.4, -0.2)} text="← TOP" mono size={24} hot />
      <Label p={[0, 5 * BH + 0.75, 0]} cam={pos} look={look} a={a * fin(t, "darwaaza", 0.4, 0) * (1 - seg(t, ev.push - 0.8, ev.push - 0.5))} text="EK HI DARWAAZA" mono size={22} hot />
      <Label p={[0, topY + 1.1, 0]} cam={pos} look={look} a={a * peek} text="PEEK → 30" mono size={24} col="#7cc4ff" />
      <MonoTag x={540} y={640} a={a * fin(t, "push", 0.4, -0.3) * (1 - seg(t, ev.pop - 0.6, ev.pop - 0.3))}>PUSH(40)</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "pop", 0.4, -0.3) * (1 - seg(t, ev.bina - 0.3, ev.bina))}>POP() → 40</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "bigo", 0.4, -0.3)}>PUSH · POP · PEEK → 1 STEP</MonoTag>
    </>
  );
};

/* ---------- Scenes 13-14: overflow (push into a full stack) and underflow (pop from an empty one) ---------- */
export const OverflowScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 12, 13);
  const CAP = 5;
  const tP = ev.push2 + 0.1;
  const fall = seg(t, tP - 0.5, tP + 1.4);
  // the extra item drops, hits the full rim and tumbles off to the side
  const xP: V3 = fall < 0.3 ? [0, lerp(CAP * BH + 3, CAP * BH + 0.05, eo(fall / 0.3)), 0] : [lerp(0, 2.8, eio((fall - 0.3) / 0.7)), CAP * BH + 0.05 + Math.sin(((fall - 0.3) / 0.7) * Math.PI) * 0.9 - eio((fall - 0.3) / 0.7) * (CAP * BH + 0.05), 0];
  const red = seg(t, tP - 0.15, tP + 0.1) * (1 - seg(t, ev.khaali - 0.6, ev.khaali - 0.2));
  const empty = (i: number) => seg(t, ev.khaali - 0.7 + (CAP - 1 - i) * 0.08, ev.khaali - 0.4 + (CAP - 1 - i) * 0.08);
  const under = seg(t, ev.pop2 - 0.1, ev.pop2 + 0.3) * (1 - seg(t, SCN[14].start - 0.6, SCN[14].start));
  const { pos, look } = camPath(t, [
    [SCN[12].start, [-3.0, 3.0, 10.5], [0, 1.5, 0]],
    [tP - 0.2, [-1.2, 4.2, 10.0], [0.3, 2.0, 0]],
    [tP + 1.2, [2.0, 3.8, 11.0], [0.9, 1.5, 0]],
    [ev.pop2, [0.2, 2.8, 8.5], [0, 0.9, 0]],
    [SCN[14].start, [-0.6, 3.0, 9.0], [0, 0.9, 0]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        <Column cap={CAP} red={Math.max(red, under)} />
        {Array.from({ length: CAP }, (_, i) => <Block key={i} p={[0, i * BH, 0]} glow={0.35 + 0.6 * red} red={red > 0.5} a={1 - empty(i)} />)}
        {fall > 0 && fall < 1 && <Block p={xP} glow={1.2} red={fall > 0.3} a={1 - seg(fall, 0.85, 1)} />}
        {under > 0 && (
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[1.7, 1.2, 1.1]} />
            <meshBasicMaterial color={HDR("#ff5a3c", 1.6)} toneMapped={false} transparent opacity={0.18 * under * (0.6 + 0.4 * Math.sin(t * 18))} />
          </mesh>
        )}
      </World>
      <Label p={[0, CAP * BH + 1.2, 0]} cam={pos} look={look} a={a * red} text="OVERFLOW!" size={34} col="#ff5a3c" />
      <Label p={[0, 1.7, 0]} cam={pos} look={look} a={a * under} text="EMPTY → POP?" mono size={26} col="#ff5a3c" />
      <MonoTag x={540} y={640} a={a * fin(t, "bhar", 0.4, -0.2) * (1 - seg(t, ev.khaali - 0.5, ev.khaali - 0.2))}>SIZE 5 · FULL → PUSH(60)</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "khaali", 0.4, 0)}>SIZE 0 · EMPTY → POP()</MonoTag>
    </>
  );
};
