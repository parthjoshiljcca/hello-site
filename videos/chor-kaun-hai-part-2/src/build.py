# usage: python3 build.py <workdir>   (workdir holds g0..gN.wav from tts.py; writes data.json + voice.npy there)
import json,re,subprocess,sys,os,numpy as np
SR=48000;src=os.path.dirname(os.path.abspath(__file__));W=sys.argv[1]
sc=json.load(open(f'{src}/script.json'));G=json.load(open(f'{src}/groups.json'))
def load(f): return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',f,'-f','s16le','-ac','1','-ar','48000','-']),dtype=np.int16)/32768.
def gaps_of(f):
    out=subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=n=-40dB:d=0.07','-f','null','-'],capture_output=True,text=True).stderr
    return list(zip([float(x) for x in re.findall(r'silence_start: (-?[0-9.]+)',out)],[float(x) for x in re.findall(r'silence_end: ([0-9.]+)',out)]))
PUN=r'(,|\.\.\.|\?|!|\.|:)$'
t=0.35;sent=[None]*len(sc);scenes=[];pieces=[]
for g,ss in enumerate(G):
    f=f'{W}/g{g}.wav';a=load(f);env=np.abs(a)>0.008;idx=np.where(env)[0];s0=idx[0]/SR;e0=idx[-1]/SR
    gaps=[x for x in gaps_of(f) if x[0]>s0+0.05 and x[1]<e0-0.05]
    words=[];sidx=[]
    for i in ss:
        for w in sc[i][1].split(): words.append(w);sidx.append(i)
    cl=[[]]
    for k,w in enumerate(words):
        cl[-1].append(k)
        if (re.search(PUN,w) or (k+1<len(words) and sidx[k+1]!=sidx[k])) and k<len(words)-1: cl.append([])
    L=[sum(len(words[k])+1.5 for k in c) for c in cl];tot=sum(L);acc=0;cb=[]
    for c in L[:-1]: acc+=c;cb.append(s0+(e0-s0)*acc/tot)
    used=set();edges=[s0]
    for x in cb:
        cand=[j for j,gp in enumerate(gaps) if abs((gp[0]+gp[1])/2-x)<0.7 and j not in used]
        if cand:
            j=min(cand,key=lambda j:abs((gaps[j][0]+gaps[j][1])/2-x));used.add(j);edges+=[gaps[j][0],gaps[j][1]]
        else: edges+=[x,x]
    edges.append(e0)
    for k in range(1,len(edges)): edges[k]=max(edges[k],edges[k-1])
    start=t;off=start-s0;wt=[0]*len(words)
    for ci,c in enumerate(cl):
        cs,ce=edges[2*ci],edges[2*ci+1];Lw=[len(words[k])+1.5 for k in c];tw=sum(Lw);tt=cs
        for k,l in zip(c,Lw): wt[k]=round(tt+off,3);tt+=(ce-cs)*l/tw
    clend={}
    for ci,c in enumerate(cl): clend[sidx[c[-1]]]=edges[2*ci+1]+off
    for i in ss:
        ks=[k for k in range(len(words)) if sidx[k]==i]
        sent[i]=dict(words=[words[k] for k in ks],wt=[wt[k] for k in ks],start=wt[ks[0]],end=round(clend[i],3),scene=g)
    pieces.append((g,s0-0.04,e0+0.1,start-0.04))
    scenes.append(dict(start=round(start-0.3 if g else 0,3),sent=ss))
    t=start+(e0-s0)+0.42
TOT=round(t-0.42+3.0,2)
for g in range(len(scenes)): scenes[g]['end']=scenes[g+1]['start'] if g+1<len(scenes) else TOT
N=int(TOT*SR);voice=np.zeros(N)
for g,a0,b0,dst in pieces:
    a=load(f'{W}/g{g}.wav');seg=a[max(0,int(a0*SR)):int(b0*SR)].copy();f=int(0.01*SR);seg[:f]*=np.linspace(0,1,f);seg[-3*f:]*=np.linspace(1,0,3*f)
    o=int(dst*SR);voice[o:o+len(seg)]+=seg[:N-o]
np.save(f'{W}/voice.npy',voice)
fr=SR//30;nf=int(TOT*30);amp=[float(np.sqrt(np.mean(voice[i*fr:(i+1)*fr]**2))) for i in range(nf)];m=max(amp);amp=[round(min(1,x/m*1.2),3) for x in amp]
chunks=[]
for i,s in enumerate(sent):
    w=s['words'];cur=[]
    for k in range(len(w)):
        cur.append(k);endp=re.search(PUN,w[k])
        if (endp and len(cur)>=3) or len(cur)>=7 or k==len(w)-1:
            if k<len(w)-1 and len(w)-1-k<=2 and len(cur)<9: continue
            chunks.append(dict(s=i,idx=cur));cur=[]
for c in chunks: c['t0']=sent[c['s']]['wt'][c['idx'][0]]
for j,c in enumerate(chunks):
    nxt=chunks[j+1]['t0'] if j+1<len(chunks) else TOT
    c['t1']=nxt if (j+1<len(chunks) and chunks[j+1]['s']==c['s']) else min(nxt,sent[c['s']]['end']+0.6)
EV={'jawaab':(0,'jawaab'),'raju':(1,'Raju'),'rumaal':(1,'rumaal'),'trap':(2,'trap'),'khaana':(2,'khaana'),'dadi':(2,'Dadi'),
'vicky':(3,'Vicky'),'sach':(3,'sach'),'patakhe':(3,'patakhe'),'pinky':(4,'Pinky'),'chor':(4,'chor'),'chhat':(5,'chhat'),'chaand':(5,'chaand'),
'diwali':(6,'Diwali'),'nahi':(6,'nahi'),'kyun':(7,'Kyun'),'kartik':(7,'Kartik'),'amavasya':(7,'amavasya'),
'chaand2':(8,'chaand'),'dharti':(8,'dharti'),'suraj':(8,'suraj'),'beech':(8,'beech'),'roshni':(9,'roshni'),'peeche':(9,'peeche'),'hamari':(9,'hamari'),'andhera':(9,'andhera'),
'dikhta':(10,'dikhta'),'bijli':(11,'bijli'),'impossible':(11,'Impossible'),'diye':(12,'diye'),'roshan':(12,'roshan'),
'jhooth':(13,'jhooth'),'haar':(13,'haar'),'wapas':(13,'wapas'),'sahi':(14,'sahi'),'comments':(14,'Comments'),'agla':(14,'Agla')}
ev={}
for k,(i,kw) in EV.items():
    ws=sent[i]['words'];j=[n for n,w in enumerate(ws) if w.lower().startswith(kw.lower())];assert j,(k,kw);ev[k]=sent[i]['wt'][j[0]]
json.dump(dict(TOT=TOT,sent=sent,scenes=scenes,chunks=chunks,amp=amp,ev=ev),open(f'{W}/data.json','w'))
print('TOT',TOT,'chunks',len(chunks));print([round(s['end']-s['start'],2) for s in scenes])
