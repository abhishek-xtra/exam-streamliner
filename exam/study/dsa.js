/* CS-A1140 Study Hall — structured exactly like the exam (Q1 … Q7) and the exam guide's checklists. */
(function (G) {
'use strict';
const XM = G.XM; XM.study = XM.study || {};
const T = (head, rows) => `<div class="xm-tw"><table><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>`;
const code = s => `<pre class="xm-code">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>`;
const note = (t, b) => `<div class="xm-note"><b>${t}</b> ${b}</div>`;

XM.study.dsa = [
{ id: 'overview', slot: 'Start here', title: 'How the DSA exam works', intro: 'The exam has had the <b>same 7-question skeleton since 2016</b>. Learn the skeleton, then learn each slot. Your A+ points already exceed the grade-5 limit, so <b>the exam % alone sets your grade</b>.',
  asks: ['Mon 22.2.2027 (moved from 30.11.2026; time and room: check Sisu), 3 h, pen and paper, <b>no calculator, no notes</b>. Answer in English, Finnish or Swedish.', '"Running time" always means the <b>tightest asymptotic bound</b> in O / Θ notation.', 'When a part says <i>justify</i>, a bare answer earns only part of the points: add one or two sentences of reason.'],
  know: T(['Slot', 'Points', 'What it always is', '2025', '2024', '2023'], [
    ['Q1', '10', 'Running times / analyse code', 'dedup with seen.contains', 'cost table', '(sort was Q1)'],
    ['Q2', '11–13', '<b>Identify a sort from Scala code + analyse it</b> (every year)', 'selection', 'merge (+ early exit)', 'insertion'],
    ['Q3', '8–11', 'BST/AVL <i>or</i> heap <i>or</i> hashing trace', 'BST delete + AVL', 'chaining m=5', 'max-heap + linear probing'],
    ['Q4', '11–14', 'Graph traversal by hand (biggest question)', 'DFS + topological order', 'DFS + cycle test', 'BFS + SCC'],
    ['Q5', '8', 'Design a dynamic program + fill the table', 'frog 2/3 jumps', 'longest DAG path', 'count DAG paths'],
    ['Q6', '8', 'NP-completeness <i>or</i> parallel work/span', 'NP: colouring', 'NP: dominating set', 'parallel'],
    ['Q7', '1', '"At what time did you finish?" (free point)', '✓', '✓', '✓']]) +
    T(['Exam %', '&lt;30', '30', '40', '55', '70', '85+'], [['Grade', 'fail', '1', '2', '3', '4', '<b>5</b>']]),
  method: ['Read all 7 questions first (5 min). Start with the one you are surest of (usually Q2 or Q5).', 'Budget about <b>2.5 min per point</b>: Q4 ≈ 30 min, Q2 ≈ 25 min, Q1/Q3 ≈ 20 min each, Q5/Q6 ≈ 20 min each, leaving 15 min to check.', 'For every trace (trees, hashing, graphs, DP) show <b>every intermediate state</b>: the trace is where the points are.', 'State your conventions explicitly ("neighbours in alphabetical order", "0-based heap array", "predecessor = largest key in the left subtree").', 'Write Q7 (finishing time) at the end: it is a free point.'],
  traps: ['Leaving a part blank: partial answers (a definition, a recurrence) still score.', 'Answering O(n²) where Θ(n²) is meant: give the tightest bound and say whether it is best or worst case.', 'Using a convention from another course (e.g. BST delete with the successor).'],
  check: [['How many points is Q4 typically worth?', '11–14 points: the biggest question. Always a hand trace on a drawn graph.'], ['Which question has appeared every single year?', 'Q2: a Scala sorting program you must name and analyse.']] },

{ id: 'q1-costs', slot: 'Q1 · 10 p', title: 'Running times of data-structure operations', topic: 'q1', tpls: ['ops_table', 'amort_written', 'amort_num'],
  intro: 'Q1 is either a <b>cost table</b> ("how much time does it take to …", 2018, 2024) or <b>analyse a short function</b> (2025, next page), or <b>explain amortized appends and an O(1) queue</b> (2016, 2019). Memorise this table: it answers the first type completely.',
  asks: ['2024 / 2018: "If a is an ArrayBuffer with n integers, how much time does it take to (i) find the element at index i, (ii) find the smallest element, (iii) append an element at the end?" — the same for a max-heap priority queue and a balanced BST set. No justification needed.', '2016 / 2019: "Explain how ArrayBuffer supports appends in amortized constant time and what that means" + "describe a queue with O(1) enqueue and dequeue".'],
  know: T(['Structure (n elements)', 'index i', 'search / contains', 'min', 'max', 'add', 'remove', 'list all in order'], [
    ['Array (unsorted)', 'O(1)', 'Θ(n)', 'Θ(n)', 'Θ(n)', '—', '—', 'Θ(n log n) (sort first)'],
    ['Sorted array', 'O(1)', 'Θ(log n) binary search', 'O(1)', 'O(1)', 'Θ(n) (shift)', 'Θ(n)', 'Θ(n)'],
    ['ArrayBuffer (dynamic array)', 'O(1)', 'Θ(n)', 'Θ(n)', 'Θ(n)', '<b>O(1) amortized</b> at the end; Θ(n) at the front', 'Θ(n) (front), O(1) (end)', '—'],
    ['Linked List (Scala List)', 'Θ(n)', 'Θ(n)', 'Θ(n)', 'Θ(n)', 'O(1) prepend; Θ(n) append', 'O(1) head', '—'],
    ['Binary max-heap PQ', '—', 'Θ(n)', '<b>Θ(n)</b> (any leaf)', '<b>O(1)</b> (root)', 'Θ(log n)', 'remove-max Θ(log n)', 'Θ(n log n)'],
    ['Balanced BST set (AVL, red-black)', '—', 'Θ(log n)', 'Θ(log n)', 'Θ(log n)', 'Θ(log n)', 'Θ(log n)', '<b>Θ(n)</b> in-order'],
    ['Unbalanced BST', '—', 'O(h) = O(n) worst', 'O(h)', 'O(h)', 'O(h)', 'O(h)', 'Θ(n)'],
    ['Hash set (chaining, α bounded)', '—', 'O(1) average, Θ(n) worst', 'Θ(n)', 'Θ(n)', 'O(1) average (amortized with rehash)', 'O(1) average', 'Θ(n log n)'],
    ['Queue (circular buffer / linked list)', '—', 'Θ(n)', '—', '—', 'enqueue O(1) (amort.)', 'dequeue O(1)', '—']]) +
    note('Amortized constant time:', 'any sequence of m operations takes O(m) in total, even if one single operation is slow. It is a <b>worst-case guarantee over sequences</b>, not an average over random inputs.') +
    note('Why doubling works:', 'when the array (capacity c) is full, allocate 2c and copy c elements. Over n appends the copies are 1 + 2 + 4 + … + n/2 &lt; n, so total work ≤ 3n = O(n) → O(1) per append. Growing by a constant (+1 or +10) instead gives 1 + 2 + … = Θ(n²) total.') +
    note('O(1) queue:', '(a) <b>circular array</b> with indices <code>front</code> and <code>size</code>: enqueue writes at (front + size) mod cap, dequeue reads a(front) and advances front = (front + 1) mod cap; double the array when full (amortized O(1)). (b) <b>Linked list with head and tail pointers</b>: enqueue after tail, dequeue at head.'),
  method: ['Identify the structure and the operation; ask "which path / how many elements must be touched?"', 'Give the <b>tightest</b> bound (Θ when best = worst; otherwise say "worst case").', 'For ArrayBuffer append always write "O(1) <b>amortized</b>".', 'For written parts: name the mechanism (doubling / circular indices), state the cost, define the term.'],
  example: { q: '2024 Q1(b): q is a mutable priority queue implemented with a binary max-heap containing n integers. Worst-case time to (i) add a new element, (ii) find the largest, (iii) find the smallest?', a: '(i) Θ(log n): insert at the end and upheap along one leaf-to-root path. (ii) O(1): the maximum is at the root. (iii) Θ(n): the minimum can be in any of the ⌈n/2⌉ leaves and the heap order says nothing about which one.' },
  traps: ['Θ(log n) for the minimum of a max-heap (it is Θ(n)).', '"O(1)" for ArrayBuffer append without "amortized".', 'Θ(n log n) for listing a balanced BST in order (in-order traversal is Θ(n)).', 'Saying amortized means "on average over random inputs".', 'Queue in an array where dequeue shifts all elements: Θ(n).'],
  check: [['Smallest element of a balanced BST?', 'Θ(log n): follow left children from the root; the height is O(log n).'], ['Why is growth by +1 bad for an ArrayBuffer?', 'Each append copies everything: 1 + 2 + … + n = Θ(n²) for n appends, Θ(n) per append.'], ['Membership test in a hash set, worst case?', 'Θ(n) (everything in one chain); O(1) on average with a good hash function and bounded load factor.']] },

{ id: 'q1-code', slot: 'Q1 · 10 p', title: 'Analysing code: what it computes, best and worst case, improve it', topic: 'q1', tpls: ['code_analysis'],
  intro: 'The 2025 Q1 format: a short Scala function. Parts: (i) what does it compute, (ii) best case, (iii) worst case, (iv) improve the worst case while computing <i>exactly</i> the same result, (v) the new worst case. The whole trick is <b>spotting hidden loops inside library calls</b>.',
  asks: ['2025 Q1: dedup with <code>seen.contains(e)</code> inside a loop (best Θ(n), worst Θ(n²), fix with a HashSet → Θ(n) average).', 'Expect the same pattern with other hidden linear calls.'],
  know: T(['Call inside a loop', 'Cost per call', 'Typical fix'], [
    ['<code>buf.contains(x)</code>, <code>buf.indexOf(x)</code>, <code>buf.exists(p)</code>, <code>buf.count(p)</code> on ArrayBuffer/List', 'Θ(size)', 'keep a <b>HashSet</b> / <b>HashMap</b> beside it (O(1) average)'],
    ['<code>buf.remove(0)</code>, <code>buf.insert(0, x)</code>, <code>buf.prepend(x)</code> on ArrayBuffer', 'Θ(size) (shifts)', 'remove from the end, use an index, or a Queue'],
    ['<code>list :+ x</code>, <code>list(i)</code>, <code>list.length</code> on an immutable List', 'Θ(length)', 'prepend with <code>x :: list</code> and reverse once, or ListBuffer / ArrayBuffer'],
    ['<code>s1 + s2</code> on Strings in a loop', 'Θ(total length)', 'StringBuilder'],
    ['<code>a.sorted</code>, <code>a.max</code>, <code>a.sum</code> inside the loop', 'Θ(n log n) / Θ(n)', 'compute once before the loop'],
    ['Inner loop <code>for j &lt;- 0 to i</code>', 'Σ i = Θ(n²)', 'running total / prefix sums'],
    ['Loop variable doubling (<code>i *= 2</code>) or halving', 'Θ(log n) iterations', '—'],
    ['Nested loop where the inner one doubles', 'Θ(n log n)', '—']]) +
    note('Best vs worst case:', 'pick the <b>input</b> that makes the hidden calls cheapest/most expensive. Early <code>return</code> → best case can be O(1). A growing <code>seen</code> collection → worst case when all elements are distinct (it grows to n).') +
    note('"Exactly the same result":', 'keep the order of the output and the duplicates the original keeps. A plain Set loses order, so use a HashSet only for the membership test and keep the output buffer.'),
  method: ['(i) Say <b>what it returns</b> in one sentence, including order (e.g. "the distinct elements in order of first occurrence").', '(ii)/(iii) Count the work per loop iteration, <b>including library calls</b>; sum over the loop; name the input causing best/worst.', '(iv) Replace the expensive operation by a better data structure; mention why the output is unchanged.', '(v) State the new bound and whether it is average (hashing) or worst case (balanced tree).'],
  example: { q: 'The 2025 Q1 function:' + code(`def f[T](arr: ArrayBuffer[T]): ArrayBuffer[T] =
  val result = ArrayBuffer[T]()
  val seen = ArrayBuffer[T]()
  for e <- arr do
    if !seen.contains(e) then
      seen.append(e)
      result.append(e)
  result`), a: '(i) The elements of arr with duplicates removed, each kept at its first occurrence, in the original order.<br>(ii) Best case <b>Θ(n)</b>: all elements equal, so <code>seen</code> never holds more than one element and every <code>contains</code> is O(1).<br>(iii) Worst case <b>Θ(n²)</b>: all distinct; <code>seen</code> grows to i elements and <code>contains</code> scans it: 0 + 1 + … + (n−1) = n(n−1)/2.<br>(iv) Store <code>seen</code> in a <b>mutable HashSet</b> (keep <code>result</code> as an ArrayBuffer so the order is identical).<br>(v) <b>Θ(n) on average</b> (n hash operations of O(1) expected); Θ(n log n) worst case with a balanced-tree set.' },
  traps: ['Calling it O(n) because there is "one loop".', 'Forgetting to say the improved bound is <b>average</b> case.', 'An improvement that changes the output (using a Set and losing the order).'],
  check: [['<code>for x &lt;- a do if b.contains(x) then out.append(x)</code> with |a| = n, |b| = m (ArrayBuffers). Worst case?', 'Θ(n·m); with a HashSet built from b: Θ(n + m) average.'], ['<code>while buf.nonEmpty do { s += buf(0); buf.remove(0) }</code>?', 'Θ(n²) always: each remove(0) shifts the rest.']] },

{ id: 'q2-sorting', slot: 'Q2 · 11–13 p', title: 'Sorting: identify the algorithm from code and analyse it', topic: 'q2', tpls: ['sort_identify', 'sort_trace'],
  intro: '<b>Asked every year.</b> You get a Scala program and must (i) define <i>stable</i> (often also <i>in-place</i>), (ii) name the algorithm, then give stability, worst case, best case, extra memory and practical use, each <i>justified</i>. Learn the fingerprints and the facts table below.',
  asks: ['2025 selection sort · 2024 merge sort with a commented early-exit line · 2023 insertion sort · 2019 merge sort · 2018 quicksort (Lomuto) · 2016 "describe one of insertion / merge / quicksort".', 'Typical extras: "does the best/worst case change if line 5 is uncommented?" (merge), "on what input does the worst case occur and how to avoid it?" (quick), "why is it not used in practice?" (selection), "when should one use it?" (insertion).'],
  know: note('Stable:', 'elements with <b>equal keys keep their original relative order</b>.') + note('In place:', 'uses only O(1) (or O(log n)) extra memory besides the array itself.') +
    T(['Algorithm', 'Code fingerprint', 'Best', 'Worst', 'Extra memory', 'Stable', 'In place'], [
      ['Selection', 'inner loop finds the <b>min of a(i..n−1)</b> (bestElement / bestIndex), then one swap to position i', 'Θ(n²)', 'Θ(n²)', 'Θ(1)', '<b>No</b> (long swap)', 'Yes'],
      ['Insertion', '<code>val element = a(i)</code>; <code>while j &gt; 0 &amp;&amp; element &lt; a(j−1)</code> shifts right', '<b>Θ(n)</b> (sorted)', 'Θ(n²) (reversed)', 'Θ(1)', '<b>Yes</b> (strict &lt;)', 'Yes'],
      ['Merge', '<code>mid</code>, two recursive calls, <code>aux</code> array, merge loop with <code>&lt;=</code>', 'Θ(n log n); <b>Θ(n)</b> with the early-exit line', 'Θ(n log n)', 'Θ(n)', '<b>Yes</b> (&lt;= takes left first)', 'No'],
      ['Quicksort (Lomuto)', '<code>p = a(hi)</code>, <code>i = lo − 1</code>, swap if <code>a(j) &lt;= p</code>, final <code>swap(i+1, hi)</code>, recurse on both sides of q', 'Θ(n log n)', '<b>Θ(n²)</b> (sorted input, all equal)', 'Θ(log n) … Θ(n) stack', 'No', 'Yes'],
      ['Heapsort', 'children <code>2i+1</code>, <code>2i+2</code>, a "down" loop, swap root with the end', 'Θ(n log n)', 'Θ(n log n)', 'Θ(1)', 'No', 'Yes'],
      ['Counting / LSD radix', 'count array, prefix sums, fill <code>aux</code> <b>backwards</b>, per digit/byte', 'Θ(n) (fixed key width)', 'Θ(d(n + b))', 'Θ(n + b)', 'Yes', 'No']]) +
    note('Merge sort early exit:', '<code>if a(mid−1) &lt;= a(mid) then return</code> skips the merge when the halves are already in order. Worst case unchanged Θ(n log n); best case (already sorted) becomes <b>Θ(n)</b> because each of the Θ(n) recursive calls does O(1) work.') +
    note('Quicksort worst case:', 'pivot a(hi) is always the max or min (already sorted / reversed / all equal) → partitions of size n−1, n−2, … → Θ(n²). Fixes: <b>random pivot</b> or <b>median-of-three</b>; <b>three-way partition</b> for many equal keys; switch to insertion sort for small ranges; introsort (fall back to heapsort) for a guaranteed O(n log n).') +
    note('Practical use:', '<b>insertion</b>: small or nearly sorted arrays, base case inside merge/quick sort · <b>selection</b>: never in practice (always Θ(n²), not stable) · <b>merge</b>: when stability or guaranteed n log n is needed (Θ(n) memory) · <b>quick</b>: fastest in practice on average, in place · <b>radix</b>: integer/short keys, beats Ω(n log n) because it is not comparison-based.'),
  method: ['Read the code for the <b>fingerprint</b> (see table) and name the algorithm.', 'Define stable (and in-place) in one sentence each.', 'Stable? Find the comparison: strict &lt; when shifting / &lt;= when merging → stable; long-distance swaps → not stable (give a 3-element example).', 'Worst / best case: name the input and count (e.g. "reverse sorted: 1 + 2 + … + (n−1) = Θ(n²) shifts").', 'Memory: count the auxiliary array and the recursion stack.', 'Answer the "practice" part with a concrete situation.'],
  example: { q: '2025 Q2: the selection-sort program (bestElement, bestIndex, inner j-loop, swap at the end).', a: '(i) Stable = equal keys keep their relative order.<br>(ii) <b>Selection sort</b>: each outer round finds the minimum of a(i..n−1) and swaps it to position i.<br>(iii) Worst <b>Θ(n²)</b>: the inner loop does (n−1) + (n−2) + … + 1 = n(n−1)/2 comparisons.<br>(iv) Best <b>Θ(n²)</b>: the inner loop runs fully even on sorted input (only the swaps become trivial).<br>(v) Θ(1) extra: a few variables, in place.<br>(vi) <b>Not stable</b>: [2a, 2b, 1] → the swap moves 2a behind 2b: [1, 2b, 2a].<br>(vii) Always Θ(n²) even for nearly sorted data, and not stable; insertion sort is better for small inputs and n log n algorithms for large ones.' },
  traps: ['Confusing selection (Θ(n²) best case) and insertion (Θ(n) best case).', 'Saying merge sort is in place.', 'Forgetting the recursion stack when asked about quicksort memory.', 'Not justifying: "justify (iii)–(vii)" means one or two sentences each.'],
  check: [['Insertion sort with <code>element &lt;= a(j−1)</code> instead of &lt;: stable?', 'No: equal elements would be moved past each other.'], ['Why can LSD radix sort beat Ω(n log n)?', 'It is not comparison-based; the lower bound only holds for comparison sorts.'], ['Merge sort with the early-exit line on reverse-sorted input?', 'Still Θ(n log n): the check fails at every merge.']] },

{ id: 'q3-bst', slot: 'Q3 · 8–10 p', title: 'BST insert/delete and AVL trees', topic: 'q3t', tpls: ['bst_ops', 'avl_insert'],
  intro: 'When Q3 is about trees (2025, 2018, 2016): perform operations "in the way described in the course material" and draw the tree after <b>each</b> step, define the AVL property, decide whether a tree is AVL, and insert into an AVL tree explaining the rotation.',
  asks: ['2025: remove 20 from tree A; define AVL; is A an AVL tree?; why balanced trees for sets/maps?; insert 2 into AVL tree B and explain.', '2018: insert 29, remove 22, remove 20 (in order); AVL definition + check; insert 18 into B.', '2016: insert 17, remove 18, remove 30; list keys in order + running time; AVL check; insert 12 into B.'],
  know: note('BST insert:', 'walk from the root (left if smaller, right if larger) and attach a new leaf.') +
    note('BST delete (course convention):', '0 children → just remove. 1 child → the child takes its place. <b>2 children → replace the key with the LARGEST key in the LEFT subtree</b> (in-order predecessor), then delete that node (it has no right child, so its left child moves up). <b>Not</b> the successor.') +
    note('AVL property:', 'at <b>every</b> node the heights of the left and right subtrees differ by at most 1. Height O(log n) → search/insert/delete Θ(log n) worst case.') +
    T(['After inserting into…', 'Name', 'Fix'], [['left child\'s <b>left</b> subtree of the unbalanced node z', 'left-left', 'single <b>right</b> rotation at z'], ['right child\'s <b>right</b> subtree', 'right-right', 'single <b>left</b> rotation at z'], ['left child\'s <b>right</b> subtree', 'left-right (zig-zag)', 'left rotation at the child, then right rotation at z (<b>double</b>)'], ['right child\'s <b>left</b> subtree', 'right-left (zig-zag)', 'right rotation at the child, then left rotation at z (<b>double</b>)']]) +
    note('Course algorithm:', 'insert as in a BST, then walk <b>up</b> from the new leaf; at the first node whose balance is ±2, apply the rotation for its case. One (single or double) rotation fixes an insertion.') +
    note('Why balanced trees?', 'an unrestricted BST can degenerate into a path (insert sorted keys) with height Θ(n), making operations Θ(n); AVL/red-black keep height O(log n).') +
    note('In-order listing:', 'recursive left – node – right; visits every node once: <b>Θ(n)</b>, independent of the height h.'),
  fig: L => `<div class="xm-figs"><figure>${L.drawTree([18, [10, [5, [2, null, null], null], [14, null, null]], [22, null, null]], { hot: [18] })}<figcaption>2025 tree B after inserting 2: node 18 is unbalanced (left-left)</figcaption></figure><figure>${L.drawTree([10, [5, [2, null, null], null], [18, [14, null, null], [22, null, null]]], { hot: [10] })}<figcaption>after a single right rotation at 18</figcaption></figure></div>`,
  method: ['Do the operations <b>in order</b>, each on the previous result, and draw the tree after each one.', 'For a delete with two children: write "largest key in the left subtree = X replaces the key".', 'For "is it AVL": compute subtree heights bottom-up and name the node that violates it (or say all are balanced).', 'For AVL insert: draw the BST insert, mark the lowest unbalanced node, name the case (LL/RR/LR/RL), draw the result, and say <i>why</i> (outer vs inner subtree).'],
  example: { q: '2025 Q3(i): remove 20 from tree A = 20(10(–, 12(11, –)), 30(22(–, 23), 42(–, 99))).', a: '20 has two children. The largest key in its left subtree is <b>12</b>. 12 replaces 20 at the root; the old node 12 is removed and its left child 11 becomes the right child of 10. Result: 12(10(–, 11), 30(22(–, 23), 42(–, 99))).<br>(iii) Tree A is <b>not</b> AVL: node 10 has an empty left subtree (height 0) and a right subtree of height 2.' },
  traps: ['Using the successor (smallest in the right subtree): a different tree than the grader expects.', 'Rotating at the root instead of the lowest unbalanced node.', 'A single rotation for a zig-zag case.', 'Doing all operations on the original tree.'],
  check: [['Insert 18 into 10(5(2,7), 21(17(–,19), 23)) (2018 tree B)?', '18 goes left of 19. Node 17 becomes unbalanced (right-left case): double rotation → 18(17, 19) replaces the subtree.'], ['Worst-case height of a BST with n keys?', 'n − 1 edges (a path), so operations Θ(n).']] },

{ id: 'q3-heap', slot: 'Q3 · 10 p', title: 'Binary max-heaps (0-based arrays)', topic: 'q3h', tpls: ['heap_ops'],
  intro: '2023 Q2: define the max-heap properties, decide whether two drawn trees are heaps, store a heap as an array, insert an element, then remove the maximum, showing the steps.',
  asks: ['(i) properties, (ii) are trees (a), (b) max-heaps?, (iii) array storage of heap (c), (iv) insert 18, (v) remove-max from the result.'],
  know: note('Two properties:', '<b>shape</b>: complete binary tree (every level full except the last, which is filled from the left); <b>heap order</b>: every parent ≥ its children (so the max is at the root).') +
    note('Array (course: 0-based):', 'store level by level, left to right. Children of i: <b>2i + 1</b> and <b>2i + 2</b>; parent: <b>⌊(i − 1)/2⌋</b>. No pointers needed.') +
    note('Insert (upheap):', 'put the new element at index n (end), then while it is larger than its parent, swap with the parent. O(log n).') +
    note('Remove-max (downheap):', 'take a(0); move the <b>last</b> element to index 0, shrink; while it is smaller than its <b>larger</b> child, swap with that child. O(log n).') +
    note('Heapsort:', 'build a heap in O(n), then n − 1 times swap the root to the end and downheap: Θ(n log n), in place, not stable.'),
  fig: L => `<div class="xm-figs"><figure>${L.drawTree(L.heapTree([23, 17, 20, 12, 14, 7, 11]))}<figcaption>2023 heap (c): array [23, 17, 20, 12, 14, 7, 11]</figcaption></figure></div>`,
  method: ['Check shape first (gaps?), then order (any child larger than its parent?). Name the offending node.', 'Write the array with indices 0…n−1 under it.', 'Insert: append, then list each swap ("18 ↔ 12, 18 ↔ 17") and the final array.', 'Remove-max: move the last element to the root, list each swap with the larger child, final array.'],
  example: { q: '2023: insert 18 into [23, 17, 20, 12, 14, 7, 11], then remove the maximum.', a: 'Insert: 18 goes to index 7; parent index 3 holds 12 → swap; now at 3, parent index 1 holds 17 → swap; at 1, parent 23 is larger → stop. Array <b>[23, 18, 20, 17, 14, 7, 11, 12]</b>.<br>Remove-max: take 23; move 12 to the root: [12, 18, 20, 17, 14, 7, 11]; larger child of 12 is 20 → swap: [20, 18, 12, 17, 14, 7, 11]; children of index 2 are 7 and 11, both smaller → stop. Result <b>[20, 18, 12, 17, 14, 7, 11]</b>.' },
  traps: ['1-based formulas (2i, 2i+1): the course uses 0-based.', 'Swapping with the left child when the right one is larger.', 'Inserting at the root.'],
  check: [['Parent of index 6?', '⌊(6 − 1)/2⌋ = 2.'], ['Where can the minimum of a max-heap be?', 'In any leaf: indices ⌊n/2⌋ … n−1, so finding it is Θ(n).']] },

{ id: 'q3-hash', slot: 'Q3 · 8–11 p', title: 'Hashing: chaining, open addressing, tombstones, rehashing', topic: 'q3x', tpls: ['hash_chain', 'hash_linear', 'hash_other'],
  intro: '2024 (chaining, m = 5), 2023 (linear probing, m = 7, with a removal), 2019 (linear probing, m = 11): give the table <b>after each step</b>, then answer short theory questions.',
  asks: ['Trace: insert keys in order, then remove one; show every intermediate table.', 'Theory: hash function; collision; load factor; rehashing (what, when, why); simple uniform hashing assumption; probe sequence and its properties; linear probing; why x mod 2ᵏ is bad; what is needed for O(1) average inserts.'],
  know: T(['Term', 'Definition (exam wording)'], [['Hash function', 'h maps a key to a slot 0…m−1; must be deterministic, fast and spread keys evenly.'], ['Collision', 'two different keys hash to the same slot.'], ['Load factor', 'α = n / m (stored keys / slots).'], ['Rehashing', 'when α exceeds a threshold (≈1 for chaining, ½…¾ for open addressing), allocate a larger table (≈2×) and <b>re-insert every key</b> (slots depend on m). Keeps operations O(1) on average; cost amortized like ArrayBuffer doubling.'], ['Simple uniform hashing', 'every key is equally likely to hash to any slot, independently of the others → expected chain length α.'], ['Probe sequence', 'h(k,0), h(k,1), …, h(k,m−1): the order of slots tried. Should be a <b>permutation of all slots</b> and differ between keys (avoid clustering).'], ['Linear probing', 'h(k,i) = (h(k) + i) mod m. Primary clustering.'], ['Quadratic (course)', 'h(k,i) = (h(k) + i(i+1)/2) mod m (visits all slots when m is a power of 2).'], ['Double hashing', 'h(k,i) = (h₁(k) + i·h₂(k)) mod m.'], ['x mod 2ᵏ', 'uses only the k lowest bits → keys with equal low bits (e.g. multiples of 2ᵏ, aligned addresses) all collide. Prefer a prime m.']]) +
    note('Chaining:', 'each slot is a list; insert into the slot\'s list (if not already there); remove from the list.') +
    note('Open-addressing removal:', 'put a <b>tombstone ("del")</b> in the slot. Emptying it would break later searches that should continue past it. A search skips tombstones and stops at an empty slot; an insert may reuse the first tombstone on its sequence.') +
    note('O(1) average inserts need:', 'a good hash function (≈ uniform) and a bounded load factor (rehash when it grows).'),
  fig: L => L.drawArray([null, 15, 'del', 8, 22, null, null], { hot: [2] }),
  method: ['Compute h(k) for every key first (k mod m), write them down.', 'Process the operations in order; after each, draw the whole table (slot indices on top).', 'Linear probing: on a collision try the next slot (wrap around at m−1 → 0).', 'Removal: tombstone for open addressing; just delete from the list for chaining.', 'Theory parts: one precise sentence each, using the terms above.'],
  example: { q: '2023 Q3: m = 7, h(x) = x mod 7, linear probing. Insert 15, 9, 8, 22, then remove 9.', a: 'h: 15→1, 9→2, 8→1, 22→1.<br>insert 15: slot 1 · insert 9: slot 2 · insert 8: 1 taken, 2 taken → <b>3</b> · insert 22: 1, 2, 3 taken → <b>4</b> · remove 9: slot 2 becomes <b>del</b>.<br>Final: [–, 15, del, 8, 22, –, –]. (A later search for 22 probes 1, 2 (tombstone: continue), 3, 4 → found.)' },
  traps: ['Showing only the final table.', 'Emptying a slot on removal in open addressing.', 'Forgetting wrap-around.', 'Arithmetic slips with mod: 16 mod 5 = 1, 22 mod 7 = 1.'],
  check: [['Chaining, m = 5: insert 11, 8, 6, 16 then remove 6 (2024).', 'h: 11→1, 8→3, 6→1, 16→1. Final: slot 1 = [11, 16], slot 3 = [8].'], ['Why must the probe sequence be a permutation of all slots?', 'So an insert always finds a free slot if one exists.']] },

{ id: 'q4-bfs', slot: 'Q4 · 11–14 p', title: 'Graphs I: representation, BFS, strongly connected components', topic: 'q4b', tpls: ['bfs_scc'],
  intro: '2023 and 2018: give BFS pseudo-code and its data structures, draw the adjacency lists, run BFS from a (and to a target), and define/find SCCs or a topological order.',
  asks: ['(i) BFS pseudo-code / structured description, (ii) data structures needed, (iii) adjacency-list representation, (iv) run it from a, (v) define a strongly connected component, (vi) list the SCCs of the graph; running time O(n + m).'],
  know: code(`bfs(G, s):
  for v in V: dist[v] = ∞; pred[v] = nil
  dist[s] = 0; Q = new Queue; Q.enqueue(s)
  while Q not empty:
    u = Q.dequeue()
    for v in adj[u]:                 // alphabetical order
      if dist[v] == ∞:               // not seen yet
        dist[v] = dist[u] + 1; pred[v] = u
        Q.enqueue(v)`) +
    note('Data structures:', 'adjacency lists, a <b>FIFO queue</b>, arrays/maps dist (or visited) and pred.') +
    note('Running time:', 'O(|V| + |E|): each vertex is enqueued once, each edge examined once.') +
    note('Adjacency list:', 'for each vertex the list of its <b>out-neighbours</b>, e.g. a: b → d; b: d → e; …') +
    note('SCC:', 'a <b>maximal</b> set of vertices where every vertex reaches every other vertex by directed paths. Every cycle lies inside one SCC; a vertex on no cycle is an SCC on its own. Find them by looking for cycles and merging overlapping ones (algorithmically: Kosaraju / Tarjan).'),
  fig: L => L.drawGraph({ a: [40, 34], b: [160, 34], c: [280, 34], d: [40, 120], e: [160, 120], f: [280, 120] }, [['a', 'b'], ['a', 'd'], ['b', 'd'], ['b', 'e'], ['c', 'b'], ['d', 'e'], ['e', 'f'], ['f', 'b'], ['f', 'c']]),
  method: ['Write the adjacency lists in alphabetical order.', 'Run BFS with a table: queue contents after each dequeue, plus dist and pred.', 'Give the BFS tree (pred edges) and, if asked, the path to the target by following pred backwards.', 'SCCs: find cycles, merge those sharing a vertex; list all components including singletons.'],
  example: { q: '2023 Q4 graph (shown): edges a→b, a→d, b→d, b→e, c→b, d→e, e→f, f→b, f→c. BFS from a; SCCs.', a: 'Queue: [a] → [b, d] → [d, e] → [e] → [f] → [c] → []. Discovery order a, b, d, e, f, c; dist a 0, b 1, d 1, e 2, f 3, c 4; pred b←a, d←a, e←b, f←e, c←f.<br>SCCs: b → e → f → b and f → c → b, and d is on b → d → e → f → b, so <b>{b, c, d, e, f}</b> and <b>{a}</b> (no edge enters a).' },
  traps: ['Marking a vertex visited when it is dequeued (it can then be enqueued twice).', 'Using a stack (that is DFS).', 'Forgetting singleton SCCs.'],
  check: [['BFS gives shortest paths in which sense?', 'Fewest edges (unweighted).'], ['Can a DAG have an SCC with 2 vertices?', 'No: two mutually reachable vertices form a cycle.']] },

{ id: 'q4-dfs', slot: 'Q4 · 11–14 p', title: 'Graphs II: DFS, topological order, cycle detection', topic: 'q4d', tpls: ['dfs_topo'],
  intro: '2025 (14 p) and 2024 (11 p): DFS pseudo-code without timestamps, adjacency lists, run DFS from a (visit order + DFS tree), define topological ordering, give one or explain why none exists, and explain how DFS finds it / detects cycles.',
  asks: ['(i) recursive DFS pseudo-code, (ii) adjacency lists, (iii) visit order + predecessor edges from a, (iv) define topological ordering, (v) give one, (vi) how to modify DFS to find it; 2024: how to decide acyclicity.'],
  know: code(`dfs(G, s):
  for v in V: colour[v] = white; pred[v] = nil
  visit(s)
visit(u):
  colour[u] = grey; d[u] = ++time        // timestamps if asked
  for v in adj[u]:                       // alphabetical order
    if colour[v] == white: pred[v] = u; visit(v)
    else if colour[v] == grey: → back edge: cycle!
  colour[u] = black; f[u] = ++time`) +
    note('Topological ordering:', 'a linear order of <b>all</b> vertices such that every edge (u, v) has u before v. Exists <b>iff the graph is a DAG</b>.') +
    note('Finding it with DFS:', 'run visit from every unvisited vertex; when a vertex <b>finishes</b>, prepend it to a list → vertices in <b>decreasing finishing time</b>. O(|V| + |E|).') +
    note('Cycle test:', 'an edge to a <b>grey</b> vertex (still on the recursion stack) is a back edge and closes a cycle. Edges to black vertices are not cycles.'),
  fig: L => L.drawGraph({ a: [40, 30], b: [160, 30], c: [280, 30], d: [40, 110], e: [160, 110], f: [280, 110], g: [40, 190], h: [160, 190], i: [280, 190] }, [['a', 'b'], ['a', 'd'], ['b', 'c'], ['b', 'e'], ['c', 'f'], ['d', 'e'], ['d', 'g'], ['e', 'f'], ['e', 'i'], ['f', 'i'], ['h', 'g'], ['h', 'f']], { hot: [['a', 'b'], ['b', 'c'], ['c', 'f'], ['f', 'i'], ['b', 'e'], ['a', 'd'], ['d', 'g']] }),
  method: ['Adjacency lists, alphabetical.', 'Trace with a stack of calls: write "visit a → visit b → …" and note when each vertex finishes.', 'Visit order = discovery order; DFS tree = the pred edges (highlighted).', 'Topological order: list vertices by decreasing finishing time, <b>restarting DFS from unvisited vertices</b> so all appear. Check every edge points forward.', 'If you meet a grey vertex, report the cycle and say no ordering exists.'],
  example: { q: '2025 Q4 graph (shown), DFS from a, then a topological ordering.', a: 'Visit order <b>a, b, c, f, i, e, d, g</b> (h is not reachable from a). Tree edges a→b, b→c, c→f, f→i, b→e, a→d, d→g.<br>Finishing order: i, f, c, e, b, g, d, a, then h (restart) → reverse: <b>h, a, d, g, b, e, c, f, i</b>. Every edge points forward, so it is a topological ordering (the graph is a DAG).' },
  traps: ['Discovery order is not a topological order.', 'Forgetting the vertices unreachable from a (h) in the topological order.', 'Not stating "alphabetical order of neighbours".'],
  check: [['2024 graph has edges b→e, e→f, f→b. Topological order?', 'None: b → e → f → b is a cycle; DFS meets the grey vertex b from f.'], ['Running time of DFS?', 'O(|V| + |E|).']] },

{ id: 'q4-dijkstra', slot: 'Q4 · 10–12 p', title: 'Graphs III: Dijkstra (and Bellman-Ford, MST briefly)', topic: 'q4w', tpls: ['dijkstra', 'mst'],
  intro: '2019 and 2016 Q4/Q5: explain Dijkstra and its data structures, run it from a on a small weighted graph, give the running time, and show why negative weights break it.',
  asks: ['Pseudo-code or structured description + data structures; trace from a; worst-case running time with |V| = n, |E| = m; an example where negative weights fail.'],
  know: code(`dijkstra(G, w, s):
  for v in V: dist[v] = ∞; pred[v] = nil
  dist[s] = 0; Q = min-priority queue of all vertices by dist
  while Q not empty:
    u = Q.extractMin()                 // dist[u] is now final
    for (v, w) in adj[u]:
      if dist[u] + w < dist[v]:        // relax
        dist[v] = dist[u] + w; pred[v] = u
        Q.decreaseKey(v, dist[v])`) +
    note('Data structures:', 'weighted adjacency lists, a <b>min-priority queue</b> (binary heap), dist and pred arrays.') +
    note('Running time:', '<b>O((n + m) log n)</b> with a binary heap: n extract-mins and ≤ m decrease-keys, each O(log n).') +
    note('Negative weights:', 'Dijkstra assumes an extracted vertex is final. Example: s→a (1), s→b (2), b→a (−2): a is extracted with 1, but s→b→a costs 0. Use <b>Bellman-Ford</b> (relax all edges n−1 times, O(nm), detects negative cycles) or, on DAGs, relax in topological order.') +
    note('MST (round 8):', '<b>Kruskal</b>: sort edges, add if it joins two components (union-find). <b>Prim</b>: grow a tree, always add the cheapest edge leaving it (priority queue).'),
  fig: L => L.drawGraph({ a: [30, 150], b: [160, 150], c: [290, 150], d: [160, 40], e: [290, 40] }, [['a', 'd', 5], ['a', 'b', 6], ['d', 'b', 2], ['b', 'c', 1], ['c', 'e', 1], ['b', 'e', 3], ['d', 'e', 5], ['e', 'd', 1]]),
  method: ['Table with one column per vertex; first row: a = 0, others ∞.', 'Each row: extract the unfinished vertex with the smallest dist (mark it), then relax its out-edges and write the new row.', 'Finish with the shortest-path tree (pred) and final distances.'],
  example: { q: '2019 Q4 graph (shown), source a.', a: 'Start: a0 b∞ c∞ d∞ e∞.<br>extract a: d5, b6 · extract d (5): b stays 6 (5+2 = 7), e 10 · extract b (6): c 7, e min(10, 9) = 9 · extract c (7): e min(9, 8) = <b>8</b> · extract e (8): d stays 5.<br>Final a0, d5, b6, c7, e8; tree a→d, a→b, b→c, c→e.' },
  traps: ['Finalising a vertex when first reached instead of when extracted.', 'Skipping rows: the step-by-step table is most of the points.'],
  check: [['Dijkstra on an undirected graph?', 'Works: treat each edge as two directed edges (weights ≥ 0).'], ['Running time with an array instead of a heap?', 'O(n² + m): fine for dense graphs.']] },

{ id: 'q5-dp', slot: 'Q5 · 8–10 p', title: 'Dynamic programming: the 5-step answer and every recurring problem', topic: 'q5', tpls: ['dp_jumps', 'dp_rgb', 'dp_dagcount', 'dp_daglong', 'dp_lps', 'dp_coins', 'dp_knap'],
  intro: 'Q5 is always "develop a dynamic-programming algorithm": give the recursive definition, the algorithm (Scala or pseudo-code), its running time, and show how it solves a small instance (a table, not a list of solutions).',
  asks: ['2025 frog jumps of 2 or 3 (n = 15) · 2024 longest path in a weighted DAG · 2023 number of s→t paths in a DAG · 2018 rgb-strings with no r next to g (n = 5) · 2016 longest palindromic subsequence of "dcaadc".'],
  know: '<p><b>The 5 steps (course recap):</b> 1) define the sub-problem in words; 2) recurrence + base cases; 3) bottom-up table (or memoised recursion) in an order where everything needed is ready; 4) running time = #sub-problems × work each (× number size if they grow); 5) fill the table for the given input (and reconstruct the solution if asked).</p>' +
    T(['Problem', 'Sub-problem', 'Recurrence', 'Time'], [
      ['Frog / jumps of a or b units', 'F(i) = #sequences covering exactly i units', 'F(0) = 1, F(i) = F(i−a) + F(i−b) (negative index = 0)', 'O(n) additions (O(n log n) or O(n²) bits as numbers grow)'],
      ['rgb-strings, no "r" next to "g"', 'R(i), G(i), B(i) = #valid strings of length i ending in r / g / b', 'R(i) = R(i−1) + B(i−1); G(i) = G(i−1) + B(i−1); B(i) = R + G + B (of i−1); all 1 at i = 1', 'O(n)'],
      ['#paths s→t in a DAG', 'a(v) = #paths v→t', 'a(t) = 1, a(v) = Σ a(w) over edges v→w', 'O(|V| + |E|) additions (× |V| bits)'],
      ['Longest path s→t in a weighted DAG', 'l(v) = max weight of a v→t path', 'l(t) = 0, l(v) = max over v→w of w(v,w) + l(w); −∞ if none', 'O(|V| + |E|)'],
      ['Longest palindromic subsequence', 'P(i, j) on s(i..j)', 'P(i,i) = 1; s(i) = s(j) → P(i+1, j−1) + 2; else max(P(i+1, j), P(i, j−1))', 'Θ(n²) time and memory'],
      ['Coin change (#ways)', 'W(x) using the first k coins', 'W(x) += W(x − c) for each coin c (coins in the outer loop)', 'Θ(k·A)'],
      ['0/1 knapsack', 'V(i, c) best value with items 1..i, capacity c', 'max(V(i−1, c), V(i−1, c − wᵢ) + vᵢ)', 'Θ(n·W) (pseudo-polynomial)'],
      ['LCS / rod cutting (lecture examples)', 'L(i, j) / r(j)', 'match → L(i−1, j−1) + 1 else max; r(j) = max pᵢ + r(j − i)', 'Θ(nm) / Θ(n²)']]) +
    note('Evaluation order on DAGs:', '<b>reverse topological order</b> (from t backwards), or memoised recursion from s.'),
  method: ['Write the sub-problem definition as a sentence ("a(v) = the number of paths from v to t").', 'Write the recurrence with <b>all</b> base cases.', 'Give a short loop in Scala/pseudo-code (array of size n + 1, or a map per vertex in reverse topological order).', 'State the running time, mentioning big-number arithmetic if the exam says so (it often allows "n log n").', 'Fill the table for the given input, clearly, in evaluation order. Do <b>not</b> enumerate solutions.'],
  example: { q: '2025 Q5: jumps of 2 or 3, n = 15.', a: 'F(i) = number of jump sequences covering exactly i units. F(0) = 1, F(1) = 0, F(i) = F(i−2) + F(i−3).<br>' + code(`def count(n: Int): BigInt =
  val F = Array.fill[BigInt](n + 1)(0)
  F(0) = 1
  for i <- 2 to n do
    F(i) = F(i - 2) + (if i >= 3 then F(i - 3) else 0)
  F(n)`) + 'n iterations with O(n)-bit additions → O(n log n) as the exam asks (O(n) additions).<br>Table: F(0..15) = 1, 0, 1, 1, 1, 2, 2, 3, 4, 5, 7, 9, 12, 16, 21, <b>28</b>. (Check: F(8) = 4 and F(9) = 5 as in the question.)' },
  traps: ['Wrong base case (F(0) = 1 counts the empty sequence).', 'Listing all sequences/strings instead of the table.', 'Evaluating a DAG vertex before its successors.', 'Forgetting the running time.'],
  check: [['rgb, no r–g neighbours: n = 2 total?', '7 (R=2, G=2, B=3).'], ['LPS of "dcaadc" (2016)?', 'Length 4, e.g. "caac" (positions 2, 3, 4, 6) or "daad".']] },

{ id: 'q6-np', slot: 'Q6 · 8 p', title: 'NP-completeness: definitions, "why is X in NP", practical approaches', topic: 'q6n', tpls: ['np_problem', 'np_quick'],
  intro: 'Q6 was NP in 2024 and 2025 (8 p): (i) define a decision problem in NP, (ii) define NP-complete, (iii) explain why a given problem is in NP, (iv) describe how to solve it in practice.',
  asks: ['2025: VERTEX COLORING (does G have a k-colouring?). 2024: DOMINATING SET (is there D ⊆ V, |D| ≤ k, with every vertex in D or adjacent to D?). 2019/2016: define P, NP, NP-complete; describe one NP-complete problem and two practical approaches.'],
  know: T(['Concept', 'Exam definition'], [['Decision problem', 'a problem whose answer is yes/no for each instance.'], ['P', 'solvable by a deterministic algorithm in polynomial time O(nᵏ) in the input size.'], ['NP', 'every <b>yes</b>-instance has a <b>certificate</b> of polynomial size that a deterministic algorithm can <b>verify in polynomial time</b> (equivalently: solvable in non-deterministic polynomial time).'], ['NP-hard', 'every problem in NP reduces to it in polynomial time.'], ['NP-complete', '<b>in NP and NP-hard</b>. Proof of a new one: show it is in NP + reduce a known NP-complete problem <b>to</b> it.'], ['Cook–Levin', 'SAT is NP-complete (the first one).']]) +
    T(['Problem', 'Certificate', 'Polynomial check'], [['Vertex colouring (k)', 'the colour of every vertex', 'each colour ∈ {1..k} and c(v) ≠ c(w) for every edge: O(|V| + |E|)'], ['Dominating set (k)', 'the set D', '|D| ≤ k; mark D and its neighbours; all vertices marked: O(|V| + |E|)'], ['Independent set / clique / vertex cover', 'the vertex set', 'size bound + check the edges'], ['Hamiltonian cycle', 'the vertex order', 'permutation + consecutive vertices adjacent'], ['Subset-sum', 'the subset', 'add it up, compare with t'], ['SAT', 'the truth assignment', 'evaluate every clause'], ['TSP (decision)', 'the tour', 'permutation + total length ≤ B']]) +
    T(['Practical approach', 'How it applies'], [['Backtracking / exhaustive search with pruning', 'assign choices one by one (e.g. colours to vertices), undo on conflict; exponential worst case, often fine in practice'], ['Reduce to SAT (or ILP/CP) and use a solver', 'e.g. variables x_{v,c} "v has colour c", clauses: each vertex gets a colour, adjacent vertices differ; modern CDCL solvers are very fast'], ['Heuristics / local search', 'greedy colouring, simulated annealing: fast, no optimality guarantee'], ['Special cases', 'small k (2-colouring is in P via BFS), small numbers (subset-sum DP in O(n·t))']]),
  method: ['(i) and (ii): write the definitions from the table word for word in spirit.', '(iii) Name the <b>certificate</b>, describe the <b>check</b>, give its polynomial running time, and conclude "so X ∈ NP".', '(iv) Name one approach and explain how it works <b>for this problem</b> and its drawback.'],
  example: { q: '2025 Q6(iii): why is VERTEX COLORING in NP?', a: 'For a yes-instance, a certificate is the colouring c: V → {1, …, k} itself (|V| numbers: polynomial size). A verifier checks that every c(v) is in {1, …, k} and that c(v) ≠ c(w) for every edge {v, w}: O(|V| + |E|) time. Yes-instances have such a certificate and no-instances have none, so the problem is in NP.' },
  traps: ['"It is in NP because it is hard / exponential" — NP is about fast <b>verification</b>.', 'Reduction in the wrong direction.', 'Two "different" approaches that are the same idea.'],
  check: [['Is every problem in P also in NP?', 'Yes: P ⊆ NP (the solver can ignore the certificate).'], ['Is subset-sum with an O(n·t) DP in P?', 'No: t is exponential in its bit length (pseudo-polynomial).']] },

{ id: 'q6-par', slot: 'Q6 · 8 p', title: 'Parallel algorithms: work, span, parallelism', topic: 'q6p', tpls: ['par_code', 'par_num'],
  intro: '2023, 2019, 2018: a divide-and-conquer Scala program with <code>par.parallel(code1, code2)</code>. Say what it computes, give span, work (and parallelism), and how to make it faster in practice.',
  asks: ['2023 parX: Σ f(a(i)) · 2019 parMax: maximum · 2018 g: Σ f(aᵢ, bᵢ). Each with n = array length, justify in a few sentences.'],
  know: T(['Term', 'Meaning'], [['Work T₁', 'total number of operations = time on 1 processor'], ['Span T∞', 'length of the longest chain of dependent operations (critical path) = time with ∞ processors'], ['Parallelism', 'T₁ / T∞: the maximum useful number of processors'], ['Brent (greedy scheduler)', 'T_P ≤ T₁/P + T∞'], ['Amdahl', 'with serial fraction f, speed-up ≤ 1/(f + (1 − f)/P) ≤ 1/f']]) +
    T(['Program', 'Work', 'Span', 'Parallelism'], [['D&C sum / max / count / Σf(aᵢ,bᵢ) (O(1) combine)', 'W(n) = 2W(n/2) + O(1) = <b>Θ(n)</b>', 'S(n) = S(n/2) + O(1) = <b>Θ(log n)</b>', 'Θ(n / log n)'], ['Parallel merge sort, sequential merge', 'Θ(n log n)', 'S(n) = S(n/2) + Θ(n) = Θ(n)', 'Θ(log n)'], ['… with a parallel merge', 'Θ(n log n)', 'polylog (e.g. Θ(log³ n))', 'high']]) +
    note('Faster in practice:', 'creating a parallel task for every tiny range costs far more than the work. Use a <b>sequential cut-off</b>: below a threshold (a few thousand elements) compute with a plain loop; split only large ranges. Also avoid data races (no shared mutable state), false sharing.'),
  method: ['Say what the base case returns and how results are combined (+, max) → what it computes.', 'Write the work and span recurrences and solve them.', 'Parallelism = work / span.', 'Improvement: sequential cut-off (+ why).'],
  example: { q: '2019 Q5 parMax: if start == end then a(start) else split at mid, (l, r) = par.parallel(inner(start, mid), inner(mid+1, end)); l max r.', a: 'It computes the <b>maximum</b> of the array. Span: recursion depth ⌈log₂ n⌉ and each level adds O(1) to the critical path → <b>Θ(log n)</b>. Work: one call per array element plus n−1 internal calls, each O(1) → <b>Θ(n)</b>. Parallelism Θ(n / log n). In practice: add a sequential cut-off so small ranges are handled by a loop, which removes most task-creation overhead.' },
  traps: ['Swapping work and span.', 'Giving parallelism as a number of cores.'],
  check: [['T₁ = 10⁶, T∞ = 10³, P = 8: Brent bound?', '10⁶/8 + 10³ = 126 000.'], ['Serial fraction 10 %: maximum speed-up with infinitely many cores?', '1/0.1 = 10.']] },

{ id: 'checklist', slot: 'Night before', title: 'Exam-day checklist (write these from memory)', topic: null,
  intro: 'If you can write all of this on a blank sheet in 20 minutes, you are ready.',
  know: '<ul><li>The cost table (Q1 page) for array, ArrayBuffer, heap, balanced BST, hash set; amortized definition; O(1) queue.</li><li>The sorting facts table with fingerprints; stable/in-place definitions; merge early exit; quicksort fixes.</li><li>BST delete with the <b>left-subtree maximum</b>; AVL definition; the four rotation cases.</li><li>Heap array formulas 2i+1, 2i+2, ⌊(i−1)/2⌋; upheap/downheap.</li><li>Hashing terms; tombstones; linear/quadratic/double probing formulas; rehashing; mod 2ᵏ.</li><li>BFS and DFS pseudo-code; topological order = decreasing finish time; back edge = cycle; SCC definition; Dijkstra pseudo-code and O((n+m) log n); negative-edge counterexample.</li><li>DP: the 5 steps and the 8 recurrences.</li><li>P / NP / NP-hard / NP-complete; certificate + check template; 3 practical approaches.</li><li>Work, span, parallelism, Brent, Amdahl, sequential cut-off.</li></ul>', tpls: [] }
];
})(typeof window !== 'undefined' ? window : globalThis);
