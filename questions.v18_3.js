
/* =============================
   G1 DEMOGRAFIA – ALLENAMENTO COMPLETO
   ============================= */

const QUESTIONS = [
  {
    id:"G1_Q1",
    block:"G1",
    media:{img:"assets/g1/g1_indicatori_indici.png", cap:"Indicatore vs indice (sintesi)"},
    question:"Qual è la differenza principale tra indicatore e indice demografico?",
    options:[
      "L’indicatore è una misura semplice, l’indice combina più indicatori",
      "L’indicatore riguarda solo l’economia",
      "L’indice è sempre un dato naturale",
      "Non esiste differenza tra i due"
    ],
    correct:0,
    explanation:"Un indicatore misura un singolo fenomeno, un indice sintetizza più indicatori."
  },
  {
    id:"G1_Q2",
    block:"G1",
    media:{img:"assets/g1/g1_fecondita.png", cap:"Fecondità e ricambio generazionale"},
    question:"Quale indicatore è più adatto a valutare il ricambio generazionale?",
    options:["Mortalità","Natalità","Fecondità","Densità"],
    correct:2,
    explanation:"La fecondità misura il numero medio di figli per donna."
  },
  {
    id:"G1_Q3",
    block:"G1",
    media:{img:"assets/g1/g1_saldo.png", cap:"Saldo naturale e saldo migratorio"},
    question:"Un Paese ha più morti che nati ma la popolazione cresce. Perché?",
    options:[
      "Per aumento della densità",
      "Per saldo migratorio positivo",
      "Per alta fecondità",
      "Per diminuzione mortalità infantile"
    ],
    correct:1,
    explanation:"Il saldo migratorio positivo può compensare un saldo naturale negativo."
  },
  {
    id:"G1_Q4",
    block:"G1",
    media:{img:"assets/g1/g1_densita.png", cap:"Densità e distribuzione della popolazione"},
    question:"Quale fattore favorisce maggiormente un’elevata densità di popolazione?",
    options:["Clima mite e acqua","Calotte polari","Alte montagne","Deserti"],
    correct:0,
    explanation:"Le popolazioni si concentrano dove le condizioni ambientali e umane sono favorevoli."
  },
  {
    id:"G1_Q5",
    block:"G1",
    media:{img:"assets/g1/g1_piramide.png", cap:"Piramide delle età"},
    question:"Una piramide d’età a base stretta indica:",
    options:["Alta natalità","Forte immigrazione","Invecchiamento della popolazione","Aumento mortalità infantile"],
    correct:2,
    explanation:"Una base stretta indica bassa natalità e popolazione anziana."
  },
  {
    id:"G1_Q6",
    block:"G1",
    media:{img:"assets/g1/g1_crescita.png", cap:"Crescita della popolazione mondiale"},
    question:"La crescita della popolazione mondiale dal XIX secolo è dovuta soprattutto a:",
    options:["Aumento natalità","Diminuzione mortalità","Migrazioni","Urbanizzazione"],
    correct:1,
    explanation:"La diminuzione della mortalità ha permesso una crescita rapida."
  }
];

const TRAIN_G1 = [
  { type:"lesson", media:{img:"assets/g1/g1_indicatori_indici.png", cap:"Indicatore vs indice (sintesi)"}, title:"Indicatori e indici demografici", text:"La demografia studia la popolazione attraverso indicatori e indici che permettono confronti tra Paesi." },
  { type:"question", qid:"G1_Q1" },

  { type:"lesson", media:{img:"assets/g1/g1_fecondita.png", cap:"Fecondità e ricambio generazionale"}, title:"Natalità, mortalità e fecondità", text:"Natalità e mortalità sono tassi per 1000 abitanti, la fecondità misura i figli per donna." },
  { type:"question", qid:"G1_Q2" },

  { type:"lesson", media:{img:"assets/g1/g1_saldo.png", cap:"Saldo naturale e saldo migratorio"}, title:"Saldo naturale e saldo demografico", text:"Il saldo naturale è nati-morti, il saldo demografico include le migrazioni." },
  { type:"question", qid:"G1_Q3" },

  { type:"lesson", media:{img:"assets/g1/g1_densita.png", cap:"Densità e distribuzione della popolazione"}, title:"Distribuzione e densità della popolazione", text:"La popolazione non è distribuita in modo uniforme sulla Terra." },
  { type:"question", qid:"G1_Q4" },

  { type:"lesson", media:{img:"assets/g1/g1_piramide.png", cap:"Piramide delle età"}, title:"Piramide d’età", text:"La piramide d’età mostra la struttura della popolazione per età e sesso." },
  { type:"question", qid:"G1_Q5" },

  { type:"lesson", media:{img:"assets/g1/g1_crescita.png", cap:"Crescita della popolazione mondiale"}, title:"Crescita della popolazione mondiale", text:"La crescita mondiale accelera dal XIX secolo per la diminuzione della mortalità." },
  { type:"question", qid:"G1_Q6" }
];
