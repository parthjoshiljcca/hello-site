# Audition 4: narrators with more drive on Sarvam, faster and at full expressiveness, reading the same
# Chapter 1 passage the ElevenLabs test used.  -> out/audition4-narrators.mp3
import os
import subprocess

import numpy as np
import soundfile as sf

from tts import SR, speak

TEXT = ('उसने मुझे एक लंबे, असहज पल तक देखा… जैसे तय कर रहा हो कि मैं ग्राहक हूँ, या मुसीबत! '
        'फिर उसने गाड़ी के बोनट को धीरे से थपथपाया, जैसे कोई बूढ़े घोड़े को थपथपाता है। '
        'मैंने बसंती नाम की गाड़ी चलाने के लिए, गब्बर नाम के आदमी को किराए पर रखा। जान-बूझकर रखा। और मुझे… कोई पछतावा नहीं!')
gap = lambda s: np.zeros(int(SR * s), np.float32)
parts = []
for label, voice, pace in [('एक', 'mukul_hi_suspense', 1.18), ('दो', 'shubh_hi_stories_dramatic', 1.12),
                           ('तीन', 'advait_hi_character', 1.12), ('चार', 'anand_hi_documentary', 1.12)]:
    parts += [speak(f'नैरेटर {label}।', 'mukul_hi_suspense', 1.1), gap(.4), speak(TEXT, voice, pace, 1.0), gap(1.0)]
audio = np.concatenate(parts)
audio *= .89 / max(1e-6, np.abs(audio).max())
sf.write('out/a4.wav', audio, SR)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'out/a4.wav', '-b:a', '160k', 'out/audition4-narrators.mp3'], check=True)
os.remove('out/a4.wav')
print(f'{len(audio) / SR:.0f} s')
