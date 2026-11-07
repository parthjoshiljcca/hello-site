import { Badge, CamRig, HDR, Layer, back, eo, ev, pop, sceneAlpha, seg } from "./common";
import { Env, Kulhad, Steam, WarmLights } from "./props";

/** Scene 1 (0-6 s): "Subah ki pehli chai se lekar shaam ki gupshup tak... crores cups" */
const CAM: [number, number, number] = [0, 1.35, 6.0];
const LOOK: [number, number, number] = [0, 0.05, 0];

export const Hook3D: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 0);
  const enter = back(seg(t, 0.0, 0.7));
  const sunP = pop(t, "subah"), moonP = pop(t, "shaam");
  const n = 10;
  return (
    <>
      <Layer opacity={a}>
        <CamRig pos={CAM} look={LOOK} />
        <Env />
        <WarmLights />
        {/* hero kulhad */}
        <group position={[0, -0.05 + (1 - eo(seg(t, 0, 0.7))) * -0.4, 0]} scale={0.95 * enter} rotation={[0.05, 0, 0]}>
          <Kulhad rot={t * 0.35} />
          <Steam t={t} a={eo(seg(t, 0.3, 1.2))} />
        </group>
        {/* sun (subah) and moon (shaam) */}
        {sunP > 0 && (
          <group position={[-1.25, 1.55, -0.5]} scale={sunP}>
            <mesh><sphereGeometry args={[0.2, 48, 32]} /><meshBasicMaterial color={HDR("#ff9a3a", 3.2)} toneMapped={false} /></mesh>
            {Array.from({ length: 10 }, (_, i) => (
              <mesh key={i} rotation={[0, 0, (i / 10) * Math.PI * 2 + t * 0.5]}>
                <boxGeometry args={[0.62, 0.025, 0.02]} />
                <meshBasicMaterial color={HDR("#ffb15c", 1.6)} toneMapped={false} />
              </mesh>
            ))}
          </group>
        )}
        {moonP > 0 && (
          <group position={[1.25, 1.55, -0.5]} scale={moonP}>
            <mesh><sphereGeometry args={[0.19, 48, 32]} /><meshBasicMaterial color={HDR("#f3ece4", 1.25)} toneMapped={false} /></mesh>
            <mesh position={[0.09, 0.05, 0.12]}><sphereGeometry args={[0.17, 48, 32]} /><meshBasicMaterial color="#0d0907" /></mesh>
          </group>
        )}
        {/* crores of cups: a ring of kulhads popping in around the hero cup */}
        {Array.from({ length: n }, (_, i) => {
          const p = back(seg(t, ev.crores - 0.1 + i * 0.05, ev.crores + 0.4 + i * 0.05));
          if (p <= 0) return null;
          const an = (i / n) * Math.PI * 2 + t * 0.25;
          return (
            <group key={i} position={[Math.cos(an) * 1.75, -0.15 + Math.sin(an) * 0.12, Math.sin(an) * 1.0]} scale={0.3 * p}>
              <Kulhad rot={i} />
              {i % 2 === 0 && <Steam t={t + i} n={30} size={0.5} height={1.4} />}
            </group>
          );
        })}
      </Layer>
      <Badge x={540} y={1240} p={pop(t, "crores", 0.5, 0.4) * a}>CRORES CUPS / DIN</Badge>
    </>
  );
};
