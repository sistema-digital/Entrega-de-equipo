const CACHE_NAME="entrega-equipo-pwa-v26";
const APP_SHELL=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
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
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",(event)=>{
  const request=event.request;
  if(request.method!=="GET") return;

  const url=new URL(request.url);

  // Supabase data and Storage always come from the network.
  if(url.hostname.endsWith(".supabase.co")){
    return;
  }

  // Navigation: network first, cached app shell as offline fallback.
  if(request.mode==="navigate"){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put("./index.html",copy));
          return response;
        })
        .catch(()=>caches.match("./index.html"))
    );
    return;
  }

  // Same-origin static assets: cache first.
  if(url.origin===self.location.origin){
    event.respondWith(
      caches.match(request).then(cached=>{
        if(cached) return cached;
        return fetch(request).then(response=>{
          if(response && response.ok){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // CDN resources: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then(cached=>{
      const network=fetch(request).then(response=>{
        if(response && (response.ok || response.type==="opaque")){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
        }
        return response;
      }).catch(()=>cached);
      return cached || network;
    })
  );
});
