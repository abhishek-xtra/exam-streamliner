/* S&S flashcards: [Study Hall page id, front, back]. Conventions follow the exam equation sheet. */
(function (G) {
'use strict';
const XM = G.XM; XM.cards = XM.cards || {};
XM.cards.ss = [
['overview', `Parseval for Fourier series (not on the sheet)?`, `P = (1/T₀)∫|x(t)|²dt = Σ|x<sub>k</sub>|².`],
['overview', `sinc(x) on the equation sheet?`, `sin(πx)/(πx).`],
['overview', `x(t)·cos(2πat) in the frequency domain?`, `½[X(f − a) + X(f + a)].`],

['mcq', `rect(0.75)?`, `0 (rect(t) = 1 only for |t| &lt; ½).`],
['mcq', `sinc(0), sinc(k) for integer k ≠ 0, sinc(½)?`, `1 · 0 · 2/π.`],
['mcq', `Bandwidth after DSB modulation of a signal with bandwidth B?`, `2B.`],
['mcq', `F{δ(t)}, F{δ(t − t₀)}, F{1}?`, `1 · e<sup>−j2πft₀</sup> · δ(f).`],
['mcq', `FT of a real and even signal? Real and odd?`, `Real and even · imaginary and odd.`],
['mcq', `F{cos 2πf₀t}?`, `½[δ(f − f₀) + δ(f + f₀)].`],

['t1', `Exponential FS coefficients of A cos(2πkf₀t + φ)?`, `x<sub>±k</sub> = (A/2)e<sup>±jφ</sup>.`],
['t1', `Fundamental frequency of a sum of cosines?`, `f₀ = gcd of all the frequencies; T₀ = 1/f₀.`],
['t1', `Sine as a cosine with a phase?`, `sin θ = cos(θ − π/2): phase −90°.`],
['t1', `Power of a cosine sum?`, `P = A₀² + Σ A<sub>k</sub>²/2.`],
['t1', `One-sided power spectrum values?`, `|x₀|² at DC (not doubled), 2|x<sub>k</sub>|² = A<sub>k</sub>²/2 for k ≥ 1.`],
['t1', `Symmetry of the spectrum of a real signal?`, `x<sub>−k</sub> = x<sub>k</sub>*: even amplitude, odd phase.`],

['t2', `rect(t/a) ↔ ?`, `a·sinc(af).`],
['t2', `tria(t/T) ↔ ? (base width?)`, `T·sinc²(Tf). The base is 2T wide.`],
['t2', `The derivative trick for pulses?`, `Differentiate: slopes become rects, jumps become δ's. Transform with the table, then <b>divide by j2πf</b>.`],
['t2', `Quick check of a pulse's transform?`, `X(0) = area of the pulse.`],
['t2', `Effect of a delay t₀ on X(f)?`, `× e<sup>−j2πft₀</sup>; the magnitude is unchanged.`],

['t3', `A·rect(t/a) ∗ B·rect(t/b)?`, `A trapezoid: height A·B·min(a, b), total width a + b, flat top |a − b| (triangle if a = b).`],
['t3', `e<sup>−αt</sup>u(t) ∗ u(t)?`, `(1 − e<sup>−αt</sup>)/α · u(t).`],
['t3', `Before integrating a convolution by hand?`, `Flip h, slide by t, and list the regimes of t (no overlap, partial, full, partial, none).`],

['t4', `Inner product and energy of signals?`, `⟨x, y⟩ = ∫x(t)y*(t)dt; E = ⟨x, x⟩; orthogonal ⇔ ⟨x, y⟩ = 0.`],
['t4', `Gram–Schmidt for two signals x, y?`, `φ₁ = x/√E<sub>x</sub>; c = ⟨y, φ₁⟩; r = y − c·φ₁; φ₂ = r/√E<sub>r</sub>.`],

['t5', `DFT bin spacing and the frequency of index k?`, `Δf = f<sub>s</sub>/N. k·f<sub>s</sub>/N for k ≤ N/2, (k − N)·f<sub>s</sub>/N above N/2.`],
['t5', `A cos at bin m in an N-point DFT?`, `Peaks at k = m and N − m, each |X| = A·N/2.`],
['t5', `Parseval for the DFT?`, `Σ|x[n]|² = (1/N) Σ|X[k]|².`],
['t5', `Where does a tone f appear after sampling at f<sub>s</sub>?`, `At |f − n·f<sub>s</sub>| folded into [0, f<sub>s</sub>/2].`],
['t5', `Does zero padding improve frequency resolution?`, `No: it gives a finer grid (interpolation). True resolution needs a longer observation N/f<sub>s</sub>.`],

['t6', `First-order system τy′ + y = Kx: H(f)?`, `K / (1 + j2πfτ).`],
['t6', `Its impulse and step response?`, `h(t) = (K/τ)e<sup>−t/τ</sup>u(t). Step: K(1 − e<sup>−t/τ</sup>)u(t).`],
['t6', `Its −3 dB frequency?`, `f = 1/(2πτ).`],
['t6', `Steady-state output for x = cos(2πf₀t)?`, `|H(f₀)| cos(2πf₀t + Φ(f₀)), with Φ(f) = −arctan(2πfτ).`],

['t7', `cos³θ and cos²θ?`, `cos³θ = ¾cos θ + ¼cos 3θ. cos²θ = ½ + ½cos 2θ.`],
['t7', `y = ax + bx³ with x = A cos: fundamental and 3rd harmonic?`, `Fundamental aA + ¾bA³. Third harmonic ¼bA³ at 3f₀.`],
['t7', `Butterworth order for attenuation ≥ X dB at f?`, `n ≥ log₁₀(10<sup>X/10</sup> − 1) / (2 log₁₀(f/f<sub>c</sub>)), rounded <b>up</b>.`],

['t8', `Band-limited white noise S(f) = N₀/2 for |f| &lt; B: power and R(τ)?`, `P = N₀B = R(0). R(τ) = N₀B·sinc(2Bτ), zero at τ = k/(2B).`],
['t8', `PSD at the output of a filter H?`, `S<sub>y</sub>(f) = |H(f)|²S<sub>x</sub>(f).`],
['t8', `Define WSS and Wiener–Khinchin.`, `WSS: constant mean, autocorrelation depends only on the lag τ. Wiener–Khinchin: S = F{R}.`],
];
})(typeof window !== 'undefined' ? window : globalThis);
