/**
 * Witch's Cauldron - Eventos e Animações da Janela
 * Céu noturno dinâmico: nuvens em paralaxe, lua, estrelas cintilantes,
 * travessia de morcego e o evento raro da bruxa voadora em sua vassoura.
 */

import { soundManager } from '../audio/soundManager.js';

export class WindowEventsManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.width = canvasElement.width = 240;
    this.height = canvasElement.height = 360;

    this.clouds = [
      { x: 20, y: 50, speed: 0.12, w: 90, h: 28, opacity: 0.35 },
      { x: 130, y: 120, speed: 0.08, w: 110, h: 32, opacity: 0.25 },
      { x: -40, y: 190, speed: 0.16, w: 130, h: 36, opacity: 0.4 }
    ];

    this.stars = [];
    for (let i = 0; i < 28; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.75),
        size: Math.random() < 0.2 ? 2 : 1,
        twinkleSpeed: 0.02 + Math.random() * 0.05,
        twinkleOffset: Math.random() * Math.PI * 2,
        baseOpacity: 0.3 + Math.random() * 0.5
      });
    }

    // Estado do Morcego
    this.bat = {
      active: false,
      x: -30,
      y: 100,
      speedX: 1.8,
      speedY: 0.3,
      wingFrame: 0,
      tick: 0
    };

    // Estado da Bruxa Voadora (Evento Raro)
    this.flyingWitch = {
      active: false,
      x: -60,
      y: 65,
      speedX: 1.2,
      trail: [],
      tick: 0
    };

    this.batTimer = null;
    this.witchTimer = null;
    this.animId = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.scheduleNextBat();
    this.scheduleNextFlyingWitch();

    if (!this.reducedMotion) {
      this.loop = this.loop.bind(this);
      this.animId = requestAnimationFrame(this.loop);
    } else {
      this.renderStatic();
    }
  }

  scheduleNextBat() {
    const delay = 16000 + Math.random() * 14000; // 16s a 30s
    this.batTimer = setTimeout(() => {
      this.triggerBat();
      this.scheduleNextBat();
    }, delay);
  }

  scheduleNextFlyingWitch() {
    const delay = 35000 + Math.random() * 25000; // 35s a 60s
    this.witchTimer = setTimeout(() => {
      this.triggerFlyingWitch();
      this.scheduleNextFlyingWitch();
    }, delay);
  }

  triggerBat() {
    if (this.bat.active) return;
    this.bat.active = true;
    this.bat.x = -25;
    this.bat.y = 80 + Math.random() * 120;
    this.bat.speedX = 1.6 + Math.random() * 0.8;
    this.bat.speedY = (Math.random() - 0.4) * 0.5;
    soundManager.playBat();
  }

  triggerFlyingWitch() {
    if (this.flyingWitch.active) return;
    this.flyingWitch.active = true;
    this.flyingWitch.x = -50;
    this.flyingWitch.y = 45 + Math.random() * 40; // Passa próximo à lua
    this.flyingWitch.trail = [];
    soundManager.playFlyingWitch();
  }

  loop(timestamp) {
    this.update();
    this.render();
    this.animId = requestAnimationFrame(this.loop);
  }

  update() {
    // Atualiza nuvens
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > this.width + 40) {
        c.x = -c.w - 20;
      }
    });

    // Atualiza morcego
    if (this.bat.active) {
      this.bat.tick++;
      this.bat.x += this.bat.speedX;
      this.bat.y += Math.sin(this.bat.tick * 0.15) * 1.2 + this.bat.speedY;
      if (this.bat.tick % 8 === 0) {
        this.bat.wingFrame = this.bat.wingFrame === 0 ? 1 : 0;
      }
      if (this.bat.x > this.width + 30) {
        this.bat.active = false;
      }
    }

    // Atualiza bruxa voadora
    if (this.flyingWitch.active) {
      this.flyingWitch.tick++;
      this.flyingWitch.x += this.flyingWitch.speedX;
      this.flyingWitch.y += Math.sin(this.flyingWitch.tick * 0.08) * 0.4;

      // Adiciona partículas douradas no rastro da vassoura
      if (this.flyingWitch.tick % 4 === 0) {
        this.flyingWitch.trail.push({
          x: this.flyingWitch.x + 4,
          y: this.flyingWitch.y + 12 + (Math.random() - 0.5) * 4,
          opacity: 1.0,
          color: Math.random() < 0.6 ? '#fbbf24' : '#e879f9',
          life: 0,
          maxLife: 24
        });
      }

      for (let i = this.flyingWitch.trail.length - 1; i >= 0; i--) {
        const tr = this.flyingWitch.trail[i];
        tr.life++;
        tr.opacity = 1 - (tr.life / tr.maxLife);
        tr.y += 0.15;
        if (tr.life >= tr.maxLife) {
          this.flyingWitch.trail.splice(i, 1);
        }
      }

      if (this.flyingWitch.x > this.width + 60) {
        this.flyingWitch.active = false;
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Céu degradê noturno profundo
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#16082b');
    grad.addColorStop(0.5, '#29104d');
    grad.addColorStop(1, '#451a75');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. Estrelas cintilantes em pixel art
    const now = performance.now() * 0.001;
    this.stars.forEach(st => {
      const op = Math.max(0.1, st.baseOpacity + 0.3 * Math.sin(now * st.twinkleSpeed * 20 + st.twinkleOffset));
      this.ctx.fillStyle = '#fef08a';
      this.ctx.globalAlpha = op;
      this.ctx.fillRect(Math.round(st.x), Math.round(st.y), st.size, st.size);
    });

    // 3. Lua Cheia Luminosa com detalhes de crateras em pixel art
    this.renderMoon(155, 60, 34);

    // 4. Silhueta do Castelo Gótico Distante no horizonte
    this.renderCastle();

    // 5. Nuvens em Paralaxe
    this.clouds.forEach(c => {
      this.ctx.fillStyle = '#6b21a8';
      this.ctx.globalAlpha = c.opacity;
      this.renderPixelCloud(Math.round(c.x), Math.round(c.y), c.w, c.h);
    });

    // 6. Rastro mágico da Bruxa
    if (this.flyingWitch.trail.length > 0) {
      this.flyingWitch.trail.forEach(tr => {
        this.ctx.fillStyle = tr.color;
        this.ctx.globalAlpha = tr.opacity;
        this.ctx.fillRect(Math.round(tr.x), Math.round(tr.y), 2, 2);
      });
    }

    // 7. Bruxa Voadora em sua Vassoura (Silhueta Pixel Art)
    if (this.flyingWitch.active) {
      this.ctx.globalAlpha = 0.95;
      this.renderPixelWitch(Math.round(this.flyingWitch.x), Math.round(this.flyingWitch.y));
    }

    // 8. Morcego Voando (Silhueta Pixel Art com bater de asas)
    if (this.bat.active) {
      this.ctx.globalAlpha = 0.95;
      this.renderPixelBat(Math.round(this.bat.x), Math.round(this.bat.y), this.bat.wingFrame);
    }

    this.ctx.globalAlpha = 1.0;
  }

  renderMoon(cx, cy, r) {
    // Halo externo
    this.ctx.fillStyle = '#fde68a';
    this.ctx.globalAlpha = 0.15;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Disco lunar
    this.ctx.globalAlpha = 0.9;
    this.ctx.fillStyle = '#fef9c3';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Crateras sutis em pixel art
    this.ctx.fillStyle = '#fef08a';
    this.ctx.globalAlpha = 0.6;
    this.ctx.fillRect(cx - 12, cy - 8, 8, 7);
    this.ctx.fillRect(cx + 4, cy - 14, 11, 8);
    this.ctx.fillRect(cx - 6, cy + 10, 9, 7);
    this.ctx.fillRect(cx + 10, cy + 4, 7, 6);
  }

  renderCastle() {
    this.ctx.fillStyle = '#1e0b38';
    this.ctx.globalAlpha = 0.85;
    const baseX = 140;
    const baseY = 210;

    // Torres do castelo
    this.ctx.fillRect(baseX + 10, baseY - 60, 16, 60); // Torre central
    this.ctx.fillRect(baseX + 14, baseY - 75, 8, 15);  // Pináculo central
    this.ctx.fillRect(baseX - 4, baseY - 45, 12, 45);  // Torre esquerda
    this.ctx.fillRect(baseX + 28, baseY - 50, 14, 50); // Torre direita
    this.ctx.fillRect(baseX - 8, baseY, 54, 40);       // Muralha base

    // Janelinha iluminada com vela amarela
    this.ctx.fillStyle = '#fef08a';
    this.ctx.globalAlpha = 0.75;
    this.ctx.fillRect(baseX + 16, baseY - 35, 4, 5);
  }

  renderPixelCloud(x, y, w, h) {
    // Formato de nuvem estilizada com blocos de pixel
    this.ctx.fillRect(x, y + Math.round(h * 0.4), w, Math.round(h * 0.6));
    this.ctx.fillRect(x + Math.round(w * 0.2), y + Math.round(h * 0.15), Math.round(w * 0.6), Math.round(h * 0.85));
    this.ctx.fillRect(x + Math.round(w * 0.35), y, Math.round(w * 0.3), h);
  }

  renderPixelWitch(x, y) {
    this.ctx.fillStyle = '#130424';
    // Vassoura
    this.ctx.fillRect(x, y + 10, 32, 2);
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(x, y + 8, 7, 6); // Palha da vassoura

    // Bruxa: chapéu pontudo e manto
    this.ctx.fillStyle = '#1e0b38';
    this.ctx.fillRect(x + 12, y + 2, 8, 9); // Corpo
    this.ctx.fillRect(x + 10, y + 6, 12, 2); // Aba do chapéu
    this.ctx.fillRect(x + 13, y, 6, 6);     // Cone do chapéu
    this.ctx.fillRect(x + 15, y - 4, 2, 4); // Ponta torta do chapéu
    this.ctx.fillRect(x + 8, y + 4, 4, 6);  // Capa esvoaçante
  }

  renderPixelBat(x, y, wingUp) {
    this.ctx.fillStyle = '#160826';
    // Corpo
    this.ctx.fillRect(x + 5, y + 3, 4, 6);
    // Asas
    if (wingUp === 1) {
      this.ctx.fillRect(x, y, 5, 4);
      this.ctx.fillRect(x + 9, y, 5, 4);
      this.ctx.fillRect(x + 2, y + 3, 3, 3);
      this.ctx.fillRect(x + 9, y + 3, 3, 3);
    } else {
      this.ctx.fillRect(x + 1, y + 5, 4, 4);
      this.ctx.fillRect(x + 9, y + 5, 4, 4);
      this.ctx.fillRect(x, y + 7, 3, 3);
      this.ctx.fillRect(x + 11, y + 7, 3, 3);
    }
  }

  renderStatic() {
    this.render();
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.batTimer) clearTimeout(this.batTimer);
    if (this.witchTimer) clearTimeout(this.witchTimer);
  }
}
