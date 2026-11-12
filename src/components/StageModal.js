/**
 * Witch's Cauldron - Componente StageModal (Apresentação da Fase Selecionada)
 * Exibe detalhes da poção, número da fase, anotações da bruxa e botão de Iniciar
 * com indicação amigável de que o gameplay ainda não foi implementado.
 */

import { soundManager } from '../audio/soundManager.js';

export class StageModal {
  constructor({ containerElement }) {
    this.container = containerElement;
    this.element = null;
    this.currentStage = null;

    this.render();
  }

  render() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop stage-modal-backdrop hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="stage-modal-card">
        <button type="button" class="modal-close-btn" aria-label="Fechar Modal">✕</button>
        
        <div class="stage-modal-header">
          <div class="stage-tag">✦ FASE <span class="modal-stage-number">1</span> ✦</div>
          <h2 class="modal-stage-title">Poção Cósmica</h2>
          <div class="modal-stage-subtitle">Essência das Estrelas Antigas</div>
        </div>

        <div class="stage-modal-body">
          <div class="stage-potion-preview">
            <div class="preview-aura"></div>
            <img class="preview-bottle-img" src="" alt="Poção" />
            <div class="preview-stars-badge">★★★</div>
          </div>

          <div class="stage-details-text">
            <div class="detail-section">
              <div class="section-label">📜 Descrição Alquímica</div>
              <p class="modal-stage-desc"></p>
            </div>

            <div class="detail-section">
              <div class="section-label">🌿 Ingrediente Principal</div>
              <div class="modal-stage-ingredient"></div>
            </div>

            <div class="detail-section witch-notes-box">
              <div class="section-label">✨ Anotações da Bruxa</div>
              <p class="modal-witch-notes"></p>
            </div>
          </div>
        </div>

        <!-- Alerta amigável de Gameplay em Desenvolvimento -->
        <div class="gameplay-notice hidden">
          <span class="notice-icon">🔮</span>
          <span class="notice-text">O caldeirão está sendo preparado! O gameplay de preparo das poções será liberado em breve.</span>
        </div>

        <div class="stage-modal-actions">
          <button type="button" class="btn-modal-cancel">Voltar</button>
          <button type="button" class="btn-modal-start">
            <span class="btn-sparkle">✨</span>
            <span class="btn-text">Iniciar Preparo</span>
            <span class="btn-sparkle">✨</span>
          </button>
        </div>
      </div>
    `;

    this.element = overlay;
    this.container.appendChild(overlay);

    // Eventos
    const closeBtn = overlay.querySelector('.modal-close-btn');
    const cancelBtn = overlay.querySelector('.btn-modal-cancel');
    const startBtn = overlay.querySelector('.btn-modal-start');

    [closeBtn, cancelBtn].forEach(b => {
      b.addEventListener('click', () => this.close());
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        this.close();
      }
    });

    startBtn.addEventListener('click', () => {
      soundManager.playSelect();
      const notice = overlay.querySelector('.gameplay-notice');
      notice.classList.remove('hidden');
      notice.classList.add('notice-shake');
      setTimeout(() => notice.classList.remove('notice-shake'), 400);
    });
  }

  open(stageConfig) {
    this.currentStage = stageConfig;

    const el = this.element;
    el.querySelector('.modal-stage-number').textContent = stageConfig.stageNumber;
    el.querySelector('.modal-stage-title').textContent = stageConfig.name;
    el.querySelector('.modal-stage-subtitle').textContent = stageConfig.subtitle;
    el.querySelector('.modal-stage-desc').textContent = stageConfig.description;
    el.querySelector('.modal-stage-ingredient').textContent = stageConfig.element;
    el.querySelector('.modal-witch-notes').textContent = stageConfig.witchNotes;

    const bottleImg = el.querySelector('.preview-bottle-img');
    bottleImg.src = stageConfig.assetUnlocked;

    const aura = el.querySelector('.preview-aura');
    aura.style.setProperty('--preview-glow', stageConfig.glowColor);
    aura.style.setProperty('--preview-color', stageConfig.color);

    // Esconde aviso prévio de gameplay
    el.querySelector('.gameplay-notice').classList.add('hidden');

    el.classList.remove('hidden');
    el.classList.add('modal-entering');
    setTimeout(() => el.classList.remove('modal-entering'), 300);
  }

  close() {
    soundManager.playCloseModal();
    this.element.classList.add('modal-leaving');
    setTimeout(() => {
      this.element.classList.remove('modal-leaving');
      this.element.classList.add('hidden');
      this.currentStage = null;
    }, 200);
  }
}
