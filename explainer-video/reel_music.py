# Original 10-second score for reel.html (exam completed): ticking build-up, a boom and
# confetti "pop" on the checkmark at 2 s, a bright 120 BPM groove (D - A - Bm) under the
# proof points, and a resolving G -> D chord on the logo at 8 s.
#
#   python3 reel_music.py <out.wav>
import sys
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter

SR, DUR, BEAT = 48000, 10.0, 0.5
N = int(SR * (DUR + 3))
rng = np.random.default_rng(5)
dry, wet = np.zeros((N, 2)), np.zeros((N, 2))


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(sec):
    return np.arange(int(SR * sec)) / SR


def lp(x, f):
    a = 1 - np.exp(-2 * np.pi * f / SR)
    return lfilter([a], [1, a - 1], x)


def hp(x, f):
    return x - lp(x, f)


def saw(f, t, kmax=20):
    k = np.arange(1, max(2, min(kmax, int(9000 / f))) + 1)[:, None]
    return (np.sin(2 * np.pi * f * k * t) / k).sum(0) * (2 / np.pi)


def place(sig, at, gain=1.0, pan=0.5, send=0.0):
    i = int(at * SR)
    sig = sig[: N - i] * gain
    st = np.stack([sig * np.sqrt(1 - pan), sig * np.sqrt(pan)], 1)
    dry[i:i + len(sig)] += st
    wet[i:i + len(sig)] += st * send


def kick():
    t = tt(.45)
    return np.sin(2 * np.pi * (45 + 120 * np.exp(-t * 28)) * t) * np.exp(-t * 8)


def clap():
    t = tt(.25)
    env = sum(np.exp(-np.maximum(0, t - o) * 60) * (t >= o) for o in (0, .012, .024))
    return hp(rng.standard_normal(len(t)), 1200) * env * .5


def hat():
    t = tt(.05)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * 80)


def tick(hi):
    t = tt(.05)
    return np.sin(2 * np.pi * (2600 if hi else 1900) * t) * np.exp(-t * 120) + .5 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200)


def boom(size):
    t = tt(2.5)
    sub = np.sin(2 * np.pi * np.cumsum(32 + 110 * np.exp(-t * 2.5)) / SR) * np.exp(-t * 1.5)
    return (sub + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 5) * .7 + hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 1.8) * .25) * size


def pop():  # confetti cannon
    t = tt(.4)
    return hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 25) + .4 * np.sin(2 * np.pi * 900 * t * (1 - t)) * np.exp(-t * 18)


def riser(length):
    t = tt(length)
    n, out, y = rng.standard_normal(len(t)), np.empty(len(t)), 0.0
    for i in range(0, len(t), 256):
        f = 200 * (9000 / 200) ** (i / len(t))
        a = 1 - np.exp(-2 * np.pi * f / SR)
        seg, _ = lfilter([a], [1, a - 1], n[i:i + 256], zi=[y * (1 - a)])
        out[i:i + 256], y = seg, seg[-1]
    return out * (t / length) ** 2.2 * .7


def pad(chord, length):
    t = tt(length + 1.2)
    sig = sum(saw(hz(m) * (1 + d), t, 10) for m in chord for d in (-.004, .004)) / (2 * len(chord))
    return lp(lp(sig, 2400), 2400) * np.minimum(1, t / .3) * np.where(t < length, 1, np.exp(-(t - length) * 3))


def pluck(m):
    t = tt(.3)
    return lp(saw(hz(m), t, 14), 4000) * np.exp(-t * 14)


def bass(m, length):
    t = tt(length)
    return lp(saw(hz(m), t, 24), 450) * np.exp(-t * 3)


def bell(m):
    t = tt(1.5)
    return (np.sin(2 * np.pi * hz(m) * t) + .4 * np.sin(2 * np.pi * hz(m) * 2.76 * t) * np.exp(-t * 4)) * np.exp(-t * 2.5)


# chords (MIDI) and bass roots
D, A, Bm, G = [62, 66, 69], [61, 64, 69], [62, 66, 71], [62, 67, 71]

# 0-2 s: build-up
for k in range(4):
    place(tick(k % 2 == 0), k * BEAT, .3, pan=.4 + .2 * (k % 2))
place(pad([50, 57, 62], 1.9) * np.linspace(.2, 1, len(pad([50, 57, 62], 1.9))), 0, .35, send=.4)
place(riser(2.0), 0, .5, send=.3)

# 2 s: checkmark hit
place(boom(1.0), 2, .9, send=.4)
place(pop(), 2.02, .5, pan=.35, send=.3)
place(pop(), 2.06, .45, pan=.65, send=.3)
for k, m in enumerate([74, 78, 81, 86]):
    place(bell(m), 2.05 + k * .06, .16, pan=.3 + .15 * k, send=.6)

# 2-8 s: groove
for b, (chord, root) in enumerate([(D, 38), (A, 45), (Bm, 47)]):
    t0 = 2 + b * 2
    place(pad(chord, 2), t0, .3, send=.5)
    arp = chord + [chord[1] + 12, chord[2] + 12, chord[0] + 12, chord[2], chord[1]]
    for s in range(16):
        place(pluck(arp[s % 8] + 12), t0 + s * BEAT / 4, .13, pan=.3 + .4 * (s % 2), send=.35)
    for s in range(8):
        place(bass(root, BEAT / 2 * .95), t0 + s * BEAT / 2, .45)
    for s in range(4):
        place(kick(), t0 + s * BEAT, .9)
        if s in (1, 3):
            place(clap(), t0 + s * BEAT, .6, send=.25)
        place(hat(), t0 + s * BEAT + BEAT / 2, .12, pan=.65)
for k, at in enumerate([5, 5.75, 6.5]):  # one sparkle per proof point
    place(bell(81 + 2 * k), at, .14, pan=.35 + .15 * k, send=.6)
place(riser(1.0), 7, .3, send=.3)

# 8-10 s: resolve on the logo
place(boom(.6), 8, .7, send=.4)
place(pop(), 8.02, .35, send=.3)
place(pad(G, .9), 8, .32, send=.6)
place(pad(D, 1.6), 9, .34, send=.7)
place(bass(43, .9), 8, .4)
place(bass(38, 1.6), 9, .4)
for k, m in enumerate([74, 78, 81, 86, 90]):
    place(bell(m), 9 + k * .09, .12, pan=.2 + .15 * k, send=.7)

# reverb + master
ir_t = tt(2.2)
ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3) for _ in range(2)], 1)
rev = np.stack([fftconvolve(wet[:, c], ir[:, c])[:N] for c in range(2)], 1)
mix = dry + rev * (np.abs(dry).max() / (np.abs(rev).max() + 1e-9)) * .2
mix = mix[: int(SR * DUR)]
t = np.arange(len(mix)) / SR
mix *= np.minimum(1, (DUR - t) / .8)[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.5) / np.tanh(1.5) * .89

with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
