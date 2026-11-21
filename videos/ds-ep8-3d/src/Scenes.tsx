import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CamRig, HDR, Layer, MonoTag, SCN, eio, eo, ev, fin, lerp, project, seg } from "./common";

type V3 = [number, number, number];
const K = 0.45; // content units -> world units (nodes are authored ~1.6 units wide)
const sc = (v: V3): V3 => [v[0] * K, v[1] * K, v[2] * K];
/** keyframed cinematic camera: eased moves between [time, position, look-at] keys (content units) */
type Key = [number, V3, V3];
const ZOOM = 1.45; // the locker wall is wide for a vertical frame: every key sits 1.45x farther from its look-at point
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

const mix = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

/* ---------- Ep 8: lockers ---------- */
const LW = 0.9, LH = 1.6, LD = 0.8;
/** a locker: neon frame box + a door hinged on its left edge (open 0..1); glow tints; col overrides (red for collision) */
const Locker: React.FC<{ p: V3; open?: number; glow?: number; col?: string; a?: number; s?: number }> = ({ p, open = 0, glow = 0.3, col = "#ff8a1f", a = 1, s = 1 }) =>
  a <= 0 || s <= 0 ? null : (
    <group position={p} scale={s}>
      <Slab p={[0, 0, 0]} w={LW} d={LD} h={LH} glow={glow} col={col} a={a} />
      <group position={[-LW / 2, LH / 2, LD / 2 + 0.01]} rotation={[0, -open * 1.9, 0]}>
        <mesh position={[LW / 2, 0, 0]}>
          <boxGeometry args={[LW * 0.96, LH * 0.96, 0.04]} />
          <meshStandardMaterial color="#20160f" emissive={new THREE.Color(col)} emissiveIntensity={0.08 + 0.5 * glow} roughness={0.4} metalness={0.6} transparent opacity={a} />
        </mesh>
        {[0.25, 0.32, 0.39].map((y) => (
          <mesh key={y} position={[LW / 2, y, 0.03]}>
            <boxGeometry args={[LW * 0.55, 0.02, 0.01]} />
            <meshBasicMaterial color={HDR(col, 1.2)} toneMapped={false} transparent opacity={a} />
          </mesh>
        ))}
        <mesh position={[LW * 0.85, -0.05, 0.04]}>
          <sphereGeometry args={[0.04, 12, 8]} />
          <meshBasicMaterial color={HDR("#ffb15c", 2.4)} toneMapped={false} transparent opacity={a} />
        </mesh>
      </group>
    </group>
  );
/** a floating name tag (glowing plate) */
const Tag: React.FC<{ p: V3; a: number; col?: string }> = ({ p, a, col = "#7cc4ff" }) =>
  a <= 0 ? null : (
    <mesh position={p}>
      <boxGeometry args={[1.1, 0.38, 0.06]} />
      <meshBasicMaterial color={HDR(col, 1.4)} toneMapped={false} transparent opacity={0.55 * a} />
    </mesh>
  );
const LX = (i: number, n = 10) => (i - (n - 1) / 2) * 1.05;

/* ---------- Scene 1 (hook): graph stations lift into a wall of lockers ---------- */
export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 0, 0);
  const GV: V3[] = [[-2.6, 0, -1.7], [-1, 0, -3.4], [-1.2, 0, 0.9], [0.8, 0, -1.4], [1.0, 0, 3.0], [2.7, 0, 0], [-2.7, 0, 3.0]];
  const up = (i: number) => eio(seg(t, ev.turant - 2.2 + i * 0.15, ev.turant - 1.2 + i * 0.15));
  const { pos, look } = camPath(t, [[0, [0, 11, 10], [0, 0, 0]], [ev.turant - 2.4, [0.5, 9, 11], [0, 0.5, 0]], [ev.turant + 0.3, [0, 2.4, 9.5], [0, 0.8, 0]], [SCN[1].start, [1.0, 2.2, 9.0], [0, 0.8, 0]]]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {GV.map((g, i) => {
          const u = up(i); const target: V3 = [LX(i, 7), 0, 0];
          const p = mix(g, target, u);
          return u < 0.5 ? (
            <mesh key={i} position={[p[0], 0.15 + Math.sin(u * Math.PI) * 1.2, p[2]]}>
              <cylinderGeometry args={[0.45, 0.45, 0.2, 32]} />
              <meshStandardMaterial color="#1c130d" emissive={new THREE.Color("#ff8a1f")} emissiveIntensity={0.5} />
            </mesh>
          ) : (
            <Locker key={i} p={[p[0], Math.sin(u * Math.PI) * 1.2, p[2]]} glow={0.4 + (i === 3 ? 0.8 * fin(t, "turant", 0.4, 0) : 0)} open={i === 3 ? 0.6 * fin(t, "turant", 0.6, 0.2) : 0} />
          );
        })}
        {[[0, 1], [0, 2], [0, 6], [1, 3], [2, 3], [2, 4], [6, 4], [3, 5], [4, 5]].map(([u, v], k) => (
          <Edge key={k} a={[GV[u][0], 0.15, GV[u][2]]} b={[GV[v][0], 0.15, GV[v][2]]} op={1 - seg(t, ev.turant - 2.4, ev.turant - 1.8)} />
        ))}
      </World>
      <Label p={[LX(3, 7), 2.3, 0]} cam={pos} look={look} a={a * fin(t, "turant", 0.4, 0)} text="TURANT!" mono size={26} hot maxD={30} />
    </>
  );
};

/* ---------- Scenes 3-5: the gym locker room — name -> its locker, key and value ---------- */
export const LockerScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 2, 4);
  const appear = (i: number) => eo(seg(t, SCN[2].start + 0.1 + i * 0.08, SCN[2].start + 0.5 + i * 0.08));
  const fly = eio(seg(t, ev.naam - 0.1, ev.seedhe + 0.4));
  const open3 = eo(seg(t, ev.seedhe + 0.2, ev.seedhe + 0.8));
  const tagP: V3 = mix([LX(3) - 4, 3.4, 3], [LX(3), 1.95, 0.5], fly);
  const kv = fin(t, "key", 0.4, -0.2), vv = fin(t, "value", 0.4, -0.2);
  const { pos, look } = camPath(t, [
    [SCN[2].start, [-6, 2.8, 9], [0, 0.9, 0]],
    [ev.tay + 0.3, [0, 3.2, 11], [0, 0.9, 0]],
    [ev.seedhe + 0.6, [LX(3) + 0.8, 2.0, 4.6], [LX(3), 1.0, 0]],
    [ev.value + 0.4, [LX(3) + 1.4, 1.8, 3.6], [LX(3), 0.9, 0]],
    [SCN[5].start, [LX(3) + 1.8, 2.0, 4.0], [LX(3), 0.9, 0]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {Array.from({ length: 10 }, (_, i) => <Locker key={i} p={[LX(i), 0, 0]} s={appear(i)} glow={i === 3 ? 0.3 + 0.9 * open3 : 0.3} open={i === 3 ? open3 : 0} />)}
        <Tag p={tagP} a={seg(t, ev.naam - 0.4, ev.naam) * (1 - seg(t, SCN[5].start - 0.3, SCN[5].start))} />
        {vv > 0 && (
          <mesh position={[LX(3), 0.55, 0]} scale={vv}>
            <boxGeometry args={[0.5, 0.4, 0.4]} />
            <meshBasicMaterial color={HDR("#ffb15c", 2.0)} toneMapped={false} />
          </mesh>
        )}
      </World>
      {Array.from({ length: 10 }, (_, i) => (
        <Label key={i} p={[LX(i), LH + 0.25, 0.4]} cam={pos} look={look} a={a * appear(i)} text={String(i)} mono size={22} hot={i === 3} maxD={30} />
      ))}
      <Label p={tagP} cam={pos} look={look} a={a * seg(t, ev.naam - 0.4, ev.naam)} text="RIYA" size={26} maxD={30} />
      <Label p={[tagP[0], tagP[1] + 0.45, tagP[2]]} cam={pos} look={look} a={a * kv} text="KEY" mono size={20} col="#7cc4ff" maxD={30} />
      <Label p={[LX(3), 0.25, 0.6]} cam={pos} look={look} a={a * vv} text="VALUE · SAAMAAN" mono size={20} hot maxD={30} />
      <MonoTag x={540} y={640} a={a * fin(t, "seedhe", 0.4, -0.2) * (1 - seg(t, ev.key - 0.4, ev.key))}>RIYA → SEEDHA LOCKER 3</MonoTag>
    </>
  );
};

/* ---------- Scenes 9-12: collision (Kiran also -> 3), chaining, open addressing, resize to 20 ---------- */
export const CollisionScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 8, 11);
  const kFly = eio(seg(t, ev.kiran - 0.2, ev.kiran + 0.8));
  const hit = seg(t, ev.kiran + 0.6, ev.kiran + 0.9) * (1 - seg(t, ev.chaining - 0.3, ev.chaining));
  const chain = fin(t, "chaining", 0.6, -0.1) * (1 - seg(t, ev.khaali - 0.6, ev.khaali - 0.2));
  const probe = eio(seg(t, ev.khaali - 0.2, ev.khaali + 0.6));
  const grow = eio(seg(t, ev.dugna - 0.4, ev.nayi + 0.6));
  // positions: before resize 10 in a row; after, 20 in two rows (index i -> row floor(i/10))
  const P = (i: number, n: number): V3 => (n === 10 ? [LX(i), 0, 0] : [LX(i % 10), 0, i < 10 ? -1.1 : 1.1]);
  const at = (i: number, j: number): V3 => mix(P(i, 10), P(j, 20), grow);
  // after resize Riya (53) -> 53 % 20 = 13, Kiran (53) -> 13 then probe 14
  const riyaL = at(3, 13), kiranL = at(4, 14);
  const kStart: V3 = [LX(3) + 4, 3.4, 3];
  let kP: V3 = mix(kStart, [LX(3), 1.95, 0.6], kFly);
  if (chain > 0) kP = mix(kP, [LX(3), -0.0 + 0.6, 1.6], chain);
  if (probe > 0) kP = mix([LX(3), 1.95, 0.6], [LX(4), 1.95, 0.6], probe);
  if (grow > 0) kP = [kiranL[0], 1.95, kiranL[2] + 0.6];
  const rP: V3 = [riyaL[0], 1.95, riyaL[2] + 0.6];
  const { pos, look } = camPath(t, [
    [SCN[8].start, [LX(3) + 2.5, 2.6, 6.5], [LX(3), 1.0, 0]],
    [ev.collision + 0.3, [LX(3) + 1.2, 2.0, 4.8], [LX(3), 1.2, 0]],
    [ev.dono + 0.4, [LX(3) + 2.0, 1.2, 5.0], [LX(3), 0.8, 0.8]],
    [ev.open + 0.4, [LX(3.5) + 1.0, 2.2, 5.2], [LX(3.5), 1.0, 0]],
    [ev.nayi + 0.8, [0, 7.5, 12], [0, 0.8, 0]],
    [SCN[12].start, [1.0, 7.5, 11.5], [0, 0.8, 0]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {Array.from({ length: 20 }, (_, j) => {
          if (j < 10) { const p = at(j, j); return <Locker key={j} p={p} glow={0.3 + (j === 3 ? 0.6 : 0) + (j === 4 && probe > 0 && grow === 0 ? 0.8 * probe : 0)} col={j === 3 && hit > 0.2 ? "#ff5a3c" : "#ff8a1f"} open={j === 3 && grow === 0 ? 0.5 : j === 4 && grow === 0 ? 0.5 * probe : 0} />; }
          return <Locker key={j} p={P(j, 20)} s={eo(seg(grow, (j - 10) * 0.03, (j - 10) * 0.03 + 0.4))} glow={0.3 + ((j === 13 || j === 14) && grow > 0.9 ? 0.8 : 0)} />;
        })}
        <Tag p={rP} a={1} />
        <Tag p={kP} a={seg(t, ev.kiran - 0.4, ev.kiran)} col={hit > 0.2 ? "#ff5a3c" : "#ffb15c"} />
        {/* chaining: a small linked list hanging from locker 3 */}
        {chain > 0 && <Edge a={[LX(3), 1.75, 0.6]} b={[LX(3), 0.85, 1.55]} p={chain} col="#ffb15c" k={2} />}
      </World>
      {Array.from({ length: 10 }, (_, j) => (
        <Label key={j} p={[at(j, j)[0], LH + 0.25, at(j, j)[2] + 0.4]} cam={pos} look={look} a={a * (1 - grow)} text={String(j)} mono size={20} hot={j === 3} maxD={30} />
      ))}
      {[13, 14].map((j) => (
        <Label key={`n${j}`} p={[P(j, 20)[0], LH + 0.25, P(j, 20)[2] + 0.4]} cam={pos} look={look} a={a * seg(grow, 0.85, 1)} text={String(j)} mono size={20} hot maxD={30} />
      ))}
      <Label p={rP} cam={pos} look={look} a={a} text="RIYA · 53" size={22} maxD={30} />
      <Label p={kP} cam={pos} look={look} a={a * seg(t, ev.kiran - 0.4, ev.kiran)} text="KIRAN · 53" size={22} col={hit > 0.2 ? "#ff7a5c" : "#ffd27a"} maxD={30} />
      <Label p={[LX(3), 2.9, 0]} cam={pos} look={look} a={a * hit} text="COLLISION!" size={30} col="#ff5a3c" maxD={30} />
      <MonoTag x={540} y={640} a={a * chain}>LOCKER 3: RIYA → KIRAN</MonoTag>
      <MonoTag x={540} y={640} a={a * seg(t, ev.khaali - 0.2, ev.khaali + 0.2) * (1 - seg(t, ev.bhar - 0.4, ev.bhar))}>3 BHARA → AGLA KHAALI: 4</MonoTag>
      <MonoTag x={540} y={640} a={a * seg(grow, 0.6, 1)}>20 LOCKERS · 53 % 20 = 13</MonoTag>
    </>
  );
};
