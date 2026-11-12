/**
 * Witch's Cauldron - Gerenciador de Estado do Jogo (Reactive Game State)
 * Controla os estados de desbloqueio, revelação gacha e pendência de animação na estante.
 */

import { STAGES_CONFIG } from '../config/stages.js';

class GameState {
  constructor() {
    this.listeners = new Map();
    this.stages = [];
    this.highScore = 12840;
    this.selectedStage = null;
    this.gachaQueue = [];
    this.isAnimatingShelf = false;
    this.init();
  }

  init() {
    this.stages = STAGES_CONFIG.map(stage => ({
      id: stage.id,
      stageNumber: stage.stageNumber,
      name: stage.name,
      unlocked: stage.unlockedInitially,
      specialRevealed: stage.unlockedInitially, // Potion 1 has already been revealed
      pendingShelfAnimation: false // Needs shatter/reveal animation on shelf
    }));
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const list = this.listeners.get(event) || [];
      const idx = list.indexOf(callback);
      if (idx !== -1) list.splice(idx, 1);
    };
  }

  emit(event, data) {
    const list = this.listeners.get(event) || [];
    list.forEach(fn => fn(data));
  }

  getStage(id) {
    return this.stages.find(s => s.id === id);
  }

  getConfig(id) {
    return STAGES_CONFIG.find(s => s.id === id);
  }

  getUnlockedCount() {
    return this.stages.filter(s => s.unlocked).length;
  }

  getPendingUnlockStages() {
    return this.stages.filter(s => s.unlocked && s.pendingShelfAnimation);
  }

  /**
   * Simula o desbloqueio de uma única poção
   */
  unlockNextStage() {
    const nextLocked = this.stages.find(s => !s.unlocked);
    if (!nextLocked) {
      this.emit('notification', { message: 'Todas as 9 poções já estão desbloqueadas!' });
      return null;
    }

    nextLocked.unlocked = true;
    nextLocked.pendingShelfAnimation = true;

    // Se a revelação especial nunca foi exibida, adiciona à fila gacha
    if (!nextLocked.specialRevealed) {
      this.gachaQueue.push(nextLocked.id);
      this.emit('gachaQueueUpdated', this.gachaQueue);
    }

    this.emit('stateUpdated', { stageId: nextLocked.id, type: 'single_unlock' });
    return nextLocked;
  }

  /**
   * Simula o desbloqueio acumulado de três poções consecutivas
   * Requisito: se o jogador desbloquear 3 poções sem retornar à estante,
   * todas as três deverão executar suas animações de desbloqueio quando ele retornar!
   */
  unlockThreeConsecutive() {
    const lockedStages = this.stages.filter(s => !s.unlocked);
    if (lockedStages.length === 0) {
      this.emit('notification', { message: 'Todas as 9 poções já estão desbloqueadas!' });
      return [];
    }

    const toUnlock = lockedStages.slice(0, 3);
    toUnlock.forEach(st => {
      st.unlocked = true;
      st.pendingShelfAnimation = true;
      if (!st.specialRevealed) {
        this.gachaQueue.push(st.id);
      }
    });

    if (this.gachaQueue.length > 0) {
      this.emit('gachaQueueUpdated', this.gachaQueue);
    }

    this.emit('stateUpdated', { stages: toUnlock, type: 'multi_unlock' });
    this.emit('notification', {
      message: `${toUnlock.length} poções desbloqueadas consecutivamente! Clique em 'Simular Retorno à Estante' para ver as correntes se quebrando.`
    });

    return toUnlock;
  }

  /**
   * Marca uma poção como apresentada no modal gacha
   */
  markSpecialRevealed(id) {
    const st = this.getStage(id);
    if (st) {
      st.specialRevealed = true;
      this.gachaQueue = this.gachaQueue.filter(gid => gid !== id);
      this.emit('stateUpdated', { stageId: id, type: 'gacha_revealed' });
    }
  }

  /**
   * Simula o retorno à estante
   * Executa a sequência de animação para TODAS as poções pendentes
   */
  triggerReturnToShelf() {
    if (this.isAnimatingShelf) return;

    const pending = this.getPendingUnlockStages();
    if (pending.length === 0) {
      this.emit('notification', {
        message: 'A estante já está atualizada! Todas as poções desbloqueadas já tiveram suas correntes rompidas.'
      });
      return;
    }

    this.isAnimatingShelf = true;
    this.emit('shelfUnlockStart', { pendingStages: pending });
  }

  /**
   * Conclui a animação da estante para as poções
   */
  finishShelfUnlock(stageIds) {
    stageIds.forEach(id => {
      const st = this.getStage(id);
      if (st) {
        st.pendingShelfAnimation = false;
      }
    });
    this.isAnimatingShelf = false;
    this.emit('shelfUnlockFinished', { stageIds });
    this.emit('stateUpdated', { stageIds, type: 'shelf_updated' });
  }

  /**
   * Reinicia o estado da demonstração para o padrão inicial
   */
  resetState() {
    this.init();
    this.gachaQueue = [];
    this.isAnimatingShelf = false;
    this.selectedStage = null;
    this.emit('stateReset');
    this.emit('stateUpdated', { type: 'reset' });
    this.emit('notification', { message: 'Estado reiniciado: Apenas a Fase 1 está desbloqueada.' });
  }
}

export const gameState = new GameState();
