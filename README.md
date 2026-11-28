# Exam Streamliner — exam practice for the Period 2 exams

Open `index.html` in any modern browser (no install, no build step). For the Ask Claude tutor, run `python3 claude_bridge.py` and open http://localhost:8731. For the phone, run `python3 build.py` and open `dist/Exam Streamliner.html` in Safari.

**17.11.2026: the fighting-game arena was removed.** The app is now Exam mode only: exam countdown, Study Hall + Notes tab, smart practice, mock exams and past papers for DSA, PAM, TU-A1300, BA1, ML and S&S. Kept from the arena and ported into standalone files: read-aloud (`exam/tts.js`), Ask Claude (`exam/ai.js`, now sees the exam question or Study Hall page on screen), the light/dark theme (☀/☾ in the top bar) and the fonts/colours (`exam/base.css`). Removed: the level map, fights and 3D arena, the old level-by-level notes, the ML Code Lab, the Armory and coins (the practice screen keeps a thin HP "boss" strip). The full arena version is archived as `index (with arena).html`; the version before the exam rebuild is `index (before exam rebuild).html`.

**18.11.2026: redesign** after two references (mater.agency and a university site with a huge uppercase headline and colour tiles): light paper ground (#EBECE7) with ink text by default, dark mode on the moon/sun button; a heavy display face (Inter Tight 800–900) for headlines and the readable Atkinson Hyperlegible for everything you read; one pill-shaped button style; flat 20px tiles separated by tone steps instead of lines. Home is a board: the headline counts down to the next exam, the next exam is a big colour tile with a giant day count, "Today" is a lemon tile, and every course has its own colour pair and a glyph drawn from its subject (DSA tree, PAM process flow, TU-A1300 pie + ledger, BA1 feasible region, ML neurons, S&S wave). Course pages open with their colour tile. The skin is the "PAPER SKIN" section at the end of `exam/exam.css`; course colours and glyphs are `XM.SKIN` / `XM.glyph` in `exam/engine.js`.

**18.11.2026: motion** (`exam/motion.js`, after mater.agency): headline letters arrive one by one from grey to ink; intro paragraphs fill in word by word as they scroll into view; tiles, topics and Study Hall blocks rise in a staggered cascade; day counts count up; a ring cursor follows the pointer and grows over anything you can press (desktop only); pill buttons roll their label on hover; colour tiles tilt toward the pointer and course glyphs float; opening a course sweeps its colour across the screen. Exam and mock screens stay still. With "reduce motion" switched on in the system settings none of it runs and everything shows at once.

**18.11.2026: topic tiles.** Course topics are colour tiles instead of grey rows: deep course colour = asked almost every year, pastel = often, paper = sometimes; each shows its exam slot, a mastery ring, the big mastery %, past-paper frequency and question-type count. Study Hall blocks got identities: lemon "What the exam asks", numbered method steps, a mint worked-example band, highlighted key terms, ✕ traps.

**18.11.2026: banner.** The top of the screen is a deep ink-teal banner with rounded bottom corners: the wordmark, the six courses as chips with their own glyph (the current one fills with its colour), the mint Notes pill, the theme button, and a rolling countdown strip to every exam underneath (pauses on hover; hidden during mock exams; folds away when you scroll). At the top of Home the banner fills the whole screen (course glyphs pop in, "EXAM STREAMLINER" rises letter by letter, the next exam is named, "Scroll to start"). **The morph is driven by your scrolling:** scrolling down shrinks it into the top bar while the wordmark glides into the logo and the home content rises underneath; scrolling back up plays it in reverse. Opening the app starts at the full-screen banner; returning to Home from another screen lands on the dashboard (the banner is still above if you scroll up). "Reduce motion" removes it.

**24.11.2026: flashcards, "Deck Stack" look.** A flashcard session is three columns (phone: one): the card in the course colour with the course glyph faint in its corner, two straight pile strips under it, an "Again" count on the left and a "Known" count on the right, three pills under the card (Again · Flip card · Got it, after flipping the four ratings Again/Hard/Good/Easy) and a row of five deck tiles at the bottom (the current one first, then the decks with the most due cards; click one to switch). Swipe or drag the card left for Again, right for Good; a tap flips. Keys: Space/Enter flip, 1 Again and 3 Got it from the front, 1–4 rate after flipping. The rated card slides out and the next one rises from the pile (off with reduce motion). Spaced repetition and saves are unchanged.

## Exam mode (rebuild for the Period 2 exams, from 17.11.2026)
The app opens on an exam-countdown home screen, then per course **Study Hall**, **Smart practice**, **Mock exam** and **Past papers**.
The previous version is kept as `index (before exam rebuild).html`.

**Files**
- `exam/lib.js`: seeded random numbers, formatting, and the algorithms that compute every answer (hashing with tombstones, 0-based heaps, BST delete with the left-subtree maximum, AVL with rotations, BFS/DFS with timestamps, SCC, Dijkstra, DAG DP, frog/rgb/LPS/coins/knapsack DP, sorting traces) plus SVG drawing (trees, graphs, arrays, plots).
- `exam/engine.js`: the question types, grading, spaced repetition, mock and past-paper runner, home screen. `exam/exam.css`: its styles (follows the light/dark theme).
- `exam/courses/<course>.js`: the templates of one course; `dsa-papers.js`: the DSA past papers. `exam/plan.js`: the day-by-day "Today" list.
- `tests/run.js` (Node: every template × many seeds, correct answer = full points, blank ≠ full points, brute-force cross-checks of the algorithms) and `tests/ui.js` (headless Chrome at 1440 px and 390 px: fills the correct answer through the UI, expects full points, no horizontal overflow, runs a whole mock exam). Run `node tests/run.js` and `cd tests && node ui.js dsa 2`.

**Question format.** A question is `{title, source, topic, figure, prompt, parts, solution, traps}`. Part types: `mcq` · `numeric` (tolerance `tol` absolute / `rtol` relative, default ±0.5 %) · `text` · `order` (tap to order; optional `check` accepts any valid answer, e.g. topological orders) · `table` (cell by cell; empty-answer cells only penalise wrong entries) · `written` (model answer + rubric with real points, self-marked) · `code` (fill the blanks) · `blocks` (model building: pick the right variables/objective/constraints) · `free`. A template is `{topic, title, source, gen(rng) → question}`; the same seed always gives the same question.

**Modes.** *Smart practice* picks templates by past-paper frequency × weakness × due date (spaced repetition, stored in `localStorage` key `xm.v1`). *Mock exam* has the real slots, points and timer, survives a reload, then you self-mark the written parts and get the grade from the course thresholds. *Past papers* can be sat timed or question by question. Coins earned in exam mode go to the Armory.

### Exam-structured Study Hall (17.11.2026)
- `exam/study/<course>.js`: one Study Hall per course, ordered like that course's exam guide (DSA: Q1 running times → Q1 code analysis → Q2 sorting → Q3 BST/AVL, heaps, hashing → Q4 BFS/SCC, DFS/topological order, Dijkstra → Q5 DP → Q6 NP, parallel → night-before checklist). PAM, TU-A1300 (Q1–Q11 of the Feb 2026 paper), BA1 (modelling recipe → each model family → theory), ML (Part 1 strategy, the knob table, L1–L10, Part 2 coding) and S&S (conventions, P1 MCQ, T1–T8) follow the same idea. 69 pages.
- Each page: what the exam asks (with the past-paper examples) · what you need to know (tables, formulas, course conventions) · method step by step · a worked past-paper example · where marks get lost · check-yourself questions · "Practise this" buttons into the matching generators. Pages get a tick only when you press **Mark as read** at the end of the page (press again to undo); opening a page does not count.
- **Focus reader and read-aloud** (restored): every piece of a page is its own block. Tap a block to zoom it full screen and scroll/swipe/arrow-key one block at a time (Esc closes). Every block has a 🔊 button that reads it with the browser's voices (the game's read-aloud engine: word highlighting, music ducked); voice and speed sit at the top of each page, and the speed bar appears while it reads.
- **Notes tab** (📖 in the Exam-mode top bar): all six Study Halls in one index with read ticks, plus a search across every note.
- Tests: `node tests/run.js` checks every page's links and figures; `cd tests && node study-ui.js` renders every page at 390 and 1440 px.

### CS-A1140 DSA (exam Mon 22.2.2027, moved from 30.11.2026) — done 17.11
- **28 templates** in the 7 exam slots, each generating new numbers. Q1: operation-cost tables, 6 code-analysis snippets (2025 style), amortized/queue written answers, ArrayBuffer copy counts. Q2: identify-the-sort for 6 Scala sorts (selection, insertion, merge with/without the early-exit line, Lomuto quicksort, heapsort, LSD radix) + sorting traces. Q3: BST insert/delete (pick the resulting tree), AVL rotations, heap array/insert/remove-max, chaining, linear probing with tombstones and search probes, quadratic/double hashing. Q4: DFS (+ timestamps, topological order, cycle test), BFS + SCC, Dijkstra tables, MST. Q5: frog jumps, rgb-strings, DAG path counting, longest DAG path, palindromic subsequence, coin change, knapsack. Q6: NP definitions + "why is X in NP" for 10 problems, P/NP quick checks, parallel work/span for 5 programs, Brent/Amdahl numbers.
- **6 past papers** (1.12.2025, 2.12.2024 translated, 4.12.2023, 21.2.2019, 12.12.2018, 12.12.2016) with the exams' own trees, graphs and code, read from the PDF images. The 2023 DAG (Q5) comes from a blurry photo and is marked so.
- **Mock exam**: 7 slots, 10/11/8/14/8/8/1 = 60 p, 3 h, grade 30/40/55/70/85 %.
- Parts in the generated bank (one sample each): 39 multiple choice, 30 written + rubric, 21 tables, 10 numeric, 7 order, 1 free. Past papers: 90 multiple choice, 73 written, 23 tables, 10 order, 2 numeric.
- Tests: 5 600 generated questions + all paper questions pass; 300 rounds of brute-force cross-checks pass; UI test passes at desktop and phone width.

### 35C03000 Process Analysis and Management (exam Mon 11.1.2027, moved from 1.12.2026) — done 17.11
- No past papers exist; built on the lecture-1 exam format (multiple choice + simple calculations + open questions + reflective essay) and the lecture slides.
- **22 templates**: 12 calculation generators (Little's law in 3 directions, capacity / bottleneck / labour utilisation as in the Sarah–Anne–Thomas example, multi-server service bottleneck, TOC product mix by margin per bottleneck minute, line balancing with the longest-work-element rule, EOQ + reorder point, safety stock, newsvendor single-season and weekly, value of lead time with lognormal demand, service level from waiting times, queue waiting time, chase vs level cost) · 7 concept multiple-choice sets per lecture (~45 questions) · open questions (8, with rubrics) · reflective essays on 10 cases/simulations (rubric 10 p).
- z-values are read like the printed z-table (2 decimals). Checked against the slide examples (GAP 146.25, Alepa 14, z-table readings, EOQ).
- Mock: 7 slots, 50 p, 3 h. The ARAPU, Run Like Clockwork and Sonae MC texts are not in the folder, so their essay rubrics use the concepts of the lecture each case belonged to. The Baman PDF forbids LLM use, so none of its content is in the app.

### TU-A1300 Midterm 2 (Wed 2.12.2026) — done 17.11
- **Case generator**: a new company (opening balance, a year of events, expansion investment, cannibalising second outlet) with the same 11 questions and points (25 p) as 19.2.2026. Conventions from the formula sheet and the course Excel examples (COGS = units sold × material, inventories rolled forward at material cost, interest on opening interest-bearing debt, critical price = other operating expenses / units sold + material, FCF = EBIT(1 − t) + depreciation). Every generated balance sheet balances (tested).
- The real **19.2.2026 paper** (Leipiintynyt Oy); answers match a hand calculation (Q1 5.47 €, Q3 52 240 €, Q4 424 240 €, Q5 17.48 %, Q6 57.25 %, Q7 5.14 %, Q8 0.7722, Q9 21 925.33 €, Q10 5 065.82 €, Q11 74 025.79 €).
- The worked solution shows the whole Excel sheet with the colour rules (yellow given, blue formulas, green answers). Drills: income statement, closing balance + cash flow, key ratios, investment table, cannibalisation, discount factors, written IRR/payback/sunk-cost questions. 8 templates; mock 25 p, 2 h.

### ISM-C1004 Business Analytics 1 (retake Mon 1.2.2027, time: check Sisu) — done 17.11
- No past papers; built from the lecture examples. `lib.js` has a small LP solver (vertex enumeration) and computes Excel-style **sensitivity reports** (final value, reduced cost, shadow price, allowable increase/decrease, 1E+30); checked against the Iron Works and "extra example" slides.
- **18 templates**: formulation builder (product mix, transportation, assignment, capital budgeting, fixed charge with big-M), sensitivity-report reading, dual, graphical LP (drawn feasible region), transshipment, binary logic constraints, LP relaxation vs integer optimum, scenario Markowitz, Pareto efficiency + weighted sum, theory sets (LP, sensitivity, networks, MILP, NLP, MOP), written theory. Mock 50 p. Nothing is based on Assignment 3.

### CS-C3240 Machine Learning retake (~10.12.2026) — done 17.11
- **39 templates**: your **50 MCQs** (from ML_Trends_Notes_and_50_MCQs.pdf, with their reasons) per lecture · "turn the knob" trend questions (18 knobs from the trend table) · **18 calculation generators** (confusion-matrix metrics, conv output size and parameters, entropy / information gain, tf-idf, cosine, softmax with temperature, MSE/MAE/ridge, a gradient-descent step, k-NN, a K-means iteration, PCA explained variance, Bayes, MLE, UCB, Q-learning update, ε-greedy, perplexity, discounted return) · **12 code-completion cells** mirroring Assignments 1–5 (scikit-learn / numpy) · predict-the-output.
- Mock: 20 MCQ × 2 p + 3 coding × 5 p = 55 p, 2 h. The arena's Code Lab (30 runnable exercises) is unchanged.

### ELEC-A7200 Signals and Systems (optional retake) — done 17.11
- **9 generators** for the playbook templates T1–T8 (Fourier series + Parseval, pulse FT, convolution, Gram–Schmidt, sampling/DFT/aliasing, first-order LTI, non-linear harmonics/THD and Butterworth order, band-limited noise) + the new 6-question multiple-choice warm-up. Equation-sheet conventions; closed forms checked against numeric integration.
- Mock in the 26.8.2026 format (5 × 6 p). Not done: re-sitting the S&S papers question by question in exam mode (the papers need their plotted figures transcribed); the arena's round 11 still has model answers for three of them.

### Phone version
`python3 build.py` writes `dist/Exam Streamliner.html`, one self-contained file (scripts and styles inlined). AirDrop it or put it in iCloud Drive and open it in Safari. Exam mode works offline; the 3D arena needs internet for three.js. Progress is saved per browser, so the phone and the Mac keep separate progress.


---

## History: the former arena (removed 17.11.2026, archived in `index (with arena).html`)

A fighting-game study trainer. Open `index.html` in any modern browser; no install or build step. For the Ask Claude tutor, run `python3 claude_bridge.py` and open http://localhost:8731 (see below).
It holds three courses; switch with the course button next to the logo. Each course keeps its own progress in the browser's localStorage.

- **CS-C3240 Machine Learning** ("Loss Arena"), exam edition: lectures 1–10, Assignments 1–5, a Mock Exam in the real format and a Code Lab for the Jupyter coding quiz
- **CS-A1140 Data Structures and Algorithms** ("Big-O Arena"), built from the 2026 A+ materials and lecture notes, rounds 1–10, plus a past-paper workshop (round 11)
- **ELEC-A7200 Signals and Systems** ("Fourier Arena"), built from the past exams (midterm 2023, exams 27.8.2025 and 2.2.2026) and their equation sheet, rounds 1–11

## Tech
Single file: HTML + CSS + JavaScript.
- three.js (loaded from the jsDelivr CDN) renders the 3D arena: fighters, bosses, lighting, particles and the loss-landscape backdrop.
  Without internet or WebGL the game falls back to the original 2D Canvas renderer.
- A 2D canvas layered on top draws damage numbers and banners; SVG draws icons and the route map.
- Web Audio generates all music and sound effects live in code (no audio files): `SFX` holds the effects, `Music` the three tracks
  (route theme, battle theme that speeds up per boss and adds tension at low HP, Study Hall lo-fi). Audio settings are saved in the browser.
- Fonts load from Google Fonts (system fonts offline).
- Light mode: the sun/moon button in the top bar switches themes; the choice is saved in the browser (`lossarena.theme`). The light colours live in the `<style id="theme-light">` block. The 3D stage, fight arena and Study Hall diagrams stay dark in both themes.

## CS-A1140 past-paper update (2.11.2026)
- Built from the exams of 12.12.2016, 12.12.2018, 21.2.2019, 11.12.2019 and 1.12.2025. Every problem in them is solved in round 11, with the exam's own trees, graphs and code, and the study pages give the full model answers.
- New diagrams (`DSAX` helpers: `tree`, `graph`): AVL rotation on 2025 tree B, DFS on the 2025 graph, Dijkstra on the 2016 graph, the frog DP table, linear probing with m = 11, the operation-cost table and the code patterns.
- 12 trivia questions in rounds 1–10 (JVM warm-up, Git, Karp, library names…) were replaced with exam-style ones on the same topic, and 9 study pages gained an exam card. 78 new questions in total.
- Round study pages now keep every study field (`big`, `terms`, `check`, `exam`), and a round boss may set its own `model`.
- The 2019 tree B is covered by pencil marks on the photo, so its AVL insertion is not included; the other trees from 2016, 2018 and 2025 cover the same cases.

## Signals and Systems course, no fight timer (2.11.2026)
- **No clock in fights.** The answer timer is gone (the HUD clock, the countdown and the "too slow" timeout). Critical hits now land on **every 3rd hit in a row** instead of answers under 10 seconds. The **Early Stopping** perk (+8 s) became "your first wrong answer in each fight costs no HP".
- **ELEC-A7200 Signals and Systems** ("Fourier Arena"): 46 stages in 11 rounds, 298 unique questions (bosses also replay 5 from their round), a deep Study Hall page (big picture, step cards with examples and traps, key terms, check yourself, exam tip) and an animated diagram on every page. Content lives in `WORLDS_SS` (rounds, levels, questions and study pages together), `DG_SS` (diagrams, drawn with the `SGD` plot helpers) and is flattened into `BOSSES_SS` / `STUDY_SS`. Round bosses reuse existing 3D models (`model`), recoloured. Each boss has its own questions plus a mix from its round.
- Round 11 ("Past-paper workshop") has full model answers for every problem in the three past papers.
- Checked against the A+ Summer 2026 chapters. Six levels cover A+ topics the past papers skip: complex numbers and dBm (1.3–1.4), energy spectrum and bandwidth (5.2, 6.2), discrete-time LTI systems (8.4), distortion and group delay (9.2), modulation (11.1), and random variables, SNR and quantization noise (12.1–12.2).

## ELEC-A7200 levels (46)
- **R1 Signals and their properties:** Signal Sprite (u, δ, rect, tria, sinc) · Shift Shade (shifting, scaling, pulses from steps) · Energy Eater (energy, power, dB) · Complex Compass (complex numbers, dBm) · **Boss: The Waveform**
- **R2 Fourier series:** Harmonic Harpy (coefficients with Euler) · Spectrum Seer (two-sided amplitude and phase spectra) · Parseval Phantom (power spectra) · **Boss: The Line Spectrum**
- **R3 Fourier transform:** Integral Imp (definition, table) · Property Pixie (theorems) · Slope Serpent (derivative trick for trapezoids and triangles) · Rayleigh Reaper (energy spectrum, 95 % bandwidth, transforms of periodic signals) · **Boss: Sinc Sovereign**
- **R4 LTI systems and convolution:** Linear Lynx (LTI, impulse and step response) · Flip-and-Slide Fiend (convolution integrals) · Response Raven (H(f), cosines through systems, frequency-domain convolution) · Difference Demon (discrete-time LTI, z-transform) · Group Delay Ghoul (distortion, group delay) · **Boss: The Convolver**
- **R5 Signal space and Gram–Schmidt:** Inner Product Imp · Gram–Schmidt Golem · **Boss: The Orthonormal**
- **R6 Sampling and aliasing:** Sample Sprite (Nyquist) · Alias Wraith (folding, possible original frequencies) · **Boss: The Aliaser**
- **R7 DFT and FFT:** Bin Banshee (bins and frequencies) · Peak Reader (amplitude from peaks, Parseval) · **Boss: The FFT**
- **R8 Filters and the Laplace transform:** Butterworth Bat (dB, minimum order) · Laplace Lich (transfer functions, poles) · **Boss: The Filter Bank**
- **R9 Modulation and nonlinear systems:** Carrier Crow (DSB, AM, PM, FM) · Cubic Cyclops (harmonics from x², x³) · Distortion Djinn (d_n, d_tot, THD) · **Boss: The Overdrive**
- **R10 Random signals and noise:** Gauss Ghost (random variables, thermal noise, SNR, quantization) · Noise Nymph (WSS, autocorrelation) · Spectral Specter (PSD, Wiener–Khinchin) · **Boss: White Noise**
- **R11 Past-paper workshop:** Series Sentinel · Pulse Paladin · Basis Breaker · Spectrum Sniper · System Seer · **Boss: The Examiner**

## Readability pass (2.11.2026)
- One plain, highly legible font everywhere: **Atkinson Hyperlegible Next** (designed for low-vision readers). Code in the Code Lab uses **Atkinson Hyperlegible Mono**. The serif headlines, Geist and the spaced-out ALL-CAPS labels are gone; headings are plain bold.
- Bigger text: Study Hall and Code Lab reading text is 17px with ~68 characters per line, answer buttons 16.5px, and no label is smaller than 12.5px. Secondary (grey) text has more contrast in both themes.
- Bigger click targets: top-bar buttons are 40px, answer buttons are at least 56px tall, Armory chips are larger.
- On phones the round labels in the Study Hall / Code Lab tab row read left to right instead of being rotated and cut off.
- This is the "READABILITY PASS" section at the end of the `<style id="premium">` block.

## Premium study theme (2.11.2026)
- One `<style id="premium">` block, loaded after all the others, re-tunes the whole UI for a calmer, more premium study look: graphite surfaces with hairline borders, one violet accent (`--brand`), quieter glass and ambient light with a faint grain, and a warm "paper" light mode.
- Type: **Instrument Serif** for headlines (level names, Study Hall titles, results), **Geist** for UI and reading text, **Geist Mono** for labels. Bungee is still loaded only for the canvas banners in fights. The logo is now a serif wordmark ("Loss *Arena*", "Big-O *Arena*").
- Buttons are flat-gradient pills without the arcade press shadow; the Fight button uses the accent instead of red.
- Study Hall reads like a long-form article: bigger body text (16–17px, line-height ~1.7), a quiet sidebar with an accent bar on the selected page, cards with soft shadows, and key terms underlined in the accent instead of a yellow marker.
- The 3D stage, fight arena and diagrams stay dark in both themes (they now use the new dark palette).
- **Code Lab**: the editor looks like a real IDE (window dots in the header, a near-black code area, a violet caret); test output shows a green or red bar for pass/fail; the CODE IT / FIX labels are soft tinted tags. In light mode the editor turns white like a notebook.
- **Armory**: a quieter tab switcher, selected chips and swatches use the violet accent instead of filled mint, item cards are flat with a coloured edge when selected, and item names use the serif.

## Liquid Glass UI, Armory and performance (15.10.2026)
- **Liquid Glass look** (after Apple's WWDC25 design language): the `<style id="liquid-glass">` block. Floating surfaces (top bar, panels, question panel, popovers, result sheets) are translucent blurred glass over slowly drifting colour orbs (`.ambient`), with a bright edge highlight that follows the mouse (`--mx/--my`, set by the `LG_SEL` pointer handler). Controls are capsules with springy hover/press motion; popovers "morph" open and sheets "materialise". Small repeated items (answers, tabs, map nodes) fake the glass without `backdrop-filter`, to keep it cheap. "Reduce transparency" gives solid surfaces; "reduce motion" turns animation off. The top bar stays pinned while scrolling; on phones the help button moves into the audio menu.
- **Armory and coins**: the coin button in the top bar opens the Armory (`#scr-armory`). `ITEMS` lists 28 items in four slots (`SLOTS`: outfit, headgear, back, weapon); the first of each slot is free. Coins and gear are shared by both courses and saved as `lossarena.wardrobe` (`WARD`). Earning: 2 coins per correct answer, plus 8 + 3 × tier, 4 per star and 25 for a first clear on a win; +10 per Study page read, +30 per Code Lab exercise. A one-time welcome bonus (150 + 8 per star already earned, max 800) is given on first load. Tap an item to try it on in the 3D preview (drag to rotate), then buy or equip it.
- **Fighter**: `buildHero(loadout)` builds the armoured fighter from the equipped items (`WPN`, `HEADS`, `BACKS` hold the part builders). Melee weapons (`melee:true`) wind up, dash in and slash the boss; the others fire bolts from the weapon tip. Your Shadow (the Dojo boss) copies your gear.
- **Look (free)**: the first Armory tab changes hair style (`HAIR`, 8 styles), hair colour, eye colour and skin tone (swatches plus a custom colour picker, and a Shuffle button); the camera zooms to the face while it is open. Saved in `WARD.look`. The fighter has a modelled body (smooth torso, knee and elbow joints, gloved hands, boots), a face with blinking eyes, brows and a mouth, and hair that sways.
- **Colour**: three.js colour management is on, so hex colours render as designed (they used to look washed out), and a small generated reflection environment gives metal and glass something to reflect.
- **Bosses**: every model gets a rim light (`addRim`). Round bosses and specials also get a rotating rune circle, a back glow, rising embers and one flair (floating shard crown, orbiting blades or a spiked halo); bosses drop in with a bounce at the start of a fight.
- **Performance**: the 3D stage only renders while it is visible (not during Study Hall / Code Lab, and not when the map stage is scrolled off screen); the pixel ratio drops automatically if frames run slow; idle particle buffers are not re-uploaded; the preview overlay canvas is not redrawn when nothing changed.

## Dark arena and full-screen fights (15.10.2026)
- **Arena** (in `init3D`): a cracked stone dais with glowing ember seams and a rune ring, broken pillars, braziers with live fire, a mountain ring under a blood-red eclipse, falling ash and rising embers. Moonlight plus firelight replace the old purple synthwave stage. The loss-curve hologram was removed from the 3D scene.
- **Fights fill the screen**: `body.fighting` hides the top bar; the arena is a fixed full-screen layer; the HP bars and the question panel float over it as dark glass. The camera is a cinematic 3/4 view from behind the fighter (it swings further behind on tall phone screens), sweeps in at the start, closes in on a K.O., and is offset (`fightView`, measured with a ResizeObserver) so the fighters stay framed above the question panel. On phones the panel scrolls to the feedback after each answer.
- **Evil bosses**: `corrupt()` re-skins every boss model as dark iron, obsidian and old bone, turns its lights and pupils into burning eyes and ember seams in the boss's own hue (`evilGlow`), and `addSpikes()` grows iron spikes out of the model's real surface (by raycasting). Round bosses also get one signature piece from `FLAIRS`: giant horns, orbiting chains, torn wings or an iron thorn crown, plus dark smoke and embers at their feet.
- **Your fighter**: grimmer armour palettes (Ashen Wanderer, Crimson Ronin, Forest Warden, Frostbound, Ember Lord…), a fur mantle and spiked pauldrons, a smaller head, heavy-lidded eyes and a stern brow. New Look options: **Beard** (clean, stubble, goatee, full) and **War paint** (Spartan stripe, war mask, battle scar, glowing runes), plus an ashen skin tone. Headgear and back items were redesigned to match (Iron Circlet, Wolf Pelt, Pilgrim Hood, Spartan Crest, Thorn Crown, Burning Halo; Battle Sash, Tattered Cloak, War Banner, Ashen Wings). Item ids are unchanged, so anything already bought stays owned.

## Organic hair and headgear (15.10.2026)
- Hair, beards, brows, the fur mantle, the Spartan plume, horns and the thorn crown are built from `strand()` (smooth tubes that taper along a curve and can lie flat against the head) and `shell()` (a scalp/jaw shell that rises out of the skin only where a density function says, giving soft hairlines). `lock()` combs a strand over the scalp and lets it fall; `braid()` builds plaits.
- Hair styles (`HAIR`): short, spiky, long, ponytail, bun, Viking braid (new), mohawk, buzz cut, bald. Beards (`beardFor`): stubble, goatee, full, braided (new).
- The Headgear tab now zooms the Armory camera to the face, like the Look tab.
- **Leviathan Axe** (weapon, 600 coins, `makeAxe`): a frost axe with a leather-wrapped haft, crescent blade, icy edge and pulsing runes. It is a thrown weapon (`thrown:true`): on a hit it spins into the boss and flies back to your hand (`toss` in `init3D`).
- Fix: the audio and course pop-ups (and the toast) float again; the glass styling had pushed them into the top bar.

## Study Hall focus reader (16.10.2026)
Click any block in a Study Hall page (big picture, diagram, step cards, key terms, check yourself, exam tip) and it zooms out of the page to fill the screen. Scroll (or use the arrow keys, Page Up/Down, Space) to move one block at a time; the bar shows the topic and "4 / 12", and the dots on the right jump to any block. Esc, the close button or a click beside the card zooms it back into the page, which scrolls to the block you were reading and briefly highlights it. Code: `fzOpen`, `fzGo`, `fzClose` (FLIP animation with the Web Animations API) and the `#focus` overlay.

## More visual cues in the ML Study Hall (16.10.2026)
- Every CS-C3240 Study Hall page now has an animated diagram: 22 new ones (types of learning, feature vectors, NumPy shapes, data splits and k-fold, scikit-learn + confusion matrix, standardisation, correlation, curse of dimensionality, kernel lift, parametric vs non-parametric, k-d tree, bagging/random forest, backpropagation, label spreading, naive Bayes, ε-greedy, bandit → full RL, Frozen Lake values, word embeddings, autoregressive generation, BERT/GPT/T5, Assignment 5 pipeline). They live in the `Object.assign(DG_ML,…)` block after the round flattening (built with the `DGH` helpers); captions are in `DG_CAP`.
- Page cues: icons on The big picture, Example, Don't mix up, Key terms, Check yourself and In the exam; bold key terms get a highlighter stroke; step cards are linked by a numbered timeline with a progress bar per step; formulas get an ƒ badge.

## Ask Claude: AI tutor (21.10.2026)
- **The button**: a sparkle button at the bottom right (top right during a fight) opens a chat panel. Claude can see what you are on: the current fight question and options (plus the right answer and explanation once you have answered), the Study Hall or Code Lab page, the focus reader, or any text you highlighted before clicking. The chip above the input shows what is sent; click it to leave the screen out. Quick prompts change with the screen. The fight clock pauses while the panel is open, and keys typed in the chat never answer questions.
- **Your own Claude account, no API key**: start the game with `python3 claude_bridge.py` (instead of `python3 -m http.server`) and open `http://localhost:8731`. The bridge runs the Claude Code CLI you are signed in to, so questions use your Pro/Max plan limits. Pick Opus 5.5, Sonnet 5.5 or Haiku 5.5 in the panel (saved as `lossarena.ai`). One-time setup: install Claude Code and run `claude` → `/login`. The bridge only listens on 127.0.0.1, only answers this page, strips any `ANTHROPIC_API_KEY` from the environment, and runs Claude with no tools in an empty temp folder.
- **Starting over**: the audio menu's Progress section has **Reset all progress**. After a confirmation it deletes every course save (XP, levels, stars, cleared stages, Study Hall pages read, Code Lab work) and the shared coins and gear (`lossarena.wardrobe`), then reloads, so the game starts like the first time (including the 150-coin welcome bonus). Settings are kept: theme, audio and read-aloud, the Ask Claude model and the last course (`KEEP_ON_RESET`). Progress is saved per address, so resetting the file version does not reset `http://localhost:8731`, and the other way round.
- **Moving progress**: browsers keep saves per address, so the game opened as a file and the game at `http://localhost:8731` have separate progress. The audio menu has a Progress section: opened as a file it offers "Open with Ask Claude (keeps progress)", which carries every `lossarena.*` key over in the URL #hash; anywhere, "Copy progress code" / "Load progress code" move it by hand.
- **Without the bridge** (e.g. `index.html` opened as a file), sending opens the question with its context in a new claude.ai chat, which runs on whatever account is signed in there.
- Code: the `<style id="ai-tutor">` block, the `#ai-fab` / `#ai-panel` markup and the "Ask Claude" section of the script (`aiContext`, `aiSend`, `aiHandoff`, `aiMd`).

## Read aloud in the Study Hall (23.10.2026)
Every Study Hall block (big picture, diagram caption, step cards, key terms, check yourself, exam tip) has a speaker button in its top-right corner. It reads the block with the browser's built-in speech (Web Speech API, works offline, no audio files): the block glows, the button shows sound bars, and each word is highlighted as it is spoken (CSS Custom Highlight API; browsers without it just skip the highlight). Maths symbols are spoken as words (θ → "theta", ≈ → "approximately", x² → "x squared"), and hidden "Check yourself" answers are only read once opened. Click the button again (or Esc) to stop; changing page or block stops it too. Music is turned down while it talks. The audio menu has a **Read aloud** section to pick the voice and speed (saved in `lossarena.audio`). Code: `ttsCollect`, `ttsPlay`, `ttsStop`, `SAY_MAP`.

## Where things live in index.html
- `COURSES` — one entry per course: its bosses, study notes, diagrams, rank names, perk names, save key and a few labels. `setCourse()` switches between them.
- `BOSSES_ML`, `BOSSES_DSA` — the playable levels of each course, built from `WORLDS_ML` (54 levels) and `WORLDS_DSA` (47 levels): 10 rounds each, every round ending in its boss. Each boss has `name`, `topic`, `tier`, `atk` (damage per miss), `color` and `qs` (questions).
- A question: `{q, a:[correct, wrong, wrong, wrong], hint, why}`. The first answer is always the correct one; order is shuffled at runtime.
- `STUDY_ML_DEEP` — beginner-friendly Study Hall pages for all 48 ML levels (not the round-boss reviews): a plain-language big picture, step-by-step cards with examples and "don't mix up" traps, key terms, self-check questions and an exam tip. Merged over `STUDY_ML` after the rounds are flattened.
- `STUDY_ML` / `STUDY_DSA` and `DG_ML` / `DG_DSA` — the Study Hall notes and animated SVG diagrams, keyed by level id (a diagram is optional).
- `WORLDS_ML`, `WORLDS_DSA` — each round: name, colour, boss id and its levels (questions + study page together). Adding a level here adds it to the map, fights and Study Hall.
- `BUILD` — the 3D boss models (one builder per boss; DSA levels reuse their round boss's model via `model`, recoloured and smaller); `buildHero` is your fighter.
- `SPECIALS` — the Dojo (replays missed questions) and The Exam (12 random questions from cleared stages), shared by both courses, plus the ML-only Mock Exam (`course:'CS-C3240'`): 20 questions, two per lecture, one try each, scored out of 40 like the real multiple-choice quiz.
- `LAB_ML` — the Code Lab exercises (30): `{id, round, kind:'code'|'fix', title, src, task, hint, pkgs, starter, solution, tests}`. Tests run in the browser with Pyodide (loaded from jsDelivr on the first run; needs internet). Every solution passes its tests and every starter fails them.
- `PERKS`, `xpNeed()` — progression tuning.

## Adding another course
Add `BOSSES_X`, `STUDY_X`, `DG_X` and a `BUILD` model for each new boss id, then add an entry to `COURSES` with a new `saveKey`.

## CS-C3240 levels (58)
Built from the 2026 course: lecture slides 1–10, Assignments 1–5 (JupyterHub) and the exam page (20 multiple-choice questions for 40 points + 3 coding questions for 15 points).
Each round also has a code-reading level for the coding questions. Rounds 9–10 were rebuilt from the lecture 9–10 slides and Assignment 5 in October 2026.

- **R1 Introduction & features:** Supervision Sphinx (types of learning) · Feature Forge (data to features) · Word Weaver (text features, tf-idf) · Edge Sprite (image features, convolution) · Array Imp (NumPy & pandas) · **Boss: The Raw Datapoint**
- **R2 Regression:** Residual Rat (loss functions) · Least Squares (normal equations) · Descent Drake (gradient descent) · Poly Wraith (polynomial regression, overfitting) · The Overfit Ogre (validation, bias–variance, learning curves) · **Boss: Gradient Golem**
- **R3 Classification:** Logit Lizard (logistic regression) · Margin Mantis (SVMs) · Bootstrap Bat (data splits, augmentation) · Confusion Crab (metrics) · Scikit Sprite (scikit-learn classification) · **Boss: Sigmoid Serpent**
- **R4 Feature learning:** Scaler Slime (preprocessing) · Filter Fox (feature selection, correlation) · Curse Wraith (high dimensions) · Eigen Eel (PCA) · Kernel Kraken (kernel SVMs) · **Boss: The Principal**
- **R5 Non-parametric methods:** Memory Mimic (parametric vs non-parametric) · Neighbour Nymph (k-NN) · KD Termite (k-d and ball trees) · Entropy Ent (decision trees) · Forest Warden (bagging, random forests, boosting) · **Boss: k-Nearest Knight**
- **R6 Deep learning:** Neuron Newt (neurons, activations) · Backprop Bogle (backprop, SGD) · Curve Reader (training in practice) · Conv Crawler (CNNs) · LSTM Loom (RNNs, LSTMs) · **Boss: The Black Box**
- **R7 Clustering:** Centroid Sprite (k-means) · Elbow Imp (choosing k) · Density Djinn (DBSCAN) · Pseudo-Label Pixie (limited annotations) · **Boss: The Cluster Hive**
- **R8 Probability theory:** Distribution Djinn (distributions) · Likelihood Lynx (MLE) · Prior Phantom (MAP) · Spam Sprite (naive Bayes) · **Boss: Lambda**
- **R9 Reinforcement learning:** Reward Rogue (what RL is) · One-Armed Bandit (bandits, ε-greedy) · Upper Bound Owl (UCB) · Context Chameleon (contextual bandits, value-function approximation) · Q-Learner (Frozen Lake, Assignment 5) · **Boss: The Agent**
- **R10 Language models:** Context Counter (word-context matrix, Word2Vec) · Token Troll (sequential models, generation) · Attention Wisp (transformers, self-attention) · Prompt Phantom (BERT, GPT, training, prompting) · Perplexity Pixie (Assignment 5 code) · **Boss: The Next Token**

## CS-C3240 Code Lab (30 exercises)
Open it with the **Code Lab** button (ML course only). The first tab is an exam brief (format, rules, typical bugs). Each round has 2–4 exercises in the exam's two styles, *code it yourself* and *fix the bug*, with type hints, a hint, a reference solution and public tests. Solving one gives +40 XP; drafts are saved in the browser.

## CS-A1140 levels (56)
Every round's first level is open; the levels inside a round unlock in order, and the round boss comes last and mixes the round's topics.

- **R1 Recap & basic data structures:** Loop Counter (running times) · Growth Gremlin (Big-O, Ω, Θ, experiments) · Binary Bat (binary search) · List Lurker (arrays, lists, stacks, queues) · Recurrence Wraith (recursion, recurrences) · **Boss: Big O**
- **R2 Sorting:** Selection Slime (selection & insertion sort) · Merge Mage (mergesort, divide & conquer) · Partition Imp (quicksort) · Radix Rat (lower bound, counting & radix sort) · **Boss: The Pivot**
- **R3 Trees:** Root Sprout (tree basics, traversals) · Heap Hatchling (priority queues, heapsort) · Union Wisp (union-find) · Huffman Hermit (Huffman coding) · **Boss: Heap Titan**
- **R4 Binary search trees:** Set Sentinel (sets, maps, BST operations) · AVL Acrobat (rotations, AVL) · Red-Black Raven (red-black & B-trees) · **Boss: The Rotator**
- **R5 Hashing:** Bit Beetle (bit sets, direct-access tables) · Chain Crab (chaining) · Probe Piranha (open addressing) · Hash Smith (hash functions & applications) · **Boss: Collision Kraken**
- **R6 Dynamic programming & greedy:** Fib Fiend (DP basics) · Rod Reaper (rod cutting, LCS) · Count Counter (counting with DP) · Knapsack Knave (knapsack, greedy) · **Boss: Memo Monolith**
- **R7 Graphs I:** Edge Eel (definitions, representations) · Wave Wraith (BFS) · Deep Delver (DFS, topological sort) · Component Cube (SCCs, cut vertices) · **Boss: The Traverser**
- **R8 Graphs II:** Spanning Sprite (MST) · Dijkstra Djinn (shortest paths) · Bellman Banshee (negative weights, DAGs) · **Boss: Path Oracle**
- **R9 Multithreaded algorithms:** Core Crawler (speedup, threads, parallel loops) · Race Runner (data races, atomics) · Split Merger (parallel mergesort) · **Boss: The Multicore**
- **R10 Hard problems:** Poly Pixie (P and NP) · Reduction Raider (NP-completeness, reductions) · SAT Sorcerer (coping with hard problems) · **Boss: The Intractable**
- **R11 Past-paper workshop:** Cost Cartographer (operation costs, amortized time, O(1) queues) · Code Detective (naming and analysing sorting code) · Tree Surgeon (BST/AVL on the exam trees) · Graph Tracer (DFS/BFS traces, topological order) · Dijkstra Drill · DP Frog (frog, colour-string and palindrome DPs) · Probe & Parallel (linear probing, work/span) · NP Examiner (P, NP, NP-complete, colouring) · **Boss: The Examiner**

## TU-A1300 levels (47) — Midterm I edition
Rebuilt on 6.10.2026 for Midterm I (Tue 13.10.2026: two essays on lectures 2–6). Sources: lecture slides L02–L06 (Jääskeläinen, Haahtela, Artto, Ylitalo, Tanskanen, Saarinen, Lahdenne & Haahtela),
the L06 product-development reading, the TUTAwiki pre-readings, group-exercise slides Parts 1–4, the pre-lecture quiz statements, the Midterm I instructions and the group's own Fasta business plan.
376 questions. The old lecture-1 round was removed (not in Midterm I).
Each boss has a `dg` field naming its Study Hall diagram. R3's boss reuses the Iron Foreman model; the other nine bosses have their own `BUILD` models (they face local +x, see `eyesX`).

- **R1 Value: the foundation of business:** Worth Wisp (value-in-use vs exchange value) · Gym Golem (efficiency, effectiveness, Kano) · Model Maker (business models, five forces, PESTEL) · **Boss: The Value Baron**
- **R2 Sales and marketing:** Pitch Imp (selling vs marketing, 7P/4C) · Price Tag Phantom (pricing strategies) · Segment Sprite (STP, buying process, generic strategies) · Deal Djinn (B2B buying, value propositions) · **Boss: The Pitch Master**
- **R3 Production systems:** Transform Titan (production system, car-industry eras) · Four-V Viper (4 V's) · Decoupler (OPP, buffers) · Matrix Mole (process types, capacity, planning horizons) · **Boss: The Iron Foreman**
- **R4 Processes and production control:** Flow Phantom (flow units, workstations) · Layout Lizard (flow types, layouts, process types) · Batch Beast (lot size, bottleneck, WT = V·U·T) · Sigma Specter (variability, SPC, small q / Big Q) · Kaizen Kami (push/pull, TPS, Virginia Mason) · **Boss: The Bottleneck**
- **R5 Project management:** Scope Serpent (project definition) · Breakdown Bear (WBS, critical path, Gantt, S-curve) · Risk Wraith (risks, BMW Mexico) · Rear-View Revenant (deviation reporting, lifecycle) · **Boss: The Critical Path**
- **R6 Organizing and leadership:** Hawthorne Haunt (people, SDT) · Matrix Mimic (organisational forms) · Kotter Knight (management vs leadership) · **Boss: The Org Chart**
- **R7 Purchasing and core competence:** Rouge Rider (factories to networks) · Core Keeper (core competence, make-or-buy) · Quadrant Quokka (categories, Kraljic) · **Boss: The Category Czar**
- **R8 Supply chain management:** Chain Chimera (supply chains, SCM) · Bullwhip Banshee (bullwhip, efficient vs responsive) · Forecast Fox (planning, forecasting, IKEA) · **Boss: The Bullwhip**
- **R9 Product development and lifecycle:** Front-End Fiend (NPD, design paradox) · Diamond Djinn (double diamond, users, creativity) · Gatekeeper (stage-gate, manufacturing, launch) · Lifecycle Lich (PLC, service design) · **Boss: The Dominant Design**
- **R10 Midterm I: essay arena:** Proctor Pixie (exam rules) · Essay Engineer (essay technique) · Fasta Forge (practice case: the group's pasta concept) · Link Lord (connecting the lectures) · **Boss: The Examiner**

## Answer explanations and option balance (9.10.2026)
All 798 questions in TU-A1300 and CS-C3240 were rewritten after player feedback: every explanation (`why`) is now 2–4 plain-language sentences that define the idea, explain it and often say why a tempting wrong answer is wrong, and the wrong options were rewritten so the correct answer is no longer usually the longest (now longest in ~29 % of questions, close to the 25 % you'd get by chance). CS-A1140 is unchanged.

## TU-A1300 deep Study Hall (10.10.2026)
All 47 IEM Study Hall pages were rewritten for first-time learning. Each page now has: a plain-language "big picture", numbered step cards with longer explanations, green "Example" boxes and red "Don't mix up" boxes, a key-terms list, "Check yourself" questions with tap-to-reveal answers, and an "In the exam" tip.
- Content lives in `STUDY_IEM_DEEP` (right after the `WORLDS_IEM` loader) and is merged over each level's original `study` object, so diagrams and captions are kept. Quiz questions are unchanged.
- `renderStudy()` shows the new optional fields (`big`, card `ex` / `trap`, `terms`, `check`, `exam`); pages without them (ML, DSA) look as before.

## TU-A1300 essay keywords (12.10.2026)
A new "Essay keywords" tab sits at the top of the IEM Study Hall: 194 terms from the Midterm I exam materials (the 9 TUTAwiki readings and group-exercise slides Parts 1–4), grouped into 10 topics. Each term has a plain explanation, an "In an essay" tip and the PDF it comes from. The page has a search box, topic filters and a self-test mode that hides explanations until you tap a card. Data lives in `KW_IEM` (and `KW_IEM_SRC` for source names); it only shows for TU-A1300.
