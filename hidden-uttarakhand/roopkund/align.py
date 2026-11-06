# Refines out/beats.json after narrate.py: inside each paragraph, a beat boundary is put at the pause
# after which Whisper hears the next beat's opening words. Runs locally (no Sarvam credits).
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
    encoder=f'{sys.argv[1]}/small-encoder.onnx', decoder=f'{sys.argv[1]}/small-decoder.onnx',
    tokens=f'{sys.argv[1]}/small-tokens.txt', language='hi', task='transcribe', num_threads=8, tail_paddings=6000)


def skeleton(text, n=7):
    """The first n consonants and independent vowels: robust to Whisper's matra and nukta slips."""
    return ''.join(re.findall(r'[अ-औक-ह]', text))[:n]


def heard(a):
    st = rec.create_stream()
    st.accept_waveform(16000, np.concatenate([np.zeros(8000), resample_poly(a, 1, 3), np.zeros(32000)]))
    rec.decode_stream(st)
    return st.result.text


def main():
    beats = {b['beat']: b for b in json.load(open(os.path.join(OUT, 'beats.json')))}
    for p in json.load(open(os.path.join(OUT, 'paragraphs.json'))):
        a, _ = sf.read(os.path.join(DIR, p['file']))
        a = (a.mean(1) if a.ndim > 1 else a)[p['trim']:]
        idx = np.flatnonzero(np.abs(a) > .01)
        a = a[: idx[-1] + 2400]
        gaps, prev = pauses(a), 0.0
        for k in range(1, len(p['beats'])):
            n = p['beats'][k]
            want = skeleton(p['said'][k])
            est = beats[n]['start'] - p['start']
            cands = [g for g in gaps if g[0] > prev + .5 and abs(g[1] - est) < 5]
            scored = []
            for g in cands:
                got = skeleton(heard(a[int(g[1] * SR): int((g[1] + 2.4) * SR)]))
                scored.append((difflib.SequenceMatcher(None, want, got).ratio(), -abs(g[1] - est), g, got))
            score, _, g, got = max(scored)
            beats[p['beats'][k - 1]]['end'] = round(p['start'] + g[0], 3)
            beats[n]['start'] = round(p['start'] + g[1], 3)
            prev = g[1]
            print(f'beat {n:2d} starts {p["start"] + g[1]:6.2f}  match {score:.2f}  want {want}  heard {got}')
    json.dump(sorted(beats.values(), key=lambda b: b['beat']), open(os.path.join(OUT, 'beats.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
