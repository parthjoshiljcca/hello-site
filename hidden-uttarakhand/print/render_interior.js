// Lays out interior.html with Paged.js in headless Chromium and prints it to a 5x8 in PDF for
// Notion Press.
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
  await page.pdf({ path: file, preferCSSPageSize: true, printBackground: true });
  await browser.close();
  console.log(`Wrote ${file}: ${pages} pages`);
})().catch(e => { console.error(e); process.exit(1); });
