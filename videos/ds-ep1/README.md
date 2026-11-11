# The Why Spaces · Data Structures Series · Ep. 1: Data Structures ki zaroorat kyun padi?

Final: `ds-ep1-data-structures-kyun.mp4` (1080x1920, 30 fps, about 2:18 of content plus The Why Spaces credit)

This is the first episode of The Why Spaces' own Data Structures series, in the locked Why Spaces style (`../STYLE.md`) with Kabir's voice and the cinematic default: 3D camera moves, 2D camera motion, and cinematic SFX ducked under the narration. The 3D shots are in `../ds-ep1-3d`.

## Teaching idea: one everyday analogy per data structure, so it's never forgotten
| Data structure | Analogy | Why it fits |
|---|---|---|
| Array | Train with numbered coaches | Know the number → go straight there (index access) |
| Linked List | Treasure hunt | Each clue points to the next (pointers) |
| Stack | Plates at a shaadi (and Ctrl+Z) | Last plate placed is the first one taken (LIFO) |
| Queue | Chai shop line | First to come gets chai first (FIFO) |
| Tree | Family tree (and phone folders) | Hierarchy: Dada ji → Papa → Aap |
| Graph | Metro map (and Google Maps) | Stations = nodes, lines = edges, shortest path |
| Hash Table | Locker room | Name → hash() → locker number, straight in |

The core "why" is a messy room vs a key holder by the door: storing data is easy, but finding it fast needs a structure. Then the Instagram scale (crore users), and finally "sahi cheez, sahi jagah par, sahi speed se". The recap mnemonic repeats all seven pairs, and the episode ends with a hook for Ep. 02 (Array).

## Scenes (24)
1. **3D phone:** chaotic photo, contact and message tiles orbit the phone. On "naam type" they snap into a grid, and on "palak jhapakte" one contact flies forward, glowing (orbit and dolly camera).
2. Title card: DATA STRUCTURES, "The Why Spaces · DS Series · EP 01".
3–5. Messy room ("Meri chaabi dhoondho!"), a magnifier searching every corner with a ticking clock, then the key holder: "Mil gayi! Sirf 1 second."
6. **Definition:** an organised shelf, "Data + sahi tareeka = tez kaam".
7–8. Crore users on Instagram, then a slow one-by-one username scan vs the right structure finding it instantly.
9. A preview grid of the 7 structures with their analogy icons.
10. **3D array train:** a low tracking shot along the coaches, index labels [0]–[5], a whip to `train[3]` "SEEDHA!", then a pull-back.
11. **Linked list:** clue notes connected by arrows across a map, ending at a glowing treasure chest.
12. **3D stack of plates:** plates drop in one by one (PUSH); the last one glows and lifts off first (POP, last in first out), with a crane camera.
13. **Undo = stack:** an editor plus an undo stack, and Ctrl+Z pops the top.
14. **Queue:** a chai stall with a line; the front is served, a new person joins at the rear (FRONT/REAR, FIFO).
15. **Tree:** a family tree (Dada ji → Papa / Chacha → Aap…), which morphs into a phone folder tree.
16. **3D metro graph:** stations as nodes, colored lines as edges, trains moving ("NODE = STATION", "EDGE = LINE"), with a tilting orbit camera.
17. **Google Maps:** a shortest path lights up across a graph between two pins.
18. **Hash table:** a locker grid; "RIYA" → hash() = 7 → locker 7 opens.
19–20. The why: data growth bars, then sahi cheez, sahi jagah, sahi speed.
21–22. **Recap mnemonic:** each data structure = its analogy, with icons.
23. Next: EP 02, Array.
24. Comment prompt.

## Narration v2 (natural voice fix)
The first cut sounded unnatural. Measured, each of the 24 TTS calls landed at a different base pitch (95–124 Hz, a 5.4-semitone spread), and some English tech words were mispronounced (Array came out as "arre"). The fix:
- **Pronunciation:** the TTS text writes every English or tech word in Devanagari (ऐरे, हैश टेबल, अनडू, लिंक्ड लिस्ट…); the on-screen captions stay in Roman.
- **Steadier prosody:** `temperature` 0.35 and pace 1.1 (instead of 1.2), set via the `TTS_TEMP` / `TTS_PACE` env vars in `src/tts.py`.
- **Consistent pitch:** clips more than 1.5 semitones off ~108 Hz are regenerated (best of up to 4). Then every clip is shifted to 108 Hz with ffmpeg `rubberband` (`formant=preserved`, so the timbre stays natural). The final spread is 0.5 semitones.
- All clips were re-verified with `saarika:v2.5` and faster-whisper. `narration-before-after.mp3` compares the same passage old vs new.

## Production
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, with 24 calls, each under 12 s. All clips were checked with `saarika:v2.5` and for trailing junk with local faster-whisper (all clean).
- Mix: the voice is in front, over the locked 112 bpm bed with the uplifting progression.
  - **Story SFX:** typing, key jingles, ticks, train wheels and horn, plate clinks, a chai pour, a locker clunk.
  - **Cinematic SFX:** braams, impacts, swoops on the camera moves, and a reverb send.
  - **Ducking:** the SFX bus is sidechain-ducked under the voice. Measured: voice -14.5 dB vs SFX -42 dB in voice regions, and the loudest SFX window under the voice is -26 dB.
- 2D camera: push-in, pull-out and pans per scene (`CAM2D` in `parts/dom.part`); the header and captions stay steady.
- Encode: crf 25 / maxrate 3.2M.

## Rebuild
The steps are the same as for `../why-anxiety`. Use `src/` here (`parts/base + aprims + ds + prims + dom`) and `../ds-ep1-3d` (composition `DS3D`, `tools/segments.py`, `tools/splice.py`).
