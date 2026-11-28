// Renders one YouTube episode (1920x1080, 16:9): draws every frame of episode.html in headless Chromium
// with that episode's timing data (data/<name>.js, from make_data.py) and muxes it with the audiobook track.
//
//   node render.js prologue                 -> out/hidden-uttarakhand-prologue.mp4
//   node render.js prologue --stills=3,8,40 -> stills/prologue-3.png ... (no video)
//   node render.js prologue --to=60         -> only the first 60 seconds (a preview)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = __dirname, FPS = 30;
const name = process.argv[2];
const opt = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1];
const STILLS = opt('stills', ''), TO = parseFloat(opt('to', '0'));
const AUDIO = path.join(DIR, '..', 'audiobook', 'out', `${name}.mp3`);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error(e); process.exit(1); });
  await page.goto('file://' + path.join(DIR, 'episode.html') + '?ep=' + name);
  await page.evaluate(async () => { await window.ready; });
  const D = await page.evaluate(() => window.EP.duration);

  if (STILLS) {
    fs.mkdirSync(path.join(DIR, 'stills'), { recursive: true });
    for (const t of STILLS.split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(DIR, 'stills', `${name}-${t}.png`) });
    }
    return browser.close();
  }

  const end = TO || D;
  fs.mkdirSync(path.join(DIR, 'out'), { recursive: true });
  const out = path.join(DIR, 'out', `hidden-uttarakhand-${name}${TO ? '-preview' : ''}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', AUDIO, '-map', '0:v', '-map', '1:a', '-t', String(end),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('exit', c => (c ? rej(new Error('ffmpeg failed')) : res())));
  const N = Math.round(end * FPS);
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await page.evaluate(t => render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 900 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await browser.close(); await done;
  console.log('Wrote', out);
})().catch(e => { console.error(e); process.exit(1); });
