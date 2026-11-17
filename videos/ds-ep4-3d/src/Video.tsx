import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SCN } from "./common";
import { HookScene, OpsScene, OverflowScene, PlatesScene } from "./Scenes";

/** base2d.mp4 = the 2D Why Spaces render (3D scenes keep only their 2D labels); the 3D layer is drawn on top */
export const DS3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#0a0807", fontFamily: "M" }}>
      <OffthreadVideo src={staticFile("base2d.mp4")} />
      {t < SCN[1].start && <HookScene t={t} />}
      {t >= SCN[2].start - 0.1 && t < SCN[6].start && <PlatesScene t={t} />}
      {t >= SCN[6].start - 0.1 && t < SCN[11].start && <OpsScene t={t} />}
      {t >= SCN[12].start - 0.1 && t < SCN[14].start && <OverflowScene t={t} />}
    </AbsoluteFill>
  );
};
