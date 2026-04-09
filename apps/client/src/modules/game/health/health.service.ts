import * as CyberEnums from '@cybermp/client-types/enums';
import type { gameStatsObjectID } from '@cybermp/client-types/game';
import { injectable } from 'inversify';
import { mp } from '../../../mp';

@injectable()
export class GHealthService {
  private readonly DEFAULT_HEALTH = 300;
  private godMode = false;

  getDefaultHealth() {
    return this.DEFAULT_HEALTH;
  }

  god(value: boolean) {
    if (value) {
      this.set(99999999);
    } else {
      this.set(this.DEFAULT_HEALTH);
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
