# THE WHY SPACES: house style for reels

Approved on the "Why 24 hours" reel (`reels/hf-24-hours/`). Every new reel follows this unless the person asks otherwise. Copy `reels/hf-24-hours/` as the starting point and change only `lines.json` and the scenes.

## Brand
- Instagram: **@thewhyspaces**. Tagline: **Because every WHY deserves a story.** (the word WHY in orange)
- Logo: `reels/why-spaces-intro/assets/logo.png` (transparent PNG). Used only on the end card, never as the first frame.
- Colours: black / near-black backgrounds, warm white `#f3ece2`, orange accent `#f07c1e` (caption highlight `#f39a3d`).
- Language: Hinglish narration; captions in Roman Hinglish exactly as the script is written.

## Voice and pace (the person found 1.05× too slow and 1.3× too rushed)
- Sarvam TTS, model `bulbul:v3`, speaker **`kabir`**, `target_language_code: hi-IN`, **pace 1.2**, 48 kHz.
- TTS text: Hindi words in Devanagari, English words in Latin script, numbers written as words ("twenty-four hours", "बारह", "base sixty"). Captions keep the original Roman text and digits.
- The API key is saved as a network secret for `api.sarvam.ai` (header `api-subscription-key`); scripts send the placeholder `proxy-injected`. Never paste or commit a key.
- Each line is trimmed of leading/trailing silence (`tts.py`).
- Timing (`build.py`): start at 0.3 s; **0.2 s** between lines in one scene; **0.4 s** at a scene change; end card holds 2.4 s.
- **Dramatic pauses** only on 3–5 key beats: about **1.0 s** after the hook question, **0.7 s** after a big reveal (e.g. a name like "Ancient Babylon."), 0.5–0.6 s on a twist line or before the ending. Never after every question.
- Target length **80–95 s**. If a script runs long, cut lines rather than speeding the voice.

## Visual style (2D illustrated story)
- Flat vector illustration drawn on canvas: dark slate-blue night scenes, warm light sources (moon, lamp, diya, sun), soft glows, film grain and vignette.
- Recurring faceless character in an **orange hoodie** with spiky dark hair (`person()` in `reels/kit/kit.js`).
- One scene per idea; each scene has a slow push-in (scale 1 → 1.08, ease in-out) and hard cuts between scenes inside an era.
- Cream "time card" tags at the top for place or era (`tag('ANCIENT','EGYPT')`).
- Diagrams for numbers (dials, bars, counters) use orange for day or the main fact and blue `#7fa6d9` for the contrast.
- Every hook scene needs motion during its pause (e.g. options struck through one by one) so no frame holds still for more than 3 s.
- End card: black, logo blurring in, tagline word by word, orange "Follow @thewhyspaces" pill.

## Motion graphics (HyperFrames)
- Built as a HyperFrames project (skills in `.claude/skills/`, CLI `npx hyperframes`). GSAP is vendored at `assets/js/gsap.min.js`: never load from a CDN (blocked here and the render fails).
- Captions: Montserrat 700, **62 px, sentence case**, 3–5 words per group, words blur in (8 px → 0, 0.32 s `expo.out`, 0.09 s apart), key words orange with a soft glow; one group on screen at a time, never overlapping.
- Captions are top-anchored inside the safe band (168–1330 px): y 300 by default, 400–470 when a top tag or counter is on screen. Nothing readable below 1330 px.
- Transitions: registry `organic-light-leak-overlay` (one copy per use, unique id) at **era changes only**; hard cuts elsewhere.

## Sound
- Use the bundled real SFX (`.claude/skills/media-use/audio/assets/sfx/`); no sounds synthesised in code. Place each so its peak lands one frame after the picture.
  - Hook: `click-soft` tick every 1 s that **stops dead** at the hook question, `riser` underneath, then `impact-bass-1`.
  - Era change: `whoosh-cinematic` (vol 0.5). Other scene changes: alternate `whoosh` / `whoosh-short` (vol 0.3).
  - Big reveal: `impact-bass-2` (0.75). Twist line: `impact-bass-1` (0.5). Soft thud before the ending: `impact-bass-2` (0.3).
  - Clock scenes: ticks every 1 s (0.35); machinery: ticks every 0.5 s (0.28).
  - Logo: `riser` cut at its peak plus `impact-bass-2` (0.8).
- Music bed: none available yet (network blocks free libraries; HeyGen not signed in). When the person supplies a track, place it under the voice at about 0.12–0.14 volume.
- Master: **−14 LUFS**, true peak ≤ −1 dB.

## Delivery
- 1080×1920, 30 fps. Render with `npx hyperframes render --quality delivery`, then re-encode (`libx264 -crf 23 -maxrate 5M`, AAC 192k) to stay under GitHub's 100 MB limit, and normalise to −14 LUFS.
- Check frames at every line change for caption overlap before sending.
- Commit sources and only the compressed final MP4 (never the raw render).
- Fact-check every script and mention any nuance (e.g. solar vs sidereal day).
- Start each new reel in a fresh session to save tokens.

## Series: Data Structures Visualised (1-minute reels)
- Each episode about **55–60 s** (about 48 s of speech at pace 1.2). Project per episode: copy `reels/hf-array/`, then edit `lines.json`, `cues.json` and `scenes.js` (`build.py` is generic).
- Structure: hook question (0–5 s, 1.0 s dramatic pause) → reveal of the structure's name → Indian analogy → visualised operations with Big-O badges (orange for fast, red `#e0533a` for slow) → real-world uses → "Agle episode mein: …" teaser scene → end card.
- Persistent label at the top: `THE WHY SPACES · DATA STRUCTURES · EP NN` (orange, 24 px, y ≈ 200).
- Diagrams: dark rounded cells (`cell()`), indexes in blue under the cells, highlighted cell in orange with a glow.
- Episodes: 01 Array (train) · 02 Linked List (treasure-hunt chits) · 03 Stack (shaadi buffet plates, Undo) · 04 Queue (railway ticket line) · 05 Hash Table (hostel room numbers) · 06 Binary Tree (khandaan family tree) · 07 BST (dictionary search) · 08 Heap (hospital emergency) · 09 Graph (metro map) · 10 Trie (keyboard autocomplete).
