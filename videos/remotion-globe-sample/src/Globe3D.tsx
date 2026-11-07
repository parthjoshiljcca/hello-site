import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import * as THREE from "three";
import land from "./data/land.json";
import {
  CHE, FOV, MUM, R1, R2, applyCamera, back, ev, globeState, satelliteWorld, seg, v3, eo,
  type GlobeState,
} from "./anim";

const HDR = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

const CameraRig: React.FC<{ g: GlobeState }> = ({ g }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  applyCamera(cam, g);
  return null;
};

function routeCurve(pts: [number, number][], r = 1.014, steps = 24) {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = v3(...pts[i]).normalize(), b = v3(...pts[i + 1]).normalize();
    for (let s = 0; s < steps; s++) out.push(a.clone().lerp(b, s / steps).normalize().multiplyScalar(r));
  }
  out.push(v3(...pts[pts.length - 1], r));
  return new THREE.CatmullRomCurve3(out);
}

const Cable: React.FC<{ pts: [number, number][]; p: number }> = ({ pts, p }) => {
  const SEG = 480, RS = 8;
  const { curve, geo } = useMemo(() => {
    const curve = routeCurve(pts);
    return { curve, geo: new THREE.TubeGeometry(curve, SEG, 0.0075, RS, false) };
  }, [pts]);
  geo.setDrawRange(0, Math.floor(p * SEG) * RS * 6);
  const head = curve.getPointAt(Math.min(Math.max(p, 0.0001), 1));
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={HDR("#ff9a3a", 2.6)} toneMapped={false} />
      </mesh>
      {p > 0.001 && p < 0.999 && (
        <mesh position={head}>
          <sphereGeometry args={[0.02, 16, 12]} />
          <meshBasicMaterial color={HDR("#fff1dc", 5)} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

const Pin: React.FC<{ ll: [number, number]; p: number; t: number }> = ({ ll, p, t }) => {
  const { pos, quat } = useMemo(() => {
    const pos = v3(ll[0], ll[1], 1.006);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
    return { pos, quat };
  }, [ll]);
  if (p <= 0) return null;
  const pr = (t * 1.4) % 1;
  return (
    <group position={pos} quaternion={quat} scale={back(Math.min(1, p))}>
      <mesh>
        <circleGeometry args={[0.016, 24]} />
        <meshBasicMaterial color={HDR("#fff1dc", 4)} toneMapped={false} />
      </mesh>
      <mesh scale={1 + pr * 3}>
        <ringGeometry args={[0.022, 0.028, 40]} />
        <meshBasicMaterial color={HDR("#ff8a1f", 2.2)} transparent opacity={(1 - pr) * 0.9} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Fresnel rim glow (custom shader), drawn on the back faces of a slightly larger sphere */
const Atmosphere: React.FC = () => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vN; void main(){ float i = pow(clamp(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 0.0, 1.0), 3.0); gl_FragColor = vec4(vec3(1.0,0.45,0.08) * i * 0.75, i); }`,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
      }),
    [],
  );
  return (
    <mesh material={mat} scale={1.2}>
      <sphereGeometry args={[1, 64, 48]} />
    </mesh>
  );
};

const Satellite: React.FC<{ t: number }> = ({ t }) => {
  const appear = back(seg(t, ev.hawa - 0.15, ev.hawa + 0.3));
  const gone = eo(seg(t, ev.nahi + 0.05, ev.samundar + 0.2)); // tumbles away after "nahi"
  if (appear <= 0 || gone >= 1) return null;
  const p = satelliteWorld(t).add(new THREE.Vector3(gone * 0.9, gone * 0.6, gone * 0.4));
  return (
    <group position={p} rotation={[0.35 + gone * 4, t * 0.6 + gone * 3, -0.4 + gone * 2]} scale={1.7 * appear * (1 - gone * 0.6)}>
      <mesh>
        <boxGeometry args={[0.16, 0.12, 0.12]} />
        <meshStandardMaterial color="#d9d0c5" metalness={0.7} roughness={0.35} />
      </mesh>
      {[-1, 1].map((d) => (
        <group key={d}>
          <mesh position={[d * 0.2, 0, 0]}>
            <boxGeometry args={[0.04, 0.012, 0.012]} />
            <meshStandardMaterial color="#d9d0c5" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[d * 0.36, 0, 0]}>
            <boxGeometry args={[0.28, 0.11, 0.006]} />
            <meshStandardMaterial color="#2b170b" emissive="#ff8a1f" emissiveIntensity={0.55} metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.06, 0.06, 24, 1, true]} />
        <meshStandardMaterial color="#ff8a1f" emissive="#ff8a1f" emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const GlobeBody: React.FC<{ g: GlobeState; t: number }> = ({ g, t }) => {
  const { dots, grid, gridMat, dotMat } = useMemo(() => {
    const dc = document.createElement("canvas");
    dc.width = dc.height = 32;
    const dx = dc.getContext("2d")!;
    const gr = dx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "#fff"); gr.addColorStop(0.55, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    dx.fillStyle = gr; dx.fillRect(0, 0, 32, 32);
    const L = land as number[];
    const pos: number[] = [], col: number[] = [];
    const cW = new THREE.Color("#e9ddd0"), cO = HDR("#ff8a1f", 1.9); // India dots exceed 1.0 -> they bloom
    for (let i = 0; i < L.length; i += 3) {
      const p = v3(L[i], L[i + 1], 1.004);
      pos.push(p.x, p.y, p.z);
      const c = L[i + 2] ? cO : cW;
      col.push(c.r, c.g, c.b);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    dg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const dotMat = new THREE.PointsMaterial({ size: 0.022, map: new THREE.CanvasTexture(dc), vertexColors: true, transparent: true, depthWrite: false, toneMapped: false });
    const gridMat = new THREE.LineBasicMaterial({ color: "#ff8a1f", transparent: true, opacity: 0 });
    const grid = new THREE.Group();
    for (let la = -60; la <= 75; la += 15) {
      const p: THREE.Vector3[] = [];
      for (let lo = 0; lo <= 360; lo += 4) p.push(v3(lo, la, 1.002));
      grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), gridMat));
    }
    for (let lo = 0; lo < 360; lo += 15) {
      const p: THREE.Vector3[] = [];
      for (let la = -90; la <= 90; la += 4) p.push(v3(lo, la, 1.002));
      grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), gridMat));
    }
    return { dots: new THREE.Points(dg, dotMat), grid, gridMat, dotMat };
  }, []);
  dotMat.opacity = g.dots;
  gridMat.opacity = 0.16 * g.grid;
  const mumP = seg(t, ev.samundar + 0.62, ev.samundar + 1.12);
  const cheP = seg(t, ev.neeche + 0.3, ev.neeche + 0.8);
  return (
    <group rotation={[(g.lat * Math.PI) / 180, 0, 0]} scale={g.scale}>
      <Atmosphere />
      <group rotation={[0, (-g.lon * Math.PI) / 180, 0]}>
        <mesh>
          <sphereGeometry args={[0.995, 96, 64]} />
          <meshBasicMaterial color="#140d08" />
        </mesh>
        <primitive object={grid} />
        <primitive object={dots} />
        <Cable pts={R1} p={g.c1} />
        <Cable pts={R2} p={g.c2} />
        <Pin ll={MUM} p={mumP} t={t} />
        <Pin ll={CHE} p={cheP} t={t} />
      </group>
    </group>
  );
};

export const Globe3D: React.FC<{ t: number }> = ({ t }) => {
  const g = globeState(t);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: g.alpha, mixBlendMode: "screen" }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, near: 0.01, far: 50, position: [0, 0, 6] }} gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#fff1e0" />
        <pointLight position={[2, -1, 3]} intensity={6} color="#ff8a1f" />
        <CameraRig g={g} />
        <GlobeBody g={g} t={t} />
        <Satellite t={t} />
        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={1.0} mipmapBlur radius={0.6} />
        </EffectComposer>
      </ThreeCanvas>
    </div>
  );
};
