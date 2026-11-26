/* Menyu viewer: the customer-facing menu page. Used by menu.html and the standalone export. */
(function (root) {
  'use strict';
  var C = root.MenyuCore;

  var VT = {
    ar: {
      search: 'ابحث في القائمة', all: 'الكل', add: 'أضف', soldOut: 'نفد', from: 'ابتداءً من',
      viewOrder: 'عرض الطلب', yourOrder: 'طلبك', total: 'الإجمالي', table: 'رقم الطاولة', yourName: 'الاسم (اختياري)',
      note: 'ملاحظات (اختياري)', sendWa: 'إرسال الطلب عبر واتساب', copy: 'نسخ نص الطلب', copied: 'تم النسخ',
      clear: 'مسح الطلب', empty: 'طلبك فارغ', none: 'لا توجد أصناف مطابقة', close: 'إغلاق', addTo: 'أضف إلى الطلب',
      size: 'الحجم', wifi: 'واي فاي', pass: 'كلمة المرور', loadFail: 'تعذر تحميل القائمة', lang: 'English',
      noWa: 'لم يتم ضبط رقم واتساب للمحل. انسخ الطلب وأعطه للنادل.', inOrder: 'في الطلب',
      tags: { new: 'جديد', popular: 'الأكثر طلباً', veg: 'نباتي', spicy: 'حار', gluten: 'بدون جلوتين' },
      poweredBy: 'مبني بـ Menyu'
    },
    en: {
      search: 'Search the menu', all: 'All', add: 'Add', soldOut: 'Sold out', from: 'From',
      viewOrder: 'View order', yourOrder: 'Your order', total: 'Total', table: 'Table number', yourName: 'Name (optional)',
      note: 'Notes (optional)', sendWa: 'Send order on WhatsApp', copy: 'Copy order text', copied: 'Copied',
      clear: 'Clear order', empty: 'Your order is empty', none: 'No matching items', close: 'Close', addTo: 'Add to order',
      size: 'Size', wifi: 'Wi-Fi', pass: 'Password', loadFail: 'Could not load the menu', lang: 'العربية',
      noWa: 'This shop has no WhatsApp number set. Copy the order and show it to the waiter.', inOrder: 'In order',
      tags: { new: 'New', popular: 'Popular', veg: 'Vegetarian', spicy: 'Spicy', gluten: 'Gluten free' },
      poweredBy: 'Built with Menyu'
    }
  };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  function themeVars(theme) {
    var p = theme.primary, bg = theme.bg, tx = theme.text;
    var dark = C.luminance(bg) < 0.25;
    var vars = {
      '--p': p, '--pt': C.readableOn(p), '--a': theme.accent, '--at': C.readableOn(theme.accent),
      '--bg': bg, '--tx': tx,
      '--card': dark ? C.mix(bg, '#ffffff', 0.07) : C.mix(bg, '#ffffff', 0.65),
      '--mut': C.mix(tx, bg, 0.42), '--line': C.mix(tx, bg, 0.86),
      '--pc': C.contrast(p, bg) >= 3 ? p : tx,
      '--r': theme.radius === 'sharp' ? '4px' : theme.radius === 'round' ? '24px' : '14px'
    };
    return vars;
  }

  function monogram(data, size) {
    var name = C.pick(data.brand, 'name', 'en') || C.pick(data.brand, 'name', 'ar') || 'M';
    var ch = Array.from(name.trim())[0] || 'M';
    return el('span', { class: 'mv-mono', style: 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.46) + 'px', 'aria-hidden': 'true', text: ch.toUpperCase() });
  }

  function mount(rootEl, initialData, opts) {
    opts = opts || {};
    var data = initialData;
    var params = new URLSearchParams(location.search);
    var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
    var lang = params.get('lang') === 'en' || params.get('lang') === 'ar' ? params.get('lang') : (store.get('menyu.viewlang') || data.locale.lang);
    if (lang !== 'ar' && lang !== 'en') lang = data.locale.lang;
    var state = { q: '', cat: '', tags: [], cart: [], table: params.get('t') || '', name: '', note: '' };
    try { state.cart = JSON.parse(sessionStorage.getItem('menyu.cart') || '[]'); } catch (e) { state.cart = []; }
    if (!Array.isArray(state.cart)) state.cart = [];
    var nodes = {};

    function t() { return VT[lang]; }
    function fp(n) { return C.formatPrice(n, data.locale, lang); }
    function saveCart() { try { sessionStorage.setItem('menyu.cart', JSON.stringify(state.cart)); } catch (e) {} }
    function cartCount() { return C.cartLines(data, state.cart).reduce(function (s, l) { return s + l.qty; }, 0); }

    function applyTheme() {
      var v = themeVars(data.theme);
      Object.keys(v).forEach(function (k) { rootEl.style.setProperty(k, v[k]); });
      rootEl.className = 'mv mv--' + data.theme.layout + (opts.embed ? ' mv--embed' : '');
      rootEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      rootEl.setAttribute('lang', lang);
      if (!opts.embed) {
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);
        document.title = C.pick(data.brand, 'name', lang) || 'Menu';
        var meta = document.querySelector('meta[name=theme-color]');
        if (meta) meta.setAttribute('content', data.theme.primary);
        setFavicon();
      }
    }
    function setFavicon() {
      var link = document.querySelector('link[rel=icon]');
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      if (data.brand.logo) link.href = data.brand.logo;
      else {
        var ch = (Array.from((C.pick(data.brand, 'name', 'en') || 'M').trim())[0] || 'M').toUpperCase().replace(/[<&>"]/g, 'M');
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="' + data.theme.primary + '"/><text x="32" y="43" font-size="34" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="' + C.readableOn(data.theme.primary) + '">' + ch + '</text></svg>';
        link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
      }
    }

    function logoNode(size) {
      if (data.brand.logo) return el('img', { class: 'mv-logo', src: data.brand.logo, alt: '', width: size, height: size });
      return monogram(data, size);
    }

    function iconNode(key, cls) {
      var n = el('span', { class: cls, 'aria-hidden': 'true' });
      var svg = C.iconSvg(key);
      if (svg) n.innerHTML = svg; // constant markup from our own icon table, keyed lookup only
      else if (key) n.textContent = key;
      return n;
    }
    function thumb(item, cat) {
      if (item.image) return el('img', { class: 'mv-thumb', src: item.image, alt: '', loading: 'lazy' });
      return iconNode(item.icon || (cat && cat.icon) || '', 'mv-thumb mv-thumb--ph');
    }

    function tagBadges(item) {
      if (!item.tags.length) return null;
      return el('span', { class: 'mv-tags' }, item.tags.map(function (g) { return el('span', { class: 'mv-tag mv-tag--' + g, text: t().tags[g] }); }));
    }

    function priceNode(item) {
      var info = C.itemPriceInfo(item);
      if (info.multi && info.min !== info.max) return el('span', { class: 'mv-price' }, [el('small', { text: t().from + ' ' }), document.createTextNode(fp(info.min))]);
      return el('span', { class: 'mv-price', text: fp(info.min) });
    }

    function qtyOf(item) {
      return state.cart.filter(function (l) { return l.id === item.id; }).reduce(function (s, l) { return s + l.qty; }, 0);
    }

    function itemCard(item, cat) {
      var name = C.pick(item, 'name', lang), desc = C.pick(item, 'desc', lang);
      var canOrder = data.order.enabled && !item.soldOut;
      var q = qtyOf(item);
      var add = canOrder ? el('button', {
        class: 'mv-add' + (q ? ' is-on' : ''), type: 'button', 'aria-label': t().add + ': ' + name,
        'data-add': item.id,
        onclick: function (e) {
          e.stopPropagation();
          if (item.sizes.length > 1) openItem(item);
          else { C.cartAdd(state.cart, item.id, item.sizes.length ? 0 : -1, 1); saveCart(); renderList(); renderCartBar(); }
        }
      }, [q ? el('b', { text: C.toDigits(String(q), lang === 'ar' ? data.locale.digits : 'latin') }) : el('span', { text: '+' })]) : null;
      var card = el('article', { class: 'mv-item' + (item.soldOut ? ' is-out' : ''), tabindex: '0', role: 'button', 'data-item': item.id, 'aria-label': name,
        onclick: function () { openItem(item); },
        onkeydown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(item); } }
      }, [
        data.theme.layout === 'cards' ? thumb(item, cat) : null,
        el('div', { class: 'mv-body' }, [
          el('div', { class: 'mv-line' }, [el('h3', { class: 'mv-name', text: name }), el('span', { class: 'mv-dots', 'aria-hidden': 'true' }), item.soldOut ? el('span', { class: 'mv-out', text: t().soldOut }) : priceNode(item)]),
          desc ? el('p', { class: 'mv-desc', text: desc }) : null,
          tagBadges(item)
        ]),
        add
      ]);
      return card;
    }

    function renderList() {
      var host = nodes.list;
      host.textContent = '';
      var items = C.filterItems(data, { q: state.q, cat: state.cat, tags: state.tags });
      var any = false;
      data.categories.forEach(function (cat) {
        if (cat.hidden) return;
        var list = items.filter(function (i) { return i.cat === cat.id; });
        if (!list.length) return;
        any = true;
        host.appendChild(el('section', { class: 'mv-sec', id: 'cat-' + cat.id }, [
          el('h2', { class: 'mv-cat' }, [cat.icon ? iconNode(cat.icon, 'mv-cat-i') : null, document.createTextNode(C.pick(cat, 'name', lang))]),
          el('div', { class: 'mv-grid' }, list.map(function (i) { return itemCard(i, cat); }))
        ]));
      });
      if (!any) host.appendChild(el('p', { class: 'mv-none', text: t().none }));
    }

    function renderChips() {
      var host = nodes.chips;
      host.textContent = '';
      function chip(label, id, icon) {
        host.appendChild(el('button', { type: 'button', class: 'mv-chip' + (state.cat === id ? ' is-on' : ''), 'data-cat': id, 'aria-pressed': String(state.cat === id),
          onclick: function () { state.cat = id; renderChips(); renderList(); if (id) { var s = rootEl.querySelector('#cat-' + id); if (s) s.scrollIntoView({ block: 'start', behavior: 'smooth' }); } } }, [icon ? iconNode(icon, 'mv-chip-i') : null, label]));
      }
      chip(t().all, '', '');
      data.categories.forEach(function (c) {
        if (c.hidden || !data.items.some(function (i) { return i.cat === c.id && !i.hidden; })) return;
        chip(C.pick(c, 'name', lang), c.id, c.icon);
      });
    }

    function renderTagFilters() {
      var host = nodes.tagrow;
      host.textContent = '';
      var used = C.TAGS.filter(function (g) { return data.items.some(function (i) { return !i.hidden && i.tags.indexOf(g) >= 0; }); });
      used.forEach(function (g) {
        var on = state.tags.indexOf(g) >= 0;
        host.appendChild(el('button', { type: 'button', class: 'mv-tagbtn mv-tag--' + g + (on ? ' is-on' : ''), 'data-tag': g, 'aria-pressed': String(on),
          onclick: function () { var k = state.tags.indexOf(g); if (k >= 0) state.tags.splice(k, 1); else state.tags.push(g); renderTagFilters(); renderList(); } }, [t().tags[g]]));
      });
    }

    function renderCartBar() {
      var n = cartCount();
      var bar = nodes.cartbar;
      bar.textContent = '';
      bar.hidden = !(data.order.enabled && n > 0);
      if (bar.hidden) return;
      bar.appendChild(el('button', { type: 'button', class: 'mv-cartbtn', id: 'mv-open-order', onclick: openOrder }, [
        el('span', { class: 'mv-cartn', text: C.toDigits(String(n), lang === 'ar' ? data.locale.digits : 'latin') }),
        el('span', { class: 'mv-cartl', text: t().viewOrder }),
        el('span', { class: 'mv-cartt', text: fp(C.cartTotal(data, state.cart)) })
      ]));
    }

    /* ---------- sheets ---------- */
    function closeSheet() {
      if (nodes.sheet) { nodes.sheet.remove(); nodes.sheet = null; }
      document.body.classList.remove('mv-lock');
    }
    function sheet(title, content, onClose) {
      closeSheet();
      var s = el('div', { class: 'mv-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, [
        el('div', { class: 'mv-scrim', onclick: closeSheet }),
        el('div', { class: 'mv-panel' }, [
          el('button', { type: 'button', class: 'mv-x', 'aria-label': t().close, onclick: closeSheet, text: '×' })
        ].concat(content))
      ]);
      s.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
      rootEl.appendChild(s);
      nodes.sheet = s;
      document.body.classList.add('mv-lock');
      var f = s.querySelector('button.mv-primary, input, button.mv-x');
      if (f) f.focus();
      return s;
    }

    function openItem(item) {
      var cat = data.categories.filter(function (c) { return c.id === item.cat; })[0];
      var sel = 0, qty = 1;
      var name = C.pick(item, 'name', lang), desc = C.pick(item, 'desc', lang);
      var body = el('div', { class: 'mv-detail' });
      function draw() {
        body.textContent = '';
        var big = item.image ? el('img', { class: 'mv-big', src: item.image, alt: '' }) : iconNode(item.icon || (cat && cat.icon) || '', 'mv-big mv-big--ph');
        body.appendChild(big);
        body.appendChild(el('h3', { class: 'mv-dname', text: name }));
        if (desc) body.appendChild(el('p', { class: 'mv-ddesc', text: desc }));
        var tb = tagBadges(item); if (tb) body.appendChild(tb);
        var price = item.sizes.length ? item.sizes[sel].price : item.price;
        if (item.sizes.length > 1) {
          body.appendChild(el('div', { class: 'mv-sizes', role: 'radiogroup', 'aria-label': t().size }, item.sizes.map(function (s, k) {
            return el('button', { type: 'button', role: 'radio', 'aria-checked': String(k === sel), class: 'mv-size' + (k === sel ? ' is-on' : ''), 'data-size': k,
              onclick: function () { sel = k; draw(); } }, [el('span', { text: lang === 'ar' ? (s.ar || s.en) : (s.en || s.ar) }), el('b', { text: fp(s.price) })]);
          })));
        } else body.appendChild(el('div', { class: 'mv-dprice', text: fp(price) }));
        if (data.order.enabled && !item.soldOut) {
          body.appendChild(el('div', { class: 'mv-dfoot' }, [
            stepper(function () { return qty; }, function (d) { qty = Math.max(1, Math.min(99, qty + d)); draw(); }),
            el('button', { type: 'button', class: 'mv-primary', 'data-confirm-add': '1', onclick: function () {
              C.cartAdd(state.cart, item.id, item.sizes.length ? sel : -1, qty); saveCart(); closeSheet(); renderList(); renderCartBar();
            } }, [t().addTo + ' · ' + fp(price * qty)])
          ]));
        } else if (item.soldOut) body.appendChild(el('p', { class: 'mv-out mv-out--big', text: t().soldOut }));
      }
      draw();
      sheet(name, [body]);
    }

    function stepper(get, change) {
      return el('div', { class: 'mv-step' }, [
        el('button', { type: 'button', 'aria-label': '-', 'data-dec': '1', onclick: function () { change(-1); }, text: '−' }),
        el('output', { text: C.toDigits(String(get()), lang === 'ar' ? data.locale.digits : 'latin') }),
        el('button', { type: 'button', 'aria-label': '+', 'data-inc': '1', onclick: function () { change(1); }, text: '+' })
      ]);
    }

    function orderText() {
      return C.buildOrderMessage(data, state.cart, lang, { table: state.table, name: state.name, note: state.note });
    }

    function openOrder() {
      var body = el('div', { class: 'mv-order' });
      function draw() {
        var focusId = document.activeElement && document.activeElement.id;
        body.textContent = '';
        var lines = C.cartLines(data, state.cart);
        body.appendChild(el('h3', { class: 'mv-dname', text: t().yourOrder }));
        if (!lines.length) { body.appendChild(el('p', { class: 'mv-none', text: t().empty })); return; }
        body.appendChild(el('ul', { class: 'mv-lines' }, lines.map(function (l) {
          var nm = C.pick(l.item, 'name', lang) + (l.size ? ' · ' + (lang === 'ar' ? (l.size.ar || l.size.en) : (l.size.en || l.size.ar)) : '');
          return el('li', { 'data-line': l.item.id }, [
            el('div', { class: 'mv-ln' }, [el('span', { text: nm }), el('small', { text: fp(l.price) })]),
            stepper(function () { return l.qty; }, function (d) { C.cartAdd(state.cart, l.item.id, l.v, d); saveCart(); renderList(); renderCartBar(); draw(); if (!cartCount()) closeSheet(); }),
            el('b', { class: 'mv-lt', text: fp(l.total) })
          ]);
        })));
        body.appendChild(el('div', { class: 'mv-total' }, [el('span', { text: t().total }), el('b', { text: fp(C.cartTotal(data, state.cart)) })]));
        if (data.order.askTable) body.appendChild(el('label', { class: 'mv-f' }, [el('span', { text: t().table }), el('input', { id: 'mv-table', inputmode: 'numeric', maxlength: '10', value: state.table, oninput: function (e) { state.table = e.target.value; } })]));
        body.appendChild(el('label', { class: 'mv-f' }, [el('span', { text: t().yourName }), el('input', { id: 'mv-name', maxlength: '40', value: state.name, oninput: function (e) { state.name = e.target.value; } })]));
        body.appendChild(el('label', { class: 'mv-f' }, [el('span', { text: t().note }), el('textarea', { id: 'mv-note', rows: '2', maxlength: '300', oninput: function (e) { state.note = e.target.value; }, text: state.note })]));
        var link = function () { return C.whatsappLink(data.order.whatsapp, data.order.countryCode, orderText()); };
        if (C.waDigits(data.order.whatsapp, data.order.countryCode).length >= 8) {
          body.appendChild(el('button', { type: 'button', class: 'mv-primary mv-wa', id: 'mv-send', onclick: function () { window.open(link(), '_blank', 'noopener'); } }, [t().sendWa]));
        } else body.appendChild(el('p', { class: 'mv-hint', text: t().noWa }));
        var copyBtn = el('button', { type: 'button', class: 'mv-ghost', id: 'mv-copy', onclick: function () {
          var txt = orderText();
          function done() { copyBtn.textContent = t().copied; setTimeout(function () { copyBtn.textContent = t().copy; }, 1500); }
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt); done(); });
          else { fallbackCopy(txt); done(); }
        }, text: t().copy });
        body.appendChild(copyBtn);
        body.appendChild(el('button', { type: 'button', class: 'mv-link', id: 'mv-clear', onclick: function () { state.cart = []; saveCart(); closeSheet(); renderList(); renderCartBar(); }, text: t().clear }));
        if (focusId) { var f = body.querySelector('#' + focusId); if (f) f.focus(); }
      }
      draw();
      sheet(t().yourOrder, [body]);
    }
    function fallbackCopy(txt) {
      var ta = el('textarea', { style: 'position:fixed;opacity:0' });
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
    }

    /* ---------- skeleton ---------- */
    function render() {
      applyTheme();
      closeSheet();
      rootEl.textContent = '';
      var b = data.brand;
      var addr = C.pick(b, 'address', lang);
      var info = [];
      if (addr) info.push(el('span', { class: 'mv-info', text: '📍 ' + addr }));
      if (b.instagram) info.push(el('a', { class: 'mv-info', href: 'https://instagram.com/' + encodeURIComponent(b.instagram), target: '_blank', rel: 'noopener', text: '@' + b.instagram }));
      if (b.wifiName) info.push(el('span', { class: 'mv-info', text: t().wifi + ': ' + b.wifiName + (b.wifiPass ? ' · ' + t().pass + ': ' + b.wifiPass : '') }));
      var tagline = C.pick(b, 'tagline', lang);
      var hero = el('header', { class: 'mv-hero' }, [
        el('div', { class: 'mv-hero-top' }, [data.locale.switcher ? el('button', { type: 'button', class: 'mv-lang', id: 'mv-lang', lang: lang === 'ar' ? 'en' : 'ar', onclick: function () {
          lang = lang === 'ar' ? 'en' : 'ar'; store.set('menyu.viewlang', lang); render();
        }, text: t().lang }) : null]),
        logoNode(76),
        el('h1', { class: 'mv-title', text: C.pick(b, 'name', lang) }),
        tagline ? el('p', { class: 'mv-tagline', text: tagline }) : null,
        info.length ? el('div', { class: 'mv-infos' }, info) : null
      ]);
      nodes.chips = el('div', { class: 'mv-chips', role: 'toolbar' });
      nodes.tagrow = el('div', { class: 'mv-tagrow' });
      var search = el('input', { type: 'search', class: 'mv-search', id: 'mv-search', placeholder: t().search, 'aria-label': t().search, value: state.q, autocomplete: 'off',
        oninput: function (e) { state.q = e.target.value; renderList(); } });
      var tools = el('div', { class: 'mv-tools' }, [search, nodes.chips, nodes.tagrow]);
      nodes.list = el('main', { class: 'mv-main' });
      nodes.cartbar = el('div', { class: 'mv-cartbar', hidden: true });
      var foot = el('footer', { class: 'mv-foot' }, [el('span', { text: t().poweredBy })]);
      [hero, tools, nodes.list, foot, nodes.cartbar].forEach(function (n) { rootEl.appendChild(n); });
      renderChips(); renderTagFilters(); renderList(); renderCartBar();
    }

    render();
    return {
      update: function (d) { data = d; render(); },
      getLang: function () { return lang; }
    };
  }

  root.MenyuViewer = { mount: mount, VT: VT, themeVars: themeVars };
})(typeof self !== 'undefined' ? self : this);
