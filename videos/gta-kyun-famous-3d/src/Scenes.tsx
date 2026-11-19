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


const Orb: React.FC<{ p: V3; s?: number; col?: string }> = ({ p, s = 1, col = "#ffb15c" }) =>
  s <= 0 ? null : (
    <mesh position={p} scale={s}>
      <sphereGeometry args={[0.2, 24, 16]} />
      <meshBasicMaterial color={HDR(col, 3)} toneMapped={false} />
    </mesh>
  );
/* ---------- GTA: an original neon city (no logos, no game art) ---------- */
function rnd(s: number) { return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const GN = 7, GS = 2.2; // 7x7 blocks, 2.2 apart (roads in between)
const BLOCKS = (() => { const r = rnd(11); const out: { x: number; z: number; h: number; c: string }[] = []; for (let i = 0; i < GN; i++) for (let j = 0; j < GN; j++) { const d = Math.hypot(i - 3, j - 3); out.push({ x: (i - 3) * GS, z: (j - 3) * GS, h: 0.6 + r() * 3.2 * (1.2 - d / 5), c: r() < 0.25 ? "#ff3fa4" : r() < 0.5 ? "#7cc4ff" : "#ff8a1f" }); } return out; })();
/** the city: blocks rise from flat plates (rise 0) to buildings (rise 1) */
const City: React.FC<{ rise: number; glow?: number; tint?: (i: number) => number }> = ({ rise, glow = 0.35, tint }) => (
  <>
    {BLOCKS.map((b, i) => (
      <Slab key={i} p={[b.x, 0, b.z]} w={1.5} d={1.5} h={Math.max(0.06, b.h * rise)} glow={glow + (tint ? tint(i) : 0)} col={rise > 0.3 ? b.c : "#ff8a1f"} />
    ))}
  </>
);
/** a car: low box + glowing head/tail lights; heading = yaw */
const Car: React.FC<{ p: V3; yaw: number; s?: number; col?: string }> = ({ p, yaw, s = 1, col = "#ffb15c" }) =>
  s <= 0 ? null : (
    <group position={p} rotation={[0, yaw, 0]} scale={s}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.9, 0.26, 0.48]} />
        <meshStandardMaterial color="#1a120c" emissive={new THREE.Color(col)} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.02, 0.38, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.42]} />
        <meshStandardMaterial color="#120c08" emissive={new THREE.Color(col)} emissiveIntensity={0.2} />
      </mesh>
      {[-0.15, 0.15].map((z) => (
        <mesh key={z} position={[0.46, 0.2, z]}>
          <boxGeometry args={[0.03, 0.06, 0.1]} />
          <meshBasicMaterial color={HDR("#fff3d6", 3)} toneMapped={false} />
        </mesh>
      ))}
      {[-0.15, 0.15].map((z) => (
        <mesh key={`t${z}`} position={[-0.46, 0.2, z]}>
          <boxGeometry args={[0.03, 0.06, 0.1]} />
          <meshBasicMaterial color={HDR("#ff3030", 2.5)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
/** position + heading along a closed loop of road points */
function drive(P: V3[], u: number): { p: V3; yaw: number } {
  const n = P.length, f = ((u % n) + n) % n, i = Math.floor(f), k = f - i;
  const a = P[i], b = P[(i + 1) % n];
  return { p: [lerp(a[0], b[0], k), 0, lerp(a[2], b[2], k)], yaw: -Math.atan2(b[2] - a[2], b[0] - a[0]) };
}
const R = GS / 2; // road centre offset from a block centre
const LOOP: V3[] = [[-3 * GS - R, 0, -3 * GS - R], [R, 0, -3 * GS - R], [R, 0, -R], [3 * GS + R, 0, -R], [3 * GS + R, 0, 3 * GS + R], [-R, 0, 3 * GS + R], [-R, 0, R], [-3 * GS - R, 0, R]];
const LOOP2: V3[] = [[-R - GS, 0, -3 * GS - R], [-R - GS, 0, 3 * GS + R], [R + GS, 0, 3 * GS + R], [R + GS, 0, -3 * GS - R]];
const Star: React.FC<{ p: V3; s: number }> = ({ p, s }) =>
  s <= 0 ? null : (
    <mesh position={p} scale={s} rotation={[0, p[0], 0]}>
      <octahedronGeometry args={[0.35, 0]} />
      <meshBasicMaterial color={HDR("#ffd27a", 3)} toneMapped={false} />
    </mesh>
  );

/* ---------- Scene 1 (hook): night fly-through of a neon city ---------- */
export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 0, 0);
  const c1 = drive(LOOP, t * 0.55), c2 = drive(LOOP2, t * 0.45 + 1.3);
  const { pos, look } = camPath(t, [[0, [-10, 3.0, 10], [-4, 1.2, -2]], [ev.gta6 + 0.8, [-4, 4.2, 9], [0, 1.4, -2]], [ev.paagal - 0.6, [4, 7, 12], [0, 1.0, 0]], [SCN[1].start, [6, 12, 15], [0, 0.5, 0]]]);
  return (
    <>
      <World a={a} cam={pos} look={look} bloom={1.5}>
        <City rise={1} glow={0.45} />
        <Car p={c1.p} yaw={c1.yaw} />
        <Car p={c2.p} yaw={c2.yaw} col="#7cc4ff" />
      </World>
      <Label p={[0, 5.2, 0]} cam={pos} look={look} a={a * fin(t, "gta6", 0.5, 0.2)} text="2013 → 2026" mono size={30} hot maxD={40} />
    </>
  );
};

/* ---------- Scenes 4-6: 1997 top-down grid -> 2001 3D city -> open world vs levels ---------- */
export const CityScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 3, 5);
  const rise = eio(seg(t, ev.y2001 - 0.2, ev.badal + 0.8));
  const car = drive(LOOP, (t - SCN[3].start) * 0.7);
  const free = drive(LOOP2, (t - SCN[3].start) * 0.6 + 2);
  const corr = seg(t, SCN[5].start, SCN[5].start + 0.5) * (1 - seg(t, ev.shehar - 0.6, ev.shehar - 0.1));
  const wide = seg(t, ev.shehar - 0.4, ev.shehar + 0.4);
  const { pos, look } = camPath(t, [
    [SCN[3].start, [0.01, 26, 0.5], [0, 0, 0]],
    [ev.y2001, [0.01, 24, 1.0], [0, 0, 0]],
    [ev.badal + 0.9, [9, 9, 13], [0, 1.0, 0]],
    [ev.chaaho + 0.6, [-2.0, 5.0, 4.0], [R, 0.8, -5]],
    [ev.open + 0.6, [-6, 10, 14], [0, 1, 0]],
    [ev.level + 0.4, [-12, 3.2, -9], [-12, 0.6, 2]],
    [ev.shehar + 0.8, [10, 20, 18], [0, 0, 0]],
    [SCN[6].start, [11, 21, 17], [0, 0, 0]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look} bloom={1.4}>
        <City rise={rise} glow={0.35 + 0.5 * wide} />
        <Car p={car.p} yaw={car.yaw} s={0.9 + rise * 0.1} />
        {rise > 0.5 && <Car p={free.p} yaw={free.yaw} col="#ff3fa4" />}
        {/* the old way: a single corridor of levels */}
        {[0, 1, 2].map((k) => (
          <group key={k} position={[-12, 0, -6 + k * 5]}>
            {corr > 0 && <Slab p={[-1.4, 0, 0]} w={0.2} d={4.6} h={2.4} glow={0.6} a={corr} col="#7cc4ff" />}
            {corr > 0 && <Slab p={[1.4, 0, 0]} w={0.2} d={4.6} h={2.4} glow={0.6} a={corr} col="#7cc4ff" />}
            {corr > 0 && <Slab p={[0, 0, 2.3]} w={2.8} d={0.15} h={2.4} glow={1.0} a={corr * 0.6} col="#ffb15c" />}
          </group>
        ))}
      </World>
      {[0, 1, 2].map((k) => (
        <Label key={k} p={[-12, 2.9, -6 + k * 5]} cam={pos} look={look} a={a * corr} text={`LEVEL ${k + 1}`} mono size={24} col="#7cc4ff" maxD={40} />
      ))}
      <Label p={[0, 0.3, 0]} cam={pos} look={look} a={a * (1 - seg(t, ev.y2001 - 0.4, ev.y2001)) } text="1997 · 2D" mono size={30} hot maxD={60} />
      <Label p={[0, 5.0, 0]} cam={pos} look={look} a={a * fin(t, "badal", 0.4, 0) * (1 - seg(t, ev.chaaho - 0.6, ev.chaaho - 0.2))} text="2001 · 3D CITY" mono size={28} hot maxD={60} />
      <Label p={[0, 6.0, 0]} cam={pos} look={look} a={a * wide} text="SHEHAR TUMHARA" size={34} hot maxD={60} />
      <MonoTag x={540} y={640} a={a * fin(t, "open", 0.4, -0.2) * (1 - seg(t, SCN[5].start - 0.3, SCN[5].start))}>JAHAN CHAAHO JAO · JO CHAAHO KARO</MonoTag>
    </>
  );
};

/* ---------- Scenes 11-13: the online city — players, endless updates, live service loop, roleplay ---------- */
const PLAYERS = (() => { const r = rnd(5); return Array.from({ length: 36 }, (_, i) => ({ loop: r() < 0.5 ? 0 : 1, off: r() * 8, sp: 0.25 + r() * 0.5, col: ["#7cc4ff", "#ff3fa4", "#ffb15c", "#7cf2a0"][i % 4] })); })();
export const OnlineScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 10, 12);
  const upd = seg(t, ev.updates - 0.4, ev.updates + 0.2);
  const shop = fin(t, "khareed", 0.5, -0.2) * (1 - seg(t, SCN[11].start, SCN[11].start + 0.4));
  const loop = fin(t, "live", 0.6, -0.6) * (1 - seg(t, SCN[12].start, SCN[12].start + 0.4));
  const rp = fin(t, "roleplay", 0.5, -0.2);
  const { pos, look } = camPath(t, [
    [SCN[10].start, [12, 16, 16], [0, 0, 0]],
    [ev.updates + 0.4, [-10, 12, 14], [0, 0.5, 0]],
    [ev.live + 0.6, [0.01, 30, 9], [0, 0, 0]],
    [ev.police - 0.2, [2, 20, 10], [0, 0, 0]],
    [SCN[13].start, [-2, 21, 11], [0, 0, 0]],
  ]);
  const ROLE = [{ n: "POLICE", c: "#7cc4ff", p: [-R - GS, 0, -GS] as V3 }, { n: "DOCTOR", c: "#f6efe7", p: [R, 0, GS + 0.4] as V3 }, { n: "GANG", c: "#ff3a3a", p: [GS + R, 0, -2 * GS] as V3 }]; // on the central roads so they stay in the vertical frame
  return (
    <>
      <World a={a} cam={pos} look={look} bloom={1.5}>
        <City rise={1} glow={0.4} />
        {PLAYERS.map((pl, i) => { const d = drive(pl.loop ? LOOP2 : LOOP, pl.off + (t - SCN[10].start) * pl.sp); return <Orb key={i} p={[d.p[0], 0.4, d.p[2]]} s={0.6 * (1 - 0.6 * rp)} col={pl.col} />; })}
        {/* updates raining down onto the city, every year */}
        {upd > 0 && [0, 1, 2, 3, 4, 5].map((k) => { const ph = ((t - ev.updates) * 0.7 + k / 6) % 1; const b = BLOCKS[(k * 7 + 3) % BLOCKS.length]; return <Slab key={k} p={[b.x, 9 - ph * 8, b.z]} w={0.6} d={0.6} h={0.6} glow={1.4} a={upd * (1 - ph)} col="#7cf2a0" />; })}
        {shop > 0 && [0, 1, 2, 3].map((k) => { const d = drive(LOOP, PLAYERS[k].off + (t - SCN[10].start) * PLAYERS[k].sp); return <Star key={k} p={[d.p[0], 1.4 + 0.15 * Math.sin(t * 6 + k), d.p[2]]} s={shop * 0.8} />; })}
        {loop > 0 && (
          <mesh rotation={[-Math.PI / 2, 0, t * 0.6]} position={[0, 0.5, 0]}>
            <torusGeometry args={[9.5, 0.12, 8, 120, Math.PI * 1.8 * loop]} />
            <meshBasicMaterial color={HDR("#7cf2a0", 2.4)} toneMapped={false} />
          </mesh>
        )}
        {ROLE.map((r, k) => (
          <group key={r.n}>
            {[0, 1, 2].map((m) => <Orb key={m} p={[r.p[0] + (m - 1) * 0.6, 0.45, r.p[2] + 0.2 * Math.sin(t * 3 + m)]} s={rp * 0.8} col={r.c} />)}
            {rp > 0 && k === 0 && <Car p={[r.p[0], 0, r.p[2] - 1.0]} yaw={0} col="#7cc4ff" s={rp} />}
          </group>
        ))}
      </World>
      {ROLE.map((r) => (
        <Label key={r.n} p={[r.p[0], 1.6, r.p[2]]} cam={pos} look={look} a={a * rp} text={`● LIVE · ${r.n}`} mono size={34} col={r.c} maxD={60} />
      ))}
      <Label p={[0, 1.2, -9.5]} cam={pos} look={look} a={a * loop} text="UPDATE → PLAY → KHAREEDO → REPEAT" mono size={26} col="#7cf2a0" maxD={60} />
      <MonoTag x={540} y={640} a={a * upd * (1 - seg(t, ev.khareed - 0.3, ev.khareed))}>HAR SAAL NAYE UPDATES</MonoTag>
      <MonoTag x={540} y={640} a={a * shop}>IN-GAME KHAREEDAARI</MonoTag>
    </>
  );
};

/* ---------- Scenes 15-17: GTA VI — a sunset coastline (Leonida), two leads, the long wait ---------- */
const PALMS = (() => { const r = rnd(9); return Array.from({ length: 14 }, (_, i) => ({ x: -12 + i * 1.9 + r() * 0.6, z: 3.2 + r() * 1.6, h: 2.2 + r() * 1.4, lean: (r() - 0.5) * 0.4 })); })();
const Palm: React.FC<{ x: number; z: number; h: number; lean: number }> = ({ x, z, h, lean }) => (
  <group position={[x, 0, z]} rotation={[0, 0, lean]}>
    <mesh position={[0, h / 2, 0]}>
      <cylinderGeometry args={[0.06, 0.1, h, 6]} />
      <meshStandardMaterial color="#2a1a10" emissive={new THREE.Color("#ff6a3a")} emissiveIntensity={0.15} />
    </mesh>
    {[0, 1, 2, 3, 4].map((k) => (
      <mesh key={k} position={[0, h, 0]} rotation={[0.9, (k / 5) * Math.PI * 2, 0]}>
        <coneGeometry args={[0.12, 1.3, 4]} />
        <meshBasicMaterial color={HDR("#ff3fa4", 0.9)} toneMapped={false} />
      </mesh>
    ))}
  </group>
);
const Figure: React.FC<{ p: V3; col: string; s: number }> = ({ p, col, s }) =>
  s <= 0 ? null : (
    <group position={p} scale={s}>
      <mesh position={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.24, 0.7, 8, 16]} />
        <meshStandardMaterial color="#120c10" emissive={new THREE.Color(col)} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshStandardMaterial color="#120c10" emissive={new THREE.Color(col)} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.42, 32]} />
        <meshBasicMaterial color={HDR(col, 2.4)} toneMapped={false} />
      </mesh>
    </group>
  );
export const ViScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 14, 16);
  const views = eio(seg(t, ev.ghante - 0.4, ev.record + 0.4));
  const ppl = fin(t, "lucia", 0.6, -0.4), ppl2 = fin(t, "jason", 0.6, -0.4);
  const d1 = fin(t, "do", 0.4, -0.2), d2 = fin(t, "khiski", 0.4, -0.2), d3 = fin(t, "khiski", 0.4, 0.5);
  const stars = (k: number) => eo(seg(t, ev.perfect - 0.3 + k * 0.12, ev.perfect + k * 0.12));
  const { pos, look } = camPath(t, [
    [SCN[14].start, [0, 3.5, 16], [0, 3.0, -6]],
    [ev.record + 0.4, [2, 4.5, 14], [0, 3.0, -6]],
    [ev.leonida + 0.4, [-6, 2.2, 10], [-2, 1.4, 2]],
    [ev.jason + 0.6, [1.2, 1.6, 8.0], [0, 1.0, 3.8]],
    [ev.khiski + 0.6, [0, 4.5, 14], [0, 3.2, -3]],
    [SCN[17].start, [0.8, 4.8, 14.5], [0, 3.2, -3]],
  ]);
  return (
    <>
      <World a={a} cam={pos} look={look} bloom={1.6}>
        {/* sunset sun + ocean + beach */}
        <mesh position={[0, 2.2, -26]}>
          <circleGeometry args={[5, 64]} />
          <meshBasicMaterial color={HDR("#ff7a3a", 2.2)} toneMapped={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -12]}>
          <planeGeometry args={[80, 26]} />
          <meshStandardMaterial color="#2a1840" emissive={new THREE.Color("#ff3fa4")} emissiveIntensity={0.12} roughness={0.15} metalness={0.8} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 3]}>
          <planeGeometry args={[80, 4]} />
          <meshStandardMaterial color="#3a2414" emissive={new THREE.Color("#ffb15c")} emissiveIntensity={0.18} />
        </mesh>
        {PALMS.map((p, i) => <Palm key={i} {...p} />)}
        {/* skyline across the bay */}
        {BLOCKS.slice(0, 18).map((b, i) => <Slab key={i} p={[-14 + i * 1.6, 0, -6]} w={1.2} d={1.2} h={b.h * 1.4} glow={0.5} col={i % 3 ? "#ff3fa4" : "#7cc4ff"} />)}
        <Figure p={[-0.9, 0.03, 3.6]} col="#ff3fa4" s={ppl} />
        <Figure p={[0.9, 0.03, 3.6]} col="#7cc4ff" s={ppl2} />
        {/* the trailer record bars */}
        {[0, 1, 2, 3, 4, 5].map((k) => <Slab key={`v${k}`} p={[-3 + k * 1.2, 0, 0]} w={0.8} d={0.8} h={Math.max(0.05, views * (1.2 + k * 0.9))} glow={1.0} a={1 - seg(t, ev.leonida - 0.6, ev.leonida)} col="#ffb15c" />)}
        {[0, 1, 2, 3, 4].map((k) => <Star key={`s${k}`} p={[-2.4 + k * 1.2, 3.6, 1]} s={stars(k)} />)}
      </World>
      <Label p={[0, 4.6, 2.2]} cam={pos} look={look} a={a * views * (1 - seg(t, ev.leonida - 0.6, ev.leonida))} text={`${(9 * views).toFixed(1)} CRORE VIEWS`} size={36} hot maxD={60} />
      <Label p={[0, 3.8, 2.2]} cam={pos} look={look} a={a * views * (1 - seg(t, ev.leonida - 0.6, ev.leonida))} text="24 GHANTE · TRAILER 1" mono size={22} maxD={60} />
      <Label p={[-4, 5.0, -6]} cam={pos} look={look} a={a * fin(t, "leonida", 0.5, -0.3) * (1 - seg(t, ev.do - 0.4, ev.do))} text="LEONIDA · VICE CITY" mono size={26} hot maxD={60} />
      <Label p={[-0.9, 2.2, 3.6]} cam={pos} look={look} a={a * ppl * (1 - seg(t, ev.do - 0.4, ev.do))} text="LUCIA" size={26} col="#ff7fc8" maxD={40} />
      <Label p={[0.9, 2.2, 3.6]} cam={pos} look={look} a={a * ppl2 * (1 - seg(t, ev.do - 0.4, ev.do))} text="JASON" size={26} col="#9fd6ff" maxD={40} />
      <MonoTag x={300} y={700} a={a * d1}>2025 ✕</MonoTag>
      <MonoTag x={540} y={700} a={a * d2}>MAY 2026 ✕</MonoTag>
      <MonoTag x={790} y={700} a={a * d3}>19 NOV 2026 ✓</MonoTag>
    </>
  );
};
