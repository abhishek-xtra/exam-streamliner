/* ELEC-A7200 Signals and Systems — exam Mon 1.2.2027 (time and room: check Sisu). Pen & paper + equation sheet.
   The 8 templates of A7200-exam-playbook (T1–T8) plus the 6-question multiple-choice warm-up that
   appeared in the 26.8.2026 exam, all as generators with new numbers. Equation-sheet conventions:
   sinc(x) = sin(πx)/(πx); rect(t/a) ↔ a·sinc(af); tria(t/T) (half-width T) ↔ T·sinc²(Tf);
   x_k = (1/T₀)∫x(t)e^{−j2πkf₀t}dt; DFT X[k] = Σ x[n]e^{−j2πkn/N}. */
(function (G) {
'use strict';
const XM = G.XM, L = XM.lib, h = L.esc;
const mc = (label, prompt, correct, wrongs, points, why, o) => Object.assign({ type: 'mcq', label, prompt, options: [correct].concat(wrongs.filter((w, i) => w !== correct && wrongs.indexOf(w) === i)), answer: 0, points: points || 1, why }, o || {});
const num = (label, prompt, answer, points, o) => Object.assign({ type: 'numeric', label, prompt, answer, points: points || 1, rtol: .005 }, o || {});
const N = (x, d) => L.num(x, d === undefined ? 3 : d);
const sinc = x => Math.abs(x) < 1e-12 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
const deg = r => r * 180 / Math.PI, PI = Math.PI;
const PH = [[0, '0'], [PI / 4, 'π/4'], [-PI / 4, '−π/4'], [PI / 3, 'π/3'], [-PI / 3, '−π/3'], [PI / 2, 'π/2'], [-PI / 2, '−π/2'], [PI / 6, 'π/6']];
const SRC = 'Playbook template ';

/* T1: Fourier series of a cosine sum */
function gT1(r) {
  const f0 = r.pick([50, 100, 200, 250, 500]); const gcd = (a, b) => b ? gcd(b, a % b) : a; let ks; do { ks = r.sample([1, 2, 3, 4, 5], 2).sort((a, b) => a - b); } while (gcd(ks[0], ks[1]) !== 1);
  const A0 = r.pick([0, 0, 1, 2]), comps = ks.map((k, i) => ({ k, A: r.pick([1, 2, 3, 4, 6]), ph: r.pick(PH), fn: i === 1 && r.chance(.5) ? 'sin' : 'cos' }));
  const coef = {}; if (A0) coef[0] = { re: A0, im: 0 };
  comps.forEach(c => { const p = c.ph[0] - (c.fn === 'sin' ? PI / 2 : 0); coef[c.k] = { re: c.A / 2 * Math.cos(p), im: c.A / 2 * Math.sin(p) }; coef[-c.k] = { re: c.A / 2 * Math.cos(p), im: -c.A / 2 * Math.sin(p) }; });
  const mag = k => coef[k] ? Math.hypot(coef[k].re, coef[k].im) : 0, arg = k => coef[k] ? Math.atan2(coef[k].im, coef[k].re) : 0, K = Math.max(...ks);
  const P = A0 * A0 + L.sum(comps.map(c => c.A * c.A / 2)), kq = comps[1].k;
  const sig = (A0 ? A0 + ' + ' : '') + comps.map(c => `${c.A} ${c.fn}(2π·${c.k * f0}t${c.ph[0] ? (c.ph[0] > 0 ? ' + ' : ' − ') + c.ph[1].replace('−', '') : ''})`).join(' + ');
  const kk = L.range(-K, K + 1), stems = L.drawPlot([{ pts: kk.map(k => [k * f0, mag(k)]), stem: true, labels: (x, y) => y ? N(y, 2) : '' }], { w: 520, h: 200, xticks: kk.map(k => [k * f0, String(k * f0)]), xlabel: 'f (Hz)', ylabel: '|x_k|' });
  return { title: 'Fourier series of a cosine sum', prompt: `x(t) = ${sig}`,
    parts: [num('(a)', 'Fundamental frequency f₀ (Hz)?', f0, 1, { tol: 0, rtol: 0 }), num('', 'Period T₀ (ms)?', 1000 / f0, .5, { tol: .001, rtol: 0 }),
      { type: 'table', label: '(b)', prompt: 'Two-sided amplitude spectrum |x<sub>k</sub>| for k = −' + K + '…' + K + '.', points: 2, cols: kk.map(String), rows: [{ label: '|x_k|', cells: kk.map(k => ({ a: L.round(mag(k), 4), num: true, tol: .01, rtol: 0, w: 3 })) }] },
      num('(c)', `Phase arg x<sub>${kq}</sub> in degrees (−180…180)?`, deg(arg(kq)), 1, { tol: .6, rtol: 0, why: comps[1].fn === 'sin' ? 'sin(θ) = cos(θ − π/2): subtract 90° first.' : 'x_k = (A/2)e^{jφ} for A cos(2πkf₀t + φ).' }),
      num('(d)', 'Average power P = Σ|x<sub>k</sub>|² (Parseval)?', P, 1, { tol: .001, rtol: 0 }),
      num('(e)', `One-sided power spectrum value at ${kq * f0} Hz (= 2|x<sub>k</sub>|²)?`, 2 * mag(kq) ** 2, 1, { tol: .001, rtol: 0 })],
    solution: [`Euler: A cos(θ) = (A/2)e<sup>jθ</sup> + (A/2)e<sup>−jθ</sup>; sin(θ) = cos(θ − π/2).`, `Coefficients: ${kk.filter(k => coef[k]).map(k => `x<sub>${k}</sub> = ${N(coef[k].re, 3)}${coef[k].im >= 0 ? ' + ' : ' − '}j${N(Math.abs(coef[k].im), 3)}`).join(', ')} (Hermitian: x<sub>−k</sub> = x<sub>k</sub>*).`, 'Two-sided amplitude spectrum (stems, not curves):' + stems, `P = ${A0 ? A0 + '² + ' : ''}${comps.map(c => c.A + '²/2').join(' + ')} = ${N(P, 3)}. Parseval for Fourier series is NOT on the equation sheet.`],
    traps: ['Drawing the spectrum as curves instead of stems.', 'Forgetting the −90° for a sine.', 'One-sided power: 2|x<sub>k</sub>|² for k ≥ 1, but |x<sub>0</sub>|² for DC.'] };
}
/* T2: Fourier transform of a pulse */
function gT2(r) {
  const kind = r.pick(['rect', 'tria', 'trap', 'trap']), A = r.pick([1, 2, 3, 4]), t0 = r.pick([0, 0, 1, 2]);
  let a, b, T, X, area, null1, pts, expr, wrong;
  if (kind === 'rect') { a = r.pick([1, 2, 4]); X = f => A * a * sinc(a * f); area = A * a; null1 = 1 / a; pts = [[-a / 2 - 1, 0], [-a / 2, 0], [-a / 2, A], [a / 2, A], [a / 2, 0], [a / 2 + 1, 0]]; expr = `${A}·${a}·sinc(${a}f)`; wrong = [`${A}·sinc(${a}f)`, `${A}·${a}·sinc²(${a}f)`, `${A}·${a}·sinc(f/${a})`]; }
  else if (kind === 'tria') { T = r.pick([1, 2, 3]); X = f => A * T * sinc(T * f) ** 2; area = A * T; null1 = 1 / T; pts = [[-T - 1, 0], [-T, 0], [0, A], [T, 0], [T + 1, 0]]; expr = `${A}·${T}·sinc²(${T}f)`; wrong = [`${A}·${T}·sinc(${T}f)`, `${A}·sinc²(${T}f)`, `${A}·${2 * T}·sinc²(${2 * T}f)`]; }
  else { [a, b] = r.pick([[3, 1], [4, 2], [5, 1], [6, 2], [5, 3]]); X = f => A * a * sinc(a * f) * sinc(b * f); area = A * a; null1 = 1 / a; pts = [[-(a + b) / 2 - 1, 0], [-(a + b) / 2, 0], [-(a - b) / 2, A], [(a - b) / 2, A], [(a + b) / 2, 0], [(a + b) / 2 + 1, 0]]; expr = `${A}·${a}·sinc(${a}f)·sinc(${b}f)`; wrong = [`${A}·${a}·${b}·sinc(${a}f)·sinc(${b}f)`, `${A}·${a}·sinc²(${a}f)`, `${A}·(${a} − ${b})·sinc((${a} − ${b})f)`]; }
  const f1 = L.round(null1 / 2, 4), shown = pts.map(([t, v]) => [t + t0, v]);
  const fig = L.drawPlot([{ pts: shown }], { w: 460, h: 180, xticks: shown.slice(1, -1).map(p => [p[0], N(p[0], 2)]), yticks: [[A, String(A)]], xlabel: 't (s)', ylabel: 'x(t)' });
  const ph = t0 ? ` · e<sup>−j2πf·${t0}</sup>` : '';
  return { title: 'Fourier transform of a pulse', figure: fig, prompt: `The pulse x(t) is shown (${kind === 'trap' ? 'a trapezoid' : kind === 'tria' ? 'a triangle' : 'a rectangle'}${t0 ? ', delayed by ' + t0 + ' s' : ''}). Use the derivative trick or write it as rect/tria pieces.`,
    parts: [mc('(a)', 'X(f) = ?', expr + ph, wrong.map(w => w + ph), 2, kind === 'trap' ? `Trapezoid = (${A}/${b})·rect(t/${a}) ∗ rect(t/${b}) → (${A}/${b})·${a}sinc(${a}f)·${b}sinc(${b}f). Or: the derivative is two pairs of rects; divide its FT by j2πf.` : 'Table: rect(t/a) ↔ a·sinc(af), tria(t/T) ↔ T·sinc²(Tf); a delay t₀ multiplies by e^{−j2πft₀}.', { wide: true }),
      num('(b)', 'X(0) (= the area of the pulse)?', area, 1, { tol: .001, rtol: 0 }), num('(c)', `|X(f)| at f = ${f1} Hz?`, Math.abs(X(f1)), 1.5, { tol: .002, rtol: .002 }), num('(d)', 'First zero of |X(f)| for f > 0 (Hz)?', null1, 1, { tol: .001, rtol: 0 }),
      mc('(e)', 'The delay changes…', t0 ? 'only the phase: |X(f)| stays the same' : 'nothing here (no delay), but a delay would only change the phase', ['the amplitude spectrum', 'the area', 'the first zero'], .5, '')],
    solution: [`X(f) = ${expr}${ph}.`, `Check: X(0) = area = ${N(area, 3)}.`, `|X(${f1})| = ${N(Math.abs(X(f1)), 4)}; zeros where the sinc arguments are non-zero integers → first at ${N(null1, 3)} Hz.`], traps: ['Forgetting to divide by j2πf after differentiating.', 'tria(t/T) has half-width T (base 2T) on the equation sheet.'] };
}
/* T3: convolution */
function gT3(r) {
  const kind = r.pick(['rr', 'rr', 'exp', 'rc']);
  if (kind === 'rr') { const a = r.pick([1, 2, 3, 4]), b = r.pick([1, 2, 3]), A = r.pick([1, 2]), B = r.pick([1, 2, 3]), y = t => A * B * Math.max(0, Math.min(a / 2, t + b / 2) - Math.max(-a / 2, t - b / 2)), t1 = L.round(r.pick([-1, -.5, .25, .5, 1, 1.5]) * Math.max(a, b) / 2, 3);
    return { title: 'Convolution of two rectangles', prompt: `x(t) = ${A}·rect(t/${a}), h(t) = ${B}·rect(t/${b}). y = x ∗ h.`,
      parts: [num('(a)', `y(${t1})?`, y(t1), 2, { tol: .001, rtol: 0 }), num('(b)', 'Maximum value of y?', A * B * Math.min(a, b), 1, { tol: .001, rtol: 0 }), num('(c)', 'Total width of the support of y?', a + b, 1, { tol: .001, rtol: 0 }), num('(d)', 'Width of the flat top (0 if a triangle)?', Math.abs(a - b), 1, { tol: .001, rtol: 0 }),
        mc('(e)', 'Y(f) = ?', `${A * B * a * b}·sinc(${a}f)·sinc(${b}f)`, [`${A * B}·sinc(${a}f) + sinc(${b}f)`, `${A * B * a * b}·sinc(${a + b}f)`, `${A * B}·sinc(${a}f)·sinc(${b}f)`], 1, 'Convolution in time = multiplication in frequency.')],
      solution: [`y(t) = ${A * B} × (length of the overlap of [−${a / 2}, ${a / 2}] and [t − ${b / 2}, t + ${b / 2}]): a trapezoid from −${(a + b) / 2} to ${(a + b) / 2}${a === b ? ' (a triangle)' : ''}.`], traps: ['Not listing the regimes of t before integrating.'] }; }
  const al = r.pick([.5, 1, 2, 5]), t1 = r.pick([.2, .5, 1, 2]);
  if (kind === 'exp') return { title: 'Convolution: exponential with a step', prompt: `x(t) = e<sup>−${al}t</sup>u(t), h(t) = u(t). y = x ∗ h.`,
    parts: [num('(a)', `y(${t1})?`, (1 - Math.exp(-al * t1)) / al, 2, { tol: .001, rtol: 0 }), num('(b)', 'lim y(t) as t → ∞?', 1 / al, 1, { tol: .001, rtol: 0 }), mc('(c)', 'y(t) for t < 0?', '0', ['1', `1/${al}`, 'e^{−t}'], 1, 'Both signals are zero for t < 0.')],
    solution: [`y(t) = ∫₀ᵗ e<sup>−${al}τ</sup> dτ = (1 − e<sup>−${al}t</sup>)/${al} for t ≥ 0.`], traps: [] };
  const RC = r.pick([.001, .002, .005, .01]), tt = RC * r.pick([.5, 1, 2, 3]);
  return { title: 'RC circuit step response by convolution', prompt: `An RC low-pass filter has h(t) = (1/RC)e<sup>−t/RC</sup>u(t) with RC = ${RC * 1000} ms. Input: unit step u(t).`,
    parts: [num('(a)', `Output at t = ${N(tt * 1000, 2)} ms?`, 1 - Math.exp(-tt / RC), 2, { tol: .001, rtol: 0 }), num('(b)', 'Time constant (ms)?', RC * 1000, 1, { tol: .001, rtol: 0 }), num('(c)', '−3 dB cut-off frequency 1/(2πRC) (Hz)?', 1 / (2 * PI * RC), 1, { rtol: .005 })],
    solution: [`y(t) = 1 − e<sup>−t/RC</sup> for t ≥ 0.`], traps: [] };
}
/* T4: inner product and Gram–Schmidt */
function gT4(r) {
  const n = 4, d = r.pick([1, 2]); let x, y; do { x = L.range(0, n).map(() => r.int(-2, 2)); y = L.range(0, n).map(() => r.int(-2, 2)); } while (!x.some(Boolean) || !y.some(Boolean) || Math.abs(L.sum(x.map((v, i) => v * y[i]))) === Math.sqrt(L.sum(x.map(v => v * v)) * L.sum(y.map(v => v * v))));
  const ip = d * L.sum(x.map((v, i) => v * y[i])), Ex = d * L.sum(x.map(v => v * v)), Ey = d * L.sum(y.map(v => v * v)), c = ip / Math.sqrt(Ex), phi1 = x.map(v => v / Math.sqrt(Ex)), res = y.map((v, i) => v - c * phi1[i]), Er = d * L.sum(res.map(v => v * v)), phi2 = res.map(v => v / Math.sqrt(Er));
  const piece = v => L.range(0, n).map(i => `${v[i]} on [${i * d}, ${(i + 1) * d})`).join(', ');
  return { title: 'Inner product and Gram–Schmidt', prompt: `Two real signals, piecewise constant on intervals of length ${d} s (zero elsewhere): x(t): ${piece(x)}; y(t): ${piece(y)}.`,
    parts: [num('(a)', '⟨x, y⟩ = ∫ x(t) y(t) dt?', ip, 1, { tol: .001, rtol: 0 }), num('(b)', 'Energy of x?', Ex, 1, { tol: .001, rtol: 0 }), mc('(c)', 'Are x and y orthogonal?', ip === 0 ? 'Yes: ⟨x, y⟩ = 0' : 'No: ⟨x, y⟩ ≠ 0', [ip === 0 ? 'No' : 'Yes'], .5, ''),
      num('(d)', 'Coefficient ⟨y, φ₁⟩ where φ₁ = x/√E<sub>x</sub>?', c, 1, { tol: .002, rtol: 0 }),
      { type: 'table', label: '(e)', prompt: 'Second basis function φ₂ = (y − ⟨y,φ₁⟩φ₁)/‖·‖: its value on each interval.', points: 2, cols: L.range(0, n).map(i => `[${i * d},${(i + 1) * d})`), rows: [{ label: 'φ₂', cells: phi2.map(v => ({ a: L.round(v, 4), num: true, tol: .003, rtol: 0, w: 4 })) }] },
      num('(f)', 'Energy of y (check: = ⟨y,φ₁⟩² + ⟨y,φ₂⟩²)?', Ey, .5, { tol: .001, rtol: 0 })],
    solution: [`⟨x,y⟩ = ${d}·Σ xᵢyᵢ = ${ip}; E<sub>x</sub> = ${Ex}; φ₁ = x/√${Ex}.`, `⟨y,φ₁⟩ = ${N(c, 4)}; residual energy ${N(Er, 4)}; φ₂ = (${phi2.map(v => N(v, 3)).join(', ')}).`], traps: ['Forgetting the interval length in the integral.', 'Not normalising φ₂.'] };
}
/* T5: sampling and DFT */
function gT5(r) {
  const fs = r.pick([100, 200, 400, 500, 1000]), Nn = r.pick([8, 10, 16, 20]), df = fs / Nn, m = r.int(1, Math.floor(Nn / 2) - 1), A = r.pick([1, 2, 3]), k = r.int(Math.floor(Nn / 2) + 1, Nn - 1);
  const fk = k > Nn / 2 ? (k - Nn) * df : k * df, ftrue = fs * r.int(1, 2) + r.pick([1, -1]) * r.int(1, Math.floor(fs / 2 / 10)) * 10, alias = Math.abs(ftrue - Math.round(ftrue / fs) * fs);
  const idx = L.range(0, Math.min(Nn, 10));
  return { title: 'Sampling and the DFT', prompt: `A signal is sampled at f<sub>s</sub> = ${fs} Hz and an N = ${Nn}-point DFT is computed (X[k] = Σ x[n]e<sup>−j2πkn/N</sup>).`,
    parts: [num('(a)', 'Nyquist frequency (Hz)?', fs / 2, .5, { tol: 0, rtol: 0 }), num('(b)', 'Frequency spacing between DFT bins (Hz)?', df, .5, { tol: .001, rtol: 0 }),
      { type: 'table', label: '(c)', prompt: `Frequency (Hz) of DFT index k (negative for indices above N/2). Shown: k = 0…${idx.length - 1}.`, points: 2, cols: idx.map(String), rows: [{ label: 'f', cells: idx.map(i => ({ a: i > Nn / 2 ? (i - Nn) * df : i * df, num: true, tol: .001, rtol: 0, w: 3.6 })) }] },
      num('(d)', `Frequency of index k = ${k} (Hz)?`, fk, 1, { tol: .001, rtol: 0 }),
      { type: 'text', label: '(e)', prompt: `x[n] = ${A}cos(2π·${m * df}·n/f<sub>s</sub>). Which two DFT indices are non-zero? (e.g. "2 18")`, answer: `${m} ${Nn - m}`, check: s => L.normSet(s) === L.normSet(`${m} ${Nn - m}`), points: 1 },
      num('', 'Their magnitude |X[k]|?', A * Nn / 2, 1, { tol: .001, rtol: 0, why: 'A cos → (A/2)·N at each of the two bins.' }),
      num('(f)', 'Σ|x[n]|² over one DFT frame (Parseval: (1/N)Σ|X[k]|²)?', Nn * A * A / 2, 1, { tol: .001, rtol: 0 }),
      num('(g)', `A ${ftrue} Hz tone is sampled at ${fs} Hz. At which frequency (0…f<sub>s</sub>/2) does it appear?`, alias, 1, { tol: .001, rtol: 0, why: 'Alias: |f − n·f<sub>s</sub>| folded into [0, f<sub>s</sub>/2].' }),
      mc('(h)', 'Zero padding the DFT to 4N points…', 'gives a finer frequency grid (interpolation) but no better true resolution', ['improves the true frequency resolution', 'removes aliasing', 'reduces noise'], .5, 'Resolution depends on the observation length N/f<sub>s</sub>.')],
    solution: [`Δf = f<sub>s</sub>/N = ${df} Hz; index k > N/2 ↔ (k − N)·Δf.`, `Tone at ${m * df} Hz → bins ${m} and ${Nn - m} with |X| = ${A}·${Nn}/2.`, `Alias of ${ftrue} Hz: ${alias} Hz.`], traps: ['Forgetting negative frequencies above N/2.', 'Thinking zero padding improves true resolution.'] };
}
/* T6: first-order LTI system */
function gT6(r) {
  const tau = r.pick([.001, .002, .005, .01, .1]), K = r.pick([1, 2, 5, 10]), f0 = L.round(r.pick([.5, 1, 2, 3]) / (2 * PI * tau), 1), w = 2 * PI * f0 * tau, mag = K / Math.sqrt(1 + w * w), ph = -Math.atan(w), t1 = tau * r.pick([.5, 1, 2]);
  return { title: 'First-order LTI system', prompt: `${tau} · dy/dt + y(t) = ${K} · x(t), system initially at rest.`,
    parts: [mc('(a)', 'H(f) = ?', `${K} / (1 + j2πf·${tau})`, [`${K} / (1 − j2πf·${tau})`, `${K}·j2πf·${tau} / (1 + j2πf·${tau})`, `1 / (${K} + j2πf·${tau})`], 1, 'Replace d/dt by j2πf (or s), then H = Y/X.'),
      num('(b)', `Amplitude response |H(f)| at f = ${f0} Hz?`, mag, 1, { tol: .002, rtol: .002 }), num('(c)', `Phase response arg H(f) at f = ${f0} Hz (degrees)?`, deg(ph), 1, { tol: .3, rtol: 0 }),
      num('(d)', `Impulse response h(t) at t = ${N(t1 * 1000, 2)} ms? (h(t) = (K/τ)e<sup>−t/τ</sup>u(t))`, K / tau * Math.exp(-t1 / tau), 1, { rtol: .002 }),
      num('(e)', `Steady-state output amplitude for x(t) = cos(2π·${f0}t)?`, mag, 1, { tol: .002, rtol: .002, why: 'y = |H(f₀)| cos(2πf₀t + arg H(f₀)).' }),
      num('(f)', `Group delay −(1/2π)·dΦ/df at f = ${f0} Hz (ms)?`, tau / (1 + w * w) * 1000, 1, { rtol: .005 }),
      mc('(g)', 'Is the system stable?', `Yes: the pole s = −1/${tau} is in the left half-plane`, ['No: the pole is in the right half-plane', 'Only for f < f₀', 'Cannot be decided'], .5, '')],
    solution: [`H(f) = ${K}/(1 + j2πf·${tau}); at f₀: 2πf₀τ = ${N(w, 4)}, |H| = ${N(mag, 4)}, Φ = ${N(deg(ph), 2)}°.`, `h(t) = (${K}/${tau})e<sup>−t/${tau}</sup>u(t).`, `Group delay τ/(1 + (2πfτ)²) = ${N(tau / (1 + w * w) * 1000, 4)} ms.`], traps: ['Giving the phase in radians when degrees are asked (or vice versa).', 'Forgetting the u(t) in h(t).'] };
}
/* T7: non-linear system + Butterworth */
function gT7(r) {
  if (r.chance(.6)) { const a = r.pick([1, 2, 5, 10]), b = r.pick([.1, .2, .5, 1, -.1, -.5]), A = r.pick([1, 2, 3]), f0 = r.pick([100, 200, 500, 1000]), F = a * A + .75 * b * A ** 3, H3 = .25 * b * A ** 3;
    return { title: 'Non-linear system: harmonics and THD', prompt: `y(t) = ${a}x(t) ${b < 0 ? '−' : '+'} ${Math.abs(b)}x³(t), input x(t) = ${A}cos(2π·${f0}t). Use cos³θ = (3/4)cosθ + (1/4)cos3θ.`,
      parts: [num('(a)', 'Amplitude of the fundamental in y?', Math.abs(F), 1.5, { tol: .001, rtol: 0 }), num('(b)', 'Frequency of the new harmonic (Hz)?', 3 * f0, 1, { tol: 0, rtol: 0 }), num('(c)', 'Its amplitude?', Math.abs(H3), 1.5, { tol: .001, rtol: 0 }), num('(d)', 'THD (%) = |3rd| / |fundamental| · 100?', Math.abs(H3 / F) * 100, 1.5, { tol: .02, rtol: .002 })],
      solution: [`Fundamental: ${a}·${A} + (3/4)·${b}·${A}³ = ${N(F, 4)}. Third harmonic: (1/4)·${b}·${A}³ = ${N(H3, 4)} at ${3 * f0} Hz.`], traps: ['Forgetting that x³ also adds to the fundamental.'] }; }
  const fc = r.pick([1, 2, 5, 10]), f = fc * r.pick([2, 3, 4, 5]), X = r.pick([20, 30, 40, 60]), n = Math.ceil(Math.log10(Math.pow(10, X / 10) - 1) / (2 * Math.log10(f / fc)) - 1e-9);
  return { title: 'Butterworth filter order', prompt: `Butterworth low-pass, |H(f)|² = 1/(1 + (f/f<sub>c</sub>)<sup>2n</sup>), f<sub>c</sub> = ${fc} kHz. We need at least <b>${X} dB</b> attenuation at ${f} kHz.`,
    parts: [num('(a)', 'Minimum order n?', n, 2, { tol: 0, rtol: 0 }), num('(b)', 'Attenuation at that frequency with this n (dB)?', 10 * Math.log10(1 + Math.pow(f / fc, 2 * n)), 1, { tol: .05, rtol: 0 }), num('(c)', 'Attenuation at f<sub>c</sub> (dB)?', 10 * Math.log10(2), .5, { tol: .02, rtol: 0 })],
    solution: [`10log₁₀(1 + (${f}/${fc})<sup>2n</sup>) ≥ ${X} → n ≥ log₁₀(10<sup>${X / 10}</sup> − 1)/(2log₁₀${f / fc}) → n = ${n}.`], traps: ['Rounding n down.'] };
}
/* T8: random signals and noise */
function gT8(r) {
  const N0 = r.pick([1e-9, 2e-9, 4e-10, 1e-8]), B = r.pick([1000, 2000, 5000, 10000]), B2 = B * r.pick([.25, .5]), tau = r.pick([1 / (4 * B), 1 / (2 * B), 1 / (8 * B)]), P = N0 * B;
  return { title: 'Band-limited white noise', prompt: `WSS noise with PSD S(f) = N₀/2 for |f| < B and 0 otherwise, N₀ = ${N0.toExponential(1)} W/Hz, B = ${B} Hz.`,
    parts: [num('(a)', 'Average power (W)?', P, 1, { rtol: .002, show: P.toExponential(3) }), num('(b)', `Autocorrelation R(τ) = N₀B·sinc(2Bτ) at τ = ${N(tau * 1e6, 1)} µs (W)?`, P * sinc(2 * B * tau), 1.5, { rtol: .005, show: (P * sinc(2 * B * tau)).toExponential(3) }),
      num('(c)', 'Largest sampling interval giving uncorrelated samples, 1/(2B) (ms)?', 1000 / (2 * B), 1, { tol: .0001, rtol: 0 }),
      num('(d)', `Output power after an ideal low-pass filter with cut-off ${B2} Hz (W)?`, N0 * B2, 1.5, { rtol: .002, show: (N0 * B2).toExponential(3) }),
      mc('(e)', 'Output PSD of an LTI filter H(f) driven by S<sub>x</sub>(f)?', 'S<sub>y</sub>(f) = |H(f)|²·S<sub>x</sub>(f)', ['S<sub>y</sub> = H(f)·S<sub>x</sub>(f)', 'S<sub>y</sub> = S<sub>x</sub>(f)/|H(f)|', 'S<sub>y</sub> = |H(f)|·S<sub>x</sub>(f)²'], .5, '')],
    solution: [`P = ∫S(f)df = (N₀/2)·2B = ${P.toExponential(3)} W = R(0).`, 'R(τ) = F⁻¹{S(f)} = N₀B·sinc(2Bτ): zeros at τ = k/(2B).'], traps: ['Forgetting that the two-sided PSD spans −B…B.'] };
}
/* new 6 × 1 p multiple-choice warm-up (26.8.2026 P1 style) */
function gWarm(r) {
  const c = r.pick([.25, .3, .4, .6, .75, 1.2]), A = r.pick([2, 3, 5]), B = r.pick([1, 2, 4]), f0 = r.pick([100, 200, 1000]), s = r.pick([0, 1, 2, .5]);
  const sv = s === 0 ? '1' : s === .5 ? '2/π ≈ 0.637' : '0';
  const all = [
    mc('', `rect(${c}) = ?`, c < .5 ? '1' : '0', [c < .5 ? '0' : '1', '1/2', String(c)], 1, 'rect(t) = 1 for |t| < 1/2, 0 for |t| > 1/2.'),
    mc('', `What is the amplitude of x(t) = ${A}cos(2π·${f0}t + π/3)?`, String(A), [String(A / 2), String(A * 2), `${A}·cos(π/3)`], 1, ''),
    mc('', `sinc(${s}) = ?`, sv, ['1', '0', '2/π ≈ 0.637', 'π'].filter(x => x !== sv).slice(0, 3), 1, 'sinc(x) = sin(πx)/(πx), sinc(0) = 1, zero at non-zero integers.'),
    mc('', `A ${B} kHz baseband signal is DSB-modulated onto a carrier. Bandwidth of the modulated signal?`, `${2 * B} kHz`, [`${B} kHz`, `${B / 2} kHz`, `${4 * B} kHz`], 1, 'Both sidebands: 2B.'),
    mc('', 'Fourier transform of δ(t)?', '1', ['δ(f)', '0', 'u(f)'], 1, ''),
    mc('', 'The Fourier transform of a real and even signal is…', 'real and even', ['imaginary and odd', 'real and odd', 'complex with no symmetry'], 1, ''),
    mc('', `Fourier transform of cos(2π·${f0}t)?`, `½[δ(f − ${f0}) + δ(f + ${f0})]`, [`δ(f − ${f0})`, `½[δ(f − ${f0}) − δ(f + ${f0})]`, `sinc(${f0}f)`], 1, ''),
    mc('', 'Fourier transform of δ(t − t₀)?', 'e<sup>−j2πft₀</sup>', ['e<sup>j2πft₀</sup>', 'δ(f − t₀)', '1'], 1, ''),
    mc('', `tria(${c}) with tria(t) = 1 − |t| for |t| < 1?`, c < 1 ? String(L.round(1 - c, 2)) : '0', [c < 1 ? '0' : '1', String(c), '1'].filter((x, i, a) => a.indexOf(x) === i && x !== (c < 1 ? String(L.round(1 - c, 2)) : '0')), 1, '')];
  return { title: 'Multiple-choice warm-up (6 × 1 p)', prompt: 'New in the 26.8.2026 exam: Problem 1 is six quick multiple-choice questions.', parts: r.sample(all, 6).map((p, i) => Object.assign(p, { label: `(${i + 1})` })), solution: ['Know the basic pairs and definitions cold: rect, tria, sinc, δ, cos ↔ two impulses, real/even ↔ real/even, DSB doubles the bandwidth.'], traps: [] };
}

XM.register({
  id: 'ss', code: 'ELEC-A7200', name: 'Signals and Systems', short: 'S&S', accent: '#6FA8FF', arena: 'ELEC-A7200',
  bosses: ['The Line Spectrum', 'Sinc Sovereign', 'The Orthonormal', 'The Aliaser', 'The FFT', 'The Filter Bank', 'White Noise', 'The Examiner'],
  exam: { date: '2027-02-01T09:00:00', tentative: true, where: 'pen & paper with the equation sheet, Mon 1.2.2027 (time and room: check Sisu)', format: 'Pen & paper with the equation sheet: 5 problems of ~6 p (26.8.2026: P1 = 6 multiple-choice questions, all compulsory).',
    notes: '<p>Optional retake. Every problem comes from 8 templates (T1–T8, see your <i>A7200-exam-playbook</i>); all are generators here with new numbers each time, plus the new <b>multiple-choice warm-up</b>.</p>' },
  topics: { t1: { name: 'T1 Fourier series + Parseval', slot: 'every paper', weight: 1, freq: '7/7 recent papers' }, t2: { name: 'T2 FT of a pulse', slot: 'MT1 / exam', weight: .9 }, t3: { name: 'T3 Convolution', slot: 'MT1 / exam', weight: .9 }, t4: { name: 'T4 Inner product / Gram–Schmidt', slot: 'MT1', weight: .6 },
    t5: { name: 'T5 Sampling / DFT', slot: 'MT2 / exam', weight: .9 }, t6: { name: 'T6 First-order LTI', slot: 'MT2 / exam', weight: .8 }, t7: { name: 'T7 Non-linear / Butterworth', slot: 'MT2', weight: .4 }, t8: { name: 'T8 Random signals', slot: 'MT2', weight: .5 }, mcq: { name: 'MCQ warm-up', slot: 'P1 (new)', weight: .7 } },
  templates: {
    t1: { topic: 't1', title: 'T1 Fourier series of a cosine sum', kinds: 'numeric + table', source: SRC + 'T1 (e.g. 26.8.2026 P2, 2.2.2026 P1)', weight: 1.4, gen: gT1 },
    t2: { topic: 't2', title: 'T2 Fourier transform of a pulse', kinds: 'figure + multiple choice + numeric', source: SRC + 'T2 (27.8.2025 P2, 2.2.2026 P3)', gen: gT2 },
    t3: { topic: 't3', title: 'T3 Convolution (rect∗rect, exponential, RC)', kinds: 'numeric + multiple choice', source: SRC + 'T3 (26.8.2026 P3)', gen: gT3 },
    t4: { topic: 't4', title: 'T4 Inner product and Gram–Schmidt', kinds: 'numeric + table', source: SRC + 'T4 (MT1 2025 P2)', gen: gT4 },
    t5: { topic: 't5', title: 'T5 Sampling, DFT bins, Parseval, aliasing', kinds: 'numeric + table', source: SRC + 'T5 (26.8.2026 P5)', weight: 1.2, gen: gT5 },
    t6: { topic: 't6', title: 'T6 First-order LTI system', kinds: 'numeric + multiple choice', source: SRC + 'T6 (26.8.2026 P4)', gen: gT6 },
    t7: { topic: 't7', title: 'T7 Non-linear harmonics / Butterworth order', kinds: 'numeric', source: SRC + 'T7 (27.8.2025 P5)', gen: gT7 },
    t8: { topic: 't8', title: 'T8 Band-limited noise', kinds: 'numeric + multiple choice', source: SRC + 'T8 (MT2 2025 P3)', gen: gT8 },
    warm: { topic: 'mcq', title: 'Multiple-choice warm-up (6 × 1 p)', kinds: 'multiple choice', source: 'Same type as S&S 26.8.2026 P1', gen: gWarm }
  },
  mock: { title: 'S&S mock exam (26.8.2026 format)', minutes: 180, points: 30, rules: 'Equation sheet allowed; calculator as in the real exam.',
    slots: [{ label: 'P1 Multiple choice', points: 6, tpls: ['warm'] }, { label: 'P2 Fourier series', points: 6, tpls: ['t1'] }, { label: 'P3 Convolution / pulse FT', points: 6, tpls: ['t3', 't2'] }, { label: 'P4 LTI system', points: 6, tpls: ['t6'] }, { label: 'P5 Sampling / DFT', points: 6, tpls: ['t5'] }] },
  papers: []
});
})(typeof window !== 'undefined' ? window : globalThis);
