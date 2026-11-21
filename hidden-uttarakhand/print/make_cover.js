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
const TRIM_W = 5, TRIM_H = 8, BLEED = opt('bleed', .139), SPINE = opt('spine', .536);
const W = BLEED * 2 + TRIM_W * 2 + SPINE, H = TRIM_H + BLEED * 2;
const DIR = __dirname;

// About the Author, as on the book's website (taken from the built interior)
const interior = fs.readFileSync(path.join(DIR, 'interior.html'), 'utf8');
const about = interior.slice(interior.indexOf('id="about"'));
const paras = [...about.matchAll(/<p>(.*?)<\/p>/gs)].map(m => m[1]).slice(0, 4).join('</p><p>');

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
  .back .hook { font: italic 11pt/1.55 Alegreya; text-align: center; color: #d7c7a3; }
  .back .hook small { display: block; margin-top: .6em; font: 6.5pt Cinzel; letter-spacing: .25em; text-transform: uppercase; color: #9c8a63; font-style: normal; }
  .rule { display: flex; align-items: center; justify-content: center; gap: .12in; margin: .32in 0 .2in; color: #d4a74a; }
  .rule span { display: block; width: .9in; border-top: .7pt solid #a9813a; }
  .rule b { font: 9pt Cinzel; letter-spacing: .32em; color: #e2b75a; font-weight: 400; white-space: nowrap; }
  .back p { font: 9.6pt/1.5 Alegreya; text-align: justify; hyphens: auto; margin-bottom: .55em; color: #e3d8bf; }
  .back p .sc { font-family: 'Alegreya SC'; letter-spacing: .03em; color: #f0cf86; }
  .back img.author { display: block; width: 3.1in; margin: .22in auto 0; }
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
  const rgb = path.join(DIR, 'out', 'cover-rgb.pdf'), cmyk = path.join(DIR, 'out', 'hidden-uttarakhand-cover.pdf');
  await p.pdf({ path: rgb, width: `${W}in`, height: `${H}in`, printBackground: true, preferCSSPageSize: true });
  execFileSync('gs', ['-q', '-dSAFER', '-dBATCH', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-dPDFSETTINGS=/prepress', '-sColorConversionStrategy=CMYK',
    '-sProcessColorModel=DeviceCMYK', '-dAutoRotatePages=/None', `-sOutputFile=${cmyk}`, rgb]);
  fs.unlinkSync(rgb);
  await p.screenshot({ path: path.join(DIR, 'out', 'hidden-uttarakhand-cover-preview.png') });
  await browser.close();
  console.log(`cover: ${W.toFixed(3)} x ${H.toFixed(3)} in (spine ${SPINE} in, bleed ${BLEED} in)`);
})().catch(e => { console.error(e); process.exit(1); });
