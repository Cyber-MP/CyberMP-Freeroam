import * as CyberEnums from '@cybermp/client-types/enums';
import type { gameStatsObjectID } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { mp } from '../../../mp';
import { GStatusEffectsService } from '../status-effects/status-effects.service';

@injectable()
export class GHealthService {
  private readonly GOD_STATUS_EFFECT = 'BaseStatusEffect.Invulnerable';

  constructor(
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
  ) {}

  god(enabled: boolean) {
    if (enabled) {
      this.statusEffects.add(this.GOD_STATUS_EFFECT);
    } else {
      this.statusEffects.remove(this.GOD_STATUS_EFFECT);
    }
  }

  isGod() {
    return this.statusEffects.has(this.GOD_STATUS_EFFECT);
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
}
