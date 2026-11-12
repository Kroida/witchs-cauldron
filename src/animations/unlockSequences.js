/**
 * Witch's Cauldron - Sequências de Desbloqueio da Estante
 * Orquestra as 5 etapas de desbloqueio:
 * 1. Reação das correntes
 * 2. Quebra e estilhaçamento de correntes e cadeado
 * 3. Frascos deixam de ficar escurecidos
 * 4. Revelação da aparência mágica
 * 5. Breve brilho e explosão de partículas
 */

import { soundManager } from '../audio/soundManager.js';

export class UnlockSequencer {
  constructor(environmentManager) {
    this.env = environmentManager;
  }

  /**
   * Executa a sequência completa de desbloqueio em um slot específico
   */
  animateSlot(slot, onComplete) {
    const el = slot.element;
    const chainsEl = slot.chainsElement;
    const padlockEl = slot.padlockElement;
    const bottleEl = slot.bottleElement;
    const auraEl = slot.auraElement;

    // 1. Reação das correntes (tremor e tilintar metálico)
    soundManager.playChainRattle();
    el.classList.add('unlocking-reaction');
    if (chainsEl) chainsEl.classList.add('chain-rattle');
    if (padlockEl) padlockEl.classList.add('padlock-shake');

    // 2. Quebra e estilhaçamento (após 380ms)
    setTimeout(() => {
      soundManager.playShatter();

      // Dispara estilhaços de correntes voando
      this.spawnShatterParticles(el);

      if (padlockEl) {
        padlockEl.classList.remove('padlock-shake');
        padlockEl.classList.add('padlock-shatter');
      }
      if (chainsEl) {
        chainsEl.classList.remove('chain-rattle');
        chainsEl.classList.add('chains-shatter');
      }

      // 3 & 4. Frasco deixa de ficar escurecido e revela aparência
      setTimeout(() => {
        slot.setUnlockedVisuals();
        bottleEl.classList.add('bottle-reveal-flash');

        // 5. Brilho mágico e partículas
        if (auraEl) {
          auraEl.classList.add('aura-burst-active');
        }

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.45;
        if (this.env) {
          this.env.emitBurst(centerX, centerY, slot.config.color, 28);
        }

        // Limpeza final
        setTimeout(() => {
          el.classList.remove('unlocking-reaction');
          bottleEl.classList.remove('bottle-reveal-flash');
          if (auraEl) auraEl.classList.remove('aura-burst-active');
          if (padlockEl) padlockEl.remove();
          if (chainsEl) chainsEl.remove();
          if (onComplete) onComplete();
        }, 600);
      }, 200);
    }, 380);
  }

  /**
   * Cria estilhaços dourados físicos que voam para fora do cadeado
   */
  spawnShatterParticles(containerEl) {
    const rect = containerEl.getBoundingClientRect();
    const count = 14;

    for (let i = 0; i < count; i++) {
      const shard = document.createElement('div');
      shard.className = 'chain-shard-particle';

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const distance = 40 + Math.random() * 55;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance + 20; // Gravidade
      const rot = Math.random() * 720 - 360;

      shard.style.setProperty('--dx', `${dx}px`);
      shard.style.setProperty('--dy', `${dy}px`);
      shard.style.setProperty('--rot', `${rot}deg`);

      containerEl.appendChild(shard);

      setTimeout(() => shard.remove(), 750);
    }
  }

  /**
   * Executa o desbloqueio em lote para múltiplas poções (ex: 3 consecutivas)
   * As poções são animadas em cascata com intervalo de 420ms
   */
  animateBatch(slots, onAllComplete) {
    if (!slots || slots.length === 0) {
      if (onAllComplete) onAllComplete();
      return;
    }

    let completedCount = 0;
    const total = slots.length;

    slots.forEach((slot, index) => {
      setTimeout(() => {
        this.animateSlot(slot, () => {
          completedCount++;
          if (completedCount >= total && onAllComplete) {
            onAllComplete();
          }
        });
      }, index * 450);
    });
  }
}
