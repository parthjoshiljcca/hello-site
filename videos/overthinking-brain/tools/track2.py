import sys,subprocess,numpy as np,json
from scipy.ndimage import uniform_filter,label
F=sys.argv[1];W,H=540,960  # half res
p=subprocess.Popen(['ffmpeg','-v','error','-i',F,'-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
Y0,Y1=260,640   # full-res 520..1280
out=[];n=0
while True:
    b=p.stdout.read(W*H*3)
    if len(b)<W*H*3:break
    a=np.frombuffer(b,np.uint8).reshape(H,W,3).astype(np.float32)[Y0:Y1]
    lum=a.mean(2);hp=lum-uniform_filter(lum,7)
    R,G,B=a[...,0],a[...,1],a[...,2]
    col=((R>120)&(R>B*1.25))
    m=((hp>10)&col).astype(np.float32)
    den=uniform_filter(m,15)
    blob=den>0.16
    lab,k=label(blob)
    rec=None
    if k:
        sizes=np.bincount(lab.ravel())[1:];i=int(np.argmax(sizes))+1
        if sizes[i-1]>150:
            ys,xs=np.nonzero(lab==i)
            rec=[float(xs.min()*2),float(xs.max()*2),float((ys.min()+Y0)*2),float((ys.max()+Y0)*2),int(sizes[i-1])]
    out.append(rec);n+=1
json.dump(out,open(sys.argv[2],'w'));print('frames',n)
