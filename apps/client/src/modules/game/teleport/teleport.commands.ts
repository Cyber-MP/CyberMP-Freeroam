import { gamedataMappinVariant } from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../../mp';
import { ChatCommandFlag, ChatService } from '../../chat/chat.service';
import { GTeleportService } from './teleport.service';

@eager()
@injectable()
export class GTeleportCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GTeleportService) private teleportService: GTeleportService,
  ) {}

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'tp',
      flags: ChatCommandFlag.DisableInGameMode,
      args: z.tuple([
        z.coerce.number().meta({ title: 'x' }),
        z.coerce.number().meta({ title: 'y' }),
        z.coerce.number().meta({ title: 'z' }),
      ]),
      handler: (x, y, z) => {
        this.teleportService.teleport(x, y, z);
      },
    });

    this.chatService.addCommand({
      name: 'tp-marker',
      flags: ChatCommandFlag.DisableInGameMode,
      handler: () => {
        const mappingSystem = mp.game.ScriptGameInstance.GetMappinSystem();
        // @ts-expect-error
        const arr = mappingSystem.GetAllMappins() as gamemappinsIMappin[];

        const marker = arr.find(
          (o) => o.GetVariant() === gamedataMappinVariant.CustomPositionVariant,
        );
        if (!marker) {
          this.chatService.sendMessage('Marker not found');
          return;
        }

        const { x, y, z } = marker.GetWorldPosition();

        this.teleportService.teleport(x, y, z);
      },
    });
  }
}
