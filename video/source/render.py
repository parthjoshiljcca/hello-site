"""Renders 'The Great Bamboo Fight' — 1080x1920, 30 fps, 20 s — and pipes frames to ffmpeg."""
import json, math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS, DUR = 1080, 1920, 30, 20.0
NF = int(FPS * DUR)
GROUND = 1590
rng = np.random.default_rng(3)
ENV = json.load(open("env.json"))

# ------------------------------------------------------------------ helpers
def ease(x):
    x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)

def track(keys, t):
    """keys: [(time, value_tuple_or_float), ...] smooth interpolation."""
    if t <= keys[0][0]: return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            k = ease((t - t0) / (t1 - t0) if t1 > t0 else 1)
            if isinstance(v0, tuple): return tuple(a + (b - a) * k for a, b in zip(v0, v1))
            return v0 + (v1 - v0) * k
    return keys[-1][1]

def step(keys, t):
    v = keys[0][1]
    for k, val in keys:
        if t >= k: v = val
    return v

# ------------------------------------------------------------------ sprites
def load(name):
    return Image.open(f"cut/{name}.png").convert("RGBA")

HEAD = {"m_sit": (60, -4, 92), "f_sit": (58, -6, 96), "m_front": (84, -8, 116), "f_front": (72, -10, 118),
        "m_big": (212, -8, 320), "f_big": (180, -14, 320)}

def feathered(face, fw):
    f = load(face); s = fw / f.width
    f = f.resize((round(f.width * s), round(f.height * s)), Image.LANCZOS)
    a = np.asarray(f.getchannel("A")).astype(float); h, w = a.shape
    yy = np.linspace(0, 1, h)[:, None]; xx = np.linspace(0, 1, w)[None, :]
    a *= np.clip((1 - yy) / 0.22, 0, 1)                      # fade shoulders
    a *= np.clip(np.minimum(xx, 1 - xx) / 0.07, 0, 1)        # fade clipped cell sides
    f.putalpha(Image.fromarray(a.astype(np.uint8))); return f

_cache = {}
def sprite(body, face, height):
    key = (body, face, height)
    if key in _cache: return _cache[key]
    b = load(body)
    if face:
        cx, ty, fw = HEAD[body]; f = feathered(face, fw); pad = max(0, -ty)
        c = Image.new("RGBA", (b.width, b.height + pad)); c.alpha_composite(b, (0, pad))
        c.alpha_composite(f, (int(cx - f.width / 2), ty + pad)); b = c
    s = height / b.height
    b = b.resize((round(b.width * s), height), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
    _cache[key] = b; return b

# ------------------------------------------------------------------ bamboo prop
def make_stick(length=540, th=34, leaves=True):
    im = Image.new("RGBA", (length + 80, th + 120)); d = ImageDraw.Draw(im); y0 = 60
    for i in range(th):  # cylindrical shading
        k = i / th; c = (int(110 + 90 * (1 - abs(k - 0.3) * 1.6)), int(150 + 70 * (1 - abs(k - 0.3) * 1.6)), int(50 + 25 * (1 - k)))
        d.line([(40, y0 + i), (40 + length, y0 + i)], fill=c + (255,))
    for x in range(40 + length // 4, 40 + length, length // 4):
        d.rectangle([x - 4, y0 - 2, x + 4, y0 + th + 2], fill=(88, 112, 40, 255))
        d.line([(x + 5, y0), (x + 5, y0 + th)], fill=(190, 215, 120, 255), width=2)
    d.ellipse([34, y0, 46, y0 + th], fill=(200, 205, 140, 255))
    if leaves:
        for ang, ln in [(-35, 110), (-60, 90), (20, 100)]:
            lf = Image.new("RGBA", (ln, 30)); ImageDraw.Draw(lf).polygon([(0, 15), (ln * 0.4, 2), (ln, 15), (ln * 0.4, 28)], fill=(95, 170, 60, 255))
            lf = lf.rotate(ang, expand=True, resample=Image.BICUBIC); im.alpha_composite(lf, (40 + length - 30, max(0, y0 + th // 2 - lf.height // 2)))
    return im.filter(ImageFilter.GaussianBlur(0.6))

STICK = make_stick()
HALF_A = make_stick(270, 34, leaves=True)
HALF_B = make_stick(270, 34, leaves=False)

def paste_rot(dst, src, cx, cy, ang, scale=1.0):
    if scale != 1.0: src = src.resize((int(src.width * scale), int(src.height * scale)), Image.LANCZOS)
    r = src.rotate(ang, expand=True, resample=Image.BICUBIC)
    dst.alpha_composite(r, (int(cx - r.width / 2), int(cy - r.height / 2)))

# ------------------------------------------------------------------ forest background (parallax layers)
BW = 1400
def bamboo_layer(n, wmin, wmax, col, blur, alpha, seed, leaves):
    r = np.random.default_rng(seed); im = Image.new("RGBA", (BW, H)); d = ImageDraw.Draw(im)
    for _ in range(n):
        x = r.uniform(-50, BW); w = r.uniform(wmin, wmax); tilt = r.uniform(-25, 25); c = tuple(int(v * r.uniform(0.85, 1.15)) for v in col)
        d.polygon([(x, -20), (x + w, -20), (x + w + tilt, H), (x + tilt, H)], fill=c + (alpha,))
        d.line([(x + w * 0.25, -20), (x + w * 0.25 + tilt, H)], fill=tuple(min(255, v + 45) for v in c) + (alpha,), width=max(2, int(w * 0.12)))
        y = r.uniform(0, 200)
        while y < H:
            xx = x + tilt * y / H; d.rectangle([xx - 2, y, xx + w + 2, y + max(3, w * 0.08)], fill=tuple(int(v * 0.7) for v in c) + (alpha,)); y += r.uniform(180, 320)
        if leaves:
            for _ in range(r.integers(3, 7)):
                ly = r.uniform(0, H * 0.75); lx = x + tilt * ly / H + w / 2
                for _ in range(r.integers(3, 6)):
                    a = r.uniform(0, 2 * math.pi); ln = r.uniform(60, 140)
                    p = [(lx, ly), (lx + math.cos(a + 0.18) * ln * 0.5, ly + math.sin(a + 0.18) * ln * 0.5), (lx + math.cos(a) * ln, ly + math.sin(a) * ln), (lx + math.cos(a - 0.18) * ln * 0.5, ly + math.sin(a - 0.18) * ln * 0.5)]
                    d.polygon(p, fill=(int(90 * r.uniform(0.8, 1.3)), int(165 * r.uniform(0.85, 1.15)), 55, alpha))
    return im.filter(ImageFilter.GaussianBlur(blur))

def make_sky():
    g = np.zeros((H, BW, 3)); y = np.linspace(0, 1, H)[:, None]
    top, mid, bot = np.array([228, 238, 160]), np.array([96, 150, 70]), np.array([42, 78, 34])
    g[:] = np.where(y[..., None] < 0.55, top + (mid - top) * (y[..., None] / 0.55), mid + (bot - mid) * ((y[..., None] - 0.55) / 0.45))
    im = Image.fromarray(g.astype(np.uint8)).convert("RGBA"); d = ImageDraw.Draw(im)
    r = np.random.default_rng(11)
    for _ in range(140):  # bokeh
        x, yy, rad = r.uniform(0, BW), r.uniform(0, H * 0.75), r.uniform(15, 70)
        c = (int(r.uniform(180, 255)), int(r.uniform(220, 255)), int(r.uniform(120, 190)), int(r.uniform(40, 110)))
        d.ellipse([x - rad, yy - rad, x + rad, yy + rad], fill=c)
    return im.filter(ImageFilter.GaussianBlur(22))

def make_ground():
    im = Image.new("RGBA", (BW, H)); d = ImageDraw.Draw(im); r = np.random.default_rng(5)
    d.ellipse([-300, GROUND - 120, BW + 300, H + 900], fill=(74, 92, 52, 255))         # mossy clearing
    arr = np.asarray(im).astype(float); noise = r.normal(0, 14, arr.shape[:2])
    noise = np.asarray(Image.fromarray(np.uint8(np.clip(noise + 128, 0, 255))).filter(ImageFilter.GaussianBlur(1.5))).astype(float) - 128
    arr[..., :3] += noise[..., None] * (arr[..., 3:] > 0)
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for _ in range(900):  # grass blades
        x = r.uniform(0, BW); y = r.uniform(GROUND - 60, H); h = r.uniform(20, 70); lean = r.uniform(-18, 18)
        g = int(r.uniform(110, 190)); d.line([(x, y), (x + lean, y - h)], fill=(int(g * 0.5), g, int(g * 0.35), 255), width=int(r.uniform(2, 5)))
    for _ in range(40):  # moss tufts
        x = r.uniform(0, BW); y = r.uniform(GROUND, H); rad = r.uniform(20, 60)
        d.ellipse([x - rad, y - rad * 0.4, x + rad, y + rad * 0.4], fill=(90, 130, 50, 160))
    return im.filter(ImageFilter.GaussianBlur(1.2))

def make_rays():
    im = Image.new("RGBA", (BW, H)); d = ImageDraw.Draw(im)
    for x in [200, 520, 900, 1150]:
        d.polygon([(x, -50), (x + 120, -50), (x - 500, H), (x - 760, H)], fill=(255, 245, 190, 22))
    return im.filter(ImageFilter.GaussianBlur(40))

print("building background…", file=sys.stderr)
LAYERS = [  # (image, parallax factor)
    (make_sky(), 0.15),
    (bamboo_layer(26, 25, 55, (120, 160, 90), 10, 170, 1, False), 0.3),
    (bamboo_layer(14, 45, 80, (85, 140, 55), 5, 230, 2, True), 0.55),
    (make_rays(), 0.6),
    (make_ground(), 1.0),
]
FG = bamboo_layer(3, 110, 150, (60, 110, 40), 9, 255, 9, True)   # near foreground stalks at the edges
fgd = ImageDraw.Draw(FG)
FG_MASK = Image.new("L", (BW, H)); md = ImageDraw.Draw(FG_MASK)
md.rectangle([0, 0, 170, H], fill=255); md.rectangle([BW - 170, 0, BW, H], fill=255)
FG.putalpha(Image.fromarray((np.asarray(FG.getchannel("A")).astype(float) * np.asarray(FG_MASK.filter(ImageFilter.GaussianBlur(40))) / 255).astype(np.uint8)))

def shadow(dst, cx, w):
    s = Image.new("RGBA", (int(w * 1.4), 80)); ImageDraw.Draw(s).ellipse([0, 10, s.width, 70], fill=(10, 25, 5, 120))
    dst.alpha_composite(s.filter(ImageFilter.GaussianBlur(14)), (int(cx - s.width / 2), GROUND - 45))

# ------------------------------------------------------------------ choreography
# body heights in px
HT = {"m_sit": 560, "f_sit": 540, "m_front": 800, "f_front": 800, "m_big": 1020, "f_big": 980, "m_back": 820, "f_back": 840}

MALE_BODY = [(0, "m_sit"), (5.0, "m_big"), (9.45, "m_back"), (10.15, "m_sit")]
MALE_FACE = [(0, "m_happy"), (1.0, "m_excited"), (1.3, "m_angry"), (5.0, "m_angry"), (5.35, "m_proud"),
             (10.15, "m_curious"), (10.9, "m_silly"), (11.75, "m_surprised"), (13.62, "m_scared"),
             (15.1, "m_sad"), (16.85, "m_surprised"), (17.0, "m_love"), (19.2, "m_laugh")]
FEM_BODY = [(0, "f_sit"), (5.0, "f_big"), (9.6, "f_back"), (11.55, "f_front"), (15.1, "f_sit")]
FEM_FACE = [(0, "f_happy"), (1.3, "f_surprised"), (1.55, "f_angry"), (5.0, "f_determined"), (7.0, "f_angry"),
            (11.55, "f_excited"), (12.55, "f_determined"), (13.65, "f_proud"),
            (15.1, "f_curious"), (15.9, "f_happy"), (18.45, "f_proud"), (19.3, "f_laugh")]
# body swap moments → squash/turn animation
M_SWAPS = [5.0, 9.45, 10.15]; F_SWAPS = [5.0, 9.6, 11.55, 15.1]
TURNS = {9.45, 9.6, 10.15, 11.55}  # swaps that read as turning around (horizontal flip-squash)

def swap_fx(t, swaps):
    sx, sy = 1.0, 1.0
    for s in swaps:
        d = t - s
        if s in TURNS and -0.15 <= d < 0.15: sx = min(sx, max(0.04, abs(d) / 0.15))
        elif 0 <= d < 0.35: sy *= 1 + 0.12 * math.sin(d / 0.35 * math.pi * 2) * (1 - d / 0.35); sx *= 1 - 0.06 * math.sin(d / 0.35 * math.pi * 2) * (1 - d / 0.35)
    return sx, sy

def tug(t):  # tug-of-war offset
    if 1.55 <= t < 5.0: return 38 * math.sin(2 * math.pi * 1.4 * (t - 1.55)) * min(1, (t - 1.55) / 0.3)
    return 0.0

def male_xy(t):
    x = track([(0, 300.0), (4.9, 300.0), (5.1, 285.0), (10.0, 285.0), (10.2, 300.0), (18.9, 300.0), (19.4, 345.0)], t)
    rot = track([(0, 0.0), (5.2, 0.0), (5.6, 5.0), (9.3, 5.0), (9.4, 0.0), (13.6, 0.0), (13.7, 6.0), (14.2, 0.0), (18.9, 0.0), (19.4, -6.0)], t)
    x += tug(t); rot += tug(t) * 0.12
    if 10.9 <= t < 11.7: rot += 1.5 * math.sin(t * 40)  # nibbling
    return x, rot

def fem_xy(t):
    x = track([(0, 790.0), (4.9, 790.0), (5.1, 805.0), (10.0, 805.0), (11.5, 805.0), (11.6, 790.0), (15.0, 790.0), (15.2, 770.0), (18.9, 770.0), (19.4, 725.0)], t)
    rot = track([(0, 0.0), (6.9, 0.0), (7.2, 4.0), (9.3, 4.0), (9.4, 0.0), (11.6, 0.0), (11.7, 6.0), (12.0, 0.0), (18.4, 0.0), (18.6, 5.0), (18.9, 0.0), (19.4, 7.0)], t)
    x += tug(t); rot += tug(t) * 0.12
    return x, rot

def draw_char(frame, t, who):
    fi = min(int(t * FPS), len(ENV[who]) - 1)
    body = step(MALE_BODY if who == "m" else FEM_BODY, t); face = step(MALE_FACE if who == "m" else FEM_FACE, t)
    if body.endswith("back"): face = None
    x, rot = male_xy(t) if who == "m" else fem_xy(t)
    sx, sy = swap_fx(t, M_SWAPS if who == "m" else F_SWAPS)
    talk = ENV[who][fi]; sy *= 1 + 0.035 * talk; sx *= 1 - 0.015 * talk
    sy *= 1 + 0.012 * math.sin(t * 2 * math.pi * (0.55 if who == "m" else 0.62))   # breathing
    if who == "m" and 13.62 <= t < 14.1: k = (t - 13.62) / 0.48; sy *= 1 + 0.18 * math.sin(k * math.pi) ; sx *= 1 - 0.05 * math.sin(k * math.pi)  # shock pop
    if who == "f" and 15.1 <= t < 15.1: pass
    hop = 0.0
    if who == "f" and 11.4 <= t < 11.7: hop = 50 * math.sin((t - 11.4) / 0.3 * math.pi)
    if who == "f" and 14.85 <= t < 15.1: hop = 60 * math.sin((t - 14.85) / 0.25 * math.pi)
    sp = sprite(body, face, HT[body])
    w, h = max(2, int(sp.width * sx)), max(2, int(sp.height * sy))
    shadow(frame, x, sp.width * 0.8)
    s = sp.resize((w, h), Image.BILINEAR)
    # rotate around feet: pad so feet are the centre
    pad = Image.new("RGBA", (w + 40, h * 2)); pad.alpha_composite(s, (20, 0))
    r = pad.rotate(rot, resample=Image.BICUBIC, center=(pad.width / 2, h))
    frame.alpha_composite(r, (int(x - r.width / 2), int(GROUND + 10 - h - hop)))
    return h

def draw_props(frame, t):
    if t < 13.4 or t >= 16.1:
        pass
    if t < 10.4:
        if t < 0.9: p = (540, GROUND + 25, 0.0)
        elif t < 1.35: p = track([(0.9, (540.0, GROUND + 25.0, 0.0)), (1.35, (430.0, 1400.0, -6.0))], t)
        elif t < 5.0: p = track([(1.35, (430.0, 1400.0, -6.0)), (1.6, (545.0, 1400.0, 0.0))], t); p = (p[0] + tug(t), p[1], p[2] + tug(t) * 0.05)
        elif t < 5.2: p = track([(5.0, (545.0, 1400.0, 0.0)), (5.2, (545.0, GROUND + 40, 4.0))], t)
        else: p = (545, GROUND + 40, 4.0)
        paste_rot(frame, STICK, p[0], p[1], p[2])
    elif t < 16.1:
        if t < 10.9: p = track([(10.4, (545.0, GROUND + 40, 4.0)), (10.9, (262.0, 1365.0, 50.0))], t)
        elif t < 13.35: p = (262 + (3 * math.sin(t * 45) if t < 11.7 else 0), 1365 + (6 * math.sin(t * 40) if t < 11.7 else 0), 50.0)
        elif t < 13.65: k = (t - 13.35) / 0.3; p = (262 + (720 - 262) * ease(k), 1365 + (1250 - 1365) * ease(k) - 160 * math.sin(k * math.pi), 50 - 38 * ease(k))
        elif t < 15.0: p = (720 + 6 * math.sin(t * 3), 1250, 12.0)
        else: p = track([(15.0, (720.0, 1250.0, 12.0)), (15.3, (690.0, 1400.0, 0.0))], t)
        paste_rot(frame, STICK, p[0], p[1], p[2], 0.9)
    else:
        jolt = 8 * math.sin((t - 16.1) * 60) * max(0, 1 - (t - 16.1) / 0.25)
        a = track([(16.1, (640.0, 1400.0, 0.0)), (16.4, (700.0, 1390.0, 25.0)), (19.3, (700.0, 1390.0, 25.0)), (19.6, (765.0, 1395.0, -50.0))], t)
        b = track([(16.1, (760.0, 1400.0, 0.0)), (16.45, (640.0, 1360.0, -25.0)), (16.95, (390.0, 1390.0, -25.0)), (19.3, (390.0, 1390.0, -25.0)), (19.6, (305.0, 1395.0, 50.0))], t)
        if t >= 19.6: a = (a[0], a[1] + 5 * math.sin(t * 40), a[2]); b = (b[0], b[1] + 5 * math.sin(t * 43), b[2])
        paste_rot(frame, HALF_B, b[0], b[1] + jolt, b[2], 0.9)
        paste_rot(frame, HALF_A, a[0], a[1] - jolt, a[2], 0.9)
        if t < 16.35:  # splinter burst
            d = ImageDraw.Draw(frame); k = (t - 16.1) / 0.25
            for i in range(10):
                ang = i * 0.63; rr = 30 + 120 * k
                d.line([(700 + math.cos(ang) * rr, 1400 + math.sin(ang) * rr), (700 + math.cos(ang) * (rr + 22), 1400 + math.sin(ang) * (rr + 22))], fill=(210, 220, 140, int(255 * (1 - k))), width=5)

def camera(t):
    # (zoom, centre_x, centre_y) — smooth, continuous moves, no hard cuts
    return track([(0, (1.15, 540.0, 1150.0)), (4.0, (1.25, 540.0, 1230.0)), (5.0, (1.05, 540.0, 1100.0)),
                  (9.0, (1.12, 540.0, 1050.0)), (10.2, (1.15, 540.0, 1200.0)), (11.6, (1.22, 430.0, 1180.0)),
                  (12.6, (1.15, 640.0, 1150.0)), (13.6, (1.15, 540.0, 1150.0)), (14.6, (1.45, 340.0, 1200.0)),
                  (15.8, (1.25, 540.0, 1230.0)), (18.8, (1.35, 540.0, 1260.0)), (20, (1.45, 540.0, 1260.0))], t)

def render(t):
    z, cx, cy = camera(t)
    frame = Image.new("RGBA", (W, H))
    for img, par in LAYERS:
        ox = (cx - 540) * par + (BW - W) / 2 + 12 * math.sin(t * 0.3) * (1 - par)
        frame.alpha_composite(img.crop((int(ox), 0, int(ox) + W, H)))
    back_props = t < 0.9 or 5.2 <= t < 10.4
    if back_props: draw_props(frame, t)
    draw_char(frame, t, "m"); draw_char(frame, t, "f")
    if not back_props: draw_props(frame, t)
    # camera zoom (crop + scale)
    cw, ch = W / z, H / z; x0 = min(max(cx - cw / 2, 0), W - cw); y0 = min(max(cy - ch / 2, 0), H - ch)
    frame = frame.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))
    ox = (cx - 540) * 1.3 + (BW - W) / 2
    frame.alpha_composite(FG.crop((int(ox), 0, int(ox) + W, H)))
    return frame.convert("RGB")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stills":
        for t in [float(a) for a in sys.argv[2:]]: render(t).save(f"still_{t:05.2f}.png")
        sys.exit()
    out = sys.argv[1] if len(sys.argv) > 1 else "video.mp4"
    ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-i", "soundtrack.wav", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high",
                           "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-shortest", out], stdin=subprocess.PIPE)
    for i in range(NF):
        ff.stdin.write(render(i / FPS).tobytes())
        if i % 60 == 0: print(f"frame {i}/{NF}", file=sys.stderr)
    ff.stdin.close(); ff.wait(); print("done", out)
