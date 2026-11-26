const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/core.js');
const X = require('../js/export.js');

test('hex helpers normalize and reject bad colors', () => {
  assert.equal(C.normHex('#ABC', null), '#aabbcc');
  assert.equal(C.normHex('c8512b', null), '#c8512b');
  assert.equal(C.normHex('red', '#000000'), '#000000');
  assert.equal(C.normHex('#12345', 'x'), 'x');
});
test('readableOn picks white on dark and dark on light', () => {
  assert.equal(C.readableOn('#1f1f1f'), '#ffffff');
  assert.equal(C.readableOn('#fff8ee'), '#1b1612');
  assert.equal(C.readableOn('#e6b450'), '#1b1612');
  for (const p of C.PRESETS) assert.ok(C.contrast(p.primary, C.readableOn(p.primary)) >= 4.5, p.id + ' button text contrast');
});
test('all presets have readable body text', () => {
  for (const p of C.PRESETS) assert.ok(C.contrast(p.bg, p.text) >= 7, p.id);
});
test('contrast of black on white is 21', () => assert.ok(Math.abs(C.contrast('#000000', '#ffffff') - 21) < 0.01));

test('formatPrice: symbol position, decimals, Arabic digits', () => {
  const l = { currencyEn: 'EGP', currencyAr: 'ج.م', pos: 'after', decimals: 0, digits: 'latin' };
  assert.equal(C.formatPrice(45, l, 'en'), '45\u00a0EGP');
  assert.equal(C.formatPrice(45, l, 'ar'), '45\u00a0ج.م');
  assert.equal(C.formatPrice(45, Object.assign({}, l, { digits: 'arabic' }), 'ar'), '٤٥\u00a0ج.م');
  assert.equal(C.formatPrice(45, Object.assign({}, l, { digits: 'arabic' }), 'en'), '45\u00a0EGP');
  assert.equal(C.formatPrice(12.5, Object.assign({}, l, { decimals: 2 }), 'en'), '12.50\u00a0EGP');
  assert.equal(C.formatPrice(12, Object.assign({}, l, { decimals: 2 }), 'en'), '12\u00a0EGP');
  assert.equal(C.formatPrice(9, Object.assign({}, l, { pos: 'before', currencyEn: '$' }), 'en'), '$\u00a09');
  assert.equal(C.formatPrice('abc', l, 'en'), '0\u00a0EGP');
  assert.equal(C.formatPrice(5, Object.assign({}, l, { currencyEn: '', currencyAr: '' }), 'en'), '5');
});

test('Arabic search normalization', () => {
  assert.equal(C.normSearch('أَحمد'), C.normSearch('احمد'));
  assert.equal(C.normSearch('قهوة'), C.normSearch('قهوه'));
  assert.equal(C.normSearch('شاي بالنعناع'), 'شاي بالنعناع');
  assert.equal(C.normSearch('٢٥'), '25');
  assert.equal(C.normSearch('LATTE'), 'latte');
});

test('sample data is valid and survives normalize unchanged in shape', () => {
  const s = C.sampleData();
  const n = C.normalizeData(JSON.parse(JSON.stringify(s)));
  assert.equal(n.items.length, s.items.length);
  assert.equal(n.categories.length, 4);
  assert.deepEqual(n.theme, s.theme);
  assert.ok(C.audit(n).filter(i => i.level === 'warn').length === 0, JSON.stringify(C.audit(n)));
});

test('normalizeData rejects non-menus and cleans hostile input', () => {
  assert.throws(() => C.normalizeData(null));
  assert.throws(() => C.normalizeData([]));
  assert.throws(() => C.normalizeData({ hello: 1 }));
  const n = C.normalizeData({
    brand: { nameEn: '<img src=x onerror=alert(1)>', logo: 'javascript:alert(1)', instagram: '@a b!c' },
    theme: { primary: 'nope', radius: 'weird', layout: 'x' },
    locale: { decimals: 99, lang: 'fr', pos: 'x' },
    order: { whatsapp: 'abc 0100-123 <script>' },
    publicUrl: 'javascript:alert(1)',
    categories: [{ id: 'a', nameEn: 'A' }, { id: 'a', nameEn: 'dup' }, null, 'str'],
    items: [
      { id: 'x', cat: 'missing', nameEn: 'Tea', price: -5, tags: ['veg', 'evil', 'veg'], image: 'http://evil/x.png', sizes: [{ price: 'NaN' }, null] },
      { id: 'x', cat: 'a', nameEn: 'Same id', price: 'abc' },
      42
    ]
  });
  assert.equal(n.brand.logo, '');
  assert.equal(n.brand.instagram, 'abc');
  assert.equal(n.theme.primary, '#c24d28');
  assert.equal(n.theme.radius, 'soft');
  assert.equal(n.locale.decimals, 2);
  assert.equal(n.locale.lang, 'ar');
  assert.equal(n.order.whatsapp.includes('<'), false);
  assert.equal(n.publicUrl, '');
  assert.equal(n.categories.length, 2);
  assert.notEqual(n.categories[0].id, n.categories[1].id);
  assert.equal(n.items.length, 2);
  assert.notEqual(n.items[0].id, n.items[1].id);
  assert.equal(n.items[0].price, 0);
  assert.deepEqual(n.items[0].tags, ['veg']);
  assert.equal(n.items[0].image, '');
  assert.equal(n.items[0].cat, n.categories[0].id);
  assert.equal(n.items[0].sizes.length, 1);
  assert.equal(n.items[1].price, 0);
});
test('items with no categories get a fallback category', () => {
  const n = C.normalizeData({ items: [{ nameEn: 'Solo', price: 3 }] });
  assert.equal(n.categories.length, 1);
  assert.equal(n.items[0].cat, n.categories[0].id);
});
test('safeImage allows only base64 images', () => {
  assert.equal(C.safeImage('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA');
  assert.equal(C.safeImage('data:text/html;base64,AAAA'), '');
  assert.equal(C.safeImage('https://x/y.png'), '');
});

test('filterItems: category, search (Arabic and English), tags, hidden', () => {
  const d = C.sampleData();
  assert.equal(C.filterItems(d, { cat: 'hot' }).length, 5);
  assert.deepEqual(C.filterItems(d, { q: 'كابتشينو' }).map(i => i.id), ['i2']);
  assert.deepEqual(C.filterItems(d, { q: 'cheesecake' }).map(i => i.id), ['i11']);
  assert.deepEqual(C.filterItems(d, { q: 'تشيز' }).map(i => i.id), ['i11']);
  assert.ok(C.filterItems(d, { tags: ['veg'] }).every(i => i.tags.includes('veg')));
  d.items[0].hidden = true;
  assert.ok(!C.filterItems(d, {}).some(i => i.id === 'i1'));
  assert.ok(C.filterItems(d, { includeHidden: true }).some(i => i.id === 'i1'));
  d.categories[0].hidden = true;
  assert.equal(C.filterItems(d, { cat: 'hot' }).length, 0);
});

test('reordering', () => {
  const arr = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(C.moveBy(arr, 'a', -1), false);
  assert.equal(C.moveBy(arr, 'a', 1), true);
  assert.deepEqual(arr.map(x => x.id), ['b', 'a', 'c']);
  const items = [{ id: '1', cat: 'x' }, { id: '2', cat: 'y' }, { id: '3', cat: 'x' }];
  assert.equal(C.moveItemInCategory(items, '1', 1), true);
  assert.deepEqual(items.map(x => x.id), ['3', '2', '1']);
  assert.equal(C.moveItemInCategory(items, '1', 1), false);
});

test('cart: add, remove, sizes, sold out, totals', () => {
  const d = C.sampleData();
  let cart = [];
  C.cartAdd(cart, 'i1', 0, 2);            // espresso single x2 = 90
  C.cartAdd(cart, 'i1', 1, 1);            // espresso double = 65
  C.cartAdd(cart, 'i4', -1, 1);           // mint tea = 35
  assert.equal(C.cartTotal(d, cart), 190);
  C.cartAdd(cart, 'i1', 0, -1);
  assert.equal(C.cartTotal(d, cart), 145);
  C.cartAdd(cart, 'i1', 0, -5);
  assert.equal(cart.length, 2);
  C.cartAdd(cart, 'i10', -1, 1);          // brownies are sold out in sample
  assert.equal(C.cartLines(d, cart).length, 2);
  assert.equal(C.cartTotal(d, cart), 100);
  C.cartAdd(cart, 'i4', -1, 500);
  assert.equal(cart.find(l => l.id === 'i4').qty, 99);
  assert.equal(C.cartLines(d, [{ id: 'ghost', v: -1, qty: 1 }]).length, 0);
});

test('order message in both languages', () => {
  const d = C.sampleData();
  const cart = [{ id: 'i2', v: 1, qty: 2 }, { id: 'i4', v: -1, qty: 1 }];
  const en = C.buildOrderMessage(d, cart, 'en', { table: '7', name: 'Sara', note: 'no sugar' });
  assert.match(en, /New order from Qahwa Corner/);
  assert.match(en, /Table: 7/);
  assert.match(en, /2 x Cappuccino \(Large\) - 170\u00a0EGP/);
  assert.match(en, /Total: 205\u00a0EGP/);
  assert.match(en, /Notes: no sugar/);
  const ar = C.buildOrderMessage(d, cart, 'ar', {});
  assert.match(ar, /طلب جديد من ركن القهوة/);
  assert.match(ar, /الإجمالي: 205/);
  assert.doesNotMatch(ar, /Table/);
});

test('WhatsApp number handling', () => {
  assert.equal(C.waDigits('01012345678', '20'), '201012345678');
  assert.equal(C.waDigits('+20 101 234 5678', '20'), '201012345678');
  assert.equal(C.waDigits('0020 101 234 5678', '20'), '201012345678');
  assert.equal(C.waDigits('201012345678', '20'), '201012345678');
  assert.equal(C.waDigits('', '20'), '');
  const l = C.whatsappLink('01012345678', '20', 'مرحبا & hi');
  assert.equal(l, 'https://wa.me/201012345678?text=' + encodeURIComponent('مرحبا & hi'));
  assert.equal(C.whatsappLink('123', '20', 'x'), '');
});

test('audit flags real problems', () => {
  const d = C.emptyData();
  d.order.enabled = true;
  let codes = C.audit(d).map(i => i.code);
  assert.ok(codes.includes('noItems') && codes.includes('noWhatsapp') && codes.includes('noLogo') && codes.includes('noPublicUrl'));
  const s = C.sampleData();
  s.items[0].nameAr = ''; s.items[1].price = 0; s.items[1].sizes = [];
  s.theme.text = '#dddddd';
  codes = C.audit(s).map(i => i.code);
  assert.ok(codes.includes('missingAr') && codes.includes('zeroPrice') && codes.includes('lowContrast'));
  s.categories.push({ id: 'e', nameEn: 'Empty', nameAr: '', icon: '', hidden: false });
  assert.equal(C.audit(s).find(i => i.code === 'emptyCats').n, 1);
});

test('bulk price change rounds to step, scoped by category, never negative', () => {
  const d = C.sampleData();
  const n = C.bulkPrice(d, 10, 5, 'hot');
  assert.equal(n, 5);
  assert.equal(d.items.find(i => i.id === 'i4').price, 40);   // 35 -> 38.5 -> 40
  assert.deepEqual(d.items.find(i => i.id === 'i1').sizes.map(s => s.price), [50, 70]);
  assert.equal(d.items.find(i => i.id === 'i6').price, 80);   // other category untouched
  C.bulkPrice(d, -99, 1);
  assert.ok(d.items.every(i => i.price >= 0));
});

test('stats and menuUrl', () => {
  const d = C.sampleData();
  const s = C.stats(d);
  assert.equal(s.items, 14); assert.equal(s.soldOut, 1); assert.equal(s.categories, 4);
  const loc = { origin: 'https://a.github.io', pathname: '/menyu/index.html' };
  assert.equal(C.menuUrl(d, loc, ''), 'https://a.github.io/menyu/menu.html');
  assert.equal(C.menuUrl(d, loc, '5'), 'https://a.github.io/menyu/menu.html?t=5');
  d.publicUrl = 'https://shop.example/menu?x=1';
  assert.equal(C.menuUrl(d, loc, '5'), 'https://shop.example/menu?x=1&t=5');
});

test('QR svg: valid, sized by module count, colors applied', () => {
  const svg = X.qrSvg('https://yousefkhames.github.io/menyu/menu.html?t=12', { fg: '#5b3a29', bg: '#ffffff' });
  assert.match(svg, /^<svg /);
  assert.match(svg, /fill="#5b3a29"/);
  const m = X.qrMatrix('hello');
  assert.equal(m.length, m[0].length);
  assert.equal(m.length % 4, 1);           // QR sizes are 21 + 4k
  assert.ok(m[0][0] && m[0][6] && m[6][0]); // finder pattern corners
  assert.match(X.qrSvg('x', { fg: 'zzzz', bg: 'none' }), /fill="#000000"/);
  assert.ok(!/<rect/.test(X.qrSvg('x', { bg: 'none' })));
});

test('standalone export embeds data safely and contains no external requests', () => {
  const d = C.sampleData();
  d.brand.nameEn = '</script><script>alert(1)</script>';
  const html = X.assembleStandalone({ css: 'body{}', core: 'var a=1;', viewer: 'var b=2;', boot: 'var c=3;' }, d);
  assert.ok(!html.includes('</script><script>alert(1)'));
  assert.match(html, /window\.MENYU_DATA=/);
  assert.ok(!/<link[^>]+href=/.test(html));
  assert.ok(!/<script[^>]+src=/.test(html));
  const json = html.match(/window\.MENYU_DATA=(.*?);<\/script>/s)[1];
  assert.equal(JSON.parse(json).brand.nameEn, d.brand.nameEn);
});
