// Simulasi balance GOBAK SODOR! — Monte-Carlo, LEVEL NAIK TIAP PUTARAN (model game asli).
// Kebijakan pemain: sisi rumah + mundur keluar jangkauan intai + dash saat celah >= 85.
// Target: >=80% selesaikan putaran-1 <45 dtk; median putaran per nyawa 6-12;
// median waktu sampai tertangkap pertama 60-150 dtk.
const CONFIG = {
  playerSpeed: 250,
  patrolBase: 120, patrolGrowth: 0.06, patrolCap: 200,
  huntMult: 1.10, huntCap: 190,
  huntRangeBase: 55, huntRangeGrowth: 3, huntRangeCap: 65,
  vHuntMult: 1.1, vHuntRange: 60, vHuntFromLevel: 2,
  catchR: 12.8,
  dashGap: 85,
  startY: 615, finishY: 25,
};

function linesFor(level) {
  if (level >= 10) return [140, 260, 380, 500];
  if (level >= 3) return [170, 320, 470];
  return [230, 410];
}
function vGuardsFor(level) { return level >= 8 ? 2 : 1; }
function patrolSpeed(level) {
  return Math.min(CONFIG.patrolBase * (1 + CONFIG.patrolGrowth * (level - 1)), CONFIG.patrolCap);
}
function huntSpeed(level) {
  return Math.min(patrolSpeed(level) * CONFIG.huntMult, CONFIG.huntCap);
}
function huntRange(level) {
  return Math.min(CONFIG.huntRangeBase + CONFIG.huntRangeGrowth * (level - 1), CONFIG.huntRangeCap);
}

function simulateSession(rng) {
  const dt = 1 / 60;
  let trips = 0, level = 1;
  let lines = linesFor(level);
  let guards = lines.map((y) => ({ y, x: 40 + rng() * 280, dir: rng() > 0.5 ? 1 : -1 }));
  let vguards = [{ x: 180, y: 300, dir: 1 }];
  const player = { x: 90, y: CONFIG.startY };
  let homeSide = 1;
  let targetY = CONFIG.finishY;
  let caught = false, t = 0, firstTripTime = null;
  let phase = 'go';
  let evadeTime = 0;
  let catchInfo = null;
  const maxT = 600;

  const rebuildGuards = (newLevel) => {
    const nl = linesFor(newLevel);
    guards = nl.map((y, i) => {
      const old = guards.find((g) => g.y === y);
      return old || { y, x: 40 + rng() * 280, dir: rng() > 0.5 ? 1 : -1 };
    });
    lines = nl;
    const wantV = vGuardsFor(newLevel);
    while (vguards.length < wantV) vguards.push({ x: 180, y: 150 + rng() * 300, dir: 1 });
  };

  while (t < maxT && !caught) {
    t += dt;
    const pSpeed = patrolSpeed(level), hSpeed = huntSpeed(level), hRange = huntRange(level);
    const vSpeed = patrolSpeed(level), vHunt = Math.min(vSpeed * CONFIG.vHuntMult, CONFIG.huntCap);
    for (const g of guards) {
      const dy = Math.abs(player.y - g.y);
      if (dy < hRange) {
        const diff = player.x - g.x;
        g.x += Math.sign(diff) * Math.min(Math.abs(diff), hSpeed * dt);
      } else {
        g.x += g.dir * pSpeed * dt;
        if (g.x < 24) { g.x = 24; g.dir = 1; }
        if (g.x > 336) { g.x = 336; g.dir = -1; }
      }
    }
    for (const vg of vguards) {
      const dxv = Math.abs(player.x - vg.x);
      if (level >= CONFIG.vHuntFromLevel && dxv < CONFIG.vHuntRange) {
        const diff = player.y - vg.y;
        vg.y += Math.sign(diff) * Math.min(Math.abs(diff), vHunt * dt);
      } else {
        vg.y += vg.dir * vSpeed * dt;
        if (vg.y < 70) { vg.y = 70; vg.dir = 1; }
        if (vg.y > 570) { vg.y = 570; vg.dir = -1; }
      }
    }

    const dirY = targetY < player.y ? -1 : 1;
    const nextLine = lines
      .filter((y) => (dirY < 0 ? y < player.y - 2 : y > player.y + 2))
      .sort((a, b) => (dirY < 0 ? b - a : a - b))[0];
    const gNext = nextLine !== undefined ? guards.find((gg) => gg.y === nextLine) : null;

    if (phase === 'go') {
      let mx = 0;
      if (gNext) mx = player.x < gNext.x ? -1 : 1;
      const len = Math.hypot(mx, dirY) || 1;
      player.x += (mx / len) * CONFIG.playerSpeed * dt;
      player.y += (dirY / len) * CONFIG.playerSpeed * dt;
      const lo = homeSide === 1 ? 24 : 204, hi = homeSide === 1 ? 156 : 336;
      player.x = Math.max(lo, Math.min(hi, player.x));
      if (nextLine !== undefined && Math.abs(player.y - nextLine) < 46) {
        const gap = Math.abs(gNext.x - player.x);
        if (gap > CONFIG.dashGap) phase = 'dash';
        else { phase = 'evade'; evadeTime = 0; }
      }
    } else if (phase === 'evade') {
      evadeTime += dt;
      const dy = Math.abs(player.y - nextLine);
      const retreatTo = hRange + 15;
      if (dy < retreatTo) player.y -= dirY * CONFIG.playerSpeed * dt;
      const inHome = homeSide === 1 ? player.x <= 156 : player.x >= 204;
      const vFar = vguards.every((vg) => Math.abs(vg.y - player.y) > 120);
      let sideX;
      if (!inHome) sideX = homeSide === 1 ? 90 : 270;
      else if (gNext.x > 180 && homeSide === 1) sideX = 90;
      else if (gNext.x < 180 && homeSide === -1) sideX = 270;
      else if (Math.abs(gNext.x - player.x) < 70 && vFar) {
        homeSide = -homeSide;
        sideX = homeSide === 1 ? 90 : 270;
      } else sideX = player.x;
      const dx = sideX - player.x;
      player.x += Math.sign(dx) * Math.min(Math.abs(dx), CONFIG.playerSpeed * dt);
      player.x = Math.max(24, Math.min(336, player.x));
      const gap = Math.abs(gNext.x - player.x);
      if (dy >= retreatTo && gap > 80) phase = 'go';
      else if (evadeTime > 4 && gap > 60) phase = 'dash'; // tidak sabar: terobos
    } else { // dash
      player.y += dirY * CONFIG.playerSpeed * dt;
      if (Math.abs(player.y - nextLine) > 46) phase = 'go';
    }

    if ((dirY < 0 && player.y <= targetY) || (dirY > 0 && player.y >= targetY)) {
      player.y = targetY;
      if (targetY === CONFIG.finishY) { targetY = CONFIG.startY; }
      else {
        trips++;
        if (firstTripTime === null) firstTripTime = t;
        level = trips + 1;
        rebuildGuards(level);
        targetY = CONFIG.finishY;
      }
    }
    for (const g of guards) {
      if (Math.abs(player.y - g.y) < 16 && Math.abs(player.x - g.x) < CONFIG.catchR + 12) {
        caught = true; catchInfo = { who: 'h' + g.y, phase, level }; break;
      }
    }
    if (!caught) for (const vg of vguards) {
      if (Math.abs(player.x - vg.x) < 16 && Math.abs(player.y - vg.y) < CONFIG.catchR + 12) {
        caught = true; catchInfo = { who: 'v', phase, level }; break;
      }
    }
  }
  return { trips, firstTripTime, caught, t, catchInfo, levelAtCatch: level };
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

let seed = 20261122;
function rng() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }

const results = [];
for (let i = 0; i < 1000; i++) results.push(simulateSession(rng));
const firstTimes = results.filter((r) => r.firstTripTime !== null).map((r) => r.firstTripTime);
const tripsSorted = results.map((r) => r.trips).sort((a, b) => a - b);
const timesSorted = results.filter((r) => r.caught).map((r) => r.t);
const levelsSorted = results.filter((r) => r.caught).map((r) => r.levelAtCatch).sort((a, b) => a - b);
const byWho = {};
for (const r of results) if (r.catchInfo) byWho[r.catchInfo.who] = (byWho[r.catchInfo.who] || 0) + 1;
console.log('n=1000 sesi, level naik tiap putaran (model game asli)');
console.log(`  putaran-1 selesai: ${firstTimes.length}/1000 (${(firstTimes.length / 10).toFixed(1)}%) (target >= 80%)`);
console.log(`  median waktu putaran-1: ${firstTimes.length ? median(firstTimes).toFixed(1) + ' dtk' : 'n/a'} (target < 45 dtk)`);
console.log(`  median putaran per nyawa: ${median(tripsSorted)} (target 6-12)`);
console.log(`  p25/p75 putaran per nyawa: ${tripsSorted[250]} / ${tripsSorted[750]}`);
console.log(`  median waktu sampai tertangkap: ${timesSorted.length ? median(timesSorted).toFixed(0) + ' dtk' : 'n/a'} (target 60-150 dtk)`);
console.log(`  median level saat tertangkap: ${levelsSorted.length ? median(levelsSorted) : 'n/a'}`);
console.log(`  tertangkap oleh: ${JSON.stringify(byWho)}`);
