/* TU-A1300 Midterm 2 Study Hall — follows the Feb 2026 paper (Q1–Q11) and the formula sheet.
   Running example: Leipiintynyt Oy (19.2.2026); all numbers below were checked by the app's model. */
(function (G) {
'use strict';
const XM = G.XM; XM.study = XM.study || {};
const T = (head, rows) => `<div class="xm-tw"><table><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
const note = (t, b) => `<div class="xm-note"><b>${t}</b> ${b}</div>`;

XM.study.iem = [
{ id: 'overview', slot: 'Start here', title: 'How Midterm 2 works (and the Excel rules)', intro: 'Wed 9.12.2026, 17:00–19:00. <b>Own laptop + Excel template, 25 points, at least 10 to pass.</b> One company case: accounting (Q1–Q5) and an investment (Q6–Q11).',
  asks: ['Feb 2026 questions and points: Q1 critical sales price (2) · Q2 financial assets, opening (1) · Q3 net income (2) · Q4 total equity & liabilities, closing (4) · Q5 ROE, opening (2) · Q6 gross margin-% of the new product (2) · Q7 operating margin, year 3 (2) · Q8 discount factor, year 3 (1) · Q9 FCF, year 2 (2) · Q10 NPV (4) · Q11 NPV with the alternative (3).'],
  know: T(['Colour', 'Rule'], [['<span style="background:#fff3b0;color:#222;padding:0 6px">yellow</span>', 'given data only: type the numbers from the paper here once'], ['<span style="background:#dbe9ff;color:#222;padding:0 6px">blue</span>', '<b>formulas only</b>, no typed numbers (refer to yellow cells)'], ['<span style="background:#d9f5df;color:#222;padding:0 6px">green</span>', 'answers, as formulas']]) +
    note('Allowed:', 'the paper formula sheet and the <b>unedited</b> MyCourses PDFs (download them beforehand). No own files, no AI. Save as <code>Midterm2_&lt;studentnumber&gt;.xlsx</code>, submit, then download again and check it opens.'),
  method: ['Type every given number into yellow cells first (10 min).', 'Build the income statement, then the closing balance (check it balances), then the investment table.', 'Point each green answer at the right blue cell.', 'Save often; at the end download the submitted file and open it.'],
  traps: ['Typing a number into a blue cell (lost marks even if correct).', 'Running out of time on Q4 (4 p): build the balance sheet systematically.'] },

{ id: 'income', slot: 'Q3 · 2 p', title: 'Income statement: from revenue to net profit', topic: 'acc', tpls: ['stmt', 'case'],
  know: T(['Line', 'How (course convention)', 'Feb 2026'], [['Revenue', 'units <b>sold</b> × price', '94 000 × 6.60 = 620 400'], ['− Cost of goods sold', 'units <b>sold</b> × material cost', '94 000 × 2.60 = 244 400'], ['= Gross margin', '', '376 000'], ['− Other operating expenses', 'given (wages, rent, maintenance)', '270 000'], ['= EBITDA', '', '106 000'], ['− Depreciation', 'given (old investments)', '35 000'], ['= EBIT (operating profit)', '', '71 000'], ['− Interest', 'rate × <b>opening</b> interest-bearing debt (LT + ST); payables carry no interest; loans changed at year end do not affect this year', '5 % × 114 000 = 5 700'], ['= EBT', '', '65 300'], ['− Taxes', 'tax % × EBT', '20 % → 13 060'], ['= Net profit', '', '<b>52 240</b>']]),
  method: ['Units: bought ≠ produced ≠ sold. Revenue and COGS use <b>sold</b>.', 'Interest on opening LT + ST debt.', 'Tax on EBT.'],
  traps: ['COGS from units bought or produced.', 'Interest on accounts payable.', 'Interest on the new loan taken at year end.'] },

{ id: 'balance', slot: 'Q2, Q4 · 5 p', title: 'Balance sheet: roll the opening balance forward', topic: 'acc', tpls: ['bal', 'case'],
  know: T(['Closing item', 'Formula', 'Feb 2026'], [['Machinery & equipment', 'opening − depreciation + investments', '300 000 − 35 000 + 12 000 = 277 000'], ['Raw materials', 'opening + (bought − produced) × material cost', '10 500 + (92 000 − 93 000)·2.60 = 7 900'], ['Finished goods', 'opening + (produced − sold) × material cost', '4 900 + (93 000 − 94 000)·2.60 = 2 300'], ['Accounts receivable', 'given', '3 000'], ['Cash', 'opening cash + change in cash (cash-flow statement) — or the balancing item', '134 040'], ['Shareholders\' capital', 'unchanged unless stated', '200 000'], ['Retained earnings', 'opening RE + <b>last year\'s profit</b> − dividends', '12 500 + 45 000 − 27 000 = 30 500'], ['Profit for the year', 'net profit', '52 240'], ['Long-term debt', 'opening − repaid + new loans', '72 000 − 8 000 + 25 000 = 89 000'], ['Short-term debt', 'given', '43 000'], ['Accounts payable', 'given', '9 500'], ['<b>Total equity & liabilities</b>', 'sum', '<b>424 240</b>']]) +
    note('Q2 Financial assets', '= accounts receivable + cash = 4 100 + 61 500 = <b>65 600</b> (opening).') +
    note('Working capital', '= inventories + receivables − payables (opening 10 000, closing 3 700).'),
  method: ['Equity side first (it gives the total for Q4).', 'Assets side, with cash from the cash-flow statement: the two totals must match. If not, find the error before moving on.'],
  traps: ['Adding this year\'s profit into retained earnings (it moves there next year).', 'Forgetting one of the two loan changes (repaid early <b>and</b> new loan).'] },

{ id: 'cashflow', slot: 'Q4 check', title: 'Cash-flow statement (and why cash balances the sheet)', topic: 'acc', tpls: ['bal'],
  know: T(['Part', 'Formula (formula sheet)', 'Feb 2026'], [['Operations', 'EBITDA + WC opening − WC closing − interest − taxes', '106 000 + 10 000 − 3 700 − 5 700 − 13 060 = 93 540'], ['Investments', 'FA opening − FA closing − depreciation', '300 000 − 277 000 − 35 000 = −12 000'], ['Financing', 'SC close − SC open − dividends + total debt close − total debt open', '0 − 27 000 + 132 000 − 114 000 = −9 000'], ['Change in cash', 'sum', '72 540 → cash 61 500 + 72 540 = 134 040']]),
  traps: ['Sign errors: an investment is a negative investment cash flow.'] },

{ id: 'ratios', slot: 'Q5 · 2 p', title: 'Key figures: ROE, ROCE, equity ratio, gearing, liquidity', topic: 'ratio', tpls: ['ratios'],
  know: T(['Ratio', 'Formula sheet', 'Note'], [['ROE', 'net profit / equity', 'use the <b>average</b> of opening and closing unless the question says "in the opening balance" (Feb 2026 Q5: 45 000 / 257 500 = <b>17.48 %</b>)'], ['ROCE', 'EBIT / (assets − accounts payable)', 'averages'], ['Operating margin', 'EBIT / revenue', ''], ['EBITDA-%', 'EBITDA / revenue', ''], ['Gross margin-%', '(price − material cost) / price', 'per product'], ['Equity ratio', 'equity / (equity + debt)', 'debt incl. payables = balance-sheet total'], ['Debt-to-equity', 'debt / equity', ''], ['Gearing', '(debt − accounts payable − cash) / equity', ''], ['Quick ratio', 'financial assets / current liabilities', 'decimal number'], ['Current ratio', 'current assets / current liabilities', 'decimal number']]),
  traps: ['Average vs opening: read the question.', 'Percent vs decimal: profitability ratios as %, liquidity as decimals.'] },

{ id: 'cvp', slot: 'Q1 · 2 p', title: 'Cost-volume-profit: critical sales price and quantity', topic: 'acc', tpls: ['case'],
  know: note('Critical sales price', '= fixed costs / units sold + material cost per unit. Fixed costs = <b>other operating expenses</b> (EBITDA break-even, as in the course reading). Feb 2026: 270 000 / 94 000 + 2.60 = <b>5.47 €</b>.') +
    note('Critical sales quantity', '= fixed costs / (price − material cost) (break-even volume).') +
    note('Contribution margin', '= price − variable cost per unit; CM-% = CM / price.'),
  traps: ['Dividing by units produced or bought.'] },

{ id: 'invest', slot: 'Q6–Q10 · 11 p', title: 'Investment: FCF, discount factors, NPV', topic: 'inv', tpls: ['invest', 'df', 'case'],
  know: T(['Item', 'Formula', 'Feb 2026 (truck in Hervanta)'], [['Units year t', 'units₁ × (1 + g)<sup>t−1</sup>', '30 000; 31 200; 32 448'], ['Revenue − material − opex = EBITDA', 'units × (p − m) − opex', 'p 6.90, m 2.95, opex 100 000'], ['Depreciation', 'investment / 3 (straight line, salvage 0)', '16 666.67'], ['EBIT', 'EBITDA − depreciation', 'yr 3: 11 502.93 → Q7 operating margin 11 502.93/223 891.20 = <b>5.14 %</b>'], ['FCF', 'EBIT × (1 − tax) + depreciation (no working-capital change here)', 'yr 2: <b>21 925.33</b> (Q9)'], ['Discount factor', '1 / (1 + r)<sup>t</sup>', 'r 9 %: yr 3 = <b>0.7722</b> (Q8)'], ['NPV', '−I₀ + Σ FCF<sub>t</sub> × DF<sub>t</sub>', '−50 000 + 16 636 + 18 454 + 19 976 = <b>5 065.82</b> (Q10)']]) +
    note('Q6 gross margin-% of the new product', '= (6.90 − 2.95) / 6.90 = <b>57.25 %</b>.') +
    note('Why add back depreciation and not deduct interest?', 'depreciation is not a cash outflow (only its tax effect matters); financing costs are in the discount rate.'),
  method: ['One column per year 0–3; rows: units, revenue, material, opex, EBITDA, depreciation, EBIT, tax, FCF, DF, PV.', 'Year 0: −investment; NPV = sum of PVs.'],
  traps: ['Growth applied from year 1 (year 1 is the base).', 'Deducting interest in FCF.', 'Discounting year 0.'] },

{ id: 'alt', slot: 'Q11 · 3 p', title: 'Alternative scenario: cannibalisation and incremental NPV', topic: 'alt', tpls: ['cannib'],
  know: note('Feb 2026 Q11:', '"What is the NPV of expanding to Tampere when taking into account the opportunity to invest in both a food truck and a campus sales point?" → compute the <b>combined</b> project: truck with sales × (1 − 20 %) + campus outlet (investment 35 000, opex 50 000, 30 000 units growing 4 %), both at t = 0 investments, same price/cost/tax/rate. Answer <b>74 025.79 €</b>.') +
    note('Incremental thinking:', 'count every cash flow that changes because of the decision, including lost sales of the existing unit (cannibalisation) and synergy savings; ignore sunk costs.'),
  method: ['Recompute the truck with reduced units.', 'Compute the campus outlet like any investment.', 'Add both NPVs (both investments at t = 0).', 'If asked "is it worth it", compare with the truck-alone NPV (5 065.82).'],
  traps: ['Applying the 20 % to the campus instead of the truck.', 'Forgetting the second investment.'] },

{ id: 'written', slot: 'Written parts', title: 'Concepts for written answers: IRR, payback, sunk & opportunity cost, sensitivity', topic: 'theory', tpls: ['written'],
  know: T(['Concept', 'Exam-ready explanation'], [['IRR', 'the discount rate at which NPV = 0; accept if IRR &gt; required return. Can mislead with different project sizes or several sign changes; NPV is the primary criterion.'], ['(Discounted) payback', 'time until cumulative (discounted) FCF covers the investment; simple, liquidity/risk proxy, ignores later cash flows.'], ['Sunk cost', 'already spent, unrecoverable: ignore.'], ['Opportunity cost', 'value of the best alternative use of a resource: include.'], ['Sensitivity / scenario analysis', 'vary one input (volume, price, cost, rate) and watch NPV; critical value where NPV = 0; best/base/worst scenarios.'], ['WACC / required return', 'the discount rate; reflects the cost of equity and debt.']]) }
];
})(typeof window !== 'undefined' ? window : globalThis);
