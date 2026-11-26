/* Menyu core: pure logic, no DOM. Works in the browser (window.MenyuCore) and in Node (tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MenyuCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TAGS = ['new', 'popular', 'veg', 'spicy', 'gluten'];
  var RADII = ['sharp', 'soft', 'round'];
  var LAYOUTS = ['cards', 'list'];
  var SCHEMA = 1;

  var PRESETS = [
    { id: 'espresso', en: 'Espresso', ar: 'إسبريسو', primary: '#5b3a29', accent: '#d9a441', bg: '#fbf6ee', text: '#2a1d15' },
    { id: 'mint', en: 'Mint', ar: 'نعناع', primary: '#1f7a5c', accent: '#f2b84b', bg: '#f4faf6', text: '#14281f' },
    { id: 'rose', en: 'Rose', ar: 'وردي', primary: '#b83a5e', accent: '#f0a35e', bg: '#fff6f7', text: '#33161f' },
    { id: 'ocean', en: 'Ocean', ar: 'محيط', primary: '#16508a', accent: '#2fb7c7', bg: '#f3f8fc', text: '#10253a' },
    { id: 'saffron', en: 'Saffron', ar: 'زعفران', primary: '#c24d28', accent: '#e8b730', bg: '#fff8ee', text: '#33190f' },
    { id: 'noir', en: 'Noir', ar: 'نوار', primary: '#e6b450', accent: '#e6b450', bg: '#16130f', text: '#f4ede0' }
  ];

  function uid(prefix) {
    return (prefix || 'x') + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  }

  function str(v, max) {
    if (v === null || v === undefined) return '';
    v = String(v);
    return v.length > (max || 200) ? v.slice(0, max || 200) : v;
  }

  /* ---------- colors ---------- */
  function normHex(h, fallback) {
    h = String(h || '').trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map(function (c) { return c + c; }).join('');
    return /^[0-9a-f]{6}$/i.test(h) ? '#' + h.toLowerCase() : fallback;
  }
  function hexToRgb(h) {
    h = normHex(h, null);
    if (!h) return null;
    return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); });
  }
  function rgbToHex(rgb) {
    return '#' + rgb.map(function (n) {
      var s = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return s.length < 2 ? '0' + s : s;
    }).join('');
  }
  function luminance(hex) {
    var rgb = hexToRgb(hex) || [0, 0, 0];
    var c = rgb.map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var l1 = luminance(a), l2 = luminance(b);
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }
  /* readable text color (near-white or near-black) on a background */
  function readableOn(bg) {
    return contrast(bg, '#ffffff') >= contrast(bg, '#1b1612') ? '#ffffff' : '#1b1612';
  }
  function mix(a, b, t) {
    var x = hexToRgb(a) || [0, 0, 0], y = hexToRgb(b) || [0, 0, 0];
    return rgbToHex([0, 1, 2].map(function (i) { return x[i] * (1 - t) + y[i] * t; }));
  }

  /* ---------- text / numbers ---------- */
  var AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  function toDigits(s, mode) {
    s = String(s);
    if (mode === 'arabic') return s.replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; }).replace('.', '٫');
    return s;
  }
  function formatPrice(n, locale, lang) {
    locale = locale || {};
    var dec = Math.max(0, Math.min(2, locale.decimals | 0));
    var num = Number(n);
    if (!isFinite(num)) num = 0;
    var s = num.toFixed(dec);
    if (dec > 0 && /\.0+$/.test(s) && locale.trimZeros !== false) s = s.replace(/\.0+$/, '');
    s = toDigits(s, lang === 'ar' ? locale.digits : 'latin');
    var sym = lang === 'ar' ? (locale.currencyAr || locale.currencyEn || '') : (locale.currencyEn || locale.currencyAr || '');
    if (!sym) return s;
    return locale.pos === 'before' ? sym + '\u00a0' + s : s + '\u00a0' + sym;
  }
  /* Arabic-aware search normalization */
  function normSearch(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
      .replace(/[\u0622\u0623\u0625]/g, '\u0627')
      .replace(/\u0649/g, '\u064a')
      .replace(/\u0629/g, '\u0647')
      .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x660); })
      .trim();
  }

  /* ---------- default / sample data ---------- */
  function emptyData() {
    return {
      v: SCHEMA,
      brand: {
        nameAr: 'اسم المحل', nameEn: 'Your Shop', taglineAr: '', taglineEn: '', logo: '',
        addressAr: '', addressEn: '', instagram: '', wifiName: '', wifiPass: ''
      },
      theme: { primary: '#c24d28', accent: '#e8b730', bg: '#fff8ee', text: '#33190f', radius: 'soft', layout: 'cards' },
      locale: { lang: 'ar', switcher: true, currencyEn: 'EGP', currencyAr: 'ج.م', pos: 'after', decimals: 0, digits: 'latin' },
      order: { enabled: true, whatsapp: '', countryCode: '20', askTable: true },
      publicUrl: '',
      categories: [],
      items: []
    };
  }

  function sampleData() {
    var d = emptyData();
    d.brand.nameAr = 'ركن القهوة';
    d.brand.nameEn = 'Qahwa Corner';
    d.brand.taglineAr = 'قهوة مختصة وحلويات طازجة';
    d.brand.taglineEn = 'Specialty coffee and fresh sweets';
    d.brand.addressAr = 'شارع فؤاد، الإسكندرية';
    d.brand.addressEn = 'Fouad St, Alexandria';
    d.brand.instagram = 'qahwa.corner';
    d.brand.wifiName = 'QahwaCorner';
    d.brand.wifiPass = 'coffee2026';
    var p = PRESETS[0];
    d.theme.primary = p.primary; d.theme.accent = p.accent; d.theme.bg = p.bg; d.theme.text = p.text;
    d.order.whatsapp = '01000000000';
    var cats = [
      ['hot', 'مشروبات ساخنة', 'Hot drinks', '☕'],
      ['cold', 'مشروبات باردة', 'Cold drinks', '🧊'],
      ['sweet', 'حلويات', 'Desserts', '🍰'],
      ['bites', 'خفيف', 'Light bites', '🥐']
    ];
    d.categories = cats.map(function (c) { return { id: c[0], nameAr: c[1], nameEn: c[2], icon: c[3], hidden: false }; });
    function it(id, cat, ar, en, dar, den, price, icon, tags, sizes) {
      return { id: id, cat: cat, nameAr: ar, nameEn: en, descAr: dar, descEn: den, price: price, icon: icon, image: '', tags: tags || [], soldOut: false, hidden: false, sizes: sizes || [] };
    }
    d.items = [
      it('i1', 'hot', 'إسبريسو', 'Espresso', 'شوت مركز من حبوب محمصة محلياً', 'A concentrated shot of locally roasted beans', 45, '☕', ['popular'], [{ ar: 'سينجل', en: 'Single', price: 45 }, { ar: 'دبل', en: 'Double', price: 65 }]),
      it('i2', 'hot', 'كابتشينو', 'Cappuccino', 'إسبريسو مع حليب مبخر ورغوة كثيفة', 'Espresso with steamed milk and thick foam', 70, '☕', [], [{ ar: 'وسط', en: 'Medium', price: 70 }, { ar: 'كبير', en: 'Large', price: 85 }]),
      it('i3', 'hot', 'لاتيه', 'Latte', 'حليب مخملي وإسبريسو ناعم', 'Silky milk and smooth espresso', 75, '🥛', [], [{ ar: 'وسط', en: 'Medium', price: 75 }, { ar: 'كبير', en: 'Large', price: 90 }]),
      it('i4', 'hot', 'شاي بالنعناع', 'Mint tea', 'نعناع طازج وشاي أخضر', 'Fresh mint and green tea', 35, '🍵', ['veg']),
      it('i5', 'hot', 'قهوة تركي', 'Turkish coffee', 'تقدم مع قطعة راحة', 'Served with a piece of delight', 40, '☕', ['popular']),
      it('i6', 'cold', 'آيس لاتيه', 'Iced latte', 'إسبريسو بارد مع حليب وثلج', 'Cold espresso with milk and ice', 80, '🧊', ['new']),
      it('i7', 'cold', 'عصير ليمون بالنعناع', 'Lemon mint', 'ليمون معصور ونعناع وثلج مجروش', 'Squeezed lemon, mint and crushed ice', 55, '🍋', ['veg']),
      it('i8', 'cold', 'موهيتو فراولة', 'Strawberry mojito', 'فراولة وليمون وصودا', 'Strawberry, lime and soda', 65, '🍓', []),
      it('i9', 'sweet', 'كنافة بالقشطة', 'Kunafa with cream', 'ساخنة مع شربات خفيف', 'Warm, with light syrup', 90, '🍮', ['popular']),
      it('i10', 'sweet', 'براونيز', 'Brownies', 'شوكولاتة داكنة وجوز', 'Dark chocolate and walnuts', 70, '🍫', []),
      it('i11', 'sweet', 'تشيز كيك', 'Cheesecake', 'قطعة بصوص التوت', 'A slice with berry sauce', 95, '🍰', ['new']),
      it('i12', 'bites', 'كرواسون جبنة', 'Cheese croissant', 'مخبوز كل صباح', 'Baked every morning', 60, '🥐', ['veg']),
      it('i13', 'bites', 'ساندويتش حلومي', 'Halloumi sandwich', 'جبنة حلومي وطماطم وزعتر', 'Halloumi, tomato and za\'atar', 85, '🥪', ['veg']),
      it('i14', 'bites', 'ساندويتش سجق حار', 'Spicy sausage sandwich', 'سجق إسكندراني على الطريقة المعروفة', 'Alexandrian sausage, the classic way', 95, '🌶️', ['spicy'])
    ];
    d.items[11].soldOut = false;
    d.items[9].soldOut = true;
    return d;
  }

  /* ---------- validation / import ---------- */
  function safeImage(v) {
    v = String(v || '');
    return /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length < 2500000 ? v : '';
  }
  function num(v, min, max, fallback) {
    var n = Number(v);
    if (!isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  /* Takes untrusted JSON, returns a clean, complete data object. Throws on non-menu input. */
  function normalizeData(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('not-an-object');
    if (!Array.isArray(input.items) && !Array.isArray(input.categories) && !input.brand) throw new Error('not-a-menu');
    var base = emptyData();
    var b = input.brand || {}, th = input.theme || {}, lo = input.locale || {}, or = input.order || {};
    var out = base;
    ['nameAr', 'nameEn', 'taglineAr', 'taglineEn', 'addressAr', 'addressEn', 'instagram', 'wifiName', 'wifiPass'].forEach(function (k) {
      if (b[k] !== undefined) out.brand[k] = str(b[k], 120);
    });
    out.brand.logo = safeImage(b.logo);
    out.brand.instagram = out.brand.instagram.replace(/^@/, '').replace(/[^\w.]/g, '');
    out.theme.primary = normHex(th.primary, base.theme.primary);
    out.theme.accent = normHex(th.accent, base.theme.accent);
    out.theme.bg = normHex(th.bg, base.theme.bg);
    out.theme.text = normHex(th.text, base.theme.text);
    out.theme.radius = RADII.indexOf(th.radius) >= 0 ? th.radius : base.theme.radius;
    out.theme.layout = LAYOUTS.indexOf(th.layout) >= 0 ? th.layout : base.theme.layout;
    out.locale.lang = lo.lang === 'en' ? 'en' : 'ar';
    out.locale.switcher = lo.switcher !== false;
    out.locale.currencyEn = lo.currencyEn !== undefined ? str(lo.currencyEn, 8) : base.locale.currencyEn;
    out.locale.currencyAr = lo.currencyAr !== undefined ? str(lo.currencyAr, 8) : base.locale.currencyAr;
    out.locale.pos = lo.pos === 'before' ? 'before' : 'after';
    out.locale.decimals = num(lo.decimals, 0, 2, 0) | 0;
    out.locale.digits = lo.digits === 'arabic' ? 'arabic' : 'latin';
    out.order.enabled = or.enabled !== false;
    out.order.whatsapp = str(or.whatsapp, 24).replace(/[^\d+\s-]/g, '');
    out.order.countryCode = str(or.countryCode === undefined ? base.order.countryCode : or.countryCode, 4).replace(/\D/g, '');
    out.order.askTable = or.askTable !== false;
    out.publicUrl = /^https?:\/\/[^\s]+$/i.test(String(input.publicUrl || '').trim()) ? String(input.publicUrl).trim().slice(0, 300) : '';

    var seen = {};
    function freshId(id, p) {
      id = str(id, 40).replace(/[^\w-]/g, '');
      if (!id || seen[id]) id = uid(p);
      seen[id] = 1;
      return id;
    }
    var catIds = {};
    (Array.isArray(input.categories) ? input.categories : []).slice(0, 60).forEach(function (c) {
      if (!c || typeof c !== 'object') return;
      var id = freshId(c.id, 'c');
      catIds[id] = 1;
      out.categories.push({ id: id, nameAr: str(c.nameAr, 60), nameEn: str(c.nameEn, 60), icon: str(c.icon, 8), hidden: !!c.hidden });
    });
    var itemSeen = {};
    (Array.isArray(input.items) ? input.items : []).slice(0, 600).forEach(function (i) {
      if (!i || typeof i !== 'object') return;
      var id = str(i.id, 40).replace(/[^\w-]/g, '');
      if (!id || itemSeen[id]) id = uid('i');
      itemSeen[id] = 1;
      var cat = String(i.cat || '');
      if (!catIds[cat]) {
        if (!out.categories.length) {
          out.categories.push({ id: 'general', nameAr: 'عام', nameEn: 'General', icon: '🍽️', hidden: false });
          catIds.general = 1;
        }
        cat = out.categories[0].id;
      }
      var sizes = (Array.isArray(i.sizes) ? i.sizes : []).slice(0, 4).map(function (s) {
        return s && typeof s === 'object' ? { ar: str(s.ar, 30), en: str(s.en, 30), price: num(s.price, 0, 1000000, 0) } : null;
      }).filter(Boolean);
      out.items.push({
        id: id, cat: cat,
        nameAr: str(i.nameAr, 80), nameEn: str(i.nameEn, 80),
        descAr: str(i.descAr, 300), descEn: str(i.descEn, 300),
        price: num(i.price, 0, 1000000, 0),
        icon: str(i.icon, 8), image: safeImage(i.image),
        tags: (Array.isArray(i.tags) ? i.tags : []).filter(function (t, k, a) { return TAGS.indexOf(t) >= 0 && a.indexOf(t) === k; }),
        soldOut: !!i.soldOut, hidden: !!i.hidden, sizes: sizes
      });
    });
    return out;
  }

  /* ---------- reading helpers ---------- */
  function pick(obj, base, lang) {
    var a = obj[base + 'Ar'] || '', e = obj[base + 'En'] || '';
    return lang === 'ar' ? (a || e) : (e || a);
  }
  function itemPriceInfo(item) {
    if (item.sizes && item.sizes.length) {
      var ps = item.sizes.map(function (s) { return s.price; });
      return { min: Math.min.apply(null, ps), max: Math.max.apply(null, ps), multi: item.sizes.length > 1 };
    }
    return { min: item.price, max: item.price, multi: false };
  }

  function filterItems(data, opts) {
    opts = opts || {};
    var q = normSearch(opts.q || '');
    return data.items.filter(function (it) {
      if (!opts.includeHidden && it.hidden) return false;
      var cat = data.categories.filter(function (c) { return c.id === it.cat; })[0];
      if (!cat || (!opts.includeHidden && cat.hidden)) return false;
      if (opts.cat && opts.cat !== it.cat) return false;
      if (opts.tags && opts.tags.length && !opts.tags.every(function (t) { return it.tags.indexOf(t) >= 0; })) return false;
      if (q) {
        var hay = normSearch([it.nameAr, it.nameEn, it.descAr, it.descEn].join(' '));
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function moveBy(arr, id, dir) {
    var i = -1;
    arr.forEach(function (x, k) { if (x.id === id) i = k; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return false;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    return true;
  }
  /* move an item up/down but only among items of the same category */
  function moveItemInCategory(items, id, dir) {
    var idx = -1;
    items.forEach(function (x, k) { if (x.id === id) idx = k; });
    if (idx < 0) return false;
    var cat = items[idx].cat, j = idx + dir;
    while (j >= 0 && j < items.length && items[j].cat !== cat) j += dir;
    if (j < 0 || j >= items.length) return false;
    var t = items[idx]; items[idx] = items[j]; items[j] = t;
    return true;
  }

  /* ---------- ordering ---------- */
  function cartLines(data, cart) {
    var lines = [];
    (cart || []).forEach(function (l) {
      var it = data.items.filter(function (x) { return x.id === l.id; })[0];
      if (!it || it.soldOut || it.hidden || !(l.qty > 0)) return;
      var size = it.sizes && it.sizes.length ? it.sizes[Math.max(0, Math.min(it.sizes.length - 1, l.v | 0))] : null;
      var price = size ? size.price : it.price;
      lines.push({ item: it, size: size, v: size ? l.v | 0 : -1, qty: Math.min(99, l.qty | 0), price: price, total: price * Math.min(99, l.qty | 0) });
    });
    return lines;
  }
  function cartTotal(data, cart) {
    return cartLines(data, cart).reduce(function (s, l) { return s + l.total; }, 0);
  }
  function cartAdd(cart, id, v, delta) {
    v = v === undefined ? -1 : v;
    var found = cart.filter(function (l) { return l.id === id && l.v === v; })[0];
    if (found) found.qty = Math.max(0, Math.min(99, found.qty + delta));
    else if (delta > 0) cart.push({ id: id, v: v, qty: Math.min(99, delta) });
    for (var k = cart.length - 1; k >= 0; k--) if (cart[k].qty <= 0) cart.splice(k, 1);
    return cart;
  }
  function buildOrderMessage(data, cart, lang, extra) {
    extra = extra || {};
    var lines = cartLines(data, cart);
    var shop = pick(data.brand, 'name', lang);
    var out = [];
    out.push(lang === 'ar' ? 'طلب جديد من ' + shop : 'New order from ' + shop);
    if (extra.table) out.push((lang === 'ar' ? 'رقم الطاولة: ' : 'Table: ') + str(extra.table, 20));
    if (extra.name) out.push((lang === 'ar' ? 'الاسم: ' : 'Name: ') + str(extra.name, 40));
    out.push('');
    lines.forEach(function (l) {
      var nm = pick(l.item, 'name', lang);
      var sz = l.size ? ' (' + (lang === 'ar' ? (l.size.ar || l.size.en) : (l.size.en || l.size.ar)) + ')' : '';
      out.push(l.qty + ' x ' + nm + sz + ' - ' + formatPrice(l.total, data.locale, lang));
    });
    out.push('');
    out.push((lang === 'ar' ? 'الإجمالي: ' : 'Total: ') + formatPrice(lines.reduce(function (s, l) { return s + l.total; }, 0), data.locale, lang));
    if (extra.note) { out.push(''); out.push((lang === 'ar' ? 'ملاحظات: ' : 'Notes: ') + str(extra.note, 300)); }
    return out.join('\n');
  }
  /* Phone to wa.me digits. Local numbers with one leading zero get the country code. */
  function waDigits(phone, countryCode) {
    var s = String(phone || '').replace(/[^\d+]/g, '');
    if (!s) return '';
    if (s.charAt(0) === '+') return s.slice(1);
    if (s.indexOf('00') === 0) return s.slice(2);
    if (s.charAt(0) === '0' && countryCode) return String(countryCode).replace(/\D/g, '') + s.slice(1);
    return s;
  }
  function whatsappLink(phone, countryCode, text) {
    var d = waDigits(phone, countryCode);
    if (d.length < 8) return '';
    return 'https://wa.me/' + d + '?text=' + encodeURIComponent(text);
  }

  /* ---------- audit ---------- */
  /* Returns a list of {level:'warn'|'info', code, n?} the shop owner should look at before printing QR codes. */
  function audit(data) {
    var out = [];
    var visible = data.items.filter(function (i) { return !i.hidden; });
    if (!visible.length) out.push({ level: 'warn', code: 'noItems' });
    var noAr = visible.filter(function (i) { return !i.nameAr.trim(); }).length;
    var noEn = visible.filter(function (i) { return !i.nameEn.trim(); }).length;
    if (noAr) out.push({ level: 'warn', code: 'missingAr', n: noAr });
    if (noEn) out.push({ level: 'warn', code: 'missingEn', n: noEn });
    var zero = visible.filter(function (i) { return !(i.sizes.length ? i.sizes.every(function (s) { return s.price > 0; }) : i.price > 0); }).length;
    if (zero) out.push({ level: 'warn', code: 'zeroPrice', n: zero });
    var emptyCats = data.categories.filter(function (c) { return !c.hidden && !data.items.some(function (i) { return i.cat === c.id && !i.hidden; }); }).length;
    if (emptyCats) out.push({ level: 'info', code: 'emptyCats', n: emptyCats });
    if (!data.brand.logo) out.push({ level: 'info', code: 'noLogo' });
    if (data.order.enabled && waDigits(data.order.whatsapp, data.order.countryCode).length < 8) out.push({ level: 'warn', code: 'noWhatsapp' });
    if (contrast(data.theme.bg, data.theme.text) < 4.5) out.push({ level: 'warn', code: 'lowContrast' });
    if (!data.publicUrl) out.push({ level: 'info', code: 'noPublicUrl' });
    if (!data.brand.nameAr.trim() || !data.brand.nameEn.trim()) out.push({ level: 'info', code: 'noName' });
    return out;
  }

  function stats(data) {
    var vis = data.items.filter(function (i) { return !i.hidden; });
    var prices = vis.map(function (i) { return itemPriceInfo(i).min; });
    return {
      items: data.items.length, visible: vis.length, categories: data.categories.length,
      soldOut: data.items.filter(function (i) { return i.soldOut; }).length,
      avg: prices.length ? prices.reduce(function (a, b) { return a + b; }, 0) / prices.length : 0
    };
  }

  /* Bulk price change: percent (e.g. 10 for +10%), rounded to step. */
  function bulkPrice(data, percent, step, catId) {
    step = step > 0 ? step : 1;
    function r(p) { return Math.max(0, Math.round(p * (1 + percent / 100) / step) * step); }
    var n = 0;
    data.items.forEach(function (it) {
      if (catId && it.cat !== catId) return;
      it.price = r(it.price);
      it.sizes.forEach(function (s) { s.price = r(s.price); });
      n++;
    });
    return n;
  }

  /* public URL of the customer menu page */
  function menuUrl(data, loc, tableNo) {
    var base = data.publicUrl || (loc.origin + loc.pathname.replace(/[^/]*$/, '') + 'menu.html');
    if (!tableNo) return base;
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + 't=' + encodeURIComponent(tableNo);
  }

  return {
    TAGS: TAGS, PRESETS: PRESETS, SCHEMA: SCHEMA,
    uid: uid, str: str, normHex: normHex, hexToRgb: hexToRgb, luminance: luminance, contrast: contrast,
    readableOn: readableOn, mix: mix, toDigits: toDigits, formatPrice: formatPrice, normSearch: normSearch,
    emptyData: emptyData, sampleData: sampleData, normalizeData: normalizeData, safeImage: safeImage,
    pick: pick, itemPriceInfo: itemPriceInfo, filterItems: filterItems, moveBy: moveBy, moveItemInCategory: moveItemInCategory,
    cartLines: cartLines, cartTotal: cartTotal, cartAdd: cartAdd, buildOrderMessage: buildOrderMessage,
    waDigits: waDigits, whatsappLink: whatsappLink, audit: audit, stats: stats, bulkPrice: bulkPrice, menuUrl: menuUrl
  };
});
