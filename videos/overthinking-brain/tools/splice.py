# Rebuild the video frame-exactly: original frames, except rendered segments (Remotion MP4s whose first frame is a
# warm-up frame) and optional single fix frames (PNG). Audio is copied from the original untouched.
# usage: splice.py original.mp4 out/seg out.mp4 [fixframe,fixframe,...]   (fix frames: out/fix/element-N.png)
import subprocess,sys,os
orig,segdir,out=sys.argv[1:4]
FIX=[int(x) for x in sys.argv[4].split(',')] if len(sys.argv)>4 else []
SEG=[('A',4,206),('B',514,781),('C',1085,1153),('D',1680,1907)];N=2110
pieces=[(a,b,('seg',k,a)) for k,a,b in SEG]+[(f,f,('fix',f)) for f in FIX]
pieces.sort()
args=['ffmpeg','-y','-v','error','-i',orig];fc=[];labels=[];cur=0;inp=1
def orig_part(a,b):
    global fc;l=f'o{a}';fc.append(f'[0:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,format=yuv420p,setsar=1[{l}]');labels.append(f'[{l}]')
for a,b,src in pieces:
    if a>cur: orig_part(cur,a)
    l=f'p{a}'
    if src[0]=='seg':
        args+=['-i',f'{segdir}/{src[1]}.mp4'];fc.append(f'[{inp}:v]trim=start_frame=1:end_frame={b-a+2},setpts=PTS-STARTPTS,scale=1080:1920,format=yuv420p,setsar=1[{l}]')
    else:
        args+=['-framerate','30','-i',os.path.join(segdir,'..','fix',f'element-{src[1]}.png')];fc.append(f'[{inp}:v]trim=end_frame=1,setpts=PTS-STARTPTS,scale=1080:1920,format=yuv420p,setsar=1[{l}]')
    labels.append(f'[{l}]');inp+=1;cur=b+1
if cur<N: orig_part(cur,N)
fc.append(''.join(labels)+f'concat=n={len(labels)}:v=1:a=0[v]')
args+=['-filter_complex',';'.join(fc),'-map','[v]','-map','0:a','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-r','30','-c:a','copy','-movflags','+faststart',out]
subprocess.run(args,check=True);print('ok',out)
