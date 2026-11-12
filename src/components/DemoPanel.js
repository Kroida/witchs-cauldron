/**
 * Witch's Cauldron - Painel de Controles de Demonstração
 * Painel flutuante destacável/recolhível com ações para testar o sistema de desbloqueio,
 * retorno à estante, eventos ambientais e áudio conforme solicitado no item 7.
 */

import { soundManager } from '../audio/soundManager.js';
import { gameState } from '../state/gameState.js';

export class DemoPanel {
  constructor({ containerElement, windowEventsManager }) {
    this.container = containerElement;
    this.windowEvents = windowEventsManager;
    this.element = null;
    this.isCollapsed = false;

    this.render();
    this.bindEvents();
  }

  render() {
    const panel = document.createElement('aside');
    panel.className = 'demo-panel-hud';
    panel.setAttribute('aria-label', 'Controles de Demonstração do Protótipo');

    panel.innerHTML = `
      <div class="demo-hud-header">
        <div class="demo-hud-title">
          <span class="hud-icon">🧪</span>
          <span>Controles de Teste</span>
        </div>
        <button type="button" class="btn-hud-toggle" title="Minimizar / Expandir Painel" aria-label="Alternar exibição do painel">
          <span class="toggle-icon">−</span>
        </button>
      </div>

      <div class="demo-hud-body">
        <div class="demo-status-card">
          <div class="status-row">
            <span class="status-label">Poções Desbloqueadas:</span>
            <span class="status-val unlocked-status-val">1 / 9</span>
          </div>
          <div class="status-row">
            <span class="status-label">Pendentes na Estante:</span>
            <span class="status-val pending-status-val">0</span>
          </div>
        </div>

        <div class="demo-actions-grid">
          <!-- 1. Desbloquear 1 Poção -->
          <button type="button" class="btn-demo btn-unlock-one">
            <span class="btn-demo-icon">🔓</span>
            <div class="btn-demo-text">
              <strong>Desbloquear 1 Poção</strong>
              <small>Revelação gacha individual</small>
            </div>
          </button>

          <!-- 2. Desbloquear 3 Consecutivas -->
          <button type="button" class="btn-demo btn-unlock-three">
            <span class="btn-demo-icon">✨</span>
            <div class="btn-demo-text">
              <strong>Desbloquear 3 Poções</strong>
              <small>Desbloqueio acumulado</small>
            </div>
          </button>

          <!-- 3. Retornar à Estante -->
          <button type="button" class="btn-demo btn-return-shelf highlight-action">
            <span class="btn-demo-icon">🔄</span>
            <div class="btn-demo-text">
              <strong>Retornar à Estante</strong>
              <small>Executa quebra de correntes</small>
            </div>
          </button>

          <!-- 4. Reiniciar Demonstração -->
          <button type="button" class="btn-demo btn-reset-demo">
            <span class="btn-demo-icon">🔁</span>
            <div class="btn-demo-text">
              <strong>Reiniciar Estado</strong>
              <small>Apenas Fase 1 ativa</small>
            </div>
          </button>
        </div>

        <div class="demo-extra-tools">
          <div class="extra-tools-title">Eventos Ambientais:</div>
          <div class="extra-tools-buttons">
            <button type="button" class="btn-tool-mini btn-test-witch" title="Força a passagem da bruxa voadora na janela">
              🧹 Bruxa Voadora
            </button>
            <button type="button" class="btn-tool-mini btn-test-bat" title="Força a travessia de um morcego na janela">
              🦇 Morcego
            </button>
            <button type="button" class="btn-tool-mini btn-toggle-sfx" title="Ativa ou desativa os efeitos sonoros">
              🔊 Áudio: <span class="sfx-status">ON</span>
            </button>
          </div>
        </div>

        <!-- Feedback de Ação -->
        <div class="demo-feedback-toast hidden"></div>
      </div>
    `;

    this.element = panel;
    this.container.appendChild(panel);
  }

  bindEvents() {
    const el = this.element;

    // Toggle minimizar
    const toggleBtn = el.querySelector('.btn-hud-toggle');
    toggleBtn.addEventListener('click', () => {
      this.isCollapsed = !this.isCollapsed;
      el.classList.toggle('collapsed', this.isCollapsed);
      toggleBtn.querySelector('.toggle-icon').textContent = this.isCollapsed ? '+' : '−';
    });

    // 1. Desbloquear 1 Poção
    const btnUnlockOne = el.querySelector('.btn-unlock-one');
    btnUnlockOne.addEventListener('click', () => {
      soundManager.playSelect();
      gameState.unlockNextStage();
    });

    // 2. Desbloquear 3 Poções
    const btnUnlockThree = el.querySelector('.btn-unlock-three');
    btnUnlockThree.addEventListener('click', () => {
      soundManager.playSelect();
      gameState.unlockThreeConsecutive();
    });

    // 3. Simular Retorno à Estante
    const btnReturnShelf = el.querySelector('.btn-return-shelf');
    btnReturnShelf.addEventListener('click', () => {
      soundManager.playSelect();
      gameState.triggerReturnToShelf();
    });

    // 4. Reiniciar Estado
    const btnReset = el.querySelector('.btn-reset-demo');
    btnReset.addEventListener('click', () => {
      soundManager.playSelect();
      gameState.resetState();
    });

    // Testar Bruxa Voadora
    const btnWitch = el.querySelector('.btn-test-witch');
    btnWitch.addEventListener('click', () => {
      if (this.windowEvents) {
        this.windowEvents.triggerFlyingWitch();
        this.showToast('🧹 Bruxa voadora cruzando a lua!');
      }
    });

    // Testar Morcego
    const btnBat = el.querySelector('.btn-test-bat');
    btnBat.addEventListener('click', () => {
      if (this.windowEvents) {
        this.windowEvents.triggerBat();
        this.showToast('🦇 Morcego atravessando a janela!');
      }
    });

    // Toggle Áudio
    const btnSfx = el.querySelector('.btn-toggle-sfx');
    const sfxStatus = el.querySelector('.sfx-status');
    btnSfx.addEventListener('click', () => {
      const isEnabled = soundManager.toggle();
      sfxStatus.textContent = isEnabled ? 'ON' : 'OFF';
      btnSfx.classList.toggle('muted', !isEnabled);
      this.showToast(isEnabled ? '🔊 Áudio ativado' : '🔇 Áudio silenciado');
    });

    // Ouve atualizações de estado do jogo
    gameState.on('stateUpdated', () => this.updateStatus());
    gameState.on('notification', ({ message }) => this.showToast(message));

    this.updateStatus();
  }

  updateStatus() {
    const unlockedEl = this.element.querySelector('.unlocked-status-val');
    const pendingEl = this.element.querySelector('.pending-status-val');
    const returnBtn = this.element.querySelector('.btn-return-shelf');

    const unlockedCount = gameState.getUnlockedCount();
    const pendingCount = gameState.getPendingUnlockStages().length;

    if (unlockedEl) unlockedEl.textContent = `${unlockedCount} / 9`;
    if (pendingEl) {
      pendingEl.textContent = pendingCount;
      pendingEl.classList.toggle('has-pending', pendingCount > 0);
    }

    if (returnBtn) {
      returnBtn.classList.toggle('pulse-attention', pendingCount > 0);
    }
  }

  showToast(message) {
    const toast = this.element.querySelector('.demo-feedback-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('toast-show');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.classList.add('hidden'), 250);
    }, 3200);
  }
}
