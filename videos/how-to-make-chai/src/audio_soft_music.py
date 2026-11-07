import json,numpy as np,wave
SR=48000;N=30*SR;rs=np.random.default_rng(1)
sc=json.load(open('timeline.json'));St=[s['start'] for s in sc];E=[s['end'] for s in sc]
voice=np.load('voice.npy')
L=np.zeros(N);R=np.zeros(N)
def add(sig,t,g=1.0,pan=0.0):
    o=int(t*SR); 
    if o>=N: return
    s=sig[:N-o]*g; L[o:o+len(s)]+=s*(1-pan)*0.5*2**0.5*1.0; R[o:o+len(s)]+=s*(1+pan)*0.5*2**0.5
def env(n,a,r):
    e=np.ones(n);ai=int(a*SR);ri=int(r*SR)
    if ai: e[:ai]=np.linspace(0,1,ai)
    if ri: e[-ri:]*=np.linspace(1,0,ri)
    return e
def lp(x,a): # one-pole lowpass, a in (0,1)
    y=np.zeros_like(x);acc=0
    from scipy.signal import lfilter
    return lfilter([a],[1,-(1-a)],x)
def hp(x,a): return x-lp(x,a)
def noise(d): return rs.standard_normal(int(d*SR))
def whoosh(d=0.55):
    n=noise(d);t=np.linspace(0,1,len(n))
    from scipy.signal import lfilter
    out=np.zeros_like(n);blk=480;st=0
    # sweep: varying lowpass coefficient
    a=0.02+0.25*np.sin(np.pi*t)**2;y=0
    out=np.empty_like(n)
    for i in range(len(n)): y+=a[i]*(n[i]-y); out[i]=y
    return out*np.sin(np.pi*t)**1.5*1.6
def pop(f=900,d=0.09):
    t=np.arange(int(d*SR))/SR;fr=f*np.exp(-t*25)+f*0.4
    return np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-t*45)
def plop(f=380):
    t=np.arange(int(0.22*SR))/SR;fr=f*(1+2.5*np.exp(-t*30))
    s=np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-t*22)
    sp=hp(noise(0.22),0.3)*np.exp(-t*30)*0.25
    return s+sp
def click(): t=np.arange(int(0.05*SR))/SR; return (hp(noise(0.05),0.5)*np.exp(-t*160)+np.sin(2*np.pi*2200*t)*np.exp(-t*90)*0.5)
def pourn(d): n=noise(d);x=lp(hp(n,0.08),0.25);m=1+0.35*np.sin(2*np.pi*7*np.arange(len(n))/SR)*rs.uniform(.5,1); return x*m*env(len(n),0.15,0.25)
def tick(): t=np.arange(int(0.04*SR))/SR; return np.sin(2*np.pi*3200*t)*np.exp(-t*200)
def ding():
    t=np.arange(int(2.0*SR))/SR;s=0
    for f,g in [(1318.5,1),(2637,0.35),(1975.5,0.25),(3951,0.1)]: s=s+g*np.sin(2*np.pi*f*t)*np.exp(-t*(2.5+f/2000))
    return s
def ignite(): n=noise(0.7);t=np.arange(len(n))/SR; return lp(n,0.12)*np.minimum(1,t*20)*np.exp(-t*4)*1.5
def bubble():
    d=rs.uniform(.03,.07);t=np.arange(int(d*SR))/SR;f=rs.uniform(500,1400)
    return np.sin(2*np.pi*np.cumsum(f*(1+t*25))/SR)*np.sin(np.pi*t/d)
def shimmer(d):
    t=np.arange(int(d*SR))/SR;s=np.zeros_like(t)
    for k in range(14):
        o=rs.uniform(0,d-0.3);f=rs.uniform(2500,5000);i=int(o*SR);tt=t[:len(t)-i]
        s[i:]+=np.sin(2*np.pi*f*tt)*np.exp(-tt*12)*0.3
    return s
# --- scene events ---
add(whoosh(0.8),0.0,0.25)
for i in range(1,7): add(whoosh(),St[i]-0.15,0.32,(-1)**i*0.3)
add(pop(700),0.1,0.18)
for k in range(5): add(pop(1100+k*120,0.07),0.45+k*0.15,0.12,(k-2)*0.2)
s=St[1]; add(click(),s+0.1,0.35,0.5); add(ignite(),s+0.33,0.35); add(pourn(1.05),s+0.6,0.45,0.2)
# flame hiss + boil bubbles
a,b=St[1]+0.35,St[5]+2.95
h=lp(hp(noise(b-a),0.2),0.5)*env(int((b-a)*SR),0.4,0.4); add(h,a,0.035)
ba,bb=St[1]+1.6,St[5]+3.0;t=ba
while t<bb:
    amp=min(1,(t-ba)/1.3); add(bubble(),t,0.07*amp,rs.uniform(-.5,.5)); t+=rs.uniform(0.025,0.11)
s=St[2]
for d in [0.55,0.75,0.95]: add(plop(330),s+d+0.45,0.32,rs.uniform(-.3,.3))
for d in [1.5,1.7]: add(plop(520),s+d+0.45,0.28,0.2)
add(pop(1000),s+0.55,0.12,-0.5); add(pop(1250),s+1.5,0.12,0.5)
s=St[3]; n=hp(noise(0.8),0.5)*(rs.random(int(0.8*SR))>0.97)*env(int(0.8*SR),0.1,0.2); add(n*3,s+0.6,0.15)
t=s+1.4
while t<E[3]-0.25: add(tick(),t,0.12,0.6); t+=0.25
add(pop(900),s+1.2,0.12,0.5)
s=St[4]; add(pourn(1.4),s+0.5,0.4,0.25)
for d in [2.45,2.65,2.85]: add(plop(600),s+d,0.22)
add(pop(1000),s+0.6,0.12,-0.5); add(pop(1250),s+2.0,0.12,0.5)
s=St[5]
for a0 in [0.35,1.55]:
    n=lp(noise(1.1),0.03);add(n*np.sin(np.linspace(0,np.pi,len(n)))*3,s+a0,0.35)
add(pop(900),s+0.6,0.14,-0.5); add(pop(1050),s+1.8,0.14,-0.5)
add(click(),s+2.85,0.4,0.5); n=lp(noise(0.4),0.1);add(n*np.exp(-np.arange(len(n))/SR*10),s+2.9,0.4); add(pop(800),s+2.9,0.12,0.5)
s=St[6]; add(pourn(2.1),s+0.7,0.4,0.1); add(ding(),s+3.3,0.22); add(shimmer(1.6),s+3.1,0.35); add(pop(1200),s+3.3,0.12)
# --- music: lofi pad + beat ---
bpm=88;beat=60/bpm;T=np.arange(N)/SR
chords=[[57,60,64,67],[53,57,60,64],[48,55,59,64],[55,59,62,65]]
mus=np.zeros(N);bar=4*beat
for ci in range(int(30/bar)+1):
    ch=chords[ci%4];o=int(ci*bar*SR);n=min(int(bar*SR),N-o)
    if n<=0: break
    tt=np.arange(n)/SR;e=np.minimum(1,tt/0.3)*np.minimum(1,(bar-tt)/0.3)
    for m in ch:
        f=440*2**((m-69)/12)
        mus[o:o+n]+=(np.sin(2*np.pi*f*tt)+0.3*np.sin(2*np.pi*2*f*tt+0.3)+0.1*np.sin(2*np.pi*3*f*tt))*e*0.05*(1+0.2*np.sin(2*np.pi*0.5*tt))
    f=440*2**((ch[0]-12-69)/12); mus[o:o+n]+=np.sin(2*np.pi*f*tt)*e*0.09
mus=lp(mus,0.15)
drum=np.zeros(N);k=0;t=0.0
while t<30:
    i=int(t*SR);n=min(int(0.3*SR),N-i);tt=np.arange(n)/SR
    if k%8 in (0,5): drum[i:i+n]+=np.sin(2*np.pi*np.cumsum(50+90*np.exp(-tt*35))/SR)*np.exp(-tt*9)*0.55
    if k%8 in (2,6):
        sn=hp(noise(n/SR),0.4)*np.exp(-tt*22)*0.18; drum[i:i+n]+=sn
    m=min(int(0.05*SR),N-i);hh=hp(noise(m/SR),0.7)*np.exp(-np.arange(m)/SR*90)*(0.07 if k%2 else 0.04); drum[i:i+m]+=hh
    t+=beat/2;k+=1
drum*=np.minimum(1,np.maximum(0,(T-0.3)/1.0))
bgm=mus+drum*0.35
# duck
ve=np.abs(voice);ve=lp(ve,0.0008);ve=ve/ve.max();duck=1-0.7*np.minimum(1,ve*4)
bgm*=duck*0.28
bgm*=np.minimum(1,(30-T)/1.2)  # fade out
fx_fade=np.minimum(1,(30-T)/0.5)
Lm=voice*1.3+bgm+L*fx_fade*0.75;Rm=voice*1.3+bgm+R*fx_fade*0.75
st=np.stack([Lm,Rm],1);st=st/np.max(np.abs(st))*0.92
w=wave.open('mix2.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype(np.int16).tobytes());w.close()
print('done')
