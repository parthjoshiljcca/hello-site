# Sarvam Bulbul text-to-speech for the Hindi audiobook, with a disk cache so a line is only ever paid
# for once: the cache key is the voice, pace, temperature and exact text. The API key is never read here:
# the session's network proxy adds it to requests for api.sarvam.ai (set SARVAM_API_KEY to use your own).
import base64
import hashlib
import io
import json
import os

import numpy as np
import soundfile as sf
from sarvamai import SarvamAI

DIR = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(DIR, 'cache', 'tts')
MODEL, SR = 'bulbul:v4-flash', 48000
_client = None


def client():
    global _client
    if _client is None:
        _client = SarvamAI(api_subscription_key=os.environ.get('SARVAM_API_KEY', 'set-by-proxy'))
    return _client


def speak(text, speaker, pace=1.0, temperature=None):
    """Mono float32 audio at 48 kHz for one request's worth of text (Sarvam takes up to ~2,500 characters)."""
    key = hashlib.sha1(json.dumps([MODEL, speaker, pace, temperature, text], ensure_ascii=False).encode()).hexdigest()[:20]
    path = os.path.join(CACHE, key + '.wav')
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        kw = dict(text=text, language_code='hi-IN', model=MODEL, speaker=speaker, pace=pace, speech_sample_rate=SR)
        if temperature is not None:
            kw['temperature'] = temperature
        resp = client().text_to_speech.convert(**kw)
        audio, sr = sf.read(io.BytesIO(base64.b64decode(''.join(resp.audios))), dtype='float32')
        assert sr == SR, sr
        sf.write(path, audio, SR)
    audio, _ = sf.read(path, dtype='float32')
    return audio if audio.ndim == 1 else audio.mean(1)


def chars_spent():
    """Characters of text already in the cache (what has been paid for)."""
    return sum(os.path.getsize(os.path.join(CACHE, f)) for f in os.listdir(CACHE)) if os.path.isdir(CACHE) else 0
