// Warung Senja — Spot the Difference: the game itself.
// One job: own the state machine (title, how-to, play, pause, scene
// complete, victory, time up), the timer, the score, and the frame loop.
// Drawing lives in render.js, input in input.js, sound in audio.js.
import {
  GAME_WIDTH, GAME_HEIGHT, LEFT_PANEL, RIGHT_PANEL,
  POINTS_PER_FIND, COMBO_STEP, MAX_COMBO_BONUS, HINT_COST,
  WRONG_CLICK_TIME_PENALTY, HINT_COOLDOWN_MS, HINT_GLOW_MS,
  SCENE_CLEAR_TIME_BONUS_PER_SECOND,
} from './config.js';
import { SCENES, sceneByIndex, totalDifferences } from './scenes.js';
import { differenceAt, remainingDifferences, allFound } from './differences.js';
import {
  drawScenePanel, drawFoundMarker, drawHintRing, drawMissMark, drawHud,
  drawTitleScreen, drawHowToScreen, drawPauseScreen, drawSceneCompleteScreen,
  drawVictoryScreen, drawTimeUpScreen,
} from './render.js';
import { toGameCoords, panelHit, hudButtonHit, normaliseKey } from './input.js';
import { SoundEngine } from './audio.js';
import { ParticleSystem } from './particles.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');
const sound = new SoundEngine();
const particles = new ParticleSystem();

const state = {
  screen: 'title',
  sceneIndex: 0,
  found: new Set(),
  score: 0,
  combo: 0,
  timeLeft: sceneByIndex(0).timeLimit,
  totalTimeUsed: 0,
  clicks: 0,
  correctClicks: 0,
  hintsUsed: 0,
  lastTimeBonus: 0,
  hintCooldownUntil: 0,
  hintGlow: null,
  misses: [],
  shakeUntil: 0,
  hoverButton: null,
  bestScore: 0,
  startedAt: 0,
};

try {
  state.bestScore = Number(window.localStorage.getItem('warung-senja-best') ?? 0) || 0;
} catch {
  state.bestScore = 0;
}

function saveBestScore() {
  if (state.score <= state.bestScore) return;
  state.bestScore = state.score;
  try {
    window.localStorage.setItem('warung-senja-best', String(state.bestScore));
  } catch {
    // Private mode: the score just does not persist.
  }
}

function startScene(index) {
  state.sceneIndex = index;
  state.found = new Set();
  state.combo = 0;
  state.timeLeft = sceneByIndex(index).timeLimit;
  state.hintGlow = null;
  state.misses = [];
  state.screen = 'play';
  state.startedAt = performance.now();
  announce(`Scene ${index + 1}: ${sceneByIndex(index).name}. Sisa 7 dari 7.`);
}

function startGame() {
  state.score = 0;
  state.totalTimeUsed = 0;
  state.clicks = 0;
  state.correctClicks = 0;
  state.hintsUsed = 0;
  startScene(0);
}

function completeScene() {
  const bonus = Math.floor(state.timeLeft) * SCENE_CLEAR_TIME_BONUS_PER_SECOND;
  state.lastTimeBonus = bonus;
  state.score += bonus;
  state.totalTimeUsed += sceneByIndex(state.sceneIndex).timeLimit - state.timeLeft;
  state.screen = 'complete';
  sound.playSceneClear();
  announce(`Scene selesai. Bonus waktu ${bonus} poin. Skor ${state.score}.`);
}

function finishGame() {
  state.screen = 'victory';
  saveBestScore();
  sound.playVictory();
  announce(`Menang! Skor akhir ${state.score}.`);
}

function nextScreen() {
  if (state.screen === 'complete') {
    if (state.sceneIndex < SCENES.length - 1) startScene(state.sceneIndex + 1);
    else finishGame();
  }
}

function useHint(now) {
  if (state.screen !== 'play') return;
  if (now < state.hintCooldownUntil) return;
  const remaining = remainingDifferences(state.sceneIndex, state.found);
  if (remaining.length === 0) return;
  const target = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintGlow = { id: target.id, until: now + HINT_GLOW_MS };
  state.hintCooldownUntil = now + HINT_COOLDOWN_MS;
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - HINT_COST);
  sound.playHint();
  announce(`Hint: perhatikan sekitar ${target.label}.`);
}

function handlePanelClick(hit, now) {
  state.clicks += 1;
  const diff = differenceAt(state.sceneIndex, hit.x, hit.y);
  if (!diff || state.found.has(diff.id)) {
    if (diff) return; // clicking an already-found difference does nothing
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_TIME_PENALTY);
    state.misses.push({ x: hit.x, y: hit.y, panel: hit.name, at: now });
    state.shakeUntil = now + 200;
    sound.playMiss();
    announce('Bukan itu. Waktu berkurang 5 detik.');
    return;
  }
  state.found.add(diff.id);
  state.correctClicks += 1;
  const comboBonus = Math.min(state.combo * COMBO_STEP, MAX_COMBO_BONUS);
  state.score += POINTS_PER_FIND + comboBonus;
  state.combo += 1;
  particles.burst(hit.x, hit.y, '#ffd166');
  particles.ring(hit.x, hit.y);
  sound.playFound();
  const remaining = sceneByIndex(state.sceneIndex).diffs.length - state.found.size;
  announce(`Ketemu: ${diff.label}. Sisa ${remaining} dari 7.`);
  if (allFound(state.sceneIndex, state.found)) completeScene();
}

function onPointerDown(event) {
  sound.unlock();
  const point = toGameCoords(canvas, event);
  const now = performance.now();
  if (state.screen === 'title') {
    state.screen = 'howto';
    sound.playClick();
    return;
  }
  if (state.screen === 'howto') {
    startGame();
    return;
  }
  if (state.screen === 'complete' || state.screen === 'victory') {
    if (state.screen === 'complete') nextScreen();
    return;
  }
  if (state.screen === 'timeout') return;
  if (state.screen === 'pause') {
    state.screen = 'play';
    return;
  }
  if (state.screen !== 'play') return;
  const button = hudButtonHit(point);
  if (button === 'hint') {
    useHint(now);
    return;
  }
  if (button === 'pause') {
    state.screen = 'pause';
    sound.playClick();
    return;
  }
  if (button === 'mute') {
    sound.toggleMute();
    sound.playClick();
    return;
  }
  const hit = panelHit(point);
  if (hit) handlePanelClick(hit, now);
}

function onPointerMove(event) {
  const point = toGameCoords(canvas, event);
  state.hoverButton = hudButtonHit(point);
}

function onKeyDown(event) {
  const action = normaliseKey(event);
  if (!action) return;
  const now = performance.now();
  if (action === 'mute') {
    sound.unlock();
    const muted = sound.toggleMute();
    announce(muted ? 'Suara dimatikan.' : 'Suara dinyalakan.');
    return;
  }
  if (action === 'confirm') {
    sound.unlock();
    if (state.screen === 'title') state.screen = 'howto';
    else if (state.screen === 'howto') startGame();
    else if (state.screen === 'complete') nextScreen();
    else if (state.screen === 'victory') startGame();
    else if (state.screen === 'timeout') startScene(state.sceneIndex);
    else if (state.screen === 'pause') state.screen = 'play';
    return;
  }
  if (action === 'pause') {
    if (state.screen === 'play') state.screen = 'pause';
    else if (state.screen === 'pause') state.screen = 'play';
    return;
  }
  if (action === 'restart') {
    if (state.screen === 'victory') startGame();
    else startScene(state.sceneIndex);
    return;
  }
  if (action === 'hint') {
    useHint(now);
    return;
  }
  if (action === 'next') {
    nextScreen();
    return;
  }
  if (action.startsWith('scene-')) {
    const index = Number(action.slice('scene-'.length)) - 1;
    if (state.screen === 'title' || state.screen === 'howto') {
      state.score = 0;
      state.totalTimeUsed = 0;
      state.clicks = 0;
      state.correctClicks = 0;
      state.hintsUsed = 0;
      startScene(index);
    }
    return;
  }
}

function announce(message) {
  if (statusLine) statusLine.textContent = message;
}

function accuracy() {
  if (state.clicks === 0) return 100;
  return Math.round((state.correctClicks / state.clicks) * 100);
}

// ---------- staging: ?shot=...&found=N&seed=N ----------
// Lets the maker stage exact frames for screenshots without playing:
// ?shot=play&found=3 marks three differences found in scene 1,
// ?shot=play2&found=2 does the same in scene 2, ?shot=victory shows
// the end screen with a finished run's totals.
function applyShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  const foundCount = Math.max(0, Math.min(7, Number(params.get('found') ?? 0) || 0));
  const markFound = () => {
    state.found = new Set(sceneByIndex(state.sceneIndex).diffs.slice(0, foundCount).map((d) => d.id));
  };
  if (shot === 'title') {
    state.screen = 'title';
  } else if (shot === 'howto') {
    state.screen = 'howto';
  } else if (shot === 'play') {
    state.sceneIndex = 0;
    state.timeLeft = 147;
    state.score = 300;
    markFound();
    state.screen = 'play';
  } else if (shot === 'play2') {
    state.sceneIndex = 1;
    state.timeLeft = 118;
    state.score = 940;
    markFound();
    state.screen = 'play';
  } else if (shot === 'play3') {
    state.sceneIndex = 2;
    state.timeLeft = 96;
    state.score = 1680;
    markFound();
    state.screen = 'play';
  } else if (shot === 'complete') {
    state.sceneIndex = 0;
    state.score = 840;
    state.lastTimeBonus = 140;
    state.found = new Set(sceneByIndex(0).diffs.map((d) => d.id));
    state.screen = 'complete';
  } else if (shot === 'victory') {
    state.score = 2450;
    state.totalTimeUsed = 321;
    state.clicks = 24;
    state.correctClicks = 21;
    state.hintsUsed = 2;
    state.screen = 'victory';
  } else if (shot === 'timeout') {
    state.sceneIndex = 1;
    state.timeLeft = 0;
    state.found = new Set(sceneByIndex(1).diffs.slice(0, 4).map((d) => d.id));
    state.screen = 'timeout';
  }
}

// ---------- frame loop ----------

let lastTime = performance.now();
let steamAccumulator = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (state.screen === 'play') {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.totalTimeUsed += sceneByIndex(state.sceneIndex).timeLimit;
      state.screen = 'timeout';
      saveBestScore();
      sound.playMiss();
      announce('Waktu habis.');
    }
  }
  if (state.hintGlow && now > state.hintGlow.until) state.hintGlow = null;
  state.misses = state.misses.filter((miss) => now - miss.at < 600);
  // Gentle steam above the hot drinks, both panels alike.
  steamAccumulator += dt;
  if (steamAccumulator > 0.4) {
    steamAccumulator = 0;
    const steamSpots = state.sceneIndex === 0 ? [[205, 344]] : state.sceneIndex === 1 ? [[178, 244]] : [[300, 380]];
    for (const [sx, sy] of steamSpots) particles.steam(sx, sy, now);
  }
  particles.update(dt);

  ctx.save();
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = '#1d1420';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  if (now < state.shakeUntil) {
    ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
  }
  if (state.screen === 'title') {
    drawTitleScreen(ctx, state.bestScore);
  } else if (state.screen === 'howto') {
    drawHowToScreen(ctx);
  } else if (
    state.screen === 'play' || state.screen === 'pause' ||
    state.screen === 'complete' || state.screen === 'timeout'
  ) {
    drawHud(ctx, { ...state, accuracy: accuracy() });
    const scene = sceneByIndex(state.sceneIndex);
    const modified = new Set(scene.diffs.map((d) => d.id));
    const foundSet = state.found;
    for (const [panel, isRight] of [[LEFT_PANEL, false], [RIGHT_PANEL, true]]) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(panel.x, panel.y, panel.w, panel.h);
      ctx.clip();
      ctx.translate(panel.x, panel.y);
      drawScenePanel(ctx, state.sceneIndex, isRight ? modified : new Set(), now);
      particles.draw(ctx);
      for (const diff of scene.diffs) {
        if (foundSet.has(diff.id)) drawFoundMarker(ctx, diff.x, diff.y, now);
      }
      if (state.hintGlow) {
        const hint = scene.diffs.find((d) => d.id === state.hintGlow.id);
        if (hint) drawHintRing(ctx, hint.x, hint.y, now);
      }
      for (const miss of state.misses) {
        if (miss.panel === (isRight ? 'right' : 'left')) drawMissMark(ctx, miss.x, miss.y, now - miss.at);
      }
      ctx.restore();
    }
    // Panel captions sit just above each frame.
    ctx.fillStyle = '#f7e8c9';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('◀  ASLI', LEFT_PANEL.x + 4, LEFT_PANEL.y - 10);
    ctx.textAlign = 'right';
    ctx.fillText('CARI BEDANYA  ▶', RIGHT_PANEL.x + RIGHT_PANEL.w - 4, RIGHT_PANEL.y - 10);
    if (state.screen === 'pause') drawPauseScreen(ctx);
    else if (state.screen === 'complete') drawSceneCompleteScreen(ctx, state);
    else if (state.screen === 'timeout') drawTimeUpScreen(ctx, state);
  } else if (state.screen === 'victory') {
    drawVictoryScreen(ctx, { ...state, accuracy: accuracy(), totalDifferences: totalDifferences() });
  }
  ctx.restore();
  requestAnimationFrame(frame);
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
window.addEventListener('keydown', onKeyDown);
applyShotParams();

// Exposed for automated playtests only: read the live state, never write it.
window.__warung = {
  get screen() { return state.screen; },
  get sceneIndex() { return state.sceneIndex; },
  get found() { return [...state.found]; },
  get score() { return state.score; },
  get timeLeft() { return state.timeLeft; },
  get combo() { return state.combo; },
  get hintGlow() { return state.hintGlow; },
  get misses() { return state.misses.length; },
};

requestAnimationFrame(frame);
