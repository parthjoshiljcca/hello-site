# The Why Spaces · Data Structures Series · Ep. 5: Queue

Final: `ds-ep5-queue.mp4` (1080x1920, 30 fps, about 1:30 of content plus The Why Spaces credit)

This is the fifth episode of the DS series. It explains the Queue with the chai-ki-dukaan line analogy. It has four 3D shots with keyframed camera moves, cinematic SFX, and the locked Kabir voice. The 3D project is in `../ds-ep5-3d`.

## What it teaches
- **Hook:** a stack is "last in, first out", but in real life whoever comes first gets served first.
- **Chai line:** a new person always joins at the back, and the person at the front gets chai first. That's FIFO (First In, First Out).
- **Two ends:** the queue has a front and a rear. Enqueue adds at the rear, dequeue removes from the front, and peek looks at the front. All three are O(1) when it's built the right way.
- **The trap:** shifting the whole line forward on every dequeue makes it O(n).
- **The fix:** a circular queue. The slots stay where they are; only front and rear move forward, and after the last slot they wrap back to [0].
- **Uses:** a printer queue, the keyboard input buffer, and customer-care call queues.
- **Recap table:** enqueue, dequeue and peek are O(1); reaching the middle is O(n).
- **Next:** Ep. 06, Tree (family tree).

## 3D shots (Remotion + R3F, keyframed camera paths via `camPath`)
1. **Hook:** Ep. 4's stack tower (A–D) tips over block by block into a horizontal line, with OUT at the front and IN at the rear.
2. **Chai line (continuous across three scenes):** at a glowing chai stall, #5 walks in at the back. #1 gets a cup and walks off, and everyone steps forward. Then #2 is served. Cones mark "FIRST IN" and "FIRST OUT".
3. **Ops (continuous across five scenes):** a six-slot neon track.
   - FRONT and REAR markers appear.
   - `ENQUEUE(50)` slides in at the rear.
   - `DEQUEUE() → 10` leaves from the front, and only the FRONT marker moves.
   - A peek beam lights up 20.
   - The camera pulls back for "KOI SHIFT NAHI → 1 STEP".
4. **Circular queue:** an 8-slot ring, viewed top-down. A is dequeued and FRONT moves to [4]. REAR moves past [7], an arc wraps to [0], and new items drop into [0] and [1].

## 2D scenes
- the title card (OUT ← A B C D E ← IN);
- the O(n) trap (dequeue, then 5 shifts);
- the printer with its queued docs;
- the keyboard typing HELLO through a buffer onto the screen;
- the customer-care phone ("Aap #N position par");
- the recap table;
- the Ep. 06 Tree teaser;
- the comment prompt.

## Narration
- Locked voice: Sarvam `bulbul:v3`, kabir, pace 1.2, default temperature, **no audio processing**. The scene gap is 0.75 s.
- Devanagari for the terms: क्यू, फ़ीफ़ो, फ़्रंट, रियर, एनक्यू, डीक्यू, पीक, सर्कुलर क्यू, ट्री.
- One line was reworded. "जो पहले आया, उसे पहले चाय।" came out as "…पहले जाए" in all eight takes, because the sentence-final "चाय" got swallowed. It now reads "जो पहले आया, चाय भी उसे पहले मिली।".
- Take selection with `saarika:v2.5` keyword checks (e.g. "आगे खिसका" in the trap line), plus a word-by-word comparison of every clip against the script.

## Mix
The voice is in front. SFX:
- footsteps, a chai pour and a cup clink in the queue;
- whooshes and clunks for enqueue and dequeue, and five shift whooshes for the trap;
- a printer ratchet, keyboard clicks and a phone ring.

Braams and impacts land after "Big O of 1", not on top of it. The SFX bus is sidechain-ducked: voice -14 dB vs SFX -45 dB in voice regions.

## Rebuild
Same as `../ds-ep4`, using this folder's `src/` and `../ds-ep5-3d`, with output to `../ds-ep5/ds-ep5-queue.mp4`. Run at most 3 Remotion renders in parallel.
