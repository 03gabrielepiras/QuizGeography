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

async function renderChartForQuestion(q){
  const chartBox = document.getElementById("chartBox");
  if(!chartBox) return;

  const chartTitle = document.getElementById("chartTitle");
  const chartNote = document.getElementById("chartNote");
  const chartSource = document.getElementById("chartSource");
  const chartCanvas = document.getElementById("chartCanvas");

  if(!q.chart){
    chartBox.classList.add("hidden");
    chartTitle.textContent = "";
    chartNote.textContent = "";
    chartSource.textContent = "";
    return;
  }

  chartBox.classList.remove("hidden");
  chartTitle.textContent = "🟠 " + (q.chart.title || "Grafico");
  chartNote.textContent = q.chart.note ? ("Nota: " + q.chart.note) : "";
  chartSource.textContent = q.chart.source ? ("Fonte: " + q.chart.source) : "";

  const maxW = Math.min(820, document.getElementById("quiz").clientWidth - 40);
  chartCanvas.width = Math.max(320, maxW);
  chartCanvas.height = 280;

  const ctx = chartCanvas.getContext("2d");
  ctx.clearRect(0,0,chartCanvas.width, chartCanvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "14px system-ui";
  ctx.fillText("Carico dati…", 16, 26);

  try{
    if(q.chart.type === "pie"){
      drawPie(chartCanvas, q.chart.slices || []);
      addQuickReading(q, {kind:"pie"});
      return;
    }

    if(q.chart.type === "wb_pie_age"){
      const obs14 = await wbFetch(q.chart.country, q.chart.ind_0014, {});
      const obs65 = await wbFetch(q.chart.country, q.chart.ind_65up, {});
      const a14 = pickLatestByCountry(obs14)[q.chart.country];
      const a65 = pickLatestByCountry(obs65)[q.chart.country];
      const year = Math.max(a14?.year||0, a65?.year||0) || "";
      const v14 = a14?.value ?? 0;
      const v65 = a65?.value ?? 0;
      const v1564 = Math.max(0, 100 - v14 - v65);
      drawPie(chartCanvas, [
        {label:"0–14", value:v14},
        {label:"15–64", value:v1564},
        {label:"65+", value:v65},
      ]);
      addQuickReading(q, {kind:"age", year, v14, v65});
      return;
    }

    if(q.chart.type === "wb_multi_bar"){
      const obs = await wbFetch(q.chart.countries, q.chart.indicator, {});
      const latest = pickLatestByCountry(obs);
      const series = (q.chart.countries || []).map(code => {
        const it = latest[code];
        return {label: code, value: it ? it.value : 0, year: it ? it.year : 0};
      });
      drawBars(chartCanvas, series, {formatValue:(v)=>String(Math.round(v*100)/100)});
      const year = Math.max(...series.map(s=>s.year||0)) || "";
      addQuickReading(q, {kind:"fertility", year, series});
      return;
    }

    if(q.chart.type === "wb_bar"){
      const obsA = await wbFetch(q.chart.country, q.chart.indicatorA, {});
      const obsB = await wbFetch(q.chart.country, q.chart.indicatorB, {});
      const la = pickLatestByCountry(obsA)[q.chart.country];
      const lb = pickLatestByCountry(obsB)[q.chart.country];
      const year = Math.max(la?.year||0, lb?.year||0) || "";
      const birth = la ? la.value : 0;
      const death = lb ? lb.value : 0;
      drawBars(chartCanvas, [
        {label:"Natalità", value: birth},
        {label:"Mortalità", value: death},
      ], {formatValue:(v)=>String(Math.round(v*10)/10)});
      addQuickReading(q, {kind:"birthdeath", year, birth, death});
      return;
    }

    chartBox.classList.add("hidden");
  }catch(e){
    ctx.clearRect(0,0,chartCanvas.width, chartCanvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("Dati non disponibili (offline?).", 16, 26);
    chartNote.textContent = "Apri una volta online: la PWA li terrà in cache.";
  }
}

function addQuickReading(q, payload){
  const phenText = document.getElementById("phenomenonText");
  if(!phenText || !q.phenomenon) return;

  // evita doppioni
  if(phenText.textContent.includes("📌 Lettura rapida")) return;

  let extra = "";
  if(payload.kind === "age" && payload.year){
    extra = `\n\n📌 Lettura rapida (${payload.year}): 0–14 ≈ ${Math.round(payload.v14)}%, 65+ ≈ ${Math.round(payload.v65)}%. ` +
            `Se 65+ è alto e 0–14 è basso, la popolazione tende a invecchiare.`;
  } else if(payload.kind === "fertility" && payload.series){
    const s = [...payload.series].sort((a,b)=>b.value-a.value);
    extra = `\n\n📌 Lettura rapida${payload.year ? " ("+payload.year+")" : ""}: ${s[0].label} ha la fecondità più alta; ` +
            `${s[s.length-1].label} la più bassa.`;
  } else if(payload.kind === "birthdeath" && payload.year){
    extra = `\n\n📌 Lettura rapida (${payload.year}): se la mortalità supera la natalità, senza immigrazione la popolazione tende a diminuire.`;
  } else if(payload.kind === "pie"){
    extra = `\n\n📌 Lettura rapida: la fetta più grande indica dove si concentra la popolazione.`;
  }

  if(extra){
    phenText.textContent = q.phenomenon + extra;
  }
}

async function showQuestion(){
  state.answered = false;
  const q = QUESTIONS[state.index];

  // badge blocco
  const badge = document.getElementById("blockBadge");
  badge.textContent = q.block + " • " + (q.block==="G1" ? "Demografia" : q.block==="G2" ? "Migrazioni" : "Le città");

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

    await renderChartForQuestion(q);
  } else {
    phen.classList.add("hidden");
    mediaBox.classList.add("hidden");
    mediaImg.removeAttribute("src");
    mediaCap.textContent = "";
    // nascondi grafico
    const chartBox = document.getElementById("chartBox");
    if(chartBox) chartBox.classList.add("hidden");
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

  document.getElementById("analysisBox").classList.add("hidden");
  document.getElementById("feedback").classList.add("hidden");
  document.getElementById("feedback").textContent = "";
}

function answer(i){
  if(state.answered) return;
  state.answered = true;

  const q = QUESTIONS[state.index];
  const correct = (i===q.correct);

  const fb = document.getElementById("feedback");
  fb.classList.remove("hidden");
  fb.textContent = (correct ? "✅ Corretto. " : "❌ Non corretto. ") + (q.explanation || "");

  if(state.mode==="train"){
    const res = generateAnalysis(q.block);
    document.getElementById("analysisText").innerText = res.text;
    document.getElementById("analysisSource").innerText = "Fonte: " + res.source;
    document.getElementById("analysisBox").classList.remove("hidden");
  }

  const btns = Array.from(document.querySelectorAll("#answers .btn"));
  btns.forEach((b, idx)=>{
    if(idx===q.correct) b.classList.add("primary");
    b.disabled = true;
  });
}

function next(){
  state.index++;
  if(state.index>=QUESTIONS.length){
    alert("Fine! Hai completato il percorso (v17.5).");
    location.reload();
  } else {
    showQuestion();
  }
}
