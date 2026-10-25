"""Render gold title-card text and prepare logo/cover assets for the reel."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

UP = "/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gfx")
os.makedirs(OUT, exist_ok=True)

SERIF = "/usr/share/fonts/truetype/crosextra/Caladea-Regular.ttf"
SERIF_B = "/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf"
SANS = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
W = 1080


def text_width(font, s, track):
    return sum(font.getlength(c) for c in s) + track * (len(s) - 1)


def draw_tracked(draw, xy, s, font, track, fill):
    x, y = xy
    for c in s:
        draw.text((x, y), c, font=font, fill=fill)
        x += font.getlength(c) + track


def gold_lines(name, lines, max_w=980, glow=10, pad=40, line_gap=18):
    """lines: list of (text, font_path, size, tracking, style) ; style 'gold'|'pale'|'white'."""
    fitted = []
    for text, fp, size, track, style in lines:
        font = ImageFont.truetype(fp, size)
        while text_width(font, text, track) > max_w and size > 12:
            size -= 1
            track = max(1, track * 0.97)
            font = ImageFont.truetype(fp, size)
        fitted.append((text, font, track, style))
    heights = [f.getbbox("HXgy")[3] for _, f, _, _ in fitted]
    H = sum(heights) + line_gap * (len(fitted) - 1) + 2 * pad
    mask_layers = []
    y = pad
    for (text, font, track, style), h in zip(fitted, heights):
        m = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(m)
        x = (W - text_width(font, text, track)) / 2
        draw_tracked(d, (x, y), text, font, track, 255)
        mask_layers.append((m, style, y, h))
        y += h + line_gap

    rgb = np.zeros((H, W, 3), float)
    alpha = np.zeros((H, W), float)
    # soft warm glow behind everything
    allmask = np.zeros((H, W), float)
    for m, _, _, _ in mask_layers:
        allmask = np.maximum(allmask, np.asarray(m, float) / 255)
    g = np.asarray(Image.fromarray((allmask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(glow)), float) / 255
    glow_col = np.array([255, 170, 60], float)
    ga = np.clip(g * 0.55, 0, 1)
    rgb = glow_col * ga[..., None]
    alpha = ga.copy()
    # drop shadow for legibility
    sh = np.asarray(Image.fromarray((allmask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), float) / 255
    sh = np.roll(sh, (3, 2), (0, 1)) * 0.8
    rgb = rgb * (1 - sh[..., None])
    alpha = alpha + sh * (1 - alpha)
    for m, style, y0, h in mask_layers:
        a = np.asarray(m, float) / 255
        yy = np.clip((np.arange(H) - y0) / max(h, 1), 0, 1)[:, None]
        if style == "gold":
            top, mid, bot = np.array([255, 246, 205.]), np.array([238, 190, 92.]), np.array([176, 120, 38.])
        elif style == "pale":
            top, mid, bot = np.array([255, 250, 235.]), np.array([240, 222, 180.]), np.array([205, 175, 120.])
        else:
            top, mid, bot = np.array([255, 255, 255.]), np.array([238, 238, 238.]), np.array([210, 210, 210.])
        col = np.where(yy[..., None] < 0.5,
                       top + (mid - top) * (yy[..., None] / 0.5),
                       mid + (bot - mid) * ((yy[..., None] - 0.5) / 0.5))
        col = np.broadcast_to(col, (H, W, 3))
        rgb = rgb * (1 - a[..., None]) + col * a[..., None]
        alpha = alpha + a * (1 - alpha)
    out = np.dstack([np.clip(rgb / np.maximum(alpha[..., None], 1e-6), 0, 255), alpha * 255]).astype(np.uint8)
    # rgb above is premultiplied-ish; store straight alpha
    Image.fromarray(out, "RGBA").save(os.path.join(OUT, name + ".png"))


gold_lines("hook1", [("THEY SAY ON KHAIT PARVAT...", SERIF, 62, 6, "pale")], max_w=1000)
gold_lines("hook2", [("THE ACHHARIS", SERIF_B, 74, 8, "gold"), ("ARE STILL LISTENING", SERIF_B, 74, 8, "gold")], max_w=1000)
gold_lines("chapter", [
    ("A LEGEND FROM HIDDEN UTTARAKHAND", SERIF, 34, 7, "pale"),
    ("JEETU", SERIF_B, 150, 14, "gold"),
    ("BAGADWAL", SERIF_B, 150, 14, "gold"),
    ("THE SECRETS OF THE ACHHARIS", SERIF, 42, 6, "pale"),
    ("OF KHAIT PARVAT", SERIF, 42, 6, "pale"),
], line_gap=22, glow=16, max_w=1000)
gold_lines("c1", [("HIS FLUTE CALLED", SERIF_B, 78, 6, "gold"), ("THE ACHHARIS", SERIF_B, 78, 6, "gold")], max_w=1000)
gold_lines("c2", [("THEY CAME UNDER", SERIF_B, 78, 6, "gold"), ("THE FULL MOON", SERIF_B, 78, 6, "gold")], max_w=1000)
gold_lines("c3", [("AND THE MOUNTAIN", SERIF_B, 78, 6, "gold"), ("NEVER LET HIM GO", SERIF_B, 78, 6, "gold")], max_w=1000)
gold_lines("c4", [("FIFTEEN LEGENDS.", SERIF_B, 80, 6, "gold"), ("ONE BOOK.", SERIF_B, 80, 6, "gold")], max_w=1000)
gold_lines("end_top", [("THE LEGEND AWAITS", SERIF, 56, 12, "pale")], max_w=1000)
gold_lines("end_cta", [("READ IT NOW", SERIF_B, 72, 12, "gold"),
                       ("parthjoshiljcca.github.io/hidden-uttrakhand", SANS, 38, 1, "white")], line_gap=14, max_w=1010)

# author credit: black background -> alpha from brightness
a = np.asarray(Image.open(f"{UP}/9bae2a82-image.png").convert("RGB"), float)
al = a.max(2)
al = np.clip((al - 12) / (255 - 12), 0, 1)
rgb = np.clip(a / np.maximum(al[..., None], 1e-3), 0, 255)
Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), "RGBA").save(os.path.join(OUT, "author.png"))

Image.open(f"{UP}/68465784-image.png").convert("RGBA").save(os.path.join(OUT, "title.png"))
Image.open(f"{UP}/263ea9ce-image.png").convert("RGB").save(os.path.join(OUT, "cover.png"))
print("ok")
