# Hindi thriller-style narration for preface.html, voiced with Kokoro TTS (male voice hm_omega).
# Each line is split on '…' into segments with a dramatic pause between them, the voice is
# lowered and warmed with ffmpeg, and the timing of every line, segment and word is written to
# out/audio/narration/timeline.json and timeline.js, which drive the picture and the score.
#
#   python3 narration.py <kokoro-dir>     (kokoro-dir holds kokoro-v1.0.onnx and voices-v1.0.bin)
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

DIR = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(DIR, 'out', 'audio', 'narration')
SR = 48000
VOICE, SPEED = 'hm_omega', .84

# (scene, caption with *gold* words, pause after the line in seconds)
LINES = [
    ('peaks', 'कहते हैं… उत्तराखंड के पहाड़ों में कुछ जगहें ऐसी हैं, जो किसी *नक्शे* पर नहीं मिलतीं।', .9),
    ('forest', 'रात के सन्नाटे में, जब हवा देवदार के जंगलों से गुज़रती है… तो अपने साथ *कहानियाँ* लाती है।', .8),
    ('trail', 'ये सफ़र वहाँ से शुरू हुआ, जहाँ *सड़क* *ख़त्म* होती है… आख़िरी बस-स्टॉप के बाद।', .9),
    ('village', 'उन गाँवों में, जहाँ *मंदिर* *की* *घंटी* आज भी वक़्त बताती है…', .6),
    ('river', 'जहाँ नदियाँ जन्म लेती हैं… और हर पत्थर किसी पुरानी *किंवदंती* को याद रखता है।', 1.4),
    ('chosen', 'लेकिन कुछ रास्ते… आप नहीं चुनते। वो *आपको* *चुनते* *हैं।*', 1.0),
    ('book', 'ये कोई गाइडबुक नहीं है। ये एक *न्योता* है।', 1.2),
    ('title', 'हिडन उत्तराखंड। देवभूमि की वो कहानियाँ, जो अब तक छिपी रहीं।', 2.8),
]
LEAD_IN, SEG_GAP = 1.8, .45
VOICE_FX = ('asetrate=24000*0.93,aresample=48000,atempo=1.0753,highpass=f=70,'
            'equalizer=f=140:t=q:w=1:g=3.5,equalizer=f=3500:t=q:w=1.2:g=2,'
            'acompressor=threshold=-20dB:ratio=3:attack=8:release=120')


def speech_bounds(a, thr=.02):
    idx = np.flatnonzero(np.abs(a) > thr)
    return (idx[0], idx[-1] + 1) if len(idx) else (0, len(a))


def main(kdir):
    os.makedirs(WORK, exist_ok=True)
    tts = Kokoro(os.path.join(kdir, 'kokoro-v1.0.onnx'), os.path.join(kdir, 'voices-v1.0.bin'))
    t, lines, track = LEAD_IN, [], []
    for li, (scene, caption, pause) in enumerate(LINES):
        segs = []
        for si, seg in enumerate(s.strip() for s in caption.split('…')):
            if not seg:
                continue
            raw, sr = tts.create(seg.replace('*', ''), voice=VOICE, speed=SPEED, lang='hi')
            src, dst = os.path.join(WORK, f'raw-{li}-{si}.wav'), os.path.join(WORK, f'line-{li}-{si}.wav')
            sf.write(src, raw, sr)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', VOICE_FX, '-ac', '1', dst], check=True)
            a, _ = sf.read(dst)
            i0, i1 = speech_bounds(a)
            a = a[max(0, i0 - 480): i1 + 2400]
            start, end = t, t + len(a) / SR
            # spread the words over the spoken part in proportion to their length
            words, w = seg.split(' '), []
            total = sum(len(x.strip('*')) + 1 for x in words)
            acc = 0
            for x in words:
                w.append({'w': x, 't': round(start + .01 + (end - start - .15) * acc / total, 3)})
                acc += len(x.strip('*')) + 1
            segs.append({'start': round(start, 3), 'end': round(end, 3), 'words': w})
            track.append((start, a))
            t = end + SEG_GAP
        t -= SEG_GAP
        lines.append({'scene': scene, 'start': segs[0]['start'], 'end': round(t, 3), 'segs': segs})
        t += pause
    total = round(t, 2)
    out = np.zeros(int(SR * (total + 1)))
    for start, a in track:
        i = int(start * SR)
        out[i:i + len(a)] += a
    sf.write(os.path.join(WORK, 'voice.wav'), out[: int(SR * total)], SR)
    tl = {'duration': total, 'lines': lines}
    json.dump(tl, open(os.path.join(WORK, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    open(os.path.join(DIR, 'timeline.js'), 'w').write('window.TIMELINE = ' + json.dumps(tl, ensure_ascii=False) + ';\n')
    print(f'narration: {len(lines)} lines, {total} s')


if __name__ == '__main__':
    main(sys.argv[1])
