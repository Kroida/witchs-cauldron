/**
 * Witch's Cauldron - Componente PotionSlot (Frasco na Estante)
 * Gerencia os estados visual, interações de hover (aura mágica + partículas)
 * e clique de seleção para cada poção da grade 3x3.
 */

import { soundManager } from '../audio/soundManager.js';
import { gameState } from '../state/gameState.js';

export class PotionSlot {
  constructor(config, onSelect, environmentManager) {
    this.config = config;
    this.onSelect = onSelect;
    this.env = environmentManager;
    this.element = null;
    this.bottleElement = null;
    this.chainsElement = null;
    this.padlockElement = null;
    this.auraElement = null;
    this.hoverInterval = null;

    this.render();
  }

  render() {
    const slotState = gameState.getStage(this.config.id);
    const isUnlocked = slotState ? slotState.unlocked : this.config.unlockedInitially;
    const isPending = slotState ? slotState.pendingShelfAnimation : false;

    // Se estiver pendente de animação na estante, ainda deve parecer bloqueado visualmente
    // até que a sequência de quebra seja executada!
    const visuallyUnlocked = isUnlocked && !isPending;

    const el = document.createElement('div');
    el.className = `potion-slot ${visuallyUnlocked ? 'unlocked' : 'locked'}`;
    el.dataset.stageId = this.config.id;
    el.setAttribute('tabindex', visuallyUnlocked ? '0' : '-1');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Fase ${this.config.stageNumber}: ${this.config.name} (${visuallyUnlocked ? 'Desbloqueada' : 'Bloqueada'})`);

    // Aura mágica de fundo
    const aura = document.createElement('div');
    aura.className = 'potion-aura';
    aura.style.setProperty('--glow-color', this.config.glowColor);
    aura.style.setProperty('--main-color', this.config.color);
    el.appendChild(aura);
    this.auraElement = aura;

    // Container do frasco
    const wrapper = document.createElement('div');
    wrapper.className = 'potion-wrapper';

    // Imagem do frasco (desbloqueado ou escurecido)
    const bottle = document.createElement('img');
    bottle.className = 'potion-img';
    bottle.src = visuallyUnlocked ? this.config.assetUnlocked : this.config.assetLocked;
    bottle.alt = this.config.name;
    bottle.draggable = false;
    wrapper.appendChild(bottle);
    this.bottleElement = bottle;

    // Se estiver bloqueado ou pendente de animação, exibe as correntes e o cadeado
    if (!visuallyUnlocked) {
      if (this.config.chainsOverlay) {
        const chains = document.createElement('img');
        chains.className = 'potion-chains-overlay';
        chains.src = this.config.chainsOverlay;
        chains.draggable = false;
        wrapper.appendChild(chains);
        this.chainsElement = chains;
      }

      const padlock = document.createElement('div');
      padlock.className = 'potion-padlock-icon';
      wrapper.appendChild(padlock);
      this.padlockElement = padlock;
    }

    el.appendChild(wrapper);

    // Placa com o número da fase
    const plaque = document.createElement('div');
    plaque.className = 'potion-plaque-label';
    plaque.innerHTML = `<span class="plaque-num">${this.config.stageNumber}</span>`;
    el.appendChild(plaque);

    this.element = el;
    this.bindEvents();
    return el;
  }

  bindEvents() {
    // Hover em desktop
    this.element.addEventListener('mouseenter', () => this.handleMouseEnter());
    this.element.addEventListener('mouseleave', () => this.handleMouseLeave());

    // Clique / Toque
    this.element.addEventListener('click', () => this.handleClick());
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleClick();
      }
    });

    // Touch em dispositivos móveis
    this.element.addEventListener('touchstart', () => {
      this.element.classList.add('touch-active');
    }, { passive: true });

    this.element.addEventListener('touchend', () => {
      this.element.classList.remove('touch-active');
    }, { passive: true });
  }

  handleMouseEnter() {
    const slotState = gameState.getStage(this.config.id);
    const visuallyUnlocked = slotState && slotState.unlocked && !slotState.pendingShelfAnimation;

    if (visuallyUnlocked) {
      soundManager.playHover();
      this.element.classList.add('hover-active');

      // Gera pequenas partículas mágicas emitidas pelo frasco durante o hover
      if (this.env) {
        const emit = () => {
          const rect = this.element.getBoundingClientRect();
          const rx = rect.left + rect.width * (0.3 + Math.random() * 0.4);
          const ry = rect.top + rect.height * (0.3 + Math.random() * 0.35);
          this.env.emitBurst(rx, ry, this.config.color, 3);
        };
        emit();
        this.hoverInterval = setInterval(emit, 250);
      }
    } else {
      // Frasco bloqueado: tilintar discreto e aviso tátil
      soundManager.playChainRattle();
      this.element.classList.add('locked-shake');
      setTimeout(() => {
        this.element.classList.remove('locked-shake');
      }, 350);
    }
  }

  handleMouseLeave() {
    this.element.classList.remove('hover-active');
    if (this.hoverInterval) {
      clearInterval(this.hoverInterval);
      this.hoverInterval = null;
    }
  }

  handleClick() {
    const slotState = gameState.getStage(this.config.id);
    const visuallyUnlocked = slotState && slotState.unlocked && !slotState.pendingShelfAnimation;

    if (visuallyUnlocked) {
      soundManager.playSelect();
      this.handleMouseLeave();
      if (this.onSelect) {
        this.onSelect(this.config);
      }
    } else {
      // Reação ao tentar clicar em poção bloqueada
      soundManager.playChainRattle();
      this.element.classList.add('locked-shake');
      setTimeout(() => {
        this.element.classList.remove('locked-shake');
      }, 400);

      gameState.emit('notification', {
        message: `Fase ${this.config.stageNumber} está trancada por correntes arcanas!`
      });
    }
  }

  /**
   * Atualiza visualmente para o estado desbloqueado
   */
  setUnlockedVisuals() {
    this.element.classList.remove('locked');
    this.element.classList.add('unlocked');
    this.element.setAttribute('tabindex', '0');
    this.bottleElement.src = this.config.assetUnlocked;
  }

  /**
   * Atualiza visualmente para o estado bloqueado (reset)
   */
  setLockedVisuals() {
    this.element.classList.remove('unlocked');
    this.element.classList.add('locked');
    this.element.setAttribute('tabindex', '-1');
    this.bottleElement.src = this.config.assetLocked;

    // Recria correntes se não existirem
    const wrapper = this.element.querySelector('.potion-wrapper');
    if (wrapper) {
      if (!wrapper.querySelector('.potion-chains-overlay') && this.config.chainsOverlay) {
        const chains = document.createElement('img');
        chains.className = 'potion-chains-overlay';
        chains.src = this.config.chainsOverlay;
        chains.draggable = false;
        wrapper.appendChild(chains);
        this.chainsElement = chains;
      }
      if (!wrapper.querySelector('.potion-padlock-icon')) {
        const padlock = document.createElement('div');
        padlock.className = 'potion-padlock-icon';
        wrapper.appendChild(padlock);
        this.padlockElement = padlock;
      }
    }
  }
}
