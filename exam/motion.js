/* Motion layer, after mater.agency: headline letters arrive one by one (grey → ink), paragraphs fill in
   word by word as they scroll into view, tiles rise in a staggered cascade, big numbers count up, a ring
   cursor follows the pointer and grows over things you can press, pill buttons roll their label on
   hover, colour tiles tilt toward the pointer, course glyphs float, and opening a course sweeps its
   colour across the screen. Transform/opacity only; everything is skipped with prefers-reduced-motion,
   and nothing stays hidden if this file fails (the hidden start states are set here, not in CSS).
   Exam and mock screens stay still apart from button feedback. */
(function () {
  'use strict';
  const XM = window.XM; if (!XM || !XM.go) return;
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const EASE = 'cubic-bezier(.2,.9,.25,1)';

  /* ---------- 1. headline letters: scattered arrival from grey to ink ---------- */
  function splitLetters(h) {
    if (!h || h.dataset.split) return; h.dataset.split = '1';
    const text = h.textContent; h.setAttribute('aria-label', text); h.textContent = '';
    text.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) { h.appendChild(document.createTextNode(part)); return; }
      const w = document.createElement('span'); w.className = 'mx-word'; w.setAttribute('aria-hidden', 'true');
      for (const ch of part) { const s = document.createElement('span'); s.className = 'mx-ch'; s.textContent = ch; w.appendChild(s); }
      h.appendChild(w);
    });
    const chars = $$('.mx-ch', h);
    chars.forEach((c, i) => {
      const d = 120 + i * 28 + Math.random() * 260;
      c.animate([{ opacity: 0, transform: 'translateY(.35em)', color: 'var(--mx-grey)' }, { opacity: .45, transform: 'none', color: 'var(--mx-grey)', offset: .55 }, { opacity: 1, transform: 'none' }],
        { duration: 900 + Math.random() * 500, delay: d, easing: EASE, fill: 'backwards' });
    });
  }
  /* ---------- 2. paragraphs fill in word by word as they come into view ---------- */
  function splitWords(p) {
    if (!p || p.dataset.split || p.querySelector('button,a,input')) return; p.dataset.split = '1';
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { const frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.appendChild(document.createTextNode(t)); else { const s = document.createElement('span'); s.className = 'mx-w'; s.textContent = t; frag.appendChild(s); } });
      n.parentNode.replaceChild(frag, n); });
    const words = $$('.mx-w', p); p.classList.add('mx-dim');
    reveal(p, () => { p.classList.remove('mx-dim'); words.forEach((w, i) => w.animate([{ opacity: .18 }, { opacity: 1 }], { duration: 500, delay: i * 22, easing: 'ease-out', fill: 'backwards' })); });
  }
  /* ---------- 3. staggered rise for tiles and blocks ---------- */
  function rise(els, step) {
    els.forEach((el, i) => { if (el.dataset.rose) return; el.dataset.rose = '1'; el.classList.add('mx-pre');
      reveal(el, () => { el.classList.remove('mx-pre'); el.animate([{ opacity: 0, transform: 'translateY(34px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 760, delay: (i % 8) * (step || 70), easing: EASE, fill: 'backwards' }); }); });
  }
  let io = null; const pending = new Map();
  function reveal(el, fn) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const f = pending.get(e.target); pending.delete(e.target); io.unobserve(e.target); if (f) f(); } }), { root: document.querySelector('#xm'), rootMargin: '0px 0px -6% 0px', threshold: .08 });
    pending.set(el, fn); io.observe(el);
  }
  /* ---------- 4. big numbers count up ---------- */
  function countUp(b) {
    if (!b || b.dataset.counted) return; b.dataset.counted = '1'; const end = parseInt(b.textContent, 10); if (!(end > 1)) return;
    const t0 = performance.now(), dur = 1100 + Math.min(900, end * 12);
    const tick = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); b.textContent = Math.round(end * e); if (k < 1) requestAnimationFrame(tick); else b.textContent = end; };
    b.textContent = '0'; requestAnimationFrame(tick);
  }
  /* ---------- 5. pill buttons roll their label (mater's "Let's Talk") ---------- */
  function rollLabels(root) {
    $$('.xm-btn, .xm-bt-go, .xm-bt-weak button', root).forEach(b => {
      if (b.dataset.roll || b.children.length || !b.textContent.trim()) return; b.dataset.roll = '1';
      const t = b.textContent; b.setAttribute('aria-label', b.getAttribute('aria-label') || t.trim());
      b.innerHTML = `<span class="mx-roll" aria-hidden="true"><span>${t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</span><span>${t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</span></span>`;
    });
  }
  /* ---------- 6. colour tiles tilt toward the pointer ---------- */
  function tilt(root) {
    if (!FINE) return;
    $$('.xm-ctile, .xm-bigtile, .xm-today, .xm-ttile', root).forEach(t => {
      if (t.dataset.tilt) return; t.dataset.tilt = '1';
      t.addEventListener('pointermove', e => { const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        t.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
        const g = t.querySelector('.xm-glyph'); if (g) g.style.transform = `translate(${(x * 14).toFixed(1)}px, ${(y * 14).toFixed(1)}px) rotate(${(x * 10).toFixed(1)}deg)`; });
      t.addEventListener('pointerleave', () => { t.style.transform = ''; const g = t.querySelector('.xm-glyph'); if (g) g.style.transform = ''; });
    });
  }
  /* ---------- 7. ring cursor (desktop only) ---------- */
  let ring = null;
  function cursor() {
    if (!FINE || RM || ring) return;
    /* the system pointer is hidden while browsing (CSS: html.mx-has-cursor); the dot sits exactly on the pointer, the ring trails */
    ring = document.createElement('div'); ring.className = 'mx-cursor'; ring.innerHTML = '<i></i>';
    const dot = document.createElement('div'); dot.className = 'mx-cursor-dot';
    const host = document.querySelector('#xm') || document.body; host.appendChild(ring); host.appendChild(dot); document.documentElement.classList.add('mx-has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, big = false;
    const DARK = '.xm-top, .mx-splash, .mx-sweep, .xm-ctile, .xm-bigtile, .xm-coursehead, .xm-ttile.hot, #xm-focus .fz-bg';
    addEventListener('pointermove', e => { if (e.pointerType && e.pointerType !== 'mouse') return; tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px)`;
      const t = e.target, c = s => !!(t && t.closest && t.closest(s));
      const off = !c('#xm') || c('#ai-panel, #ai-fab') || c('input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, select, [contenteditable="true"]');
      ring.classList.toggle('on', !off); dot.classList.toggle('on', !off);
      const want = c('button, a, summary, label, [data-go], .xm-sb, input[type="checkbox"], input[type="radio"]'); if (want !== big) { big = want; ring.classList.toggle('big', big); dot.classList.toggle('big', big); }
      const dk = c(DARK); ring.classList.toggle('tile', dk); dot.classList.toggle('tile', dk); }, { passive: true });
    addEventListener('pointerdown', () => { ring.classList.add('down'); dot.classList.add('down'); });
    addEventListener('pointerup', () => { ring.classList.remove('down'); dot.classList.remove('down'); });
    document.addEventListener('pointerleave', () => { ring.classList.remove('on'); dot.classList.remove('on'); });
    addEventListener('blur', () => { ring.classList.remove('on'); dot.classList.remove('on'); });
    (function loop() { x += (tx - x) * .22; y += (ty - y) * .22; ring.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; requestAnimationFrame(loop); })();
  }
  /* ---------- 8. page transition: a sweep in the course's colour ---------- */
  function sweep(colour) {
    const w = document.createElement('div'); w.className = 'mx-sweep'; w.style.background = colour; (document.querySelector('#xm') || document.body).appendChild(w);
    const a = w.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)', offset: .45 }, { transform: 'translateY(0)', offset: .55 }, { transform: 'translateY(-100%)' }], { duration: 760, easing: 'cubic-bezier(.7,0,.25,1)' });
    a.onfinish = () => w.remove(); return 340;
  }


  /* ---------- 9. opening, driven by the scroll: at the top of Home the banner fills the screen; scrolling down
     shrinks it into the top bar (wordmark → logo, home content rising underneath); scrolling up plays it back ---------- */
  const IN = { on: false, sp: null, spacer: null, anims: [], D: 0, played: false, homeApplied: false };
  function introBuild() {
    const top = document.querySelector('.xm-top'), xm = document.querySelector('#xm'), main = document.querySelector('#xm-main'); if (!top || !xm || !main || RM) return false;
    const now = Date.now(), next = XM.order.map(id => XM.courses[id]).filter(c => c.exam && new Date(c.exam.date) > now).sort((a, b) => new Date(a.exam.date) - new Date(b.exam.date))[0];
    const days = next ? Math.ceil((new Date(next.exam.date) - now) / 864e5) : 0;
    const line = next ? `${XM.order.length} exams. ${days} day${days === 1 ? '' : 's'} to ${next.short}.` : 'All exams done.';
    const sp = document.createElement('div'); sp.className = 'mx-splash'; sp.setAttribute('role', 'presentation');
    sp.innerHTML = `<div class="mx-sp-glyphs">${XM.order.map(id => { const k = XM.SKIN[id] || {}; return `<span style="color:${k.chip || k.fg}">${XM.glyph(id)}</span>`; }).join('')}</div>
      <h2 class="mx-sp-word" aria-label="Exam Streamliner"><span class="mx-word">${[...'Exam'].map(c => `<span class="mx-ch">${c}</span>`).join('')}</span><br><span class="mx-word">${[...'Streamliner'].map(c => `<span class="mx-ch">${c}</span>`).join('')}</span></h2>
      <p class="mx-sp-line">${line}</p><button class="mx-sp-hint" type="button">Scroll to start <span aria-hidden="true">↓</span></button>`;
    xm.appendChild(sp); IN.sp = sp;
    const spacer = document.createElement('div'); spacer.className = 'mx-intro-space'; spacer.setAttribute('aria-hidden', 'true'); main.parentNode.insertBefore(spacer, main); IN.spacer = spacer;
    /* scrolling over the fixed panel must scroll the app (fixed elements do not chain scrolling to #xm) */
    sp.addEventListener('wheel', e => { xm.scrollTop += e.deltaY; e.preventDefault(); }, { passive: false });
    let ty = null; sp.addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
    sp.addEventListener('touchmove', e => { if (ty === null) return; const y = e.touches[0].clientY; xm.scrollTop += ty - y; ty = y; e.preventDefault(); }, { passive: false });
    sp.addEventListener('touchend', () => { ty = null; });
    sp.querySelector('.mx-sp-hint').addEventListener('click', () => xm.scrollTo({ top: IN.D, behavior: 'smooth' }));
    addEventListener('resize', () => { if (IN.on) { introGeometry(); introProgress(); } });
    xm.addEventListener('scroll', introProgress, { passive: true });
    IN.on = true; introGeometry();
    /* entrance on first open (time-based, only the panel's own contents) */
    $$('.mx-sp-glyphs span', sp).forEach((g, i) => g.animate([{ opacity: 0, transform: 'scale(.2) rotate(-40deg)' }, { opacity: 1, transform: 'scale(1.12) rotate(6deg)', offset: .7 }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 80 + i * 75, easing: EASE, fill: 'backwards' }));
    $$('.mx-ch', sp).forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(.5em) rotate(6deg)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: 260 + i * 34, easing: EASE, fill: 'backwards' }));
    $$('.mx-sp-line, .mx-sp-hint', sp).forEach((e, i) => e.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 900 + i * 250, easing: EASE, fill: 'backwards' }));
    return true;
  }
  /* the scroll-linked animations, rebuilt whenever the screen size changes */
  function introGeometry() {
    const sp = IN.sp, xm = document.querySelector('#xm'), top = document.querySelector('.xm-top'); if (!sp) return;
    IN.anims.forEach(a => a.cancel()); IN.anims = [];
    IN.D = Math.round(innerHeight * .9); IN.spacer.style.height = IN.D + 'px';
    const word = sp.querySelector('.mx-sp-word'), wasCompact = top.classList.contains('compact'); top.classList.remove('compact');
    const r = top.getBoundingClientRect(), logo = top.querySelector('.xm-logo').getBoundingClientRect(); if (wasCompact) top.classList.add('compact');
    word.style.transform = 'none'; const w = word.getBoundingClientRect(), rad = getComputedStyle(top).borderBottomLeftRadius || '28px';
    const k = Math.min(logo.width / w.width, logo.height / (w.height / 2)), dx = logo.left - w.left, dy = logo.top - w.top;
    const opt = { duration: 1000, fill: 'both', easing: 'linear' };
    IN.anims.push(sp.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: `inset(0px ${innerWidth - r.right}px ${Math.max(0, innerHeight - r.height)}px ${r.left}px round 0 0 ${rad} ${rad})` }], Object.assign({}, opt, { easing: 'cubic-bezier(.5,0,.25,1)' })));
    IN.anims.push(word.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(${k})`, opacity: 1, offset: .85 }, { transform: `translate(${dx}px, ${dy}px) scale(${k})`, opacity: 0 }], Object.assign({}, opt, { easing: 'cubic-bezier(.5,0,.25,1)' })));
    $$('.mx-sp-glyphs, .mx-sp-line, .mx-sp-hint', sp).forEach((e, i) => IN.anims.push(e.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${-30 - i * 10}px)`, offset: .35 }, { opacity: 0, transform: `translateY(${-30 - i * 10}px)` }], opt)));
    IN.anims.forEach(a => a.pause());
  }
  function introProgress() {
    if (!IN.on || !IN.sp) return; const xm = document.querySelector('#xm'), home = XM.view && XM.view().name === 'home';
    const p = home ? Math.max(0, Math.min(1, xm.scrollTop / IN.D)) : 1;
    IN.anims.forEach(a => { a.currentTime = p * 1000; });
    IN.sp.style.visibility = p >= 1 ? 'hidden' : 'visible'; IN.sp.style.pointerEvents = p >= .98 ? 'none' : 'auto';
    if (home && p > .45 && !IN.homeApplied) { IN.homeApplied = true; apply('home'); }
  }
  /* called after every view change */
  function introView(name, first) {
    if (!IN.on) return;
    IN.spacer.style.display = name === 'home' ? '' : 'none';
    const xm = document.querySelector('#xm');
    if (name === 'home') { xm.scrollTop = first ? 0 : IN.D; if (first) { IN.homeApplied = false; rollLabels(xm); } else { IN.homeApplied = true; apply('home'); } }
    introProgress();
  }
  /* the banner compacts once you scroll (the ticker folds away) */
  function compactOnScroll() {
    const xm = document.querySelector('#xm'), top = document.querySelector('.xm-top'); if (!xm || !top) return;
    let on = false; xm.addEventListener('scroll', () => { const base = IN.on && IN.spacer && IN.spacer.style.display !== 'none' ? IN.D : 0; const c = xm.scrollTop > base + 60; if (c !== on) { on = c; top.classList.toggle('compact', c); } }, { passive: true });
  }

  /* ---------- apply after every view ---------- */
  function apply(name) {
    const main = document.querySelector('#xm-main'); if (!main) return;
    rollLabels(document.querySelector('#xm'));
    if (RM) return;
    if (name === 'exam' || name === 'mark') return;              // keep exam screens still
    splitLetters(main.querySelector('.xm-display')); splitLetters(main.querySelector('.xm-coursehead h1')); splitLetters(main.querySelector('.xm-study h1'));
    $$('.xm-sub, .xm-lead, .xm-ch-format', main).forEach(splitWords);
    $$('.xm-bt-num b, .xm-ct-num b', main).forEach(countUp);
    rise($$('.xm-bigtile, .xm-today', main), 120);
    rise($$('.xm-ctile', main), 80);
    rise($$('.xm-coursehead, .xm-card, .xm-topic, .xm-li, .xm-paper', main), 45);
    rise($$('.xm-ttile', main), 55);
    rise($$('.xm-study .xm-sb, .xm-study .xm-readrow', main), 55);
    rise($$('.xm-q', main), 60);
    tilt(main);
  }
  const go = XM.go;
  XM.go = function (name, params) {
    const prev = XM.view && XM.view(), c = params && params.c && XM.SKIN && XM.SKIN[params.c];
    const toCourse = !RM && name === 'course' && c && (!prev || prev.name !== 'course' || prev.c !== params.c);
    if (toCourse && !XM._noSweep) { const d = sweep(c.bg); setTimeout(() => { go.call(XM, name, params); if (IN.on) introView(name, false); apply(name); }, d); return; }
    go.call(XM, name, params); if (IN.on && name === 'home') introView(name, false); else { if (IN.on) introView(name, false); apply(name); }
  };
  XM.motion = { apply };
  const start = () => { compactOnScroll(); cursor(); const v = XM.view && XM.view().name; if (v === 'home' && introBuild()) introView('home', true); else apply(v); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0)); else setTimeout(start, 0);
})();
