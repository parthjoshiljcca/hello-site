import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HDR } from "./common";

/** soft studio reflections so metal and glaze read as real materials */
export const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => { scene.environment = null; tex.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
};

export const WarmLights: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <>
    <ambientLight intensity={0.25 * k} />
    <directionalLight position={[-3, 5, 4]} intensity={2.6 * k} color="#fff0dc" />
    <pointLight position={[3, 0.5, 2.5]} intensity={14 * k} color="#ff8a1f" distance={12} />
    <directionalLight position={[0, 2, -5]} intensity={1.6 * k} color="#ffb15c" />
  </>
);

/* deterministic hash */
const h1 = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

/** clay kulhad (lathe), slightly irregular terracotta with throwing rings, filled with chai */
export const Kulhad: React.FC<{ liquid?: string; rot?: number }> = ({ liquid = "#5a250c", rot = 0 }) => {
  const { geo, mat } = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const prof: [number, number][] = [[0.0, -0.75], [0.56, -0.75], [0.6, -0.7], [0.88, 0.7], [0.93, 0.76], [0.86, 0.78], [0.8, 0.7], [0.53, -0.62], [0.0, -0.62]];
    for (let i = 0; i < prof.length - 1; i++) {
      const [r0, y0] = prof[i], [r1, y1] = prof[i + 1];
      const n = i === 2 || i === 6 ? 40 : 4;
      for (let k = 0; k < n; k++) { const u = k / n; const y = lerpN(y0, y1, u); const ring = (i === 2 ? 1 : 0) * 0.008 * Math.sin(y * 70); pts.push(new THREE.Vector2(lerpN(r0, r1, u) + ring, y)); }
    }
    pts.push(new THREE.Vector2(...prof[prof.length - 1]));
    const geo = new THREE.LatheGeometry(pts, 96);
    // hand-made irregularity + clay colour variation
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const base = new THREE.Color("#a5482a"), dark = new THREE.Color("#6e2a16");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const an = Math.atan2(z, x);
      const w = 1 + 0.012 * Math.sin(an * 3 + y * 2) + 0.006 * Math.sin(an * 11 + 1.3);
      pos.setXYZ(i, x * w, y, z * w);
      const c = base.clone().lerp(dark, 0.25 + 0.35 * h1(Math.floor(an * 40) + Math.floor(y * 60) * 7.3));
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0, envMapIntensity: 0.35 });
    return { geo, mat };
  }, []);
  return (
    <group rotation={[0, rot, 0]}>
      <mesh geometry={geo} material={mat} />
      <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.835, 64]} />
        <meshStandardMaterial color={liquid} roughness={0.42} metalness={0} envMapIntensity={0.25} />
      </mesh>
      {/* glowing chai rim line, the brand's orange accent */}
      <mesh position={[0, 0.605, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.835, 96]} />
        <meshBasicMaterial color={HDR("#ff8a1f", 1.6)} toneMapped={false} transparent opacity={0.8} />
      </mesh>
    </group>
  );
};
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

/** frame-driven steam: soft particles rising and swirling (no self-running animation) */
export const Steam: React.FC<{ t: number; y?: number; spread?: number; height?: number; n?: number; a?: number; size?: number }> = ({ t, y = 0.6, spread = 0.45, height = 1.7, n = 160, a = 1, size = 0.85 }) => {
  const { pts, mat, geo } = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const x = c.getContext("2d")!; const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,.7)"); g.addColorStop(0.45, "rgba(255,255,255,.22)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const mat = new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, opacity: 0.22 });
    return { pts: new THREE.Points(geo, mat), mat, geo };
  }, [n, size]);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const cc = geo.attributes.color as THREE.BufferAttribute;
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.32 + h1(i)) % 1;
    const sw = Math.sin(ph * 7 + h1(i + 50) * 6 + t * 0.8) * 0.18 * ph;
    const r = spread * Math.sqrt(h1(i + 9)) * (1 - ph * 0.5);
    const an = h1(i + 3) * Math.PI * 2;
    p.setXYZ(i, Math.cos(an) * r + sw, y + ph * height, Math.sin(an) * r + sw * 0.5);
    const f = Math.sin(Math.PI * ph); // additive: darker = more transparent, so particles fade in and out
    cc.setXYZ(i, 1.0 * f, 0.82 * f, 0.66 * f);
  }
  p.needsUpdate = true;
  cc.needsUpdate = true;
  mat.opacity = 0.075 * a;
  return <primitive object={pts} />;
};
