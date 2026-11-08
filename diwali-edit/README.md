# Diwali edit: SpArsh Divine Art Studio

The same edit in two aspect ratios, set to *Shubhaarambh* (Kai Po Che):

| File | Format | Length |
|---|---|---|
| `diwali_reel_9x16.mp4` | 1080×1920, 30 fps (Reels/Shorts) | 22.6 s |
| `diwali_reel_16x9.mp4` | 1920×1080, 30 fps (YouTube/landscape) | 22.6 s |

## How it's cut
- **Music**: the reference reel's splice, rebuilt from the full-quality song. The intro uses song 39.45–44.58 s, then from the 5.13 s cut it continues at 61.26 s. The song keeps playing under the logo and fades out at the end.
- **Cuts** land on the reference's cut points: flicker cuts at 2.07–2.93 s, the drop at 3.10 s, then 4.10, 5.13, 7.10, 8.90, 10.90, 12.75 and 14.97 s. Every cut and strong beat gets a zoom punch.
- **Intro**: a soft film-burn light leak with a circular iris reveal, and *"IT'S FINALLY / THAT TIME OF THE YEAR"*.
- **From the drop**: a decorative *॥ दिवाली ॥* title (Amita calligraphic Devanagari, gold gradient, maroon outline, warm glow) plus a small *SpArsh · Divine Art Studio* credit.
- **Logo reveal (17.07 s → end)**: the SpArsh signature writes itself on with a glowing pen tip and sparks. The warm neon glow blooms on the song's hit at 76 s, a light sweep crosses the logo, and *DIVINE ART STUDIO* rises in. Then a gold script *Happy Diwali* rises in under the logo with a spark burst.
- **Grade**: brighter and more natural. Whites are cooler, saturation is lower and midtones are lifted, so the warm AI footage stops looking orange. Vignette and grain are very light.
- The source clips' AI-generator watermark stays out of frame.

## Scripts (`scripts/`)
- `assets.py`: text PNGs, rendered with PIL + raqm so the Devanagari shapes correctly, and the burn/iris overlay.
- `fancy_title.py`: the decorative ॥ दिवाली ॥ title.
- `logo.py`: the logo reveal.
- `reel2.py`: renders either aspect ratio (`v` or `h`).
- `music.py` / `edit.py`: the earlier synthesized-music cinematic cut, kept for reference.

You need ffmpeg, numpy, Pillow with raqm, and the Cinzel, Amita and Luckiest Guy fonts.
