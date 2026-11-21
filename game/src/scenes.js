// Warung Senja — Spot the Difference: the three scenes and their differences.
// One job: data only. Each difference has a stable id, a label for the
// how-to screen, a panel-local position (panel is 600 x 520) and a hit
// radius. The drawing code in render.js decides what each id changes.
// Coordinates are the same in both panels; the right panel draws the
// changed version, the left panel the original.
export const SCENES = [
  {
    name: 'Warung Senja',
    seed: 1107,
    timeLimit: 180,
    diffs: [
      { id: 'lamp', label: 'Warna lampu gantung', x: 300, y: 62, r: 34 },
      { id: 'jar', label: 'Toples di rak', x: 148, y: 176, r: 30 },
      { id: 'cat-tail', label: 'Ekor kucing', x: 468, y: 428, r: 34 },
      { id: 'cup', label: 'Warna cangkir', x: 205, y: 372, r: 30 },
      { id: 'poster', label: 'Gambar di poster', x: 512, y: 148, r: 32 },
      { id: 'basket', label: 'Keranjang sepeda', x: 92, y: 452, r: 32 },
      { id: 'clock', label: 'Jarum jam dinding', x: 428, y: 118, r: 30 },
    ],
  },
  {
    name: 'Dapur Kopi',
    seed: 2209,
    timeLimit: 150,
    diffs: [
      { id: 'steam', label: 'Uap dari ketel', x: 178, y: 200, r: 32 },
      { id: 'mug', label: 'Warna mug gantung', x: 452, y: 227, r: 28 },
      { id: 'sack', label: 'Label karung kopi', x: 96, y: 430, r: 32 },
      { id: 'spoon', label: 'Sendok di meja', x: 330, y: 402, r: 28 },
      { id: 'flame', label: 'Warna api kompor', x: 178, y: 330, r: 30 },
      { id: 'moon', label: 'Bulan di jendela', x: 470, y: 92, r: 30 },
      { id: 'towel', label: 'Motif handuk', x: 300, y: 250, r: 28 },
    ],
  },
  {
    name: 'Teras Malam',
    seed: 3313,
    timeLimit: 120,
    diffs: [
      { id: 'bulb', label: 'Lampu string yang mati', x: 150, y: 105, r: 28 },
      { id: 'guitar', label: 'Senar gitar', x: 512, y: 360, r: 32 },
      { id: 'radio', label: 'Jarum radio', x: 96, y: 300, r: 30 },
      { id: 'star', label: 'Bintang di langit', x: 330, y: 62, r: 28 },
      { id: 'cushion', label: 'Warna bantal kursi', x: 445, y: 405, r: 30 },
      { id: 'crater', label: 'Kawah di bulan', x: 500, y: 70, r: 30 },
      { id: 'leaf', label: 'Daun tanaman', x: 70, y: 250, r: 30 },
    ],
  },
];

export function sceneByIndex(index) {
  return SCENES[index] ?? SCENES[0];
}

export function totalDifferences() {
  return SCENES.reduce((sum, scene) => sum + scene.diffs.length, 0);
}
