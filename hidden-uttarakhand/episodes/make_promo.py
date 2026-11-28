# Builds the teaser and the trailer from the finished audiobook: lines cut from the chapter tracks (each with
# its own voice and music), cinematic title cards with a drum hit in between, one continuous score underneath,
# and the book's own opening (title music and "हिडन उत्तराखंड, अ बुक बाय पार्थ डी. जोशी") as the ending,
# over which the 3D book opens. No new voice lines, so no Sarvam calls.
#
#   python3 make_promo.py teaser trailer   -> audio/<name>.mp3 and data/<name>.js
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

DIR = os.path.dirname(os.path.abspath(__file__))
AB = os.path.join(DIR, '..', 'audiobook')
sys.path.insert(0, AB)
os.chdir(AB)
import sound as S                             # noqa: E402
import build_chapter as B                     # noqa: E402

SR = B.SR
# a clip is (episode, start, end) in that episode's own track; a card is ('card', text, sub, seconds)
PROMOS = {
    'teaser': [
        ('card', 'पंद्रह दिन। एक पहाड़। एक राज़।', '', 3.2),
        ('prologue', 28.92, 31.73),
        ('prologue', 68.9, 72.74),
        ('prologue', 130.05, 131.15),
        ('card', 'उन्नीस सौ पैंसठ। नंदा देवी।', 'कुछ खो गया था।', 3.4),
        ('ch7', 351.18, 354.12, 'cold'),
        ('ch9', 1028.42, 1032.16),
        ('end',),
    ],
    'trailer': [
        ('card', 'एक प्रोफ़ेसर। दो दोस्त। एक ड्राइवर।', 'पंद्रह दिन, गढ़वाल से कुमाऊँ तक', 3.6),
        ('prologue', 28.92, 31.73),
        ('prologue', 68.9, 72.74),
        ('ch1', 656.59, 664.39),
        ('ch1', 406.96, 409.95),
        ('card', 'उन्नीस सौ पैंसठ। नंदा देवी।', 'कुछ खो गया था।', 3.4),
        ('ch7', 351.18, 354.12, 'cold'),
        ('ch7', 643.52, 652.0, 'stars'),
        ('ch8', 705.0, 714.9, 'roopkund'),
        ('card', 'हर गाँव की एक कहानी है।', 'हर कहानी, एक नियम।', 3.4),
        ('ch10', 1033.38, 1037.3),
        ('ch12', 466.17, 474.0),
        ('ch12', 853.94, 856.95),
        ('ch9', 1028.42, 1032.16),
        ('card', 'जंगल तुम्हारा नाम पुकारे…', 'तो जवाब मत देना।', 3.2),
        ('ch14', 787.87, 788.67),
        ('ch14', 853.09, 854.21),
        ('ch13', 501.36, 503.45),
        ('ch15', 1055.08, 1058.17),
        ('end',),
    ],
}
PRE, POST, GAP = .25, .55, .35
ENDING = ('prologue', 0.0, 10.55)          # title music and the spoken book title, from the top of a track


def load(ep):
    return json.loads(open(os.path.join(DIR, 'data', f'{ep}.js'), encoding='utf-8').read()[len('window.EP = '):-2])


def track(ep, cache={}):
    if ep not in cache:
        wav = os.path.join(DIR, 'audio', f'_{ep}.wav')
        if not os.path.exists(wav):
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(AB, 'out', f'{ep}.mp3'), '-ar', str(SR), '-ac', '2', wav], check=True)
        cache[ep] = sf.read(wav, dtype='float32')[0]
    return cache[ep]


def cut(ep, a, b, pre=PRE, post=POST):
    x = track(ep)[int(max(0, a - pre) * SR):int((b + post) * SR)].copy()
    n = int(.08 * SR); x[:n] *= np.linspace(0, 1, n)[:, None]
    n = int(.25 * SR); x[-n:] *= np.linspace(1, 0, n)[:, None]
    return x


def scene_at(d, t):
    """The picture the episode shows at time t: its last bed, or the bed before it for a mood bed."""
    moods = {'stillness', 'suspense', 'threat', 'tension', 'sinking', 'tender', 'hollow', 'mystery', 'suspicion'}
    beds = [s['bed'] for s in d['scenes'] if s['at'] <= t] or ['night']
    for b in reversed(beds):
        if b not in moods:
            return b, beds[-1]
    return 'night', beds[-1]


def build(name):
    items = PROMOS[name]
    pieces, caps, scenes, hits, cards = [], [], [], [], []
    t = .6
    for it in items:
        if it[0] == 'card':
            _, text, sub, sec = it
            cards.append({'at': round(t, 2), 'end': round(t + sec, 2), 'text': text, 'sub': sub})
            hits.append({'at': round(t, 2), 'fx': 'drumhit'})
            scenes.append({'at': round(t, 2), 'bed': 'night', 'mood': 'dark'})
            pieces.append(('hit', t))
            t += sec + GAP
        elif it[0] == 'end':
            ep, a, b = ENDING
            x = cut(ep, a, b, 0, .3)
            pieces.append(('clip', t, x))
            book_at = t
            t += len(x) / SR + 1.2
        else:
            ep, a, b = it[:3]
            d = load(ep)
            x = cut(ep, a, b)
            pieces.append(('clip', t, x))
            base, raw = scene_at(d, a)
            if len(it) > 3:                    # a picture chosen for the promo, when the episode's own is too bright for the line
                base, raw = it[3], it[3]
            scenes.append({'at': round(t, 2), 'bed': base, 'mood': raw if raw != base else ''})
            for c in d['captions']:
                if c['start'] >= a - .05 and c['end'] <= b + .3:
                    caps.append({**c, 'start': round(t + PRE + c['start'] - a, 2), 'end': round(t + PRE + c['end'] - a, 2)})
            for h in d['hits']:
                if a - .3 <= h['at'] <= b:
                    hits.append({'at': round(t + PRE + h['at'] - a, 2), 'fx': h['fx']})
            t += len(x) / SR + GAP
    total = t
    n = int(total * SR)
    voice = np.zeros((n, 2), np.float32)
    fx = np.zeros((n, 2), np.float32)
    for p in pieces:
        if p[0] == 'clip':
            S.place(voice, p[2], p[1])
        else:
            S.place(fx, B.sfx('drumhit', {}) * 1.1, p[1])
    # the score: suspense under everything, rising to drums and strings before the title
    end_at = book_at
    _, sus = B.bed('suspense', end_at + 1)
    _, rise = B.bed('heroic', max(8, end_at * .35))
    score = np.zeros((n, 2), np.float32)
    S.place(score, S.fade(sus, 1.0, 2.5), 0)
    S.place(score, S.fade(rise, 2.0, 2.0) * .9, end_at - len(rise) / SR + 1.0)
    score[int(end_at * SR):] *= 0          # the book's own title music takes over at the end
    mix = voice + score * B.duck(voice, .55) * .7 + fx * .9
    mix = mix / max(1.0, np.abs(mix).max() * 1.05)
    os.makedirs(os.path.join(DIR, 'audio'), exist_ok=True)
    wav = os.path.join(DIR, 'audio', f'{name}.wav')
    sf.write(wav, mix, SR)
    mp3 = os.path.join(DIR, 'audio', f'{name}.mp3')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-16:LRA=11:TP=-1.5',
                    '-ar', '48000', '-b:a', '192k', mp3], check=True)
    os.remove(wav)
    data = {'name': name, 'mode': 'promo', 'label': 'जल्द आ रहा है', 'en': 'The Untold Secrets of the Devbhoomi',
            'duration': round(total, 2), 'bookAt': round(book_at, 2),
            'title': [{'start': round(book_at + 5.5, 2), 'end': round(book_at + 6.9, 2), 'text': 'हिडन उत्तराखंड'}],
            'captions': caps, 'scenes': scenes, 'hits': hits, 'cards': cards, 'next': None}
    with open(os.path.join(DIR, 'data', f'{name}.js'), 'w', encoding='utf-8') as f:
        f.write('window.EP = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    print(f'{name}: {total:.1f}s, {len(caps)} captions, {len(cards)} cards, book at {book_at:.1f}s')


if __name__ == '__main__':
    for name in sys.argv[1:]:
        build(name)
