/* Medico Combine: print several small pathology tests on ONE page.
   Tick extra tests in the form -> they share the patient header, signatures and page,
   and the heading becomes "Topic 1 & Topic 2". Loads after index.html's script and plus.js. */
(function () {
'use strict';
var $ = function (s, r) { return (r || document).querySelector(s); };
var E = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var CMB = window.CMB = {};

/* ---------- helpers ---------- */
// Templates that can share a page: everything in the current tab except certificates and the prescription pad.
function options() {
  return (TEMPLATE_GROUPS[currentCategory] || []).filter(function (x) { return !/^(cert_|clinical_rx$)/.test(x.key); });
}
function canCombine(k) { return options().some(function (x) { return x.key === k; }); }
function noun() { return currentCategory === 'pathology' ? 'tests' : 'reports'; }
function labelOf(k) { var g = Object.keys(TEMPLATE_GROUPS).reduce(function (a, c) { return a.concat(TEMPLATE_GROUPS[c]); }, []).filter(function (x) { return x.key === k; })[0]; return g ? g.label : k; }
// Pathology: "ENDOCRINOLOGY - THYROID FUNCTION TEST (TFT)" -> "THYROID FUNCTION TEST (TFT)".  USG: "USG Thyroid Gland (x)" -> "USG Thyroid Gland".
function topic(k) {
  if (TEMPLATE_GROUPS.pathology.some(function (x) { return x.key === k; })) { var t = (TEMPLATES[k] || {}).title || k, i = t.indexOf(' - '); return i > 0 ? t.slice(i + 3) : t; }
  return labelOf(k).replace(/\s*\(.*?\)\s*$/, '');
}
// starting values for a test added as an extra (same as picking it from the dropdown)
function freshFields(k) {
  var f = JSON.parse(JSON.stringify(TEMPLATES[k].fields));
  if (k === 'usg_abdomen') ABD_ORGANS.forEach(function (o) { f[o.k] = o.def; });
  return f;
}
function extras() { return (formData && Array.isArray(formData.extras)) ? formData.extras : []; }
function joinTopics(a) { a = a.map(function (t) { return t.replace(/ & /g, ' and '); }); return a.length < 3 ? a.join(' & ') : a.slice(0, -1).join(', ') + ' & ' + a[a.length - 1]; }
function headingOf(key, data) {
  var ex = (data && Array.isArray(data.extras)) ? data.extras : [];
  if (!ex.length) return (data && data.title) || (TEMPLATES[key] || {}).title || '';
  var o = String(data.titleOverride || '').trim(); if (o) return o;
  return joinTopics([topic(key)].concat(ex.map(function (e) { return topic(e.k); })));
}
// used by the Saved Documents list so a combined report shows its full heading
CMB.titleOf = function (item) { try { var d = item.data; return d && d.extras && d.extras.length ? headingOf(item.templateKey, d) : null; } catch (e) { return null; } };

// Run fn while the app believes another test is the "current" one (so the existing renderers can be reused).
function withState(key, fields, fn) {
  var k0 = currentTemplateKey, f0 = formData.fields;
  currentTemplateKey = key; formData.fields = fields;
  try { return fn(); } finally { currentTemplateKey = k0; formData.fields = f0; }
}

/* ---------- styles ---------- */
var st = document.createElement('style');
st.textContent =
  '.cmb-card{background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:8px 10px;margin-top:12px;font-size:12px}' +
  '.cmb-list{display:grid;grid-template-columns:1fr 1fr;gap:1px 8px;max-height:10.5rem;overflow-y:auto;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:4px}' +
  '.cmb-list label{display:flex;gap:6px;align-items:flex-start;padding:2px 3px;border-radius:5px;cursor:pointer;font-size:11.5px;line-height:1.25}' +
  '.cmb-list label:hover{background:#e0f2fe}.cmb-list input{margin-top:2px;flex:none}' +
  '.cmb-x{font-size:11px;font-weight:600;color:#be123c;background:#fff1f2;border:1px solid #fecdd3;border-radius:6px;padding:1px 8px}' +
  '.cmb-h{font:700 11px Inter,Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#0b2545;background:#e8f7fb;border-left:4px solid #0e7490;padding:3px 8px;margin-bottom:4px;break-after:avoid}' +
  '.cmb-sec{break-inside:auto}';
document.head.appendChild(st);

/* ---------- form side ---------- */
// Build the input boxes of another test (reusing the existing form code) without disturbing the real form.
function fieldsHtml(key, fields) {
  var real = $('#form-fields-container'); if (!real) return '';
  var scratch = document.createElement('div');
  real.id = 'cmb-real'; scratch.id = 'form-fields-container'; real.parentNode.insertBefore(scratch, real);
  var html = '';
  try {
    withState(key, fields, function () { _renderFormFields(); applyPlaceholders(); });
    var last = scratch.lastElementChild; html = last ? last.innerHTML : '';
  } catch (e) { html = '<p class="text-rose-600">Could not load this test.</p>'; }
  finally { scratch.remove(); real.id = 'form-fields-container'; }
  // route typing in these boxes to this extra test instead of the main one
  return html.replace(/updateData\(\s*'fields'\s*,/g, "CMB.upd('" + key + "',")
             .replace(/toggleAbdOrgan\(\s*'(\w+)'\s*,/g, "CMB.abd('" + key + "','$1',");
}

function pickerHtml() {
  var items = options().filter(function (x) { return x.key !== currentTemplateKey; }).map(function (x) {
    return '<label data-s="' + E(x.label.toLowerCase()) + '"><input type="checkbox" data-k="' + x.key + '" onchange="CMB.toggle(this.dataset.k,this.checked)"><span>' + E(x.label) + '</span></label>';
  }).join('');
  return '<div class="flex items-center justify-between"><b class="text-xs text-cyan-900"><i class="fa-solid fa-layer-group"></i> Put more ' + noun() + ' on this same page</b><span id="cmb-n" class="text-[10px] font-bold text-emerald-700"></span></div>' +
    '<p class="text-[11px] text-slate-500 mt-0.5 mb-1.5">Tick the ' + noun() + ' to print together with this one. Saves paper. The heading becomes &ldquo;Topic 1 &amp; Topic 2&rdquo;.</p>' +
    '<input id="cmb-q" type="text" placeholder="Search..." oninput="CMB.filter(this.value)" class="w-full border border-slate-300 rounded p-1.5 text-xs mb-1.5 bg-white">' +
    '<div id="cmb-list" class="cmb-list">' + items + '</div>' +
    '<div id="cmb-title-wrap" class="mt-2" style="display:none"><label class="block text-[10px] text-slate-500 font-semibold">Page heading (leave empty for automatic)</label>' +
    '<input id="cmb-title" type="text" value="' + E(formData.titleOverride || '') + '" oninput="CMB.setTitle(this.value)" class="w-full border border-slate-300 rounded p-1.5 text-xs bg-white"></div>';
}

function refreshExtras() {
  var host = document.getElementById('cmb-extras'); if (!host) return;
  host.innerHTML = extras().map(function (e) {
    return '<div class="cmb-card" data-k="' + e.k + '"><div class="flex items-center justify-between mb-2"><b class="text-xs text-cyan-900"><i class="fa-solid fa-plus"></i> ' + E(topic(e.k)) + '</b>' +
      '<button type="button" class="cmb-x" onclick="CMB.toggle(\'' + e.k + '\',false)">Remove</button></div><div class="space-y-3 text-xs">' + fieldsHtml(e.k, e.f) + '</div></div>';
  }).join('');
  var on = {}; extras().forEach(function (e) { on[e.k] = 1; });
  document.querySelectorAll('#cmb-list input[type=checkbox]').forEach(function (cb) { cb.checked = !!on[cb.dataset.k]; });
  var n = document.getElementById('cmb-n'); if (n) n.textContent = extras().length ? extras().length + ' added' : '';
  var tw = document.getElementById('cmb-title-wrap'), ti = document.getElementById('cmb-title');
  if (tw) tw.style.display = extras().length ? '' : 'none';
  if (ti) ti.placeholder = headingOf(currentTemplateKey, Object.assign({}, formData, { titleOverride: '' }));
}

function buildUI() {
  var c = $('#form-fields-container'); if (!c) return;
  ['cmb-box', 'cmb-extras'].forEach(function (id) { var o = document.getElementById(id); if (o) o.remove(); });
  if (!canCombine(currentTemplateKey)) return;
  var box = document.createElement('div'); box.id = 'cmb-box'; box.className = 'cmb-card'; box.innerHTML = pickerHtml();
  var hdr = Array.prototype.filter.call(c.children, function (el) { return /^\s*2\.\s*Test/.test(el.textContent); })[0];
  c.insertBefore(box, hdr || c.children[1] || null);
  var host = document.createElement('div'); host.id = 'cmb-extras';
  c.insertBefore(host, document.getElementById('plus-ph') || null);
  refreshExtras();
}

CMB.filter = function (q) {
  q = String(q || '').toLowerCase().trim();
  document.querySelectorAll('#cmb-list label').forEach(function (l) { l.style.display = (!q || l.dataset.s.indexOf(q) >= 0) ? '' : 'none'; });
};
CMB.toggle = function (k, on) {
  if (!canCombine(k) || k === currentTemplateKey) return;
  if (!Array.isArray(formData.extras)) formData.extras = [];
  var has = formData.extras.some(function (e) { return e.k === k; });
  if (on && !has) formData.extras.push({ k: k, f: freshFields(k) });
  if (!on && has) formData.extras = formData.extras.filter(function (e) { return e.k !== k; });
  refreshExtras(); renderLivePreview();
};
CMB.upd = function (k, field, val) {
  var e = extras().filter(function (x) { return x.k === k; })[0]; if (!e) return;
  e.f[field] = val; renderLivePreview();
};
CMB.abd = function (k, organ, on) {   // organ checklist of an extra USG Abdomen report
  var e = extras().filter(function (x) { return x.k === k; })[0]; if (!e) return;
  e.f.sel = (e.f.sel || []).filter(function (x) { return x !== organ; }); if (on) e.f.sel.push(organ);
  refreshExtras(); renderLivePreview();
};
CMB.options = function () { return options().filter(function (x) { return x.key !== currentTemplateKey; }); };
CMB.noun = noun;
CMB.setTitle = function (v) { formData.titleOverride = v; renderLivePreview(); };

/* ---------- preview side ---------- */
function compose() {
  var body = $('#preview-body'), h = $('#preview-report-title'), ex = extras();
  var title = headingOf(currentTemplateKey, formData);
  if (h) { h.innerText = title; h.style.fontSize = title.length > 56 ? '15px' : ''; }
  if (!ex.length || !body) { fitPaper(); return; }
  var keys = [currentTemplateKey].concat(ex.map(function (e) { return e.k; }));
  var htmls = [body.innerHTML];
  ex.forEach(function (e) { htmls.push(withState(e.k, e.f, function () { _renderLivePreview(); return body.innerHTML; })); });
  body.innerHTML = '';
  var legend = false;
  htmls.forEach(function (html, i) {
    var wrap = document.createElement('div'); wrap.className = 'cmb-sec';
    var hd = document.createElement('div'); hd.className = 'cmb-h'; hd.textContent = topic(keys[i]);
    var inner = document.createElement('div'); inner.innerHTML = html;
    Array.prototype.forEach.call(inner.querySelectorAll('p'), function (p) { if (/^H = above range/.test(p.textContent)) { legend = true; p.remove(); } });
    wrap.appendChild(hd); wrap.appendChild(inner); body.appendChild(wrap);
  });
  if (legend) { var lg = document.createElement('p'); lg.className = 'mt-2 text-[10px] text-slate-400 font-sans'; lg.textContent = 'H = above range, L = below range. Only tests with a result entered are printed.'; body.appendChild(lg); }
  fitPaper();
}

/* ---------- hook into the app ---------- */
var prevRFF = window.renderFormFields;
window.renderFormFields = function () { prevRFF.apply(this, arguments); buildUI(); };
var prevLP = window.renderLivePreview;
window.renderLivePreview = function () { prevLP.apply(this, arguments); if (canCombine(currentTemplateKey)) compose(); };
var prevClear = window.clearFormInputs;
window.clearFormInputs = function () {
  extras().forEach(function (e) { e.f = freshFields(e.k); });
  prevClear.apply(this, arguments);
};
// changing the patient's gender can change which organs an extra Abdomen report offers
var prevSPG = window.setPatientGender;
window.setPatientGender = function () {
  prevSPG.apply(this, arguments);
  var ab = extras().filter(function (e) { return e.k === 'usg_abdomen'; });
  if (!ab.length) return;
  ab.forEach(function (e) { var ok = abdOrgans(e.f).map(function (o) { return o.k; }); e.f.sel = (e.f.sel || []).filter(function (x) { return ok.indexOf(x) >= 0; }); });
  refreshExtras(); renderLivePreview();
};
})();
