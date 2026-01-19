const ANALYSIS = {
  G1: {
    observe: [
      "Osservando la piramide della popolazione",
      "Analizzando la distribuzione per età",
      "Dal grafico demografico si nota"
    ],
    explain: [
      "una concentrazione nelle età lavorative",
      "una forte presenza di popolazione giovane",
      "uno squilibrio tra popolazione attiva e inattiva"
    ],
    cause: [
      "dovuta a fattori economici",
      "legata a flussi migratori recenti",
      "connessa allo sviluppo del Paese"
    ],
    example: [
      "come nel caso del Qatar",
      "tipica di alcuni Paesi del Golfo",
      "presente in Stati con forte immigrazione lavorativa"
    ],
    source: "ONU – World Population Prospects"
  },

  G2: {
    observe: [
      "Analizzando i flussi migratori",
      "Osservando i dati sulle migrazioni",
      "Dai dati recenti emerge"
    ],
    explain: [
      "un aumento delle migrazioni verso l’Europa",
      "una crescita delle migrazioni forzate",
      "una forte mobilità internazionale"
    ],
    cause: [
      "causata da conflitti e instabilità",
      "legata a crisi climatiche",
      "determinata da motivi economici"
    ],
    example: [
      "secondo i dati UNHCR",
      "come mostrano i rapporti ONU",
      "in linea con le statistiche europee"
    ],
    source: "UNHCR"
  },

  G3: {
    observe: [
      "Osservando la crescita urbana",
      "Analizzando l’espansione delle città",
      "Dai dati urbani si nota"
    ],
    explain: [
      "un aumento della popolazione urbana",
      "una concentrazione nelle grandi città",
      "una rapida urbanizzazione"
    ],
    cause: [
      "legata allo sviluppo economico",
      "connessa alle opportunità lavorative",
      "dovuta ai servizi offerti dalle città"
    ],
    example: [
      "come avviene nelle metropoli mondiali",
      "tipica dei Paesi industrializzati",
      "presente nelle grandi aree urbane"
    ],
    source: "ONU – Habitat"
  }
};

function generateAnalysis(block){
  const a = ANALYSIS[block];
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  return {
    text: `${pick(a.observe)}, ${pick(a.explain)}, ${pick(a.cause)}, ${pick(a.example)}.`,
    source: a.source
  };
}
