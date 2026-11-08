#!/usr/bin/env python3
"""Ravi & Sakshi — "10 Days To Go" pre-wedding teaser.

Beat-synced cinematic edit built from four 10s scenes, styled after the
Kush & Priya reference (song, pacing, warm film grade, B&W flash cuts).

usage: render.py <uploads_dir> <fonts_dir> <work_dir> <out_dir> [16x9|9x16 ...]
"""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

UP, FONTS, WORK, OUT = sys.argv[1:5]
ORIENTS = sys.argv[5:] or ["16x9", "9x16"]
FPS = 25

def src(tag):
    return glob.glob(os.path.join(UP, f"*{tag}*.mp4"))[0]

GARDEN = src("16-59-26")    # garden meeting, hands held
ARCHES = src("17-02-21")    # palace arches, bride on balcony, groom walk
SUNSET = src("17-08-12")    # dupatta at sunset, faces, silhouette under arch
TERRACE = src("17-11-31")   # palace terrace at golden hour
REF = src("Kush__Priya")    # reference reel: song

# Cut points land on the reference song's beats (onset peaks).
# (clip, src_start, speed, focus_x for 9:16, b&w, white-flash-in, zoom_from, zoom_to)
CUTS = [0.0, 1.64, 1.96, 2.44, 4.04, 5.40, 7.20, 9.08, 10.56, 11.72,
        13.48, 14.64, 16.04, 17.20, 19.00, 28.00]
SHOTS = [
    (ARCHES, 0.0, 1.0, 0.50, False, False, 1.10, 1.20),   # corridor of arches
    (TERRACE, 0.4, 1.0, 0.45, False, True, 1.12, 1.15),   # flash: palace
    (SUNSET, 0.2, 1.0, 0.45, True, True, 1.12, 1.16),     # flash: dupatta (b&w)
    (GARDEN, 1.0, 1.0, 0.62, False, True, 1.10, 1.16),    # bride walks to him
    (SUNSET, 0.0, 0.8, 0.55, False, False, 1.10, 1.18),   # dupatta in sunset
    (ARCHES, 4.4, 1.0, 0.66, False, False, 1.12, 1.18),   # bride on balcony
    (ARCHES, 7.4, 1.0, 0.62, True, True, 1.10, 1.16),     # groom walks (b&w)
    (GARDEN, 6.4, 1.0, 0.55, False, True, 1.12, 1.20),    # hands held
    (SUNSET, 4.0, 1.0, 0.50, False, False, 1.10, 1.14),   # the two of them
    (TERRACE, 2.4, 1.0, 0.50, False, False, 1.10, 1.16),  # hand in hand
    (GARDEN, 8.5, 1.0, 0.55, False, True, 1.18, 1.24),    # close smile
    (TERRACE, 7.0, 1.0, 0.55, False, False, 1.12, 1.20),  # tender moment
    (TERRACE, 0.0, 1.0, 0.45, True, True, 1.10, 1.14),    # together (b&w)
    (GARDEN, 0.0, 1.0, 0.42, False, False, 1.10, 1.14),   # garden, waiting
    (SUNSET, 6.0, 0.45, 0.48, False, False, 1.10, 1.22),  # silhouette: reveal
]

GRADE = ("eq=contrast=1.07:saturation=0.90:gamma=0.98,"
         "colorbalance=rs=0.04:bs=-0.05:rm=0.03:bm=-0.03:rh=0.05:gh=0.01:bh=-0.07,"
         "curves=all='0/0.035 0.25/0.22 0.5/0.5 0.8/0.83 1/0.96'")

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
GOLD_TOP, GOLD_BOT = (247, 231, 186), (196, 152, 82)

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
    days = gold_text("10 DAYS TO GO", ImageFont.truetype(f"{FONTS}/cinzel.ttf", int(54 * s)), track=int(16 * s))
    credit = gold_text("Edit by : Parth Joshi", ImageFont.truetype(f"{FONTS}/corm.ttf", int(30 * s)), track=1)
    line = divider(int(520 * s))
    for name, im in [("names", names), ("days", days), ("credit", credit), ("line", line)]:
        im.save(f"{d}/{name}.png")
    return names.size, days.size, credit.size, line.size

def build(orient):
    W, H = (1920, 1080) if orient == "16x9" else (1080, 1920)
    d = os.path.join(WORK, orient); os.makedirs(d, exist_ok=True)
    parts = []
    for i, shot in enumerate(SHOTS):
        p = f"{d}/s{i:02d}.mp4"
        segment(i, shot, CUTS[i + 1] - CUTS[i], W, H, p)
        parts.append(p)
    with open(f"{d}/list.txt", "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    (nw, nh), (dw, dh), (cw, ch), (lw, lh) = titles(W, H, d)

    T = CUTS[-1]
    R = CUTS[-2]  # reveal shot start
    bar = 100 if orient == "16x9" else 0
    cy = H // 2 - (40 if orient == "16x9" else 60)
    ny = cy - nh + 30
    ly = cy + 40
    dy = ly + lh + 22
    # 16:9: credit sits inside the bottom letterbox bar; 9:16: low in frame
    cyy = H - bar + (bar - ch) // 2 if bar else H - ch - 220

    def a(st, du):  # fade-in alpha for overlays
        return f"fade=in:st={st}:d={du}:alpha=1"
    fc = (
        f"[0:v]setpts=PTS-STARTPTS[v0];"
        # darken + soften during the reveal so the gold type breathes
        f"[v0]eq=brightness='-0.13*clip((t-{R+0.8})/1.6,0,1)':eval=frame,"
        f"vignette=angle=PI/4.2,noise=alls=7:allf=t[v1];"
        f"[2:v]format=rgba,{a(R+1.3, 1.6)}[n];"
        f"[3:v]format=rgba,{a(R+2.6, 1.2)}[l];"
        f"[4:v]format=rgba,{a(R+3.2, 1.4)}[d];"
        f"[5:v]format=rgba,{a(R+5.0, 1.2)}[c];"
        f"[v1][n]overlay=x=(W-w)/2:y='{ny}+18*exp(-max(t-{R+1.3},0)*1.2)':format=auto[o1];"
        f"[o1][l]overlay=x=(W-w)/2:y={ly}[o2];"
        f"[o2][d]overlay=x=(W-w)/2:y={dy}[o3];"
    )
    if bar:
        fc += (f"[o3]drawbox=x=0:y=0:w=iw:h={bar}:color=black:t=fill,"
               f"drawbox=x=0:y=ih-{bar}:w=iw:h={bar}:color=black:t=fill[o4];")
    else:
        fc += "[o3]null[o4];"
    fc += f"[o4][c]overlay=x=(W-w)/2:y={cyy}[o5];"
    fc += (f"[o5]fade=in:st=0:d=0.6,fade=out:st={T-1.3}:d=1.3,format=yuv420p[vout];"
           # song: play the reference track, then a beat-aligned loop back into its
           # quiet bridge for the reveal, fading out under the credit
           f"[1:a]atrim=0:18.9,asetpts=PTS-STARTPTS[a1];"
           f"[1:a]atrim=5.375:16.2,asetpts=PTS-STARTPTS[a2];"
           f"[a1][a2]acrossfade=d=1.5:c1=tri:c2=tri,atrim=0:{T},"
           f"afade=in:st=0:d=0.3,afade=out:st={T-3.0}:d=3.0,"
           f"aformat=sample_rates=48000:channel_layouts=stereo[aout]")
    out = os.path.join(OUT, f"Ravi_Sakshi_10_Days_To_Go_{orient}.mp4")
    run(["ffmpeg", "-v", "error", "-y",
         "-f", "concat", "-safe", "0", "-i", f"{d}/list.txt",
         "-i", REF,
         "-loop", "1", "-t", str(T), "-i", f"{d}/names.png",
         "-loop", "1", "-t", str(T), "-i", f"{d}/line.png",
         "-loop", "1", "-t", str(T), "-i", f"{d}/days.png",
         "-loop", "1", "-t", str(T), "-i", f"{d}/credit.png",
         "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "14M", "-bufsize", "28M", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", str(T), out])
    print("wrote", out)

os.makedirs(OUT, exist_ok=True)
for o in ORIENTS:
    build(o)
