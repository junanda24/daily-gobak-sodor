# Spec — GOBAK SODOR!

Game arcade HTML5 (canvas 2D) adaptasi permainan tradisional gobak sodor.
Satu pemain = penyerang. Lapangan portrait, lari bawah → atas → bawah.

## Terminologi
- **Putaran**: satu perjalanan pergi-pulang lengkap (start → garis akhir → start).
- **Garis jaga**: garis horizontal yang dijaga satu penjaga; garis tengah vertikal dijaga penjaga vertikal.
- **Tertangkap**: penjaga menyentuh pemain (tabrakan lingkaran).
- **Level**: naik +1 tiap putaran selesai. Menaikkan kecepatan & jumlah garis.

## Requirements

### R1 — State machine eksplisit
- **SHALL**: Game punya state `MENU → COUNTDOWN → PLAYING → PAUSED → TERTANGKAP → GAME_OVER`, dan setiap state punya jalan keluar yang jelas (tombol / tombol keyboard).
- **WHEN** game dimuat **THEN** tampil MENU dengan judul, tombol "MULAI MAIN", tombol "CARA MAIN", dan high score (kalau ada).
- **WHEN** pemain menekan MULAI **THEN** COUNTDOWN 3-2-1-GO tampil, lalu PLAYING.
- **WHEN** pemain menekan jeda (tombol / P / Esc) saat PLAYING **THEN** PAUSED dengan tombol Lanjut dan Ulang.
- **WHEN** pemain tertangkap **THEN** state TERTANGKAP: animasi singkat (±900ms), nyawa -1, lalu lanjut PLAYING dari garis start — atau GAME_OVER bila nyawa habis.
- **WHEN** nyawa habis **THEN** GAME_OVER tampil: skor akhir, putaran, level, high score baru (bila pecah), tombol "MAIN LAGI" dan "MENU".

### R2 — Gerakan pemain
- **SHALL**: Pemain bergerak bebas 8 arah dengan kecepatan konstan, dibatasi di dalam lapangan + area start/finish.
- **WHEN** pemain menahan tombol panah / WASD **THEN** pemain bergerak ke arah itu dengan kecepatan penuh (diagonal dinormalisasi, tidak lebih cepat).
- **WHEN** pemain swipe di layar sentuh **THEN** pemain bergerak mengikuti arah swipe selama jari menahan (virtual joystick dinamis: titik sentuh awal = pusat joystick).
- **WHEN** pemain memakai D-pad layar **THEN** arah yang ditekan menggerakkan pemain seperti keyboard.
- **WHEN** pemain mencapai tepi lapangan **THEN** pemain berhenti di tepi (tidak keluar arena).

### R3 — Lapangan klasik (6 petak)
- **SHALL**: Lapangan portrait dibagi garis kapur: 2 garis jaga horizontal + 1 garis tengah vertikal pada Level 1 — sesuai lapangan klasik 15m × 9m / 6 petak (2 garis melintang + garis tengah).
- **WHEN** level 3 tercapai **THEN** tambah 1 garis jaga horizontal (total 3).
- **WHEN** level 8 tercapai **THEN** tambah 1 penjaga vertikal kedua di garis tengah (dua penjaga berbagi garis tengah).
- **WHEN** level 10 tercapai **THEN** tambah 1 garis jaga horizontal (total 4).
- **SHALL**: Garis start di bawah lapangan, garis akhir di atas lapangan; keduanya jelas ditandai (kapur tebal + label).

### R4 — Penjaga: patroli + mengintai
- **SHALL**: Setiap penjaga HANYA bergerak di sepanjang garisnya (aturan asli: kaki harus menyentuh garis).
- **WHEN** pemain jauh dari garis penjaga **THEN** penjaga berpatroli bolak-balik dengan kecepatan dasar (gerakan sinus / ping-pong).
- **WHEN** pemain berada di dalam zona garis itu (jarak vertikal < 1 petak untuk penjaga horizontal; jarak horizontal < 1 petak untuk penjaga vertikal) **THEN** penjaga beralih ke mode MENGINTAI: bergerak menuju posisi pemain di sepanjang garisnya dengan kecepatan intai (lebih cepat dari patroli).
- **SHALL**: Kecepatan penjaga naik tiap level (lihat `CONFIG` di design.md), tapi TIDAK PERNAH melebihi 90% kecepatan pemain — kesulitan naik lewat jumlah garis & jangkauan intai, bukan kecepatan mustahil.

### R5 — Deteksi sentuhan (tertangkap)
- **SHALL**: Tertangkap terjadi bila jarak pusat pemain–penjaga < radius tangkap (0.8 × radius visual penjaga — pemaaf, bukan pixel-perfect).
- **WHEN** tertangkap **THEN** nyawa -1, kombo reset ke 0, screen shake, bunyi "kena", getar HP 100ms, animasi TERTANGKAP, pemain kembali ke garis start dengan kekebalan 2 detik (berkedip).
- **SHALL**: Selama masa kekebalan pemain tidak bisa tertangkap lagi.

### R6 — Skor, kombo, putaran
- **SHALL**: Melewati satu garis jaga = +10 poin. Menyelesaikan satu putaran penuh (pergi-pulang) = +100 poin × pengali kombo.
- **WHEN** putaran selesai tanpa tertangkap sejak putaran sebelumnya **THEN** kombo +1 (maks ×5); **WHEN** tertangkap **THEN** kombo reset ke ×1.
- **SHALL**: Skor, level, putaran, nyawa, dan kombo selalu terlihat di HUD selama PLAYING.
- **WHEN** putaran selesai **THEN** tampil seruan "PUTARAN SELESAI!" + bunyi peluit + level naik.

### R7 — Power-up
- **SHALL**: Power-up muncul di petak acak tiap ±12 detik (maks 1 aktif di lapangan), jenis acak: Jeda (bekukan semua penjaga 3 detik), Bintang (kebal 5 detik), Nyawa (+1, maks 5).
- **WHEN** pemain menyentuh power-up **THEN** efek aktif, power-up hilang, bunyi & partikel tampil, dan ikon efek + sisa waktu tampil di HUD.

### R8 — Suara & getar
- **SHALL**: Semua SFX dibuat via WebAudio (tanpa file audio): peluit (level selesai), blip (lewat garis), bunyi kena (nada turun), klik tombol, fanfare singkat (high score baru).
- **SHALL**: Ada tombol bisu di HUD & menu; preferensi tersimpan di localStorage.
- **WHEN** tertangkap / putaran selesai di perangkat yang mendukung **THEN** getar singkat (navigator.vibrate).

### R9 — High score (localStorage)
- **SHALL**: Skor tertinggi + putaran terbanyak tersimpan di localStorage (satu modul `store`, key berversi `gobak-sodor-v1`).
- **WHEN** skor akhir > high score **THEN** tampil "REKOR BARU!" + confetti + fanfare.
- **WHEN** game dimuat **THEN** high score tampil di MENU.

### R10 — Game feel & visual
- **SHALL**: Partikel debu kapur di jejak pemain; partikel ledakan kecil saat lewat garis; screen shake saat tertangkap; flash tepi layar saat tertangkap.
- **SHALL**: Karakter digambar prosedural (chibi: badan jersey, kepala, kaki animasi lari) — pemain jersey merah, penjaga jersey biru. Tanpa aset berlisensi.
- **SHALL**: Lapangan bergaya kapur di aspal: garis putih agak bergelombang (hand-drawn), tekstur bintik, label "START" / "FINISH" di garis ujung.
- **SHALL**: Game berjalan 60fps: satu `requestAnimationFrame` + delta time; partikel memakai object pooling; tidak ada alokasi per-frame di hot loop.

### R11 — Responsif & aksesibilitas dasar
- **SHALL**: Canvas menyesuaikan lebar layar (maks 480px, portrait); HUD & tombol tetap terbaca di 360px.
- **SHALL**: Tidak ada teks placeholder / lorem ipsum; semua copy Bahasa Indonesia.
- **SHALL**: Tombol minimal 44px area sentuh; game bisa dijeda; tidak ada softlock (semua state bisa keluar ke MENU).

### R12 — Self-healing (standing order)
- **SHALL**: localStorage dibaca dalam try/catch — data korup → reset ke default, game tetap jalan (degraded, bukan crash).
- **SHALL**: Bila WebAudio tidak tersedia, game jalan tanpa suara (tanpa error).
- **SHALL**: Bila `requestAnimationFrame` terhenti (tab disembunyikan) → auto-jeda saat kembali ke PLAYING.

## Non-goals (POST-SLICE)
- Mode 2 pemain / multipemain, papan skor online, tema lapangan malam, editor level.
