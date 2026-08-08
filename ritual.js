(()=>{
  const STORAGE='gw_rituals_v5';
  const runtime={active:false,prepared:false,timer:null,startedAt:0,duration:120000,maxScore:0,startEventIndex:0,startedSweep:false,startedRecording:false,id:null,marks:[]};
  let rituals=[];
  try{rituals=JSON.parse(localStorage.getItem(STORAGE)||'[]')}catch(e){rituals=[]}

  const q=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const nowText=()=>new Date().toLocaleString('zh-TW',{hour12:false});
  const makeId=()=>`RIT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  const vibrate=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

  function addStyles(){
    const style=document.createElement('style');
    style.textContent=`
      .tabs{grid-template-columns:repeat(7,1fr)!important}
      .ritual-shell{position:relative;overflow:hidden}
      .ritual-shell:before{content:"";position:absolute;inset:-30%;pointer-events:none;background:radial-gradient(circle at 50% 50%,rgba(224,189,112,.08),transparent 34%),conic-gradient(from 0deg,transparent,rgba(118,227,189,.04),transparent,rgba(224,189,112,.05),transparent);animation:ritualDrift 18s linear infinite}
      @keyframes ritualDrift{to{transform:rotate(360deg)}}
      .ritual-stage{position:relative;z-index:1}
      .ritual-circle-wrap{display:grid;place-items:center;padding:8px 0 16px}
      .ritual-circle{--energy:0;position:relative;width:min(68vw,310px);aspect-ratio:1;border-radius:50%;border:1px solid rgba(224,189,112,.35);background:radial-gradient(circle,rgba(224,189,112,.045) 0 19%,transparent 20% 39%,rgba(118,227,189,.035) 40% 41%,transparent 42% 63%,rgba(224,189,112,.04) 64% 65%,transparent 66%),conic-gradient(from -20deg,rgba(118,227,189,.03),rgba(224,189,112,.08),rgba(118,227,189,.03),rgba(224,189,112,.08),rgba(118,227,189,.03));box-shadow:inset 0 0 calc(22px + var(--energy)*.45px) rgba(118,227,189,.08),0 0 calc(12px + var(--energy)*.28px) rgba(224,189,112,.08);transition:.2s}
      .ritual-circle.active{animation:ritualBreath 3.2s ease-in-out infinite}
      @keyframes ritualBreath{50%{transform:scale(1.015);filter:brightness(1.12)}}
      .ritual-circle:before,.ritual-circle:after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(45deg);width:53%;height:53%;border:1px solid rgba(224,189,112,.26)}
      .ritual-circle:after{transform:translate(-50%,-50%) rotate(22.5deg);width:72%;height:72%;border-color:rgba(118,227,189,.18)}
      .ritual-core{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:43%;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;text-align:center;border:1px solid rgba(224,189,112,.28);background:rgba(4,7,10,.78);box-shadow:0 0 35px rgba(224,189,112,.07);z-index:3;padding:12px}
      .ritual-core b{display:block;color:#efd89c;font-size:15px;letter-spacing:.08em}.ritual-core span{font-size:9px;color:#7e908a;line-height:1.45;margin-top:5px}
      .ritual-node{position:absolute;width:9px;height:9px;border:1px solid rgba(224,189,112,.68);border-radius:50%;background:#081013;box-shadow:0 0 11px rgba(224,189,112,.25);z-index:4}
      .ritual-node.lit{background:#e0bd70;box-shadow:0 0 18px rgba(224,189,112,.75)}
      .ritual-progress{height:8px;border-radius:99px;background:rgba(255,255,255,.05);overflow:hidden;border:1px solid rgba(255,255,255,.04);margin:10px 0}.ritual-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#76e3bd,#e0bd70);transition:width .2s}
      .ritual-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:10px 0}.ritual-kpi{border:1px solid var(--line);background:rgba(255,255,255,.025);border-radius:13px;padding:10px}.ritual-kpi b{display:block;font-size:17px}.ritual-kpi span{font-size:8px;color:var(--muted)}
      .ritual-step{display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line)}.ritual-step:last-child{border-bottom:0}.ritual-step i{width:20px;height:20px;flex:0 0 20px;display:grid;place-items:center;border-radius:50%;border:1px solid var(--line);font-style:normal;font-size:9px;color:var(--muted)}.ritual-step.done i{background:rgba(118,227,189,.12);border-color:rgba(118,227,189,.32);color:#bff7e4}.ritual-step b{font-size:10px}.ritual-step p{font-size:9px;color:var(--muted);margin:3px 0 0;line-height:1.5}
      .ritual-live{border:1px solid rgba(224,189,112,.22);background:rgba(224,189,112,.045);border-radius:14px;padding:12px;margin-top:10px}.ritual-live strong{color:#f0d99f}.ritual-archive{display:flex;flex-direction:column;gap:8px}.ritual-record{border:1px solid var(--line);border-radius:13px;padding:11px;background:rgba(255,255,255,.02)}.ritual-record time{font-size:8px;color:#697a75}.ritual-record b{display:block;font-size:11px;margin:4px 0}.ritual-record p{font-size:10px;color:#94a49f;margin:3px 0;line-height:1.5}
      .ritual-warning{font-size:10px;line-height:1.55;color:#a9b4b0;border-left:2px solid rgba(224,189,112,.48);padding:8px 10px;background:rgba(224,189,112,.045);border-radius:0 10px 10px 0}
      @media(max-width:650px){.ritual-kpis{grid-template-columns:repeat(2,1fr)}.tabs{grid-template-columns:repeat(7,1fr)!important}.tab{font-size:8px!important;padding-left:1px!important;padding-right:1px!important}}
    `;
    document.head.appendChild(style);
  }

  function buildUI(){
    const nav=q('.tabs');
    if(!nav||q('#ritual'))return;
    const section=document.createElement('section');
    section.id='ritual';
    section.className='view';
    section.innerHTML=`
      <div class="card ritual-shell">
        <div class="ritual-stage">
          <p class="section-title">INVOCATION PROTOCOL · 召喚儀式</p>
          <div class="ritual-warning"><b>儀式層：</b>此介面用來建立有開始、觀測、標記與封閉流程的沉浸式儀式紀錄；它不宣稱能真正召喚或辨識超自然存在。真正被保存的是時間、感測數據與你的觀察。</div>
          <div class="gap"></div>
          <div class="grid2">
            <div><label class="mini">召請對象／儀式稱呼</label><input id="ritualTarget" maxlength="50" placeholder="例：未知訊號 A／守護者／無名者" /></div>
            <div><label class="mini">觀測時間</label><select id="ritualDuration" style="width:100%;border:1px solid var(--line);background:#071015;color:var(--text);border-radius:13px;padding:12px"><option value="60">60 秒</option><option value="120" selected>120 秒</option><option value="180">180 秒</option><option value="300">300 秒</option></select></div>
          </div>
          <div class="gap"></div>
          <div class="grid2">
            <div><label class="mini">儀式模式</label><select id="ritualMode" style="width:100%;border:1px solid var(--line);background:#071015;color:var(--text);border-radius:13px;padding:12px"><option value="silent">靜默感測</option><option value="evp">EVP 錄音輔助</option><option value="sweep">Spirit Box 掃頻輔助</option></select></div>
            <div><label class="mini">意圖</label><input id="ritualIntent" maxlength="80" value="在不造成任何傷害的前提下，觀察是否出現可量測的環境變化" /></div>
          </div>
          <div class="gap"></div>
          <label class="mini">召請語</label><textarea id="ritualPhrase">若此處存在任何可回應的未知來源，請只以不傷害任何人、且可被環境感測器記錄的方式留下訊號。儀式結束時，所有互動到此停止。</textarea>

          <div class="ritual-circle-wrap">
            <div id="ritualCircle" class="ritual-circle">
              ${Array.from({length:8},(_,i)=>`<i class="ritual-node" data-node="${i}"></i>`).join('')}
              <div class="ritual-core"><div><b id="ritualStageName">STANDBY</b><span id="ritualCoreText">等待準備</span></div></div>
            </div>
          </div>

          <div class="ritual-kpis">
            <div class="ritual-kpi"><b id="ritualCountdown">--:--</b><span>REMAIN</span></div>
            <div class="ritual-kpi"><b id="ritualScore">0</b><span>LIVE SCORE</span></div>
            <div class="ritual-kpi"><b id="ritualMax">0</b><span>MAX SCORE</span></div>
            <div class="ritual-kpi"><b id="ritualEvents">0</b><span>EVENTS</span></div>
          </div>
          <div class="ritual-progress"><i id="ritualProgress"></i></div>
          <div id="ritualSensorLine" class="mini">Baseline：未確認 · Audio：— · Motion：— · MAG：—</div>

          <div class="calbox" id="ritualPrepBox">
            <div class="ritual-step" id="ritualStep1"><i>1</i><div><b>啟用感測</b><p>取得麥克風、動態與裝置可提供的其他感測資料。</p></div></div>
            <div class="ritual-step" id="ritualStep2"><i>2</i><div><b>建立環境基線</b><p>用目前場地的一般狀態做比較基準，避免把背景噪音誤判成事件。</p></div></div>
            <div class="ritual-step" id="ritualStep3"><i>3</i><div><b>宣告意圖</b><p>朗讀或默念上方文字；App 不會把文字本身視為感測證據。</p></div></div>
            <div class="ritual-step" id="ritualStep4"><i>4</i><div><b>觀測與封閉</b><p>儀式期間只記錄實際感測異常與人工標記，結束後自動封存紀錄。</p></div></div>
          </div>
          <div class="gap"></div>
          <div class="row mobileStack"><button id="ritualPrepare" class="ghost">一鍵準備感測</button><button id="ritualStart" class="primary" disabled>開始召喚儀式</button></div>
          <div class="gap"></div>
          <div class="row mobileStack"><button id="ritualMark" class="ghost" disabled>標記疑似回應</button><button id="ritualClose" class="danger" disabled>封閉並結束儀式</button></div>
          <div id="ritualLive" class="ritual-live" style="display:none"><strong>LIVE</strong><div id="ritualLiveText" class="mini" style="margin-top:5px">等待開始。</div></div>
        </div>
      </div>
      <div class="card" style="margin-top:11px"><p class="section-title">RITUAL ARCHIVE · 儀式封存</p><div id="ritualArchive" class="ritual-archive"></div></div>
    `;
    nav.parentNode.insertBefore(section,nav);
    const tab=document.createElement('button');
    tab.className='tab';
    tab.dataset.view='ritual';
    tab.textContent='儀式';
    nav.appendChild(tab);
    tab.onclick=()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===tab));
      document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='ritual'));
    };
    placeNodes();
  }

  function placeNodes(){
    document.querySelectorAll('.ritual-node').forEach((n,i)=>{
      const a=(i*45-90)*Math.PI/180,r=44;
      n.style.left=`calc(50% + ${Math.cos(a)*r}% - 4px)`;
      n.style.top=`calc(50% + ${Math.sin(a)*r}% - 4px)`;
    });
  }

  function sensorReady(){
    try{return typeof state!=='undefined'&&!!state.stream}catch(e){return false}
  }
  function baselineReady(){
    try{return typeof state!=='undefined'&&!!state.baseline}catch(e){return false}
  }
  function updatePrep(){
    const s=sensorReady(),b=baselineReady();
    q('#ritualStep1')?.classList.toggle('done',s);
    q('#ritualStep2')?.classList.toggle('done',b);
    q('#ritualStep3')?.classList.toggle('done',!!q('#ritualTarget')?.value.trim()&&!!q('#ritualPhrase')?.value.trim());
    q('#ritualStep4')?.classList.toggle('done',runtime.active);
    runtime.prepared=s&&b;
    if(q('#ritualStart'))q('#ritualStart').disabled=runtime.active||!runtime.prepared;
  }

  async function prepare(){
    q('#ritualPrepare').disabled=true;
    q('#ritualStageName').textContent='PREP';
    q('#ritualCoreText').textContent='啟用現場感測';
    try{
      if(typeof requestAudio==='function')await requestAudio();
      if(typeof requestMotion==='function')await requestMotion();
      if(typeof requestMag==='function')await requestMag();
      q('#radar')?.classList.add('live');
      if(q('#markEvent'))q('#markEvent').disabled=false;
      if(!baselineReady()){
        q('#ritualCoreText').textContent='建立 8 秒環境基線';
        if(q('#calBtn'))q('#calBtn').click();
        const started=Date.now();
        while(!baselineReady()&&Date.now()-started<12000)await new Promise(r=>setTimeout(r,250));
      }
      if(baselineReady()){
        runtime.prepared=true;
        q('#ritualStageName').textContent='READY';
        q('#ritualCoreText').textContent='基線完成，可開始儀式';
        vibrate(40);
        if(typeof toast==='function')toast('儀式感測準備完成');
      }else{
        q('#ritualStageName').textContent='BASELINE?';
        q('#ritualCoreText').textContent='請到現場頁完成基線校準';
      }
    }catch(e){
      q('#ritualStageName').textContent='PERMISSION';
      q('#ritualCoreText').textContent='需要感測器權限';
      if(typeof toast==='function')toast('部分感測權限未取得');
    }finally{q('#ritualPrepare').disabled=false;updatePrep()}
  }

  function startAssist(mode){
    if(mode==='sweep'&&typeof state!=='undefined'&&!state.sweepTimer&&q('#sweepBtn')){q('#sweepBtn').click();runtime.startedSweep=!!state.sweepTimer}
    if(mode==='evp'&&q('#recordBtn')){
      try{if(typeof state!=='undefined'&&(!state.recorder||state.recorder.state!=='recording')){q('#recordBtn').click();runtime.startedRecording=true}}catch(e){}
    }
  }
  function stopAssist(){
    try{if(runtime.startedSweep&&state.sweepTimer&&q('#sweepBtn'))q('#sweepBtn').click()}catch(e){}
    try{if(runtime.startedRecording&&state.recorder&&state.recorder.state==='recording'&&q('#recordBtn'))q('#recordBtn').click()}catch(e){}
    runtime.startedSweep=false;runtime.startedRecording=false;
  }

  function startRitual(){
    updatePrep();
    const target=q('#ritualTarget').value.trim();
    const phrase=q('#ritualPhrase').value.trim();
    if(!target)return typeof toast==='function'&&toast('請先填寫召請對象／儀式稱呼');
    if(!phrase)return typeof toast==='function'&&toast('請先填寫召請語');
    if(!runtime.prepared)return typeof toast==='function'&&toast('請先完成感測與環境基線');
    runtime.active=true;runtime.id=makeId();runtime.startedAt=Date.now();runtime.duration=+q('#ritualDuration').value*1000;runtime.maxScore=0;runtime.marks=[];
    try{if(typeof addEvent==='function')addEvent('RITUAL-OPEN',`${target} · ${runtime.id}`,false)}catch(e){}
    try{runtime.startEventIndex=state.events.length}catch(e){runtime.startEventIndex=0}
    startAssist(q('#ritualMode').value);
    q('#ritualCircle').classList.add('active');
    q('#ritualStart').disabled=true;q('#ritualPrepare').disabled=true;q('#ritualMark').disabled=false;q('#ritualClose').disabled=false;q('#ritualLive').style.display='block';
    q('#ritualStep3').classList.add('done');q('#ritualStep4').classList.add('done');
    vibrate([60,50,60]);
    runtime.timer=setInterval(tick,200);
    tick();
  }

  function stageFor(p){
    if(p<.12)return ['OPENING','開啟觀測 · 宣告意圖',2];
    if(p<.3)return ['INVOCATION','召請階段 · 保持裝置穩定',4];
    if(p<.82)return ['OBSERVE','觀測階段 · 只記錄可量測變化',6];
    return ['CLOSING','封閉階段 · 準備停止互動',8];
  }

  function tick(){
    if(!runtime.active)return;
    const elapsed=Date.now()-runtime.startedAt,p=Math.min(1,elapsed/runtime.duration),remain=Math.max(0,runtime.duration-elapsed);
    let score=0,grade='—',peak='--',db='--',mag='N/A',motion='--',events=0;
    try{score=state.score||0;grade=state.grade||'—';peak=state.peakHz?Math.round(state.peakHz):'--';db=Number.isFinite(state.db)?state.db.toFixed(1):'--';mag=state.magValue!=null?state.magValue.toFixed(1):'N/A';motion=Number.isFinite(state.motion)?state.motion.toFixed(2):'--';events=Math.max(0,state.events.length-runtime.startEventIndex)}catch(e){}
    runtime.maxScore=Math.max(runtime.maxScore,score);
    q('#ritualScore').textContent=score;q('#ritualMax').textContent=runtime.maxScore;q('#ritualEvents').textContent=events;
    const sec=Math.ceil(remain/1000);q('#ritualCountdown').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
    q('#ritualProgress').style.width=(p*100)+'%';q('#ritualCircle').style.setProperty('--energy',score);
    const [name,text,nodes]=stageFor(p);q('#ritualStageName').textContent=name;q('#ritualCoreText').textContent=text;
    document.querySelectorAll('.ritual-node').forEach((n,i)=>n.classList.toggle('lit',i<nodes));
    q('#ritualSensorLine').textContent=`Baseline：${baselineReady()?'READY':'N/A'} · Audio：${peak} Hz / ${db} dBFS · Motion：${motion} · MAG：${mag} µT`;
    q('#ritualLiveText').textContent=`${name} · Evidence ${grade} · 即時異常 ${score}/100 · 本階段事件 ${events} 件。系統不會把任何數值自動解讀成「召喚成功」。`;
    if(remain<=0)finish('時間到，自動封閉');
  }

  function mark(){
    if(!runtime.active)return;
    const note=prompt('你觀察到什麼？例如：敲擊聲／光線變化／疑似單字')||'人工標記疑似回應';
    let snapshot={at:+((Date.now()-runtime.startedAt)/1000).toFixed(1),note,score:0,grade:'—',peakHz:null,db:null,mag:null,motion:null};
    try{snapshot.score=state.score;snapshot.grade=state.grade;snapshot.peakHz=Math.round(state.peakHz||0);snapshot.db=+state.db.toFixed(1);snapshot.mag=state.magValue!=null?+state.magValue.toFixed(2):null;snapshot.motion=+state.motion.toFixed(2);if(typeof addEvent==='function')addEvent('RITUAL-MARK',`${runtime.id} · ${note}`,false)}catch(e){}
    runtime.marks.push(snapshot);q('#ritualEvents').textContent=Number(q('#ritualEvents').textContent||0)+1;vibrate(35);
    if(typeof toast==='function')toast('已標記儀式事件');
  }

  function finish(reason='手動封閉'){
    if(!runtime.active)return;
    clearInterval(runtime.timer);runtime.timer=null;runtime.active=false;stopAssist();
    let target=q('#ritualTarget').value.trim(),intent=q('#ritualIntent').value.trim(),phrase=q('#ritualPhrase').value.trim(),mode=q('#ritualMode').value;
    let related=[];
    try{related=state.events.slice(runtime.startEventIndex).filter(e=>!String(e.type).startsWith('RITUAL-OPEN'))}catch(e){}
    const record={id:runtime.id,startedAt:new Date(runtime.startedAt).toISOString(),endedAt:new Date().toISOString(),durationSec:+((Date.now()-runtime.startedAt)/1000).toFixed(1),plannedSec:runtime.duration/1000,target,intent,phrase,mode,maxScore:runtime.maxScore,eventCount:related.length,events:related.map(e=>e.id),marks:[...runtime.marks],closeReason:reason,baselineUsed:baselineReady()};
    rituals.push(record);rituals=rituals.slice(-60);localStorage.setItem(STORAGE,JSON.stringify(rituals));
    try{if(typeof addEvent==='function')addEvent('RITUAL-CLOSE',`${target} · ${runtime.id} · max ${runtime.maxScore}/100 · ${related.length} events`,false)}catch(e){}
    q('#ritualCircle').classList.remove('active');q('#ritualCircle').style.setProperty('--energy',0);document.querySelectorAll('.ritual-node').forEach(n=>n.classList.remove('lit'));
    q('#ritualStageName').textContent='SEALED';q('#ritualCoreText').textContent='儀式已封閉 · 紀錄已保存';q('#ritualStart').disabled=false;q('#ritualPrepare').disabled=false;q('#ritualMark').disabled=true;q('#ritualClose').disabled=true;q('#ritualLiveText').textContent=`${reason}。最高異常 ${runtime.maxScore}/100，共記錄 ${related.length} 個事件與 ${runtime.marks.length} 個人工標記。`;
    q('#ritualCountdown').textContent='00:00';q('#ritualProgress').style.width='100%';
    renderArchive();vibrate([60,50,100]);
    if(typeof toast==='function')toast('儀式已封閉並保存紀錄');
  }

  function renderArchive(){
    const box=q('#ritualArchive');if(!box)return;
    const arr=rituals.slice().reverse();
    box.innerHTML=arr.length?arr.map(r=>`<div class="ritual-record"><time>${new Date(r.startedAt).toLocaleString('zh-TW',{hour12:false})}</time><b>${esc(r.id)} · ${esc(r.target)}</b><p>${esc(r.intent)}</p><p>${r.durationSec}s · ${r.mode.toUpperCase()} · max ${r.maxScore}/100 · ${r.eventCount} sensor events · ${r.marks.length} marks</p><p>封閉：${esc(r.closeReason)}</p></div>`).join(''):'<div class="empty">尚無儀式紀錄</div>';
  }

  function bind(){
    q('#ritualPrepare').onclick=prepare;q('#ritualStart').onclick=startRitual;q('#ritualMark').onclick=mark;q('#ritualClose').onclick=()=>finish('手動封閉');
    ['ritualTarget','ritualPhrase'].forEach(id=>q('#'+id).addEventListener('input',updatePrep));
    setInterval(()=>{updatePrep();if(!runtime.active){let peak='--',db='--',mag='N/A',motion='--';try{peak=state.peakHz?Math.round(state.peakHz):'--';db=Number.isFinite(state.db)?state.db.toFixed(1):'--';mag=state.magValue!=null?state.magValue.toFixed(1):'N/A';motion=Number.isFinite(state.motion)?state.motion.toFixed(2):'--'}catch(e){}q('#ritualSensorLine').textContent=`Baseline：${baselineReady()?'READY':'未建立'} · Audio：${peak} Hz / ${db} dBFS · Motion：${motion} · MAG：${mag} µT`}},900);
    addEventListener('beforeunload',()=>{if(runtime.active){try{localStorage.setItem('gw_ritual_interrupted',JSON.stringify({id:runtime.id,target:q('#ritualTarget').value,startedAt:runtime.startedAt,time:Date.now()}))}catch(e){}}});
  }

  function init(){addStyles();buildUI();bind();renderArchive();updatePrep()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
