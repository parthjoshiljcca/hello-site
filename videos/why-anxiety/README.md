# Why do we feel anxiety? (Hinglish explainer, 2D + 3D)

Final: `why-do-we-feel-anxiety.mp4` (1080x1920, 30 fps, about 76 s of content plus The Why Spaces credit)

This uses the locked Why Spaces style (`../STYLE.md`) and Kabir's voice. Most scenes are 2D line-art; the three hero moments are 3D, rendered with Remotion and React Three Fiber in `../why-anxiety-3d`.

## Scenes (11)
1. **Hook:** before an exam the dil beats fast (ECG), the haath go cold (shaking hand, snowflake) and the pet fills with titliyan. Then: "Why anxiety?"
2. **3D: the amygdala.** The anatomical brain (from the Overthinking video) turns into an x-ray glass shell, showing a glowing almond-shaped amygdala in each temporal lobe. The camera pushes in and a real 3D almond pops up for scale ("≈ BAADAAM SIZE"). On "alarm", red flashes race over the folds and alarm rings pulse out.
3. **Jungle flashback:** a caveman, trees and a roaring line-art lion. "KHATRA!"
4. **3D: alarm and hormones.** The amygdala flashes red, a nerve signal travels down to the adrenal glands (on the kidneys), and adrenaline (orange) and cortisol (gold) particles erupt.
5. **Fight or flight:** heart rate up (fast ECG), fast breathing (lungs), muscles ready (flexing arm), then FIGHT (fist) and FLIGHT (runner) cards.
6. **Pet mein titliyan:** blood particles flow from the stomach to the arms and legs, and butterflies flutter in the pet.
7. **False alarm:** the lion is crossed out but the alarm bell keeps ringing.
8. **Modern sher:** EXAM, INTERVIEW, DEADLINE and 1 MESSAGE notifications wire into the brain. "DIMAAG: KHATRA!"
9. **Kamzori nahi:** KAMZORI is crossed out, and a shield with a calm heart appears ("PURANA PROTECTION SYSTEM").
10. **3D: breath orb.** A jittery red orb calms into smooth amber, inhales ("SAANS LO", INHALE · 4s) and slowly exhales ("SAANS CHHODO", EXHALE · 6s). "SAB SAFE HAI."
11. **Help:** you and an expert talking. "BAAT KARNA BILKUL SAHI."

## Science notes (kept simple, not medical advice)
- The amygdala (one per hemisphere, roughly almond-sized) flags threats and triggers the stress response. The hypothalamus and the sympathetic nervous system then drive the adrenal glands to release adrenaline, and cortisol follows.
- In fight-or-flight, heart rate and breathing speed up and blood is redirected from digestion to the muscles, which gives the "butterflies" feeling.
- A longer exhale engages the parasympathetic ("rest and digest") system. If anxiety gets in the way of daily life, the script points to talking to an expert.

## Production
- Narration: Sarvam `bulbul:v3`, speaker kabir, `hi-IN`, pace 1.2, with one call per scene. All scenes were checked with `saarika:v2.5` and checked for trailing junk with local faster-whisper (all clean).
- Mix: the voice is in front, over the locked 112 bpm structure with a minor progression. SFX include heartbeats, alarm beeps, a lion roar, notification pings, and breath in/out on the orb.
- 2D: `src/scenes.js` is built from `parts/base.part`, `parts/anx.part` (titles, primitives and scenes), `parts/prims.part` and `parts/dom.part`. The 3D scenes keep only their 2D badges in the base.
- 3D: `../why-anxiety-3d`. Segments are rendered with `--gl=swangle --concurrency=1` and one warm-up frame, because the first WebGL frame renders blank. `tools/splice.py` swaps them into the base frame-exactly, adds the mix and appends the credit.

## Rebuild
Use any work directory `$W`.
1. `python3 src/tts.py $W`
2. `python3 src/build.py $W`, then copy `ev`/`scenes`/`TOT` into `../why-anxiety-3d/src/data/timing.json`.
3. Copy `src/index.html` and `src/fonts/` into `$W`, run `node src/render.js $W full $W/base2d.mp4`, then copy the result to `../why-anxiety-3d/public/`.
4. `python3 src/audio.py $W`
5. For each segment in `python3 ../why-anxiety-3d/tools/segments.py`, run `npx remotion render src/index.ts Anxiety3D out/seg/<name>.mp4 --frames=<a-1>-<b> --gl=swangle --concurrency=1`.
6. `python3 tools/splice.py public/base2d.mp4 out/seg $W/mix.wav ../assets/the-why-spaces-credit.mp4 ../why-anxiety/why-do-we-feel-anxiety.mp4`
