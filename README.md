# 🎃 Witch's Cauldron — Protótipo da Seleção de Fases

Protótipo visual e funcional da tela de seleção de fases do jogo **Witch's Cauldron**, desenvolvido com **HTML5, CSS3, JavaScript ES Modules e Vite**, focado em estética **pixel art painterly/cozy**, animações ambientais desincronizadas em camadas e sistema completo de desbloqueio de poções.

---

## 🚀 Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor local de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra a URL informada no terminal (geralmente `http://localhost:3000` ou `http://localhost:5173`) no seu navegador de preferência.

---

## 📁 Estrutura do Código

```
witchs-cauldron/
├── index.html                     # Estrutura HTML em camadas independentes
├── package.json                   # Dependências e scripts Vite
├── vite.config.js                 # Configuração de portas e build
├── src/
│   ├── main.js                    # Ponto de entrada e bootstrap dos módulos
│   ├── style.css                  # Estilos globais pixel art, 16:9, keyframes
│   ├── config/
│   │   └── stages.js              # Dados das 9 fases e poções (lore, cores, assets)
│   ├── state/
│   │   └── gameState.js           # Gerenciador de estado reativo (unlocked, gacha, shelf)
│   ├── audio/
│   │   └── soundManager.js        # Sintetizador Web Audio API 16-bit (sem arquivos externos)
│   ├── animations/
│   │   ├── characterAnimations.js # Respiração, piscadas e postura da bruxa e do gato
│   │   ├── environment.js         # Partículas de poeira de fada e oscilação de luz
│   │   ├── windowEvents.js        # Paralaxe de nuvens, lua, morcegos e bruxa voadora
│   │   └── unlockSequences.js     # Sequência em 5 etapas da quebra de correntes
│   └── components/
│       ├── Shelf.js               # Móvel da estante com grade 3x3 e placas de 1 a 9
│       ├── PotionSlot.js          # Componente interativo de cada frasco e correntes
│       ├── StageModal.js          # Modal de apresentação de fase e botão de Iniciar
│       ├── GachaModal.js          # Modal de revelação especial de nova poção
│       ├── RankingModal.js        # Quadro de melhores pontuações e conquistas
│       ├── PlayerInfo.js          # Painel de recorde (12.840) e botão de ranking
│       └── DemoPanel.js           # HUD flutuante para testar desbloqueios e eventos
└── scripts/
    ├── build-assets.js            # Script para recorte e geração de camadas
    └── generate-all-potions.js    # Geração dos 9 frascos transparentes e estilhaços
```

---

## ✨ Funcionalidades em Destaque

- **Grade 3x3 na Estante**: 9 poções com formatos e líquidos alquímicos distintos. A Fase 1 inicia desbloqueada e as Fases 2 a 9 bloqueadas por correntes e cadeados dourados.
- **Interações**: Hover com aura mágica suave e partículas e clique para inspecionar a fase.
- **Sistema de Desbloqueio e Gacha**: Modal de primeiro desbloqueio com estética gacha (raios giratórios, confetes e fanfarra sonora).
- **Desbloqueio Acumulado na Estante**: Caso o jogador desbloqueie 3 poções de uma vez, ao retornar à estante todas as três quebram suas correntes em cascata com estilhaços físicos e brilho de transmutação.
- **Ambiente Vivo**:
  - Bruxa respirando e piscando de forma autônoma com olhos sorridentes.
  - Gato preto com respiração independente, piscadas e movimento de orelhas.
  - Chamas da lamparina e velas da parede oscilando de forma orgânica.
  - Janela com paralaxe de nuvens, estrelas cintilantes, travessia periódica de morcegos e evento raro de bruxa voando na vassoura.
  - Trepadeiras e folhagens que balançam com física de vento suave.
- **Áudio Nativo 16-bit**: Totalmente sintetizado via Web Audio API, sem requisições de áudio externas.
- **Painel de Teste Flutuante**: Permite testar 1 desbloqueio, 3 desbloqueios consecutivos, retorno à estante, reiniciar demonstração e forçar eventos climáticos/mágicos.
