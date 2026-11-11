# Ghar ke bahar nimbu-mirchi kyun latkaate hain? Evil Eye, Nazar Battu & Kirtimukha

Final: `nimbu-mirchi-kyun.mp4` (1080x1920, 30 fps, about 2:19 of content plus The Why Spaces credit, about 2:25 in total)

This uses the locked Why Spaces style (`../STYLE.md`) and Kabir's voice. It is 2D line-art with three 3D shots, rendered with Remotion and React Three Fiber in `../nimbu-mirchi-3d`.

## Scenes (16)
1. **3D:** the nimbu-mirchi totka assembles on its thread (lemon, then 7 green chillies, then charcoal) and swings under a door arch. "Ghar · Dukaan · Truck… kyun?"
2. **Buri nazar:** a jealous eye's gaze hits a house, and a crack runs through it.
3. **Evil eye everywhere:** a **3D** glass nazar bead (Turkey), with a 2D Hamsa hand (Middle East) and a Greek column (Greece). "Hazaaron saal purani."
4. **Lok katha:** an open book, with Lakshmi (glowing lotus) and Alakshmi (storm cloud).
5. **Meetha vs khatta:** laddoos for Lakshmi; nimbu and teekhi mirchi for Alakshmi.
6. **At the door:** Alakshmi eats the totka and turns back ("andar nahi aatin"), then a SAT calendar and a fresh nimbu-mirchi.
7. **Dhyaan bhatkaana:** the gaze bends to the totka on the truck, then a baby with a kaala teeka.
8. **Nazar Battu / Drishti Bommai:** a fierce face on a building under construction, then a truck back reading "BURI NAZAR WALE TERA MUNH KAALA".
9. **Kirtimukha:** an ornate lion face above a temple door.
10–13. **The Puran katha:** Jalandhar sends Rahu, Shiv ji's third eye opens, and a hungry creature emerges. Rahu says sorry and is spared. "Khud ko kha lo": the creature eats its body from the tail until only the face is left. Shiv ji names it Kirtimukha (yash ka chehra), and it guards the temple door while evil bounces off.
14. **Science check:** no scientific proof, and the insect-repellent theory has only a tiny effect.
15. **Mann ki taaqat:** a house with a protective arc and a row of diyas (parampara).
16. **3D outro:** the totka swings again. "Comments mein batao."

## Content notes
Beliefs are framed as maanyata, lok katha or "puraanon ke anusaar", never as fact. The science scene says plainly that there is no evidence.

## Production
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, with one call per scene. All scenes were checked with `saarika:v2.5` and for trailing junk with local faster-whisper.
- The Puran scene (about 15 s) was cut off by the TTS length cap mid-word, so it was split into two scenes (`src/groups.json`) and regenerated. Keep each TTS call under about 12 s.
- Mix: the voice is in front, over the 112 bpm structure with a minor progression. SFX include a chime on the nimbu, a bite, a roar for the Kirtimukha and the creature, a drone, and thuds.
- 3D: the first 3D segment starts at frame 0, so it is rendered without a warm-up frame (its first frame is fully faded anyway); `tools/splice.py` handles this.
- Encode: crf 24 / maxrate 4.8M.

## Rebuild
The steps are the same as for `../why-anxiety`. Use `src/` here and `../nimbu-mirchi-3d` (composition `Nazar3D`, `tools/segments.py`, `tools/splice.py`).
