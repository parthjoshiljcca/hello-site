import { random } from "remotion";
import timing from "./data/timing.json";
import { back, eo, lerp, seg } from "./anim";

export const C = { bg: "#0a0807", or: "#ff8a1f", orL: "#ffb15c", wh: "#f6efe7", muted: "#9a8e83", hdr: "#5d534b" };
const abs: React.CSSProperties = { position: "absolute" };

export const Background: React.FC<{ t: number }> = ({ t }) => {
  const gx = 540 + Math.sin(t * 0.4) * 60, gy = 1000 + Math.cos(t * 0.3) * 40;
  return (
    <>
      <div style={{ ...abs, inset: 0, background: C.bg }} />
      <div style={{ ...abs, inset: 0, backgroundImage: "linear-gradient(rgba(255,170,110,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,170,110,0.028) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div style={{ ...abs, inset: 0, background: `radial-gradient(620px circle at ${gx}px ${gy}px, rgba(255,120,20,0.20), rgba(255,100,10,0.06) 50%, transparent 100%)` }} />
      <div style={{ ...abs, inset: 0, background: "radial-gradient(500px circle at 540px 300px, rgba(255,120,20,0.07), transparent 100%)" }} />
    </>
  );
};

export const Texture: React.FC<{ t: number; frame: number }> = ({ t, frame }) => (
  <>
    <svg width={1080} height={1920} style={{ ...abs, left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: 60 }, (_, i) => {
        const r = (k: number) => random(`dust-${i}-${k}`);
        const x = (((r(0) * 1080 + t * (10 + r(1) * 20)) % 1080) + 1080) % 1080;
        const y = (((r(2) * 1920 - t * (15 + r(3) * 25)) % 1920) + 1920) % 1920;
        const a = 0.15 + 0.35 * r(4) * (0.5 + 0.5 * Math.sin(t * 2 + i));
        return <circle key={i} cx={x} cy={y} r={1 + r(5) * 2} fill={`rgba(255,190,140,${a})`} />;
      })}
    </svg>
    <svg width={1080} height={1920} style={{ ...abs, left: 0, top: 0, opacity: 0.075, mixBlendMode: "screen", pointerEvents: "none" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 4} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
    <div style={{ ...abs, inset: 0, background: "radial-gradient(1200px circle at 540px 960px, transparent 40%, rgba(0,0,0,0.65) 100%)", pointerEvents: "none" }} />
  </>
);

const SC = [
  { pill: "01 · SAWAAL", plain: "Internet India Kaise Pahuncha?", title: <>Internet <em>India</em> Kaise Pahuncha?</>, sub: "Satellite? Wi-Fi? Ya kuch aur...", tag: "THE · WHY" },
  { pill: "02 · UNDERSEA CABLE", plain: "Samundar Ke Neeche", title: <>Samundar Ke <em>Neeche</em></>, sub: "Cable ke andar: glass fibre + light", tag: "DATA = LIGHT" },
];

export const Header: React.FC<{ t: number }> = ({ t }) => {
  const sc = timing.scenes;
  const i = t >= sc[1].start ? 1 : 0;
  const s = sc[i], lt = t - s.start, dur = s.end - s.start;
  const out = i === 0 ? 1 - seg(lt, dur - 0.25, dur) : 1;
  const ent = (d: number) => { const p = eo(seg(lt, d, d + 0.45)); return [p * out, (1 - p) * 40]; };
  const c = SC[i];
  // auto-shrink to one line (96px -> min 60px), as in the locked style
  let fs = 96;
  const mctx = document.createElement("canvas").getContext("2d")!; // uncached: fonts load after first render
  const width = (size: number) => { mctx.font = `900 ${size}px M`; return mctx.measureText(c.plain).width - c.plain.length; };
  while (fs > 60 && width(fs) > 1000) fs -= 4;
  const [po, py] = ent(0), [to, ty] = ent(0.08), [so, sy] = ent(0.2), [ago, agy] = ent(0.35);
  return (
    <>
      <div style={{ ...abs, top: 88, left: 64, fontFamily: "J", fontSize: 30, letterSpacing: 2, color: C.hdr }}>THE WHY SPACES · <b style={{ color: C.or, fontWeight: 400 }}>INTERNET</b></div>
      <div style={{ ...abs, top: 88, right: 64, fontFamily: "J", fontSize: 30, letterSpacing: 2, color: C.hdr }}>@thewhyspaces</div>
      <div style={{ ...abs, top: 190, left: 0, width: "100%", textAlign: "center", opacity: po, transform: `translateY(${py}px) scale(${lerp(0.8, 1, back(seg(lt, 0, 0.4)))})` }}>
        <span style={{ display: "inline-block", fontFamily: "J", fontSize: 28, letterSpacing: 5, color: C.or, border: "2px solid rgba(255,138,31,.75)", borderRadius: 40, padding: "12px 34px", boxShadow: "0 0 24px rgba(255,138,31,.25), inset 0 0 18px rgba(255,138,31,.12)", background: "rgba(255,138,31,.06)" }}>{c.pill}</span>
      </div>
      <div className="title" style={{ ...abs, top: 268, left: 30, width: 1020, textAlign: "center", fontWeight: 900, fontSize: fs, lineHeight: 1.06, color: C.wh, letterSpacing: -1, textShadow: "0 4px 30px rgba(0,0,0,.6)", opacity: to, transform: `translateY(${ty}px)`, filter: `blur(${(1 - seg(lt, 0.08, 0.4)) * 10}px)`, whiteSpace: "nowrap" }}>{c.title}</div>
      <div style={{ ...abs, top: 268 + fs * 1.06 + 18, left: 0, width: "100%", textAlign: "center", fontWeight: 500, fontSize: 38, color: C.muted, opacity: so, transform: `translateY(${sy}px)` }}>{c.sub}</div>
      <div style={{ ...abs, top: 1318, left: 0, width: "100%", textAlign: "center", opacity: ago * 0.95, transform: `translateY(${agy * 0.5}px)` }}>
        <span style={{ display: "inline-block", fontFamily: "J", fontSize: 24, letterSpacing: 4, color: "#ff9b3d", border: "1.5px solid rgba(255,138,31,.6)", borderRadius: 8, padding: "8px 20px", background: "rgba(255,138,31,.08)" }}>{c.tag}</span>
      </div>
    </>
  );
};

const HL = ["internet", "india", "hawa", "nahi", "samundar", "neeche", "hazaaron", "kilometre", "undersea", "cables", "data", "light", "daudta"];
const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const shW = "0 1px 0 #d8cdc1,0 2px 0 #c4b8ab,0 3px 0 #ada195,0 4px 0 #978b80,0 5px 0 #81766b,0 6px 0 #6b6157,0 7px 0 #554c44,0 8px 0 #403832,0 14px 18px rgba(0,0,0,.85)";
const shO = "0 1px 0 #f07c14,0 2px 0 #e06f0f,0 3px 0 #cc620b,0 4px 0 #b55608,0 5px 0 #9e4a06,0 6px 0 #873e05,0 7px 0 #703304,0 8px 0 #5a2803,0 14px 18px rgba(0,0,0,.85),0 0 40px rgba(255,138,31,.55)";

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const chunks = timing.chunks as { s: number; idx: number[]; t0: number; t1: number }[];
  let ci = -1;
  chunks.forEach((c, k) => { if (t >= c.t0 - 0.05) ci = k; });
  if (ci < 0) return null;
  const ch = chunks[ci], se = timing.sent[ch.s];
  const fo = t < ch.t1 ? 1 - seg(t, ch.t1 - 0.15, ch.t1) : 0;
  return (
    <div style={{ ...abs, top: 1420, left: 50, width: 980, textAlign: "center", transform: "perspective(1000px) rotateX(16deg)", transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}>
      {ch.idx.map((k, n) => {
        const w = se.words[k], wt = se.wt[k];
        const p = seg(t, wt - 0.04, wt + 0.26), e = eo(p);
        const nx = n + 1 < ch.idx.length ? se.wt[ch.idx[n + 1]] : wt + 0.5;
        const act = t >= wt && t < nx + 0.1;
        const hl = HL.includes(clean(w));
        return (
          <span key={k} style={{ display: "inline-block", fontWeight: 800, fontSize: 72, lineHeight: 1.22, margin: "0 11px", color: hl ? C.or : C.wh, textShadow: hl ? shO : shW, transformOrigin: "50% 80%", opacity: (p <= 0 ? 0 : Math.min(1, p * 2.5)) * fo, transform: `translateY(${(1 - e) * 50}px) rotateX(${(1 - e) * -95}deg) scale(${lerp(0.6, 1, back(p)) * (act ? 1.06 : 1)})` }}>{w}</span>
        );
      })}
    </div>
  );
};

export const Bar: React.FC<{ t: number; frame: number; total: number }> = ({ t, frame, total }) => {
  const amp = timing.amp[Math.min(frame, timing.amp.length - 1)] || 0;
  return (
    <>
      <div style={{ ...abs, left: 48, top: 1736, width: 984, height: 112, borderRadius: 56, border: "2px solid rgba(255,138,31,.35)", background: "rgba(20,14,10,.78)", boxShadow: "0 0 40px rgba(255,138,31,.12)", boxSizing: "border-box" }}>
        <div style={{ ...abs, left: 22, top: 18, width: 72, height: 72, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#ffa94d,#ff7a00)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 46, color: "#1a0f06", boxShadow: "0 0 22px rgba(255,138,31,.6)" }}>?</div>
        <div style={{ ...abs, left: 114, top: 20, fontWeight: 800, fontSize: 34, color: C.wh }}>The Why Spaces</div>
        <div style={{ ...abs, left: 114, top: 60, fontWeight: 500, fontSize: 24, color: "#8a7f75" }}>@thewhyspaces</div>
        <div style={{ ...abs, right: 44, top: 28, height: 52, display: "flex", alignItems: "center", gap: 6 }}>
          {Array.from({ length: 13 }, (_, k) => {
            const h = 8 + amp * 44 * (0.35 + 0.65 * Math.abs(Math.sin(k * 0.9 + t * 9))) * (0.7 + 0.3 * random(`w${k}-${frame}`)) + 3 * Math.sin(t * 3 + k);
            return <i key={k} style={{ display: "block", width: 7, borderRadius: 4, background: C.or, height: Math.max(6, h), opacity: 0.45 + amp * 0.55 }} />;
          })}
        </div>
      </div>
      <div style={{ ...abs, left: 0, top: 1912, height: 8, width: (t / total) * 1080, background: "linear-gradient(90deg,#ff5e00,#ffb15c)", boxShadow: "0 0 14px #ff8a1f" }} />
    </>
  );
};

export const MonoTag: React.FC<{ x: number; y: number; a: number; children: React.ReactNode }> = ({ x, y, a, children }) =>
  a <= 0 ? null : (
    <div style={{ ...abs, left: x, top: y, transform: "translate(-50%,-50%)", opacity: a, fontFamily: "J", fontSize: 22, letterSpacing: 2, color: "#ff9b3d", border: "1.5px solid rgba(255,138,31,.6)", borderRadius: 8, padding: "6px 14px", background: "rgba(20,12,8,.85)", whiteSpace: "nowrap" }}>{children}</div>
  );
