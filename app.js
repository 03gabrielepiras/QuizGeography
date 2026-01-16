let DATA = [];
let order = [];
let mode = 'train'; // train | exam
let pos = 0;
let started = false;
let startEpoch = null;
let timerHandle = null;
let answers = new Map(); // q.number -> {chosen, correct}

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
const elDid = document.getElementById('didyouknow');
const elCat = document.getElementById('categoryLabel');
const elResults = document.getElementById('results');
const elResultsBody = document.getElementById('resultsBody');

const startBtn = document.getElementById('startBtn');
const finishBtn = document.getElementById('finishBtn');
const restartBtn = document.getElementById('restartBtn');
const modeBtn = document.getElementById('modeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// iOS: blocca doppio tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e){
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, {passive:false});

function fmtTime(ms){
  const s = Math.floor(ms/1000);
  const m = String(Math.floor(s/60)).padStart(2,'0');
  const r = String(s%60).padStart(2,'0');
  return m+':'+r;
}

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function didYouKnowText(cat){
  const tips = {
    'Demografia': [
      'Un saldo naturale negativo significa che muoiono più persone di quante ne nascano.',
      'Il valore 2,1 figli per donna è la soglia di rimpiazzo generazionale.',
      'La piramide delle età mostra se una popolazione è giovane o anziana.'
    ],
    'Migrazioni': [
      'Push factors = cause di spinta (guerre, povertà). Pull factors = attrazione (lavoro, servizi).',
      'Le rimesse sono denaro inviato dai migranti alle famiglie nel Paese d’origine.',
      'Le migrazioni influenzano anche la struttura per età del Paese di arrivo.'
    ],
    'Città': [
      'Urbanizzazione = crescita della popolazione urbana e delle città.',
      'Conurbazione = città vicine che crescono fino a unirsi.',
      'Sostenibilità urbana: trasporti pubblici e meno inquinamento migliorano la vita.'
    ]
  };
  const list = tips[cat] || ['Ripassa le parole chiave del capitolo.'];
  return list[Math.floor(Math.random() * list.length)];
}

function buildIndex(){
  elIndex.innerHTML = '';
  for (let p=0; p<order.length; p++){
    const q = DATA[order[p]];
    const b = document.createElement('button');
    b.className = 'qbtn';
    b.textContent = q.number;
    b.addEventListener('click', ()=>{ pos=p; render(); });
    elIndex.appendChild(b);
  }
  paintIndex();
}

function paintIndex(){
  const btns = elIndex.querySelectorAll('.qbtn');
  btns.forEach((b,p)=>{
    b.classList.remove('current','good','bad');
    if (p===pos) b.classList.add('current');
    const q = DATA[order[p]];
    const a = answers.get(q.number);
    if (a && a.chosen) b.classList.add(a.correct ? 'good' : 'bad');
  });
}

function updateScore(){
  let ok = 0;
  for (const q of DATA){
    const a = answers.get(q.number);
    if (a && a.chosen && a.correct) ok++;
  }
  elScore.textContent = ok;
}

function currentQ(){
  return DATA[order[pos]];
}

function render(){
  const q = currentQ();
  elCat.textContent = q.category + ' · Domanda ' + (pos+1) + '/' + order.length;
  elPrompt.textContent = q.prompt;

  elOptions.innerHTML = '';
  elExplain.style.display = 'none';
  elDid.textContent = '💡 ' + didYouKnowText(q.category);

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

  prevBtn.disabled = !started || pos===0;
  nextBtn.disabled = !started || pos===order.length-1;
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
  const q = currentQ();
  if (answers.get(q.number)?.chosen) return;

  const correct = (letter === q.correct_letter);
  answers.set(q.number, { chosen: letter, correct: correct });

  const a = answers.get(q.number);
  lockPaint(q, a);

  // Allenamento: spiega subito. Verifica: niente spiegazione fino alla fine.
  if (mode === 'train') showExplain(q, a);

  paintIndex();
  updateScore();

  // Verifica: fine automatica dopo ultima domanda
  if (mode === 'exam' && pos === order.length - 1){
    finish();
  }
}

function start(){
  if (started) return;
  started = true;
  elResults.style.display = 'none';
  startEpoch = Date.now();
  timerHandle = setInterval(()=>{
    elTimer.textContent = fmtTime(Date.now() - startEpoch);
  }, 250);
  startBtn.disabled = true;

  // In Verifica: mischia l’ordine delle domande all’avvio
  if (mode === 'exam'){
    order = shuffle(order);
    pos = 0;
    buildIndex();
  }

  render();
}

function computeReport(){
  const total = order.length;
  let ok = 0;
  const catStats = {
    'Demografia': {ok:0, done:0},
    'Migrazioni': {ok:0, done:0},
    'Città': {ok:0, done:0},
  };

  for (const idxQ of order){
    const q = DATA[idxQ];
    const a = answers.get(q.number);
    if (a && a.chosen){
      catStats[q.category].done++;
      if (a.correct){
        ok++;
        catStats[q.category].ok++;
      }
    }
  }

  const voto = Math.round(((ok/total)*10)*2)/2;

  function targetLabel(pct){
    if (pct >= 80) return '✅ Compito';
    if (pct >= 60) return '⚠️ Parziale';
    return '❌ Mancato';
  }

  const rows = Object.entries(catStats).map(([cat,s])=>{
    const pct = s.done ? Math.round((s.ok/s.done)*100) : 0;
    return {cat, ok:s.ok, done:s.done, pct, target: targetLabel(pct)};
  });

  const considered = rows.filter(r=>r.done>0).sort((a,b)=>a.pct-b.pct);
  const worst = considered[0] || null;

  return {total, ok, voto, rows, worst};
}

function finish(){
  if (!started) return;
  clearInterval(timerHandle);
  timerHandle = null;
  started = false;
  startBtn.disabled = false;

  const rep = computeReport();
  elResults.style.display = 'block';

  let h = '';
  h += '<div><strong>Punteggio:</strong> '+rep.ok+'/'+rep.total+'</div>';
  h += '<div><strong>Voto (stima):</strong> '+rep.voto+'/10</div>';
  h += '<div><strong>Tempo:</strong> '+elTimer.textContent+'</div>';
  h += '<hr>';
  h += '<div><strong>Mini report (target compiuti/mancati)</strong></div>';
  h += '<table><thead><tr><th>Categoria</th><th>Corrette</th><th>Accuratezza</th><th>Target</th></tr></thead><tbody>';
  rep.rows.forEach(r=>{
    h += '<tr><td>'+r.cat+'</td><td>'+r.ok+'/'+r.done+'</td><td>'+r.pct+'%</td><td>'+r.target+'</td></tr>';
  });
  h += '</tbody></table>';

  if (rep.worst){
    h += '<div class="note" style="margin-top:10px;">';
    h += '<div class="title">Consiglio di ripasso</div>';
    h += 'Ripassa prima <strong>'+rep.worst.cat+'</strong> (accuratezza '+rep.worst.pct+'%).';
    h += '</div>';
  }

  elResultsBody.innerHTML = h;
  elResults.scrollIntoView();
}

function restart(){
  clearInterval(timerHandle);
  timerHandle = null;
  started = false;
  answers = new Map();
  pos = 0;
  elTimer.textContent = '00:00';
  elResults.style.display = 'none';
  startBtn.disabled = false;

  // ordine normale (in Verifica verrà mischiato quando premi Avvia)
  order = Array.from({length: DATA.length}, (_,i)=>i);
  buildIndex();
  render();
  updateScore();
}

function toggleMode(){
  mode = (mode === 'train') ? 'exam' : 'train';
  modeBtn.textContent = 'Modalità: ' + (mode === 'train' ? 'Allenamento' : 'Verifica');
  elExplain.style.display = 'none';
  order = Array.from({length: DATA.length}, (_,i)=>i);
  pos = 0;
  buildIndex();
  render();
}

startBtn.addEventListener('click', start);
finishBtn.addEventListener('click', finish);
restartBtn.addEventListener('click', restart);
modeBtn.addEventListener('click', toggleMode);
prevBtn.addEventListener('click', ()=>{ if(pos>0){ pos--; render(); }});
nextBtn.addEventListener('click', ()=>{ if(pos<order.length-1){ pos++; render(); }});

async function init(){
  const resp = await fetch('./quiz_data.json', {cache:'no-store'});
  DATA = await resp.json();

  // Se non hai già la proprietà category, la aggiungo in base al numero
  DATA.forEach((q,i)=>{
    if (!q.category){
      if (q.number <= 25) q.category = 'Demografia';
      else if (q.number <= 50) q.category = 'Migrazioni';
      else q.category = 'Città';
    }
  });

  elTotal.textContent = DATA.length;
  order = Array.from({length: DATA.length}, (_,i)=>i);
  buildIndex();
  render();
  updateScore();
}
init().catch(err=>{
  elPrompt.textContent = 'Errore nel caricamento dei dati (quiz_data.json).';
  console.error(err);
});
