(()=>{
  const VERSION='5.5.2';
  const RWS_FILES=[
    'RWS_Tarot_00_Fool.jpg',
    'RWS_Tarot_01_Magician.jpg',
    'RWS_Tarot_02_High_Priestess.jpg',
    'RWS_Tarot_03_Empress.jpg',
    'RWS_Tarot_04_Emperor.jpg',
    'RWS_Tarot_05_Hierophant.jpg',
    'RWS_Tarot_06_Lovers.jpg',
    'RWS_Tarot_07_Chariot.jpg',
    'RWS_Tarot_08_Strength.jpg',
    'RWS_Tarot_09_Hermit.jpg',
    'RWS_Tarot_10_Wheel_of_Fortune.jpg',
    'RWS_Tarot_11_Justice.jpg',
    'RWS_Tarot_12_Hanged_Man.jpg',
    'RWS_Tarot_13_Death.jpg',
    'RWS_Tarot_14_Temperance.jpg',
    'RWS_Tarot_15_Devil.jpg',
    'RWS_Tarot_16_Tower.jpg',
    'RWS_Tarot_17_Star.jpg',
    'RWS_Tarot_18_Moon.jpg',
    'RWS_Tarot_19_Sun.jpg',
    'RWS_Tarot_20_Judgement.jpg',
    'RWS_Tarot_21_World.jpg'
  ];

  const commonsSrc=id=>{
    const file=RWS_FILES[Number(id)]||RWS_FILES[0];
    return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=512`;
  };
  const wikipediaSrc=id=>{
    const file=RWS_FILES[Number(id)]||RWS_FILES[0];
    return `https://en.wikipedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=512`;
  };
  const sources=id=>[commonsSrc(id),wikipediaSrc(id)];

  try{cardSrc=commonsSrc}catch(e){window.cardSrc=commonsSrc}

  const PALETTES=[
    ['#72c9e8','#f7d46b','#6c9b5e','#f7f1d0','#d85f72'],['#6e88d9','#f1d67b','#76583e','#faf0d5','#d84d68'],
    ['#253c78','#d5c5ef','#46365f','#f4e8d3','#90c9d4'],['#78a96e','#f0bf68','#8b5b48','#f8e5bd','#d45b7a'],
    ['#8e5d4a','#d8a24e','#654333','#efe0c7','#b74343'],['#7d75a8','#e9cf82','#5b516f','#f7ead1','#c25d7b'],
    ['#71b8d4','#f7d46a','#6da365','#f8e8cf','#df6583'],['#7da1d9','#e1bd61','#72604a','#f4e4c5','#c94d61'],
    ['#8fc3a1','#f2cc6c','#6f8757','#f7e7c5','#cc6d75'],['#273455','#d9bf71','#4a515c','#f2e8d2','#b58057'],
    ['#615197','#f1c75f','#574877','#f8e7c8','#d45a72'],['#84634d','#f1d089','#5d4b42','#f9ebd0','#c95a66'],
    ['#5f7198','#d2b879','#4e5369','#f3e6cf','#ae6d70'],['#26313d','#d9d6c7','#424a50','#f6eee0','#d54a4a'],
    ['#88b6c8','#e7c96e','#6a8e72','#f7ecd5','#c97871'],['#3d294f','#b85b62','#3b3046','#efe2cb','#d0a14e'],
    ['#27384f','#f3ce62','#4d4b53','#f0e6d3','#df5a4f'],['#31547a','#f4dc8c','#496f74','#f6ead5','#d66b82'],
    ['#2b3968','#e8dfb6','#444e72','#f0e7cf','#bd6f88'],['#69b9df','#f4d85f','#6ca762','#faedc8','#db756c'],
    ['#5578a6','#f1d782','#6b6e80','#f7ebd6','#d46a72'],['#4e7592','#e6c76e','#608876','#f8ead1','#c76582']
  ];

  function drawFallback(canvas,id){
    id=Number(id)||0;
    const ctx=canvas.getContext('2d',{alpha:false});
    const w=canvas.width,h=canvas.height,sx=w/64,sy=h/112;
    const p=PALETTES[id]||PALETTES[0];
    ctx.imageSmoothingEnabled=false;
    const R=(x,y,rw,rh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x*sx),Math.round(y*sy),Math.max(1,Math.round(rw*sx)),Math.max(1,Math.round(rh*sy)))};
    const L=(x1,y1,x2,y2,c,lw=1)=>{ctx.strokeStyle=c;ctx.lineWidth=Math.max(1,Math.round(lw*Math.min(sx,sy)));ctx.beginPath();ctx.moveTo(Math.round(x1*sx),Math.round(y1*sy));ctx.lineTo(Math.round(x2*sx),Math.round(y2*sy));ctx.stroke()};
    const D=(cx,cy,r,c)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)R(cx+x,cy+y,1,1,c)};
    const P=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach((pt,i)=>{const x=pt[0]*sx,y=pt[1]*sy;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill()};
    const person=(x,y,body='#f2e6c7',robe=p[4],scale=1)=>{D(x,y,3*scale,body);R(x-3*scale,y+3*scale,6*scale,13*scale,robe);L(x-2*scale,y+16*scale,x-5*scale,y+25*scale,robe,2);L(x+2*scale,y+16*scale,x+5*scale,y+25*scale,robe,2);L(x-3*scale,y+7*scale,x-8*scale,y+13*scale,robe,2);L(x+3*scale,y+7*scale,x+8*scale,y+13*scale,robe,2)};
    const star=(x,y,c=p[1])=>{R(x-1,y-4,3,9,c);R(x-4,y-1,9,3,c);R(x-2,y-2,5,5,c)};
    const sun=(x,y,r=7)=>{D(x,y,r,p[1]);for(let a=0;a<8;a++){const dx=Math.round(Math.cos(a*Math.PI/4)*(r+4)),dy=Math.round(Math.sin(a*Math.PI/4)*(r+4));R(x+dx,y+dy,2,2,p[1])}};
    const wheel=(x,y,r=15)=>{ctx.strokeStyle=p[1];ctx.lineWidth=Math.max(1,Math.round(2*sx));ctx.beginPath();ctx.arc(x*sx,y*sy,r*Math.min(sx,sy),0,Math.PI*2);ctx.stroke();for(let a=0;a<8;a++)L(x,y,x+Math.cos(a*Math.PI/4)*r,y+Math.sin(a*Math.PI/4)*r,p[1],1)};

    R(0,0,64,112,p[0]);
    for(let y=0;y<74;y+=4)R(0,y,64,2,y%8===0?p[0]:p[2]);
    for(let i=0;i<18;i++){const x=(i*19+id*7)%62+1,y=(i*13+id*11)%54+3;R(x,y,1+(i%3===0),1,p[3])}
    R(0,78,64,34,p[2]);R(0,84,64,28,p[2]);
    for(let x=0;x<64;x+=6)R(x,86+(x%12?3:0),4,1,p[1]);

    switch(id){
      case 0:sun(51,16,6);P([[42,78],[64,66],[64,112],[34,112]],'#6a5748');person(27,43,p[3],p[4],.9);L(33,49,38,28,'#6c4c37',2);D(18,68,3,'#f0efe2');R(17,71,5,4,'#f0efe2');break;
      case 1:person(32,31,p[3],p[4],1);L(37,38,42,15,p[1],2);R(16,59,32,6,'#7b4f39');R(20,55,5,4,p[1]);D(31,57,2,p[3]);R(38,54,5,5,'#7ec6a3');break;
      case 2:R(10,20,10,58,'#e9e1d0');R(44,20,10,58,'#252035');D(32,18,8,p[3]);person(32,39,p[3],p[4],1);R(25,59,14,10,'#d7c4de');break;
      case 3:sun(49,17,5);R(18,49,28,31,'#7b5544');person(32,32,p[3],p[4],1.1);for(let x=8;x<58;x+=8){R(x,82,2,8,p[1]);D(x+1,80,2,'#8fbf70')}break;
      case 4:R(15,42,34,38,'#6b4c43');R(18,35,28,10,'#866150');person(32,28,p[3],p[4],1.1);D(24,36,3,'#d5b06d');D(40,36,3,'#d5b06d');break;
      case 5:R(8,18,10,60,'#d9c9ad');R(46,18,10,60,'#d9c9ad');person(32,27,p[3],p[4],1);person(22,63,p[3],'#7890a5',.65);person(42,63,p[3],'#a87b77',.65);break;
      case 6:sun(32,13,6);person(22,56,p[3],'#d78379',.9);person(42,56,p[3],'#6e94b5',.9);P([[32,19],[23,31],[41,31]],p[3]);R(29,27,6,13,p[1]);break;
      case 7:R(14,55,36,23,'#806044');R(18,49,28,8,'#a88255');person(32,27,p[3],p[4],1);D(22,79,7,'#e4dbca');D(42,79,7,'#34303a');break;
      case 8:person(26,36,p[3],p[4],.9);D(42,58,8,'#c99551');R(35,62,14,10,'#c99551');L(30,48,39,55,p[3],2);break;
      case 9:P([[0,88],[30,42],[64,88]],'#4b5261');person(34,39,p[3],'#59616d',.9);R(23,47,5,7,p[1]);D(25,50,2,'#fff2ad');break;
      case 10:wheel(32,51,18);D(32,51,4,p[4]);star(32,20);star(12,35);star(52,67);break;
      case 11:person(32,32,p[3],p[4],1);L(41,42,46,19,p[3],2);L(18,47,18,64,p[1],1);L(10,54,26,54,p[1],1);L(10,54,7,62,p[1],1);L(26,54,29,62,p[1],1);break;
      case 12:R(10,18,44,5,'#6d513e');R(16,18,5,54,'#6d513e');R(43,18,5,54,'#6d513e');D(32,68,3,p[3]);R(29,49,6,17,p[4]);L(32,49,26,34,p[4],2);L(32,49,38,34,p[4],2);break;
      case 13:D(28,58,10,'#e7e2d7');R(17,61,28,15,'#e7e2d7');person(29,35,'#e6dfcf','#2a2c31',.9);L(38,43,48,21,'#7a563c',2);R(47,18,11,13,'#f1ece0');R(50,22,5,5,'#c84b4e');break;
      case 14:P([[17,39],[27,26],[31,44]],p[3]);P([[47,39],[37,26],[33,44]],p[3]);person(32,35,p[3],p[4],1);R(16,62,10,7,p[1]);R(39,68,10,7,p[1]);L(25,64,40,69,'#8fc5d0',3);break;
      case 15:D(32,23,6,'#4b2b3f');P([[26,18],[22,8],[30,15]],'#4b2b3f');P([[38,18],[42,8],[34,15]],'#4b2b3f');R(27,28,10,23,'#5a3046');person(18,65,p[3],'#9c6d71',.65);person(46,65,p[3],'#7b819b',.65);L(22,69,30,52,p[1],1);L(42,69,34,52,p[1],1);break;
      case 16:R(22,35,20,46,'#6f5a59');R(19,31,7,9,'#806669');R(38,31,7,9,'#806669');P([[53,8],[41,30],[48,31],[35,49]],p[1]);R(25,46,4,8,p[4]);R(35,58,4,8,p[4]);person(12,67,p[3],p[4],.55);person(52,56,p[3],'#7893a8',.55);break;
      case 17:for(let a=0;a<8;a++)star(32+Math.round(Math.cos(a*Math.PI/4)*18),20+Math.round(Math.sin(a*Math.PI/4)*12),a===0?p[1]:p[3]);star(32,18,p[1]);person(31,56,p[3],p[4],.8);L(23,69,10,82,'#78b8cf',3);L(39,69,54,82,'#78b8cf',3);break;
      case 18:D(32,19,10,p[3]);D(35,17,8,p[0]);R(7,47,11,32,'#6f5c65');R(46,47,11,32,'#6f5c65');P([[26,112],[32,61],[38,112]],'#d7bd7b');D(18,83,4,'#d3c5b6');D(46,83,4,'#746458');break;
      case 19:sun(32,17,10);R(7,70,7,13,'#7ca663');R(50,70,7,13,'#7ca663');for(let x of [10,53]){D(x,67,3,p[1])}D(34,66,9,'#eee5d6');R(21,69,26,12,'#eee5d6');person(32,45,p[3],p[4],.75);break;
      case 20:P([[32,10],[18,25],[46,25]],p[3]);R(27,19,10,15,p[1]);L(34,24,48,31,p[1],2);person(16,71,p[3],'#9b7b7d',.65);person(32,67,p[3],'#7895a8',.65);person(48,72,p[3],'#85806e',.65);R(7,87,50,4,'#78675f');break;
      case 21:ctx.strokeStyle=p[1];ctx.lineWidth=Math.max(2,Math.round(4*sx));ctx.beginPath();ctx.ellipse(32*sx,52*sy,19*sx,31*sy,0,0,Math.PI*2);ctx.stroke();person(32,38,p[3],p[4],.9);star(8,15);star(56,15);star(8,80);star(56,80);break;
    }

    ctx.strokeStyle='#efe4cf';ctx.lineWidth=Math.max(1,Math.round(2*Math.min(sx,sy)));ctx.strokeRect(Math.round(2*sx),Math.round(2*sy),Math.round(60*sx),Math.round(108*sy));
    const loading=canvas.parentElement?.querySelector('.card-loading');if(loading)loading.remove();
    canvas.dataset.artSource='built-in-pixel-fallback';
  }

  function paintPublicDomain(canvas){
    const id=+canvas.dataset.card;
    const list=sources(id);
    let idx=0;
    const attempt=()=>{
      if(idx>=list.length){drawFallback(canvas,id);return}
      const img=new Image();
      img.decoding='async';
      img.referrerPolicy='no-referrer';
      img.onload=()=>{
        if(!img.naturalWidth||img.naturalWidth<80){idx++;attempt();return}
        const ctx=canvas.getContext('2d',{alpha:false});
        ctx.imageSmoothingEnabled=true;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        try{ctx.filter='saturate(1.14) contrast(1.07)'}catch(e){}
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        ctx.filter='none';
        const loading=canvas.parentElement?.querySelector('.card-loading');if(loading)loading.remove();
        canvas.dataset.artSource='wikimedia-public-domain';
      };
      img.onerror=()=>{idx++;attempt()};
      img.src=list[idx];
    };
    attempt();
  }

  try{paintCanvas=paintPublicDomain}catch(e){window.paintCanvas=paintPublicDomain}

  try{
    const oldRender=render;
    render=function(){
      oldRender();
      const sub=document.querySelector('#spreadSub');
      if(sub)sub.textContent='公共領域 Rider–Waite–Smith 牌圖優先，瀏覽器即時像素化；來源失敗時自動切本機像素牌面。';
    };
  }catch(e){}

  const updateCredits=()=>{
    const edition=document.querySelector('.edition');
    if(edition)edition.textContent='PUBLIC DOMAIN RWS · PIXEL RENDER v3';
    const license=document.querySelector('.license');
    if(license)license.innerHTML='<b>牌圖來源</b><br>線上優先使用 Wikimedia Commons 收錄的公共領域 Rider–Waite–Smith 圖像，再於瀏覽器降解析成像素畫。若遠端圖像暫時無法取得，會自動使用本站內建的原創像素備援場景，不會再出現空白卡面。';
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateCredits,{once:true});else updateCredits();

  window.GODWAY_TAROT_ART={version:VERSION,source:'wikimedia-public-domain+local-pixel-fallback',license:'public-domain/fallback-original'};
})();
