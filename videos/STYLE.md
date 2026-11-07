# The Why Spaces: locked video style

Locked on 2026-11-07, rev 2. The reference is `qr-code-kaise-kaam-karta-hai/qr-code-kaise-kaam-karta-hai.mp4`.
Every new short follows `style-lock.json` without changes.

- **Look:** black and orange Why Spaces palette, grain and glow. Layout: header, step pill, title with one orange word, 2D line-art motion graphics, 3D word-by-word captions, bottom bar with waveform (no timer), and a progress bar as the only time indicator.
- **Voice:** Sarvam `bulbul:v3`, speaker **kabir**, `hi-IN`, **pace 1.2**, 48 kHz. Hindi words are written in Devanagari and English words in Latin script. Each scene is generated in **one call**. There is no extra padding: only ~0.4 s between scenes, so it stays fast and thrilling.
- **Mix:** voice in front. Music is energetic (112 bpm) but ducked. SFX sit about 15 dB below the voice, and the boiling/bubble sounds are barely audible.
- **Ending:** `assets/the-why-spaces-credit.mp4` (6.7 s): "This is…", then the logo, with Kabir saying "This is The Why Spaces. Because every why deserves a story." It is appended to every video unchanged.

The template and pipeline are in `how-to-make-chai/src/` (`index.html`, `render.js`, `audio.py`).
For a new topic, change the scene content and the script. Keep everything else the same.
