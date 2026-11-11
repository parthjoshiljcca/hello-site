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
from title_style import lotus_divider, _finish

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
# yesterday's third batch: only drawn on when the clips above run out
LAKE = src("18-42-28")
HAVELI = src("18-44-00")
CASUAL = src("18-30-40")

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


# Clean takes inside each generated clip (seconds), between the clips' own
# dissolves. Long shots are filled from more than one take so nothing is
# slowed below MIN_SPEED (heavy slow motion is what blurred and warped them).
TAKES = {
    TEMPLE: [(0.0, 4.9), (6.5, 10.0)],
    BAZAAR: [(0.0, 4.2), (5.0, 7.2), (8.0, 10.0)],
    GHATWALK: [(0.0, 3.9), (4.75, 7.3), (8.0, 10.0)],
    BOAT: [(0.0, 2.0), (3.0, 4.9)],
    SPICE: [(0.0, 3.3), (3.4, 5.6), (5.8, 7.7)],
    COURT: [(0.0, 3.5), (3.75, 6.6), (7.2, 8.4), (8.75, 10.0)],
    STEPWELL: [(0.0, 4.1), (4.3, 6.6), (6.8, 8.6), (9.0, 10.0)],
    BEACH: [(0.0, 2.0), (3.3, 6.2), (7.0, 10.0)],
    DOVES: [(0.0, 4.0), (4.3, 7.0), (7.9, 10.0)],
    AARTI: [(7.3, 10.0)],
    STAIRS: [(0.0, 1.35), (1.5, 3.4), (3.75, 4.3), (4.5, 5.2), (5.5, 6.1), (6.25, 7.0),
             (7.5, 8.9), (9.15, 10.0)],
    BLOOM: [(0.0, 1.9), (2.0, 3.6), (3.75, 4.15), (4.3, 5.1), (5.25, 6.4), (6.75, 7.3),
            (7.5, 8.35), (8.5, 10.0)],
    GHAT: [(0.0, 2.0), (2.5, 4.1), (4.55, 5.4), (6.0, 7.2), (7.5, 8.6), (9.1, 10.0)],
    GLAM: [(6.5, 7.9)],
    LAKE: [(0.0, 1.85), (2.3, 3.35), (3.5, 4.1), (4.9, 5.6), (6.0, 7.7), (8.0, 10.0)],
    HAVELI: [(0.0, 1.85), (2.0, 3.35), (3.5, 4.85), (5.0, 6.05), (6.3, 8.25), (8.75, 10.0)],
    CASUAL: [(0.0, 1.85), (2.2, 3.35), (4.75, 6.6), (7.1, 8.85), (9.25, 10.0)],
}
EXTRA = {LAKE, HAVELI, CASUAL}
# Only scenes that feel like Banaras: ghats, river, boat, temple, diyas, lanes,
# bazaar, courtyard, steps. Udaipur lake, Rajasthani palace and garden, the
# black-outfit and seaside scenes are left out of this film.
NOT_BANARAS = {STAIRS, BLOOM, GLAM, LAKE, HAVELI, CASUAL}
TAKES = {c: v for c, v in TAKES.items() if c not in NOT_BANARAS}
EXTRA = set()
MIN_SPEED = 0.5
XF = 10                  # dissolve length, frames
FAST = (51.4, 72.27)     # the fast-cut montage keeps hard cuts


def run(cmd):
    subprocess.run(cmd, check=True)


def fr(t):
    return round(t * FPS)


def take_of(clip, t):
    """The clean take holding t (t snapped forward past a dissolve if needed)."""
    for a, b in TAKES[clip]:
        if a - 0.05 <= t < b - 0.3:
            return max(t, a), b
    for a, b in TAKES[clip]:
        if a >= t:
            return a, b
    return TAKES[clip][-1]


class Pool:
    """Free source time per clip, so no moment appears twice."""
    MARGIN = 0.22   # spare source after each use, for the dissolve overlap

    def __init__(self):
        self.free = {c: [list(x) for x in v] for c, v in TAKES.items()}
        self.history = []     # (clip, a, b, film time)

    def old_moment(self, now, need):
        best = None
        for c, takes in TAKES.items():
            if c in (GLAM,) or c in EXTRA:
                continue
            for a, b in takes:
                t = a
                while t + need <= b:
                    clash = [h for h in self.history if h[0] == c and h[1] < t + need and t < h[2]]
                    if all(now - h[3] >= 60 for h in clash):
                        last = max((h[3] for h in clash), default=-1e9)
                        if best is None or last < best[0]:
                            best = (last, c, t)
                    t += 0.25
        assert best, "no footage left to reuse"
        return best[1], best[2]

    def at(self, clip, t):
        """Free stretch starting at (or just after) t in clip, as (start, length)."""
        for a, b in self.free[clip]:
            if a - 0.01 <= t < b:
                return t, b - t
        for a, b in self.free[clip]:
            if a >= t:
                return a, b - a
        return t, 0.0

    def use(self, clip, start, length):
        end = start + length + self.MARGIN
        out = []
        for a, b in self.free[clip]:
            if b <= start or a >= end:
                out.append([a, b])
            else:
                if a < start:
                    out.append([a, start])
                if b > end:
                    out.append([end, b])
        self.free[clip] = [x for x in out if x[1] - x[0] > 0.05]

    def largest(self, prefer, minimum, skip=()):
        best = None
        for c, iv in self.free.items():
            if c == GLAM:
                continue
            for a, b in iv:
                if (c, round(a, 3)) in skip:
                    continue
                L = b - a - self.MARGIN
                score = L + (1.0 if c == prefer else 0.0) - (2.0 if c in EXTRA else 0.0)
                if L >= minimum and (best is None or score > best[0]):
                    best = (score, c, a, L)
        return best


def plan():
    """Pieces: dicts with kind, n (frames), spec; plus dissolve flags between them."""
    pool = Pool()
    pieces = []
    for i, (a_t, b_t) in enumerate(zip(BOUNDS, BOUNDS[1:])):
        k = round(a_t, 3)
        n = fr(b_t) - fr(a_t)
        fin, fout = a_t in DIPS, b_t in DIPS
        if k in R:
            spec = R[k]
            clip, ss, sp = spec[:3]
            bw = len(spec) > 3 and spec[3]
            sp = max(sp, MIN_SPEED)
            subs, left = [], n
            if clip in TAKES:
                c = clip
                t, _ = take_of(clip, ss)
                start, avail = pool.at(c, t)
                avail -= Pool.MARGIN
            else:
                # a scene that isn't Banaras: let the allocator choose
                c, start, avail = GHAT, 0.0, -1.0
            tried = set()
            while left > 0:
                need = left / FPS * sp
                if avail >= need:
                    m = left
                else:
                    m = int(avail / sp * FPS)
                    if left - m < 30:
                        m = left - 30
                    if m < 30:
                        m = 0
                tried.add((c, round(start, 3)))
                if m:
                    pool.use(c, start, m / FPS * sp)
                    pool.history.append((c, start, start + m / FPS * sp, a_t))
                    subs.append({"kind": "ours", "clip": c, "ss": start, "sp": sp, "bw": bw, "n": m})
                    left -= m
                    if not left:
                        break
                pick = pool.largest(c, min(1.0, left / FPS * sp), tried)
                if pick is None:
                    # fresh footage has run out: reuse a moment last seen at
                    # least a minute and a half earlier, rather than slowing
                    # anything below MIN_SPEED
                    c, start = pool.old_moment(a_t, left / FPS * sp + Pool.MARGIN)
                    subs.append({"kind": "ours", "clip": c, "ss": start, "sp": sp, "bw": bw, "n": left,
                                 "reuse": True})
                    pool.history.append((c, start, start + left / FPS * sp, a_t))
                    break
                _, c, start, avail = pick
            subs[0]["fin"] = fin
            subs[-1]["fout"] = fout
            subs[0]["t0"] = a_t
            for j, sbt in enumerate(subs):
                sbt["xf_in"] = j > 0      # dissolve between takes inside a shot
                pieces.append(sbt)
        elif k in BLACK:
            pieces.append({"kind": "black", "n": n, "t0": a_t})
        elif k in SLOW_BASE:
            pieces.append({"kind": "slowbase", "src": SLOW_BASE[k], "n": n, "t0": a_t})
        else:
            pieces.append({"kind": "base", "a": fr(a_t), "n": n, "t0": a_t})
    # dissolves at the film's own cuts: only outside the fast montage, never at
    # a fade-to-black, and only where at least one side is ours
    for j in range(1, len(pieces)):
        A, B = pieces[j - 1], pieces[j]
        if B.get("xf_in"):
            continue
        t = B.get("t0")
        if t is None or t in DIPS or FAST[0] <= t <= FAST[1]:
            continue
        if "ours" in (A["kind"], B["kind"]) and A["n"] >= 30 and B["n"] >= 30:
            B["xf_in"] = True
    # who carries each overlap: ours extends (tail of A, else head of B)
    for j in range(1, len(pieces)):
        if pieces[j].get("xf_in"):
            if pieces[j - 1]["kind"] == "ours":
                pieces[j - 1]["tail"] = XF
            else:
                pieces[j]["head"] = XF
    return pieces


def our_shot(pc, path):
    head, tail = pc.get("head", 0), pc.get("tail", 0)
    n = pc["n"] + head + tail
    sp = pc["sp"]
    ss = max(0.0, pc["ss"] - head / FPS * sp)
    dur = n / FPS
    f = []
    if sp < 1.0:
        f.append(f"setpts={1/sp:.4f}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=fdiff")
    else:
        f.append(f"fps={FPS}")
    # generator watermark sits at x>1148, y>650: crop it away (no blur patch)
    f.append("crop=1136:639:6:4")
    f.append("scale=2560:1440:flags=lanczos")
    if pc.get("reuse"):
        # a moment seen earlier in the film: mirrored and framed tighter so it
        # reads as a new angle
        f.append("hflip")
        f.append(f"zoompan=z='1.22+0.05*on/{max(n-1,1)}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={W}x{H}:fps={FPS}")
    else:
        f.append(f"zoompan=z='1.02+0.04*on/{max(n-1,1)}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={W}x{H}:fps={FPS}")
    f.append(GRADE)
    if pc.get("bw"):
        f.append("hue=s=0,eq=contrast=1.08")
    if pc.get("fin"):
        f.append("fade=in:st=0:d=0.45")
    if pc.get("fout"):
        f.append(f"fade=out:st={dur-0.45:.3f}:d=0.45")
    f.append("tpad=stop_mode=clone:stop_duration=0.5,setsar=1,format=yuv420p")
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{dur*sp+0.6:.3f}", "-i", pc["clip"],
         "-vf", ",".join(f), "-frames:v", str(n), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "14", path])


def base_piece(a, n, path):
    f = [f"trim=start_frame={a}:end_frame={a+n}", "setpts=PTS-STARTPTS", LOGO_CROP,
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


def xfade_run(files, lens, path):
    """Join pieces with dissolves; every overlap is XF frames, carried by the
    extended side, so the joined run keeps the film's exact length."""
    inputs = []
    for f in files:
        inputs += ["-i", f]
    fc, last, cur = [], "[0:v]", lens[0]
    for k in range(1, len(files)):
        off = (cur - XF) / FPS
        out = f"[x{k}]"
        fc.append(f"{last}[{k}:v]xfade=transition=fade:duration={XF/FPS:.4f}:offset={off:.4f}{out}")
        last, cur = out, cur + lens[k] - XF
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", last,
         "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", path])
    return cur


def gold(mask):
    return _finish(mask, 0)


def centred(im):
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.alpha_composite(im, ((W - im.size[0]) // 2, (H - im.size[1]) // 2))
    return out


def tracked(d, x, y, text, font, track):
    for c in text:
        d.text((x, y), c, font=font, fill=255)
        x += d.textlength(c, font=font) + track
    return x


def text_w(d, text, font, track):
    return sum(d.textlength(c, font=font) for c in text) + track * (len(text) - 1)


def centre_ink(im):
    """Place an RGBA layer so its visible ink sits exactly at the frame centre."""
    bb = im.getbbox()
    ink = im.crop(bb)
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.alpha_composite(ink, ((W - ink.size[0]) // 2, (H - ink.size[1]) // 2))
    return out


def white_with_shadow(mask):
    from PIL import ImageFilter
    sh = Image.new("L", (W, H), 0)
    sh.paste(mask, (2, 2))
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0)); shadow.putalpha(sh.point(lambda v: int(v * 0.75)))
    fill = Image.new("RGBA", (W, H), (252, 250, 246, 0)); fill.putalpha(mask)
    return Image.alpha_composite(shadow, fill)


def film_by_png(path):
    """'A FILM BY PARTH D. JOSHI' in Cinzel, white, centred on screen."""
    small = ImageFont.truetype(f"{FONTS}/cinzel_r.ttf", 26)
    big = ImageFont.truetype(f"{FONTS}/cinzel_b.ttf", 32)
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    a, b = "A Film By ", "Parth D. Joshi"
    wa = text_w(d, a, small, 3) + 3
    base = H // 2
    asc_s, _ = small.getmetrics(); asc_b, _ = big.getmetrics()
    x = tracked(d, 100, base - asc_s, a, small, 3)
    tracked(d, 100 + wa, base - asc_b, b, big, 4)
    centre_ink(white_with_shadow(m)).save(path)


def names_lower_png(path):
    """'Ravi & Sakshi' card where the previous couple's name sat, in Cinzel,
    white with a soft shadow, centred on screen."""
    font = ImageFont.truetype(f"{FONTS}/cinzel_r.ttf", 44)
    m = Image.new("L", (W, H), 0)
    tracked(ImageDraw.Draw(m), 100, H // 2, "Ravi & Sakshi", font, 5)
    centre_ink(white_with_shadow(m)).save(path)


def end_names_png(path):
    """Closing card: 'RAVI & SAKSHI' large in gold Cinzel with the lotus divider."""
    font = ImageFont.truetype(f"{FONTS}/cinzel_b.ttf", 88)
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    t, track = "Ravi & Sakshi", 8
    tw = text_w(d, t, font, track)
    l, tp, r, b = d.textbbox((0, 0), t, font=font)
    y = H // 2 - 80
    tracked(d, (W - tw) / 2, y - tp, t, font, track)
    lotus_divider(d, W // 2, y + (b - tp) + 26, 56, int(tw * 0.42), 3)
    centre_ink(gold(m)).save(path)


def film_by_end_png(path):
    """Closing card: 'A Film By' / 'PARTH D. JOSHI' in gold Cinzel."""
    small = ImageFont.truetype(f"{FONTS}/cinzel_r.ttf", 30)
    big = ImageFont.truetype(f"{FONTS}/cinzel_b.ttf", 56)
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    a, b = "A Film By", "Parth D. Joshi"
    wa, wb = text_w(d, a, small, 4), text_w(d, b, big, 6)
    y = H // 2 - 60
    tracked(d, (W - wa) / 2, y, a, small, 4)
    tracked(d, (W - wb) / 2, y + 52, b, big, 6)
    centre_ink(gold(m)).save(path)


def mahadev_png(path):
    """Last frame: 'HAR HAR MAHADEV' in gold Cinzel with the lotus divider."""
    font = ImageFont.truetype(f"{FONTS}/cinzel_b.ttf", 64)
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    t, track = "HAR HAR MAHADEV", 10
    tw = text_w(d, t, font, track)
    l, tp, r, b = d.textbbox((0, 0), t, font=font)
    y = H // 2 - 70
    tracked(d, (W - tw) / 2, y - tp, t, font, track)
    lotus_divider(d, W // 2, y + (b - tp) + 22, 52, int(tw * 0.42), 3)
    centre_ink(gold(m)).save(path)


def main():
    pieces = plan()
    reuse = os.environ.get("REUSE")
    files, lens = [], []
    for j, pc in enumerate(pieces):
        p = os.path.join(WORK, f"q{j:03d}.mp4")
        L = pc["n"] + pc.get("head", 0) + pc.get("tail", 0)
        if not (reuse and os.path.exists(p)):
            if pc["kind"] == "ours":
                our_shot(pc, p)
            elif pc["kind"] == "black":
                black_piece(pc["n"], p)
            elif pc["kind"] == "slowbase":
                base_slow(*pc["src"], pc["n"], p)
            else:
                base_piece(pc["a"], pc["n"], p)
        files.append(p); lens.append(L)
    # group into runs joined by dissolves
    runs, cur = [], [0]
    for j in range(1, len(pieces)):
        if pieces[j].get("xf_in"):
            cur.append(j)
        else:
            runs.append(cur); cur = [j]
    runs.append(cur)
    parts = []
    for r_i, run_ in enumerate(runs):
        if len(run_) == 1:
            parts.append(files[run_[0]])
        else:
            p = os.path.join(WORK, f"run{r_i:03d}.mp4")
            if not (reuse and os.path.exists(p)):
                xfade_run([files[j] for j in run_], [lens[j] for j in run_], p)
            parts.append(p)
    with open(os.path.join(WORK, "list.txt"), "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    for fn, name in ((film_by_png, "filmby"), (names_lower_png, "names_lower"),
                     (end_names_png, "end_names"), (film_by_end_png, "filmby_end"),
                     (mahadev_png, "mahadev")):
        fn(os.path.join(WORK, f"{name}.png"))
    T = BOUNDS[-1]
    out = os.path.join(OUT, "Ravi_Sakshi_Banaras_Film_16x9.mp4")
    # credit through the palace shot; names lower third where the old one sat;
    # closing card: names, credit, then Har Har Mahadev on the last frame
    fc = (f"[2:v]format=rgba,fade=in:st=87.8:d=0.8:alpha=1,fade=out:st=93.6:d=0.7:alpha=1[t];"
          f"[3:v]format=rgba,fade=in:st=135.0:d=0.6:alpha=1,fade=out:st=140.9:d=0.6:alpha=1[nl];"
          f"[4:v]format=rgba,fade=in:st=273.5:d=0.8:alpha=1,fade=out:st=275.4:d=0.5:alpha=1[en];"
          f"[5:v]format=rgba,fade=in:st=275.9:d=0.7:alpha=1,fade=out:st=277.6:d=0.5:alpha=1[fb];"
          f"[6:v]format=rgba,fade=in:st=278.1:d=0.7:alpha=1[hm];"
          f"[0:v][t]overlay=0:0:enable='between(t,87.7,94.4)':format=auto[v1];"
          f"[v1][nl]overlay=0:0:enable='between(t,134.9,141.6)':format=auto[v2];"
          f"[v2][en]overlay=0:0:enable='between(t,273.4,276.0)':format=auto[v3];"
          f"[v3][fb]overlay=0:0:enable='between(t,275.8,278.2)':format=auto[v4];"
          f"[v4][hm]overlay=0:0:enable='gte(t,278.0)':format=auto,format=yuv420p[v]")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(WORK, "list.txt"),
         "-i", BASE, "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "filmby.png"),
         "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "names_lower.png"),
         "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "end_names.png"),
         "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "filmby_end.png"),
         "-loop", "1", "-t", str(T), "-i", os.path.join(WORK, "mahadev.png"),
         "-filter_complex", fc, "-map", "[v]", "-map", "1:a",
         "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "10M", "-bufsize", "20M",
         "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", str(T), out])
    print("wrote", out)


if __name__ == "__main__":
    main()
