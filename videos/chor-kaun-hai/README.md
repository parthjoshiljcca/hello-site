# Chor Kaun Hai? Case 01 (interactive Hinglish suspense)

Final: `chor-kaun-hai.mp4` (1080x1920, 30 fps, about 62 s of content plus The Why Spaces credit)

This is an interactive whodunit in the locked 2D style from `../STYLE.md`. The audience hears the case and picks **A / B / C** in the comments with a reason. The answer is held back for Part 2.

## Story (12 scenes)
1. **Hook:** "Ek chori. Teen suspects. Aur sirf ek jhooth."
2. **Diwali ki raat**, a big party at Mehra Haveli. There are diyas and fireworks, and deliberately **no moon** in the sky.
3. **10:00 PM:** the power goes out across the whole mohalla, and the haveli has no power backup.
4. **10:15 PM:** the lights come back, the tijori is open, and Dadi's diamond haar is gone.
5. The Inspector questions three suspects.
6. **A · Raju (cook):** "I was heating milk in the kitchen by candlelight."
7. **B · Pinky (cousin):** "I was on the terrace, talking to a friend on the phone **in the moonlight**."
8. **C · Vicky (driver):** "I was standing outside at the gate, watching the patakhe."
9. **Red herring:** Raju's rumaal is found near the tijori.
10. "One of them is lying, and the clue is right at the start." The on-screen hint reads "SHURUAAT YAAD KARO".
11. "Chor kaun hai?" A/B/C option cards.
12. A comment box with "Chor hai ___ kyunki..." and the line "Sahi jawaab agle video mein."

## Answer (for Part 2 / pinned comment, do not reveal in Part 1)
**B: Pinky.** Diwali is always on **amavasya** (new moon), so there was no moonlight that night. With the whole mohalla in a blackout, her "chaand ki roshni" alibi is impossible.
- Raju's candle and Vicky's patakhe are both consistent with a blackout on Diwali.
- Raju's rumaal is a red herring: he had served Dadi's dinner in that room earlier in the evening.

## Production
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, with one call per scene (`src/groups.json`). Scenes were checked with `saarika:v2.5`.
- The Sarvam credits ran out mid-way. Scene 8 (Vicky) had about 4.6 s of junk audio after the sentence. Its end was located with local faster-whisper and it was trimmed at 4.04 s.
- Mix: the voice is in front. The music keeps the locked 112 bpm structure but uses a minor progression (Am–F–Dm–E). SFX include heartbeats, ticks, a power-down, a creak, thuds and crackers.
- Encode: crf 23 / maxrate 6M (instead of 21 / 9M) to keep the file under GitHub's 50 MB recommendation.
- `src/scenes.js` is built from `parts/base.part`, `parts/mystery.part`, `parts/prims.part` and `parts/dom.part`.

## Rebuild
Use any work directory `$W`.
1. `python3 src/tts.py $W`
2. `python3 src/build.py $W`
3. Copy `src/index.html` and `src/fonts/` into `$W`, then run `node src/render.js $W full $W/video.mp4`.
4. `python3 src/audio.py $W`
5. Mux the video with `mix.wav`, then concat with `../assets/the-why-spaces-credit.mp4`.
