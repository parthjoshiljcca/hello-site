"""Gold calligraphy title cards in the style of the "Hamari Prem Kahani" artwork:
light-gold brush script, a heart with a long flourish sweeping under the
names, and a lotus divider with arrow lines on either side."""
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

GOLD = (247, 220, 164)
EDGE = (150, 104, 48)


def _bezier(p0, p1, p2, p3, n=120):
    pts = []
    for i in range(n + 1):
        t = i / n
        a, b, c, d = (1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3
        pts.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
                    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return pts


def _stroke(draw, pts, width):
    draw.line(pts, fill=255, width=width, joint="curve")
    r = width / 2
    for x, y in (pts[0], pts[-1]):
        draw.ellipse([x - r, y - r, x + r, y + r], fill=255)


def _heart(cx, cy, size, n=200):
    pts = []
    for i in range(n + 1):
        t = 2 * math.pi * i / n
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((cx + x * size / 32, cy + y * size / 32))
    return pts


def _petal_poly(cx, cy, lean, height, half_w, n=60):
    """Closed petal outline rooted at (cx, cy), leaning by `lean` radians."""
    tip = (cx + height * math.sin(lean), cy - height * math.cos(lean))
    nx, ny = math.cos(lean), math.sin(lean)
    mid = (cx + 0.45 * height * math.sin(lean), cy - 0.45 * height * math.cos(lean))
    sides = []
    for side in (-1, 1):
        c1 = (cx + side * half_w * 1.1 * nx, cy + side * half_w * 1.1 * ny)
        c2 = (mid[0] + side * half_w * 1.25 * nx, mid[1] + side * half_w * 1.25 * ny)
        sides.append(_bezier((cx, cy), c1, c2, tip, n))
    return sides[0] + sides[1][::-1]


def _lotus(img, cx, cy, s, width):
    """Lotus in the artwork's style: the outer silhouette of five petals plus
    the inner outline of the centre petal (no crossing strokes)."""
    W, H = img.size
    petals = [(0.0, 0.78, 0.30), (-0.78, 0.72, 0.27), (0.78, 0.72, 0.27),
              (-1.32, 0.6, 0.21), (1.32, 0.6, 0.21)]
    fill = Image.new("L", (W, H), 0)
    fd = ImageDraw.Draw(fill)
    for lean, hgt, hw in petals:
        fd.polygon(_petal_poly(cx, cy, lean, hgt * s, hw * s), fill=255)
    # base cup
    cup = _bezier((cx - 0.85 * s, cy - 0.1 * s), (cx - 0.45 * s, cy + 0.22 * s),
                  (cx + 0.45 * s, cy + 0.22 * s), (cx + 0.85 * s, cy - 0.1 * s), 60)
    fd.polygon(cup, fill=255)
    k = max(3, (width // 2) * 2 + 1)
    outline = Image.eval(fill, lambda v: v)
    inner = fill.filter(ImageFilter.MinFilter(k))
    ring = Image.eval(Image.merge("L", [outline]), lambda v: v)
    ring = Image.composite(Image.new("L", (W, H), 0), outline, inner)  # outline minus interior
    img.paste(255, (0, 0), ring)
    d = ImageDraw.Draw(img)
    # inner strokes: the centre petal and the two inner side petals
    for lean, hgt, hw in petals[:3]:
        pts = _petal_poly(cx, cy, lean, hgt * s * 0.97, hw * s * 0.95)
        _stroke(d, pts, max(2, width - 1))


def lotus_divider(draw, cx, cy, s, half_len, width):
    img = draw._image
    base_y = cy + 0.6 * s
    _lotus(img, cx, base_y, s, width)
    ly = base_y - 0.12 * s          # lines meet the lotus near its base
    gap = 1.12 * s
    lwid = max(2, width - 1)
    ah = 0.16 * s
    for side in (-1, 1):
        x0 = cx + side * gap
        x1 = cx + side * half_len
        draw.line([(x0, ly), (x1, ly)], fill=255, width=lwid)
        # outer arrow tip points outwards; inner end has an arrow pointing at the lotus
        for xe, d in ((x1, side), (x0, -side)):
            draw.line([(xe, ly), (xe - d * ah, ly - ah * 0.6)], fill=255, width=lwid)
            draw.line([(xe, ly), (xe - d * ah, ly + ah * 0.6)], fill=255, width=lwid)


def _finish(mask, pad):
    """Gold fill with a thin warm edge and a soft shadow, cropped to content."""
    w, h = mask.size
    edge = mask.filter(ImageFilter.MaxFilter(3))
    shadow = mask.filter(ImageFilter.GaussianBlur(8))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sh = Image.new("RGBA", (w, h), (20, 10, 0, 0)); sh.putalpha(shadow.point(lambda v: int(v * 0.55)))
    ed = Image.new("RGBA", (w, h), EDGE + (0,)); ed.putalpha(edge)
    fill = Image.new("RGBA", (w, h), GOLD + (0,)); fill.putalpha(mask)
    for layer in (sh, ed, fill):
        out = Image.alpha_composite(out, layer)
    bb = out.getbbox()
    return out.crop((max(bb[0] - pad, 0), max(bb[1] - pad, 0), min(bb[2] + pad, w), min(bb[3] + pad, h)))


def names_title(font_path, s, text="Ravi & Sakshi"):
    """Names with the heart flourish and the lotus divider (s = scale, 1.0 for 1080p)."""
    font = ImageFont.truetype(font_path, int(165 * s))
    bold = max(1, int(2.2 * s))
    tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    l, t, r, b = tmp.textbbox((0, 0), text, font=font, stroke_width=bold)
    tw, th = r - l, b - t
    heart = int(120 * s)
    W = tw + heart * 2 + int(160 * s)
    H = th + int(250 * s)
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    tx = heart + int(110 * s)
    ty = int(40 * s)
    d.text((tx - l, ty - t), text, font=font, fill=255, stroke_width=bold, stroke_fill=255)
    lw = max(3, int(7 * s))
    # heart to the left, sitting at the middle of the names
    hx, hy = int(heart * 0.62), ty + int(th * 0.48)
    _stroke(d, _heart(hx, hy, heart), lw)
    # flourish: from the heart's bottom point, dips under the names and ends in a curl
    hb = (hx, hy + heart * 0.52)
    end = (tx + tw + int(55 * s), ty + th + int(18 * s))
    _stroke(d, _bezier(hb, (hb[0] + int(40 * s), hb[1] + int(70 * s)),
                       (tx + tw * 0.45, ty + th + int(60 * s)), end, 220), lw)
    curl = _bezier(end, (end[0] + int(42 * s), end[1] - int(10 * s)),
                   (end[0] + int(46 * s), end[1] - int(70 * s)), (end[0] + int(8 * s), end[1] - int(78 * s)), 80)
    _stroke(d, curl, max(2, lw - 1))
    # lotus divider
    lotus_divider(d, tx + tw // 2, ty + th + int(62 * s), int(88 * s), int(tw * 0.42), max(2, int(4 * s)))
    return _finish(mask, int(30 * s))


def credit_card(font_path, W, H, s, lines=("A Film By", "Parth D. Joshi")):
    """Black-card credit: small line, big name, lotus divider beneath."""
    small = ImageFont.truetype(font_path, int(64 * s))
    big = ImageFont.truetype(font_path, int(132 * s))
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    bold = max(1, int(1.8 * s))
    def size(txt, f):
        l, t, r, b = d.textbbox((0, 0), txt, font=f, stroke_width=bold)
        return l, t, r - l, b - t
    l1, t1, w1, h1 = size(lines[0], small)
    l2, t2, w2, h2 = size(lines[1], big)
    total = h1 + int(18 * s) + h2 + int(160 * s)
    y = (H - total) // 2
    d.text(((W - w1) // 2 - l1, y - t1), lines[0], font=small, fill=255, stroke_width=bold, stroke_fill=255)
    y += h1 + int(18 * s)
    d.text(((W - w2) // 2 - l2, y - t2), lines[1], font=big, fill=255, stroke_width=bold, stroke_fill=255)
    y += h2 + int(40 * s)
    lotus_divider(d, W // 2, y, int(80 * s), int(w2 * 0.45), max(2, int(3.8 * s)))
    out = _finish(mask, 0)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bb = out.size
    # _finish crops; put it back centred
    full = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    full.alpha_composite(out, ((W - bb[0]) // 2, (H - bb[1]) // 2))
    return full
