/* Regenerates the README screenshots into docs/. Run: node tests/screens.js */
const { chromium } = require('playwright-core');
const { start } = require('./serve'); const { withEmoji } = require('./helpers');
(async () => {
  const srv = await start(0); const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function page(vp, locale) { const c = await b.newContext({ viewport: vp, deviceScaleFactor: 2, locale: locale || 'en-US' }); const p = await c.newPage(); p.on('dialog', d => d.accept()); return p; }
  let p = await page({ width: 390, height: 844 });
  await p.goto(base + '/menu.html'); await p.locator('.mv-title').waitFor(); await withEmoji(p);
  await p.screenshot({ path: 'docs/menu-ar.png' });
  await p.click('#mv-lang'); await p.locator('.mv-item[data-item=i2]').click(); await p.locator('.mv-size[data-size="1"]').click(); await p.click('[data-confirm-add]');
  await p.locator('.mv-item[data-item=i6] .mv-add').click(); await p.click('#mv-open-order'); await p.fill('#mv-table', '7'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'docs/order-en.png' });
  await p.context().close();
  p = await page({ width: 390, height: 844 });
  await p.goto(base + '/index.html'); await p.waitForSelector('body[data-ready="1"]');
  await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('menyu.data.v1')); const n = { primary: '#e6b450', accent: '#e6b450', bg: '#16130f', text: '#f4ede0' }; Object.assign(d.theme, n, { layout: 'list' }); d.brand.nameEn = 'Noir Lounge'; d.brand.nameAr = 'نوار لاونج'; localStorage.setItem('menyu.data.v1', JSON.stringify(d)); });
  await p.goto(base + '/menu.html?preview=1&lang=en'); await p.locator('.mv-title').waitFor(); await withEmoji(p);
  await p.screenshot({ path: 'docs/menu-noir.png' });
  await p.context().close();
  p = await page({ width: 1360, height: 900 });
  await p.goto(base + '/index.html'); await p.waitForSelector('body[data-ready="1"]'); await p.frameLocator('#pv-frame').locator('.mv-title').waitFor(); await withEmoji(p);
  await p.screenshot({ path: 'docs/admin-menu.png' });
  await p.click('.tabs [data-tab=brand]'); await p.waitForTimeout(300); await p.screenshot({ path: 'docs/admin-brand.png' });
  await p.click('.tabs [data-tab=share]'); await p.waitForTimeout(300); await p.screenshot({ path: 'docs/admin-share.png' });
  await p.click('.tabs [data-tab=menu]'); await p.click('#add-item'); await p.fill('#i-nameEn', 'Fattoush'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'docs/item-editor.png' });
  await b.close(); srv.close();
})();
