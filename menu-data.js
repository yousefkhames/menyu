/* Published menu. Edit in the builder (#/edit), use Export, then replace this file and commit it.
   Everything below is DEMO sample content with fictional prices. Replace it before real use. */
window.MENU_DATA = {
  "v": 1,
  "demo": true,
  "shop": { "ar": "مقهى تجريبي", "en": "Demo Cafe" },
  "currency": "ج.م",
  "categories": [
    { "id": "c1", "name": { "ar": "مشروبات ساخنة", "en": "Hot drinks" } },
    { "id": "c2", "name": { "ar": "مشروبات باردة", "en": "Cold drinks" } },
    { "id": "c3", "name": { "ar": "حلويات", "en": "Sweets" } }
  ],
  "items": [
    { "id": "i1", "cat": "c1", "name": { "ar": "قهوة تركي", "en": "Turkish coffee" }, "desc": { "ar": "عينة تجريبية", "en": "Sample item" }, "price": 40, "tags": [], "soldOut": false, "demo": true },
    { "id": "i2", "cat": "c1", "name": { "ar": "شاي بالنعناع", "en": "Mint tea" }, "desc": { "ar": "عينة تجريبية", "en": "Sample item" }, "price": 25, "tags": ["vegan"], "soldOut": false, "demo": true },
    { "id": "i3", "cat": "c2", "name": { "ar": "عصير ليمون", "en": "Lemonade" }, "desc": { "ar": "عينة تجريبية", "en": "Sample item" }, "price": 35, "tags": ["vegan"], "soldOut": false, "demo": true },
    { "id": "i4", "cat": "c2", "name": { "ar": "آيس كوفي", "en": "Iced coffee" }, "desc": { "ar": "عينة تجريبية", "en": "Sample item" }, "price": 55, "tags": ["new"], "soldOut": true, "demo": true },
    { "id": "i5", "cat": "c3", "name": { "ar": "بسبوسة", "en": "Basbousa" }, "desc": { "ar": "عينة تجريبية", "en": "Sample item" }, "price": 45, "tags": [], "soldOut": false, "demo": true }
  ]
};
