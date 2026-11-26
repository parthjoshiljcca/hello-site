# One narrator voices every character (Sarvam shubh_hi_stories_dramatic): each character gets its own
# pitch, pace, loudness and expressiveness, so the storyteller "does the voices".  -> out/demo-one-voice.mp3
import os
import subprocess

import numpy as np
import soundfile as sf

import sound as S
from build_chapter import trim
from tts import SR, speak

V = 'shubh_hi_stories_dramatic'
STYLE = {   # pitch, pace, loudness, temperature
    'narrator': (0.0, 1.1, 1.0, 1.0), 'gabbar': (-.45, .9, 1.25, 1.0), 'kshitij': (.12, 1.0, .85, .8),
    'shaoni': (.35, 1.05, .95, 1.0), 'mummy': (.4, 1.02, 1.1, 1.0), 'golu': (.2, 1.2, 1.35, 1.0),
}
SCENE = [
    ('narrator', 'उसने मुझे एक लंबे, असहज पल तक देखा… जैसे तय कर रहा हो कि मैं ग्राहक हूँ, या मुसीबत। फिर उसने गाड़ी के बोनट को धीरे से थपथपाया।', .5),
    ('gabbar', 'बसंती ने इससे बुरे लोग देखे हैं।', .35), ('narrator', 'उसने कहा।', .3),
    ('gabbar', 'गब्बर सिंह नेगी। फ़िक्स्ड रेट। … भूतों का एक्स्ट्रा।', .5),
    ('kshitij', 'गब्बर सिंह? … असली नाम?', .25), ('narrator', 'क्षितिज ने पूछा, कलम पहले से चल रही थी।', .4),
    ('gabbar', 'असली नाम! मेरे पापा बस कंडक्टर थे, हल्द्वानी में। एक सर्दी में शोले… उन्नीस बार देखी। अगले बसंत में, मैं पैदा हुआ।', .6),
    ('narrator', 'शाओनी ने उसे वह नज़र दी, जो वह छेद वाली थ्योरी को देती है।', .3),
    ('shaoni', 'पार्थ। भूत का कोई डेटा नहीं है। तुम प्रोफ़ेसर हो। बिहेव।', .7),
    ('narrator', 'मेरा फ़ोन बजा। मम्मी।', .4),
    ('mummy', 'पहुँच गए?', .35), ('narrator', 'पहुँच गए, मम्मी।', .3), ('mummy', 'स्वेटर पहना?', .3), ('narrator', 'तीन।', .4),
    ('mummy', 'गुड! … और पार्थ! भूत-वूत के पीछे मत पड़ना, समझे?', .7),
    ('golu', 'घोस्ट फ़ैमिली, क्या हाल है! मैं हूँ घोस्टबस्टर गोलू, और आज हम लाइव हैं, इंडिया के सबसे हॉन्टेड होटल से!', .6),
]
parts = []
for who, text, pause in SCENE:
    pitch, pace, loud, temp = STYLE[who]
    a = trim(speak(text, V, pace, temp, pitch, loud))
    if who == 'mummy':
        a = np.tanh(S.band(a, 320, 3300, 3) * 3 / np.abs(a).max()) * .45
    parts += [a, np.zeros(int(pause * SR), np.float32)]
audio = np.concatenate(parts)
audio *= .89 / np.abs(audio).max()
sf.write('out/d.wav', audio, SR)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'out/d.wav', '-af', 'loudnorm=I=-18:TP=-2', '-b:a', '160k', 'out/demo-one-voice.mp3'], check=True)
os.remove('out/d.wav')
print(f'{len(audio) / SR:.0f} s')
