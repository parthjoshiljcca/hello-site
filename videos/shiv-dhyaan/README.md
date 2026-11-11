# Shiv hamesha dhyaan mein kyun rehte hain? Meditation ka asli rahasya

Final: `shiv-dhyaan-kyun.mp4` (1080x1920, 30 fps, about 1:39 of content plus The Why Spaces credit)

This uses the locked Why Spaces style (`../STYLE.md`) and Kabir's voice. It is 2D line-art with three 3D shots, rendered with Remotion and React Three Fiber in `../shiv-dhyaan-3d`.

## Scenes (17)
1. **3D Kailash:** a procedural rocky snow peak with horizontal ledge bands, under stars and the moon, with falling snow. On "aankhein band", a glowing point of dhyaan pulses out rings.
2. **Hamesha dhyaan kyun?** Shiv in dhyaan (respectful line art: jata with chaand, Ganga, naag, third eye, rudraksha, trishul and damru), with a "?".
3. **Adiyogi:** the 7 Saptarishi seated in an arc, with lines of gyaan connecting them.
4. **Prateek:** rain and lightning outside, a calm glowing circle around Shiv inside ("bahar toofaan, andar shaanti").
5–7. **Decoding the symbols:** NAAG = darr par control, CHAAND = shaant mann, GANGA = vichaar kaabu mein, 3RD EYE = andar ki drishti.
8. **Monkey mind:** the brain with orbiting thought bubbles (EMI, deadline, "kal kya hoga", reels…), split into past and future.
9. **Practice:** an attention dot wanders off and returns to the breathing SAANS circle, again and again.
10–11. **3D brain, one continuous shot:** the amygdala goes from flashing red to "CALM", then the prefrontal cortex lights up.
12. **Body:** slow heartbeat, deep breaths, and a cortisol bar dropping.
13. **Life:** gussa ↓, neend ↑, focus ↑.
14. **React vs respond:** trigger, explosion (REACT) vs trigger, pause, check (RESPOND).
15. **Asli rahasya:** Shiv calm in the middle of a busy city ("duniya ke beech, andar se shaant").
16. **3D breath orb:** "5 minute", then SAANS LO and SAANS CHHODO.
17. **Comment prompt.**

## Content notes
- The religious parts are framed as yog parampara or maanyata, and Shiv is drawn respectfully in dhyaan mudra.
- The science is kept to well-supported, general findings ("research batati hai"): regular meditation is linked to lower amygdala reactivity, more prefrontal engagement, a slower heart rate and breathing, and lower stress and cortisol. Life benefits are phrased modestly.

## Production
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, with one call per scene, each under 12 s. All scenes were checked with `saarika:v2.5` and for trailing junk with local faster-whisper.
- In scene 4 the two transcribers disagreed on "…band karna **nahi** hai", so it was regenerated until both matched word for word.
- Mix: the voice is in front, over the locked 112 bpm structure with the original uplifting progression. SFX include an Om drone, Tibetan-style bells, wind over Kailash, breath in and out, a slow heartbeat, and a storm.
- Encode: crf 25 / maxrate 3.2M.

## Rebuild
The steps are the same as for `../why-anxiety`. Use `src/` here (`parts/base + aprims + sd + prims + dom`) and `../shiv-dhyaan-3d` (composition `Dhyaan3D`).
