# Offline voice-over with Kokoro (https://github.com/thewh1teagle/kokoro-onnx).
# The Hindi-speaker voices (hm_omega, hm_psi, hf_alpha, hf_beta) read English
# with a North-Indian accent.
#
#   python3 tts_kokoro.py <voice> <speed> <lang> <out.wav> <text>
#
# Model files go in $KOKORO_DIR (default ./models):
#   https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
#   https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
import os
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

voice, speed, lang, out, text = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5]
model_dir = os.environ.get("KOKORO_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"))
kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
audio, sample_rate = kokoro.create(text, voice=voice, speed=speed, lang=lang)
sf.write(out, audio, sample_rate)
