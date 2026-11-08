#!/usr/bin/env python3
"""Ravi & Sakshi — pre-wedding teaser, v3 (42s, 16:9): cinematic grade, own cuts.

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
CASUAL = src("18-30-40")    # casual seaside promenade: walks, close-ups
LAKE = src("18-42-28")      # lake palace: walk, café, laughs, railing
HAVELI = src("18-44-00")    # haveli lanes: painted door, glances, walk
# black-outfit clip (GLAM): only the couple's twirl (6.5-7.9s) is used

# v3 uses its own cut pattern on the same song: two-pulse cuts through the
# intro, the chorus alternating full bars with half-bar pairs, and more,
# shorter slow-motion shots through the quiet verse.
def S(clip, ss, speed=1.0, z0=1.14, z1=1.19):
    # (clip, src_start, speed, focus_x, b&w, white-flash-in, zoom_from, zoom_to)
    # zoom >= 1.14 also keeps the generator watermark out of frame
    return (clip, ss, speed, .5, False, False, z0, z1)

R = lambda fast, slow, frac: (fast, slow, frac)   # speed ramp

TIMELINE = [
    # intro: the two of them, introduced on the song's soft pulses
    (0.00, S(LAKE, 0.0, 0.7, 1.14, 1.22)),          # lake palace, he walks in
    (1.37, S(HAVELI, 0.3)),                          # haveli lane
    (2.02, S(STAIRS, 0.2)),                          # palace stairs
    (2.55, S(HAVELI, 2.2)),                          # she waits by the painted door
    (3.09, S(STAIRS, 1.6)),                          # dupatta
    (3.62, S(LAKE, 3.5)),                            # chai by the lake
    (4.16, S(BLOOM, 0.3)),                           # pastel garden
    (4.69, S(CASUAL, 3.8, 0.8)),                        # checks his watch
    (5.22, S(LAKE, 4.85)),                           # she laughs, hair tucked back
    (5.74, S(GHAT, 2.6)),                            # saree in the wind
    (6.27, S(BLOOM, 4.3)),                           # floral jewellery
    (6.80, S(HAVELI, 3.55)),                         # glasses come off
    (7.34, S(LAKE, 4.25, 0.6)),                      # his laugh, slowed
    # chorus: speed ramps on the big moments, quick casual beats between
    (8.08, S(GLAM, 6.5, R(1.6, 0.5, 0.35))),         # twirl: whip into slow-mo
    (8.83, S(HAVELI, 6.3)),                          # hand in hand down the lane
    (9.37, S(BLOOM, 7.45, R(1.5, 0.5, 0.3))),        # veil twirl, ramped
    (10.47, S(HAVELI, 5.0)),                         # that glance
    (10.98, S(CASUAL, 5.0)),                         # hair tucked back
    (11.50, S(STAIRS, 7.5, R(1.8, 0.6, 0.33))),      # walking to each other, ramped
    (12.57, S(LAKE, 6.0)),                           # lakeside walk
    (13.10, S(GHAT, 6.0)),                           # hands by the diyas
    (13.80, S(CASUAL, 5.45)),                        # close, by the sea
    (14.93, S(GARDEN, 6.4)),                         # [v1] hands held
    (15.40, S(BLOOM, 8.6)),                          # sunset, hand in hand
    # verse: slow motion, let the moments breathe
    (15.97, S(LAKE, 8.0, 0.6, z1=1.22)),             # side by side at the railing
    (18.65, S(HAVELI, 3.5, 0.5, z1=1.24)),           # close-up, glasses off
    (21.33, S(SUNSET, 0.0, 0.6, z1=1.22)),           # [v1] dupatta at sunset
    (23.50, S(CASUAL, 7.05, 0.6, z1=1.21)),          # hand in hand by the sea
    (25.67, S(GHAT, 2.4, 0.5, z1=1.22)),             # saree in the wind
    (28.87, S(LAKE, 2.3, 0.32, z1=1.21)),            # café, he walks up to her
    (32.00, S(STAIRS, 1.6, 0.6, z1=1.21)),           # dupatta twirl
    (34.00, S(HAVELI, 5.0, 0.6, z1=1.21)),           # the glance, slowed
    (35.60, S(BLOOM, 2.0, 0.6, z1=1.20)),            # groom under the flower arch
    (37.93, S(STAIRS, 9.25, 0.18, z1=1.20)),         # the couple at the palace: reveal
]
CUTS = [t for t, _ in TIMELINE] + [42.00]
SHOTS = [shot for _, shot in TIMELINE]

# cinematic Bollywood-song look: warm skin and highlights, a gentle teal in
# the shadows, soft S-curve with lifted blacks, a light highlight glow.
# Not dark, not over-saturated, not high contrast.
GRADE = ("colorbalance=rs=-0.035:gs=0.0:bs=0.035:rm=0.015:bm=-0.01:rh=0.035:gh=0.01:bh=-0.03,"
         "eq=contrast=1.03:saturation=0.92:brightness=0.02:gamma=1.04,"
         "curves=all='0/0.035 0.25/0.235 0.5/0.52 0.75/0.78 1/0.97',"
         "split[g0][g1];[g1]gblur=sigma=24[g2];"
         "[g0][g2]blend=all_mode=screen:all_opacity=0.14")

def run(cmd):
    subprocess.run(cmd, check=True)

def segment(i, shot, dur, W, H, path):
    """A shot. speed may be a number, or a speed ramp (fast, slow, frac):
    the first `frac` of the shot runs at `fast`, then it eases into `slow`."""
    clip, ss, speed, fx, bw, flash, z0, z1 = shot
    if isinstance(speed, tuple):
        fast, slow, frac = speed
        na = round(dur * frac * FPS); nb = round(dur * FPS) - na
        zm = z0 + (z1 - z0) * frac
        pa, pb = path + ".a.mp4", path + ".b.mp4"
        segment(i, (clip, ss, fast, fx, bw, flash, z0, zm), na / FPS, W, H, pa)
        segment(i, (clip, ss + na / FPS * fast, slow, fx, bw, False, zm, z1), nb / FPS, W, H, pb)
        with open(path + ".txt", "w") as fh:
            fh.write(f"file '{pa}'\nfile '{pb}'\n")
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path + ".txt",
             "-c", "copy", path])
        return
    assert ss + dur * speed <= 10.03, f"shot {i} runs past the end of its clip"
    n = round(dur * FPS)
    cw = min(1280, round(720 * W / H)) // 2 * 2
    x = int(min(max(fx * 1280 - cw / 2, 0), 1280 - cw))
    f = []
    if speed > 1.0:
        f.append(f"setpts={1/speed:.4f}*PTS,fps={FPS}")
    elif speed < 1.0:
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
    # closing card on black: "Designed & Directed by / Parth D. Joshi"
    top = gold_text("Designed & Directed by", ImageFont.truetype(f"{FONTS}/corm.ttf", int(40 * s)), track=2)
    name = gold_text("PARTH D. JOSHI", ImageFont.truetype(f"{FONTS}/cinzel.ttf", int(64 * s)), track=int(14 * s))
    credit = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gap = int(16 * s)
    y0 = (H - top.size[1] - gap - name.size[1]) // 2
    credit.alpha_composite(top, ((W - top.size[0]) // 2, y0))
    credit.alpha_composite(name, ((W - name.size[0]) // 2, y0 + top.size[1] + gap))
    line = divider(int(520 * s))
    shade = Image.new("L", (W, H), 0)
    sw, sh = int(names.size[0] * 1.25), int((names.size[1] + days.size[1]) * 1.9)
    ImageDraw.Draw(shade).ellipse([(W - sw) // 2, H // 2 - sh // 2 - int(30 * s),
                                   (W + sw) // 2, H // 2 + sh // 2 - int(30 * s)], fill=120)
    shade = shade.filter(ImageFilter.GaussianBlur(int(90 * s)))
    sh_im = Image.new("RGBA", (W, H), (20, 16, 12, 0)); sh_im.putalpha(shade)
    sh_im.save(f"{d}/shade.png")
    days = line = Image.new("RGBA", (2, 2), (0, 0, 0, 0))  # v3: no "10 days to go"
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
        if not (os.environ.get("REUSE") and os.path.exists(p)):  # REUSE=1 keeps rendered shots
            segment(i, shot, dur, W, H, p)
        parts.append(p)
    with open(f"{d}/list.txt", "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    (nw, nh), (dw, dh), (cw, ch), (lw, lh) = titles(W, H, d)

    T = CUTS[-1]
    R = CUTS[-2]  # reveal shot start
    bar = 0  # no letterbox: open, airy frame like the reference
    cy = H // 2 - (40 if orient == "16x9" else 60)
    ny = H // 2 - nh // 2 - 10  # v3: names only, centred
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
        f"[v1s][n]overlay=x=(W-w)/2:y='{ny}+18*exp(-max(t-{R+0.5},0)*1.2)':format=auto[o1];"
        f"[o1][l]overlay=x=(W-w)/2:y={ly}[o2];"
        f"[o2][d]overlay=x=(W-w)/2:y={dy}[o3];"
    )
    if bar:
        fc += (f"[o3]drawbox=x=0:y=0:w=iw:h={bar}:color=black:t=fill,"
               f"drawbox=x=0:y=ih-{bar}:w=iw:h={bar}:color=black:t=fill[o4];")
    else:
        fc += "[o3]null[o4];"
    E = 4.0  # black end card
    fc += (f"[o4]fade=in:st=0:d=0.6,fade=out:st={T-1.0}:d=1.0,"
           f"tpad=stop_mode=add:stop_duration={E}:color=black[o5];"
           f"[5:v]format=rgba,fade=in:st={T+0.4}:d=0.9:alpha=1,"
           f"fade=out:st={T+E-0.9}:d=0.8:alpha=1[c];"
           f"[o5][c]overlay=0:0:format=auto,format=yuv420p[vout];"
           # song: the Raanjhana reference track, as-is, gentle fade at the end
           f"[1:a]atrim=0:{T},asetpts=PTS-STARTPTS,afade=in:st=0:d=0.2,"
           f"afade=out:st={T-4.5}:d=4.0,apad=whole_dur={T+E},"
           f"aformat=sample_rates=48000:channel_layouts=stereo[aout]")
    out = os.path.join(OUT, f"Ravi_Sakshi_v3_Cinematic_{orient}.mp4")
    run(["ffmpeg", "-v", "error", "-y",
         "-f", "concat", "-safe", "0", "-i", f"{d}/list.txt",
         "-i", REF,
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/names.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/line.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/days.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/credit.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/shade.png",
         "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "14M", "-bufsize", "28M", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", str(T + E), out])
    print("wrote", out)

os.makedirs(OUT, exist_ok=True)
for o in ORIENTS:
    build(o)
