/* TU-A1300 Introduction to Industrial Engineering and Management — Midterm 2, Wed 9.12.2026 17–19 (moved from 2.12).
   Own laptop + Excel template, 25 p (min 10). Same structure as the Feb 2026 Midterm 2: a company case
   with an opening balance and a year of events (Q1–Q5), then an expansion investment (Q6–Q10) and an
   alternative scenario with cannibalisation (Q11). Formulas exactly as on "TU-A1300 Formulas.pdf" and as
   implemented in the course's Excel examples (Kiukaisten Kiuas, KitchenWidget):
   COGS = units sold × material cost; inventories at material cost, rolled forward by (bought − produced)
   and (produced − sold); interest = rate × opening interest-bearing debt (loans changed at year end);
   critical sales price = other operating expenses / units sold + material cost; ROE "in the opening
   balance" = opening profit / opening equity; FCF = EBIT(1 − t) + depreciation (no working-capital change). */
(function (G) {
'use strict';
const XM = G.XM, L = XM.lib, h = L.esc;
const mc = (label, prompt, correct, wrongs, points, why) => ({ type: 'mcq', label, prompt, options: [correct].concat(wrongs), answer: 0, points: points || 1, why });
const wr = (label, prompt, points, model, rubric) => ({ type: 'written', label, prompt, points, model, rubric });
const E = (x, d) => L.num(x, d === undefined ? 2 : d) + ' €';
const P = x => L.num(x * 100, 2) + ' %';

/* ---------- the accounting model ---------- */
function compute(c) {
  const R = {}, o = c.open;
  R.revenue = c.sold * c.price; R.cogs = c.sold * c.mat; R.gm = R.revenue - R.cogs; R.ebitda = R.gm - c.opex;
  R.ebit = R.ebitda - c.dep; R.debtOpen = o.lt + o.st; R.interest = c.rate * R.debtOpen; R.ebt = R.ebit - R.interest;
  R.tax = c.tax * R.ebt; R.np = R.ebt - R.tax;
  R.equityOpen = o.sc + o.re + o.profit; R.totalOpen = o.mach + o.raw + o.fin + o.ar + o.cash;
  R.critPrice = c.opex / c.sold + c.mat; R.critQty = c.opex / (c.price - c.mat);
  R.finOpen = o.ar + o.cash; R.roeOpen = o.profit / R.equityOpen;
  // closing balance
  R.mach = o.mach - c.dep + c.invest; R.raw = o.raw + (c.bought - c.produced) * c.mat; R.fin = o.fin + (c.produced - c.sold) * c.mat; R.ar = c.arClose;
  R.reClose = o.re + o.profit - c.div; R.lt = o.lt - c.repay + c.newloan; R.st = c.stClose; R.ap = c.apClose; R.debtClose = R.lt + R.st;
  R.equityClose = o.sc + R.reClose + R.np; R.totalClose = R.equityClose + R.lt + R.st + R.ap;
  R.wcOpen = o.raw + o.fin + o.ar - o.ap; R.wcClose = R.raw + R.fin + R.ar - R.ap;
  R.cfo = R.ebitda + R.wcOpen - R.wcClose - R.interest - R.tax; R.cfi = o.mach - R.mach - c.dep; R.cff = 0 - c.div + R.debtClose - R.debtOpen;
  R.dcash = R.cfo + R.cfi + R.cff; R.cash = o.cash + R.dcash;
  R.check = R.totalClose - (R.mach + R.raw + R.fin + R.ar + R.cash);
  R.roeAvg = R.np / ((R.equityOpen + R.equityClose) / 2);
  R.roceAvg = R.ebit / (((R.totalOpen - o.ap) + (R.totalClose - R.ap)) / 2);
  R.equityRatio = R.equityClose / R.totalClose; R.de = (R.debtClose + R.ap) / R.equityClose; R.gearing = (R.debtClose - R.cash) / R.equityClose;
  R.quick = (R.ar + R.cash) / (R.st + R.ap); R.current = (R.raw + R.fin + R.ar + R.cash) / (R.st + R.ap);
  R.ebitdaPct = R.ebitda / R.revenue; R.opMargin = R.ebit / R.revenue;
  // investment
  const x = c.exp, yrs = [1, 2, 3], dep = x.inv / 3;
  const proj = (units1, opex, invest, scale) => yrs.map(t => { const u = units1 * Math.pow(1 + x.growth, t - 1) * (scale || 1), rev = u * x.price, mat = u * x.mat, ebitda = rev - mat - opex, d = invest / 3, ebit = ebitda - d, fcf = ebit * (1 - c.tax) + d, df = 1 / Math.pow(1 + x.rrr, t);
    return { t, u, rev, mat, gm: rev - mat, opex, ebitda, dep: d, ebit, taxx: ebit * c.tax, fcf, df, pv: fcf * df }; });
  R.inv = proj(x.units1, x.opex, x.inv); R.npv = -x.inv + L.sum(R.inv.map(y => y.pv));
  R.gmPctNew = (x.price - x.mat) / x.price; R.opMargin3 = R.inv[2].ebit / R.inv[2].rev; R.df3 = 1 / Math.pow(1 + x.rrr, 3); R.fcf2 = R.inv[1].fcf;
  R.invCut = proj(x.units1, x.opex, x.inv, 1 - x.campus.cannib); R.campus = proj(x.campus.units1, x.campus.opex, x.campus.inv);
  R.npvBoth = -x.inv - x.campus.inv + L.sum(R.invCut.map(y => y.pv)) + L.sum(R.campus.map(y => y.pv));
  R.npvCampusIncr = R.npvBoth - R.npv; R.dep = dep;
  return R;
}
XM.IEM = { compute };

/* ---------- random case ---------- */
const BIZ = [['Leipiintynyt Oy', 'lunch sandwich', 'food truck'], ['Keittokeidas Oy', 'soup bowl', 'soup kitchen van'], ['Pizzapaja Oy', 'slice of pizza', 'pizza truck'], ['Smoothie Saari Oy', 'smoothie', 'juice bar trailer'],
  ['Burgerbussi Oy', 'burger', 'burger bus'], ['Kahvikärry Oy', 'coffee + pastry', 'coffee cart'], ['Rullakebab Oy', 'kebab wrap', 'kebab truck'], ['Poke Pointti Oy', 'poke bowl', 'poke stand']];
const CITY = [['Hervanta (Tampere)', 'Tampere University\'s central campus'], ['Linnanmaa (Oulu)', 'Oulu city centre campus'], ['Kupittaa (Turku)', 'Turku university hill'], ['Ylistönrinne (Jyväskylä)', 'Jyväskylä Seminaarinmäki campus'], ['Skinnarila (Lappeenranta)', 'LUT city campus']];
function randCase(r) {
  for (let tries = 0; tries < 300; tries++) {
    const [name, prod, unit] = r.pick(BIZ), [loc, campusLoc] = r.pick(CITY);
    const price = r.step(4.5, 12, .1), mat = L.round(price * r.pick([.3, .35, .4, .45]), 2), sold = r.step(40000, 140000, 1000);
    const produced = sold + r.pick([-3, -2, -1, 1, 2]) * 1000, bought = produced + r.pick([-2, -1, 1, 2]) * 1000;
    const opex = r.step(120000, 400000, 10000), dep = r.step(15000, 60000, 1000);
    const o = { mach: r.step(150000, 450000, 10000), raw: r.step(6000, 20000, 100), fin: r.step(3000, 12000, 100), ar: r.step(2000, 9000, 100), cash: r.step(20000, 90000, 500), sc: r.step(80000, 250000, 10000), profit: r.step(15000, 70000, 500), lt: r.step(40000, 150000, 1000), st: r.step(15000, 60000, 1000), ap: r.step(4000, 15000, 500) };
    o.re = o.mach + o.raw + o.fin + o.ar + o.cash - o.sc - o.profit - o.lt - o.st - o.ap; if (o.re < 2000 || o.re > 150000) continue;
    if (o.raw + (bought - produced) * mat < 1000 || o.fin + (produced - sold) * mat < 500) continue;
    const c = { name, prod, unit, loc, campusLoc, price, mat, sold, produced, bought, opex, dep, tax: .2, rate: r.pick([.04, .05, .06]), open: o,
      invest: r.step(5000, 40000, 1000), div: r.step(5000, Math.max(6000, Math.round(o.profit * .8 / 1000) * 1000), 1000), repay: r.step(4000, 20000, 1000), newloan: r.step(0, 40000, 5000), stClose: o.st + r.pick([-3, -2, -1, 1, 2, 3]) * 1000, arClose: r.step(2000, 9000, 100), apClose: o.ap + r.pick([-1, 0, 1]) * 500,
      exp: { price: L.round(price + r.pick([.2, .3, .4, .5]), 2), mat: L.round(mat + r.pick([.25, .35, .45]), 2), inv: r.step(40000, 90000, 5000), opex: r.step(60000, 140000, 5000), units1: r.step(25000, 50000, 1000), growth: r.pick([.02, .03, .04, .05]), rrr: r.pick([.07, .08, .09, .1, .12]),
        campus: { inv: r.step(20000, 50000, 5000), units1: r.step(20000, 40000, 1000), opex: r.step(30000, 70000, 5000), cannib: r.pick([.1, .15, .2, .25]) } } };
    const R = compute(c); if (R.np <= 0 || R.cash <= 0 || Math.abs(R.check) > 1e-6 || R.inv.some(y => y.ebit <= 0) || Math.abs(R.npv) < 500) continue;
    return c;
  }
  throw new Error('case');
}
/* ---------- the Feb 2026 case (Leipiintynyt) ---------- */
const FEB26 = { name: 'Leipiintynyt Oy', prod: 'Hiivatta lunch sandwich', unit: 'food truck', loc: 'Hervanta (Tampere)', campusLoc: 'Tampere University\'s central campus', price: 6.6, mat: 2.6, sold: 94000, produced: 93000, bought: 92000, opex: 270000, dep: 35000, tax: .2, rate: .05,
  open: { mach: 300000, raw: 10500, fin: 4900, ar: 4100, cash: 61500, sc: 200000, re: 12500, profit: 45000, lt: 72000, st: 42000, ap: 9500 },
  invest: 12000, div: 27000, repay: 8000, newloan: 25000, stClose: 43000, arClose: 3000, apClose: 9500,
  exp: { price: 6.9, mat: 2.95, inv: 50000, opex: 100000, units1: 30000, growth: .04, rrr: .09, campus: { inv: 35000, units1: 30000, opex: 50000, cannib: .2 } } };

/* ---------- presentation ---------- */
function caseText(c) {
  const o = c.open, x = c.exp;
  const bal = `<div class="xm-tw"><table class="xm-tab excel"><tr><th>ASSETS (1.1.)</th><th>€</th><th>EQUITY & LIABILITIES (1.1.)</th><th>€</th></tr>
    <tr><td>Machinery and equipment</td><td class="given y">${L.num(o.mach, 0)}</td><td>Shareholders' capital</td><td class="given y">${L.num(o.sc, 0)}</td></tr>
    <tr><td>Raw materials</td><td class="given y">${L.num(o.raw, 0)}</td><td>Retained earnings</td><td class="given y">${L.num(o.re, 0)}</td></tr>
    <tr><td>Finished goods</td><td class="given y">${L.num(o.fin, 0)}</td><td>Profit for the financial year</td><td class="given y">${L.num(o.profit, 0)}</td></tr>
    <tr><td>Accounts receivable</td><td class="given y">${L.num(o.ar, 0)}</td><td>Long-term liabilities (debt)</td><td class="given y">${L.num(o.lt, 0)}</td></tr>
    <tr><td>Cash and equivalents</td><td class="given y">${L.num(o.cash, 0)}</td><td>Short-term liabilities (debt)</td><td class="given y">${L.num(o.st, 0)}</td></tr>
    <tr><td></td><td></td><td>Accounts payable</td><td class="given y">${L.num(o.ap, 0)}</td></tr></table></div>`;
  return `<details open><summary><b>Case: ${h(c.name)}</b> (tap to fold)</summary>
  <p><b>Operating expenses.</b> Other operating expenses (wages, rent, maintenance) are <b>${E(c.opex, 0)}</b> per year. Income tax <b>${c.tax * 100} %</b>; no other taxes.</p>
  <p><b>Sales.</b> The ${h(c.prod)} sells for <b>${E(c.price)}</b>; material costs <b>${E(c.mat)}</b> per unit. During the year the company bought raw materials for <b>${L.num(c.bought, 0)}</b> units, produced <b>${L.num(c.produced, 0)}</b> and sold <b>${L.num(c.sold, 0)}</b>.</p>
  <p><b>Opening balance</b></p>${bal}
  <p><b>Financing.</b> During the year the company invested <b>${E(c.invest, 0)}</b> in new equipment. Shareholders' capital stayed unchanged. Dividends paid: <b>${E(c.div, 0)}</b>. Depreciation of old investments: <b>${E(c.dep, 0)}</b>. At the end of the year it paid back <b>${E(c.repay, 0)}</b> of long-term debt early and took a new long-term loan of <b>${E(c.newloan, 0)}</b>. At year end short-term liabilities were <b>${E(c.stClose, 0)}</b>. Interest on loans is <b>${c.rate * 100} %</b> a year. In the closing balance accounts receivable were <b>${E(c.arClose, 0)}</b> and accounts payable <b>${E(c.apClose, 0)}</b>.</p>
  <p><b>Expansion plan (Q6–Q10).</b> A new ${h(c.unit)} in ${h(c.loc)}: price <b>${E(x.price)}</b>, material costs <b>${E(x.mat)}</b> per unit. Initial investment <b>${E(x.inv, 0)}</b> at year 0, straight-line depreciation over <b>3 years</b> to 0 €. Annual operating expenses <b>${E(x.opex, 0)}</b>. Sales <b>${L.num(x.units1, 0)}</b> units in year 1, growing <b>${x.growth * 100} %</b> a year. Required rate of return <b>${L.num(x.rrr * 100, 1)} %</b>, tax ${c.tax * 100} %. Working-capital changes are not considered.</p>
  <p><b>Alternative scenario (Q11).</b> A second sales point at ${h(c.campusLoc)}: investment <b>${E(x.campus.inv, 0)}</b>, 3 years, straight-line; sales <b>${L.num(x.campus.units1, 0)}</b> in year 1 with the same growth; operating expenses <b>${E(x.campus.opex, 0)}</b> a year (synergies). It would reduce the ${h(c.unit)}'s sales by <b>${x.campus.cannib * 100} %</b>. Prices, material costs, rate of return and tax as above.</p></details>`;
}
/* the worked solution as an Excel sheet: yellow = given, blue = formula, green = answer */
function sheet(c, R) {
  const row = (label, val, f, cls) => `<tr><th>${label}</th><td class="${cls || 'b'}">${typeof val === 'number' ? L.num(val, 2) : val}</td><td class="f"><code>${h(f || '')}</code></td></tr>`;
  const x = c.exp;
  return `<div class="xm-tw"><table class="xm-tab excel sheet"><tr><th>Income statement</th><th>€</th><th>formula</th></tr>
    ${row('Revenue', R.revenue, `= ${c.sold} × ${c.price}`)}${row('− Cost of goods sold', -R.cogs, `= −units sold × ${c.mat}`)}${row('Gross margin', R.gm, '= Revenue − COGS')}${row('− Other operating expenses', -c.opex, 'given', 'y')}${row('EBITDA', R.ebitda, '= GM − opex')}
    ${row('− Depreciation', -c.dep, 'given', 'y')}${row('EBIT', R.ebit, '= EBITDA − dep')}${row('− Interest', -R.interest, `= ${c.rate} × (LT + ST debt, opening)`)}${row('EBT', R.ebt, '= EBIT − interest')}${row('− Taxes', -R.tax, `= ${c.tax} × EBT`)}${row('Net profit', R.np, '= EBT − tax', 'g')}
    <tr><th>Closing balance</th><th></th><th></th></tr>
    ${row('Machinery & equipment', R.mach, '= opening − dep + investments')}${row('Raw materials', R.raw, '= opening + (bought − produced) × material')}${row('Finished goods', R.fin, '= opening + (produced − sold) × material')}${row('Accounts receivable', R.ar, 'given', 'y')}${row('Cash', R.cash, '= opening cash + change in cash (cash-flow statement)')}
    ${row('Shareholders\' capital', c.open.sc, 'unchanged', 'y')}${row('Retained earnings', R.reClose, '= RE + last year\'s profit − dividends')}${row('Profit for the year', R.np, '= net profit')}${row('Long-term debt', R.lt, '= opening − repaid + new loan')}${row('Short-term debt', R.st, 'given', 'y')}${row('Accounts payable', R.ap, 'given', 'y')}${row('Total equity & liabilities', R.totalClose, '= sum', 'g')}
    <tr><th>Cash-flow statement</th><th></th><th></th></tr>${row('Operations', R.cfo, '= EBITDA + WC open − WC close − interest − taxes')}${row('Investments', R.cfi, '= FA open − FA close − dep')}${row('Financing', R.cff, '= ΔSC − dividends + debt close − debt open')}${row('Change in cash', R.dcash, '= sum')}
    <tr><th>Investment</th><th>year 1 / 2 / 3</th><th></th></tr>${row('Units', R.inv.map(y => L.num(y.u, 0)).join(' / '), `= ${x.units1} × ${1 + x.growth}^(t−1)`)}${row('EBIT', R.inv.map(y => L.num(y.ebit, 0)).join(' / '), '= units × (p − m) − opex − I/3')}${row('FCF', R.inv.map(y => L.num(y.fcf, 0)).join(' / '), '= EBIT × (1 − t) + dep')}${row('Discount factor', R.inv.map(y => L.num(y.df, 4)).join(' / '), `= 1 / (1 + ${x.rrr})^t`)}${row('NPV', R.npv, '= −I₀ + Σ FCF × DF', 'g')}</table></div>`;
}
const tolE = (v) => ({ tol: Math.max(1, Math.abs(v) * .001), rtol: 0 });
function fullCase(c, o) {
  o = o || {}; const R = compute(c), x = c.exp;
  const parts = [
    Object.assign({ type: 'numeric', label: 'Q1', prompt: 'Calculate the critical point for the sales price of the product (€/unit).', answer: R.critPrice, points: 2, unit: '€', tol: .01, rtol: 0, why: `Critical sales price = fixed costs / units sold + material cost = ${L.num(c.opex, 0)} / ${L.num(c.sold, 0)} + ${c.price === undefined ? '' : c.mat} = ${L.num(R.critPrice, 4)} €. (Fixed costs = other operating expenses, as in the course's CVP.)` }),
    Object.assign({ type: 'numeric', label: 'Q2', prompt: 'Calculate the financial assets in the opening balance.', answer: R.finOpen, points: 1, unit: '€' }, tolE(R.finOpen), { why: 'Financial assets = accounts receivable + cash and equivalents.' }),
    Object.assign({ type: 'numeric', label: 'Q3', prompt: 'Calculate the net income (net profit) of the financial year.', answer: R.np, points: 2, unit: '€' }, tolE(R.np), { why: `Revenue ${E(R.revenue)} − COGS (units <b>sold</b> × material) ${E(R.cogs)} − opex ${E(c.opex, 0)} − dep ${E(c.dep, 0)} − interest ${E(R.interest)} (on opening debt) − tax 20 % = ${E(R.np)}.` }),
    Object.assign({ type: 'numeric', label: 'Q4', prompt: 'Calculate the total value of equity and liabilities in the closing balance.', answer: R.totalClose, points: 4, unit: '€' }, tolE(R.totalClose), { why: `Equity: SC ${E(c.open.sc, 0)} + RE (${L.num(c.open.re, 0)} + ${L.num(c.open.profit, 0)} − ${L.num(c.div, 0)}) + net profit ${E(R.np)} = ${E(R.equityClose)}. Debt: LT ${L.num(c.open.lt, 0)} − ${L.num(c.repay, 0)} + ${L.num(c.newloan, 0)} = ${L.num(R.lt, 0)}, ST ${L.num(R.st, 0)}, payables ${L.num(R.ap, 0)}.` }),
    { type: 'numeric', label: 'Q5', prompt: 'Calculate the company\'s return on equity in the opening balance (%).', answer: R.roeOpen * 100, points: 2, unit: '%', tol: .05, rtol: 0, why: `ROE (opening) = profit for the year in the opening balance / opening equity = ${L.num(c.open.profit, 0)} / ${L.num(R.equityOpen, 0)} = ${P(R.roeOpen)}.` },
    { type: 'numeric', label: 'Q6', prompt: 'Calculate the gross margin-% of the new product.', answer: R.gmPctNew * 100, points: 2, unit: '%', tol: .05, rtol: 0, why: `(${x.price} − ${x.mat}) / ${x.price} = ${P(R.gmPctNew)}.` },
    { type: 'numeric', label: 'Q7', prompt: 'Calculate the operating margin for year 3 of the investment (%).', answer: R.opMargin3 * 100, points: 2, unit: '%', tol: .05, rtol: 0, why: `Year 3: units ${L.num(R.inv[2].u, 0)}, EBIT ${E(R.inv[2].ebit)}, revenue ${E(R.inv[2].rev)} → ${P(R.opMargin3)}.` },
    { type: 'numeric', label: 'Q8', prompt: 'Calculate the (present value) discounting factor for year 3 of the investment.', answer: R.df3, points: 1, tol: .0005, rtol: 0, dp: 4, why: `1 / (1 + ${x.rrr})³ = ${L.num(R.df3, 4)}.` },
    Object.assign({ type: 'numeric', label: 'Q9', prompt: 'Calculate the free cash flow for year 2 of the investment.', answer: R.fcf2, points: 2, unit: '€' }, tolE(R.fcf2), { why: `FCF = EBIT × (1 − t) + depreciation = ${E(R.inv[1].ebit)} × 0.8 + ${E(R.dep)} = ${E(R.fcf2)}.` }),
    Object.assign({ type: 'numeric', label: 'Q10', prompt: 'Calculate the net present value (NPV) of the investment.', answer: R.npv, points: 4, unit: '€' }, tolE(R.npv), { tol: Math.max(2, Math.abs(R.npv) * .002), why: `NPV = −${L.num(x.inv, 0)} + ${R.inv.map(y => `${L.num(y.fcf, 0)} × ${L.num(y.df, 4)}`).join(' + ')} = ${E(R.npv)}.` }),
    Object.assign({ type: 'numeric', label: 'Q11', prompt: `What is the NPV of expanding to the area when taking into account the opportunity to invest in both the ${h(c.unit)} and the campus sales point?`, answer: R.npvBoth, points: 3, unit: '€' }, { tol: Math.max(2, Math.abs(R.npvBoth) * .002), rtol: 0, why: `Both together: the ${c.unit} with sales × ${1 - x.campus.cannib} (cannibalisation) plus the campus outlet, both discounted at ${x.rrr * 100} %, minus both investments = ${E(R.npvBoth)}. (The campus point alone adds ${E(R.npvCampusIncr)} to the plain truck NPV.)` })];
  return { title: o.title || `Midterm 2 case: ${c.name}`, prompt: caseText(c) + '<p class="xm-hint">Answer in € with two decimals where needed; percentages as numbers (e.g. 17.48 for 17.48 %). In the real exam every green answer cell must be an Excel <b>formula</b> referring to yellow input cells.</p>', parts,
    solution: [`<b>Income statement:</b> revenue ${E(R.revenue)}, COGS ${E(R.cogs)}, EBITDA ${E(R.ebitda)}, EBIT ${E(R.ebit)}, interest ${E(R.interest)}, tax ${E(R.tax)}, net profit <b>${E(R.np)}</b>.`,
      `<b>Closing balance:</b> equity ${E(R.equityClose)} + LT ${E(R.lt, 0)} + ST ${E(R.st, 0)} + payables ${E(R.ap, 0)} = <b>${E(R.totalClose)}</b>; it balances with assets (cash ${E(R.cash)} from the cash-flow statement).`,
      `<b>Investment:</b> FCF ${R.inv.map(y => E(y.fcf)).join(', ')}; NPV <b>${E(R.npv)}</b>; with the campus point <b>${E(R.npvBoth)}</b>.`,
      `<b>The worked Excel sheet</b> (yellow = given data, blue = formulas, green = answers):` + sheet(c, R)],
    traps: ['COGS uses units <b>sold</b>, not bought or produced; the differences go to the inventories.', 'Interest only on interest-bearing debt (LT + ST), not on accounts payable; loans changed at year end do not change this year\'s interest.', 'Retained earnings close = opening RE + last year\'s profit − dividends (last year\'s profit moves into RE).', 'Year 2 sales = year 1 × (1 + g), year 3 = year 1 × (1 + g)².', 'Q11: apply the cannibalisation to the truck\'s sales, include both investments at t = 0.', 'Typing numbers into blue cells: every calculation must be a formula.'] };
}
/* ---------- smaller drills on the same model ---------- */
function drillStatement(c) { const R = compute(c);
  const rows = [['Revenue', R.revenue], ['Cost of goods sold', R.cogs], ['Gross margin', R.gm], ['EBITDA', R.ebitda], ['EBIT', R.ebit], ['Interest', R.interest], ['EBT', R.ebt], ['Taxes', R.tax], ['Net profit', R.np]];
  return { title: 'Fill the income statement', prompt: caseText(c), parts: [{ type: 'table', label: '', prompt: 'Fill the income statement for the financial year (€, positive numbers).', points: 4, excel: true, cols: ['€'], rows: rows.map(([l, v]) => ({ label: l, cells: [{ a: L.round(v, 2), num: true, tol: 1, rtol: 0, cls: l === 'Net profit' ? 'g' : 'b', w: 7 }] })) }],
    solution: [sheet(c, R)], traps: ['COGS = units sold × material cost.'] }; }
function drillBalance(c) { const R = compute(c);
  const rows = [['Machinery and equipment', R.mach], ['Raw materials', R.raw], ['Finished goods', R.fin], ['Cash and equivalents', R.cash], ['Retained earnings', R.reClose], ['Long-term debt', R.lt], ['Total equity & liabilities', R.totalClose]];
  return { title: 'Closing balance sheet and cash flow', prompt: caseText(c), parts: [{ type: 'table', label: '(a)', prompt: 'Closing balance values (€).', points: 4, excel: true, cols: ['€'], rows: rows.map(([l, v]) => ({ label: l, cells: [{ a: L.round(v, 2), num: true, tol: 1, rtol: 0, w: 7 }] })) },
    { type: 'table', label: '(b)', prompt: 'Cash-flow statement (€, signed).', points: 3, excel: true, cols: ['€'], rows: [['Cash flow from operations', R.cfo], ['Cash flow from investments', R.cfi], ['Cash flow from financing', R.cff], ['Change in cash', R.dcash]].map(([l, v]) => ({ label: l, cells: [{ a: L.round(v, 2), num: true, tol: 1, rtol: 0, w: 7 }] })) }],
    solution: [sheet(c, R)], traps: ['Cash is the balancing item: compute it via the cash-flow statement and check that the balance sheet balances.'] }; }
function drillRatios(c) { const R = compute(c);
  const q = (l, p, v, why) => ({ type: 'numeric', label: l, prompt: p, answer: v, points: 1, tol: v > 5 ? .05 : .005, rtol: 0, why });
  return { title: 'Key figures and ratios', prompt: caseText(c), parts: [
    q('(a)', 'Equity ratio, closing (%)', R.equityRatio * 100, 'Equity / (equity + debt): with payables in the total = equity / total of the balance sheet.'), q('(b)', 'Debt-to-equity, closing (×, decimal)', R.de, 'Debt / equity, where (as on the formula sheet) debt = all liabilities incl. accounts payable.'),
    q('(c)', 'Gearing, closing (%)', R.gearing * 100, '(Debt − accounts payable − cash) / equity = (interest-bearing debt − cash) / equity.'), q('(d)', 'Quick ratio, closing', R.quick, 'Financial assets / current liabilities (ST debt + payables).'),
    q('(e)', 'Current ratio, closing', R.current, 'Current assets / current liabilities.'), q('(f)', 'ROE using the average of opening and closing equity (%)', R.roeAvg * 100, 'Net profit / average equity.'),
    q('(g)', 'ROCE using averages (%)', R.roceAvg * 100, 'EBIT / average (assets − accounts payable).'), q('(h)', 'EBITDA-% (%)', R.ebitdaPct * 100, 'EBITDA / revenue.'),
    q('(i)', 'Critical sales quantity (units)', R.critQty, 'Fixed costs / (price − material cost).')],
    solution: [`Equity ${E(R.equityClose)}, debt ${E(R.debtClose, 0)}, cash ${E(R.cash)}, total ${E(R.totalClose)}.`, 'ROE and ROCE use averages of opening and closing balances unless the question says "opening".'], traps: ['Using the closing balance for ROE when the question asks for averages (or vice versa).'] }; }
function drillInvestment(c) { const R = compute(c), x = c.exp;
  return { title: 'Investment FCF table and NPV', prompt: caseText(c), parts: [{ type: 'table', label: '(a)', prompt: 'Fill the investment calculation (€).', points: 5, excel: true, cols: ['year 1', 'year 2', 'year 3'], rows: [['Units sold', 'u'], ['Revenue', 'rev'], ['EBITDA', 'ebitda'], ['EBIT', 'ebit'], ['FCF', 'fcf'], ['Discount factor', 'df'], ['PV of FCF', 'pv']].map(([l, k]) => ({ label: l, cells: R.inv.map(y => ({ a: L.round(y[k], k === 'df' ? 4 : 2), num: true, tol: k === 'df' ? .0005 : k === 'u' ? .6 : 1, rtol: 0, w: 6 })) })) },
    { type: 'numeric', label: '(b)', prompt: 'NPV (€)?', answer: R.npv, points: 2, tol: Math.max(2, Math.abs(R.npv) * .002), rtol: 0 },
    mc('(c)', 'Should the company invest?', R.npv > 0 ? 'Yes: NPV > 0, the project earns more than the required return' : 'No: NPV < 0, it does not earn the required return', [R.npv > 0 ? 'No: NPV < 0' : 'Yes: NPV > 0', 'Only if the payback time is under 1 year', 'Yes, because revenue grows'], 1, 'Accept projects with positive NPV at the required rate of return.')],
    solution: [sheet(c, R)], traps: ['Depreciation is added back in FCF; interest is not deducted (the discount rate covers financing).'] }; }
function drillCannib(c) { const R = compute(c), x = c.exp;
  return { title: 'Alternative scenario: cannibalisation and incremental NPV', prompt: caseText(c), parts: [
    { type: 'numeric', label: '(a)', prompt: `Year-1 sales of the ${h(c.unit)} if the campus point opens (units)?`, answer: x.units1 * (1 - x.campus.cannib), points: 1, tol: .6, rtol: 0 },
    { type: 'numeric', label: '(b)', prompt: 'NPV of the campus point on its own (its own cash flows and investment, €)?', answer: -x.campus.inv + L.sum(R.campus.map(y => y.pv)), points: 2, tol: 3, rtol: .002 },
    { type: 'numeric', label: '(c)', prompt: 'NPV of both together (€)?', answer: R.npvBoth, points: 2, tol: 3, rtol: .002 },
    { type: 'numeric', label: '(d)', prompt: 'Incremental NPV of adding the campus point (both − truck alone, €)?', answer: R.npvCampusIncr, points: 2, tol: 3, rtol: .002 },
    mc('(e)', 'Why is the incremental NPV lower than the campus point\'s own NPV?', 'It loses the truck\'s cannibalised sales: incremental cash flows include effects on existing business', ['Because of sunk costs', 'Because depreciation is higher', 'It is not lower'], 1, 'Incremental analysis: count every cash flow that changes because of the decision.')],
    solution: [`Campus alone: ${E(-x.campus.inv + L.sum(R.campus.map(y => y.pv)))}; truck alone: ${E(R.npv)}; both: ${E(R.npvBoth)}; increment ${E(R.npvCampusIncr)}.`], traps: ['Forgetting the lost truck sales.', 'Discounting the campus investment (it happens at t = 0).'] }; }
function drillWritten(r) {
  const W = [
    ['What does the internal rate of return (IRR) mean, and how is it used together with NPV?', 'IRR is the discount rate at which NPV = 0. A project is acceptable if IRR > required rate of return. NPV gives the value created in euros; IRR can mislead when comparing projects of different size or with non-conventional cash flows (several sign changes), so NPV is the primary criterion.', [[1, 'Definition: rate giving NPV = 0'], [1, 'Decision rule IRR > required return'], [1, 'Limitation vs NPV (scale, multiple IRRs)']]],
    ['What is the (discounted) payback period and what are its weaknesses?', 'The time until cumulative (discounted) free cash flows cover the initial investment. Easy to understand and a proxy for risk/liquidity, but it ignores cash flows after the payback point and (if undiscounted) the time value of money, so it can reject valuable long projects.', [[1, 'Definition with cumulative (discounted) FCF'], [1, 'Ignores cash flows after payback'], [1, 'Undiscounted version ignores time value / no value measure']]],
    ['Explain sunk cost and opportunity cost in investment calculations, with an example from the case.', 'A <b>sunk cost</b> has already been spent and cannot be recovered (e.g. a market study already paid): ignore it. An <b>opportunity cost</b> is the value of the best alternative use of a resource (e.g. the storage space could be rented out, or capital could earn the required return elsewhere): include it as a cost. Only incremental future cash flows matter.', [[1, 'Sunk cost: ignore, with example'], [1, 'Opportunity cost: include, with example'], [1, 'Principle: incremental future cash flows']]],
    ['How would you run a sensitivity / scenario analysis on the investment and why?', 'Change one uncertain input at a time (sales volume, growth, price, material cost, opex, required return) and see how NPV reacts; find the critical value where NPV = 0. Scenarios combine inputs (pessimistic / base / optimistic). It shows which estimates matter most and how robust the decision is.', [[1, 'One-at-a-time changes and critical values'], [1, 'Scenarios (best/base/worst)'], [1, 'Purpose: identify key drivers and risk']]],
    ['Why does free cash flow add back depreciation but not deduct interest?', 'Depreciation is a non-cash expense: it lowers EBIT (and taxes) but no cash leaves the firm, so it is added back after computing taxes on EBIT. Financing costs are reflected in the discount rate (required return / WACC), so deducting interest would double-count them.', [[1.5, 'Depreciation is non-cash, only its tax effect matters'], [1.5, 'Financing is in the discount rate → no interest in FCF']]]
  ];
  const [q, m, rb] = r.pick(W); return { title: 'Written question (investments)', prompt: q, parts: [wr('', 'Answer in a few sentences.', 3, m, rb)], solution: [], traps: ['Defining without explaining how it is used in the decision.'] };
}
function drillDF(r) { const rr = r.pick([.06, .07, .08, .09, .1, .12]), t = r.int(1, 5), fcf = r.step(5000, 50000, 500);
  return { title: 'Discount factor and present value', prompt: `Required rate of return ${L.num(rr * 100, 1)} %.`, parts: [
    { type: 'numeric', label: '(a)', prompt: `Discount factor for year ${t}?`, answer: 1 / Math.pow(1 + rr, t), points: 1, tol: .0005, rtol: 0, dp: 4 },
    { type: 'numeric', label: '(b)', prompt: `Present value of a free cash flow of ${E(fcf, 0)} in year ${t}?`, answer: fcf / Math.pow(1 + rr, t), points: 1, tol: 1, rtol: 0 }],
    solution: [`DF = 1 / (1 + ${rr})^${t} = ${L.num(1 / Math.pow(1 + rr, t), 4)}.`], traps: ['Using (1 + r)·t instead of (1 + r)^t.'] }; }

const SRC = 'Same template as TU-A1300 MT2 19.2.2026';
XM.register({
  id: 'iem', code: 'TU-A1300', name: 'Industrial Engineering & Management (MT2)', short: 'TU-A1300', accent: '#FFC24B',
  bosses: ['The Ledger', 'Retained Earnings', 'The Discount Factor', 'Free Cash Phantom', 'The NPV', 'The Examiner'],
  exam: { date: '2026-12-09T17:00:00', end: '2026-12-09T19:00:00', where: 'Otaniemi, own laptop + Excel (9.12 session, 17–19)', format: 'Midterm 2: own laptop, Excel template, 2 h, 25 points (min 10): one accounting and one investment case, about 11 calculations.',
    rules: 'Allowed: the paper formula sheet and the unedited MyCourses PDFs. Yellow = given data, blue = formulas only, green = answers as formulas. Save as Midterm2_<student number>.xlsx.',
    notes: '<p>The Feb 2026 Midterm 2 was one company case: opening balance + a year of events (Q1–Q5), an expansion investment (Q6–Q10) and an alternative scenario with cannibalisation (Q11), <b>25 points</b>. The <b>case generator</b> writes a new company each time with the same 11 questions and points, computed with the formula sheet\'s formulas. The worked solution shows the Excel sheet with the colour rules.</p>' },
  grades: [[40, 'pass']], gradeNote: 'Midterm 2 is passed with at least 10 / 25 points (40 %).',
  topics: { case: { name: 'Full Midterm 2 case (11 questions)', slot: 'Q1–Q11 · 25 p', weight: 1, freq: 'the exam format' }, acc: { name: 'Accounting: income statement, balance, cash flow', slot: 'Q1–Q5', weight: .8 },
    ratio: { name: 'Key figures and ratios', slot: 'Q2, Q5', weight: .6 }, inv: { name: 'Investments: FCF, discounting, NPV', slot: 'Q6–Q10', weight: .9 }, alt: { name: 'Alternative scenario / incremental NPV', slot: 'Q11', weight: .7 }, theory: { name: 'Written: IRR, payback, sunk cost', slot: 'written', weight: .3 } },
  templates: {
    case: { topic: 'case', title: 'Full Midterm 2 case: new company, same 11 questions (25 p)', kinds: 'numeric (Excel-style worked solution)', source: SRC + ' (all questions)', weight: 2, gen: r => fullCase(randCase(r)) },
    stmt: { topic: 'acc', title: 'Fill the income statement', kinds: 'fill the table', source: SRC + ' Q3', gen: r => drillStatement(randCase(r)) },
    bal: { topic: 'acc', title: 'Closing balance + cash-flow statement', kinds: 'fill the table', source: SRC + ' Q4', gen: r => drillBalance(randCase(r)) },
    ratios: { topic: 'ratio', title: 'Key figures: equity ratio, gearing, quick ratio, ROE, ROCE…', kinds: 'numeric', source: 'Formula sheet "Key figures and ratios" (L07)', gen: r => drillRatios(randCase(r)) },
    invest: { topic: 'inv', title: 'Investment FCF table and NPV', kinds: 'fill the table + numeric', source: SRC + ' Q6–Q10', gen: r => drillInvestment(randCase(r)) },
    cannib: { topic: 'alt', title: 'Cannibalisation and incremental NPV', kinds: 'numeric + multiple choice', source: SRC + ' Q11', gen: r => drillCannib(randCase(r)) },
    df: { topic: 'inv', title: 'Discount factor and present value', kinds: 'numeric', source: SRC + ' Q8', weight: .5, gen: drillDF },
    written: { topic: 'theory', title: 'IRR, payback, sunk/opportunity cost, sensitivity', kinds: 'written + rubric', source: 'L08 + reading (written-answer candidates)', gen: drillWritten }
  },
  mock: { title: 'TU-A1300 Midterm 2 mock (new company case)', minutes: 120, points: 25, rules: 'Work in your own Excel if you like (yellow/blue/green rules), then type the answers here. Formula sheet allowed.', slots: [{ label: 'Company case, Q1–Q11', points: 25, tpls: ['case'] }] },
  papers: [{ id: 'mt2-2026-02-19', title: 'TU-A1300 Midterm 2 19.2.2026 (Leipiintynyt Oy)', note: 'The real Feb 2026 retake, version A. 11 questions, 25 points.', minutes: 120,
    questions: () => [Object.assign(fullCase(FEB26, { title: 'Midterm 2, 19.2.2026: Leipiintynyt Oy' }), { source: 'TU-A1300 MT2 19.2.2026 (version A)' })] }]
});
XM.IEM.FEB26 = FEB26; XM.IEM.randCase = randCase;
})(typeof window !== 'undefined' ? window : globalThis);
