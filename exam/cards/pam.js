/* PAM flashcards: [Study Hall page id, front, back]. The Baman case forbids LLM use, so it has no cards. */
(function (G) {
'use strict';
const XM = G.XM; XM.cards = XM.cards || {};
XM.cards.pam = [
['overview', `What do you need to pass the PAM exam?`, `≥ 50 % of the exam points (and ≥ 50 % overall). The exam is 35 % of the grade.`],
['overview', `Structure of an open-question answer?`, `Name the concept → explain the mechanism → apply it to a course example → conclude.`],

['design', `The 4 Vs of operations?`, `Volume, Variety, Variation (in demand), Visibility (customer exposure).`],
['design', `Manufacturing process types, from low volume/high variety to high volume/low variety?`, `Project → jobbing → batch → mass → continuous.`],
['design', `Service process types?`, `Professional services → service shops → mass services.`],
['design', `The four basic layouts, with an example each?`, `Fixed-position (construction) · functional/process (hospital departments) · cell (product family) · product/line (assembly line).`],
['design', `The five performance objectives?`, `Quality, speed, dependability, flexibility, cost.`],
['design', `Long-thin vs short-fat processes?`, `Long-thin: many small sequential stages, high utilisation, fragile. Short-fat: few stages each doing more, robust and flexible, needs more training.`],

['little', `Little's law?`, `<b>L = λ × w</b>: WIP = throughput rate × throughput time (stable process, steady state).`],
['little', `Cycle time vs throughput time?`, `Cycle time = 1/λ, the time <b>between</b> two outputs. Throughput time = time a unit spends <b>inside</b> the process, including waiting.`],
['little', `A clinic sees 12 patients/h, 6 are inside on average. Throughput time and cycle time?`, `w = 6/12 h = <b>30 min</b>. Cycle time = 60/12 = <b>5 min</b>.`],

['capacity', `Capacity of a step with m parallel resources and processing time p?`, `m / p, e.g. 2 cashiers at 4 min → 2·60/4 = 30 per hour.`],
['capacity', `Bottleneck, process capacity, flow rate?`, `Bottleneck = step with the lowest capacity. Process capacity = bottleneck capacity. Flow rate = min(demand, process capacity).`],
['capacity', `Utilisation of a resource?`, `Flow rate / its capacity.`],
['capacity', `Average labour utilisation?`, `Labour content / (labour content + total idle time) = labour content / (workers × cycle time).`],
['capacity', `Sarah 12, Thomas 15, Anne 21 min per part, high demand: bottleneck, throughput, labour utilisation?`, `Anne (2.86/h); cycle time 21 min; idle 9 + 6 + 0 = 15 → 48/63 = <b>76.2 %</b>.`],

['toc', `The five focusing steps of TOC?`, `1) Identify the bottleneck 2) Exploit it 3) Subordinate everything to it 4) Elevate it 5) Repeat (avoid inertia).`],
['toc', `TOC product mix: how do you rank products when one workstation is the bottleneck?`, `By <b>margin per bottleneck minute</b> = (price − materials) / bottleneck minutes, not by margin per unit.`],
['toc', `An hour lost at the bottleneck vs an hour saved at a non-bottleneck?`, `Lost at the bottleneck = lost for the whole system. Saved at a non-bottleneck = a mirage.`],
['toc', `What is drum-buffer-rope?`, `The bottleneck (drum) sets the pace, a buffer protects it from starving, the rope releases material only at the bottleneck's rate.`],

['linebal', `Line balancing: cycle time c and theoretical minimum TM?`, `c = available time / required output. TM = ⌈Σ task times / c⌉ (round up).`],
['linebal', `Line efficiency and balance delay?`, `Efficiency = Σt / (n·c) with the <b>actual</b> n. Balance delay = 100 % − efficiency.`],
['linebal', `Longest work element rule?`, `Among tasks whose predecessors are done and that fit the station's idle time, assign the longest. Open a new station when nothing fits.`],

['inventory', `EOQ formula?`, `EOQ = √(2·c<sub>o</sub>·D / c<sub>h</sub>), with D and c<sub>h</sub> on the same time basis.`],
['inventory', `Total cost TC(Q) and the check at the EOQ?`, `TC = (D/Q)·c<sub>o</sub> + (Q/2)·c<sub>h</sub>. At the EOQ the two halves are equal.`],
['inventory', `Reorder point with uncertain demand?`, `R = μ<sub>L</sub> + z·σ<sub>L</sub>, with μ<sub>L</sub> = μ·L and σ<sub>L</sub> = σ·<b>√L</b>. Safety stock = z·σ<sub>L</sub>.`],
['inventory', `z-values for 90 %, 95 %, 97.5 %, 99 %?`, `1.28 · 1.64/1.65 · 1.96 · 2.33.`],
['inventory', `Stockmann tricycles: 500/month, c<sub>o</sub> 10 €, price 30 €, holding 20 %/yr. EOQ?`, `D = 6000/yr, c<sub>h</sub> = 6 €/yr → √(2·10·6000/6) ≈ <b>141</b> units.`],

['newsvendor', `Newsvendor: overage and shortage cost (single season)?`, `c<sub>o</sub> = cost − salvage value. c<sub>s</sub> = price − cost (lost margin).`],
['newsvendor', `Critical ratio and order quantity (normal demand)?`, `CR = c<sub>s</sub> / (c<sub>s</sub> + c<sub>o</sub>). Q* = μ + z·σ with Φ(z) = CR.`],
['newsvendor', `GAP shirts: c<sub>o</sub> 0.5, c<sub>s</sub> 15, μ 100, σ 25. Q*?`, `CR = 15/15.5 = 0.9677 → z = 1.85 → Q* ≈ <b>146</b>.`],
['newsvendor', `When do you order more than the mean?`, `When overage is cheap (high salvage) or shortage is expensive: CR &gt; 0.5.`],

['variability', `Define service level (with a target wait time).`, `Share of customers who start service within the target wait time: P(wait ≤ TWT).`],
['variability', `Queue utilisation u?`, `u = p / (a·m): service time / (inter-arrival time × servers).`],
['variability', `Why does waiting explode near full utilisation?`, `The 1/(1 − u) term in the queue formula: as u → 100 % the wait grows without limit.`],
['variability', `Two ways to cut waiting without adding capacity?`, `<b>Pool</b> separate queues and <b>reduce variability</b> (arrivals or service times).`],
['variability', `PCN: the three regions of a process domain?`, `Independent processing (alone), surrogate interaction (on the other's resources without them), direct interaction (face to face). Customer-induced variability is highest in direct interaction.`],

['lean', `Muda, mura, muri?`, `Waste · unevenness · overburden.`],
['lean', `The 7 (+1) wastes?`, `Overproduction, waiting, transport, over-processing, inventory, motion, defects (+ unused talent).`],
['lean', `Push vs pull?`, `Push: forecast-driven, builds inventory. Pull: triggered by actual downstream demand (kanban).`],
['lean', `Benefits and risks of JIT?`, `Benefits: less inventory, shorter throughput time, problems visible, better quality. Risks: no buffer against disruptions, needs reliable suppliers, levelled demand and short set-ups.`],

['sop', `Define S&OP.`, `A plan of future aggregate levels so that supply is in balance with demand (monthly, months ahead), made jointly by sales, operations, supply chain and finance.`],
['sop', `Chase vs level strategy?`, `Chase: capacity follows demand (low inventory, hire/fire costs). Level: constant output, inventory or backlog absorbs swings (stable workforce, holding cost).`],
['sop', `Level strategy: how do you pick the workforce?`, `The smallest constant workforce whose <b>cumulative</b> output never falls below cumulative demand. The average may run out early.`],

['scm', `What is the bullwhip effect?`, `Order variability amplifies as you move upstream in the supply chain.`],
['scm', `Four causes of bullwhip, and remedies?`, `Forecast updating, order batching, price fluctuations, shortage gaming. Remedies: share POS data/VMI, small frequent orders, everyday low pricing, allocate by past sales, shorter lead times.`],
['scm', `Fisher (1997): which supply chain for which product?`, `Functional products (stable, low margin) → <b>efficient</b> chain. Innovative products (unpredictable, high margin) → <b>responsive</b> chain.`],
['scm', `Transaction cost economics vs agency theory?`, `TCE: <b>when</b> to contract out (make or buy). Agency theory: <b>how</b> to contract (aligning principal and agent incentives).`],
['scm', `When is a higher-cost responsive (local) supplier worth it?`, `When demand volatility and margins are high and residual value is low: the mismatch cost of long lead times outweighs the unit-cost premium.`],

['essay', `Structure of the reflective essay (≈ 300 words)?`, `1) situation and problem · 2) what your group decided and what happened · 3) analysis with ≥ 2 named, explained concepts · 4) what you learned / would do differently · 5) link to real operations.`],
['essay', `Process Analytics: why did output fall from 60/h to ≈ 51.5/h with variation?`, `Station A was <b>blocked</b> and B <b>starved</b>. More variation → lower output; buffers reduce blocking and starving.`],
['essay', `System Utilization in Service: where does the 5th worker go in a 4-station system?`, `At the <b>bottleneck</b>, to balance workstation capacities.`],
];
})(typeof window !== 'undefined' ? window : globalThis);
