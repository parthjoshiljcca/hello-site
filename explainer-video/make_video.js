// Renders the PaperDispatch explainer video.
//
//   node make_video.js                 -> visuals only, scene timing estimated from the script
//   node make_video.js --voice         -> natural English voice-over, offline Kokoro voice (tts_kokoro.py)
//   node make_video.js --voice --indic -> Indian-English voice, AI4Bharat Indic-TTS (tts_indic.py)
//   node make_video.js --voice --edge  -> Indian-English voice-over, Microsoft en-IN neural voice via edge-tts
//   --voice-name=<name>                -> override the voice (e.g. af_heart, am_fenrir, bm_george; en-IN-NeerjaNeural with --edge)
// With --voice, every scene is timed to its narration.
//
// Needs: Node + Playwright (with Chromium), ffmpeg/ffprobe, and for --voice either
// the packages named at the top of tts_indic.py / tts_kokoro.py, or `pip install edge-tts`.
// INDIC_TTS_PYTHON picks the Python that has coqui-tts installed (default python3).
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const FPS = 30;
const LEAD = 0.5;   // silence before each narration line
const TAIL = 0.9;   // pause after each narration line
const WORDS_PER_SEC = 2.45;
const WHOOSH_LEAD = 0.45;  // start the whoosh this long before the next scene begins
const WHOOSH_GAIN = 0.35;  // relative to the narration

const args = process.argv.slice(2);
const withVoice = args.includes('--voice');
const voiceArg = args.find(a => a.startsWith('--voice-name='));
const script = JSON.parse(fs.readFileSync(path.join(DIR, 'script.json'), 'utf8'));
const engine = args.includes('--edge') ? 'edge' : args.includes('--indic') ? 'indic' : 'kokoro';
const voice = voiceArg ? voiceArg.split('=')[1] : { edge: script.voice, kokoro: script.kokoro.voice, indic: script.indic.speaker }[engine];

fs.mkdirSync(path.join(OUT, 'audio'), { recursive: true });

function probeDuration(file) {
  return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());
}

function synth(scene) {
  if (engine === 'indic') {
    const file = path.join(OUT, 'audio', `${scene.id}.wav`);
    execFileSync(process.env.INDIC_TTS_PYTHON || 'python3', [path.join(DIR, 'tts_indic.py'), voice, file, scene.narration], { stdio: 'inherit' });
    return file;
  }
  if (engine === 'kokoro') {
    const file = path.join(OUT, 'audio', `${scene.id}.wav`);
    const { speed } = script.kokoro;
    const lang = voice.startsWith('b') ? 'en-gb' : 'en-us';  // Kokoro: a* = American, b* = British voices
    execFileSync('python3', [path.join(DIR, 'tts_kokoro.py'), voice, String(speed), lang, file, scene.narration], { stdio: 'inherit' });
    return file;
  }
  const file = path.join(OUT, 'audio', `${scene.id}.mp3`);
  const proxy = process.env.HTTPS_PROXY ? ['--proxy', process.env.HTTPS_PROXY] : [];
  execFileSync('edge-tts', [...proxy, '--voice', voice, `--rate=${script.rate}`, '--text', scene.narration, '--write-media', file], { stdio: 'inherit' });
  return file;
}

function srtTime(s) {
  const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
}

function run(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, { stdio: 'inherit' });
    p.on('exit', code => (code ? reject(new Error(`${cmd} exited ${code}`)) : resolve()));
  });
}

(async () => {
  // 1. Timing: from real narration audio when voiced, otherwise from word count.
  let start = 0;
  const timeline = script.scenes.map(scene => {
    let speech, audio = null;
    if (withVoice) {
      audio = synth(scene);
      speech = probeDuration(audio);
    } else {
      speech = scene.narration.split(/\s+/).length / WORDS_PER_SEC;
    }
    const entry = { start, dur: LEAD + speech + TAIL, speech, audio, scene };
    start += entry.dur;
    return entry;
  });
  const total = start;
  console.log(`Total length ${total.toFixed(1)}s, ${timeline.length} scenes`);

  fs.writeFileSync(path.join(OUT, 'paperdispatch-explainer.srt'), timeline.map((e, i) =>
    `${i + 1}\n${srtTime(e.start + LEAD)} --> ${srtTime(e.start + LEAD + e.speech)}\n${e.scene.narration}\n`).join('\n'));

  // 2. Frames: drive the stage page frame by frame and pipe JPEGs into ffmpeg.
  const silent = path.join(OUT, 'video-silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => ff.on('exit', c => (c ? rej(new Error('ffmpeg failed')) : res())));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(DIR, 'stage.html'));
  await page.evaluate(tl => build(tl), timeline.map(({ start, dur, scene }) => ({ start, dur, scene })));
  const frames = Math.ceil(total * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => setTime(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % (FPS * 10) === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await browser.close();
  await ffDone;

  // 3. Audio: narration clips at their scene starts, a whoosh on every scene change, then mux.
  const final = path.join(OUT, 'paperdispatch-explainer.mp4');
  const whoosh = path.join(DIR, 'sfx', 'whoosh.wav');
  if (!fs.existsSync(whoosh)) execFileSync('python3', [path.join(DIR, 'sfx.py')], { stdio: 'inherit' });
  const clips = [];
  if (withVoice) timeline.forEach(e => clips.push({ file: e.audio, at: e.start + LEAD, gain: 1 }));
  timeline.slice(1).forEach(e => clips.push({ file: whoosh, at: Math.max(0, e.start - WHOOSH_LEAD), gain: WHOOSH_GAIN }));
  const inputs = [], filters = [];
  clips.forEach((c, i) => {
    inputs.push('-i', c.file);
    const ms = Math.round(c.at * 1000);
    filters.push(`[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${c.gain},adelay=${ms}|${ms}[a${i}]`);
  });
  filters.push(clips.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${clips.length}:normalize=0,loudnorm=I=-16:TP=-1.5,apad[aout]`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs, '-filter_complex', filters.join(';'),
    '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
  fs.unlinkSync(silent);
  console.log('Wrote', final);
})().catch(err => { console.error(err); process.exit(1); });
