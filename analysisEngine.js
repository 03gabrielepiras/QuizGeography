const ANALYSIS = {
  G1: {
    observe: [
      "Osservando il grafico demografico",
      "Analizzando la struttura per età e sesso",
      "Dai dati sulla popolazione emerge"
    ],
    explain: [
      "un cambiamento nelle classi d’età",
      "uno squilibrio tra popolazione attiva e inattiva",
      "un andamento legato a natalità, mortalità e migrazioni"
    ],
    cause: [
      "connesso a sviluppo, sanità e stili di vita",
      "legato a dinamiche economiche e sociali",
      "influenzato da fattori umani e ambientali"
    ],
    example: [
      "come si vede nel caso del Qatar quando i flussi migratori aumentano le età lavorative",
      "come accade nei Paesi che invecchiano (Europa, Giappone)",
      "come avviene nelle aree ad alta densità (pianure alluvionali asiatiche)"
    ],
    source: "Materiali del corso (Prof. Albiani) + ONU (World Population Prospects)"
  },
  G2: {
    observe: [
      "Guardando i flussi migratori",
      "Analizzando push & pull factors",
      "Dai dati sulle migrazioni emerge"
    ],
    explain: [
      "che le cause sono multiple e interconnesse",
      "che globalizzazione e reti sociali rendono i movimenti più rapidi",
      "che esistono migranti economici, richiedenti asilo e rifugiati"
    ],
    cause: [
      "legate a guerre, crisi economiche e disastri ambientali",
      "collegate a lavoro, servizi e sicurezza nei Paesi di arrivo",
      "influenzate da leggi e accessibilità del Paese di destinazione"
    ],
    example: [
      "come mostra l’aumento dei migranti globali (2000→2019)",
      "come avviene nei flussi tra Europa orientale e occidentale",
      "come nelle migrazioni interne (campagne→città)"
    ],
    source: "Materiali del corso (Prof. Albiani) + UNHCR"
  },
  G3: {
    observe: [
      "Osservando l’urbanesimo",
      "Analizzando la struttura interna delle città",
      "Dai dati sull’urbanizzazione emerge"
    ],
    explain: [
      "che cresce la quota di popolazione urbana",
      "che le città svolgono funzioni diverse e hanno ranghi diversi",
      "che i modelli urbani cambiano tra continenti"
    ],
    cause: [
      "legate a opportunità di lavoro e servizi",
      "collegate a storia, economia e pianificazione urbana",
      "influenzate da crescita demografica e disuguaglianze"
    ],
    example: [
      "come nel modello nordamericano con CBD e suburbia",
      "come nel modello europeo con centro storico multifunzionale",
      "come nelle baraccopoli nei Paesi in via di sviluppo"
    ],
    source: "Materiali del corso (Prof. Albiani) + ONU-Habitat"
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
