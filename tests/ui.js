/* Browser test: node tests/ui.js [courseId] [seedsPerTemplate]
   Opens index.html in headless Chrome at desktop and phone width; for every template it fills the
   correct answer through the UI, checks it, ticks the rubrics and expects full points; checks for
   console errors and horizontal overflow; runs a full mock exam; saves screenshots. */
const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..'), OUT = process.env.SHOTS || path.join(__dirname, 'shots');
const only = process.argv[2] || 'dsa', SEEDS = +(process.argv[3] || 2);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files', '--no-sandbox'] });
  let fails = 0, n = 0; const fail = m => { fails++; console.log('  FAIL', m); };
  for (const [vw, vh, mobile, tag] of [[1440, 900, false, 'desktop'], [390, 844, true, 'phone']]) {
    const page = await browser.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/three|WebGL|net::|Failed to load resource|fonts/i.test(m.text())) errs.push(m.text()); });
    await page.setViewport({ width: vw, height: vh, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    await page.goto('file://' + path.join(ROOT, 'index.html'));
    await page.waitForSelector('#xm:not([hidden])', { timeout: 15000 }); await page.evaluate(w => { window.__vw = w; }, vw);
    await page.screenshot({ path: `${OUT}/${tag}-home.png` });
    const tpls = await page.evaluate(c => Object.keys(XM.courses[c].templates), only);
    for (const tpl of tpls) for (let s = 1; s <= SEEDS; s++) {
      n++; const seed = s * 104729 + tpl.length;
      await page.evaluate((c, t, sd) => XM.go('practice', { c, tpl: t, seed: sd }), only, tpl, seed);
      await page.waitForSelector('.xm-q');
      // fill in the correct answers through the UI
      let info; try { info = await page.evaluate(async () => {
        const q = XM._cur, sleep = ms => new Promise(r => setTimeout(r, ms)), parts = () => document.querySelectorAll('.xm-parts > .xm-part');
        const setv = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
        for (let i = 0; i < q.parts.length; i++) { const p = q.parts[i];
          if (p.type === 'mcq') { const want = Array.isArray(p.answer) ? p.answer : [p.answer]; for (const a of want) { const j = p.perm.indexOf(a); parts()[i].querySelectorAll('.xm-opt')[j].click(); await sleep(0); } }
          if (p.type === 'numeric' || p.type === 'text') setv(parts()[i].querySelector('input'), String(p.type === 'numeric' ? p.answer : [].concat(p.answer)[0]));
          if (p.type === 'order') for (const a of p.answer) { const b = [...parts()[i].querySelectorAll('.xm-tok.pool')].find(x => x.textContent === a); if (!b) return { err: 'order token missing ' + a }; b.click(); await sleep(0); }
          if (p.type === 'table') p.rows.forEach((row, ri) => row.cells.forEach((c, ci) => { if (c && !c.given) setv(parts()[i].querySelector(`input[data-k="${ri},${ci}"]`), String([].concat(c.a)[0])); }));
          if (p.type === 'code') p.blanks.forEach((b, k) => setv(parts()[i].querySelector(`input[data-n="${k}"]`), [].concat(b)[0]));
          if (p.type === 'blocks') for (let gi = 0; gi < p.groups.length; gi++) for (let oi = 0; oi < p.groups[gi].options.length; oi++) if (p.groups[gi].options[oi].ok) { parts()[i].querySelectorAll('.xm-blk')[gi].querySelectorAll('.xm-opt')[oi].click(); await sleep(0); }
        }
        document.querySelector('#xm-check').click(); await sleep(10);
        for (const cb of document.querySelectorAll('.xm-rb input')) { cb.click(); await sleep(0); }
        const sc = document.querySelector('#xm-score').textContent; const m = sc.match(/Score: ([\d.]+) \/ ([\d.]+)/);
        const W = window.__vw; const xm = document.querySelector('#xm'); const over = Math.max(document.documentElement.scrollWidth - W, xm.scrollWidth - xm.clientWidth, innerWidth - W);
        const wide = [...document.querySelectorAll('.xm-main *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > W + 1 && !e.closest('.xm-tw,.xm-code,.xm-fig,.xm-qtabs,.xm-nav'); }).slice(0, 3).map(e => e.className || e.tagName);
        return { got: m && +m[1], max: m && +m[2], over, wide, title: q.title };
      }); } catch (e) { info = { err: 'threw ' + e.message.split('\n')[0] }; }
      if (info.err) fail(`${tag} ${tpl}#${s}: ${info.err}`);
      else if (info.got === null || Math.abs(info.got - info.max) > 1e-6) fail(`${tag} ${tpl}#${s}: UI score ${info.got}/${info.max}`);
      if (info.over > 0 || (info.wide && info.wide.length)) fail(`${tag} ${tpl}#${s}: horizontal overflow ${info.over}px ${JSON.stringify(info.wide)}`);
      if (s === 1) await page.screenshot({ path: `${OUT}/${tag}-${only}-${tpl}.png`, fullPage: false });
    }
    // full mock exam flow
    const ck = await page.evaluate(async c => { const sleep = ms => new Promise(r => setTimeout(r, ms));
      const waitFor = async sel => { for (let i = 0; i < 300; i++) { const e = document.querySelector(sel); if (e) return e; await sleep(20); } throw new Error('timeout waiting for ' + sel); };
      XM.db().run = null; XM.go('exam', { c, kind: 'mock', fresh: 1 });
      if (!XM.courses[c].mock) return 'no mock';
      (await waitFor('#xm-go')).click();
      await waitFor('#xm-hand'); const tabs = document.querySelectorAll('.xm-qtabs button').length; document.querySelector('#xm-hand').click();
      (await waitFor('.xm-modal [data-a="1"]')).click();
      const fin = await waitFor('#xm-fin'); fin.click();
      const res = await waitFor('.xm-grade, .xm-hero h1'); return `tabs ${tabs}, marking true, result "${res.textContent.trim().slice(0, 60)}"`; }, only);
    console.log(`  ${tag} mock flow: ${ck}`);
    if (errs.length) fail(`${tag} console errors: ${[...new Set(errs)].slice(0, 5).join(' | ')}`);
    await page.close();
  }
  await browser.close(); console.log(`\nUI: ${n} renders, ${fails} failures. Screenshots in ${OUT}`); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
