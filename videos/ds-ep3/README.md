# The Why Spaces · Data Structures Series · Ep. 3: Linked List

Final: `ds-ep3-linked-list.mp4` (1080x1920, 30 fps, about 1:48 of content plus The Why Spaces credit)

This is the third episode of the DS series. It answers the cliffhanger from Ep. 2: "isn't there a way where nobody has to shift?" The answer is the Linked List, explained with the treasure-hunt analogy. It has five 3D shots with keyframed camera moves, cinematic SFX, and the locked Kabir voice. The 3D project is in `../ds-ep3-3d`.

## What it teaches
- **The hook:** an array insert makes everyone shift; the row then breaks apart into linked nodes.
- **Treasure hunt:** every clue says where the next clue is hidden.
- **Node = data + pointer:** the pointer is the next node's address (A@104 → 231, B@231 → 117 …).
- **Non-contiguous:** nodes can sit anywhere in memory; they don't need to be side by side.
- **Head and null:** the computer only remembers the first node (head); the last pointer is null, which means the list ends there.
- **Insert:** change just two pointers (X → C, then B → X). Nothing shifts, so once you know the position it's O(1).
- **Delete:** point the previous node straight at the next one. Also O(1).
- **No fixed size:** keep appending nodes.
- **Weakness 1:** to reach the 5th node you hop from the head one pointer at a time. There's no direct jump like an array index, so access is O(n).
- **Weakness 2:** every node needs extra memory for its pointer.
- **Uses:** a music player's next/previous and a browser's back/forward, which are doubly linked lists (prev + next pointers).
- **Recap table:** insert and delete (position known) are O(1) and fast; access and search are O(n) and slow; there's extra memory for the pointer. Next: Ep. 04, Stack (shaadi wali plates).

## 3D shots (Remotion + R3F, keyframed camera paths via `camPath`)
1. **Hook:** an X drops into an array, and C, D and E shift right one by one (red strain). Then the cells pull apart into nodes and pointer arcs draw in (crane up).
2. **Nodes (one continuous shot across five scenes):** a dolly along the A→B→C→D chain; a push-in on B with DATA / POINTER and its addresses; a crane up as the nodes scatter across a memory grid with the arcs following; a push-in to the HEAD marker; then a travel to D, whose pointer drops to the NULL symbol.
3. **Insert / delete / append:** X floats in front of the chain, X → C draws, B → C hands over to B → X ("C · D HILE BHI NAHI"); C lifts out and X links straight to D; E and F are appended and null moves along.
4. **Traversal:** an orb hops HEAD → 2 → 3 → 4 → 5 (HOP 1–4 labels), then the camera cranes up to show the red "SEEDHA ✕" beam that a linked list does not have.
5. **Doubly:** three-part nodes [prev | data | next], orange next arcs and blue prev arcs, with orbs travelling both ways.

The look is the same as Ep. 2: a near-black floor with a neon grid, dark glass slabs with glowing edges, and HDR bloom.

## 2D scenes
- the title card;
- the treasure-hunt path (clue → clue → clue → chest);
- the array cell vs node (extra memory);
- the music player and browser cards;
- the recap table;
- the Ep. 04 Stack teaser;
- the comment prompt.

Each has the 2D camera motion (`CAM2D`).

## Narration
- Locked voice: Sarvam `bulbul:v3`, kabir, pace 1.2, default temperature, **no audio processing**.
- Devanagari only where Latin was misread: नोड / नोड्स (otherwise "node" drifted toward "note"), म्यूज़िक प्लेयर, लिंक्ड लिस्ट, डबली, स्टैक, बिग ओ ऑफ़ वन / एन. "Array" is written ऐरे and never at the start of a sentence.
- Scene gap: 0.75 s (`GAP` in `build.py`), not the locked ~0.42 s. With 0.42 s, the transition riser and the visual fade landed on each scene's last word, so it sounded cut off halfway. Now the last word finishes, its tail decays naturally (+0.22 s, 80 ms fade), the visual fade starts 0.2 s after the voice ends, and the riser starts after the word.
- Swallowed words fixed by rewording: "हाँ है" was heard as "हाय" (now "हाँ, बिल्कुल है"); "data," produced a stray "आई डॉट" (now डेटा); ", जिसे कहते हैं head" was garbled (now "। इसे कहते हैं हेड"); ऐरे mid-sentence came out as "आयरे" (now Latin Array, with take selection); and in the recap, जोड़ना → "जुड़ना" and पर → "और" (now "नोड जोड़ना और हटाना तेज़ है, लेकिन…"). The check compares each clip's saarika transcript word by word with the script.
- Take selection: up to five takes per scene, scored with `saarika:v2.5` (scene keywords present, nothing truncated, नोड recognised) and the median pitch within about 1 semitone of 109 Hz.

## Mix
The voice is in front. SFX: shift whooshes and clunks, the break-apart impact, clue pops, memory blips, a powerup on every pointer rewire, a glitch on delete, a whoosh-and-pop for each traversal hop, a buzz on the blocked beam, plate clinks for the Stack teaser, and braams, impacts and swoops on the camera moves, with a reverb send. The SFX bus is sidechain-ducked: voice -14 dB vs SFX -43 dB in voice regions, and the loudest SFX window under the voice is -27 dB.

## Rebuild
Use any work directory `$W`.
1. `python3 src/tts.py $W` (then do take selection as described above)
2. `python3 src/build.py $W`, then write `TOT`/`ev`/`scenes` into `../ds-ep3-3d/src/data/timing.json`.
3. `src/assemble.sh` (it writes `scenes.js` and `index.html` from `head.html` + `parts/base + aprims + dsprims + ep3 + prims + dom`). Copy `src/index.html` and `src/fonts/` into `$W`, run `node src/render.js $W full $W/base2d.mp4`, then copy the result to `../ds-ep3-3d/public/`.
4. `python3 src/audio.py $W`
5. For each segment in `python3 ../ds-ep3-3d/tools/segments.py`, run `npx remotion render src/index.ts DS3D out/seg/<name>.mp4 --frames=<a-1>-<b> --gl=swangle --concurrency=1` (for a segment at frame 0, use `--frames=0-<b>`).
6. `python3 tools/splice.py public/base2d.mp4 out/seg $W/mix.wav ../assets/the-why-spaces-credit.mp4 ../ds-ep3/ds-ep3-linked-list.mp4`
