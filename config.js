// CONFIG
// ============================================================
const XP_PER_TASK = 20;
const XP_LEVELS   = [0,80,200,380,620,920,1300,1770,2340,3020,4000,5200,6600,8200,10000];
const DAYS_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_ABR    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS      = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Class progressions — unlock by level
const ORIN_CLASSES = [
  {level:1,  name:'VILLAGER',  bodyColor:'#a0885a', accent:'#c8a870', weaponColor:'#8B5E3C', capeColor:null},
  {level:4,  name:'FIGHTER',   bodyColor:'#b05030', accent:'#d07050', weaponColor:'#bbbbbb', capeColor:null},
  {level:7,  name:'WARRIOR',   bodyColor:'#c03030', accent:'#e06060', weaponColor:'#dddddd', capeColor:'#802020'},
  {level:10, name:'HERO',      bodyColor:'#3050d0', accent:'#5070ff', weaponColor:'#00e8e8', capeColor:'#202080'},
  {level:13, name:'LEGEND',    bodyColor:'#b09000', accent:'#ffd700', weaponColor:'#ffd700', capeColor:'#806000'},
  {level:16, name:'DEMIGOD',   bodyColor:'#8030c0', accent:'#c060ff', weaponColor:'#e060ff', capeColor:'#401060'},
];
const WIFE_CLASSES = [
  {level:1,  name:'PEASANT GIRL', bodyColor:'#a06080', accent:'#c080a0', weaponColor:'#8B5E3C', crownColor:null},
  {level:4,  name:'LADY',         bodyColor:'#b05090', accent:'#d070b0', weaponColor:'#cc88ff', crownColor:null},
  {level:7,  name:'PRINCESS',     bodyColor:'#c030b0', accent:'#ff50e0', weaponColor:'#ff80ff', crownColor:'#ffd700'},
  {level:10, name:'QUEEN',        bodyColor:'#b09000', accent:'#ffd700', weaponColor:'#ffd700', crownColor:'#ffd700'},
  {level:13, name:'EMPRESS',      bodyColor:'#d03060', accent:'#ff5080', weaponColor:'#ff3050', crownColor:'#ff4060'},
  {level:16, name:'GODDESS',      bodyColor:'#50b0f0', accent:'#90d0ff', weaponColor:'#ffffff', crownColor:'#ffffff'},
];

function getHeroClass(player, level) {
  const arr = player === 'orin' ? ORIN_CLASSES : WIFE_CLASSES;
  let cls = arr[0];
  for (const c of arr) { if (level >= c.level) cls = c; else break; }
  return cls;
}

// Monsters
const MONSTERS = [
  // Tier 1 — regulars (early)
  {name:'GOBLIN SCOUT',   hp:35,  xpGive:12, tier:'regular', bgKey:'plains',
   bodyColor:'#3a6020', eyeColor:'#ffff00', accentColor:'#1a3a08', weaponColor:'#8B5E3C'},
  {name:'RAT KING',       hp:50,  xpGive:16, tier:'regular', bgKey:'plains',
   bodyColor:'#5a4030', eyeColor:'#ff0000', accentColor:'#3a2010', weaponColor:'#888888'},
  {name:'CAVE TROLL',     hp:70,  xpGive:22, tier:'regular', bgKey:'dungeon',
   bodyColor:'#507050', eyeColor:'#ff8800', accentColor:'#304030', weaponColor:'#aaaaaa'},
  {name:'DARK IMP',       hp:90,  xpGive:28, tier:'regular', bgKey:'dungeon',
   bodyColor:'#503060', eyeColor:'#ff00ff', accentColor:'#301840', weaponColor:'#666666'},
  // Tier 2 — regulars (mid)
  {name:'ORC WARRIOR',    hp:130, xpGive:40, tier:'regular', bgKey:'dungeon',
   bodyColor:'#305020', eyeColor:'#ff8800', accentColor:'#183010', weaponColor:'#888888'},
  {name:'BLOOD WOLF',     hp:160, xpGive:50, tier:'regular', bgKey:'volcano',
   bodyColor:'#602020', eyeColor:'#ff0000', accentColor:'#401010', weaponColor:'#cc0000'},
  {name:'DARK KNIGHT',    hp:200, xpGive:65, tier:'regular', bgKey:'castle',
   bodyColor:'#282838', eyeColor:'#ff00ff', accentColor:'#101018', weaponColor:'#aaaaaa'},
  // Mini-bosses
  {name:'LICH',           hp:300, xpGive:90, tier:'miniboss', bgKey:'dungeon',
   bodyColor:'#d0d0ff', eyeColor:'#0000ff', accentColor:'#8080cc', weaponColor:'#6600ff'},
  {name:'DEMON GENERAL',  hp:420, xpGive:130,tier:'miniboss', bgKey:'volcano',
   bodyColor:'#b02020', eyeColor:'#ffff00', accentColor:'#701010', weaponColor:'#ff8800'},
  {name:'SHADOW DRAGON',  hp:560, xpGive:170,tier:'miniboss', bgKey:'castle',
   bodyColor:'#202050', eyeColor:'#00ffff', accentColor:'#101030', weaponColor:'#00aaff'},
  // Tier 3 — regulars (late)
  {name:'WYVERN',         hp:280, xpGive:85, tier:'regular', bgKey:'volcano',
   bodyColor:'#a05010', eyeColor:'#ff4400', accentColor:'#702008', weaponColor:'#ff8800'},
  {name:'NECROMANCER',    hp:360, xpGive:110,tier:'regular', bgKey:'dungeon',
   bodyColor:'#4030a0', eyeColor:'#00ffff', accentColor:'#201860', weaponColor:'#00aaff'},
  // Mega-bosses
  {name:'DRAGON GOD',     hp:800, xpGive:250,tier:'megaboss', bgKey:'volcano',
   bodyColor:'#c00000', eyeColor:'#ffffff', accentColor:'#600000', weaponColor:'#ff8800'},
  {name:'VOID EMPEROR',   hp:1000,xpGive:320,tier:'megaboss', bgKey:'void',
   bodyColor:'#180030', eyeColor:'#00ffff', accentColor:'#0c0018', weaponColor:'#00ffff'},
  {name:'THE ETERNAL KING',hp:1200,xpGive:400,tier:'megaboss',bgKey:'heaven',
   bodyColor:'#c0a000', eyeColor:'#ffffff', accentColor:'#806000', weaponColor:'#ffffff'},
];

const BG_PALETTES = {
  plains:  {skyTop:'#081520',skyBot:'#0d2a14',groundTop:'#0d2a0d',groundBot:'#081508',accent:'#1a3a1a'},
  dungeon: {skyTop:'#0d0d00',skyBot:'#1a1500',groundTop:'#1a1200',groundBot:'#0d0900',accent:'#2a2000'},
  castle:  {skyTop:'#100818',skyBot:'#1e0f2a',groundTop:'#160d20',groundBot:'#0d0815',accent:'#261535'},
  volcano: {skyTop:'#200300',skyBot:'#350700',groundTop:'#180400',groundBot:'#100200',accent:'#300800'},
  void:    {skyTop:'#000003',skyBot:'#040010',groundTop:'#040010',groundBot:'#020008',accent:'#0c0028'},
  heaven:  {skyTop:'#120020',skyBot:'#200040',groundTop:'#160030',groundBot:'#0c0020',accent:'#280050'},
};

// ============================================================
// STATE
// ============================================================
let state = {
  tasks:[], completions:{},
  xp:{orin:0, wife:0},
  battle:{
    monsterId:0, monsterHp:35, monsterHpMax:35,
    regularsKilled:0, totalKilled:0,
    bgKey:'plains', powerCharge:0,
  },
};

let undoStack=[], selAssign='orin', selMode='anytime', selDays=[];
let calYear, calMonth, calSelected;
let questFilter='all', viewDateOffset=0, pendingDeleteId=null;

// ============================================================
// FIREBASE SAVE / LOAD
// ============================================================
let _fbSaveTimeout=null;
function save(){
  clearTimeout(_fbSaveTimeout);
  _fbSaveTimeout=setTimeout(()=>{
    if(window._fbSet) window._fbSet(JSON.parse(JSON.stringify(state)));
  },400);
}
function fixState(s){
  if(!s.xp)          s.xp={orin:0,wife:0};
  if(!s.tasks)       s.tasks=[];
  if(!s.completions) s.completions={};
  if(!s.battle)      s.battle={monsterId:0,monsterHp:35,monsterHpMax:35,regularsKilled:0,totalKilled:0,bgKey:'plains',powerCharge:0};
  if(s.battle.powerCharge===undefined)    s.battle.powerCharge=0;
  if(s.battle.regularsKilled===undefined) s.battle.regularsKilled=0;
  if(s.battle.totalKilled===undefined)    s.battle.totalKilled=0;
  if(s.battle.bgKey===undefined)          s.battle.bgKey='plains';
  return s;
}
function loadState(){
  const tryConnect=()=>{
    if(!window._fbOnValue){setTimeout(tryConnect,100);return;}
    window._fbOnValue(snapshot=>{
      const data=snapshot.val();
      if(data){
        // Only merge known fields — ignore old shop/coin/owned fields
        if(data.tasks)       state.tasks=data.tasks;
        if(data.completions) state.completions=data.completions;
        if(data.xp)          state.xp={...state.xp,...data.xp};
        if(data.battle)      state.battle={...state.battle,...data.battle};
        state=fixState(state);
      } else {
        state=fixState(state);
        save();
      }
      renderAll();
      startBattleLoop();
    });
  };
  tryConnect();
}

// ============================================================
// UNDO
// ============================================================
function pushUndo(){undoStack.push(JSON.stringify(state));if(undoStack.length>40)undoStack.shift();}
function undo(){
  if(!undoStack.length){toast('💭','NOTHING TO UNDO','No recent actions to reverse.');return;}
  state=JSON.parse(undoStack.pop());
  save();renderAll();toast('↩️','UNDONE!','Last action reversed.');
}

// ============================================================
// DATE HELPERS
// ============================================================
function offsetDate(offset){const n=new Date();const d=new Date(n.getFullYear(),n.getMonth(),n.getDate()+offset);return fmtDate(d.getFullYear(),d.getMonth(),d.getDate());}
function fmtDate(y,m,d){return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function parseDateStr(s){const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function dayOfWeek(ds){return parseDateStr(ds).getDay()}
function todayStr(){
  const d=new Date();
  return fmtDate(d.getFullYear(),d.getMonth(),d.getDate());
}
function viewDateStr(){return offsetDate(viewDateOffset)}
function shiftDay(d){viewDateOffset+=d;renderQuestList()}
function taskVisibleOnDate(task,dateStr){
  const mode=task.mode||'anytime';
  if(mode==='anytime') return true;
  if(mode==='date') return task.date===dateStr;
  if(mode==='recurring') return Array.isArray(task.days)&&task.days.includes(dayOfWeek(dateStr));
  return true; // default show
}
function tasksDueOnDate(ds){return state.tasks.filter(t=>taskVisibleOnDate(t,ds))}

// ============================================================
// XP / LEVEL
// ============================================================
function getLevel(xp){for(let i=XP_LEVELS.length-1;i>=0;i--)if(xp>=XP_LEVELS[i])return i+1;return 1}
function xpFloor(l){return XP_LEVELS[Math.min(l-1,XP_LEVELS.length-1)]}
function xpCeil(l){return l>=XP_LEVELS.length?XP_LEVELS[XP_LEVELS.length-1]+9999:XP_LEVELS[l]}
function xpMultiplier(){return 1;}

function awardXP(player, el){
  const amount=Math.round(XP_PER_TASK*xpMultiplier());
  const prev=getLevel(state.xp[player]);
  state.xp[player]+=amount;
  const nxt=getLevel(state.xp[player]);
  if(el) showXpPop(el,`+${amount}XP`);
  if(nxt>prev) setTimeout(()=>showLvlModal(player,nxt,0),600);
}
function removeXP(player){
  const amount=Math.round(XP_PER_TASK*xpMultiplier());
  state.xp[player]=Math.max(0,state.xp[player]-amount);
}

function updateXPDisplay(){
  ['orin','wife'].forEach(p=>{
    const xp=state.xp[p],lvl=getLevel(xp);
    const pct=Math.min(100,((xp-xpFloor(lvl))/(xpCeil(lvl)-xpFloor(lvl)))*100);
    const bar=document.getElementById(`${p}-bar`);
    if(bar){bar.style.background=p==='orin'?'#e84560':'#b44fde';bar.style.width=pct+'%';}
    const lbl=document.getElementById(`${p}-xp-lbl`);
    if(lbl) lbl.textContent=`LVL ${lvl} · ${xp}XP`;
  });
  updateHeroHUD();
}

function showXpPop(el,txt){
  if(!el)return;
  const pop=document.createElement('div');
  pop.style.cssText='position:fixed;font-family:"Press Start 2P",monospace;font-size:9px;color:#f5c518;text-shadow:2px 2px 0 #000;pointer-events:none;z-index:1000;animation:dmgFloat .8s steps(6) forwards';
  const r=el.getBoundingClientRect();
  pop.style.left=(r.left+r.width/2-20)+'px';
  pop.style.top=(r.top-10)+'px';
  pop.textContent=txt;
  document.body.appendChild(pop);
  setTimeout(()=>pop.remove(),900);
}

// ============================================================
// LEVEL UP MODAL
// ============================================================
function showLvlModal(player,lvl,coins){
  document.getElementById('lvl-num').textContent=lvl;
  document.getElementById('lvl-txt').textContent=`${player.toUpperCase()} reached level ${lvl}!`;
  const coinEl=document.getElementById('lvl-coins');
  if(coinEl) coinEl.textContent='';
  document.getElementById('lvl-modal').classList.add('show');
  // Check for class change
  const cls=getHeroClass(player,lvl);
  const prevCls=getHeroClass(player,lvl-1);
  if(cls.name!==prevCls.name){
    setTimeout(()=>{closeLvlModal();showClassChange(player,cls);},600);
  }
}
function closeLvlModal(){document.getElementById('lvl-modal').classList.remove('show');}

// ============================================================
// CANVAS BATTLE ENGINE
// ============================================================