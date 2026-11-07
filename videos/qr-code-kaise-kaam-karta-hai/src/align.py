import json,re,subprocess,numpy as np
sc=json.load(open('script.json'))
out=subprocess.run(['ffmpeg','-i','full.wav','-af','silencedetect=n=-40dB:d=0.1','-f','null','-'],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([0-9.]+)',out)];en=[float(x) for x in re.findall(r'silence_end: ([0-9.]+)',out)]
gaps=[(s,e) for s,e in zip(st,en) if s>0.05]
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','full.wav']))
on=gaps[0][1] if st and st[0]<0.05 else 0
# weights: chars + pause per punctuation
def w(t): return len(t.replace(' ',''))+12*len(re.findall(r'[,।?!]|\.\.\.',t))
W=[w(s[0]) for s in sc];cum=np.cumsum(W)/sum(W)
exp=[on+(dur-on)*c for c in cum[:-1]]
G=len(gaps);K=len(sc)-1
mid=[(a+b)/2 for a,b in gaps];gl=[b-a for a,b in gaps]
INF=1e18;dp=np.full((K,G),INF);bk=np.zeros((K,G),int)
cost=lambda k,g:((mid[g]-exp[k])/2.0)**2-6*gl[g]
for g in range(G): dp[0][g]=cost(0,g)
for k in range(1,K):
    best=INF;bi=-1
    for g in range(G):
        if g>0 and dp[k-1][g-1]<best: best=dp[k-1][g-1];bi=g-1
        if bi>=0: dp[k][g]=best+cost(k,g);bk[k][g]=bi
g=int(np.argmin(dp[K-1]));sel=[g]
for k in range(K-1,0,-1): g=bk[k][g];sel.append(g)
sel=sel[::-1]
bounds=[(on,gaps[sel[0]][0])]+[(gaps[sel[i]][1],gaps[sel[i+1]][0]) for i in range(K-1)]+[(gaps[sel[-1]][1],[s for s,e in gaps if s>gaps[sel[-1]][1]][-1] if any(s>gaps[sel[-1]][1] for s,e in gaps) else dur)]
inner=[[g for g in gaps if b[0]<g[0] and g[1]<b[1]] for b in bounds]
json.dump({'bounds':bounds,'inner':inner},open('align.json','w'))
for i,(b,s) in enumerate(zip(bounds,sc)): print(i,round(b[0],2),round(b[1],2),'gapafter=%.2f'%(gl[sel[i]] if i<K else 0),len(inner[i]),s[1][:40])
