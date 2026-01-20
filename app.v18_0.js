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
    mediaCap.textContent = item.media.cap || "";
  } else {
    mediaBox.classList.add("hidden");
    mediaImg.removeAttribute("src");
    mediaCap.textContent = "";
  }

  // Chart
  const chartBox = document.getElementById("chartBox");
  if(chartBox){
    chartBox.classList.add("hidden");
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
    alert("Fine Allenamento G1 (v18.0).");
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

  window.__quizReady = true;
}

document.addEventListener("DOMContentLoaded", initUI);
