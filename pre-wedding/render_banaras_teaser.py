#!/usr/bin/env python3
"""Ravi & Sakshi — Banaras fast-cut teaser (~40s, 16:9).

Cut from the finished Banaras film (graded, logo-free) on the beat of the
film's own song, using its climb to the climax (2:38-3:18 of the film):
two-beat cuts to open, one-beat cuts, a half-beat flash burst, one-beat cuts
again, a held closing shot with "Ravi & Sakshi", then the credit card.
Every shot is a different moment of the film.

usage: render_banaras_teaser.py <uploads_dir> <fonts_dir> <work_dir> <out_dir>
"""
import importlib.util, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

UP, FONTS, WORK, OUT = sys.argv[1:5]
HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.join(HERE, "Ravi_Sakshi_Banaras_Film_16x9.mp4")
os.makedirs(WORK, exist_ok=True)

spec = importlib.util.spec_from_file_location("rb", os.path.join(HERE, "render_banaras.py"))
rb = importlib.util.module_from_spec(spec)
sys.argv = [sys.argv[0], UP, FONTS, WORK, OUT]
spec.loader.exec_module(rb)
FPS, W, H = rb.FPS, rb.W, rb.H

BEAT = 0.5555                      # the song's beat in this stretch
A0 = 158.202                       # audio start: a downbeat
B = lambda k: round(k * BEAT, 4)   # teaser time of beat k

# cut pattern (in beats): 7 x 2, 16 x 1, 16 x 1/2, 16 x 1, 2 x 2, then 3 and 4 held
PATTERN = [2] * 7 + [1] * 16 + [0.5] * 16 + [1] * 16 + [2] * 2 + [3, 4]
PIC_END = sum(PATTERN) * BEAT          # 65 beats = 36.1s
CARD = 3.9                             # credit card, music fading under it
TOTAL = PIC_END + CARD

# film moments that carry text, titles, black or black & white: skipped
AVOID = [(0, 6.4), (37.8, 49.6), (68.2, 72.3), (86.8, 95.5), (133.0, 142.4), (272.5, 281)]


def candidates():
    """Usable windows in the film: each piece's interior, clear of its own
    dissolves and fades, as (start_frame, end_frame, kind)."""
    out, t = [], 0
    for pc in rb.plan():
        n = pc["n"]
        a, b = t, t + n
        t = b
        if pc["kind"] in ("black", "slowbase"):
            continue
        a += 14 if (pc.get("xf_in") or pc.get("fin")) else 4
        b -= 14 if (pc.get("tail") or pc.get("fout")) else 4
        if b - a < 8:
            continue
        if any(x * FPS < b and a < y * FPS for x, y in AVOID):
            continue
        out.append([a, b, pc["kind"]])
    return out


def pick(cands, need, kind, used):
    """Next unused window of the wanted kind long enough for `need` frames;
    taken from the middle of the window, then the window is retired."""
    pool = [c for c in cands if c[2] == kind and id(c) not in used and c[1] - c[0] >= need]
    if not pool:
        pool = [c for c in cands if id(c) not in used and c[1] - c[0] >= need]
    c = pool[0]
    used.add(id(c))
    mid = (c[0] + c[1]) // 2
    return max(c[0], mid - need // 2)


def run(cmd):
    subprocess.run(cmd, check=True)


def main():
    cands = candidates()
    ours = [c for c in cands if c[2] == "ours"]
    base = [c for c in cands if c[2] == "base"]
    # spread picks through the film: interleave by time, stride through the lists
    order_ours = ours[::2] + ours[1::2]
    order_base = base[::2] + base[1::2]
    cands = order_ours + order_base
    used, shots, t = set(), [], 0.0
    # reserve the closing shot first: the longest couple moment in the film
    n_last = round(PIC_END * FPS) - round((PIC_END - 4 * BEAT) * FPS)
    last = max((c for c in cands if c[2] == "ours"), key=lambda c: c[1] - c[0])
    assert last[1] - last[0] >= n_last, "no couple moment long enough to close on"
    used.add(id(last))
    for i, beats in enumerate(PATTERN):
        f0, f1 = round(B(sum(PATTERN[:i])) * FPS), round(B(sum(PATTERN[:i + 1])) * FPS)
        n = f1 - f0
        if i == len(PATTERN) - 1:
            start = last[0] + (last[1] - last[0] - n) // 2
        else:
            # mostly the couple, with the city flashing in on every third cut
            kind = "base" if i % 3 == 2 else "ours"
            start = pick(cands, n, kind, used)
        shots.append((start, n))
    parts = []
    for j, (start, n) in enumerate(shots):
        p = os.path.join(WORK, f"t{j:03d}.mp4")
        run(["ffmpeg", "-v", "error", "-y", "-i", FILM, "-vf",
             f"trim=start_frame={start}:end_frame={start + n},setpts=PTS-STARTPTS,format=yuv420p",
             "-an", "-frames:v", str(n), "-c:v", "libx264", "-preset", "medium", "-crf", "14", p])
        parts.append(p)
    with open(os.path.join(WORK, "list.txt"), "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)

    # titles: Cinzel, gold, centred on screen
    def gold_card(lines, path):
        m = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(m)
        y = 100
        for text, font, track, gap in lines:
            rb.tracked(d, 100, y, text, font, track)
            y += font.getmetrics()[0] + gap
        rb.centre_ink(rb.gold(m)).save(path)

    big = ImageFont.truetype(f"{FONTS}/cinzel_b.ttf", 80)
    small = ImageFont.truetype(f"{FONTS}/cinzel_r.ttf", 26)
    name = ImageFont.truetype(f"{FONTS}/cinzel_b.ttf", 44)
    gold_card([("Ravi & Sakshi", big, 8, 0)], os.path.join(WORK, "names.png"))
    gold_card([("A Film By", small, 4, 18), ("Parth D. Joshi", name, 6, 0)],
              os.path.join(WORK, "credit.png"))

    N = PIC_END - 7 * BEAT   # closing shot starts
    out = os.path.join(OUT, "Ravi_Sakshi_Banaras_Teaser_16x9.mp4")
    fc = (f"[0:v]fade=in:st=0:d=0.3,fade=out:st={PIC_END-0.5:.3f}:d=0.5,"
          f"tpad=stop_mode=add:stop_duration={CARD}:color=black[v0];"
          f"[2:v]format=rgba,fade=in:st={N+0.6:.3f}:d=0.7:alpha=1,"
          f"fade=out:st={PIC_END-0.6:.3f}:d=0.5:alpha=1[n];"
          f"[3:v]format=rgba,fade=in:st={PIC_END+0.3:.3f}:d=0.6:alpha=1,"
          f"fade=out:st={TOTAL-0.7:.3f}:d=0.6:alpha=1[c];"
          f"[v0][n]overlay=0:0:format=auto[v1];[v1][c]overlay=0:0:format=auto,format=yuv420p[v];"
          f"[1:a]atrim={A0}:{A0+TOTAL:.3f},asetpts=PTS-STARTPTS,afade=in:st=0:d=0.3,"
          f"afade=out:st={TOTAL-2.4:.3f}:d=2.4[a]")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(WORK, "list.txt"),
         "-i", rb.BASE,
         "-loop", "1", "-t", f"{TOTAL:.3f}", "-i", os.path.join(WORK, "names.png"),
         "-loop", "1", "-t", f"{TOTAL:.3f}", "-i", os.path.join(WORK, "credit.png"),
         "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{TOTAL:.3f}", out])
    print("wrote", out, round(TOTAL, 2), "s,", len(shots), "shots")


if __name__ == "__main__":
    main()
