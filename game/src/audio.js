// Warung Senja — Spot the Difference: all sound, made with WebAudio only.
// One job: short synthesized effects (find, miss, hint, win) plus a quiet
// evening ambience drone. No audio files are loaded, ever.
export class SoundEngine {
  constructor() {
    this.context = null;
    this.muted = false;
    this.ambienceNodes = null;
  }

  ensureContext() {
    if (this.context) {
      if (this.context.state === 'suspended') this.context.resume();
      return this.context;
    }
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return null;
    this.context = new AudioContextClass();
    return this.context;
  }

  unlock() {
    this.ensureContext();
    this.startAmbience();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ambienceNodes) {
      this.ambienceNodes.gain.gain.value = this.muted ? 0 : 0.05;
    }
    return this.muted;
  }

  tone(frequency, startAt, duration, type, volume) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime + startAt);
    oscillator.stop(ctx.currentTime + startAt + duration + 0.05);
  }

  playFound() {
    this.tone(660, 0, 0.18, 'sine', 0.22);
    this.tone(880, 0.08, 0.22, 'sine', 0.22);
    this.tone(1320, 0.16, 0.3, 'triangle', 0.12);
  }

  playMiss() {
    this.tone(160, 0, 0.22, 'sawtooth', 0.12);
    this.tone(110, 0.05, 0.25, 'sawtooth', 0.1);
  }

  playHint() {
    this.tone(520, 0, 0.12, 'sine', 0.16);
    this.tone(780, 0.1, 0.18, 'sine', 0.16);
  }

  playClick() {
    this.tone(440, 0, 0.07, 'triangle', 0.12);
  }

  playSceneClear() {
    [523, 659, 784, 1047].forEach((freq, i) => this.tone(freq, i * 0.11, 0.3, 'triangle', 0.18));
  }

  playVictory() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((freq, i) =>
      this.tone(freq, i * 0.14, 0.35, 'triangle', 0.18),
    );
  }

  // A soft two-note evening drone: low sine pad plus a slow tremolo.
  // Built once, kept alive; mute only turns its gain down.
  startAmbience() {
    const ctx = this.ensureContext();
    if (!ctx || this.ambienceNodes) return;
    const gain = ctx.createGain();
    gain.gain.value = this.muted ? 0 : 0.05;
    gain.connect(ctx.destination);
    const low = ctx.createOscillator();
    low.type = 'sine';
    low.frequency.value = 110;
    const fifth = ctx.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.value = 164.81;
    const tremolo = ctx.createOscillator();
    tremolo.type = 'sine';
    tremolo.frequency.value = 0.25;
    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 0.02;
    tremolo.connect(tremoloGain);
    tremoloGain.connect(gain.gain);
    low.connect(gain);
    fifth.connect(gain);
    low.start();
    fifth.start();
    tremolo.start();
    this.ambienceNodes = { gain, low, fifth, tremolo };
  }
}
