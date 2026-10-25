"""Original 60s mysterious/epic trailer score for Chapter One (D minor, 90 bpm).

No samples: drone, string pad, staccato ostinato, celesta, piano, taiko, braams,
clock ticks, heartbeat, spoon clatter - all synthesized, then convolution reverb.
No noise risers / whooshes.
"""
import os
import sys

import numpy as np
from scipy.signal import fftconvolve

SR = 48000
DUR = 60.0
N = int(SR * DUR)
B = 60 / 90                 # beat
BAR = 4 * B
rng = np.random.default_rng(3)
t_all = np.arange(N) / SR

dry = np.zeros((2, N))
wet = np.zeros((2, N))      # reverb send


def note(f):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "Eb": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "Ab": -1,
             "A": 0, "A#": 1, "Bb": 1, "B": 2}
    n, o = f[:-1], int(f[-1])
    return 440 * 2 ** ((names[n] + 12 * (o - 4)) / 12)


def place(sig, start, gain=1.0, pan=0.0, send=0.3):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    dry[0, i:i + len(sig)] += sig * gain * l * (1 - send * 0.5)
    dry[1, i:i + len(sig)] += sig * gain * r * (1 - send * 0.5)
    wet[0, i:i + len(sig)] += sig * gain * l * send
    wet[1, i:i + len(sig)] += sig * gain * r * send


def env_adsr(n, a, d, s, r, sr=SR):
    e = np.ones(n) * s
    na, nd, nr = int(a * sr), int(d * sr), int(r * sr)
    na = max(na, 1)
    e[:na] = np.linspace(0, 1, na)
    if nd:
        e[na:na + nd] = np.linspace(1, s, min(nd, max(n - na, 0)))[: len(e[na:na + nd])]
    if nr and n > nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def additive(f0, dur, nharm=24, rolloff=1.0, cutoff=4000, detune=0.0, vib=0.0, vibf=5.0, phase_rand=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    fm = 1 + vib * np.sin(2 * np.pi * vibf * t)
    for h in range(1, nharm + 1):
        fh = f0 * h
        if fh > 16000:
            break
        a = (1 / h ** rolloff) / (1 + (fh / cutoff) ** 4)
        if a < 1e-4:
            continue
        ph = rng.uniform(0, 2 * np.pi) if phase_rand else 0
        out += a * np.sin(2 * np.pi * fh * (1 + detune) * np.cumsum(fm) / SR + ph)
    return out


# ------------------------------------------------------------------ instruments
def drone(start, dur, root="D1", gain=0.35, bright=500):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f, g in ((note(root), 1.0), (note(root) * 2, 0.6), (note(root) * 3, 0.35)):
        for dt in (-0.003, 0.0, 0.004):
            sig += g * additive(f, dur, nharm=30, rolloff=1.0, cutoff=bright, detune=dt)
    sig *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * t)) * env_adsr(n, 2.0, 0, 1, 2.0)
    place(sig / 6, start, gain, 0, 0.35)


def pad(start, dur, chord, gain=0.18, bright=1800, attack=1.2, release=1.5, vib=0.0015):
    n = int(dur * SR)
    sig = np.zeros(n)
    for i, nm in enumerate(chord):
        for dt in (-0.004, 0.0035):
            sig += additive(note(nm), dur, nharm=20, rolloff=1.1, cutoff=bright, detune=dt, vib=vib, vibf=4.6 + i * 0.3)
    sig *= env_adsr(n, attack, 0, 1, release)
    place(sig / (2 * len(chord)), start, gain, 0, 0.55)


def pluck_str(f, dur=0.22, bright=1400):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = additive(f, dur, nharm=16, rolloff=1.0, cutoff=bright) + 0.6 * additive(f * 1.003, dur, nharm=16, rolloff=1.0, cutoff=bright)
    return s * np.exp(-t * 14) * env_adsr(n, 0.006, 0, 1, 0.03)


def celesta(f, dur=2.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + 0.35 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 6) \
        + 0.18 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 11)
    return s * env_adsr(n, 0.002, 0, 1, 0.2)


def piano(f, dur=3.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for h in range(1, 10):
        fh = f * h * np.sqrt(1 + 0.0004 * h * h)
        s += (1 / h ** 1.3) * np.sin(2 * np.pi * fh * t) * np.exp(-t * (0.9 + 0.5 * h))
    return s * env_adsr(n, 0.003, 0, 1, 0.3)


def taiko(size=1.0, dur=2.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 42 + 85 * np.exp(-t * 22) * size
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (5.0 / size))
    click = rng.normal(0, 1, n) * np.exp(-t * 420)
    hit = body + 0.25 * click
    return hit * env_adsr(n, 0.001, 0, 1, 0.2)


def sub_boom(dur=4.0, f0=70, f1=28):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 3)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 0.9) * env_adsr(n, 0.004, 0, 1, 0.5)


def braam(start, dur=3.2, root="D1", gain=0.55):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    fc = 160 + 2400 * np.exp(-t * 1.3) * (1 - np.exp(-t * 25))
    for f in (note(root), note(root) * 2, note(root) * 3, note(root) * 4 * 1.0):
        for dt in (-0.006, 0.0, 0.007):
            for h in range(1, 40):
                fh = f * h * (1 + dt)
                if fh > 9000:
                    break
                a = (1 / h) / (1 + (fh / fc) ** 3)
                sig += a * np.sin(2 * np.pi * fh * t + rng.uniform(0, 6.28))
    sig = np.tanh(sig / 8 * 2.2)
    sig *= env_adsr(n, 0.03, 0, 1, 1.2) * np.exp(-t * 0.55)
    place(sig, start, gain, 0, 0.45)


def tick(high=True):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    f = 3100 if high else 2300
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 300) + 0.4 * np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 500))


def heartbeat():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    def thump(t0, a):
        tt = np.clip(t - t0, 0, None)
        return a * np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 22) * (t >= t0)
    return thump(0, 1.0) + thump(0.18, 0.7)


def clang_spoons(start):
    # one big metallic strike + a cascade of small clinks (spoons on marble)
    def metal(f0, dur, decay, amp):
        n = int(dur * SR); t = np.arange(n) / SR
        partials = (1.0, 2.76, 5.40, 8.93, 13.34)
        s = sum(np.sin(2 * np.pi * f0 * p * t + rng.uniform(0, 6)) * np.exp(-t * decay * (1 + i * 0.6)) / (1 + i * 0.7)
                for i, p in enumerate(partials))
        return s * amp * env_adsr(n, 0.0008, 0, 1, 0.05)
    place(metal(880, 2.5, 2.5, 0.5), start, 0.55, -0.2, 0.4)
    place(metal(1240, 2.5, 3.0, 0.4), start + 0.004, 0.5, 0.25, 0.4)
    tt = start + 0.03
    for i in range(34):
        tt += rng.exponential(0.035) + 0.008
        place(metal(rng.uniform(1500, 3600), 0.6, rng.uniform(6, 12), 0.25 * np.exp(-i / 18)), tt, 0.5, rng.uniform(-0.8, 0.8), 0.3)


def hit(start, size=1.0, br=True, boom=True):
    place(taiko(1.3 * size, 2.5), start, 0.9 * size, 0, 0.35)
    if boom:
        place(sub_boom(3.5), start, 0.55 * size, 0, 0.1)
    if br:
        braam(start, 3.0, "D1", 0.42 * size)


# ------------------------------------------------------------------ score
CH = {"Dm": ["D3", "F3", "A3", "D4"], "Bb": ["Bb2", "D3", "F3", "Bb3"], "Gm": ["G2", "D3", "G3", "Bb3"],
      "A": ["A2", "E3", "A3", "C#4"], "Dm_hi": ["D4", "F4", "A4"], "Bb_hi": ["Bb3", "D4", "F4"]}
PROG = ["Dm", "Bb", "Gm", "A"]
MOTIF = [("D5", 0), ("F5", 1), ("A5", 2), ("G#5", 3), ("A5", 4.5), ("F5", 5), ("E5", 6), ("D5", 7)]

# A  0-10.67  clipping: drone, ticks, celesta, pad from bar 1
drone(0.0, 28.0, "D1", 0.32, 420)
place(sub_boom(4.0, 60, 30), 0.25, 0.4)
for k in range(16):
    place(tick(k % 2 == 0), k * B, 0.05 if k < 4 else 0.08, 0.3 if k % 2 else -0.3, 0.2)
for bar in (1, 2, 3):
    pad(bar * BAR, BAR + 0.6, CH[PROG[bar % 4]], 0.11, 1200, 0.8, 0.8)
for bar in (1, 3):
    for nm, bt in MOTIF:
        place(celesta(note(nm)), bar * BAR + bt * B / 2 * 1.0, 0.16, 0.25, 0.6)

# B 10.67-16  title hits
pad(4 * BAR, 2 * BAR, CH["Dm"], 0.08, 900, 0.5, 1.0)
for s, sz in ((11.333, 1.0), (12.667, 1.0), (14.0, 1.25)):
    hit(s, sz)
for k in range(4):
    place(tick(True), 15.333 + k * B / 2, 0.07, 0.2, 0.2)

# C 16-26.67  the company: ostinato + pad + percussion
for bar in range(6, 10):
    st = bar * BAR
    pad(st, BAR + 0.4, CH[PROG[(bar - 6) % 4]], 0.12, 1600, 0.25, 0.5)
    root = {"Dm": "D2", "Bb": "Bb1", "Gm": "G1", "A": "A1"}[PROG[(bar - 6) % 4]]
    for e in range(8):
        f = note(root) * (2 if e % 2 else 1)
        place(pluck_str(f), st + e * B / 2, 0.36 if e % 2 == 0 else 0.26, -0.15, 0.2)
    place(taiko(0.8, 1.5), st, 0.45, 0, 0.3)
    place(taiko(0.6, 1.2), st + 2 * B, 0.3, 0, 0.3)
    for e in (1, 3):
        place(tick(False), st + e * B, 0.12, 0.4, 0.25)
for i in range(8):                                   # soft accent on each card change
    place(taiko(0.5, 1.0), 16 + i * 2 * B, 0.18, 0.2, 0.3)
for nm, bt in MOTIF:
    place(celesta(note(nm) * 0.5 * 2), 8 * BAR + bt * B / 2, 0.12, 0.3, 0.6)

# D 26.67-34.67  corridor 2:14 a.m.: drop out, heartbeat, piano, accelerating ticks, pitched swell
drone(26.667, 8.2, "D1", 0.3, 260)
for k in range(6):
    place(heartbeat(), 26.8 + k * 1.333, 0.55 - 0.05 * k, 0, 0.15)
for nm, s in (("D4", 27.0), ("A3", 28.33), ("Bb3", 29.67), ("A3", 31.0), ("D3", 32.33)):
    place(piano(note(nm)), s, 0.22, -0.2, 0.6)
ts = 30.67
step = 0.5
while ts < 34.5:
    place(tick(True), ts, 0.08, 0.25, 0.2)
    ts += step
    step = max(0.09, step * 0.86)
n = int(2.6 * SR); tt = np.arange(n) / SR
swell = np.zeros(n)
for nm in ("D3", "A3", "D4", "F4"):
    f = note(nm) * 2 ** (tt / 2.6 * 0.5)            # rises a tritone-ish, pitched (no noise)
    for dt in (-0.004, 0.004):
        ph = 2 * np.pi * np.cumsum(f * (1 + dt)) / SR
        swell += sum((1 / h) * np.sin(h * ph) for h in range(1, 8))
swell *= (tt / 2.6) ** 2.2 * env_adsr(n, 0.01, 0, 1, 0.03)
place(swell / 12, 31.95, 0.32, 0, 0.4)

# E 34.67-42.67  CLANG + chase + ring light + full drums
clang_spoons(34.667)
hit(34.667, 1.1, br=False)
for e in range(16):                                  # chase: fast ostinato
    place(pluck_str(note("D2") * (2 if e % 2 else 1), 0.18, 1800), 35.5 + e * B / 4, 0.32, -0.1, 0.2)
place(taiko(1.0, 1.5), 35.5, 0.5, 0, 0.3); place(taiko(1.0, 1.5), 36.17, 0.45, 0, 0.3); place(taiko(1.0, 1.5), 36.83, 0.5, 0, 0.3)
hit(37.333, 1.3)
for bar in range(14, 16):
    st = 37.333 + (bar - 14) * BAR
    pad(st, BAR + 0.3, CH[["Dm", "Bb"][bar - 14]], 0.2, 2600, 0.08, 0.6, vib=0.003)
    pad(st, BAR + 0.3, CH[["Dm_hi", "Bb_hi"][bar - 14]], 0.1, 3200, 0.2, 0.6, vib=0.004)
    root = ["D2", "Bb1"][bar - 14]
    for e in range(16):
        place(pluck_str(note(root) * (2 if e % 2 else 1), 0.16, 2000), st + e * B / 4, 0.3, -0.1, 0.2)
    for bt, sz in ((0, 1.1), (1, 0.6), (1.5, 0.6), (2, 1.0), (3, 0.6), (3.5, 0.8)):
        place(taiko(sz, 1.6), st + bt * B, 0.55 * sz, 0, 0.3)
braam(40.0, 2.6, "Bb0", 0.38)

# F 42.67-50.67  notebook: pad + celesta + soft pulse, torn-out hit
for bar in range(16, 19):
    st = bar * BAR
    pad(st, BAR + 0.5, CH[PROG[(bar - 16) % 4]], 0.12, 1400, 0.6, 0.8)
    for e in range(4):
        place(pluck_str(note("D2"), 0.25, 900), st + e * B, 0.2, -0.1, 0.25)
for nm, bt in MOTIF:
    place(celesta(note(nm)), 42.9 + bt * B / 2, 0.15, 0.25, 0.6)
for nm, s in (("A4", 46.67), ("G#4", 47.33), ("A4", 48.0), ("D5", 48.67)):
    place(piano(note(nm)), s, 0.2, -0.2, 0.6)
hit(49.333, 0.9)

# G 50.67-56  the note from R.: ticks, piano, silence, headlights boom
drone(50.667, 5.6, "D1", 0.26, 300)
for k in range(7):
    place(tick(k % 2 == 0), 50.667 + k * B, 0.07, 0.3 if k % 2 else -0.3, 0.2)
for nm, s in (("F4", 51.0), ("E4", 52.33), ("D4", 53.67)):
    place(piano(note(nm)), s, 0.2, -0.15, 0.6)
place(sub_boom(4.0, 55, 26), 54.667, 0.75)
braam(54.667, 2.5, "D0" if False else "D1", 0.3)

# H 56-60  end card: final hit and resolve
hit(56.0, 1.35)
pad(56.0, 4.2, CH["Dm"], 0.16, 2000, 0.1, 2.5)
pad(56.0, 4.2, CH["Dm_hi"], 0.08, 2600, 0.3, 2.5)
for nm, bt in MOTIF[:4]:
    place(celesta(note(nm)), 56.9 + bt * B / 2, 0.14, 0.25, 0.7)

# ------------------------------------------------------------------ reverb + master
ir_n = int(3.2 * SR)
it = np.arange(ir_n) / SR
ir = rng.normal(0, 1, (2, ir_n)) * np.exp(-it / 0.75)
k = np.ones(8) / 8
ir = np.array([np.convolve(c, k, mode="same") for c in ir])
ir[:, : int(0.012 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(1, keepdims=True))
rev = np.array([fftconvolve(wet[c], ir[c])[:N] for c in range(2)])
mix = dry + 0.9 * rev
mix -= mix.mean(1, keepdims=True)
mix = np.tanh(mix / (np.abs(mix).max() * 0.55)) * 0.97
fade = np.ones(N)
fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)) ** 2
mix *= fade
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "score_ch1.wav")
mix.T.astype(np.float32).tofile(out + ".raw")
os.system(f"ffmpeg -v error -y -f f32le -ar {SR} -ac 2 -i {out}.raw -c:a pcm_s16le {out} && rm {out}.raw")
print("ok", out)
