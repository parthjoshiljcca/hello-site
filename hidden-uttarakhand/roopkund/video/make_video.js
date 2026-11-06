// Renders the Roopkund episode (1080x1920, 30 fps): builds timeline.js from the narration's beat
// timings, draws every frame of episode.html (three.js) in headless Chromium, scores it with
// score.py and muxes picture and sound.
//
//   node make_video.js                 -> ../out/roopkund-episode.mp4
//   node make_video.js --stills=5,40   -> frames/still-5.png, still-40.png (no video)
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = __dirname, OUT = path.join(DIR, '..', 'out'), FPS = 30;
const opt = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1];
const STILLS = opt('stills', '');

function buildTimeline() {
  const beats = JSON.parse(fs.readFileSync(path.join(OUT, 'beats.json'), 'utf8'));
  const captions = [];
  for (const b of beats) {
    // one caption per sentence, timed by its share of the beat's text
    const parts = b.text.match(/[^।?]+[।?]?/g).map(s => s.trim()).filter(Boolean);
    const total = parts.reduce((n, s) => n + s.length, 0);
    let acc = 0;
    for (const s of parts) {
      const a = b.start + (b.end - b.start) * acc / total;
      acc += s.length;
      captions.push({ start: +a.toFixed(3), end: +(b.start + (b.end - b.start) * acc / total).toFixed(3), text: s });
    }
  }
  const duration = +(beats[beats.length - 1].end + 3.2).toFixed(2);
  fs.writeFileSync(path.join(DIR, 'timeline.js'), `window.TIMELINE = ${JSON.stringify({ duration, beats, captions })};\n`);
  return duration;
}

function run(cmd, args) {
  return new Promise((res, rej) => spawn(cmd, args, { stdio: 'inherit' }).on('exit', c => (c ? rej(new Error(`${cmd} exited ${c}`)) : res())));
}

(async () => {
  const DUR = buildTimeline();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error(e); process.exit(1); });
  await page.goto('file://' + path.join(DIR, 'episode.html'));
  await page.evaluate(async () => { await document.fonts.ready; await window.ready; });

  if (STILLS) {
    fs.mkdirSync(path.join(DIR, 'frames'), { recursive: true });
    for (const t of STILLS.split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(DIR, 'frames', `still-${t}.png`) });
    }
    return browser.close();
  }

  const sound = path.join(OUT, 'episode-sound.wav');
  execFileSync('python3', [path.join(DIR, 'score.py'), sound, String(DUR)], { stdio: 'inherit' });
  const silent = path.join(OUT, 'episode-silent.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('exit', c => (c ? rej(new Error('ffmpeg failed')) : res())));
  const N = Math.round(DUR * FPS);
  for (let f = 0; f < N; f++) {
    await page.evaluate(t => render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log(`frame ${f}/${N}`);
  }
  ff.stdin.end(); await browser.close(); await done;
  const final = path.join(OUT, 'roopkund-episode.mp4');
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', sound, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', final]);
  fs.unlinkSync(silent);
  console.log('Wrote', final);
})().catch(e => { console.error(e); process.exit(1); });
