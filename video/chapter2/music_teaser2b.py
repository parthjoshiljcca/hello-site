"""30s teaser score v2 for Chapter Two - driving, one big silence. D minor, 90 bpm.

0 hook drone | 2.667 DON'T LOOK BACK | 4-9.33 ostinato build, caption hits | 9.333 high beams |
10.667 lights off (heartbeat) | 13.333 Devprayag | 14.67-18 build | 18.667 silence | 19.333 HE TURNED
AROUND | 20-21.33 chase | 21.333 @ND65 | 24-25.33 four stabs | 25.333 title | 28.4 silence | 29.4 sting.
"""
import os
import sys

import numpy as np

import synthlib as S
from synthlib import (B, BAR, SR, note, place, pad, drone, braam, hit, taiko, sub_boom, tick, heartbeat, piano,
                      pluck_str, env_adsr, choir, bell)


def drive(st, dur, root="D2", gain=0.26, div=4, bright=1600):
    e = 0
    while e * B / div < dur:
        place(pluck_str(note(root) * (2 if e % 4 == 2 else 1), B / div * 0.9, bright), st + e * B / div, gain * (1 if e % 2 == 0 else 0.75), -0.1, 0.15)
        e += 1


def drums(st, dur, sz=1.0):
    k = 0
    while k * B / 2 < dur:
        bt = k % 8
        place(taiko(sz if bt in (0, 4) else 0.6 * sz, 1.3), st + k * B / 2, (0.55 if bt in (0, 4) else 0.3 if bt in (2, 6) else 0.18) * sz, 0, 0.3)
        k += 1


# A: hook
drone(0.0, 4.2, "D1", 0.32, 320)
place(heartbeat(), 0.3, 0.45, 0, 0.1); place(heartbeat(), 1.4, 0.45, 0, 0.1)
place(piano(note("D3")), 0.2, 0.18, 0, 0.7)
hit(2.667, 1.25)

# B: setup, building drive
drive(4.0, 5.333, "D2", 0.22)
drums(4.0, 5.333, 0.8)
pad(4.0, 5.4, ["D3", "F3", "A3", "D4"], 0.09, 1500, 0.3, 0.3)
for s in (4.0, 5.333, 6.667, 8.0):
    place(sub_boom(1.6, 70, 32), s, 0.35)
braam(6.667, 2.4, "D1", 0.3)

# C: high beams, lights off, Devprayag
hit(9.333, 1.25)
drive(9.333, 1.333, "D2", 0.3, div=4, bright=2200)
place(sub_boom(4.5, 42, 20), 10.667, 0.85)
drone(10.667, 2.8, "D1", 0.26, 220)
for k in range(3):
    place(heartbeat(), 10.9 + k * 0.85, 0.55, 0, 0.1)
hit(13.333, 1.1)
choir(13.333, 5.2, ["D3", "F3", "A3", "D4"], 0.18)

# D: the torch, the build, silence, HE TURNED AROUND, chase
drive(14.667, 3.333, "D2", 0.18, div=4, bright=1200)
for k in range(5):
    place(taiko(0.55, 1.0), 14.667 + k * B, 0.25, 0, 0.3)
for nm, s in (("D4", 15.0), ("Eb4", 16.3), ("D4", 17.3)):
    place(piano(note(nm)), s, 0.2, -0.2, 0.6)
ts, step = 16.0, 0.35
while ts < 18.6:
    place(tick(True), ts, 0.09, 0.25, 0.15); ts += step; step = max(0.055, step * 0.84)
hit(19.333, 1.5)
choir(19.333, 2.0, ["D3", "Ab3", "D4", "F4"], 0.24)
drive(20.0, 1.333, "D2", 0.34, div=4, bright=2400)
drums(20.0, 1.333, 1.15)

# E: @ND65, stabs
hit(21.333, 1.05)
drive(21.333, 2.667, "D2", 0.22, div=4, bright=1600)
drums(21.333, 2.667, 0.9)
for s in (24.0, 24.333, 24.667, 25.0):
    place(taiko(1.2, 1.2), s, 0.6, 0, 0.3); place(sub_boom(1.0, 80, 35), s, 0.3)

# F: title, silence, sting
hit(25.333, 1.45)
choir(25.333, 3.0, ["D3", "A3", "D4", "F4"], 0.2)
place(bell(note("D4")), 25.333, 0.2, 0, 0.7)
hit(29.4, 1.3, br=False)

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "score_teaser2b.wav")
full = out.replace(".wav", "_60.wav")
S.master(full)
os.system(f"ffmpeg -v error -y -i {full} -t 30 -af 'afade=t=out:st=29.85:d=0.15' {out} && rm {full}")
print("ok", out)
