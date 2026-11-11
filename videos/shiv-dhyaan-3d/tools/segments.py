# Frame ranges of the 3D scenes (same conditions as src/Video.tsx), from src/data/timing.json
import json,math,os
T=json.load(open(os.path.join(os.path.dirname(__file__),'../src/data/timing.json')));S=T['scenes'];N=math.ceil(T['TOT']*30)
def rng(i,j=None):
    j=i if j is None else j
    return (0 if i==0 else math.ceil((S[i]['start']-0.1)*30)),(math.ceil(S[j+1]['start']*30)-1 if j+1<len(S) else N-1)
SEG=[('kailash',*rng(0)),('brain',*rng(9,10)),('breath',*rng(15))]
if __name__=='__main__':
    for k,a,b in SEG:print(k,a,b)
    print('N',N)
