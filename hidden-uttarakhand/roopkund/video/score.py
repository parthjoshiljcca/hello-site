# Sound for the Roopkund episode: the Sarvam narration on top of a dark, pulsing explainer bed, with a
# sound on every visible action in episode.html (ice cracking, the title hit, the 1942 tag, map arcs,
# the stamp, thunder and hail, the lab scanner, the DNA build, counters, markers, the trail, the
# freeze, the map pins and the book). Times come from the same beats as the picture.
#
#   python3 score.py <out.wav> <duration>
import json
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from sfxlib import SR, Mix, bell, boom, hp, hz, lp, pad, pluck, pop, riser, rng, saw, sweep_lp, thud, tt, whoosh  # noqa: E402

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, '..', 'out')
DUR = float(sys.argv[2])
B = {b['beat']: b for b in json.load(open(os.path.join(OUT, 'beats.json')))}
S = lambda n: B[n]['start']
E = lambda n: B[n]['end']
m = Mix(DUR)


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def crack():
    t = tt(.5)
    return hp(noise(.5), 2500) * np.exp(-t * 40) * .8 + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 14) * .6


def click():
    t = tt(.04)
    return hp(noise(.04), 3000) * np.exp(-t * 150)


def zap(f0=400, f1=1600, length=.6):
    t = tt(length)
    f = f0 * (f1 / f0) ** (t / length)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / length) ** 2 * .5


def beep(f=1400, length=.12):
    t = tt(length)
    return np.sin(2 * np.pi * f * t) * np.minimum(1, (length - t) / .02) * np.minimum(1, t / .005)


def thunder():
    t = tt(4)
    return lp(noise(4), 220) * np.exp(-t * .9) * (1 + .8 * np.sin(2 * np.pi * 2.3 * t) ** 2) * 2.5 + hp(noise(4), 1200) * np.exp(-t * 6) * .4


def stamp():
    t = tt(.6)
    return np.sin(2 * np.pi * np.cumsum(90 + 60 * np.exp(-t * 30)) / SR) * np.exp(-t * 12) + lp(noise(.6), 900) * np.exp(-t * 25) * .8


def drone(length, notes, bright=420):
    t = tt(length)
    sig = sum(saw(hz(n) * (1 + d), t, 14) for n in notes for d in (-.003, .003)) / (2 * len(notes))
    return lp(lp(sig, bright), bright) * (1 + .3 * np.sin(2 * np.pi * .09 * t)) * np.minimum(1, np.minimum(t, length - t) / 2)


def shimmer(length):
    out = np.zeros(int(SR * length))
    R = np.random.default_rng(3)
    for k in range(int(length * 9)):
        s = bell(int(R.choice([86, 88, 91, 93, 95, 98]))) * .3
        i = int(R.uniform(0, length - .3) * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out


# ---- music bed: D minor drone, a soft pulse and a plucked motif while the science is explained
m.place(drone(DUR, [38, 45, 50]), 0, .5, send=.4)
m.place(pad([50, 53, 57, 62], DUR - 1, 900), 0, .1, send=.6)
BEAT = 60 / 92
motif = [62, 65, 69, 72, 69, 65, 64, 65]
for i, at in enumerate(np.arange(S(9) - .3, E(15), BEAT / 2)):
    m.place(pluck(motif[i % 8]), at, .07, pan=.3 + .4 * (i % 2), send=.4)
for i, at in enumerate(np.arange(S(4), E(17), BEAT)):
    if not S(8) + 6 < at < E(8):  # the storm takes over
        m.place(thud() * .8, at, .18 if i % 2 == 0 else .1, send=.1)

# ---- wind over the valley
w = sweep_lp(noise(DUR), 240, 420)
wt = np.arange(len(w)) / SR
wind_env = np.interp(wt, [0, 2, E(3), S(5), E(8), S(9), S(15), E(16), S(18), E(18), DUR], [0, 1, .8, .2, .9, .1, .6, .6, .9, .6, 0])
m.place(w * (.5 + .5 * np.sin(2 * np.pi * .11 * wt) ** 2) * wind_env, 0, .55, send=.2)

# ---- every cut between sets: a soft whoosh
cuts = [S(n) - .25 for n in (5, 7, 9, 15, 17, 18, 19)] + [S(13) + 4.6, E(6) + .1]
for at in cuts:
    m.place(whoosh(), at - .3, .35, pan=.5, send=.3)

# ---- 1-3: the climb, the ice cracking, bones in the water, the title
m.place(whoosh() * 1.2, .2, .35, send=.4)
for k in range(9):
    m.place(crack(), S(2) + .1 + k * .26 + rng.uniform(0, .08), .45, pan=.3 + .05 * k, send=.35)
for k in range(10):
    t = tt(.25)
    m.place(np.sin(2 * np.pi * np.cumsum(900 + 1400 * np.exp(-t * 30)) / SR) * np.exp(-t * 20) * .3, S(2) + 1.2 + k * .35, .18, pan=rng.uniform(.2, .8), send=.6)
m.place(riser(1.6), S(3) - 1.6, .35, send=.4)
m.place(boom(1.0), S(3), .9, send=.5)
m.place(bell(74), S(3), .2, send=.8)
m.place(pop(), S(1) + 3.4, .2, send=.3)

# ---- 4-6: 1942, the Japanese scare, the stamp
for k in range(4):
    m.place(click(), S(4) + .3 + k * .07, .4, pan=.3)
m.place(pad([38, 41, 45], E(4) - S(4), 600), S(4), .15, send=.5)
for k in range(3):
    m.place(zap(300, 900, .9), S(5) + 2.2 + k * .3, .25, pan=.6 - .1 * k, send=.4)
m.place(beep(520, .5) * .6, S(5) + 3.6, .15, send=.3)
m.place(stamp(), S(6) + 1.6, .9, send=.3)

# ---- 7-8: the question, the legend, thunder and hail
m.place(boom(.6), S(7) + 2.6, .6, send=.5)
for k in range(12):
    m.place(bell(81 + (k % 3) * 2) * .5, S(8) + .5 + k * .45, .05, pan=.2 + .05 * k, send=.7)
for f in (9.0, 10.6, 12.1):
    m.place(thunder(), S(8) + f - .05, .45, pan=.45, send=.3)
hl = hp(noise(E(8) - S(8) - 6.3), 1800)
ht = np.arange(len(hl)) / SR
dots = np.zeros(len(hl))
for i in rng.integers(0, len(hl) - 2000, 900):
    dots[i:i + 600] += np.exp(-np.arange(600) / 60)
m.place(hl * (.15 + dots) * np.minimum(1, ht / 1.2) * np.minimum(1, (ht[-1] - ht) / .4), S(8) + 6.5, .25, send=.3)

# ---- 9-11: the lab
m.place(sweep_lp(noise(E(11) - S(9)), 120, 120) * .6, S(9), .25, send=.1)
m.place(pop(), S(9) + 1.2, .2)
scan = zap(500, 2400, 3.0)
m.place(scan, S(9) + 4.5, .3, pan=.5, send=.3)
for k in range(3):
    m.place(beep(1800, .09), S(9) + 5.4 + k * .16, .25, send=.2)
for at in (S(10) + 2.0, S(10) + 2.9):
    m.place(beep(180, .35) * (1 + .5 * np.sign(np.sin(2 * np.pi * 60 * tt(.35)))), at, .25, send=.2)
m.place(beep(2600, .2) * np.exp(-tt(.2) * 10), S(11) + 1.0, .45, pan=.35, send=.4)
m.place(crack() * .4, S(11) + 1.0, .45, pan=.35, send=.4)
m.place(stamp() * .7, S(11) + 1.3, .6, pan=.65, send=.2)
m.place(pop(), S(11) + 1.6, .2)

# ---- 12-14: DNA, the 38 and the three groups, the 1,000 years
m.place(shimmer(4.0), S(12), .35, send=.6)
m.place(pop(), S(12) + 2.4, .2)
for k in range(38):
    m.place(click(), S(12) + 5.4 + 1.2 * (1 - (1 - k / 38) ** (1 / 3)), .3, pan=.5)
m.place(whoosh(), S(13) + .3, .35, send=.3)
for k, at in enumerate((2.2, 2.6, 3.0)):
    m.place(beep([660, 880, 990][k], .15), S(13) + at, .2, send=.4)
g13 = S(13) + 4.6
for k, at in enumerate((.1, .5, .9)):
    m.place(zap(400, 1200 + 300 * k, 1.2), g13 + at, .22, pan=.3 + .2 * k, send=.4)
for at in (S(14) + 2.2, S(14) + 4.4):
    m.place(pop(), at, .3, send=.3)
    m.place(bell(79), at, .08, send=.7)
m.place(whoosh(), S(14) + 5.4, .3, send=.3)

# ---- 15-17: two layers of the dead, the Raj Jat, the open question
m.place(shimmer(2.5), S(15) + .3, .25, send=.6)
m.place(boom(.5), S(15) + 5.0, .5, send=.4)
m.place(shimmer(3.6), S(16) + .4, .3, send=.6)
m.place(pop(), S(16) + 1.5, .2)
for k in range(int((E(17) - S(17)) / .8)):
    m.place(beep(440, .25) * np.exp(-tt(.25) * 6), S(17) + k * .8, .1, send=.6)
m.place(boom(.8), S(17) + 6.2, .7, send=.5)

# ---- 18-21: the freeze, the map, the book
for k in range(16):
    m.place(crack() * .5, S(18) + .6 + k * .2 + rng.uniform(0, .06), .2, pan=rng.uniform(.3, .7), send=.5)
for k in range(9):
    m.place(pop(), S(19) + 1.2 + k * 4 / 9, .2, pan=.3 + .05 * k, send=.4)
    m.place(bell(86 + (k % 4) * 2), S(19) + 1.2 + k * 4 / 9, .04, send=.7)
m.place(riser(1.8), S(20) - 1.8, .35, send=.4)
m.place(whoosh() * 1.3, S(20) - .3, .4, send=.4)
m.place(boom(1.0), S(20) + .6, .8, send=.6)
m.place(shimmer(1.6), S(20) + .6, .35, send=.7)
m.place(pop(), S(20) + 2.6, .25, send=.4)
m.place(pad([50, 57, 62, 66, 69], DUR - S(21) + .5, 1600), S(21) - .2, .22, send=.8)
for k, n in enumerate([74, 78, 81, 86]):
    m.place(bell(n), S(21) + .1 + k * .12, .07, pan=.3 + .12 * k, send=.8)

music = m.master(rev_amount=.3, fade_out=1.5)

# ---- the voice on top, with the music ducked under it
voice, sr = sf.read(os.path.join(OUT, 'narration.wav'))
assert sr == SR
voice = voice.mean(1) if voice.ndim > 1 else voice
voice = np.pad(voice, (0, max(0, len(music) - len(voice))))[: len(music)]
env = lp(lp(np.abs(voice), 6), 6)
env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
music = music / np.abs(music).max() * .5 * (1 - .5 * env)[:, None]
voice = voice / np.abs(voice).max()
mix = music + voice[:, None] * .95
Mix.write(mix, sys.argv[1])
