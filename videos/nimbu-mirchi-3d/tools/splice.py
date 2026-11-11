# Final video: 2D base frames with the Remotion 3D segments swapped in frame-exactly, + narration/music mix, + the locked credit. One encode.
# usage: splice.py base2d.mp4 out/seg mix.wav credit.mp4 out.mp4
import subprocess,sys,os
sys.path.insert(0,os.path.dirname(__file__));from segments import SEG,N
base,segdir,mix,credit,out=sys.argv[1:6]
args=['ffmpeg','-y','-v','error','-i',base,'-i',mix,'-i',credit];fc=[];labels=[];cur=0;inp=3
def part(src,a,b,l):
    fc.append(f'[{src}:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,fps=30,scale=1080:1920,format=yuv420p,setsar=1[{l}]');labels.append(f'[{l}]')
for k,a,b in SEG:
    if a>cur: part(0,cur,a,f'o{a}')
    w=1 if a>0 else 0   # segment files start with one warm-up frame (a segment at frame 0 is rendered without one: its first frame is fully faded anyway)
    args+=['-i',f'{segdir}/{k}.mp4'];part(inp,w,b-a+1+w,f's{k}');inp+=1;cur=b+1
if cur<N: part(0,cur,N,'oz')
fc.append(''.join(labels)+f'concat=n={len(labels)}:v=1:a=0[body]')
fc.append('[2:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[cv]')
fc.append('[1:a]aresample=48000,aformat=channel_layouts=stereo[a0];[2:a]aresample=48000,aformat=channel_layouts=stereo[a1]')
fc.append('[body][a0][cv][a1]concat=n=2:v=1:a=1[v][a]')
args+=['-filter_complex',';'.join(fc),'-map','[v]','-map','[a]','-c:v','libx264','-crf','24','-maxrate','4.8M','-bufsize','9.6M','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',out]
subprocess.run(args,check=True);print('ok',out)
