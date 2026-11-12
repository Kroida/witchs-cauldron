/**
 * Witch's Cauldron - Sintetizador de Efeitos Sonoros 16-bit Cozy Alquímico
 * Implementado 100% com a Web Audio API nativa (sem dependências de áudio externas).
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.4;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(enabled = null) {
    this.enabled = enabled !== null ? enabled : !this.enabled;
    return this.enabled;
  }

  // Chime mágico ao passar o mouse sobre poção desbloqueada
  playHover() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.12); // A5

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08 * this.volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Toque de seleção aconchegante ao clicar na poção
  playSelect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.001, t + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.12 * this.volume, t + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.4);
    });
  }

  // Chacoalhar de correntes metálicas
  playChainRattle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 800, t + i * 0.06);
      filter.Q.value = 6;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320 + Math.random() * 120, t + i * 0.06);

      gain.gain.setValueAtTime(0.001, t + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.1 * this.volume, t + i * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.1);
    }
  }

  // Quebra dramática das correntes e cadeado com estilhaços brilhantes
  playShatter() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Impacto inicial grave metálico
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(160, t);
    bass.frequency.exponentialRampToValueAtTime(45, t + 0.25);
    bassGain.gain.setValueAtTime(0.25 * this.volume, t);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    bass.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bass.start(t);
    bass.stop(t + 0.32);

    // 2. Ruído de estilhaçamento / vidro estourando
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2200, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2 * this.volume, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);

    // 3. Brilho mágico ascendente de transmutação
    [880, 1174.66, 1567.98, 2093].forEach((f, idx) => {
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(f, t + 0.08 + idx * 0.05);

      chimeGain.gain.setValueAtTime(0.001, t + 0.08 + idx * 0.05);
      chimeGain.gain.linearRampToValueAtTime(0.12 * this.volume, t + 0.08 + idx * 0.05 + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08 + idx * 0.05 + 0.4);

      chime.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      chime.start(t + 0.08 + idx * 0.05);
      chime.stop(t + 0.08 + idx * 0.05 + 0.45);
    });
  }

  // Fanfarra do Modal Gacha de Revelação Especial
  playGachaFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Arpeggio pentatônico celestial (C5 -> E5 -> G5 -> B5 -> C6 -> E6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.09);

      const dur = i === notes.length - 1 ? 1.2 : 0.45;
      gain.gain.setValueAtTime(0.001, t + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.2 * this.volume, t + i * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + dur + 0.05);
    });
  }

  // Fechamento de modal / clique de botão
  playCloseModal() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.15);

    gain.gain.setValueAtTime(0.12 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Morcego passando na janela
  playBat() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.linearRampToValueAtTime(2400, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.25);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.05 * this.volume, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Bruxa voadora (evento raro)
  playFlyingWitch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Risadinha misteriosa e mágica / glissando
    const freqs = [700, 850, 750, 950, 800, 1100];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + idx * 0.08);

      gain.gain.setValueAtTime(0.001, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.06 * this.volume, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.18);
    });
  }
}

export const soundManager = new SoundManager();
