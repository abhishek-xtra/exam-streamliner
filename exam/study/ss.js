/* ELEC-A7200 S&S Study Hall — follows the A7200 exam playbook: conventions → P1 multiple choice →
   T1 … T8 in the order of how often they appear. Equation-sheet notation throughout. */
(function (G) {
'use strict';
const XM = G.XM; XM.study = XM.study || {};
const T = (head, rows) => `<div class="xm-tw"><table><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
const note = (t, b) => `<div class="xm-note"><b>${t}</b> ${b}</div>`;

XM.study.ss = [
{ id: 'overview', slot: 'Start here', title: 'The exam, the equation sheet and the 8 templates', intro: 'Pen and paper with the equation sheet. Full exam: 5 problems of about 6 p. 26.8.2026: all 5 compulsory, <b>P1 is now 6 multiple-choice questions</b>. 2.2.2026: P1 + P2 compulsory, then any 3 of P3–P6. Midterm 1 = continuous-time signals (T1–T4), Midterm 2 = sampling/DFT, LTI, noise (T5–T8).',
  know: T(['Template', 'Seen in', 'Priority'], [['T1 Fourier series of a cosine sum', 'every paper', '★★★'], ['T2 FT of a pulse', '8/2025, 2/2026, MT1s', '★★★'], ['T3 Convolution', '8/2026, 8/2025, MT1s', '★★★'], ['T4 Inner product / Gram–Schmidt', 'MT1s, 2/2026', '★★'], ['T5 Sampling / DFT', '8/2026, MT2s', '★★★'], ['T6 First-order LTI', '8/2026, every MT2', '★★'], ['T7 Non-linear / Butterworth', '8/2025, MT2 2023', '★'], ['T8 Random signals', 'MT2s', '★★']]) +
    note('Equation-sheet conventions:', 'sinc(x) = sin(πx)/(πx); rect(t/a) ↔ a·sinc(af); tria(t/T) (1 − |t|/T for |t| &lt; T) ↔ T·sinc²(Tf); x(t − a) ↔ X(f)e<sup>−j2πfa</sup>; x(t)cos(2πat) ↔ ½[X(f − a) + X(f + a)]; dx/dt ↔ j2πf X(f); x ∗ y ↔ X·Y; x<sub>k</sub> = (1/T₀)∫x(t)e<sup>−j2πkf₀t</sup>dt; DFT X[k] = Σ x[n]e<sup>−j2πkn/N</sup>.') +
    note('Not on the sheet:', '<b>Parseval for Fourier series</b>, P = (1/T₀)∫|x(t)|²dt = Σ|x<sub>k</sub>|². Memorise it.') },

{ id: 'mcq', slot: 'P1 · 6 p', title: 'Multiple-choice warm-up: the basic facts', topic: 'mcq', tpls: ['warm'],
  know: T(['Question type (8/2026)', 'Fact'], [['rect(0.75)', '0 (rect(t) = 1 for |t| &lt; ½, 0 for |t| &gt; ½)'], ['amplitude of A cos(2πf₀t + φ)', 'A'], ['sinc(0)', '1; sinc(k) = 0 for integers k ≠ 0; sinc(½) = 2/π'], ['bandwidth after DSB modulation', '2B'], ['F{δ(t)}', '1; F{δ(t − t₀)} = e<sup>−j2πft₀</sup>; F{1} = δ(f)'], ['FT of a real and even signal', 'real and even (real and odd → imaginary and odd)'], ['F{cos 2πf₀t}', '½[δ(f − f₀) + δ(f + f₀)]']]) },

{ id: 't1', slot: 'T1', title: 'Fourier series of a cosine sum, spectra, power', topic: 't1', tpls: ['t1'],
  asks: ['Period / fundamental frequency, exponential FS coefficients, two-sided amplitude and phase spectrum, one-sided power spectrum, average power (Parseval). Sometimes in reverse: spectrum → signal (1/2025).'],
  know: note('Euler:', 'A cos(2πkf₀t + φ) = (A/2)e<sup>jφ</sup>e<sup>j2πkf₀t</sup> + (A/2)e<sup>−jφ</sup>e<sup>−j2πkf₀t</sup> → x<sub>±k</sub> = (A/2)e<sup>±jφ</sup>. A sine: sin θ = cos(θ − π/2).') +
    note('Fundamental:', 'f₀ = gcd of all frequencies; T₀ = 1/f₀.') + note('Hermitian:', 'x<sub>−k</sub> = x<sub>k</sub>* for real signals: even amplitude spectrum, odd phase spectrum.') +
    note('Power:', 'P = Σ|x<sub>k</sub>|² = A₀² + Σ A<sub>k</sub>²/2. One-sided power spectrum: |x₀|² at DC, 2|x<sub>k</sub>|² = A<sub>k</sub>²/2 for k ≥ 1.'),
  method: ['Rewrite every term as cosines with a phase.', 'Find f₀ and the harmonic numbers k.', 'Write x<sub>k</sub> for ±k (and x₀).', 'Draw <b>stems</b> at kf₀ with heights |x<sub>k</sub>| and a phase plot with arg x<sub>k</sub>.', 'Parseval for the power.'],
  traps: ['Drawing curves instead of stems.', 'Forgetting −90° for a sine.', 'One-sided spectrum: doubling the DC term too.'] },

{ id: 't2', slot: 'T2', title: 'Fourier transform of a pulse (derivative trick)', topic: 't2', tpls: ['t2'],
  know: note('Building blocks:', 'rect(t/a) ↔ a sinc(af); tria(t/T) ↔ T sinc²(Tf); delay t₀ → × e<sup>−j2πft₀</sup> (magnitude unchanged).') +
    note('Derivative trick:', 'differentiate the pulse: sloped parts become rects, jumps become δ\'s; transform the derivative with the table, then divide by j2πf. A trapezoid is also (A/b)·rect(t/a) ∗ rect(t/b) → A·a·sinc(af)·sinc(bf).') +
    note('Checks:', 'X(0) = area of the pulse; zeros where the sinc arguments are non-zero integers.'),
  method: ['Sketch and label breakpoints.', 'Write as a sum/convolution of rects/trias, or differentiate.', 'Use the table + shift theorem.', 'Check X(0) = area.'],
  traps: ['Forgetting to divide by j2πf.', 'Wrong width: tria(t/T) has base 2T.'] },

{ id: 't3', slot: 'T3', title: 'Convolution', topic: 't3', tpls: ['t3'],
  know: note('Time domain:', 'y(t) = ∫x(τ)h(t − τ)dτ: flip h, slide by t, integrate the overlap. List the <b>regimes of t</b> (no overlap, partial, full, partial, none) before integrating.') +
    note('rect ∗ rect:', 'A·rect(t/a) ∗ B·rect(t/b) = trapezoid of height A·B·min(a, b), total width a + b, flat top |a − b| (triangle if a = b).') +
    note('Exponential ∗ step:', 'e<sup>−αt</sup>u(t) ∗ u(t) = (1 − e<sup>−αt</sup>)/α · u(t). RC step response: 1 − e<sup>−t/RC</sup>.') +
    note('Frequency domain:', 'x ∗ h ↔ X·H; convolution with δ(f ± f₀) shifts copies (modulation).'),
  traps: ['Integrating without splitting into regimes.', 'Forgetting u(t) factors.'] },

{ id: 't4', slot: 'T4', title: 'Inner product and Gram–Schmidt', topic: 't4', tpls: ['t4'],
  know: note('Inner product:', '⟨x, y⟩ = ∫ x(t) y*(t) dt; energy E = ⟨x, x⟩; orthogonal ⇔ ⟨x, y⟩ = 0.') +
    note('Gram–Schmidt:', 'φ₁ = x/√E<sub>x</sub>; c = ⟨y, φ₁⟩; r = y − c·φ₁; φ₂ = r/√E<sub>r</sub>. Coefficients of y: (c, ⟨y, φ₂⟩); E<sub>y</sub> = c² + ⟨y, φ₂⟩².') +
    note('Piecewise-constant signals:', 'integrals become sums of value × interval length.'),
  traps: ['Forgetting the interval length.', 'Not normalising φ₂.'] },

{ id: 't5', slot: 'T5', title: 'Sampling, DFT bins, Parseval, zero padding, aliasing', topic: 't5', tpls: ['t5'],
  know: T(['Item', 'Formula'], [['Nyquist frequency', 'f<sub>N</sub> = f<sub>s</sub>/2 (Nyquist rate = 2·f<sub>max</sub>)'], ['Bin spacing', 'Δf = f<sub>s</sub>/N'], ['Frequency of index k', 'k·f<sub>s</sub>/N for k ≤ N/2, <b>(k − N)·f<sub>s</sub>/N</b> above N/2 (negative frequencies)'], ['Tone A cos at bin m', 'peaks at k = m and N − m, each |X| = A·N/2'], ['Parseval (DFT)', 'Σ|x[n]|² = (1/N) Σ|X[k]|²'], ['Alias', 'a tone f appears at |f − n·f<sub>s</sub>| folded into [0, f<sub>s</sub>/2]'], ['Zero padding', 'finer frequency grid (interpolation), <b>not</b> better true resolution (that needs a longer observation N/f<sub>s</sub>)']]),
  traps: ['Positive frequencies for indices above N/2.', 'Claiming zero padding improves resolution.'] },

{ id: 't6', slot: 'T6', title: 'First-order LTI system', topic: 't6', tpls: ['t6'],
  know: note('From the ODE:', 'τ·y′ + y = K·x → H(s) = K/(1 + τs), H(f) = K/(1 + j2πfτ).') +
    note('Responses:', '|H(f)| = K/√(1 + (2πfτ)²); Φ(f) = −arctan(2πfτ); h(t) = (K/τ)e<sup>−t/τ</sup>u(t); step response K(1 − e<sup>−t/τ</sup>)u(t); −3 dB at f = 1/(2πτ).') +
    note('Steady state for cos:', 'x = cos(2πf₀t) → y = |H(f₀)| cos(2πf₀t + Φ(f₀)).') +
    note('Stability / group delay / cascade:', 'stable ⇔ pole s = −1/τ in the left half-plane; group delay τ<sub>g</sub> = −(1/2π)dΦ/df = τ/(1 + (2πfτ)²); cascade → multiply H\'s.'),
  traps: ['Radians vs degrees.', 'Forgetting u(t) in h(t).'] },

{ id: 't7', slot: 'T7', title: 'Non-linear systems and Butterworth filters', topic: 't7', tpls: ['t7'],
  know: note('cos³ and cos²:', 'cos³θ = (3/4)cos θ + (1/4)cos 3θ; cos²θ = ½ + ½cos 2θ. For y = ax + bx³, x = A cos: fundamental aA + (3/4)bA³, third harmonic (1/4)bA³ at 3f₀. y = x² gives DC A²/2 and A²/2 at 2f₀.') +
    note('THD:', '√(Σ harmonic powers)/fundamental (one harmonic: |3rd|/|fund|), as %.') +
    note('Butterworth:', '|H(f)|² = 1/(1 + (f/f<sub>c</sub>)<sup>2n</sup>); attenuation 10 log₁₀(1 + (f/f<sub>c</sub>)<sup>2n</sup>) dB ≥ X → n ≥ log₁₀(10<sup>X/10</sup> − 1)/(2 log₁₀(f/f<sub>c</sub>)), round <b>up</b>. 3 dB at f<sub>c</sub>.'),
  traps: ['Forgetting that x³ also feeds the fundamental.', 'Rounding n down.'] },

{ id: 't8', slot: 'T8', title: 'Random signals and noise', topic: 't8', tpls: ['t8'],
  know: note('Band-limited white noise:', 'S(f) = N₀/2 for |f| &lt; B → power P = ∫S df = N₀B = R(0); R(τ) = F⁻¹{S} = N₀B·sinc(2Bτ), zero at τ = k/(2B) → samples uncorrelated for T<sub>s</sub> = 1/(2B).') +
    note('Through a filter:', 'S<sub>y</sub>(f) = |H(f)|²S<sub>x</sub>(f); ideal LPF with cut-off B₂ &lt; B → power N₀B₂.') +
    note('WSS:', 'constant mean, autocorrelation depends only on the lag τ; Wiener–Khinchin: S = F{R}.'),
  traps: ['Forgetting the PSD is two-sided (−B…B).'] }
];
})(typeof window !== 'undefined' ? window : globalThis);
