// Warung Senja — Spot the Difference: deterministic randomness.
// One job: a tiny seeded generator so every scene draws the same way on
// every machine, and a screenshot seed always reproduces the same frame.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Picks one item from a list using the seeded generator, without mutating it.
export function pickSeeded(rand, list) {
  return list[Math.floor(rand() * list.length)];
}
