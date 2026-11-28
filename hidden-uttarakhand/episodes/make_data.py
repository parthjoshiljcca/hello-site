# Builds the timing data for one YouTube episode from its audiobook track: rebuilds the track's exact voice
# timeline (the same steps as audiobook/build_chapter.py, from the cached voice lines, never calling Sarvam),
# then writes data/<name>.js with the spoken title lines, every caption with its start and end, the scene
# (music bed) changes and the effect hits, plus the next episode's title for the teaser at the end.
#
#   python3 make_data.py prologue ch1 ...   -> data/<name>.js
import importlib
import json
import os
import re
import sys

DIR = os.path.dirname(os.path.abspath(__file__))
AB = os.path.join(DIR, '..', 'audiobook')
sys.path.insert(0, AB)
os.chdir(AB)

import tts                                    # noqa: E402

def _no_api():
    raise SystemExit('a voice line is missing from the cache; build the audiobook track first')
tts.client = _no_api
import build_chapter as B                     # noqa: E402

ORDER = ['dedication', 'cast', 'preface', 'note', 'intro', 'prologue'] + [f'ch{i}' for i in range(1, 16)] + ['end']   # the book's own order
EN = {'dedication': 'Dedication', 'cast': 'The Cast', 'preface': 'Preface', 'note': "Author's Note",
      'intro': 'Introduction: What Happened on Nanda Devi, 1965', 'prologue': 'Prologue', 'ch1': 'Room Locked, Lady Dead, Professor Hungry', 'ch2': 'Rule One: Never Look Back at the Ghat',
      'ch3': 'The Water That Cost a Son', 'ch4': 'The Rock That Stopped a River', 'ch5': 'Five Pieces of a God',
      'ch6': 'The Village That Never Forgave Hanuman', 'ch7': 'The CIA Left Something on Our Mountain',
      'ch8': 'Who Brought the Greeks to Skeleton Lake?', 'ch9': 'The Night the Drums Woke the Gods',
      'ch10': 'Dear God, Please Find Attached', 'ch11': 'No Phones in the Underworld',
      'ch12': 'The Doctor Who Knew Who Would Die', 'ch13': 'The Tigress Nobody Could Stop',
      'ch14': "Don't Answer If the Forest Calls Your Name", 'ch15': 'Some Questions the Mountains Keep',
      'end': 'Epilogue: Ten Months Later'}
LABEL = {'dedication': 'डेडिकेशन', 'cast': 'द कास्ट', 'preface': 'प्रीफ़ेस', 'note': 'ऑथर्स नोट', 'intro': 'इंट्रोडक्शन', 'prologue': 'प्रोलॉग', 'end': 'एपिलॉग', **{f'ch{i}': f'एपिसोड {i}' for i in range(1, 16)}}
# a line from the next episode for the "next time" card: a hook, never a spoiler of how it ends
HOOK = {'cast': 'एक प्रोफ़ेसर, उसके दोस्त, एक ड्राइवर, और कुछ लोग, जिनसे आप बचना चाहेंगे।',
        'preface': 'अहमदाबाद का एक लड़का, और पहाड़ों से उसकी पहली मुलाक़ात।',
        'note': 'एक चेतावनी। प्लीज़ पढ़िए। लेखक ने इस पर बहुत मेहनत की है।',
        'intro': 'नंदा देवी, उन्नीस सौ पैंसठ। इस हिस्से में सब कुछ सच है।',
        'prologue': 'रात के तीन बजकर बारह मिनट। खलिया टॉप। और जंगल से आती एक आवाज़।',
        'ch1': 'मसूरी का एक होटल। एक बंद कमरा। और एक लेडी, जो उन्नीस सौ ग्यारह से वहीं है।',
        'ch2': 'पीछे एक काली एस-यू-वी। आगे एक घाट। और पहाड़ का पहला नियम: पीछे मुड़कर मत देखना।',
        'ch3': 'एक गाँव, जिसने पानी के बदले एक बेटा दिया। और एक गीत, जो सच निकला।',
        'ch4': 'केदारनाथ। एक चट्टान, जिसने एक नदी रोक दी। और रोहन, हमसे एक क़दम आगे।',
        'ch5': 'एक अनजान नंबर। एक फ़ोटो। और पाँच टुकड़ों में बँटा एक देवता।',
        'ch6': 'एक गाँव, जिसने हनुमान को कभी माफ़ नहीं किया। और एक प्रोफ़ेसर, जिसे सॉरी कहना है।',
        'ch7': 'जोशीमठ की पुलिस, औली की एक बेंच, और एक ड्रोन, जिसने सब दिखा दिया।',
        'ch8': 'मुर्दों की झील। बर्फ़ में हड्डियाँ। और एक सवाल: ग्रीक लोग यहाँ क्या कर रहे थे?',
        'ch9': 'एक रात, ढोल, और एक देवता, जो एक किसान के शरीर में उतरता है।',
        'ch10': 'दस हज़ार घंटियाँ। इंसाफ़ की अर्ज़ियाँ। और एक ख़बर, जो सब बदल देती है।',
        'ch11': 'फूलों का एक ठेला, एक पुराना राज़, और धरती के नब्बे फ़ुट नीचे एक गुफा, जहाँ फ़ोन नहीं चलते।',
        'ch12': 'आधी रात। एक भुतहा बंगला। और एक देवता की सवारी, धुंध से निकलती हुई।',
        'ch13': 'गोलू कौन है? चंपावत की एक सुबह, और एक सच, जो चौदह महीने से छुपा था।',
        'ch14': 'रात तीन बजकर बारह मिनट। जंगल नाम पुकारता है। जवाब मत देना।',
        'ch15': 'खलिया की एक झोपड़ी। लकड़ी का एक डब्बा। और वो सवाल, जो पहाड़ रख लेते हैं।',
        'end': 'दस महीने बाद। एक मुक़दमा, एक नया चैनल, और एक नोटबुक के आख़िरी पन्ने पर एक नई लाइन।'}
NAMES = {'shaoni': 'शाओनी', 'kshitij': 'क्षितिज', 'gabbar': 'गब्बर', 'golu': 'गोलू', 'rohan': 'रोहन', 'bhalla': 'भल्ला',
         'mummy': 'मम्मी', 'mummyphone': 'मम्मी', 'waiter': 'वेटर', 'bachiram': 'बची राम जी', 'stranger': 'अजनबी',
         'umesh': 'उमेश', 'dorje': 'दोरजे', 'mahesh': 'महेश', 'kamla': 'कमला देवी', 'bisht': 'इंस्पेक्टर बिष्ट',
         'local': '', 'hira': 'हीरा', 'ija': 'इजा', 'god': 'देवता', 'dhami': 'कमांडेंट धामी', 'dhana': 'धना जी',
         'guide': 'गाइड', 'kishan': 'किशन', 'gaurav': 'गौरव', 'deepak': 'दीपक', 'bhaguli': 'भगुली अम्मा', 'hod': 'एच-ओ-डी',
         'forest': '', 'narrator': '', 'p': 'पार्थ'}


def chunks(text, limit=64):
    """Caption-sized pieces of one spoken line: sentences, and long sentences split at their middle comma."""
    parts = [p.strip() for p in re.findall(r'[^।?!]+[।?!…]*', text) if p.strip()]
    out = []
    for p in parts:
        while len(p) > limit and ', ' in p:
            cs = [m.start() for m in re.finditer(', ', p)]
            mid = min(cs, key=lambda i: abs(i - len(p) / 2))
            out.append(p[:mid + 1]); p = p[mid + 2:]
        out.append(p)
    return out


def build(name):
    ch = importlib.import_module(f'chapters.{name}')
    paras, marks = B.read_script(os.path.join(AB, 'text', f'{name}.txt'))
    segs = B.segments(paras, marks)
    head = [('हिडन उत्तराखंड।'), ('अ बुक बाय, पार्थ डी. जोशी।'), ch.TITLE] + ([ch.DAY] if ch.DAY else [])
    t, title = 5.5, []
    for text in head:
        n = len(B.trim(B.speak(text, B.VOICES['narrator']['voice'], .92, 1.0))) / B.SR
        title.append({'start': round(t, 2), 'end': round(t + n, 2), 'text': text.rstrip('।')})
        t += n + .55
    t = max(t + 1.0, 14.0)
    caps, scenes, hits, para_at = [], [], [], {}
    diary_at = next((i for i, ds in sorted(marks.items()) if 'diary' in ds), None)
    last, last_short = None, False
    for seg in segs:
        i, who, text, kind = seg
        if kind == 'break':
            t += B.GAP_SCENE; last = None; continue
        short = kind == 'line' and len(paras[i].strip()) <= 28 and '"' not in paras[i]
        if last is not None:
            t += B.GAP_IN if last == i else B.GAP_PARA + (B.BEAT if short or last_short else 0)
        last_short = short and last != i
        para_at.setdefault(i, t)
        n = len(B.voice(seg)) / B.SR
        pieces = chunks(text)
        total = sum(len(p) for p in pieces) or 1
        acc = 0
        for p in pieces:
            a = t + n * acc / total
            acc += len(p)
            caps.append({'start': round(a, 2), 'end': round(t + n * acc / total, 2), 'text': p,
                         'who': NAMES.get(who, ''), 'voice': who,
                         'diary': diary_at is not None and i >= diary_at})
        t += n
        last = i
    total = t + 9.0
    for i, ds in sorted(marks.items()):
        for d in ds:
            if d.startswith('bed:'):
                scenes.append({'at': round(max(0, para_at[i] - 1.2), 2), 'bed': d[4:]})
            elif d.startswith('sfx:'):
                hits.append({'at': round(para_at[i] - .15, 2), 'fx': d[4:]})
            elif d == 'diary':
                scenes.append({'at': round(max(0, para_at[i] - 1.2), 2), 'bed': 'diary'})
    scenes.sort(key=lambda s: s['at'])
    k = ORDER.index(name)
    nxt = ORDER[k + 1] if k + 1 < len(ORDER) else None
    data = {'name': name, 'label': LABEL[name], 'en': EN[name], 'duration': round(total, 2), 'title': title,
            'captions': caps, 'scenes': scenes, 'hits': hits,
            'next': {'label': LABEL[nxt], 'en': EN[nxt], 'hook': HOOK.get(nxt, '')} if nxt else None}
    with open(os.path.join(DIR, 'data', f'{name}.js'), 'w', encoding='utf-8') as f:
        f.write('window.EP = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    track = json.load(open(os.path.join(AB, 'out', f'{name}.json')))
    print(f'{name}: {len(caps)} captions, {len(scenes)} scenes, {len(hits)} hits, '
          f'{total:.1f}s (track {track["duration"]:.1f}s)')


if __name__ == '__main__':
    os.makedirs(os.path.join(DIR, 'data'), exist_ok=True)
    for name in sys.argv[1:]:
        build(name)
