# Builds the drawtext chain for title cards (on black) + a small roaming watermark.
# Usage: titles.py W H spec.json fontdir
# spec.json: {"cards":[{"t0":0.6,"t1":3.3,"lines":[["WITH THE BLESSINGS OF",32,"ivory"],["MAHADEV",80,"gold"]]}],
#             "watermark":{"text":"©brahmaroopam.ai","size":12,"alpha":0.45,"times":[6.73,9.73,...,22.4]}}
import sys, json
W,H=int(sys.argv[1]),int(sys.argv[2]); spec=json.load(open(sys.argv[3])); fontdir=sys.argv[4]
TF=f"{fontdir}/Cinzel.ttf"; WF="/usr/share/fonts/opentype/inter/Inter-Light.otf"
K=W/1080
COL={'gold':'0xE9C982','ivory':'0xF4EEE2','white':'white'}
def esc(s): return s.replace("'", "’").replace(':','\\:').replace('%','\\%')
def sp(s):  # cinematic letter-spacing
    return ' '.join(' ' if c==' ' else c for c in s).replace('   ','    ')
def A(a,b,fi,fo,peak=1.0):
    return f"{peak}*if(lt(t,{a}),0,if(lt(t,{a+fi}),(t-{a})/{fi},if(lt(t,{b-fo}),1,if(lt(t,{b}),({b}-t)/{fo},0))))"
out=[]
if 'fade_out' in spec:
    st,d=spec['fade_out']; out.append(f"fade=t=out:st={st}:d={d}")
for c in spec['cards']:
    t0,t1=c['t0'],c['t1']; lines=c['lines']
    gap=c.get('gap',22)*K
    hs=[l[1]*K for l in lines]; total=sum(hs)+gap*(len(lines)-1)
    y=H*c.get('ycenter',0.47)-total/2
    for j,(txt,size,col) in enumerate(lines):
        a=t0+0.35*j                                   # stagger lines
        fi=c.get('fade_in',1.1); fo=c.get('fade_out',0.6)
        drift=14*K
        out.append(
          f"drawtext=fontfile={TF}:text='{esc(sp(txt))}':fontsize={round(size*K)}:fontcolor={COL.get(col,col)}:"
          f"alpha='{A(a,t1,fi,fo)}':x=(w-tw)/2:y='{y:.1f}+{drift:.1f}*max(0,1-(t-{a})/1.8)':"
          f"borderw={round((1.0 if size>=50 else 0.5)*K)}:bordercolor={COL.get(col,col)}@0.8:"
          f"enable='between(t,{a},{t1})'")
        y+=size*K+gap
wm=spec.get('watermark')
if wm:
    ts=wm['times']; groups=ts if isinstance(ts[0],list) else [ts]; fs=round(wm.get('size',12)*K); al=wm.get('alpha',0.45); m=round(36*K)
    # roaming spots inside Instagram-safe area (avoid right-side buttons & bottom caption)
    spots=[(f"{m}",f"h*0.16"),(f"w-tw-{m}",f"h*0.16"),(f"{m}","h*0.64"),("(w-tw)/2","h*0.80"),
           (f"w-tw-{round(140*K)}","h*0.40"),(f"{m}","h*0.30")]
    pairs=[(g[k],g[k+1]) for g in groups for k in range(len(g)-1)]
    for k,(a,b) in enumerate(pairs):
        x,yy=spots[k%len(spots)]
        out.append(f"drawtext=fontfile={WF}:text='{esc(wm['text'])}':fontsize={fs}:fontcolor=white:"
                   f"alpha='{A(a+0.15,b-0.05,0.5,0.4,al)}':x={x}:y={yy}:shadowcolor=black@0.35:shadowx=1:shadowy=1:"
                   f"enable='between(t,{a},{b})'")
print(','.join(out))
