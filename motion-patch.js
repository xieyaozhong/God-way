(()=>{
  const VERSION='5.6.0';
  const MAX_POINTS=150;
  let mounted=false;
  let motionAttached=false;
  let orientationAttached=false;
  const samples=[];
  const latest={ax:null,ay:null,az:null,alpha:null,beta:null,gamma:null,heading:null,accMag:0,rotMag:0,source:'—'};

  const q=s=>document.querySelector(s);
  const fmt=(v,d=2)=>Number.isFinite(v)?Number(v).toFixed(d):'—';

  function addStyles(){
    if(q('#gwMotionProStyles'))return;
    const s=document.createElement('style');
    s.id='gwMotionProStyles';
    s.textContent=`
      .gw-motion-pro{margin-top:8px;border:1px solid rgba(118,227,189,.20);border-radius:14px;padding:12px;background:linear-gradient(180deg,rgba(118,227,189,.035),rgba(255,255,255,.018))}
      .gw-motion-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}.gw-motion-head b{font-size:11px}.gw-motion-state{font-size:8px;border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:5px 7px;color:#81938e}.gw-motion-state.live{color:#b8f7df;border-color:rgba(118,227,189,.35);background:rgba(118,227,189,.06)}.gw-motion-state.warn{color:#ffdba4;border-color:rgba(242,182,95,.32);background:rgba(242,182,95,.05)}
      .gw-motion-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.gw-axis{border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:8px;background:rgba(255,255,255,.02)}.gw-axis span{display:block;font-size:7px;color:#73857f;letter-spacing:.06em}.gw-axis b{display:block;margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;color:#dffdf3}.gw-axis small{font-size:7px;color:#6f817b}
      .gw-motion-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:7px}.gw-motion-summary>div{border:1px solid rgba(255,255,255,.06);border-radius:9px;padding:7px}.gw-motion-summary span{display:block;font-size:7px;color:#74857f}.gw-motion-summary b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#e9f5f1}
      .gw-motion-wave{height:92px;margin-top:9px;border:1px solid rgba(118,227,189,.13);border-radius:11px;overflow:hidden;background:#04090c}.gw-motion-wave canvas{display:block;width:100%;height:100%}.gw-motion-legend{display:flex;gap:9px;flex-wrap:wrap;margin-top:6px;font-size:7px;color:#70827c}.gw-dot{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:3px;vertical-align:middle}.gw-dot.x{background:#76e3bd}.gw-dot.y{background:#67cbe2}.gw-dot.z{background:#e0bd70}.gw-dot.m{background:#e57c86}
      .gw-motion-actions{display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center;margin-top:9px}.gw-motion-actions button{border-radius:10px;padding:9px 10px;border:1px solid rgba(118,227,189,.23);background:rgba(118,227,189,.08);color:#cffff0;font-size:9px;font-weight:650}.gw-motion-note{font-size:8px;color:#74857f;line-height:1.55}.gw-motion-level{font-size:8px;margin-top:7px;color:#8fa19b}.gw-motion-level strong{color:#e0bd70}
      @media(max-width:480px){.gw-axis b{font-size:14px}.gw-motion-grid{gap:5px}.gw-motion-summary{grid-template-columns:1fr 1fr 1fr}}
    `;
    document.head.appendChild(s);
  }

  function buildPanel(){
    if(q('#gwMotionPro'))return q('#gwMotionPro');
    const motionValue=q('#motionVal');
    if(!motionValue)return null;
    const oldCard=motionValue.closest('.sensor-card');
    if(!oldCard)return null;
    const box=document.createElement('div');
    box.id='gwMotionPro';
    box.className='gw-motion-pro';
    box.innerHTML=`
      <div class="gw-motion-head"><b>MOTION 6-AXIS · 即時六軸</b><span id="gwMotionState" class="gw-motion-state">WAITING</span></div>
      <div class="gw-motion-grid">
        <div class="gw-axis"><span>ACC X</span><b id="gwAx">—</b><small>m/s²</small></div>
        <div class="gw-axis"><span>ACC Y</span><b id="gwAy">—</b><small>m/s²</small></div>
        <div class="gw-axis"><span>ACC Z</span><b id="gwAz">—</b><small>m/s²</small></div>
        <div class="gw-axis"><span>ROT α</span><b id="gwRa">—</b><small>°/s</small></div>
        <div class="gw-axis"><span>ROT β</span><b id="gwRb">—</b><small>°/s</small></div>
        <div class="gw-axis"><span>ROT γ</span><b id="gwRg">—</b><small>°/s</small></div>
      </div>
      <div class="gw-motion-summary">
        <div><span>ACC MAG</span><b id="gwAccMag">—</b></div>
        <div><span>ROT MAG</span><b id="gwRotMag">—</b></div>
        <div><span>HEADING</span><b id="gwHeading">—°</b></div>
      </div>
      <div class="gw-motion-wave"><canvas id="gwMotionCanvas"></canvas></div>
      <div class="gw-motion-legend"><span><i class="gw-dot x"></i>X</span><span><i class="gw-dot y"></i>Y</span><span><i class="gw-dot z"></i>Z</span><span><i class="gw-dot m"></i>合成強度</span></div>
      <div id="gwMotionLevel" class="gw-motion-level">等待 Motion 資料</div>
      <div class="gw-motion-actions"><button id="gwMotionPermission" type="button">啟用／重新要求 Motion 權限</button><div class="gw-motion-note">iPhone 必須由按鈕點擊觸發權限；若已授權，移動手機後數值會立即更新。</div></div>
    `;
    oldCard.insertAdjacentElement('afterend',box);
    return box;
  }

  function setState(text,type=''){
    const el=q('#gwMotionState');
    if(!el)return;
    el.textContent=text;
    el.className='gw-motion-state'+(type?' '+type:'');
  }

  function classify(v){
    if(v<0.08)return ['STATIC','裝置幾乎靜止'];
    if(v<0.6)return ['LOW','輕微移動'];
    if(v<2.5)return ['MOVING','明顯移動'];
    return ['HIGH','高幅度移動'];
  }

  function updateUI(){
    const map=[['#gwAx',latest.ax],['#gwAy',latest.ay],['#gwAz',latest.az],['#gwRa',latest.alpha],['#gwRb',latest.beta],['#gwRg',latest.gamma]];
    map.forEach(([id,v])=>{const el=q(id);if(el)el.textContent=fmt(v,2)});
    if(q('#gwAccMag'))q('#gwAccMag').textContent=fmt(latest.accMag,2);
    if(q('#gwRotMag'))q('#gwRotMag').textContent=fmt(latest.rotMag,1);
    if(q('#gwHeading'))q('#gwHeading').textContent=Number.isFinite(latest.heading)?`${latest.heading.toFixed(0)}°`:'N/A';
    const [level,label]=classify(latest.accMag);
    const lev=q('#gwMotionLevel');
    if(lev)lev.innerHTML=`來源：${latest.source} · 狀態 <strong>${level}</strong> · ${label}`;
  }

  function onMotion(e){
    const raw=e.acceleration;
    const fallback=e.accelerationIncludingGravity;
    const a=(raw&&(Number.isFinite(raw.x)||Number.isFinite(raw.y)||Number.isFinite(raw.z)))?raw:fallback||{};
    latest.source=raw?'ACCELERATION':'ACC + GRAVITY';
    latest.ax=Number.isFinite(a.x)?a.x:null;
    latest.ay=Number.isFinite(a.y)?a.y:null;
    latest.az=Number.isFinite(a.z)?a.z:null;
    const r=e.rotationRate||{};
    latest.alpha=Number.isFinite(r.alpha)?r.alpha:null;
    latest.beta=Number.isFinite(r.beta)?r.beta:null;
    latest.gamma=Number.isFinite(r.gamma)?r.gamma:null;
    latest.accMag=Math.sqrt((latest.ax||0)**2+(latest.ay||0)**2+(latest.az||0)**2);
    latest.rotMag=Math.sqrt((latest.alpha||0)**2+(latest.beta||0)**2+(latest.gamma||0)**2);
    samples.push({x:latest.ax||0,y:latest.ay||0,z:latest.az||0,m:latest.accMag});
    if(samples.length>MAX_POINTS)samples.splice(0,samples.length-MAX_POINTS);
    setState('LIVE','live');
    updateUI();
  }

  function onOrientation(e){
    const h=typeof e.webkitCompassHeading==='number'?e.webkitCompassHeading:(typeof e.alpha==='number'?(360-e.alpha)%360:null);
    if(Number.isFinite(h))latest.heading=h;
    updateUI();
  }

  function attach(){
    if(!motionAttached&&typeof DeviceMotionEvent!=='undefined'){
      addEventListener('devicemotion',onMotion,{passive:true});motionAttached=true;
    }
    if(!orientationAttached&&typeof DeviceOrientationEvent!=='undefined'){
      addEventListener('deviceorientation',onOrientation,{passive:true});orientationAttached=true;
    }
  }

  async function requestPermission(){
    if(typeof DeviceMotionEvent==='undefined'){
      setState('UNSUPPORTED','warn');return;
    }
    const btn=q('#gwMotionPermission');
    if(btn)btn.textContent='要求權限中…';
    try{
      let m='granted',o='granted';
      if(typeof DeviceMotionEvent.requestPermission==='function')m=await DeviceMotionEvent.requestPermission();
      if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function')o=await DeviceOrientationEvent.requestPermission();
      if(m!=='granted'){
        setState('DENIED','warn');
        if(btn)btn.textContent='再次要求 Motion 權限';
        return;
      }
      attach();
      setState(o==='granted'?'READY':'MOTION ONLY',o==='granted'?'live':'warn');
      if(btn)btn.textContent='Motion 已授權 · 點擊重試';
    }catch(err){
      setState('DENIED','warn');
      if(btn)btn.textContent='再次要求 Motion 權限';
    }
  }

  function drawWave(){
    const canvas=q('#gwMotionCanvas');
    if(canvas){
      const rect=canvas.getBoundingClientRect();
      const dpr=Math.min(devicePixelRatio||1,2);
      const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      const ctx=canvas.getContext('2d');
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle='rgba(118,227,189,.08)';ctx.lineWidth=1;
      for(let i=1;i<4;i++){let y=h*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
      const traces=[['x','#76e3bd'],['y','#67cbe2'],['z','#e0bd70'],['m','#e57c86']];
      const scale=Math.max(1,Math.min(12,Math.max(...samples.map(s=>Math.max(Math.abs(s.x),Math.abs(s.y),Math.abs(s.z),s.m)),1)));
      traces.forEach(([key,color])=>{
        if(samples.length<2)return;
        ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,dpr);
        samples.forEach((s,i)=>{
          const x=i/(MAX_POINTS-1)*w;
          const val=key==='m'?(s[key]-scale/2):s[key];
          const y=h/2-(val/scale)*(h*.42);
          if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        });
        ctx.stroke();
      });
    }
    requestAnimationFrame(drawWave);
  }

  function mount(){
    if(mounted)return;
    if(!q('#motionVal'))return;
    mounted=true;addStyles();buildPanel();attach();
    const btn=q('#gwMotionPermission');if(btn)btn.addEventListener('click',requestPermission);
    if(typeof DeviceMotionEvent==='undefined')setState('UNSUPPORTED','warn');else setState('READY');
    drawWave();
    window.GODWAY_MOTION_PRO={version:VERSION,requestPermission};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
