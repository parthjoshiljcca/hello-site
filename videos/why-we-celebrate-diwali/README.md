# Hum Diwali kyun manate hain? (The Why Spaces, Diwali)

Final: `why-we-celebrate-diwali.mp4` (1080x1920, 30 fps). It has about 95 s of content, then The Why Spaces credit, for about 101 s total.

The video is built in the locked Why Spaces style from `../STYLE.md` and `../style-lock.json`: header, step pill, a title with one orange word, 3D word-by-word captions, the bottom bar with waveform, the progress bar and the credit clip. It uses the same template as `../chor-kaun-hai-part-2`, plus a three.js 3D layer. The story is told in the voice of the book *Ramayana Reimagined: The Eternal Legacy* by Parth D. Joshi: Dadaji and Parth under the banyan tree, then "Life Lessons and Morals".

## Scenes (14)
0. **Diwali Kyun?** Hook with DIYE / MITHAI / PATAKHE badges, then WHY?, over a **3D diya** with orbiting diyas.
1. **Parth Ka Sawaal.** Line-art banyan tree, a swing, Dadaji and Parth, and the RAMAYAN book.
2. **14 Saal Vanvas.** A forest draws on, a counter runs from 1 to 14, and footprints appear.
3. **Lanka Par Chadhai.** Lanka fort, Sita maa, Ram Setu stones and the vanar sena marching.
4. **Sach Ki Jeet.** **3D** ten-headed Ravan, hit by a golden arrow that shatters him.
5. **Ayodhya Wapsi.** **3D** Pushpak Vimaan in flight.
6. **Kartik Amavasya.** Moon-phase strip from poornima to amavasya; no moon.
7. **Laakhon Diye.** **3D** Ayodhya lights up in a wave along Ram's path.
8. **Deep + Aavali.** Diya + qataar = DEEPAVALI.
9. **Maa Lakshmi.** **3D** lotus opens while gold coins fall.
10. **Teen Seekh.** The book's three life lessons, as cards.
11. **Andhakaar Se Prakaash.** *Tamaso maa jyotirgamaya*, with a sunrise.
12. **Ramayana Reimagined.** **3D** book with the real cover, and Notion Press / Amazon.in / Flipkart badges.
13. **Shubh Deepavali!** Diyas and fireworks.

## Production
- Narration: Sarvam `bulbul:v3`, speaker **kabir**, `hi-IN`, pace 1.2, 48 kHz, with one call per scene (`src/groups.json`). Every scene was checked with `saarika:v2.5`.
- `src/scenes.js` is built from `parts/base.part`, `parts/diwali.part` (titles, 2D primitives and scenes), `parts/mprims.part`, `parts/prims.part`, `parts/d3.part` and `parts/dom.part`. `d3.part` is the three.js r149 layer, masked to the illustration band. The `dom.part` render calls `R3D()` after the 2D scene.
- `src/vendor/cover.js` holds the book cover as a data URI, so WebGL can use it from `file://`.
- Mix: the voice is in front, over a warm major 112 bpm bed ducked under the voice. SFX sit far below the voice.

## Rebuild
Use any work directory `$W`.
1. `python3 src/tts.py $W`
2. `python3 src/build.py $W`
3. Copy `src/index.html`, `src/fonts/` and `src/vendor/` into `$W`, then run `node src/render.js $W full $W/video.mp4`.
4. `python3 src/audio.py $W`
5. Mux the video with `mix.wav`, then concat with `../assets/the-why-spaces-credit.mp4`.
