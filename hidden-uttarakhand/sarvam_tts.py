# First Sarvam AI text-to-speech call: speaks one Hindi line with Bulbul and saves it as a WAV.
# Reads SARVAM_API_KEY from the environment, or from the repository's .env file.
#
#   python3 sarvam_tts.py [speaker]      -> out/sarvam-test-<speaker>.wav
import base64
import os
import sys

from sarvamai import SarvamAI

DIR = os.path.dirname(os.path.abspath(__file__))
ENV = os.path.join(DIR, '..', '.env')
if 'SARVAM_API_KEY' not in os.environ and os.path.exists(ENV):
    for line in open(ENV):
        key, _, value = line.strip().partition('=')
        if key == 'SARVAM_API_KEY':
            os.environ[key] = value

speaker = sys.argv[1] if len(sys.argv) > 1 else 'shubh_hi_stories_dramatic'
client = SarvamAI(api_subscription_key=os.environ['SARVAM_API_KEY'])
resp = client.text_to_speech.convert(
    text='उत्तराखंड के पहाड़ों में, समुद्र तल से सोलह हज़ार फ़ीट ऊपर, एक छोटी सी झील है… जिसमें सैकड़ों कंकाल पड़े हैं।',
    language_code='hi-IN',
    model='bulbul:v4-flash',
    speaker=speaker,
    pace=0.95,
    speech_sample_rate=48000,
)
out = os.path.join(DIR, 'out', f'sarvam-test-{speaker}.wav')
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, 'wb') as f:
    f.write(base64.b64decode(''.join(resp.audios)))
print(f'request {resp.request_id}: saved {out}')
