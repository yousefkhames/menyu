/* MIT · Copyright (c) 2026 Yousef Khames · menyu UI */
(function () {
  'use strict';
  const { el, t, pick } = Kit, C = MenuCore;
  const published = C.normalize(window.MENU_DATA);
  const store = Kit.store('menyu', 1, { draft: null });
  const app = document.getElementById('app');
  let cat = '', q = '';
  const draft = () => store.data.draft ? C.normalize(store.data.draft) : null;
  const working = () => draft() || published;
  const saveDraft = (m) => { store.data.draft = C.normalize(m); store.save(); };
  const route = () => (location.hash.replace(/^#\/?/, '') || 'menu');

  function header(r) {
    const tab = (id, label) => el('a', { class: 'tab' + (r === id ? ' on' : ''), href: '#/' + (id === 'menu' ? '' : id), 'aria-current': r === id ? 'page' : null }, label);
    return el('header', { class: 'top noprint' },
      el('div', { class: 'brand' }, el('img', { src: 'assets/favicon.svg', width: 28, height: 28, alt: '' }), el('strong', { text: Kit.shopName(pick(published.shop) || t('title')) })),
      el('nav', { class: 'tabs', 'aria-label': 'Main' }, tab('menu', t('menu')), tab('edit', t('edit')), tab('qr', t('qr'))),
      el('button', { class: 'btn small', onclick: () => { Kit.setLang(Kit.lang === 'ar' ? 'en' : 'ar', 'menyu'); render(); } }, t('lang')));
  }

  function itemCard(it, m) {
    const price = it.price === null ? t('noPrice') : Kit.money(it.price, m.currency);
    return el('article', { class: 'item' + (it.soldOut ? ' out' : '') },
      it.img ? el('img', { class: 'ph', src: it.img, alt: '', loading: 'lazy' }) : null,
      el('div', { class: 'body' },
        el('div', { class: 'row' }, el('h3', { class: 'grow', text: pick(it.name) }), el('span', { class: 'price', text: price })),
        pick(it.desc) ? el('p', { class: 'desc', text: pick(it.desc) }) : null,
        el('div', { class: 'row' },
          it.soldOut ? el('span', { class: 'badge', text: t('soldOut') }) : null,
          it.demo ? el('span', { class: 'badge demo', text: t('demoTag') }) : null,
          it.tags.map((g) => el('span', { class: 'badge', text: t('tag_' + g) })))));
  }

  function viewMenu(useDraft) {
    const m = useDraft ? working() : published;
    const root = el('main', { id: 'main-content', tabindex: '-1' });
    if (m.demo) root.append(el('div', { class: 'banner', role: 'note', text: t('demoBanner') }));
    if (useDraft) root.append(el('div', { class: 'banner', role: 'note', text: t('draftBanner') }));
    root.append(el('h1', { text: pick(m.shop) || t('title') }));
    const inp = el('input', { type: 'search', 'aria-label': t('search'), placeholder: t('search'), value: q });
    const list = el('div', { class: 'list' });
    const chips = el('div', { class: 'chips', role: 'group' });
    const draw = () => {
      chips.replaceChildren(el('button', { class: 'chip' + (!cat ? ' on' : ''), 'aria-pressed': String(!cat), onclick: () => { cat = ''; draw(); } }, t('all')),
        ...m.categories.map((c) => el('button', { class: 'chip' + (cat === c.id ? ' on' : ''), 'aria-pressed': String(cat === c.id), onclick: () => { cat = c.id; draw(); } }, pick(c.name))));
      const items = C.visible(m, cat, q); list.replaceChildren();
      if (!items.length) list.append(el('p', { text: t('noItems') }));
      m.categories.forEach((c) => {
        const here = items.filter((i) => i.cat === c.id); if (!here.length) return;
        list.append(el('h2', { text: pick(c.name) }), ...here.map((i) => itemCard(i, m)));
      });
    };
    inp.addEventListener('input', () => { q = inp.value; draw(); });
    root.append(inp, chips, list); draw();
    return root;
  }

  /* ---------- builder ---------- */
  function field(label, input) { return el('label', { class: 'field' }, el('span', { text: label }), input); }
  function viewEdit() {
    const root = el('main', { id: 'main-content', tabindex: '-1' });
    if (store.blocked) root.append(el('div', { class: 'banner', role: 'alert', text: t('blocked') }),
      el('button', { class: 'btn danger', onclick: () => { if (confirm(t('confirmReset'))) { store.reset(); render(); } } }, t('resetAll')));
    const m = working();
    const commit = (next, quiet) => { saveDraft(next); if (!quiet) Kit.toast(t('saved')); render(); };
    root.append(el('div', { class: 'banner', role: 'note', text: t('publishHelp') }));
    if (m.demo) root.append(el('div', { class: 'banner', role: 'note', text: t('demoMenuF') }));
    const s = C.stats(m);
    root.append(el('p', { text: t('statsLine', { c: s.categories, i: s.items, s: s.soldOut, p: s.withoutPrice }) }));

    const sa = el('input', { value: m.shop.ar, id: 'f-shop-ar' }), se = el('input', { value: m.shop.en, id: 'f-shop-en' }), cu = el('input', { value: m.currency, id: 'f-cur' });
    const onShop = () => commit(Object.assign({}, m, { shop: { ar: sa.value, en: se.value }, currency: cu.value }), true);
    [sa, se, cu].forEach((i) => i.addEventListener('change', onShop));
    root.append(el('section', { class: 'card' }, field(t('shopAr'), sa), field(t('shopEn'), se), field(t('currency'), cu)));

    const catBox = el('section', { class: 'card' }, el('h2', { text: t('categories') }));
    m.categories.forEach((c, i) => catBox.append(el('div', { class: 'row', 'data-cat': c.id },
      el('input', { class: 'grow', 'aria-label': t('catAr'), value: c.name.ar, onchange: (e) => { const cs = m.categories.map((x) => x.id === c.id ? { id: x.id, name: { ar: e.target.value, en: x.name.en } } : x); commit(Object.assign({}, m, { categories: cs }), true); } }),
      el('input', { class: 'grow', 'aria-label': t('catEn'), value: c.name.en, onchange: (e) => { const cs = m.categories.map((x) => x.id === c.id ? { id: x.id, name: { ar: x.name.ar, en: e.target.value } } : x); commit(Object.assign({}, m, { categories: cs }), true); } }),
      el('button', { class: 'btn small', 'aria-label': t('up'), disabled: i === 0, onclick: () => commit(Object.assign({}, m, { categories: C.move(m.categories, i, -1) }), true) }, '↑'),
      el('button', { class: 'btn small', 'aria-label': t('down'), disabled: i === m.categories.length - 1, onclick: () => commit(Object.assign({}, m, { categories: C.move(m.categories, i, 1) }), true) }, '↓'),
      el('button', { class: 'btn small danger', onclick: () => { if (confirm(t('confirmDel'))) commit(Object.assign({}, m, { categories: m.categories.filter((x) => x.id !== c.id), items: m.items.filter((x) => x.cat !== c.id) })); } }, t('del')))));
    catBox.append(el('button', { class: 'btn', id: 'add-cat', onclick: () => commit(Object.assign({}, m, { categories: m.categories.concat([{ id: Kit.uid('c'), name: { ar: 'قسم جديد', en: 'New category' } }]) })) }, t('addCat')));
    root.append(catBox);

    const itBox = el('section', { class: 'card' }, el('h2', { text: t('items') }));
    m.items.forEach((it) => itBox.append(el('div', { class: 'row line', 'data-item': it.id },
      el('span', { class: 'grow', text: pick(it.name) + (it.soldOut ? ' · ' + t('soldOut') : '') }),
      it.demo ? el('span', { class: 'badge demo', text: t('demoTag') }) : null,
      el('button', { class: 'btn small', onclick: () => itemForm(m, it) }, t('editItem')),
      el('button', { class: 'btn small danger', onclick: () => { if (confirm(t('confirmDel'))) commit(Object.assign({}, m, { items: m.items.filter((x) => x.id !== it.id) })); } }, t('del')))));
    itBox.append(el('button', { class: 'btn primary', id: 'add-item', disabled: !m.categories.length, onclick: () => itemForm(m, null) }, t('addItem')));
    root.append(itBox);

    const imp = el('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const r = store.importJSON(await Kit.readFile(f));
      if (!r.ok) return Kit.toast(r.error === 'newer' ? t('importNewer') : t('importFail'));
      if (!r.data.draft) return Kit.toast(t('importFail'));
      commit(r.data.draft, true); Kit.toast(t('imported'));
    } });
    root.append(el('section', { class: 'card row' },
      el('button', { class: 'btn primary', id: 'export-data', onclick: () => Kit.download('menu-data.js', C.toDataJs(m), 'text/javascript') }, t('exportData')),
      el('button', { class: 'btn', onclick: () => Kit.download('menyu-backup.json', JSON.stringify({ kit: 'menyu', kind: 'brand-kit', v: 1, exportedAt: new Date(Kit.now()).toISOString(), data: { draft: m } }, null, 2), 'application/json') }, t('exportJson')),
      el('button', { class: 'btn', onclick: () => Kit.download('menu.html', standalone(m), 'text/html') }, t('exportHtml')),
      el('button', { class: 'btn', onclick: () => imp.click() }, t('importJson')), imp,
      m.items.some((i) => i.demo) ? el('button', { class: 'btn', id: 'clear-demo', onclick: () => commit(C.clearDemo(m)) }, t('clearDemo')) : null,
      store.data.draft ? el('button', { class: 'btn danger', onclick: () => { if (confirm(t('confirmReset'))) { store.reset(); render(); } } }, t('resetAll')) : null));
    root.append(el('p', {}, el('a', { href: '#/draft', text: t('viewDraft') })));
    return root;
  }

  function itemForm(m, it) {
    const isNew = !it; it = it || { id: Kit.uid('i'), cat: m.categories[0].id, name: { ar: '', en: '' }, desc: { ar: '', en: '' }, price: null, tags: [], soldOut: false, demo: false, img: '' };
    let img = it.img || '';
    const f = { na: el('input', { id: 'i-na', value: it.name.ar }), ne: el('input', { id: 'i-ne', value: it.name.en }),
      da: el('textarea', { id: 'i-da', value: it.desc.ar }), de: el('textarea', { id: 'i-de', value: it.desc.en }),
      pr: el('input', { id: 'i-pr', inputmode: 'decimal', value: it.price === null ? '' : it.price }),
      ct: el('select', { id: 'i-ct' }, m.categories.map((c) => el('option', { value: c.id, selected: c.id === it.cat }, pick(c.name)))),
      so: el('input', { type: 'checkbox', id: 'i-so', checked: it.soldOut }) };
    const tagBox = el('div', { class: 'row' }, C.TAGS.map((g) => el('label', { class: 'badge' }, el('input', { type: 'checkbox', value: g, checked: it.tags.includes(g), style: 'width:auto;min-height:0;margin-inline-end:6px' }), t('tag_' + g))));
    const prev = el('div', {});
    const drawPrev = () => prev.replaceChildren(img ? el('img', { class: 'ph', src: img, alt: '' }) : '', img ? el('button', { class: 'btn small', type: 'button', onclick: () => { img = ''; drawPrev(); } }, t('removePhoto')) : '');
    drawPrev();
    const file = el('input', { type: 'file', accept: 'image/*', onchange: async (e) => { if (e.target.files[0]) { try { img = await Kit.resizeImage(e.target.files[0], 480, 0.7); drawPrev(); } catch (x) { Kit.toast(t('importFail')); } } } });
    const sheet = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('editItem') });
    const close = () => { sheet.remove(); };
    const save = () => {
      if (!f.na.value.trim() && !f.ne.value.trim()) return Kit.toast(t('needName'));
      const nu = { id: it.id, cat: f.ct.value, name: { ar: f.na.value, en: f.ne.value }, desc: { ar: f.da.value, en: f.de.value }, price: f.pr.value.trim() === '' ? null : Kit.num(f.pr.value, null),
        tags: [...tagBox.querySelectorAll('input:checked')].map((x) => x.value), soldOut: f.so.checked, demo: false, img };
      saveDraft(Object.assign({}, m, { items: isNew ? m.items.concat([nu]) : m.items.map((x) => x.id === it.id ? nu : x) }));
      close(); Kit.toast(t('saved')); render();
    };
    sheet.append(el('div', { class: 'panel' }, el('h2', { text: t('editItem') }),
      field(t('nameAr'), f.na), field(t('nameEn'), f.ne), field(t('descAr'), f.da), field(t('descEn'), f.de), field(t('priceF'), f.pr), field(t('category'), f.ct),
      el('div', { class: 'field' }, el('span', { text: t('tags') }), tagBox), field(t('photo'), file), prev,
      el('label', { class: 'row' }, f.so, el('span', { text: t('soldOutF') })),
      el('div', { class: 'row' }, el('button', { class: 'btn primary', id: 'i-save', onclick: save }, t('save')), el('button', { class: 'btn', onclick: close }, t('cancel')))));
    sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.body.append(sheet); f.na.focus();
  }

  /* ---------- single-file export ---------- */
  function standalone(m) {
    const data = JSON.stringify(C.normalize(m)).replace(/</g, '\\u003c');
    const css = 'body{font-family:system-ui,sans-serif;margin:0;padding:16px;max-width:640px;margin-inline:auto;background:#F8FAFC;color:#0B0B0F}.i{display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid #ccc;padding:8px 0}.o{opacity:.55}.d{border:1px dashed #0B0B0F;padding:8px;border-radius:8px}footer{text-align:center;font-size:.85rem;margin-top:24px}';
    const js = 'var M=' + data + ',L=/^en/i.test(navigator.language)?"en":"ar",b=document.body;document.documentElement.lang=L;document.documentElement.dir=L=="ar"?"rtl":"ltr";' +
      'function P(o){return o[L]||o.ar||o.en||""}function E(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}' +
      'var h="";if(M.demo)h+="<p class=d>"+(L=="ar"?"قائمة تجريبية: أصناف وأسعار وهمية":"Demo menu: fictional items and prices")+"</p>";h+="<h1>"+E(P(M.shop))+"</h1>";' +
      'M.categories.forEach(function(c){var it=M.items.filter(function(i){return i.cat==c.id});if(!it.length)return;h+="<h2>"+E(P(c.name))+"</h2>";it.forEach(function(i){h+="<div class=\\"i"+(i.soldOut?" o":"")+"\\"><span>"+E(P(i.name))+(i.soldOut?" ("+(L=="ar"?"نفد":"sold out")+")":"")+"<br><small>"+E(P(i.desc))+"</small></span><b>"+(i.price===null?"":E(i.price+" "+M.currency))+"</b></div>"})});' +
      'h+="<footer>By Yousef Khames · من تطوير يوسف خميس</footer>";b.innerHTML=h;';
    return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + Kit.esc(pick(m.shop) || 'menu') + '</title><style>' + css + '</style></head><body><noscript>JavaScript required</noscript><script>' + js + '<\/script></body></html>';
  }

  /* ---------- QR card ---------- */
  function viewQr() {
    const root = el('main', { id: 'main-content', tabindex: '-1' });
    let url = store.data.qrUrl || '';
    const inp = el('input', { id: 'qr-url', type: 'url', inputmode: 'url', placeholder: 'https://yousefkhames.github.io/menyu/', value: url, 'aria-label': t('qrUrl') });
    const out = el('div', { class: 'qrcard' });
    const draw = () => {
      out.replaceChildren(); const v = inp.value.trim(); if (!v) return;
      const local = /^https?:\/\/(localhost|127\.|192\.168\.)/.test(v) || !/^https?:\/\//.test(v);
      if (local) out.append(el('p', { class: 'banner noprint', role: 'alert', text: t('qrLocal') }));
      const box = el('div', { class: 'qrbox' }); box.innerHTML = Kit.qrSvg(v);
      out.append(el('div', { class: 'tcard' }, el('h2', { text: pick(published.shop) || t('title') }), box, el('p', { text: t('scan') }), el('small', { class: 'mono', text: v }),
        el('div', { class: 'yk-footer small' }, el('img', { src: 'assets/yk-logo.svg', width: 16, height: 16, alt: '' }), el('span', { text: 'By Yousef Khames · من تطوير يوسف خميس' }))),
        el('p', { class: 'noprint', text: t('qrNote') }), el('button', { class: 'btn primary noprint', onclick: () => window.print() }, t('print')));
    };
    inp.addEventListener('input', () => { store.data.qrUrl = inp.value.trim(); store.save(); draw(); });
    root.append(el('h1', { text: t('qrCard') }), el('p', { class: 'noprint', text: t('qrHelp') }), field(t('qrUrl'), inp), out); draw();
    return root;
  }

  function render() {
    const r = route(); Kit.applyTheme(); document.title = 'menyu | منيو';
    const view = r === 'edit' ? viewEdit() : r === 'qr' ? viewQr() : viewMenu(r === 'draft');
    app.replaceChildren(header(r === 'draft' ? 'menu' : r), el('div', { class: 'wrap' }, view), Kit.footer());
    document.body.dataset.ready = '1';
  }
  window.addEventListener('hashchange', () => { cat = ''; q = ''; render(); window.scrollTo(0, 0); });
  Kit.initLang('menyu'); render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
