# Diwali edit — SpArsh Divine Art Studio

Two cuts of the four studio clips:

| File | Format | Sound | Length |
|---|---|---|---|
| `diwali_reel_9x16.mp4` | 1080×1920, 30 fps (Reels/Shorts) | Reference edit's soundtrack | 17.8 s |
| `diwali_cinematic_16x9.mp4` | 1920×1080, 24 fps, 2.39:1 letterbox | Original synthesized 120 BPM dhol/sitar track | 37 s |

## Reel (matched to the reference)
- **Cuts** land on the reference's cut points: flicker cuts at 2.07 / 2.17 / 2.33 / 2.83 / 2.93 s, then the drop at 3.10 s and cuts at 4.10, 5.13, 7.10, 8.90, 10.90, 12.75 and 14.97 s. Every cut and strong beat gets a zoom punch.
- **Intro**: film-burn light leak with a circular iris reveal, plus *"IT'S FINALLY / THAT TIME OF THE YEAR"* in bold yellow with a 3D drop shadow.
- **From the drop**: *॥ दिवाली ॥* in white, centered low in the frame. A small *SpArsh · Divine Art Studio* credit sits where the reference has its handle.
- **Story**: decorating, then rangoli and diyas, then the sparkler celebration, then a slow push-in and fade to black.

## Cinematic cut
- Intro → build (cuts tighten 2 beats → 1 → ½ → ¼) → **drop on the rangoli** → groove → riser into slow motion and a half beat of black → **second drop on the celebration** → *Happy Diwali* title card.
- Warm/teal grade, film grain, vignette, slow-motion with frame interpolation, flash cuts and beat-pulse zooms.

Both cuts keep the source clips' AI-generator watermark out of frame.

`scripts/` holds the generators: `music.py` builds the soundtrack, `edit.py` makes the 16:9 cut, `assets.py` makes the text and film-burn overlays, and `reel.py` makes the 9:16 reel. You need ffmpeg, numpy, Pillow with raqm, and the Cinzel, Great Vibes, Mukta and Luckiest Guy fonts.
