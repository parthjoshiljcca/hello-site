# Frame ranges of the 3D scenes (same conditions as src/Video.tsx), from src/data/timing.json
import json,math,os
T=json.load(open(os.path.join(os.path.dirname(__file__),'../src/data/timing.json')));S=T['scenes'];N=math.ceil(T['TOT']*30)
def rng(i,j=None):
    j=i if j is None else j
    return (0 if i==0 else math.ceil((S[i]['start']-0.1)*30)),(math.ceil(S[j+1]['start']*30)-1 if j+1<len(S) else N-1)
SEG=[("hook",*rng(0)),("nodes",*rng(3,7)),("insert",*rng(8,12)),("traverse",*rng(13,14)),("doubly",*rng(17))]
_c=[];_e=-1
for k,a,b in SEG: a=max(a,_e+1);_c.append((k,a,b));_e=b   # adjacent 3D segments must not overlap
SEG=_c
if __name__=='__main__':
    for k,a,b in SEG:print(k,a,b)
    print('N',N)
