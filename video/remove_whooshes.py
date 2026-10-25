import numpy as np, sys
from scipy.signal import stft, istft
from scipy.ndimage import median_filter
sr=44100
x=np.fromfile('st.raw',dtype=np.float32).reshape(-1,2).T
n=4096; hop=1024
out=[]
f,t,Z=stft(x,fs=sr,nperseg=n,noverlap=n-hop)
mag=np.abs(Z)
# whoosh windows: weight 1 inside (with 80ms ramps)
W=[(1.95,2.6),(4.2,4.85),(6.4,7.0),(8.5,9.15),(9.75,13.1)]
wt=np.zeros_like(t)
for a,b in W:
    r=0.08
    wt=np.maximum(wt,np.clip(np.minimum((t-a)/r+1,(b-t)/r+1),0,1))
res=[]
for c in range(2):
    M=mag[c]
    H=median_filter(M,size=(1,int(sys.argv[1])))   # along time -> tonal
    P=median_filter(M,size=(int(sys.argv[2]),1))   # along freq -> noise/whoosh
    mask=H**2/(H**2+P**2+1e-12)
    mask=mask**float(sys.argv[3])
    mask[f>15500,:]=0
    g=(1-wt)[None,:]+wt[None,:]*mask
    # everywhere: kill >15.8k sfx-only band
    g[f>15800,:]=0
    res.append(Z[c]*g)
_,y=istft(np.array(res),fs=sr,nperseg=n,noverlap=n-hop)
y=y[:, :x.shape[1]].T.astype(np.float32)
y.tofile('clean.raw')
