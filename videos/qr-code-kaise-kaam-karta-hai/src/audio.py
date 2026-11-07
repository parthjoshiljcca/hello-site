import json,numpy as np,wave
from scipy.signal import lfilter
SR=48000;rs=np.random.default_rng(1)
D=json.load(open('data.json'));TOT=D['TOT'];N=int(TOT*SR);ev=D['ev'];scn=D['scenes']
voice=np.load('voice.npy')[:N]
L=np.zeros(N);R=np.zeros(N)
def add(sig,t,g=1.0,pan=0.0):
    o=int(t*SR)
    if o>=N or o<0: return
    s=sig[:N-o]*g;L[o:o+len(s)]+=s*(1-pan)*0.707;R[o:o+len(s)]+=s*(1+pan)*0.707
lp=lambda x,a:lfilter([a],[1,-(1-a)],x);hp=lambda x,a:x-lp(x,a)
noise=lambda d:rs.standard_normal(int(d*SR))
tt=lambda d:np.arange(int(d*SR))/SR
def whoosh(d=0.55):
    n=noise(d);t=np.linspace(0,1,len(n));a=0.02+0.25*np.sin(np.pi*t)**2;y=0;out=np.empty_like(n)
    for i in range(len(n)): y+=a[i]*(n[i]-y);out[i]=y
    return out*np.sin(np.pi*t)**1.5*1.6
def pop(f=900,d=0.09):t=tt(d);fr=f*np.exp(-t*25)+f*0.4;return np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-t*45)
def beep(f=1400,d=0.12):t=tt(d);return np.sin(2*np.pi*f*t)*np.minimum(1,t*200)*np.exp(-t*18)
def tick():t=tt(0.04);return np.sin(2*np.pi*3200*t)*np.exp(-t*200)
def click():t=tt(0.05);return hp(noise(0.05),0.5)*np.exp(-t*160)+np.sin(2*np.pi*2200*t)*np.exp(-t*90)*0.5
def shutter():return np.concatenate([click()*1.2,np.zeros(int(0.05*SR)),click()*0.8])
def ding():
    t=tt(1.8);s=0
    for f,g in [(1318.5,1),(2637,0.35),(1975.5,0.25)]: s=s+g*np.sin(2*np.pi*f*t)*np.exp(-t*(2.5+f/2000))
    return s
def shimmer(d):
    t=tt(d);s=np.zeros_like(t)
    for k in range(12):
        o=rs.uniform(0,d-0.3);f=rs.uniform(2500,5000);i=int(o*SR);u=t[:len(t)-i];s[i:]+=np.sin(2*np.pi*f*u)*np.exp(-u*12)*0.3
    return s
def blips(d,n):
    out=np.zeros(int(d*SR))
    for k in range(n):
        o=int(rs.uniform(0,d-0.06)*SR);b=beep(rs.choice([880,1175,1568,2093]),0.05);out[o:o+len(b)]+=b*0.6
    return out
def glitch():n=noise(0.35);t=tt(0.35);return hp(n,0.3)*(np.sin(2*np.pi*31*t)>0)*np.exp(-t*5)
def scratch():t=tt(0.6);n=noise(0.6);return lp(hp(n,0.2),0.4)*(0.6+0.4*np.sin(2*np.pi*14*t))*np.sin(np.pi*t/0.6)
def rise(): 
    out=np.zeros(int(1.2*SR))
    for k,f in enumerate([523,659,784,1047,1319]): b=beep(f,0.18);o=int(k*0.18*SR);out[o:o+len(b)]+=b
    return out
# scene whooshes
for i,s in enumerate(scn[1:],1): add(whoosh(),s['start']-0.1,0.12,(-1)**i*0.3)
add(beep(1400),0.6,0.12)
pops=['pay','menu','web','square','japan','denso','hundreds','thousands','modules','corners','kahaan','direction','size','orient','website2','text','contact','wifi','payment2','doosre','math','binary2','encoding','error','logo']
for k in pops: add(pop(rs.uniform(850,1250)),ev[k],0.07,rs.uniform(-.4,.4))
for k in ['quick','resp']:
    for j in range(6): add(tick(),ev[k]+j*0.05,0.06,0.2)
add(blips(0.6,10),ev['y1994'],0.07)
add(shutter(),ev['capture'],0.25)
for k in ['read','scanok']: add(beep(1500,0.15),ev[k],0.1)
add(blips(1.2,14),ev['decode'],0.08);add(blips(1.0,10),ev['binary'],0.07)
add(glitch(),ev['twist'],0.15);add(scratch(),ev['scratch']-0.1,0.18)
add(rise(),ev['reconstruct']+0.2,0.08);add(ding(),ev['samajh'],0.1);add(ding(),ev['scanok']+0.5,0.08)
for k,d in [('tech',1.2),('combo',1.2),('samajhte',1.6)]: add(shimmer(d),ev[k],0.12)
a,b=ev['auto'],scn[4]['start'];hum=lp(noise(b-a),0.02)*np.minimum(1,np.arange(int((b-a)*SR))/SR*3)*np.minimum(1,(b-a-np.arange(int((b-a)*SR))/SR)*3);add(hum,a,0.25)
# music
bpm=88;beat=60/bpm;T=np.arange(N)/SR
chords=[[57,60,64,67],[53,57,60,64],[48,55,59,64],[55,59,62,65]]
mus=np.zeros(N);bar=4*beat;ci=0
while ci*bar<TOT:
    ch=chords[ci%4];o=int(ci*bar*SR);n=min(int(bar*SR),N-o);u=np.arange(n)/SR;e=np.minimum(1,u/0.3)*np.minimum(1,(bar-u)/0.3)
    for m in ch:
        f=440*2**((m-69)/12);mus[o:o+n]+=(np.sin(2*np.pi*f*u)+0.3*np.sin(2*np.pi*2*f*u+0.3)+0.1*np.sin(2*np.pi*3*f*u))*e*0.05*(1+0.2*np.sin(2*np.pi*0.5*u))
    f=440*2**((ch[0]-12-69)/12);mus[o:o+n]+=np.sin(2*np.pi*f*u)*e*0.09;ci+=1
mus=lp(mus,0.15)
drum=np.zeros(N);k=0;t=0.0
while t<TOT:
    i=int(t*SR);n=min(int(0.3*SR),N-i);u=np.arange(n)/SR
    if k%8 in (0,5): drum[i:i+n]+=np.sin(2*np.pi*np.cumsum(50+90*np.exp(-u*35))/SR)*np.exp(-u*9)*0.55
    if k%8 in (2,6): drum[i:i+n]+=hp(noise(n/SR),0.4)*np.exp(-u*22)*0.18
    m=min(int(0.05*SR),N-i);drum[i:i+m]+=hp(noise(m/SR),0.7)*np.exp(-np.arange(m)/SR*90)*(0.07 if k%2 else 0.04)
    t+=beat/2;k+=1
drum*=np.minimum(1,np.maximum(0,(T-0.3)/1.0))
bgm=mus+drum*0.35
ve=np.abs(voice);ve=lp(ve,0.0008);ve=ve/ve.max();duck=1-0.7*np.minimum(1,ve*4)
bgm*=duck*0.28;bgm*=np.minimum(1,(TOT-T)/1.5)
fx=np.minimum(1,(TOT-T)/0.5)
Lm=voice*1.3+bgm+L*fx*0.4;Rm=voice*1.3+bgm+R*fx*0.4
st=np.stack([Lm,Rm],1);st=st/np.max(np.abs(st))*0.92
w=wave.open('mix.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype(np.int16).tobytes());w.close()
db=lambda x:20*np.log10(np.sqrt(np.mean(x**2))+1e-9)
m=st.mean(1);vm=np.abs(lp(np.abs(voice),0.001))>0.01
print('voice-region %.1f dB, non-voice %.1f dB'%(db(m[vm]),db(m[~vm])))
