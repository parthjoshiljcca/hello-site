# The Great Bamboo Fight 🐼❤️

`the-great-bamboo-fight.mp4`: 20 s, 1080×1920 (9:16), 30 fps, H.264 + AAC. Ready to upload to Reels and Shorts.

- Characters are cut out of the supplied male and female character sheets. Each scene uses the sheet's own expressions and poses, so the designs stay the same throughout.
- Audio has dialogue, foley (bamboo knocks, snap, crunch, whoosh, squeak, giggles, footsteps) and forest ambience (wind, leaves, birds). **No music.** There are no captions, text or logos.
- The voices are synthesized with espeak-ng and pitch-shifted to sound cartoonish.

## Rebuild
`source/audio.py` builds `soundtrack.wav` and `env.json`. `source/render.py` renders the frames and muxes the final file. Both need Python with Pillow, NumPy and SciPy, plus ffmpeg and espeak-ng. Character cut-outs are made with `rembg`.
