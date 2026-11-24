/* BA1 flashcards: [Study Hall page id, front, back]. */
(function (G) {
'use strict';
const XM = G.XM; XM.cards = XM.cards || {};
XM.cards.ba1 = [
['overview', `Order of writing any optimisation model?`, `Indices → parameters → decision variables → objective → constraints → variable types.`],

['lp-model', `When is a model an LP?`, `The objective and all constraints are <b>linear</b> in the decision variables: no x·y, x², x/y, max or abs.`],
['lp-model', `Linearise "at least 30 % of production is x" (products x, y).`, `x ≥ 0.3(x + y) → <b>0.7x − 0.3y ≥ 0</b>.`],
['lp-model', `What is standard form?`, `All constraints are equalities, using slack (≤) and surplus (≥) variables; all variables ≥ 0.`],
['lp-model', `What is an auxiliary variable?`, `A variable that is not the decision itself but makes the model easier, e.g. inventory carried between weeks.`],
['lp-model', `Spreadsheet: how do you write the objective and each constraint?`, `SUMPRODUCT(coefficients, variable cells), compared with an RHS cell. Solver: Simplex LP + non-negativity.`],

['graphical', `Extreme point theorem?`, `If an LP has an optimum, at least one <b>extreme point</b> (corner) of the feasible region is optimal.`],
['graphical', `Binding vs redundant constraint?`, `Binding: holds with equality at the optimum. Redundant: removing it does not change the feasible region.`],
['graphical', `When do alternative optima occur?`, `The objective line is parallel to a binding edge of the feasible region.`],
['graphical', `Infeasible vs unbounded?`, `Infeasible: the feasible region is empty. Unbounded: the objective can improve forever inside the region.`],

['sensitivity', `Shadow price?`, `Change in the optimal objective per unit increase of a constraint's RHS: ΔZ = shadow price × ΔRHS, valid within the allowable range.`],
['sensitivity', `Reduced cost of a variable at 0?`, `How much its objective coefficient must improve before it enters the solution (= change in objective per unit forced in). 0 for variables in the solution.`],
['sensitivity', `Range of optimality?`, `The objective coefficient can move within its allowable increase/decrease and the <b>solution</b> stays the same (the objective value changes).`],
['sensitivity', `Range of feasibility?`, `The RHS range within which the shadow price stays valid.`],
['sensitivity', `Shadow price of a non-binding constraint?`, `0. Its slack = RHS − final value.`],
['sensitivity', `What does 1E+30 mean in the report?`, `Infinity.`],
['sensitivity', `Two changes at once, or a change outside the allowable range?`, `The report does not cover it: re-solve.`],

['dual', `Dual of max cᵀx, Ax ≤ b, x ≥ 0?`, `min bᵀy, Aᵀy ≥ c, y ≥ 0. One dual variable per primal constraint, one dual constraint per primal variable.`],
['dual', `Strong duality?`, `The optimal primal and dual objective values are equal; the optimal dual values are the primal <b>shadow prices</b>.`],
['dual', `Interpret the dual variable yᵢ (Dakota).`, `The price per unit of resource i an entrepreneur would pay to buy all the firm's resources.`],

['network', `Network ↔ LP: what are arcs and nodes?`, `Arc = decision variable (flow). Node = constraint. Objective = Σ arc cost × flow.`],
['network', `Transportation model constraints?`, `Σⱼ xᵢⱼ ≤ sᵢ (supply), Σᵢ xᵢⱼ ≥ dⱼ (demand), x ≥ 0.`],
['network', `Transshipment node constraint?`, `Flow in − flow out = 0.`],
['network', `Why is the assignment LP automatically 0/1?`, `Total unimodularity of the constraint matrix: the LP optimum is integral.`],

['milp', `At most k projects, at least k?`, `Σ xⱼ ≤ k · Σ xⱼ ≥ k.`],
['milp', `A only if B?`, `x<sub>A</sub> ≤ x<sub>B</sub>.`],
['milp', `A and B mutually exclusive; exactly one of A, B?`, `x<sub>A</sub> + x<sub>B</sub> ≤ 1 · x<sub>A</sub> + x<sub>B</sub> = 1.`],
['milp', `Fixed set-up cost f if a product is made?`, `x ≤ M·y, −f·y in the objective, y binary.`],
['milp', `Minimum batch L if the product is made at all?`, `L·y ≤ x ≤ M·y.`],
['milp', `How do you choose big-M?`, `At least the largest feasible x, but as small as possible (tighter LP relaxation, faster branch and bound).`],
['milp', `LP relaxation of a max problem gives what?`, `An <b>upper bound</b>. Rounding its solution can be infeasible or sub-optimal.`],
['milp', `Branch and bound in one sentence?`, `Solve the relaxation; for a fractional v branch on x ≤ ⌊v⌋ and x ≥ ⌈v⌉; prune branches whose bound is worse than the best integer solution.`],

['nlp', `When is every local optimum of an NLP global?`, `Maximising a <b>concave</b> (or minimising a convex) objective over a convex feasible region.`],
['nlp', `GRG Nonlinear may stop where, and what do you do?`, `At a local optimum. Use several starting points (multistart) or an evolutionary algorithm.`],
['nlp', `Where can an NLP optimum lie?`, `Anywhere: interior, on an edge or at a corner (unlike LP).`],
['nlp', `Markowitz model?`, `Minimise portfolio variance s.t. mean return ≥ R, Σx = 1, x ≥ 0: a convex quadratic program.`],

['mop', `Efficient (Pareto-optimal) solution?`, `No other feasible solution is at least as good in all objectives and strictly better in one.`],
['mop', `Drawbacks of the weighted-sum method?`, `It never finds unsupported efficient solutions (non-convex parts of the frontier); results depend on scales; even weight steps do not spread solutions evenly.`],
['mop', `Goal programming?`, `Set a goal for each objective in priority order and minimise deviations from the most important first.`],
];
})(typeof window !== 'undefined' ? window : globalThis);
