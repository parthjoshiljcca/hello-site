# Refines out/beats.json after narrate.py. Each paragraph is cut at its pauses into short chunks,
# Whisper transcribes every chunk once, and dynamic programming splits the chunk sequence into the
# paragraph's beats so that each beat's chunks best match that beat's text. Runs locally (no credits).
#
#   python3 align.py <sherpa-onnx-whisper-small dir>
import difflib
import json
import os
import re
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf
from scipy.signal import resample_poly

from narrate import DIR, OUT, SR, pauses

rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f'{sys.argv[1]}/small-encoder.int8.onnx', decoder=f'{sys.argv[1]}/small-decoder.int8.onnx',
    tokens=f'{sys.argv[1]}/small-tokens.txt', language='hi', task='transcribe', num_threads=8, tail_paddings=6000)


def skeleton(text):
    """Consonants and independent vowels only: robust to Whisper's matra and nukta slips."""
    return ''.join(re.findall(r'[अ-औक-ह]', text))


def heard(a):
    st = rec.create_stream()
    st.accept_waveform(16000, np.concatenate([np.zeros(8000), resample_poly(a, 1, 3), np.zeros(32000)]))
    rec.decode_stream(st)
    return skeleton(st.result.text)


def split(texts, chunks):
    """Best split of the chunk list into len(texts) consecutive runs; returns the start chunk of each run."""
    k, m = len(texts), len(chunks)
    score = lambda b, i, j: difflib.SequenceMatcher(None, texts[b], ''.join(chunks[i:j])).ratio()
    best = {(0, 0): (0.0, [])}
    for b in range(k):
        nxt = {}
        for (bb, i), (s, cuts) in best.items():
            for j in range(i + 1, m - (k - b - 1) + 1):
                v = (s + score(b, i, j), cuts + [i])
                if (b + 1, j) not in nxt or v[0] > nxt[(b + 1, j)][0]:
                    nxt[(b + 1, j)] = v
        best = nxt
    return best[(k, m)][1]


def main():
    beats = {b['beat']: b for b in json.load(open(os.path.join(OUT, 'beats.json')))}
    for p in json.load(open(os.path.join(OUT, 'paragraphs.json'))):
        a, _ = sf.read(os.path.join(DIR, p['file']))
        a = (a.mean(1) if a.ndim > 1 else a)[p['trim']:]
        idx = np.flatnonzero(np.abs(a) > .01)
        a = a[: idx[-1] + 2400]
        gaps = [g for g in pauses(a) if g[0] > .2]
        bounds = [0.0] + [(g[0] + g[1]) / 2 for g in gaps] + [len(a) / SR]
        chunks = [heard(a[int(s * SR): int(e * SR)]) for s, e in zip(bounds, bounds[1:])]
        starts = split([skeleton(t) for t in p['said']], chunks)
        for k, n in enumerate(p['beats']):
            s = 0.0 if k == 0 else gaps[starts[k] - 1][1]
            e = len(a) / SR if k == len(p['beats']) - 1 else gaps[starts[k + 1] - 1][0]
            beats[n]['start'], beats[n]['end'] = round(p['start'] + s, 3), round(p['start'] + e, 3)
            print(f'beat {n:2d}: {p["start"] + s:6.2f} - {p["start"] + e:6.2f}  heard {"".join(chunks[starts[k]:(starts[k + 1] if k + 1 < len(starts) else None)])[:24]}')
    json.dump(sorted(beats.values(), key=lambda b: b['beat']), open(os.path.join(OUT, 'beats.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
