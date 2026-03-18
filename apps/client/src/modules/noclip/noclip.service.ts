// import { inject, injectable } from 'inversify';
// import { mp } from '../../mp';
// import { GKeyboardService } from '../game/keyboard.service';
// import { GStatusEffectsService } from '../game/status-effects/status-effects.service';

// @injectable()
// class NoclipService {
//   private active = false;

//   private activeStatusEffects = [
//     'GameplayRestriction.NoZooming',
//     'GameplayRestriction.NoMovement',
//   ];

//   private updateTick: number | null = null;

//   constructor(
//     @inject(GKeyboardService) private keyboard: GKeyboardService,
//     @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
//   ) {}

//   setActive(value: boolean) {
//     this.active = value;
//     this.update();
//   }

//   private update() {
//     if (this.active) {
//       this.init();
//     } else {
//       this.destroy();
//     }
//   }

//   private onTick() {}

//   private init() {
//     for (const effect of this.activeStatusEffects) {
//       this.statusEffects.add(effect);
//     }

//     this.updateTick = mp.setTick(this.onTick.bind(this));
//   }

//   private destroy() {
//     if (this.updateTick) {
//       mp.clearTick(this.updateTick);

//       this.updateTick = null;
//     }

//     for (const effect of this.activeStatusEffects) {
//       this.statusEffects.remove(effect);
//     }
//   }
// }
