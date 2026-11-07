# How to make Chai — 30s short (Hinglish)

Final: `how-to-make-chai.mp4` (1080x1920, 30 fps, ~30s content + The Why Spaces credit scene ≈ 36.7s)

- Style: The Why Spaces palette (black + orange, grain, glow), layout inspired by the "Hacker se API kaise bachaye" reference (pill, title with highlighted word, illustration, bottom bar with waveform + timer, progress bar)
- 2D motion graphics drawn on canvas (`src/index.html`), 3D extruded word-by-word captions
- Narration: Sarvam AI `bulbul:v3`, speaker `kabir`, hi-IN (lines in `src/lines.json`)
- SFX + lo-fi background music synthesized in `src/audio.py` (ducked under voice)
- Credit scene: `../assets/the-why-spaces-credit.mp4` (cut from the intro, "Welcome to… Because every WHY deserves a story") — appended to every video

## Rebuild
1. TTS each line of `lines.json` with Sarvam (kabir), trim silence → `t_n{i}.wav`
2. Build `timeline.json` / `data.json` (scene times, word timings, waveform)
3. `node render.js <dir> full` → `video.mp4` (Playwright frame capture)
4. `python3 audio.py` → `mix.wav`
5. ffmpeg concat `video.mp4 + mix.wav` with the credit clip
