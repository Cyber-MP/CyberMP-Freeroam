import type { gameStatusEffectSystem } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../../mp';

@eager()
@injectable()
export class GStatusEffectsService {
  private effectsSystem!: gameStatusEffectSystem;

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(() => {
      this.effectsSystem = mp.game.ScriptGameInstance.GetStatusEffectSystem();
    });
  }

  add(effect: string) {
    const player = mp.game.GetPlayer();

    this.effectsSystem.ApplyStatusEffect(
      player.GetEntityID(),
      effect,
      player.GetRecordID(),
      player.GetEntityID(),
    );
  }

  has(effect: string) {
    const player = mp.game.GetPlayer();

    return this.effectsSystem.HasStatusEffect(player.GetEntityID(), effect);
  }

  remove(effect: string) {
    const player = mp.game.GetPlayerObject();

    if (this.has(effect)) {
      mp.game.StatusEffectHelper.RemoveStatusEffect(player, effect, undefined);
    }
  }
}
