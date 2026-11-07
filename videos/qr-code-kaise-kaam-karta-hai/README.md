# QR Code kaise kaam karta hai (Hinglish explainer)

Final: `qr-code-kaise-kaam-karta-hai.mp4` (1080x1920, 30 fps, 2:52 content + The Why Spaces credit = 2:59)

Built with the locked style in `../STYLE.md` / `../style-lock.json`.
- 15 scenes, 2D motion graphics, a real scannable QR (encodes "THE WHY SPACES", EC level H)
- Narration: Sarvam `bulbul:v3`, kabir, pace 1.0, whole Devanagari script in one call (`src/script.json` = [devanagari, roman caption])
- Sentence boundaries: silence detection + Sarvam STT check, then fixed by hand in `src/build.py` (`B`)
- Script's last two lines ("This is THE WHY SPACES. Because every WHY deserves a story.") are left to the credit scene, which already says them

Rebuild: `python3 build.py` → `node render.js <dir> full <out.mp4> [from] [to]` → `python3 audio.py` → concat with `../assets/the-why-spaces-credit.mp4`
