# The Why Spaces · Data Structures Series · Ep. 8: Hash Table (series finale)

Final: `ds-ep8-hash-table.mp4` (1080x1920, 30 fps, about 1:50 of content plus The Why Spaces credit)

This is the eighth and last episode of the DS series. It explains the Hash Table with the gym locker-room analogy, and closes with a wrap-up of all seven data structures. It has three 3D shots with keyframed camera moves, cinematic SFX, and the locked Kabir voice. The 3D project is in `../ds-ep8-3d`.

## What it teaches
- **Hook:** the data structure that finds almost anything instantly.
- **Locker room:** every member's locker is fixed in advance. Say a name and go straight to that locker, with no searching. The name is the **key**, and the stuff inside is the **value**.
- **Hash function:** it turns the key into a locker number.
  - Worked example: R(18) + I(9) + Y(25) + A(1) = 53, and 53 % 10 = 3, so Riya → locker 3.
  - So get, put and delete are all O(1) on average.
- **Collision:** Kiran is K(11) + I(9) + R(18) + A(1) + N(14) = 53 as well, so Kiran also lands on locker 3. Two fixes:
  - **chaining:** a small linked list inside the locker;
  - **open addressing:** take the next free locker (4).
- **Resize:** when the lockers fill up, a room twice as big is built and everyone is rehashed (53 % 20 = 13).
- **Uses:** phone contact search, Instagram username availability, Python's `dict` and JavaScript's object.
- **Recap and wrap-up:** get, put and delete are O(1)*, and collisions are handled by chaining or probing. Then the series wrap-up: Array, Linked List, Stack, Queue, Tree, Graph and Hash Table, 7 / 7 done. It ends by asking which series viewers want next.

## 3D shots (Remotion + R3F, keyframed camera paths)
1. **Hook:** Ep. 7's graph stations lift off the floor and become a row of neon lockers. Locker 3 opens on "TURANT!".
2. **Locker room (continuous across three scenes):**
   - Ten lockers (0–9) appear.
   - A "RIYA" tag flies straight to locker 3, the door swings open, and the camera pushes in.
   - KEY is labelled on the tag, and a glowing "VALUE · SAAMAAN" box sits inside.
3. **Collision (continuous across four scenes):**
   - The "KIRAN · 53" tag hits locker 3, which flashes red ("COLLISION!").
   - Chaining: Kiran hangs below Riya on a link ("LOCKER 3: RIYA → KIRAN").
   - Open addressing: Kiran moves to locker 4 ("3 BHARA → AGLA KHAALI: 4").
   - Resize: the wall grows to 20 lockers in two rows, and Riya and Kiran move to 13 and 14 ("53 % 20 = 13").

## 2D scenes
- the title card;
- the HASH() machine ("Riya" → 3);
- the R I Y A letter maths with 53 % 10 = 3 over a row of 10 lockers;
- GET / PUT / DELETE O(1) cards;
- phone contact search;
- the Instagram username check (taken ✕ → available ✓);
- Python `dict` and JS object code;
- the recap table;
- the series wrap-up with all seven icons;
- the comment prompt.

## Narration
- Locked voice: Sarvam `bulbul:v3`, kabir, pace 1.2, default temperature, **no audio processing**. The scene gap is 0.75 s.
- Devanagari for the terms: हैश टेबल, हैश फ़ंक्शन, कॉलिज़न, चेनिंग, ओपन एड्रेसिंग, ऐरे, लिंक्ड लिस्ट, स्टैक, क्यू, ट्री, ग्राफ़. "key" and "value" are written in Latin script. Numbers are in Hindi words (तिरेपन, तीन).
- Take selection with `saarika:v2.5`: every scene's key terms are required (हैश फ़ंक्शन, तिरेपन, किरण, कॉलिज़न, चेनिंग, ओपन एड्रेसिंग, and all seven names in the wrap-up). Every clip was then compared word by word against the script.

## Mix
The voice is in front. SFX:
- locker clunks and door creaks;
- a gear ratchet for HASH();
- letter pops for the maths;
- a glitch, buzz and thud on the collision;
- chain clinks;
- probe beeps for open addressing;
- a swoop and pops for the resize;
- typing for contacts, username and code;
- seven pops for the series wrap-up.

Braams and impacts land after the lines, not on them.

## Rebuild
Same as `../ds-ep7`, using this folder's `src/` and `../ds-ep8-3d`, with output to `../ds-ep8/ds-ep8-hash-table.mp4`. Run at most 3 Remotion renders in parallel.
