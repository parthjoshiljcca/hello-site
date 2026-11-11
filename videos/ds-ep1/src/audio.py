# usage: python3 audio.py <workdir>  (reads data.json + voice.npy, writes mix.wav)
import json,sys,numpy as np,wave
from scipy.signal import lfilter
SR=48000;rs=np.random.default_rng(1)
W=sys.argv[1];D=json.load(open(f'{W}/data.json'));TOT=D['TOT'];N=int(TOT*SR);ev=D['ev'];scn=D['scenes']
voice=np.load(f'{W}/voice.npy')[:N]
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
def tickTock(n):
    out=np.zeros(int(n*0.25*SR)+SR//10)
    for k in range(n): b=tick();o=int(k*0.25*SR);out[o:o+len(b)]+=b*(1 if k%2 else 0.6)
    return out
def ratchet(d,rate=18):
    out=np.zeros(int(d*SR))
    for k in range(int(d*rate)): c=click();o=int(k/rate*SR);out[o:o+len(c)]+=c[:len(out)-o]*0.7
    return out
def buzz(d):t=tt(d);return np.sign(np.sin(2*np.pi*110*t))*np.exp(-t*4)*0.5
def hum(d):t=tt(d);return (np.sin(2*np.pi*60*t)+0.5*np.sin(2*np.pi*120*t))*np.minimum(1,t*4)*np.minimum(1,(d-t)*4)
def rise(): 
    out=np.zeros(int(1.2*SR))
    for k,f in enumerate([523,659,784,1047,1319]): b=beep(f,0.18);o=int(k*0.18*SR);out[o:o+len(b)]+=b
    return out
def heartbeat(n,gap=0.75):
    out=np.zeros(int(n*gap*SR)+SR//2)
    for k in range(n):
        for d,g in [(0,1),(0.18,0.7)]:
            u=tt(0.18);o=int((k*gap+d)*SR);out[o:o+len(u)]+=np.sin(2*np.pi*np.cumsum(45+40*np.exp(-u*30))/SR)*np.exp(-u*22)*g
    return out
def thud():u=tt(0.6);return np.sin(2*np.pi*np.cumsum(38+70*np.exp(-u*18))/SR)*np.exp(-u*5)
def powerdown():u=tt(0.9);f=220*np.exp(-u*3.5)+30;return np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*np.exp(-u*2.5)*0.4
def powerup():u=tt(0.5);f=60+400*u;return np.sin(2*np.pi*np.cumsum(f)/SR)*np.minimum(1,u*8)*np.exp(-u*3)
def creak():u=tt(0.9);f=180+60*np.sin(2*np.pi*3*u);return hp(np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*(0.5+0.5*np.sin(2*np.pi*23*u)),0.3)*np.sin(np.pi*u/0.9)*0.5
def bellT(f=528):
    u=tt(3.0);s=0
    for k,g in [(1,1),(2.76,0.4),(5.4,0.2)]: s=s+g*np.sin(2*np.pi*f*k*u)*np.exp(-u*(1.2+k*0.5))
    return s
def om(d):u=tt(d);return (np.sin(2*np.pi*136.1*u)+0.4*np.sin(2*np.pi*272.2*u)+0.2*np.sin(2*np.pi*68*u))*np.minimum(1,u*1.5)*np.minimum(1,(d-u)*1.5)
def thud():u=tt(0.6);return np.sin(2*np.pi*np.cumsum(38+70*np.exp(-u*18))/SR)*np.exp(-u*5)
def breath(d,inh=True):
    u=tt(d);x=u/d;env=np.sin(np.pi*x)**1.5;n=noise(d)
    return lp(hp(n,0.2),0.15 if inh else 0.09)*env*0.8
def heartbeat(n,gap=0.75):
    out=np.zeros(int(n*gap*SR)+SR//2)
    for k in range(n):
        for d,g in [(0,1),(0.18,0.7)]:
            u=tt(0.18);o=int((k*gap+d)*SR);out[o:o+len(u)]+=np.sin(2*np.pi*np.cumsum(45+40*np.exp(-u*30))/SR)*np.exp(-u*22)*g
    return out
def wind(d):n=lp(noise(d),0.02);u=tt(d);return n*(0.6+0.4*np.sin(2*np.pi*0.3*u))*np.minimum(1,u)*np.minimum(1,(d-u))*3
def tabla(long):
    u=tt(0.5 if long else 0.18);f=180 if long else 320
    return np.sin(2*np.pi*np.cumsum(f*(1+0.6*np.exp(-u*30)))/SR)*np.exp(-u*(6 if long else 22))
def chime():
    u=tt(2.2);s=0
    for f,g in [(880,1),(1320,0.5),(1760,0.3)]: s=s+g*np.sin(2*np.pi*f*u)*np.exp(-u*1.8)
    return s
def datastream(d):
    out=np.zeros(int(d*SR))
    for k in range(int(d*14)):
        b=beep(rs.choice([1568,2093,2637]),0.03);o=int(k/14*SR);out[o:o+len(b)]+=b[:len(out)-o]*0.5
    return out
def tabla(long):
    u=tt(0.5 if long else 0.18);f=180 if long else 320
    return np.sin(2*np.pi*np.cumsum(f*(1+0.6*np.exp(-u*30)))/SR)*np.exp(-u*(6 if long else 22))
def chime():
    u=tt(2.2);s=0
    for f,g in [(880,1),(1320,0.5),(1760,0.3)]: s=s+g*np.sin(2*np.pi*f*u)*np.exp(-u*1.8)
    return s
def jingle():
    out=np.zeros(int(0.7*SR))
    for k in range(7):
        u=tt(0.25);f=rs.uniform(3000,5200);o=int(rs.uniform(0,0.45)*SR);b=np.sin(2*np.pi*f*u)*np.exp(-u*30);out[o:o+len(b)]+=b*0.5
    return out
def clink():u=tt(0.6);return (np.sin(2*np.pi*2350*u)+0.6*np.sin(2*np.pi*3710*u))*np.exp(-u*9)
def wheels(d):
    out=np.zeros(int(d*SR));k=0
    while k*0.42<d-0.2:
        for dd in [0,0.11]:
            o=int((k*0.42+dd)*SR);b=click()*1.2;out[o:o+len(b)]+=b[:len(out)-o]
        k+=1
    return out+lp(noise(d),0.03)*0.6
def horn():u=tt(1.0);return (np.sign(np.sin(2*np.pi*311*u))+np.sign(np.sin(2*np.pi*370*u)))*0.25*np.minimum(1,u*20)*np.minimum(1,(1-u)*6)
def pour(d):return lp(hp(noise(d),0.3),0.2)*np.sin(np.pi*tt(d)/d)*1.5
def clunk():u=tt(0.4);return np.sin(2*np.pi*np.cumsum(120+200*np.exp(-u*40))/SR)*np.exp(-u*14)+hp(noise(0.4),0.4)*np.exp(-u*60)*0.5
def type_(n):
    out=np.zeros(int(n*0.09*SR)+SR//10)
    for k in range(n): b=click();o=int(k*0.09*SR);out[o:o+len(b)]+=b*0.6
    return out
# ---------- cinematic layer ----------
from scipy.signal import fftconvolve
def braam(d=2.6):
    u=tt(d);env=np.minimum(1,u/0.12)*np.exp(-u*1.3)
    saw=lambda f:2*((f*u)%1)-1
    x=(saw(55)+saw(82.4)*0.7+saw(110.5)*0.4);x=lp(lp(x,0.06),0.06)
    return (x*1.6+np.sin(2*np.pi*41*u)*0.9)*env
def impact():
    u=tt(1.6);sub=np.sin(2*np.pi*np.cumsum(32+90*np.exp(-u*14))/SR)*np.exp(-u*3.2)
    hit=hp(noise(1.6),0.2)*np.exp(-u*28)*0.8
    return sub*1.2+hit
def swoop(d=2.0,up=True):
    n=noise(d);x=np.linspace(0,1,len(n));env=np.sin(np.pi*x)**1.2*(x if up else 1-x)**0.3
    y=0;out=np.empty_like(n);a=0.006+0.22*(x if up else 1-x)**2
    for i in range(len(n)): y+=a[i]*(n[i]-y);out[i]=y
    return out*env*2.2
def shimmerTail(d=2.5):
    u=tt(d);s=np.zeros_like(u)
    for f in [1320,1760,2217,2640]: s+=np.sin(2*np.pi*f*u)*np.exp(-u*1.5)*0.25
    return s
# scene transitions: soft riser + sub thump
def riser(d=0.9):
    n=noise(d);x=np.linspace(0,1,len(n));y=0;out=np.empty_like(n);a=0.01+0.4*x**2
    for i in range(len(n)): y+=a[i]*(n[i]-y);out[i]=y
    return out*x**2*1.2
for i,s in enumerate(scn[1:],1):
    add(whoosh(),s['start']-0.1,0.1,(-1)**i*0.3);add(riser(),s['start']-0.85,0.08)
    u=tt(0.5);add(np.sin(2*np.pi*np.cumsum(40+60*np.exp(-u*20))/SR)*np.exp(-u*6),s['start']+0.05,0.3)
# hook: phone + data
add(impact(),0.05,0.45);add(swoop(2.0),0.2,0.14);add(blips(2.4,24),ev['photos'],0.05)
add(swoop(1.2),ev['naam']-0.3,0.12);add(type_(6),ev['naam'],0.12);add(impact(),ev['palak'],0.35);add(shimmerTail(),ev['palak']+0.1,0.07)
add(braam(3.0),ev['ds']-0.1,0.24);add(shimmerTail(),ev['ds']+0.2,0.07)
# room analogy
add(pop(800),ev['sawaal'],0.06);add(jingle(),ev['chaabi'],0.12);add(scratch(),ev['kone'],0.05);add(tickTock(10),ev['time']-0.3,0.06)
add(jingle(),ev['keyholder'],0.14);add(ding(),ev['second'],0.08);add(chime(),ev['tezi'],0.06)
add(braam(),ev['crore'],0.14);add(blips(1.6,16),ev['username'],0.05);add(buzz(0.4),ev['slow'],0.05);add(impact(),ev['palak2'],0.3)
add(shimmerTail(),ev['reallife'],0.07)
# array train (tracking shot)
add(wheels(7.5),scn[9]['start']-0.1,0.12);add(horn(),ev['train']-0.2,0.08);add(swoop(0.9),ev['seedhe']-0.35,0.16);add(impact(),ev['seedhe']+0.1,0.3);add(ding(),ev['array'],0.08)
# linked list
for k in range(4): add(pop(900+80*k),ev['clue']+k*0.5,0.06)
add(chime(),ev['linked'],0.08)
# stack plates (crane)
add(swoop(1.6),scn[11]['start']-0.2,0.12)
for k in range(6): add(clink(),ev['plates']-0.35+k*0.25,0.07)
add(swoop(0.7),ev['pehle'],0.12);add(ding(),ev['pehle']+0.5,0.06)
add(type_(8),scn[12]['start']+0.3,0.1);add(whoosh(0.5),ev['undo'],0.12)
# queue chai
add(pour(1.4),ev['chai'],0.1);add(ding(),ev['queue'],0.07)
# tree
for k in range(7): add(pop(700+60*k),ev['family']+k*0.3,0.05)
add(chime(),ev['folders'],0.06)
# graph metro (orbit)
add(swoop(2.0),scn[15]['start']-0.2,0.14);add(chime(),ev['station'],0.07);add(impact(),ev['graph'],0.3)
add(blips(1.2,8),ev['raasta'],0.05)
# hash locker
add(clunk(),ev['kholo'],0.3);add(ding(),ev['hash'],0.08)
# why + recap
add(braam(3.0),ev['badhta']-0.2,0.2);add(impact(),ev['speed'],0.3)
for k in ['r_array','r_linked','r_stack','r_queue','r_tree','r_graph','r_hash']: add(pop(1000),ev[k],0.06)
add(braam(3.0),ev['agle'],0.18);add(shimmerTail(),ev['follow'],0.07);add(ding(),ev['comments']+0.2,0.07)
# reverb send on the SFX bus
ir_t=tt(1.8);ir=rs.standard_normal(len(ir_t))*np.exp(-ir_t*3.2);ir=lp(ir,0.3);ir/=np.sqrt(np.sum(ir**2))
L=L+0.35*fftconvolve(L,ir)[:N];R=R+0.35*fftconvolve(R,ir[::-1].copy())[:N]
# music: locked 112bpm structure, original uplifting progression (Am-F-C-G)
bpm=112;beat=60/bpm;T=np.arange(N)/SR;bar=4*beat
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]
mus=np.zeros(N);ci=0
while ci*bar<TOT:
    ch=chords[ci%4];o=int(ci*bar*SR);n=min(int(bar*SR),N-o);u=np.arange(n)/SR;e=np.minimum(1,u/0.05)*np.minimum(1,(bar-u)/0.1)
    for m in ch:
        f=440*2**((m-69)/12);mus[o:o+n]+=(np.sin(2*np.pi*f*u)+0.25*np.sin(2*np.pi*2*f*u))*e*0.03
    # 16th arp plucks
    notes=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+12]
    for k in range(16):
        po=int(k*beat/4*SR);pn=min(int(0.16*SR),n-po)
        if pn<=0: break
        pu=np.arange(pn)/SR;f=440*2**((notes[k%4]-69)/12)
        mus[o+po:o+po+pn]+=(np.sin(2*np.pi*f*pu)+0.4*np.sign(np.sin(2*np.pi*f*pu))*0.3)*np.exp(-pu*28)*0.05
    # pulsing bass 8ths
    f=440*2**((ch[0]-24-69)/12)
    for k in range(8):
        po=int(k*beat/2*SR);pn=min(int(beat/2*SR),n-po)
        if pn<=0: break
        pu=np.arange(pn)/SR;mus[o+po:o+po+pn]+=np.sin(2*np.pi*f*pu)*np.exp(-pu*7)*0.13
    ci+=1
mus=lp(mus,0.25)
drum=np.zeros(N);k=0;t=0.0
while t<TOT:
    i=int(t*SR);n=min(int(0.3*SR),N-i);u=np.arange(n)/SR
    if k%4==0: drum[i:i+n]+=np.sin(2*np.pi*np.cumsum(48+110*np.exp(-u*40))/SR)*np.exp(-u*10)*0.6
    if k%8==4: drum[i:i+n]+=hp(noise(n/SR),0.35)*np.exp(-u*20)*0.22
    m=min(int(0.04*SR),N-i);drum[i:i+m]+=hp(noise(m/SR),0.75)*np.exp(-np.arange(m)/SR*110)*(0.08 if k%2 else 0.05)
    t+=beat/4;k+=1
drum*=np.minimum(1,np.maximum(0,(T-0.2)/0.6))
bgm=mus+drum*0.35
ve=np.abs(voice);ve=lp(ve,0.0008);ve=ve/ve.max();duck=1-0.7*np.minimum(1,ve*4)
bgm*=duck*0.28;bgm*=np.minimum(1,(TOT-T)/1.5)
fx=np.minimum(1,(TOT-T)/0.5)*(1-0.6*np.minimum(1,ve*4))   # SFX bus sidechain-ducked under narration
Lm=voice*1.3+bgm+L*fx*0.4;Rm=voice*1.3+bgm+R*fx*0.4
st=np.stack([Lm,Rm],1);st=st/np.max(np.abs(st))*0.92
w=wave.open(f'{W}/mix.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype(np.int16).tobytes());w.close()
db=lambda x:20*np.log10(np.sqrt(np.mean(x**2))+1e-9)
m=st.mean(1);vm=np.abs(lp(np.abs(voice),0.001))>0.01
print('voice-region %.1f dB, non-voice %.1f dB'%(db(m[vm]),db(m[~vm])))
sfx=((L+R)/2*fx*0.4)[:len(m)];bg=bgm[:len(m)]
print('in voice regions: voice %.1f dB | sfx %.1f dB | music %.1f dB'%(db(voice[:len(m)][vm]*1.3),db(sfx[vm]),db(bg[vm])))
import numpy as _n;w=int(0.4*SR);pk=max(db(sfx[k:k+w]) for k in range(0,len(sfx)-w,w//2) if vm[k:k+w].mean()>0.5)
print('loudest SFX window under voice %.1f dB'%pk)
