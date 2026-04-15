import * as CyberEnums from '@cybermp/client-types/enums';
import type { gameStatsObjectID } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { mp } from '../../../mp';
import { GStatusEffectsService } from '../status-effects/status-effects.service';

@injectable()
export class GHealthService {
  private readonly DEFAULT_HEALTH = 300;
  private godMode = false;

  constructor(
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
  ) {}

  getDefaultHealth() {
    return this.DEFAULT_HEALTH;
  }

  resetToDefault() {
    this.set(this.DEFAULT_HEALTH);
  }

  god(value: boolean) {
    if (value) {
      this.setMax(99999999);
      this.setCurrent(99999999);
      this.statusEffectsService.add('BaseStatusEffect.Invulnerable');
    } else {
      this.setCurrent(this.DEFAULT_HEALTH);
      this.setMax(this.DEFAULT_HEALTH);
      this.statusEffectsService.remove('BaseStatusEffect.Invulnerable');
    }

    this.godMode = value;
  }

  isGod() {
    return this.godMode;
  }

  setCurrent(value: number) {
    const player = mp.game.GetPlayer();
    const playerGameId = player.GetEntityID() as unknown as gameStatsObjectID;

    const statePoolSystem = mp.game.ScriptGameInstance.GetStatPoolsSystem();

    statePoolSystem.RequestSettingStatPoolValueIgnoreChangeMode(
      playerGameId,
      CyberEnums.gamedataStatPoolType.Health,
      value,
      new mp.game.gameObject(),
      false,
    );
  }

  setMax(value: number) {
    const player = mp.game.GetPlayer();
    const playerGameId = player.GetEntityID() as unknown as gameStatsObjectID;

    mp.game.ScriptGameInstance.GetStatsSystem().RemoveAllModifiers(
      playerGameId,
      CyberEnums.gamedataStatType.Health,
      true,
    );

    const newStats = new mp.game.gameConstantStatModifierData_Deprecated();
    newStats.statType = CyberEnums.gamedataStatType.Health;
    newStats.modifierType = CyberEnums.gameStatModifierType.Additive;
    newStats.value = value;

    mp.game.ScriptGameInstance.GetStatsSystem().AddModifier(
      playerGameId,
      newStats,
    );

    const statePoolSystem = mp.game.ScriptGameInstance.GetStatPoolsSystem();

    statePoolSystem.RequestSettingStatPoolValueIgnoreChangeMode(
      playerGameId,
      CyberEnums.gamedataStatPoolType.Health,
      value,
      new mp.game.gameObject(),
      true,
    );
  }

  set(value: number) {
    this.setMax(value);
    this.setCurrent(value);
  }

  get() {
    const player = mp.game.GetPlayer();
    const playerGameId = player.GetEntityID() as unknown as gameStatsObjectID;

    return mp.game.ScriptGameInstance.GetStatPoolsSystem().GetStatPoolValue(
      playerGameId,
      CyberEnums.gamedataStatPoolType.Health,
      false,
    );
  }

  getMax() {
    const player = mp.game.GetPlayer();
    const playerGameId = player.GetEntityID() as unknown as gameStatsObjectID;

    return mp.game.ScriptGameInstance.GetStatsSystem().GetStatValue(
      playerGameId,
      CyberEnums.gamedataStatType.Health,
    );
  }

  heal() {
    this.setCurrent(this.getMax());
  }
}
