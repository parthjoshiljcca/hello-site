import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Globe3D } from "./Globe3D";
import { Hook3D } from "./Hook3D";
import { Patila3D } from "./Patila3D";
import { SCN } from "./common";

/** base2d.mp4 = the 2D Why Spaces render with the 3D scenes' illustrations left empty; 3D is drawn on top */
export const Chai3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ background: "#0a0807", fontFamily: "M" }}>
      <OffthreadVideo src={staticFile("base2d.mp4")} />
      {t < SCN[1].start && <Hook3D t={t} />}
      {t >= SCN[3].start - 0.1 && t < SCN[7].start && <Globe3D t={t} />}
      {t >= SCN[10].start - 0.1 && t < SCN[11].start && <Patila3D t={t} />}
    </AbsoluteFill>
  );
};
