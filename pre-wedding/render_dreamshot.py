#!/usr/bin/env python3
"""Ravi & Sakshi — DreamShot-style teaser (16:9 + 9:16) on that reel's song, cut on its beat grid.

Built mainly from the four new scenes plus three shots from v1, styled after
the Raanjhana reference (song, pacing, soft low-saturation colour).

usage: render.py <uploads_dir> <fonts_dir> <work_dir> <out_dir> [16x9|9x16 ...]
"""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from title_style import names_title, credit_card

UP, FONTS, WORK, OUT = sys.argv[1:5]
ORIENTS = sys.argv[5:] or ["16x9", "9x16"]
FPS = 25

def src(tag):
    return glob.glob(os.path.join(UP, f"*{tag}*.mp4"))[0]

GARDEN = src("16-59-26")    # garden meeting, hands held
ARCHES = src("17-02-21")    # palace arches, bride on balcony, groom walk
SUNSET = src("17-08-12")    # dupatta at sunset, faces, silhouette under arch
TERRACE = src("17-11-31")   # palace terrace at golden hour
REF = src("Best_Pre_Wedding")  # song: the DreamShot reference reel
STAIRS = src("17-23-02")    # palace staircase, red lehenga, arches at sunset
GLAM = src("17-29-53")      # black-tie night, glass skydeck
BLOOM = src("17-35-11")     # pastel flower garden
GHAT = src("17-35-34")      # ghats with floating diyas
CASUAL = src("18-30-40")    # casual seaside promenade: walks, close-ups
BAZAAR = src("2026-11-09-14-25-11")   # haveli bazaar lane: walk, close-up, hands
GHATWALK = src("2026-11-09-14-29-48") # morning ghat walk, close-up, hands held
BOAT = src("VID_20261109_143520")     # boat on the river: close-up, sitting together
SPICE = src("VID_20261109_143740")    # spice market: tasting, bowls, street walk
COURT = src("2026-11-09-14-42-36")    # haveli courtyard: wide, arch, hands, faces
STEPWELL = src("2026-11-09-14-44-59") # stepwell: walk down, close-up, hands
BEACH = src("2026-11-09-14-54-33")    # sunset shore: couple, ring on hands
DOVES = src("2026-11-09-14-51-11")    # balcony doves over the river
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
HOLD = lambda speed: ("hold", speed)              # play slowed, then hold the frame

# Final cut. Cut points follow the Raanjhana reference edit on its own song
# (fast pulse cuts in the intro, a cut on every chorus bar, a quick burst at
# 11.5s, long slow-motion verse). Every take is used exactly once.
# 15s vertical teaser: the song from 4.47s (intro flashes into the chorus),
# same cut points as the final edit, then the reveal and the credit card.
A = 0.0  # song offset

def V(clip, ss, speed=1.0, fx=0.5, z0=1.14, z1=1.19):
    # fx = horizontal focus (0-1) for the 9:16 crop
    return (clip, ss, speed, fx, False, False, z0, z1)

# DreamShot-style teaser on that reel's song (123 bpm). Cuts sit on the
# song's beat grid B(k) = 0.16 + 0.488k: a 1/3-beat flicker intro, then long
# romantic slow-motion shots of four beats with two-beat cuts in the louder
# middle, and the names over the closing shot.
def B(k): return round(0.16 + 0.488 * k, 3)
def BW(clip, ss, speed=1.0, fx=0.5, z0=1.14, z1=1.19):
    return (clip, ss, speed, fx, True, False, z0, z1)

# (clip, src_start, focus_x for the 9:16 crop)
FLICKER = [(GHAT, 0.3, .5), (LAKE, 0.3, .3), (BAZAAR, 0.4, .5), (SPICE, 0.5, .5), (BOAT, 3.2, .5),
           (STAIRS, 0.2, .5), (COURT, 1.0, .25), (STEPWELL, 9.3, .65), (BEACH, 3.8, .5), (HAVELI, 2.3, .5),
           (BLOOM, 0.4, .5), (CASUAL, 2.4, .5), (LAKE, 3.6, .5), (GARDEN, 0.4, .45), (ARCHES, 0.6, .5),
           (SPICE, 6.2, .5), (BOAT, 0.3, .5), (BLOOM, 4.4, .5), (STAIRS, 5.6, .5), (LAKE, 4.85, .5),
           (HAVELI, 9.0, .5), (GHATWALK, 0.6, .4)]
_T = [(0.0, V(FLICKER[0][0], FLICKER[0][1], 1.0, FLICKER[0][2]))]
_T += [(round(B(0) + i * 0.488 / 3, 3), V(c, ss, 1.0, fx)) for i, (c, ss, fx) in enumerate(FLICKER[1:])]
_T += [
    (B(7), V(SUNSET, 6.55, 0.7, 0.5, 1.12, 1.20)),   # silhouette under the palace arch
    (B(11), V(STAIRS, 7.5, 0.6, 0.6, 1.14, 1.21)),   # walking to each other in the arches
    (B(15), V(COURT, 3.8, 0.7, 0.4, 1.14, 1.21)),    # under the haveli arch
    (B(19), V(HAVELI, 6.3, 0.7, 0.5, 1.14, 1.21)),   # hand in hand down the lane
    (B(23), V(BLOOM, 7.5, 0.4, 0.55, 1.14, 1.21)),   # veil twirl, slow
    (B(27), V(STEPWELL, 0.5, 0.9)),                  # down the stepwell
    (B(29), V(DOVES, 2.0)),                          # doves take off
    (B(31), V(TERRACE, 2.4)),                        # the terrace
    (B(33), V(BEACH, 7.3)),                          # the ring
    (B(35), V(GHATWALK, 4.9, 1.0, 0.6)),             # close at sunrise
    (B(37), V(STAIRS, 1.5, R(1.4, 0.5, 0.35))),      # dupatta twirl, ramped
    (B(39), V(BAZAAR, 5.1, 1.0, 0.6)),               # her smile in the lane
    (B(41), V(COURT, 7.3)),                          # hands in the courtyard
    (B(43), V(HAVELI, 5.0, 1.0, 0.6)),               # that glance
    (B(45), V(DOVES, 4.3, 0.7)),                     # among the doves
    (B(49), V(TERRACE, 7.2, 0.7)),                   # a tender moment
    (B(53), V(BLOOM, 8.5, 0.7)),                     # sunset in the garden
    (B(57), V(GHATWALK, 8.0, 0.5, 0.45, 1.14, 1.21)),  # hand in hand at sunrise: names
]
TIMELINE = [(round(t - A, 2), shot) for t, shot in _T]
TEASER_END = 31.6  # picture ends with the song; then the credit card
CUTS = [t for t, _ in TIMELINE] + [TEASER_END]
SHOTS = [shot for _, shot in TIMELINE]

# colourful look: neutralise the orange cast, then let every colour read
GRADE = ("colortemperature=temperature=8600:mix=1,"
         "colorbalance=rm=-0.03:bm=0.03:rh=-0.02:bh=0.025,"
         "eq=contrast=1.07:saturation=1.4:brightness=0.03:gamma=1.1,"
         "curves=all='0/0.015 0.25/0.24 0.5/0.535 0.75/0.8 1/0.99',"
         "unsharp=5:5:0.5:5:5:0.0")

def run(cmd):
    subprocess.run(cmd, check=True)

def segment(i, shot, dur, W, H, path):
    """A shot. speed may be a number, or a speed ramp (fast, slow, frac):
    the first `frac` of the shot runs at `fast`, then it eases into `slow`."""
    clip, ss, speed, fx, bw, flash, z0, z1 = shot
    if isinstance(speed, tuple) and speed[0] != "hold":
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
    hold = isinstance(speed, tuple) and speed[0] == "hold"
    if hold:
        speed = speed[1]
    assert hold or ss + dur * speed <= 10.03, f"shot {i} runs past the end of its clip"
    n = round(dur * FPS)
    cw = min(1280, round(720 * W / H)) // 2 * 2
    x = int(min(max(fx * 1280 - cw / 2, 0), 1280 - cw))
    f = ["delogo=x=1148:y=650:w=114:h=48"]  # remove the generator watermark (same spot in every clip)
    if speed > 1.0:
        f.append(f"setpts={1/speed:.4f}*PTS,fps={FPS}")
    elif speed < 1.0:
        f.append(f"setpts={1/speed:.4f}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1")
    else:
        f.append(f"fps={FPS}")
    if hold:
        f.append(f"trim=duration={(10.0 - ss) / speed:.3f},tpad=stop_mode=clone:stop_duration=10")
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
    srclen = min(dur * speed + 0.5, 10.05 - ss) if hold else dur * speed + 0.5
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
    # titles in the "Hamari Prem Kahani" artwork style (gold calligraphy,
    # heart flourish, lotus divider) -- see title_style.py
    names = names_title(f"{FONTS}/parisienne.ttf", s if W > H else 1.0)
    if names.size[0] > W * 0.9:  # keep the whole block (heart to swirl) inside the frame
        names = names_title(f"{FONTS}/parisienne.ttf", W * 0.9 / names.size[0])
    days = gold_text("10 DAYS TO GO", ImageFont.truetype(f"{FONTS}/cinzel.ttf", int(60 * s)), track=int(16 * s))
    # closing card on black: "Designed & Directed by / Parth D. Joshi"
    credit = credit_card(f"{FONTS}/parisienne.ttf", W, H, s * (1.0 if W > H else 1.3))
    line = divider(int(520 * s))
    # "Coming Soon" card on black
    # "Save the Date" card on black
    cs_txt = gold_text("Save the Date", ImageFont.truetype(f"{FONTS}/vibes.ttf", int(150 * s)))
    cs_line = divider(int(420 * s))
    cs_day = gold_text("SATURDAY", ImageFont.truetype(f"{FONTS}/cinzel.ttf", int(40 * s)), track=int(12 * s))
    cs_date = gold_text("21ST NOVEMBER 2026", ImageFont.truetype(f"{FONTS}/cinzel.ttf", int(58 * s)), track=int(10 * s))
    coming = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = int(4 * s)
    tot = cs_txt.size[1] + cs_line.size[1] + cs_day.size[1] + cs_date.size[1] - int(20 * s)
    y = (H - tot) // 2
    for im, dy in [(cs_txt, -int(10 * s)), (cs_line, -int(4 * s)), (cs_day, -int(10 * s)), (cs_date, 0)]:
        coming.alpha_composite(im, ((W - im.size[0]) // 2, y))
        y += im.size[1] + dy
    coming.save(f"{d}/coming.png")
    shade = Image.new("L", (W, H), 0)
    sw, sh = int(names.size[0] * 1.25), int((names.size[1] + days.size[1]) * 1.9)
    ImageDraw.Draw(shade).ellipse([(W - sw) // 2, H // 2 - sh // 2 - int(30 * s),
                                   (W + sw) // 2, H // 2 + sh // 2 - int(30 * s)], fill=70)
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
        f"[v0]null[v1];"
        f"[6:v]format=rgba,{a(R, 0.8)}[sh];"
        f"[v1][sh]overlay=0:0:format=auto[v1s];"
        f"[2:v]format=rgba,{a(R+0.15, 0.8)}[n];"
        f"[3:v]format=rgba,{a(R+1.3, 1.0)}[l];"
        f"[4:v]format=rgba,{a(R+1.7, 1.1)}[d];"
        f"[v1s][n]overlay=x=(W-w)/2:y='{ny}+18*exp(-max(t-{R+0.15},0)*1.2)':format=auto[o1];"
        f"[o1][l]overlay=x=(W-w)/2:y={ly}[o2];"
        f"[o2][d]overlay=x=(W-w)/2:y={dy}[o3];"
    )
    if bar:
        fc += (f"[o3]drawbox=x=0:y=0:w=iw:h={bar}:color=black:t=fill,"
               f"drawbox=x=0:y=ih-{bar}:w=iw:h={bar}:color=black:t=fill[o4];")
    else:
        fc += "[o3]null[o4];"
    # end cards on black: optional "Coming Soon" card, then the credit card
    coming = False
    CS = 0.0  # no Save the Date card in this film
    E = 3.2
    fc += (f"[o4]fade=in:st=0:d=0.25,fade=out:st={T-0.6}:d=0.6,"
           f"tpad=stop_mode=add:stop_duration={E}:color=black[o5];"
           f"[7:v]format=rgba,fade=in:st={T+0.15}:d=0.5:alpha=1,"
           f"fade=out:st={T+CS-0.35}:d=0.3:alpha=1[cs];"
           f"[5:v]format=rgba,fade=in:st={T+CS+0.15}:d=0.5:alpha=1,"
           f"fade=out:st={T+E-0.45}:d=0.4:alpha=1[c];"
           f"[o5][cs]overlay=0:0:format=auto[o6];"
           f"[o6][c]overlay=0:0:format=auto,format=yuv420p[vout];"
           # song: the Raanjhana reference track, carried under the end cards
           f"[1:a]atrim={A}:{A + T + E},asetpts=PTS-STARTPTS,afade=in:st=0:d=0.15,"
           f"afade=out:st={T+E-1.6}:d=1.5,apad=whole_dur={T+E},"
           f"aformat=sample_rates=48000:channel_layouts=stereo[aout]")
    name = "DreamShot_Teaser"
    out = os.path.join(OUT, f"Ravi_Sakshi_{name}_{orient}.mp4")
    run(["ffmpeg", "-v", "error", "-y",
         "-f", "concat", "-safe", "0", "-i", f"{d}/list.txt",
         "-i", REF,
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/names.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/line.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/days.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/credit.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/shade.png",
         "-loop", "1", "-t", str(T + E), "-i", f"{d}/coming.png",
         "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "14M", "-bufsize", "28M", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", str(T + E), out])
    print("wrote", out)

os.makedirs(OUT, exist_ok=True)
for o in ORIENTS:
    build(o)
