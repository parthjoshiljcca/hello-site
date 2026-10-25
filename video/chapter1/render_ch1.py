"""Chapter One trailer - 'Room Locked, Lady Dead, Professor Hungry' (30s, 1080x1920).

Fully procedural motion graphics (no chapter-1 footage exists): 1911 clipping, chapter
title slam, dossier cards, 2:14 a.m. corridor, CLANG + Golu's LIVE feed, the swapped
notebook, the note from R., end card. Music: 'Bagadwal Ki Bansuri' intro 2.5s -> 32.5s
(its near-silent gap 15.5-18.3 carries the corridor whisper; the spoons fall when the
music returns at 18.5).
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import textfx

UP = "/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650"
SRC = f"{UP}/3da759ef-VID-20261025-WA0001.mp4"
D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "chapter1.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 900
W, H, FPS = 1080, 1920, 30
A0 = 2.5

F_SERIF = "/usr/share/fonts/truetype/crosextra/Caladea-Regular.ttf"
F_SERIF_B = "/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf"
F_HAND = "/usr/share/fonts/truetype/crosextra/Caladea-Italic.ttf"
F_HAND_B = "/usr/share/fonts/truetype/crosextra/Caladea-BoldItalic.ttf"
F_MONO = "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf"
F_MONO_B = "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"
F_UI = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
F_UI_R = "/usr/share/fonts/opentype/inter/Inter-Regular.otf"
F_UI_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
F_SYM = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# scene boundaries (s)
S_CLIP, S_TITLE, S_CAST, S_CORR, S_CLANG, S_BOOK, S_NOTE, S_END = 0.0, 5.9, 8.4, 12.8, 16.0, 19.8, 24.4, 27.4

rng = np.random.default_rng(5)


# ---------------------------------------------------------------- utilities
def font(path, size):
    return ImageFont.truetype(path, size)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def plain(text, path, size, color=(255, 255, 255), track=0, shadow=True, glow=0, glow_col=(255, 160, 50)):
    f = font(path, size)
    w = int(sum(f.getlength(c) for c in text) + track * max(len(text) - 1, 0)) + 2
    asc, desc = f.getmetrics()
    pad = max(8, glow * 3)
    im = Image.new("L", (w + 2 * pad, asc + desc + 2 * pad), 0)
    d = ImageDraw.Draw(im)
    x = pad
    for c in text:
        d.text((x, pad), c, font=f, fill=255)
        x += f.getlength(c) + track
    a = np.asarray(im, np.float32) / 255
    rgb = np.zeros(a.shape + (3,), np.float32)
    al = np.zeros_like(a)
    if glow:
        g = np.asarray(im.filter(ImageFilter.GaussianBlur(glow)), np.float32) / 255 * 0.7
        rgb = np.broadcast_to(np.array(glow_col, np.float32), rgb.shape).copy()
        al = g
    if shadow:
        sh = np.roll(np.asarray(im.filter(ImageFilter.GaussianBlur(3)), np.float32) / 255, (3, 2), (0, 1)) * 0.8
        rgb = rgb * (1 - sh[..., None]); al = al + sh * (1 - al)
    rgb = rgb * (1 - a[..., None]) + np.array(color, np.float32) * a[..., None]
    al = al + a * (1 - al)
    return np.dstack([rgb, al * 255]).astype(np.uint8)


def resize(spr, scale):
    h0, w0 = spr.shape[:2]
    return np.asarray(Image.fromarray(spr, "RGBA").resize((max(1, int(w0 * scale)), max(1, int(h0 * scale))), Image.BILINEAR))


def blit(frame, spr, cx, cy, alpha=1.0, scale=1.0, anchor="c"):
    if alpha <= 0.003:
        return
    if abs(scale - 1) > 1e-3:
        spr = resize(spr, scale)
    h, w = spr.shape[:2]
    x0 = int(round(cx - w / 2)) if anchor == "c" else int(round(cx))
    y0 = int(round(cy - h / 2))
    xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + w, W), min(y0 + h, H)
    if xa >= xb or ya >= yb:
        return
    s = spr[ya - y0:yb - y0, xa - x0:xb - x0].astype(np.float32)
    a = s[..., 3:4] / 255 * alpha
    reg = frame[ya:yb, xa:xb]
    reg *= (1 - a)
    reg += s[..., :3] * a


def zoomed(img, z, cx=0.5, cy=0.5, shake=(0, 0)):
    """Crop-zoom a W x H float/uint8 array around (cx, cy) fractions."""
    h, w = img.shape[:2]
    cw, ch = w / z, h / z
    x0 = min(max(cx * w - cw / 2 + shake[0], 0), w - cw)
    y0 = min(max(cy * h - ch / 2 + shake[1], 0), h - ch)
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    return np.asarray(im.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch)), np.float32)


def gold(text, size, style="gold", bold=True, track=None):
    return textfx.word(text, size, bold=bold, style=style, track=track if track is not None else max(3, size // 12))


def vignette(strength=0.75, power=2.2):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
    return (1 - strength * np.clip(r, 0, 1) ** power)[..., None]


VIG = vignette()


# ---------------------------------------------------------------- scene 1: 1911 clipping on a desk
def desk_bg():
    base = np.zeros((H, W, 3), np.float32) + np.array([38, 24, 16], np.float32)
    streak = rng.normal(0, 1, (1, W)).repeat(H, 0)
    streak = np.asarray(Image.fromarray(((streak + 3) * 40).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur((0.5, 30))), np.float32) / 255
    base *= (0.75 + 0.5 * streak[..., None])
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    lamp = np.exp(-(((xx - 260) / 700) ** 2 + ((yy - 300) / 900) ** 2) * 1.6)[..., None]
    base = base * (0.35 + 1.4 * lamp) + lamp * np.array([70, 40, 10], np.float32)
    return base * VIG


def clipping():
    cw, ch = 900, 1180
    paper = np.zeros((ch, cw, 3), np.float32) + np.array([224, 210, 178], np.float32)
    paper += rng.normal(0, 7, (ch, cw, 1))
    blot = np.asarray(Image.fromarray(rng.integers(0, 255, (ch // 30, cw // 30), dtype=np.uint8)).resize((cw, ch), Image.BICUBIC), np.float32) / 255
    paper *= (0.9 + 0.12 * blot[..., None])
    yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
    edge = np.clip(np.minimum.reduce([xx, yy, cw - xx, ch - yy]) / 70, 0, 1)
    paper *= (0.72 + 0.28 * edge[..., None])
    paper[:, cw // 2 - 1:cw // 2 + 1] *= 0.9                     # fold
    im = Image.fromarray(paper.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    ink = (34, 26, 20)
    d.text((cw / 2, 70), "MUSSOORIE, SEPTEMBER 1911", font=font(F_SERIF, 30), fill=ink, anchor="mm")
    d.line((60, 100, cw - 60, 100), fill=ink, width=2); d.line((60, 106, cw - 60, 106), fill=ink, width=1)
    d.text((cw / 2, 190), "TRAGEDY AT", font=font(F_SERIF_B, 92), fill=ink, anchor="mm")
    d.text((cw / 2, 290), "THE SAVOY", font=font(F_SERIF_B, 110), fill=ink, anchor="mm")
    d.text((cw / 2, 380), "Lady Found Dead in a Room Locked from the Inside", font=font(F_HAND, 32), fill=ink, anchor="mm")
    d.line((60, 420, cw - 60, 420), fill=ink, width=1)
    body = [
        "Miss Frances Garnett-Orme, aged 49, a",
        "lady of spiritualist interests, was found",
        "dead in her bed on the morning of the",
        "19th. Her door was locked from the",
        "inside. Her companion, Miss Eva",
        "Mountstephen, was away in Lucknow.",
        "The post-mortem discloses prussic acid.",
        "",
        "Miss Mountstephen, tried for murder, has",
        "been acquitted. The learned judge",
        "observed that the truth would probably",
        "never be known.",
    ]
    f = font(F_SERIF, 34)
    y = 465
    for ln in body:
        d.text((90, y), ln, font=f, fill=ink); y += 46
    d.line((60, y + 20, cw - 60, y + 20), fill=ink, width=1)
    d.text((cw / 2, y + 70), "—  ROOM 112  —", font=font(F_SERIF, 30), fill=(120, 30, 24), anchor="mm")
    arr = np.asarray(im, np.float32)
    rgba = np.dstack([arr, np.full((ch, cw), 255, np.float32)]).astype(np.uint8)
    pim = Image.fromarray(rgba, "RGBA").rotate(-3.2, resample=Image.BICUBIC, expand=True)
    return np.asarray(pim)


DESK = desk_bg()
CLIP = clipping()
S1_TEXT = [(plain("19 SEPTEMBER 1911", F_MONO_B, 40, (240, 228, 200), track=6), 0.25),
           (gold("THE DOOR WAS LOCKED", 70, style="pale"), 1.3),
           (gold("FROM INSIDE.", 84), 1.75),
           (gold("THE TRUTH WAS", 70, style="pale"), 3.4),
           (gold("NEVER KNOWN.", 84), 3.85)]


def scene_clip(t):
    u = t - S_CLIP
    fr = DESK.copy()
    shadow = np.zeros((H, W), np.float32)
    k = ease_out(u / 1.2)
    sc = 0.92 + 0.08 * k + 0.02 * u
    cy = 1010 - 40 * (1 - k)
    sp = resize(CLIP, sc)
    a = sp[..., 3].astype(np.float32) / 255
    sh = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(25)), np.float32) / 255
    h, w = sp.shape[:2]
    x0, y0 = int(540 - w / 2) + 24, int(cy - h / 2) + 30
    xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + w, W), min(y0 + h, H)
    fr[ya:yb, xa:xb] *= (1 - 0.7 * sh[ya - y0:yb - y0, xa - x0:xb - x0, None])
    blit(fr, sp, 540, cy, alpha=min(1, u / 0.3))
    # lamp warmth over the paper
    fr *= 0.55 + 0.6 * LAMP_WARM
    lines = [(160, 0), (1640, 1), (1745, 2), (1640, 3), (1745, 4)]
    for (spr, t0), (y, i) in zip(S1_TEXT, lines):
        t1 = 3.3 if i in (1, 2) else S_TITLE - 0.05
        if i == 0:
            t1 = S_TITLE - 0.05
        if t0 <= u < t1:
            dt = u - t0; kk = ease_out(dt / 0.16)
            blit(fr, spr, 540, y + 8 * (1 - kk), alpha=min(1, dt / 0.06) * min(1, (t1 - u) / 0.12), scale=1 + 0.4 * (1 - kk))
    return fr, 0.0


yy_, xx_ = np.mgrid[0:H, 0:W].astype(np.float32)
LAMP_WARM = np.exp(-(((xx_ - 300) / 900) ** 2 + ((yy_ - 500) / 1300) ** 2) * 1.2)[..., None]

# ---------------------------------------------------------------- scene 2: chapter title slam
T_CH = gold("CHAPTER  ONE", 44, style="pale", bold=False, track=14)
T_ROOM = gold("ROOM LOCKED.", 128)
T_LADY = gold("LADY DEAD.", 128)
T_PROF = gold("PROFESSOR", 120, style="pale")
T_HUNG = gold("HUNGRY.", 150)


def scene_title(t):
    u = t - S_TITLE
    fr = np.zeros((H, W, 3), np.float32) + 6
    fr += LAMP_WARM * np.array([30, 16, 6], np.float32) * (0.6 + 0.4 * math.sin(u * 9) ** 2)
    blit(fr, T_CH, 540, 600, alpha=min(1, u / 0.3))
    for spr, t0, y in ((T_ROOM, 0.05, 790), (T_LADY, 0.85, 960), (T_PROF, 1.65, 1150), (T_HUNG, 1.85, 1310)):
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.14)
            blit(fr, spr, 540, y, alpha=min(1, dt / 0.05), scale=1 + 0.7 * (1 - k))
    flash = sum(0.35 * math.exp(-(u - s) * 14) for s in (0.05, 0.85, 1.65) if u >= s)
    return fr, flash


# ---------------------------------------------------------------- scene 3: dossier cards
CAST = [("P", "PROF. PARTH", "The Believer Who Codes", "“Sir, likhte rehna.”"),
        ("S", "SHAONI", "The Planner of Impossible Things", "47 rows. Risk: Low."),
        ("K", "KSHITIJ", "The Keeper of the Diary", "“Noted. For future evidence.”"),
        ("G", "GABBAR SINGH NEGI", "The Driver of Basanti", "Bhooton ka extra."),
        ("G", "GHOSTBUSTER GOLU", "The Loudest Man in the Mountains", "“Ghost family, kya haal hai!”")]


def card(letter, name, role, quote):
    cw, ch = 900, 1060
    im = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, cw - 1, ch - 1), 26, fill=(20, 17, 15, 238), outline=(217, 179, 106, 255), width=3)
    d.rounded_rectangle((18, 18, cw - 19, ch - 19), 18, outline=(217, 179, 106, 90), width=1)
    d.text((60, 60), "CASE FILE · THE SAVOY", font=font(F_MONO, 28), fill=(200, 180, 140, 255))
    d.text((cw - 60, 60), "DAY 0", font=font(F_MONO, 28), fill=(200, 180, 140, 255), anchor="ra")
    d.ellipse((cw / 2 - 170, 190, cw / 2 + 170, 530), outline=(217, 179, 106, 255), width=5)
    d.ellipse((cw / 2 - 150, 210, cw / 2 + 150, 510), fill=(48, 34, 22, 255))
    arr = np.asarray(im).copy()
    L = gold(letter, 230)
    tmp = np.zeros((ch, cw, 3), np.float32) + arr[..., :3]
    blit_local(tmp, L, cw / 2, 365)
    arr[..., :3] = tmp.clip(0, 255)
    nm = gold(name, 76 if len(name) < 14 else 64)
    rl = plain(role.upper(), F_SERIF, 34, (235, 220, 190), track=4)
    q = plain(quote, F_HAND, 46, (255, 236, 196))
    for spr, y in ((nm, 650), (rl, 760), (q, 900)):
        tmp = arr[..., :3].astype(np.float32)
        blit_local(tmp, spr, cw / 2, y)
        arr[..., :3] = tmp.clip(0, 255)
        sa = np.zeros((ch, cw), np.float32)
    d2 = Image.fromarray(arr, "RGBA")
    dd = ImageDraw.Draw(d2)
    dd.line((cw / 2 - 160, 830, cw / 2 + 160, 830), fill=(217, 179, 106, 200), width=2)
    return np.asarray(d2)


def blit_local(dst, spr, cx, cy):
    h, w = spr.shape[:2]
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    Hh, Ww = dst.shape[:2]
    xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + w, Ww), min(y0 + h, Hh)
    s = spr[ya - y0:yb - y0, xa - x0:xb - x0].astype(np.float32)
    a = s[..., 3:4] / 255
    dst[ya:yb, xa:xb] = dst[ya:yb, xa:xb] * (1 - a) + s[..., :3] * a


CARDS = [card(*c) for c in CAST]
CAST_BG = np.asarray(Image.fromarray(DESK.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(18)), np.float32) * 0.6
T_CAST = gold("THE COMPANY", 50, style="pale", bold=False, track=16)


def scene_cast(t):
    u = t - S_CAST
    fr = CAST_BG.copy()
    blit(fr, T_CAST, 540, 250, alpha=min(1, u / 0.3))
    dur = (S_CORR - S_CAST) / len(CARDS)
    i = min(int(u / dur), len(CARDS) - 1)
    du = u - i * dur
    k = ease_out(du / 0.18)
    blit(fr, CARDS[i], 540 + 60 * (1 - k), 1000, alpha=min(1, du / 0.06), scale=1.12 - 0.12 * k + 0.02 * du)
    flash = 0.18 * math.exp(-du * 16)
    return fr, flash


# ---------------------------------------------------------------- scene 4: 2:14 a.m. corridor
def corridor():
    RW, RH = 1080, 1920
    im = Image.new("RGB", (RW, RH), (0, 0, 0))
    d = ImageDraw.Draw(im)
    vx, vy = 540, 900
    ew, eh = 190, 300                      # far end opening
    ex0, ey0, ex1, ey1 = vx - ew / 2, vy - eh / 2, vx + ew / 2, vy + eh / 2
    # walls / floor / ceiling as gradients by drawing many quads from near to far
    steps = 120
    for i in range(steps):
        a, b = i / steps, (i + 1) / steps
        def lerp(p, q, s): return p + (q - p) * s
        L0, L1 = lerp(-300, ex0, a), lerp(-300, ex0, b)
        R0, R1 = lerp(RW + 300, ex1, a), lerp(RW + 300, ex1, b)
        T0, T1 = lerp(-200, ey0, a), lerp(-200, ey0, b)
        B0, B1 = lerp(RH + 200, ey1, a), lerp(RH + 200, ey1, b)
        fade = (1 - b) ** 1.4 * 0.9 + 0.08
        wall = tuple(int(c * fade) for c in (92, 58, 36))
        floor = tuple(int(c * fade) for c in (96, 22, 24))
        ceil = tuple(int(c * fade) for c in (60, 50, 40))
        d.polygon([(L0, T0), (L1, T1), (L1, B1), (L0, B0)], fill=wall)
        d.polygon([(R0, T0), (R1, T1), (R1, B1), (R0, B0)], fill=wall)
        d.polygon([(L0, B0), (L1, B1), (R1, B1), (R0, B0)], fill=floor)
        d.polygon([(L0, T0), (L1, T1), (R1, T1), (R0, T0)], fill=ceil)
        if i % 12 == 0:                    # wall panel seams + doors
            for x in (L0, R0):
                d.line((x, T0 + (B0 - T0) * 0.18, x, B0 - (B0 - T0) * 0.06), fill=(20, 12, 8), width=max(1, int(6 * (1 - a))))
    # far end: stairwell glow
    d.rectangle((ex0, ey0, ex1, ey1), fill=(40, 34, 30))
    arr = np.asarray(im, np.float32)
    yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)
    end_glow = np.exp(-(((xx - vx) / 160) ** 2 + ((yy - vy) / 220) ** 2))[..., None] * np.array([150, 120, 80], np.float32)
    arr += end_glow
    # silhouettes at the end: one slim, one like a wardrobe
    sil = Image.new("L", (RW, RH), 0)
    sd = ImageDraw.Draw(sil)
    for cx, wbody, hbody in ((vx - 34, 30, 150), (vx + 30, 62, 160)):
        top = vy + eh / 2 - hbody
        sd.ellipse((cx - wbody * 0.28, top - 34, cx + wbody * 0.28, top + 2), fill=255)
        sd.rounded_rectangle((cx - wbody / 2, top, cx + wbody / 2, vy + eh / 2), 10, fill=255)
    sil = np.asarray(sil.filter(ImageFilter.GaussianBlur(1.5)), np.float32)[..., None] / 255
    arr = arr * (1 - sil * 0.92)
    # lamps along the walls
    lamps = np.zeros((RH, RW), np.float32)
    for s in (0.12, 0.38, 0.58, 0.72, 0.82):
        ly = -200 + (ey0 - -200) * s + (1 - s) * 520
        for lx in (-300 + (ex0 + 300) * s + 20 * (1 - s), RW + 300 + (ex1 - RW - 300) * s - 20 * (1 - s)):
            r = 260 * (1 - s) + 18
            lamps += np.exp(-(((xx - lx) / r) ** 2 + ((yy - ly) / (r * 1.3)) ** 2)) * (1.0 - 0.3 * s)
    return arr, lamps


CORR, LAMPS = corridor()
LAMP_COL = np.array([255, 178, 92], np.float32)
WH1 = plain("2:14 A.M.", F_MONO_B, 54, (245, 235, 210), track=4)
WH2 = plain("THE SAVOY · CORRIDOR OUTSIDE ROOM 112", F_MONO, 28, (220, 205, 175), track=2)
SUB1 = plain("“ND-65 ka core abhi bhi wahi hai, Bhalla.”", F_HAND, 52, (255, 246, 225))
SUB2 = plain("“Glacier pighal raha hai.”", F_HAND, 52, (255, 246, 225))
SUB3 = plain("“Usse pehle humein pahunchna hai.”", F_HAND, 52, (255, 246, 225))


def corridor_frame(t, zoom, flick=True, shake=(0, 0)):
    fl = 0.85 + 0.15 * math.sin(t * 13) * math.sin(t * 7.3) if flick else 1.0
    if flick and int(t * 30) % 47 == 0:
        fl *= 0.55
    base = CORR * (0.55 + 0.45 * fl) + LAMPS[..., None] * LAMP_COL * 0.55 * fl
    return zoomed(base, zoom, 0.5, 0.47, shake)


def scene_corr(t):
    u = t - S_CORR
    fr = corridor_frame(t, 1.0 + 0.09 * ease_io(u / 3.2)) * VIG
    fr *= min(1, u / 0.35)
    blit(fr, WH1, 90, 230, alpha=min(1, u / 0.2), anchor="l")
    blit(fr, WH2, 90, 300, alpha=min(1, max(0, u - 0.3) / 0.3), anchor="l")
    for spr, t0, t1 in ((SUB1, 0.35, 1.45), (SUB2, 1.5, 2.3), (SUB3, 2.35, 3.15)):
        if t0 <= u < t1:
            blit(fr, spr, 540, 1560, alpha=min(1, (u - t0) / 0.12) * min(1, (t1 - u) / 0.12))
    return fr, 0.0


# ---------------------------------------------------------------- scene 5: CLANG + Golu LIVE
T_CLANG = gold("CLANG!", 210)


def ghost_layer():
    g = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(g)
    cx, top = 540, 980
    d.ellipse((cx - 55, top - 110, cx + 55, top + 10), fill=255)
    d.polygon([(cx - 70, top - 20), (cx + 70, top - 20), (cx + 150, top + 520), (cx - 150, top + 520)], fill=255)
    return np.asarray(g.filter(ImageFilter.GaussianBlur(26)), np.float32)[..., None] / 255


GHOST = ghost_layer()


def ui_assets():
    live = Image.new("RGBA", (190, 70), (0, 0, 0, 0))
    d = ImageDraw.Draw(live)
    d.rounded_rectangle((0, 0, 189, 69), 14, fill=(225, 30, 50, 255))
    d.ellipse((22, 25, 42, 45), fill=(255, 255, 255, 255))
    d.text((56, 35), "LIVE", font=font(F_UI_B, 38), fill=(255, 255, 255, 255), anchor="lm")
    ch = Image.new("RGBA", (700, 110), (0, 0, 0, 0))
    d = ImageDraw.Draw(ch)
    d.ellipse((0, 5, 100, 105), fill=(230, 40, 50, 255))
    d.text((50, 55), "GG", font=font(F_UI_B, 40), fill=(255, 255, 255, 255), anchor="mm")
    d.text((122, 22), "Ghostbuster Golu", font=font(F_UI_B, 40), fill=(255, 255, 255, 255))
    d.text((122, 70), "5M subscribers", font=font(F_UI_R, 28), fill=(220, 220, 220, 255))
    title = Image.new("RGBA", (980, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(title)
    d.text((0, 0), "REAL GHOST CAUGHT AT SAVOY", font=font(F_UI_B, 50), fill=(255, 255, 255, 255))
    d.text((0, 62), "(NOT CLICKBAIT!!!)", font=font(F_UI_B, 50), fill=(255, 220, 60, 255))
    d.text((0, 140), "1.2M views  ·  Spirits identified: Unknown Entity (Female?)", font=font(F_UI_R, 30), fill=(230, 230, 230, 255))
    comments = []
    for user, txt in (("@pahadi_boy", "bhai ye REAL hai"), ("@mussoorie_diaries", "SAFED SAAYA!!"), ("@shaoni.plans", "isko data nahi kehte"),
                      ("@ghostfamily_07", "pahad pe akele mat jaana")):
        c = Image.new("RGBA", (720, 96), (0, 0, 0, 0))
        d = ImageDraw.Draw(c)
        d.rounded_rectangle((0, 0, 719, 95), 22, fill=(0, 0, 0, 150))
        d.text((24, 14), user, font=font(F_UI, 26), fill=(255, 210, 120, 255))
        d.text((24, 48), txt, font=font(F_UI_R, 32), fill=(255, 255, 255, 255))
        comments.append(np.asarray(c))
    return np.asarray(live), np.asarray(ch), np.asarray(title), comments


UI_LIVE, UI_CH, UI_TITLE, UI_COMMENTS = ui_assets()
UI_SHADE = np.concatenate([np.linspace(0.55, 0, 380), np.zeros(H - 380 - 700), np.linspace(0, 0.75, 700)])[:, None, None]


def scene_clang(t):
    u = t - S_CLANG
    sh = (18 * math.exp(-u * 6) * math.sin(u * 70), 14 * math.exp(-u * 6) * math.cos(u * 55))
    if u < 0.55:
        fr = corridor_frame(t, 1.12, shake=sh) * VIG
        k = ease_out(u / 0.12)
        blit(fr, T_CLANG, 540 + sh[0], 960 + sh[1], alpha=min(1, u / 0.03), scale=1.5 - 0.5 * k, )
        return fr, 0.5 * math.exp(-u * 10)
    v = u - 0.55
    hand = (6 * math.sin(t * 5.1), 5 * math.sin(t * 4.3 + 1))
    fr = corridor_frame(t, 1.05 + 0.02 * v, flick=False, shake=hand)
    # ring light: overexposed, cold white; the 'ghost' (Parth in a shawl) mid-corridor
    fr = fr * 0.8 + 70
    fr = fr * (1 - GHOST * 0.9) + GHOST * 250
    fr *= (1 - UI_SHADE)
    blit(fr, UI_LIVE, 70, 140, anchor="l")
    blit(fr, plain("48.2K watching", F_UI, 30, (255, 255, 255)), 280, 140, anchor="l")
    blit(fr, UI_CH, 60, 1440, anchor="l")
    blit(fr, UI_TITLE, 60, 1610, anchor="l")
    for i, c in enumerate(UI_COMMENTS):
        t0 = 0.25 + i * 0.6
        if v >= t0:
            k = ease_out((v - t0) / 0.25)
            slot = len([j for j in range(len(UI_COMMENTS)) if 0.25 + j * 0.6 <= v]) - 1 - i
            blit(fr, c, 60, 1290 - slot * 110 - 30 * (1 - k), alpha=k * max(0, 1 - slot * 0.3), anchor="l")
    # REC corners
    for x, y in ((50, 230), (W - 50, 230), (50, H - 120), (W - 50, H - 120)):
        dx = 1 if x < W / 2 else -1; dy = 1 if y < H / 2 else -1
        fr[y:y + 4 * dy if dy > 0 else y, :] = fr[y:y + 4 * dy if dy > 0 else y, :]
    flash = 0.95 * math.exp(-v * 7) if v < 1.0 else 0.0
    return fr, flash


# ---------------------------------------------------------------- scene 6: the swapped notebook
def glacier_photo(w=420, h=320):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    sky = 150 + 60 * (yy / h)
    ridge = h * 0.42 + np.cumsum(rng.normal(0, 3.2, w)) * 0.9
    ridge -= ridge.mean() - h * 0.42
    ridge = np.convolve(ridge, np.ones(9) / 9, mode="same")
    snow = np.where(yy > ridge[None, :], 228 - 70 * ((yy - ridge[None, :]) / h) ** 0.7, sky)
    snow += rng.normal(0, 9, (h, w))
    smudge = np.exp(-(((xx - w * 0.58) / 22) ** 2 + ((yy - h * 0.72) / 11) ** 2))
    snow = snow * (1 - 0.75 * smudge)
    steam = np.zeros_like(snow)
    for i in range(5):
        cy = h * 0.66 - i * 18
        cx = w * 0.58 + 10 * math.sin(i * 1.3)
        steam += np.exp(-(((xx - cx) / (10 + i * 4)) ** 2 + ((yy - cy) / 12) ** 2)) * (0.5 - i * 0.07)
    snow = snow + steam * 60
    img = np.clip(snow, 0, 255)
    img = (img - 128) * 1.1 + 128
    ph = np.dstack([img] * 3) * np.array([1.0, 0.97, 0.9])
    border = np.zeros((h + 40, w + 40, 3)) + np.array([238, 232, 218])
    border[20:20 + h, 20:20 + w] = ph
    return border.clip(0, 255).astype(np.uint8)


def notebook():
    nw, nh = 1000, 1300
    im = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, nw - 1, nh - 1), 30, fill=(78, 46, 26, 255))
    d.rounded_rectangle((26, 22, nw - 27, nh - 23), 12, fill=(234, 224, 200, 255))
    for y in range(170, nh - 60, 52):
        d.line((70, y, nw - 70, y), fill=(170, 186, 210, 110), width=2)
    d.line((140, 40, 140, nh - 40), fill=(205, 120, 120, 120), width=2)
    arr = np.asarray(im).copy()
    ph = Image.fromarray(glacier_photo()).rotate(4, resample=Image.BICUBIC, expand=True, fillcolor=(0, 0, 0, 0)) \
        if False else Image.fromarray(glacier_photo())
    php = np.dstack([np.asarray(ph), np.full(np.asarray(ph).shape[:2], 255, np.uint8)])
    php = np.asarray(Image.fromarray(php, "RGBA").rotate(4, resample=Image.BICUBIC, expand=True))
    tmp = arr[..., :3].astype(np.float32)
    al = arr[..., 3:4].astype(np.float32)
    blit_local(tmp, php, nw / 2, 330)
    # tape strips
    tape = np.zeros((40, 130, 4), np.uint8); tape[..., :3] = (236, 226, 190); tape[..., 3] = 170
    blit_local(tmp, tape, nw / 2 - 150, 150); blit_local(tmp, tape, nw / 2 + 150, 150)
    arr[..., :3] = tmp.clip(0, 255)
    return arr


NOTE_BASE = notebook()
INK = (24, 36, 82)
HAND_LINES = [
    ("Spring 1966.", 42, 590, 0.35),
    ("30°22'N  79°58'E   —  6,400 m", 34, 690, 0.8),
    ("Maletha ✓   Dronagiri ○   Munsiyari ○", 34, 760, 1.15),
    ("Nanda ki garam shila, barf mein soyi,", 40, 880, 1.55),
    ("jisne chhui, woh laut ke na royi…", 40, 940, 2.0),
]


def hand(text, size):
    f = font(F_HAND, size); fs = font(F_SYM, size - 4)
    w = int(sum((fs if c in "✓○" else f).getlength(c) for c in text)) + 10
    asc, desc = f.getmetrics()
    im = Image.new("L", (w, asc + desc + 10), 0)
    d = ImageDraw.Draw(im); x = 4
    for c in text:
        ff = fs if c in "✓○" else f
        d.text((x, 4 if ff is f else 8), c, font=ff, fill=255); x += ff.getlength(c)
    a = np.asarray(im, np.float32) / 255
    return np.dstack([np.zeros(a.shape + (3,)) + INK, a * 255]).astype(np.uint8)


HANDS = [(hand(tx, sz), y, t0) for tx, sz, y, t0 in HAND_LINES]
TORN = gold("THE LAST VERSE HAD BEEN", 54, style="pale")
TORN2 = gold("TORN OUT.", 96)
NB_TAG = plain("NOT MY NOTEBOOK.", F_MONO_B, 44, (245, 235, 210), track=4)


def scene_book(t):
    u = t - S_BOOK
    nb = NOTE_BASE[..., :3].astype(np.float32).copy()
    nh, nw = nb.shape[:2]
    for spr, y, t0 in HANDS:
        if u >= t0:
            p = min(1, (u - t0) / 0.45)                       # write-on wipe
            s = spr.copy(); cut = int(s.shape[1] * p)
            s[:, cut:, 3] = 0
            blit_local(nb, s, 120 + s.shape[1] / 2, y)
    # torn bottom edge
    tear_y = 1040 + (np.sin(np.arange(nw) * 0.21) * 9 + rng.normal(0, 5, nw)).astype(int)
    rows = np.arange(nh)[:, None]
    torn = rows > tear_y[None, :]
    nb_a = NOTE_BASE[..., 3].astype(np.float32).copy()
    nb[torn & (rows < nh - 23)] = nb[torn & (rows < nh - 23)] * 0.0 + np.array([78, 46, 26])
    rgba = np.dstack([nb, nb_a]).clip(0, 255).astype(np.uint8)
    fr = CAST_BG.copy() * 0.8
    k = ease_out(u / 0.5)
    sc = 0.86 + 0.14 * k + 0.03 * u
    blit(fr, rgba, 540, 1000 - 80 * (1 - k), alpha=min(1, u / 0.15), scale=sc)
    blit(fr, NB_TAG, 540, 230, alpha=min(1, u / 0.25))
    if u >= 2.7:
        dt = u - 2.7; kk = ease_out(dt / 0.16)
        blit(fr, TORN, 540, 1660, alpha=min(1, dt / 0.06), scale=1 + 0.4 * (1 - kk))
    if u >= 3.1:
        dt = u - 3.1; kk = ease_out(dt / 0.16)
        blit(fr, TORN2, 540, 1770, alpha=min(1, dt / 0.06), scale=1 + 0.6 * (1 - kk))
    return fr, 0.25 * math.exp(-u * 10)


# ---------------------------------------------------------------- scene 7: the note from R. + headlights
def page_close():
    pw, ph = W, H
    p = np.zeros((ph, pw, 3), np.float32) + np.array([232, 222, 198], np.float32)
    p += rng.normal(0, 6, (ph, pw, 1))
    for y in range(300, ph, 78):
        p[y:y + 2] = p[y:y + 2] * 0.85 + np.array([170, 186, 210]) * 0.15
    return p * vignette(0.55, 2.0)


PAGE = page_close()
NOTE_LINES = [("Professor Parth. Room 112.", 66, 620, 0.1),
              ("Aap mera notebook rakhiye.", 66, 780, 0.75),
              ("Main aapka rakh leta hoon.", 66, 940, 1.35),
              ("Phir milenge.", 92, 1140, 1.95),
              ("— R.", 92, 1300, 2.35)]
NOTES = [(hand(tx, sz), y, t0) for tx, sz, y, t0 in NOTE_LINES]


def scene_note(t):
    u = t - S_NOTE
    fr = zoomed(PAGE, 1.0 + 0.04 * u)
    for spr, y, t0 in NOTES:
        if u >= t0:
            p = min(1, (u - t0) / 0.5)
            s = spr.copy(); s[:, int(s.shape[1] * p):, 3] = 0
            blit(fr, s, 120 + s.shape[1] / 2, y, alpha=1.0)
    # page goes dark, a black SUV's headlights come on
    if u > 2.55:
        k = min(1, (u - 2.55) / 0.2)
        fr *= (1 - 0.94 * k)
        hl = min(1, max(0, u - 2.7) / 0.08)
        for cx in (390, 690):
            g = np.exp(-(((xx_ - cx) / 70) ** 2 + ((yy_ - 1040) / 40) ** 2))
            g2 = np.exp(-(((xx_ - cx) / 260) ** 2 + ((yy_ - 1040) / 140) ** 2)) * 0.35
            fr += ((g + g2)[..., None] * np.array([255, 245, 225], np.float32)) * hl
    return fr, 0.0


# ---------------------------------------------------------------- scene 8: end card
TITLE_LOGO = np.asarray(Image.open(f"{UP}/68465784-image.png").convert("RGBA").resize((960, 320), Image.LANCZOS))
AUTH = np.asarray(Image.open(os.path.join(D, "gfx", "author.png")).convert("RGBA").resize((760, 253), Image.LANCZOS))
E_CH = gold("CHAPTER  ONE", 44, style="pale", bold=False, track=14)
E_T1 = gold("ROOM LOCKED, LADY DEAD,", 58, style="pale")
E_T2 = gold("PROFESSOR HUNGRY", 72)
E_TAG = plain("Fifteen days. Fifteen legends.", F_HAND, 50, (245, 230, 196))
E_TAG2 = plain("One thing on the mountain that is still warm.", F_HAND, 40, (220, 200, 160))


def scene_end(t):
    u = t - S_END
    fr = CAST_BG.copy() * 0.55
    fr += LAMP_WARM * np.array([40, 22, 8], np.float32)
    items = [(E_CH, 330, 0.0, 1.0), (E_T1, 430, 0.1, 1.0), (E_T2, 515, 0.25, 1.0), (TITLE_LOGO, 820, 0.45, 1.0),
             (E_TAG, 1080, 0.85, 1.0), (E_TAG2, 1150, 1.05, 1.0), (AUTH, 1450, 1.25, 1.0)]
    for spr, y, t0, _ in items:
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.25)
            blit(fr, spr, 540, y + 20 * (1 - k), alpha=min(1, dt / 0.2), scale=1.08 - 0.08 * k)
    return fr, 0.5 * math.exp(-u * 6)


# ---------------------------------------------------------------- dust motes in lamp light
DUST = [dict(x=rng.uniform(0, W), y=rng.uniform(0, H), vx=rng.uniform(-8, 8), vy=rng.uniform(-14, -3),
             r=int(rng.choice([1, 1, 2, 2, 3])), ph=rng.uniform(0, 6)) for _ in range(140)]
SPR = {}
for r in (1, 2, 3):
    k = np.arange(-3 * r - 2, 3 * r + 3)
    SPR[r] = np.exp(-(k[:, None] ** 2 + k[None, :] ** 2) / (2 * (r * 0.8) ** 2)).astype(np.float32)


def dust(fr, t, amount):
    if amount <= 0:
        return
    for p in DUST:
        x = (p["x"] + p["vx"] * t + 12 * math.sin(t * 0.7 + p["ph"])) % W
        y = (p["y"] + p["vy"] * t) % H
        b = amount * (0.5 + 0.5 * math.sin(t * 2 + p["ph"] * 3)) * 0.6
        s = SPR[p["r"]]; r = s.shape[0] // 2; xi, yi = int(x), int(y)
        xa, ya, xb, yb = max(xi - r, 0), max(yi - r, 0), min(xi + r + 1, W), min(yi + r + 1, H)
        if xa < xb and ya < yb:
            fr[ya:yb, xa:xb] += s[ya - (yi - r):yb - (yi - r), xa - (xi - r):xb - (xi - r)][..., None] * np.array([255, 210, 150.]) * b


SCENES = [(S_CLIP, scene_clip, 1.0), (S_TITLE, scene_title, 0.6), (S_CAST, scene_cast, 0.7), (S_CORR, scene_corr, 1.0),
          (S_CLANG, scene_clang, 0.3), (S_BOOK, scene_book, 0.8), (S_NOTE, scene_note, 0.4), (S_END, scene_end, 1.0)]


def frame_at(t):
    for i in range(len(SCENES) - 1, -1, -1):
        if t >= SCENES[i][0]:
            fr, fl = SCENES[i][1](t)
            dust(fr, t, SCENES[i][2])
            if fl > 0:
                fr = fr + (255 - fr) * min(fl, 1)
            return fr


def render():
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-ss", str(A0), "-t", "30", "-i", SRC, "-filter_complex",
                            "[0:v]noise=c0s=7:c0f=t+u,fade=t=in:st=0:d=0.3,fade=t=out:st=29.4:d=0.6,format=yuv420p[v];"
                            "[1:a]afade=t=in:st=0:d=0.3,afade=t=out:st=29.0:d=1.0,alimiter=limit=0.95:level=false[a]",
                            "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
                            "-profile:v", "high", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-movflags", "+faststart",
                            "-t", str(LIMIT / FPS), OUT], stdin=subprocess.PIPE)
    for n in range(LIMIT):
        fr = frame_at(n / FPS)
        enc.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
        if n % 90 == 0:
            print("frame", n, flush=True)
    enc.stdin.close(); enc.wait()
    print("done", OUT)


if __name__ == "__main__":
    if len(sys.argv) > 3:                       # stills: render_ch1.py out.png 0 t1,t2,...
        ts = [float(v) for v in sys.argv[3].split(",")]
        ims = [Image.fromarray(np.clip(frame_at(t), 0, 255).astype(np.uint8)).resize((270, 480)) for t in ts]
        sheet = Image.new("RGB", (270 * len(ims), 480))
        for i, im in enumerate(ims):
            sheet.paste(im, (270 * i, 0))
        sheet.save(OUT)
    else:
        render()
