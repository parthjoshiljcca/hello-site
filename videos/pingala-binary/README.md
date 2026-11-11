# Acharya Pingala ne binary jaisa system kyun banaya? (Binary number system)

Final: `pingala-binary-kyun.mp4` (1080x1920, 30 fps, about 1:39 of content plus The Why Spaces credit)

This uses the locked Why Spaces style (`../STYLE.md`) and Kabir's voice. It is 2D line-art with three 3D shots, rendered with Remotion and React Three Fiber in `../pingala-binary-3d`.

## Visual idea
**Laghu = a short beat (white dot) and guru = a long beat (orange capsule)** throughout the video. In the 3D hook the same language becomes **0 = a ring and 1 = a bar**, and in the last scene the beats morph into 0s and 1s that power a phone.

## Scenes (18)
1. **3D:** a glowing chip on a circuit board, with 0s and 1s streaming along the traces. "Sirf 0 aur 1."
2. **Leibniz, 1703:** a bust and a card counting 0, 1, 10, 11, 100, 101.
3. **About 1900 years earlier:** a timeline from about 200 BCE to 1703 CE, with Acharya Pingala and a palm-leaf manuscript ("binary jaisa system").
4. No computer, so why? A chip crossed out, and a "?".
5. **Kavita:** music notes, the palm leaf, CHHANDAHSHASTRA, and a rhythm of short and long beats.
6. **Laghu (chhota) & guru (lamba).**
7. **KA vs KAA:** a short sound bar vs a long one.
8. **Two states:** laghu/guru, 0/1, and an on/off switch.
9. **4 akshar, kitne rhythm?** Four slots flipping.
10. **3D prastaar:** all 16 patterns build row by row in Pingala's order (row 1 all guru, then binary counting).
11. 2×2×2×2 = 16.
12. 2ⁿ, with a table (n = 1…5 → 2, 4, 8, 16, 32).
13. Pattern ⇄ number (#11), following Pingala's naṣṭa/uddiṣṭa methods.
14. Decimal → binary: 13 → 1101 by repeated ÷ 2.
15. **3D Meru Prastaar** (Halayudha, 10th century): a Pascal's triangle of hex tiles with numbers, rows 0–6.
16. For kavita, not computers.
17. Laghu-guru beats morph into 0/1 and a phone full of bits ("digital duniya").
18. Comment prompt.

## Accuracy notes
- Pingala's *Chhandahshastra* is usually dated to about the 3rd–2nd century BCE, so the script says "lagbhag 1900 saal pehle" relative to Leibniz's 1703 binary.
- The script says "binary **jaisa** system". Pingala enumerated laghu/guru patterns (prastāra), counted them as 2ⁿ, and gave index⇄pattern methods (naṣṭa/uddiṣṭa) that work like binary conversion. He did not build computers. The Meru Prastaar is credited to Halayudha's 10th-century commentary.

## Cinematic pass
- **3D camera moves:** the chip shot starts as a top-down crane dive, then slowly orbits with a slight roll. The prastaar camera orbits and dollies around the 16-row column. The Meru shot cranes up from a low angle that looks up the triangle, then pushes in on "Pascal's triangle".
- **2D camera:** the illustration canvas alternates push-in, pull-out, pan left and pan right per scene, eased, with a slight roll drift and an entry settle (`CAM2D` in `parts/dom.part`). The header, titles and captions stay steady.
- **Cinematic SFX:** braams, sub impacts, whoosh-swoops synced to the 3D camera moves, and shimmer tails, all through a short hall reverb send.
- **Voice safety:** the SFX bus is sidechain-ducked under the narration by up to -8 dB (music by 70%). Measured in voice regions: the voice is -14.5 dB and the SFX average -41 dB, and the loudest SFX window under the voice is -26.5 dB, so the effects always stay at least 12 dB under Kabir. The big hits land in the gaps between lines.

## Production
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, with one call per scene, each under 12 s. All scenes were checked with `saarika:v2.5` and for trailing junk with local faster-whisper.
- "lamba" and "badalta" were unclear in the first takes, so both lines were regenerated until the transcripts were word-perfect.
- Mix: the voice is in front, over the locked 112 bpm bed. SFX: tabla-style short and long beats for laghu/guru (including all 16 patterns ticking), data blips, chimes, and a ratchet as the Meru builds.
- Encode: crf 25 / maxrate 3.2M.

## Rebuild
The steps are the same as for `../why-anxiety`. Use `src/` here (`parts/base + aprims + pb + prims + dom`) and `../pingala-binary-3d` (composition `Binary3D`).
