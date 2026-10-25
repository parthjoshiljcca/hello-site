"""Original 60s score for Chapter Four, 'The Rock That Stopped a River' (D minor, 90 bpm).

Diary cold open, the registers idea, Tilu Rauteli (war drums, three losses, 'she went to war'),
title hits, the trek (march), Bhalla on the trail, Kedarnath and the Bhim Shila (bell + choir),
the 1966 register (celesta, 'garam pathar'), the fog and the red jacket (heartbeat), the empty
bench (near silence, single piano, final hit), end. Synth only, no whooshes.
"""
import os
import sys

import numpy as np

import synthlib as S
from synthlib import (B, BAR, SR, note, place, pad, drone, braam, hit, taiko, sub_boom, tick, heartbeat, piano, celesta,
                      pluck_str, env_adsr, choir, bansuri)
from synthlib import bell, harp

CH = {"Dm": ["D3", "F3", "A3", "D4"], "Bb": ["Bb2", "D3", "F3", "Bb3"], "Gm": ["G2", "D3", "G3", "Bb3"],
      "A": ["A2", "E3", "A3", "C#4"], "F": ["F2", "C3", "F3", "A3"], "C": ["C3", "E3", "G3", "C4"]}
ROOT = {"Dm": "D2", "Bb": "Bb1", "Gm": "G1", "A": "A1", "F": "F1", "C": "C2"}


def ostinato(st, bars, chords, gain=0.24, div=2, bright=1300):
    for b in range(bars):
        c = chords[b % len(chords)]
        for e in range(4 * div):
            place(pluck_str(note(ROOT[c]) * (2 if e % 2 else 1), B / div * 0.9, bright), st + b * BAR + e * B / div, gain, -0.1, 0.2)


# A 0-5.33: Kshitij's diary - 'Rohan galat jagah ja raha hai'
drone(0.0, 5.6, "D1", 0.26, 340)
for k in range(8):
    place(tick(k % 2 == 0), k * B, 0.05, 0.3 if k % 2 else -0.3, 0.2)
for nm, s in (("D4", 0.3), ("F4", 1.6), ("A4", 2.9), ("G#4", 4.0)):
    place(piano(note(nm)), s, 0.18, -0.2, 0.6)
hit(5.333, 0.9, br=False)

# B 5.33-8: the registers
pad(5.333, BAR + 0.4, CH["F"], 0.1, 1500, 0.2, 0.6)
for i, nm in enumerate(["F4", "A4", "C5", "F5", "C5", "A4", "F4", "C4"]):
    place(harp(note(nm)), 5.333 + i * B / 2, 0.13, -0.3 + 0.6 * (i % 4) / 3, 0.5)

# C 8-18.67: Tilu Rauteli
hit(8.0, 1.0)
for bar in range(3, 7):
    st = bar * BAR
    c = ["Dm", "Bb", "Gm", "A"][bar - 3]
    pad(st, BAR + 0.3, CH[c], 0.12, 2000, 0.2, 0.5, vib=0.003)
    for bt, sz in ((0, 1.0), (1, 0.55), (1.5, 0.55), (2, 0.9), (3, 0.55), (3.5, 0.7)):
        place(taiko(sz, 1.5), st + bt * B, 0.45 * sz, 0, 0.3)
ostinato(8.0, 4, ["Dm", "Bb", "Gm", "A"], 0.22, 4, 1700)
for s in (11.333, 12.0, 12.667):                      # father, brothers, the man she was to marry
    place(sub_boom(2.0, 60, 30), s, 0.4)
    place(piano(note("D3")), s, 0.18, 0, 0.6)
choir(13.333, 2 * BAR, ["D3", "F3", "A3", "D4"], 0.2)
hit(16.0, 1.35)                                       # she went to war
choir(16.0, 2.8, ["D3", "A3", "D4", "F4"], 0.22)

# D 18.67-21.33: 'bees saal... teen sau saal'
pad(18.667, BAR + 0.3, CH["Bb"], 0.1, 1200, 0.6, 0.8)
for nm, bt, ln in (("F4", 0, 1), ("G4", 1, 1), ("A4", 2, 2)):
    place(bansuri(note(nm), ln * B + 0.2), 18.8 + bt * B, 0.16, 0.15, 0.55)
place(sub_boom(2.5, 55, 28), 20.0, 0.35)

# E 21.33-24: title hits
for s, sz in ((22.0, 0.9), (22.667, 0.95), (23.333, 1.2)):
    hit(s, sz, br=(s == 23.333))

# F 24-29.33: the trek - march; Bhalla at km 9
for bar in range(9, 11):
    st = bar * BAR
    c = ["Dm", "C"][bar - 9]
    pad(st, BAR + 0.3, CH[c], 0.1, 1500, 0.3, 0.5)
    for bt in range(4):
        place(taiko(0.7 if bt % 2 == 0 else 0.45, 1.2), st + bt * B, 0.32, 0, 0.3)
    for e in range(8):
        place(tick(e % 2 == 0), st + e * B / 2, 0.04, 0.35, 0.15)
ostinato(24.0, 2, ["Dm", "C"], 0.18, 2, 1000)
hit(26.667, 0.9, br=False)
braam(26.667, 2.6, "D1", 0.3)
for k in range(3):
    place(heartbeat(), 27.4 + k * 0.62, 0.45, 0, 0.12)

# G 29.33-34.67: Kedarnath, the Bhim Shila
place(bell(note("D4")), 29.333, 0.26, -0.1, 0.7)
choir(29.333, 2 * BAR + 0.6, ["D3", "A3", "D4", "F4"], 0.22)
pad(29.333, 2 * BAR, CH["Dm"], 0.1, 1800, 0.8, 1.0)
hit(30.667, 1.0, br=False)
place(bell(note("A3")), 32.0, 0.2, 0.2, 0.7)
hit(33.333, 1.25)

# H 34.67-42.67: the 1966 register
pad(34.667, 3 * BAR, CH["Dm"], 0.08, 1000, 1.0, 1.0)
for i, s in enumerate((36.0, 36.667, 37.333)):
    place(celesta(note(["A5", "F5", "D5"][i])), s, 0.15, 0.25, 0.6)
for k in range(12):
    place(tick(k % 2 == 0), 34.667 + k * B, 0.05, 0.3 if k % 2 else -0.3, 0.2)
hit(38.667, 1.0)                                     # 'garam pathar'
for s in (40.0, 40.333):                             # RAWAT underlined twice
    place(taiko(0.6, 1.0), s, 0.3, 0, 0.3)
place(piano(note("D3")), 40.667, 0.2, 0, 0.6)

# I 42.67-50.67: the fog, the red jacket
drone(42.667, 8.2, "D1", 0.3, 240)
for k in range(10):                                  # heavy footsteps in the white
    place(taiko(0.5, 0.9), 42.9 + k * 0.72, 0.22, -0.4 + 0.08 * k, 0.4)
place(bell(note("D3")), 43.0, 0.12, 0.3, 0.8)
hit(45.333, 0.9, br=False)
for nm, s in (("A3", 46.0), ("Bb3", 46.67), ("A3", 47.33)):
    place(piano(note(nm)), s, 0.18, -0.2, 0.6)
pad(48.0, 2 * BAR, CH["F"], 0.1, 1400, 0.4, 0.6)
hit(49.333, 1.1)

# J 50.67-56: the empty bench
place(sub_boom(4.0, 45, 22), 50.667, 0.5)
for nm, s in (("D4", 51.0), ("D4", 52.33)):
    place(piano(note(nm)), s, 0.2, 0, 0.7)
for k in range(5):
    place(tick(True), 53.333 + k * B / 2, 0.06, 0.3, 0.2)
hit(54.667, 1.35)

# K 56-60: end
place(bell(note("D4")), 56.0, 0.22, 0, 0.7)
choir(56.0, 4.1, ["D3", "A3", "D4"], 0.15)
pad(56.0, 4.1, CH["Dm"], 0.1, 1500, 0.4, 2.5)
place(sub_boom(4.0, 50, 25), 56.0, 0.4)

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "score_ch4.wav")
S.master(out)
