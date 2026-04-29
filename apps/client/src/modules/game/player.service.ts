import {
  type EPlayerGender,
  gamedataDevelopmentPointType,
  gamedataNewPerkType,
  gamedataProficiencyType,
  gamedataStatType,
} from '@cybermp/client-types/enums';
import { inject, injectable, postConstruct } from 'inversify';
import { sleep } from 'radash';
import { mp } from '../../mp';
import { SpawnService } from '../spawn/spawn.service';
import { GHealthService } from './health/health.service';
import { GMenusService } from './menus.service';
import { GStatusEffectsService } from './status-effects/status-effects.service';

@injectable()
export class GPlayerService {
  private freezeTickId: number | null = null;

  private readonly FREEZE_FLAGS = [
    'GameplayRestriction.NoMovement',
    'GameplayRestriction.NoCombat',
    'GameplayRestriction.NoWeapons',
  ] as const;

  private turnedOffComponents = new Set<string>();

  constructor(
    @inject(GHealthService) private readonly healthService: GHealthService,
    @inject(GMenusService) private readonly menusService: GMenusService,
    @inject(GStatusEffectsService)
    private readonly statusEffects: GStatusEffectsService,
    @inject(SpawnService)
    private readonly spawnService: SpawnService,
  ) {}

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(() => {
      mp.game.observe(
        'gameuiICharacterCustomizationSystem',
        'OnPlayerGenderChanged',
        () => {
          this.spawnService.spawn({
            position: mp.game.GetPlayer().GetWorldPosition(),
          });
        },
      );
    });
  }

  changeGender(gender: EPlayerGender) {
    mp.game.ScriptGameInstance.GetCharacterCustomizationSystem().SetPlayerGender(
      gender,
      true,
    );
  }

  async levelUp() {
    const player = mp.game.GetPlayerObject();
    const uiSystem = mp.game.ScriptGameInstance.GetUISystem();
    const devSystem =
      mp.game.ScriptGameInstance.GetScriptableSystemsContainer().Get(
        'PlayerDevelopmentSystem',
      );

    const arrData = [
      gamedataStatType.Strength,
      gamedataStatType.Reflexes,
      gamedataStatType.TechnicalAbility,
      gamedataStatType.Cool,
      gamedataStatType.Intelligence,
      gamedataStatType.Espionage,
    ];

    const closeHub = new mp.game.ForceCloseHubMenuEvent();
    const startHub = new mp.game.StartHubMenuEvent();
    const userData = new mp.game.PerkUserData();

    const globalMenuScenario = this.menusService.globalMenuScenario;

    userData.statType = gamedataStatType.Reflexes;

    startHub.SetStartMenu('new_perks', 'ico_character', userData);

    uiSystem.QueueEvent(startHub);

    await sleep(50);

    for (const skill of arrData) {
      const attrReq = new mp.game.SetAttribute();

      attrReq.Set(player, 20, skill);

      devSystem.QueueRequest(attrReq);
    }

    const devPointsReq = new mp.game.questAddDevelopmentPointsRequest();

    devPointsReq.Set(player, 2000, gamedataDevelopmentPointType.Primary);

    devSystem.QueueRequest(devPointsReq);

    await sleep(100);

    if (!globalMenuScenario) {
      throw new Error('Global menu scenario not applied');
    }

    for (const skill of arrData) {
      userData.statType = skill;
      globalMenuScenario.SwitchMenu('new_perks', userData);

      await sleep(150);

      for (let j = 0; j < 5; j++) {
        for (let i = 0; i < gamedataNewPerkType.Count; i++) {
          const buyPerkRequest = new mp.game.BuyNewPerk();

          buyPerkRequest.Set(player, i);

          devSystem.QueueRequest(buyPerkRequest);
        }
      }
    }

    await sleep(100);

    uiSystem.QueueEvent(closeHub);

    const addExpRequest = new mp.game.AddExperience();
    addExpRequest.Set(player, 150000, gamedataProficiencyType.Level, false);

    mp.game.ScriptGameInstance.QueueScriptableSystemRequest(
      'PlayerDevelopmentSystem',
      addExpRequest,
    );
  }

  invisible(value: boolean) {
    const components = mp.game.GetPlayer().GetComponents();

    if (value) {
      for (const component of components) {
        if (!component.IsEnabled()) {
          continue;
        }

        this.turnedOffComponents.add(component.GetName());
        component.Toggle(false);
      }
    } else {
      const disabledComponents = components.filter((o) =>
        this.turnedOffComponents.has(o.GetName()),
      );

      for (const component of disabledComponents) {
        component.Toggle(true);
      }
    }
  }

  private async freezeTick() {
    const player = mp.game.GetPlayerObject();

    const pos = player.GetWorldPosition();

    for (const flag of this.FREEZE_FLAGS) {
      this.statusEffects.add(flag);
    }

    this.healthService.god(true);

    await sleep(100);

    const curPos = player.GetWorldPosition();

    mp.game.ScriptGameInstance.GetTeleportationFacility().Teleport(
      player,
      {
        ...curPos,
        z: pos.z + Math.abs(player.GetWorldPosition().z - pos.z),
      },
      mp.game.Quaternion.ToEulerAngles(player.GetWorldOrientation()),
    );
  }

  freeze(value: boolean) {
    if (value) {
      this.freezeTickId = mp.setTick(this.freezeTick.bind(this));
      return;
    }

    if (this.freezeTickId) {
      mp.clearTick(this.freezeTickId);
    }

    this.freezeTickId = null;

    for (const flag of this.FREEZE_FLAGS) {
      this.statusEffects.remove(flag);
    }

    this.healthService.god(false);
  }
}
