import { useMemo } from "react";
import * as THREE from "three";
import { Badge, CamRig, HDR, Layer, MonoTag, SCN, back, eio, eo, ev, fin, lerp, pop, project, sceneAlpha, seg } from "./common";
const SCN9 = SCN[9].start;


/** cinematic camera on a sphere around a target: radius, elevation (deg), azimuth (deg) */
const orbit = (r: number, elev: number, azim: number, tgt: [number, number, number]): [number, number, number] => {
  const e = (elev * Math.PI) / 180, z = (azim * Math.PI) / 180;
  return [tgt[0] + r * Math.cos(e) * Math.sin(z), tgt[1] + r * Math.sin(e), tgt[2] + r * Math.cos(e) * Math.cos(z)];
};
const hash = (i: number, k: number) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight position={[-2, 3, 4]} intensity={2.4} color="#ffe2bf" />
    <pointLight position={[2, 1, 3]} intensity={8} color="#ff8a1f" />
  </>
);
/* a "0" is a ring, a "1" is a bar: the same visual language as laghu (short) / guru (long) */
const Bit: React.FC<{ one: boolean; s: number; col: THREE.Color }> = ({ one, s, col }) =>
  one ? (
    <mesh scale={s}>
      <boxGeometry args={[0.05, 0.22, 0.05]} />
      <meshBasicMaterial color={col} toneMapped={false} />
    </mesh>
  ) : (
    <mesh scale={s}>
      <torusGeometry args={[0.08, 0.022, 10, 28]} />
      <meshBasicMaterial color={col} toneMapped={false} />
    </mesh>
  );

/* ---------- Scene 1: a glowing chip; 0s and 1s stream along the traces into it ---------- */
export const ChipScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 0);
  const enter = eo(seg(t, 0, 1.0));
  const traces = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const side = i % 4, k = Math.floor(i / 4);
        const off = (k - 1.5) * 0.28;
        const inner: [number, number] = side === 0 ? [-0.62, off] : side === 1 ? [0.62, off] : side === 2 ? [off, -0.62] : [off, 0.62];
        const outer: [number, number] = side === 0 ? [-2.6, off * 2.2] : side === 1 ? [2.6, off * 2.2] : side === 2 ? [off * 2.2, -2.2] : [off * 2.2, 2.2];
        const mid: [number, number] = side < 2 ? [(inner[0] + outer[0]) / 2, outer[1]] : [outer[0], (inner[1] + outer[1]) / 2];
        return new THREE.CatmullRomCurve3([new THREE.Vector3(outer[0], 0, outer[1]), new THREE.Vector3(mid[0], 0, mid[1]), new THREE.Vector3(inner[0], 0, inner[1])], false, "catmullrom", 0.05);
      }),
    [],
  );
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const zo = pop(t, "zero", 0.5, -0.1), on = pop(t, "one", 0.5, -0.1);
  const dive = eio(seg(t, 0, 2.6)), drift = eio(seg(t, 2.4, 7.6));
  const tgtC: [number, number, number] = [0, 0, 0.1];
  const cam = orbit(lerp(8.2, 6.2, dive) - 0.9 * drift, lerp(88, 34, dive) - 6 * drift, lerp(0, 32, dive) + 40 * drift, tgtC);
  return (
    <>
      <Layer opacity={a} bloom={1.3}>
        <CamRig pos={cam} look={tgtC} roll={0.04 * Math.sin(t * 0.7)} />
        <Lights />
        <group scale={enter}>
          {/* board */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
            <planeGeometry args={[6, 5]} />
            <meshStandardMaterial color="#120c08" roughness={0.9} />
          </mesh>
          {traces.map((c, i) => (
            <mesh key={i}>
              <tubeGeometry args={[c, 24, 0.012, 6, false]} />
              <meshBasicMaterial color={HDR("#ff8a1f", 0.55)} toneMapped={false} />
            </mesh>
          ))}
          {/* chip */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[1.2, 0.16, 1.2]} />
            <meshStandardMaterial color="#1c140f" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.7, 0.7]} />
            <meshBasicMaterial color={HDR("#ff8a1f", 0.8 + 1.8 * pulse)} toneMapped={false} />
          </mesh>
          {Array.from({ length: 24 }, (_, i) => {
            const side = Math.floor(i / 6), k = (i % 6) - 2.5;
            const p: [number, number, number] = side === 0 ? [-0.66, 0.03, k * 0.18] : side === 1 ? [0.66, 0.03, k * 0.18] : side === 2 ? [k * 0.18, 0.03, -0.66] : [k * 0.18, 0.03, 0.66];
            return (
              <mesh key={`p${i}`} position={p}>
                <boxGeometry args={[0.08, 0.04, 0.08]} />
                <meshStandardMaterial color="#d6b66a" metalness={0.9} roughness={0.3} />
              </mesh>
            );
          })}
          {/* bits flowing in */}
          {traces.map((c, i) =>
            [0, 1, 2].map((k) => {
              const ph = (t * 0.35 + hash(i, k) + k / 3) % 1;
              const p = c.getPoint(ph);
              const one = hash(i, k + 7) > 0.5;
              const show = one ? on : zo;
              if (show <= 0) return null;
              return (
                <group key={`${i}-${k}`} position={[p.x, 0.12, p.z]} rotation={[-0.9, 0, 0]}>
                  <Bit one={one} s={0.9 * Math.min(1, show)} col={HDR(one ? "#ff8a1f" : "#f3ece4", 2.2)} />
                </group>
              );
            }),
          )}
        </group>
      </Layer>
      <Badge x={330} y={1200} p={zo * a} fs={34}>0</Badge>
      <Badge x={750} y={1200} p={on * a} fs={34}>1</Badge>
    </>
  );
};

/* ---------- Scene 10: Pingala's prastaar: all 16 four-syllable patterns (guru = long capsule, laghu = short dot) ---------- */
const PATS = Array.from({ length: 16 }, (_, i) => [0, 1, 2, 3].map((b) => ((i >> b) & 1) === 0)); // row 1 = all guru, then binary counting
export const PrastaarScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 9);
  const build = seg(t, ev.patterns - 0.4, ev.solah - 0.2);
  const u = eio(seg(t, SCN9 - 0.1, SCN9 + 4.3));
  const camP = orbit(lerp(7.4, 6.3, u), lerp(6, 16, u), lerp(-48, 38, u), [0, -0.12, 0]);
  const done = fin(t, "solah", 0.4, -0.1);
  return (
    <Layer opacity={a} bloom={1.2}>
      <CamRig pos={camP} look={[0, -0.12, 0]} roll={-0.03 * Math.sin(u * Math.PI)} />
      <Lights />
      <group>
        {PATS.map((row, r) => {
          const p = back(seg(build * 16 - r, 0, 1));
          if (p <= 0) return null;
          const y = 1.0 - r * 0.135;
          return (
            <group key={r} position={[0, y, 0]} scale={p}>
              {row.map((guru, c) => (
                <mesh key={c} position={[-0.75 + c * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  {guru ? <capsuleGeometry args={[0.045, 0.26, 6, 16]} /> : <sphereGeometry args={[0.05, 16, 12]} />}
                  <meshBasicMaterial color={HDR(guru ? "#ff8a1f" : "#f3ece4", 1.4 + 1.2 * done * (0.5 + 0.5 * Math.sin(t * 6 + r)))} toneMapped={false} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
    </Layer>
  );
};

/* ---------- Scene 15: Halayudha's Meru Prastaar (= Pascal's triangle) as glowing hex tiles ---------- */
const C = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
export const MeruScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 14);
  const rows = 7;
  const build = seg(t, ev.meru - 0.6, ev.meru + 2.2);
  const crane = eio(seg(t, ev.meru - 1.4, ev.meru + 2.4)), push = eio(seg(t, ev.pascal - 0.4, ev.pascal + 1.6));
  const cam = orbit(lerp(6.9, 6.3, crane) - 0.3 * push, lerp(-30, 4, crane), lerp(34, 0, crane), [0, 0.1, 0]);
  const look: [number, number, number] = [0, 0.1, 0];
  const yaw = 0;
  const cells: { n: number; k: number; x: number; y: number }[] = [];
  for (let n = 0; n < rows; n++) for (let k = 0; k <= n; k++) cells.push({ n, k, x: (k - n / 2) * 0.36, y: 0.95 - n * 0.32 });
  const hl = eo(seg(t, ev.pascal - 0.3, ev.pascal + 0.6));
  return (
    <>
      <Layer opacity={a} bloom={1.2}>
        <CamRig pos={cam} look={look} />
        <Lights />
        <group rotation={[0.25, yaw, 0]} scale={0.78} position={[0, 0.22, 0]}>
          {cells.map(({ n, k, x, y }) => {
            const p = back(seg(build * rows - n, 0, 1));
            if (p <= 0) return null;
            const v = C(n, k);
            return (
              <mesh key={`${n}-${k}`} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={p}>
                <cylinderGeometry args={[0.16, 0.16, 0.08 + 0.012 * v, 6]} />
                <meshStandardMaterial color="#2a1a10" emissive={new THREE.Color("#ff8a1f")} emissiveIntensity={0.25 + 0.05 * v + 0.6 * hl} roughness={0.4} metalness={0.3} />
              </mesh>
            );
          })}
        </group>
      </Layer>
      {cells.map(({ n, k, x, y }) => {
        const p = seg(build * rows - n, 0.4, 1);
        if (p <= 0) return null;
        const v = new THREE.Vector3(x, y, 0.1).applyEuler(new THREE.Euler(0.25, yaw, 0)).multiplyScalar(0.78).add(new THREE.Vector3(0, 0.22, 0));
        const s = project(v, cam, look);
        return (
          <div key={`l${n}-${k}`} style={{ position: "absolute", left: s.x, top: s.y, transform: "translate(-50%,-50%)", fontFamily: "M", fontWeight: 900, fontSize: 25, color: "#fff4e6", textShadow: "0 0 10px rgba(255,138,31,.9)", opacity: p * a }}>
            {C(n, k)}
          </div>
        );
      })}
      <MonoTag x={540} y={1215} a={fin(t, "meru", 0.4, 0.4) * a * (1 - push)}>MERU PRASTAAR</MonoTag>
    </>
  );
};
