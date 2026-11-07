import { Audio } from "@remotion/media";
import { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Cable3D } from "./Cable3D";
import { Globe3D } from "./Globe3D";
import { Background, Bar, Captions, Header, MonoTag, Texture } from "./Chrome";
import { CHE, MUM, T1, back, eo, ev, globeState, projectLL, projectWorld, satelliteWorld, seg } from "./anim";

const FONTS: [string, string, string][] = [
  ["M", "Montserrat-500.ttf", "500"], ["M", "Montserrat-700.ttf", "700"], ["M", "Montserrat-800.ttf", "800"],
  ["M", "Montserrat-900.ttf", "900"], ["J", "JetBrainsMono-Medium.ttf", "500"],
];
const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(FONTS.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile(`fonts/${file}`)})`, { weight: w }).load().then((f) => document.fonts.add(f))))
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle]);
};

/** 2D overlays that follow 3D positions (labels, the "not by air" cross) */
const Overlays: React.FC<{ t: number }> = ({ t }) => {
  const g = globeState(t);
  const fadeDive = 1 - seg(t, T1, T1 + 0.3);
  const label = (ll: [number, number], text: string, p: number, side: number) => {
    if (p <= 0) return null;
    const s = projectLL(ll[0], ll[1], g);
    if (s.vis < 0.05) return null;
    const lx = s.x + side * 120, ly = s.y - 70, q = eo(Math.min(1, p * 1.5));
    const a = Math.min(1, p * 2) * Math.min(1, s.vis * 4) * fadeDive;
    return (
      <g key={text} opacity={a}>
        <line x1={s.x} y1={s.y} x2={s.x + (lx - s.x) * q} y2={s.y + (ly - s.y) * q} stroke="rgba(255,138,31,.7)" strokeWidth={2} />
      </g>
    );
  };
  const tagOf = (ll: [number, number], text: string, p: number, side: number) => {
    if (p <= 0) return null;
    const s = projectLL(ll[0], ll[1], g);
    if (s.vis < 0.05) return null;
    return <MonoTag key={text} x={s.x + side * 180} y={s.y - 70} a={Math.max(0, Math.min(1, p * 2 - 0.6)) * fadeDive}>{text}</MonoTag>;
  };
  const mum = seg(t, ev.samundar + 0.62, ev.samundar + 1.12), che = seg(t, ev.neeche + 0.3, ev.neeche + 0.8);
  // cross over the 3D satellite on "nahi"
  const sat = projectWorld(satelliteWorld(t), g);
  const nh = eo(seg(t, ev.nahi - 0.05, ev.nahi + 0.35)), gone = seg(t, ev.samundar - 0.2, ev.samundar + 0.2);
  const q1 = Math.min(1, nh * 2), q2 = Math.max(0, nh * 2 - 1), S = 70;
  const badge = back(seg(t, ev.neeche + 0.12, ev.neeche + 0.57));
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {label(MUM, "MUMBAI", mum, -1)}
        {label(CHE, "CHENNAI", che, 1)}
        {nh > 0 && gone < 1 && (
          <g opacity={1 - gone} stroke="#ff8a1f" strokeWidth={S * 0.22} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 14px #ff8a1f)" }}>
            <line x1={sat.x - S} y1={sat.y - S} x2={sat.x - S + 2 * S * q1} y2={sat.y - S + 2 * S * q1} />
            {q2 > 0 && <line x1={sat.x + S} y1={sat.y - S} x2={sat.x + S - 2 * S * q2} y2={sat.y - S + 2 * S * q2} />}
          </g>
        )}
      </svg>
      {tagOf(MUM, "MUMBAI", mum, -1)}
      {tagOf(CHE, "CHENNAI", che, 1)}
      {badge > 0 && t < T1 && (
        <div style={{ position: "absolute", left: 540, top: 1236, transform: `translate(-50%,-50%) scale(${badge})`, opacity: Math.min(1, badge * 1.5), fontWeight: 800, fontSize: 28, color: "#ffb15c", border: "2.5px solid #ff8a1f", borderRadius: 28, padding: "10px 26px", background: "rgba(255,138,31,.14)", boxShadow: "0 0 16px rgba(255,138,31,.6)" }}>UNDERSEA CABLES</div>
      )}
    </>
  );
};

export const InternetGlobe: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const total = durationInFrames / fps;
  return (
    <AbsoluteFill style={{ fontFamily: "M", overflow: "hidden" }}>
      <style>{`.title em{font-style:normal;color:#ff8a1f;text-shadow:0 0 34px rgba(255,138,31,.55)}`}</style>
      <Background t={t} />
      {/* both 3D canvases stay mounted from frame 0 so neither has a cold first frame mid-video */}
      <Globe3D t={t} />
      <Cable3D t={t} />
      <Overlays t={t} />
      <Texture t={t} frame={frame} />
      <Header t={t} />
      <Captions t={t} />
      <Bar t={t} frame={frame} total={total} />
      <Audio src={staticFile("mix-6s.wav")} />
    </AbsoluteFill>
  );
};
