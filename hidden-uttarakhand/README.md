# Hidden Uttarakhand — narrated preface video (9:16)

`out/hidden-uttarakhand-preface.mp4` is a 61-second, 1080x1920, 30 fps animated preface told
thriller-style: a deep male Hindi narration, Hindi subtitles that appear word by word as they are
spoken, and a dark score with hits on every cut. All of it is drawn and synthesised in code.

| Scene | Narration |
| --- | --- |
| Night over the snow peaks | कहते हैं… उत्तराखंड के पहाड़ों में कुछ जगहें ऐसी हैं, जो किसी नक्शे पर नहीं मिलतीं। |
| A moonlit deodar forest with a lantern | रात के सन्नाटे में, जब हवा देवदार के जंगलों से गुज़रती है… तो अपने साथ कहानियाँ लाती है। |
| A footpath past the road's last milestone | ये सफ़र वहाँ से शुरू हुआ, जहाँ सड़क ख़त्म होती है… आख़िरी बस-स्टॉप के बाद। |
| A village and its ringing temple bell | उन गाँवों में, जहाँ मंदिर की घंटी आज भी वक़्त बताती है… |
| A glacier-fed river and a glowing stone | जहाँ नदियाँ जन्म लेती हैं… और हर पत्थर किसी पुरानी किंवदंती को याद रखता है। |
| The path lights up ahead of the traveller | लेकिन कुछ रास्ते… आप नहीं चुनते। वो आपको चुनते हैं। |
| A book opens | ये कोई गाइडबुक नहीं है। ये एक न्योता है। |
| Title at golden hour | हिडन उत्तराखंड। देवभूमि की वो कहानियाँ, जो अब तक छिपी रहीं। |

## How it fits together

1. `narration.py` voices `LINES` with [Kokoro TTS](https://github.com/thewh1teagle/kokoro-onnx)
   (voice `hm_omega`), lowers and warms the voice with ffmpeg, and writes `timeline.js` with the
   time of every line and word.
2. `preface.html` reads `timeline.js`: scene cuts, subtitles, the bell, the glowing stone, the
   lit path and the title all follow the spoken words.
3. `preface_music.py` builds the score from the same timeline, ducks it under the voice and mixes
   them.

To change the words, edit `LINES` in `narration.py` (wrap a word in `*` to make it gold) and rebuild
with `KOKORO_DIR`. To use a human voice-over instead, replace `out/audio/narration/voice.wav` and
adjust the times in `timeline.js` to match.

## Rebuilding

Needs Node with Playwright (Chromium), Python 3 with NumPy, SciPy, soundfile and kokoro-onnx, and
ffmpeg. Download `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the kokoro-onnx
`model-files-v1.0` release into one folder.

```sh
KOKORO_DIR=/path/to/kokoro NODE_PATH=$(npm root -g) node make_video.js   # re-voice and render
NODE_PATH=$(npm root -g) node make_video.js --stills=6,30                 # preview frames in out/frames/
```

Fonts: Cormorant Garamond and Tiro Devanagari Hindi (SIL Open Font License), from Google Fonts.
