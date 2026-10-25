"""Chapter Three trailer, 60s - 'The Water That Cost a Son' - on score_ch3.wav (90 bpm).

A verse -> MALETHA 0-8 | B the legend (dry village, Madho Singh, the tunnel, HIS SON) 8-18.67 |
C title | D the canal 21.33-26.67 | E Bachi Ram ji; the word changes -> BHIM SHILA 26.67-37.33 |
F songs are alive, Dronagiri | G Golu's cap | H Dhari Devi, 'your mother' 45.33-53.33 |
I the call, point four | J end 56-60.
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import render_ch1 as rc
import render_ch2 as r2
from render_ch1 import W, H, FPS, blit, plain, gold, zoomed, ease_out, ease_io, font
from render_ch2 import cap, sub, mono, pop, bars, river, XX, YY

D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "chapter3.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
SCORE = os.path.join(D, "score_ch3.wav")
B = 60 / 90
BAR = 4 * B
T_A, T_B, T_C, T_D, T_E, T_F, T_G, T_H, T_I, T_J = 0, 8.0, 18.667, 21.333, 26.667, 37.333, 42.667, 45.333, 53.333, 56.0
HITS = [(5.333, .5, 22), (12.0, .12, 6), (12.667, .12, 6), (13.333, .15, 8), (14.667, .2, 10), (17.333, .7, 28),
        (19.333, .3, 14), (20.0, .3, 14), (20.667, .5, 22), (32.0, .15, 8), (33.333, .2, 10), (34.667, .25, 12),
        (36.0, .6, 26), (46.667, .3, 12), (50.667, .6, 26), (56.0, .5, 20)]
rng = np.random.default_rng(31)
RED = (255, 140, 120)


def hand_line(text, size=62, col=(255, 232, 190)):
    return plain(text, rc.F_HAND, size, col, glow=6)


# ---------------------------------------------------------------- A: the verse -> MALETHA
PARCH = np.asarray(Image.fromarray(np.clip(rc.PAGE * 0.32, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32)
A_V1 = hand_line("Jahan paani ke badle beta diya,", 64)
A_V2 = hand_line("wahan se pehla paath liya…", 64)
A_SUB = sub("“Yeh toh har Garhwali bachcha jaanta hai.”", 52)
A_MAL = gold("MALETHA.", 170)
A_KM = mono("12 KM BACK THE WAY WE CAME", 34)


def scene_A(t):
    u = t - T_A
    fr = zoomed(PARCH, 1.0 + 0.05 * u) * rc.VIG
    fr *= min(1, u / 0.6)
    if u < 5.333:
        for spr, y, t0 in ((A_V1, 820, 0.4), (A_V2, 920, 1.6)):
            if u >= t0:
                p = min(1, (u - t0) / 0.9)
                s = spr.copy(); s[:, int(s.shape[1] * p):, 3] = 0
                blit(fr, s, 540, y)
        pop(fr, A_SUB, 540, 1500, u, 3.4, 5.3, big=0.15)
    else:
        fr *= 0.5
        dt = u - 5.333; k = ease_out(dt / 0.14)
        blit(fr, A_MAL, 540, 930, alpha=min(1, dt / 0.04), scale=1.7 - 0.7 * k)
        blit(fr, A_KM, 540, 1080, alpha=min(1, max(0, dt - 0.4) / 0.3))
    return fr


# ---------------------------------------------------------------- B: the legend
def terraces(green):
    fr = np.zeros((H, W, 3), np.float32)
    g = np.clip(YY / 700, 0, 1)[..., None]
    sky = (np.array([70, 90, 120.]) if green else np.array([150, 110, 70.]))
    fr += sky * (0.35 + 0.65 * g) * (0.55 if not green else 0.7)
    ridge = 560 + np.convolve(np.cumsum(rng.normal(0, 5, W)), np.ones(41) / 41, mode="same")
    ridge -= ridge.mean() - 560
    fr[YY > ridge[None, :]] = np.array([40, 46, 52.]) if green else np.array([70, 52, 40.])
    base = np.array([70, 110, 50.]) if green else np.array([150, 112, 62.])
    for i in range(16):
        y = 760 + i * 75 + 10 * np.sin(XX[0] / 180 + i)
        m = YY > y[None, :]
        shade = 0.75 + 0.25 * ((i % 2) * 2 - 1) * 0.5
        fr[m] = base * shade * (0.75 + i * 0.02)
        edge = np.abs(YY - y[None, :]) < 4
        fr[edge] = base * 0.45
    return fr * rc.VIG


DRY = terraces(False)
GREEN = terraces(True)
B_CAPS = [(mono("400 YEARS AGO", 44), 320, 0.05, 2.6), (cap("A DRY VILLAGE", 74, "pale"), 1450, 0.3, 2.6), (cap("ABOVE THE ALAKNANDA.", 72), 1550, 0.7, 2.6)]
B_MS = gold("MADHO SINGH", 120)
B_MS2 = gold("BHANDARI", 120, style="pale")
B_MS3 = plain("GENERAL OF THE GARHWAL KINGS", rc.F_SERIF, 40, (230, 215, 185), track=4)
B_SINGH = [cap("THE SINGH OF A LION.", 60, "pale"), cap("THE SINGH OF A COW'S HORN.", 56, "pale"), cap("AND MADHO SINGH.", 76)]
B_TUN = [cap("HE CUT A TUNNEL", 76, "pale"), cap("THROUGH THE MOUNTAIN.", 74)]
B_DRY = cap("THE WATER WOULD NOT FLOW.", 64)
B_WANT = cap("THE MOUNTAIN WANTED…", 72, "pale")
B_SON = gold("HIS SON.", 190)


def tunnel_frame(t, progress):
    fr = np.zeros((H, W, 3), np.float32) + np.array([10, 9, 12.])
    poly = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(poly)
    d.polygon([(-100, 1500), (540, 520), (1180, 1500)], fill=255)
    m = np.asarray(poly, np.float32) / 255
    fr += m[..., None] * np.array([58, 44, 36.]) * (0.6 + 0.4 * (YY / H)[..., None])
    for i in range(40):                                     # rock strata
        y = 600 + i * 24
        fr[y:y + 2] *= np.where(m[y:y + 2] > 0, 0.8, 1.0)[..., None]
    fr[1500:] = np.array([30, 26, 22.])
    # stream on the far side
    fr += np.exp(-(((XX - 1010) / 70) ** 2 + ((YY - 1380) / 30) ** 2))[..., None] * np.array([60, 120, 170.])
    # tunnel being cut, right to left
    x1 = 980 - 860 * progress
    tl = (XX > x1) & (XX < 980) & (np.abs(YY - 1340 - (XX - 540) * 0.02) < 14)
    fr[tl] = np.array([6, 5, 6.])
    glow = np.exp(-(((XX - x1) / 30) ** 2 + ((YY - 1340) / 30) ** 2)) * (progress < 0.999)
    fr += glow[..., None] * np.array([255, 170, 80.]) * 0.8
    # dry fields on the left
    fr[1440:1500, 0:200] = np.array([150, 112, 62.])
    return fr * rc.VIG


def scene_B(t):
    u = t - T_B
    if u < 2.667:
        fr = zoomed(DRY, 1.0 + 0.06 * u / 2.667, 0.5, 0.55)
        for spr, y, a, b in B_CAPS:
            pop(fr, spr, 540, y, u, a, b)
        return fr
    if u < 5.333:
        v = u - 2.667
        fr = np.zeros((H, W, 3), np.float32) + 6 + rc.LAMP_WARM * np.array([40, 20, 6.])
        pop(fr, B_MS, 540, 600, v, 0.0, 2.65, big=0.6)
        pop(fr, B_MS2, 540, 730, v, 0.15, 2.65, big=0.6)
        pop(fr, B_MS3, 540, 830, v, 0.4, 2.65, big=0.1)
        for i, spr in enumerate(B_SINGH):
            pop(fr, spr, 540, 1150 + i * 110, v, 1.333 + i * 0.667, 2.65)
        return fr
    v = u - 5.333
    prog = min(1, v / 1.25)
    fr = tunnel_frame(t, prog)
    if v < 2.667:
        pop(fr, B_TUN[0], 540, 330, v, 0.05, 2.6)
        pop(fr, B_TUN[1], 540, 430, v, 0.4, 2.6)
        if v >= 1.333:
            pop(fr, B_DRY, 540, 1680, v, 1.333, 2.6, big=0.3)
        return fr
    w = v - 2.667
    fr *= 0.55
    pop(fr, B_WANT, 540, 820, w, 0.05, 2.66, big=0.2)
    if w >= 1.333:
        fr *= 0.6
        dt = w - 1.333; k = ease_out(dt / 0.14)
        blit(fr, B_SON, 540, 1000, alpha=min(1, dt / 0.04), scale=1.8 - 0.8 * k)
    return fr


# ---------------------------------------------------------------- C: title
C_CH = gold("CHAPTER  THREE", 44, style="pale", bold=False, track=14)
C_L = [gold("THE WATER", 120, style="pale"), gold("THAT COST", 120), gold("A SON.", 160)]


def scene_C(t):
    u = t - T_C
    fr = np.zeros((H, W, 3), np.float32) + 5 + rc.LAMP_WARM * np.array([30, 14, 6.]) * (0.6 + 0.4 * math.sin(u * 8) ** 2)
    blit(fr, C_CH, 540, 640, alpha=min(1, u / 0.3))
    for i, spr in enumerate(C_L):
        t0 = 0.667 * (i + 1)
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.14)
            blit(fr, spr, 540, 800 + i * 165, alpha=min(1, dt / 0.05), scale=1 + 0.8 * (1 - k))
    return fr


# ---------------------------------------------------------------- D: the canal
D_CAPS = [(cap("THE CANAL IS TRUE.", 80), 1460, 0.1, 2.6), (cap("IT IS STILL RUNNING.", 66, "pale"), 1570, 1.333, 2.6),
          (cap("THE SACRIFICE", 76, "pale"), 1460, 2.7, 5.3), (cap("IS LEGEND.", 92), 1570, 3.0, 5.3),
          (sub("True and legend don't fight here. They share a bench.", 44), 1690, 4.0, 5.3)]


def scene_D(t):
    u = t - T_D
    fr = zoomed(GREEN, 1.04 + 0.05 * u / 5.3, 0.5, 0.6)
    y0 = 1130
    band = (np.abs(YY - y0 - (XX - 540) * 0.08) < 22)
    shimmer = 0.75 + 0.25 * np.sin(XX * 0.06 - t * 9 + YY * 0.1)
    fr[band] = (np.array([120, 175, 210.]) * shimmer[band][:, None])
    for spr, y, a, b in D_CAPS:
        pop(fr, spr, 540, y, u, a, b, big=0.3)
    return fr


# ---------------------------------------------------------------- E: Bachi Ram ji; the word changes
BRJ = rc.card("B", "BACHI RAM JI", "Ninety-one · Maletha", "Last of a shepherd family.")
E_SUBS = [(sub("“Woh aaya tha. Do din pehle. Sehgal.”"), 1.333, 2.6), (sub("“Usne mere pote ka naam liya.”"), 2.667, 3.95),
          (sub("“Haan. Bataya.”", 60), 4.0, 5.3)]


def verse(word, col):
    a = plain("pathar ne ", rc.F_HAND, 66, (240, 225, 200))
    b = plain(word, rc.F_HAND_B, 72, col, glow=8, glow_col=(255, 120, 60))
    c = plain(" roki", rc.F_HAND, 66, (240, 225, 200))
    h = max(x.shape[0] for x in (a, b, c)); w = sum(x.shape[1] for x in (a, b, c))
    out = np.zeros((h, w, 4), np.uint8); x = 0
    for s in (a, b, c):
        y = (h - s.shape[0]) // 2
        out[y:y + s.shape[0], x:x + s.shape[1]] = np.maximum(out[y:y + s.shape[0], x:x + s.shape[1]], s); x += s.shape[1]
    return out


E_VERSES = [verse("nadi", (255, 240, 220)), verse("Mandakini", (255, 200, 120)), verse("Kedar ki nadi", (255, 160, 110))]
E_HEAD = cap("HE SANG IT THREE TIMES.", 60, "pale")
E_HEAD2 = plain("ONE WORD CHANGED EVERY TIME.", rc.F_SERIF, 40, (230, 215, 185), track=4)
E_BHIM = gold("BHIM SHILA", 150)
E_2013 = mono("KEDARNATH · JUNE 2013", 44)


def scene_E(t):
    u = t - T_E
    if u < 5.333:
        fr = rc.CAST_BG.copy() * 0.85
        k = ease_out(u / 0.2)
        blit(fr, BRJ, 540, 880, alpha=min(1, u / 0.1), scale=1.1 - 0.1 * k + 0.012 * u)
        for spr, a, b in E_SUBS:
            pop(fr, spr, 540, 1560, u, a, b, big=0.15)
        return fr
    v = u - 5.333
    fr = np.zeros((H, W, 3), np.float32) + 6 + rc.LAMP_WARM * np.array([30, 16, 6.])
    blit(fr, E_HEAD, 540, 380, alpha=min(1, v / 0.25))
    blit(fr, E_HEAD2, 540, 470, alpha=min(1, v / 0.25))
    for i, spr in enumerate(E_VERSES):
        t0 = i * 1.333
        if v >= t0:
            dt = v - t0; k = ease_out(dt / 0.16)
            dim = 0.45 if (v >= t0 + 1.333 and v < 4.0) else 1.0
            blit(fr, spr, 540, 760 + i * 150, alpha=min(1, dt / 0.06) * dim, scale=1 + 0.5 * (1 - k))
    if v >= 4.0:
        dt = v - 4.0; k = ease_out(dt / 0.14)
        fr *= 0.55
        blit(fr, E_BHIM, 540, 1350, alpha=min(1, dt / 0.04), scale=1.7 - 0.7 * k)
        blit(fr, E_2013, 540, 1480, alpha=min(1, max(0, dt - 0.3) / 0.2))
    return fr


# ---------------------------------------------------------------- F: songs are alive -> Dronagiri
def kedar_night():
    fr = np.zeros((H, W, 3), np.float32)
    g = np.clip(YY / 900, 0, 1)[..., None]
    fr += np.array([5, 7, 14.]) * (1 - g) + np.array([16, 20, 34.]) * g
    poly = Image.new("L", (W, H), 0); d = ImageDraw.Draw(poly)
    d.polygon([(-200, 1100), (300, 420), (560, 640), (820, 380), (1300, 1100)], fill=255)
    m = np.asarray(poly, np.float32)[..., None] / 255
    fr = fr * (1 - m) + m * np.array([20, 24, 34.]) * (0.7 + 0.5 * np.clip((900 - YY) / 500, 0, 1))[..., None]
    snow = (m[..., 0] > 0) & (YY < 620)
    fr[snow] = fr[snow] * 0.4 + np.array([150, 160, 180.]) * 0.6
    fr[1100:] = np.array([14, 14, 18.])
    # temple silhouette + the great rock behind it
    t_im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(t_im)
    d.ellipse((560, 1080, 1000, 1360), fill=255)                                     # Bhim Shila
    d.rectangle((300, 1150, 560, 1420), fill=200)                                    # temple base
    d.polygon([(290, 1150), (430, 880), (570, 1150)], fill=200)                      # shikhara
    tm = np.asarray(t_im, np.float32) / 255
    fr = fr * (1 - tm[..., None]) + tm[..., None] * np.array([28, 24, 22.])
    fr += np.exp(-(((XX - 430) / 220) ** 2 + ((YY - 1250) / 200) ** 2))[..., None] * np.array([120, 70, 25.])
    return fr * rc.VIG


KEDAR = kedar_night() * 1.6 + 6
F_SUB = hand_line("“Bete, geet zinda hote hain.”", 66)
F_CAPS = [(cap("THE LAST VERSE?", 84), 1560, 2.667, 5.3)]
F_DRON = sub("“Woh hissa Dronagiri wale charwahe jaante hain.”", 50)


def scene_F(t):
    u = t - T_F
    fr = zoomed(KEDAR, 1.0 + 0.07 * u / 5.3, 0.5, 0.55)
    bars(fr)
    pop(fr, F_SUB, 540, 400, u, 0.1, 2.6, big=0.2)
    for spr, y, a, b in F_CAPS:
        pop(fr, spr, 540, 400, u, a, b)
    pop(fr, F_DRON, 540, 1600, u, 3.3, 5.3, big=0.15)
    return fr


# ---------------------------------------------------------------- G: Golu's cap
def cap_icon():
    im = Image.new("RGBA", (600, 460), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.pieslice((60, 80, 540, 560), 180, 360, fill=(62, 86, 130, 255))
    d.rounded_rectangle((40, 300, 560, 380), 30, fill=(52, 74, 112, 255))
    for x in range(80, 540, 26):
        d.line((x, 300, x + 10, 120 + abs(300 - x) * 0.35), fill=(80, 104, 150, 255), width=3)
    d.ellipse((270, 200, 330, 260), fill=(160, 140, 90, 255))
    d.ellipse((280, 50, 320, 90), fill=(70, 96, 140, 255))
    arr = np.asarray(im.filter(ImageFilter.GaussianBlur(1.2))).copy()
    fuzz = rng.normal(0, 10, arr.shape[:2] + (1,))
    arr[..., :3] = np.clip(arr[..., :3] + fuzz, 0, 255)
    return arr


CAP = cap_icon()
G_CAPS = [(cap("GOLU SPEAKS", 78, "pale"), 1250, 0.1, 2.6), (cap("REAL GARHWALI.", 90), 1360, 0.4, 2.6),
          (sub("An aunty straightened his cap like he was her nephew.", 42), 1490, 1.0, 2.6),
          (mono("HE TOLD US HE WAS FROM DELHI.", 40), 1620, 1.6, 2.6)]


def scene_G(t):
    u = t - T_G
    fr = rc.CAST_BG.copy() * 0.7
    fr += np.exp(-(((XX - 540) / 520) ** 2 + ((YY - 760) / 420) ** 2))[..., None] * np.array([20, 30, 50.])
    k = ease_out(u / 0.25)
    blit(fr, CAP, 540, 760 + 6 * math.sin(u * 3), alpha=min(1, u / 0.1), scale=1.15 - 0.15 * k)
    for spr, y, a, b in G_CAPS:
        pop(fr, spr, 540, y, u, a, b)
    return fr


# ---------------------------------------------------------------- H: Dhari Devi
def dhari_base():
    fr = r2.DEV.copy()
    fr[1260:] *= 0.5
    # raised temple platform with lamps
    fr[760:880, 300:780] = np.array([40, 34, 30.])
    fr[740:760, 280:800] = np.array([80, 60, 40.])
    fr += np.exp(-(((XX - 540) / 260) ** 2 + ((YY - 790) / 120) ** 2))[..., None] * np.array([200, 120, 50.]) * 0.6
    return fr


DHARI = dhari_base()


def man_sil():
    im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im)
    d.ellipse((470, 1260, 610, 1410), fill=255)
    d.rounded_rectangle((380, 1380, 700, 1760), 70, fill=255)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255


MAN = man_sil()


def logo_badge():
    im = Image.new("RGBA", (420, 420), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse((10, 10, 410, 410), outline=(230, 230, 235, 255), width=10)
    d.polygon([(80, 300), (170, 150), (220, 220), (270, 120), (350, 300)], outline=(230, 230, 235, 255), width=10)
    out = Image.new("RGBA", (700, 560), (0, 0, 0, 0))
    out.alpha_composite(im, (140, 0))
    d2 = ImageDraw.Draw(out)
    d2.text((350, 500), "SUMMIT SECRETS", font=font(rc.F_UI_B, 56), fill=(230, 230, 235, 255), anchor="mm")
    return np.asarray(out)


LOGO = logo_badge()
H_HEAD = cap("DHARI DEVI", 110)
H_HEAD2 = plain("ON THE ALAKNANDA", rc.F_SERIF, 38, (230, 215, 185), track=4)
H_SUBS = [(sub("“Mr Sehgal would like to meet you, Professor.”", 50), 1.95, 3.5),
          (sub("“He read your notebook last night. All of it.”", 50), 3.55, 5.3)]
H_MOM = [cap("ESPECIALLY THE PARTS", 72, "pale"), cap("ABOUT YOUR MOTHER.", 86)]


def scene_H(t):
    u = t - T_H
    fr = DHARI.copy()
    y0, y1, rv = river(t)
    fr[y0:y1] = rv * 0.8
    for lx in (380, 540, 700):
        fr += np.exp(-(((XX - lx) / 22) ** 2 + ((YY - 735) / 22) ** 2))[..., None] * np.array([255, 190, 110.]) * (0.8 + 0.2 * math.sin(t * 9 + lx))
    fr = fr * (1 - MAN * 0.95) + MAN * 6
    fr = zoomed(fr, 1.0 + 0.08 * ease_io(u / 8.0), 0.5, 0.6) * rc.VIG
    bars(fr)
    pop(fr, H_HEAD, 540, 380, u, 0.05, 1.3, big=0.5)
    pop(fr, H_HEAD2, 540, 480, u, 0.25, 1.3, big=0.1)
    if 1.333 <= u < 5.333:
        a = min(1, (u - 1.333) / 0.12)
        k = ease_out((u - 1.333) / 0.18)
        blit(fr, LOGO, 540, 520, alpha=a * 0.95, scale=0.75 - 0.1 * k)
    for spr, a, b in H_SUBS:
        pop(fr, spr, 540, 1600, u, a, b, big=0.12)
    if u >= 5.333:
        fr *= 0.5
        dt = u - 5.333
        for i, spr in enumerate(H_MOM):
            if dt >= i * 0.3:
                d2 = dt - i * 0.3; k = ease_out(d2 / 0.14)
                blit(fr, spr, 540, 900 + i * 120, alpha=min(1, d2 / 0.04), scale=1.6 - 0.6 * k)
    return fr


# ---------------------------------------------------------------- I: the call, point four
def call_ui(secs):
    im = Image.new("RGBA", (760, 520), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, 759, 519), 40, fill=(18, 20, 26, 230))
    d.ellipse((310, 50, 450, 190), fill=(60, 130, 90, 255))
    d.text((380, 120), "M", font=font(rc.F_UI_B, 70), fill=(255, 255, 255, 255), anchor="mm")
    d.text((380, 260), "Mummy", font=font(rc.F_UI_B, 64), fill=(255, 255, 255, 255), anchor="mm")
    d.text((380, 330), f"00:{secs:02d}", font=font(rc.F_UI_R, 44), fill=(200, 200, 210, 255), anchor="mm")
    d.ellipse((330, 400, 430, 500), fill=(220, 50, 60, 255))
    return np.asarray(im)


I_CAP = mono("40 SECONDS. TWO JOKES.", 44)
I_SH = [sub("“Chaar.”", 64), hand_line("“Tum akele nahi ho.”", 72)]


def scene_I(t):
    u = t - T_I
    fr = rc.CAST_BG.copy() * 0.6
    if u < 1.333:
        blit(fr, call_ui(min(40, int(u / 1.333 * 40))), 540, 860, alpha=min(1, u / 0.1))
        blit(fr, I_CAP, 540, 1250, alpha=min(1, max(0, u - 0.3) / 0.2))
    else:
        v = u - 1.333
        pop(fr, I_SH[0], 540, 860, v, 0.0, 1.32, big=0.3)
        pop(fr, I_SH[1], 540, 990, v, 0.35, 1.32, big=0.3)
    return fr


# ---------------------------------------------------------------- J: end card
J_CH = gold("CHAPTER  THREE", 44, style="pale", bold=False, track=14)
J_T1 = gold("THE WATER THAT", 58, style="pale")
J_T2 = gold("COST A SON", 72)


def scene_J(t):
    u = t - T_J
    fr = rc.CAST_BG.copy() * 0.5 + rc.LAMP_WARM * np.array([40, 22, 8.])
    items = [(J_CH, 330, 0.0), (J_T1, 430, 0.1), (J_T2, 515, 0.25), (rc.TITLE_LOGO, 820, 0.45),
             (rc.E_TAG, 1080, 0.85), (rc.E_TAG2, 1150, 1.05), (rc.AUTH, 1450, 1.25)]
    for spr, y, t0 in items:
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.25)
            blit(fr, spr, 540, y + 20 * (1 - k), alpha=min(1, dt / 0.2), scale=1.08 - 0.08 * k)
    return fr


SCENES = [(T_A, scene_A, 0.6), (T_B, scene_B, 0.3), (T_C, scene_C, 0.5), (T_D, scene_D, 0.3), (T_E, scene_E, 0.5),
          (T_F, scene_F, 0.6), (T_G, scene_G, 0.4), (T_H, scene_H, 0.3), (T_I, scene_I, 0.3), (T_J, scene_J, 1.0)]


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
