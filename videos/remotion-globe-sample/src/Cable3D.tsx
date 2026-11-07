import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { T1, eo, back, seg, lerp, frameCamera } from "./anim";

const HDR = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);
const BACK = -7; // the cable runs from x=BACK to its cut end

/** a cylinder along +x from BACK to `end` */
const Rod: React.FC<{ r: number; end: number; y?: number; z?: number; children: React.ReactNode; seg?: number }> = ({ r, end, y = 0, z = 0, children, seg: s = 48 }) => {
  const len = Math.max(0.001, end - BACK);
  return (
    <mesh position={[BACK + len / 2, y, z]} rotation={[0, 0, -Math.PI / 2]} scale={[1, len, 1]}>
      <cylinderGeometry args={[r, r, 1, s]} />
      {children}
    </mesh>
  );
};
const EndRing: React.FC<{ r0: number; r1: number; x: number; color: THREE.Color }> = ({ r0, r1, x, color }) => (
  <mesh position={[x + 0.002, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
    <ringGeometry args={[r0, r1, 96]} />
    <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
  </mesh>
);

const Rig: React.FC<{ t: number }> = ({ t }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  frameCamera(cam);
  const lt = t - T1;
  const a = lerp(0.95, 0.75, eo(seg(lt, 0, 1.6)));
  const d = lerp(7.5, 6.0, eo(seg(lt, 0, 1.6)));
  cam.position.set(Math.sin(a) * d + 0.6, 1.5, Math.cos(a) * d);
  cam.lookAt(0.2, -0.1, 0);
  return null;
};

export const Cable3D: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - T1;
  // each layer slides out of the cut, one after another (stepped cut-away)
  const step = (i: number, final: number) => lerp(0, final, eo(seg(lt, 0.35 + i * 0.12, 0.85 + i * 0.12)));
  const sheathEnd = 0, armourEnd = step(0, 0.45), copperEnd = step(1, 0.9), coreEnd = step(2, 1.35), fibreEnd = step(3, 1.95);
  const fibres: [number, number][] = [[0, 0], ...Array.from({ length: 6 }, (_, k) => {
    const an = (k / 6) * Math.PI * 2;
    return [Math.cos(an) * 0.21, Math.sin(an) * 0.21] as [number, number];
  })];
  const wires = Array.from({ length: 20 }, (_, k) => (k / 20) * Math.PI * 2);
  const fibreGlow = 1.5 + 0.9 * eo(seg(lt, 1.0, 1.4));
  const opacity = eo(seg(lt, 0.15, 0.5));
  const enter = back(seg(lt, 0.1, 0.75));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity, mixBlendMode: "screen" }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, near: 0.05, far: 60, position: [5, 1.5, 5] }} gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <Rig t={t} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={2.4} color="#fff1e0" />
        <pointLight position={[3, -1.5, 2.5]} intensity={18} color="#ff8a1f" distance={12} />
        <group rotation={[0.1, lerp(-0.9, 0, eo(seg(lt, 0.1, 0.9))), -0.06]} scale={0.55 + 0.45 * enter}>
          {/* outer plastic sheath */}
          <Rod r={1.0} end={sheathEnd} seg={96}>
            <meshStandardMaterial color="#1d140e" roughness={0.75} metalness={0.1} />
          </Rod>
          <EndRing r0={0.94} r1={1.0} x={sheathEnd} color={HDR("#f3ece4", 1.6)} />
          {/* steel armour wires */}
          {wires.map((an, k) => (
            <Rod key={k} r={0.075} end={armourEnd} y={Math.cos(an) * 0.84} z={Math.sin(an) * 0.84} seg={20}>
              <meshStandardMaterial color="#d8d0c6" metalness={0.9} roughness={0.28} />
            </Rod>
          ))}
          {/* copper conductor */}
          <Rod r={0.68} end={copperEnd} seg={96}>
            <meshStandardMaterial color="#c8682a" metalness={0.9} roughness={0.3} emissive="#ff6a00" emissiveIntensity={0.08} />
          </Rod>
          <EndRing r0={0.64} r1={0.68} x={copperEnd} color={HDR("#ff8a1f", 2.2)} />
          {/* inner core tube */}
          <Rod r={0.42} end={coreEnd} seg={96}>
            <meshStandardMaterial color="#2a1d14" metalness={0.3} roughness={0.5} />
          </Rod>
          <EndRing r0={0.39} r1={0.42} x={coreEnd} color={HDR("#f3ece4", 1.4)} />
          {/* glass fibres (emissive, bloom) + light pulses */}
          {fibres.map(([y, z], k) => (
            <group key={k}>
              <Rod r={0.075} end={fibreEnd} y={y} z={z} seg={24}>
                <meshBasicMaterial color={HDR("#ff9a3a", fibreGlow)} toneMapped={false} />
              </Rod>
              {[0, 1, 2].map((j) => {
                const ph = ((lt * 0.9 + k * 0.13 + j / 3) % 1 + 1) % 1;
                const x = lerp(BACK, fibreEnd + 0.35, ph);
                if (x > fibreEnd + 0.3 || lt < 1.0) return null;
                return (
                  <mesh key={j} position={[x, y, z]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 3.2, 1]}>
                    <sphereGeometry args={[0.085, 16, 12]} />
                    <meshBasicMaterial color={HDR("#fff1dc", 3)} toneMapped={false} />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={1.1} mipmapBlur radius={0.6} />
        </EffectComposer>
      </ThreeCanvas>
    </div>
  );
};
