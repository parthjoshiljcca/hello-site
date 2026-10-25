"""Chapter One trailer, 60s cut, on the original score (score_ch1.wav, 90 bpm).

Reuses the procedural assets from render_ch1 and re-times every scene to the score:
A clipping 0-10.67 | B title hits 11.33/12.67/14.0 | C cast + rate card + suspects 16-26.67 |
D corridor 26.67-34.67 | E CLANG 34.67, chase, ring light 37.33 | F notebook, torn-out 49.33 |
G R.'s note, headlights 54.67 | H end card 56-60.
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
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "chapter1_long.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
SCORE = os.path.join(D, "score_ch1.wav")
B = 60 / 90
BAR = 4 * B
A_, B_, C_, D_, E_, F_, G_, H_ = 0.0, 4 * BAR, 6 * BAR, 10 * BAR, 13 * BAR, 16 * BAR, 19 * BAR, 21 * BAR
HITS = [(11.333, 0.45, 22), (12.667, 0.45, 22), (14.0, 0.6, 26), (34.667, 0.75, 30), (37.333, 0.6, 24),
        (49.333, 0.4, 18), (54.667, 0.3, 14), (56.0, 0.5, 20)]

# ---------------------------------------------------------------- A: the 1911 clipping
def clip_base():
    fr = rc.DESK.copy()
    sp = rc.CLIP
    a = sp[..., 3].astype(np.float32) / 255
    sh = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(25)), np.float32) / 255
    h, w = sp.shape[:2]
    x0, y0 = int(540 - w / 2) + 24, int(980 - h / 2) + 30
    xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + w, W), min(y0 + h, H)
    fr[ya:yb, xa:xb] *= (1 - 0.7 * sh[ya - y0:yb - y0, xa - x0:xb - x0, None])
    blit(fr, sp, 540, 980)
    return fr * (0.55 + 0.6 * rc.LAMP_WARM)


CLIP_BASE = clip_base()
A_CAP = [(gold("A LADY FOUND DEAD.", 78), 2.667),
         (gold("THE DOOR LOCKED", 70, style="pale"), 5.333), (gold("FROM INSIDE.", 86), 5.6),
         (gold("THE TRUTH WAS", 70, style="pale"), 8.0), (gold("NEVER KNOWN.", 86), 8.27)]
A_TOP = plain("19 SEPTEMBER 1911", rc.F_MONO_B, 44, (240, 228, 200), track=6)
A_TOP2 = plain("THE SAVOY · MUSSOORIE", rc.F_MONO, 30, (220, 205, 175), track=4)


def scene_A(t):
    u = t - A_
    if u < 5.333:                                   # drift in on the headline
        k = ease_io(u / 5.333)
        fr = zoomed(CLIP_BASE, 1.02 + 0.28 * k, 0.5, 0.5 - 0.17 * k)
    else:                                           # slide down the column
        k = ease_io((u - 5.333) / 5.333)
        fr = zoomed(CLIP_BASE, 1.30 + 0.1 * k, 0.5, 0.33 + 0.25 * k)
    fr *= rc.VIG
    fr *= min(1, u / 0.6)
    blit(fr, A_TOP, 540, 170, alpha=min(1, max(0, u - 0.3) / 0.3))
    blit(fr, A_TOP2, 540, 235, alpha=min(1, max(0, u - 0.6) / 0.3))
    shade = np.concatenate([np.zeros(H - 520), np.linspace(0, 0.7, 520)])[:, None, None]
    fr *= (1 - shade)
    groups = [(0, 2.667, 5.25, [(0, 1650)]), (1, 5.333, 7.92, [(1, 1600), (2, 1700)]), (3, 8.0, 10.6, [(3, 1600), (4, 1700)])]
    for _, t0g, t1g, items in groups:
        if t0g <= u < t1g:
            for idx, y in items:
                spr, ts = A_CAP[idx]
                if u >= ts:
                    dt = u - ts; kk = ease_out(dt / 0.16)
                    blit(fr, spr, 540, y + 8 * (1 - kk), alpha=min(1, dt / 0.06) * min(1, (t1g - u) / 0.15), scale=1 + 0.45 * (1 - kk))
    return fr


# ---------------------------------------------------------------- B: title hits
def scene_B(t):
    u = t - B_
    fr = np.zeros((H, W, 3), np.float32) + 5
    fr += rc.LAMP_WARM * np.array([34, 18, 6], np.float32) * (0.6 + 0.4 * math.sin(u * 9) ** 2)
    blit(fr, rc.T_CH, 540, 600, alpha=min(1, u / 0.4))
    for spr, t0, y in ((rc.T_ROOM, 0.667, 790), (rc.T_LADY, 2.0, 960), (rc.T_PROF, 3.333, 1150), (rc.T_HUNG, 3.55, 1310)):
        if u >= t0:
            dt = u - t0; k = ease_out(dt / 0.14)
            blit(fr, spr, 540, y, alpha=min(1, dt / 0.05), scale=1 + 0.8 * (1 - k))
    return fr


# ---------------------------------------------------------------- C: the company, the rate card, the suspects
def rate_card():
    cw, ch = 880, 1000
    im = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, cw - 1, ch - 1), 30, fill=(246, 242, 232, 255), outline=(200, 200, 205, 255), width=6)
    d.rounded_rectangle((14, 14, cw - 15, ch - 15), 22, outline=(255, 255, 255, 160), width=3)
    d.text((cw / 2, 95), "GABBAR SINGH NEGI", font=font(rc.F_UI_B, 50), fill=(30, 30, 40, 255), anchor="mm")
    d.text((cw / 2, 155), "Driver of BASANTI · Dehradun", font=font(rc.F_UI_R, 32), fill=(90, 90, 100, 255), anchor="mm")
    d.line((70, 205, cw - 70, 205), fill=(200, 60, 120, 255), width=4)
    rows = [("Mussoorie", "fixed"), ("Char Dham", "fixed"), ("Bhoot ki kahani", "Rs 100 extra"), ("Asli bhoot ki kahani", "negotiable")]
    y = 300
    for i, (a, b) in enumerate(rows):
        col = (30, 30, 40, 255) if i < 3 else (180, 30, 60, 255)
        d.text((80, y), a, font=font(rc.F_UI_B if i == 3 else rc.F_UI, 46), fill=col, anchor="lm")
        d.text((cw - 80, y), b, font=font(rc.F_UI_B if i == 3 else rc.F_UI_R, 46), fill=col, anchor="rm")
        d.line((80, y + 55, cw - 80, y + 55), fill=(215, 215, 220, 255), width=2)
        y += 140
    d.text((cw / 2, ch - 90), "B A S A N T I", font=font(rc.F_UI_B, 56), fill=(236, 72, 153, 255), anchor="mm")
    arr = np.asarray(im).copy()
    gl = np.zeros((ch, cw, 1), np.float32)            # laminate sheen
    yy, xx = np.mgrid[0:ch, 0:cw]
    gl[..., 0] = np.exp(-(((xx + 0.6 * yy) - 700) / 140.0) ** 2) * 50
    arr[..., :3] = np.clip(arr[..., :3] + gl, 0, 255)
    return np.asarray(Image.fromarray(arr, "RGBA").rotate(2.5, resample=Image.BICUBIC, expand=True))


def suspect(card):
    im = Image.fromarray(card, "RGBA")
    st = Image.new("RGBA", (380, 110), (0, 0, 0, 0))
    d = ImageDraw.Draw(st)
    d.rounded_rectangle((4, 4, 375, 105), 12, outline=(210, 40, 40, 255), width=7)
    d.text((190, 56), "SUSPECT", font=font(rc.F_MONO_B, 62), fill=(210, 40, 40, 255), anchor="mm")
    st = st.rotate(-12, resample=Image.BICUBIC, expand=True)
    st = Image.fromarray((np.asarray(st).astype(np.float32) * np.array([1, 1, 1, 0.85])).astype(np.uint8), "RGBA")
    im.alpha_composite(st, (im.width - st.width + 20, im.height - st.height - 10))
    return np.asarray(im)


CARDS = [rc.CARDS[0], rc.CARDS[1], rc.CARDS[2], rc.CARDS[3], rate_card(), rc.CARDS[4],
         suspect(rc.card("R", "ROHAN SEHGAL", "Summit Secrets · Trek Operator", "“Don't believe the ghosts.”")),
         suspect(rc.card("B", "BHALLA", "Built Like a Wardrobe", "Big man doesn't like flutes."))]
C_HEAD = [rc.T_CAST] * 6 + [gold("AND AT THE NEXT TABLE", 50, style="pale", bold=False, track=10)] * 2


def scene_C(t):
    u = t - C_
    fr = rc.CAST_BG.copy()
    i = min(int(u / (2 * B)), len(CARDS) - 1)
    du = u - i * 2 * B
    if i >= 6:
        fr *= np.array([1.1, 0.75, 0.7], np.float32)    # suspects: colder, redder light
    blit(fr, C_HEAD[i], 540, 250, alpha=1.0)
    k = ease_out(du / 0.18)
    side = -1 if i % 2 else 1
    blit(fr, CARDS[i], 540 + side * 90 * (1 - k), 1000, alpha=min(1, du / 0.05), scale=1.14 - 0.14 * k + 0.025 * du)
    return fr


# ---------------------------------------------------------------- D: 2:14 a.m. corridor
D_SUBS = [("“ND-65 ka core abhi bhi wahi hai, Bhalla.”", 0.6, 2.2), ("“Glacier pighal raha hai.”", 2.3, 3.5),
          ("“Usse pehle humein pahunchna hai.”", 3.6, 4.9), ("“Aur geet?”", 5.0, 5.9),
          ("“Aakhri hissa toh mila hi nahi, sir.”", 6.0, 7.7)]
D_SPR = [(plain(s, rc.F_HAND, 52, (255, 246, 225)), a, b) for s, a, b in D_SUBS]


def bars(fr, amount=1.0):
    h = int(190 * amount)
    if h > 0:
        fr[:h] *= 0.0
        fr[H - h:] *= 0.0


def scene_D(t):
    u = t - D_
    fr = rc.corridor_frame(t, 1.0 + 0.16 * ease_io(u / 8.0)) * rc.VIG
    fr *= min(1, u / 0.5)
    bars(fr, ease_out(u / 0.6))
    blit(fr, rc.WH1, 90, 290, alpha=min(1, u / 0.3), anchor="l")
    blit(fr, rc.WH2, 90, 355, alpha=min(1, max(0, u - 0.4) / 0.3), anchor="l")
    for spr, a, b in D_SPR:
        if a <= u < b:
            blit(fr, spr, 540, 1560, alpha=min(1, (u - a) / 0.12) * min(1, (b - u) / 0.12))
    if u > 7.85:                                     # a breath of silence before the crash
        fr *= max(0.0, 1 - (u - 7.85) / 0.15)
    return fr


# ---------------------------------------------------------------- E: CLANG, chase, ring light
E_SUB = plain("“Bhalla. Bhoot nahi hai.”", rc.F_HAND, 60, (255, 246, 225))
E_PAKDO = gold("PAKDO.", 190)
PREV = {"fr": None}


def scene_E(t):
    u = t - E_
    if u < 0.833:                                    # CLANG
        sh = (22 * math.exp(-u * 5) * math.sin(u * 70), 18 * math.exp(-u * 5) * math.cos(u * 55))
        fr = rc.corridor_frame(t, 1.18, shake=sh) * rc.VIG
        bars(fr)
        k = ease_out(u / 0.12)
        blit(fr, rc.T_CLANG, 540 + sh[0], 960 + sh[1], alpha=min(1, u / 0.03), scale=1.6 - 0.6 * k)
        return fr
    if u < 2.667:                                    # chase down the corridor
        v = u - 0.833
        sh = (14 * math.sin(t * 31), 10 * math.cos(t * 27))
        fr = rc.corridor_frame(t, 1.05 + 0.3 * ease_io(v / 1.833), shake=sh) * rc.VIG
        strobe = 0.75 + 0.25 * (int(t * 12) % 2)
        fr *= np.array([1.08, 0.85, 0.8], np.float32) * strobe
        if PREV["fr"] is not None:
            fr = fr * 0.55 + PREV["fr"] * 0.45
        bars(fr)
        if v < 0.8:
            blit(fr, E_SUB, 540, 1560, alpha=min(1, v / 0.1))
        else:
            dt = v - 0.8; k = ease_out(dt / 0.14)
            blit(fr, E_PAKDO, 540, 1000, alpha=min(1, dt / 0.04), scale=1.6 - 0.6 * k)
        return fr
    v = u - 2.667                                    # ring light -> LIVE feed
    fr, _ = rc.scene_clang(rc.S_CLANG + 0.55 + v)
    return fr


# ---------------------------------------------------------------- F: the swapped notebook
HAND_T = [0.5, 1.4, 2.2, 3.1, 4.0]


def notebook_img(u):
    nb = rc.NOTE_BASE[..., :3].astype(np.float32).copy()
    nh, nw = nb.shape[:2]
    for (spr, y, _), t0 in zip(rc.HANDS, HAND_T):
        if u >= t0:
            p = min(1, (u - t0) / 0.6)
            s = spr.copy(); s[:, int(s.shape[1] * p):, 3] = 0
            rc.blit_local(nb, s, 120 + s.shape[1] / 2, y)
    rows = np.arange(nh)[:, None]
    tear = 1040 + (np.sin(np.arange(nw) * 0.21) * 9 + np.random.default_rng(2).normal(0, 5, nw)).astype(int)
    torn = (rows > tear[None, :]) & (rows < nh - 23)
    nb[torn] = np.array([78, 46, 26])
    return np.dstack([nb, rc.NOTE_BASE[..., 3]]).clip(0, 255).astype(np.uint8)


def scene_F(t):
    u = t - F_
    canvas = rc.CAST_BG.copy() * 0.8
    k = ease_out(u / 0.6)
    blit(canvas, notebook_img(u), 540, 1000 - 80 * (1 - k), alpha=min(1, u / 0.15), scale=0.86 + 0.14 * k)
    # camera: settle, then drift in to the song lines
    z = 1.0 + 0.35 * ease_io((u - 3.0) / 2.5) if u > 3.0 else 1.0
    cy = 0.5 + 0.06 * ease_io((u - 3.0) / 2.5) if u > 3.0 else 0.5
    fr = zoomed(canvas, z, 0.5, cy)
    blit(fr, rc.NB_TAG, 540, 230, alpha=min(1, u / 0.25) * (1 if u < 3.0 else max(0, 1 - (u - 3.0) / 0.3)))
    if u >= 6.667:
        fr *= 0.6
        dt = u - 6.667; kk = ease_out(dt / 0.16)
        blit(fr, rc.TORN, 540, 1640, alpha=min(1, dt / 0.06), scale=1 + 0.4 * (1 - kk))
        if dt > 0.3:
            d2 = dt - 0.3; k2 = ease_out(d2 / 0.16)
            blit(fr, rc.TORN2, 540, 1760, alpha=min(1, d2 / 0.06), scale=1 + 0.6 * (1 - k2))
    return fr


# ---------------------------------------------------------------- G: the note from R. + headlights
NOTE_T = [0.15, 0.85, 1.55, 2.3, 2.95]
G_CAP1 = plain("IT DID NOT LEAVE", rc.F_MONO_B, 54, (245, 235, 210), track=6)
G_CAP2 = plain("UNTIL WE DID.", rc.F_MONO_B, 54, (245, 235, 210), track=6)


def scene_G(t):
    u = t - G_
    if u < 4.0:
        fr = zoomed(rc.PAGE, 1.0 + 0.05 * u)
        for (spr, y, _), t0 in zip(rc.NOTES, NOTE_T):
            if u >= t0:
                p = min(1, (u - t0) / 0.55)
                s = spr.copy(); s[:, int(s.shape[1] * p):, 3] = 0
                blit(fr, s, 120 + s.shape[1] / 2, y)
        if u > 3.75:
            fr *= max(0, 1 - (u - 3.75) / 0.25)
        return fr
    v = u - 4.0
    fr = np.zeros((H, W, 3), np.float32)
    hl = min(1, v / 0.06)
    for cx in (390, 690):
        g = np.exp(-(((rc.xx_ - cx) / 70) ** 2 + ((rc.yy_ - 980) / 40) ** 2))
        g2 = np.exp(-(((rc.xx_ - cx) / 280) ** 2 + ((rc.yy_ - 980) / 150) ** 2)) * 0.35
        fr += ((g + g2)[..., None] * np.array([255, 245, 225], np.float32)) * hl
    bars(fr)
    blit(fr, G_CAP1, 540, 1290, alpha=min(1, max(0, v - 0.25) / 0.2))
    blit(fr, G_CAP2, 540, 1370, alpha=min(1, max(0, v - 0.55) / 0.2))
    return fr


# ---------------------------------------------------------------- H: end card
def scene_H(t):
    fr, _ = rc.scene_end(rc.S_END + (t - H_))
    return fr


SCENES = [(A_, scene_A, 1.0), (B_, scene_B, 0.6), (C_, scene_C, 0.7), (D_, scene_D, 1.0), (E_, scene_E, 0.3),
          (F_, scene_F, 0.8), (G_, scene_G, 0.4), (H_, scene_H, 1.0)]


def frame_at(t):
    for start, fn, dust_amt in reversed(SCENES):
        if t >= start:
            fr = fn(t)
            rc.dust(fr, t, dust_amt)
            break
    # global hit shake + flash
    shx = shy = 0.0
    fl = 0.0
    for s, a, amp in HITS:
        if 0 <= t - s < 0.6:
            e = math.exp(-(t - s) * 7)
            shx += amp * e * math.sin((t - s) * 75); shy += amp * 0.8 * e * math.cos((t - s) * 60)
            fl += a * math.exp(-(t - s) * 10)
    for i in range(8):                                # small flash on each card change
        s = C_ + i * 2 * B
        if 0 <= t - s < 0.3:
            fl += 0.15 * math.exp(-(t - s) * 16)
    if 37.333 <= t < 38.4:
        fl += 0.95 * math.exp(-(t - 37.333) * 6)
    if abs(shx) + abs(shy) > 0.5:
        fr = zoomed(fr, 1.04, 0.5, 0.5, (shx, shy))
    if fl > 0:
        fr = fr + (255 - fr) * min(fl, 1)
    PREV["fr"] = fr
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
        ims = []
        for tt in ts:
            ims.append(Image.fromarray(np.clip(frame_at(tt), 0, 255).astype(np.uint8)).resize((216, 384)))
        sheet = Image.new("RGB", (216 * len(ims), 384))
        for i, im in enumerate(ims):
            sheet.paste(im, (216 * i, 0))
        sheet.save(OUT)
    else:
        render()
