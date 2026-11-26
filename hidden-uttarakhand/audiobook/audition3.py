# Audition 3: Mummy, less intimate. Voice 3 (suman_hi_companion) read brisk and worried instead of soft,
# with and without a phone-line filter (she is always on the phone in the book), and two other voices.
#   -> out/audition3.mp3
import os
import subprocess

import numpy as np
import soundfile as sf

from tts import SR, speak

N = 'mukul_hi_suspense'
gap = lambda s: np.zeros(int(SR * s), np.float32)
LINES = ['पहुँच गए?', 'स्वेटर पहना?', 'गुड! … और पार्थ! भूत-वूत के पीछे मत पड़ना, समझे?']
SOFT = ['पहुँच गए?', 'स्वेटर पहना?', 'गुड़। … और पार्थ। भूत-वूत के पीछे मत पड़ना।']


def phone(x):
    """A mobile call: 300-3400 Hz, a little compression and grit."""
    tmp_in, tmp_out = 'work/_in.wav', 'work/_out.wav'
    sf.write(tmp_in, x, SR)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp_in, '-af',
                    'highpass=f=320,lowpass=f=3300,acompressor=threshold=-18dB:ratio=4:attack=5:release=60,'
                    'aformat=sample_rates=48000', tmp_out], check=True)
    y, _ = sf.read(tmp_out, dtype='float32')
    return y * 1.6


def mummy(voice, lines, pace, temp, filt=None):
    out = []
    for line in lines:
        a = speak(line, voice, pace, temp)
        out += [filt(a) if filt else a, gap(.55)]
    return out


os.makedirs('work', exist_ok=True)
parts = [speak('मम्मी के लिए तीसरा ऑडिशन।', N, 1.05), gap(.6)]
takes = [
    ('आवाज़ तीन, जैसी पिछली बार थी।', 'suman_hi_companion', SOFT, .88, 1.0, None),
    ('आवाज़ तीन, तेज़ और फ़िक्र वाले लहजे में।', 'suman_hi_companion', LINES, .98, .7, None),
    ('आवाज़ तीन, फ़ोन पर।', 'suman_hi_companion', LINES, .98, .7, phone),
    ('नई आवाज़ ए, फ़ोन पर।', 'aarti_hi_customer', LINES, .95, .8, phone),
    ('नई आवाज़ बी, फ़ोन पर।', 'vandana_hi_ecomm', LINES, .95, .8, phone),
]
for label, voice, lines, pace, temp, filt in takes:
    parts += [speak(label, N, 1.1), gap(.4)] + mummy(voice, lines, pace, temp, filt) + [gap(.7)]
audio = np.concatenate(parts)
audio *= .89 / max(1e-6, np.abs(audio).max())
sf.write('out/audition3.wav', audio, SR)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'out/audition3.wav', '-b:a', '160k', 'out/audition3.mp3'], check=True)
os.remove('out/audition3.wav')
print(f'out/audition3.mp3: {len(audio) / SR:.0f} s')
