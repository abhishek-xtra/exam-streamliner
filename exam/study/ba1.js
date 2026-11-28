/* ISM-C1004 BA1 Study Hall — follows the exam guide: (1) modelling problems, (2) theory & terminology,
   lecture by lecture (L1 LP … L7 MOP). Examples are the lecture examples, not the assignments. */
(function (G) {
'use strict';
const XM = G.XM; XM.study = XM.study || {};
const T = (head, rows) => `<div class="xm-tw"><table><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
const note = (t, b) => `<div class="xm-note"><b>${t}</b> ${b}</div>`;

XM.study.ba1 = [
{ id: 'overview', slot: 'Start here', title: 'How the BA1 exam works', intro: 'Retake <b>Mon 1.2.2027</b> (<b>time and room: check Sisu</b>; the S&S exam is the same day). Two kinds of questions (lecture 0): <b>modelling problems</b> like the spreadsheet assignments (formulate and implement/solve) and <b>theory & terminology</b> like the quizzes.',
  know: T(['Exam %', '&gt;50', '&gt;60', '&gt;70', '&gt;80', '&gt;90'], [['Grade', '1', '2', '3', '4', '5']]) + note('Final grade:', '30 % × min(assignments, 100) + 70 % × exam (+ feedback point). You need ≥ 50 % of the exam points.') + note('No AI:', 'the course requires you to formulate and implement models yourself.'),
  method: ['For every modelling problem write: <b>indices → parameters → decision variables → objective → constraints → variable types</b>.', 'Then implement: data cells, variable cells, SUMPRODUCT formulas, Solver (Simplex LP or GRG Nonlinear, non-negativity, int/bin).'] },

{ id: 'lp-model', slot: 'L1 · modelling', title: 'Formulating an LP from a word problem', topic: 'form', tpls: ['f_mix'],
  know: note('LP:', 'objective and all constraints are <b>linear</b> functions of the decision variables (no products x·y, no x², no x/y, no max/abs).') +
    T(['Step', 'Iron Works example (lecture 1)'], [['Decision variables (in words + units)', 'x₁, x₂ = kilotons of grade 1 / grade 2 steel per day'], ['Objective', 'max 5x₁ + 7x₂ (revenue, 10 k€)'], ['Constraints (one per resource/rule)', 'x₁ ≤ 6 (at most 6 kt grade 1); 2x₁ + 3x₂ ≤ 19 (iron ore); x₁ + x₂ ≤ 8 (total)'], ['Variable types', 'x₁, x₂ ≥ 0'], ['Solution', 'x = (5, 3), z = 46 → 460 000 €; binding: ore and total']]) +
    note('Spreadsheet implementation:', 'data visible and labelled; decision variables in their own cells; objective = SUMPRODUCT(coefficients, variables); each constraint LHS = SUMPRODUCT(row, variables) compared with the RHS cell; Solver: Simplex LP, "make unconstrained variables non-negative".') +
    note('Auxiliary variables:', 'variables that do not appear in the decision itself but make the model easier (e.g. inventory carried between weeks in production scheduling).') +
    note('Standard form:', 'all constraints equalities with slack (≤) / surplus (≥) variables, all variables ≥ 0.'),
  method: ['Read for "how much / how many / which" → variables.', 'Read for "maximise / minimise" → objective.', 'Each sentence with "at most / at least / exactly / must" → a constraint (≤ / ≥ / =).', 'Check units on both sides.'],
  traps: ['A constraint per product instead of per resource.', 'Forgetting non-negativity.', 'Percent rules like "at least 30 % of production is X": x ≥ 0.3(x + y) → 0.7x − 0.3y ≥ 0.'] },

{ id: 'graphical', slot: 'L1 · modelling', title: 'Graphical solution and special cases', topic: 'graph', tpls: ['g_graph'],
  know: note('Procedure:', 'draw each constraint line (intercepts), shade the feasible side, find the feasible region, move the objective line (iso-profit) in the improving direction or evaluate all extreme points.') +
    note('Extreme point theorem:', 'if an LP has an optimum, at least one extreme point is optimal.') +
    T(['Case', 'Picture'], [['Binding constraint', 'holds with equality at the optimum'], ['Redundant constraint', 'removing it does not change the feasible region'], ['Alternative optima', 'objective line parallel to a binding edge'], ['Infeasible', 'empty feasible region'], ['Unbounded', 'objective can improve forever inside the region']]),
  traps: ['For a min problem, moving the objective line the wrong way.'] },

{ id: 'sensitivity', slot: 'L2 · modelling + theory', title: 'Reading the Excel sensitivity report', topic: 'sens', tpls: ['s_report'],
  intro: 'Expect five standard questions: optimal value, which constraints bind, new objective after an RHS change, is the solution still optimal after a coefficient change, what does the reduced cost mean.',
  know: T(['Column', 'Meaning'], [['Final Value (variables)', 'optimal value of each decision variable'], ['Reduced Cost', 'for a variable at 0: how much its objective coefficient must improve before it becomes positive (= change in objective per unit forced in); 0 for variables in the solution'], ['Objective Coefficient + Allowable Increase/Decrease', '<b>range of optimality</b>: the coefficient can move within it and the optimal <i>solution</i> stays the same (objective value changes)'], ['Final Value (constraints)', 'LHS usage at the optimum'], ['Shadow Price', 'change in the optimal objective per unit increase of the RHS: <b>ΔZ = shadow price × ΔRHS</b>'], ['Constraint R.H. Side + Allowable Increase/Decrease', '<b>range of feasibility</b>: the shadow price is valid while the RHS stays in it'], ['1E+30', 'infinity']]) +
    note('Rules:', 'non-binding constraint → shadow price 0 (slack = RHS − final value). One change at a time only. Outside the allowable range you must re-solve.') +
    note('Iron Works report:', 'shadow price of ore 2, of the total-production constraint 1 (valid for RHS 8 up to 8.333); c₁ range [4.667, 7], c₂ range [5, 7.5].'),
  method: ['Optimal value = Σ coefficient × final value.', 'Binding ⇔ final value = RHS.', 'RHS change Δ ≤ allowable → new Z = Z + shadow price × Δ.', 'Coefficient change within range → same solution, new Z = Σ new c × x.', 'Not produced: needed improvement = |reduced cost|.'],
  traps: ['Using a shadow price beyond its allowable range.', 'Combining two changes.'] },

{ id: 'dual', slot: 'L2 · theory', title: 'The dual problem', topic: 'sens', tpls: ['s_dual'],
  know: note('Rule:', 'primal max cᵀx, Ax ≤ b, x ≥ 0 ⇔ dual <b>min bᵀy, Aᵀy ≥ c, y ≥ 0</b>. One dual variable per primal constraint, one dual constraint per primal variable (transpose A).') +
    note('Strong duality:', 'optimal values are equal; the optimal dual values are the primal shadow prices.') +
    note('Interpretation (Dakota):', 'y<sub>i</sub> = the price an entrepreneur would pay per unit of resource i to buy all of the firm\'s resources; the dual constraints say no product is worth more than its resources.'),
  traps: ['Not transposing A.', 'Keeping max in the dual.'] },

{ id: 'network', slot: 'L3 · modelling', title: 'Network models: transportation, transshipment, assignment', topic: 'net', tpls: ['n_trans', 'n_ship', 'n_assign'],
  know: T(['Model', 'Variables', 'Constraints'], [['Transportation (P&P, P&T)', 'x<sub>ij</sub> = amount from source i to destination j', 'Σ<sub>j</sub> x<sub>ij</sub> ≤ s<sub>i</sub> (supply), Σ<sub>i</sub> x<sub>ij</sub> ≥ d<sub>j</sub> or = d<sub>j</sub> (demand), x ≥ 0'], ['Transshipment (Ryan Electronics)', 'flows on every arc', 'sources ≤ supply; <b>transshipment nodes: flow in − flow out = 0</b>; destinations ≥ demand'], ['Assignment (swim team)', 'x<sub>ij</sub> = 1 if agent i does task j', 'Σ<sub>j</sub> x<sub>ij</sub> ≤ 1 (= 1) per agent; Σ<sub>i</sub> x<sub>ij</sub> = 1 per task; LP solution is automatically 0/1']]) +
    note('Network ↔ LP:', '<b>arc = decision variable, node = constraint</b>, objective = Σ arc cost × flow. Variations: max profit, route capacities (x<sub>ij</sub> ≤ u<sub>ij</sub>), forbidden routes (remove the variable or a huge cost), unbalanced supply/demand (≤ on the larger side).'),
  traps: ['Supply as ≥ (forces shipping everything).', 'Forgetting flow balance at transshipment nodes.'] },

{ id: 'milp', slot: 'L4 · modelling', title: 'Integer and binary models: the 0-1 tricks', topic: 'milp', tpls: ['m_logic', 'm_budget', 'm_fixed', 'm_relax'],
  know: T(['Rule in words', 'Constraint'], [['at most k of the projects', 'Σ x<sub>j</sub> ≤ k'], ['at least k', 'Σ x<sub>j</sub> ≥ k'], ['exactly one of A, B', 'x<sub>A</sub> + x<sub>B</sub> = 1'], ['A and B mutually exclusive', 'x<sub>A</sub> + x<sub>B</sub> ≤ 1'], ['A only if B (conditional)', 'x<sub>A</sub> ≤ x<sub>B</sub>'], ['A only if B and C', 'x<sub>A</sub> ≤ x<sub>B</sub>, x<sub>A</sub> ≤ x<sub>C</sub>'], ['A and B together or not at all', 'x<sub>A</sub> = x<sub>B</sub>'], ['fixed (set-up) cost f if product made', 'x ≤ M·y, −f·y in the objective, y binary'], ['minimum batch L if made at all', 'L·y ≤ x ≤ M·y']]) +
    note('Choosing M:', 'at least the largest feasible x (from the resource limits) but as small as possible (tighter LP relaxation, faster B&B).') +
    note('LP relaxation:', 'drop the integrality constraints. For a max problem it gives an <b>upper bound</b>. Rounding its solution can be infeasible or sub-optimal.') +
    note('Branch and bound:', 'solve the relaxation; if a variable is fractional (v), branch into x ≤ ⌊v⌋ and x ≥ ⌈v⌉; prune branches whose bound is worse than the best integer solution. Exponential worst case → MILP is much harder than LP.') +
    note('Check a logical constraint:', 'every allowed combination stays feasible and every forbidden one becomes infeasible (slide 25).'),
  traps: ['Conditional written the wrong way round.', 'x ≥ M·y (forces production).', 'Forgetting to declare variables int/bin in Solver.'] },

{ id: 'nlp', slot: 'L6 · modelling + theory', title: 'Non-linear programming, convexity, Markowitz', topic: 'nlp', tpls: ['p_markowitz'],
  know: note('Sources of non-linearity:', 'price depending on quantity (revenue x(ax + b)), distances (location problem), variance of a portfolio, products of variables.') +
    note('Local vs global:', 'GRG Nonlinear (gradient search) may stop at a local optimum → try several starting points / multistart, or evolutionary algorithms.') +
    note('Convex/concave NLP:', 'maximise a concave (minimise a convex) objective over a convex feasible region → <b>every local optimum is global</b>. A set {x : g(x) ≤ b} is convex if g is convex ({g(x) ≥ b} if g is concave). Linear functions are both.') +
    note('NLP optimum can be anywhere:', 'interior, on an edge or at a corner (unlike LP).') +
    note('Markowitz (scenario-based, Hauck Financial):', 'portfolio return in scenario s: r<sub>s</sub> = Σ x<sub>i</sub> r<sub>i,s</sub>; mean r̄ = average over scenarios; variance = (1/S) Σ (r<sub>s</sub> − r̄)²; min variance s.t. r̄ ≥ R, Σx = 1, x ≥ 0 — a convex quadratic program. Two assets: min-variance share in A = (Var B − Cov) / (Var A + Var B − 2 Cov).') +
    note('Shadow prices in NLP', 'are only valid locally (the rate changes as the RHS changes).'),
  traps: ['Calling a model linear because the constraints are linear (one non-linear term makes it NLP).'] },

{ id: 'mop', slot: 'L7 · theory', title: 'Multi-objective programming', topic: 'mop', tpls: ['o_pareto'],
  know: note('Efficient (Pareto-optimal):', 'no other feasible solution is at least as good in all objectives and strictly better in one. Usually there is no single solution optimising all objectives, so you look at the efficient set.') +
    note('Decision space vs objective space:', 'the same solutions plotted by their variables vs by their objective values.') +
    note('Weighted sum:', 'max Σ w<sub>i</sub> f<sub>i</sub>(x) with w &gt; 0. Every solution found is efficient. Drawbacks: unsupported efficient solutions (in non-convex parts of the frontier) are never found; result depends on the objectives\' scales; even weight steps do not give evenly spread solutions.') +
    note('Goal programming:', 'set a goal for each objective in priority order and minimise deviations from the most important first.'),
  traps: ['Calling a solution efficient only because it is best in one objective when another solution ties it there and beats it elsewhere.'] },

{ id: 'theory', slot: 'Theory', title: 'Terminology checklist (quiz-style questions)', topic: 'theory', tpls: ['t_lp', 't_net', 't_nlp', 't_written'],
  know: '<ul><li>Decision variable, parameter, objective, constraint, feasible region, extreme point, binding, redundant, slack, surplus.</li><li>Infeasible, unbounded, alternative optima.</li><li>Shadow price, reduced cost, range of optimality, range of feasibility, dual, strong duality.</li><li>Arc/node ↔ variable/constraint, flow balance, total unimodularity (assignment LP is integral).</li><li>ILP, MILP, BLP, LP relaxation, branch and bound, big-M.</li><li>Convex set/function, concave function, local vs global optimum, GRG, multistart, evolutionary algorithm.</li><li>Efficient solution, dominance, weighted sum, goal programming.</li><li>Software (L5): the same model in Python with PuLP/Gurobi: sets/indices, parameters, variables, constraints in loops.</li><li>Application articles: which model type fits (Chevron, Walmart, McDonald\'s China, Denver school buses, BMW, offshore wind).</li></ul>' }
];
})(typeof window !== 'undefined' ? window : globalThis);
