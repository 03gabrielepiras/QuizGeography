'use strict';

// -------------------- Storage --------------------
const STORE = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  del(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};

const $ = (id) => document.getElementById(id);

// -------------------- Utils --------------------
function randInt(n){ return Math.floor(Math.random()*n); }
function pick(arr){ return arr[randInt(arr.length)]; }
function shuffle(arr){
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--){
    const j = randInt(i+1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function clamp(n, lo, hi){ return Math.max(lo, Math.min(hi, n)); }
function now(){ return Date.now(); }
function norm(s){
  return (s ?? '').toString().trim().toLowerCase()
    .replace(/\s+/g,' ')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

// -------------------- TTS --------------------
function speakIt(text){
  const audioMode = $('audioMode')?.value || 'on';
  if (audioMode === 'off') return;
  if (!('speechSynthesis' in window)) return;
  try{
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    u.rate = 0.95;
    u.pitch = 1.0;
    // prova a scegliere una voce italiana se disponibile
    const voices = window.speechSynthesis.getVoices?.() || [];
    const it = voices.find(v => (v.lang||'').toLowerCase().startsWith('it'));
    if (it) u.voice = it;
    window.speechSynthesis.speak(u);
  } catch {}
}

// -------------------- Question model --------------------
// mcq: {type:'mcq', topic, skill, prompt, choices, a, postit}
// cloze: {type:'cloze', topic, skill, prompt, answer, postit, hint}

function qMCQ(topic, skill, prompt, choices, a, postit){
  return { type:'mcq', topic, skill, prompt, choices, a, postit };
}
function qCloze(topic, skill, prompt, answer, postit, hint=''){
  return { type:'cloze', topic, skill, prompt, answer, postit, hint };
}

// -------------------- Content bank --------------------
const POSTITS = {
  demo_saldi: 'Saldo naturale = nati - morti. Saldo migratorio = immigrati - emigrati. Saldo demografico totale = somma dei due.',
  demo_tassi: 'Tassi/indici: rapporti (spesso per 1000 abitanti) che rendono confrontabili paesi diversi.',
  demo_fecondita: 'Tasso di fecondità = numero medio di figli per donna. 2,1 ≈ soglia di rimpiazzo generazionale.',
  demo_densita: 'Densità di popolazione = abitanti / km². Le zone anecumeniche sono quasi spopolate (deserti, poli, alte montagne).',
  demo_piramide: 'Piramide delle età: mostra popolazione per sesso e classi di età. Base larga = alta natalità; base stretta = invecchiamento.',
  mig_def: 'Migrante: si sposta in un luogo diverso dalla residenza abituale per almeno un anno.',
  mig_pushpull: 'Push factors = fattori di espulsione (spingono a partire). Pull factors = fattori di attrazione (attirano verso un luogo).',
  mig_reg: 'Migrazione regolare = con autorizzazione (permesso/green card). Irregolare = senza autorizzazione o oltre scadenza.',
  mig_glob: 'Globalizzazione = maggiore interdipendenza planetaria: comunicazioni/trasporti/scambi più rapidi. Migrazioni: più veloci, femminilizzazione, legami mantenuti.',
  city_def: 'Città: insediamento umano stabile con alta densità e organizzazione complessa dello spazio; offre servizi al territorio.',
  city_fun: 'Funzioni urbane: residenziale, amministrativa, economica, culturale, turistica, trasporto. Più funzioni = più attrazione.',
  city_class: 'Classi: città piccole/medie (10mila–250mila), metropoli (>1 milione), area metropolitana, città globali.',
  city_mega: 'Megalopoli: fusione di grandi metropoli/aree metropolitane (almeno ~10 milioni) ben collegate, con funzioni diverse.',
  city_modelli: 'Modelli: Nord America (pianta a scacchiera, CBD), Europa (centro storico multifunzionale), PVS (urbanizzazione rapida, contrasti, baraccopoli).'
};

const BANK = [];

// --- Demografia ---
BANK.push(
  qMCQ('demo','demo_saldi','Che cos’è il saldo naturale?',
    ['La differenza tra nati vivi e morti in un periodo','La differenza tra immigrati ed emigrati','La somma dei tassi di natalità e mortalità','Il numero totale di abitanti'],0,POSTITS.demo_saldi),
  qMCQ('demo','demo_saldi','Che cos’è il saldo migratorio?',
    ['Immigrati - emigrati','Nati - morti','Morti infantili - nati vivi','Abitanti/km²'],0,POSTITS.demo_saldi),
  qMCQ('demo','demo_tassi','Perché si usano i tassi (per 1000 abitanti) in demografia?',
    ['Per confrontare paesi con popolazioni diverse','Per contare le città nel mondo','Per misurare la temperatura media','Per calcolare la superficie di uno Stato'],0,POSTITS.demo_tassi),
  qMCQ('demo','demo_fecondita','Quale valore è considerato circa la soglia di rimpiazzo generazionale?',
    ['2,1 figli per donna','1,0 figli per donna','3,5 figli per donna','0,5 figli per donna'],0,POSTITS.demo_fecondita),
  qMCQ('demo','demo_densita','Che cosa misura la densità di popolazione?',
    ['Abitanti per km²','Nati per 1000 abitanti','Morti per 1000 abitanti','Numero di città globali'],0,POSTITS.demo_densita),
  qMCQ('demo','demo_piramide','Una piramide delle età con base molto larga indica di solito:',
    ['Alta natalità e popolazione giovane','Bassa natalità e popolazione anziana','Assenza di migrazioni','Urbanizzazione completa'],0,POSTITS.demo_piramide)
);

BANK.push(
  qCloze('demo','demo_saldi','Completa: saldo naturale = ____ - ____.','nati morti',POSTITS.demo_saldi,'Scrivi due parole: "nati morti"'),
  qCloze('demo','demo_densita','Completa: densità di popolazione = abitanti / ____.','km2',POSTITS.demo_densita,'Risposta breve: km²'),
  qCloze('demo','demo_fecondita','Completa: il tasso di fecondità indica il numero medio di ____ per donna.','figli',POSTITS.demo_fecondita,'Una parola.')
);

// --- Migrazioni ---
BANK.push(
  qMCQ('mig','mig_def','Quando uno spostamento definisce una persona “migrante” (secondo la definizione base)?',
    ['Quando si sposta per almeno un anno','Quando cambia città per un weekend','Quando fa una gita scolastica','Quando viaggia per lavoro per un giorno'],0,POSTITS.mig_def),
  qMCQ('mig','mig_pushpull','I push factors sono:',
    ['Fattori di espulsione che spingono a lasciare un luogo','Fattori che attraggono verso un luogo','Documenti di viaggio','Tipi di città'],0,POSTITS.mig_pushpull),
  qMCQ('mig','mig_pushpull','Quale è un esempio di pull factor?',
    ['Disponibilità di posti di lavoro e servizi','Guerra e persecuzioni','Carestie e desertificazione','Mancanza di acqua potabile'],0,POSTITS.mig_pushpull),
  qMCQ('mig','mig_reg','Che cos’è una migrazione irregolare?',
    ['Entrare o restare in un paese senza autorizzazione','Spostarsi tra campagne e città','Spostarsi da sud a nord nello stesso paese','Trasferirsi in un’altra regione con permesso'],0,POSTITS.mig_reg),
  qMCQ('mig','mig_glob','Tra 2000 e 2019 i migranti nel mondo:',
    ['Sono aumentati (da 176 a 272 milioni)','Sono diminuiti (da 272 a 176 milioni)','Sono rimasti uguali','Sono diventati zero'],0,POSTITS.mig_glob),
  qMCQ('mig','mig_italia','Dagli anni ’70, l’Italia è diventata soprattutto un paese di:',
    ['Immigrazione','Emigrazione solo verso l’America','Isolamento totale','Senza flussi migratori'],0,'Dagli anni ’70 l’Italia passa da paese di emigranti a paese di immigrazione.')
);

BANK.push(
  qCloze('mig','mig_pushpull','Completa: pull factors = fattori di ____.','attrazione',POSTITS.mig_pushpull,'Una parola.'),
  qCloze('mig','mig_pushpull','Completa: push factors = fattori di ____.','espulsione',POSTITS.mig_pushpull,'Una parola.'),
  qCloze('mig','mig_glob','Completa: globalizzazione = maggiore ____ su scala planetaria.','interdipendenza',POSTITS.mig_glob,'Una parola.')
);

// --- Città ---
BANK.push(
  qMCQ('city','city_def','Che cos’è una città?',
    ['Un insediamento stabile con alta densità e organizzazione complessa','Un villaggio senza servizi','Solo un insieme di case isolate','Un’area sempre rurale'],0,POSTITS.city_def),
  qMCQ('city','city_def','L’importanza di una città dipende dal suo “rango”, cioè:',
    ['Il ruolo nella gerarchia urbana legato ai servizi offerti','L’altezza media degli edifici','Il numero di parchi','La temperatura media annuale'],0,POSTITS.city_def),
  qMCQ('city','city_fun','Quale NON è tra le principali funzioni urbane elencate?',
    ['Glaciale','Residenziale','Amministrativa','Economica'],0,POSTITS.city_fun),
  qMCQ('city','city_class','Una metropoli ha in genere:',
    ['Oltre 1 milione di abitanti','Tra 10mila e 250mila abitanti','Meno di 1.000 abitanti','Solo baraccopoli'],0,POSTITS.city_class),
  qMCQ('city','city_mega','Che cosa caratterizza una megalopoli?',
    ['Fusione di grandi metropoli/aree metropolitane ben collegate','Un solo centro storico','Solo campagne senza città','Assenza di trasporti'],0,POSTITS.city_mega),
  qMCQ('city','city_modelli','Nelle città nordamericane, il CBD è:',
    ['Il Central Business District, cuore economico/direzionale','Una periferia rurale','Un quartiere storico medievale','Una baraccopoli'],0,POSTITS.city_modelli)
);

BANK.push(
  qMCQ('city','city_modelli','Nelle città europee il centro storico è spesso:',
    ['Multifunzionale e densamente abitato','Solo industriale','Solo agricolo','Sempre una baraccopoli'],0,POSTITS.city_modelli),
  qMCQ('city','city_modelli','Nelle città dei paesi in via di sviluppo, l’urbanizzazione è spesso:',
    ['Rapida e disordinata, con forti contrasti sociali','Lenta e pianificata perfettamente','Assente','Solo in montagna'],0,POSTITS.city_modelli),
  qMCQ('city','city_mega','Quale esempio è una megalopoli citata spesso nei manuali?',
    ['Bos-Wash (Boston–Washington)','Una città media italiana','Un villaggio alpino','Un deserto'],0,POSTITS.city_mega)
);

BANK.push(
  qCloze('city','city_fun','Completa: una città con funzioni più diversificate ha maggiore capacità di ____ abitanti.','attrarre',POSTITS.city_fun,'Una parola.'),
  qCloze('city','city_class','Completa: città piccole/medie = tra ____ e 250.000 abitanti (ordine di grandezza).','10000',POSTITS.city_class,'Scrivi 10000'),
  qCloze('city','city_mega','Completa: una megalopoli ha almeno circa ____ milioni di abitanti.','10',POSTITS.city_mega,'Numero.')
);

// Add parametric variants (increase variety)
const CITY_SERVICES = ['amministrativi','commerciali','finanziari','sanitari','scolastici','culturali','sociali'];
const PUSH = ['mancanza di lavoro','guerre e conflitti','carenstie e disastri naturali','mancanza di servizi di base'];
const PULL = ['posti di lavoro','migliore qualità della vita e servizi','presenza di familiari o reti sociali','regimi democratici e libertà'];

for (let i=0;i<24;i++){
  const s = pick(CITY_SERVICES);
  BANK.push(qMCQ('city','city_def',`Una città fornisce all’area circostante servizi di tipo ${s}. Questo significa che:`,
    ['La città ha un ruolo anche per il territorio vicino','La città è sempre in campagna','La città non ha abitanti','La città non ha funzioni'],0,POSTITS.city_def));
}

for (let i=0;i<24;i++){
  const p = pick(PUSH);
  BANK.push(qMCQ('mig','mig_pushpull',`Quale di questi può essere considerato un push factor (fattore di espulsione)?`,
    [p,pick(PULL),'Aumento dei servizi','Migliore rete di trasporti'],0,POSTITS.mig_pushpull));
}

for (let i=0;i<24;i++){
  const p = pick(PULL);
  BANK.push(qMCQ('mig','mig_pushpull',`Quale di questi può essere considerato un pull factor (fattore di attrazione)?`,
    [p,pick(PUSH),'Desertificazione','Guerra'],0,POSTITS.mig_pushpull));
}

// -------------------- Build quiz --------------------
const SKILLS = {
  demo: ['demo_saldi','demo_tassi','demo_fecondita','demo_densita','demo_piramide'],
  mig: ['mig_def','mig_pushpull','mig_reg','mig_glob','mig_italia'],
  city:['city_def','city_fun','city_class','city_mega','city_modelli']
};

function getSkillLabel(skill){
  const map = {
    demo_saldi:'Saldi demografici',
    demo_tassi:'Tassi/indici',
    demo_fecondita:'Fecondità',
    demo_densita:'Densità',
    demo_piramide:'Piramide età',
    mig_def:'Definizioni',
    mig_pushpull:'Push/Pull',
    mig_reg:'Regolare/irregolare',
    mig_glob:'Globalizzazione',
    mig_italia:'Italia',
    city_def:'Definizione',
    city_fun:'Funzioni',
    city_class:'Classificazione',
    city_mega:'Megalopoli',
    city_modelli:'Modelli urbani'
  };
  return map[skill] || skill;
}

function scoreInit(){
  const obj = {};
  for (const t of Object.keys(SKILLS)){
    for (const s of SKILLS[t]) obj[s] = { seen:0, correct:0 };
  }
  return obj;
}

function updateSkillsUI(){
  const progress = STORE.get('geo_progress', scoreInit());
  const el = $('skills');
  if (!el) return;
  el.innerHTML = '';
  const items = Object.keys(progress).map((k) => {
    const v = progress[k];
    const pct = v.seen ? Math.round((v.correct/v.seen)*100) : 0;
    return { k, pct, seen:v.seen };
  }).sort((a,b)=> b.pct - a.pct);

  for (const it of items){
    const row = document.createElement('div');
    row.className = 'skillRow';
    row.innerHTML = `
      <div class="skillName">${getSkillLabel(it.k)} <span class="muted">(${it.seen})</span></div>
      <div class="skillBar"><div class="skillFill" style="width:${it.pct}%"></div></div>
      <div class="skillPct">${it.pct}%</div>
    `;
    el.appendChild(row);
  }
}

function buildSession(topic, count){
  let pool = BANK.slice();
  if (topic !== 'mix') pool = pool.filter(q => q.topic === topic);

  // bilanciamento: cerca di includere tutti i macro-temi in mix
  if (topic === 'mix'){
    const want = count;
    const per = Math.max(1, Math.floor(want/3));
    const a = shuffle(BANK.filter(q=>q.topic==='demo')).slice(0, per);
    const b = shuffle(BANK.filter(q=>q.topic==='mig')).slice(0, per);
    const c = shuffle(BANK.filter(q=>q.topic==='city')).slice(0, per);
    pool = shuffle(a.concat(b).concat(c).concat(shuffle(BANK).slice(0, want)));
  }

  // preferisci varietà tra skill
  const bySkill = new Map();
  for (const q of pool){
    const k = q.skill;
    if (!bySkill.has(k)) bySkill.set(k, []);
    bySkill.get(k).push(q);
  }
  const skills = shuffle([...bySkill.keys()]);
  let out = [];
  while (out.length < count && skills.length){
    for (const sk of skills){
      const arr = bySkill.get(sk);
      if (!arr || !arr.length) continue;
      out.push(arr.pop());
      if (out.length >= count) break;
    }
  }
  if (out.length < count){
    out = out.concat(shuffle(pool).slice(0, count - out.length));
  }
  return shuffle(out).slice(0, count);
}

// -------------------- App state --------------------
let session = null; // {mode, topic, questions, idx, correct, answers[]}
let locked = false;

function show(view){
  ['who','setup','quiz','result','classPanel'].forEach(id => $(id)?.classList.add('hidden'));
  $(view)?.classList.remove('hidden');
}

function setHello(){
  const name = STORE.get('geo_name', '');
  if ($('hello')) $('hello').textContent = name ? `Ciao ${name} 👋` : 'Ciao 👋';
}

function requireName(){
  const name = STORE.get('geo_name', '');
  if (!name){ show('who'); }
  else { show('setup'); }
  setHello();
  updateSkillsUI();
}

function persistSession(){ STORE.set('geo_session', session); }
function loadSession(){ return STORE.get('geo_session', null); }

function startNew(){
  const mode = $('mode').value;
  const topic = $('topic').value;
  const count = clamp(parseInt($('count').value, 10), 10, 50);
  const questions = buildSession(topic, count);

  session = { mode, topic, questions, idx:0, correct:0, answers:[] , startedAt: now() };
  persistSession();
  show('quiz');
  renderQuestion();
}

function resume(){
  const s = loadSession();
  if (!s || !s.questions || !s.questions.length){
    alert('Nessuna sessione da riprendere.');
    return;
  }
  session = s;
  show('quiz');
  renderQuestion();
}

function resetAll(){
  if (!confirm('Vuoi resettare progressi e sessione?')) return;
  STORE.del('geo_progress');
  STORE.del('geo_session');
  updateSkillsUI();
  alert('Resettato.');
}

function progressBar(){
  const pct = session ? (session.idx / session.questions.length) * 100 : 0;
  $('progressBar').style.width = `${pct}%`;
}

function scorePill(){
  if (!session) return;
  $('scorePill').textContent = `${session.correct}/${session.questions.length}`;
}

function updateProgress(skill, ok){
  const progress = STORE.get('geo_progress', scoreInit());
  if (!progress[skill]) progress[skill] = { seen:0, correct:0 };
  progress[skill].seen += 1;
  if (ok) progress[skill].correct += 1;
  STORE.set('geo_progress', progress);
}

function renderQuestion(){
  locked = false;
  $('nextBtn').disabled = true;
  $('feedback').textContent = '';
  $('choices').innerHTML = '';
  $('openWrap').classList.add('hidden');
  $('openInput').value = '';
  $('openHint').textContent = '';

  const q = session.questions[session.idx];
  $('qTitle').textContent = `Domanda ${session.idx+1} / ${session.questions.length}`;
  $('qMeta').textContent = `${q.topic.toUpperCase()} • ${getSkillLabel(q.skill)} • ${q.type.toUpperCase()}`;
  $('postitText').textContent = q.postit || '';
  $('qText').textContent = q.prompt;

  progressBar();
  scorePill();

  // audio domanda
  $('speakQBtn').onclick = () => speakIt(q.prompt);

  if (q.type === 'mcq'){
    q.choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.type = 'button';
      b.textContent = c;
      b.onclick = () => answerMCQ(i, b);
      $('choices').appendChild(b);
    });
  } else {
    $('openWrap').classList.remove('hidden');
    $('openHint').textContent = q.hint || '';
    $('openInput').focus();
  }

  $('prevBtn').disabled = session.idx === 0;
}

function lockChoices(){
  document.querySelectorAll('.choice').forEach(b => b.disabled = true);
}

function answerMCQ(choiceIndex, btn){
  if (locked) return;
  locked = true;
  lockChoices();

  const q = session.questions[session.idx];
  const ok = choiceIndex === q.a;

  // visuals
  const buttons = Array.from(document.querySelectorAll('.choice'));
  if (buttons[q.a]) buttons[q.a].classList.add('correct');
  if (!ok) btn.classList.add('wrong');

  updateProgress(q.skill, ok);

  if (session.mode === 'practice'){
    $('feedback').innerHTML = ok
      ? `✅ <strong>Corretto.</strong> <span class="muted">(Tocca per ascoltare)</span>`
      : `❌ <strong>No.</strong> <span class="muted">Giusta: ${q.choices[q.a]}</span>`;
    // click to speak correct sentence
    $('feedback').onclick = () => speakIt(ok ? q.choices[q.a] : `La risposta corretta è: ${q.choices[q.a]}`);
  } else {
    $('feedback').textContent = 'Risposta registrata.';
  }

  session.answers.push({ idx: session.idx, ok, chosen: choiceIndex });
  if (ok) session.correct += 1;
  persistSession();
  scorePill();
  $('nextBtn').disabled = false;
}

function answerCloze(){
  if (locked) return;
  const q = session.questions[session.idx];
  const user = norm($('openInput').value);

  let ok;
  if (q.answer.includes(' ')){
    // se l'answer è composta (es: "nati morti"), accetta entrambe le parole in ordine
    ok = user === norm(q.answer) || user === norm(q.answer).replace(' ','');
  } else {
    ok = user === norm(q.answer);
  }

  locked = true;
  updateProgress(q.skill, ok);

  if (session.mode === 'practice'){
    if (ok){
      $('feedback').innerHTML = `✅ <strong>Corretto.</strong> <span class="muted">Tocca per ascoltare la frase.</span>`;
      $('feedback').onclick = () => speakIt(q.prompt.replace('____', $('openInput').value.trim() || q.answer));
    } else {
      $('feedback').innerHTML = `❌ <strong>No.</strong> <span class="muted">Soluzione: ${q.answer}</span>`;
      $('feedback').onclick = () => speakIt(`La soluzione è: ${q.answer}`);
    }
  } else {
    $('feedback').textContent = 'Risposta registrata.';
  }

  session.answers.push({ idx: session.idx, ok, user });
  if (ok) session.correct += 1;
  persistSession();
  scorePill();
  $('nextBtn').disabled = false;
}

function next(){
  if (!session) return;
  session.idx += 1;
  if (session.idx >= session.questions.length){
    finish();
    return;
  }
  persistSession();
  renderQuestion();
}

function prev(){
  if (!session) return;
  session.idx = Math.max(0, session.idx - 1);
  persistSession();
  renderQuestion();
}

function finish(){
  show('result');
  const total = session.questions.length;
  const score = session.correct;
  const pct = Math.round((score/total)*100);
  const voto = Math.max(2, Math.min(10, Math.round(2 + (pct/100)*8)));
  $('resultText').textContent = `Punteggio: ${score}/${total} (${pct}%) • Voto stimato: ${voto}`;

  $('review').classList.add('hidden');
  $('review').innerHTML = '';

  // log attempt
  const history = STORE.get('geo_history', []);
  history.unshift({
    when: new Date().toISOString(),
    mode: session.mode,
    topic: session.topic,
    total,
    score,
    pct,
    voto,
    duration_s: Math.round((now() - (session.startedAt||now()))/1000)
  });
  STORE.set('geo_history', history.slice(0,50));

  STORE.del('geo_session');
  updateSkillsUI();
}

function renderReview(){
  const box = $('review');
  box.innerHTML = '';
  const wrong = session?.answers?.filter(a => !a.ok) || [];
  if (!wrong.length){
    box.innerHTML = `<div class="reviewItem"><div class="tag">Perfetto</div>Nessun errore 🎉</div>`;
    box.classList.remove('hidden');
    return;
  }
  wrong.slice(0,200).forEach((w, i) => {
    const q = session.questions[w.idx];
    const div = document.createElement('div');
    div.className = 'reviewItem';
    div.innerHTML = `
      <div class="tag">Errore ${i+1} • ${q.topic.toUpperCase()} • ${getSkillLabel(q.skill)}</div>
      <div><strong>Domanda:</strong> ${q.prompt}</div>
      <div class="muted" style="margin-top:6px">${q.postit || ''}</div>
    `;
    box.appendChild(div);
  });
  box.classList.remove('hidden');
}

// -------------------- Class panel (minimal offline placeholder) --------------------
function openClass(){
  show('classPanel');
  const name = STORE.get('geo_name','');
  const h = STORE.get('geo_history', []);
  const total = h.length;
  const last = h[0];
  $('classStats').innerHTML = `
    <div class="statCard"><div class="statK">Utente</div><div class="statV">${name || '—'}</div></div>
    <div class="statCard"><div class="statK">Tentativi salvati</div><div class="statV">${total}</div></div>
    <div class="statCard"><div class="statK">Ultimo voto</div><div class="statV">${last ? last.voto : '—'}</div></div>
  `;
}

// -------------------- Wiring --------------------
function init(){
  // name
  $('saveNameBtn')?.addEventListener('click', () => {
    const n = $('nameInput').value.trim();
    if (!n) return;
    STORE.set('geo_name', n);
    requireName();
  });
  $('nameInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('saveNameBtn').click();
  });

  $('startBtn')?.addEventListener('click', startNew);
  $('resumeBtn')?.addEventListener('click', resume);
  $('resetBtn')?.addEventListener('click', resetAll);

  $('checkOpenBtn')?.addEventListener('click', answerCloze);
  $('openInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') answerCloze();
  });

  $('nextBtn')?.addEventListener('click', next);
  $('prevBtn')?.addEventListener('click', prev);
  $('finishBtn')?.addEventListener('click', finish);

  $('reviewBtn')?.addEventListener('click', renderReview);
  $('backBtn')?.addEventListener('click', () => { session=null; show('setup'); updateSkillsUI(); });

  $('classBtn')?.addEventListener('click', openClass);
  $('closeClassBtn')?.addEventListener('click', () => { show('setup'); updateSkillsUI(); });

  // hello
  requireName();

  // resume button state
  const s = loadSession();
  if (s && s.questions && s.questions.length) $('resumeBtn').disabled = false;
}

window.addEventListener('load', () => {
  // some browsers need this to load voices
  try { window.speechSynthesis.getVoices(); } catch {}
  init();
});
