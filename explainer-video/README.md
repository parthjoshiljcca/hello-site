# PaperDispatch explainer video

1080p explainer for the College Admin flow of paperdispatch.app (≈2.5 min).

- `out/paperdispatch-explainer.mp4` – rendered video (visuals only, no voice yet)
- `out/paperdispatch-explainer.srt` – subtitles / narration timings
- `script.json` – narration and on-screen text for every scene (edit here)
- `stage.html` – the animated scene layout
- `screens/` – portal screenshots used in the video

## Add the Indian-English voice-over

The voice is Microsoft's `en-IN-PrabhatNeural` (male, neutral North-Indian English accent).
For a female voice use `--voice-name=en-IN-NeerjaNeural`.

```bash
pip install edge-tts
npm i playwright && npx playwright install chromium   # if not already installed
node make_video.js --voice
```

In voiced mode every scene is timed to the length of its narration, so audio and visuals stay in sync.
Run `node make_video.js` (no flag) to re-render the silent version.
