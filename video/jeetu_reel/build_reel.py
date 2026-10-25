"""Build the 30s 'Jeetu Bagadwal' reel (1080x1920) from the full title-song video.

Audio: song 256.333s -> 286.333s (build, hit at 261.0, drop at 264.33, climax at 120 bpm).
Timeline is in frames @30fps; climax cuts land on the beat grid (every 30 / 15 frames).
"""
import os
import subprocess
import sys

UP = "/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650"
SRC = f"{UP}/3da759ef-VID-20261025-WA0001.mp4"
D = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(D, "gfx")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "reel.mp4")
FPS = 30
A0 = 256.333            # song start
TOTAL = 900             # 30s
COVER_F = 720           # book reveal frame (T=24.0)

# (start_frame, source_seconds or None for black, punch amplitude)
SHOTS = [
    (0, 300.0, 0.04),    # Achhari eyes
    (36, 232.6, 0.05),   # fairy feet on rock
    (72, 73.0, 0.05),    # flute in hands
    (107, 165.0, 0.05),  # night silhouette with flute
    (140, 248.3, 0.12),  # HIT: Achhari face in the dark
    (186, None, 0.0),    # silence: chapter title on black
    (239, 201.0, 0.18),  # DROP: Jeetu above the clouds + title slam
    (300, 256.0, 0.08),
    (330, 239.0, 0.08),
    (360, 213.0, 0.08),
    (390, 27.0, 0.08),
    (420, 156.0, 0.08),
    (450, 121.0, 0.08),
    (480, 268.0, 0.08),
    (510, 50.0, 0.08),
    (540, 184.0, 0.08),
    (570, 80.5, 0.08),
    (600, 304.0, 0.06),  # half-beat escalation
    (615, 291.0, 0.06),
    (630, 172.0, 0.06),
    (645, 66.0, 0.06),
    (660, 278.0, 0.06),
    (675, 233.5, 0.06),
    (690, 223.0, 0.06),
    (705, 249.3, 0.06),
]


def nested(cuts, inner, fn):
    """if(gte(n,c_k), fn(c_k), ...) chain over cut frames."""
    e = inner
    for c in cuts:
        e = f"if(gte(n,{c}),{fn(c)},{e})"
    return e


def nested_t(cuts, inner, fn):
    e = inner
    for c in cuts:
        e = f"if(gte(t,{c/FPS:.4f}),{fn(c)},{e})"
    return e


starts = [s[0] for s in SHOTS]
ends = starts[1:] + [COVER_F]
cut_frames = starts[1:]
TS = nested_t(cut_frames, "t", lambda c: f"(t-{c/FPS:.4f})")
AMP = nested_t(cut_frames, f"{SHOTS[0][2]}", lambda c: f"{dict((s, a) for s, _, a in SHOTS)[c]}")

f = []
n_src = sum(1 for s in SHOTS if s[1] is not None)
f.append(f"[0:v]fps={FPS},split={n_src}" + "".join(f"[sv{i}]" for i in range(n_src)))
segs, k = [], 0
for i, ((st, src, _), en) in enumerate(zip(SHOTS, ends)):
    dur = (en - st) / FPS
    if src is None:
        f.append(f"color=c=black:s=854x480:r={FPS}:d={dur:.4f},format=yuv420p,setsar=1[seg{i}]")
    else:
        f.append(f"[sv{k}]trim=start={src}:duration={dur:.4f},setpts=PTS-STARTPTS,setsar=1[seg{i}]")
        k += 1
    segs.append(f"[seg{i}]")
f.append("".join(segs) + f"concat=n={len(segs)}:v=1:a=0,setpts=N/{FPS}/TB,format=gbrp,split=2[mb][mg]")
# bloom + grade on the small source
f.append("[mg]lutrgb=r='clip((val-170)*2.4,0,255)':g='clip((val-170)*2.4,0,255)':b='clip((val-170)*2.4,0,255)',gblur=sigma=14[glow]")
f.append("[mb][glow]blend=all_mode=screen:all_opacity=0.32,format=yuv420p,"
         "eq=contrast=1.07:gamma=1.02:saturation='if(lt(t,7.95),0.82,1.15)':eval=frame,split=2[m1][m2]")
# blurred backdrop
f.append("[m1]scale=-2:1920,crop=1080:1920,gblur=sigma=38,eq=brightness=-0.16:saturation=1.2[bg]")
# window with punch-in + shake
f.append(f"[m2]scale=w='trunc(1281*(1+({AMP})*exp(-({TS})*7)+0.02*min({TS},1.0))/2)*2':h=-2:eval=frame:flags=lanczos,"
         f"crop=1080:720:x='clip((iw-1080)/2+16*exp(-({TS})*11)*sin(({TS})*85),0,iw-1080)':"
         f"y='clip((ih-720)/2+12*exp(-({TS})*11)*cos(({TS})*70),0,ih-720)',unsharp=5:5:0.6[win]")
f.append("[bg][win]overlay=x=0:y=600,"
         "drawbox=x=90:y=594:w=900:h=2:color=0xD9B36A@0.75:t=fill:enable='not(between(n,186,238))',"
         "drawbox=x=90:y=1324:w=900:h=2:color=0xD9B36A@0.75:t=fill:enable='not(between(n,186,238))'[base]")

# ---- overlays (inputs 1..)
def ov(label, idx, t_in, t_out, x, y, fin=0.35, fout=0.3, extra=""):
    f.append(f"[{idx}:v]format=rgba,{extra}fade=t=in:st={t_in}:d={fin}:alpha=1,"
             f"fade=t=out:st={t_out - fout:.3f}:d={fout}:alpha=1[{label}]")
    return (label, x, y, t_in, t_out)

layers = [
    ov("h1", 2, 0.25, 4.55, "0", "330-h/2"),
    ov("h2", 3, 2.30, 4.55, "0", "1460-h/2"),
    ov("chap", 4, 6.30, 7.95, "0", "960-h/2", fin=0.6, fout=0.15),
    ov("c1", 5, 10.15, 12.85, "0", "1460-h/2"),
    ov("c2", 6, 13.15, 15.85, "0", "1460-h/2"),
    ov("c3", 7, 16.15, 18.90, "0", "1460-h/2"),
    ov("c4", 8, 20.00, 23.90, "0", "1460-h/2", fin=0.25),
]
# title slam (big, centred) then title badge on top
f.append("[1:v]format=rgba,split=2[tl1][tl2]")
f.append("[tl1]scale=w='trunc(1000*(1+0.45*exp(-max(t-7.967,0)*9))/2)*2':h=-2:eval=frame,"
         "fade=t=in:st=7.95:d=0.05:alpha=1,fade=t=out:st=9.70:d=0.25:alpha=1[slam]")
f.append("[tl2]scale=720:-2,fade=t=in:st=9.97:d=0.3:alpha=1,fade=t=out:st=23.75:d=0.2:alpha=1[badge]")
layers.insert(3, ("slam", "(W-w)/2", "960-h/2", 7.95, 9.97))
layers.append(("badge", "(W-w)/2", "330-h/2", 9.97, 23.97))

cur = "base"
for i, (lab, x, y, a, b) in enumerate(layers):
    nxt = f"o{i}"
    f.append(f"[{cur}][{lab}]overlay=x='{x}':y='{y}':eval=frame:enable='between(t,{a},{b})'[{nxt}]")
    cur = nxt
f.append(f"[{cur}]trim=end_frame={COVER_F},setpts=PTS-STARTPTS[part1]")

# ---- book end card (6s, local time t)
CD = (TOTAL - COVER_F) / FPS
f.append(f"[14:v]scale=-2:1920,crop=1080:1920,gblur=sigma=45,eq=brightness=-0.22:saturation=1.1,"
         f"trim=duration={CD},setpts=PTS-STARTPTS,format=yuv420p[cbg]")
f.append(f"[10:v]format=rgba,trim=duration={CD},setpts=PTS-STARTPTS,"
         f"fade=t=in:st=0:d=0.5:alpha=1[cglow]")
sweep = "110*exp(-pow((X+0.45*Y-(-500+(T-0.35)*1500))/75,2))*between(T,0.35,1.9)"
f.append(f"[9:v]format=gbrp,trim=duration={CD},setpts=PTS-STARTPTS,"
         f"geq=r='min(255,r(X,Y)+{sweep})':g='min(255,g(X,Y)+0.85*{sweep})':b='min(255,b(X,Y)+0.55*{sweep})',"
         f"format=yuv420p,scale=w='trunc(760*(1+0.18*exp(-t*7)+0.008*t)/2)*2':h=-2:eval=frame:flags=lanczos[ccov]")
# twinkling gold dust
f.append(f"color=c=black:s=540x960:r={FPS}:d={CD},noise=alls=100:allf=t,"
         f"lutyuv=y='if(gt(val,252),255,0)':u=128:v=128,scale=1080:1920:flags=neighbor,gblur=sigma=1.6,"
         f"lutyuv=y='clip(val*3,0,255)',format=gbrp,colorchannelmixer=rr=1:gg=0.78:bb=0.42[dust]")
f.append("[cbg][cglow]overlay=0:0[cb1]")
f.append("[cb1][ccov]overlay=x='(W-w)/2':y='880-h/2':eval=frame,format=gbrp[cb2]")
f.append("[cb2][dust]blend=all_mode=screen:all_opacity=0.9,format=yuv420p[cb3]")
f.append("[11:v]format=rgba,scale=860:-2,fade=t=in:st=1.0:d=0.6:alpha=1[auth]")
f.append("[12:v]format=rgba,fade=t=in:st=0.3:d=0.5:alpha=1,fade=t=out:st=2.2:d=0.3:alpha=1[etop]")
f.append("[13:v]format=rgba,fade=t=in:st=2.55:d=0.5:alpha=1[ecta]")
f.append("[cb3][auth]overlay=x='(W-w)/2':y=1450:enable='gte(t,1.0)'[cb4]")
f.append("[cb4][etop]overlay=x=0:y='190-h/2':enable='between(t,0.3,2.5)'[cb5]")
f.append(f"[cb5][ecta]overlay=x=0:y='190-h/2':enable='gte(t,2.55)',trim=duration={CD},setpts=PTS-STARTPTS[part2]")

# ---- join, global flashes, grain, fades
FL = ("0.22*exp(-(t-4.667)*10)*gte(t,4.667)*lt(t,5.5)"
      "+0.55*exp(-(t-7.967)*7)*gte(t,7.967)*lt(t,9)"
      "+0.38*exp(-(t-24.0)*6)*gte(t,24.0)*lt(t,25)"
      "+0.18*exp(-(t-23.75)*14)*gte(t,23.75)*lt(t,24.0)")
f.append("[part1][part2]concat=n=2:v=1:a=0,setpts=N/30/TB,"
         f"eq=brightness='{FL}':eval=frame,noise=c0s=5:c0f=t+u,"
         "fade=t=in:st=0:d=0.25,fade=t=out:st=29.55:d=0.45,format=yuv420p[v]")

f.append(f"[0:a]atrim={A0}:{A0 + TOTAL / FPS},asetpts=PTS-STARTPTS,"
         "afade=t=in:st=0:d=0.25,afade=t=out:st=28.4:d=1.6,alimiter=limit=0.95:level=false[a]")

script = os.path.join(D, "reel_graph.txt")
open(script, "w").write(";\n".join(f))

imgs = ["title.png", "hook1.png", "hook2.png", "chapter.png", "c1.png", "c2.png", "c3.png", "c4.png",
        "cover_card.png", "cover_glow.png", "author.png", "end_top.png", "end_cta.png", "cover.png"]
cmd = ["ffmpeg", "-y", "-v", "error", "-i", SRC]
for im in imgs:
    cmd += ["-loop", "1", "-framerate", str(FPS), "-t", "30", "-i", os.path.join(G, im)]
cmd += ["-filter_complex_script", script, "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-r", str(FPS), "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-t", "30", OUT]
subprocess.run(cmd, check=True)
print("done", OUT)
