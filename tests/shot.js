const { chromium } = require('playwright-core');
const { start } = require('./serve');
(async () => {
  const srv = await start(0); const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errs = [];
  async function shot(name, url, vp, fn) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, locale: 'en-US' });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(name + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()); });
    await p.goto(base + url); await p.waitForTimeout(600);
    if (fn) await fn(p);
    await p.screenshot({ path: '/tmp/' + name + '.png' });
    await ctx.close();
  }
  await shot('menu-m', '/menu.html', { width: 390, height: 844 });
  await shot('admin-m', '/index.html', { width: 390, height: 844 });
  await shot('admin-d', '/index.html', { width: 1280, height: 860 });
  await shot('brand-d', '/index.html', { width: 1280, height: 860 }, async p => { await p.click('[data-tab=brand]'); await p.waitForTimeout(300); });
  console.log(errs.join('\n') || 'no errors');
  await b.close(); srv.close();
})();
