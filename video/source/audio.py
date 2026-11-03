"""Builds the 20 s stereo soundtrack: dialogue, foley and forest ambience. NO music."""
import numpy as np, subprocess, json
SR = 48000; DUR = 20.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))
env = {"m": np.zeros(N), "f": np.zeros(N)}

def load(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(float)

def place(sig, t, gain=1.0, pan=0.0, who=None):
    i = int(t * SR); sig = sig[: max(0, N - i)] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i + len(sig), 0] += sig * l * 1.414; mix[i:i + len(sig), 1] += sig * r * 1.414
    if who: env[who][i:i + len(sig)] += np.abs(sig)

def lp(x, a):  # one-pole low-pass, a in (0,1)
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)

def bp(x, lo, hi):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, [lo, hi], "bandpass", fs=SR, output="sos"), x)

def adsr(n, a=0.005, d=0.1):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-np.maximum(t - a, 0) / d)

# ---------- ambience: leafy wind bed ----------
wind = bp(rng.standard_normal(N), 300, 4000)
mod = lp(rng.standard_normal(N), 0.00004); mod = 0.55 + 0.45 * (mod - mod.min()) / (np.ptp(mod) + 1e-9)
wind *= mod / np.abs(wind).max() * 0.05
wind2 = bp(rng.standard_normal(N), 300, 4000); wind2 *= mod[::-1] / np.abs(wind2).max() * 0.05
mix[:, 0] += wind; mix[:, 1] += wind2

def rustle(t, dur=0.5, g=0.12, pan=0.0):
    n = int(dur * SR); s = bp(rng.standard_normal(n), 1500, 7000)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2 * (0.5 + 0.5 * np.abs(lp(rng.standard_normal(n), 0.004)) * 8)
    place(s * e / np.abs(s * e).max(), t, g, pan)

for t in np.arange(0.4, 20, 2.3): rustle(t + rng.uniform(0, 1), rng.uniform(0.4, 0.9), 0.05, rng.uniform(-0.8, 0.8))

# ---------- birds ----------
def chirp(f0, f1, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (t / dur) ** 0.7 + 120 * np.sin(2 * np.pi * 38 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n)) ** 1.5

t = 0.3
while t < 19.5:
    pan = rng.uniform(-0.9, 0.9); base = rng.uniform(2600, 4200); kind = rng.integers(3)
    for k in range(rng.integers(2, 5)):
        if kind == 0: s = chirp(base, base * 1.5, 0.07)
        elif kind == 1: s = chirp(base * 1.4, base * 0.9, 0.11)
        else: s = chirp(base, base * 1.2, 0.05)
        place(s, t + k * rng.uniform(0.1, 0.16), rng.uniform(0.04, 0.08), pan)
    t += rng.uniform(1.0, 2.2)

# ---------- foley ----------
def thump(t, g=0.35, pan=0.0):
    n = int(0.18 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (70 + 40 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 22)
    s += 0.25 * bp(rng.standard_normal(n), 200, 1200) * np.exp(-tt * 40)
    place(s, t, g, pan)

def clack(t, g=0.35, pan=0.0):  # hollow woody knock of bamboo
    n = int(0.12 * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(720, 45), (1530, 60), (2650, 80)])
    s += 0.5 * bp(rng.standard_normal(n), 2000, 6000) * np.exp(-tt * 120)
    place(s / np.abs(s).max(), t, g, pan)

def snap(t, g=0.55, pan=0.0):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    s = bp(rng.standard_normal(n), 1200, 8000) * np.exp(-tt * 35)
    for k in range(6): s[int((0.004 + k * 0.011) * SR):][:400] += rng.uniform(0.5, 1) * np.exp(-np.arange(400) / 40) * rng.choice([-1, 1])
    s += 0.6 * np.sin(2 * np.pi * 900 * tt) * np.exp(-tt * 50)
    place(s / np.abs(s).max(), t, g, pan)

def crunch(t, dur=0.6, g=0.3, pan=0.0):
    k = t
    while k < t + dur:
        n = int(rng.uniform(0.025, 0.05) * SR); tt = np.arange(n) / SR
        s = bp(rng.standard_normal(n), 1500, 7500) * np.exp(-tt * 70)
        place(s / np.abs(s).max(), k, g * rng.uniform(0.6, 1), pan)
        k += rng.uniform(0.07, 0.14)

def whoosh(t, dur=0.35, g=0.25, pan=0.0):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n)
    for i, c in enumerate(np.linspace(600, 3500, 8)):
        seg = slice(i * n // 8, (i + 1) * n // 8); out[seg] = bp(x, c * 0.7, c * 1.3)[seg]
    place(out * np.sin(np.linspace(0, np.pi, n)) ** 2 / np.abs(out).max(), t, g, pan)

def squeak(t, g=0.22, pan=-0.3):
    n = int(0.2 * SR); tt = np.arange(n) / SR
    f = 900 + 1100 * (tt / tt[-1]) + 60 * np.sin(2 * np.pi * 30 * tt)
    place(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n)), t, g, pan)

V = "vo/t_{}.wav"
def vo(name, t, who, g=0.9):
    pan = -0.25 if who == "m" else 0.25
    place(load(V.format(name)), t, g, pan, who)

# Scene 1
for k, tt in enumerate([0.15, 0.45, 0.75]): thump(tt, 0.12, -0.3 if k % 2 else 0.3)
rustle(0.9, 0.4, 0.1, -0.2); clack(1.0, 0.3, -0.2); clack(1.4, 0.35, 0.2)
vo("m1", 1.3, "m"); vo("f1", 3.0, "f")
rustle(2.2, 0.5, 0.08); rustle(3.6, 0.5, 0.08); rustle(4.4, 0.4, 0.08)
# Scene 2
thump(5.0, 0.3, -0.3); thump(5.05, 0.3, 0.3); rustle(5.0, 0.4, 0.08)
vo("m2", 5.4, "m"); vo("f2", 7.0, "f")
thump(9.3, 0.18, -0.3); thump(9.45, 0.18, 0.3); vo("mg", 9.35, "m", 0.6); vo("fg", 9.55, "f", 0.6)
# Scene 3
thump(10.1, 0.25, -0.3); rustle(10.45, 0.4, 0.08, -0.3); clack(10.5, 0.2, -0.3)
crunch(11.05, 0.65, 0.22, -0.3)
thump(11.5, 0.18, 0.3); vo("f3", 11.7, "f")
whoosh(13.35, 0.35, 0.28); clack(13.62, 0.4, 0.3)
squeak(13.7); vo("ms", 13.75, "m", 0.5)
# Scene 4
thump(15.05, 0.25, 0.3)
snap(16.1, 0.5, 0.25); whoosh(16.45, 0.3, 0.15); clack(16.95, 0.25, -0.2)
vo("m3", 17.0, "m"); vo("f4", 18.5, "f")
vo("mh", 19.35, "m", 0.7); vo("fh", 19.42, "f", 0.7)
crunch(19.45, 0.5, 0.2, -0.2); crunch(19.5, 0.45, 0.2, 0.2)

mix /= np.abs(mix).max() / 0.89
fade = int(0.25 * SR); mix[:fade] *= np.linspace(0, 1, fade)[:, None]; mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
(mix.astype(np.float32)).tofile("mix.f32")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "mix.f32", "soundtrack.wav"], check=True)
# per-frame speech envelope (30 fps) used to drive the "talking" bob
fps = 30; out = {}
for k, e in env.items():
    fr = e[: N // (SR // fps) * (SR // fps)].reshape(-1, SR // fps).mean(1)
    out[k] = (fr / (fr.max() + 1e-9)).round(3).tolist()
json.dump(out, open("env.json", "w"))
print("audio ok")
