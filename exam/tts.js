/* Read aloud for the Study Hall: a speaker button on every block, spoken with the browser's own voices.
   Words are highlighted as they are spoken (CSS Custom Highlight API). Ported from the former arena build. */
(function(){
'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const AUDIO_KEY='lossarena.audio';
let audioPrefs={vol:70,rate:1,voice:''}; try{ Object.assign(audioPrefs,JSON.parse(localStorage.getItem(AUDIO_KEY)||'{}')); }catch(e){}
function saveAudio(){ try{ localStorage.setItem(AUDIO_KEY,JSON.stringify(audioPrefs)); }catch(e){} }
document.body.insertAdjacentHTML('beforeend',`<div class="tts-bar" id="tts-bar" hidden role="group" aria-label="Read aloud controls"><span class="spk-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span><button type="button" class="tb-r" data-d="-1" aria-label="Read slower" title="Slower (−)">−</button><b id="tts-bar-v" aria-live="polite">1.0×</b><button type="button" class="tb-r" data-d="1" aria-label="Read faster" title="Faster (+)">+</button><button type="button" class="tb-x" id="tts-bar-x" aria-label="Stop reading" title="Stop (Esc)"></button></div>`);
const TTS=('speechSynthesis' in window)&&typeof SpeechSynthesisUtterance!=='undefined';
const SAY_MAP=[[/e\.g\./g,'for example'],[/i\.e\./g,'that is'],[/\bvs\.?\b/g,'versus'],[/→/g,' gives '],[/←/g,' becomes '],[/≈/g,' approximately '],[/≠/g,' not equal to '],[/≤/g,' at most '],[/≥/g,' at least '],[/×/g,' times '],[/÷/g,' divided by '],[/·/g,' times '],[/−/g,' minus '],[/±/g,' plus or minus '],
  [/ŷ/g,' y hat '],[/θ/g,' theta '],[/σ/g,' sigma '],[/μ/g,' mu '],[/λ/g,' lambda '],[/α/g,' alpha '],[/β/g,' beta '],[/γ/g,' gamma '],[/ε/g,' epsilon '],[/η/g,' eta '],[/δ/g,' delta '],[/[Σ∑]/g,' sum of '],[/∏|Π/g,' product of '],[/∂/g,' partial '],[/∇/g,' gradient '],[/φ/g,' phi '],[/π/g,' pi '],[/∞/g,' infinity '],
  [/²/g,' squared '],[/³/g,' cubed '],[/ᵀ/g,' transpose '],[/ᵈ/g,' to the d '],[/ⁿ/g,' to the n '],[/[‖|]/g,' '],[/%/g,' percent'],[/[₀₁₂₃₄₅₆₇₈₉]/g,c=>' '+('₀₁₂₃₄₅₆₇₈₉'.indexOf(c))],[/ᵢ/g,' i '],[/ⱼ/g,' j '],[/ₜ/g,' t '],[/[𝒟]/g,'D'],[/\s+/g,' ']];
const say=t=>SAY_MAP.reduce((a,[re,r])=>a.replace(re,r),t);
let ttsOn=null, ttsSegs=[], ttsVoice=null, ttsCur=null, ttsPos=0, ttsRT=0;
/* rank voices by how natural they sound: neural/online voices first, then Siri-era premium voices, Google's voices, the decent compact ones;
   the novelty and 1980s-style voices (Zarvox, Bubbles, Eddy, Grandpa…) are left out unless they are all there is */
const TTS_JUNK=/^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Junior|Kathy|Organ|Pipe Organ|Princess|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)\b/i;
function ttsScore(v){ const n=v.name; let s=/natural|neural|online/i.test(n)?100:/premium/i.test(n)?90:/enhanced|siri/i.test(n)?80:/^Google/i.test(n)?70
    :/^(Ava|Zoe|Allison|Susan|Tom|Evan|Nathan|Joelle|Noelle|Nicky|Aaron|Samantha|Alex|Serena|Karen|Moira|Tessa|Daniel|Oliver|Jamie|Lee|Rishi|Veena)\b/i.test(n)?40:/^Microsoft/i.test(n)?30:20;
  if(/^en[-_](US|GB)/i.test(v.lang)) s+=3; if(/^(Samantha|Ava|Zoe|Serena|Alex)\b/i.test(n)) s+=2; return s; }
const ttsQ=v=>ttsScore(v)>=70;
if(audioPrefs.vq!==1){ audioPrefs.voice=''; audioPrefs.vq=1; saveAudio(); } // forget voices picked by the old ranking
function ttsVoices(){ if(!TTS) return []; const en=speechSynthesis.getVoices().filter(v=>/^en(-|_|$)/i.test(v.lang)), ok=en.filter(v=>!TTS_JUNK.test(v.name));
  return (ok.length?ok:en).sort((a,b)=>ttsScore(b)-ttsScore(a)||a.name.localeCompare(b.name)); }
function ttsPickVoice(){ const vs=ttsVoices(); ttsVoice=vs.find(v=>v.voiceURI===audioPrefs.voice)||vs[0]||null; }
const rateTxt=r=>(+r).toFixed(1)+'×';
function ttsTip(vs){ const t=$('#tts-tip'); if(!t) return; t.hidden=!vs.length||vs.some(ttsQ); if(t.hidden) return;
  const mac=/Mac/i.test(navigator.platform||navigator.userAgent);
  t.innerHTML=mac?'Sounds robotic? Get a free natural voice: <b>System Settings › Accessibility › Spoken Content › System voice › Manage Voices</b>, download an English voice marked <b>(Premium)</b> such as Ava or Zoe, then reload this page.'
    :'Sounds robotic? Open this page in <b>Microsoft Edge</b> or <b>Chrome</b> for natural-sounding voices.'; }
function renderVoices(){ ttsPickVoice(); const sel=$('#au-voice'); if(!sel) return; ttsPickVoice(); const vs=ttsVoices(); $('#tts-set').hidden=!TTS||!vs.length;
  const opt=v=>`<option value="${esc(v.voiceURI)}"${ttsVoice&&v.voiceURI===ttsVoice.voiceURI?' selected':''}>${esc(v.name.replace(/^Microsoft |^Google /,'').replace(/ Online \(Natural\)/,''))} · ${esc(v.lang)}</option>`;
  const good=vs.filter(ttsQ), rest=vs.filter(v=>!ttsQ(v));
  sel.innerHTML=good.length&&rest.length?`<optgroup label="Natural">${good.map(opt).join('')}</optgroup><optgroup label="Standard">${rest.map(opt).join('')}</optgroup>`:vs.map(opt).join('');
  ttsTip(vs); $('#au-rate').value=audioPrefs.rate; $('#au-rate-v').textContent=rateTxt(audioPrefs.rate); }
if(TTS){ renderVoices(); speechSynthesis.addEventListener?speechSynthesis.addEventListener('voiceschanged',renderVoices):(speechSynthesis.onvoiceschanged=renderVoices); }
/* speed can change mid-sentence: browsers can't retune a running utterance, so pick up again from the word being spoken */
function ttsSetRate(r){ r=Math.round(Math.max(.5,Math.min(2,r))*10)/10; audioPrefs.rate=r; saveAudio();
  $('#tts-bar-v').textContent=rateTxt(r);
  document.querySelectorAll('#tts-bar .tb-r').forEach(b=>b.disabled=(+b.dataset.d<0&&r<=.5)||(+b.dataset.d>0&&r>=2));
  if(ttsOn&&ttsCur){ clearTimeout(ttsRT); const {block,btn}=ttsCur, at=ttsPos; ttsRT=setTimeout(()=>{ if(ttsCur&&ttsCur.block===block) ttsPlay(block,btn,at); },180); } }
$('#tts-bar').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; e.stopPropagation(); if(b.id==='tts-bar-x') ttsStop(); else ttsSetRate((+audioPrefs.rate||1)+(+b.dataset.d)*.1); });
$('#tts-bar-x').textContent='✕';
const SPK_BTN=TTS?`<button type="button" class="spk" aria-label="Read this block aloud" title="Listen to this block"><svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/></svg><span class="spk-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>`:'';
function addSpeakers(root){ if(!TTS) return; root.querySelectorAll(FZ_SEL).forEach(b=>{ if(!b.querySelector(':scope > .spk')) b.insertAdjacentHTML('afterbegin',SPK_BTN); }); }
/* walk the block's text, joining pieces with pauses; remember where each piece sits so spoken words can be highlighted */
const TTS_UNIT='.sex>b,.strap>b,.sexam>b,.sk,.sstep span,p,h4,dt,dd,summary,figcaption,.formula,li';
function ttsCollect(block){ let text='', last=null; const segs=[];
  const w=document.createTreeWalker(block,NodeFilter.SHOW_TEXT,{acceptNode:n=>{ const p=n.parentElement; if(!p||p.closest('.spk,svg,.fx,.sprog')) return NodeFilter.FILTER_REJECT;
    const d=p.closest('details'); if(d&&!d.open&&!p.closest('summary')) return NodeFilter.FILTER_REJECT; return /\S/.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT; }});
  while(w.nextNode()){ const n=w.currentNode, unit=n.parentElement.closest(TTS_UNIT)||block;
    if(last&&unit!==last&&text&&!/[.!?:;]\s*$/.test(text)) text+='. '; else if(text&&!/\s$/.test(text)) text+=' ';
    const sp=say(n.nodeValue); segs.push({node:n,s0:text.length,s1:text.length+sp.length}); text+=sp; last=unit; }
  return {text:text.trim(),segs}; }
function ttsMark(i){ if(!window.CSS||!CSS.highlights||typeof Highlight==='undefined') return;
  const sg=ttsSegs.find(x=>i>=x.s0&&i<x.s1); if(!sg){ CSS.highlights.delete('tts'); return; }
  const t=sg.node.nodeValue, k=Math.min(t.length-1,Math.max(0,Math.round((i-sg.s0)/Math.max(1,sg.s1-sg.s0)*t.length))); let a=k, b=k;
  while(a>0&&/\S/.test(t[a-1])) a--; while(b<t.length&&/\S/.test(t[b])) b++; if(a===b) return;
  try{ const r=new Range(); r.setStart(sg.node,a); r.setEnd(sg.node,b); CSS.highlights.set('tts',new Highlight(r)); }catch(e){} }
function ttsDuck(on){}
function ttsStop(){ if(!TTS) return; const was=ttsOn; ttsOn=null; ttsCur=null; clearTimeout(ttsRT); $('#tts-bar').hidden=true; speechSynthesis.cancel(); if(window.CSS&&CSS.highlights) CSS.highlights.delete('tts');
  document.querySelectorAll('.spk.on').forEach(b=>{ b.classList.remove('on'); b.setAttribute('aria-label','Read this block aloud'); }); document.querySelectorAll('.tts-reading').forEach(b=>b.classList.remove('tts-reading')); if(was) ttsDuck(false); }
function ttsPlay(block,btn,from){
  ttsStop(); const {text,segs}=ttsCollect(block); if(!text) return; ttsSegs=segs; ttsPickVoice();
  const token={started:false}; ttsOn=token; ttsCur={block,btn}; btn.classList.add('on'); btn.setAttribute('aria-label','Stop reading'); block.classList.add('tts-reading'); ttsDuck(true);
  $('#tts-bar').hidden=false; $('#tts-bar-v').textContent=rateTxt(audioPrefs.rate||1);
  // resume at the start of the word that was playing
  let i=Math.max(0,Math.min(from||0,text.length-1)); while(i>0&&/\S/.test(text[i-1])) i--; ttsPos=i;
  // speak in sentence-sized chunks (long single utterances get cut off in some browsers)
  const chunks=[]; while(i<text.length){ let j=Math.min(text.length,i+220); if(j<text.length){ const cut=text.lastIndexOf('. ',j); j=cut>i+40?cut+2:(text.lastIndexOf(' ',j)>i?text.lastIndexOf(' ',j)+1:j); } chunks.push([text.slice(i,j),i]); i=j; }
  chunks.forEach(([t,base],k)=>{ const u=new SpeechSynthesisUtterance(t); if(ttsVoice){ u.voice=ttsVoice; u.lang=ttsVoice.lang; } u.rate=+audioPrefs.rate||1; u.volume=Math.max(.2,audioPrefs.vol/100);
    u.onboundary=e=>{ if(ttsOn===token&&(e.name==='word'||e.name===undefined)){ ttsPos=base+e.charIndex; ttsMark(ttsPos); } };
    u.onstart=()=>{ token.started=true; if(ttsOn===token){ ttsPos=base; ttsMark(base); } };
    if(k===chunks.length-1){ u.onend=()=>{ if(ttsOn===token) ttsStop(); }; u.onerror=u.onend; }
    speechSynthesis.speak(u); });
  // some browsers (e.g. Opera builds without system voices) accept speak() but never talk: give up cleanly and say why
  setTimeout(()=>{ if(ttsOn===token&&!token.started&&!speechSynthesis.speaking){ ttsStop(); XM.toast && XM.toast(`Read aloud needs a speech voice. Try Chrome, Edge or Safari, or install a voice in your system settings.`); } },2500);
}
document.addEventListener('click',e=>{ const b=e.target.closest('.spk'); if(!b) return; e.stopPropagation(); const blk=b.parentElement; if(b.classList.contains('on')){ ttsStop(); return; } ttsPlay(blk,b); },true);
document.addEventListener('keydown',e=>{ if(!ttsOn||e.target.closest('input,textarea,select,[contenteditable]')) return;
  if(e.key==='Escape'&&!document.querySelector('#xm-focus')) ttsStop();
  else if(e.key==='-'||e.key==='_') ttsSetRate((+audioPrefs.rate||1)-.1); else if(e.key==='+'||e.key==='=') ttsSetRate((+audioPrefs.rate||1)+.1); });

window.XM=window.XM||{courses:{},order:[]};
XM.tts=TTS?{ spk:SPK_BTN, stop:()=>ttsStop(), voices:()=>ttsVoices(), prefs:()=>audioPrefs, setVoice:uri=>{ audioPrefs.voice=uri; saveAudio(); ttsPickVoice(); }, setRate:r=>ttsSetRate(r) }:null;
})();
