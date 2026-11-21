// Warung Senja — Spot the Difference: shared constants for the whole game.
// One job: every number the other modules agree on (canvas, panels, timing, scoring).
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const HUD_HEIGHT = 84;
export const PANEL_GAP = 24;
export const PANEL_WIDTH = 600;
export const PANEL_HEIGHT = 520;
export const PANEL_TOP = 108;
export const LEFT_PANEL = { x: 24, y: PANEL_TOP, w: PANEL_WIDTH, h: PANEL_HEIGHT };
export const RIGHT_PANEL = { x: 656, y: PANEL_TOP, w: PANEL_WIDTH, h: PANEL_HEIGHT };
export const BOTTOM_BAR = { x: 0, y: 640, w: GAME_WIDTH, h: 80 };

// How long the player gets per scene, in seconds. Later scenes are tighter.
export const SCENE_TIME_LIMITS = [180, 150, 120];

// Scoring: a find is worth 100, a streak multiplies it, a hint costs points.
export const POINTS_PER_FIND = 100;
export const COMBO_STEP = 25;
export const MAX_COMBO_BONUS = 100;
export const HINT_COST = 25;
export const WRONG_CLICK_TIME_PENALTY = 5;
export const HINT_COOLDOWN_MS = 15000;
export const HINT_GLOW_MS = 2200;
export const SCENE_CLEAR_TIME_BONUS_PER_SECOND = 2;

// Colours of the dusk palette, shared so both panels always agree.
export const PALETTE = {
  skyTop: '#2b1e4f',
  skyMid: '#c65d3b',
  skyLow: '#f2a65a',
  wall: '#7a4a2b',
  wallDark: '#5d3620',
  wood: '#8a5a33',
  woodDark: '#6b4222',
  cream: '#f7e8c9',
  ink: '#2e1d12',
  lampWarm: '#ffb347',
  lampCool: '#7fd4ff',
  leaf: '#3f7d44',
  leafDark: '#2c5a30',
};

export const SCENE_NAMES = ['Warung Senja', 'Dapur Kopi', 'Teras Malam'];
export const SCENE_SUBTITLES = [
  'Senja turun, warung baru buka.',
  'Dapur mengepul, kopi diseduh.',
  'Malam makin pekat di teras.',
];
