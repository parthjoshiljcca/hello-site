// Renders the 1080x1920 "Hidden Uttarakhand" preface video from preface.html (which exposes
// render(t)) and scores it with preface_music.py.
//
//   node make_video.js                 -> out/hidden-uttarakhand-preface.mp4
//   node make_video.js --stills=3,14   -> out/frames/still-3.png, still-14.png (no video)
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const opt = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1];
const FPS = 30, DUR = +opt('dur', 40), NAME = opt('name', 'hidden-uttarakhand-preface');
const STILLS = opt('stills', '');

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('exit', code => (code ? reject(new Error(`${cmd} exited ${code}`)) : resolve()));
  });
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error(e); process.exit(1); });
  await page.goto('file://' + path.join(DIR, 'preface.html'));
  await page.evaluate(() => document.fonts.ready);
  return page;
}

(async () => {
  const browser = await chromium.launch();
  const page = await openPage(browser);

  if (STILLS) {
    fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
    for (const t of STILLS.split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.join(OUT, 'frames', `still-${t}.png`) });
    }
    await browser.close();
    return;
  }

  const work = path.join(OUT, 'audio', NAME);
  fs.mkdirSync(work, { recursive: true });
  const music = path.join(work, 'score.wav');
  execFileSync('python3', [path.join(DIR, 'preface_music.py'), music, String(DUR)], { stdio: 'inherit', cwd: DIR });

  const silent = path.join(OUT, `${NAME}-silent.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => ff.on('exit', c => (c ? rej(new Error('ffmpeg failed')) : res())));
  for (let f = 0; f < DUR * FPS; f++) {
    await page.evaluate(t => render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${DUR * FPS}`);
  }
  ff.stdin.end();
  await browser.close();
  await ffDone;

  const final = path.join(OUT, `${NAME}.mp4`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', music, '-filter_complex', '[1:a]loudnorm=I=-15:TP=-1.5[a]',
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', final]);
  fs.unlinkSync(silent);
  console.log('Wrote', final);
})().catch(err => { console.error(err); process.exit(1); });
