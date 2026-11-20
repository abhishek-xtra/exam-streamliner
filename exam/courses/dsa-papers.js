/* CS-A1140 past papers, newest first. Questions use the exam's own trees, graphs, code and keys
   (checked against the PDF page images, not only the OCR text). Answers are computed by the
   same builders as the generated questions. 2024 is translated from Finnish. */
(function (G) {
'use strict';
const XM = G.XM, L = XM.lib, D = XM.DSA, C = XM.courses.dsa;
const T = (k, l, r) => [k, l || null, r || null];
const P = (q, pts, src, extra) => { q = XM.finish(q); XM.scale(q, pts); q.source = src; return Object.assign(q, extra || {}); };
const merge = (title, qs, o) => { const parts = [].concat.apply([], qs.map(q => q.parts)); return Object.assign({ title, parts, solution: [].concat.apply([], qs.map(q => q.solution || [])), traps: [].concat.apply([], qs.map(q => (q.traps || []).slice(0, 2))) }, o || {}); };
const free = () => ({ title: 'At what time did you finish answering the exam questions?', parts: [{ type: 'free', points: 1 }], solution: [] });
const fig = (items) => `<div class="xm-figs">${items.map(([svg, cap]) => `<figure>${svg}<figcaption>${cap}</figcaption></figure>`).join('')}</div>`;
const topoParts = (V, E) => { const cyc = L.hasCycle(V, E), topo = L.dfs(V, E, null, true).topo; return [
  D.wr('', 'Define a <i>topological ordering</i>. What is required of a directed graph for one to exist?', 1.5, 'A linear order of all vertices such that every edge (u, v) has u before v. It exists if and only if the graph has no directed cycle (it is a DAG).', [[1, 'u before v for every edge (u, v)'], [0.5, 'Exists iff the graph is acyclic']]),
  D.mc('', 'Does the graph have a topological ordering?', cyc ? 'No: it has a directed cycle' : 'Yes: it is acyclic', cyc ? ['Yes: it is acyclic'] : ['No: it has a directed cycle'], 1, '')].concat(cyc ? [] : [{ type: 'order', label: '', prompt: 'Give one topological ordering.', items: V.slice(), answer: topo, check: o => L.isTopo(V, E, o), points: 1.5 }]); };

/* ---------- 1.12.2025 ---------- */
const g25 = { V: 'abcdefghi'.split(''), P: D.GRID(9), E: [['a', 'b'], ['a', 'd'], ['b', 'c'], ['b', 'e'], ['c', 'f'], ['d', 'e'], ['d', 'g'], ['e', 'f'], ['e', 'i'], ['f', 'i'], ['h', 'g'], ['h', 'f']] };
const A25 = T(20, T(10, null, T(12, T(11))), T(30, T(22, null, T(23)), T(42, null, T(99)))), B25 = T(18, T(10, T(5), T(14)), T(22));
/* ---------- 2.12.2024 (Finnish paper, translated) ---------- */
const g24 = { V: 'abcdef'.split(''), P: D.GRID(6), E: [['a', 'b'], ['a', 'd'], ['b', 'c'], ['b', 'e'], ['c', 'e'], ['c', 'f'], ['d', 'e'], ['e', 'f'], ['f', 'b']] };
const DAGP = { a: [30, 100], b: [130, 30], c: [130, 170], d: [230, 100], e: [330, 30], f: [330, 170], g: [430, 30], h: [430, 100], i: [430, 170], j: [530, 100], k: [530, 30] };
const d24 = { V: 'abcdefghijk'.split(''), P: DAGP, E: [['a', 'b', 4], ['a', 'd', 3], ['a', 'c', 5], ['b', 'e', 4], ['b', 'd', 2], ['c', 'd', 6], ['d', 'e', 5], ['d', 'h', 12], ['d', 'f', 3], ['e', 'g', 9], ['e', 'h', 8], ['h', 'g', 4], ['g', 'k', 4], ['h', 'j', 2], ['h', 'i', 1], ['f', 'h', 8], ['f', 'i', 6], ['i', 'j', 3], ['j', 'k', 5]] };
/* ---------- 4.12.2023 ---------- */
const g23 = { V: 'abcdef'.split(''), P: D.GRID(6), E: [['a', 'b'], ['a', 'd'], ['b', 'd'], ['b', 'e'], ['c', 'b'], ['d', 'e'], ['e', 'f'], ['f', 'b'], ['f', 'c']] };
const d23 = { V: 'abcdefghijk'.split(''), P: DAGP, E: [['a', 'b'], ['a', 'c'], ['b', 'c'], ['b', 'd'], ['b', 'e'], ['c', 'd'], ['c', 'f'], ['d', 'e'], ['d', 'f'], ['f', 'e'], ['e', 'g'], ['e', 'h'], ['f', 'h'], ['f', 'i'], ['h', 'g'], ['h', 'i'], ['h', 'j'], ['g', 'k'], ['i', 'j'], ['j', 'k']] };
/* ---------- 21.2.2019 and 12.12.2016 Dijkstra graphs ---------- */
const DJP = { a: [30, 160], b: [160, 160], c: [290, 160], d: [160, 40], e: [290, 40] };
const g19 = { V: 'abcde'.split(''), P: DJP, E: [['a', 'd', 5], ['a', 'b', 6], ['d', 'b', 2], ['b', 'c', 1], ['c', 'e', 1], ['b', 'e', 3], ['d', 'e', 5], ['e', 'd', 1]] };
const g16 = { V: 'abcde'.split(''), P: DJP, E: [['a', 'd', 5], ['a', 'b', 6], ['d', 'b', 2], ['b', 'c', 1], ['c', 'e', 1], ['d', 'e', 4], ['e', 'd', 1]] };
/* ---------- 12.12.2018 ---------- */
const g18 = { V: 'abcdef'.split(''), P: D.GRID(6), E: [['a', 'b'], ['a', 'd'], ['b', 'c'], ['b', 'd'], ['b', 'e'], ['b', 'f'], ['d', 'e'], ['e', 'f'], ['f', 'c']] };
const A18 = T(20, T(10, T(5, null, T(7)), T(18)), T(30, T(22, null, T(28)), T(42, T(35)))), B18 = T(10, T(5, T(2), T(7)), T(21, T(17, null, T(19)), T(23)));
const A16 = T(20, T(10, T(5), T(18)), T(30, T(22, null, T(28, T(25))), T(42, T(35, null, T(40))))), B16 = T(10, T(5, T(2), T(7)), T(21, T(17, T(15)), T(23)));
const NPdefs3 = () => [D.wr('', 'Define a <b>polynomial-time solvable</b> decision problem.', 1.5, 'There is a deterministic algorithm that answers every instance correctly in time O(nᵏ) for some constant k, where n is the input size (the class P).', [[1, 'Deterministic algorithm, always correct'], [0.5, 'Running time polynomial in the input size']]),
  D.wr('', 'Define a decision problem in <b>NP</b>.', 1.5, 'Every yes-instance has a polynomial-size certificate that can be checked by a deterministic polynomial-time algorithm (equivalently, it is solvable in non-deterministic polynomial time).', [[1, 'Polynomial-size certificate for yes-instances'], [0.5, 'Checkable in polynomial time']]),
  D.wr('', 'Define an <b>NP-complete</b> problem.', 1.5, 'It is in NP, and every problem in NP reduces to it in polynomial time (it is NP-hard).', [[0.75, 'In NP'], [0.75, 'Every NP problem polynomial-time reduces to it']]),
  D.wr('', 'Describe one NP-complete problem and two different approaches for solving it in practice.', 3.5, 'E.g. <b>SAT</b>: given a CNF formula, is there a satisfying assignment? (or graph colouring, subset-sum, Hamiltonian cycle…). Approaches: (1) <b>backtracking search with pruning</b> (DPLL / CDCL in SAT solvers: assign variables, propagate unit clauses, backtrack on conflicts); (2) <b>local search / heuristics</b> (e.g. WalkSAT, greedy), fast but no guarantee of finding an answer; (3) <b>special cases</b>, e.g. subset-sum with small numbers by DP, 2-SAT in polynomial time; (4) reduce to a SAT/ILP solver.', [[1, 'A correctly stated NP-complete problem (input + yes/no question)'], [1.25, 'First approach explained'], [1.25, 'Second, genuinely different approach explained']])];

C.papers = [
  { id: '2025-12-01', title: 'DSA exam 1.12.2025', note: 'English original. Selection sort, BST + AVL, DFS + topological order, frog DP, NP (vertex colouring).', minutes: 180,
    questions: () => { const S = 'DSA exam 1.12.2025';
      const q3 = merge('Binary search trees and AVL trees', [D.buildBST(A25, [['del', 20]], { avlQ: true, name: 'A' }), D.buildAVL(B25, 2, { why: true, name: 'B' })], { figure: fig([[L.drawTree(A25), 'tree A'], [L.drawTree(B25), 'tree B']]), prompt: '(i) Remove the key 20 from tree A in the way described in the course material. (ii) Define the AVL property. (iii) Is tree A an AVL tree? (iv) Why balanced trees? (v) Insert 2 into the AVL tree B; explain the transformations.' });
      return [P(D.buildCode(D.SNIPS[0]), 10, S + ' Q1'), P(D.buildSort('selection', { fname: 'sort' }), 11, S + ' Q2'), P(q3, 8, S + ' Q3'),
        P(D.buildDFS(g25, {}), 14, S + ' Q4'), P(D.buildJumps([2, 3], 15), 8, S + ' Q5'), P(D.buildNP('coloring'), 8, S + ' Q6'), P(free(), 1, S + ' Q7')]; } },
  { id: '2024-12-02', title: 'DSA exam 2.12.2024', note: 'Translated from Finnish. Operation costs, merge sort (early-exit line), chaining, DFS + cycle test, longest DAG path, NP (dominating set).', minutes: 180,
    questions: () => { const S = 'DSA exam 2.12.2024';
      const ops = [['ArrayBuffer a with n integers', 'get the element at index i', 'O(1)', 'Direct indexing.'], ['ArrayBuffer a with n integers', 'find the smallest element', 'Θ(n)', 'Unsorted: scan everything.'], ['ArrayBuffer a with n integers', 'append an element at the end', 'O(1) amortized', 'Doubling: O(1) amortized.'],
        ['priority queue q as a binary max-heap (priority order ≤) with n integers', 'add a new element', 'Θ(log n)', 'Upheap along one path.'], ['priority queue q as a binary max-heap with n integers', 'find the largest element', 'O(1)', 'At the root.'], ['priority queue q as a binary max-heap with n integers', 'find the smallest element', 'Θ(n)', 'Any leaf can be the minimum.'],
        ['set s as a balanced binary search tree with n elements', 'add a new element', 'Θ(log n)', 'Height O(log n).'], ['set s as a balanced binary search tree with n elements', 'remove an element', 'Θ(log n)', 'Height O(log n).'], ['set s as a balanced binary search tree with n elements', 'find the smallest element', 'Θ(log n)', 'Leftmost node.'], ['set s as a balanced binary search tree with n elements', 'list all elements', 'Θ(n)', 'In-order traversal.']];
      return [P(D.buildOps(ops), 10, S + ' Q1'), P(D.buildSort('merge', { fname: 'sort', early: 'commented' }), 11, S + ' Q2'),
        P(D.buildHashChain(5, [['ins', 11], ['ins', 8], ['ins', 6], ['ins', 16], ['del', 6]], { theory: ['coll', 'rehash', 'suha', 'const'], tablePts: 4 }), 11, S + ' Q3'),
        P(D.buildDFS(g24, { topo: false, cycleQ: true, prompt: '(i) Describe DFS that finds all vertices reachable from a source. (ii) Adjacency lists of the graph. (iii) Run DFS from a. (iv) How can DFS decide whether the graph is acyclic? Neighbours in alphabetical order.' }), 11, S + ' Q4'),
        P(D.buildDagLongest(d24, { s: 'a', t: 'k' }), 8, S + ' Q5'), P(D.buildNP('domset'), 8, S + ' Q6'), P(free(), 1, S + ' Q7')]; } },
  { id: '2023-12-04', title: 'DSA exam 4.12.2023', note: 'English (blurry scan; the DAG in Q5 is read from the photo). Insertion sort, heaps, linear probing, BFS + SCC, counting DAG paths, parallel work/span.', minutes: 180,
    questions: () => { const S = 'DSA exam 4.12.2023';
      const ha = T(23, T(16, T(14), T(17)), T(17, T(12))), hb = T(22, T(16, T(12)), T(17, T(14), T(3)));
      const heap = D.buildHeap([23, 17, 20, 12, 14, 7, 11], 18, { defs: true, name: '(c)', checks: [{ ans: 'No: heap order is violated', why: '16 has a child 17 > 16.' }, { ans: 'No: the shape is not complete', why: 'Node 16 has no right child while the next level is used: not filled from the left.' }], figs: `<figure>${L.drawTree(ha)}<figcaption>(a)</figcaption></figure><figure>${L.drawTree(hb)}<figcaption>(b)</figcaption></figure>` });
      return [P(D.buildSort('insertion', { fname: 'sortX' }), 12, S + ' Q1'), P(heap, 10, S + ' Q2'),
        P(D.buildHashOpen(7, [['ins', 15], ['ins', 9], ['ins', 8], ['ins', 22], ['del', 9]], { kind: 'linear', theory: ['coll', 'rehash', 'pow2'] }), 9, S + ' Q3'),
        P(D.buildBFS(g23, {}), 12, S + ' Q4'), P(D.buildDagCount(d23, { s: 'a', t: 'j' }), 8, S + ' Q5 (graph reconstructed from a blurry scan)'), P(D.buildPar('sum', { fname: 'parX' }), 8, S + ' Q6'), P(free(), 1, S + ' Q7')]; } },
  { id: '2019-02-21', title: 'DSA exam 21.2.2019', note: 'Amortized arrays + O(1) queue, merge sort, open addressing (m = 11), Dijkstra, parallel max, NP.', minutes: 180,
    questions: () => { const S = 'DSA exam 21.2.2019';
      return [P(D.buildAmortWritten(), 10, S + ' Q1'), P(D.buildSort('merge', { fname: 'sort', early: 'commented', inplaceDef: true, inplaceQ: true }), 13, S + ' Q2'),
        P(D.buildHashOpen(11, [['ins', 12], ['ins', 3], ['ins', 24], ['ins', 1]], { kind: 'linear', theory: ['coll', 'rehash', 'probe', 'linear'] }), 8, S + ' Q3'),
        P(D.buildDijkstra(g19), 12, S + ' Q4'), P(D.buildPar('max', { fname: 'parMax' }), 8, S + ' Q5'),
        P({ title: 'P, NP and NP-completeness', parts: NPdefs3(), solution: ['Definitions + one NP-complete problem + two practical approaches.'], traps: ['Two approaches that are really the same idea.'] }, 8, S + ' Q6'), P(free(), 1, S + ' Q7')]; } },
  { id: '2018-12-12', title: 'DSA exam 12.12.2018', note: 'Operation costs, quicksort (Lomuto), BST ops + AVL insert, BFS + topological order, rgb-strings DP, parallel sum of f(aᵢ, bᵢ).', minutes: 180,
    questions: () => { const S = 'DSA exam 12.12.2018';
      const ops = [['dynamic array (ArrayBuffer) with n integers', 'find the element at index i', 'O(1)', ''], ['dynamic array (ArrayBuffer) with n integers', 'find the smallest element', 'Θ(n)', ''], ['dynamic array (ArrayBuffer) with n integers', 'append an element at the end', 'O(1) amortized', ''],
        ['priority queue with max-heaps, n integers', 'add a new element (worst case)', 'Θ(log n)', ''], ['priority queue with max-heaps, n integers', 'find the largest element', 'O(1)', ''], ['priority queue with max-heaps, n integers', 'find the smallest element', 'Θ(n)', ''],
        ['set as a balanced BST (AVL), n integers', 'add a new element', 'Θ(log n)', ''], ['set as a balanced BST (AVL), n integers', 'remove an element', 'Θ(log n)', ''], ['set as a balanced BST (AVL), n integers', 'find the smallest element', 'Θ(log n)', ''], ['set as a balanced BST (AVL), n integers', 'list all the elements', 'Θ(n)', '']];
      const q3 = merge('BST operations and AVL insertion', [D.buildBST(A18, [['ins', 29], ['del', 22], ['del', 20]], { avlQ: true, name: 'A' }), D.buildAVL(B18, 18, { name: 'B' })], { figure: fig([[L.drawTree(A18), 'tree A'], [L.drawTree(B18), 'tree B']]), prompt: 'On tree A, in order: (i) insert 29, (ii) remove 22, (iii) remove 20, each the course\'s way. Is A an AVL tree? Insert 18 into the AVL tree B and explain the transformations.' });
      const bfs = D.buildBFS(g18, { scc: false, target: 'f' }); bfs.parts = bfs.parts.concat(topoParts(g18.V, g18.E)); bfs.title = 'BFS from a to f, and topological order';
      return [P(D.buildOps(ops), 10, S + ' Q1'), P(D.buildSort('quick', { fname: 'sort', inplaceDef: true, inplaceQ: true }), 11, S + ' Q2'), P(q3, 10, S + ' Q3'),
        P(bfs, 12, S + ' Q4'), P(D.buildRGB(5, ['rg', 'gr']), 8, S + ' Q5'), P(D.buildPar('dot', { fname: 'g' }), 8, S + ' Q6'), P(free(), 1, S + ' Q7')]; } },
  { id: '2016-12-12', title: 'DSA exam 12.12.2016', note: 'Amortized arrays + queue, describe a sort, BST ops + AVL, palindromic subsequence DP, Dijkstra, NP.', minutes: 180,
    questions: () => { const S = 'DSA exam 12.12.2016';
      const sortQ = { title: 'Describe a sorting algorithm', prompt: 'Define in-place and stable sorting. Describe <b>one</b> of insertion sort, merge sort or quicksort (pseudo-code or clear words) and answer: (i) stable? (ii) in place? (iii) best case? (iv) worst case? Justify briefly.',
        parts: [D.wr('', 'Definitions: in-place and stable.', 2, '<b>In place:</b> only O(1) (or O(log n)) extra memory besides the array. <b>Stable:</b> equal keys keep their original relative order.', [[1, 'In place = constant/small extra memory'], [1, 'Stable = equal keys keep their order']]),
          D.wr('', 'Describe your chosen algorithm.', 4, '<b>Insertion sort:</b> for i = 1…n−1, take e = a(i) and shift the larger elements of the sorted prefix a(0..i−1) one step right until e\'s place is found; put e there. <b>Merge sort:</b> split in halves, sort each recursively, merge the two sorted halves with an auxiliary array. <b>Quicksort:</b> pick a pivot, partition so smaller elements are left and larger right (e.g. Lomuto), recurse on both parts.', [[2, 'Correct, unambiguous description of the main loop / recursion'], [1, 'Key step explained (shifting / merging / partitioning)'], [1, 'Base case / termination clear']]),
          D.wr('', 'Answers (i)–(iv) for your algorithm, with justification.', 4, '<b>Insertion:</b> stable (strict &lt;), in place, best Θ(n) (sorted), worst Θ(n²) (reversed). <b>Merge:</b> stable (≤ takes the left element), not in place (Θ(n) aux), Θ(n log n) best and worst. <b>Quicksort:</b> not stable, in place (O(log n)…O(n) stack), best Θ(n log n), worst Θ(n²) (sorted input with last-element pivot).', [[1, 'Stable? correct with reason'], [1, 'In place? correct with reason'], [1, 'Best case correct with the input that causes it'], [1, 'Worst case correct with the input that causes it']])],
        solution: ['Pick the algorithm you can describe most precisely; insertion sort is the shortest to write.'], traps: ['Describing one algorithm and giving the running times of another.'] };
      const q3 = merge('BST operations, in-order listing, AVL', [D.buildBST(A16, [['ins', 17], ['del', 18], ['del', 30]], { avlQ: true, inorderQ: true, name: 'A' }), D.buildAVL(B16, 12, { name: 'B' })], { figure: fig([[L.drawTree(A16), 'tree A'], [L.drawTree(B16), 'tree B']]), prompt: 'On tree A, in order: (i) insert 17, (ii) remove 18, (iii) remove 30. List all keys in ascending order (in-order traversal, Θ(n) — independent of the height h). Is A an AVL tree? Insert 12 into the AVL tree B.' });
      return [P(D.buildAmortWritten(), 10, S + ' Q1'), P(sortQ, 10, S + ' Q2'), P(q3, 10, S + ' Q3'), P(D.buildLPS('dcaadc'), 10, S + ' Q4'), P(D.buildDijkstra(g16), 10, S + ' Q5'),
        P({ title: 'P, NP and NP-completeness', parts: NPdefs3(), solution: [], traps: [] }, 9, S + ' Q6'), P(free(), 1, S + ' Q7')]; } }
];
})(typeof window !== 'undefined' ? window : globalThis);
