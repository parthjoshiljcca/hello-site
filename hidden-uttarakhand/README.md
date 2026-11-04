# Hidden Uttarakhand — narrated preface video (9:16)

`out/hidden-uttarakhand-preface.mp4` is a 2 min 14 s, 1080x1920, 30 fps animated film of the
book's preface, told in the voice-over `voice/preface-voiceover.mp3` (ElevenLabs, voice "Viraj").
The picture, Hindi subtitles, keyword slams and score all follow the recorded voice.

| Time | Scene | Story |
| --- | --- | --- |
| 0:00 | Dawn over the peaks | ये सफ़र सोनप्रयाग से शुरू हुआ था… |
| 0:12 | A village with a temple bell | लोग थे, आवाज़ें थीं, पर फिर भी मैं अकेला था। |
| 0:18 | The footpath beyond the last milestone | शहर पीछे छूट रहा था… पत्थर, चढ़ाई, थकान… |
| 0:28 | The climb, in cloud, with a heartbeat | साँस तेज़ होने लगी थी… चलते रहो। |
| 0:39 | A moonlit deodar forest and a lantern | मैं अकेला नहीं हूँ… जैसे कोई साथ चल रहा हो, बिना दिखे। |
| 0:52 | A glacier river | थकान बढ़ती गई, लेकिन मन शांत होता गया। |
| 1:02 | Golden hour over the ranges | मैं यहाँ क्यों हूँ? |
| 1:12 | The path lights up in the dark | ये सफ़र मेरे अंदर का था… एक झलक दिखी — |
| 1:20 | A stone temple rises out of the fog | मंदिर। … कोई मुझे ले जा रहा था। |
| 1:39 | Rows of lamps, falling marigolds | ना आँसू रोके गए… और दिल भर आया। |
| 1:48 | The bell rings on "बुलाया" and "बुलावा" | मुझे बुलाया गया था। |
| 2:02 | A book opens | ये सिर्फ़ एक यात्रा नहीं थी, ये एक दर्शन था। |
| 2:08 | Title: प्रस्तावना · Hidden UTTARAKHAND | देवभूमि की वो कहानियाँ, जो अब तक छिपी रहीं। |

## How it fits together

1. `voiceover.py` holds the transcript of the recording, phrase by phrase, with each phrase's
   start and end in the recording. It writes `timeline.js` (scenes, captions, word times and the
   cues for the path lighting up, the temple and the bells) and a cleaned-up `voice.wav`.
2. `preface.html` draws every frame from `timeline.js` with `render(t)`.
3. `preface_music.py` scores the same timeline, ducks the music under the voice and mixes them.

**New recording:** replace `voice/preface-voiceover.mp3`, then update the phrase times and text
in `SCRIPT` in `voiceover.py` (wrap a word in `*` to make it gold and slam it on screen). Scene
names in `SCRIPT` pick the picture for each part of the story.

## Rebuilding

Needs Node with Playwright (Chromium), Python 3 with NumPy, SciPy and soundfile, and ffmpeg.

```sh
NODE_PATH=$(npm root -g) node make_video.js                 # full video (about 9 minutes)
NODE_PATH=$(npm root -g) node make_video.js --stills=6,86   # preview frames in out/frames/
```

Fonts: Cormorant Garamond and Tiro Devanagari Hindi (SIL Open Font License), from Google Fonts.
