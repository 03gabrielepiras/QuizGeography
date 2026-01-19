const CACHE = "geo-quiz-v17_4";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./questions.js",
  "./analysisEngine.js",
  "./charts.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./assets/g1_piramide_eta.png",
  "./assets/g1_densita_mondo.png",
  "./assets/g1_crescita_mondiale.png",
  "./assets/g2_push_pull.png",
  "./assets/g2_flussi_2000_2019.png",
  "./assets/g3_tasso_urbanizzazione.png",
  "./assets/g3_citta_nordamericane.png",
  "./assets/g3_citta_europee.png",
  "./assets/g3_baraccopoli.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Cache-first for same-origin assets
  if(url.origin === self.location.origin){
    e.respondWith(
      caches.match(e.request).then(resp => resp || fetch(e.request).then(net => {
        const copy = net.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return net;
      }))
    );
    return;
  }

  // Runtime cache for World Bank API (so charts work offline after first load)
  if(url.hostname === "api.worldbank.org"){
    e.respondWith(
      fetch(e.request).then(net => {
        const copy = net.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return net;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
});
