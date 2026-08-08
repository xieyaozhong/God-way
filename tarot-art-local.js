(()=>{
  const VERSION='5.5.1';
  const localSrc=id=>`./assets/tarot/${Number(id)}.jpg`;
  const fallbackSources=id=>[
    localSrc(id),
    `https://media.githubusercontent.com/media/yunruse/tarot/gh-pages/cards/color/${Number(id)}.jpg`,
    `https://github.com/yunruse/tarot/raw/refs/heads/gh-pages/cards/color/${Number(id)}.jpg`
  ];

  try{ cardSrc = localSrc; }catch(e){ window.cardSrc = localSrc; }

  function drawFallback(canvas,id){
    const ctx=canvas.getContext('2d');
    const name=(typeof deck!=='undefined'&&deck[id])?deck[id].name:`ARCANA ${id}`;
    const w=canvas.width,h=canvas.height;
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#e9dff0';ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#d7c3e2';
    for(let y=0;y<h;y+=8){for(let x=0;x<w;x+=8){if((x/8+y/8)%2===0)ctx.fillRect(x,y,8,8)}}
    ctx.strokeStyle='#72558b';ctx.lineWidth=3;ctx.strokeRect(4,4,w-8,h-8);
    ctx.fillStyle='#352442';ctx.textAlign='center';
    ctx.font='bold 10px monospace';ctx.fillText(`ARCANA ${String(id).padStart(2,'0')}`,w/2,h/2-8);
    ctx.font='bold 12px sans-serif';ctx.fillText(name,w/2,h/2+12);
  }

  function paintLocal(canvas){
    const id=+canvas.dataset.card;
    const sources=fallbackSources(id);
    let idx=0;
    const attempt=()=>{
      if(idx>=sources.length){
        drawFallback(canvas,id);
        const load=canvas.parentElement?.querySelector('.card-loading');
        if(load)load.remove();
        return;
      }
      const img=new Image();
      img.decoding='async';
      img.referrerPolicy='no-referrer';
      img.onload=()=>{
        const ctx=canvas.getContext('2d',{alpha:false});
        ctx.imageSmoothingEnabled=true;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        try{ctx.filter='saturate(1.16) contrast(1.08)'}catch(e){}
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        ctx.filter='none';
        const load=canvas.parentElement?.querySelector('.card-loading');
        if(load)load.remove();
      };
      img.onerror=()=>{idx++;attempt();};
      img.src=sources[idx];
    };
    attempt();
  }

  try{ paintCanvas = paintLocal; }catch(e){ window.paintCanvas = paintLocal; }
  window.GODWAY_TAROT_ART={version:VERSION,source:'local-pages-assets',license:'CC0'};
})();
