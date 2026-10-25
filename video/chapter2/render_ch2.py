"""Chapter Two trailer, 60s - 'Rule One: Never Look Back at the Ghat' - on score_ch2.wav (90 bpm).

A night road + SUV 0-8 | B the search -> PLUTONIUM 8-13.33 | C title hits | D Gabbar's rules +
the ghosts 16-26.67 | E high beams 26.67, headlights off 29.33 | F Devprayag, the torch, Masan,
he looked back 42.67, escape 44 | G the dhaba fire, the song | H @ND65 | I end card 56-60.
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import render_ch1 as rc
from render_ch1 import W, H, FPS, blit, plain, gold, zoomed, ease_out, ease_io, font

D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "chapter2.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
SCORE = os.path.join(D, "score_ch2.wav")
B = 60 / 90
BAR = 4 * B
T_A, T_B, T_C, T_D, T_E, T_OFF, T_F, T_LOOK, T_ESC, T_G, T_H, T_I = 0, 8.0, 13.333, 16.0, 26.667, 29.333, 34.667, 42.667, 44.0, 45.333, 53.333, 56.0
HITS = [(12.0, .55, 24), (14.0, .3, 14), (14.667, .3, 14), (15.333, .5, 22), (16.0, .12, 6), (18.667, .12, 6), (21.333, .12, 6),
        (24.0, .3, 14), (24.889, .3, 14), (25.778, .3, 14), (26.667, .7, 26), (34.667, .45, 18), (42.667, .6, 30),
        (44.0, .6, 24), (53.333, .4, 22), (56.0, .5, 20)]
rng = np.random.default_rng(21)
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)


def cap(text, size=70, style="gold"):
    return gold(text, size, style=style)


def sub(text, size=54):
    return plain(text, rc.F_HAND, size, (255, 246, 225))


def mono(text, size=44):
    return plain(text, rc.F_MONO_B, size, (240, 228, 200), track=5)


def pop(fr, spr, cx, cy, u, t0, t1, big=0.45):
    if t0 <= u < t1:
        dt = u - t0; k = ease_out(dt / 0.16)
        blit(fr, spr, cx, cy + 8 * (1 - k), alpha=min(1, dt / 0.06) * min(1, (t1 - u) / 0.14), scale=1 + big * (1 - k))


def bars(fr, h=170):
    fr[:h] = 0; fr[H - h:] = 0


# ---------------------------------------------------------------- night road (windshield view)
VX, VY = 540, 820


def road_base():
    sky = np.zeros((H, W, 3), np.float32)
    g = np.clip(YY / VY, 0, 1)[..., None]
    sky += np.array([6, 9, 20.]) * (1 - g) + np.array([22, 30, 52.]) * g
    stars = (rng.random((H, W)) > 0.9993) & (YY < VY - 120)
    sky[stars] = 190
    ridge = VY - 160 + np.convolve(np.cumsum(rng.normal(0, 5, W)), np.ones(25) / 25, mode="same")
    ridge -= ridge.mean() - (VY - 170)
    m = YY > ridge[None, :]
    sky[m] = np.array([3, 4, 8.])
    return sky


ROAD_BASE = road_base()
DASH = Image.new("RGBA", (W, H))


def road_frame(t, lights=1.0, speed=1.0, sway=True, mirror=0.0, flood=0.0):
    fr = ROAD_BASE.copy()
    sx = 10 * math.sin(t * 0.9) if sway else 0
    # road surface lit by our headlights
    near_w, far_w = 1500, 40
    poly = Image.new("L", (W, H), 0)
    dd = ImageDraw.Draw(poly)
    dd.polygon([(VX - far_w / 2 + sx * 0.2, VY), (VX + far_w / 2 + sx * 0.2, VY), (VX + near_w / 2 + sx, H), (VX - near_w / 2 + sx, H)], fill=255)
    pm = np.asarray(poly, np.float32) / 255
    depth = np.clip((YY - VY) / (H - VY), 0, 1)
    lit = pm * (0.06 + 0.94 * depth ** 1.6) * lights
    fr += lit[..., None] * np.array([120, 112, 96.])
    # moving centre dashes
    if lights > 0.02:
        im = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(im)
        for k in range(14):
            s = ((k / 14) + t * 0.55 * speed) % 1.0
            y0 = VY + (H - VY) * s ** 2.2
            y1 = VY + (H - VY) * min(1, (s + 0.035)) ** 2.2
            w0, w1 = 2 + 26 * s ** 2.2, 2 + 26 * min(1, s + 0.035) ** 2.2
            x0, x1 = VX + sx * s, VX + sx * min(1, s + 0.035)
            d.polygon([(x0 - w0 / 2, y0), (x0 + w0 / 2, y0), (x1 + w1 / 2, y1), (x1 - w1 / 2, y1)], fill=255)
        dm = np.asarray(im, np.float32)[..., None] / 255
        fr = fr * (1 - dm) + dm * np.array([230, 210, 150.]) * (0.3 + 0.7 * depth[..., None]) * lights
    # dashboard silhouette
    fr[1700:] *= 0.05
    fr[1690:1700] *= 0.3
    # rear-view mirror with the SUV's headlights
    mx0, my0, mx1, my1 = 330, 150, 750, 330
    fr[my0:my1, mx0:mx1] = fr[my0:my1, mx0:mx1] * 0.25 + 8
    if mirror > 0:
        for cx in (480, 600):
            gl = np.exp(-(((XX[my0:my1, mx0:mx1] - cx) / (14 + 30 * mirror)) ** 2 + ((YY[my0:my1, mx0:mx1] - 250) / (10 + 16 * mirror)) ** 2))
            fr[my0:my1, mx0:mx1] += gl[..., None] * np.array([255, 245, 220.]) * min(1, 0.4 + mirror)
    fr[my0:my0 + 6, mx0:mx1] = 40; fr[my1 - 6:my1, mx0:mx1] = 40
    fr[my0:my1, mx0:mx0 + 6] = 40; fr[my0:my1, mx1 - 6:mx1] = 40
    if flood > 0:                                   # high beams from behind fill the cabin
        f = np.exp(-(((XX - 540) / 900) ** 2 + ((YY - 200) / 1100) ** 2)) * flood
        fr += f[..., None] * np.array([255, 250, 235.])
    return fr * rc.VIG


A_CAPS = [(cap("THE BLACK SUV STAYED", 68, "pale"), 1500, 0.9, 3.9), (cap("FOUR CARS BEHIND US.", 80), 1600, 1.4, 3.9),
          (cap("NOT CLOSE. NOT FAR.", 72, "pale"), 1500, 4.2, 7.9), (cap("JUST THERE.", 92), 1610, 5.4, 7.9)]
A_TOP = mono("DAY 2 · MUSSOORIE → DEVPRAYAG", 36)


def scene_A(t):
    u = t - T_A
    fr = road_frame(t, mirror=0.25 + 0.05 * math.sin(t * 3))
    fr *= min(1, u / 0.8)
    blit(fr, A_TOP, 540, 420, alpha=min(1, max(0, u - 0.4) / 0.4))
    for spr, y, a, b in A_CAPS:
        pop(fr, spr, 540, y, u, a, b)
    return fr


# ---------------------------------------------------------------- B: the search
def search_bar(text, cursor=True):
    im = Image.new("RGBA", (940, 120), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, 939, 119), 60, fill=(32, 34, 40, 255), outline=(90, 95, 110, 255), width=3)
    d.ellipse((40, 38, 78, 76), outline=(200, 200, 210, 255), width=5)
    d.line((72, 72, 90, 90), fill=(200, 200, 210, 255), width=6)
    d.text((120, 60), text + ("|" if cursor else ""), font=font(rc.F_UI, 50), fill=(245, 245, 250, 255), anchor="lm")
    return np.asarray(im)


def result(title, snippet, w=940, accent=(140, 180, 255)):
    im = Image.new("RGBA", (w, 170), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, 169), 22, fill=(24, 26, 32, 235))
    d.text((34, 48), title, font=font(rc.F_UI_B, 40), fill=accent + (255,), anchor="lm")
    d.text((34, 116), snippet, font=font(rc.F_UI_R, 32), fill=(205, 205, 215, 255), anchor="lm")
    return np.asarray(im)


RES1 = [result("ND-65 Clutch Plate", "Motorcycle spares · free delivery"),
        result("ND-65 Snail Glow Serum", "Korean skincare · 4.2 ★"),
        result("Tender No. ND-65", "Road repairs · Govt. of Nagaland")]
RES2 = result("Nanda Devi, 1965", "A nuclear-powered device was lost on the mountain.", accent=(255, 200, 110))
RES2b = plain("It has never been found.", rc.F_UI_B, 40, (255, 120, 100))
PLUT = gold("PLUTONIUM.", 150)
B_SUB = sub("“Bhai. Yeh trip ke budget mein nahi tha.”", 52)


def scene_B(t):
    u = t - T_B
    fr = np.zeros((H, W, 3), np.float32) + np.array([8, 9, 14.])
    fr += np.exp(-(((XX - 540) / 700) ** 2 + ((YY - 800) / 900) ** 2))[..., None] * np.array([18, 22, 36.])
    if u < 2.667:
        q = "ND-65"[: int(min(1, u / 0.6) * 5)]
        blit(fr, search_bar(q, int(u * 3) % 2 == 0), 540, 640)
        for i, r in enumerate(RES1):
            t0 = 1.333 + i * 0.25
            if u >= t0:
                k = ease_out((u - t0) / 0.2)
                blit(fr, r, 540, 860 + i * 200 + 30 * (1 - k), alpha=k)
    else:
        v = u - 2.667
        q = "Nanda Devi 1965"[: int(min(1, v / 0.9) * 15)]
        blit(fr, search_bar(q, int(u * 3) % 2 == 0), 540, 640)
        if u >= 4.0:
            w = u - 4.0
            blit(fr, RES2, 540, 860, alpha=min(1, w / 0.1))
            blit(fr, RES2b, 540, 1010, alpha=min(1, max(0, w - 0.25) / 0.15))
            k = ease_out(w / 0.14)
            blit(fr, PLUT, 540, 1250, alpha=min(1, w / 0.04), scale=1.7 - 0.7 * k)
        pop(fr, B_SUB, 540, 1560, u, 4.7, 5.33, big=0.2)
    return fr


# ---------------------------------------------------------------- C: title
C_CH = gold("CHAPTER  TWO", 44, style="pale", bold=False, track=14)
C_R1 = gold("RULE ONE:", 96, style="pale")
C_R2 = gold("NEVER LOOK BACK", 104)
C_R3 = gold("AT THE GHAT.", 132)


def scene_C(t):
    u = t - T_C
    fr = np.zeros((H, W, 3), np.float32) + 5
    fr += rc.LAMP_WARM * np.array([30, 14, 6.]) * (0.6 + 0.4 * math.sin(u * 8) ** 2)
    blit(fr, C_CH, 540, 640, alpha=min(1, u / 0.3))
    for spr, t0, y in ((C_R1, 0.667, 800), (C_R2, 1.333, 960), (C_R3, 2.0, 1130)):
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.14)
            blit(fr, spr, 540, y, alpha=min(1, dt / 0.05), scale=1 + 0.8 * (1 - k))
    return fr


# ---------------------------------------------------------------- D: Gabbar's rules + the ghosts
def rule_card(num, lines, note_):
    cw, ch = 900, 900
    im = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, cw - 1, ch - 1), 26, fill=(14, 15, 20, 235), outline=(217, 179, 106, 255), width=3)
    d.ellipse((cw / 2 - 120, 70, cw / 2 + 120, 310), outline=(217, 179, 106, 255), width=5)
    arr = np.asarray(im).copy()
    tmp = arr[..., :3].astype(np.float32)
    rc.blit_local(tmp, gold(num, 150), cw / 2, 190)
    y = 420
    for ln in lines:
        rc.blit_local(tmp, gold(ln, 62 if len(ln) < 20 else 54), cw / 2, y); y += 95
    if note_:
        rc.blit_local(tmp, plain(note_, rc.F_HAND, 46, (255, 236, 196)), cw / 2, y + 40)
    arr[..., :3] = tmp.clip(0, 255)
    return arr


RULES = [rule_card("EK.", ["RAAT KO", "SEETI MAT BAJAO."], "“Jo sunta hai, woh aa jaata hai.”"),
         rule_card("DO.", ["NADI KINARE KOI", "NAAM SE BULAYE,", "PEECHE MAT DEKHO."], "“Jawab mat do.”"),
         rule_card("TEEN.", ["SHAMSHAN GHAT SE", "SAR JHUKA KE GUZRO."], "")]
D_HEAD = gold("PAHAD KE RAAT KE NIYAM", 56, style="pale")
D_BY = plain("— Gabbar Singh Negi", rc.F_HAND, 40, (230, 210, 170))


def ghost_card(name, line1, line2):
    sp = [gold(name, 150)]
    sp.append(plain(line1, rc.F_SERIF, 44, (240, 220, 200)))
    sp.append(plain(line2, rc.F_HAND, 44, (230, 190, 170)))
    return sp


GHOSTS = [ghost_card("MASAN", "SPIRIT OF THE CREMATION GROUND", "It rules the river between two confluences."),
          ghost_card("CHHAL", "A TRICK, NOT A GHOST", "It waits by springs, at noon and at dusk."),
          ghost_card("KHABEES", "OLD. BIG. IN THE FOREST.", "It calls you in a shepherd's voice.")]
RULE_BG = np.asarray(Image.fromarray(np.clip(road_frame(0.0, lights=0.4, sway=False, mirror=0.2), 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(22)), np.float32) * 0.5


def scene_D(t):
    u = t - T_D
    if u < 3 * BAR:
        fr = RULE_BG.copy()
        i = int(u / BAR); du = u - i * BAR
        blit(fr, D_HEAD, 540, 330, alpha=min(1, u / 0.3))
        blit(fr, D_BY, 540, 410, alpha=min(1, u / 0.3))
        k = ease_out(du / 0.2)
        blit(fr, RULES[i], 540 + (1 if i % 2 else -1) * 80 * (1 - k), 1030, alpha=min(1, du / 0.06), scale=1.12 - 0.12 * k + 0.02 * du)
        return fr
    v = u - 3 * BAR
    i = min(int(v / 0.889), 2); dv = v - i * 0.889
    fr = np.zeros((H, W, 3), np.float32)
    flick = 0.8 + 0.2 * math.sin(t * 23) * math.sin(t * 7)
    fr += np.exp(-(((XX - 540) / 650) ** 2 + ((YY - 960) / 800) ** 2))[..., None] * np.array([90, 12, 10.]) * flick
    name, l1, l2 = GHOSTS[i]
    k = ease_out(dv / 0.12)
    blit(fr, name, 540, 900, alpha=min(1, dv / 0.04), scale=1.5 - 0.5 * k)
    blit(fr, l1, 540, 1060, alpha=min(1, max(0, dv - 0.1) / 0.1))
    blit(fr, l2, 540, 1130, alpha=min(1, max(0, dv - 0.2) / 0.1))
    return fr


# ---------------------------------------------------------------- E: high beams, headlights off
E_TIME = mono("9:40 P.M.", 56)
E_SUB = sub("“Pakad ke baitho.”", 60)
E_CAPS = [(cap("HE SWITCHED OFF", 74, "pale"), 1450, 0.25, 4.0), (cap("THE HEADLIGHTS.", 90), 1550, 0.6, 4.0),
          (cap("AND DROVE FROM MEMORY.", 66, "pale"), 1450, 2.0, 5.3), (cap("BY THE SHAPE OF THE SKY.", 70), 1550, 2.9, 5.3)]


def scene_E(t):
    u = t - T_E
    if t < T_OFF:
        flood = 0.55 + 0.1 * math.sin(t * 9)
        fr = road_frame(t, mirror=1.0, flood=flood, speed=1.6)
        blit(fr, E_TIME, 90, 470, anchor="l", alpha=min(1, u / 0.2))
        pop(fr, E_SUB, 540, 1560, u, 0.9, 2.6, big=0.2)
        return fr
    v = t - T_OFF
    fr = road_frame(t, lights=0.0, sway=True, mirror=0.6) * 0.55
    bars(fr)
    # two captions share the slot; the second pair replaces the first
    pairs = [E_CAPS[:2], E_CAPS[2:]]
    which = 0 if v < 1.95 else 1
    for spr, y, a, b in pairs[which]:
        pop(fr, spr, 540, y, v, a, b if which else 1.9)
    return fr


# ---------------------------------------------------------------- F: Devprayag
def devprayag_base():
    fr = np.zeros((H, W, 3), np.float32)
    g = np.clip(YY / 900, 0, 1)[..., None]
    fr += np.array([5, 7, 14.]) * (1 - g) + np.array([14, 18, 30.]) * g
    for base, amp, col in ((520, 60, (10, 12, 20)), (640, 80, (6, 7, 12))):
        ridge = base + np.convolve(np.cumsum(rng.normal(0, 6, W)), np.ones(31) / 31, mode="same")
        ridge -= ridge.mean() - base
        fr[YY > ridge[None, :]] = col
    # ghat steps
    for i, y in enumerate(range(1260, H, 70)):
        fr[y:y + 70] = np.array([46, 42, 40.]) * (1 - i * 0.05)
        fr[y:y + 5] = np.array([70, 64, 60.])
    return fr


DEV = devprayag_base()
FLOW = np.asarray(Image.fromarray(rng.integers(0, 255, (24, 160), dtype=np.uint8)).resize((2400, 380), Image.BICUBIC).filter(ImageFilter.GaussianBlur((40, 6))), np.float32) / 255
FLOW = np.clip((FLOW - FLOW.mean()) * 2.2 + 0.5, 0, 1)
LAMPS = [(180, 930), (470, 905), (820, 920), (1000, 940)]
PYRE = (230, 1300)
F_T1 = gold("DEVPRAYAG", 120)
F_T2 = plain("WHERE THE BHAGIRATHI MEETS THE ALAKNANDA", rc.F_SERIF, 34, (230, 215, 185), track=3)
F_SUBS = [(sub("“Bhai sahab. Yeh Masan ka ilaaka hai.”"), 2.667, 3.95), (sub("“Raat ko yahan peeche se koi bulaye…”"), 4.0, 5.3),
          (sub("“…toh mud ke mat dekhna.”"), 5.333, 6.6)]
F_LOOK = gold("HE LOOKED BACK.", 100)


def river(t):
    y0, y1 = 880, 1260
    off1 = int(t * 140) % 1200
    off2 = int(t * 90) % 1200
    tex1 = FLOW[:, off1:off1 + W]
    tex2 = FLOW[::-1, off2:off2 + W]
    yy = np.linspace(0, 1, y1 - y0)[:, None]
    xx = np.linspace(0, 1, W)[None, :]
    # Bhagirathi (green-grey) from the left/top half, Alaknanda (silver-blue) below; they braid to one past centre
    mix = np.clip((yy - 0.5) * 3 + 0.0, 0, 1) * np.clip(1.6 - xx * 1.6, 0, 1) + np.clip(xx * 1.6 - 0.6, 0, 1) * 0.5
    c1 = np.array([38, 62, 52.]); c2 = np.array([52, 64, 86.])
    col = c1 * (1 - mix[..., None]) + c2 * mix[..., None]
    shine = (0.55 + 0.9 * (tex1 * (1 - mix) + tex2 * mix))[..., None]
    return y0, y1, col * shine


def scene_F(t):
    u = t - T_F
    fr = DEV.copy()
    y0, y1, rv = river(t)
    fr[y0:y1] = rv
    for lx, ly in LAMPS:
        fr += np.exp(-(((XX - lx) / 26) ** 2 + ((YY - ly) / 26) ** 2))[..., None] * np.array([255, 200, 120.]) * 0.9
        refl = np.exp(-(((XX - lx) / 10) ** 2)) * ((YY > y0) & (YY < y1)) * (0.5 + 0.5 * np.sin(YY * 0.25 + t * 6))
        fr += refl[..., None] * np.array([120, 90, 50.]) * 0.6
    flick = 0.75 + 0.25 * math.sin(t * 19) * math.sin(t * 7.7)
    fr += np.exp(-(((XX - PYRE[0]) / 320) ** 2 + ((YY - PYRE[1]) / 260) ** 2))[..., None] * np.array([255, 110, 30.]) * 0.55 * flick
    fr += np.exp(-(((XX - PYRE[0]) / 60) ** 2 + ((YY - PYRE[1] + 20) / 50) ** 2))[..., None] * np.array([255, 170, 60.]) * flick
    # the torch beam sweeping down the track
    if u > 1.3:
        a = min(1, (u - 1.3) / 0.3)
        ang = math.radians(118 - 26 * ease_io((u - 1.3) / 3.0))
        sx, sy = 980, 380
        dx, dy = math.cos(ang), math.sin(ang)
        px, py = XX - sx, YY - sy
        along = px * dx + py * dy
        perp = np.abs(-px * dy + py * dx)
        cone = np.exp(-(perp / (40 + along * 0.22).clip(1)) ** 2) * (along > 0) * np.exp(-along / 1800)
        fr += cone[..., None] * np.array([255, 245, 210.]) * 0.75 * a
        fr += np.exp(-(((XX - sx) / 20) ** 2 + ((YY - sy) / 20) ** 2))[..., None] * 255 * a
    zoom = 1.0 + 0.08 * ease_io(u / 8.0)
    if t >= T_LOOK:
        zoom += 0.06 * ease_out((t - T_LOOK) / 0.3)
    fr = zoomed(fr, zoom, 0.5, 0.55) * rc.VIG
    bars(fr)
    pop(fr, F_T1, 540, 420, u, 0.05, 2.5, big=0.6)
    pop(fr, F_T2, 540, 520, u, 0.35, 2.5, big=0.1)
    for spr, a_, b_ in F_SUBS:
        pop(fr, spr, 540, 1560, u, a_, b_, big=0.15)
    if 6.667 <= u < 8.0:                                 # Kshitij plays Golu's video at Bhalla
        v = u - 6.667
        ph = np.zeros((560, 320, 3), np.float32) + 20
        ph[20:540, 16:304] = rc.corridor_frame(t, 1.1, flick=False)[::3, ::3][60:580, 36:324] * 0.8 + 60
        ph = np.dstack([ph, np.full((560, 320), 255.)]).astype(np.uint8)
        blit(fr, ph, 540, 1200, alpha=min(1, v / 0.1))
        blit(fr, plain("“Ghost family… woh dekho… safed saaya…”", rc.F_UI, 36, (255, 255, 255)), 540, 1560, alpha=min(1, v / 0.1))
        if v > 0.8:
            blit(fr, gold("AAAAAH!", 110, style="white"), 540, 1200, alpha=min(1, (v - 0.8) / 0.05), scale=1.3 - 0.3 * ease_out((v - 0.8) / 0.12))
    if T_LOOK <= t < T_ESC:
        fr *= 0.55
        dt = t - T_LOOK; k = ease_out(dt / 0.14)
        blit(fr, F_LOOK, 540, 960, alpha=min(1, dt / 0.04), scale=1.7 - 0.7 * k)
    if t >= T_ESC:                                       # lights on, reverse, gone
        fr = road_frame(t, lights=1.0, speed=3.2, mirror=0.0)
        fr = zoomed(fr, 1.1 + 0.05 * math.sin((t - T_ESC) * 3), 0.5, 0.5, (14 * math.sin(t * 33), 10 * math.cos(t * 29)))
        bars(fr)
    return fr


# ---------------------------------------------------------------- G: the dhaba fire
EMBERS = [dict(ts=rng.uniform(T_G - 3, T_H), x0=rng.uniform(420, 660), vy=rng.uniform(120, 300), amp=rng.uniform(10, 50),
               ph=rng.uniform(0, 6), life=rng.uniform(1.2, 3.0), r=int(rng.choice([1, 2, 2, 3]))) for _ in range(160)]
G_LINES = [(plain("Jahan paani ke badle beta diya,", rc.F_HAND, 58, (255, 232, 190), glow=6), 520, 0.4, 2.6),
           (plain("wahan se pehla paath liya…", rc.F_HAND, 58, (255, 232, 190), glow=6), 600, 1.1, 2.6),
           (sub("“Meri naani gaati thi.”", 54), 560, 2.7, 4.0),
           (cap("THE SPRING AFTER", 66, "pale"), 480, 4.05, 6.6), (cap("THE HELICOPTERS…", 78), 570, 4.45, 6.6),
           (cap("A STONE THAT STEAMED", 60, "pale"), 670, 5.25, 6.6), (cap("IN THE SNOW.", 74), 750, 5.6, 6.6),
           (sub("“Jisne chhua, woh laut ke na roya.”", 58), 600, 6.65, 7.95)]


def scene_G(t):
    u = t - T_G
    fr = np.zeros((H, W, 3), np.float32) + np.array([6, 5, 6.])
    flick = 0.8 + 0.2 * math.sin(t * 17) * math.sin(t * 5.3) + 0.05 * math.sin(t * 41)
    fr += np.exp(-(((XX - 540) / 620) ** 2 + ((YY - 1380) / 700) ** 2))[..., None] * np.array([150, 70, 20.]) * flick
    # oil drum
    fr[1440:1820, 400:680] = np.array([22, 16, 14.]) * (0.7 + 0.5 * np.exp(-((XX[1440:1820, 400:680] - 540) / 90) ** 2))[..., None]
    fr[1440:1452, 390:690] = np.array([60, 40, 30.])
    # flames: flickering blobs
    for i in range(9):
        fx = 540 + 70 * math.sin(t * (2.1 + i * 0.37) + i * 1.7)
        fy = 1400 - 60 * i * (0.6 + 0.4 * math.sin(t * 3 + i))
        r = 70 - i * 6
        fr += np.exp(-(((XX - fx) / r) ** 2 + ((YY - fy) / (r * 1.6)) ** 2))[..., None] * np.array([255, 120 + i * 10, 30.]) * (0.9 - i * 0.07) * flick
    for p in EMBERS:
        dt = t - p["ts"]
        if 0 <= dt <= p["life"]:
            x = p["x0"] + p["amp"] * math.sin(dt * 2 + p["ph"]); y = 1350 - p["vy"] * dt
            b = min(1, (p["life"] - dt) / 0.6)
            s = rc.SPR[p["r"]]; rr = s.shape[0] // 2; xi, yi = int(x), int(y)
            if rr <= xi < W - rr and rr <= yi < H - rr:
                fr[yi - rr:yi + rr + 1, xi - rr:xi + rr + 1] += s[..., None] * np.array([255, 170, 70.]) * b
    for spr, y, a, b in G_LINES:
        pop(fr, spr, 540, y, u, a, b, big=0.25)
    return fr * rc.VIG


# ---------------------------------------------------------------- H: @ND65
def nd65_card():
    im = Image.new("RGBA", (960, 380), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, 959, 379), 34, fill=(0, 0, 0, 190), outline=(225, 30, 50, 255), width=4)
    d.ellipse((40, 40, 140, 140), fill=(30, 30, 34, 255), outline=(225, 30, 50, 255), width=4)
    d.text((90, 92), "?", font=font(rc.F_UI_B, 60), fill=(225, 30, 50, 255), anchor="mm")
    d.text((170, 92), "@ND65", font=font(rc.F_UI_B, 56), fill=(255, 140, 60, 255), anchor="lm")
    d.text((50, 215), "Notebook wapas karo, Professor.", font=font(rc.F_UI_B, 52), fill=(255, 255, 255, 255), anchor="lm")
    d.text((50, 300), "Politely. Abhi ke liye.", font=font(rc.F_UI_R, 50), fill=(235, 235, 235, 255), anchor="lm")
    return np.asarray(im)


ND65 = nd65_card()
H_TOP = mono("LIVE · GHOSTBUSTER GOLU · DHABA PAST SRINAGAR", 30)


def scene_H(t):
    u = t - T_H
    fr = np.asarray(Image.fromarray(np.clip(scene_G(T_H - 0.01), 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(18)), np.float32) * 0.45
    blit(fr, rc.UI_LIVE, 70, 300, anchor="l")
    blit(fr, H_TOP, 540, 420)
    k = ease_out(u / 0.18)
    blit(fr, ND65, 540, 1000 + 120 * (1 - k), alpha=min(1, u / 0.06), scale=1.1 - 0.1 * k)
    if u < 0.35:                                     # glitch: split RGB channels
        s = int(18 * (1 - u / 0.35))
        fr[..., 0] = np.roll(fr[..., 0], s, 1); fr[..., 2] = np.roll(fr[..., 2], -s, 1)
    return fr


# ---------------------------------------------------------------- I: end card
I_CH = gold("CHAPTER  TWO", 44, style="pale", bold=False, track=14)
I_T1 = gold("RULE ONE:", 58, style="pale")
I_T2 = gold("NEVER LOOK BACK AT THE GHAT", 64)


def scene_I(t):
    u = t - T_I
    fr = rc.CAST_BG.copy() * 0.5 + rc.LAMP_WARM * np.array([40, 22, 8.])
    items = [(I_CH, 330, 0.0), (I_T1, 430, 0.1), (I_T2, 515, 0.25), (rc.TITLE_LOGO, 820, 0.45),
             (rc.E_TAG, 1080, 0.85), (rc.E_TAG2, 1150, 1.05), (rc.AUTH, 1450, 1.25)]
    for spr, y, t0 in items:
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.25)
            blit(fr, spr, 540, y + 20 * (1 - k), alpha=min(1, dt / 0.2), scale=1.08 - 0.08 * k)
    return fr


SCENES = [(T_A, scene_A, 0.0), (T_B, scene_B, 0.0), (T_C, scene_C, 0.5), (T_D, scene_D, 0.3), (T_E, scene_E, 0.0),
          (T_F, scene_F, 0.4), (T_G, scene_G, 0.0), (T_H, scene_H, 0.0), (T_I, scene_I, 1.0)]


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
