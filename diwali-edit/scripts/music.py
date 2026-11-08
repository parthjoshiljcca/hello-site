"""Synthesize a festive 120 BPM Diwali beat track (dhol + plucked strings + drone)."""
import numpy as np, wave, sys

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
TOTAL = 37.0
N = int(TOTAL * SR)
rng = np.random.default_rng(7)

L = np.zeros(N); R = np.zeros(N)
rev_send = np.zeros(N)

def t_arr(d): return np.arange(int(d * SR)) / SR

def add(sig, at, gain=1.0, pan=0.0, rev=0.0):
    i = int(at * SR)
    if i >= N: return
    s = sig[: N - i] * gain
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(s)] += s * l * 1.414
    R[i:i + len(s)] += s * r * 1.414
    rev_send[i:i + len(s)] += s * rev

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y

def lp_fft(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))

def bp_fft(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / np.sqrt(1 + (f / hi) ** 4))
    return np.fft.irfft(X, len(x))

def hz(n):  # midi -> hz
    return 440 * 2 ** ((n - 69) / 12)

# ---------- instruments ----------
def kick():
    t = t_arr(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7)
    s += 0.4 * np.exp(-t * 300) * rng.standard_normal(len(t)) * 0.3
    return np.tanh(s * 1.6)

def dagga():  # dhol bass side
    t = t_arr(0.5)
    f = 78 + 40 * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6)
    s += 0.5 * np.sin(2 * np.pi * np.cumsum(f * 2.3) / SR) * np.exp(-t * 14)
    s += 0.25 * bp_fft(rng.standard_normal(len(t)), 150, 900) * np.exp(-t * 40)
    return np.tanh(s * 1.3)

def tilli():  # dhol stick slap
    t = t_arr(0.18)
    n = bp_fft(rng.standard_normal(len(t)), 1500, 7000) * np.exp(-t * 45)
    tone = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 35) * 0.6
    return (n * 0.9 + tone)

def clap():
    t = t_arr(0.3)
    env = np.exp(-t * 25)
    for d in (0.0, 0.011, 0.022):
        env += np.where(t >= d, np.exp(-(t - d) * 180), 0) * 0.8
    return bp_fft(rng.standard_normal(len(t)), 900, 6000) * env * 0.7

def shaker():
    t = t_arr(0.07)
    env = np.sin(np.pi * np.minimum(t / 0.07, 1)) ** 2
    return bp_fft(rng.standard_normal(len(t)), 5000, 14000) * env

def ks_pluck(freq, dur=1.6, bright=0.5):
    """Karplus-Strong with a sitar-ish jawari buzz."""
    n = int(dur * SR); p = int(SR / freq)
    buf = rng.uniform(-1, 1, p)
    buf = lp_fft(np.concatenate([buf, buf]), 2000 + 6000 * bright)[:p]
    out = np.zeros(n)
    for i in range(n):
        v = buf[i % p]
        out[i] = v
        buf[i % p] = 0.996 * 0.5 * (v + buf[(i + 1) % p])
    t = np.arange(n) / SR
    buzz = np.tanh(out * 3) * 0.35 * np.exp(-t * 2)
    s = out + buzz
    return s * np.exp(-t * 1.2) / (np.max(np.abs(s)) + 1e-9)

def bell(freq, dur=2.5):
    t = t_arr(dur)
    s = np.zeros_like(t)
    for ratio, amp, dec in ((1, 1, 2.2), (2.76, 0.5, 3.5), (5.4, 0.25, 6), (8.93, 0.12, 9)):
        s += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t * dec)
    return s * (1 - np.exp(-t * 800)) * 0.5

def bass(freq, dur):
    t = t_arr(dur)
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    env = (1 - np.exp(-t * 300)) * np.exp(-t * 3.5)
    return np.tanh(s * env * 1.5)

def pad(freqs, dur, cutoff=1200):
    t = t_arr(dur)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0, 0.12):
            ff = f * 2 ** (det / 12)
            ph = rng.uniform(0, 1)
            s += 2 * ((ff * t + ph) % 1) - 1   # saw
    s = lp_fft(s, cutoff) / (len(freqs) * 3)
    return s

def riser(dur):
    t = t_arr(dur)
    x = t / dur
    noise = rng.standard_normal(len(t))
    # sweep noise brightness by mixing progressively high-passed bands
    lo = bp_fft(noise, 200, 1500); hi = bp_fft(noise, 2000, 12000)
    s = (lo * (1 - x) + hi * x) * x ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1400 * x ** 2) / SR) * x ** 3 * 0.25
    return s * 0.8 + tone

def impact():
    t = t_arr(3.0)
    boom = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t * 1.6)
    crash = bp_fft(rng.standard_normal(len(t)), 3000, 16000) * np.exp(-t * 2.2) * 0.35
    return np.tanh(boom * 1.4) + crash

def crackle(dur, density=60):
    n = int(dur * SR); s = np.zeros(n)
    k = rng.poisson(density * dur)
    for _ in range(k):
        i = rng.integers(0, n - 400)
        c = rng.standard_normal(200) * np.exp(-np.arange(200) / 25) * rng.uniform(0.2, 1)
        s[i:i + 200] += c
    return bp_fft(s, 2500, 15000)

# ---------- arrangement ----------
D = 62  # D4
scale = [0, 2, 4, 7, 9, 12, 14, 16, 19]  # D major pentatonic offsets
chords = [  # per bar: root midi, triad
    (50, [62, 66, 69]),  # D
    (48, [60, 64, 67]),  # C
    (43, [59, 62, 67]),  # G
    (50, [62, 66, 69]),  # D
]

# drone (tanpura-ish): D + A, whole piece, swelling at intro/outro
t = t_arr(TOTAL)
drone = pad([hz(38), hz(45), hz(50)], TOTAL, cutoff=700)
dr_env = 0.55 + 0.45 * np.clip(1 - np.abs(t - 0) / 8, 0, 1) + 0.6 * np.clip((t - 31) / 2, 0, 1) * np.clip((36.5 - t) / 2, 0, 1)
dr_env *= np.clip(t / 1.5, 0, 1) * np.clip((TOTAL - t) / 1.0, 0, 1)
add(drone * dr_env, 0, 0.35, 0, 0.3)

# intro: bells arpeggio + plucks (bars 1-2)
for i, st in enumerate([0, 4, 7, 9, 12, 9, 7, 4]):
    add(bell(hz(D + 12 + st)), 0.25 + i * BEAT, 0.22, pan=np.sin(i), rev=0.6)
for i, st in enumerate([0, 7, 12, 7]):
    add(ks_pluck(hz(D + st), 2.0, 0.4), 0.0 + i * 2 * BEAT * 0.5 + 2.0 * (i > 1), 0.3, -0.3, 0.5)

def drums_bar(b0, full=True, dhol=True):
    for k in range(4):
        tb = b0 + k * BEAT
        if full: add(kick(), tb, 0.9)
        if full and k in (1, 3): add(clap(), tb, 0.55, 0.1, 0.25)
    for s in range(16):
        ts = b0 + s * BEAT / 4 + (0.018 if s % 2 else 0)  # swing
        add(shaker(), ts, 0.16 if s % 4 else 0.24, pan=0.5 * (1 if s % 2 else -1))
    if dhol:
        for s in (0, 3, 6, 8, 11, 14):
            add(dagga(), b0 + s * BEAT / 4, 0.55, -0.15, 0.1)
        for s in (2, 4, 7, 10, 12, 15):
            add(tilli(), b0 + s * BEAT / 4 + (0.018 if s % 2 else 0), 0.35, 0.25, 0.1)

def bass_bar(b0, root):
    for s in (0, 3, 6, 8, 10, 14):
        add(bass(hz(root), 0.35), b0 + s * BEAT / 4, 0.42)

hook = [  # (16th step, scale idx, len)
    (0, 5, 2), (2, 4, 2), (4, 3, 2), (6, 4, 4), (10, 3, 2), (12, 2, 2), (14, 3, 2),
]
hook2 = [(0, 6, 2), (2, 5, 2), (4, 4, 2), (6, 5, 3), (9, 4, 1), (10, 3, 2), (12, 4, 4)]

# build: bars 3-4 (4s-8s)
for b in range(2):
    b0 = 2 * BAR + b * BAR
    drums_bar(b0, full=False, dhol=(b == 1))
    for s in range(0, 16, 2):
        add(ks_pluck(hz(D + scale[(s // 2) % 5]), 0.8, 0.6), b0 + s * BEAT / 4, 0.18, 0.3, 0.3)
# snare roll into drop
for i in range(16):
    tt = 6.0 + i * 0.125 if i < 8 else 7.0 + (i - 8) * 0.0625
    add(clap(), tt, 0.15 + 0.35 * i / 15, 0, 0.2)
add(riser(2.0), 6.0, 0.5, 0, 0.4)
add(riser(2.0), 22.0, 0.5, 0, 0.4)

# drops: bars 5-12 (8s-24s) and 13-16 (24s-32s)
for b in range(4, 16):
    b0 = b * BAR
    root, tri = chords[b % 4]
    drums_bar(b0, full=True, dhol=True)
    bass_bar(b0, root)
    add(pad([hz(n) for n in tri], BAR, cutoff=1800 if b >= 12 else 1300), b0, 0.13, 0, 0.3)
    melody = hook if b % 2 == 0 else hook2
    for st, si, ln in melody:
        add(ks_pluck(hz(D + scale[si]), 0.25 * ln + 0.6, 0.7), b0 + st * BEAT / 4, 0.32, -0.2, 0.35)
    if b >= 12:  # finale: octave doubling + bells sparkle
        for st, si, ln in melody:
            add(bell(hz(D + 12 + scale[si])), b0 + st * BEAT / 4, 0.08, 0.4, 0.6)

add(impact(), 8.0, 0.75, 0, 0.5)
add(impact(), 16.0, 0.35, 0, 0.5)
add(impact(), 24.0, 0.85, 0, 0.6)
add(crackle(12.0, 70), 24.0, 0.12, 0.6, 0.2)
add(crackle(12.0, 70), 24.2, 0.12, -0.6, 0.2)

# break the last beat before second drop (silence-gap feel): duck everything 23.5-24
gap = (np.arange(N) / SR >= 23.5) & (np.arange(N) / SR < 24.0)

# ending: final hit at 32 + chord bloom
add(impact(), 32.0, 0.8, 0, 0.7)
add(pad([hz(n) for n in [50, 57, 62, 66, 69, 74]], 5.0, cutoff=2200) * np.exp(-t_arr(5.0) * 0.7), 32.0, 0.35, 0, 0.6)
for i, st in enumerate([12, 9, 7, 4, 0]):
    add(bell(hz(D + 12 + st), 3.5), 32.0 + i * 0.18, 0.2, np.cos(i), 0.8)
add(ks_pluck(hz(D - 12), 4.0, 0.5), 32.0, 0.5, 0, 0.5)

# ---------- reverb (FFT convolution with decaying-noise IR) ----------
irt = t_arr(2.6)
ir = rng.standard_normal(len(irt)) * np.exp(-irt * 2.6)
ir = lp_fft(ir, 6000)
ir /= np.sqrt(np.sum(ir ** 2))
nfft = 1 << int(np.ceil(np.log2(N + len(ir))))
wet = np.fft.irfft(np.fft.rfft(rev_send, nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
ir2 = np.roll(ir, 331)
wet2 = np.fft.irfft(np.fft.rfft(rev_send, nfft) * np.fft.rfft(ir2, nfft), nfft)[:N]
L += wet * 0.5; R += wet2 * 0.5

L[gap] *= 0.15; R[gap] *= 0.15

# master: soft-clip + fade
mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.8) / np.tanh(1.8)
tt = np.arange(N) / SR
fade = np.clip((TOTAL - tt) / 1.2, 0, 1)
mix *= fade[:, None] * 0.89

pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", TOTAL)
