# GOBAK SODOR!

Game arcade HTML5 dari **gobak sodor** (galah asin), permainan tradisional
Indonesia yang dulu memenuhi lapangan sekolah — dan sekarang hampir punah.
Kamu jadi penyerang: bolak-balik menembus lapangan berpetak kapur yang dijaga
penjaga garis. Satu sentuhan, nyawamu berkurang. Satu putaran penuh, level naik
dan penjaga makin galak.

Squid Game bikin permainan tradisional Korea mendunia. Gobak sodor adalah
jawaban Indonesia — dan ini pertama kalinya ada versi gamenya yang beneran
dimainkan, bukan sekadar kuis atau tebak-tebakan.

## Kenapa ide ini dipilih

- **Nostalgia yang belum pernah digame-kan.** Semua orang Indonesia pernah main
  ini di lapangan SD, tapi belum ada versi gamenya. Efek kejutnya: "kok
  kepikiran sih".
- **Mekanik baru di program harian.** Game sebelumnya: layani pelanggan,
  kemudi, tebak, kelola, congklak, layangan. Belum ada satu pun stealth-timing
  di lapangan berjaga.
- **Aturannya nyata, bukan karangan.** Lapangan 15×9 meter, 6 petak, dua tim
  3–5 orang, penjaga hanya boleh bergerak di garisnya — dikutip dari Wikipedia
  dan ditulis ulang di layar Cara Main.

## Fitur

- Lapangan klasik: 2 garis jaga horizontal + 1 garis tengah vertikal (Level 1),
  tambah garis di Level 3, penjaga vertikal ke-2 di Level 8, garis ke-4 di
  Level 10+
- Penjaga berpatroli DAN mengintai: kalau kamu mendekat ke garisnya, dia
  bergerak ke arahmu (matanya ikut, garisnya menyala merah)
- Skor: +10 per garis dilewati, +100 × kombo per putaran penuh (kombo maks ×5,
  reset kalau ketangkap)
- 3 nyawa (maks 5), kekebalan 2 detik setelah tertangkap, screen shake + flash
  merah + getar HP saat kena
- Power-up: Jeda (bekukan penjaga 3 dtk), Bintang (kebal 5 dtk), Nyawa (+1),
  muncul tiap ±12 detik di petak acak
- State lengkap: Menu (attract mode: karakter demo berlari) → Countdown 3-2-1-GO
  → Main → Jeda → Tertangkap → Game Over (dengan "REKOR BARU!" + confetti)
- Kontrol: keyboard (panah/WASD, P/Esc jeda, Enter mulai) + sentuh (virtual
  joystick dinamis + D-pad layar)
- SFX WebAudio tanpa file audio (peluit, blip, fanfare) + tombol bisu
  (preferensi tersimpan)
- High score tersimpan di localStorage (`gobak-sodor-v1`)
- Partikel debu kapur, seruan layar tengah ("SODOR!", "PUTARAN SELESAI!",
  "KENA!"), karakter chibi prosedural (tanpa aset berlisensi)
- Auto-jeda saat tab disembunyikan; localStorage korup → reset aman, game tetap
  jalan

## Cara main

1. Buka gamenya, tekan **MULAI MAIN**.
2. Lari dari garis **MULAI** (bawah) ke **FINISH** (atas), lalu balik lagi —
   itu 1 putaran.
3. Lewati garis jaga saat penjaganya sedang jauh. Kalau penjaga mendekat,
   mundur dulu, biarin dia patroli, lalu terobos dari sisi lain.
4. Hati-hati garis tengah: penjaga vertikal mengintai siapa pun yang
   menyeberang sembarangan.
5. Ambil power-up yang muncul di lapangan. Kejar kombo: putaran berturut-turut
   tanpa ketangkap menaikkan pengali sampai ×5.

Kontrol:

| Perangkat | Gerak | Jeda | Mulai/Ulang |
|---|---|---|---|
| Keyboard | Panah / WASD | P atau Esc | Enter |
| HP | Seret di lapangan (joystick) atau D-pad | Tombol jeda di HUD | Tombol di layar |

## Cara menjalankan dari source

Game ini satu file statis (`src/index.html`, tanpa build step, tanpa backend):

```bash
# cara 1: buka langsung
open src/index.html

# cara 2: server statis (opsional)
cd src && python3 -m http.server 8080
# buka http://localhost:8080
```

## Tech stack

- HTML5 Canvas 2D vanilla (tanpa engine/framework — butir yang tepat untuk game
  sekecil ini)
- JavaScript: satu `requestAnimationFrame` + delta time, state machine eksplisit,
  object pooling untuk partikel
- WebAudio API untuk SFX (tanpa file audio)
- Font: Bungee + Plus Jakarta Sans (Google Fonts, dengan fallback serif)
- localStorage untuk high score + preferensi bisu

## Struktur folder

```
.
├── README.md
├── PRODUCT.md                  # konteks produk (impeccable init fallback)
├── simulate_balance.mjs        # simulasi Monte-Carlo balance (1000 sesi)
├── verify_playwright.mjs       # uji alur main end-to-end (Playwright headless)
├── verify_trip.mjs             # uji putaran penuh (pergi-pulang)
├── src/
│   └── index.html              # game lengkap (satu file, hasil export artifact)
└── openspec/
    └── changes/
        ├── 2026-11-22-gobak-sodor/
        │   ├── proposal.md
        │   ├── design.md
        │   ├── tasks.md
        │   └── specs/gobak-sodor/spec.md
        └── archive/
            └── 2026-11-22-gobak-sodor/   # arsip setelah selesai
```

## Link hasil

- Game: artifact `gobak-sodor` (card widget: web-artifact-build-completed-39d1a7bd-9742-44b1-9d7f-c4bcdfce4b71)
- Repo: https://github.com/junanda24/daily-gobak-sodor
- Rilis: 2026-11-22

## Catatan / temuan saat build

- **Balance disimulasi, bukan dikira-kira.** `simulate_balance.mjs` menjalankan
  1000 sesi Monte-Carlo per ronde tuning (4 ronde). CONFIG awal ternyata
  mustahil dimenangkan (0/1000 menyelesaikan putaran pertama). Dua temuan yang
  mengubah desain: (1) penjaga vertikal yang mengintai sejak Level 1 membunuh
  pemain baru — diubah jadi patroli saja di Level 1, mengintai dari Level 2;
  (2) jangkauan intai HARUS lebih kecil dari setengah jarak antar-garis, kalau
  tidak, tidak ada zona aman untuk mundur. Hasil final: 100% putaran pertama
  selesai (median 6,7 detik), median 5 putaran/nyawa, median 64 detik sampai
  tertangkap pertama, median mati di level 8. Simulasi tidak memodelkan
  power-up dan kekebalan pasca-tertangkap, jadi pemain asli bertahan lebih lama.
- **Skor terverifikasi matematis.** Uji Playwright: 4× garis (+40) + 1 putaran
  (100×1) = 140, persis seperti yang tampil di HUD.
- **Sengaja tidak dibuat:** mode 2 pemain / multipemain, papan skor online,
  tema lapangan malam, editor level (POST-SLICE).
- **Keterbatasan yang diketahui:** font Google (Bungee) gagal dimuat di
  lingkungan sandbox tanpa egress — di halaman terbit font memuat normal dan
  fallback serif tetap terbaca. Bot uji buta (tanpa strategi) mati dalam 15
  detik; pemain yang membaca pola patroli bertahan jauh lebih lama (sesuai
  simulasi).
