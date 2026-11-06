"""Build the HyperFrames project for 'Why 24 hours' from lines.json + narration.

Writes: timeline.json, compositions/story.html (canvas illustration scenes),
compositions/captions.html, compositions/leak-N.html, index.html (hosts + audio).
"""
import json, re, html

FPS = 30
L = json.load(open('lines.json'))

# ---------- timeline: calm pacing ----------
IN_SCENE, NEW_SCENE = 0.35, 0.7
PAUSE = {3: 0.5, 4: 1.6, 10: 1.2, 15: 1.0, 20: 0.9, 25: 0.8}   # dramatic pauses after these lines
t = 0.5
for i, l in enumerate(L):
    l['start'] = round(t, 3)
    l['pause'] = PAUSE.get(l['id'], 0)
    nxt = L[i + 1]['scene'] if i + 1 < len(L) else None
    t += l['dur'] + l['pause'] + (2.8 if nxt is None else IN_SCENE if nxt == l['scene'] else NEW_SCENE)
TOTAL = round(t, 2)
json.dump({'lines': L, 'total': TOTAL}, open('timeline.json', 'w'), ensure_ascii=False, indent=1)
end = lambda l: l['start'] + l['dur']
cut = lambda l: l['start'] - 0.08           # scene cut time (matches story render)

# ---------- story composition (canvas scenes, driven by hf-seek) ----------
kit = open('../kit/kit.js').read().replace("getElementById('c')", "getElementById('story-canvas')")
src = open('../why-24-hours/index.html').read()
scenes = src.split('<script>')[1].split('</script>')[0]
scenes = scenes.split('window.init=')[0]
scenes = scenes.replace("    caption(Ls[i],t,CAPY[sc]);}", "    }")      # captions now live in HyperFrames
js = (kit + scenes)
js = re.sub(r"px M(['`])", r"px Montserrat\1", js)
js = js.replace("${w} ${size}px M`", "${w} ${size}px Montserrat`")
assert 'caption(Ls[i]' not in js
story = f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; background: #000; }}
    #story-canvas {{ position: absolute; inset: 0; width: 100%; height: 100%; }}
  </style>
  <div id="root" data-composition-id="story" data-width="1080" data-height="1920" data-duration="{TOTAL}" data-layout-ignore>
    <canvas id="story-canvas" width="1080" height="1920"></canvas>
  </div>
  <script>
{js}
    TL = {json.dumps({'lines': L, 'total': TOTAL}, ensure_ascii=False)};
    makeGrain();
    LOGO = new Image(); LOGO.src = 'assets/logo.png';
    const ready = Promise.all([LOGO.decode(), ...['500 20px Montserrat','700 20px Montserrat','800 20px Montserrat'].map(f => document.fonts.load(f))])
      .then(() => window.render(0, 0));
    window.__hf = window.__hf || {{}}; window.__hf.buildReady = window.__hf.buildReady || {{}};
    window.__hf.buildReady['story'] = ready;
    window.addEventListener('hf-seek', e => window.render(e.detail.time, Math.round(e.detail.time * {FPS})));
  </script>
</template>
"""
open('compositions/story.html', 'w').write(story)

# ---------- captions: calm groups of 4-6 words, blur-in per word ----------
KEY = {'interesting', '24', 'hours', '12,', '20', '30', 'kyun', 'civilizations', 'egypt', 'sundials', '12', '24-hour',
       'babylon.', 'base-60', 'influence', '60', 'twist', 'equal', 'length', 'mechanical', 'equal-length', 'watch',
       'ghadi', 'legacy', 'sawaal', 'stories.'}
TOP = {'earth': 450, 'desert': 400, 'sundial': 400, 'babylon': 400, 'tower': 400, 'seasons': 470}
def groups(text):
    w = text.split(); out = []; cur = []
    for x in w:
        cur.append(x)
        if len(cur) >= 5 or (len(cur) >= 3 and re.search(r'[,.?!…]$', x)):
            out.append(cur); cur = []
    if cur:
        if out and len(cur) <= 2: out[-1] += cur
        else: out.append(cur)
    return out
cap_html, cap_js, gid = [], [], 0
for l in L:
    if l['scene'] == 'end':
        continue
    gs = groups(l['cap']); tot = sum(len(' '.join(g)) + 1 for g in gs); acc = 0
    for gi, g in enumerate(gs):
        s = l['start'] + l['dur'] * acc / tot
        acc += len(' '.join(g)) + 1
        e = l['start'] + l['dur'] * acc / tot + (-0.02 if gi < len(gs) - 1 else 0.45 + l['pause'] * 0.6)
        s = round(max(0.15, s - (0.06 if gi == 0 else -0.02)), 3); e = round(e, 3)
        top = TOP.get(l['scene'], 300)
        spans = ''.join(f'<span class="w{" k" if x.lower().strip("…") in KEY else ""}">{html.escape(x)}</span> ' for x in g)
        cap_html.append(f'    <div id="cg{gid}" class="cg" style="top:{top}px">{spans.strip()}</div>')
        cap_js.append(f"  word('#cg{gid}', {s}, {e});")
        gid += 1
captions = f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; }}
    .cg {{ position: absolute; left: 90px; right: 90px; text-align: center; opacity: 0; visibility: hidden;
          font-family: Montserrat, sans-serif; font-weight: 700; font-size: 62px; line-height: 1.22; color: #f6f1e8;
          text-shadow: 0 4px 24px rgba(0,0,0,.75), 0 1px 3px rgba(0,0,0,.9); overflow: visible; }}
    .cg .w {{ display: inline-block; }}
    .cg .k {{ color: #f39a3d; text-shadow: 0 0 22px rgba(240,124,30,.55), 0 4px 24px rgba(0,0,0,.75); }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-duration="{TOTAL}">
{chr(10).join(cap_html)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    function word(sel, s, e) {{
      const g = document.querySelector(sel), ws = g.querySelectorAll('.w');
      tl.set(g, {{ opacity: 1, visibility: 'visible' }}, s);
      ws.forEach((w, i) => tl.fromTo(w, {{ opacity: 0, filter: 'blur(8px)', y: 10 }},
        {{ opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.32, ease: 'expo.out' }}, s + i * 0.09));
      tl.to(g, {{ opacity: 0, filter: 'blur(6px)', duration: 0.18, ease: 'power2.in' }}, e - 0.18);
      tl.set(g, {{ opacity: 0, visibility: 'hidden' }}, e);
    }}
{chr(10).join(cap_js)}
    tl.to({{}}, {{ duration: {TOTAL} }}, 0);
    window.__timelines['captions'] = tl;
  </script>
</template>
"""
open('compositions/captions.html', 'w').write(captions)

# ---------- light-leak transitions at era changes ----------
leak_src = open('compositions/organic-light-leak-overlay.html').read()
ERA = ['desert', 'babylon', 'tower', 'legacy']
leaks = []
for n, l in enumerate([l for l in L if l['scene'] in ERA and (L.index(l) == 0 or L[L.index(l) - 1]['scene'] != l['scene'])]):
    cid = f'leak{n}'
    open(f'compositions/{cid}.html', 'w').write(
        leak_src.replace('organic-light-leak-overlay', cid).replace('data-width="1920"', 'data-width="1080"').replace('data-height="1080"', 'data-height="1920"'))
    leaks.append(f'      <div id="{cid}" class="clip" data-composition-id="{cid}" data-composition-src="compositions/{cid}.html" '
                 f'data-start="{round(cut(l) - 0.9, 3)}" data-duration="2.4" data-width="1080" data-height="1920" '
                 f'data-track-index="2" data-track-kind="graphics" style="z-index:2"></div>')

# ---------- audio: narration + SFX (peaks aligned one frame after the picture) ----------
PEAK = {'whoosh-cinematic': 2.50, 'impact-bass-1': 0.07, 'impact-bass-2': 0.13, 'riser': 3.04,
        'whoosh': 0.16, 'whoosh-short': 0.16, 'click-soft': 0.07}
aud = []
import subprocess
DUR = {n: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'assets/sfx/{n}.mp3'])) for n in PEAK}
CUT = {'riser': 3.3}
lanes = []                                         # end time per SFX track lane
def lane(s, e):
    for i, le in enumerate(lanes):
        if le <= s: lanes[i] = e; return 5 + i
    lanes.append(e); return 5 + len(lanes) - 1
def sfx(name, at, vol, media_start=None):
    s = round(at - PEAK[name] + 1 / FPS, 3)
    ms = ''
    if s < 0:
        ms = f' data-media-start="{round(-s, 3)}"'; s = 0
    if media_start is not None:
        ms = f' data-media-start="{media_start}"'
    off = float(ms.split('"')[1]) if ms else 0
    d = round(min(DUR[name] - off, CUT.get(name, 99) - off), 3)
    fo = ' data-fade-out="0.3"' if name in CUT else ''
    aud.append(f'      <audio id="sfx{len(aud)}" src="assets/sfx/{name}.mp3" data-start="{s}" data-duration="{d}" data-volume="{vol}"{ms}{fo} data-track-index="{lane(s, s + d)}"></audio>')
for l in L:
    aud.append(f'      <audio id="vo{l["id"]:02d}" src="assets/vo/{l["id"]:02d}.wav" data-start="{l["start"]}" data-duration="{l["dur"]}" data-volume="1" data-track-index="4"></audio>')
byid = {l['id']: l for l in L}
# hook: soft clock ticks every second that stop dead at the question, riser under it, then a deep impact
k = 0.4
while k < end(byid[4]) - 0.2:
    sfx('click-soft', k, 0.55); k += 1.0
sfx('riser', end(byid[4]), 0.35)
sfx('impact-bass-1', end(byid[4]) + 0.08, 0.85)
# scene cuts: whoosh variants; era changes get the cinematic whoosh
rot = ['whoosh', 'whoosh-short']
for i, l in enumerate(L[1:], 1):
    if l['scene'] != L[i - 1]['scene'] and l['scene'] != 'end':
        if l['scene'] in ERA: sfx('whoosh-cinematic', cut(l), 0.5)
        else: sfx(rot[i % 2], cut(l), 0.3)
sfx('impact-bass-2', end(byid[10]) + 0.08, 0.75)      # "Ancient Babylon."
sfx('impact-bass-1', end(byid[15]) + 0.06, 0.5)       # "twist"
sfx('impact-bass-2', end(byid[20]) + 0.1, 0.3)        # soft thud in the "agli baar" pause
for l in L:                                           # ticking under the clock and clock-tower scenes
    if l['scene'] in ('clock', 'tower'):
        k = l['start']
        while k < end(l):
            sfx('click-soft', k, 0.35 if l['scene'] == 'clock' else 0.28); k += 1.0 if l['scene'] == 'clock' else 0.5
logo = byid[25]['start'] - 0.1
sfx('riser', logo, 0.3)
sfx('impact-bass-2', logo + 0.05, 0.8)

index = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/js/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #000; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">
      <div id="story" class="clip" data-composition-id="story" data-composition-src="compositions/story.html" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920" data-track-index="1" data-track-kind="graphics" style="z-index:1"></div>
{chr(10).join(leaks)}
      <div id="captions" class="clip" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920" data-track-index="3" data-track-kind="captions" style="z-index:3"></div>
{chr(10).join(aud)}
    </div>
    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});
      tl.to({{}}, {{ duration: {TOTAL} }}, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
open('index.html', 'w').write(index)
print('total', TOTAL, 'caption groups', gid, 'leaks', len(leaks), 'audio clips', len(aud))
