import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import { SpawnService } from './spawn.service';

@eager()
@injectable()
export class SpawnCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(SpawnService) private spawnService: SpawnService,
  ) {}

  private spawn() {
    this.spawnService.spawn({
      position: this.spawnService.getSpawnPosition(),
    });
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'spawn',
      description: 'Spawns you... duh',
      flags: ChatCommandFlag.DisableInGameMode,
      handler: this.spawn.bind(this),
    });

    // @ts-expect-error
    mp.commands.add('player-spawn', () => {
      const player = mp.game.GetPlayer();
      const position = player.GetWorldPosition();

      mp.local.spawnPlayer(position.x, position.y, position.z, 0);
    });
  }
}
