"""Beat-synced cinematic Diwali edit. Usage: python3 -I edit.py <scratch_dir> <upload_dir> <out.mp4>"""
import subprocess, sys, os

S, UP, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SRC = {
    "A": f"{UP}/57b2ac9c-grok_video_2026-11-08-10-21-40.mp4",  # decorating (lights, marigolds)
    "R": f"{UP}/030cc42c-grok_video_2026-11-08-10-22-56.mp4",  # rangoli + diyas
    "B": f"{UP}/b006faf5-grok_video_2026-11-08-10-27-21.mp4",  # decorating, alt take
    "C": f"{UP}/ca535272-grok_video_2026-11-08-10-30-22.mp4",  # celebration, sparklers
}
FONT_T = f"{S}/fonts/Cinzel.ttf"
FONT_S = f"{S}/fonts/GreatVibes-Regular.ttf"
FPS = 24
W, H = 1920, 1080
SEG = f"{S}/segs"; os.makedirs(SEG, exist_ok=True)

# (start, dur, src, src_in, speed, cx, cy, z0, z1, flash, pulse)
#  flash: None | ("white"|"gold", seconds)   pulse: zoom kick on every beat
G = ("0xFFD98A", 0.40)
Wf = ("white", 0.10)
shots = [
    # --- INTRO: slow, breathing, slow-motion
    (0.00, 2.00, "A", 0.0, 0.5, .50, .46, 1.00, 1.10, None, 0),
    (2.00, 2.00, "B", 1.0, 0.5, .45, .52, 1.55, 1.75, None, 0),
    # --- BUILD: cuts tighten 2 beats -> 1 beat -> half beat
    (4.00, 1.00, "A", 2.0, 1.0, .32, .30, 1.80, 1.95, ("white", .06), 0),
    (5.00, 1.00, "B", 3.0, 1.0, .82, .50, 1.80, 1.95, ("white", .06), 0),
    (6.00, 0.50, "A", 4.5, 1.0, .16, .46, 2.00, 2.10, ("white", .05), 0),
    (6.50, 0.50, "B", 5.0, 1.0, .60, .42, 2.00, 2.10, ("white", .05), 0),
    (7.00, 0.25, "R", 0.5, 1.0, .50, .66, 2.20, 2.30, None, 0),
    (7.25, 0.25, "C", 0.5, 1.0, .40, .26, 2.20, 2.30, None, 0),
    (7.50, 0.25, "A", 6.0, 1.0, .60, .55, 2.40, 2.50, None, 0),
    (7.75, 0.25, "B", 6.5, 1.0, .62, .22, 2.40, 2.60, None, 0),
    # --- DROP 1: the rangoli
    (8.00, 2.00, "R", 0.0, 1.0, .50, .50, 1.00, 1.15, G, .035),
    (10.00, 1.00, "R", 2.0, 1.0, .50, .66, 1.70, 1.80, Wf, .04),
    (11.00, 1.00, "R", 3.0, 1.0, .84, .40, 1.80, 1.90, Wf, .04),
    (12.00, 1.00, "R", 5.0, 1.0, .46, .36, 1.60, 1.70, Wf, .04),
    (13.00, 1.00, "R", 6.0, 2.0, .50, .50, 1.10, 1.35, Wf, .03),  # speed ramp
    (14.00, 1.00, "R", 8.0, 1.0, .26, .36, 1.60, 1.70, Wf, .04),
    (15.00, 1.00, "R", 9.0, 1.0, .50, .78, 1.90, 2.15, Wf, .04),
    # --- GROOVE: every beat, mixing the decorating takes
    (16.00, 1.00, "B", 6.0, 1.0, .50, .50, 1.05, 1.15, G, .035),
    (17.00, 0.50, "A", 7.0, 1.0, .32, .30, 1.60, 1.65, Wf, .04),
    (17.50, 0.50, "B", 7.5, 1.0, .82, .50, 1.60, 1.65, Wf, .04),
    (18.00, 1.00, "A", 8.0, 0.6, .16, .50, 1.50, 1.62, Wf, .03),
    (19.00, 1.00, "R", 7.0, 1.0, .50, .55, 1.15, 1.25, Wf, .035),
    (20.00, 0.50, "B", 8.5, 1.0, .60, .55, 1.80, 1.85, Wf, .04),
    (20.50, 0.50, "A", 9.0, 1.0, .62, .42, 1.80, 1.85, Wf, .04),
    (21.00, 1.00, "R", 4.0, 0.5, .50, .66, 1.80, 2.00, Wf, 0),
    # --- RISER: slow-mo creep into the sparklers, then a breath of black
    (22.00, 1.50, "C", 0.0, 0.4, .50, .32, 1.30, 1.90, None, 0),
    (23.50, 0.50, None, 0, 1, 0, 0, 1, 1, None, 0),
    # --- DROP 2: the celebration
    (24.00, 2.00, "C", 1.0, 1.0, .50, .50, 1.00, 1.12, G, .035),
    (26.00, 1.00, "C", 3.0, 1.0, .30, .60, 1.70, 1.80, Wf, .04),
    (27.00, 1.00, "C", 4.0, 1.0, .50, .56, 1.70, 1.80, Wf, .04),
    (28.00, 1.00, "C", 5.0, 1.0, .30, .30, 1.60, 1.70, Wf, .04),
    (29.00, 1.00, "R", 9.0, 1.0, .50, .66, 2.00, 2.10, Wf, .04),
    (30.00, 0.50, "C", 6.5, 1.0, .78, .45, 1.70, 1.75, Wf, .04),
    (30.50, 0.50, "C", 7.0, 1.0, .50, .50, 1.10, 1.15, Wf, .04),
    (31.00, 1.00, "C", 7.5, 0.5, .50, .50, 1.20, 1.38, Wf, 0),
    # --- OUTRO / TITLE
    (32.00, 5.00, "C", 7.9, 0.42, .50, .52, 1.05, 1.30, G, 0),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-3000:]); sys.exit(1)

listfile = f"{SEG}/list.txt"
with open(listfile, "w") as lf:
    for i, (st, dur, src, sin, sp, cx, cy, z0, z1, flash, pulse) in enumerate(shots):
        out = f"{SEG}/s{i:02d}.mp4"
        lf.write(f"file '{out}'\n")
        nf = int(round(dur * FPS))
        if src is None:
            run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", f"color=black:s={W}x{H}:r={FPS}:d={dur}",
                 "-c:v", "libx264", "-crf", "10", "-preset", "fast", "-pix_fmt", "yuv420p", out])
            continue
        srcdur = dur * sp + 0.3
        chain = [f"trim=start={sin}:duration={srcdur:.3f}", "setpts=PTS-STARTPTS"]
        if sp != 1.0:
            chain.append(f"setpts=PTS/{sp}")
            if sp < 1.0:
                chain.append(f"minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1")
        chain.append(f"fps={FPS}")
        # 1264x720 is not exactly 16:9 -> crop to 1264x711, then upscale for sub-pixel-smooth zoompan
        chain += ["crop=1264:711:0:4", "scale=3792:2133:flags=lanczos"]
        zexpr = f"{z0}+({z1}-{z0})*on/{nf}"
        if pulse:
            zexpr += f"+{pulse}*exp(-9*mod({st}+on/{FPS}\\,0.5))"
        xexpr = f"max(0\\,min(iw-iw/zoom\\,{cx}*iw-iw/zoom/2))"
        yexpr = f"max(0\\,min(ih-ih/zoom\\,{cy}*ih-ih/zoom/2))"
        chain.append(f"zoompan=z='{zexpr}':x='{xexpr}':y='{yexpr}':d=1:s={W}x{H}:fps={FPS}")
        if flash:
            col, fd = flash
            chain.append(f"fade=t=in:st=0:d={fd}:color={col}")
        chain += [f"trim=end_frame={nf}", "setsar=1", "format=yuv420p"]
        run(["ffmpeg", "-y", "-v", "error", "-i", SRC[src], "-an", "-vf", ",".join(chain),
             "-frames:v", str(nf), "-c:v", "libx264", "-crf", "10", "-preset", "fast", out])
        print(f"shot {i:02d} @ {st:5.2f}s  {dur:.2f}s  {src} x{sp}", flush=True)

run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", listfile, "-c", "copy", f"{SEG}/rough.mp4"])

# ---------- finishing pass: grade, grain, vignette, letterbox, titles, music ----------
BAR_H = 138  # 2.39:1 inside 1920x1080
GOLD = "0xF6D27A"
def title(text, font, size, y, t_in, t_out, fade=0.6, color=GOLD, shadow=True):
    a = (f"if(lt(t\\,{t_in})\\,0\\,if(lt(t\\,{t_in + fade})\\,(t-{t_in})/{fade}\\,"
         f"if(lt(t\\,{t_out - fade})\\,1\\,if(lt(t\\,{t_out})\\,({t_out}-t)/{fade}\\,0))))")
    sh = ":shadowcolor=black@0.6:shadowx=0:shadowy=3" if shadow else ""
    return (f"drawtext=fontfile={font}:text='{text}':fontsize={size}:fontcolor={color}{sh}"
            f":x=(w-text_w)/2:y={y}:alpha='{a}'")

END = 37.0
vf = ",".join([
    "eq=contrast=1.07:saturation=1.16:gamma=0.98",
    "colorbalance=rs=-0.04:gs=-0.01:bs=0.05:rm=0.02:bm=-0.02:rh=0.06:gh=0.02:bh=-0.06",
    "curves=m='0/0 0.25/0.21 0.75/0.80 1/1'",
    "eq=brightness='-0.13*clip((t-33.2)/1.8\\,0\\,1)':saturation='1-0.15*clip((t-33.2)/1.8\\,0\\,1)':eval=frame",
    "vignette=angle=PI/4.6",
    "noise=alls=5:allf=t+u",
    f"drawbox=x=0:y=0:w=iw:h={BAR_H}:color=black:t=fill",
    f"drawbox=x=0:y=ih-{BAR_H}:w=iw:h={BAR_H}:color=black:t=fill",
    title("A   F E S T I V A L   O F   L I G H T S", FONT_T, 44, 742, 0.7, 3.8, 0.7),
    title("Happy Diwali", FONT_S, 168, 380, 32.35, END, 0.9),
    title("S P A R S H   ·   D I V I N E   A R T   S T U D I O", FONT_T, 30, 620, 33.3, END, 0.8, "0xF3E6C8"),
    "fade=t=in:st=0:d=0.8",
    f"fade=t=out:st={END - 1.4}:d=1.4",
])
run(["ffmpeg", "-y", "-v", "error", "-i", f"{SEG}/rough.mp4", "-i", f"{S}/music.wav",
     "-vf", vf, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
     "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-shortest",
     "-movflags", "+faststart", OUT])
print("done", OUT)
