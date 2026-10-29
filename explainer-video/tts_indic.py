# Offline Indian-English voice-over with AI4Bharat Indic-TTS (FastPitch + HiFi-GAN).
#
#   python tts_indic.py <speaker> <out.wav> <text>      (speaker: male | female)
#
# Needs `pip install coqui-tts torch torchaudio` and the English checkpoint unzipped in
# $INDIC_TTS_DIR (default ./models/indic-en):
#   https://github.com/AI4Bharat/Indic-TTS/releases/download/v1-checkpoints-release/en.zip
import json
import os
import sys
import tempfile

from TTS.utils.synthesizer import Synthesizer

speaker, out, text = sys.argv[1], sys.argv[2], sys.argv[3]
model_dir = os.environ.get("INDIC_TTS_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "indic-en"))
speakers = os.path.join(model_dir, "fastpitch", "speakers.pth")

# The released config points speakers_file at the authors' training path; repoint it.
with open(os.path.join(model_dir, "fastpitch", "config.json")) as f:
    config = json.load(f)
config["speakers_file"] = speakers
config.setdefault("model_args", {})["speakers_file"] = speakers
config_file = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
json.dump(config, config_file)
config_file.close()

synth = Synthesizer(
    tts_checkpoint=os.path.join(model_dir, "fastpitch", "best_model.pth"),
    tts_config_path=config_file.name,
    tts_speakers_file=speakers,
    vocoder_checkpoint=os.path.join(model_dir, "hifigan", "best_model.pth"),
    vocoder_config=os.path.join(model_dir, "hifigan", "config.json"),
)
wav = synth.tts(text, speaker_name=speaker)
synth.save_wav(wav, out)
