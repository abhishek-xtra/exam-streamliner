/* Browser check of the flashcards: deck page and a session render without errors or horizontal overflow
   at 390 px and 1440 px, flip + rating with keys works, "Again" brings the card back, progress is saved.
   node tests/cards-ui.js  (screenshots in tests/shots/) */
const puppeteer = require('puppeteer-core'), path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
  let fails = 0; const fail = m => { fails++; console.log('  FAIL', m); }; const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (const [w, mob] of [[390, true], [1440, false]]) {
    const p = await b.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.setViewport({ width: w, height: 900, isMobile: mob, hasTouch: mob });
    await p.goto('file://' + path.join(__dirname, '..', 'index.html')); await p.waitForSelector('#xm:not([hidden])');
    await p.evaluate(() => localStorage.removeItem('xm.v1'));
    const over = () => p.evaluate(W => { const xm = document.querySelector('#xm'); return Math.max(document.documentElement.scrollWidth - W, xm.scrollWidth - xm.clientWidth); }, w);
    for (const cid of await p.evaluate(() => XM.order)) {
      await p.evaluate(c => XM.go('cards', { c }), cid); await sleep(20);
      const nd = await p.$$eval('.xm-fc-deck', d => d.length); if (!nd) fail(`${w} ${cid}: no decks`);
      if (await over() > 0) fail(`${w} ${cid}: deck page overflows`);
      await p.evaluate(c => XM.go('cards', { c, deck: 'all', mode: 'all' }), cid); await sleep(20);
      if (await over() > 0) fail(`${w} ${cid}: card overflows`);
    }
    // a DSA session: key flow
    await p.evaluate(() => XM.go('cards', { c: 'dsa', deck: 'all', mode: 'due' })); await sleep(30);
    if (w === 1440) await p.screenshot({ path: path.join(__dirname, 'shots', `cards-front-${w}.png`) });
    const first = await p.$eval('.xm-fc-q', e => e.textContent);
    if (await p.$eval('.xm-fc-a', e => !e.hidden)) fail('answer visible before flip');
    await p.keyboard.press('Space'); await sleep(450);
    if (await p.$eval('.xm-fc-a', e => e.hidden)) fail('Space did not flip');
    await p.screenshot({ path: path.join(__dirname, 'shots', `cards-back-${w}.png`) });
    await p.keyboard.press('1'); await sleep(30);   // Again
    const second = await p.$eval('.xm-fc-q', e => e.textContent); if (second === first) fail('Again did not move on');
    let back = false; for (let k = 0; k < 4; k++) { if (await p.$eval('.xm-fc-q', e => e.textContent) === first) { back = true; break; } await p.keyboard.press('Space'); await sleep(20); await p.keyboard.press('3'); await sleep(20); }
    if (!back) fail('Again card did not come back within 4 cards');
    const saved = await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('xm.v1')).cards.dsa; return Object.values(d).length; });
    if (saved < 4) fail('progress not saved: ' + saved);
    await p.evaluate(() => XM.go('cards', { c: 'dsa' })); await sleep(30);
    const nw = await p.$$eval('.xm-fc-kpis b', e => +e[1].textContent); if (nw !== 88 - saved) fail(`new count ${nw}, expected ${88 - saved}`);
    await p.screenshot({ path: path.join(__dirname, 'shots', `cards-decks-${w}.png`), fullPage: false });
    await p.evaluate(() => XM.go('course', { c: 'pam' }));
    if (!(await p.waitForSelector('.xm-coursehead [data-go="cards"][data-c="pam"]', { timeout: 3000 }).catch(() => null))) fail('no Flashcards button on the course page');
    await p.evaluate(() => { location.hash = '#s=cards&c=ml&deck=l3&mode=all'; }); await sleep(60);
    if (!(await p.$eval('.xm-fc-where', e => /Classification/.test(e.textContent)).catch(() => false))) fail('link to a deck session failed');
    errs.forEach(e => fail(`${w}: page error ${e}`));
    await p.evaluate(() => localStorage.removeItem('xm.v1'));
  }
  await b.close(); console.log(`cards UI: ${fails} failures`); process.exit(fails ? 1 : 0);
})();
