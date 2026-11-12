/**
 * Witch's Cauldron - Animações dos Personagens (Bruxa e Gato)
 * Loops independentes de respiração, piscadas de olhos e alterações sutis de postura.
 */

export class CharacterAnimationManager {
  constructor({ witchElement, witchEyesElement, catElement, catFaceElement, lanternFlameElement }) {
    this.witch = witchElement;
    this.witchEyes = witchEyesElement;
    this.cat = catElement;
    this.catFace = catFaceElement;
    this.lanternFlame = lanternFlameElement;

    this.witchBlinkTimer = null;
    this.witchPostureTimer = null;
    this.catBlinkTimer = null;
    this.catEarTimer = null;
    this.flameInterval = null;

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  init() {
    if (this.reducedMotion) return;

    this.startWitchBlinking();
    this.startWitchPostureShifts();
    this.startCatBlinking();
    this.startCatEarTwitches();
    this.startLanternFlicker();
  }

  startWitchBlinking() {
    const schedule = () => {
      const delay = 3200 + Math.random() * 3000; // 3.2s a 6.2s
      this.witchBlinkTimer = setTimeout(() => {
        this.performWitchBlink(() => {
          // 25% de chance de piscada dupla
          if (Math.random() < 0.25) {
            setTimeout(() => {
              this.performWitchBlink(schedule);
            }, 120);
          } else {
            schedule();
          }
        });
      }, delay);
    };
    schedule();
  }

  performWitchBlink(callback) {
    if (!this.witchEyes) return;
    this.witchEyes.classList.add('blinking');
    setTimeout(() => {
      this.witchEyes.classList.remove('blinking');
      if (callback) callback();
    }, 180);
  }

  startWitchPostureShifts() {
    const schedule = () => {
      const delay = 12000 + Math.random() * 8000; // 12s a 20s
      this.witchPostureTimer = setTimeout(() => {
        if (this.witch) {
          this.witch.classList.add('posture-shift');
          setTimeout(() => {
            if (this.witch) this.witch.classList.remove('posture-shift');
            schedule();
          }, 3500);
        }
      }, delay);
    };
    schedule();
  }

  startCatBlinking() {
    const schedule = () => {
      const delay = 4000 + Math.random() * 4500; // 4s a 8.5s
      this.catBlinkTimer = setTimeout(() => {
        if (this.catFace) {
          this.catFace.classList.add('cat-blinking');
          setTimeout(() => {
            if (this.catFace) this.catFace.classList.remove('cat-blinking');
            schedule();
          }, 240);
        }
      }, delay);
    };
    schedule();
  }

  startCatEarTwitches() {
    const schedule = () => {
      const delay = 7500 + Math.random() * 6000; // 7.5s a 13.5s
      this.catEarTimer = setTimeout(() => {
        if (this.cat) {
          this.cat.classList.add('ear-twitch');
          setTimeout(() => {
            if (this.cat) this.cat.classList.remove('ear-twitch');
            schedule();
          }, 400);
        }
      }, delay);
    };
    schedule();
  }

  startLanternFlicker() {
    if (!this.lanternFlame) return;
    // Variação orgânica da chama da lamparina
    let flameTick = 0;
    this.flameInterval = setInterval(() => {
      flameTick += 0.2;
      const flickerScaleX = 0.94 + Math.sin(flameTick * 3.1) * 0.08 + (Math.random() - 0.5) * 0.06;
      const flickerScaleY = 0.96 + Math.cos(flameTick * 2.3) * 0.07 + (Math.random() - 0.5) * 0.05;
      const flickerOpacity = 0.88 + Math.sin(flameTick * 1.7) * 0.12;

      this.lanternFlame.style.transform = `scale(${flickerScaleX}, ${flickerScaleY})`;
      this.lanternFlame.style.opacity = flickerOpacity;
    }, 70);
  }

  destroy() {
    if (this.witchBlinkTimer) clearTimeout(this.witchBlinkTimer);
    if (this.witchPostureTimer) clearTimeout(this.witchPostureTimer);
    if (this.catBlinkTimer) clearTimeout(this.catBlinkTimer);
    if (this.catEarTimer) clearTimeout(this.catEarTimer);
    if (this.flameInterval) clearInterval(this.flameInterval);
  }
}
