// Lays out interior.html with Paged.js in headless Chromium, prints it to a 5x8 in PDF and converts
// it to greyscale with Ghostscript for Notion Press.
//
//   node render_interior.js            -> out/hidden-uttarakhand-interior.pdf
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const out = path.join(__dirname, 'out');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('page error:', e.message));
  page.on('console', m => { if (m.text().startsWith('pages:')) console.log(m.text()); });
  await page.addInitScript(() => { window.PagedConfig = { auto: false }; });
  await page.goto('file://' + path.join(__dirname, 'interior.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.addScriptTag({ path: path.join(__dirname, 'node_modules/pagedjs/dist/paged.polyfill.js') });
  const pages = await page.evaluate(async () => {
    class Progress extends Paged.Handler { afterPageLayout(el, page) { if (page.position % 25 === 0) console.log('pages: ' + page.position); } }
    Paged.registerHandlers(Progress);
    const flow = await window.PagedPolyfill.preview();
    return flow.total;
  });
  const file = path.join(out, 'hidden-uttarakhand-interior.pdf');
  const raw = path.join(out, 'interior-rgb.pdf');
  await page.pdf({ path: raw, preferCSSPageSize: true, printBackground: true });
  await browser.close();
  // a pure greyscale PDF for the black-and-white press
  require('child_process').execFileSync('gs', ['-q', '-dSAFER', '-dBATCH', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-dPDFSETTINGS=/prepress',
    '-sColorConversionStrategy=Gray', '-dProcessColorModel=/DeviceGray', '-dAutoRotatePages=/None', `-sOutputFile=${file}`, raw]);
  fs.unlinkSync(raw);
  console.log(`Wrote ${file}: ${pages} pages`);
  // Paged.js has dropped text at page breaks before: every word of the source must be in the PDF
  try { console.log(require('child_process').execFileSync('python3', [path.join(__dirname, 'check_text.py')]).toString().trim().split('\n').pop()); }
  catch (e) { console.error('TEXT MISSING FROM THE PDF:\n' + e.stdout); process.exitCode = 1; }
})().catch(e => { console.error(e); process.exit(1); });
