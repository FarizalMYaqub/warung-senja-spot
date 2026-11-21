// Warung Senja — Spot the Difference: everything the player sees.
// One job: draw. Scenes are painted procedurally on canvas (no images),
// the left panel always the original, the right panel the same scene with
// the differences applied; plus the HUD, the markers, and every screen
// (title, how-to, pause, scene complete, victory, time up).
import {
  GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT, LEFT_PANEL, RIGHT_PANEL,
  PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT, PALETTE, SCENE_NAMES, SCENE_SUBTITLES,
} from './config.js';
import { sceneByIndex } from './scenes.js';
import { mulberry32 } from './random.js';

export function hudButtons() {
  return [
    { id: 'hint', label: 'Hint (H)', x: 1010, y: 18, w: 84, h: 44 },
    { id: 'pause', label: 'Jeda (Esc)', x: 1102, y: 18, w: 84, h: 44 },
    { id: 'mute', label: 'Suara (M)', x: 1194, y: 18, w: 70, h: 44 },
  ];
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

// ---------- shared scene helpers ----------

function drawWoodFloor(ctx, y) {
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, y, PANEL_WIDTH, PANEL_HEIGHT - y);
  ctx.fillStyle = PALETTE.wood;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(0, y + 8 + i * 18, PANEL_WIDTH, 3);
  }
}

function drawSunsetWindow(ctx, x, y, w, h, seed) {
  const rand = mulberry32(seed);
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#3a2a6b');
  sky.addColorStop(0.55, '#c65d3b');
  sky.addColorStop(1, '#f2a65a');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ffd98a';
  circle(ctx, x + w * 0.62, y + h * 0.42, 26);
  ctx.fill();
  ctx.fillStyle = '#7a4a2b';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w * 0.3, y + h * 0.62);
  ctx.lineTo(x + w * 0.62, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5d3620';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.45, y + h);
  ctx.lineTo(x + w * 0.8, y + h * 0.7);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 5; i += 1) {
    ctx.globalAlpha = 0.25 + rand() * 0.4;
    circle(ctx, x + rand() * w, y + rand() * h * 0.4, 1.5);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 8;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
}

function drawHangingLamp(ctx, modified, now) {
  const flicker = 0.9 + Math.sin(now / 300) * 0.06;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 0);
  ctx.lineTo(300, 42);
  ctx.stroke();
  ctx.fillStyle = '#3f6d4e';
  ctx.beginPath();
  ctx.moveTo(268, 52);
  ctx.lineTo(332, 52);
  ctx.lineTo(316, 22);
  ctx.lineTo(284, 22);
  ctx.closePath();
  ctx.fill();
  const glow = ctx.createRadialGradient(300, 66, 4, 300, 66, 60);
  const bulb = modified ? PALETTE.lampCool : PALETTE.lampWarm;
  glow.addColorStop(0, bulb);
  glow.addColorStop(1, 'rgba(255,180,70,0)');
  ctx.globalAlpha = flicker;
  ctx.fillStyle = glow;
  circle(ctx, 300, 66, 60);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = bulb;
  circle(ctx, 300, 62, 11);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  circle(ctx, 296, 58, 3.5);
  ctx.fill();
  // Warm light cone on the counter below.
  ctx.fillStyle = modified ? 'rgba(127,212,255,0.10)' : 'rgba(255,179,71,0.13)';
  ctx.beginPath();
  ctx.moveTo(282, 74);
  ctx.lineTo(318, 74);
  ctx.lineTo(360, 340);
  ctx.lineTo(240, 340);
  ctx.closePath();
  ctx.fill();
}

function drawShelfWithJars(ctx, modified) {
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(70, 196, 220, 12);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(70, 208, 220, 4);
  const jars = [
    { x: 108, color: '#d97b4f' },
    { x: 148, color: '#7ba05b' },
    { x: 188, color: '#c9a227' },
  ];
  jars.forEach((jar, i) => {
    if (modified && i === 1) return; // the middle jar is gone on the right
    ctx.fillStyle = jar.color;
    roundRect(ctx, jar.x - 16, 158, 32, 38, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(jar.x - 11, 164, 5, 26);
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(jar.x - 17, 152, 34, 8);
  });
}

function drawPoster(ctx, modified) {
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(468, 100, 92, 96);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(468, 100, 92, 96);
  ctx.fillStyle = '#c65d3b';
  ctx.fillRect(478, 108, 72, 14);
  ctx.fillStyle = '#3f6d4e';
  ctx.beginPath();
  ctx.moveTo(478, 188);
  ctx.lineTo(514, 146);
  ctx.lineTo(550, 188);
  ctx.closePath();
  ctx.fill();
  if (modified) {
    // The poster's sun became a star.
    ctx.fillStyle = '#c9a227';
    const cx = 536;
    const cy = 138;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 11 : 4.5;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#f2a65a';
    circle(ctx, 536, 138, 11);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KOPI SENJA', 514, 182);
}

function drawWallClock(ctx, modified) {
  ctx.fillStyle = '#f7e8c9';
  circle(ctx, 428, 118, 26);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(428, 118, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = PALETTE.ink;
  for (let i = 0; i < 12; i += 1) {
    const a = (i * Math.PI) / 6;
    circle(ctx, 428 + Math.cos(a) * 20, 118 + Math.sin(a) * 20, 1.6);
    ctx.fill();
  }
  const hourAngle = modified ? (7.5 * Math.PI) / 6 : (5 * Math.PI) / 6;
  const minuteAngle = modified ? Math.PI : Math.PI / 2;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(428, 118);
  ctx.lineTo(428 + Math.cos(hourAngle - Math.PI / 2) * 12, 118 + Math.sin(hourAngle - Math.PI / 2) * 12);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(428, 118);
  ctx.lineTo(428 + Math.cos(minuteAngle - Math.PI / 2) * 18, 118 + Math.sin(minuteAngle - Math.PI / 2) * 18);
  ctx.stroke();
}

function drawCounterWithCups(ctx, modified, now) {
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(0, 340, PANEL_WIDTH, 18);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, 358, PANEL_WIDTH, 72);
  ctx.fillStyle = '#4a2c17';
  ctx.fillRect(0, 430, PANEL_WIDTH, 90);
  const cups = [
    { x: 158, color: '#3f6d8e' },
    { x: 205, color: modified ? '#3f6d8e' : '#b3402e' },
    { x: 252, color: '#7ba05b' },
  ];
  for (const cup of cups) {
    ctx.fillStyle = cup.color;
    roundRect(ctx, cup.x - 15, 344, 30, 26, 4);
    ctx.fill();
    ctx.strokeStyle = cup.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cup.x + 16, 356, 7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = '#2e1d12';
    ctx.fillRect(cup.x - 13, 346, 26, 4);
  }
  // A small plate of pisang goreng on the counter.
  ctx.fillStyle = '#f7e8c9';
  ctx.beginPath();
  ctx.ellipse(330, 362, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.ellipse(318, 358, 12, 5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(336, 357, 12, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  void now;
}

function drawCatOnBench(ctx, modified) {
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(400, 452, 160, 12);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(412, 464, 10, 56);
  ctx.fillRect(538, 464, 10, 56);
  // Tail: raised and curled on the left, lying flat on the right.
  ctx.strokeStyle = '#e07840';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (modified) {
    ctx.moveTo(428, 448);
    ctx.quadraticCurveTo(404, 452, 398, 436);
  } else {
    ctx.moveTo(428, 448);
    ctx.quadraticCurveTo(414, 420, 428, 398);
  }
  ctx.stroke();
  // Body and head.
  ctx.fillStyle = '#e07840';
  ctx.beginPath();
  ctx.ellipse(462, 436, 34, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, 490, 412, 17);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(478, 400);
  ctx.lineTo(482, 384);
  ctx.lineTo(490, 398);
  ctx.moveTo(498, 398);
  ctx.lineTo(504, 384);
  ctx.lineTo(506, 400);
  ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  circle(ctx, 495, 409, 2);
  ctx.fill();
  circle(ctx, 503, 409, 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(482, 418);
  ctx.lineTo(472, 416);
  ctx.moveTo(482, 421);
  ctx.lineTo(472, 423);
  ctx.stroke();
}

function drawBicycle(ctx, modified) {
  ctx.strokeStyle = '#2e4a6b';
  ctx.lineWidth = 4;
  circle(ctx, 72, 462, 26);
  ctx.stroke();
  circle(ctx, 158, 462, 26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(72, 462);
  ctx.lineTo(108, 420);
  ctx.lineTo(158, 462);
  ctx.moveTo(108, 420);
  ctx.lineTo(96, 400);
  ctx.moveTo(108, 420);
  ctx.lineTo(140, 420);
  ctx.lineTo(158, 462);
  ctx.moveTo(140, 420);
  ctx.lineTo(146, 396);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(88, 398);
  ctx.lineTo(104, 398);
  ctx.moveTo(140, 394);
  ctx.lineTo(154, 394);
  ctx.stroke();
  if (!modified) {
    // Woven front basket, only on the original side.
    ctx.fillStyle = '#b98a4e';
    ctx.fillRect(52, 424, 34, 24);
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(52, 430 + i * 7);
      ctx.lineTo(86, 430 + i * 7);
      ctx.stroke();
    }
    ctx.strokeStyle = '#2e4a6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(86, 430);
    ctx.lineTo(96, 404);
    ctx.stroke();
  }
  // A small potted plant on the floor for depth.
  ctx.fillStyle = '#b3402e';
  ctx.beginPath();
  ctx.moveTo(196, 486);
  ctx.lineTo(224, 486);
  ctx.lineTo(218, 458);
  ctx.lineTo(202, 458);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.leaf;
  circle(ctx, 210, 446, 12);
  ctx.fill();
  circle(ctx, 200, 452, 9);
  ctx.fill();
  circle(ctx, 220, 452, 9);
  ctx.fill();
}

// ---------- scene 1: Warung Senja ----------

function drawSceneWarung(ctx, modified, now) {
  const wall = ctx.createLinearGradient(0, 0, 0, PANEL_HEIGHT);
  wall.addColorStop(0, PALETTE.wall);
  wall.addColorStop(1, PALETTE.wallDark);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
  drawWoodFloor(ctx, 430);
  drawSunsetWindow(ctx, 30, 30, 200, 190, 1107);
  drawShelfWithJars(ctx, modified.has('jar'));
  drawPoster(ctx, modified.has('poster'));
  drawWallClock(ctx, modified.has('clock'));
  drawHangingLamp(ctx, modified.has('lamp'), now);
  drawCounterWithCups(ctx, modified.has('cup'), now);
  drawBicycle(ctx, modified.has('basket'));
  drawCatOnBench(ctx, modified.has('cat-tail'));
  // A soft shadow strip under the counter keeps the floor line crisp.
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, 506, PANEL_WIDTH, 14);
}

// ---------- scene 2: Dapur Kopi ----------

function drawKettleSteam(ctx, modified, now) {
  if (modified) return; // the right panel's kettle has gone cold: no steam
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i += 1) {
    const phase = now / 900 + i * 2.1;
    const x = 168 + i * 12 + Math.sin(phase) * 7;
    ctx.beginPath();
    ctx.moveTo(x, 252);
    ctx.quadraticCurveTo(x + Math.sin(phase) * 12, 210, x + Math.cos(phase) * 8, 168);
    ctx.stroke();
  }
}

function drawStoveAndKettle(ctx, modified, now) {
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(96, 296, 170, 60);
  ctx.fillStyle = '#55555f';
  ctx.fillRect(96, 296, 170, 8);
  // Kettle body, drawn first so the flame can lick its base afterwards.
  ctx.fillStyle = '#8e8e9a';
  ctx.beginPath();
  ctx.moveTo(146, 296);
  ctx.quadraticCurveTo(140, 250, 178, 244);
  ctx.quadraticCurveTo(216, 250, 210, 296);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6e6e7a';
  ctx.beginPath();
  ctx.moveTo(168, 244);
  ctx.lineTo(188, 244);
  ctx.lineTo(184, 232);
  ctx.lineTo(172, 232);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6e6e7a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(210, 262);
  ctx.quadraticCurveTo(232, 258, 226, 282);
  ctx.stroke();
  // Burner flame under the kettle: orange on the left, blue on the right.
  const flame = ctx.createLinearGradient(0, 316, 0, 288);
  if (modified.has('flame')) {
    flame.addColorStop(0, '#2f7fd0');
    flame.addColorStop(1, '#9fd8ff');
  } else {
    flame.addColorStop(0, '#d94f1e');
    flame.addColorStop(1, '#ffb347');
  }
  ctx.fillStyle = flame;
  const flicker = Math.sin(now / 160) * 3;
  ctx.beginPath();
  ctx.moveTo(142, 300);
  ctx.quadraticCurveTo(150, 284 + flicker, 162, 292);
  ctx.quadraticCurveTo(172, 282 + flicker, 184, 292);
  ctx.quadraticCurveTo(196, 284 + flicker, 214, 300);
  ctx.closePath();
  ctx.fill();
  drawKettleSteam(ctx, modified.has('steam'), now);
}

function drawNightWindow(ctx, modified) {
  ctx.fillStyle = '#141b3a';
  ctx.fillRect(392, 40, 172, 140);
  ctx.fillStyle = '#fff';
  const rand = mulberry32(2209);
  for (let i = 0; i < 14; i += 1) {
    ctx.globalAlpha = 0.4 + rand() * 0.6;
    circle(ctx, 400 + rand() * 156, 48 + rand() * 124, 1.4);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (modified.has('moon')) {
    // Crescent moon on the right panel.
    ctx.fillStyle = '#f2e3b3';
    circle(ctx, 470, 92, 22);
    ctx.fill();
    ctx.fillStyle = '#141b3a';
    circle(ctx, 480, 86, 19);
    ctx.fill();
  } else {
    ctx.fillStyle = '#f2e3b3';
    circle(ctx, 470, 92, 22);
    ctx.fill();
    ctx.fillStyle = '#d9c48a';
    circle(ctx, 462, 86, 4);
    ctx.fill();
    circle(ctx, 478, 100, 3);
    ctx.fill();
  }
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 8;
  ctx.strokeRect(392, 40, 172, 140);
  ctx.beginPath();
  ctx.moveTo(478, 40);
  ctx.lineTo(478, 180);
  ctx.moveTo(392, 110);
  ctx.lineTo(564, 110);
  ctx.stroke();
}

function drawHangingMugs(ctx, modified) {
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(396, 196, 168, 8);
  const mugs = [
    { x: 424, color: '#3f6d8e' },
    { x: 452, color: modified.has('mug') ? '#7ba05b' : '#b3402e' },
    { x: 480, color: '#c9a227' },
  ];
  for (const mug of mugs) {
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mug.x, 204);
    ctx.lineTo(mug.x, 214);
    ctx.stroke();
    ctx.fillStyle = mug.color;
    roundRect(ctx, mug.x - 13, 214, 26, 26, 4);
    ctx.fill();
    ctx.strokeStyle = mug.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mug.x + 14, 227, 6, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
}

function drawCoffeeSack(ctx, modified) {
  ctx.fillStyle = '#c9a86a';
  ctx.beginPath();
  ctx.moveTo(56, 392);
  ctx.quadraticCurveTo(50, 440, 66, 468);
  ctx.lineTo(126, 468);
  ctx.quadraticCurveTo(142, 440, 136, 392);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8a6a35';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 404);
  ctx.quadraticCurveTo(96, 412, 132, 404);
  ctx.stroke();
  if (modified.has('sack')) {
    // The label lost its coffee-bean mark: a plain stitched circle.
    ctx.strokeStyle = '#8a6a35';
    ctx.lineWidth = 2;
    circle(ctx, 96, 436, 16);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#5d3620';
    ctx.beginPath();
    ctx.ellipse(96, 436, 9, 13, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f7e8c9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 428);
    ctx.quadraticCurveTo(96, 436, 102, 444);
    ctx.stroke();
  }
  // Spilled beans beside the sack.
  ctx.fillStyle = '#5d3620';
  for (const [bx, by] of [[150, 462], [162, 470], [146, 474], [170, 458]]) {
    ctx.beginPath();
    ctx.ellipse(bx, by, 5, 3.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTowelAndCounter(ctx, modified) {
  ctx.fillStyle = '#d9cdb2';
  ctx.fillRect(0, 356, PANEL_WIDTH, 16);
  ctx.fillStyle = '#b8a988';
  ctx.fillRect(0, 372, PANEL_WIDTH, 148);
  // Towel on its rail.
  ctx.strokeStyle = '#8a6a35';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(258, 232);
  ctx.lineTo(342, 232);
  ctx.stroke();
  if (modified.has('towel')) {
    ctx.fillStyle = '#f7e8c9';
    ctx.fillRect(272, 232, 56, 62);
    ctx.fillStyle = '#b3402e';
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 2; j += 1) {
        circle(ctx, 284 + i * 16, 248 + j * 22, 4);
        ctx.fill();
      }
    }
  } else {
    ctx.fillStyle = '#e07840';
    ctx.fillRect(272, 232, 56, 62);
    ctx.fillStyle = '#f7e8c9';
    ctx.fillRect(272, 248, 56, 8);
    ctx.fillRect(272, 272, 56, 8);
  }
  // Spoon on the counter: one spoon left, two on the right.
  ctx.fillStyle = '#c9c9d4';
  for (const sx of modified.has('spoon') ? [322, 346] : [330]) {
    ctx.beginPath();
    ctx.ellipse(sx, 402, 7, 11, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(sx - 1.5, 410, 3, 22);
  }
  // A jar of sugar and a small grinder for depth.
  ctx.fillStyle = '#e8dcc0';
  roundRect(ctx, 420, 392, 40, 40, 5);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(424, 398, 32, 18);
  ctx.fillStyle = '#5d3620';
  ctx.fillRect(468, 404, 46, 28);
  ctx.beginPath();
  ctx.moveTo(478, 404);
  ctx.lineTo(470, 386);
  ctx.lineTo(484, 386);
  ctx.closePath();
  ctx.fill();
}

function drawSceneKitchen(ctx, modified, now) {
  const wall = ctx.createLinearGradient(0, 0, 0, PANEL_HEIGHT);
  wall.addColorStop(0, '#4a6741');
  wall.addColorStop(1, '#2f4a2e');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.fillStyle = '#f7e8c9';
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      ctx.globalAlpha = 0.08;
      ctx.fillRect(8 + col * 74, 200 + row * 34, 66, 28);
    }
  }
  ctx.globalAlpha = 1;
  drawNightWindow(ctx, modified);
  drawHangingMugs(ctx, modified);
  drawStoveAndKettle(ctx, modified, now);
  drawTowelAndCounter(ctx, modified);
  drawCoffeeSack(ctx, modified);
}

// ---------- scene 3: Teras Malam ----------

function drawStringLights(ctx, modified, now) {
  ctx.strokeStyle = '#1c1c26';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 44);
  ctx.quadraticCurveTo(300, 108, 600, 44);
  ctx.stroke();
  const bulbXs = [60, 150, 240, 330, 420, 510];
  bulbXs.forEach((bx, i) => {
    const t = (bx - 0) / 600;
    const by = 44 + (108 - 44) * 4 * t * (1 - t) * 0.9 + 18;
    const lit = !(modified.has('bulb') && i === 1);
    if (lit) {
      const glow = ctx.createRadialGradient(bx, by, 2, bx, by, 26);
      glow.addColorStop(0, 'rgba(255,214,120,0.9)');
      glow.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = glow;
      circle(ctx, bx, by, 26);
      ctx.fill();
    }
    ctx.fillStyle = lit ? '#ffd678' : '#3a3a44';
    circle(ctx, bx, by, 7);
    ctx.fill();
    ctx.fillStyle = '#2e2e38';
    ctx.fillRect(bx - 4, by - 13, 8, 6);
  });
  void now;
}

function drawNightSky(ctx, modified, seed) {
  const rand = mulberry32(seed);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 26; i += 1) {
    const sx = 20 + rand() * 560;
    const sy = 120 + rand() * 180;
    if (modified.has('star') && i === 3) continue;
    ctx.globalAlpha = 0.35 + rand() * 0.65;
    circle(ctx, sx, sy, 1 + rand() * 1.6);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // The one bright star the difference hides.
  if (!modified.has('star')) {
    ctx.fillStyle = '#fff8d0';
    const sx = 330;
    const sy = 62;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 10);
    ctx.lineTo(sx + 3, sy - 3);
    ctx.lineTo(sx + 10, sy);
    ctx.lineTo(sx + 3, sy + 3);
    ctx.lineTo(sx, sy + 10);
    ctx.lineTo(sx - 3, sy + 3);
    ctx.lineTo(sx - 10, sy);
    ctx.lineTo(sx - 3, sy - 3);
    ctx.closePath();
    ctx.fill();
  }
  // Moon with (or without) its crater.
  ctx.fillStyle = '#f2e3b3';
  circle(ctx, 500, 70, 24);
  ctx.fill();
  if (!modified.has('crater')) {
    ctx.fillStyle = '#d9c48a';
    circle(ctx, 492, 62, 5);
    ctx.fill();
    circle(ctx, 508, 78, 4);
    ctx.fill();
    circle(ctx, 502, 58, 3);
    ctx.fill();
  }
}

function drawTerraceTable(ctx, modified) {
  // Table and chairs.
  ctx.fillStyle = PALETTE.wood;
  ctx.beginPath();
  ctx.ellipse(300, 420, 130, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(292, 430, 16, 80);
  // Teapot and cups on the table.
  ctx.fillStyle = '#3f6d8e';
  ctx.beginPath();
  ctx.ellipse(300, 402, 26, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(292, 380, 16, 12);
  ctx.fillStyle = '#f7e8c9';
  circle(ctx, 252, 408, 9);
  ctx.fill();
  circle(ctx, 348, 408, 9);
  ctx.fill();
  // Chair on the right with its cushion.
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(400, 380, 12, 110);
  ctx.fillRect(400, 380, 90, 12);
  ctx.fillRect(478, 380, 12, 110);
  ctx.fillStyle = modified.has('cushion') ? '#3f6d8e' : '#b3402e';
  roundRect(ctx, 404, 392, 82, 26, 8);
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(404, 404, 82, 4);
}

function drawGuitarAndRadio(ctx, modified) {
  // Radio on its little stool, dial needle left vs right.
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(60, 340, 110, 10);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(70, 350, 8, 60);
  ctx.fillRect(152, 350, 8, 60);
  ctx.fillStyle = '#7a4a2b';
  roundRect(ctx, 66, 286, 98, 54, 6);
  ctx.fill();
  ctx.fillStyle = '#f2e3b3';
  ctx.fillRect(76, 296, 56, 16);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(modified.has('radio') ? 124 : 84, 298);
  ctx.lineTo(modified.has('radio') ? 124 : 84, 310);
  ctx.stroke();
  ctx.fillStyle = '#2e2e38';
  circle(ctx, 146, 304, 9);
  ctx.fill();
  ctx.strokeStyle = '#c9c9d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(160, 286);
  ctx.lineTo(178, 240);
  ctx.stroke();
  // Guitar leaning on the right wall.
  ctx.save();
  ctx.translate(512, 380);
  ctx.rotate(0.35);
  ctx.fillStyle = '#c98a3f';
  ctx.beginPath();
  ctx.ellipse(0, 30, 34, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -18, 24, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5d3620';
  circle(ctx, 0, 30, 14);
  ctx.fill();
  ctx.fillStyle = '#2e1d12';
  circle(ctx, 0, 30, 9);
  ctx.fill();
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(-7, -96, 14, 84);
  ctx.fillStyle = '#2e1d12';
  const strings = modified.has('guitar') ? 3 : 6;
  ctx.lineWidth = 1;
  for (let i = 0; i < strings; i += 1) {
    const sx = -5 + (i * 10) / Math.max(1, strings - 1);
    ctx.beginPath();
    ctx.moveTo(sx, -96);
    ctx.lineTo(sx * 0.6, 44);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTerracePlant(ctx, modified) {
  ctx.fillStyle = '#b3402e';
  ctx.beginPath();
  ctx.moveTo(40, 300);
  ctx.lineTo(100, 300);
  ctx.lineTo(92, 340);
  ctx.lineTo(48, 340);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.leaf;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const leaves = modified.has('leaf')
    ? [[70, 296, 52, 250], [84, 296, 96, 256], [56, 296, 44, 262]]
    : [[70, 296, 52, 250], [84, 296, 96, 256], [56, 296, 44, 262], [70, 296, 70, 228]];
  for (const [x1, y1, x2, y2] of leaves) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2 + 10, (y1 + y2) / 2, x2, y2);
    ctx.stroke();
  }
  // Sleeping cat curled on the terrace step.
  ctx.fillStyle = '#5a5a66';
  ctx.beginPath();
  ctx.ellipse(180, 486, 36, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, 210, 476, 12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(204, 468);
  ctx.lineTo(206, 458);
  ctx.lineTo(212, 466);
  ctx.fill();
}

function drawSceneTerrace(ctx, modified, now) {
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_HEIGHT);
  sky.addColorStop(0, '#0d1230');
  sky.addColorStop(0.6, '#1d2b52');
  sky.addColorStop(1, '#3a2a4a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
  drawNightSky(ctx, modified, 3313);
  drawStringLights(ctx, modified, now);
  // Distant rooftops.
  ctx.fillStyle = '#171a2e';
  ctx.beginPath();
  ctx.moveTo(0, 340);
  ctx.lineTo(120, 300);
  ctx.lineTo(240, 340);
  ctx.lineTo(360, 306);
  ctx.lineTo(480, 340);
  ctx.lineTo(600, 312);
  ctx.lineTo(600, 520);
  ctx.lineTo(0, 520);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd678';
  for (const [wx, wy] of [[60, 330], [300, 326], [520, 330]]) {
    ctx.globalAlpha = 0.85;
    ctx.fillRect(wx, wy, 10, 12);
  }
  ctx.globalAlpha = 1;
  drawWoodFloor(ctx, 420);
  drawTerracePlant(ctx, modified);
  drawTerraceTable(ctx, modified);
  drawGuitarAndRadio(ctx, modified);
}

// ---------- panels, markers, HUD ----------

export function drawScenePanel(ctx, sceneIndex, modified, now) {
  if (sceneIndex === 0) drawSceneWarung(ctx, modified, now);
  else if (sceneIndex === 1) drawSceneKitchen(ctx, modified, now);
  else drawSceneTerrace(ctx, modified, now);
}

export function drawFoundMarker(ctx, x, y, now) {
  const pulse = 1 + Math.sin(now / 240) * 0.06;
  ctx.save();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 26 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#fff3c4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 20 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(x + 18, y - 18, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2e1d12';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 13, y - 18);
  ctx.lineTo(x + 17, y - 14);
  ctx.lineTo(x + 24, y - 23);
  ctx.stroke();
  ctx.restore();
}

export function drawHintRing(ctx, x, y, now) {
  const pulse = 1 + Math.sin(now / 180) * 0.18;
  ctx.save();
  ctx.globalAlpha = 0.65 + 0.35 * Math.sin(now / 180);
  ctx.strokeStyle = '#7fd4ff';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(x, y, 32 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawMissMark(ctx, x, y, ageMs) {
  const fade = Math.max(0, 1 - ageMs / 600);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.strokeStyle = '#ff5a4e';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12);
  ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12);
  ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
  ctx.restore();
}

function drawPanelFrame(ctx, panel, label, accent) {
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(panel.x - 2, panel.y - 2, panel.w + 4, panel.h + 4);
  ctx.fillStyle = accent;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, panel.x + 4, panel.y - 10);
}

export function drawHud(ctx, state) {
  ctx.fillStyle = '#1d1420';
  ctx.fillRect(0, 0, GAME_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = '#f2a65a';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('WARUNG SENJA', 24, 34);
  ctx.fillStyle = '#c9b8a3';
  ctx.font = '13px sans-serif';
  ctx.fillText('Spot the Difference', 24, 56);
  const scene = sceneByIndex(state.sceneIndex);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(`Scene ${state.sceneIndex + 1}/3 — ${scene.name}`, 300, 32);
  ctx.fillStyle = '#c9b8a3';
  ctx.font = '13px sans-serif';
  ctx.fillText(SCENE_SUBTITLES[state.sceneIndex], 300, 54);
  // Remaining counter, big and always visible.
  const remaining = scene.diffs.length - state.found.size;
  ctx.fillStyle = remaining === 0 ? '#7fd4a0' : '#ffd166';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`SISA ${remaining} / ${scene.diffs.length}`, 700, 36);
  ctx.fillStyle = '#c9b8a3';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Skor ${state.score}   •   Kombo x${state.combo}`, 700, 58);
  // Timer bar.
  const timeLeft = Math.max(0, state.timeLeft);
  const fraction = timeLeft / scene.timeLimit;
  ctx.fillStyle = '#3a2a34';
  roundRect(ctx, 830, 22, 160, 16, 8);
  ctx.fill();
  ctx.fillStyle = fraction < 0.25 ? '#ff5a4e' : fraction < 0.5 ? '#f2a65a' : '#7fd4a0';
  roundRect(ctx, 830, 22, 160 * fraction, 16, 8);
  ctx.fill();
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  ctx.fillText(`${minutes}:${String(seconds).padStart(2, '0')}`, 830, 60);
  for (const button of hudButtons()) {
    const hover = state.hoverButton === button.id;
    ctx.fillStyle = hover ? '#f2a65a' : '#3a2a34';
    roundRect(ctx, button.x, button.y, button.w, button.h, 8);
    ctx.fill();
    ctx.fillStyle = hover ? '#2e1d12' : '#f7e8c9';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(button.label, button.x + button.w / 2, button.y + 28);
  }
  ctx.fillStyle = '#c9b8a3';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Klik perbedaan di panel mana pun  •  H hint  •  Esc jeda  •  M suara', GAME_WIDTH / 2, 668);
  void HUD_HEIGHT;
  void PANEL_TOP;
  void PANEL_WIDTH;
  void PANEL_HEIGHT;
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(16,10,18,0.82)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, GAME_WIDTH / 2, 250);
  ctx.fillStyle = accent;
  ctx.fillRect(GAME_WIDTH / 2 - 120, 276, 240, 4);
  ctx.fillStyle = '#e8dcc0';
  ctx.font = '19px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, GAME_WIDTH / 2, 322 + i * 32);
  });
}

export function drawTitleScreen(ctx, bestScore) {
  // Paint a dusk warung behind the title using scene 1, both panels muted.
  ctx.save();
  ctx.translate(LEFT_PANEL.x, LEFT_PANEL.y);
  ctx.scale(1, 1);
  drawSceneWarung(ctx, new Set(), 0);
  ctx.restore();
  ctx.save();
  ctx.translate(RIGHT_PANEL.x, RIGHT_PANEL.y);
  drawSceneWarung(ctx, new Set(['lamp', 'cup', 'poster']), 0);
  ctx.restore();
  ctx.fillStyle = 'rgba(16,10,18,0.66)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WARUNG SENJA', GAME_WIDTH / 2, 190);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('— Spot the Difference —', GAME_WIDTH / 2, 236);
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#e8dcc0';
  ctx.fillText('Dua gambar nyaris sama. Tujuh perbedaan bersembunyi di panel kanan.', GAME_WIDTH / 2, 290);
  ctx.fillText('Temukan semuanya sebelum waktu habis — tiga warung, tiga senja.', GAME_WIDTH / 2, 320);
  ctx.fillStyle = '#f2a65a';
  roundRect(ctx, GAME_WIDTH / 2 - 170, 360, 340, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#2e1d12';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('▶  MULAI BERMAIN  (Enter)', GAME_WIDTH / 2, 396);
  ctx.fillStyle = '#c9b8a3';
  ctx.font = '16px sans-serif';
  ctx.fillText('1 / 2 / 3 — pilih scene   •   H hint   •   Esc jeda   •   M suara   •   R ulang', GAME_WIDTH / 2, 462);
  if (bestScore > 0) {
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`Skor terbaik: ${bestScore}`, GAME_WIDTH / 2, 496);
  }
  ctx.fillStyle = '#8a7a68';
  ctx.font = '13px sans-serif';
  ctx.fillText('Warung kopi orisinal — gambar, suara, dan musik digambar & disintesis di tempat.', GAME_WIDTH / 2, 690);
}

export function drawHowToScreen(ctx) {
  drawOverlay(ctx, 'CARA BERMAIN', [
    'Bandingkan panel kiri (ASLI) dengan panel kanan.',
    'Klik perbedaan yang kamu temukan — di panel mana pun boleh.',
    'Klik benar: +100 poin, kombo naik. Klik salah: −5 detik.',
    'H — hint menyorot satu perbedaan (cooldown 15 dtk, −25 poin).',
    'Setiap scene punya 7 perbedaan. Scene 1 paling santai, scene 3 paling jahat.',
    '',
    'Tekan Enter atau klik untuk mulai.',
  ], '#f2a65a');
}

export function drawPauseScreen(ctx) {
  drawOverlay(ctx, 'JEDA', [
    'Kopi masih hangat. Waktu berhenti di sini.',
    '',
    'Esc — lanjut bermain      R — ulang scene      M — suara',
  ], '#7fd4ff');
}

export function drawSceneCompleteScreen(ctx, state) {
  drawOverlay(ctx, 'SCENE SELESAI!', [
    `${sceneByIndex(state.sceneIndex).name} — 7 dari 7 ditemukan.`,
    `Bonus waktu: +${state.lastTimeBonus} poin.`,
    `Skor sementara: ${state.score}.`,
    '',
    state.sceneIndex < 2 ? 'Tekan N — scene berikut' : 'Tekan N — lihat hasil akhir',
  ], '#7fd4a0');
}

export function drawVictoryScreen(ctx, state) {
  drawOverlay(ctx, 'SELAMAT! WARUNG TUTUP', [
    'Semua 21 perbedaan ditemukan. Kamu mata paling tajam di kampung.',
    `Skor akhir: ${state.score}    •    Waktu total: ${formatTime(state.totalTimeUsed)}`,
    `Akurasi klik: ${state.accuracy}%   •   Hint dipakai: ${state.hintsUsed}x`,
    '',
    'Tekan R — main lagi dari scene 1',
  ], '#ffd166');
}

export function drawTimeUpScreen(ctx, state) {
  drawOverlay(ctx, 'WAKTU HABIS', [
    `${sceneByIndex(state.sceneIndex).name} — ${state.found.size} dari 7 ditemukan.`,
    'Senja keburu gelap. Coba lagi, kali ini lebih cepat.',
    '',
    'Tekan R — ulang scene ini',
  ], '#ff5a4e');
}

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export { LEFT_PANEL, RIGHT_PANEL, SCENE_NAMES };
