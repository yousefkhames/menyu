/* Menyu admin: the shop owner's builder. Everything is saved in this browser (localStorage). */
(function () {
  'use strict';
  var C = window.MenyuCore, X = window.MenyuExport;
  var KEY = 'menyu.data.v1', UIKEY = 'menyu.ui.v1';

  var S = {
    ar: {
      app: 'منيو', tabMenu: 'القائمة', tabBrand: 'الهوية', tabShare: 'المشاركة', tabPreview: 'معاينة', undo: 'تراجع', uiLang: 'English',
      addItem: 'إضافة صنف', addCat: 'إضافة قسم', prices: 'تعديل الأسعار', search: 'ابحث في الأصناف', noItems: 'لا توجد أصناف بعد. ابدأ بإضافة قسم ثم أول صنف.',
      items: 'صنف', sold: 'نفد', hidden: 'مخفي', edit: 'تعديل', del: 'حذف', dup: 'نسخ', up: 'أعلى', down: 'أسفل', hide: 'إخفاء', show: 'إظهار',
      soldToggle: 'نفد / متاح', save: 'حفظ', cancel: 'إلغاء', close: 'إغلاق',
      nameAr: 'الاسم بالعربية', nameEn: 'الاسم بالإنجليزية', descAr: 'الوصف بالعربية', descEn: 'الوصف بالإنجليزية', category: 'القسم', price: 'السعر',
      icon: 'رمز (إيموجي)', image: 'صورة', upload: 'رفع صورة', removeImg: 'إزالة الصورة', tags: 'الوسوم', useSizes: 'أحجام بأسعار مختلفة',
      sizeAr: 'الحجم (عربي)', sizeEn: 'الحجم (إنجليزي)', addSize: 'إضافة حجم', soldOut: 'نفد من المخزون', hiddenItem: 'إخفاء من القائمة',
      itemNew: 'صنف جديد', itemEdit: 'تعديل الصنف', catNew: 'قسم جديد', catEdit: 'تعديل القسم', needName: 'اكتب اسم الصنف بلغة واحدة على الأقل',
      needCat: 'أضف قسماً أولاً', needCatName: 'اكتب اسم القسم بلغة واحدة على الأقل', badPrice: 'السعر غير صحيح',
      deleted: 'تم الحذف', restored: 'تم التراجع', saved: 'تم الحفظ', storageFull: 'مساحة التخزين في المتصفح امتلأت. صغّر الصور أو احذف بعضها.',
      tags_: { new: 'جديد', popular: 'الأكثر طلباً', veg: 'نباتي', spicy: 'حار', gluten: 'بدون جلوتين' },
      bulkTitle: 'تعديل الأسعار دفعة واحدة', bulkPct: 'النسبة % (سالب للتخفيض)', bulkStep: 'التقريب إلى أقرب', bulkScope: 'النطاق', allCats: 'كل الأقسام', bulkGo: 'تطبيق', bulkDone: 'تم تعديل أسعار {n} صنف',
      sIdentity: 'هوية المحل', shopAr: 'اسم المحل بالعربية', shopEn: 'اسم المحل بالإنجليزية', tagAr: 'سطر تعريفي بالعربية', tagEn: 'سطر تعريفي بالإنجليزية',
      logo: 'الشعار', uploadLogo: 'رفع الشعار', removeLogo: 'إزالة الشعار', logoHint: 'إن لم ترفع شعاراً نعرض أول حرف من الاسم.',
      sColors: 'الألوان والشكل', presets: 'ألوان جاهزة', cPrimary: 'اللون الأساسي', cAccent: 'لون التمييز', cBg: 'الخلفية', cText: 'لون النص',
      radius: 'استدارة الزوايا', rSharp: 'حادة', rSoft: 'ناعمة', rRound: 'دائرية', layout: 'شكل القائمة', lCards: 'بطاقات بصور', lList: 'قائمة كلاسيكية',
      contrastOk: 'التباين جيد', contrastBad: 'التباين ضعيف بين النص والخلفية',
      sMoney: 'العملة واللغة', curEn: 'رمز العملة (إنجليزي)', curAr: 'رمز العملة (عربي)', curPos: 'مكان الرمز', posAfter: 'بعد السعر', posBefore: 'قبل السعر',
      decimals: 'الكسور العشرية', digits: 'شكل الأرقام في العربية', dLatin: '123', dArabic: '١٢٣', defLang: 'اللغة الافتراضية للعملاء', switcher: 'إظهار زر تبديل اللغة',
      sOrder: 'الطلب عبر واتساب', orderOn: 'تفعيل زر الطلب للعملاء', wa: 'رقم واتساب المحل', waHint: 'مثال: 01012345678 أو +201012345678', cc: 'رمز الدولة', askTable: 'اطلب رقم الطاولة',
      sInfo: 'معلومات تظهر في القائمة', addrAr: 'العنوان بالعربية', addrEn: 'العنوان بالإنجليزية', insta: 'إنستجرام (بدون @)', wifiN: 'اسم الواي فاي', wifiP: 'كلمة مرور الواي فاي',
      sCheck: 'فحص قبل الطباعة', allGood: 'كل شيء جاهز. لا توجد ملاحظات.',
      au: {
        noItems: 'لا توجد أصناف ظاهرة في القائمة.', missingAr: '{n} صنف بلا اسم عربي.', missingEn: '{n} صنف بلا اسم إنجليزي.', zeroPrice: '{n} صنف سعره صفر.',
        emptyCats: '{n} قسم فارغ (لن يظهر للعملاء).', noLogo: 'لم يتم رفع شعار.', noWhatsapp: 'الطلب مفعّل لكن رقم واتساب غير صحيح أو ناقص.',
        lowContrast: 'التباين ضعيف بين لون النص والخلفية.', noPublicUrl: 'لم تكتب رابط القائمة العام. سنستخدم رابط هذه الصفحة.', noName: 'اسم المحل ناقص في إحدى اللغتين.'
      },
      sQr: 'رمز QR والرابط', pubUrl: 'رابط القائمة العام', pubHint: 'ضع رابط القائمة بعد رفعها على الإنترنت. إن تركته فارغاً نستخدم رابط menu.html بجانب هذه الصفحة.',
      qrFor: 'الرمز يفتح:', dlSvg: 'تنزيل SVG', dlPng: 'تنزيل PNG', tables: 'عدد الطاولات', printCards: 'طباعة بطاقات الطاولات', printOne: 'طباعة بطاقة واحدة',
      tablesHint: 'لكل طاولة رمز خاص يملأ رقم الطاولة تلقائياً في الطلب. اتركه 0 لبطاقة واحدة عامة.',
      sExport: 'التصدير والنسخ الاحتياطي', exHtml: 'تنزيل menu.html مستقل', exHtmlHint: 'ملف واحد يعمل بدون إنترنت. ارفعه على أي استضافة.', exJson: 'تنزيل menu.json', exJsonHint: 'نسخة احتياطية من كل الإعدادات والأصناف، ويقرؤها menu.html عند نشر المشروع.',
      imp: 'استيراد menu.json', impOk: 'تم الاستيراد', impBad: 'الملف ليس قائمة Menyu صالحة', demo: 'تحميل القائمة التجريبية', blank: 'ابدأ قائمة فارغة', confirmReplace: 'سيتم استبدال القائمة الحالية. تقدر تتراجع بزر تراجع. متابعة؟',
      sell: 'كيف تبيعه لمحل جديد', sell1: 'حمّل المشروع أو انسخ المستودع.', sell2: 'افتح صفحة الهوية وغيّر الاسم والشعار والألوان والعملة.', sell3: 'أضف الأقسام والأصناف.', sell4: 'نزّل menu.html (أو menu.json) وارفعه على استضافة المحل.', sell5: 'اطبع رمز QR أو بطاقات الطاولات.',
      cardScan: 'امسح لعرض القائمة', cardScanEn: 'Scan to see the menu', cardTable: 'طاولة', cardTableEn: 'Table', previewTitle: 'معاينة مباشرة', storage: 'التخزين المستخدم: {kb} ك.ب تقريباً من حوالي 5000'
    },
    en: {
      app: 'Menyu', tabMenu: 'Menu', tabBrand: 'Brand', tabShare: 'Share', tabPreview: 'Preview', undo: 'Undo', uiLang: 'العربية',
      addItem: 'Add item', addCat: 'Add category', prices: 'Adjust prices', search: 'Search items', noItems: 'No items yet. Add a category, then your first item.',
      items: 'items', sold: 'Sold out', hidden: 'Hidden', edit: 'Edit', del: 'Delete', dup: 'Duplicate', up: 'Move up', down: 'Move down', hide: 'Hide', show: 'Show',
      soldToggle: 'Sold out / available', save: 'Save', cancel: 'Cancel', close: 'Close',
      nameAr: 'Name (Arabic)', nameEn: 'Name (English)', descAr: 'Description (Arabic)', descEn: 'Description (English)', category: 'Category', price: 'Price',
      icon: 'Icon (emoji)', image: 'Photo', upload: 'Upload photo', removeImg: 'Remove photo', tags: 'Tags', useSizes: 'Sizes with different prices',
      sizeAr: 'Size (Arabic)', sizeEn: 'Size (English)', addSize: 'Add size', soldOut: 'Sold out', hiddenItem: 'Hide from the menu',
      itemNew: 'New item', itemEdit: 'Edit item', catNew: 'New category', catEdit: 'Edit category', needName: 'Enter the item name in at least one language',
      needCat: 'Add a category first', needCatName: 'Enter the category name in at least one language', badPrice: 'Price is not valid',
      deleted: 'Deleted', restored: 'Undone', saved: 'Saved', storageFull: 'Browser storage is full. Use smaller photos or remove some.',
      tags_: { new: 'New', popular: 'Popular', veg: 'Vegetarian', spicy: 'Spicy', gluten: 'Gluten free' },
      bulkTitle: 'Change prices in bulk', bulkPct: 'Percent % (negative to lower)', bulkStep: 'Round to nearest', bulkScope: 'Scope', allCats: 'All categories', bulkGo: 'Apply', bulkDone: 'Updated prices of {n} items',
      sIdentity: 'Shop identity', shopAr: 'Shop name (Arabic)', shopEn: 'Shop name (English)', tagAr: 'Tagline (Arabic)', tagEn: 'Tagline (English)',
      logo: 'Logo', uploadLogo: 'Upload logo', removeLogo: 'Remove logo', logoHint: 'Without a logo we show the first letter of the name.',
      sColors: 'Colors and style', presets: 'Ready palettes', cPrimary: 'Primary color', cAccent: 'Accent color', cBg: 'Background', cText: 'Text color',
      radius: 'Corner style', rSharp: 'Sharp', rSoft: 'Soft', rRound: 'Round', layout: 'Menu layout', lCards: 'Cards with photos', lList: 'Classic list',
      contrastOk: 'Good contrast', contrastBad: 'Text and background contrast is low',
      sMoney: 'Currency and language', curEn: 'Currency symbol (English)', curAr: 'Currency symbol (Arabic)', curPos: 'Symbol position', posAfter: 'After price', posBefore: 'Before price',
      decimals: 'Decimals', digits: 'Digits in Arabic', dLatin: '123', dArabic: '١٢٣', defLang: 'Default language for customers', switcher: 'Show language switch',
      sOrder: 'Ordering by WhatsApp', orderOn: 'Enable the order button for customers', wa: 'Shop WhatsApp number', waHint: 'Example: 01012345678 or +201012345678', cc: 'Country code', askTable: 'Ask for table number',
      sInfo: 'Info shown on the menu', addrAr: 'Address (Arabic)', addrEn: 'Address (English)', insta: 'Instagram (without @)', wifiN: 'Wi-Fi name', wifiP: 'Wi-Fi password',
      sCheck: 'Check before printing', allGood: 'Everything looks ready. No notes.',
      au: {
        noItems: 'No visible items on the menu.', missingAr: '{n} items have no Arabic name.', missingEn: '{n} items have no English name.', zeroPrice: '{n} items have a price of zero.',
        emptyCats: '{n} empty categories (customers will not see them).', noLogo: 'No logo uploaded.', noWhatsapp: 'Ordering is on but the WhatsApp number is missing or too short.',
        lowContrast: 'Text and background colors have low contrast.', noPublicUrl: 'No public menu URL set. We use the menu.html next to this page.', noName: 'Shop name is missing in one language.'
      },
      sQr: 'QR code and link', pubUrl: 'Public menu URL', pubHint: 'Paste the menu link after you publish it. If empty we use menu.html next to this page.',
      qrFor: 'The code opens:', dlSvg: 'Download SVG', dlPng: 'Download PNG', tables: 'Number of tables', printCards: 'Print table cards', printOne: 'Print one card',
      tablesHint: 'Each table gets its own code that pre-fills the table number in the order. Leave 0 for one general card.',
      sExport: 'Export and backup', exHtml: 'Download standalone menu.html', exHtmlHint: 'One file that works offline. Upload it to any hosting.', exJson: 'Download menu.json', exJsonHint: 'A backup of all settings and items. menu.html reads it when you publish this project.',
      imp: 'Import menu.json', impOk: 'Imported', impBad: 'That file is not a valid Menyu menu', demo: 'Load demo menu', blank: 'Start an empty menu', confirmReplace: 'This replaces the current menu. You can undo it. Continue?',
      sell: 'How to hand it to a new shop', sell1: 'Download the project or fork the repository.', sell2: 'Open Brand and change the name, logo, colors and currency.', sell3: 'Add the categories and items.', sell4: 'Download menu.html (or menu.json) and put it on the shop hosting.', sell5: 'Print the QR code or the table cards.',
      cardScan: 'امسح لعرض القائمة', cardScanEn: 'Scan to see the menu', cardTable: 'طاولة', cardTableEn: 'Table', previewTitle: 'Live preview', storage: 'Storage used: about {kb} KB of roughly 5000'
    }
  };

  /* ---------- state ---------- */
  var ui = { tab: 'menu', lang: 'en', q: '' };
  try { var u = JSON.parse(localStorage.getItem(UIKEY) || '{}'); if (u.lang === 'ar' || u.lang === 'en') ui.lang = u.lang; else ui.lang = (navigator.language || '').indexOf('ar') === 0 ? 'ar' : 'en'; } catch (e) {}
  var data;
  var history = [];
  var main = document.getElementById('main'), toastEl = document.getElementById('toast');

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return C.normalizeData(JSON.parse(raw));
    } catch (e) {}
    return fetch('menu.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(C.normalizeData).catch(function () { return C.sampleData(); });
  }
  function t(k) { return S[ui.lang][k]; }
  function fmt(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k]; }); }
  function saveUI() { try { localStorage.setItem(UIKEY, JSON.stringify({ lang: ui.lang })); } catch (e) {} }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { toast(t('storageFull')); return false; }
  }
  /* snapshot before a change so Undo works */
  function snap() { history.push(JSON.stringify(data)); if (history.length > 30) history.shift(); updateUndo(); }
  function undo() {
    if (!history.length) return;
    data = C.normalizeData(JSON.parse(history.pop()));
    persist(); render(); updateUndo(); toast(t('restored'));
  }
  function commit(rerender) { if (persist() && rerender !== false) render(); }
  function updateUndo() { var b = document.getElementById('undo'); b.disabled = !history.length; }

  function toast(msg, action) {
    toastEl.textContent = '';
    toastEl.appendChild(el('span', { text: msg }));
    if (action) toastEl.appendChild(el('button', { type: 'button', text: action.label, onclick: function () { action.fn(); toastEl.hidden = true; } }));
    toastEl.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.hidden = true; }, 4500);
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else if (k === 'value') n.value = v;
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  /* ---------- chrome ---------- */
  function applyChrome() {
    var html = document.documentElement;
    html.lang = ui.lang; html.dir = ui.lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('lang-btn').textContent = t('uiLang');
    document.getElementById('undo').textContent = '↶ ' + t('undo');
    document.getElementById('title-text').textContent = t('app');
    var tabs = { menu: 'tabMenu', brand: 'tabBrand', share: 'tabShare', preview: 'tabPreview' };
    Array.prototype.forEach.call(document.querySelectorAll('.tabs [data-tab]'), function (b) {
      var k = b.getAttribute('data-tab');
      b.querySelector('span').textContent = t(tabs[k]);
      b.setAttribute('aria-selected', String(ui.tab === k));
      b.classList.toggle('is-on', ui.tab === k);
    });
    document.getElementById('pv-title').textContent = t('previewTitle');
    document.body.setAttribute('data-tab', ui.tab);
  }

  function render() {
    if (ui.tab === 'preview' && window.matchMedia('(min-width:1000px)').matches) ui.tab = 'menu';
    applyChrome();
    main.textContent = '';
    var scroll = window.scrollY;
    if (ui.tab === 'menu') renderMenu();
    else if (ui.tab === 'brand') renderBrand();
    else if (ui.tab === 'share') renderShare();
    else renderPreviewTab();
    updateUndo();
    ensurePreview();
  }

  var pvFrame = document.getElementById('pv-frame');
  function ensurePreview() {
    if (!pvFrame.getAttribute('src')) pvFrame.setAttribute('src', 'menu.html?preview=1');
  }

  /* ---------- helpers ---------- */
  function field(label, input, hint) {
    return el('label', { class: 'fld' }, [el('span', { class: 'fld-l', text: label }), input, hint ? el('small', { class: 'fld-h', text: hint }) : null]);
  }
  function textIn(path, o) {
    o = o || {};
    var parts = path.split('.');
    var obj = parts.slice(0, -1).reduce(function (a, k) { return a[k]; }, data), key = parts[parts.length - 1];
    var inp = el(o.area ? 'textarea' : 'input', { type: o.area ? null : (o.type || 'text'), value: obj[key], rows: o.area ? '2' : null, maxlength: o.max || '120', dir: o.dir || null, inputmode: o.inputmode || null, id: 'f-' + path.replace(/\./g, '-'),
      oninput: function (e) { if (!o.noSnap && !inp._snapped) { snap(); inp._snapped = true; } obj[key] = e.target.value; if (o.after) o.after(); persist(); },
      onchange: function () { inp._snapped = false; if (o.rerender) render(); } });
    return inp;
  }
  function selectIn(path, options, o) {
    var parts = path.split('.');
    var obj = parts.slice(0, -1).reduce(function (a, k) { return a[k]; }, data), key = parts[parts.length - 1];
    var sel = el('select', { id: 'f-' + path.replace(/\./g, '-'), onchange: function (e) { snap(); var v = e.target.value; obj[key] = (o && o.num) ? Number(v) : v; commit(o && o.rerender); } },
      options.map(function (op) { return el('option', { value: op[0], text: op[1], selected: String(obj[key]) === String(op[0]) }); }));
    return sel;
  }
  function checkIn(path, label) {
    var parts = path.split('.');
    var obj = parts.slice(0, -1).reduce(function (a, k) { return a[k]; }, data), key = parts[parts.length - 1];
    return el('label', { class: 'chk' }, [el('input', { type: 'checkbox', id: 'f-' + path.replace(/\./g, '-'), checked: !!obj[key], onchange: function (e) { snap(); obj[key] = e.target.checked; commit(); } }), el('span', { text: label })]);
  }
  function card(title, kids, id) { return el('section', { class: 'card', id: id }, [el('h2', { text: title })].concat(kids)); }
  function btn(label, fn, cls, attrs) { return el('button', Object.assign({ type: 'button', class: 'btn ' + (cls || ''), onclick: fn }, attrs || {}), [label]); }
  function nm(o) { return C.pick(o, 'name', ui.lang) || '—'; }

  /* ---------- MENU tab ---------- */
  function renderMenu() {
    var st = C.stats(data);
    var head = el('div', { class: 'bar' }, [
      btn('+ ' + t('addItem'), function () { openItem(null); }, 'primary', { id: 'add-item' }),
      btn('+ ' + t('addCat'), function () { openCat(null); }, '', { id: 'add-cat' }),
      btn('% ' + t('prices'), openBulk, 'ghost', { id: 'bulk' })
    ]);
    var search = el('input', { type: 'search', class: 'search', id: 'q', placeholder: t('search'), 'aria-label': t('search'), value: ui.q,
      oninput: function (e) { ui.q = e.target.value; drawList(); } });
    var summary = el('p', { class: 'muted', text: st.items + ' ' + t('items') + ' · ' + st.categories + ' ' + (ui.lang === 'ar' ? 'قسم' : 'categories') + (st.soldOut ? ' · ' + st.soldOut + ' ' + t('sold') : '') });
    var list = el('div', { id: 'list' });
    main.appendChild(head); main.appendChild(search); main.appendChild(summary); main.appendChild(list);
    drawList();
  }

  function drawList() {
    var host = document.getElementById('list');
    if (!host) return;
    host.textContent = '';
    if (!data.categories.length) { host.appendChild(el('p', { class: 'empty', text: t('noItems') })); return; }
    var q = C.normSearch(ui.q);
    var shown = 0;
    data.categories.forEach(function (cat, ci) {
      var items = data.items.filter(function (i) {
        if (i.cat !== cat.id) return false;
        if (!q) return true;
        return C.normSearch([i.nameAr, i.nameEn, i.descAr, i.descEn].join(' ')).indexOf(q) >= 0;
      });
      if (q && !items.length) return;
      shown++;
      var all = data.items.filter(function (i) { return i.cat === cat.id; });
      host.appendChild(el('section', { class: 'cat' + (cat.hidden ? ' is-hidden' : ''), 'data-cat': cat.id }, [
        el('header', { class: 'cat-h' }, [
          el('span', { class: 'cat-i', 'aria-hidden': 'true', text: cat.icon || '•' }),
          el('div', { class: 'cat-t' }, [el('b', { text: nm(cat) }), el('small', { text: all.length + ' ' + t('items') + (cat.hidden ? ' · ' + t('hidden') : '') })]),
          el('div', { class: 'acts' }, [
            ib('↑', t('up'), function () { snap(); C.moveBy(data.categories, cat.id, -1); commit(); }, ci === 0),
            ib('↓', t('down'), function () { snap(); C.moveBy(data.categories, cat.id, 1); commit(); }, ci === data.categories.length - 1),
            ib('✎', t('edit'), function () { openCat(cat); }),
            ib(cat.hidden ? '◌' : '◉', cat.hidden ? t('show') : t('hide'), function () { snap(); cat.hidden = !cat.hidden; commit(); }),
            ib('🗑', t('del'), function () { deleteCat(cat); })
          ])
        ]),
        el('ul', { class: 'rows' }, items.map(function (it) { return itemRow(it); }))
      ]));
    });
    if (q && !shown) host.appendChild(el('p', { class: 'empty', text: '—' }));
  }

  function ib(glyph, label, fn, disabled) {
    return el('button', { type: 'button', class: 'ib', title: label, 'aria-label': label, disabled: disabled, onclick: fn, text: glyph });
  }

  function itemRow(it) {
    var info = C.itemPriceInfo(it);
    var thumb = it.image ? el('img', { class: 'rt', src: it.image, alt: '' }) : el('span', { class: 'rt rt--ph', 'aria-hidden': 'true', text: it.icon || '🍽️' });
    var sub = (it.nameAr && it.nameEn) ? (ui.lang === 'ar' ? it.nameEn : it.nameAr) : '';
    return el('li', { class: 'row' + (it.hidden ? ' is-hidden' : ''), 'data-item': it.id }, [
      thumb,
      el('div', { class: 'rb' }, [
        el('b', { text: C.pick(it, 'name', ui.lang) || '—' }),
        el('small', { text: sub }),
        el('span', { class: 'rp', text: C.formatPrice(info.min, data.locale, 'en') + (info.multi && info.max !== info.min ? ' – ' + C.formatPrice(info.max, data.locale, 'en') : '') }),
        el('span', { class: 'badges' }, [it.soldOut ? el('i', { class: 'bd bd--out', text: t('sold') }) : null, it.hidden ? el('i', { class: 'bd', text: t('hidden') }) : null])
      ]),
      el('div', { class: 'acts' }, [
        ib(it.soldOut ? '✓' : '⊘', t('soldToggle'), function () { snap(); it.soldOut = !it.soldOut; commit(); }),
        ib('↑', t('up'), function () { snap(); C.moveItemInCategory(data.items, it.id, -1); commit(); }),
        ib('↓', t('down'), function () { snap(); C.moveItemInCategory(data.items, it.id, 1); commit(); }),
        ib('✎', t('edit'), function () { openItem(it); }),
        ib('⧉', t('dup'), function () { snap(); var c = JSON.parse(JSON.stringify(it)); c.id = C.uid('i'); var k = data.items.indexOf(it); data.items.splice(k + 1, 0, c); commit(); }),
        ib('🗑', t('del'), function () { deleteItem(it); })
      ])
    ]);
  }

  function deleteItem(it) {
    snap();
    data.items = data.items.filter(function (x) { return x.id !== it.id; });
    commit();
    toast(t('deleted'), { label: t('undo'), fn: undo });
  }
  function deleteCat(cat) {
    var n = data.items.filter(function (i) { return i.cat === cat.id; }).length;
    var msg = ui.lang === 'ar' ? 'حذف القسم "' + nm(cat) + '"' + (n ? ' مع ' + n + ' صنف' : '') + '؟' : 'Delete category "' + nm(cat) + '"' + (n ? ' and its ' + n + ' items' : '') + '?';
    if (n && !confirm(msg)) return;
    snap();
    data.categories = data.categories.filter(function (c) { return c.id !== cat.id; });
    data.items = data.items.filter(function (i) { return i.cat !== cat.id; });
    commit();
    toast(t('deleted'), { label: t('undo'), fn: undo });
  }

  /* ---------- dialogs ---------- */
  function dialog(title, body, onSave, saveLabel, id) {
    var dlg = el('dialog', { class: 'dlg', id: id || 'dlg', 'aria-label': title });
    var err = el('p', { class: 'err', role: 'alert', hidden: true });
    var form = el('form', { method: 'dialog', novalidate: true }, [
      el('header', { class: 'dlg-h' }, [el('h3', { text: title }), el('button', { type: 'button', class: 'ib', 'aria-label': t('close'), onclick: function () { dlg.close(); }, text: '×' })]),
      el('div', { class: 'dlg-b' }, body),
      err,
      el('footer', { class: 'dlg-f' }, [btn(t('cancel'), function () { dlg.close(); }, 'ghost'), el('button', { type: 'submit', class: 'btn primary', id: 'dlg-save', text: saveLabel || t('save') })])
    ]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = onSave();
      if (msg) { err.textContent = msg; err.hidden = false; } else dlg.close();
    });
    dlg.appendChild(form);
    dlg.addEventListener('close', function () { dlg.remove(); });
    document.body.appendChild(dlg);
    dlg.showModal();
    var first = dlg.querySelector('input,select,textarea');
    if (first) first.focus();
    return dlg;
  }

  function openCat(cat) {
    var draft = cat ? { nameAr: cat.nameAr, nameEn: cat.nameEn, icon: cat.icon } : { nameAr: '', nameEn: '', icon: '' };
    var body = [
      field(t('nameAr'), el('input', { id: 'c-ar', value: draft.nameAr, maxlength: '60', dir: 'rtl', oninput: function (e) { draft.nameAr = e.target.value; } })),
      field(t('nameEn'), el('input', { id: 'c-en', value: draft.nameEn, maxlength: '60', dir: 'ltr', oninput: function (e) { draft.nameEn = e.target.value; } })),
      field(t('icon'), el('input', { id: 'c-icon', value: draft.icon, maxlength: '4', oninput: function (e) { draft.icon = e.target.value; } }))
    ];
    dialog(cat ? t('catEdit') : t('catNew'), body, function () {
      if (!draft.nameAr.trim() && !draft.nameEn.trim()) return t('needCatName');
      snap();
      if (cat) { cat.nameAr = draft.nameAr.trim(); cat.nameEn = draft.nameEn.trim(); cat.icon = draft.icon.trim(); }
      else data.categories.push({ id: C.uid('c'), nameAr: draft.nameAr.trim(), nameEn: draft.nameEn.trim(), icon: draft.icon.trim(), hidden: false });
      commit();
    }, null, 'dlg-cat');
  }

  function openItem(it) {
    if (!data.categories.length) { toast(t('needCat')); openCat(null); return; }
    var d = it ? JSON.parse(JSON.stringify(it)) : { id: C.uid('i'), cat: (ui.lastCat && data.categories.some(function (c) { return c.id === ui.lastCat; })) ? ui.lastCat : data.categories[0].id, nameAr: '', nameEn: '', descAr: '', descEn: '', price: 0, icon: '', image: '', tags: [], soldOut: false, hidden: false, sizes: [] };
    var useSizes = d.sizes.length > 0;
    var wrap = el('div');
    function draw() {
      wrap.textContent = '';
      wrap.appendChild(el('div', { class: 'two' }, [
        field(t('nameAr'), el('input', { id: 'i-nameAr', value: d.nameAr, maxlength: '80', dir: 'rtl', oninput: function (e) { d.nameAr = e.target.value; } })),
        field(t('nameEn'), el('input', { id: 'i-nameEn', value: d.nameEn, maxlength: '80', dir: 'ltr', oninput: function (e) { d.nameEn = e.target.value; } }))
      ]));
      wrap.appendChild(el('div', { class: 'two' }, [
        field(t('descAr'), el('textarea', { id: 'i-descAr', rows: '2', maxlength: '300', dir: 'rtl', oninput: function (e) { d.descAr = e.target.value; }, text: d.descAr })),
        field(t('descEn'), el('textarea', { id: 'i-descEn', rows: '2', maxlength: '300', dir: 'ltr', oninput: function (e) { d.descEn = e.target.value; }, text: d.descEn }))
      ]));
      wrap.appendChild(el('div', { class: 'two' }, [
        field(t('category'), el('select', { id: 'i-cat', onchange: function (e) { d.cat = e.target.value; } }, data.categories.map(function (c) { return el('option', { value: c.id, text: (c.icon ? c.icon + ' ' : '') + nm(c), selected: c.id === d.cat }); }))),
        field(t('icon'), el('input', { id: 'i-icon', value: d.icon, maxlength: '4', oninput: function (e) { d.icon = e.target.value; } }))
      ]));
      wrap.appendChild(el('label', { class: 'chk' }, [el('input', { type: 'checkbox', id: 'i-usesizes', checked: useSizes, onchange: function (e) {
        useSizes = e.target.checked;
        if (useSizes && !d.sizes.length) d.sizes = [{ ar: '', en: '', price: d.price || 0 }, { ar: '', en: '', price: d.price || 0 }];
        draw();
      } }), el('span', { text: t('useSizes') })]));
      if (!useSizes) {
        wrap.appendChild(field(t('price'), el('input', { id: 'i-price', type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: String(d.price), oninput: function (e) { d.price = e.target.value; } })));
      } else {
        d.sizes.forEach(function (s, k) {
          wrap.appendChild(el('div', { class: 'size-row', 'data-size-row': k }, [
            el('input', { 'aria-label': t('sizeAr'), placeholder: t('sizeAr'), value: s.ar, maxlength: '30', dir: 'rtl', oninput: function (e) { s.ar = e.target.value; } }),
            el('input', { 'aria-label': t('sizeEn'), placeholder: t('sizeEn'), value: s.en, maxlength: '30', dir: 'ltr', oninput: function (e) { s.en = e.target.value; } }),
            el('input', { 'aria-label': t('price'), type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: String(s.price), class: 'sz-p', oninput: function (e) { s.price = e.target.value; } }),
            d.sizes.length > 1 ? el('button', { type: 'button', class: 'ib', 'aria-label': t('del'), onclick: function () { d.sizes.splice(k, 1); draw(); }, text: '×' }) : null
          ]));
        });
        if (d.sizes.length < 4) wrap.appendChild(btn('+ ' + t('addSize'), function () { d.sizes.push({ ar: '', en: '', price: 0 }); draw(); }, 'ghost small', { id: 'add-size' }));
      }
      var fileIn = el('input', { type: 'file', accept: 'image/*', id: 'i-file', class: 'sr', onchange: function (e) {
        var f = e.target.files[0];
        if (!f) return;
        X.fileToDataUrl(f, 640, 'image/jpeg', 0.8).then(function (url) { d.image = url; draw(); }, function () { toast(t('impBad')); });
      } });
      wrap.appendChild(el('div', { class: 'fld' }, [
        el('span', { class: 'fld-l', text: t('image') }),
        el('div', { class: 'imgrow' }, [
          d.image ? el('img', { class: 'rt', src: d.image, alt: '' }) : el('span', { class: 'rt rt--ph', text: d.icon || '🍽️' }),
          el('label', { class: 'btn ghost small', for: 'i-file', text: t('upload') }), fileIn,
          d.image ? btn(t('removeImg'), function () { d.image = ''; draw(); }, 'ghost small') : null
        ])
      ]));
      wrap.appendChild(el('div', { class: 'fld' }, [el('span', { class: 'fld-l', text: t('tags') }), el('div', { class: 'tagpick' }, C.TAGS.map(function (g) {
        return el('label', { class: 'pill' }, [el('input', { type: 'checkbox', 'data-tag': g, checked: d.tags.indexOf(g) >= 0, onchange: function (e) {
          var k = d.tags.indexOf(g); if (e.target.checked && k < 0) d.tags.push(g); if (!e.target.checked && k >= 0) d.tags.splice(k, 1);
        } }), el('span', { text: t('tags_')[g] })]);
      }))]));
      wrap.appendChild(el('div', { class: 'two' }, [
        el('label', { class: 'chk' }, [el('input', { type: 'checkbox', id: 'i-sold', checked: d.soldOut, onchange: function (e) { d.soldOut = e.target.checked; } }), el('span', { text: t('soldOut') })]),
        el('label', { class: 'chk' }, [el('input', { type: 'checkbox', id: 'i-hidden', checked: d.hidden, onchange: function (e) { d.hidden = e.target.checked; } }), el('span', { text: t('hiddenItem') })])
      ]));
    }
    draw();
    dialog(it ? t('itemEdit') : t('itemNew'), [wrap], function () {
      if (!String(d.nameAr).trim() && !String(d.nameEn).trim()) return t('needName');
      var price = Number(d.price);
      if (!useSizes && (!isFinite(price) || price < 0 || String(d.price).trim() === '')) return t('badPrice');
      var sizes = [];
      if (useSizes) {
        for (var k = 0; k < d.sizes.length; k++) {
          var sp = Number(d.sizes[k].price);
          if (!isFinite(sp) || sp < 0 || String(d.sizes[k].price).trim() === '') return t('badPrice');
          sizes.push({ ar: String(d.sizes[k].ar).trim(), en: String(d.sizes[k].en).trim(), price: sp });
        }
      }
      snap();
      var out = {
        id: d.id, cat: d.cat, nameAr: String(d.nameAr).trim(), nameEn: String(d.nameEn).trim(), descAr: String(d.descAr).trim(), descEn: String(d.descEn).trim(),
        price: useSizes ? sizes[0].price : price, icon: String(d.icon).trim(), image: d.image, tags: d.tags.slice(), soldOut: d.soldOut, hidden: d.hidden, sizes: sizes
      };
      ui.lastCat = d.cat;
      if (it) data.items[data.items.indexOf(it)] = out; else data.items.push(out);
      commit();
    }, null, 'dlg-item');
  }

  function openBulk() {
    var o = { pct: '10', step: '5', cat: '' };
    var body = [
      field(t('bulkPct'), el('input', { id: 'b-pct', type: 'number', step: 'any', value: o.pct, oninput: function (e) { o.pct = e.target.value; } })),
      field(t('bulkStep'), el('select', { id: 'b-step', onchange: function (e) { o.step = e.target.value; } }, ['0.5', '1', '5', '10'].map(function (v) { return el('option', { value: v, text: v, selected: v === o.step }); }))),
      field(t('bulkScope'), el('select', { id: 'b-cat', onchange: function (e) { o.cat = e.target.value; } }, [el('option', { value: '', text: t('allCats') })].concat(data.categories.map(function (c) { return el('option', { value: c.id, text: nm(c) }); }))))
    ];
    dialog(t('bulkTitle'), body, function () {
      var p = Number(o.pct);
      if (!isFinite(p) || p <= -100 || p > 500) return t('badPrice');
      snap();
      var n = C.bulkPrice(data, p, Number(o.step), o.cat);
      commit();
      toast(fmt(t('bulkDone'), { n: n }));
    }, t('bulkGo'), 'dlg-bulk');
  }

  /* ---------- BRAND tab ---------- */
  function renderBrand() {
    var fileLogo = el('input', { type: 'file', accept: 'image/*', id: 'logo-file', class: 'sr', onchange: function (e) {
      var f = e.target.files[0]; if (!f) return;
      X.fileToDataUrl(f, 256, 'image/png').then(function (url) { snap(); data.brand.logo = url; commit(); }, function () { toast(t('impBad')); });
    } });
    var logoPrev = data.brand.logo ? el('img', { class: 'logo-prev', src: data.brand.logo, alt: '' }) : el('span', { class: 'logo-prev logo-prev--ph', text: (Array.from((data.brand.nameEn || data.brand.nameAr || 'M').trim())[0] || 'M').toUpperCase() });
    main.appendChild(card(t('sIdentity'), [
      el('div', { class: 'two' }, [field(t('shopAr'), textIn('brand.nameAr', { dir: 'rtl' })), field(t('shopEn'), textIn('brand.nameEn', { dir: 'ltr' }))]),
      el('div', { class: 'two' }, [field(t('tagAr'), textIn('brand.taglineAr', { dir: 'rtl' })), field(t('tagEn'), textIn('brand.taglineEn', { dir: 'ltr' }))]),
      el('div', { class: 'fld' }, [el('span', { class: 'fld-l', text: t('logo') }), el('div', { class: 'imgrow' }, [logoPrev,
        el('label', { class: 'btn ghost small', for: 'logo-file', text: t('uploadLogo') }), fileLogo,
        data.brand.logo ? btn(t('removeLogo'), function () { snap(); data.brand.logo = ''; commit(); }, 'ghost small', { id: 'logo-remove' }) : null]),
        el('small', { class: 'fld-h', text: t('logoHint') })])
    ], 'card-identity'));

    var presetRow = el('div', { class: 'presets' }, C.PRESETS.map(function (p) {
      return el('button', { type: 'button', class: 'preset', 'data-preset': p.id, title: ui.lang === 'ar' ? p.ar : p.en, onclick: function () {
        snap(); data.theme.primary = p.primary; data.theme.accent = p.accent; data.theme.bg = p.bg; data.theme.text = p.text; commit();
      } }, [el('span', { class: 'sw', style: 'background:linear-gradient(135deg,' + p.primary + ' 50%,' + p.accent + ' 50%);outline-color:' + p.bg }), el('small', { text: ui.lang === 'ar' ? p.ar : p.en })]);
    }));
    function color(key, label) {
      var hex = el('input', { class: 'hex', value: data.theme[key], maxlength: '7', 'aria-label': label + ' hex', dir: 'ltr', id: 'hex-' + key });
      var pick = el('input', { type: 'color', id: 'col-' + key, value: data.theme[key], 'aria-label': label,
        oninput: function (e) { if (!pick._s) { snap(); pick._s = 1; } data.theme[key] = e.target.value; hex.value = e.target.value; persist(); updateContrast(); },
        onchange: function () { pick._s = 0; } });
      hex.addEventListener('change', function () {
        var v = C.normHex(hex.value, null);
        if (!v) { hex.value = data.theme[key]; return; }
        snap(); data.theme[key] = v; pick.value = v; hex.value = v; persist(); updateContrast();
      });
      return el('div', { class: 'col' }, [el('span', { class: 'fld-l', text: label }), el('div', { class: 'colrow' }, [pick, hex])]);
    }
    var contrastNote = el('p', { class: 'note', id: 'contrast-note' });
    function updateContrast() {
      var ok = C.contrast(data.theme.bg, data.theme.text) >= 4.5;
      var cr = C.contrast(data.theme.bg, data.theme.text).toFixed(1);
      contrastNote.textContent = (ok ? '✓ ' + t('contrastOk') : '! ' + t('contrastBad')) + ' (' + cr + ':1)';
      contrastNote.className = 'note ' + (ok ? 'ok' : 'bad');
    }
    updateContrast();
    main.appendChild(card(t('sColors'), [
      el('span', { class: 'fld-l', text: t('presets') }), presetRow,
      el('div', { class: 'cols' }, [color('primary', t('cPrimary')), color('accent', t('cAccent')), color('bg', t('cBg')), color('text', t('cText'))]),
      contrastNote,
      el('div', { class: 'two' }, [
        field(t('radius'), selectIn('theme.radius', [['sharp', t('rSharp')], ['soft', t('rSoft')], ['round', t('rRound')]])),
        field(t('layout'), selectIn('theme.layout', [['cards', t('lCards')], ['list', t('lList')]]))
      ])
    ], 'card-colors'));

    main.appendChild(card(t('sMoney'), [
      el('div', { class: 'two' }, [field(t('curEn'), textIn('locale.currencyEn', { max: 8, dir: 'ltr' })), field(t('curAr'), textIn('locale.currencyAr', { max: 8, dir: 'rtl' }))]),
      el('div', { class: 'two' }, [
        field(t('curPos'), selectIn('locale.pos', [['after', t('posAfter')], ['before', t('posBefore')]])),
        field(t('decimals'), selectIn('locale.decimals', [[0, '0'], [1, '0.0'], [2, '0.00']], { num: true }))
      ]),
      el('div', { class: 'two' }, [
        field(t('digits'), selectIn('locale.digits', [['latin', t('dLatin')], ['arabic', t('dArabic')]])),
        field(t('defLang'), selectIn('locale.lang', [['ar', 'العربية'], ['en', 'English']]))
      ]),
      checkIn('locale.switcher', t('switcher'))
    ], 'card-money'));

    main.appendChild(card(t('sOrder'), [
      checkIn('order.enabled', t('orderOn')),
      el('div', { class: 'two' }, [field(t('wa'), textIn('order.whatsapp', { max: 24, dir: 'ltr', type: 'tel', inputmode: 'tel' }), t('waHint')), field(t('cc'), textIn('order.countryCode', { max: 4, dir: 'ltr', inputmode: 'numeric' }))]),
      checkIn('order.askTable', t('askTable'))
    ], 'card-order'));

    main.appendChild(card(t('sInfo'), [
      el('div', { class: 'two' }, [field(t('addrAr'), textIn('brand.addressAr', { dir: 'rtl' })), field(t('addrEn'), textIn('brand.addressEn', { dir: 'ltr' }))]),
      field(t('insta'), textIn('brand.instagram', { max: 40, dir: 'ltr' })),
      el('div', { class: 'two' }, [field(t('wifiN'), textIn('brand.wifiName', { dir: 'ltr' })), field(t('wifiP'), textIn('brand.wifiPass', { dir: 'ltr' }))])
    ], 'card-info'));
  }

  /* ---------- SHARE tab ---------- */
  function renderShare() {
    var issues = C.audit(data);
    var list = issues.length ? el('ul', { class: 'audit' }, issues.map(function (i) {
      return el('li', { class: i.level, 'data-code': i.code, text: (i.level === 'warn' ? '! ' : 'i ') + fmt(t('au')[i.code], { n: i.n }) });
    })) : el('p', { class: 'note ok', text: '✓ ' + t('allGood') });
    main.appendChild(card(t('sCheck'), [list], 'card-audit'));

    var url = C.menuUrl(data, location, '');
    var svg = X.qrSvg(url, { fg: C.contrast(data.theme.primary, '#ffffff') >= 4.5 || C.luminance(data.theme.primary) < 0.4 ? data.theme.primary : '#1b1612', bg: '#ffffff' });
    var qrBox = el('div', { class: 'qr', id: 'qr-box', role: 'img', 'aria-label': 'QR' });
    qrBox.innerHTML = svg; // generated locally from our own matrix, never from user HTML
    var tablesIn = el('input', { id: 'tables', type: 'number', min: '0', max: '200', value: String(ui.tables || 0), oninput: function (e) { ui.tables = Math.max(0, Math.min(200, parseInt(e.target.value, 10) || 0)); } });
    main.appendChild(card(t('sQr'), [
      field(t('pubUrl'), textIn('publicUrl', { dir: 'ltr', max: 300, type: 'url', rerender: true }), t('pubHint')),
      el('div', { class: 'qrwrap' }, [qrBox, el('div', { class: 'qrside' }, [
        el('small', { class: 'muted', text: t('qrFor') }), el('code', { class: 'url', id: 'qr-url', dir: 'ltr', text: url }),
        el('div', { class: 'bar' }, [
          btn(t('dlSvg'), function () { X.download('menyu-qr.svg', svg, 'image/svg+xml'); }, 'ghost small', { id: 'dl-svg' }),
          btn(t('dlPng'), function () { X.svgToPngBlob(svg, 1024).then(function (b) { X.download('menyu-qr.png', b); }); }, 'ghost small', { id: 'dl-png' })
        ])
      ])]),
      field(t('tables'), tablesIn, t('tablesHint')),
      btn(t('printCards'), function () { printCards(ui.tables || 0); }, 'primary', { id: 'print-cards' })
    ], 'card-qr'));

    var kb = Math.round(JSON.stringify(data).length / 1024);
    var imp = el('input', { type: 'file', accept: 'application/json,.json', id: 'imp-file', class: 'sr', onchange: function (e) {
      var f = e.target.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try { var nd = C.normalizeData(JSON.parse(fr.result)); snap(); data = nd; commit(); toast(t('impOk')); } catch (err) { toast(t('impBad')); }
      };
      fr.readAsText(f);
    } });
    main.appendChild(card(t('sExport'), [
      el('div', { class: 'xrow' }, [btn(t('exHtml'), function () {
        X.buildStandalone(data).then(function (html) { X.download('menu.html', html, 'text/html'); }, function () { toast('Export failed: open this app over http(s), not file://'); });
      }, 'primary', { id: 'ex-html' }), el('small', { class: 'muted', text: t('exHtmlHint') })]),
      el('div', { class: 'xrow' }, [btn(t('exJson'), function () { X.download('menu.json', JSON.stringify(data, null, 2), 'application/json'); }, '', { id: 'ex-json' }), el('small', { class: 'muted', text: t('exJsonHint') })]),
      el('div', { class: 'xrow' }, [el('label', { class: 'btn', for: 'imp-file', text: t('imp') }), imp]),
      el('div', { class: 'bar' }, [
        btn(t('demo'), function () { if (confirm(t('confirmReplace'))) { snap(); data = C.sampleData(); commit(); } }, 'ghost small', { id: 'load-demo' }),
        btn(t('blank'), function () { if (confirm(t('confirmReplace'))) { snap(); data = C.emptyData(); commit(); } }, 'ghost small', { id: 'load-blank' })
      ]),
      el('p', { class: 'muted', text: fmt(t('storage'), { kb: kb }) })
    ], 'card-export'));

    main.appendChild(card(t('sell'), [el('ol', { class: 'steps' }, ['sell1', 'sell2', 'sell3', 'sell4', 'sell5'].map(function (k) { return el('li', { text: t(k) }); }))], 'card-sell'));
  }

  function printCards(n) {
    var area = document.getElementById('print-area');
    area.textContent = '';
    var count = n > 0 ? n : 1;
    var fg = data.theme.primary;
    for (var i = 1; i <= count; i++) {
      var tableNo = n > 0 ? String(i) : '';
      var svg = X.qrSvg(C.menuUrl(data, location, tableNo), { fg: C.luminance(fg) < 0.5 ? fg : '#1b1612', bg: '#ffffff' });
      var qr = el('div', { class: 'pc-qr' }); qr.innerHTML = svg;
      var logo = data.brand.logo ? el('img', { class: 'pc-logo', src: data.brand.logo, alt: '' }) : el('span', { class: 'pc-logo pc-mono', text: (Array.from((data.brand.nameEn || data.brand.nameAr || 'M').trim())[0] || 'M').toUpperCase() });
      area.appendChild(el('div', { class: 'pc', style: '--p:' + data.theme.primary + ';--pt:' + C.readableOn(data.theme.primary) + ';--bg:' + data.theme.bg + ';--tx:' + data.theme.text }, [
        el('div', { class: 'pc-head' }, [logo, el('b', { text: data.brand.nameAr || data.brand.nameEn }), data.brand.nameEn && data.brand.nameAr ? el('span', { text: data.brand.nameEn }) : null]),
        qr,
        el('div', { class: 'pc-scan' }, [el('b', { text: S.ar.cardScan }), el('span', { text: S.en.cardScanEn })]),
        tableNo ? el('div', { class: 'pc-table', text: S.ar.cardTable + ' ' + tableNo + ' · ' + S.en.cardTableEn + ' ' + tableNo }) : null
      ]));
    }
    setTimeout(function () { window.print(); }, 60);
  }

  /* ---------- PREVIEW tab (phones) ---------- */
  function renderPreviewTab() {
    main.appendChild(el('p', { class: 'muted', text: t('previewTitle') }));
  }

  /* ---------- wiring ---------- */
  document.getElementById('lang-btn').addEventListener('click', function () { ui.lang = ui.lang === 'ar' ? 'en' : 'ar'; saveUI(); render(); });
  document.getElementById('undo').addEventListener('click', undo);
  Array.prototype.forEach.call(document.querySelectorAll('.tabs [data-tab]'), function (b) {
    b.addEventListener('click', function () { ui.tab = b.getAttribute('data-tab'); render(); window.scrollTo(0, 0); });
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) { e.preventDefault(); undo(); }
  });

  Promise.resolve(load()).then(function (d) {
    data = d;
    if (!localStorage.getItem(KEY)) persist();
    render();
    window.__menyu = { get data() { return data; } };
    document.body.setAttribute('data-ready', '1');
  });
})();
