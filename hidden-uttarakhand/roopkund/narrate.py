# Voices the Roopkund episode with Sarvam Bulbul (mukul_hi_suspense): reads the narration column of
# SCRIPT.md, speaks each beat, and joins them with short pauses into out/narration.wav. The start and
# end of every beat go to out/beats.json for the picture to follow.
#
#   python3 narrate.py            (SARVAM_API_KEY from the environment or the repository's .env)
import base64
import io
import json
import os
import re

import numpy as np
import soundfile as sf
from sarvamai import SarvamAI

DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(DIR, 'out')
SPEAKER, PACE, SR = 'mukul_hi_suspense', 1.0, 48000
LEAD, GAP = 1.0, .45   # silence before the first beat, and between beats

ENV = os.path.join(DIR, '..', '..', '.env')
if 'SARVAM_API_KEY' not in os.environ and os.path.exists(ENV):
    for line in open(ENV):
        key, _, value = line.strip().partition('=')
        if key == 'SARVAM_API_KEY':
            os.environ[key] = value


def beats():
    for line in open(os.path.join(DIR, 'SCRIPT.md')):
        m = re.match(r'\| (\d+) \| (.+?) \| (.+) \|$', line.strip())
        if m:
            yield int(m.group(1)), m.group(2).strip()


def main():
    os.makedirs(os.path.join(OUT, 'beats'), exist_ok=True)
    client = SarvamAI(api_subscription_key=os.environ['SARVAM_API_KEY'])
    track, info, t = [np.zeros(int(LEAD * SR))], [], LEAD
    for n, text in beats():
        path = os.path.join(OUT, 'beats', f'{n:02d}.wav')
        if not os.path.exists(path):  # keep beats already voiced, so a re-run only pays for changed ones
            resp = client.text_to_speech.convert(text=text, language_code='hi-IN', model='bulbul:v4-flash',
                                                 speaker=SPEAKER, pace=PACE, speech_sample_rate=SR)
            open(path, 'wb').write(base64.b64decode(''.join(resp.audios)))
        a, sr = sf.read(path)
        assert sr == SR, sr
        if a.ndim > 1:
            a = a.mean(1)
        idx = np.flatnonzero(np.abs(a) > .01)  # trim leading and trailing silence
        a = a[max(0, idx[0] - 240): idx[-1] + 1200]
        info.append({'beat': n, 'start': round(t, 3), 'end': round(t + len(a) / SR, 3), 'text': text})
        track += [a, np.zeros(int(GAP * SR))]
        t += len(a) / SR + GAP
        print(f'beat {n:2d}: {info[-1]["start"]:6.2f} - {info[-1]["end"]:6.2f}')
    sf.write(os.path.join(OUT, 'narration.wav'), np.concatenate(track), SR)
    json.dump(info, open(os.path.join(OUT, 'beats.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'narration: {len(info)} beats, {t:.1f} s')


if __name__ == '__main__':
    main()
