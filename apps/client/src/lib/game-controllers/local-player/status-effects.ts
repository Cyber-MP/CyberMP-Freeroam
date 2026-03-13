import type { gameStatusEffectSystem } from '@cybermp/client-types/game';
import { mp } from '../../../mp';

export class StatusEffectsController {
  private effectsSystem!: gameStatusEffectSystem;

  constructor() {
    mp.game.onGameLoaded(() => {
      this.effectsSystem = mp.game.ScriptGameInstance.GetStatusEffectSystem();
    });
  }

  addStatusEffect(effect: string) {
    const player = mp.game.GetPlayer();

    this.effectsSystem.ApplyStatusEffect(
      player.GetEntityID(),
      effect,
      player.GetRecordID(),
      player.GetEntityID(),
    );
  }

  hasStatusEffect(effect: string) {
    const player = mp.game.GetPlayer();

    return this.effectsSystem.HasStatusEffect(player.GetEntityID(), effect);
  }

  removeStatusEffect(effect: string) {
    const player = mp.game.GetPlayerObject();

    if (this.hasStatusEffect(effect)) {
      mp.game.StatusEffectHelper.RemoveStatusEffect(player, effect, undefined);
    }
  }
}
