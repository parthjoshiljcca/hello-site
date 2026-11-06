# Thriller sound for the 60-second Roopkund short: a dark D minor drone, a taiko heartbeat that
# builds through the story, a ticking clock under the DNA twist, an impact as each big keyword lands,
# a dead silence before "मरे कैसे?", the cards' own sounds (bones, the Japan arrow, the strike and
# stamp, the skull crack, hail, arcs, the timeline) and a braam into the book. The Sarvam narration
# sits on top with the music ducked under it.
#
#   python3 score_short.py <out.wav> <duration>
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from sfxlib import SR, Mix, bell, boom, hp, hz, lp, pad, pop, riser, rng, saw, sweep_lp, tt, whoosh  # noqa: E402

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, 'out')
DUR = float(sys.argv[2])
BEATS = json.load(open(os.path.join(OUT, 'beats.json')))
B = {b['beat']: b for b in BEATS}
S = lambda n: B[n]['start']
E = lambda n: B[n]['end']
m = Mix(DUR)

# when each beat's keyword appears on screen (short.html's KEY, timed as its words are)
KEY = {1: 'सैकड़ों कंकाल', 2: 'रूपकुंड।', 3: 'जापानी सैनिक।', 4: 'कहीं ज़्यादा पुरानी', 5: 'मरे कैसे?', 6: 'क्रिकेट बॉल जितने ओले।',
       7: 'तीन अलग ग्रुप।', 8: 'ग्रीस और क्रीट', 9: 'एक हज़ार साल।', 10: 'आज तक कोई नहीं जानता।'}
HITS = []
for b in BEATS:
    parts = [p.strip() for p in re.findall(r'[^।?]+[।?]?', b['text']) if p.strip()]
    total, acc = sum(len(p) for p in parts), 0
    for p in parts:
        a, acc = b['start'] + (b['end'] - b['start']) * acc / total, acc + len(p)
        e = b['start'] + (b['end'] - b['start']) * acc / total
        key = KEY.get(b['beat'])
        if key and key in p:
            ws = p.split(' ')
            i = next(i for i in range(len(ws)) if ' '.join(ws[i:i + len(key.split(' '))]) == key)
            HITS.append(a + (e - a) * i / len(ws))


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def taiko(size=1.0):
    t = tt(.9)
    return (np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-t * 22)) / SR) * np.exp(-t * 6) + lp(noise(.9), 1400) * np.exp(-t * 30) * .6) * size


def impact():
    t = tt(1.6)
    return hp(noise(1.6), 1500) * np.exp(-t * 18) * .7 + np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2) + boom(.6)[: len(t)] * .5


def tick(hi):
    t = tt(.03)
    return hp(noise(.03), 4000 if hi else 2500) * np.exp(-t * 220)


def zap(f0, f1, length):
    t = tt(length)
    return np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / length)) / SR) * np.sin(np.pi * t / length) ** 2 * .5


def crack():
    t = tt(.4)
    return hp(noise(.4), 2500) * np.exp(-t * 40) + np.sin(2 * np.pi * 80 * t) * np.exp(-t * 16) * .6


def thump():
    t = tt(.5)
    return np.sin(2 * np.pi * np.cumsum(95 + 70 * np.exp(-t * 30)) / SR) * np.exp(-t * 12) + lp(noise(.5), 900) * np.exp(-t * 30) * .6


def drone(length, notes, bright=380):
    t = tt(length)
    sig = sum(saw(hz(n) * (1 + d), t, 14) for n in notes for d in (-.003, .003)) / (2 * len(notes))
    return lp(lp(sig, bright), bright) * (1 + .3 * np.sin(2 * np.pi * .1 * t)) * np.minimum(1, np.minimum(t, length - t) / 1.5)


def braam(length=3.0):
    t = tt(length)
    return sweep_lp(sum(saw(hz(n), t, 30) for n in (26, 38, 45, 50)) / 4, 2200, 250) * np.exp(-t * .9) * np.minimum(1, t / .02)


# ---- bed: drone, wind, and a taiko heartbeat that builds (silent through "मरे कैसे?")
m.place(drone(DUR, [38, 45, 50]), 0, .55, send=.4)
m.place(drone(E(10) - S(7), [38, 39, 45], 520), S(7), .3, send=.4)   # the D-Eb rub under the twist
w = sweep_lp(noise(DUR), 240, 420)
m.place(w * (.5 + .5 * np.sin(2 * np.pi * .12 * np.arange(len(w)) / SR) ** 2), 0, .3, send=.2)
BEAT = 60 / 84
for b, at in enumerate(np.arange(S(1) + .4, S(11) - .3, BEAT / 2)):
    if S(5) - .5 < at < E(5) + .2:
        continue
    level = np.interp(at, [0, S(5), S(7), S(10), S(11)], [.4, .6, .75, 1, 1])
    step = b % 8
    if step in (0, 3, 6) or (at > S(7) and step % 2):
        m.place(taiko(1 if step == 0 else .6), at, .5 * level, pan=.45 + .1 * (step % 2), send=.25)
for k, at in enumerate(np.arange(S(7), S(10), BEAT / 2)):
    m.place(tick(k % 2 == 0), at, .14, pan=.65, send=.15)

# ---- every card: a reverse whoosh and a flash pop; every keyword: an impact
for n in range(2, 13):
    m.place(whoosh(), S(n) - .5, .22, send=.3)
for at in HITS:
    m.place(impact(), at - .02, .55, send=.5)

# ---- the cards' own sounds
for k in range(8):
    m.place(pop() * .5, S(1) + .3 + k * .12, .06, pan=.3 + .05 * k)
m.place(zap(300, 900, 1.4), S(3) + 1.8, .22, send=.3)
m.place(hp(noise(.35), 1500) * np.exp(-tt(.35) * 9), S(4) + .2, .3)
m.place(thump(), S(4) + 1.5, .6, send=.2)
m.place(riser(1.2), S(5) - 1.3, .3, send=.4)
m.place(boom(1.2), S(5) + .1, .9, send=.6)
m.place(crack(), S(6) + .9, .45, send=.3)
m.place(bell(93) * .6, S(6) + 3.1, .1, send=.5)
m.place(riser(1.4), S(7) - 1.4, .3, send=.4)
for k, at in enumerate((.1, 1.4, 3.1)):
    m.place(zap(500, 1300 + 200 * k, 1.0), S(8) + at, .14, pan=.3 + .2 * k, send=.4)
for at in (S(9) + .4, S(9) + 1.0):
    m.place(bell(74), at, .1, send=.6)
m.place(boom(.8), S(10) + 3.3, .55, send=.5)
m.place(pad([50, 53, 57, 62], E(11) - S(11) + 1, 1400), S(11), .12, send=.8)
m.place(braam(), S(12) + .3, .6, send=.5)
m.place(boom(1.0), S(12) + .3, .6, send=.6)
for k, n in enumerate([74, 77, 81, 86]):
    m.place(bell(n), S(12) + .5 + k * .12, .06, pan=.3 + .12 * k, send=.8)

music = m.master(rev_amount=.3, fade_out=1.4)
mt = np.arange(len(music)) / SR   # silence for the question
music *= np.interp(mt, [S(5) - .5, S(5) - .3, S(5) + .05, S(5) + .1], [1, .05, .05, 1])[:, None]
voice, sr = sf.read(os.path.join(OUT, 'narration.wav'))
voice = voice.mean(1) if voice.ndim > 1 else voice
voice = np.pad(voice, (0, max(0, len(music) - len(voice))))[: len(music)]
env = lp(lp(np.abs(voice), 6), 6)
env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
music = music / np.abs(music).max() * .5 * (1 - .45 * env)[:, None]
Mix.write(music + voice[:, None] / np.abs(voice).max() * .95, sys.argv[1])
