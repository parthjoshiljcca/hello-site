# The Why Spaces · Data Structures Series · Ep. 4: Stack

Final: `ds-ep4-stack.mp4` (1080x1920, 30 fps, about 1:37 of content plus The Why Spaces credit)

This is the fourth episode of the DS series. It explains the Stack using the shaadi plates analogy. It has four 3D shots with keyframed camera moves, cinematic SFX, and the locked Kabir voice. The 3D project is in `../ds-ep4-3d`.

## What it teaches
- **Hook:** the data structure behind every undo.
- **Plates analogy:** a new plate always goes on top, and people take from the top. So the plate placed last comes out first: LIFO, Last In First Out.
- **The door:** a stack has only one door, the top.
- **Operations:** push (put on top), pop (take from the top), and peek (look at the top without taking it). All three work only at the top, so all three are O(1).
- **Weakness:** to get the middle plate, you have to remove every plate above it.
- **Overflow and underflow:** pushing into a full stack is a stack overflow; popping from an empty stack is an underflow.
- **Uses:**
  - the undo button: each change is pushed, and undo pops it;
  - bracket matching: each opening bracket is pushed, each closing bracket pops one;
  - the call stack: `main()` → `order()` → `pay()`.
- **Recap table:** push, pop and peek are O(1) and fast; reaching the middle is O(n) and slow.
- **Next:** Ep. 05, Queue (chai ki dukaan wali line).

## 3D shots (Remotion + R3F, keyframed camera paths via `camPath`)
1. **Hook:** the A→B→C→D linked nodes from Ep. 3 fly up one by one into a neon stack column, and the top rim lights up.
2. **Plates (continuous across four scenes):** five plates drop into a pile and a blue "NAYI PLATE" lands on top. Then #6 is lifted off the top, followed by #5. "LAST IN" and "FIRST OUT" cones appear as the camera cranes up.
3. **Ops (continuous across five scenes):** the open-top glass column (the only door glows), then `PUSH(40)` drops in, `POP() → 40` arcs out, PEEK shines a scanning beam on 30, and the camera pulls back for O(1).
4. **Overflow / underflow:** `PUSH(60)` lands on a full column, the column turns red, and the item tumbles off. Then the stack empties and `POP()` on the empty column flashes red ("EMPTY → POP?").

## 2D scenes
- the title card;
- the middle-plate problem (the plates above fly off one by one);
- the undo editor with its undo stack (Ctrl + Z pops "Color");
- the bracket checker for `{([])}` with a live stack;
- the call stack frames;
- the recap table;
- the Ep. 05 Queue teaser (chai stall and line);
- the comment prompt.

## Narration
- Locked voice: Sarvam `bulbul:v3`, kabir, pace 1.2, default temperature, **no audio processing**.
- Scene gap: 0.75 s, the same fix as Ep. 3, so each scene's last word finishes before the transition.
- Devanagari for words Kabir misreads in Latin: अनडू (undo came out as "वंडो"/"अंडों"), स्टैक, पुश, पॉप, पीक, टॉप, लाइफ़ो, ओवरफ़्लो, अंडरफ़्लो, कॉल स्टैक, क्यू.
- Take selection: up to 6–8 takes per scene, scored with `saarika:v2.5`. Scene keywords must be present (e.g. पॉप, which once came out as "कॉप", and लाइफ़ो in the recap), banned misreadings must be absent, and the pitch must be within about 1 semitone of 109 Hz. Then a word-by-word comparison of every clip against the script.

## Mix
The voice is in front. SFX: plate clinks, whooshes and clunks for every push and pop, a hum and scan beep for peek, a glitch, buzz and thud for overflow, a power-down for underflow, keyboard clicks for the undo edits, ascending pops and descending beeps for the brackets, and braams, impacts and swoops on the camera moves, with a reverb send. The SFX bus is sidechain-ducked: voice -14.5 dB vs SFX -43 dB in voice regions, and the loudest SFX window under the voice is -27.5 dB.

## Rebuild
The steps are the same as for `../ds-ep3`: `src/tts.py` → take selection → `src/build.py` → `timing.json` → `src/assemble.sh` + `src/render.js` → `src/audio.py`. Then use `../ds-ep4-3d` (composition `DS3D`, `tools/segments.py`, `tools/splice.py`), and write the output to `../ds-ep4/ds-ep4-stack.mp4`. Run at most 3 Remotion renders in parallel, because more than that runs out of memory.
