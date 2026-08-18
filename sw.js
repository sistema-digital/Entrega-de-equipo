const CACHE_NAME="entrega-equipo-v27";
const APP_SHELL=[
  "./index.html",
  "./manifest.json",
  "./favicon.ico",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install",(event)=>{
 event.waitUntil(
  caches.open(CACHE_NAME)
   .then(cache=>cache.addAll(APP_SHELL))
   .then(()=>self.skipWaiting())
 );
});

self.addEventListener("activate",(event)=>{
 event.waitUntil(
  caches.keys()
   .then(keys=>Promise.all(
    keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))
   ))
   .then(()=>self.clients.claim())
 );
});

self.addEventListener("fetch",(event)=>{
 const req=event.request;
 if(req.method!=="GET")return;

 const url=new URL(req.url);

 // Never cache Supabase API or Storage responses.
 if(url.hostname.endsWith(".supabase.co")) return;

 if(req.mode==="navigate"){
  event.respondWith(
   fetch(req)
    .then(response=>{
     const copy=response.clone();
     caches.open(CACHE_NAME).then(cache=>cache.put("./index.html",copy));
     return response;
    })
    .catch(()=>caches.match("./index.html"))
  );
  return;
 }

 if(url.origin===self.location.origin){
  event.respondWith(
   caches.match(req).then(cached=>{
    if(cached)return cached;
    return fetch(req).then(response=>{
     if(response && response.ok){
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
     }
     return response;
    });
   })
  );
  return;
 }

 // Cache CDN files once loaded.
 event.respondWith(
  caches.match(req).then(cached=>{
   const network=fetch(req).then(response=>{
    if(response && (response.ok || response.type==="opaque")){
     const copy=response.clone();
     caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
    }
    return response;
   }).catch(()=>cached);
   return cached || network;
  })
 );
});
