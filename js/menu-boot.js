/* Boots the customer menu page: embedded data (standalone export) > preview (localStorage) > menu.json > localStorage > sample */
(function () {
  'use strict';
  var C = window.MenyuCore, KEY = 'menyu.data.v1';
  var params = new URLSearchParams(location.search);
  var preview = !!params.get('preview');
  function fromLS() {
    try { var r = localStorage.getItem(KEY); return r ? C.normalizeData(JSON.parse(r)) : null; } catch (e) { return null; }
  }
  function load() {
    if (window.MENYU_DATA) return Promise.resolve(C.normalizeData(window.MENYU_DATA));
    if (preview) return Promise.resolve(fromLS() || C.sampleData());
    return fetch('menu.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('no menu.json');
      return r.json();
    }).then(C.normalizeData).catch(function () { return fromLS() || C.sampleData(); });
  }
  load().then(function (data) {
    var v = window.MenyuViewer.mount(document.getElementById('app'), data, {});
    if (preview) window.addEventListener('storage', function (e) {
      if (e.key === KEY) { var d = fromLS(); if (d) v.update(d); }
    });
  }).catch(function (e) {
    document.getElementById('app').textContent = 'Could not load the menu / تعذر تحميل القائمة';
    if (window.console) console.error(e);
  });
})();
