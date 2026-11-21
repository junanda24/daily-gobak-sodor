// Verifikasi putaran penuh GOBAK SODOR! — bot bermain dengan kaki panjang:
// naik 0.6 dtk + juke samping, ulang sampai FINISH, lalu turun dengan pola sama.
import { createRequire } from 'module';
const require = createRequire('/home/hatch/workspace/.tools/playwright/package.json');
const { chromium } = require('playwright');
const FILE = 'file:///home/hatch/workspace/daily-webs/2026-11-22-gobak-sodor/src/index.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(FILE, { waitUntil: 'load' });
await sleep(600);
await page.click('#btnStart');
await sleep(4200); // countdown selesai

const meta = async () => page.textContent('#hudMeta');
const score = async () => parseInt((await page.textContent('#hudScore')) || '0', 10);
const hearts = async () => page.evaluate(() =>
  [...document.querySelectorAll('#hearts svg')].filter((s) => !s.classList.contains('off')).length);

// satu kaki: gerak vertikal (up/down) dalam burst 0.55 dtk diselingi juke 0.3 dtk
async function leg(dirKey, seconds) {
  const t0 = Date.now();
  let side = 'ArrowLeft';
  while (Date.now() - t0 < seconds * 1000) {
    await page.keyboard.down(dirKey);
    await sleep(550);
    await page.keyboard.up(dirKey);
    await page.keyboard.down(side);
    await sleep(300);
    await page.keyboard.up(side);
    side = side === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
    if ((await page.evaluate(() => document.querySelector('#ovOver') && getComputedStyle(document.querySelector('#ovOver')).display !== 'none' && document.querySelector('#ovOver').getBoundingClientRect().width > 0))) return 'over';
  }
  return 'ok';
}

let trip = 0, maxScore = 0, done = false;
for (let attempt = 0; attempt < 4 && !done; attempt++) {
  if ((await hearts()) === 0) break;
  // naik sampai FINISH (butuh ~2.6 dtk jalan bersih; beri 5 dtk dengan juke)
  const up = await leg('ArrowUp', 5);
  if (up === 'over') break;
  // turun sampai MULAI
  const down = await leg('ArrowDown', 5);
  if (down === 'over') break;
  const m = (await meta()) || '';
  const mm = m.match(/Putaran (\d+)/);
  trip = mm ? parseInt(mm[1], 10) : 0;
  maxScore = Math.max(maxScore, await score());
  console.log(`percobaan ${attempt + 1}: meta="${m.trim()}" skor=${maxScore} nyawa=${await hearts()}`);
  if (trip >= 1) done = true;
}
console.log(`\nHASIL: putaran=${trip} skor maks=${maxScore} pageerror=${errs.length}`);
console.log(trip >= 1 ? 'PASS putaran penuh (pergi-pulang) tercatat + level naik' : 'FAIL putaran tidak pernah selesai');
await page.screenshot({ path: '/tmp/gobak-verify/08-trip.png' });
await browser.close();
process.exit(trip >= 1 ? 0 : 1);
