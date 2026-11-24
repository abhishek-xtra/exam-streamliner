/* CS-A1140 flashcards: [Study Hall page id, front, back]. The Study Hall "Check yourself"
   questions are added to the deck automatically (exam/engine.js), so these cover the rest. */
(function (G) {
'use strict';
const XM = G.XM; XM.cards = XM.cards || {};
XM.cards.dsa = [
['overview', `What does "running time" mean in a DSA exam answer?`, `The <b>tightest</b> asymptotic bound in O / Θ notation.`],
['overview', `A part says "justify". What must the answer contain?`, `The answer <b>plus one or two sentences of reason</b>. A bare answer earns only part of the points.`],

['q1-costs', `ArrayBuffer: append at the end?`, `<b>O(1) amortized</b> (the array doubles when full). Always write "amortized".`],
['q1-costs', `Define amortized constant time.`, `Any sequence of m operations takes O(m) in total, even if one single operation is slow. It is a worst-case guarantee over sequences, <b>not</b> an average over random inputs.`],
['q1-costs', `Why does doubling give O(1) amortized appends?`, `Over n appends the copies are 1 + 2 + 4 + … + n/2 &lt; n, so the total work is ≤ 3n = O(n), i.e. O(1) per append.`],
['q1-costs', `Sorted array: search, and add?`, `Search Θ(log n) (binary search). Add Θ(n) (elements must shift).`],
['q1-costs', `Balanced BST set: list all keys in order?`, `<b>Θ(n)</b> by in-order traversal, not Θ(n log n).`],
['q1-costs', `Max-heap priority queue: max, add, remove-max?`, `Max O(1) (the root). Add Θ(log n). Remove-max Θ(log n).`],
['q1-costs', `How do you get a queue with O(1) enqueue and dequeue?`, `A circular buffer (head index + size, indices mod capacity, doubling when full) or a linked list with head and tail pointers. Shifting an array on every dequeue is Θ(n).`],

['q1-code', `What is the hidden cost of <code>buf.contains(x)</code> inside a loop?`, `Θ(size of buf) per call. Fix: keep a HashSet beside it (O(1) average).`],
['q1-code', `The 2025 dedup function with <code>seen.contains(e)</code>: best and worst case?`, `Best Θ(n) (all elements equal). Worst Θ(n²) (all distinct: 0 + 1 + … + (n−1)). With a HashSet for seen: Θ(n) <b>average</b>.`],
['q1-code', `You improve code with a Set. What must you still check?`, `That the output is <b>exactly the same</b> (order and duplicates). Use the HashSet only for the membership test, keep the output buffer.`],
['q1-code', `A loop where <code>i *= 2</code> each step runs how many times?`, `Θ(log n) times.`],

['q2-sorting', `Define a stable sort.`, `Elements with equal keys keep their original relative order.`],
['q2-sorting', `Define an in-place sort.`, `It uses only O(1) (or O(log n)) extra memory besides the array.`],
['q2-sorting', `Fingerprint: the inner loop finds the minimum of a(i..n−1), then one swap. Which sort? Facts?`, `<b>Selection sort.</b> Best = worst Θ(n²), Θ(1) memory, not stable (long-distance swap), in place.`],
['q2-sorting', `Fingerprint: <code>val element = a(i); while j &gt; 0 &amp;&amp; element &lt; a(j−1)</code> shifts right. Which sort? Facts?`, `<b>Insertion sort.</b> Best Θ(n) (sorted), worst Θ(n²) (reversed), Θ(1) memory, stable (strict &lt;), in place.`],
['q2-sorting', `Merge sort: memory, stable, in place?`, `Θ(n) extra (aux array). Stable (merge uses &lt;= and takes the left element first). <b>Not</b> in place.`],
['q2-sorting', `Merge sort with the early exit <code>if a(mid−1) &lt;= a(mid) then return</code>: best and worst?`, `Best (already sorted) becomes <b>Θ(n)</b>. Worst stays Θ(n log n).`],
['q2-sorting', `Quicksort (Lomuto, pivot a(hi)): worst-case input, cost and fixes?`, `Sorted, reversed or all-equal input → partitions n−1, n−2, … → <b>Θ(n²)</b>. Fixes: random pivot, median-of-three, three-way partitioning for equal keys.`],
['q2-sorting', `Heapsort: time, memory, stable?`, `Θ(n log n) best and worst, Θ(1) memory, not stable, in place.`],
['q2-sorting', `Lower bound for comparison sorting?`, `Ω(n log n) comparisons in the worst case.`],

['q3-bst', `BST delete of a node with two children (course convention)?`, `Replace its key with the <b>largest key in the left subtree</b> (in-order predecessor), then delete that node. Not the successor.`],
['q3-bst', `Define an AVL tree.`, `A BST where at <b>every</b> node the heights of the left and right subtrees differ by at most 1.`],
['q3-bst', `AVL insert: which rotation for a left-right (zig-zag) case?`, `A double rotation: left rotation at the child, then right rotation at the unbalanced node z.`],
['q3-bst', `AVL insert: where do you rotate?`, `At the <b>lowest</b> unbalanced node on the path up from the new leaf. One (single or double) rotation fixes an insertion.`],
['q3-bst', `Why use balanced trees for sets and maps?`, `An unbalanced BST can become a path (insert sorted keys) with height Θ(n). AVL/red-black keep the height O(log n), so operations are Θ(log n).`],

['q3-heap', `The two max-heap properties?`, `<b>Shape:</b> complete binary tree (last level filled from the left). <b>Order:</b> every parent ≥ its children.`],
['q3-heap', `0-based heap array: children and parent of index i?`, `Children 2i + 1 and 2i + 2. Parent ⌊(i − 1)/2⌋.`],
['q3-heap', `Heap insert, step by step?`, `Put the element at index n (the end), then swap it with its parent while it is larger (upheap). Θ(log n).`],
['q3-heap', `Heap remove-max, step by step?`, `Move the last element to the root, then swap it with the <b>larger</b> child while it is smaller (downheap). Θ(log n).`],

['q3-hash', `Define the load factor.`, `α = n / m (stored keys / slots).`],
['q3-hash', `Open addressing: how do you remove a key, and why?`, `Put a <b>tombstone</b> in the slot. Emptying it would stop later searches that should continue past it.`],
['q3-hash', `Linear probing sequence?`, `h(k, i) = (h(k) + i) mod m. Causes primary clustering.`],
['q3-hash', `Why is h(x) = x mod 2ᵏ a bad hash function?`, `It uses only the k lowest bits, so keys with equal low bits (e.g. multiples of 2ᵏ) all collide. Prefer a prime m.`],
['q3-hash', `Rehashing: what, when, why?`, `When α passes a threshold (≈1 chaining, ½–¾ open addressing), allocate a ≈2× table and re-insert every key. Keeps operations O(1) on average; the cost is amortized like ArrayBuffer doubling.`],
['q3-hash', `Simple uniform hashing assumption?`, `Every key is equally likely to hash to any slot, independently of the others → expected chain length α.`],

['q4-bfs', `BFS: data structures and running time?`, `Adjacency lists, a FIFO queue, dist (or visited) and pred. <b>O(|V| + |E|)</b>.`],
['q4-bfs', `BFS: when do you mark a vertex as seen?`, `When it is <b>enqueued</b> (set dist), not when dequeued, or it can be enqueued twice.`],
['q4-bfs', `Define a strongly connected component.`, `A maximal set of vertices in which every vertex reaches every other by directed paths. Singletons count.`],

['q4-dfs', `Define a topological ordering. When does one exist?`, `A linear order of all vertices with u before v for every edge (u, v). It exists iff the graph is a DAG.`],
['q4-dfs', `How does DFS give a topological order?`, `Run DFS from every unvisited vertex; when a vertex finishes, prepend it → vertices in <b>decreasing finishing time</b>.`],
['q4-dfs', `How does DFS detect a cycle?`, `An edge to a <b>grey</b> vertex (still on the recursion stack) is a back edge → cycle.`],

['q4-dijkstra', `Dijkstra with a binary heap: running time?`, `O((n + m) log n): n extract-mins and ≤ m decrease-keys, each O(log n).`],
['q4-dijkstra', `Why do negative weights break Dijkstra? Example?`, `It treats an extracted vertex as final. s→a (1), s→b (2), b→a (−2): a is extracted with 1 but s→b→a costs 0. Use Bellman-Ford.`],
['q4-dijkstra', `Dijkstra: when is a vertex's distance final?`, `When it is <b>extracted</b> from the priority queue, not when it is first reached.`],

['q5-dp', `The 5 steps of a DP answer?`, `1) sub-problem in words · 2) recurrence + base cases · 3) table / memoised order · 4) running time = #sub-problems × work each · 5) fill the table for the given input.`],
['q5-dp', `Frog with jumps of 2 or 3: recurrence?`, `F(0) = 1, F(i) = F(i−2) + F(i−3) (negative index = 0).`],
['q5-dp', `Number of s→t paths in a DAG: recurrence and order?`, `a(t) = 1, a(v) = Σ a(w) over edges v→w. Evaluate in <b>reverse topological order</b>. O(|V| + |E|) additions.`],
['q5-dp', `Longest weighted path s→t in a DAG?`, `l(t) = 0, l(v) = max over v→w of w(v,w) + l(w); −∞ if none. O(|V| + |E|).`],
['q5-dp', `0/1 knapsack: recurrence and time?`, `V(i, c) = max(V(i−1, c), V(i−1, c − wᵢ) + vᵢ). Θ(n·W): pseudo-polynomial.`],
['q5-dp', `Longest palindromic subsequence recurrence?`, `P(i,i) = 1; s(i) = s(j) → P(i+1, j−1) + 2; else max(P(i+1, j), P(i, j−1)). Θ(n²).`],

['q6-np', `Define NP.`, `Decision problems where every yes-instance has a <b>polynomial-size certificate</b> that can be verified in polynomial time.`],
['q6-np', `Define NP-complete.`, `In NP <b>and</b> NP-hard (every NP problem reduces to it in polynomial time).`],
['q6-np', `Why is vertex k-colouring in NP?`, `Certificate: the colour of every vertex. Check each colour ∈ {1..k} and c(v) ≠ c(w) for every edge: O(|V| + |E|).`],
['q6-np', `Two practical ways to solve an NP-complete problem?`, `Backtracking with pruning; reduce to SAT/ILP and use a solver; heuristics/local search (no guarantee); exploit special cases (e.g. 2-colouring by BFS).`],
['q6-np', `How do you prove a new problem X is NP-complete?`, `Show X ∈ NP, then reduce a <b>known</b> NP-complete problem <b>to</b> X in polynomial time.`],

['q6-par', `Define work, span and parallelism.`, `Work T₁ = total operations (1 processor). Span T∞ = longest chain of dependent operations. Parallelism = T₁ / T∞.`],
['q6-par', `Divide-and-conquer sum with par.parallel: work and span?`, `Work Θ(n) (W = 2W(n/2) + O(1)). Span Θ(log n) (S = S(n/2) + O(1)).`],
['q6-par', `How do you make a parallel D&C program faster in practice?`, `A <b>sequential cut-off</b>: below a few thousand elements use a plain loop. Task creation costs far more than tiny work.`],
];
})(typeof window !== 'undefined' ? window : globalThis);
