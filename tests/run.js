/* Headless tests: node tests/run.js [courseId] [seeds]
   1) every template generates for many seeds, 2) the correct answer scores full points,
   3) an empty answer does not, 4) algorithms agree with independent brute-force checks. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
global.window = global; global.localStorage = { getItem: () => null, setItem: () => {} };
['exam/lib.js', 'exam/engine.js'].concat(fs.readdirSync(path.join(ROOT, 'exam/courses')).filter(f => f.endsWith('.js')).sort((a, b) => (a.includes('-') ? 1 : 0) - (b.includes('-') ? 1 : 0) || a.localeCompare(b)).map(f => 'exam/courses/' + f))
  .concat(fs.readdirSync(path.join(ROOT, 'exam/study')).map(f => 'exam/study/' + f))
  .forEach(f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }));
const XM = global.XM, L = XM.lib;
const only = process.argv[2], SEEDS = +(process.argv[3] || 150);
let fails = 0, checks = 0; const fail = (m) => { fails++; if (fails < 40) console.log('  FAIL', m); };
function correct(p) {
  switch (p.type) {
    case 'mcq': return p.answer; case 'numeric': return String(p.answer === Infinity ? 'inf' : p.answer); case 'text': return [].concat(p.answer)[0];
    case 'order': return p.answer.slice(); case 'code': return Object.fromEntries(p.blanks.map((b, i) => [i, [].concat(b)[0]]));
    case 'blocks': { const s = []; p.groups.forEach((g, gi) => g.options.forEach((o, oi) => { if (o.ok) s.push(gi + ':' + oi); })); return s; }
    case 'table': { const r = {}; p.rows.forEach((row, ri) => row.cells.forEach((c, ci) => { if (c && !c.given) r[ri + ',' + ci] = String([].concat(c.a)[0]); })); return r; }
    case 'written': return { ticks: Object.fromEntries(p.rubric.map((_, i) => [i, true])) }; default: return null;
  }
}
function checkQ(q, where) {
  checks++;
  if (!q.title) fail(where + ': no title');
  if (!q.parts || !q.parts.length) return fail(where + ': no parts');
  if (!(q.points > 0)) fail(where + ': points ' + q.points);
  q.parts.forEach((p, i) => {
    const w = where + ' part ' + i + ' (' + p.type + ')';
    if (!(p.points > 0)) fail(w + ': points');
    if (p.type === 'mcq') { const n = p.options.length; if (n < 2) fail(w + ': <2 options'); if (new Set(p.options).size !== n) fail(w + ': duplicate options ' + JSON.stringify(p.options).slice(0, 200)); if (p.perm.length !== n) fail(w + ': perm'); }
    if (p.type === 'numeric' && !(typeof p.answer === 'number' && !isNaN(p.answer))) fail(w + ': answer NaN');
    if (p.type === 'order') { if (!p.answer.every(a => p.items.includes(a))) fail(w + ': answer item missing from pool ' + p.answer + ' / ' + p.items); if (p.check && !p.check(p.answer)) fail(w + ': own answer fails check'); }
    if (p.type === 'table') p.rows.forEach(r => r.cells.forEach(c => { if (c && !c.given && (c.a === undefined || c.a === null || (typeof c.a === 'number' && isNaN(c.a)) || String(c.a) === 'NaN' || String(c.a) === 'undefined')) fail(w + ': bad cell ' + c.a); }));
    if (p.type === 'written' && (!p.model || !p.rubric || !p.rubric.length)) fail(w + ': rubric');
    const g = XM.grade(p, correct(p)); if (Math.abs(g.s - 1) > 1e-9) fail(w + ': correct answer scored ' + g.s + ' ' + JSON.stringify(correct(p)).slice(0, 160));
    if (p.type !== 'free') { const e = XM.grade(p, p.type === 'written' ? {} : p.type === 'mcq' ? undefined : p.type === 'order' ? [] : p.type === 'table' ? {} : p.type === 'code' ? {} : p.type === 'blocks' ? [] : '');
      if (e.s >= 1 && !(p.type === 'table' && p.rows.every(r => r.cells.every(c => !c || c.given || [].concat(c.a)[0] === '')))) fail(w + ': empty answer scored full'); }
    if (p.type === 'numeric') { let ov = p.answer * 1.2 + 3; if (Math.abs(ov - p.answer) < 1e-6) ov = p.answer + 7; const off = XM.grade(p, String(ov)); if (off.s) fail(w + ': far-off number accepted'); }
  });
  const html = JSON.stringify(q); if (/undefined|NaN(?!\))/.test(html.replace(/"(?:tol|rtol|show|dp|why|unit)":/g, ''))) fail(where + ': "undefined"/"NaN" in content ' + (html.match(/.{60}(undefined|NaN).{40}/) || [''])[0]);
}
Object.values(XM.courses).forEach(c => {
  if (only && c.id !== only) return;
  console.log(`\n== ${c.code} ${c.name}: ${Object.keys(c.templates).length} templates, ${c.papers.length} papers`);
  const types = {};
  Object.keys(c.templates).forEach(id => { let ok = 0; for (let s = 1; s <= SEEDS; s++) { try { const q = XM.make(c, id, s * 7919 + 13); checkQ(q, `${c.id}/${id}#${s}`); q.parts.forEach(p => types[p.type] = (types[p.type] || 0) + (s === 1 ? 1 : 0)); ok++; } catch (e) { fail(`${c.id}/${id}#${s}: threw ${e.message}\n${e.stack.split('\n').slice(1, 3).join('\n')}`); break; } } });
  c.papers.forEach(P => { let n = 0; try { P.questions(L).forEach((q, k) => { XM.finish(q, L.rng(7)); checkQ(q, `${c.id}/paper ${P.id} Q${k + 1}`); n++; q.parts.forEach(p => types['paper:' + p.type] = (types['paper:' + p.type] || 0) + 1); }); } catch (e) { fail(`${c.id}/paper ${P.id}: threw ${e.message} ${e.stack.split('\n')[1]}`); } });
  if (c.mock) { for (let s = 0; s < 20; s++) { let tot = 0; c.mock.slots.forEach(sl => sl.tpls.forEach(t => { const q = XM.make(c, t, s + 1); XM.scale(q, sl.points); if (Math.abs(L.sum(q.parts.map(p => p.points)) - sl.points) > 1e-6) fail(`${c.id} mock scale ${t}: ${L.sum(q.parts.map(p => p.points))} vs ${sl.points}`); })); }
    const tot = L.sum(c.mock.slots.map(s => s.points)); if (tot !== c.mock.points) fail(`${c.id}: mock slots sum ${tot} ≠ ${c.mock.points}`); }
  console.log('   part types (one sample each):', JSON.stringify(types));
});
/* ---- independent algorithm checks ---- */
if (!only || only === 'dsa' || only === 'algo') {
  const r = L.rng(4242); let n = 0;
  for (let t = 0; t < 300; t++) {
    const st = r.pick([[2, 3], [1, 3], [1, 2, 3], [2, 5]]), N = r.int(0, 14);
    const brute = (k) => k === 0 ? 1 : L.sum(st.map(s => k - s >= 0 ? brute(k - s) : 0)); if (L.jumps(N, st)[N] !== brute(N)) fail('jumps ' + st + ' ' + N);
    const ban = r.pick([['rg', 'gr'], ['rb', 'br']]), m = r.int(1, 6); let cnt = 0; (function rec(s) { if (s.length === m) { if (![...Array(m - 1).keys()].some(i => ban.includes(s[i] + s[i + 1]))) cnt++; return; } 'rgb'.split('').forEach(c => rec(s + c)); })(''); if (L.rgb(m, ban)[m - 1].total !== cnt) fail('rgb');
    const str = L.range(0, r.int(1, 8)).map(() => r.pick('abc'.split(''))).join(''); let best = 0; for (let mask = 1; mask < 1 << str.length; mask++) { const sub = str.split('').filter((_, i) => mask >> i & 1).join(''); if (sub === sub.split('').reverse().join('')) best = Math.max(best, sub.length); } if (L.lps(str)[0][str.length - 1] !== best) fail('lps ' + str);
    const keys = r.sample(L.range(1, 99), r.int(1, 14)); let avl = null; keys.forEach(k => { avl = L.avlInsert(avl, k).tree; }); if (!L.isAVL(avl) || L.inorder(avl).join() !== keys.slice().sort((a, b) => a - b).join()) fail('avl');
    const bst = L.bstFrom(keys), dk = r.pick(keys), del = L.bstDelete(bst, dk); if (L.inorder(del).join() !== keys.filter(k => k !== dk).sort((a, b) => a - b).join()) fail('bst delete');
    let H = []; keys.forEach(k => H = L.heapInsert(H, k).arr); if (!L.isMaxHeapArr(H)) fail('heap ins'); const R = L.heapRemoveMax(H); if (!L.isMaxHeapArr(R.arr) || R.max !== Math.max(...keys) || R.arr.length !== keys.length - 1) fail('heap rm');
    const DX = XM.DSA; if (DX) {
      const g = DX.randGraph(r, { n: r.int(5, 9), weighted: true, minReach: 0, cyclic: r.chance(.5) }); const dj = L.dijkstra(g.V, g.E, 'a'), bf = L.bellmanFord(g.V, g.E, 'a'); g.V.forEach(v => { if (dj.dist[v] !== bf[v]) fail('dijkstra vs BF'); });
      const reach = (u) => new Set(L.bfs(g.V, g.E, u).order); const R2 = Object.fromEntries(g.V.map(v => [v, reach(v)])); const comps = L.scc(g.V, g.E);
      comps.forEach(c => c.forEach(u => c.forEach(v => { if (!R2[u].has(v)) fail('scc reach'); }))); g.V.forEach(u => g.V.forEach(v => { if (R2[u].has(v) && R2[v].has(u) && !comps.some(c => c.includes(u) && c.includes(v))) fail('scc maximal'); }));
      if (!L.hasCycle(g.V, g.E)) { if (!L.isTopo(g.V, g.E, L.dfs(g.V, g.E, null, true).topo)) fail('topo'); const tt = r.pick(g.V); const A = L.adj(g.V, g.E);
        const cntp = (u) => u === tt ? 1 : L.sum(A[u].map(([w]) => cntp(w))); if (L.dagCount(g.V, g.E, tt).a.a !== cntp('a')) fail('dagcount');
        const lp = (u) => u === tt ? 0 : Math.max(-Infinity, ...A[u].map(([w, c]) => c + lp(w))); if (L.dagLongest(g.V, g.E, tt).l.a !== lp('a')) fail('daglongest'); }
      else { /* cyclic: dfs must report back edge */ if (!L.dfs(g.V, g.E, null, true).cyclic) fail('cycle'); }
    }
    const mm = r.pick([7, 11, 13]), ops = r.sample(L.range(0, 60), r.int(3, Math.min(9, mm - 1))).map(k => ['ins', k]); const dd = ops[r.int(0, ops.length - 1)][1]; ops.push(['del', dd]);
    const fin = L.hashOpen(mm, ops).pop().table; ops.forEach(([o, k]) => { if (o !== 'ins' || k === dd) return; let found = false; for (let i = 0; i < mm; i++) { const sl = (k + i) % mm; if (fin[sl] === null) break; if (fin[sl] === k) { found = true; break; } } if (!found) fail('hashOpen search ' + k); });
    if (fin.includes(dd)) fail('hashOpen delete');
    const arr = r.sample(L.range(0, 500), r.int(2, 9)), srt = arr.slice().sort((a, b) => a - b).join();
    ['insertion', 'selection', 'bubble'].forEach(a => { const tr = L.trace[a](arr); if (tr[tr.length - 1].join() !== srt) fail('trace ' + a); }); const mg = L.trace.merges(arr); if (mg[mg.length - 1].arr.join() !== srt) fail('merge trace'); const lsd = L.trace.lsd(arr); if (lsd.length && lsd[lsd.length - 1].join() !== srt) fail('lsd');
    const lo = L.trace.lomuto(arr); if (!lo.arr.slice(0, lo.q).every(x => x <= lo.arr[lo.q]) || !lo.arr.slice(lo.q + 1).every(x => x > lo.arr[lo.q])) fail('lomuto');
    const coins = r.pick([[1, 2, 5], [2, 3]]), amt = r.int(0, 12); const bw = (a, i) => a === 0 ? 1 : i >= coins.length || a < 0 ? 0 : bw(a - coins[i], i) + bw(a, i + 1); if (L.coinWays(amt, coins)[amt] !== bw(amt, 0)) fail('coins');
    const items = L.range(0, 4).map(() => [r.int(1, 5), r.int(1, 9)]), Wc = r.int(3, 10); let bk = 0; for (let mask = 0; mask < 16; mask++) { let w = 0, v = 0; items.forEach((it, i) => { if (mask >> i & 1) { w += it[0]; v += it[1]; } }); if (w <= Wc) bk = Math.max(bk, v); } if (L.knap01(Wc, items)[4][Wc] !== bk) fail('knap');
    n++;
  }
  console.log(`\n== algorithm cross-checks: ${n} random rounds`);
}

/* ---- PAM: formulas against the worked examples on the lecture slides ---- */
if (!only || only === 'pam') {
  const L = XM.lib, eq = (a, b, t, m) => { if (Math.abs(a - b) > t) fail(`pam slide check ${m}: ${a} vs ${b}`); };
  [[.9677, 1.85], [.9597, 1.75], [.7324, .62], [.9808, 2.07], [.9896, 2.31], [.9920, 2.41]].forEach(([p, z]) => eq(L.zTable(p), z, 1e-9, 'z(' + p + ')'));
  eq(100 + L.zTable(15 / 15.5) * 25, 146.25, .01, 'GAP Q*'); eq(10 + L.zTable(1.19 / 1.24) * 2.3, 14.0, .03, 'Alepa Q*');
  eq(48 / (3 * 21) * 100, 76.19, .01, 'labour utilisation');
  eq(Math.sqrt(2 * 10 * 6000 / 6), 141.42, .01, 'Stockmann EOQ (500/month, 10 €, 30 € × 20 %)');
  const T = XM.courses.pam.templates.c_linebal; for (let s = 1; s < 300; s++) { const q = XM.make(XM.courses.pam, 'c_linebal', s), tb = q.parts[2];
    const times = {}, pre = {}; const m = q.prompt.match(/<tr><th>element<\/th>(.*?)<\/tr><tr><td>time<\/td>(.*?)<\/tr><tr><td>after<\/td>(.*?)<\/tr>/);
    const ids = [...m[1].matchAll(/<th>(\w)<\/th>/g)].map(x => x[1]), ts = [...m[2].matchAll(/<td>([\d.]+)<\/td>/g)].map(x => +x[1]), ps = [...m[3].matchAll(/<td>([^<]*)<\/td>/g)].map(x => x[1] === '–' ? [] : x[1].split(', '));
    ids.forEach((id, i) => { times[id] = ts[i]; pre[id] = ps[i]; }); const c = q.parts[0].answer, seen = new Set();
    tb.rows.forEach(rw => { const els = rw.cells[0].a.split(' '); if (L.sum(els.map(e => times[e])) > c + 1e-9) fail('linebal station over cycle time'); els.forEach(e => { if (!pre[e].every(p => seen.has(p) || els.indexOf(p) < els.indexOf(e) && els.includes(p))) fail('linebal precedence'); }); els.forEach(e => seen.add(e)); });
    if (seen.size !== ids.length) fail('linebal not all assigned'); if (tb.rows.length < q.parts[1].answer) fail('linebal fewer stations than TM'); }
  console.log('\n== PAM slide-example checks done');
}

/* ---- TU-A1300: the Feb 2026 paper against the hand-worked answers ---- */
if (!only || only === 'iem') {
  const R = XM.IEM.compute(XM.IEM.FEB26), eq = (a, b, t, m) => { if (Math.abs(a - b) > t) fail(`iem Feb26 ${m}: ${a} vs ${b}`); };
  eq(R.critPrice, 5.4723, .0001, 'Q1'); eq(R.finOpen, 65600, .01, 'Q2'); eq(R.np, 52240, .01, 'Q3'); eq(R.totalClose, 424240, .01, 'Q4'); eq(R.roeOpen * 100, 17.4757, .001, 'Q5');
  eq(R.gmPctNew * 100, 57.2464, .001, 'Q6'); eq(R.df3, .772183, 1e-6, 'Q8'); eq(R.fcf2, 21925.333, .01, 'Q9'); eq(R.cash, 134040, .01, 'cash'); eq(R.check, 0, 1e-6, 'balances');
  eq(R.opMargin3 * 100, 11502.93 / 223891.2 * 100, .001, 'Q7');
  console.log(`\n== TU-A1300 Feb 2026: Q7 ${L.num(R.opMargin3 * 100, 2)} %, Q10 NPV ${L.num(R.npv, 2)}, Q11 NPV ${L.num(R.npvBoth, 2)}`);
  for (let s = 1; s < 400; s++) { const c = XM.IEM.randCase(L.rng(s)), r2 = XM.IEM.compute(c); if (Math.abs(r2.check) > 1e-6) fail('iem balance does not balance ' + s); }
}

/* ---- BA1: LP solver + sensitivity against the Iron Works and "extra example" slides ---- */
if (!only || only === 'ba1') {
  const L = XM.lib, eq = (a, b, t, m) => { if (!(Math.abs(a - b) <= t)) fail(`ba1 slide check ${m}: ${a} vs ${b}`); };
  const s = L.sensitivity([5, 7], [[1, 0], [2, 3], [1, 1]], [6, 19, 8], ['<=', '<=', '<='], true);
  eq(s.z, 46, 1e-9, 'Iron Works z'); eq(s.x[0], 5, 1e-9, 'x1'); eq(s.cons[1].sp, 2, 1e-9, 'sp ore'); eq(s.cons[2].sp, 1, 1e-9, 'sp total'); eq(s.cons[2].inc, .3333, 1e-4, 'inc total'); eq(s.vars[0].dec, .3333, 1e-4, 'c1 dec'); eq(s.vars[1].inc, .5, 1e-9, 'c2 inc');
  const t = L.sensitivity([6, 9], [[1, 2], [10, 7.5], [0, 1]], [8, 30, 2], ['<=', '>=', '>='], false); eq(t.z, 27, 1e-9, 'extra z'); eq(t.cons[1].sp, .6, 1e-9, 'extra sp2'); eq(t.cons[2].sp, 4.5, 1e-9, 'extra sp3');
  const r = L.rng(99); for (let k = 0; k < 200; k++) { const n = r.int(2, 3), A = L.range(0, 3).map(() => L.range(0, n).map(() => r.int(0, 5))), b = A.map(() => r.int(5, 40)), c = L.range(0, n).map(() => r.int(1, 9));
    const sol = L.lp(c, A, b, ['<=', '<=', '<='], true); if (!sol) continue; let best = -1; const g = 40, steps = n === 2 ? [0, 1] : [0, 1, 2];
    // grid check: no feasible grid point beats the LP optimum
    for (let i = 0; i <= g; i++) for (let j = 0; j <= g; j++) for (let q = 0; q <= (n === 3 ? g : 0); q++) { const x = n === 2 ? [i, j] : [i, j, q]; if (A.every((row, ri) => L.sum(row.map((v, cj) => v * x[cj])) <= b[ri])) best = Math.max(best, L.sum(c.map((v, cj) => v * x[cj]))); }
    if (best > sol.z + 1e-6) fail('lp beaten by grid point'); }
  console.log('\n== BA1 LP/sensitivity slide checks done');
}

/* ---- S&S: closed forms against numeric integration ---- */
if (!only || only === 'ss') {
  const sinc = x => Math.abs(x) < 1e-12 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x), integ = (f, a, b, n) => { n = n || 20000; const hh = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += f(a + (i + .5) * hh); return s * hh; };
  [[3, 1], [4, 2], [5, 3]].forEach(([a, b]) => { const A = 2, trap = t => { const u = Math.abs(t); return u <= (a - b) / 2 ? A : u <= (a + b) / 2 ? A * ((a + b) / 2 - u) / b : 0; };
    [.1, .2, .37].forEach(f => { const num = integ(t => trap(t) * Math.cos(2 * Math.PI * f * t), -(a + b) / 2, (a + b) / 2); if (Math.abs(num - A * a * sinc(a * f) * sinc(b * f)) > 1e-4) fail(`ss trapezoid FT a=${a} b=${b} f=${f}: ${num}`); }); });
  [.1, .3].forEach(f => { const T = 2, num = integ(t => 3 * Math.max(0, 1 - Math.abs(t) / T) * Math.cos(2 * Math.PI * f * t), -T, T); if (Math.abs(num - 3 * T * sinc(T * f) ** 2) > 1e-4) fail('ss tria FT'); });
  const a = 3, b = 1, conv = t => integ(s => (Math.abs(s) < a / 2 ? 1 : 0) * (Math.abs(t - s) < b / 2 ? 1 : 0), -3, 3, 60000); [0, .8, 1.5, 1.9].forEach(t => { const exact = Math.max(0, Math.min(a / 2, t + b / 2) - Math.max(-a / 2, t - b / 2)); if (Math.abs(conv(t) - exact) > 1e-3) fail('ss rect conv ' + t); });
  const c1 = integ(t => Math.cos(t) ** 3 * Math.cos(t), 0, 2 * Math.PI) / Math.PI, c3 = integ(t => Math.cos(t) ** 3 * Math.cos(3 * t), 0, 2 * Math.PI) / Math.PI; if (Math.abs(c1 - .75) > 1e-6 || Math.abs(c3 - .25) > 1e-6) fail('ss cos^3');
  const f0 = 100, x = t => 2 + 3 * Math.cos(2 * Math.PI * f0 * t + Math.PI / 4) + 4 * Math.sin(2 * Math.PI * 3 * f0 * t), re = k => integ(t => x(t) * Math.cos(2 * Math.PI * k * f0 * t), 0, 1 / f0) * f0, im = k => -integ(t => x(t) * Math.sin(2 * Math.PI * k * f0 * t), 0, 1 / f0) * f0;
  if (Math.abs(Math.atan2(im(3), re(3)) + Math.PI / 2) > 1e-4 || Math.abs(Math.hypot(re(1), im(1)) - 1.5) > 1e-4) fail('ss Fourier coefficients');
  console.log('\n== S&S numeric checks done');
}

/* ---- Study Hall pages: valid links, figures render ---- */
Object.entries(XM.study || {}).forEach(([cid, pages]) => { if (only && only !== cid) return; const c = XM.courses[cid]; if (!c) return fail('study for unknown course ' + cid);
  const ids = new Set(); pages.forEach(p => { if (ids.has(p.id)) fail(`study ${cid}/${p.id}: duplicate id`); ids.add(p.id);
    if (!p.title || !(p.know || p.asks || p.method)) fail(`study ${cid}/${p.id}: empty page`);
    if (p.topic && !c.topics[p.topic]) fail(`study ${cid}/${p.id}: unknown topic ${p.topic}`);
    (p.tpls || []).forEach(t => { if (!c.templates[t]) fail(`study ${cid}/${p.id}: unknown template ${t}`); });
    if (p.fig) { try { const s = p.fig(XM.lib); if (!/<svg/.test(s)) fail(`study ${cid}/${p.id}: figure has no svg`); } catch (e) { fail(`study ${cid}/${p.id}: figure threw ${e.message}`); } }
    const txt = JSON.stringify(p); if (/undefined|NaN(?!\))/.test(txt)) fail(`study ${cid}/${p.id}: undefined/NaN in text`); });
  console.log(`== study ${cid}: ${pages.length} pages`); });
console.log(`\n${checks} questions checked, ${fails} failures`);
process.exit(fails ? 1 : 0);
