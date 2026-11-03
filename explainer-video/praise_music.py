# Original 11.5-second score for praise-reel.html ("When everyone praises your app"):
# typing clicks under the hook, a light groove with a notification ding per praise bubble,
# a riser into a full drop on the product cuts at 5.5 s, and a resolve on the logo at 8.5 s.
#
#   python3 praise_music.py <out.wav>
import sys

from sfxlib import (Mix, bass, bell, boom, clap, ding, hat, hp, kick, pad, pluck, pop,
                    riser, rng, tt, whoosh)
import numpy as np

BEAT = .5
m = Mix(11.5)
D, A, Bm, G = [62, 66, 69], [61, 64, 69], [62, 66, 71], [62, 67, 71]

# 0-2.5 s: hook types out
m.place(pad([50, 57, 62, 66], 2.4, 1600), 0, .28, send=.5)
for k in range(24):
    t = tt(.03)
    m.place(hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 160), .3 + k * .075 + rng.uniform(-.01, .01), .12, pan=.4 + .2 * rng.random())
m.place(riser(1.0), 1.5, .3, send=.3)


def groove(t0, chord, root, full, bars=1.0):
    length = 2 * bars
    m.place(pad(chord, length), t0, .26 if full else .2, send=.5)
    for s in range(int(8 * bars)):
        m.place(bass(root, BEAT / 2 * .95), t0 + s * BEAT / 2, .42 if full else .3)
    for s in range(int(4 * bars)):
        if full or s % 2 == 0:
            m.place(kick(), t0 + s * BEAT, .9)
        if s % 2 == 1:
            m.place(clap(), t0 + s * BEAT, .55 if full else .35, send=.25)
        m.place(hat(), t0 + s * BEAT + BEAT / 2, .12, pan=.65)
    if full:
        arp = chord + [chord[1] + 12, chord[2] + 12, chord[0] + 12, chord[2], chord[1]]
        for s in range(int(16 * bars)):
            m.place(pluck(arp[s % 8] + 12), t0 + s * BEAT / 4, .12, pan=.3 + .4 * (s % 2), send=.35)


# 2.5-5.5 s: praise pours in
groove(2.5, D, 38, False)
groove(4.5, A, 45, False, bars=.5)
for k in range(6):
    m.place(ding(k % 2 == 1), 2.5 + k * .5, .3, pan=.3 + .4 * (k % 2), send=.3)
m.place(riser(1.0), 4.5, .35, send=.3)

# 5.5-8.5 s: drop into the product cuts
m.place(boom(1.0), 5.5, .9, send=.4)
groove(5.5, Bm, 47, True)
groove(7.5, G, 43, True, bars=.5)
for at in (6.5, 7.5):
    m.place(whoosh(), at - .3, .3, pan=.35, send=.2)
m.place(riser(.8), 7.7, .3, send=.3)

# 8.5-11.5 s: logo
m.place(boom(.6), 8.5, .7, send=.4)
m.place(pop(), 8.52, .4, send=.3)
m.place(pad(A, 1.0), 8.5, .3, send=.6)
m.place(pad(D, 2.0), 9.5, .32, send=.7)
m.place(bass(45, 1.0), 8.5, .4)
m.place(bass(38, 2.0), 9.5, .4)
for k, n in enumerate([74, 78, 81, 86, 90]):
    m.place(bell(n), 9.5 + k * .09, .12, pan=.2 + .15 * k, send=.7)

Mix.write(m.master(), sys.argv[1])
