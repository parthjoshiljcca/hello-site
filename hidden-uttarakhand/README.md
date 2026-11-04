# Hidden Uttarakhand — preface video (9:16)

`out/hidden-uttarakhand-preface.mp4` is a 40-second, 1080x1920, 30 fps animated retelling of the
book's preface with an original score. Everything is drawn in code: no stock footage or samples.

| Time | Scene | Line on screen |
| --- | --- | --- |
| 0–12.6 s | Night turns to dawn over the snow peaks | Some places never make it onto a map. / They live on in the stories of the people who call them home. |
| 12–19 s | A traveller climbs a footpath past a road milestone | This journey began where the road ends — on footpaths beyond the last bus stop. |
| 18.6–25 s | A terraced village, a stone temple and a ringing brass bell | In villages where the temple bell still keeps time, |
| 24.6–31 s | A river born at a glacier, buransh petals and a glowing carved stone | where rivers are born, and every stone remembers a legend. |
| 30.6–35.8 s | A book opens and its pages turn | This is not a guidebook. It is an invitation. |
| 35.2–40 s | Title at golden hour | देवभूमि · Hidden UTTARAKHAND · Walk the paths the maps forgot. · Begin the journey |

The score is a tanpura drone on D with a bansuri-style flute in raag Bhupali, plus wind, hand-drum
footsteps, the temple bell, the river and page turns, all timed to the picture.

## Editing

- Lines of the preface: `CAPS` in `preface.html` (start, end, y-position, text; wrap a word in `*` to make it gold).
- Title card: the `#title` block in `preface.html`.
- Music and sound: `preface_music.py`. Event times are noted next to `BELL_STRIKES` and `FLIPS` in the page.

## Rebuilding

Needs Node with Playwright (Chromium), Python 3 with NumPy and SciPy, and ffmpeg.

```sh
NODE_PATH=$(npm root -g) node make_video.js                 # full video
NODE_PATH=$(npm root -g) node make_video.js --stills=4,21   # preview frames in out/frames/
```

Fonts: Cormorant Garamond and Tiro Devanagari Hindi (SIL Open Font License), from Google Fonts.
