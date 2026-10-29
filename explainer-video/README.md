# PaperDispatch explainer video

1080p explainer for the College Admin flow of paperdispatch.app (≈2.5 min).

- `out/paperdispatch-explainer.mp4` – rendered video with Indian-English voice-over
- `out/paperdispatch-explainer.srt` – subtitles / narration timings
- `script.json` – narration and on-screen text for every scene (edit here)
- `stage.html` – the animated scene layout
- `screens/` – portal screenshots used in the video

## Voice-over

The narration is generated offline with [Kokoro](https://github.com/thewh1teagle/kokoro-onnx), voice `hm_omega`
(a Hindi-speaker voice, so the English has a North-Indian accent). Other choices: `hm_psi` (male),
`hf_alpha` / `hf_beta` (female).

```bash
pip install kokoro-onnx soundfile
mkdir -p models && cd models
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
cd ..
npm i playwright && npx playwright install chromium   # if not already installed
node make_video.js --voice                            # or add --voice-name=hf_alpha
```

Alternative: Microsoft's `en-IN-PrabhatNeural` / `en-IN-NeerjaNeural` via `pip install edge-tts` and
`node make_video.js --voice --edge` (needs internet).

Every scene is timed to the length of its narration, so audio and visuals stay in sync.
If a word comes out wrong, respell it in `script.json` (e.g. "Chair person" instead of "Chairperson").
Run `node make_video.js` (no flag) for a silent version.
