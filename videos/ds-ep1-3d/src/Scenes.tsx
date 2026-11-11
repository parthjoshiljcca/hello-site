import { useMemo } from "react";
import * as THREE from "three";
import { CamRig, HDR, Layer, MonoTag, SCN, back, eio, eo, ev, fin, lerp, project, sceneAlpha, seg } from "./common";

const hash = (i: number, k: number) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
/** cinematic camera on a sphere around a target: radius, elevation (deg), azimuth (deg) */
const orbit = (r: number, elev: number, azim: number, tgt: [number, number, number]): [number, number, number] => {
  const e = (elev * Math.PI) / 180, z = (azim * Math.PI) / 180;
  return [tgt[0] + r * Math.cos(e) * Math.sin(z), tgt[1] + r * Math.sin(e), tgt[2] + r * Math.cos(e) * Math.cos(z)];
};
const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight position={[-2, 3, 4]} intensity={2.4} color="#ffe2bf" />
    <pointLight position={[2, 1, 3]} intensity={8} color="#ff8a1f" />
  </>
);
const Label: React.FC<{ p: THREE.Vector3; cam: [number, number, number]; look: [number, number, number]; a: number; text: string; big?: boolean; hot?: boolean }> = ({ p, cam, look, a, text, big, hot }) => {
  if (a <= 0) return null;
  const s = project(p, cam, look);
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y, transform: "translate(-50%,-50%)", fontFamily: big ? "M" : "J", fontWeight: big ? 900 : 500, fontSize: big ? 34 : 22, color: hot ? "#ffb15c" : "#f6efe7", textShadow: "0 0 12px rgba(255,138,31,.9)", opacity: Math.min(1, a), whiteSpace: "nowrap" }}>
      {text}
    </div>
  );
};

/* ---------- Scene 1: a phone; chaotic data tiles snap into an organised grid, one contact is found instantly ---------- */
export const PhoneScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 0);
  const enter = back(seg(t, 0.1, 0.9));
  const org = eio(seg(t, ev.naam - 0.3, ev.naam + 1.2));
  const found = eo(seg(t, ev.palak - 0.2, ev.palak + 0.6));
  const u = eio(seg(t, 0, 9.6));
  const cam = orbit(lerp(8.6, 6.9, u), lerp(14, 6, u), lerp(-30, 22, u), [0, 0, 0]);
  const tiles = useMemo(() => Array.from({ length: 48 }, (_, i) => ({ r: 1.3 + hash(i, 1) * 1.1, ph: hash(i, 2) * Math.PI * 2, sp: 0.3 + hash(i, 3) * 0.5, y: (hash(i, 4) - 0.5) * 2.4, k: i % 3 })), []);
  const cols = ["#ff8a1f", "#f3ece4", "#7cc4ff"];
  return (
    <>
      <Layer opacity={a} bloom={1.2}>
        <CamRig pos={cam} look={[0, 0, 0]} roll={0.03 * Math.sin(t * 0.6)} />
        <Lights />
        <group scale={enter} rotation={[0, 0.25 * Math.sin(t * 0.5), 0]}>
          {/* phone body + screen */}
          <mesh>
            <boxGeometry args={[1.1, 2.1, 0.1]} />
            <meshStandardMaterial color="#120c08" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.055]}>
            <planeGeometry args={[0.98, 1.95]} />
            <meshBasicMaterial color={HDR("#ff8a1f", 0.18 + 0.25 * org)} toneMapped={false} />
          </mesh>
          {/* data tiles: orbiting chaos -> neat grid on the screen */}
          {tiles.map((d, i) => {
            const an = d.ph + t * d.sp;
            const chaos = new THREE.Vector3(Math.cos(an) * d.r, d.y, Math.sin(an) * d.r);
            const gx = (i % 6) - 2.5, gy = Math.floor(i / 6) - 3.5;
            const grid = new THREE.Vector3(gx * 0.15, -gy * 0.22, 0.08);
            const isFound = i === 20;
            const p = chaos.lerp(grid, org);
            if (isFound) p.lerp(new THREE.Vector3(0, 0.1, 1.2), found);
            const s = isFound ? 1 + 1.6 * found : 1;
            return (
              <mesh key={i} position={p} rotation={[0, lerp(an, 0, org), 0]} scale={s}>
                <boxGeometry args={[0.11, 0.15, 0.02]} />
                <meshBasicMaterial color={HDR(isFound && found > 0 ? "#ffb15c" : cols[d.k], isFound ? 1.2 + 2.5 * found : 1.0)} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      </Layer>
      <MonoTag x={540} y={1120} a={found * a}>CONTACT MIL GAYA ⚡</MonoTag>
    </>
  );
};

/* ---------- Scene 9: array = a train of numbered coaches (tracking shot, whip to coach 3, pull back) ---------- */
const N_COACH = 6;
const coachX = (i: number) => (i - (N_COACH - 1) / 2) * 1.25;
export const TrainScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 9);
  const track = eio(seg(t, SCN[9].start, ev.seedhe - 0.3));
  const whip = eio(seg(t, ev.seedhe - 0.3, ev.seedhe + 0.4));
  const pull = eio(seg(t, ev.array - 0.6, ev.array + 0.8));
  const x0 = lerp(coachX(0) - 1.2, coachX(4), track);
  const xw = lerp(x0, coachX(3), whip);
  const camX = lerp(xw, 0, pull);
  const cam: [number, number, number] = [camX + lerp(-1.4, -0.4, track), lerp(0.8, 1.6, pull), lerp(3.9, 8.2, pull)];
  const look: [number, number, number] = [camX + 0.3, 0.1, 0];
  const hot = whip;
  return (
    <>
      <Layer opacity={a} bloom={1.15}>
        <CamRig pos={cam} look={look} roll={-0.02 * (1 - pull)} />
        <Lights />
        {/* rails */}
        {[-0.28, 0.28].map((z) => (
          <mesh key={z} position={[0, -0.47, z]}>
            <boxGeometry args={[12, 0.03, 0.04]} />
            <meshStandardMaterial color="#c9a46a" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <mesh key={`s${i}`} position={[-6 + i * 0.44, -0.5, 0]}>
            <boxGeometry args={[0.1, 0.03, 0.8]} />
            <meshStandardMaterial color="#3a2618" roughness={0.9} />
          </mesh>
        ))}
        {Array.from({ length: N_COACH }, (_, i) => {
          const isHot = i === 3 && hot > 0;
          return (
            <group key={i} position={[coachX(i), 0, 0]}>
              <mesh>
                <boxGeometry args={[1.15, 0.7, 0.62]} />
                <meshStandardMaterial color={isHot ? "#5a2a0c" : "#1e140e"} emissive={new THREE.Color("#ff8a1f")} emissiveIntensity={isHot ? 0.35 + 0.5 * hot : 0.05} roughness={0.5} metalness={0.3} />
              </mesh>
              {[-0.35, 0, 0.35].map((wx) => (
                <mesh key={wx} position={[wx, 0.1, 0.315]}>
                  <planeGeometry args={[0.22, 0.2]} />
                  <meshBasicMaterial color={HDR("#ffb15c", isHot ? 2.4 : 1.2)} toneMapped={false} />
                </mesh>
              ))}
              {[-0.38, 0.38].map((wx) => (
                <mesh key={`w${wx}`} position={[wx, -0.38, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.1, 0.1, 0.05, 20]} />
                  <meshStandardMaterial color="#111" metalness={0.6} />
                </mesh>
              ))}
              {i < N_COACH - 1 && (
                <mesh position={[0.62, -0.15, 0]}>
                  <boxGeometry args={[0.12, 0.06, 0.06]} />
                  <meshStandardMaterial color="#c9a46a" metalness={0.8} />
                </mesh>
              )}
            </group>
          );
        })}
      </Layer>
      {Array.from({ length: N_COACH }, (_, i) => (
        <Label key={i} p={new THREE.Vector3(coachX(i), 0.62, 0.3)} cam={cam} look={look} a={a * fin(t, "number", 0.5, -0.2 + i * 0.08)} text={`[${i}]`} big hot={i === 3 && hot > 0.5} />
      ))}
      <MonoTag x={540} y={1150} a={a * whip * (1 - pull * 0.3)}>train[3] → SEEDHA!</MonoTag>
    </>
  );
};

/* ---------- Scene 11: stack of plates (push one by one, the last one comes off first), crane camera ---------- */
export const PlatesScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 11);
  const n = 6;
  const crane = eio(seg(t, SCN[11].start, SCN[12].start));
  const cam = orbit(lerp(7.4, 6.4, crane), lerp(4, 28, crane), lerp(-35, 15, crane), [0, 0.15, 0]);
  const look: [number, number, number] = [0, 0.15, 0];
  const lift = eio(seg(t, ev.pehle - 0.2, ev.pehle + 0.9));
  const lastGlow = eo(seg(t, ev.aakhir - 0.2, ev.aakhir + 0.4));
  return (
    <>
      <Layer opacity={a} bloom={1.15}>
        <CamRig pos={cam} look={look} />
        <Lights />
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[1.0, 1.1, 0.12, 48]} />
          <meshStandardMaterial color="#2a1a10" roughness={0.6} />
        </mesh>
        {Array.from({ length: n }, (_, i) => {
          const drop = eo(seg(t, ev.plates - 0.6 + i * 0.25, ev.plates - 0.35 + i * 0.25));
          if (drop <= 0) return null;
          const top = i === n - 1;
          const y = -0.5 + i * 0.13 + (1 - drop) * 1.6 + (top ? lift * 0.75 : 0);
          return (
            <group key={i} position={[top ? lift * 0.5 : 0, y, 0]} rotation={[top ? -0.3 * lift : 0, 0, top ? 0.25 * lift : 0]}>
              <mesh>
                <cylinderGeometry args={[0.85, 0.62, 0.08, 64]} />
                <meshStandardMaterial color="#efe6da" roughness={0.25} metalness={0.05} emissive={new THREE.Color("#ff8a1f")} emissiveIntensity={top ? 0.5 * lastGlow : 0} />
              </mesh>
              <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.66, 0.72, 64]} />
                <meshBasicMaterial color={HDR("#ff8a1f", 1.2)} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </Layer>
      <MonoTag x={300} y={700} a={a * fin(t, "plates", 0.4, 0)}>PUSH ↓</MonoTag>
      <MonoTag x={800} y={700} a={a * lift}>POP ↑ (LAST IN, FIRST OUT)</MonoTag>
    </>
  );
};

/* ---------- Scene 15: metro graph (stations = nodes, lines = edges), a train travels, camera tilts and orbits ---------- */
const ST: [number, number][] = [[-1.6, -0.9], [-0.8, -1.1], [0.1, -0.7], [1.0, -1.0], [1.7, -0.4], [-1.3, 0.1], [-0.3, 0.2], [0.7, 0.1], [1.5, 0.6], [-0.8, 1.0], [0.2, 1.1], [1.1, 1.3]];
const LINES: [number[], string][] = [[[0, 1, 2, 3, 4], "#ff8a1f"], [[5, 6, 7, 8], "#7cc4ff"], [[9, 6, 2], "#ffcf6a"], [[10, 7, 3], "#b48cff"], [[9, 10, 11, 8, 4], "#7cc46b"]];
export const MetroScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 15);
  const u = eio(seg(t, SCN[15].start, SCN[16].start));
  const cam = orbit(lerp(8.4, 7.0, u), lerp(62, 36, u), lerp(-25, 25, u), [0, 0, 0]);
  const look: [number, number, number] = [0, 0, 0];
  const build = seg(t, ev.metro - 0.6, ev.station + 0.6);
  const curves = useMemo(() => LINES.map(([ids]) => new THREE.CatmullRomCurve3(ids.map((k) => new THREE.Vector3(ST[k][0], 0, ST[k][1])), false, "catmullrom", 0.2)), []);
  const deg = ST.map((_, k) => LINES.filter(([ids]) => ids.includes(k)).length);
  return (
    <>
      <Layer opacity={a} bloom={1.25}>
        <CamRig pos={cam} look={look} />
        <Lights />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[5, 4]} />
          <meshStandardMaterial color="#120c08" roughness={0.95} />
        </mesh>
        {curves.map((c, i) => {
          const q = seg(build * LINES.length - i, 0, 1);
          if (q <= 0) return null;
          return (
            <mesh key={i}>
              <tubeGeometry args={[c, 80, 0.035, 8, false]} />
              <meshBasicMaterial color={HDR(LINES[i][1], 1.4)} toneMapped={false} transparent opacity={q} />
            </mesh>
          );
        })}
        {ST.map(([x, z], k) => (
          <mesh key={k} position={[x, 0.02, z]} scale={0.07 + 0.035 * deg[k]}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshBasicMaterial color={HDR(deg[k] > 1 ? "#ffffff" : "#f3ece4", deg[k] > 1 ? 2.2 : 1.2)} toneMapped={false} />
          </mesh>
        ))}
        {/* trains */}
        {curves.map((c, i) => {
          const p = c.getPoint((t * 0.18 + i * 0.27) % 1);
          return (
            <mesh key={`tr${i}`} position={[p.x, 0.08, p.z]} scale={0.06}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshBasicMaterial color={HDR(LINES[i][1], 3.5)} toneMapped={false} />
            </mesh>
          );
        })}
      </Layer>
      <Label p={new THREE.Vector3(ST[6][0], 0.35, ST[6][1])} cam={cam} look={look} a={a * fin(t, "station", 0.4, 0)} text="NODE = STATION" />
      <Label p={new THREE.Vector3((ST[0][0] + ST[1][0]) / 2, 0.3, (ST[0][1] + ST[1][1]) / 2)} cam={cam} look={look} a={a * fin(t, "station", 0.4, 0.4)} text="EDGE = LINE" />
    </>
  );
};
