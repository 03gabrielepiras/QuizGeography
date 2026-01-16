let DATA = [];
const CHAPTERS = [
  {label:'⚖️ Stato e legalità', range:[1,10]},
  {label:'👤 Persona e capacità', range:[11,35]},
  {label:'🏛️ Stato e governo', range:[36,60]},
  {label:'🧠 Consolidamento', range:[61,90]},
];

function chapterOf(n){
  for (const c of CHAPTERS){
    if (n>=c.range[0] && n<=c.range[1]) return c.label;
  }
  return '';
}

// iOS: anti double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e){
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, {passive:false});

let mode = 'train'; // train | exam
let idx = 0;
let started = false;
let startEpoch = null;
let timerHandle = null;
let answers = new Map(); // number -> {chosen, correct}

const elTimer = document.getElementById('timer');
const elScore = document.getElementById('score');
const elTotal = document.getElementById('total');
const elIndex = document.getElementById('index');
const elPrompt = document.getElementById('prompt');
const elOptions = document.getElementById('options');
const elExplain = document.getElementById('explain');
const elExplainTitle = document.getElementById('explainTitle');
const elExplainText = document.getElementById('explainText');
const elExplainLong = document.getElementById('explainLong');
const elChapter = document.getElementById('chapterLabel');
const elResults = document.getElementById('results');
const elResultsBody = document.getElementById('resultsBody');

const startBtn = document.getElementById('startBtn');
const finishBtn = document.getElementById('finishBtn');
const restartBtn = document.getElementById('restartBtn');
const modeBtn = document.getElementById('modeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function fmtTime(ms){
  const s = Math.floor(ms/1000);
  const m = String(Math.floor(s/60)).padStart(2,'0');
  const r = String(s%60).padStart(2,'0');
  return m+':'+r;
}

function updateScore(){
  let ok = 0;
  for (const q of DATA){
    const a = answers.get(q.number);
    if (a && a.chosen && a.correct) ok++;
  }
  elScore.textContent = ok;
}

function buildIndex(){
  elIndex.innerHTML = '';
  for (let i=0;i<DATA.length;i++){
    const q = DATA[i];
    const b = document.createElement('button');
    b.className = 'qbtn';
    b.textContent = q.number;
    b.addEventListener('click', ()=>{ idx=i; render(); });
    elIndex.appendChild(b);
  }
  paintIndex();
}

function paintIndex(){
  const btns = elIndex.querySelectorAll('.qbtn');
  btns.forEach((b,i)=>{
    b.classList.remove('current','good','bad');
    if (i===idx) b.classList.add('current');
    const q = DATA[i];
    const a = answers.get(q.number);
    if (a && a.chosen) b.classList.add(a.correct ? 'good' : 'bad');
  });
}

function render(){
  const q = DATA[idx];
  elChapter.textContent = chapterOf(q.number) + ' · Domanda ' + (idx+1) + '/' + DATA.length;
  elPrompt.textContent = q.prompt;

  elOptions.innerHTML = '';
  elExplain.style.display = 'none';

  const letters = ['A','B','C','D'];
  for (const L of letters){
    const btn = document.createElement('button');
    btn.className = 'opt';
    btn.textContent = L + ') ' + q[L];
    btn.disabled = !started;
    btn.addEventListener('click', ()=>answer(L));
    elOptions.appendChild(btn);
  }

  const a = answers.get(q.number);
  if (a && a.chosen){
    lockPaint(q, a);
    if (mode === 'train') showExplain(q, a);
  }

  prevBtn.disabled = !started || idx===0;
  nextBtn.disabled = !started || idx===DATA.length-1;
  paintIndex();
  updateScore();
}

function lockPaint(q, a){
  const opts = elOptions.querySelectorAll('.opt');
  opts.forEach(btn=>{
    btn.disabled = true;
    const L = btn.textContent.trim().charAt(0);
    if (L === q.correct_letter) btn.classList.add('good');
    if (a.chosen === L && !a.correct) btn.classList.add('bad');
  });
}

function showExplain(q, a){
  elExplain.style.display = 'block';
  elExplainTitle.textContent = a.correct ? 'Corretto' : 'Sbagliato';
  elExplainText.textContent = a.correct
    ? 'Hai scelto la risposta giusta.'
    : ('Risposta corretta: ' + q.correct_letter + ') ' + q.correct_text);
  elExplainLong.textContent = q.explanation || '';
}

function answer(letter){
  if (!started) return;
  const q = DATA[idx];
  if (answers.get(q.number)?.chosen) return;

  const correct = (letter === q.correct_letter);
  answers.set(q.number, { chosen: letter, correct: correct });

  const a = answers.get(q.number);
  lockPaint(q, a);

  if (mode === 'train') showExplain(q, a);

  paintIndex();
  updateScore();

  if (mode === 'exam' && idx === DATA.length - 1){
    finish();
  }
}

function start(){
  if (started) return;
  started = true;
  startEpoch = Date.now();
  timerHandle = setInterval(()=>{
    elTimer.textContent = fmtTime(Date.now() - startEpoch);
  }, 250);
  startBtn.disabled = true;
  render();
}

function statRange(a,b){
  const qs = DATA.filter(q=>q.number>=a && q.number<=b);
  let done=0, good=0;
  for (const q of qs){
    const an = answers.get(q.number);
    if (an && an.chosen){ done++; if (an.correct) good++; }
  }
  const pct = done ? Math.round((good/done)*100) : 0;
  return {done, good, pct};
}

function finish(){
  if (!started) return;
  clearInterval(timerHandle);
  timerHandle = null;
  started = false;
  startBtn.disabled = false;

  const total = DATA.length;
  let ok = 0;
  for (const q of DATA){
    const a = answers.get(q.number);
    if (a && a.chosen && a.correct) ok++;
  }
  const voto = Math.round(((ok/total)*10)*2)/2;

  const s1 = statRange(1,10);
  const s2 = statRange(11,35);
  const s3 = statRange(36,60);
  const s4 = statRange(61,90);

  const worst = [
    {name:'Stato e legalità', p:s1.pct},
    {name:'Persona e capacità', p:s2.pct},
    {name:'Stato e governo', p:s3.pct},
    {name:'Consolidamento', p:s4.pct},
  ].sort((x,y)=>x.p-y.p)[0];

  elResults.style.display = 'block';
  elResultsBody.innerHTML =
    '<div><strong>Punteggio:</strong> '+ok+'/'+total+'</div>' +
    '<div><strong>Voto (stima):</strong> '+voto+'/10</div>' +
    '<div><strong>Tempo:</strong> '+elTimer.textContent+'</div>' +
    '<hr>' +
    '<div><strong>Statistiche per capitolo:</strong></div>' +
    '<div>⚖️ Stato e legalità: '+s1.pct+'% (Corrette '+s1.good+'/'+s1.done+')</div>' +
    '<div>👤 Persona e capacità: '+s2.pct+'% (Corrette '+s2.good+'/'+s2.done+')</div>' +
    '<div>🏛️ Stato e governo: '+s3.pct+'% (Corrette '+s3.good+'/'+s3.done+')</div>' +
    '<div>🧠 Consolidamento: '+s4.pct+'% (Corrette '+s4.good+'/'+s4.done+')</div>' +
    '<hr>' +
    '<div><strong>Consiglio:</strong> Rivedi prima '+worst.name+' (accuratezza '+worst.p+'%).</div>';

  elResults.scrollIntoView();
}

function restart(){
  clearInterval(timerHandle);
  timerHandle = null;
  started = false;
  answers = new Map();
  idx = 0;
  elTimer.textContent = '00:00';
  elResults.style.display = 'none';
  startBtn.disabled = false;
  render();
}

function toggleMode(){
  mode = (mode === 'train') ? 'exam' : 'train';
  modeBtn.textContent = 'Modalità: ' + (mode === 'train' ? 'Allenamento' : 'Verifica');
  elExplain.style.display = 'none';
  render();
}

startBtn.addEventListener('click', start);
finishBtn.addEventListener('click', finish);
restartBtn.addEventListener('click', restart);
modeBtn.addEventListener('click', toggleMode);
prevBtn.addEventListener('click', ()=>{ if(idx>0){ idx--; render(); }});
nextBtn.addEventListener('click', ()=>{ if(idx<DATA.length-1){ idx++; render(); }});

async function init(){
  const resp = await fetch('./quiz_data.json', {cache:'no-store'});
  DATA = await resp.json();
  elTotal.textContent = DATA.length;
  buildIndex();
  render();
}
init().catch(err=>{
  elPrompt.textContent = 'Errore nel caricamento dei dati (quiz_data.json).';
  console.error(err);
});
