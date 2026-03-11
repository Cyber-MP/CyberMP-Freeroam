import * as CyberEnums from '@cybermp/client-types/enums';

export class HealthController {
  setHealth(value: number) {
    const player = mpClient.game.GetPlayer();
    const playerGameId = player.GetEntityID() as unknown as gameStatsObjectID;

    const statePoolSystem = mpClient.game.ScriptGameInstance.GetStatPoolsSystem();

    statePoolSystem.RequestSettingStatPoolValueIgnoreChangeMode(
      playerGameId,
      CyberEnums.gamedataStatPoolType.Health,
      value,
      new mpClient.game.gameObject(),
      false,
    );
  }

  setMaxHealth(value: number) {
    const player = mpClient.game.GetPlayer();
    const playerGameId = player.GetEntityID() as unknown as gameStatsObjectID;

    mpClient.game.ScriptGameInstance.GetStatsSystem().RemoveAllModifiers(
      playerGameId,
      CyberEnums.gamedataStatType.Health,
      true,
    );

    const newStats = new mpClient.game.gameConstantStatModifierData_Deprecated();
    newStats.statType = CyberEnums.gamedataStatType.Health;
    newStats.modifierType = CyberEnums.gameStatModifierType.Additive;
    newStats.value = value;

    mpClient.game.ScriptGameInstance.GetStatsSystem().AddModifier(
      playerGameId,
      newStats,
    );

    const statePoolSystem = mpClient.game.ScriptGameInstance.GetStatPoolsSystem();

    statePoolSystem.RequestSettingStatPoolValueIgnoreChangeMode(
      playerGameId,
      CyberEnums.gamedataStatPoolType.Health,
      value,
      new mpClient.game.gameObject(),
      true,
    );
  }

  getHealth() {
    const player = mpClient.game.GetPlayer();
    const playerGameId = player.GetEntityID() as unknown as gameStatsObjectID;

    return mpClient.game.ScriptGameInstance.GetStatPoolsSystem().GetStatPoolValue(
      playerGameId,
      CyberEnums.gamedataStatPoolType.Health,
      false,
    );
  }
}
