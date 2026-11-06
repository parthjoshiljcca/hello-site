# The Why Spaces — Intro reel

43 s, 1080×1920 @ 30 fps, Hinglish narration (Sarvam `bulbul:v3`, voice `kabir`), mastered to −14 LUFS.
Final file: `out/the-why-spaces-intro.mp4`.

## Rebuild
1. `python3 tts.py kabir`: narration per line from `lines.json`. The Sarvam key is injected by the session proxy, so no env var is needed.
2. `python3 timeline.py`: line start times → `timeline.json`
3. `node render.js preview 1.5,8.8,36.5`: still frames in `preview/`
4. `node render.js video out/video_noaudio.mp4`: renders frames from `index.html` (canvas, deterministic `render(t)`)
5. `python3 mix.py`: voice + generated ambient drone, whooshes, riser/impact → `out/mix_raw.wav`, then loudnorm and mux with ffmpeg (see commit message).
