import type { ServerVector3 } from '@cybermp/client-types';
import {
  EGameplayRole,
  gamedataMappinVariant,
} from '@cybermp/client-types/enums';
import type { NewMappinID } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { createVector4 } from '../../../../lib/vectors';
import { mp } from '../../../../mp';
import { browser } from '../../../../rpc/browser';
import { GEntityService } from '../../../game/entity.service';
import { GHealthService } from '../../../game/health/health.service';
import { GStatusEffectsService } from '../../../game/status-effects/status-effects.service';
import { GVehiclesService } from '../../../game/vehicles/vehicles.service';
import { BaseGameMode } from '../../game-mode';
import type { BountyHunterVictimData } from './dto';

@injectable()
export class BountyHunter extends BaseGameMode<'bounty_hunter'> {
  private VICTIM_HEALTH = 1200;

  private remoteVictimPosition: ServerVector3 | null = null;
  private victimMappin: NewMappinID | null = null;
  private victimData: BountyHunterVictimData | null = null;

  private tickId: number | null = null;

  constructor(
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(GVehiclesService)
    private vehiclesService: GVehiclesService,
    @inject(GEntityService)
    private entityService: GEntityService,
  ) {
    super();
  }

  private updateVictimMappinTick = () => {
    if (!this.victimData || !this.victimMappin) {
      return;
    }

    const mappinSystem = mp.game.ScriptGameInstance.GetMappinSystem();

    const victimEntityId = mp.getPlayerGameIdByNetworkId(this.victimData.id);
    if (!victimEntityId && this.remoteVictimPosition) {
      mappinSystem.SetMappinPosition(
        this.victimMappin,
        createVector4(...this.remoteVictimPosition),
      );
    }

    const victimEntity = this.entityService.findById(victimEntityId);

    if (victimEntity) {
      const victimPosition = victimEntity.GetWorldPosition();

      mappinSystem.SetMappinPosition(this.victimMappin, victimPosition);
    }
  };

  updateVictimData(data: BountyHunterVictimData) {
    const localPlayerId = mp.getPlayerServerId(1);

    this.victimData = data;

    if (localPlayerId !== data.id) {
      this.onHunter(data);
    } else {
      this.onVictim(data);
    }
  }

  private onHunter(data: BountyHunterVictimData) {
    browser.gameModes.bountyHunter.setData.trigger({
      endTimestamp: data.endTimestamp,
      hint: `KILL ${data.nickname} TO WIN`,
    });

    const system = mp.game.ScriptGameInstance.GetMappinSystem();

    const roleMappinData = new mp.game.GameplayRoleMappinData();
    roleMappinData.isQuest = true;
    roleMappinData.visibleThroughWalls = false;
    roleMappinData.range = 50.0;
    roleMappinData.gameplayRole = EGameplayRole.NPC;
    roleMappinData.textureID = 'MappinIcons.NPCMappin';
    roleMappinData.showOnMiniMap = true;

    const mappinData = new mp.game.gamemappinsMappinData();
    mappinData.mappinType = 'Mappins.DelamainTaxiDestinationMappinDefinition';
    mappinData.variant = gamedataMappinVariant.DefaultQuestVariant;
    mappinData.visibleThroughWalls = false;
    mappinData.scriptData = roleMappinData;
    mappinData.active = true;

    this.victimMappin = system.RegisterMappin(
      mappinData,
      createVector4(...data.position),
    );
    system.TrackMappin(this.victimMappin);

    this.tickId = mp.setTick(this.updateVictimMappinTick);
  }

  private onVictim(data: BountyHunterVictimData) {
    this.healthService.set(this.VICTIM_HEALTH);
    this.statusEffectsService.add('GameplayRestriction.NoCombat');
    this.statusEffectsService.add('GameplayRestriction.NoWeapons');
    this.statusEffectsService.add('GameplayRestriction.NoHealing');

    this.vehiclesService.requestSitInVehicle(data.vehicleId);

    browser.gameModes.bountyHunter.setData.trigger({
      endTimestamp: data.endTimestamp,
      hint: 'LIVE AS LONG AS YOU CAN TO WIN',
    });
  }

  updateVictimPosition(position: ServerVector3) {
    this.remoteVictimPosition = position;
  }

  start() {
    browser.hud.setGlobalPath.trigger('/hud/game-modes/bounty-hunter/');
    browser.navigate.trigger('/hud/game-modes/bounty-hunter/');
  }

  end() {
    if (this.tickId) {
      mp.clearTick(this.tickId);
      this.tickId = null;
    }

    if (this.victimMappin) {
      const system = mp.game.ScriptGameInstance.GetMappinSystem();
      system.UnregisterMappin(this.victimMappin);
    }

    browser.hud.setGlobalPath.trigger('/hud');
    browser.navigate.trigger('/hud');

    this.statusEffectsService.remove('GameplayRestriction.NoCombat');
    this.statusEffectsService.remove('GameplayRestriction.NoWeapons');
    this.statusEffectsService.remove('GameplayRestriction.NoHealing');
  }
}
