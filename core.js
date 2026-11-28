/* MIT · Copyright (c) 2026 Yousef Khames · menyu core: pure menu logic (browser and Node). */
(function (root) {
  'use strict';
  const TAGS = ['new', 'vegan', 'spicy', 'popular'];
  const str = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
  const bi = (o) => ({ ar: str(o && o.ar), en: str(o && o.en) });
  const price = (p) => { if (p === null || p === '' || p === undefined) return null; const n = Number(p); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };

  function normalize(m) {
    m = m && typeof m === 'object' ? m : {};
    const cats = (Array.isArray(m.categories) ? m.categories : []).map((c, i) => ({ id: str(c && c.id, 40) || 'c' + (i + 1), name: bi(c && c.name) }));
    const ids = new Set(cats.map((c) => c.id));
    const items = (Array.isArray(m.items) ? m.items : []).map((it, i) => ({
      id: str(it && it.id, 40) || 'i' + (i + 1), cat: ids.has(it && it.cat) ? it.cat : (cats[0] ? cats[0].id : ''),
      name: bi(it && it.name), desc: bi(it && it.desc), price: price(it && it.price),
      tags: (Array.isArray(it && it.tags) ? it.tags : []).filter((t) => TAGS.includes(t)),
      soldOut: !!(it && it.soldOut), demo: !!(it && it.demo),
      img: typeof (it && it.img) === 'string' && /^data:image\/(jpeg|png|webp);base64,[\w+/=]+$/.test(it.img) ? it.img : ''
    }));
    return { v: 1, demo: !!m.demo, shop: bi(m.shop), currency: str(m.currency, 12), categories: cats, items };
  }
  function visible(menu, cat, q) {
    const s = str(q).trim().toLowerCase();
    return menu.items.filter((it) => (!cat || it.cat === cat) &&
      (!s || [it.name.ar, it.name.en, it.desc.ar, it.desc.en].some((x) => x.toLowerCase().includes(s))));
  }
  function clearDemo(menu) {
    const items = menu.items.filter((i) => !i.demo);
    return Object.assign({}, menu, { demo: false, items });
  }
  function move(arr, i, d) { const j = i + d; if (j < 0 || j >= arr.length) return arr; const a = arr.slice(); [a[i], a[j]] = [a[j], a[i]]; return a; }
  function toDataJs(menu) {
    return '/* Published menu exported from the menyu builder. Replace menu-data.js with this file and commit. */\nwindow.MENU_DATA = ' + JSON.stringify(normalize(menu), null, 2).replace(/</g, '\\u003c') + ';\n';
  }
  function stats(menu) { return { categories: menu.categories.length, items: menu.items.length, soldOut: menu.items.filter((i) => i.soldOut).length, withoutPrice: menu.items.filter((i) => i.price === null).length }; }
  const api = { TAGS, normalize, visible, clearDemo, move, toDataJs, stats };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.MenuCore = api;
})(globalThis);
