import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SCN } from "./common";
import { BrainScene, BreathScene, KailashScene } from "./Scenes";

/** base2d.mp4 = the 2D Why Spaces render (3D scenes keep only their 2D badges); the 3D layer is drawn on top */
export const Dhyaan3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#0a0807", fontFamily: "M" }}>
      <OffthreadVideo src={staticFile("base2d.mp4")} />
      {t < SCN[1].start && <KailashScene t={t} />}
      {t >= SCN[9].start - 0.1 && t < SCN[11].start && <BrainScene t={t} />}
      {t >= SCN[15].start - 0.1 && t < SCN[16].start && <BreathScene t={t} />}
    </AbsoluteFill>
  );
};
