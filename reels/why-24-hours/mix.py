import json,subprocess,numpy as np,wave
from scipy.signal import lfilter
SR=48000;tl=json.load(open('timeline.json'));T=tl['total'];N=int(T*SR);t=np.arange(N)/SR;L={l['id']:l for l in tl['lines']};LL=tl['lines']
rng=np.random.default_rng(1)
lp=lambda x,a:lfilter([a],[1,a-1],x)
hp=lambda x,a:x-lp(x,a)
def rd(p):return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','s16le','-']),np.int16)/32768
def add(buf,at,x,g=1.0):
    s=int(at*SR);
    if s<0:x=x[-s:];s=0
    e=min(N,s+len(x));buf[s:e]+=g*x[:e-s]
end=lambda i:L[i]['start']+L[i]['dur']          # end of speech of line i
voice=np.zeros(N)
for l in LL:add(voice,l['start'],rd(f"audio/{l['id']:02d}.wav"))
# ---- sound kit ----
def tick(hi=1.0):n=int(.05*SR);k=np.arange(n)/SR;return hp(rng.standard_normal(n),.3)*np.exp(-k*180)*.6+np.sin(2*np.pi*2600*hi*k)*np.exp(-k*90)*.4
def boom(d=2.2,f0=62,f1=34):n=int(d*SR);k=np.arange(n)/SR;f=f1+(f0-f1)*np.exp(-k*3);x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-k*1.8)+.5*lp(rng.standard_normal(n),.01)*np.exp(-k*4);return np.tanh(1.6*x)
def swell(d=.9):n=int(d*SR);k=np.linspace(0,1,n);nz=rng.standard_normal(n);x=(lp(nz,.02)*(1-k)+lp(nz,.14)*k)*6+.4*np.sin(2*np.pi*np.cumsum(80+140*k**2)/SR);return x*k**3
def wind(d=2.5):n=int(d*SR);k=np.linspace(0,1,n);x=lp(lp(rng.standard_normal(n),.03),.05)*20;return x*np.sin(np.pi*k)**1.5
def heart():n=int(.9*SR);x=np.zeros(n);k=np.arange(int(.25*SR))/SR;th=np.sin(2*np.pi*52*k)*np.exp(-k*22);x[:len(th)]+=th;x[int(.24*SR):int(.24*SR)+len(th)]+=.7*th;return x
def gears(d):
    n=int(d*SR);x=np.zeros(n);p=0.0
    while p<d-.06:
        s=int(p*SR);tk=tick(.55+rng.random()*.3);x[s:s+len(tk)]+=tk[:n-s]*(.5+.5*rng.random());p+=.09+rng.random()*.12
    return x+.15*lp(rng.standard_normal(n),.004)*8
fx=np.zeros(N);amb_gain=np.ones(N)
# ticking clock from the start, stops dead at end of the hook question (line 4)
stop=end(4)
for k in np.arange(.15,stop,.5):add(fx,k,tick(),.55)
add(fx,stop-.85,swell(.85),.55)                       # swell into silence
add(fx,stop+.05,boom(),.9)                            # deep low boom after "kyun nahi?"
add(fx,end(3)-.6,swell(.6),.25)                       # small lift after line 3
# Babylon reveal: wind + low boom
add(fx,L[10]['start']-.4,wind(2.6),.5);add(fx,end(10)+.05,boom(2.0,58,32),.75)
# twist: swell into + boom
add(fx,end(15)-.6,swell(.6),.45);add(fx,end(15)+.03,boom(1.6,70,40),.6)
# "Toh agli baar..." pause: heartbeat
add(fx,end(20)+.05,heart(),.9)
# clock scene ticks (lines 12-14) and tower gears (19)
for k in np.arange(L[12]['start'],end(14)+.1,.5):add(fx,k,tick(),.35)
add(fx,L[19]['start'],gears(L[19]['dur']+.2),.35)
# desert/sundial ambience
add(fx,L[5]['start'],wind(L[6]['start']+L[6]['dur']-L[5]['start']),.25)
# music bed
amb=np.zeros(N)
for f,a in [(55,.5),(82.41,.35),(110,.3),(164.81,.18),(220,.08),(329.63,.05)]:amb+=a*np.sin(2*np.pi*f*t+rng.random()*6)*(.75+.25*np.sin(2*np.pi*t/(7+f%5)+f))
amb=lp(amb,.08)*np.clip(t/2,0,1)*np.clip((T-t)/2,0,1)
for l in LL:                                          # dip the bed during dramatic pauses
    if l['pause']>0:
        a,b=end(l['id'])+.02,end(l['id'])+l['pause'];w=np.clip(np.minimum((t-a)/.15,(b+.4-t)/.4),0,1);amb_gain*=1-.85*w
amb*=amb_gain
# logo: warm deep hit + chime
logo=LL[-2]['start']-.1;add(fx,logo-.7,swell(.7),.35);add(fx,logo,boom(3.0,55,30),.8)
for i,f in enumerate([440,659.25,880]):n=int(2.5*SR);k=np.arange(n)/SR;add(fx,LL[-1]['start']+.2+i*.08,np.sin(2*np.pi*f*k)*np.exp(-k*2),.08)
env=lp(np.abs(voice),.0005);duck=1-.5*np.clip(env/(env.max()*.3),0,1)
mix=voice+amb*.09*duck+fx*.22
mix/=np.abs(mix).max()*1.05
with wave.open('out/mix_raw.wav','wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes())
print('ok')
