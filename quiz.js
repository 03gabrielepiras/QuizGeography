/* ======================================
   QUIZ GEOGRAPHY – CORE ENGINE (FIXED)
   ====================================== */

const BASE_PATH = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "") + "/";
const DATA_PATH = BASE_PATH + "data/";

const state = {
  userName: null,
  boot: true,
  data: {}
};

/* ================= INIT ================= */

window.addEventListener("load", () => {
  console.log("🚀 App caricata");
  restoreUser();
  bindNameForm();
  enableMainActions();
});

/* ================= USER ================= */

function restoreUser() {
  const saved = localStorage.getItem("quiz_user_name");
  if (saved) {
    state.userName = saved;
    state.boot = false;
    const boot = document.getElementById("boot-section");
    if (boot) boot.style.display = "none";
    console.log("👤 Utente:", saved);
  }
}

function bindNameForm() {
  const input = document.getElementById("user-name");
  const btn = document.getElementById("save-name");

  if (!input || !btn) return;

  btn.onclick = () => {
    const name = input.value.trim();
    if (!name) {
      alert("Inserisci il tuo nome");
      return;
    }
    localStorage.setItem("quiz_user_name", name);
    state.userName = name;
    state.boot = false;
    const boot = document.getElementById("boot-section");
    if (boot) boot.style.display = "none";
    enableMainActions();
    console.log("✅ Nome salvato:", name);
  };
}

/* =========== BOTTONI (FIX CHIAVE) =========== */

function enableMainActions() {
  const actions = {
    train: startTraining,
    verify: startVerify,
    repeat: repeatExercises,
    progress: showProgress,
    settings: openSettings
  };

  Object.entries(actions).forEach(([key, fn]) => {
    const btn = document.querySelector(`[data-action="${key}"]`);
    if (btn) btn.onclick = fn;
  });

  console.log("🔓 Bottoni attivi");
}

/* ================= DATA ================= */

async function loadBlock(block) {
  if (state.data[block]) return state.data[block];

  const url = `${DATA_PATH}${block}.json`;
  console.log("📥 Carico", url);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    alert("Errore caricamento " + block + " (HTTP " + res.status + ")");
    throw new Error(String(res.status));
  }

  const json = await res.json();
  state.data[block] = json;
  return json;
}

/* ================= AZIONI ================= */

async function startTraining() {
  if (state.boot) {
    alert("Inserisci prima il nome");
    return;
  }
  await loadBlock("G1");
  alert("Allenamento avviato (G1)");
}

async function startVerify() {
  if (state.boot) {
    alert("Inserisci prima il nome");
    return;
  }
  await loadBlock("G1");
  alert("Verifica avviata (G1)");
}

function repeatExercises() {
  if (state.boot) {
    alert("Inserisci prima il nome");
    return;
  }
  alert("Ripeti esercitazioni");
}

function showProgress() {
  if (state.boot) {
    alert("Inserisci prima il nome");
    return;
  }
  alert("Progressi");
}

function openSettings() {
  alert("Impostazioni");
}
