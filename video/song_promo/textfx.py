"""Gold kinetic-type sprites (tight RGBA numpy arrays, straight alpha)."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SERIF = "/usr/share/fonts/truetype/crosextra/Caladea-Regular.ttf"
SERIF_B = "/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf"

PALETTES = {
    "gold": ([255, 247, 210], [240, 192, 92], [170, 112, 32]),
    "pale": ([255, 252, 240], [242, 226, 188], [206, 176, 120]),
    "white": ([255, 255, 255], [240, 240, 240], [205, 205, 205]),
}


def word(text, size, bold=True, track=6, style="gold", glow=None):
    font = ImageFont.truetype(SERIF_B if bold else SERIF, size)
    glow = glow if glow is not None else max(6, size // 7)
    w = int(sum(font.getlength(c) for c in text) + track * (len(text) - 1))
    asc, desc = font.getmetrics()
    pad = glow * 3
    W, H = w + 2 * pad, asc + desc + 2 * pad
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    x = pad
    for c in text:
        d.text((x, pad), c, font=font, fill=255)
        x += font.getlength(c) + track
    a = np.asarray(m, np.float32) / 255
    g = np.asarray(m.filter(ImageFilter.GaussianBlur(glow)), np.float32) / 255
    sh = np.asarray(m.filter(ImageFilter.GaussianBlur(4)), np.float32) / 255
    sh = np.roll(sh, (4, 3), (0, 1)) * 0.85
    top, mid, bot = (np.array(c, np.float32) for c in PALETTES[style])
    yy = np.clip((np.arange(H) - pad - asc * 0.15) / (asc * 0.95), 0, 1)[:, None, None]
    col = np.where(yy < 0.5, top + (mid - top) * (yy / 0.5), mid + (bot - mid) * ((yy - 0.5) / 0.5))
    col = np.broadcast_to(col, (H, W, 3))
    ga = np.clip(g * 0.7, 0, 1)
    rgb = np.broadcast_to(np.array([255, 160, 50], np.float32), (H, W, 3)) * 1.0
    alpha = ga
    rgb = rgb * (1 - sh[..., None])
    alpha = alpha + sh * (1 - alpha)
    rgb = rgb * (1 - a[..., None]) + col * a[..., None]
    alpha = alpha + a * (1 - alpha)
    return np.dstack([rgb, alpha * 255]).astype(np.uint8)


def to_img(arr):
    return Image.fromarray(arr, "RGBA")
