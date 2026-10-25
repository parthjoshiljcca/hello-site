"""Chapter Four trailer, 60s - 'The Rock That Stopped a River' - on score_ch4.wav (90 bpm).

A Kshitij's diary | B the registers | C Tilu Rauteli 8-18.67 | D 'bees saal' | E title |
F the trek, Bhalla at km 9 | G Kedarnath + Bhim Shila | H the 1966 register, RAWAT |
I the fog and the red jacket | J the empty bench | K end 56-60.
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import render_ch1 as rc
import render_ch3 as r3
from render_ch1 import W, H, FPS, blit, plain, gold, zoomed, ease_out, ease_io, font
from render_ch2 import cap, sub, mono, pop, bars, XX, YY

D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "chapter4.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
SCORE = os.path.join(D, "score_ch4.wav")
B = 60 / 90
BAR = 4 * B
T_A, T_B, T_C, T_D, T_E, T_F, T_G, T_H, T_I, T_J, T_K = 0, 5.333, 8.0, 18.667, 21.333, 24.0, 29.333, 34.667, 42.667, 50.667, 56.0
HITS = [(5.333, .3, 14), (8.0, .4, 18), (11.333, .15, 8), (12.0, .15, 8), (12.667, .15, 8), (16.0, .65, 28),
        (22.0, .3, 14), (22.667, .3, 14), (23.333, .5, 22), (26.667, .35, 16), (30.667, .35, 16), (33.333, .55, 24),
        (38.667, .4, 18), (45.333, .3, 14), (49.333, .45, 20), (54.667, .6, 28)]
rng = np.random.default_rng(41)
INK = (24, 36, 82)


def ink(text, size, col=INK, bold=False):
    f = rc.F_HAND_B if bold else rc.F_HAND
    s = plain(text, f, size, col, shadow=False)
    return s


def write_on(fr, spr, x_left, y, u, t0, dur=0.6, alpha=1.0):
    if u >= t0:
        p = min(1, (u - t0) / dur)
        s = spr.copy(); s[:, int(s.shape[1] * p):, 3] = 0
        blit(fr, s, x_left + s.shape[1] / 2, y, alpha=alpha)


# ---------------------------------------------------------------- A/B: the diary, the registers
DIARY = np.asarray(Image.fromarray(np.clip(rc.PAGE, 0, 255).astype(np.uint8)), np.float32)
A_LINES = [(ink("pathar ne nadi roki", 60), 560, 0.2), (ink("pathar ne Mandakini roki", 60), 680, 0.6),
           (ink("pathar ne Kedar ki nadi roki", 60), 800, 1.0)]
A_SUB = sub("“Rohan galat jagah ja raha hai.”", 60)
B_CAPS = [(cap("THE PRIESTS OF KEDARNATH", 64, "pale"), 1380, 0.05), (cap("WRITE DOWN EVERY PILGRIM.", 70), 1480, 0.4),
          (mono("GENERATION AFTER GENERATION.", 40), 1580, 0.9)]


def ledger_base():
    p = np.zeros((H, W, 3), np.float32) + np.array([206, 186, 146.])
    p += rng.normal(0, 8, (H, W, 1))
    blot = np.asarray(Image.fromarray(rng.integers(0, 255, (40, 24), dtype=np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
    p *= (0.82 + 0.22 * blot[..., None])
    for y in range(260, H, 90):
        p[y:y + 2] *= 0.8
    p[:, 150:153] = p[:, 150:153] * 0.6 + np.array([150, 40, 30.]) * 0.4
    p[:, 860:863] = p[:, 860:863] * 0.6 + np.array([150, 40, 30.]) * 0.4
    return p * rc.vignette(0.65, 1.8)


LEDGER = ledger_base()


def scene_A(t):
    u = t - T_A
    fr = zoomed(DIARY, 1.0 + 0.04 * u) * rc.VIG
    fr *= min(1, u / 0.4)
    blit(fr, plain("KSHITIJ'S DIARY · DAY 4", rc.F_MONO_B, 36, (60, 50, 40), shadow=False), 540, 300)
    for spr, y, t0 in A_LINES:
        write_on(fr, spr, 140, y, u, t0, 0.5)
    if u > 2.0:                                         # circle the changed word
        k = min(1, (u - 2.0) / 0.6)
        ang = np.arctan2(YY - 800, (XX - 560) / 2.2)
        ring = (np.abs(np.hypot((XX - 560) / 2.2, YY - 800) - 70) < 4) & (ang < -math.pi + 2 * math.pi * k)
        fr[ring] = np.array([170, 40, 30.])
    if u >= 2.6:
        shade = np.concatenate([np.zeros(H - 700), np.linspace(0, 0.9, 700)])[:, None, None]
        fr *= (1 - shade * min(1, (u - 2.6) / 0.2))
    pop(fr, A_SUB, 540, 1560, u, 2.7, 5.3, big=0.2)
    return fr


def scene_B(t):
    u = t - T_B
    fr = zoomed(LEDGER, 1.06 - 0.04 * u / 2.667, 0.5, 0.45) * 0.75
    for i, y in enumerate(range(420, 1200, 90)):
        if u > 0.15 * i:
            nm = ink(["Raghunath Prasad, 1931", "Smt. Kamla Devi, 1948", "Jagat Singh & family, 1952", "Hira Lal, 1957",
                      "Mohan Chand, 1961", "Puran Singh, 1963", "Govind Ram, 1964", "Bhagwati Devi, 1965", "…"][i % 9], 44, (40, 30, 50))
            blit(fr, nm, 190 + nm.shape[1] / 2, y, alpha=min(1, (u - 0.15 * i) / 0.2) * 0.85)
    shade = np.concatenate([np.zeros(H - 640), np.linspace(0, 0.85, 640)])[:, None, None]
    fr *= (1 - shade)
    for spr, y, t0 in B_CAPS:
        pop(fr, spr, 540, y, u, t0, 2.65)
    return fr


# ---------------------------------------------------------------- C/D: Tilu Rauteli
def sword():
    im = Image.new("RGBA", (220, 1100), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.polygon([(110, 0), (140, 120), (138, 760), (82, 760), (80, 120)], fill=(210, 205, 200, 255))
    d.line((110, 40, 110, 750), fill=(255, 255, 255, 200), width=3)
    d.rounded_rectangle((10, 760, 210, 800), 16, fill=(200, 150, 60, 255))
    d.rounded_rectangle((90, 800, 130, 1010), 10, fill=(90, 50, 30, 255))
    d.ellipse((75, 1000, 145, 1070), fill=(200, 150, 60, 255))
    arr = np.asarray(im).copy()
    g = np.asarray(im.split()[3].filter(ImageFilter.GaussianBlur(14)), np.float32) / 255
    return arr, g


SWORD, SWORD_G = sword()
C_TOP = mono("17TH CENTURY · CHAUNDKOT, GARHWAL", 34)
C_NAME = gold("TILU RAUTELI", 104)
C_15 = gold("FIFTEEN.", 150)
C_LOSS = [cap("HER FATHER.", 76, "pale"), cap("HER TWO BROTHERS.", 76, "pale"), cap("THE MAN SHE WAS TO MARRY.", 62, "pale")]
C_MOM = sub("“Tilu, tujhe mela yaad hai? Apne bhai yaad nahi?”", 50)
C_FAIR = cap("SHE DIDN'T GO TO THE FAIR.", 66, "pale")
C_WAR = gold("SHE WENT TO WAR.", 96)
C_SEVEN = [cap("SEVEN WARS.", 84), mono("FROM FIFTEEN TO TWENTY.", 44)]
D_L1 = sub("“Bees saal, didi.”", 62)
D_L2 = hand_line = r3.hand_line("“Aur teen sau saal se log gaate hain.”", 58)
D_L3 = sub("“Bhalla bada hai.", 60)
D_L4 = r3.hand_line("Tilu ke dushman bhi bade the.”", 66, (255, 205, 160))


def war_bg(t, heat=1.0):
    fr = np.zeros((H, W, 3), np.float32) + 4
    flick = 0.8 + 0.2 * math.sin(t * 11) * math.sin(t * 3.7)
    fr += np.exp(-(((XX - 540) / 700) ** 2 + ((YY - 1100) / 900) ** 2))[..., None] * np.array([120, 30, 12.]) * flick * heat
    return fr


def scene_C(t):
    u = t - T_C
    fr = war_bg(t, 0.6 + 0.4 * min(1, u / 8))
    # the sword rises behind the words
    sy = 1500 - 560 * ease_out(u / 2.0)
    blit(fr, SWORD, 540, sy, alpha=0.35 + 0.25 * min(1, u / 2))
    if u < 2.667:
        pop(fr, C_TOP, 540, 380, u, 0.05, 2.6, big=0.1)
        pop(fr, C_NAME, 540, 520, u, 0.667, 2.6, big=0.7)
    elif u < 5.333:
        v = u - 2.667
        pop(fr, C_15, 540, 520, v, 0.0, 2.65, big=0.6)
        for i, spr in enumerate(C_LOSS):
            pop(fr, spr, 540, 1350 + i * 110, v, 0.667 * (i + 1), 2.65)
    elif u < 8.0:
        v = u - 5.333
        pop(fr, C_MOM, 540, 560, v, 0.05, 2.65, big=0.15)
        pop(fr, C_FAIR, 540, 1450, v, 1.333, 2.65)
    else:
        v = u - 8.0
        fr *= 1.0 + 0.6 * math.exp(-v * 3)
        k = ease_out(v / 0.14)
        blit(fr, C_WAR, 540, 560, alpha=min(1, v / 0.04), scale=1.7 - 0.7 * k)
        pop(fr, C_SEVEN[0], 540, 1440, v, 1.333, 2.66)
        pop(fr, C_SEVEN[1], 540, 1540, v, 1.6, 2.66, big=0.1)
    return fr


def scene_D(t):
    u = t - T_D
    fr = war_bg(t, 0.35) + rc.LAMP_WARM * np.array([20, 12, 4.])
    pop(fr, D_L1, 540, 760, u, 0.05, 1.3)
    pop(fr, D_L2, 540, 880, u, 0.4, 1.3)
    pop(fr, D_L3, 540, 1000, u, 1.333, 2.65)
    pop(fr, D_L4, 540, 1120, u, 1.6, 2.65)
    return fr


# ---------------------------------------------------------------- E: title
E_CH = gold("CHAPTER  FOUR", 44, style="pale", bold=False, track=14)
E_L = [gold("THE ROCK", 130, style="pale"), gold("THAT STOPPED", 112), gold("A RIVER.", 150)]


def scene_E(t):
    u = t - T_E
    fr = np.zeros((H, W, 3), np.float32) + 5 + rc.LAMP_WARM * np.array([30, 14, 6.]) * (0.6 + 0.4 * math.sin(u * 8) ** 2)
    blit(fr, E_CH, 540, 640, alpha=min(1, u / 0.3))
    for i, spr in enumerate(E_L):
        t0 = 0.667 * (i + 1)
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.14)
            blit(fr, spr, 540, 800 + i * 165, alpha=min(1, dt / 0.05), scale=1 + 0.8 * (1 - k))
    return fr


# ---------------------------------------------------------------- F: the trek
def trail_base():
    fr = np.zeros((H, W, 3), np.float32)
    g = np.clip(YY / H, 0, 1)[..., None]
    fr += np.array([150, 160, 170.]) * (1 - g) * 0.6 + np.array([50, 60, 52.]) * g
    pts = []
    y = 1850
    x = 200
    while y > 320:
        nx = 880 if x < 540 else 200
        pts.append(((x, y), (nx, y - 170)))
        x, y = nx, y - 170
    im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im)
    for (a, b) in pts:
        d.line((a, b), fill=255, width=26)
    m = np.asarray(im.filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
    fr = fr * (1 - m) + m * np.array([120, 100, 80.])
    return fr * rc.VIG, pts


TRAIL, TRAIL_PTS = trail_base()
SEG_LEN = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in TRAIL_PTS]
TOTAL_LEN = sum(SEG_LEN)


def trail_pos(s):
    s = (s % 1.0) * TOTAL_LEN
    for (a, b), L in zip(TRAIL_PTS, SEG_LEN):
        if s <= L:
            k = s / L
            return a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k
        s -= L
    return TRAIL_PTS[-1][1]


WALKERS = [rng.uniform(0, 1) for _ in range(70)]
F_TOP = mono("GAURIKUND → KEDARNATH · 16 KM · UPHILL", 34)
F_KM = mono("KM 9", 60)
F_BH = gold("BHALLA.", 130)
F_SUB = sub("“Mat dekho. Chalte raho.”", 60)
BH_S = 0.42


def dot(fr, x, y, r, col):
    xi, yi = int(x), int(y)
    ys, xs = slice(max(yi - r, 0), min(yi + r + 1, H)), slice(max(xi - r, 0), min(xi + r + 1, W))
    sub_ = (XX[ys, xs] - x) ** 2 + (YY[ys, xs] - y) ** 2 < r * r
    fr[ys, xs][sub_] = col


def scene_F(t):
    u = t - T_F
    fr = TRAIL.copy()
    for s0 in WALKERS:
        x, y = trail_pos(s0 + u * 0.012)
        dot(fr, x, y, 9, np.array([240, 200, 40.]))
    bx, by = trail_pos(BH_S)
    dot(fr, bx, by, 12, np.array([10, 10, 12.]))
    z = 1.0 if u < 2.667 else 1.0 + 0.9 * ease_io((u - 2.667) / 0.6)
    cx, cy = (0.5, 0.5) if u < 2.667 else (0.5 + (bx / W - 0.5) * ease_io((u - 2.667) / 0.6), 0.5 + (by / H - 0.5) * ease_io((u - 2.667) / 0.6))
    fr = zoomed(fr, z, cx, cy)
    if u >= 2.667:
        ring = np.abs(np.hypot(XX - 540, YY - 960) - 90 - 10 * math.sin(t * 8)) < 5
        fr[ring] = np.array([220, 40, 40.])
    blit(fr, F_TOP, 540, 250, alpha=min(1, u / 0.3))
    pop(fr, F_KM, 540, 1400, u, 1.4, 2.65, big=0.2)
    pop(fr, F_BH, 540, 1450, u, 2.667, 5.3, big=0.6)
    pop(fr, F_SUB, 540, 1580, u, 3.6, 5.3, big=0.15)
    return fr


# ---------------------------------------------------------------- G: Kedarnath, Bhim Shila, the flood splitting
G_CAPS = [(mono("KEDARNATH · JUNE 2013", 40), 300, 0.05, 5.3), (cap("THE FLOOD CAME DOWN.", 72, "pale"), 1460, 0.1, 1.3),
          (cap("THIS ROCK STOPPED.", 86), 1460, 1.333, 2.65), (cap("THE WATER SPLIT AROUND IT.", 64, "pale"), 1460, 2.667, 3.95),
          (gold("THE TEMPLE STOOD.", 92), 1480, 4.0, 5.33)]
FLOOD = [dict(x=rng.uniform(380, 1080), y=rng.uniform(-200, 900), v=rng.uniform(500, 900)) for _ in range(90)]


def scene_G(t):
    u = t - T_G
    fr = r3.KEDAR.copy() * 0.9
    # muddy water streaks coming down and splitting around the boulder (centre ~780,1220)
    for p in FLOOD:
        y = (p["y"] + p["v"] * u) % 1300 - 150
        x = p["x"]
        if 1050 < y < 1400 and 520 < x < 1040:
            x = 520 if x < 780 else 1040                        # pushed round the rock
        L = 50
        y0, y1 = int(max(y, 0)), int(min(y + L, H))
        if y0 < y1 and 0 <= int(x) < W - 3:
            fr[y0:y1, int(x):int(x) + 3] = fr[y0:y1, int(x):int(x) + 3] * 0.4 + np.array([150, 130, 100.]) * 0.6
    fr = zoomed(fr, 1.0 + 0.06 * u / 5.3, 0.5, 0.6)
    bars(fr)
    for spr, y, a, b in G_CAPS:
        pop(fr, spr, 540, y, u, a, b, big=0.4)
    return fr


# ---------------------------------------------------------------- H: the 1966 register
H_HEAD = ink("Jyeshth, 1966", 70, (60, 30, 30), bold=True)
H_FROM = ink("— pilgrims from Dronagiri", 50, (60, 40, 40))
H_NAMES = [ink("Pratap Singh Rawat", 66), ink("Bhawan Singh", 66), ink("Kundan Singh", 66)]
H_MARGIN = ink("Garam pathar.", 62, (150, 30, 30), bold=True)
H_Q = cap("WHY DOES THAT NAME", 62, "pale")
H_Q2 = cap("FEEL IMPORTANT?", 74)


def scene_H(t):
    u = t - T_H
    fr = zoomed(LEDGER, 1.02 + 0.03 * u / 8, 0.5, 0.5)
    write_on(fr, H_HEAD, 190, 420, u, 0.2, 0.7)
    write_on(fr, H_FROM, 190, 520, u, 0.8, 0.6)
    for i, spr in enumerate(H_NAMES):
        write_on(fr, spr, 190, 700 + i * 130, u, 1.333 + 0.667 * i, 0.6)
    if u >= 4.0:                                    # margin note, rotated, in another hand
        k = min(1, (u - 4.0) / 0.5)
        s = np.asarray(Image.fromarray(H_MARGIN, "RGBA").rotate(-6, expand=True, resample=Image.BICUBIC)).copy()
        s[:, int(s.shape[1] * k):, 3] = 0
        blit(fr, s, 880, 1080)
    if u >= 5.333:                                  # RAWAT underlined twice
        for j in range(2):
            if u >= 5.333 + 0.333 * j:
                k = min(1, (u - 5.333 - 0.333 * j) / 0.25)
                x0 = 190 + int(H_NAMES[0].shape[1] * 0.62)
                x1 = x0 + int(H_NAMES[0].shape[1] * 0.36 * k)
                fr[740 + j * 12:744 + j * 12, x0:x1] = np.array([150, 30, 30.])
        shade = np.concatenate([np.zeros(H - 560), np.linspace(0, 0.85, 560)])[:, None, None]
        fr *= (1 - shade)
        pop(fr, H_Q, 540, 1520, u, 6.0, 8.0)
        pop(fr, H_Q2, 540, 1620, u, 6.3, 8.0)
    return fr * rc.VIG


# ---------------------------------------------------------------- I: the fog, the red jacket
FOG = np.asarray(Image.fromarray(rng.integers(0, 255, (24, 14), dtype=np.uint8)).resize((W + 400, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(60)), np.float32) / 255
I_CAPS = [(cap("THE FOG CAME DOWN.", 80), 1460, 0.05, 1.3), (sub("“Mujhe do minute do.”", 62), 1460, 1.333, 2.65),
          (cap("SHE HUNG HER RED JACKET", 66, "pale"), 1460, 2.667, 5.3), (cap("ON A SIGNBOARD.", 80), 1560, 3.0, 5.3),
          (sub("“Usne pandrah minute ek jacket se baat ki.”", 50), 1500, 5.333, 6.65)]
I_TILU = gold("TILU RAUTELI.", 100)
I_LOGIC = gold("LOGIC.", 120, style="pale")


def jacket():
    im = Image.new("RGBA", (300, 380), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle((140, 0, 160, 380), fill=(60, 50, 40, 255))
    d.rectangle((40, 40, 260, 120), fill=(90, 80, 60, 255))
    d.polygon([(70, 120), (230, 120), (270, 330), (30, 330)], fill=(205, 30, 40, 255))
    d.polygon([(70, 120), (20, 140), (0, 290), (40, 290)], fill=(185, 25, 35, 255))
    d.polygon([(230, 120), (280, 140), (300, 290), (260, 290)], fill=(185, 25, 35, 255))
    return np.asarray(im)


JACKET = jacket()


def scene_I(t):
    u = t - T_I
    fr = np.zeros((H, W, 3), np.float32) + np.array([60, 64, 70.])
    off = int(u * 30) % 400
    fog = FOG[:, off:off + W]
    fr = fr + fog[..., None] * np.array([150, 155, 160.])
    if u >= 2.667:                                  # the red jacket emerges from the white
        a = min(1, (u - 2.667) / 0.25)
        blit(fr, JACKET, 760, 980, alpha=a * (0.65 + 0.35 * (u > 4.0)))
    if u >= 4.0:                                    # a torch sweeps and finds the red
        ang = math.radians(200 + 25 * ease_io((u - 4.0) / 1.2))
        sx, sy = 120, 1250
        dx, dy = math.cos(ang + math.pi), math.sin(ang + math.pi)
        px, py = XX - sx, YY - sy
        along = px * dx + py * dy
        perp = np.abs(-px * dy + py * dx)
        cone = np.exp(-(perp / (30 + along * 0.25).clip(1)) ** 2) * (along > 0) * np.exp(-along / 1400)
        fr += cone[..., None] * np.array([255, 245, 210.]) * 0.6
    fr = fr * (0.85 + 0.15 * fog[..., None])
    shade = np.concatenate([np.zeros(H - 620), np.linspace(0, 0.8, 620)])[:, None, None]
    fr *= (1 - shade)
    for spr, y, a, b in I_CAPS:
        pop(fr, spr, 540, y, u, a, b, big=0.25)
    if u >= 6.667:
        fr *= 0.6
        dt = u - 6.667
        k = ease_out(dt / 0.14)
        blit(fr, I_TILU, 540, 860, alpha=min(1, dt / 0.04), scale=1.6 - 0.6 * k)
        if dt > 0.4:
            k2 = ease_out((dt - 0.4) / 0.14)
            blit(fr, I_LOGIC, 540, 1010, alpha=min(1, (dt - 0.4) / 0.04), scale=1.6 - 0.6 * k2)
    return fr * rc.VIG


# ---------------------------------------------------------------- J: the empty bench
def bench_base():
    fr = np.zeros((H, W, 3), np.float32) + np.array([6, 7, 10.])
    fr += np.exp(-(((XX - 540) / 520) ** 2 + ((YY - 300) / 500) ** 2))[..., None] * np.array([90, 70, 40.])   # door light
    fr[1180:1220, 160:920] = np.array([60, 44, 32.])                                     # bench seat
    fr[1220:1420, 200:230] = np.array([40, 30, 22.]); fr[1220:1420, 850:880] = np.array([40, 30, 22.])
    return fr * rc.VIG


BENCH = bench_base()
J_WORDS = "Golu was not on the trail today. First time since Mussoorie he hasn't turned up. Where is h"
J_LINES = ["Golu was not on the trail today.", "First time since Mussoorie", "he hasn't turned up.", "Where is h"]
J_SPR = [ink(s, 34) for s in J_LINES]
J_CAP1 = cap("KSHITIJ NEVER", 84, "pale")
J_CAP2 = cap("LEAVES HIS DIARY.", 88)
J_NOT = gold("NOT EVER.", 160)


CLOSE = np.zeros((H, W, 3), np.float32) + np.array([226, 216, 192.])
CLOSE += rng.normal(0, 6, (H, W, 1))
for _y in range(560, 1500, 90):
    CLOSE[_y:_y + 2] = CLOSE[_y:_y + 2] * 0.85 + np.array([170, 186, 210.]) * 0.15
CLOSE = CLOSE * rc.vignette(0.7, 1.8)
J_BIG = [ink(s_, 58) for s_ in J_LINES]


def scene_J(t):
    u = t - T_J
    if u < 0.9:                                   # wide: the empty bench, the open diary
        fr = BENCH.copy()
        page = np.zeros((300, 460, 3), np.float32) + np.array([226, 216, 192.])
        page[:, 228:232] = np.array([120, 100, 80.])
        blit(fr, np.dstack([page, np.full((300, 460), 255.)]).astype(np.uint8), 540, 1110)
        fr[1100:1104, 540:700] = np.array([30, 30, 40.])
        return zoomed(fr, 1.0 + 0.15 * u, 0.5, 1110 / H)
    v = u - 0.9
    fr = zoomed(CLOSE, 1.0 + 0.03 * v, 0.5, 0.5)
    y, t0 = 640, 0.0
    for i, s_ in enumerate(J_BIG):
        if v >= t0:
            p = min(1, (v - t0) / 0.45)
            ss = s_.copy(); ss[:, int(ss.shape[1] * p):, 3] = 0
            blit(fr, ss, 110 + ss.shape[1] / 2, y + i * 90)
        t0 += 0.45
    if v > t0 and int(v * 3) % 2 == 0:            # the line just stops
        x = 110 + J_BIG[-1].shape[1] - 12
        fr[y + 270 - 28:y + 270 + 28, x:x + 5] = np.array([24, 36, 82.])
    if u >= 2.667:
        shade = np.concatenate([np.zeros(H - 700), np.linspace(0, 0.92, 700)])[:, None, None]
        fr *= (1 - shade)
        pop(fr, J_CAP1, 540, 1480, u, 2.667, 4.0)
        pop(fr, J_CAP2, 540, 1590, u, 2.9, 4.0)
    if u >= 4.0:
        fr *= 0.12
        dt = u - 4.0; k = ease_out(dt / 0.14)
        blit(fr, J_NOT, 540, 960, alpha=min(1, dt / 0.04), scale=1.7 - 0.7 * k)
    return fr


# ---------------------------------------------------------------- K: end card
K_CH = gold("CHAPTER  FOUR", 44, style="pale", bold=False, track=14)
K_T1 = gold("THE ROCK THAT", 58, style="pale")
K_T2 = gold("STOPPED A RIVER", 72)


def scene_K(t):
    u = t - T_K
    fr = rc.CAST_BG.copy() * 0.5 + rc.LAMP_WARM * np.array([40, 22, 8.])
    items = [(K_CH, 330, 0.0), (K_T1, 430, 0.1), (K_T2, 515, 0.25), (rc.TITLE_LOGO, 820, 0.45),
             (rc.E_TAG, 1080, 0.85), (rc.E_TAG2, 1150, 1.05), (rc.AUTH, 1450, 1.25)]
    for spr, y, t0 in items:
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.25)
            blit(fr, spr, 540, y + 20 * (1 - k), alpha=min(1, dt / 0.2), scale=1.08 - 0.08 * k)
    return fr


SCENES = [(T_A, scene_A, 0.0), (T_B, scene_B, 0.3), (T_C, scene_C, 0.6), (T_D, scene_D, 0.6), (T_E, scene_E, 0.5),
          (T_F, scene_F, 0.0), (T_G, scene_G, 0.5), (T_H, scene_H, 0.0), (T_I, scene_I, 0.0), (T_J, scene_J, 0.4),
          (T_K, scene_K, 1.0)]


def frame_at(t):
    for start, fn, dust_amt in reversed(SCENES):
        if t >= start:
            fr = fn(t)
            rc.dust(fr, t, dust_amt)
            break
    shx = shy = fl = 0.0
    for s, a, amp in HITS:
        if 0 <= t - s < 0.6:
            e = math.exp(-(t - s) * 7)
            shx += amp * e * math.sin((t - s) * 75); shy += amp * 0.8 * e * math.cos((t - s) * 60)
            fl += a * math.exp(-(t - s) * 10)
    if abs(shx) + abs(shy) > 0.5:
        fr = zoomed(fr, 1.04, 0.5, 0.5, (shx, shy))
    if fl > 0:
        fr = fr + (255 - fr) * min(fl, 1)
    return fr


def render():
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-i", SCORE, "-filter_complex",
                            "[0:v]noise=c0s=6:c0f=t+u,fade=t=in:st=0:d=0.3,fade=t=out:st=59.3:d=0.7,format=yuv420p[v]",
                            "-map", "[v]", "-map", "1:a", "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-tune", "grain",
                            "-profile:v", "high", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart",
                            "-t", str(LIMIT / FPS), OUT], stdin=subprocess.PIPE)
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
