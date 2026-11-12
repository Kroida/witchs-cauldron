/**
 * Witch's Cauldron - Animações Ambientais
 * Partículas mágicas de poeira de fada, oscilação de chamas de lamparinas/velas e balanço de vegetação.
 */

export class EnvironmentManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.particles = [];
    this.maxParticles = 45;
    this.width = 0;
    this.height = 0;
    this.animId = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.palette = [
      '#fbbf24', // Dourado quente
      '#f59e0b', // Âmbar
      '#c084fc', // Lilás mágico
      '#e879f9', // Magenta sutil
      '#67e8f9', // Azul estelar
      '#ffffff'  // Luz pura
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Inicializa partículas de fada flutuantes
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }

    if (!this.reducedMotion) {
      this.loop = this.loop.bind(this);
      this.animId = requestAnimationFrame(this.loop);
    } else {
      this.drawReduced();
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = this.canvas.width = rect.width;
    this.height = this.canvas.height = rect.height;
  }

  createParticle(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 10,
      size: Math.random() < 0.25 ? 3 : (Math.random() < 0.6 ? 2 : 1.5),
      speedY: 0.15 + Math.random() * 0.45,
      speedX: (Math.random() - 0.5) * 0.35,
      wobbleSpeed: 0.01 + Math.random() * 0.025,
      wobbleAmp: 0.4 + Math.random() * 0.8,
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 0.2 + Math.random() * 0.7,
      pulseSpeed: 0.02 + Math.random() * 0.04,
      color: this.palette[Math.floor(Math.random() * this.palette.length)],
      life: 0,
      maxLife: 200 + Math.random() * 300
    };
  }

  /**
   * Emite uma explosão de faíscas brilhantes em uma posição específica
   */
  emitBurst(x, y, color = '#fbbf24', count = 24) {
    if (this.reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.5;
      this.particles.push({
        x: x,
        y: y,
        size: Math.random() < 0.3 ? 3 : 2,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 0.5,
        drag: 0.94,
        gravity: 0.04,
        isBurst: true,
        opacity: 1.0,
        color: color,
        life: 0,
        maxLife: 35 + Math.random() * 45
      });
    }
  }

  loop(timestamp) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;

      if (p.isBurst) {
        p.speedX *= p.drag;
        p.speedY = p.speedY * p.drag + p.gravity;
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity = Math.max(0, 1 - (p.life / p.maxLife));

        if (p.life >= p.maxLife) {
          this.particles.splice(i, 1);
          continue;
        }
      } else {
        p.y -= p.speedY;
        p.x += Math.sin(p.life * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp + p.speedX;
        p.opacity = 0.3 + 0.45 * Math.sin(p.life * p.pulseSpeed);

        if (p.y < -15 || p.life > p.maxLife) {
          this.particles[i] = this.createParticle(false);
          continue;
        }
      }

      // Renderiza como pixel nítido (sem antialiasing borrado)
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
      
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      const sz = Math.round(p.size);
      
      this.ctx.fillRect(px, py, sz, sz);
      
      // Halo sutil para partículas maiores
      if (sz >= 2.5) {
        this.ctx.globalAlpha = p.opacity * 0.35;
        this.ctx.fillRect(px - 1, py, sz + 2, sz);
        this.ctx.fillRect(px, py - 1, sz, sz + 2);
      }
    }

    this.ctx.globalAlpha = 1.0;
    this.animId = requestAnimationFrame(this.loop);
  }

  drawReduced() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.globalAlpha = 0.25;
    for (let i = 0; i < 15; i++) {
      const x = Math.round(Math.random() * this.width);
      const y = Math.round(Math.random() * this.height);
      this.ctx.fillRect(x, y, 2, 2);
    }
    this.ctx.globalAlpha = 1.0;
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
