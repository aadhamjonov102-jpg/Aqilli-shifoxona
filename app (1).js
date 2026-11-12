'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const KEY = 'aqilli_shifoxona_v1';
const SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];
const today = () => new Date().toISOString().slice(0, 10);

async function sha(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

let db;
async function loadDB() {
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
  if (!db) {
    db = {
      passHash: await sha('admin123'),
      departments: [
        {id:'d1', name:'Terapiya', icon:'🩺'}, {id:'d2', name:'Kardiologiya', icon:'❤️'},
        {id:'d3', name:'Nevrologiya', icon:'🧠'}, {id:'d4', name:'Pediatriya', icon:'🧒'},
        {id:'d5', name:'Stomatologiya', icon:'🦷'}, {id:'d6', name:'Ko\'z kasalliklari', icon:'👁️'},
        {id:'d7', name:'LOR', icon:'👂'}, {id:'d8', name:'Dermatologiya', icon:'🧴'}
      ],
      doctors: [
        {id:'k1', name:'Karimov Anvar', deptId:'d1', room:'101'},
        {id:'k2', name:'Rahimova Dilfuza', deptId:'d2', room:'205'},
        {id:'k3', name:'Yusupov Sherzod', deptId:'d3', room:'210'},
        {id:'k4', name:'Aliyeva Malika', deptId:'d4', room:'110'},
        {id:'k5', name:'Toshmatov Bobur', deptId:'d5', room:'301'}
      ],
      appts: []
    };
    save();
  }
}
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const dept = id => db.departments.find(d => d.id === id);
const doc = id => db.doctors.find(d => d.id === id);

/* ---------- Aqlli maslahat (oddiy qoida asosida) ---------- */
const RULES = [
  {k:['yurak','ko\'krak og\'ri','bosim','hansira','yurak urishi'], d:'Kardiologiya'},
  {k:['bosh og\'ri','bosh aylan','uyqusiz','migren','uvishish','hushdan'], d:'Nevrologiya'},
  {k:['tish','milk','og\'iz'], d:'Stomatologiya'},
  {k:['ko\'z','ko\'rish','qizarish ko\'z'], d:'Ko\'z kasalliklari'},
  {k:['quloq','tomoq','burun','angina','shamollash','tumov'], d:'LOR'},
  {k:['toshma','qichish','teri','sepkil','husnbuzar'], d:'Dermatologiya'},
  {k:['bola','chaqaloq','farzand'], d:'Pediatriya'},
  {k:['isitma','yo\'tal','holsizlik','qorin','oshqozon','ich ket','ko\'ngil aynish'], d:'Terapiya'}
];
function advise(text) {
  const t = text.toLowerCase();
  const scores = {};
  RULES.forEach(r => r.k.forEach(w => { if (t.includes(w)) scores[r.d] = (scores[r.d] || 0) + 1; }));
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const urgent = ['ko\'krak og\'ri','hushdan','nafas ol','qon ket','falaj'].some(w => t.includes(w));
  return {list: best.map(b => b[0]), urgent};
}

/* ---------- Sahifalar ---------- */
const views = {
  home() {
    const n = db.appts.filter(a => a.date === today()).length;
    return `<div class="hero"><h1>Aqilli shifoxonaga xush kelibsiz</h1>
      <p>Onlayn qabulga yoziling, navbatingizni kuzating va to'g'ri shifokorni toping.</p>
      <a class="btn" style="background:#fff;color:var(--p);text-decoration:none;display:inline-block" href="#book">Qabulga yozilish</a></div>
      <div class="grid">
        <div class="card stat"><b>${db.doctors.length}</b>Shifokorlar</div>
        <div class="card stat"><b>${db.departments.length}</b>Bo'limlar</div>
        <div class="card stat"><b>${n}</b>Bugungi qabullar</div>
      </div>
      <h2>Bo'limlar</h2>
      <div class="grid">${db.departments.map(d => `<div class="card">${esc(d.icon)} <b>${esc(d.name)}</b>
        <div style="color:var(--mu);font-size:13px;margin-top:6px">${db.doctors.filter(x => x.deptId === d.id).map(x => esc(x.name)).join(', ') || 'Shifokor yo\'q'}</div></div>`).join('')}</div>`;
  },
  ai() {
    return `<h2>🤖 Aqlli maslahat</h2><div class="card">
      <label>Nima bezovta qilyapti? (masalan: bosh og'rig'i va isitma)</label>
      <textarea id="sym" rows="3"></textarea>
      <button onclick="doAdvise()">Maslahat olish</button>
      <div id="advOut"></div>
      <div class="warn">⚠️ Bu tashxis emas, faqat qaysi bo'limga murojaat qilishni taklif qiladi. Og'ir holatda 103 ga qo'ng'iroq qiling.</div></div>`;
  },
  book() {
    return `<h2>📅 Qabulga yozilish</h2><div class="card"><form id="bf">
      <label>Ism-familiya</label><input id="bn" required>
      <label>Telefon</label><input id="bp" type="tel" placeholder="+998 90 123 45 67" required>
      <div class="row"><div><label>Bo'lim</label><select id="bd" required>
        <option value="">Tanlang</option>${db.departments.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></div>
      <div><label>Shifokor</label><select id="bdoc" required><option value="">Avval bo'lim</option></select></div></div>
      <div class="row"><div><label>Sana</label><input id="bdate" type="date" min="${today()}" required></div>
      <div><label>Vaqt</label><select id="btime" required></select></div></div>
      <label>Izoh (ixtiyoriy)</label><textarea id="bnote" rows="2"></textarea>
      <button>Yozilish</button><div id="bout"></div></form></div>`;
  },
  status() {
    return `<h2>🔎 Navbatim</h2><div class="card">
      <label>Telefon raqamingiz</label><input id="sp" type="tel">
      <button onclick="checkStatus()">Tekshirish</button><div id="sout"></div></div>`;
  },
  admin() {
    if (sessionStorage.getItem('adm') !== '1') {
      return `<h2>🔐 Admin kirish</h2><div class="card"><form id="lf">
        <label>Parol</label><input id="lp" type="password" required>
        <button>Kirish</button><div id="lout"></div>
        <div class="warn">Boshlang'ich parol: <b>admin123</b>. Kirgach, albatta o'zgartiring.</div></form></div>`;
    }
    const tab = window._tab || 'dash';
    const tabs = [['dash','📊 Statistika'],['appts','📋 Qabullar'],['docs','👨‍⚕️ Shifokorlar'],['deps','🏢 Bo\'limlar'],['set','⚙️ Sozlamalar']];
    return `<h2>Admin panel</h2><div class="row" style="margin-bottom:10px">${tabs.map(t => `<button class="${t[0] === tab ? '' : 'sec'}" onclick="setTab('${t[0]}')" style="margin:0">${t[1]}</button>`).join('')}</div>${adminTab(tab)}`;
  }
};

function tag(s) {
  const m = {kutilmoqda:'t-k', qabul_qilindi:'t-q', bekor:'t-b'};
  const l = {kutilmoqda:'Kutilmoqda', qabul_qilindi:'Qabul qilindi', bekor:'Bekor'};
  return `<span class="tag ${m[s]}">${l[s]}</span>`;
}

function adminTab(t) {
  if (t === 'dash') {
    const a = db.appts, c = s => a.filter(x => x.status === s).length;
    return `<div class="grid">
      <div class="card stat"><b>${a.length}</b>Jami qabullar</div>
      <div class="card stat"><b>${a.filter(x => x.date === today()).length}</b>Bugun</div>
      <div class="card stat"><b>${c('kutilmoqda')}</b>Kutilmoqda</div>
      <div class="card stat"><b>${c('qabul_qilindi')}</b>Qabul qilindi</div>
      <div class="card stat"><b>${new Set(a.map(x => x.phone)).size}</b>Bemorlar</div></div>`;
  }
  if (t === 'appts') {
    const rows = [...db.appts].sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
    return `<div class="card tw"><table><tr><th>Sana</th><th>Bemor</th><th>Shifokor</th><th>Holat</th><th></th></tr>
      ${rows.map(a => `<tr><td>${esc(a.date)}<br>${esc(a.time)}</td>
      <td>${esc(a.name)}<br><small>${esc(a.phone)}</small>${a.note ? `<br><small>📝 ${esc(a.note)}</small>` : ''}</td>
      <td>${esc(doc(a.doctorId)?.name || '—')}<br><small>${esc(dept(a.deptId)?.name || '')}</small></td>
      <td>${tag(a.status)}</td>
      <td><button class="sm grn" onclick="setSt('${a.id}','qabul_qilindi')">✔</button>
      <button class="sm red" onclick="setSt('${a.id}','bekor')">✖</button>
      <button class="sm sec" onclick="delAppt('${a.id}')">🗑</button></td></tr>`).join('') || '<tr><td colspan="5">Hozircha qabul yo\'q</td></tr>'}</table></div>`;
  }
  if (t === 'docs') {
    return `<div class="card"><b>Yangi shifokor</b><form id="df"><div class="row">
      <input id="dn" placeholder="Ism-familiya" required>
      <select id="dd" required>${db.departments.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select>
      <input id="dr" placeholder="Xona"></div><button>Qo'shish</button></form></div>
      <div class="card tw"><table>${db.doctors.map(d => `<tr><td>${esc(d.name)}</td><td>${esc(dept(d.deptId)?.name || '')}</td><td>${esc(d.room)}</td>
      <td><button class="sm red" onclick="delDoc('${d.id}')">O'chirish</button></td></tr>`).join('')}</table></div>`;
  }
  if (t === 'deps') {
    return `<div class="card"><b>Yangi bo'lim</b><form id="pf"><div class="row">
      <input id="pn" placeholder="Nomi" required><input id="pi" placeholder="Emoji (🏥)"></div><button>Qo'shish</button></form></div>
      <div class="card tw"><table>${db.departments.map(d => `<tr><td>${esc(d.icon)} ${esc(d.name)}</td>
      <td><button class="sm red" onclick="delDep('${d.id}')">O'chirish</button></td></tr>`).join('')}</table></div>`;
  }
  return `<div class="card"><b>Parolni o'zgartirish</b><form id="sf">
      <label>Yangi parol (kamida 6 belgi)</label><input id="np" type="password" minlength="6" required>
      <button>Saqlash</button><div id="sfo"></div></form></div>
    <div class="card"><b>Ma'lumotlar</b><br>
      <button class="sec" onclick="exportData()">⬇️ Zaxira nusxa (JSON)</button>
      <button class="sec" onclick="logout()">🚪 Chiqish</button></div>`;
}

/* ---------- Amallar ---------- */
window.setTab = t => { window._tab = t; render(); };
window.setSt = (id, s) => { db.appts.find(a => a.id === id).status = s; save(); render(); };
window.delAppt = id => { if (confirm('O\'chirilsinmi?')) { db.appts = db.appts.filter(a => a.id !== id); save(); render(); } };
window.delDoc = id => { if (confirm('O\'chirilsinmi?')) { db.doctors = db.doctors.filter(d => d.id !== id); save(); render(); } };
window.delDep = id => {
  if (db.doctors.some(d => d.deptId === id)) return alert('Avval bu bo\'limdagi shifokorlarni o\'chiring');
  if (confirm('O\'chirilsinmi?')) { db.departments = db.departments.filter(d => d.id !== id); save(); render(); }
};
window.logout = () => { sessionStorage.removeItem('adm'); render(); };
window.exportData = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], {type: 'application/json'}));
  a.download = 'shifoxona-zaxira.json'; a.click();
};
window.doAdvise = () => {
  const r = advise($('#sym').value);
  let h = '';
  if (r.urgent) h += '<div class="msg err">🚨 Alomatlar jiddiy bo\'lishi mumkin. Zudlik bilan 103 ga qo\'ng\'iroq qiling.</div>';
  h += r.list.length
    ? `<div class="msg">Tavsiya etilgan bo'lim: <b>${r.list.map(esc).join(', ')}</b>. <a href="#book">Qabulga yozilish →</a></div>`
    : '<div class="msg">Aniq bo\'lim topilmadi. <b>Terapiya</b> shifokoriga murojaat qiling.</div>';
  $('#advOut').innerHTML = h;
};
window.checkStatus = () => {
  const p = $('#sp').value.replace(/\D/g, '');
  const list = db.appts.filter(a => p && a.phone.replace(/\D/g, '').endsWith(p.slice(-9)));
  $('#sout').innerHTML = list.length ? list.map(a => `<div class="card" style="margin-top:10px">
    ${esc(a.date)} ${esc(a.time)} — ${esc(doc(a.doctorId)?.name || '')} (xona ${esc(doc(a.doctorId)?.room || '-')}) ${tag(a.status)}</div>`).join('')
    : '<div class="msg err">Bunday raqam bo\'yicha qabul topilmadi</div>';
};

function bindForms() {
  const bd = $('#bd');
  if (bd) {
    const fillTimes = () => {
      const d = $('#bdoc').value, dt = $('#bdate').value;
      const taken = db.appts.filter(a => a.doctorId === d && a.date === dt && a.status !== 'bekor').map(a => a.time);
      $('#btime').innerHTML = SLOTS.map(s => `<option ${taken.includes(s) ? 'disabled' : ''}>${s}${taken.includes(s) ? ' (band)' : ''}</option>`).join('');
    };
    bd.onchange = () => {
      $('#bdoc').innerHTML = db.doctors.filter(x => x.deptId === bd.value).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('') || '<option value="">Shifokor yo\'q</option>';
      fillTimes();
    };
    $('#bdoc').onchange = fillTimes; $('#bdate').onchange = fillTimes; fillTimes();
    $('#bf').onsubmit = e => {
      e.preventDefault();
      const time = $('#btime').value.replace(' (band)', '');
      if (!$('#bdoc').value) return;
      db.appts.push({id: uid(), name: $('#bn').value.trim(), phone: $('#bp').value.trim(), deptId: bd.value,
        doctorId: $('#bdoc').value, date: $('#bdate').value, time, note: $('#bnote').value.trim(),
        status: 'kutilmoqda', created: Date.now()});
      save();
      $('#bout').innerHTML = '<div class="msg">✅ Qabulga yozildingiz! Holatni "Navbatim" bo\'limida tekshiring.</div>';
      $('#bf').reset(); fillTimes();
    };
  }
  const lf = $('#lf');
  if (lf) lf.onsubmit = async e => {
    e.preventDefault();
    if (await sha($('#lp').value) === db.passHash) { sessionStorage.setItem('adm', '1'); render(); }
    else $('#lout').innerHTML = '<div class="msg err">Parol noto\'g\'ri</div>';
  };
  const df = $('#df');
  if (df) df.onsubmit = e => { e.preventDefault(); db.doctors.push({id: uid(), name: $('#dn').value.trim(), deptId: $('#dd').value, room: $('#dr').value.trim()}); save(); render(); };
  const pf = $('#pf');
  if (pf) pf.onsubmit = e => { e.preventDefault(); db.departments.push({id: uid(), name: $('#pn').value.trim(), icon: $('#pi').value.trim() || '🏥'}); save(); render(); };
  const sf = $('#sf');
  if (sf) sf.onsubmit = async e => { e.preventDefault(); db.passHash = await sha($('#np').value); save(); $('#sfo').innerHTML = '<div class="msg">✅ Parol yangilandi</div>'; };
}

function render() {
  const page = (location.hash || '#home').slice(1);
  const v = views[page] ? page : 'home';
  $('#app').innerHTML = views[v]();
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + v));
  bindForms();
}

/* ---------- PWA ---------- */
let deferred;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#installBtn').hidden = false; });
$('#installBtn').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#installBtn').hidden = true; };
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

window.addEventListener('hashchange', render);
loadDB().then(render);
