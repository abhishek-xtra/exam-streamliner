/* TU-A1300 Midterm 2 flashcards: [Study Hall page id, front, back]. Numbers follow the Feb 2026 case. */
(function (G) {
'use strict';
const XM = G.XM; XM.cards = XM.cards || {};
XM.cards.iem = [
['overview', `Excel template: what goes in yellow, blue and green cells?`, `Yellow: given data only. Blue: <b>formulas only</b>, no typed numbers. Green: answers, as formulas.`],
['overview', `How many points, and how many to pass Midterm 2?`, `25 points, at least <b>10</b> to pass.`],

['income', `Income statement lines from revenue to net profit?`, `Revenue − COGS = gross margin − other opex = EBITDA − depreciation = EBIT − interest = EBT − taxes = net profit.`],
['income', `Revenue and COGS use units bought, produced or sold?`, `Units <b>sold</b>.`],
['income', `Interest expense is computed on what?`, `Rate × <b>opening</b> interest-bearing debt (LT + ST). Payables carry no interest; loans changed at year end do not count this year.`],
['income', `Taxes are computed on what?`, `Tax % × EBT.`],

['balance', `Closing machinery & equipment?`, `Opening − depreciation + investments.`],
['balance', `Closing raw materials inventory?`, `Opening + (bought − produced) × material cost.`],
['balance', `Closing finished goods inventory?`, `Opening + (produced − sold) × material cost.`],
['balance', `Closing retained earnings?`, `Opening RE + <b>last year's</b> profit − dividends. This year's profit stays on its own line.`],
['balance', `Closing long-term debt?`, `Opening − repaid + new loans.`],
['balance', `Financial assets?`, `Accounts receivable + cash.`],
['balance', `Working capital (course definition)?`, `Inventories + receivables − payables.`],

['cashflow', `Cash flow from operations (formula sheet)?`, `EBITDA + WC opening − WC closing − interest − taxes.`],
['cashflow', `Cash flow from investments?`, `FA opening − FA closing − depreciation (an investment gives a negative number).`],
['cashflow', `Cash flow from financing?`, `SC close − SC open − dividends + total debt close − total debt open.`],

['ratios', `ROE: formula and which equity?`, `Net profit / equity, using the <b>average</b> of opening and closing unless the question says "in the opening balance".`],
['ratios', `ROCE?`, `EBIT / (assets − accounts payable), with averages.`],
['ratios', `Equity ratio?`, `Equity / (equity + debt), with debt incl. payables = balance-sheet total.`],
['ratios', `Gearing?`, `(Debt − accounts payable − cash) / equity.`],
['ratios', `Quick ratio and current ratio?`, `Quick = financial assets / current liabilities. Current = current assets / current liabilities. Give both as decimals.`],
['ratios', `Gross margin-% of a product?`, `(Price − material cost) / price.`],

['cvp', `Critical sales price?`, `Fixed costs / units sold + material cost per unit (fixed costs = other operating expenses).`],
['cvp', `Critical sales quantity (break-even volume)?`, `Fixed costs / (price − material cost).`],
['cvp', `Contribution margin and CM-%?`, `CM = price − variable cost per unit. CM-% = CM / price.`],

['invest', `Units in year t with growth g?`, `Units₁ × (1 + g)<sup>t−1</sup>. Year 1 is the base.`],
['invest', `Free cash flow in the investment table?`, `FCF = EBIT × (1 − tax) + depreciation (no working-capital change in the Feb 2026 case).`],
['invest', `Why add back depreciation and not deduct interest in FCF?`, `Depreciation is not a cash outflow (only its tax effect counts). Financing costs are in the discount rate.`],
['invest', `Discount factor for year t?`, `1 / (1 + r)<sup>t</sup>. Year 0 is not discounted.`],
['invest', `NPV?`, `−I₀ + Σ FCF<sub>t</sub> × DF<sub>t</sub>.`],
['invest', `Depreciation of a 3-year investment with zero salvage?`, `Straight line: investment / 3 per year.`],

['alt', `What is cannibalisation in an investment case?`, `Lost sales of an existing unit caused by the new one. Count it as an incremental (negative) cash flow.`],
['alt', `Feb 2026 Q11: what changes when the campus outlet is added?`, `The truck's sales fall 20 %, and the campus outlet is computed as its own investment. Add both NPVs (both invested at t = 0).`],

['written', `Define IRR and its weakness.`, `The discount rate at which NPV = 0; accept if IRR &gt; required return. Can mislead with different project sizes or several sign changes, so NPV is primary.`],
['written', `(Discounted) payback?`, `Time until cumulative (discounted) FCF covers the investment. Simple risk/liquidity proxy; ignores later cash flows.`],
['written', `Sunk cost vs opportunity cost?`, `Sunk: already spent and unrecoverable, so ignore it. Opportunity: value of the best alternative use, so include it.`],
['written', `Sensitivity analysis?`, `Vary one input (volume, price, cost, rate) and watch NPV; the critical value is where NPV = 0.`],
];
})(typeof window !== 'undefined' ? window : globalThis);
