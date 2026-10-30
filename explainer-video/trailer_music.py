# Original trailer score + sound design for trailer.html, timed from trailer.json:
# a ticking intro with drone and risers, booms on every impact, a 120 BPM drop
# (Dm - Bb - F - C) with drums, bass, arpeggio and pads, a countdown breakdown with
# a snare roll, and a final swell.
#
#   python3 trailer_music.py <trailer.json> <out.wav>
import json
import sys
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter

SR = 48000
cues = json.load(open(sys.argv[1]))
DUR = cues["duration"]
BEAT = 60 / cues["bpm"]
BAR = 4 * BEAT
N = int(SR * (DUR + 3))
rng = np.random.default_rng(11)

dry = np.zeros((N, 2))
wet = np.zeros((N, 2))  # sent to reverb


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(sec):
    return np.arange(int(SR * sec)) / SR


def lp(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    return lfilter([a], [1, a - 1], x)


def hp(x, cutoff):
    return x - lp(x, cutoff)


def sweep_lp(x, f0, f1):
    """Low-pass whose cutoff glides from f0 to f1 (block-wise, state carried)."""
    out, y, blk = np.empty_like(x), 0.0, 256
    for i in range(0, len(x), blk):
        f = f0 * (f1 / f0) ** (i / len(x))
        a = 1 - np.exp(-2 * np.pi * f / SR)
        seg, zi = lfilter([a], [1, a - 1], x[i:i + blk], zi=[y * (1 - a)])
        out[i:i + blk], y = seg, seg[-1]
    return out


def saw(f, t, kmax=24):
    k = np.arange(1, max(2, min(kmax, int(9000 / f))) + 1)[:, None]
    return (np.sin(2 * np.pi * f * k * t) / k).sum(0) * (2 / np.pi)


def place(sig, at, gain=1.0, pan=0.5, send=0.0):
    i = int(at * SR)
    if i >= N or at < 0:
        return
    sig = sig[: N - i] * gain
    st = np.stack([sig * np.sqrt(1 - pan), sig * np.sqrt(pan)], 1)
    dry[i:i + len(sig)] += st
    if send:
        wet[i:i + len(sig)] += st * send


# ---- instruments ---------------------------------------------------------
def kick(big=1.0):
    t = tt(.5)
    return np.sin(2 * np.pi * (42 + 120 * np.exp(-t * 28)) * t) * np.exp(-t * 7 / big) + .25 * rng.standard_normal(len(t)) * np.exp(-t * 90)


def snare():
    t = tt(.3)
    return .55 * hp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 18) + .5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)


def hat(open_=False):
    t = tt(.25 if open_ else .05)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (12 if open_ else 80))


def tick(hi=True):
    t = tt(.05)
    return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200) + .6 * np.sin(2 * np.pi * (2600 if hi else 1900) * t) * np.exp(-t * 120)


def thump():
    t = tt(.6)
    return np.sin(2 * np.pi * (38 + 40 * np.exp(-t * 15)) * t) * np.exp(-t * 6)


def boom(size):
    t = tt(3.0)
    sub = np.sin(2 * np.pi * np.cumsum(30 + 110 * np.exp(-t * 2.5)) / SR) * np.exp(-t * 1.3)
    noise = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 4) * .8
    crash = hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 1.6) * .25
    return (sub * 1.1 + noise + crash) * size


def riser(length):
    t = tt(length)
    n = sweep_lp(rng.standard_normal(len(t)), 200, 9000) * .6
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * t / length)) / SR) * .25
    env = (t / length) ** 2.2
    return (n + tone) * env


def glitch():
    t = tt(.13)
    sq = np.sign(np.sin(2 * np.pi * rng.uniform(300, 1400) * t))
    crush = np.repeat(rng.standard_normal(len(t) // 40 + 1), 40)[: len(t)]
    return (sq * .5 + crush * .5) * np.exp(-t * 12)


def whoosh():
    t = tt(.8)
    shape = np.where(t < .45, t / .45, (.8 - t) / .35)
    out = np.empty(len(t))
    y, src = 0.0, rng.standard_normal(len(t))
    for i in range(0, len(t), 256):
        f = 250 + 6000 * max(0, shape[i]) ** 1.6
        a = 1 - np.exp(-2 * np.pi * f / SR)
        seg, zi = lfilter([a], [1, a - 1], src[i:i + 256], zi=[y * (1 - a)])
        out[i:i + 256], y = seg, seg[-1]
    return out * np.sin(np.pi * t / .8) ** 2


def pad(chord, length, bright=1800):
    t = tt(length + 1.5)
    sig = sum(saw(hz(m) * (1 + d), t, 12) for m in chord for d in (-.004, 0, .004)) / (3 * len(chord))
    sig = lp(lp(sig, bright), bright)
    env = np.minimum(1, t / .5) * np.where(t < length, 1, np.exp(-(t - length) * 3))
    return sig * env


def bass(m, length):
    t = tt(length)
    return lp(saw(hz(m), t, 30), 500) * np.minimum(1, t / .005) * np.exp(-t * 3)


def pluck(m):
    t = tt(.35)
    return lp(saw(hz(m), t, 16), 3500) * np.exp(-t * 14) * np.minimum(1, t / .002)


def stab(chord):
    t = tt(.6)
    sig = sum(saw(hz(m), t, 20) for m in chord + [chord[0] - 12]) / 4
    return lp(sig, 2500) * np.exp(-t * 6)


# ---- arrangement ---------------------------------------------------------
PROG = [([62, 65, 69], 38), ([58, 62, 65], 34), ([60, 65, 69], 41), ([60, 64, 67], 36)]  # Dm Bb F C

# intro drone, heartbeat and clock (0-12s)
t = tt(12.5)
drone = (np.sin(2 * np.pi * 36.7 * t) + .6 * np.sin(2 * np.pi * 73.4 * t) * (1 + .3 * np.sin(2 * np.pi * .25 * t))) * np.minimum(1, t / 3)
drone *= np.where(t < 8, 1, np.exp(-(t - 8) * .8))
place(drone, 0, .32)
for b in range(4):
    place(thump(), b * BAR, .7)
    place(thump(), b * BAR + .35, .45)
for k in range(16):
    place(tick(k % 2 == 0), k * BEAT, .18, pan=.4 + .2 * (k % 2))
place(pad(PROG[0][0], 3.6, 1200), 8.1, .5, send=.6)

# main groove (12-36s) with a lighter bar section 24-28 and drop again at 28
for b in range(12):
    t0 = 12 + b * BAR
    chord, root = PROG[b % 4]
    light = 24 <= t0 < 28
    place(pad(chord, BAR, 2200), t0, .30, send=.5)
    for s in range(8):
        place(bass(root, BEAT / 2 * .95), t0 + s * BEAT / 2, .5 if not light else .3)
    arp = chord + [chord[1] + 12, chord[2] + 12, chord[0] + 12, chord[2], chord[1]]
    for s in range(16):
        place(pluck(arp[s % 8] + 12), t0 + s * BEAT / 4, .16 if not light else .1, pan=.3 + .4 * (s % 2), send=.35)
    for s in range(4):
        tb = t0 + s * BEAT
        if not light or s in (0, 2):
            place(kick(), tb, .95)
        if s in (1, 3):
            place(snare(), tb, .55 if not light else .3, send=.25)
        if not light:
            for h in range(2):
                place(hat(open_=h == 1 and s == 3), tb + h * BEAT / 2, .12, pan=.65)

# countdown breakdown (36-40s): clock, heartbeat, snare roll
for k in range(8):
    place(tick(k % 2 == 0), 36 + k * BEAT, .45 if k % 2 == 0 else .25)
for b in range(2):
    place(thump(), 36 + b * BAR, .8)
place(pad([62, 65, 69], 4, 900), 36, .22, send=.5)
roll_t, step = 38.0, BEAT / 2
while roll_t < 40 - 1e-6:
    place(snare(), roll_t, .15 + .35 * (roll_t - 38) / 2, send=.2)
    step = BEAT / 4 if roll_t >= 38.98 else step
    step = BEAT / 8 if roll_t >= 39.48 else step
    roll_t += step

# finale (40-50s)
place(kick(2), 40, 1.1)
place(stab(PROG[0][0]), 40, .55, send=.6)
for i, (chord, root) in enumerate([PROG[1], PROG[3], PROG[0]]):
    ln = 2 if i < 2 else 6
    place(pad(chord, ln, 2600), 42 + 2 * i, .34, send=.7)
    place(lp(saw(hz(root), tt(ln), 30), 300) * np.exp(-tt(ln) * .6), 42 + 2 * i, .35)  # held bass
for s in range(12):
    place(pluck(PROG[0][0][s % 3] + 24), 44 + s * BEAT, .07, pan=.2 + .6 * (s % 2), send=.8)

# sound design from the cue sheet
for im in cues["impacts"]:
    place(boom(im["size"]), im["at"], .9, send=.5)
for a, b in cues["risers"]:
    place(riser(b - a), a, .45, send=.3)
for w in cues["whooshes"]:
    place(whoosh(), w - .45, .35, pan=.3, send=.2)
for g in cues["glitches"]:
    place(glitch(), g, .4)
for s in cues["stabs"]:
    place(stab(PROG[2][0]), s, .45, send=.4)

# ---- reverb, master ------------------------------------------------------
ir_t = tt(2.6)
ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6) for _ in range(2)], 1)
ir[: int(.012 * SR)] = 0
rev = np.stack([fftconvolve(wet[:, c], ir[:, c])[:N] for c in range(2)], 1)
mix = dry + rev * (np.abs(dry).max() / (np.abs(rev).max() + 1e-9)) * .22
mix = mix[: int(SR * DUR)]
time = np.arange(len(mix)) / SR
mix *= np.minimum(1, (DUR - time) / 2.0)[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.6) / np.tanh(1.6) * .89  # gentle saturation / glue

with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
