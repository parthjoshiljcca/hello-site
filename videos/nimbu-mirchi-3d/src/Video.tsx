import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CamRig, HDR, Layer, MonoTag, eo, ev, fin, lerp, pop, sceneAlpha, seg, SCN } from "./common";
import { NazarBead, Totka, WarmLights } from "./Props";

/** Scene 1: "naya ghar, nayi dukaan, naya truck ... ek nimbu aur saat hari mirchein ... kyun?" */
const TotkaHero: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 0);
  const build = seg(t, ev.nimbu - 0.2, ev.mirchein + 0.9);
  const z = lerp(5.4, 4.6, eo(seg(t, 0, ev.kyun)));
  return (
    <>
      <Layer opacity={a} bloom={0.9}>
        <CamRig pos={[0.15, 0.1, z]} look={[0, 0.1, 0]} />
        <WarmLights />
        <group position={[0, -0.12, 0]} scale={0.6}>
          <Totka t={t} build={build} />
        </group>
        {/* faint door arch behind */}
        <mesh position={[0, 0.2, -1.2]}>
          <torusGeometry args={[1.5, 0.02, 8, 96, Math.PI]} />
          <meshBasicMaterial color={HDR("#ff8a1f", 1.4)} toneMapped={false} transparent opacity={0.5 * eo(seg(t, 0.2, 1.2))} />
        </mesh>
      </Layer>
      <MonoTag x={720} y={760} a={fin(t, "nimbu", 0.4, 0) * a}>1 NIMBU</MonoTag>
      <MonoTag x={250} y={1000} a={fin(t, "mirchein", 0.4, 0.2) * a}>7 HARI MIRCHI</MonoTag>
    </>
  );
};

/** Scene 3: evil eye across the world: a glass nazar bead (Turkey) */
const BeadScene: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 2);
  const p = pop(t, "turkey", 0.6, -0.3);
  return (
    <>
      <Layer opacity={a} bloom={1.0}>
        <CamRig pos={[0, 0, 6]} look={[0, 0, 0]} />
        <WarmLights />
        <pointLight position={[0, 1, 3]} intensity={8} color="#9fd0ff" />
        <group position={[0, 0.25, 0]} scale={0.62 * p}>
          <NazarBead t={t} />
        </group>
      </Layer>
      <MonoTag x={540} y={1140} a={fin(t, "turkey", 0.4, 0.2) * a}>NAZAR BONCUĞU · TURKEY</MonoTag>
    </>
  );
};

/** Scene 16 outro: the totka again, gently swinging */
const Outro: React.FC<{ t: number }> = ({ t }) => {
  const a = sceneAlpha(t, 15);
  return (
    <Layer opacity={a} bloom={0.9}>
      <CamRig pos={[-0.1, 0.1, 5.0]} look={[0, 0.05, 0]} />
      <WarmLights />
      <group position={[0, -0.12, 0]} scale={0.6}>
        <Totka t={t} />
      </group>
    </Layer>
  );
};

export const Nazar3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#0a0807", fontFamily: "M" }}>
      <OffthreadVideo src={staticFile("base2d.mp4")} />
      {t < SCN[1].start && <TotkaHero t={t} />}
      {t >= SCN[2].start - 0.1 && t < SCN[3].start && <BeadScene t={t} />}
      {t >= SCN[15].start - 0.1 && <Outro t={t} />}
    </AbsoluteFill>
  );
};
