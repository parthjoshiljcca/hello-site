# Builds the narration for preface.html from a recorded voice-over (the ElevenLabs "Viraj"
# reading of the preface) and its transcript below: every phrase carries its start and end in
# the recording, so the picture, subtitles, keyword slams and score all follow the real voice.
# Writes out/audio/narration/voice.wav, out/audio/narration/timeline.json and timeline.js.
#
#   python3 voiceover.py <recording.mp3>
import json
import os
import subprocess
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(DIR, 'out', 'audio', 'narration')
LEAD = 1.2      # seconds of picture and sound before the voice starts
OUTRO = 6.4     # title card after the voice ends
TAIL = .25      # the phrase ends below are where the voice dips under the gate; words run a little past them

# (scene, captions); each caption is a list of (start, end, text) phrases in recording time.
# Wrap a word in * to make it gold and slam it onto the screen as it is spoken.
SCRIPT = [
    ('dawn', [
        [(0.08, 0.62, 'ये सफ़र'), (1.44, 2.54, '*सोनप्रयाग* से शुरू हुआ था।')],
        [(3.34, 4.22, 'सुबह की ठंडी हवा,'), (4.74, 6.30, 'और एक अजीब सा *सुकून*…')],
        [(6.94, 8.38, 'जैसे पहाड़ों ने पहले ही कह दिया हो'), (9.04, 10.34, 'कि आगे कुछ ख़ास होने वाला है।')],
    ]),
    ('village', [
        [(11.02, 11.72, 'लोग थे,'), (12.50, 13.30, 'आवाज़ें थीं,'), (14.02, 14.54, 'पर फिर भी…'), (15.62, 16.22, 'मैं *अकेला* था।')],
    ]),
    ('trail', [
        [(16.96, 17.76, 'और हर कदम के साथ'), (18.50, 19.58, 'शहर पीछे छूट रहा था,'), (20.24, 21.84, 'और मैं ख़ुद के और पास आ रहा था।')],
        [(22.54, 23.44, 'रास्ता आसान नहीं था।'), (24.14, 24.56, '*पत्थर*,'), (25.34, 25.76, '*चढ़ाई*,'), (26.62, 27.06, '*थकान*…')],
    ]),
    ('climb', [
        [(27.78, 28.78, 'साँस तेज़ होने लगी थी।'), (30.00, 30.68, 'कभी लगा रुक जाऊँ,'), (31.46, 32.42, 'कभी लगा बस, अब और नहीं।')],
        [(33.34, 33.62, 'लेकिन'), (34.44, 35.00, 'पता नहीं क्यों,'), (35.94, 36.90, 'अंदर से कोई कह रहा था —'), (37.62, 38.20, '*चलते* *रहो।*')],
    ]),
    ('forest', [
        [(38.76, 39.66, 'जंगल के बीच,'), (40.08, 41.90, 'हवा की आवाज़ और पेड़ों के साए…')],
        [(42.74, 43.24, 'वहाँ'), (44.34, 45.02, 'पहली बार लगा'), (45.96, 46.44, 'कि शायद'), (47.40, 48.06, 'मैं *अकेला* *नहीं* हूँ।')],
        [(48.68, 49.22, 'जैसे कोई'), (49.64, 51.04, 'साथ चल रहा हो, *बिना* *दिखे।*')],
    ]),
    ('river', [
        [(51.62, 52.66, 'जैसे-जैसे ऊपर बढ़ता गया,'), (53.42, 56.02, 'थकान बढ़ती गई, लेकिन मन *शांत* होता गया।')],
        [(57.10, 57.70, 'ये अजीब था —'), (58.30, 59.10, 'जिस्म टूट रहा था,'), (59.74, 60.54, 'पर अंदर कुछ जुड़ रहा था।')],
    ]),
    ('golden', [
        [(61.62, 62.52, 'कई जगह रुककर'), (63.06, 63.60, 'बस देखता रहा —'), (64.42, 64.88, 'पहाड़ों को,'), (65.88, 66.28, 'बादलों को।')],
        [(67.36, 68.42, 'और एक सवाल बार-बार आता था —'), (69.32, 70.18, '*मैं* *यहाँ* *क्यों* *हूँ?*')],
    ]),
    ('chosen', [
        [(70.82, 71.24, 'शायद'), (72.00, 72.94, 'ये सफ़र पहाड़ों का नहीं था,'), (73.60, 74.56, 'ये सफ़र *मेरे* *अंदर* का था।')],
        [(75.20, 75.68, 'और फिर'), (76.36, 77.24, 'धुंध के बीच'), (77.84, 78.56, 'एक *झलक* दिखी —')],
    ]),
    ('temple', [
        [(79.46, 79.88, '*मंदिर।*')],
        [(80.74, 81.24, 'उस पल,'), (82.30, 84.80, 'सारी थकान, सारे सवाल, सब चुप हो गए।')],
        [(85.76, 86.56, 'बस एक एहसास था'), (87.48, 88.14, 'कि मैं *पहुँच* *गया।*')],
        [(89.06, 91.38, 'मैं धीरे-धीरे आगे बढ़ा।'), (91.86, 92.78, 'जैसे मैं नहीं चल रहा था,'), (93.28, 94.12, 'कोई मुझे ले जा रहा था।')],
        [(94.66, 95.44, 'और जब मैं वहाँ बैठा,'), (96.32, 96.94, 'मंदिर के सामने,')],
    ]),
    ('diya', [
        [(98.02, 98.80, 'तो मैं रुक नहीं पाया।'), (99.74, 100.74, 'ना आँसू रोके गए,'), (101.18, 102.50, 'ना शब्दों की ज़रूरत थी।')],
        [(103.46, 104.06, 'बस'), (104.64, 105.28, 'सर झुकाया,'), (106.04, 106.80, 'और *दिल* *भर* *आया।*')],
    ]),
    ('calling', [
        [(107.74, 108.44, 'तब समझ आया,'), (109.38, 110.48, 'ये सफ़र मैंने शुरू नहीं किया था,'), (111.42, 112.22, 'मुझे *बुलाया* *गया* *था।*')],
        [(112.92, 114.00, 'और जब बुलावा आता है,'), (115.40, 116.92, 'तो इंसान चल पड़ता है,'), (118.08, 120.26, 'चाहे रास्ता कितना भी मुश्किल क्यों न हो।')],
    ]),
    ('book', [
        [(121.68, 123.02, 'ये सिर्फ़ एक यात्रा नहीं थी,'), (124.48, 125.58, 'ये एक *दर्शन* था।')],
    ]),
]

VOICE_FX = 'aresample=48000,highpass=f=60,acompressor=threshold=-22dB:ratio=2.5:attack=10:release=150'


def phrase(start, end, text):
    s, e = start + LEAD, end + LEAD + TAIL
    words = text.split(' ')
    total = sum(len(w.strip('*')) + 1 for w in words)
    out, acc = [], 0
    for w in words:
        out.append({'w': w, 't': round(s + (e - s - .1) * acc / total, 3)})
        acc += len(w.strip('*')) + 1
    return {'start': round(s, 3), 'end': round(e, 3), 'words': out}


def main(recording):
    os.makedirs(WORK, exist_ok=True)
    scenes, lines = [], []
    for name, caps in SCRIPT:
        scenes.append({'name': name, 'start': 0 if not scenes else round(caps[0][0][0] + LEAD - .5, 3)})
        for cap in caps:
            segs = [phrase(*p) for p in cap]
            lines.append({'scene': name, 'start': segs[0]['start'], 'end': segs[-1]['end'], 'segs': segs})
    voice_end = lines[-1]['end']
    scenes.append({'name': 'title', 'start': round(voice_end + .6, 3)})
    duration = round(voice_end + .6 + OUTRO, 2)

    def word(part):
        return next(w['t'] for l in lines for s in l['segs'] for w in s['words'] if part in w['w'])

    cues = {'lit': word('झलक'), 'temple': word('मंदिर।'), 'bells': [word('बुलाया'), word('बुलावा')]}
    out = os.path.join(WORK, 'voice.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', recording, '-af', f'adelay={int(LEAD * 1000)},{VOICE_FX},apad',
                    '-t', str(duration), '-ac', '1', out], check=True)
    tl = {'duration': duration, 'scenes': scenes, 'cues': cues, 'lines': lines}
    json.dump(tl, open(os.path.join(WORK, 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    open(os.path.join(DIR, 'timeline.js'), 'w').write('window.TIMELINE = ' + json.dumps(tl, ensure_ascii=False) + ';\n')
    print(f'voice-over: {len(scenes)} scenes, {len(lines)} captions, {duration} s')


if __name__ == '__main__':
    main(sys.argv[1])
