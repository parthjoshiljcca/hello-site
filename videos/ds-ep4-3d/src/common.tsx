import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import timing from "./data/timing.json";

export const ev = timing.ev as Record<string, number>;
export const SCN = timing.scenes as { start: number; end: number }[];

export const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const ein = (x: number) => x * x * x;
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const back = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return x <= 0 ? 0 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** event-relative progress, like the 2D pipeline's pop()/fin() */
export const pop = (t: number, e: string, d = 0.45, off = -0.08) => back(seg(t, ev[e] + off, ev[e] + off + d));
export const fin = (t: number, e: string, d = 0.5, off = -0.08) => eo(seg(t, ev[e] + off, ev[e] + off + d));
/** scene fade like the 2D pipeline: 0.3 s in, 0.25 s out */
export const sceneAlpha = (t: number, i: number) => { const s = SCN[i]; const lt = t - s.start, d = s.end - s.start; return seg(lt, 0, 0.3) * (1 - seg(lt, d - 0.25, d)); };
export const HDR = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

/* Full-frame perspective camera: a 1080px-tall square spans 30 deg and the view is offset so world (0,0,0) sits at y=930. */
const RAD = Math.PI / 180;
export const FULL_FOV = (2 * Math.atan(Math.tan(15 * RAD) * (1920 / 1080))) / RAD;
export function frameCamera(cam: THREE.PerspectiveCamera) {
  cam.fov = FULL_FOV; cam.aspect = 1080 / 1920;
  cam.setViewOffset(1080, 1920, 0, 960 - 930, 1080, 1920);
  cam.updateProjectionMatrix();
}
export const CamRig: React.FC<{ pos: [number, number, number]; look?: [number, number, number]; roll?: number }> = ({ pos, look = [0, 0, 0], roll = 0 }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  frameCamera(cam);
  cam.position.set(...pos);
  cam.lookAt(...look);
  cam.rotation.z += roll;
  cam.updateMatrixWorld(true);
  return null;
};
const projCam = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
export function project(p: THREE.Vector3, pos: [number, number, number], look: [number, number, number] = [0, 0, 0], roll = 0) {
  frameCamera(projCam); projCam.position.set(...pos); projCam.lookAt(...look); projCam.rotation.z += roll; projCam.updateMatrixWorld(true);
  const s = p.clone().project(projCam);
  return { x: ((s.x + 1) / 2) * 1080, y: ((1 - s.y) / 2) * 1920 };
}

const MASK = "linear-gradient(to bottom, transparent 0px, transparent 505px, #000 585px, #000 1235px, transparent 1296px)";
/** Full-frame transparent 3D layer with bloom (bright > 1.0 glows), composited over the 2D base video */
export const Layer: React.FC<{ opacity: number; children: React.ReactNode; bloom?: number }> = ({ opacity, children, bloom = 1.1 }) => (
  // masked to the illustration band so the header, title, tag and captions of the 2D base always stay readable
  <div style={{ position: "absolute", inset: 0, opacity, WebkitMaskImage: MASK, maskImage: MASK }}>
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, near: 0.01, far: 100, position: [0, 0, 6] }} gl={{ alpha: true, premultipliedAlpha: true, antialias: true }}>
      {children}
      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.25} intensity={bloom} mipmapBlur radius={0.6} />
      </EffectComposer>
    </ThreeCanvas>
  </div>
);

/* ---------- Why Spaces 2D labels (same look as the locked style) ---------- */
export const MonoTag: React.FC<{ x: number; y: number; a: number; children: React.ReactNode }> = ({ x, y, a, children }) =>
  a <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: Math.min(1, a), fontFamily: "J", fontSize: 22, letterSpacing: 2, color: "#ff9b3d", border: "1.5px solid rgba(255,138,31,.6)", borderRadius: 8, padding: "6px 15px", background: "rgba(20,12,8,.85)", whiteSpace: "nowrap" }}>{children}</div>
  );
export const Badge: React.FC<{ x: number; y: number; p: number; fs?: number; children: React.ReactNode }> = ({ x, y, p, fs = 30, children }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, opacity: Math.min(1, p * 1.5), fontFamily: "M", fontWeight: 800, fontSize: fs, color: "#ffb15c", border: "2.5px solid #ff8a1f", borderRadius: fs, padding: `${fs * 0.3}px ${fs * 0.85}px`, background: "rgba(255,138,31,.14)", boxShadow: "0 0 16px rgba(255,138,31,.6), inset 0 0 12px rgba(255,138,31,.15)", whiteSpace: "nowrap" }}>{children}</div>
  );
