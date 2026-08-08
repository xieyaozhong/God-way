(()=>{
  const VERSION='5.2.0';
  const STORAGE='gw_rituals_v52';
  const LEGACY='gw_rituals_v5';
  const runtime={
    active:false,preparing:false,timer:null,stageTimer:null,startedAt:0,duration:120000,
    maxScore:0,startEventIndex:0,startedSweep:false,startedRecording:false,id:null,marks:[],
    targetBearing:null,headingStart:null,lastScoreBand:-1,template:'unknown',altar:new Set(['water'])
  };
  let rituals=[];
  try{
    rituals=JSON.parse(localStorage.getItem(STORAGE)||'[]');
    if(!rituals.length){
      const legacy=JSON.parse(localStorage.getItem(LEGACY)||'[]');
      if(Array.isArray(legacy)&&legacy.length)rituals=legacy;
    }
  }catch(e){rituals=[]}

  const q=s=>document.querySelector(s);
  const qa=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const makeId=()=>`RIT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const vibrate=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
  const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(rituals.slice(-100)))}catch(e){}};
  const getState=()=>{try{return typeof state!=='undefined'?state:null}catch(e){return null}};
  const fmtSec=n=>`${String(Math.max(0,Math.floor(n/60))).padStart(2,'0')}:${String(Math.max(0,Math.floor(n%60))).padStart(2,'0')}`;
  const angleDiff=(a,b)=>Math.abs(((a-b+540)%360)-180);

  const templates={
    unknown:{
      name:'未知訊號',
      target:'未知訊號 A',
      intent:'觀察是否出現可重複、可量測的環境變化',
      phrase:'若此處存在任何可回應的未知來源，請只以不傷害任何人、且可被環境感測器記錄的方式留下訊號。儀式結束時，所有互動到此停止。',
      mode:'silent',duration:120,altar:['water'],bearing:'any'
    },
    guardian:{
      name:'守護象徵',
      target:'守護者',
      intent:'以保護、安定與界線為主題進行一段觀測',
      phrase:'以守護與平安為本次儀式的唯一意圖。若有任何可記錄的環境變化，只接受不傷害、不威脅、不要求服從的方式。',
      mode:'evp',duration:120,altar:['water','flower'],bearing:'any'
    },
    land:{
      name:'地方守護象徵',
      target:'此地守護象徵',
      intent:'記錄場地在儀式期間是否出現與基線不同的變化',
      phrase:'本次僅以尊重此地、保持界線與記錄環境為目的。任何觀測皆在儀式結束時停止。',
      mode:'silent',duration:180,altar:['water','fruit'],bearing:'any'
    },
    ancestor:{
      name:'祖靈紀念象徵',
      target:'祖靈紀念象徵',
      intent:'以紀念與回憶為主題進行安靜觀測',
      phrase:'此儀式只作紀念與記錄，不要求任何存在出現或服從。若環境有變化，僅將其保存為觀測資料。',
      mode:'evp',duration:180,altar:['water','flower'],bearing:'any'
    },
    signal:{
      name:'定向訊號',
      target:'定向未知訊號',
      intent:'固定手機方位後，觀察聲學、運動與磁場是否出現同步偏離',
      phrase:'保持手機方向與場地狀態穩定。若有未知來源造成可量測變化，只記錄資料，不將結果視為超自然證明。',
      mode:'sweep',duration:120,altar:['bell'],bearing:'0'
    },
    custom:{
      name:'自訂儀式',
      target:'',
      intent:'在不造成任何傷害的前提下，觀察是否出現可量測的環境變化',
      phrase:'若此處存在任何可回應的未知來源，請只以不傷害任何人、且可被環境感測器記錄的方式留下訊號。儀式結束時，所有互動到此停止。',
      mode:'silent',duration:120,altar:['water'],bearing:'any'
    }
  };

  const altarItems=[
    ['water','水','◉'],
    ['flower','花','✿'],
    ['fruit','果','◆'],
    ['incense','香（虛擬）','│'],
    ['candle','燭（虛擬）','✦'],
    ['bell','鈴','◌']
  ];

  function addStyles(){
    if(q('#ritualV52Styles'))return;
    const style=document.createElement('style');
    style.id='ritualV52Styles';
    style.textContent=`
      .tabs{grid-template-columns:repeat(7,1fr)!important}
      .ritual-shell{position:relative;overflow:hidden}.ritual-shell:before{content:"";position:absolute;inset:-30%;pointer-events:none;background:radial-gradient(circle at 50% 45%,rgba(224,189,112,.09),transparent 32%),conic-gradient(from 0deg,transparent,rgba(118,227,189,.035),transparent,rgba(224,189,112,.05),transparent);animation:ritualDrift 20s linear infinite}
      @keyframes ritualDrift{to{transform:rotate(360deg)}}.ritual-stage{position:relative;z-index:1}
      .ritual-template-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.ritual-template{border:1px solid var(--line);background:rgba(255,255,255,.022);border-radius:13px;padding:10px;color:#a6b5b0;text-align:left;font-size:10px}.ritual-template b{display:block;color:#d9e7e2;margin-bottom:3px}.ritual-template.active{border-color:rgba(224,189,112,.46);background:rgba(224,189,112,.075);box-shadow:0 0 24px rgba(224,189,112,.07)}
      .altar{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:8px}.altar-item{border:1px solid var(--line);border-radius:13px;background:rgba(255,255,255,.02);padding:9px 4px;text-align:center;color:#778983;font-size:8px}.altar-item i{font-style:normal;display:block;font-size:18px;margin-bottom:4px;color:#83968f}.altar-item.on{border-color:rgba(224,189,112,.4);background:rgba(224,189,112,.065);color:#e8d7ad}.altar-item.on i{color:#e0bd70;text-shadow:0 0 14px rgba(224,189,112,.5)}
      .ritual-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:10px}.ritual-circle-wrap{display:grid;place-items:center;padding:7px 0 12px}.ritual-circle{--energy:0;position:relative;width:min(67vw,305px);aspect-ratio:1;border-radius:50%;border:1px solid rgba(224,189,112,.37);background:radial-gradient(circle,rgba(224,189,112,.05) 0 18%,transparent 19% 37%,rgba(118,227,189,.04) 38% 39%,transparent 40% 61%,rgba(224,189,112,.035) 62% 64%,transparent 65%),conic-gradient(from -15deg,rgba(118,227,189,.025),rgba(224,189,112,.08),rgba(118,227,189,.025),rgba(224,189,112,.07),rgba(118,227,189,.025));box-shadow:inset 0 0 calc(20px + var(--energy)*.42px) rgba(118,227,189,.09),0 0 calc(12px + var(--energy)*.3px) rgba(224,189,112,.09);transition:.16s}.ritual-circle.active{animation:ritualBreath 3s ease-in-out infinite}.ritual-circle.event{filter:brightness(1.35)}@keyframes ritualBreath{50%{transform:scale(1.012);filter:brightness(1.1)}}.ritual-circle:before,.ritual-circle:after{content:"";position:absolute;left:50%;top:50%;width:54%;height:54%;transform:translate(-50%,-50%) rotate(45deg);border:1px solid rgba(224,189,112,.25)}.ritual-circle:after{width:72%;height:72%;transform:translate(-50%,-50%) rotate(22.5deg);border-color:rgba(118,227,189,.17)}
      .ritual-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:43%;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;text-align:center;border:1px solid rgba(224,189,112,.28);background:rgba(4,7,10,.82);box-shadow:0 0 38px rgba(224,189,112,.08);z-index:4;padding:11px}.ritual-core b{display:block;color:#efd89c;font-size:14px;letter-spacing:.08em}.ritual-core span{display:block;font-size:8px;color:#7e908a;line-height:1.5;margin-top:5px}
      .ritual-node{position:absolute;width:10px;height:10px;border:1px solid rgba(224,189,112,.65);border-radius:50%;background:#071013;box-shadow:0 0 9px rgba(224,189,112,.2);z-index:5;transition:.15s}.ritual-node.lit{background:#e0bd70;box-shadow:0 0 18px rgba(224,189,112,.8);transform:scale(1.16)}
      .compass-card{border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.02);padding:11px}.compass{position:relative;width:150px;height:150px;margin:8px auto;border-radius:50%;border:1px solid rgba(118,227,189,.28);background:radial-gradient(circle,rgba(118,227,189,.04),transparent 65%)}.compass:before,.compass:after{position:absolute;color:#80918c;font-size:9px}.compass:before{content:"N";left:50%;top:5px;transform:translateX(-50%)}.compass:after{content:"S";left:50%;bottom:5px;transform:translateX(-50%)}.compass-ew{position:absolute;inset:0}.compass-ew:before,.compass-ew:after{position:absolute;top:50%;transform:translateY(-50%);font-size:9px;color:#80918c}.compass-ew:before{content:"W";left:7px}.compass-ew:after{content:"E";right:7px}.compass-ring{position:absolute;inset:18px;border:1px solid rgba(118,227,189,.12);border-radius:50%}.compass-needle,.compass-target{position:absolute;left:50%;top:50%;width:2px;height:55px;transform-origin:50% 100%;transition:transform .18s}.compass-needle{background:linear-gradient(#76e3bd,rgba(118,227,189,.1));box-shadow:0 0 10px rgba(118,227,189,.35);z-index:3}.compass-target{width:3px;height:62px;background:linear-gradient(#e0bd70,transparent);opacity:.8;z-index:2}.compass-dot{position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;background:#d8efe7;transform:translate(-50%,-50%);z-index:5}
      .condition{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);padding:8px 0;font-size:9px;color:#8fa09a}.condition:last-child{border:0}.condition i{width:18px;height:18px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;font-style:normal}.condition.ok{color:#c9f4e5}.condition.ok i{border-color:rgba(118,227,189,.38);background:rgba(118,227,189,.11);color:#76e3bd}.condition.optional{opacity:.8}
      .ritual-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:9px 0}.ritual-kpi{border:1px solid var(--line);background:rgba(255,255,255,.024);border-radius:13px;padding:9px}.ritual-kpi b{display:block;font-size:16px}.ritual-kpi span{font-size:8px;color:var(--muted)}.ritual-progress{height:8px;border-radius:99px;background:rgba(255,255,255,.05);overflow:hidden;border:1px solid rgba(255,255,255,.04);margin:9px 0}.ritual-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#76e3bd,#e0bd70);transition:width .15s}
      .ritual-live{border:1px solid rgba(224,189,112,.22);background:rgba(224,189,112,.045);border-radius:14px;padding:11px;margin-top:9px}.ritual-live strong{color:#f0d99f}.ritual-record{border:1px solid var(--line);border-radius:13px;padding:11px;background:rgba(255,255,255,.02);margin-bottom:7px}.ritual-record time{font-size:8px;color:#697a75}.ritual-record b{display:block;font-size:11px;margin:4px 0}.ritual-record p{font-size:10px;color:#94a49f;margin:3px 0;line-height:1.5}.ritual-warning{font-size:10px;line-height:1.55;color:#a9b4b0;border-left:2px solid rgba(224,189,112,.48);padding:8px 10px;background:rgba(224,189,112,.045);border-radius:0 10px 10px 0}
      .ritual-badge{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:4px 7px;font-size:8px;color:#91a39d;margin:2px 3px 2px 0}.ritual-next{margin-top:9px}
      @media(max-width:650px){.ritual-grid{grid-template-columns:1fr}.ritual-template-grid{grid-template-columns:1fr 1fr}.altar{grid-template-columns:repeat(3,1fr)}.ritual-kpis{grid-template-columns:repeat(2,1fr)}.tabs{grid-template-columns:repeat(7,1fr)!important}.tab{font-size:8px!important;padding-left:1px!important;padding-right:1px!important}}
    `;
    document.head.appendChild(style);
  }

  function buildUI(){
    const nav=q('.tabs');
    if(!nav)return;
    const old=q('#ritual'); if(old)old.remove();
    qa('.tab[data-view="ritual"]').forEach(x=>x.remove());

    const section=document.createElement('section');
    section.id='ritual'; section.className='view';
    section.innerHTML=`
      <div class="card ritual-shell"><div class="ritual-stage">
        <p class="section-title">INVOCATION PROTOCOL · 召喚儀式 5.2</p>
        <div class="ritual-warning"><b>儀式與實測分離：</b>模板、供桌、稱呼與召請語只提供儀式感；判定區只使用手機實際取得的聲學、動態、方向與支援裝置上的磁場資料。沒有感測資料時顯示 N/A，不補假值。</div>
        <div class="gap"></div>
        <label class="mini">儀式模板（象徵／敘事模板，不代表任何宗教正統儀軌）</label>
        <div id="ritualTemplates" class="ritual-template-grid"></div>
        <div class="gap"></div>

        <div class="grid2">
          <div><label class="mini">召請對象／儀式稱呼</label><input id="ritualTarget" maxlength="50" /></div>
          <div><label class="mini">觀測時間</label><select id="ritualDuration" style="width:100%;border:1px solid var(--line);background:#071015;color:var(--text);border-radius:13px;padding:12px"><option value="60">60 秒</option><option value="120">120 秒</option><option value="180">180 秒</option><option value="300">300 秒</option></select></div>
        </div>
        <div class="gap"></div>
        <div class="grid2">
          <div><label class="mini">儀式模式</label><select id="ritualMode" style="width:100%;border:1px solid var(--line);background:#071015;color:var(--text);border-radius:13px;padding:12px"><option value="silent">靜默感測</option><option value="evp">EVP 錄音輔助</option><option value="sweep">Spirit Box 掃頻輔助</option></select></div>
          <div><label class="mini">方位鎖定</label><select id="ritualBearing" style="width:100%;border:1px solid var(--line);background:#071015;color:var(--text);border-radius:13px;padding:12px"><option value="any">不鎖定</option><option value="0">北 0°</option><option value="90">東 90°</option><option value="180">南 180°</option><option value="270">西 270°</option></select></div>
        </div>
        <div class="gap"></div>
        <label class="mini">意圖</label><input id="ritualIntent" maxlength="100" />
        <div class="gap"></div>
        <label class="mini">召請語</label><textarea id="ritualPhrase"></textarea>
        <div class="row" style="margin-top:7px"><button id="ritualSpeak" class="ghost">朗讀召請語</button><button id="ritualStopSpeak" class="ghost">停止朗讀</button></div>

        <div class="divider"></div>
        <p class="section-title">VIRTUAL ALTAR · 虛擬供桌</p>
        <div class="mini">只影響介面與儀式紀錄，不要求準備實體香、燭、火源或供品。</div>
        <div id="ritualAltar" class="altar"></div>

        <div class="divider"></div>
        <div class="ritual-grid">
          <div>
            <div class="ritual-circle-wrap"><div id="ritualCircle" class="ritual-circle">
              ${Array.from({length:8},(_,i)=>`<i class="ritual-node" data-node="${i}"></i>`).join('')}
              <div class="ritual-core"><div><b id="ritualStageName">STANDBY</b><span id="ritualCoreText">等待條件確認</span></div></div>
            </div></div>
            <div class="ritual-kpis">
              <div class="ritual-kpi"><b id="ritualCountdown">--:--</b><span>REMAIN</span></div>
              <div class="ritual-kpi"><b id="ritualScore">0</b><span>LIVE SCORE</span></div>
              <div class="ritual-kpi"><b id="ritualMax">0</b><span>MAX SCORE</span></div>
              <div class="ritual-kpi"><b id="ritualEvents">0</b><span>EVENTS</span></div>
            </div>
            <div class="ritual-progress"><i id="ritualProgress"></i></div>
            <div id="ritualSensorLine" class="mini">Audio：N/A · Motion：N/A · MAG：N/A</div>
          </div>
          <div>
            <div class="compass-card">
              <div class="head" style="display:flex;justify-content:space-between"><b style="font-size:10px">方位羅盤</b><span id="ritualHeadingText" class="mini">N/A</span></div>
              <div class="compass"><div class="compass-ew"></div><div class="compass-ring"></div><i id="ritualTargetNeedle" class="compass-target"></i><i id="ritualCompassNeedle" class="compass-needle"></i><i class="compass-dot"></i></div>
              <div id="ritualBearingHint" class="mini">未鎖定方位。</div>
            </div>
            <div class="calbox" style="margin-top:8px">
              <b style="font-size:10px">儀式條件</b>
              <div id="condSensors" class="condition"><i>1</i>現場感測已啟用</div>
              <div id="condBaseline" class="condition"><i>2</i>環境基線已建立</div>
              <div id="condText" class="condition"><i>3</i>對象與召請語完整</div>
              <div id="condBearing" class="condition optional"><i>4</i>方位條件（可選）</div>
              <div id="condAltar" class="condition optional"><i>5</i>虛擬供桌已設定（可選）</div>
              <div id="ritualReadyText" class="mini" style="margin-top:7px">等待檢查</div>
            </div>
          </div>
        </div>

        <div class="gap"></div>
        <div class="row"><button id="ritualPrepare" class="ghost">一鍵準備感測</button><button id="ritualStart" class="primary" disabled>開始召喚儀式</button></div>
        <div class="gap"></div>
        <div class="row"><button id="ritualMark" class="ghost" disabled>標記疑似回應</button><button id="ritualClose" class="danger" disabled>封閉並結束</button></div>
        <div id="ritualLive" class="ritual-live" style="display:none"><strong>LIVE</strong><div id="ritualLiveText" class="mini" style="margin-top:5px">等待開始。</div></div>
      </div></div>
      <div class="card" style="margin-top:11px"><p class="section-title">RITUAL ARCHIVE · 儀式封存</p><div id="ritualArchive"></div></div>
    `;
    nav.parentNode.insertBefore(section,nav);

    const tab=document.createElement('button'); tab.className='tab'; tab.dataset.view='ritual'; tab.textContent='儀式'; nav.appendChild(tab);
    tab.onclick=()=>switchView('ritual');
    renderTemplates(); renderAltar(); placeNodes(); applyTemplate('unknown'); renderArchive();
  }

  function switchView(id){
    qa('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===id));
    qa('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  }

  function renderTemplates(){
    const box=q('#ritualTemplates'); if(!box)return;
    box.innerHTML=Object.entries(templates).map(([k,t])=>`<button class="ritual-template ${k===runtime.template?'active':''}" data-template="${k}"><b>${esc(t.name)}</b><span>${k==='custom'?'完全自訂':'套用安全的象徵模板'}</span></button>`).join('');
    qa('.ritual-template').forEach(b=>b.onclick=()=>applyTemplate(b.dataset.template));
  }

  function applyTemplate(key){
    const t=templates[key]||templates.custom; runtime.template=key;
    q('#ritualTarget').value=t.target; q('#ritualIntent').value=t.intent; q('#ritualPhrase').value=t.phrase;
    q('#ritualMode').value=t.mode; q('#ritualDuration').value=String(t.duration); q('#ritualBearing').value=t.bearing;
    runtime.altar=new Set(t.altar); renderTemplates(); renderAltar(); updateConditions();
  }

  function renderAltar(){
    const box=q('#ritualAltar'); if(!box)return;
    box.innerHTML=altarItems.map(([id,label,glyph])=>`<button class="altar-item ${runtime.altar.has(id)?'on':''}" data-altar="${id}"><i>${glyph}</i>${esc(label)}</button>`).join('');
    qa('.altar-item').forEach(b=>b.onclick=()=>{const id=b.dataset.altar;if(runtime.altar.has(id))runtime.altar.delete(id);else runtime.altar.add(id);renderAltar();updateConditions()});
  }

  function placeNodes(){
    qa('.ritual-node').forEach((n,i)=>{const a=(i*45-90)*Math.PI/180,r=44;n.style.left=`calc(50% + ${Math.cos(a)*r}% - 5px)`;n.style.top=`calc(50% + ${Math.sin(a)*r}% - 5px)`});
  }

  function sensorReady(){const s=getState();return !!(s&&s.stream)}
  function baselineReady(){const s=getState();return !!(s&&s.baseline)}
  function textReady(){return !!(q('#ritualTarget')?.value.trim()&&q('#ritualPhrase')?.value.trim())}
  function bearingState(){
    const s=getState(),sel=q('#ritualBearing')?.value||'any';
    if(sel==='any')return {required:false,ok:true,label:'未鎖定方位'};
    const target=+sel;
    if(!s||s.heading==null)return {required:true,ok:false,label:`目標 ${target}° · 羅盤 N/A`};
    const d=angleDiff(s.heading,target);
    return {required:true,ok:d<=15,label:`目標 ${target}° · 偏差 ${Math.round(d)}°`};
  }

  function setCond(id,ok,label){
    const el=q(id); if(!el)return; el.classList.toggle('ok',!!ok);
    if(label)el.childNodes[el.childNodes.length-1].textContent=label;
  }

  function updateConditions(){
    const s=sensorReady(),b=baselineReady(),t=textReady(),br=bearingState(),a=runtime.altar.size>0;
    setCond('#condSensors',s,'現場感測已啟用');
    setCond('#condBaseline',b,'環境基線已建立');
    setCond('#condText',t,'對象與召請語完整');
    setCond('#condBearing',br.ok,`方位條件：${br.label}`);
    setCond('#condAltar',a,a?`虛擬供桌：${runtime.altar.size} 項`:'虛擬供桌未設定（可選）');
    const mandatory=s&&b&&t;
    q('#ritualStart').disabled=runtime.active||runtime.preparing||!mandatory;
    q('#ritualReadyText').textContent=mandatory?(br.required&&!br.ok?'主要條件完成；方位尚未對準，但仍可開始。':'主要條件已完成，可以開始。'):'需完成：感測器、基線、對象／召請語。';
  }

  async function prepareSensors(){
    if(runtime.active||runtime.preparing)return;
    runtime.preparing=true; q('#ritualPrepare').disabled=true; q('#ritualStageName').textContent='PREP';
    q('#ritualCoreText').textContent='啟用感測器';
    try{
      if(!sensorReady()){
        if(typeof requestAudio==='function')await requestAudio();
        if(typeof requestMotion==='function')await requestMotion();
        if(typeof requestMag==='function')await requestMag();
      }
      if(!baselineReady()){
        q('#ritualCoreText').textContent='建立 8 秒環境基線';
        const btn=q('#calBtn'); if(btn&&!btn.disabled)btn.click();
        const start=Date.now();
        while(!baselineReady()&&Date.now()-start<11000){await new Promise(r=>setTimeout(r,300))}
      }
      q('#ritualCoreText').textContent=baselineReady()?'感測與基線完成':'基線尚未完成';
    }catch(e){q('#ritualCoreText').textContent='部分感測器無法啟用'}
    runtime.preparing=false; q('#ritualPrepare').disabled=false; updateConditions();
  }

  function speakPhrase(){
    if(!('speechSynthesis'in window))return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(q('#ritualPhrase').value.trim());
    u.lang='zh-TW'; u.rate=.78; u.pitch=.85; u.volume=.85; speechSynthesis.speak(u);
  }

  async function openingCountdown(){
    runtime.preparing=true; q('#ritualStart').disabled=true; q('#ritualStageName').textContent='OPENING';
    for(let n=3;n>=1;n--){q('#ritualCoreText').textContent=`${n}`;vibrate(60);await new Promise(r=>setTimeout(r,850))}
    runtime.preparing=false; beginRitual();
  }

  function startAssist(mode){
    const s=getState();
    if(mode==='evp'){
      const btn=q('#recordBtn');
      const isRecording=!!(s&&s.recorder&&s.recorder.state==='recording');
      if(btn&&!isRecording){btn.click();runtime.startedRecording=true}
    }
    if(mode==='sweep'){
      const btn=q('#sweepBtn');
      const running=!!(s&&s.sweepTimer);
      if(btn&&!running){btn.click();runtime.startedSweep=true}
    }
  }

  function stopAssist(){
    const s=getState();
    if(runtime.startedRecording&&s&&s.recorder&&s.recorder.state==='recording'){q('#recordBtn')?.click()}
    if(runtime.startedSweep&&s&&s.sweepTimer){q('#sweepBtn')?.click()}
    runtime.startedRecording=false;runtime.startedSweep=false;
  }

  function beginRitual(){
    const s=getState(); if(!s)return;
    runtime.active=true;runtime.id=makeId();runtime.startedAt=Date.now();runtime.duration=(+q('#ritualDuration').value||120)*1000;
    runtime.maxScore=s.score||0;runtime.startEventIndex=s.events?.length||0;runtime.marks=[];runtime.headingStart=s.heading??null;runtime.lastScoreBand=-1;
    runtime.targetBearing=q('#ritualBearing').value==='any'?null:+q('#ritualBearing').value;
    q('#ritualCircle').classList.add('active');q('#ritualMark').disabled=false;q('#ritualClose').disabled=false;q('#ritualPrepare').disabled=true;q('#ritualLive').style.display='block';
    q('#ritualStageName').textContent='INVOCATION';q('#ritualCoreText').textContent=q('#ritualTarget').value.trim()||'未知對象';
    startAssist(q('#ritualMode').value);vibrate([80,70,120]);
    if(typeof addEvent==='function')addEvent('RITUAL-OPEN',`${runtime.id} · ${q('#ritualTarget').value.trim()}`,false);
    setTimeout(()=>{if(runtime.active){q('#ritualStageName').textContent='OBSERVE';q('#ritualCoreText').textContent='感測同步觀測'}},6000);
    clearInterval(runtime.timer);runtime.timer=setInterval(tick,200);
  }

  function scoreBand(score){return score>=75?8:score>=60?7:score>=48?6:score>=36?5:score>=27?4:score>=18?3:score>=10?2:score>0?1:0}
  function paintEnergy(score){
    const circle=q('#ritualCircle'); if(!circle)return; circle.style.setProperty('--energy',String(score));
    const band=scoreBand(score);qa('.ritual-node').forEach((n,i)=>n.classList.toggle('lit',i<band));
    if(band>runtime.lastScoreBand&&runtime.lastScoreBand>=0){circle.classList.add('event');setTimeout(()=>circle.classList.remove('event'),350);vibrate(35)}
    runtime.lastScoreBand=band;
  }

  function updateCompass(){
    const s=getState(),needle=q('#ritualCompassNeedle'),target=q('#ritualTargetNeedle');
    const heading=s?.heading;
    if(heading==null){q('#ritualHeadingText').textContent='N/A';needle.style.opacity='.18';needle.style.transform='translate(-50%,-100%) rotate(0deg)'}
    else{q('#ritualHeadingText').textContent=`${Math.round(heading)}°`;needle.style.opacity='1';needle.style.transform=`translate(-50%,-100%) rotate(${heading}deg)`}
    if(runtime.targetBearing==null&&q('#ritualBearing')?.value!=='any')runtime.targetBearing=+q('#ritualBearing').value;
    const sel=q('#ritualBearing')?.value||'any';
    if(sel==='any'){target.style.opacity='0';q('#ritualBearingHint').textContent='未鎖定方位。'}
    else{
      const t=+sel;target.style.opacity='.8';target.style.transform=`translate(-50%,-100%) rotate(${t}deg)`;
      q('#ritualBearingHint').textContent=heading==null?`目標 ${t}°；裝置未提供羅盤方向。`:`目標 ${t}°；目前偏差 ${Math.round(angleDiff(heading,t))}°。`;
    }
  }

  function tick(){
    if(!runtime.active)return;
    const s=getState(); if(!s)return;
    const elapsed=Date.now()-runtime.startedAt,left=Math.max(0,runtime.duration-elapsed),score=s.score||0;
    runtime.maxScore=Math.max(runtime.maxScore,score);
    const newEvents=Math.max(0,(s.events?.length||0)-runtime.startEventIndex);
    q('#ritualCountdown').textContent=fmtSec(left/1000);q('#ritualScore').textContent=score;q('#ritualMax').textContent=runtime.maxScore;q('#ritualEvents').textContent=newEvents+runtime.marks.length;
    q('#ritualProgress').style.width=`${Math.min(100,elapsed/runtime.duration*100)}%`;paintEnergy(score);updateCompass();updateConditions();
    const mag=s.magValue!=null?`${s.magValue.toFixed(1)}µT`:'N/A',motion=Number.isFinite(s.motion)?`${s.motion.toFixed(2)}m/s²`:'N/A',audio=s.stream?`${Math.round(s.peakHz||0)}Hz / ${Number.isFinite(s.db)?s.db.toFixed(1):'--'}dBFS`:'N/A';
    q('#ritualSensorLine').textContent=`Audio：${audio} · Motion：${motion} · MAG：${mag}`;
    q('#ritualLiveText').textContent=`${s.grade||'—'}級 · ${score}/100 · ${q('#ritualMode').value.toUpperCase()} · ${runtime.id}`;
    if(left<=0)finishRitual('時間完成');
  }

  function markResponse(){
    if(!runtime.active)return;
    const s=getState(),note=prompt('記錄你剛才觀察到的內容（聲音、光線、敲擊、方向等）')||'人工標記疑似回應';
    const m={at:+((Date.now()-runtime.startedAt)/1000).toFixed(1),note,score:s?.score||0,grade:s?.grade||'—',peakHz:Math.round(s?.peakHz||0),db:Number.isFinite(s?.db)?+s.db.toFixed(1):null,mag:s?.magValue!=null?+s.magValue.toFixed(2):null,motion:Number.isFinite(s?.motion)?+s.motion.toFixed(2):null,heading:s?.heading!=null?Math.round(s.heading):null};
    runtime.marks.push(m); if(typeof addEvent==='function')addEvent('RITUAL-MARK',`${runtime.id} · ${note}`,false);paintEnergy(Math.max(m.score,45));vibrate([45,35,45]);
  }

  function finishRitual(reason='手動封閉'){
    if(!runtime.active)return;
    const s=getState(),end=Date.now();runtime.active=false;clearInterval(runtime.timer);runtime.timer=null;stopAssist();try{speechSynthesis.cancel()}catch(e){}
    q('#ritualCircle').classList.remove('active','event');q('#ritualStageName').textContent='CLOSING';q('#ritualCoreText').textContent='封閉通道並保存紀錄';q('#ritualMark').disabled=true;q('#ritualClose').disabled=true;q('#ritualPrepare').disabled=false;
    const eventSlice=(s?.events||[]).slice(runtime.startEventIndex).map(e=>e.id);
    const rec={
      id:runtime.id,version:VERSION,template:runtime.template,templateName:templates[runtime.template]?.name||runtime.template,
      target:q('#ritualTarget').value.trim(),intent:q('#ritualIntent').value.trim(),phrase:q('#ritualPhrase').value.trim(),mode:q('#ritualMode').value,
      started:new Date(runtime.startedAt).toISOString(),ended:new Date(end).toISOString(),durationSec:Math.round((end-runtime.startedAt)/1000),
      plannedDurationSec:Math.round(runtime.duration/1000),reason,maxScore:runtime.maxScore,eventIds:eventSlice,marks:[...runtime.marks],
      altar:[...runtime.altar],targetBearing:runtime.targetBearing,headingStart:runtime.headingStart,headingEnd:s?.heading??null,
      site:s?.site||null,baselineTime:s?.baseline?.time||null
    };
    rituals.push(rec);save();if(typeof addEvent==='function')addEvent('RITUAL-CLOSE',`${rec.id} · ${rec.target} · max ${rec.maxScore}/100`,false);
    q('#ritualProgress').style.width='100%';q('#ritualLiveText').textContent=`已封存 ${rec.id} · 最高 ${rec.maxScore}/100 · ${rec.marks.length} 個人工標記`;renderArchive();vibrate([100,80,180]);
    setTimeout(()=>{q('#ritualStageName').textContent='SEALED';q('#ritualCoreText').textContent='儀式已結束';handoffToAsk(rec)},1200);
    updateConditions();
  }

  function handoffToAsk(rec){
    const ask=q('#questionText');
    if(ask)ask.value=`如果剛才「${rec.target}」儀式期間的環境變化具有可重複來源，請在接下來的觀測窗中再次留下可量測訊號。`;
    switchView('ask');
    ask?.focus();
  }

  function renderArchive(){
    const box=q('#ritualArchive');if(!box)return;
    const rows=rituals.slice(-12).reverse();
    box.innerHTML=rows.length?rows.map(r=>`<div class="ritual-record"><time>${new Date(r.ended||r.started).toLocaleString('zh-TW',{hour12:false})}</time><b>${esc(r.id)} · ${esc(r.target||'未命名')}</b><div><span class="ritual-badge">${esc(r.templateName||r.template||'自訂')}</span><span class="ritual-badge">${esc((r.mode||'silent').toUpperCase())}</span><span class="ritual-badge">MAX ${r.maxScore??0}/100</span><span class="ritual-badge">${r.marks?.length||0} MARKS</span></div><p>${esc(r.intent||'')}</p><button class="ghost ritual-next" data-askrit="${esc(r.id)}">以此紀錄進入問靈觀測</button></div>`).join(''):'<div class="empty">尚無儀式紀錄</div>';
    qa('[data-askrit]').forEach(b=>b.onclick=()=>{const r=rituals.find(x=>x.id===b.dataset.askrit);if(r)handoffToAsk(r)});
  }

  function bind(){
    q('#ritualPrepare').onclick=prepareSensors;q('#ritualStart').onclick=openingCountdown;q('#ritualMark').onclick=markResponse;q('#ritualClose').onclick=()=>finishRitual('手動封閉');
    q('#ritualSpeak').onclick=speakPhrase;q('#ritualStopSpeak').onclick=()=>{try{speechSynthesis.cancel()}catch(e){}};
    ['ritualTarget','ritualPhrase','ritualBearing','ritualIntent'].forEach(id=>q('#'+id)?.addEventListener('input',updateConditions));
    q('#ritualBearing')?.addEventListener('change',()=>{runtime.targetBearing=q('#ritualBearing').value==='any'?null:+q('#ritualBearing').value;updateConditions();updateCompass()});
    setInterval(()=>{if(q('#ritual')){updateConditions();updateCompass();if(!runtime.active){const s=getState();const score=s?.score||0;paintEnergy(Math.min(score,35))}}},500);
  }

  function init(){addStyles();buildUI();bind();updateConditions();updateCompass()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();