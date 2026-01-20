function drawPie(canvas, slices){
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  const cx=w/2, cy=h/2, r=Math.min(w,h)*0.42;
  const total = slices.reduce((s,x)=>s+x.value,0) || 1;
  let a0 = -Math.PI/2;
  slices.forEach((s, idx)=>{
    const a1 = a0 + (s.value/total)*Math.PI*2;
    // deterministic color from index (no hard-coded palette feel)
    const hue = (idx*67) % 360;
    ctx.fillStyle = `hsla(${hue}, 75%, 55%, 0.9)`;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,a0,a1);
    ctx.closePath();
    ctx.fill();
    a0 = a1;
  });
  // center hole (donut) for style
  ctx.fillStyle = "rgba(11,18,32,0.92)";
  ctx.beginPath();
  ctx.arc(cx,cy,r*0.55,0,Math.PI*2);
  ctx.fill();

  // legend
  ctx.font = "12px system-ui";
  ctx.textBaseline = "middle";
  let y = h - 14*slices.length - 10;
  slices.forEach((s, idx)=>{
    const hue = (idx*67) % 360;
    ctx.fillStyle = `hsla(${hue}, 75%, 55%, 0.9)`;
    ctx.fillRect(10, y, 10, 10);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    const pct = Math.round((s.value/total)*100);
    ctx.fillText(`${s.label} — ${pct}%`, 26, y+5);
    y += 14;
  });
}


async function wbFetch(countryCodes, indicator, opts={}){
  const countries = Array.isArray(countryCodes) ? countryCodes.join(";") : countryCodes;
  const date = opts.date || "";
  const perPage = opts.per_page || 200;
  const url = `https://api.worldbank.org/v2/country/${countries}/indicator/${indicator}?format=json&per_page=${perPage}${date ? `&date=${date}` : ""}`;
  const res = await fetch(url, {cache:"no-store"});
  if(!res.ok) throw new Error("WB fetch failed: " + res.status);
  const data = await res.json();
  return data[1] || [];
}

function pickLatestByCountry(observations){
  const out = {};
  observations.forEach(o=>{
    const code = o.country?.id;
    const year = parseInt(o.date, 10);
    const val = (o.value===null || o.value===undefined) ? null : Number(o.value);
    if(!code) return;
    if(val===null || Number.isNaN(val)) return;
    if(!out[code] || year > out[code].year){
      out[code] = {year, value: val, name: o.country?.value || code};
    }
  });
  return out;
}

function drawBars(canvas, series, opts={}){
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  const pad = 30;
  const chartW = w - pad*2;
  const chartH = h - pad*2;
  const maxV = Math.max(...series.map(s=>s.value), 1);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, pad+chartH);
  ctx.lineTo(pad+chartW, pad+chartH);
  ctx.stroke();

  const barW = chartW / Math.max(series.length,1) * 0.65;
  series.forEach((s,i)=>{
    const slot = chartW/series.length;
    const x = pad + slot*i + (slot - barW)/2;
    const bh = (s.value/maxV)*chartH;
    const y = pad + chartH - bh;
    const hue = (i*67) % 360;
    ctx.fillStyle = `hsla(${hue}, 75%, 55%, 0.9)`;
    ctx.fillRect(x, y, barW, bh);

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(s.label, x+barW/2, pad+chartH+6);

    ctx.textBaseline = "bottom";
    ctx.fillText(opts.formatValue ? opts.formatValue(s.value) : String(Math.round(s.value*10)/10), x+barW/2, y-4);
  });
}


function indexByYear(observations, country){
  const m = {};
  observations.forEach(o=>{
    if(o.country?.id !== country) return;
    const y = parseInt(o.date,10);
    const v = (o.value===null || o.value===undefined) ? null : Number(o.value);
    if(v===null || Number.isNaN(v)) return;
    m[y]=v;
  });
  return m;
}

function pickLatestCommonYear(obsA, obsB, country){
  const a = indexByYear(obsA, country);
  const b = indexByYear(obsB, country);
  const years = Object.keys(a).map(int=>parseInt(int,10)).filter(y=>b[y]!==undefined);
  if(!years.length) return null;
  const y = Math.max(...years);
  return {year:y, a:a[y], b:b[y]};
}
