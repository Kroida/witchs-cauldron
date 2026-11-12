/**
 * Witch's Cauldron - Componente RankingModal (Tabela de Classificação dos Bruxos)
 * Reproduz fielmente a interface da Referência Conceitual 6 com os melhores alquimistas,
 * pontuações fictícias e o painel "Minhas Conquistas".
 */

import { soundManager } from '../audio/soundManager.js';
import { gameState } from '../state/gameState.js';

export class RankingModal {
  constructor({ containerElement }) {
    this.container = containerElement;
    this.element = null;

    this.leaderboard = [
      { rank: '1º', name: 'LunaEterea', score: '51.000', avatar: '🧙‍♀️', crown: true },
      { rank: '2º', name: 'BrumaSutil', score: '43.700', avatar: '👓' },
      { rank: '3º', name: 'AlmaAlquímica', score: '41.950', avatar: '✨' },
      { rank: '4º', name: 'EstrelaDourada', score: '38.620', avatar: '⭐' },
      { rank: '5º', name: 'PoçãoVioleta', score: '34.880', avatar: '🔮' },
      { rank: '6º', name: 'CartomanteLírio', score: '32.500', avatar: '🎴' }
    ];

    this.render();
  }

  render() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop ranking-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="ranking-modal-card">
        <button type="button" class="ranking-close-btn" aria-label="Fechar Ranking">✕</button>

        <div class="ranking-header">
          <div class="ranking-header-crest">☾</div>
          <h2 class="ranking-title">Ranking de Bruxos</h2>
          <div class="ranking-subtitle">✦ Maiores Pontuações ✦</div>
        </div>

        <div class="ranking-content-layout">
          <!-- Coluna Esquerda: Leaderboard -->
          <div class="ranking-table-panel">
            <!-- 1º Lugar Destaque -->
            <div class="champion-podium">
              <div class="champion-crown">👑</div>
              <div class="champion-avatar-ring">
                <span class="avatar-icon">🧙‍♀️</span>
              </div>
              <div class="champion-rank-badge">1º</div>
              <div class="champion-name">LunaEterea</div>
              <div class="champion-score">✦ 51.000 ✦</div>
            </div>

            <!-- Lista de Classificação 2º ao 6º -->
            <div class="ranking-rows-list">
              ${this.leaderboard.slice(1).map(item => `
                <div class="ranking-row">
                  <div class="rank-pos-badge">${item.rank}</div>
                  <div class="rank-user-info">
                    <span class="rank-avatar">${item.avatar}</span>
                    <span class="rank-username">${item.name}</span>
                  </div>
                  <div class="rank-user-score">✦ ${item.score}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Coluna Direita: Minhas Conquistas -->
          <div class="achievements-panel">
            <div class="achieve-panel-header">
              <span class="achieve-moon">☾</span>
              <span>Minhas Conquistas</span>
            </div>

            <div class="achieve-item">
              <div class="achieve-icon">⚗️</div>
              <div class="achieve-info">
                <div class="achieve-title">Poções Descobertas</div>
                <div class="achieve-progress-text"><span class="unlocked-counter">1</span> / 9</div>
              </div>
            </div>

            <div class="achieve-item">
              <div class="achieve-icon">🌿</div>
              <div class="achieve-info">
                <div class="achieve-title">Ingredientes Descobertos</div>
                <div class="achieve-progress-text">48 / 62</div>
              </div>
            </div>

            <div class="achieve-item">
              <div class="achieve-icon">🎴</div>
              <div class="achieve-info">
                <div class="achieve-title">Usos de Tarots</div>
                <div class="achieve-progress-text">17</div>
              </div>
            </div>

            <button type="button" class="btn-ranking-back">
              <span>‹ Voltar</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.element = overlay;
    this.container.appendChild(overlay);

    const closeBtn = overlay.querySelector('.ranking-close-btn');
    const backBtn = overlay.querySelector('.btn-ranking-back');

    [closeBtn, backBtn].forEach(b => {
      b.addEventListener('click', () => this.close());
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    // Atualiza o contador de poções quando o estado do jogo mudar
    gameState.on('stateUpdated', () => {
      const counter = overlay.querySelector('.unlocked-counter');
      if (counter) {
        counter.textContent = gameState.getUnlockedCount();
      }
    });
  }

  open() {
    const counter = this.element.querySelector('.unlocked-counter');
    if (counter) {
      counter.textContent = gameState.getUnlockedCount();
    }

    this.element.classList.remove('hidden');
    this.element.classList.add('ranking-entering');
    setTimeout(() => this.element.classList.remove('ranking-entering'), 300);
  }

  close() {
    soundManager.playCloseModal();
    this.element.classList.add('ranking-leaving');
    setTimeout(() => {
      this.element.classList.remove('ranking-leaving');
      this.element.classList.add('hidden');
    }, 200);
  }
}
