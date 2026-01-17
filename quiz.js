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

// (Geografia) Nessun audio: l'obiettivo è concentrazione e lettura.

// -------------------- Device identity (no IMEI; privacy-safe) --------------------
function getDeviceId(){
  let id = STORE.get('geo_device_id','');
  if (id) return id;
  try {
    id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : '';
  } catch { id = ''; }
  if (!id) id = 'dev_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
  STORE.set('geo_device_id', id);
  return id;
}

// -------------------- Firebase realtime class --------------------
const CLASS_CODE_DEFAULT = '1GL1-GL2';
let FB = { app:null, db:null, classCode: CLASS_CODE_DEFAULT, userRef:null, statsRef:null, presenceUnsub:null, usersUnsub:null };

// Firebase config integrata (nessun incolla-config): chi apre la PWA e inserisce il nome una volta
// viene collegato automaticamente alla classe realtime.
// NOTE: databaseURL è necessario per Realtime Database.
const GEO_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCvHC5XMSyXwL7_duXG-GOHfEBOD-adANE",
  authDomain: "geografia-6696d.firebaseapp.com",
  databaseURL: "https://geografia-6696d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "geografia-6696d",
  storageBucket: "geografia-6696d.firebasestorage.app",
  messagingSenderId: "641982559095",
  appId: "1:641982559095:web:0b9880691214e2e9922772",
  measurementId: "G-7G34BXCQSC"
};

function parseFirebaseConfig(text){
  try {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object') return null;
    if (!obj.apiKey || !obj.projectId || !obj.databaseURL) return null;
    return obj;
  } catch {
    return null;
  }
}

function initFirebaseIfPossible(){
  // Se manca una config salvata, usa quella integrata.
  const saved = STORE.get('geo_fb_cfg', null);
  const cfg = saved || GEO_FIREBASE_CONFIG;
  if (!saved) STORE.set('geo_fb_cfg', cfg);
  if (!window.firebase || !window.firebase.initializeApp) return false;
  try {
    // avoid re-init
    FB.app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(cfg);
    FB.db = firebase.database();
    return true;
  } catch {
    return false;
  }
}

function fbUserPath(){
  const did = getDeviceId();
  const cc = FB.classCode || CLASS_CODE_DEFAULT;
  return `classes/${cc}/users/${did}`;
}

function fbConnectPresence(){
  if (!FB.db) return;
  const name = STORE.get('geo_name','') || '—';
  const did = getDeviceId();
  const baseRef = FB.db.ref(fbUserPath());
  FB.userRef = baseRef;
  FB.statsRef = baseRef.child('stats');

  const meta = {
    name,
    deviceId: did,
    ua: navigator.userAgent || '',
    platform: navigator.platform || '',
    online: true,
    lastSeen: firebase.database.ServerValue.TIMESTAMP
  };

  // Use .info/connected to manage online/offline correctly
  const connRef = FB.db.ref('.info/connected');
  connRef.on('value', (snap) => {
    if (snap.val() === true){
      // onDisconnect: mark offline + update lastSeen
      baseRef.onDisconnect().update({ online:false, lastSeen: firebase.database.ServerValue.TIMESTAMP });
      baseRef.update(meta);
    }
  });

  // Heartbeat to keep lastSeen fresh
  setInterval(() => {
    if (!FB.userRef) return;
    FB.userRef.update({ lastSeen: firebase.database.ServerValue.TIMESTAMP, online:true, name: STORE.get('geo_name','') || name });
  }, 30000);
}

function fbSyncSkill(skill, ok){
  if (!FB.statsRef) return;
  const ref = FB.statsRef.child(skill);
  ref.transaction((cur) => {
    const v = cur && typeof cur === 'object' ? cur : { seen:0, correct:0 };
    v.seen = (v.seen||0) + 1;
    if (ok) v.correct = (v.correct||0) + 1;
    return v;
  });
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

// -------------------- Curiosità (solo Allenamento) --------------------
// 50+ curiosità brevi, sempre attinenti a demografia/migrazioni/città.
const CURIOS = [
  {topic:'demo', text:'Sapevi che il valore “2,1 figli per donna” è una media: serve a compensare mortalità infantile e il fatto che non tutte le donne hanno figli?'} ,
  {topic:'demo', text:'Sapevi che una popolazione che invecchia aumenta la “dipendenza” perché diminuisce la quota di persone in età lavorativa?'} ,
  {topic:'demo', text:'Sapevi che la densità media di un Paese può ingannare? Le persone spesso si concentrano in poche aree (coste, pianure, città).'} ,
  {topic:'demo', text:'Sapevi che molte zone anecumeniche sono legate a clima estremo (poli), aridità (deserti) o altitudine (alte montagne)?'} ,
  {topic:'demo', text:'Sapevi che la piramide delle età permette di “leggere” eventi storici? Guerre e crisi lasciano buchi in alcune fasce.'} ,
  {topic:'demo', text:'Sapevi che un saldo naturale negativo non significa per forza che la popolazione diminuisce? Può compensare un saldo migratorio positivo.'} ,
  {topic:'demo', text:'Sapevi che i tassi (per 1000 o per 100) servono a confrontare Paesi grandi e piccoli in modo equo?'} ,
  {topic:'demo', text:'Sapevi che “urbanizzazione” non significa solo più città, ma soprattutto più persone che vivono in città?'} ,
  {topic:'demo', text:'Sapevi che la speranza di vita è influenzata da sanità, alimentazione, istruzione e condizioni di lavoro?'} ,
  {topic:'demo', text:'Sapevi che la crescita demografica più rapida oggi è spesso in Paesi con popolazione molto giovane?'} ,

  {topic:'mig', text:'Sapevi che push e pull factors spesso si sommano? Una persona può partire per più motivi insieme (lavoro + sicurezza).'} ,
  {topic:'mig', text:'Sapevi che molte migrazioni nel mondo sono interne (dalla campagna alla città) e non internazionali?'} ,
  {topic:'mig', text:'Sapevi che “migrazione regolare” dipende dalle leggi del Paese di arrivo, che possono cambiare nel tempo?'} ,
  {topic:'mig', text:'Sapevi che le rimesse (soldi inviati a casa) possono diventare una fonte economica importante per i Paesi di origine?'} ,
  {topic:'mig', text:'Sapevi che le migrazioni possono ringiovanire una popolazione se arrivano soprattutto giovani adulti?'} ,
  {topic:'mig', text:'Sapevi che i corridoi migratori spesso seguono lingua, ex legami coloniali o reti familiari già presenti?'} ,
  {topic:'mig', text:'Sapevi che la globalizzazione rende più facile mantenere contatti con il Paese d’origine (chat, voli low cost)?'} ,
  {topic:'mig', text:'Sapevi che esistono migrazioni “circolari”, cioè persone che si spostano e poi ritornano periodicamente?'} ,
  {topic:'mig', text:'Sapevi che “rifugiato” è una categoria giuridica specifica legata a protezione internazionale, non un sinonimo di migrante?'} ,
  {topic:'mig', text:'Sapevi che migrazioni e città sono collegate? Le città attraggono perché offrono lavoro, servizi e reti sociali.'} ,

  {topic:'city', text:'Sapevi che molte città europee hanno un centro storico multifunzionale (abitazioni + servizi), diverso dal CBD nordamericano?'} ,
  {topic:'city', text:'Sapevi che il CBD (Central Business District) è spesso la zona con uffici e servizi avanzati e costa molto di più?'} ,
  {topic:'city', text:'Sapevi che “area metropolitana” include la città principale e i comuni intorno collegati ogni giorno (pendolarismo)?'} ,
  {topic:'city', text:'Sapevi che le megalopoli nascono quando grandi aree urbane si avvicinano e si collegano (trasporti, economia)?'} ,
  {topic:'city', text:'Sapevi che nelle città dei PVS l’urbanizzazione può essere più veloce della crescita di lavoro e servizi, creando baraccopoli?'} ,
  {topic:'city', text:'Sapevi che una “città globale” conta per finanza, decisioni e reti internazionali più che per numero di abitanti?'} ,
  {topic:'city', text:'Sapevi che le funzioni urbane possono cambiare nel tempo? Una città industriale può diventare turistica o culturale.'} ,
  {topic:'city', text:'Sapevi che molte città nordamericane hanno una pianta a scacchiera (grid) nata per rendere facile l’espansione?'} ,
  {topic:'city', text:'Sapevi che la suburbanizzazione è la crescita di aree residenziali fuori dal centro, spesso legata all’uso dell’auto?'} ,
  {topic:'city', text:'Sapevi che i trasporti pubblici efficienti riducono traffico e inquinamento e cambiano la forma della città?'} ,

  {topic:'demo', text:'Sapevi che la “transizione demografica” descrive il passaggio da alti a bassi tassi di natalità e mortalità durante lo sviluppo?'} ,
  {topic:'demo', text:'Sapevi che un Paese può avere crescita zero ma grandi cambiamenti interni, per esempio più anziani e meno giovani?'} ,
  {topic:'demo', text:'Sapevi che la densità “fisiologica” considera solo la terra coltivabile: in certi Paesi è molto più alta della densità media.'} ,
  {topic:'demo', text:'Sapevi che il tasso di natalità non è lo stesso della fecondità? Natalità = nati su popolazione totale; fecondità = figli per donna.'} ,
  {topic:'demo', text:'Sapevi che il saldo migratorio può cambiare rapidamente per crisi economiche o conflitti nelle aree vicine?'} ,

  {topic:'mig', text:'Sapevi che “diaspora” indica una comunità che vive fuori dal Paese d’origine mantenendo legami culturali e sociali?'} ,
  {topic:'mig', text:'Sapevi che molti migranti scelgono città dove esistono già comunità dello stesso Paese, perché aiutano con casa e lavoro?'} ,
  {topic:'mig', text:'Sapevi che le migrazioni possono essere stagionali, ad esempio per lavori agricoli o turistici in certi periodi dell’anno?'} ,
  {topic:'mig', text:'Sapevi che l’integrazione può dipendere molto dalla scuola, dalla lingua e dall’accesso ai servizi pubblici?'} ,
  {topic:'mig', text:'Sapevi che i confini non fermano del tutto le migrazioni: spesso le trasformano (rotte diverse, più rischi, più costi).'} ,

  {topic:'city', text:'Sapevi che le “smart city” usano dati e tecnologia per gestire traffico, energia e servizi pubblici in modo più efficiente?'} ,
  {topic:'city', text:'Sapevi che la gentrificazione è quando un quartiere si “riqualifica” ma aumenta i prezzi e alcune famiglie devono spostarsi?'} ,
  {topic:'city', text:'Sapevi che molte città portuali sono cresciute grazie al commercio internazionale e hanno funzioni logistiche importanti?'} ,
  {topic:'city', text:'Sapevi che la rete dei trasporti influenza dove nascono nuovi quartieri: metropolitane e stazioni attirano attività e persone?'} ,
  {topic:'city', text:'Sapevi che le isole di calore urbane rendono le città più calde delle campagne circostanti, soprattutto d’estate?'} ,

  {topic:'demo', text:'Sapevi che l’indice di dipendenza confronta la popolazione giovane+anziana con quella in età lavorativa: aiuta a capire i “carichi” sociali?'} ,
  {topic:'mig', text:'Sapevi che migrazione e demografia sono collegate: arrivi e partenze cambiano età media e numero di nascite nel Paese?'} ,
  {topic:'city', text:'Sapevi che molte città hanno una “cintura” industriale o commerciale: i diversi usi del suolo creano zone specializzate?'} ,
  {topic:'demo', text:'Sapevi che in molti Paesi sviluppati il calo delle nascite porta a classi scolastiche più piccole ma aumenta il bisogno di assistenza agli anziani?'} ,
  {topic:'mig', text:'Sapevi che la migrazione può essere “forzata” (guerra, persecuzioni) o “volontaria” (studio, lavoro), ma spesso sta nel mezzo?'} ,
];

let lastCurioKey = '';
function getCuriosity(topic){
  const pool = CURIOS.filter(c => c.topic === topic);
  const list = pool.length ? pool : CURIOS;
  // evita ripetizione immediata
  let c = pick(list);
  let tries = 0;
  while (c && (c.topic + '|' + c.text) === lastCurioKey && tries < 6){
    c = pick(list);
    tries++;
  }
  lastCurioKey = (c.topic + '|' + c.text);
  return c.text;
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

function weightedPick(items, weightFn){
  let total = 0;
  const weights = items.map((it) => {
    const w = Math.max(0.001, weightFn(it));
    total += w;
    return w;
  });
  let r = Math.random() * total;
  for (let i=0;i<items.length;i++){
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length-1];
}

// Sessione sempre "mix": l'app sceglie più spesso ciò che lo studente sbaglia.
function buildSession(count){
  const progress = STORE.get('geo_progress', scoreInit());

  // pool per skill
  const bySkill = new Map();
  for (const q of BANK){
    if (!bySkill.has(q.skill)) bySkill.set(q.skill, []);
    bySkill.get(q.skill).push(q);
  }
  // mescola ogni skill
  for (const [k, arr] of bySkill.entries()) bySkill.set(k, shuffle(arr));

  const skills = [...bySkill.keys()];
  const chosen = [];
  const used = new Set();

  const weakness = (sk) => {
    const v = progress[sk] || {seen:0, correct:0};
    // unseen -> un po' di priorità, ma non massima
    if (!v.seen) return 0.65;
    const acc = v.correct / v.seen;
    return clamp(1 - acc, 0.10, 0.95);
  };

  // scegli skills bilanciando: più debole = più probabile
  while (chosen.length < count){
    const sk = weightedPick(skills, (s) => 0.25 + weakness(s));
    const arr = bySkill.get(sk) || [];
    // se finita, rimescola dall'intera banca per quella skill
    if (!arr.length){
      bySkill.set(sk, shuffle(BANK.filter(q => q.skill === sk)));
    }
    const q = (bySkill.get(sk) || []).pop();
    if (!q) break;
    const key = q.type + '|' + q.skill + '|' + q.prompt;
    if (used.has(key)) continue;
    used.add(key);
    chosen.push(q);
  }

  // garantisci presenza dei 3 macro-temi se possibile
  const has = (t) => chosen.some(q => q.topic === t);
  const needTopics = ['demo','mig','city'].filter(t => !has(t));
  for (const t of needTopics){
    const cand = shuffle(BANK.filter(q => q.topic === t));
    const q = cand.find(x => !used.has(x.type + '|' + x.skill + '|' + x.prompt));
    if (q){
      chosen[randInt(chosen.length)] = q;
    }
  }

  return shuffle(chosen).slice(0, count);
}

// -------------------- App state --------------------
let session = null; // {mode, questions, idx, correct, answers[]}
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

  // auto-connect Firebase in background (PWA already registered)
  try {
    const ok = initFirebaseIfPossible();
    if (ok) fbConnectPresence();
  } catch {}
}

function persistSession(){ STORE.set('geo_session', session); }
function loadSession(){ return STORE.get('geo_session', null); }

function startNew(){
  const mode = $('mode').value;
  const count = clamp(parseInt($('count').value, 10), 10, 50);
  const questions = buildSession(count);

  session = { mode, questions, idx:0, correct:0, answers:[] , startedAt: now() };
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
  // sync to Firebase if connected (for class analytics and personalized practice)
  try { fbSyncSkill(skill, ok); } catch {}
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
  // Nessun audio in Geografia

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
    const curio = getCuriosity(q.topic);
    $('feedback').innerHTML = ok
      ? `✅ <strong>Corretto.</strong><div class="curio">💡 ${curio}</div>`
      : `❌ <strong>No.</strong> <span class="muted">Giusta: ${q.choices[q.a]}</span><div class="curio">💡 ${curio}</div>`;
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
    const curio = getCuriosity(q.topic);
    if (ok){
      $('feedback').innerHTML = `✅ <strong>Corretto.</strong><div class="curio">💡 ${curio}</div>`;
    } else {
      $('feedback').innerHTML = `❌ <strong>No.</strong> <span class="muted">Soluzione: ${q.answer}</span><div class="curio">💡 ${curio}</div>`;
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
    topic: 'mix',
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

// -------------------- Class panel (Firebase realtime) --------------------
function relTime(ts){
  if (!ts) return '—';
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'adesso';
  const m = Math.round(diff/60000);
  if (m < 60) return `${m} min fa`;
  const h = Math.round(m/60);
  if (h < 24) return `${h} h fa`;
  const g = Math.round(h/24);
  return `${g} g fa`;
}

function renderClassStats(users){
  const list = Object.values(users || {});
  const total = list.length;
  const online = list.filter(u => u && u.online).length;

  // summary cards
  let html = `
    <div class="statCard"><div class="statK">Iscritti</div><div class="statV">${total}</div></div>
    <div class="statCard"><div class="statK">Online</div><div class="statV">${online}</div></div>
  `;

  // compact roster
  const roster = list
    .filter(u => u && u.name)
    .sort((a,b) => (b.online===true) - (a.online===true) || ((b.lastSeen||0) - (a.lastSeen||0)));

  html += `<div class="roster">`;
  for (const u of roster){
    const dot = u.online ? '🟢' : '🔴';
    html += `
      <div class="rosterRow">
        <div class="rosterName">${dot} ${u.name}</div>
        <div class="rosterMeta">ultimo accesso: ${relTime(u.lastSeen)}</div>
      </div>
    `;
  }
  html += `</div>`;
  $('classStats').innerHTML = html;
}

function openClass(){
  show('classPanel');

  // show config UI if missing
  const hasCfg = !!STORE.get('geo_fb_cfg', null);
  const fbBox = $('fbBox');
  if (fbBox) fbBox.style.display = hasCfg ? 'none' : 'block';

  // initialize and connect if possible
  const ok = initFirebaseIfPossible();
  if (ok){
    fbConnectPresence();
    const cc = FB.classCode || CLASS_CODE_DEFAULT;
    const usersRef = FB.db.ref(`classes/${cc}/users`);
    // subscribe
    usersRef.off();
    usersRef.on('value', (snap) => {
      renderClassStats(snap.val() || {});
    });
    FB.usersUnsub = () => usersRef.off();
  } else {
    // offline fallback
    const name = STORE.get('geo_name','');
    $('classStats').innerHTML = `
      <div class="statCard"><div class="statK">Utente</div><div class="statV">${name || '—'}</div></div>
      <div class="statCard"><div class="statK">Stato classe</div><div class="statV">Non connesso</div></div>
      <div class="statCard"><div class="statK">Suggerimento</div><div class="statV">Inserisci la config Firebase (JSON)</div></div>
    `;
  }
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
  $('closeClassBtn')?.addEventListener('click', () => {
    try { if (FB.usersUnsub) FB.usersUnsub(); } catch {}
    show('setup');
    updateSkillsUI();
  });

  // Firebase config UI (set once, then all devices just enter name)
  $('fbSaveBtn')?.addEventListener('click', () => {
    const raw = $('fbConfig')?.value?.trim() || '';
    const obj = parseFirebaseConfig(raw);
    const status = $('fbStatus');
    if (!obj){ if (status) status.textContent = 'Config non valida (JSON)'; return; }
    STORE.set('geo_fb_cfg', obj);
    if (status) status.textContent = 'Salvato. Provo a connettere…';
    if (initFirebaseIfPossible()){
      fbConnectPresence();
      if (status) status.textContent = 'Connesso ✅';
      openClass();
    } else {
      if (status) status.textContent = 'Impossibile inizializzare Firebase (controlla connessione).';
    }
  });
  $('fbClearBtn')?.addEventListener('click', () => {
    STORE.del('geo_fb_cfg');
    const status = $('fbStatus');
    if (status) status.textContent = 'Config rimossa.';
    const box = $('fbBox');
    if (box) box.style.display = 'block';
  });

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
