 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app.js b/app.js
index ae20d81a603aca62cd4f72c135aa559723614e19..721f99bcf5d04d82f0ee05fb977536373f909882 100644
--- a/app.js
+++ b/app.js
@@ -1,336 +1,454 @@
 let DATA = [];
 let order = [];
-let mode = 'train'; // train | exam
+let mode = 'train';
 let pos = 0;
 let started = false;
 let startEpoch = null;
 let timerHandle = null;
-let answers = new Map(); // q.number -> {chosen, correct}
+let answers = new Map();
 
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
+const elGoal = document.getElementById('goal');
+const elClassName = document.getElementById('className');
+const elClassInfo = document.getElementById('classInfo');
+const elClassResults = document.getElementById('classResults');
 
 const startBtn = document.getElementById('startBtn');
 const finishBtn = document.getElementById('finishBtn');
 const restartBtn = document.getElementById('restartBtn');
 const modeBtn = document.getElementById('modeBtn');
 const prevBtn = document.getElementById('prevBtn');
 const nextBtn = document.getElementById('nextBtn');
+const classInput = document.getElementById('classInput');
+const goalInput = document.getElementById('goalInput');
+const classLoadBtn = document.getElementById('classLoadBtn');
+const goalSaveBtn = document.getElementById('goalSaveBtn');
+
+const STORAGE_KEY = 'quiz-geografia-classi';
+const LAST_CLASS_KEY = 'quiz-geografia-last-class';
+let currentClass = null;
 
-// iOS: blocca doppio tap zoom
 let lastTouchEnd = 0;
-document.addEventListener('touchend', function(e){
+document.addEventListener('touchend', (event) => {
   const now = Date.now();
-  if (now - lastTouchEnd <= 300) e.preventDefault();
+  if (now - lastTouchEnd <= 300) event.preventDefault();
   lastTouchEnd = now;
 }, {passive:false});
 
 function fmtTime(ms){
-  const s = Math.floor(ms/1000);
-  const m = String(Math.floor(s/60)).padStart(2,'0');
-  const r = String(s%60).padStart(2,'0');
-  return m+':'+r;
+  const s = Math.floor(ms / 1000);
+  const m = String(Math.floor(s / 60)).padStart(2,'0');
+  const r = String(s % 60).padStart(2,'0');
+  return `${m}:${r}`;
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
 
+function targetLabel(pct){
+  if (pct >= 80) return '✅ Compito';
+  if (pct >= 60) return '⚠️ Parziale';
+  return '❌ Mancato';
+}
+
+function goalStatusLabel(pct, goalPct){
+  if (goalPct === null || goalPct === undefined || Number.isNaN(goalPct)){
+    return targetLabel(pct);
+  }
+  return pct >= goalPct ? '✅ Goal raggiunto' : '❌ Goal non raggiunto';
+}
+
+function loadDb(){
+  try{
+    const raw = localStorage.getItem(STORAGE_KEY);
+    return raw ? JSON.parse(raw) : {};
+  }catch(err){
+    console.warn('Storage non disponibile.', err);
+    return {};
+  }
+}
+
+function saveDb(db){
+  try{
+    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
+  }catch(err){
+    console.warn('Storage non disponibile.', err);
+  }
+}
+
+function renderClassResults(data){
+  if (!elClassResults) return;
+  if (!data || !data.results || data.results.length === 0){
+    elClassResults.innerHTML = '<div class="muted">Nessun risultato salvato per questa classe.</div>';
+    return;
+  }
+  const rows = data.results.slice(-8).reverse().map((r) => {
+    return `<tr><td>${r.date}</td><td>${r.mode}</td><td>${r.ok}/${r.total}</td><td>${r.pct}%</td><td>${r.voto}/10</td><td>${r.time}</td></tr>`;
+  }).join('');
+  elClassResults.innerHTML = '<table><thead><tr><th>Data</th><th>Modalità</th><th>Punteggio</th><th>Accuratezza</th><th>Voto</th><th>Tempo</th></tr></thead><tbody>'
+    + rows + '</tbody></table>';
+}
+
+function updateClassInfo(){
+  if (!currentClass){
+    elClassName.textContent = '—';
+    elClassInfo.textContent = 'Seleziona una classe per salvare risultati e goal.';
+    renderClassResults(null);
+    return;
+  }
+  const db = loadDb();
+  const data = db[currentClass];
+  const goalPct = data?.goalPct ?? 80;
+  elClassName.textContent = currentClass;
+  elClassInfo.textContent = `Goal impostato: ${goalPct}%. I risultati vengono salvati automaticamente alla fine.`;
+  goalInput.value = goalPct;
+  renderClassResults(data);
+}
+
+function setClass(name){
+  const trimmed = name.trim();
+  if (!trimmed) return;
+  currentClass = trimmed;
+  classInput.value = trimmed;
+  const db = loadDb();
+  if (!db[currentClass]){
+    db[currentClass] = { goalPct: 80, results: [] };
+    saveDb(db);
+  }
+  localStorage.setItem(LAST_CLASS_KEY, currentClass);
+  updateClassInfo();
+}
+
+function saveGoal(){
+  if (!currentClass) return;
+  const goalPct = Math.max(0, Math.min(100, Number(goalInput.value)));
+  const db = loadDb();
+  if (!db[currentClass]){
+    db[currentClass] = { goalPct: 80, results: [] };
+  }
+  db[currentClass].goalPct = Number.isNaN(goalPct) ? 80 : goalPct;
+  saveDb(db);
+  updateClassInfo();
+}
+
 function buildIndex(){
   elIndex.innerHTML = '';
-  for (let p=0; p<order.length; p++){
+  for (let p = 0; p < order.length; p++){
     const q = DATA[order[p]];
-    const b = document.createElement('button');
-    b.className = 'qbtn';
-    b.textContent = q.number;
-    b.addEventListener('click', ()=>{ pos=p; render(); });
-    elIndex.appendChild(b);
+    const btn = document.createElement('button');
+    btn.className = 'qbtn';
+    btn.textContent = q.number;
+    btn.addEventListener('click', () => { pos = p; render(); });
+    elIndex.appendChild(btn);
   }
   paintIndex();
 }
 
 function paintIndex(){
   const btns = elIndex.querySelectorAll('.qbtn');
-  btns.forEach((b,p)=>{
-    b.classList.remove('current','good','bad');
-    if (p===pos) b.classList.add('current');
+  btns.forEach((b, p) => {
+    b.classList.remove('current', 'good', 'bad');
+    if (p === pos) b.classList.add('current');
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
-  elCat.textContent = q.category + ' · Domanda ' + (pos+1) + '/' + order.length;
+  elCat.textContent = `${q.category} · Domanda ${pos + 1}/${order.length}`;
   elPrompt.textContent = q.prompt;
 
   elOptions.innerHTML = '';
   elExplain.style.display = 'none';
-  elDid.textContent = '💡 ' + didYouKnowText(q.category);
+  elDid.textContent = `💡 ${didYouKnowText(q.category)}`;
 
-  const letters = ['A','B','C','D'];
-  for (const L of letters){
+  const letters = ['A', 'B', 'C', 'D'];
+  for (const letter of letters){
     const btn = document.createElement('button');
     btn.className = 'opt';
-    btn.textContent = L + ') ' + q[L];
+    btn.textContent = `${letter}) ${q[letter]}`;
     btn.disabled = !started;
-    btn.addEventListener('click', ()=>answer(L));
+    btn.addEventListener('click', () => answer(letter));
     elOptions.appendChild(btn);
   }
 
   const a = answers.get(q.number);
   if (a && a.chosen){
     lockPaint(q, a);
     if (mode === 'train') showExplain(q, a);
   }
 
-  prevBtn.disabled = !started || pos===0;
-  nextBtn.disabled = !started || pos===order.length-1;
+  prevBtn.disabled = !started || pos === 0;
+  nextBtn.disabled = !started || pos === order.length - 1;
   paintIndex();
   updateScore();
 }
 
 function lockPaint(q, a){
   const opts = elOptions.querySelectorAll('.opt');
-  opts.forEach(btn=>{
+  opts.forEach((btn) => {
     btn.disabled = true;
-    const L = btn.textContent.trim().charAt(0);
-    if (L === q.correct_letter) btn.classList.add('good');
-    if (a.chosen === L && !a.correct) btn.classList.add('bad');
+    const letter = btn.textContent.trim().charAt(0);
+    if (letter === q.correct_letter) btn.classList.add('good');
+    if (a.chosen === letter && !a.correct) btn.classList.add('bad');
   });
 }
 
 function showExplain(q, a){
   elExplain.style.display = 'block';
   elExplainTitle.textContent = a.correct ? 'Corretto' : 'Sbagliato';
   elExplainText.textContent = a.correct
     ? 'Hai scelto la risposta giusta.'
-    : ('Risposta corretta: ' + q.correct_letter + ') ' + q.correct_text);
+    : `Risposta corretta: ${q.correct_letter}) ${q.correct_text}`;
   elExplainLong.textContent = q.explanation || '';
 }
 
 function answer(letter){
   if (!started) return;
   const q = currentQ();
   if (answers.get(q.number)?.chosen) return;
 
   const correct = (letter === q.correct_letter);
-  answers.set(q.number, { chosen: letter, correct: correct });
+  answers.set(q.number, { chosen: letter, correct });
 
   const a = answers.get(q.number);
   lockPaint(q, a);
 
-  // Allenamento: spiega subito. Verifica: niente spiegazione fino alla fine.
   if (mode === 'train') showExplain(q, a);
 
   paintIndex();
   updateScore();
 
-  // Verifica: fine automatica dopo ultima domanda
   if (mode === 'exam' && pos === order.length - 1){
     finish();
   }
 }
 
 function start(){
   if (started) return;
   started = true;
   elResults.style.display = 'none';
   startEpoch = Date.now();
-  timerHandle = setInterval(()=>{
+  timerHandle = setInterval(() => {
     elTimer.textContent = fmtTime(Date.now() - startEpoch);
   }, 250);
   startBtn.disabled = true;
 
-  // In Verifica: mischia l’ordine delle domande all’avvio
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
-    'Città': {ok:0, done:0},
+    'Città': {ok:0, done:0}
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
 
-  const voto = Math.round(((ok/total)*10)*2)/2;
-
-  function targetLabel(pct){
-    if (pct >= 80) return '✅ Compito';
-    if (pct >= 60) return '⚠️ Parziale';
-    return '❌ Mancato';
-  }
-
-  const rows = Object.entries(catStats).map(([cat,s])=>{
-    const pct = s.done ? Math.round((s.ok/s.done)*100) : 0;
-    return {cat, ok:s.ok, done:s.done, pct, target: targetLabel(pct)};
+  const voto = Math.round(((ok / total) * 10) * 2) / 2;
+  const rows = Object.entries(catStats).map(([cat, s]) => {
+    const pct = s.done ? Math.round((s.ok / s.done) * 100) : 0;
+    return { cat, ok: s.ok, done: s.done, pct, target: targetLabel(pct) };
   });
-
-  const considered = rows.filter(r=>r.done>0).sort((a,b)=>a.pct-b.pct);
+  const considered = rows.filter(r => r.done > 0).sort((a, b) => a.pct - b.pct);
   const worst = considered[0] || null;
-
-  return {total, ok, voto, rows, worst};
+  return { total, ok, voto, rows, worst };
 }
 
 function finish(){
   if (!started) return;
   clearInterval(timerHandle);
   timerHandle = null;
   started = false;
   startBtn.disabled = false;
 
   const rep = computeReport();
   elResults.style.display = 'block';
+  const overallPct = rep.total ? Math.round((rep.ok / rep.total) * 100) : 0;
+  let goalPct = null;
+
+  if (currentClass){
+    const db = loadDb();
+    goalPct = db[currentClass]?.goalPct ?? 80;
+    if (!db[currentClass]){
+      db[currentClass] = { goalPct, results: [] };
+    }
+    const result = {
+      date: new Date().toLocaleString('it-IT'),
+      ok: rep.ok,
+      total: rep.total,
+      pct: overallPct,
+      voto: rep.voto,
+      mode: mode === 'train' ? 'Allenamento' : 'Verifica',
+      time: elTimer.textContent
+    };
+    db[currentClass].results.push(result);
+    saveDb(db);
+  }
 
   let h = '';
-  h += '<div><strong>Punteggio:</strong> '+rep.ok+'/'+rep.total+'</div>';
-  h += '<div><strong>Voto (stima):</strong> '+rep.voto+'/10</div>';
-  h += '<div><strong>Tempo:</strong> '+elTimer.textContent+'</div>';
+  h += `<div><strong>Punteggio:</strong> ${rep.ok}/${rep.total}</div>`;
+  h += `<div><strong>Voto (stima):</strong> ${rep.voto}/10</div>`;
+  h += `<div><strong>Tempo:</strong> ${elTimer.textContent}</div>`;
   h += '<hr>';
   h += '<div><strong>Mini report (target compiuti/mancati)</strong></div>';
   h += '<table><thead><tr><th>Categoria</th><th>Corrette</th><th>Accuratezza</th><th>Target</th></tr></thead><tbody>';
-  rep.rows.forEach(r=>{
-    h += '<tr><td>'+r.cat+'</td><td>'+r.ok+'/'+r.done+'</td><td>'+r.pct+'%</td><td>'+r.target+'</td></tr>';
+  rep.rows.forEach((r) => {
+    h += `<tr><td>${r.cat}</td><td>${r.ok}/${r.done}</td><td>${r.pct}%</td><td>${r.target}</td></tr>`;
   });
   h += '</tbody></table>';
 
   if (rep.worst){
     h += '<div class="note" style="margin-top:10px;">';
     h += '<div class="title">Consiglio di ripasso</div>';
-    h += 'Ripassa prima <strong>'+rep.worst.cat+'</strong> (accuratezza '+rep.worst.pct+'%).';
+    h += `Ripassa prima <strong>${rep.worst.cat}</strong> (accuratezza ${rep.worst.pct}%).`;
     h += '</div>';
   }
 
   elResultsBody.innerHTML = h;
+  if (elGoal){
+    elGoal.innerHTML = '<div class="title">Goal classe</div>'
+      + `<div>Accuratezza totale: <strong>${overallPct}%</strong> → ${goalStatusLabel(overallPct, goalPct)}</div>`;
+  }
+  updateClassInfo();
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
-
-  // ordine normale (in Verifica verrà mischiato quando premi Avvia)
-  order = Array.from({length: DATA.length}, (_,i)=>i);
+  order = Array.from({length: DATA.length}, (_, i) => i);
   buildIndex();
   render();
   updateScore();
 }
 
 function toggleMode(){
   mode = (mode === 'train') ? 'exam' : 'train';
-  modeBtn.textContent = 'Modalità: ' + (mode === 'train' ? 'Allenamento' : 'Verifica');
+  modeBtn.textContent = `Modalità: ${mode === 'train' ? 'Allenamento' : 'Verifica'}`;
   elExplain.style.display = 'none';
-  order = Array.from({length: DATA.length}, (_,i)=>i);
+  order = Array.from({length: DATA.length}, (_, i) => i);
   pos = 0;
   buildIndex();
   render();
 }
 
 startBtn.addEventListener('click', start);
 finishBtn.addEventListener('click', finish);
 restartBtn.addEventListener('click', restart);
 modeBtn.addEventListener('click', toggleMode);
-prevBtn.addEventListener('click', ()=>{ if(pos>0){ pos--; render(); }});
-nextBtn.addEventListener('click', ()=>{ if(pos<order.length-1){ pos++; render(); }});
+prevBtn.addEventListener('click', () => { if (pos > 0){ pos--; render(); } });
+nextBtn.addEventListener('click', () => { if (pos < order.length - 1){ pos++; render(); } });
+classLoadBtn.addEventListener('click', () => setClass(classInput.value));
+goalSaveBtn.addEventListener('click', saveGoal);
 
 async function init(){
   const resp = await fetch('./quiz_data.json', {cache:'no-store'});
   DATA = await resp.json();
 
-  // Se non hai già la proprietà category, la aggiungo in base al numero
-  DATA.forEach((q,i)=>{
+  DATA.forEach((q) => {
     if (!q.category){
       if (q.number <= 25) q.category = 'Demografia';
       else if (q.number <= 50) q.category = 'Migrazioni';
       else q.category = 'Città';
     }
   });
 
   elTotal.textContent = DATA.length;
-  order = Array.from({length: DATA.length}, (_,i)=>i);
+  order = Array.from({length: DATA.length}, (_, i) => i);
   buildIndex();
   render();
   updateScore();
+
+  const lastClass = localStorage.getItem(LAST_CLASS_KEY);
+  if (lastClass){
+    setClass(lastClass);
+  }else{
+    updateClassInfo();
+  }
 }
-init().catch(err=>{
+
+init().catch((err) => {
   elPrompt.textContent = 'Errore nel caricamento dei dati (quiz_data.json).';
   console.error(err);
 });
 
EOF
)
