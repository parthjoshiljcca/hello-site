# Original 40-second score for preface.html: a tanpura drone on D with a bansuri-style
# flute singing phrases in raag Bhupali (D E F# A B), mountain wind under the night sky, soft
# hand-drum footsteps on the trail, the temple bell on the village's two strikes, the river,
# page turns in the book scene and a warm resolve under the title.
#
#   python3 preface_music.py <out.wav> [duration]
import sys

import numpy as np

from sfxlib import SR, Mix, bell, boom, hp, hz, lp, pad, rng, sweep_lp, tt

DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 40
m = Mix(DUR)


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def tanpura(midi, length=3.2):
    """One plucked tanpura string: many harmonics, slow decay and the jawari's shimmer."""
    t = tt(length)
    f, out = hz(midi), np.zeros(len(t))
    for k in range(1, 28):
        if f * k > 9000:
            break
        swell = 1 + .6 * np.sin(2 * np.pi * (.35 + k * .05) * t + k)
        out += np.sin(2 * np.pi * f * k * t + k) / k ** .8 * swell * np.exp(-t * (1.1 + k * .06))
    return out * np.minimum(1, t / .01) * .25


def flute(phrase, at, gain=.32, pan=.45):
    """Bansuri: a glide (meend) between notes, delayed vibrato and a breathy edge."""
    f = np.concatenate([np.full(int(SR * d), hz(n)) for n, d in phrase])
    f = lp(lp(f - f[0], 14), 14) + f[0]  # smooth the note changes into slides
    t = np.arange(len(f)) / SR
    starts = np.cumsum([0] + [d for _, d in phrase[:-1]])
    since = t - starts[np.searchsorted(starts, t, side='right') - 1]
    f = f * (1 + .006 * np.minimum(1, since / .5) * np.sin(2 * np.pi * 5.2 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + .28 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
    breath = sweep_lp(hp(noise(len(t) / SR), 1500), 3000, 3000) * .35
    env = np.minimum(1, t / .15) * np.minimum(1, (t[-1] - t) / .6)
    env *= 1 + .15 * np.sin(2 * np.pi * .7 * t)
    m.place((tone + breath * (.6 + .4 * np.sin(ph * .01))) * env, at, gain, pan=pan, send=.75)


def temple_bell(length=5.0):
    t = tt(length)
    parts = [(1, 1, .6), (2.0, .55, .9), (2.76, .45, 1.4), (5.4, .25, 2.2), (8.9, .12, 3.0)]
    f0 = hz(57)
    return sum(a * np.sin(2 * np.pi * f0 * r * t * (1 + .0015 * np.sin(2 * np.pi * 3 * t))) * np.exp(-t * d)
               for r, a, d in parts) * (1 - np.exp(-t * 400))


def page_turn():
    t = tt(.55)
    env = np.sin(np.pi * np.minimum(1, t / .5)) ** 2 * (1 + .6 * np.sin(2 * np.pi * 23 * t))
    return sweep_lp(hp(noise(.55), 900), 1800, 6000) * env * .6


def drum(low):
    t = tt(.5)
    f = (95 if low else 190) * (1 + .5 * np.exp(-t * 30))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (9 if low else 18)) + hp(noise(.5), 2500) * np.exp(-t * 60) * .25


D = 50  # Sa = D3

# wind across the whole piece, strongest under the night sky
w = sweep_lp(noise(DUR), 300, 300)
wt = np.arange(len(w)) / SR
m.place(w * (.5 + .5 * np.sin(2 * np.pi * .13 * wt) ** 2) * np.interp(wt, [0, 3, 12, 14, 30, 35, DUR], [.2, 1, .7, .35, .3, .1, .1]), 0, .5, pan=.5, send=.2)

# tanpura cycle Pa - Sa' - Sa' - Sa, from the first second to the end
cycle = [D - 5 + 12, D + 12, D + 12, D]
for i, at in enumerate(np.arange(.6, DUR - 1, 1.05)):
    m.place(tanpura(cycle[i % 4] - 12), at, .22 if at < 35 else .28, pan=.35 + .1 * (i % 4), send=.4)

S, R, G, P, Dh = 62, 64, 66, 69, 71  # Bhupali on D4
flute([(P, 1.0), (Dh, .5), (P, .5), (G, 1.0), (R, .5), (S, 2.2)], 1.3)
flute([(S, .5), (R, .5), (G, .5), (P, 1.0), (Dh, .5), (S + 12, 1.5), (Dh, .5), (P, 1.8)], 6.9)
flute([(G, .5), (P, .5), (Dh, 1.0), (P, .5), (G, .5), (R, 1.0), (S, .5), (R, .5), (G, 1.6)], 13.2, .28)
flute([(Dh, 1.0), (P, .5), (Dh, .5), (S + 12, 1.5), (R + 12, 1.0), (S + 12, .5), (Dh, 1.6)], 19.9, .26)
flute([(P, .75), (Dh, .75), (S + 12, 1.0), (R + 12, .5), (G + 12, 1.4), (R + 12, .5), (S + 12, 1.9)], 25.6, .27)
flute([(G + 12, 1.0), (R + 12, .5), (S + 12, .6), (Dh, .6), (S + 12, 2.6)], 31.0, .22, pan=.55)
flute([(P, .6), (Dh, .6), (S + 12, 3.2)], 36.0, .3)

# a shooting star (2.6 s) gets a small sparkle
for k, n in enumerate([86, 90, 93, 98]):
    m.place(bell(n), 2.65 + k * .07, .05, pan=.7 - .1 * k, send=.8)

# trail: soft dholak footsteps, 12.6 - 19 s
for i, at in enumerate(np.arange(12.6, 19.0, .3)):
    if i % 4 in (0, 3):
        m.place(drum(i % 4 == 0), at, .22 if i % 4 == 0 else .1, pan=.45, send=.2)

# village: the temple bell on the two strikes the picture shows, plus small ghanti tinkles
for at in (19.7, 22.7):
    m.place(temple_bell(), at, .55, pan=.62, send=.6)
for k in range(5):
    m.place(bell(93 + (k % 2) * 4), 20.6 + k * .21, .035, pan=.3, send=.7)

# river, 24.6 - 31.2 s
rv = sweep_lp(hp(noise(6.6), 400), 2500, 2500)
rt = np.arange(len(rv)) / SR
m.place(rv * (.7 + .3 * np.sin(2 * np.pi * 1.7 * rt) * np.sin(2 * np.pi * .6 * rt)) * np.minimum(1, np.minimum(rt, 6.6 - rt) / 1.0), 24.6, .2, pan=.5, send=.3)
for k, n in enumerate([S, G, P, Dh, S + 12, G + 12, P + 12]):  # santoor-like rising run as the stone glows
    m.place(bell(n + 12), 27.2 + k * .14, .07, pan=.25 + .08 * k, send=.6)

# book: page turns and a warm pad
for at in (31.3, 32.5, 33.7):
    m.place(page_turn(), at, .45, pan=.55, send=.25)
m.place(pad([D, D + 7, D + 12, D + 16], 4.4, 1400), 30.8, .14, send=.7)

# title: a soft hit, the full chord and a chime as UTTARAKHAND writes itself
m.place(boom(.5), 35.3, .4, send=.5)
m.place(pad([D - 12, D, D + 7, D + 12, D + 16], 4.2, 1800), 35.3, .2, send=.8)
for k, n in enumerate([S + 12, G + 12, P + 12, S + 24]):
    m.place(bell(n), 36.5 + k * .16, .08, pan=.3 + .12 * k, send=.8)
m.place(temple_bell(4.0), 38.6, .2, pan=.5, send=.7)

Mix.write(m.master(rev_amount=.35, fade_out=1.4), sys.argv[1])
