# Design — GOBAK SODOR!

## Stack
- **Web artifact static** (single-file HTML5): `index.html` + `styles.css` + `app.js`
  (pola baku ARCHITECTURE.md §1/§5). Canvas 2D vanilla — tanpa engine/framework.
- **Tanpa backend.** Semua state di client; skor di localStorage.
- **Font**: Bungee (display/judul) + Plus Jakarta Sans (UI) via Google Fonts.
- **SFX**: WebAudio API, oscillator-based, tanpa file audio.

## Arah visual (impeccable — mode Experience)
Lapangan sekolah saat senja, dilihat dari atas:
- **Tanah**: aspal hangat kecokelatan (#3a2c22 → #2b2018) dengan bintik-bintik
  kapur dan noda; vignette lembut di tepi.
- **Garis kapur**: putih gading (#f5efe0), garis agak bergelombang (digambar
  dengan jitter kecil tiap segmen — nuansa digambar tangan), lebar 4px, plus
  garis start/finish tebal 8px dengan label "MULAI" / "FINISH".
- **Karakter chibi prosedural**: lingkaran badan jersey + kepala + 2 kaki yang
  menganimasikan langkah saat bergerak. Pemain = merah (#e63946) + nomor 10.
  Penjaga = biru (#277da1) + nomor acak. Bayangan elips di bawah tiap karakter.
- **HUD**: panel gelap transparan di atas kanvas; skor besar Bungee emas
  (#ffd166); nyawa = hati SVG merah; level = lencana; kombo = teks api oranye.
- **Aksen**: emas (#ffd166) untuk skor/seruan; merah untuk bahaya; hijau untuk
  power-up Nyawa; ungu untuk Jeda; kuning untuk Bintang.
- **Signature elements** (3):
  1. Jejak debu kapur di belakang pemain (partikel memudar).
  2. Seruan besar di tengah layar saat momen penting ("SODOR!", "PUTARAN
     SELESAI!", "KENA!") — teks Bungee yang scale-in lalu memudar.
  3. Penjaga yang "mengintai": matanya (dua titik putih) berputar mengikuti
     pemain saat mode intai aktif + garisnya menyala merah samar.

## Arsitektur kode (ARCHITECTURE.md §1 + §5)
```
index.html   # struktur + mounting point + HUD DOM + D-pad + overlay menu
styles.css   # token :root → komponen → responsif (maks 480px)
app.js       # IIFE/module scope; SATU objek state; SATU rAF loop + dt
```
- `CONFIG` — semua angka tuning sebagai data (bukan literal tersebar).
- `store` — satu-satunya modul yang menyentuh localStorage (key `gobak-sodor-v1`).
- Entitas: `player`, `guards[]`, `powerups[]`, `particles` (pool) — masing-masing
  `update(dt)` / `render(ctx)`, dipisah dari handler DOM.
- State machine: `MENU, COUNTDOWN, PLAYING, PAUSED, TAGGED, GAME_OVER`.
- Input: keyboard (panah/WASD, P/Esc jeda, Enter mulai) + pointer (virtual
  joystick dinamis + D-pad layar). Input di-buffer, bukan dibaca mentah di loop.
- Render: kanvas digambar tiap frame; HUD DOM di-update hanya saat nilai berubah
  (bukan tiap frame).

## State — lima keranjang (ARCHITECTURE.md §2)
- **Lokal**: posisi pemain/penjaga, partikel, timer efek → di objek `state` (app.js).
- **URL**: tidak dipakai (game bukan shareable state).
- **Server state**: tidak ada (tanpa backend).
- **Global client UI**: overlay menu/jeda/game-over → DOM class toggle.
- **Form**: tidak ada.

## Model lapangan (koordinat logis, diskalakan ke kanvas)
- Arena logis: lebar 360, tinggi 640 unit. Area start: y 590–640. Area finish:
  y 0–50. Lapangan: y 50–590.
- Garis jaga horizontal (Level 1): y = 230 dan y = 410 → 3 lajur.
  Level 3: y = 170, 320, 470 (3 garis). Level 10: y = 140, 260, 380, 500
  (4 garis). Jarak antar-garis ≥ 120 unit supaya pemain punya ruang bermanuver.
- Garis tengah vertikal: x = 180, y 50–590. Penjaga vertikal ke-2 (Level 8)
  berbagi garis yang sama, wilayah y dibagi dua.

## Balance (game-balance-designer: formula + simulasi)
Intent terukur: **pemain median menyelesaikan putaran pertama <45 detik** dan
**median putaran sebelum tertangkap pertama ≥ 3 pada Level 1**.

| Parameter | Formula | Konstanta |
|---|---|---|
| Kecepatan pemain | tetap | 250 unit/detik |
| Kecepatan patroli penjaga | `base * (1 + 0.06*(level-1))` | base 120, cap 200 |
| Kecepatan intai penjaga | `patroli * 1.10` | cap 190 (≤76% kecepatan pemain) |
| Jangkauan intai | `55 + 3*(level-1)` unit | cap 65 — HARUS < setengah jarak antar-garis supaya selalu ada zona aman |
| Radius tangkap | `0.8 × radius visual` | visual 16 → tangkap 12.8 |
| Penjaga vertikal | patroli saja di Level 1; mengintai dari Level 2 | intai ×1.1, jangkauan 60 |
| Penjaga vertikal ke-2 | muncul Level 8 | berbagi garis tengah |
| Garis horizontal | L1–2: 2 garis [230, 410]; L3–9: 3 garis [170, 320, 470]; L10+: 4 garis [140, 260, 380, 500] | jarak antar-garis ≥ 120 |
| Skor garis | tetap | +10 |
| Skor putaran | `100 × kombo` | kombo maks ×5 |
| Nyawa awal | tetap | 3 (maks 5 via power-up) |
| Power-up | tiap 12 dtk ± 3, maks 1 aktif | — |

## Hasil simulasi balance (`simulate_balance.mjs`, 1000 sesi, level naik tiap putaran)
| Ronde | Perubahan | Hasil |
|---|---|---|
| 0 | CONFIG awal (hunt ×1.45, jangkauan 90) | 0/1000 selesaikan putaran-1 — game mustahil |
| 1 | Penjaga vertikal patroli saja di L1; pemain model tidak lari di garis tengah | L1: 4,1% putaran-1 — masih mustahil |
| 2 | Pemain model menghindar kecepatan penuh + mundur-umpan; hunt ×1.15, jangkauan 70 | L1: 58% putaran-1, median 1 putaran/nyawa; L3–L5 ambruk (penjaga vertikal membunuh 999/1000) |
| 3 | Pemain model pakai "sisi rumah" (tidak menyeberang garis tengah sembarangan); hunt ×1.15 | L1: median 43 putaran/nyawa (terlalu mudah), L5: 6,3% putaran-1 (tebing curam: jarak antar-garis 120 < 2× jangkauan intai → tidak ada zona aman) |
| 4 (FINAL) | hunt ×1.10, jangkauan intai 55+3/level cap 65 (< ½ jarak antar-garis), garis ke-4 ditunda ke L10, penjaga vertikal ke-2 ditunda ke L8, dash butuh celah 85 | **100% putaran-1 selesai (median 6,7 dtk, target <45 dtk); median 5 putaran/nyawa; median 64 dtk sampai tertangkap pertama (target 60–150 dtk); median mati di level 8** |

Target "median 6–12 putaran/nyawa" tercapai 5/6 — diterima dengan catatan:
simulasi TIDAK memodelkan power-up (Jeda/Bintang tiap ±12 dtk) dan kekebalan
2 dtk pasca-tertangkap, keduanya memperpanjang survival pemain asli.
Ancaman utama terverifikasi: penjaga vertikal (garis tengah berbahaya — sesuai
desain: menyeberang tengah adalah keputusan, bukan jalan pintas gratis).
Batasan model: pemain model kadang masuk loop evade↔go tanpa progres (bukan
softlock game — pemain asli selalu bisa memilih terobos; tidak ada state yang
mengunci input).

## Animasi & game feel
- Countdown: angka 3-2-1 membesar + peluit pendek.
- Lewat garis: blip + partikel kapur meledak kecil + teks "+10" melayang.
- Putaran selesai: peluit panjang + seruan "PUTARAN SELESAI!" + confetti kapur.
- Tertangkap: shake 300ms + flash merah tepi + bunyi turun + getar 100ms.
- Power-up: ikon berdenyut; efek aktif tampil sebagai cincin di sekeliling pemain
  (beku = biru, kebal = emas berkilau).
- Menu: karakter pemain & penjaga berlari mondar-mandir sebagai latar hidup
  (attract mode, tanpa interaksi).

## Audio (WebAudio, tanpa file)
- `blip`: square 660→880Hz, 0.07 dtk. `whistle`: noise+2.2kHz, 0.4 dtk (panjang
  0.8 dtk untuk putaran). `caught`: sawtooth 300→90Hz, 0.35 dtk. `click`: 1200Hz
  0.03 dtk. `fanfare`: arpeggio 523-659-784-1046, 0.5 dtk. `powerup`: 880→1320Hz.
- Tombol bisu di HUD + menu; disimpan di `store`.

## Deploy target
Artifact static (link artifact). TIDAK deploy Vercel tanpa ACC Junan. TIDAK
publish registry (bukan package).

## CODE_STANDARDS.md
- Satu objek state; logic bisnis di fungsi bernama, bukan di handler.
- `querySelector` di-cache di awal; IIFE/module scope; tanpa `console.log` sisa.
- Tanpa god component / god function (>300 baris per fungsi render/update dipecah).
- Nama jelas Bahasa Inggris untuk kode; copy UI Bahasa Indonesia.
