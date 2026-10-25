"""Original 60s score for Chapter Two, 'Rule One: Never Look Back at the Ghat' (D minor, 90 bpm).

Night-drive pulse, PLUTONIUM hit, title hits, Gabbar's rules, the ghosts, high beams,
headlights off (silence + heartbeat), Devprayag choir, 'he looked back', escape drums,
dhaba bansuri, the @ND65 comment, end hit. Synth only, no whooshes.
"""
import os
import sys

import numpy as np

import synthlib as S
from synthlib import B, BAR, SR, note, place, pad, drone, braam, hit, taiko, sub_boom, tick, heartbeat, piano, celesta, pluck_str, env_adsr, additive

rng = np.random.default_rng(9)


def choir(start, dur, chord, gain=0.16):
    """'Aah' pad: harmonics shaped by two fixed formants, slow vibrato."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for i, nm in enumerate(chord):
        f0 = note(nm)
        for dt in (-0.005, 0.0, 0.005):
            vib = 1 + 0.004 * np.sin(2 * np.pi * (5.2 + i * 0.4) * t + rng.uniform(0, 6))
            ph = 2 * np.pi * np.cumsum(f0 * (1 + dt) * vib) / SR
            for h in range(1, 24):
                fh = f0 * h
                a = (np.exp(-((fh - 700) / 260) ** 2) + 0.6 * np.exp(-((fh - 1150) / 300) ** 2) + 0.15 / h)
                sig += a * np.sin(h * ph)
    sig *= env_adsr(n, 0.9, 0, 1, 1.2)
    place(sig / (3 * len(chord) * 3), start, gain, 0, 0.6)


def bansuri(f, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.0 * t) * np.clip(t / 0.4, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    s = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    return s * env_adsr(n, 0.08, 0.1, 0.85, 0.25)


def engine(start, dur, root="D1", gain=0.3, rate=2):
    """Night-drive pulse: low saw 8ths/16ths with a pumping envelope."""
    step = B / rate
    k = 0
    while k * step < dur:
        st = start + k * step
        place(pluck_str(note(root) * (2 if k % 4 == 2 else 1), step * 0.95, 700), st, gain * (1.0 if k % 2 == 0 else 0.7), -0.1, 0.15)
        k += 1


PROG = ["Dm", "Bb", "Gm", "A"]
CH = {"Dm": ["D3", "F3", "A3", "D4"], "Bb": ["Bb2", "D3", "F3", "Bb3"], "Gm": ["G2", "D3", "G3", "Bb3"],
      "A": ["A2", "E3", "A3", "C#4"], "C": ["C3", "E3", "G3", "C4"]}

# A 0-8: the black SUV, four cars behind
drone(0.0, 8.4, "D1", 0.3, 380)
engine(0.0, 8.0, "D1", 0.24)
for k in range(12):
    place(tick(k % 2 == 0), k * B, 0.05, 0.3 if k % 2 else -0.3, 0.2)
pad(BAR, 2 * BAR + 0.4, CH["Dm"], 0.1, 1100, 1.0, 0.8)
for nm, bt in (("A4", 0), ("Bb4", 1.5), ("A4", 2), ("F4", 3), ("E4", 4), ("D4", 6)):
    place(piano(note(nm)), BAR + bt * B, 0.17, -0.2, 0.6)

# B 8-13.33: the search -> PLUTONIUM
for k in range(8):
    place(tick(True), 8.0 + k * B / 2, 0.045, 0.4, 0.2)            # typing
pad(8.0, 4.2, ["D3", "Ab3", "D4"], 0.09, 900, 0.5, 0.6)
hit(12.0, 1.15)
place(celesta(note("D6")), 12.67, 0.12, 0.2, 0.7)

# C 13.33-16: chapter title hits
for s, sz in ((14.0, 0.9), (14.667, 0.95), (15.333, 1.2)):
    hit(s, sz, br=(s == 15.333))

# D 16-26.67: Gabbar's rules (3 bars) + the ghosts (1 bar)
for bar in range(6, 9):
    st = bar * BAR
    pad(st, BAR + 0.4, CH[PROG[(bar - 6) % 4]], 0.11, 1400, 0.3, 0.5)
    place(taiko(0.9, 1.6), st, 0.5, 0, 0.3)
    place(taiko(0.6, 1.2), st + 2 * B, 0.3, 0, 0.3)
    engine(st, BAR, {"Dm": "D1", "Bb": "Bb0", "Gm": "G0", "A": "A0"}[PROG[(bar - 6) % 4]], 0.2)
choir(9 * BAR, BAR + 0.8, ["D3", "A3", "D4"], 0.2)
for i, s in enumerate((24.0, 24.889, 25.778)):
    place(taiko(1.0, 1.8), s, 0.55, 0, 0.35)
    place(sub_boom(2.0, 60, 30), s, 0.35)
    place(piano(note(["D3", "C#3", "C3"][i])), s, 0.2, 0, 0.6)

# E 26.67-34.67: 9:40 p.m. high beams, then headlights OFF
hit(26.667, 1.25)
engine(26.667, 2.6, "D1", 0.34, rate=4)
for k in range(6):
    place(tick(True), 26.667 + k * B / 2, 0.08, 0.3, 0.2)
place(sub_boom(4.5, 45, 22), 29.333, 0.8)                            # lights off: everything drops
for k in range(5):
    place(heartbeat(), 29.6 + k * 1.0, 0.6, 0, 0.12)
drone(29.333, 5.4, "D1", 0.22, 220)

# F 34.67-45.33: Devprayag - confluence, the torch, Masan, he looked back, escape
hit(34.667, 1.1)
choir(34.667, 2 * BAR + 0.5, ["D3", "F3", "A3", "D4"], 0.22)
pad(34.667, 2 * BAR, CH["Dm"], 0.09, 1200, 1.0, 1.0)
for k in range(8):
    place(taiko(0.55, 1.2), 34.667 + 2 * BAR * k / 8, 0.22, 0, 0.3)
for nm, s in (("D4", 37.33), ("Eb4", 38.67), ("D4", 40.0)):
    place(piano(note(nm)), s, 0.2, -0.2, 0.6)
for k in range(8):                                                   # tension: accelerating ticks
    place(tick(True), 40.0 + k * B / 2.6, 0.08, 0.25, 0.2)
hit(42.667, 1.35)
choir(42.667, 2.8, ["D3", "Ab3", "D4", "F4"], 0.26)
hit(44.0, 1.1, br=False)
engine(44.0, 1.4, "D1", 0.38, rate=4)
for bt, sz in ((0, 1.0), (0.5, 0.7), (1, 0.9), (1.5, 0.7)):
    place(taiko(sz, 1.4), 44.0 + bt * B, 0.5 * sz, 0, 0.3)

# G 45.33-53.33: the dhaba, the fire, Gabbar sings
pad(45.333, 3 * BAR + 0.5, CH["Dm"], 0.1, 1000, 1.2, 1.5)
pad(48.0, BAR + 0.4, CH["Bb"], 0.08, 1000, 0.8, 0.8)
pad(50.667, BAR + 0.4, CH["Gm"], 0.08, 1000, 0.8, 0.8)
MEL = [("A4", 0, 1.0), ("C5", 1, 0.5), ("D5", 1.5, 1.5), ("C5", 3, 0.5), ("A4", 3.5, 1.0), ("G4", 4.5, 0.5), ("A4", 5, 2.0),
       ("F4", 7, 0.5), ("G4", 7.5, 0.5), ("A4", 8, 1.0), ("D5", 9, 1.5), ("C5", 10.5, 0.5), ("A4", 11, 1.0)]
for nm, bt, ln in MEL:
    place(bansuri(note(nm), ln * B * 1.05 + 0.15), 45.6 + bt * B, 0.2, 0.15, 0.55)
for k in range(8):
    place(pluck_str(note("D2"), 0.35, 700), 45.333 + k * 2 * B * 0.75, 0.12, -0.2, 0.3)

# H 53.33-56: '@ND65: Notebook wapas karo, Professor.'
hit(53.333, 1.0)
for k in range(6):
    place(tick(k % 2 == 0), 53.67 + k * B / 2, 0.08, 0.2, 0.2)
drone(53.333, 2.8, "D1", 0.25, 260)

# I 56-60: end card
hit(56.0, 1.35)
choir(56.0, 4.1, ["D3", "A3", "D4", "F4"], 0.18)
pad(56.0, 4.1, CH["Dm"], 0.12, 1800, 0.1, 2.5)
for nm, bt in (("D5", 0), ("F5", 1), ("A5", 2), ("G#5", 3)):
    place(celesta(note(nm)), 56.9 + bt * B / 2, 0.13, 0.25, 0.7)

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "score_ch2.wav")
S.master(out)
