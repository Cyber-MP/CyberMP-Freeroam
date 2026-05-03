import { eager } from '@freeroam/inversify';
import { PvpMapName } from '@freeroam/shared/game-modes/pvp';
import { RaceMapName } from '@freeroam/shared/game-modes/race';
import { SumoMapName } from '@freeroam/shared/game-modes/sumo';
import { inject, injectable, postConstruct } from 'inversify';
import { draw } from 'radash';
import z from 'zod';
import { mp } from '../../mp';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import { PvpWeapons } from '../game-modes/modes/pvp/data';
import { VEHICLES_DATA } from '../vehicles-spawner/vehicles.repository';
import { MatchmakingService } from './matchmaking.service';

@eager()
@injectable()
export class MatchmakingCommands {
  @inject(ChatService)
  private chatService!: ChatService;

  @inject(MatchmakingService)
  private matchmakingService!: MatchmakingService;

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'admin-global-match',
      flags: ChatCommandFlag.Admin | ChatCommandFlag.DisableInGameMode,
      args: z.tuple([z.enum(['race', 'sumo', 'pvp'])]),
      handler: async (player, modeName) => {
        const createOptionsMap = {
          race: {
            map: RaceMapName.FREEWAY,
            vehicleClass: 'all',
            maxPlayers: 20,
            laps: 1,
            forceFPP: false,
            nitro: false,
            combat: false,
          },
          sumo: {
            map: SumoMapName.GUZL,
            vehicleClass: 'all',
            maxPlayers: 10,
            forceFPP: false,
            nitro: false,
          },
          pvp: {
            map: PvpMapName.DE_DUST2,
            maxPlayers: 20,
            healing: false,
            freeWeapons: false,
          },
        };

        const joinOptionsMap = {
          race: {
            vehicle: draw(VEHICLES_DATA.map((o) => o.name))!,
          },
          sumo: {
            vehicle: draw(VEHICLES_DATA.map((o) => o.name))!,
          },
          pvp: {
            weapon: draw(Object.values(PvpWeapons))!,
          },
        };

        const joinOptions = joinOptionsMap[modeName];
        const createOptions = createOptionsMap[modeName];

        console.log(createOptions);

        const createdMatch = this.matchmakingService.createMatch(player.id, {
          name: modeName,
          createOptions,
          joinOptions,
        } as any);

        for (const player of mp.players.toArray()) {
          if (this.matchmakingService.isOnActiveMatch(player)) {
            continue;
          }

          await this.matchmakingService.joinMatch(player.id, {
            id: createdMatch.id,
            options: joinOptions,
          });
        }

        createdMatch.start();

        console.log('started match');
      },
    });
  }
}
