let state = { name:null, mode:null, index:0, answered:false };

function startApp(){
  const n = document.getElementById("nameInput").value.trim();
  if(!n) return alert("Inserisci il nome");
  state.name = n;
  document.getElementById("nameBox").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("welcome").innerText = "Ciao " + n + " — scegli Allenamento o Verifica.";
}

function startMode(mode){
  state.mode = mode;
  state.index = 0;
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  showQuestion();
}

function backToMenu(){
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function showQuestion(){
  state.answered = false;
  const q = QUESTIONS[state.index];

  // badge blocco
  const badge = document.getElementById("blockBadge");
  badge.textContent = q.block + " • " + (q.block==="G1" ? "Demografia" : q.block==="G2" ? "Migrazioni" : "Le città");

  // Allenamento: fenomeno + media + analisi, Verifica: solo domanda
  const phen = document.getElementById("phenomenonBox");
  const phenText = document.getElementById("phenomenonText");
  const mediaBox = document.getElementById("mediaBox");
  const mediaImg = document.getElementById("mediaImg");
  const mediaCap = document.getElementById("mediaCap");

  if(state.mode==="train" && q.phenomenon){
    phen.classList.remove("hidden");
    phenText.textContent = q.phenomenon;

    if(q.media && q.media.img){
      mediaBox.classList.remove("hidden");
      mediaImg.src = q.media.img;
      mediaCap.textContent = q.media.cap || "";
    } else {
      mediaBox.classList.add("hidden");
      mediaImg.removeAttribute("src");
      mediaCap.textContent = "";
    }
  } else {
    phen.classList.add("hidden");
    mediaBox.classList.add("hidden");
    mediaImg.removeAttribute("src");
    mediaCap.textContent = "";
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
