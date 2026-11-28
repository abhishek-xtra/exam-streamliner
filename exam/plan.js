/* Day-by-day plan shown under "Today" on the home screen (from README - Period 2 Exam Overview.md
   and each course's exam guide). Each task can link straight into a mode:
   {t: text, c: course id, go: 'practice' | 'exam' | 'papers' | 'course', kind: 'mock' | 'paper', paper: id} */
(function (G) {
const XM = G.XM;
XM.plan = [
  { from: '2026-11-17', to: '2026-11-18', tasks: [
    { t: 'TU-A1300: confirm your Midterm 2 registration for Wed 9.12, 17–19 in MyCourses (deadline 18.11).' },
    { t: 'Check in Sisu what time the BA1 exam is on 2.12.' },
    { t: 'ML: check that your EXAM slot on Fri 11.12 is booked (exam.aalto.fi).' } ] },
  { from: '2026-11-17', to: '2026-11-18', tasks: [
    { t: 'S&S moved to Mon 1.2.2027: check the S&S time and room in Sisu.' },
    { t: 'DSA Q2: identify-the-sort drills until every sort is automatic', c: 'dsa', go: 'practice' },
    { t: 'DSA: re-sit the 1.12.2025 paper question by question', c: 'dsa', go: 'papers' } ] },
  { from: '2026-11-19', to: '2026-11-20', tasks: [
    { t: 'DSA Q3: BST/AVL, heaps and hashing traces (smart practice serves the weak ones)', c: 'dsa', go: 'practice' },
    { t: 'DSA round 10 deadline 20.11' },
    { t: 'S&S (20 min): T1 Fourier series of a cosine sum', c: 'ss', go: 'practice' } ] },
  { from: '2026-11-21', to: '2026-11-22', tasks: [
    { t: 'DSA Q4: DFS / BFS / Dijkstra traces and topological orders', c: 'dsa', go: 'practice' },
    { t: 'S&S (20 min): T5 sampling / DFT bins and T6 first-order LTI', c: 'ss', go: 'study' } ] },
  { from: '2026-11-23', to: '2026-11-24', tasks: [
    { t: 'DSA Q5: one DP a day (frog, rgb, DAG paths, palindromes)', c: 'dsa', go: 'practice' },
    { t: 'BA1 Assignment 3 due Tue 24.11, 23:59' },
    { t: 'S&S (20 min): T2 pulse FT and T3 convolution', c: 'ss', go: 'practice' } ] },
  { from: '2026-11-25', to: '2026-11-25', tasks: [
    { t: 'DSA moved to Mon 22.2.2027 and BA1 is now the retake on Mon 1.2.2027 (same day as S&S): check both times and rooms in Sisu.' },
    { t: 'PAM moved to Mon 11.1.2027: check the PAM time and room in Sisu.' },
    { t: 'PAM: formula card (Little\'s law, bottleneck, EOQ, newsvendor)', c: 'pam', go: 'practice' } ] },
  { from: '2026-11-26', to: '2026-11-28', tasks: [
    { t: 'TU-A1300 group final report due 27.11; DSA extra round 27.11' },
    { t: 'TU-A1300: one generated case in Excel (colour rules, formulas only)', c: 'iem', go: 'practice' },
    { t: 'ML: rerun the 5 assignments as code-completion drills', c: 'ml', go: 'practice' } ] },
  { from: '2026-11-29', to: '2026-12-08', tasks: [
    { t: 'TU-A1300: one generated case a day in Excel (colour rules, formulas only)', c: 'iem', go: 'practice' },
    { t: 'ML: rerun the 5 assignments as code-completion drills', c: 'ml', go: 'practice' },
    { t: 'ML: one mock exam every other day', c: 'ml', go: 'exam', kind: 'mock' } ] },
  { from: '2026-12-08', to: '2026-12-08', tasks: [
    { t: 'TU-A1300: the Feb 2026 Midterm 2 again, timed (2 h)', c: 'iem', go: 'papers' } ] },
  { from: '2026-12-09', to: '2026-12-09', tasks: [
    { t: 'TU-A1300 Midterm 2, 17–19 (own laptop + Excel, paper formula sheet). Morning: one mock case.', c: 'iem', go: 'exam', kind: 'mock' } ] },
  { from: '2026-12-10', to: '2026-12-10', tasks: [
    { t: 'ML: last mock exam, then only weak spots', c: 'ml', go: 'exam', kind: 'mock' } ] },
  { from: '2026-12-11', to: '2026-12-11', tasks: [
    { t: 'ML retake (EXAM room, 2 h). Bring only your student card and know your Aalto username.', c: 'ml', go: 'course' } ] },
  { from: '2027-01-04', to: '2027-01-09', tasks: [
    { t: 'PAM: formula card again (Little\'s law, bottleneck, EOQ, newsvendor), then smart practice', c: 'pam', go: 'practice' },
    { t: 'PAM: case reflections (ARAPU, Run Like Clockwork, Baman, Sonae MC, Posti)', c: 'pam', go: 'practice' } ] },
  { from: '2027-01-10', to: '2027-01-10', tasks: [
    { t: 'Night before PAM: one mock exam, then the checklist — no new topics', c: 'pam', go: 'exam', kind: 'mock' } ] },
  { from: '2027-01-11', to: '2027-01-11', tasks: [
    { t: 'PAM exam (SchoolYear, closed book; time and room in Sisu)', c: 'pam', go: 'course' } ] },
  { from: '2027-01-12', to: '2027-01-24', tasks: [
    { t: 'BA1: formulation builder drills (indices → parameters → variables → objective → constraints)', c: 'ba1', go: 'practice' },
    { t: 'BA1: reading Excel sensitivity reports (shadow prices, allowable ranges)', c: 'ba1', go: 'practice' },
    { t: 'S&S (30 min): one topic a day (Fourier series, FT, convolution, sampling/DFT, LTI)', c: 'ss', go: 'practice' } ] },
  { from: '2027-01-25', to: '2027-01-30', tasks: [
    { t: 'S&S: one timed mock exam (26.8.2026 format), then only weak spots', c: 'ss', go: 'exam', kind: 'mock' },
    { t: 'BA1: one mock exam, alternate days with S&S', c: 'ba1', go: 'exam', kind: 'mock' } ] },
  { from: '2027-01-31', to: '2027-01-31', tasks: [
    { t: 'Night before S&S + BA1: weak spots only, check both times in Sisu — no new topics', c: 'ss', go: 'course' } ] },
  { from: '2027-02-01', to: '2027-02-01', tasks: [
    { t: 'S&S exam (time and room in Sisu; bring the equation sheet rules in your head: Parseval for FS is not on it)', c: 'ss', go: 'course' },
    { t: 'BA1 retake, same day (time and room in Sisu)', c: 'ba1', go: 'course' } ] },
  { from: '2027-02-02', to: '2027-02-07', tasks: [
    { t: 'DSA Q1–Q2: running times, then identify-the-sort drills until every sort is automatic', c: 'dsa', go: 'practice' },
    { t: 'DSA: re-sit the 1.12.2025 paper question by question', c: 'dsa', go: 'papers' } ] },
  { from: '2027-02-08', to: '2027-02-13', tasks: [
    { t: 'DSA Q3–Q4: BST/AVL, heaps, hashing, then DFS / BFS / Dijkstra traces', c: 'dsa', go: 'practice' },
    { t: 'DSA Q5–Q6: one DP a day, NP definitions and parallel work/span', c: 'dsa', go: 'practice' } ] },
  { from: '2027-02-14', to: '2027-02-20', tasks: [
    { t: 'DSA: one full timed paper a day: 2024, 2023, 2019, then mocks', c: 'dsa', go: 'papers' } ] },
  { from: '2027-02-21', to: '2027-02-21', tasks: [
    { t: 'Night before DSA: one mock exam in the morning, then only weak spots — no new topics', c: 'dsa', go: 'exam', kind: 'mock' } ] },
  { from: '2027-02-22', to: '2027-02-22', tasks: [
    { t: 'DSA exam (pen & paper, 3 h; time and room in Sisu). Warm up with two quick questions, no more.', c: 'dsa', go: 'practice' } ] }
];
})(typeof window !== 'undefined' ? window : globalThis);
