# Prepares the cover art for print and swaps "WRITTEN BY" for "A BOOK BY" in the two places it is
# drawn into the artwork: the front cover art and the gold author logo used on the back cover.
#   cover/front-art.png (1024x1536 source) -> cover/front-art-300dpi.jpg (front panel with bleed, 300 dpi)
#   ../roopkund/assets/author-logo.png      -> cover/author-logo.png
#
#   python3 prepare_art.py
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

DIR = os.path.dirname(os.path.abspath(__file__))
CINZEL = os.path.join(DIR, 'fonts', 'Cinzel-400.ttf')
LABEL = 'A BOOK BY'


def erase(img, x0, y0, x1, y1, seed=1):
    """Fill a box with what surrounds it: per column, blend the rows just above into the rows just below."""
    a = np.asarray(img).astype(float)
    top = a[y0 - 4:y0].mean(0)[x0:x1]
    bot = a[y1:y1 + 4].mean(0)[x0:x1]
    k = np.linspace(0, 1, y1 - y0)[:, None, None]
    fill = top[None] * (1 - k) + bot[None] * k
    fill += np.random.default_rng(seed).normal(0, 1.6, fill.shape)   # keep the art's fine grain
    a[y0:y1, x0:x1] = fill
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def tracked(draw, cx, cy, text, font, track, fill):
    """Text centred on (cx, cy) with extra letter spacing; returns its width."""
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + track * (len(text) - 1)
    x, top = cx - total / 2, cy - font.getbbox('A')[3] / 2 - font.getbbox('A')[1] / 2
    for ch, w in zip(text, widths):
        draw.text((x, top), ch, font=font, fill=fill)
        x += w + track
    return total


# ---- front: erase "WRITTEN BY", trim the mock-up bevel, upscale to 300 dpi, letter "A BOOK BY" sharply
src = Image.open(os.path.join(DIR, 'cover', 'front-art.png')).convert('RGB')
src = erase(src, 400, 1262, 628, 1295)
art = src.crop((50, 0, 1024 - 20, 1536))
H = round(8.25 * 300)
s = H / art.height
art = art.resize((round(art.width * s), H), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
d = ImageDraw.Draw(art)
font = ImageFont.truetype(CINZEL, round(26 * s))
tracked(d, (513 - 50) * s, 1278.5 * s, LABEL, font, track=round(6.5 * s), fill=(236, 232, 224))
art.save(os.path.join(DIR, 'cover', 'front-art-300dpi.jpg'), quality=95, subsampling=0, dpi=(300, 300))

# ---- back: the author logo, "WRITTEN BY" between its two little stars replaced in a silver gradient
logo = Image.open(os.path.join(DIR, '..', 'roopkund', 'assets', 'author-logo.png')).convert('RGB')
ImageDraw.Draw(logo).rectangle((760, 262, 1425, 338), fill=(0, 0, 0))
mask = Image.new('L', logo.size, 0)
tracked(ImageDraw.Draw(mask), 1090, 300, LABEL, ImageFont.truetype(CINZEL, 58), track=24, fill=255)
grad = np.linspace(255, 175, logo.height)[:, None, None] * np.ones((1, logo.width, 3))
logo.paste(Image.fromarray(grad.astype(np.uint8)), (0, 0), mask)
logo.save(os.path.join(DIR, 'cover', 'author-logo.png'))
print('front-art-300dpi.jpg', art.size, '· author-logo.png', logo.size)
