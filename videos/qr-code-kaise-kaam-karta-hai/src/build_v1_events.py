import json,re,subprocess,numpy as np,qrcode
SR=48000
sc=json.load(open('script.json'))
B=[(0,2.46),(2.52,9.27),(9.60,16.85),(17.21,20.38),(20.72,23.23),(23.55,34.91),(35.38,37.99),(38.52,40.64),(40.86,42.22),(42.5,48.28),(48.6,50.99),(51.29,56.76),(57.1,63.15),(63.51,69.75),(70.09,78.66),(78.95,86.14),(86.47,92.32),(92.62,99.37),(99.52,102.03),(102.71,109.59),(109.92,111.44),(111.86,115.44),(115.78,126.64),(126.88,128.28),(128.69,131.59),(131.93,139.78),(140.01,140.38),(140.63,151.08),(151.4,159.25)]
GROUPS=[[0,1],[2,3],[4],[5],[6],[7,8],[9,10,11],[12],[13,14],[15,16],[17],[18,19,20],[21,22],[23,24,25],[26,27,28]]
a=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i','full.wav','-f','s16le','-ac','1','-ar','48000','-']),dtype=np.int16)/32768.
out=subprocess.run(['ffmpeg','-i','full.wav','-af','silencedetect=n=-40dB:d=0.1','-f','null','-'],capture_output=True,text=True).stderr
gaps=list(zip([float(x) for x in re.findall(r'silence_start: ([0-9.]+)',out)],[float(x) for x in re.findall(r'silence_end: ([0-9.]+)',out)]))
sceneOf={s:g for g,ss in enumerate(GROUPS) for s in ss}
# place sentences
t=0.5;sent=[];pieces=[]
for i,(s,e) in enumerate(B):
    if i>0:
        prevgap=s-B[i-1][1]
        if sceneOf[i]!=sceneOf[i-1]: pause=0.95
        else:
            r=sc[i-1][1].rstrip()
            pause=0.6 if r.endswith('...') else 0.5 if r.endswith('?') else 0.38
        t+=max(prevgap,pause)
    pre=min(0.04,(s-B[i-1][1])/2) if i else min(0.04,s)
    post=min(0.12,(B[i+1][0]-e)/2) if i+1<len(B) else 0.15
    pieces.append((s-pre,e+post,t-pre))
    # word timings
    words=sc[i][1].split();vs=t
    clauses=[[]]
    for k,w in enumerate(words):
        clauses[-1].append(w)
        if re.search(r'(,|\.\.\.|\?|!)$',w) and k<len(words)-1: clauses.append([])
    inner=[g for g in gaps if s<g[0] and g[1]<e]
    # expected clause boundary times by proportion
    L=[sum(len(w)+1.5 for w in c) for c in clauses];tot=sum(L);cb=[];acc=0
    for c in L[:-1]: acc+=c;cb.append(s+(e-s)*acc/tot)
    snapped=[]
    for x in cb:
        cand=[g for g in inner if abs((g[0]+g[1])/2-x)<0.9 and g not in snapped]
        snapped.append(min(cand,key=lambda g:abs((g[0]+g[1])/2-x)) if cand else None)
    edges=[s];
    for x,g in zip(cb,snapped): edges+= [g[0],g[1]] if g else [x,x]
    edges.append(e)
    wt=[]
    for ci,c in enumerate(clauses):
        cs,ce=edges[2*ci],edges[2*ci+1];Lw=[len(w)+1.5 for w in c];tw=sum(Lw);tt=cs
        for l in Lw: wt.append(round(vs+(tt-s),3));tt+=(ce-cs)*l/tw
    sent.append(dict(words=words,wt=wt,start=round(vs,3),end=round(vs+e-s,3),scene=sceneOf[i]))
    t+=e-s
TOT=round(t+1.6,2)
N=int(TOT*SR);voice=np.zeros(N)
for s0,e0,dst in pieces:
    seg=a[int(s0*SR):int(e0*SR)].copy();f=int(0.01*SR);seg[:f]*=np.linspace(0,1,f);seg[-f*3:]*=np.linspace(1,0,f*3)
    o=int(dst*SR);voice[o:o+len(seg)]+=seg
np.save('voice.npy',voice)
fr=SR//30;nf=int(TOT*30);amp=[float(np.sqrt(np.mean(voice[i*fr:(i+1)*fr]**2))) for i in range(nf)];m=max(amp);amp=[round(min(1,x/m*1.2),3) for x in amp]
scenes=[]
for g,ss in enumerate(GROUPS):
    st=0 if g==0 else sent[ss[0]]['start']-0.45
    scenes.append(dict(start=round(st,3),sent=ss))
for g in range(len(scenes)): scenes[g]['end']=scenes[g+1]['start'] if g+1<len(scenes) else TOT
# captions chunks: max 7 words, split at clause punctuation preferably
chunks=[]
for i,s in enumerate(sent):
    w=s['words'];cur=[]
    for k in range(len(w)):
        cur.append(k)
        endp=re.search(r'(,|\.\.\.|\?|!|\.)$',w[k])
        if (endp and len(cur)>=3) or len(cur)>=7 or k==len(w)-1:
            # avoid tiny trailing chunk
            if k<len(w)-1 and len(w)-1-k<=2 and len(cur)<9: continue
            chunks.append(dict(s=i,idx=cur));cur=[]
for c in chunks:
    s=sent[c['s']];c['t0']=s['wt'][c['idx'][0]]
for j,c in enumerate(chunks):
    nxt=chunks[j+1]['t0'] if j+1<len(chunks) else TOT
    c['t1']=min(nxt,sent[c['s']]['end']+0.9 if (j+1<len(chunks) and chunks[j+1]['s']!=c['s']) else nxt) if j+1<len(chunks) else sent[c['s']]['end']+1.2
EV={'pay':(1,'payment'),'menu':(1,'menu'),'web':(1,'website'),'square':(2,'square'),'info':(2,'information'),'tech':(3,'fascinating'),
'quick':(4,'Quick'),'resp':(4,'Response'),'code':(4,'Code'),'y1994':(5,'1994'),'japan':(5,'Japan'),'denso':(5,'Denso'),'auto':(5,'automobile'),'track':(5,'track'),
'duniya':(6,'duniya'),'samjho':(7,'samajhte'),'dekho':(8,'dhyaan'),'hundreds':(9,'hundreds'),'thousands':(9,'thousands'),'modules':(9,'modules'),
'random':(10,'randomly'),'pattern':(11,'pattern'),'encoded':(11,'encoded'),'camera':(12,'camera'),'capture':(12,'capture'),
'corners':(13,'corners'),'identify':(13,'identify'),'kahaan':(14,'kahaan'),'direction':(14,'direction'),'size':(14,'size'),'orient':(14,'orientation'),
'read':(15,'read'),'decode':(15,'decode'),'binary':(16,'binary'),'zeros':(16,'zeros'),'phone':(17,'phone'),'samajh':(17,'samajh'),
'twist':(18,'twist'),'scratch':(19,'scratch'),'logo':(19,'logo'),'scanok':(20,'scan'),'reed':(21,'Reed-Solomon'),'recovery':(22,'recovery'),'reconstruct':(22,'reconstruct'),
'important':(23,'important'),'website2':(24,'website'),'text':(25,'text'),'contact':(25,'contact'),'wifi':(25,'Wi-Fi'),'payment2':(25,'payment'),'doosre':(25,'doosre'),
'socho':(26,'Socho'),'math':(27,'mathematics'),'binary2':(27,'binary'),'encoding':(27,'encoding'),'error':(27,'error'),'combo':(27,'combination'),'dekhte':(28,'dekhte'),'samajhte':(28,'samajhte')}
ev={}
for k,(i,kw) in EV.items():
    ws=sent[i]['words'];j=[n for n,w in enumerate(ws) if w.lower().startswith(kw.lower())]
    assert j,(k,kw);ev[k]=ws and sent[i]['wt'][j[0]]
q=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H,border=0);q.add_data('THE WHY SPACES');q.make(fit=True)
mat=[[1 if v else 0 for v in r] for r in q.get_matrix()]
json.dump(dict(TOT=TOT,sent=sent,scenes=scenes,chunks=chunks,amp=amp,ev=ev,qr=mat),open('data.json','w'))
print('TOT',TOT,'qr',len(mat),'chunks',len(chunks))
for g,s in enumerate(scenes): print(g,s['start'],round(s['end']-s['start'],2))
