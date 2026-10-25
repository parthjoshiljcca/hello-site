"""Cover card assets: sized cover, golden glow layer, sweep-free base."""
import os
import numpy as np
from PIL import Image, ImageFilter

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gfx")
CW, CH = 760, 1140          # cover size on the end card
CX, CY = 540, 880           # cover centre on the 1080x1920 frame

cover = Image.open(os.path.join(D, "cover.png")).convert("RGB").resize((CW, CH), Image.LANCZOS)
cover.save(os.path.join(D, "cover_card.png"))

# warm glow + soft shadow halo behind the book
m = Image.new("L", (1080, 1920), 0)
m.paste(255, (CX - CW // 2, CY - CH // 2, CX + CW // 2, CY + CH // 2))
g1 = np.asarray(m.filter(ImageFilter.GaussianBlur(60)), float) / 255
g2 = np.asarray(m.filter(ImageFilter.GaussianBlur(18)), float) / 255
a = np.clip(g1 * 0.75 + g2 * 0.35, 0, 1)
rgb = np.zeros((1920, 1080, 3)) + np.array([255, 168, 60.])
Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), "RGBA").save(os.path.join(D, "cover_glow.png"))
print("ok")
