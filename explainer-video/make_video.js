// Renders the PaperDispatch explainer video.
//
//   node make_video.js                 -> visuals only, scene timing estimated from the script
//   node make_video.js --voice         -> natural English voice-over, offline Kokoro voice (tts_kokoro.py)
//   node make_video.js --voice --indic -> Indian-English voice, AI4Bharat Indic-TTS (tts_indic.py)
//   node make_video.js --voice --edge  -> Indian-English voice-over, Microsoft en-IN neural voice via edge-tts
//   --voice-name=<name>                -> override the voice (e.g. af_heart, am_fenrir, bm_george; en-IN-NeerjaNeural with --edge)
//   --audio-only                       -> keep the rendered video, rebuild only its soundtrack (reuses narration clips)
//   --tail-only                        -> re-render only the final scene, splice it onto the existing video
//   --no-music                         -> leave out the background music (music.py)
//   --script=teaser.json --portrait    -> another script, rendered 1080x1920 (9:16) instead of 1920x1080
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
const MUSIC_GAIN = 0.32;   // background music, before it ducks under the narration

const args = process.argv.slice(2);
const withVoice = args.includes('--voice');
const audioOnly = args.includes('--audio-only');
const tailOnly = args.includes('--tail-only');
const reuseVoice = audioOnly || tailOnly;
const withMusic = !args.includes('--no-music');
const voiceArg = args.find(a => a.startsWith('--voice-name='));
const scriptFile = (args.find(a => a.startsWith('--script=')) || '--script=script.json').split('=')[1];
const script = JSON.parse(fs.readFileSync(path.join(DIR, scriptFile), 'utf8'));
const portrait = args.includes('--portrait');
const SIZE = portrait ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
const NAME = script.output || 'paperdispatch-explainer';
const AUDIO = path.join(OUT, 'audio', NAME);
const engine = args.includes('--edge') ? 'edge' : args.includes('--indic') ? 'indic' : 'kokoro';
const voice = voiceArg ? voiceArg.split('=')[1] : { edge: script.voice, kokoro: script.kokoro.voice, indic: script.indic.speaker }[engine];

fs.mkdirSync(AUDIO, { recursive: true });

function probeDuration(file) {
  return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());
}

function synth(scene) {
  if (reuseVoice) {
    const cached = ['wav', 'mp3'].map(ext => path.join(AUDIO, `${scene.id}.${ext}`)).find(f => fs.existsSync(f));
    if (cached) return cached;
  }
  if (engine === 'indic') {
    const file = path.join(AUDIO, `${scene.id}.wav`);
    execFileSync(process.env.INDIC_TTS_PYTHON || 'python3', [path.join(DIR, 'tts_indic.py'), voice, file, scene.narration], { stdio: 'inherit' });
    return file;
  }
  if (engine === 'kokoro') {
    const file = path.join(AUDIO, `${scene.id}.wav`);
    const { speed } = script.kokoro;
    const lang = voice.startsWith('b') ? 'en-gb' : 'en-us';  // Kokoro: a* = American, b* = British voices
    execFileSync('python3', [path.join(DIR, 'tts_kokoro.py'), voice, String(speed), lang, file, scene.narration], { stdio: 'inherit' });
    return file;
  }
  const file = path.join(AUDIO, `${scene.id}.mp3`);
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

  fs.writeFileSync(path.join(OUT, `${NAME}.srt`), timeline.map((e, i) =>
    `${i + 1}\n${srtTime(e.start + LEAD)} --> ${srtTime(e.start + LEAD + e.speech)}\n${e.scene.narration}\n`).join('\n'));

  // 2. Frames: drive the stage page frame by frame and pipe JPEGs into ffmpeg.
  const silent = path.join(OUT, `${NAME}-silent.mp4`);
  const final = path.join(OUT, `${NAME}.mp4`);
  if (audioOnly) fs.copyFileSync(final, silent);
  else if (tailOnly) {
    // Keep every frame before the last scene's fade-in, re-render the rest, and join them.
    const cut = Math.floor((timeline[timeline.length - 1].start - 1) * FPS);
    const head = path.join(OUT, `${NAME}-head.mp4`), tail = path.join(OUT, `${NAME}-tail.mp4`), list = path.join(OUT, `${NAME}-parts.txt`);
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', final, '-an', '-frames:v', String(cut), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
      '-pix_fmt', 'yuv420p', '-r', String(FPS), head]);
    await renderFrames(timeline, total, tail, cut);
    fs.writeFileSync(list, `file '${head}'\nfile '${tail}'\n`);
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
    [head, tail, list].forEach(f => fs.unlinkSync(f));
  } else await renderFrames(timeline, total, silent);

  // 3. Audio: narration at each scene start, a whoosh on every scene change, and background
  //    music that ducks under the narration; then mux.
  const whoosh = path.join(DIR, 'sfx', 'whoosh.wav');
  if (!fs.existsSync(whoosh)) execFileSync('python3', [path.join(DIR, 'sfx.py')], { stdio: 'inherit' });
  const inputs = [], filters = [], voice = [], fx = [];
  const place = (file, at, gain, list) => {
    const i = inputs.length / 2 + 1, ms = Math.round(at * 1000);
    inputs.push('-i', file);
    filters.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${gain},adelay=${ms}|${ms},apad=whole_dur=${total.toFixed(3)}[s${i}]`);
    list.push(`[s${i}]`);
  };
  if (withVoice) timeline.forEach(e => place(e.audio, e.start + LEAD, 1, voice));
  timeline.slice(1).forEach(e => place(whoosh, Math.max(0, e.start - WHOOSH_LEAD), WHOOSH_GAIN, fx));
  const bus = (list, label) => filters.push(list.length > 1 ? `${list.join('')}amix=inputs=${list.length}:normalize=0[${label}]` : `${list[0]}anull[${label}]`);
  const parts = [];
  const duck = withMusic && voice.length > 0;
  if (voice.length) { bus(voice, duck ? 'voxall' : 'vox'); parts.push('[vox]'); }
  if (fx.length) { bus(fx, 'fx'); parts.push('[fx]'); }
  if (withMusic) {
    const music = path.join(AUDIO, 'music.wav');
    execFileSync('python3', [path.join(DIR, 'music.py'), total.toFixed(3), music], { stdio: 'inherit' });
    const i = inputs.length / 2 + 1;
    inputs.push('-i', music);
    filters.push(`[${i}:a]aresample=48000,volume=${MUSIC_GAIN}[mus]`);
    if (duck) {
      filters.push('[voxall]asplit=2[vox][key]', '[mus][key]sidechaincompress=threshold=0.015:ratio=6:attack=60:release=800[duck]');
      parts.push('[duck]');
    } else parts.push('[mus]');
  }
  filters.push(`${parts.join('')}amix=inputs=${parts.length}:normalize=0,loudnorm=I=-16:TP=-1.5[aout]`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs, '-filter_complex', filters.join(';'),
    '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
  fs.unlinkSync(silent);
  console.log('Wrote', final);
})().catch(err => { console.error(err); process.exit(1); });

async function renderFrames(timeline, total, silent, startFrame = 0) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => ff.on('exit', c => (c ? rej(new Error('ffmpeg failed')) : res())));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: SIZE });
  await page.goto('file://' + path.join(DIR, 'stage.html'));
  await page.evaluate(([tl, p]) => build(tl, p), [timeline.map(({ start, dur, scene }) => ({ start, dur, scene })), portrait]);
  const frames = Math.ceil(total * FPS);
  for (let f = startFrame; f < frames; f++) {
    await page.evaluate(t => setTime(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % (FPS * 10) === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await browser.close();
  await ffDone;
}
