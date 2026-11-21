// Warung Senja — Spot the Difference: mouse and keyboard, nothing else.
// One job: translate raw browser events into game actions (canvas point,
// button id, or key name) and hand them to main.js. It never owns state.
import { LEFT_PANEL, RIGHT_PANEL } from './config.js';
import { hudButtons } from './render.js';

// Converts a pointer event to the game's 1280x720 coordinate space.
export function toGameCoords(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = 1280 / rect.width;
  const scaleY = 720 / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

// Which panel (if any) holds the point, and the point in panel-local coords.
export function panelHit(point) {
  for (const [name, panel] of [['left', LEFT_PANEL], ['right', RIGHT_PANEL]]) {
    if (
      point.x >= panel.x && point.x <= panel.x + panel.w &&
      point.y >= panel.y && point.y <= panel.y + panel.h
    ) {
      return { name, panel, x: point.x - panel.x, y: point.y - panel.y };
    }
  }
  return null;
}

export function hudButtonHit(point) {
  for (const button of hudButtons()) {
    if (
      point.x >= button.x && point.x <= button.x + button.w &&
      point.y >= button.y && point.y <= button.y + button.h
    ) {
      return button.id;
    }
  }
  return null;
}

// Normalises the keys the game cares about; everything else returns null.
export function normaliseKey(event) {
  const key = event.key;
  if (key === 'h' || key === 'H') return 'hint';
  if (key === 'n' || key === 'N') return 'next';
  if (key === 'r' || key === 'R') return 'restart';
  if (key === 'm' || key === 'M') return 'mute';
  if (key === 'Escape') return 'pause';
  if (key === 'Enter' || key === ' ') return 'confirm';
  if (key === '1' || key === '2' || key === '3') return `scene-${key}`;
  return null;
}
