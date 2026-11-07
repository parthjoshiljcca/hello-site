import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import * as THREE from "three";
import { BRAIN_H, BRAIN_W, buildBrain } from "./brainGeometry";

const vert = /* glsl */ `
attribute float aSul;
varying vec3 vN; varying vec3 vP; varying float vSul;
void main(){
  vN = normalize(normalMatrix * normal);
  vP = position; vSul = aSul;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
// colours are LINEAR (the composer converts to sRGB): brand orange #ff8a1f = (1.0, 0.25, 0.014). Bloom picks up anything above 1.0
const frag = /* glsl */ `
uniform float uTime; uniform float uAlpha; uniform float uActivity;
varying vec3 vN; varying vec3 vP; varying float vSul;
void main(){
  vec3 N = normalize(vN);
  vec3 L = normalize(vec3(-0.45, 0.75, 0.55));
  float dif = max(dot(N, L), 0.0);
  float fill = max(dot(N, normalize(vec3(0.7, -0.35, 0.45))), 0.0);
  float rim = pow(1.0 - max(N.z, 0.0), 2.4);
  vec3 OR = vec3(1.0, 0.25, 0.014);
  vec3 col = vec3(0.030, 0.010, 0.0035) * (0.25 + 1.2 * dif)
           + OR * fill * 0.035
           + OR * rim * 0.5;
  // thought pulses racing across the folds
  float w1 = 0.5 + 0.5 * sin(dot(vP, vec3(3.3, 1.9, 2.6)) * 2.2 - uTime * 4.2);
  float w2 = 0.5 + 0.5 * sin(dot(vP, vec3(-2.4, 2.8, 1.3)) * 2.9 - uTime * 5.7 + 1.7);
  float spark = pow(max(w1 * w2, 0.0), 6.0);
  float glow = vSul * (0.38 + 0.55 * w1 * uActivity + 3.0 * spark * uActivity);
  col += OR * glow * 1.15;
  // the longitudinal fissure stays dark
  col *= mix(0.35, 1.0, smoothstep(0.0, 0.05, abs(vP.x)));
  gl_FragColor = vec4(col, uAlpha);
}`;

export type BrainPose = { cx: number; cy: number; w: number; h: number; s: number; a: number };

const Brain: React.FC<{ pose: BrainPose; t: number }> = ({ pose, t }) => {
  const { geos, mat } = useMemo(() => {
    const geos = buildBrain();
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, transparent: true, toneMapped: false,
      uniforms: { uTime: { value: 0 }, uAlpha: { value: 1 }, uActivity: { value: 1 } },
    });
    return { geos, mat };
  }, []);
  mat.uniforms.uTime.value = t;
  mat.uniforms.uAlpha.value = pose.a;
  // scale (pixels per unit) so the brain covers the spheres' widest extent with a margin
  const k = Math.max((pose.w * 1.12) / BRAIN_W, (pose.h * 1.22) / BRAIN_H) * pose.s;
  const yaw = 0.32 * Math.sin(t * 0.55) + 0.08 * Math.sin(t * 1.3);
  const breathe = 1 + 0.015 * Math.sin(t * 2.4);
  return (
    <group position={[pose.cx - 540, 960 - pose.cy, 0]} scale={k * breathe}>
      <group rotation={[0.62, yaw, 0]}>
        {geos.map((g, i) => (
          <mesh key={i} geometry={g} material={mat} />
        ))}
      </group>
    </group>
  );
};

export const Brain3D: React.FC<{ pose: BrainPose | null; t: number }> = ({ pose, t }) => (
  <div style={{ position: "absolute", inset: 0, opacity: pose ? 1 : 0 }}>
    <ThreeCanvas width={1080} height={1920} orthographic camera={{ zoom: 1, position: [0, 0, 2000], near: 1, far: 5000 }} gl={{ alpha: true, premultipliedAlpha: true, antialias: true }}>
      {pose && <Brain pose={pose} t={t} />}
      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.25} intensity={1.1} mipmapBlur radius={0.6} />
      </EffectComposer>
    </ThreeCanvas>
  </div>
);
