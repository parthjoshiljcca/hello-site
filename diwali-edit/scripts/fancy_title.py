"""Fancy ॥ दिवाली ॥ title: gold gradient fill, dark-maroon outline, warm glow, soft shadow.
Usage: python3 -I fancy_title.py <font.ttf> <size> <out.png>"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

font, size, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
TEXT = "॥ दिवाली ॥"
fnt = ImageFont.truetype(font, size, layout_engine=ImageFont.Layout.RAQM)
pad = int(size * 0.6)
tmp = ImageDraw.Draw(Image.new("L", (10, 10)))
bb = tmp.textbbox((0, 0), TEXT, font=fnt, stroke_width=int(size * 0.05))
w, h = bb[2] - bb[0] + 2 * pad, bb[3] - bb[1] + 2 * pad
org = (pad - bb[0], pad - bb[1])
sw = max(2, int(size * 0.045))

def mask(stroke=0):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).text(org, TEXT, font=fnt, fill=255, stroke_width=stroke, stroke_fill=255)
    return m

fill_m, stroke_m = mask(0), mask(sw)
# vertical gold gradient: cream highlight -> rich gold -> deep amber, with a bright band
y = np.linspace(0, 1, h)[:, None]
top, mid, bot = np.array([255, 236, 160]), np.array([250, 196, 70]), np.array([200, 118, 24])
g = np.where(y < 0.5, top + (mid - top) * (y / 0.5)[..., None][:, :, 0:1].squeeze(-1)[..., None] if False else 0, 0)
grad = np.zeros((h, w, 3), np.float32)
t = np.repeat(y, w, 1)
lo = t < 0.48
grad[lo] = (top + (mid - top) * (t[lo] / 0.48)[:, None])
grad[~lo] = (mid + (bot - mid) * ((t[~lo] - 0.48) / 0.52)[:, None])
grad += (np.exp(-((t - 0.42) / 0.05) ** 2) * 18)[..., None]  # specular band
grad = np.clip(grad, 0, 255).astype(np.uint8)

layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
# soft drop shadow
sh = Image.new("RGBA", (w, h), (40, 12, 0, 0)); sh.putalpha(stroke_m.filter(ImageFilter.GaussianBlur(size * 0.06)).point(lambda v: int(v * 0.75)))
layer.alpha_composite(sh, (0, int(size * 0.04)))
# warm outer glow
gl = Image.new("RGBA", (w, h), (255, 170, 60, 0)); gl.putalpha(stroke_m.filter(ImageFilter.GaussianBlur(size * 0.14)).point(lambda v: int(v * 0.55)))
layer.alpha_composite(gl)
# maroon outline
ol = Image.new("RGBA", (w, h), (92, 24, 10, 255)); ol.putalpha(stroke_m)
layer.alpha_composite(ol)
# gradient fill
gf = Image.fromarray(grad, "RGB").convert("RGBA"); gf.putalpha(fill_m)
layer.alpha_composite(gf)
layer.crop(layer.getbbox()).save(out)
print(out, layer.getbbox())
