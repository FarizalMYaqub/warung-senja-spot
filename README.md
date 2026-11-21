# Warung Senja — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/FarizalMYaqub/warung-senja-spot/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/FarizalMYaqub/warung-senja-spot/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

**Warung Senja — Spot the Difference** adalah game cari perbedaan orisinal
bertema warung kopi Indonesia di senja hari. Dua gambar nyaris identik
berdampingan — panel kiri ASLI, panel kanan ada yang berubah — dan tugasmu
menemukan 7 perbedaan di setiap scene sebelum waktu habis.

## Cara main

- **Klik** perbedaan di panel mana pun (kiri atau kanan boleh).
- Klik benar: +100 poin, kombo naik. Klik salah: −5 detik.
- **H** — hint: menyorot satu perbedaan tersisa (cooldown 15 detik, −25 poin).
- **Esc** — jeda, **R** — ulang scene, **M** — suara, **N** — scene berikut.
- **1 / 2 / 3** — pilih scene dari layar judul.

## Scene

| Scene | Nama | Waktu | Kesulitan |
|-------|------|-------|-----------|
| 1 | Warung Senja | 180 dtk | Santai — lampu, toples, kucing, cangkir |
| 2 | Dapur Kopi | 150 dtk | Sedang — uap ketel, api, bulan di jendela |
| 3 | Teras Malam | 120 dtk | Jahat — lampu string, senar gitar, bintang |

Total 21 perbedaan. Semua gambar digambar prosedural di canvas 2D (tanpa
gambar atau library eksternal), semua suara disintesis dengan WebAudio —
tidak ada file audio, tidak ada request jaringan.

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

Staging screenshot: `?shot=play&found=3`, `?shot=play2&found=2`,
`?shot=title`, `?shot=victory`, `?shot=complete`, `?shot=timeout`.

## Struktur kode

- `game/src/config.js` — konstanta (canvas, panel, skor, waktu)
- `game/src/scenes.js` — data 3 scene + 21 perbedaan
- `game/src/differences.js` — hit-test & bookkeeping "found"
- `game/src/render.js` — semua gambar prosedural + HUD + layar
- `game/src/input.js` — mouse & keyboard
- `game/src/audio.js` — efek & ambience WebAudio
- `game/src/particles.js` — sparkle, cincin, uap kopi
- `game/src/main.js` — state machine, timer, skor, frame loop

## Entri

Kompetisi: [best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
