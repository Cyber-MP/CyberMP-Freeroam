import {
  EGameplayRole,
  gamedataMappinVariant,
} from '@cybermp/client-types/enums';
import type {
  gamemappinsMappinSystem,
  gameNewMappinID,
  NPCPuppet,
  Vector4,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { mp } from '../../mp';
import { GEntityService } from '../game/entity.service';

@eager()
@injectable()
export class PlayersMarkersService {
  private mappins: Map<number, gameNewMappinID> = new Map();
  private tickId!: number;

  private system!: gamemappinsMappinSystem;

  constructor(@inject(GEntityService) private entityService: GEntityService) {}

  private onTick() {
    const stream = mp.getStreamedPlayers();

    const activeThisFrame = new Set<number>();

    for (const gameId of stream) {
      if (!gameId) {
        continue;
      }

      const entity = this.entityService.findById<NPCPuppet>(gameId);
      if (!entity) {
        continue;
      }

      const position = entity.GetWorldPosition();

      activeThisFrame.add(gameId);

      if (!this.mappins.has(gameId)) {
        this.createMappin(gameId, position);
      }

      this.updateMappin(gameId, position);
    }

    for (const playerId of this.mappins.keys()) {
      if (!activeThisFrame.has(playerId)) {
        this.destroyMappin(playerId);
      }
    }
  }

  private createMappin(playerId: number, position: Vector4) {
    const roleMappinData = new mp.game.GameplayRoleMappinData();
    roleMappinData.isQuest = true;
    roleMappinData.visibleThroughWalls = false;
    roleMappinData.range = 50.0;
    roleMappinData.gameplayRole = EGameplayRole.NPC;
    roleMappinData.textureID = 'MappinIcons.NPCMappin';
    roleMappinData.showOnMiniMap = true;

    const data = new mp.game.gamemappinsMappinData();
    data.mappinType = 'Mappins.DelamainTaxiDestinationMappinDefinition';
    data.variant = gamedataMappinVariant.DefaultQuestVariant;
    data.visibleThroughWalls = false;
    data.scriptData = roleMappinData;
    data.active = true;

    const mappinId = this.system.RegisterMappin(data, position);
    this.mappins.set(playerId, mappinId);
  }

  private updateMappin(playerId: number, position: Vector4) {
    const mappinId = this.mappins.get(playerId);
    if (!mappinId) {
      return;
    }

    this.system.SetMappinPosition(mappinId, position);
  }

  private destroyMappin(playerId: number) {
    const mappinId = this.mappins.get(playerId);
    if (!mappinId) {
      console.log('mappin id not found');
      return;
    }

    this.system.UnregisterMappin(mappinId);

    this.mappins.delete(playerId);

    console.log('destroyed mapping');
  }

  @preDestroy()
  private destroy() {
    mp.clearTick(this.tickId);

    for (const key of this.mappins.keys()) {
      this.destroyMappin(key);
    }

    this.mappins.clear();
  }

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(() => {
      this.system = mp.game.ScriptGameInstance.GetMappinSystem();
      this.tickId = mp.setTick(this.onTick.bind(this));
    });

    // mp.game.onInit(() => {
    //   const hideWorldMappin = (self: QuestMappinController) => {
    //     if (this.visibleInWorld) {
    //       return;
    //     }

    //     const mappinId = self.GetMappin().GetNewMappinID();
    //     const candidate = [...this.mappins.values()].find(
    //       (o) => o.value === mappinId?.value,
    //     );
    //     if (!candidate) {
    //       return;
    //     }

    //     if (!self.GetRootWidget().IsVisible()) {
    //       return;
    //     }

    //     self.SetRootVisible(false);
    //   };

    //   mp.game.observe('QuestMappinController', 'OnInitialize', hideWorldMappin);
    //   mp.game.observe('QuestMappinController', 'OnIntro', hideWorldMappin);
    //   mp.game.observe('QuestMappinController', 'OnUpdate', hideWorldMappin);
    // });
  }
}
