/**
 * Witch's Cauldron - Componente Estante de Poções (3x3 Grid)
 * Elemento central da cabana mágica que abriga os 9 frascos de poção,
 * cabeçalho entalhado em ouro e madeira e orquestração de desbloqueio em lote.
 */

import { STAGES_CONFIG } from '../config/stages.js';
import { PotionSlot } from './PotionSlot.js';
import { UnlockSequencer } from '../animations/unlockSequences.js';
import { gameState } from '../state/gameState.js';

export class Shelf {
  constructor({ containerElement, onSelectPotion, environmentManager }) {
    this.container = containerElement;
    this.onSelectPotion = onSelectPotion;
    this.env = environmentManager;
    this.sequencer = new UnlockSequencer(environmentManager);
    this.slots = [];
    this.element = null;

    this.init();
  }

  init() {
    this.render();

    // Ouve o evento de retorno à estante para disparar a quebra das correntes
    gameState.on('shelfUnlockStart', ({ pendingStages }) => {
      this.handleShelfUnlock(pendingStages);
    });

    // Ouve o reset para restaurar os visuais bloqueados
    gameState.on('stateReset', () => {
      this.resetVisuals();
    });
  }

  render() {
    const shelfWrapper = document.createElement('div');
    shelfWrapper.className = 'potion-shelf-wrapper';

    // 1. Cabeçalho ornamentado da estante
    const header = document.createElement('div');
    header.className = 'shelf-header-plaque';
    header.innerHTML = `
      <div class="shelf-banner-pennant">
        <span class="pennant-moon">☾</span>
      </div>
      <div class="shelf-header-title">✦ Seleção de Fases ✦</div>
    `;
    shelfWrapper.appendChild(header);

    // 2. Móvel de Madeira (3 prateleiras para grade 3x3)
    const cabinet = document.createElement('div');
    cabinet.className = 'shelf-cabinet';

    // Três prateleiras de madeira
    const shelfRow1 = document.createElement('div'); shelfRow1.className = 'shelf-row shelf-row-1';
    const shelfRow2 = document.createElement('div'); shelfRow2.className = 'shelf-row shelf-row-2';
    const shelfRow3 = document.createElement('div'); shelfRow3.className = 'shelf-row shelf-row-3';

    // Cria os 9 slots
    STAGES_CONFIG.forEach(cfg => {
      const slot = new PotionSlot(cfg, this.onSelectPotion, this.env);
      this.slots.push(slot);

      if (cfg.id <= 3) {
        shelfRow1.appendChild(slot.element);
      } else if (cfg.id <= 6) {
        shelfRow2.appendChild(slot.element);
      } else {
        shelfRow3.appendChild(slot.element);
      }
    });

    cabinet.appendChild(shelfRow1);
    cabinet.appendChild(shelfRow2);
    cabinet.appendChild(shelfRow3);

    // 3. Base da Estante entalhada com Lua e arabescos
    const shelfBase = document.createElement('div');
    shelfBase.className = 'shelf-carved-base';
    shelfBase.innerHTML = `
      <div class="shelf-base-ornament">
        <span class="base-flourish-left">❧</span>
        <span class="base-moon">☾</span>
        <span class="base-flourish-right">❧</span>
      </div>
    `;
    shelfWrapper.appendChild(cabinet);
    shelfWrapper.appendChild(shelfBase);

    this.element = shelfWrapper;
    this.container.appendChild(shelfWrapper);
  }

  /**
   * Executa o desbloqueio acumulado de todas as poções pendentes
   * Requisito: Se 3 poções foram desbloqueadas sem retornar à estante,
   * todas as três deverão executar suas animações de desbloqueio quando ele retornar!
   */
  handleShelfUnlock(pendingStages) {
    const pendingIds = pendingStages.map(p => p.id);
    const slotsToAnimate = this.slots.filter(s => pendingIds.includes(s.config.id));

    this.element.classList.add('shelf-active-unlock');

    this.sequencer.animateBatch(slotsToAnimate, () => {
      this.element.classList.remove('shelf-active-unlock');
      gameState.finishShelfUnlock(pendingIds);
    });
  }

  resetVisuals() {
    this.slots.forEach(slot => {
      if (slot.config.id === 1) {
        slot.setUnlockedVisuals();
      } else {
        slot.setLockedVisuals();
      }
    });
  }
}
