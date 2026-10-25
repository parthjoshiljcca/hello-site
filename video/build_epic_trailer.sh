#!/bin/bash
# Epic teaser cut: original colours (enriched), punch-zoom + shake + RGB-split on every cut,
# flash-cut character montage before "UNTIL NOW.", song kept clean with whooshes softened.
set -e
V="/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650/08ee0815-hidden_uttarakhand_grand_reveal.mp4"
OUT="${1:-/home/user/hello-site/hidden_uttarakhand_epic.mp4}"

# cut times (s): scene changes + montage flash-cuts + "UNTIL NOW." + cover reveal
CUTS=(0 2.2 4.4 6.6 8.8 11.0 11.667 11.767 11.867 11.967 12.067 12.167 13.0)
TS="t"
for c in "${CUTS[@]:1}"; do TS="if(gte(t,$c),t-$c,$TS)"; done
# montage window gets white flash frames
FLASH="between(t,11.66,12.16)*0.28*exp(-($TS)*40)"

VF="
[0:v]split=6[s0][s1][s2][s3][s4][s5];
[s0]trim=start_frame=0:end_frame=350,setpts=PTS-STARTPTS[p0];
[s1]trim=start_frame=40:end_frame=43,setpts=PTS-STARTPTS[m1];
[s2]trim=start_frame=100:end_frame=103,setpts=PTS-STARTPTS[m2];
[s3]trim=start_frame=160:end_frame=163,setpts=PTS-STARTPTS[m3];
[s4]trim=start_frame=230:end_frame=233,setpts=PTS-STARTPTS[m4];
[s5]trim=start_frame=300:end_frame=303,setpts=PTS-STARTPTS[m5];
[0:v]trim=start_frame=365,setpts=PTS-STARTPTS[p1];
[p0][m1][m2][m3][m4][m5][p1]concat=n=7:v=1:a=0,setpts=N/30/TB,fps=30,
eq=contrast=1.06:saturation=1.18:gamma=1.02:brightness='0.01+$FLASH':eval=frame,
unsharp=5:5:0.5,format=gbrp,split=3[base][glowsrc][casrc];
[glowsrc]lutrgb=r='clip((val-165)*2.2,0,255)':g='clip((val-165)*2.2,0,255)':b='clip((val-165)*2.2,0,255)',gblur=sigma=28[glow];
[base][glow]blend=all_mode=screen:all_opacity=0.35[bloom];
[casrc]rgbashift=rh=-12:bh=12:rv=3:bv=-3[ca0];
[bloom]split[bl1][bl2];
[ca0][bl2]blend=all_mode=normal:all_opacity=0.25[ca];
[bl1][ca]overlay=enable='lt($TS,0.14)',format=yuv420p,
scale=w='trunc(1080*(1+0.085*exp(-($TS)*7)+0.011*min($TS,2.6))/2)*2':h=-2:eval=frame:flags=bicubic,
crop=1080:1920:x='clip((iw-1080)/2+16*exp(-($TS)*11)*sin(($TS)*85),0,iw-1080)':y='clip((ih-1920)/2+12*exp(-($TS)*11)*cos(($TS)*70),0,ih-1920)',
fade=t=out:st=20.6:d=0.4[v]
"

AF="
[0:a]aformat=sample_fmts=fltp:channel_layouts=stereo,
lowpass=f=5000:enable='between(t,2.05,2.6)+between(t,4.25,4.8)+between(t,6.45,7.0)+between(t,8.55,9.1)',
lowpass=f=1800:enable='between(t,9.8,13.02)',
volume='if(between(t,2.1,2.55)+between(t,4.3,4.75)+between(t,6.5,6.95)+between(t,8.6,9.05),0.6,1)*if(lt(t,9.8),1,if(lt(t,10.4),1-0.65*(t-9.8)/0.6,if(lt(t,13.0),0.35,1)))':eval=frame,
lowpass=f=12000:enable='between(t,13.02,14.6)',
afade=t=out:st=20.6:d=0.4,alimiter=limit=0.95:level=false[aout]
"

ffmpeg -y -v error -i "$V" -filter_complex "$VF;$AF" -map "[v]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 192k -t 21 "$OUT"
echo done
