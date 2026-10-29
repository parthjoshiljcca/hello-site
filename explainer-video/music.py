# Generates an original, royalty-free background track for the videos: a soft
# I-V-vi-IV progression in D major with a warm pad, plucked arpeggio, bass and
# light percussion, sized to the video.
#
#   python3 music.py <seconds> <out.wav>
import sys
import wave

import numpy as np

SR = 48000
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
dur = float(sys.argv[1])
out_path = sys.argv[2]
n = int(SR * (dur + 2))
mix = np.zeros((n, 2))
rng = np.random.default_rng(3)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# D - A - Bm - G, as MIDI triads around middle C.
CHORDS = [[62, 66, 69], [61, 64, 69], [62, 66, 71], [62, 67, 71]]
ROOTS = [38, 45, 47, 43]


def add(sig, start, pan=0.5, gain=1.0):
    i = int(start * SR)
    if i >= n:
        return
    sig = sig[: n - i] * gain
    mix[i:i + len(sig), 0] += sig * np.sqrt(1 - pan)
    mix[i:i + len(sig), 1] += sig * np.sqrt(pan)


def pad_note(f, length):
    t = np.arange(int(SR * (length + 1.2))) / SR
    tone = sum(np.sin(2 * np.pi * f * k * t * (1 + d)) / k ** 2 for k in (1, 2, 3, 4) for d in (-0.0025, 0.0025)) / 4
    env = np.minimum(1, t / 0.6) * np.where(t < length, 1, np.exp(-(t - length) * 3))
    return tone * env


def pluck(f):
    t = np.arange(int(SR * 0.9)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 7) * np.minimum(1, t / 0.004)


def bass(f, length):
    t = np.arange(int(SR * length)) / SR
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.01) * np.exp(-t * 1.8)


def kick():
    t = np.arange(int(SR * 0.35)) / SR
    return np.sin(2 * np.pi * (45 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 11)


def hat():
    t = np.arange(int(SR * 0.06)) / SR
    noise = np.diff(rng.standard_normal(len(t) + 1))  # crude high-pass
    return noise * np.exp(-t * 70)


bars = int(dur / BAR) + 1
for b in range(bars):
    t0 = b * BAR
    chord, root = CHORDS[b % 4], ROOTS[b % 4]
    for k, m in enumerate(chord):
        add(pad_note(hz(m), BAR), t0, pan=0.3 + 0.2 * k, gain=0.16)
    if b >= 2:  # arpeggio and bass come in after the intro
        arp = chord + [chord[1] + 12, chord[2] + 12, chord[0] + 12, chord[2], chord[1]]
        for s in range(8):
            add(pluck(hz(arp[s] + 12)), t0 + s * BEAT / 2, pan=0.25 + 0.5 * (s % 2), gain=0.11)
        add(bass(hz(root), BEAT * 1.9), t0, gain=0.32)
        add(bass(hz(root), BEAT * 1.9), t0 + 2 * BEAT, gain=0.26)
    if b >= 4:  # soft groove from bar 5
        for s in range(4):
            if s in (0, 2):
                add(kick(), t0 + s * BEAT, gain=0.38)
            add(hat(), t0 + s * BEAT + BEAT / 2, pan=0.6, gain=0.05)

mix = mix[: int(SR * dur)]
t = np.arange(len(mix)) / SR
fade = np.minimum(1, t / 2.5) * np.minimum(1, (dur - t) / 3.5)
mix *= fade[:, None]
mix /= np.abs(mix).max() / 0.8

with wave.open(out_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
