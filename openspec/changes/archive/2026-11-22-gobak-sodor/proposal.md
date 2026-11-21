# Proposal — GOBAK SODOR! (2026-11-22)

## Apa ini
Game arcade HTML5 dari **gobak sodor** (galah asin), permainan tradisional
Indonesia yang dimainkan di lapangan berpetak kapur: dua tim, penjaga menjaga
garis, penyerang berusaha bolak-balik tanpa tersentuh. Diadaptasi jadi game
1 pemain: kamu si penyerang, lari dari garis start ke garis akhir lalu balik
lagi, sambil menghindari penjaga yang berpatroli di garisnya — dan penjaga
itu "mengintai": kalau kamu mendekat, dia bergerak ke arahmu.

## Kenapa ide ini mengejutkan
- **Nostalgia yang belum pernah digame-kan.** Semua orang Indonesia pernah main
  gobak sodor di lapangan SD — tapi belum ada versi gamenya yang beneran.
  Squid Game bikin permainan tradisional Korea mendunia; gobak sodor adalah
  jawaban Indonesia, dan ini pertama kalinya masuk program harian.
- **Mekanik baru di program ini.** 20+ game sebelumnya: layani pelanggan
  (WARKOP, GORENGAN), kemudi (OJOL, JUKIR), tebak (TEBAK PLAT, TEBAK HARGA),
  kelola (TANI, SAHAM, PAK RT), congklak, layangan. Belum ada satu pun
  stealth-timing di lapangan berjaga. Slot mekanik ini kosong.
- **Musimnya pas.** November = musim hujan, Minggu pagi = waktu rebahan main
  game di HP. Game 2–5 menit yang nagih.

## Kenapa bentuk output ini: game web artifact (static, canvas)
- Langsung dimainkan dari link, tanpa install — paling pas untuk game harian.
- Canvas 2D vanilla: butir yang tepat untuk game sekecil ini (gameplay-engineer:
  jangan impor framework/engine ke game jam sekecil ini).
- 100% client-side, tanpa backend: tidak ada data yang butuh server; skor di
  localStorage. Backend di sini cuma menambah kompleksitas tanpa guna.
- Mobile-first: kontrol sentuh (swipe + D-pad layar) + keyboard.

## Kenapa bukan ide lain
- Paket npm `wilayah-id`/`kodepos-id` dipertimbangkan (rotasi bentuk output),
  tapi uji "jam 5 pagi": Junan bakal senyum kaget main gobak sodor, sementara
  paket dataset wilayah cuma bikin dia bilang "oh, berguna". Standar program
  adalah TERCENGANG, bukan sekadar berguna. Paket ditunda ke hari lain.
- Ide backlog (kalkulator KPR, zakat, QR generator, dsb.) semuanya utilitas
  satu fungsi = kategori "receh" yang dilarang bar scope 2026-11-03.

## Uji bar scope
- Bukan utilitas satu fungsi. Ada state bertahan (nyawa, skor, level, kombo,
  high score), alur end-to-end (menu → countdown → main → tertangkap → game
  over → ulang), progresi (level, kecepatan, jumlah garis), dan game feel
  (partikel kapur, screen shake, SFX, getar).
- Sekelas JUKIR!/TAWAR!/OJOL! — bukan kata-angka/Berani Resign. **LOLOS.**

## IP check
- Semua aset original, digambar prosedural lewat kode canvas (karakter chibi,
  lapangan kapur, partikel). Tidak ada sprite/karakter berlisensi.
- Gobak sodor adalah permainan tradisional (public domain budaya); aturan
  dikutip dari Wikipedia/Gramedia/Wikibooks dan ditulis ulang dengan kata
  sendiri. Tidak ada disclaimer fan-made yang diperlukan (bukan IP komersial).

## Anti-AI-slop (copy)
- Copy Bahasa Indonesia natural, gaya anak lapangan: "SODOR!", "Kena, bro!",
  "Satu putaran lagi!". Tanpa emoji di label UI. Tanpa lorem ipsum.
- Judul dan ajakan ditulis seperti orang beneran ngomong, bukan template.

## Keputusan
**DISETUJUI SENDIRI** (otoritas scheduler, tanpa gate approval) → lanjut Apply.
