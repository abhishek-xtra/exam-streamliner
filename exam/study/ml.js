/* CS-C3240 ML Study Hall — follows the retake format: Part 1 multiple choice (trend / scenario /
   compare / small calculations, lectures 1–10), Part 2 Jupyter coding (Assignments 1–5).
   Built on the user's ML cheat sheet and ML_Trends_Notes_and_50_MCQs.pdf. */
(function (G) {
'use strict';
const XM = G.XM; XM.study = XM.study || {};
const T = (head, rows) => `<div class="xm-tw"><table><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
const note = (t, b) => `<div class="xm-note"><b>${t}</b> ${b}</div>`;
const code = s => `<pre class="xm-code">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`;

XM.study.ml = [
{ id: 'overview', slot: 'Start here', title: 'How the ML retake works + the 5-step method', intro: 'EXAM room, 2 hours, your slot on <b>Fri 11.12.2026</b>. Bring only your student card and know your Aalto username. <b>Part 1</b>: multiple-choice quiz in MyCourses (20 questions, 40 p). <b>Part 2</b>: Jupyter coding (3 questions, 15 p), same pattern as the assignments.',
  asks: ['Question styles: (1) "what happens if I turn this knob?" (λ, K, k, ε, η, depth, components); (2) "which method or metric fits this scenario?"; (3) "compare A vs B"; (4) small calculations; (5) coding: load data → split → fit a scikit-learn model → compute a metric.'],
  know: note('The 5-step method for trend questions:', '1) name the knob; 2) translate into "model complexity up or down" (more flexible = lower bias, higher variance, training error falls); 3) say what is held fixed; 4) recall the extreme case (λ → 0 = unregularised / hard-margin; K = 1 in k-NN = zero training error; k = n in K-means = zero loss); 5) kill absolute words ("always", "never", "guarantees") unless the statement is a true identity.'),
  method: ['Part 1: ~2.5 min per question; flag and return.', 'Part 2: write the 5-line pipeline first (imports → data → split → fit → metric), then the details.'] },

{ id: 'knobs', slot: 'Part 1', title: 'The "turn the knob" table (most-asked question type)', topic: 'l2', tpls: ['knob_l2', 'knob_l5', 'knob_l7'],
  know: T(['Increase …', 'What happens', 'Bias / variance'], [
    ['λ (ridge, logistic, soft-margin SVM)', 'weights shrink; SVM margin 2/‖w‖ gets <b>wider</b>, more violations, more support vectors; training error up', 'bias ↑ variance ↓ (decreasing λ: margin narrower, overfit; λ → 0 = hard margin)'],
    ['polynomial degree M', 'training error never rises (0 at M + 1 = n); test/CV error U-shaped', 'bias ↓ variance ↑'],
    ['training set size N (fixed model)', 'training error rises slightly, CV error falls, curves converge; helps high variance, not high bias', 'variance ↓'],
    ['K in k-NN', 'smoother boundary; K = 1 jagged, zero training error; K huge → majority class', 'bias ↑ variance ↓'],
    ['RBF width σ', 'smoother boundary (underfit if too large); small σ = islands around points (overfit)', 'bias ↑'],
    ['polynomial kernel degree', 'more flexible boundary', 'variance ↑'],
    ['PCA components k', 'explained variance ↑, reconstruction error ↓, compression ↓', 'choose smallest k reaching e.g. 99 %'],
    ['clusters k (K-means)', 'minimum loss never increases, 0 at k = n → choose k with the elbow', 'loss is not a selection criterion'],
    ['DBSCAN ε (minPts fixed)', 'clusters merge, fewer noise points', '—'],
    ['DBSCAN minPts (ε fixed)', 'fewer core points, more noise, fewer/smaller clusters', 'rule of thumb ≥ dim + 1'],
    ['learning rate η', 'too small: slow; too large: oscillation, divergence (loss → NaN)', 'η is a hyperparameter'],
    ['mini-batch size B', 'smoother gradient, fewer updates per epoch (smaller B = noisier, mild regularisation)', '—'],
    ['epochs', 'training loss falls; validation loss falls then rises → early stopping', 'variance ↑ after the minimum'],
    ['network width/depth, tree depth', 'more capacity, easier to overfit; deep nets: vanishing gradients (fix: ReLU, init, batch norm, skip connections)', 'variance ↑'],
    ['decision threshold', 'precision ↑, recall ↓', '—'],
    ['ε in ε-greedy', 'more exploration, lower long-run reward', '—'],
    ['discount γ', 'future rewards count more (far-sighted)', '—'],
    ['softmax temperature T', 'flatter distribution, more random text', '—']]),
  traps: ['Options that change two things at once.', '"Always/never" statements that are not identities.'] },

{ id: 'l1', slot: 'L1', title: 'Introduction: data, features, labels, learning types', topic: 'l1', tpls: ['pdf_l1'],
  know: T(['Learning type', 'Signal', 'Example'], [['Supervised', 'labelled (x, y)', 'price prediction, spam classification'], ['Unsupervised', 'no labels; find structure', 'clustering articles, PCA'], ['Semi-supervised', 'few labels + many unlabeled', 'pseudo-labelling'], ['Self-supervised', 'labels created from the data itself', 'masked-word prediction (BERT)'], ['Active learning', 'the learner chooses which examples to label', 'uncertainty sampling'], ['Reinforcement learning', 'rewards from interacting', 'bandits, Q-learning']]) +
    note('ML components:', 'data (features x, labels y), hypothesis space (models), loss function; learning = choose the hypothesis with the smallest (average) loss.') +
    note('Features:', 'bag-of-words / tf-idf for text (loses word order), pixels / convolution features for images, one-hot for categories; NumPy arrays X of shape (m samples, n features).') },

{ id: 'l2', slot: 'L2', title: 'Regression, loss, gradient descent, validation, bias–variance', topic: 'l2', tpls: ['pdf_l2', 'calc_mse', 'calc_gd'],
  know: T(['Item', 'Formula / fact'], [['Squared error (L2) loss', '(y − ŷ)²; MSE = mean; sensitive to outliers'], ['Absolute error (L1) loss', '|y − ŷ|; robust to outliers'], ['Linear regression', 'ŵ minimises Σ(y − wᵀx)² (normal equations w = (XᵀX)⁻¹Xᵀy)'], ['Ridge', 'MSE + λ‖w‖² (L2 penalty on weights); Lasso: λ‖w‖₁ (sparse weights, embedded feature selection)'], ['Gradient descent', 'w ← w − η ∇L(w); for ŷ = wx and L = (1/m)Σ(wx − y)²: dL/dw = (2/m) Σ (wx − y)x'], ['Validation', 'train / validation / test; k-fold CV (k = n is leave-one-out: costly, less biased)'], ['Learning curve', 'error vs training-set size (training curve = loss vs epochs)'], ['Diagnosis', 'both errors high and close → high bias (richer model); low train, high CV with a gap → high variance (more data, regularisation, simpler model)']]) },

{ id: 'l3', slot: 'L3', title: 'Classification: logistic regression, SVM, metrics', topic: 'l3', tpls: ['pdf_l3', 'calc_metrics'],
  know: T(['Item', 'Fact'], [['Logistic regression', 'σ(wᵀx) = P(y = 1 | x); logistic loss; convex; outputs probabilities'], ['SVM', 'hinge loss max(0, 1 − y·wᵀx) + (λ/2)‖w‖²; margin 2/‖w‖; only support vectors matter (hinge = 0 beyond the margin)'], ['Hard vs soft margin', 'hard = λ → 0, needs separable data; soft allows violations'], ['Accuracy', '(TP + TN) / all — misleading on imbalanced data (99 % negatives)'], ['Precision', 'TP / (TP + FP) — trust in positive predictions'], ['Recall', 'TP / (TP + FN) — prioritise when misses are costly (disease screening)'], ['F1', '2PR / (P + R)'], ['Threshold ↑', 'precision ↑, recall ↓']]) },

{ id: 'l4', slot: 'L4', title: 'Feature learning: scaling, selection, PCA, kernels, curse of dimensionality', topic: 'l4', tpls: ['pdf_l4', 'calc_pca'],
  know: T(['Item', 'Fact'], [['Standardisation', '(x − mean)/std with statistics from the <b>training set only</b> (no leakage)'], ['Feature selection', 'filter (statistics, e.g. correlation), wrapper (train the model per subset: most expensive), embedded (during training: L1, trees)'], ['PCA', 'directions of maximal variance = eigenvectors of the covariance matrix, sorted by eigenvalue; explained variance ratio = λᵢ / Σλ'], ['Curse of dimensionality', 'many irrelevant features: distances lose meaning, data sparse → k-NN suffers'], ['Kernel trick', 'implicit feature map; RBF width σ controls smoothness']]) },

{ id: 'l5', slot: 'L5', title: 'Non-parametric methods: k-NN, decision trees, ensembles', topic: 'l5', tpls: ['pdf_l5', 'calc_entropy', 'calc_knn'],
  know: T(['Item', 'Fact'], [['Parametric', 'fixed-size θ, data can be discarded (linear/logistic regression, neural nets). Wrong form → bias stays with more data'], ['Non-parametric', 'model grows with the data (k-NN, trees, kernel density)'], ['k-NN', 'majority of the K nearest; k-d / ball trees speed up search'], ['Entropy', 'H = −Σ p log₂ p; information gain = H(parent) − weighted H(children); split on the highest gain'], ['Pruning', 'slightly higher training error, lower error on new data'], ['Bagging / random forest', 'deep trees on bootstrap samples, in parallel; random feature subsets decorrelate trees → variance ↓'], ['Boosting', 'shallow trees in sequence fixing residuals → bias ↓, can overfit with many rounds']]) },

{ id: 'l6', slot: 'L6', title: 'Deep learning: networks, training, CNNs, RNNs', topic: 'l6', tpls: ['pdf_l6', 'calc_conv'],
  know: T(['Item', 'Fact'], [['Neuron', 'activation(wᵀx + b); ReLU, sigmoid, tanh'], ['Training', 'backprop + (mini-batch) SGD; non-convex loss (local minima)'], ['Overfitting tools', 'early stopping, dropout, weight decay, data augmentation'], ['Conv output size', '⌊(n + 2p − k)/s⌋ + 1; "same" padding p = (k − 1)/2 with s = 1'], ['Conv parameters', 'k·k·C<sub>in</sub>·C<sub>out</sub> + C<sub>out</sub> (weight sharing → far fewer than dense)'], ['Pooling', 'no parameters, down-samples (stride 2 halves the size)'], ['RNN vs LSTM', 'LSTM\'s additive cell state + forget gate keeps gradients alive over long sequences']]) },

{ id: 'l7', slot: 'L7', title: 'Clustering and learning with few labels', topic: 'l7', tpls: ['pdf_l7', 'calc_kmeans'],
  know: T(['Item', 'Fact'], [['K-means', 'alternate: assign to the nearest centroid, move centroids to the means; local optimum → many initialisations; spherical clusters; choose k by the elbow'], ['GMM', 'soft assignments (probabilities), elliptical clusters, EM algorithm'], ['DBSCAN', 'ε and minPts; arbitrary shapes; labels sparse points as noise (−1); number of clusters is an output'], ['Semi/self-supervised, active learning', 'pseudo-labels; labels from the data itself; the learner chooses what to label']]) },

{ id: 'l8', slot: 'L8', title: 'Probability: MLE, MAP, Bayes, naive Bayes', topic: 'l8', tpls: ['pdf_l8', 'calc_bayes', 'calc_mle'],
  know: T(['Item', 'Fact'], [['Bayes', 'P(A|B) = P(B|A)P(A)/P(B); low priors keep posteriors low (base rate)'], ['MLE', 'maximise the likelihood; Gaussian: sample mean and variance with 1/n; Bernoulli: k/n'], ['MAP', 'maximise likelihood × prior; Gaussian prior on weights → ridge (L2); more data → MAP → MLE'], ['Naive Bayes', 'features independent given the class (spam filters)'], ['Uncertainty', 'epistemic (reducible with data) vs aleatoric (inherent noise)']]) },

{ id: 'l9', slot: 'L9', title: 'Reinforcement learning: bandits, UCB, Q-learning', topic: 'l9', tpls: ['pdf_l9', 'calc_ucb', 'calc_qlearn', 'calc_egreedy', 'calc_ret'],
  know: T(['Item', 'Formula / fact'], [['Return', 'G = Σ γᵗ rₜ'], ['ε-greedy', 'P(greedy arm) = 1 − ε + ε/k; other arms ε/k each'], ['UCB', 'Q(a) + c·√(ln t / N(a)); bonus shrinks as an arm is pulled'], ['Contextual bandit', 'reward depends on context; actions do not change the next state; immediate rewards'], ['Q-learning (A5, Frozen Lake)', 'Q(s,a) ← Q(s,a) + α [r + γ max<sub>a′</sub> Q(s′,a′) − Q(s,a)]'], ['Exploration vs exploitation', 'larger ε: more exploration, lower long-run reward']]) },

{ id: 'l10', slot: 'L10', title: 'Language models: tf-idf, embeddings, transformers, BERT vs GPT', topic: 'l10', tpls: ['pdf_l10', 'calc_tfidf', 'calc_cosine', 'calc_softmax', 'calc_perplex'],
  know: T(['Item', 'Formula / fact'], [['tf-idf', 'tf × log(N/df); a word in every document gets 0'], ['Cosine similarity', 'u·v / (‖u‖‖v‖)'], ['Softmax with temperature', 'pᵢ = e<sup>zᵢ/T</sup> / Σ e<sup>zⱼ/T</sup>; higher T flatter'], ['Perplexity', 'exp(−(1/N) Σ ln p(true token)); lower is better'], ['Word2Vec vs BERT', 'static vs contextual embeddings'], ['Transformer', 'self-attention over all positions in parallel, positional embeddings, cost quadratic in length'], ['BERT vs GPT', 'BERT: encoder-only, bidirectional, masked-token training. GPT: decoder-only, causal, next-token. (T5/BART: encoder-decoder)']]) },

{ id: 'coding', slot: 'Part 2 · 15 p', title: 'Jupyter coding: the scikit-learn patterns from Assignments 1–5', topic: 'code', tpls: ['code', 'out'],
  intro: 'Every coding question follows the same skeleton. Write it from memory.',
  know: code(`import numpy as np, pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error, accuracy_score, confusion_matrix

df = pd.read_csv("data.csv")
X = df[["f1", "f2"]].to_numpy();  y = df["target"].to_numpy()
X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
sc = StandardScaler();  X_tr = sc.fit_transform(X_tr);  X_val = sc.transform(X_val)
model = LogisticRegression(C=1.0).fit(X_tr, y_tr)        # C = 1/λ
acc = accuracy_score(y_val, model.predict(X_val))`) +
    T(['Assignment', 'API to know'], [['A1 regression', 'LinearRegression, PolynomialFeatures(degree).fit_transform / transform, mean_squared_error'], ['A2 classification / PCA', 'LogisticRegression (C = 1/λ), predict_proba, accuracy_score, confusion_matrix, PCA(n_components).fit_transform, explained_variance_ratio_'], ['A3 non-parametric / deep', 'KNeighborsClassifier(n_neighbors), DecisionTreeClassifier(max_depth, criterion="entropy"), RandomForestClassifier, GradientBoostingClassifier, MLPClassifier(hidden_layer_sizes, activation="relu", early_stopping=True)'], ['A4 clustering / probability', 'KMeans(n_clusters, n_init).fit → labels_, inertia_; DBSCAN(eps, min_samples) → labels_ (−1 = noise); GaussianMixture.predict_proba'], ['A5 RL / language', 'Q-table with np.zeros, np.argmax for the greedy action, np.max in the update; softmax / perplexity with np.exp, np.log, np.mean']]),
  traps: ['fit_transform on validation/test data (leakage).', 'Forgetting the trailing underscore of fitted attributes.', 'Shape errors: X must be 2-D (use reshape(-1, 1) for one feature).'] }
];
})(typeof window !== 'undefined' ? window : globalThis);
