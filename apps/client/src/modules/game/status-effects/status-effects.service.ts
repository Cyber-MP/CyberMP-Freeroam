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
  private permanentEffects: string[] = ['GameplayRestriction.InfiniteAmmo'];
  private permanentInterval: ReturnType<typeof setTimeout> | null = null;

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(() => {
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
   * like `add` but applies every cycle
   */
  addPermanent(effect: string) {
    if (this.permanentEffects.includes(effect)) {
      return;
    }

    this.add(effect);

    this.permanentEffects.push(effect);
  }

  has(effect: string) {
    const player = mp.game.GetPlayer();

    return this.effectsSystem.HasStatusEffect(player.GetEntityID(), effect);
  }

  remove(effect: string) {
    const player = mp.game.GetPlayerObject();

    if (this.permanentEffects.includes(effect)) {
      this.permanentEffects = this.permanentEffects.filter(
        (permanentEffect) => permanentEffect !== effect,
      );
    }

    if (this.has(effect)) {
      mp.game.StatusEffectHelper.RemoveStatusEffect(player, effect, undefined);
    }
  }

  private mountPermanentInterval() {
    this.permanentInterval = setInterval(() => {
      for (const effect of this.permanentEffects) {
        this.add(effect);
      }
    }, ms('10s'));
  }
}
