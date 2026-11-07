# Chai ki shuruat kaise hui aur kyun? (Hinglish explainer)

Final: `chai-ki-shuruat-kaise-hui.mp4` (1080x1920, 30 fps, about 87 s of content plus The Why Spaces credit, about 94 s total)

Built in the locked 2D style from `../STYLE.md` and `../style-lock.json`.
- 13 scenes:
  - every day crores of cups
  - a hundred years ago most Indians didn't drink chai daily
  - the China legend (Shen Nong)
  - England goes crazy for tea
  - China sold tea for silver
  - Assam, 1823 (Robert Bruce, the Singpho)
  - tea gardens in Assam and Darjeeling, Assam tea reaches London in 1839
  - mostly exported
  - the Indian Tea Association campaign
  - railway, factory and bazaar
  - masala chai (doodh, cheeni, adrak, elaichi)
  - the British disliked it because it used less leaf
  - today chai is an emotion
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, one call per scene (`src/groups.json`). Every scene was checked with `saarika:v2.5` STT.
- `src/scenes.js` = the shared base from the Computer video + `parts/chai.part` (titles, highlights) + the shared primitives + `parts/scenes.part` (chai primitives and scenes) + the shared DOM/render code.

## Rebuild
Same steps as `../computer-ki-zaroorat-kyun-padi`: `tts.py`, `build.py`, copy `index.html` (= `head.html` + `scenes.js` + `</script></body></html>`) and `fonts/`, `render.js`, `audio.py`, then mux and concat the credit.

## 3D version: `chai-ki-shuruat-kaise-hui-3d.mp4`
The same video with three parts rebuilt in 3D using Remotion and React Three Fiber (`../chai-3d`):
- **Scene 1, kulhad hook:** a lathe-turned clay kulhad with soft steam, a 3D sun and moon, and a ring of kulhads on "crores".
- **Scenes 4–7, globe journey:** the China → Cape → London tea route; silver coins flowing back to China; zoom to Assam (1823) with a 3D tea bush sprouting; tea gardens glowing in Assam and Darjeeling; the 1839 ship route Assam → Kolkata → London.
- **Scene 11, masala patila:** a steel patila on a gas flame. Doodh pours from a carton, then sugar cubes, ginger and elaichi drop in with splashes, and the chai turns milky.

The 2D base is rendered with those illustrations left empty (`window.BLANK3D`). The 3D layer is masked to the illustration band, so the header, title, tag and captions stay readable. `../chai-3d/tools/splice.py` swaps the 3D frames in, adds the audio and appends the credit.
