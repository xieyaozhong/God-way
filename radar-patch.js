(()=>{
  const VERSION='5.3.0';
  const q=s=>document.querySelector(s);
  const qa=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function addStyles(){
    if(q('#gwRadarV53Styles'))return;
    const style=document.createElement('style');
    style.id='gwRadarV53Styles';
    style.textContent=`
      .radar>.blip{display:none!important}
      .scope-badge{position:absolute;left:50%;top:9px;transform:translateX(-50%);z-index:8;font:700 8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#82958f;background:rgba(3,8,10,.72);border:1px solid rgba(118,227,189,.16);border-radius:999px;padding:5px 7px;white-space:nowrap}
      .scope-heading-line{position:absolute;left:50%;top:50%;width:1px;height:31%;z-index:5;transform-origin:50% 0%;background:linear-gradient(to bottom,rgba(103,203,226,.92),rgba(103,203,226,.06));box-shadow:0 0 8px rgba(103,203,226,.25);pointer-events:none}
      .scope-heading-line:after{content:"PHONE";position:absolute;left:50%;bottom:-16px;transform:translateX(-50%);font:700 7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:#67cbe2;background:rgba(4,7,10,.8);padding:2px 4px;border-radius:4px}
      .scope-pulse{position:absolute;left:50%;top:50%;z-index:7;width:12px;height:12px;border:1px solid rgba(118,227,189,.9);border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 18px rgba(118,227,189,.35);pointer-events:none;animation:scopePulse 2.4s ease-out forwards}
      .scope-pulse.hot{border-color:rgba(224,189,112,.96);box-shadow:0 0 22px rgba(224,189,112,.42)}
      @keyframes scopePulse{0%{width:10px;height:10px;opacity:1}70%{opacity:.48}100%{width:78%;height:78%;opacity:0}}
      .radar-readouts{width:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}
      .radar-readout{border:1px solid var(--line);background:rgba(255,255,255,.022);border-radius:12px;padding:9px;text-align:center;min-width:0}
      .radar-readout b{display:block;font:700 14px ui-monospace,SFMono-Regular,Menlo,monospace;color:#dcebe6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .radar-readout span{display:block;margin-top:3px;font-size:7px;letter-spacing:.08em;color:var(--muted)}
      .radar-readout.na b{color:#8a9994}
      .radar-capability{width:100%;margin-top:7px;padding:8px 10px;border-left:2px solid rgba(103,203,226,.42);border-radius:0 10px 10px 0;background:rgba(103,203,226,.045);font-size:9px;line-height:1.55;color:#84958f}
      .radar-capability strong{color:#b9ccc6}
      @media(max-width:430px){.radar-readout{padding:8px 5px}.radar-readout b{font-size:12px}.radar-readout span{font-size:6.5px}}
    `;
    document.head.appendChild(style);
  }

  function buildReadouts(){
    const radar=q('#radar');
    const wrap=radar?.parentElement;
    if(!radar||!wrap)return false;
    if(!q('#scopeBadge')){
      const badge=document.createElement('div');
      badge.id='scopeBadge';
      badge.className='scope-badge';
      badge.textContent='ANOMALY SCOPE · NO RANGE SCALE';
      radar.appendChild(badge);
    }
    if(!q('#scopeHeadingLine')){
      const line=document.createElement('i');
      line.id='scopeHeadingLine';
      line.className='scope-heading-line';
      line.style.display='none';
      radar.appendChild(line);
    }
    if(!q('#radarReadouts')){
      const box=document.createElement('div');
      box.id='radarReadouts';
      box.className='radar-readouts';
      box.innerHTML=`
        <div class="radar-readout"><b id="scopeDeviceHeading">N/A</b><span>DEVICE HEADING</span></div>
        <div class="radar-readout na"><b id="scopeBearing">N/A</b><span>SOURCE BEARING</span></div>
        <div class="radar-readout na"><b id="scopeDistance">N/A</b><span>DISTANCE</span></div>`;
      wrap.appendChild(box);
      const note=document.createElement('div');
      note.className='radar-capability';
      note.innerHTML='<strong>定位能力：</strong>目前單手機只記錄裝置朝向。雷達圓環不是公尺刻度；沒有聲源定位／測距硬體時，來源方位與距離固定顯示 N/A。';
      wrap.appendChild(note);
    }
    return true;
  }

  function headingText(){
    try{return Number.isFinite(state.heading)?`${Math.round(state.heading)}°`:'N/A'}catch(e){return 'N/A'}
  }

  function updateHeadingUI(){
    const h=q('#scopeDeviceHeading'),line=q('#scopeHeadingLine');
    if(!h||!line)return;
    let heading=null;
    try{heading=Number.isFinite(state.heading)?state.heading:null}catch(e){}
    if(heading==null){
      h.textContent='N/A';
      line.style.display='none';
    }else{
      h.textContent=`${Math.round(heading)}°`;
      line.style.display='block';
      line.style.transform=`rotate(${heading+180}deg)`;
    }
  }

  function pulse(hot=false){
    const radar=q('#radar');
    if(!radar)return;
    const p=document.createElement('i');
    p.className='scope-pulse'+(hot?' hot':'');
    radar.appendChild(p);
    setTimeout(()=>p.remove(),2500);
  }

  function patchGlobals(){
    try{
      addBlip=function(hot=false){pulse(hot)};
    }catch(e){}

    try{
      const originalAddEvent=addEvent;
      addEvent=function(type,note,auto=false){
        const e=originalAddEvent(type,note,auto);
        e.deviceHeading=Number.isFinite(e.heading)?e.heading:null;
        e.sourceBearing=null;
        e.distanceMeters=null;
        e.localization='unresolved';
        try{save()}catch(err){}
        const groups=(e.groups||[]).join(' + ')||type;
        const label=q('#radarLabel');
        if(label)label.textContent=`${e.grade}級事件 · ${groups} · DEVICE ${e.deviceHeading==null?'N/A':e.deviceHeading+'°'} · BEARING N/A · DISTANCE N/A`;
        return e;
      };
    }catch(e){}

    try{
      const originalRenderEvents=renderEvents;
      renderEvents=function(){
        originalRenderEvents();
        let recent=[];
        try{recent=state.events.slice(-12).reverse()}catch(e){}
        qa('#eventList .event').forEach((card,i)=>{
          const ev=recent[i];
          if(!ev)return;
          const p=card.querySelector('p');
          if(!p)return;
          const device=Number.isFinite(ev.deviceHeading)?ev.deviceHeading:(Number.isFinite(ev.heading)?ev.heading:null);
          p.innerHTML=`${esc(ev.note)}<br>${ev.peakHz||0} Hz · ${ev.db??'N/A'} dBFS · MAG ${ev.mag??'N/A'} µT · motion ${ev.motion??'N/A'}<br>DEVICE ${device==null?'N/A':device+'°'} · SOURCE BEARING N/A · DISTANCE N/A`;
        });
      };
      renderEvents();
    }catch(e){}
  }

  function patchClearButton(){
    const btn=q('#clearBlips');
    if(!btn)return;
    btn.onclick=()=>{
      qa('#radar .blip,#radar .scope-pulse').forEach(x=>x.remove());
      const label=q('#radarLabel');
      if(label)label.textContent='事件視覺脈衝已清除 · SOURCE BEARING N/A · DISTANCE N/A';
    };
  }

  function migrateEvents(){
    try{
      state.events.forEach(e=>{
        if(!('deviceHeading' in e))e.deviceHeading=Number.isFinite(e.heading)?e.heading:null;
        e.sourceBearing=null;
        e.distanceMeters=null;
        e.localization='unresolved';
      });
      save();
    }catch(e){}
  }

  function boot(){
    addStyles();
    if(!buildReadouts())return;
    migrateEvents();
    patchGlobals();
    patchClearButton();
    updateHeadingUI();
    setInterval(updateHeadingUI,180);
    const label=q('#radarLabel');
    if(label&&!/事件/.test(label.textContent))label.textContent='ANOMALY SCOPE · DEVICE HEADING 可量測 · SOURCE BEARING / DISTANCE N/A';
    try{window.GOD_WAY_RADAR_VERSION=VERSION}catch(e){}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
