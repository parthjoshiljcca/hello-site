# Replace frames [a,b] of the original with Remotion-rendered frames; everything else (and the audio) stays original.
import subprocess,sys
orig,segdir,out=sys.argv[1:4]
SEG=[('A',4,206),('B',514,781),('C',1085,1153),('D',1680,1907)];N=2110
args=['ffmpeg','-y','-v','error','-i',orig];parts=[];inp=1;fc=[];cur=0
for k,a,b in SEG:
    if a>cur: fc.append(f'[0:v]trim=start_frame={cur}:end_frame={a},setpts=PTS-STARTPTS,format=yuv420p[o{k}]');parts.append(f'[o{k}]')
    args+=['-i',f'{segdir}/{k}.mp4']
    fc.append(f'[{inp}:v]trim=start_frame=1:end_frame={b-a+2},setpts=PTS-STARTPTS,scale=1080:1920,format=yuv420p[s{k}]');parts.append(f'[s{k}]');inp+=1;cur=b+1
fc.append(f'[0:v]trim=start_frame={cur}:end_frame={N},setpts=PTS-STARTPTS,format=yuv420p[oz]');parts.append('[oz]')
fc.append(''.join(parts)+f'concat=n={len(parts)}:v=1:a=0[v]')
args+=['-filter_complex',';'.join(fc),'-map','[v]','-map','0:a','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-r','30','-c:a','copy','-movflags','+faststart',out]
subprocess.run(args,check=True);print('ok',out)
