---
name: cinematic-reel
description: Edit AI-generated clips (Grok, etc.) + a song into a 4K cinematic Instagram reel in the brahmaroopam.ai house style — beat-cut, AI watermark removed, studio-light colour grade, gold Cinzel title cards on black, small roaming ©brahmaroopam.ai watermark. Use when the user uploads video clips and a song and asks for a reel / cinematic edit / "same style as before".
---

# Cinematic Reel (brahmaroopam.ai style)

Approved house style (Nov 2026, Mahadev reels). Reproduce it unless the user asks otherwise.

## Style rules (approved by the user)
- **Output**: 2160x3840 (4K, 9:16), 24 fps, H.264 high CRF 17, AAC 256k. Song is the only audio.
- **AI watermark**: remove by *cropping* (never blur). Grok puts "Grok" bottom-right; on 704x1248
  sources `crop=652:1160:26:38` removes it. For other sizes/watermarks: crop a zoomed corner to find it,
  then pick a 9:16 crop that excludes it (set env `CROP=`).
- **Grade = "studio light"** (user rejected the moody/teal look): bright subject, pure black background,
  crisp detail (clarity + sharpen), warm gold highlights, soft highlight bloom, top-centre key-light mask,
  very light grain. Neutral grey skin — check for purple/green casts.
- **Titles on a BLACK screen only** (never over footage). Font Cinzel, letter-spaced, ivory small line +
  big gold line, slow fade-in with slight upward drift, lines staggered 0.35s.
  Default text: "WITH THE BLESSINGS OF / MAHADEV", "LAUNCHING NEW JOURNEY / OF THE DIVINITY",
  end card "BRAHMAROOPAM.AI". Ask if the user wants different text for a new subject.
- **Watermark**: `©brahmaroopam.ai`, tiny (12px @1080 ⇒ 24px @4K), white 45% opacity, Inter Light.
  It must *move*: a new position every ~3s with soft fades, staying inside Instagram-safe areas.
  Not shown on title cards.
- **Movie-like editing**: titles on black during the song's quiet intro/break, the footage lands
  exactly on the DROP with a short light flash and the face/hero reveal. Cut on 8-beat phrases (~3s),
  with pairs of half-phrase (~1.5s) detail cuts for energy. Every shot has an eased slow push-in or
  pull-out (alternate). Cold-open shots can fade in/out from black (`fi=` / `fo=`). Fade the last shot
  to black, then the end card on black.

## Workflow
1. **Inspect** clips: `ffprobe`; contact sheets (`fps=1,scale=176:-1,tile=15x1`) to log shots;
   scene cuts with `select='gt(scene,0.12)',showinfo`. Note dissolves — never cut inside one.
   Write a shot log: clip, start–end of each *clean* shot, content (wide/face/detail).
2. **Find the AI watermark** (zoomed crop of corners), choose `CROP`.
3. **Analyse the song**: `python3 scripts/beats.py song.mp3` → quiet sections, the drop, phrase length.
   For a long song pick a section (trim to wav with ffmpeg `-ss/-to`) — e.g. cold open → titles in the
   break → drop montage → end card. Reel length is limited by unique footage (~15s per clip).
4. **Write `shots.txt`** — compute target durations from cumulative *frame* boundaries on the beat
   grid so cuts don't drift (see a generator example below). `BLACK <dur>` lines make title space.
   Line format: `<clip> <start> <srclen> <target> <in|out> [fi=0.6] [fo=0.6] [label]`
   (srclen < target ⇒ gentle slow-mo; keep ≥ 0.75x speed).
5. **Write `titles.json`**:
   ```json
   {"cards":[{"t0":0.5,"t1":3.35,"lines":[["WITH THE BLESSINGS OF",30,"ivory"],["MAHADEV",84,"gold"]]},
             {"t0":3.6,"t1":6.6,"fade_out":0.45,"lines":[["LAUNCHING NEW JOURNEY",32,"ivory"],["OF THE DIVINITY",58,"gold"]]},
             {"t0":22.7,"t1":24.71,"fade_in":1.0,"fade_out":0.5,"lines":[["BRAHMAROOPAM.AI",64,"gold"]]}],
    "watermark":{"text":"©brahmaroopam.ai","size":12,"alpha":0.45,
                 "times":[[6.73,9.73,12.73,15.73,18.73,22.0]]}}
   ```
   (sizes are @1080 and auto-scale; `times` = groups of switch points, watermark only during footage;
   optional top-level `"fade_out":[start,dur]` fades everything to black.)
6. **Render**: `FLASH=<drop sec> bash scripts/reel.sh shots.txt titles.json song.mp3 out.mp4 workdir`
   (4K takes ~7 min per 25s on 4 cores; run in background). `SKIP_SEGS=1` re-grades without rebuilding
   shots. Preview first at 1080 with `OW=1080 OH=1920` if iterating on the look.
7. **QA before sending**: extract frames (titles, drop, each shot, end card), check: no AI watermark,
   no colour cast, titles legible, watermark small and moving, audio ends cleanly.
8. Send with SendUserFile; explain the timeline in a short table.

## Gotchas learned
- `eq` (and some other filters) output YUV. Any `blend` must get `format=gbrp` *immediately* before it,
  else screen/multiply blends tint everything purple or green. Masks must be generated as rgb24, not gray.
- `unsharp` matrix max is 13 (lx/2+ly/2)*2 ≤ 25.
- `tile`/`hstack` previews can mislead — verify colours on a single full frame.
- Never edit `reel.sh` while a render using it is running (bash reads scripts lazily) — copy it first.
- Cinzel is a variable font; freetype uses Regular — fake weight with `borderw` in the same colour.
- 4K here is an upscale of ~704x1248 AI clips: say so honestly; detail can't be invented.

## Example beat-grid generator (python)
```python
P=8*beat; FPS=24; f=0; t=start
for clip,st,avail,units,dirn,extra,label in shots:   # units: 1 = phrase, 0.5 = half
    t+=units*P; nf=round(t*FPS)-f; f+=nf; tgt=nf/FPS
    print(f"{clip} {st} {min(avail,tgt):.3f} {tgt:.4f} {dirn} {extra} {label}")
```
