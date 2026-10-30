/* Medico Mobile: phone-only polish (<= 640px). Desktop layout is untouched.
   1. Test / report type picker opens as a half-page bottom sheet in the site's own style
   2. "Add more tests to this page" opens the same kind of sheet (tick several, press Done)
   3. Preview zoom (Fit <-> Actual size) so the report is readable
   4. Floating "Preview" / "Edit" button to jump between the form and the report
   5. Patient fields in one column. Loads after plus.js and combine.js. */
(function () {
'use strict';
var $ = function (s, r) { return (r || document).querySelector(s); };
var E = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var MB = window.MB = {};

/* ---------- styles ---------- */
var st = document.createElement('style');
st.textContent = [
  '#mb-pick,#cmb-open,#mb-jump,#mb-zoom{display:none}',
  '.mb-ov{position:fixed;inset:0;z-index:2100;background:rgba(11,37,69,.55);backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;animation:mb-fade .2s ease}',
  '@keyframes mb-fade{from{opacity:0}to{opacity:1}}@keyframes mb-up{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}',
  '.mb-sheet{background:#fff;width:100%;max-width:520px;max-height:50vh;max-height:50dvh;display:flex;flex-direction:column;border-radius:20px 20px 0 0;overflow:hidden;animation:mb-up .26s cubic-bezier(.2,.8,.2,1);padding-bottom:env(safe-area-inset-bottom);font-family:Inter,system-ui,sans-serif}',
  '.mb-hd{background:#0b2545;color:#fff;display:flex;align-items:center;gap:10px;padding:12px 14px;flex:none}',
  '.mb-hd i.mb-ic{color:#a5f3fc}.mb-hd b{flex:1;font-size:14px;font-weight:700;letter-spacing:.01em;line-height:1.2}.mb-hd small{display:block;font-size:11px;font-weight:500;color:#a5f3fc;margin-top:1px}',
  '.mb-x{border:0;cursor:pointer;width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.12);color:#fff;font-size:15px;flex:none}',
  '.mb-q{flex:none;padding:8px 12px;border-bottom:1px solid #e5eaf1;background:#f8fafc}',
  '.mb-q input{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:9px 12px;font-size:16px;background:#fff;outline:none}.mb-q input:focus{border-color:#0284c7}',
  '.mb-list{overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch}',
  '.mb-it{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:13px 16px;border:0;border-bottom:1px solid #eef2f7;font-family:inherit;cursor:pointer;font-size:14px;font-weight:500;color:#0f172a;line-height:1.3;background:#fff}',
  '.mb-it:active{background:#f0f7ff}.mb-it>span:not(.mb-box){flex:1}',
  '.mb-it.on{background:#e0effe;color:#075985;font-weight:700}.mb-it .mb-ck{color:#0284c7;font-size:13px;width:16px;text-align:center;flex:none}',
  '.mb-box{width:20px;height:20px;border-radius:6px;border:2px solid #94a3b8;background:#fff;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px}',
  '.mb-it.on .mb-box{background:#0284c7;border-color:#0284c7}',
  '.mb-ft{flex:none;padding:10px 12px;border-top:1px solid #e5eaf1;background:#fff}',
  '.mb-done{border:0;cursor:pointer;font-family:inherit;width:100%;background:#0284c7;color:#fff;font-weight:700;font-size:14px;border-radius:12px;padding:12px}.mb-done:active{background:#0369a1}',
  '.mb-empty{padding:22px 16px;text-align:center;color:#94a3b8;font-size:13px}',
  '@media screen and (max-width:640px){',
  '#template-select{display:none!important}',
  '#mb-pick,#cmb-open{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:46px;padding:10px 12px;border-radius:10px;border:1px solid #cbd5e1;background:#f8fafc;color:#0f172a;font-size:14px;font-weight:600;text-align:left}',
  '#mb-pick span,#cmb-open span{flex:1;line-height:1.25}#mb-pick i,#cmb-open i{color:#0284c7;font-size:12px}',
  '#cmb-open{background:#fff;margin-top:6px}',
  '#cmb-list,#cmb-q{display:none!important}',
  '#form-fields-container>.grid.grid-cols-2{grid-template-columns:minmax(0,1fr)!important}',
  '#form-fields-container>.grid.grid-cols-2>.col-span-2{grid-column:auto!important}',
  '#mb-zoom{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#075985;background:#e0effe;border-radius:999px;padding:5px 11px}',
  '#mb-jump{display:flex;align-items:center;gap:7px;position:fixed;right:12px;bottom:calc(88px + env(safe-area-inset-bottom));z-index:45;background:#0b2545;color:#fff;font-size:12.5px;font-weight:700;border-radius:999px;padding:10px 16px;box-shadow:0 8px 20px -6px rgba(11,37,69,.55)}',
  '#mb-jump i{color:#a5f3fc}',
  '}',
  '@media print{#mb-jump,.mb-ov{display:none!important}}'
].join('');
document.head.appendChild(st);

/* ---------- generic half-page sheet ---------- */
var openOv = null;
function closeSheet() { if (openOv) { openOv.remove(); openOv = null; document.body.style.overflow = ''; } }
function sheet(o) {   // o: {title, sub, items:[{k,label,on}], multi, onPick(k), onToggle(k,on), doneLabel}
  closeSheet();
  var ov = document.createElement('div'); ov.className = 'mb-ov no-print';
  var searchable = o.items.length > 7;
  ov.innerHTML = '<div class="mb-sheet" role="dialog" aria-modal="true">' +
    '<div class="mb-hd"><i class="fa-solid ' + (o.icon || 'fa-file-medical') + ' mb-ic"></i><b>' + E(o.title) + (o.sub ? '<small>' + E(o.sub) + '</small>' : '') + '</b><button type="button" class="mb-x" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
    (searchable ? '<div class="mb-q"><input type="text" placeholder="Search..." autocomplete="off"></div>' : '') +
    '<div class="mb-list"></div>' +
    (o.multi ? '<div class="mb-ft"><button type="button" class="mb-done"></button></div>' : '') + '</div>';
  document.body.appendChild(ov); document.body.style.overflow = 'hidden'; openOv = ov;
  var list = $('.mb-list', ov), done = $('.mb-done', ov), q = $('.mb-q input', ov);
  function count() { return o.items.filter(function (i) { return i.on; }).length; }
  function paintDone() { if (done) done.textContent = (o.doneLabel || 'Done') + (count() ? ' (' + count() + ' added)' : ''); }
  function paint() {
    var t = q ? q.value.toLowerCase().trim() : '';
    var rows = o.items.filter(function (i) { return !t || i.label.toLowerCase().indexOf(t) >= 0; });
    list.innerHTML = rows.length ? rows.map(function (i) {
      return '<button type="button" class="mb-it' + (i.on ? ' on' : '') + '" data-k="' + E(i.k) + '">' +
        (o.multi ? '<span class="mb-box">' + (i.on ? '<i class="fa-solid fa-check"></i>' : '') + '</span>' : '') +
        '<span>' + E(i.label) + '</span>' +
        (!o.multi && i.on ? '<i class="fa-solid fa-check mb-ck"></i>' : '') + '</button>';
    }).join('') : '<div class="mb-empty">No tests match.</div>';
  }
  paint(); paintDone();
  var cur = $('.mb-it.on', list); if (cur && !o.multi) cur.scrollIntoView({ block: 'center' });
  if (q) q.addEventListener('input', paint);
  list.addEventListener('click', function (e) {
    var b = e.target.closest('.mb-it'); if (!b) return;
    var k = b.getAttribute('data-k'), it = o.items.filter(function (i) { return i.k === k; })[0];
    if (o.multi) { it.on = !it.on; o.onToggle(k, it.on); paint(); paintDone(); }
    else { closeSheet(); o.onPick(k); }
  });
  $('.mb-x', ov).onclick = closeSheet; if (done) done.onclick = closeSheet;
  ov.addEventListener('mousedown', function (e) { if (e.target === ov) closeSheet(); });
  ov.addEventListener('touchstart', function (e) { if (e.target === ov) closeSheet(); }, { passive: true });
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

/* ---------- 1. template / report type picker ---------- */
function labelOfKey(k) {
  var all = Object.keys(TEMPLATE_GROUPS).reduce(function (a, c) { return a.concat(TEMPLATE_GROUPS[c]); }, []);
  var g = all.filter(function (x) { return x.key === k; })[0]; return g ? g.label : k;
}
MB.pickTemplate = function () {
  var cat = TEMPLATE_GROUPS[currentCategory] || [];
  sheet({
    title: 'Select Medical Template', sub: ({ usg: 'USG & Clinical', pathology: 'Pathology Lab', rx: 'Prescription' })[currentCategory] || '',
    items: cat.map(function (x) { return { k: x.key, label: x.label, on: x.key === currentTemplateKey }; }),
    onPick: function (k) { var s = $('#template-select'); if (s) s.value = k; switchTemplate(k); }
  });
};
function ensurePickButton() {
  var s = $('#template-select'); if (!s) return;
  var b = $('#mb-pick');
  if (!b) {
    b = document.createElement('button'); b.id = 'mb-pick'; b.type = 'button'; b.onclick = MB.pickTemplate;
    b.innerHTML = '<span></span><i class="fa-solid fa-chevron-down"></i>';
    s.parentNode.insertBefore(b, s.nextSibling);
  }
  $('span', b).textContent = labelOfKey(currentTemplateKey);
}

/* ---------- 2. "add more tests" picker ---------- */
MB.pickExtras = function () {
  var have = {}; ((formData && formData.extras) || []).forEach(function (e) { have[e.k] = 1; });
  sheet({
    title: 'Add more ' + CMB.noun() + ' to this page', sub: 'Tick all you want, then press Done', icon: 'fa-layer-group', multi: true, doneLabel: 'Done',
    items: CMB.options().map(function (x) { return { k: x.key, label: x.label, on: !!have[x.key] }; }),
    onToggle: function (k, on) { CMB.toggle(k, on); }
  });
};
function ensureExtrasButton() {
  var list = $('#cmb-list'); if (!list || $('#cmb-open')) return;
  var b = document.createElement('button'); b.id = 'cmb-open'; b.type = 'button'; b.onclick = MB.pickExtras;
  b.innerHTML = '<span>Choose to add&hellip;</span><i class="fa-solid fa-chevron-up"></i>';
  list.parentNode.insertBefore(b, list);
}

/* ---------- 3. preview zoom ---------- */
var zoomed = false;
var oScale = window.scalePreview;
window.scalePreview = function () {
  oScale.apply(this, arguments);
  var wrap = $('#paper-scale'), box = $('#paper-box'); if (!wrap || !box) return;
  var sec = wrap.parentElement, phone = window.matchMedia('(max-width:640px)').matches;
  if (zoomed && phone) {
    box.style.transform = 'scale(1)'; wrap.style.width = box.offsetWidth + 'px'; wrap.style.height = box.offsetHeight + 'px';
    sec.style.overflowX = 'auto'; sec.style.alignItems = 'flex-start';
  } else { sec.style.overflowX = ''; sec.style.alignItems = ''; }
};
MB.zoom = function () {
  zoomed = !zoomed; var z = $('#mb-zoom'); if (z) z.innerHTML = zoomed ? '<i class="fa-solid fa-magnifying-glass-minus"></i> Fit' : '<i class="fa-solid fa-magnifying-glass-plus"></i> Zoom';
  scalePreview();
};
function ensureZoom() {
  if ($('#mb-zoom')) return;
  var hdr = $('#paper-scale') && $('#paper-scale').parentElement.firstElementChild; if (!hdr) return;
  var b = document.createElement('button'); b.id = 'mb-zoom'; b.type = 'button'; b.onclick = MB.zoom;
  b.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i> Zoom';
  hdr.appendChild(b);
}

/* ---------- 4. jump between form and preview ---------- */
function ensureJump() {
  if ($('#mb-jump')) return;
  var j = document.createElement('button'); j.id = 'mb-jump'; j.type = 'button'; j.className = 'no-print';
  document.body.appendChild(j);
  var previewSec = function () { var w = $('#paper-scale'); return w && w.parentElement; };
  function atPreview() { var p = previewSec(); return p && p.getBoundingClientRect().top < window.innerHeight * 0.45; }
  function paint() { j.innerHTML = atPreview() ? '<i class="fa-solid fa-pen-to-square"></i> Edit' : '<i class="fa-solid fa-eye"></i> Preview'; }
  j.onclick = function () {
    if (atPreview()) { var m = $('main'); if (m) window.scrollTo({ top: Math.max(0, m.offsetTop - 60), behavior: 'smooth' }); }
    else { var p = previewSec(); if (p) window.scrollTo({ top: p.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' }); }
  };
  window.addEventListener('scroll', paint, { passive: true }); window.addEventListener('resize', paint); paint();
}

/* ---------- hook in ---------- */
var prevRFF = window.renderFormFields;
window.renderFormFields = function () { prevRFF.apply(this, arguments); ensurePickButton(); ensureExtrasButton(); };
window.addEventListener('resize', function () { if (typeof scalePreview === 'function') scalePreview(); });
function init() { ensurePickButton(); ensureZoom(); ensureJump(); }
if (document.readyState === 'complete') init(); else window.addEventListener('load', function () { setTimeout(init, 0); });
})();
