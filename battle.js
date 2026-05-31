function initCanvas(){
  const cvs=document.getElementById('battle-canvas');
  if(!cvs) return;
  battleCanvas=cvs;
  battleCtx=battleCanvas.getContext('2d');
  if(!battleCtx) return;
  window.removeEventListener('resize',resizeCanvas);
  window.addEventListener('resize',resizeCanvas);
  resizeCanvas();
  // Force immediate test draw so we know canvas is alive
  battleCtx.fillStyle='#050510';
  battleCtx.fillRect(0,0,LOGI_W,LOGI_H);
}
function resizeCanvas(){
  if(!battleCanvas) return;
  const wrap=document.getElementById('battle-canvas-wrap');
  if(!wrap) return;
  const w=wrap.clientWidth||window.innerWidth||320;
  // Calculate available height = window minus hdr, xp-panel, nav
  const hdr=document.querySelector('.hdr');
  const xpPanel=document.querySelector('.xp-panel');
  const nav=document.querySelector('.nav');
  const usedH=(hdr?hdr.offsetHeight:40)+(xpPanel?xpPanel.offsetHeight:30)+(nav?nav.offsetHeight:50);
  // Cap height so canvas doesn't get too tall on portrait phones
  const availH=window.innerHeight - usedH;
  const maxH=Math.round(w * 1.4); // max 1.4:1 ratio
  const h=Math.max(200, Math.min(availH, maxH));
  wrap.style.height=h+'px';
  battleCanvas.width=LOGI_W;
  battleCanvas.height=LOGI_H;
  battleCanvas.style.width=w+'px';
  battleCanvas.style.height=h+'px';
}

// Pixel-art rect helper (logical coords → canvas pixels)
function pr(ctx,x,y,w,h,col,S=2){
  ctx.fillStyle=col;
  ctx.fillRect(x*S,y*S,w*S,h*S);
}

// ── BACKGROUND ───────────────────────────────────────────────────────────────
function drawBackground(ctx,bgKey,dt){
  _bgScrollX=(_bgScrollX+dt*18)%(LOGI_W*2);
  const pal=BG_PALETTES[bgKey]||BG_PALETTES.plains;
  const W=LOGI_W,H=LOGI_H;

  // Sky gradient
  const grad=ctx.createLinearGradient(0,0,0,H*0.76);
  grad.addColorStop(0,pal.skyTop);
  grad.addColorStop(1,pal.skyBot);
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,W,Math.round(H*0.76));

  // Stars for dark scenes
  if(['void','heaven','castle','dungeon'].includes(bgKey)){
    ctx.fillStyle='#ffffff';
    for(let i=0;i<28;i++){
      const sx=((i*53+Math.floor(_bgScrollX/5))%W);
      const sy=(i*31+i*7)%150;
      ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);
    }
  }

  // Volcano lava glow
  if(bgKey==='volcano'){
    for(let i=0;i<4;i++){
      const gx=((i*85+Math.floor(_bgScrollX/3))%W);
      ctx.fillStyle=`rgba(255,${50+i*20},0,0.14)`;
      ctx.beginPath();ctx.arc(gx,370,20+i*8,0,Math.PI*2);ctx.fill();
    }
  }

  // Heaven glow
  if(bgKey==='heaven'){
    ctx.fillStyle='rgba(180,100,255,0.06)';
    ctx.fillRect(0,60,W,80);
  }

  // Mid-ground scrolling (parallax ÷ 2)
  const mgX=Math.floor(_bgScrollX/2);
  if(bgKey==='plains'){
    for(let i=0;i<5;i++){
      const tx=((i*152+mgX)%(W+80))-40;
      ctx.fillStyle='#3d2010';ctx.fillRect(tx+8,Math.round(H*0.72),5,Math.round(H*0.14));
      ctx.fillStyle='#1a4a1a';ctx.fillRect(tx,Math.round(H*0.60),22,Math.round(H*0.15));
      ctx.fillStyle='#2a6a2a';ctx.fillRect(tx+4,Math.round(H*0.54),14,Math.round(H*0.10));
    }
  } else if(bgKey==='dungeon'){
    const now=Date.now();
    for(let i=0;i<5;i++){
      const tx=((i*130+mgX)%(W+40))-20;
      const ty=Math.round(H*0.6);
      ctx.fillStyle='#6a4020';ctx.fillRect(tx,ty,4,14);
      ctx.fillStyle=Math.sin(now/180+i)>0?'#ff8800':'#ffaa00';
      ctx.fillRect(tx-2,ty-8,8,10);
      ctx.fillStyle='rgba(255,130,0,0.1)';ctx.fillRect(tx-8,ty-16,18,22);
    }
  } else if(bgKey==='castle'){
    for(let i=0;i<6;i++){
      const tx=((i*112+mgX)%(W+40))-20;
      const ty=Math.round(H*0.5);
      ctx.fillStyle='#201830';ctx.fillRect(tx,ty,10,Math.round(H*0.2));
      ctx.fillStyle='#160c22';ctx.fillRect(tx-2,ty-8,14,12);
      ctx.fillStyle='rgba(180,100,255,0.08)';ctx.fillRect(tx,ty-8,10,8);
    }
  } else if(bgKey==='volcano'){
    for(let i=0;i<3;i++){
      const tx=((i*220+mgX)%(W+100))-50;
      const ty=Math.round(H*0.52);
      ctx.fillStyle='#2a0800';ctx.fillRect(tx,ty,32,Math.round(H*0.3));
      ctx.fillStyle='#180400';ctx.fillRect(tx+6,ty-8,20,16);
    }
  }

  // Ground
  const gY=Math.round(H*0.76);
  const gGrad=ctx.createLinearGradient(0,gY,0,H);
  gGrad.addColorStop(0,pal.groundTop);
  gGrad.addColorStop(1,pal.groundBot);
  ctx.fillStyle=gGrad;
  ctx.fillRect(0,gY,W,H-gY);

  // Ground edge
  ctx.fillStyle=pal.accent;
  ctx.fillRect(0,gY,W,4);

  // Scrolling ground tiles (foreground, parallax ×1.6)
  const fgX=Math.floor(_bgScrollX*1.6);
  ctx.fillStyle=pal.accent;
  for(let i=0;i<9;i++){
    const tx=((i*80+fgX)%(W+80))-40;
    ctx.fillRect(tx,gY+4,40,4);
  }
}

// ── ORIN SPRITE ───────────────────────────────────────────────────────────────
const SKIN='#f5c09a', SKIN_SH='#d4956a', HAIR_O='#3d1a00', HAIR_W='#e0a0c8', EY='#101028', WH='#ffffff';

function drawOrin(ctx,cx,cy,cls,frame,S=2){
  const C=cls.bodyColor,A=cls.accent,W=cls.weaponColor;
  const bobY=(frame===1)?1:0;

  // Ground shadow
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.fillRect((cx-11)*S,(cy+28)*S,22*S,3*S);

  // Cape (hero+)
  if(cls.capeColor){
    pr(ctx,cx+4,cy+10+bobY,3,11,cls.capeColor,S);
    pr(ctx,cx+3,cy+18+bobY,4,4,cls.capeColor,S);
  }

  // Sword (idle = held at side)
  if(frame!==2){
    pr(ctx,cx-8,cy+6+bobY,2,13,W,S);
    pr(ctx,cx-10,cy+9+bobY,6,2,W,S);
    pr(ctx,cx-8,cy+18+bobY,2,3,'#8B5E3C',S);
  }

  // Legs
  pr(ctx,cx-5,cy+20+bobY,4,8,C,S);
  pr(ctx,cx+1,cy+20+bobY,4,8,C,S);
  // Boots
  pr(ctx,cx-6,cy+27+bobY,5,3,A,S);
  pr(ctx,cx+1,cy+27+bobY,5,3,A,S);

  // Torso
  pr(ctx,cx-6,cy+10+bobY,12,12,C,S);
  pr(ctx,cx-4,cy+12+bobY,8,2,A,S); // belt

  // Shield (warrior+)
  if(cls.level>=7){
    pr(ctx,cx-12,cy+10+bobY,2,11,'#6080a8',S);
    pr(ctx,cx-14,cy+11+bobY,2,9,'#304864',S);
  }

  // Arms
  pr(ctx,cx-8,cy+11+bobY,2,8,SKIN,S);
  pr(ctx,cx+6,cy+11+bobY,2,8,SKIN,S);

  // Neck
  pr(ctx,cx-2,cy+8+bobY,4,3,SKIN,S);

  // Head
  pr(ctx,cx-5,cy+1+bobY,10,9,SKIN,S);
  pr(ctx,cx-3,cy+6+bobY,2,2,SKIN_SH,S); // jaw shadow

  // Hair
  pr(ctx,cx-5,cy+bobY,10,3,HAIR_O,S);
  pr(ctx,cx-5,cy+1+bobY,2,4,HAIR_O,S);
  pr(ctx,cx+3,cy+1+bobY,2,3,HAIR_O,S);

  // Eyes
  pr(ctx,cx-3,cy+4+bobY,2,2,EY,S);
  pr(ctx,cx+1,cy+4+bobY,2,2,EY,S);
  if(frame!==3){
    pr(ctx,cx-3,cy+4+bobY,1,1,WH,S);
    pr(ctx,cx+1,cy+4+bobY,1,1,WH,S);
  }

  // Helmet (warrior+)
  if(cls.level>=7){
    pr(ctx,cx-5,cy-1+bobY,10,3,A,S);
    pr(ctx,cx-6,cy+bobY,12,2,C,S);
    if(cls.level>=13){pr(ctx,cx-1,cy-3+bobY,2,3,W,S);} // crest
  }

  // Attack pose — sword thrust forward
  if(frame===2){
    pr(ctx,cx+5,cy+6,2,15,W,S);
    pr(ctx,cx+3,cy+7,7,2,W,S);
    pr(ctx,cx+5,cy+20,2,3,'#8B5E3C',S);
    // Slash arc
    ctx.fillStyle='rgba(180,180,255,0.55)';
    for(let i=0;i<4;i++) ctx.fillRect((cx+9+i*3)*S,(cy+4+i*2)*S,4,6);
  }

  // Hurt tint
  if(frame===3){
    ctx.fillStyle='rgba(255,0,0,0.28)';
    ctx.fillRect((cx-8)*S,(cy)*S,16*S,30*S);
  }

  // Level badge glow for demigod
  if(cls.level>=16){
    ctx.fillStyle='rgba(200,100,255,0.12)';
    ctx.beginPath();ctx.arc(cx*S,(cy+12)*S,18*S,0,Math.PI*2);ctx.fill();
  }
}

// ── WIFE SPRITE ───────────────────────────────────────────────────────────────
function drawWife(ctx,cx,cy,cls,frame,S=2){
  const C=cls.bodyColor,A=cls.accent,W=cls.weaponColor;
  const bobY=(frame===1)?1:0;

  // Ground shadow
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.fillRect((cx-10)*S,(cy+28)*S,20*S,3*S);

  // Staff / wand (right side, idle)
  if(frame!==2){
    pr(ctx,cx+7,cy+1+bobY,2,24,W,S);
    pr(ctx,cx+5,cy+bobY,5,3,A,S);   // orb
    pr(ctx,cx+6,cy-2+bobY,4,3,W,S); // orb tip
    ctx.fillStyle='rgba(220,120,255,0.35)';
    ctx.fillRect((cx+4)*S,(cy-3)*S,8*S,8*S);
  }

  // Dress skirt
  pr(ctx,cx-7,cy+17+bobY,14,13,'#300050',S);
  pr(ctx,cx-8,cy+20+bobY,16,4,C,S);
  pr(ctx,cx-6,cy+18+bobY,12,2,A,S); // trim

  // Dress bodice
  pr(ctx,cx-5,cy+9+bobY,10,10,C,S);
  pr(ctx,cx-4,cy+11+bobY,8,2,A,S);

  // Arms
  pr(ctx,cx-7,cy+10+bobY,2,8,SKIN,S);
  pr(ctx,cx+5,cy+10+bobY,2,8,SKIN,S);

  // Neck
  pr(ctx,cx-2,cy+7+bobY,4,3,SKIN,S);

  // Head
  pr(ctx,cx-4,cy+1+bobY,9,9,SKIN,S);
  pr(ctx,cx-2,cy+6+bobY,2,2,SKIN_SH,S);

  // Hair
  pr(ctx,cx-5,cy+bobY,11,3,HAIR_W,S);
  pr(ctx,cx-5,cy+1+bobY,2,7,HAIR_W,S);
  pr(ctx,cx+4,cy+1+bobY,2,6,HAIR_W,S);
  pr(ctx,cx-3,cy+9+bobY,2,4,HAIR_W,S);

  // Eyes
  pr(ctx,cx-2,cy+4+bobY,2,2,EY,S);
  pr(ctx,cx+1,cy+4+bobY,2,2,EY,S);
  if(frame!==3){
    pr(ctx,cx-2,cy+4+bobY,1,1,WH,S);
    pr(ctx,cx+1,cy+4+bobY,1,1,'#ffccff',S);
  }

  // Crown (princess+)
  if(cls.crownColor){
    const cc=cls.crownColor;
    pr(ctx,cx-5,cy-1+bobY,10,3,cc,S);
    pr(ctx,cx-3,cy-4+bobY,2,3,cc,S);
    pr(ctx,cx+1,cy-4+bobY,2,3,cc,S);
    pr(ctx,cx-1,cy-5+bobY,2,5,cc,S);
    // Jewel
    pr(ctx,cx-1,cy-5+bobY,2,2,W,S);
  }

  // Attack — staff blast
  if(frame===2){
    pr(ctx,cx-9,cy+3,2,22,W,S);
    pr(ctx,cx-10,cy+2,5,3,A,S);
    ctx.fillStyle='rgba(200,80,255,0.55)';
    for(let i=0;i<5;i++) ctx.fillRect((cx-14-i*4)*S,(cy+3+i*2)*S,6,6);
  }

  if(frame===3){
    ctx.fillStyle='rgba(255,0,0,0.25)';
    ctx.fillRect((cx-8)*S,(cy)*S,16*S,30*S);
  }

  // Goddess aura
  if(cls.level>=16){
    ctx.fillStyle='rgba(100,200,255,0.1)';
    ctx.beginPath();ctx.arc(cx*S,(cy+12)*S,18*S,0,Math.PI*2);ctx.fill();
  }
}

// ── MONSTER SPRITE ────────────────────────────────────────────────────────────
function drawMonster(ctx,cx,cy,monster,frame,S=2){
  const C=monster.bodyColor,E=monster.eyeColor,AC=monster.accentColor,W=monster.weaponColor;
  const isMega=monster.tier==='megaboss', isMini=monster.tier==='miniboss';
  const sc=isMega?1.5:isMini?1.2:1.0;
  const bobY=(frame===1)?-1:0;

  function r(x,y,w,h,col){
    ctx.fillStyle=col;
    const rx=Math.round((cx+x*sc)*S);
    const ry=Math.round((cy+y*sc)*S);
    const rw=Math.max(1,Math.round(w*sc*S));
    const rh=Math.max(1,Math.round(h*sc*S));
    // Clip to canvas
    if(rx+rw<0||ry+rh<0||rx>LOGI_W*S||ry>LOGI_H*S) return;
    ctx.fillRect(rx,ry,rw,rh);
  }

  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.fillRect(Math.round((cx-14*sc)*S),Math.round((cy+29*sc)*S),Math.round(28*sc*S),Math.round(4*sc*S));

  // Mega aura
  if(isMega){
    ctx.fillStyle='rgba(200,0,0,0.07)';
    for(let ri=0;ri<3;ri++){
      ctx.beginPath();
      ctx.arc(cx*S,(cy+12)*S,(22+ri*10)*sc*S,0,Math.PI*2);
      ctx.fill();
    }
  }

  // Body
  r(-10,8+bobY,20,20,C);
  r(-8,10+bobY,16,17,AC);

  // Head
  r(-9,-2+bobY,18,12,C);
  r(-11,1+bobY,22,7,C);

  // Horns
  if(isMega||isMini){
    r(-9,-11+bobY,4,10,AC);
    r(5,-11+bobY,4,10,AC);
    r(-10,-12+bobY,5,3,W);
    r(5,-12+bobY,5,3,W);
  } else {
    r(-6,-7+bobY,3,6,AC);
    r(3,-7+bobY,3,6,AC);
  }

  // Eyes
  r(-5,0+bobY,5,5,E);
  r(0,0+bobY,5,5,E);
  r(-4,1+bobY,2,2,'#000');
  r(2,1+bobY,2,2,'#000');
  // Eye glow
  ctx.fillStyle='rgba(255,255,0,0.4)';
  ctx.fillRect(Math.round((cx-4*sc)*S),Math.round((cy+1*sc)*S),Math.round(2*sc*S),Math.round(2*sc*S));

  // Arms / claws
  r(-15,10+bobY,5,13,C);
  r(10,10+bobY,5,13,C);
  r(-17,19+bobY,5,5,AC);
  r(12,19+bobY,5,5,AC);

  // Legs
  r(-9,26+bobY,7,6,C);
  r(2,26+bobY,7,6,C);
  r(-10,30+bobY,8,3,AC);
  r(2,30+bobY,8,3,AC);

  // Boss weapon (mini+)
  if(isMini||isMega){
    r(13,3+bobY,3,20,W);
    r(10,2+bobY,8,3,W);
  }

  // Attack — lunge particles left
  if(frame===2){
    ctx.fillStyle='rgba(255,60,0,0.45)';
    for(let i=0;i<5;i++) ctx.fillRect(Math.round((cx-18-i*5)*S),Math.round((cy+8+i*3)*S),7,7);
  }

  // Hurt flash
  if(frame===3){
    ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.fillRect(Math.round((cx-14*sc)*S),Math.round((cy-12*sc)*S),Math.round(28*sc*S),Math.round(45*sc*S));
  }
}

// ============================================================
// BATTLE LOOP
// ============================================================
function startBattleLoop(){
  if(_battleRAF) cancelAnimationFrame(_battleRAF);
  initCanvas();
  resizeCanvas();
  _lastFrameTime=performance.now();

  function loop(now){
    _battleRAF=requestAnimationFrame(loop);
    if(!battleCtx||!battleCanvas) return;
    const dt=Math.min((now-_lastFrameTime)/1000,0.1);
    _lastFrameTime=now;
    tickSpriteAnims(dt);
    tickAnims(dt);
    const heroScr=document.getElementById('sc-hero');
    if(heroScr&&heroScr.classList.contains('active')){
      if(!battleCanvas.width||battleCanvas.width===0) resizeCanvas();
      drawFrame(dt);
    }
    processQueue();
  }
  _battleRAF=requestAnimationFrame(loop);
}

function tickAnims(dt){
  // Shake timer only — sprite animations handled by tickSpriteAnims
  if(_shakeTimer>0) _shakeTimer-=dt;
}

function drawFrame(dt){
  const ctx=battleCtx;
  ctx.clearRect(0,0,LOGI_W,LOGI_H);
  const bgKey=(state.battle&&state.battle.bgKey)||'plains';
  drawBackground(ctx,bgKey,dt);

  const gndY = Math.round(LOGI_H * 0.76);
  // Heroes: 128px tall in sheet → scale to ~200px on 480px canvas
  const heroScale = LOGI_H / 307;
  // Boss: 128px tall in sheet → scale to ~220px on 480px canvas
  const monScale  = LOGI_H / 280;

  // Draw heroes using sprite sheets
  if(_spritesReady && SPRITE_CANVASES.heroes){
    drawSpriteActor(ctx,'orin', Math.round(LOGI_W*0.16), gndY, heroScale, heroScale);
    drawSpriteActor(ctx,'wife', Math.round(LOGI_W*0.30), gndY, heroScale, heroScale);
  } else {
    // Fallback to pixel art while sprites load
    const oLvl=getLevel(state.xp.orin),wLvl=getLevel(state.xp.wife);
    const heroFeetY=Math.round(gndY/2)-32;
    drawOrin(ctx,38,heroFeetY,getHeroClass('orin',oLvl),0);
    drawWife(ctx,78,heroFeetY+2,getHeroClass('wife',wLvl),0);
  }

  // Draw monster using sprite sheet
  if(state.battle && state.battle.monsterId !== undefined){
    const m = MONSTERS[state.battle.monsterId];
    if(m){
      const msc=(m.tier==='megaboss'?1.3:m.tier==='miniboss'?1.1:0.9)*monScale;
      if(_spritesReady && SPRITE_CANVASES.heroes){
        drawSpriteActor(ctx,'monster', Math.round(LOGI_W*0.75), gndY, -msc, msc);
      } else {
        const sc=m.tier==='megaboss'?1.5:m.tier==='miniboss'?1.2:1.0;
        const monsterFeetY=Math.round(gndY/2)-Math.round(32*sc);
        const mx=Math.min(Math.round(LOGI_W/2)-10,Math.round(LOGI_W/2)-Math.round(18*sc)-4);
        drawMonster(ctx,mx,monsterFeetY,m,_bossAnim.frame);
      }
    }
  }

  if(_shakeTimer>0){
    battleCanvas.style.transform=`translate(${Math.round(Math.random()*6-3)}px,${Math.round(Math.random()*4-2)}px)`;
  } else {
    battleCanvas.style.transform='';
  }
}

function processQueue(){
  const now=performance.now();
  const ready=_attackQueue.filter(a=>a.ts<=now);
  _attackQueue=_attackQueue.filter(a=>a.ts>now);
  ready.forEach(atk=>{
    // Hero attack animation
    const heroActor = atk.player;
    const animType = atk.isCrit ? 'critical' : 'attack';
    playAnim(heroActor, animType, ()=>playAnim(heroActor,'idle'));
    // Monster hurt animation
    setTimeout(()=>playAnim('monster','hurt',()=>playAnim('monster','idle')), 200);
    _shakeTimer=0.28;
    // Damage pop
    showDmgPop(atk.damage,atk.isCrit,atk.player);
    // Update HP
    if(state.battle){
      state.battle.monsterHp=Math.max(0,state.battle.monsterHp-atk.damage);
      save();
      updateBossHUD();
      if(state.battle.monsterHp<=0&&!_pendingDeath){
        _pendingDeath=true;
        setTimeout(()=>onMonsterDeath(),520);
      }
    }
  });
}

function showDmgPop(dmg,isCrit,player){
  const wrap=document.getElementById('battle-canvas-wrap');
  if(!wrap) return;
  const pop=document.createElement('div');
  pop.className='dmg-pop '+(isCrit?'crit':'normal')+' '+player+'-dmg';
  pop.textContent=(isCrit?'CRIT! ':'')+dmg;
  const W=wrap.clientWidth,H=wrap.clientHeight;
  pop.style.left=Math.round(W*0.52+Math.random()*40-20)+'px';
  pop.style.top= Math.round(H*0.3+Math.random()*20-10)+'px';
  wrap.appendChild(pop);
  setTimeout(()=>pop.remove(),1050);
}

// ============================================================
// ATTACK TRIGGER (called on quest completion)
// ============================================================
function triggerAttack(player,_xp){
  const lvl=getLevel(state.xp[player]);
  const base=Math.max(1,lvl*2+(lvl>4?Math.floor(lvl/2):0));
  const isCrit=Math.random()<0.15;
  let dmg=base+Math.floor(Math.random()*(lvl+2));
  if(isCrit) dmg=Math.floor(dmg*1.8);

  if(state.battle){
    state.battle.powerCharge=Math.min(100,(state.battle.powerCharge||0)+15);
    save();
    updatePowerBar();
  }

  // Navigate to battle screen first, then queue attack after transition settles
  showScreen('hero');
  const delay = player==='wife' ? 900 : 650; // give screen time to appear
  _attackQueue.push({player,damage:dmg,isCrit,ts:performance.now()+delay});
}

// ============================================================
// MONSTER DEATH
// ============================================================
function onMonsterDeath(){
  _pendingDeath=false;
  const m=MONSTERS[state.battle.monsterId];
  if(!m) return;

  const wrap=document.getElementById('battle-canvas-wrap');
  if(wrap){
    wrap.classList.add('victory-flash');
    setTimeout(()=>wrap.classList.remove('victory-flash'),750);
    spawnParticles(wrap,14);
  }

  // Award XP
  const xpGain=m.xpGive;
  const prevO=getLevel(state.xp.orin),prevW=getLevel(state.xp.wife);
  state.xp.orin+=xpGain;
  state.xp.wife+=xpGain;
  state.battle.regularsKilled=(state.battle.regularsKilled||0)+1;
  state.battle.totalKilled=(state.battle.totalKilled||0)+1;
  state.battle.powerCharge=Math.min(100,(state.battle.powerCharge||0)+20);

  // Class change check
  const newO=getLevel(state.xp.orin),newW=getLevel(state.xp.wife);
  const changes=[];
  if(getHeroClass('orin',newO).name!==getHeroClass('orin',prevO).name) changes.push({player:'orin',cls:getHeroClass('orin',newO)});
  if(getHeroClass('wife',newW).name!==getHeroClass('wife',prevW).name) changes.push({player:'wife',cls:getHeroClass('wife',newW)});

  spawnNextMonster();
  save();
  updateXPDisplay();
  updateBossHUD();
  updatePowerBar();

  if(changes.length>0) setTimeout(()=>showClassChange(changes[0].player,changes[0].cls),900);
}

function spawnNextMonster(){
  const killed=state.battle.regularsKilled||0;
  const total=state.battle.totalKilled||0;
  const avgLvl=(getLevel(state.xp.orin)+getLevel(state.xp.wife))/2;
  let pool;

  if(total>0&&total%9===0){
    pool=MONSTERS.filter(m=>m.tier==='megaboss');
  } else if(killed>0&&killed%3===0){
    pool=MONSTERS.filter(m=>m.tier==='miniboss');
  } else {
    pool=MONSTERS.filter(m=>m.tier==='regular');
    if(avgLvl<5)       pool=pool.slice(0,4);
    else if(avgLvl<9)  pool=pool.slice(2,7);
    else               pool=pool.slice(5);
    if(!pool.length)   pool=MONSTERS.filter(m=>m.tier==='regular');
  }

  const next=pool[Math.floor(Math.random()*pool.length)];
  const idx=MONSTERS.indexOf(next);
  state.battle.monsterId=idx;
  state.battle.monsterHp=next.hp;
  state.battle.monsterHpMax=next.hp;
  state.battle.bgKey=next.bgKey||'plains';

  if(next.tier!=='regular') setTimeout(()=>showBossIntro(next),400);

  // Reset monster animation to idle with correct sheet
  // For now all monsters use gargoyle sheet; future: map monsterId to sheet
  _animState.monster.sheet='boss';
  playAnim('monster','idle');
}

// ============================================================
// HUD UPDATES
// ============================================================
function updateBossHUD(){
  if(!state.battle) return;
  const m=MONSTERS[state.battle.monsterId];
  if(!m) return;
  const hp=state.battle.monsterHp,max=state.battle.monsterHpMax;
  const pct=Math.max(0,hp/max*100);
  const nEl=document.getElementById('boss-name-lbl');
  const tEl=document.getElementById('boss-hp-txt');
  const fEl=document.getElementById('boss-hp-fill');
  const bEl=document.getElementById('boss-tier-badge');
  if(nEl) nEl.textContent=m.name;
  if(tEl) tEl.textContent=`${hp} / ${max}`;
  if(fEl){fEl.style.width=pct+'%';fEl.className='boss-hp-fill'+(pct<25?' danger':'');}
  if(bEl){const tl={regular:'',miniboss:'⚠ MINI-BOSS',megaboss:'💀 MEGA BOSS'};bEl.textContent=tl[m.tier]||'';}
}

function updatePowerBar(){
  const f=document.getElementById('power-fill');
  if(!f||!state.battle) return;
  const p=state.battle.powerCharge||0;
  f.style.width=p+'%';
  f.className='power-fill'+(p>=100?' full':'');
}

function updateHeroHUD(){
  ['orin','wife'].forEach(p=>{
    const xp=state.xp[p],lvl=getLevel(xp);
    const pct=Math.min(100,((xp-xpFloor(lvl))/(xpCeil(lvl)-xpFloor(lvl)))*100);
    const hf=document.getElementById(`${p}-xp-hud`);
    const cl=document.getElementById(`${p}-class-lbl`);
    const ll=document.getElementById(`${p}-lvl-hud`);
    if(hf) hf.style.width=pct+'%';
    if(cl) cl.textContent=getHeroClass(p,lvl).name;
    if(ll) ll.textContent='LVL '+lvl;
  });
}

// ============================================================
// CLASS CHANGE + BOSS INTRO
// ============================================================
function showClassChange(player,cls){
  const ov=document.getElementById('class-change-overlay');
  if(!ov) return;
  const hn=document.getElementById('cc-hero-name');
  const cn=document.getElementById('cc-class-name');
  const cv=document.getElementById('cc-canvas');
  if(hn){hn.className='cc-hero-name '+player;hn.textContent=player.toUpperCase();}
  if(cn) cn.textContent=cls.name;
  if(cv){
    const c2=cv.getContext('2d');c2.clearRect(0,0,96,96);
    if(player==='orin') drawOrin(c2,24,14,cls,0,3);
    else drawWife(c2,24,14,cls,0,3);
  }
  spawnParticles(document.body,22);
  ov.classList.add('show');
}
function closeClassChange(){
  const ov=document.getElementById('class-change-overlay');
  if(ov) ov.classList.remove('show');
}

function showBossIntro(monster){
  const ov=document.getElementById('boss-intro-overlay');
  if(!ov) return;
  const nn=document.getElementById('bi-boss-name');
  const tn=document.getElementById('bi-boss-tier');
  const cv=document.getElementById('bi-canvas');
  if(nn) nn.textContent=monster.name;
  if(tn) tn.textContent=monster.tier==='megaboss'?'💀 MEGA BOSS':'⚠ MINI-BOSS';
  if(cv){
    const c2=cv.getContext('2d');c2.clearRect(0,0,128,128);
    drawMonster(c2,64,85,monster,0,3);
  }
  ov.classList.add('show');
  setTimeout(()=>ov.classList.remove('show'),3500);
}

// ============================================================
// PARTICLES
// ============================================================
function spawnParticles(parent,count){
  const em=['⭐','💥','✨','🌟','⚡','💫','🔥','★','◆','▲'];
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const p=document.createElement('div');
      p.className='particle';
      const ang=Math.random()*360;
      const dist=70+Math.random()*130;
      p.style.setProperty('--tx',Math.cos(ang*Math.PI/180)*dist+'px');
      p.style.setProperty('--ty',Math.sin(ang*Math.PI/180)*dist+'px');
      p.style.left=(25+Math.random()*50)+'%';
      p.style.top=(15+Math.random()*40)+'%';
      p.textContent=em[Math.floor(Math.random()*em.length)];
      parent.appendChild(p);
      setTimeout(()=>p.remove(),950);
    },i*45);
  }
}

// ============================================================
// renderBattle + showScreen + renderAll
// ============================================================
function renderBattle(){
  if(!state.battle||state.battle.monsterId===undefined){
    state.battle={monsterId:0,monsterHp:35,monsterHpMax:35,regularsKilled:0,totalKilled:0,bgKey:'plains',powerCharge:0};
    save();
  }
  updateBossHUD();
  updateHeroHUD();
  updatePowerBar();
}

// =============================================