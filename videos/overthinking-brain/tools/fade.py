# sphere "signal" = high-pass line energy inside the sphere box, per frame, around each segment edge
import sys,subprocess,numpy as np,json
from scipy.ndimage import uniform_filter
F=sys.argv[1];path=json.load(open(sys.argv[2]))
W,H=540,960
p=subprocess.Popen(['ffmpeg','-v','error','-i',F,'-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
frames=[]
while True:
    b=p.stdout.read(W*H*3)
    if len(b)<W*H*3:break
    frames.append(np.frombuffer(b,np.uint8).reshape(H,W,3))
res={}
for k,seg in path.items():
    a,b=seg[0]['f'],seg[-1]['f']
    r0,r1=seg[len(seg)//2],seg[-1]
    out=[]
    for f in range(max(0,a-25),min(len(frames),b+25)):
        r=seg[min(max(f-a,0),len(seg)-1)]
        cx,cy,w,h=270,r['cy']/2,r['w']/2,r['h']/2
        x0,x1,y0,y1=int(cx-w/2),int(cx+w/2),int(cy-h/2),int(cy+h/2)
        im=frames[f][y0:y1,x0:x1].astype(np.float32)
        lum=im.mean(2);hp=np.abs(lum-uniform_filter(lum,7))
        R,B=im[...,0],im[...,2]
        orange=(R>B*1.2)
        out.append((f,float((hp*orange).mean())))
    res[k]=out
json.dump(res,open(sys.argv[3],'w'))
for k,o in res.items():
    v=np.array([x[1] for x in o]);pl=np.median(v[25:-25])
    print(k,'plateau %.2f'%pl)
    print('  start:',' '.join('%d:%.2f'%(f,x/pl) for f,x in o[:40]))
    print('  end:  ',' '.join('%d:%.2f'%(f,x/pl) for f,x in o[-40:]))
