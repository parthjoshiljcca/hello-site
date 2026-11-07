import { useMemo } from "react";
import * as THREE from "three";
import { Badge, CamRig, HDR, Layer, MonoTag, SCN, cl, eio, eo, ev, fin, lerp, pop, sceneAlpha, seg } from "./common";
import { Env, Steam, WarmLights } from "./props";

/** Scene 11: "Par Indians ne ise apne tareeke se banaya. Doodh, cheeni, adrak aur elaichi daalkar." */
const CAM: [number, number, number] = [0, 2.3, 5.4];
const LOOK: [number, number, number] = [0, -0.15, 0];
const h1 = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const SURF = 0.18; // liquid level (y)

const Patila: React.FC = () => {
  const geo = useMemo(() => {
    const prof: [number, number][] = [[0, -0.55], [0.92, -0.55], [1.0, -0.47], [1.04, 0.32], [1.12, 0.4], [1.1, 0.44], [1.0, 0.36], [0.96, -0.45], [0, -0.45]];
    return new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 128);
  }, []);
  return (
    <group>
      <mesh geometry={geo}><meshStandardMaterial color="#cfc8c0" metalness={1} roughness={0.22} envMapIntensity={1.3} side={THREE.DoubleSide} /></mesh>
      {/* side handles */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.14, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.1, 0.022, 12, 32, Math.PI]} /><meshStandardMaterial color="#bdb6ae" metalness={1} roughness={0.3} /></mesh>
      ))}
    </group>
  );
};
const Stove: React.FC<{ t: number }> = ({ t }) => (
  <group position={[0, -0.72, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.55, 0.05, 12, 64]} /><meshStandardMaterial color="#2a2522" metalness={0.8} roughness={0.5} /></mesh>
    {Array.from({ length: 18 }, (_, i) => {
      const an = (i / 18) * Math.PI * 2, h = 0.13 + 0.05 * Math.sin(t * 13 + i * 1.9) + 0.03 * Math.sin(t * 7.3 + i);
      return (
        <mesh key={i} position={[Math.cos(an) * 0.5, h / 2 + 0.03, Math.sin(an) * 0.5]} rotation={[0, 0, Math.cos(an) * 0.15]}>
          <coneGeometry args={[0.045, h, 10, 1, true]} />
          <meshBasicMaterial color={i % 2 ? HDR("#ff8a1f", 2.6) : HDR("#ffb15c", 2.2)} toneMapped={false} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      );
    })}
  </group>
);

/** an item dropping into the pot along an arc, landing at `ev + 0.55` */
const fall = (t: number, e: string, from: [number, number, number]) => {
  const p = seg(t, ev[e] - 0.1, ev[e] + 0.55);
  const e2 = eio(p);
  return { p, pos: [lerp(from[0], (h1(e.length) - 0.5) * 0.4, e2), lerp(from[1], SURF + 0.02, e2 * e2) + Math.sin(e2 * Math.PI) * 0.5, lerp(from[2], 0, e2)] as [number, number, number], sink: seg(t, ev[e] + 0.55, ev[e] + 0.9) };
};
const Splash: React.FC<{ t: number; e: string }> = ({ t, e }) => {
  const p = seg(t, ev[e] + 0.5, ev[e] + 1.0);
  if (p <= 0 || p >= 1) return null;
  return (
    <group position={[0, SURF + 0.02, 0]}>
      {Array.from({ length: 12 }, (_, i) => {
        const an = (i / 12) * Math.PI * 2;
        const r = 0.15 + p * 0.55, y = Math.sin(p * Math.PI) * 0.35 * (0.6 + 0.4 * h1(i));
        return <mesh key={i} position={[Math.cos(an) * r, y, Math.sin(an) * r]} scale={1 - p}><sphereGeometry args={[0.035, 10, 8]} /><meshStandardMaterial color="#c88a52" roughness={0.2} /></mesh>;
      })}
    </group>
  );
};
const Ginger: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.16, 32, 24); const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); const k = 1 + 0.35 * Math.sin(v.x * 30) * Math.sin(v.y * 22 + 1) + 0.2 * Math.sin(v.z * 40); v.multiplyScalar(k); v.x *= 1.7; p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return g;
  }, []);
  return <mesh geometry={geo}><meshStandardMaterial color="#c99a5b" roughness={0.75} /></mesh>;
};

export const Patila3D: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 10);
  const lt = t - SCN[10].start;
  const enter = eo(seg(lt, 0, 0.7));
  // chai colour: dark decoction -> milky after doodh -> slightly richer with masala
  const milk = seg(t, ev.doodh + 0.35, ev.doodh + 1.3);
  const masala = seg(t, ev.adrak + 0.5, ev.elaichi + 1.2);
  const liquid = new THREE.Color("#3a1606").lerp(new THREE.Color("#a8622e"), milk).lerp(new THREE.Color("#9a5426"), masala * 0.5);
  // milk carton tilts and pours
  const carton = seg(t, ev.doodh - 0.25, ev.doodh + 0.25), pour = seg(t, ev.doodh + 0.1, ev.doodh + 1.1), back2 = seg(t, ev.doodh + 1.1, ev.doodh + 1.6);
  const cx = lerp(-2.2, -0.75, eo(carton)) - back2 * 1.6;
  const sug = fall(t, "cheeni", [1.9, 1.9, 0.3]), gin = fall(t, "adrak", [-1.9, 1.9, 0.2]), ela = fall(t, "elaichi", [1.8, 2.1, -0.2]);
  const done = t > ev.elaichi + 0.6;
  return (
    <>
      <Layer opacity={a}>
        <CamRig pos={CAM} look={LOOK} />
        <Env />
        <WarmLights />
        <group position={[0, -0.25 - (1 - enter) * 0.6, 0]} scale={0.95}>
          <Stove t={t} />
          <Patila />
          {/* chai surface with a gentle simmer */}
          <mesh position={[0, SURF, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.0, 96]} /><meshStandardMaterial color={liquid} roughness={0.15} envMapIntensity={0.9} /></mesh>
          {Array.from({ length: 22 }, (_, i) => {
            const ph = (t * (0.9 + h1(i) * 0.6) + h1(i + 7)) % 1;
            const an = h1(i + 1) * Math.PI * 2, r = Math.sqrt(h1(i + 2)) * 0.85;
            return <mesh key={i} position={[Math.cos(an) * r, SURF + 0.005, Math.sin(an) * r]} scale={[1, 0.5, 1].map((k) => k * (0.4 + ph) * (1 - ph * ph)) as [number, number, number]}><sphereGeometry args={[0.04, 12, 8]} /><meshStandardMaterial color={liquid.clone().lerp(new THREE.Color("#f0d0a8"), 0.35)} roughness={0.1} /></mesh>;
          })}
          {/* milk carton + stream */}
          {carton > 0 && back2 < 1 && (
            <group position={[cx, 1.55, 0.1]} rotation={[0, 0, -2.0 * eo(carton) + back2 * 2.0]}>
              <mesh><boxGeometry args={[0.36, 0.62, 0.36]} /><meshStandardMaterial color="#f3ece4" roughness={0.6} /></mesh>
              <mesh position={[0, 0.36, 0]}><cylinderGeometry args={[0.07, 0.07, 0.08, 24]} /><meshStandardMaterial color="#ff8a1f" emissive="#ff8a1f" emissiveIntensity={0.4} /></mesh>
            </group>
          )}
          {pour > 0 && pour < 1 && (
            <mesh position={[-0.42, (1.25 + SURF) / 2, 0.1]} scale={[1, 1 - Math.max(0, pour - 0.85) * 6, 1]}><cylinderGeometry args={[0.035, 0.05, 1.25 - SURF, 16]} /><meshStandardMaterial color="#fbf6ee" roughness={0.15} /></mesh>
          )}
          {/* sugar cubes */}
          {sug.p > 0 && sug.sink < 1 && [0, 1, 2].map((i) => (
            <mesh key={i} position={[sug.pos[0] + (i - 1) * 0.13, sug.pos[1] - sug.sink * 0.2 + i * 0.05, sug.pos[2]]} rotation={[t * 3 + i, t * 2, i]}><boxGeometry args={[0.11, 0.11, 0.11]} /><meshStandardMaterial color="#ffffff" roughness={0.5} emissive="#ffffff" emissiveIntensity={0.1} /></mesh>
          ))}
          {gin.p > 0 && gin.sink < 1 && <group position={[gin.pos[0], gin.pos[1] - gin.sink * 0.2, gin.pos[2]]} rotation={[t * 2, t * 1.4, 0.4]}><Ginger /></group>}
          {ela.p > 0 && ela.sink < 1 && [0, 1, 2].map((i) => (
            <mesh key={i} position={[ela.pos[0] + (i - 1) * 0.12, ela.pos[1] - ela.sink * 0.2, ela.pos[2] + i * 0.05]} rotation={[t * 3 + i, i, t * 2]} scale={[0.45, 1, 0.45]}><sphereGeometry args={[0.1, 20, 14]} /><meshStandardMaterial color="#8db45a" roughness={0.6} /></mesh>
          ))}
          {["doodh", "cheeni", "adrak", "elaichi"].map((e) => <Splash key={e} t={t} e={e} />)}
          <Steam t={t} y={SURF + 0.05} spread={0.75} height={2.0} n={110} size={0.42} a={0.6 + 0.6 * cl(lt / 2)} />
        </group>
      </Layer>
      {[["doodh", "DOODH", 190], ["cheeni", "CHEENI", 415], ["adrak", "ADRAK", 665], ["elaichi", "ELAICHI", 890]].map(([e, l, x]) => (
        <MonoTag key={e as string} x={x as number} y={640} a={fin(t, e as string, 0.3, 0.1) * a}>{l}</MonoTag>
      ))}
      <Badge x={540} y={1250} p={done ? pop(t, "elaichi", 0.5, 0.7) * a : 0}>MASALA CHAI</Badge>
    </>
  );
};
