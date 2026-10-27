"""30s teaser score for Chapter Two (D minor, 90 bpm). Hits:
5.333 lights off (drop to silence) | 6.0-10.0 montage beats | 10.667/11.333/12.0/12.667 title words |
18.667 HE LOOKED BACK | 21.333 strobe | 22.667 @ND65 | 24.0 silence | 24.667 title card | 29.6 final sting.
Synth only, no whooshes. Rendered on the 60s synthlib canvas, trimmed to 30s.
"""
import os
import sys

import numpy as np

import synthlib as S
from synthlib import (B, BAR, SR, note, place, pad, drone, braam, hit, taiko, sub_boom, tick, heartbeat, piano, celesta,
                      pluck_str, env_adsr, choir, bell)

# 0-2.67: black, the rule; heartbeat under a low drone
drone(0.0, 5.6, "D1", 0.3, 300)
for k in range(2):
    place(heartbeat(), 0.4 + k * 1.1, 0.55, 0, 0.12)
place(piano(note("D3")), 0.3, 0.18, 0, 0.7)

# 2.67-5.33: the mirror - high beams closing in: pulse + accelerating ticks + pitched swell, then cut
for e in range(16):
    place(pluck_str(note("D1") * (2 if e % 4 == 2 else 1), B / 4 * 0.9, 800), 2.667 + e * B / 4, 0.3, -0.1, 0.15)
ts, step = 2.667, 0.33
while ts < 5.25:
    place(tick(True), ts, 0.08, 0.25, 0.15); ts += step; step = max(0.06, step * 0.82)
n = int(2.6 * SR); tt = np.arange(n) / SR
sw = np.zeros(n)
for nm in ("D3", "A3", "D4", "F4"):
    ph = 2 * np.pi * np.cumsum(note(nm) * 2 ** (tt / 2.6 * 0.6)) / SR
    sw += sum((1 / h) * np.sin(h * ph) for h in range(1, 8))
sw *= (tt / 2.6) ** 2.4 * env_adsr(n, 0.01, 0, 1, 0.02)
place(sw / 12, 2.7, 0.35, 0, 0.3)
place(sub_boom(4.0, 45, 22), 5.333, 0.85)          # lights off

# 6.0-10.67: montage, a hit on every beat
for k in range(7):
    s = 6.0 + k * B
    place(taiko(1.0 if k % 2 == 0 else 0.75, 1.4), s, 0.55, 0, 0.3)
    place(sub_boom(1.5, 70, 32), s, 0.25)
for s in (6.0, 8.0, 10.0):
    braam(s, 1.6, "D1", 0.35)
for e in range(28):
    place(pluck_str(note("D2") * (2 if e % 2 else 1), B / 4 * 0.9, 1500), 6.0 + e * B / 4, 0.22, -0.1, 0.2)

# 10.67-13.33: RULE ONE / NEVER / LOOK / BACK
for s, sz in ((10.667, 1.0), (11.333, 1.05), (12.0, 1.1), (12.667, 1.35)):
    hit(s, sz, br=(s in (10.667, 12.667)))

# 13.33-18.67: Devprayag - the torch, the whispers, the phone
drone(13.333, 5.4, "D1", 0.3, 260)
choir(13.333, 5.2, ["D3", "Ab3", "D4"], 0.14)
for k in range(5):
    place(heartbeat(), 13.6 + k * 0.95, 0.5, 0, 0.12)
for nm, s in (("D4", 13.6), ("Eb4", 14.93), ("D4", 16.27)):
    place(piano(note(nm)), s, 0.2, -0.2, 0.6)
ts, step = 16.0, 0.4
while ts < 18.35:
    place(tick(True), ts, 0.08, 0.25, 0.15); ts += step; step = max(0.06, step * 0.84)

# 18.67: HE LOOKED BACK
hit(18.667, 1.45)
choir(18.667, 2.6, ["D3", "Ab3", "D4", "F4"], 0.24)

# 21.33-22.67: strobe; 22.67 @ND65
for e in range(16):
    place(taiko(0.7, 0.9), 21.333 + e * B / 8, 0.32, (-1) ** e * 0.3, 0.25)
    place(pluck_str(note("D2") * (2 if e % 2 else 1), B / 8 * 0.9, 2000), 21.333 + e * B / 8, 0.22, 0, 0.15)
hit(22.667, 1.1)
for k in range(4):
    place(tick(k % 2 == 0), 23.0 + k * B / 2, 0.07, 0.3, 0.2)

# 24.0-24.67 silence; 24.67 title card
hit(24.667, 1.3)
place(bell(note("D4")), 24.667, 0.2, 0, 0.7)
choir(24.667, 3.9, ["D3", "A3", "D4", "F4"], 0.16)
pad(24.667, 3.9, ["D3", "F3", "A3", "D4"], 0.1, 1500, 0.2, 1.2)

# 28.67 silence ... 29.6 the sting
hit(29.6, 1.25, br=False)

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "score_teaser2.wav")
full = out.replace(".wav", "_60.wav")
S.master(full)
os.system(f"ffmpeg -v error -y -i {full} -t 30 -af 'afade=t=out:st=29.82:d=0.18' {out} && rm {full}")
print("ok", out)
