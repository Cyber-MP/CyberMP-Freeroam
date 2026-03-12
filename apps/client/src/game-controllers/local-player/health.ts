import { mp } from '@client/mp';
import * as CyberEnums from '@cybermp/client-types/enums';
import type { gameStatsObjectID } from '@cybermp/client-types/game';

export class HealthController {
  setHealth(value: number) {
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

  setMaxHealth(value: number) {
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

  getHealth() {
    const player = mp.game.GetPlayer();
    const playerGameId = player.GetEntityID() as unknown as gameStatsObjectID;

    return mp.game.ScriptGameInstance.GetStatPoolsSystem().GetStatPoolValue(
      playerGameId,
      CyberEnums.gamedataStatPoolType.Health,
      false,
    );
  }
}
