/**
 * Witch's Cauldron - Componente PlayerInfo (Quadro de Recorde e Botão de Ranking)
 * Área à direita da estante com a pontuação recorde, troféu de louros e botão para abrir o ranking.
 */

import { soundManager } from '../audio/soundManager.js';
import { gameState } from '../state/gameState.js';

export class PlayerInfo {
  constructor({ containerElement, onOpenRanking }) {
    this.container = containerElement;
    this.onOpenRanking = onOpenRanking;
    this.element = null;
    this.scoreText = null;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'player-info-container';

    // 1. Quadro de Recorde com Moldura Dourada e Lua no Topo
    const board = document.createElement('div');
    board.className = 'record-board';
    board.innerHTML = `
      <div class="board-moon-crest">☾</div>
      <div class="board-header-title">Pontuação Recorde</div>
      
      <div class="trophy-wrapper">
        <span class="laurel-left">🌿</span>
        <div class="trophy-icon">🏆</div>
        <span class="laurel-right">🌿</span>
      </div>

      <div class="score-banner-parchment">
        <span class="score-sparkle-left">✦</span>
        <span class="score-number">${gameState.highScore.toLocaleString('pt-BR')}</span>
        <span class="score-sparkle-right">✦</span>
      </div>

      <div class="board-divider-star">✦</div>

      <div class="board-cauldron-art">
        <div class="mini-cauldron-flask">⚗</div>
        <div class="cauldron-mist-cloud"></div>
      </div>
    `;
    wrapper.appendChild(board);

    // 2. Botão Interativo "Ver ranking"
    const rankButton = document.createElement('button');
    rankButton.className = 'btn-ranking';
    rankButton.setAttribute('type', 'button');
    rankButton.setAttribute('aria-label', 'Visualizar Ranking de Bruxos');
    rankButton.innerHTML = `
      <span class="btn-trophy-symbol">🏆</span>
      <span class="btn-ranking-text">Ver ranking</span>
    `;

    rankButton.addEventListener('mouseenter', () => {
      soundManager.playHover();
    });

    rankButton.addEventListener('click', () => {
      soundManager.playSelect();
      if (this.onOpenRanking) {
        this.onOpenRanking();
      }
    });

    wrapper.appendChild(rankButton);

    // 3. Orbe de Cristal na Mesa Lateral
    const crystalTable = document.createElement('div');
    crystalTable.className = 'crystal-side-table';
    crystalTable.innerHTML = `
      <div class="crystal-orb-wrapper" title="Orbe Místico de Adivinhação">
        <div class="crystal-inner-mist"></div>
        <div class="crystal-highlight"></div>
        <div class="crystal-golden-stand"></div>
      </div>
    `;
    wrapper.appendChild(crystalTable);

    this.element = wrapper;
    this.container.appendChild(wrapper);

    // Atualiza pontuação se o estado mudar
    gameState.on('stateUpdated', () => {
      const numEl = wrapper.querySelector('.score-number');
      if (numEl) {
        numEl.textContent = gameState.highScore.toLocaleString('pt-BR');
      }
    });
  }
}
