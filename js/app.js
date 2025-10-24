let currentMode = 'materi';
let beforeInstallPrompt = null;

/* ====== INSTALL PWA (REAL) ====== */
const btnInstall = $('#btn-install');

// Sembunyikan tombol jika sudah standalone
function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}
function refreshInstallVisibility(){
  btnInstall.style.display = (!isStandalone() && beforeInstallPrompt) ? 'inline-block' : 'none';
}
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  beforeInstallPrompt = e;
  refreshInstallVisibility();
});
window.addEventListener('appinstalled', () => {
  beforeInstallPrompt = null;
  refreshInstallVisibility();
});
btnInstall.addEventListener('click', async () => {
  if(beforeInstallPrompt){
    beforeInstallPrompt.prompt();
    await beforeInstallPrompt.userChoice;
    beforeInstallPrompt = null;
    refreshInstallVisibility();
  }
});
refreshInstallVisibility();

/* ====== THEME TOGGLER (REAL + PERSIST) ====== */
const META_THEME = document.querySelector('#meta-theme-color');
const LIGHT_CSS_ID = 'light-theme-vars';

// CSS variabel untuk light diinjeksikan via <style> agar tidak perlu edit file CSS
const LIGHT_CSS = `
:root{
  --bg:#f3f4f6; --card:#ffffff; --text:#0f172a; --muted:#475569;
  --accent:#0ea5e9; --accent-2:#22c55e; --border:#e5e7eb;
}
body{background:linear-gradient(180deg,#f3f6fb 0%,#eef2f7 100%) !important; color:var(--text) !important;}
`;

function applyTheme(theme){
  const isLight = theme === 'light';
  // inject/remove style
  let tag = document.getElementById(LIGHT_CSS_ID);
  if(isLight){
    if(!tag){
      tag = document.createElement('style');
      tag.id = LIGHT_CSS_ID;
      tag.textContent = LIGHT_CSS;
      document.head.appendChild(tag);
    }
    document.body.classList.add('light');
    META_THEME && (META_THEME.content = '#ffffff');
  }else{
    if(tag) tag.remove();
    document.body.classList.remove('light');
    META_THEME && (META_THEME.content = '#0ea5e9');
  }
  localStorage.setItem('app.theme', theme);
}
applyTheme(localStorage.getItem('app.theme') || 'dark');

$('#btn-theme').addEventListener('click', () => {
  const next = (localStorage.getItem('app.theme') || 'dark') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

/* ====== RENDER MATERI (pakai innerHTML untuk contoh & solusi) ====== */
function renderMateri(){
  const level = $('#level').value;
  const L = LEVELS[level];
  $('#materi-text').textContent = L.materi;
  const ex = exampleFor(level);
  // pakai innerHTML agar contoh bisa kaya format
  $('#contoh-wrap').innerHTML = ex.q;
  $('#penyelesaian').innerHTML = ex.s;
}

/* ====== MODE SWITCH ====== */
function switchMode(mode){
  currentMode = mode;
  $$('.seg').forEach(b=>b.classList.toggle('active', b.dataset.mode===mode));
  $('#materi').classList.toggle('hidden', mode!=='materi');
  $('#latihan').classList.toggle('hidden', mode!=='latihan');
  $('#report').classList.toggle('hidden', mode!=='report');
  if(mode==='materi') renderMateri();
  if(mode==='report') renderReport();
}
$$('.seg').forEach(b=>b.addEventListener('click', ()=>switchMode(b.dataset.mode)));
$('#level').addEventListener('change', ()=>{
  if(currentMode==='materi') renderMateri();
});

/* ====== LATIHAN (Countdown & Stopwatch) ====== */
let session = {
  level:null, questions:[], startTS:0, endTS:0,
  timer:null, leftSec:0, // untuk countdown
  elapsedSec:0,          // untuk stopwatch
  mode:'countdown'       // 'countdown' | 'stopwatch'
};

$('#btn-start').addEventListener('click', ()=>{
  const level = $('#level').value;
  const n = Math.max(5, Math.min(50, parseInt($('#jumlah').value||'10',10)));
  const timerSel = $('#timer-select').value;

  session.level = level;
  session.questions = generateQuestions(level, n);
  session.startTS = Date.now();
  session.endTS = 0;
  session.elapsedSec = 0;

  $('#soal-wrap').innerHTML = session.questions.map((q,i)=>`
    <div class="soal-item" data-i="${i}">
      <div class="soal-question">${i+1}. ${q.q}</div>
      <input class="input soal-input" type="text" placeholder="Jawaban" />
    </div>
  `).join('');
  $('#aksi-latihan').classList.remove('hidden');

  if(session.timer){ clearInterval(session.timer); session.timer=null; }
  $('#timer').classList.remove('hidden');

  if(timerSel==='off'){
    // STOPWATCH (naik)
    session.mode = 'stopwatch';
    session.timer = setInterval(()=>{
      session.elapsedSec++;
      $('#timer').textContent = formatSeconds(session.elapsedSec);
    },1000);
    // tampilkan 00:00 saat mulai
    $('#timer').textContent = '00:00';
  }else{
    // COUNTDOWN (turun)
    session.mode = 'countdown';
    session.leftSec = parseInt(timerSel,10);
    $('#timer').textContent = formatSeconds(session.leftSec);
    session.timer = setInterval(()=>{
      session.leftSec--;
      $('#timer').textContent = formatSeconds(session.leftSec);
      if(session.leftSec<=0){ clearInterval(session.timer); session.timer=null; finishSession(); }
    },1000);
  }

  window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
});

$('#btn-reset').addEventListener('click', ()=>{
  if(session.timer) clearInterval(session.timer);
  session.timer = null;
  $('#soal-wrap').innerHTML='';
  $('#aksi-latihan').classList.add('hidden');
  $('#timer').classList.add('hidden');
});

$('#btn-selesai').addEventListener('click', finishSession);

async function finishSession(){
  session.endTS = Date.now();
  if(session.timer){ clearInterval(session.timer); session.timer=null; }

  const inputs = $$('.soal-input');
  let correct=0;
  const answerSheet = [];
  inputs.forEach((inp,idx)=>{
    const userAns = (inp.value||'').trim().toLowerCase();
    const key = String(session.questions[idx].a).trim().toLowerCase();
    const ok = userAns === key;
    if(ok) correct++;
    answerSheet.push({q: session.questions[idx].q, a: session.questions[idx].a, u: inp.value, ok});
    inp.style.borderColor = ok ? '#22c55e' : '#ef4444';
  });

  // waktu simpan: selalu presisi dari timestamp (berlaku utk countdown & stopwatch)
  const timeSec = Math.round(((session.endTS - session.startTS)/1000));

  await addSession(session.level, {
    dateISO: new Date(session.endTS).toISOString(),
    count: session.questions.length, correct, timeSec, answers: answerSheet
  });

  alert(`Selesai! Skor: ${correct}/${session.questions.length} | Waktu: ${formatSeconds(timeSec)}`);
  renderReport();
}

/* ====== REPORT ====== */
async function renderReport(){
  const level = $('#level').value;
  const all = await getAllProgress();
  const p = all.find(x=>x.level===level) || {attempts:0,correct:0,totalTimeSec:0,sessions:[]};
  const acc = p.attempts ? (p.correct/p.attempts*100).toFixed(1) : '0.0';
  const avgTime = p.attempts ? Math.round(p.totalTimeSec/p.attempts) : 0;
  $('#stats').innerHTML = `
    <div class="stat"><h4>Level</h4><div>${LEVELS[level].name}</div></div>
    <div class="stat"><h4>Total Soal Dikerjakan</h4><div class="big">${fmt(p.attempts||0)}</div></div>
    <div class="stat"><h4>Benar</h4><div class="big">${fmt(p.correct||0)}</div></div>
    <div class="stat"><h4>Akurasi</h4><div class="big">${acc}%</div></div>
    <div class="stat"><h4>Rata-rata Waktu per Soal</h4><div class="big">${formatSeconds(avgTime)}</div></div>
  `;

  const rows = (p.sessions||[]).slice(-10).reverse().map((s,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${new Date(s.dateISO).toLocaleString('id-ID')}</td>
      <td>${s.count}</td>
      <td>${s.correct}</td>
      <td>${formatSeconds(s.timeSec)}</td>
      <td>${(s.correct/s.count*100).toFixed(1)}%</td>
    </tr>
  `).join('');

  $('#print-area').innerHTML = `
    <div class="print-a4">
      <h1>Laporan Kemajuan Belajar</h1>
      <div class="muted">${LEVELS[level].name} • Dicetak: ${new Date().toLocaleString('id-ID')}</div>
      <table class="mt-2">
        <thead>
          <tr>
            <th>#</th><th>Tanggal</th><th>Soal</th><th>Benar</th><th>Waktu</th><th>Akurasi</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">Belum ada sesi.</td></tr>'}</tbody>
      </table>
    </div>
    <div class="print-receipt hidden"></div>
  `;
}

/* ====== CETAK ====== */
$('#btn-print-a4').addEventListener('click', ()=>{
  // pastikan CSS thermal tidak aktif
  const link = document.querySelector('link[href="css/print-58.css"]');
  if(link) link.parentNode.removeChild(link);
  window.print();
});

$('#btn-print-58').addEventListener('click', ()=>{
  // inject CSS 58mm lalu print
  if(!document.querySelector('link[href="css/print-58.css"]')){
    const l = document.createElement('link');
    l.rel='stylesheet'; l.href='css/print-58.css'; l.media='print';
    document.head.appendChild(l);
  }
  const level = $('#level').value;
  const area = $('.print-receipt');
  const now = new Date().toLocaleString('id-ID');
  area.classList.remove('hidden');
  // Ringkasan cepat (ambil 10 sesi terakhir)
  area.innerHTML = `
    <div class="print-receipt">
      <h2>Belajar Matematika</h2>
      <div>${LEVELS[level].name}</div>
      <div class="line"></div>
      <div>Tgl: ${now}</div>
      <div class="line"></div>
      <div class="small">Gunakan mode "Report" untuk detail lengkap.</div>
    </div>
  `;
  window.print();
  setTimeout(()=>area.classList.add('hidden'), 300);
});

$('#btn-export-json').addEventListener('click', async ()=>{
  const data = await getAllProgress();
  downloadText('progress.json', JSON.stringify(data, null, 2));
});

// init
renderMateri();
switchMode('materi');
