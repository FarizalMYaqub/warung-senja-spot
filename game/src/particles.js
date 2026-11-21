// Warung Senja — Spot the Difference: lightweight canvas particles.
// One job: the little bursts that make a find feel good (golden sparkles),
// drifting steam above hot cups, and floating dusk motes. Pure canvas,
// no images, positions in panel-local coordinates.
import { mulberry32 } from './random.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.rand = mulberry32(20261121);
  }

  burst(x, y, color, count = 26) {
    for (let i = 0; i < count; i += 1) {
      const angle = this.rand() * Math.PI * 2;
      const speed = 40 + this.rand() * 160;
      this.particles.push({
        kind: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0.7 + this.rand() * 0.5,
        age: 0,
        size: 2 + this.rand() * 3.5,
        color,
      });
    }
  }

  ring(x, y) {
    this.particles.push({ kind: 'ring', x, y, life: 0.6, age: 0, size: 6, color: '#ffd166' });
  }

  // Continuous gentle steam rising from a hot drink at (x, y).
  steam(x, y, now) {
    if (this.particles.filter((p) => p.kind === 'steam').length > 24) return;
    const wobble = Math.sin(now / 700 + x) * 8;
    this.particles.push({
      kind: 'steam',
      x: x + wobble,
      y,
      vx: wobble * 0.02,
      vy: -22 - this.rand() * 10,
      life: 1.8,
      age: 0,
      size: 5 + this.rand() * 5,
      color: 'rgba(255,255,255,0.35)',
    });
  }

  update(dt) {
    for (const p of this.particles) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'spark') p.vy += 260 * dt;
      if (p.kind === 'ring') p.size += 160 * dt;
    }
    this.particles = this.particles.filter((p) => p.age < p.life);
  }

  draw(ctx) {
    for (const p of this.particles) {
      const fade = 1 - p.age / p.life;
      if (p.kind === 'spark') {
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * fade + 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'ring') {
        ctx.globalAlpha = fade * 0.9;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.globalAlpha = fade * 0.5;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + p.age), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}
