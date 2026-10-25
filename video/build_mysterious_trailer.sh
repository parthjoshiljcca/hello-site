#!/bin/bash
set -e
V="/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650/08ee0815-hidden_uttarakhand_grand_reveal.mp4"
OUT="${1:-/home/user/hello-site/hidden_uttarakhand_mysterious.mp4}"

# heartbeat phase: accelerates 60 -> 120 bpm up to 12.85s, then a slow 54 bpm pulse
HB_R='if(lt(t,12.85),1+(t/13)*(t/13),0.9)'
HB_TAU="if(lt(t,12.85),mod(t+t*t*t/507,1)/(1+(t/13)*(t/13)),mod((t-13.4)*0.9,1)/0.9)"

VF="
[0:v]trim=start_frame=0:end_frame=390,setpts=PTS-STARTPTS[a];
[0:v]trim=start_frame=403:end_frame=404,setpts=PTS-STARTPTS,loop=loop=12:size=1:start=0,setpts=N/30/TB,fade=t=in:st=0:d=0.43[b];
[0:v]trim=start_frame=403,setpts=PTS-STARTPTS[c];
[a][b][c]concat=n=3:v=1:a=0,fps=30,format=yuv420p,
drawbox=c=black:t=fill:enable='between(n,0,2)+between(n,198,200)+between(n,264,266)',
scale=w='trunc(1080*(1+0.045*t/21)/2)*2':h=-2:eval=frame:flags=bicubic,crop=1080:1920,
eq=contrast=1.10:saturation=0.88:gamma=0.93:brightness='-0.035+0.012*sin(2*PI*t*1.7)*sin(2*PI*t*0.43)+0.006*sin(2*PI*t*9.1)':eval=frame,
colorbalance=bs=0.07:bm=0.03:rh=0.05:gh=0.02,
vignette=a='PI/4.6+if(lt(t,13.4)*gt(t,12.85),0.25,0.14*exp(-9*($HB_TAU)))':eval=frame:mode=forward[g];
color=c=gray:s=40x72:r=0.6:d=22,noise=alls=100:allf=u,
lutyuv=y='clip((val-150)*2.4,0,255)':u=128:v=128,
scale=1400x2520:flags=bicubic,framerate=fps=30,gblur=sigma=60,
crop=1080:1920:x='160+150*sin(t*0.21)':y='300+250*t/21',format=yuv420p[fog];
[g][fog]blend=c0_mode=screen:c0_opacity=0.2:c1_mode=normal:c1_opacity=1:c2_mode=normal:c2_opacity=1,
noise=c0s=9:c0f=t+u,
fade=t=in:st=0:d=0.6,fade=t=out:st=20.55:d=0.45[v]
"

# synthesized suspense layers (no whooshes, no risers)
HB="(sin(2*PI*52*TAU)+0.6*sin(2*PI*104*TAU))*exp(-TAU*28)+0.7*gte(TAU,0.17)*(sin(2*PI*46*(TAU-0.17))+0.6*sin(2*PI*92*(TAU-0.17)))*exp(-(TAU-0.17)*30)"
HB="${HB//TAU/($HB_TAU)}"
HBAMP="if(lt(t,9.8),0.18+0.12*t/9.8,if(lt(t,12.85),0.30+0.35*(t-9.8)/3.05,if(lt(t,13.4),0,0.22*(1-0.3*(t-13.4)/7.6))))"
DRONE="(sin(2*PI*55*t)+0.7*sin(2*PI*55.4*t)+0.4*sin(2*PI*82.4*t)+0.25*sin(2*PI*110.3*t))*(0.07+0.03*sin(2*PI*0.15*t))*if(lt(t,12.85),1+1.2*max(0,t-9.8)/3.05,if(lt(t,13.0),0,0.8))*min(1,t/1.5)"
TT="mod(t*4,1)/4"
TICK="sin(2*PI*(2400+800*mod(floor(t*4),2))*$TT)*exp(-$TT*350)*0.14*between(t,9.8,12.85)*(0.5+0.5*(t-9.8)/3.05)"
EERIE="(sin(2*PI*880*t)+sin(2*PI*884.5*t)+0.5*sin(2*PI*1318*t))*0.018*(0.6+0.4*sin(2*PI*5*t))*between(t,9.8,12.85)*(t-9.8)/3.05"
# deep impacts on each cut, a big one on the cover reveal
hit() { echo "gte(t,$1)*$2*sin(2*PI*(30*(t-$1)+40*(1-exp(-(t-$1)*6))/6))*exp(-(t-$1)*$3)"; }
HITS="$(hit 2.2 0.35 5)+$(hit 4.4 0.35 5)+$(hit 6.6 0.4 5)+$(hit 8.8 0.4 5)+$(hit 11.0 0.3 4)+$(hit 12.2 0.45 4)+$(hit 13.0 0.95 1.6)"

AF="
[0:a]aformat=sample_fmts=fltp:channel_layouts=stereo,
lowpass=f=2200:enable='between(t,2.05,2.65)+between(t,4.25,4.85)+between(t,6.45,7.05)+between(t,8.55,9.15)',
volume='if(between(t,2.05,2.65)+between(t,4.25,4.85)+between(t,6.45,7.05)+between(t,8.55,9.15),0.55,1)':eval=frame,
lowpass=f=9000:enable='between(t,13.0,14.6)',
volume='if(lt(t,9.6),1,if(lt(t,9.95),1-0.95*(t-9.6)/0.35,if(lt(t,12.85),0.05,if(lt(t,13.0),0,1))))':eval=frame[orig];
aevalsrc='($HB)*($HBAMP)|($HB)*($HBAMP)':s=44100:d=21[hb];
aevalsrc='$DRONE|$DRONE':s=44100:d=21,aecho=0.8:0.6:90|170:0.3|0.2[dr];
aevalsrc='$TICK|$TICK':s=44100:d=21,aecho=0.8:0.5:60:0.25[tk];
aevalsrc='$EERIE|0.9*$EERIE':s=44100:d=21,aecho=0.8:0.7:120|240:0.35|0.25[er];
aevalsrc='$HITS|$HITS':s=44100:d=21,lowpass=f=180[hits];
[orig][hb][dr][tk][er][hits]amix=inputs=6:normalize=0:weights='0.85 1 1 1 1 1',
afade=t=out:st=20.6:d=0.4,volume=3.2dB,alimiter=limit=0.89:level=false[aout]
"

ffmpeg -y -v error -i "$V" -filter_complex "$VF;$AF" -map "[v]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 192k -t 21 "$OUT"
echo done
