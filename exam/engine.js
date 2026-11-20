/* Exam Streamliner — exam engine.
   Question = {title, topic, source, figure, prompt, parts:[Part], solution:[html], traps:[html]}
   Part types: mcq · numeric · text · order · table · written · code · blocks · free
   Grading returns a fraction 0..1 per part; points = fraction × part.points. */
(function (G) {
'use strict';
const XM = G.XM = G.XM || { courses: {}, order: [] };
const L = XM.lib;

/* ======================= registry ======================= */
XM.register = function (c) {
  c.templates = c.templates || {}; c.topics = c.topics || {}; c.papers = c.papers || [];
  Object.entries(c.templates).forEach(([id, t]) => { t.id = id; });
  XM.courses[c.id] = c; if (!XM.order.includes(c.id)) XM.order.push(c.id);
};

/* build a question from a template id + seed, and fill defaults */
XM.make = function (course, tplId, seed, opts) {
  const t = course.templates[tplId]; if (!t) throw new Error('no template ' + tplId);
  const r = L.rng(seed); const q = t.gen(r, L, opts || {});
  q.tpl = tplId; q.seed = seed; q.topic = q.topic || t.topic; q.title = q.title || t.title; q.source = q.source || t.source || '';
  return XM.finish(q, r);
};
XM.finish = function (q, r) {
  r = r || L.rng(1);
  q.parts.forEach((p, i) => {
    p.i = i; if (p.points === undefined) p.points = 1;
    if (p.type === 'mcq' && !p.perm) p.perm = p.noShuffle ? L.range(0, p.options.length) : r.shuffle(L.range(0, p.options.length));
    if (p.type === 'order' && !p.start) { let s = r.shuffle(p.items.slice()); let k = 0; while (p.items.length > 1 && s.join() === p.answer.join() && k++ < 9) s = r.shuffle(p.items.slice()); p.start = s; }
  });
  q.points = L.round(L.sum(q.parts.map(p => p.points)), 2);
  return q;
};
/* scale part points so the question is worth `target` (keeps ratios, rounds to 0.5) */
XM.scale = function (q, target) {
  const tot = L.sum(q.parts.map(p => p.points)); if (!tot) return q;
  q.parts.forEach(p => { p.points = Math.max(.5, Math.round(p.points / tot * target * 2) / 2); });
  for (let k = 0; k < 50; k++) { const diff = L.round(target - L.sum(q.parts.map(p => p.points)), 4); if (Math.abs(diff) < 1e-9) break;
    const cand = q.parts.slice().sort((a, b) => b.points - a.points).find(p => p.points + Math.sign(diff) * .5 >= .5); if (!cand) break; cand.points = L.round(cand.points + Math.sign(diff) * Math.min(.5, Math.abs(diff)), 4); }
  q.points = target; return q;
};

/* ======================= grading ======================= */
XM.parseNum = function (s) {
  if (s === null || s === undefined) return NaN; s = String(s).trim();
  if (!s) return NaN; s = s.replace(/[\s  ]/g, '').replace(/−/g, '-').replace(/€|%$/g, '');
  if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.'); else s = s.replace(/,/g, '');
  if (/^-?[\d.]+\/[\d.]+$/.test(s)) { const [a, b] = s.split('/').map(Number); return a / b; }
  if (/^(inf|∞)$/i.test(s)) return Infinity;
  const v = Number(s); return isFinite(v) ? v : NaN;
};
XM.numOk = function (v, ans, p) {
  if (!isFinite(ans)) return v === ans;
  if (!isFinite(v)) return false;
  const abs = p.tol !== undefined ? p.tol : 0, rel = p.rtol !== undefined ? p.rtol : (p.tol !== undefined ? 0 : 0.005);
  return Math.abs(v - ans) <= Math.max(abs, rel * Math.abs(ans), 1e-9);
};
function cellOk(c, v) {
  if (c.num) { const x = XM.parseNum(v); return XM.numOk(x, Number(c.a), c); }
  const accept = [].concat(c.a).map(a => c.set ? L.normSet(a) : L.norm(a));
  const got = c.set ? L.normSet(v) : L.norm(v);
  if (c.num !== false) { const x = XM.parseNum(v); if (accept.some(a => a !== '' && isFinite(Number(a)) && x === Number(a))) return true; }
  return accept.includes(got);
}
XM.cellOk = cellOk;
XM.grade = function (p, resp) {
  switch (p.type) {
    case 'free': return { s: 1 };
    case 'mcq': {
      if (Array.isArray(p.answer)) { const sel = new Set(resp || []); const good = p.answer.filter(a => sel.has(a)).length, bad = [...sel].filter(a => !p.answer.includes(a)).length;
        return { s: Math.max(0, (good - bad) / p.answer.length) }; }
      return { s: resp === p.answer ? 1 : 0 };
    }
    case 'numeric': return { s: XM.numOk(XM.parseNum(resp), p.answer, p) ? 1 : 0 };
    case 'text': { const v = resp == null ? '' : String(resp); return { s: [].concat(p.answer).some(a => L.norm(a) === L.norm(v)) || (v.trim() && p.check && p.check(v)) ? 1 : 0 }; }
    case 'order': {
      const got = resp || [];
      if (p.check) return { s: got.length === p.answer.length && p.check(got) ? 1 : 0, valid: true };
      const n = p.answer.length; let k = 0; for (let i = 0; i < n; i++) if (got[i] === p.answer[i]) k++;
      const den = Math.max(n, got.length);
      return { s: p.strict ? (k === n && got.length === n ? 1 : 0) : k / den, pos: got.map((a, i) => p.answer[i] === a) };
    }
    case 'table': {
      /* cells whose answer is empty (an empty slot, no predecessor) earn nothing when left blank,
         but a wrong entry in them costs one cell: a blank table never scores. */
      const cells = []; let ok = 0, tot = 0, bad = 0, emptyTot = 0; (p.rows || []).forEach((row, ri) => row.cells.forEach((c, ci) => { if (!c || c.given) return; const v = ((resp || {})[ri + ',' + ci]) || '';
        const empty = [].concat(c.a).every(a => L.norm(a) === ''); const g = cellOk(c, v);
        if (empty) { emptyTot++; if (!g) bad++; } else { tot++; if (g) ok++; } cells.push([ri, ci, g]); }));
      if (!tot) return { s: emptyTot ? (bad ? 0 : 1) : 1, cells };
      return { s: Math.max(0, (ok - bad) / tot), cells };
    }
    case 'code': { const got = resp || {}; const res = p.blanks.map((acc, i) => [].concat(acc).some(a => L.norm(a).replace(/\s/g, '') === L.norm(got[i] || '').replace(/\s/g, '')));
      return { s: L.sum(res.map(Number)) / p.blanks.length, blanks: res }; }
    case 'blocks': { const sel = new Set(resp || []); let good = 0, bad = 0, need = 0;
      p.groups.forEach((g, gi) => g.options.forEach((o, oi) => { const k = gi + ':' + oi; if (o.ok) { need++; if (sel.has(k)) good++; } else if (sel.has(k)) bad++; }));
      return { s: Math.max(0, (good - bad) / need) }; }
    case 'written': { const ticks = (resp && resp.ticks) || {}; const tot = L.sum(p.rubric.map(r => r[0])); const got = L.sum(p.rubric.map((r, i) => ticks[i] ? r[0] : 0)); return { s: tot ? got / tot : 0, self: true }; }
  }
  return { s: 0 };
};
XM.isSelf = p => p.type === 'written';

/* ======================= storage ======================= */
const KEY = 'xm.v1';
let DB = { stats: {}, hist: {}, run: null, boss: {}, seen: {} };
function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) DB = Object.assign(DB, s); } catch (e) {} }
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }
XM.db = () => DB;
function stat(cid, tpl) { DB.stats[cid] = DB.stats[cid] || {}; return DB.stats[cid][tpl] = DB.stats[cid][tpl] || { n: 0, avg: 0, streak: 0, due: 0, last: 0 }; }
XM.record = function (cid, tpl, frac) {
  const s = stat(cid, tpl), now = Date.now();
  s.avg = s.n ? .55 * s.avg + .45 * frac : frac; s.n++; s.last = now;
  if (frac >= .85) { s.streak++; s.due = now + [1, 3, 7, 14, 30][Math.min(4, s.streak - 1)] * 864e5 / (s.avg < .8 ? 3 : 1); }
  else if (frac >= .5) { s.streak = 0; s.due = now + 6 * 36e5; }
  else { s.streak = 0; s.due = now + 10 * 6e4; }
  save();
};
/* topic mastery: mean of the template averages (unseen templates count as 0) */
XM.topicMastery = function (c, topic) {
  const T = Object.values(c.templates).filter(t => t.topic === topic && !t.hidden); if (!T.length) return null;
  const st = DB.stats[c.id] || {}; const seen = T.filter(t => st[t.id]);
  return { m: L.sum(T.map(t => st[t.id] ? st[t.id].avg : 0)) / T.length, seen: seen.length, total: T.length };
};
XM.readiness = function (c) {
  const tps = Object.entries(c.topics); if (!tps.length) return 0; let w = 0, s = 0;
  tps.forEach(([k, t]) => { const m = XM.topicMastery(c, k); if (!m) return; w += t.weight; s += t.weight * m.m; }); return w ? s / w : 0;
};
/* spaced repetition pick: weighted by past-paper frequency × weakness × due */
XM.pick = function (c, topic, avoid) {
  const now = Date.now(), st = DB.stats[c.id] || {};
  const T = Object.values(c.templates).filter(t => !t.hidden && (!topic || t.topic === topic) && t.id !== avoid);
  if (!T.length) return null;
  const W = T.map(t => { const s = st[t.id], tw = (c.topics[t.topic] || { weight: .5 }).weight * (t.weight || 1);
    if (!s) return tw * 1.6; return tw * (1.15 - s.avg) * (s.due <= now ? 2.2 : .35); });
  let x = Math.random() * L.sum(W); for (let i = 0; i < T.length; i++) { x -= W[i]; if (x <= 0) return T[i].id; } return T[T.length - 1].id;
};
XM.weakest = function (c, n) {
  return Object.entries(c.topics).map(([k, t]) => ({ k, t, m: XM.topicMastery(c, k) })).filter(x => x.m)
    .sort((a, b) => (a.m.m - b.m.m) * 2 + (b.t.weight - a.t.weight)).slice(0, n || 3);
};
XM.gradeOf = function (c, pct) { const g = (c.grades || []).find(([p]) => pct >= p); return g ? g[1] : 0; };

/* ======================= DOM helpers ======================= */
let root, main;
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const h = L.esc;
function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }
function fmtCountdown(ms) { if (ms <= 0) return 'today'; const d = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5); return d ? `${d} d ${hh} h` : `${hh} h ${Math.floor(ms % 36e5 / 6e4)} min`; }
function fmtDate(iso) { const d = new Date(iso); return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'numeric' }) + (iso.length > 10 ? ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''); }
function fmtClock(s) { s = Math.max(0, Math.round(s)); const hh = Math.floor(s / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60; return (hh ? hh + ':' : '') + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'); }
const pts = x => (Math.round(x * 100) / 100).toString().replace(/\.0+$/, '');
const bar = (f, cls) => `<span class="xm-bar ${cls || ''}"><i style="width:${Math.round(Math.max(0, Math.min(1, f)) * 100)}%"></i></span>`;
function toast(msg) { const t = el(`<div class="xm-toast">${msg}</div>`); root.appendChild(t); setTimeout(() => t.classList.add('out'), 2200); setTimeout(() => t.remove(), 2700); }
function confirmBox(msg, yes, no) { return new Promise(res => { const m = el(`<div class="xm-modal"><div class="xm-card"><p>${msg}</p><div class="xm-row end"><button class="xm-btn ghost" data-a="0">${no || 'Cancel'}</button><button class="xm-btn" data-a="1">${yes || 'OK'}</button></div></div></div>`);
  root.appendChild(m); m.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b || e.target === m) { m.remove(); res(b && b.dataset.a === '1'); } }); }); }
function coins() {}   /* (coins belonged to the removed arena) */

/* ======================= shell ======================= */
let view = { name: 'home' }, timerId = null;
XM.open = function (v) {
  document.body.classList.add('xm-open'); root.hidden = false;
  if (v) XM.go(v.name, v); else if (!main.innerHTML) XM.go('home');
};
XM.close = function () {};
XM.go = function (name, params) {
  if (root) root.dataset.view = name;
  if (fz) focusClose(); try { if (XM.tts) XM.tts.stop(); } catch (e) {}
  try { renderTicker(); } catch (e) {}
  view = Object.assign({ name }, params || {}); if (timerId && name !== 'exam') { clearInterval(timerId); timerId = null; }
  const R = { notes: vNotes, study: vStudy, home: vHome, course: vCourse, practice: vPractice, exam: vExam, mark: vMark, result: vResult, papers: vPapers, browse: vBrowse }[name] || vHome;
  main.innerHTML = ''; R(view); root.scrollTop = 0; main.scrollTop = 0; window.scrollTo(0, 0);
  $$('.xm-nav button', root).forEach(b => b.classList.toggle('on', !!view.c && name !== 'home' && name !== 'notes' && b.dataset.c === view.c));
  const onb = $('.xm-nav button.on', root); if (onb) { const nv = $('.xm-nav', root); nv.scrollLeft = Math.max(0, onb.offsetLeft - nv.offsetLeft - 8); }
  const nt = $('.xm-notes-tab', root); if (nt) nt.classList.toggle('on', name === 'notes' || name === 'study');
  syncLink();
};
/* ---- shareable links: every screen has its own address, e.g. #s=study&c=dsa&p=heaps or #s=practice&c=dsa&tpl=avl&seed=123.
   Mock exams and marking are never put in a link (they belong to one person's run): those link to the course page. */
const LINK_KEYS = { home: [], notes: ['q'], course: ['c'], study: ['c', 'p'], papers: ['c'], browse: ['c'], practice: ['c', 'topic', 'tpl', 'seed', 'paper', 'k'] };
let linkFromUrl = false, lastLink = { name: null, c: null, p: null };
function linkFor(v) {
  let name = v.name; if (!LINK_KEYS[name]) name = v.c ? 'course' : 'home';
  const o = name === 'practice' && !v.paper ? Object.assign({}, v, { tpl: v._tpl || v.tpl, seed: v._seed || v.seed }) : v;
  const sp = new URLSearchParams(); if (name !== 'home') sp.set('s', name);
  LINK_KEYS[name].forEach(k => { const x = o[k]; if (x !== undefined && x !== null && x !== '' && (typeof x === 'string' || typeof x === 'number')) sp.set(k, String(x)); });
  const str = sp.toString(); return { name, hash: str ? '#' + str : '' };
}
function syncLink() {
  if (typeof history === 'undefined' || !history.replaceState) return;
  const L2 = linkFor(view), url = location.pathname + location.search + L2.hash;
  if (url === location.pathname + location.search + location.hash) { lastLink = { name: L2.name, c: view.c, p: view.p }; return; }
  // new history entry when the place changes (Back works); typing in search or "next question" just updates the link
  const same = lastLink.name === L2.name && lastLink.c === view.c && lastLink.p === view.p;
  try { history[linkFromUrl || same ? 'replaceState' : 'pushState'](null, '', url); } catch (e) {}
  lastLink = { name: L2.name, c: view.c, p: view.p };
}
// read a link → a screen; anything unknown or broken falls back to the course page or home
function viewFromLink(hash) {
  const sp = new URLSearchParams(String(hash || '').replace(/^#/, '')), name = sp.get('s') || 'home';
  if (!LINK_KEYS[name]) return null;
  const v = { name }; LINK_KEYS[name].forEach(k => { const x = sp.get(k); if (x !== null && x.length <= 200) v[k] = x; });
  if ('c' in v && !XM.courses[v.c]) return null;
  if (name !== 'home' && name !== 'notes' && !v.c) return null;
  if (v.seed !== undefined) { v.seed = parseInt(v.seed, 10); if (!(v.seed >= 0)) delete v.seed; }
  if (v.k !== undefined) { v.k = Math.max(0, parseInt(v.k, 10) || 0); }
  const c = XM.courses[v.c];
  if (v.tpl && !(c.templates && c.templates[v.tpl])) { delete v.tpl; delete v.seed; }
  if (v.paper && !(c.papers || []).some(P => P.id === v.paper)) { delete v.paper; delete v.k; }
  if (v.topic && !(c.topics && c.topics[v.topic])) delete v.topic;
  if (v.p && !(XM.study[c.id] || []).some(P => P.id === v.p)) delete v.p;
  return v;
}
function openLink(hash) {
  const v = viewFromLink(hash); if (!v) return false;
  linkFromUrl = true;
  try { XM.go(v.name, v); } catch (e) { try { XM.go(v.c ? 'course' : 'home', v.c ? { c: v.c } : {}); } catch (e2) { XM.go('home'); } }
  linkFromUrl = false; return true;
}
if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('hashchange', () => {
  if (location.hash === linkFor(view).hash) return;          // our own update
  if (view.name === 'exam' && DB.run && !DB.run.handed) return; // never yank someone out of a running mock exam
  if (!openLink(location.hash)) { linkFromUrl = true; XM.go('home'); linkFromUrl = false; }
});
function shell() {
  root = el(`<div id="xm" class="xm" hidden>
    <header class="xm-top"><div class="xm-topbar"><button class="xm-logo" data-go="home" aria-label="Exam Streamliner home">Exam Streamliner</button>
      <nav class="xm-nav" aria-label="Courses"></nav>
      <button class="xm-btn sm xm-notes-tab" data-go="notes" title="All Study Hall notes">Notes</button>
      <button class="xm-btn ghost sm xm-theme" id="xm-theme" aria-label="Switch light/dark mode" title="Light / dark mode"></button></div>
      <div class="xm-ticker" aria-label="Countdown to every exam"><div class="xm-ticker-track"></div></div></header>
    <main class="xm-main" id="xm-main"></main></div>`);
  document.body.appendChild(root); main = $('#xm-main', root);
  /* keep sticky things under the banner whatever its height */
  const topEl = $('.xm-top', root); const setH = () => root.style.setProperty('--xm-top-h', topEl.offsetHeight + 'px');
  if ('ResizeObserver' in window) new ResizeObserver(setH).observe(topEl); setH();
  const nav = $('.xm-nav', root);
  XM.order.forEach(id => { const c = XM.courses[id]; nav.appendChild(el(`<button data-go="course" data-c="${id}" style="${skinStyle(id)}"><span class="xm-navg">${XM.glyph(id)}</span>${h(c.short)}</button>`)); });
  renderTicker();
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b || b.disabled) return;
    if (b.closest('.xm-q') && !b.closest('.xm-qhead')) return;
    e.preventDefault(); const d = Object.assign({}, b.dataset); const n = d.go; delete d.go; if (d.seed) d.seed = +d.seed; XM.go(n, d);
  });
  const th = $('#xm-theme', root), paint = () => { const dark = document.documentElement.dataset.theme === 'dark'; th.innerHTML = dark ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5" fill="currentColor" stroke="none"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>'; th.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); };
  th.onclick = () => { const dark = document.documentElement.dataset.theme !== 'dark'; if (dark) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme; try { localStorage.setItem('xm.theme', dark ? 'dark' : 'light'); } catch (e) {} paint(); };
  paint();
}


/* ======================= look: each course has a deep field colour, a pastel partner and a glyph
   drawn from its own subject (DSA a tree, PAM a process flow, TU-A1300 a pie + ledger, BA1 a feasible
   region, ML neurons, S&S a wave). ======================= */
XM.SKIN = {
  dsa: { bg: '#1B3A63', fg: '#CFE6EE' }, pam: { bg: '#00364B', fg: '#9EFCF1' }, iem: { bg: '#FFF27A', fg: '#2B2A12', ink: '#14140A', chip: '#FFF27A' },
  ba1: { bg: '#3E2A63', fg: '#E3D7FF' }, ml: { bg: '#5C2626', fg: '#F6C9C3' }, ss: { bg: '#0B2A30', fg: '#B9F3E4' }
};
XM.glyph = function (cid) {
  const g = {
    dsa: '<circle cx="60" cy="24" r="20"/><circle cx="26" cy="92" r="20"/><circle cx="94" cy="92" r="20"/><rect x="50" y="34" width="20" height="40" rx="10"/><rect x="22" y="62" width="76" height="20" rx="10"/>',
    pam: '<rect x="4" y="44" width="44" height="32" rx="16"/><circle cx="66" cy="60" r="16"/><rect x="72" y="20" width="44" height="80" rx="22"/>',
    iem: '<path d="M58 8a50 50 0 1 0 50 50H58z"/><rect x="70" y="4" width="46" height="18" rx="9"/><rect x="82" y="30" width="34" height="18" rx="9"/>',
    ba1: '<path d="M14 30 Q14 16 28 14 L66 10 Q78 10 86 18 L108 52 Q114 62 108 72 L90 104 Q84 112 74 112 L26 112 Q14 112 14 100z"/>',
    ml: '<circle cx="30" cy="60" r="26"/><circle cx="92" cy="30" r="22"/><circle cx="92" cy="90" r="22"/><rect x="44" y="52" width="40" height="16" rx="8" transform="rotate(-28 64 60)"/><rect x="44" y="52" width="40" height="16" rx="8" transform="rotate(28 64 60)"/>',
    ss: '<path d="M8 60 a26 26 0 0 1 52 0 a26 26 0 0 0 52 0" fill="none" stroke="currentColor" stroke-width="22" stroke-linecap="round"/>'
  }[cid] || '<circle cx="60" cy="60" r="48"/>';
  return `<svg class="xm-glyph" viewBox="0 0 120 120" aria-hidden="true" fill="currentColor">${g}</svg>`;
};
const skinStyle = cid => { const k = XM.SKIN[cid] || { bg: '#00364B', fg: '#9EFCF1' }; return `--tile:${k.bg};--tile-fg:${k.fg};--tile-ink:${k.ink || k.fg};--chip:${k.chip || k.fg}`; };
const daysLeft = ms => ms <= 0 ? { n: 'Today', u: '' } : ms < 864e5 ? { n: Math.ceil(ms / 36e5), u: Math.ceil(ms / 36e5) === 1 ? 'hour' : 'hours' } : { n: Math.ceil(ms / 864e5), u: Math.ceil(ms / 864e5) === 1 ? 'day' : 'days' };


/* the countdown strip under the banner (like mater's rolling "Let's Talk" strip) */
function renderTicker() {
  const tr = root && $('.xm-ticker-track', root); if (!tr) return; const now = Date.now();
  const items = upcoming().map(c => { const d = daysLeft(new Date(c.exam.date) - now);
    return `<span class="xm-tk" style="${skinStyle(c.id)}"><span class="xm-tkg">${XM.glyph(c.id)}</span><b>${h(c.short)}</b> ${d.u ? `${d.n} ${d.u}` : 'today'}<em>${fmtDate(c.exam.date)}</em></span>`; }).join('');
  const one = `<div class="xm-tk-run">${items}</div>`;
  tr.innerHTML = one + one.replace('class="xm-tk-run"', 'class="xm-tk-run" aria-hidden="true"');
}

/* ======================= HOME: exam countdown ======================= */
function upcoming() { const now = Date.now(); return XM.order.map(id => XM.courses[id]).filter(c => c.exam && new Date(c.exam.end || c.exam.date).getTime() + 3 * 36e5 > now).sort((a, b) => new Date(a.exam.date) - new Date(b.exam.date)); }
function vHome() {
  const now = new Date(), list = upcoming(), next = list[0];
  const today = (XM.plan || []).filter(p => now >= new Date(p.from) && now < new Date(new Date(p.to).getTime() + 864e5));
  let s = '';
  if (next) { const ms = new Date(next.exam.date) - now, d = daysLeft(ms), r = XM.readiness(next), weak = XM.weakest(next, 3), hist = (DB.hist[next.id] || []).slice(-1)[0];
    s += `<section class="xm-home-head"><h1 class="xm-display">${d.u ? `${d.n} ${d.u} to ${h(next.short)}.` : `${h(next.short)} is today.`}</h1>
      <p class="xm-sub">${h(next.name)} · ${fmtDate(next.exam.date)} · ${h(next.exam.format)}</p>
      <div class="xm-row wrap"><button class="xm-btn" data-go="study" data-c="${next.id}">Open the Study Hall</button><button class="xm-btn ghost" data-go="practice" data-c="${next.id}">Smart practice</button>${next.mock ? `<button class="xm-btn ghost" data-go="exam" data-c="${next.id}" data-kind="mock">Mock exam</button>` : ''}${next.papers.length ? `<button class="xm-btn ghost" data-go="papers" data-c="${next.id}">Past papers</button>` : ''}</div></section>`;
    s += `<section class="xm-board"><div class="xm-bigtile" style="${skinStyle(next.id)}">${XM.glyph(next.id)}
        <div class="xm-bt-top"><b>${h(next.name)}</b><span>${h(next.code)} · ${h(next.exam.where || '')}</span></div>
        <div class="xm-bt-num"><b>${d.n}</b><span>${d.u ? d.u + ' left' : ''}</span></div>
        <div class="xm-bt-kpis"><div><span>Readiness</span><b>${Math.round(r * 100)} %</b>${bar(r, 'tile')}</div>${hist ? `<div><span>Last mock</span><b>${Math.round(hist.pct)} %${hist.grade !== undefined ? ' · grade ' + hist.grade : ''}</b></div>` : ''}</div>
        ${weak.length ? `<div class="xm-bt-weak"><span>${weak.some(w => w.m.seen) ? 'Weakest topics' : 'Start with'}</span>${weak.map(w => `<button data-go="practice" data-c="${next.id}" data-topic="${w.k}">${h(w.t.name)}</button>`).join('')}</div>` : ''}
        <button class="xm-bt-go" data-go="course" data-c="${next.id}" aria-label="Open ${h(next.name)}">Open course →</button></div>`;
    if (today.length) s += `<div class="xm-today"><h2>Today</h2><p class="xm-today-date">${now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p><ul>${[].concat.apply([], today.map(p => p.tasks)).map(t => `<li>${t.c && XM.courses[t.c] ? `<button class="xm-link" data-go="${t.go || 'practice'}" data-c="${t.c}"${t.kind ? ` data-kind="${t.kind}"` : ''}${t.paper ? ` data-paper="${t.paper}"` : ''}>${h(t.t)}</button>` : h(t.t)}</li>`).join('')}</ul></div>`;
    s += `</section>`; }
  s += `<h2 class="xm-h2">All exams</h2><section class="xm-tiles">${list.map(c => { const ms = new Date(c.exam.date) - now, d = daysLeft(ms), r = XM.readiness(c);
    return `<button class="xm-ctile" data-go="course" data-c="${c.id}" style="${skinStyle(c.id)}">${XM.glyph(c.id)}<span class="xm-ct-num"><b>${d.n}</b>${d.u}</span><span class="xm-ct-name">${h(c.name)}</span><span class="xm-ct-meta">${fmtDate(c.exam.date)}${c.exam.tentative ? ' · check Sisu' : ''} · ${Math.round(r * 100)} % ready</span></button>`; }).join('')}</section>`;
  main.innerHTML = s;
}

/* ======================= COURSE hub ======================= */
function vCourse(v) {
  const c = XM.courses[v.c]; if (!c) return vHome(); const hist = (DB.hist[c.id] || []).slice().reverse();
  const tops = Object.entries(c.topics).map(([k, t]) => ({ k, t, m: XM.topicMastery(c, k) })).filter(x => x.m);
  const dl = c.exam ? daysLeft(new Date(c.exam.date) - Date.now()) : null;
  let s = `<section class="xm-coursehead" style="${skinStyle(c.id)}">${XM.glyph(c.id)}<p class="xm-ch-code">${h(c.code)}${c.exam ? ' · ' + fmtDate(c.exam.date) : ''}${dl && dl.u ? ` · <b>${dl.n} ${dl.u} left</b>` : ''}</p><h1>${h(c.name)}</h1><p class="xm-ch-format">${h(c.exam ? c.exam.format : '')}</p>
    <div class="xm-row wrap"><button class="xm-btn tile" data-go="study" data-c="${c.id}">Study Hall · ${(XM.study[c.id] || []).length} pages</button><button class="xm-btn tile ghost" data-go="practice" data-c="${c.id}">Smart practice</button>${c.mock ? `<button class="xm-btn tile ghost" data-go="exam" data-c="${c.id}" data-kind="mock">Mock exam · ${c.mock.minutes} min · ${c.mock.points} p</button>` : ''}${c.papers.length ? `<button class="xm-btn tile ghost" data-go="papers" data-c="${c.id}">Past papers · ${c.papers.length}</button>` : ''}<button class="xm-btn tile ghost" data-go="browse" data-c="${c.id}">All question types</button></div></section>`;
  if (c.exam && c.exam.notes) s += `<section class="xm-card"><div class="xm-eyebrow">How the exam works</div>${c.exam.notes}</section>`;
  /* topic tiles: colour strength = how often the topic is in past papers (deep / pastel / paper) */
  const ring = (m) => { const C = 2 * Math.PI * 22, d = (C * Math.max(0, Math.min(1, m))).toFixed(1); return `<svg class="xm-ring" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="22" class="tr"/><circle cx="28" cy="28" r="22" class="fg" stroke-dasharray="${d} ${C.toFixed(1)}"/></svg>`; };
  const tier = w => w >= .8 ? 'hot' : w >= .5 ? 'mid' : 'low';
  s += `<h2 class="xm-h2">Topics</h2><p class="xm-topics-key" style="${skinStyle(c.id)}"><span class="k hot"></span><span>asked almost every year</span><span class="k mid"></span><span>often</span><span class="k low"></span><span>sometimes</span><span class="xm-muted">· the big number is your mastery</span></p>
    <div class="xm-topics xm-ttiles" style="${skinStyle(c.id)}">${tops.sort((a, b) => b.t.weight - a.t.weight).map(x => { const pct = Math.round(x.m.m * 100), tr = tier(x.t.weight);
    return `<button class="xm-ttile ${tr}" data-go="practice" data-c="${c.id}" data-topic="${x.k}">
      <span class="xm-tt-top"><span class="xm-tt-slot">${h(x.t.slot || '')}</span>${ring(x.m.m)}</span>
      <b class="xm-tt-name">${h(x.t.name)}</b>
      <span class="xm-tt-foot"><span class="xm-tt-pct">${pct}<small>%</small></span><span class="xm-tt-meta">${x.t.freq ? h(x.t.freq) + '<br>' : ''}${x.m.total} question type${x.m.total > 1 ? 's' : ''}</span></span></button>`; }).join('')}</div>`;
  if (hist.length) s += `<section class="xm-card"><div class="xm-eyebrow">Your mock and past-paper results</div><table class="xm-hist"><tr><th>Date</th><th>What</th><th>Points</th><th>%</th><th>Grade</th></tr>${hist.slice(0, 12).map(x => `<tr><td>${new Date(x.t).toLocaleDateString('en-GB')}</td><td>${h(x.title)}</td><td>${pts(x.got)} / ${pts(x.max)}</td><td>${Math.round(x.pct)} %</td><td>${x.grade !== undefined ? x.grade : '–'}</td></tr>`).join('')}</table></section>`;
  main.innerHTML = s;
}
function vBrowse(v) {
  const c = XM.courses[v.c]; const by = {};
  Object.values(c.templates).filter(t => !t.hidden).forEach(t => { (by[t.topic] = by[t.topic] || []).push(t); });
  let s = `<section class="xm-card"><button class="xm-link" data-go="course" data-c="${c.id}">← ${h(c.name)}</button><h2>Every question template</h2><p class="xm-muted">Each opens with new numbers. Tap one to practise it.</p>`;
  Object.entries(by).forEach(([tp, T]) => { s += `<h3>${h((c.topics[tp] || { name: tp }).name)}</h3><div class="xm-list">${T.map(t => { const st = (DB.stats[c.id] || {})[t.id]; return `<button class="xm-li" data-go="practice" data-c="${c.id}" data-tpl="${t.id}"><span>${h(t.title)}<small>${h(t.kinds || '')}${t.source ? ' · ' + h(t.source) : ''}</small></span>${st ? `<em>${Math.round(st.avg * 100)} %</em>` : '<em class="new">new</em>'}</button>`; }).join('')}</div>`; });
  main.innerHTML = s + '</section>';
}
function vPapers(v) {
  const c = XM.courses[v.c];
  main.innerHTML = `<section class="xm-card"><button class="xm-link" data-go="course" data-c="${c.id}">← ${h(c.name)}</button><h2>Past papers</h2><p class="xm-muted">Newest first. "Sit it" runs the paper under exam conditions (timer, hand-in, self-marking). "Question by question" gives instant feedback and worked solutions.</p>
  <div class="xm-list">${c.papers.map(p => { const best = (DB.hist[c.id] || []).filter(x => x.paper === p.id).sort((a, b) => b.pct - a.pct)[0];
    return `<div class="xm-paper"><div><b>${h(p.title)}</b><small>${h(p.note || '')}</small>${best ? `<small class="ok">Best: ${Math.round(best.pct)} %</small>` : ''}</div><div class="xm-row"><button class="xm-btn sm" data-go="exam" data-c="${c.id}" data-kind="paper" data-paper="${p.id}">Sit it</button><button class="xm-btn ghost sm" data-go="practice" data-c="${c.id}" data-paper="${p.id}">Question by question</button></div></div>`; }).join('')}</div></section>`;
}



/* ======================= NOTES: every course's Study Hall in one place ======================= */
function vNotes(v) {
  DB.read = DB.read || {};
  const q = (v.q || '').toLowerCase();
  let s = `<section class="xm-card"><h1>Notes</h1><p class="xm-muted">Every course's Study Hall, ordered like its exam. Tap a page to read it (tap a block to zoom, 🔊 to listen).</p>
    <input class="xm-search" id="xm-nsearch" type="search" placeholder="Search all notes (e.g. tombstone, EOQ, shadow price, NPV)" value="${h(v.q || '')}" aria-label="Search notes"></section>`;
  if (q) {
    const hits = []; XM.order.forEach(cid => (XM.study[cid] || []).forEach(p => { const txt = (p.title + ' ' + (p.intro || '') + ' ' + (p.asks || []).join(' ') + ' ' + (p.know || '') + ' ' + (p.method || []).join(' ') + ' ' + (p.traps || []).join(' ')).replace(/<[^>]+>/g, ' ');
      const i = txt.toLowerCase().indexOf(q); if (i >= 0) hits.push({ cid, p, snip: txt.slice(Math.max(0, i - 60), i + q.length + 80) }); }));
    s += `<section class="xm-card"><div class="xm-eyebrow">${hits.length} page${hits.length === 1 ? '' : 's'} mention “${h(v.q)}”</div><div class="xm-list">${hits.map(x => `<button class="xm-li" data-go="study" data-c="${x.cid}" data-p="${x.p.id}"><span><small>${h(XM.courses[x.cid].short)} · ${h(x.p.slot || '')}</small>${h(x.p.title)}<small>…${h(x.snip).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), m => `<mark>${m}</mark>`)}…</small></span></button>`).join('') || '<p class="xm-muted">No matches.</p>'}</div></section>`;
  } else XM.order.forEach(cid => { const c = XM.courses[cid], pages = XM.study[cid] || []; if (!pages.length) return; const rd = DB.read[cid] || {};
    s += `<section class="xm-card" style="--acc:${c.accent}"><div class="xm-row" style="margin:0;justify-content:space-between"><h2 style="margin:0">${h(c.name)} <small class="xm-muted">${h(c.code)}</small></h2><span class="xm-muted">${pages.filter(p => rd[p.id]).length} / ${pages.length} read</span></div>
      <div class="xm-notegrid">${pages.map(p => `<button class="xm-li${rd[p.id] ? ' read' : ''}" data-go="study" data-c="${cid}" data-p="${p.id}"><span><small>${h(p.slot || '')}${rd[p.id] ? ' ✓' : ''}</small>${h(p.title)}</span></button>`).join('')}</div></section>`; });
  main.innerHTML = s;
  const inp = $('#xm-nsearch', main); let t; inp.oninput = e => { clearTimeout(t); t = setTimeout(() => { XM.go('notes', { q: e.target.value }); const n = $('#xm-nsearch', main); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); };
}

/* ======================= STUDY HALL (structured like the exam guide) =======================
   XM.study[courseId] = [{id, title, slot, intro, asks:[], know:html, fig:()=>html, method:[], example:{q,a},
                          traps:[], check:[[q,a]], topic, tpls:[]}]  */
XM.study = XM.study || {};
function vStudy(v) {
  const c = XM.courses[v.c]; if (!c) return vHome(); const pages = XM.study[c.id] || [];
  if (!pages.length) { main.innerHTML = `<section class="xm-card"><p>No Study Hall pages for this course yet.</p></section>`; return; }
  if (DB.readV !== 2) { DB.read = {}; DB.readV = 2; save(); }   /* ticks used to be set just by opening a page */
  DB.read = DB.read || {}; const rd = DB.read[c.id] = DB.read[c.id] || {};
  const pg = pages.find(p => p.id === v.p) || pages.find(p => !rd[p.id]) || pages[0], i = pages.indexOf(pg); v.p = pg.id;
  const nav = `<nav class="xm-snav" aria-label="Study Hall pages">${pages.map((p, k) => `<button data-go="study" data-c="${c.id}" data-p="${p.id}" class="${p === pg ? 'on' : ''}${rd[p.id] ? ' read' : ''}"><small>${h(p.slot || '')}</small>${h(p.title)}</button>`).join('')}</nav>
    <select class="xm-ssel" aria-label="Choose a page">${pages.map(p => `<option value="${p.id}"${p === pg ? ' selected' : ''}>${h((p.slot ? p.slot + ' · ' : '') + p.title)}${rd[p.id] ? ' ✓' : ''}</option>`).join('')}</select>`;
  /* every piece of the page is its own block: tap it to zoom (focus reader), or press its speaker to hear it */
  const B = (cls, title, body) => body ? `<section class="xm-sb ${cls}">${title ? `<h3>${title}</h3>` : ''}${body}</section>` : '';
  const list = a => a && a.length ? `<ul>${a.map(x => `<li>${x}</li>`).join('')}</ul>` : '';
  const ol = a => a && a.length ? `<ol class="xm-steps">${a.map(x => `<li>${x}</li>`).join('')}</ol>` : '';
  let fig = ''; try { fig = pg.fig ? pg.fig(L) : ''; } catch (e) { fig = ''; }
  /* split "what you need to know" into its top-level pieces (each note, table, paragraph, list) */
  const kn = document.createElement('div'); kn.innerHTML = pg.know || '';
  const knowBlocks = Array.from(kn.children).map((n, k) => B('know', k === 0 ? 'What you need to know' : '', n.outerHTML)).join('') + (fig ? B('know fig', '', `<div class="xm-fig">${fig}</div>`) : '');
  const practise = (pg.topic || (pg.tpls && pg.tpls.length)) ? `<div class="xm-row wrap">${pg.topic ? `<button class="xm-btn" data-go="practice" data-c="${c.id}" data-topic="${pg.topic}">Practise this (${h((c.topics[pg.topic] || {}).name || pg.topic)})</button>` : ''}${(pg.tpls || []).map(t => c.templates[t] ? `<button class="xm-btn ghost sm" data-go="practice" data-c="${c.id}" data-tpl="${t}">${h(c.templates[t].title)}</button>` : '').join('')}</div>` : '';
  const tts = XM.tts;
  const art = `<article class="xm-study" data-topic="${h(pg.title)}">
    <div class="xm-eyebrow">${h(c.code)}${pg.slot ? ' · ' + h(pg.slot) : ''} · page ${i + 1} of ${pages.length}</div><h1>${h(pg.title)}</h1>
    <div class="xm-stools">${tts ? `<label class="xm-voice">Voice <select id="xm-voice"></select></label><span class="xm-rate"><button class="xm-btn ghost sm" data-r="-1" aria-label="Slower">−</button><b id="xm-rate-v"></b><button class="xm-btn ghost sm" data-r="1" aria-label="Faster">+</button></span>` : ''}<span class="xm-muted xm-hint2">Tap any block to zoom in${tts ? ' · press 🔊 to hear it' : ''}</span></div>
    ${pg.intro ? B('lead', '', `<p class="xm-lead">${pg.intro}</p>`) : ''}
    ${B('asks', 'What the exam asks', list(pg.asks))}
    ${knowBlocks}
    ${B('method', 'Method: step by step', ol(pg.method))}
    ${pg.example ? B('example', 'Worked example', `<div class="xm-exq">${pg.example.q}</div><div class="xm-exa"><p><b>Model answer</b></p>${pg.example.a}</div>`) : ''}
    ${B('traps', 'Where marks get lost', list(pg.traps))}
    ${pg.check && pg.check.length ? `<h3 class="xm-ckh">Check yourself</h3>` + pg.check.map(([q, a]) => B('check', '', `<details class="xm-chk"><summary>${q}</summary><div>${a}</div></details>`)).join('') : ''}
    <div class="xm-readrow"><button class="xm-btn xm-markread${rd[pg.id] ? ' done' : ''}" aria-pressed="${rd[pg.id] ? 'true' : 'false'}">${rd[pg.id] ? '✓ Read — tap to undo' : 'Mark as read'}</button><span class="xm-muted">Mark it only when you could answer the exam questions on this page.</span></div>
    ${practise}
    <div class="xm-row wrap xm-pager">${i > 0 ? `<button class="xm-btn ghost" data-go="study" data-c="${c.id}" data-p="${pages[i - 1].id}">← ${h(pages[i - 1].title)}</button>` : ''}${i < pages.length - 1 ? `<button class="xm-btn" data-go="study" data-c="${c.id}" data-p="${pages[i + 1].id}">${h(pages[i + 1].title)} →</button>` : ''}</div>
  </article>`;
  main.innerHTML = `<div class="xm-crumbs"><button class="xm-link" data-go="course" data-c="${c.id}">← ${h(c.short)}</button><span>Study Hall · ${Object.keys(rd).length} / ${pages.length} pages read</span></div><div class="xm-sgrid">${nav}${art}</div>`;
  $('.xm-ssel', main).onchange = e => XM.go('study', { c: c.id, p: e.target.value });
  const on = $('.xm-snav .on', main); if (on && on.scrollIntoView) try { on.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  const artEl = $('.xm-study', main);
  const mb = $('.xm-markread', artEl); if (mb) mb.onclick = () => { if (rd[pg.id]) delete rd[pg.id]; else rd[pg.id] = 1; save();
    const done = !!rd[pg.id]; mb.classList.toggle('done', done); mb.setAttribute('aria-pressed', done); mb.textContent = done ? '✓ Read — tap to undo' : 'Mark as read';
    const nb = $(`.xm-snav [data-p="${pg.id}"]`, main); if (nb) nb.classList.toggle('read', done);
    const op = $(`.xm-ssel option[value="${pg.id}"]`, main); if (op) op.textContent = op.textContent.replace(/ ✓$/, '') + (done ? ' ✓' : '');
    const cr = $('.xm-crumbs span', main); if (cr) cr.textContent = `Study Hall · ${Object.keys(rd).length} / ${pages.length} pages read`;
    if (done) toast('Marked as read'); };
  if (tts) { $$('.xm-sb', artEl).forEach(b => b.insertAdjacentHTML('afterbegin', tts.spk)); studyTools(tts); }
  artEl.addEventListener('click', e => { if (e.target.closest('button,a,summary,details,input,textarea,select,.spk')) return; const blk = e.target.closest('.xm-sb'); if (blk) focusOpen(blk, artEl); });
}
function studyTools(tts) {
  const sel = $('#xm-voice', main), rv = $('#xm-rate-v', main); if (!sel) return;
  const fill = () => { const vs = tts.voices(), cur = tts.prefs().voice; sel.innerHTML = vs.map(v => `<option value="${h(v.voiceURI)}"${v.voiceURI === cur ? ' selected' : ''}>${h(v.name.replace(/^Microsoft |^Google /, '').replace(/ Online \(Natural\)/, ''))} · ${h(v.lang)}</option>`).join('') || '<option>default</option>'; rv.textContent = (+tts.prefs().rate || 1).toFixed(1) + '×'; };
  fill(); try { speechSynthesis.addEventListener('voiceschanged', fill, { once: true }); } catch (e) {}
  sel.onchange = e => tts.setVoice(e.target.value);
  $$('.xm-rate [data-r]', main).forEach(b => b.onclick = () => { tts.setRate((+tts.prefs().rate || 1) + (+b.dataset.r) * .1); rv.textContent = (+tts.prefs().rate || 1).toFixed(1) + '×'; });
}
/* ---------- focus reader: the tapped block fills the screen; scroll / swipe / arrow keys move one block at a time ---------- */
let fz = null;
function focusOpen(src, art) {
  const blocks = $$('.xm-sb', art), start = blocks.indexOf(src); if (start < 0) return;
  const tts = XM.tts; if (tts) tts.stop();
  const f = el(`<div id="xm-focus" role="dialog" aria-modal="true" aria-label="Focus reader"><div class="fz-bg"></div>
    <div class="fz-bar"><div class="fz-title"><span class="xm-eyebrow">${h(art.dataset.topic || '')}</span><b id="xm-fz-count"></b></div><button class="xm-btn ghost sm" id="xm-fz-x" aria-label="Close focus reader" title="Close (Esc)">✕</button></div>
    <div class="fz-track" tabindex="-1">${blocks.map((b, k) => `<section class="fz-slide" data-i="${k}"><div class="fz-card">${b.outerHTML}</div></section>`).join('')}</div>
    <nav class="fz-dots">${blocks.map((_, k) => `<button data-k="${k}" aria-label="Block ${k + 1}"></button>`).join('')}</nav>
    <div class="fz-hint">↓ scroll for the next block</div></div>`);
  root.appendChild(f); const tr = $('.fz-track', f);
  $$('.fz-card details', f).forEach(d => d.open = true);
  fz = { f, tr, n: blocks.length, i: start, lock: 0, src: blocks };
  const set = k => { fz.i = k; $('#xm-fz-count', f).textContent = `${k + 1} / ${fz.n}`; $$('.fz-slide', tr).forEach((sl, j) => sl.classList.toggle('cur', j === k)); $$('.fz-dots button', f).forEach((d, j) => d.classList.toggle('on', j === k)); $('.fz-hint', f).classList.toggle('gone', k >= fz.n - 1); };
  fz.go = k => { k = Math.max(0, Math.min(fz.n - 1, k)); const sl = tr.children[k]; if (!sl) return; if (tts) tts.stop(); set(k); fz.lock = performance.now() + 600; tr.scrollTo({ top: sl.offsetTop, behavior: 'smooth' }); };
  tr.scrollTop = tr.children[start].offsetTop; set(start);
  const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && performance.now() > fz.lock) set(+e.target.dataset.i); }), { root: tr, threshold: .5 });
  $$('.fz-slide', tr).forEach(sl => obs.observe(sl)); fz.obs = obs;
  tr.addEventListener('wheel', e => { const sl = tr.children[fz.i], dir = Math.sign(e.deltaY); if (!sl || !dir) return; const top = sl.offsetTop, bottom = top + sl.offsetHeight, vt = tr.scrollTop, vb = vt + tr.clientHeight;
    if (performance.now() > fz.lock && ((dir > 0 && vb < bottom - 4) || (dir < 0 && vt > top + 4))) return; e.preventDefault(); if (performance.now() < fz.lock || Math.abs(e.deltaY) < 3) return; fz.go(fz.i + dir); }, { passive: false });
  tr.addEventListener('click', e => { if (e.target.classList.contains('fz-slide')) focusClose(); });
  $('#xm-fz-x', f).onclick = focusClose; $('.fz-dots', f).onclick = e => { const b = e.target.closest('[data-k]'); if (b) fz.go(+b.dataset.k); };
  try { const card = tr.children[start].firstElementChild; card.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.9,.25,1)' }); } catch (e) {}
  tr.focus({ preventScroll: true });
}
function focusClose() { if (!fz) return; const tts = XM.tts; if (tts) tts.stop(); const src = fz.src[fz.i]; fz.obs.disconnect(); fz.f.remove(); fz = null;
  if (src) { try { src.scrollIntoView({ block: 'center' }); } catch (e) {} src.classList.remove('fz-flash'); void src.offsetWidth; src.classList.add('fz-flash'); } }
if (typeof document !== 'undefined') document.addEventListener('keydown', e => { if (!fz) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); focusClose(); }
  else if (['ArrowDown', 'PageDown', 'j'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); fz.go(fz.i + 1); }
  else if (['ArrowUp', 'PageUp', 'k'].includes(e.key) || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); fz.go(fz.i - 1); }
  else if (e.key === 'Home') { e.preventDefault(); fz.go(0); } else if (e.key === 'End') { e.preventDefault(); fz.go(fz.n - 1); } }, true);

/* ======================= question rendering ======================= */
function srcBadge(q) { return q.source ? `<span class="xm-src" title="Where this question comes from">${h(q.source)}</span>` : ''; }
function renderQuestion(q, st, o) {
  /* st = {resp:{}, checked:bool, res:{}}; o = {num, onChange, locked} */
  const w = el(`<article class="xm-q"><div class="xm-qhead">${o.num ? `<span class="xm-qn">${o.num}</span>` : ''}<div><h2>${h(q.title || '')}</h2><div class="xm-meta">${srcBadge(q)}<span class="xm-pts">${pts(q.points)} p</span></div></div></div>
    ${q.figure ? `<div class="xm-fig">${q.figure}</div>` : ''}${q.prompt ? `<div class="xm-prompt">${q.prompt}</div>` : ''}<div class="xm-parts"></div></article>`);
  const P = $('.xm-parts', w);
  q.parts.forEach((p, i) => P.appendChild(renderPart(q, p, st, o, i)));
  if (st.checked && o.showSol !== false) w.appendChild(renderSolution(q));
  return w;
}
function renderPart(q, p, st, o, i) {
  const r = st.resp[i], done = st.checked, res = done ? (st.res[i] || XM.grade(p, r)) : null;
  const box = el(`<section class="xm-part t-${p.type}${done ? (res.s >= .999 ? ' ok' : res.s > 0 ? ' half' : ' bad') : ''}"><div class="xm-ph">${p.label ? `<b class="xm-pl">${h(p.label)}</b>` : ''}<div class="xm-pp">${p.prompt || ''}</div><span class="xm-pts">${done ? pts(res.s * p.points) + ' / ' : ''}${pts(p.points)} p</span></div><div class="xm-pb"></div></section>`);
  const B = $('.xm-pb', box), set = v => { st.resp[i] = v; o.onChange && o.onChange(); };
  const lock = done || o.locked;
  switch (p.type) {
    case 'free': B.innerHTML = `<p class="xm-muted">${p.note || 'Free point: write down the time you finished.'}</p>`; break;
    case 'mcq': {
      const multi = Array.isArray(p.answer), sel = multi ? new Set(r || []) : r;
      const short = !p.wide && p.options.every(x => !/<(svg|pre|br)/.test(String(x)) && String(x).replace(/<[^>]+>/g, '').length <= 26);
      const g = el(`<div class="xm-opts${p.wide ? ' wide' : ''}${p.grid || short ? ' grid' : ''}"></div>`);
      p.perm.forEach(k => {
        const on = multi ? sel.has(k) : sel === k, right = multi ? p.answer.includes(k) : p.answer === k;
        const b = el(`<button class="xm-opt${on ? ' on' : ''}${done && right ? ' right' : ''}${done && on && !right ? ' wrong' : ''}" ${lock ? 'disabled' : ''}><span class="xm-box">${multi ? '' : ''}</span><span>${p.options[k]}</span></button>`);
        b.onclick = () => { if (multi) { const s2 = new Set(st.resp[i] || []); s2.has(k) ? s2.delete(k) : s2.add(k); set([...s2]); } else set(k); rerender(box, q, p, st, o, i); };
        g.appendChild(b);
      });
      if (multi && !done) B.appendChild(el(`<p class="xm-hint">Select all that apply.</p>`));
      B.appendChild(g); break;
    }
    case 'numeric': {
      const inp = el(`<div class="xm-num"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="${h(p.ph || 'your answer')}" value="${h(r || '')}" ${lock ? 'disabled' : ''}>${p.unit ? `<span>${h(p.unit)}</span>` : ''}</div>`);
      $('input', inp).oninput = e => set(e.target.value); B.appendChild(inp);
      if (done) B.appendChild(el(`<p class="xm-ans">${res.s ? '✓' : '✗'} Correct answer: <b>${p.show || L.num(p.answer, p.dp !== undefined ? p.dp : 4)}${p.unit ? ' ' + h(p.unit) : ''}</b>${p.tol !== undefined || p.rtol !== undefined ? ` <small>(accepted ±${p.tol !== undefined ? L.num(p.tol, 4) : L.num((p.rtol) * 100, 2) + ' %'})</small>` : ''}</p>`));
      break;
    }
    case 'text': {
      const inp = el(`<div class="xm-num"><input type="text" autocomplete="off" spellcheck="false" placeholder="${h(p.ph || 'your answer')}" value="${h(r || '')}" ${lock ? 'disabled' : ''}></div>`);
      $('input', inp).oninput = e => set(e.target.value); B.appendChild(inp);
      if (done) B.appendChild(el(`<p class="xm-ans">${res.s ? '✓' : '✗'} Answer: <b>${h(p.show || [].concat(p.answer)[0])}</b></p>`)); break;
    }
    case 'order': {
      const got = r || [], pool = p.start.filter(x => !got.includes(x)) ;
      const w2 = el(`<div class="xm-order"><div class="xm-ord-ans" aria-label="Your order"></div><div class="xm-ord-pool" aria-label="Tap to add"></div></div>`);
      const A = $('.xm-ord-ans', w2), Pq = $('.xm-ord-pool', w2);
      got.forEach((x, k) => { const b = el(`<button class="xm-tok${done ? (p.check ? (res.s ? ' right' : ' wrong') : (res.pos[k] ? ' right' : ' wrong')) : ''}" ${lock ? 'disabled' : ''}><small>${k + 1}</small>${h(x)}</button>`); b.onclick = () => { set(got.filter((_, j) => j !== k)); rerender(box, q, p, st, o, i); }; A.appendChild(b); });
      if (!got.length) A.appendChild(el(`<span class="xm-hint">${lock ? 'No answer' : 'Tap the items below in order.'}</span>`));
      if (!lock) pool.forEach(x => { const b = el(`<button class="xm-tok pool">${h(x)}</button>`); b.onclick = () => { set(got.concat([x])); rerender(box, q, p, st, o, i); }; Pq.appendChild(b); });
      if (!lock && got.length) { const c = el(`<button class="xm-link sm">Clear</button>`); c.onclick = () => { set([]); rerender(box, q, p, st, o, i); }; Pq.appendChild(c); }
      B.appendChild(w2);
      if (done) B.appendChild(el(`<p class="xm-ans">${p.check ? (res.s ? '✓ A valid order.' : '✗ Not valid.') + ' One correct order' : 'Correct order'}: <b>${p.answer.map(h).join(' → ')}</b></p>`));
      break;
    }
    case 'table': {
      const resp = r || {}, bad = {}; if (done) res.cells.forEach(([a, b2, g]) => { bad[a + ',' + b2] = !g; });
      let t = `<div class="xm-tw${(p.cols || []).length > 6 ? ' wide' : ''}"><table class="xm-tab${p.excel ? ' excel' : ''}">`;
      if (p.cols) t += `<tr>${p.corner !== undefined || p.rows.some(rw => rw.label !== undefined) ? `<th>${h(p.corner || '')}</th>` : ''}${p.cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
      p.rows.forEach((row, ri) => {
        t += `<tr>${row.label !== undefined ? `<th>${row.label}</th>` : ''}`;
        row.cells.forEach((c, ci) => {
          if (c === null) { t += `<td class="na"></td>`; return; }
          const k = ri + ',' + ci;
          if (c.given) { t += `<td class="given ${c.cls || ''}">${c.show !== undefined ? c.show : h(c.a)}</td>`; return; }
          const v = resp[k] || '';
          t += `<td class="${c.cls || ''}${done ? (bad[k] ? ' wrong' : ' right') : ''}"><input data-k="${k}" type="text" ${c.num ? 'inputmode="decimal"' : ''} autocomplete="off" spellcheck="false" value="${h(v)}" ${lock ? 'disabled' : ''} aria-label="row ${ri + 1} column ${ci + 1}" ${c.w ? `style="width:${c.w}em"` : ''}>${done && bad[k] ? `<span class="xm-fix">${c.show !== undefined ? c.show : h([].concat(c.a)[0] === '' ? '(empty)' : [].concat(c.a)[0])}</span>` : ''}</td>`;
        });
        t += '</tr>';
      });
      t += '</table></div>';
      const tw = el(t); $$('input', tw).forEach(inp => { inp.oninput = e => { const cur = Object.assign({}, st.resp[i] || {}); cur[e.target.dataset.k] = e.target.value; set(cur); }; });
      if (p.hint && !done) B.appendChild(el(`<p class="xm-hint">${p.hint}</p>`));
      B.appendChild(tw);
      if (done) B.appendChild(el(`<p class="xm-ans">${Math.round(res.s * 100)} % of the cells correct${res.s < 1 ? ' · wrong cells show the right value underneath' : ''}</p>`));
      break;
    }
    case 'code': {
      const got = r || {}; let k = 0;
      const html = h(p.code).replace(/⟦(\d+)⟧/g, (_, n) => { n = +n; k++; const ok = done && res.blanks[n];
        return `<input class="xm-blank${done ? (ok ? ' right' : ' wrong') : ''}" data-n="${n}" value="${h(got[n] || '')}" size="${Math.max(4, ([].concat(p.blanks[n])[0] || '').length + 1)}" ${lock ? 'disabled' : ''} autocomplete="off" spellcheck="false" aria-label="blank ${n + 1}">`; });
      const pre = el(`<pre class="xm-code fill">${html}</pre>`); $$('input', pre).forEach(inp => { inp.oninput = e => { const cur = Object.assign({}, st.resp[i] || {}); cur[e.target.dataset.n] = e.target.value; set(cur); }; });
      B.appendChild(pre);
      if (done) B.appendChild(el(`<p class="xm-ans">Answers: ${p.blanks.map((b2, n) => `<code>${n + 1}: ${h([].concat(b2)[0])}</code>`).join(' ')}</p>`));
      break;
    }
    case 'blocks': {
      const sel = new Set(r || []);
      p.groups.forEach((g, gi) => {
        const gw = el(`<div class="xm-blk"><div class="xm-eyebrow">${h(g.name)}</div><div class="xm-blkopts"></div></div>`);
        g.options.forEach((op, oi) => { const k = gi + ':' + oi, on = sel.has(k);
          const b = el(`<button class="xm-opt blk${on ? ' on' : ''}${done && op.ok ? ' right' : ''}${done && on && !op.ok ? ' wrong' : ''}" ${lock ? 'disabled' : ''}><span class="xm-box"></span><span>${op.t}</span></button>`);
          b.onclick = () => { const s2 = new Set(st.resp[i] || []); s2.has(k) ? s2.delete(k) : s2.add(k); set([...s2]); rerender(box, q, p, st, o, i); };
          $('.xm-blkopts', gw).appendChild(b); });
        B.appendChild(gw);
      });
      if (!done) B.prepend(el(`<p class="xm-hint">Pick every block that belongs in a correct model. Wrong picks cost marks.</p>`));
      break;
    }
    case 'written': {
      const rr = r || {};
      const ta = el(`<textarea class="xm-ta" rows="${p.rows || 4}" placeholder="${h(p.ph || 'Write your answer (or answer on paper), then check it against the model answer and tick what you got.')}" ${lock && !done ? 'disabled' : ''}>${h(rr.text || '')}</textarea>`);
      ta.oninput = e => { st.resp[i] = Object.assign({}, st.resp[i] || {}, { text: e.target.value }); o.onChange && o.onChange(); };
      if (done) ta.readOnly = true;
      B.appendChild(ta);
      if (done) {
        const ticks = rr.ticks || {};
        const m = el(`<div class="xm-model"><div class="xm-eyebrow">Model answer</div><div>${p.model}</div><div class="xm-eyebrow">Mark yourself · tick each point your answer contains</div><div class="xm-rubric"></div></div>`);
        p.rubric.forEach((rb, k) => { const lab = el(`<label class="xm-rb${ticks[k] ? ' on' : ''}"><input type="checkbox" ${ticks[k] ? 'checked' : ''} ${o.lockMarks ? 'disabled' : ''}><span class="pp">${pts(rb[0])} p</span><span>${rb[1]}</span></label>`);
          $('input', lab).onchange = e => { const cur = Object.assign({}, st.resp[i] || {}); cur.ticks = Object.assign({}, cur.ticks || {}); cur.ticks[k] = e.target.checked; st.resp[i] = cur; st.res[i] = XM.grade(p, cur);
            lab.classList.toggle('on', e.target.checked); const part = lab.closest('.xm-part'), sc = st.res[i].s;
            if (part) { part.classList.remove('ok', 'half', 'bad'); part.classList.add(sc >= .999 ? 'ok' : sc > 0 ? 'half' : 'bad'); const pe = $('.xm-ph .xm-pts', part); if (pe) pe.textContent = `${pts(sc * p.points)} / ${pts(p.points)} p`; }
            o.onChange && o.onChange(); };
          $('.xm-rubric', m).appendChild(lab); });
        B.appendChild(m);
      }
      break;
    }
  }
  if (done && p.why) B.appendChild(el(`<div class="xm-why">${p.why}</div>`));
  return box;
}
function rerender(box, q, p, st, o, i) { const nb = renderPart(q, p, st, o, i); box.replaceWith(nb); if (o.onRerender) o.onRerender(); }
function renderSolution(q) {
  const w = el(`<div class="xm-sol"></div>`);
  if (q.solution && q.solution.length) w.appendChild(el(`<details open><summary>Worked solution</summary><ol class="xm-steps">${q.solution.map(s => `<li>${s}</li>`).join('')}</ol></details>`));
  if (q.traps && q.traps.length) w.appendChild(el(`<div class="xm-traps"><div class="xm-eyebrow">Where marks get lost</div><ul>${q.traps.map(s => `<li>${s}</li>`).join('')}</ul></div>`));
  return w;
}
function scoreOf(q, st) { let got = 0; q.parts.forEach((p, i) => { const r = st.res[i] || XM.grade(p, st.resp[i]); got += r.s * p.points; }); return got; }

/* ======================= fight strip (the game layer, kept thin) ======================= */
function fightStrip(c) {
  DB.boss[c.id] = DB.boss[c.id] || { k: 0, hp: 100, me: 100, combo: 0 }; const b = DB.boss[c.id], names = c.bosses || ['The Examiner'];
  return el(`<div class="xm-fight" style="--acc:${c.accent}"><div class="xf-me"><small>You · ${b.me} HP</small>${bar(b.me / 100, 'hp hp-me')}</div><div class="xf-vs">${b.combo >= 3 ? `<span class="combo">×${b.combo}</span>` : 'VS'}</div><div class="xf-boss"><small>${h(names[b.k % names.length])} · ${Math.max(0, b.hp)} HP</small>${bar(Math.max(0, b.hp) / 100, 'hp hp-boss')}</div></div>`);
}
function hit(c, frac, maxp) {
  const b = DB.boss[c.id]; let msg = '';
  if (frac >= .5) { b.combo++; const dmg = Math.round(18 + 22 * frac * Math.min(2, maxp / 6) + (b.combo >= 3 ? 8 : 0)); b.hp -= dmg; msg = `−${dmg} HP to the boss`; }
  else { b.combo = 0; b.me = Math.max(0, b.me - 20); msg = 'The boss hits you: −20 HP'; }
  if (b.hp <= 0) { const names = c.bosses || ['The Examiner']; msg = `${names[b.k % names.length]} defeated!`; b.k++; b.hp = 100; b.me = Math.min(100, b.me + 40); }
  if (b.me <= 0) { msg = 'K.O. You get back up with full HP. The boss heals too.'; b.me = 100; b.hp = 100; }
  save(); return msg;
}

/* ======================= PRACTICE ======================= */
function vPractice(v) {
  const c = XM.courses[v.c]; if (!c) return vHome();
  let q, label;
  if (v.paper) { const P = c.papers.find(p => p.id === v.paper); const Qs = paperQs(c, P); const k = +(v.k || 0); q = Qs[k]; label = `${P.title} · question ${k + 1} of ${Qs.length}`; v.total = Qs.length; }
  else { const tpl = v.tpl || XM.pick(c, v.topic, v.prev); if (!tpl) { main.innerHTML = '<p>No questions yet.</p>'; return; } const seed = v.seed || L.newSeed(); q = XM.make(c, tpl, seed); v._tpl = tpl; v._seed = seed; label = v.topic ? (c.topics[v.topic] || {}).name : v.tpl ? 'One template' : 'Smart practice'; }
  const st = { resp: {}, res: {}, checked: false }; XM._cur = q;
  main.appendChild(el(`<div class="xm-crumbs"><button class="xm-link" data-go="course" data-c="${c.id}">← ${h(c.short)}</button><span>${h(label || '')}</span></div>`));
  if (!v.paper) main.appendChild(fightStrip(c));
  const holder = el('<div></div>'); main.appendChild(holder);
  const bar2 = el(`<div class="xm-actions"><button class="xm-btn" id="xm-check">Check</button><button class="xm-btn ghost" id="xm-skip">${v.paper ? 'Show solution' : 'Skip'}</button></div>`);
  const draw = () => { holder.innerHTML = ''; holder.appendChild(renderQuestion(q, st, { onChange: () => { if (st.checked) updScore(); } })); };
  const updScore = () => { const s = $('#xm-score', main); if (s) s.innerHTML = `Score: <b>${pts(scoreOf(q, st))} / ${pts(q.points)}</b>${q.parts.some(XM.isSelf) ? ' · tick the rubric for the written parts' : ''}`; };
  draw(); main.appendChild(bar2);
  const next = () => {
    if (!st.recorded) { st.recorded = true; const f = scoreOf(q, st) / q.points; if (!v.paper) { XM.record(c.id, q.tpl, f); } else if (q.tpl) XM.record(c.id, q.tpl, f); }
    if (v.paper) { const k = +(v.k || 0) + 1; if (k >= v.total) XM.go('papers', { c: c.id }); else XM.go('practice', { c: c.id, paper: v.paper, k }); }
    else XM.go('practice', { c: c.id, topic: v.topic, tpl: v.tpl, prev: q.tpl });
  };
  $('#xm-check', bar2).onclick = () => {
    if (!st.checked) {
      st.checked = true; q.parts.forEach((p, i) => { st.res[i] = XM.grade(p, st.resp[i]); }); draw();
      const auto = q.parts.filter(p => !XM.isSelf(p)), autoPts = L.sum(auto.map(p => p.points)), got = scoreOf(q, st);
      bar2.innerHTML = `<div class="xm-score" id="xm-score"></div><button class="xm-btn" id="xm-next">Next question</button><button class="xm-btn ghost" id="xm-again">Same template, new numbers</button>`;
      updScore();
      if (!v.paper) { const msg = hit(c, autoPts ? got / Math.max(autoPts, .01) * (autoPts / q.points) + (q.parts.every(XM.isSelf) ? .6 : 0) : .6, q.points); const fs = $('.xm-fight', main); if (fs) fs.replaceWith(fightStrip(c)); toast(msg); }
      $('#xm-next', bar2).onclick = next;
      const ag = $('#xm-again', bar2); if (v.paper || !q.tpl) ag.remove(); else ag.onclick = () => { if (!st.recorded) { st.recorded = true; XM.record(c.id, q.tpl, scoreOf(q, st) / q.points); } XM.go('practice', { c: c.id, tpl: q.tpl, topic: v.topic, seed: L.newSeed() }); };
    }
  };
  $('#xm-skip', bar2).onclick = () => { if (v.paper) { $('#xm-check', bar2).click(); } else XM.go('practice', { c: c.id, topic: v.topic, tpl: v.tpl, prev: q.tpl }); };
}
function paperQs(c, P) { if (!P._qs) P._qs = P.questions(L).map(q => XM.finish(Object.assign({ source: P.title }, q), L.rng(7))); return P._qs; }

/* ======================= EXAM runner (mock + past paper) ======================= */
function buildRun(c, kind, paperId) {
  if (kind === 'paper') { const P = c.papers.find(p => p.id === paperId); return { c: c.id, kind, paper: paperId, title: P.title, minutes: P.minutes || (c.mock && c.mock.minutes) || 120, start: Date.now(), resp: {}, qs: paperQs(c, P).map((_, k) => ({ k })) }; }
  const M = c.mock, specs = []; const used = new Set();
  M.slots.forEach(sl => { const pool = sl.tpls.filter(t => !used.has(t)); const t = pool[Math.floor(Math.random() * pool.length)] || sl.tpls[0]; used.add(t); specs.push({ tpl: t, seed: L.newSeed(), points: sl.points, label: sl.label }); });
  return { c: c.id, kind, title: M.title || c.short + ' mock exam', minutes: M.minutes, start: Date.now(), resp: {}, qs: specs };
}
function runQs(run) { const c = XM.courses[run.c];
  if (run.kind === 'paper') { const P = c.papers.find(p => p.id === run.paper); return paperQs(c, P); }
  return run.qs.map(s => { const q = XM.make(c, s.tpl, s.seed); if (s.points) XM.scale(q, s.points); if (s.label) q.slot = s.label; return q; }); }
function vExam(v) {
  const c = XM.courses[v.c];
  if (DB.run && DB.run.c === v.c && !v.fresh && (DB.run.kind === v.kind || !v.kind) && (!v.paper || DB.run.paper === v.paper) && !DB.run.handed) { /* resume */ }
  else if (DB.run && !DB.run.handed && !v.fresh && !v.confirmed) {
    main.innerHTML = `<section class="xm-card"><h2>An exam is still running</h2><p>${h(DB.run.title)} started ${new Date(DB.run.start).toLocaleString('en-GB')}.</p><div class="xm-row"><button class="xm-btn" id="xm-res">Resume it</button><button class="xm-btn ghost" id="xm-new">Discard it and start this one</button></div></section>`;
    $('#xm-res', main).onclick = () => XM.go('exam', { c: DB.run.c, kind: DB.run.kind, paper: DB.run.paper });
    $('#xm-new', main).onclick = () => { DB.run = null; save(); XM.go('exam', Object.assign({}, v, { confirmed: 1 })); };
    return;
  } else if (!v.started) {
    const M = v.kind === 'paper' ? c.papers.find(p => p.id === v.paper) : c.mock;
    main.innerHTML = `<section class="xm-card xm-intro" style="--acc:${c.accent}"><button class="xm-link" data-go="course" data-c="${c.id}">← ${h(c.short)}</button><h1>${h(v.kind === 'paper' ? M.title : (M.title || 'Mock exam'))}</h1>
      <ul class="xm-facts"><li><b>${M.minutes || c.mock.minutes} min</b> time limit (the timer keeps running if you leave)</li><li><b>${pts(v.kind === 'paper' ? L.sum(paperQs(c, M).map(q => q.points)) : M.points)} points</b>${c.grades ? ' · grade thresholds ' + c.grades.slice().reverse().map(([p, g]) => g + ' ≥ ' + p + ' %').join(', ') : ''}</li><li>${h(M.rules || c.exam.rules || 'Work as in the real exam. Written parts are marked by you afterwards with the official-style rubric.')}</li></ul>
      ${v.kind === 'mock' && M.slots ? `<ol class="xm-slots">${M.slots.map(s => `<li><span>${h(s.label)}</span><b>${s.points} p</b></li>`).join('')}</ol>` : ''}
      <div class="xm-row"><button class="xm-btn" id="xm-go">Start the clock</button></div></section>`;
    $('#xm-go', main).onclick = () => { DB.run = buildRun(c, v.kind, v.paper); save(); XM.go('exam', { c: c.id, kind: v.kind, paper: v.paper, started: 1 }); };
    return;
  }
  const run = DB.run, Q = runQs(run); let cur = Math.min(+(v.q || run.cur || 0), Q.length - 1);
  const head = el(`<div class="xm-examhead"><div><b>${h(run.title)}</b><small>${h(c.code)}</small></div><div class="xm-clock" id="xm-clock"></div><button class="xm-btn sm" id="xm-hand">Hand in</button></div>`);
  const tabs = el(`<nav class="xm-qtabs" aria-label="Questions"></nav>`);
  const body = el(`<div></div>`), foot = el(`<div class="xm-actions"><button class="xm-btn ghost" id="xm-prev">← Previous</button><button class="xm-btn ghost" id="xm-nxt">Next →</button></div>`);
  main.append(head, tabs, body, foot);
  const answered = k => { const r = run.resp[k] || {}; return Object.values(r).some(x => x !== undefined && x !== null && x !== '' && !(Array.isArray(x) && !x.length) && !(typeof x === 'object' && !Array.isArray(x) && !Object.values(x).some(Boolean))); };
  const drawTabs = () => { tabs.innerHTML = Q.map((q, k) => `<button class="${k === cur ? 'on' : ''}${answered(k) ? ' done' : ''}" data-k="${k}">Q${k + 1}<small>${pts(q.points)} p</small></button>`).join(''); };
  const drawQ = () => { run.cur = cur; save(); body.innerHTML = ''; const st = { resp: run.resp[cur] = run.resp[cur] || {}, res: {}, checked: false };
    body.appendChild(renderQuestion(Q[cur], st, { num: 'Q' + (cur + 1), onChange: () => { save(); drawTabs(); } }));
    $('#xm-prev', foot).disabled = cur === 0; $('#xm-nxt', foot).disabled = cur === Q.length - 1; drawTabs(); window.scrollTo(0, 0); root.scrollTop = 0; };
  tabs.onclick = e => { const b = e.target.closest('[data-k]'); if (b) { cur = +b.dataset.k; drawQ(); } };
  $('#xm-prev', foot).onclick = () => { cur--; drawQ(); }; $('#xm-nxt', foot).onclick = () => { cur++; drawQ(); };
  const end = run.start + run.minutes * 6e4;
  const tick = () => { const left = (end - Date.now()) / 1000, ck = $('#xm-clock', main); if (!ck) return; ck.textContent = left > 0 ? fmtClock(left) : 'Time is up'; ck.classList.toggle('low', left < 600); if (left <= 0 && !run.autoHanded) { run.autoHanded = true; toast('Time is up: the paper was handed in.'); handIn(); } };
  const handIn = () => { run.handed = Date.now(); save(); XM.go('mark', { c: c.id }); };
  $('#xm-hand', head).onclick = async () => { const open = Q.filter((_, k) => !answered(k)).length; if (await confirmBox(`Hand in now?${open ? ` ${open} question${open > 1 ? 's have' : ' has'} no answer yet.` : ''} You'll mark the written parts yourself next.`, 'Hand in', 'Keep working')) handIn(); };
  drawQ(); tick(); timerId = setInterval(tick, 1000);
}
function vMark(v) {
  const run = DB.run; if (!run) return vHome(); const c = XM.courses[run.c], Q = runQs(run);
  const S = Q.map((q, k) => { const st = { resp: run.resp[k] = run.resp[k] || {}, res: {}, checked: true }; q.parts.forEach((p, i) => st.res[i] = XM.grade(p, st.resp[i])); return st; });
  main.appendChild(el(`<section class="xm-card"><h2>Mark your paper</h2><p class="xm-muted">Everything that can be checked automatically is marked. For each written part, compare with the model answer and tick the rubric points you really got: be as strict as the graders. Then press <b>Finish marking</b>.</p><div class="xm-score big" id="xm-live"></div></section>`));
  const live = () => { const got = L.sum(Q.map((q, k) => scoreOf(q, S[k]))), max = L.sum(Q.map(q => q.points)); $('#xm-live', main).innerHTML = `${pts(got)} / ${pts(max)} points · ${Math.round(got / max * 100)} %${c.grades ? ' → grade ' + XM.gradeOf(c, got / max * 100) : ''}`; };
  Q.forEach((q, k) => main.appendChild(renderQuestion(q, S[k], { num: 'Q' + (k + 1), onChange: () => { save(); live(); } })));
  const f = el(`<div class="xm-actions"><button class="xm-btn" id="xm-fin">Finish marking</button></div>`); main.appendChild(f); live();
  $('#xm-fin', f).onclick = () => {
    const per = Q.map((q, k) => ({ got: scoreOf(q, S[k]), max: q.points, title: q.title, topic: q.topic, tpl: q.tpl }));
    const got = L.sum(per.map(x => x.got)), max = L.sum(per.map(x => x.max)), pct = got / max * 100;
    per.forEach(x => { if (x.tpl) XM.record(c.id, x.tpl, x.got / x.max); });
    const entry = { t: Date.now(), kind: run.kind, paper: run.paper, title: run.title, got, max, pct, grade: c.grades ? XM.gradeOf(c, pct) : undefined, per, mins: Math.round((run.handed - run.start) / 6e4) };
    (DB.hist[c.id] = DB.hist[c.id] || []).push(entry); DB.run = null; save();
    XM.go('result', { c: c.id });
  };
}
function vResult(v) {
  const c = XM.courses[v.c], e = (DB.hist[c.id] || []).slice(-1)[0]; if (!e) return vCourse(v);
  main.innerHTML = `<section class="xm-hero slim" style="--acc:${c.accent}"><div class="xm-eyebrow">${h(e.title)} · ${e.mins} min</div><h1>${pts(e.got)} / ${pts(e.max)} points · ${Math.round(e.pct)} %</h1>${e.grade !== undefined ? `<div class="xm-grade">Grade <b>${e.grade}</b>${e.grade === 0 ? ' (fail)' : ''}</div>` : ''}
   <p class="xm-muted">${c.gradeNote || ''}</p>
   <table class="xm-hist">${e.per.map((x, k) => `<tr><td>Q${k + 1}</td><td>${h(x.title || '')}</td><td>${pts(x.got)} / ${pts(x.max)}</td><td>${bar(x.got / x.max)}</td></tr>`).join('')}</table>
   <div class="xm-row wrap"><button class="xm-btn" data-go="practice" data-c="${c.id}">Practise the weak spots</button><button class="xm-btn ghost" data-go="course" data-c="${c.id}">Back to ${h(c.short)}</button></div></section>`;
}

/* ======================= boot ======================= */
XM.init = function () {
  load(); shell();
  const running = DB.run && !DB.run.handed;
  if (!running && location.hash.length > 1) { document.body.classList.add('xm-open'); root.hidden = false; if (openLink(location.hash)) return; }
  linkFromUrl = true;
  XM.open({ name: running ? 'exam' : 'home', c: DB.run && DB.run.c, kind: DB.run && DB.run.kind, paper: DB.run && DB.run.paper });
  linkFromUrl = false;
};
XM.view = () => view;
XM.toast = m => toast(m);
if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => XM.init()); else setTimeout(() => XM.init(), 0); }
})(typeof window !== 'undefined' ? window : globalThis);
