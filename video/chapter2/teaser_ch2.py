"""Chapter Two - 30s cinematic teaser (1080x1920) on score_teaser2.wav.

Scope bars, teal-black grade that keeps only reds/fire in colour, heavy grain, RGB split on hits.
Re-shoots the Chapter Two trailer's procedural scenes (render_ch2) with teaser timing:
rule on black -> mirror high beams -> lights off -> beat montage -> RULE ONE / NEVER / LOOK / BACK ->
Devprayag whispers -> HE LOOKED BACK -> strobe -> @ND65 -> title -> 'Parth...' -> sting.
"""
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image

import render_ch1 as rc
import render_ch2 as r2
from render_ch1 import W, H, FPS, blit, plain, gold, zoomed, ease_out, ease_io
from render_ch2 import sub, mono, XX, YY

D = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, "teaser_ch2.mp4")
LIMIT = int(sys.argv[2]) if len(sys.argv) > 2 else 900
SCORE = os.path.join(D, "score_teaser2.wav")
B = 60 / 90
BARS_H = 250
HITS = [(5.333, 0.0, 20), (6.0, .35, 14), (6.667, .3, 12), (7.333, .3, 12), (8.0, .35, 14), (8.667, .3, 12),
        (9.333, .3, 12), (10.0, .3, 12), (10.667, .5, 20), (11.333, .5, 20), (12.0, .5, 22), (12.667, .7, 28),
        (18.667, .8, 32), (22.667, .45, 20), (24.667, .5, 20), (29.6, .9, 30)]


# ---------------------------------------------------------------- look
def grade(fr, red_keep=1.0):
    L = (fr[..., 0] * 0.3 + fr[..., 1] * 0.59 + fr[..., 2] * 0.11)[..., None]
    warm = np.clip((fr[..., 0] - fr[..., 2] * 1.1 - 20) / 80, 0, 1)[..., None] * red_keep
    mono_ = L * np.array([0.82, 0.98, 1.06])                         # cold teal-steel
    out = mono_ * (1 - warm) + fr * warm * np.array([1.12, 0.95, 0.85])
    out = (out - 128) * 1.12 + 128                                    # contrast
    return np.clip(out, 0, 255)


def scope(fr):
    fr[:BARS_H] = 0
    fr[H - BARS_H:] = 0
    return fr


def rgb_split(fr, amt):
    s = int(amt)
    if s > 0:
        fr[..., 0] = np.roll(fr[..., 0], s, 1)
        fr[..., 2] = np.roll(fr[..., 2], -s, 1)
    return fr


def slam(fr, spr, dt, cx=540, cy=960, big=0.8):
    k = ease_out(dt / 0.13)
    blit(fr, spr, cx, cy, alpha=min(1, dt / 0.04), scale=1 + big * (1 - k))


# ---------------------------------------------------------------- text
T_RULE1 = sub("“Nadi kinare koi naam se bulaye…”", 58)
T_RULE2 = plain("…peeche mat dekhna.", rc.F_HAND_B, 78, (255, 236, 200), glow=6)
T_TIME = mono("9:40 P.M.", 48)
W_RULE = gold("RULE ONE:", 96, style="pale")
W_WORDS = [gold("NEVER", 190), gold("LOOK", 210), gold("BACK.", 230)]
W_LOOKED = gold("HE LOOKED BACK.", 104)
W_CH = gold("CHAPTER  TWO", 46, style="pale", bold=False, track=14)
W_T1 = gold("RULE ONE:", 70, style="pale")
W_T2 = gold("NEVER LOOK BACK", 92)
W_T3 = gold("AT THE GHAT", 92)
W_PARTH = plain("Parth…", rc.F_HAND, 92, (230, 225, 220), glow=10, glow_col=(120, 140, 170))
W_BY = plain("A CHAPTER FROM", rc.F_SERIF, 34, (220, 205, 175), track=8)


# ---------------------------------------------------------------- shots
MONTAGE = [(6.0, lambda: r2.scene_B(12.35)), (6.667, lambda: r2.scene_D(24.25)), (7.333, lambda: r2.scene_D(25.15)),
           (8.0, lambda: r2.scene_D(26.05)), (8.667, lambda: r2.scene_F(37.25)), (9.333, lambda: r2.scene_F(42.35)),
           (10.0, lambda: r2.scene_G(47.2))]
STROBE = [lambda t: r2.road_frame(t, mirror=1.0, flood=0.4, speed=3), lambda t: r2.scene_D(24.3),
          lambda t: r2.scene_F(42.1), lambda t: r2.scene_G(48.0), lambda t: r2.scene_D(26.1),
          lambda t: r2.road_frame(t, lights=0.0, mirror=1.0), lambda t: r2.scene_F(37.3), lambda t: r2.scene_B(12.4)]


def frame_at(t):
    split = 0.0
    if t < 2.667:                                             # the rule, on black
        fr = np.zeros((H, W, 3), np.float32)
        if t > 0.25:
            blit(fr, T_RULE1, 540, 900, alpha=min(1, (t - 0.25) / 0.3))
        if t > 1.45:
            slam(fr, T_RULE2, t - 1.45, cy=1010, big=0.3)
        return scope(fr)
    if t < 5.333:                                             # high beams closing in, push into the mirror
        u = t - 2.667
        m = 0.3 + 0.7 * ease_io(u / 2.6)
        fr = r2.road_frame(t, mirror=m, flood=0.55 * ease_io(u / 2.6) ** 2, speed=1.8)
        fr = zoomed(fr, 1.0 + 1.1 * ease_io(u / 2.6), 0.5, 240 / H, (6 * math.sin(t * 31) * u, 4 * math.cos(t * 27) * u))
        fr = grade(fr)
        blit(fr, T_TIME, 540, BARS_H + 80, alpha=min(1, u / 0.2))
        fr = scope(fr)
    elif t < 6.0:                                             # lights off
        fr = r2.road_frame(t, lights=0.0, mirror=0.0) * 0.35
        fr = scope(grade(fr))
    elif t < 10.667:                                          # beat montage
        i = min(int((t - 6.0) / B), len(MONTAGE) - 1)
        s0, fn = MONTAGE[i]
        dt = t - s0
        fr = grade(fn())
        fr = zoomed(fr, 1.12 - 0.08 * ease_out(dt / 0.3), 0.5, 0.5)
        split = 16 * math.exp(-dt * 12)
        fr = scope(fr)
    elif t < 13.333:                                          # RULE ONE: NEVER / LOOK / BACK
        u = t - 10.667
        fr = np.zeros((H, W, 3), np.float32) + rc.LAMP_WARM * np.array([60, 10, 6.]) * (0.5 + 0.5 * math.sin(u * 7) ** 2)
        blit(fr, W_RULE, 540, 700, alpha=min(1, u / 0.06))
        for j, spr in enumerate(W_WORDS):
            s = 0.667 * (j + 1)
            if u >= s:
                slam(fr, spr, u - s, cy=900 + j * 200, big=0.9)
        split = 14 * sum(math.exp(-(u - s) * 12) for s in (0, 0.667, 1.333, 2.0) if u >= s)
        fr = scope(fr)
    elif t < 18.667:                                          # Devprayag: torch, whispers, the phone
        su = 2.6 + (t - 13.333)
        fr = r2.scene_F(34.667 + su)
        fr = grade(fr)
        if t > 18.45:
            fr *= max(0, 1 - (t - 18.45) / 0.15)
        fr = scope(fr)
    elif t < 21.333:                                          # HE LOOKED BACK
        u = t - 18.667
        fr = grade(r2.scene_F(37.3)) * 0.35
        fr += np.exp(-(((XX - 540) / 700) ** 2 + ((YY - 960) / 600) ** 2))[..., None] * np.array([140, 8, 4.]) * math.exp(-u * 1.5)
        slam(fr, W_LOOKED, u, big=0.9)
        split = 22 * math.exp(-u * 6)
        fr = scope(fr)
    elif t < 22.667:                                          # strobe
        k = int((t - 21.333) / (B / 4))
        fr = grade(STROBE[k % len(STROBE)](t))
        fr = zoomed(fr, 1.15, 0.5, 0.5, (20 * math.sin(t * 40), 14 * math.cos(t * 33)))
        if k % 2:
            fr = 255 - (255 - fr) * 0.7
        split = 10
        fr = scope(fr)
    elif t < 24.0:                                            # @ND65
        fr = r2.scene_H(53.333 + (t - 22.667))
        fr = scope(grade(fr, red_keep=1.0))
    elif t < 24.667:                                          # silence
        fr = np.zeros((H, W, 3), np.float32)
    elif t < 28.667:                                          # title card
        u = t - 24.667
        fr = np.zeros((H, W, 3), np.float32) + rc.LAMP_WARM * np.array([34, 10, 6.])
        items = [(W_CH, 560, 0.0), (W_T1, 680, 0.15), (W_T2, 800, 0.3), (W_T3, 920, 0.45), (rc.TITLE_LOGO, 1180, 0.8),
                 (rc.AUTH, 1460, 1.2)]
        for spr, y, t0 in items:
            if u >= t0:
                dt = u - t0; k = ease_out(dt / 0.25)
                blit(fr, spr, 540, y + 16 * (1 - k), alpha=min(1, dt / 0.2) * min(1, (4.0 - u) / 0.3),
                     scale=(1.08 - 0.08 * k) * (0.82 if spr is rc.TITLE_LOGO or spr is rc.AUTH else 1.0))
        fr = scope(fr)
    else:                                                     # someone calls your name
        u = t - 28.667
        fr = np.zeros((H, W, 3), np.float32)
        if 0.2 < u < 0.93:
            blit(fr, W_PARTH, 540, 960, alpha=min(1, (u - 0.2) / 0.4) * 0.85)
        if u >= 0.933:
            fr += 255 * math.exp(-(u - 0.933) * 14)
        fr = scope(fr)
    # global hit shake / flash
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
    if split > 0.5:
        fr = rgb_split(fr, split)
    return fr


def render():
    enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-i", SCORE, "-filter_complex",
                            "[0:v]noise=c0s=11:c0f=t+u,format=yuv420p[v]",
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
