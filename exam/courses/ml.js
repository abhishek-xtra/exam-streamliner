/* CS-C3240 Machine Learning — retake in the EXAM room (your slot: Fri 11.12.2026), 2 h.
   Part 1: multiple-choice quiz in MyCourses (20 questions, 40 p). Part 2: Jupyter coding (3 questions, 15 p).
   Contents: the 50 MCQs from ML_Trends_Notes_and_50_MCQs.pdf (with their reasons), "turn the knob"
   trend questions from its trend table, formula calculations with new numbers, and code-completion /
   predict-the-output tasks that mirror Assignments 1–5. */
(function (G) {
'use strict';
const XM = G.XM, L = XM.lib, h = L.esc;
const mc = (label, prompt, correct, wrongs, points, why, o) => Object.assign({ type: 'mcq', label, prompt, options: [correct].concat(wrongs), answer: 0, points: points || 1, why }, o || {});
const num = (label, prompt, answer, points, o) => Object.assign({ type: 'numeric', label, prompt, answer, points: points || 1, rtol: .005 }, o || {});
const N = (x, d) => L.num(x, d === undefined ? 3 : d);
const SRC_PDF = 'Your ML_Trends_Notes_and_50_MCQs.pdf';

/* ======================= the 50 MCQs (question, correct, wrongs, reason, lecture) ======================= */
const M = [
 ['Which task would typically use unsupervised machine learning?', 'Sorting newspaper articles into groups without any labels', ['Classifying emails as spam using labelled examples', 'Detecting card fraud from transactions labelled fraud/legitimate', 'Predicting house prices from past sales with known prices'], 'No labels and the goal is to find groups = clustering = unsupervised.', 1],
 ['Soft-margin SVM with hinge loss + (λ/2)‖w‖²: what happens to the margin when λ is decreased?', 'The margin gets narrower and fewer violations are tolerated', ['The margin gets wider and more violations are tolerated', 'The margin is unchanged; only the bias moves', 'All points become support vectors'], 'Smaller λ lets ‖w‖ grow; margin width 2/‖w‖ shrinks. λ → 0 is the hard-margin limit.', 3],
 ['In L2-regularised logistic regression, increasing λ will most likely…', 'shrink the weights, raising bias and lowering variance', ['grow the weights and lower bias', 'turn the model into k-NN', 'make the training error exactly zero'], 'Larger λ penalises large weights: simpler model.', 3],
 ['Polynomial regression on 10 noisy points with M = 1, 3, 9. Which is correct?', 'Training error never rises with M, while test error falls and then rises', ['M = 9 generalises best because training error is 0', 'Training error is lowest at M = 1', 'Test error falls steadily all the way to M = 9'], 'Training error is non-increasing in M (zero at M + 1 = n); test error is U-shaped.', 2],
 ['A learning curve shows training and CV error both high and close together. Best next step?', 'Use a richer model (higher degree, more features)', ['Increase the regularisation strength', 'Collect much more data', 'Stop training earlier'], 'High bias: more data will not help, a more flexible model will.', 2],
 ['Training error low, CV error high with a large gap. Most appropriate action?', 'Get more data or add regularisation', ['Decrease λ', 'Remove regularisation', 'Increase the polynomial degree'], 'High variance (overfitting).', 2],
 ['In k-NN, increasing K generally…', 'smooths the decision boundary: higher bias, lower variance', ['makes the boundary more jagged', 'adds learnable parameters', 'guarantees zero training error'], 'K = 1 gives jagged boundaries and zero training error.', 5],
 ['An RBF-kernel SVM uses a very small σ. Most likely outcome?', 'Overfitting: each training point gets its own island', ['An infinitely wide margin', 'The same result as a linear SVM', 'Underfitting with a nearly linear boundary'], 'Small σ = very local kernel = highly flexible.', 4],
 ['When the number of principal components k in PCA is increased…', 'reconstruction error decreases but compression decreases too', ['explained variance ratio decreases', 'reconstruction error increases', 'the eigenvalues change'], 'Each extra component adds explained variance.', 4],
 ['When the number of clusters k in K-means is increased (best of many runs)…', 'the minimum loss never increases and reaches 0 at k = n, so use the elbow', ['the loss increases', 'K-means finds the global optimum', 'the loss stays constant'], 'Loss is non-increasing in k, so it cannot select k by itself.', 7],
 ['DBSCAN with minPts fixed: increasing ε typically…', 'merges clusters and reduces the number of noise points', ['has no effect', 'creates more noise points', 'splits clusters into smaller ones'], 'Larger neighbourhoods: more core/border points, clusters join.', 7],
 ['Which statement about DBSCAN is TRUE?', 'It finds arbitrary-shaped clusters and labels sparse points as noise', ['It always finds the global optimum', 'It needs the number of clusters in advance', 'It assumes spherical clusters'], 'DBSCAN has ε and minPts, not k. K-means is the spherical one.', 7],
 ['In gradient descent, a learning rate far too large typically causes…', 'oscillation or divergence; the loss may grow', ['zero gradients', 'guaranteed fastest convergence', 'very slow, almost linear descent'], 'Too small = slow; too large = overshoot.', 2],
 ['In a random forest, restricting each split to a random subset of features mainly…', 'makes the trees less alike so averaging cancels more noise', ['reduces the bias of each tree', 'prunes the trees', 'replaces bootstrapping'], 'Otherwise one strong feature wins the root in almost every tree.', 5],
 ['Which pairing of ensemble method and main effect is correct?', 'Bagging lowers variance; boosting lowers bias and can overfit with many rounds', ['Bagging lowers bias; boosting lowers variance', 'Both use very deep trees', 'Both train their trees in parallel'], 'Bagging: parallel deep trees. Boosting: sequential shallow trees fixing residuals.', 5],
 ['Which of these are all parametric models?', 'Linear regression, logistic regression, neural networks', ['k-NN, decision trees, kernel density', 'k-NN, random forest', 'Kernel density, k-NN, linear regression'], 'Parametric = fixed-size θ; the data can be discarded.', 5],
 ['A parametric model with the wrong assumed form is trained on ever more data. The bias…', 'remains: more data cannot fix a mis-specified model', ['turns the model non-parametric', 'disappears', 'becomes variance'], 'E.g. one Gaussian fitted to two clusters stays wrong.', 8],
 ['A decision tree picks the split with…', 'the highest information gain (lowest weighted child entropy)', ['the lowest parent entropy', 'the highest weighted child entropy', 'the most branches'], 'Gain = parent entropy − weighted child entropy.', 5],
 ['Pruning a fully grown decision tree usually…', 'slightly raises training error and lowers error on new data', ['has no effect on either', 'lowers training error and raises test error', 'lowers both'], '', 5],
 ['Raising the decision threshold for the positive class typically…', 'raises precision and lowers recall', ['leaves both unchanged', 'raises both', 'raises recall and lowers precision'], 'Fewer, more confident positives.', 3],
 ['99 % of the data is negative; a classifier always predicts negative. Which metric looks excellent but misleads?', 'Accuracy (99 %)', ['F1 for the positive class', 'Recall for the positive class', 'Precision for the positive class'], 'Accuracy is dominated by the majority class.', 3],
 ['Screening for a serious disease where missing a sick patient is very costly. Prioritise…', 'recall', ['precision', 'false positive rate only', 'accuracy'], 'Recall = TP/(TP + FN): few false negatives.', 3],
 ['Which statement about hard- and soft-margin SVMs is TRUE?', 'Soft margin allows violations and copes with non-separable data', ['Soft margin corresponds to λ → 0', 'Hard margin works on non-separable data', 'Hard margin always has fewer support vectors'], 'Hard margin is the λ → 0 limit and needs separable data.', 3],
 ['Hinge loss differs from logistic loss in that…', 'hinge loss is exactly zero beyond the margin; logistic loss is never exactly zero', ['hinge loss outputs probabilities', 'logistic loss is non-convex', 'both are zero beyond the margin'], 'That is why only support vectors matter in an SVM.', 3],
 ['Which training problem has a convex loss (single global minimum)?', 'Logistic regression with L2 regularisation', ['A deep neural network', 'K-means clustering', 'A convolutional network'], '', 3],
 ['Standardisation (x − mean)/std should use statistics from…', 'the training set only, reused for validation and test', ['each sample separately', 'the full dataset including test', 'the test set'], 'Avoids leaking test information.', 4],
 ['Which feature selection approach uses the classifier\'s own performance and is the most expensive?', 'Wrapper', ['Filter', 'Pearson correlation ranking', 'Embedded'], '', 4],
 ['Which is an embedded feature selection method?', 'L1 regularisation (LASSO)', ['Pearson correlation ranking', 'FOCUS', 'Las Vegas random subsets'], 'Selection happens during training.', 4],
 ['Fixed number of samples; adding many irrelevant features to k-NN will most likely…', 'hurt performance (curse of dimensionality)', ['leave it unchanged', 'improve accuracy', 'make k-NN parametric'], '', 4],
 ['Compared with a fully connected layer on the same image, a convolutional layer has…', 'far fewer weights thanks to local connectivity and weight sharing', ['more weights', 'the same number of weights', 'fixed, non-learned weights'], '28×28 → 26×26 map: ~530 000 dense weights vs 9.', 6],
 ['Same input, kernel and padding: increasing the stride from 1 to 2…', 'roughly halves the output height and width', ['removes the padding', 'doubles the output size', 'doubles the number of parameters'], 'Output = ⌊(n + 2p − k)/s⌋ + 1.', 6],
 ['A convolution with stride 1 and padding p = (k − 1)/2 gives an output that is…', 'the same size as the input', ['twice as large', 'smaller by k − 1', '1 × 1'], '"Same" padding.', 6],
 ['A pooling layer…', 'has no learnable parameters and down-samples the feature map', ['applies softmax', 'adds learnable weights per window', 'increases resolution'], '', 6],
 ['Compared with a simple RNN, an LSTM handles long sequences better because…', 'its additive cell state with a forget gate lets gradients flow over many steps', ['it has no gates', 'it uses convolution', 'it removes the hidden state'], '', 6],
 ['Transformers versus RNNs:', 'transformers process all positions in parallel, need positional embeddings, and attention cost grows quadratically with length', ['transformers process tokens strictly one by one', 'RNNs use self-attention', 'transformers need no notion of position'], 'Self-attention is permutation-invariant.', 10],
 ['BERT vs GPT:', 'GPT is decoder-only with causal attention and next-token training; BERT is encoder-only, bidirectional, trained with masked tokens', ['BERT is decoder-only and causal', 'Both are encoder-decoder models', 'GPT is trained with masked language modelling'], 'T5/BART are the encoder-decoder models.', 10],
 ['Word2Vec embeddings differ from BERT embeddings in that Word2Vec embeddings are…', 'static: one vector per word regardless of context', ['sparse count vectors', 'contextual', 'learned with labels only'], '', 10],
 ['In tf-idf with idf = log(N/df), a word that appears in every document gets…', 'weight 0', ['a negative weight', 'the highest weight', 'weight equal to its term frequency'], 'log(N/N) = 0.', 10],
 ['A main limitation of bag-of-words is that it…', 'ignores word order', ['needs labels', 'cannot count words', 'only works on images'], '', 1],
 ['Which is an example of self-supervised learning?', 'Predicting a masked word from its context in unlabeled text', ['Linear regression on labelled prices', 'PCA of face images', 'K-means on customer data'], 'The label is created from the data itself.', 7],
 ['In active learning, the learner…', 'chooses which unlabeled examples should be labelled', ['uses no labels at all', 'receives labels for every example', 'learns from rewards'], '', 7],
 ['Bayesian linear regression with a Gaussian prior on the weights: the MAP estimate equals…', 'least squares with an L2 penalty (ridge)', ['the k-NN prediction', 'least squares with an L1 penalty', 'ordinary least squares'], 'The log of a Gaussian prior is a sum of squared weights.', 8],
 ['As the training data grows, the influence of the prior on the MAP estimate…', 'shrinks, so MAP approaches MLE', ['flips sign', 'stays constant', 'grows'], '', 8],
 ['Collecting more training data mainly reduces…', 'epistemic uncertainty', ['both completely', 'neither', 'aleatoric uncertainty'], 'Inherent noise (aleatoric) is not reducible.', 8],
 ['In ε-greedy bandits, a larger ε leads to…', 'more exploration but a lower long-run average reward', ['a higher long-run average reward', 'UCB behaviour', 'less exploration'], '', 9],
 ['In UCB, the uncertainty bonus of an arm…', 'shrinks as the arm is pulled more often', ['is the same for all arms', 'grows with every pull of that arm', 'is replaced by ε'], '', 9],
 ['A contextual bandit differs from full RL because…', 'rewards depend on context, but actions do not change the next state and rewards are immediate', ['there is no reward', 'rewards are delayed', 'actions change the next state'], '', 9],
 ['Increasing the CV folds from 5 to n (leave-one-out)…', 'trains many more models: a less biased but costly estimate', ['reduces to a single split', 'uses the test set', 'is cheaper'], '', 2],
 ['In a learning curve (not a training curve) the x-axis is…', 'the training-set size', ['epochs', 'the learning rate', 'the number of folds'], '', 2],
 ['Training loss keeps falling but validation loss reaches a minimum and rises. Best response?', 'Early stopping at the epoch with the lowest validation loss', ['Train much longer', 'Increase the learning rate', 'Add depth'], 'Early stopping acts as a regulariser.', 6]
];
/* "turn the knob" trend bank (from the trend table) */
const KNOBS = [
 ['Increase the regularisation λ (ridge / logistic / soft-margin SVM).', 'Weights shrink; SVM margin gets wider; bias up, variance down', ['Weights grow; margin narrower', 'Training error falls to zero', 'Nothing changes for SVMs'], 2],
 ['Increase the polynomial degree M.', 'Training error never rises; validation error falls then rises', ['Both errors always fall', 'Training error rises', 'Validation error always rises'], 2],
 ['Increase the training set size N with a fixed model.', 'Training error rises slightly, CV error falls; it reduces variance, not bias', ['It removes the bias of a wrong model', 'Both errors rise', 'CV error rises'], 2],
 ['Increase K in k-NN.', 'Smoother boundary; bias up, variance down; very large K predicts the majority class', ['More jagged boundary', 'Zero training error', 'More parameters'], 5],
 ['Increase the RBF kernel width σ.', 'Smoother, simpler boundary (underfits if too large)', ['Each point becomes its own island', 'More support vectors always', 'Same as raising the polynomial degree'], 4],
 ['Increase the number of PCA components k.', 'Explained variance up, reconstruction error down, compression down', ['Reconstruction error up', 'Eigenvalues change', 'Explained variance ratio down'], 4],
 ['Increase the number of clusters k in K-means.', 'Minimum loss never increases (0 at k = n): choose k with the elbow', ['Loss increases', 'Loss picks the true k', 'Clusters merge'], 7],
 ['Increase DBSCAN ε (minPts fixed).', 'Clusters merge and fewer points are noise', ['More noise points', 'Clusters split', 'Need to set k'], 7],
 ['Increase DBSCAN minPts (ε fixed).', 'Fewer core points, more noise, fewer/smaller clusters', ['More clusters', 'Less noise', 'No effect'], 7],
 ['Increase the learning rate η far too much.', 'Oscillation or divergence (loss grows, NaN)', ['Slower, smoother descent', 'Guaranteed faster convergence', 'Gradients become zero'], 2],
 ['Decrease the mini-batch size B.', 'Noisier gradients, more updates per epoch, mild regularisation', ['Exact gradient', 'Fewer updates per epoch', 'Always worse accuracy'], 6],
 ['Train for more epochs.', 'Training loss keeps falling; validation loss falls then rises (use early stopping)', ['Validation loss always falls', 'Training loss rises', 'Nothing changes'], 6],
 ['Increase the decision threshold.', 'Precision up, recall down', ['Recall up, precision down', 'Both up', 'Accuracy always up'], 3],
 ['Increase ε in ε-greedy.', 'More exploration, lower long-run reward', ['Less exploration', 'Higher long-run reward', 'Becomes UCB'], 9],
 ['Increase the discount factor γ towards 1.', 'Future rewards count more: a more far-sighted agent', ['Only immediate rewards matter', 'Learning rate increases', 'Exploration increases'], 9],
 ['Increase the softmax temperature T in text generation.', 'Flatter distribution: more random, diverse text', ['Sharper distribution, more repetitive text', 'No effect', 'Fewer tokens generated'], 10],
 ['Increase tree depth.', 'Training error falls, overfitting risk grows (variance up)', ['Bias up', 'Training error rises', 'Fewer leaves'], 5],
 ['Increase the number of boosting rounds a lot.', 'Bias falls further; can overfit eventually', ['Variance always falls', 'Nothing changes', 'Trees become deeper'], 5]
];

/* ======================= calculation generators ======================= */
const C = {};
C.metrics = r => { const TP = r.int(5, 80), FP = r.int(1, 40), FN = r.int(1, 40), TN = r.int(20, 300), P = TP / (TP + FP), R = TP / (TP + FN), F = 2 * P * R / (P + R), A = (TP + TN) / (TP + FP + FN + TN);
  return { title: 'Confusion matrix metrics', topic: 'l3', prompt: `A binary classifier on the test set: <b>TP = ${TP}</b>, <b>FP = ${FP}</b>, <b>FN = ${FN}</b>, <b>TN = ${TN}</b>.`,
    parts: [num('(a)', 'Accuracy?', A, 1, { tol: .001, rtol: 0 }), num('(b)', 'Precision?', P, 1, { tol: .001, rtol: 0 }), num('(c)', 'Recall?', R, 1, { tol: .001, rtol: 0 }), num('(d)', 'F1 score?', F, 1, { tol: .001, rtol: 0 })],
    solution: [`Accuracy (TP+TN)/all = ${N(A, 4)}; precision TP/(TP+FP) = ${N(P, 4)}; recall TP/(TP+FN) = ${N(R, 4)}; F1 = 2PR/(P+R) = ${N(F, 4)}.`], traps: ['Swapping FP and FN in precision/recall.'] }; };
C.conv = r => { const n = r.pick([28, 32, 64, 100, 224]), k = r.pick([3, 5, 7]), p = r.pick([0, 1, 2, (k - 1) / 2]), s = r.pick([1, 2]), cin = r.pick([1, 3, 16]), cout = r.pick([8, 16, 32, 64]), o = Math.floor((n + 2 * p - k) / s) + 1, pool = Math.floor(o / 2);
  return { title: 'Convolution output size and parameters', topic: 'l6', prompt: `Input ${n}×${n}×${cin}. Conv layer: ${cout} filters of size ${k}×${k}, padding ${p}, stride ${s}.`,
    parts: [num('(a)', 'Output height (= width)?', o, 1.5, { tol: 0, rtol: 0 }), num('(b)', 'Number of learnable parameters (weights + biases)?', k * k * cin * cout + cout, 1.5, { tol: 0, rtol: 0 }), num('(c)', 'After a 2×2 max-pool with stride 2, the height?', pool, 1, { tol: 0, rtol: 0 })],
    solution: [`⌊(${n} + 2·${p} − ${k})/${s}⌋ + 1 = ${o}.`, `Params = ${k}·${k}·${cin}·${cout} + ${cout} = ${k * k * cin * cout + cout}.`, `Pooling: ⌊${o}/2⌋ = ${pool} (no parameters).`], traps: ['Forgetting the input channels in the parameter count.'] }; };
C.entropy = r => { const a = r.int(4, 20), b = r.int(4, 20), la = r.int(0, a), lb = r.int(0, b), ra = a - la, rb = b - lb; if (la + lb === 0 || ra + rb === 0) return C.entropy(r);
  const H = (p, q) => { const t = p + q; return [p, q].filter(x => x).reduce((s, x) => s - x / t * Math.log2(x / t), 0); }, Hp = H(a, b), Hl = H(la, lb), Hr = H(ra, rb), n = a + b, IG = Hp - (la + lb) / n * Hl - (ra + rb) / n * Hr;
  return { title: 'Entropy and information gain', topic: 'l5', prompt: `A node has <b>${a}</b> positive and <b>${b}</b> negative samples. A split sends ${la} positive + ${lb} negative to the left and ${ra} positive + ${rb} negative to the right. Use log base 2.`,
    parts: [num('(a)', 'Entropy of the parent?', Hp, 1, { tol: .002, rtol: 0 }), num('(b)', 'Weighted entropy of the children?', Hp - IG, 1, { tol: .002, rtol: 0 }), num('(c)', 'Information gain?', IG, 1.5, { tol: .002, rtol: 0 })],
    solution: [`H(parent) = ${N(Hp, 4)}; H(left) = ${N(Hl, 4)}, H(right) = ${N(Hr, 4)}; IG = ${N(IG, 4)}.`], traps: ['Using unweighted child entropies.'] }; };
C.tfidf = r => { const Nd = r.pick([10, 20, 50, 100, 1000]), df = r.int(1, Nd), tf = r.int(1, 8), len = r.int(tf + 5, 60);
  return { title: 'tf-idf', topic: 'l10', prompt: `A word appears <b>${tf}</b> times in a document of <b>${len}</b> words, and in <b>${df}</b> of the <b>${Nd}</b> documents. Use tf = count / length and idf = ln(N / df).`,
    parts: [num('(a)', 'tf?', tf / len, 1, { tol: .0005, rtol: 0 }), num('(b)', 'idf?', Math.log(Nd / df), 1, { tol: .002, rtol: 0 }), num('(c)', 'tf-idf?', tf / len * Math.log(Nd / df), 1, { tol: .0005, rtol: .01 })],
    solution: [`tf = ${tf}/${len} = ${N(tf / len, 4)}; idf = ln(${Nd}/${df}) = ${N(Math.log(Nd / df), 4)}; tf-idf = ${N(tf / len * Math.log(Nd / df), 4)}.`], traps: ['A word in every document gets idf = 0.'] }; };
C.cosine = r => { const d = r.pick([3, 4]), a = L.range(0, d).map(() => r.int(-3, 5)), b = L.range(0, d).map(() => r.int(-3, 5)); const na = Math.hypot(...a), nb = Math.hypot(...b); if (!na || !nb) return C.cosine(r);
  const dot = L.sum(a.map((x, i) => x * b[i]));
  return { title: 'Cosine similarity of embeddings', topic: 'l10', prompt: `Word vectors u = (${a.join(', ')}) and v = (${b.join(', ')}).`,
    parts: [num('(a)', 'u · v?', dot, 1, { tol: 0, rtol: 0 }), num('(b)', '‖u‖?', na, 1, { tol: .002, rtol: 0 }), num('(c)', 'Cosine similarity?', dot / na / nb, 1.5, { tol: .002, rtol: 0 })],
    solution: [`cos = ${dot} / (${N(na, 4)} · ${N(nb, 4)}) = ${N(dot / na / nb, 4)}.`], traps: ['Forgetting to divide by both norms.'] }; };
C.softmax = r => { const z = L.range(0, 3).map(() => L.round(r.int(-20, 30) / 10, 1)), T = r.pick([1, 1, 2, .5]), e = z.map(v => Math.exp(v / T)), s = L.sum(e), k = r.int(0, 2);
  return { title: 'Softmax (with temperature)', topic: 'l10', prompt: `Logits z = (${z.join(', ')}), temperature T = ${T}. p<sub>i</sub> = e<sup>z<sub>i</sub>/T</sup> / Σ e<sup>z<sub>j</sub>/T</sup>.`,
    parts: [num('(a)', `p<sub>${k + 1}</sub>?`, e[k] / s, 1.5, { tol: .002, rtol: 0 }), mc('(b)', 'If T increases, the distribution becomes…', 'flatter (more uniform)', ['sharper', 'unchanged', 'negative'], 1, '')],
    solution: [`exp(z/T) = ${e.map(v => N(v, 4)).join(', ')}; sum ${N(s, 4)}; p = ${e.map(v => N(v / s, 4)).join(', ')}.`], traps: [] }; };
C.mse = r => { const n = r.pick([4, 5]), y = L.range(0, n).map(() => r.int(0, 20)), yh = y.map(v => v + r.int(-4, 4)), e = y.map((v, i) => v - yh[i]), w = [r.int(-3, 3), r.int(-3, 3)], lam = r.pick([.1, .5, 1]);
  const mse = L.mean(e.map(x => x * x)), mae = L.mean(e.map(Math.abs));
  return { title: 'Loss values: MSE, MAE, ridge', topic: 'l2', prompt: `True y = (${y.join(', ')}), predictions ŷ = (${yh.join(', ')}). Weights w = (${w.join(', ')}).`,
    parts: [num('(a)', 'Mean squared error?', mse, 1, { tol: .001, rtol: 0 }), num('(b)', 'Mean absolute error?', mae, 1, { tol: .001, rtol: 0 }), num('(c)', `Ridge objective MSE + λ‖w‖² with λ = ${lam}?`, mse + lam * (w[0] ** 2 + w[1] ** 2), 1, { tol: .001, rtol: 0 }), mc('(d)', 'Which loss is more robust to outliers?', 'MAE (absolute / L1 loss)', ['MSE (squared / L2 loss)', 'Both equally', 'Neither'], 1, 'Squaring magnifies large residuals.')],
    solution: [`Residuals ${e.join(', ')}; MSE ${N(mse, 4)}; MAE ${N(mae, 4)}.`], traps: [] }; };
C.gd = r => { const xs = [1, 2, 3].map(() => r.int(1, 5)), ys = xs.map(x => 2 * x + r.int(-2, 2)), w = r.pick([0, .5, 1, 3]), eta = r.pick([.01, .05, .1]);
  const g = 2 / 3 * L.sum(xs.map((x, i) => (w * x - ys[i]) * x));
  return { title: 'One gradient-descent step', topic: 'l2', prompt: `Model ŷ = w·x, loss = (1/3) Σ (w x<sub>i</sub> − y<sub>i</sub>)², data x = (${xs.join(', ')}), y = (${ys.join(', ')}). Current w = ${w}, learning rate η = ${eta}.`,
    parts: [num('(a)', 'Gradient dL/dw at the current w?', g, 1.5, { tol: .001, rtol: 0 }), num('(b)', 'w after one step?', w - eta * g, 1.5, { tol: .0005, rtol: 0 })],
    solution: [`dL/dw = (2/3) Σ (w x − y) x = ${N(g, 4)}; w ← ${w} − ${eta}·${N(g, 4)} = ${N(w - eta * g, 4)}.`], traps: ['Moving along +gradient instead of −gradient.'] }; };
C.knn = r => { const pts = L.range(0, 7).map(i => ({ x: r.int(0, 10), y: r.int(0, 10), c: i < 3 ? 'A' : i < 6 ? 'B' : r.pick(['A', 'B']) })), q = [r.int(0, 10), r.int(0, 10)], K = r.pick([1, 3, 5]);
  const d = pts.map(p => ({ ...p, d: Math.hypot(p.x - q[0], p.y - q[1]) })).sort((a, b) => a.d - b.d); if (d[K - 1].d === d[K] && d[K].d) return C.knn(r); if (new Set(d.slice(0, K + 1).map(p => p.d)).size < K + 1) return C.knn(r);
  const votes = d.slice(0, K).reduce((m, p) => (m[p.c] = (m[p.c] || 0) + 1, m), {}), cls = (votes.A || 0) > (votes.B || 0) ? 'A' : 'B';
  return { title: 'k-NN classification', topic: 'l5', prompt: `Training points: ${pts.map(p => `(${p.x}, ${p.y}) ${p.c}`).join('; ')}. Classify the query (${q.join(', ')}) with <b>K = ${K}</b>, Euclidean distance, majority vote.`,
    parts: [num('(a)', 'Distance to the nearest neighbour?', d[0].d, 1, { tol: .005, rtol: 0 }), mc('(b)', 'Predicted class?', cls, [cls === 'A' ? 'B' : 'A'], 1.5, `Nearest ${K}: ${d.slice(0, K).map(p => `${p.c} (${N(p.d, 2)})`).join(', ')}.`)],
    solution: [`Sorted distances: ${d.map(p => `${p.c} ${N(p.d, 2)}`).join(', ')}.`], traps: [] }; };
C.kmeans = r => { const xs = r.sample(L.range(0, 30), 7).sort((a, b) => a - b), c0 = r.sample(xs, 2).sort((a, b) => a - b);
  const assign = xs.map(x => Math.abs(x - c0[0]) <= Math.abs(x - c0[1]) ? 0 : 1), cnew = [0, 1].map(k => L.mean(xs.filter((_, i) => assign[i] === k))), loss = L.sum(xs.map((x, i) => (x - c0[assign[i]]) ** 2));
  if (assign.every(a => a === assign[0])) return C.kmeans(r);
  return { title: 'One K-means iteration (1-D)', topic: 'l7', prompt: `Points ${xs.join(', ')}; initial centroids μ₁ = ${c0[0]}, μ₂ = ${c0[1]} (ties go to μ₁).`,
    parts: [num('(a)', 'How many points are assigned to μ₁?', assign.filter(a => a === 0).length, 1, { tol: 0, rtol: 0 }), num('(b)', 'New μ₁?', cnew[0], 1, { tol: .005, rtol: 0 }), num('(c)', 'New μ₂?', cnew[1], 1, { tol: .005, rtol: 0 }), num('(d)', 'Loss (sum of squared distances) with the initial centroids after assignment?', loss, 1, { tol: .01, rtol: 0 })],
    solution: [`Assignment: ${xs.map((x, i) => `${x}→μ${assign[i] + 1}`).join(', ')}; new centroids ${N(cnew[0], 3)}, ${N(cnew[1], 3)}.`], traps: ['K-means only finds a local optimum: run several initialisations.'] }; };
C.pca = r => { const ev = L.range(0, 5).map(() => r.int(1, 40)).sort((a, b) => b - a), tot = L.sum(ev), k = r.int(1, 3), cum = ev.map((_, i) => L.sum(ev.slice(0, i + 1)) / tot), thr = r.pick([.8, .9, .95]), kmin = cum.findIndex(c => c >= thr - 1e-12) + 1;
  return { title: 'PCA: explained variance', topic: 'l4', prompt: `The covariance matrix has eigenvalues ${ev.join(', ')}.`,
    parts: [num('(a)', `Explained variance ratio of the first ${k} component${k > 1 ? 's' : ''}?`, cum[k - 1], 1.5, { tol: .002, rtol: 0 }), num('(b)', `Smallest number of components that explains at least ${thr * 100} %?`, kmin, 1.5, { tol: 0, rtol: 0 })],
    solution: [`Cumulative: ${cum.map(c => N(c, 3)).join(', ')}.`], traps: ['Using the eigenvalues unsorted.'] }; };
C.bayes = r => { const prior = r.pick([.001, .01, .02, .05, .1]), sens = r.pick([.9, .95, .99]), fpr = r.pick([.01, .05, .1]), post = sens * prior / (sens * prior + fpr * (1 - prior));
  return { title: 'Bayes\' rule', topic: 'l8', prompt: `A condition has prevalence ${prior * 100} %. A test detects it with probability ${sens} (sensitivity) and gives a false positive with probability ${fpr}.`,
    parts: [num('(a)', 'P(positive test)?', sens * prior + fpr * (1 - prior), 1, { tol: .0005, rtol: 0 }), num('(b)', 'P(condition | positive)?', post, 2, { tol: .0005, rtol: .005 })],
    solution: [`P(+) = ${sens}·${prior} + ${fpr}·${1 - prior} = ${N(sens * prior + fpr * (1 - prior), 5)}; posterior = ${N(post, 4)}.`], traps: ['Ignoring the low prior (base-rate fallacy).'] }; };
C.mle = r => { const xs = L.range(0, r.int(5, 7)).map(() => r.int(1, 15)), m = L.mean(xs), v = L.mean(xs.map(x => (x - m) ** 2)), k = r.int(1, 9), n = 10;
  return { title: 'Maximum likelihood estimates', topic: 'l8', prompt: `Data ${xs.join(', ')} from a Gaussian. Separately, a coin shows ${k} heads in ${n} flips.`,
    parts: [num('(a)', 'MLE of the mean?', m, 1, { tol: .001, rtol: 0 }), num('(b)', 'MLE of the variance (divide by n)?', v, 1.5, { tol: .001, rtol: 0 }), num('(c)', 'MLE of the coin\'s heads probability?', k / n, 1, { tol: .001, rtol: 0 })],
    solution: [`Mean ${N(m, 4)}, variance ${N(v, 4)}, p̂ = ${k}/${n}.`], traps: ['The MLE variance divides by n, not n − 1.'] }; };
C.ucb = r => { const k = 3, Q = L.range(0, k).map(() => L.round(r.int(10, 90) / 100, 2)), Nn = L.range(0, k).map(() => r.int(1, 30)), t = L.sum(Nn), c = r.pick([1, 2]), U = Q.map((q, i) => q + c * Math.sqrt(Math.log(t) / Nn[i])), best = U.indexOf(Math.max(...U));
  return { title: 'UCB action selection', topic: 'l9', prompt: `Three arms with estimates Q = (${Q.join(', ')}) and pull counts N = (${Nn.join(', ')}); t = ${t}. UCB: Q(a) + c·√(ln t / N(a)) with c = ${c}.`,
    parts: [num('(a)', 'UCB value of arm 1?', U[0], 1.5, { tol: .002, rtol: 0 }), mc('(b)', 'Which arm is chosen?', 'arm ' + (best + 1), [0, 1, 2].filter(i => i !== best).map(i => 'arm ' + (i + 1)), 1.5, `UCB values ${U.map(u => N(u, 3)).join(', ')}.`)],
    solution: [`UCB = ${U.map(u => N(u, 4)).join(', ')}.`], traps: ['Using log base 10.'] }; };
C.qlearn = r => { const q = L.round(r.int(-10, 50) / 10, 1), rew = r.pick([-1, 0, 1, 5, 10]), a = r.pick([.1, .2, .5]), g = r.pick([.9, .95, .99]), nq = L.range(0, 3).map(() => L.round(r.int(-10, 60) / 10, 1)), tgt = rew + g * Math.max(...nq);
  return { title: 'Q-learning update', topic: 'l9', prompt: `Q(s, a) = ${q}. The agent takes a, gets reward r = ${rew} and lands in s′ with Q(s′, ·) = (${nq.join(', ')}). α = ${a}, γ = ${g}.`,
    parts: [num('(a)', 'TD target r + γ max Q(s′, ·)?', tgt, 1, { tol: .001, rtol: 0 }), num('(b)', 'Updated Q(s, a)?', q + a * (tgt - q), 2, { tol: .001, rtol: 0 })],
    solution: [`Q ← ${q} + ${a}·(${N(tgt, 4)} − ${q}) = ${N(q + a * (tgt - q), 4)}.`], traps: ['Using the action actually taken next (that is SARSA) instead of the max.'] }; };
C.egreedy = r => { const k = r.pick([3, 4, 5, 10]), e = r.pick([.05, .1, .2, .3]);
  return { title: 'ε-greedy probabilities', topic: 'l9', prompt: `ε-greedy with ε = ${e} over ${k} arms (random action chosen uniformly among all arms).`,
    parts: [num('(a)', 'Probability of picking the current greedy arm?', 1 - e + e / k, 1, { tol: .0005, rtol: 0 }), num('(b)', 'Probability of one specific non-greedy arm?', e / k, 1, { tol: .0005, rtol: 0 })],
    solution: [`1 − ε + ε/k = ${N(1 - e + e / k, 4)}; ε/k = ${N(e / k, 4)}.`], traps: ['Forgetting that the random choice can also hit the greedy arm.'] }; };
C.perplex = r => { const p = L.range(0, r.int(3, 5)).map(() => L.round(r.int(5, 60) / 100, 2)), pp = Math.exp(-L.mean(p.map(Math.log)));
  return { title: 'Perplexity of a language model', topic: 'l10', prompt: `The model gives the actual next tokens probabilities ${p.join(', ')}.`,
    parts: [num('', 'Perplexity = exp(−(1/N) Σ ln p)?', pp, 2, { tol: .005, rtol: .002 }), mc('', 'Lower perplexity means…', 'the model is less "surprised": better predictions', ['more random text', 'longer text', 'worse model'], 1, '')],
    solution: [`Mean ln p = ${N(L.mean(p.map(Math.log)), 4)} → perplexity ${N(pp, 4)}.`], traps: [] }; };
C.ret = r => { const g = r.pick([.5, .8, .9, .99]), rs = L.range(0, 4).map(() => r.pick([-1, 0, 1, 2, 5]));
  return { title: 'Discounted return', topic: 'l9', prompt: `Rewards r₀…r₃ = ${rs.join(', ')}, discount γ = ${g}.`, parts: [num('', 'G₀ = Σ γ<sup>t</sup> r<sub>t</sub>?', L.sum(rs.map((x, t) => x * g ** t)), 2, { tol: .001, rtol: 0 })], solution: [rs.map((x, t) => `${x}·${g}^${t}`).join(' + ')], traps: [] }; };

/* ======================= code completion (Assignments 1–5 style) ======================= */
const CODE = [
 { a: 1, t: 'Fit and evaluate a linear regressor', code: `import pandas as pd
from sklearn.linear_model import ⟦0⟧
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

df = pd.read_csv("data.csv")
X = df[["feature_1", "feature_2"]].to_numpy()
y = df["target"].to_numpy()
X_train, X_val, y_train, y_val = ⟦1⟧(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.⟦2⟧(X_train, y_train)
y_pred = model.⟦3⟧(X_val)
val_error = ⟦4⟧(y_val, y_pred)`, b: [['LinearRegression'], ['train_test_split'], ['fit'], ['predict'], ['mean_squared_error']] },
 { a: 1, t: 'Polynomial regression', code: `from sklearn.preprocessing import PolynomialFeatures
poly = PolynomialFeatures(degree=⟦0⟧)          # degree 3
X_poly = poly.⟦1⟧(X_train)                      # learn + transform
X_val_poly = poly.⟦2⟧(X_val)                    # only transform
model = LinearRegression().fit(X_poly, y_train)
train_err = mean_squared_error(y_train, model.predict(⟦3⟧))`, b: [['3'], ['fit_transform'], ['transform'], ['X_poly']] },
 { a: 2, t: 'Logistic regression + accuracy and confusion matrix', code: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, ⟦0⟧
clf = LogisticRegression(C=1.0)       # C = 1/λ: larger C = ⟦1⟧ regularisation
clf.fit(X_train, y_train)
y_hat = clf.predict(X_val)
acc = ⟦2⟧(y_val, y_hat)
cm = confusion_matrix(y_val, y_hat)
proba = clf.⟦3⟧(X_val)[:, 1]           # P(y = 1)`, b: [['confusion_matrix'], ['weaker', 'less'], ['accuracy_score'], ['predict_proba']] },
 { a: 2, t: 'Standardise without leaking', code: `from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_s = scaler.⟦0⟧(X_train)
X_val_s = scaler.⟦1⟧(X_val)        # use the TRAINING mean and std
X_test_s = scaler.transform(⟦2⟧)`, b: [['fit_transform'], ['transform'], ['X_test']] },
 { a: 2, t: 'PCA with explained variance', code: `from sklearn.decomposition import PCA
import numpy as np
pca = PCA(n_components=⟦0⟧)                  # 10 components
Z = pca.fit_transform(X)
ratio = pca.⟦1⟧                             # one value per component
k99 = np.argmax(np.cumsum(ratio) >= 0.99) + ⟦2⟧`, b: [['10'], ['explained_variance_ratio_'], ['1']] },
 { a: 3, t: 'k-NN and a decision tree', code: `from sklearn.neighbors import ⟦0⟧
from sklearn.tree import DecisionTreeClassifier
knn = KNeighborsClassifier(⟦1⟧=5)
knn.fit(X_train, y_train)
tree = DecisionTreeClassifier(⟦2⟧=4, criterion="entropy")   # limit the depth
tree.fit(X_train, y_train)
print(tree.score(X_val, y_val))       # score() returns the ⟦3⟧`, b: [['KNeighborsClassifier'], ['n_neighbors'], ['max_depth'], ['accuracy', 'mean accuracy']] },
 { a: 3, t: 'Random forest / gradient boosting', code: `from sklearn.ensemble import ⟦0⟧, GradientBoostingClassifier
rf = RandomForestClassifier(n_estimators=200, max_features="sqrt")
gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=2)
rf.fit(X_train, y_train); gb.fit(X_train, y_train)
# bagging lowers ⟦1⟧, boosting lowers ⟦2⟧`, b: [['RandomForestClassifier'], ['variance'], ['bias']] },
 { a: 3, t: 'A small neural network', code: `from sklearn.neural_network import ⟦0⟧
mlp = MLPClassifier(hidden_layer_sizes=(64, 32), activation="⟦1⟧",   # rectified linear unit
                    learning_rate_init=1e-3, early_stopping=⟦2⟧, max_iter=300)
mlp.fit(X_train, y_train)`, b: [['MLPClassifier'], ['relu'], ['True']] },
 { a: 4, t: 'K-means and the elbow', code: `from sklearn.cluster import KMeans
losses = []
for k in range(1, 11):
    km = KMeans(n_clusters=⟦0⟧, n_init=10, random_state=0)
    km.fit(X)
    losses.append(km.⟦1⟧)              # sum of squared distances to centroids
labels = KMeans(n_clusters=3, n_init=10).fit(X).⟦2⟧`, b: [['k'], ['inertia_'], ['labels_']] },
 { a: 4, t: 'DBSCAN and Gaussian mixtures', code: `from sklearn.cluster import DBSCAN
from sklearn.mixture import GaussianMixture
db = DBSCAN(⟦0⟧=0.5, min_samples=5).fit(X)
n_noise = (db.labels_ == ⟦1⟧).sum()         # noise label
gmm = GaussianMixture(n_components=3).fit(X)
resp = gmm.⟦2⟧(X)                           # soft assignments`, b: [['eps'], ['-1'], ['predict_proba']] },
 { a: 5, t: 'Q-learning update (Frozen Lake)', code: `import numpy as np
Q = np.zeros((n_states, n_actions))
for episode in range(n_episodes):
    s = env.reset()
    done = False
    while not done:
        if np.random.rand() < ⟦0⟧:              # explore
            a = env.action_space.sample()
        else:
            a = np.⟦1⟧(Q[s])                     # greedy action
        s2, r, done, _ = env.step(a)
        Q[s, a] += alpha * (r + gamma * np.⟦2⟧(Q[s2]) - Q[s, a])
        s = ⟦3⟧`, b: [['epsilon', 'eps'], ['argmax'], ['max'], ['s2']] },
 { a: 5, t: 'Perplexity and softmax with numpy', code: `import numpy as np
def softmax(z, T=1.0):
    e = np.exp(z / ⟦0⟧)
    return e / e.⟦1⟧()
def perplexity(probs):           # probabilities of the true next tokens
    return np.exp(-np.⟦2⟧(np.log(probs)))`, b: [['T'], ['sum'], ['mean']] }
];
const OUTP = [
 ['import numpy as np\nX = np.arange(12).reshape(3, 4)\nprint(X.shape, X[:, 1].shape)', '(3, 4) (3,)', ['(3, 4) (4,)', '(4, 3) (3,)', '(3, 4) (1, 3)']],
 ['import numpy as np\nX = np.array([[1, 2], [3, 4], [5, 6]])\nprint(X.mean(axis=0))', '[3. 4.]', ['[1.5 3.5 5.5]', '3.5', '[9 12]']],
 ['import numpy as np\na = np.array([1, 2, 3])\nprint(a @ a, a * a)', '14 [1 4 9]', ['[1 4 9] 14', '14 14', '6 [1 4 9]']],
 ['from sklearn.metrics import accuracy_score\nprint(accuracy_score([1, 0, 1, 1], [1, 1, 1, 0]))', '0.5', ['0.75', '0.25', '2']],
 ['import numpy as np\nX = np.ones((100, 5))\nw = np.zeros(5)\nprint((X @ w).shape)', '(100,)', ['(5,)', '(100, 5)', '(1, 100)']],
 ['import pandas as pd\ndf = pd.DataFrame({"a": [1, 2, None], "b": [4, None, 6]})\nprint(df.dropna().shape)', '(1, 2)', ['(3, 2)', '(2, 2)', '(1, 3)']],
 ['import numpy as np\nprint(np.argmax([0.1, 0.7, 0.2]))', '1', ['0.7', '2', '[1]']],
 ['from sklearn.metrics import confusion_matrix\nprint(confusion_matrix([0, 1, 1, 0], [0, 1, 0, 0]))', '[[2 0]\n [1 1]]', ['[[2 1]\n [0 1]]', '[[1 1]\n [0 2]]', '[[1 0]\n [2 1]]']]
];
function gCode(r) { const c = r.pick(CODE); return { title: `Code: ${c.t}`, topic: 'code', source: `Mirrors Assignment ${c.a} (Jupyter)`, prompt: 'Fill in the blanks so the cell runs and does what the comments say.', parts: [{ type: 'code', label: '', prompt: '', code: c.code, blanks: c.b, points: 5 }], solution: ['Know the scikit-learn API by heart: fit / predict / transform / fit_transform / predict_proba, and the fitted attributes with a trailing underscore (inertia_, labels_, explained_variance_ratio_).'], traps: ['Calling fit_transform on validation/test data (leakage).', 'Forgetting that fitted attributes end with an underscore.'] }; }
function gOut(r) { const picks = r.sample(OUTP, 3); return { title: 'Predict the output', topic: 'code', source: 'Mirrors the Jupyter coding part', prompt: 'What does each snippet print?', parts: picks.map(([code, a, w], i) => mc(`(${i + 1})`, `<pre class="xm-code">${h(code)}</pre>`, `<code>${h(a).replace(/\n/g, '<br>')}</code>`, w.map(x => `<code>${h(x).replace(/\n/g, '<br>')}</code>`), 1, '', { wide: true })), solution: [], traps: ['Axis 0 = down the rows (per column).'] }; }

/* ======================= templates ======================= */
const LECT = ['', 'Introduction & features', 'Regression', 'Classification', 'Feature learning (PCA, selection)', 'Non-parametric (k-NN, trees, ensembles)', 'Deep learning', 'Clustering', 'Probability (MLE, MAP, Bayes)', 'Reinforcement learning', 'Language models'];
const T = {};
for (let l = 1; l <= 10; l++) {
  const qs = M.filter(m => m[4] === l), kn = KNOBS.filter(k => k[3] === l);
  if (qs.length) T['pdf_l' + l] = { topic: 'l' + l, title: `From your 50 MCQs: ${LECT[l]}`, kinds: 'multiple choice', source: SRC_PDF, gen: r => ({ title: `Lecture ${l}: ${LECT[l]}`, prompt: '', parts: r.sample(qs, Math.min(4, qs.length)).map(([q, a, w, why], i) => mc(`(${i + 1})`, q, a, w, 2, why)), solution: [], traps: ['Kill absolute words ("always", "never") unless the statement is a true identity.'] }) };
  if (kn.length) T['knob_l' + l] = { topic: 'l' + l, title: `Turn the knob: ${LECT[l]}`, kinds: 'multiple choice', source: SRC_PDF + ', trend table', gen: r => ({ title: 'What happens if I turn this knob?', prompt: 'Model complexity up → bias down, variance up (and vice versa).', parts: r.sample(kn, Math.min(3, kn.length)).map(([q, a, w], i) => mc(`(${i + 1})`, q, a, w, 2, '')), solution: ['5-step method: name the knob → translate to complexity up/down → what is held fixed → recall the extreme case → kill absolute words.'], traps: [] }) };
}
const CALC_SRC = { metrics: 'L3', conv: 'L6', entropy: 'L5', tfidf: 'L10', cosine: 'L10', softmax: 'L10', mse: 'L2', gd: 'L2', knn: 'L5', kmeans: 'L7', pca: 'L4', bayes: 'L8', mle: 'L8', ucb: 'L9 / A5', qlearn: 'L9 / A5', egreedy: 'L9', perplex: 'L10 / A5', ret: 'L9' };
Object.keys(C).forEach(k => { T['calc_' + k] = { topic: 'calc', title: 'Calculation: ' + C[k](L.rng(1)).title, kinds: 'numeric', source: 'Course material: ' + CALC_SRC[k] + ' (cheat sheet formulas)', gen: r => C[k](r) }; });
T.code = { topic: 'code', title: 'Fill in the scikit-learn / numpy code (A1–A5)', kinds: 'code completion', source: 'Mirrors Assignments 1–5', weight: 2, gen: gCode };
T.out = { topic: 'code', title: 'Predict what the code prints', kinds: 'multiple choice', source: 'Jupyter coding part', gen: gOut };
T.mcq20 = { topic: 'l1', title: 'MCQ quiz (20 × 2 p, exam format)', hidden: true, gen: r => ({ title: 'Part 1: multiple-choice quiz', prompt: '20 questions, 2 points each, one correct answer.', parts: r.sample(M.concat(KNOBS.map(k => [k[0] + ' What happens?', k[1], k[2], '', k[3]])), 20).map(([q, a, w, why], i) => mc(`${i + 1}.`, q, a, w, 2, why)), solution: [], traps: [] }) };
XM.register({
  id: 'ml', code: 'CS-C3240', name: 'Machine Learning (retake)', short: 'ML', accent: '#FF4F6D', arena: 'CS-C3240',
  bosses: ['Gradient Golem', 'Sigmoid Serpent', 'The Principal', 'k-Nearest Knight', 'The Black Box', 'The Cluster Hive', 'Lambda', 'The Agent', 'The Next Token', 'The Examiner'],
  exam: { date: '2026-12-11T09:00:00', tentative: true, where: 'EXAM room, Fri 11.12 (check your booked slot time)', format: 'EXAM room, 2 h: Part 1 MyCourses multiple-choice quiz (20 × 2 p), Part 2 Jupyter coding (3 questions, 15 p).',
    rules: 'Only your student card. Know your Aalto username.', notes: '<p>Part 1 is a <b>multiple-choice quiz</b> (trend / "turn the knob", "which method fits", comparisons, small calculations). Part 2 is <b>Jupyter coding</b> mirroring Assignments 1–5 (load data → split → fit → metric). This mode adds your <b>50 MCQs</b>, trend questions, 18 calculation generators and code completion.</p>' },
  topics: Object.assign({ calc: { name: 'Calculations (metrics, conv size, entropy, tf-idf, UCB, Q-learning…)', slot: 'Part 1', weight: .8 }, code: { name: 'Coding (scikit-learn / numpy)', slot: 'Part 2 · 15 p', weight: .9 } },
    Object.fromEntries(L.range(1, 11).map(l => ['l' + l, { name: `L${l} ${LECT[l]}`, slot: 'Part 1', weight: .6 }]))),
  templates: T,
  mock: { title: 'ML retake mock (MCQ + coding)', minutes: 120, points: 55, rules: 'No materials. The coding part here is fill-in-the-blanks; in the real exam you write the cells in Jupyter.',
    slots: [{ label: 'Part 1: 20 multiple-choice questions', points: 40, tpls: ['mcq20'] }, { label: 'Part 2: coding 1', points: 5, tpls: ['code'] }, { label: 'Part 2: coding 2', points: 5, tpls: ['code'] }, { label: 'Part 2: coding 3', points: 5, tpls: ['code'] }] },
  papers: []
});
})(typeof window !== 'undefined' ? window : globalThis);
