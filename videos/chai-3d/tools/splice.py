# Build the final Chai video: 2D base frames, with the Remotion 3D segments swapped in frame-exactly,
# + the original narration/music mix, + the locked credit clip. One encode.
# usage: splice.py base2d.mp4 out/seg mix.wav credit.mp4 out.mp4
import subprocess,sys
base,segdir,mix,credit,out=sys.argv[1:6]
SEG=[('hook',0,178),('globe',649,1552),('patila',2001,2198)];N=2623
args=['ffmpeg','-y','-v','error','-i',base,'-i',mix,'-i',credit];fc=[];labels=[];cur=0;inp=3
def part(src,a,b,l):
    fc.append(f'[{src}:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,fps=30,scale=1080:1920,format=yuv420p,setsar=1[{l}]');labels.append(f'[{l}]')
for k,a,b in SEG:
    if a>cur: part(0,cur,a,f'o{a}')
    args+=['-i',f'{segdir}/{k}.mp4'];part(inp,0,b-a+1,f's{k}');inp+=1;cur=b+1
if cur<N: part(0,cur,N,'oz')
fc.append(''.join(labels)+f'concat=n={len(labels)}:v=1:a=0[body]')
fc.append('[2:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[cv]')
fc.append('[1:a]aresample=48000,aformat=channel_layouts=stereo[a0];[2:a]aresample=48000,aformat=channel_layouts=stereo[a1]')
fc.append('[body][a0][cv][a1]concat=n=2:v=1:a=1[v][a]')
args+=['-filter_complex',';'.join(fc),'-map','[v]','-map','[a]','-c:v','libx264','-crf','21','-maxrate','7.5M','-bufsize','15M','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',out]
subprocess.run(args,check=True);print('ok',out)
