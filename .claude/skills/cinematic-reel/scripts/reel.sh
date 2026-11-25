#!/usr/bin/env bash
# Cinematic reel builder — 4K, studio-light grade, beat-cut, title cards on black, roaming watermark.
# Usage: reel.sh <shots.txt> <titles.json> <song.mp3> <out.mp4> <workdir>
#   shots.txt lines:  <clip_path> <start> <srclen> <target_dur> <in|out>  [comment]
#                     optional trailing tokens fi=<sec> fo=<sec> fade that shot in/out from black
#                     BLACK <dur>                                         (black title space)
#   Env: OW OH FPS CROP FLASH(sec of beat-drop flash, ""=off) SKIP_SEGS=1 (reuse rough.mp4)
set -euo pipefail
SHOTS=$1; SPEC=$2; SONG=$3; OUT=$4; W=$5
HERE=$(cd "$(dirname "$0")" && pwd)
OW=${OW:-2160}; OH=${OH:-3840}; FPS=${FPS:-24}
CROP=${CROP:-crop=652:1160:26:38}       # removes Grok mark (bottom-right) on 704x1248 sources
FLASH=${FLASH-}
mkdir -p "$W"

# 1) shots -> segments (eased push-in / pull-out), black spacers for title cards
if [ "${SKIP_SEGS:-0}" != 1 ]; then
  rm -f "$W"/seg*.mp4 "$W"/list.txt; i=0
  ZW=$((OW*3/2)); ZH=$((OH*3/2))
  grep -v '^\s*#' "$SHOTS" | grep -v '^\s*$' | while read -r src st len tgt dir rest; do
    FI=$(echo " ${rest:-}" | grep -o ' fi=[0-9.]*' | cut -d= -f2 || true)
    FO=$(echo " ${rest:-}" | grep -o ' fo=[0-9.]*' | cut -d= -f2 || true)
    o="$W/seg$(printf %02d $i).mp4"
    if [ "$src" = BLACK ]; then
      ffmpeg -v error -y -f lavfi -i "color=black:s=${OW}x${OH}:r=$FPS:d=$st" -c:v libx264 -preset fast -crf 12 -pix_fmt yuv420p "$o" </dev/null
    else
      n=$(python3 -c "print(round($tgt*$FPS))")
      E="(0.5-0.5*cos(PI*on/$n))"                       # ease-in-out camera move
      if [ "$dir" = in ]; then Z="1.0+0.08*$E"; else Z="1.08-0.08*$E"; fi
      ffmpeg -v error -y -ss "$st" -t "$len" -i "$src" -an -vf "\
setpts=PTS*$tgt/$len,fps=$FPS,$CROP,scale=$ZW:$ZH:flags=lanczos,\
zoompan=z='$Z':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${OW}x${OH}:fps=$FPS,\
trim=end_frame=$n,setsar=1${FI:+,fade=t=in:st=0:d=$FI}${FO:+,fade=t=out:st=$(python3 -c "print($n/$FPS-$FO)"):d=$FO}" -c:v libx264 -preset fast -crf 12 -pix_fmt yuv420p "$o" </dev/null
    fi
    i=$((i+1))
  done
  for f in "$W"/seg*.mp4; do echo "file '$f'"; done > "$W/list.txt"
  ffmpeg -v error -y -f concat -safe 0 -i "$W/list.txt" -c copy "$W/rough.mp4"
fi

# 2) key-light mask (bright upper-centre, soft falloff) = "studio light"
E="255*clip(1.0-0.55*pow(hypot((X-W/2)/(W*0.62),(Y-H*0.42)/(H*0.62)),2.2),0.45,1)"
ffmpeg -v error -y -f lavfi -i "color=black:s=540x960,format=rgb24" -vf "geq=r='$E':g='$E':b='$E'" -frames:v 1 "$W/keymask.png"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SONG")
K=$(python3 -c "print($OW/1080)")
SIG=$(python3 -c "print(round(18*$K))")
FL=""; [ -n "$FLASH" ] && FL="eq=brightness='if(between(t,$FLASH,$FLASH+0.17),0.15*(1-(t-$FLASH)/0.17),0)':eval=frame,"
TT="$(python3 "$HERE/titles.py" $OW $OH "$SPEC" "$HERE")"

# 3) grade + titles + watermark + music.
# NOTE: eq outputs YUV -> keep format=gbrp right before every blend, or you get purple/green casts.
ffmpeg -v error -y -i "$W/rough.mp4" -i "$W/keymask.png" -i "$SONG" -filter_complex "\
[0:v]eq=saturation=1.12,format=gbrp,\
curves=master='0/0 0.06/0.02 0.25/0.25 0.5/0.57 0.75/0.85 1/1',\
colorbalance=rm=0.015:bm=-0.015:rh=0.04:gh=0.02:bh=-0.03,\
unsharp=13:13:0.6:5:5:0,unsharp=7:7:0.5:5:5:0,format=gbrp,split[b][g];\
[g]curves=master='0/0 0.78/0 1/0.9',gblur=sigma=$SIG[gg];\
[b][gg]blend=all_mode=screen:all_opacity=0.2,format=gbrp[l];\
[1:v]scale=$OW:$OH,format=gbrp[m];[l][m]blend=all_mode=multiply,format=yuv420p,\
noise=c0s=3:c0f=t+u,${FL}$TT,format=yuv420p[v];\
[2:a]afade=t=in:st=0:d=0.3,afade=t=out:st=$(python3 -c "print($DUR-1.5)"):d=1.5[a]" \
  -map "[v]" -map "[a]" -t "$DUR" -r "$FPS" -c:v libx264 -preset slow -crf 17 -profile:v high -level 5.1 \
  -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,bit_rate:stream=width,height -of compact "$OUT"
