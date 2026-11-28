const test = require('node:test'), assert = require('node:assert/strict'), fs = require('fs'), path = require('path');
const C = require('../core.js'), Kit = require('../kit-base.js');
const data = new Function('window', fs.readFileSync(path.join(__dirname, '../menu-data.js'), 'utf8') + ';return window.MENU_DATA')({});
test('normalize drops bad tags, bad prices and unknown categories', () => {
  const m = C.normalize({ categories: [{ id: 'a', name: { ar: 'أ', en: 'A' } }], items: [{ id: 'x', cat: 'zzz', name: { en: 'X' }, price: -4, tags: ['vegan', 'hax'], img: 'javascript:1' }] });
  assert.equal(m.items[0].cat, 'a'); assert.equal(m.items[0].price, null); assert.deepEqual(m.items[0].tags, ['vegan']); assert.equal(m.items[0].img, '');
});
test('published sample is flagged demo and every item is demo', () => {
  const m = C.normalize(data); assert.equal(m.demo, true); assert.ok(m.items.length > 0); assert.ok(m.items.every((i) => i.demo));
});
test('search and category filter', () => {
  const m = C.normalize(data); assert.equal(C.visible(m, 'c1', '').length, 2); assert.equal(C.visible(m, '', 'lemon').length, 1); assert.equal(C.visible(m, '', 'قهوة').length, 1);
});
test('clear demo keeps real items only', () => {
  const m = C.normalize(data); m.items.push({ id: 'r', cat: 'c1', name: { ar: 'حقيقي', en: 'Real' }, desc: {}, price: 10, tags: [], soldOut: false, demo: false });
  const n = C.clearDemo(C.normalize(m)); assert.equal(n.demo, false); assert.equal(n.items.length, 1);
});
test('export data file round-trips and escapes script closers', () => {
  const m = C.normalize(data); m.shop.en = '</script>';
  const js = C.toDataJs(m); assert.ok(!js.includes('</script>'));
  const back = C.normalize(new Function('window', js + ';return window.MENU_DATA')({})); assert.equal(back.shop.en, '</script>'); assert.equal(back.items.length, m.items.length);
});
test('move reorders and stays in bounds', () => { assert.deepEqual(C.move([1, 2, 3], 0, 1), [2, 1, 3]); assert.deepEqual(C.move([1, 2, 3], 0, -1), [1, 2, 3]); });
test('stats count only recorded entries', () => { const s = C.stats(C.normalize(data)); assert.equal(s.items, 5); assert.equal(s.soldOut, 1); });
test('store blocks newer and corrupt data without overwriting', () => {
  const mem = { s: {}, getItem(k) { return this.s[k] || null; }, setItem(k, v) { this.s[k] = v; }, removeItem(k) { delete this.s[k]; } };
  mem.s.k = JSON.stringify({ v: 9, data: { draft: 1 } });
  const st = Kit.store('k', 1, { draft: null }, mem); assert.equal(st.blocked, 'newer'); st.data.draft = 5; assert.equal(st.save(), false); assert.equal(JSON.parse(mem.s.k).v, 9);
  st.reset(); st.data.draft = 5; assert.ok(st.save());
  mem.s.k = '{bad'; assert.equal(Kit.store('k', 1, {}, mem).blocked, 'corrupt');
});
test('import rejects other kits and newer files', () => {
  const st = Kit.store('menyu', 1, { draft: null }, { getItem() { return null; }, setItem() {} });
  assert.equal(st.importJSON('{"kit":"other","v":1,"data":{}}').error, 'kit'); assert.equal(st.importJSON('{"kit":"menyu","v":2,"data":{}}').error, 'newer'); assert.ok(st.importJSON('{"kit":"menyu","v":1,"data":{"draft":null}}').ok);
});
test('QR svg generated offline for Arabic and URL text', () => {
  global.qrcode = new Function('module', 'exports', fs.readFileSync(path.join(__dirname, '../assets/qrcode.js'), 'utf8') + ';return qrcode')({ exports: {} });
  const svg = Kit.qrSvg('https://yousefkhames.github.io/menyu/ قائمة'); assert.match(svg, /^<svg/); assert.ok(svg.length > 500);
});
