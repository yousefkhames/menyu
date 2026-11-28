/* MIT · Copyright (c) 2026 Yousef Khames · UI strings as [Arabic, English]. Menu content is edited by the owner in the builder. */
(function (root) {
  'use strict';
  Object.assign(root.Kit.dict, {
    title: ['منيو', 'menyu'], menu: ['القائمة', 'Menu'], edit: ['المنشئ', 'Builder'], qr: ['كود QR', 'QR code'],
    search: ['ابحث في القائمة', 'Search the menu'], all: ['الكل', 'All'], soldOut: ['نفد', 'Sold out'],
    noItems: ['لا توجد أصناف.', 'No items.'], noPrice: ['اسأل عن السعر', 'Ask for the price'],
    demoBanner: ['قائمة تجريبية: الأصناف والأسعار عينات وهمية.', 'Demo menu: items and prices are fictional samples.'],
    demoTag: ['تجريبي', 'Demo'], draftBanner: ['معاينة المسودة على هذا الجهاز فقط. الزوار لا يرونها قبل النشر.', 'Draft preview on this device only. Visitors do not see it until you publish.'],
    viewPublished: ['القائمة المنشورة', 'Published menu'], viewDraft: ['معاينة المسودة', 'Preview draft'],
    shopAr: ['اسم المكان بالعربية', 'Shop name (Arabic)'], shopEn: ['اسم المكان بالإنجليزية', 'Shop name (English)'],
    currency: ['العملة', 'Currency label'], categories: ['الأقسام', 'Categories'], addCat: ['إضافة قسم', 'Add category'],
    catAr: ['اسم القسم (عربي)', 'Category (Arabic)'], catEn: ['اسم القسم (إنجليزي)', 'Category (English)'],
    items: ['الأصناف', 'Items'], addItem: ['إضافة صنف', 'Add item'], editItem: ['تعديل الصنف', 'Edit item'],
    nameAr: ['الاسم (عربي)', 'Name (Arabic)'], nameEn: ['الاسم (إنجليزي)', 'Name (English)'],
    descAr: ['الوصف (عربي)', 'Description (Arabic)'], descEn: ['الوصف (إنجليزي)', 'Description (English)'],
    priceF: ['السعر', 'Price'], category: ['القسم', 'Category'], tags: ['وسوم', 'Tags'], photo: ['صورة (اختياري)', 'Photo (optional)'],
    removePhoto: ['إزالة الصورة', 'Remove photo'], soldOutF: ['نفد من المخزون', 'Sold out'],
    save: ['حفظ', 'Save'], cancel: ['إلغاء', 'Cancel'], del: ['حذف', 'Delete'], up: ['أعلى', 'Up'], down: ['أسفل', 'Down'],
    tag_new: ['جديد', 'New'], tag_vegan: ['نباتي', 'Vegan'], tag_spicy: ['حار', 'Spicy'], tag_popular: ['الأكثر طلبًا', 'Popular'],
    exportData: ['تصدير menu-data.js للنشر', 'Export menu-data.js to publish'], exportJson: ['تصدير نسخة JSON', 'Export JSON backup'],
    exportHtml: ['تصدير صفحة واحدة HTML', 'Export single-file HTML'], importJson: ['استيراد JSON', 'Import JSON'],
    clearDemo: ['حذف الأصناف التجريبية', 'Clear demo items'], resetAll: ['مسح المسودة والبدء من القائمة المنشورة', 'Discard draft and restart from published menu'],
    confirmReset: ['سيتم مسح المسودة على هذا الجهاز. متابعة؟', 'This discards the draft on this device. Continue?'],
    confirmDel: ['حذف هذا العنصر؟', 'Delete this entry?'], saved: ['تم الحفظ على هذا الجهاز', 'Saved on this device'],
    imported: ['تم الاستيراد', 'Imported'], importFail: ['ملف غير صالح', 'Invalid file'], importNewer: ['الملف من إصدار أحدث', 'File is from a newer version'],
    needName: ['اكتب اسم الصنف بإحدى اللغتين', 'Enter an item name in at least one language'],
    blocked: ['بيانات المسودة غير قابلة للقراءة، ولن يتم الكتابة فوقها حتى تمسحها يدويًا.', 'Stored draft is unreadable and will not be overwritten until you reset it.'],
    publishHelp: ['للنشر: صدّر menu-data.js، استبدل الملف في المستودع، ثم ارفعه. الإعدادات هنا محلية ولا تظهر للزوار.', 'To publish: export menu-data.js, replace the file in the repository and commit. Edits here are local and visitors do not see them.'],
    statsLine: ['{c} قسم، {i} صنف، {s} نفد، {p} بدون سعر', '{c} categories, {i} items, {s} sold out, {p} without price'],
    qrUrl: ['رابط القائمة المنشورة', 'Published menu link'], qrHelp: ['الصق رابط الصفحة بعد النشر. الكود يُنشأ على جهازك دون إنترنت.', 'Paste the page link after publishing. The code is generated on your device, offline.'],
    qrCard: ['بطاقة الطاولة', 'Table card'], print: ['طباعة', 'Print'], scan: ['امسح لعرض القائمة', 'Scan to see the menu'],
    qrNote: ['جرّب المسح بهاتف قبل الطباعة.', 'Test-scan with a phone before printing.'],
    qrLocal: ['هذا الرابط محلي ولن يعمل لضيوفك. استخدم الرابط المنشور.', 'This is a local link and will not work for guests. Use the published link.'],
    demoMenuF: ['القائمة تجريبية', 'This menu is demo content'], lang: ['EN', 'عربي'], skip: ['انتقل للمحتوى', 'Skip to content']
  });
})(globalThis);
