/* Browser check of every Study Hall page: renders, no console errors, no horizontal overflow at 390 px
   and 1440 px; the game's Study button opens the exam-structured Study Hall. node tests/study-ui.js */
const puppeteer = require('puppeteer-core'), path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
  let fails = 0, n = 0;
  for (const [w, mob] of [[390, true], [1440, false]]) {
    const p = await b.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.setViewport({ width: w, height: 900, isMobile: mob, hasTouch: mob });
    await p.goto('file://' + path.join(__dirname, '..', 'index.html')); await p.waitForSelector('#xm:not([hidden])');
    const res = await p.evaluate(async W => { const out = []; for (const [cid, pages] of Object.entries(XM.study)) for (const pg of pages) {
        XM.go('study', { c: cid, p: pg.id }); await new Promise(r => setTimeout(r, 5));
        const art = document.querySelector('.xm-study'), xm = document.querySelector('#xm');
        const over = Math.max(document.documentElement.scrollWidth - W, xm.scrollWidth - xm.clientWidth);
        const wide = [...document.querySelectorAll('.xm-study *')].filter(e => e.getBoundingClientRect().right > W + 1 && !e.closest('.xm-tw,.xm-code,.xm-fig,pre')).slice(0, 2).map(e => e.tagName + '.' + e.className);
        out.push({ id: cid + '/' + pg.id, ok: !!art && art.querySelector('h1').textContent === pg.title, over, wide }); } return out; }, w);
    res.forEach(r => { n++; if (!r.ok || r.over > 0 || r.wide.length) { fails++; console.log('  FAIL', w, r.id, JSON.stringify(r)); } });
    // focus reader + read-aloud on one page per course
    const fr = await p.evaluate(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), out = [];
      for (const cid of Object.keys(XM.study)) { XM.go('study', { c: cid, p: XM.study[cid][1].id }); await sleep(10);
        const blocks = document.querySelectorAll('.xm-study .xm-sb'), spk = document.querySelectorAll('.xm-study .xm-sb > .spk').length;
        blocks[0].dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(30);
        const f = document.querySelector('#xm-focus'); if (!f) { out.push(cid + ': focus reader did not open'); continue; }
        const slides = f.querySelectorAll('.fz-slide').length, c1 = f.querySelector('#xm-fz-count').textContent;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); await sleep(30);
        const c2 = f.querySelector('#xm-fz-count').textContent;
        const fspk = f.querySelector('.fz-slide.cur .spk'); if (fspk) { fspk.click(); await sleep(30); }
        const bar = document.querySelector('#tts-bar'), barShown = bar && !bar.hidden && getComputedStyle(bar).visibility !== 'hidden';
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(30);
        const closed = !document.querySelector('#xm-focus');
        if (slides !== blocks.length || c1 !== `1 / ${blocks.length}` || c2 !== `${Math.min(2, blocks.length)} / ${blocks.length}` || !closed) out.push(`${cid}: slides ${slides}/${blocks.length} counts ${c1} → ${c2} closed ${closed}`);
        if (XM.tts && (spk !== blocks.length || !barShown)) out.push(`${cid}: speakers ${spk}/${blocks.length}, tts bar shown ${barShown}`);
        if (XM.tts) XM.tts.stop(); }
      return { out, tts: !!XM.tts }; });
    console.log(`  ${w}px focus reader + read-aloud (speech available: ${fr.tts}): ${fr.out.length ? 'FAIL' : 'ok'}`); fr.out.forEach(x => { fails++; console.log('  FAIL', x); });
    // read ticks only on an explicit "Mark as read"
    const rd = await p.evaluate(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), db = XM.db(); db.read = {}; db.readV = 2;
      XM.go('study', { c: 'dsa', p: 'q1-code' }); await sleep(10); const afterOpen = !!(db.read.dsa || {})['q1-code'];
      document.querySelector('.xm-markread').click(); await sleep(10); const afterMark = !!db.read.dsa['q1-code'], navTick = document.querySelector('.xm-snav [data-p="q1-code"]').classList.contains('read'), optTick = / ✓$/.test(document.querySelector('.xm-ssel option[value="q1-code"]').textContent);
      XM.go('notes', {}); await sleep(10); const notesTick = document.querySelector('[data-p="q1-code"]').classList.contains('read');
      XM.go('study', { c: 'dsa', p: 'q1-code' }); await sleep(10); document.querySelector('.xm-markread').click(); await sleep(10); const afterUndo = !!db.read.dsa['q1-code'];
      return { afterOpen, afterMark, navTick, optTick, notesTick, afterUndo }; });
    if (rd.afterOpen || !rd.afterMark || !rd.navTick || !rd.optTick || !rd.notesTick || rd.afterUndo) { fails++; console.log('  FAIL read ticks', JSON.stringify(rd)); } else console.log(`  ${w}px read ticks only after "Mark as read" (and undo works): ok`);
    if (w === 1440) { // standalone app: theme toggle + Ask Claude panel, no arena left
      const ok = await p.evaluate(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms));
        const t0 = document.documentElement.dataset.theme; document.querySelector('#xm-theme').click(); const t1 = document.documentElement.dataset.theme; document.querySelector('#xm-theme').click();
        document.querySelector('#ai-fab').click(); await sleep(50); const ai = !document.querySelector('#ai-panel').hidden && /Study|Course|Reading|Question|Exam/.test(document.querySelector('#ai-ctx-label').textContent);
        document.querySelector('#ai-close').click();
        return { theme: t0 !== t1, ai, noArena: !document.querySelector('#scr-map, #btn-exam, #xm-arena') }; });
      if (!ok.theme || !ok.ai || !ok.noArena) { fails++; console.log('  FAIL standalone checks', JSON.stringify(ok)); } else console.log('  theme toggle, Ask Claude (with page context), no arena left: ok'); }
    if (errs.length) { fails++; console.log('  FAIL console errors', errs.slice(0, 3)); }
    await p.close();
  }
  await b.close(); console.log(`study UI: ${n} page renders, ${fails} failures`); process.exit(fails ? 1 : 0);
})();
