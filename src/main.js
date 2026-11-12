/**
 * Witch's Cauldron — Arquivo Principal de Inicialização (Entry Point)
 * Integra todos os componentes de interface, controladores de animação e eventos.
 */

import { EnvironmentManager } from './animations/environment.js';
import { WindowEventsManager } from './animations/windowEvents.js';
import { CharacterAnimationManager } from './animations/characterAnimations.js';
import { Shelf } from './components/Shelf.js';
import { PlayerInfo } from './components/PlayerInfo.js';
import { StageModal } from './components/StageModal.js';
import { GachaModal } from './components/GachaModal.js';
import { RankingModal } from './components/RankingModal.js';
import { DemoPanel } from './components/DemoPanel.js';
import { soundManager } from './audio/soundManager.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização do Áudio no primeiro gesto do usuário
  const initAudioOnInteraction = () => {
    soundManager.init();
    window.removeEventListener('click', initAudioOnInteraction);
    window.removeEventListener('keydown', initAudioOnInteraction);
    window.removeEventListener('touchstart', initAudioOnInteraction);
  };
  window.addEventListener('click', initAudioOnInteraction, { once: true });
  window.addEventListener('keydown', initAudioOnInteraction, { once: true });
  window.addEventListener('touchstart', initAudioOnInteraction, { once: true });

  // 1. Inicializa o Canvas de Partículas Mágicas Ambientais
  const particlesCanvas = document.getElementById('particles-canvas');
  const environmentManager = new EnvironmentManager(particlesCanvas);

  // 2. Inicializa o Canvas de Eventos da Janela (Nuvens, Lua, Morcego, Bruxa Voadora)
  const windowCanvas = document.getElementById('window-canvas');
  const windowEventsManager = new WindowEventsManager(windowCanvas);

  // 3. Inicializa as Animações dos Personagens (Bruxa, Gato, Lamparina)
  const characterManager = new CharacterAnimationManager({
    witchElement: document.getElementById('witch-character'),
    witchEyesElement: document.getElementById('witch-eyes-overlay'),
    catElement: document.getElementById('cat-character'),
    catFaceElement: document.getElementById('cat-face-overlay'),
    lanternFlameElement: document.getElementById('lantern-flame')
  });

  // 4. Modais
  const modalsRoot = document.getElementById('modals-root');
  
  const stageModal = new StageModal({ containerElement: modalsRoot });
  const gachaModal = new GachaModal({ containerElement: modalsRoot, environmentManager });
  const rankingModal = new RankingModal({ containerElement: modalsRoot });

  // 5. Estante de Poções (Central 3x3)
  const shelfMount = document.getElementById('shelf-mount');
  const shelf = new Shelf({
    containerElement: shelfMount,
    environmentManager,
    onSelectPotion: (stageConfig) => {
      stageModal.open(stageConfig);
    }
  });

  // 6. Informações do Jogador (Recorde e Ranking à Direita)
  const playerInfoMount = document.getElementById('player-info-mount');
  const playerInfo = new PlayerInfo({
    containerElement: playerInfoMount,
    onOpenRanking: () => {
      rankingModal.open();
    }
  });

  // 7. Painel de Controles de Demonstração (Test HUD)
  const demoHudRoot = document.getElementById('demo-hud-root');
  const demoPanel = new DemoPanel({
    containerElement: demoHudRoot,
    windowEventsManager
  });

  console.log('🎃 Witch\'s Cauldron — Seleção de Fases carregada com sucesso!');
});
