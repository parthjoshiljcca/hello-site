# Small synth + sound-design kit shared by the reel scores: a stereo Mix with a reverb
# send, and instruments (drums, bass, pads, plucks, bells, notification dings, booms,
# risers, whooshes, confetti pops) plus a tape-stop effect.
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter

SR = 48000
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(sec):
    return np.arange(int(SR * sec)) / SR


def lp(x, f):
    a = 1 - np.exp(-2 * np.pi * f / SR)
    return lfilter([a], [1, a - 1], x)


def hp(x, f):
    return x - lp(x, f)


def sweep_lp(x, f0, f1):
    out, y = np.empty_like(x), 0.0
    for i in range(0, len(x), 256):
        f = f0 * (f1 / f0) ** (i / len(x))
        a = 1 - np.exp(-2 * np.pi * f / SR)
        seg, _ = lfilter([a], [1, a - 1], x[i:i + 256], zi=[y * (1 - a)])
        out[i:i + 256], y = seg, seg[-1]
    return out


def saw(f, t, kmax=20):
    k = np.arange(1, max(2, min(kmax, int(9000 / f))) + 1)[:, None]
    return (np.sin(2 * np.pi * f * k * t) / k).sum(0) * (2 / np.pi)


class Mix:
    def __init__(self, dur):
        self.dur, self.n = dur, int(SR * (dur + 3))
        self.dry, self.wet = np.zeros((self.n, 2)), np.zeros((self.n, 2))

    def place(self, sig, at, gain=1.0, pan=0.5, send=0.0):
        i = int(at * SR)
        if i >= self.n or at < 0:
            return
        sig = sig[: self.n - i] * gain
        st = np.stack([sig * np.sqrt(1 - pan), sig * np.sqrt(pan)], 1)
        self.dry[i:i + len(sig)] += st
        self.wet[i:i + len(sig)] += st * send

    def master(self, rev_amount=0.2, fade_out=0.8):
        ir_t = tt(2.2)
        ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3) for _ in range(2)], 1)
        rev = np.stack([fftconvolve(self.wet[:, c], ir[:, c])[: self.n] for c in range(2)], 1)
        mix = self.dry + rev * (np.abs(self.dry).max() / (np.abs(rev).max() + 1e-9)) * rev_amount
        mix = mix[: int(SR * self.dur)]
        t = np.arange(len(mix)) / SR
        mix *= np.minimum(1, (self.dur - t) / fade_out)[:, None]
        return mix

    @staticmethod
    def tape_stop(mix, start, length):
        """Slow the audio from `start` to a halt over `length` seconds (vinyl/tape stop)."""
        i0, n = int(start * SR), int(length * SR)
        rate = np.linspace(1, 0, n) ** 1.5
        pos = i0 + np.cumsum(rate)
        for c in range(2):
            mix[i0:i0 + n, c] = np.interp(pos, np.arange(len(mix)), mix[:, c]) * np.linspace(1, .2, n)
        return mix

    @staticmethod
    def write(mix, path):
        mix = np.tanh(mix / np.abs(mix).max() * 1.5) / np.tanh(1.5) * .89
        with wave.open(path, "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((mix * 32767).astype("<i2").tobytes())


def kick():
    t = tt(.45)
    return np.sin(2 * np.pi * (45 + 120 * np.exp(-t * 28)) * t) * np.exp(-t * 8)


def clap():
    t = tt(.25)
    env = sum(np.exp(-np.maximum(0, t - o) * 60) * (t >= o) for o in (0, .012, .024))
    return hp(rng.standard_normal(len(t)), 1200) * env * .5


def hat():
    t = tt(.05)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * 80)


def boom(size=1.0):
    t = tt(2.5)
    sub = np.sin(2 * np.pi * np.cumsum(32 + 110 * np.exp(-t * 2.5)) / SR) * np.exp(-t * 1.5)
    return (sub + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 5) * .7 + hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 1.8) * .25) * size


def pop():
    t = tt(.4)
    return hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 25) + .4 * np.sin(2 * np.pi * 900 * t * (1 - t)) * np.exp(-t * 18)


def riser(length):
    t = tt(length)
    return sweep_lp(rng.standard_normal(len(t)), 200, 9000) * (t / length) ** 2.2 * .7


def whoosh():
    t = tt(.6)
    return sweep_lp(rng.standard_normal(len(t)), 400, 6000) * np.sin(np.pi * t / .6) ** 2


def pad(chord, length, bright=2400):
    t = tt(length + 1.2)
    sig = sum(saw(hz(m) * (1 + d), t, 10) for m in chord for d in (-.004, .004)) / (2 * len(chord))
    return lp(lp(sig, bright), bright) * np.minimum(1, t / .3) * np.where(t < length, 1, np.exp(-(t - length) * 3))


def pluck(m):
    t = tt(.3)
    return lp(saw(hz(m), t, 14), 4000) * np.exp(-t * 14)


def bass(m, length):
    t = tt(length)
    return lp(saw(hz(m), t, 24), 450) * np.exp(-t * 3)


def bell(m):
    t = tt(1.5)
    return (np.sin(2 * np.pi * hz(m) * t) + .4 * np.sin(2 * np.pi * hz(m) * 2.76 * t) * np.exp(-t * 4)) * np.exp(-t * 2.5)


def ding(hi=False):
    """Two-note phone notification."""
    out = np.zeros(int(SR * .5))
    for k, m in enumerate([88, 93] if hi else [84, 88]):
        t = tt(.4)
        s = (np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(4 * np.pi * hz(m) * t)) * np.exp(-t * 9)
        i = int(k * .09 * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out


def thud():
    t = tt(.35)
    return np.sin(2 * np.pi * (60 + 80 * np.exp(-t * 30)) * t) * np.exp(-t * 12)
