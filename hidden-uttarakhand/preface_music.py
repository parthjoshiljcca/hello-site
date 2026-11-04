# Thriller score for the narrated preface, built on the timeline narration.py wrote: a dark
# drone on D under a low tanpura, a taiko ostinato that builds scene by scene, a ticking clock,
# an impact on every keyword slam and scene cut, wind, the temple bell on "घंटी", the river, a
# heartbeat and a dead silence before "आपको चुनते हैं", page turns and a braam into the title.
# The music ducks under the voice, then the voice is mixed in on top.
#
#   python3 preface_music.py <out.wav>
import json
import os
import sys

import numpy as np
import soundfile as sf

from sfxlib import SR, Mix, bell, boom, hp, hz, lp, pad, riser, rng, saw, sweep_lp, tt

DIR = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(DIR, 'out', 'audio', 'narration')
TL = json.load(open(os.path.join(WORK, 'timeline.json')))
LN, DUR = TL['lines'], TL['duration']
scene = {l['scene']: l for l in LN}
start = [0] + [l['start'] - .5 for l in LN[1:]]  # scene cuts, as in preface.html's sceneStart()
cut = dict(zip([l['scene'] for l in LN], start))


# the gold keyword groups preface.html slams onto the screen
SLAMS = []
for l in LN:
    if l['scene'] == 'title':
        continue
    prev = False
    for sg in l['segs']:
        for w in sg['words']:
            g = w['w'].strip('।').startswith('*') and w['w'].rstrip('।').endswith('*')
            if g and not prev:
                SLAMS.append(w['t'])
            prev = g


def taiko(size=1.0):
    t = tt(.9)
    body = np.sin(2 * np.pi * np.cumsum(58 + 70 * np.exp(-t * 22)) / SR) * np.exp(-t * 6)
    skin = lp(rng.standard_normal(len(t)), 1400) * np.exp(-t * 30) * .6
    return (body + skin) * size


def impact():
    t = tt(1.6)
    crack = hp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 18) * .8
    sub = np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    return crack + sub + boom(.6)[: len(t)] * .5


def tick(hi):
    t = tt(.03)
    return hp(rng.standard_normal(len(t)), 4000 if hi else 2500) * np.exp(-t * 220)


def word_time(sc, part):
    return next(w['t'] for s in scene[sc]['segs'] for w in s['words'] if part in w['w'])


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def tanpura(midi, length=3.2):
    t = tt(length)
    f, out = hz(midi), np.zeros(len(t))
    for k in range(1, 24):
        if f * k > 8000:
            break
        out += np.sin(2 * np.pi * f * k * t + k) / k ** .8 * (1 + .6 * np.sin(2 * np.pi * (.35 + k * .05) * t + k)) * np.exp(-t * (1.1 + k * .06))
    return out * np.minimum(1, t / .01) * .25


def drone(length, notes, bright=320):
    t = tt(length)
    sig = sum(saw(hz(n) * (1 + d), t, 16) for n in notes for d in (-.003, .003)) / (2 * len(notes))
    return lp(lp(sig, bright), bright) * (1 + .35 * np.sin(2 * np.pi * .11 * t)) * np.minimum(1, np.minimum(t, length - t) / 1.5)


def heartbeat():
    out = np.zeros(int(SR * .6))
    for o, g in ((0, 1), (.2, .7)):
        t = tt(.35)
        s = np.sin(2 * np.pi * np.cumsum(48 + 40 * np.exp(-t * 25)) / SR) * np.exp(-t * 11) * g
        i = int(o * SR)
        out[i:i + len(s)] += s
    return out


def reverse_swell(length=.9):
    t = tt(length)
    return sweep_lp(noise(length), 300, 7000) * (t / length) ** 3 + np.sin(2 * np.pi * hz(74) * t) * (t / length) ** 4 * .3


def temple_bell(length=5.0):
    t = tt(length)
    parts = [(1, 1, .6), (2.0, .55, .9), (2.76, .45, 1.4), (5.4, .25, 2.2), (8.9, .12, 3.0)]
    return sum(a * np.sin(2 * np.pi * hz(57) * r * t) * np.exp(-t * d) for r, a, d in parts) * (1 - np.exp(-t * 400))


def page_turn():
    t = tt(.55)
    env = np.sin(np.pi * np.minimum(1, t / .5)) ** 2 * (1 + .6 * np.sin(2 * np.pi * 23 * t))
    return sweep_lp(hp(noise(.55), 900), 1800, 6000) * env * .6


def braam(length=3.5):
    t = tt(length)
    sig = sum(saw(hz(n), t, 30) for n in (26, 38, 45, 50)) / 4
    return sweep_lp(sig, 2200, 250) * np.exp(-t * .9) * np.minimum(1, t / .02)


def flute(phrase, at, gain=.2):
    f = np.concatenate([np.full(int(SR * d), hz(n)) for n, d in phrase])
    f = lp(lp(f - f[0], 14), 14) + f[0]
    t = np.arange(len(f)) / SR
    f = f * (1 + .006 * np.minimum(1, t / .6) * np.sin(2 * np.pi * 5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + .25 * np.sin(2 * ph) + sweep_lp(hp(noise(t[-1] + 1 / SR), 1500), 3000, 3000) * .25
    mus.place(tone * np.minimum(1, t / .2) * np.minimum(1, (t[-1] - t) / .7), at, gain, pan=.45, send=.85)


mus = Mix(DUR)

# bed: drone and tanpura for the whole piece, the drone growing darker towards "chosen"
mus.place(drone(cut['chosen'] + 1, [38, 45]), 0, .5, send=.3)
mus.place(drone(cut['book'] - cut['chosen'] + 1, [38, 39, 45], 420), cut['chosen'], .55, send=.4)  # D-Eb rub for the twist
mus.place(drone(DUR - cut['book'], [38, 45, 50]), cut['book'], .45, send=.4)
for i, at in enumerate(np.arange(.8, DUR - 1.5, 1.1)):
    if not cut['chosen'] <= at < cut['book']:
        mus.place(tanpura([45, 50, 50, 38][i % 4]), at, .16, pan=.35 + .1 * (i % 4), send=.35)

# opening: a hit out of black
mus.place(boom(1.0), .05, .9, send=.5)
mus.place(bell(86), .1, .06, send=.9)

# every cut: a reverse swell into an impact
for at in start[1:]:
    mus.place(reverse_swell(), at - .9, .45, send=.3)
    mus.place(impact(), at, .7, send=.4)

# every keyword slam
for at in SLAMS:
    mus.place(impact(), at - .02, .75, send=.5)

lit = word_time('chosen', 'आपको')

# taiko ostinato, 80 bpm, growing busier and louder scene by scene until the drop before "आपको"
BEAT = .75
for b, at in enumerate(np.arange(LN[0]['start'], lit - 1.0, BEAT / 2)):
    level = np.interp(at, [0, cut['forest'], cut['trail'], cut['river'], cut['chosen'], lit], [.35, .5, .6, .75, .9, 1])
    step = b % 8
    if step in (0, 3, 6) or (at > cut['trail'] and step == 7) or (at > cut['chosen'] and step % 2):
        mus.place(taiko(1 if step == 0 else .6), at, .55 * level, pan=.45 + .1 * (step % 2), send=.25)

# a ticking clock from the forest until the drop
for k, at in enumerate(np.arange(cut['forest'] + .2, lit - 1.0, BEAT / 2)):
    mus.place(tick(k % 2 == 0), at, .18, pan=.65, send=.15)

# night wind under the peaks and the forest
w = sweep_lp(noise(cut['trail'] + 1), 260, 380)
wt = np.arange(len(w)) / SR
mus.place(w * (.5 + .5 * np.sin(2 * np.pi * .13 * wt) ** 2) * np.minimum(1, (cut['trail'] + 1 - wt) / 1.5), 0, .9, send=.2)
for k, n in enumerate([86, 90, 93, 98]):  # shooting star
    mus.place(bell(n), 2.65 + k * .07, .04, pan=.7 - .1 * k, send=.8)

# trail: footsteps on gravel
for at in np.arange(cut['trail'] + .4, cut['village'], .55):
    s = hp(noise(.08), 1800) * np.exp(-tt(.08) * 50)
    mus.place(s, at + rng.uniform(-.02, .02), .12, pan=.45, send=.1)

# village: the temple bell on "घंटी" and three seconds later
for at in (word_time('village', 'घंटी'), word_time('village', 'घंटी') + 3):
    mus.place(temple_bell(), at, .5, pan=.62, send=.6)

# river and the glowing stone
rv = sweep_lp(hp(noise(cut['chosen'] - cut['river']), 400), 2500, 2500)
rt = np.arange(len(rv)) / SR
mus.place(rv * (.7 + .3 * np.sin(2 * np.pi * 1.7 * rt)) * np.minimum(1, np.minimum(rt, rt[-1] - rt)), cut['river'], .25, send=.3)
for k, n in enumerate([74, 77, 81, 82, 86, 89]):
    mus.place(bell(n), word_time('river', 'पत्थर') - .2 + k * .13, .06, pan=.25 + .1 * k, send=.7)

# chosen: a heartbeat that quickens, then silence and a sting on "आपको"
at = cut['chosen'] + .3
while at < lit - 1.0:
    mus.place(heartbeat(), at, .8, send=.1)
    at += max(.62, 1.0 - (at - cut["chosen"]) * .07)
mus.place(boom(1.4), lit, 1.0, send=.7)
mus.place(braam(2.5), lit, .5, send=.5)
mus.place(pad([62, 63, 69], 2.2, 2400), lit, .15, send=.8)

# book: page turns
for d in (.7, 1.9, 3.1):
    mus.place(page_turn(), cut['book'] + d, .45, pan=.55, send=.25)
mus.place(pad([50, 57, 62, 66], cut['title'] - cut['book'], 1300), cut['book'], .12, send=.7)

# title: braam, then a warm D major resolve, a flute and the bell
mus.place(braam(), cut['title'], .7, send=.5)
mus.place(boom(1.0), cut['title'], .7, send=.5)
mus.place(pad([38, 50, 57, 62, 66], DUR - cut['title'] - 1, 1600), cut['title'] + .5, .22, send=.8)
end = scene['title']['end']
flute([(69, .7), (71, .7), (74, 2.6)], end - .4, .22)
for k, n in enumerate([74, 78, 81, 86]):
    mus.place(bell(n), word_time('title', 'उत्तराखंड') + k * .12, .06, pan=.3 + .12 * k, send=.8)
mus.place(temple_bell(4.0), end + .3, .25, pan=.5, send=.7)

music = mus.master(rev_amount=.35, fade_out=1.2)
mt = np.arange(len(music)) / SR  # dead silence just before the twist
music *= np.interp(mt, [lit - 1.0, lit - .8, lit - .03, lit], [1, .03, .03, 1])[:, None]

# the voice, with a little room, and the music ducked underneath it
voice, _ = sf.read(os.path.join(WORK, 'voice.wav'))
vox = Mix(DUR)
vox.place(voice, 0, 1.0, pan=.5, send=.12)
vmix = vox.master(rev_amount=.12, fade_out=.1)
env = lp(lp(np.abs(voice), 6), 6)[: len(music)]
env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
duck = 1 - .4 * np.pad(env, (0, len(music) - len(env)))[:, None]
music = music / np.abs(music).max()
vmix = vmix / np.abs(vmix).max()
Mix.write(vmix[: len(music)] * 1.0 + music * .62 * duck, sys.argv[1])
