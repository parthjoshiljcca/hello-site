// Renders the cinematic PaperDispatch trailer (1920x1080) from trailer.html + trailer.json,
// scores it with trailer_music.py and adds the closing voice line (Kokoro, tts_kokoro.py).
//
//   node make_trailer.js
//
// Needs: Node + Playwright (with Chromium), ffmpeg, python3 with numpy + scipy, and the
// Kokoro packages/models described in tts_kokoro.py.
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const FPS = 30;
const cues = JSON.parse(fs.readFileSync(path.join(DIR, 'trailer.json'), 'utf8'));
const NAME = cues.output;
const WORK = path.join(OUT, 'audio', NAME);
fs.mkdirSync(WORK, { recursive: true });

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('exit', code => (code ? reject(new Error(`${cmd} exited ${code}`)) : resolve()));
  });
}

(async () => {
  // 1. Score and voice.
  const music = path.join(WORK, 'score.wav');
  execFileSync('python3', [path.join(DIR, 'trailer_music.py'), path.join(DIR, 'trailer.json'), music], { stdio: 'inherit' });
  const vo = cues.vo.map((line, i) => {
    const file = path.join(WORK, `vo${i}.wav`);
    execFileSync('python3', [path.join(DIR, 'tts_kokoro.py'), cues.voice, '1.0', 'en-us', file, line.text], { stdio: 'inherit' });
    return { file, at: line.at };
  });

  // 2. Frames.
  const silent = path.join(OUT, `${NAME}-silent.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => ff.on('exit', c => (c ? rej(new Error('ffmpeg failed')) : res())));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => { throw e; });
  await page.goto('file://' + path.join(DIR, 'trailer.html'));
  await page.evaluate(c => build(c), cues);
  const frames = Math.round(cues.duration * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % (FPS * 10) === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await browser.close();
  await ffDone;

  // 3. Mix: score ducks under the voice, master to -14 LUFS (louder, trailer-style).
  const inputs = ['-i', music], filters = [], voLabels = [];
  vo.forEach((v, i) => {
    inputs.push('-i', v.file);
    const ms = Math.round(v.at * 1000);
    filters.push(`[${i + 2}:a]aresample=48000,aformat=channel_layouts=stereo,volume=1.6,adelay=${ms}|${ms},apad=whole_dur=${cues.duration}[v${i}]`);
    voLabels.push(`[v${i}]`);
  });
  filters.push(`${voLabels.join('')}amix=inputs=${voLabels.length}:normalize=0,asplit=2[vo][key]`);
  filters.push('[1:a]aresample=48000[mus]', '[mus][key]sidechaincompress=threshold=0.02:ratio=5:attack=40:release=900[duck]');
  filters.push('[duck][vo]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1[aout]');
  const final = path.join(OUT, `${NAME}.mp4`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs, '-filter_complex', filters.join(';'),
    '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', final]);
  fs.unlinkSync(silent);
  console.log('Wrote', final);
})().catch(err => { console.error(err); process.exit(1); });
