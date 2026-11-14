// Renders public/icon.svg to the PNG sizes iOS and the web manifest need.
// Run with: node scripts/make-icons.cjs (needs Playwright's Chromium).
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const pub = join(__dirname, '..', 'public');
  const svg = readFileSync(join(pub, 'icon.svg'), 'utf8');
  const browser = await chromium.launch();
  for (const [name, size] of [['apple-touch-icon', 180], ['icon-192', 192], ['icon-512', 512]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
    await page.screenshot({ path: join(pub, `${name}.png`) });
    await page.close();
  }
  await browser.close();
})();
