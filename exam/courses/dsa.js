/* CS-A1140 Data Structures and Algorithms — exam Mon 22.2.2027 (moved from 30.11.2026; time and room: check Sisu), pen & paper, 3 h, 60 p.
   Every template follows the fixed 7-slot exam skeleton; all answers are computed by XM.lib.
   The builders (XM.DSA.*) are shared with the past papers in dsa-papers.js. */
(function (G) {
'use strict';
const XM = G.XM, L = XM.lib, h = L.esc;
const D = XM.DSA = {};

/* ---------- part helpers ---------- */
const mc = D.mc = (label, prompt, correct, wrongs, points, why, o) => Object.assign({ type: 'mcq', label, prompt, options: [correct].concat(wrongs), answer: 0, points: points || 1, why }, o || {});
const wr = D.wr = (label, prompt, points, model, rubric, o) => Object.assign({ type: 'written', label, prompt, points, model, rubric }, o || {});
const uniq = a => a.filter((x, i) => a.indexOf(x) === i);
const T_OPTS = ['O(1)', 'Θ(log n)', 'Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(n³)'];
function timeOpts(ans, r, extra) { const pool = uniq(T_OPTS.concat(extra || []).filter(x => x !== ans)); const i = T_OPTS.indexOf(ans);
  const near = i >= 0 ? pool.sort((a, b) => Math.abs(T_OPTS.indexOf(a) - i) - Math.abs(T_OPTS.indexOf(b) - i)) : pool; return near.slice(0, 3); }
D.timeOpts = timeOpts;
const LET = 'abcdefghijk'.split('');

/* ======================= Q1: running times ======================= */
const OPS = [
  ['ArrayBuffer (dynamic array) with n integers', 'get the element at index i', 'O(1)', 'Direct indexing: the address is computed from i.'],
  ['ArrayBuffer (dynamic array) with n integers', 'find the smallest element', 'Θ(n)', 'The array is not sorted, so every element must be looked at.'],
  ['ArrayBuffer (dynamic array) with n integers', 'append an element at the end', 'O(1) amortized', 'Usually O(1); when the array is full it doubles and copies (Θ(n) once), which averages to O(1) per append over any sequence.'],
  ['ArrayBuffer (dynamic array) with n integers', 'insert an element at the beginning', 'Θ(n)', 'All n elements shift one place right.'],
  ['sorted Array with n integers', 'check whether x is in it (binary search)', 'Θ(log n)', 'Binary search halves the range each step.'],
  ['priority queue as a binary max-heap with n integers', 'add a new element', 'Θ(log n)', 'Add at the end and upheap along one leaf-to-root path of length ⌊log₂ n⌋.'],
  ['priority queue as a binary max-heap with n integers', 'find the largest element', 'O(1)', 'The maximum is at the root, index 0.'],
  ['priority queue as a binary max-heap with n integers', 'find the smallest element', 'Θ(n)', 'The minimum is one of the ~n/2 leaves; the heap order says nothing about which, so all must be checked.'],
  ['priority queue as a binary max-heap with n integers', 'remove the largest element', 'Θ(log n)', 'Move the last element to the root and downheap: one root-to-leaf path.'],
  ['set as a balanced BST (AVL / red-black) with n elements', 'add a new element', 'Θ(log n)', 'Height is O(log n); insertion plus at most a constant number of rotations per level.'],
  ['set as a balanced BST (AVL / red-black) with n elements', 'remove an element', 'Θ(log n)', 'One root-to-leaf search plus rebalancing on the way up.'],
  ['set as a balanced BST (AVL / red-black) with n elements', 'find the smallest element', 'Θ(log n)', 'Follow left children from the root: height O(log n).'],
  ['set as a balanced BST (AVL / red-black) with n elements', 'list all elements in order', 'Θ(n)', 'An in-order traversal visits every node once.'],
  ['set as a hash table (chaining, load factor ≤ 1)', 'check membership, average case', 'O(1)', 'With a good hash function, chains have constant expected length.'],
  ['set as a hash table (chaining, load factor ≤ 1)', 'find the smallest element', 'Θ(n)', 'Hashing scatters keys: no order, so scan everything.'],
  ['singly linked List with n elements', 'prepend an element (x :: list)', 'O(1)', 'A new head node points to the old list.'],
  ['singly linked List with n elements', 'access the element at index i (worst case)', 'Θ(n)', 'Must walk i links from the head.']
];
D.buildOps = function (rows, o) {
  o = o || {};
  const parts = rows.map(([ds, op, ans, why], i) => mc(`(${'abcdefghijklmnop'[i]})`, `<b>${h(ds)}</b>: ${h(op)}`, ans, timeOpts(ans, null, ['O(1) amortized']), o.pts || 1, why, { grid: true }));
  return { title: 'Running times of operations', prompt: o.prompt || 'Use O/Θ or precise terms such as "amortized constant time". Give the tightest worst-case bound unless the question says otherwise. (No justification needed in this question type.)',
    parts, solution: ['Learn the cost table as pairs: <b>array</b> = O(1) index, Θ(n) search; <b>heap</b> = O(1) max, Θ(log n) add/remove-max, Θ(n) min; <b>balanced BST</b> = Θ(log n) for everything path-based, Θ(n) to list all.', 'ArrayBuffer append is <b>O(1) amortized</b>, not O(1) worst case: a single append can trigger a Θ(n) copy.'],
    traps: ['Writing O(log n) for min in a max-heap (it is Θ(n)).', 'Writing O(1) for ArrayBuffer append without the word "amortized".', 'Writing O(n log n) for listing a BST in order (in-order traversal is Θ(n)).'] };
};

/* code-analysis snippets for Q1 (2025 style) */
const SNIPS = [
  { id: 'dedup', code: `def f[T](arr: ArrayBuffer[T]): ArrayBuffer[T] =
  val result = ArrayBuffer[T]()
  val seen = ArrayBuffer[T]()
  for e <- arr do
    if !seen.contains(e) then
      seen.append(e)
      result.append(e)
  result`, computes: ['The elements of arr without duplicates, each kept at its first occurrence (original order)', ['arr sorted in increasing order', 'Only the elements that occur exactly once', 'The number of distinct elements']],
    best: ['Θ(n)', 'All elements equal: seen never grows beyond 1 element, so each contains is O(1).'], worst: ['Θ(n²)', 'All distinct: seen grows to i elements and contains scans it, 0 + 1 + … + (n−1) = Θ(n²).'],
    improve: ['Keep <code>seen</code> in a <b>HashSet</b> (keep <code>result</code> as an ArrayBuffer so the order is the same). contains and add are O(1) on average.', [[1.5, 'Replace the linear search with a hash set (or a balanced-tree set)'], [1, 'Keep the result list/order exactly as before']]],
    impWorst: ['Θ(n) on average', 'n hash-set operations of O(1) average each (Θ(n log n) worst case with a balanced-tree set).'] },
  { id: 'hasdup', code: `def g(a: Array[Int]): Boolean =
  var i = 0
  while i < a.length do
    var j = i + 1
    while j < a.length do
      if a(i) == a(j) then return true
      j += 1
    i += 1
  false`, computes: ['Whether some value occurs at least twice in a', ['Whether a is sorted', 'The number of equal pairs', 'Whether all values are equal']],
    best: ['O(1)', 'a(0) == a(1): it returns in the first comparison.'], worst: ['Θ(n²)', 'No duplicates: all n(n−1)/2 pairs are compared.'],
    improve: ['Insert the elements into a <b>HashSet</b> and return true as soon as one is already there (or sort a copy and compare neighbours: Θ(n log n)).', [[1.5, 'Hash set (or sorting + neighbour check)'], [1, 'Returns the same Boolean for every input']]],
    impWorst: ['Θ(n) on average', 'One pass with O(1)-average hash-set operations.'] },
  { id: 'count', code: `def h(a: ArrayBuffer[String]): ArrayBuffer[(String, Int)] =
  val out = ArrayBuffer[(String, Int)]()
  for s <- a do
    if !out.exists(_._1 == s) then
      out.append((s, a.count(_ == s)))
  out`, computes: ['Each distinct string with its number of occurrences, in first-occurrence order', ['The most frequent string', 'Strings that occur once', 'a sorted by frequency']],
    best: ['Θ(n)', 'All strings equal: out has one entry, a.count runs once (Θ(n)) and exists is O(1).'], worst: ['Θ(n²)', 'All distinct: n calls of a.count, each Θ(n).'],
    improve: ['One pass with a <b>HashMap[String, Int]</b> of counts plus an ArrayBuffer remembering the first-occurrence order of the keys.', [[1.5, 'Hash map of counters, one pass'], [1, 'Keeps the first-occurrence order']]],
    impWorst: ['Θ(n) on average', 'n map updates of O(1) average.'] },
  { id: 'remove0', code: `def total(buf: ArrayBuffer[Int]): Long =
  var s = 0L
  while buf.nonEmpty do
    s += buf(0)
    buf.remove(0)
  s`, computes: ['The sum of the elements (and it empties buf)', ['The first element', 'The sum of the first half', 'The maximum']],
    best: ['Θ(n²)', 'Every remove(0) shifts all remaining elements left: (n−1) + (n−2) + … = Θ(n²) whatever the values.'], worst: ['Θ(n²)', 'Same as the best case.'],
    improve: ['Loop over the indices (or remove from the <b>end</b>, which is O(1)), then <code>clear()</code> the buffer once.', [[1.5, 'Avoid removing from the front of an array (index loop / remove last / a queue)'], [1, 'Same sum and buf still ends empty']]],
    impWorst: ['Θ(n)', 'One pass over the elements.'] },
  { id: 'prefix', code: `def p(a: Array[Int]): Array[Long] =
  val out = new Array[Long](a.length)
  for i <- 0 until a.length do
    var s = 0L
    for j <- 0 to i do s += a(j)
    out(i) = s
  out`, computes: ['The prefix sums: out(i) = a(0) + … + a(i)', ['The running maximum', 'a reversed', 'The sum of all elements in every cell']],
    best: ['Θ(n²)', 'The inner loop always runs i + 1 times: 1 + 2 + … + n = Θ(n²).'], worst: ['Θ(n²)', 'Same as the best case.'],
    improve: ['Keep a running sum: <code>s += a(i); out(i) = s</code>.', [[1.5, 'Running sum reused between iterations'], [1, 'Same output array']]],
    impWorst: ['Θ(n)', 'One pass.'] },
  { id: 'inter', code: `def common(a: Array[Int], b: ArrayBuffer[Int]): ArrayBuffer[Int] =
  val out = ArrayBuffer[Int]()
  for x <- a do
    if b.contains(x) then out.append(x)
  out          // let n = a.length, m = b.length`, computes: ['The elements of a that also occur in b, in a\'s order', ['The elements of b not in a', 'The union of a and b', 'Whether a and b are equal']],
    best: ['Θ(n)', 'If every x equals b(0), each contains stops after one comparison.'], worst: ['Θ(n·m)', 'If nothing matches, each contains scans all of b.'],
    improve: ['Put b into a <b>HashSet</b> first (Θ(m)), then test each x in O(1) average.', [[1.5, 'Hash set built from b'], [1, 'Output order and duplicates of a unchanged']]],
    impWorst: ['Θ(n + m) on average', 'Build the set in Θ(m), then n O(1)-average lookups.'] }
];
D.SNIPS = SNIPS;
D.buildCode = function (sn, o) {
  o = o || {}; const tset = ['O(1)', 'Θ(log n)', 'Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(n·m)', 'Θ(n + m)'];
  const opt = ans => { const a = ans.replace(' on average', ''); return uniq(tset.filter(x => x !== a)).slice(0).sort(() => 0).filter((x, i, arr) => i < 6).slice(0, 3); };
  return { title: 'Analyse the code', figure: L.codeNum(sn.code), prompt: 'Denote the length of the input by n. Justify each answer with at most a few sentences.',
    parts: [mc('(i)', 'What does the function compute?', sn.computes[0], sn.computes[1], 2, ''),
      mc('(ii)', 'Best-case running time?', sn.best[0], timeOpts(sn.best[0]), 1.5, sn.best[1]),
      mc('(iii)', 'Worst-case running time?', sn.worst[0], uniq(timeOpts(sn.worst[0].replace('Θ(n·m)', 'Θ(n²)')).concat(['Θ(n·m)'])).filter(x => x !== sn.worst[0]).slice(0, 3), 2, sn.worst[1]),
      wr('(iv)', 'How can you improve the worst-case running time so that it still computes <i>exactly</i> the same result?', 2.5, sn.improve[0], sn.improve[1]),
      mc('(v)', 'Worst-case running time of your improved version?', sn.impWorst[0], ['Θ(n²)', 'Θ(log n)', sn.impWorst[0].includes('n + m') ? 'Θ(n)' : 'Θ(n log n) on average'].filter(x => x !== sn.impWorst[0]), 2, sn.impWorst[1])],
    solution: [`<b>Find the hidden loop.</b> Library calls like <code>contains</code>, <code>count</code>, <code>exists</code>, <code>remove(0)</code> on an ArrayBuffer are linear scans.`, `Best case: ${sn.best[1]}`, `Worst case: ${sn.worst[1]}`, `Fix: ${sn.improve[0]} → ${sn.impWorst[0]}.`],
    traps: ['Saying "O(n)" because there is only one visible loop: library calls inside the loop count too.', 'Forgetting to say the improved bound is <b>average</b> case for hashing.', 'An "improvement" that changes the output (e.g. using a set and losing the original order).'] };
};

/* ArrayBuffer growth: count element copies (numeric) */
D.buildAmortNum = function (c0, factor, n) {
  let cap = c0, copies = 0, resizes = 0; for (let i = 0; i < n; i++) { if (i === cap) { copies += i; resizes++; cap = Math.max(cap + 1, Math.floor(cap * factor)); } }
  return { title: 'Amortized cost of ArrayBuffer appends', prompt: `An ArrayBuffer starts with capacity ${c0}. When an append finds it full, it allocates a new array with ${factor}× the capacity and copies every existing element over. Starting empty, we append <b>n = ${n}</b> elements.`,
    parts: [{ type: 'numeric', label: '(a)', prompt: 'How many resizes happen?', answer: resizes, tol: 0, points: 1 },
      { type: 'numeric', label: '(b)', prompt: 'How many element copies are made in total (by the resizes)?', answer: copies, tol: 0, points: 2 },
      mc('(c)', 'Total cost of the n appends, and per append?', 'Θ(n) total, O(1) amortized per append', ['Θ(n²) total, Θ(n) per append', 'Θ(n log n) total, Θ(log n) per append', 'Θ(n) total, Θ(1) worst case per append'], 1, 'The copies form a geometric series (< ' + factor + '/(' + factor + '−1)·n), so the total is Θ(n).')],
    solution: [`Resizes happen when the size reaches the capacity: capacities ${(() => { let c = c0, s = [c0]; while (c < n) { c = Math.max(c + 1, Math.floor(c * factor)); s.push(c); } return s.join(', '); })()}.`, `Copies = sum of the sizes at each resize = <b>${copies}</b>, fewer than ${factor}/(${factor}−1) · n = ${L.num(factor / (factor - 1) * n, 1)}.`, 'That is why appends are <b>amortized constant time</b>: any sequence of n appends costs O(n) in total.'],
    traps: ['Growing by a constant (+1 or +10) instead of a factor gives Θ(n²) total.', 'Calling it "average-case": amortized is a worst-case guarantee over sequences.'] };
};
D.buildAmortWritten = function () {
  return { title: 'Amortized appends and an O(1) queue', prompt: '(a) A fixed-size Array does not support efficient insertion at the end, but ArrayBuffer supports appends in amortized constant time. Explain how this is done and what "amortized constant time" means (no recurrences needed). (b) Describe a mutable queue where enqueue(e) and dequeue() both take constant time.',
    parts: [wr('(a)', 'ArrayBuffer and amortized constant time', 5, 'The buffer keeps an underlying array with <b>spare capacity</b>. Append writes into the next free slot: O(1). When the array is full, it allocates a new array <b>α times larger (e.g. 2×)</b> and copies the n elements: Θ(n) for that one append. Because the capacity grows geometrically, the copies over n appends total 1 + 2 + 4 + … < 2n, so <b>any sequence of n appends takes O(n) time</b>. "Amortized constant time" means exactly this: the total time of any sequence of m operations is O(m), even though a single operation can be slow. It is <b>not</b> an average over random inputs.',
      [[1.5, 'Spare capacity; append writes into a free slot in O(1)'], [1.5, 'When full: allocate a larger array (constant factor, e.g. 2×) and copy'], [1, 'Copies sum to a geometric series < 2n, so n appends cost O(n)'], [1, 'Definition: any sequence of m operations costs O(m) in total (worst-case over sequences, not probabilistic)']]),
      wr('(b)', 'Constant-time queue', 5, '<b>Circular buffer:</b> an array, a <code>front</code> index and a <code>size</code>. enqueue writes at <code>(front + size) mod capacity</code> and increments size; dequeue reads <code>a(front)</code>, sets <code>front = (front + 1) mod capacity</code>, decrements size. Both O(1) (enqueue amortized O(1) if the array doubles when full). <b>Or a linked list</b> with head and tail pointers: enqueue appends after the tail, dequeue removes the head; both O(1).',
      [[2, 'A concrete structure: circular array with front + size, or linked list with head and tail pointers'], [2, 'Explains enqueue and dequeue without moving other elements'], [1, 'States both are O(1) (amortized if the circular array grows)']])],
    solution: ['Two classic 5-point answers. Name the mechanism (geometric growth / circular indices) and state the cost precisely.'],
    traps: ['A queue in an array where dequeue shifts everything left is Θ(n).', 'A singly linked list with only a head pointer makes enqueue Θ(n).'] };
};

/* ======================= Q2: sorting code ======================= */
const SORTS = {
  selection: { name: 'Selection sort', code: n => `def ${n}(a: Array[Int]) =
  val n = a.length
  var i = 0
  while i < n-1 do
    var bestElement = a(i)
    var bestIndex = i
    var j = i + 1
    while j < n do
      if a(j) < bestElement then
        bestElement = a(j)
        bestIndex = j
      j += 1
    a(bestIndex) = a(i)
    a(i) = bestElement
    i += 1`, worst: ['Θ(n²)', 'The inner loop always scans the rest of the array: (n−1) + (n−2) + … + 1 = n(n−1)/2 comparisons.'], best: ['Θ(n²)', 'Even on sorted input it still scans the whole unsorted part every time: Θ(n²) comparisons (only the swaps drop).'],
    mem: ['Θ(1)', 'Only a few index variables: in place.'], stable: [false, 'No: the long-distance swap a(bestIndex) = a(i) can move an element past an equal one. E.g. [2a, 2b, 1] → [1, 2b, 2a].'], inplace: true,
    practice: ['Why is it not usually used in practice?', 'It always does Θ(n²) comparisons, even on sorted or nearly sorted input, and it is not stable. Insertion sort is as simple and faster on small/nearly sorted arrays; for large arrays Θ(n log n) algorithms (mergesort, quicksort, heapsort) are far faster.', [[1, 'Always Θ(n²), also on (nearly) sorted input'], [0.5, 'Better alternatives: insertion sort for small inputs, n log n sorts for large ones']]] },
  insertion: { name: 'Insertion sort', code: n => `def ${n}(a: Array[Double]): Unit =
  var i = 1
  while i < a.length do
    val element = a(i)
    var j = i
    while j > 0 && element < a(j-1) do
      a(j) = a(j-1)
      j -= 1
    a(j) = element
    i += 1`, worst: ['Θ(n²)', 'Reverse-sorted input: element i shifts i places, 1 + 2 + … + (n−1) = Θ(n²).'], best: ['Θ(n)', 'Already sorted: the inner loop test fails immediately each time, so n−1 comparisons.'],
    mem: ['Θ(1)', 'Only the saved element and indices: in place.'], stable: [true, 'Yes: the strict < means an element never moves past an equal one.'], inplace: true,
    practice: ['In what kind of situations should one use it in practice?', 'For <b>small arrays</b> (low overhead) and <b>nearly sorted</b> data (runs in close to Θ(n), more precisely Θ(n + inversions)). That is why fast library sorts switch to insertion sort for small sub-arrays inside mergesort/quicksort.', [[1, 'Small inputs or nearly sorted inputs'], [0.5, 'Used as the base case inside mergesort/quicksort (or: adaptive, Θ(n + #inversions))']]] },
  merge: { name: 'Merge sort', code: (n, early) => `def ${n}(a: Array[Double]): Unit =
  val aux = new Array[Double](a.length)
  def helper(start: Int, mid: Int, end: Int) =
    ${early === 'active' ? '' : '// '}if a(mid-1) <= a(mid) then return
    var (i, j, d) = (start, mid, start)
    while i < mid && j <= end do
      if a(i) <= a(j) then { aux(d) = a(i); i += 1 }
      else { aux(d) = a(j); j += 1 }
      d += 1
    while i < mid do { aux(d) = a(i); i += 1; d += 1 }
    while j <= end do { aux(d) = a(j); j += 1; d += 1 }
    d = start
    while d <= end do { a(d) = aux(d); d += 1 }
  def inner(start: Int, end: Int): Unit =
    if start < end then
      val mid = start + (end - start) / 2
      inner(start, mid)
      inner(mid + 1, end)
      helper(start, mid + 1, end)
  inner(0, a.length - 1)`, worst: ['Θ(n log n)', 'The recursion halves the range (log n levels) and each level merges n elements in total.'], best: ['Θ(n log n)', 'Without the early exit every merge still copies all elements: Θ(n log n) on every input.'],
    mem: ['Θ(n)', 'The aux array of length n (plus Θ(log n) recursion stack).'], stable: [true, 'Yes: when a(i) == a(j) the left one (a(i), from the first half) is taken first because of <=.'], inplace: false,
    practice: ['Does the worst-case or best-case running time change if the commented line is taken into use? Why?', 'Worst case stays <b>Θ(n log n)</b> (the check can fail in every merge). The best case becomes <b>Θ(n)</b>: on already sorted input every merge returns after one comparison, and the recursion itself makes Θ(n) calls in total.', [[1, 'Worst case unchanged Θ(n log n)'], [1, 'Best case Θ(n) on sorted input'], [0.5, 'Reason: the halves are already in order → helper returns at once; Θ(n) recursive calls']]] },
  quick: { name: 'Quicksort (Lomuto partition)', code: n => `def ${n}(a: Array[Int]): Unit =
  def swap(i: Int, j: Int): Unit =
    val t = a(i); a(i) = a(j); a(j) = t
  def helper(lo: Int, hi: Int): Int =
    val p = a(hi)
    var i = lo - 1
    var j = lo
    while j < hi do
      if a(j) <= p then { i += 1; swap(i, j) }
      j += 1
    swap(i + 1, hi)
    i + 1
  def inner(lo: Int, hi: Int): Unit =
    val q = helper(lo, hi)
    if lo < q - 1 then inner(lo, q - 1)
    if q + 1 < hi then inner(q + 1, hi)
  if a.length >= 2 then inner(0, a.length - 1)`, worst: ['Θ(n²)', 'When the pivot a(hi) is always the largest (or smallest) element, e.g. an <b>already sorted</b> array or all elements equal: partitions of size n−1, n−2, … → Θ(n²).'], best: ['Θ(n log n)', 'Balanced partitions: log n levels of Θ(n) partitioning work.'],
    mem: ['Θ(log n) … Θ(n)', 'In place, but the recursion stack is Θ(log n) for balanced splits and Θ(n) in the worst case.'], stable: [false, 'No: swap(i, j) moves elements over long distances past equal ones.'], inplace: true,
    practice: ['How could the program be improved so its worst case becomes smaller or very unlikely?', 'Choose the pivot <b>randomly</b> (swap a random element to a(hi) first) or by <b>median-of-three</b>, so the Θ(n²) case is very unlikely; handle many <b>equal elements</b> with a three-way partition; switch to insertion sort for small ranges (or introsort: switch to heapsort if recursion gets too deep, giving O(n log n) worst case).', [[1, 'Random or median-of-three pivot'], [0.5, 'Three-way partition for equal keys, or introsort / insertion sort for small parts']]] },
  heap: { name: 'Heapsort', code: n => `def ${n}(a: Array[Int]): Unit =
  def down(i0: Int, n: Int): Unit =
    var i = i0
    var go = true
    while go do
      val l = 2 * i + 1
      val r = l + 1
      var b = i
      if l < n && a(l) > a(b) then b = l
      if r < n && a(r) > a(b) then b = r
      if b == i then go = false
      else { val t = a(i); a(i) = a(b); a(b) = t; i = b }
  var i = a.length / 2 - 1
  while i >= 0 do { down(i, a.length); i -= 1 }
  var end = a.length - 1
  while end > 0 do
    val t = a(0); a(0) = a(end); a(end) = t
    down(0, end)
    end -= 1`, worst: ['Θ(n log n)', 'Building the heap is O(n); then n−1 remove-max steps each downheap O(log n).'], best: ['Θ(n log n)', 'For distinct keys the downheaps still take Θ(log n) on average, so Θ(n log n).'],
    mem: ['Θ(1)', 'The heap lives inside the array itself.'], stable: [false, 'No: swapping the root to the end moves elements past equal ones.'], inplace: true,
    practice: ['When would you choose it?', 'When you need a guaranteed O(n log n) worst case with O(1) extra memory (e.g. introsort\'s fallback); in practice it is often slower than quicksort because of poor cache behaviour.', [[1, 'Guaranteed n log n worst case with constant extra memory'], [0.5, 'Usually slower than quicksort in practice (cache), not stable']]] },
  radix: { name: 'Radix sort (LSD)', code: n => `def ${n}(a: Array[Int]): Unit =     // non-negative ints
  val n = a.length
  val aux = new Array[Int](n)
  val count = new Array[Int](256)
  var shift = 0
  while shift < 32 do
    java.util.Arrays.fill(count, 0)
    for x <- a do count((x >> shift) & 0xff) += 1
    var i = 1
    while i < 256 do { count(i) += count(i - 1); i += 1 }
    var k = n - 1
    while k >= 0 do
      val b = (a(k) >> shift) & 0xff
      count(b) -= 1
      aux(count(b)) = a(k)
      k -= 1
    Array.copy(aux, 0, a, 0, n)
    shift += 8`, worst: ['Θ(n)', '4 passes (32 bits, 8 bits at a time), each Θ(n + 256): Θ(n) for fixed-width keys.'], best: ['Θ(n)', 'Same 4 passes on every input.'],
    mem: ['Θ(n)', 'The aux array (plus the constant-size count array).'], stable: [true, 'Yes: each counting-sort pass walks k from the end and fills each bucket from its end, so equal keys keep their order. LSD radix sort depends on this.'], inplace: false,
    practice: ['Why can it beat the Ω(n log n) lower bound?', 'It is not a comparison sort: it looks at the bits (digits) of the keys directly. The Ω(n log n) bound only applies to algorithms that learn about the order through comparisons.', [[1, 'Not comparison-based: uses digits/bits of the keys'], [0.5, 'The lower bound holds only for comparison sorts']]] }
};
D.SORTS = SORTS;
const SORT_NAMES = ['Selection sort', 'Insertion sort', 'Merge sort', 'Quicksort (Lomuto partition)', 'Heapsort', 'Radix sort (LSD)', 'Bubble sort'];
const STABLE_DEF = () => wr('(i)', 'Define the concept of a <i>stable</i> sorting algorithm.', 1.5, 'A sorting algorithm is <b>stable</b> if elements with <b>equal keys</b> appear in the output in the <b>same relative order</b> as in the input. (Matters when sorting records by one key after another.)', [[1, 'Equal keys keep their original relative order'], [0.5, 'Precise wording (or an example)']]);
const INPLACE_DEF = () => wr('(i′)', 'Define a sorting algorithm that works <i>in place</i>.', 1, 'It uses only <b>O(1) (or at most O(log n)) extra memory</b> besides the input array: elements are rearranged inside the array itself.', [[1, 'Only constant (or small, e.g. O(log n)) extra memory beyond the array']]);
D.buildSort = function (alg, o) {
  o = o || {}; const S = SORTS[alg], fname = o.fname || 'sort';
  const memOpts = ['Θ(1)', 'Θ(log n) … Θ(n)', 'Θ(n)', 'Θ(n log n)', 'Θ(n²)'];
  const parts = [STABLE_DEF()];
  if (o.inplaceDef) parts.push(INPLACE_DEF());
  parts.push(mc('(ii)', 'Which well-known sorting algorithm does the program implement?', S.name, o.r ? o.r.sample(SORT_NAMES.filter(x => x !== S.name), 3) : SORT_NAMES.filter(x => x !== S.name).slice(0, 3), 2, ''),
    mc('(iii)', 'Is the algorithm stable?', S.stable[0] ? 'Yes' : 'No', [S.stable[0] ? 'No' : 'Yes'], 1.5, S.stable[1]),
    mc('(iv)', 'Worst-case running time?', S.worst[0], timeOpts(S.worst[0]), 1.5, S.worst[1]),
    mc('(v)', 'Best-case running time?', S.best[0], timeOpts(S.best[0]), 1.5, S.best[1]),
    mc('(vi)', 'How much extra memory does it use?', S.mem[0], memOpts.filter(x => x !== S.mem[0]).slice(0, 3), 1, S.mem[1]));
  if (o.inplaceQ) parts.push(mc('(vi′)', 'Does it work in place?', S.inplace ? 'Yes' : 'No', [S.inplace ? 'No' : 'Yes'], 1, S.mem[1]));
  const P = S.practice; parts.push(wr('(vii)', P[0], 1.5, P[1], P[2]));
  return { title: 'Identify and analyse the sort', figure: L.codeNum(S.code(fname, o.early)), prompt: 'Consider the Scala program. Denote the length of the array a by n. Justify answers (iii)–(vii) with at most a few sentences each.', parts,
    solution: [`<b>Spot the pattern:</b> ${alg === 'selection' ? 'find the minimum of a(i..n−1), then swap it to position i' : alg === 'insertion' ? 'take a(i) and shift larger elements right until its place is found' : alg === 'merge' ? 'split at mid, recurse on both halves, merge via aux' : alg === 'quick' ? 'pivot p = a(hi); elements ≤ p are swapped left; recurse on both sides of q' : alg === 'heap' ? 'children 2i+1/2i+2 and a "down" loop → a heap; swap the root to the end' : 'counts per byte, prefix sums, fill aux backwards → counting sort per digit'} → <b>${S.name}</b>.`,
      `Worst case ${S.worst[0]}: ${S.worst[1]}`, `Best case ${S.best[0]}: ${S.best[1]}`, `Memory ${S.mem[0]}: ${S.mem[1]}`, `Stable? ${S.stable[1]}`],
    traps: ['Not justifying: the questions say "justify", and a bare Θ(…) gets partial marks.', 'Mixing up selection (always Θ(n²)) and insertion (Θ(n) best case).', alg === 'merge' ? 'Forgetting that with the early-exit line the best case drops to Θ(n), but the worst case stays Θ(n log n).' : 'Saying "in place" means no memory at all: recursion stacks count (quicksort Θ(log n) … Θ(n)).'] };
};
/* trace of a sort on a small array (table) */
D.buildTrace = function (alg, arr) {
  let rows, title, prompt, extra = [];
  if (alg === 'insertion') { rows = L.trace.insertion(arr).map((a, k) => ({ label: `after i = ${k + 1}`, a })); prompt = 'Run the insertion sort above (outer index i = 1, 2, …). Fill in the array after each outer iteration.'; }
  else if (alg === 'selection') { rows = L.trace.selection(arr).map((a, k) => ({ label: `after i = ${k}`, a })); prompt = 'Run selection sort (each round finds the minimum of a(i..n−1) and swaps it to i). Fill in the array after each round.'; }
  else if (alg === 'merge') { rows = L.trace.merges(arr).map(m => ({ label: `merge a(${m.s}..${m.e})`, a: m.arr })); prompt = 'Run the top-down merge sort (mid = start + (end − start)/2, left half first). Fill in the array after each merge, in the order the recursion performs them.'; }
  else if (alg === 'radix') { rows = L.trace.lsd(arr).map((a, k) => ({ label: `after digit ${k + 1}` + (k === 0 ? ' (ones)' : k === 1 ? ' (tens)' : ' (hundreds)'), a })); prompt = 'Run LSD radix sort in base 10 (a stable bucket pass per digit, ones digit first). Fill in the array after each pass.'; }
  else { const r = L.trace.lomuto(arr); rows = [{ label: 'after partition', a: r.arr }]; prompt = 'Run <b>one</b> Lomuto partition on the whole array (pivot p = a(hi), i starts at lo − 1, elements ≤ p are swapped to the left, finally swap(i + 1, hi)). Fill in the array after the partition.';
    extra.push({ type: 'numeric', label: '(b)', prompt: 'At which index q does the pivot end up?', answer: r.q, tol: 0, points: 1 }); }
  const N = { insertion: 'Insertion sort', selection: 'Selection sort', merge: 'Merge sort', radix: 'LSD radix sort', quick: 'Quicksort (Lomuto partition)' }[alg];
  return { title: `Trace: ${N}`, figure: L.drawArray(arr), prompt: `Input array a = [${arr.join(', ')}] (indices below the cells).`,
    parts: [{ type: 'table', label: '(a)', prompt, points: Math.min(4, rows.length), cols: arr.map((_, i) => String(i)), corner: 'step', rows: rows.map(rw => ({ label: rw.label, cells: rw.a.map(x => ({ a: String(x), num: true, tol: 0 })) })) }].concat(extra),
    solution: rows.map(rw => `${rw.label}: [${rw.a.join(', ')}]`), traps: ['Doing the merges breadth-first instead of in recursion order (left half completely first).', 'In Lomuto, forgetting the final swap of the pivot into place.'] };
};

/* ======================= Q3: trees, heaps, hashing ======================= */
function treeOpts(correct, wrongs, r) {
  const seen = new Set([L.treeStr(correct)]), W = [];
  const rotR = n => n && n[1] ? [n[1][0], n[1][1], [n[0], n[1][2], n[2]]] : null, rotL = n => n && n[2] ? [n[2][0], [n[0], n[1], n[2][1]], n[2][2]] : null;
  const fb = [rotR(correct), rotL(correct), correct && correct[1] ? [correct[0], rotL(correct[1]) || rotR(correct[1]), correct[2]] : null, correct && correct[2] ? [correct[0], correct[1], rotR(correct[2]) || rotL(correct[2])] : null];
  wrongs.concat(fb).forEach(t => { if (t && !seen.has(L.treeStr(t))) { seen.add(L.treeStr(t)); W.push(t); } });
  return { opts: [L.drawTree(correct)].concat(W.slice(0, 3).map(t => L.drawTree(t))), n: W.length };
}
/* plausible wrong results of BST operations */
function bstWrongs(t, op, k) {
  const out = [], find = x => (function f(n) { return !n ? null : x < n[0] ? f(n[1]) : x > n[0] ? f(n[2]) : n; })(t);
  const replaceAt = (n, key, sub) => !n ? null : n[0] === key ? sub : key < n[0] ? [n[0], replaceAt(n[1], key, sub), n[2]] : [n[0], n[1], replaceAt(n[2], key, sub)];
  const hangRight = (n, sub) => n[2] ? [n[0], n[1], hangRight(n[2], sub)] : [n[0], n[1], sub];
  const hangLeft = (n, sub) => n[1] ? [n[0], hangLeft(n[1], sub), n[2]] : [n[0], sub, n[2]];
  if (op === 'del') {
    const node = find(k);
    out.push(L.bstDelete(t, k, 'succ'));                                   // successor instead of predecessor
    if (node && node[1] && node[2]) {
      out.push(replaceAt(t, k, hangRight(node[1], node[2])));              // left child moves up, right subtree hung under it
      out.push(replaceAt(t, k, [L.treeMax(node[1]), node[1], node[2]]));   // predecessor copied but not removed
      out.push(replaceAt(t, k, hangLeft(node[2], node[1])));               // right child moves up
    } else if (node) { out.push(replaceAt(t, k, null)); }                  // whole subtree dropped
  } else {
    out.push(L.avlInsert(t, k).tree);                                       // rebalanced (not asked for)
    out.push(k < t[0] && t[2] ? [t[0], t[1], hangLeft(t[2], [k, null, null])] : t[1] ? [t[0], hangRight(t[1], [k, null, null]), t[2]] : [t[0], [k, null, null], t[2]]); // wrong subtree
    out.push([k, t[1], [t[0], null, t[2]]]);                                // new key at the root
  }
  return out;
}
D.buildBST = function (t, ops, o) {
  o = o || {}; const parts = []; let cur = t; const sol = [];
  ops.forEach(([op, k], i) => {
    const next = op === 'ins' ? L.bstInsert(cur, k) : L.bstDelete(cur, k);
    const T = treeOpts(next, bstWrongs(cur, op, k), o.r);
    const node = op === 'del' ? (function f(n) { return !n ? null : k < n[0] ? f(n[1]) : k > n[0] ? f(n[2]) : n; })(cur) : null;
    const two = node && node[1] && node[2];
    parts.push({ type: 'mcq', label: `(${ORD[i]})`, prompt: `${op === 'ins' ? 'Insert' : 'Remove'} the key <b>${k}</b>${i ? ' (into the tree from the previous step)' : ''}, the way the course material does it. Which tree results?`, options: T.opts, answer: 0, points: o.opPts || 1.5, wide: true,
      why: op === 'ins' ? `Walk down from the root comparing ${k}: go left if smaller, right if larger, and add it as a new leaf.` : two ? `${k} has two children: replace it with the <b>largest key in its left subtree</b> (${L.treeMax(node[1])}), then remove that node (it has no right child, so its left child moves up).` : `${k} has ${node && (node[1] || node[2]) ? 'one child, which takes its place' : 'no children: just remove it'}.` });
    sol.push(`${op === 'ins' ? 'insert' : 'remove'} ${k} → ${h(L.treeStr(next))}`); cur = next;
  });
  if (o.avlQ) {
    const isA = L.isAVL(t), bad = L.imbalanced(t);
    parts.push(wr('(' + ['i', 'ii', 'iii', 'iv', 'v', 'vi'][ops.length] + ')', 'Define what is required of a binary search tree so that it is an AVL tree.', 1, 'For <b>every node</b>, the heights of its left and right subtrees differ by <b>at most 1</b> (the empty tree has height 0 or −1, consistently).', [[1, 'Height difference ≤ 1 at every node (not just the root)']]));
    parts.push(mc('', `Is the <b>original</b> tree ${o.name || 'A'} an AVL tree?`, isA ? 'Yes: every node is balanced' : `No: node ${bad[bad.length - 1]} has subtree heights that differ by 2 or more`, isA ? [`No: node ${L.inorder(t)[0]} is unbalanced`, 'No: the root has two children of different heights', 'Only if it is also complete'] : ['Yes: every node is balanced', 'Yes: the root\'s subtrees differ by at most 1, and that is enough', `No: node ${t[0]} is unbalanced`].filter(x => !x.includes('node ' + bad[bad.length - 1])), 1, isA ? 'Check every node: all balance factors are −1, 0 or 1.' : `At ${bad.join(', ')}: compare the heights of the left and right subtrees.`));
  }
  if (o.inorderQ) parts.push({ type: 'order', label: '', prompt: `List the keys of the <b>final</b> tree in the order an in-order traversal visits them.`, items: L.inorder(cur).map(String), answer: L.inorder(cur).map(String), points: 1, why: 'In-order = left subtree, node, right subtree: ascending order for a BST. Θ(n) time (independent of the height h).' });
  return { title: 'Binary search tree operations', figure: L.drawTree(t, { label: 'tree ' + (o.name || 'A') }), prompt: o.prompt || 'Perform the operations in the given order, each on the result of the previous one.', parts,
    solution: sol.concat(['Course convention: a node with two children is replaced by the <b>largest key in its left subtree</b> (the in-order predecessor).']), traps: ['Using the successor (smallest in the right subtree): the course material uses the predecessor, and the grader expects that tree.', 'Forgetting to reattach the predecessor\'s left child.', 'Doing the operations on the original tree instead of the previous result.'] };
};
D.buildAVL = function (t, k, o) {
  o = o || {}; const res = L.avlInsert(t, k), plain = L.bstInsert(t, k);
  const rots = ['single right rotation', 'single left rotation', 'double rotation (left-right)', 'double rotation (right-left)', 'no rotation is needed'];
  const ans = res.rot || 'no rotation is needed';
  const wrongTrees = [plain]; // other rotation candidates: rotate at the root, or the other single rotation at the unbalanced node
  const rotR = n => n && n[1] ? [n[1][0], n[1][1], [n[0], n[1][2], n[2]]] : n, rotL = n => n && n[2] ? [n[2][0], [n[0], n[1], n[2][1]], n[2][2]] : n;
  const at = (n, key, f) => !n ? null : n[0] === key ? f(n) : key < n[0] ? [n[0], at(n[1], key, f), n[2]] : [n[0], n[1], at(n[2], key, f)];
  if (res.at !== null) { wrongTrees.push(at(plain, res.at, /right/.test(ans) && /single/.test(ans) ? rotL : rotR)); wrongTrees.push(at(plain, res.at, /left-right/.test(ans) ? rotR : /right-left/.test(ans) ? rotL : n => n)); }
  wrongTrees.push(rotR(plain), rotL(plain));
  const TO = treeOpts(res.tree, wrongTrees);
  const parts = [];
  if (o.def) parts.push(wr('(i)', 'Define the AVL property.', 1, 'For every node the heights of the left and right subtree differ by at most 1.', [[1, 'Height difference ≤ 1 at every node']]));
  parts.push(mc('(a)', `Insert <b>${k}</b> into the AVL tree. What does the course algorithm do?`, ans === 'no rotation is needed' ? ans : `${ans} at node ${res.at}`, ans === 'no rotation is needed' ? ['single right rotation at the root', 'single left rotation at the root', 'double rotation (left-right) at the root'] : rots.filter(x => x !== ans && x !== 'no rotation is needed').slice(0, 2).map(x => `${x} at node ${res.at}`).concat([`${ans} at node ${t[0] === res.at ? L.inorder(t)[0] : t[0]}`]), 1.5,
    res.at !== null ? `After inserting ${k} as a leaf, walk back up: the first node whose subtrees differ in height by 2 is <b>${res.at}</b>. ${/double/.test(ans) ? 'The new key went into the <i>inner</i> grandchild subtree (a zig-zag), so one single rotation is not enough: rotate the child first, then the node.' : 'The new key is in the <i>outer</i> subtree (straight line), so one single rotation fixes it.'}` : 'All balance factors stay in −1…1 after the insertion.'));
  parts.push({ type: 'mcq', label: '(b)', prompt: 'Which AVL tree results?', options: TO.opts, answer: 0, points: 2, wide: true, why: `Result: ${h(L.treeStr(res.tree))}` });
  if (o.why) parts.push(wr('(c)', 'Why use AVL or red-black trees instead of unrestricted binary search trees for ordered sets and maps?', 1, 'An unrestricted BST can become a path (e.g. inserting sorted keys), height Θ(n), so operations take Θ(n). Balanced trees keep the height <b>O(log n)</b>, so search, insert, delete, min/max are all <b>O(log n)</b> in the worst case.', [[0.5, 'Plain BST can degenerate to height Θ(n)'], [0.5, 'Balanced: height O(log n) → all operations O(log n) worst case']]));
  return { title: 'AVL insertion', figure: L.drawTree(t, { label: o.name ? 'AVL tree ' + o.name : 'AVL tree' }), prompt: o.prompt || '', parts,
    solution: [`Insert ${k} as in a BST: ${h(L.treeStr(plain))}.`, res.at !== null ? `Go up from the new leaf. Node <b>${res.at}</b> is the first with height difference 2 → ${ans}.` : 'No node becomes unbalanced.', `Result: ${h(L.treeStr(res.tree))}.`, 'Explain <i>why</i> in the exam: name the unbalanced node, the case (outer → single, inner → double) and the direction.'],
    traps: ['Rotating at the root instead of the lowest unbalanced node.', 'Using a single rotation for a zig-zag (left-right / right-left) case.', 'Not explaining the transformation: the question asks "what kind of transformations and why".'] };
};
D.randAVL = function (r, k0) { const keys = r.sample(L.range(2, 60), k0); let t = null; keys.forEach(k => { t = L.avlInsert(t, k).tree; }); return t; };
D.buildHeap = function (A, x, o) {
  o = o || {}; const ins = L.heapInsert(A, x), rem = L.heapRemoveMax(ins.arr);
  const parts = [];
  if (o.defs) parts.push(wr('(i)', 'Define the properties a binary tree must satisfy to be a binary max-heap.', 1.5, '<b>Shape:</b> the tree is <b>complete</b> — all levels full except possibly the last, which is filled from the left. <b>Heap order:</b> every node\'s key is ≥ the keys of its children (so the maximum is at the root).', [[0.75, 'Shape: complete binary tree, last level filled from the left'], [0.75, 'Order: parent ≥ children']]));
  if (o.checks) o.checks.forEach((c, i) => parts.push(mc(`(ii-${'ab'[i]})`, `Is tree (${'ab'[i]}) a binary max-heap?`, c.ans, ['Yes, both properties hold', 'No: heap order is violated', 'No: the shape is not complete'].filter(x => x !== c.ans), 1, c.why)));
  parts.push({ type: 'table', label: '(iii)', prompt: 'Store the max-heap in an array (0-based, level by level, left to right).', points: 1.5, cols: A.map((_, i) => String(i)), rows: [{ label: 'a', cells: A.map(v => ({ a: String(v), num: true, tol: 0 })) }] });
  parts.push({ type: 'table', label: '(iv)', prompt: `Insert <b>${x}</b>. Give the array after the insertion is complete.`, points: 2, cols: ins.arr.map((_, i) => String(i)), rows: [{ label: 'a', cells: ins.arr.map(v => ({ a: String(v), num: true, tol: 0 })) }],
    hint: 'Add at the end, then upheap: swap with the parent ⌊(i−1)/2⌋ while it is smaller.' });
  parts.push({ type: 'numeric', label: '', prompt: 'How many swaps did the upheap make?', answer: ins.swaps.length, tol: 0, points: .5 });
  parts.push({ type: 'table', label: '(v)', prompt: 'Then remove the element with the highest priority. Give the array afterwards.', points: 2, cols: rem.arr.map((_, i) => String(i)), rows: [{ label: 'a', cells: rem.arr.map(v => ({ a: String(v), num: true, tol: 0 })) }],
    hint: 'Move the last element to index 0, then downheap: swap with the larger child while that child is larger.' });
  return { title: 'Binary max-heap', figure: (o.figs || '') + `<figure>${L.drawTree(L.heapTree(A))}<figcaption>max-heap ${o.name || ''}</figcaption></figure>`, prompt: o.prompt || 'Elements are integers, priority order is ≤. Use the course\'s 0-based array layout: children of i at 2i+1 and 2i+2, parent at ⌊(i−1)/2⌋.', parts,
    solution: [`Array: [${A.join(', ')}].`, `Insert ${x}: append at index ${A.length}, then ${ins.swaps.length ? ins.swaps.map(([a, b]) => `swap ${a}↔${b}`).join(', ') : 'no swaps'} → [${ins.arr.join(', ')}].`, `Remove max ${rem.max}: move ${ins.arr[ins.arr.length - 1]} to the root, then ${rem.swaps.length ? rem.swaps.map(([a, b]) => `swap ${a}↔${b}`).join(', ') : 'no swaps'} → [${rem.arr.join(', ')}].`],
    traps: ['Using 1-based indices (children 2i, 2i+1): the course uses 0-based.', 'In downheap, swapping with the left child when the right child is larger.', 'Inserting at the root instead of at the end.'] };
};
const ORD = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
function hashTheory(which) {
  const W = {
    coll: wr('', 'What do <i>collision</i> and <i>load factor</i> mean?', 1.5, '<b>Collision:</b> two different keys hash to the same slot, h(k₁) = h(k₂). <b>Load factor</b> α = n / m: the number of stored keys divided by the number of slots.', [[0.75, 'Collision: different keys, same hash slot'], [0.75, 'Load factor α = n/m']]),
    rehash: wr('', 'What does <i>rehashing</i> mean, and when/why should one perform it?', 1.5, 'When the load factor exceeds a threshold (e.g. α > 1 for chaining, α > ½ … ¾ for open addressing), allocate a <b>larger table</b> (typically ~2×) and <b>re-insert every key</b> with the new hash function, because each key\'s slot depends on m. This keeps chains/probe sequences short, so operations stay O(1) on average; the copying is amortized like ArrayBuffer doubling.', [[0.5, 'Grow the table and reinsert all keys (indices change with m)'], [0.5, 'When the load factor passes a threshold'], [0.5, 'Why: keep expected O(1) operations; amortized cost stays O(1)']]),
    suha: wr('', 'Explain the <i>simple uniform hashing assumption</i>.', 1, 'Each key is equally likely to hash to any of the m slots, independently of where the other keys hash. Under it, the expected chain length is α.', [[0.5, 'Every slot equally likely, independently of other keys'], [0.5, 'Consequence: expected chain length / search cost O(1 + α)']]),
    const: wr('', 'What is required so that inserting new keys takes constant time on average?', 1, 'A good hash function (keys spread evenly, roughly simple uniform hashing) and a <b>bounded load factor</b> (rehash into a bigger table when α grows); then expected chain length is O(1), and the rehash cost is amortized O(1).', [[0.5, 'Good hash function spreading keys uniformly'], [0.5, 'Load factor kept bounded by rehashing (amortized)']]),
    pow2: wr('', 'Why may h(x) = x mod m be a bad choice when m = 2ᵏ?', 1.5, 'x mod 2ᵏ is just the <b>k lowest bits</b> of x. All higher bits are ignored, so keys that differ only in high bits (e.g. all multiples of 2ᵏ, or even numbers, or aligned addresses) collide into few slots. A prime m (or a hash that mixes all bits) avoids this.', [[0.75, 'It only uses the k lowest bits'], [0.75, 'Keys with equal low bits (common patterns, e.g. multiples of 2ᵏ) all collide']]),
    probe: wr('', 'Define a <i>probe sequence</i>. What properties should it have?', 1.5, 'For key k, the probe sequence h(k,0), h(k,1), …, h(k,m−1) is the order in which slots are tried. It should be a <b>permutation of all m slots</b> (so an empty slot is always found if one exists) and different keys should get <b>different</b> sequences (to avoid clustering).', [[0.5, 'Order of slots tried for a key'], [0.5, 'Visits every slot (a permutation of 0…m−1)'], [0.5, 'Spreads different keys to different sequences (little clustering)']]),
    linear: wr('', 'How does <i>linear probing</i> work, and what happens on removal?', 1.5, 'h(k, i) = (h(k) + i) mod m: try the home slot, then the next ones in order (wrapping around). Search stops at an empty slot. On removal, put a <b>tombstone</b> ("del") in the slot instead of emptying it — otherwise searches for keys further along the sequence would stop too early. Inserts may reuse tombstones.', [[0.5, 'Try h(k), h(k)+1, … mod m'], [0.5, 'Search stops at an empty slot'], [0.5, 'Removal leaves a tombstone, not an empty slot']])
  };
  return which.map(w => W[w]);
}
D.buildHashChain = function (m, ops, o) {
  o = o || {}; const steps = L.hashChain(m, ops);
  const rows = steps.map(s => ({ label: (s.op === 'ins' ? 'insert ' : 'remove ') + s.k, cells: s.table.map(l => ({ a: l.join(' '), set: true, num: false, w: 5 })) }));
  const parts = [{ type: 'table', label: '(i)', prompt: 'Give the content of every slot after each step (write a chain as e.g. <code>11 6</code>; leave empty slots blank). The order inside a chain is not graded.', points: o.tablePts || 4, cols: L.range(0, m).map(String), corner: 'step', rows }];
  hashTheory(o.theory || ['coll', 'rehash']).forEach((p, i) => { p.label = '(' + ORD[i + 1] + ')'; parts.push(p); });
  if (o.alpha) parts.push({ type: 'numeric', label: '', prompt: 'Load factor α at the end?', answer: L.sum(steps[steps.length - 1].table.map(l => l.length)) / m, rtol: .01, points: .5, show: L.num(L.sum(steps[steps.length - 1].table.map(l => l.length)) / m, 3) });
  return { title: 'Hash table with chaining', prompt: `A hash table stores a set of 32-bit integers. Table size <b>m = ${m}</b>, hash function <b>h(x) = x mod m</b>, collisions resolved by <b>chaining</b> (each slot is a list). First insert ${ops.filter(x => x[0] === 'ins').map(x => x[1]).join(', ')} (in this order), then ${ops.filter(x => x[0] === 'del').map(x => 'remove ' + x[1]).join(', ')}.`,
    parts, solution: steps.map(s => `${s.op === 'ins' ? 'insert' : 'remove'} ${s.k}: ${s.k} mod ${m} = ${s.slot} → ${s.table.map((l, i) => i + ':[' + l.join(' ') + ']').join(' ')}`),
    traps: ['Drawing only the final table: the question asks for the content after <b>each</b> step.', 'Computing mod wrongly for numbers larger than m (16 mod 5 = 1).'] };
};
D.buildHashOpen = function (m, ops, o) {
  o = o || {}; const kind = o.kind || 'linear';
  const probe = kind === 'linear' ? L.probeFns.linear(m) : kind === 'quadratic' ? L.probeFns.quadratic(m) : L.probeFns.double(m, o.h2);
  const steps = L.hashOpen(m, ops, probe);
  const rows = steps.map(s => ({ label: (s.op === 'ins' ? 'insert ' : 'remove ') + s.k, cells: s.table.map(v => ({ a: v === null ? '' : String(v), num: false, w: 3 })) }));
  const parts = [{ type: 'table', label: '(i)', prompt: 'Give the table after each step. Leave empty slots blank and write <code>del</code> for a tombstone.', points: o.tablePts || 4, cols: L.range(0, m).map(String), corner: 'step', rows }];
  if (o.searchKey !== undefined) { const st = L.hashOpen(m, ops.concat([['del', o.searchKey]]), probe); const pr = st[st.length - 1].probes.map(String);
    parts.push({ type: 'order', label: '', prompt: `Afterwards we search for <b>${o.searchKey}</b>. List the slots the search probes, in order.`, items: uniq(pr.concat(L.range(0, m).map(String))).slice(0, Math.min(m, pr.length + 3)), answer: pr, points: 1, why: 'The search follows the probe sequence and passes over tombstones; it stops at the key or at an empty slot.' }); }
  hashTheory(o.theory || ['coll', 'rehash', 'pow2']).forEach((p, i) => { p.label = '(' + ORD[i + 1] + ')'; parts.push(p); });
  const pdesc = kind === 'linear' ? 'linear probing h(x, i) = (h(x) + i) mod m' : kind === 'quadratic' ? 'quadratic probing h(x, i) = (h(x) + i(i+1)/2) mod m' : `double hashing h(x, i) = (h(x) + i·h₂(x)) mod m with h₂(x) = ${o.h2desc}`;
  return { title: 'Open addressing' + (kind === 'linear' ? ': linear probing' : kind === 'quadratic' ? ': quadratic probing' : ': double hashing'), prompt: `Table size <b>m = ${m}</b>, h(x) = x mod m, open addressing with <b>${pdesc}</b>. Do the operations in this order: ${ops.map(([op, k]) => (op === 'ins' ? 'insert ' : 'remove ') + k).join(', ')}.`,
    parts, solution: steps.map(s => `${s.op === 'ins' ? 'insert' : 'remove'} ${s.k}: probes ${s.probes.join(' → ')} → ${s.op === 'ins' ? 'placed in slot ' + s.slot : s.slot >= 0 ? 'slot ' + s.slot + ' becomes del' : 'not found'}`).concat(['Removal leaves a <b>tombstone</b>; an insert may reuse the first tombstone on its probe sequence (after checking the key is not already further along).']),
    traps: ['Emptying the slot on removal: later searches would stop too early. Use a tombstone.', 'Forgetting to wrap around (mod m) at the end of the table.', 'Inserting a key twice: a set stores each key once.'] };
};

/* ======================= Q4: graphs ======================= */
const GRID = n => { const P = {}; LET.slice(0, n).forEach((v, i) => { P[v] = [40 + (i % 3) * 120, 34 + Math.floor(i / 3) * 86]; }); return P; };
D.GRID = GRID;
D.randGraph = function (r, o) {
  o = o || {}; const n = o.n || 9, V = LET.slice(0, n), P = GRID(n);
  for (let tries = 0; tries < 200; tries++) {
    const cand = []; V.forEach((u, i) => V.forEach((v, j) => { if (j <= i) return; const dc = Math.abs(i % 3 - j % 3), dr = Math.abs(Math.floor(i / 3) - Math.floor(j / 3)); if (dc <= 1 && dr <= 1) cand.push([u, v, dc && dr]); }));
    const diagUsed = {}; let C = r.shuffle(cand).filter(([u, v, diag]) => { if (!diag) return true; const key = [Math.min(V.indexOf(u) % 3, V.indexOf(v) % 3), Math.min(Math.floor(V.indexOf(u) / 3), Math.floor(V.indexOf(v) / 3))].join(); if (diagUsed[key] || !r.chance(.5)) return false; diagUsed[key] = 1; return true; });
    C = C.slice(0, Math.round(n * (o.density || 1.35)));
    const perm = ['a'].concat(r.shuffle(V.slice(1)));
    const E = C.map(([u, v]) => { let w = o.weighted ? r.int(o.wmin || 1, o.wmax || 9) : undefined;
      if (o.dag) return perm.indexOf(u) < perm.indexOf(v) ? [u, v, w] : [v, u, w]; return r.chance(.5) ? [u, v, w] : [v, u, w]; });
    if (o.weighted && o.addBack) { /* pass */ }
    const reach = L.bfs(V, E, 'a').order.length;
    if (reach < (o.minReach || n - 2)) continue;
    if (o.cyclic && !L.hasCycle(V, E)) continue;
    if (o.check && !o.check(V, E)) continue;
    return { V, E, P };
  }
  throw new Error('graph generation failed');
};
const adjTable = (V, E) => ({ type: 'table', label: '', prompt: 'Give the adjacency-list representation (the out-neighbours of each vertex; leave blank if none).', points: 2, cols: ['out-neighbours'], rows: V.map(v => ({ label: v, cells: [{ a: E.filter(e => e[0] === v).map(e => e[1]).sort().join(' '), set: true, num: false, w: 7 }] })) });
const predTable = (V, pred, pts) => ({ type: 'table', label: '', prompt: 'Give the predecessor of each vertex in the search tree (blank for the source and for unreached vertices).', points: pts || 2, cols: V, rows: [{ label: 'pred', cells: V.map(v => ({ a: pred[v] || '', num: false, w: 2.4 })) }] });
D.buildDFS = function (g, o) {
  o = o || {}; const { V, E, P } = g, s = o.src || 'a', dfs = L.dfs(V, E, s), full = L.dfs(V, E, null, true), cyclic = full.cyclic;
  const parts = [];
  if (o.pseudo !== false) parts.push(wr('(i)', 'Give pseudo-code (or a structured description) of recursive depth-first search that finds a path from the source to every reachable vertex. No timestamps needed.', o.pseudoPts || 3,
    `<pre class="xm-code">dfs(G, s):
  for each v in V: colour[v] = white; pred[v] = nil
  visit(s)

visit(u):
  colour[u] = grey
  for each v in adj[u]:          // out-neighbours
    if colour[v] == white:
      pred[v] = u
      visit(v)
  colour[u] = black</pre>The path to v is read backwards along pred[·]. Running time O(|V| + |E|).`, [[1, 'Mark vertices as seen (colours / visited set) so each is visited once'], [1, 'Recursion over the out-neighbours of u, only into unvisited vertices'], [0.5, 'Record the predecessor pred[v] = u (gives the paths)'], [0.5, 'Starts from the source s']]));
  if (o.adj !== false) { const a = adjTable(V, E); a.label = '(ii)'; parts.push(a); }
  parts.push({ type: 'order', label: '(iii)', prompt: `Run DFS from <b>${s}</b>, processing neighbours in alphabetical order. In which order are the vertices visited (discovered)? Leave out vertices that are not reached.`, items: V.slice(), answer: dfs.order, points: 2, why: `Visit order: ${dfs.order.join(', ')}${V.length > dfs.order.length ? '. Not reachable: ' + V.filter(v => !dfs.order.includes(v)).join(', ') : ''}.` });
  const pt = predTable(V, dfs.pred, 1.5); pt.label = ''; pt.prompt = 'Give the DFS tree as predecessor edges (pred of each vertex; blank for the source and unreached vertices).'; parts.push(pt);
  if (o.stamps) parts.push({ type: 'table', label: '', prompt: 'Extended DFS from the source (timestamps start at 1): give the discovery and finishing times.', points: 2, cols: dfs.order, rows: [{ label: 'discover', cells: dfs.order.map(v => ({ a: String(dfs.d[v]), num: true, tol: 0 })) }, { label: 'finish', cells: dfs.order.map(v => ({ a: String(dfs.f[v]), num: true, tol: 0 })) }] });
  if (o.topo === false && o.cycleQ) {
    parts.push(mc('', 'Is the graph acyclic?', cyclic ? `No: DFS meets the back edge ${full.back[0].join(' → ')} (to a grey vertex)` : 'Yes: no back edge is found', cyclic ? ['Yes: no back edge is found', 'Yes: every vertex is reachable from a', 'No: a has no incoming edges'] : ['No: it has a back edge', 'No: it is not strongly connected', 'Cannot be decided with DFS'], 1, cyclic ? `${full.back[0][1]} is grey (on the recursion stack) when ${full.back[0].join(' → ')} is examined.` : 'No edge ever leads to a grey vertex.'));
    parts.push(wr('(iv)', 'How can the depth-first search algorithm be extended to decide whether the input graph is acyclic?', 3, 'Use three colours: <b>white</b> = unvisited, <b>grey</b> = on the recursion stack (visit started, not finished), <b>black</b> = finished. Run visit from every white vertex. If, while scanning the out-neighbours of u, an edge (u, v) leads to a <b>grey</b> v, it is a <b>back edge</b>: v is an ancestor of u in the DFS tree, so v ⇝ u → v is a directed cycle. The graph is acyclic iff no back edge appears. Edges to black vertices are not cycles. Time O(|V| + |E|).', [[1.5, 'Grey/on-stack state and the back-edge test'], [0.5, 'Why it is a cycle (v is an ancestor of u)'], [0.5, 'Edges to black (finished) vertices are not cycles; start from every unvisited vertex'], [0.5, 'O(|V| + |E|)']]));
  }
  if (o.topo !== false) {
    parts.push(wr('(iv)', 'Define a <i>topological ordering</i> of a directed graph.', 1, 'A linear ordering of <b>all</b> vertices such that for <b>every edge (u, v)</b>, u comes before v. It exists if and only if the graph is acyclic (a DAG).', [[0.5, 'Ordering of all vertices with u before v for every edge (u, v)'], [0.5, 'Exists iff the graph has no directed cycle']]));
    parts.push(mc('(v)', 'Does the graph have a topological ordering?', cyclic ? `No: it has a directed cycle (DFS finds the back edge ${full.back[0].join(' → ')})` : 'Yes: it is a DAG', cyclic ? ['Yes: it is a DAG', 'Yes, but only if we start from a', 'No: some vertex has no incoming edges'] : ['No: it has a directed cycle', 'No: it is not connected', 'Only the vertices reachable from a can be ordered'], 1, cyclic ? `${full.back[0][1]} is still grey (on the recursion stack) when the edge ${full.back[0].join(' → ')} is examined: that edge closes a cycle.` : 'No back edge is found, so there is no directed cycle.'));
    if (!cyclic) parts.push({ type: 'order', label: '', prompt: 'Give a topological ordering of <b>all</b> vertices.', items: V.slice(), answer: full.topo, check: ord => L.isTopo(V, E, ord), points: 2, why: `For example decreasing DFS finishing times: ${full.topo.join(', ')}. Any order with every edge pointing forward is accepted.` });
    parts.push(wr('(vi)', o.cycleQ ? 'How can DFS be extended to decide whether the graph is acyclic?' : 'How can DFS be modified to find a topological ordering?', 2, o.cycleQ ? 'Use the three colours (or an "on stack" flag). When an edge (u, v) leads to a <b>grey</b> vertex v — one still on the recursion stack — it is a <b>back edge</b>, which closes a directed cycle. Run DFS from every unvisited vertex; the graph is acyclic iff no back edge is found. Still O(|V| + |E|).' : 'Run DFS from every unvisited vertex. When a vertex <b>finishes</b> (all its descendants are done), <b>prepend</b> it to a list (or push to a stack). The resulting list — vertices in <b>decreasing finishing time</b> — is a topological order. If an edge to a grey vertex is seen, there is a cycle and no order exists. O(|V| + |E|).',
      o.cycleQ ? [[1, 'Edge to a grey (on-stack) vertex = back edge = cycle'], [0.5, 'Start DFS from every unvisited vertex'], [0.5, 'Acyclic iff no back edge; O(|V|+|E|)']] : [[1, 'Order vertices by decreasing finishing time (prepend when finished)'], [0.5, 'Start DFS from every unvisited vertex'], [0.5, 'Detect a back edge (grey vertex) → no ordering']]));
  }
  return { title: o.title || 'Depth-first search' + (o.topo !== false ? ' and topological order' : ''), figure: L.drawGraph(P, E), prompt: o.prompt || 'Neighbours are processed in alphabetical order (as in the course examples).', parts,
    solution: [`Adjacency lists: ${V.map(v => `${v}: ${E.filter(e => e[0] === v).map(e => e[1]).sort().join(', ') || '–'}`).join(' · ')}`, `DFS from ${s}: visit order ${dfs.order.join(', ')}; tree edges ${V.filter(v => dfs.pred[v]).map(v => dfs.pred[v] + '→' + v).join(', ')}.`, cyclic ? `Back edge ${full.back[0].join('→')} → cycle → no topological order.` : `Finishing order (all vertices): ${Object.keys(full.f).sort((a, b) => full.f[a] - full.f[b]).join(', ')} → reverse it: ${full.topo.join(', ')}.`],
    traps: ['Visiting neighbours in a different order from the one you state: say "alphabetical order" explicitly.', 'Forgetting vertices that are not reachable from the source when giving the topological order (it must contain all vertices).', 'Topological order = <b>decreasing</b> finishing time, not discovery order.'] };
};
D.buildBFS = function (g, o) {
  o = o || {}; const { V, E, P } = g, s = o.src || 'a', b = L.bfs(V, E, s), comps = L.scc(V, E);
  const parts = [];
  if (o.pseudo !== false) parts.push(wr('(i)', 'Give pseudo-code (or a compact structured description) of BFS for shortest paths (in edges) from the source to all vertices. Which data structures are needed?', o.pseudoPts || 3,
    `<pre class="xm-code">bfs(G, s):
  for each v: dist[v] = ∞; pred[v] = nil
  dist[s] = 0; Q = queue(s)
  while Q not empty:
    u = Q.dequeue()
    for each v in adj[u]:
      if dist[v] == ∞:
        dist[v] = dist[u] + 1; pred[v] = u
        Q.enqueue(v)</pre>Data structures: a <b>FIFO queue</b>, the adjacency lists, and arrays (or maps) for dist/visited and pred. O(|V| + |E|).`, [[1, 'FIFO queue, process vertices in the order discovered'], [1, 'dist / visited marking so each vertex is enqueued once; dist[v] = dist[u] + 1'], [0.5, 'pred[v] to recover paths'], [0.5, 'Names the data structures (queue, adjacency lists, dist/pred arrays)']]));
  if (o.adj !== false) parts.push(Object.assign(adjTable(V, E), { label: '(ii)' }));
  parts.push({ type: 'order', label: '(iii)', prompt: `Run BFS from <b>${s}</b> (neighbours in alphabetical order). In which order are vertices discovered? Leave out unreachable ones.`, items: V.slice(), answer: b.order, points: 1.5 });
  parts.push({ type: 'table', label: '', prompt: 'Distances (number of edges) from the source; write <code>inf</code> if unreachable.', points: 1.5, cols: V, rows: [{ label: 'dist', cells: V.map(v => ({ a: b.dist[v] === Infinity ? 'inf' : String(b.dist[v]), num: false, w: 2.4 })) }] });
  parts.push(Object.assign(predTable(V, b.pred, 1), { label: '' }));
  if (o.target) parts.push({ type: 'order', label: '', prompt: `Which path from ${s} to <b>${o.target}</b> does BFS find?`, items: V.slice(), answer: (function () { const p = []; let v = o.target; while (v) { p.unshift(v); v = b.pred[v]; } return p; })(), points: 1 });
  if (o.runtime !== false) parts.push(mc('', 'Worst-case running time of BFS on a graph with n vertices and m edges (adjacency lists)?', 'O(n + m)', ['O(n·m)', 'O(n²)', 'O((n + m) log n)'], 1, 'Every vertex is enqueued once and every edge is examined once.'));
  if (o.scc !== false) {
    parts.push(wr('(v)', 'Define a <i>strongly connected component</i> of a directed graph.', 1, 'A <b>maximal</b> set of vertices in which every vertex can reach every other vertex by a directed path.', [[0.5, 'Every vertex reaches every other (both directions)'], [0.5, 'Maximal (cannot add a vertex)']]));
    const fmt = cs => cs.map(c => '{' + c.join(', ') + '}').join(' ');
    const merged = comps.length > 1 ? fmt([comps[0].concat(comps[1]).sort()].concat(comps.slice(2))) : fmt([V.slice()]);
    const single = fmt(V.map(v => [v])); const W = uniq([merged, single, fmt([V.slice()]), fmt(comps.map(c => c.slice(0, 1)).concat(comps.filter(c => c.length > 1).map(c => c.slice(1))))]).filter(x => x !== fmt(comps));
    parts.push(mc('(vi)', 'What are the strongly connected components?', fmt(comps), W.slice(0, 3), 2, 'Find the cycles: all vertices on a common cycle (or linked by cycles) are in one component; a vertex on no cycle is a component of its own.'));
  }
  return { title: o.title || 'Breadth-first search' + (o.scc !== false ? ' and strongly connected components' : ''), figure: L.drawGraph(P, E), prompt: 'Neighbours are processed in alphabetical order.', parts,
    solution: [`Queue trace: ${b.queueLog.map(q => '[' + q.join(' ') + ']').join(' → ')}`, `Discovery order ${b.order.join(', ')}; distances ${V.map(v => v + '=' + (b.dist[v] === Infinity ? '∞' : b.dist[v])).join(', ')}.`, o.scc !== false ? `SCCs: ${comps.map(c => '{' + c.join(', ') + '}').join(' ')}.` : ''].filter(Boolean),
    traps: ['Marking a vertex when it is <b>dequeued</b> instead of when enqueued: it can then be enqueued twice.', 'Using a stack (that is DFS).', 'Calling a single vertex on no cycle "not a component": it is its own SCC.'] };
};
D.buildDijkstra = function (g, o) {
  o = o || {}; const { V, E, P } = g, s = o.src || 'a', dj = L.dijkstra(V, E, s);
  const parts = [];
  if (o.pseudo !== false) parts.push(wr('(i)', 'Explain Dijkstra\'s algorithm (pseudo-code or a clear structured description). Which data structures does it need?', 3,
    `<pre class="xm-code">dijkstra(G, w, s):
  for each v: dist[v] = ∞; pred[v] = nil
  dist[s] = 0; Q = min-priority queue of all v keyed by dist
  while Q not empty:
    u = Q.extractMin()            // dist[u] is now final
    for each (v, w(u,v)) in adj[u]:
      if dist[u] + w(u,v) < dist[v]:   // relax
        dist[v] = dist[u] + w(u,v); pred[v] = u
        Q.decreaseKey(v, dist[v])</pre>Needs adjacency lists with weights, a <b>min-priority queue</b> (binary heap), and dist/pred arrays.`, [[1, 'Repeatedly extract the unfinished vertex with the smallest tentative distance (it is then final)'], [1, 'Relax all its outgoing edges: dist[v] = min(dist[v], dist[u] + w)'], [0.5, 'pred to recover the paths'], [0.5, 'Data structures: priority queue (heap), adjacency lists, dist/pred arrays']]));
  parts.push({ type: 'order', label: '(ii)', prompt: `Run it from <b>${s}</b>. In which order are vertices extracted from the priority queue (finalised)?`, items: V.slice(), answer: dj.order, points: 2 });
  parts.push({ type: 'table', label: '', prompt: 'Tentative distances <b>after</b> each extraction and the relaxations that follow it (write <code>inf</code> for ∞).', points: 3, corner: 'extracted', cols: V, rows: dj.log.map(l => ({ label: l.u, cells: V.map(v => ({ a: l.dist[v] === Infinity ? 'inf' : String(l.dist[v]), num: false, w: 2.4 })) })) });
  parts.push(mc('(iii)', 'Worst-case running time with a binary heap, n vertices and m edges?', 'O((n + m) log n)', ['O(n + m)', 'O(n·m)', 'O(n² log n)'], 1, 'Each vertex is extracted once and each edge causes at most one decrease-key: (n + m) heap operations of O(log n).'));
  parts.push(wr('(iv)', 'Explain, with a small example, why the algorithm may fail with negative edge weights.', 2, 'Dijkstra assumes that once u is extracted, dist[u] is final: any other path must go through a vertex with a larger tentative distance, and adding non-negative edges cannot make it shorter. A negative edge breaks this. Example: edges s→a (1), s→b (2), b→a (−2). Dijkstra extracts a with dist 1 and never updates it, but s→b→a has length 0. Use Bellman-Ford instead.', [[1, 'Explains the broken invariant: an extracted vertex\'s distance is assumed final'], [1, 'A concrete small counterexample with a negative edge']]));
  return { title: 'Dijkstra\'s algorithm', figure: L.drawGraph(P, E), prompt: 'Edge weights are shown on the edges. Ties are broken alphabetically.', parts,
    solution: dj.log.map(l => `extract <b>${l.u}</b> → ${V.map(v => v + '=' + (l.dist[v] === Infinity ? '∞' : l.dist[v])).join(', ')}`).concat([`Shortest-path tree: ${V.filter(v => dj.pred[v]).map(v => dj.pred[v] + '→' + v).join(', ')}.`]),
    traps: ['Finalising a vertex when it is first reached instead of when it is extracted.', 'Not showing the table step by step: the trace is where most points are.', 'Forgetting that a shorter path can arrive later through a vertex extracted afterwards (that is why we relax).'] };
};
D.buildMST = function (r) {
  const n = 6, V = LET.slice(0, n), P = GRID(n); let E, g;
  for (let t = 0; t < 200; t++) { g = D.randGraph(r, { n, density: 1.6, minReach: 0 }); const ws = r.sample(L.range(1, 16), g.E.length); E = g.E.map(([u, v], i) => [u < v ? u : v, u < v ? v : u, ws[i]]);
    const und = E.concat(E.map(([u, v, w]) => [v, u, w])); if (L.bfs(V, und, 'a').order.length === n) break; }
  const sorted = E.slice().sort((a, b) => a[2] - b[2]), parent = {}; V.forEach(v => parent[v] = v); const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const kr = []; sorted.forEach(([u, v, w]) => { const a = find(u), b = find(v); if (a !== b) { parent[a] = b; kr.push(u + v); } });
  const total = L.sum(E.filter(e => kr.includes(e[0] + e[1])).map(e => e[2]));
  // Prim from a
  const inT = new Set(['a']), pr = []; while (inT.size < n) { let best = null; E.forEach(([u, v, w]) => { if (inT.has(u) !== inT.has(v) && (!best || w < best[2])) best = [u, v, w]; }); pr.push(best[0] + best[1]); inT.add(best[0]); inT.add(best[1]); }
  return { title: 'Minimum spanning tree', figure: L.drawGraph(P, E, { undirected: true }), prompt: 'Undirected graph, all edge weights distinct. Edges are named by their end vertices, e.g. <code>ab</code>.',
    parts: [{ type: 'order', label: '(a)', prompt: 'In which order does <b>Kruskal\'s</b> algorithm add edges to the tree?', items: E.map(e => e[0] + e[1]), answer: kr, points: 2, why: 'Sort edges by weight; add an edge if it joins two different components (union-find).' },
      { type: 'order', label: '(b)', prompt: 'In which order does <b>Prim\'s</b> algorithm, started from a, add edges?', items: E.map(e => e[0] + e[1]), answer: pr, points: 2, why: 'Always add the cheapest edge leaving the current tree.' },
      { type: 'numeric', label: '(c)', prompt: 'Total weight of the minimum spanning tree?', answer: total, tol: 0, points: 1 }],
    solution: [`Edges by weight: ${sorted.map(e => e[0] + e[1] + '(' + e[2] + ')').join(', ')}.`, `Kruskal adds ${kr.join(', ')}; Prim from a adds ${pr.join(', ')}; total ${total}.`], traps: ['Kruskal: adding an edge that closes a cycle (check with union-find).', 'Prim: picking the cheapest edge anywhere instead of one leaving the tree.'] };
};

/* ======================= Q5: dynamic programming ======================= */
const DP_RUBRIC = (sub, rec, algo, time) => [[1.5, 'Sub-problem defined in words: ' + sub], [1.5, 'Correct recurrence with base cases: ' + rec], [1, 'Bottom-up (or memoised) algorithm: ' + algo], [0.5, 'Running time stated: ' + time]];
D.buildJumps = function (steps, n, o) {
  o = o || {}; const F = L.jumps(n, steps), st = steps.join(' or '), ex = L.range(steps[0] + 1, n).filter(k => F[k] > 2).slice(0, 2);
  const wrongs = [`F(0) = 1, F(i) = ${steps.map(s => `F(i−${s})`).join(' + ')} + 1`, `F(0) = 0, F(i) = ${steps.map(s => `F(i−${s})`).join(' + ')}`, `F(i) = F(i−1) + F(i−2), F(0) = F(1) = 1`, `F(0) = 1, F(i) = ${steps.map(s => `F(i−${s})`).join(' · ')}`];
  const lastPts = o.tablePts || 3;
  return { title: `Jumps of ${st} units: count the sequences`, prompt: `A frog moves forwards by jumps of <b>${st}</b> units. Given n, how many different jump sequences take it forwards exactly n units?${ex.length ? ` (For instance n = ${ex[0]} has ${F[ex[0]]} sequences.)` : ''} Develop a dynamic-programming algorithm (recursive definition + algorithm), and show how it solves <b>n = ${n}</b>.`,
    parts: [mc('(a)', 'Which recursive definition is correct? (Terms with a negative argument are 0.)', `F(0) = 1, F(i) = ${steps.map(s => `F(i−${s})`).join(' + ')} for i ≥ 1`, wrongs.slice(0, 3), 1.5, `The last jump is ${steps.join(' or ')} units, and the sequences before it move i−${steps[0]}${steps.slice(1).map(s => ', i−' + s).join('')} units. F(0) = 1 counts the empty sequence.`),
      wr('(b)', 'Write the sub-problem, the recurrence with base cases, the algorithm (Scala or pseudo-code) and its running time.', 3.5, `F(i) = number of jump sequences that move exactly i units. F(0) = 1, F(i) = ${steps.map(s => `F(i−${s})`).join(' + ')} (terms with negative index are 0).<pre class="xm-code">def count(n: Int): BigInt =
  val F = new Array[BigInt](n + 1)
  F(0) = 1
  for i <- 1 to n do
    F(i) = ${steps.map(s => `(if i >= ${s} then F(i-${s}) else 0)`).join(' + ')}
  F(n)</pre>n iterations, each a constant number of additions of O(n)-bit numbers (F grows exponentially) → <b>O(n²)</b> bit operations, or O(n) arithmetic operations (O(n log n) with the course's convention for big numbers).`, DP_RUBRIC('F(i) = #sequences covering i units', 'F(0) = 1 and the sum over the last jump', 'fill F(0..n) left to right', 'O(n) additions'), { rows: 5 }),
      { type: 'table', label: '(c)', prompt: `Fill in the table for n = ${n}.`, points: lastPts, cols: L.range(0, n + 1).map(String), corner: 'i', rows: [{ label: 'F(i)', cells: F.map((v, i) => i === 0 ? { a: '1', given: true } : { a: String(v), num: true, tol: 0 }) }] }],
    solution: [`Table: ${F.map((v, i) => `F(${i}) = ${v}`).join(', ')}.`, `Answer: <b>F(${n}) = ${F[n]}</b>.`],
    traps: ['Writing out the sequences instead of the table (the exam forbids it, and it is slow).', 'Wrong base case: F(0) = 1 (the empty sequence), F(1) = 0 when the smallest jump is 2.', 'Forgetting the running time.'] };
};
D.buildRGB = function (n, banned, o) {
  o = o || {}; const rows = L.rgb(n, banned), bd = banned.filter((x, i) => i % 2 === 0).map(x => `'${x[0]}' and '${x[1]}'`).join(', ');
  const allowedBefore = c => 'rgb'.split('').filter(p => !banned.includes(p + c));
  return { title: 'Red-green-blue strings', prompt: `An rgb-string is a string over {r, g, b}. How many rgb-strings of length n have <b>no two consecutive positions containing ${bd}</b> (in either order)? For n = 1 the answer is 3; for n = 2 it is ${rows[1] ? rows[1].total : '?'}. Develop a DP algorithm and show how it solves <b>n = ${n}</b>.`,
    parts: [wr('(a)', 'Sub-problem, recurrence with base cases, algorithm and running time.', 4, `Let R(i), G(i), B(i) = number of valid strings of length i ending in r, g, b. Base: R(1) = G(1) = B(1) = 1. Recurrence: ${'rgb'.split('').map(c => `${c.toUpperCase()}(i) = ${allowedBefore(c).map(p => p.toUpperCase() + '(i−1)').join(' + ')}`).join('; ')}. Answer: R(n) + G(n) + B(n). Fill i = 1…n in a loop: Θ(n) additions (O(n log n) counting the growing numbers).`, DP_RUBRIC('count by last character', 'one equation per ending letter, R(1)=G(1)=B(1)=1', 'loop i = 2…n', 'Θ(n) additions')),
      { type: 'table', label: '(b)', prompt: `Fill in the table up to n = ${n}.`, points: 4, cols: ['ends r', 'ends g', 'ends b', 'total'], corner: 'length', rows: rows.map((rw, i) => ({ label: String(i + 1), cells: ['r', 'g', 'b', 'total'].map(k => i === 0 ? { a: String(rw[k]), given: true } : { a: String(rw[k]), num: true, tol: 0 }) })) }],
    solution: rows.map((rw, i) => `length ${i + 1}: r ${rw.r}, g ${rw.g}, b ${rw.b} → total ${rw.total}`), traps: ['Counting only totals: you need the last character to know what may follow.', 'Forgetting that the restriction is symmetric ("in either order").'] };
};
D.randDAG = function (r, n, weighted) {
  for (let t = 0; t < 300; t++) {
    const g = D.randGraph(r, { n, dag: true, density: 1.6, weighted, wmax: 9, minReach: n - 1 });
    const topo = L.dfs(g.V, g.E, null, true).topo, t0 = topo[topo.length - 1];
    if (topo[0] !== 'a') continue; const cnt = L.dagCount(g.V, g.E, t0).a;
    if (cnt.a >= 4 && cnt.a <= 40) return Object.assign(g, { t: t0 });
  }
  throw new Error('dag');
};
D.buildDagCount = function (g, o) {
  o = o || {}; const { V, E, P } = g, s = o.s || 'a', t = o.t || g.t, res = L.dagCount(V, E, t), ord = res.evalOrder;
  return { title: 'Count paths in a DAG', figure: L.drawGraph(P, E), prompt: `Given a directed acyclic graph and vertices s and t, how many different paths are there from s to t? Let a(v) = number of paths from v to t. Develop the DP and apply it with <b>s = ${s}</b>, <b>t = ${t}</b>.`,
    parts: [wr('(i)', 'Recursive definition of a(v), the algorithm and its running time.', 4, `a(t) = 1; for v ≠ t: a(v) = Σ a(w) over the edges (v, w) (0 if v has no out-edges). Evaluate in <b>reverse topological order</b> (or by memoised recursion), so every a(w) is ready before a(v). Time O(|V| + |E|) additions (×O(|V|) bits for the big numbers → O(|V| + |E||V|)).`, DP_RUBRIC('a(v) = #paths v→t', 'a(t) = 1, a(v) = Σ a(w)', 'reverse topological order or memoisation', 'O(|V| + |E|) additions')),
      { type: 'table', label: '(ii)', prompt: 'Give a(v) for every vertex.', points: 4, cols: ord, rows: [{ label: 'a(v)', cells: ord.map(v => ({ a: String(res.a[v]), num: true, tol: 0 })) }], hint: 'Columns are in a valid evaluation order (reverse topological).' }],
    solution: [`Evaluate in reverse topological order: ${ord.map(v => `a(${v}) = ${res.a[v]}`).join(', ')}.`, `Answer: <b>${res.a[s]}</b> paths from ${s} to ${t}.`], traps: ['Evaluating a vertex before all of its successors.', 'Forgetting a(t) = 1 and that vertices that cannot reach t get 0.'] };
};
D.buildDagLongest = function (g, o) {
  o = o || {}; const { V, E, P } = g, s = o.s || 'a', t = o.t || g.t, res = L.dagLongest(V, E, t), ord = res.evalOrder;
  const show = v => res.l[v] === -Infinity ? '-inf' : String(res.l[v]);
  return { title: 'Longest path in a weighted DAG', figure: L.drawGraph(P, E), prompt: `Edge-weighted DAG. What is the largest total weight of a path from <b>${s}</b> to <b>${t}</b>? Let l(v) = weight of the longest path from v to t. Algorithm in linear time.`,
    parts: [wr('(i)', 'Recursive definition of l(v), algorithm and running time.', 4, `l(t) = 0; for v ≠ t: l(v) = max over edges (v, w) of w(v, w) + l(w); l(v) = −∞ if no path to t. Evaluate in reverse topological order (DFS finishing order) or with memoised recursion. Each edge is looked at once: <b>O(|V| + |E|)</b>.`, DP_RUBRIC('l(v) = longest v→t', 'l(t) = 0, max over out-edges, −∞ if none', 'reverse topological order', 'O(|V| + |E|)')),
      { type: 'table', label: '(ii)', prompt: 'Give l(v) for every vertex (write <code>-inf</code> if t is unreachable).', points: 4, cols: ord, rows: [{ label: 'l(v)', cells: ord.map(v => ({ a: show(v), num: false, w: 2.6 })) }] }],
    solution: [ord.map(v => `l(${v}) = ${show(v)}`).join(', '), `Answer: <b>${show(s)}</b>.`], traps: ['Using Dijkstra-style "min": the question asks for the longest path.', 'A vertex with no path to t must not contribute 0 (use −∞).'] };
};
D.buildLPS = function (s, o) {
  o = o || {}; const T = L.lps(s), n = s.length;
  return { title: 'Longest palindromic subsequence', prompt: `Find the length of the longest subsequence of a string that is a palindrome, in O(n²) time and O(n²) memory. Apply it to <b>"${s}"</b>.`,
    parts: [wr('(a)', 'Recurrence for P(i, j) = LPS length of s(i..j), algorithm, running time.', 4, 'P(i, i) = 1; P(i, j) = 0 for j &lt; i. If s(i) == s(j): P(i, j) = P(i+1, j−1) + 2 (with P = 2 when j = i + 1). Otherwise P(i, j) = max(P(i+1, j), P(i, j−1)). Fill the table by increasing length j − i. n² entries, O(1) each: <b>Θ(n²)</b> time and memory.', DP_RUBRIC('P(i,j) on substring s(i..j)', 'match → +2 inside, else max of dropping an end', 'fill by increasing length', 'Θ(n²)')),
      { type: 'table', label: '(b)', prompt: 'Fill in P(i, j) (row i, column j; diagonal given).', points: 4, cols: L.range(0, n).map(j => `${j}:${s[j]}`), corner: 'i \\ j', rows: L.range(0, n).map(i => ({ label: `${i}:${s[i]}`, cells: L.range(0, n).map(j => j < i ? null : j === i ? { a: '1', given: true } : { a: String(T[i][j]), num: true, tol: 0 }) })) },
      { type: 'numeric', label: '(c)', prompt: 'The answer (length)?', answer: T[0][n - 1], tol: 0, points: 1 }],
    solution: [`Answer P(0, ${n - 1}) = <b>${T[0][n - 1]}</b>.`, 'Fill diagonals of increasing length; each cell looks at most at three neighbours.'], traps: ['Confusing subsequence (gaps allowed) with substring.', 'Filling the table row by row from the top: P(i, j) needs P(i+1, ·).'] };
};
D.buildCoins = function (amount, coins) {
  const rows = [], W = new Array(amount + 1).fill(0); W[0] = 1; coins.forEach(c => { for (let x = c; x <= amount; x++) W[x] += W[x - c]; rows.push({ c, w: W.slice() }); });
  return { title: 'Coin change: count the ways', prompt: `Coins of values ${coins.join(', ')} (unlimited supply). In how many ways can you pay <b>${amount}</b>? (Order of coins does not matter.)`,
    parts: [wr('(a)', 'Recurrence and algorithm.', 3, 'W_k(x) = number of ways to pay x using the first k coin types. W_k(x) = W_{k−1}(x) + W_k(x − c_k) (use coin k zero times, or at least once); W(0) = 1. One array, loop over coins outside and amounts x = c…A inside: Θ(k·A) (pseudo-polynomial).', DP_RUBRIC('ways to pay x with the first k coins', 'W_k(x) = W_{k−1}(x) + W_k(x−c_k), W(0)=1', 'coins outer loop so orders are not double-counted', 'Θ(k·A)')),
      { type: 'table', label: '(b)', prompt: 'Fill W after each coin type is allowed.', points: 4, cols: L.range(0, amount + 1).map(String), corner: 'coins ≤', rows: rows.map(rw => ({ label: String(rw.c), cells: rw.w.map((v, i) => i === 0 ? { a: '1', given: true } : { a: String(v), num: true, tol: 0 }) })) }],
    solution: rows.map(rw => `with coins up to ${rw.c}: ${rw.w.join(' ')}`), traps: ['Putting the amount loop outside: that counts orders (2+1 and 1+2 separately).'] };
};
D.buildKnap = function (Wc, items) {
  const T = L.knap01(Wc, items);
  return { title: '0/1 knapsack', prompt: `Capacity <b>W = ${Wc}</b>. Items (weight, value): ${items.map(([w, v], i) => `${i + 1}: (${w}, ${v})`).join(', ')}. Each item can be taken at most once.`,
    parts: [{ type: 'table', label: '(a)', prompt: 'Fill V(i, c) = best value using items 1…i with capacity c.', points: 4, cols: L.range(0, Wc + 1).map(String), corner: 'i \\ c', rows: T.map((row, i) => ({ label: String(i), cells: row.map(v => i === 0 ? { a: '0', given: true } : { a: String(v), num: true, tol: 0 }) })) },
      { type: 'numeric', label: '(b)', prompt: 'Maximum value?', answer: T[items.length][Wc], tol: 0, points: 1 },
      mc('(c)', 'Running time?', 'Θ(n·W): pseudo-polynomial', ['Θ(n log n)', 'Θ(2ⁿ) always', 'Θ(n + W)'], 1, 'n·W table cells, O(1) each. Polynomial in the <i>value</i> W but exponential in its bit length.')],
    solution: [`V(i, c) = max(V(i−1, c), V(i−1, c − wᵢ) + vᵢ if wᵢ ≤ c).`, `Answer ${T[items.length][Wc]}.`], traps: ['Using V(i, c − wᵢ) (same row): that allows taking an item twice.'] };
};

/* ======================= Q6: NP and parallel ======================= */
const NP_DEFS = [wr('(i)', 'Define: a decision problem in the class <b>NP</b>.', 2, 'A decision problem is in NP if for every <b>yes</b>-instance there is a <b>certificate</b> (witness) of polynomial size such that a <b>deterministic polynomial-time algorithm</b> can verify it; for no-instances no certificate passes. (Equivalently: solvable by a non-deterministic TM in polynomial time.)', [[1, 'Yes-instances have a polynomial-size certificate'], [1, 'Certificate checkable in polynomial time (or non-deterministic poly time)']]),
  wr('(ii)', 'Define: an <b>NP-complete</b> decision problem.', 2, 'A problem B is NP-complete if (1) <b>B ∈ NP</b>, and (2) B is <b>NP-hard</b>: every problem A in NP has a polynomial-time (Karp) reduction A ≤ₚ B. (In practice: reduce a known NP-complete problem, e.g. SAT, to B.)', [[1, 'B is in NP'], [1, 'Every NP problem reduces to B in polynomial time (NP-hard)']])];
const NP_PROBS = {
  coloring: ['VERTEX COLORING', 'an undirected graph G = (V, E) and an integer k', 'Does G have a k-colouring c: V → {1, …, k} with c(v) ≠ c(w) for every edge {v, w}?', 'the colouring c itself (one colour per vertex)', 'check every c(v) ∈ {1…k} and, for every edge {v, w}, that c(v) ≠ c(w): O(|V| + |E|)'],
  domset: ['DOMINATING SET', 'an undirected graph G = (V, E) and an integer k', 'Is there a set D ⊆ V with |D| ≤ k such that every vertex is in D or has a neighbour in D?', 'the set D', 'check |D| ≤ k, then mark D and all neighbours of D and check every vertex is marked: O(|V| + |E|)'],
  indset: ['INDEPENDENT SET', 'an undirected graph G and an integer k', 'Is there a set S of at least k vertices with no edge between any two of them?', 'the set S', 'check |S| ≥ k and that no edge has both ends in S: O(|V| + |E|)'],
  clique: ['CLIQUE', 'an undirected graph G and an integer k', 'Does G contain k vertices that are all pairwise adjacent?', 'the k vertices', 'check all k(k−1)/2 pairs are edges: O(k²) with an adjacency matrix (or O(k²·deg) with lists)'],
  vcover: ['VERTEX COVER', 'an undirected graph G and an integer k', 'Is there a set C of at most k vertices touching every edge?', 'the set C', 'check |C| ≤ k and that every edge has an end in C: O(|V| + |E|)'],
  hamcycle: ['HAMILTONIAN CYCLE', 'an undirected graph G', 'Is there a cycle visiting every vertex exactly once?', 'the order of the vertices on the cycle', 'check it is a permutation of V and consecutive vertices (and last→first) are adjacent: O(|V| + |E|)'],
  subsetsum: ['SUBSET-SUM', 'a set S of integers and a target t', 'Is there a subset of S whose elements sum to t?', 'the subset', 'check it is a subset of S and add up its elements: polynomial in the input size (O(n) additions of numbers of the input\'s bit length)'],
  sat: ['SAT', 'a propositional formula in CNF', 'Is there a truth assignment that makes the formula true?', 'the truth assignment', 'evaluate every clause: linear in the formula size'],
  tsp: ['TSP (decision version)', 'cities, pairwise distances and a bound B', 'Is there a tour visiting every city once with total length ≤ B?', 'the tour (order of cities)', 'check it is a permutation and sum the n distances ≤ B: O(n)'],
  setcover: ['SET COVER', 'a universe U, subsets S₁…S_m of U and an integer k', 'Can at most k of the subsets together cover U?', 'the chosen subsets', 'check there are ≤ k of them and mark their elements, then check all of U is marked: polynomial'],
};
D.NP_PROBS = NP_PROBS;
const NP_APPROACH = wr('(iv)', 'Describe an approach for solving the problem in practice (no detailed algorithm needed).', 2, 'Any well-explained one: <b>(1) backtracking / exhaustive search with pruning</b> (assign choices one by one, undo on conflict; exponential worst case but fine for moderate instances); <b>(2) reduce to SAT</b> (or ILP/CP) and use an efficient solver such as a CDCL SAT solver, e.g. encode "vertex v has colour i" as boolean variables with clauses; <b>(3) heuristics / local search</b> (greedy, simulated annealing) when an optimal answer is not required; (4) exploit special cases (small k, small numbers → DP).', [[1, 'Names a concrete practical approach (backtracking, SAT/ILP solver, heuristic/local search, special-case DP)'], [1, 'Explains briefly how it applies to this problem and its trade-off (exponential worst case / no optimality guarantee)']]);
D.buildNP = function (key, o) {
  o = o || {}; const P = NP_PROBS[key];
  const parts = NP_DEFS.map(x => Object.assign({}, x));
  parts.push(wr('(iii)', `Explain why <b>${P[0]}</b> is in NP.`, 2, `Certificate: ${P[3]}. Verifier: ${P[4]}. The certificate has polynomial size and is checked in polynomial time, and a yes-instance always has one; so ${P[0]} ∈ NP.`, [[1, 'Names the certificate: ' + P[3]], [1, 'Polynomial-time check described: ' + P[4]]]));
  parts.push(Object.assign({}, NP_APPROACH));
  return { title: `NP-completeness: ${P[0]}`, prompt: `<b>${P[0]}</b><br>Input: ${P[1]}.<br>Question: ${P[2]}`, parts,
    solution: ['Definitions: NP = polynomially verifiable certificates; NP-complete = in NP + NP-hard.', `Why in NP: certificate = ${P[3]}; check = ${P[4]}.`, 'Practical approaches: backtracking with pruning, reduction to SAT, heuristics/local search, special cases.'],
    traps: ['Saying "it is in NP because it is hard / exponential": NP is about <b>verifying</b> a certificate quickly.', 'Getting the reduction direction backwards: to show B is NP-hard, reduce a known NP-complete problem <b>to</b> B.', 'Only naming an approach without saying how it applies.'] };
};
D.buildNPquick = function (r) {
  const all = [
    mc('', 'Which inclusion is known to hold?', 'P ⊆ NP', ['NP ⊆ P', 'P = NP', 'NP-complete ⊆ P'], 1, 'A polynomial-time solver can serve as its own verifier. Whether P = NP is open.'),
    mc('', 'To show a new problem B is NP-hard, you…', 'reduce a known NP-complete problem A to B (A ≤ₚ B)', ['reduce B to a known NP-complete problem', 'show B has an exponential algorithm', 'show B is in NP'], 1, 'If B could be solved fast, then A could too, via the reduction.'),
    mc('', 'Cook–Levin theorem says…', 'SAT is NP-complete', ['P ≠ NP', 'Every NP problem has a poly-size certificate', 'SAT is in P'], 1, 'It was the first NP-completeness proof; others follow by reductions from SAT.'),
    mc('', 'SUBSET-SUM with values bounded by M can be solved by DP in O(n·M). Does that put it in P?', 'No: O(n·M) is pseudo-polynomial, exponential in the bit length of M', ['Yes, so P = NP', 'Yes, because the DP is polynomial in n', 'No: DP cannot solve it at all'], 1, 'The input stores M in log M bits.'),
    mc('', 'Which of these problems is known to be in P?', 'Shortest paths with non-negative weights', ['Hamiltonian cycle', 'Graph 3-colouring', 'CLIQUE'], 1, 'Dijkstra solves it in O((n + m) log n).'),
    mc('', 'A problem in NP has a certificate that is…', 'polynomial in size and verifiable in polynomial time', ['unique', 'computable in polynomial time', 'exponential in size'], 1, 'Finding it may be hard; checking it must be easy.')];
  return { title: 'P, NP and reductions: quick checks', prompt: '', parts: r.sample(all, 4), solution: ['Remember: NP = easy to <b>check</b>. NP-complete = in NP and every NP problem reduces to it.'], traps: ['Confusing NP with "non-polynomial".'] };
};
const PAR = {
  sum: { code: n => `def ${n}[A](a: Array[A], f: A => Int): Int =
  require(a.nonEmpty)
  def inner(start: Int, end: Int): Int =
    if start == end then
      f(a(start))
    else
      val mid = start + (end - start)/2
      val (l, r) = par.parallel(
        inner(start, mid),
        inner(mid+1, end)
      )
      l + r
  inner(0, a.length-1)`, what: 'Σ f(a(i)): the sum of f over all elements', wrong: ['the maximum of f(a(i))', 'f applied to the sum of the elements', 'the number of elements where f is positive'], span: 'Θ(log n)', work: 'Θ(n)', par: 'Θ(n / log n)' },
  max: { code: n => `def ${n}(a: Array[Int]): Int =
  require(a.nonEmpty)
  def inner(start: Int, end: Int): Int =
    if start == end then a(start)
    else
      val mid = start + (end - start)/2
      val (l, r) = par.parallel(
        inner(start, mid),
        inner(mid+1, end)
      )
      l max r
  inner(0, a.length-1)`, what: 'the maximum element of a', wrong: ['the sum of a', 'the index of the maximum', 'a sorted'], span: 'Θ(log n)', work: 'Θ(n)', par: 'Θ(n / log n)' },
  dot: { code: n => `def ${n}[T](a: Array[T], b: Array[T], f: (T, T) => Double): Double =
  require(a.nonEmpty)
  require(a.length == b.length)
  def inner(start: Int, end: Int): Double =
    if start == end then f(a(start), b(start))
    else
      val mid = start + (end - start)/2
      val (l, r) = par.parallel(
        inner(start, mid),
        inner(mid+1, end)
      )
      l + r
  inner(0, a.length-1)`, what: 'Σ f(aᵢ, bᵢ): e.g. the dot product when f is multiplication', wrong: ['f(Σaᵢ, Σbᵢ)', 'the largest f(aᵢ, bᵢ)', 'Σᵢ Σⱼ f(aᵢ, bⱼ)'], span: 'Θ(log n)', work: 'Θ(n)', par: 'Θ(n / log n)' },
  count: { code: n => `def ${n}[A](a: Array[A], p: A => Boolean): Int =
  def inner(start: Int, end: Int): Int =
    if end - start < 1 then 0
    else if end - start == 1 then (if p(a(start)) then 1 else 0)
    else
      val mid = start + (end - start)/2
      val (l, r) = par.parallel(inner(start, mid), inner(mid, end))
      l + r
  inner(0, a.length)`, what: 'the number of elements satisfying p', wrong: ['whether all elements satisfy p', 'the index of the first element satisfying p', 'the elements satisfying p'], span: 'Θ(log n)', work: 'Θ(n)', par: 'Θ(n / log n)' },
  msort: { code: n => `def ${n}(a: Array[Int]): Unit =
  val aux = new Array[Int](a.length)
  def inner(lo: Int, hi: Int): Unit =      // sorts a(lo..hi)
    if lo < hi then
      val mid = lo + (hi - lo)/2
      par.parallel(inner(lo, mid), inner(mid+1, hi))
      merge(lo, mid, hi)                    // ordinary sequential merge via aux
  inner(0, a.length - 1)`, what: 'sorts a (parallel merge sort)', wrong: ['the maximum', 'a merged with aux', 'a reversed'], span: 'Θ(n)', work: 'Θ(n log n)', par: 'Θ(log n)', note: 'The top-level merge alone is Θ(n) sequential work, so the span recurrence is S(n) = S(n/2) + Θ(n) = Θ(n). Parallelising the merge reduces the span to polylogarithmic.' }
};
D.PAR = PAR;
D.buildPar = function (key, o) {
  o = o || {}; const P = PAR[key], nm = o.fname || 'f';
  const opts3 = ans => ['Θ(1)', 'Θ(log n)', 'Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(n / log n)'].filter(x => x !== ans).slice(0, 3);
  return { title: 'Parallel divide and conquer: work and span', figure: L.codeNum(P.code(nm)), prompt: 'par.parallel(code1, code2) runs both in parallel and returns both results, as in the course. Let n be the array length; assume f/p run in constant time. Justify each answer with a few sentences.',
    parts: [mc('(i)', 'What does the program compute?', P.what, P.wrong, 1.5, ''),
      mc('(ii)', 'Span (critical path length)?', P.span, opts3(P.span), 2, P.note || 'Recursion depth is log₂ n and each level adds O(1) on the critical path: S(n) = S(n/2) + O(1) = Θ(log n).'),
      mc('(iii)', 'Work (total operations)?', P.work, opts3(P.work), 1.5, key === 'msort' ? 'Like sequential merge sort: W(n) = 2W(n/2) + Θ(n).' : 'Every element is handled once, plus Θ(n) internal nodes of the recursion: W(n) = 2W(n/2) + O(1) = Θ(n).'),
      mc('', 'Parallelism (work / span)?', P.par, opts3(P.par), 1, 'Parallelism = T₁ / T∞.'),
      wr('(iv)', 'How could the program be improved to run faster in practice?', 2, 'Spawning a parallel task for every tiny range costs far more than the actual work. Use a <b>sequential cut-off</b>: if end − start is below a threshold (e.g. a few thousand elements), compute the range with a plain loop; only split larger ranges in parallel. This keeps the parallelism but removes most of the task overhead (and improves cache use).' + (key === 'msort' ? ' For merge sort, also parallelise the merge.' : ''), [[1, 'Sequential cut-off / threshold for small subproblems'], [1, 'Reason: task creation and scheduling overhead dominates for tiny ranges']])],
    solution: [`Computes ${P.what}.`, `Work ${P.work}, span ${P.span}, parallelism ${P.par}.`, 'Improve: sequential cut-off.'], traps: ['Confusing work and span.', 'Giving the parallelism as a number of cores: it is T₁/T∞, an asymptotic quantity.'] };
};
D.buildParNum = function (r) {
  const T1 = r.pick([1e6, 2e6, 4e6, 8e6]), Tinf = r.pick([1e3, 2e3, 5e3, 1e4]), P = r.pick([4, 8, 16, 32]), f = r.pick([.05, .1, .2, .25]), p2 = r.pick([4, 8, 16, 64]);
  const brent = T1 / P + Tinf, amd = 1 / (f + (1 - f) / p2);
  return { title: 'Work, span, Brent and Amdahl', prompt: `A parallel program has work T₁ = ${L.num(T1, 0)} and span T∞ = ${L.num(Tinf, 0)} (time units).`,
    parts: [{ type: 'numeric', label: '(a)', prompt: 'Parallelism T₁ / T∞?', answer: T1 / Tinf, rtol: .001, points: 1 },
      { type: 'numeric', label: '(b)', prompt: `Upper bound on the running time with P = ${P} processors under a greedy scheduler (T_P ≤ T₁/P + T∞)?`, answer: brent, rtol: .005, points: 1.5 },
      { type: 'numeric', label: '(c)', prompt: `Amdahl's law: a program spends ${f * 100} % of its time in a part that cannot be parallelised. Maximum speed-up with ${p2} processors?`, answer: amd, rtol: .01, points: 1.5, dp: 2 },
      mc('(d)', 'Adding processors beyond the parallelism T₁/T∞…', 'gives little further speed-up: the span becomes the bottleneck', ['always halves the time', 'reduces the work', 'reduces the span'], 1, 'T_P ≥ T∞ whatever P is.')],
    solution: [`T₁/T∞ = ${L.num(T1 / Tinf, 0)}.`, `T_P ≤ ${L.num(T1, 0)}/${P} + ${L.num(Tinf, 0)} = ${L.num(brent, 0)}.`, `Speed-up ≤ 1 / (${f} + ${1 - f}/${p2}) = ${L.num(amd, 2)} (and never more than 1/${f} = ${L.num(1 / f, 1)}).`], traps: ['Amdahl: dividing the serial fraction by P too.'] };
};

/* ======================= course + templates ======================= */
const fn = r => r.pick(['sort', 'sortX', 'mystery', 'f', 'arrange', 'process']);
const TPL = {
  ops_table: { topic: 'q1', title: 'Running times of operations (array, heap, balanced BST, hash)', kinds: 'multiple choice', source: 'Same type as DSA 2.12.2024 Q1 and 12.12.2018 Q1',
    gen: r => { const pick = r.sample(OPS, 7); return D.buildOps(pick); } },
  code_analysis: { topic: 'q1', title: 'Analyse code: what does it compute, best/worst case, improve it', kinds: 'multiple choice + written', source: 'Same type as DSA 1.12.2025 Q1', weight: 1.4,
    gen: r => D.buildCode(r.pick(SNIPS)) },
  amort_written: { topic: 'q1', title: 'Explain amortized appends and an O(1) queue', kinds: 'written + rubric', source: 'Same as DSA 21.2.2019 Q1 and 12.12.2016 Q1', gen: () => D.buildAmortWritten() },
  amort_num: { topic: 'q1', title: 'Count the copies made by ArrayBuffer doubling', kinds: 'numeric', source: 'Course material: round 1 (dynamic arrays)', weight: .5,
    gen: r => D.buildAmortNum(r.pick([1, 2, 4]), r.pick([2, 2, 1.5]), r.int(9, 70)) },
  sort_identify: { topic: 'q2', title: 'Identify the sort from Scala code and analyse it', kinds: 'multiple choice + written', source: 'Asked every year: DSA 2025 (selection), 2024 (merge), 2023 (insertion), 2019 (merge), 2018 (quicksort)', weight: 2,
    gen: r => { const alg = r.pick(['selection', 'insertion', 'merge', 'merge', 'quick', 'insertion', 'selection', 'heap', 'radix']); const q = D.buildSort(alg, { fname: fn(r), early: r.pick(['commented', 'commented', 'active']), r, inplaceQ: r.chance(.4) }); return q; } },
  sort_trace: { topic: 'q2', title: 'Trace a sorting algorithm on a small array', kinds: 'fill the table', source: 'Course material: round 2 (sorting)', weight: .7,
    gen: r => { const alg = r.pick(['insertion', 'selection', 'merge', 'quick', 'radix']); const arr = alg === 'radix' ? r.sample(L.range(10, 400), 6) : r.sample(L.range(1, 40), alg === 'merge' ? r.pick([6, 7]) : 6); return D.buildTrace(alg, arr); } },
  bst_ops: { topic: 'q3t', title: 'BST: insert and delete (largest key of the left subtree)', kinds: 'pick the tree + order', source: 'Same type as DSA 2025 Q3, 2018 Q3, 2016 Q3', weight: 1.3,
    gen: r => { for (;;) { const keys = r.sample(L.range(3, 99), r.int(9, 11)); const t = L.bstFrom(keys); const two = L.inorder(t).filter(k => { const n = (function f(x) { return !x ? null : k < x[0] ? f(x[1]) : k > x[0] ? f(x[2]) : x; })(t); return n[1] && n[2]; });
      if (!two.length) continue; const ins = r.pick(L.range(3, 99).filter(k => !keys.includes(k))); const d2 = r.pick(two), d1 = r.pick(L.inorder(t).filter(k => k !== d2));
      return D.buildBST(t, r.shuffle([['ins', ins], ['del', d1]]).concat([['del', d2]]), { avlQ: r.chance(.5), inorderQ: r.chance(.3) }); } } },
  avl_insert: { topic: 'q3t', title: 'AVL insertion with rotations', kinds: 'multiple choice + pick the tree', source: 'Same type as DSA 2025 Q3(v), 2018 Q3, 2016 Q3', weight: 1.3,
    gen: r => { for (let t0 = 0; t0 < 400; t0++) { const t = D.randAVL(r, r.int(5, 8)); const ks = r.shuffle(L.range(1, 62).filter(k => !L.inorder(t).includes(k))); const want = r.pick(['single', 'double', 'any']);
      for (const k of ks) { const res = L.avlInsert(t, k); if (res.rot && (want === 'any' || res.rot.startsWith(want))) return D.buildAVL(t, k, { def: true, why: r.chance(.5) }); } } } },
  heap_ops: { topic: 'q3h', title: 'Binary max-heap: properties, array form, insert, remove-max', kinds: 'fill the table + numeric + multiple choice', source: 'Same type as DSA 4.12.2023 Q2',
    gen: r => { let A = []; r.sample(L.range(2, 60), r.int(7, 9)).forEach(x => A = L.heapInsert(A, x).arr); const x = r.pick(L.range(2, 70).filter(v => !A.includes(v) && v > A[A.length - 1]));
      const bad = A.slice(); const i = r.int(1, bad.length - 1); const p = (i - 1) >> 1; [bad[i], bad[p]] = [bad[p], bad[i]];
      const shape = L.heapTree(A); const sh = JSON.parse(JSON.stringify(shape)); if (sh[1]) { const leaf = sh[1][1] ? sh[1] : sh; leaf[1] = null; }
      const tA = L.isMaxHeapArr(bad) ? null : L.heapTree(bad);
      const checks = [{ t: tA || L.heapTree(A), ans: tA ? 'No: heap order is violated' : 'Yes, both properties hold', why: tA ? `Node ${bad[p]} has a child ${bad[i]} larger than itself.` : 'Complete and every parent ≥ its children.' }, { t: sh, ans: 'No: the shape is not complete', why: 'A level has a gap before the last level is filled from the left.' }];
      return D.buildHeap(A, x, { defs: true, checks, figs: checks.map((c, k) => `<figure>${L.drawTree(c.t)}<figcaption>(${'ab'[k]})</figcaption></figure>`).join(''), name: '(c)' }); } },
  hash_chain: { topic: 'q3x', title: 'Hash table with chaining: trace + theory', kinds: 'fill the table + written', source: 'Same type as DSA 2.12.2024 Q3', weight: 1.2,
    gen: r => { const m = r.pick([5, 7]); const base = r.int(0, m - 1); const keys = r.shuffle([base + m * r.int(1, 3), base + m * r.int(4, 6), r.int(1, 40), r.int(1, 40), base]).filter((v, i, a) => a.indexOf(v) === i).slice(0, r.int(4, 5));
      const ops = keys.map(k => ['ins', k]).concat([['del', r.pick(keys)]]); return D.buildHashChain(m, ops, { theory: r.sample(['coll', 'rehash', 'suha', 'const'], 2), alpha: true }); } },
  hash_linear: { topic: 'q3x', title: 'Open addressing with linear probing + tombstones', kinds: 'fill the table + order + written', source: 'Same type as DSA 4.12.2023 Q3 and 21.2.2019 Q3', weight: 1.3,
    gen: r => { const m = r.pick([7, 11, 13]); const home = r.int(0, m - 1); const keys = uniq([home, home + m, r.int(0, 3 * m), home + 2 * m, r.int(0, 3 * m)]).slice(0, 5);
      const ops = keys.slice(0, 4).map(k => ['ins', k]); const del = keys[r.int(0, 1)]; ops.push(['del', del]); if (keys[4] !== undefined) ops.push(['ins', keys[4]]);
      const fin = L.hashOpen(m, ops), present = keys.filter(k => fin[fin.length - 1].table.includes(k)); let sk, best = 0;
      present.forEach(k => { const len = L.hashOpen(m, ops.concat([['del', k]])).pop().probes.length; if (len > best) { best = len; sk = k; } });
      return D.buildHashOpen(m, ops, { kind: 'linear', searchKey: best >= 2 ? sk : undefined, theory: r.sample(['coll', 'rehash', 'pow2', 'probe', 'linear'], 2) }); } },
  hash_other: { topic: 'q3x', title: 'Quadratic probing or double hashing', kinds: 'fill the table', source: 'Course material: round 5 (probing)', weight: .5,
    gen: r => { if (r.chance(.5)) { const m = 8; const ks = uniq([r.int(0, 7), r.int(0, 7) + 8, r.int(0, 7) + 16, r.int(0, 30), r.int(0, 30)]).slice(0, 5); const k0 = ks[0] % 8; ks[1] = k0 + 8; ks[2] = k0 + 16;
      return D.buildHashOpen(m, uniq(ks).map(k => ['ins', k]), { kind: 'quadratic', theory: ['probe'] }); }
      const m = 11, h2 = k => 1 + (k % 7); const ks = uniq([r.int(0, 10), r.int(0, 10) + 11, r.int(0, 10) + 22, r.int(0, 40)]); ks[1] = ks[0] % 11 + 11;
      return D.buildHashOpen(m, uniq(ks).map(k => ['ins', k]), { kind: 'double', h2, h2desc: '1 + (x mod 7)', theory: ['probe'] }); } },
  dfs_topo: { topic: 'q4d', title: 'DFS trace, DFS tree and topological order', kinds: 'order + fill the table + written', source: 'Same type as DSA 1.12.2025 Q4 and 2.12.2024 Q4', weight: 1.4,
    gen: r => { const dag = r.chance(.6); const g = D.randGraph(r, { n: r.pick([8, 9]), dag, cyclic: !dag }); return D.buildDFS(g, { cycleQ: r.chance(.4), stamps: r.chance(.3) }); } },
  bfs_scc: { topic: 'q4b', title: 'BFS trace + strongly connected components', kinds: 'order + fill the table + multiple choice', source: 'Same type as DSA 4.12.2023 Q4 and 12.12.2018 Q4', weight: 1.1,
    gen: r => { const g = D.randGraph(r, { n: r.pick([6, 7, 8]), cyclic: true, check: (V, E) => { const c = L.scc(V, E).length; return c >= 2 && c <= V.length - 2; } }); return D.buildBFS(g, {}); } },
  dijkstra: { topic: 'q4w', title: 'Dijkstra trace table', kinds: 'order + fill the table + written', source: 'Same type as DSA 21.2.2019 Q4 and 12.12.2016 Q5',
    gen: r => { const g = D.randGraph(r, { n: r.pick([5, 6]), weighted: true, wmax: 9, density: 1.6, minReach: 0, check: (V, E) => { const d = L.dijkstra(V, E, 'a'); return d.order.length === V.length && !d.ties; } }); return D.buildDijkstra(g); } },
  mst: { topic: 'q4m', title: 'Minimum spanning tree: Kruskal and Prim', kinds: 'order + numeric', source: 'Course material: round 8 (not in recent exams)', weight: .4, gen: r => D.buildMST(r) },
  dp_jumps: { topic: 'q5', title: 'Count jump sequences (frog DP)', kinds: 'multiple choice + written + fill the table', source: 'Same type as DSA 1.12.2025 Q5', weight: 1.3,
    gen: r => D.buildJumps(r.pick([[2, 3], [1, 3], [1, 2], [2, 5], [1, 2, 3], [3, 4]]), r.int(10, 16)) },
  dp_rgb: { topic: 'q5', title: 'Count restricted rgb-strings', kinds: 'written + fill the table', source: 'Same type as DSA 12.12.2018 Q5',
    gen: r => D.buildRGB(r.int(4, 7), r.pick([['rg', 'gr'], ['rb', 'br'], ['gb', 'bg']])) },
  dp_dagcount: { topic: 'q5', title: 'Count s→t paths in a DAG', kinds: 'written + fill the table', source: 'Same type as DSA 4.12.2023 Q5', gen: r => D.buildDagCount(D.randDAG(r, 9)) },
  dp_daglong: { topic: 'q5', title: 'Longest path in a weighted DAG', kinds: 'written + fill the table', source: 'Same type as DSA 2.12.2024 Q5', gen: r => D.buildDagLongest(D.randDAG(r, 9, true)) },
  dp_lps: { topic: 'q5', title: 'Longest palindromic subsequence', kinds: 'written + fill the table + numeric', source: 'Same type as DSA 12.12.2016 Q4', weight: .6,
    gen: r => D.buildLPS(L.range(0, r.int(5, 7)).map(() => r.pick('abcd'.split(''))).join('')) },
  dp_coins: { topic: 'q5', title: 'Coin change: number of ways', kinds: 'written + fill the table', source: 'Course material: round 6 (change)', weight: .6,
    gen: r => D.buildCoins(r.int(7, 11), r.pick([[1, 2, 5], [1, 3, 4], [2, 3, 5], [1, 2, 3]])) },
  dp_knap: { topic: 'q5', title: '0/1 knapsack table', kinds: 'fill the table + numeric', source: 'Course material: round 6 (knapsack)', weight: .5,
    gen: r => { const n = 3; const items = L.range(0, n).map(() => [r.int(1, 5), r.int(2, 12)]); return D.buildKnap(r.int(6, 8), items); } },
  np_problem: { topic: 'q6n', title: 'NP definitions + "why is X in NP" + practical approach', kinds: 'written + rubric', source: 'Same type as DSA 2025 Q6 (colouring) and 2024 Q6 (dominating set)', weight: 1.4,
    gen: r => D.buildNP(r.pick(Object.keys(NP_PROBS))) },
  np_quick: { topic: 'q6n', title: 'P, NP, reductions: quick checks', kinds: 'multiple choice', source: 'Course material: round 10', weight: .6, gen: r => D.buildNPquick(r) },
  par_code: { topic: 'q6p', title: 'Parallel code: what it computes, work, span, improvement', kinds: 'multiple choice + written', source: 'Same type as DSA 2023 Q6, 2019 Q5, 2018 Q6', weight: 1.1,
    gen: r => D.buildPar(r.pick(['sum', 'max', 'dot', 'count', 'msort']), { fname: r.pick(['parX', 'g', 'parMax', 'f']) }) },
  par_num: { topic: 'q6p', title: 'Parallelism, Brent\'s bound and Amdahl\'s law', kinds: 'numeric', source: 'Course material: round 9', weight: .5, gen: r => D.buildParNum(r) },
  finish: { topic: 'q7', title: 'Finishing time', hidden: true, gen: () => ({ title: 'At what time did you finish answering the exam questions?', parts: [{ type: 'free', points: 1, note: 'A free point in every DSA exam: just write the clock time.' }], solution: [] }) }
};

XM.register({
  id: 'dsa', code: 'CS-A1140', name: 'Data Structures and Algorithms', short: 'DSA', accent: '#6FD3FF', arena: 'CS-A1140',
  bosses: ['Big O', 'The Pivot', 'Heap Titan', 'The Rotator', 'Collision Kraken', 'Memo Monolith', 'The Traverser', 'Path Oracle', 'The Multicore', 'The Intractable', 'The Examiner'],
  exam: { date: '2027-02-22T09:00:00', tentative: true, where: 'pen & paper, Mon 22.2.2027 (time and room: check Sisu)', format: 'Pen and paper, 3 h, no calculator or notes. 7 questions, 60 points.',
    rules: 'No calculator, no notes. "Running time" means the tightest O/Θ bound. Justify when asked.',
    notes: '<p>The same 7-question skeleton every year: <b>Q1</b> running times (10 p) · <b>Q2</b> sorting code (11–13 p, every year) · <b>Q3</b> BST/AVL, heap or hashing (8–11 p) · <b>Q4</b> graph traversal trace (11–14 p) · <b>Q5</b> design a DP (8 p) · <b>Q6</b> NP or parallel (8 p) · <b>Q7</b> finishing time (1 p).</p><p>Your A+ points are above the grade-5 limit, so <b>the exam alone sets your grade</b>: 30 % → 1, 40 % → 2, 55 % → 3, 70 % → 4, 85 % → 5.</p>' },
  grades: [[85, 5], [70, 4], [55, 3], [40, 2], [30, 1]],
  gradeNote: 'Grade from the exam % (your A+ points already exceed the grade-5 requirement).',
  topics: {
    q1: { name: 'Running times & code analysis', slot: 'Q1 · 10 p', weight: .9, freq: '6/6 papers' },
    q2: { name: 'Sorting: identify & analyse code', slot: 'Q2 · 11–13 p', weight: 1, freq: '6/6 papers' },
    q3t: { name: 'BST & AVL trees', slot: 'Q3 · 8–10 p', weight: .7, freq: '3/6 papers' },
    q3h: { name: 'Binary heaps', slot: 'Q3 · 10 p', weight: .4, freq: '1/6 papers' },
    q3x: { name: 'Hashing', slot: 'Q3 · 8–11 p', weight: .7, freq: '3/6 papers' },
    q4d: { name: 'DFS & topological order', slot: 'Q4 · 11–14 p', weight: .8, freq: '2/6 + topo 1' },
    q4b: { name: 'BFS & strongly connected components', slot: 'Q4 · 12 p', weight: .6, freq: '2/6 papers' },
    q4w: { name: 'Dijkstra', slot: 'Q4 · 10–12 p', weight: .6, freq: '2/6 papers' },
    q4m: { name: 'Minimum spanning trees', slot: 'round 8', weight: .15, freq: 'not in recent papers' },
    q5: { name: 'Dynamic programming', slot: 'Q5 · 8–10 p', weight: 1, freq: '5/6 papers' },
    q6n: { name: 'NP-completeness', slot: 'Q6 · 8 p', weight: .85, freq: '4/6 (2024, 2025)' },
    q6p: { name: 'Parallel work & span', slot: 'Q6 · 8 p', weight: .55, freq: '3/6 papers' }
  },
  templates: TPL,
  mock: { title: 'DSA mock exam', minutes: 180, points: 60, rules: 'Pen-and-paper rules: no notes, no calculator. Answer in the app or on paper, then mark yourself.',
    slots: [{ label: 'Q1 Running times / code analysis', points: 10, tpls: ['code_analysis', 'ops_table', 'amort_written'] },
      { label: 'Q2 Sorting code', points: 11, tpls: ['sort_identify'] },
      { label: 'Q3 Trees / heaps / hashing', points: 8, tpls: ['bst_ops', 'avl_insert', 'heap_ops', 'hash_chain', 'hash_linear'] },
      { label: 'Q4 Graph search', points: 14, tpls: ['dfs_topo', 'bfs_scc', 'dijkstra'] },
      { label: 'Q5 Dynamic programming', points: 8, tpls: ['dp_jumps', 'dp_rgb', 'dp_dagcount', 'dp_daglong', 'dp_lps'] },
      { label: 'Q6 NP-completeness / parallel', points: 8, tpls: ['np_problem', 'np_problem', 'par_code'] },
      { label: 'Q7 Finishing time', points: 1, tpls: ['finish'] }] },
  papers: []
});
})(typeof window !== 'undefined' ? window : globalThis);
