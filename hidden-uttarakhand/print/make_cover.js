// Builds the full-wrap paperback cover (back + spine + front) for Notion Press as a print-ready PDF:
// the front art, a black spine and a black back cover with the epigraph and About the Author.
// Sizes follow Notion Press's 5x8 cover template: 0.139 in bleed all round, text kept in the safe
// zone 0.5 in inside the trim, and the barcode and MRP box at the foot of the back left clear. Spine
// width depends on page count and paper: Notion Press's template gives 0.563 in for 248 pages of
// cream paper (0.00227 in a page), so the default, 0.536 in, is for this interior's 235 (236) pages.
// Check it against the template Notion Press gives after the final interior is uploaded.
// The page is laid out in RGB and converted to a CMYK PDF with Ghostscript, as Notion Press asks.
//
//   node make_cover.js [--spine=0.536] [--bleed=0.139]  -> out/hidden-uttarakhand-cover.pdf (+ a .png preview)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const opt = (k, d) => +(process.argv.find(a => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1];
const TRIM_W = 5, TRIM_H = 8, BLEED = opt('bleed', .139);
const PAGES = +(execFileSync('pdfinfo', [path.join(__dirname, 'out', 'hidden-uttarakhand-interior.pdf')]).toString().match(/Pages:\s+(\d+)/)[1]);
const SPINE = opt('spine', +(Math.ceil(PAGES / 2) * 2 * .563 / 248).toFixed(3));   // unless given, from the page count
const W = BLEED * 2 + TRIM_W * 2 + SPINE, H = TRIM_H + BLEED * 2;
const DIR = __dirname;

// The back cover sells the book: a hook, the blurb, the book's promise, a short author line
const PEAK = `<svg viewBox="0 0 24 12" width="26" height="13"><path d="M1 11 L7 4 L10 7 L14 1 L19 7 L21 5 L23 11" fill="none" stroke="#c9a45a" stroke-width="1.1" stroke-linejoin="round"/><path d="M12.4 3.3 L14 1 L15.6 3.2 L14.7 2.9 L14 3.7 L13.3 2.9Z" fill="#c9a45a"/></svg>`;

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: Alegreya; src: url(fonts/Alegreya-400.ttf); }
  @font-face { font-family: Alegreya; font-style: italic; src: url(fonts/Alegreya-400i.ttf); }
  @font-face { font-family: 'Alegreya SC'; src: url(fonts/AlegreyaSC-500.ttf); }
  @font-face { font-family: Cinzel; src: url(fonts/Cinzel-400.ttf); }
  @font-face { font-family: Cinzel; font-weight: 600; src: url(fonts/Cinzel-600.ttf); }
  @page { size: ${W}in ${H}in; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}in; height: ${H}in; background: #000; }
  .panel { position: absolute; top: 0; height: ${H}in; overflow: hidden; }
  /* back: black; text in the template's safe zone, 0.5 in inside the trim */
  .back { left: 0; width: ${BLEED + TRIM_W}in; background: radial-gradient(ellipse 90% 60% at 50% 35%, #15110a 0%, #000 70%); color: #e8dcc2; }
  .back .safe { position: absolute; left: ${BLEED + .5}in; right: .5in; top: ${BLEED + .5}in; bottom: ${BLEED + 1.5}in; }
  .back .hook { font: italic 16pt/1.25 Alegreya; text-align: center; color: #efc970; margin-top: .05in; }
  .back .blurb { margin-top: .26in; padding: 0 .07in; }
  .back .blurb p { font: 9.5pt/1.48 Alegreya; text-align: justify; hyphens: auto; margin-bottom: .62em; color: #e6dcc4; }
  .back .blurb p.turn { font-style: italic; color: #f0d79c; text-align: center; }
  .back .blurb b { font-weight: 400; font-style: italic; color: #f3cf7a; }
  .rule { display: flex; align-items: center; justify-content: center; gap: .1in; margin: .2in 0 .14in; }
  .rule span { display: block; width: 1.05in; border-top: .7pt solid #8a6a2e; }
  .back .promise { text-align: center; font: 7.6pt/1.75 'Alegreya SC'; letter-spacing: .06em; color: #cdb37a; }
  .back .promise em { font-style: normal; color: #f0cf86; }
  .back .bio span { font-style: normal; color: #e2c27a; }
  .back .bio { margin-top: .2in; text-align: center; font: italic 8.4pt/1.45 Alegreya; color: #bfb194; padding: 0 .1in; }
  .back img.author { display: block; width: 2.5in; margin: .08in auto 0; }
  .back .barcode { position: absolute; left: ${BLEED + 2.52}in; top: ${BLEED + 6.58}in; width: 1.75in; height: 1.08in; }   /* the template's barcode & MRP box: left clear */
  .back .tag { position: absolute; left: ${BLEED + .5}in; bottom: ${BLEED + .32}in; font: 7pt Cinzel; letter-spacing: .25em; color: #9c8a63; text-transform: uppercase; line-height: 1.7; }
  /* spine */
  .spine { left: ${BLEED + TRIM_W}in; width: ${SPINE}in; background: #000; }
  .spine .txt { position: absolute; left: 50%; top: 50%; width: ${TRIM_H - .9}in; transform: translate(-50%, -50%) rotate(90deg);
                display: flex; align-items: center; justify-content: space-between; color: #e2b75a; white-space: nowrap; }
  .spine .t { font: ${Math.min(14, SPINE * 72 * .42).toFixed(1)}pt Cinzel; letter-spacing: .14em; }
  .spine .a { font: ${Math.min(9, SPINE * 72 * .26).toFixed(1)}pt Cinzel; letter-spacing: .18em; color: #c9a45a; }
  .spine .m { width: ${(SPINE * .38).toFixed(2)}in; }
  /* front */
  .front { left: ${BLEED + TRIM_W + SPINE}in; width: ${TRIM_W + BLEED}in; }
  .front img { width: 100%; height: 100%; object-fit: cover; object-position: 0 50%; display: block; }
</style></head><body>
  <div class="panel back"><div class="safe">
    <div class="hook">If the forest calls your name —<br>don’t answer.</div>
    <div class="blurb">
      <p>In October 2026, Professor Parth went to Uttarakhand to <i>relax</i>. He took two friends, one driver, three sweaters, and a notebook for the legends he heard.</p>
      <p>He came back with a police statement, a YouTube channel that won’t stop tagging him — and the phone number of a man who wanted something buried under the snow of Nanda Devi badly enough to chase them across an entire state.</p>
      <p class="turn">In 1965, a nuclear device was lost on that mountain. It has never been found.</p>
      <p>From a locked room in Mussoorie to the bells of Chitai, from a lake full of strangers’ bones to a forest that calls your name, <b>Hidden Uttarakhand</b> is a road trip through the untold stories of the Devbhoomi — and a chase that refuses to stay buried.</p>
    </div>
    <div class="rule"><span></span>${PEAK}<span></span></div>
    <div class="promise">Everything marked as <em>fact</em> is fact.<br>Everything marked as <em>legend</em> is legend.<br>Everything else is a <em>story</em>.</div>
    <div class="bio">Prof. Parth D. Joshi teaches young minds how machines think, writes code while the house sleeps, and collects stories of gods, ghosts and the places where the two meet. He is the author of <span>Ramayana Reimagined: The Eternal Legacy</span>.</div>
    <img class="author" src="cover/author-logo.png">
  </div>
  <div class="tag">Fiction · Folklore<br>Adventure</div>
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
  const rgb = path.join(DIR, 'out', 'cover-rgb.pdf'), cmyk = path.join(DIR, 'out', 'hidden-uttarakhand-cover.pdf');
  await p.pdf({ path: rgb, width: `${W}in`, height: `${H}in`, printBackground: true, preferCSSPageSize: true });
  execFileSync('gs', ['-q', '-dSAFER', '-dBATCH', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-dPDFSETTINGS=/prepress', '-sColorConversionStrategy=CMYK',
    '-sProcessColorModel=DeviceCMYK', '-dAutoRotatePages=/None', `-sOutputFile=${cmyk}`, rgb]);
  fs.unlinkSync(rgb);
  await p.screenshot({ path: path.join(DIR, 'out', 'hidden-uttarakhand-cover-preview.png') });
  await browser.close();
  console.log(`cover: ${W.toFixed(3)} x ${H.toFixed(3)} in (spine ${SPINE} in, bleed ${BLEED} in)`);
})().catch(e => { console.error(e); process.exit(1); });
