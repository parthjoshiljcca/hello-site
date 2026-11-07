import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Brain3D, type BrainPose } from "./Brain3D";
import path from "./data/path.json";

type Row = { f: number; cy: number; w: number; h: number; s: number; a: number };
const SEGS = Object.values(path) as Row[][];
/** brain pose for this frame, or null when the spheres are not on screen */
const poseAt = (frame: number): BrainPose | null => {
  for (const seg of SEGS) {
    const r = seg[frame - seg[0].f];
    if (r) return { cx: 540, cy: r.cy, w: r.w, h: r.h, s: r.s, a: r.a };
  }
  return null;
};

export const Overthinking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#0a0807" }}>
      <OffthreadVideo src={staticFile("overthinking.mp4")} />
      <Brain3D pose={poseAt(frame)} t={frame / fps} />
    </AbsoluteFill>
  );
};
