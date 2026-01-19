# Template standard JSON (quiz-content-pack)

Questa PWA supporta un formato **stabile** per importare nuovi capitoli, domande, collegamenti alle slide e curiosità/confronti reali.

## Come usarlo
1) Apri: **Impostazioni → Nuovi capitoli (prof)**
2) Premi **Scarica template JSON** (file) oppure **Copia template JSON** (negli appunti)
3) Incolla il template in un'AI e chiedi di compilarlo con i nuovi argomenti del prof
4) Re-incolla (o importa) il JSON nell'app e premi **Adatta e aggiorna**

## Formato (riassunto)
```json
{
  "schema": "quiz-content-pack",
  "schemaVersion": 1,
  "meta": {...},
  "sources": [...],
  "units": [...],
  "curiosities": [...]
}
```

### sources (fonti)
- Inserisci qui **documenti del prof** (type: "slides" o "notes") e fonti autorevoli (ONU/UNHCR/World Bank...).
- Le curiosità/confronti possono citare una fonte con `source.ref` (id presente in sources).

### units (capitoli)
Ogni unità è un capitolo/blocco (es. `G4`) con:
- `skills`: competenze (id + name) + opzionali `keywords`, `slideRef`...
- `slideLinks`: elenco di ancore alle slide (id, sourceId, title, keywords)
- `questions`: domande (mcq/open/guided) con campi opzionali per spiegazioni e slide link

### curiosities
Ogni curiosità può essere:
- `kind: "curiosity"` (lo sapevi che...)
- `kind: "compare"` (confronto reale)

Campi tipici:
- `blocks`: su quali capitoli mostrarla
- `keywords`: per aggancio automatico
- `source`: `{ "ref": "SRC_UNHCR", "url": "..." }`

## Aggancio automatico alle slide
Se una domanda non ha `slideRef`, l'importer prova a inserirlo usando:
1) `skill.slideRef` (se presente)
2) keyword matching tra testo della domanda e `slideLinks.keywords`

4) Incolla il JSON compilato nella textarea e premi **Adatta e aggiorna**.

## Struttura del pacchetto
Top-level:
- `schema`: deve essere "quiz-content-pack"
- `schemaVersion`: 1
- `sources`: elenco delle fonti (slide del prof + fonti ONU/UNHCR/World Bank ecc.)
- `units`: capitoli/blocchi (es. G4) con `skills`, `slideLinks` e `questions`
- `curiosities` (opzionale): curiosità e confronti reali mostrati in Allenamento

### sources[]
Esempio:
- `id`: "SRC_PROF_DEMOGRAFIA"
- `title`: "Demografia (slide)"
- `type`: "slides" | "web" | "report" | ...
- `author`, `year`, `url` (opzionali)

### units[]
Ogni unità è un capitolo/blocco.
Campi principali:
- `id`: es. "G4"
- `title`: titolo capitolo
- `prereq`: array di id blocchi prerequisiti (opzionale)
- `skills`: competenze (id + name + keywords)
- `slideLinks`: collegamenti alle slide (id + sourceId + title + keywords)
- `questions`: domande (mcq/open/guided). Puoi aggiungere:
  - `rule`, `example`, `explainOk`, `explainNo`
  - `slideRef` (id di uno slideLink)
  - `skill` (id skill)

### curiosities[] (opzionale)
Ogni elemento:
- `kind`: "curiosity" o "compare"
- `blocks`: ["G2"] ecc.
- `keywords`: parole chiave
- `text`: testo "Lo sapevi che..."
- `source`: { `ref`: "SRC_UNHCR", `url`: "..." }

## Nota sui collegamenti alle slide
Se una domanda non ha `slideRef`, l'app prova ad assegnarlo usando:
1) la `slideRef` della skill
2) keyword matching su `prompt`/`rule`/`explain...`.

