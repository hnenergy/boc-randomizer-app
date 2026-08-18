const CACHE='spinorder-draft-v15';
const ASSETS=['./','./index.html','./setup-state.js','./favicon-state.js','./participant-state.js','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png','./assets/icons/football.svg','./assets/icons/baseball.svg','./assets/icons/golf.svg','./assets/icons/basketball.svg','./assets/icons/generic.svg','./assets/brand/spinorder-logo.svg','./assets/brand/lfn-legacy-apps-elephant.png','./assets/brand/lfn-legacy-apps-elephant-light-blue.png','./assets/brand/lfn-legacy-apps-elephant-light-gray.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(response=>response||caches.match('./index.html'))));
});
