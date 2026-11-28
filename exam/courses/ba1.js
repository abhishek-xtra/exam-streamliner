/* ISM-C1004 Business Analytics 1 — retake Mon 1.2.2027 (time and room: check Sisu; same day as the S&S exam). No past papers.
   Exam = (1) modelling problems like the spreadsheet assignments, (2) theory & terminology.
   Built from the lecture examples (Iron Works, Olympic Bike, Dakota, P&P, Ryan, swim team,
   capital budgeting, fixed charge, Markowitz, MOLP) with new numbers. Every optimum and every
   sensitivity-report number is computed by the LP solver in lib.js.
   (Not based on Assignment 3: the course forbids AI help on assignments.) */
(function (G) {
'use strict';
const XM = G.XM, L = XM.lib, h = L.esc;
const mc = (label, prompt, correct, wrongs, points, why, o) => Object.assign({ type: 'mcq', label, prompt, options: [correct].concat(wrongs), answer: 0, points: points || 1, why }, o || {});
const wr = (label, prompt, points, model, rubric) => ({ type: 'written', label, prompt, points, model, rubric });
const num = (label, prompt, answer, points, o) => Object.assign({ type: 'numeric', label, prompt, answer, points: points || 1, rtol: .005 }, o || {});
const N = (x, d) => L.num(x, d === undefined ? 2 : d);
const term = (cf, v, first) => { const a = Math.abs(cf), s = cf < 0 ? '− ' : first ? '' : '+ '; return s + (a === 1 ? '' : N(a, 3)) + v; };
const lin = (cs, vs) => { let s = '', f = true; cs.forEach((c, i) => { if (!c) return; s += (f ? '' : ' ') + term(c, vs[i], f); f = false; }); return s || '0'; };
const REL = { '<=': '≤', '>=': '≥', '=': '=' };
const blocks = (groups, pts) => ({ type: 'blocks', label: '', prompt: 'Build the model: pick every correct block.', points: pts || 4, groups });
const opt = (t, ok) => ({ t, ok: !!ok });

/* ======================= formulation: product mix ======================= */
const MIX = [['Olympic Bike', 'frames', ['Deluxe', 'Professional', 'Racer'], ['aluminium (kg)', 'steel (kg)', 'labour (h)']], ['Dakota Furniture', 'pieces', ['desks', 'tables', 'chairs'], ['lumber (board ft)', 'finishing (h)', 'carpentry (h)']],
  ['Iron Works', 'kt of steel', ['grade 1', 'grade 2', 'grade 3'], ['iron ore (kt)', 'furnace time (h)', 'coke (t)']], ['Par Golf', 'bags', ['standard', 'deluxe', 'travel'], ['cutting (h)', 'sewing (h)', 'finishing (h)']]];
function randLP(r, nv, nc) {
  for (let t = 0; t < 400; t++) {
    const c = L.range(0, nv).map(() => r.int(2, 12)), A = L.range(0, nc).map(() => L.range(0, nv).map(() => r.int(0, 6))), b = A.map(() => r.step(20, 120, 5));
    if (A.some(row => row.every(v => !v)) || L.range(0, nv).some(j => A.every(row => !row[j]))) continue;
    const s = L.sensitivity(c, A, b, A.map(() => '<='), true); if (!s) continue;
    const tight = s.cons.filter(k => k.binding).length + s.x.filter(v => v < 1e-9).length; if (tight !== nv) continue;      // non-degenerate
    if (s.vars.some(v => v.inc < .01 || v.dec < .01) || s.x.every(v => v < 1e-9)) continue;                                     // unique optimum
    if (s.x.some(v => Math.abs(v * 4 - Math.round(v * 4)) > 1e-6)) continue;                                                   // quarter values: readable
    return { c, A, b, s };
  }
  return null;
}
function gFormulateMix(r) {
  const [co, unit, prods, res] = r.pick(MIX), nv = r.pick([2, 3]); let P; while (!(P = randLP(r, nv, 3)));
  const { c, A, b, s } = P, vs = L.range(0, nv).map(i => `x<sub>${i + 1}</sub>`);
  const tbl = `<div class="xm-tw"><table class="xm-tab"><tr><th></th>${prods.slice(0, nv).map(p => `<th>${p}</th>`).join('')}<th>available</th></tr><tr><td>profit €/unit</td>${c.map(v => `<td>${v}</td>`).join('')}<td></td></tr>${A.map((row, i) => `<tr><td>${res[i]}</td>${row.map(v => `<td>${v}</td>`).join('')}<td>${b[i]}</td></tr>`).join('')}</table></div>`;
  const wrongObj = r.pick([`min ${lin(c, vs)}`, `max ${lin(A[0], vs)}`, `max ${lin(c.map(v => v + 1), vs)}`]);
  return { title: 'Formulate an LP: product mix', prompt: `${co} makes ${prods.slice(0, nv).join(', ')} (${unit}). Profit and resource use per unit, and the weekly availability:${tbl}How much of each should be made per week to maximise profit? (Fractions allowed.)`,
    parts: [blocks([{ name: 'Decision variables', options: r.shuffle([opt(`x<sub>i</sub> = amount of product i made per week`, 1), opt('x<sub>i</sub> = amount of resource i used', 0), opt('x<sub>i</sub> = profit of product i', 0)]) },
      { name: 'Objective', options: r.shuffle([opt(`max ${lin(c, vs)}`, 1), opt(wrongObj, 0)]) },
      { name: 'Constraints', options: r.shuffle(A.map((row, i) => opt(`${lin(row, vs)} ≤ ${b[i]}  (${res[i]})`, 1)).concat([opt(`${lin(A[0], vs)} ≥ ${b[0]}`, 0), opt(`${lin(A[0].map(v => v + 1), vs)} ≤ ${b[0]}`, 0)])) },
      { name: 'Variable types', options: [opt('x<sub>i</sub> ≥ 0', 1), opt('x<sub>i</sub> binary', 0)] }], 4),
      num('', 'Optimal weekly profit (€)?', s.z, 2, { tol: .01, rtol: 0 }),
      { type: 'table', label: '', prompt: 'Optimal production plan.', points: 2, cols: prods.slice(0, nv), rows: [{ label: 'x', cells: s.x.map(v => ({ a: L.round(v, 4), num: true, tol: .01, rtol: 0 })) }] }],
    solution: [`max ${lin(c, vs)}`, ...A.map((row, i) => `${lin(row, vs)} ≤ ${b[i]}`), 'x ≥ 0', `Optimum x = (${s.x.map(v => N(v, 3)).join(', ')}), profit ${N(s.z)} €. Binding: ${s.cons.map((k, i) => k.binding ? res[i] : null).filter(Boolean).join(', ')}.`],
    traps: ['Mixing up rows and columns of the data table (one constraint per resource, one variable per product).', 'Forgetting non-negativity.'] };
}

/* ======================= sensitivity report reading ======================= */
const fmtX = v => v === Infinity ? '1E+30' : L.round(v, 4).toString();
function reportHTML(P, names, resNames) {
  const { s, c, b } = P;
  return `<div class="xm-tw wide"><table class="xm-tab excel rep"><tr><th colspan="7" style="text-align:left">Variable Cells</th></tr><tr><th>Cell</th><th>Name</th><th>Final Value</th><th>Reduced Cost</th><th>Objective Coefficient</th><th>Allowable Increase</th><th>Allowable Decrease</th></tr>
    ${s.vars.map((v, j) => `<tr><td>$${'BCD'[j]}$5</td><td>${names[j]}</td><td>${fmtX(v.x)}</td><td>${fmtX(v.rc)}</td><td>${v.c}</td><td>${fmtX(v.inc)}</td><td>${fmtX(v.dec)}</td></tr>`).join('')}
    <tr><th colspan="7" style="text-align:left">Constraints</th></tr><tr><th>Cell</th><th>Name</th><th>Final Value</th><th>Shadow Price</th><th>Constraint R.H. Side</th><th>Allowable Increase</th><th>Allowable Decrease</th></tr>
    ${s.cons.map((k, i) => `<tr><td>$E$${8 + i}</td><td>${resNames[i]}</td><td>${fmtX(k.lhs)}</td><td>${fmtX(k.sp)}</td><td>${k.rhs}</td><td>${fmtX(k.inc)}</td><td>${fmtX(k.dec)}</td></tr>`).join('')}</table></div>`;
}
function gSensitivity(r) {
  const [co, unit, prods, res] = r.pick(MIX), nv = r.pick([2, 3, 3]); let P; while (!(P = randLP(r, nv, 3)));
  const { c, A, b, s } = P, names = prods.slice(0, nv), vs = names.map((_, i) => `x<sub>${i + 1}</sub>`), parts = [];
  parts.push(num('(a)', 'What is the optimal total profit?', s.z, 1, { tol: .01, rtol: 0, why: 'Σ objective coefficient × final value.' }));
  const bind = s.cons.map((k, i) => k.binding ? i : -1).filter(i => i >= 0);
  parts.push({ type: 'mcq', label: '(b)', prompt: 'Which constraints are binding? (select all)', options: res, answer: bind, points: 1, why: 'Binding ⇔ final value = RHS ⇔ (non-degenerate case) non-zero shadow price.' });
  const bi = r.pick(bind), K = s.cons[bi], d = K.inc === Infinity ? r.int(5, 20) : Math.max(1, Math.floor(K.inc * r.pick([.4, .6, .8])));
  parts.push(num('(c)', `${res[bi]}: the available amount increases by <b>${d}</b>. New optimal profit?`, s.z + K.sp * d, 1.5, { tol: .01, rtol: 0, why: `ΔZ = shadow price × ΔRHS = ${fmtX(K.sp)} × ${d} (valid because ${d} ≤ allowable increase ${fmtX(K.inc)}).` }));
  const nb = s.cons.findIndex(k => !k.binding);
  if (nb >= 0) parts.push(num('(d)', `How many units of ${res[nb]} are left unused at the optimum?`, s.cons[nb].rhs - s.cons[nb].lhs, 1, { tol: .01, rtol: 0, why: 'Slack = RHS − final value. Its shadow price is 0: more of it is worth nothing.' }));
  const j = r.int(0, nv - 1), V = s.vars[j];
  if (V.x < 1e-9) parts.push(num('(e)', `${names[j]} is not produced. By how much must its unit profit increase before producing it becomes worthwhile?`, Math.abs(V.rc), 1.5, { tol: .01, rtol: 0, why: `|Reduced cost| = ${fmtX(Math.abs(V.rc))} (= allowable increase of its coefficient).` }));
  else { const dd = V.dec === Infinity ? r.int(1, 3) : Math.max(.5, L.round(V.dec * r.pick([.3, .5, .7]), 1)); parts.push(mc('(e)', `The unit profit of ${names[j]} falls from ${V.c} to ${L.round(V.c - dd, 2)}. Does the optimal plan change?`, 'No: the decrease is within the allowable decrease (range of optimality)', ['Yes: any change in a coefficient changes the solution', 'Yes: the shadow prices change', 'Cannot be said without re-solving'], 1, `Range of optimality for c<sub>${j + 1}</sub>: [${fmtX(V.c - V.dec)}, ${fmtX(V.c + V.inc)}].`));
    parts.push(num('', 'Then the new optimal profit is?', s.z - dd * V.x, 1, { tol: .01, rtol: 0, why: 'Same plan, new coefficient: Z = Σ c·x with the new c.' })); }
  parts.push(mc('(f)', `If the RHS of ${res[bi]} increases by more than its allowable increase, then…`, 'the shadow price is no longer guaranteed: the model must be re-solved', ['the objective changes by shadow price × increase anyway', 'the problem becomes infeasible', 'the reduced costs become zero'], 1, 'The shadow price is valid only within the range of feasibility.'));
  parts.push(mc('(g)', 'What does the shadow price of a constraint mean?', 'Change in the optimal objective value per unit increase in the constraint\'s RHS', ['The price paid for the resource', 'Change in a decision variable per unit RHS', 'Unused amount of the resource'], 1, ''));
  return { title: 'Read the Excel sensitivity report', prompt: `${co}: max ${lin(c, vs)} subject to ${A.map((row, i) => `${lin(row, vs)} ≤ ${b[i]} (${res[i]})`).join('; ')}; x ≥ 0. Excel Solver produced this sensitivity report:` + reportHTML(P, names, res), parts,
    solution: [`Optimum (${s.x.map(v => N(v, 3)).join(', ')}), Z = ${N(s.z)}.`, ...s.cons.map((k, i) => `${res[i]}: usage ${fmtX(k.lhs)} / ${k.rhs}, shadow price ${fmtX(k.sp)}, RHS range [${fmtX(k.rhs - k.dec)}, ${k.inc === Infinity ? '∞' : fmtX(k.rhs + k.inc)}]`), ...s.vars.map((v, k) => `${names[k]}: reduced cost ${fmtX(v.rc)}, range of optimality [${fmtX(v.c - v.dec)}, ${v.inc === Infinity ? '∞' : fmtX(v.c + v.inc)}]`)],
    traps: ['Using the shadow price outside its allowable range.', 'Changing two coefficients at once: the report only covers one change at a time.', '1E+30 means "infinite".'] };
}

/* ======================= graphical LP ======================= */
function gGraphical(r) {
  for (let t = 0; t < 300; t++) {
    const max = r.chance(.65), c = [r.int(1, 9), r.int(1, 9)], k = 3;
    const A = L.range(0, k).map(() => [r.int(0, 5), r.int(0, 5)]), rel = A.map(() => max ? '<=' : r.pick(['>=', '>=', '<='])), b = A.map(() => r.step(6, 30, 2));
    if (A.some(a => !a[0] && !a[1])) continue;
    const s = L.lp(c, A, b, rel, max); if (!s) continue;
    const cc = c.slice(); const alt = L.lp(cc.map((v, i) => v + (i ? 1e-3 : 0)), A, b, rel, max), alt2 = L.lp(cc.map((v, i) => v + (i ? 0 : 1e-3)), A, b, rel, max);
    if (!alt || !alt2 || Math.hypot(alt.x[0] - alt2.x[0], alt.x[1] - alt2.x[1]) > 1e-6) continue;   // unique optimum
    if (Math.max(...s.x) > 40 || s.x.some(v => Math.abs(v * 2 - Math.round(v * 2)) > 1e-6)) continue;
    // feasible vertices for the picture (bounded region needed for a max problem; for min draw within a window)
    const rows = A.map((a, i) => ({ a, b: b[i], rel: rel[i] })).concat([{ a: [1, 0], b: 0, rel: '>=' }, { a: [0, 1], b: 0, rel: '>=' }, { a: [1, 0], b: 40, rel: '<=' }, { a: [0, 1], b: 40, rel: '<=' }]);
    const okp = p => rows.every(q => { const v = q.a[0] * p[0] + q.a[1] * p[1]; return q.rel === '<=' ? v <= q.b + 1e-7 : v >= q.b - 1e-7; });
    const V = []; L.combos(rows.length, 2).forEach(([i, j]) => { const p = L.solveLin([rows[i].a, rows[j].a], [rows[i].b, rows[j].b]); if (p && okp(p) && !V.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-7)) V.push(p); });
    if (V.length < 3) continue; const cx = L.mean(V.map(p => p[0])), cy = L.mean(V.map(p => p[1])); V.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
    const W = Math.max(...V.map(p => p[0]), ...b.map((bb, i) => A[i][0] ? bb / A[i][0] : 0)) * 1.1 + 1, H = Math.max(...V.map(p => p[1]), ...b.map((bb, i) => A[i][1] ? bb / A[i][1] : 0)) * 1.1 + 1;
    const S = 300, X = x => 34 + x / W * S, Y = y => 20 + S - y / H * S; let svg = `<polygon points="${V.map(p => L.f1(X(p[0])) + ',' + L.f1(Y(p[1]))).join(' ')}" style="fill:color-mix(in srgb,var(--x-ok) 22%,transparent);stroke:none"/>`;
    svg += `<line class="xm-ax" x1="34" y1="${20 + S}" x2="${34 + S + 10}" y2="${20 + S}"/><line class="xm-ax" x1="34" y1="${20 + S}" x2="34" y2="10"/><text class="xm-lab" x="${34 + S + 6}" y="${16 + S}">x₁</text><text class="xm-lab" x="40" y="14">x₂</text>`;
    A.forEach((a, i) => {
      // segment of a[0]x + a[1]y = b inside the window [0,W]×[0,H]
      const P2 = []; const add = (x, y) => { if (x >= -1e-9 && x <= W + 1e-9 && y >= -1e-9 && y <= H + 1e-9) P2.push([x, y]); };
      if (a[1]) { add(0, b[i] / a[1]); add(W, (b[i] - a[0] * W) / a[1]); } if (a[0]) { add(b[i] / a[0], 0); add((b[i] - a[1] * H) / a[0], H); }
      if (P2.length < 2) return; const [p, q] = P2, mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      svg += `<line class="xm-line s${i % 2}" x1="${L.f1(X(p[0]))}" y1="${L.f1(Y(p[1]))}" x2="${L.f1(X(q[0]))}" y2="${L.f1(Y(q[1]))}"/><text class="xm-lab" x="${L.f1(X(mx) + 6)}" y="${L.f1(Y(my) - 6)}">(${i + 1})</text>`; });
    [0, .25, .5, .75, 1].forEach(f => { svg += `<text class="xm-lab" x="${L.f1(X(W * f))}" y="${36 + S}" text-anchor="middle">${N(W * f, 0)}</text><text class="xm-lab" x="28" y="${L.f1(Y(H * f) + 4)}" text-anchor="end">${N(H * f, 0)}</text>`; });
    const fig = `<svg class="xm-svg plot" viewBox="0 0 ${S + 50} ${S + 44}" width="${S + 50}" style="max-width:100%;height:auto;overflow:hidden">${svg}</svg>`;
    const bindI = A.map((a, i) => Math.abs(a[0] * s.x[0] + a[1] * s.x[1] - b[i]) < 1e-7 ? i : -1).filter(i => i >= 0);
    return { title: 'Solve an LP graphically', figure: fig, prompt: `${max ? 'max' : 'min'} z = ${lin(c, ['x₁', 'x₂'])}<br>${A.map((a, i) => `(${i + 1}) ${lin(a, ['x₁', 'x₂'])} ${REL[rel[i]]} ${b[i]}`).join('<br>')}<br>x₁, x₂ ≥ 0. The shaded area is the feasible region (within the plotted window).`,
      parts: [num('(a)', 'Optimal x₁?', s.x[0], 1, { tol: .01, rtol: 0 }), num('(b)', 'Optimal x₂?', s.x[1], 1, { tol: .01, rtol: 0 }), num('(c)', 'Optimal objective value?', s.z, 1, { tol: .01, rtol: 0 }),
        { type: 'mcq', label: '(d)', prompt: 'Which constraints are binding at the optimum? (select all)', options: ['(1)', '(2)', '(3)', 'only non-negativity'], answer: bindI.length ? bindI : [3], points: 1 },
        mc('(e)', 'Why is it enough to check the extreme points?', 'An LP optimum (if one exists) is always attained at an extreme point of the feasible region', ['Because the objective is non-linear', 'Because the feasible region is always a triangle', 'Because interior points are infeasible'], 1, 'Lecture 1: at least one extreme point is optimal.')],
      solution: [`Extreme points: ${V.filter(p => p[0] < 39.9 && p[1] < 39.9).map(p => `(${N(p[0], 2)}, ${N(p[1], 2)}) → z = ${N(c[0] * p[0] + c[1] * p[1], 2)}`).join('; ')}.`, `Optimum (${N(s.x[0], 2)}, ${N(s.x[1], 2)}), z = ${N(s.z, 2)}.`], traps: ['Moving the objective line in the wrong direction for a min problem.'] };
  }
}

/* ======================= transportation / assignment / transshipment ======================= */
function gTransport(r) {
  const m = r.pick([2, 3]), n = 3, S = L.range(0, m).map(() => r.step(100, 400, 50)), totS = L.sum(S);
  let D = L.range(0, n).map(() => r.step(50, 250, 25)); while (L.sum(D) > totS * .95) D = D.map(d => Math.max(25, d - 25));
  const C = L.range(0, m).map(() => L.range(0, n).map(() => r.int(2, 15)));
  const vs = [], c = [], A = [], b = [], rel = []; L.range(0, m).forEach(i => L.range(0, n).forEach(j => { vs.push(`x<sub>${i + 1}${j + 1}</sub>`); c.push(C[i][j]); }));
  L.range(0, m).forEach(i => { A.push(c.map((_, k) => Math.floor(k / n) === i ? 1 : 0)); b.push(S[i]); rel.push('<='); });
  L.range(0, n).forEach(j => { A.push(c.map((_, k) => k % n === j ? 1 : 0)); b.push(D[j]); rel.push('>='); });
  const s = L.lp(c, A, b, rel, false), src = ['Mill 1', 'Mill 2', 'Mill 3'], dst = ['Warehouse A', 'Warehouse B', 'Warehouse C'];
  const tbl = `<div class="xm-tw"><table class="xm-tab"><tr><th>€/t</th>${dst.map(d => `<th>${d}</th>`).join('')}<th>capacity</th></tr>${C.map((row, i) => `<tr><td>${src[i]}</td>${row.map(v => `<td>${v}</td>`).join('')}<td>${S[i]}</td></tr>`).join('')}<tr><td>demand</td>${D.map(d => `<td>${d}</td>`).join('')}<td></td></tr></table></div>`;
  return { title: 'Transportation problem', prompt: `A pulp company ships cardboard from ${m} mills to 3 warehouses (P&P-style). Unit transport costs, capacities and demands:${tbl}Minimise the total transport cost.`,
    parts: [blocks([{ name: 'Decision variables', options: [opt('x<sub>ij</sub> = tons shipped from mill i to warehouse j', 1), opt('x<sub>i</sub> = total tons produced at mill i only', 0), opt('x<sub>ij</sub> = 1 if mill i serves warehouse j, else 0', 0)] },
      { name: 'Objective', options: [opt('min Σ<sub>i</sub>Σ<sub>j</sub> c<sub>ij</sub> x<sub>ij</sub>', 1), opt('max Σ<sub>i</sub>Σ<sub>j</sub> c<sub>ij</sub> x<sub>ij</sub>', 0), opt('min Σ<sub>j</sub> c<sub>1j</sub> x<sub>1j</sub>', 0)] },
      { name: 'Constraints', options: r.shuffle([opt('Σ<sub>j</sub> x<sub>ij</sub> ≤ s<sub>i</sub> for every mill i (capacity)', 1), opt('Σ<sub>i</sub> x<sub>ij</sub> ≥ d<sub>j</sub> (or = d<sub>j</sub>) for every warehouse j (demand)', 1), opt('Σ<sub>j</sub> x<sub>ij</sub> ≥ s<sub>i</sub> for every mill i', 0), opt('Σ<sub>i</sub> x<sub>ij</sub> ≤ d<sub>j</sub> − 1 for every warehouse j', 0)]) },
      { name: 'Variable types', options: [opt('x<sub>ij</sub> ≥ 0', 1), opt('x<sub>ij</sub> binary', 0)] }], 4),
      num('', 'How many decision variables does the model have?', m * n, 1, { tol: 0, rtol: 0 }), num('', 'How many constraints (excluding non-negativity)?', m + n, 1, { tol: 0, rtol: 0 }),
      num('', 'Minimum total cost (€)?', s.z, 2, { tol: .5, rtol: 0 })],
    solution: [`Variables ${m}×${n} = ${m * n}; ${m} supply + ${n} demand constraints.`, `Optimal shipments: ${vs.map((v, k) => s.x[k] > 1e-9 ? `${v} = ${N(s.x[k], 1)}` : null).filter(Boolean).join(', ')}; cost ${N(s.z, 1)} €.`, 'Network view: arc = variable, node = constraint.'],
    traps: ['Supply constraints as ≥ (forces mills to ship everything).', 'Forgetting a demand constraint.'] };
}
function gAssign(r) {
  const people = r.pick([['Carl', 'Chris', 'David', 'Tony'], ['Aino', 'Eero', 'Ilona', 'Oskari']]), tasks = r.pick([['backstroke', 'breaststroke', 'butterfly', 'freestyle'], ['task A', 'task B', 'task C', 'task D']]), n = r.pick([3, 4]);
  const T = L.range(0, n).map(() => L.range(0, n).map(() => L.round(r.int(250, 450) / 10, 1))); let best = Infinity, bp = null;
  (function perm(a, k) { if (k === n) { const v = L.sum(a.map((j, i) => T[i][j])); if (v < best - 1e-9) { best = v; bp = a.slice(); } return; } for (let i = k; i < n; i++) { [a[k], a[i]] = [a[i], a[k]]; perm(a, k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(L.range(0, n), 0);
  return { title: 'Assignment problem', prompt: `Assign ${n} ${tasks[0] === 'backstroke' ? 'swimmers to the strokes of a medley relay' : 'people to tasks'} (one each) to minimise the total time. Times:<div class="xm-tw"><table class="xm-tab"><tr><th></th>${tasks.slice(0, n).map(t => `<th>${t}</th>`).join('')}</tr>${T.map((row, i) => `<tr><td>${people[i]}</td>${row.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</table></div>`,
    parts: [blocks([{ name: 'Decision variables', options: [opt('x<sub>ij</sub> = 1 if person i does task j, 0 otherwise', 1), opt('x<sub>i</sub> = task number given to person i', 0)] },
      { name: 'Constraints', options: r.shuffle([opt('Σ<sub>j</sub> x<sub>ij</sub> = 1 (≤ 1 if there are more people) for each person i', 1), opt('Σ<sub>i</sub> x<sub>ij</sub> = 1 for each task j', 1), opt('Σ<sub>i</sub>Σ<sub>j</sub> x<sub>ij</sub> ≥ 1', 0), opt('x<sub>ij</sub> ≤ t<sub>ij</sub>', 0)]) },
      { name: 'Variable types', options: [opt('x<sub>ij</sub> ≥ 0 suffices (the LP gives 0/1 solutions for assignment problems)', 1), opt('x<sub>ij</sub> must be continuous between 0 and 100', 0)] }], 3),
      num('', 'Minimum total time?', best, 2, { tol: .05, rtol: 0 }),
      { type: 'table', label: '', prompt: 'Who does which task? (write the task name)', points: 2, cols: ['task'], rows: L.range(0, n).map(i => ({ label: people[i], cells: [{ a: tasks[bp[i]], num: false, w: 8 }] })) }],
    solution: [`Optimal: ${L.range(0, n).map(i => `${people[i]} → ${tasks[bp[i]]}`).join(', ')}; total ${N(best, 1)}.`, 'Assignment = transportation problem with all supplies and demands 1; LP solutions are integral (total unimodularity).'], traps: ['Greedy choice (each person their fastest) is not optimal in general.'] };
}
function gTransship(r) {
  const p = [r.step(400, 700, 50), r.step(300, 600, 50)], d = [r.step(150, 300, 25), r.step(150, 300, 25), r.step(100, 250, 25)];
  const cPW = [[r.int(2, 6), r.int(3, 7)], [r.int(3, 7), r.int(2, 6)]], cWD = [[r.int(2, 8), r.int(3, 9), r.int(3, 9)], [r.int(3, 9), r.int(2, 8), r.int(2, 8)]];
  const c = [].concat(cPW[0], cPW[1], cWD[0], cWD[1]), A = [], b = [], rel = [];
  A.push([1, 1, 0, 0, 0, 0, 0, 0, 0, 0]); b.push(p[0]); rel.push('<='); A.push([0, 0, 1, 1, 0, 0, 0, 0, 0, 0]); b.push(p[1]); rel.push('<=');
  A.push([1, 0, 1, 0, -1, -1, -1, 0, 0, 0]); b.push(0); rel.push('='); A.push([0, 1, 0, 1, 0, 0, 0, -1, -1, -1]); b.push(0); rel.push('=');
  [0, 1, 2].forEach(j => { const row = new Array(10).fill(0); row[4 + j] = 1; row[7 + j] = 1; A.push(row); b.push(d[j]); rel.push('>='); });
  const s = L.lp(c, A, b, rel, false);
  return { title: 'Transshipment problem', prompt: `Two plants (P1 capacity ${p[0]}, P2 ${p[1]}) ship through two warehouses (W1, W2) to three customers (demands ${d.join(', ')}). Unit costs: P→W ${cPW.map((row, i) => row.map((v, j) => `P${i + 1}→W${j + 1} ${v}`).join(', ')).join(', ')}; W→C ${cWD.map((row, i) => row.map((v, j) => `W${i + 1}→C${j + 1} ${v}`).join(', ')).join(', ')}. (Ryan Electronics-style.)`,
    parts: [mc('(a)', 'What is the constraint for warehouse W1?', 'x<sub>P1,W1</sub> + x<sub>P2,W1</sub> − x<sub>W1,C1</sub> − x<sub>W1,C2</sub> − x<sub>W1,C3</sub> = 0 (flow in = flow out)', ['x<sub>P1,W1</sub> + x<sub>P2,W1</sub> ≤ capacity of W1', 'x<sub>W1,C1</sub> + x<sub>W1,C2</sub> + x<sub>W1,C3</sub> ≥ demand', 'x<sub>P1,W1</sub> = x<sub>W1,C1</sub>'], 1.5, 'Transshipment nodes: flow balance.'),
      num('(b)', 'Number of decision variables (arcs)?', 10, 1, { tol: 0, rtol: 0 }), num('(c)', 'Number of constraints (nodes)?', 7, 1, { tol: 0, rtol: 0 }), num('(d)', 'Minimum total cost?', s.z, 2, { tol: .5, rtol: 0 })],
    solution: [`Optimal cost ${N(s.z, 1)}.`, 'Arc = variable (10), node = constraint (2 supply ≤, 2 balance =, 3 demand ≥).'], traps: ['Forgetting that warehouses must ship out what they receive.'] };
}

/* ======================= MILP ======================= */
function gLogic(r) {
  const P = 'ABCDE'.split(''), k = r.int(2, 3), [a, b2, c3] = r.sample(P, 3);
  const items = [
    [`At most ${k} of the five projects A–E can be selected.`, `x<sub>A</sub> + x<sub>B</sub> + x<sub>C</sub> + x<sub>D</sub> + x<sub>E</sub> ≤ ${k}`, [`x<sub>A</sub> + … + x<sub>E</sub> ≥ ${k}`, `x<sub>A</sub> + … + x<sub>E</sub> = ${k}`, `x<sub>A</sub> ≤ ${k}`]],
    [`Exactly one of projects ${a} and ${b2} must be selected.`, `x<sub>${a}</sub> + x<sub>${b2}</sub> = 1`, [`x<sub>${a}</sub> + x<sub>${b2}</sub> ≤ 1`, `x<sub>${a}</sub> − x<sub>${b2}</sub> = 1`, `x<sub>${a}</sub> + x<sub>${b2}</sub> ≥ 1`]],
    [`Projects ${a} and ${b2} are mutually exclusive.`, `x<sub>${a}</sub> + x<sub>${b2}</sub> ≤ 1`, [`x<sub>${a}</sub> + x<sub>${b2}</sub> = 1`, `x<sub>${a}</sub> ≤ x<sub>${b2}</sub>`, `x<sub>${a}</sub> + x<sub>${b2}</sub> ≥ 1`]],
    [`Project ${a} can be selected only if project ${b2} is selected (conditional).`, `x<sub>${a}</sub> ≤ x<sub>${b2}</sub>`, [`x<sub>${b2}</sub> ≤ x<sub>${a}</sub>`, `x<sub>${a}</sub> + x<sub>${b2}</sub> ≤ 1`, `x<sub>${a}</sub> = x<sub>${b2}</sub>`]],
    [`Project ${a} can be selected only if both ${b2} and ${c3} are selected.`, `x<sub>${a}</sub> ≤ x<sub>${b2}</sub> and x<sub>${a}</sub> ≤ x<sub>${c3}</sub> (or 2x<sub>${a}</sub> ≤ x<sub>${b2}</sub> + x<sub>${c3}</sub>)`, [`x<sub>${a}</sub> ≤ x<sub>${b2}</sub> + x<sub>${c3}</sub>`, `x<sub>${b2}</sub> + x<sub>${c3}</sub> ≤ x<sub>${a}</sub>`, `x<sub>${a}</sub> + x<sub>${b2}</sub> + x<sub>${c3}</sub> = 3`]],
    [`Projects ${a} and ${b2} must be selected together or not at all (corequisite).`, `x<sub>${a}</sub> = x<sub>${b2}</sub>`, [`x<sub>${a}</sub> ≤ x<sub>${b2}</sub>`, `x<sub>${a}</sub> + x<sub>${b2}</sub> ≤ 1`, `x<sub>${a}</sub> + x<sub>${b2}</sub> ≥ 1`]],
    ['Fixed charge: product 1 (amount x<sub>1</sub>, at most 500 units) can only be produced if the machine set-up y<sub>1</sub> is paid.', 'x<sub>1</sub> ≤ 500 y<sub>1</sub>, y<sub>1</sub> binary (and −f·y<sub>1</sub> in the objective)', ['x<sub>1</sub> ≥ 500 y<sub>1</sub>', 'y<sub>1</sub> ≤ 500 x<sub>1</sub>', 'x<sub>1</sub> · y<sub>1</sub> ≤ 500']],
    ['Minimum batch: if product 2 is made at all, at least 100 units must be made (y<sub>2</sub> binary, x<sub>2</sub> ≤ 800).', '100 y<sub>2</sub> ≤ x<sub>2</sub> ≤ 800 y<sub>2</sub>', ['x<sub>2</sub> ≥ 100', 'x<sub>2</sub> ≤ 100 y<sub>2</sub>', 'x<sub>2</sub> ≥ 800 y<sub>2</sub>']]];
  return { title: 'Binary (0-1) constraints: translate the logic', prompt: 'x<sub>j</sub> = 1 if project j is selected, 0 otherwise. Pick the correct constraint for each rule.', parts: r.sample(items, 4).map(([q, ans, w], i) => mc(`(${i + 1})`, q, ans, w, 1, 'Check: the allowed combinations stay feasible, the forbidden ones become infeasible (lecture 4, slide 25).')),
    solution: ['At most k: Σx ≤ k · mutually exclusive: x<sub>i</sub> + x<sub>j</sub> ≤ 1 · conditional: x<sub>i</sub> ≤ x<sub>j</sub> · corequisite: x<sub>i</sub> = x<sub>j</sub> · fixed charge: x ≤ M·y.'], traps: ['Conditional written the wrong way round.'] };
}
function gCapBudget(r) {
  const n = 5, ids = 'ABCDE'.split(''), npv = ids.map(() => r.step(20, 200, 5)), c1 = ids.map(() => r.step(5, 40, 5)), c2 = ids.map(() => r.step(5, 40, 5)), B1 = Math.round(L.sum(c1) * .5 / 5) * 5, B2 = Math.round(L.sum(c2) * .55 / 5) * 5;
  const [a, b2] = r.sample(ids, 2), [x1, x2] = r.sample(ids.filter(z => z !== a && z !== b2), 2); let best = -1, bs = null;
  for (let m = 0; m < 32; m++) { const x = ids.map((_, i) => m >> i & 1), I = id => x[ids.indexOf(id)];
    if (L.sum(x.map((v, i) => v * c1[i])) > B1 || L.sum(x.map((v, i) => v * c2[i])) > B2 || I(a) > I(b2) || I(x1) + I(x2) > 1) continue;
    const v = L.sum(x.map((v2, i) => v2 * npv[i])); if (v > best) { best = v; bs = x; } }
  return { title: 'Capital budgeting (binary LP)', prompt: `Choose projects to maximise total NPV (k€).<div class="xm-tw"><table class="xm-tab"><tr><th></th>${ids.map(i => `<th>${i}</th>`).join('')}<th>budget</th></tr><tr><td>NPV</td>${npv.map(v => `<td>${v}</td>`).join('')}<td></td></tr><tr><td>cost year 1</td>${c1.map(v => `<td>${v}</td>`).join('')}<td>${B1}</td></tr><tr><td>cost year 2</td>${c2.map(v => `<td>${v}</td>`).join('')}<td>${B2}</td></tr></table></div>Also: project ${a} can only be selected if ${b2} is selected, and ${x1} and ${x2} are mutually exclusive.`,
    parts: [blocks([{ name: 'Decision variables', options: [opt('x<sub>j</sub> ∈ {0, 1}: 1 if project j is selected', 1), opt('x<sub>j</sub> ≥ 0 continuous: share of project j', 0)] },
      { name: 'Objective', options: [opt(`max ${ids.map((id, i) => `${npv[i]}x<sub>${id}</sub>`).join(' + ')}`, 1), opt(`min ${ids.map((id, i) => `${c1[i]}x<sub>${id}</sub>`).join(' + ')}`, 0)] },
      { name: 'Constraints', options: r.shuffle([opt(`${ids.map((id, i) => `${c1[i]}x<sub>${id}</sub>`).join(' + ')} ≤ ${B1}`, 1), opt(`${ids.map((id, i) => `${c2[i]}x<sub>${id}</sub>`).join(' + ')} ≤ ${B2}`, 1), opt(`x<sub>${a}</sub> ≤ x<sub>${b2}</sub>`, 1), opt(`x<sub>${x1}</sub> + x<sub>${x2}</sub> ≤ 1`, 1), opt(`x<sub>${b2}</sub> ≤ x<sub>${a}</sub>`, 0), opt(`x<sub>${x1}</sub> + x<sub>${x2}</sub> = 1`, 0)]) }], 4),
      num('', 'Maximum total NPV (k€)?', best, 2, { tol: 0, rtol: 0 }), { type: 'text', label: '', prompt: 'Which projects are selected? (letters, e.g. A C E)', answer: ids.filter((_, i) => bs[i]).join(' '), points: 1, check: s => L.normSet(s.toUpperCase().replace(/[^A-E]/g, ' ')) === L.normSet(ids.filter((_, i) => bs[i]).join(' ')) }],
    solution: [`Optimal portfolio: ${ids.filter((_, i) => bs[i]).join(', ')} with NPV ${best}.`, 'Solved by enumerating all 2⁵ = 32 portfolios (Solver uses branch-and-bound).'], traps: ['Solving the LP relaxation and rounding: can be infeasible or suboptimal.'] };
}
function gFixedCharge(r) {
  for (let t = 0; t < 100; t++) {
    const n = 3, p = L.range(0, n).map(() => r.int(4, 12)), f = L.range(0, n).map(() => r.step(50, 300, 25)), A = [L.range(0, n).map(() => r.int(1, 4)), L.range(0, n).map(() => r.int(1, 4))], b = [r.step(80, 200, 10), r.step(80, 200, 10)];
    const M = L.range(0, n).map(j => Math.floor(Math.min(...A.map((row, i) => b[i] / row[j]))));
    let best = -Infinity, by = null, bx = null; for (let m = 0; m < 8; m++) { const y = [0, 1, 2].map(j => m >> j & 1);
      const s = L.lp(p, A.concat(y.map((v, j) => [0, 1, 2].map(k => k === j ? 1 : 0))), b.concat(y.map((v, j) => v ? M[j] : 0)), ['<=', '<=', '<=', '<=', '<='], true);
      if (!s) continue; const z = s.z - L.sum(y.map((v, j) => v * f[j])); if (z > best + 1e-9) { best = z; by = y; bx = s.x; } }
    if (best <= 0 || L.sum(by) === 3) continue;
    return { title: 'Fixed-charge (set-up cost) problem', prompt: `Three products. Profit per unit ${p.join(', ')} €; one-off set-up cost if a product is made at all ${f.join(', ')} €. Resources: ${A.map((row, i) => `${lin(row, ['x₁', 'x₂', 'x₃'])} ≤ ${b[i]}`).join('; ')}.`,
      parts: [blocks([{ name: 'Variables', options: [opt('x<sub>j</sub> ≥ 0 amount of product j', 1), opt('y<sub>j</sub> ∈ {0,1}: 1 if product j is set up', 1), opt('y<sub>j</sub> ≥ 0 continuous', 0)] },
        { name: 'Objective', options: [opt(`max ${p.map((v, j) => `${v}x<sub>${j + 1}</sub>`).join(' + ')} − ${f.map((v, j) => `${v}y<sub>${j + 1}</sub>`).join(' − ')}`, 1), opt(`max ${p.map((v, j) => `${v}x<sub>${j + 1}</sub>`).join(' + ')}`, 0)] },
        { name: 'Linking constraints', options: [opt(`x<sub>j</sub> ≤ M<sub>j</sub> y<sub>j</sub> with M<sub>j</sub> big enough (e.g. ${M.join(', ')})`, 1), opt('x<sub>j</sub> ≥ M<sub>j</sub> y<sub>j</sub>', 0), opt('x<sub>j</sub> · y<sub>j</sub> ≥ 0', 0)] }], 4),
        num('', 'Maximum profit after set-up costs (€)?', best, 2, { tol: .5, rtol: 0 }), { type: 'text', label: '', prompt: 'Which products are made? (e.g. 1 3)', answer: [1, 2, 3].filter((_, j) => by[j]).join(' '), points: 1, check: s => L.normSet(s.replace(/[^1-3]/g, ' ')) === [1, 2, 3].filter((_, j) => by[j]).join(' ') }],
      solution: [`Best set-up choice y = (${by.join(', ')}), x = (${bx.map(v => N(v, 2)).join(', ')}), profit ${N(best, 2)} €.`, 'M<sub>j</sub> = the most product j could ever use (resource limit / usage): a tighter M speeds up branch-and-bound.'], traps: ['Too small M cuts off feasible solutions; x ≥ M·y forces production instead of allowing it.'] };
  }
}
function gRelax(r) {
  for (let t = 0; t < 200; t++) {
    const c = [r.int(2, 9), r.int(2, 9)], A = [[r.int(1, 6), r.int(1, 6)], [r.int(1, 6), r.int(1, 6)]], b = [r.int(10, 40), r.int(10, 40)];
    const s = L.lp(c, A, b, ['<=', '<='], true); if (!s || s.x.every(v => Math.abs(v - Math.round(v)) < 1e-6)) continue;
    let best = -1, bx; for (let x1 = 0; x1 <= 40; x1++) for (let x2 = 0; x2 <= 40; x2++) if (A[0][0] * x1 + A[0][1] * x2 <= b[0] && A[1][0] * x1 + A[1][1] * x2 <= b[1]) { const z = c[0] * x1 + c[1] * x2; if (z > best) { best = z; bx = [x1, x2]; } }
    const rd = s.x.map(Math.floor), rdz = c[0] * rd[0] + c[1] * rd[1];
    return { title: 'LP relaxation vs integer optimum', prompt: `max ${lin(c, ['x₁', 'x₂'])} s.t. ${A.map((a, i) => `${lin(a, ['x₁', 'x₂'])} ≤ ${b[i]}`).join(', ')}, x ≥ 0 and integer.`,
      parts: [num('(a)', 'Optimal value of the LP relaxation?', s.z, 1, { tol: .01, rtol: 0 }), num('(b)', 'Optimal value of the integer problem?', best, 2, { tol: 0, rtol: 0 }), num('(c)', 'Value of rounding the LP solution down?', rdz, 1, { tol: 0, rtol: 0 }),
        mc('(d)', 'For a maximisation problem, the LP relaxation value is always…', 'an upper bound on the integer optimum', ['a lower bound on the integer optimum', 'equal to the integer optimum', 'infeasible'], 1, 'Removing constraints can only enlarge the feasible region.')],
      solution: [`LP relaxation (${N(s.x[0], 2)}, ${N(s.x[1], 2)}) → ${N(s.z, 2)}. Integer optimum (${bx.join(', ')}) → ${best}. Rounded down (${rd.join(', ')}) → ${rdz}.`], traps: ['Assuming rounding gives the integer optimum.'] };
  }
}

/* ======================= dual ======================= */
function gDual(r) {
  let P; while (!(P = randLP(r, r.pick([2, 3]), r.pick([2, 3]))));
  const { c, A, b, s } = P, n = c.length, m = b.length, xs = L.range(0, n).map(i => `x<sub>${i + 1}</sub>`), ys = L.range(0, m).map(i => `y<sub>${i + 1}</sub>`), At = L.range(0, n).map(j => A.map(row => row[j]));
  const dual = (rows, sense, rel, rhs) => `${sense} ${lin(b, ys)}<br>${rows.map((row, j) => `${lin(row, ys)} ${rel} ${rhs[j]}`).join('<br>')}<br>y ≥ 0`;
  return { title: 'Write the dual', prompt: `Primal: max ${lin(c, xs)}<br>${A.map((row, i) => `${lin(row, xs)} ≤ ${b[i]}`).join('<br>')}<br>x ≥ 0`,
    parts: [mc('(a)', 'Which LP is the dual?', dual(At, 'min', '≥', c), [dual(At, 'max', '≤', c), dual(At, 'min', '≤', c), m === n ? dual(A, 'min', '≥', c) : '', `min ${lin(c, xs)}<br>${A.map((row, i) => `${lin(row, xs)} ≥ ${b[i]}`).join('<br>')}`].filter((x, i, arr) => x && x !== dual(At, 'min', '≥', c) && arr.indexOf(x) === i).slice(0, 3), 2, 'max cᵀx, Ax ≤ b, x ≥ 0 ⇔ min bᵀy, Aᵀy ≥ c, y ≥ 0: one dual variable per primal constraint, one dual constraint per primal variable.', { wide: true }),
      num('(b)', 'Optimal value of the dual?', s.z, 1, { tol: .01, rtol: 0, why: 'Strong duality: equal to the primal optimum.' }),
      { type: 'table', label: '(c)', prompt: 'Optimal dual values y (= the primal shadow prices).', points: 2, cols: ys, rows: [{ label: 'y', cells: s.cons.map(k => ({ a: k.sp, num: true, tol: .01, rtol: 0 })) }] },
      mc('(d)', 'Economic meaning of y<sub>i</sub>?', 'The value of one more unit of resource i (what you would pay at most for it)', ['The amount of resource i used', 'The profit of product i', 'The cost of producing one unit'], 1, 'Dakota example: the entrepreneur buying all resources.')],
    solution: [`Dual optimum ${N(s.z, 2)} with y = (${s.cons.map(k => N(k.sp, 3)).join(', ')}).`], traps: ['Forgetting to transpose A.'] };
}

/* ======================= NLP and MOP ======================= */
function gPortfolio(r) {
  const S = r.pick([4, 5]), ra = L.range(0, S).map(() => L.round(r.int(-50, 180) / 10, 1)), rb = L.range(0, S).map(() => L.round(r.int(-20, 90) / 10, 1)), w = r.pick([.2, .3, .4, .5, .6, .7]);
  const rp = ra.map((v, i) => w * v + (1 - w) * rb[i]), mean = L.mean(rp), vr = L.mean(rp.map(v => (v - mean) * (v - mean)));
  const ma = L.mean(ra), mb = L.mean(rb), va = L.mean(ra.map(v => (v - ma) ** 2)), vb = L.mean(rb.map(v => (v - mb) ** 2)), cov = L.mean(ra.map((v, i) => (v - ma) * (rb[i] - mb)));
  const wmin = Math.min(1, Math.max(0, (vb - cov) / (va + vb - 2 * cov)));
  return { title: 'Markowitz portfolio (scenario-based)', prompt: `Two funds with returns (%) in ${S} equally likely scenarios:<div class="xm-tw"><table class="xm-tab"><tr><th>scenario</th>${ra.map((_, i) => `<th>${i + 1}</th>`).join('')}</tr><tr><td>fund A</td>${ra.map(v => `<td>${v}</td>`).join('')}</tr><tr><td>fund B</td>${rb.map(v => `<td>${v}</td>`).join('')}</tr></table></div>Invest a share <b>${w}</b> in A and ${L.round(1 - w, 2)} in B. Variance = average squared deviation from the mean (1/S, as in the lecture).`,
    parts: [num('(a)', 'Expected portfolio return (%)?', mean, 1, { tol: .01, rtol: 0 }), num('(b)', 'Portfolio variance?', vr, 2, { rtol: .005 }), num('(c)', 'Share in A that minimises the variance (0…1)?', wmin, 2, { tol: .005, rtol: 0, dp: 3 }),
      mc('(d)', 'The Markowitz model "min variance s.t. expected return ≥ R" is…', 'a convex NLP (quadratic objective, linear constraints): any local optimum is global', ['an LP', 'a non-convex problem with many local optima', 'an integer problem'], 1, 'Variance is a convex quadratic function of the weights.')],
    solution: [`Portfolio returns: ${rp.map(v => N(v, 2)).join(', ')}; mean ${N(mean, 3)}; variance ${N(vr, 3)}.`, `Min-variance share in A: (Var B − Cov)/(Var A + Var B − 2Cov) = ${N(wmin, 3)} (clipped to 0…1).`], traps: ['Using the sample variance (1/(S−1)) when the lecture model uses 1/S.'] };
}
function gPareto(r) {
  for (let t = 0; t < 100; t++) {
    const pts = L.range(0, 7).map(() => [r.int(2, 20), r.int(2, 20)]); const lab = 'ABCDEFG'.split('');
    if (new Set(pts.map(p => p.join())).size < 7) continue;
    const eff = pts.map((p, i) => !pts.some((q, j) => j !== i && q[0] >= p[0] && q[1] >= p[1] && (q[0] > p[0] || q[1] > p[1]))).map((e, i) => e ? i : -1).filter(i => i >= 0);
    if (eff.length < 3 || eff.length > 5) continue; const w = r.pick([.2, .3, .5, .7, .8]); const ws = pts.map(p => w * p[0] + (1 - w) * p[1]); const best = ws.indexOf(Math.max(...ws)); if (ws.filter(v => Math.abs(v - ws[best]) < 1e-9).length > 1) continue;
    const fig = L.drawPlot([{ pts: pts.map(p => p), stem: false }], { w: 300, h: 240, xmin: 0, xmax: 22, ymin: 0, ymax: 22, xlabel: 'f₁ (max)', ylabel: 'f₂ (max)' }).replace(/<polyline[^>]*\/>/, '') ;
    const dots = pts.map((p, i) => `<circle cx="${L.f1(38 + p[0] / 22 * (300 - 38 - 14))}" cy="${L.f1(240 - 26 - p[1] / 22 * (240 - 46))}" r="5" class="xm-dot"/><text class="xm-lab" x="${L.f1(38 + p[0] / 22 * 248 + 7)}" y="${L.f1(240 - 26 - p[1] / 22 * 194 - 6)}">${lab[i]}</text>`).join('');
    return { title: 'Efficient (Pareto-optimal) solutions', figure: fig.replace('</svg>', dots + '</svg>'), prompt: `Seven feasible solutions with both objectives maximised: ${pts.map((p, i) => `${lab[i]} (${p[0]}, ${p[1]})`).join(', ')}.`,
      parts: [{ type: 'mcq', label: '(a)', prompt: 'Which solutions are efficient? (select all)', options: lab, answer: eff, points: 2, grid: true, why: 'Efficient: no other solution is at least as good in both objectives and strictly better in one.' },
        mc('(b)', `Weighted sum with w₁ = ${w}, w₂ = ${L.round(1 - w, 2)}: which solution is chosen?`, lab[best], lab.filter((_, i) => i !== best).slice(0, 3), 1, `Scores: ${ws.map((v, i) => lab[i] + ' ' + N(v, 2)).join(', ')}.`),
        mc('(c)', 'A known drawback of the weighted-sum method is…', 'it cannot find efficient solutions that lie in non-convex "dents" of the efficient frontier', ['it may return a dominated solution even with positive weights', 'it only works for LPs', 'it needs the objectives to have equal units'], 1, 'Every weighted-sum solution (w > 0) is efficient, but not every efficient solution is found.')],
      solution: [`Efficient: ${eff.map(i => lab[i]).join(', ')}.`], traps: ['Calling a solution efficient because it is best in one objective only if there are ties.'] };
  }
}

/* ======================= theory MCQ ======================= */
const Q = (q, a, w, why) => [q, a, w, why];
const TH = {
  lp: [Q('A constraint is redundant if…', 'removing it does not change the feasible region', ['it is binding at the optimum', 'its shadow price is positive', 'it contains only one variable'], ''),
    Q('An LP is unbounded when…', 'the objective can be improved without limit within the feasible region', ['the feasible region is empty', 'there are alternative optima', 'a constraint is redundant'], ''),
    Q('Alternative optimal solutions occur when…', 'the objective line is parallel to a binding constraint edge', ['the region is empty', 'all constraints are redundant', 'the problem is non-linear'], ''),
    Q('Which is NOT a linear model?', 'max 3x₁x₂ subject to x₁ + x₂ ≤ 10', ['max 3x₁ + 2x₂ s.t. x₁ ≤ 4', 'min 2x₁ subject to x₁ − x₂ ≥ −5', 'max x₁/2 + x₂/3 s.t. x₁ + x₂ ≤ 7'], 'Products of variables are non-linear.'),
    Q('The optimal solution does NOT change if…', 'the objective is multiplied by a positive constant', ['a constraint\'s RHS changes', 'the objective is multiplied by −1', 'a binding constraint is removed'], 'Lecture 1, slide 33.'),
    Q('A slack variable…', 'measures the unused amount of a ≤ constraint', ['measures the excess over a ≥ constraint', 'is always negative', 'is a decision variable of the dual'], 'The excess over a ≥ constraint is a surplus variable.')],
  sens: [Q('Reduced cost of a variable at value 0 (max problem) tells…', 'how much its objective coefficient must improve before it becomes positive in the optimum', ['how much it costs to produce', 'its shadow price', 'its range of feasibility'], ''),
    Q('Range of optimality is…', 'the range of an objective coefficient for which the optimal solution stays the same', ['the range of RHS values for which the shadow price stays the same', 'the set of feasible solutions', 'the range of the objective value'], 'The RHS version is the range of feasibility.'),
    Q('A non-binding constraint has a shadow price of…', '0', ['1', 'its RHS', 'infinity'], 'More of a resource you already have left over is worth nothing.'),
    Q('"1E+30" in a sensitivity report means…', 'infinity (no limit)', ['an error', 'the variable is binary', 'the constraint is redundant'], ''),
    Q('Sensitivity analysis assumes…', 'only one parameter changes at a time, all others stay fixed', ['all parameters change together', 'the problem is integer', 'the objective is non-linear'], 'Lecture 2, final comments.'),
    Q('Strong duality says…', 'the optimal values of the primal and the dual are equal', ['the dual is always infeasible', 'the dual has the same variables', 'the dual is a maximisation'], '')],
  net: [Q('In a network LP, an arc corresponds to…', 'a decision variable', ['a constraint', 'the objective', 'a parameter'], 'Arc = variable, node = constraint.'),
    Q('In a transshipment problem, a transshipment node has the constraint…', 'flow in − flow out = 0', ['flow in ≤ capacity only', 'flow out ≥ demand', 'no constraint'], ''),
    Q('Why do assignment problems not need integer constraints in Solver?', 'Their LP solutions are automatically integral (0/1)', ['Solver ignores integers anyway', 'Because costs are integers', 'They do need them'], 'Total unimodularity of the network matrix.'),
    Q('Total supply exceeds total demand. Supply constraints should be…', '≤ (mills need not ship everything)', ['=', '≥', 'removed'], '')],
  milp: [Q('The LP relaxation of a MILP is obtained by…', 'removing the integrality constraints', ['removing all constraints', 'rounding the solution', 'fixing integers to 0'], ''),
    Q('Branch-and-bound…', 'solves LP relaxations and branches on fractional variables (x ≤ ⌊v⌋ or x ≥ ⌈v⌉)', ['rounds every variable', 'enumerates all LP vertices', 'uses gradient search'], ''),
    Q('Why is MILP harder than LP?', 'The number of branches can grow exponentially', ['LP has no constraints', 'Solver cannot handle integers', 'MILP is always non-convex in the objective'], ''),
    Q('Rounding an LP solution to integers…', 'can give an infeasible or a sub-optimal solution', ['always gives the optimum', 'always gives a feasible solution', 'is what Solver does'], 'Lecture 4, cautionary note.')],
  nlp: [Q('In an NLP, a local optimum is guaranteed to be global when…', 'maximising a concave function (or minimising a convex one) over a convex feasible region', ['the objective is linear', 'there are no constraints', 'Solver says so'], ''),
    Q('A set is convex if…', 'the line segment between any two points of the set lies in the set', ['it is bounded', 'it contains the origin', 'it is a polygon'], ''),
    Q('Excel Solver\'s GRG Nonlinear algorithm…', 'is a gradient search that may stop at a local optimum; try several starting points', ['always finds the global optimum', 'is the simplex method', 'only works for integers'], ''),
    Q('A feasible region {x : g(x) ≤ b} is convex when…', 'g is convex', ['g is concave', 'g is linear only', 'b ≥ 0'], ''),
    Q('Where can the optimum of an NLP lie?', 'anywhere: on an edge, at a corner or in the interior', ['only at an extreme point', 'only at the origin', 'only on a constraint'], 'Unlike LP.')],
  mop: [Q('A solution is efficient (Pareto-optimal) if…', 'no other feasible solution is at least as good in all objectives and strictly better in one', ['it maximises the first objective', 'it is the weighted-sum optimum for w = 0.5', 'it is feasible'], ''),
    Q('Weighted-sum solutions with strictly positive weights are…', 'always efficient', ['sometimes dominated', 'always infeasible', 'the whole efficient set'], ''),
    Q('Goal programming…', 'minimises deviations from goals set for each objective (in priority order)', ['maximises the sum of objectives', 'removes all but one objective', 'is the same as LP relaxation'], '')]
};
const TH_NAMES = { lp: 'LP basics', sens: 'Sensitivity & duality', net: 'Network models', milp: 'MILP', nlp: 'NLP & convexity', mop: 'Multi-objective' };
const thSet = (keys, n) => r => { const pool = [].concat.apply([], keys.map(k => TH[k])); return { title: 'Theory: ' + keys.map(k => TH_NAMES[k]).join(', '), prompt: '', parts: r.sample(pool, Math.min(n, pool.length)).map(([q, a, w, why], i) => mc(`(${i + 1})`, q, a, w, 1, why)), solution: [], traps: [] }; };

const SRC = 'Course material: ';
XM.register({
  id: 'ba1', code: 'ISM-C1004', name: 'Business Analytics 1', short: 'BA1', accent: '#A198FF',
  bosses: ['The Simplex', 'Shadow Price', 'The Transporter', 'Branch & Bound', 'The Pareto Front', 'The Examiner'],
  exam: { date: '2027-02-01T09:00:00', tentative: true, where: 'retake, Mon 1.2.2027 (time and room: check Sisu)', format: 'Modelling problems (formulate and solve, like the spreadsheet assignments) + theory & terminology questions. Pass ≥ 50 % of the exam.',
    rules: 'No AI. Formulate: indices → parameters → decision variables → objective → constraints → variable types.',
    notes: '<p><b>Retake Mon 1.2.2027 — time: check Sisu</b> (the S&S exam is the same day). The exam has <b>modelling problems</b> and <b>theory</b>. Key skills here: the <b>formulation builder</b> (pick correct variables, objective, constraints) and <b>reading Excel sensitivity reports</b> (all numbers computed by an LP solver). Built from lecture examples only; none of it is based on Assignment 3.</p><p>Grade: &gt;50 % → 1, &gt;60 % → 2, &gt;70 % → 3, &gt;80 % → 4, &gt;90 % → 5 (final = 30 % assignments + 70 % exam).</p>' },
  grades: [[90, 5], [80, 4], [70, 3], [60, 2], [50, 1]],
  gradeNote: 'Exam-only estimate; the final grade also uses 30 % assignments.',
  topics: { form: { name: 'LP formulation', slot: 'modelling', weight: 1 }, sens: { name: 'Sensitivity report & duality', slot: 'modelling / theory', weight: 1 }, graph: { name: 'Graphical LP', slot: 'modelling', weight: .5 },
    net: { name: 'Transportation / transshipment / assignment', slot: 'modelling', weight: .9 }, milp: { name: 'MILP & binary logic', slot: 'modelling', weight: .9 }, nlp: { name: 'NLP & Markowitz', slot: 'modelling / theory', weight: .6 }, mop: { name: 'Multi-objective', slot: 'theory', weight: .5 }, theory: { name: 'Theory & terminology', slot: 'theory', weight: .9 } },
  templates: {
    f_mix: { topic: 'form', title: 'Formulate and solve a product-mix LP', kinds: 'build the model + numeric + table', source: SRC + 'L1 (Iron Works), L2 (Olympic Bike, Dakota)', weight: 1.3, gen: gFormulateMix },
    s_report: { topic: 'sens', title: 'Read an Excel sensitivity report', kinds: 'identify from report: numeric + multiple choice', source: SRC + 'L2 sensitivity reports', weight: 1.6, gen: gSensitivity },
    s_dual: { topic: 'sens', title: 'Write the dual and read shadow prices', kinds: 'multiple choice + numeric + table', source: SRC + 'L2 (Dakota dual)', gen: gDual },
    g_graph: { topic: 'graph', title: 'Graphical LP solution', kinds: 'figure + numeric + multiple choice', source: SRC + 'L1 graphical method', gen: gGraphical },
    n_trans: { topic: 'net', title: 'Transportation problem', kinds: 'build the model + numeric', source: SRC + 'L3 (P&P, P&T)', weight: 1.2, gen: gTransport },
    n_ship: { topic: 'net', title: 'Transshipment problem', kinds: 'multiple choice + numeric', source: SRC + 'L3 (Ryan Electronics)', gen: gTransship },
    n_assign: { topic: 'net', title: 'Assignment problem', kinds: 'build the model + numeric + table', source: SRC + 'L3 (swim team)', gen: gAssign },
    m_logic: { topic: 'milp', title: 'Binary logic: at most k, conditional, exclusive, fixed charge', kinds: 'multiple choice', source: SRC + 'L4 special 0-1 constraints', weight: 1.3, gen: gLogic },
    m_budget: { topic: 'milp', title: 'Capital budgeting (BLP)', kinds: 'build the model + numeric', source: SRC + 'L4 (Perry Construction)', gen: gCapBudget },
    m_fixed: { topic: 'milp', title: 'Fixed-charge problem with big-M', kinds: 'build the model + numeric', source: SRC + 'L4 fixed cost example', gen: gFixedCharge },
    m_relax: { topic: 'milp', title: 'LP relaxation, rounding and the integer optimum', kinds: 'numeric + multiple choice', source: SRC + 'L4 LP relaxation / B&B', gen: gRelax },
    p_markowitz: { topic: 'nlp', title: 'Scenario-based Markowitz portfolio', kinds: 'numeric + multiple choice', source: SRC + 'L6 (Hauck Financial)', gen: gPortfolio },
    o_pareto: { topic: 'mop', title: 'Efficient solutions and the weighted sum', kinds: 'multiple choice', source: SRC + 'L7', gen: gPareto },
    t_lp: { topic: 'theory', title: 'Theory: LP, sensitivity, duality', kinds: 'multiple choice', source: SRC + 'L1–L2', gen: thSet(['lp', 'sens'], 6) },
    t_net: { topic: 'theory', title: 'Theory: networks and MILP', kinds: 'multiple choice', source: SRC + 'L3–L4', gen: thSet(['net', 'milp'], 6) },
    t_nlp: { topic: 'theory', title: 'Theory: NLP, convexity, MOP', kinds: 'multiple choice', source: SRC + 'L6–L7', gen: thSet(['nlp', 'mop'], 6) },
    t_mix: { topic: 'theory', title: 'Mixed theory block', hidden: true, gen: thSet(Object.keys(TH), 10) },
    t_written: { topic: 'theory', title: 'Explain a concept (written)', kinds: 'written + rubric', source: SRC + 'L2, L4, L6, L7', gen: r => { const W = [
      ['Explain shadow price, reduced cost and range of feasibility, and how they are used.', 'Shadow price: change in optimal objective per unit increase of a constraint\'s RHS, valid within the allowable increase/decrease (range of feasibility). Reduced cost: how much a variable\'s objective coefficient must improve before it enters the solution (or the change in objective per unit forced in). Used to judge whether to buy more of a resource, price a new product, and how robust the plan is.', [[1, 'Shadow price defined'], [1, 'Reduced cost defined'], [1, 'Range of feasibility and validity'], [1, 'Use in decisions']]],
      ['Why does a convex NLP have no "bad" local optima, and what can go wrong otherwise?', 'In a convex problem (convex objective minimised / concave maximised, convex feasible region), any local optimum is global: along the line to any better point the objective would have to improve immediately, contradicting local optimality. In non-convex problems gradient search (GRG) may stop at a local optimum depending on the start: use multistart or evolutionary methods.', [[1.5, 'Conditions for convexity'], [1.5, 'Why local = global'], [1, 'Non-convex: multistart / evolutionary']]],
      ['Explain the weighted-sum method for multi-objective problems and its main drawback.', 'Combine objectives into max Σ wᵢfᵢ(x) with positive weights; each solution found is efficient, and varying the weights traces efficient solutions. Drawbacks: unsupported efficient solutions (in non-convex parts of the frontier) are never found, weights depend on the objectives\' scales, and uniform weight steps do not give evenly spread solutions.', [[1.5, 'Method'], [1, 'Solutions are efficient'], [1.5, 'Drawback(s) explained']]],
      ['Explain how to model a fixed (set-up) cost in a MILP and how to choose M.', 'Add a binary y (1 = set up), subtract f·y in the objective and link x ≤ M·y, so producing requires paying the set-up. M must be at least the largest feasible x (e.g. from the resource limits) but as small as possible to keep the LP relaxation tight.', [[1.5, 'Binary + objective term'], [1.5, 'Linking constraint x ≤ M y'], [1, 'Choice of M']]]];
      const [q, m, rb] = r.pick(W); return { title: 'Written theory question', prompt: q, parts: [wr('', 'Answer in a few sentences.', 4, m, rb)], solution: [], traps: [] }; } }
  },
  mock: { title: 'BA1 mock exam', minutes: 180, points: 50, rules: 'No AI, calculator allowed. Solve the modelling problems by hand or in Excel Solver and type the results.',
    slots: [{ label: 'Theory & terminology (10 × 1 p)', points: 10, tpls: ['t_mix'] }, { label: 'LP modelling', points: 10, tpls: ['f_mix', 'n_trans', 'n_assign'] }, { label: 'Sensitivity report', points: 10, tpls: ['s_report'] },
      { label: 'MILP modelling', points: 10, tpls: ['m_budget', 'm_fixed', 'm_logic'] }, { label: 'NLP / MOP / dual', points: 10, tpls: ['p_markowitz', 'o_pareto', 's_dual'] }] },
  papers: []
});
})(typeof window !== 'undefined' ? window : globalThis);
