# The Why Spaces · GTA itni famous kyun?

Final: `gta-itni-famous-kyun.mp4` (1080x1920, 30 fps, about 2:03 of content plus The Why Spaces credit)

This is a standalone short, not part of the DS series. It covers why Grand Theft Auto became so big, how it changed gaming, Rockstar Games, and GTA VI, which launched on 19 Nov 2026. The visuals are original line art and an original neon-city 3D world. The short uses **no logos, fonts, characters or game art from the games**. The 3D project is in `../gta-kyun-famous-3d`.

## Facts used (checked on 19 Nov 2026)
- **1997:** the first GTA was a top-down 2D game by DMA Design (Dundee, Scotland). DMA Design later became Rockstar North, and Rockstar Games was founded in 1998.
- **2001:** GTA III brought a full 3D open-world city.
- **2002 and 2004:** Vice City and San Andreas. These were the cyber-cafe and cheat-code era in India; HESOYAM is a real San Andreas cheat.
- **2013:** GTA V made $1 billion in 3 days.
  - Take-Two's filings report "over 230 million" units sold (10-Q, quarter ending 30 Jun 2026), so the video says "23 crore+".
  - GTA Online also launched in 2013, with years of updates and in-game purchases. That turned it into the live-service model the industry copied.
- **Roleplay servers:** players act as police, doctors and gangs on years-long streams.
- **GTA VI:**
  - Trailer 1 got 90.4 million YouTube views in 24 hours (a Guinness record), so the video says "9 crore".
  - It's set in Leonida, with Vice City, and has two leads, Lucia and Jason.
  - The release was delayed twice (2025 → 26 May 2026 → 19 Nov 2026).
  - It launched on 19 Nov 2026 on PS5 and Xbox Series X|S to near-perfect reviews.

## 3D shots (Remotion + R3F, keyframed camera paths)
1. **Hook:** a night fly-through of a 7x7 neon city with two cars, rising to "2013 → 2026".
2. **City (continuous across three scenes):**
   - It opens top-down on a flat grid ("1997 · 2D"); the blocks then rise into a 3D city ("2001 · 3D CITY").
   - A street-level chase cam follows the cars.
   - A corridor of LEVEL 1 / 2 / 3 gates appears and then dissolves.
   - The camera cranes up to "SHEHAR TUMHARA".
3. **Online (continuous across three scenes):**
   - 36 player orbs roam the streets, update cubes rain down, and stars mark in-game purchases.
   - A live-service ring draws around the city ("UPDATE → PLAY → KHAREEDO → REPEAT").
   - The roleplay groups appear: ● LIVE · POLICE (with a car), DOCTOR, GANG.
4. **GTA VI (continuous across three scenes):**
   - It's a sunset bay with an ocean, a beach, pink palms and a skyline across the water.
   - Trailer-record bars count up to "9.0 CRORE VIEWS".
   - LUCIA and JASON figures stand on the beach.
   - The delay timeline reads "2025 ✕ · MAY 2026 ✕ · 19 NOV 2026 ✓", then five review stars appear.

## 2D scenes
- the 1997 CRT;
- the top-down 2D mini-city with cars;
- the cyber cafe (three CRTs, HESOYAM being typed);
- the film, radio and satire cards;
- the $1,000,000,000 counter across 3 days;
- the 23 crore copies stack;
- the Rockstar timeline (1997 → 2026) with a "detail" magnifier;
- the city, film and duniya bottom line;
- the controller comment prompt.

## Look: GTA-vibe colours, The Why Spaces frame
- **2D theme:** `src/parts/gtatheme.part` loads last and replaces `bg`, `badge`, `monoTag` and `card` for the illustration band only. The background gets a sunset sky band (purple → pink → orange), the badges are hot pink, the mono tags are teal, and the cards have a purple-pink glow.
- **3D theme:** the city uses a pink and purple neon grid, pink key light, and buildings in hot pink, teal, sunset orange and purple.
- **What stays The Why Spaces:** the header, pill, title, captions, bottom bar, progress bar and the credit are unchanged.
- **No game art:** the palette is the only nod to the games. No Rockstar logos, fonts, screenshots or characters are used.

## Image slots (your own images)
Put images in `src/images/` as `s<scene>.jpg`, and copy that folder next to `index.html` before rendering. A missing slot is simply skipped. Each image fills the 980x560 illustration band with a slow Ken Burns move, a dark gradient and a pink border, and the scene's own graphics draw on top.
- **2D scenes with slots:** 1 (1997), 2 (top-down), 6 (cyber cafe), 7 (film/radio/satire), 8 ($1B), 9 (23 crore), 13 (Rockstar), 17 (bottom line).
- **No slots on 3D scenes:** scenes 0, 3–5, 10–12 and 14–16 are 3D and draw over the band, so images there would be covered.
- **Rights:** only use images you have the right to use, such as your own gameplay captures or licensed press assets. Official trailer or screenshot material can trigger copyright claims on YouTube or Instagram.

## Narration
- Locked voice: Sarvam `bulbul:v3`, kabir, pace 1.2, default temperature, **no audio processing**. The scene gap is 0.75 s.
- Rewordings found with the word-by-word saarika check:
  - "वाइस सिटी और सैन एंड्रियास" came out as "Vice City **of** San Andreas", so it now reads "वाइस सिटी, और उसके बाद सैन एंड्रियास";
  - in "तीखा मज़ाक", the sentence-final मज़ाक got swallowed, so it now reads "America का खुलकर मज़ाक उड़ाना";
  - "जीटीए सिक्स" (which came out as "जीटीएस") and "ज़िंदा" (which came out as "ज़िना") were fixed by take selection.

## Mix
The voice is in front. SFX:
- city drones and car pass-bys with a horn;
- retro blips;
- an impact as the city rises;
- keyboard typing for the cheat code;
- a clapper and radio static;
- a ratchet counter for the $1B, with a ding and impact after the line;
- update pings, a jingle, and a soft siren for the roleplay police;
- timeline ticks;
- a braam and impact on the trailer record;
- sea wind for Leonida.

Voice -14 dB vs SFX -44.5 dB in voice regions; the loudest SFX window under the voice is -27 dB.

## Rebuild
Same steps as `../ds-ep7`, using this folder's `src/` (`parts/base + aprims + dsprims + gta + prims + dom`, built by `src/assemble.sh`) and `../gta-kyun-famous-3d`, with output to `gta-itni-famous-kyun.mp4`.
