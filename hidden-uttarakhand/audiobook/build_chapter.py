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
NARRATOR = dict(voice='shubh_hi_stories_dramatic', pace=.95, temp=1.0)   # unhurried, so every line lands
_V = NARRATOR['voice']
VOICES = {
    'narrator': NARRATOR,
    'shaoni': dict(voice=_V, pace=.98, temp=1.0),                  # crisp, quick
    'kshitij': dict(voice=_V, pace=.9, temp=.8, loud=.9),           # flat, quiet, deadpan
    'gabbar': dict(voice=_V, pace=.85, temp=1.0, loud=1.12),         # slow, weighty
    'golu': dict(voice=_V, pace=1.05, temp=1.0, loud=1.25),          # fast and loud, for the camera
    'rohan': dict(voice=_V, pace=.88, temp=1.0, loud=.9),            # unhurried, smooth
    'bhalla': dict(voice=_V, pace=.88, temp=1.0, loud=.95),
    'mummy': dict(voice=_V, pace=.95, temp=1.0, loud=1.08),
    'waiter': dict(voice=_V, pace=.95, temp=.9),
    'forest': dict(voice=_V, pace=.7, temp=1.0, fx='forest'),       # the call from the trees: same voice, far off
}
GAP_IN, GAP_PARA, GAP_SCENE = .3, .7, 2.2
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


def segments(ch, paras):
    """[(para index, speaker, text, kind)]: kind 'line' or 'title'."""
    out, diary = [], False
    for i, p in enumerate(paras):
        if i < ch.SKIP_FIRST or not p.strip():
            continue
        if p.strip() == '###':
            out.append((i, None, None, 'break')); continue
        if ch.DIARY_FROM and p.startswith(ch.DIARY_FROM):
            out.append((i, 'narrator', clean(p.replace('—', ',')) + '।', 'line')); diary = True; continue
        if diary:
            out.append((i, 'kshitij', clean(p), 'line')); continue
        v = next((who for k, who in ch.VOICED.items() if p.startswith(k)), None)
        if v:
            out.append((i, v, clean(p), 'line')); continue
        if any(p.startswith(k) for k in ch.SONG):
            out.append((i, 'narrator', clean(p).rstrip('…') + '…', 'song')); continue
        pos = 0
        for m in re.finditer(r'"([^"]+)"', p):
            before = p[pos:m.start()]
            if clean(before):
                out.append((i, 'narrator', clean(before), 'line'))
            q = m.group(1)
            who = max(((k, w) for k, w in ch.SPEAKERS.items() if q.startswith(k)), key=lambda kw: len(kw[0]), default=(None, None))[1]
            if who is None:
                raise SystemExit(f'no speaker for quote in paragraph {i}: "{q[:50]}"')
            out.append((i, who, clean(q, quote=True), 'line'))
            pos = m.end()
        if clean(p[pos:]):
            out.append((i, 'narrator', clean(p[pos:]), 'line'))
    return out


def voice(seg):
    i, who, text, kind = seg
    v = VOICES[who]
    pace = v['pace'] * (.9 if kind == 'song' else 1)
    a = trim(speak(spoken(text), v['voice'], round(pace, 2), v.get('temp'), 0.0, v.get('loud', 1.0)))
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
    """A scene's background: (ambience, music) as two stereo arrays."""
    z = lambda: np.zeros((int(sec * SR), 2), np.float32)
    amb, mus = z(), z()
    if name == 'campfire':
        amb += S.fire(sec) * .9 + S.wind(sec, .8) * 1.4 + S.crickets(sec, .6) * .8
        mus += S.st(S.drone(sec, (38, 45, 50), 500) * .22)
    elif name == 'stillness':
        amb += S.fire(sec) * .6
        mus += S.st(S.drone(sec, (38, 45), 400) * .18)
    elif name == 'airport':
        amb += S.murmur(sec, 14) * 3.2 + S.room_tone(sec)
        for k in range(int(sec / 2.4)):
            S.place(mus, S.st(S.pluck([62, 66, 69, 71, 69, 66][k % 6], 1.4) * .16, -.3 + .1 * (k % 6)), k * 2.4)
    elif name == 'outdoor':
        amb += S.wind(sec, .4) * .8 + S.birds(sec, .5)
    elif name == 'drive':
        amb += S.engine(sec, 1500, .7) * .8 + S.wind(sec, .5) * .5
        mus += S.st(S.drone(sec, (50, 57, 62), 900) * .14)
        fl = S.reverb(S.st(S.flute(S.SHEPHERD, 70) * .3, .2), 2.4, .35)
        S.place(mus, fl, 3.0)
    elif name == 'lobby':
        amb += S.room_tone(sec) * 1.5 + S.murmur(sec, 6) * 1.5 + S.clock(sec) * 1.2
    elif name == 'dining':
        amb += S.murmur(sec, 10) * 2.2 + S.clinks(sec, .7) + S.room_tone(sec)
    elif name == 'mystery':
        amb += S.murmur(sec, 8) * 1.0 + S.clinks(sec, .3) * .6
        mus += S.st(S.drone(sec, (45, 52, 57), 700) * .2) + S.st(S.strings(sec, (45, 52), 1200) * .12)
        for k in range(int(sec / 6)):
            S.place(mus, S.st(S.bell(81, 4) * .08, .4), 2 + k * 6)
    elif name == 'night':
        amb += S.room_tone(sec) * 1.2 + S.clock(sec) * 1.6
        mus += S.st(S.drone(sec, (41, 48), 450) * .16)
    elif name == 'tension':
        amb += S.room_tone(sec)
        mus += S.st(S.heartbeat(sec, 70) * .5) + S.st(S.strings(sec, (40, 47, 52), 1500) * .2)
    elif name == 'breakfast':
        amb += S.birds(sec, .7) + S.clinks(sec, .5) + S.murmur(sec, 5) * 1.2
        for k in range(int(sec / 3)):
            S.place(mus, S.st(S.pluck([67, 71, 74, 72][k % 4], 1.4) * .12, .2), k * 3)
    elif name == 'suspense':
        amb += S.room_tone(sec)
        mus += S.st(S.drone(sec, (43, 50, 55), 650) * .2) + S.st(S.strings(sec, (43, 50), 1100) * .12)
    elif name == 'diary':
        amb += S.pencil(sec, 1.2) * 1.4
        for k in range(int(sec / 4)):
            S.place(mus, S.st(S.pluck([62, 69, 66, 64][k % 4], 2.0) * .1, -.2), k * 4)
        mus += S.st(S.drone(sec, (50, 57), 600) * .08)
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
    if name == 'run': return S.footsteps(3.5, 4.5, .45)
    if name == 'whoosh': return S.whoosh(.9) * 1.2
    if name == 'door': return S.door() * .8
    if name == 'suv': return S.suv_idle(9) * 1.4
    if name == 'heartbeat': return S.st(S.heartbeat(22, 64) * .6)
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
    paras = open(os.path.join(DIR, 'text', f'{name}.txt'), encoding='utf-8').read().split('\n')
    segs = segments(ch, paras)
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
    last = None
    for seg in segs:
        i, who, text, kind = seg
        if kind == 'break':
            t += GAP_SCENE; last = None; continue
        if last is not None:
            t += GAP_IN if last == i else GAP_PARA
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
    def at_para(prefix):
        hits = [i for i, p in enumerate(paras) if p.startswith(prefix)]
        if not hits or hits[0] not in para_at:
            raise SystemExit(f'cue not found: {prefix}')
        return para_at[hits[0]]
    amb, mus = np.zeros((n, 2), np.float32), np.zeros((n, 2), np.float32)
    S.place(mus, intro, 0)
    beds = [(at_para(p), c[4:]) for p, c in ch.CUES if c.startswith('bed:')]
    beds.sort()
    for k, (start, b) in enumerate(beds):
        start = max(0, start - 1.2)
        end = beds[k + 1][0] + .6 if k + 1 < len(beds) else total - 6
        a, m = bed(b, end - start)
        S.place(amb, S.fade(a, 1.5, 1.8), start)
        S.place(mus, S.fade(m, 2.0, 2.2), start)
    cache = {'forest': fx(trim(speak('क्षि…तिज…', VOICES['forest']['voice'], .7, 1.0)), 'forest'),
             'parth': fx(trim(speak('पा…र्थ…', VOICES['forest']['voice'], .7, 1.0)), 'forest')}
    sfxt = np.zeros((n, 2), np.float32)
    for p, c in ch.CUES:
        if c.startswith('sfx:'):
            S.place(sfxt, sfx(c[4:], cache), at_para(p) - .15)
    S.place(mus, theme(14.0) * .9, total - 13.5)

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
