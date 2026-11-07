# Chor Kaun Hai? Case 01, Part 2: the reveal + the WHY

Final: `chor-kaun-hai-part-2.mp4` (1080x1920, 30 fps, about 61 s of content plus The Why Spaces credit)

This answers `../chor-kaun-hai` (Part 1) in the locked 2D Why Spaces style, with Kabir's voice and the same mystery look.

## Scenes (11)
1. **"Chor Kaun Hai, case one ka jawaab."** Three suspects with question marks and a case file stamped JAWAAB.
2. **Raju is cleared.** The rumaal was a TRAP; Raju had brought Dadi her khaana in that room in the evening.
3. **Vicky is cleared.** On Diwali night, patakhe were going off everywhere.
4. **Reveal: Pinky is the chor.** She is shown under a spotlight with a CHOR! stamp. Her claim was "chaand ki roshni".
5. **Diwali = no moon.** Diyas sit under a starry sky, and the moon is shown as a dashed outline with a cross.
6. **WHY?** Diwali is always on **Kartik amavasya**. A moon-phase strip runs from poornima to amavasya.
7. **The science.** On amavasya the moon sits between the Earth and the Sun. Sunlight falls on its far side, and the side facing us stays dark (new moon).
8. **No moon and no bijli: "Impossible!"**
9. **Bonus why.** We light diyas on Diwali to brighten the dark amavasya night.
10. **Case solved.** Pinky's jhooth is caught and Dadi's haar comes back.
11. **Ending.** "Aapka jawaab sahi tha? Comments mein batao. Agla case jald aa raha hai."

## Production
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, with one call per scene. Every scene was checked with `saarika:v2.5`, and scene 9 was regenerated once. The trailing audio was checked with local faster-whisper, and none of the takes has junk at the end.
- While Sarvam was out of credits, some scenes were drafted with ElevenLabs ("Viraj"). Those takes were not used; the final uses Kabir only.
- Mix: the voice is in front, with the same 112 bpm minor bed as Part 1. SFX include a reveal thud, heartbeats, crackers, a riser on "amavasya" and a shimmer on the diyas.
- Encode: crf 23 / maxrate 6M, to stay near GitHub's 50 MB recommendation.
- `src/scenes.js` is built from `parts/base.part`, `parts/p2.part` (Part 2 titles, primitives and scenes), `parts/mprims.part` (mystery primitives from Part 1), `parts/prims.part` and `parts/dom.part`.

## Rebuild
Use any work directory `$W`.
1. `python3 src/tts.py $W`
2. `python3 src/build.py $W`
3. Copy `src/index.html` and `src/fonts/` into `$W`, then run `node src/render.js $W full $W/video.mp4`.
4. `python3 src/audio.py $W`
5. Mux the video with `mix.wav`, then concat with `../assets/the-why-spaces-credit.mp4`.
