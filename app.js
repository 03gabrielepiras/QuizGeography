let state = { name:null, mode:null, index:0, answered:false };


async function renderChartForQuestion(q){
  const chartBox = document.getElementById("chartBox");
  const chartTitle = document.getElementById("chartTitle");
  const chartNote = document.getElementById("chartNote");
  const chartSource = document.getElementById("chartSource");
  const chartCanvas = document.getElementById("chartCanvas");

  if(!chartBox) return;

  if(!(q.chart)){
    chartBox.classList.add("hidden");
    return;
  }

  chartBox.classList.remove("hidden");
  chartTitle.textContent = "🟠 " + (q.chart.title || "Grafico");
  chartNote.textContent = q.chart.note ? ("Nota: " + q.chart.note) : "";
  chartSource.textContent = q.chart.source ? ("Fonte: " + q.chart.source) : "";

  // responsive canvas
  const maxW = Math.min(820, document.getElementById("quiz").clientWidth - 40);
  chartCanvas.width = Math.max(320, maxW);
  chartCanvas.height = 280;

  // Loading placeholder
  const ctx = chartCanvas.getContext("2d");
  ctx.clearRect(0,0,chartCanvas.width, chartCanvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "14px system-ui";
  ctx.fillText("Carico dati…", 16, 26);

  try{

  } else {
    phen.classList.add("hidden");
    mediaBox.classList.add("hidden");
    mediaImg.removeAttribute("src");
    mediaCap.textContent = "";
    if(chartBox){ chartBox.classList.add("hidden"); }
  }

  document.getElementById("question").innerText = q.question;

  const a = document.getElementById("answers");
  a.innerHTML = "";
  q.options.forEach((opt,i)=>{
    const b = document.createElement("button");
    b.className = "btn";
    b.innerText = opt;
    b.onclick = ()=>answer(i);
    a.appendChild(b);
  });

  // reset box
  document.getElementById("analysisBox").classList.add("hidden");
  document.getElementById("feedback").classList.add("hidden");
  document.getElementById("feedback").textContent = "";
}

function answer(i){
  if(state.answered) return;
  state.answered = true;

  const q = QUESTIONS[state.index];
  const correct = (i===q.correct);

  // feedback
  const fb = document.getElementById("feedback");
  fb.classList.remove("hidden");
  fb.textContent = (correct ? "✅ Corretto. " : "❌ Non corretto. ") + (q.explanation || "");

  // Allenamento: analisi del prof automatica
  if(state.mode==="train"){
    const res = generateAnalysis(q.block);
    document.getElementById("analysisText").innerText = res.text;
    document.getElementById("analysisSource").innerText = "Fonte: " + res.source;
    document.getElementById("analysisBox").classList.remove("hidden");
  }

  // evidenzia risposte (semplice)
  const btns = Array.from(document.querySelectorAll("#answers .btn"));
  btns.forEach((b, idx)=>{
    if(idx===q.correct) b.classList.add("primary");
    b.disabled = true;
  });
}

function next(){
  state.index++;
  if(state.index>=QUESTIONS.length){
    alert("Fine! Hai completato il percorso (v17.2).");
    location.reload();
  } else {
    showQuestion();
  }
}
