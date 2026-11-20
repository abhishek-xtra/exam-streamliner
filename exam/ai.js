/* Ask Claude (AI tutor): floating button → chat panel. With claude_bridge.py running, questions go through the
   learner's own Claude Code login; otherwise the question opens in claude.ai. Sees the exam question or Study Hall
   page on screen. Ported from the former arena build. */
(function(){
'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
document.body.insertAdjacentHTML('beforeend',`<button id="ai-fab" type="button" aria-label="Ask Claude to explain" aria-expanded="false" aria-controls="ai-panel"><svg class="ai-spark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c.5 4.6 2.4 6.5 7 7-4.6.5-6.5 2.4-7 7-.5-4.6-2.4-6.5-7-7 4.6-.5 6.5-2.4 7-7z"/><path d="M19 14.5c.25 2 1 2.75 3 3-2 .25-2.75 1-3 3-.25-2-1-2.75-3-3 2-.25 2.75-1 3-3z" opacity=".75"/></svg><svg class="ai-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg><span class="ai-tip">Ask Claude</span></button>
<section id="ai-panel" class="lg" role="dialog" aria-label="Ask Claude" hidden>
  <div class="ai-head">
    <h2><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c.5 4.6 2.4 6.5 7 7-4.6.5-6.5 2.4-7 7-.5-4.6-2.4-6.5-7-7 4.6-.5 6.5-2.4 7-7z"/><path d="M19 14.5c.25 2 1 2.75 3 3-2 .25-2.75 1-3 3-.25-2-1-2.75-3-3 2-.25 2.75-1 3-3z" opacity=".75"/></svg>Ask Claude</h2>
    <select id="ai-model" aria-label="Model"></select>
    <button class="ai-ib" id="ai-new" type="button" title="New chat" aria-label="New chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
    <button class="ai-ib" id="ai-close" type="button" title="Close (Esc)" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
  </div>
  <div class="ai-status" id="ai-status"><i></i><span>Checking your Claude connection…</span></div>
  <div class="ai-log" id="ai-log" aria-live="polite"></div>
  <div class="ai-chips" id="ai-chips"></div>
  <div class="ai-foot">
    <div class="ai-ctxbar"><button class="ai-ctxbtn" id="ai-ctx" type="button" aria-pressed="true" title="Send what you are looking at along with your question"><i>●</i><span id="ai-ctx-label">Nothing on screen</span></button></div>
    <div class="ai-row">
      <textarea id="ai-input" rows="1" placeholder="Ask anything you want explained…" aria-label="Your question"></textarea>
      <button class="ai-send" id="ai-send" type="button" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
    </div>
    <button class="ai-alt" id="ai-alt" type="button">Open this chat in claude.ai instead</button>
  </div>
</section>`);
const AI_MODELS=[{id:'opus',label:'Opus 5.5'},{id:'sonnet',label:'Sonnet 5.5'},{id:'haiku',label:'Haiku 5.5'}];
const AI_BRIDGE=/^https?:$/.test(location.protocol)&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
let aiOpen=false, aiMsgs=[], aiBusy=null, aiStatus=null, aiSel='', aiUseCtx=true, aiModel='opus';
try{ const m=JSON.parse(localStorage.getItem('lossarena.ai')||'{}').model; if(AI_MODELS.some(x=>x.id===m)) aiModel=m; }catch(e){}
const aiClip=(t,n)=>{ t=String(t||'').replace(/\n{3,}/g,'\n\n').trim(); return t.length>n?t.slice(0,n)+' …':t; };

// what the learner is looking at right now → {kind,label,text}
function aiContext(){
  const view=(XM.view&&XM.view())||{}, c=XM.courses[view.c], head=c?`Course: ${c.code} ${c.name}`:'Exam Streamliner (Aalto exam practice)';
  if(aiSel) return {kind:'sel',label:'Selected: “'+aiClip(aiSel,40)+'”',text:`${head}\nThe learner highlighted this text:\n"""${aiClip(aiSel,4000)}"""`};
  const fz=document.querySelector('#xm-focus'); if(fz){ const t=fz.querySelector('.xm-eyebrow').textContent; return {kind:'study',label:'Reading: '+aiClip(t,40),text:`${head}\nScreen: Study Hall focus reader, page "${t}"\n${aiClip(fz.querySelector('.fz-slide.cur').innerText,9000)}`}; }
  if(view.name==='study'){ const a=document.querySelector('.xm-study'); return {kind:'study',label:'Study: '+aiClip(a?a.dataset.topic:'',44),text:`${head}\nScreen: Study Hall page "${a?a.dataset.topic:''}"\n${aiClip(a?a.innerText:'',9000)}`}; }
  if(view.name==='practice'||view.name==='exam'||view.name==='mark'){ const q=document.querySelector('.xm-q'); if(q){ const done=!!q.querySelector('.xm-sol')||view.name==='mark';
      return {kind:done?'done':'fight',label:'Question: '+aiClip((q.querySelector('h2')||{}).textContent,44),text:`${head}\nScreen: ${view.name==='practice'?'practice question':'exam question'}${done?' (already checked: the model answer is shown)':' (NOT answered yet: do not give the answer away unless asked)'}\n${aiClip(q.innerText,9000)}`}; } }
  return {kind:'map',label:c?c.code:'Exam Streamliner',text:head};
}
const AI_CHIPS={
  fight:['Give me a hint','Explain the concept behind this','What does each option mean?'],
  done:['Why is that the right answer?','Why are the others wrong?','Give me a similar practice question'],
  study:['Explain this simply','Give me a worked example','Quiz me on this'],
  sel:['Explain this','Explain it more simply','Give me an example'],
  map:['What is this topic about?','What should I focus on for the exam?','Quiz me with 3 questions'],
};
function aiRenderCtx(){
  const c=aiContext(), b=$('#ai-ctx');
  $('#ai-ctx-label').textContent=c.label; b.setAttribute('aria-pressed',aiUseCtx); b.title=aiUseCtx?'Claude sees this. Click to leave it out.':'Not sent. Click to include what you are looking at.';
  $('#ai-chips').innerHTML=(AI_CHIPS[c.kind]||AI_CHIPS.map).map(t=>`<button class="ai-chip" type="button">${esc(t)}</button>`).join('');
}

// small Markdown → HTML (escaped first, so model output can't inject markup)
function aiInline(s){ return esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g,'$1<i>$2</i>'); }
function aiMd(src){
  return String(src).split('```').map((b,i)=>{
    if(i%2){ const nl=b.indexOf('\n'); const code=nl>=0&&/^[\w+#.-]*$/.test(b.slice(0,nl))?b.slice(nl+1):b; return `<pre><code>${esc(code.replace(/\n$/,''))}</code></pre>`; }
    let out='', list=null, para=[];
    const flush=()=>{ if(para.length){ out+=`<p>${para.map(aiInline).join('<br>')}</p>`; para=[]; } if(list){ out+=`</${list}>`; list=null; } };
    b.split('\n').forEach(line=>{
      const h=line.match(/^#{1,6}\s+(.*)/), ul=line.match(/^\s*[-*•]\s+(.*)/), ol=line.match(/^\s*\d+[.)]\s+(.*)/);
      if(!line.trim()) flush();
      else if(h){ flush(); out+=`<h4>${aiInline(h[1])}</h4>`; }
      else if(ul||ol){ const tag=ul?'ul':'ol'; if(para.length||list!==tag){ flush(); out+=`<${tag}>`; list=tag; } out+=`<li>${aiInline((ul||ol)[1])}</li>`; }
      else if(list){ out=out.replace(/<\/li>$/,'<br>'+aiInline(line.trim())+'</li>'); }
      else para.push(line);
    });
    flush(); return out;
  }).join('');
}

function aiRenderLog(){
  const log=$('#ai-log');
  if(!aiMsgs.length){
    let setup='';
    if(aiStatus&&!aiStatus.ok) setup=`<div class="ai-setup"><b>Use your own Claude account here</b><ol>${aiStatus.reason==='not_installed'||aiStatus.reason==='no_bridge'
      ?`<li>Install Claude Code (claude.com/claude-code) and run <code>claude</code> once to sign in with your Claude account.</li><li>Start the app with <code>python3 claude_bridge.py</code> in this folder.</li><li>Open <code>http://localhost:8731</code>.</li>`
      :`<li>Open a terminal and run <code>claude</code>.</li><li>Type <code>/login</code> and sign in with your Claude account (Pro or Max).</li><li>Reload this page.</li>`}</ol><p style="margin:8px 0 0;color:var(--muted)">Or use the link below: it opens the question in claude.ai with your account.</p></div>`;
    log.innerHTML=`<div class="ai-empty"><b>Stuck on something?</b>Ask for an explanation, a hint or an example. Claude can see the question or page you are on.${setup}</div>`;
    return;
  }
  log.innerHTML=aiMsgs.map((m,i)=>m.role==='user'
    ?`<div class="ai-m u">${m.ctx?`<span class="ai-ctx">${esc(m.ctx)}</span>`:''}${esc(m.content)}</div>`
    :`<div class="ai-m a${aiBusy&&i===aiMsgs.length-1?' typing':''}">${m.content?aiMd(m.content):'<span class="ai-dots"><i></i><i></i><i></i></span>'}</div>`).join('');
  log.scrollTop=log.scrollHeight;
}
function aiRenderStatus(){
  const el=$('#ai-status'), s=aiStatus;
  el.className='ai-status'+(s?(s.ok?' on':' off'):'');
  el.lastElementChild.textContent=!s?'Checking your Claude connection…'
    :s.ok?`Connected to your Claude account${s.plan?' · '+s.plan[0].toUpperCase()+s.plan.slice(1)+' plan':''}`
    :s.reason==='no_bridge'?'Not connected: start the app with claude_bridge.py to chat here'
    :s.reason==='not_installed'?'Claude Code is not installed on this computer'
    :s.reason==='not_logged_in'?'Claude Code is not signed in':'Claude is not reachable right now';
  $('#ai-alt').hidden=!!(s&&s.ok&&!aiMsgs.length);
  $('#ai-send').title=s&&!s.ok?'Opens claude.ai in a new tab':'Send (Enter)';
}
async function aiCheck(){
  if(!AI_BRIDGE){ aiStatus={ok:false,reason:'no_bridge'}; }
  else try{ const r=await fetch('/api/ai/status',{cache:'no-store'}); aiStatus=r.ok?await r.json():{ok:false,reason:'no_bridge'}; }
  catch(e){ aiStatus={ok:false,reason:'no_bridge'}; }
  aiRenderStatus(); aiRenderLog();
}

function aiToggle(open){
  if(open===aiOpen) return;
  aiOpen=open; $('#ai-panel').hidden=!open; $('#ai-fab').setAttribute('aria-expanded',open);
  if(open){
    if(!aiStatus) aiCheck(); else if(!aiStatus.ok) aiCheck();
    aiRenderStatus(); aiRenderCtx(); aiRenderLog(); 
    setTimeout(()=>$('#ai-input').focus({preventScroll:true}),60);
  } else { aiSel=''; $('#ai-fab').focus({preventScroll:true}); }
}
// claude.ai fallback: the whole question (with context) goes into a new claude.ai chat
function aiHandoff(text){
  const c=aiContext();
  const convo=aiMsgs.map(m=>`${m.role==='user'?'Me':'Claude'}: ${m.content}`).join('\n\n');
  const q=`I'm revising for my university exam with a study app and want something explained. Keep it short and scannable: one bold key line, then 3-5 one-line bullets, no long paragraphs.\n\n${aiUseCtx?c.text.slice(0,3000)+'\n\n':''}${convo?'Our chat so far:\n'+convo.slice(-2500)+'\n\n':''}${text||'Please explain this.'}`;
  window.open('https://claude.ai/new?q='+encodeURIComponent(q),'_blank','noopener');
}
async function aiSend(text){
  text=(text||'').trim(); if(!text||aiBusy) return;
  if(!aiStatus||!aiStatus.ok){ aiHandoff(text); $('#ai-input').value=''; return; }
  const c=aiContext();
  aiMsgs.push({role:'user',content:text,ctx:aiUseCtx?c.label:''}, {role:'assistant',content:''});
  const reply=aiMsgs[aiMsgs.length-1];
  $('#ai-input').value=''; aiGrow();
  const ctl=new AbortController(); aiBusy=ctl; aiSendBtn(); aiRenderStatus(); aiRenderLog();
  let raf=0; const paint=()=>{ raf=0; const el=$('#ai-log').lastElementChild; if(el){ el.innerHTML=aiMd(reply.content); const L=$('#ai-log'); if(L.scrollHeight-L.scrollTop-L.clientHeight<120) L.scrollTop=L.scrollHeight; } };
  try{
    const r=await fetch('/api/ai/ask',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctl.signal,
      body:JSON.stringify({model:aiModel,context:aiUseCtx?c.text:'',messages:aiMsgs.slice(0,-1).map(m=>({role:m.role,content:m.content}))})});
    if(!r.ok||!r.body) throw new Error((await r.text().catch(()=>''))||'HTTP '+r.status);
    const rd=r.body.getReader(), dec=new TextDecoder();
    for(;;){ const {done,value}=await rd.read(); if(done) break; reply.content+=dec.decode(value,{stream:true}); if(!raf) raf=requestAnimationFrame(paint); }
  }catch(e){
    if(e.name!=='AbortError') reply.content+=(reply.content?'\n\n':'')+'⚠️ Could not reach Claude. Is `claude_bridge.py` still running?';
  }
  if(!reply.content) reply.content='_Stopped._';
  aiBusy=null; aiSendBtn(); aiRenderLog();
}
function aiSendBtn(){
  const b=$('#ai-send');
  b.innerHTML=aiBusy?'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>'
                    :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  b.setAttribute('aria-label',aiBusy?'Stop':'Send');
}
function aiGrow(){ const t=$('#ai-input'); t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,130)+'px'; }

(function aiInit(){
  $('#ai-model').innerHTML=AI_MODELS.map(m=>`<option value="${m.id}">${m.label}</option>`).join(''); $('#ai-model').value=aiModel;
  $('#ai-model').addEventListener('change',e=>{ aiModel=e.target.value; try{ localStorage.setItem('lossarena.ai',JSON.stringify({model:aiModel})); }catch(err){} });
  // remember highlighted text before the click moves focus, so "explain this" can use it
  $('#ai-fab').addEventListener('pointerdown',()=>{ if(!aiOpen){ const t=String(window.getSelection()||'').trim(); aiSel=t.length>2?t:''; } });
  $('#ai-fab').addEventListener('click',()=>aiToggle(!aiOpen));
  $('#ai-close').addEventListener('click',()=>aiToggle(false));
  $('#ai-new').addEventListener('click',()=>{ if(aiBusy) aiBusy.abort(); aiMsgs=[]; aiSel=''; aiRenderCtx(); aiRenderStatus(); aiRenderLog(); $('#ai-input').focus(); });
  $('#ai-ctx').addEventListener('click',()=>{ aiUseCtx=!aiUseCtx; aiRenderCtx(); });
  $('#ai-chips').addEventListener('click',e=>{ const b=e.target.closest('.ai-chip'); if(b) aiSend(b.textContent); });
  $('#ai-send').addEventListener('click',()=>{ if(aiBusy) aiBusy.abort(); else aiSend($('#ai-input').value); });
  $('#ai-alt').addEventListener('click',()=>aiHandoff($('#ai-input').value.trim()||(aiMsgs.length?'Please continue from here.':'')));
  $('#ai-input').addEventListener('input',aiGrow);
  // keys typed in the panel must not reach the game (1–4 answer, Enter = next, Esc closes the reader)
  $('#ai-panel').addEventListener('keydown',e=>{
    e.stopPropagation();
    if(e.key==='Escape'){ e.preventDefault(); aiToggle(false); }
    else if(e.key==='Enter'&&!e.shiftKey&&e.target.id==='ai-input'&&!e.isComposing){ e.preventDefault(); aiSend(e.target.value); }
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&aiOpen){ e.stopImmediatePropagation(); aiToggle(false); } },true);
  aiSendBtn();
})();
})();
