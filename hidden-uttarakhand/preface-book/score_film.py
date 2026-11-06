# Score for the प्रस्तावना film. The first four shots are warm (bansuri over a tanpura); the postcard
# turning over drops everything into a dark drone with wind, and each story on its back gets its own
# sound: temple bells, a procession's drum, ice, a Geiger counter, a heartbeat and a whisper on the
# meadow, jagar drums that slow and stop, a car on the hairpins, pages, a keyboard, the diya, and a
# braam when the mountains ask better questions. The Sarvam narration sits on top, music ducked.
#
#   python3 score_film.py <out.wav> <duration>
import json
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from sfxlib import SR, Mix, bell, boom, hp, hz, lp, pad, riser, rng, saw, sweep_lp, tt, whoosh  # noqa: E402

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, 'out')
DUR = float(sys.argv[2])
B = {b['beat']: b for b in json.load(open(os.path.join(OUT, 'beats.json')))}
S = lambda n: B[n]['start']
E = lambda n: B[n]['end']
m = Mix(DUR)


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def tanpura(midi, length=3.2):
    t = tt(length)
    f, out = hz(midi), np.zeros(len(t))
    for k in range(1, 22):
        if f * k > 8000:
            break
        out += np.sin(2 * np.pi * f * k * t + k) / k ** .8 * (1 + .6 * np.sin(2 * np.pi * (.35 + k * .05) * t + k)) * np.exp(-t * (1.1 + k * .06))
    return out * np.minimum(1, t / .01) * .25


def flute(phrase, at, gain=.18, pan=.45):
    f = np.concatenate([np.full(int(SR * d), hz(n)) for n, d in phrase])
    f = lp(lp(f - f[0], 14), 14) + f[0]
    t = np.arange(len(f)) / SR
    f = f * (1 + .006 * np.minimum(1, t / .6) * np.sin(2 * np.pi * 5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + .25 * np.sin(2 * ph) + sweep_lp(hp(rng.standard_normal(len(t)), 1500), 3000, 3000) * .25
    m.place(tone * np.minimum(1, t / .2) * np.minimum(1, (t[-1] - t) / .7), at, gain, pan=pan, send=.85)


def drone(length, notes, bright=360):
    t = tt(length)
    sig = sum(saw(hz(n) * (1 + d), t, 14) for n in notes for d in (-.003, .003)) / (2 * len(notes))
    return lp(lp(sig, bright), bright) * (1 + .3 * np.sin(2 * np.pi * .08 * t)) * np.minimum(1, np.minimum(t, length - t) / 2)


def dhol(low):
    t = tt(.6)
    return np.sin(2 * np.pi * np.cumsum((70 if low else 140) * (1 + .6 * np.exp(-t * 30))) / SR) * np.exp(-t * (7 if low else 14)) + hp(noise(.6), 2000) * np.exp(-t * 50) * .2


def heartbeat():
    out = np.zeros(int(SR * .6))
    for o, g in ((0, 1), (.2, .7)):
        t = tt(.35)
        s = np.sin(2 * np.pi * np.cumsum(48 + 40 * np.exp(-t * 25)) / SR) * np.exp(-t * 11) * g
        out[int(o * SR):int(o * SR) + len(s)] += s
    return out


def whisper(length):
    t = tt(length)
    return sweep_lp(hp(noise(length), 1200), 2500, 5000) * np.sin(np.pi * t / length) ** 2 * (1 + .7 * np.sin(2 * np.pi * 7 * t))


def braam(length=3.5):
    t = tt(length)
    return sweep_lp(sum(saw(hz(n), t, 30) for n in (26, 38, 45, 50)) / 4, 2200, 250) * np.exp(-t * .9) * np.minimum(1, t / .02)


def click(f=3000):
    t = tt(.03)
    return hp(noise(.03), f) * np.exp(-t * 200)


DARK = S(5) + 1.0          # the postcard has turned
S_, R_, G_, P_, D_ = 62, 64, 66, 69, 71   # Bhupali on D

# ---- warm opening: tanpura and bansuri, until the postcard turns
for i, at in enumerate(np.arange(.6, DARK, 1.1)):
    m.place(tanpura([45, 50, 50, 38][i % 4]), at, .16, pan=.35 + .1 * (i % 4), send=.35)
flute([(P_, 1), (D_, .5), (P_, .5), (G_, 1), (R_, .5), (S_, 2.2)], 1.2)
flute([(S_, .5), (R_, .5), (G_, .5), (P_, 1.2), (D_, .6), (S_ + 12, 2.4)], S(3) + .4, .16)
m.place(sweep_lp(noise(E(2) - S(1)), 500, 500) * .3, S(1), .12, send=.2)            # the city's hum
m.place(bell(86) * .4, S(2) + .5, .06, send=.8)
m.place(click(2500) * 3, S(3) + (E(3) - S(3)) * .58, .3)                            # camera
m.place(click(2500) * 3, S(4) + (E(4) - S(4)) * .8, .35)

# ---- the turn: a hit, then the dark bed for everything after
m.place(riser(1.4), S(5) - 1.2, .3, send=.4)
m.place(boom(1.3), S(5) + .9, .9, send=.6)
m.place(drone(DUR - DARK, [38, 45, 50]), DARK, .5, send=.4)
m.place(drone(E(11) - S(9), [38, 39, 45], 480), S(9), .25, send=.4)
w = sweep_lp(noise(DUR - DARK), 230, 400)
wt = np.arange(len(w)) / SR
m.place(w * (.5 + .5 * np.sin(2 * np.pi * .1 * wt) ** 2) * np.minimum(1, wt / 2), DARK, .35, send=.2)
for i, at in enumerate(np.arange(S(18), DUR - 3, 1.2)):                                # the tanpura comes back for the author
    m.place(tanpura([45, 50, 50, 38][i % 4]), at, .13, pan=.4 + .1 * (i % 3), send=.4)

# ---- the stories on the back of the postcard
for k in range(26):
    m.place(bell(int(rng.choice([76, 79, 81, 84, 86, 88]))) * .6, S(6) + rng.uniform(.2, E(6) - S(6)), .05, pan=rng.uniform(.15, .85), send=.7)
m.place(boom(.6), S(7) + .3, .4, send=.5)
for i, at in enumerate(np.arange(S(8), S(8) + (E(8) - S(8)) * .6, .5)):
    m.place(dhol(i % 4 == 0), at, .18 if i % 4 == 0 else .08, pan=.45, send=.4)
m.place(bell(81), S(8) + .2, .05, send=.8)
for k in range(10):
    t = tt(.4)
    m.place(hp(noise(.4), 2000) * np.exp(-t * 30) * .5, S(9) + .5 + k * .5 + rng.uniform(0, .2), .12, pan=rng.uniform(.3, .7), send=.5)
for at in S(10) + np.cumsum(rng.exponential(.12, 90)):
    if at < E(10) + .3:
        m.place(click(3500) * 2, at, .1, pan=.6)
m.place(boom(.6), S(10) + (E(10) - S(10)) * .5, .4, send=.4)
at = S(11) + .4
while at < S(11) + (E(11) - S(11)) * .72:
    m.place(heartbeat(), at, .6, send=.1)
    at += max(.65, 1.0 - (at - S(11)) * .05)
m.place(whisper(2.4), S(11) + (E(11) - S(11)) * .25, .35, pan=.8, send=.7)
m.place(whisper(1.8), S(11) + (E(11) - S(11)) * .5, .3, pan=.2, send=.7)
m.place(boom(1.0), S(11) + (E(11) - S(11)) * .78, .8, send=.6)

# ---- unheard: near silence, then the hills' sounds, fading out
for i, at in enumerate(np.arange(S(13), E(13), .42)):
    m.place(dhol(i % 3 == 0), at, .2 if i % 3 == 0 else .1, pan=.4, send=.35)
fire = hp(noise(E(13) - S(13)), 1500)
for i in rng.integers(0, len(fire) - 400, 260):
    fire[i:i + 300] *= 6
m.place(fire * .06, S(13), .25, pan=.5, send=.2)
eng = np.sin(2 * np.pi * np.cumsum(55 + 6 * np.sin(2 * np.pi * .3 * tt(E(14) - S(14) + .5))) / SR)
m.place(lp(eng + .3 * noise(E(14) - S(14) + .5)[: len(eng)], 300) * np.minimum(1, tt(E(14) - S(14) + .5) / .5), S(14), .18, send=.3)
for k in range(3):
    t = tt(.55)
    m.place(sweep_lp(hp(noise(.55), 900), 1800, 6000) * np.sin(np.pi * np.minimum(1, t / .5)) ** 2 * .5, S(15) + .4 + k * (E(15) - S(15)) * .25, .4, pan=.55, send=.25)
gap = .42
at = S(16)
while at < E(16) - .8:   # the drum slows and stops
    m.place(dhol(True), at, .2 * max(.2, 1 - (at - S(16)) / (E(16) - S(16))), pan=.4, send=.4)
    gap *= 1.12
    at += gap

# ---- the book, the author, the diya, the question
m.place(pad([50, 57, 62, 66], E(17) - S(17) + 1, 1400), S(17), .14, send=.8)
for k in range(40):
    m.place(click(4000), S(18) + (E(18) - S(18)) * .55 + k * .09 + rng.uniform(0, .03), .08, pan=.6)   # the developer's keys
m.place(bell(74) * .6, S(19) + .3, .08, send=.8)
flute([(P_, 1.2), (G_, .6), (R_, .6), (S_, 2.6)], S(19) + 2.0, .13, .55)
m.place(pad([50, 53, 57, 62], E(21) - S(20) + 1, 1100), S(20), .16, send=.8)
m.place(riser(1.6), S(21) - 1.2, .3, send=.4)
m.place(braam(), S(21) + .3, .6, send=.5)
m.place(boom(1.0), S(22) + .8, .7, send=.6)
for k, n in enumerate([74, 78, 81, 86]):
    m.place(bell(n), S(22) + .9 + k * .12, .06, pan=.3 + .12 * k, send=.8)
flute([(P_, .7), (D_, .7), (S_ + 12, 3.2)], S(23) + .2, .16)
m.place(bell(62), S(23) + 1.5, .1, send=.9)

# ---- cuts: a soft breath of air between the stories
for n in range(6, 22):
    m.place(whoosh() * .7, S(n) - .55, .12, send=.4)

music = m.master(rev_amount=.35, fade_out=2.0)
mt = np.arange(len(music)) / SR
q = S(11) + (E(11) - S(11)) * .72   # silence just before "जवाब मत देना"
music *= np.interp(mt, [q - .1, q, S(11) + (E(11) - S(11)) * .78 - .02, S(11) + (E(11) - S(11)) * .78], [1, .05, .05, 1])[:, None]
music *= np.interp(mt, [S(12) - .2, S(12) + .3, E(12) - .3, E(12) + .2], [1, .25, .25, 1])[:, None]   # "unheard"
voice, sr = sf.read(os.path.join(OUT, 'narration.wav'))
voice = voice.mean(1) if voice.ndim > 1 else voice
voice = np.pad(voice, (0, max(0, len(music) - len(voice))))[: len(music)]
env = lp(lp(np.abs(voice), 6), 6)
env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
music = music / np.abs(music).max() * .48 * (1 - .45 * env)[:, None]
Mix.write(music + voice[:, None] / np.abs(voice).max() * .95, sys.argv[1])
