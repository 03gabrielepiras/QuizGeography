const QUESTIONS = [
  /* =====================
     G1 — DEMOGRAFIA
     ===================== */
  {
    id:"G1_01",
    block:"G1",
    phenomenon:"La piramide d’età mostra la distribuzione della popolazione per età e sesso. Una base larga indica alta natalità e popolazione giovane; una base stretta indica bassa natalità e invecchiamento. Alcune piramidi ‘anomale’ possono dipendere dalle migrazioni (come nel caso del Qatar).",
    media:{img:"assets/g1_piramide_eta.png", cap:"Piramide d’età: esempi e costruzione (slide del corso)."},
    chart:{"type": "wb_pie_age", "title": "Qatar: struttura per età (%)", "note": "Quote 0–14 e 65+ (15–64 calcolata come resto) — anno più recente disponibile.", "ind_0014": "SP.POP.0014.TO.ZS", "ind_65up": "SP.POP.65UP.TO.ZS", "country": "QAT", "source": "World Bank (WDI) – popolazione per classi d’età (da ONU WPP)"},
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
    chart:{"type": "wb_multi_bar", "title": "Fecondità totale (figli per donna) — confronto", "note": "Italia, Giappone, Qatar e Niger (anno più recente disponibile).", "indicator": "SP.DYN.TFRT.IN", "countries": ["ITA", "JPN", "QAT", "NER"], "source": "World Bank (WDI) – SP.DYN.TFRT.IN"},
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
    chart:{"type": "wb_bar", "title": "Italia: natalità vs mortalità (per 1.000)", "note": "Confronto tra tasso di natalità e tasso di mortalità — valori più recenti disponibili.", "indicatorA": "SP.DYN.CBRT.IN", "indicatorB": "SP.DYN.CDRT.IN", "country": "ITA", "source": "World Bank (WDI) – SP.DYN.CBRT.IN e SP.DYN.CDRT.IN"},
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

,
  /* ===== G1 extra ===== */
  {
    id:"G1_05",
    block:"G1",
    phenomenon:"Indicatori e indici demografici servono a descrivere fenomeni in modo sintetico e confrontabile. Un indicatore può essere un dato singolo; un indice può combinare più indicatori (es. ISU).",
    media:null,
    question:"Qual è la differenza principale tra indicatore e indice (come spiegato dal prof)?",
    options:[
      "L’indice può combinare più indicatori in un unico valore",
      "L’indicatore combina più valori, l’indice è sempre un dato singolo",
      "Sono sinonimi e significano la stessa cosa",
      "L’indice misura solo la densità di popolazione"
    ],
    correct:0,
    explanation:"Nelle slide: indicatore = misura singola; indice (in senso specifico) può aggregare più indicatori (es. ISU)."
  },
  {
    id:"G1_06",
    block:"G1",
    phenomenon:"Il tasso di fecondità indica il numero medio di figli per donna. Valori sotto ~2,1 rendono difficile il ricambio generazionale senza immigrazione.",
    media:null,
    question:"Perché la soglia ~2,1 figli per donna è importante?",
    options:[
      "È circa la soglia di rimpiazzo generazionale (ricambio)",
      "Indica l’età media della popolazione",
      "Misura il numero di morti infantili",
      "Serve solo a calcolare la densità di popolazione"
    ],
    correct:0,
    explanation:"Sotto la soglia di rimpiazzo, in assenza di immigrazione la popolazione tende a diminuire nel lungo periodo."
  },

  /* ===== G2 extra ===== */
  {
    id:"G2_05",
    block:"G2",
    phenomenon:"Le migrazioni interne in Italia hanno seguito direttrici principali: campagne→città, Sud→Nord, montagne→pianure/coste.",
    media:null,
    question:"Quale tra queste è una tipica direttrice delle migrazioni interne in Italia (come nelle slide)?",
    options:[
      "Sud → Nord",
      "Europa → America",
      "Africa → Europa",
      "Asia → Oceania"
    ],
    correct:0,
    explanation:"Le slide ricordano le tre direttrici principali: campagne→città, Sud→Nord, montagne→pianure/coste."
  },
  {
    id:"G2_06",
    block:"G2",
    phenomenon:"Esistono migrazioni regolari (con autorizzazione) e irregolari (senza autorizzazione o oltre la scadenza).",
    media:null,
    question:"Esempio di migrazione regolare:",
    options:[
      "Persona con permesso di soggiorno valido",
      "Persona che entra senza autorizzazione",
      "Persona che resta dopo scadenza del permesso",
      "Persona che usa un trafficante per entrare"
    ],
    correct:0,
    explanation:"Regolare = con autorizzazione (permesso/green card)."
  },

  /* ===== G3 extra ===== */
  {
    id:"G3_06",
    block:"G3",
    phenomenon:"Le città si classificano per grandezza e complessità: città piccole/medie, metropoli (>1 milione), area metropolitana/agglomerazione, città globali.",
    media:null,
    question:"Che cos’è una metropoli secondo la classificazione nelle slide?",
    options:[
      "Una città con oltre un milione di abitanti",
      "Una città con meno di 10.000 abitanti",
      "Una città rurale con bassa densità",
      "Qualsiasi capitale politica"
    ],
    correct:0,
    explanation:"Nelle slide: metropoli = oltre un milione di abitanti."
  },
  {
    id:"G3_07",
    block:"G3",
    phenomenon:"Le megalopoli nascono quando grandi metropoli crescono e si fondono. Esempi: Bos-Wash (~50M) e Tokaido (~70M) nelle slide.",
    media:null,
    question:"Che cosa descrive meglio una megalopoli?",
    options:[
      "Un insieme continuo di aree metropolitane collegate e molto popolose",
      "Una singola città con centro storico medievale",
      "Un quartiere degradato intorno al CBD",
      "Un villaggio con funzioni agricole"
    ],
    correct:0,
    explanation:"Le slide: megalopoli = fusione/continuità di grandi aree urbane collegate, decine di milioni di abitanti."
  }


,
  /* =====================
     G1 PACK 1 — DEMOGRAFIA (approfondito)
     ===================== */
  {
    id:"G1_07",
    block:"G1",
    phenomenon:"La demografia studia quantitativamente la popolazione: struttura, evoluzione e caratteristiche. Per confrontare Paesi diversi si usano tassi (per 1000 abitanti) e indicatori come fecondità, speranza di vita e mortalità infantile.",
    media:null,
    question:"Perché in demografia si usano spesso tassi “per 1000 abitanti”?",
    options:[
      "Per confrontare territori con popolazioni molto diverse",
      "Perché i numeri assoluti non esistono",
      "Per misurare la superficie di uno Stato",
      "Per calcolare il numero di città"
    ],
    correct:0,
    explanation:"I tassi rendono confrontabili fenomeni tra Paesi con dimensioni diverse."
  },
  {
    id:"G1_08",
    block:"G1",
    phenomenon:"Il tasso di natalità indica i nati vivi in un anno ogni 1000 abitanti; il tasso di mortalità indica i morti in un anno ogni 1000 abitanti.",
    media:null,
    question:"Quale affermazione è corretta?",
    options:[
      "Natalità e mortalità sono tassi per 1000 abitanti in un anno",
      "Natalità e mortalità misurano la densità di popolazione",
      "La natalità misura i figli per donna",
      "La mortalità misura i morti sotto 1 anno"
    ],
    correct:0,
    explanation:"Nelle slide: natalità = nati vivi/1000; mortalità = morti/1000 (in un anno)."
  },
  {
    id:"G1_09",
    block:"G1",
    phenomenon:"La mortalità infantile misura i decessi sotto 1 anno (di solito per 1000 nati vivi). È un indicatore importante del livello sanitario e delle condizioni di vita.",
    media:null,
    chart:{
      "type":"wb_multi_bar",
      "title":"Mortalità infantile (per 1.000 nati vivi) — confronto",
      "note":"Italia, Giappone e Niger (anno più recente disponibile).",
      "indicator":"SP.DYN.IMRT.IN",
      "countries":["ITA","JPN","NER"],
      "source":"World Bank (WDI) – SP.DYN.IMRT.IN"
    },
    question:"In generale, un tasso di mortalità infantile alto indica spesso:",
    options:[
      "Condizioni sanitarie e di vita più difficili",
      "Un’elevata speranza di vita",
      "Una densità di popolazione bassa",
      "Un saldo migratorio positivo"
    ],
    correct:0,
    explanation:"La mortalità infantile è legata a sanità, nutrizione e condizioni di vita."
  },
  {
    id:"G1_10",
    block:"G1",
    phenomenon:"La speranza di vita alla nascita è la durata media della vita. È influenzata da progresso sanitario, alimentazione, condizioni di lavoro e stili di vita.",
    media:null,
    chart:{
      "type":"wb_multi_bar",
      "title":"Speranza di vita alla nascita (anni) — confronto",
      "note":"Italia, Giappone, Qatar e Niger (anno più recente disponibile).",
      "indicator":"SP.DYN.LE00.IN",
      "countries":["ITA","JPN","QAT","NER"],
      "source":"World Bank (WDI) – SP.DYN.LE00.IN"
    },
    question:"Quale indicatore descrive meglio “quanto a lungo vive in media una persona” in un Paese?",
    options:[
      "Speranza di vita alla nascita",
      "Densità di popolazione",
      "Saldo migratorio",
      "Tasso di urbanizzazione"
    ],
    correct:0,
    explanation:"La speranza di vita è la durata media della vita alla nascita."
  },
  {
    id:"G1_11",
    block:"G1",
    phenomenon:"Distribuzione della popolazione: non è omogenea. Zone anecumeniche (deserti, alte montagne, calotte polari) hanno densità bassissima; pianure fertili e coste densità alta.",
    media:{img:"assets/g1_densita_mondo.png", cap:"Distribuzione e densità della popolazione (slide del corso)."},
    question:"Quale fattore geografico favorisce più spesso un’alta densità di popolazione?",
    options:[
      "Acqua dolce e suoli fertili",
      "Calotte polari",
      "Deserti aridi",
      "Alte catene montuose"
    ],
    correct:0,
    explanation:"Le slide citano acqua dolce, suoli fertili, pianure e clima mite come fattori favorevoli."
  },
  {
    id:"G1_12",
    block:"G1",
    phenomenon:"Oltre ai fattori naturali, contano fattori umani: lavoro, infrastrutture, livello di sviluppo, politiche, cultura e storia. Questi fattori sono interconnessi.",
    media:null,
    question:"Quale è un esempio di fattore umano (socio-economico) che influenza la distribuzione della popolazione?",
    options:[
      "Opportunità di lavoro e servizi",
      "Tipo di vegetazione naturale",
      "Altitudine",
      "Clima polare"
    ],
    correct:0,
    explanation:"Nelle slide: lavoro, sviluppo e infrastrutture sono fattori umani che attraggono popolazione."
  },
  {
    id:"G1_13",
    block:"G1",
    phenomenon:"Una piramide d’età a base larga indica alta natalità e popolazione giovane; una base stretta indica bassa natalità e invecchiamento. La forma aiuta a prevedere bisogni futuri (scuole, lavoro, pensioni).",
    media:{img:"assets/g1_piramide_eta.png", cap:"Piramide d’età: esempi e costruzione (slide del corso)."},
    question:"Una piramide d’età a base molto larga indica soprattutto:",
    options:[
      "Alta natalità e popolazione giovane",
      "Bassa natalità e invecchiamento",
      "Assenza di migrazioni",
      "Mortalità infantile zero"
    ],
    correct:0,
    explanation:"Base larga = molti giovani → alta natalità."
  },
  {
    id:"G1_14",
    block:"G1",
    phenomenon:"Indice di dipendenza: mette in relazione popolazione in età lavorativa (15–64) con giovani (0–14) e anziani (65+). Se cresce la quota 65+, aumenta la pressione su sanità e pensioni.",
    media:null,
    question:"Se aumenta molto la quota di popolazione 65+, cosa tende ad aumentare?",
    options:[
      "La pressione su pensioni e sanità",
      "Il tasso di natalità",
      "La quota di 0–14",
      "La densità media mondiale"
    ],
    correct:0,
    explanation:"Più anziani → più bisogno di servizi sanitari e sostegno pensionistico."
  },
  {
    id:"G1_15",
    block:"G1",
    phenomenon:"Crescita della popolazione mondiale: è stata trainata dalla diminuzione della mortalità e dall’aumento della speranza di vita, più che dall’aumento della natalità.",
    media:{img:"assets/g1_crescita_mondiale.png", cap:"Andamento della popolazione mondiale nel tempo (slide del corso)."},
    question:"Secondo le slide, la crescita della popolazione mondiale dipende soprattutto da:",
    options:[
      "Diminuzione della mortalità e aumento della speranza di vita",
      "Aumento della natalità ovunque",
      "Diminuzione dei servizi sanitari",
      "Aumento della mortalità infantile"
    ],
    correct:0,
    explanation:"Le slide evidenziano mortalità in calo e vita media più lunga."
  },
  {
    id:"G1_16",
    block:"G1",
    phenomenon:"Saldo naturale = nati − morti. Se è negativo e non è compensato da saldo migratorio positivo, la popolazione tende a diminuire.",
    media:null,
    question:"Se in un Paese natalità < mortalità, cosa succede al saldo naturale?",
    options:[
      "È negativo",
      "È positivo",
      "È sempre zero",
      "Dipende solo dalla densità"
    ],
    correct:0,
    explanation:"Saldo naturale = nati − morti; se i morti superano i nati, è negativo."
  },
  {
    id:"G1_17",
    block:"G1",
    phenomenon:"Confrontare Paesi diversi aiuta a capire le transizioni demografiche: alcuni hanno fecondità molto alta (crescita rapida), altri molto bassa (invecchiamento).",
    media:null,
    chart:{
      "type":"wb_multi_bar",
      "title":"Fecondità totale (figli per donna) — confronto esteso",
      "note":"Italia, Giappone, Qatar, Niger e Bangladesh (anno più recente disponibile).",
      "indicator":"SP.DYN.TFRT.IN",
      "countries":["ITA","JPN","QAT","NER","BGD"],
      "source":"World Bank (WDI) – SP.DYN.TFRT.IN"
    },
    question:"Quale indicatore è più adatto per capire se una popolazione tende a crescere rapidamente “per nascite”?",
    options:[
      "Tasso di fecondità (figli per donna)",
      "Densità di popolazione",
      "Tasso di urbanizzazione",
      "Saldo migratorio"
    ],
    correct:0,
    explanation:"La fecondità misura in media quanti figli per donna: è centrale per la crescita naturale."
  }

];


/*
  v18.0 — Allenamento SEQUENZIALE (stile prof)
  - Step "lesson": spiegazione + grafico/slide
  - Step "question": domanda stile verifica (usa id di QUESTIONS)
*/
const TRAIN_G1 = [
  { type:"lesson", block:"G1", title:"Indicatori e indici demografici",
    text:"Un indicatore è una misura semplice (spesso un dato singolo) che descrive un aspetto della popolazione. Un indice può combinare più indicatori e riassumere una realtà complessa (es. ISU).",
    media:null, chart:null, source:"Slide Demografia — Prof. Albiani" },
  { type:"question", qid:"G1_05" },

  { type:"lesson", block:"G1", title:"Tassi per confrontare Paesi diversi",
    text:"Per confrontare territori con popolazioni diverse usiamo tassi (spesso per 1000 abitanti): trasformano un numero assoluto in una proporzione confrontabile.",
    media:null, chart:null, source:"Dispensa Dinamiche demografiche" },
  { type:"question", qid:"G1_07" },
  { type:"question", qid:"G1_08" },

  { type:"lesson", block:"G1", title:"Saldo demografico",
    text:"Il saldo demografico dice come cambia una popolazione: saldo naturale (nati−morti) + saldo migratorio (immigrati−emigrati). È fondamentale per capire crescita, calo o stasi.",
    media:null, chart:null, source:"Slide Demografia — Prof. Albiani" },
  { type:"question", qid:"G1_03" },
  { type:"question", qid:"G1_16" },

  { type:"lesson", block:"G1", title:"Distribuzione e densità della popolazione",
    text:"La popolazione non è distribuita in modo omogeneo. Clima mite, acqua dolce, suoli fertili e pianure favoriscono gli insediamenti; deserti, montagne e poli sono zone anecumeniche.",
    media:{img:"assets/g1_densita_mondo.png", cap:"Distribuzione e densità della popolazione (slide del corso)."},
    chart:null, source:"Slide Demografia — Prof. Albiani" },
  { type:"question", qid:"G1_02" },
  { type:"question", qid:"G1_11" },
  { type:"question", qid:"G1_12" },

  { type:"lesson", block:"G1", title:"Piramide d’età: cosa ci dice",
    text:"La piramide d’età mostra la struttura per età e sesso. Base larga → popolazione giovane e alta natalità; base stretta → invecchiamento. Forme ‘anomale’ possono indicare migrazioni.",
    media:{img:"assets/g1_piramide_eta.png", cap:"Piramide d’età: esempi e costruzione (slide del corso)."},
    chart:null, source:"Slide Demografia — Prof. Albiani" },
  { type:"question", qid:"G1_13" },
  { type:"question", qid:"G1_01" },
  { type:"question", qid:"G1_14" },

  { type:"lesson", block:"G1", title:"Transizione demografica: fecondità, mortalità infantile, speranza di vita",
    text:"Fecondità, mortalità infantile e speranza di vita aiutano a leggere il livello di sviluppo e le sfide future (scuola, lavoro, pensioni, sanità).",
    media:null, chart:null, source:"Slide + Dispensa" },
  { type:"question", qid:"G1_06" },
  { type:"question", qid:"G1_09" },
  { type:"question", qid:"G1_10" },
  { type:"question", qid:"G1_17" },

  { type:"lesson", block:"G1", title:"Crescita della popolazione mondiale",
    text:"La crescita mondiale è dipesa soprattutto dalla diminuzione della mortalità e dall’aumento della speranza di vita, più che dall’aumento della natalità. Dagli anni ’60 il tasso di incremento cala con natalità e fecondità in diminuzione.",
    media:{img:"assets/g1_crescita_mondiale.png", cap:"Andamento della popolazione mondiale nel tempo (slide del corso)."},
    chart:null, source:"Slide Demografia — Prof. Albiani" },
  { type:"question", qid:"G1_04" },
  { type:"question", qid:"G1_15" }
];
