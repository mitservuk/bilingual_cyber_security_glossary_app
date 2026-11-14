// Renders design/icon.svg to the PNG sizes iOS and the web manifest need.
// Run with: node scripts/make-icons.cjs
// Needs Playwright's Chromium, and the Inter Display font installed, because
// the logo's letter is drawn with it. The PNGs are committed, so this only
// has to be run when the logo changes.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const root = join(__dirname, '..');
  const svg = readFileSync(join(root, 'design', 'icon.svg'), 'utf8');
  const browser = await chromium.launch();
  for (const [name, size] of [['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(root, 'public', `${name}.png`) });
    await page.close();
  }
  await browser.close();
})();
