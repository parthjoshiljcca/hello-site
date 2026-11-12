import { useMemo } from "react";
import * as THREE from "three";
import { CamRig, HDR, Layer, MonoTag, SCN, back, eio, eo, ev, fin, lerp, project, seg } from "./common";

type V3 = [number, number, number];
const K = 0.45; // content units -> world units (cells are authored ~1 unit wide)
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
const Floor: React.FC<{ a?: number }> = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshBasicMaterial color="#060403" />
    </mesh>
    <gridHelper args={[80, 80, "#c8621a", "#5a2c0e"]} />
  </>
);
const boxEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.96, 0.5, 0.96));
/** a memory cell: dark slab, neon edges, glowing top plate (glow 0..1), optional cool tint */
const Cell: React.FC<{ p: V3; glow?: number; a?: number; cool?: boolean; s?: number }> = ({ p, glow = 0, a = 1, cool, s = 1 }) => {
  if (a <= 0) return null;
  const col = cool ? "#7cc4ff" : "#ff8a1f";
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.96, 0.5, 0.96]} />
        <meshStandardMaterial color="#17100b" roughness={0.35} metalness={0.5} transparent opacity={a} />
      </mesh>
      <lineSegments geometry={boxEdges} position={[0, 0.25, 0]}>
        <lineBasicMaterial color={HDR(col, 0.9 + 2.2 * glow)} toneMapped={false} transparent opacity={a} />
      </lineSegments>
      <mesh position={[0, 0.505, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color={HDR(col, 0.12 + 1.5 * glow)} toneMapped={false} transparent opacity={a} />
      </mesh>
    </group>
  );
};
const Item: React.FC<{ p: V3; s?: number; hot?: boolean; a?: number }> = ({ p, s = 1, hot, a = 1 }) =>
  s <= 0 || a <= 0 ? null : (
    <mesh position={p} scale={0.5 * s}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={HDR(hot ? "#ffb15c" : "#ff8a1f", hot ? 2.4 : 1.25)} toneMapped={false} transparent opacity={a} />
    </mesh>
  );
const Label: React.FC<{ p: V3; cam: V3; look: V3; a: number; text: string; size?: number; mono?: boolean; hot?: boolean; maxD?: number }> = ({ p, cam, look, a, text, size = 30, mono, hot, maxD = 99 }) => {
  if (a <= 0) return null;
  const d = Math.hypot(p[0] - cam[0], p[1] - cam[1], p[2] - cam[2]);
  const fade = 1 - seg(d, maxD * 0.7, maxD);
  if (fade <= 0) return null;
  const s = project(new THREE.Vector3(...sc(p)), sc(cam), sc(look));
  const k = Math.min(1.6, 9 / d);
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y, transform: "translate(-50%,-50%)", fontFamily: mono ? "J" : "M", fontWeight: mono ? 500 : 900, fontSize: size * k, color: hot ? "#ffb15c" : "#f6efe7", textShadow: "0 0 12px rgba(255,138,31,.9), 0 2px 6px #000", opacity: Math.min(1, a) * fade, whiteSpace: "nowrap" }}>
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

/* ---------- Scene 1: the Ep.1 train morphs into array cells ---------- */
export const HookScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 0, 0);
  const m = eio(seg(t, ev.fast - 0.7, ev.fast + 0.4));
  const { pos, look } = camPath(t, [[0, [-6, 0.9, 4], [-2.5, 0.2, 0]], [ev.train + 0.4, [1.5, 1.0, 4.6], [1, 0.2, 0]], [ev.fast + 0.6, [0, 7.5, 15.5], [0, 0.9, 0]], [SCN[1].start, [1.6, 6.4, 15], [0, 0.9, 0]]]);
  const X = (i: number) => (i - 2.5) * 1.2;
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i} position={[X(i), 0, 0]}>
            {m < 1 && (
              <group scale={[1, 1 - m, 1]} position={[0, 0.12, 0]}>
                <mesh position={[0, 0.42, 0]}>
                  <boxGeometry args={[1.1, 0.66, 0.6]} />
                  <meshStandardMaterial color="#1e140e" emissive={new THREE.Color("#ff8a1f")} emissiveIntensity={0.06} roughness={0.5} metalness={0.3} transparent opacity={1 - m} />
                </mesh>
                {[-0.33, 0, 0.33].map((wx) => (
                  <mesh key={wx} position={[wx, 0.5, 0.305]}>
                    <planeGeometry args={[0.2, 0.18]} />
                    <meshBasicMaterial color={HDR("#ffb15c", 1.3)} toneMapped={false} transparent opacity={1 - m} />
                  </mesh>
                ))}
                {[-0.36, 0.36].map((wx) => (
                  <mesh key={`w${wx}`} position={[wx, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
                    <meshStandardMaterial color="#111" />
                  </mesh>
                ))}
              </group>
            )}
            <Cell p={[0, 0, 0]} a={m} glow={m * (0.4 + 0.3 * Math.sin(t * 4 + i))} s={0.6 + 0.4 * m} />
            <Item p={[0, 0.5 + 0.3, 0]} s={back(seg(m, 0.75, 1))} />
          </group>
        ))}
      </World>
      {Array.from({ length: 6 }, (_, i) => (
        <Label key={i} p={[X(i), 1.5, 0]} cam={pos} look={look} a={a * fin(t, "zero", 0.4, -0.3 + i * 0.07)} text={`[${i}]`} hot={i === 0} />
      ))}
    </>
  );
};

/* ---------- Scenes 3-7: the memory street -> contiguous block -> base address -> index = offset -> direct access ---------- */
const NM = 16, A0 = 4, AN = 6; // 16 memory cells, the array occupies cells 4..9 (addresses 104..109)
const MX = (i: number) => (i - 7.5) * 1.05;
export const MemoryScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 2, 6);
  const xb = MX(A0), xm = MX(A0 + 2.5), x3 = MX(A0 + 3);
  const { pos, look } = camPath(t, [
    [SCN[2].start, [-11.5, 1.3, 3.4], [-4, 0.3, 0]],
    [SCN[3].start - 0.2, [-5.5, 1.5, 4.2], [1, 0.3, 0]],
    [ev.book + 1.0, [xm, 7, 14], [xm, 0.6, 0]],
    [SCN[4].start, [xm + 0.5, 6.3, 13.6], [xm, 0.6, 0]],
    [ev.pehle + 0.8, [xb + 0.2, 1.6, 4.2], [xb, 0.3, 0]],
    [SCN[5].start + 0.2, [xb + 0.5, 1.8, 4.6], [xb + 0.3, 0.3, 0]],
    [ev.kitne - 0.2, [xm, 6, 14.2], [xm, 1.1, 0]],
    [ev.seedhe - 0.3, [xm, 5.6, 13.8], [xm, 1.1, 0]],
    [ev.seedhe + 0.3, [x3 + 0.05, 1.8, 4.4], [x3, 0.4, 0]],
    [SCN[7].start, [x3 + 0.05, 1.6, 4.0], [x3, 0.4, 0]],
  ]);
  const booked = (k: number) => eo(seg(t, ev.book - 0.2 + k * 0.12, ev.book + 0.2 + k * 0.12));
  const offs = (k: number) => eo(seg(t, ev.kitne - 0.2 + k * 0.42, ev.kitne + 0.25 + k * 0.42));
  const hit = seg(t, ev.seedhe - 0.1, ev.seedhe + 0.25);
  const base = eo(seg(t, ev.pehle - 0.2, ev.pehle + 0.3)) * (1 - seg(t, ev.kitne - 0.6, ev.kitne - 0.2));
  const arcs = useMemo(() => Array.from({ length: AN }, (_, k) => (k === 0 ? null : new THREE.QuadraticBezierCurve3(new THREE.Vector3(MX(A0), 0.75, 0), new THREE.Vector3((MX(A0) + MX(A0 + k)) / 2, 1.0 + 0.42 * k, 0), new THREE.Vector3(MX(A0 + k), 0.75, 0)))), []);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {Array.from({ length: NM }, (_, i) => {
          const k = i - A0, inArr = k >= 0 && k < AN;
          const g = inArr ? booked(k) * (0.55 + 0.2 * Math.sin(t * 3 + i)) + (k === 3 ? 1.2 * hit + 0.5 * seg(t, ev.teen - 0.1, ev.teen + 0.3) : 0) + (k === 0 ? 0.8 * base : 0) : 0;
          return (
            <group key={i}>
              <Cell p={[MX(i), 0, 0]} glow={g} cool={!inArr} />
              {inArr && <Item p={[MX(i), 0.8, 0]} s={back(booked(k))} hot={k === 3 && hit > 0} />}
            </group>
          );
        })}
        {/* base-address pointer */}
        {base > 0 && (
          <mesh position={[xb, 1.75 + 0.1 * Math.sin(t * 5), 0]} rotation={[Math.PI, 0, 0]} scale={base}>
            <coneGeometry args={[0.22, 0.5, 4]} />
            <meshBasicMaterial color={HDR("#ffb15c", 2.6)} toneMapped={false} />
          </mesh>
        )}
        {/* offset arcs: index = how many houses ahead of the first */}
        {arcs.map((c, k) => {
          if (!c) return null;
          const q = offs(k) * (1 - seg(t, ev.seedhe - 0.5, ev.seedhe - 0.2) * (k === 3 ? 0 : 0.85));
          if (q <= 0) return null;
          return (
            <mesh key={k}>
              <tubeGeometry args={[c, 40, 0.025, 6, false]} />
              <meshBasicMaterial color={HDR(k === 3 && t > ev.teen ? "#ffb15c" : "#ff8a1f", k === 3 && t > ev.teen ? 2.6 : 1.3)} toneMapped={false} transparent opacity={q} />
            </mesh>
          );
        })}
        {/* access beam on index 3 */}
        {hit > 0 && (
          <mesh position={[x3, 3, 0]}>
            <cylinderGeometry args={[0.07, 0.3, 6, 16, 1, true]} />
            <meshBasicMaterial color={HDR("#ffb15c", 2.4)} toneMapped={false} transparent opacity={0.55 * hit} side={THREE.DoubleSide} />
          </mesh>
        )}
      </World>
      {Array.from({ length: NM }, (_, i) => (
        <Label key={`ad${i}`} p={[MX(i), 0.25, 0.62]} cam={pos} look={look} a={a * fin(t, "address", 0.5, -1.6 + i * 0.1)} text={String(100 + i)} mono size={20} hot={i >= A0 && i < A0 + AN && t > ev.book} maxD={14} />
      ))}
      {Array.from({ length: AN }, (_, k) => (
        <Label key={`ix${k}`} p={[MX(A0 + k), 1.55 + (k ? 0.21 * k : 0), 0]} cam={pos} look={look} a={a * offs(k) * (t < ev.seedhe ? 1 : k === 3 ? 1 : 0.35)} text={`[${k}]`} hot={k === 0 || (k === 3 && t > ev.teen)} size={26} />
      ))}
      <Label p={[xb, 2.45, 0]} cam={pos} look={look} a={a * base} text="PEHLA GHAR · 104" mono size={22} hot />
    </>
  );
};

/* ---------- Scenes 12-13: insert in the middle (shift right), then delete (shift left) ---------- */
const SXp = (i: number) => (i - 2.5) * 1.1;
export const ShiftScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 11, 12);
  const tI = ev.insert + 0.9, tD = ev.delete + 0.5, tL = ev.khaali;
  const { pos, look } = camPath(t, [[SCN[11].start, [-4.5, 3, 11], [0, 0.6, 0]], [tI + 1.6, [0.6, 6.2, 14.4], [0, 0.6, 0]], [tI + 2.6, [-0.4, 2.6, 6.5], [SXp(2), 0.5, 0]], [tD + 0.9, [-1.6, 5.2, 12.6], [-0.4, 0.6, 0]], [SCN[13].start, [1.5, 6.2, 14.6], [0, 0.6, 0]]]);
  // items: letter, slot over time
  const mv = (from: number, to: number, t0: number) => lerp(from, to, eio(seg(t, t0, t0 + 0.45)));
  const items: { ch: string; slot: number; y: number; al: number; hot?: boolean }[] = [];
  const afterIns = (s: number, order: number) => mv(s, s + 1, tI + order * 0.5);
  // A (0), B (1): B gets deleted
  const bUp = eo(seg(t, tD, tD + 0.7));
  items.push({ ch: "A", slot: 0, y: 0, al: 1 });
  items.push({ ch: "B", slot: 1, y: bUp * 2.2, al: 1 - seg(t, tD + 0.3, tD + 0.8), hot: t > ev.delete });
  const left = (s: number, order: number) => s - eio(seg(t, tL + order * 0.32, tL + order * 0.32 + 0.4));
  const xDrop = eo(seg(t, tI + 1.7, tI + 2.2));
  items.push({ ch: "X", slot: left(2, 0), y: (1 - xDrop) * 2.6, al: seg(t, ev.insert - 0.2, ev.insert + 0.2), hot: true });
  items.push({ ch: "C", slot: left(afterIns(2, 2), 1), y: 0, al: 1 });
  items.push({ ch: "D", slot: left(afterIns(3, 1), 2), y: 0, al: 1 });
  items.push({ ch: "E", slot: left(afterIns(4, 0), 3), y: 0, al: 1 });
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {Array.from({ length: 6 }, (_, i) => (
          <Cell key={i} p={[SXp(i), 0, 0]} glow={0.25 + (i === 2 ? 0.6 * seg(t, ev.insert - 0.2, ev.insert + 0.3) * (1 - xDrop) : 0) + (i === 1 ? 0.6 * seg(t, tD + 0.5, tD + 0.9) * (1 - seg(t, tL, tL + 0.5)) : 0)} />
        ))}
        {items.map((it) => (
          <Item key={it.ch} p={[SXp(it.slot), 0.8 + it.y, 0]} hot={it.hot} a={it.al} s={it.al > 0 ? 1 : 0} />
        ))}
      </World>
      {items.map((it) => (
        <Label key={it.ch} p={[SXp(it.slot), 0.8 + it.y, 0.3]} cam={pos} look={look} a={a * it.al} text={it.ch} size={30} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Label key={`i${i}`} p={[SXp(i), 0.2, 0.62]} cam={pos} look={look} a={a} text={`[${i}]`} mono size={20} />
      ))}
      <MonoTag x={540} y={640} a={a * (t < ev.delete - 0.2 ? fin(t, "insert", 0.4, 0) : 0)}>INSERT X AT [2] → SHIFT RIGHT →</MonoTag>
      <MonoTag x={540} y={640} a={a * (t >= ev.delete - 0.2 ? fin(t, "delete", 0.4, 0) : 0)}>DELETE B → ← SHIFT LEFT</MonoTag>
    </>
  );
};

/* ---------- Scene 15: array is full -> a new array twice as big -> copy everything ---------- */
export const ResizeScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 14, 14);
  const { pos, look } = camPath(t, [[SCN[14].start, [0, 2.2, 8], [0, 0.3, 1.5]], [ev.dugni + 1.2, [0, 10.5, 18], [0, 0, 0.6]], [SCN[15].start, [1.6, 9.8, 17.5], [0, 0, 0.5]]]);
  const ox = (i: number) => (i - 1.5) * 1.1, nx = (i: number) => (i - 3.5) * 1.1;
  const fade = 1 - seg(t, ev.copy + 0.6, ev.copy + 1.2);
  return (
    <>
      <World a={a} cam={pos} look={look}>
        {Array.from({ length: 4 }, (_, i) => (
          <Cell key={`o${i}`} p={[ox(i), 0, 1.5]} glow={0.5} a={fade} />
        ))}
        {Array.from({ length: 8 }, (_, i) => {
          const p = back(seg(t, ev.dugni - 0.3 + i * 0.09, ev.dugni + 0.1 + i * 0.09));
          return p <= 0 ? null : <Cell key={`n${i}`} p={[nx(i), 0, -1.5]} glow={0.3 + (i < 4 ? 0.4 * seg(t, ev.copy - 1.2 + i * 0.35, ev.copy - 0.7 + i * 0.35) : 0)} s={p} />;
        })}
        {Array.from({ length: 4 }, (_, i) => {
          const u = eio(seg(t, ev.copy - 1.6 + i * 0.35, ev.copy - 0.9 + i * 0.35));
          return <Item key={i} p={[lerp(ox(i), nx(i), u), 0.8 + Math.sin(u * Math.PI) * 1.6, lerp(1.5, -1.5, u)]} hot={u > 0 && u < 1} />;
        })}
      </World>
      <Label p={[0, 0.3, 2.4]} cam={pos} look={look} a={a * fade} text="SIZE 4 · FULL" mono size={22} />
      <Label p={[0, 0.3, -2.5]} cam={pos} look={look} a={a * fin(t, "dugni", 0.4, 0.3)} text="SIZE 8" mono size={24} hot />
    </>
  );
};

/* ---------- Scene 17: the screen is a 2D array of pixels (rows x columns) ---------- */
const HEART = ["0110000110", "1111001111", "1111111111", "1111111111", "1111111111", "0111111110", "0011111100", "0001111000", "0000110000", "0000000000"];
export const PixelScene: React.FC<{ t: number }> = ({ t }) => {
  const a = span(t, 16, 16);
  const PX = (c: number) => (c - 4.5) * 0.5, PZ = (r: number) => (r - 4.5) * 0.5;
  const R = 2, C = 3;
  const { pos, look } = camPath(t, [[SCN[16].start, [PX(C) - 0.4, 1.8, PZ(R) + 3.4], [PX(C), 0.1, PZ(R)]], [ev.rows + 0.6, [0, 12.5, 5.5], [0, 0, 0.1]], [SCN[17].start, [1.0, 12.5, 5.0], [0, 0, 0.1]]]);
  const rc = seg(t, ev.rows - 0.2, ev.rows + 0.3) * (1 - seg(t, ev.d2 + 0.4, ev.d2 + 0.9));
  return (
    <>
      <World a={a} cam={pos} look={look} bloom={1.3}>
        {HEART.map((row, r) =>
          row.split("").map((ch, c) => {
            const on = ch === "1";
            const p = back(seg(t, SCN[16].start + 0.1 + (r + c) * 0.05, SCN[16].start + 0.5 + (r + c) * 0.05));
            if (p <= 0) return null;
            const hl = (r === R || c === C) ? rc : 0;
            const h = 0.04 + (on ? 0.04 + 0.02 * Math.sin(t * 3 + r + c) : 0) + 0.05 * hl;
            return (
              <mesh key={`${r}-${c}`} position={[PX(c), h / 2, PZ(r)]} scale={[0.38 * p, h, 0.38 * p]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={HDR(hl > 0.3 ? "#7cc4ff" : on ? "#ff8a1f" : "#4a2a14", hl > 0.3 ? 1.6 : on ? 1.6 : 0.8)} toneMapped={false} />
              </mesh>
            );
          }),
        )}
      </World>
      <Label p={[PX(C), 0.9, PZ(R)]} cam={pos} look={look} a={a * fin(t, "pixel", 0.4, -0.2) * (1 - seg(t, ev.d2 + 0.4, ev.d2 + 0.9))} text={`pixel[${R}][${C}]`} mono size={24} hot />
    </>
  );
};
