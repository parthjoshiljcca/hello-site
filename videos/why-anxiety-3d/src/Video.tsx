import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SCN } from "./common";
import { AlarmScene, AmygdalaScene, BreathScene } from "./Scenes";

/** base2d.mp4 = the 2D Why Spaces render (3D scenes keep only their 2D labels); the 3D layer is drawn on top */
export const Anxiety3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#0a0807", fontFamily: "M" }}>
      <OffthreadVideo src={staticFile("base2d.mp4")} />
      {t >= SCN[1].start - 0.1 && t < SCN[2].start && <AmygdalaScene t={t} />}
      {t >= SCN[3].start - 0.1 && t < SCN[4].start && <AlarmScene t={t} />}
      {t >= SCN[9].start - 0.1 && t < SCN[10].start && <BreathScene t={t} />}
    </AbsoluteFill>
  );
};
