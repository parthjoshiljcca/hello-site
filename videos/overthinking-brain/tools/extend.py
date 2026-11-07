import sys,subprocess,numpy as np,json
path=json.load(open(sys.argv[1]));fade=json.load(open(sys.argv[2]));F=sys.argv[3]
EXT={'A':(4,206),'B':(514,781),'C':(1085,1153),'D':(1680,1907)}
W,H=540,960
p=subprocess.Popen(['ffmpeg','-v','error','-i',F,'-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
frames=[]
while True:
    b=p.stdout.read(W*H*3)
    if len(b)<W*H*3:break
    frames.append(np.frombuffer(b,np.uint8).reshape(H,W,3))
yy,xx=np.mgrid[0:H,0:W]
out={}
for k,(a,b) in EXT.items():
    seg={r['f']:r for r in path[k]};f0,f1=min(seg),max(seg)
    sig=dict((f,v) for f,v in fade[k]);vals=[sig[f] for f in range(f0+20,f1-20) if f in sig]
    pl_in=np.median([sig[f] for f in range(max(a,f0)+8,max(a,f0)+30)]);pl_out=np.median([sig[f] for f in range(min(b,f1)-14,min(b,f1)-6)])
    rows=[]
    for f in range(a,b+1):
        r=dict(seg[min(max(f,f0),f1)]);r['f']=f
        if k=='D' and f>f1: r['s']=round(seg[f1]['s']*1.075**(f-f1),3)   # zoom keeps going into the cut
        if k=='A' and f<f0: r['s']=0.3
        # scene opacity from the measured line energy (only near the edges)
        if f-a<20: al=min(1,sig.get(f,0)/pl_in)
        elif b-f<10: al=min(1,sig.get(f,0)/pl_out)
        else: al=1.0
        if k=='C': al=1.0
        r['a']=round(max(0.0,al),3)
        # background colour in a ring just outside the spheres (what the brain should fade into)
        cx,cy,w,h=270,r['cy']/2,r['w']/2*r['s'],r['h']/2*r['s']
        e=((xx-cx)/(w*0.62))**2+((yy-cy)/(h*0.8))**2;ring=(e>1.0)&(e<1.6)
        col=frames[f][ring].reshape(-1,3).astype(float);lum=col.mean(1);col=col[lum<=np.percentile(lum,60)]
        bg=(np.median(col,0)/255)**2.2
        r['bg']=[round(float(x),4) for x in bg]
        rows.append(r)
    out[k]=rows
    print(k,a,b,'alpha edges',[x['a'] for x in rows[:6]],[x['a'] for x in rows[-8:]],'bg',rows[len(rows)//2]['bg'])
json.dump(out,open(sys.argv[4],'w'))
