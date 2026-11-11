# One Sarvam bulbul:v3 call per scene (kabir, pace 1.2, 48 kHz) -> g{N}.wav in the work dir
import json,sys,base64,urllib.request,os
src=os.path.dirname(os.path.abspath(__file__));out=sys.argv[1]
sc=json.load(open(f'{src}/script.json'));G=json.load(open(f'{src}/groups.json'))
only=[int(x) for x in sys.argv[2:]] or range(len(G))
PACE=float(os.environ.get('TTS_PACE','1.1'));TEMP=float(os.environ.get('TTS_TEMP','0.35'))  # steadier prosody than the defaults
for g in only:
    text=' '.join(sc[i][0] for i in G[g])
    body=json.dumps(dict(text=text,target_language_code='hi-IN',speaker='kabir',model='bulbul:v3',pace=PACE,temperature=TEMP,speech_sample_rate=48000)).encode()
    req=urllib.request.Request('https://api.sarvam.ai/text-to-speech',body,{'Content-Type':'application/json','api-subscription-key':'dummy'})
    r=json.load(urllib.request.urlopen(req,timeout=120))
    open(f'{out}/g{g}.wav','wb').write(base64.b64decode(''.join(r['audios'])));print('g',g,'ok')
