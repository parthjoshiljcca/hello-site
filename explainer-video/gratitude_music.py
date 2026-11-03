# Original 12-second score for gratitude-reel.html: typing clicks, a ding when the
# university's message lands, marker swipes on the highlights, a riser into two hits on
# "SMOOTH." and "SUCCESSFUL.", a warm swell under the tribute card and a resolve on the logo.
#
#   python3 gratitude_music.py <out.wav>
import sys

from sfxlib import (Mix, bass, bell, boom, clap, ding, hat, hp, kick, pad, pluck, pop,
                    riser, rng, sweep_lp, tt)
import numpy as np

BEAT = .5
m = Mix(12)
D, A, Bm, G = [62, 66, 69], [61, 64, 69], [62, 66, 71], [62, 67, 71]


def marker(length=.35):
    t = tt(length)
    return sweep_lp(rng.standard_normal(len(t)), 900, 3500) * np.sin(np.pi * t / length) ** 2 * .5


# 0-3.6 s: chat
m.place(pad([50, 57, 62, 66], 3.4, 1400), 0, .25, send=.5)
for k in range(14):
    t = tt(.03)
    m.place(hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 160), .4 + k * .075 + rng.uniform(-.01, .01), .09, pan=.4 + .2 * rng.random())
m.place(ding(), 1.5, .4, send=.4)
m.place(marker(), 2.3, .35, pan=.4)
m.place(marker(.4), 2.7, .35, pan=.6)
m.place(riser(1.0), 2.6, .4, send=.3)

# 3.6-6.6 s: the two words
for at, chord, root in [(3.6, Bm, 47), (5.1, G, 43)]:
    m.place(boom(1.0), at, .85, send=.4)
    m.place(pad(chord, 1.4, 2600), at, .32, send=.6)
    for s in range(6):
        m.place(bass(root, BEAT / 2 * .95), at + s * BEAT / 2, .4)
        m.place(pluck((chord + [chord[0] + 12])[s % 4] + 12), at + s * BEAT / 2, .11, pan=.3 + .4 * (s % 2), send=.4)
    for s in range(3):
        m.place(kick(), at + s * BEAT, .8)
        if s == 1:
            m.place(clap(), at + s * BEAT, .45, send=.25)
        m.place(hat(), at + s * BEAT + BEAT / 2, .1, pan=.65)
m.place(riser(.6), 6.0, .3, send=.3)

# 6.6-9.5 s: tribute swell
m.place(pop(), 6.6, .25, send=.4)
m.place(pad(D, 1.45, 2200), 6.6, .34, send=.7)
m.place(pad(A, 1.45, 2200), 8.05, .34, send=.7)
m.place(bass(38, 1.45), 6.6, .35)
m.place(bass(45, 1.45), 8.05, .35)
for k, n in enumerate([78, 81, 85, 86, 85, 81, 78, 81]):
    m.place(bell(n), 6.7 + k * .35, .1, pan=.25 + .07 * k, send=.7)

# 9.5-12 s: logo
m.place(boom(.5), 9.5, .6, send=.4)
m.place(pad(G, .9), 9.5, .3, send=.6)
m.place(pad(D, 2.0), 10.4, .32, send=.7)
m.place(bass(43, .9), 9.5, .35)
m.place(bass(38, 2.0), 10.4, .35)
for k, n in enumerate([74, 78, 81, 86, 90]):
    m.place(bell(n), 10.4 + k * .09, .11, pan=.2 + .15 * k, send=.7)

Mix.write(m.master(fade_out=1.0), sys.argv[1])
