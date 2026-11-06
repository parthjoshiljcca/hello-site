import json,base64,subprocess,urllib.request,sys
lines=json.load(open('lines.json')); spk=sys.argv[1] if len(sys.argv)>1 else 'kabir'
for l in lines:
    body=json.dumps({"text":l["tts"],"target_language_code":"hi-IN","model":"bulbul:v3","speaker":spk,"pace":float(sys.argv[2]) if len(sys.argv)>2 else 1.1,"speech_sample_rate":48000}).encode()
    req=urllib.request.Request("https://api.sarvam.ai/text-to-speech",body,{"Content-Type":"application/json","api-subscription-key":"proxy-injected"})
    d=json.load(urllib.request.urlopen(req))
    raw=f"audio/{l['id']:02d}_raw.wav"; open(raw,'wb').write(base64.b64decode(d["audios"][0]))
    out=f"audio/{l['id']:02d}.wav"
    # trim leading/trailing silence
    subprocess.run(["ffmpeg","-v","error","-y","-i",raw,"-af","silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",out],check=True)
    dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",out]))
    l["dur"]=round(dur,3); print(l["id"],dur)
json.dump(lines,open('lines.json','w'),ensure_ascii=False,indent=1)
