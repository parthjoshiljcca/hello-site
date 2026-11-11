#!/usr/bin/env python3
"""Ravi & Sakshi — Banaras film (4:40, 16:9).

Re-cut of the team's earlier Banaras film (used with permission): every shot of
the previous couple is replaced, frame-for-frame on the same cut points, with a
matching Ravi & Sakshi shot; the B-roll, song and pacing stay. The corner logo
is cropped away throughout, "A FILM BY SHAGUN" becomes "A FILM BY PARTH D. JOSHI"
in the same style, the previous couple's name card becomes "Ravi & Sakshi", and
the closing logo card becomes "Ravi & Sakshi" and "Har Har Mahadev".

usage: render_banaras.py <uploads_dir> <fonts_dir> <work_dir> <out_dir>
"""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from title_style import names_title, lotus_divider, _finish

UP, FONTS, WORK, OUT = sys.argv[1:5]
FPS, W, H = 30, 1280, 720
os.makedirs(WORK, exist_ok=True)


def src(tag):
    return glob.glob(os.path.join(UP, f"*{tag}*.mp4"))[0]


BASE = src("Kuch_kahaniyan")
TEMPLE = src("2026-11-09-20-09-53")
BAZAAR = src("2026-11-09-14-25-11")
GHATWALK = src("2026-11-09-14-29-48")
BOAT = src("VID_20261109_143520")
SPICE = src("VID_20261109_143740")
COURT = src("2026-11-09-14-42-36")
STEPWELL = src("2026-11-09-14-44-59")
BEACH = src("2026-11-09-14-54-33")
DOVES = src("2026-11-09-14-51-11")
AARTI = src("2026-11-09-14-55-38")
STAIRS = src("17-23-02")
BLOOM = src("17-35-11")
GHAT = src("17-35-34")
GLAM = src("17-29-53")

# Shot boundaries of the base film (seconds): hard cuts, dips to black and soft
# cuts, found by scene detection and luma analysis.
BOUNDS = [0.0, 3.63, 6.23, 8.0, 9.63, 11.27, 13.23, 15.23, 16.87, 17.53, 18.83, 19.93,
          21.7, 24.27, 26.07, 27.4, 29.17, 30.5, 32.97, 34.73, 36.83, 38.3, 40.43, 41.97,
          43.73, 45.37, 47.07, 51.4, 53.1, 53.93, 54.5, 55.0, 55.7, 56.97, 57.63, 58.23,
          59.33, 60.03, 60.7, 62.3, 62.9, 63.2, 63.5, 64.0, 64.7, 66.47, 67.4, 67.67, 68.3,
          69.03, 69.5, 70.33, 70.7, 71.03, 72.27, 75.83, 78.87, 80.27, 87.73, 91.23, 95.37,
          95.83, 100.3, 111.57, 115.47, 120.23, 122.37, 124.47, 127.27, 129.23, 133.3,
          138.1, 142.2, 148.57, 151.4, 154.17, 155.8, 158.1, 160.33, 164.67, 168.97, 173.0,
          178.17, 182.87, 186.4, 189.23, 193.77, 200.2, 204.6, 209.17, 211.57, 213.7,
          218.07, 220.8, 223.07, 224.87, 227.17, 231.47, 233.73, 236.07, 240.33, 242.7,
          243.93, 245.13, 247.67, 249.47, 253.0, 255.13, 257.7, 260.37, 262.8, 264.83,
          267.27, 273.33, 280.37]
DIPS = {87.73, 95.37, 111.57, 122.37, 129.23, 133.3, 142.2, 148.57, 154.17, 160.33,
        168.97, 173.0, 186.4, 193.77, 209.17, 213.7, 223.07, 227.17, 231.47, 236.07,
        243.93, 249.47, 253.0, 257.7, 267.27, 273.33}

# segment index -> replacement (clip, src_start, speed, black&white)
R = {
    5: (TEMPLE, 6.6, 0.7), 12: (BEACH, 3.5, 0.6), 15: (GHATWALK, 0.3, 0.9),
    17: (BOAT, 0.05, 0.6), 28: (BOAT, 3.0, 0.9), 31: (COURT, 3.8, 1.0),
    32: (STEPWELL, 4.3, 0.8), 37: (STEPWELL, 0.3, 1.0), 38: (BAZAAR, 0.3, 1.0),
    41: (SPICE, 3.6, 1.0), 42: (BLOOM, 4.3, 1.0), 43: (COURT, 7.3, 1.0),
    48: (BAZAAR, 2.8, 1.0, True), 49: (STEPWELL, 6.8, 1.0, True), 51: (GHAT, 6.45, 1.0, True),
    56: (DOVES, 4.4, 0.8), 57: (AARTI, 7.45, 0.33), 63: (GHATWALK, 2.0, 0.48),
    64: (COURT, 0.0, 0.7), 67: (GHAT, 2.4, 0.55), 68: (TEMPLE, 8.05, 0.9),
    69: (BLOOM, 0.2, 0.4), 71: (DOVES, 7.9, 0.48), 73: (BEACH, 7.0, 0.5),
    74: (BAZAAR, 4.9, 0.6), 75: (SPICE, 0.3, 0.9), 76: (GHAT, 4.5, 0.4),
    77: (BEACH, 8.6, 0.6), 78: (STEPWELL, 1.2, 0.6), 79: (GHATWALK, 8.0, 0.45),
    80: (COURT, 8.75, 0.3), 81: (BAZAAR, 8.0, 0.38), 82: (DOVES, 2.0, 0.42),
    84: (STAIRS, 7.5, 0.5), 85: (GHAT, 0.0, 0.45), 92: (BLOOM, 8.5, 0.53),
    93: (SPICE, 5.8, 0.8), 94: (STAIRS, 5.5, 0.5), 95: (BLOOM, 5.25, 0.45),
    96: (STAIRS, 1.5, 0.5), 97: (COURT, 4.6, 0.85), 98: (SPICE, 3.95, 0.7),
    99: (GHATWALK, 4.85, 0.55), 100: (GLAM, 6.5, 0.55), 101: (STAIRS, 4.5, 0.55),
    102: (BLOOM, 7.5, 0.65), 103: (DOVES, 5.6, 0.55), 104: (STEPWELL, 5.4, 0.65),
    105: (TEMPLE, 0.2, 0.6), 106: (STEPWELL, 9.0, 0.45), 107: (BOAT, 3.78, 0.38),
    108: (STAIRS, 0.2, 0.48), 109: (STAIRS, 9.25, 0.27), 110: (SPICE, 1.85, 0.7),
    111: (GHAT, 9.2, 0.29),
}
BLACK = {58, 113}       # "A FILM BY SHAGUN" black card, closing logo card

# Re-key by segment start time, then add the fast black & white cuts (69.5-71.2s)
# that the first detection pass merged, replacing the old couple there too.
R = {round(BOUNDS[i], 3): v for i, v in R.items()}
BLACK = {round(BOUNDS[i], 3) for i in BLACK}
BOUNDS = sorted(BOUNDS + [69.7, 69.967, 70.867, 71.167])
R.update({
    69.5: (BLOOM, 2.3, 1.0, True),       # groom under the flower arch
    69.967: (BAZAAR, 6.6, 1.0, True),    # close-up in the lane
    70.867: (STEPWELL, 7.6, 1.0, True),  # hands on the steps
    71.03: (STAIRS, 3.8, 1.0, True),     # sherwani detail
    # boats B-roll that carried the previous couple's names: our water shot
    133.3: (BEACH, 0.0, 0.4),
})
# palace shot that carried "A FILM BY SHAGUN": rebuilt from its clean tail
# (92.55s on), slowed to the same length, so no patch is ever needed
SLOW_BASE = {91.23: (92.55, 95.37)}

# grade for our shots, matched to the base film's measured look
GRADE = ("colortemperature=temperature=7800:mix=0.9,"
         "eq=contrast=1.0:saturation=0.86:brightness=0.045:gamma=1.08,"
         "curves=all='0/0.025 0.5/0.545 1/0.975'")
# base film's corner logo sits in x<104, y<84: crop it away instead of
# blurring it (no patch), keeping 16:9
LOGO_CROP = "crop=1168:657:108:30"


def run(cmd):
    subprocess.run(cmd, check=True)


def fr(t):
    return round(t * FPS)


def our_shot(i, spec, n, path, fade_in, fade_out):
    clip, ss, speed = spec[:3]
    bw = len(spec) > 3 and spec[3]
    dur = n / FPS
    f = []
    if speed < 1.0:
        f.append(f"setpts={1/speed:.4f}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1")
    else:
        f.append(f"fps={FPS}")
    # generator watermark sits at x>1148, y>650: crop it away (no blur patch)
    f.append("crop=1136:639:6:4")
    f.append("scale=2560:1440:flags=lanczos")
    f.append(f"zoompan=z='1.02+0.05*on/{max(n-1,1)}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={W}x{H}:fps={FPS}")
    f.append(GRADE)
    if bw:
        f.append("hue=s=0,eq=contrast=1.08")
    if fade_in:
        f.append("fade=in:st=0:d=0.45")
    if fade_out:
        f.append(f"fade=out:st={dur-0.45:.3f}:d=0.45")
    f.append("setsar=1,format=yuv420p")
    assert ss + dur * speed <= 10.03, f"segment {i} runs past its clip"
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", f"{dur*speed+0.5:.3f}", "-i", clip,
         "-vf", ",".join(f), "-frames:v", str(n), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "14", path])


def base_piece(i, a, b, path):
    f = [f"trim=start_frame={a}:end_frame={b}", "setpts=PTS-STARTPTS", LOGO_CROP,
         f"scale={W}:{H}:flags=lanczos", "setsar=1", "format=yuv420p"]
    run(["ffmpeg", "-v", "error", "-y", "-i", BASE, "-vf", ",".join(f), "-an",
         "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "14", path])


def base_slow(src_a, src_b, n, path):
    speed = (src_b - src_a) / (n / FPS)
    f = [f"trim=start={src_a}:end={src_b}", "setpts=PTS-STARTPTS", LOGO_CROP,
         f"scale={W}:{H}:flags=lanczos",
         f"setpts={1/speed:.4f}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1",
         "tpad=stop_mode=clone:stop_duration=0.3",  # exact frame count
         "setsar=1", "format=yuv420p"]
    run(["ffmpeg", "-v", "error", "-y", "-i", BASE, "-vf", ",".join(f), "-an", "-frames:v", str(n),
         "-c:v", "libx264", "-preset", "medium", "-crf", "14", path])


def black_piece(n, path):
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=black:s={W}x{H}:r={FPS}",
         "-frames:v", str(n), "-vf", "format=yuv420p", "-c:v", "libx264", "-preset", "medium",
         "-crf", "14", path])


def film_by_png(path):
    """'A FILM BY PARTH D. JOSHI' in the base film's style: light serif capitals,
    the name in bold, centred where the original credit sat."""
    s = W / 1276
    small = ImageFont.truetype(f"{FONTS}/cinzel_r.ttf", int(25 * s))
    big = ImageFont.truetype(f"{FONTS}/cinzel_b.ttf", int(30 * s))
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    a, b = "A FILM BY ", "PARTH D. JOSHI"
    wa = d.textlength(a, font=small)
    wb = d.textlength(b, font=big)
    x = (W - wa - wb) / 2
    base_y = int(373 * H / 718)
    asc_s, _ = small.getmetrics(); asc_b, _ = big.getmetrics()
    for dx, dy in ((1, 1), (2, 2)):
        d.text((x + dx, base_y - asc_s + dy), a, font=small, fill=(0, 0, 0, 90))
        d.text((x + wa + dx, base_y - asc_b + dy), b, font=big, fill=(0, 0, 0, 90))
    d.text((x, base_y - asc_s), a, font=small, fill=(242, 240, 236, 255))
    d.text((x + wa, base_y - asc_b), b, font=big, fill=(255, 255, 255, 255))
    im.save(path)


def names_lower_png(path):
    """'Ravi & Sakshi' lower third in the base film's style (thin, white)."""
    font = ImageFont.truetype(f"{FONTS}/corm_r.ttf", int(48 * W / 1276))
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    t = "Ravi & Sakshi"
    l, tp, r, b = d.textbbox((0, 0), t, font=font)
    x = (W - (r - l)) / 2 - l
    y = int(655 * H / 718) - b
    for dx, dy, a in ((1, 1, 140), (2, 2, 90), (0, 0, 60)):
        d.text((x + dx, y + dy), t, font=font, fill=(0, 0, 0, a), stroke_width=2 if a == 60 else 0)
    d.text((x, y), t, font=font, fill=(250, 248, 244, 255))
    im.save(path)


def end_names_png(path):
    """Closing card: 'Ravi & Sakshi' big, gold calligraphy, centred."""
    n = names_title(f"{FONTS}/parisienne.ttf", 1.0)
    n = names_title(f"{FONTS}/parisienne.ttf", W * 0.84 / n.size[0])  # big, inside the frame
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.alpha_composite(n, ((W - n.size[0]) // 2, (H - n.size[1]) // 2))
    im.save(path)


def mahadev_png(path):
    """Closing card: 'HAR HAR MAHADEV' in gold capitals with the lotus divider."""
    font = ImageFont.truetype(f"{FONTS}/cinzel_b.ttf", 64)
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    t = "HAR HAR MAHADEV"
    track = 10
    widths = [d.textlength(c, font=font) for c in t]
    tw = sum(widths) + track * (len(t) - 1)
    l, tp, r, b = d.textbbox((0, 0), t, font=font)
    x = (W - tw) / 2
    y = H // 2 - 70
    for c, cw in zip(t, widths):
        d.text((x, y - tp), c, font=font, fill=255)
        x += cw + track
    lotus_divider(d, W // 2, y + (b - tp) + 22, 52, int(tw * 0.42), 3)
    out = _finish(mask, 0)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    im.alpha_composite(out, ((W - out.size[0]) // 2, (H - out.size[1]) // 2))
    im.save(path)


def main():
    parts = []
    for i, (a_t, b_t) in enumerate(zip(BOUNDS, BOUNDS[1:])):
        a, b = fr(a_t), fr(b_t)
        p = os.path.join(WORK, f"p{i:03d}.mp4")
        parts.append(p)
        if os.environ.get("REUSE") and os.path.exists(p):
            continue
        k = round(a_t, 3)
        if k in R:
            our_shot(i, R[k], b - a, p, a_t in DIPS, b_t in DIPS)
        elif k in BLACK:
            black_piece(b - a, p)
        elif k in SLOW_BASE:
            base_slow(*SLOW_BASE[k], b - a, p)
        else:
            base_piece(i, a, b, p)
    with open(os.path.join(WORK, "list.txt"), "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    film_by_png(os.path.join(WORK, "filmby.png"))
    names_lower_png(os.path.join(WORK, "names_lower.png"))
    end_names_png(os.path.join(WORK, "end_names.png"))
    mahadev_png(os.path.join(WORK, "mahadev.png"))
    T = BOUNDS[-1]
    out = os.path.join(OUT, "Ravi_Sakshi_Banaras_Film_16x9.mp4")
    # credit stays through the palace shot (same span as the original credit,
    # now a little longer), then fades; names lower third where the old one sat;
    # closing card: names, then Har Har Mahadev
    fc = (f"[2:v]format=rgba,fade=in:st=87.8:d=0.8:alpha=1,fade=out:st=93.6:d=0.7:alpha=1[t];"
          f"[3:v]format=rgba,fade=in:st=135.0:d=0.6:alpha=1,fade=out:st=140.9:d=0.6:alpha=1[nl];"
          f"[4:v]format=rgba,fade=in:st=273.7:d=0.9:alpha=1,fade=out:st=276.5:d=0.6:alpha=1[en];"
          f"[5:v]format=rgba,fade=in:st=277.3:d=0.8:alpha=1,fade=out:st=279.6:d=0.7:alpha=1[hm];"
          f"[0:v][t]overlay=0:0:enable='between(t,87.7,94.4)':format=auto[v1];"
          f"[v1][nl]overlay=0:0:enable='between(t,134.9,141.6)':format=auto[v2];"
          f"[v2][en]overlay=0:0:enable='between(t,273.6,277.2)':format=auto[v3];"
          f"[v3][hm]overlay=0:0:enable='between(t,277.2,280.4)':format=auto,format=yuv420p[v]")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(WORK, "list.txt"),
         "-i", BASE, "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "filmby.png"),
         "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "names_lower.png"),
         "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "end_names.png"),
         "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "mahadev.png"),
         "-filter_complex", fc, "-map", "[v]", "-map", "1:a",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "10M", "-bufsize", "20M",
         "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", str(T), out])
    print("wrote", out)


if __name__ == "__main__":
    main()
