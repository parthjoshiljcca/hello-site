import { useMemo } from "react";
import * as THREE from "three";
import { Amygdala, Brain } from "./Brain";
import { BRAIN_CENTER } from "./brainGeometry";
import { CamRig, HDR, Layer, MonoTag, SCN, eio, eo, ev, fin, lerp, sceneAlpha, seg } from "./common";

const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * vnoise(x * f, y * f); a *= 0.5; f *= 2.03; } return s; };

/* ---------- Kailash: a near-symmetric four-faced peak with snow bands, ridges and foothills ---------- */
const mtnVert = /* glsl */ `
varying vec3 vP; varying vec3 vN;
void main(){ vP = position; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const mtnFrag = /* glsl */ `
uniform float uFade;
varying vec3 vP; varying vec3 vN;
void main(){
  vec3 N = normalize(vN);
  float moon = max(dot(N, normalize(vec3(-0.5, 0.6, 0.6))), 0.0);
  float warm = max(dot(N, normalize(vec3(0.7, 0.1, 0.6))), 0.0);
  float ledge = smoothstep(0.55, 0.95, sin(vP.y * 15.0) * 0.5 + 0.5);           // Kailash's horizontal rock bands
  float snow = smoothstep(0.2, 0.6, N.y + 0.15 * sin(vP.x * 11.0 + vP.y * 4.0)) * (1.0 - 0.75 * ledge * step(0.4, vP.y));
  vec3 rock = vec3(0.045, 0.03, 0.028);
  vec3 ice = vec3(0.34, 0.38, 0.5);
  float rim = pow(1.0 - max(N.z, 0.0), 3.0);
  vec3 col = mix(rock, ice, snow) * (0.06 + 0.75 * moon) + vec3(1.0, 0.3, 0.04) * (warm * 0.22 + rim * 0.12);
  gl_FragColor = vec4(col * uFade, uFade);
}`;
const useMountain = () =>
  useMemo(() => {
    const g = new THREE.PlaneGeometry(9, 4.5, 260, 130);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      // Kailash: a square pyramid (rotated 45 deg) with a rounded summit
      const r = Math.max(Math.abs(x * 0.7071 + z * 0.7071), Math.abs(x * 0.7071 - z * 0.7071));
      const peak = Math.max(0, 2.15 - r * 1.35) ** 1.15;
      const hills = 0.55 * fbm(x * 0.7 + 3, z * 0.7) + 0.35 * fbm(x * 1.6, z * 1.6 + 7) - 0.3;
      const ridges = 0.05 * Math.abs(Math.sin((x + z) * 6.0)) * Math.min(1, peak);
      const rocky = (fbm(x * 3.2 + 11, z * 3.2) - 0.5) * 0.35 * Math.min(1, peak) + (fbm(x * 9, z * 9 + 5) - 0.5) * 0.08;
      p.setY(i, Math.max(peak + ridges + rocky, hills) + 0.04 * fbm(x * 6, z * 6));
    }
    g.computeVertexNormals();
    return g;
  }, []);

export const KailashScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 0);
  const geo = useMountain();
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: mtnVert, fragmentShader: mtnFrag, transparent: true, uniforms: { uFade: { value: 1 } } }), []);
  mat.uniforms.uFade.value = eo(seg(t, 0, 1.2));
  const push = eio(seg(t, 0, 6.8));
  const stars = useMemo(() => Array.from({ length: 160 }, (_, i) => [(hash(i, 1) - 0.5) * 10, 1.6 + hash(i, 2) * 3.2, -3 - hash(i, 3) * 2, hash(i, 4)] as const), []);
  const flakes = useMemo(() => Array.from({ length: 90 }, (_, i) => [hash(i, 11), hash(i, 12), hash(i, 13)] as const), []);
  const ring = seg(t, ev.aankhein - 0.2, ev.aankhein + 2.4);
  const glowP = eo(seg(t, ev.aankhein - 0.6, ev.aankhein + 0.2));
  return (
    <>
      <Layer opacity={a} bloom={1.3}>
        <CamRig pos={[0, lerp(0.9, 1.05, push), lerp(6.4, 4.9, push)]} look={[0, lerp(1.0, 1.15, push), 0]} />
        <mesh geometry={geo} material={mat} position={[0, -0.85, -1.6]} scale={[1, 0.82, 1]} />
        {/* moon */}
        <mesh position={[-1.6, 2.6, -2.5]}>
          <sphereGeometry args={[0.13, 32, 24]} />
          <meshBasicMaterial color={HDR("#f3ece4", 1.6)} toneMapped={false} transparent opacity={mat.uniforms.uFade.value} />
        </mesh>
        {stars.map(([x, y, z, k], i) => (
          <mesh key={i} position={[x, y, z]} scale={0.012 + 0.012 * k}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color={HDR("#ffe6c8", 1.0 + 1.6 * k * (0.5 + 0.5 * Math.sin(t * 2 + i)))} toneMapped={false} transparent opacity={mat.uniforms.uFade.value} />
          </mesh>
        ))}
        {/* point of dhyaan at the foot of the summit */}
        {glowP > 0 && (
          <group position={[0, 0.45, -0.3]}>
            <mesh scale={0.06 * glowP}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshBasicMaterial color={HDR("#ff9a3a", 4)} toneMapped={false} />
            </mesh>
            {ring > 0 &&
              [0, 1, 2].map((k) => {
                const ph = (ring * 1.2 + k / 3) % 1;
                return (
                  <mesh key={k} rotation={[-Math.PI / 2 + 0.25, 0, 0]} scale={0.1 + ph * 1.6}>
                    <torusGeometry args={[1, 0.008, 8, 96]} />
                    <meshBasicMaterial color={HDR("#ffb15c", 2.2 * (1 - ph))} toneMapped={false} transparent opacity={1 - ph} />
                  </mesh>
                );
              })}
          </group>
        )}
        {/* falling snow */}
        {flakes.map(([u, v, w], i) => {
          const y = 3.0 - ((t * (0.25 + 0.2 * w) + v * 3) % 3.4);
          return (
            <mesh key={`f${i}`} position={[(u - 0.5) * 4 + 0.2 * Math.sin(t + i), y, 1.2 + w * 1.5]} scale={0.008 + 0.008 * w}>
              <sphereGeometry args={[1, 6, 4]} />
              <meshBasicMaterial color={HDR("#ffffff", 1.2)} toneMapped={false} transparent opacity={0.8 * mat.uniforms.uFade.value} />
            </mesh>
          );
        })}
      </Layer>
      <MonoTag x={540} y={680} a={fin(t, "kailash", 0.5, 0.3) * a}>KAILASH</MonoTag>
    </>
  );
};

/* ---------- Brain: the amygdala calms down, then the prefrontal cortex lights up ---------- */
const PFC: [number, number, number] = [0.78, 0.22, 0.26];
export const BrainScene: React.FC<{ t: number }> = ({ t }) => {
  // one continuous shot across scenes 10 and 11 (no dip at the scene cut)
  const a = seg(t, SCN[9].start, SCN[9].start + 0.3) * (1 - seg(t, SCN[11].start - 0.25, SCN[11].start));
  const enter = eo(seg(t, ev.research - 0.6, ev.research + 0.4));
  const alarmStart = seg(t, ev.alarm - 0.3, ev.alarm + 0.2);
  const calm = eo(seg(t, ev.kam - 0.2, ev.kam + 1.2));
  const red = alarmStart * (1 - calm);
  const flash = red > 0 ? 0.5 + 0.5 * Math.sin(t * 16) : 0;
  const pfc = eo(seg(t, ev.prefrontal - 0.3, ev.prefrontal + 0.8));
  const yaw = lerp(0.35, 0.1, eio(seg(t, ev.focus - 0.5, ev.prefrontal + 0.5))) + 0.04 * Math.sin(t * 0.8);
  const pfcCol = HDR("#ffb15c", 0.4 + 2.2 * pfc * (0.85 + 0.15 * Math.sin(t * 5)));
  return (
    <>
      <Layer opacity={a} bloom={1.3}>
        <CamRig pos={[0, 0.15, 5.6]} look={[0, 0, 0]} />
        <ambientLight intensity={0.5} />
        <group scale={1.0 * enter} rotation={[0.12, yaw, 0]}>
          <Amygdala glow={0.4 + 0.6 * flash * red + 0.2 * (1 - calm)} red={red} />
          {[1, -1].map((s) => (
            <mesh key={s} position={[PFC[0] - BRAIN_CENTER[0], PFC[1] - BRAIN_CENTER[1], PFC[2] * s]} scale={[0.15, 0.2, 0.13]} renderOrder={1}>
              <sphereGeometry args={[1, 40, 28]} />
              <meshBasicMaterial color={pfcCol} toneMapped={false} transparent opacity={0.25 + 0.75 * pfc} />
            </mesh>
          ))}
          <Brain t={t} fade={enter} xray={0.85} alarm={red * 0.5} />
        </group>
      </Layer>
      <MonoTag x={700} y={1060} a={fin(t, "amygdala", 0.4, 0) * a * (1 - pfc * 0.6)}>AMYGDALA {calm > 0.5 ? "· CALM" : "· ALARM"}</MonoTag>
      <MonoTag x={760} y={700} a={fin(t, "prefrontal", 0.4, 0) * a}>PREFRONTAL CORTEX</MonoTag>
    </>
  );
};

/* ---------- Breath orb (calm version of the anxiety video's orb) ---------- */
const orbVert = /* glsl */ `
uniform float uTime;
varying vec3 vN; varying float vD;
void main(){
  float d = sin(position.x*4.1+uTime*1.1)*sin(position.y*3.7-uTime*0.9)*sin(position.z*4.6+uTime*1.0)*0.04;
  vD = d; vec3 p = position + normal * d;
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const orbFrag = /* glsl */ `
varying vec3 vN; varying float vD;
void main(){
  float rim = pow(1.0 - abs(vN.z), 2.0);
  vec3 c = vec3(1.0, 0.45, 0.08);
  gl_FragColor = vec4(c * (0.25 + 2.4 * rim) + c * vD * 4.0, 0.35 + 0.65 * rim);
}`;
export const BreathScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 15);
  const inh = eio(seg(t, ev.band - 0.3, ev.mehsoos - 0.2));
  const exh = eio(seg(t, ev.mehsoos - 0.2, ev.mehsoos + 1.8));
  const breath = inh * (1 - exh * 0.85);
  const scale = (0.8 + 0.35 * breath) * eo(seg(t, ev.paanch - 0.9, ev.paanch));
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: orbVert, fragmentShader: orbFrag, transparent: true, depthWrite: false, toneMapped: false, uniforms: { uTime: { value: 0 } } }), []);
  mat.uniforms.uTime.value = t;
  const label = t < ev.band - 0.3 ? null : t < ev.mehsoos - 0.2 ? "SAANS LO" : "SAANS CHHODO";
  return (
    <>
      <Layer opacity={a} bloom={1.4}>
        <CamRig pos={[0, 0, 6]} look={[0, 0, 0]} />
        <group scale={scale}>
          <mesh material={mat}>
            <icosahedronGeometry args={[1, 64]} />
          </mesh>
          <mesh scale={0.55}>
            <sphereGeometry args={[1, 48, 32]} />
            <meshBasicMaterial color={HDR("#ffb15c", 1.6 + breath)} toneMapped={false} transparent opacity={0.5} />
          </mesh>
        </group>
        {Array.from({ length: 36 }, (_, i) => {
          const an = (i / 36) * Math.PI * 2 + t * 0.3;
          const r = 1.55 * scale + 0.08 * Math.sin(t * 2 + i);
          return (
            <mesh key={i} position={[Math.cos(an) * r, Math.sin(an) * r * 0.35, Math.sin(an) * 0.6]} scale={0.022}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshBasicMaterial color={HDR("#ffb15c", 2.2)} toneMapped={false} />
            </mesh>
          );
        })}
      </Layer>
      {label && <MonoTag x={540} y={930} a={a}>{label}</MonoTag>}
    </>
  );
};
