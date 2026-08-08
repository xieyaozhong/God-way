(()=>{
  const RUNTIME='GOD WAY PWA v5';
  const CHECK_INTERVAL=15*60*1000;
  const IDLE_RELOAD_MS=60*1000;
  let registration=null;
  let pendingReload=false;
  let lastInteraction=Date.now();
  let reloading=false;

  ['pointerdown','touchstart','keydown','input'].forEach(type=>{
    addEventListener(type,()=>{lastInteraction=Date.now()},{passive:true});
  });

  function statusChip(){
    let el=document.getElementById('gwPwaStatus');
    if(el)return el;
    el=document.createElement('button');
    el.id='gwPwaStatus';
    el.type='button';
    el.setAttribute('aria-label','PWA 更新狀態');
    Object.assign(el.style,{
      position:'fixed',right:'10px',top:'calc(10px + env(safe-area-inset-top))',zIndex:'9999',
      border:'1px solid rgba(118,227,189,.28)',borderRadius:'999px',padding:'7px 9px',
      background:'rgba(7,12,15,.88)',backdropFilter:'blur(16px)',color:'#9fb0aa',
      font:'10px -apple-system,BlinkMacSystemFont,"SF Pro Display","Noto Sans TC",sans-serif',
      boxShadow:'0 8px 25px rgba(0,0,0,.25)'
    });
    el.textContent='PWA · CHECK';
    el.onclick=()=>checkForUpdates(true);
    document.body.appendChild(el);
    return el;
  }

  function setStatus(text,accent=false){
    const el=statusChip();
    el.textContent=text;
    el.style.color=accent?'#dffdf3':'#9fb0aa';
    el.style.borderColor=accent?'rgba(118,227,189,.48)':'rgba(118,227,189,.28)';
  }

  async function fetchBuild(){
    try{
      const res=await fetch('./version.json?ts='+Date.now(),{cache:'no-store'});
      if(!res.ok)throw new Error('version');
      return await res.json();
    }catch(e){return null;}
  }

  function requestReload(reason){
    if(reloading)return;
    pendingReload=true;
    setStatus('新版已下載',true);
    const idle=Date.now()-lastInteraction>IDLE_RELOAD_MS;
    if(document.visibilityState==='hidden'||idle){
      reloading=true;
      sessionStorage.setItem('gw_last_reload_reason',reason||'update');
      location.reload();
    }
  }

  async function compareBuild(){
    const info=await fetchBuild();
    if(!info)return;
    const build=String(info.build||info.sha||info.version||'unknown');
    const seen=localStorage.getItem('gw_pwa_build');
    const short=(info.sha||build).slice(0,7);
    if(!seen){
      localStorage.setItem('gw_pwa_build',build);
      setStatus(`v5 · ${navigator.onLine?'ONLINE':'OFFLINE'} · ${short}`);
      return;
    }
    if(seen!==build){
      localStorage.setItem('gw_pwa_build',build);
      requestReload('deployment-build-changed');
    }else{
      setStatus(`v5 · ${navigator.onLine?'ONLINE':'OFFLINE'} · ${short}`);
    }
  }

  async function checkForUpdates(userInitiated=false){
    if(!navigator.onLine){setStatus('PWA · OFFLINE');return;}
    try{
      if(registration)await registration.update();
      await compareBuild();
      if(userInitiated&&!pendingReload)setStatus('已是最新版',true);
    }catch(e){
      setStatus('更新檢查失敗');
    }
  }

  async function boot(){
    statusChip();
    if(!('serviceWorker' in navigator)){
      setStatus('PWA · 不支援');
      return;
    }
    try{
      registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
      if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
      registration.addEventListener('updatefound',()=>{
        const worker=registration.installing;
        if(!worker)return;
        setStatus('PWA · 更新下載中',true);
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed'&&navigator.serviceWorker.controller){
            worker.postMessage({type:'SKIP_WAITING'});
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange',()=>requestReload('service-worker-controller-changed'));
      await compareBuild();
      await registration.update();
    }catch(e){setStatus('PWA · 註冊失敗');}
  }

  addEventListener('online',()=>{setStatus('PWA · ONLINE',true);checkForUpdates(false)});
  addEventListener('offline',()=>setStatus('PWA · OFFLINE'));
  addEventListener('focus',()=>checkForUpdates(false));
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'){
      if(pendingReload&&!reloading){reloading=true;location.reload();return;}
      checkForUpdates(false);
    }
  });
  setInterval(()=>checkForUpdates(false),CHECK_INTERVAL);
  setInterval(()=>{
    if(pendingReload&&!reloading&&Date.now()-lastInteraction>IDLE_RELOAD_MS){reloading=true;location.reload();}
  },5000);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
