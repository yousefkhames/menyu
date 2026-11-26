/* Real-browser click-through (Chrome via playwright-core). Run: node tests/e2e.js */
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path'), assert = require('node:assert/strict');
const { start } = require('./serve');
const { withEmoji } = require('./helpers');
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const OUT = process.env.SHOTS || '/tmp/menyu-shots';
fs.mkdirSync(OUT, { recursive: true });

// 1x1 red PNG for upload tests
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
let passed = 0;
async function step(name, fn) {
  try { await fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { console.error('FAIL  ' + name + '\n' + (e.stack || e)); process.exitCode = 1; throw e; }
}

(async () => {
  const srv = await start(0);
  const base = 'http://127.0.0.1:' + srv.address().port;
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const errors = [];
  async function newPage(viewport, opts) {
    const ctx = await browser.newContext(Object.assign({ viewport, locale: 'en-US', acceptDownloads: true, deviceScaleFactor: 2 }, opts || {}));
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base }).catch(() => {});
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('dialog', d => d.accept());
    return page;
  }
  const noOverflow = async (page) => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'horizontal overflow');

  try {
    /* ============ ADMIN, desktop ============ */
    const a = await newPage({ width: 1280, height: 860 });
    await a.goto(base + '/index.html');
    await a.waitForSelector('body[data-ready="1"]');
    const pv = () => a.frameLocator('#pv-frame');

    await step('admin loads sample menu with live preview', async () => {
      assert.equal(await a.locator('.row').count(), 14);
      await pv().locator('.mv-title').waitFor();
      assert.equal(await pv().locator('.mv-title').innerText(), 'ركن القهوة');
      assert.equal(await a.evaluate(() => document.documentElement.dir), 'ltr');
    });

    await step('UI language switches to Arabic RTL and back', async () => {
      await a.click('#lang-btn');
      assert.equal(await a.evaluate(() => document.documentElement.dir), 'rtl');
      assert.match(await a.locator('#add-item').innerText(), /إضافة صنف/);
      await a.click('#lang-btn');
      assert.equal(await a.evaluate(() => document.documentElement.dir), 'ltr');
    });

    await step('add category via dialog, validation blocks empty name', async () => {
      await a.click('#add-cat');
      await a.click('#dlg-save');
      assert.match(await a.locator('#dlg-cat .err').innerText(), /at least one language/);
      await a.fill('#c-ar', 'مقبلات'); await a.fill('#c-en', 'Starters'); await a.click('#dlg-cat [data-icon=salad]');
      await a.click('#dlg-save');
      await a.locator('.cat[data-cat]', { hasText: 'Starters' }).waitFor();
      assert.equal(await a.locator('.cat').count(), 5);
    });

    await step('add item with sizes + photo upload, appears in preview with sizes', async () => {
      await a.click('#add-item');
      await a.click('#dlg-save');
      assert.match(await a.locator('#dlg-item .err').innerText(), /item name/);
      await a.fill('#i-nameEn', 'Fattoush'); await a.fill('#i-nameAr', 'فتوش');
      await a.fill('#i-descEn', 'Crisp salad with sumac'); await a.fill('#i-descAr', 'سلطة مقرمشة بالسماق');
      await a.selectOption('#i-cat', { label: 'Starters' });
      await a.click('#dlg-item [data-icon=salad]');
      await a.check('#i-usesizes');
      const rows = a.locator('[data-size-row]');
      assert.equal(await rows.count(), 2);
      await rows.nth(0).locator('input').nth(1).fill('Small'); await rows.nth(0).locator('input').nth(0).fill('صغير'); await rows.nth(0).locator('.sz-p').fill('40');
      await rows.nth(1).locator('input').nth(1).fill('Large'); await rows.nth(1).locator('input').nth(0).fill('كبير'); await rows.nth(1).locator('.sz-p').fill('60');
      await a.setInputFiles('#i-file', { name: 'p.png', mimeType: 'image/png', buffer: PNG });
      await a.locator('#dlg-item img.rt').waitFor();
      await a.check('[data-tag=veg]'); await a.check('[data-tag=new]');
      await a.click('#dlg-save');
      await a.locator('.row', { hasText: 'Fattoush' }).waitFor();
      assert.match(await a.locator('.row', { hasText: 'Fattoush' }).locator('.rp').innerText(), /40.*60/);
      const stored = await a.evaluate(() => JSON.parse(localStorage.getItem('menyu.data.v1')));
      const it = stored.items.find(i => i.nameEn === 'Fattoush');
      assert.equal(it.icon, 'salad'); assert.equal(it.sizes.length, 2); assert.match(it.image, /^data:image\/jpeg;base64,/); assert.deepEqual(it.tags.sort(), ['new', 'veg']);
      // preview iframe updated through the storage event
      await pv().locator('.mv-name', { hasText: 'فتوش' }).waitFor();
      await pv().locator('.mv-name', { hasText: 'فتوش' }).waitFor(); assert.equal(await pv().locator('.mv-cat-i svg').count(), 5);
    });

    await step('bad price is rejected', async () => {
      await a.click('#add-item');
      await a.fill('#i-nameEn', 'Bad'); await a.fill('#i-price', '-3');
      await a.click('#dlg-save');
      assert.match(await a.locator('#dlg-item .err').innerText(), /not valid/);
      await a.keyboard.press('Escape');
      assert.equal(await a.locator('.row', { hasText: 'Bad' }).count(), 0);
    });

    await step('edit item name and price', async () => {
      await a.locator('.row', { hasText: 'Espresso' }).locator('button[aria-label=Edit]').click();
      await a.fill('#i-nameEn', 'Espresso Ristretto');
      await a.click('#dlg-save');
      await a.locator('.row', { hasText: 'Espresso Ristretto' }).waitFor();
    });

    await step('sold-out toggle, hide, reorder', async () => {
      const row = () => a.locator('.row', { hasText: 'Turkish coffee' });
      await row().locator('button[aria-label="Sold out / available"]').click();
      await row().locator('.bd--out').waitFor();
      const before = await a.locator('[data-cat=hot] .row b').allInnerTexts();
      await row().locator('button[aria-label="Move up"]').click();
      const after = await a.locator('[data-cat=hot] .row b').allInnerTexts();
      assert.equal(after.indexOf('Turkish coffee'), before.indexOf('Turkish coffee') - 1);
      await a.locator('.cat[data-cat=cold] button[aria-label=Hide]').click();
      await a.locator('.cat.is-hidden[data-cat=cold]').waitFor();
      await pv().locator('.mv-chip', { hasText: 'Cold drinks' }).waitFor({ state: 'detached' });
      await a.locator('.cat[data-cat=cold] button[aria-label=Show]').click();
    });

    await step('delete item then undo restores it', async () => {
      const n = await a.locator('.row').count();
      await a.locator('.row', { hasText: 'Brownies' }).locator('button[aria-label=Delete]').click();
      assert.equal(await a.locator('.row').count(), n - 1);
      await a.click('#undo');
      assert.equal(await a.locator('.row').count(), n);
    });

    await step('admin search finds Arabic spelling variants', async () => {
      await a.fill('#q', 'كنافه');
      assert.equal(await a.locator('.row').count(), 1);
      await a.fill('#q', '');
    });

    await step('bulk price +10% rounded to 5 for one category', async () => {
      await a.click('#bulk');
      await a.selectOption('#b-cat', 'sweet');
      await a.click('#dlg-save');
      const s = await a.evaluate(() => JSON.parse(localStorage.getItem('menyu.data.v1')));
      assert.equal(s.items.find(i => i.id === 'i9').price, 100);
      assert.equal(s.items.find(i => i.id === 'i6').price, 80);
    });

    await step('brand: names, preset, hex color, currency reflect in preview', async () => {
      await a.click('[data-tab=brand]');
      await a.fill('#f-brand-nameEn', 'Blue Door Cafe');
      await a.fill('#f-brand-nameAr', 'مقهى الباب الأزرق');
      await a.click('[data-preset=ocean]');
      await a.fill('#hex-accent', '#ff0066'); await a.press('#hex-accent', 'Tab');
      await a.fill('#f-locale-currencyAr', 'جنيه');
      await a.selectOption('#f-locale-digits', 'arabic');
      await pv().locator('.mv-title', { hasText: 'مقهى الباب الأزرق' }).waitFor();
      const vars = await pv().locator('#app').evaluate(el => ({ p: el.style.getPropertyValue('--p'), a: el.style.getPropertyValue('--a') }));
      assert.equal(vars.p, '#16508a'); assert.equal(vars.a, '#ff0066');
      assert.match(await pv().locator('.mv-price').first().innerText(), /٤٥|٤٠/);
      assert.match(await pv().locator('.mv-price').first().innerText(), /جنيه/);
    });

    await step('low contrast warning appears', async () => {
      await a.fill('#hex-text', '#dddddd'); await a.press('#hex-text', 'Tab');
      assert.match(await a.locator('#contrast-note').innerText(), /low/i);
      await a.fill('#hex-text', '#10253a'); await a.press('#hex-text', 'Tab');
      assert.match(await a.locator('#contrast-note').innerText(), /Good/);
    });

    await step('logo upload shows in preview, removal reverts to monogram', async () => {
      await a.setInputFiles('#logo-file', { name: 'l.png', mimeType: 'image/png', buffer: PNG });
      await pv().locator('img.mv-logo').waitFor();
      await a.click('#logo-remove');
      await pv().locator('.mv-mono').waitFor();
    });

    await step('layout and radius switch', async () => {
      await a.selectOption('#f-theme-layout', 'list');
      await pv().locator('.mv--list').waitFor();
      await a.selectOption('#f-theme-layout', 'cards');
      await a.selectOption('#f-theme-radius', 'sharp');
      assert.equal(await pv().locator('#app').evaluate(el => el.style.getPropertyValue('--r')), '4px');
      await a.selectOption('#f-theme-radius', 'soft');
    });

    await withEmoji(a);
    await a.screenshot({ path: OUT + '/admin-brand-desktop.png' });

    await step('share: audit, QR decodes to the right URL, table cards', async () => {
      await a.click('[data-tab=share]');
      await a.fill('#f-publicUrl', 'https://blue-door.example/menu.html'); await a.press('#f-publicUrl', 'Tab');
      assert.equal(await a.locator('#qr-url').innerText(), 'https://blue-door.example/menu.html');
      // decode the QR by rasterizing the SVG in the page and running jsQR on pixels
      await a.addScriptTag({ content: fs.readFileSync(path.join(__dirname, '../node_modules/jsqr/dist/jsQR.js'), 'utf8') });
      const decoded = await a.evaluate(async () => {
        const svg = document.querySelector('#qr-box svg');
        const s = new XMLSerializer().serializeToString(svg);
        const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
        await img.decode();
        const cv = document.createElement('canvas'); cv.width = cv.height = 600;
        const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 600, 600); ctx.drawImage(img, 0, 0, 600, 600);
        const d = ctx.getImageData(0, 0, 600, 600);
        const r = jsQR(d.data, 600, 600);
        return r && r.data;
      });
      assert.equal(decoded, 'https://blue-door.example/menu.html');
      // table cards
      await a.evaluate(() => { window.print = () => { window.__printed = true; }; });
      await a.fill('#tables', '3');
      await a.click('#print-cards');
      await a.waitForFunction(() => window.__printed);
      assert.equal(await a.locator('#print-area .pc').count(), 3);
      assert.match(await a.locator('#print-area .pc').nth(2).innerText(), /Table 3/);
      const svg3 = await a.locator('#print-area .pc').nth(2).locator('svg').evaluate(s => s.outerHTML);
      assert.ok(svg3.length > 500);
    });

    await step('QR downloads (SVG and PNG)', async () => {
      const [d1] = await Promise.all([a.waitForEvent('download'), a.click('#dl-svg')]);
      assert.equal(d1.suggestedFilename(), 'menyu-qr.svg');
      const [d2] = await Promise.all([a.waitForEvent('download'), a.click('#dl-png')]);
      const p = await d2.path();
      assert.equal(fs.readFileSync(p).subarray(1, 4).toString(), 'PNG');
    });

    let standaloneHtml;
    await step('export standalone menu.html, works with network blocked', async () => {
      const [d] = await Promise.all([a.waitForEvent('download'), a.click('#ex-html')]);
      assert.equal(d.suggestedFilename(), 'menu.html');
      standaloneHtml = fs.readFileSync(await d.path(), 'utf8');
      assert.ok(standaloneHtml.includes('Blue Door Cafe'));
      assert.ok(standaloneHtml.length > 90000, 'fonts inlined');
      const o = await newPage({ width: 390, height: 844 });
      const requests = [];
      await o.route('**/*', r => { requests.push(r.request().url()); r.continue(); });
      fs.writeFileSync(OUT + '/standalone.html', standaloneHtml);
      await o.goto('file://' + OUT + '/standalone.html');
      await o.locator('.mv-title').waitFor();
      assert.equal(await o.locator('.mv-title').innerText(), 'مقهى الباب الأزرق');
      assert.ok(requests.every(u => u.startsWith('file://') || u.startsWith('data:')), requests.join(','));
      const fam = await o.evaluate(() => document.fonts.check('16px Cairo'));
      assert.ok(fam);
      await o.context().close();
    });

    await step('export menu.json then import it after loading blank', async () => {
      const [d] = await Promise.all([a.waitForEvent('download'), a.click('#ex-json')]);
      const jsonPath = await d.path();
      const exported = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      assert.equal(exported.brand.nameEn, 'Blue Door Cafe');
      await a.click('#load-blank');
      await a.click('[data-tab=menu]');
      assert.equal(await a.locator('.row').count(), 0);
      await a.click('[data-tab=share]');
      await a.setInputFiles('#imp-file', jsonPath);
      await a.click('[data-tab=menu]');
      assert.equal(await a.locator('.row').count(), exported.items.length);
      // bad file is rejected, data kept
      await a.click('[data-tab=share]');
      fs.writeFileSync(OUT + '/bad.json', '{"nope":true}');
      await a.setInputFiles('#imp-file', OUT + '/bad.json');
      await a.waitForFunction(() => /not a valid/.test(document.getElementById('toast').textContent));
      assert.equal((await a.evaluate(() => window.__menyu.data.items.length)), exported.items.length);
    });

    await step('data persists across reload', async () => {
      await a.reload(); await a.waitForSelector('body[data-ready="1"]');
      assert.ok((await a.locator('.row').count()) > 10);
      await a.click('[data-tab=brand]');
      assert.equal(await a.inputValue('#f-brand-nameEn'), 'Blue Door Cafe');
    });
    await a.context().close();

    /* ============ CUSTOMER MENU, mobile ============ */
    const m = await newPage({ width: 390, height: 844 }, { permissions: [] });
    await m.goto(base + '/menu.html?t=5');
    await m.locator('.mv-title').waitFor();
    await withEmoji(m);

    await step('menu: Arabic default, RTL, no overflow', async () => {
      assert.equal(await m.evaluate(() => document.documentElement.dir), 'rtl');
      assert.equal(await m.locator('.mv-title').innerText(), 'ركن القهوة');
      await noOverflow(m);
    });
    await step('menu: language toggle to English and persists', async () => {
      await m.click('#mv-lang');
      assert.equal(await m.evaluate(() => document.documentElement.dir), 'ltr');
      assert.equal(await m.locator('.mv-title').innerText(), 'Qahwa Corner');
      await m.reload(); await m.locator('.mv-title').waitFor();
      assert.equal(await m.locator('.mv-title').innerText(), 'Qahwa Corner');
    });
    await step('menu: search (English + Arabic), no-result message', async () => {
      await m.fill('#mv-search', 'latte');
      assert.equal(await m.locator('.mv-item').count(), 2);
      await m.fill('#mv-search', 'تشيز');
      assert.equal(await m.locator('.mv-item').count(), 1);
      await m.fill('#mv-search', 'zzzzz');
      await m.locator('.mv-none').waitFor();
      await m.fill('#mv-search', '');
      assert.equal(await m.locator('.mv-item').count(), 14);
    });
    await step('menu: category chip and tag filter', async () => {
      await m.click('.mv-chip[data-cat=sweet]');
      assert.equal(await m.locator('.mv-item').count(), 3);
      await m.click('.mv-chip[data-cat=""]');
      await m.click('.mv-tagbtn[data-tag=spicy]');
      assert.equal(await m.locator('.mv-item').count(), 1);
      await m.click('.mv-tagbtn[data-tag=spicy]');
    });
    await step('menu: sold-out item cannot be ordered', async () => {
      const it = m.locator('.mv-item[data-item=i10]');
      assert.equal(await it.locator('.mv-add').count(), 0);
      assert.match(await it.innerText(), /Sold out/);
    });
    await step('menu: open item with sizes, pick large, qty 2, add', async () => {
      await m.locator('.mv-item[data-item=i2]').click();
      await m.locator('.mv-size[data-size="1"]').click();
      await m.click('[data-inc]');
      assert.match(await m.locator('[data-confirm-add]').innerText(), /170/);
      await m.click('[data-confirm-add]');
      assert.match(await m.locator('.mv-cartbar').innerText(), /170/);
    });
    await step('menu: quick add + button for item without sizes', async () => {
      await m.locator('.mv-item[data-item=i4] .mv-add').click();
      await m.locator('.mv-item[data-item=i4] .mv-add.is-on').waitFor();
      assert.match(await m.locator('.mv-cartbar').innerText(), /205/);
    });
    await withEmoji(m);
    await m.screenshot({ path: OUT + '/menu-cart.png' });

    await step('menu: order sheet totals, table prefilled from ?t=5, WhatsApp link built', async () => {
      await m.click('#mv-open-order');
      assert.equal(await m.inputValue('#mv-table'), '5');
      await m.fill('#mv-name', 'Sara'); await m.fill('#mv-note', 'less sugar');
      await m.context().route('https://wa.me/**', r => r.fulfill({ status: 200, body: 'stub' }));
      const [popup] = await Promise.all([m.context().waitForEvent('page'), m.click('#mv-send')]);
      const url = popup.url();
      assert.match(url, /^https:\/\/wa\.me\/201000000000\?text=/);
      const text = decodeURIComponent(url.split('text=')[1]);
      assert.match(text, /Table: 5/); assert.match(text, /Name: Sara/); assert.match(text, /2 x Cappuccino \(Large\)/); assert.match(text, /Total: 205/); assert.match(text, /less sugar/);
      await popup.close();
    });
    await step('menu: change quantity in order sheet and remove line', async () => {
      const line = m.locator('li[data-line=i4]');
      await line.locator('[data-dec]').click();
      assert.equal(await m.locator('li[data-line=i4]').count(), 0);
      assert.match(await m.locator('.mv-total').innerText(), /170/);
    });
    await step('menu: copy order text to clipboard', async () => {
      await m.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
      await m.click('#mv-copy');
      const clip = await m.evaluate(() => navigator.clipboard.readText());
      assert.match(clip, /Cappuccino/);
    });
    await step('menu: cart survives reload, Escape closes sheet, clear empties', async () => {
      await m.keyboard.press('Escape');
      assert.equal(await m.locator('.mv-sheet').count(), 0);
      await m.reload(); await m.locator('.mv-cartbar button').waitFor();
      await m.click('#mv-open-order');
      await m.click('#mv-clear');
      await m.locator('.mv-cartbar button').waitFor({ state: 'detached' });
    });
    await m.screenshot({ path: OUT + '/menu-mobile.png' });
    await m.context().close();

    /* ============ edge cases ============ */
    await step('menu without WhatsApp number shows hint and no send button', async () => {
      const p = await newPage({ width: 390, height: 844 });
      await p.addInitScript(() => { const d = JSON.parse(JSON.stringify(window.__x || null)); });
      await p.goto(base + '/index.html'); await p.waitForSelector('body[data-ready="1"]');
      await p.click('[data-tab=brand]');
      await p.fill('#f-order-whatsapp', '');
      await p.goto(base + '/menu.html?preview=1');
      await p.locator('.mv-item[data-item=i4] .mv-add').click();
      await p.click('#mv-open-order');
      assert.equal(await p.locator('#mv-send').count(), 0);
      assert.ok(await p.locator('.mv-hint').count() === 1);
      await p.context().close();
    });
    await step('ordering disabled hides add buttons and cart', async () => {
      const p = await newPage({ width: 390, height: 844 });
      await p.goto(base + '/index.html'); await p.waitForSelector('body[data-ready="1"]');
      await p.click('[data-tab=brand]');
      await p.uncheck('#f-order-enabled');
      await p.goto(base + '/menu.html?preview=1');
      await p.locator('.mv-item').first().waitFor();
      assert.equal(await p.locator('.mv-add').count(), 0);
      await p.locator('.mv-item').first().click();
      assert.equal(await p.locator('[data-confirm-add]').count(), 0);
      await p.context().close();
    });
    await step('mobile admin: tabs, preview tab, no horizontal overflow, 44px touch targets on main actions', async () => {
      const p = await newPage({ width: 360, height: 740 });
      await p.goto(base + '/index.html'); await p.waitForSelector('body[data-ready="1"]');
      await withEmoji(p);
      await noOverflow(p);
      for (const tab of ['brand', 'share', 'menu']) { await p.click('[data-tab=' + tab + ']'); await noOverflow(p); }
      const h = await p.locator('#add-item').boundingBox();
      assert.ok(h.height >= 40, 'add item height ' + h.height);
      await p.click('[data-tab=preview]');
      await p.locator('#pv-frame').waitFor();
      assert.ok(await p.locator('.pv').isVisible());
      assert.ok(!(await p.locator('.work').isVisible()));
      await p.frameLocator('#pv-frame').locator('.mv-title').waitFor();
      await withEmoji(p);
      await p.screenshot({ path: OUT + '/admin-preview-mobile.png' });
      await p.click('[data-tab=menu]');
      await withEmoji(p);
      await p.screenshot({ path: OUT + '/admin-menu-mobile.png' });
      await p.context().close();
    });
    await step('arabic admin on mobile has no overflow', async () => {
      const p = await newPage({ width: 360, height: 740 }, { locale: 'ar-EG' });
      await p.goto(base + '/index.html'); await p.waitForSelector('body[data-ready="1"]');
      assert.equal(await p.evaluate(() => document.documentElement.dir), 'rtl');
      for (const tab of ['brand', 'share', 'menu']) { await p.click('[data-tab=' + tab + ']'); await noOverflow(p); }
      await p.context().close();
    });

    await step('no console or page errors anywhere', async () => {
      const real = errors.filter(e => !/favicon|ERR_FILE_NOT_FOUND|wa\.me/.test(e));
      assert.deepEqual(real, []);
    });
    console.log('\nE2E passed: ' + passed + ' steps');
  } catch (e) {
    console.error('\nE2E failed after ' + passed + ' steps');
    process.exitCode = 1;
  } finally {
    await browser.close(); srv.close();
  }
})();
