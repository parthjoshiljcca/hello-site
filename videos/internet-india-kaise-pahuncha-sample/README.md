# Internet India tak kaise pahuncha? (10-second sample)

Final: `internet-india-kaise-pahuncha-sample.mp4` (1080x1920, 30 fps, 11.5 s of content plus The Why Spaces credit, 18.2 s total)

This sample tests the new skills (3D with three.js and animation with GSAP) inside the locked Why Spaces style (`../STYLE.md`). Header, pill, title, 3D captions, bottom bar, grain, narration and mix are unchanged.
- **Scene 1, 3D globe (three.js):** a dotted Earth from Natural Earth data via `world-atlas`, with India's dots in orange. It rotates from Europe to India. A satellite appears and is crossed out ("hawa se nahi"). Then two undersea cables draw along real routes: Europe → Suez → Red Sea → Mumbai, and Singapore → Bay of Bengal → Chennai. Mumbai and Chennai get pins.
- **Scene 2, dive and cross-section (GSAP):** the camera dives into Mumbai. A cable cross-section then draws itself with DrawSVG: plastic sheath, steel wires, copper, and glass fibres. ScrambleText shows "1000s OF KM" and "0 1 1 0 1 → LIGHT". Light pulses race through a fibre.
- One paused GSAP timeline drives the globe camera (as plain values) and the SVG. `render(t)` seeks it every frame, so every frame is deterministic.
- Narration: Sarvam `bulbul:v3`, speaker kabir, pace 1.2. It was checked with `saarika:v2.5` STT.

## Rebuild
Same steps as the other videos (`tts.py`, `build.py`, `render.js`, `audio.py`, then mux and concat the credit).
In step 3, also copy `src/vendor/` into `$W`. `index.html` is `head.html` + `scenes.js` + `</script></body></html>`.
`vendor/` holds three.js r169 (an IIFE bundle), GSAP 3.13 with DrawSVG and ScrambleText (free since 3.13), and `land.js` (land dots generated from world-atlas 110m).
