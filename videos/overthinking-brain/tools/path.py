import json,sys,numpy as np
from scipy.ndimage import gaussian_filter1d,maximum_filter1d
d=json.load(open(sys.argv[1]))
# segment frame ranges (first..last frame where the spheres are on screen)
SEG={'A':(6,205),'B':(516,779),'C':(1085,1153),'D':(1683,1902)}
# frames whose boxes are polluted by other objects -> not used for size
BAD={'A':[(178,205)],'B':[(686,779)],'C':[],'D':[(1683,1826)]}
out={}
for k,(a,b) in SEG.items():
    fr=np.arange(a,b+1)
    raw=np.array([d[f] if d[f] else [np.nan]*5 for f in fr],float)
    w=raw[:,1]-raw[:,0]-14; h=raw[:,3]-raw[:,2]-14; cy=(raw[:,2]+raw[:,3])/2
    good=np.isfinite(w)
    for x0,x1 in BAD[k]: good&=~((fr>=x0)&(fr<=x1))
    # outlier rejection (bubbles/ring spikes) against a rolling median
    med=np.array([np.nanmedian(np.where(good,w,np.nan)[max(0,i-20):i+21]) for i in range(len(fr))])
    good&=np.abs(w-med)<0.12*med
    hm=np.nanmedian(np.where(good,h,np.nan));good&=h<1.25*hm
    gi=np.nonzero(good)[0]
    W=np.interp(np.arange(len(fr)),gi,w[gi]);Hh=np.interp(np.arange(len(fr)),gi,h[gi]);CY=np.interp(np.arange(len(fr)),gi,cy[gi])
    # brain must cover the widest the spheres get while they rotate: running max then smooth
    env=gaussian_filter1d(maximum_filter1d(W,31),6);envH=gaussian_filter1d(maximum_filter1d(Hh,31),6);CY=gaussian_filter1d(CY,8)
    alpha=np.ones(len(fr));pop=np.ones(len(fr))
    if k=='A':  # pop-in from small at the start
        for i in range(len(fr)):
            if fr[i]<24 and np.isfinite(w[i]): pop[i]=min(1,max(0.05,w[i]/env[i]))
    nin=9;nout=8
    alpha[:nin]=np.linspace(0.15,1,nin);alpha[-nout:]=np.linspace(1,0.1,nout)
    if k=='D':  # final zoom 63.1s->cut: follow raw width
        for i in range(len(fr)):
            if fr[i]>=1893 and np.isfinite(w[i]) and abs(raw[i,0]+raw[i,1]-1078)<30: pop[i]=max(1,w[i]/env[i-12])
        alpha[-nout:]=1
    out[k]=[dict(f=int(f),cy=round(float(CY[i]),1),w=round(float(env[i]),1),h=round(float(envH[i]),1),s=round(float(pop[i]),3),a=round(float(alpha[i]),3)) for i,f in enumerate(fr)]
    print(k,'frames',len(fr),'w %.0f-%.0f'%(env.min(),env.max()),'h %.0f-%.0f'%(envH.min(),envH.max()),'cy %.0f-%.0f'%(CY.min(),CY.max()))
json.dump(out,open(sys.argv[2],'w'))
