import { useMemo } from "react";
import * as THREE from "three";
import { Almond, Amygdala, AMYG, Brain } from "./Brain";
import { BRAIN_CENTER } from "./brainGeometry";
import { Badge, CamRig, HDR, Layer, MonoTag, back, eio, eo, ev, fin, lerp, pop, project, sceneAlpha, seg } from "./common";

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[-2, 3, 4]} intensity={2.2} color="#ffd9b0" />
    <pointLight position={[2, -1, 3]} intensity={6} color="#ff8a1f" />
  </>
);

/* ---------- Scene 2: "dimaag ka chhota hissa ... amygdala ... baadaam jitna ... alarm system" ---------- */
export const AmygdalaScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 1);
  const enter = eo(seg(t, ev.dimaag - 1.2, ev.dimaag - 0.2));
  const xray = eio(seg(t, ev.amygdala - 0.9, ev.amygdala + 0.2));
  const glow = eo(seg(t, ev.amygdala - 0.4, ev.amygdala + 0.3));
  const zoom = eio(seg(t, ev.baadaam - 0.6, ev.baadaam + 0.8));
  const alarm = seg(t, ev.alarm - 0.1, ev.alarm + 0.3);
  const flash = alarm > 0 ? 0.5 + 0.5 * Math.sin((t - ev.alarm) * 18) : 0;
  const yaw = lerp(-0.5, 0.15, eo(seg(t, ev.dimaag - 1.2, ev.amygdala + 0.4))) + 0.05 * Math.sin(t * 0.8);
  const cam: [number, number, number] = [lerp(0, 0.6, zoom), lerp(0.25, 0.0, zoom), lerp(6.4, 4.3, zoom)];
  const look: [number, number, number] = [lerp(0, 0.4, zoom), lerp(0.05, -0.15, zoom), 0];
  const almondP = back(seg(t, ev.baadaam - 0.05, ev.baadaam + 0.5));
  const S = 1.3 * enter;
  // screen position of the amygdala label
  const amW = new THREE.Vector3(AMYG[0], AMYG[1], AMYG[2]).applyEuler(new THREE.Euler(0.12, yaw, 0)).multiplyScalar(1.3);
  const sp = project(amW, cam, look);
  return (
    <>
      <Layer opacity={a} bloom={1.25}>
        <CamRig pos={cam} look={look} />
        <Lights />
        <group scale={S} rotation={[0.12, yaw, 0]}>
          <Amygdala glow={glow * (1 + 0.6 * flash)} red={alarm * flash} />
          <Brain t={t} fade={enter} xray={xray} alarm={alarm * 0.6} />
          {/* alarm rings */}
          {alarm > 0 &&
            [0, 1, 2].map((i) => {
              const ph = ((t - ev.alarm) * 0.9 + i / 3) % 1;
              return (
                <mesh key={i} position={[AMYG[0] - BRAIN_CENTER[0], AMYG[1] - BRAIN_CENTER[1], AMYG[2]]} scale={0.1 + ph * 0.9}>
                  <torusGeometry args={[1, 0.012, 12, 96]} />
                  <meshBasicMaterial color={HDR("#ff3a1a", 2.5 * (1 - ph))} toneMapped={false} transparent opacity={1 - ph} />
                </mesh>
              );
            })}
        </group>
        {almondP > 0 && (
          <group position={[1.05, 0.25, 0.9]} scale={0.2 * almondP} rotation={[0.3, t * 0.8, -0.5]}>
            <Almond />
          </group>
        )}
      </Layer>
      <MonoTag x={sp.x} y={sp.y + 70} a={glow * a}>AMYGDALA</MonoTag>
      {almondP > 0 && <MonoTag x={820} y={660} a={Math.min(1, almondP) * a}>≈ BAADAAM SIZE</MonoTag>}
      <MonoTag x={540} y={640} a={fin(t, "dimaag", 0.4, 0) * a * (1 - glow)}>DIMAAG</MonoTag>
    </>
  );
};

/* ---------- Scene 4: "sher dikhte hi amygdala alarm bajaata, adrenaline aur cortisol" ---------- */
const Gland: React.FC<{ x: number; glow: number }> = ({ x, glow }) => (
  <group position={[x, -0.6, 0]}>
    {/* kidney bean */}
    <mesh scale={[0.2, 0.3, 0.16]} rotation={[0, 0, x > 0 ? -0.25 : 0.25]}>
      <sphereGeometry args={[1, 40, 28]} />
      <meshStandardMaterial color="#6a2a18" roughness={0.6} emissive="#ff5a1a" emissiveIntensity={0.15} />
    </mesh>
    {/* adrenal gland cap */}
    <mesh position={[x > 0 ? -0.05 : 0.05, 0.3, 0]} scale={[0.17, 0.12, 0.12]}>
      <coneGeometry args={[1, 1.2, 32]} />
      <meshBasicMaterial color={HDR("#ffb15c", 0.6 + 2.6 * glow)} toneMapped={false} />
    </mesh>
  </group>
);
export const AlarmScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 3);
  const enter = eo(seg(t, ev.sher2 - 0.4, ev.sher2 + 0.4));
  const alarm = seg(t, ev.alarm2 - 0.2, ev.alarm2 + 0.2);
  const flash = alarm > 0 ? 0.5 + 0.5 * Math.sin((t - ev.alarm2) * 18) : 0;
  const sig = seg(t, ev.alarm2 + 0.2, ev.adrenaline - 0.3);
  const ad = seg(t, ev.adrenaline - 0.1, ev.adrenaline + 2.5), co = seg(t, ev.cortisol - 0.1, ev.cortisol + 2.0);
  const parts = useMemo(() => {
    let s = 7;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    return Array.from({ length: 70 }, () => ({ an: r() * Math.PI * 2, sp: 0.6 + r() * 0.9, off: r(), z: (r() - 0.5) * 0.8, kind: r() < 0.5 ? 0 : 1, side: r() < 0.5 ? -1 : 1 }));
  }, []);
  const amyg = new THREE.Vector3(AMYG[0] - BRAIN_CENTER[0], AMYG[1] - BRAIN_CENTER[1], AMYG[2]).multiplyScalar(0.6).add(new THREE.Vector3(0, 0.68, 0));
  const path = new THREE.CatmullRomCurve3([amyg, new THREE.Vector3(0.05, 0.15, 0.1), new THREE.Vector3(0, -0.2, 0.1), new THREE.Vector3(0, -0.3, 0.1)]);
  const head = path.getPoint(Math.min(1, sig));
  return (
    <>
      <Layer opacity={a} bloom={1.3}>
        <CamRig pos={[0, 0, 6.2]} look={[0, -0.1, 0]} />
        <Lights />
        <group position={[0, 0.68, 0]} scale={0.6 * enter} rotation={[0.12, 0.15 + 0.05 * Math.sin(t), 0]}>
          <Amygdala glow={0.6 + flash} red={alarm} scale={1.4} />
          <Brain t={t} fade={enter} xray={0.85} alarm={alarm} />
        </group>
        {/* nerve signal down to the adrenals */}
        {sig > 0 && (
          <>
            <mesh>
              <tubeGeometry args={[path, 80, 0.012, 8, false]} />
              <meshBasicMaterial color={HDR("#ff8a1f", 1.2)} toneMapped={false} transparent opacity={0.6} />
            </mesh>
            {sig < 1 && (
              <mesh position={head}>
                <sphereGeometry args={[0.05, 24, 16]} />
                <meshBasicMaterial color={HDR("#ff3a1a", 4)} toneMapped={false} />
              </mesh>
            )}
          </>
        )}
        <group scale={enter}>
          <Gland x={-0.45} glow={Math.max(ad, co)} />
          <Gland x={0.45} glow={Math.max(ad, co)} />
        </group>
        {/* hormone particles erupting from the glands and spreading through the body */}
        {parts.map((p, i) => {
          const k = p.kind === 0 ? ad : co;
          if (k <= 0) return null;
          const ph = (k * p.sp + p.off * 0.3) % 1;
          const r = 0.15 + ph * 1.5;
          const x = p.side * 0.45 + Math.cos(p.an) * r, y = -0.4 + Math.sin(p.an) * r * 0.6 + ph * 0.3;
          return (
            <mesh key={i} position={[x, y, p.z]} scale={0.03 * (1 - ph * 0.5)}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshBasicMaterial color={HDR(p.kind === 0 ? "#ff5a1a" : "#ffcf6a", 3 * (1 - ph))} toneMapped={false} transparent opacity={1 - ph} />
            </mesh>
          );
        })}
      </Layer>
      <MonoTag x={540} y={1125} a={eo(seg(t, ev.alarm2 + 0.6, ev.alarm2 + 1.0)) * a}>ADRENAL GLANDS</MonoTag>
      <Badge x={850} y={760} p={pop(t, "alarm2", 0.45, 0) * a} fs={26}>ALARM!</Badge>
    </>
  );
};

/* ---------- Scene 10: breath orb ("shaant ... dheere saans lo ... saans chhodne mein zyada time ... safe") ---------- */
const orbVert = /* glsl */ `
uniform float uTime; uniform float uJitter;
varying vec3 vN; varying float vD;
float h(vec3 p){ return sin(p.x*4.1+uTime*3.1)*sin(p.y*3.7-uTime*2.3)*sin(p.z*4.6+uTime*2.7); }
void main(){
  float d = h(position*1.3) * (0.03 + 0.16*uJitter) + sin(uTime*23.0+position.y*9.0)*0.02*uJitter;
  vD = d;
  vec3 p = position + normal * d;
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const orbFrag = /* glsl */ `
uniform float uCalm; uniform float uFade;
varying vec3 vN; varying float vD;
void main(){
  float rim = pow(1.0 - abs(vN.z), 2.0);
  vec3 anx = vec3(1.0, 0.06, 0.02);
  vec3 calm = vec3(1.0, 0.45, 0.08);
  vec3 c = mix(anx, calm, uCalm);
  vec3 col = c * (0.25 + 2.4 * rim) + c * vD * 4.0;
  gl_FragColor = vec4(col * uFade, (0.35 + 0.65 * rim) * uFade);
}`;
export const BreathScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 9);
  const calm = eo(seg(t, ev.shaant - 0.3, ev.dheere + 0.5));
  const jitter = 1 - calm;
  // inhale (grow) from "dheere" for 1.5 s, then a long slow exhale (shrink) through the end
  const inh = eio(seg(t, ev.dheere - 0.2, ev.chhodne - 0.1));
  const exh = eio(seg(t, ev.chhodne - 0.1, ev.safe + 0.2));
  const breath = inh * (1 - exh * 0.85);
  const scale = (0.8 + 0.35 * breath) * eo(seg(t, ev.achhi - 1.5, ev.achhi - 0.6));
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: orbVert, fragmentShader: orbFrag, transparent: true, depthWrite: false, toneMapped: false, uniforms: { uTime: { value: 0 }, uJitter: { value: 1 }, uCalm: { value: 0 }, uFade: { value: 1 } } }),
    [],
  );
  mat.uniforms.uTime.value = t;
  mat.uniforms.uJitter.value = jitter;
  mat.uniforms.uCalm.value = calm;
  mat.uniforms.uFade.value = 1;
  const label = t < ev.dheere - 0.2 ? null : t < ev.chhodne - 0.1 ? "SAANS LO" : "SAANS CHHODO";
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
            <meshBasicMaterial color={HDR(calm > 0.5 ? "#ffb15c" : "#ff3a1a", 1.6 + breath)} toneMapped={false} transparent opacity={0.5} />
          </mesh>
        </group>
        {/* orbit of calm particles */}
        {Array.from({ length: 36 }, (_, i) => {
          const an = (i / 36) * Math.PI * 2 + t * (0.3 + jitter * 1.2);
          const r = 1.55 * scale + 0.08 * Math.sin(t * 2 + i) + jitter * 0.12 * Math.sin(t * 19 + i * 3);
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
