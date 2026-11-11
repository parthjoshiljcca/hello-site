# Frame ranges of the 3D scenes (same conditions as src/Video.tsx), from src/data/timing.json
import json,math,os
T=json.load(open(os.path.join(os.path.dirname(__file__),'../src/data/timing.json')));S=T['scenes']
def rng(i):return math.ceil((S[i]['start']-0.1)*30),math.ceil(S[i+1]['start']*30)-1
SEG=[('amygdala',*rng(1)),('alarm',*rng(3)),('breath',*rng(9))];N=math.ceil(T['TOT']*30)
if __name__=='__main__':
    for k,a,b in SEG:print(k,a,b)
    print('N',N)
