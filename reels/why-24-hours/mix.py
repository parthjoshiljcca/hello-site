import json,subprocess,numpy as np,wave
SR=48000;tl=json.load(open('timeline.json'));T=tl['total'];N=int(T*SR);t=np.arange(N)/SR;L=tl['lines']
def rd(p):
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','s16le','-']);return np.frombuffer(raw,np.int16)/32768
rng=np.random.default_rng(1)
def lp(x,a):  # one-pole lowpass
    from scipy.signal import lfilter; return lfilter([a],[1,a-1],x)
voice=np.zeros(N)
for l in L:
    v=rd(f"audio/{l['id']:02d}.wav");s=int(l['start']*SR);voice[s:s+len(v)]+=v[:N-s]
# ambient drone (A minor-ish), slow swell
amb=np.zeros(N)
for f,a in [(55,.5),(82.41,.35),(110,.3),(164.81,.18),(220,.08),(329.63,.05)]:
    amb+=a*np.sin(2*np.pi*f*t+rng.random()*6)*(0.75+0.25*np.sin(2*np.pi*t/(7+f%5)+f))
amb=lp(amb,0.08);amb*=np.clip(t/3,0,1)*np.clip((T-t)/2,0,1)
logo=L[-2]["start"]-0.1
amb*=np.where(t>logo,1.35,1)
# whooshes at scene changes
fx=np.zeros(N)
def whoosh(at,dur=.45,g=.45):
    n=int(dur*SR);s=int(max(0,at-dur*.6)*SR);w=lp(rng.standard_normal(n),.05);env=np.sin(np.pi*np.linspace(0,1,n))**2;fx[s:s+n]+=g*w*env[:len(fx[s:s+n])]
for a,b in zip(L,L[1:]):
    if b["scene"]!=a["scene"] and b["scene"]!="end": whoosh(b["start"]-.1)
# riser into logo + impact
n=int(1.0*SR);s=int((logo-1.0)*SR);k=np.linspace(0,1,n);ph=2*np.pi*np.cumsum(200+600*k**2)/SR
fx[s:s+n]+=(.12*np.sin(ph)+.25*lp(rng.standard_normal(n),.15))*k**2.5
n=int(3*SR);s=int(logo*SR);k=np.arange(n)/SR
fx[s:s+n]+=.9*np.sin(2*np.pi*(48*k-6*k*k))*np.exp(-k*1.6)+.3*lp(rng.standard_normal(n),.03)*np.exp(-k*3)
# soft piano-like chime on WHY tagline
for i,f in enumerate([440,659.25,880]):
    s=int((L[-1]["start"]+.2+i*.08)*SR);n=int(2.5*SR);k=np.arange(n)/SR;fx[s:s+n]+=.08*np.sin(2*np.pi*f*k)*np.exp(-k*2)
# duck ambient under voice
env=lp(np.abs(voice),.0005);duck=1-.5*np.clip(env/ (env.max()*.3),0,1)
mixd=voice*1.0+amb*.09*duck+fx*.22
mixd/=np.abs(mixd).max()*1.05
with wave.open('out/mix_raw.wav','wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mixd*32767).astype(np.int16).tobytes())
