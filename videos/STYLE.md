# The Why Spaces: locked video style

Locked on 2026-11-07. The reference is `how-to-make-chai/how-to-make-chai.mp4` (v2).
Every new short follows `style-lock.json` without changes.

- **Look:** black and orange Why Spaces palette, grain and glow. Layout: header, step pill, title with one orange word, 2D line-art motion graphics, 3D word-by-word captions, bottom bar with waveform and timer, progress bar.
- **Voice:** Sarvam `bulbul:v3`, speaker **kabir**, `hi-IN`, **pace 1.0**, 48 kHz. The script is written in Devanagari and generated in **one call**. It is split only at sentence ends.
- **Mix:** voice in front. Music is soft and ducked. SFX sit about 15 dB below the voice, and the boiling/bubble sounds are barely audible.
- **Ending:** `assets/the-why-spaces-credit.mp4` (6.72 s) is appended to every video unchanged.

The template and pipeline are in `how-to-make-chai/src/` (`index.html`, `render.js`, `audio.py`).
For a new topic, change the scene content and the script. Keep everything else the same.
