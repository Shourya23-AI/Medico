/* Medico Plus: templates, patients, wording, bills, reminders, summary, backup nudge, draft, 3-hour lock */
(function () {
'use strict';
var $ = function (s, r) { return (r || document).querySelector(s); };
var E = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var z = function (n) { return String(n).padStart(2, '0'); };
var LS = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
};
var enc = function (k) { return encodeURIComponent(k).replace(/'/g, '%27'); };
var HOURS = 3, KEY = 'medico_unlock_v1', TKEY = 'medico_unlock_ts_v1';

/* ---------- 1. New templates ---------- */
var N = 'Normal.';
var TXT = {
  usg_kub: { g: 'USG KUB (Kidney, Ureter, Bladder)', title: 'ULTRASOUND OF KIDNEYS, URETERS & URINARY BLADDER (KUB)', sec: [
    ['rtKidney', 'Right Kidney', 'Right kidney is normal in size, shape & position. Cortical thickness and echogenicity normal. No calculus, mass or hydronephrosis.'],
    ['ltKidney', 'Left Kidney', 'Left kidney is normal in size, shape & position. Cortical thickness and echogenicity normal. No calculus, mass or hydronephrosis.'],
    ['ureters', 'Ureters', 'Visualised portions of both ureters are not dilated.'],
    ['ub', 'Urinary Bladder', 'Urinary bladder is normal and adequately distended. Wall is smooth. No calculus or mass.'],
    ['prostate', 'Prostate (male)', ''],
    ['pvr', 'Post-void residual', '', 1],
    ['impression', 'Impression', 'Both kidneys, ureters and urinary bladder are normal on this ultrasound study.']] },
  usg_pelvis: { g: 'USG Pelvis only', title: 'ULTRASOUND OF THE PELVIS', sec: [
    ['uterus', 'Uterus', 'Uterus is anteverted and normal in size, shape and echotexture. No myometrial mass.'],
    ['endo', 'Endometrium / Cavity', 'Endometrial thickness is normal. Endometrial cavity is empty.'],
    ['ovaries', 'Ovaries', 'Both ovaries are normal in size and echotexture. No cyst or mass seen.'],
    ['fluid', 'Pouch of Douglas / Adnexa', 'No free fluid in the pouch of Douglas. No adnexal mass.'],
    ['ub', 'Urinary Bladder', 'Urinary bladder is normal and adequately distended.'],
    ['impression', 'Impression', 'Normal pelvic ultrasound study.']] },
  usg_anomaly: { g: 'USG Obstetric Anomaly Scan', title: 'OBSTETRIC ULTRASOUND - ANOMALY (TARGETED) SCAN', sec: [
    ['presentation', 'Number / Lie / Presentation', 'Single live intrauterine fetus.'],
    ['fhr', 'Fetal heart rate', '', 1], ['ga', 'Gestational age (USG)', '', 1],
    ['bpd', 'BPD (cm)', '', 1], ['hc', 'HC (cm)', '', 1], ['ac', 'AC (cm)', '', 1], ['fl', 'FL (cm)', '', 1],
    ['efw', 'Est. fetal weight (g)', '', 1], ['edd', 'EDD', '', 1],
    ['placenta', 'Placenta', 'Placenta is normal in position and structure. Grade 0. Cord shows three vessels.'],
    ['liquor', 'Amniotic fluid', 'Adequate. AFI within normal limits.'],
    ['cervix', 'Cervix / Internal os', 'Cervix is of normal length. Internal os is closed.'],
    ['head', 'Head & Brain', 'Skull contour and midline falx normal. Lateral ventricles, cavum septum pellucidum, cerebellum and cisterna magna normal.'],
    ['face', 'Face & Neck', 'Orbits, nose, lips and profile normal. No nuchal swelling.'],
    ['spine', 'Spine', 'Visualised spine appears intact. No open defect seen.'],
    ['chest', 'Thorax & Heart', 'Lungs normal. Four-chamber view and outflow tracts normal. Heart in normal position.'],
    ['abdomen', 'Abdomen & GI tract', 'Stomach bubble seen on left. Abdominal wall intact with normal cord insertion.'],
    ['renal', 'Kidneys & Bladder', 'Both kidneys and urinary bladder seen and normal. No hydronephrosis.'],
    ['limbs', 'Limbs', 'All four limbs and extremities seen with normal long bones.'],
    ['genitalia', 'Genitalia', '', 1], ['sex', 'Fetal sex disclosure', 'Not disclosed as per law.', 1],
    ['impression', 'Impression', 'Single live intrauterine fetus. No gross structural anomaly detected on this scan.'],
    ['advice', 'Advice', 'Note: Ultrasound cannot detect all anomalies. Clinical correlation advised.']] },
  ecg: { g: 'ECG Report', title: 'ELECTROCARDIOGRAM (ECG) REPORT', sec: [
    ['rate', 'Heart rate (bpm)', '', 1], ['rhythm', 'Rhythm', 'Sinus rhythm', 1], ['axis', 'Axis', 'Normal', 1],
    ['pr', 'PR interval (ms)', '', 1], ['qrs', 'QRS duration (ms)', '', 1], ['qt', 'QT / QTc (ms)', '', 1],
    ['pwave', 'P wave', 'Normal'], ['stt', 'ST segment / T wave', 'No ST-T changes.'],
    ['impression', 'Interpretation', 'Normal ECG.']] },
  xray: { g: 'X-Ray Report', title: 'X-RAY REPORT', sec: [
    ['study', 'Study / View', 'X-RAY CHEST PA VIEW'],
    ['findings', 'Findings', 'Both lung fields are clear. Cardiac size is within normal limits. Both costophrenic angles are clear. Bony thorax and soft tissues are normal.'],
    ['impression', 'Impression', 'No significant abnormality detected.']] }
};
var PAN = {
  lab_cbc: { g: 'CBC (Complete Blood Count)', title: 'HEMATOLOGY - COMPLETE BLOOD COUNT (CBC)', spec: 'Whole Blood (EDTA)', rows: [
    ['Hemoglobin (Hb)', 'M: 13.0 - 17.0 / F: 12.0 - 15.5', 'g/dL'], ['Total WBC Count (TC)', '4,000 - 11,000', '/cumm'], 'Differential Count',
    ['Neutrophils', '40 - 75', '%'], ['Lymphocytes', '20 - 45', '%'], ['Eosinophils', '1 - 6', '%'], ['Monocytes', '2 - 10', '%'], ['Basophils', '0 - 1', '%'],
    ['Platelet Count', '150,000 - 450,000', '/cumm'], ['RBC Count', 'M: 4.5 - 5.9 / F: 4.0 - 5.2', 'million/cumm'], ['PCV / Hematocrit', 'M: 40 - 52 / F: 36 - 46', '%'],
    ['MCV', '80 - 100', 'fL'], ['MCH', '27 - 32', 'pg'], ['MCHC', '32 - 36', 'g/dL'], ['ESR (1st hour)', 'M: 0 - 15 / F: 0 - 20', 'mm/hr']] },
  lab_urine: { g: 'Urine Routine (R/E)', title: 'CLINICAL PATHOLOGY - URINE ROUTINE EXAMINATION', spec: 'Urine', rows: [
    'Physical Examination', ['Colour', 'Pale yellow', ''], ['Appearance', 'Clear', ''], ['Reaction (pH)', '5.0 - 8.0', ''], ['Specific Gravity', '1.005 - 1.030', ''],
    'Chemical Examination', ['Protein (Albumin)', 'Nil', ''], ['Glucose (Sugar)', 'Nil', ''], ['Ketone', 'Nil', ''], ['Bilirubin', 'Nil', ''], ['Urobilinogen', 'Normal', ''], ['Blood', 'Nil', ''], ['Nitrite', 'Negative', ''],
    'Microscopic Examination', ['Pus Cells', '0 - 5', '/HPF'], ['RBC', '0 - 2', '/HPF'], ['Epithelial Cells', 'Occasional', '/HPF'], ['Casts', 'Nil', ''], ['Crystals', 'Nil', ''], ['Bacteria / Others', 'Nil', '']] },
  lab_lipid: { g: 'Lipid Profile', title: 'BIOCHEMISTRY - LIPID PROFILE', spec: 'Serum (fasting)', rows: [
    ['Total Cholesterol', '< 200', 'mg/dL'], ['Triglycerides', '< 150', 'mg/dL'], ['HDL Cholesterol', '> 40', 'mg/dL'], ['LDL Cholesterol', '< 100', 'mg/dL'], ['VLDL Cholesterol', '5 - 40', 'mg/dL'], ['Total Chol / HDL Ratio', '< 5.0', '']] },
  lab_lft: { g: 'LFT (Liver Function Test)', title: 'BIOCHEMISTRY - LIVER FUNCTION TEST (LFT)', spec: 'Serum', rows: [
    ['Total Bilirubin', '0.2 - 1.2', 'mg/dL'], ['Direct Bilirubin', '0.0 - 0.3', 'mg/dL'], ['Indirect Bilirubin', '0.2 - 0.9', 'mg/dL'],
    ['SGOT (AST)', '5 - 40', 'U/L'], ['SGPT (ALT)', '5 - 40', 'U/L'], ['Alkaline Phosphatase (ALP)', '44 - 147', 'U/L'],
    ['Total Protein', '6.0 - 8.3', 'g/dL'], ['Albumin', '3.5 - 5.2', 'g/dL'], ['Globulin', '2.0 - 3.5', 'g/dL'], ['A/G Ratio', '1.0 - 2.2', '']] },
  lab_rft: { g: 'RFT (Renal Function Test)', title: 'BIOCHEMISTRY - RENAL FUNCTION TEST (RFT)', spec: 'Serum', rows: [
    ['Urea', '15 - 45', 'mg/dL'], ['Creatinine', '0.6 - 1.3', 'mg/dL'], ['Uric Acid', '3.5 - 7.2', 'mg/dL'], ['Sodium (Na+)', '135 - 145', 'mmol/L'], ['Potassium (K+)', '3.5 - 5.0', 'mmol/L'], ['Chloride (Cl-)', '98 - 107', 'mmol/L']] },
  lab_bg: { g: 'Blood Group (ABO & Rh)', title: 'SEROLOGY - BLOOD GROUP (ABO & Rh)', spec: 'Whole Blood (EDTA)', note: 'Tested by slide / tube agglutination method.', rows: [
    ['ABO Blood Group', '', ''], ['Rh (D) Factor', '', '']] }
};
(function register() {
  var us = TEMPLATE_GROUPS.usg, at = us.findIndex(function (x) { return x.key === 'cert_medical'; });
  var blank = { name: '', age: '', sex: '', address: '', date: '', refBy: '' };
  Object.keys(TXT).forEach(function (k, i) {
    var t = TXT[k], f = {}; t.sec.forEach(function (s) { f[s[0]] = s[2]; });
    TEMPLATES[k] = { title: t.title, patient: Object.assign({}, blank), fields: f, ph: {} };
    us.splice((at < 0 ? us.length : at) + i, 0, { key: k, label: t.g });
  });
  Object.keys(PAN).forEach(function (k) {
    var p = PAN[k], f = { notes: p.note || '' };
    p.rows.forEach(function (r, i) { if (typeof r !== 'string') { f['r' + i + 'V'] = ''; f['r' + i + 'R'] = r[1]; } });
    TEMPLATES[k] = { title: p.title, patient: Object.assign({}, blank, { labNo: '', specimen: p.spec }), fields: f, ph: {} };
    TEMPLATE_GROUPS.pathology.push({ key: k, label: p.g });
  });
})();
function flag(v, ref, sex) {
  var n = parseFloat(String(v).replace(/,/g, '')); if (isNaN(n)) return '';
  var sx = /^\s*M:\s*([\d.,]+\s*-\s*[\d.,]+)\s*\/\s*F:\s*([\d.,]+\s*-\s*[\d.,]+)/.exec(ref);
  if (sx) { if (!sex) return ''; ref = sex === 'Male' ? sx[1] : sx[2]; }
  var m = /^\s*([\d.,]+)\s*-\s*([\d.,]+)/.exec(ref);
  if (m) { var a = parseFloat(m[1].replace(/,/g, '')), b = parseFloat(m[2].replace(/,/g, '')); return n < a ? 'L' : n > b ? 'H' : ''; }
  m = /^\s*<\s*=?\s*([\d.]+)/.exec(ref); if (m) return n > parseFloat(m[1]) ? 'H' : '';
  m = /^\s*>\s*=?\s*([\d.]+)/.exec(ref); if (m) return n < parseFloat(m[1]) ? 'L' : '';
  return '';
}
var UD = function (k, extra) { return 'oninput="updateData(\'fields\',\'' + k + '\',this.value)"' + (extra || ''); };
var oUF = window.renderUsgFields;
window.renderUsgFields = function (fc, f) {
  var T = TXT[currentTemplateKey], P = PAN[currentTemplateKey];
  if (!T && !P) return oUF.apply(this, arguments);
  if (T) fc.innerHTML = '<div class="grid grid-cols-2 gap-2">' + T.sec.map(function (s) {
    var lab = '<label class="block font-medium text-slate-700">' + E(s[1]) + '</label>', v = E(f[s[0]]);
    return s[3] ? '<div>' + lab + '<input type="text" value="' + v + '" ' + UD(s[0]) + ' class="w-full border rounded p-1"></div>'
      : '<div class="col-span-2">' + lab + '<textarea rows="2" ' + UD(s[0]) + ' class="w-full border rounded p-1">' + v + '</textarea></div>';
  }).join('') + '</div>';
  else fc.innerHTML = P.rows.map(function (r, i) {
    if (typeof r === 'string') return '<div class="font-bold text-clinic-800 text-[11px] uppercase pt-1">' + E(r) + '</div>';
    return '<div class="grid grid-cols-12 gap-1 items-center"><span class="col-span-4 font-medium">' + E(r[0]) + '</span>' +
      '<input class="col-span-3 border rounded p-1 font-bold" value="' + E(f['r' + i + 'V']) + '" ' + UD('r' + i + 'V') + '>' +
      '<input class="col-span-3 border rounded p-1" value="' + E(f['r' + i + 'R']) + '" ' + UD('r' + i + 'R') + '>' +
      '<span class="col-span-2 text-[10px] text-slate-500">' + E(r[2]) + '</span></div>';
  }).join('') + '<div><label class="block font-medium">Notes</label><input type="text" value="' + E(f.notes) + '" ' + UD('notes') + ' class="w-full border rounded p-1"></div>';
  document.getElementById('form-fields-container').appendChild(fc);
};
var oUP = window.renderUsgPreview;
window.renderUsgPreview = function (body, f) {
  var T = TXT[currentTemplateKey], P = PAN[currentTemplateKey];
  if (!T && !P) return oUP.apply(this, arguments);
  if (T) {
    body.innerHTML = '<div class="space-y-2">' + T.sec.filter(function (s) { return String(f[s[0]] || '').trim(); }).map(function (s) {
      var big = s[0] === 'impression';
      return '<p' + (big ? ' style="margin-top:10px"' : '') + '><b>' + (big ? '' : '') + E(s[1]).toUpperCase() + ':</b> ' + (big ? '<b>' : '') + E(f[s[0]]).replace(/\n/g, '<br>') + (big ? '</b>' : '') + '</p>';
    }).join('') + '</div>';
    return;
  }
  var th = 'class="border border-slate-300 p-2 text-center"';
  body.innerHTML = '<table class="w-full text-xs text-left border-collapse border border-slate-300 font-sans"><thead><tr class="bg-slate-100 uppercase"><th class="border border-slate-300 p-2">Test</th><th ' + th + '>Result</th><th ' + th + '>Reference</th><th ' + th + '>Unit</th></tr></thead><tbody>' +
    P.rows.map(function (r, i) {
      if (typeof r === 'string') return '<tr><td colspan="4" class="border border-slate-300 p-1.5 font-bold bg-slate-50 uppercase">' + E(r) + '</td></tr>';
      var v = f['r' + i + 'V'], ref = f['r' + i + 'R'], fl = String(v || '').trim() ? flag(v, ref, curGender()) : '';
      if (!String(v || '').trim() && !(P === PAN.lab_bg)) return '';
      return '<tr><td class="border border-slate-300 p-2 font-semibold">' + E(r[0]) + '</td><td class="border border-slate-300 p-2 text-center font-bold" style="' + (fl ? 'color:#b91c1c' : '') + '">' + E(v) + (fl ? ' <sup>' + fl + '</sup>' : '') + '</td><td ' + th + '>' + E(ref) + '</td><td ' + th + '>' + E(r[2]) + '</td></tr>';
    }).join('') + '</tbody></table>' + (f.notes ? '<p class="mt-3 text-[11px] text-slate-600 font-sans"><b>Note:</b> ' + E(f.notes) + '</p>' : '') +
    '<p class="mt-2 text-[10px] text-slate-400 font-sans">H = above range, L = below range. Only tests with a result entered are printed.</p>';
};

/* ---------- 2. Prescription doctor ---------- */
window.rxDocName = function (f) { return f && f.rxDoc === 'miya' ? 'Dr. Israphil&nbsp; Miya' : 'Dr. Israphil&nbsp; Ansari'; };

/* ---------- 3. Dates & reminders ---------- */
function bsNow() { try { return getNepaliToday(); } catch (e) { return null; } }
function bsOff(s) { var m = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/.exec(String(s || '').trim()); if (!m) return null; try { return bsDayOffset(+m[1], +m[2], +m[3]); } catch (e) { return null; } }
function bsPlus(n) {
  var t = bsNow(); if (!t) return ''; var d = bsDayOffset(t.y, t.m, t.d) + n, y = 2083;
  var tot = function (yy) { return BS_MONTH_DAYS[yy].reduce(function (a, b) { return a + b; }, 0); };
  try { while (d < 0) { y--; d += tot(y); } while (d >= tot(y)) { d -= tot(y); y++; } var m = 0; while (d >= BS_MONTH_DAYS[y][m]) { d -= BS_MONTH_DAYS[y][m]; m++; } return y + '/' + z(m + 1) + '/' + z(d + 1); } catch (e) { return ''; }
}
function todayOff() { var t = bsNow(); return t ? bsDayOffset(t.y, t.m, t.d) : null; }
function followUps() {
  var done = LS.get('medico_fu_done', {}), t = todayOff(), out = [];
  if (t == null) return out;
  savedReports.forEach(function (r) {
    var d = r.data && r.data.followUp, o = bsOff(d); if (o == null || done[r.id]) return;
    out.push({ id: r.id, name: r.patientName, date: d, days: o - t, tpl: (TEMPLATES[r.templateKey] || {}).title || '' });
  });
  return out.sort(function (a, b) { return a.days - b.days; });
}
window.PLUS = {};
PLUS.fuDone = function (id) { var d = LS.get('medico_fu_done', {}); d[id] = 1; LS.set('medico_fu_done', d); PLUS.today(); badge(); };
PLUS.fuSet = function (v) { formData.followUp = v; queue(); };
PLUS.fuAdd = function (n) { var v = bsPlus(n); $('#plus-fu-in').value = v; PLUS.fuSet(v); };

/* ---------- 4. Patients ---------- */
function patients() { return LS.get('medico_patients_v1', {}); }
function upsertPatient(p, when) {
  if (!p || !String(p.name || '').trim()) return;
  var db = patients(), k = p.name.trim().toLowerCase(), o = db[k] || { visits: 0 };
  db[k] = { name: p.name.trim(), age: p.age || o.age || '', sex: p.sex || o.sex || '', address: p.address || o.address || '', refBy: p.refBy || o.refBy || '', visits: (o.visits || 0) + (when ? 1 : 0), last: p.date || o.last || '' };
  LS.set('medico_patients_v1', db);
}
function backfill() {
  var db = patients(); if (db.__seeded) return;
  var tmp = {}; savedReports.slice().reverse().forEach(function (r) {
    var p = r.data && r.data.patient; if (!p || !p.name) return; var k = p.name.trim().toLowerCase(), o = tmp[k] || { visits: 0 };
    tmp[k] = { name: p.name.trim(), age: p.age || o.age || '', sex: p.sex || o.sex || '', address: p.address || o.address || '', refBy: p.refBy || '', visits: o.visits + 1, last: p.date || '' };
  });
  tmp.__seeded = 1; LS.set('medico_patients_v1', Object.assign(tmp, db));
}
PLUS.use = function (k) {
  k = decodeURIComponent(k); var p = patients()[k]; if (!p) return; var P = formData.patient;
  P.name = p.name; P.age = p.age; P.address = p.address; if (p.refBy && !P.refBy) P.refBy = p.refBy;
  if (p.sex) setPatientGender(p.sex);
  renderFormFields(); renderLivePreview(); close(); toast('Filled details for ' + p.name);
};
PLUS.patDel = function (k) { k = decodeURIComponent(k); if (!confirm('Remove this patient from the list? (Saved reports stay.)')) return; var db = patients(); delete db[k]; LS.set('medico_patients_v1', db); PLUS.patients(); };
PLUS.patients = function () {
  backfill();
  var q = (($('#plus-pq') || {}).value || '').toLowerCase(), db = patients();
  var rows = Object.keys(db).filter(function (k) { return k !== '__seeded' && (db[k].name + ' ' + db[k].address).toLowerCase().indexOf(q) >= 0; })
    .sort(function (a, b) { return String(db[b].last).localeCompare(String(db[a].last)); }).slice(0, 80);
  var html = '<input id="plus-pq" value="' + E(q) + '" placeholder="Search patient by name or address" oninput="PLUS.patients()" class="plus-in" autofocus><div class="mt-2 space-y-2">' +
    (rows.map(function (k) {
      var p = db[k];
      return '<div class="plus-row"><div class="flex-1 min-w-0"><b>' + E(p.name) + '</b><div class="text-xs text-slate-500">' + E(p.age) + ' yrs / ' + E(p.sex || '-') + ' &middot; ' + E(p.address || '-') + ' &middot; ' + p.visits + ' visit(s)' + (p.last ? ' &middot; last ' + E(p.last) : '') + '</div></div>' +
        '<button class="plus-btn" onclick="PLUS.use(\'' + enc(k) + '\')">Use</button><button class="plus-x" onclick="PLUS.patDel(\'' + enc(k) + '\')">&#10005;</button></div>';
    }).join('') || '<p class="text-sm text-slate-400 py-6 text-center">No patients yet. They are added automatically when you save a report.</p>') + '</div>';
  if ($('#plus-pq')) { var pos = $('#plus-pq').selectionStart; $('#plus-bd').innerHTML = html; var i = $('#plus-pq'); i.focus(); i.setSelectionRange(pos, pos); } else modal('<i class="fa-solid fa-users"></i> Patients', html);
};

/* ---------- 5. My own wording ---------- */
var lastTA = null;
function phrases() { return LS.get('medico_phrases_v1', []); }
PLUS.ins = function (i) {
  var t = phrases()[i], ta = lastTA && document.body.contains(lastTA) ? lastTA : null;
  if (!ta) { toast('Tap inside a text box first, then tap a phrase'); return; }
  var s = ta.selectionStart == null ? ta.value.length : ta.selectionStart, e = ta.selectionEnd == null ? s : ta.selectionEnd;
  ta.value = ta.value.slice(0, s) + t + ta.value.slice(e); ta.focus(); ta.setSelectionRange(s + t.length, s + t.length);
  ta.dispatchEvent(new Event('input', { bubbles: true }));
};
PLUS.phSave = function (txt) {
  if (txt == null) { var ta = lastTA; txt = ta ? ta.value.substring(ta.selectionStart, ta.selectionEnd) : ''; if (!txt.trim() && ta) txt = ta.value; }
  txt = String(txt || '').trim(); if (!txt) { toast('Select some text in a box first'); return; }
  var a = phrases(); if (a.indexOf(txt) < 0) a.unshift(txt); LS.set('medico_phrases_v1', a); toast('Saved to My wording'); decorate();
  if ($('#plus-modal')) PLUS.words();
};
PLUS.phDel = function (i) { var a = phrases(); a.splice(i, 1); LS.set('medico_phrases_v1', a); PLUS.words(); decorate(); };
PLUS.words = function () {
  var a = phrases();
  modal('<i class="fa-solid fa-pen-nib"></i> My own wording', '<p class="text-xs text-slate-500 mb-2">Saved sentences appear as one-tap chips under every form. Tap a chip to insert it where your cursor is.</p>' +
    '<textarea id="plus-nw" rows="3" placeholder="Type a favourite finding or sentence" class="plus-in"></textarea><button class="plus-btn mt-2" onclick="PLUS.phSave($(\'#plus-nw\').value)">Save wording</button><div class="mt-3 space-y-2">' +
    (a.map(function (t, i) { return '<div class="plus-row"><div class="flex-1 text-sm">' + E(t) + '</div><button class="plus-x" onclick="PLUS.phDel(' + i + ')">&#10005;</button></div>'; }).join('') || '<p class="text-sm text-slate-400 text-center py-4">Nothing saved yet.</p>') + '</div>');
  window.$ = $;
};

/* ---------- 6. Bill / receipt ---------- */
var bill = null;
function services() { return LS.get('medico_services_v1', { 'OPD Consultation': 0, 'USG': 0, 'ECG': 0, 'X-Ray': 0, 'CBC': 0, 'Urine R/E': 0, 'Lipid Profile': 0, 'LFT': 0, 'RFT': 0, 'Blood Group': 0 }); }
function billTotals() { var t = bill.items.reduce(function (s, i) { return s + (+i.a || 0); }, 0), d = +bill.disc || 0, n = Math.max(0, t - d), p = bill.paid === '' ? n : +bill.paid || 0; return { t: t, d: d, n: n, p: p, b: n - p }; }
PLUS.bill = function (fresh) {
  if (fresh || !bill) bill = { name: formData.patient.name || '', date: formData.patient.date || getTodayNepaliDate('/'), items: [{ s: '', a: '' }], disc: '', paid: '' };
  var sv = services();
  modal('<i class="fa-solid fa-receipt"></i> Bill / Receipt', '<div class="grid grid-cols-2 gap-2"><input class="plus-in" placeholder="Patient name" value="' + E(bill.name) + '" oninput="PLUS.bf(\'name\',this.value)"><input class="plus-in" placeholder="Date" value="' + E(bill.date) + '" oninput="PLUS.bf(\'date\',this.value)"></div>' +
    '<div class="flex flex-wrap gap-1 my-2">' + Object.keys(sv).map(function (k) { return '<button class="plus-chip" onclick="PLUS.bAdd(\'' + enc(k) + '\')">+ ' + E(k) + '</button>'; }).join('') + '</div>' +
    '<div id="plus-items">' + bill.items.map(function (it, i) { return '<div class="grid grid-cols-12 gap-1 mb-1"><input class="plus-in col-span-7" placeholder="Service" value="' + E(it.s) + '" oninput="PLUS.bi(' + i + ',\'s\',this.value)"><input class="plus-in col-span-4" inputmode="decimal" placeholder="Amount" value="' + E(it.a) + '" oninput="PLUS.bi(' + i + ',\'a\',this.value)"><button class="plus-x col-span-1" onclick="PLUS.bDel(' + i + ')">&#10005;</button></div>'; }).join('') + '</div>' +
    '<button class="plus-chip" onclick="PLUS.bAdd(\'\')">+ Blank line</button><div class="grid grid-cols-2 gap-2 mt-2"><input class="plus-in" inputmode="decimal" placeholder="Discount" value="' + E(bill.disc) + '" oninput="PLUS.bf(\'disc\',this.value)"><input class="plus-in" inputmode="decimal" placeholder="Amount paid (blank = full)" value="' + E(bill.paid) + '" oninput="PLUS.bf(\'paid\',this.value)"></div>' +
    '<div id="plus-receipt" class="plus-rcpt"></div><div class="flex gap-2 mt-3"><button class="plus-btn" onclick="PLUS.bPrint()"><i class="fa-solid fa-print"></i> Save &amp; Print receipt</button><button class="plus-chip" onclick="PLUS.bill(true)">New bill</button></div>', true);
  rcpt();
};
PLUS.bf = function (k, v) { bill[k] = v; rcpt(); };
PLUS.bi = function (i, k, v) { bill.items[i][k] = v; rcpt(); };
PLUS.bAdd = function (s) { s = decodeURIComponent(s); var p = services()[s]; bill.items = bill.items.filter(function (i) { return i.s || i.a; }); bill.items.push({ s: s, a: p > 0 ? p : '' }); PLUS.bill(); };
PLUS.bDel = function (i) { bill.items.splice(i, 1); if (!bill.items.length) bill.items.push({ s: '', a: '' }); PLUS.bill(); };
function rcpt() {
  var T = billTotals(), n = LS.get('medico_rcpt_n', 0) + 1, items = bill.items.filter(function (i) { return i.s || i.a; });
  $('#plus-receipt').innerHTML = '<div style="text-align:center;font-weight:800;font-size:16px;color:#800000">ANSARI MEDICO CLINIC</div><div style="text-align:center;font-size:10px;font-weight:600">PRATAPPUR-9, KHAIRAHANI, NAWALPARASI_W &middot; Mob.: +977-9847140398</div><div style="text-align:center;font-weight:700;margin:6px 0;border-top:1px solid #333;border-bottom:1px solid #333;padding:2px 0">PAYMENT RECEIPT</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px"><span>Receipt No: <b>' + n + '</b></span><span>Date: <b>' + E(bill.date) + '</b></span></div><div style="font-size:12px;margin:3px 0 6px">Patient: <b>' + E(bill.name || '-') + '</b></div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#eef2f7"><th style="text-align:left;padding:3px;border:1px solid #999">#</th><th style="text-align:left;padding:3px;border:1px solid #999">Service</th><th style="text-align:right;padding:3px;border:1px solid #999">Amount (Rs.)</th></tr>' +
    items.map(function (i, k) { return '<tr><td style="padding:3px;border:1px solid #999">' + (k + 1) + '</td><td style="padding:3px;border:1px solid #999">' + E(i.s) + '</td><td style="padding:3px;border:1px solid #999;text-align:right">' + (+i.a || 0).toFixed(2) + '</td></tr>'; }).join('') +
    '</table><div style="text-align:right;font-size:12px;margin-top:4px">Total: <b>' + T.t.toFixed(2) + '</b>' + (T.d ? '<br>Discount: ' + T.d.toFixed(2) + '<br>Net: <b>' + T.n.toFixed(2) + '</b>' : '') + '<br>Paid: <b>' + T.p.toFixed(2) + '</b>' + (T.b > 0 ? '<br>Balance due: <b style="color:#b91c1c">' + T.b.toFixed(2) + '</b>' : '') + '</div><div style="margin-top:22px;text-align:right;font-size:11px;border-top:1px dashed #666;padding-top:2px">Received by / Signature</div>';
}
PLUS.bPrint = function () {
  var T = billTotals(), items = bill.items.filter(function (i) { return i.s || i.a; });
  if (!items.length) { toast('Add at least one service'); return; }
  var n = LS.get('medico_rcpt_n', 0) + 1; LS.set('medico_rcpt_n', n);
  var sv = services(); items.forEach(function (i) { if (i.s && +i.a > 0) sv[i.s] = +i.a; }); LS.set('medico_services_v1', sv);
  var all = LS.get('medico_bills_v1', []); all.push({ no: n, ts: Date.now(), name: bill.name, total: T.n, paid: T.p, items: items }); LS.set('medico_bills_v1', all);
  document.body.classList.add('plus-printing'); window.print();
  setTimeout(function () { document.body.classList.remove('plus-printing'); }, 600); rcpt();
};

/* ---------- 7. Today summary ---------- */
function sameDay(ts) { return new Date(ts).toDateString() === new Date().toDateString(); }
function summaryText() {
  var rs = savedReports.filter(function (r) { return sameDay(r.savedAt || r.id); }), bl = LS.get('medico_bills_v1', []).filter(function (b) { return sameDay(b.ts); });
  var by = {}; rs.forEach(function (r) { var t = (TEMPLATES[r.templateKey] || {}).title || r.templateKey; by[t] = (by[t] || 0) + 1; });
  return { rs: rs, bl: bl, by: by, cash: bl.reduce(function (s, b) { return s + b.paid; }, 0) };
}
PLUS.today = function () {
  var S = summaryText(), fu = followUps().filter(function (f) { return f.days <= 7; });
  var lbl = function (d) { return d < 0 ? '<span class="text-rose-600 font-bold">' + (-d) + ' day(s) overdue</span>' : d === 0 ? '<span class="text-amber-600 font-bold">due today</span>' : 'in ' + d + ' day(s)'; };
  modal('<i class="fa-solid fa-chart-simple"></i> Today', '<div class="grid grid-cols-3 gap-2 text-center"><div class="plus-stat"><b>' + S.rs.length + '</b><span>Reports</span></div><div class="plus-stat"><b>' + S.bl.length + '</b><span>Receipts</span></div><div class="plus-stat"><b>Rs. ' + S.cash.toFixed(0) + '</b><span>Collected</span></div></div>' +
    '<h4 class="plus-h">Reports made today</h4>' + (Object.keys(S.by).map(function (t) { return '<div class="text-sm flex justify-between py-0.5"><span>' + E(t) + '</span><b>' + S.by[t] + '</b></div>'; }).join('') || '<p class="text-xs text-slate-400">Nothing saved yet today.</p>') +
    '<h4 class="plus-h">Patients today</h4><p class="text-sm">' + (S.rs.map(function (r) { return E(r.patientName); }).join(', ') || '-') + '</p>' +
    '<h4 class="plus-h">Follow-ups (overdue &amp; next 7 days)</h4>' + (fu.map(function (f) { return '<div class="plus-row"><div class="flex-1 text-sm"><b>' + E(f.name) + '</b> &middot; ' + E(f.date) + ' &middot; ' + lbl(f.days) + '</div><button class="plus-chip" onclick="PLUS.fuDone(' + f.id + ')">Done</button></div>'; }).join('') || '<p class="text-xs text-slate-400">No follow-ups due.</p>') +
    '<button class="plus-btn mt-3" onclick="PLUS.copySum()"><i class="fa-regular fa-copy"></i> Copy summary</button>');
};
PLUS.copySum = function () {
  var S = summaryText(), t = 'Ansari Medico Clinic - ' + (getTodayNepaliDate('/') || '') + '\nReports: ' + S.rs.length + '\n' + Object.keys(S.by).map(function (k) { return ' - ' + k + ': ' + S.by[k]; }).join('\n') + '\nReceipts: ' + S.bl.length + ', collected Rs. ' + S.cash.toFixed(0);
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('Summary copied'); }, function () { prompt('Copy:', t); });
};
function badge() { var b = $('#plus-badge'); if (!b) return; var n = followUps().filter(function (f) { return f.days <= 0; }).length; b.textContent = n; b.style.display = n ? 'inline-block' : 'none'; }

/* ---------- 8. Backup nudge on Saved page ---------- */
var oExp = window.exportBackup;
window.exportBackup = function () { var n = savedReports.length; oExp.apply(this, arguments); if (n) LS.set('medico_bk', Date.now()); };
var oRSP = window.renderSavedPage;
window.renderSavedPage = function () {
  oRSP.apply(this, arguments);
  var old = $('#plus-bk'); if (old) old.remove(); if (!savedReports.length) return;
  var t = LS.get('medico_bk', 0), days = t ? Math.floor((Date.now() - t) / 864e5) : 999, st = $('#sd-status'); if (!st) return;
  var d = document.createElement('div'); d.id = 'plus-bk';
  d.className = 'plus-bk ' + (days >= 7 ? 'warn' : 'ok');
  d.innerHTML = days >= 7 ? '<i class="fa-solid fa-triangle-exclamation"></i> <span class="flex-1">' + (t ? 'Last backup was ' + days + ' days ago.' : 'You have never made a backup.') + ' Browser data can be lost if the phone is reset or the cache is cleared.</span><button class="plus-btn" onclick="exportBackup();renderSavedPage()">Backup now</button>' :
    '<i class="fa-solid fa-circle-check"></i> <span class="flex-1">Backed up ' + (days ? days + ' day(s) ago' : 'today') + '.</span>';
  st.parentNode.insertBefore(d, st);
};

/* ---------- 9. Draft autosave ---------- */
var dT;
function queue() { clearTimeout(dT); dT = setTimeout(saveDraft, 700); }
function saveDraft() { try { var p = formData && formData.patient; if (!p || !(p.name || p.age)) return; LS.set('medico_draft_v1', { ts: Date.now(), cat: currentCategory, key: currentTemplateKey, data: formData, signers: signers, sid: currentSavedId }); } catch (e) {} }
document.addEventListener('input', queue, true); document.addEventListener('change', queue, true);
var oUpd = window.updateData; window.updateData = function () { oUpd.apply(this, arguments); queue(); };
var oSave = window.saveCurrentReport;
window.saveCurrentReport = async function () {
  var isNew = currentSavedId == null;
  await oSave.apply(this, arguments); LS.del('medico_draft_v1'); upsertPatient(formData.patient, isNew); badge();
};
function restoreDraft(d) {
  if (d.cat && d.cat !== currentCategory) switchCategory(d.cat);
  currentTemplateKey = d.key; formData = d.data; if (d.signers) signers = d.signers; currentSavedId = d.sid || null;
  $('#template-select').value = d.key; $('#preview-report-title').innerText = formData.title;
  renderSignerPanel(); renderSignatures(); renderFormFields(); renderLivePreview(); fitPaper();
}
function draftPrompt() {
  var d = LS.get('medico_draft_v1', null); if (!d || Date.now() - d.ts > 864e5 || !d.data || !d.data.patient || !(d.data.patient.name || d.data.patient.age)) return;
  var b = document.createElement('div'); b.className = 'plus-draft no-print';
  b.innerHTML = '<span><i class="fa-solid fa-clock-rotate-left"></i> Unsaved draft for <b>' + E(d.data.patient.name || 'a patient') + '</b> found.</span><button class="plus-btn" id="dr-y">Restore</button><button class="plus-chip" id="dr-n">Discard</button>';
  document.body.appendChild(b);
  $('#dr-y', b).onclick = function () { restoreDraft(d); b.remove(); }; $('#dr-n', b).onclick = function () { LS.del('medico_draft_v1'); b.remove(); };
}

/* ---------- 10. Form decorations (runs after every form render) ---------- */
function decorate() {
  var c = document.getElementById('form-fields-container'); if (!c) return;
  ['plus-fu', 'plus-ph', 'plus-rx'].forEach(function (id) { var o = $('#' + id, c); if (o) o.remove(); });
  var nm = c.querySelector('input[type=text]'); if (nm) { nm.setAttribute('list', 'plus-pl'); nm.setAttribute('autocomplete', 'off'); nm.id = 'plus-nm'; }
  var dl = $('#plus-pl') || document.body.appendChild(Object.assign(document.createElement('datalist'), { id: 'plus-pl' }));
  dl.innerHTML = Object.keys(patients()).filter(function (k) { return k !== '__seeded'; }).map(function (k) { return '<option value="' + E(patients()[k].name) + '">'; }).join('');
  if (currentTemplateKey === 'clinical_rx') {
    var r = document.createElement('div'); r.id = 'plus-rx'; r.className = 'plus-card'; var cur = formData.fields.rxDoc || 'ansari';
    r.innerHTML = '<label class="block text-xs font-bold text-slate-600 mb-1"><i class="fa-solid fa-user-doctor"></i> Prescription doctor</label><select class="plus-in" onchange="PLUS.rxDoc(this.value)"><option value="ansari"' + (cur === 'ansari' ? ' selected' : '') + '>Dr. Israphil Ansari</option><option value="miya"' + (cur === 'miya' ? ' selected' : '') + '>Dr. Israphil Miya</option></select>';
    c.insertBefore(r, c.firstChild);
  }
  var ph = phrases(), w = document.createElement('div'); w.id = 'plus-ph'; w.className = 'plus-card';
  w.innerHTML = '<div class="flex items-center justify-between mb-1"><b class="text-xs text-slate-600"><i class="fa-solid fa-pen-nib"></i> My wording</b><span><button class="plus-chip" onclick="PLUS.phSave()">Save selection</button> <button class="plus-chip" onclick="PLUS.words()">Manage</button></span></div>' +
    '<div class="flex flex-wrap gap-1">' + (ph.slice(0, 12).map(function (t, i) { return '<button class="plus-chip" onclick="PLUS.ins(' + i + ')" title="' + E(t) + '">' + E(t.length > 34 ? t.slice(0, 34) + '...' : t) + '</button>'; }).join('') || '<span class="text-[11px] text-slate-400">Select text in a box, tap Save selection, and it appears here for one-tap reuse.</span>') + '</div>';
  c.appendChild(w);
  if (!/^cert_/.test(currentTemplateKey)) {
    var f = document.createElement('div'); f.id = 'plus-fu'; f.className = 'plus-card amber';
    f.innerHTML = '<label class="block text-xs font-bold text-amber-800 mb-1"><i class="fa-solid fa-bell"></i> Follow-up date (BS)</label><div class="flex gap-1 flex-wrap"><input id="plus-fu-in" class="plus-in" style="flex:1;min-width:8rem" placeholder="YYYY/MM/DD" value="' + E(formData.followUp || '') + '" oninput="PLUS.fuSet(this.value)">' +
      [3, 7, 15, 30].map(function (n) { return '<button class="plus-chip" onclick="PLUS.fuAdd(' + n + ')">+' + n + 'd</button>'; }).join('') + '</div>';
    c.appendChild(f);
  }
  c.classList.remove('plus-fade'); void c.offsetWidth; c.classList.add('plus-fade');
}
PLUS.rxDoc = function (v) { formData.fields.rxDoc = v; signers = [v]; renderSignerPanel(); renderSignatures(); renderLivePreview(); fitPaper(); queue(); };
var oRFF = window.renderFormFields;
window.renderFormFields = function () { oRFF.apply(this, arguments); decorate(); };
document.addEventListener('focusin', function (e) { var t = e.target; if (t.tagName === 'TEXTAREA' && t.closest('#form-fields-container')) lastTA = t; });
document.addEventListener('change', function (e) {
  if (e.target.id !== 'plus-nm') return; var p = patients()[e.target.value.trim().toLowerCase()]; if (!p) return;
  var P = formData.patient; P.name = p.name; if (!P.age) P.age = p.age; if (!P.address) P.address = p.address; if (!P.refBy) P.refBy = p.refBy;
  if (p.sex && !P.sex) setPatientGender(p.sex); renderFormFields(); renderLivePreview(); toast('Filled from patient list: ' + p.name);
});

/* ---------- 11. Modal helper ---------- */
function modal(title, body, wide) {
  close(); var d = document.createElement('div'); d.id = 'plus-modal'; d.className = 'plus-ov no-print';
  d.innerHTML = '<div class="plus-box' + (wide ? ' wide' : '') + '"><div class="plus-hd"><b>' + title + '</b><button class="plus-x" onclick="PLUS.close()">&#10005;</button></div><div class="plus-bd" id="plus-bd">' + body + '</div></div>';
  d.addEventListener('mousedown', function (e) { if (e.target === d) close(); }); document.body.appendChild(d); window.$ = $;
}
function close() { var m = $('#plus-modal'); if (m) m.remove(); }
PLUS.close = close;

/* ---------- 12. Lock (3 hours) and PIN expiry notice ---------- */
PLUS.lock = function () { saveDraft(); document.documentElement.classList.add('pin-locked'); try { localStorage.removeItem(KEY); localStorage.removeItem(TKEY); } catch (e) {} setTimeout(function () { location.reload(); }, 40); };
function lockLeft() { var ts = +localStorage.getItem(TKEY) || 0; return ts ? ts + HOURS * 36e5 - Date.now() : -1; }
var noticed = false;
function lockTick() {
  if (document.documentElement.classList.contains('pin-locked')) return;
  if (!noticed) { noticed = true; pinNotice(); }
  var ms = lockLeft(); if (ms <= 0 || ms > HOURS * 36e5 + 6e4) { PLUS.lock(); return; }
  var b = $('#plus-lockt'); if (b) { var m = Math.ceil(ms / 6e4); b.textContent = Math.floor(m / 60) + 'h ' + z(m % 60) + 'm'; }
}
function pinNotice() {
  var id = localStorage.getItem(KEY) || ''; var from = id.split('|')[1]; if (!from) return;
  var p = from.split('-').map(Number), tm = p[1] - 1 + ((window.PIN_CONFIG && PIN_CONFIG.months) || 3), y = p[0] + Math.floor(tm / 12), m = tm % 12;
  var end = new Date(y, m, Math.min(p[2], new Date(y, m + 1, 0).getDate())); end.setDate(end.getDate() - 1);
  var left = Math.ceil((end - new Date(new Date().toDateString())) / 864e5); if (left > 14) return;
  var b = document.createElement('div'); b.className = 'plus-pin no-print';
  b.innerHTML = '<i class="fa-solid fa-key"></i> Your PIN expires on <b>' + end.getFullYear() + '-' + z(end.getMonth() + 1) + '-' + z(end.getDate()) + '</b> (' + (left <= 0 ? 'last day' : left + ' day(s) left') + '). Get the new PIN before then.<button onclick="this.parentNode.remove()">&#10005;</button>';
  document.body.insertBefore(b, document.body.children[1] || null);
}

/* ---------- 13. UI injection + smooth styling ---------- */
function item(icon, label, sub, fn, extra) { return '<button class="tm-i" onclick="PLUS.menu(false);' + fn + '"><i class="fa-solid ' + icon + '"></i><span><b>' + label + '</b><small>' + sub + '</small></span>' + (extra || '') + '</button>'; }
PLUS.menu = function (on) {
  var m = $('#tools-menu'); if (on === false || (on === undefined && m)) { if (m) m.remove(); return; }
  if (m) return; m = document.createElement('div'); m.id = 'tools-menu'; m.className = 'no-print';
  m.innerHTML = item('fa-users', 'Patients', 'Search and reuse patient details', 'PLUS.patients()') + item('fa-receipt', 'Bill / Receipt', 'Make and print a receipt', 'PLUS.bill()') +
    item('fa-chart-simple', 'Today', 'Reports made and follow-ups due', 'PLUS.today()') + item('fa-pen-nib', 'My wording', 'Your saved sentences', 'PLUS.words()') +
    item('fa-print', 'Print', 'Print this document', 'window.print()') + '<div class="tm-sep"></div>' + item('fa-lock', 'Lock now', 'Locks again in <span id="plus-lockt">...</span>', 'PLUS.lock()');
  document.body.appendChild(m); lockTick();
  setTimeout(function () { document.addEventListener('mousedown', outside, true); document.addEventListener('touchstart', outside, true); }, 0);
};
function outside(e) { var m = $('#tools-menu'); if (m && !m.contains(e.target) && !e.target.closest('#tools-btn')) { m.remove(); document.removeEventListener('mousedown', outside, true); document.removeEventListener('touchstart', outside, true); } }
function inject() {
  var s = $('#tools-slot'); if (!s) return;
  s.outerHTML = '<button id="tools-btn" class="mh-btn" title="More tools" onclick="PLUS.menu()"><i class="fa-solid fa-ellipsis"></i><span>More</span><em id="plus-badge" style="display:none"></em></button>';
}
var css = document.createElement('style');
css.textContent = '@media screen{html{scroll-behavior:smooth}body.bg-slate-100{background:linear-gradient(180deg,#eef3f9,#f6f8fb 240px)}' +
  'header{backdrop-filter:blur(8px);background:linear-gradient(135deg,#0b2545,#134074)!important}' +
  'main section>div.bg-white,#saved-modal .bg-white{border-radius:16px!important;border-color:#e3e9f1!important;box-shadow:0 1px 2px rgba(15,35,70,.05),0 8px 24px -12px rgba(15,35,70,.15)!important}' +
  'button{transition:transform .15s ease,background-color .2s ease,box-shadow .2s ease,opacity .2s}button:active{transform:scale(.96)}' +
  '#form-fields-container input:not([type=checkbox]),#form-fields-container select,#form-fields-container textarea{border-radius:8px;transition:border-color .2s,box-shadow .2s,background .2s}' +
  '#form-fields-container input:focus,#form-fields-container select:focus,#form-fields-container textarea:focus{outline:none;border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.15);background:#fff}' +
  '#paper-scale{border-radius:6px;box-shadow:0 20px 50px -20px rgba(15,35,70,.35)}#toast{border-radius:12px;animation:pls-up .25s ease}' +
  '.plus-fade>*{animation:pls-in .35s ease both}.plus-fade>*:nth-child(2){animation-delay:.03s}.plus-fade>*:nth-child(3){animation-delay:.06s}.plus-fade>*:nth-child(n+4){animation-delay:.09s}' +
  '@keyframes pls-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@keyframes pls-up{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}' +
  '.mh-btn{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:54px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.1);color:#fff;font-size:10.5px;font-weight:600;line-height:1.1}.mh-btn i{font-size:16px}.mh-btn:hover{background:rgba(255,255,255,.2)}.mh-btn b{font-weight:700;color:#a5f3fc}.mh-green{background:#059669}.mh-green:hover{background:#10b981}' +
  '@media(min-width:768px){.mh-btn{flex-direction:row;gap:7px;font-size:13px;padding:8px 14px}.mh-btn i{font-size:14px}}@media(max-width:480px){header p.text-xs{display:none}header h1{font-size:18px!important}header .w-11{width:36px;height:36px}.mh-btn{min-width:48px;padding:6px 7px}}' +
  '.mh-btn em{position:absolute;top:-4px;right:-4px;background:#e11d48;font-style:normal;font-size:10px;font-weight:700;border-radius:9px;padding:0 5px;min-width:16px;text-align:center}' +
  '#tools-menu{position:fixed;top:64px;right:10px;z-index:1900;width:280px;max-width:calc(100vw - 20px);background:#fff;border-radius:16px;padding:6px;box-shadow:0 18px 40px -8px rgba(11,37,69,.4);border:1px solid #e3e9f1;animation:pls-in .18s ease}' +
  '.tm-i{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:10px;border-radius:10px;color:#0b2545}.tm-i:hover{background:#f0f7ff}.tm-i i{width:34px;height:34px;border-radius:10px;background:#eef4fb;color:#0369a1;display:flex;align-items:center;justify-content:center;font-size:14px;flex:none}.tm-i b{display:block;font-size:13.5px}.tm-i small{display:block;font-size:11px;color:#64748b}.tm-sep{height:1px;background:#e5eaf1;margin:4px 6px}' +
  '#saved-modal .sticky .bg-white\\/10{padding:10px 16px}' +
  '.plus-ov{position:fixed;inset:0;z-index:2000;background:rgba(11,37,69,.55);backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;animation:pls-fade .2s ease}@media(min-width:640px){.plus-ov{align-items:center}}@keyframes pls-fade{from{opacity:0}to{opacity:1}}' +
  '.plus-box{background:#fff;width:100%;max-width:520px;max-height:92vh;display:flex;flex-direction:column;border-radius:20px 20px 0 0;animation:pls-slide .28s cubic-bezier(.2,.8,.2,1)}@media(min-width:640px){.plus-box{border-radius:20px}}.plus-box.wide{max-width:640px}@keyframes pls-slide{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}' +
  '.plus-hd{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #e5eaf1;color:#0b2545;font-size:15px}.plus-bd{padding:14px 16px 18px;overflow-y:auto}' +
  '.plus-in{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:8px 10px;font-size:13px;background:#f8fafc}.plus-in:focus{outline:none;border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.15);background:#fff}' +
  '.plus-btn{background:#0369a1;color:#fff;font-weight:600;font-size:13px;padding:8px 14px;border-radius:10px;display:inline-flex;gap:6px;align-items:center}.plus-btn:hover{background:#075985}' +
  '.plus-chip{background:#eef4fb;color:#0c4a6e;border:1px solid #d3e2f3;font-size:11px;font-weight:600;padding:4px 9px;border-radius:999px}.plus-chip:hover{background:#dcebfa}' +
  '.plus-x{color:#e11d48;background:#fff1f2;border-radius:8px;padding:4px 9px;font-size:12px}.plus-row{display:flex;gap:8px;align-items:center;background:#f8fafc;border:1px solid #e5eaf1;border-radius:12px;padding:8px 10px}' +
  '.plus-card{background:#f8fafc;border:1px solid #e5eaf1;border-radius:12px;padding:10px;margin-top:12px}.plus-card.amber{background:#fffbeb;border-color:#fde68a}.plus-h{font-size:11px;font-weight:700;text-transform:uppercase;color:#0369a1;margin:14px 0 4px}' +
  '.plus-stat{background:#f0f7ff;border-radius:12px;padding:10px 4px}.plus-stat b{display:block;font-size:18px;color:#0b2545}.plus-stat span{font-size:10px;color:#64748b;text-transform:uppercase}' +
  '.plus-rcpt{background:#fff;border:1px dashed #94a3b8;border-radius:10px;padding:12px;margin-top:12px;color:#111}' +
  '.plus-bk{display:flex;gap:8px;align-items:center;border-radius:12px;padding:10px 12px;font-size:12.5px;margin-bottom:10px}.plus-bk.warn{background:#fffbeb;border:1px solid #fcd34d;color:#92400e}.plus-bk.ok{background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46}' +
  '.plus-draft{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:1500;background:#0b2545;color:#fff;font-size:13px;padding:10px 14px;border-radius:14px;display:flex;gap:10px;align-items:center;box-shadow:0 12px 30px rgba(0,0,0,.3);max-width:94vw;animation:pls-up .3s ease}' +
  '.plus-pin{background:#fef3c7;color:#92400e;font-size:12.5px;padding:6px 12px;text-align:center;border-bottom:1px solid #fcd34d}.plus-pin button{margin-left:10px}}' +
  '@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}' +
  '@media print{body.plus-printing *{visibility:hidden!important}body.plus-printing #plus-receipt,body.plus-printing #plus-receipt *{visibility:visible!important}body.plus-printing #plus-receipt{position:absolute;left:0;top:0;width:148mm;border:0}body.plus-printing .plus-ov{background:none!important}@page{size:A5}}';
document.head.appendChild(css);

window.addEventListener('load', function () {
  backfill(); inject(); badge(); setTimeout(function () { decorate(); draftPrompt(); }, 500);
  lockTick(); setInterval(lockTick, 5000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) lockTick(); });
  window.addEventListener('focus', lockTick);
});
})();
