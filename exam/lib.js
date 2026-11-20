/* Exam Streamliner — shared library: seeded random numbers, formatting, the algorithms that
   compute every answer (hashing, heaps, BST/AVL, graphs, DP) and SVG drawing helpers.
   Pure functions only (no DOM at load time), so the Node tests can load this file. */
(function (G) {
'use strict';
const XM = G.XM = G.XM || { courses: {}, order: [] };
const L = XM.lib = {};

/* ---------- random numbers (seeded, so a generated case can be replayed) ---------- */
L.rng = function (seed) {
  let a = (seed >>> 0) || 1;
  const r = function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));          // inclusive
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  r.shuffle = arr => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  r.sample = (arr, k) => r.shuffle(arr).slice(0, k);
  r.chance = p => r() < p;
  r.step = (lo, hi, st) => lo + st * r.int(0, Math.round((hi - lo) / st));  // e.g. step(100, 500, 25)
  r.seed = seed;
  return r;
};
L.newSeed = () => (Math.random() * 4294967296) >>> 0;

/* ---------- formatting ---------- */
L.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
L.round = (x, d = 2) => { const f = Math.pow(10, d); return Math.round((x + Math.sign(x) * 1e-12) * f) / f; };
/* 12345.678 -> "12 345.68" (thin-space thousands, like the Finnish course material) */
L.num = (x, d = 2) => {
  if (x === Infinity) return '∞'; if (x === -Infinity) return '−∞';
  const r = L.round(x, d); const neg = r < 0; let [i, f] = Math.abs(r).toFixed(d).split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (f) f = f.replace(/0+$/, '');
  return (neg ? '−' : '') + i + (f ? '.' + f : '');
};
L.eur = (x, d = 0) => L.num(x, d) + ' €';
L.pct = (x, d = 1) => L.num(x * 100, d) + ' %';
L.alpha = i => 'abcdefghijklmnopqrstuvwxyz'[i];
L.range = (a, b) => { const o = []; for (let i = a; i < b; i++) o.push(i); return o; };
L.sum = a => a.reduce((s, x) => s + x, 0);
L.code = s => '<pre class="xm-code">' + L.esc(s.replace(/^\n/, '').replace(/\s+$/, '')) + '</pre>';
L.codeNum = s => { const lines = s.replace(/^\n/, '').replace(/\s+$/, '').split('\n'); return '<pre class="xm-code num">' + lines.map((l, i) => '<span class="ln">' + (i + 1) + '</span>' + L.esc(l)).join('\n') + '</pre>'; };

/* ---------- answer normalisation (shared by grading and tests) ---------- */
L.norm = function (s) {
  s = String(s == null ? '' : s).toLowerCase().trim();
  s = s.replace(/[−–—]/g, '-').replace(/→|->|=>|⟶/g, ' ').replace(/[,;|]/g, ' ').replace(/[\[\]{}()]/g, ' ').replace(/\s+/g, ' ').trim();
  if (/^(del|deleted|tomb|tombstone|†|x|d|dummy)$/.test(s)) return 'del';
  if (/^(-|_|empty|none|null|nil|∅|ø|\.)$/.test(s)) return '';
  if (/^(inf|infinity|∞|oo)$/.test(s)) return 'inf';
  return s;
};
L.normSet = s => L.norm(s).split(' ').filter(Boolean).sort().join(' ');

/* =====================================================================
   DSA algorithms — these compute the answers of every DSA question.
   ===================================================================== */

/* hash table with chaining: returns the table (array of arrays) after each op */
L.hashChain = function (m, ops, h) {
  h = h || (k => ((k % m) + m) % m);
  const T = L.range(0, m).map(() => []), steps = [];
  ops.forEach(([op, k]) => {
    const s = h(k);
    if (op === 'ins') { if (!T[s].includes(k)) T[s].push(k); }
    else { const i = T[s].indexOf(k); if (i >= 0) T[s].splice(i, 1); }
    steps.push({ op, k, slot: s, table: T.map(l => l.slice()) });
  });
  return steps;
};
/* open addressing; probe(k, i) gives the i-th slot. Removal leaves a tombstone 'del'.
   Insert: search the whole probe sequence for the key (stop at an empty slot), then place it
   in the first tombstone or empty slot seen. Returns the table after each op plus the probes. */
L.probeFns = {
  linear: (m) => (k, i) => (((k % m) + i) % m + m) % m,
  quadratic: (m) => (k, i) => (((k % m) + i * (i + 1) / 2) % m + m) % m,
  double: (m, h2) => (k, i) => (((k % m) + i * h2(k)) % m + m) % m
};
L.hashOpen = function (m, ops, probe) {
  probe = probe || L.probeFns.linear(m);
  const T = new Array(m).fill(null), steps = [];
  ops.forEach(([op, k]) => {
    const probes = []; let firstFree = -1, found = -1;
    for (let i = 0; i < m; i++) {
      const s = probe(k, i); probes.push(s);
      if (T[s] === null) { if (firstFree < 0) firstFree = s; break; }
      if (T[s] === 'del') { if (firstFree < 0) firstFree = s; continue; }
      if (T[s] === k) { found = s; break; }
    }
    if (op === 'ins') { if (found < 0 && firstFree >= 0) T[firstFree] = k; }
    else if (found >= 0) T[found] = 'del';
    steps.push({ op, k, probes, slot: op === 'ins' ? (found >= 0 ? found : firstFree) : found, table: T.slice() });
  });
  return steps;
};

/* binary max-heap, 0-based array (children 2i+1, 2i+2) */
L.heapInsert = function (A, x) {
  A = A.slice(); A.push(x); let i = A.length - 1; const swaps = [];
  while (i > 0) { const p = (i - 1) >> 1; if (A[p] >= A[i]) break; [A[p], A[i]] = [A[i], A[p]]; swaps.push([A[i], A[p]]); i = p; }
  return { arr: A, swaps };
};
L.heapRemoveMax = function (A) {
  A = A.slice(); const top = A[0]; const last = A.pop(); const swaps = [];
  if (A.length) { A[0] = last; let i = 0;
    for (;;) { const l = 2 * i + 1, r = l + 1; let b = i;
      if (l < A.length && A[l] > A[b]) b = l; if (r < A.length && A[r] > A[b]) b = r;
      if (b === i) break; swaps.push([A[i], A[b]]); [A[i], A[b]] = [A[b], A[i]]; i = b; } }
  return { arr: A, max: top, swaps };
};
L.isMaxHeapArr = A => A.every((x, i) => i === 0 || A[(i - 1) >> 1] >= x);

/* trees as nested arrays: [key, left, right] (null = empty) */
L.bstInsert = function (t, k) { if (!t) return [k, null, null]; if (k < t[0]) return [t[0], L.bstInsert(t[1], k), t[2]]; if (k > t[0]) return [t[0], t[1], L.bstInsert(t[2], k)]; return t; };
L.bstFrom = keys => keys.reduce((t, k) => L.bstInsert(t, k), null);
L.treeMax = t => { while (t[2]) t = t[2]; return t[0]; };
L.treeMin = t => { while (t[1]) t = t[1]; return t[0]; };
/* course convention: 2 children -> replace by the LARGEST key in the LEFT subtree (predecessor).
   mode 'succ' gives the (wrong for this course) successor version, used for distractors. */
L.bstDelete = function (t, k, mode) {
  if (!t) return null;
  if (k < t[0]) return [t[0], L.bstDelete(t[1], k, mode), t[2]];
  if (k > t[0]) return [t[0], t[1], L.bstDelete(t[2], k, mode)];
  if (!t[1]) return t[2]; if (!t[2]) return t[1];
  if (mode === 'succ') { const s = L.treeMin(t[2]); return [s, t[1], L.bstDelete(t[2], s, mode)]; }
  const p = L.treeMax(t[1]); return [p, L.bstDelete(t[1], p, mode), t[2]];
};
L.height = t => t ? 1 + Math.max(L.height(t[1]), L.height(t[2])) : 0;   // empty = 0, leaf = 1
L.isAVL = t => !t || (Math.abs(L.height(t[1]) - L.height(t[2])) <= 1 && L.isAVL(t[1]) && L.isAVL(t[2]));
L.inorder = (t, o = []) => { if (t) { L.inorder(t[1], o); o.push(t[0]); L.inorder(t[2], o); } return o; };
L.preorder = (t, o = []) => { if (t) { o.push(t[0]); L.preorder(t[1], o); L.preorder(t[2], o); } return o; };
L.levelorder = t => { const o = [], q = t ? [t] : []; while (q.length) { const n = q.shift(); o.push(n[0]); if (n[1]) q.push(n[1]); if (n[2]) q.push(n[2]); } return o; };
L.treeEq = (a, b) => (!a && !b) || (!!a && !!b && a[0] === b[0] && L.treeEq(a[1], b[1]) && L.treeEq(a[2], b[2]));
L.treeStr = t => t ? (t[1] || t[2] ? t[0] + '(' + (L.treeStr(t[1]) || '–') + ', ' + (L.treeStr(t[2]) || '–') + ')' : String(t[0])) : '';
L.imbalanced = t => { if (!t) return []; const o = L.imbalanced(t[1]).concat(L.imbalanced(t[2])); if (Math.abs(L.height(t[1]) - L.height(t[2])) > 1) o.push(t[0]); return o; };
/* AVL insert, bottom-up rebalancing. Reports the rotation that was applied. */
L.avlInsert = function (t, k) {
  const info = { rot: null, at: null };
  const rotR = n => { const l = n[1]; return [l[0], l[1], [n[0], l[2], n[2]]]; };
  const rotL = n => { const r = n[2]; return [r[0], [n[0], n[1], r[1]], r[2]]; };
  function bal(n) {
    const bf = L.height(n[1]) - L.height(n[2]);
    if (bf > 1) { if (L.height(n[1][1]) >= L.height(n[1][2])) { if (!info.rot) { info.rot = 'single right rotation'; info.at = n[0]; } return rotR(n); }
      if (!info.rot) { info.rot = 'double rotation (left-right)'; info.at = n[0]; } return rotR([n[0], rotL(n[1]), n[2]]); }
    if (bf < -1) { if (L.height(n[2][2]) >= L.height(n[2][1])) { if (!info.rot) { info.rot = 'single left rotation'; info.at = n[0]; } return rotL(n); }
      if (!info.rot) { info.rot = 'double rotation (right-left)'; info.at = n[0]; } return rotL([n[0], n[1], rotR(n[2])]); }
    return n;
  }
  function ins(n) { if (!n) return [k, null, null]; if (k < n[0]) return bal([n[0], ins(n[1]), n[2]]); if (k > n[0]) return bal([n[0], n[1], ins(n[2])]); return n; }
  const res = ins(t); return { tree: res, rot: info.rot, at: info.at };
};

/* ---------- graphs: V = list of names, E = [[u, v, w?]]; neighbours in alphabetical order ---------- */
L.adj = function (V, E, undirected) {
  const A = {}; V.forEach(v => A[v] = []);
  E.forEach(([u, v, w]) => { A[u].push([v, w]); if (undirected) A[v].push([u, w]); });
  V.forEach(v => A[v].sort((x, y) => x[0] < y[0] ? -1 : 1)); return A;
};
L.bfs = function (V, E, s) {
  const A = L.adj(V, E), dist = {}, pred = {}, order = [s], q = [s]; V.forEach(v => { dist[v] = Infinity; pred[v] = null; }); dist[s] = 0;
  const queueLog = [[s]];
  while (q.length) { const u = q.shift(); A[u].forEach(([v]) => { if (dist[v] === Infinity) { dist[v] = dist[u] + 1; pred[v] = u; q.push(v); order.push(v); } }); queueLog.push(q.slice()); }
  return { order, dist, pred, queueLog };
};
/* extended DFS with timestamps from 1, white/grey/black, from source s (or all vertices if all=true) */
L.dfs = function (V, E, s, all) {
  const A = L.adj(V, E), col = {}, d = {}, f = {}, pred = {}, order = [], back = []; let t = 0;
  V.forEach(v => { col[v] = 'w'; pred[v] = null; });
  function visit(u) { col[u] = 'g'; d[u] = ++t; order.push(u);
    A[u].forEach(([v]) => { if (col[v] === 'w') { pred[v] = u; visit(v); } else if (col[v] === 'g') back.push([u, v]); });
    col[u] = 'b'; f[u] = ++t; }
  if (s) visit(s);
  if (all) V.forEach(v => { if (col[v] === 'w') visit(v); });
  const topo = Object.keys(f).sort((x, y) => f[y] - f[x]);
  return { order, d, f, pred, cyclic: back.length > 0, back, topo };
};
L.isTopo = function (V, E, ord) {
  if (ord.length !== V.length || new Set(ord).size !== V.length || !ord.every(v => V.includes(v))) return false;
  const pos = {}; ord.forEach((v, i) => pos[v] = i); return E.every(([u, v]) => pos[u] < pos[v]);
};
L.hasCycle = (V, E) => L.dfs(V, E, null, true).cyclic;
L.scc = function (V, E) {     // Kosaraju; components sorted alphabetically inside and by first member
  const f = L.dfs(V, E, null, true).f, ord = V.slice().sort((a, b) => f[b] - f[a]);
  const R = E.map(([u, v]) => [v, u]), A = L.adj(V, R), comp = {}; const comps = [];
  ord.forEach(s => { if (comp[s] !== undefined) return; const c = [], st = [s]; comp[s] = comps.length;
    while (st.length) { const u = st.pop(); c.push(u); A[u].forEach(([v]) => { if (comp[v] === undefined) { comp[v] = comps.length; st.push(v); } }); }
    comps.push(c.sort()); });
  return comps.sort((a, b) => a[0] < b[0] ? -1 : 1);
};
/* Dijkstra with a log of every extraction: dist snapshot after each step. Ties -> alphabetical. */
L.dijkstra = function (V, E, s) {
  const A = L.adj(V, E), dist = {}, pred = {}, done = {}, order = [], log = [];
  V.forEach(v => { dist[v] = Infinity; pred[v] = null; }); dist[s] = 0; let ties = false;
  for (;;) {
    let u = null; V.slice().sort().forEach(v => { if (!done[v] && dist[v] < Infinity && (u === null || dist[v] < dist[u])) u = v; });
    if (u === null) break;
    V.forEach(v => { if (!done[v] && v !== u && dist[v] === dist[u]) ties = true; });
    done[u] = true; order.push(u);
    A[u].forEach(([v, w]) => { if (!done[v] && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pred[v] = u; } });
    log.push({ u, dist: Object.assign({}, dist) });
  }
  return { order, dist, pred, log, ties };
};
L.bellmanFord = function (V, E, s) { const d = {}; V.forEach(v => d[v] = Infinity); d[s] = 0;
  for (let i = 0; i < V.length - 1; i++) E.forEach(([u, v, w]) => { if (d[u] + w < d[v]) d[v] = d[u] + w; }); return d; };
/* DP on DAGs: number of paths v -> t and longest path v -> t, evaluated in reverse topological order */
L.dagCount = function (V, E, t) { const topo = L.dfs(V, E, null, true).topo, A = L.adj(V, E), a = {};
  topo.slice().reverse().forEach(v => { a[v] = v === t ? 1 : L.sum(A[v].map(([w]) => a[w])); }); return { a, evalOrder: topo.slice().reverse() }; };
L.dagLongest = function (V, E, t) { const topo = L.dfs(V, E, null, true).topo, A = L.adj(V, E), l = {};
  topo.slice().reverse().forEach(v => { if (v === t) { l[v] = 0; return; } let b = -Infinity; A[v].forEach(([w, c]) => { if (l[w] > -Infinity) b = Math.max(b, c + l[w]); }); l[v] = b; });
  return { l, evalOrder: topo.slice().reverse() }; };
/* ---------- DP ---------- */
L.jumps = function (n, steps) { const F = [1]; for (let i = 1; i <= n; i++) F[i] = L.sum(steps.map(s => i - s >= 0 ? F[i - s] : 0)); return F; };
/* rgb strings with a set of forbidden adjacent pairs (default r/g): counts by last letter */
L.rgb = function (n, banned) { banned = banned || ['rg', 'gr']; const C = 'rgb'.split(''), rows = [];
  let cur = { r: 1, g: 1, b: 1 }; rows.push(Object.assign({}, cur));
  for (let i = 2; i <= n; i++) { const nx = {}; C.forEach(c => { nx[c] = L.sum(C.filter(p => !banned.includes(p + c)).map(p => cur[p])); }); cur = nx; rows.push(Object.assign({}, cur)); }
  return rows.map(r => Object.assign(r, { total: r.r + r.g + r.b })); };
L.lps = function (s) { const n = s.length, T = L.range(0, n).map(() => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) { T[i][i] = 1; for (let j = i + 1; j < n; j++) T[i][j] = s[i] === s[j] ? (j === i + 1 ? 2 : T[i + 1][j - 1] + 2) : Math.max(T[i + 1][j], T[i][j - 1]); }
  return T; };
L.coinWays = function (amount, coins) { const W = new Array(amount + 1).fill(0); W[0] = 1; coins.forEach(c => { for (let x = c; x <= amount; x++) W[x] += W[x - c]; }); return W; };
L.minCoins = function (amount, coins) { const M = [0]; for (let x = 1; x <= amount; x++) { M[x] = Infinity; coins.forEach(c => { if (c <= x && M[x - c] + 1 < M[x]) M[x] = M[x - c] + 1; }); } return M; };
L.knap01 = function (W, items) { /* items [[w,v]] -> table rows i=0..n, cols 0..W */ const T = [new Array(W + 1).fill(0)];
  items.forEach(([w, v], i) => { const P = T[i], R = []; for (let c = 0; c <= W; c++) R[c] = Math.max(P[c], c >= w ? P[c - w] + v : -Infinity); T.push(R); }); return T; };
L.rodCut = function (n, price) { const r = [0], cut = [0]; for (let j = 1; j <= n; j++) { let b = -1, bi = 0; for (let i = 1; i <= j; i++) { const v = price[i] + r[j - i]; if (v > b) { b = v; bi = i; } } r[j] = b; cut[j] = bi; } return { r, cut }; };
L.lcs = function (a, b) { const T = L.range(0, a.length + 1).map(() => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) T[i][j] = a[i - 1] === b[j - 1] ? T[i - 1][j - 1] + 1 : Math.max(T[i - 1][j], T[i][j - 1]); return T; };

/* ---------- sorting traces ---------- */
L.trace = {
  insertion(a) { a = a.slice(); const out = []; for (let i = 1; i < a.length; i++) { const e = a[i]; let j = i; while (j > 0 && e < a[j - 1]) { a[j] = a[j - 1]; j--; } a[j] = e; out.push(a.slice()); } return out; },
  selection(a) { a = a.slice(); const out = []; for (let i = 0; i < a.length - 1; i++) { let b = i; for (let j = i + 1; j < a.length; j++) if (a[j] < a[b]) b = j; [a[i], a[b]] = [a[b], a[i]]; out.push(a.slice()); } return out; },
  bubble(a) { a = a.slice(); const out = []; for (let i = 0; i < a.length - 1; i++) { for (let j = 0; j < a.length - 1 - i; j++) if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]]; out.push(a.slice()); } return out; },
  /* Lomuto partition as in the 2018 exam: pivot a(hi); returns array after the first partition and pivot index */
  lomuto(a) { a = a.slice(); const lo = 0, hi = a.length - 1, p = a[hi]; let i = lo - 1; for (let j = lo; j < hi; j++) if (a[j] <= p) { i++; [a[i], a[j]] = [a[j], a[i]]; } [a[i + 1], a[hi]] = [a[hi], a[i + 1]]; return { arr: a, q: i + 1 }; },
  /* bottom-up view of top-down mergesort: the array after each merge, in the order the recursion does them */
  merges(a) { a = a.slice(); const out = []; (function inner(s, e) { if (s >= e) return; const m = s + ((e - s) >> 1); inner(s, m); inner(m + 1, e);
      const L1 = a.slice(s, m + 1), R1 = a.slice(m + 1, e + 1), M = []; let i = 0, j = 0; while (i < L1.length && j < R1.length) M.push(L1[i] <= R1[j] ? L1[i++] : R1[j++]);
      while (i < L1.length) M.push(L1[i++]); while (j < R1.length) M.push(R1[j++]); M.forEach((x, k) => a[s + k] = x); out.push({ s, e, arr: a.slice() }); })(0, a.length - 1); return out; },
  lsd(a, base) { base = base || 10; a = a.slice(); const out = []; const mx = Math.max.apply(null, a); for (let ex = 1; Math.floor(mx / ex) > 0; ex *= base) { const B = L.range(0, base).map(() => []); a.forEach(x => B[Math.floor(x / ex) % base].push(x)); a = [].concat.apply([], B); out.push(a.slice()); } return out; }
};

/* ---------- small LP solver (vertex enumeration) + Excel-style sensitivity report ----------
   max/min c·x  s.t.  A x (<=|>=|=) b,  x >= 0.  Fine for the course-sized problems (≤ 9 variables). */
L.solveLin = function (M, v) { const n = v.length, a = M.map((r, i) => r.concat([v[i]]));
  for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r; if (Math.abs(a[p][c]) < 1e-10) return null; [a[c], a[p]] = [a[p], a[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const f = a[r][c] / a[c][c]; for (let k = c; k <= n; k++) a[r][k] -= f * a[c][k]; } }
  return a.map((r, i) => r[n] / r[i]); };
L.combos = function (n, k) { const out = [], cur = []; (function rec(s) { if (cur.length === k) { out.push(cur.slice()); return; } for (let i = s; i < n; i++) { cur.push(i); rec(i + 1); cur.pop(); } })(0); return out; };
L.lp = function (c, A, b, rel, max) {
  const n = c.length, rows = A.map((r, i) => ({ a: r, b: b[i], rel: rel[i] })); for (let j = 0; j < n; j++) { const a = new Array(n).fill(0); a[j] = 1; rows.push({ a, b: 0, rel: '>=' }); }
  const eqIdx = rows.map((r, i) => r.rel === '=' ? i : -1).filter(i => i >= 0); let best = null;
  const ok = x => rows.every(r => { const s = L.sum(r.a.map((v, j) => v * x[j])), t = 1e-7 * Math.max(1, Math.abs(r.b)); return r.rel === '<=' ? s <= r.b + t : r.rel === '>=' ? s >= r.b - t : Math.abs(s - r.b) <= t; });
  L.combos(rows.length, n).forEach(cmb => { if (!eqIdx.every(e => cmb.includes(e))) return; const x = L.solveLin(cmb.map(i => rows[i].a), cmb.map(i => rows[i].b)); if (!x || !ok(x)) return;
    const z = L.sum(c.map((v, j) => v * x[j])); if (!best || (max ? z > best.z + 1e-9 : z < best.z - 1e-9)) best = { x: x.map(v => Math.abs(v) < 1e-9 ? 0 : v), z }; });
  return best;
};
L.sensitivity = function (c, A, b, rel, max) {
  const base = L.lp(c, A, b, rel, max); if (!base) return null; const z0 = base.z, x0 = base.x, eps = 1e-4, BIG = 1e6, tol = 1e-9 * Math.max(1, Math.abs(z0)), T = d => tol + 1e-11 * d * (1 + Math.abs(z0));
  const zb = (i, d) => { const bb = b.slice(); bb[i] += d; const s = L.lp(c, A, bb, rel, max); return s ? s.z : NaN; };
  const bis = (good) => { if (good(BIG)) return Infinity; let lo = 0, hi = BIG; for (let k = 0; k < 90; k++) { const m = (lo + hi) / 2; if (good(m)) lo = m; else hi = m; } return Math.round(lo * 1e4) / 1e4; };
  const cons = A.map((row, i) => { const lhs = L.sum(row.map((v, j) => v * x0[j])), sp = (zb(i, eps) - z0) / eps, spr = Math.round(sp * 1e4) / 1e4;
    const good = s => d => { const z = zb(i, s * d); return isFinite(z) && Math.abs(z - z0 - spr * s * d) <= T(d); };
    return { lhs, sp: spr, rhs: b[i], inc: bis(good(1)), dec: bis(good(-1)), binding: Math.abs(lhs - b[i]) < 1e-7 }; });
  const vars = c.map((cj, j) => {
    const keep = s => d => { const cc = c.slice(); cc[j] += s * d; const sol = L.lp(cc, A, b, rel, max), zx = L.sum(cc.map((v, k) => v * x0[k])); return sol && (max ? sol.z <= zx + T(d) : sol.z >= zx - T(d)); };
    let rc = 0; if (x0[j] < 1e-9) { const A2 = A.concat([c.map((_, k) => k === j ? 1 : 0)]), s = L.lp(c, A2, b.concat([eps]), rel.concat(['>=']), max); rc = s ? Math.round((s.z - z0) / eps * 1e4) / 1e4 : -Infinity; }
    return { x: x0[j], rc, c: cj, inc: bis(keep(1)), dec: bis(keep(-1)) }; });
  return { z: z0, x: x0, cons, vars };
};

/* ---------- statistics ---------- */
L.erf = x => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + .3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x); return s * y; };
L.Phi = z => .5 * (1 + L.erf(z / Math.SQRT2));
/* the course reads z from a printed z-table: the 2-decimal z whose Φ(z) is closest to p */
L.zTable = p => { let best = 0, bd = 9; for (let i = -349; i <= 349; i++) { const z = i / 100, d = Math.abs(L.Phi(z) - p); if (d < bd - 1e-12) { bd = d; best = z; } } return best; };
L.mean = a => L.sum(a) / a.length;
L.sd = a => { const m = L.mean(a); return Math.sqrt(L.sum(a.map(x => (x - m) * (x - m))) / (a.length - 1)); };

/* =====================================================================
   SVG helpers (theme-aware via CSS classes in exam.css)
   ===================================================================== */
const f1 = x => (Math.round(x * 10) / 10).toString();
L.svg = (w, h, inner, cls) => `<svg class="xm-svg ${cls || ''}" viewBox="0 0 ${w} ${h}" width="${w}" style="max-width:100%;height:auto" role="img">${inner}</svg>`;
L.node = (x, y, k, o = {}) => `<g class="xm-n${o.hot ? ' hot' : ''}${o.dim ? ' dim' : ''}"><circle cx="${f1(x)}" cy="${f1(y)}" r="${o.r || 15}"/><text x="${f1(x)}" y="${f1(y + 4.5)}" text-anchor="middle">${L.esc(k)}</text></g>`;
/* tree drawing: nodes placed by inorder rank, depth rows */
L.drawTree = function (t, o = {}) {
  if (!t) return L.svg(80, 40, '<text x="40" y="24" text-anchor="middle" class="xm-lab">(empty tree)</text>');
  const P = []; let i = 0; (function walk(n, d) { if (!n) return; walk(n[1], d + 1); P.push({ n, d, i: i++ }); walk(n[2], d + 1); })(t, 0);
  const dx = o.dx || 38, dy = o.dy || 52, W = Math.max(80, P.length * dx + 20), H = (Math.max.apply(null, P.map(p => p.d)) + 1) * dy + 10;
  const pos = new Map(P.map(p => [p.n, [10 + dx * (p.i + .5), 26 + p.d * dy]]));
  let s = ''; P.forEach(p => [p.n[1], p.n[2]].forEach(c => { if (c) { const a = pos.get(p.n), b = pos.get(c); s += `<line class="xm-e" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"/>`; } }));
  P.forEach(p => { const [x, y] = pos.get(p.n); s += L.node(x, y, p.n[0], { hot: o.hot && o.hot.includes(p.n[0]) }); });
  if (o.label) s += `<text x="${W / 2}" y="${H + 12}" text-anchor="middle" class="xm-lab">${L.esc(o.label)}</text>`;
  return L.svg(W, H + (o.label ? 20 : 0), s, 'tree');
};
/* heap shown as a complete tree from its array */
L.heapTree = A => { const b = i => i < A.length ? [A[i], b(2 * i + 1), b(2 * i + 2)] : null; return b(0); };
/* directed graph with fixed coordinates: V = {name:[x,y]}, E = [[u,v,w]] */
L.drawGraph = function (V, E, o = {}) {
  const xs = Object.values(V).map(p => p[0]), ys = Object.values(V).map(p => p[1]);
  const W = Math.max.apply(null, xs) + 30, H = Math.max.apply(null, ys) + 30; let s = '';
  const keyset = new Set(E.map(e => e[0] + '>' + e[1]));
  E.forEach(([u, v, w]) => {
    const [x1, y1] = V[u], [x2, y2] = V[v], Ln = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / Ln, uy = (y2 - y1) / Ln;
    const both = !o.undirected && keyset.has(v + '>' + u), off = both ? 7 : 0, nx = -uy * off, ny = ux * off;
    const hot = o.hot && o.hot.some(h => h[0] === u && h[1] === v);
    s += `<line class="xm-e${hot ? ' hot' : ''}" x1="${f1(x1 + ux * 16 + nx)}" y1="${f1(y1 + uy * 16 + ny)}" x2="${f1(x2 - ux * (o.undirected ? 16 : 19) + nx)}" y2="${f1(y2 - uy * (o.undirected ? 16 : 19) + ny)}"${o.undirected ? '' : ` marker-end="url(#xm-arr${hot ? 'h' : ''})"`}/>`;
    if (w !== undefined && w !== null) { const mx = (x1 + x2) / 2 + nx * 1.8, my = (y1 + y2) / 2 + ny * 1.8; s += `<g class="xm-w"><rect x="${f1(mx - 10)}" y="${f1(my - 9)}" width="20" height="17" rx="4"/><text x="${f1(mx)}" y="${f1(my + 4)}" text-anchor="middle">${w}</text></g>`; }
  });
  Object.entries(V).forEach(([k, [x, y]]) => { s += L.node(x, y, k, { hot: o.fill && o.fill.includes(k) }); });
  const defs = '<defs><marker id="xm-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="xm-ah"/></marker><marker id="xm-arrh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="xm-ah hot"/></marker></defs>';
  return L.svg(W, H, defs + s, 'graph');
};
/* array / hash table row */
L.drawArray = function (A, o = {}) {
  const w = o.w || 40; let s = '';
  A.forEach((v, i) => { const x = 4 + i * w; s += `<g class="xm-cell${o.hot && o.hot.includes(i) ? ' hot' : ''}"><rect x="${x}" y="4" width="${w - 2}" height="32" rx="4"/><text x="${x + (w - 2) / 2}" y="25" text-anchor="middle">${v === null || v === undefined ? '' : L.esc(v)}</text></g><text class="xm-lab" x="${x + (w - 2) / 2}" y="52" text-anchor="middle">${i}</text>`; });
  return L.svg(A.length * w + 8, 58, s, 'arr');
};
/* line / stem plot for spectra and curves: series = [{pts:[[x,y]], stem:bool, label}] */
L.drawPlot = function (series, o = {}) {
  const W = o.w || 520, H = o.h || 220, pad = 38; const all = [].concat.apply([], series.map(s => s.pts));
  const x0 = o.xmin !== undefined ? o.xmin : Math.min.apply(null, all.map(p => p[0])), x1 = o.xmax !== undefined ? o.xmax : Math.max.apply(null, all.map(p => p[0]));
  const y0 = o.ymin !== undefined ? o.ymin : Math.min(0, Math.min.apply(null, all.map(p => p[1]))), y1 = o.ymax !== undefined ? o.ymax : Math.max.apply(null, all.map(p => p[1])) * 1.12 || 1;
  const X = x => pad + (x - x0) / (x1 - x0 || 1) * (W - pad - 14), Y = y => H - 26 - (y - y0) / (y1 - y0 || 1) * (H - 46);
  let s = `<line class="xm-ax" x1="${pad}" y1="${f1(Y(0))}" x2="${W - 8}" y2="${f1(Y(0))}"/><line class="xm-ax" x1="${f1(X(Math.max(x0, Math.min(0, x1))))}" y1="10" x2="${f1(X(Math.max(x0, Math.min(0, x1))))}" y2="${H - 22}"/>`;
  (o.xticks || []).forEach(t => { s += `<text class="xm-lab" x="${f1(X(t[0]))}" y="${H - 8}" text-anchor="middle">${L.esc(t[1])}</text><line class="xm-ax" x1="${f1(X(t[0]))}" x2="${f1(X(t[0]))}" y1="${f1(Y(0) - 3)}" y2="${f1(Y(0) + 3)}"/>`; });
  (o.yticks || []).forEach(t => { s += `<text class="xm-lab" x="${pad - 6}" y="${f1(Y(t[0]) + 4)}" text-anchor="end">${L.esc(t[1])}</text><line class="xm-grid" x1="${pad}" x2="${W - 8}" y1="${f1(Y(t[0]))}" y2="${f1(Y(t[0]))}"/>`; });
  series.forEach((sr, k) => {
    if (sr.stem) sr.pts.forEach(([x, y]) => { s += `<line class="xm-stem s${k}" x1="${f1(X(x))}" y1="${f1(Y(0))}" x2="${f1(X(x))}" y2="${f1(Y(y))}"/><circle class="xm-dot s${k}" cx="${f1(X(x))}" cy="${f1(Y(y))}" r="3.5"/>` + (sr.labels ? `<text class="xm-lab" x="${f1(X(x))}" y="${f1(Y(y) - 8)}" text-anchor="middle">${L.esc(sr.labels(x, y))}</text>` : ''); });
    else s += `<polyline class="xm-line s${k}" points="${sr.pts.map(([x, y]) => f1(X(x)) + ',' + f1(Y(y))).join(' ')}"/>`;
  });
  if (o.xlabel) s += `<text class="xm-lab" x="${W - 10}" y="${f1(Y(0) - 6)}" text-anchor="end">${L.esc(o.xlabel)}</text>`;
  if (o.ylabel) s += `<text class="xm-lab" x="${pad + 4}" y="16">${L.esc(o.ylabel)}</text>`;
  return L.svg(W, H, s, 'plot');
};
L.f1 = f1;
})(typeof window !== 'undefined' ? window : globalThis);
