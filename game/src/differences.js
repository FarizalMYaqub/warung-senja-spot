// Warung Senja — Spot the Difference: finding differences under the cursor.
// One job: given a scene and a point in panel-local coordinates, say which
// difference (if any) was hit, and keep the per-scene "found" bookkeeping
// in one place so input.js and main.js never duplicate the math.
import { sceneByIndex } from './scenes.js';

// Returns the difference whose circle contains (x, y), or null.
// The nearest centre wins when two circles overlap.
export function differenceAt(sceneIndex, x, y) {
  const scene = sceneByIndex(sceneIndex);
  let best = null;
  let bestDistance = Infinity;
  for (const diff of scene.diffs) {
    const dx = x - diff.x;
    const dy = y - diff.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= diff.r && distance < bestDistance) {
      best = diff;
      bestDistance = distance;
    }
  }
  return best;
}

export function remainingDifferences(sceneIndex, foundIds) {
  return sceneByIndex(sceneIndex).diffs.filter((diff) => !foundIds.has(diff.id));
}

export function firstRemainingDifference(sceneIndex, foundIds) {
  return remainingDifferences(sceneIndex, foundIds)[0] ?? null;
}

export function allFound(sceneIndex, foundIds) {
  return remainingDifferences(sceneIndex, foundIds).length === 0;
}

export function foundCount(sceneIndex, foundIds) {
  return sceneByIndex(sceneIndex).diffs.length - remainingDifferences(sceneIndex, foundIds).length;
}
