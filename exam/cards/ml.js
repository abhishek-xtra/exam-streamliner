/* ML retake flashcards: [Study Hall page id, front, back]. */
(function (G) {
'use strict';
const XM = G.XM; XM.cards = XM.cards || {};
XM.cards.ml = [
['overview', `The 5-step method for "what happens if…" questions?`, `1) name the knob 2) complexity up or down? 3) what is held fixed 4) recall the extreme case 5) distrust "always/never" unless it is an identity.`],

['knobs', `Increase λ (ridge, logistic, soft-margin SVM)?`, `Weights shrink, SVM margin widens (more violations, more support vectors), training error up. <b>Bias ↑, variance ↓.</b>`],
['knobs', `Increase polynomial degree M?`, `Training error never rises (0 at M + 1 = n); test/CV error is U-shaped. Bias ↓, variance ↑.`],
['knobs', `Increase training-set size N (fixed model)?`, `Training error rises slightly, CV error falls, the curves converge. Helps high variance, not high bias.`],
['knobs', `Increase K in k-NN? What does K = 1 give?`, `Smoother boundary, bias ↑ variance ↓. K = 1: jagged boundary, <b>zero training error</b>.`],
['knobs', `Increase the RBF width σ?`, `Smoother boundary (underfits if too large). Small σ = islands around points (overfit).`],
['knobs', `Increase k in K-means?`, `The minimum loss never increases (0 at k = n), so loss alone cannot choose k: use the elbow.`],
['knobs', `Increase DBSCAN ε (minPts fixed)?`, `Clusters merge, fewer noise points.`],
['knobs', `Learning rate too small / too large?`, `Too small: slow. Too large: oscillation, divergence (loss → NaN).`],
['knobs', `Training for more epochs?`, `Training loss falls; validation loss falls then rises → early stopping.`],
['knobs', `Raise the decision threshold?`, `Precision ↑, recall ↓.`],
['knobs', `Raise the softmax temperature T?`, `A flatter distribution, more random text.`],

['l1', `Supervised vs unsupervised vs reinforcement learning?`, `Supervised: labelled (x, y). Unsupervised: no labels, find structure. RL: rewards from interacting.`],
['l1', `Self-supervised vs semi-supervised vs active learning?`, `Self-supervised: labels created from the data itself (masked words). Semi-supervised: few labels + many unlabeled. Active: the learner chooses which examples to label.`],
['l1', `The three ML components?`, `Data (features, labels), hypothesis space (models), loss function. Learning picks the hypothesis with the smallest average loss.`],

['l2', `Squared vs absolute error loss?`, `Squared (L2): sensitive to outliers. Absolute (L1): robust to outliers.`],
['l2', `Ridge vs Lasso?`, `Ridge: + λ‖w‖² (shrinks weights). Lasso: + λ‖w‖₁ (sparse weights, embedded feature selection).`],
['l2', `Gradient descent update?`, `w ← w − η ∇L(w).`],
['l2', `For ŷ = wx and L = (1/m)Σ(wx − y)², what is dL/dw?`, `(2/m) Σ (wx − y)·x.`],
['l2', `Diagnose: training and CV error both high and close?`, `<b>High bias</b> → richer model.`],
['l2', `Diagnose: low training error, much higher CV error?`, `<b>High variance</b> → more data, regularisation, simpler model.`],
['l2', `k-fold CV with k = n?`, `Leave-one-out: costly, less biased.`],

['l3', `Logistic regression outputs what? Is its loss convex?`, `σ(wᵀx) = P(y = 1 | x). Yes, the logistic loss is convex.`],
['l3', `SVM: hinge loss and margin?`, `max(0, 1 − y·wᵀx) + (λ/2)‖w‖². Margin = 2/‖w‖. Only support vectors matter.`],
['l3', `Precision and recall?`, `Precision = TP / (TP + FP). Recall = TP / (TP + FN).`],
['l3', `F1 score?`, `2PR / (P + R).`],
['l3', `When is accuracy misleading?`, `On imbalanced data: predicting "negative" on 99 % negatives gives 99 % accuracy.`],
['l3', `Disease screening: prioritise precision or recall?`, `Recall (misses are costly).`],

['l4', `How must standardisation be done?`, `(x − mean)/std with statistics from the <b>training set only</b> (no leakage).`],
['l4', `Filter, wrapper and embedded feature selection?`, `Filter: statistics (correlation). Wrapper: train per subset (most expensive). Embedded: during training (L1, trees).`],
['l4', `PCA directions and explained variance ratio?`, `Eigenvectors of the covariance matrix sorted by eigenvalue. Ratio = λᵢ / Σλ.`],
['l4', `Curse of dimensionality?`, `With many irrelevant features distances lose meaning and data is sparse, so k-NN suffers.`],

['l5', `Parametric vs non-parametric models?`, `Parametric: fixed-size θ (linear/logistic regression, nets). Non-parametric: grows with the data (k-NN, trees).`],
['l5', `Entropy and information gain?`, `H = −Σ p log₂ p. Gain = H(parent) − weighted H(children); split on the highest gain.`],
['l5', `Bagging/random forest vs boosting?`, `Bagging: deep trees on bootstrap samples in parallel → variance ↓. Boosting: shallow trees in sequence fixing residuals → bias ↓, can overfit.`],

['l6', `Convolution output size?`, `⌊(n + 2p − k)/s⌋ + 1.`],
['l6', `Parameters in a conv layer?`, `k·k·C<sub>in</sub>·C<sub>out</sub> + C<sub>out</sub>.`],
['l6', `Pooling: parameters and effect?`, `No parameters; down-samples (stride 2 halves the size).`],
['l6', `Why does an LSTM beat a plain RNN on long sequences?`, `Its additive cell state and forget gate keep gradients alive.`],
['l6', `Four tools against overfitting in deep nets?`, `Early stopping, dropout, weight decay, data augmentation.`],

['l7', `K-means algorithm and weaknesses?`, `Alternate: assign to nearest centroid, move centroids to means. Local optimum (use many inits), spherical clusters.`],
['l7', `GMM vs K-means?`, `GMM: soft assignments (probabilities), elliptical clusters, fitted with EM.`],
['l7', `DBSCAN key facts?`, `Parameters ε and minPts; arbitrary shapes; noise labelled −1; the number of clusters is an output.`],

['l8', `MLE for a Bernoulli and a Gaussian?`, `Bernoulli: k/n. Gaussian: sample mean and variance with 1/n.`],
['l8', `MAP with a Gaussian prior on the weights equals what?`, `Ridge (L2) regularisation. With more data, MAP → MLE.`],
['l8', `Naive Bayes assumption?`, `Features are independent given the class.`],
['l8', `Epistemic vs aleatoric uncertainty?`, `Epistemic: reducible with more data. Aleatoric: inherent noise.`],

['l9', `ε-greedy with k arms: probability of the greedy arm?`, `1 − ε + ε/k. Every other arm: ε/k.`],
['l9', `UCB score?`, `Q(a) + c·√(ln t / N(a)); the bonus shrinks as an arm is pulled.`],
['l9', `Q-learning update?`, `Q(s,a) ← Q(s,a) + α [r + γ max<sub>a′</sub> Q(s′,a′) − Q(s,a)].`],

['l10', `tf-idf? What does a word in every document get?`, `tf × log(N/df). A word in every document gets 0.`],
['l10', `Perplexity?`, `exp(−(1/N) Σ ln p(true token)); lower is better.`],
['l10', `BERT vs GPT?`, `BERT: encoder-only, bidirectional, masked-token training. GPT: decoder-only, causal, next-token prediction.`],
['l10', `Word2Vec vs BERT embeddings?`, `Word2Vec: static (one vector per word). BERT: contextual.`],

['coding', `In scikit-learn LogisticRegression, how does C relate to λ?`, `C = 1/λ.`],
['coding', `fit_transform on validation/test data: what is wrong?`, `Leakage. Fit the scaler on training data, then only <code>transform</code> the others.`],
['coding', `A single feature column raises a shape error. Fix?`, `X must be 2-D: <code>x.reshape(-1, 1)</code>.`],
['coding', `DBSCAN and KMeans fitted attributes?`, `<code>labels_</code> (−1 = noise in DBSCAN), <code>inertia_</code> for KMeans. Note the trailing underscore.`],
];
})(typeof window !== 'undefined' ? window : globalThis);
