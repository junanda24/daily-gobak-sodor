// Verifikasi mandiri GOBAK SODOR! v2 — Playwright headless (touch aktif).
// Alur: menu -> cara main -> mulai -> main bolak-balik -> tertangkap 3x -> game over
// -> main lagi -> jeda/lanjut -> localStorage + console error + overflow.
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire('/home/hatch/workspace/.tools/playwright/package.json');
const { chromium } = require('playwright');

const FILE = 'file:///home/hatch/workspace/daily-webs/2026-11-22-gobak-sodor/src/index.html';
const OUT = '/tmp/gobak-verify';
mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const errors = [];
const failedReqs = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('requestfailed', (r) => failedReqs.push(r.url()));
await page.goto(FILE, { waitUntil: 'load' });
await sleep(800);

const vis = async (sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return 'missing';
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return (r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden') ? 'visible' : 'hidden';
}, sel);
const heartsOn = async () => page.evaluate(() =>
  [...document.querySelectorAll('#hearts svg')].filter((s) => !s.classList.contains('off')).length);

// 1. Menu
check('menu tampil', (await vis('#ovMenu')) === 'visible');
check('tombol MULAI MAIN ada', (await vis('#btnStart')) === 'visible');
await page.screenshot({ path: OUT + '/01-menu.png' });
await page.click('#btnHow');
await sleep(300);
check('panel CARA MAIN terbuka', (await vis('#ovHow')) === 'visible');
await page.click('#btnHowBack');
await sleep(300);
check('kembali ke menu', (await vis('#ovMenu')) === 'visible');
// 2. Bisu
const muteBefore = await page.textContent('#muteBtnMenu');
await page.click('#muteBtnMenu');
await sleep(200);
const muteAfter = await page.textContent('#muteBtnMenu');
check('toggle bisu berubah label', muteBefore !== muteAfter, `${muteBefore} -> ${muteAfter}`);
await page.click('#muteBtnMenu');
// 3. Mulai -> countdown -> playing
await page.click('#btnStart');
await sleep(1200);
await page.screenshot({ path: OUT + '/03-countdown.png' });
await sleep(3000);
check('HUD tampil saat main', (await vis('#hud')) === 'visible');
check('menu hilang saat main', (await vis('#ovMenu')) === 'hidden');
check('nyawa awal 3 hati', (await heartsOn()) === 3, `hati nyala: ${await heartsOn()}`);
// sentuh kanvas sekali supaya D-pad (on-touch) aktif
await page.touchscreen.tap(195, 700);
await sleep(300);
check('D-pad tampil (touch aktif)', (await vis('#dpad')) === 'visible');
// 4. Main bolak-balik: naik-turun dengan juke kiri/kanan sampai game over
let gameOver = false, maxScore = 0, maxTrip = 0, minHearts = 3, sawKebal = false;
const t0 = Date.now();
let dir = 'up';
for (let i = 0; i < 120 && !gameOver && Date.now() - t0 < 150000; i++) {
  const key = dir === 'up' ? 'ArrowUp' : 'ArrowDown';
  await page.keyboard.down(key);
  await sleep(1100);
  await page.keyboard.up(key);
  // juke acak
  const side = i % 2 === 0 ? 'ArrowLeft' : 'ArrowRight';
  await page.keyboard.down(side);
  await sleep(350);
  await page.keyboard.up(side);
  dir = dir === 'up' ? 'down' : 'up';
  const sc = parseInt((await page.textContent('#hudScore')) || '0', 10);
  if (!Number.isNaN(sc)) maxScore = Math.max(maxScore, sc);
  const meta = (await page.textContent('#hudMeta')) || '';
  const m = meta.match(/Putaran (\d+)/);
  if (m) maxTrip = Math.max(maxTrip, parseInt(m[1], 10));
  const h = await heartsOn();
  minHearts = Math.min(minHearts, h);
  const fx = (await page.textContent('#hudFx')) || '';
  if (/Kebal/.test(fx)) sawKebal = true;
  if ((await vis('#ovOver')) === 'visible') { gameOver = true; break; }
  if (i === 6) await page.screenshot({ path: OUT + '/04-playing.png' });
}
check('skor bertambah saat main', maxScore > 0, `skor maks: ${maxScore}`);
check('putaran selesai (pulang-pergi) tercatat', maxTrip >= 1, `putaran maks: ${maxTrip}`);
check('nyawa berkurang saat tertangkap', minHearts < 3, `nyawa terendah: ${minHearts}`);
check('kekebalan pasca-tertangkap tampil', sawKebal);
check('GAME OVER tercapai (tertangkap 3x)', gameOver, `waktu: ${((Date.now() - t0) / 1000).toFixed(0)} dtk`);
await page.screenshot({ path: OUT + '/05-gameover.png' });
if (gameOver) {
  const overScore = await page.textContent('#overScore');
  check('skor akhir tampil', /\d+/.test(overScore || ''), overScore);
  const stored = await page.evaluate(() => localStorage.getItem('gobak-sodor-v1'));
  check('high score tersimpan di localStorage', !!stored && /high|score/i.test(stored), stored);
  await page.click('#btnAgain');
  await sleep(4000);
  check('MAIN LAGI kembali bermain', (await vis('#ovOver')) === 'hidden' && (await vis('#hud')) === 'visible');
  check('nyawa reset 3 setelah MAIN LAGI', (await heartsOn()) === 3, `hati nyala: ${await heartsOn()}`);
  await page.keyboard.press('p');
  await sleep(300);
  check('jeda (P) membuka overlay', (await vis('#ovPause')) === 'visible');
  await page.screenshot({ path: OUT + '/06-pause.png' });
  await page.click('#btnResume');
  await sleep(300);
  check('LANJUT menutup overlay jeda', (await vis('#ovPause')) === 'hidden');
}
const overflowM = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('tanpa overflow horizontal (mobile)', overflowM <= 0, `kelebihan ${overflowM}px`);
// Desktop
const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page2.on('pageerror', (e) => errors.push('desktop pageerror: ' + e.message));
await page2.goto(FILE, { waitUntil: 'load' });
await sleep(800);
const overflowD = await page2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('tanpa overflow horizontal (desktop)', overflowD <= 0, `kelebihan ${overflowD}px`);
await page2.screenshot({ path: OUT + '/07-desktop.png' });
// Error: hanya kegagalan font Google (egress sandbox diblok) yang ditoleransi
const nonFontErrors = errors.filter((e) => !/fonts\.g|ERR_TUNNEL/.test(e));
const nonFontReqs = failedReqs.filter((u) => !/fonts\.g/.test(u));
check('nol console/page error non-font', nonFontErrors.length === 0, nonFontErrors.slice(0, 3).join(' | '));
check('semua request gagal hanyalah font Google (egress sandbox)', failedReqs.length === nonFontReqs.length + failedReqs.filter((u) => /fonts\.g/.test(u)).length && nonFontReqs.length === 0, failedReqs.join(', ') || 'tidak ada request gagal');

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\nRINGKASAN: ${results.length - failed.length}/${results.length} PASS`);
if (failed.length) { console.log('GAGAL: ' + failed.map((f) => f.name).join(', ')); process.exit(1); }
