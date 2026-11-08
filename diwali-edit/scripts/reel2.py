"""Diwali reel, reference-matched cut, rendered in 9:16 or 16:9, with the full-quality song and the SpArsh logo reveal.
Usage: python3 -I reel2.py <scratch_dir> <upload_dir> <v|h> <out.mp4>"""
import subprocess, sys, os

S, UP, MODE, OUT = sys.argv[1:5]
VERT = MODE == "v"
SRC = {
    "A": f"{UP}/57b2ac9c-grok_video_2026-11-08-10-21-40.mp4",
    "R": f"{UP}/030cc42c-grok_video_2026-11-08-10-22-56.mp4",
    "B": f"{UP}/b006faf5-grok_video_2026-11-08-10-27-21.mp4",
    "C": f"{UP}/ca535272-grok_video_2026-11-08-10-30-22.mp4",
}
LOGO_SRC = f"{UP}/1bb2f234-image.png"
FPS = 30
W, H = (1080, 1920) if VERT else (1920, 1080)
SEG = f"{S}/segs_{MODE}"; os.makedirs(SEG, exist_ok=True)
CUT_END = 17.07   # last footage frame (on the beat) -> logo reveal
LOGO_DUR = 5.5
TOTAL = CUT_END + LOGO_DUR

# (start, end, src, src_in, speed, cx, cy, z0, z1, kicks, wide)
shots = [
    (0.00, 0.83, "A", 0.0, 0.6, .17, .50, 1.18, 1.06, [], False),
    (0.83, 2.07, "A", 2.0, 1.0, .33, .38, 1.00, 1.12, [], False),
    (2.07, 2.17, "R", 1.0, 1.0, .50, .66, 1.30, 1.32, [], False),
    (2.17, 2.33, "B", 3.0, 1.0, .84, .50, 1.10, 1.12, [], False),
    (2.33, 2.83, "R", 2.0, 1.0, .50, .62, 1.20, 1.32, [], False),
    (2.83, 2.93, "C", 0.5, 1.0, .38, .30, 1.20, 1.22, [], False),
    (2.93, 3.10, "B", 4.0, 1.0, .60, .50, 1.10, 1.14, [], False),
    (3.10, 4.10, "B", 6.0, 1.0, .33, .40, 1.00, 1.08, [], False),
    (4.10, 5.13, "B", 5.0, 1.0, .84, .50, 1.00, 1.08, [], False),
    (5.13, 7.10, "R", 0.0, 0.8, .50, .62, 1.00, 1.25, [6.06], True),
    (7.10, 8.90, "R", 3.0, 1.0, .84, .45, 1.00, 1.10, [8.06], False),
    (8.90, 10.90, "C", 1.0, 1.0, .50, .55, 1.00, 1.12, [9.96], False),
    (10.90, 12.75, "C", 3.0, 1.0, .30, .55, 1.00, 1.10, [11.52], False),
    (12.75, 14.97, "C", 5.0, 0.7, .40, .40, 1.00, 1.15, [13.86], True),
    (14.97, CUT_END, "C", 7.0, 0.7, .64, .50, 1.00, 1.16, [16.18], False),
]
KICK = 0.06

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-3000:]); sys.exit(1)

with open(f"{SEG}/list.txt", "w") as lf:
    for i, (st, en, src, sin, sp, cx, cy, z0, z1, kicks, wide) in enumerate(shots):
        out = f"{SEG}/s{i:02d}.mp4"; lf.write(f"file '{out}'\n")
        nf = round(en * FPS) - round(st * FPS)
        chain = [f"trim=start={sin}:duration={(en - st) * sp + 0.3:.3f}", "setpts=PTS-STARTPTS"]
        if sp != 1.0:
            chain.append(f"setpts=PTS/{sp}")
            if sp < 1.0: chain.append(f"minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1")
        chain.append(f"fps={FPS}")
        if VERT:
            cw = 400
            x0 = int(min(max(cx * 1264 - cw / 2, 0), 1264 - cw))
            right_edge = (x0 + cw) / 1264
            chain += [f"crop={cw}:711:{x0}:4", "scale=1215:2160:flags=lanczos"]
            xexpr = "iw/2-iw/zoom/2"
        else:
            base = 0.12 if wide else 0.42
            z0, z1 = z0 + base, z1 + base
            right_edge = min(cx + 0.5 / z0, 1.0)
            chain += ["crop=1264:711:0:4", "scale=3840:2160:flags=lanczos"]
            xexpr = f"max(0\\,min(iw-iw/zoom\\,{cx}*iw-iw/zoom/2))"
        if right_edge > 0.89:  # keep the source's bottom-right watermark out of frame
            z0, z1, cy = max(z0, 1.16), max(z1, 1.16), min(cy, 0.44)
        T = f"({st}+on/{FPS})"
        z = f"{z0}+({z1}-{z0})*on/{nf}+{KICK}*exp(-14*({T}-{st}))"
        for k in kicks:
            z += f"+{KICK * 0.8}*gte({T}\\,{k})*exp(-14*({T}-{k}))"
        yexpr = f"max(0\\,min(ih-ih/zoom\\,{cy}*ih-ih/zoom/2))"
        chain += [f"zoompan=z='{z}':x='{xexpr}':y='{yexpr}':d=1:s={W}x{H}:fps={FPS}",
                  "unsharp=5:5:0.5", f"trim=end_frame={nf}", "setsar=1", "format=yuv420p"]
        run(["ffmpeg", "-y", "-v", "error", "-i", SRC[src], "-an", "-vf", ",".join(chain),
             "-frames:v", str(nf), "-c:v", "libx264", "-crf", "10", "-preset", "fast", out])
        print(f"[{MODE}] shot {i:02d} {st:5.2f}-{en:5.2f}", flush=True)
run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{SEG}/list.txt", "-c", "copy", f"{SEG}/rough.mp4"])

# logo reveal
logo = f"{SEG}/logo.mp4"
run(["python3", "-I", f"{S}/logo.py", LOGO_SRC, str(W), str(H), str(LOGO_DUR), logo])

# audio: the reference's splice rebuilt from the clean song (39.448s intro -> 61.26s from the 5.13s cut on)
SPLICE = 5.13
audio_f = (f"[1:a]atrim=start=39.448:duration={SPLICE},asetpts=PTS-STARTPTS,afade=t=out:st={SPLICE - 0.012}:d=0.012[a1];"
           f"[1:a]atrim=start={56.13 + SPLICE}:duration={TOTAL - SPLICE},asetpts=PTS-STARTPTS,afade=t=in:d=0.012[a2];"
           f"[a1][a2]concat=n=2:v=0:a=1,afade=t=out:st={TOTAL - 1.4}:d=1.4[aout]")

# pleasant grade: cooler whites, less orange, lifted mids, light vignette/grain
GRADE = ("colorbalance=rs=-0.02:bs=0.03:rm=-0.05:gm=-0.01:bm=0.04:rh=-0.04:bh=0.04,"
         "eq=contrast=1.05:brightness=0.03:saturation=0.90:gamma=1.06,vignette=angle=PI/8,noise=alls=2:allf=t+u")
if VERT:
    pos = dict(fin=("1.0", 0.47), diw=("1.0", 0.72), brand=("1.0", 0.935))
else:
    pos = dict(fin=("1.25", 0.46), diw=("1.1", 0.80), brand=("1.0", 0.95))

def txt(idx, key, t_in, t_out, f_in, f_out):
    sc, _ = pos[key]
    return (f"[{idx}:v]format=rgba,scale=iw*{sc}:-1,fade=t=in:st={t_in}:d={f_in}:alpha=1,"
            f"fade=t=out:st={t_out - f_out}:d={f_out}:alpha=1[o{idx}]")

fc = ";".join([
    f"[0:v]{GRADE}[g]",
    "[3:v]setpts=PTS-STARTPTS[burn]",
    "[g][burn]overlay=0:0:eof_action=pass[b]",
    txt(4, "fin", 0.35, 3.10, 0.2, 0.08),
    txt(5, "diw", 3.10, CUT_END, 0.06, 0.25),
    txt(6, "brand", 3.10, CUT_END, 0.4, 0.25),
    f"[b][o4]overlay=(W-w)/2:H*{pos['fin'][1]}-h/2:eof_action=pass[t1]",
    f"[t1][o5]overlay=(W-w)/2:H*{pos['diw'][1]}-h/2:eof_action=pass[t2]",
    f"[t2][o6]overlay=(W-w)/2:H*{pos['brand'][1]}-h/2:eof_action=pass,trim=duration={CUT_END},setpts=PTS-STARTPTS,format=yuv420p[foot]",
    "[2:v]setpts=PTS-STARTPTS,format=yuv420p[logo]",
    "[foot][logo]concat=n=2:v=1:a=0[v]",
    audio_f,
])
burn = f"{S}/burn_{MODE}.mov"
run(["ffmpeg", "-y", "-v", "error", "-i", f"{SEG}/rough.mp4", "-i", f"{S}/song.wav", "-i", logo, "-i", burn,
     "-loop", "1", "-t", str(TOTAL), "-i", f"{S}/t_finally.png",
     "-loop", "1", "-t", str(TOTAL), "-i", f"{S}/t_diwali.png",
     "-loop", "1", "-t", str(TOTAL), "-i", f"{S}/t_brand.png",
     "-filter_complex", fc, "-map", "[v]", "-map", "[aout]", "-r", str(FPS),
     "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p",
     "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", OUT])
print("done", OUT)
