const assert = require('node:assert/strict'), { serve, launch } = require('./cdp.js');
(async () => {
  const srv = await serve(8123); const b = await launch(); let fail = 0;
  const step = async (n, f) => { try { await f(); console.log('ok  ' + n); } catch (e) { fail++; console.log('FAIL ' + n + ' ' + e.message); } };
  try {
    const U = 'http://127.0.0.1:8123/';
    await b.goto(U);
    await step('arabic RTL demo menu with demo banner and byline', async () => {
      assert.equal(await b.eval('document.documentElement.dir'), 'rtl');
      const t = await b.text(); assert.match(t, /قائمة تجريبية/); assert.match(t, /من تطوير يوسف خميس/); assert.match(t, /قهوة تركي/);
    });
    await step('language toggle and search', async () => {
      await b.click('.top .btn'); assert.equal(await b.eval('document.documentElement.dir'), 'ltr');
      await b.type('input[type=search]', 'lemon'); const t = await b.text(); assert.match(t, /Lemonade/); assert.ok(!/Basbousa/.test(t));
    });
    await step('sold out label shown', async () => { await b.type('input[type=search]', 'iced'); assert.match(await b.text(), /Sold out/); });
    await step('builder: add category and item, clear demo, draft preview', async () => {
      await b.eval("location.hash='#/edit'"); await b.waitFor("document.querySelector('#add-cat')");
      await b.click('#clear-demo'); await b.waitFor("!document.querySelector('#clear-demo')");
      await b.click('#add-item'); await b.type('#i-ne', 'Test tea'); await b.type('#i-na', 'شاي اختبار'); await b.type('#i-pr', '12.5'); await b.click('#i-save');
      await b.eval("location.hash='#/draft'"); await b.waitFor("document.body.innerText.includes('Test tea')");
      const t = await b.text(); assert.match(t, /Draft preview|معاينة المسودة/); assert.ok(!/Lemonade/.test(t));
    });
    await step('published menu unchanged by draft', async () => { await b.eval("location.hash='#/'"); await b.waitFor("document.body.innerText.includes('Lemonade')"); });
    await step('QR card renders svg and flags local links', async () => {
      await b.eval("location.hash='#/qr'"); await b.waitFor("document.querySelector('#qr-url')");
      await b.type('#qr-url', 'https://yousefkhames.github.io/menyu/'); assert.ok(await b.eval("!!document.querySelector('.qrbox svg path')"));
      await b.type('#qr-url', 'http://localhost:8123/'); assert.ok(await b.eval("!!document.querySelector('.banner[role=alert]')"));
    });
    await step('no script errors', async () => assert.deepEqual(b.logs, []));
    await step('offline shell cache registers', async () => { assert.ok(await b.eval("navigator.serviceWorker.getRegistration().then(r=>!!r)")); });
    await b.viewport(412, 860, true); await b.eval("location.hash='#/'"); await b.shot('/tmp/menyu-mobile.png');
  } finally { await b.close(); srv.close(); }
  process.exit(fail ? 1 : 0);
})();
