# Chor Kaun Hai? Case 01 (interactive Hinglish suspense)

Final: `chor-kaun-hai.mp4` (1080x1920, 30 fps, about 54 s of content plus The Why Spaces credit, about 61 s in total)

This is an interactive whodunit in the locked 2D style from `../STYLE.md`. The audience hears the case and picks **A / B / C** in the comments with a reason. The answer is held back for Part 2.

## Story (11 scenes)
1. **Hook:** "Ek chori. Teen suspects. Aur sirf ek jhooth." A magnifier sweeps over the three suspects.
2. Saturday night at Mehra Haveli, during a wedding party (string lights, music).
3. **10:00 PM:** the power goes out across the whole mohalla, and the haveli has **no power backup**.
4. **10:15 PM:** the lights come back, the tijori is open, and Dadi's diamond haar is gone.
5. The Inspector questions three suspects.
6. **A · Raju (cook):** "I was in the kitchen, heating food by candlelight."
7. **B · Pinky (cousin):** "I was on the terrace, talking to a friend with my phone's torch on."
8. **C · Vicky (driver):** "I was sleeping in my room with the AC on."
9. One of them is lying, and the clue is in the story (10:00–10:15 clock, alibi recap).
10. "Chor kaun hai?" A/B/C option cards with a suspense highlight sweep.
11. A comment box with "Chor hai ___ kyunki..." and the line "Sahi jawaab agle video mein."

## Answer (for Part 2 / pinned comment, do not reveal in Part 1)
**C: Vicky.** There was no electricity for 15 minutes and no power backup, so an AC could not have been running. Raju's candle and gas stove and Pinky's phone torch all work without mains power.

## Production
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, with one call per scene (`src/groups.json`). Every scene was checked with `saarika:v2.5` STT. "generator" was mispronounced, so that line uses "power backup".
- Mix: the voice is in front and the SFX sit about 15 dB below it. The music keeps the locked 112 bpm structure but uses a minor progression (Am–F–Dm–E) for suspense. Heartbeats play on "jhooth", "socho" and "chor kaun"; the clock ticks under the clue; there is a power-down on the blackout, a creak on the tijori and a thud on "ghayab".
- `src/scenes.js` is built from `parts/base.part` (background), `parts/mystery.part` (titles, highlights, mystery primitives and scenes), `parts/prims.part` (shared primitives) and `parts/dom.part` (shared DOM/render).

## Rebuild
Use any work directory `$W`.
1. `python3 src/tts.py $W`
2. `python3 src/build.py $W`
3. Copy `src/index.html` and `src/fonts/` into `$W`, then run `node src/render.js $W full $W/video.mp4`.
4. `python3 src/audio.py $W`
5. Mux the video with `mix.wav`, then concat with `../assets/the-why-spaces-credit.mp4`.
