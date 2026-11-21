# PRODUCT.md — GOBAK SODOR!

> Ditulis via jalur fallback `local-impeccable` (launcher: NO_PRODUCT_MD).
> Run ini detached (scheduler 05:00 WIB, user tidak menonton) dan otoritas penuh
> sudah diberikan lewat task body program harian — tidak ada mekanisme tanya-jawab.
> Semua isi di bawah diinfer dari brief eksplisit task + riset aturan gobak sodor
> (Wikipedia id, Gramedia, Wikibooks) dan DILABELI asumsi bila bukan dari brief.

## Produk
**GOBAK SODOR!** — game arcade HTML5 (canvas) dari permainan tradisional
Indonesia gobak sodor / galah asin. Pemain jadi penyerang yang harus bolak-balik
melewati lapangan berpetak yang dijaga penjaga garis. Satu sesi 2–5 menit,
mobile-first, langsung main di browser HP.

## Masalah yang diselesaikan
- Permainan tradisional Indonesia hampir punah dari lapangan sekolah; belum ada
  versi gamenya yang beneran (bukan sekadar kuis/tebak-tebakan).
- Game harian sebelumnya (JUKIR, TAWAR, OJOL, WARKOP, TANI, SAHAM, LAYANGAN)
  semuanya mekanik layani/kemudi/tebak — belum ada game stealth-timing di grid
  berjaga. Slot mekanik ini kosong.

## Pengguna
- Junan (utama): main pagi hari di HP, nostalgia masa SD, kejar high score.
- Umum: siapa pun yang pernah main gobak sodor di sekolah; anak-anak yang
  belum pernah kenal permainan ini (game jadi pengenalan budaya).

## Janji produk (3 pilar)
1. **Nostalgia lapangan sekolah** — kapur, aspal, seragam, sorak-sorai.
2. **Timing, bukan refleks buta** — celah dibaca dari pola patroli penjaga,
   bukan ditebak; penjaga "mengintai" saat pemain dekat.
3. **Satu lagi, satu lagi** — putaran pendek (~30–45 detik), skor langsung,
   high score lokal bikin nagih.

## Bukan produk ini
- Bukan simulasi 2 tim multipemain (adaptasi arcade 1 pemain).
- Bukan ensiklopedia budaya (aturan asli dijelaskan singkat di layar "Cara Main").
- Bukan game dengan IAP / login / backend — 100% client-side, skor di localStorage.

## Asumsi (inferred, bukan dari user)
- Lapangan klasik 15m × 9m, 6 petak, 2 garis horizontal + 1 garis tengah vertikal
  (Wikipedia id "Gobak sodor") → adaptasi portrait: lari bawah→atas.
- Penjaga bergerak HANYA di garisnya (aturan asli: kaki harus menyentuh garis).
- Kena sentuh = kehilangan nyawa (adaptasi arcade; aslinya tim bertukar posisi).
- Level naik tiap putaran penuh (pergi-pulang) selesai.

## Mode permukaan (impeccable)
**Experience** — pengunjung ada DI DALAM permainan; antarmuka mundur, lapangan
dan aksi yang memimpin sejak viewport pertama.

## Kriteria sukses
- Pemain baru menyelesaikan 1 putaran penuh tanpa tertangkap dalam <60 detik.
- Tidak ada softlock; semua state punya jalan keluar (menu / jeda / ulang).
- 60fps di HP kelas menengah; kontrol sentuh + keyboard sama responsif.
- High score tersimpan dan tampil di menu.
