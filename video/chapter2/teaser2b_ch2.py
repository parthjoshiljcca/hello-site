"""Chapter Two teaser v2 (30s, 1080x1920) on score_teaser2b.wav.

Real Himalayan plates from the Bagadwal video, graded day-for-night, under a lens pass
(bloom, anamorphic streaks, red halation, fog, gate weave, scope bars). One clear story line:
the rule -> one stolen notebook, a plutonium secret, a black SUV -> headlights off ->
Devprayag, the torch, the rule -> HE TURNED AROUND -> @ND65 -> title -> 'Parth...'.
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import render_ch1 as rc
import render_ch2 as r2
from render_ch1 import W, H, FPS, blit, plain, gold, zoomed, ease_out, ease_io

UP = "/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650"
SRC = f"{UP}/3da759ef-VID-20261025-WA0001.mp4"
D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "teaser2b_ch2.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 900
SCORE = os.path.join(D, "score_teaser2b.wav")
B = 60 / 90
BAR = 4 * B
BARS = 210
VIS0, VIS1 = BARS, H - BARS
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
rng = np.random.default_rng(77)

HITS = [(2.667, .55, 22), (4.0, .15, 6), (5.333, .15, 6), (6.667, .2, 8), (8.0, .15, 6), (9.333, .7, 26),
        (13.333, .45, 18), (19.333, .9, 34), (21.333, .35, 16), (24.0, .3, 14), (24.333, .3, 14), (24.667, .3, 14),
        (25.0, .3, 14), (25.333, .6, 26), (29.4, .95, 30)]


# ---------------------------------------------------------------- plates (real footage, day-for-night)
def grab(t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", SRC, "-frames:v", "1", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return Image.fromarray(np.frombuffer(raw, np.uint8).reshape(480, 854, 3))


def night(img, dark=0.42, moon=True):
    a = np.asarray(img, np.float32)
    L = a @ np.array([0.3, 0.59, 0.11])
    out = (L[..., None] * np.array([0.62, 0.78, 1.0]) * 0.75 + a * 0.25 * np.array([0.6, 0.75, 1.0])) * dark
    out = np.clip((out - 10) * 1.15 + 6, 0, 255)
    return out


def plate(t, dark=0.42, cover=(1080, VIS1 - VIS0), already_night=False):
    img = grab(t)
    w, h = cover
    sc = max(w / 854, h / 480) * 1.18
    big = img.resize((int(854 * sc), int(480 * sc)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    arr = np.asarray(big, np.float32) * (0.72 if already_night else 1.0) if already_night else night(big, dark)
    return arr


P_STORM = plate(95.5, already_night=True)        # moonlit storm peaks
P_RUINS = plate(105.5, already_night=True)       # night ruins under the moon
P_PATH = plate(316.0, dark=0.36)                 # mountain path -> the road at night
P_PEAKS = plate(336.0, dark=0.32)                # peaks at dusk -> night
P_TITLE = plate(341.0, dark=0.30)


def frame_from(pl, z, fx, fy, shake=(0, 0)):
    """Crop a plate into the visible scope window and put it on a black 1080x1920 frame."""
    ph, pw = pl.shape[:2]
    vw, vh = W, VIS1 - VIS0
    cw, ch = pw / z * (vw / (pw * (vh / ph) if pw / ph < vw / vh else vw)) if False else (vw * (ph / vh) / z if pw / ph > vw / vh else pw / z), 0
    # simple, robust: scale plate so its height fills the window, then crop width
    s = vh / ph * z
    cw_src, ch_src = vw / s, vh / s
    x0 = min(max(fx * pw - cw_src / 2 + shake[0] / s, 0), pw - cw_src)
    y0 = min(max(fy * ph - ch_src / 2 + shake[1] / s, 0), ph - ch_src)
    im = Image.fromarray(np.clip(pl, 0, 255).astype(np.uint8)).resize((vw, vh), Image.BILINEAR, box=(x0, y0, x0 + cw_src, y0 + ch_src))
    fr = np.zeros((H, W, 3), np.float32)
    fr[VIS0:VIS1] = np.asarray(im, np.float32)
    return fr


# ---------------------------------------------------------------- lens pass
FOG = np.asarray(Image.fromarray(rng.integers(0, 255, (30, 18), dtype=np.uint8)).resize((W + 600, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(70)), np.float32) / 255


def fog(fr, t, amt):
    if amt <= 0:
        return fr
    off = int(t * 40) % 600
    f = FOG[:, off:off + W][..., None]
    return fr + f * np.array([120, 135, 150.]) * amt * (fr.mean() / 60 + 0.4)


def lens(fr, bloom=1.0, streak=1.0):
    small = Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8)).resize((W // 4, H // 4), Image.BILINEAR)
    s = np.asarray(small, np.float32)
    hi = np.clip((s - 150) * 2.0, 0, 255)
    hi_img = Image.fromarray(hi.astype(np.uint8))
    b = np.asarray(hi_img.filter(ImageFilter.GaussianBlur(10)).resize((W, H), Image.BILINEAR), np.float32)
    st = np.asarray(hi_img.filter(ImageFilter.GaussianBlur((60, 1))).resize((W, H), Image.BILINEAR), np.float32)
    hal = np.asarray(hi_img.filter(ImageFilter.GaussianBlur(4)).resize((W, H), Image.BILINEAR), np.float32)
    fr = fr + b * 0.55 * bloom
    fr = fr + st.mean(2, keepdims=True) * np.array([0.55, 0.75, 1.25]) * 1.6 * streak
    fr = fr + hal[..., :1] * np.array([0.35, 0.05, 0.02]) * bloom
    return fr


def scope(fr):
    fr[:VIS0] = 0; fr[VIS1:] = 0
    return fr


def glow(fr, x, y, r, col, amt=1.0):
    fr += np.exp(-(((XX - x) / r) ** 2 + ((YY - y) / r) ** 2))[..., None] * np.array(col, np.float32) * amt


# ---------------------------------------------------------------- type
def fit(spr, maxw=960):
    pad = 2 * max(6, 60 // 7) * 3
    w = spr.shape[1] - pad
    if w > maxw:
        sc = maxw / w
        spr = np.asarray(Image.fromarray(spr, "RGBA").resize((int(spr.shape[1] * sc), int(spr.shape[0] * sc)), Image.LANCZOS))
    return spr


def cap(text, size, style="gold"):
    return fit(gold(text, size, style=style))


def pop(fr, spr, cy, u, t0, t1, big=0.35, cx=540):
    if t0 <= u < t1:
        dt = u - t0; k = ease_out(dt / 0.15)
        blit(fr, spr, cx, cy + 8 * (1 - k), alpha=min(1, dt / 0.06) * min(1, (t1 - u) / 0.12), scale=1 + big * (1 - k))


def slam(fr, spr, dt, cy=960, big=0.8):
    k = ease_out(dt / 0.13)
    blit(fr, spr, 540, cy, alpha=min(1, dt / 0.04), scale=1 + big * (1 - k))


A1 = cap("IF SOMEONE CALLS YOUR NAME", 62, "pale")
A2 = cap("BY THE RIVER, AT NIGHT…", 70, "pale")
A3 = cap("DON'T LOOK BACK.", 112)
B1 = cap("ONE STOLEN NOTEBOOK.", 80)
B2a = cap("A SECRET THE CIA", 64, "pale")
B2 = cap("LOST ON NANDA DEVI.", 76)
B3 = cap("AND A BLACK SUV", 74, "pale")
B4 = cap("THAT WOULDN'T STOP FOLLOWING.", 62)
C0 = plain("9:40 P.M.  ·  DEVPRAYAG ROAD", rc.F_MONO_B, 40, (240, 228, 200), track=4)
C1 = cap("GABBAR KILLED THE HEADLIGHTS.", 62, "pale")
C2 = cap("AND DROVE BLIND.", 92)
C3 = fit(gold("DEVPRAYAG", 130))
C4 = plain("WHERE TWO RIVERS BECOME THE GANGA", rc.F_SERIF, 36, (230, 215, 185), track=4)
D1 = r2.sub("“Yeh Masan ka ilaaka hai.”", 60)
D2 = r2.sub("“Peeche se koi bulaye…”", 60)
D3 = plain("“…mud ke mat dekhna.”", rc.F_HAND_B, 72, (255, 236, 200), glow=6)
D4 = fit(gold("HE TURNED AROUND.", 104), 900)
E1 = cap("SOMEONE WAS WATCHING.", 70, "pale")
F_CH = gold("CHAPTER  TWO", 46, style="pale", bold=False, track=14)
F_T1 = gold("RULE ONE:", 66, style="pale")
F_T2 = fit(gold("NEVER LOOK BACK AT THE GHAT", 64), 900)
F_PARTH = plain("Parth…", rc.F_HAND, 96, (225, 225, 230), glow=10, glow_col=(110, 130, 170))


# ---------------------------------------------------------------- props
def mirror(fr, beams, t):
    x0, y0, x1, y1 = 300, VIS0 + 70, 780, VIS0 + 290
    fr[y0:y1, x0:x1] *= 0.25
    fr[y0:y0 + 8, x0:x1] = 30; fr[y1 - 8:y1, x0:x1] = 30; fr[y0:y1, x0:x0 + 8] = 30; fr[y0:y1, x1 - 8:x1] = 30
    for cx in (470, 610):
        r = 10 + 40 * beams
        fr[y0:y1, x0:x1] += np.exp(-(((XX[y0:y1, x0:x1] - cx) / r) ** 2 + ((YY[y0:y1, x0:x1] - (y0 + y1) / 2) / (r * 0.6)) ** 2))[..., None] * 255 * (0.6 + beams)


def headlights(fr, amt):
    if amt <= 0:
        return
    cone = np.clip((YY - 1100) / 600, 0, 1) * np.exp(-((XX - 540) / (200 + (YY - 1100).clip(0) * 0.9)) ** 2)
    fr += cone[..., None] * np.array([210, 200, 170.]) * amt


def pyre(fr, t, x=260, y=1430):
    fl = 0.75 + 0.25 * math.sin(t * 19) * math.sin(t * 7.7)
    glow(fr, x, y, 330, (255, 100, 25), 0.4 * fl)
    for i in range(7):
        fx = x + 40 * math.sin(t * (2.3 + i * 0.4) + i)
        fy = y - 40 * i * (0.7 + 0.3 * math.sin(t * 3 + i))
        r = 46 - i * 5
        fr += np.exp(-(((XX - fx) / r) ** 2 + ((YY - fy) / (r * 1.6)) ** 2))[..., None] * np.array([255, 130 + i * 12, 40.]) * (0.95 - i * 0.1) * fl * 0.7


def ghat(fr, t):
    for i, y in enumerate(range(1500, VIS1, 52)):
        fr[y:y + 52] = fr[y:y + 52] * 0.2 + np.array([38, 36, 36.]) * (1 - i * 0.06)
        fr[y:y + 3] += 18
    y0, y1, rv = r2.river(t)
    band = slice(1250, 1500)
    rv_s = np.asarray(Image.fromarray(np.clip(rv, 0, 255).astype(np.uint8)).resize((W, 250)), np.float32)
    fr[band] = fr[band] * 0.15 + rv_s * 0.75
    for lx in (150, 420, 760, 960):
        glow(fr, lx, 1215, 18, (255, 200, 120), 1.0)
        refl = np.exp(-(((XX[1250:1500] - lx) / 9) ** 2)) * (0.5 + 0.5 * np.sin(YY[1250:1500] * 0.3 + t * 6))
        fr[1250:1500] += refl[..., None] * np.array([140, 100, 55.]) * 0.6
    pyre(fr, t)


def silhouette(fr, scale, x=700, base=1500):
    """A big man in a long jacket, backlit by the torch: solid black body, thin cold rim outside it."""
    im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im)
    s = 520 * scale
    top = base - s
    hw = 0.12 * s
    d.ellipse((x - hw * 0.6, top, x + hw * 0.6, top + hw * 1.5), fill=255)                          # head
    d.polygon([(x - hw * 0.4, top + hw * 1.3), (x + hw * 0.4, top + hw * 1.3),
               (x + hw * 1.9, top + hw * 2.3), (x + hw * 1.7, top + 0.7 * s), (x + hw * 0.9, top + 0.72 * s),
               (x + hw * 0.8, base), (x + hw * 0.15, base), (x, top + 0.74 * s), (x - hw * 0.15, base),
               (x - hw * 0.8, base), (x - hw * 0.9, top + 0.72 * s), (x - hw * 1.7, top + 0.7 * s),
               (x - hw * 1.9, top + hw * 2.3)], fill=255)                                             # coat + legs
    im = im.filter(ImageFilter.GaussianBlur(1.4))
    m = np.asarray(im, np.float32) / 255
    rim = np.clip(np.asarray(im.filter(ImageFilter.GaussianBlur(4)), np.float32) / 255 - m, 0, 1) * 2.2
    fr *= (1 - m[..., None] * 0.985)
    fr += rim[..., None] * np.array([150, 175, 220.])


def torch(fr, t, u, sx=940, sy=VIS0 + 260):
    ang = math.radians(120 - 22 * ease_io(u / 3.5))
    dx, dy = math.cos(ang), math.sin(ang)
    px, py = XX - sx, YY - sy
    along = px * dx + py * dy
    perp = np.abs(-px * dy + py * dx)
    cone = np.exp(-(perp / (36 + along * 0.2).clip(1)) ** 2) * (along > 0) * np.exp(-along / 1700)
    fr += cone[..., None] * np.array([255, 245, 215.]) * 0.7
    glow(fr, sx, sy, 22, (255, 255, 255), 1.6)


# ---------------------------------------------------------------- the cut
PREV = {"fr": None}


def frame_at(t):
    gate = (1.5 * math.sin(t * 13.1), 1.2 * math.cos(t * 11.3))
    lens_b, lens_s, fog_a = 1.0, 1.0, 0.0
    if t < 4.0:                                                     # A: the rule
        fr = frame_from(P_STORM, 1.0 + 0.1 * t / 4, 0.55, 0.45, gate)
        fog_a = 0.35
        if t >= 2.667:
            fr *= 0.45
        fr = fog(fr, t, fog_a)
        fr = lens(fr)
        pop(fr, A1, 1330, t, 0.25, 2.62)
        pop(fr, A2, 1430, t, 1.1, 2.62)
        if t >= 2.667:
            slam(fr, A3, t - 2.667)
    elif t < 5.333:                                                 # B1: the notebook
        u = t - 4.0
        nb = rc.NOTE_BASE[..., :3].astype(np.float32).copy()
        for spr, y, _ in rc.HANDS:
            rc.blit_local(nb, spr, 120 + spr.shape[1] / 2, y)
        fr = np.zeros((H, W, 3), np.float32) + 4
        glow(fr, 300, 600, 700, (90, 55, 20), 1.0)
        blit(fr, np.dstack([nb, rc.NOTE_BASE[..., 3]]).clip(0, 255).astype(np.uint8), 540, 980, scale=0.9 + 0.06 * u)
        fr = lens(fr * 0.9, 0.6, 0.2)
        pop(fr, B1, 1580, u, 0.05, 1.3)
    elif t < 6.667:                                                 # B2: the plutonium secret
        u = t - 5.333
        ph = rc.glacier_photo(700, 520)
        fr = np.zeros((H, W, 3), np.float32) + 6
        blit(fr, np.dstack([ph, np.full(ph.shape[:2], 255, np.uint8)]), 540, 900, scale=1.2 + 0.25 * u)
        fr += np.exp(-(((XX - 600) / 60) ** 2 + ((YY - 980) / 80) ** 2))[..., None] * np.array([255, 120, 60.]) * 0.4 * (0.6 + 0.4 * math.sin(t * 10))
        fr = lens(fr, 0.7, 0.3)
        pop(fr, B2a, 1480, u, 0.05, 1.3)
        pop(fr, B2, 1580, u, 0.3, 1.3)
    elif t < 9.333:                                                 # B3: the black SUV
        u = t - 6.667
        fr = frame_from(P_PATH, 1.15 + 0.06 * u, 0.5, 0.55, (gate[0] * 3 + 4 * math.sin(t * 7), gate[1] * 3))
        headlights(fr, 0.55)
        mirror(fr, 0.3 + 0.35 * u / 2.667, t)
        fr = lens(fog(fr, t, 0.15))
        pop(fr, B3, 1500, u, 0.05, 2.62)
        pop(fr, B4, 1600, u, 1.333, 2.62)
    elif t < 10.667:                                                # C: 9:40 high beams
        u = t - 9.333
        fr = frame_from(P_PATH, 1.25, 0.5, 0.55, (10 * math.sin(t * 29), 8 * math.cos(t * 23)))
        headlights(fr, 0.6)
        mirror(fr, 1.0, t)
        fr += np.exp(-(((XX - 540) / 900) ** 2 + ((YY - VIS0) / 900) ** 2))[..., None] * np.array([230, 235, 255.]) * (0.55 + 0.1 * math.sin(t * 17))
        fr = lens(fr, 1.2, 1.6)
        blit(fr, C0, 540, VIS0 + 360)
    elif t < 13.333:                                                # lights off, driving blind
        u = t - 10.667
        sway = (30 * math.sin(t * 1.3), 10 * math.sin(t * 2.1))
        fr = frame_from(P_PEAKS, 1.1, 0.5, 0.42, sway) * 0.55
        fr[1300:VIS1] *= 0.15
        mirror(fr, 0.9, t)
        fr = lens(fr, 1.0, 1.2)
        pop(fr, C1, 1450, u, 0.15, 2.62)
        pop(fr, C2, 1560, u, 1.333, 2.62, big=0.6)
    elif t < 18.667:                                                # Devprayag
        u = t - 13.333
        fr = frame_from(P_RUINS, 1.05 + 0.06 * u / 5.3, 0.5, 0.35, gate)
        fr[1180:VIS1] *= 0.2
        ghat(fr, t)
        if u > 1.333:
            torch(fr, t, u - 1.333)
            silhouette(fr, 0.3 + 0.45 * ease_io((u - 1.333) / 3.6), x=760 - 60 * ease_io((u - 1.333) / 3.6), base=1540 + 150 * ease_io((u - 1.333) / 3.6))
        fr = fog(fr, t, 0.25)
        fr = lens(fr)
        pop(fr, C3, VIS0 + 180, u, 0.0, 1.3, big=0.6)
        pop(fr, C4, VIS0 + 290, u, 0.2, 1.3, big=0.1)
        pop(fr, D1, 1600, u, 1.6, 2.9, big=0.15)
        pop(fr, D2, 1600, u, 2.95, 3.9, big=0.15)
        pop(fr, D3, 1600, u, 3.95, 4.65, big=0.25)
        if u >= 4.667:                                              # the phone: Golu's scream
            v = u - 4.667
            blit(fr, plain("“Ghost family… safed saaya…”", rc.F_UI, 40, (255, 255, 255)), 540, 1600)
            if v > 0.3:
                slam(fr, gold("AAAAAH!", 120, style="white"), v - 0.3, cy=1000, big=0.3)
        if u > 5.2:
            fr *= max(0.0, 1 - (u - 5.2) / 0.12)
    elif t < 19.333:                                                # silence
        fr = np.zeros((H, W, 3), np.float32)
    elif t < 20.0:                                                  # HE TURNED AROUND
        u = t - 19.333
        fr = frame_from(P_RUINS, 1.2, 0.5, 0.35) * 0.35
        fr[1180:VIS1] *= 0.2
        ghat(fr, t)
        silhouette(fr, 0.85, x=640, base=1700)
        fr += np.exp(-(((XX - 540) / 650) ** 2 + ((YY - 960) / 600) ** 2))[..., None] * np.array([170, 10, 4.]) * math.exp(-u * 1.2)
        fr = lens(fr, 1.2, 0.6)
        slam(fr, D4, u, big=0.9)
    elif t < 21.333:                                                # escape
        u = t - 20.0
        acc = None
        for k, z in enumerate((1.15, 1.2, 1.27)):                   # radial motion blur
            f = frame_from(P_PATH, z + 0.3 * u, 0.5, 0.55, (12 * math.sin(t * 37), 9 * math.cos(t * 31)))
            acc = f if acc is None else acc + f
        fr = acc / 3
        headlights(fr, 0.9)
        fr = lens(fr, 1.1, 1.3)
        blit(fr, D4, 540, 960, alpha=max(0, 1 - u / 0.4) * 0.8)
    elif t < 24.0:                                                  # @ND65
        u = t - 21.333
        fr = np.asarray(Image.fromarray(np.clip(r2.scene_G(47.5), 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10)), np.float32) * 0.6
        blit(fr, rc.UI_LIVE, 70, VIS0 + 90, anchor="l")
        k = ease_out(u / 0.18)
        blit(fr, r2.ND65, 540, 900 + 100 * (1 - k), alpha=min(1, u / 0.06), scale=1.08 - 0.08 * k)
        fr = lens(fr, 0.8, 0.4)
        pop(fr, E1, 1500, u, 1.333, 2.62)
    elif t < 25.333:                                                # four stabs
        k = int((t - 24.0) / 0.3333)
        u = t - 24.0 - k * 0.3333
        if k == 0:
            fr = frame_from(P_PATH, 1.4, 0.5, 0.5); mirror(fr, 1.0, t)
        elif k == 1:
            fr = np.zeros((H, W, 3), np.float32); blit(fr, gold("MASAN", 170), 540, 960)
            fr += np.exp(-(((XX - 540) / 600) ** 2 + ((YY - 960) / 500) ** 2))[..., None] * np.array([120, 8, 4.])
        elif k == 2:
            fr = frame_from(P_RUINS, 1.3, 0.5, 0.35) * 0.4; fr[1180:VIS1] *= 0.2; ghat(fr, t); torch(fr, t, 2.0); silhouette(fr, 0.75, x=700, base=1690)
        else:
            fr = np.zeros((H, W, 3), np.float32); blit(fr, gold("PLUTONIUM.", 140), 540, 960)
        fr = lens(fr, 1.2, 1.2)
        fr = zoomed(fr, 1.1 - 0.08 * ease_out(u / 0.2), 0.5, 0.5)
    elif t < 28.4:                                                  # title
        u = t - 25.333
        fr = frame_from(P_TITLE, 1.05 + 0.04 * u, 0.5, 0.45) * 0.55
        fr = fog(fr, t, 0.2)
        fr = lens(fr, 0.8, 0.6)
        items = [(rc.TITLE_LOGO, 820, 0.0, 1.0), (F_CH, 1080, 0.5, 0.0), (F_T1, 1170, 0.65, 0.0), (F_T2, 1260, 0.8, 0.0), (rc.AUTH, 1500, 1.2, 0.0)]
        for spr, y, t0, big in items:
            if u >= t0:
                dt = u - t0; k = ease_out(dt / 0.2)
                blit(fr, spr, 540, y + 14 * (1 - k), alpha=min(1, dt / 0.15) * min(1, (3.067 - u) / 0.3),
                     scale=(1.0 + (0.5 if big else 0.08) * (1 - k)) * (0.8 if spr is rc.AUTH else 1.0))
    else:                                                           # someone calls your name
        u = t - 28.4
        fr = np.zeros((H, W, 3), np.float32)
        if 0.25 < u < 1.0:
            blit(fr, F_PARTH, 540, 960, alpha=min(1, (u - 0.25) / 0.35) * 0.85)
        if u >= 1.0:
            fr += 255 * math.exp(-(u - 1.0) * 12)
    fr = scope(fr)
    shx = shy = fl = 0.0
    for s, a, amp in HITS:
        if 0 <= t - s < 0.6:
            e = math.exp(-(t - s) * 7)
            shx += amp * e * math.sin((t - s) * 75); shy += amp * 0.8 * e * math.cos((t - s) * 60)
            fl += a * math.exp(-(t - s) * 11)
    if abs(shx) + abs(shy) > 0.5:
        fr = zoomed(fr, 1.04, 0.5, 0.5, (shx, shy))
    if fl > 0:
        fr = fr + (255 - fr) * min(fl, 1)
    return fr


def render():
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-i", SCORE, "-filter_complex",
                            "[0:v]noise=c0s=7:c0f=t+u,format=yuv420p[v]",
                            "-map", "[v]", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-tune", "grain",
                            "-maxrate", "14M", "-bufsize", "28M", "-profile:v", "high", "-c:a", "aac", "-b:a", "256k",
                            "-movflags", "+faststart", "-t", str(LIMIT / FPS), OUT], stdin=subprocess.PIPE)
    for n in range(LIMIT):
        enc.stdin.write(np.clip(frame_at(n / FPS), 0, 255).astype(np.uint8).tobytes())
        if n % 150 == 0:
            print("frame", n, flush=True)
    enc.stdin.close(); enc.wait()
    print("done", OUT)


if __name__ == "__main__":
    if len(sys.argv) > 3:
        ts = [float(v) for v in sys.argv[3].split(",")]
        ims = [Image.fromarray(np.clip(frame_at(tt), 0, 255).astype(np.uint8)).resize((216, 384)) for tt in ts]
        sheet = Image.new("RGB", (216 * len(ims), 384))
        for i, im in enumerate(ims):
            sheet.paste(im, (216 * i, 0))
        sheet.save(OUT)
    else:
        render()
