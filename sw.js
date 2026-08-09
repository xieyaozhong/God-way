const VERSION='5.7.0';
const CACHE=`god-way-v5-${VERSION}`;
const PRECACHE=['./','./index.html','./tarot.html','./qimen.html','./manifest.webmanifest','./icon.svg','./radar-patch.js','./ritual.js','./motion-patch.js','./tarot-art-local.js','./pwa-runtime.js','./version.json'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async url=>{try{const res=await fetch(new Request(url,{cache:'reload'}));if(res.ok)await cache.put(url,res.clone())}catch(e){}}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));if(self.registration.navigationPreload){try{await self.registration.navigationPreload.enable()}catch(e){}}await self.clients.claim();const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});clients.forEach(client=>client.postMessage({type:'PWA_ACTIVATED',version:VERSION}))})());
});
async function networkFirst(request,fallback='./index.html'){const cache=await caches.open(CACHE);try{const res=await fetch(request,{cache:'no-store'});if(res&&res.ok)await cache.put(request,res.clone());return res}catch(e){return(await cache.match(request))||(fallback?await cache.match(fallback):undefined)||Response.error()}}
async function staleWhileRevalidate(request){const cache=await caches.open(CACHE);const cached=await cache.match(request);const fresh=fetch(request).then(res=>{if(res&&(res.ok||res.type==='opaque'))cache.put(request,res.clone());return res}).catch(()=>null);return cached||(await fresh)||Response.error()}
async function externalCache(request){const cache=await caches.open(CACHE);const cached=await cache.match(request);if(cached)return cached;try{const res=await fetch(request);if(res&&(res.ok||res.type==='opaque'))await cache.put(request,res.clone());return res}catch(e){return Response.error()}}
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);
  const tarotCommons=(url.hostname==='commons.wikimedia.org'||url.hostname==='en.wikipedia.org'||url.hostname==='upload.wikimedia.org')&&(url.pathname.includes('RWS_Tarot_')||url.pathname.includes('/Special:Redirect/file/'));
  const lunarLib=(url.hostname==='cdnjs.cloudflare.com'||url.hostname==='cdn.jsdelivr.net')&&url.pathname.includes('lunar-javascript');
  if(tarotCommons||lunarLib){event.respondWith(externalCache(req));return}
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{try{const preload=await event.preloadResponse;if(preload){const cache=await caches.open(CACHE);cache.put(req,preload.clone());return preload}}catch(e){}const p=url.pathname;const fallback=p.endsWith('/tarot.html')?'./tarot.html':p.endsWith('/qimen.html')?'./qimen.html':'./index.html';return networkFirst(req,fallback)})());return;
  }
  if(/(?:index\.html|tarot\.html|qimen\.html|manifest\.webmanifest|radar-patch\.js|ritual\.js|motion-patch\.js|tarot-art-local\.js|pwa-runtime\.js|version\.json|sw\.js)$/.test(url.pathname)){event.respondWith(networkFirst(req,null));return}
  event.respondWith(staleWhileRevalidate(req));
});
self.addEventListener('message',event=>{const data=event.data||{};if(data.type==='SKIP_WAITING')self.skipWaiting();if(data.type==='GET_VERSION'&&event.source)event.source.postMessage({type:'PWA_VERSION',version:VERSION,cache:CACHE})});
