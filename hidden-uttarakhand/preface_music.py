# Score for the narrated preface, built on the timeline voiceover.py wrote. It follows the story:
# a calm dawn on tanpura and flute; footsteps and a taiko pulse that grows through the climb, with
# a heartbeat under "साँस तेज़"; a ticking, unseen presence in the forest; a dead silence on the
# glimpse in the fog and a huge hit with a choir-like swell on "मंदिर"; temple lamps, flute and
# bells for the tears; the bell calling on "बुलाया" and "बुलावा"; a braam and resolve on the title.
# Every keyword slam gets an impact. The music ducks under the voice, which is mixed in on top.
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
DUR, CUES = TL['duration'], TL['cues']
cut = {s['name']: s['start'] for s in TL['scenes']}
starts = [s['start'] for s in TL['scenes']]

# the gold keyword groups preface.html slams onto the screen (one group per run of gold words in a phrase)
SLAMS = []
for l in TL['lines']:
    for sg in l['segs']:
        prev = False
        for w in sg['words']:
            g = w['w'].startswith('*') and w['w'].rstrip('।,…?!—').endswith('*')
            if g and not prev:
                SLAMS.append(w['t'])
            prev = g


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


def choir(notes, length):
    """Slow 'aah' swell: detuned saws through a vowel-like band."""
    t = tt(length)
    sig = sum(saw(hz(n) * (1 + d), t, 30) for n in notes for d in (-.006, 0, .006)) / (3 * len(notes))
    sig = lp(hp(sig, 300), 1800) * (1 + .1 * np.sin(2 * np.pi * 5 * t))
    return sig * np.minimum(1, t / 1.8) * np.minimum(1, (length - t) / 2.0)


def flute(phrase, at, gain=.2, pan=.45):
    f = np.concatenate([np.full(int(SR * d), hz(n)) for n, d in phrase])
    f = lp(lp(f - f[0], 14), 14) + f[0]
    t = np.arange(len(f)) / SR
    f = f * (1 + .006 * np.minimum(1, t / .6) * np.sin(2 * np.pi * 5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + .25 * np.sin(2 * ph) + sweep_lp(hp(rng.standard_normal(len(t)), 1500), 3000, 3000) * .25
    mus.place(tone * np.minimum(1, t / .2) * np.minimum(1, (t[-1] - t) / .7), at, gain, pan=pan, send=.85)


def taiko(size=1.0):
    t = tt(.9)
    body = np.sin(2 * np.pi * np.cumsum(58 + 70 * np.exp(-t * 22)) / SR) * np.exp(-t * 6)
    return (body + lp(noise(.9), 1400) * np.exp(-t * 30) * .6) * size


def impact():
    t = tt(1.6)
    crack = hp(noise(1.6), 1500) * np.exp(-t * 18) * .8
    sub = np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    return crack + sub + boom(.6)[: len(t)] * .5


def heartbeat():
    out = np.zeros(int(SR * .6))
    for o, g in ((0, 1), (.2, .7)):
        t = tt(.35)
        s = np.sin(2 * np.pi * np.cumsum(48 + 40 * np.exp(-t * 25)) / SR) * np.exp(-t * 11) * g
        out[int(o * SR):int(o * SR) + len(s)] += s
    return out


def tick(hi):
    t = tt(.03)
    return hp(noise(.03), 4000 if hi else 2500) * np.exp(-t * 220)


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
    return sweep_lp(sum(saw(hz(n), t, 30) for n in (26, 38, 45, 50)) / 4, 2200, 250) * np.exp(-t * .9) * np.minimum(1, t / .02)


def wind(a, b, gain):
    w = sweep_lp(noise(b - a), 260, 380)
    t = np.arange(len(w)) / SR
    mus.place(w * (.5 + .5 * np.sin(2 * np.pi * .13 * t) ** 2) * np.minimum(1, np.minimum(t, t[-1] - t) / 1.5), a, gain, send=.2)


mus = Mix(DUR)
S, R, G, P, Dh = 62, 64, 66, 69, 71  # Bhupali on D4
lit, temple = CUES['lit'], CUES['temple']

# ---- the bed: tanpura through the whole story, a dark drone through the climb and the forest
for i, at in enumerate(np.arange(.6, DUR - 2, 1.1)):
    if not lit - 1.2 <= at < temple:
        mus.place(tanpura([45, 50, 50, 38][i % 4]), at, .16, pan=.35 + .1 * (i % 4), send=.35)
mus.place(drone(cut['river'] - cut['trail'] + 1, [38, 45]), cut['trail'], .45, send=.3)
mus.place(drone(lit - cut['golden'], [38, 39, 45], 380), cut['golden'], .4, send=.4)

# ---- dawn: a hit out of black, a calm flute, morning birds
mus.place(boom(.8), .05, .7, send=.5)
flute([(P, 1.0), (Dh, .5), (P, .5), (G, 1.0), (R, .5), (S, 2.4)], 1.4, .2)
flute([(S, .5), (R, .5), (G, .5), (P, 1.2), (Dh, .6), (P, 2.0)], 6.4, .17)
for k in range(10):
    at = 2 + k * .9 + rng.uniform(0, .4)
    t = tt(.12)
    mus.place(np.sin(2 * np.pi * np.cumsum(3200 + 900 * np.sin(2 * np.pi * 18 * t)) / SR) * np.sin(np.pi * t / .12), at, .025, pan=rng.uniform(.2, .8), send=.5)
wind(0, cut['trail'], .35)

# ---- village: murmuring crowd, then the narrator is alone
crowd = sweep_lp(hp(noise(cut['trail'] - cut['village']), 300), 900, 900)
ct = np.arange(len(crowd)) / SR
mus.place(crowd * (.6 + .4 * np.sin(2 * np.pi * 2.3 * ct) * np.sin(2 * np.pi * .7 * ct)) * np.minimum(1, np.minimum(ct, ct[-1] - ct) / .8), cut['village'], .12, send=.4)

# ---- every cut: a reverse swell into an impact; every keyword: an impact
for at in starts[1:]:
    if abs(at - temple) > 1.5:
        mus.place(reverse_swell(), at - .9, .4, send=.3)
        mus.place(impact(), at, .55, send=.4)
for at in SLAMS:
    mus.place(impact(), at - .02, .7 if at < lit else .45, send=.5)

# ---- trail and climb: footsteps, then a taiko pulse that grows until the glimpse in the fog
for at in np.arange(cut['trail'] + .4, cut['forest'], .55):
    mus.place(hp(noise(.08), 1800) * np.exp(-tt(.08) * 50), at + rng.uniform(-.02, .02), .1, pan=.45, send=.1)
BEAT = .75
for b, at in enumerate(np.arange(cut['trail'] + 2, lit - 1.0, BEAT / 2)):
    if cut['river'] - .5 < at < cut['golden']:
        continue  # the mind goes quiet by the river
    level = np.interp(at, [cut['trail'], cut['climb'], cut['forest'], cut['golden'], cut['chosen'], lit], [.3, .6, .5, .55, .8, 1])
    step = b % 8
    if step in (0, 3, 6) or (at > cut['climb'] and step == 7) or (at > cut['chosen'] and step % 2):
        mus.place(taiko(1 if step == 0 else .6), at, .55 * level, pan=.45 + .1 * (step % 2), send=.25)
at = cut['climb'] + .2
while at < cut['forest'] - .3:  # "साँस तेज़ होने लगी थी"
    mus.place(heartbeat(), at, .55, send=.1)
    at += max(.6, .95 - (at - cut['climb']) * .03)

# ---- forest: wind, ticking, someone unseen
wind(cut['forest'], cut['river'] + 1, .7)
for k, at in enumerate(np.arange(cut['forest'] + .2, cut['river'], BEAT / 2)):
    mus.place(tick(k % 2 == 0), at, .16, pan=.65, send=.15)
mus.place(pad([62, 63, 69], cut['river'] - cut['forest'], 2000), cut['forest'], .07, send=.8)

# ---- river: water, a calm flute
rv = sweep_lp(hp(noise(cut['golden'] - cut['river']), 400), 2500, 2500)
rt = np.arange(len(rv)) / SR
mus.place(rv * (.7 + .3 * np.sin(2 * np.pi * 1.7 * rt)) * np.minimum(1, np.minimum(rt, rt[-1] - rt)), cut['river'], .22, send=.3)
flute([(G, 1.0), (P, .5), (Dh, 1.0), (P, .5), (G, 2.4)], cut['river'] + 4.6, .16)

# ---- golden and chosen: a riser, then dead silence on the glimpse, then "मंदिर"
mus.place(riser(3.0), lit - 3.4, .4, send=.4)
mus.place(boom(1.4), temple, 1.0, send=.7)
mus.place(braam(3.0), temple, .45, send=.5)
mus.place(choir([50, 57, 62, 66, 69], cut['diya'] - temple + 1), temple, .35, send=.9)
for k, n in enumerate([74, 78, 81, 86, 90]):
    mus.place(bell(n), temple + .2 + k * .12, .07, pan=.25 + .12 * k, send=.8)
mus.place(temple_bell(), temple + 2.0, .35, pan=.6, send=.7)

# ---- diya: tears; a soft pad and a slow flute
mus.place(pad([50, 57, 62, 66], cut['calling'] - cut['diya'], 1300), cut['diya'], .16, send=.8)
flute([(P, 1.2), (G, .6), (R, .6), (S, 2.2), (R, .6), (G, 2.8)], cut['diya'] + 1.0, .15, .55)

# ---- calling: the bell rings on "बुलाया" and "बुलावा"; the pulse returns gently
for at in CUES['bells']:
    mus.place(temple_bell(), at, .5, pan=.62, send=.6)
for b, at in enumerate(np.arange(cut['calling'] + 2, cut['book'], BEAT)):
    mus.place(taiko(.7 if b % 2 else 1), at, .3, pan=.5, send=.3)
mus.place(choir([50, 57, 62, 66], cut['book'] - cut['calling'] + 1), cut['calling'] + 4, .2, send=.9)

# ---- book: page turns; title: braam, resolve, flute and bell
for d in (.7, 1.9, 3.1):
    mus.place(page_turn(), cut['book'] + d, .45, pan=.55, send=.25)
mus.place(braam(), cut['title'], .65, send=.5)
mus.place(boom(1.0), cut['title'], .7, send=.5)
mus.place(pad([38, 50, 57, 62, 66], DUR - cut['title'] - 1, 1600), cut['title'] + .4, .22, send=.8)
flute([(P, .7), (Dh, .7), (S + 12, 3.0)], cut['title'] + 1.4, .2)
for k, n in enumerate([74, 78, 81, 86]):
    mus.place(bell(n), cut['title'] + 1.4 + k * .12, .06, pan=.3 + .12 * k, send=.8)
mus.place(temple_bell(4.0), cut['title'] + 3.6, .25, pan=.5, send=.7)

music = mus.master(rev_amount=.35, fade_out=1.4)
mt = np.arange(len(music)) / SR  # dead silence on the glimpse in the fog, until "मंदिर"
music *= np.interp(mt, [lit - .6, lit - .3, temple - .05, temple], [1, .04, .04, 1])[:, None]

# the voice, with a little room, and the music ducked underneath it
voice, _ = sf.read(os.path.join(WORK, 'voice.wav'))
vox = Mix(DUR)
vox.place(voice, 0, 1.0, pan=.5, send=.1)
vmix = vox.master(rev_amount=.1, fade_out=.1)
env = lp(lp(np.abs(voice), 6), 6)[: len(music)]
env = np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
duck = 1 - .45 * np.pad(env, (0, len(music) - len(env)))[:, None]
music = music / np.abs(music).max()
vmix = vmix / np.abs(vmix).max()
Mix.write(vmix[: len(music)] + music * .55 * duck, sys.argv[1])
