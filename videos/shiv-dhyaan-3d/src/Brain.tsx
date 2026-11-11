import { useMemo } from "react";
import * as THREE from "three";
import { BRAIN_CENTER, buildBrain } from "./brainGeometry";

/* Brain tissue shader (from the Overthinking video) with an x-ray mode: uXray 0 = opaque tissue, 1 = glassy shell
   so the glowing amygdala inside shows through. Colours are LINEAR; bloom picks up anything above 1.0. */
const vert = /* glsl */ `
attribute float aSul;
varying vec3 vN; varying vec3 vP; varying float vSul;
void main(){
  vN = normalize(normalMatrix * normal);
  vP = position; vSul = aSul;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const frag = /* glsl */ `
uniform float uTime; uniform float uFade; uniform float uXray; uniform float uAlarm;
varying vec3 vN; varying vec3 vP; varying float vSul;
void main(){
  vec3 N = normalize(vN);
  vec3 L = normalize(vec3(-0.45, 0.75, 0.55));
  float dif = max(dot(N, L), 0.0);
  float rim = pow(1.0 - abs(N.z), 2.2);
  vec3 OR = vec3(1.0, 0.25, 0.014);
  float ao = 1.0 - 0.82 * vSul;
  float spec = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 18.0) * (1.0 - vSul);
  vec3 tissue = vec3(0.30, 0.085, 0.022);
  vec3 col = tissue * (0.14 + 1.15 * dif) * ao + vec3(1.0, 0.55, 0.25) * spec * 0.22 + OR * rim * 0.45;
  float w1 = 0.5 + 0.5 * sin(dot(vP, vec3(3.3, 1.9, 2.6)) * 2.2 - uTime * 4.2);
  float w2 = 0.5 + 0.5 * sin(dot(vP, vec3(-2.4, 2.8, 1.3)) * 2.9 - uTime * 5.7 + 1.7);
  float spark = pow(max(w1 * w2, 0.0), 6.0);
  col += OR * vSul * (0.10 + 0.3 * w1 + 2.0 * spark);
  // alarm: red flashes racing over the folds
  col += vec3(1.0, 0.06, 0.02) * uAlarm * (0.25 + 1.6 * spark) * (0.4 + vSul);
  // x-ray: thin glowing shell, mostly the rim and the grooves
  vec3 glass = OR * (0.15 + 1.4 * rim) + OR * vSul * 0.6 * w1;
  float alpha = mix(1.0, 0.10 + 0.75 * rim + 0.35 * vSul, uXray);
  gl_FragColor = vec4(mix(col, glass, uXray) * uFade, alpha * uFade);
}`;

export const AMYG: [number, number, number] = [0.3, -0.28, 0.24]; // front of the temporal lobe, deep inside (right hemisphere)

export const Brain: React.FC<{ t: number; fade: number; xray: number; alarm: number }> = ({ t, fade, xray, alarm }) => {
  const { geos, mat } = useMemo(() => {
    const geos = buildBrain();
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, toneMapped: false, transparent: true,
      uniforms: { uTime: { value: 0 }, uFade: { value: 1 }, uXray: { value: 0 }, uAlarm: { value: 0 } },
    });
    return { geos, mat };
  }, []);
  mat.uniforms.uTime.value = t;
  mat.uniforms.uFade.value = fade;
  mat.uniforms.uXray.value = xray;
  mat.uniforms.uAlarm.value = alarm;
  mat.depthWrite = xray < 0.5;
  return (
    <group position={[-BRAIN_CENTER[0], -BRAIN_CENTER[1], 0]}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mat} renderOrder={2} />
      ))}
    </group>
  );
};

/** almond-shaped glowing amygdala (one per hemisphere) */
export const Amygdala: React.FC<{ glow: number; red: number; scale?: number }> = ({ glow, red, scale = 1 }) => {
  const col = new THREE.Color().lerpColors(new THREE.Color(1.0, 0.25, 0.014), new THREE.Color(1.0, 0.03, 0.01), red).multiplyScalar(0.6 + 3.2 * glow);
  return (
    <>
      {[1, -1].map((s) => (
        <mesh key={s} position={[AMYG[0] - BRAIN_CENTER[0], AMYG[1] - BRAIN_CENTER[1], AMYG[2] * s]} rotation={[0, 0, -0.35]} scale={[0.11 * scale, 0.065 * scale, 0.07 * scale]} renderOrder={1}>
          <sphereGeometry args={[1, 48, 32]} />
          <meshBasicMaterial color={col} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
};

/** a real-looking almond for the size comparison */
export const Almond: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 64, 48);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const taper = 1 - 0.45 * Math.max(0, y); // pointed tip
      const ridge = 1 + 0.035 * Math.sin(y * 22 + x * 6) * Math.sin(x * 9);
      p.setXYZ(i, x * 0.62 * taper * ridge, y, z * 0.32 * taper * ridge);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#d08a4a" emissive="#5a2a0c" emissiveIntensity={0.6} roughness={0.7} metalness={0} />
    </mesh>
  );
};
