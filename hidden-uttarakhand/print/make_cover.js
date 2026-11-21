// Builds the full-wrap paperback cover (back + spine + front) for Notion Press as a print-ready PDF:
// the front art, a black spine and a black back cover with the epigraph and About the Author.
// Spine width depends on the page count and paper, so it is a parameter: use the cover size Notion
// Press shows after the interior is uploaded.
//
//   node make_cover.js [--spine=0.62] [--bleed=0.125]   -> out/hidden-uttarakhand-cover.pdf (+ a .png preview)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const opt = (k, d) => +(process.argv.find(a => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1];
const TRIM_W = 5, TRIM_H = 8, BLEED = opt('bleed', .125), SPINE = opt('spine', .62);
const W = BLEED * 2 + TRIM_W * 2 + SPINE, H = TRIM_H + BLEED * 2;
const DIR = __dirname;

// About the Author, as on the book's website (taken from the built interior)
const interior = fs.readFileSync(path.join(DIR, 'interior.html'), 'utf8');
const about = interior.slice(interior.indexOf('id="about"'));
const paras = [...about.matchAll(/<p>(.*?)<\/p>/gs)].map(m => m[1]).slice(0, 4).join('</p><p>');

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: Literata; src: url(fonts/Literata-400.ttf); }
  @font-face { font-family: Literata; font-style: italic; src: url(fonts/Literata-400i.ttf); }
  @font-face { font-family: Marcellus; src: url(fonts/Marcellus-400.ttf); }
  @page { size: ${W}in ${H}in; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}in; height: ${H}in; background: #000; }
  .panel { position: absolute; top: 0; height: ${H}in; overflow: hidden; }
  /* back: black, everything kept 0.3 in inside the trim */
  .back { left: 0; width: ${BLEED + TRIM_W}in; background: radial-gradient(ellipse 90% 60% at 50% 35%, #15110a 0%, #000 70%); color: #e8dcc2; }
  .back .safe { position: absolute; left: ${BLEED + .45}in; right: .45in; top: ${BLEED + .5}in; bottom: ${BLEED + .4}in; }
  .back .hook { font: italic 10.5pt/1.6 Literata; text-align: center; color: #d7c7a3; }
  .back .hook small { display: block; margin-top: .6em; font: 6.5pt Marcellus; letter-spacing: .25em; text-transform: uppercase; color: #9c8a63; font-style: normal; }
  .rule { display: flex; align-items: center; justify-content: center; gap: .12in; margin: .32in 0 .2in; color: #d4a74a; }
  .rule span { display: block; width: .9in; border-top: .7pt solid #a9813a; }
  .rule b { font: 9pt Marcellus; letter-spacing: .32em; color: #e2b75a; font-weight: 400; white-space: nowrap; }
  .back p { font: 9pt/1.55 Literata; text-align: justify; hyphens: auto; margin-bottom: .55em; color: #e3d8bf; }
  .back p .sc { font-variant: small-caps; letter-spacing: .04em; color: #f0cf86; }
  .back img.author { display: block; width: 3.1in; margin: .22in auto 0; mix-blend-mode: screen; }
  .back .barcode { position: absolute; right: .45in; bottom: ${BLEED + .35}in; width: 2in; height: 1.2in; }   /* left clear for the ISBN barcode */
  .back .tag { position: absolute; left: ${BLEED + .45}in; bottom: ${BLEED + .45}in; font: 7pt Marcellus; letter-spacing: .25em; color: #9c8a63; text-transform: uppercase; line-height: 1.7; }
  /* spine */
  .spine { left: ${BLEED + TRIM_W}in; width: ${SPINE}in; background: #000; }
  .spine .txt { position: absolute; left: 50%; top: 50%; width: ${TRIM_H - .9}in; transform: translate(-50%, -50%) rotate(90deg);
                display: flex; align-items: center; justify-content: space-between; color: #e2b75a; white-space: nowrap; }
  .spine .t { font: ${Math.min(14, SPINE * 72 * .42).toFixed(1)}pt Marcellus; letter-spacing: .14em; }
  .spine .a { font: ${Math.min(9, SPINE * 72 * .26).toFixed(1)}pt Marcellus; letter-spacing: .18em; color: #c9a45a; }
  .spine .m { width: ${(SPINE * .38).toFixed(2)}in; }
  /* front */
  .front { left: ${BLEED + TRIM_W + SPINE}in; width: ${TRIM_W + BLEED}in; }
  .front img { width: 100%; height: 100%; object-fit: cover; object-position: 0 50%; display: block; }
</style></head><body>
  <div class="panel back"><div class="safe">
    <div class="hook">“Up here, after dark, if the forest calls your name, you don't answer. You don't turn round. You don't even say ‘who's there.’ You let it call.”<small>Overheard at Khaliya Top</small></div>
    <div class="rule"><span></span><b>ABOUT THE AUTHOR</b><span></span></div>
    <p>${paras}</p>
    <img class="author" src="cover/author-logo.png">
  </div>
  <div class="tag">Places · People · Culture<br>Untold Stories</div>
  <div class="barcode"></div></div>
  <div class="panel spine"><div class="txt"><span class="t">HIDDEN UTTARAKHAND</span>
    <svg class="m" viewBox="0 0 64 34"><path d="M2 32 L20 10 L28 18 L40 2 L62 32 Z" fill="none" stroke="#c9a45a" stroke-width="3" stroke-linejoin="round"/></svg>
    <span class="a">PARTH D. JOSHI</span></div></div>
  <div class="panel front"><img src="cover/front-art-300dpi.jpg"></div>
</body></html>`;

(async () => {
  fs.writeFileSync(path.join(DIR, 'cover.html'), page);
  fs.mkdirSync(path.join(DIR, 'out'), { recursive: true });
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: Math.round(W * 96), height: Math.round(H * 96) } });
  await p.goto('file://' + path.join(DIR, 'cover.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(DIR, 'out', 'hidden-uttarakhand-cover.pdf'), width: `${W}in`, height: `${H}in`, printBackground: true, preferCSSPageSize: true });
  await p.screenshot({ path: path.join(DIR, 'out', 'hidden-uttarakhand-cover-preview.png') });
  await browser.close();
  console.log(`cover: ${W.toFixed(3)} x ${H.toFixed(3)} in (spine ${SPINE} in, bleed ${BLEED} in)`);
})().catch(e => { console.error(e); process.exit(1); });
