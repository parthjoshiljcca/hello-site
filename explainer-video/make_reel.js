// Renders the 10-second "exam completed" reel (1080x1920) from reel.html and scores it
// with reel_music.py.
//
//   node make_reel.js
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const FPS = 30, DUR = 10, NAME = 'paperdispatch-exam-completed-reel';

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('exit', code => (code ? reject(new Error(`${cmd} exited ${code}`)) : resolve()));
  });
}

(async () => {
  const work = path.join(OUT, 'audio', NAME);
  fs.mkdirSync(work, { recursive: true });
  const music = path.join(work, 'score.wav');
  execFileSync('python3', [path.join(DIR, 'reel_music.py'), music], { stdio: 'inherit' });

  const silent = path.join(OUT, `${NAME}-silent.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => ff.on('exit', c => (c ? rej(new Error('ffmpeg failed')) : res())));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { throw e; });
  await page.goto('file://' + path.join(DIR, 'reel.html'));
  for (let f = 0; f < DUR * FPS; f++) {
    await page.evaluate(t => render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await browser.close();
  await ffDone;

  const final = path.join(OUT, `${NAME}.mp4`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', music, '-filter_complex', '[1:a]loudnorm=I=-14:TP=-1[a]',
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', final]);
  fs.unlinkSync(silent);
  console.log('Wrote', final);
})().catch(err => { console.error(err); process.exit(1); });
