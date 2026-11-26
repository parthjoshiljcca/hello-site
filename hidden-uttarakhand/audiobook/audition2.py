# Audition 2: older voices for Mummy, and the same scene read two ways (plain, and acted like a film:
# expressive temperature, a pace per character and per mood, and real pauses between turns). -> out/audition2.mp3
import os
import subprocess

import numpy as np
import soundfile as sf

from tts import SR, speak

N = 'mukul_hi_suspense'
CAST = {'parth': N, 'shaoni': 'simran_hi_narration', 'kshitij': 'vaibhav_hi_social', 'gabbar': 'ashok_hi_character'}
gap = lambda s: np.zeros(int(SR * s), np.float32)


def say(text, voice, pace=1.0, temp=None):
    return speak(text, voice, pace, temp)


parts = [say('आवाज़ों का दूसरा ऑडिशन। पहले, मम्मी के लिए चार आवाज़ें।', N, 1.05), gap(.7)]
for i, v in enumerate(['roopa_hi_narration', 'shilpa_hi_narration', 'suman_hi_companion', 'priya_hi_recovery']):
    parts += [say(f'मम्मी, आवाज़ {["एक", "दो", "तीन", "चार"][i]}।', N, 1.1), gap(.35),
              say('पहुँच गए?', v, .88, 1.0), gap(.6), say('स्वेटर पहना?', v, .88, 1.0), gap(.7),
              say('गुड़। … और पार्थ। भूत-वूत के पीछे मत पड़ना।', v, .86, 1.0), gap(1.0)]

# the same scene, plain (as in the first audition) and acted
SCENE_PLAIN = [
    ('parth', 'उसने मुझे एक लंबे, असहज पल तक देखा, जैसे तय कर रहा हो कि मैं ग्राहक हूँ या मुसीबत। फिर उसने गाड़ी के बोनट को धीरे से थपथपाया, जैसे कोई बूढ़े घोड़े को थपथपाता है।'),
    ('gabbar', 'बसंती ने इससे बुरे लोग देखे हैं। गब्बर सिंह नेगी। फ़िक्स्ड रेट। भूतों का एक्स्ट्रा।'),
    ('kshitij', 'गब्बर सिंह? असली नाम?'),
    ('gabbar', 'असली नाम। मेरे पापा बस कंडक्टर थे, हल्द्वानी में। एक सर्दी में शोले उन्नीस बार देखी। अगले बसंत में मैं पैदा हुआ।'),
    ('parth', 'और बसंती?'),
    ('gabbar', 'पचास साल से हर पुलिसवाला मुझसे पूछता है, कितने आदमी थे। तो जब अपनी गाड़ी ली, नाम रख दिया बसंती। अब कोई पूछता है, तो मैं कहता हूँ: बसंती से पूछो।'),
]
# acted: (who, text with performance punctuation, pace, temperature, pause after)
SCENE_FILM = [
    ('parth', 'उसने मुझे एक लंबे, असहज पल तक देखा… जैसे तय कर रहा हो कि मैं ग्राहक हूँ, या मुसीबत। फिर उसने गाड़ी के बोनट को धीरे से थपथपाया, जैसे कोई बूढ़े घोड़े को थपथपाता है।', 1.0, .8, .55),
    ('gabbar', 'बसंती ने इससे बुरे लोग देखे हैं।', .9, 1.0, .45),
    ('gabbar', 'गब्बर सिंह नेगी। फ़िक्स्ड रेट। … भूतों का एक्स्ट्रा।', .92, 1.0, .5),
    ('kshitij', 'गब्बर सिंह? … असली नाम?', 1.05, 1.0, .4),
    ('gabbar', 'असली नाम!', .95, 1.0, .35),
    ('gabbar', 'मेरे पापा बस कंडक्टर थे, हल्द्वानी में। एक सर्दी में शोले… उन्नीस बार देखी। अगले बसंत में, मैं पैदा हुआ।', .95, 1.0, .5),
    ('parth', 'और बसंती?', 1.0, .9, .45),
    ('gabbar', 'पचास साल से, हर पुलिसवाला मुझसे पूछता है… कितने आदमी थे?', .92, 1.0, .4),
    ('gabbar', 'तो जब अपनी गाड़ी ली, नाम रख दिया, बसंती। अब कोई पूछता है, तो मैं कहता हूँ… बसंती से पूछो!', .95, 1.0, .8),
]
parts += [gap(.5), say('अब एक ही सीन, दो तरह से। पहले, सीधा पढ़ा हुआ।', N, 1.05), gap(.7)]
for who, text in SCENE_PLAIN:
    parts += [say(text, CAST[who], 1.0), gap(.35)]
parts += [gap(1.0), say('और अब, फ़िल्म के डायलॉग की तरह।', N, 1.05), gap(.7)]
for who, text, pace, temp, pause in SCENE_FILM:
    parts += [say(text, CAST[who], pace, temp), gap(pause)]

audio = np.concatenate(parts)
audio *= .89 / max(1e-6, np.abs(audio).max())
os.makedirs('out', exist_ok=True)
sf.write('out/audition2.wav', audio, SR)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'out/audition2.wav', '-b:a', '160k', 'out/audition2.mp3'], check=True)
os.remove('out/audition2.wav')
print(f'out/audition2.mp3: {len(audio) / SR:.0f} s')
