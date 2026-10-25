"""Hidden Uttarakhand - 'Jeetu Bagadwal' reel v5 (30s, 1080x1920).

Song 259.0s -> 289.0s: hit at T=2.0, silence 3.5-5.3, drop at T=5.333, climax 120 bpm,
phrase turns at 9.333 / 13.333 / 17.333 / 21.333, book reveal on the 25.333 accent.

ffmpeg builds the picture layer (hero window / tri-panel cascade / full-bleed strobe) and
pipes raw frames here; numpy/PIL add kinetic type, title slam, embers, light leaks, masks,
flashes and the 3D book finale; a second ffmpeg encodes with the song.
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

import textfx

UP = "/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650"
SRC = f"{UP}/3da759ef-VID-20261025-WA0001.mp4"
D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "reel_v5.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 900   # frames to render (for previews)
W, H, FPS = 1080, 1920, 30
A0 = 259.0
PIC_FRAMES = 760          # picture layer length; end card after
TOTAL = 900
DROP = 5.333

# ---------------------------------------------------------------- picture layer
# streams: list of (start_frame, end_frame, src_seconds)
HERO = [(0, 60, 300.0), (280, 310, 268.0), (310, 340, 165.0), (340, 370, 121.0), (370, 400, 260.0),
        (520, 550, 80.5), (550, 580, 172.0), (580, 610, 195.0), (610, 640, 229.0)]
P1 = [(60, 105, 73.0), (160, 190, 201.0), (190, 235, 213.0), (235, 280, 156.0),
      (400, 430, 241.0), (430, 475, 310.5), (475, 520, 160.0)]
P2 = [(60, 105, 232.6), (160, 205, 256.0), (205, 250, 27.0), (250, 280, 50.0),
      (400, 445, 233.5), (445, 490, 291.0), (490, 520, 284.0)]
P3 = [(60, 105, 248.3), (160, 220, 239.0), (220, 265, 121.0), (265, 280, 184.0),
      (400, 460, 302.0), (460, 505, 249.5), (505, 520, 306.0)]
FULL_SRCS = [27, 302, 66, 239, 201, 249, 50, 156, 184, 233, 121, 213, 73, 268, 165, 291]
FULL, f0 = [], 640
for i, s in enumerate(FULL_SRCS):
    f1 = 640 + round((i + 1) * 7.5)
    FULL.append((f0, f1, float(s)))
    f0 = f1
HERO_SECTIONS = [(0, 60), (280, 400), (520, 640)]
TRI_SECTIONS = [(60, 105), (160, 280), (400, 520)]
FULL_SECTION = (640, 760)


def stream(segs, label, graph, src_label):
    parts, cur, n = [], 0, 0
    for a, b, s in segs:
        if a > cur:
            graph.append(f"color=c=black:s=854x480:r={FPS}:d={(a - cur) / FPS:.4f},format=yuv420p,setsar=1[{label}g{n}]")
            parts.append(f"[{label}g{n}]"); n += 1
        graph.append(f"[{src_label}{len(parts)}]trim=start={s}:duration={(b - a) / FPS:.4f},setpts=PTS-STARTPTS,setsar=1[{label}s{n}]")
        parts.append(f"[{label}s{n}]"); n += 1
        cur = b
    if cur < PIC_FRAMES:
        graph.append(f"color=c=black:s=854x480:r={FPS}:d={(PIC_FRAMES - cur) / FPS:.4f},format=yuv420p,setsar=1[{label}g{n}]")
        parts.append(f"[{label}g{n}]")
    return parts


def ts_expr(segs):
    e = "t"
    for a, _, _ in segs[1:]:
        e = f"if(gte(t,{a / FPS:.4f}),t-{a / FPS:.4f},{e})"
    return e


def enable(sections):
    return "+".join(f"between(n,{a},{b - 1})" for a, b in sections)


def picture_graph():
    g = []
    plan = {"h": HERO, "a": P1, "b": P2, "c": P3, "f": FULL}
    # how many source clips each stream needs (one split output per real segment)
    for k, segs in plan.items():
        # count parts: each segment consumes one split output, indexed by its position in parts
        pass
    total_src = sum(len(s) for s in plan.values())
    g.append(f"[0:v]fps={FPS},split={total_src}" + "".join(f"[v{i}]" for i in range(total_src)))
    idx = 0
    for k, segs in plan.items():
        parts, cur, n = [], 0, 0
        for a, b, s in segs:
            if a > cur:
                g.append(f"color=c=black:s=854x480:r={FPS}:d={(a - cur) / FPS:.4f},format=yuv420p,setsar=1[{k}g{n}]")
                parts.append(f"[{k}g{n}]"); n += 1
            g.append(f"[v{idx}]trim=start={s}:duration={(b - a) / FPS:.4f},setpts=PTS-STARTPTS,setsar=1[{k}s{n}]")
            parts.append(f"[{k}s{n}]"); n += 1; idx += 1
            cur = b
        if cur < PIC_FRAMES:
            g.append(f"color=c=black:s=854x480:r={FPS}:d={(PIC_FRAMES - cur) / FPS:.4f},format=yuv420p,setsar=1[{k}g{n}]")
            parts.append(f"[{k}g{n}]")
        g.append("".join(parts) + f"concat=n={len(parts)}:v=1:a=0,setpts=N/{FPS}/TB,"
                 f"eq=contrast=1.08:gamma=1.02:saturation='if(lt(t,{DROP - 0.03}),0.8,1.18)':eval=frame[{k}]")
    TSh, TSa, TSb, TSc, TSf = (ts_expr(plan[k]) for k in "habcf")
    g.append("[h]split=2[h1][h2]")
    g.append("[h1]scale=-2:1920,crop=1080:1920,gblur=sigma=38,eq=brightness=-0.17:saturation=1.2[hbg]")
    g.append(f"[h2]scale=w='trunc(1281*(1+0.09*exp(-({TSh})*7)+0.02*min({TSh},1))/2)*2':h=-2:eval=frame:flags=lanczos,"
             f"crop=1080:720:x='clip((iw-1080)/2+14*exp(-({TSh})*11)*sin(({TSh})*85),0,iw-1080)':y='(ih-720)/2',unsharp=5:5:0.6[hwin]")
    for k, ts in (("a", TSa), ("b", TSb), ("c", TSc)):
        g.append(f"[{k}]scale=w='trunc(1080*(1+0.08*exp(-({ts})*8)+0.025*min({ts},1.5))/2)*2':h=-2:eval=frame:flags=lanczos,"
                 f"crop=1080:608:x='clip((iw-1080)/2+10*exp(-({ts})*12)*sin(({ts})*80),0,iw-1080)':y='(ih-608)/2',unsharp=5:5:0.5[{k}p]")
    g.append(f"[f]scale=w='trunc(3414*(1+0.12*exp(-({TSf})*14))/2)*2':h=-2:eval=frame:flags=bicubic,crop=1080:1920,unsharp=7:7:0.9[fp]")
    g.append(f"color=c=black:s=1080x1920:r={FPS}:d={PIC_FRAMES / FPS:.4f}[base]")
    g.append(f"[base][hbg]overlay=0:0:enable='{enable(HERO_SECTIONS)}'[c1]")
    g.append(f"[c1][hwin]overlay=0:600:enable='{enable(HERO_SECTIONS)}'[c2]")
    g.append(f"[c2][ap]overlay=0:24:enable='{enable(TRI_SECTIONS)}'[c3]")
    g.append(f"[c3][bp]overlay=0:656:enable='{enable(TRI_SECTIONS)}'[c4]")
    g.append(f"[c4][cp]overlay=0:1288:enable='{enable(TRI_SECTIONS)}'[c5]")
    g.append(f"[c5][fp]overlay=0:0:enable='{enable([FULL_SECTION])}',"
             f"trim=end_frame={PIC_FRAMES},format=rgb24[out]")
    return ";\n".join(g)


# ---------------------------------------------------------------- graphics helpers
def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def blit(frame, spr, cx, cy, alpha=1.0, scale=1.0):
    """Alpha-composite RGBA uint8 sprite centred at (cx, cy) onto float frame."""
    if alpha <= 0.003:
        return
    if abs(scale - 1) > 1e-3:
        h0, w0 = spr.shape[:2]
        spr = np.asarray(Image.fromarray(spr, "RGBA").resize((max(1, int(w0 * scale)), max(1, int(h0 * scale))), Image.BILINEAR))
    h, w = spr.shape[:2]
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
    xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + w, W), min(y0 + h, H)
    if xa >= xb or ya >= yb:
        return
    s = spr[ya - y0:yb - y0, xa - x0:xb - x0].astype(np.float32)
    a = s[..., 3:4] / 255 * alpha
    region = frame[ya:yb, xa:xb]
    region *= (1 - a)
    region += s[..., :3] * a


def darken(frame, y0, y1, amount):
    if amount > 0:
        frame[max(0, int(y0)):min(H, int(y1))] *= (1 - min(amount, 1))


# ---------------------------------------------------------------- text events
TEXTS = []          # (sprite, cx, cy, t0, t1)
CACHE = {}


def spr(text, size, bold=True, style="gold", track=None):
    key = (text, size, bold, style)
    if key not in CACHE:
        CACHE[key] = textfx.word(text, size, bold=bold, style=style, track=track if track is not None else max(3, size // 12))
    return CACHE[key]


def line(words, size, cy, times, t1, style="gold", bold=True, gap=None):
    sp = [spr(wd, size, bold, style) for wd in words]
    pad = max(6, size // 7) * 3
    widths = [s.shape[1] - 2 * pad for s in sp]
    gap = gap if gap is not None else int(size * 0.32)
    total = sum(widths) + gap * (len(words) - 1)
    x = W / 2 - total / 2
    for s, wdt, t0 in zip(sp, widths, times):
        TEXTS.append((s, x + wdt / 2, cy, t0, t1))
        x += wdt + gap


line(["NEVER", "PLAY", "THE", "FLUTE"], 70, 330, [0.12, 0.42, 0.72, 0.98], 1.97, style="pale")
line(["ON", "KHAIT", "PARVAT"], 92, 1468, [1.18, 1.38, 1.58], 1.97)
line(["JEETU"], 176, 790, [3.62], DROP - 0.02)
line(["PLAYED"], 118, 985, [4.15], DROP - 0.02, style="pale")
line(["ANYWAY."], 118, 1140, [4.68], DROP - 0.02)
line(["JEETU", "BAGADWAL"], 74, 1185, [6.0, 6.0], 9.2)
line(["THE", "SECRETS", "OF", "THE", "ACHHARIS"], 40, 1275, [6.33] * 5, 9.2, style="pale", bold=False)
line(["OF", "KHAIT", "PARVAT"], 40, 1330, [6.5] * 3, 9.2, style="pale", bold=False)
for a, b in ((9.333, 13.3), (17.333, 21.3)):
    line(["JEETU", "BAGADWAL"], 52, 330, [a + 0.05, a + 0.05], b, style="pale", bold=False)
line(["HIS", "FLUTE", "CALLED"], 92, 1430, [9.35, 9.85, 10.35], 13.3, style="pale")
line(["THE", "ACHHARIS"], 108, 1560, [10.85, 11.35], 13.3)
line(["AND", "THE", "MOUNTAIN"], 88, 1430, [17.35, 17.6, 17.85], 21.3, style="pale")
line(["NEVER", "LET", "HIM", "GO."], 104, 1560, [18.35, 18.85, 19.35, 19.85], 21.3)
line(["FIFTEEN"], 156, 880, [21.35], 23.28)
line(["LEGENDS."], 156, 1050, [21.85], 23.28, style="pale")
line(["ONE"], 200, 860, [23.35], 25.0)
line(["BOOK."], 200, 1070, [23.85], 25.0)

TITLE = np.asarray(Image.open(f"{UP}/68465784-image.png").convert("RGBA"))
TITLE_SLAM = np.asarray(Image.fromarray(TITLE).resize((980, 327), Image.LANCZOS))
AUTH = np.asarray(Image.open(os.path.join(D, "gfx", "author.png")).convert("RGBA").resize((820, 273), Image.LANCZOS))
TITLE_END = np.asarray(Image.fromarray(TITLE).resize((940, 313), Image.LANCZOS))

# ---------------------------------------------------------------- embers & leaks
rng = np.random.default_rng(7)


def make_particles(n, t_from, t_to, burst=None):
    P = []
    for _ in range(n):
        ts = rng.uniform(t_from, t_to)
        if burst:
            ang = rng.uniform(0, 2 * math.pi)
            sp = rng.uniform(300, 1500)
            P.append(dict(ts=burst[0] + rng.uniform(0, 0.08), x0=burst[1], y0=burst[2],
                          vx=math.cos(ang) * sp, vy=math.sin(ang) * sp * 1.3, life=rng.uniform(1.2, 3.0),
                          size=rng.choice([1, 2, 2, 3, 3, 4]), amp=rng.uniform(5, 25), ph=rng.uniform(0, 6), burst=True))
        else:
            P.append(dict(ts=ts, x0=rng.uniform(0, W), y0=rng.uniform(H * 0.4, H + 60),
                          vx=0, vy=rng.uniform(60, 220), life=rng.uniform(3, 7),
                          size=rng.choice([1, 1, 2, 2, 3, 4]), amp=rng.uniform(10, 50), ph=rng.uniform(0, 6), burst=False))
    return P


PARTS = (make_particles(40, -6, 5.3) + make_particles(260, -3, 25.3) + make_particles(320, 22.0, 30)
         + make_particles(220, 0, 0, burst=(DROP, 540, 900)) + make_particles(160, 0, 0, burst=(25.45, 540, 930)))
# ambient after the drop only (the pre-drop pool stays sparse)
for p in PARTS[40:300]:
    p["ts"] = max(p["ts"], DROP - rng.uniform(0, 4)) if p["ts"] < DROP else p["ts"]
    p["gate"] = DROP
SPRITES = {}
for r in (1, 2, 3, 4):
    k = np.arange(-3 * r - 2, 3 * r + 3)
    g = np.exp(-(k[:, None] ** 2 + k[None, :] ** 2) / (2 * (r * 0.9) ** 2))
    core = np.exp(-(k[:, None] ** 2 + k[None, :] ** 2) / (2 * (r * 0.35) ** 2))
    SPRITES[r] = np.clip(g * 0.55 + core, 0, 1.4).astype(np.float32)
EMBER_COL = np.array([255, 196, 110], np.float32)


def draw_embers(frame, t):
    for p in PARTS:
        if t < p.get("gate", -99):
            continue
        dt = t - p["ts"]
        if dt < 0 or dt > p["life"]:
            continue
        if p["burst"]:
            k = 2.2
            x = p["x0"] + p["vx"] * (1 - math.exp(-k * dt)) / k + p["amp"] * math.sin(dt * 3 + p["ph"])
            y = p["y0"] + p["vy"] * (1 - math.exp(-k * dt)) / k - 60 * dt
        else:
            x = p["x0"] + p["amp"] * math.sin(dt * 1.3 + p["ph"])
            y = p["y0"] - p["vy"] * dt
        fade = min(1, dt / 0.3) * min(1, (p["life"] - dt) / 0.8)
        flick = 0.65 + 0.35 * math.sin(t * 17 + p["ph"] * 5)
        b = fade * flick
        if b <= 0.02:
            continue
        s = SPRITES[p["size"]]
        r = s.shape[0] // 2
        xi, yi = int(x), int(y)
        xa, ya, xb, yb = max(xi - r, 0), max(yi - r, 0), min(xi + r + 1, W), min(yi + r + 1, H)
        if xa >= xb or ya >= yb:
            continue
        sub = s[ya - (yi - r):yb - (yi - r), xa - (xi - r):xb - (xi - r)]
        frame[ya:yb, xa:xb] += sub[..., None] * EMBER_COL * b


LW, LH = 108, 192
gy, gx = np.mgrid[0:LH, 0:LW].astype(np.float32)
HITS = [(2.0, 0.9), (DROP, 1.0), (9.333, 0.35), (13.333, 0.4), (17.333, 0.35), (21.333, 0.5), (25.333, 1.0)]


def leak_layer(t):
    base = 0.0 if t < DROP else 0.10
    env = base + sum(a * math.exp(-(t - h) * 2.6) for h, a in HITS if t >= h)
    if env < 0.01:
        return None
    f = np.zeros((LH, LW), np.float32)
    for i, (sx, sy, rad) in enumerate(((0.1, 0.15, 30), (0.95, 0.55, 38), (0.3, 0.95, 34))):
        cx = LW * (sx + 0.12 * math.sin(t * 0.7 + i * 2))
        cy = LH * (sy + 0.08 * math.cos(t * 0.5 + i))
        f += np.exp(-((gx - cx) ** 2 + (gy - cy) ** 2) / (2 * rad ** 2))
    f = np.clip(f * env, 0, 1)
    img = np.asarray(Image.fromarray((f * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32) / 255
    return img


LEAK_COL = np.array([1.0, 0.55, 0.18], np.float32)

FLASHES = [(2.0, 0.6, 9), (DROP, 0.85, 6), (9.333, 0.25, 12), (13.333, 0.3, 12), (17.333, 0.25, 12),
           (21.333, 0.4, 9)] + [(21.833 + 0.5 * i, 0.16, 16) for i in range(7)] + [(25.333, 0.95, 5)]


def flash_amount(t):
    v = sum(a * math.exp(-(t - s) * k) for s, a, k in FLASHES if 0 <= t - s < 1.2)
    if 25.0 <= t < 25.333:
        v += ((t - 25.0) / 0.333) ** 2 * 0.95
    return min(v, 1.0)


# ---------------------------------------------------------------- end card (book)
COVER = Image.open(f"{UP}/263ea9ce-image.png").convert("RGB")
BW, BH = 700, 1050
BOOK = np.asarray(COVER.resize((BW, BH), Image.LANCZOS), np.float32)
bg = COVER.resize((1280, 1920), Image.LANCZOS).crop((100, 0, 1180, 1920)).filter(ImageFilter.GaussianBlur(40))
END_BG = np.asarray(bg, np.float32) * 0.32
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
GLOW_BASE = np.exp(-(((xx - 540) / 560) ** 2 + ((yy - 930) / 760) ** 2) * 2.2)[..., None] * np.array([255, 150, 50], np.float32)


def solve_persp(dst, src):
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()


def book_frame(frame, u):
    # rotation in from the side, then a slow float
    k = ease_out(u / 1.1)
    theta = math.radians(-100 * (1 - k) + 5 * math.sin(u * 1.4) * k)
    sc = 0.82 + 0.18 * k + 0.012 * u
    cx, cy = 540, 930 + 8 * math.sin(u * 1.8) * k
    f = 2000.0
    corners = []
    for x, y in ((-BW / 2, -BH / 2), (BW / 2, -BH / 2), (BW / 2, BH / 2), (-BW / 2, BH / 2)):
        X, Z = x * math.cos(theta) * sc, x * math.sin(theta) * sc
        corners.append((cx + X * f / (f + Z), cy + y * sc * f / (f + Z)))
    if math.cos(theta) <= 0.02:
        return
    tex = BOOK.copy()
    if 1.15 <= u <= 2.2:
        p = -400 + (u - 1.15) / 1.05 * (BW + 900)
        by, bx = np.mgrid[0:BH, 0:BW].astype(np.float32)
        band = np.exp(-(((bx + 0.45 * by) - p) / 80) ** 2)[..., None]
        tex = tex + band * np.array([150, 125, 85], np.float32)
    shade = 0.55 + 0.45 * math.cos(theta)
    tex = np.clip(tex * shade, 0, 255).astype(np.uint8)
    tex_img = Image.fromarray(np.dstack([tex, np.full((BH, BW), 255, np.uint8)]), "RGBA")
    xs = [c[0] for c in corners]; ys = [c[1] for c in corners]
    x0, y0 = max(int(min(xs)) - 2, 0), max(int(min(ys)) - 2, 0)
    x1, y1 = min(int(max(xs)) + 3, W), min(int(max(ys)) + 3, H)
    dst = [(x - x0, y - y0) for x, y in corners]
    coeffs = solve_persp(dst, [(0, 0), (BW, 0), (BW, BH), (0, BH)])
    warped = np.asarray(tex_img.transform((x1 - x0, y1 - y0), Image.PERSPECTIVE, coeffs, Image.BICUBIC), np.float32)
    a = warped[..., 3:4] / 255
    # soft drop shadow
    sh = np.asarray(Image.fromarray((a[..., 0] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(22)), np.float32)[..., None] / 255
    reg = frame[y0:y1, x0:x1]
    reg *= (1 - sh * 0.7)
    reg *= (1 - a)
    reg += warped[..., :3] * a


def end_card(u):
    fr = END_BG.copy()
    glow = min(1, u / 1.0) * (0.75 + 0.1 * math.sin(u * 2.2))
    fr += GLOW_BASE * glow * 0.55
    book_frame(fr, u)
    if u >= 1.2:
        k = ease_out((u - 1.2) / 0.45)
        blit(fr, TITLE_END, 540, 225, alpha=k, scale=1.12 - 0.12 * k)
    if u >= 1.75:
        k = ease_out((u - 1.75) / 0.5)
        blit(fr, AUTH, 540, 1640 + 30 * (1 - k), alpha=k)
    return fr


# ---------------------------------------------------------------- per-frame compositing
def masks(fr, t):
    if t < 2.0:                                   # cold open: light slit reveals the eye
        hgt = 360 * ease_out((t - 0.05) / 1.75)
        top, bot = 960 - hgt, 960 + hgt
        fr[:max(0, int(top))] = 0
        fr[min(H, int(bot)):] = 0
        if hgt > 2:
            for yl in (int(top), int(bot) - 2):
                if 0 <= yl < H - 2:
                    fr[yl:yl + 2, 90:990] = fr[yl:yl + 2, 90:990] * 0.3 + np.array([217, 179, 106], np.float32) * 0.7
    elif t < 3.5:                                 # hit: panels slam in, then die out bottom-up
        for k, (y0, y1) in enumerate(((24, 632), (656, 1264), (1288, 1896))):
            if t < 2.0 + 0.08 * k:
                fr[y0:y1] = 0
            fade = min(max((t - 3.0 - 0.12 * (2 - k)) / 0.25, 0), 1)
            darken(fr, y0, y1, fade)
    elif DROP <= t < 5.6:
        for k, (y0, y1) in enumerate(((24, 632), (656, 1264), (1288, 1896))):
            if t < DROP + 0.07 * k:
                fr[y0:y1] = 0
    if DROP <= t < 9.333:                         # scrim under the title slam
        darken(fr, 0, H, 0.5 * min(1, (t - DROP) / 0.1) * min(1, (9.3 - t) / 0.3))
    if 21.333 <= t < 25.333:                      # band behind the giant words
        band = np.exp(-((np.arange(H) - 975) / 330) ** 2)[:, None, None] * 0.6
        fr *= (1 - band)
    if (9.333 <= t < 13.333) or (17.333 <= t < 21.333):
        fr[594:596, 90:990] = fr[594:596, 90:990] * 0.25 + np.array([217, 179, 106], np.float32) * 0.75
        fr[1324:1326, 90:990] = fr[1324:1326, 90:990] * 0.25 + np.array([217, 179, 106], np.float32) * 0.75


def overlays(fr, t):
    for s, cx, cy, t0, t1 in TEXTS:
        if t0 <= t < t1:
            dt = t - t0
            k = ease_out(dt / 0.16)
            out = min(1, (t1 - t) / 0.12)
            blit(fr, s, cx, cy + 10 * (1 - k), alpha=min(1, dt / 0.06) * out, scale=1 + 0.55 * (1 - k))
    if DROP - 0.01 <= t < 9.25:
        dt = t - DROP
        k = ease_out(dt / 0.22)
        blit(fr, TITLE_SLAM, 540, 900, alpha=min(1, max(dt, 0) / 0.04) * min(1, (9.25 - t) / 0.25),
             scale=1.6 - 0.6 * k + 0.02 * dt)


def render():
    pic = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-filter_complex", picture_graph(),
                            "-map", "[out]", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error",
                            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            "-ss", str(A0), "-t", "30", "-i", SRC,
                            "-filter_complex",
                            f"[0:v]noise=c0s=5:c0f=t+u,fade=t=in:st=0:d=0.12,fade=t=out:st=29.55:d=0.45,format=yuv420p[v];"
                            f"[1:a]afade=t=in:st=0:d=0.15,afade=t=out:st=28.9:d=1.1,alimiter=limit=0.95:level=false[a]",
                            "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
                            "-profile:v", "high", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
                            "-movflags", "+faststart", "-t", str(LIMIT / FPS), OUT], stdin=subprocess.PIPE)
    fsz = W * H * 3
    for n in range(LIMIT):
        t = n / FPS
        if n < PIC_FRAMES:
            buf = pic.stdout.read(fsz)
            fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
            masks(fr, t)
            overlays(fr, t)
        else:
            fr = end_card(t - 25.333)
        L = leak_layer(t)
        if L is not None:
            fr = 255 - (255 - fr) * (1 - L[..., None] * LEAK_COL)
        draw_embers(fr, t)
        fa = flash_amount(t)
        if fa > 0:
            fr = fr + (255 - fr) * fa
        enc.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
        if n % 60 == 0:
            print("frame", n, flush=True)
    enc.stdin.close()
    enc.wait()
    pic.kill()
    print("done", OUT)


if __name__ == "__main__":
    render()
