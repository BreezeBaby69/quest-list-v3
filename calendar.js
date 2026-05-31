function renderCal(){
  document.getElementById('cal-month-lbl').textContent=`${MONTHS[calMonth]} ${calYear}`;
  const grid=document.getElementById('cal-grid');
  const today=todayStr();
  grid.innerHTML=DAYS_SHORT.map(d=>`<div class="cal-dow">${d[0]}</div>`).join('');
  const first=new Date(calYear,calMonth,1).getDay();
  const dim=new Date(calYear,calMonth+1,0).getDate();
  for(let i=0;i<first;i++) grid.innerHTML+=`<div class="cal-day empty-day"></div>`;
  for(let d=1;d<=dim;d++){
    const ds=fmtDate(calYear,calMonth,d);
    const hasTasks=tasksDueOnDate(ds).length>0;
    const isT=ds===today, isSel=ds===calSelected;
    grid.innerHTML+=`<div class="cal-day${isT?' today':''}${isSel?' selected':''}${hasTasks?' has-tasks':''}" onclick="selectCalDay('${ds}')">${d}</div>`;
  }
}
function selectCalDay(ds){calSelected=ds;renderCal();renderCalDetail(ds);}
function renderCalDetail(ds){
  calSelected=ds;
  // Sync date input to selected calendar date
  const _di=document.getElementById('inp-date');
  if(_di) _di.value=ds;
  const hdr=document.getElementById('cal-detail-hdr');
  const list=document.getElementById('cal-task-list');
  list.innerHTML='';
  const d=parseDateStr(ds);
  hdr.style.display='block';
  hdr.textContent=`📅 ${DAYS_SHORT[d.getDay()].toUpperCase()} ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const tasks=tasksDueOnDate(ds);
  if(!tasks.length){list.innerHTML=`<div class="empty" style="padding:20px"><span class="empty-icon" style="font-size:28px">📭</span>NO QUESTS</div>`;return;}
  tasks.forEach(t=>list.appendChild(buildTaskEl(t,ds)));
}

// =============================================
// MODALS
// =============================================
function showLvlModal(player,lvl,coins){
  document.getElementById('lvl-num').textContent=`⭐ LVL ${lvl} ⭐`;
  document.getElementById('lvl-txt').textContent=`${player.toUpperCase()} REACHED LEVEL ${lvl}!`;
  document.getElementById('lvl-coins').textContent=`+${coins} 🪙 COINS EARNED!`;
  document.getElementById('lvl-modal').classList.add('show');
}
function closeLvlModal(){document.getElementById('lvl-modal').classList.remove('show');}
function toast(icon,title,msg){
  document.getElementById('toast-icon').textContent=icon;
  document.getElementById('toast-title').textContent=title;
  document.getElementById('toast-msg').textContent=msg;
  document.getElementById('toast-modal').classList.add('show');
}
function closeToast(){document.getElementById('toast-modal').classList.remove('show');}
function showXpPop(el,txt){
  const r=el.getBoundingClientRect();
  const p=document.createElement('div');
  p.className='xp-pop';p.textContent=txt;
  p.style.left=(r.left+r.width/2-20)+'px';p.style.top=(r.top+window.scrollY)+'px';
  document.body.appendChild(p);setTimeout(()=>p.remove(),1400);
}

// =============================================
// SCREEN NAV
// =============================================