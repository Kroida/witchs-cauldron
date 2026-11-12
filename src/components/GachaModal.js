/**
 * Witch's Cauldron - Componente GachaModal (Revelação Especial de Nova Poção)
 * Exibido exclusivamente no primeiro desbloqueio de cada poção com estética gacha:
 * raios solares dourados giratórios, explosão de confetes arcanos e fanfarra triunfante.
 */

import confetti from 'canvas-confetti';
import { soundManager } from '../audio/soundManager.js';
import { gameState } from '../state/gameState.js';
import { STAGES_CONFIG } from '../config/stages.js';

export class GachaModal {
  constructor({ containerElement, environmentManager }) {
    this.container = containerElement;
    this.env = environmentManager;
    this.element = null;
    this.currentStageId = null;

    this.render();
    this.bindState();
  }

  render() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop gacha-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="gacha-sunburst-rays"></div>

      <div class="gacha-reveal-container">
        <div class="gacha-badge">✦ NOVA POÇÃO DESCOBERTA! ✦</div>
        
        <div class="gacha-stage-pill">FASE <span class="gacha-stage-num">2</span> DESBLOQUEADA</div>

        <div class="gacha-bottle-showcase">
          <div class="gacha-light-vortex"></div>
          <div class="gacha-aura-glow"></div>
          <img class="gacha-bottle-img" src="" alt="Nova Poção" />
          <div class="gacha-sparkle-stars">
            <span class="gstar s1">✦</span>
            <span class="gstar s2">✦</span>
            <span class="gstar s3">✦</span>
            <span class="gstar s4">✦</span>
          </div>
        </div>

        <h2 class="gacha-potion-name">Elixir da Serenidade</h2>
        <div class="gacha-potion-sub">Infusão Doce de Âmbar e Mel</div>
        
        <p class="gacha-potion-desc">
          Destilada lentamente sob a meia-lua. Dissipa a ansiedade e clareia a mente.
        </p>

        <div class="gacha-unlocked-tip">
          <span>🕯️</span> Retorne à estante para ver as correntes sendo rompidas!
        </div>

        <button type="button" class="btn-gacha-collect">
          <span class="btn-star-icon">✨</span>
          <span>Coletar e Continuar</span>
          <span class="btn-star-icon">✨</span>
        </button>
      </div>
    `;

    this.element = overlay;
    this.container.appendChild(overlay);

    const collectBtn = overlay.querySelector('.btn-gacha-collect');
    collectBtn.addEventListener('click', () => this.handleCollect());
  }

  bindState() {
    gameState.on('gachaQueueUpdated', (queue) => {
      // Se houver poções na fila e o modal estiver fechado, exibe a primeira
      if (queue.length > 0 && this.element.classList.contains('hidden')) {
        this.open(queue[0]);
      }
    });
  }

  open(stageId) {
    this.currentStageId = stageId;
    const cfg = STAGES_CONFIG.find(s => s.id === stageId);
    if (!cfg) return;

    const el = this.element;
    el.querySelector('.gacha-stage-num').textContent = cfg.stageNumber;
    el.querySelector('.gacha-potion-name').textContent = cfg.name;
    el.querySelector('.gacha-potion-sub').textContent = cfg.subtitle;
    el.querySelector('.gacha-potion-desc').textContent = cfg.description;

    const bottleImg = el.querySelector('.gacha-bottle-img');
    bottleImg.src = cfg.assetUnlocked;

    const glow = el.querySelector('.gacha-aura-glow');
    glow.style.setProperty('--gacha-glow', cfg.glowColor);
    glow.style.setProperty('--gacha-color', cfg.color);

    el.classList.remove('hidden');
    el.classList.add('gacha-entering');

    soundManager.playGachaFanfare();

    // Dispara confetes mágicos arcanos (dourado, roxo, violeta, magenta)
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#c084fc', '#f59e0b', '#e879f9', '#67e8f9']
      });
    } catch (e) {
      // Fallback
    }

    if (this.env) {
      const rect = bottleImg.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.env.emitBurst(cx, cy, cfg.color, 35);
    }
  }

  handleCollect() {
    soundManager.playSelect();
    const idToMark = this.currentStageId;

    this.element.classList.add('gacha-leaving');
    setTimeout(() => {
      this.element.classList.remove('gacha-leaving');
      this.element.classList.add('hidden');

      if (idToMark) {
        gameState.markSpecialRevealed(idToMark);
      }

      // Se ainda houver outra poção na fila (ex: desbloqueio de 3), abre a próxima!
      if (gameState.gachaQueue.length > 0) {
        setTimeout(() => {
          this.open(gameState.gachaQueue[0]);
        }, 300);
      }
    }, 250);
  }
}
