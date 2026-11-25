# Song analysis for beat-cut editing. Usage: python3 beats.py song.mp3
# Prints a 1-second energy bar chart, tempo, phrase length (8 beats) and strong onsets.
# Read it like this: low bars = quiet intro/break (good for title cards on black);
# the first big jump = the DROP (put the hero/face reveal + light flash there).
import sys, subprocess, numpy as np
raw = subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-ac","1","-ar","11025","-f","s16le","-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(float)/32768; sr=11025; h=256; fps=sr/h
n = len(x)//h; e = np.sqrt(np.array([np.mean(x[i*h:(i+1)*h]**2) for i in range(n)]))
print(f"duration {len(x)/sr:.2f}s")
for i in range(0, n, int(fps)):
    print(f"{i/fps:6.1f} {'#'*int(e[i:i+int(fps)].mean()*120)}")
f = np.maximum(np.diff(e), 0)
ac = np.correlate(f-f.mean(), f-f.mean(), 'full')[len(f)-1:]
lo, hi = int(0.3*fps), int(1.5*fps); L = lo+np.argmax(ac[lo:hi]); beat = L/fps
print(f"beat {beat:.4f}s  bpm {60/beat:.1f}  phrase(8 beats) {8*beat:.3f}s  half {4*beat:.3f}s")
thr = np.percentile(f, 98)
print("onsets:", [round(i/fps,2) for i in range(1,len(f)-1) if f[i]>thr and f[i]>=f[i-1] and f[i]>=f[i+1]])
