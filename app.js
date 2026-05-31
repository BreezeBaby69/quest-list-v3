function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(`sc-${name}`).classList.add('active');
  document.querySelector(`[data-sc="${name}"]`).classList.add('active');
  if(name==='quests') renderQuestList();
  if(name==='calendar'){renderCal();if(calSelected)renderCalDetail(calSelected);}
  if(name==='hero'){
    setTimeout(()=>{
      initCanvas();
      resizeCanvas();
      renderBattle();
      // Force immediate first frame so screen is never black
      if(_spritesReady&&SPRITE_CANVASES.heroes&&battleCtx&&battleCanvas&&battleCanvas.width>0){
        const bgKey=(state.battle&&state.battle.bgKey)||'plains';
        drawBackground(battleCtx,bgKey,0);
        const gndY=Math.round(LOGI_H*0.76);
        const hs=LOGI_H/280;
        const ms=LOGI_H/220;
        drawSpriteActor(battleCtx,'orin',Math.round(LOGI_W*0.16),gndY,hs,hs);
        drawSpriteActor(battleCtx,'wife',Math.round(LOGI_W*0.30),gndY,hs,hs);
        if(state.battle&&state.battle.monsterId!==undefined){
          const m=MONSTERS[state.battle.monsterId];
          if(m){
            const msc=(m.tier==='megaboss'?1.3:m.tier==='miniboss'?1.1:0.9)*ms;
            drawSpriteActor(battleCtx,'monster',Math.round(LOGI_W*0.75),gndY,msc,msc);
          }
        }
      }
    },30);
  }
}

function renderAll(){
  updateXPDisplay();
  renderQuestList();
  const heroScr=document.getElementById('sc-hero');
  if(heroScr&&heroScr.classList.contains('active')) renderBattle();
  if(document.getElementById('sc-calendar')&&document.getElementById('sc-calendar').classList.contains('active')) renderCal();
}

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// =============================================
// INIT
// =============================================
initCal();
const _td=new Date();
const _todayVal=`${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`;
document.getElementById('inp-date').value=_todayVal;
loadState(); // connects Firebase, then calls renderAll() + startBattleLoop()

let _lastT=0;
document.addEventListener('touchend',e=>{const n=Date.now();if(n-_lastT<300)e.preventDefault();_lastT=n;},{passive:false});

</script>
</body>