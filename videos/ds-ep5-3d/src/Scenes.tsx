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

const Cone: React.FC<{ p: V3; up?: boolean; s?: number; col?: string }> = ({ p, up, s = 1, col = "#ffb15c" }) =>
  s <= 0 ? null : (
    <mesh position={p} rotation={[up ? 0 : Math.PI, 0, 0]} scale={s}>
      <coneGeometry args={[0.22, 0.5, 4]} />
      <meshBasicMaterial color={HDR(col, 2.6)} toneMapped={false} />
    </mesh>
  );

/* ---------- Ep 5 pieces ---------- */
/** a person in the chai line: dark capsule body + head, glowing rim when hot; optional chai cup in hand */
const Person: React.FC<{ p: V3; a?: number; hot?: number; cup?: number; walk?: number }> = ({ p, a = 1, hot = 0, cup = 0, walk = 0 }) => {
  if (a <= 0) return null;
  const bob = 0.06 * Math.abs(Math.sin(walk * 9));
  return (
    <group position={[p[0], p[1] + bob, p[2]]}>
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.28, 0.6, 8, 16]} />
        <meshStandardMaterial color="#2a1d14" emissive={new THREE.Color("#ff8a1f")} emissiveIntensity={0.08 + 0.5 * hot} roughness={0.5} transparent opacity={a} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.22, 20, 16]} />
        <meshStandardMaterial color="#2a1d14" emissive={new THREE.Color("#ff8a1f")} emissiveIntensity={0.08 + 0.5 * hot} roughness={0.5} transparent opacity={a} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.42, 32]} />
        <meshBasicMaterial color={HDR(hot > 0.3 ? "#ffb15c" : "#ff8a1f", 0.8 + 2 * hot)} toneMapped={false} transparent opacity={a} />
      </mesh>
      {cup > 0 && (
        <mesh position={[-0.36, 0.85, 0.15]} scale={cup}>
          <cylinderGeometry args={[0.1, 0.08, 0.2, 16]} />
          <meshBasicMaterial color={HDR("#ffb15c", 2.2)} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};
/** a slot on the queue track (flat plate) */
const SlotPad: React.FC<{ p: V3; glow?: number; a?: number; col?: string }> = ({ p, glow = 0.15, a = 1, col }) => <Slab p={p} w={1.3} d={1.2} h={0.08} glow={glow} a={a} col={col} />;
const Item: React.FC<{ p: V3; a?: number; glow?: number; cool?: boolean }> = ({ p, a = 1, glow = 0.35, cool }) => <Slab p={p} w={1.0} d={0.9} h={0.55} glow={glow} a={a} col={cool ? "#7cc4ff" : "#ff8a1f"} />;

/* ---------- Scene 1 (hook): the stack tower tips over into a queue line ---------- */
export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 0, 0);
  const tip = (i: number) => eio(seg(t, ev.asal - 0.6 + i * 0.3, ev.asal + 0.3 + i * 0.3));
  const io = fin(t, "pehle", 0.5, -0.2);
  const { pos, look } = camPath(t, [[0, [-3, 2.4, 7.5], [0, 1.2, 0]], [ev.asal - 0.4, [-1.5, 3.2, 8.5], [0, 1.0, 0]], [ev.pehle + 0.6, [0.5, 5.2, 11.5], [0, 0.4, 0]], [SCN[1].start, [1.2, 5.0, 11], [0, 0.4, 0]]]);
  const L = ["A", "B", "C", "D"];
  const P = L.map((_, i): V3 => { const u = tip(i); return [lerp(0, -2.7 + i * 1.8, u), lerp(i * BH, 0, u) + Math.sin(u * Math.PI) * 0.8, 0]; });
  return (
    <>
      <World a={a} cam={pos} look={look}>
        <Column cap={4} a={1 - seg(t, ev.asal - 0.8, ev.asal - 0.3)} />
        {P.map((p, i) => <Block key={i} p={p} glow={0.35 + (i === 0 ? 0.8 * io : 0)} />)}
        <Cone p={[-4.3, 0.5, 0]} s={io} />
        <Cone p={[4.3, 0.5, 0]} s={io} col="#7cc4ff" />
      </World>
      {P.map((p, i) => (
        <Label key={i} p={[p[0], p[1] + 0.25, 0.6]} cam={pos} look={look} a={a} text={L[i]} size={30} maxD={20} />
      ))}
      <Label p={[-4.3, 1.4, 0]} cam={pos} look={look} a={a * io} text="← OUT" mono size={22} hot />
      <Label p={[4.3, 1.4, 0]} cam={pos} look={look} a={a * io} text="IN ←" mono size={22} col="#7cc4ff" />
    </>
  );
};

/* ---------- Scenes 3-5: the chai line — new person joins at the back, the front gets chai first ---------- */
export const ChaiScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 2, 4);
  const G = 1.25, X0 = -2.6; // place 0 (front) is next to the stall
  const join = eio(seg(t, ev.naya - 0.2, ev.peeche + 0.2)); // #5 walks in to the back
  const serve1 = seg(t, ev.aage - 0.3, ev.milti + 0.3), leave1 = eio(seg(t, ev.milti + 0.2, ev.milti + 1.4));
  const step1 = eio(seg(t, ev.milti + 0.6, ev.milti + 1.4));
  const serve2 = seg(t, ev.mili - 1.2, ev.mili - 0.6), leave2 = eio(seg(t, ev.mili - 0.6, ev.mili + 0.6));
  const step2 = eio(seg(t, ev.mili - 0.2, ev.mili + 0.6));
  const io = fin(t, "first", 0.5, -0.3), oo = fin(t, "out", 0.5, -0.3);
  const { pos, look } = camPath(t, [
    [SCN[2].start, [-3.0, 4.0, 14.5], [-1.0, 0.9, 0]],
    [ev.peeche + 0.6, [0.6, 4.2, 14.5], [-0.4, 0.8, 0]],
    [ev.milti + 0.4, [-3.6, 3.2, 10.5], [-3.0, 0.9, 0]],
    [ev.mili + 0.6, [-1.8, 4.6, 15.0], [-1.4, 0.8, 0]],
    [SCN[5].start, [-1.2, 6.0, 16.5], [-1.2, 0.6, 0]],
  ]);
  const people = Array.from({ length: 5 }, (_, i) => {
    // place along the line after the two serves
    let place = i - step1 - step2;
    let x = X0 + place * G, z = 0, al = 1, hot = 0, cup = 0, walk = 0;
    if (i === 4) { x = lerp(5.5, X0 + 4 * G, join) - (step1 + step2) * G; al = seg(t, ev.naya - 0.3, ev.naya); walk = t * join * (1 - join) * 4; }
    if (i === 0) { hot = serve1 > 0 && leave1 < 1 ? 1 : 0; cup = eo(serve1); x = lerp(X0, X0 - 1.5, leave1); z = lerp(0, 2.4, leave1); al = 1 - seg(leave1, 0.7, 1); place = 0; walk = leave1 * 3; }
    if (i === 1) { hot = serve2 > 0 && leave2 < 1 ? 1 : 0; cup = eo(serve2); if (leave2 > 0) { x = lerp(X0, X0 - 1.5, leave2); z = lerp(0, 2.4, leave2); al = 1 - seg(leave2, 0.7, 1); } }
    return { p: [x, 0, z] as V3, al, hot, cup, walk };
  });
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {/* chai stall: counter + glowing kettle */}
        <Slab p={[-4.6, 0, 0]} w={1.6} d={1.6} h={1.0} glow={0.5} />
        <mesh position={[-4.6, 1.25, 0]}>
          <cylinderGeometry args={[0.3, 0.38, 0.45, 20]} />
          <meshBasicMaterial color={HDR("#ffb15c", 1.8)} toneMapped={false} />
        </mesh>
        {people.map((q, i) => <Person key={i} p={q.p} a={q.al} hot={q.hot} cup={q.cup} walk={q.walk} />)}
        <Cone p={[X0 + 3 * G + 1.3, 1.9, 0]} s={io} col="#7cc4ff" />
        <Cone p={[X0, 2.3, 0]} up s={oo} />
      </World>
      <Label p={[-4.6, 2.0, 0]} cam={pos} look={look} a={a} text="CHAI" size={30} hot maxD={22} />
      {people.map((q, i) => (
        <Label key={i} p={[q.p[0], 1.95, q.p[2]]} cam={pos} look={look} a={a * q.al * fin(t, "jo", 0.4, -0.3)} text={`#${i + 1}`} mono size={24} hot={q.hot > 0} maxD={22} />
      ))}
      <Label p={[people[4].p[0], 2.0, 0]} cam={pos} look={look} a={a * fin(t, "naya", 0.4, 0) * (1 - seg(t, ev.aage - 0.4, ev.aage))} text="NAYA → PEECHHE" mono size={20} col="#7cc4ff" />
      <Label p={[X0 + 3 * G + 1.3, 2.7, 0]} cam={pos} look={look} a={a * io} text="FIRST IN" mono size={22} col="#7cc4ff" />
      <Label p={[X0, 3.0, 0]} cam={pos} look={look} a={a * oo} text="FIRST OUT" mono size={22} hot />
    </>
  );
};

/* ---------- Scenes 6-10: the track — front & rear, enqueue at rear, dequeue at front, peek, O(1) ---------- */
const TX = (i: number) => (i - 2.5) * 1.45;
export const OpsScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 5, 9);
  const enq = eo(seg(t, ev.enq - 0.6, ev.enq + 0.1));
  const deq = eio(seg(t, ev.deq - 0.5, ev.deq + 0.4));
  const frontI = lerp(0, 1, eio(seg(t, ev.deq + 0.2, ev.deq + 0.6)));
  const rearI = lerp(3, 4, eio(seg(t, ev.enq - 0.1, ev.enq + 0.3)));
  const peek = seg(t, ev.peek - 0.6, ev.peek - 0.2) * (1 - seg(t, ev.sahi, ev.sahi + 0.4));
  const marks = fin(t, "front", 0.5, -0.3);
  const vals = ["10", "20", "30", "40"];
  const { pos, look } = camPath(t, [
    [SCN[5].start, [-5.5, 3.0, 8.0], [-0.5, 0.4, 0]],
    [ev.rear + 0.4, [0, 5.0, 11.0], [0, 0.4, 0]],
    [ev.enq + 0.4, [3.4, 3.4, 8.2], [2.4, 0.4, 0]],
    [ev.deq + 0.5, [-3.6, 3.4, 8.2], [-2.6, 0.4, 0]],
    [ev.peek, [-2.0, 2.8, 6.6], [TX(1), 0.5, 0]],
    [ev.bigo + 0.4, [0, 6.0, 12.5], [0, 0.4, 0]],
    [SCN[10].start, [0.8, 5.8, 12.0], [0, 0.4, 0]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {Array.from({ length: 6 }, (_, i) => <SlotPad key={i} p={[TX(i), 0, 0]} glow={0.15} />)}
        {vals.map((v, i) => {
          if (i === 0) return <Item key={v} p={[lerp(TX(0), TX(0) - 4, deq), 0.08 + Math.sin(deq * Math.PI) * 0.8, 0]} a={1 - seg(deq, 0.7, 1)} glow={0.9 * marks} />;
          return <Item key={v} p={[TX(i), 0.08, 0]} glow={i === 1 ? 0.35 + 1.0 * frontI + 1.2 * peek : i === 3 ? 0.35 + 0.6 * marks * (1 - enq) : 0.35} />;
        })}
        {enq > 0 && <Item p={[lerp(TX(4) + 4, TX(4), enq), 0.08, 0]} cool glow={1.0} a={seg(t, ev.enq - 0.8, ev.enq - 0.5)} />}
        <Cone p={[lerp(TX(0), TX(1), frontI), 1.6 + 0.08 * Math.sin(t * 5), 0]} s={marks} />
        <Cone p={[lerp(TX(3), TX(4), seg(rearI, 3, 4)), 1.6 + 0.08 * Math.sin(t * 5 + 1), 0]} s={marks} col="#7cc4ff" />
        {peek > 0 && (
          <mesh position={[TX(1), 2.0, 0]}>
            <cylinderGeometry args={[0.05, 0.6, 3.0, 24, 1, true]} />
            <meshBasicMaterial color={HDR("#ffb15c", 2)} toneMapped={false} transparent opacity={0.3 * peek} side={THREE.DoubleSide} />
          </mesh>
        )}
      </World>
      {vals.map((v, i) => (
        <Label key={v} p={[i === 0 ? lerp(TX(0), TX(0) - 4, deq) : TX(i), 0.4 + (i === 0 ? Math.sin(deq * Math.PI) * 0.8 : 0), 0.6]} cam={pos} look={look} a={a * (i === 0 ? 1 - seg(deq, 0.7, 1) : 1)} text={v} size={28} maxD={18} />
      ))}
      {enq > 0 && <Label p={[lerp(TX(4) + 4, TX(4), enq), 0.4, 0.6]} cam={pos} look={look} a={a} text="50" size={28} col="#7cc4ff" maxD={18} />}
      {Array.from({ length: 6 }, (_, i) => (
        <Label key={`i${i}`} p={[TX(i), 0.02, 0.85]} cam={pos} look={look} a={a * 0.8} text={`[${i}]`} mono size={16} maxD={14} />
      ))}
      <Label p={[lerp(TX(0), TX(1), frontI), 2.3, 0]} cam={pos} look={look} a={a * marks} text="FRONT" mono size={22} hot />
      <Label p={[lerp(TX(3), TX(4), seg(rearI, 3, 4)), 2.3, 0]} cam={pos} look={look} a={a * marks} text="REAR" mono size={22} col="#7cc4ff" />
      <MonoTag x={540} y={640} a={a * fin(t, "enq", 0.4, -0.3) * (1 - seg(t, ev.deq - 0.6, ev.deq - 0.3))}>ENQUEUE(50) → REAR</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "deq", 0.4, -0.3) * (1 - seg(t, ev.peek - 0.6, ev.peek - 0.3))}>DEQUEUE() → 10 · FRONT AAGE</MonoTag>
      <MonoTag x={540} y={640} a={a * peek}>PEEK() → 20</MonoTag>
      <MonoTag x={540} y={640} a={a * fin(t, "bigo", 0.4, -0.3)}>KOI SHIFT NAHI → 1 STEP</MonoTag>
    </>
  );
};

/* ---------- Scenes 12-13: circular queue — slots stay, front & rear move on and wrap around ---------- */
const RN = 8, RR = 3.1;
const RP = (i: number): V3 => { const an = -Math.PI / 2 + (i / RN) * Math.PI * 2; return [Math.cos(an) * RR, 0, Math.sin(an) * RR]; };
export const CircularScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 11, 12);
  // initial: items in slots 3..7, front=3, rear=7
  const dq = eio(seg(t, ev.front2 - 0.3, ev.front2 + 0.4));
  const frontF = 3 + eio(seg(t, ev.front2 + 0.2, ev.front2 + 0.6));
  const wrap1 = eo(seg(t, ev.aakhri2 + 0.2, ev.aakhri2 + 0.9)), wrap2 = eo(seg(t, ev.ghoom - 0.2, ev.ghoom + 0.4));
  const rearF = 7 + eio(seg(t, ev.aakhri2 + 0.6, ev.aakhri2 + 1.0)) + eio(seg(t, ev.ghoom, ev.ghoom + 0.4));
  const ring = (f: number): V3 => { const an = -Math.PI / 2 + (f / RN) * Math.PI * 2; return [Math.cos(an) * RR, 0, Math.sin(an) * RR]; };
  const { pos, look } = camPath(t, [
    [SCN[11].start, [0, 17, 14.5], [0, 0, 0.3]],
    [ev.badhte + 0.4, [-5.5, 15, 14.5], [0, 0, 0.3]],
    [ev.ghoom + 0.4, [-2.0, 19, 11.0], [0, 0, 0.5]],
    [SCN[13].start, [0.8, 19, 10.5], [0, 0, 0.5]],
  ]);
  const vals: Record<number, string> = { 3: "A", 4: "B", 5: "C", 6: "D", 7: "E" };
  const fp = ring(frontF), rp = ring(rearF % RN);
  return (
    <>
      <World a={a} cam={pos} look={look} bloom={1.3}>
        {Array.from({ length: RN }, (_, i) => <SlotPad key={i} p={RP(i)} glow={(i === 0 && wrap1 > 0) || (i === 1 && wrap2 > 0) ? 0.8 : 0.15} />)}
        {Object.keys(vals).map((k) => {
          const i = +k;
          if (i === 3) { const p = RP(3); return <Item key={k} p={[p[0] * (1 + dq * 0.8), 0.08 + Math.sin(dq * Math.PI) * 1.0, p[2] * (1 + dq * 0.8)]} a={1 - seg(dq, 0.7, 1)} glow={0.8} />; }
          return <Item key={k} p={[RP(i)[0], 0.08, RP(i)[2]]} glow={0.35} />;
        })}
        {wrap1 > 0 && <Item p={[RP(0)[0], 0.08 + (1 - wrap1) * 2.4, RP(0)[2]]} cool glow={1} />}
        {wrap2 > 0 && <Item p={[RP(1)[0], 0.08 + (1 - wrap2) * 2.4, RP(1)[2]]} cool glow={1} />}
        <Cone p={[fp[0] * 0.62, 0.5, fp[2] * 0.62]} s={fin(t, "circular", 0.5, 0)} />
        <Cone p={[rp[0] * 0.62, 0.5, rp[2] * 0.62]} s={fin(t, "circular", 0.5, 0)} col="#7cc4ff" />
        <Link a={[RP(7)[0], 0.75, RP(7)[2]]} b={[RP(0)[0], 0.75, RP(0)[2]]} p={seg(t, ev.aakhri2 - 0.2, ev.aakhri2 + 0.5)} h={0.6} col="#7cc4ff" k={2} />
      </World>
      {Array.from({ length: RN }, (_, i) => (
        <Label key={i} p={[RP(i)[0] * 1.32, 0.05, RP(i)[2] * 1.32]} cam={pos} look={look} a={a} text={`[${i}]`} mono size={34} hot={(i === 0 && wrap1 > 0) || i === 7} maxD={40} />
      ))}
      {Object.keys(vals).map((k) => (+k === 3 ? null : <Label key={`v${k}`} p={[RP(+k)[0], 0.75, RP(+k)[2]]} cam={pos} look={look} a={a} text={vals[+k]} size={44} maxD={40} />))}
      <Label p={[fp[0] * 0.45, 1.0, fp[2] * 0.45]} cam={pos} look={look} a={a * fin(t, "circular", 0.5, 0)} text="FRONT" mono size={36} hot maxD={40} />
      <Label p={[rp[0] * 0.45, 1.0, rp[2] * 0.45]} cam={pos} look={look} a={a * fin(t, "circular", 0.5, 0)} text="REAR" mono size={36} col="#7cc4ff" maxD={40} />
      <MonoTag x={540} y={640} a={a * fin(t, "aakhri2", 0.4, 0)}>[7] KE BAAD → [0]</MonoTag>
    </>
  );
};
