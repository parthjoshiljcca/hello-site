# Generates the scene-transition "whoosh" (sfx/whoosh.wav): pink-ish noise through a
# low-pass filter whose cutoff sweeps up and back down, panned left to right.
#
#   python3 sfx.py
import os
import wave

import numpy as np

SR = 48000
DUR = 0.8
n = int(SR * DUR)
t = np.linspace(0, 1, n)
rng = np.random.default_rng(7)

noise = np.cumsum(rng.standard_normal(n)) * 0.02 + rng.standard_normal(n) * 0.5  # tilt towards low end
peak = 0.45
shape = np.where(t < peak, t / peak, (1 - t) / (1 - peak))  # 0 -> 1 -> 0
cutoff = 250 + 5500 * shape ** 1.6
alpha = 1 - np.exp(-2 * np.pi * cutoff / SR)
out = np.empty(n)
y = 0.0
for i in range(n):
    y += alpha[i] * (noise[i] - y)
    out[i] = y
out *= np.sin(np.pi * np.clip(t, 0, 1)) ** 2  # smooth envelope
out -= out.mean()
out /= np.abs(out).max()
pan = 0.15 + 0.7 * t
stereo = np.stack([out * np.sqrt(1 - pan), out * np.sqrt(pan)], axis=1) * 0.9

os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx"), exist_ok=True)
with wave.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx", "whoosh.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
