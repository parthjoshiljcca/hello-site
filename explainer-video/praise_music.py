# Original 15-second score for praise-reel.html ("When everyone praises your app"):
# typing clicks under the hook, a light groove with a notification ding per praise bubble,
# a tape-stop at 6 s, a full drop when the sunglasses land, and a resolve on the logo.
#
#   python3 praise_music.py <out.wav>
import sys

from sfxlib import (Mix, bass, bell, boom, clap, ding, hat, hp, kick, pad, pluck, pop,
                    riser, rng, thud, tt, whoosh)
import numpy as np

BEAT = .5
m = Mix(15)
D, A, Bm, G = [62, 66, 69], [61, 64, 69], [62, 66, 71], [62, 67, 71]

# 0-2.5 s: hook types out
m.place(pad([50, 57, 62, 66], 2.4, 1600), 0, .28, send=.5)
for k in range(24):
    t = tt(.03)
    m.place(hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 160), .3 + k * .075 + rng.uniform(-.01, .01), .12, pan=.4 + .2 * rng.random())
m.place(riser(1.0), 1.5, .3, send=.3)


def groove(t0, chord, root, full):
    m.place(pad(chord, 2), t0, .26 if full else .2, send=.5)
    for s in range(8):
        m.place(bass(root, BEAT / 2 * .95), t0 + s * BEAT / 2, .42 if full else .3)
    for s in range(4):
        if full or s in (0, 2):
            m.place(kick(), t0 + s * BEAT, .9)
        if s in (1, 3):
            m.place(clap(), t0 + s * BEAT, .55 if full else .35, send=.25)
        m.place(hat(), t0 + s * BEAT + BEAT / 2, .12, pan=.65)
    if full:
        arp = chord + [chord[1] + 12, chord[2] + 12, chord[0] + 12, chord[2], chord[1]]
        for s in range(16):
            m.place(pluck(arp[s % 8] + 12), t0 + s * BEAT / 4, .12, pan=.3 + .4 * (s % 2), send=.35)


# 2.5-6 s: praise pours in
groove(2.5, D, 38, False)
groove(4.5, A, 45, False)
for k in range(6):
    m.place(ding(k % 2 == 1), 2.5 + k * .5, .3, pan=.3 + .4 * (k % 2), send=.3)

# 6.5-12.5 s: the drop
m.place(boom(1.0), 6.5, .9, send=.4)
for b, (chord, root) in enumerate([(D, 38), (A, 45), (Bm, 47)]):
    groove(6.5 + b * 2, chord, root, True)
m.place(thud(), 7.0, .8)  # sunglasses land
for k, n in enumerate([86, 90, 93]):
    m.place(bell(n), 7.02 + k * .05, .14, pan=.3 + .2 * k, send=.6)
for at in (9.5, 10.5, 11.5):
    m.place(whoosh(), at - .3, .3, pan=.35, send=.2)
m.place(riser(1.0), 11.5, .3, send=.3)

# 12.5-15 s: logo
m.place(boom(.6), 12.5, .7, send=.4)
m.place(pop(), 12.52, .4, send=.3)
m.place(pad(G, 1.0), 12.5, .3, send=.6)
m.place(pad(D, 1.5), 13.5, .32, send=.7)
m.place(bass(43, 1.0), 12.5, .4)
m.place(bass(38, 1.5), 13.5, .4)
for k, n in enumerate([74, 78, 81, 86, 90]):
    m.place(bell(n), 13.5 + k * .09, .12, pan=.2 + .15 * k, send=.7)

mix = m.master()
mix = Mix.tape_stop(mix, 5.85, .65)
mix[int(6.5 * 48000) - int(.15 * 48000):int(6.5 * 48000)] *= np.linspace(1, 0, int(.15 * 48000))[:, None]
Mix.write(mix, sys.argv[1])
