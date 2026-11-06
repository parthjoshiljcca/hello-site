# Voices the Roopkund episode with Sarvam Bulbul (mukul_hi_suspense). The narration column of
# SCRIPT.md is spoken a paragraph at a time (several beats per request), so the voice keeps its own
# natural pauses; paragraphs are joined with a short breath. Each beat's start and end inside its
# paragraph is found from the pauses, and written to out/beats.json for the picture to follow.
#
#   python3 narrate.py            (SARVAM_API_KEY from the environment or the repository's .env)
#   EPISODE_DIR=short python3 narrate.py   voices another script folder; its narration.json can set
#                                          paragraphs, pace and speaker
import base64
import hashlib
import json
import os
import re

import numpy as np
import soundfile as sf
from sarvamai import SarvamAI

HERE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.abspath(os.environ.get('EPISODE_DIR', HERE))
OUT = os.path.join(DIR, 'out')
SPEAKER, PACE, SR = 'mukul_hi_suspense', 1.15, 48000
TEMPERATURE = None   # Sarvam's default (0.6); higher reads more expressively
LEAD, BREATH = .8, .35   # silence before the first paragraph, and between paragraphs
PARAGRAPHS = [(1, 2, 3), (4, 5, 6), (7, 8), (9, 10, 11), (12, 13, 14, 15), (16, 17), (18, 19, 20, 21)]
CONFIG = os.path.join(DIR, 'narration.json')
if os.path.exists(CONFIG):
    cfg = json.load(open(CONFIG))
    PARAGRAPHS = [tuple(p) for p in cfg.get('paragraphs', PARAGRAPHS)]
    PACE, SPEAKER, TEMPERATURE = cfg.get('pace', PACE), cfg.get('speaker', SPEAKER), cfg.get('temperature', TEMPERATURE)
# spellings that make the voice say a word right; the subtitles keep the script's spelling
SAY = {'रूपकुंड': 'रूपकूंड'}
if os.path.exists(CONFIG):
    SAY.update(json.load(open(CONFIG)).get('say', {}))

ENV = os.path.join(HERE, '..', '..', '.env')
if 'SARVAM_API_KEY' not in os.environ and os.path.exists(ENV):
    for line in open(ENV):
        key, _, value = line.strip().partition('=')
        if key == 'SARVAM_API_KEY':
            os.environ[key] = value


def beats():
    out = {}
    for line in open(os.path.join(DIR, 'SCRIPT.md')):
        m = re.match(r'\| (\d+) \| (.+?) \| (.+) \|$', line.strip())
        if m:
            out[int(m.group(1))] = m.group(2).strip()
    return out


def spoken(text):
    """Script text -> what the voice reads: no long dramatic gaps, words respelt where needed."""
    for a, b in SAY.items():
        text = text.replace(a, b)
    text = re.sub(r'\s*—\s*', ', ', text)
    text = re.sub(r'…\s*', ', ', text)
    return re.sub(r',\s*([।?])', r'\1', text)


def pauses(a, min_len=.12, thr=.012):
    """(start, end) of every quiet stretch of at least min_len seconds, in seconds."""
    fr = int(SR * .01)
    n = len(a) // fr
    quiet = np.abs(a[: n * fr]).reshape(n, fr).max(1) < thr
    out, s = [], None
    for i, q in enumerate(np.append(quiet, False)):
        if q and s is None:
            s = i
        elif not q and s is not None:
            if (i - s) * .01 >= min_len:
                out.append((s * .01, i * .01))
            s = None
    return out


def main():
    os.makedirs(os.path.join(OUT, 'paragraphs'), exist_ok=True)
    client = SarvamAI(api_subscription_key=os.environ['SARVAM_API_KEY'])
    text = beats()
    track, info, paras, t = [np.zeros(int(LEAD * SR))], [], [], LEAD
    for group in PARAGRAPHS:
        said = [spoken(text[n]) for n in group]
        full = ' '.join(said)
        key = hashlib.sha1(f'{SPEAKER}|{PACE}|{full}'.encode() + (f'|{TEMPERATURE}'.encode() if TEMPERATURE else b'')).hexdigest()[:10]
        path = os.path.join(OUT, 'paragraphs', f'{group[0]:02d}-{key}.wav')
        if not os.path.exists(path):  # only changed paragraphs are paid for again
            resp = client.text_to_speech.convert(text=full, language_code='hi-IN', model='bulbul:v4-flash',
                                                 speaker=SPEAKER, pace=PACE, speech_sample_rate=SR,
                                                 **({'temperature': TEMPERATURE} if TEMPERATURE else {}))
            open(path, 'wb').write(base64.b64decode(''.join(resp.audios)))
        a, sr = sf.read(path)
        a = a.mean(1) if a.ndim > 1 else a
        idx = np.flatnonzero(np.abs(a) > .01)
        i0 = int(max(0, idx[0] - 240))
        a = a[i0: idx[-1] + 2400]
        dur = len(a) / SR
        paras.append({'file': os.path.relpath(path, DIR), 'trim': i0, 'start': round(t, 3), 'beats': list(group),
                      'said': said})
        # beat boundaries: the pause nearest to where each beat should end by its share of the text
        gaps, cuts, acc = pauses(a), [], 0
        total = sum(len(s) for s in said)
        for s in said[:-1]:
            acc += len(s)
            want = dur * acc / total
            best = min((g for g in gaps if not cuts or g[0] > cuts[-1][1]), key=lambda g: abs((g[0] + g[1]) / 2 - want))
            cuts.append(best)
        edges = [(0, None)] + cuts + [(None, dur)]
        for k, n in enumerate(group):
            s, e = edges[k][1] or 0, edges[k + 1][0] if edges[k + 1][0] is not None else dur
            info.append({'beat': n, 'start': round(t + s, 3), 'end': round(t + e, 3), 'text': text[n]})
            print(f'beat {n:2d}: {t + s:6.2f} - {t + e:6.2f}')
        track += [a, np.zeros(int(BREATH * SR))]
        t += dur + BREATH
    sf.write(os.path.join(OUT, 'narration.wav'), np.concatenate(track), SR)
    json.dump(info, open(os.path.join(OUT, 'beats.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(paras, open(os.path.join(OUT, 'paragraphs.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'narration: {len(info)} beats in {len(PARAGRAPHS)} paragraphs, {t:.1f} s')


if __name__ == '__main__':
    main()
