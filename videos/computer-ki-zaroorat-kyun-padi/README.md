# Computer ki zaroorat kyun padi? (Hinglish explainer)

Final: `computer-ki-zaroorat-kyun-padi.mp4` (1080x1920, 30 fps, ~2:04 of content plus The Why Spaces credit, ~2:11 total)

Built in the locked style from `../STYLE.md` and `../style-lock.json`.
- 15 scenes of 2D motion graphics: the everyday computer, "Kyun?", entertainment busted, complex calculations, manual errors, the Pascaline (1642), Babbage's Difference and Analytical Engines (Mill, Store and Cards mapped to CPU, RAM and Program), WWII, ENIAC versus a smartphone, room to pocket, and Faster, Smarter, Accurate.
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, 48 kHz. There is one TTS call per scene (`src/groups.json`), and every scene was checked with `saarika:v2.5` STT.
- `src/script.json` holds `[Devanagari TTS text, roman caption]` pairs. The script's last two lines ("This is THE WHY SPACES. Because every WHY deserves a story.") are left to the credit scene, which already says them.

## Rebuild
Use any work directory `$W`.
1. `python3 src/tts.py $W` writes `g0..g14.wav`.
2. `python3 src/build.py $W` writes `data.json` and `voice.npy` (scene timing, word timing, events, waveform).
3. Copy `src/index.html` and `src/fonts/` into `$W`. Then `node src/render.js $W full $W/video.mp4`.
4. `python3 src/audio.py $W` writes `mix.wav`.
5. Mux the video with `mix.wav`, then concat with `../assets/the-why-spaces-credit.mp4`.

`src/index.html` is `head.html` + `scenes.js` + `</script></body></html>`.
