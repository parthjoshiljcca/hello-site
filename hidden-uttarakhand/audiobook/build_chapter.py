# Builds one chapter of the Hindi audiobook: splits the text into narration and dialogue, voices each
# piece with Sarvam (the narrator, and each character in their own voice), lays them on a timeline with
# acted pauses, then scores it: ambience and music beds per scene, effects at their moments, the music
# ducked under the voices, a signature theme at the top and tail, mastered to audiobook loudness.
#
#   python3 build_chapter.py prologue ch1 ...   -> out/<name>.mp3 (and out/<name>.json with timings)
import importlib
import json
import os
import re
import subprocess
import sys

import numpy as np
import soundfile as sf

import sound as S
from tts import SR, speak

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, 'out')

# One storyteller voice for everything (the author's choice): characters are told apart only by how the
# lines are delivered (pace, force and the pauses around them), never by changing the voice or its pitch.
NARRATOR = dict(voice='shubh_hi_stories_dramatic', pace=1.0, temp=1.0)   # between brisk and slow: every line lands
_V = NARRATOR['voice']
VOICES = {   # no loudness or pitch changes: those made Gabbar and Golu sound put-on. Only a touch of pace.
    'narrator': NARRATOR,
    'shaoni': dict(voice=_V, pace=1.02, temp=1.0),
    'kshitij': dict(voice=_V, pace=.98, temp=.9),
    'gabbar': dict(voice=_V, pace=1.0, temp=1.0),
    'golu': dict(voice=_V, pace=1.05, temp=1.0),
    'rohan': dict(voice=_V, pace=.98, temp=1.0),
    'bhalla': dict(voice=_V, pace=.98, temp=1.0),
    'mummy': dict(voice=_V, pace=1.0, temp=1.0),
    'waiter': dict(voice=_V, pace=1.0, temp=1.0),
    'bachiram': dict(voice=_V, pace=.96, temp=1.0),                 # ninety-one, unhurried
    'stranger': dict(voice=_V, pace=.98, temp=1.0),
    'umesh': dict(voice=_V, pace=1.02, temp=1.0),                   # the cheerful purohit at Kedarnath
    'forest': dict(voice=_V, pace=.7, temp=1.0, fx='forest'),       # the call from the trees: same voice, far off
}
GAP_IN, GAP_PARA, GAP_SCENE = .2, .45, 1.5
BEAT = .25   # extra breath around a short, heavy paragraph ("मैं मुड़ा।", "भाप।")
# how numbers and abbreviations are spoken; the text keeps its own spelling
SAY = [('5:40 बजे', 'पाँच-चालीस बजे'), ('Rs 100', 'सौ रुपये'), ('1911', 'उन्नीस सौ ग्यारह'), ('1902', 'उन्नीस सौ दो'),
       ('19 सितंबर', 'उन्नीस सितंबर'), ('रूम 112', 'रूम एक सौ बारह'), ('2:14 बजे', 'दो बजकर चौदह मिनट पर'),
       ('12 लाख', 'बारह लाख'), ('1966', 'उन्नीस सौ छियासठ'), ('एनडी-65', 'एन डी पैंसठ'), ('यूनिट 4', 'यूनिट चार'),
       ('दिन 1,', 'दिन एक,'), ('डे 0', 'डे ज़ीरो')]


def spoken(text):
    for a, b in SAY:
        text = text.replace(a, b)
    if re.search(r'[0-9]', text):
        raise SystemExit(f'add a spoken form for the number in: {text[:80]}')
    return text


def tighten(a, longest=.45, keep=.32, db=-38):
    """Shorten every silence inside a take that runs longer than `longest` seconds down to `keep`:
    the voice sometimes stops for a second or more at a '…', which drags."""
    w = int(.02 * SR)
    n = len(a) // w
    if n < 3:
        return a
    frames = np.sqrt((a[:n * w].reshape(n, w) ** 2).mean(1))
    quiet = frames < 10 ** (db / 20) * max(1e-6, np.abs(a).max())
    out, i = [], 0
    while i < n:
        j = i
        while j < n and quiet[j] == quiet[i]:
            j += 1
        seg = a[i * w:j * w]
        if quiet[i] and (j - i) * w > longest * SR:
            h = int(keep * SR / 2)
            seg = np.concatenate([seg[:h] * np.linspace(1, 0, h), seg[-h:] * np.linspace(0, 1, h)])
        out.append(seg)
        i = j
    out.append(a[n * w:])
    return np.concatenate(out).astype(np.float32)


def trim(a, db=-42):
    thr = 10 ** (db / 20) * max(1e-6, np.abs(a).max())
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 600):idx[-1] + 2400] if len(idx) else a


def fx(a, kind):
    if kind == 'phone':
        y = S.band(a, 320, 3300, 3)
        return np.tanh(y * 3 / max(1e-6, np.abs(y).max())) * .45
    if kind == 'forest':
        y = S.band(a, 250, 2600) * .5
        return S.reverb(S.st(y, -.5), 3.5, .75)          # stereo, far off to the left
    return a


def clean(s, quote=False):
    s = s.strip()
    s = re.sub(r'\s*—\s*', ', ', s)
    if quote:
        s = re.sub(r'[,،]\s*$', '।', s)
    s = re.sub(r'^[,।\s]+', '', s)
    s = re.sub(r'।\s*,\s*', '। ', s)
    return s


def read_script(path):
    """The chapter script: paragraphs, '###' scene breaks, and '## ...' directives for the next paragraph
    (bed:<scene>, sfx:<effect>, song, diary, voice:<who>). Returns (paragraphs, {index: [directives]})."""
    paras, marks, pending = [], {}, []
    for line in open(path, encoding='utf-8').read().split('\n'):
        if line.startswith('## '):
            pending.append(line[3:].strip()); continue
        if not line.strip():
            continue
        if pending:
            marks[len(paras)] = pending; pending = []
        paras.append(line)
    return paras, marks


def segments(paras, marks):
    """[(para index, speaker, text, kind)]; quotes carry their speaker as "{who}...", {p} being the narrator."""
    out, diary = [], False
    for i, p in enumerate(paras):
        m = marks.get(i, [])
        if p.strip() == '###':
            out.append((i, None, None, 'break')); continue
        if 'diary' in m:
            out.append((i, 'narrator', clean(p), 'line')); diary = True; continue
        if diary:
            out.append((i, 'kshitij', clean(p), 'line')); continue
        v = next((d[6:] for d in m if d.startswith('voice:')), None)
        if v:
            out.append((i, v, clean(p), 'line')); continue
        if 'song' in m:
            out.append((i, 'narrator', clean(p).rstrip(',…') + '…', 'song')); continue
        pos = 0
        for q in re.finditer(r'"([^"]+)"', p):
            if clean(p[pos:q.start()]):
                out.append((i, 'narrator', clean(p[pos:q.start()]), 'line'))
            tag = re.match(r'\{(\w+)\}', q.group(1))
            if not tag:
                raise SystemExit(f'quote without a {{speaker}} in paragraph {i}: "{q.group(1)[:50]}"')
            who = 'narrator' if tag.group(1) == 'p' else tag.group(1)
            if who not in VOICES:
                raise SystemExit(f'unknown speaker {who} in paragraph {i}')
            out.append((i, who, clean(q.group(1)[tag.end():], quote=True), 'line'))
            pos = q.end()
        if clean(p[pos:]):
            out.append((i, 'narrator', clean(p[pos:]), 'line'))
    return out


def voice(seg):
    i, who, text, kind = seg
    v = VOICES[who]
    pace = v['pace'] * (.9 if kind == 'song' else 1)
    a = tighten(trim(speak(spoken(text), v['voice'], round(pace, 2), v.get('temp'), 0.0, v.get('loud', 1.0))))
    a = fx(a, v.get('fx'))
    return a if a.ndim == 2 else S.st(a)


# ---- music
def theme(sec=14.0):
    """Signature theme: the shepherd tune on a bansuri over a drone, with frame drum."""
    out = np.zeros((int(sec * SR), 2), np.float32)
    S.place(out, S.st(S.drone(sec, (50, 57, 62), 1100) * .32), 0)
    fl = S.reverb(S.st(S.flute(S.SHEPHERD, 76) * .55, .15), 2.8, .38)
    S.place(out, fl, 1.2)
    for k in range(int((sec - 2) / 1.6)):
        S.place(out, S.st(S.drum('low') * .5), 1.2 + k * 1.6)
        S.place(out, S.st(S.drum('high') * .18, .3), 1.2 + k * 1.6 + .8)
    return S.fade(out, 1.0, 2.5)


def bed(name, sec):
    """A scene's background, music only: (ambience, music). The noise-built ambiences (crowd, wind, fire,
    pencil, engine rumble, room tone) were taken out: under the voice they read as scraping."""
    z = lambda: np.zeros((int(sec * SR), 2), np.float32)
    amb, mus = z(), z()
    if name == 'campfire':
        amb += S.crickets(sec, .35) * .6
        mus += S.st(S.drone(sec, (38, 45, 50), 500) * .26)
    elif name == 'stillness':
        mus += S.st(S.drone(sec, (38, 45), 400) * .2)
    elif name == 'airport':
        for k in range(int(sec / 2.4)):
            S.place(mus, S.st(S.pluck([62, 66, 69, 71, 69, 66][k % 6], 1.4) * .2, -.3 + .1 * (k % 6)), k * 2.4)
    elif name == 'outdoor':
        amb += S.birds(sec, .35) * .8
        for k in range(int(sec / 3.2)):
            S.place(mus, S.st(S.pluck([67, 71, 74][k % 3], 1.8) * .12, .2), k * 3.2)
    elif name == 'drive':
        mus += S.st(S.drone(sec, (50, 57, 62), 900) * .16)
        fl = S.reverb(S.st(S.flute(S.SHEPHERD, 70) * .32, .2), 2.4, .35)
        S.place(mus, fl, 3.0)
        if sec > 40:
            S.place(mus, fl * .8, sec * .55)
    elif name == 'lobby':
        mus += S.st(S.drone(sec, (52, 59, 64), 800) * .1)
        for k in range(int(sec / 5)):
            S.place(mus, S.st(S.pluck([76, 74, 71, 69][k % 4], 2.2) * .1, -.2), 1 + k * 5)
    elif name == 'dining':
        for k in range(int(sec / 4)):
            S.place(mus, S.st(S.pluck([62, 66, 69, 74, 69, 66][k % 6], 2.4) * .11, (k % 3 - 1) * .3), k * 4)
    elif name == 'mystery':
        mus += S.st(S.drone(sec, (45, 52, 57), 700) * .24) + S.st(S.strings(sec, (45, 52), 1200) * .14)
        for k in range(int(sec / 6)):
            S.place(mus, S.st(S.bell(81, 4) * .1, .4), 2 + k * 6)
    elif name == 'night':
        mus += S.st(S.drone(sec, (41, 48), 450) * .2)
        for k in range(int(sec / 7)):
            S.place(mus, S.st(S.bell(77, 5) * .05, -.4), 3 + k * 7)
    elif name == 'tension':
        mus += S.st(S.heartbeat(sec, 74) * .8) + S.st(S.strings(sec, (40, 47, 52), 1700) * .32)
    elif name == 'breakfast':
        amb += S.birds(sec, .45) * .8
        for k in range(int(sec / 3)):
            S.place(mus, S.st(S.pluck([67, 71, 74, 72][k % 4], 1.4) * .13, .2), k * 3)
    elif name == 'suspense':
        mus += S.st(S.drone(sec, (43, 50, 55), 650) * .24) + S.st(S.strings(sec, (43, 50), 1100) * .14)
    elif name == 'diary':
        for k in range(int(sec / 4)):
            S.place(mus, S.st(S.pluck([62, 69, 66, 64][k % 4], 2.0) * .12, -.2), k * 4)
        mus += S.st(S.drone(sec, (50, 57), 600) * .09)
    elif name == 'roadday':
        mus += S.st(S.drone(sec, (50, 57), 800) * .16)
        for k in range(int(sec / 2.0)):
            S.place(mus, S.st(S.pluck([50, 57][k % 2], 1.2) * .1, -.2), k * 2.0)
    elif name == 'roadnight':
        mus += S.st(S.drone(sec, (45, 52), 600) * .2) + S.st(S.strings(sec, (45, 52), 1000) * .1)
    elif name == 'lore':
        mus += S.st(S.drone(sec, (38, 45), 500) * .24)
        for k in range(int(sec / 3.2)):
            S.place(mus, S.st(S.drum('low') * .32), k * 3.2)
        for k in range(int(sec / 9)):
            S.place(mus, S.reverb(S.st(S.bell(74, 4) * .09, .3), 2.6, .5), 4 + k * 9)
    elif name == 'chase':
        mus += S.st(S.heartbeat(sec, 104) * .9) + S.st(S.strings(sec, (40, 47, 52), 1800) * .34)
        for k in range(int(sec / .58)):
            S.place(mus, S.st(S.drum('high' if k % 4 == 2 else 'low') * (.25 if k % 4 == 2 else .4)), k * .58)
    elif name == 'ghat':
        mus += S.st(S.drone(sec, (40, 47), 450) * .26) + S.st(S.strings(sec, (40, 47), 900) * .1)
        for k in range(int(sec / 8)):
            S.place(mus, S.reverb(S.st(S.bell(64, 5) * .07, -.3), 3.0, .55), 2 + k * 8)
    elif name == 'dhaba':
        mus += S.st(S.drone(sec, (50, 57, 62), 900) * .12)
        for k in range(int(sec / 3.6)):
            S.place(mus, S.st(S.pluck([62, 66, 69, 66][k % 4], 2.2) * .1, .15), k * 3.6)
    elif name == 'golu':
        for k in range(int(sec / 1.5)):
            S.place(mus, S.st(S.pluck([72, 76, 79, 76, 74, 71][k % 6], .9) * .1, (k % 2) * .4 - .2), k * 1.5)
    elif name == 'morning':
        amb += S.birds(sec, .3) * .7
        for k in range(int(sec / 3.4)):
            S.place(mus, S.st(S.pluck([62, 66, 69, 71][k % 4], 1.8) * .11, -.1), k * 3.4)
    elif name == 'legend':
        mus += S.st(S.drone(sec, (45, 52, 57), 700) * .2)
        fl = S.reverb(S.st(S.flute(S.SHEPHERD, 60) * .22, -.2), 2.8, .45)
        S.place(mus, fl, 4.0)
        for k in range(int(sec / 4.8)):
            S.place(mus, S.st(S.drum('low') * .22), 2 + k * 4.8)
    elif name == 'village':
        amb += S.birds(sec, .25) * .6
        mus += S.st(S.drone(sec, (50, 57, 62), 900) * .1)
        for k in range(int(sec / 2.8)):
            S.place(mus, S.st(S.pluck([62, 64, 66, 69, 66, 64][k % 6], 1.6) * .1, .2), k * 2.8)
    elif name == 'porch':
        mus += S.st(S.drone(sec, (43, 50, 55), 600) * .18) + S.st(S.strings(sec, (43, 50), 900) * .08)
    elif name == 'discovery':
        mus += S.st(S.strings(sec, (50, 57, 62, 66), 1600) * .22) + S.st(S.drone(sec, (50, 57), 700) * .12)
        for k in range(int(sec / 1.2)):
            S.place(mus, S.st(S.pluck([74, 81][k % 2], .8) * .07, .3), k * 1.2)
    elif name == 'temple':
        mus += S.st(S.drone(sec, (48, 55, 60), 700) * .18)
        for k in range(int(sec / 10)):
            S.place(mus, S.temple_bell() * .25, 3 + k * 10)
    elif name == 'threat':
        mus += S.st(S.drone(sec, (41, 48), 500) * .24) + S.st(S.strings(sec, (41, 48, 53), 1200) * .18)
        mus += S.st(S.heartbeat(sec, 66) * .45)
    elif name == 'heroic':
        mus += S.st(S.drone(sec, (45, 52, 57), 800) * .16) + S.st(S.strings(sec, (45, 52, 57), 1500) * .14)
        for k in range(int(sec / 1.6)):
            S.place(mus, S.st(S.drum('low') * (.3 if k % 2 == 0 else .18)), k * 1.6)
        fl = S.reverb(S.st(S.flute(S.SHEPHERD, 64) * .2, .2), 2.6, .4)
        S.place(mus, fl, 6.0)
    elif name == 'trek':
        amb += S.birds(sec, .2) * .5
        for k in range(int(sec / 1.8)):
            S.place(mus, S.st(S.pluck([57, 62, 64, 62][k % 4], 1.2) * .09, (k % 2) * .3 - .15), k * 1.8)
        mus += S.st(S.drone(sec, (50, 57), 800) * .08)
    elif name == 'kedar':
        mus += S.st(S.drone(sec, (43, 50, 55, 62), 900) * .2) + S.st(S.strings(sec, (43, 50, 55, 59), 1600) * .16)
        for k in range(int(sec / 9)):
            S.place(mus, S.temple_bell() * .22, 4 + k * 9)
    elif name == 'bahi':
        mus += S.st(S.drone(sec, (48, 55), 650) * .16)
        for k in range(int(sec / 5)):
            S.place(mus, S.st(S.pluck([67, 70, 74][k % 3], 2.4) * .08, -.25), 1.5 + k * 5)
    elif name == 'fog':
        mus += S.st(S.drone(sec, (39, 46), 420) * .26) + S.st(S.heartbeat(sec, 60) * .4)
        for k in range(int(sec / 11)):
            S.place(mus, S.reverb(S.st(S.bell(70, 5) * .06, .5), 3.2, .6), 5 + k * 11)
    elif name == 'caper':
        for k in range(int(sec / 1.4)):
            S.place(mus, S.st(S.pluck([69, 72, 76, 72, 74, 71][k % 6], .9) * .09, (k % 3 - 1) * .35), k * 1.4)
        mus += S.st(S.drone(sec, (45, 52), 700) * .08)
    else:
        raise SystemExit(f'unknown bed {name}')
    return amb, mus


def sfx(name, voice_cache):
    if name == 'bonnet': return S.thump(.6) * .7
    if name == 'boot': return S.slam() * .8
    if name == 'horn': return S.horn()
    if name == 'golu': return S.whoosh(.8) * 1.5 + S.st(S.pluck(84, .8) * .15)
    if name == 'phonering': return S.phone_ring()
    if name == 'cooker': return S.cooker()
    if name == 'sting': return S.sting() * .55
    if name == 'sting_light': return S.sting_light() * .7
    if name == 'flute': return S.reverb(S.st(S.band(S.flute(S.SHEPHERD, 68), 250, 3500) * .32, .4), 2.4, .4)
    if name == 'crash': return S.crash() * 1.1
    if name == 'run': return S.footsteps(3.5, 4.5, .45) * .9
    if name == 'whoosh': return S.whoosh(.9) * 1.2
    if name == 'door': return S.door() * .8
    if name == 'suv': return S.st(S.band(S.engine(9, 750, 0)[:, 0], 30, 200)) * S.env(9 * SR, 1.5, 2.5)[:, None] * 1.2
    if name == 'heartbeat': return S.st(S.heartbeat(22, 64) * .6)
    if name == 'creak': return S.creak()
    if name == 'steps_slow': return S.steps_slow()
    if name == 'flash': return S.flash()
    if name == 'thud': return S.slam() * .9
    if name == 'plane': return S.plane()
    if name == 'chime': return S.chime() * .8
    if name == 'carstart': return S.carstart() * .9
    if name == 'cardoor': return S.cardoor() * .8
    if name == 'zip': return S.zip_() * 1.2
    if name == 'page': return S.page() * 1.4
    if name == 'keys': return S.keys() * 1.3
    if name == 'skid': return S.skid()
    if name == 'bell': return S.temple_bell() * .8
    if name == 'firepop': return S.firepop()
    if name == 'drumhit': return S.reverb(S.st(S.drum('low') * 1.2), 2.4, .4) + S.reverb(S.st(S.drum('low') * .9), 2.4, .4)
    if name == 'ping': return S.ping()
    if name == 'phonevideo': return voice_cache['phonevideo']
    if name == 'call_far': return voice_cache['forest'] * .55
    if name == 'call_parth': return voice_cache['parth'] * .8
    raise SystemExit(f'unknown sfx {name}')


def duck(voice_track, depth):
    e = np.abs(voice_track).mean(1)
    w = int(.25 * SR)
    k = np.ones(w, np.float32) / w
    e = np.convolve(e, k, 'same')
    e = np.convolve(e, k, 'same')
    g = 1 - depth * np.clip(e / (np.percentile(e[e > 1e-4], 60) + 1e-9), 0, 1)
    return g[:, None].astype(np.float32)


def build(name):
    ch = importlib.import_module(f'chapters.{name}')
    paras, marks = read_script(os.path.join(DIR, 'text', f'{name}.txt'))
    segs = segments(paras, marks)
    cues = [(i, d) for i, ds in sorted(marks.items()) for d in ds if d.startswith(('bed:', 'sfx:'))]
    print(f'{name}: {len(segs)} segments, {sum(len(s[2] or "") for s in segs)} characters')

    # the voice timeline
    pieces, para_at, t = [], {}, 0.0
    intro = theme(14.0)
    # the book's own names, as on the cover and in the contents (spelt in Devanagari only so the voice says them in English)
    head = [('narrator', 'हिडन उत्तराखंड।'), ('narrator', 'अ बुक बाय, पार्थ डी. जोशी।'), ('narrator', ch.TITLE)]
    if ch.DAY:
        head.append(('narrator', ch.DAY))
    t = 5.5
    for who, text in head:
        a = trim(speak(text, VOICES[who]['voice'], .92, 1.0))
        pieces.append((t, S.st(a))); t += len(a) / SR + .55
    t = max(t + 1.0, 14.0)
    last, last_short = None, False
    for seg in segs:
        i, who, text, kind = seg
        if kind == 'break':
            t += GAP_SCENE; last = None; continue
        short = kind == 'line' and len(paras[i].strip()) <= 28 and '"' not in paras[i]
        if last is not None:
            t += GAP_IN if last == i else GAP_PARA + (BEAT if short or last_short else 0)
        last_short = short and last != i
        para_at.setdefault(i, t)
        a = voice(seg)
        pieces.append((t, a))
        t += len(a) / SR
        last = i
    total = t + 9.0
    n = int(total * SR)
    vtrack = np.zeros((n, 2), np.float32)
    for at, a in pieces:
        S.place(vtrack, a, at)

    # scenes and effects, placed by paragraph
    def at_para(i):
        if i not in para_at:
            raise SystemExit(f'cue on paragraph {i}, which has no voice')
        return para_at[i]
    amb, mus = np.zeros((n, 2), np.float32), np.zeros((n, 2), np.float32)
    S.place(mus, intro, 0)
    beds = [(at_para(i), c[4:]) for i, c in cues if c.startswith('bed:')]
    beds.sort()
    for k, (start, b) in enumerate(beds):
        start = max(0, start - 1.2)
        end = beds[k + 1][0] + .6 if k + 1 < len(beds) else total - 6
        a, m = bed(b, end - start)
        S.place(amb, S.fade(a, 1.5, 1.8), start)
        S.place(mus, S.fade(m, 2.0, 2.2), start)
    cache = {'forest': fx(trim(speak('क्षि…तिज…', VOICES['forest']['voice'], .7, 1.0)), 'forest'),
             'parth': fx(trim(speak('पा…र्थ…', VOICES['forest']['voice'], .7, 1.0)), 'forest')}
    if any(c == 'sfx:phonevideo' for _, c in cues):   # Golu's video played out of a phone, across the ghat
        v = trim(speak('घोस्ट फ़ैमिली… वो देखो… सफ़ेद साया…', VOICES['golu']['voice'], 1.0, 1.0))
        v = S.band(v, 500, 3200, 3)
        cache['phonevideo'] = S.reverb(S.st(np.tanh(v * 3 / np.abs(v).max()) * .3, -.35), 2.2, .45)
    sfxt = np.zeros((n, 2), np.float32)
    for i, c in cues:
        if c.startswith('sfx:'):
            S.place(sfxt, sfx(c[4:], cache), at_para(i) - .15)
    S.place(mus, theme(14.0) * .9, total - 13.5)
    # after every reveal (a sting), the beds drop away for a held breath, then come back
    dip = np.ones(n, np.float32)
    for i, c in cues:
        if c in ('sfx:sting', 'sfx:crash'):
            a0 = int((at_para(i) + .3) * SR)
            shape = np.concatenate([np.linspace(1, .12, int(.25 * SR)), np.full(int(1.6 * SR), .12), np.linspace(.12, 1, int(1.2 * SR))])
            seg = dip[a0:a0 + len(shape)]
            dip[a0:a0 + len(shape)] = np.minimum(seg, shape[:len(seg)])
    amb *= dip[:, None]
    mus *= dip[:, None]

    mix = vtrack * 1.0 + amb * duck(vtrack, .35) * .55 + mus * duck(vtrack, .6) * .8 + sfxt * duck(vtrack, .25) * .8
    os.makedirs(OUT, exist_ok=True)
    wav = os.path.join(OUT, f'{name}.wav')
    sf.write(wav, mix / max(1.0, np.abs(mix).max() * 1.05), SR)
    mp3 = os.path.join(OUT, f'{name}.mp3')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-18:LRA=11:TP=-2',
                    '-ar', '48000', '-b:a', '192k', mp3], check=True)
    os.remove(wav)
    json.dump({'duration': total, 'paragraphs': {str(k): round(v, 2) for k, v in para_at.items()}},
              open(os.path.join(OUT, f'{name}.json'), 'w'), indent=0)
    print(f'{mp3}: {total / 60:.1f} min')


if __name__ == '__main__':
    for name in sys.argv[1:]:
        build(name)
