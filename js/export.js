/* Menyu export helpers: QR as SVG/PNG, standalone menu.html builder, downloads. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./vendor/qrcode.js'));
  else root.MenyuExport = factory(root.MenyuCore, root.qrcode);
})(typeof self !== 'undefined' ? self : this, function (C, qrcode) {
  'use strict';

  /* Build a QR matrix and render as a crisp SVG string (one path, no external libs at render time). */
  function qrMatrix(text) {
    var qr = qrcode(0, 'M');
    qr.addData(text, 'Byte');
    qr.make();
    var n = qr.getModuleCount(), rows = [];
    for (var r = 0; r < n; r++) {
      var row = [];
      for (var c = 0; c < n; c++) row.push(qr.isDark(r, c));
      rows.push(row);
    }
    return rows;
  }
  function qrSvg(text, opts) {
    opts = opts || {};
    var fg = C.normHex(opts.fg, '#000000'), bg = opts.bg === 'none' ? 'none' : C.normHex(opts.bg, '#ffffff');
    var margin = opts.margin === undefined ? 4 : opts.margin;
    var m = qrMatrix(text), n = m.length, size = n + margin * 2, d = '';
    for (var r = 0; r < n; r++) {
      var c = 0;
      while (c < n) {
        if (m[r][c]) {
          var s = c;
          while (c < n && m[r][c]) c++;
          d += 'M' + (s + margin) + ' ' + (r + margin) + 'h' + (c - s) + 'v1h-' + (c - s) + 'z';
        } else c++;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges" role="img" aria-label="QR code">' +
      (bg === 'none' ? '' : '<rect width="' + size + '" height="' + size + '" fill="' + bg + '"/>') +
      '<path d="' + d + '" fill="' + fg + '"/></svg>';
  }

  function escapeJsonForScript(json) {
    return json.replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }

  function b64(buf) {
    var bin = '', bytes = new Uint8Array(buf), chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return btoa(bin);
  }

  /* Pure assembly step (testable): pieces in, one self-contained HTML string out. */
  function assembleStandalone(pieces, data) {
    var json = escapeJsonForScript(JSON.stringify(data));
    var title = (C.pick(data.brand, 'name', data.locale.lang) || 'Menu').replace(/[<&>"]/g, '');
    return '<!doctype html>\n<html lang="' + data.locale.lang + '" dir="' + (data.locale.lang === 'ar' ? 'rtl' : 'ltr') + '">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<meta name="theme-color" content="' + data.theme.primary + '">\n<title>' + title + '</title>\n' +
      '<style>' + pieces.css + '</style>\n</head>\n<body class="mv-page">\n<div id="app" class="mv"></div>\n' +
      '<script>window.MENYU_DATA=' + json + ';<\/script>\n' +
      '<script>' + pieces.core.replace(/<\/script/gi, '<\\/script') + '<\/script>\n' +
      '<script>' + pieces.viewer.replace(/<\/script/gi, '<\\/script') + '<\/script>\n' +
      '<script>' + pieces.boot.replace(/<\/script/gi, '<\\/script') + '<\/script>\n</body>\n</html>\n';
  }

  /* Browser step: fetch the app's own files (same origin) and inline them, fonts included. */
  function buildStandalone(data, base) {
    base = base || '';
    function get(p, bin) { return fetch(base + p).then(function (r) { if (!r.ok) throw new Error(p); return bin ? r.arrayBuffer() : r.text(); }); }
    return Promise.all([get('css/fonts.css'), get('css/viewer.css'), get('js/core.js'), get('js/viewer.js'), get('js/menu-boot.js')]).then(function (r) {
      var fontsCss = r[0], urls = [];
      fontsCss.replace(/url\(\.\.\/(fonts\/[^)]+)\)/g, function (m, p) { if (urls.indexOf(p) < 0) urls.push(p); return m; });
      return Promise.all(urls.map(function (p) { return get(p, true).then(function (b) { return [p, b64(b)]; }); })).then(function (fonts) {
        fonts.forEach(function (f) { fontsCss = fontsCss.split('url(../' + f[0] + ')').join('url(data:font/woff2;base64,' + f[1] + ')'); });
        return assembleStandalone({ css: fontsCss + '\n' + r[1], core: r[2], viewer: r[3], boot: r[4] }, data);
      });
    });
  }

  function download(filename, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'application/octet-stream' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function svgToPngBlob(svg, px) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement('canvas');
        cv.width = cv.height = px;
        var ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, px, px);
        cv.toBlob(function (b) { b ? resolve(b) : reject(new Error('png')); }, 'image/png');
      };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  /* Resize an uploaded image to a data URL. */
  function fileToDataUrl(file, maxSide, type, quality) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('not-image'));
      if (file.type === 'image/svg+xml') {
        if (file.size > 150000) return reject(new Error('svg-too-big'));
        var fr = new FileReader();
        fr.onload = function () { resolve(String(fr.result)); };
        fr.onerror = reject;
        return fr.readAsDataURL(file);
      }
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        var ctx = cv.getContext('2d');
        if (type === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(cv.toDataURL(type, quality));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  return { qrMatrix: qrMatrix, qrSvg: qrSvg, assembleStandalone: assembleStandalone, buildStandalone: buildStandalone, download: download, svgToPngBlob: svgToPngBlob, fileToDataUrl: fileToDataUrl };
});
