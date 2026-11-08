"""Text PNGs (PIL+raqm for proper Devanagari shaping) and the film-burn / iris overlay for the intro."""
import numpy as np, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = sys.argv[1]
W, H = 1080, 1920
F = f"{S}/fonts"

def text_png(path, lines, font, size, fill, shadow=None, extrude=0, extrude_col=None, glow=0, gap=1.08):
    fnt = ImageFont.truetype(font, size, layout_engine=ImageFont.Layout.RAQM)
    canvas = Image.new("RGBA", (W, 600), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    y = 60
    boxes = []
    for ln in lines:
        bb = d.textbbox((0, 0), ln, font=fnt)
        boxes.append((ln, (W - (bb[2] - bb[0])) / 2 - bb[0], y - bb[1], bb))
        y += (bb[3] - bb[1]) * gap + size * 0.12
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    if glow:
        g = Image.new("RGBA", canvas.size, (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
        for ln, x, yy, _ in boxes: gd.text((x, yy + 4), ln, font=fnt, fill=(0, 0, 0, 170))
        layer = Image.alpha_composite(layer, g.filter(ImageFilter.GaussianBlur(glow)))
    ld = ImageDraw.Draw(layer)
    for k in range(extrude, 0, -1):  # chunky 3D drop like the reference title
        for ln, x, yy, _ in boxes: ld.text((x + k, yy + k), ln, font=fnt, fill=extrude_col)
    for ln, x, yy, _ in boxes: ld.text((x, yy), ln, font=fnt, fill=fill)
    bbox = layer.getbbox()
    layer.crop((0, bbox[1] - 20, W, bbox[3] + 20)).save(path)

text_png(f"{S}/t_finally.png", ["IT'S FINALLY", "THAT TIME OF THE YEAR"], f"{F}/LuckiestGuy-Regular.ttf", 52,
         (255, 210, 26, 255), extrude=5, extrude_col=(176, 72, 8, 255), glow=10, gap=1.0)
text_png(f"{S}/t_diwali.png", ["॥ दिवाली ॥"], f"{F}/Mukta-ExtraBold.ttf", 92, (255, 255, 255, 255), glow=12)
text_png(f"{S}/t_brand.png", ["SpArsh · Divine Art Studio"], f"{F}/Cinzel.ttf", 26, (255, 236, 200, 220), glow=6)

# ---------- film burn + iris overlay (0 - 3.1 s @ 30 fps), rendered small then upscaled ----------
fps, dur = 30, 3.1
w, h = 270, 480
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
xn, yn = xx / w, yy / h * (h / w)  # square units
rng = np.random.default_rng(3)

def burn_amount(t):
    """How 'burned' the frame is - peaks match the reference's flicker transitions."""
    def bump(c, a, rise, fall):
        return np.where(t < c, np.exp(-((c - t) / rise) ** 2), np.exp(-((t - c) / fall) ** 2)) * a
    return np.clip(bump(0.15, 1.0, 0.2, 0.55) + bump(0.86, 0.55, 0.06, 0.12) + bump(2.12, 0.9, 0.05, 0.12)
                   + bump(2.36, 0.6, 0.04, 0.1) + bump(2.88, 0.85, 0.05, 0.08), 0, 1)

def iris_radius(t):
    # circle opens through each burn
    if t < 0.9: return 0.18 + 0.75 * (t / 0.9) ** 2
    if 2.0 < t < 2.5: return 0.22 + 1.2 * ((t - 2.0) / 0.5) ** 2
    if 2.75 < t < 3.1: return 0.25 + 1.4 * ((t - 2.75) / 0.35) ** 2
    return 2.0

blobs = [dict(c=np.array(rng.uniform(0, 1, 2)) * [1, h / w], v=rng.uniform(-0.25, 0.25, 2), r=rng.uniform(0.25, 0.6),
              col=np.array(col)) for col in [(255, 120, 40), (235, 60, 30), (255, 214, 170), (255, 180, 120), (120, 40, 20)]]
proc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}",
                         "-r", str(fps), "-i", "-", "-vf", f"scale={W}:{H}:flags=bicubic,gblur=sigma=6",
                         "-c:v", "png", "-pix_fmt", "rgba", f"{S}/burn.mov"], stdin=subprocess.PIPE)
cx, cy = 0.5, 0.42 * h / w
for f in range(int(dur * fps)):
    t = f / fps
    b = float(burn_amount(t))
    col = np.zeros((h, w, 3), np.float32) + np.array([245, 205, 180], np.float32)
    for bl in blobs:
        c = bl["c"] + bl["v"] * t * 3
        d2 = (xn - c[0]) ** 2 + (yn - c[1]) ** 2
        a = np.exp(-d2 / bl["r"] ** 2)[..., None]
        col = col * (1 - a * 0.85) + bl["col"] * a * 0.85
    r = iris_radius(t)
    dist = np.sqrt((xn - cx) ** 2 + (yn - cy) ** 2)
    outside = np.clip((dist - r) / 0.03, 0, 1)
    leak = 0.25 + 0.2 * np.sin(xn * 6 + t * 9) * np.sin(yn * 4 - t * 7)
    alpha = b * (outside * 0.93 + (1 - outside) * leak)
    # flicker
    alpha *= 0.9 + 0.1 * rng.random()
    out = np.dstack([np.clip(col, 0, 255), np.clip(alpha * 255, 0, 255)]).astype(np.uint8)
    proc.stdin.write(out.tobytes())
proc.stdin.close(); proc.wait()
print("assets ok")
