import { useMemo } from "react";
import * as THREE from "three";
import { HDR, back, seg } from "./common";

/* deterministic value noise for surface bumps */
const hash = (x: number, y: number, z: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };

/** lemon: an egg-ish ellipsoid with pointed ends and dimpled peel */
const useLemon = () =>
  useMemo(() => {
    const g = new THREE.SphereGeometry(1, 96, 64);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const tip = Math.pow(Math.abs(x), 8) * 0.28; // nipples at both ends
      const dimple = (hash(Math.round(x * 40), Math.round(y * 40), Math.round(z * 40)) - 0.5) * 0.012;
      const k = 1 + dimple;
      p.setXYZ(i, x * (1.3 + tip) * k, y * 1.0 * k, z * 1.0 * k);
    }
    g.computeVertexNormals();
    return g;
  }, []);

/** green chilli: a tapered, gently curved tube with a cap */
const useChilli = () =>
  useMemo(() => {
    const pts = Array.from({ length: 12 }, (_, i) => { const u = i / 11; return new THREE.Vector3(Math.sin(u * 1.2) * 0.18, -u * 1.0, Math.sin(u * 2.3) * 0.04); });
    const curve = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curve, 48, 0.085, 16, false);
    const p = g.attributes.position as THREE.BufferAttribute;
    // taper: scale radius by distance along the curve (tube vertices are laid out ring by ring)
    const rings = 49, per = 17;
    for (let r = 0; r < rings; r++) {
      const u = r / (rings - 1);
      const c = curve.getPoint(u);
      const k = u < 0.08 ? 0.75 + u * 3 : 1 - Math.pow(u, 2.2) * 0.92;
      for (let j = 0; j < per; j++) {
        const i = r * per + j;
        p.setXYZ(i, c.x + (p.getX(i) - c.x) * k, c.y + (p.getY(i) - c.y) * k, c.z + (p.getZ(i) - c.z) * k);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);

/** The nimbu-mirchi totka: thread, a lemon, 7 green chillies threaded below, and a charcoal bead at the bottom.
 *  `build` 0..1 assembles it (lemon, then chillies one by one). */
export const Totka: React.FC<{ t: number; build?: number; chilliT?: number }> = ({ t, build = 1, chilliT }) => {
  const lemon = useLemon();
  const chilli = useChilli();
  const swing = 0.16 * Math.sin(t * 1.7) + 0.04 * Math.sin(t * 3.1);
  const lemonP = back(seg(build, 0, 0.35));
  return (
    <group rotation={[0, 0, swing]}>
      {/* thread from the top hook */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 3.2, 8]} />
        <meshStandardMaterial color="#e9e2d6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.015, 10, 32]} />
        <meshStandardMaterial color="#c9a46a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* lemon */}
      {lemonP > 0 && (
        <mesh geometry={lemon} position={[0, 0.95, 0]} rotation={[0, t * 0.4, Math.PI / 2]} scale={0.3 * lemonP}>
          <meshStandardMaterial color="#e3d23a" roughness={0.45} emissive="#4a3a00" emissiveIntensity={0.35} />
        </mesh>
      )}
      {/* 7 chillies, alternating sides */}
      {Array.from({ length: 7 }, (_, i) => {
        const p = chilliT === undefined ? back(seg(build, 0.35 + i * 0.08, 0.5 + i * 0.08)) : back(seg(chilliT, i * 0.12, i * 0.12 + 0.35));
        if (p <= 0) return null;
        const y = 0.55 - i * 0.2;
        const side = i % 2 ? 1 : -1;
        return (
          <group key={i} position={[0, y, 0]} rotation={[0, i * 0.9, side * 1.15 + 0.06 * Math.sin(t * 2 + i)]} scale={0.7 * p}>
            <mesh geometry={chilli}>
              <meshStandardMaterial color="#3f9a24" roughness={0.35} emissive="#0c2a04" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.055, 0.07, 0.07, 16]} />
              <meshStandardMaterial color="#2b5e14" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      {/* charcoal at the bottom */}
      {build > 0.95 && (
        <mesh position={[0, -1.0, 0]} scale={[0.09, 0.1, 0.08]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} flatShading />
        </mesh>
      )}
    </group>
  );
};

/** Turkish-style glass nazar bead: dark-blue glass disc with white, light-blue and black-pupil rings. */
export const NazarBead: React.FC<{ t: number }> = ({ t }) => {
  const rings: [number, string, number, number][] = [
    [1.0, "#0b3d91", 0.0, 0.32], // body
    [0.62, "#f4f6ff", 0.05, 0.3],
    [0.46, "#58b6ff", 0.09, 0.28],
    [0.24, "#05070d", 0.12, 0.26],
  ];
  return (
    <group rotation={[0.2 * Math.sin(t * 0.7), 0.55 * Math.sin(t * 0.9), 0.1]}>
      {rings.map(([r, c, z, h], i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
          <cylinderGeometry args={[r, r * (i === 0 ? 0.96 : 1), h, 96, 1]} />
          {i === 0 ? (
            <meshPhysicalMaterial color={c} roughness={0.08} metalness={0} clearcoat={1} clearcoatRoughness={0.05} emissive="#0a2a6a" emissiveIntensity={0.5} />
          ) : (
            <meshPhysicalMaterial color={c} roughness={0.12} clearcoat={1} emissive={c} emissiveIntensity={i === 3 ? 0 : 0.25} />
          )}
        </mesh>
      ))}
      {/* back face */}
      {rings.map(([r, c, z, h], i) => (
        <mesh key={`b${i}`} position={[0, 0, -z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r, r, h, 96, 1]} />
          <meshPhysicalMaterial color={c} roughness={0.1} clearcoat={1} emissive={i === 0 ? "#0a2a6a" : c} emissiveIntensity={i === 3 ? 0 : 0.25} />
        </mesh>
      ))}
      {/* glint */}
      <mesh position={[-0.35, 0.4, 0.3]} scale={[0.12, 0.05, 0.01]} rotation={[0, 0, 0.6]}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshBasicMaterial color={HDR("#ffffff", 2.5)} toneMapped={false} />
      </mesh>
      {/* hanging loop */}
      <mesh position={[0, 1.08, 0]}>
        <torusGeometry args={[0.1, 0.025, 12, 32]} />
        <meshStandardMaterial color="#d6b66a" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
};

export const WarmLights: React.FC = () => (
  <>
    <ambientLight intensity={0.6} />
    <directionalLight position={[-2.5, 3, 4]} intensity={2.6} color="#ffe2bf" />
    <pointLight position={[2.2, -0.5, 2.5]} intensity={10} color="#ff8a1f" />
    <pointLight position={[-2, -1.5, 1.5]} intensity={4} color="#ffb15c" />
  </>
);
