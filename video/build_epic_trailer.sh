#!/bin/bash
# Epic teaser v3: whoosh-free song (cut whooshes removed spectrally, riser section replaced by
# a reverb tail into silence), punch-zoom/shake/RGB-split cuts, silent flash montage,
# "UNTIL NOW." slam, flash + big punch on the cover reveal, reverb ending. 22s.
set -e
D=/tmp/claude-0/-home-user-hello-site/83416e32-77db-5662-92d9-10e4689e4650/scratchpad
V="/root/.claude/uploads/83416e32-77db-5662-92d9-10e4689e4650/08ee0815-hidden_uttarakhand_grand_reveal.mp4"
OUT="${1:-/home/user/hello-site/hidden_uttarakhand_epic.mp4}"

CUTS=(0 2.2 4.4 6.6 8.8 11.0 11.667 11.767 11.867 11.967 12.067 12.167 13.0)
AMPS=(0.06 0.09 0.09 0.09 0.09 0.07 0.05 0.05 0.05 0.05 0.05 0.17 0.15)
TS="t"; AMP="${AMPS[0]}"
for i in "${!CUTS[@]}"; do
  [ $i -eq 0 ] && continue
  TS="if(gte(t,${CUTS[$i]}),t-${CUTS[$i]},$TS)"; AMP="if(gte(t,${CUTS[$i]}),${AMPS[$i]},$AMP)"
done
FLASH="between(t,11.66,12.16)*0.28*exp(-($TS)*40)+gte(t,13.0)*lt(t,13.6)*0.30*exp(-($TS)*9)"

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
tpad=stop_mode=clone:stop_duration=1,
eq=contrast=1.06:saturation=1.18:gamma=1.02:brightness='0.01+$FLASH':eval=frame,
unsharp=5:5:0.5,format=gbrp,split=3[base][glowsrc][casrc];
[glowsrc]lutrgb=r='clip((val-165)*2.2,0,255)':g='clip((val-165)*2.2,0,255)':b='clip((val-165)*2.2,0,255)',gblur=sigma=28[glow];
[base][glow]blend=all_mode=screen:all_opacity=0.35[bloom];
[casrc]rgbashift=rh=-14:bh=14:rv=3:bv=-3[ca0];
[bloom]split[bl1][bl2];
[ca0][bl2]blend=all_mode=normal:all_opacity=0.25[ca];
[bl1][ca]overlay=enable='lt($TS,0.14)',format=yuv420p,
scale=w='trunc(1080*(1+($AMP)*exp(-($TS)*7)+0.011*min($TS,2.6))/2)*2':h=-2:eval=frame:flags=bicubic,
crop=1080:1920:x='clip((iw-1080)/2+18*exp(-($TS)*11)*sin(($TS)*85),0,iw-1080)':y='clip((ih-1920)/2+14*exp(-($TS)*11)*cos(($TS)*70),0,ih-1920)',
fade=t=out:st=21.0:d=1.0[v]
"

GATE_MAIN="if(lt(t,9.2),1,if(lt(t,9.55),1-(t-9.2)/0.35,if(lt(t,13.03),0,if(lt(t,13.08),(t-13.03)/0.05,1))))"
GATE_SEND="if(between(t,8.9,9.55),1,0)+if(gte(t,20.0),1,0)"
AF="
[1:a]asplit[am][as];
[am]volume='$GATE_MAIN':eval=frame,afade=t=out:st=20.3:d=0.7[dry];
[as]volume='$GATE_SEND':eval=frame,afade=t=out:st=20.9:d=0.1,apad=pad_dur=2[send];
[send][2:a]afir=dry=1:wet=1,volume=40dB[wet];
[dry][wet]amix=inputs=2:normalize=0:weights='1 0.45',apad=whole_dur=22,
alimiter=limit=0.95:level=false,atrim=0:22[aout]
"

ffmpeg -y -v error -i "$V" -i "$D/clean.wav" -i "$D/ir.wav" -filter_complex "$VF;$AF" -map "[v]" -map "[aout]" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 192k -t 22 "$OUT"
echo done
