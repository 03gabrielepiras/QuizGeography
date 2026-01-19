const QUESTIONS = [
  /* =====================
     G1 — DEMOGRAFIA
     ===================== */
  {
    id:"G1_01",
    block:"G1",
    phenomenon:"La piramide d’età mostra la distribuzione della popolazione per età e sesso. Una base larga indica alta natalità e popolazione giovane; una base stretta indica bassa natalità e invecchiamento. Alcune piramidi ‘anomale’ possono dipendere dalle migrazioni (come nel caso del Qatar).",
    media:{img:"assets/g1_piramide_eta.png", cap:"Piramide d’età: esempi e costruzione (slide del corso)."},
    chart:{"type": "wb_pie_age", "title": "Qatar: struttura per età (%)", "note": "Quote di popolazione 0–14 e 65+ (15–64 calcolata come resto) — anno più recente.", "ind_0014": "SP.POP.0014.TO.ZS", "ind_65up": "SP.POP.65UP.TO.ZS", "country": "QAT", "source": "World Bank (WDI) – popolazione per classi d’età (da ONU WPP)"},
    question:"Cosa può indicare una piramide d’età con forte concentrazione nelle età lavorative e squilibrio tra maschi e femmine?",
    options:[
      "Presenza di lavoratori migranti (migrazioni)",
      "Altissima natalità",
      "Popolazione prevalentemente anziana",
      "Aumento improvviso della mortalità infantile"
    ],
    correct:0,
    explanation:"La slide indica che una concentrazione anomala in certe età può dipendere dai flussi migratori."
  },
  {
    id:"G1_02",
    block:"G1",
    phenomenon:"La densità di popolazione è il rapporto tra abitanti e superficie (ab./km²). A livello globale la densità media nasconde enormi differenze tra continenti e tra Paesi.",
    media:{img:"assets/g1_densita_mondo.png", cap:"Distribuzione e densità della popolazione (slide del corso)."},
    chart:{"type": "wb_pie_age", "title": "Italia: struttura per età (%)", "note": "Quote 0–14 e 65+ (15–64 calcolata). Utile per capire l’invecchiamento.", "ind_0014": "SP.POP.0014.TO.ZS", "ind_65up": "SP.POP.65UP.TO.ZS", "country": "ITA", "source": "World Bank (WDI) – popolazione per classi d’età (da ONU WPP)"},
    question:"Perché la densità media mondiale è poco utile se non si considerano le differenze territoriali?",
    options:[
      "Perché nasconde forti squilibri tra continenti e Paesi",
      "Perché la densità è uguale ovunque",
      "Perché misura solo la natalità",
      "Perché vale solo per le città"
    ],
    correct:0,
    explanation:"Le slide mostrano differenze enormi tra continenti e all’interno degli Stati."
  },
  {
    id:"G1_03",
    block:"G1",
    phenomenon:"Il saldo demografico indica come cambia una popolazione nel tempo: saldo naturale (nati-morti) + saldo migratorio (immigrati-emigrati). Serve per interpretare crescita o calo demografico e prendere decisioni sociali ed economiche.",
    media:null,
    chart:{"type": "wb_multi_bar", "title": "Fecondità totale (figli per donna) — confronto", "note": "Confronto tra Italia, Giappone, Qatar e Niger (anno più recente disponibile).", "indicator": "SP.DYN.TFRT.IN", "countries": ["ITA", "JPN", "QAT", "NER"], "source": "World Bank (WDI) – SP.DYN.TFRT.IN"},
    question:"Da cosa è composto il saldo demografico?",
    options:[
      "Saldo naturale + saldo migratorio",
      "Natalità + densità",
      "Mortalità infantile + speranza di vita",
      "Tasso di fecondità + urbanizzazione"
    ],
    correct:0,
    explanation:"È la definizione presente nelle slide: saldo naturale + saldo migratorio."
  },
  {
    id:"G1_04",
    block:"G1",
    phenomenon:"La crescita della popolazione mondiale è dipesa soprattutto da diminuzione della mortalità e aumento della speranza di vita; dagli anni ’60 il tasso di incremento cala per diminuzione natalità e fecondità.",
    media:{img:"assets/g1_crescita_mondiale.png", cap:"Andamento della popolazione mondiale nel tempo (slide del corso)."},
    chart:{"type": "wb_bar", "title": "Italia: natalità vs mortalità (per 1.000)", "note": "Confronto tra tasso di natalità e tasso di mortalità (valori più recenti disponibili).", "indicatorA": "SP.DYN.CBRT.IN", "indicatorB": "SP.DYN.CDRT.IN", "country": "ITA", "source": "World Bank (WDI) – indicatori SP.DYN.CBRT.IN e SP.DYN.CDRT.IN"},
    question:"Perché il tasso di incremento demografico tende a calare dopo gli anni ’60?",
    options:[
      "Per diminuzione natalità e fecondità",
      "Per aumento della mortalità infantile",
      "Per diminuzione della speranza di vita",
      "Perché la densità mondiale è diminuita"
    ],
    correct:0,
    explanation:"Le slide indicano che il calo è legato a natalità e fecondità in diminuzione."
  },

  /* =====================
     G2 — MIGRAZIONI
     ===================== */
  {
    id:"G2_01",
    block:"G2",
    phenomenon:"Per spiegare le migrazioni si usano push factors (espulsione) e pull factors (attrazione). I push spingono a partire (guerre, povertà, disastri); i pull attirano (lavoro, servizi, sicurezza).",
    media:{img:"assets/g2_push_pull.png", cap:"Push factors e pull factors (slide del corso)."},
    question:"Quale tra questi è un pull factor?",
    options:[
      "Opportunità di lavoro e servizi",
      "Guerra civile",
      "Carestia",
      "Mancanza di assistenza sanitaria"
    ],
    correct:0,
    explanation:"I pull factors sono condizioni di attrazione: lavoro, servizi, qualità della vita."
  },
  {
    id:"G2_02",
    block:"G2",
    phenomenon:"Migrante: persona che si sposta in un luogo diverso da quello di residenza abituale per almeno un anno. Esistono migrazioni interne (dentro lo Stato) e internazionali (tra Stati).",
    media:null,
    question:"Qual è la differenza tra migrazione interna e internazionale?",
    options:[
      "Interna: dentro lo stesso Paese; internazionale: tra Paesi diversi",
      "Interna: solo per lavoro; internazionale: solo per studio",
      "Interna: solo città→campagna; internazionale: solo campagna→città",
      "Non c’è alcuna differenza"
    ],
    correct:0,
    explanation:"È la definizione nelle slide: interna all’interno dello Stato; internazionale tra Stati."
  },
  {
    id:"G2_03",
    block:"G2",
    phenomenon:"Le migrazioni contemporanee sono favorite dalla globalizzazione: trasporti e comunicazioni più veloci, legami più facili con il Paese d’origine, flussi più rapidi e (in parte) femminilizzazione.",
    media:{img:"assets/g2_flussi_2000_2019.png", cap:"Crescita dei migranti globali: 2000 → 2019 (slide del corso)."},
    chart:{"type": "pie", "title": "Migranti internazionali (trend)", "note": "Dalla slide: 176 milioni (2000) → 272 milioni (2019).", "slices": [{"label": "2000", "value": 176}, {"label": "2019", "value": 272}], "source": "Materiali del corso (Prof. Albiani)"},
    question:"Quale elemento della globalizzazione favorisce le migrazioni?",
    options:[
      "Comunicazioni e trasporti più rapidi ed economici",
      "Aumento della mortalità",
      "Riduzione dei servizi nei Paesi di arrivo",
      "Scomparsa totale dei confini"
    ],
    correct:0,
    explanation:"Le slide collegano globalizzazione a interconnessione, trasporti e comunicazioni più veloci."
  },
  {
    id:"G2_04",
    block:"G2",
    phenomenon:"Migrazione regolare: con autorizzazione (permesso di soggiorno, green card). Migrazione irregolare: ingresso senza autorizzazione o permanenza oltre scadenza del permesso.",
    media:null,
    question:"Che cosa distingue una migrazione irregolare?",
    options:[
      "Mancanza di autorizzazione o permesso scaduto",
      "Trasferimento per più di un anno",
      "Presenza di reti familiari nel Paese di arrivo",
      "Motivi esclusivamente climatici"
    ],
    correct:0,
    explanation:"È la definizione presente nelle slide sulle tipologie di migranti."
  },

  /* =====================
     G3 — LE CITTÀ
     ===================== */
  {
    id:"G3_01",
    block:"G3",
    phenomenon:"Urbanesimo/urbanizzazione: spostamento e concentrazione della popolazione nelle città. Il tasso di urbanizzazione è la percentuale di popolazione urbana sul totale. Oggi oltre il 57% della popolazione mondiale vive in centri urbani.",
    media:{img:"assets/g3_tasso_urbanizzazione.png", cap:"Urbanesimo e tasso di urbanizzazione (slide del corso)."},
    chart:{"type": "pie", "title": "Urbanizzazione mondiale (circa)", "note": "Dalla slide: oltre il 57% della popolazione mondiale vive in città.", "slices": [{"label": "Urbana", "value": 57}, {"label": "Rurale", "value": 43}], "source": "Materiali del corso (Prof. Albiani) + ONU-Habitat"},
    question:"Che cos’è il tasso di urbanizzazione?",
    options:[
      "Percentuale di popolazione che vive in città sul totale",
      "Numero di città in un Paese",
      "Densità media mondiale",
      "Numero di abitanti per km²"
    ],
    correct:0,
    explanation:"Nelle slide è definito come rapporto/percentuale tra abitanti delle città e totale popolazione."
  },
  {
    id:"G3_02",
    block:"G3",
    phenomenon:"Una città è un insediamento umano stabile con alta densità e complessa organizzazione dello spazio. Svolge funzioni (residenziale, amministrativa, economica, culturale, turistica, trasporto) e ha un rango legato ai servizi offerti.",
    media:null,
    question:"Da cosa dipende principalmente il rango di una città?",
    options:[
      "Dalla tipologia e specializzazione dei servizi che offre",
      "Solo dal numero di abitanti",
      "Solo dall’età del centro storico",
      "Solo dalla vicinanza al mare"
    ],
    correct:0,
    explanation:"Le slide spiegano che il rango deriva dal ruolo nella gerarchia urbana determinato dai servizi."
  },
  {
    id:"G3_03",
    block:"G3",
    phenomenon:"Modello nordamericano: pianta a scacchiera, CBD centrale con grattacieli e funzioni direzionali; residenze in periferia; quartieri degradati spesso intorno al CBD.",
    media:{img:"assets/g3_citta_nordamericane.png", cap:"Caratteristiche delle città nordamericane (slide del corso)."},
    question:"Nel modello nordamericano, che cos’è il CBD?",
    options:[
      "Il centro direzionale/finanziario con uffici e grattacieli",
      "Il centro storico medievale",
      "La periferia residenziale di villette",
      "Una baraccopoli"
    ],
    correct:0,
    explanation:"Le slide definiscono il CBD come Central Business District, cuore economico-direzionale."
  },
  {
    id:"G3_04",
    block:"G3",
    phenomenon:"Modello europeo: città stratificata, centro storico spesso multifunzionale e densamente abitato; aree moderne in quartieri specifici; degrado più frequente in periferia.",
    media:{img:"assets/g3_citta_europee.png", cap:"Caratteristiche delle città europee (slide del corso)."},
    question:"Qual è una differenza tipica tra città europee e nordamericane?",
    options:[
      "In Europa il centro storico è spesso multifunzionale e abitato",
      "In Nord America il centro è quasi sempre medievale",
      "In Europa tutte le città sono a scacchiera",
      "In Nord America non esistono periferie"
    ],
    correct:0,
    explanation:"Le slide indicano che il centro europeo è spesso anche residenziale e stratificato storicamente."
  },
  {
    id:"G3_05",
    block:"G3",
    phenomenon:"Nei Paesi in via di sviluppo l’urbanizzazione può essere rapida e disordinata: forti contrasti sociali e crescita di baraccopoli (slum/favelas) per mancanza di pianificazione e servizi.",
    media:{img:"assets/g3_baraccopoli.png", cap:"Urbanizzazione disordinata e baraccopoli (slide del corso)."},
    question:"Perché crescono le baraccopoli con le città?",
    options:[
      "Urbanizzazione rapida senza pianificazione e servizi sufficienti",
      "Perché diminuisce la popolazione urbana",
      "Perché aumenta la qualità degli alloggi",
      "Perché il CBD scompare"
    ],
    correct:0,
    explanation:"Le slide elencano urbanizzazione rapida, disuguaglianze e mancanza di pianificazione urbana."
  }
];
