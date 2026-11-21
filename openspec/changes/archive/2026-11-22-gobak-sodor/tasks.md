# Tasks — GOBAK SODOR! (2026-11-22)

- [x] 1. Simulasi balance (`simulate_balance.mjs`, 1000 sesi/level 1-3-5) → tuning CONFIG bila target gagal (SELESAI: 4 ronde, final 100% putaran-1, median 5 putaran/nyawa, 64 dtk ke tangkapan pertama)
- [x] 2. Scaffold artifact: `index.html` + `styles.css` + `app.js` (struktur baku ARCHITECTURE.md §1/§5)
- [x] 3. Lapangan: kanvas responsif, garis kapur (jitter), label MULAI/FINISH, tekstur aspal
- [x] 4. Entitas: pemain (chibi merah) + penjaga (chibi biru, patroli + intai) + render bayangan/kaki lari
- [x] 5. Input: keyboard (panah/WASD, P/Esc, Enter) + virtual joystick + D-pad layar
- [x] 6. State machine: MENU → COUNTDOWN → PLAYING → PAUSED → TAGGED → GAME_OVER (+ attract mode di menu)
- [x] 7. Sistem skor: garis +10, putaran 100×kombo, kombo maks ×5, HUD (skor/level/putaran/nyawa/kombo)
- [x] 8. Nyawa & tertangkap: deteksi tabrakan, shake, flash, kekebalan 2 dtk, kembali ke start
- [x] 9. Power-up: Jeda / Bintang / Nyawa, spawn ±12 dtk, efek + indikator HUD
- [x] 10. SFX WebAudio + tombol bisu + getar (vibrate) — semua dalam try/catch
- [x] 11. Partikel kapur (pool), seruan layar tengah, confetti rekor baru
- [x] 12. High score via `store` (localStorage berversi + try/catch, fallback default)
- [x] 13. Layar CARA MAIN (aturan asli singkat + kontrol) + footer sumber aturan
- [x] 14. Verify mandiri: SHALL-by-SHALL checklist, uji alur main lengkap (menu → main → tertangkap → game over → ulang), cek console error, cek 360px, cek tanpa suara
- [x] 15. Export artifact → `src/`; README lengkap; archive openspec; git init + commit
- [x] 16. Buat repo `junanda24/daily-gobak-sodor` + push + verifikasi via API
- [x] 17. Catat BUILT.md + update profile README `junanda24/junanda24`
- [x] 18. Log `~/memory/2026-11-22.md` + tracking entry goal
