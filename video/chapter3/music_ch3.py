"""Original 60s score for Chapter Three, 'The Water That Cost a Son' (D minor, 90 bpm).

Cold open on the verse, the Maletha legend (drums + choir, 'HIS SON' then silence), title hits,
the canal (harp arpeggios), Bachi Ram ji (solo bansuri; three rising hits as the word changes,
Bhim Shila), 'songs are alive' (choir), Golu (light pizzicato), Dhari Devi (temple bell,
heartbeat, 'your mother' hit), the call, end. Synth only, no whooshes.
"""
import os
import sys

import numpy as np

import synthlib as S
from synthlib import B, BAR, SR, note, place, pad, drone, braam, hit, taiko, sub_boom, tick, heartbeat, piano, celesta, pluck_str, env_adsr
from synthlib import choir, bansuri

rng = np.random.default_rng(13)


def harp(f, dur=2.4):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((1 / h ** 1.6) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.2 + 1.4 * h)) for h in range(1, 7))
    return s * env_adsr(n, 0.002, 0, 1, 0.2)


def bell(f, dur=5.0):
    n = int(dur * SR); t = np.arange(n) / SR
    parts = ((0.5, 1.0, 0.6), (1.0, 0.9, 1.0), (1.19, 0.5, 1.5), (1.56, 0.45, 1.9), (2.0, 0.35, 2.4), (2.51, 0.25, 3.0), (3.0, 0.2, 3.6))
    s = sum(a * np.sin(2 * np.pi * f * p * t + rng.uniform(0, 6)) * np.exp(-t * d * 0.55) for p, a, d in parts)
    return s * env_adsr(n, 0.001, 0, 1, 0.4)


CH = {"Dm": ["D3", "F3", "A3", "D4"], "Bb": ["Bb2", "D3", "F3", "Bb3"], "Gm": ["G2", "D3", "G3", "Bb3"],
      "A": ["A2", "E3", "A3", "C#4"], "F": ["F2", "C3", "F3", "A3"], "C": ["C3", "E3", "G3", "C4"]}

# A 0-8: the verse, Gabbar, MALETHA
drone(0.0, 8.4, "D1", 0.28, 360)
for nm, bt, ln in (("A4", 0.5, 1.5), ("C5", 2, 1), ("D5", 3, 2), ("C5", 5, 1), ("A4", 6, 1.8)):
    place(bansuri(note(nm), ln * B + 0.2), bt * B, 0.17, 0.15, 0.55)
pad(BAR, 2 * BAR, CH["Dm"], 0.08, 900, 1.0, 0.8)
hit(5.333, 1.1)

# B 8-18.67: the legend
for bar in range(3, 7):
    st = bar * BAR
    pad(st, BAR + 0.3, CH[["Dm", "Bb", "Gm", "A"][bar - 3]], 0.11, 1500, 0.3, 0.5)
    place(taiko(0.9, 1.6), st, 0.5, 0, 0.3)
    place(taiko(0.6, 1.2), st + 2 * B, 0.32, 0, 0.3)
    for e in range(8):
        root = {"Dm": "D2", "Bb": "Bb1", "Gm": "G1", "A": "A1"}[["Dm", "Bb", "Gm", "A"][bar - 3]]
        place(pluck_str(note(root) * (2 if e % 2 else 1), 0.2, 1200), st + e * B / 2, 0.24, -0.1, 0.2)
for s in (12.0, 12.667, 13.333):                        # the three singhs
    place(taiko(1.0, 1.6), s, 0.5, 0, 0.3)
choir(13.333, 2 * BAR, ["D3", "A3", "D4"], 0.18)
place(sub_boom(3.0, 50, 25), 14.667, 0.5)               # the water would not flow
for k in range(8):
    place(tick(True), 16.0 + k * B / 2.4, 0.07, 0.25, 0.2)
hit(17.333, 1.35)                                        # HIS SON
place(bell(note("D4")), 17.333, 0.2, 0, 0.6)

# C 18.67-21.33: title
for s, sz in ((19.333, 0.9), (20.0, 0.95), (20.667, 1.2)):
    hit(s, sz, br=(s == 20.667))

# D 21.33-26.67: the canal - harp arpeggios, hopeful
for bar in range(8, 10):
    st = bar * BAR
    chord = ["F", "C"][bar - 8]
    pad(st, BAR + 0.5, CH[chord], 0.1, 1600, 0.4, 0.8)
    arp = {"F": ["F4", "A4", "C5", "F5", "C5", "A4", "F4", "C4"], "C": ["E4", "G4", "C5", "E5", "C5", "G4", "E4", "C4"]}[chord]
    for i, nm in enumerate(arp * 2):
        place(harp(note(nm)), st + i * B / 4, 0.14, -0.3 + 0.6 * (i % 4) / 3, 0.5)

# E 26.67-37.33: Bachi Ram ji - bansuri; the word changes; Bhim Shila
drone(26.667, 5.5, "D1", 0.22, 300)
for nm, bt, ln in (("D5", 0, 1.5), ("C5", 1.5, 0.5), ("A4", 2, 2), ("G4", 4, 1), ("A4", 5, 2.5), ("F4", 8, 1), ("E4", 9, 1), ("D4", 10, 2)):
    place(bansuri(note(nm), ln * B + 0.2), 26.9 + bt * B * 0.75, 0.15, 0.1, 0.55)
pad(32.0, 2 * BAR, CH["Dm"], 0.1, 1200, 0.6, 1.0)
for s, nm, sz in ((32.0, "D2", 0.8), (33.333, "F2", 0.95), (34.667, "A2", 1.1)):
    place(taiko(sz, 1.8), s, 0.55 * sz, 0, 0.3)
    place(piano(note(nm) * 2), s, 0.22, 0, 0.6)
    place(sub_boom(2.0, 60, 30), s, 0.3 * sz)
hit(36.0, 1.3)                                           # BHIM SHILA

# F 37.33-42.67: 'geet zinda hote hain', the last verse -> Dronagiri
choir(37.333, 2 * BAR + 0.6, ["D3", "F3", "A3", "D4"], 0.22)
pad(37.333, 2 * BAR, CH["Bb"], 0.08, 1300, 1.0, 1.0)
for nm, bt in (("D5", 0), ("F5", 1), ("A5", 2), ("G#5", 3), ("A5", 4.5), ("F5", 5), ("E5", 6), ("D5", 7)):
    place(celesta(note(nm)), 38.0 + bt * B / 2, 0.13, 0.25, 0.6)
place(sub_boom(3.0, 55, 28), 40.0, 0.4)

# G 42.67-45.33: Golu - light pizzicato, slightly playful
for e in range(16):
    nm = ["D3", "A3", "F3", "A3"][e % 4]
    place(pluck_str(note(nm), 0.14, 2400), 42.667 + e * B / 4, 0.16 if e % 2 else 0.22, 0.2, 0.2)
place(taiko(0.6, 1.0), 42.667, 0.3, 0, 0.3)
place(celesta(note("A5")), 44.0, 0.12, 0.2, 0.6)

# H 45.33-53.33: Dhari Devi - temple bell, river drone, heartbeat, 'your mother'
drone(45.333, 8.2, "D1", 0.28, 280)
for s in (45.4, 48.0, 50.667):
    place(bell(note("D4")), s, 0.24, -0.2, 0.7)
hit(46.667, 0.8, br=False)                               # the logo
for k in range(4):
    place(heartbeat(), 47.0 + k * 0.9, 0.5, 0, 0.12)
hit(50.667, 1.3)
choir(50.667, 2.6, ["D3", "Ab3", "D4"], 0.2)

# I 53.33-56: the call, point four
for k in range(4):
    place(tick(k % 2 == 0), 53.4 + k * B / 2, 0.06, 0.3, 0.2)
for nm, s in (("F4", 53.5), ("A4", 54.67), ("D5", 55.33)):
    place(piano(note(nm)), s, 0.2, -0.15, 0.6)
pad(54.667, 1.6, CH["F"], 0.1, 1400, 0.3, 0.6)

# J 56-60: end
hit(56.0, 1.35)
place(bell(note("D4")), 56.0, 0.22, 0, 0.7)
choir(56.0, 4.1, ["D3", "A3", "D4", "F4"], 0.16)
pad(56.0, 4.1, CH["Dm"], 0.12, 1800, 0.1, 2.5)

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "score_ch3.wav")
S.master(out)
