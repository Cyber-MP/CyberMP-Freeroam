import type { gameStatusEffectSystem } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import ms from 'ms';
import { mp } from '../../../mp';

@eager()
@injectable()
export class GStatusEffectsService {
  private readonly DEFAULT_STATUS_EFFECTS = [
    'GameplayRestriction.NoPhotoMode',
    'GameplayRestriction.NoScanning',
  ];

  private effectsSystem!: gameStatusEffectSystem;
  private permanentEffects = new Set(['GameplayRestriction.InfiniteAmmo']);
  private permanentInterval: ReturnType<typeof setTimeout> | null = null;

  @postConstruct()
  private init() {
    mp.game.onceGameLoaded(() => {
      this.effectsSystem = mp.game.ScriptGameInstance.GetStatusEffectSystem();

      for (const effect of this.DEFAULT_STATUS_EFFECTS) {
        this.add(effect);
      }

      this.mountPermanentInterval();
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

  /**
   * like `add` but applies every 10s
   */
  addPermanent(effect: string) {
    if (this.permanentEffects.has(effect)) {
      return;
    }

    this.add(effect);

    this.permanentEffects.add(effect);
  }

  has(effect: string) {
    const player = mp.game.GetPlayer();

    return this.effectsSystem.HasStatusEffect(player.GetEntityID(), effect);
  }

  remove(effect: string) {
    const player = mp.game.GetPlayerObject();

    if (this.permanentEffects.has(effect)) {
      this.permanentEffects.delete(effect);
    }

    if (this.has(effect)) {
      mp.game.StatusEffectHelper.RemoveStatusEffect(player, effect, undefined);
    }
  }

  private mountPermanentInterval() {
    this.permanentInterval = setInterval(() => {
      for (const effect of this.permanentEffects.values()) {
        this.add(effect);
      }
    }, ms('10s'));
  }
}
