#!/usr/bin/env python3
"""Ravi & Sakshi — "10 Days To Go" pre-wedding teaser, v2 (42s, 16:9).

Built mainly from the four new scenes plus three shots from v1, styled after
the Raanjhana reference (song, pacing, soft low-saturation colour).

usage: render.py <uploads_dir> <fonts_dir> <work_dir> <out_dir> [16x9|9x16 ...]
"""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

UP, FONTS, WORK, OUT = sys.argv[1:5]
ORIENTS = sys.argv[5:] or ["16x9"]
FPS = 25

def src(tag):
    return glob.glob(os.path.join(UP, f"*{tag}*.mp4"))[0]

GARDEN = src("16-59-26")    # garden meeting, hands held
ARCHES = src("17-02-21")    # palace arches, bride on balcony, groom walk
SUNSET = src("17-08-12")    # dupatta at sunset, faces, silhouette under arch
TERRACE = src("17-11-31")   # palace terrace at golden hour
REF = src("Raanjhana")      # reference reel: song + pacing (v2)
STAIRS = src("17-23-02")    # palace staircase, red lehenga, arches at sunset
GLAM = src("17-29-53")      # black-tie night, glass skydeck
BLOOM = src("17-35-11")     # pastel flower garden
GHAT = src("17-35-34")      # ghats with floating diyas

# Cut points are taken frame-exact from the Raanjhana reference reel itself
# (same song), so every cut lands where the reference cuts: rapid flicker
# intro (0-7.2s), a cut on every bar of the chorus with a flicker burst at
# 11.5s, long slow-motion shots through the quiet verse, then the reveal.
INTRO_CUTS = [0.0, 0.27, 0.60, 0.73, 0.87, 1.10, 1.33, 1.57, 1.80, 2.07, 2.40,
              2.53, 2.77, 3.00, 3.13, 3.27, 3.37, 3.60, 3.73, 4.47, 4.57, 4.70,
              4.80, 5.07, 5.17, 5.30, 5.40, 5.53, 5.67, 5.77, 5.90, 6.00, 6.27,
              6.37, 6.50, 6.77, 6.97]
# source moments chosen inside each clip's clean takes (avoiding the
# generator's own dissolves between takes)
INTRO_POOL = [(GHAT, 0.2), (STAIRS, 0.1), (BLOOM, 0.3), (GLAM, 0.3), (SUNSET, 0.2),
              (STAIRS, 1.6), (BLOOM, 6.9), (BLOOM, 2.2), (GHAT, 2.6), (ARCHES, 0.5),
              (STAIRS, 5.6), (BLOOM, 4.4), (GHAT, 9.5), (GHAT, 4.6), (BLOOM, 5.4),
              (STAIRS, 7.6), (GLAM, 6.6), (GHAT, 9.3), (STAIRS, 1.6), (BLOOM, 7.6),
              (GLAM, 8.4), (BLOOM, 8.7), (GHAT, 6.2), (STAIRS, 4.6), (GLAM, 4.4),
              (BLOOM, 2.8), (GHAT, 1.0), (STAIRS, 2.0), (GLAM, 0.8), (BLOOM, 1.0),
              (GHAT, 3.0), (STAIRS, 8.6), (GLAM, 7.2), (BLOOM, 9.0), (GHAT, 7.6),
              (STAIRS, 6.4), (GLAM, 9.0)]
FLICKER = [11.50, 11.67, 11.77, 11.93, 12.07, 12.17, 12.33, 12.47]
FLICKER_POOL = [(STAIRS, 7.8), (GLAM, 7.0), (BLOOM, 5.6), (GHAT, 6.4),
                (STAIRS, 8.8), (GLAM, 8.6), (BLOOM, 9.2), (GHAT, 2.8)]

def S(clip, ss, speed=1.0, z0=1.14, z1=1.19):
    # (clip, src_start, speed, focus_x, b&w, white-flash-in, zoom_from, zoom_to)
    # zoom >= 1.14 also keeps the generator watermark out of frame
    return (clip, ss, speed, .5, False, False, z0, z1)

CUTS, SHOTS = [], []
for t, (c, ss) in zip(INTRO_CUTS, INTRO_POOL):
    CUTS.append(t); SHOTS.append(S(c, ss))
for t, shot in [
        (7.17, S(STAIRS, 4.5, 0.55, z1=1.21)),  # chorus: groom smiles
        (8.30, S(GLAM, 6.6)),                    # twirl on the skydeck
        (9.37, S(BLOOM, 7.5, 0.7)),              # veil twirl
        (10.47, S(GHAT, 4.5, 0.9, z1=1.21))]:    # faces by the diyas
    CUTS.append(t); SHOTS.append(shot)
for t, (c, ss) in zip(FLICKER, FLICKER_POOL):
    CUTS.append(t); SHOTS.append(S(c, ss))
for t, shot in [
        (12.57, S(BLOOM, 5.25, 0.85, z1=1.21)),  # garden close-up
        (13.80, S(GHAT, 6.0, 0.9, z1=1.21)),     # hands by the water
        (14.93, S(GARDEN, 6.4, z1=1.21)),        # [v1] hands held
        (15.97, S(STAIRS, 7.5, 0.46, z1=1.24)),  # verse: meeting at the arches
        (21.33, S(GLAM, 8.25, 0.39, z1=1.23)),   # skyline, slow
        (25.67, S(GHAT, 2.4, 0.5, z1=1.22)),     # saree in the wind, slow
        (28.87, S(BLOOM, 0.0, 0.55, z1=1.22)),   # garden walk, slow
        (32.00, S(BLOOM, 2.0, 0.75, z1=1.20)),   # groom under the flower arch, slow
        (34.00, S(STAIRS, 1.6, 0.6, z1=1.21)),   # dupatta twirl, slow
        (35.60, S(SUNSET, 0.0, 0.6, z1=1.22)),   # [v1] dupatta at sunset
        (37.93, S(BLOOM, 8.5, 0.36, z1=1.22))]:  # sunset, hand in hand: reveal
    CUTS.append(t); SHOTS.append(shot)
CUTS.append(42.00)

# bright, clean, neutral grade: cools the clips' orange cast, lifts exposure,
# keeps colour soft (no heavy saturation, no dark vignette)
GRADE = ("colorbalance=rs=-0.05:bs=0.04:rm=-0.05:gm=0.0:bm=0.04:rh=-0.03:bh=0.03,"
         "eq=contrast=0.95:saturation=0.78:brightness=0.035:gamma=1.10,"
         "curves=all='0/0.045 0.5/0.54 1/0.985'")

def run(cmd):
    subprocess.run(cmd, check=True)

def segment(i, shot, dur, W, H, path):
    clip, ss, speed, fx, bw, flash, z0, z1 = shot
    n = round(dur * FPS)
    cw = min(1280, round(720 * W / H)) // 2 * 2
    x = int(min(max(fx * 1280 - cw / 2, 0), 1280 - cw))
    f = []
    if speed != 1.0:
        f.append(f"setpts={1/speed:.4f}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1")
    else:
        f.append(f"fps={FPS}")
    f.append(f"crop={cw}:720:{x}:0")
    f.append(f"scale={W*2}:{H*2}:flags=lanczos")
    zs = f"{z0}+({z1}-{z0})*on/{max(n-1,1)}"
    f.append(f"zoompan=z='{zs}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={W}x{H}:fps={FPS}")
    f.append(GRADE)
    if bw:
        f.append("hue=s=0,eq=contrast=1.12:brightness=0.01")
    if flash:
        f.append("fade=in:st=0:d=0.2:color=white")
    f.append("setsar=1")
    srclen = dur * speed + 0.5
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", f"{srclen:.3f}", "-i", clip,
         "-vf", ",".join(f), "-frames:v", str(n), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-pix_fmt", "yuv420p", path])

# ---------- titles ----------
GOLD_TOP, GOLD_BOT = (244, 236, 216), (204, 182, 140)

def gold_text(text, font, track=0):
    tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    widths = [tmp.textlength(c, font=font) for c in text]
    w = int(sum(widths) + track * (len(text) - 1)) + 80
    asc, desc = font.getmetrics()
    h = asc + desc + 80
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    cx = 40
    for c, cw in zip(text, widths):
        d.text((cx, 40), c, font=font, fill=255)
        cx += cw + track
    grad = Image.new("RGB", (w, h))
    gd = ImageDraw.Draw(grad)
    for yy in range(h):
        t = yy / (h - 1)
        gd.line([(0, yy), (w, yy)], fill=tuple(int(a + (b - a) * t) for a, b in zip(GOLD_TOP, GOLD_BOT)))
    glow = Image.new("RGBA", (w, h), (255, 214, 150, 0))
    glow.putalpha(mask.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.55)))
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow.putalpha(mask.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * 0.6)))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out = Image.alpha_composite(out, shadow)
    out = Image.alpha_composite(out, glow)
    fill = grad.convert("RGBA"); fill.putalpha(mask)
    return Image.alpha_composite(out, fill).crop(out.getbbox())

def plain_text(text, font):
    """Small, quiet credit: soft off-white, no glow, semi-transparent."""
    l, t, r, b = font.getbbox(text)
    im = Image.new("RGBA", (r - l + 4, b - t + 4), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((2 - l, 2 - t), text, font=font, fill=(225, 220, 210, 150))
    return im

def divider(width):
    h = 30
    im = Image.new("RGBA", (width, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = (222, 190, 128, 255)
    mid = width // 2
    for side in (-1, 1):
        for k in range(mid - 22):
            a = int(255 * (1 - k / (mid - 22)) ** 1.2)
            xx = mid + side * (22 + k)
            d.point((xx, h // 2), fill=c[:3] + (a,))
    d.polygon([(mid, h // 2 - 9), (mid + 9, h // 2), (mid, h // 2 + 9), (mid - 9, h // 2)], fill=c)
    return im

def titles(W, H, d):
    s = W / 1920 if W > H else W / 1080 * 0.92
    names = gold_text("Ravi & Sakshi", ImageFont.truetype(f"{FONTS}/vibes.ttf", int(170 * s)))
    days = gold_text("10 DAYS TO GO", ImageFont.truetype(f"{FONTS}/cinzel.ttf", int(60 * s)), track=int(16 * s))
    credit = plain_text("Edit by : Parth Joshi", ImageFont.truetype(f"{FONTS}/corm.ttf", int(21 * s)))
    line = divider(int(520 * s))
    shade = Image.new("L", (W, H), 0)
    sw, sh = int(names.size[0] * 1.25), int((names.size[1] + days.size[1]) * 1.9)
    ImageDraw.Draw(shade).ellipse([(W - sw) // 2, H // 2 - sh // 2 - int(30 * s),
                                   (W + sw) // 2, H // 2 + sh // 2 - int(30 * s)], fill=120)
    shade = shade.filter(ImageFilter.GaussianBlur(int(90 * s)))
    sh_im = Image.new("RGBA", (W, H), (20, 16, 12, 0)); sh_im.putalpha(shade)
    sh_im.save(f"{d}/shade.png")
    for name, im in [("names", names), ("days", days), ("credit", credit), ("line", line)]:
        im.save(f"{d}/{name}.png")
    return names.size, days.size, credit.size, line.size

def build(orient):
    W, H = (1920, 1080) if orient == "16x9" else (1080, 1920)
    d = os.path.join(WORK, orient); os.makedirs(d, exist_ok=True)
    parts = []
    for i, shot in enumerate(SHOTS):
        p = f"{d}/s{i:02d}.mp4"
        dur = (round(CUTS[i + 1] * FPS) - round(CUTS[i] * FPS)) / FPS  # frame-exact
        segment(i, shot, dur, W, H, p)
        parts.append(p)
    with open(f"{d}/list.txt", "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    (nw, nh), (dw, dh), (cw, ch), (lw, lh) = titles(W, H, d)

    T = CUTS[-1]
    R = CUTS[-2]  # reveal shot start
    bar = 0  # no letterbox: open, airy frame like the reference
    cy = H // 2 - (40 if orient == "16x9" else 60)
    ny = cy - nh + 30
    ly = cy + 40
    dy = ly + lh + 22
    # small credit tucked in the bottom-right corner
    cx = W - cw - (40 if bar else 36)
    cyy = H - bar + (bar - ch) // 2 if bar else H - ch - 34

    def a(st, du):  # fade-in alpha for overlays
        return f"fade=in:st={st}:d={du}:alpha=1"
    fc = (
        f"[0:v]setpts=PTS-STARTPTS[v0];"
        # darken + soften during the reveal so the gold type breathes
        f"[v0]eq=brightness='-0.04*clip((t-{R+0.2})/1.4,0,1)':eval=frame,"
        f"noise=alls=3:allf=t[v1];"
        f"[6:v]format=rgba,{a(R+0.2, 1.4)}[sh];"
        f"[v1][sh]overlay=0:0:format=auto[v1s];"
        f"[2:v]format=rgba,{a(R+0.5, 1.3)}[n];"
        f"[3:v]format=rgba,{a(R+1.3, 1.0)}[l];"
        f"[4:v]format=rgba,{a(R+1.7, 1.1)}[d];"
        f"[5:v]format=rgba,{a(R+2.4, 1.0)}[c];"
        f"[v1s][n]overlay=x=(W-w)/2:y='{ny}+18*exp(-max(t-{R+0.5},0)*1.2)':format=auto[o1];"
        f"[o1][l]overlay=x=(W-w)/2:y={ly}[o2];"
        f"[o2][d]overlay=x=(W-w)/2:y={dy}[o3];"
    )
    if bar:
        fc += (f"[o3]drawbox=x=0:y=0:w=iw:h={bar}:color=black:t=fill,"
               f"drawbox=x=0:y=ih-{bar}:w=iw:h={bar}:color=black:t=fill[o4];")
    else:
        fc += "[o3]null[o4];"
    fc += f"[o4][c]overlay=x={cx}:y={cyy}[o5];"
    fc += (f"[o5]fade=in:st=0:d=0.6,fade=out:st={T-1.0}:d=1.0,format=yuv420p[vout];"
           # song: the Raanjhana reference track, as-is, gentle fade at the end
           f"[1:a]atrim=0:{T},asetpts=PTS-STARTPTS,afade=in:st=0:d=0.2,"
           f"afade=out:st={T-4.5}:d=4.0,"
           f"aformat=sample_rates=48000:channel_layouts=stereo[aout]")
    out = os.path.join(OUT, f"Ravi_Sakshi_10_Days_To_Go_v2_{orient}.mp4")
    run(["ffmpeg", "-v", "error", "-y",
         "-f", "concat", "-safe", "0", "-i", f"{d}/list.txt",
         "-i", REF,
         "-loop", "1", "-t", str(T), "-i", f"{d}/names.png",
         "-loop", "1", "-t", str(T), "-i", f"{d}/line.png",
         "-loop", "1", "-t", str(T), "-i", f"{d}/days.png",
         "-loop", "1", "-t", str(T), "-i", f"{d}/credit.png",
         "-loop", "1", "-t", str(T), "-i", f"{d}/shade.png",
         "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "14M", "-bufsize", "28M", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", str(T), out])
    print("wrote", out)

os.makedirs(OUT, exist_ok=True)
for o in ORIENTS:
    build(o)
