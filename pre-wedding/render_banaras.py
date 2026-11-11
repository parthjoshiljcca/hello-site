#!/usr/bin/env python3
"""Ravi & Sakshi — Banaras film (4:40, 16:9).

Re-cut of the team's earlier Banaras film (used with permission): every shot of
the previous couple is replaced, frame-for-frame on the same cut points, with a
matching Ravi & Sakshi shot; the B-roll, song and pacing stay. The corner logo
is removed throughout, "A FILM BY SHAGUN" becomes "A FILM BY PARTH D. JOSHI"
in the same style and timing, and the closing logo card becomes black.

usage: render_banaras.py <uploads_dir> <fonts_dir> <work_dir> <out_dir>
"""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

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
TEXT_SEG = 59           # palace shot carrying the end of the film-by text

# grade for our shots, matched to the base film's measured look
GRADE = ("colortemperature=temperature=7800:mix=0.9,"
         "eq=contrast=1.0:saturation=0.86:brightness=0.045:gamma=1.08,"
         "curves=all='0/0.025 0.5/0.545 1/0.975'")
LOGO = "delogo=x=6:y=6:w=96:h=76"           # base film's corner logo
FILMBY_BOX = "delogo=x=468:y=334:w=342:h=50"  # base film's "A FILM BY SHAGUN"


def run(cmd):
    subprocess.run(cmd, check=True)


def fr(t):
    return round(t * FPS)


def our_shot(i, spec, n, path, fade_in, fade_out):
    clip, ss, speed = spec[:3]
    bw = len(spec) > 3 and spec[3]
    dur = n / FPS
    f = ["delogo=x=1148:y=650:w=114:h=48"]  # generator watermark
    if speed < 1.0:
        f.append(f"setpts={1/speed:.4f}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1")
    else:
        f.append(f"fps={FPS}")
    f.append("scale=2560:1440:flags=lanczos")
    f.append(f"zoompan=z='1.14+0.05*on/{max(n-1,1)}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={W}x{H}:fps={FPS}")
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
    f = [f"trim=start_frame={a}:end_frame={b}", "setpts=PTS-STARTPTS", LOGO]
    if i == TEXT_SEG:
        f.append(f"{FILMBY_BOX}:enable='lt(t,{92.95 - BOUNDS[i]:.2f})'")
    f += [f"scale={W}:{H}:flags=lanczos", "setsar=1", "format=yuv420p"]
    run(["ffmpeg", "-v", "error", "-y", "-i", BASE, "-vf", ",".join(f), "-an",
         "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "14", path])


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


def main():
    parts = []
    for i, (a_t, b_t) in enumerate(zip(BOUNDS, BOUNDS[1:])):
        a, b = fr(a_t), fr(b_t)
        p = os.path.join(WORK, f"p{i:03d}.mp4")
        parts.append(p)
        if os.environ.get("REUSE") and os.path.exists(p):
            continue
        if i in R:
            our_shot(i, R[i], b - a, p, a_t in DIPS, b_t in DIPS)
        elif i in BLACK:
            black_piece(b - a, p)
        else:
            base_piece(i, a, b, p)
    with open(os.path.join(WORK, "list.txt"), "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    film_by_png(os.path.join(WORK, "filmby.png"))
    T = BOUNDS[-1]
    out = os.path.join(OUT, "Ravi_Sakshi_Banaras_Film_16x9.mp4")
    fc = (f"[2:v]format=rgba,fade=in:st=87.8:d=0.8:alpha=1,fade=out:st=92.2:d=0.6:alpha=1[t];"
          f"[0:v][t]overlay=0:0:enable='between(t,87.7,92.9)':format=auto,format=yuv420p[v]")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(WORK, "list.txt"),
         "-i", BASE, "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "filmby.png"),
         "-filter_complex", fc, "-map", "[v]", "-map", "1:a",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "10M", "-bufsize", "20M",
         "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", str(T), out])
    print("wrote", out)


if __name__ == "__main__":
    main()
