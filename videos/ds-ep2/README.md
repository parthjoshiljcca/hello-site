# The Why Spaces · Data Structures Series · Ep. 2: Array andar se

Final: `ds-ep2-array.mp4` (1080x1920, 30 fps, about 1:56 of content plus The Why Spaces credit)

This is the second episode of the DS series: a deep dive into the Array, with five hi-tech 3D shots that each have a keyframed camera move, cinematic SFX, and the locked Kabir voice. The 3D project is in `../ds-ep2-3d`.

## What it teaches
- **Why arrays are fast:** memory is a "gali" of houses with addresses, and an array books houses that sit side by side (contiguous, equal size). The computer remembers only the first address.
- **Why counting starts at 0:** the index means "how many houses ahead of the first", so the first house is 0 ahead.
- **Direct access:** `address + index`, e.g. 104 + 3 = 107. It's the same time for 10 items or 10 crore: constant time, O(1).
- **Search without an index:** check one by one (linear search, O(n)).
- **Weakness 1:** inserting or deleting in the middle means shifting everyone, like a full cinema row making space for a new friend. O(n).
- **Weakness 2:** fixed size. When full, a new array twice as big is made and everything is copied (dynamic array).
- **Uses:** gallery, playlist, leaderboard, and every pixel on the screen (a 2D array, rows × columns).
- **Recap table:** access is O(1) and fast; search, insert and delete are O(n) and slower. Next: Ep. 03, Linked List.

## 3D shots (Remotion + R3F, keyframed camera paths via `camPath`)
1. **Hook:** the Ep. 1 train morphs into glowing memory cells. A tracking shot along the coaches, then a crane up to an overview with [0]–[5].
2. **Memory street (one 30 s continuous shot across five scenes):**
   - a low dolly down the "gali" of 16 cells with addresses 100–115;
   - a rise to an overview as cells 104–109 get "booked";
   - a push-in to the base address ("PEHLA GHAR · 104");
   - a pull-back while offset arcs hop out (+1 … +5) and the index labels appear;
   - a whip-zoom onto [3] with an access beam (104 + 3 = 107).
3. **Insert / delete:** items E, D, C shift right one by one and X drops into [2] (push-in on the drop). Then B lifts out and everything shifts left.
4. **Resize:** a close-up on the full 4-cell array, a crane back to reveal the new 8-cell array, and items fly across in arcs.
5. **Pixels:** starts close on `pixel[2][3]`, then pulls back to a top-down view of a 10×10 pixel heart, with a row and a column highlighted.

Look: a near-black floor with a neon grid, dark glass cells with glowing edges and top plates, HDR bloom.

## 2D scenes
- the title card;
- 10 vs 10 crore gauges;
- the O(1) graph;
- linear search with a magnifier;
- the cinema row shifting;
- the full train (size fixed);
- gallery / playlist / leaderboard cards;
- the recap table;
- the Ep. 03 teaser;
- the comment prompt.

Each has the 2D camera motion (`CAM2D`).

## Narration
- Locked voice: Sarvam `bulbul:v3`, kabir, pace 1.2, default temperature, **no audio processing**.
- "Array" is written ऐरे, and never at the start of a sentence, because there it gets read as the interjection "अरे!". Two lines were rephrased for this. Also बिग ओ ऑफ़ वन, टू डी ऐरे, लिंक्ड लिस्ट and लीडरबोर्ड.
- Pitch consistency by take selection: clips more than 1.5 semitones off the median are regenerated. The spread is 2.7 semitones.
- Every clip was verified with `saarika:v2.5` (key words must appear in the transcript) and faster-whisper (no trailing junk).

## Mix
The voice is in front. SFX: train wheels, cell "clunks" as memory is booked, pops on the offset hops, whooshes and clunks for every shift, and braams, impacts and swoops on the camera moves, with a reverb send. The SFX bus is sidechain-ducked: voice -14 dB vs SFX -42 dB in voice regions, and the loudest SFX window under the voice is -28 dB.

## Rebuild
The steps are the same as for `../ds-ep1`. Use `src/` here (`parts/base + aprims + dsprims + ep2 + prims + dom`) and `../ds-ep2-3d` (composition `DS3D`, `tools/segments.py`, `tools/splice.py`). The pipeline aborts the splice if any 3D segment fails.
