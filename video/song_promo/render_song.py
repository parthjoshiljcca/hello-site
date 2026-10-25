"""'Bagadwal Ki Bansuri' song promo (30s, 1080x1920).

Song 145.667s -> 175.667s: one full loud section, bar grid 2.667s (beats 0.667s),
ends right where the section drops out. Music-first: gold audio visualizer driven
by the actual track, song-title lockup, creator credits, book feature, end card.
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy.signal import stft

import textfx

UP = "/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650"
SRC = f"{UP}/3da759ef-VID-20261025-WA0001.mp4"
D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "song_promo.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 900
W, H, FPS = 1080, 1920, 30
A0 = 145.667
BAR = 2.6667
TITLE_T, MONT_T, BOOK_T, END_T = 2 * BAR, 4 * BAR, 8 * BAR, 10 * BAR
PIC_FRAMES = round(BOOK_T * FPS)       # 640
WIN_Y = 520

SHOTS = [(0, 301.0), (40, 74.0), (80, 25.0), (120, 81.0),          # hook
         (160, 211.0), (240, 255.0),                                 # title
         (320, 65.0), (360, 49.0), (400, 94.5), (440, 173.0),        # montage
         (480, 240.0), (520, 232.8), (560, 122.0), (600, 248.6)]
AMPS = {160: 0.16, 320: 0.1}


def picture_graph():
    g = [f"[0:v]fps={FPS},split={len(SHOTS)}" + "".join(f"[v{i}]" for i in range(len(SHOTS)))]
    ends = [s[0] for s in SHOTS[1:]] + [PIC_FRAMES]
    parts = []
    for i, ((a, src), b) in enumerate(zip(SHOTS, ends)):
        g.append(f"[v{i}]trim=start={src}:duration={(b - a) / FPS:.4f},setpts=PTS-STARTPTS,setsar=1[s{i}]")
        parts.append(f"[s{i}]")
    ts, amp = "t", "0.07"
    for a, _ in SHOTS[1:]:
        ts = f"if(gte(t,{a / FPS:.4f}),t-{a / FPS:.4f},{ts})"
        amp = f"if(gte(t,{a / FPS:.4f}),{AMPS.get(a, 0.07)},{amp})"
    g.append("".join(parts) + f"concat=n={len(parts)}:v=1:a=0,setpts=N/{FPS}/TB,"
             "eq=contrast=1.08:gamma=1.02:saturation=1.16,split=2[m1][m2]")
    g.append("[m1]scale=-2:1920,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.2:saturation=1.2[bg]")
    g.append(f"[m2]scale=w='trunc(1281*(1+({amp})*exp(-({ts})*7)+0.03*min({ts},1.33))/2)*2':h=-2:eval=frame:flags=lanczos,"
             f"crop=1080:720:x='clip((iw-1080)/2+12*exp(-({ts})*11)*sin(({ts})*85),0,iw-1080)':y='(ih-720)/2',unsharp=5:5:0.6[win]")
    g.append(f"[bg][win]overlay=0:{WIN_Y},trim=end_frame={PIC_FRAMES},format=rgb24[out]")
    return ";\n".join(g)


# ---------------------------------------------------------------- helpers
def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def resize(spr, scale):
    h0, w0 = spr.shape[:2]
    return np.asarray(Image.fromarray(spr, "RGBA").resize((max(1, int(w0 * scale)), max(1, int(h0 * scale))), Image.BILINEAR))


def blit(frame, spr, cx, cy, alpha=1.0, scale=1.0):
    if alpha <= 0.003:
        return
    if abs(scale - 1) > 1e-3:
        spr = resize(spr, scale)
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


GOLD = np.array([217, 179, 106], np.float32)


def stack(sprites, gap=0):
    """Vertically stack RGBA sprites, centred, into one sprite."""
    w = max(s.shape[1] for s in sprites)
    h = sum(s.shape[0] for s in sprites) + gap * (len(sprites) - 1)
    out = np.zeros((h, w, 4), np.uint8)
    y = 0
    for s in sprites:
        x = (w - s.shape[1]) // 2
        out[y:y + s.shape[0], x:x + s.shape[1]] = np.maximum(out[y:y + s.shape[0], x:x + s.shape[1]], s)
        y += s.shape[0] + gap
    return out


def ornament(width=760, h=40):
    """Gold hairlines with a centre diamond."""
    a = np.zeros((h, width), np.float32)
    c = width // 2
    a[h // 2 - 1:h // 2 + 1, 20:c - 34] = np.linspace(0, 1, c - 54)[None, :]
    a[h // 2 - 1:h // 2 + 1, c + 34:width - 20] = np.linspace(1, 0, c - 54)[None, :]
    yy, xx = np.mgrid[0:h, 0:width]
    a = np.maximum(a, (np.abs(xx - c) / 16 + np.abs(yy - h // 2) / 16 <= 1).astype(np.float32))
    for dx in (-26, 26):
        a = np.maximum(a, (np.abs(xx - c - dx) / 6 + np.abs(yy - h // 2) / 6 <= 1).astype(np.float32))
    g = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5)), np.float32) / 255
    al = np.clip(a + g * 0.6, 0, 1)
    rgb = np.where(a[..., None] > 0, np.array([240, 200, 110.]), np.array([255, 160, 50.]))
    return np.dstack([rgb, al * 255]).astype(np.uint8)


def W_(text, size, bold=True, style="gold", track=None):
    return textfx.word(text, size, bold=bold, style=style, track=track if track is not None else max(3, size // 12))


TITLE_LOCK = stack([W_("BAGADWAL", 156, track=14), ornament(820), W_("KI  BANSURI", 78, style="pale", track=26)], gap=-28)
TITLE_SMALL = resize(TITLE_LOCK, 0.42)

# ---------------------------------------------------------------- text events
TEXTS = []


def add(spr, cx, cy, t0, t1):
    TEXTS.append((spr, cx, cy, t0, t1))


def line(words, size, cy, times, t1, style="gold", bold=True):
    sp = [W_(w, size, bold, style) for w in words]
    pad = max(6, size // 7) * 3
    widths = [s.shape[1] - 2 * pad for s in sp]
    gap = int(size * 0.32)
    x = W / 2 - (sum(widths) + gap * (len(words) - 1)) / 2
    for s, wdt, t0 in zip(sp, widths, times):
        add(s, x + wdt / 2, cy, t0, t1)
        x += wdt + gap


B = BAR
line(["UTTARAKHAND'S", "MOST"], 64, 300, [0.1, 0.45], B - 0.05, style="pale")
line(["HAUNTING", "LEGEND"], 96, 395, [0.8, 1.25], B - 0.05)
line(["NOW"], 120, 1440, [B + 0.05], TITLE_T - 0.03, style="pale")
line(["A", "SONG."], 150, 1600, [B + 0.72, B + 1.38], TITLE_T - 0.03)
line(["A", "CINEMATIC", "MUSICAL", "ADAPTATION"], 40, 1430, [TITLE_T + 1.33] * 4, MONT_T - 0.1, style="pale", bold=False)
line(["OF", "AN", "UTTARAKHAND", "FOLK", "LEGEND"], 40, 1490, [TITLE_T + 1.5] * 5, MONT_T - 0.1, style="pale", bold=False)
line(["A", "FLUTE", "THAT", "ECHOED"], 76, 1520, [MONT_T + 0.05, MONT_T + 0.38, MONT_T + 0.72, MONT_T + 1.05], MONT_T + B - 0.08, style="pale")
line(["ACROSS", "THE", "VALLEYS"], 86, 1625, [MONT_T + 1.38, MONT_T + 1.72, MONT_T + 2.05], MONT_T + B - 0.08)
line(["A", "FORBIDDEN"], 86, 1520, [5 * B + 0.05, 5 * B + 0.7], 6 * B - 0.08, style="pale")
line(["MOUNTAIN"], 110, 1635, [5 * B + 1.38], 6 * B - 0.08)
line(["SPIRITS", "THAT", "WOKE"], 80, 1520, [6 * B + 0.05, 6 * B + 0.5, 6 * B + 0.95], 7 * B - 0.08, style="pale")
line(["TO", "ITS", "MELODY"], 92, 1625, [6 * B + 1.38, 6 * B + 1.7, 6 * B + 2.05], 7 * B - 0.08)
line(["LYRICS", "•", "MUSIC", "•", "CREATIVE", "DIRECTION"], 36, 1505, [7 * B + 0.05] * 6, BOOK_T - 0.05, style="pale", bold=False)
line(["PARTH", "D.", "JOSHI"], 104, 1610, [7 * B + 0.4, 7 * B + 0.72, 7 * B + 1.05], BOOK_T - 0.05)
line(["FEATURED", "IN", "THE"], 46, 170, [BOOK_T + 0.6] * 3, END_T - 0.08, style="pale", bold=False)
line(["UPCOMING", "BOOK"], 74, 245, [BOOK_T + 0.75] * 2, END_T - 0.08)
line(["FULL", "SONG", "OUT", "NOW"], 70, 1150, [END_T + 0.7, END_T + 0.85, END_T + 1.0, END_T + 1.15], 31, style="gold")
line(["WRITTEN", "•", "COMPOSED", "•", "DIRECTED", "BY"], 32, 1545, [END_T + 1.2] * 6, 31, style="pale", bold=False)
line(["PARTH", "D.", "JOSHI"], 84, 1625, [END_T + 1.3] * 3, 31)

AUTH = np.asarray(Image.open(os.path.join(D, "gfx", "author.png")).convert("RGBA").resize((780, 260), Image.LANCZOS))

# ---------------------------------------------------------------- audio visualizer
def band_levels():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(A0), "-t", "30.2", "-i", SRC, "-ac", "1", "-ar", "22050",
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32)
    sr, hop = 22050, 22050 // FPS
    f, t, Z = stft(x, fs=sr, nperseg=2048, noverlap=2048 - hop, boundary=None)
    mag = np.abs(Z)
    edges = np.geomspace(55, 9000, 41)
    ix = np.searchsorted(f, edges)
    bands = np.array([mag[a:max(b, a + 1)].mean(0) for a, b in zip(ix[:-1], ix[1:])])
    db = 20 * np.log10(bands + 1e-6)
    lo, hi = np.percentile(db, 25, axis=1, keepdims=True), np.percentile(db, 99, axis=1, keepdims=True)
    lv = np.clip((db - lo) / (hi - lo + 1e-6), 0, 1) ** 1.4
    out = np.zeros_like(lv)
    for i in range(lv.shape[1]):                  # fast attack, slow release
        prev = out[:, i - 1] if i else lv[:, 0]
        out[:, i] = np.where(lv[:, i] > prev, lv[:, i], prev * 0.82 + lv[:, i] * 0.18)
    return out.T                                   # frames x 40


LEVELS = band_levels()
NB = LEVELS.shape[1]


def draw_visualizer(frame, n, cy, alpha, maxh=78):
    if alpha <= 0 or n >= len(LEVELS):
        return
    lv = LEVELS[n]
    order = np.concatenate([lv[::-1], lv])         # lows in the centre, mirrored outwards
    bw, gap = 9, 4
    total = len(order) * (bw + gap) - gap
    x0 = (W - total) // 2
    lay = np.zeros((maxh * 2 + 40, W), np.float32)
    mid = maxh + 20
    for i, v in enumerate(order):
        h = int(3 + v * maxh)
        x = x0 + i * (bw + gap)
        lay[mid - h:mid + h, x:x + bw] = 1.0
    glow = np.asarray(Image.fromarray((lay * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7)), np.float32) / 255
    y0 = cy - mid
    reg = frame[y0:y0 + lay.shape[0]]
    yy = np.abs(np.arange(lay.shape[0]) - mid)[:, None, None] / maxh
    col = np.array([255, 236, 180.]) * (1 - yy) + np.array([205, 140, 45.]) * yy
    a = lay[..., None] * alpha
    reg *= (1 - a)
    reg += col * a
    reg += glow[..., None] * np.array([255, 150, 50.]) * 0.55 * alpha


# ---------------------------------------------------------------- embers & leaks & flashes
rng = np.random.default_rng(11)


def particles(n, t_from, t_to, burst=None):
    P = []
    for _ in range(n):
        if burst:
            ang = rng.uniform(0, 2 * math.pi); sp = rng.uniform(300, 1400)
            P.append(dict(ts=burst[0] + rng.uniform(0, 0.08), x0=burst[1], y0=burst[2], vx=math.cos(ang) * sp,
                          vy=math.sin(ang) * sp * 1.3, life=rng.uniform(1.2, 3), size=int(rng.choice([1, 2, 2, 3, 4])),
                          amp=rng.uniform(5, 25), ph=rng.uniform(0, 6), burst=True))
        else:
            P.append(dict(ts=rng.uniform(t_from, t_to), x0=rng.uniform(0, W), y0=rng.uniform(H * 0.35, H + 60), vx=0,
                          vy=rng.uniform(60, 200), life=rng.uniform(3, 7), size=int(rng.choice([1, 1, 2, 2, 3])),
                          amp=rng.uniform(10, 50), ph=rng.uniform(0, 6), burst=False))
    return P


PARTS = (particles(60, -6, 30) + particles(240, TITLE_T - 4, 30)
         + particles(200, 0, 0, burst=(TITLE_T, 540, 900)) + particles(140, 0, 0, burst=(BOOK_T + 0.4, 540, 930))
         + particles(120, 0, 0, burst=(END_T, 540, 860)))
for p in PARTS[60:300]:
    p["gate"] = TITLE_T
SPR = {}
for r in (1, 2, 3, 4):
    k = np.arange(-3 * r - 2, 3 * r + 3)
    g = np.exp(-(k[:, None] ** 2 + k[None, :] ** 2) / (2 * (r * 0.9) ** 2))
    core = np.exp(-(k[:, None] ** 2 + k[None, :] ** 2) / (2 * (r * 0.35) ** 2))
    SPR[r] = np.clip(g * 0.55 + core, 0, 1.4).astype(np.float32)
EMB = np.array([255, 196, 110], np.float32)


def embers(frame, t):
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
            x = p["x0"] + p["amp"] * math.sin(dt * 1.3 + p["ph"]); y = p["y0"] - p["vy"] * dt
        b = min(1, dt / 0.3) * min(1, (p["life"] - dt) / 0.8) * (0.65 + 0.35 * math.sin(t * 17 + p["ph"] * 5))
        if b <= 0.02:
            continue
        s = SPR[p["size"]]; r = s.shape[0] // 2; xi, yi = int(x), int(y)
        xa, ya, xb, yb = max(xi - r, 0), max(yi - r, 0), min(xi + r + 1, W), min(yi + r + 1, H)
        if xa < xb and ya < yb:
            frame[ya:yb, xa:xb] += s[ya - (yi - r):yb - (yi - r), xa - (xi - r):xb - (xi - r)][..., None] * EMB * b


LW, LH = 108, 192
gy, gx = np.mgrid[0:LH, 0:LW].astype(np.float32)
HITS = [(0.0, 0.3), (B, 0.4), (TITLE_T, 1.0), (MONT_T, 0.45), (5 * B, 0.3), (6 * B, 0.35), (7 * B, 0.4), (BOOK_T, 0.8), (END_T, 0.8)]
LEAK_COL = np.array([1.0, 0.55, 0.18], np.float32)


def leak(t):
    env = 0.08 + sum(a * math.exp(-(t - h) * 2.4) for h, a in HITS if t >= h)
    f = np.zeros((LH, LW), np.float32)
    for i, (sx, sy, rad) in enumerate(((0.08, 0.12, 30), (0.95, 0.5, 36), (0.25, 0.97, 34))):
        cx = LW * (sx + 0.12 * math.sin(t * 0.6 + i * 2)); cy = LH * (sy + 0.08 * math.cos(t * 0.45 + i))
        f += np.exp(-((gx - cx) ** 2 + (gy - cy) ** 2) / (2 * rad ** 2))
    f = np.clip(f * env, 0, 1)
    return np.asarray(Image.fromarray((f * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32) / 255


FLASHES = [(B, 0.25, 12), (TITLE_T, 0.8, 6), (3 * B, 0.18, 12), (MONT_T, 0.35, 10), (5 * B, 0.2, 12), (6 * B, 0.2, 12),
           (7 * B, 0.25, 12), (BOOK_T, 0.7, 6), (9 * B, 0.15, 12), (END_T, 0.6, 6)] + \
          [(MONT_T + 0.667 * i, 0.07, 18) for i in range(16) if i % 4]


def flash(t):
    return min(1, sum(a * math.exp(-(t - s) * k) for s, a, k in FLASHES if 0 <= t - s < 1.2))


# ---------------------------------------------------------------- book + end card
COVER = Image.open(f"{UP}/263ea9ce-image.png").convert("RGB")
BW, BH = 640, 960
BOOK = np.asarray(COVER.resize((BW, BH), Image.LANCZOS), np.float32)
BOOK_BG = np.asarray(COVER.resize((1280, 1920), Image.LANCZOS).crop((100, 0, 1180, 1920)).filter(ImageFilter.GaussianBlur(40)), np.float32) * 0.3
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
GLOW = np.exp(-(((xx - 540) / 520) ** 2 + ((yy - 930) / 700) ** 2) * 2.2)[..., None] * np.array([255, 150, 50], np.float32)


def solve_persp(dst, src):
    A, Bv = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); Bv.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); Bv.append(v)
    return np.linalg.solve(np.array(A, float), np.array(Bv, float)).tolist()


def book(frame, u, cx=540, cy=930):
    k = ease_out(u / 1.1)
    theta = math.radians(100 * (1 - k) + 5 * math.sin(u * 1.4) * k)
    if math.cos(theta) <= 0.02:
        return
    sc = 0.82 + 0.18 * k + 0.012 * u
    cy = cy + 8 * math.sin(u * 1.8) * k
    f = 2000.0
    corners = []
    for x, y in ((-BW / 2, -BH / 2), (BW / 2, -BH / 2), (BW / 2, BH / 2), (-BW / 2, BH / 2)):
        X, Z = x * math.cos(theta) * sc, x * math.sin(theta) * sc
        corners.append((cx + X * f / (f + Z), cy + y * sc * f / (f + Z)))
    tex = BOOK
    if 1.1 <= u <= 2.1:
        p = -400 + (u - 1.1) / 1.0 * (BW + 900)
        by, bx = np.mgrid[0:BH, 0:BW].astype(np.float32)
        tex = tex + np.exp(-(((bx + 0.45 * by) - p) / 80) ** 2)[..., None] * np.array([150, 125, 85], np.float32)
    tex = np.clip(tex * (0.55 + 0.45 * math.cos(theta)), 0, 255).astype(np.uint8)
    img = Image.fromarray(np.dstack([tex, np.full((BH, BW), 255, np.uint8)]), "RGBA")
    xs = [c[0] for c in corners]; ys = [c[1] for c in corners]
    x0, y0 = max(int(min(xs)) - 2, 0), max(int(min(ys)) - 2, 0)
    x1, y1 = min(int(max(xs)) + 3, W), min(int(max(ys)) + 3, H)
    coeffs = solve_persp([(x - x0, y - y0) for x, y in corners], [(0, 0), (BW, 0), (BW, BH), (0, BH)])
    wp = np.asarray(img.transform((x1 - x0, y1 - y0), Image.PERSPECTIVE, coeffs, Image.BICUBIC), np.float32)
    a = wp[..., 3:4] / 255
    sh = np.asarray(Image.fromarray((a[..., 0] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(22)), np.float32)[..., None] / 255
    reg = frame[y0:y1, x0:x1]
    reg *= (1 - sh * 0.7); reg *= (1 - a); reg += wp[..., :3] * a


END_BG = None


def book_section(t):
    u = t - BOOK_T
    fr = BOOK_BG.copy()
    fr += GLOW * min(1, u / 1.0) * 0.5
    book(fr, u)
    if u >= 1.6:
        k = ease_out((u - 1.6) / 0.5)
        blit(fr, AUTH, 540, 1600 + 30 * (1 - k), alpha=k)
    return fr


def end_section(t, last_pic):
    u = t - END_T
    fr = last_pic.copy()
    k = ease_out(u / 0.25)
    blit(fr, TITLE_LOCK, 540, 820, alpha=min(1, u / 0.05), scale=1.45 - 0.45 * k)
    draw_visualizer(fr, int(round(t * FPS)), 1350, min(1, u / 0.3), maxh=90)
    return fr


def overlays(fr, t):
    for s, cx, cy, t0, t1 in TEXTS:
        if t0 <= t < t1:
            dt = t - t0; k = ease_out(dt / 0.16)
            blit(fr, s, cx, cy + 10 * (1 - k), alpha=min(1, dt / 0.06) * min(1, (t1 - t) / 0.12), scale=1 + 0.55 * (1 - k))


def render():
    pic = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-filter_complex", picture_graph(), "-map", "[out]",
                            "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-ss", str(A0), "-t", "30", "-i", SRC, "-filter_complex",
                            "[0:v]noise=c0s=5:c0f=t+u,fade=t=in:st=0:d=0.12,fade=t=out:st=29.4:d=0.6,format=yuv420p[v];"
                            "[1:a]afade=t=in:st=0:d=0.08,afade=t=out:st=29.3:d=0.7,alimiter=limit=0.95:level=false[a]",
                            "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high",
                            "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart", "-t", str(LIMIT / FPS), OUT],
                           stdin=subprocess.PIPE)
    fsz = W * H * 3
    end_bg = None
    for n in range(LIMIT):
        t = n / FPS
        if n < PIC_FRAMES:
            fr = np.frombuffer(pic.stdout.read(fsz), np.uint8).reshape(H, W, 3).astype(np.float32)
            if t < TITLE_T and t < 0.0:
                pass
            if TITLE_T <= t < MONT_T:             # darken under the title lockup
                k = min(1, (t - TITLE_T) / 0.1) * min(1, (MONT_T - t) / 0.3)
                fr *= 1 - 0.45 * k
                dt = t - TITLE_T; kk = ease_out(dt / 0.22)
                blit(fr, TITLE_LOCK, 540, 900, alpha=min(1, dt / 0.04) * min(1, (MONT_T - 0.05 - t) / 0.25), scale=1.6 - 0.6 * kk + 0.015 * dt)
            if MONT_T <= t < BOOK_T:
                blit(fr, TITLE_SMALL, 540, 330, alpha=min(1, (t - MONT_T) / 0.3))
                draw_visualizer(fr, n, 1345, min(1, (t - MONT_T) / 0.25))
            for yl in (WIN_Y - 6, WIN_Y + 720 + 4):
                fr[yl:yl + 2, 90:990] = fr[yl:yl + 2, 90:990] * 0.25 + GOLD * 0.75
            if n == PIC_FRAMES - 1:
                end_bg = np.asarray(Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(30)), np.float32) * 0.45
        elif t < END_T:
            fr = book_section(t)
        else:
            fr = end_section(t, end_bg if end_bg is not None else np.zeros((H, W, 3), np.float32))
        overlays(fr, t)
        L = leak(t)
        fr = 255 - (255 - fr) * (1 - L[..., None] * LEAK_COL)
        embers(fr, t)
        fa = flash(t)
        if fa > 0:
            fr = fr + (255 - fr) * fa
        enc.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
        if n % 90 == 0:
            print("frame", n, flush=True)
    enc.stdin.close(); enc.wait(); pic.kill()
    print("done", OUT)


if __name__ == "__main__":
    render()
