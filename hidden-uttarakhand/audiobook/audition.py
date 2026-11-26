# Voice audition for the audiobook's cast: the narrator announces each character and option, then the
# candidate voice reads a line that character really says in Chapter 1.  -> out/audition.mp3
import os
import subprocess

import numpy as np
import soundfile as sf

from tts import SR, speak

NARRATOR = 'mukul_hi_suspense'
CAST = [
    ('शाओनी', 'पार्थ। भूत का कोई डेटा नहीं है। तुम प्रोफ़ेसर हो। बिहेव।',
     ['simran_hi_narration', 'tanya_hi_narration', 'shreya_hi_conversational']),
    ('क्षितिज', 'दीदी, हिस्टॉरिक और हॉन्टेड हिंदी में एक ही शब्द है।',
     ['aayan_hi_conversational', 'vaibhav_hi_social', 'rehan_hi_social']),
    ('गब्बर', 'नक़ली कहानी मैं सुनाता हूँ। असली कहानी मेरी नानी सुनाती थी। वो मैं किसी को नहीं सुनाता।',
     ['ashok_hi_character', 'mahesh_hi_documentary', 'girish_hi_devotional']),
    ('गोलू', 'घोस्ट फ़ैमिली, क्या हाल है! मैं हूँ घोस्टबस्टर गोलू, और आज हम लाइव हैं!',
     ['sunny_hi_reels', 'chirag_hi_social', 'vipul_hi_social']),
    ('रोहन', 'सब बता देते हैं, भल्ला। बस सही तरह पूछना पड़ता है।',
     ['ratan_hi_latenight', 'advait_hi_character', 'anand_hi_documentary']),
    ('भल्ला', 'और गीत? आख़िरी हिस्सा तो मिला ही नहीं, सर।',
     ['ashutosh_hi_conversational', 'kabir_hi_conversational']),
    ('मम्मी', 'स्वेटर पहना? और पार्थ। भूत-वूत के पीछे मत पड़ना।',
     ['roopa_hi_companion', 'ritu_hi_customer_warm', 'sarika_hi_conversation']),
]
NUM = ['एक', 'दो', 'तीन']
gap = lambda s: np.zeros(int(SR * s), np.float32)
parts = [speak('नमस्ते। यह है छिपा हुआ उत्तराखंड की ऑडियोबुक के लिए आवाज़ों का ऑडिशन।', NARRATOR, 1.05), gap(.8)]
for name, line, voices in CAST:
    for i, v in enumerate(voices):
        parts += [speak(f'{name}, आवाज़ {NUM[i]}।', NARRATOR, 1.1), gap(.35), speak(line, v, 1.0), gap(.9)]
    parts.append(gap(.5))
audio = np.concatenate(parts)
audio *= .89 / max(1e-6, np.abs(audio).max())
os.makedirs('out', exist_ok=True)
sf.write('out/audition.wav', audio, SR)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'out/audition.wav', '-b:a', '160k', 'out/audition.mp3'], check=True)
os.remove('out/audition.wav')
print(f'out/audition.mp3: {len(audio) / SR:.0f} s')
