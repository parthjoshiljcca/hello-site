"""Animated SpArsh logo reveal: handwriting wipe + pen-tip sparks + glow bloom + shine sweep + tagline rise.
Usage: python3 -I logo.py <logo_on_black.png> <W> <H> <seconds> <out.mp4>"""
import numpy as np, subprocess, sys
from PIL import Image, ImageFilter

src, W, H, DUR, OUT = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
FPS = 30
rng = np.random.default_rng(11)

# --- extract logo: luminance -> alpha, un-premultiply colour
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255
a = np.clip((im.max(2) - 0.06) / 0.55, 0, 1)
im0 = im; sy0, sx0 = im.shape[0] / 1024, im.shape[1] / 1536
ys, xs = np.where(a > 0.02)
pad = 12
y0, y1, x0, x1 = ys.min() - pad, ys.max() + pad, xs.min() - pad, xs.max() + pad
im, a = im[y0:y1, x0:x1], a[y0:y1, x0:x1]
col = np.clip(im / np.maximum(a[..., None], 1e-3), 0, 1)
col = col * 0.85 + np.array([1.0, 0.82, 0.42]) * 0.15  # keep it rich gold

# scale logo to frame
target_w = int(W * (0.80 if H > W else 0.56))
s = target_w / a.shape[1]
lw, lh = target_w, int(a.shape[0] * s)
A = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((lw, lh), Image.LANCZOS)).astype(np.float32) / 255
C = np.asarray(Image.fromarray((col * 255).astype(np.uint8)).resize((lw, lh), Image.LANCZOS)).astype(np.float32) / 255

# split tagline ("DIVINE ART STUDIO"): its box in the 1536x1024 source logo is ~x 540-1145, y 695-742
tm = np.zeros(im0.shape[:2], np.float32); tm[int(695 * sy0):int(745 * sy0), int(540 * sx0):int(1150 * sx0)] = 1
tm = tm[y0:y1, x0:x1]
tag_mask = np.asarray(Image.fromarray((tm * 255).astype(np.uint8)).resize((lw, lh), Image.NEAREST)).astype(np.float32) / 255
A_sig, A_tag = A * (1 - tag_mask), A * tag_mask

ox, oy = (W - lw) // 2, int(H * (0.42 if H > W else 0.38)) - lh // 2

def full(layer):
    out = np.zeros((H, W) + layer.shape[2:], np.float32); out[oy:oy + lh, ox:ox + lw] = layer; return out

FA_sig, FA_tag, FC = full(A_sig), full(A_tag), full(C)
blur = lambda x, r: np.asarray(Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255
G1, G2 = blur(FA_sig + FA_tag, 8 * W / 1080), blur(FA_sig + FA_tag, 40 * W / 1080)

# stroke centroid per column for the pen tip
cent = np.array([(np.arange(lh) * A_sig[:, c]).sum() / max(A_sig[:, c].sum(), 1e-3) if A_sig[:, c].sum() > 0.5 else np.nan for c in range(lw)])
idx = np.arange(lw); ok = ~np.isnan(cent); cent = np.interp(idx, idx[ok], cent[ok])

# background: warm charcoal, lighter at edges like the neon reference, warm pool behind the logo
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - (oy + lh / 2)) / H) ** 2 * (H / W) ** 2 * 1.0)
bg = np.dstack([np.full((H, W), v) for v in (0.12, 0.10, 0.085)]) + (np.clip(d / 0.7, 0, 1) ** 1.5)[..., None] * np.array([0.17, 0.155, 0.14])
GLOW = np.array([1.0, 0.62, 0.12])

# "Happy Diwali" wish: gold script with outline + glow, placed under the logo
def make_wish():
    from PIL import ImageDraw, ImageFont
    fpath = sys.argv[6] if len(sys.argv) > 6 else "GreatVibes-Regular.ttf"
    TXT = sys.argv[7] if len(sys.argv) > 7 else "Happy Diwali"
    tw = W * (0.66 if H > W else 0.40)
    size = 200
    RQ = ImageFont.Layout.RAQM
    fnt = ImageFont.truetype(fpath, size, layout_engine=RQ)
    bb = ImageDraw.Draw(Image.new("L", (8, 8))).textbbox((0, 0), TXT, font=fnt)
    size = int(size * tw / (bb[2] - bb[0])); fnt = ImageFont.truetype(fpath, size, layout_engine=RQ)
    m = Image.new("L", (W, H), 0); dr = ImageDraw.Draw(m)
    bb = dr.textbbox((0, 0), TXT, font=fnt)
    tx = (W - (bb[2] - bb[0])) // 2 - bb[0]
    ty = oy + lh + int(H * (0.035 if H > W else 0.05)) - bb[1]
    dr.text((tx, ty), TXT, font=fnt, fill=255)
    so = Image.new("L", (W, H), 0); ImageDraw.Draw(so).text((tx, ty), TXT, font=fnt, fill=255, stroke_width=max(2, size // 40), stroke_fill=255)
    a = np.asarray(m).astype(np.float32) / 255; ao = np.asarray(so).astype(np.float32) / 255
    y0, y1 = ty + bb[1], ty + bb[3]
    v = np.clip((yy - y0) / max(y1 - y0, 1), 0, 1)[..., None]
    rgb = np.where(v < 0.45, np.array([1.0, 0.93, 0.66]) + (np.array([0.98, 0.77, 0.30]) - np.array([1.0, 0.93, 0.66])) * (v / 0.45),
                   np.array([0.98, 0.77, 0.30]) + (np.array([0.80, 0.47, 0.10]) - np.array([0.98, 0.77, 0.30])) * ((v - 0.45) / 0.55))
    glow = blur(ao, 18 * W / 1080)
    return a, ao, rgb, glow, (y0 + y1) / 2

WA, WO, WRGB, WGLOW, WY = make_wish()
WISH_T = 3.05

def ease(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)

W0, W1 = 0.25, 2.60     # writing window; bloom lands on the song hit at +2.8s
parts = []              # sparks: [x, y, vx, vy, life, born]
XN = (xx - ox) / lw     # normalized x across logo
proc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                         "-i", "-", "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", OUT],
                        stdin=subprocess.PIPE)
nf = int(DUR * FPS)
for f in range(nf):
    t = f / FPS
    p = ease((t - W0) / (W1 - W0)) * 1.04
    wipe = np.clip((p - XN) / 0.035, 0, 1)
    sig = FA_sig * wipe
    tag_t = ease((t - 2.45) / 0.7)
    shift = int((1 - tag_t) * 18 * H / 1920)
    tag = np.roll(FA_tag, shift, axis=0) * tag_t
    alpha = np.clip(sig + tag, 0, 1)
    # glow: builds with the writing, blooms at completion, settles warm
    bloom = 0.35 * ease((t - W0) / 1.0) + 0.9 * np.exp(-((t - 2.8) / 0.35) ** 2) + 0.25 * ease((t - 2.95) / 1.0)
    gl = (G1 * 0.9 + G2 * 1.4) * np.clip(wipe + tag_t * FA_tag.astype(bool), 0, 1) * bloom
    frame = bg + gl[..., None] * GLOW * 0.75
    # shine sweep
    band = np.exp(-(((xx - ox) + 0.5 * (yy - oy)) / lw - (ease((t - 3.0) / 0.9) * 1.6 - 0.3)) ** 2 / 0.004)
    logo_rgb = FC * (1 + 0.9 * band[..., None])
    frame = frame * (1 - alpha[..., None]) + np.clip(logo_rgb, 0, 1.4) * alpha[..., None]
    # Happy Diwali rises in after the bloom
    wt = ease((t - WISH_T) / 0.8)
    if wt > 0:
        sh = int((1 - wt) * 30 * H / 1920)
        a_w, a_o, g_w = (np.roll(x, sh, axis=0) * wt for x in (WA, WO, WGLOW))
        frame = frame + g_w[..., None] * GLOW * 0.55
        frame = frame * (1 - a_o[..., None]) + np.array([0.30, 0.08, 0.03]) * a_o[..., None]   # maroon outline
        frame = frame * (1 - a_w[..., None]) + np.roll(WRGB, sh, axis=0) * (1 + 0.6 * band[..., None]) * a_w[..., None]
    if WISH_T <= t < WISH_T + 1 / FPS * 4:   # spark burst as the wish appears
        for _ in range(35):
            ang = rng.uniform(0, 2 * np.pi); sp = rng.uniform(150, 520) * W / 1080
            parts.append([W / 2 + rng.uniform(-0.3, 0.3) * W, WY, np.cos(ang) * sp, np.sin(ang) * sp - 120, rng.uniform(0.5, 1.2), t])
    # pen tip + sparks while writing
    if W0 < t < W1 + 0.05:
        px = min(int(p / 1.04 * lw), lw - 1); cx, cy = ox + px, oy + cent[px]
        tip = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * (14 * W / 1080) ** 2)))
        frame += tip[..., None] * np.array([1.0, 0.85, 0.5]) * 0.9
        for _ in range(4):
            ang = rng.uniform(0, 2 * np.pi); sp = rng.uniform(60, 260) * W / 1080
            parts.append([cx, cy, np.cos(ang) * sp, np.sin(ang) * sp - 60, rng.uniform(0.4, 0.9), t])
    alive = []
    for q in parts:
        age = t - q[5]
        if age > q[4]: continue
        alive.append(q)
        x = q[0] + q[2] * age; y = q[1] + q[3] * age + 220 * age ** 2 * W / 1080
        ix, iy = int(x), int(y)
        if 3 <= ix < W - 3 and 3 <= iy < H - 3:
            k = (1 - age / q[4]) * 0.9
            frame[iy - 2:iy + 3, ix - 2:ix + 3] += np.array([1.0, 0.8, 0.45]) * k * np.array([[.2, .5, .7, .5, .2]]).T[:, :, None] * np.array([[.2, .5, .7, .5, .2]])[:, :, None] * 2
    parts = alive
    # fade from white-gold flash at the cut, fade to black at the very end
    flash = np.exp(-t / 0.12) * 0.8
    frame = frame * (1 - flash) + np.array([1.0, 0.92, 0.75]) * flash
    frame *= np.clip((DUR - t) / 0.6, 0, 1)
    proc.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())
proc.stdin.close(); proc.wait()
print("logo ok", OUT)
