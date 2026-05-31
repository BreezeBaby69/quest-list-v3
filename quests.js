// COMPLETION
// =============================================
function compKey(id,ds){return `${id}_${ds}`}
function getComp(id,ds){return state.completions[compKey(id,ds)]||{orin:false,wife:false}}
function isFullyDone(task,ds){
  const c=getComp(task.id,ds);
  if(task.assign==='both') return c.orin&&c.wife;
  return c[task.assign];
}

// =============================================
// XP / LEVEL / COINS
// =============================================
function getLevel(xp){for(let i=XP_LEVELS.length-1;i>=0;i--)if(xp>=XP_LEVELS[i])return i+1;return 1}
function xpFloor(l){return XP_LEVELS[Math.min(l-1,XP_LEVELS.length-1)]}
function xpCeil(l){return l>=XP_LEVELS.length?XP_LEVELS[XP_LEVELS.length-1]+9999:XP_LEVELS[l]}

// xpMultiplier defined above

// awardXP defined above
function removeXP(player) {
  const amount = Math.round(XP_PER_TASK * xpMultiplier());
  state.xp[player]=Math.max(0,state.xp[player]-amount);
}

// updateXPDisplay defined above

// =============================================
// HERO STAGE RENDERING
// =============================================
// =============================================
// QUEST RENDERING
// =============================================
function setQFilter(f,btn){
  questFilter=f;
  document.querySelectorAll('.fil-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderQuestList();
}

function renderQuestList(){
  const dateStr=viewDateStr();
  const d=parseDateStr(dateStr);
  const isToday=dateStr===todayStr();
  const isTomorrow=viewDateOffset===1;
  const isYesterday=viewDateOffset===-1;
  let label=`${DAYS_SHORT[d.getDay()].toUpperCase()}, ${MONTHS[d.getMonth()].substring(0,3).toUpperCase()} ${d.getDate()}`;
  if(isToday) label='TODAY · '+label;
  else if(isTomorrow) label='TOMORROW · '+label;
  else if(isYesterday) label='YESTERDAY · '+label;
  document.getElementById('day-label-q').textContent=label;

  const list=document.getElementById('quest-list');
  list.innerHTML='';

  let tasks=tasksDueOnDate(dateStr);
  if(questFilter==='orin') tasks=tasks.filter(t=>t.assign==='orin'||t.assign==='both');
  if(questFilter==='wife') tasks=tasks.filter(t=>t.assign==='wife'||t.assign==='both');
  if(questFilter==='active') tasks=tasks.filter(t=>!isFullyDone(t,dateStr));
  if(questFilter==='done')   tasks=tasks.filter(t=>isFullyDone(t,dateStr));

  if(!tasks.length){
    list.innerHTML=`<div class="empty"><span class="empty-icon">${isToday?'🌟':'📭'}</span>${isToday?'ALL CLEAR, HERO!':'NO QUESTS THIS DAY'}<br><small>${isToday?'ADD QUESTS FROM THE + TAB':'TRAVEL TO ANOTHER DAY'}</small></div>`;
    return;
  }
  tasks.forEach(t=>list.appendChild(buildTaskEl(t,dateStr)));
}

function buildTaskEl(task, dateStr){
  const c=getComp(task.id,dateStr);
  const fully=isFullyDone(task,dateStr);
  const li=document.createElement('li');
  li.className=`task-item ${task.assign==='both'?'both-a':task.assign+'-a'} ${task.mode==='recurring'?'recurring':''} ${fully?'fully-done':''}`;
  li.id=`ti-${task.id}`;

  let checks='';
  if(task.assign==='orin'||task.assign==='both'){
    checks+=`<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div class="chk ${c.orin?'checked':''}" onclick="toggleComp(${task.id},'orin','${dateStr}')">${c.orin?'✓':''}</div>
      <div class="chk-lbl" style="color:var(--orin)">ORI</div></div>`;
  }
  if(task.assign==='wife'||task.assign==='both'){
    checks+=`<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div class="chk ${c.wife?'checked':''}" onclick="toggleComp(${task.id},'wife','${dateStr}')">${c.wife?'✓':''}</div>
      <div class="chk-lbl" style="color:var(--wife)">WIF</div></div>`;
  }

  const modeIcon=task.mode==='recurring'?'🔁':task.mode==='date'?'📅':'♾️';
  const assignIcon=task.assign==='orin'?'🗡️':task.assign==='wife'?'🔮':'🤝';
  let metaStr=`${modeIcon} `;
  if(task.mode==='recurring') metaStr+=task.days.map(d=>DAYS_ABR[d].substring(0,2)).join(' ');
  else if(task.mode==='date') metaStr+=task.date;
  else metaStr+='DAILY';
  metaStr+=` · ${assignIcon}`;

  li.innerHTML=`
    <div class="chk-wrap">${checks}</div>
    <div class="task-body">
      <div class="task-text">${esc(task.name)}</div>
      <div class="task-meta">${metaStr}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
      <div class="task-xp">⭐${XP_PER_TASK}</div>
      <button class="task-del" onclick="confirmDelete(${task.id},'${esc(task.name)}')">✕</button>
    </div>`;
  return li;
}

// =============================================
// COMPLETION
// =============================================
function toggleComp(taskId, player, dateStr){
  pushUndo();
  const key=compKey(taskId,dateStr);
  if(!state.completions[key]) state.completions[key]={orin:false,wife:false};
  const c=state.completions[key];
  const task=state.tasks.find(t=>t.id===taskId);
  const wasFully=isFullyDone(task,dateStr);
  c[player]=!c[player];
  const nowFully=isFullyDone(task,dateStr);

  const el=document.getElementById(`ti-${taskId}`);

  if(!wasFully&&nowFully){
    boom(el);
    if(task.assign==='both'){
      awardXP('orin',el);awardXP('wife',el);
      triggerAttack('orin',XP_PER_TASK);
      setTimeout(()=>triggerAttack('wife',XP_PER_TASK),200);
    } else {
      awardXP(task.assign,el);
      triggerAttack(task.assign,XP_PER_TASK);
    }
    if(task.mode==='anytime'){
      setTimeout(()=>{
        state.tasks=state.tasks.filter(t=>t.id!==taskId);
        Object.keys(state.completions).forEach(k=>{if(k.startsWith(taskId+'_'))delete state.completions[k];});
        save();
      },550);
    }
  } else if(wasFully&&!nowFully){
    if(task.assign==='both'){removeXP('orin');removeXP('wife');}
    else removeXP(task.assign);
  }

  updateXPDisplay();
  save();
  setTimeout(()=>{
    renderQuestList();
    if(calSelected) renderCalDetail(calSelected);
  }, nowFully ? 600 : 0);
}

// =============================================
// EXPLOSION!
// =============================================
const PARTICLES=['⭐','💥','✨','🌟','⚡','💫','🔥','🎆','🎇','★','◆','▲'];
const PARTICLES_MEGA=['💥','🔥','⭐','🌟','💫','⚡','🎆','🎇','✨','🏆','👑','🌈','💎'];

function boom(el){
  if(!el) return;
  el.classList.add('exploding');
  // Screen flash
  const flash=document.createElement('div');
  flash.className='star-flash';
  document.body.appendChild(flash);
  setTimeout(()=>flash.remove(),500);

  const rect=el.getBoundingClientRect();
  const cx=rect.left+rect.width/2;
  const cy=rect.top+rect.height/2;
  const isMega=false;
  const count=isMega?20:12;
  const parts=isMega?PARTICLES_MEGA:PARTICLES;

  for(let i=0;i<count;i++){
    const p=document.createElement('div');
    p.className='particle';
    const angle=(360/count)*i+(Math.random()*30-15);
    const dist=isMega?(80+Math.random()*120):(50+Math.random()*80);
    const tx=Math.cos(angle*Math.PI/180)*dist;
    const ty=Math.sin(angle*Math.PI/180)*dist;
    const dur=(0.6+Math.random()*0.6)+'s';
    const rot=(Math.random()*720-360)+'deg';
    p.style.cssText=`left:${cx}px;top:${cy}px;--tx:${tx}px;--ty:${ty}px;--dur:${dur};--rot:${rot}`;
    p.textContent=parts[Math.floor(Math.random()*parts.length)];
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),1200);
  }

  // Big center burst text
  const burst=document.createElement('div');
  burst.style.cssText=`position:fixed;left:${cx}px;top:${cy-20}px;font-family:'Press Start 2P',monospace;font-size:${isMega?14:10}px;color:var(--yellow);text-shadow:2px 2px 0 #7a6000;pointer-events:none;z-index:9997;animation:xppop 1s forwards;transform:translateX(-50%)`;
  burst.textContent=isMega?'★ MEGA CLEAR! ★':'QUEST CLEAR!';
  document.body.appendChild(burst);
  setTimeout(()=>burst.remove(),1100);
}

// =============================================
// DELETE
// =============================================
function confirmDelete(id, name){
  pendingDeleteId=id;
  document.getElementById('confirm-name').textContent=`Delete "${name}"?`;
  document.getElementById('confirm-yes-btn').onclick=()=>doDelete();
  document.getElementById('confirm-modal').classList.add('show');
}
function closeConfirm(){document.getElementById('confirm-modal').classList.remove('show');pendingDeleteId=null;}
function doDelete(){
  if(!pendingDeleteId) return;
  pushUndo();
  state.tasks=state.tasks.filter(t=>t.id!==pendingDeleteId);
  Object.keys(state.completions).forEach(k=>{if(k.startsWith(pendingDeleteId+'_'))delete state.completions[k];});
  save(); closeConfirm(); renderQuestList(); if(calSelected) renderCalDetail(calSelected);
}

// =============================================
// ADD TASK
// =============================================
function setAssign(who,btn){
  selAssign=who;
  document.querySelectorAll('.assign-btn').forEach(b=>b.className='assign-btn');
  btn.classList.add(`sel-${who}`);
}
function setMode(mode,btn){
  selMode=mode;
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('date-section').style.display=mode==='date'?'block':'none';
  document.getElementById('recur-section').style.display=mode==='recurring'?'block':'none';
}
function toggleDay(d,btn){
  if(selDays.includes(d)){selDays=selDays.filter(x=>x!==d);btn.classList.remove('sel');}
  else{selDays.push(d);btn.classList.add('sel');}
}
function addTask(){
  const name=document.getElementById('inp-name').value.trim();
  if(!name){toast('❌','MISSING NAME','Please enter a quest name!');return;}
  if(selMode==='recurring'&&selDays.length===0){toast('❌','NO DAYS','Pick at least one day!');return;}
  if(selMode==='date'&&!document.getElementById('inp-date').value){toast('❌','NO DATE','Please pick a due date!');return;}
  pushUndo();
  state.tasks.push({
    id:Date.now(),name,assign:selAssign,mode:selMode,
    date:selMode==='date'?document.getElementById('inp-date').value:null,
    days:selMode==='recurring'?[...selDays]:[],
    created:Date.now()
  });
  save();
  document.getElementById('inp-name').value='';
  // Reset date input to today so it's ready for next quest
  const _nd=new Date();
  document.getElementById('inp-date').value=`${_nd.getFullYear()}-${String(_nd.getMonth()+1).padStart(2,'0')}-${String(_nd.getDate()).padStart(2,'0')}`;
  selDays=[];
  document.querySelectorAll('.day-btn').forEach(b=>b.classList.remove('sel'));
  toast('⚔️','QUEST ADDED!',`"${name}" is now active!`);
  viewDateOffset=0;
  showScreen('quests');
}

// =============================================
// CALENDAR
// =============================================
function initCal(){const n=new Date();calYear=n.getFullYear();calMonth=n.getMonth();}
function calMove(d){calMonth+=d;if(calMonth>11){calMonth=0;calYear++;}if(calMonth<0){calMonth=11;calYear--;}renderCal();}