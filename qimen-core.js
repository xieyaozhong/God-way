(()=>{
'use strict';

const VERSION='1.0.0';
const TG=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const DZ=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const LUO=['1','8','3','4','9','2','7','6'];
const DISPLAY=['4','9','2','3','5','7','8','1','6'];
const BASIC_MEN={'1':'休門','8':'生門','3':'傷門','4':'杜門','9':'景門','2':'死門','7':'驚門','6':'開門','5':''};
const BASIC_XING={'1':'天蓬','8':'天任','3':'天沖','4':'天輔','9':'天英','2':'天芮','7':'天柱','6':'天心','5':'天禽'};
const GONG={
 '1':{name:'坎',dir:'正北',el:'水'},
 '2':{name:'坤',dir:'西南',el:'土'},
 '3':{name:'震',dir:'正東',el:'木'},
 '4':{name:'巽',dir:'東南',el:'木'},
 '5':{name:'中',dir:'中宮',el:'土'},
 '6':{name:'乾',dir:'西北',el:'金'},
 '7':{name:'兌',dir:'正西',el:'金'},
 '8':{name:'艮',dir:'東北',el:'土'},
 '9':{name:'離',dir:'正南',el:'火'}
};
const MEN={
 '休門':{el:'水',tone:'good',brief:'休養、和緩、安定',use:'宜休整、求和、拜訪、協調。'},
 '生門':{el:'土',tone:'good',brief:'生發、財利、成長',use:'宜求財、經營、開展、增益。'},
 '開門':{el:'金',tone:'good',brief:'開通、事業、公開',use:'宜求職、開業、洽談、出行。'},
 '景門':{el:'火',tone:'mid',brief:'展示、名聲、文書',use:'宜考試、簡報、宣傳、創作。'},
 '傷門':{el:'木',tone:'bad',brief:'競爭、衝擊、傷損',use:'宜執行、追討、競技；防衝突與傷害。'},
 '杜門':{el:'木',tone:'bad',brief:'封閉、保密、阻隔',use:'宜研究、內部作業、隱蔽；不利急於公開。'},
 '死門':{el:'土',tone:'bad',brief:'停滯、結束、收斂',use:'宜收尾、清理、結束舊事；不宜冒進。'},
 '驚門':{el:'金',tone:'bad',brief:'口舌、驚變、聲響',use:'宜辯論、警示、傳播；防口舌與突發。'}
};
const XING={
 '天蓬':{el:'水',brief:'機變、欲望、風險'},
 '天任':{el:'土',brief:'穩實、承擔、田產'},
 '天沖':{el:'木',brief:'速度、行動、突破'},
 '天輔':{el:'木',brief:'學習、文書、助力'},
 '天英':{el:'火',brief:'才華、名聲、顯現'},
 '天芮':{el:'土',brief:'問題、修復、病符'},
 '天柱':{el:'金',brief:'阻力、口舌、破耗'},
 '天心':{el:'金',brief:'判斷、醫藥、決策'},
 '禽芮':{el:'土',brief:'中樞、問題、整合'},
 '天禽':{el:'土',brief:'核心、樞紐、統攝'}
};
const SHEN={
 '值符':{tone:'good',brief:'貴人、主事、統領'},
 '騰蛇':{tone:'bad',brief:'虛驚、纏繞、反覆'},
 '太陰':{tone:'good',brief:'暗助、策劃、隱密'},
 '六合':{tone:'good',brief:'合作、婚姻、協調'},
 '白虎':{tone:'bad',brief:'壓力、傷害、強勢'},
 '玄武':{tone:'bad',brief:'隱情、欺瞞、資訊'},
 '九地':{tone:'good',brief:'穩定、落地、長期'},
 '九天':{tone:'good',brief:'擴張、遠行、速度'}
};
const JQ=[
 ['冬至','yang','174'],['驚蟄','yang','174'],['小寒','yang','285'],['大寒','yang','396'],
 ['春分','yang','396'],['雨水','yang','963'],['清明','yang','417'],['立夏','yang','417'],
 ['立春','yang','852'],['穀雨','yang','528'],['谷雨','yang','528'],['小滿','yang','528'],
 ['小满','yang','528'],['芒種','yang','639'],['芒种','yang','639'],
 ['夏至','yin','936'],['白露','yin','936'],['小暑','yin','825'],['大暑','yin','714'],
 ['秋分','yin','714'],['立秋','yin','258'],['寒露','yin','693'],['立冬','yin','693'],
 ['處暑','yin','147'],['处暑','yin','147'],['霜降','yin','582'],['小雪','yin','582'],['大雪','yin','471']
];
const XUN_EMPTY=[
 ['戌','亥'],['申','酉'],['午','未'],['辰','巳'],['寅','卯'],['子','丑']
];
const ZHI_GONG={子:'1',丑:'8',寅:'8',卯:'3',辰:'4',巳:'4',午:'9',未:'2',申:'2',酉:'7',戌:'6',亥:'6'};

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

function ganZhiIndex(gz){
 const gi=TG.indexOf(gz?.[0]),zi=DZ.indexOf(gz?.[1]);
 if(gi<0||zi<0)return 0;
 for(let n=0;n<60;n++)if(n%10===gi&&n%12===zi)return n;
 return 0;
}
function fuTouZhi(dayGz){
 const n=ganZhiIndex(dayGz),ft=n-(n%5);
 return DZ[((ft%12)+12)%12];
}
function xunShou(timeGz){
 return ['戊','己','庚','辛','壬','癸'][Math.floor(ganZhiIndex(timeGz)/10)]||'戊';
}
function getJu(lunar){
 const jieqi=lunar.getPrevJieQi(true).getName();
 const fz=fuTouZhi(lunar.getDayInGanZhi());
 const yuan='子午卯酉'.includes(fz)?0:'寅申巳亥'.includes(fz)?1:2;
 let row=JQ.find(x=>x[0]===jieqi)||JQ.find(x=>jieqi.includes(x[0])||x[0].includes(jieqi));
 if(!row)row=['未知','yang','111'];
 return {jieqi,type:row[1],number:+row[2][yuan],yuan:['上元','中元','下元'][yuan],fuTou:fz};
}
function getDiPan(type,num){
 const seq=['戊','己','庚','辛','壬','癸','丁','丙','乙'],out={};
 let g=+num;
 for(let i=0;i<9;i++){
   out[String(g)]=seq[i];
   g+=type==='yang'?1:-1;
   if(g>9)g=1;if(g<1)g=9;
 }
 return out;
}
function findStemGong(diPan,stem,xun,zhiFuGong){
 if(stem==='甲')return zhiFuGong;
 let g=Object.keys(diPan).find(k=>k!=='5'&&diPan[k]===stem);
 if(g)return g;
 if(diPan['5']===stem)return '2';
 return zhiFuGong;
}
function distributeTianPan(diPan,xun,shiGan,type){
 let zf=Object.keys(diPan).find(g=>g!=='5'&&diPan[g]===xun)||'2';
 let sg=findStemGong(diPan,shiGan,xun,zf);
 const zfi=LUO.indexOf(zf),sgi=LUO.indexOf(sg);
 let steps=type==='yang'?(sgi-zfi+8)%8:(zfi-sgi+8)%8;
 const out={};
 for(let i=0;i<8;i++){
   let ni=type==='yang'?(i+steps)%8:(i-steps+8)%8;
   out[LUO[ni]]=diPan[LUO[i]];
 }
 out['5']=diPan['5'];
 return {tianPan:out,zhiFuYuanGong:zf,zhiFuLuoGong:sg};
}
function distributeJiuXing(diPan,xun,shiGan){
 let zf=Object.keys(diPan).find(g=>g!=='5'&&diPan[g]===xun)||'2';
 const zhiFuXing=BASIC_XING[zf]||'天芮';
 let lg=findStemGong(diPan,shiGan,xun,zf);
 let steps=(LUO.indexOf(lg)-LUO.indexOf(zf)+8)%8;
 const out={'5':''};
 for(let i=0;i<8;i++){
   const og=LUO[i],ng=LUO[(i+steps)%8];
   out[ng]=og==='2'?'禽芮':BASIC_XING[og];
 }
 return {jiuXing:out,zhiFuXing,zhiFuYuanGong:zf,zhiFuLuoGong:lg};
}
function distributeBaMen(zhiFuGong,timeGz,type){
 const zhiShiMen=BASIC_MEN[zhiFuGong]||BASIC_MEN['2'];
 const step=ganZhiIndex(timeGz)%10;
 let g=+zhiFuGong;
 for(let i=0;i<step;i++){
   g+=type==='yang'?1:-1;
   if(g>9)g=1;if(g<1)g=9;
 }
 const raw=String(g),zg=g===5?'2':String(g);
 const from=LUO.indexOf(zhiFuGong),to=LUO.indexOf(zg),rot=(from<0||to<0)?0:(to-from+8)%8;
 const out={'5':''};
 for(let i=0;i<8;i++)out[LUO[(i+rot)%8]]=BASIC_MEN[LUO[i]];
 return {baMen:out,zhiShiMen,zhiShiGong:zg,zhiShiGongRaw:raw};
}
function distributeBaShen(zhiFuGong,type){
 const shen=['值符','騰蛇','太陰','六合','白虎','玄武','九地','九天'];
 const order=type==='yang'?['1','8','3','4','9','2','7','6']:['1','6','7','2','9','4','3','8'];
 const out={'1':'','2':'','3':'','4':'','5':'','6':'','7':'','8':'','9':''};
 let zf=zhiFuGong==='5'?'2':zhiFuGong,idx=order.indexOf(zf);
 if(idx<0)idx=order.indexOf('2');
 for(let i=0;i<8;i++)out[order[(idx+i)%8]]=shen[i];
 return out;
}
function getKongWang(timeGz){
 const xi=Math.floor(ganZhiIndex(timeGz)/10);
 const branches=XUN_EMPTY[xi]||['戌','亥'];
 const palaces=[...new Set(branches.map(z=>ZHI_GONG[z]))];
 return {branches,palaces};
}
function getYiMa(timeGz){
 const z=timeGz[1];let horse='寅';
 if('寅午戌'.includes(z))horse='申';
 else if('巳酉丑'.includes(z))horse='亥';
 else if('亥卯未'.includes(z))horse='巳';
 else if('申子辰'.includes(z))horse='寅';
 return {branch:horse,gong:ZHI_GONG[horse]};
}
function locateDoor(baMen,name){return Object.keys(baMen).find(g=>baMen[g]===name)||null}
function locateStar(jiuXing,name){return Object.keys(jiuXing).find(g=>jiuXing[g]===name||(name==='天芮'&&jiuXing[g]==='禽芮'))||null}
function locateGod(baShen,name){return Object.keys(baShen).find(g=>baShen[g]===name)||null}
function locateStem(tianPan,stem,xun,zfLuo){
 const actual=stem==='甲'?xun:stem;
 return Object.keys(tianPan).find(g=>g!=='5'&&tianPan[g]===actual)||zfLuo||null;
}
function focusForPurpose(p,chart){
 if(p==='財運')return {label:'財運用神・生門',gong:locateDoor(chart.baMen,'生門')};
 if(p==='事業')return {label:'事業用神・開門',gong:locateDoor(chart.baMen,'開門')};
 if(p==='感情')return {label:'感情用神・六合',gong:locateGod(chart.baShen,'六合')||locateDoor(chart.baMen,'休門')};
 if(p==='學業')return {label:'學業用神・天輔',gong:locateStar(chart.jiuXing,'天輔')||locateDoor(chart.baMen,'景門')};
 if(p==='出行')return {label:'出行用神・九天',gong:locateGod(chart.baShen,'九天')||locateDoor(chart.baMen,'開門')};
 if(p==='健康')return {label:'健康觀察・天芮',gong:locateStar(chart.jiuXing,'天芮')};
 return {label:'問事用神・時干',gong:locateStem(chart.tianPan,chart.pillars.time[0],chart.xun,chart.zhiFuLuoGong)};
}
function localParts(v){
 const [d,t]=v.split('T'),[y,m,day]=d.split('-').map(Number),[h,mi]=t.split(':').map(Number);
 return {y,m,day,h,mi};
}
function setNow(){
 const d=new Date(),z=n=>String(n).padStart(2,'0');
 $('#dt').value=`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}
function buildChart(lunar){
 const pillars={
  year:lunar.getYearInGanZhi(),
  month:lunar.getMonthInGanZhi(),
  day:lunar.getDayInGanZhi(),
  time:lunar.getTimeInGanZhi()
 };
 const ju=getJu(lunar);
 const diPan=getDiPan(ju.type,ju.number);
 const xun=xunShou(pillars.time);
 const tp=distributeTianPan(diPan,xun,pillars.time[0],ju.type);
 const xing=distributeJiuXing(diPan,xun,pillars.time[0]);
 const men=distributeBaMen(xing.zhiFuYuanGong,pillars.time,ju.type);
 const shen=distributeBaShen(xing.zhiFuLuoGong,ju.type);
 const kong=getKongWang(pillars.time);
 const yima=getYiMa(pillars.time);
 return {
  pillars,ju,diPan,xun,tianPan:tp.tianPan,
  jiuXing:xing.jiuXing,zhiFuXing:xing.zhiFuXing,
  zhiFuYuanGong:xing.zhiFuYuanGong,zhiFuLuoGong:xing.zhiFuLuoGong,
  baMen:men.baMen,zhiShiMen:men.zhiShiMen,zhiShiGong:men.zhiShiGong,zhiShiGongRaw:men.zhiShiGongRaw,
  baShen:shen,kong,yima
 };
}
function badges(g,c,focus){
 const b=[];
 if(g===c.zhiFuLuoGong)b.push('<i class="badge gold">值符</i>');
 if(g===c.zhiShiGong)b.push('<i class="badge jade">值使</i>');
 if(c.kong.palaces.includes(g))b.push('<i class="badge dim">空亡</i>');
 if(g===c.yima.gong)b.push('<i class="badge blue">驛馬</i>');
 if(focus?.gong===g)b.push('<i class="badge focusb">用神</i>');
 return b.join('');
}
function renderPalace(g,c,focus){
 const p=GONG[g];
 if(g==='5'){
   return `<div class="gong center"><span class="gong-no">5宮</span><div class="dir">中宮</div><div class="palace-name">中宮 · 土</div><div class="center-core">中</div><div class="stems"><span>天 ${esc(c.tianPan[g]||'—')}</span><span>地 ${esc(c.diPan[g]||'—')}</span></div></div>`;
 }
 const door=c.baMen[g],star=c.jiuXing[g],god=c.baShen[g],tone=MEN[door]?.tone||'';
 const classes=['gong',tone];
 if(g===c.zhiFuLuoGong)classes.push('zhifu');
 if(g===c.zhiShiGong)classes.push('zhishi');
 if(c.kong.palaces.includes(g))classes.push('kong');
 if(g===c.yima.gong)classes.push('yima');
 if(focus?.gong===g)classes.push('focus');
 return `<div class="${classes.join(' ')}">
  <span class="gong-no">${g}宮</span>
  <div class="dir">${p.dir}</div>
  <div class="palace-name">${p.name}宮 · ${p.el}</div>
  <div class="marks">${badges(g,c,focus)}</div>
  <div class="layer god"><span>神</span><b>${esc(god||'—')}</b></div>
  <div class="layer star"><span>星</span><b>${esc(star||'—')}</b></div>
  <div class="layer door"><span>門</span><b>${esc(door||'—')}</b></div>
  <div class="stems"><span>天 ${esc(c.tianPan[g]||'—')}</span><span>地 ${esc(c.diPan[g]||'—')}</span></div>
 </div>`;
}
function palaceReading(g,c,focus){
 if(!g||!GONG[g])return '沒有可用宮位。';
 const door=c.baMen[g],star=c.jiuXing[g],god=c.baShen[g],p=GONG[g];
 const arr=[];
 arr.push(`<b>${esc(focus.label)}：${p.name}宮・${p.dir}</b>`);
 if(door)arr.push(`八門為 <strong>${door}</strong>（${MEN[door].brief}）。${MEN[door].use}`);
 if(star)arr.push(`九星為 <strong>${star}</strong>：${XING[star]?.brief||'依宮象判讀'}。`);
 if(god)arr.push(`八神為 <strong>${god}</strong>：${SHEN[god]?.brief||'依神象判讀'}。`);
 if(c.kong.palaces.includes(g))arr.push('此宮同時落空亡；傳統取象常解作力量打折、事情未實或需要等待條件補足。');
 if(g===c.yima.gong)arr.push(`此宮逢驛馬（${c.yima.branch}），取象偏向移動、變化、奔波或加速。`);
 return arr.join('<br>');
}
function render(c){
 const purpose=$('#purpose').value;
 const focus=focusForPurpose(purpose,c);
 $('#palace').innerHTML=DISPLAY.map(g=>renderPalace(g,c,focus)).join('');
 $('#jieqi').textContent=c.ju.jieqi;
 $('#ju').textContent=(c.ju.type==='yang'?'陽遁':'陰遁')+c.ju.number+'局';
 $('#yuan').textContent=c.ju.yuan;
 $('#zhifu').textContent=c.zhiFuXing;
 $('#zhishi').textContent=c.zhiShiMen;
 $('#xun').textContent=c.xun;
 $('#kong').textContent=c.kong.branches.join('、');
 $('#yima').textContent=c.yima.branch;
 $('#pillars').innerHTML=`<b>四柱</b><div class="pillars"><span>年 ${c.pillars.year}</span><span>月 ${c.pillars.month}</span><span>日 ${c.pillars.day}</span><span>時 ${c.pillars.time}</span></div>
 <div class="subline">符頭 ${c.ju.fuTou} · 旬首六儀 ${c.xun} · 值符原宮 ${GONG[c.zhiFuYuanGong].name} · 值符落宮 ${GONG[c.zhiFuLuoGong].name}</div>`;
 $('#focusTitle').textContent=focus.label;
 $('#focusGong').textContent=focus.gong?`${GONG[focus.gong].name}宮 · ${GONG[focus.gong].dir}`:'—';
 $('#reading').innerHTML=palaceReading(focus.gong,c,focus);
 const q=$('#question').value.trim();
 $('#questionEcho').innerHTML=q?`<b>問事：</b>${esc(q)}`:'<b>問事：</b>未輸入，先以所選主題取用神。';
 window.GODWAY_QIMEN_LAST=c;
}
function calculate(){
 if(typeof Solar==='undefined'){
   $('#reading').innerHTML='<b>曆法核心尚未載入。</b><br>請確認網路後重新整理；首次載入需要取得 lunar-javascript。';
   return;
 }
 const v=$('#dt').value;if(!v)return;
 const p=localParts(v);
 try{
   const lunar=Solar.fromYmdHms(p.y,p.m,p.day,p.h,p.mi,0).getLunar();
   render(buildChart(lunar));
 }catch(e){
   console.error(e);
   $('#reading').textContent='排盤失敗，請重新選擇日期時間。';
 }
}
function bind(){
 $('#nowBtn').addEventListener('click',()=>{setNow();calculate()});
 $('#calcBtn').addEventListener('click',calculate);
 $('#purpose').addEventListener('change',calculate);
 $('#question').addEventListener('input',()=>{if(window.GODWAY_QIMEN_LAST)render(window.GODWAY_QIMEN_LAST)});
 setNow();
 let tries=0;
 const t=setInterval(()=>{
  tries++;
  if(typeof Solar!=='undefined'){clearInterval(t);calculate()}
  else if(tries>20){clearInterval(t);calculate()}
 },150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
window.GODWAY_QIMEN={version:VERSION,calculate};
})();