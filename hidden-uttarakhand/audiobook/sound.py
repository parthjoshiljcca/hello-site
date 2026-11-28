# Sound kit for the audiobook, in numpy only: filters done in the frequency domain, a synthetic hall
# reverb, and the instruments, ambiences and effects the chapters ask for. Everything is stereo float32
# at 48 kHz, shape (n, 2), and seeded so a rebuild sounds the same.
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(sec * SR)) / SR


def st(x, pan=0.0):
    """mono -> stereo with constant-power pan (-1 left .. 1 right)."""
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1).astype(np.float32)


def band(x, lo=None, hi=None, slope=1.5):
    """Zero-phase band filter by FFT with soft edges; x mono or stereo."""
    if x.ndim == 2:
        return np.stack([band(x[:, i], lo, hi, slope) for i in range(2)], 1)
    n = len(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** (2 * slope))
    if hi:
        g *= 1 / (1 + (f / hi) ** (2 * slope))
    return np.fft.irfft(np.fft.rfft(x) * g, n).astype(np.float32)


def noise(sec, color='white'):
    x = rng.standard_normal(int(sec * SR)).astype(np.float32)
    if color == 'pink':
        n = len(x); f = np.fft.rfftfreq(n, 1 / SR)
        x = np.fft.irfft(np.fft.rfft(x) / np.sqrt(np.maximum(f, 20)), n).astype(np.float32)
    elif color == 'brown':
        n = len(x); f = np.fft.rfftfreq(n, 1 / SR)
        x = np.fft.irfft(np.fft.rfft(x) / np.maximum(f, 20), n).astype(np.float32)
    return x / (np.abs(x).max() + 1e-9)


def env(n, a=.01, r=.2, sustain=True):
    e = np.ones(n, np.float32)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr and nr < n: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def decay(n, tau):
    return np.exp(-np.arange(n) / (tau * SR)).astype(np.float32)


def fade(x, a=.5, r=.5):
    x = x.copy(); n = len(x)
    na, nr = min(int(a * SR), n), min(int(r * SR), n)
    if na: x[:na] *= np.linspace(0, 1, na)[:, None] if x.ndim == 2 else np.linspace(0, 1, na)
    if nr: x[-nr:] *= np.linspace(1, 0, nr)[:, None] if x.ndim == 2 else np.linspace(1, 0, nr)
    return x


_IR = {}


def reverb(x, size=2.2, wet=.3, bright=6000):
    """Convolve with a decaying stereo noise tail (cached per size)."""
    key = (size, bright)
    if key not in _IR:
        n = int(size * SR)
        ir = np.stack([noise(size), noise(size)], 1) * decay(n, size / 6.9)[:, None]
        ir = band(ir, 120, bright)
        _IR[key] = ir / np.sqrt((ir ** 2).sum(0, keepdims=True))
    ir = _IR[key]
    xs = x if x.ndim == 2 else st(x)
    n = len(xs) + len(ir)
    N = 1 << (n - 1).bit_length()
    y = np.stack([np.fft.irfft(np.fft.rfft(xs[:, i], N) * np.fft.rfft(ir[:, i], N), N)[:len(xs)] for i in range(2)], 1)
    return (xs * (1 - wet) + y * wet * 2.2).astype(np.float32)


def place(buf, x, at):
    """Add x into buf at time 'at' seconds (clipped to the buffer)."""
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    j = max(0, -i); i = max(0, i)
    k = min(len(buf) - i, len(x) - j)
    buf[i:i + k] += x[j:j + k]


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---- instruments
def flute(notes, bpm=72, vib=5.2, breath=.06):
    """A bansuri-like line: notes = [(midi or None, beats), ...]."""
    beat = 60 / bpm
    out = []
    for m, b in notes:
        d = b * beat
        n = int(d * SR)
        if m is None:
            out.append(np.zeros(n, np.float32)); continue
        tt = np.arange(n) / SR
        f = hz(m) * (1 + .006 * np.sin(2 * np.pi * vib * tt) * np.clip(tt / .35, 0, 1))
        ph = 2 * np.pi * np.cumsum(f) / SR
        tone = np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
        air = band(noise(d), hz(m) * .8, hz(m) * 3) * breath
        out.append(((tone * .5 + air) * env(n, .06, min(.25, d * .4))).astype(np.float32))
    return np.concatenate(out)


SHEPHERD = [(74, 1), (76, .5), (79, .5), (81, 1.5), (79, .5), (76, 1), (74, 1.5), (None, .5),
            (72, .5), (74, .5), (76, 1), (74, .5), (72, .5), (69, 2.5)]   # the shepherd tune from the book's song


def drone(sec, notes=(50, 57, 62), bright=900, shimmer=.15):
    tt = t(sec)
    x = np.zeros(len(tt), np.float32)
    for i, m in enumerate(notes):
        f = hz(m)
        for k, a in ((1, 1), (2, .45), (3, .25), (4, .12)):
            x += a * np.sin(2 * np.pi * f * k * tt * (1 + .0015 * i) + i) / len(notes)
    x *= 1 + shimmer * np.sin(2 * np.pi * .09 * tt)
    return band(x, 40, bright)


def strings(sec, notes, bright=1800, swell=True):
    """Low string pad: detuned saws, filtered, slow swell."""
    tt = t(sec)
    x = np.zeros(len(tt), np.float32)
    for m in notes:
        for d in (-.12, 0, .11):
            f = hz(m + d)
            x += (2 * ((f * tt) % 1) - 1) / (3 * len(notes))
    x = band(x, 60, bright)
    e = np.clip(tt / (sec * .5), 0, 1) ** 1.5 if swell else np.ones_like(tt)
    return (x * e * env(len(tt), .3, min(1.5, sec / 3))).astype(np.float32)


def pluck(m, dur=1.2, bright=3500):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    x = sum(a * np.sin(2 * np.pi * f * k * tt) * np.exp(-tt * (2.5 + k * 1.5)) for k, a in ((1, 1), (2, .5), (3, .3), (4, .15)))
    return band(x.astype(np.float32), 80, bright)


def bell(m=79, dur=4.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(m)
    x = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * d) for r, a, d in ((1, 1, .9), (2.76, .5, 1.6), (5.4, .25, 2.6), (.5, .3, .6)))
    return (x * .4).astype(np.float32)


def drum(kind='low'):
    """Frame drum / dhol hit."""
    n = int(.7 * SR); tt = np.arange(n) / SR
    if kind == 'low':
        f = 70 * np.exp(-tt * 9) + 48
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
        x += band(noise(.7), 80, 600) * np.exp(-tt * 30) * .4
    else:
        f = 210 * np.exp(-tt * 14) + 160
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 16)
        x += band(noise(.7), 600, 5000) * np.exp(-tt * 45) * .5
    return x.astype(np.float32)


def heartbeat(sec, bpm=62):
    out = np.zeros(int(sec * SR), np.float32)
    beat = 60 / bpm
    k = 0
    while k * beat < sec - .6:
        for off, g in ((0, 1), (.28, .7)):
            x = drum('low') * g
            place(out, x[:int(.5 * SR)], k * beat + off)
        k += 1
    return band(out, 30, 220)


# ---- ambiences (stereo)
def wind(sec, strength=1.0):
    n = noise(sec, 'pink')
    tt = t(sec)
    gust = .55 + .45 * np.sin(2 * np.pi * .07 * tt + rng.uniform(0, 6)) * np.sin(2 * np.pi * .023 * tt + 1)
    l = band(n * gust, 120, 900 + 500 * strength)
    r = band(np.roll(n, SR // 3) * gust, 140, 800 + 500 * strength)
    return np.stack([l, r], 1) * .5 * strength


def fire(sec):
    base = band(noise(sec, 'brown'), 60, 500) * .35
    out = st(base)
    k = int(sec * 9)
    for _ in range(k):
        c = band(noise(.03), 1500, 9000) * decay(int(.03 * SR), .004) * rng.uniform(.2, 1)
        place(out, st(c, rng.uniform(-.6, .6)), rng.uniform(0, sec))
    return out * .6


def crickets(sec, density=1.0):
    out = np.zeros((int(sec * SR), 2), np.float32)
    for _ in range(int(sec * 1.2 * density)):
        f = rng.uniform(4200, 5200)
        n = int(.09 * SR); tt = np.arange(n) / SR
        chirp = np.sin(2 * np.pi * f * tt) * (np.sin(2 * np.pi * 30 * tt) > 0) * env(n, .005, .02)
        burst = np.concatenate([chirp, np.zeros(int(.05 * SR))] * rng.integers(2, 5)).astype(np.float32)
        place(out, st(burst * rng.uniform(.05, .15), rng.uniform(-.9, .9)), rng.uniform(0, sec))
    return out


def murmur(sec, people=10):
    """Crowd / restaurant murmur: band-limited noise with syllable-rate modulation."""
    out = np.zeros((int(sec * SR), 2), np.float32)
    tt = t(sec)
    for i in range(people):
        mod = np.clip(np.sin(2 * np.pi * rng.uniform(3, 5.5) * tt + rng.uniform(0, 6)), 0, 1) * \
              np.clip(np.sin(2 * np.pi * rng.uniform(.1, .3) * tt + rng.uniform(0, 6)), 0, 1)
        v = band(noise(sec), rng.uniform(250, 450), rng.uniform(1800, 2600)) * mod
        out += st(v * .12, rng.uniform(-.8, .8))
    return out


def room_tone(sec):
    return st(band(noise(sec, 'pink'), 40, 400) * .05)


def clinks(sec, rate=.6):
    out = np.zeros((int(sec * SR), 2), np.float32)
    for _ in range(int(sec * rate)):
        f = rng.uniform(2500, 5200)
        n = int(.25 * SR); tt = np.arange(n) / SR
        x = (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2.7 * tt)) * np.exp(-tt * 28)
        place(out, st(x.astype(np.float32) * rng.uniform(.03, .08), rng.uniform(-.8, .8)), rng.uniform(0, sec))
    return out


def engine(sec, rpm=1100, load=.6):
    tt = t(sec)
    f0 = rpm / 60 * 2 * (1 + .04 * np.sin(2 * np.pi * .2 * tt) * load)
    ph = 2 * np.pi * np.cumsum(f0) / SR
    x = sum(a * np.sin(k * ph) for k, a in ((1, 1), (2, .6), (3, .35), (4, .2)))
    x = band(x.astype(np.float32), 30, 400) * .5 + band(noise(sec, 'brown'), 40, 300) * .4 * load
    road = band(noise(sec, 'pink'), 200, 1500) * .15 * load
    return st(x + road)


def birds(sec, rate=.5):
    out = np.zeros((int(sec * SR), 2), np.float32)
    for _ in range(int(sec * rate)):
        n = int(rng.uniform(.08, .2) * SR); tt = np.arange(n) / SR
        f = rng.uniform(2800, 4200) * (1 + .3 * np.sin(2 * np.pi * rng.uniform(8, 20) * tt))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .01, .05)
        place(out, st(x.astype(np.float32) * rng.uniform(.03, .08), rng.uniform(-.9, .9)), rng.uniform(0, sec))
    return out


def clock(sec, bpm=60):
    out = np.zeros((int(sec * SR), 2), np.float32)
    for k in range(int(sec * bpm / 60)):
        x = band(noise(.02), 1800, 7000) * decay(int(.02 * SR), .003) * (.12 if k % 2 else .09)
        place(out, st(x, .3), k * 60 / bpm)
    return out


# ---- one-shot effects (stereo)
def thump(g=1.0):
    n = int(.4 * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * (90 * np.exp(-tt * 12) + 50) * tt) * np.exp(-tt * 14) + band(noise(.4), 100, 1200) * np.exp(-tt * 40) * .5
    return st(x.astype(np.float32) * g)


def slam():
    x = thump(1.3)
    x[:int(.4 * SR)] += st(band(noise(.4), 400, 4000) * decay(int(.4 * SR), .04) * .4)
    return reverb(x, 1.0, .15)


def horn():
    tt = t(.55)
    x = sum(np.sign(np.sin(2 * np.pi * f * tt)) * .3 for f in (400, 500))
    return st(band(x.astype(np.float32), 300, 2500) * env(len(tt), .02, .08) * .35, .2)


def phone_ring():
    out = []
    for _ in range(2):
        tt = t(1.0)
        x = (np.sin(2 * np.pi * 880 * tt) + np.sin(2 * np.pi * 1320 * tt)) * (np.sin(2 * np.pi * 20 * tt) > 0) * .15
        out += [x.astype(np.float32), np.zeros(int(.8 * SR), np.float32)]
    return st(np.concatenate(out), .4)


def cooker():
    tt = t(1.6)
    f = 2100 + 120 * np.sin(2 * np.pi * 7 * tt)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + band(noise(1.6), 1800, 3500) * .5
    x = band(x.astype(np.float32), 300, 3400) * env(len(tt), .3, .5) * .25
    return st(x, -.3)


def crash():
    """A room-service trolley full of spoons going over."""
    out = np.zeros((int(3.0 * SR), 2), np.float32)
    place(out, thump(1.4), 0)
    for _ in range(70):
        f = rng.uniform(2000, 7000)
        n = int(.5 * SR); tt = np.arange(n) / SR
        x = (np.sin(2 * np.pi * f * tt) + .6 * np.sin(2 * np.pi * f * 2.41 * tt)) * np.exp(-tt * rng.uniform(10, 25))
        place(out, st(x.astype(np.float32) * rng.uniform(.04, .14), rng.uniform(-.9, .9)), rng.exponential(.35))
    return reverb(out, 1.4, .25)


def footsteps(sec, rate=3.2, g=.5):
    out = np.zeros((int(sec * SR), 2), np.float32)
    for k in range(int(sec * rate)):
        x = thump(g * rng.uniform(.6, 1))[:int(.15 * SR)]
        place(out, x * np.array([1, .8] if k % 2 else [.8, 1], np.float32), k / rate + rng.uniform(0, .03))
    return reverb(out, 1.2, .2)


def door():
    x = np.zeros((int(1.2 * SR), 2), np.float32)
    place(x, slam() * .7, 0)
    click = band(noise(.05), 2000, 6000) * decay(int(.05 * SR), .006) * .4
    place(x, st(click), .25)
    return x


def whoosh(sec=1.0, up=True):
    n = noise(sec)
    tt = t(sec)
    e = np.sin(np.pi * tt / sec) ** 2
    lo = 300 + 3000 * (tt / sec if up else 1 - tt / sec)
    out = np.zeros(len(tt), np.float32)
    for i in range(0, len(tt), SR // 20):
        seg = n[i:i + SR // 20]
        out[i:i + len(seg)] = band(seg, lo[i] * .6, lo[i] * 1.6)
    return st(out * e * .5)


def sting(dark=True):
    """A low hit with a string swell and a bell: for reveals."""
    out = np.zeros((int(4.5 * SR), 2), np.float32)
    place(out, thump(1.6) * 1.2, 0)
    s = strings(4.2, (38, 45, 50) if dark else (50, 57, 62, 66), 1400, swell=False) * decay(int(4.2 * SR), 1.6) * 1.4
    place(out, st(s), 0)
    place(out, st(bell(74 if dark else 81, 4.0) * .35, .2), .02)
    return reverb(out, 2.6, .35)


def sting_light():
    out = np.zeros((int(2.5 * SR), 2), np.float32)
    for i, m in enumerate((72, 76, 79, 84)):
        place(out, st(pluck(m, 1.2) * .5, -.4 + .25 * i), i * .11)
    return reverb(out, 1.8, .3)


def suv_idle(sec=8):
    x = engine(sec, 750, .3) * 1.3
    return fade(band(x, 30, 260), 1.5, 2.5)


def pencil(sec, rate=2.0):
    out = np.zeros((int(sec * SR), 2), np.float32)
    for _ in range(int(sec * rate)):
        d = rng.uniform(.15, .5)
        x = band(noise(d), 2500, 8000) * (.5 + .5 * np.sin(2 * np.pi * rng.uniform(8, 14) * t(d))) * env(int(d * SR), .02, .05) * .05
        place(out, st(x, .3), rng.uniform(0, sec))
    return out


# ---- more one-shots for the performance pass
def creak():
    """An old door opening slowly."""
    sec = 1.4
    tt = t(sec)
    f = 180 + 120 * np.sin(2 * np.pi * .6 * tt) + 40 * rng.standard_normal(len(tt)).cumsum() / SR
    pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > .97).astype(np.float32)
    x = band(pulses, 300, 3000) * env(len(tt), .1, .4) * .5
    return reverb(st(x, .3), 1.2, .3)


def steps_slow(sec=4.0):
    return footsteps(sec, 1.6, .28) * .8


def flash():
    out = whoosh(.5, up=True) * 1.4
    zap = band(noise(.4), 3000, 12000) * decay(int(.4 * SR), .08) * .3
    place(out, st(zap), .3)
    return out


def plane(sec=7.0):
    x = band(noise(sec, 'pink'), 120, 2500)
    tt = t(sec)
    x *= np.sin(np.pi * tt / sec) ** 1.5
    return st(x * .35, -.2)


def chime():
    out = np.zeros((int(3 * SR), 2), np.float32)
    for i, m in enumerate((79, 76, 72)):
        place(out, st(bell(m, 2.5) * .25), i * .45)
    return reverb(out, 2.0, .35)


def carstart():
    out = np.zeros((int(3.5 * SR), 2), np.float32)
    crank = engine(.9, 350, .9) * np.sin(2 * np.pi * 6 * t(.9))[:, None] ** 2
    place(out, crank * .9, 0)
    rev = engine(2.6, 1900, .9) * env(int(2.6 * SR), .2, 1.0)[:, None]
    place(out, rev, .85)
    return out


def cardoor():
    out = np.zeros((int(1.6 * SR), 2), np.float32)
    place(out, slam() * .7, 0)
    place(out, slam() * .5, .7)
    return out


def zip_():
    d = .7
    x = band(noise(d), 1500, 7000) * (np.sin(2 * np.pi * 60 * t(d)) > .3) * env(int(d * SR), .05, .1) * .25
    return st(x, .2)


def page():
    d = .45
    x = band(noise(d), 800, 6000) * np.sin(np.pi * t(d) / d) ** 3 * .35
    return st(x, -.2)


def keys():
    out = np.zeros((int(1.0 * SR), 2), np.float32)
    for _ in range(9):
        f = rng.uniform(3500, 7500); n = int(.15 * SR); tt = np.arange(n) / SR
        x = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 40)
        place(out, st(x.astype(np.float32) * .08, rng.uniform(-.3, .5)), rng.uniform(0, .6))
    return out


def skid():
    out = np.zeros((int(1.4 * SR), 2), np.float32)
    d = 1.0
    x = band(noise(d), 600, 4000) * np.sin(np.pi * t(d) / d) ** 2 * .35
    place(out, st(x, .3), 0)
    place(out, thump(.8), .9)
    return out


def temple_bell():
    return reverb(st(bell(69, 6.0) * .6, .1), 3.0, .4)


def firepop():
    out = np.zeros((int(1.0 * SR), 2), np.float32)
    for k in range(4):
        c = band(noise(.03), 1500, 9000) * decay(int(.03 * SR), .005) * rng.uniform(.4, 1)
        place(out, st(c, rng.uniform(-.4, .4)), k * .07 + rng.uniform(0, .05))
    return out


def ping():
    n = int(.5 * SR); tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 1760 * tt) * .6 + np.sin(2 * np.pi * 2637 * tt) * .3) * np.exp(-tt * 9)
    return st(x.astype(np.float32) * .25, .3)


def drone_buzz(sec=4.0):
    """A small quadcopter overhead: a tonal buzz with rotor beating, drifting across."""
    tt = t(sec)
    f = 210 + 12 * np.sin(2 * np.pi * .3 * tt)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sign(np.sin(ph)) * .3 + np.sin(2 * ph) * .2) * (1 + .3 * np.sin(2 * np.pi * 23 * tt))
    x = band(x.astype(np.float32), 150, 2600) * env(len(tt), .8, 1.2) * .18
    pan = np.linspace(-.6, .6, len(tt))
    return np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1).astype(np.float32)


def drone_fall():
    out = np.zeros((int(2.0 * SR), 2), np.float32)
    tt = t(.6)
    f = 210 * np.exp(-tt * 3)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 * np.linspace(1, 0, len(tt))
    place(out, st(band(x.astype(np.float32), 80, 2000) * .2, .5), 0)
    place(out, thump(.5) * .6, 1.3)
    return out


def typing(sec=3.0):
    out = np.zeros((int(sec * SR), 2), np.float32)
    k = 0.0
    while k < sec - .1:
        c = band(noise(.02), 2000, 8000) * decay(int(.02 * SR), .003) * rng.uniform(.06, .12)
        place(out, st(c, .25), k)
        k += rng.uniform(.06, .18)
    return out


def rockfall(sec=7.0):
    """A dry crack high up, then a slope of stones pouring down: rumble, bounces, the big ones close by."""
    out = np.zeros((int(sec * SR), 2), np.float32)
    n = int(.25 * SR)
    crack = band(noise(.25), 900, 6000) * decay(n, .02) * .7
    place(out, reverb(st(crack, -.2), 3.2, .6), 0)
    rn = int((sec - 1.2) * SR)
    rumble = band(noise(sec - 1.2, 'brown'), 30, 400) * env(rn, 1.2, 2.2) * .9
    place(out, st(rumble), 1.0)
    for _ in range(160):
        at = 1.0 + rng.uniform(0, sec - 2.2) ** 1.0
        g = rng.uniform(.15, .55)
        x = thump(g)[:int(.3 * SR)]
        tick = band(noise(.05), 1500, 6000) * decay(int(.05 * SR), .008) * rng.uniform(.05, .2)
        x[:len(tick)] += st(tick)
        place(out, x * np.array([1 - rng.uniform(0, .7), 1 - rng.uniform(0, .7)], np.float32), at)
    for at in (2.6, 3.9):   # the pressure-cooker rock, right beside you
        place(out, slam() * 1.1, at)
    return reverb(out, 2.4, .35) * .8


def whistle_cut():
    """A man whistling a pahadi tune by the stove, stopped by a hand on his shoulder before the fourth note."""
    out = []
    for m, b in SHEPHERD[:3]:
        n = int(b * 60 / 92 * SR); tt = np.arange(n) / SR
        f = hz(m + 12) * (1 + .01 * np.sin(2 * np.pi * 6 * tt))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + band(noise(n / SR), hz(m + 12) * .9, hz(m + 12) * 1.6) * .08
        out.append((x * env(n, .03, .06)).astype(np.float32))
    x = np.concatenate(out)
    x[-int(.04 * SR):] *= np.linspace(1, 0, int(.04 * SR))
    return reverb(st(x * .35, .35), 2.0, .3)


def hurka(sec, bpm=84, g=.3):
    """The jagariya's hurka: a small hourglass drum ticking under the fingers, a pressed tone that bends."""
    out = np.zeros(int(sec * SR), np.float32)
    beat = 60 / bpm
    k = 0
    while k * beat / 2 < sec - .5:
        n = int(.3 * SR); tt = np.arange(n) / SR
        f = (260 if k % 4 == 0 else 330) * (1 + .12 * np.exp(-tt * 20))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * (14 if k % 2 else 9))
        x += band(noise(.3), 900, 5000) * np.exp(-tt * 60) * .3
        place(out, (x * (1 if k % 4 == 0 else .6) * g).astype(np.float32), k * beat / 2 + rng.uniform(0, .012))
        k += 1
    return out


def thali(g=.12):
    """A big brass plate struck with a stick."""
    n = int(1.4 * SR); tt = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in ((610, 1, 3.5), (1490, .6, 5), (2710, .4, 7), (3930, .25, 9)))
    x += band(noise(1.4), 3000, 9000) * np.exp(-tt * 40) * .4
    return (x * g).astype(np.float32)


def cattle_bell(g=.1):
    """A big brass cattle bell swung once: hollow, clanky, low."""
    n = int(1.6 * SR); tt = np.arange(n) / SR
    f0 = rng.uniform(380, 620)
    x = sum(a * np.sin(2 * np.pi * f0 * r * tt) * np.exp(-tt * d) for r, a, d in ((1, 1, 3), (2.3, .7, 4.5), (3.9, .4, 6), (5.2, .25, 9)))
    x += band(noise(1.6), 1500, 6000) * np.exp(-tt * 50) * .5
    return (x * g).astype(np.float32)


def bark(g=.25):
    """A village dog barking twice, out in the fog."""
    out = np.zeros(int(.7 * SR), np.float32)
    for k in range(2):
        n = int(.16 * SR); tt = np.arange(n) / SR
        f = 520 * np.exp(-tt * 4) + 260
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = (np.sin(ph) + .5 * np.sin(2 * ph) + .3 * np.sin(3 * ph)) * env(n, .01, .08)
        x = x + band(noise(.16), 500, 3000) * env(n, .005, .06) * .6
        place(out, (np.tanh(x * 2) * g).astype(np.float32), k * .3)
    return out
