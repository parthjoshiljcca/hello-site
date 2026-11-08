"""Vertical 9:16 reel matched to the reference: its soundtrack, its cut points, its overlay text.
Usage: python3 -I reel.py <scratch_dir> <upload_dir> <out.mp4>"""
import subprocess, sys, os

S, UP, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SRC = {
    "A": f"{UP}/57b2ac9c-grok_video_2026-11-08-10-21-40.mp4",
    "R": f"{UP}/030cc42c-grok_video_2026-11-08-10-22-56.mp4",
    "B": f"{UP}/b006faf5-grok_video_2026-11-08-10-27-21.mp4",
    "C": f"{UP}/ca535272-grok_video_2026-11-08-10-30-22.mp4",
}
FPS, W, H = 30, 1080, 1920
SEG = f"{S}/reel_segs"; os.makedirs(SEG, exist_ok=True)

# Reference cut points: 0.83 | 2.07 2.17 2.33 2.83 2.93 | 3.10 4.10 5.13 7.10 8.90 10.90 (12.75) 14.97 | ~17.0 out
# (start, end, src, src_in, speed, cx, cy, z0, z1, extra_kicks)
#  cx = horizontal centre of the 9:16 window in the 16:9 source; cy = zoom focus inside that window
shots = [
    (0.00, 0.83, "A", 0.0, 0.6, .17, .50, 1.18, 1.06, []),   # owl stringing fairy lights (through the burn)
    (0.83, 2.07, "A", 2.0, 1.0, .33, .38, 1.00, 1.12, []),   # raccoon hanging marigolds
    (2.07, 2.17, "R", 1.0, 1.0, .50, .66, 1.30, 1.32, []),   # flicker frames
    (2.17, 2.33, "B", 3.0, 1.0, .84, .50, 1.10, 1.12, []),
    (2.33, 2.83, "R", 2.0, 1.0, .50, .62, 1.20, 1.32, []),
    (2.83, 2.93, "C", 0.5, 1.0, .38, .30, 1.20, 1.22, []),
    (2.93, 3.10, "B", 4.0, 1.0, .60, .50, 1.10, 1.14, []),
    # ---- drop: "॥ दिवाली ॥"
    (3.10, 4.10, "B", 6.0, 1.0, .33, .40, 1.00, 1.08, []),   # raccoon + marigolds
    (4.10, 5.13, "B", 5.0, 1.0, .84, .50, 1.00, 1.08, []),   # rainbow squirrel
    (5.13, 7.10, "R", 0.0, 0.8, .50, .62, 1.00, 1.25, [6.06]),  # rangoli diya
    (7.10, 8.90, "R", 3.0, 1.0, .84, .45, 1.00, 1.10, [8.06]),  # red panda places a diya
    (8.90, 10.90, "C", 1.0, 1.0, .50, .55, 1.00, 1.12, [9.96]), # otter holding the diya
    (10.90, 12.75, "C", 3.0, 1.0, .30, .55, 1.00, 1.10, [11.52]),  # squirrel
    (12.75, 14.97, "C", 5.0, 0.7, .40, .40, 1.00, 1.15, [13.86]),  # sparklers up
    (14.97, 17.90, "C", 7.0, 0.7, .64, .50, 1.00, 1.22, [16.18]),  # red pandas, slow push to end
]
KICK = 0.06  # zoom punch on every cut / strong beat

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-3000:]); sys.exit(1)

with open(f"{SEG}/list.txt", "w") as lf:
    for i, (st, en, src, sin, sp, cx, cy, z0, z1, kicks) in enumerate(shots):
        out = f"{SEG}/s{i:02d}.mp4"; lf.write(f"file '{out}'\n")
        nf = round(en * FPS) - round(st * FPS)
        chain = [f"trim=start={sin}:duration={(en - st) * sp + 0.3:.3f}", "setpts=PTS-STARTPTS"]
        if sp != 1.0:
            chain.append(f"setpts=PTS/{sp}")
            if sp < 1.0: chain.append(f"minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1")
        chain.append(f"fps={FPS}")
        cw = 400  # 9:16 window from the 711px-tall source
        x0 = int(min(max(cx * 1264 - cw / 2, 0), 1264 - cw))
        if x0 + cw > 1140:  # window reaches the source's bottom-right watermark -> zoom/frame it out
            z0, z1, cy = max(z0, 1.16), max(z1, 1.16), min(cy, 0.46)
        chain += [f"crop={cw}:711:{x0}:4", "scale=1215:2160:flags=lanczos"]
        T = f"({st}+on/{FPS})"
        z = f"{z0}+({z1}-{z0})*on/{nf}+{KICK}*exp(-14*({T}-{st}))"
        for k in kicks:
            z += f"+{KICK * 0.8}*gte({T}\\,{k})*exp(-14*({T}-{k}))"
        x = "iw/2-iw/zoom/2"
        y = f"max(0\\,min(ih-ih/zoom\\,{cy}*ih-ih/zoom/2))"
        chain += [f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s={W}x{H}:fps={FPS}",
                  "unsharp=5:5:0.6", f"trim=end_frame={nf}", "setsar=1", "format=yuv420p"]
        run(["ffmpeg", "-y", "-v", "error", "-i", SRC[src], "-an", "-vf", ",".join(chain),
             "-frames:v", str(nf), "-c:v", "libx264", "-crf", "10", "-preset", "fast", out])
        print(f"shot {i:02d} {st:5.2f}-{en:5.2f} {src} x{sp}", flush=True)

run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{SEG}/list.txt", "-c", "copy", f"{SEG}/rough.mp4"])

def fade_png(idx, t_in, t_out, f_in=0.25, f_out=0.3):
    return (f"[{idx}:v]format=rgba,fade=t=in:st={t_in}:d={f_in}:alpha=1,"
            f"fade=t=out:st={t_out - f_out}:d={f_out}:alpha=1[o{idx}]")

fc = ";".join([
    "[0:v]eq=contrast=1.07:saturation=1.12:gamma=0.98,"
    "colorbalance=rs=-0.03:bs=0.04:rh=0.04:bh=-0.04,"
    "vignette=angle=PI/5,noise=alls=4:allf=t+u[g]",
    "[2:v]setpts=PTS-STARTPTS[burn]",
    "[g][burn]overlay=0:0:eof_action=pass[b]",
    fade_png(3, 0.35, 3.10, 0.2, 0.08),
    fade_png(4, 3.10, 17.0, 0.06, 0.5),
    fade_png(5, 3.10, 17.0, 0.4, 0.5),
    "[b][o3]overlay=(W-w)/2:H*0.47-h/2:eof_action=pass[t1]",
    "[t1][o4]overlay=(W-w)/2:H*0.72-h/2:eof_action=pass[t2]",
    "[t2][o5]overlay=(W-w)/2:H*0.935-h/2:eof_action=pass,fade=t=out:st=16.9:d=0.6[v]",
])
run(["ffmpeg", "-y", "-v", "error", "-i", f"{SEG}/rough.mp4", "-i", f"{S}/ref_audio.wav", "-i", f"{S}/burn.mov",
     "-loop", "1", "-t", "17.9", "-i", f"{S}/t_finally.png",
     "-loop", "1", "-t", "17.9", "-i", f"{S}/t_diwali.png",
     "-loop", "1", "-t", "17.9", "-i", f"{S}/t_brand.png",
     "-filter_complex", fc, "-map", "[v]", "-map", "1:a", "-r", str(FPS),
     "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", OUT])
print("done", OUT)
