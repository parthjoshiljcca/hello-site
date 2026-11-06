# Sound for the 60-second Roopkund short: a light plucked groove like the reference's, a pop and a
# soft whoosh on every card, a tick on every keyword, and the card's own sounds (bones, the Japan
# arrow, the strike and stamp, the crack, the hail, dots sorting, arcs, the timeline, the book),
# with the Sarvam narration on top and the music ducked under it.
#
#   python3 score_short.py <out.wav> <duration>
import json
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from sfxlib import SR, Mix, bass, bell, boom, hat, hp, kick, lp, pad, pluck, pop, riser, rng, sweep_lp, tt, whoosh  # noqa: E402

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, 'out')
DUR = float(sys.argv[2])
B = {b['beat']: b for b in json.load(open(os.path.join(OUT, 'beats.json')))}
S = lambda n: B[n]['start']
E = lambda n: B[n]['end']
m = Mix(DUR)


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def tick():
    t = tt(.05)
    return np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 90)


def zap(f0, f1, length):
    t = tt(length)
    return np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / length)) / SR) * np.sin(np.pi * t / length) ** 2 * .5


def crack():
    t = tt(.4)
    return hp(noise(.4), 2500) * np.exp(-t * 40) + np.sin(2 * np.pi * 80 * t) * np.exp(-t * 16) * .6


def thump():
    t = tt(.5)
    return np.sin(2 * np.pi * np.cumsum(95 + 70 * np.exp(-t * 30)) / SR) * np.exp(-t * 12) + lp(noise(.5), 900) * np.exp(-t * 30) * .6


# ---- groove: 96 bpm, a plucked A minor / F / C / G loop, soft kick and hats; it drops out for "मरे कैसे?"
BEAT = 60 / 96
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
for i, at in enumerate(np.arange(.4, DUR - 1.5, BEAT / 2)):
    if S(5) - .1 < at < E(5) + .1:
        continue
    ch = chords[int(i / 8) % 4]
    m.place(pluck(ch[i % 3] + 12), at, .06, pan=.35 + .3 * (i % 2), send=.3)
    if i % 2 == 0:
        m.place(hat(), at + BEAT / 4, .05, pan=.6)
    if i % 4 == 0:
        m.place(kick(), at, .25)
        m.place(bass(ch[0] - 12, BEAT * 1.8), at, .14)
m.place(pad([57, 60, 64, 69], DUR - 1, 1500), 0, .06, send=.6)

# ---- every card and keyword
for n in range(2, 13):
    m.place(whoosh(), S(n) - .45, .18, send=.3)
    m.place(pop(), S(n) - .2, .2, send=.3)
caps = []
for b in B.values():
    caps.append(b['start'])
for at in caps:
    m.place(tick(), at + .3, .12, pan=.5)

# ---- the cards' own sounds
for k in range(8):
    m.place(pop() * .6, S(1) + .3 + k * .12, .08, pan=.3 + .05 * k)
m.place(boom(.5), S(2) + .7, .35, send=.4)                                  # the Roopkund pin
m.place(zap(300, 900, 1.4), S(3) + 1.8, .22, send=.3)                       # Japan arrow
m.place(hp(noise(.35), 1500) * np.exp(-tt(.35) * 9), S(4) + .2, .3)         # strike-through
m.place(thump(), S(4) + 1.5, .6, send=.2)                                   # the stamp
m.place(boom(.7), S(5), .5, send=.5)                                        # the question
m.place(crack(), S(6) + .9, .45, send=.3)                                   # skull crack
m.place(bell(93) * .6, S(6) + 3.1, .12, send=.5)                            # hail vs ball
m.place(thump() * .6, S(6) + 3.2, .3)
m.place(riser(1.2), S(7) - 1.2, .25, send=.4)                               # the twist
m.place(whoosh(), S(7) + 2.0, .3, send=.3)                                  # dots sorting
for k, at in enumerate((.1, 1.4, 3.1)):
    m.place(zap(500, 1300 + 200 * k, 1.0), S(8) + at, .16, pan=.3 + .2 * k, send=.4)
for at in (S(9) + .4, S(9) + 1.0):
    m.place(bell(81), at, .1, send=.6)
m.place(whoosh(), S(9) + 1.7, .25, send=.3)
m.place(boom(.6), S(10) + 3.3, .45, send=.5)                                # the open question
m.place(pad([57, 60, 64, 67], E(11) - S(11), 1800), S(11), .08, send=.8)   # one line
m.place(boom(.9), S(12) + .4, .6, send=.6)                                  # the book
for k, n in enumerate([76, 79, 84, 88]):
    m.place(bell(n), S(12) + .45 + k * .1, .07, pan=.3 + .12 * k, send=.8)

music = m.master(rev_amount=.25, fade_out=1.2)
voice, sr = sf.read(os.path.join(OUT, 'narration.wav'))
voice = voice.mean(1) if voice.ndim > 1 else voice
voice = np.pad(voice, (0, max(0, len(music) - len(voice))))[: len(music)]
env = np.clip(lp(lp(np.abs(voice), 6), 6) / (np.percentile(lp(lp(np.abs(voice), 6), 6), 95) + 1e-9), 0, 1)
music = music / np.abs(music).max() * .45 * (1 - .45 * env)[:, None]
Mix.write(music + voice[:, None] / np.abs(voice).max() * .95, sys.argv[1])
