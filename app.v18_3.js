let state = {
  name: null,
  mode: null,           // "train" | "test"
  steps: [],            // for train
  stepPos: 0,
  order: [],            // for test (future)
  qPos: 0,
  answered: false,
  score: 0
};

function startApp(){
  const n = document.getElementById("nameInput").value.trim();
  if(!n) return alert("Inserisci il nome");
  state.name = n;
  document.getElementById("nameBox").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("welcome").innerText = "Ciao " + n + " — Allenamento (G1) ora è sequenziale a blocchi.";
}

function startMode(mode){
  state.mode = mode;

  if(mode === "train"){
    // Allenamento: SEQUENZIALE (stile prof) — per ora G1
    state.steps = TRAIN_G1.slice();
    state.stepPos = 0;
    state.answered = false;

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");
    showStep();
    return;
  }

  // Verifica: la faremo dopo (per ora teniamo un placeholder semplice)
  alert("Verifica verrà completata dopo l’Allenamento. Per ora usa Allenamento (G1).");
}

function backToMenu(){
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function resolveQuestionById(qid){
  return QUESTIONS.find(q => q.id === qid) || null;
}

function setProgress(text){
  const prog = document.getElementById("progressText");
  if(prog) prog.textContent = text || "";
}

async function renderMediaAndChart(item){
  // Media
  const mediaBox = document.getElementById("mediaBox");
  const mediaImg = document.getElementById("mediaImg");
  const mediaCap = document.getElementById("mediaCap");

  if(item.media && item.media.img){
    mediaBox.classList.remove("hidden");
    mediaImg.src = item.media.img;
    mediaImg.loading = "lazy";
    mediaImg.decoding = "async";
    mediaCap.textContent = item.media.cap || "";
  } else {
    mediaBox.classList.add("hidden");
    mediaImg.removeAttribute("src");
    mediaCap.textContent = "";
  }

  // Chart (opzionale)
  const chartBox = document.getElementById("chartBox");
  const canvas = document.getElementById("chartCanvas");
  const chartTitle = document.getElementById("chartTitle");
  const chartNote  = document.getElementById("chartNote");
  const chartSource= document.getElementById("chartSource");

  if(!chartBox || !canvas) return;
  chartBox.classList.add("hidden");

  // item.chart example:
  // {type:'pie'|'bars', title:'', note:'', source:'', data:[{label,value},...]}
  if(item.chart && item.chart.type && Array.isArray(item.chart.data)){
    chartTitle.textContent = item.chart.title || "";
    chartNote.textContent  = item.chart.note || "";
    chartSource.textContent= item.chart.source || "";

    // Retina: rendi nitido su schermi ad alta densità (iOS/Android)
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const cssW = Math.min(640, chartBox.clientWidth ? chartBox.clientWidth - 24 : 520);
    const cssH = Math.round(cssW * 0.5);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if(item.chart.type === "pie"){
      drawPie(canvas, item.chart.data);
    } else if(item.chart.type === "bars"){
      drawBars(canvas, item.chart.data, item.chart.opts || {});
    }

    chartBox.classList.remove("hidden");
  }
}

async function showStep(){
  state.answered = false;

  const step = state.steps[state.stepPos];
  const badge = document.getElementById("blockBadge");
  badge.textContent = "G1 • Demografia";

  setProgress(`Step ${state.stepPos+1} / ${state.steps.length}`);

  const phen = document.getElementById("phenomenonBox");
  const phenText = document.getElementById("phenomenonText");
  const questionEl = document.getElementById("question");
  const answersEl = document.getElementById("answers");

  // reset boxes
  document.getElementById("analysisBox").classList.add("hidden");
  document.getElementById("feedback").classList.add("hidden");
  document.getElementById("feedback").textContent = "";

  // Next button behavior: in lesson always enabled; in question enabled after answer
  const nextBtn = document.getElementById("btnNext");
  if(nextBtn){
    nextBtn.disabled = false;
  }

  if(step.type === "lesson"){
    // Show lesson content
    phen.classList.remove("hidden");
    phenText.textContent = step.text;

    await renderMediaAndChart(step);

    questionEl.textContent = step.title;
    answersEl.innerHTML = "";
    // No answers for lessons
    if(nextBtn) nextBtn.disabled = false;
    return;
  }

  // Question step
  const q = resolveQuestionById(step.qid);
  if(!q){
    questionEl.textContent = "Errore: domanda non trovata (" + step.qid + ")";
    answersEl.innerHTML = "";
    return;
  }

  phen.classList.remove("hidden");
  phenText.textContent = q.phenomenon || "";

  // media & chart
  await renderMediaAndChart(q);

  questionEl.textContent = q.question;

  answersEl.innerHTML = "";
  q.options.forEach((opt, i)=>{
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = opt;
    b.addEventListener("click", ()=>answer(i, q));
    answersEl.appendChild(b);
  });

  // require answer before next
  if(nextBtn) nextBtn.disabled = true;
}

function answer(i, q){
  if(state.answered) return;
  state.answered = true;

  const correct = (i === q.correct);
  const fb = document.getElementById("feedback");
  fb.classList.remove("hidden");
  fb.textContent = (correct ? "✅ Corretto. " : "❌ Non corretto. ") + (q.explanation || "");

  // Allenamento: analisi automatica
  const res = generateAnalysis("G1");
  document.getElementById("analysisText").innerText = res.text;
  document.getElementById("analysisSource").innerText = "Fonte: " + res.source;
  document.getElementById("analysisBox").classList.remove("hidden");

  // Highlight correct
  const btns = Array.from(document.querySelectorAll("#answers .btn"));
  btns.forEach((b, idx)=>{
    if(idx === q.correct) b.classList.add("primary");
    b.disabled = true;
  });

  // enable next
  const nextBtn = document.getElementById("btnNext");
  if(nextBtn) nextBtn.disabled = false;
}

function next(){
  if(state.mode !== "train") return;

  if(state.stepPos < state.steps.length - 1){
    state.stepPos++;
    showStep();
  } else {
    alert("Fine Allenamento G1 (v18.1).");
    backToMenu();
  }
}

function initUI(){
  const btnEnter = document.getElementById("btnEnter");
  const btnTrain = document.getElementById("btnTrain");
  const btnTest  = document.getElementById("btnTest");
  const btnNext  = document.getElementById("btnNext");
  const btnMenu  = document.getElementById("btnMenu");
  const nameInput = document.getElementById("nameInput");

  // Zoom grafici/slide
  const mediaImg = document.getElementById("mediaImg");
  const mediaCap = document.getElementById("mediaCap");
  const imgModal = document.getElementById("imgModal");
  const imgModalImg = document.getElementById("imgModalImg");
  const imgModalCaption = document.getElementById("imgModalCaption");
  const imgModalClose = document.getElementById("imgModalClose");
  const imgModalBtnClose = document.getElementById("imgModalBtnClose");

  function openImgModal(){
    if(!mediaImg || !mediaImg.src) return;
    if(imgModalImg) imgModalImg.src = mediaImg.src;
    if(imgModalCaption) imgModalCaption.textContent = (mediaCap && mediaCap.textContent) ? mediaCap.textContent : "";
    if(imgModal){
      imgModal.classList.remove("hidden");
      imgModal.setAttribute("aria-hidden", "false");
    }
  }
  function closeImgModal(){
    if(!imgModal) return;
    imgModal.classList.add("hidden");
    imgModal.setAttribute("aria-hidden", "true");
    if(imgModalImg) imgModalImg.removeAttribute("src");
  }

  if(btnEnter) btnEnter.addEventListener("click", startApp);
  if(btnTrain) btnTrain.addEventListener("click", () => startMode("train"));
  if(btnTest)  btnTest.addEventListener("click", () => startMode("test"));
  if(btnNext)  btnNext.addEventListener("click", next);
  if(btnMenu)  btnMenu.addEventListener("click", backToMenu);

  if(nameInput){
    nameInput.addEventListener("keydown", (e)=>{
      if(e.key === "Enter"){
        e.preventDefault();
        startApp();
      }
    });
  }

  if(mediaImg){
    mediaImg.style.cursor = "zoom-in";
    mediaImg.addEventListener("click", openImgModal);
  }
  if(imgModalClose) imgModalClose.addEventListener("click", closeImgModal);
  if(imgModalBtnClose) imgModalBtnClose.addEventListener("click", closeImgModal);
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") closeImgModal();
  });

  window.__quizReady = true;
}

document.addEventListener("DOMContentLoaded", initUI);
