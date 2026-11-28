/* 35C03000 Process Analysis and Management — exam Mon 11.1.2027 (moved from 1.12.2026; time and room: check Sisu), SchoolYear, closed book.
   Format (lecture 1 slides): multiple choice + (simple) calculations + open questions + a reflective essay
   on the simulations and cases. No past papers exist: calculations follow the lecture examples
   (Krajewski / Cachon & Terwiesch formulas as on the slides), concepts follow lectures 1–10. */
(function (G) {
'use strict';
const XM = G.XM, L = XM.lib, h = L.esc, D = XM.DSA;
const mc = (label, prompt, correct, wrongs, points, why, o) => Object.assign({ type: 'mcq', label, prompt, options: [correct].concat(wrongs), answer: 0, points: points || 1, why }, o || {});
const wr = (label, prompt, points, model, rubric, o) => Object.assign({ type: 'written', label, prompt, points, model, rubric }, o || {});
const num = (label, prompt, answer, points, o) => Object.assign({ type: 'numeric', label, prompt, answer, points: points || 1, rtol: .01 }, o || {});
const N = (x, d) => L.num(x, d === undefined ? 2 : d);
const SRC = 'Course material: ';

/* ======================= calculation generators ======================= */
const CTX_LITTLE = [
  ['a hospital emergency department', 'patients', 'hour', 'hours'], ['Posti\'s outbound parcel sorting', 'parcels', 'hour', 'hours'], ['a university café queue', 'customers', 'minute', 'minutes'],
  ['a loan-application process', 'applications', 'day', 'days'], ['a car-repair workshop', 'cars', 'day', 'days'], ['an e-commerce returns centre', 'returns', 'hour', 'hours']];
function gLittle(r) {
  const [place, unit, per, pers] = r.pick(CTX_LITTLE), lam = r.pick([4, 6, 8, 12, 15, 20, 24, 30, 45, 60]), w = r.pick([.25, .5, .75, 1.5, 2, 2.5, 3, 4]), Lq = lam * w;
  const ask = r.pick(['L', 'lam', 'w']);
  const given = ask === 'L' ? `On average <b>${lam} ${unit} per ${per}</b> go through ${place}, and each spends on average <b>${N(w)} ${pers}</b> in the process.` : ask === 'lam' ? `On average <b>${N(Lq)} ${unit}</b> are in ${place} at any time, and each spends on average <b>${N(w)} ${pers}</b> in it.` : `On average <b>${N(Lq)} ${unit}</b> are in ${place}, and <b>${lam} ${unit} per ${per}</b> go through it.`;
  const ans = ask === 'L' ? Lq : ask === 'lam' ? lam : w, what = ask === 'L' ? `the average WIP (number of ${unit} in the process)` : ask === 'lam' ? `the throughput rate (${unit} per ${per})` : `the average throughput time (${pers})`;
  const ct = 1 / lam;
  return { title: 'Little\'s law', prompt: given + ' The process is in steady state.',
    parts: [num('(a)', `Compute ${what}.`, ans, 2, { unit: ask === 'L' ? unit : ask === 'lam' ? `${unit}/${per}` : pers }),
      num('(b)', `What is the cycle time (time between two ${unit} leaving the process), in ${per === 'hour' ? 'minutes' : per + 's'}?`, per === 'hour' ? 60 * ct : ct, 1, { unit: per === 'hour' ? 'min' : per + 's' }),
      mc('(c)', `If the throughput rate stays the same but WIP doubles, the throughput time…`, 'doubles', ['halves', 'stays the same', 'cannot be determined from Little\'s law'], 1, 'L = λ × w: with λ fixed, w is proportional to L.')],
    solution: [`Little's law: <b>L = λ × w</b> (WIP = throughput rate × throughput time).`, ask === 'L' ? `L = ${lam} × ${N(w)} = <b>${N(Lq)}</b> ${unit}.` : ask === 'lam' ? `λ = L / w = ${N(Lq)} / ${N(w)} = <b>${lam}</b> ${unit} per ${per}.` : `w = L / λ = ${N(Lq)} / ${lam} = <b>${N(w)}</b> ${pers}.`, `Cycle time = 1 / throughput rate = 1/${lam} ${per} = ${per === 'hour' ? N(60 * ct) + ' min' : N(ct, 3) + ' ' + per + 's'}.`],
    traps: ['Mixing time units (per hour vs minutes): convert before dividing.', 'Confusing cycle time (time between outputs) with throughput time (time one unit spends inside).'] };
}
function gCapacity(r) {
  const names = r.sample(['Sarah', 'Anne', 'Thomas', 'Mikko', 'Aino', 'Leo', 'Emma'], r.pick([3, 4]));
  let times; do { times = names.map(() => r.pick([6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24])); } while (new Set(times).size < times.length);
  const caps = times.map(t => 60 / t), bi = times.indexOf(Math.max(...times)), bcap = caps[bi];
  const demand = r.chance(.35) ? Math.round(bcap * r.pick([.6, .7, .8]) * 10) / 10 : null, thr = demand ? Math.min(demand, bcap) : bcap, ct = 60 / thr;
  const content = L.sum(times), idle = L.sum(times.map(t => ct - t)), util = content / (content + idle);
  const k = r.int(0, names.length - 1);
  return { title: 'Capacity, bottleneck and labour utilisation', prompt: `${names.length} employees each make a different part of the same final product; the product needs one of each part. Processing times per part: ${names.map((n, i) => `<b>${n} ${times[i]} min</b>`).join(', ')}.${demand ? ` Demand is <b>${demand} products per hour</b>.` : ' Demand is higher than the process can make.'}`,
    parts: [num('(a)', `Hourly capacity of ${names[k]}?`, caps[k], 1, { unit: 'parts/h' }),
      mc('(b)', 'Which employee is the bottleneck?', names[bi], names.filter((_, i) => i !== bi), 1, 'The bottleneck is the resource with the lowest capacity (longest time per unit).'),
      num('(c)', 'Throughput rate of the process (products per hour)?', thr, 1, { unit: 'products/h', why: demand ? 'Throughput = min(demand, bottleneck capacity).' : 'Demand exceeds capacity, so throughput = bottleneck capacity.' }),
      num('(d)', 'Labour content per product (min)?', content, 1, { unit: 'min', tol: .01 }),
      num('(e)', 'Average labour utilisation (%)?', util * 100, 2, { unit: '%', rtol: .01, why: 'Labour utilisation = labour content / (labour content + total idle time) = labour content / (number of workers × cycle time).' }),
      num('(f)', `Idle time per product for ${names[k]} (min)?`, ct - times[k], 1, { unit: 'min', tol: .05 })],
    solution: [`Capacities: ${names.map((n, i) => `${n} 60/${times[i]} = ${N(caps[i])}/h`).join(', ')}. Bottleneck: <b>${names[bi]}</b>.`, `Throughput rate ${N(thr)}/h → cycle time = 60/${N(thr)} = ${N(ct)} min.`, `Labour content = ${times.join(' + ')} = ${content} min. Idle time per product = Σ(cycle time − processing time) = ${N(idle)} min.`, `Average labour utilisation = ${content} / (${content} + ${N(idle)}) = <b>${N(util * 100, 1)} %</b>.`],
    traps: ['Using the fastest worker\'s capacity as throughput.', 'Forgetting that when demand is below capacity the throughput (and cycle time) come from demand.', 'Mixing minutes and hours.'] };
}
function gService(r) {
  const steps = ['Register', 'Pay', 'Photo shoot', 'Edit', 'Print'].slice(0, r.pick([3, 4, 5])).map((s, i) => ({ s, m: r.pick([1, 1, 2, 2, 3]), t: r.pick([2, 3, 4, 5, 6, 8, 10, 12]) }));
  const cap = steps.map(x => x.m * 60 / x.t), bi = cap.indexOf(Math.min(...cap)), demand = r.chance(.5) ? Math.round(Math.min(...cap) * r.pick([.7, .85, 1.3]) * 10) / 10 : null;
  if (cap.filter(c => c === cap[bi]).length > 1) return gService(r);
  const flow = demand ? Math.min(demand, cap[bi]) : cap[bi], k = r.int(0, steps.length - 1);
  return { title: 'Bottleneck in a service process', prompt: `Every customer goes through these steps in order (parallel identical servers per step):` + `<div class="xm-tw"><table class="xm-tab"><tr><th>step</th><th>servers</th><th>min per customer</th></tr>${steps.map(x => `<tr><td>${x.s}</td><td>${x.m}</td><td>${x.t}</td></tr>`).join('')}</table></div>` + (demand ? `Customers arrive at <b>${demand} per hour</b>.` : 'Demand is high: there is always a queue at the first step.'),
    parts: [num('(a)', `Capacity of step "${steps[k].s}" (customers per hour)?`, cap[k], 1, { unit: '/h' }),
      mc('(b)', 'Which step is the bottleneck?', steps[bi].s, steps.filter((_, i) => i !== bi).map(x => x.s).slice(0, 3), 1, 'Capacity of a step = servers × 60 / time. The lowest is the bottleneck.'),
      num('(c)', 'Flow rate of the process (customers per hour)?', flow, 1, { unit: '/h' }),
      num('(d)', `Utilisation of step "${steps[k].s}" (%)?`, flow / cap[k] * 100, 1, { unit: '%' })],
    solution: steps.map((x, i) => `${x.s}: ${x.m} × 60 / ${x.t} = ${N(cap[i])} per hour`).concat([`Bottleneck: <b>${steps[bi].s}</b>. Flow rate = min(demand, bottleneck capacity) = ${N(flow)}/h.`, `Utilisation = flow rate / capacity.`]),
    traps: ['Forgetting to multiply by the number of parallel servers.', 'Utilisation above 100 % is impossible: if demand > capacity the flow rate is the capacity.'] };
}
function gProductMix(r) {
  for (let t = 0; t < 500; t++) {
    const pA = r.step(60, 120, 5), pB = r.step(70, 140, 5), mA = r.step(5, 40, 5), mB = r.step(5, 40, 5), dA = r.step(40, 100, 10), dB = r.step(40, 100, 10);
    const W = ['W', 'X', 'Y'].map(n => ({ n, a: r.pick([5, 8, 10, 12, 15, 20]), b: r.pick([5, 8, 10, 12, 15, 20, 25, 30]) })), avail = 2400, fixed = r.step(2000, 6000, 100);
    const load = W.map(w => w.a * dA + w.b * dB), bott = W.filter((w, i) => load[i] > avail); if (bott.length !== 1) continue;
    const bw = bott[0], marA = pA - mA, marB = pB - mB; if (marA === marB) continue;
    const perA = marA / bw.a, perB = marB / bw.b; if (Math.abs(perA - perB) < .2 || (marA > marB) === (perA > perB)) continue;
    const mix = (first) => { let left = avail; const q = { A: 0, B: 0 }; [first, first === 'A' ? 'B' : 'A'].forEach(p => { const tm = p === 'A' ? bw.a : bw.b, d = p === 'A' ? dA : dB; q[p] = Math.min(d, Math.floor(left / tm)); left -= q[p] * tm; }); return q; };
    const trad = mix(marA > marB ? 'A' : 'B'), toc = mix(perA > perB ? 'A' : 'B'), prof = q => q.A * marA + q.B * marB - fixed;
    if (prof(toc) <= prof(trad)) continue;
    return { title: 'Product mix with a bottleneck (TOC)', prompt: `Two products, each workstation available <b>${avail} min/week</b>, weekly operating expense (labour etc.) <b>${fixed} €</b>.` +
      `<div class="xm-tw"><table class="xm-tab"><tr><th></th><th>Product A</th><th>Product B</th></tr><tr><td>Price €</td><td>${pA + mA}</td><td>${pB + mB}</td></tr><tr><td>Materials €</td><td>${mA}</td><td>${mB}</td></tr><tr><td>Demand / week</td><td>${dA}</td><td>${dB}</td></tr>${W.map(w => `<tr><td>min at ${w.n}</td><td>${w.a}</td><td>${w.b}</td></tr>`).join('')}</table></div>`,
      parts: [mc('(a)', 'Which workstation is the bottleneck?', bw.n, W.filter(w => w !== bw).map(w => w.n).concat(['none: demand can be met']), 1, W.map((w, i) => `${w.n}: ${w.a}·${dA} + ${w.b}·${dB} = ${load[i]} min`).join('; ') + ` vs ${avail} available.`),
        num('(b)', 'Margin per bottleneck minute of the product that should be prioritised (€/min)?', Math.max(perA, perB), 1.5, { unit: '€/min' }),
        num('(c)', 'Weekly profit with the bottleneck (TOC) product mix (€)?', prof(toc), 2, { unit: '€', tol: 1 }),
        num('(d)', 'Weekly profit with the traditional approach (highest margin per unit first) (€)?', prof(trad), 1.5, { unit: '€', tol: 1 }),
        mc('(e)', 'Which TOC principle does this illustrate?', 'Prioritise by throughput per unit of bottleneck time, not by margin per unit', ['Maximise the utilisation of every workstation', 'Build inventory in front of every station', 'Always produce the highest-priced product'], 1, '"Every decision should be viewed through throughput, inventory and operating expense": the bottleneck minute is the scarce resource.')],
      solution: [`Load: ${W.map((w, i) => `${w.n} ${load[i]}`).join(', ')} min → bottleneck <b>${bw.n}</b>.`, `Margins: A ${marA} €, B ${marB} €. Per bottleneck minute: A ${N(perA)} €/min, B ${N(perB)} €/min.`, `TOC mix: A ${toc.A}, B ${toc.B} → profit ${toc.A}·${marA} + ${toc.B}·${marB} − ${fixed} = <b>${prof(toc)} €</b>.`, `Traditional mix: A ${trad.A}, B ${trad.B} → ${prof(trad)} €. Difference ${prof(toc) - prof(trad)} €.`],
      traps: ['Subtracting labour per unit: labour is a fixed weekly cost here.', 'Forgetting that only whole units can be made with the remaining minutes.'] };
  }
}
function lineBalance(tasks, c) {   // longest-work-element rule; ties alphabetical
  const done = new Set(), st = []; let cur = null;
  while (done.size < tasks.length) {
    if (!cur) { cur = { tasks: [], left: c }; st.push(cur); }
    const cand = tasks.filter(t => !done.has(t.id) && t.pre.every(p => done.has(p)) && t.t <= cur.left + 1e-9).sort((a, b) => b.t - a.t || (a.id < b.id ? -1 : 1));
    if (!cand.length) { cur = null; continue; }
    const t = cand[0]; cur.tasks.push(t.id); cur.left = L.round(cur.left - t.t, 4); done.add(t.id);
  }
  return st;
}
function gLineBal(r) {
  const n = r.int(6, 8), ids = 'ABCDEFGH'.slice(0, n).split('');
  const tasks = ids.map((id, i) => ({ id, t: r.pick([.4, .5, .6, .7, .8, 1, 1.2, 1.4, 1.5, 1.6, 1.8]), pre: i === 0 ? [] : r.sample(ids.slice(Math.max(0, i - 3), i), r.pick([1, 1, 1, 2])) }));
  const sumT = L.round(L.sum(tasks.map(t => t.t)), 2), maxT = Math.max(...tasks.map(t => t.t));
  const rate = r.pick([15, 20, 24, 30, 40].filter(x => 60 / x >= maxT)) || 20, c = 60 / rate, TM = Math.ceil(sumT / c - 1e-9), st = lineBalance(tasks, c), eff = sumT / (st.length * c);
  const depth = {}; tasks.forEach(t => depth[t.id] = t.pre.length ? Math.max(...t.pre.map(p => depth[p])) + 1 : 0);
  const rows = {}; const P = {}; tasks.forEach(t => { const d = depth[t.id]; rows[d] = (rows[d] || 0) + 1; P[t.id] = [40 + d * 95, 30 + (rows[d] - 1) * 70]; });
  const E = []; tasks.forEach(t => t.pre.forEach(p => E.push([p, t.id])));
  return { title: 'Line balancing (longest work element rule)', figure: L.drawGraph(P, E),
    prompt: `A line must produce <b>${rate} units per hour</b>. Work elements (minutes) and immediate predecessors:<div class="xm-tw"><table class="xm-tab"><tr><th>element</th>${tasks.map(t => `<th>${t.id}</th>`).join('')}</tr><tr><td>time</td>${tasks.map(t => `<td>${t.t}</td>`).join('')}</tr><tr><td>after</td>${tasks.map(t => `<td>${t.pre.join(', ') || '–'}</td>`).join('')}</tr></table></div>`,
    parts: [num('(a)', 'Cycle time c (minutes per unit)?', c, 1, { unit: 'min' }),
      num('(b)', 'Theoretical minimum number of stations TM = ⌈Σt / c⌉?', TM, 1, { tol: 0 }),
      { type: 'table', label: '(c)', prompt: 'Balance the line with the <b>longest work element</b> rule (among elements whose predecessors are done and that fit the remaining time, take the longest; ties alphabetically). Which elements go to each station?', points: 3, cols: ['elements'], rows: st.map((s, i) => ({ label: 'Station ' + (i + 1), cells: [{ a: s.tasks.join(' '), set: true, num: false, w: 8 }] })) },
      num('(d)', 'Efficiency of your solution (%) = Σt / (n · c)?', eff * 100, 2, { unit: '%' })],
    solution: [`c = 60 / ${rate} = ${N(c)} min. Σt = ${sumT} min. TM = ⌈${sumT} / ${N(c)}⌉ = ${TM}.`].concat(st.map((s, i) => `Station ${i + 1}: ${s.tasks.join(', ')} (idle ${N(s.left)} min)`)).concat([`Efficiency = ${sumT} / (${st.length} × ${N(c)}) = <b>${N(eff * 100, 1)} %</b>; balance delay ${N(100 - eff * 100, 1)} %.`]),
    traps: ['Assigning an element before all its predecessors are done.', 'Rounding TM down: it is always rounded up.', 'Efficiency uses the actual number of stations n, not TM.'] };
}
function gEOQ(r) {
  const ctx = r.pick([['tricycles at a department store', 'month'], ['pairs of car bumpers from an overseas supplier', 'year'], ['boxes of printer paper at an office supplier', 'year'], ['bags of coffee beans at a café chain', 'month']]);
  const D = ctx[1] === 'month' ? r.step(200, 900, 50) : r.step(5000, 80000, 1000), co = r.pick([10, 20, 25, 40, 50, 75, 100, 120]), price = r.pick([12, 20, 30, 45, 60, 80]), hp = r.pick([.15, .2, .25]);
  const Dy = ctx[1] === 'month' ? D * 12 : D, ch = price * hp, Q = Math.sqrt(2 * co * Dy / ch), TC = Dy / Q * co + Q / 2 * ch, L1 = r.pick([1, 2, 3]), wk = Dy / 52;
  return { title: 'EOQ and reorder point', prompt: `Demand for ${ctx[0]} is <b>${N(D, 0)} per ${ctx[1]}</b>. Each order costs <b>${co} €</b> to place. A unit costs <b>${price} €</b> and the annual holding cost is <b>${hp * 100} %</b> of the unit cost. Delivery lead time is ${L1} week${L1 > 1 ? 's' : ''} (52 weeks per year).`,
    parts: [num('(a)', 'Annual holding cost per unit c<sub>h</sub> (€)?', ch, .5, { unit: '€' }),
      num('(b)', 'Economic order quantity (units)?', Q, 2, { unit: 'units', rtol: .01 }),
      num('(c)', 'Total annual ordering + holding cost at the EOQ (€)?', TC, 1.5, { unit: '€', rtol: .01 }),
      num('(d)', 'Orders per year?', Dy / Q, 1, { rtol: .02 }),
      num('(e)', 'Reorder point with constant demand (units)?', wk * L1, 1, { unit: 'units', rtol: .02 })],
    solution: [`Annual demand D = ${N(Dy, 0)}; c<sub>h</sub> = ${hp} × ${price} = ${N(ch)} €/unit/year.`, `EOQ = √(2·c<sub>o</sub>·D / c<sub>h</sub>) = √(2·${co}·${N(Dy, 0)} / ${N(ch)}) = <b>${N(Q, 1)}</b>.`, `TC = D/Q·c<sub>o</sub> + Q/2·c<sub>h</sub> = ${N(Dy / Q * co)} + ${N(Q / 2 * ch)} = ${N(TC)} € (the two parts are equal at the EOQ).`, `Weekly demand ${N(wk, 1)} → R = ${N(wk, 1)} × ${L1} = ${N(wk * L1, 1)}.`],
    traps: ['Using monthly demand with an annual holding cost: put both on the same time base.', 'Holding cost as a percentage must be multiplied by the unit price.'] };
}
function gNewsvendor(r) {
  const kind = r.pick(['season', 'weekly', 'season']);
  if (kind === 'weekly') {
    const [it, mu, sd, cost, price, hold] = r.pick([['shirts at a clothing store', 100, 25, 10, 25, .5], ['1 kg boxes of oat flakes at a grocery', 10, 2.3, .8, 1.99, .05], ['bags of dog food at a pet shop', 60, 14, 12, 29, .4], ['phone chargers at a kiosk', 40, 9, 6, 19, .2]]);
    const cs = price - cost, co = hold, cr = cs / (cs + co), z = L.zTable(cr), Q = mu + z * sd;
    return { title: 'Newsvendor: weekly order-up-to level', prompt: `The store orders ${it} every week. Weekly demand is normal with mean <b>${mu}</b> and standard deviation <b>${sd}</b>. Wholesale cost <b>${cost} €</b>, retail price <b>${price} €</b>. Unsold units are kept to the next week at a holding cost of <b>${hold} €</b> per unit per week.`,
      parts: [num('(a)', 'Overage cost c<sub>o</sub> (€)?', co, .5), num('(b)', 'Shortage (underage) cost c<sub>s</sub> (€)?', cs, .5), num('(c)', 'Critical ratio c<sub>s</sub> / (c<sub>o</sub> + c<sub>s</sub>)?', cr, 1, { tol: .001, rtol: 0, dp: 4 }), num('(d)', 'z from the z-table?', z, 1, { tol: .015, rtol: 0 }), num('(e)', 'Order-up-to level Q* = μ + zσ (units)?', Q, 2, { tol: Math.max(.6, sd * .03), rtol: 0 })],
      solution: [`Leftover units are not lost, they only cost holding: c<sub>o</sub> = ${co} €. A lost sale costs the margin: c<sub>s</sub> = ${price} − ${cost} = ${N(cs)} €.`, `Critical ratio = ${N(cs)} / (${co} + ${N(cs)}) = ${N(cr, 4)} → z ≈ ${z}.`, `Q* = ${mu} + ${z} × ${sd} = <b>${N(Q, 1)}</b> (order up to about ${Math.round(Q)}).`], traps: ['Using the purchase cost as the overage cost in a multi-period problem: leftovers are sold next week, so only holding is lost.'] };
  }
  const [it, mu, sd, cost, price, salv] = r.pick([['winter jackets', 1000, 300, 40, 110, 15], ['concert T-shirts', 800, 200, 6, 25, 1], ['Christmas trees', 500, 120, 15, 45, 0], ['running shoes for the season', 2000, 600, 35, 100, 20], ['ski passes bundles', 300, 80, 50, 120, 10]]);
  const cs = price - cost, co = cost - salv, cr = cs / (cs + co), z = L.zTable(cr), Q = mu + z * sd;
  return { title: 'Newsvendor: how much to order for the season', prompt: `A retailer orders <b>${it}</b> once before the season. Season demand is normal with mean <b>${mu}</b> and standard deviation <b>${sd}</b>. Cost <b>${cost} €</b>, price <b>${price} €</b>, unsold units are sold off at <b>${salv} €</b> after the season.`,
    parts: [num('(a)', 'Overage cost c<sub>o</sub> (€ per unit left over)?', co, .5), num('(b)', 'Shortage cost c<sub>s</sub> (€ per unit short)?', cs, .5), num('(c)', 'Critical ratio (optimal service level)?', cr, 1, { tol: .001, rtol: 0, dp: 4 }), num('(d)', 'z from the z-table?', z, 1, { tol: .015, rtol: 0 }), num('(e)', 'Optimal order quantity Q* (units)?', Q, 2, { tol: Math.max(1, sd * .02), rtol: 0 }),
      mc('(f)', 'If the salvage value drops to 0, Q* …', 'decreases', ['increases', 'stays the same', 'becomes the mean demand'], 1, 'c<sub>o</sub> grows, so the critical ratio falls.')],
    solution: [`c<sub>o</sub> = cost − salvage = ${cost} − ${salv} = ${co} €; c<sub>s</sub> = price − cost = ${cs} €.`, `G(Q*) = c<sub>s</sub> / (c<sub>o</sub> + c<sub>s</sub>) = ${cs} / ${co + cs} = ${N(cr, 4)} → z = ${z} (z-table).`, `Q* = μ + zσ = ${mu} + ${z} × ${sd} = <b>${N(Q, 0)}</b>.`],
    traps: ['Swapping c<sub>o</sub> and c<sub>s</sub> in the ratio.', 'Reading the z-table backwards: find the probability inside the table, read z at the margins.'] };
}
function gSafety(r) {
  const mu = r.step(40, 300, 10), sd = r.step(5, 60, 5), LT = r.pick([1, 2, 3, 4]), sl = r.pick([.85, .9, .95, .975, .99]), z = L.zTable(sl);
  const muL = mu * LT, sdL = sd * Math.sqrt(LT), ss = z * sdL;
  return { title: 'Safety stock and reorder point', prompt: `Weekly demand is normal, mean <b>${mu}</b>, standard deviation <b>${sd}</b>, independent between weeks. Lead time <b>${LT} week${LT > 1 ? 's' : ''}</b>. Target cycle service level <b>${sl * 100} %</b>.`,
    parts: [num('(a)', 'Expected demand during the lead time?', muL, 1), num('(b)', 'Standard deviation of demand during the lead time?', sdL, 1, { rtol: .01 }), num('(c)', 'z for the service level?', z, 1, { tol: .015, rtol: 0 }), num('(d)', 'Safety stock (units)?', ss, 1.5, { rtol: .02 }), num('(e)', 'Reorder point R = μ<sub>L</sub> + zσ<sub>L</sub>?', muL + ss, 1.5, { rtol: .01 })],
    solution: [`μ<sub>L</sub> = ${mu} × ${LT} = ${muL}. σ<sub>L</sub> = ${sd} × √${LT} = ${N(sdL)}.`, `z(${sl}) = ${z}. Safety stock = ${z} × ${N(sdL)} = ${N(ss, 1)}.`, `R = ${muL} + ${N(ss, 1)} = <b>${N(muL + ss, 1)}</b>.`], traps: ['Multiplying σ by the lead time instead of √(lead time).'] };
}
function gLeadTime(r) {
  const p = r.pick([35, 60, 100, 150]), c = Math.round(p * r.pick([.1, .2, .3, .45])), s = Math.round(c * r.pick([0, .25, .5])), med = r.step(100, 1000, 50), sig = r.pick([.3, .42, .5, .66, .8]);
  const Cu = p - c, Co = c - s, CF = Cu / (Cu + Co), z = L.zTable(CF), Q = med * Math.exp(z * sig), ED = med * Math.exp(sig * sig / 2);
  return { title: 'Value of lead time: optimal order with lognormal demand', prompt: `(Saarinen, lecture 9.) A product sells for <b>${p} €</b>, costs <b>${c} €</b>, and leftovers are worth <b>${s} €</b>. Demand is lognormal with median <b>${med}</b> and volatility σ = <b>${sig}</b> (st. dev. of ln demand).`,
    parts: [num('(a)', 'Cost of underage C<sub>u</sub> (€)?', Cu, .5), num('(b)', 'Cost of overage C<sub>o</sub> (€)?', Co, .5), num('(c)', 'Critical fractile C<sub>u</sub>/(C<sub>u</sub> + C<sub>o</sub>)?', CF, 1, { tol: .001, rtol: 0, dp: 4 }), num('(d)', 'Optimal order Q = median · e<sup>zσ</sup>?', Q, 2, { rtol: .02 }), num('(e)', 'Expected demand E(D) = median · e<sup>σ²/2</sup>?', ED, 1, { rtol: .01 }),
      mc('(f)', 'A supplier offers a shorter lead time at a higher unit cost. When is the premium most likely justified?', 'High margin, high demand uncertainty and low residual value (innovative product)', ['Low margin, stable demand (functional product)', 'Whenever the unit cost is lower offshore', 'Only if demand is normally distributed'], 1, 'Fisher / de Treville: responsiveness pays off for innovative products with high volatility, high margins and low salvage.')],
    solution: [`C<sub>u</sub> = p − c = ${Cu}; C<sub>o</sub> = c − s = ${Co}; CF = ${N(CF, 4)} → z = ${z}.`, `Q = ${med} × e<sup>${z}×${sig}</sup> = <b>${N(Q, 0)}</b>.`, `E(D) = ${med} × e<sup>${sig}²/2</sup> = ${N(ED, 0)} (mean > median: heavy right tail).`], traps: ['Using the mean instead of the median in Q = median·e^(zσ).'] };
}
function gServiceLevel(r) {
  const n = 20, twt = r.pick([10, 15, 20, 30, 45, 60]), waits = L.range(0, n).map(() => r.chance(.75) ? r.int(0, twt) : r.int(twt + 1, twt * 3)), ok = waits.filter(w => w <= twt).length;
  return { title: 'Service level from waiting times', prompt: `The target wait time (TWT) is <b>${twt} s</b>. Twenty customers waited (seconds): ${waits.join(', ')}.`,
    parts: [num('(a)', 'Service level = share of customers who start service within the TWT (%)?', ok / n * 100, 2, { unit: '%', tol: .01, rtol: 0 }), num('(b)', 'Average waiting time (s)?', L.mean(waits), 1, { rtol: .01 }),
      mc('(c)', 'Why is the average waiting time alone a poor performance measure?', 'Averages hide the spikes: a few very long waits can ruin the experience even if the mean looks fine', ['Because it is always zero', 'Because waiting time does not depend on capacity', 'Because service level and average are the same thing'], 1, 'Lecture 4: consider probabilities and distributions, not only averages.')],
    solution: [`${ok} of 20 waited ≤ ${twt} s → service level ${ok / n * 100} %.`, `Mean = ${N(L.mean(waits), 1)} s.`], traps: ['Counting "≤ TWT" as "< TWT": exactly at the target counts as within.'] };
}
function gQueue(r) {
  const m = r.pick([1, 1, 2, 3]), p = r.pick([4, 5, 6, 8, 10, 12]), u = r.pick([.6, .7, .75, .8, .85, .9]), a = p / (m * u), cva = r.pick([1, 1, .8]), cvp = r.pick([1, .5, .7]);
  const Tq = (p / m) * Math.pow(u, Math.sqrt(2 * (m + 1)) - 1) / (1 - u) * (cva * cva + cvp * cvp) / 2, Lq = Tq / a;
  return { title: 'Waiting time in a queue', prompt: `Customers arrive on average every <b>${N(a, 2)} min</b> (CV<sub>a</sub> = ${cva}). There ${m > 1 ? 'are <b>' + m + '</b> parallel servers' : 'is <b>one</b> server'}; service takes on average <b>${p} min</b> (CV<sub>p</sub> = ${cvp}). Use the formula from the course (Cachon & Terwiesch): T<sub>q</sub> = (p/m) · u<sup>√(2(m+1))−1</sup>/(1−u) · (CV<sub>a</sub>² + CV<sub>p</sub>²)/2.`,
    parts: [num('(a)', 'Utilisation u = p / (a·m) (%)?', u * 100, 1, { unit: '%' }), num('(b)', 'Average time in the queue T<sub>q</sub> (min)?', Tq, 2, { rtol: .02, unit: 'min' }), num('(c)', 'Average flow time (queue + service) (min)?', Tq + p, 1, { rtol: .02, unit: 'min' }), num('(d)', 'Average number waiting in the queue I<sub>q</sub> (Little\'s law)?', Lq, 1, { rtol: .02 }),
      mc('(e)', 'What happens to the waiting time as utilisation approaches 100 %?', 'It grows without bound (the 1/(1−u) term explodes)', ['It falls to zero', 'It grows linearly', 'It does not depend on utilisation'], 1, 'Variability + high utilisation = long queues. Pooling servers or reducing variability helps.')],
    solution: [`u = ${p} / (${N(a, 2)} × ${m}) = ${N(u * 100, 0)} %.`, `T<sub>q</sub> = (${p}/${m}) × ${u}<sup>${N(Math.sqrt(2 * (m + 1)) - 1, 3)}</sup>/(1 − ${u}) × (${cva}² + ${cvp}²)/2 = <b>${N(Tq, 2)} min</b>.`, `Flow time = ${N(Tq, 2)} + ${p} = ${N(Tq + p, 2)} min; I<sub>q</sub> = T<sub>q</sub>/a = ${N(Lq, 2)}.`], traps: ['Using the arrival rate instead of the inter-arrival time a in u = p/(a·m).'] };
}
function gAggregate(r) {
  const months = r.pick([4, 5, 6]), k = r.pick([100, 120, 150, 200]), dem = L.range(0, months).map(() => r.step(4, 12, 1) * k * r.pick([1, 1, .5]));
  const W0 = r.int(4, 8), wage = r.pick([2500, 3000, 3200]), H = r.pick([1500, 2000, 3000]), F = r.pick([2000, 3000, 4000]), hold = r.pick([2, 3, 5]);
  let w = W0, chase = 0; const cw = dem.map(d => Math.ceil(d / k)); cw.forEach(x => { chase += x * wage + (x > w ? (x - w) * H : (w - x) * F); w = x; });
  let Wl = Math.ceil(L.sum(dem) / (k * months)); for (;;) { let inv = 0, ok = true; dem.forEach(d => { inv += Wl * k - d; if (inv < 0) ok = false; }); if (ok) break; Wl++; }
  let inv = 0, level = (Wl > W0 ? (Wl - W0) * H : (W0 - Wl) * F) + Wl * wage * months; dem.forEach(d => { inv += Wl * k - d; level += inv * hold; });
  return { title: 'Aggregate planning: chase vs level', prompt: `Monthly demand (units): ${dem.join(', ')}. One worker makes <b>${k}</b> units per month and costs <b>${wage} €</b> per month. Hiring costs <b>${H} €</b>, laying off <b>${F} €</b> per worker. Holding costs <b>${hold} €</b> per unit left at the end of a month. You start with <b>${W0}</b> workers and no inventory; no backorders allowed.`,
    parts: [num('(a)', 'Chase strategy (workforce each month = ⌈demand / ' + k + '⌉, no inventory): total cost (€)?', chase, 2, { tol: 1, rtol: 0, unit: '€' }), num('(b)', 'Level strategy: smallest constant workforce that never runs out?', Wl, 1, { tol: 0 }), num('(c)', 'Level strategy total cost (wages + hire/fire once + holding) (€)?', level, 2, { tol: 1, rtol: 0, unit: '€' }),
      mc('(d)', 'Why can a chase strategy be hard to use in Finland?', 'Strict labour legislation makes hiring and layoffs slow and costly', ['Inventory is free', 'Demand never changes', 'Overtime is not allowed'], 1, 'Lecture 6: chase strategy relies on hiring/layoffs or rental workforce.')],
    solution: [`Chase workforce: ${cw.join(', ')} → wages + hires/layoffs = ${N(chase, 0)} €.`, `Level: W = ${Wl} (cumulative production never below cumulative demand) → ${N(level, 0)} €.`, chase < level ? 'Chase is cheaper here.' : 'Level is cheaper here.'], traps: ['Forgetting the initial hire/fire from the starting workforce.', 'Level workforce = ⌈average⌉ may still run out early if demand is front-loaded: check cumulatively.'] };
}

/* ======================= concept multiple choice ======================= */
const Q = (q, a, w, why) => [q, a, w, why];
const BANK = {
  l1: [Q('The 4 Vs of processes are…', 'Volume, Variety, Variation (in demand), Visibility', ['Value, Velocity, Variety, Volume', 'Volume, Value, Visibility, Velocity', 'Variety, Variability, Value, Viability'], 'Slack et al.: they shape how a process should be designed.'),
    Q('High volume and low variety usually means…', 'Low unit cost, standardised and systematised work (e.g. line / continuous process)', ['High unit cost and flexible staff', 'A project process', 'A jobbing shop'], 'Volume–variety: product-process matrix.'),
    Q('Which process type fits one-off, highly customised outputs?', 'Project process', ['Mass process', 'Continuous process', 'Batch process'], 'Project → jobbing → batch → mass → continuous as volume grows and variety falls.'),
    Q('A functional (process) layout groups…', 'similar resources together; products travel between departments', ['all resources for one product in a line', 'everything around a fixed product', 'cells serving product families only'], 'E.g. a hospital with departments.'),
    Q('"Short-fat" vs "long-thin" processes: a long-thin process has…', 'many small sequential stages: simple tasks and high utilisation but fragile to one stage failing', ['few stages each doing a lot of work', 'no bottlenecks', 'the most flexibility'], 'Lecture 1.'),
    Q('Performance objectives in operations are…', 'quality, speed, dependability, flexibility, cost', ['profit, revenue, market share, growth, ROI', 'value, variety, volume, visibility, velocity', 'lean, agile, resilient, green, digital'], 'Slack\'s five performance objectives.')],
  l2: [Q('Little\'s law states…', 'WIP = throughput rate × throughput time', ['Throughput = WIP × cycle time', 'Cycle time = throughput time × WIP', 'Capacity = demand × utilisation'], 'L = λ × w.'),
    Q('Cycle time is…', '1 / throughput rate: the time between two consecutive units leaving the process', ['the time one unit spends in the process', 'the processing time at the bottleneck plus waiting', 'the same as lead time'], 'Do not confuse with throughput time.'),
    Q('TOC step 2 "Exploit the bottleneck" means…', 'get the maximum out of the existing bottleneck (no idle time, no waste on it)', ['buy more bottleneck capacity', 'speed up all non-bottlenecks', 'build inventory everywhere'], 'Elevating (buying capacity) is step 4.'),
    Q('The five focusing steps of TOC are, in order…', 'Identify, exploit, subordinate, elevate, repeat (do not let inertia set in)', ['Identify, elevate, exploit, subordinate, repeat', 'Plan, do, check, act, repeat', 'Exploit, identify, elevate, subordinate, stop'], 'Lecture 2 slide "How to manage bottlenecks?".'),
    Q('According to TOC, an hour lost at a non-bottleneck is…', 'a mirage: it does not reduce system throughput', ['an hour lost for the whole system', 'worse than an hour lost at the bottleneck', 'compensated by overtime at the bottleneck'], '"Activating non-bottlenecks does not improve throughput."'),
    Q('Where are inventories (buffers) justified according to TOC?', 'In front of the bottleneck and the customers', ['In front of every workstation', 'Nowhere', 'Only at the raw-material store'], 'Lecture 2.'),
    Q('Labour utilisation = ?', 'labour content / (labour content + total idle time)', ['throughput / capacity of the fastest worker', 'idle time / labour content', 'number of workers / cycle time'], 'Lecture 2 example (Sarah, Anne, Thomas).'),
    Q('In process mapping, the "line of visibility" separates…', 'activities the customer sees from back-office activities', ['value-adding from non-value-adding steps', 'manual from automated tasks', 'bottlenecks from non-bottlenecks'], 'Service blueprinting.')],
  inv: [Q('The EOQ balances…', 'ordering (setup) cost and inventory holding cost', ['stockout and overage cost', 'price and demand', 'lead time and safety stock'], 'TC = D/Q·c<sub>o</sub> + Q/2·c<sub>h</sub>.'),
    Q('If the ordering cost falls to almost zero (automated ordering), the EOQ…', 'falls: order smaller quantities more often', ['rises', 'does not change', 'becomes the annual demand'], 'EOQ ∝ √c<sub>o</sub>.'),
    Q('The newsvendor critical ratio is…', 'c<sub>s</sub> / (c<sub>s</sub> + c<sub>o</sub>)', ['c<sub>o</sub> / (c<sub>s</sub> + c<sub>o</sub>)', 'c<sub>s</sub> / c<sub>o</sub>', '(price − cost) / price'], 'Order until the probability of selling the last unit equals the critical ratio.'),
    Q('The newsvendor model fits…', 'a single period with perishable / seasonal products and uncertain demand', ['continuous review with constant demand', 'deterministic demand', 'products with no overage cost'], 'Lecture 3 assumptions.'),
    Q('Safety stock protects against…', 'variability of demand (and supply) during the lead time', ['ordering costs', 'high prices', 'average demand'], 'R = μ<sub>L</sub> + zσ<sub>L</sub>.'),
    Q('Raising the target service level from 90 % to 99 % with normal demand…', 'increases safety stock more than proportionally (z goes from 1.28 to 2.33)', ['halves safety stock', 'does not change the reorder point', 'increases it linearly'], 'The tail of the normal distribution is thin.')],
  var: [Q('The two main sources of variability are…', 'demand (arrival) variability and process (service-time) variability', ['price and cost variability', 'internal and external audits', 'labour and machine costs'], 'Lecture 4: "Variability kills".'),
    Q('Service level is defined as…', 'the share of customers that start service within the target wait time', ['average waiting time', 'utilisation of the servers', 'number of complaints per day'], 'Cachon & Terwiesch.'),
    Q('In a PCN diagram, "surrogate interaction" means…', 'one entity acts on the other\'s resources without the other being present (e.g. car repair while the owner is away)', ['face-to-face co-production', 'work done alone on own resources', 'a supplier\'s supplier'], 'PCN regions: independent, surrogate, direct.'),
    Q('In a PCN, "direct interaction" means…', 'the provider and the customer interact in person (co-production)', ['the customer works alone', 'automated back-office work', 'a supplier delivers materials'], ''),
    Q('Customer-induced variability in services is best handled by…', 'accommodating it (flexible staff, capacity buffers) or reducing it (appointments, standardised options)', ['ignoring it', 'raising utilisation to 100 %', 'removing all customer contact'], 'Frei: accommodate or reduce.'),
    Q('In the Process Analytics simulation, adding buffers between stations with variable times…', 'reduces blocking and starving, increasing output and utilisation', ['always lowers output', 'increases blocking', 'has no effect'], 'Your group\'s tutorial answer (Part E).')],
  lean: [Q('Mura, muri and muda mean…', 'unevenness, overburden, waste', ['waste, unevenness, overburden', 'overburden, waste, delay', 'quality, cost, delivery'], 'Lecture 5.'),
    Q('Which is NOT one of the 7(+1) wastes?', 'Standardised work', ['Overproduction', 'Waiting', 'Motion'], 'Wastes: overproduction, waiting, transport, over-processing, inventory, motion, defects (+ unused talent).'),
    Q('Pull production means…', 'production is triggered by actual downstream demand (e.g. kanban)', ['production is based on forecasts', 'products are pushed to stores', 'maximising utilisation'], ''),
    Q('A kanban card signals…', 'when to produce or move a batch to the next step', ['the price of a part', 'a quality defect', 'the end of a shift'], ''),
    Q('A key risk of JIT is…', 'vulnerability to supply disruptions because buffers are removed', ['too much inventory', 'lower quality', 'longer throughput times'], 'E.g. the Strait of Hormuz / COVID examples in the slides.'),
    Q('Levelled (heijunka) scheduling and mixed-model production aim to…', 'smooth the load so the line can make a steady mix without excess capacity', ['make one product at a time in huge batches', 'remove all variety', 'maximise inventory'], ''),
    Q('PDCA stands for…', 'Plan, Do, Check, Act', ['Produce, Deliver, Control, Adjust', 'Plan, Design, Check, Approve', 'Pull, Deliver, Count, Act'], 'Continuous improvement cycle.')],
  sop: [Q('S&OP is…', 'a plan of future aggregate levels so that supply is in balance with demand', ['a detailed daily schedule', 'a marketing campaign plan', 'a purchasing contract'], 'Krajewski p. 450.'),
    Q('A chase strategy…', 'adjusts workforce/capacity to match demand each period', ['keeps a constant workforce and uses inventory', 'never hires', 'uses only overtime'], ''),
    Q('A level strategy…', 'keeps output/workforce constant and absorbs demand changes with inventory or backlog', ['hires and fires every month', 'produces exactly demand every period', 'has no holding cost'], ''),
    Q('Which functions take part in S&OP?', 'Sales/marketing, operations, finance, supply chain, (HR, R&D)', ['Only operations', 'Only finance', 'Only the CEO'], 'Cross-functional by design.'),
    Q('The planning hierarchy from long to short term is…', 'S&OP → resource planning → scheduling', ['Scheduling → S&OP → resource planning', 'Resource planning → scheduling → S&OP', 'Budget → MRP → S&OP'], 'Strategic/tactical → tactical → operational.')],
  scm: [Q('Causes of the bullwhip effect include…', 'demand forecast updating, order batching, price fluctuations, rationing/shortage gaming', ['stable prices and small batches', 'information sharing', 'shorter lead times'], 'Lecture 8.'),
    Q('Transaction cost economics helps decide…', 'when to buy from the market instead of making in-house', ['how to motivate a supplier', 'where to locate a plant', 'how to set safety stock'], 'TCE = when; agency = how; relational view = benefits; contingency = context.'),
    Q('Agency theory focuses on…', 'the principal–agent relationship and how to contract to align incentives', ['economies of scale', 'inventory policy', 'line balancing'], ''),
    Q('Fisher (1997): an innovative product with unpredictable demand needs…', 'a responsive supply chain', ['an efficient (lowest-cost) supply chain', 'no supply chain', 'maximum inventory everywhere'], ''),
    Q('Reshoring means…', 'bringing previously offshored operations back home', ['moving operations abroad', 'moving to a friendly nearby country', 'outsourcing logistics'], ''),
    Q('The relational view says competitive advantage may come from…', 'inter-firm relationships, not only a firm\'s own resources', ['vertical integration only', 'lowest price only', 'contracts that punish suppliers'], 'Dyer & Singh 1998.')],
  resp: [Q('Why are extended (offshore) supply chains exposed to mismatch costs?', 'Long lead times force order decisions under high demand uncertainty', ['Unit costs are higher', 'Shipping is always unreliable', 'Demand is always lower abroad'], 'Saarinen lecture.'),
    Q('Mean demand above the median suggests…', 'a heavy right tail: a lognormal model fits better than a normal one', ['a symmetric distribution', 'no variability', 'negative demand'], ''),
    Q('Waiting to place an order closer to the season is valuable because…', 'forecast uncertainty falls as information arrives', ['prices always fall', 'the critical ratio becomes 50 %', 'lead time increases'], 'Forecast evolution.'),
    Q('The cost-premium frontier shows…', 'how much higher unit cost a shorter lead time can justify', ['the cheapest supplier', 'the EOQ', 'the bullwhip effect'], 'de Treville et al.')]
};
const BANK_NAMES = { l1: 'Process design (L1)', l2: 'Mapping, Little, TOC, line balancing (L2)', inv: 'Inventory (L3)', var: 'Variability & service (L4)', lean: 'Lean & JIT (L5)', sop: 'S&OP & planning (L6)', scm: 'Supply chain management (L8)', resp: 'Responsiveness & lead time (L9)' };
const mcqSet = (keys, n) => r => { const pool = [].concat.apply([], keys.map(k => BANK[k])); return { title: 'Concept check: ' + keys.map(k => BANK_NAMES[k]).join(', '), prompt: 'One answer per question.', parts: r.sample(pool, Math.min(n, pool.length)).map(([q, a, w, why], i) => mc(`(${i + 1})`, q, a, w, 1, why)), solution: [], traps: ['Read every option: the wrong ones are usually true about a different concept.'] }; };

/* ======================= open questions and reflective essays ======================= */
const OPEN = [
  ['Why does waiting time grow sharply as utilisation approaches 100 %? Give two ways to reduce waiting without adding servers.', 'With variable arrivals and service times, idle moments cannot be "saved": when the server is busy almost all the time, every random burst of arrivals builds a queue that takes long to clear. Queueing formulas contain u/(1−u), which explodes near 1. Ways: <b>reduce variability</b> (appointments, standardise tasks, triage), <b>pool</b> separate queues into one shared queue, shift demand (pricing, off-peak), move work off the bottleneck.', [[2, 'Explains the variability + high-utilisation mechanism (u/(1−u))'], [1.5, 'First concrete measure, correctly argued'], [1.5, 'Second concrete measure (pooling, variability reduction, demand shaping)']]],
  ['Explain the five focusing steps of the Theory of Constraints using a process you analysed in the course (e.g. Posti outbound sorting or a simulation).', '1) <b>Identify</b> the bottleneck (lowest capacity / highest load). 2) <b>Exploit</b> it: never let it idle, take quality checks before it, avoid set-ups on it. 3) <b>Subordinate</b> everything else to its pace (release work only as fast as it can handle: drum-buffer-rope). 4) <b>Elevate</b>: add capacity (shifts, equipment). 5) <b>Repeat</b>: the bottleneck moves; do not let inertia set in. Example applied to your process.', [[2.5, 'All five steps in the right order and explained'], [1.5, 'Applied concretely to a course process'], [1, 'Notes that the bottleneck moves / non-bottleneck optimisation does not help']]],
  ['Compare chase and level strategies. Which would you recommend for a Finnish company with strongly seasonal demand, and why?', 'Chase: capacity follows demand (hire/fire, temps, overtime) → low inventory but hiring/layoff costs and quality/learning losses; difficult under Finnish labour law. Level: constant workforce, inventory/backlog absorbs swings → stable workforce but holding costs and obsolescence risk (impossible for services). Often a <b>mixed</b> strategy: level core workforce + seasonal temps/overtime + pre-building inventory where storable.', [[2, 'Correct definitions and trade-offs of both'], [1.5, 'Recommendation fitted to the context (labour law, storability, cost profile)'], [1.5, 'Mentions mixed strategy / S&OP coordination']]],
  ['What is the bullwhip effect? Give its causes and two remedies.', 'Order variability grows as you move upstream from the customer. Causes: demand-forecast updating, order batching, price fluctuations (promotions, forward buying), rationing and shortage gaming. Remedies: share point-of-sale data / VMI / CPFR, smaller and more frequent orders, everyday low pricing, allocate shortages by past sales, shorter lead times.', [[1.5, 'Correct definition (amplification upstream)'], [2, 'At least three causes'], [1.5, 'Two remedies matched to causes']]],
  ['When should a company pay more for a responsive (local, short-lead-time) supplier? Use the newsvendor logic and Fisher\'s framework.', 'Mismatch cost grows with demand uncertainty at the time of ordering, with the margin (underage cost) and with low residual value (overage cost). A shorter lead time lets you order when forecasts are better, cutting leftovers and lost sales. Innovative products (high margin, short life, unpredictable) → responsive supply chain; functional products (stable, low margin) → efficient, offshore. The cost-premium frontier quantifies the justified premium.', [[2, 'Mismatch cost drivers: volatility, margin, salvage, lead time'], [1.5, 'Fisher: innovative → responsive, functional → efficient'], [1.5, 'Concludes when the premium is justified (cost-premium frontier)']]],
  ['Describe the benefits and risks of just-in-time.', 'Benefits: less inventory and space, shorter throughput times, problems become visible, better quality, less waste. Risks: no buffer against disruptions (geopolitics, pandemics, strikes), dependence on reliable suppliers and short distances, needs stable levelled demand, small batches need short set-ups.', [[2, 'Two or more benefits'], [2, 'Two or more risks with an example'], [1, 'Conditions/requirements for JIT to work']]],
  ['Explain the PCN (Process–Chain–Network) diagram and use it to suggest an improvement for a service.', 'A PCN shows each entity\'s process domain (provider, customer) split into independent processing, surrogate interaction and direct interaction. Moving steps between regions changes cost and experience: e.g. self-service shifts work to the customer\'s independent domain; online check-in replaces direct interaction; back-office surrogate work can be standardised. Customer-induced variability is highest in direct interaction.', [[2, 'Correct regions (independent, surrogate, direct)'], [2, 'A concrete improvement by moving steps between regions'], [1, 'Discusses the effect on variability/cost/experience']]],
  ['What is S&OP, who takes part, and why is it hard in practice?', 'Sales & operations planning balances aggregate supply and demand monthly for the next months (production, staffing, inventory, finance). Sales/marketing, operations, supply chain, finance, (HR) take part. Hard because goals conflict (sales wants availability, finance low inventory, operations stable plans), forecasts are uncertain, and decisions must be taken jointly.', [[1.5, 'Definition and horizon'], [1.5, 'Participants and their conflicting goals'], [2, 'Why it is hard + how a good process handles it (pre-S&OP, consensus plan)']]]
];
const CASES = [
  ['ARAPU (case, lecture 4: service process improvement)', ['service process mapping (value-adding vs non-value-adding steps)', 'bottleneck and capacity in a service', 'sources of variability (customer-induced) and service level', 'PCN regions'], 'Name the service and its problem; map the process and show where waiting / non-value-adding steps occur; identify the bottleneck and the main variability; give recommendations (standardise, appointments, reorganise steps, move work out of direct interaction).'],
  ['Run Like Clockwork (case, lecture 6: operations planning and scheduling)', ['S&OP and aggregate planning', 'chase vs level strategy', 'capacity vs demand matching', 'scheduling'], 'State the planning problem; show how demand and capacity were matched; discuss which strategy (chase / level / mixed) fits and why; recommend changes to the planning process.'],
  ['Baman (case, lecture 8: supply chain management)', ['supply chain positioning and strategy alignment', 'inventory problems and segmentation of the supply chain by channel', 'make-or-buy / partnerships (TCE, relational view)', 'efficient vs responsive (Fisher), bullwhip'], 'Explain the supply-chain problem the company faced as it grew; analyse it with SCM concepts (segmenting the chain for different channels, partner collaboration, inventory); recommend how to manage the more complex chain. (Your group wrote the introduction and marketing analysis: connect them to operations.)'],
  ['Sonae MC (case, lecture 10: lean in service/retail)', ['lean principles and the 7+1 wastes', 'standardised work and continuous improvement (kaizen, PDCA)', 'pull / flow in retail operations', 'lean in services: limits and people'], 'Describe how lean was applied; which wastes it targeted; what worked and what is hard to transfer to services; recommendations.'],
  ['Posti site visit (outbound sorting / S&OP)', ['capacity vs demand (peaks, variability)', 'bottleneck in the sorting process', 'S&OP and chase/level capacity', 'line-haul deadline as a constraint'], 'Describe the process and the capacity–demand challenge; apply TOC/variability or S&OP concepts; give your group\'s recommendations and what you learned. (Keep Posti\'s confidential data out.)'],
  ['Process Analytics tutorial (simulation)', ['cycle time and output of a line', 'variability → blocking and starving', 'buffers', 'utilisation vs throughput time'], 'Your group found: 2 stations of 1 min → 60 units/h (480 per 8-h day) at 100 % utilisation without variation; with variation output fell to about 51.5/h because station A was blocked and B starved; more variation → lower output and utilisation; buffers reduce blocking/starving and raise output. Reflect on what this means for real lines.'],
  ['System Utilization in Service (simulation)', ['balancing workstations', 'utilisation and idle time', 'bottleneck with 4 workstations and 5 workers'], 'Explain how you balanced the system (when balanced, workstation capacities are equal), how utilisation changed, and what you learned about adding a worker to the bottleneck.'],
  ['Inventory Basics (simulation)', ['EOQ and order cycles', 'critical ratio and z (safety stock)', 'reorder point with lead time', 'different cost profiles (wrench / paint / rock salt)'], 'Explain the order policy you used for the three products (mean 20 per week, σ 1 / 2 / 9), how the critical ratio and safety factor differed and why the high-variance product needed most buffer.'],
  ['Benihana (simulation)', ['batching and throughput', 'bar as a buffer', 'dining time vs capacity', 'demand management'], 'Explain your choices on batching, bar size and dining time, how they changed throughput and profit, and the link to bottlenecks and buffers.'],
  ['Supply Chain Designer (simulation)', ['offshore vs local capacity', 'newsvendor under uncertainty', 'responsiveness and service level'], 'Explain your sourcing strategy (offshore orders vs local capacity), how demand uncertainty affected results and what responsiveness was worth.']
];
function gOpen(r) { const [q, m, rb] = r.pick(OPEN); return { title: 'Open question', prompt: q, parts: [wr('', 'Answer in 5–10 sentences.', 5, m, rb, { rows: 7 })], solution: ['Name the concept, explain the mechanism, apply it to an example, conclude.'], traps: ['Listing buzzwords without explaining the mechanism.', 'Not using an example from the course.'] }; }
function gEssay(r, L2, o) {
  const [name, concepts, guide] = o && o.case !== undefined ? CASES[o.case] : r.pick(CASES);
  return { title: 'Reflective essay: ' + name, prompt: `Write a reflective essay (about 250–400 words) on <b>${name}</b>: what was the problem or task, what did your group do and why, which course concepts explain it, and what did you learn?`,
    parts: [wr('', 'Your essay', 10, `<p><b>What a strong essay contains:</b> ${guide}</p><p><b>Concepts the graders will look for:</b></p><ul>${concepts.map(c => `<li>${c}</li>`).join('')}</ul><p>Structure: situation → your decisions and the results → analysis with ≥ 2 concepts (named and explained) → what you learned / would do differently → link to practice.</p>`,
      [[2, 'Situation and problem stated precisely (not a retelling of the case)'], [3, 'At least two course concepts named, explained and applied correctly'], [2, 'Your own group\'s decisions, results and reasons'], [2, 'Genuine reflection: what you learned, what you would do differently, limits'], [1, 'Clear structure, concise']], { rows: 12 })],
    solution: ['The essay checks that every group member understood the simulation/case: show <i>your</i> understanding, not the group report.'], traps: ['Describing the case without analysis.', 'No concepts named.', 'No reflection on what you would do differently.'] };
}

/* ======================= course ======================= */
const T = {
  c_little: { topic: 'little', title: 'Little\'s law (all three directions) + cycle time', kinds: 'numeric + multiple choice', source: SRC + 'L2 video slides 12–15', gen: gLittle, weight: 1.3 },
  c_capacity: { topic: 'capacity', title: 'Capacity, bottleneck, labour utilisation, idle time', kinds: 'numeric + multiple choice', source: SRC + 'L2 slides 32–43 (Sarah, Anne, Thomas example)', gen: gCapacity, weight: 1.3 },
  c_service: { topic: 'capacity', title: 'Bottleneck in a multi-server service process', kinds: 'numeric + multiple choice', source: SRC + 'L2 slide 26 (photo studio example)', gen: gService },
  c_mix: { topic: 'toc', title: 'TOC product mix: margin per bottleneck minute', kinds: 'numeric + multiple choice', source: SRC + '"Bottlenecks in line production" exercise (L2)', gen: gProductMix },
  c_linebal: { topic: 'linebal', title: 'Line balancing with the longest work element rule', kinds: 'numeric + fill the table', source: SRC + 'L2 slides 44–52 (trim line example)', gen: gLineBal },
  c_eoq: { topic: 'inventory', title: 'EOQ, total cost, reorder point', kinds: 'numeric', source: SRC + 'L3 Distribution & Logistics slides 4–7', gen: gEOQ, weight: 1.2 },
  c_safety: { topic: 'inventory', title: 'Safety stock and reorder point with a service level', kinds: 'numeric', source: SRC + 'L3 slide 34 + z-table', gen: gSafety },
  c_news: { topic: 'newsvendor', title: 'Newsvendor: critical ratio, z, order quantity', kinds: 'numeric + multiple choice', source: SRC + 'L3 slides 12–32 (T-shirts, GAP, Alepa)', gen: gNewsvendor, weight: 1.3 },
  c_leadtime: { topic: 'resp', title: 'Value of lead time: lognormal newsvendor', kinds: 'numeric + multiple choice', source: SRC + 'L9 Saarinen slides 17–33', gen: gLeadTime },
  c_svclevel: { topic: 'variability', title: 'Service level from waiting times', kinds: 'numeric + multiple choice', source: SRC + 'L4 slides 26–30', gen: gServiceLevel },
  c_queue: { topic: 'queue', title: 'Queue waiting time and utilisation', kinds: 'numeric + multiple choice', source: SRC + 'L11 queueing models (Cachon & Terwiesch formula)', gen: gQueue },
  c_aggr: { topic: 'sop', title: 'Aggregate planning: chase vs level cost', kinds: 'numeric + multiple choice', source: SRC + 'L6 slides 18–19', gen: gAggregate },
  m_l1: { topic: 'mcq', title: 'Concepts: process design (4Vs, process & layout types)', kinds: 'multiple choice', source: SRC + 'L1', gen: mcqSet(['l1'], 5) },
  m_l2: { topic: 'mcq', title: 'Concepts: mapping, Little, TOC, line balancing', kinds: 'multiple choice', source: SRC + 'L2', gen: mcqSet(['l2'], 5) },
  m_inv: { topic: 'mcq', title: 'Concepts: inventory and newsvendor', kinds: 'multiple choice', source: SRC + 'L3', gen: mcqSet(['inv'], 5) },
  m_var: { topic: 'mcq', title: 'Concepts: variability, service level, PCN', kinds: 'multiple choice', source: SRC + 'L4', gen: mcqSet(['var'], 5) },
  m_lean: { topic: 'mcq', title: 'Concepts: lean, JIT, kanban', kinds: 'multiple choice', source: SRC + 'L5', gen: mcqSet(['lean'], 5) },
  m_sop: { topic: 'mcq', title: 'Concepts: S&OP, chase vs level', kinds: 'multiple choice', source: SRC + 'L6', gen: mcqSet(['sop'], 4) },
  m_scm: { topic: 'mcq', title: 'Concepts: SCM theories, bullwhip, responsiveness', kinds: 'multiple choice', source: SRC + 'L8–L9', gen: mcqSet(['scm', 'resp'], 5) },
  m_mix: { topic: 'mcq', title: 'Mixed multiple-choice block (exam style)', kinds: 'multiple choice', source: 'Exam format from the L1 slides', gen: mcqSet(Object.keys(BANK), 10), hidden: true },
  open: { topic: 'open', title: 'Open question with a marking rubric', kinds: 'written + rubric', source: 'Exam format (L1): open-ended questions', gen: gOpen, weight: 1.2 },
  essay: { topic: 'essay', title: 'Reflective essay on a case or simulation', kinds: 'written + rubric', source: 'Exam format (L1): reflective essay on simulations/cases', gen: gEssay, weight: 1.2 }
};
XM.PAM = { CASES, gEssay };
XM.register({
  id: 'pam', code: '35C03000', name: 'Process Analysis and Management', short: 'PAM', accent: '#42E2B8',
  bosses: ['The Bottleneck', 'Little\'s Lawyer', 'The Bullwhip', 'Muda Golem', 'The Newsvendor', 'Queue Wraith', 'The Examiner'],
  exam: { date: '2027-01-11T09:00:00', tentative: true, where: 'SchoolYear computer classroom, Mon 11.1.2027 (time and room: check Sisu)', format: 'SchoolYear, closed book, 3 h: multiple choice, simple calculations, open questions and a reflective essay on the simulations and cases.',
    rules: 'Closed book. A calculator is usually available in SchoolYear; keep a z-table in mind (the app reads z like the printed table).',
    notes: '<p>No past papers exist (new flipped course). This mode follows the format announced in lecture 1: <b>multiple choice</b>, <b>simple calculations</b>, <b>open questions</b> and a <b>reflective essay</b> based on the simulations and cases (ARAPU, Run Like Clockwork, Baman, Sonae MC, Posti). You need <b>≥ 50 % of the exam points</b> to pass; the exam is 35 % of the grade.</p><p>Formulas used exactly as on the slides: L = λ·w; capacity = resources/processing time; labour utilisation = labour content/(content + idle); EOQ = √(2c<sub>o</sub>D/c<sub>h</sub>); critical ratio c<sub>s</sub>/(c<sub>o</sub>+c<sub>s</sub>), Q* = μ + zσ; line balancing with TM = ⌈Σt/c⌉ and the longest-work-element rule.</p>' },
  grades: [[90, 5], [80, 4], [70, 3], [60, 2], [50, 1]],
  gradeNote: 'Indicative only: the course grade uses these limits on the total of all assignments; for the exam itself you need ≥ 50 %.',
  topics: {
    little: { name: 'Little\'s law & cycle time', slot: 'calculation', weight: .9, freq: 'L2 core' }, capacity: { name: 'Capacity, bottleneck, utilisation', slot: 'calculation', weight: .9, freq: 'L1–L2 core' },
    toc: { name: 'Theory of constraints', slot: 'calculation / open', weight: .6 }, linebal: { name: 'Line balancing', slot: 'calculation', weight: .6 },
    inventory: { name: 'EOQ, safety stock, reorder point', slot: 'calculation', weight: .8 }, newsvendor: { name: 'Newsvendor', slot: 'calculation', weight: .8 },
    resp: { name: 'Value of lead time / responsiveness', slot: 'calculation / open', weight: .5 }, variability: { name: 'Variability & service level', slot: 'calculation', weight: .6 },
    queue: { name: 'Queues', slot: 'calculation', weight: .5 }, sop: { name: 'S&OP, chase vs level', slot: 'calculation / open', weight: .6 },
    mcq: { name: 'Concepts (multiple choice)', slot: 'MCQ part', weight: .9 }, open: { name: 'Open questions', slot: 'open part', weight: .8 }, essay: { name: 'Reflective essay', slot: 'essay', weight: .9 }
  },
  templates: T,
  mock: { title: 'PAM mock exam (SchoolYear format)', minutes: 180, points: 50, rules: 'Closed book, calculator allowed. Self-mark the open question and the essay strictly with the rubric.',
    slots: [{ label: 'Multiple choice (10 × 1 p)', points: 10, tpls: ['m_mix'] }, { label: 'Calculation: process analysis', points: 6, tpls: ['c_little', 'c_capacity', 'c_service'] },
      { label: 'Calculation: inventory', points: 6, tpls: ['c_eoq', 'c_news', 'c_safety'] }, { label: 'Calculation: bottlenecks / planning', points: 6, tpls: ['c_mix', 'c_linebal', 'c_aggr', 'c_queue'] },
      { label: 'Open question', points: 6, tpls: ['open'] }, { label: 'Open question', points: 6, tpls: ['open'] }, { label: 'Reflective essay', points: 10, tpls: ['essay'] }] },
  papers: []
});
})(typeof window !== 'undefined' ? window : globalThis);
